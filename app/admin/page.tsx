'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Product } from '@/lib/types';

const sidebarItems = [
    { label: 'Dashboard', icon: 'grid', active: true },
    { label: 'Catalog', icon: 'box', active: false },
    { label: 'Orders', icon: 'clipboard', active: false },
    { label: 'Resellers', icon: 'users', active: false },
];

const reportItems = [
    { label: 'Insights', icon: 'chart', active: false },
];

const PRODUCT_CATEGORIES = ['Kitchen', 'Laundry', 'Home & Bath', 'Organization'];

function SidebarIcon({ type }: { type: string }) {
    switch (type) {
        case 'grid':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>
                </svg>
            );
        case 'box':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
            );
        case 'clipboard':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
            );
        case 'users':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            );
        case 'chart':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            );
        default:
            return null;
    }
}

/** Parse Meesho product HTML in the browser using DOMParser — no server needed */
function extractMeeshoProduct(html: string, sourceUrl: string): { url: string; title: string; price: number; images: string[] } | null {
    if (!html || html.includes('Access Denied') || html.length < 5000) return null;

    const doc = new DOMParser().parseFromString(html, 'text/html');

    // ── Title: __NEXT_DATA__ → JSON-LD → og:title → h1 ───────────────────
    let title = '';
    let price = 0;
    let images: string[] = [];
    let description = '';

    // Try __NEXT_DATA__ first (most complete)
    const nextScript = doc.querySelector('script#__NEXT_DATA__');
    if (nextScript?.textContent) {
        try {
            const nd = JSON.parse(nextScript.textContent);
            const pp = nd?.props?.pageProps;
            const pd = pp?.product || pp?.productData || pp?.data?.product || pp?.catalogData?.product;
            if (pd) {
                title = pd.name || pd.title || '';
                price = parseInt(String(pd.mrp || pd.price || pd.cost || 0), 10);
                description = pd.description || pd.details || '';
                images = (pd.images || []).map((img: { url?: string; src?: string } | string) =>
                    typeof img === 'string' ? img : img.url || img.src || ''
                );
            }
        } catch { /* skip */ }
    }

    // JSON-LD fallback
    if (!title || !price) {
        doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
            if (title && price) return;
            try {
                const ld = JSON.parse(s.textContent || '');
                if (ld?.name && (ld?.offers?.price || ld?.price)) {
                    title = ld.name;
                    price = parseInt(String(ld.offers?.price || ld.price), 10);
                    description = ld.description || '';
                    const ldImg = ld.image;
                    if (ldImg) images = Array.isArray(ldImg) ? ldImg : [ldImg];
                }
            } catch { /* skip */ }
        });
    }

    // og:title + ₹ price fallback
    if (!title) {
        title = (doc.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content
            ?.replace(/\s*[-|–]\s*meesho.*/i, '').trim() || '';
    }
    if (!price) {
        const bodyText = doc.body?.innerText || html;
        const m = bodyText.match(/₹\s*([0-9,]+)/);
        if (m) price = parseInt(m[1].replace(/,/g, ''), 10);
    }

    // Images from CDN img tags
    if (images.length === 0) {
        doc.querySelectorAll<HTMLImageElement>('img[src*="images.meesho.com/images/products"]').forEach(img => {
            if (!img.src.includes('profile')) images.push(img.src);
        });
    }
    // Also scrape CDN URLs from raw HTML text
    const cdnMatches = [...html.matchAll(/images\.meesho\.com\/images\/products\/[^"'\s\\]+/g)];
    cdnMatches.forEach(m => { if (!m[0].includes('profile')) images.push(`https://${m[0]}`); });

    // Upgrade to 1024px and deduplicate
    images = Array.from(new Set(
        images.map(u => (u.startsWith('http') ? u : `https://${u}`)
            .replace(/_([\d]+)\.(jpg|jpeg|webp|png)(\?.*)?$/i, '_1024.$2$3'))
    )).slice(0, 6);

    if (!title || !price) return null;
    return { url: sourceUrl, title, price, images };
}

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [stagedProducts, setStagedProducts] = useState<Product[]>([]);
    const [publishedCount, setPublishedCount] = useState(0);
    const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', category: '', price: 0, sellingPrice: 0, inStock: true });
    const [editImages, setEditImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [publishSuccess, setPublishSuccess] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);

    // Load staged products from API on mount
    useEffect(() => {
        const loadStaged = async () => {
            try {
                const res = await fetch('/api/products?status=staged');
                if (res.ok) {
                    const data = await res.json();
                    setStagedProducts(data);
                }
            } catch (err) {
                console.error('Failed to load staged products:', err);
            }
        };
        const loadPublished = async () => {
            try {
                const res = await fetch('/api/products?status=published');
                if (res.ok) {
                    const data: Product[] = await res.json();
                    setPublishedCount(data.length);
                    const cats: Record<string, number> = {};
                    for (const p of data) {
                        cats[p.category] = (cats[p.category] || 0) + 1;
                    }
                    setCategoryBreakdown(cats);
                }
            } catch (err) {
                console.error('Failed to load published products:', err);
            }
        };
        loadStaged();
        loadPublished();
    }, []);

    const handleDelete = async (productId: string) => {
        try {
            const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
            if (res.ok) {
                setStagedProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleDiscardAll = async () => {
        try {
            await Promise.all(stagedProducts.map(p => fetch(`/api/products?id=${p.id}`, { method: 'DELETE' })));
            setStagedProducts([]);
        } catch (err) {
            console.error('Discard all failed:', err);
        }
    };

    const handlePublishAll = async () => {
        if (stagedProducts.length === 0) return;
        setIsLoading(true);
        try {
            await Promise.all(
                stagedProducts.map(p =>
                    fetch('/api/products', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: p.id, status: 'published' }),
                    })
                )
            );
            setPublishedCount(prev => prev + stagedProducts.length);
            setStagedProducts([]);
            setPublishSuccess(true);
            setTimeout(() => setPublishSuccess(false), 4000);
        } catch (err) {
            console.error('Publish failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setEditImages(product.images || []);
        setNewImageUrl('');
        setEditForm({
            title: product.title,
            description: product.description,
            category: product.category,
            price: product.price,
            sellingPrice: product.sellingPrice,
            inStock: product.inStock !== false,
        });
    };

    const handleEditSave = async () => {
        if (!editingProduct) return;
        try {
            const res = await fetch('/api/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingProduct.id, ...editForm, images: editImages }),
            });
            if (res.ok) {
                const updated = await res.json();
                setStagedProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                setEditingProduct(null);
            }
        } catch (err) {
            console.error('Edit save failed:', err);
        }
    };

    const handleImport = async () => {
        if (!importUrl.trim()) return;
        setImportLoading(true);
        setImportError(null);
        setImportSuccess(false);

        const url = importUrl.trim();

        // ── Approach 1: Browser-side fetch via CF Worker ──────────────────────
        // Browser IP is never blocked; CF Worker adds CORS headers so browser can read HTML.
        const cfProxyUrl = process.env.NEXT_PUBLIC_CF_PROXY_URL;
        const cfSecret   = process.env.NEXT_PUBLIC_CF_PROXY_SECRET;

        if (cfProxyUrl && cfSecret) {
            try {
                const proxyRes = await fetch(cfProxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfSecret}` },
                    body: JSON.stringify({ url }),
                });

                if (proxyRes.ok) {
                    const html = await proxyRes.text();
                    const product = extractMeeshoProduct(html, url);
                    if (product) {
                        const saveRes = await fetch('/api/admin/scrape-meesho', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(product),
                        });
                        const saved = await saveRes.json();
                        if (saveRes.ok && saved.success) {
                            setStagedProducts(prev => [...prev, saved.product]);
                            setImportUrl('');
                            setImportSuccess(true);
                            setTimeout(() => setImportSuccess(false), 4000);
                            setImportLoading(false);
                            return;
                        }
                    }
                }
            } catch { /* fall through to server-side */ }
        }

        // ── Approach 2: Server-side fetch (may be blocked on Vercel) ─────────
        try {
            const res = await fetch('/api/admin/fetch-meesho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStagedProducts(prev => [...prev, data.product]);
                setImportUrl('');
                setImportSuccess(true);
                setTimeout(() => setImportSuccess(false), 4000);
            } else {
                setImportError(data.error || 'Failed to import product');
            }
        } catch {
            setImportError('Network error. Please try again.');
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundColor: 'var(--white)', borderRight: '1px solid var(--gray-200)' }}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 px-6 py-5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Veedu.</span>
                    </div>

                    <div className="px-4 mt-4">
                        <p className="px-3 text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--gray-400)' }}>Management</p>
                        <nav className="space-y-1">
                            {sidebarItems.map(item => (
                                <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ backgroundColor: item.active ? 'var(--green)' : 'transparent', color: item.active ? 'white' : 'var(--gray-600)' }}>
                                    <SidebarIcon type={item.icon} />{item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="px-4 mt-8">
                        <p className="px-3 text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--gray-400)' }}>Reports</p>
                        <nav className="space-y-1">
                            {reportItems.map(item => (
                                <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ color: 'var(--gray-600)' }}>
                                    <SidebarIcon type={item.icon} />{item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto px-4 pb-6">
                        <div className="mb-4 px-4 py-3 rounded-xl" style={{ backgroundColor: '#FFF8F3', border: '1px solid #FFE8D6' }}>
                            <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Kerala Delivery</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>Delivering across all Kerala districts.</p>
                        </div>
                        <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--gray-200)' }}>
                            <button onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-2xl transition-all hover:bg-[var(--gray-100)]"
                                style={{ color: 'var(--gray-500)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4"
                    style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Catalog Manager</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Admin User</p>
                                <p className="text-xs" style={{ color: 'var(--gray-400)' }}>STORE MANAGER</p>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>A</div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 lg:p-10" style={{ backgroundColor: '#FAF8F5' }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                            <div>
                                <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>Catalog Manager</h2>
                                <p className="text-base font-medium" style={{ color: 'var(--gray-500)' }}>Import items securely bypassing bot protection.</p>
                            </div>

                            <div className="flex-1 w-full sm:max-w-lg bg-white p-4 rounded-3xl shadow-[var(--shadow-sm)] border">
                                <p className="text-xs font-bold mb-3" style={{ color: 'var(--gray-500)' }}>
                                    📦 Import from Meesho
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="https://meesho.com/product/..."
                                        value={importUrl}
                                        onChange={e => { setImportUrl(e.target.value); setImportError(null); }}
                                        onKeyDown={e => e.key === 'Enter' && handleImport()}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                                        style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                        disabled={importLoading}
                                    />
                                    <button
                                        onClick={handleImport}
                                        disabled={importLoading || !importUrl.trim()}
                                        className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: 'var(--green)' }}
                                    >
                                        {importLoading ? '⏳' : 'Import'}
                                    </button>
                                </div>
                                {importLoading && (
                                    <p className="text-xs mt-2" style={{ color: 'var(--gray-400)' }}>Fetching product details…</p>
                                )}
                                {importSuccess && (
                                    <p className="text-xs mt-2 font-medium" style={{ color: 'var(--green)' }}>✓ Product added to staged items!</p>
                                )}
                                {importError && (
                                    <p className="text-xs mt-2 font-medium" style={{ color: '#e53e3e' }}>{importError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--gray-400)' }}>Published</p>
                            <p className="text-3xl font-extrabold" style={{ color: 'var(--green)' }}>{publishedCount}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--gray-400)' }}>Staged</p>
                            <p className="text-3xl font-extrabold" style={{ color: 'var(--accent)' }}>{stagedProducts.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm sm:col-span-2" style={{ border: '1px solid var(--gray-200)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gray-400)' }}>Categories</p>
                            {Object.keys(categoryBreakdown).length === 0 ? (
                                <p className="text-sm" style={{ color: 'var(--gray-400)' }}>No published products yet</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(categoryBreakdown).map(([cat, count]) => (
                                        <span key={cat} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F0FDF4', color: 'var(--green)' }}>
                                            {cat} <span style={{ color: 'var(--gray-400)' }}>({count})</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {publishSuccess && (
                        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--green)', color: 'white' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-sm font-semibold">Catalog published successfully!</span>
                        </div>
                    )}

                    {/* Staged Items */}
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                                Staged Items
                                {stagedProducts.length > 0 && (
                                    <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-500)' }}>
                                        {stagedProducts.length}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Review and edit details before publishing to the live store.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={handleDiscardAll} disabled={stagedProducts.length === 0}
                                className="text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-70 disabled:opacity-30"
                                style={{ color: 'var(--gray-500)' }}>
                                Discard All
                            </button>
                            <button onClick={handlePublishAll} disabled={isLoading || stagedProducts.length === 0}
                                className="text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: 'var(--accent)', backgroundColor: '#FFF0E6' }}>
                                {isLoading ? 'Publishing...' : 'Publish Catalog'}
                            </button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                        {stagedProducts.map((product) => (
                            <div key={product.id} className="group relative transition-all duration-500 hover:-translate-y-1">
                                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 transition-transform duration-500 group-hover:shadow-[var(--shadow-lg)]" style={{ backgroundColor: '#F3F4F3' }}>
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                    <button onClick={() => handleDelete(product.id)}
                                        className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                        style={{ backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-600)' }}>
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div className="px-1">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="text-base font-bold line-clamp-1" style={{ color: 'var(--foreground)' }}>{product.title}</h4>
                                        <span className="text-lg font-extrabold whitespace-nowrap" style={{ color: 'var(--foreground)' }}>₹{product.sellingPrice}</span>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--green)' }}>{product.category}</p>
                                    <p className="text-sm line-clamp-2 mb-5" style={{ color: 'var(--gray-500)' }}>{product.description}</p>

                                    <div className="flex gap-3">
                                        <button onClick={() => openEdit(product)}
                                            className="flex-1 text-xs font-bold py-3 rounded-full uppercase tracking-widest transition-opacity hover:opacity-70"
                                            style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}>
                                            Edit Details
                                        </button>
                                        <Link href="/" className="flex-1 flex items-center justify-center text-xs font-bold py-3 rounded-full uppercase tracking-widest text-center text-white transition-all hover:scale-105 hover:shadow-[var(--shadow-md)]"
                                            style={{ backgroundColor: 'var(--accent)' }}>
                                            Live View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {stagedProducts.length === 0 && !isLoading && (
                        <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--white)', border: '1px dashed var(--gray-300)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            <p className="text-lg font-medium mb-1" style={{ color: 'var(--gray-400)' }}>No staged items</p>
                            <p className="text-sm" style={{ color: 'var(--gray-400)' }}>
                                {publishSuccess ? 'All items have been published to the store.' : 'Paste a Meesho product URL above and click Import.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setEditingProduct(null)}>
                    <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 animate-fade-in" style={{ backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Edit Product</h3>
                            <button onClick={() => setEditingProduct(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ backgroundColor: 'var(--gray-100)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                            {/* Images */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gray-500)' }}>Images</label>
                                {editImages.length > 0 ? (
                                    <div className="flex gap-2 flex-wrap mb-2">
                                        {editImages.map((img, i) => (
                                            <div key={i} className="relative group w-20 h-20 rounded-2xl overflow-hidden" style={{ backgroundColor: '#F3F4F3' }}>
                                                <img src={img} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setEditImages(imgs => imgs.filter((_, idx) => idx !== i))}
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                                {i === 0 && (
                                                    <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1 rounded" style={{ backgroundColor: 'var(--green)', color: 'white' }}>Main</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs mb-2" style={{ color: 'var(--gray-400)' }}>No images. Paste a URL below to add one.</p>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="Paste image URL…"
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && newImageUrl.trim()) {
                                                setEditImages(imgs => [...imgs, newImageUrl.trim()]);
                                                setNewImageUrl('');
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 rounded-xl text-xs outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                    />
                                    <button
                                        onClick={() => { if (newImageUrl.trim()) { setEditImages(imgs => [...imgs, newImageUrl.trim()]); setNewImageUrl(''); } }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                                        style={{ backgroundColor: 'var(--green)' }}
                                    >Add</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-500)' }}>Title</label>
                                <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-500)' }}>Description</label>
                                <textarea rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-500)' }}>Category</label>
                                    <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', backgroundColor: 'var(--white)' }}>
                                        {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-500)' }}>Selling Price (₹)</label>
                                    <input type="number" value={editForm.sellingPrice} onChange={e => setEditForm(f => ({ ...f, sellingPrice: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }} />
                                </div>
                            </div>

                            {/* In Stock Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: 'var(--gray-100)' }}>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>In Stock</p>
                                    <p className="text-xs" style={{ color: 'var(--gray-400)' }}>Toggle to show/hide buy button</p>
                                </div>
                                <button
                                    onClick={() => setEditForm(f => ({ ...f, inStock: !f.inStock }))}
                                    className="relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200"
                                    style={{ backgroundColor: editForm.inStock ? 'var(--green)' : 'var(--gray-300)' }}
                                >
                                    <span className="inline-block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                                        style={{ transform: editForm.inStock ? 'translateX(26px)' : 'translateX(2px)' }} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setEditingProduct(null)}
                                className="flex-1 py-3 rounded-full text-sm font-semibold" style={{ border: '1px solid var(--gray-200)', color: 'var(--gray-600)' }}>
                                Cancel
                            </button>
                            <button onClick={handleEditSave}
                                className="flex-1 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.02]"
                                style={{ backgroundColor: 'var(--accent)' }}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}