'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Product, Order, Review, CartItem } from '@/lib/types';

const sidebarItems: { label: string; icon: string; view?: 'dashboard' | 'catalog' | 'orders' | 'reviews' | 'insights' }[] = [
    { label: 'Dashboard', icon: 'grid', view: 'dashboard' },
    { label: 'Catalog', icon: 'box', view: 'catalog' },
    { label: 'Orders', icon: 'clipboard', view: 'orders' },
    { label: 'Reviews', icon: 'star', view: 'reviews' },
    { label: 'Insights', icon: 'chart', view: 'insights' },
];

const reportItems: { label: string; icon: string }[] = [];

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
        case 'star':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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
function extractMeeshoProduct(html: string, sourceUrl: string): { url: string; title: string; price: number; images: string[]; description: string } | null {
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

    // Upgrade to highest available resolution and deduplicate
    images = Array.from(new Set(
        images.map(u => (u.startsWith('http') ? u : `https://${u}`)
            .replace(/_([\d]+)\.(jpg|jpeg|webp|png)(\?.*)?$/i, '_1200.$2$3'))
    )).slice(0, 6);

    if (!title || !price) return null;
    return { url: sourceUrl, title, price, images, description };
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
    const [pasteHtml, setPasteHtml] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'catalog' | 'orders' | 'reviews' | 'insights'>('dashboard');

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewActionId, setReviewActionId] = useState<string | null>(null);

    // Dashboard stats
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allReviews, setAllReviews] = useState<Review[]>([]);

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
                    setAllProducts(data);
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
        const loadDashboardData = async () => {
            try {
                const [ordersRes, reviewsRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/reviews'),
                ]);
                if (ordersRes.ok) { const d = await ordersRes.json(); setAllOrders(Array.isArray(d) ? d : d.orders || []); }
                if (reviewsRes.ok) { const d = await reviewsRes.json(); setAllReviews(Array.isArray(d) ? d : d.reviews || []); }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            }
        };
        loadStaged();
        loadPublished();
        loadDashboardData();
    }, []);

    // Fetch orders when switching to orders view
    useEffect(() => {
        if (activeView !== 'orders') return;
        const loadOrders = async () => {
            setOrdersLoading(true);
            setOrderError(null);
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data) ? data : data.orders || [];
                    setOrders(list);
                    setAllOrders(list);
                } else {
                    setOrderError('Failed to load orders. Please refresh.');
                }
            } catch {
                setOrderError('Network error loading orders.');
            } finally {
                setOrdersLoading(false);
            }
        };
        loadOrders();
    }, [activeView]);

    // Fetch reviews when switching to reviews view
    useEffect(() => {
        if (activeView !== 'reviews') return;
        const loadReviews = async () => {
            setReviewsLoading(true);
            try {
                const res = await fetch('/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data) ? data : data.reviews || [];
                    setReviews(list);
                    setAllReviews(list);
                }
            } catch (err) {
                console.error('Failed to load reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        };
        loadReviews();
    }, [activeView]);

    const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
        const prev = orders.find(o => o.id === orderId)?.status;
        setUpdatingOrderId(orderId);
        setOrderError(null);
        // Optimistic update
        setOrders(o => o.map(x => x.id === orderId ? { ...x, status: newStatus as Order['status'] } : x));
        try {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
            if (!res.ok) {
                // Rollback
                if (prev) setOrders(o => o.map(x => x.id === orderId ? { ...x, status: prev } : x));
                setOrderError(`Failed to update order #${orderId.slice(0, 8)}`);
            }
        } catch {
            if (prev) setOrders(o => o.map(x => x.id === orderId ? { ...x, status: prev } : x));
            setOrderError('Network error updating order.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleApproveReview = async (reviewId: string) => {
        setReviewActionId(reviewId);
        try {
            const res = await fetch('/api/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId, approved: true }),
            });
            if (res.ok) {
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
            }
        } catch (err) {
            console.error('Failed to approve review:', err);
        } finally {
            setReviewActionId(null);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        setReviewActionId(reviewId);
        try {
            const res = await fetch(`/api/reviews?id=${reviewId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
            }
        } catch (err) {
            console.error('Failed to delete review:', err);
        } finally {
            setReviewActionId(null);
        }
    };

    const statusBadgeStyle = (status: string) => {
        switch (status) {
            case 'pending': return { backgroundColor: '#FEF3C7', color: '#D97706' };
            case 'paid': return { backgroundColor: '#DBEAFE', color: '#2563EB' };
            case 'shipped': return { backgroundColor: '#FFEDD5', color: '#EA580C' };
            case 'delivered': return { backgroundColor: 'var(--green-light)', color: 'var(--green)' };
            default: return { backgroundColor: 'var(--gray-100)', color: 'var(--gray-500)' };
        }
    };

    const filteredOrders = orderStatusFilter === 'all' ? orders : orders.filter(o => o.status === orderStatusFilter);

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

    const saveProduct = async (product: ReturnType<typeof extractMeeshoProduct>) => {
        if (!product) return false;
        const res = await fetch('/api/admin/scrape-meesho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        const data = await res.json();
        if (res.ok && data.success) {
            setStagedProducts(prev => [...prev, data.product]);
            setImportUrl('');
            setPasteHtml('');
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 4000);
            return true;
        }
        return false;
    };

    // Extension-powered import: send URL to bridge → extension opens tab → extracts → imports
    const handleExtensionImport = async () => {
        const url = importUrl.trim();
        if (!url) return;
        if (!/^https?:\/\/(www\.)?meesho\.com\/.+\/p\/.+/i.test(url)) {
            setImportError('Please enter a valid Meesho product URL (e.g. https://www.meesho.com/product-name/p/abc123)');
            return;
        }

        setImportLoading(true);
        setImportError(null);
        setImportSuccess(false);

        // Check if extension bridge is available
        const extInstalled = document.documentElement.getAttribute('data-veedu-ext') === 'true';
        if (!extInstalled) {
            setImportError('Veedu Importer extension not detected. Please install it first (chrome://extensions → Load Unpacked → select extension folder).');
            setImportLoading(false);
            return;
        }

        const requestId = crypto.randomUUID();

        // Listen for response from bridge
        const result = await new Promise<{ ok: boolean; error?: string; title?: string }>((resolve) => {
            const timeout = setTimeout(() => {
                resolve({ ok: false, error: 'Import timed out. The Meesho page may be slow to load.' });
            }, 35000);

            const handler = (e: Event) => {
                const detail = (e as CustomEvent).detail;
                if (detail.requestId === requestId) {
                    clearTimeout(timeout);
                    window.removeEventListener('veedu-import-response', handler);
                    resolve(detail);
                }
            };
            window.addEventListener('veedu-import-response', handler);

            // Dispatch request to bridge content script
            window.dispatchEvent(new CustomEvent('veedu-import-request', {
                detail: { url, requestId },
            }));
        });

        if (result.ok) {
            // Reload staged products to show the new one
            try {
                const res = await fetch('/api/admin/products');
                const data = await res.json();
                if (data.products) {
                    const staged = data.products.filter((p: Product) => p.status === 'staged');
                    setStagedProducts(staged);
                }
            } catch { /* ignore */ }
            setImportUrl('');
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 4000);
        } else {
            setImportError(result.error || 'Import failed');
        }
        setImportLoading(false);
    };

    // Clipboard import: read pasted page source from clipboard
    const handleClipboardImport = async () => {
        setImportLoading(true);
        setImportError(null);
        setImportSuccess(false);
        try {
            const text = await navigator.clipboard.readText();
            if (!text || text.length < 500) {
                setImportError('Clipboard is empty or too short. Copy the full page source first (Ctrl+U → Ctrl+A → Ctrl+C).');
                setImportLoading(false);
                return;
            }
            const url = importUrl.trim() || 'https://meesho.com';
            const product = extractMeeshoProduct(text, url);
            if (!product) {
                setImportError('Could not read product from clipboard. Make sure you copied the VIEW SOURCE (Ctrl+U), not the visible text.');
                setImportLoading(false);
                return;
            }
            if (!await saveProduct(product)) {
                setImportError('Failed to save product.');
            }
        } catch {
            setImportError('Clipboard access denied. Use the paste box below instead.');
        }
        setImportLoading(false);
    };

    // Manual paste fallback
    const handleHtmlImport = async () => {
        const html = pasteHtml.trim();
        const url = importUrl.trim() || 'https://meesho.com';
        if (!html) return;
        setImportLoading(true);
        setImportError(null);
        setImportSuccess(false);
        const product = extractMeeshoProduct(html, url);
        if (!product) {
            setImportError('Could not read product. Make sure you copied the full page source.');
            setImportLoading(false);
            return;
        }
        if (!await saveProduct(product)) {
            setImportError('Failed to save product.');
        }
        setImportLoading(false);
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
                                <button key={item.label}
                                    onClick={() => { if (item.view) { setActiveView(item.view); setSidebarOpen(false); } }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ backgroundColor: item.view === activeView ? 'var(--green)' : 'transparent', color: item.view === activeView ? 'white' : 'var(--gray-600)' }}>
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
                        <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                            {activeView === 'dashboard' ? 'Dashboard' : activeView === 'catalog' ? 'Catalog Manager' : activeView === 'orders' ? 'Order Management' : activeView === 'insights' ? 'Insights' : 'Review Moderation'}
                        </h1>
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
                    {/* Dashboard View */}
                    {activeView === 'dashboard' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>Dashboard</h2>
                                <p className="text-base font-medium" style={{ color: 'var(--gray-500)' }}>Overview of your store performance.</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Products', value: publishedCount, icon: '📦', color: 'var(--accent)' },
                                    { label: 'Orders', value: allOrders.length, icon: '🛒', color: 'var(--green)' },
                                    { label: 'Revenue', value: `₹${allOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString('en-IN')}`, icon: '💰', color: '#2563EB' },
                                    { label: 'Reviews', value: allReviews.length, icon: '⭐', color: '#D97706' },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-2xl">{stat.icon}</span>
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: stat.color + '18', color: stat.color }}>Live</span>
                                        </div>
                                        <p className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                                        <p className="text-xs font-medium mt-1" style={{ color: 'var(--gray-400)' }}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Status Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                    <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Order Status</h3>
                                    <div className="space-y-3">
                                        {(['pending', 'paid', 'shipped', 'delivered'] as const).map(status => {
                                            const count = allOrders.filter(o => o.status === status).length;
                                            const pct = allOrders.length > 0 ? (count / allOrders.length) * 100 : 0;
                                            return (
                                                <div key={status}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold capitalize" style={{ color: 'var(--gray-600)' }}>{status}</span>
                                                        <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{count}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-100)' }}>
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: statusBadgeStyle(status).color }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                    <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Category Breakdown</h3>
                                    <div className="space-y-3">
                                        {Object.entries(categoryBreakdown).map(([cat, count]) => {
                                            const pct = publishedCount > 0 ? (count / publishedCount) * 100 : 0;
                                            return (
                                                <div key={cat}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold" style={{ color: 'var(--gray-600)' }}>{cat}</span>
                                                        <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{count}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-100)' }}>
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(categoryBreakdown).length === 0 && (
                                            <p className="text-xs py-4 text-center" style={{ color: 'var(--gray-400)' }}>No products published yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Recent Orders</h3>
                                    <button onClick={() => setActiveView('orders')} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>View All →</button>
                                </div>
                                {allOrders.length === 0 ? (
                                    <p className="text-xs py-6 text-center" style={{ color: 'var(--gray-400)' }}>No orders yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {allOrders.slice(0, 5).map(order => (
                                            <div key={order.id} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--gray-100)' }}>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>#{order.id.slice(0, 12)}</p>
                                                    <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{order.customer?.name || 'Unknown'}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>₹{(order.total || 0).toLocaleString('en-IN')}</p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={statusBadgeStyle(order.status)}>
                                                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Reviews */}
                            {allReviews.filter(r => !r.approved).length > 0 && (
                                <div className="bg-white rounded-2xl p-6 mt-6" style={{ border: '1px solid #FEF3C7', boxShadow: 'var(--shadow-sm)' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold" style={{ color: '#D97706' }}>⚠ Pending Reviews</h3>
                                        <button onClick={() => setActiveView('reviews')} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Moderate →</button>
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                        {allReviews.filter(r => !r.approved).length} review{allReviews.filter(r => !r.approved).length !== 1 ? 's' : ''} waiting for approval.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Catalog View */}
                    {activeView === 'catalog' && (<>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col gap-6 mb-12">
                            <div>
                                <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>Catalog Manager</h2>
                                <p className="text-base font-medium" style={{ color: 'var(--gray-500)' }}>Import products from Meesho with one click.</p>
                            </div>

                            {/* Simple URL Import */}
                            <div className="bg-white p-5 rounded-3xl shadow-sm border" style={{ borderColor: 'var(--gray-200)' }}>
                                <p className="text-xs font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--gray-400)' }}>📦 Import from Meesho</p>

                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="Paste Meesho product URL here…"
                                        value={importUrl}
                                        onChange={e => { setImportUrl(e.target.value); setImportError(null); setImportSuccess(false); }}
                                        onKeyDown={e => e.key === 'Enter' && handleExtensionImport()}
                                        className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                                        style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                        disabled={importLoading}
                                    />
                                    <button
                                        onClick={handleExtensionImport}
                                        disabled={importLoading || !importUrl.trim()}
                                        className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                        style={{ backgroundColor: 'var(--green)' }}
                                    >
                                        {importLoading ? '⏳ Importing…' : '🚀 Import'}
                                    </button>
                                </div>

                                {importLoading && <p className="text-xs mt-3" style={{ color: 'var(--gray-400)' }}>Opening product page and reading data… this takes a few seconds.</p>}
                                {importSuccess && <p className="text-xs mt-3 font-medium" style={{ color: 'var(--green)' }}>✓ Product imported and added to staged items!</p>}
                                {importError && <p className="text-xs mt-3 font-medium" style={{ color: '#e53e3e' }}>{importError}</p>}
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
                    </>)}

                    {/* Orders Management View */}
                    {activeView === 'orders' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>Orders</h2>
                                    <p className="text-base font-medium" style={{ color: 'var(--gray-500)' }}>Manage and track customer orders.</p>
                                </div>
                                <select
                                    value={orderStatusFilter}
                                    onChange={e => setOrderStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 rounded-full text-sm font-medium outline-none"
                                    style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', backgroundColor: 'var(--white)' }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            {/* Order count + error banner */}
                            {!ordersLoading && orders.length > 0 && (
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>
                                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-xs" style={{ color: 'var(--gray-400)' }}>
                                        Revenue: ₹{filteredOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                            {orderError && (
                                <div className="mb-4 px-4 py-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                    <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>{orderError}</p>
                                    <button onClick={() => setOrderError(null)} className="text-xs font-bold" style={{ color: '#DC2626' }}>✕</button>
                                </div>
                            )}

                            {ordersLoading ? (
                                <div className="text-center py-20">
                                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Loading orders...</p>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--white)', border: '1px dashed var(--gray-300)' }}>
                                    <p className="text-lg font-medium mb-1" style={{ color: 'var(--gray-400)' }}>No orders found</p>
                                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Orders will appear here when customers place them.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredOrders.map(order => (
                                        <div key={order.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div>
                                                        <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>#{order.id.slice(0, 8)}</p>
                                                        <p className="text-xs" style={{ color: 'var(--gray-400)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{order.customer.name}</p>
                                                        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{order.customer.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-lg font-extrabold" style={{ color: 'var(--foreground)' }}>₹{order.total}</p>
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={statusBadgeStyle(order.status)}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                    <select
                                                        value={order.status}
                                                        disabled={updatingOrderId === order.id}
                                                        onChange={e => { e.stopPropagation(); handleOrderStatusChange(order.id, e.target.value); }}
                                                        onClick={e => e.stopPropagation()}
                                                        className="text-xs px-2 py-1 rounded-lg outline-none disabled:opacity-50"
                                                        style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', backgroundColor: updatingOrderId === order.id ? 'var(--gray-100)' : 'var(--white)' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                        style={{ transform: expandedOrderId === order.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </div>
                                            </div>
                                            {expandedOrderId === order.id && (
                                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gray-400)' }}>Order Items</p>
                                                    <div className="space-y-2">
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        {(order.items as any[] || []).map((item: any, i: number) => {
                                                            // Handle both CartItem format {product, quantity} and flat format {productId, title, price, quantity, image}
                                                            const prod = (item.product || {}) as Record<string, unknown>;
                                                            const title = (prod.title || item.title || 'Unknown Product') as string;
                                                            const price = (prod.sellingPrice || item.price || 0) as number;
                                                            const qty = (item.quantity || 1) as number;
                                                            const img = ((prod.images as string[])?.[0] || item.image || '') as string;
                                                            return (
                                                                <div key={i} className="flex items-center gap-3 p-2 rounded-xl" style={{ backgroundColor: 'var(--gray-100)' }}>
                                                                    {img && <img src={img} alt={title} className="w-10 h-10 rounded-lg object-cover" />}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{title}</p>
                                                                        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>Qty: {qty} × ₹{price}</p>
                                                                    </div>
                                                                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>₹{qty * price}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                            {order.customer?.address}, {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
                                                        </p>
                                                        <p className="text-sm font-extrabold" style={{ color: 'var(--foreground)' }}>Total: ₹{(order.total || 0).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Moderation View */}
                    {activeView === 'reviews' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>Reviews</h2>
                                <p className="text-base font-medium" style={{ color: 'var(--gray-500)' }}>Moderate customer reviews.</p>
                            </div>

                            {reviewsLoading ? (
                                <div className="text-center py-20">
                                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Loading reviews...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--white)', border: '1px dashed var(--gray-300)' }}>
                                    <p className="text-lg font-medium mb-1" style={{ color: 'var(--gray-400)' }}>No reviews yet</p>
                                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Customer reviews will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{review.name}</p>
                                                    {review.verifiedPurchase && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>✓ Verified</span>
                                                    )}
                                                </div>
                                                <p className="text-xs" style={{ color: 'var(--gray-400)' }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg key={star} width="14" height="14" viewBox="0 0 24 24"
                                                        fill={star <= review.rating ? 'var(--accent)' : 'none'}
                                                        stroke={star <= review.rating ? 'var(--accent)' : 'var(--gray-300)'} strokeWidth="2">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="text-xs mb-1" style={{ color: 'var(--gray-400)' }}>Product: {review.productId.slice(0, 8)}…</p>
                                            <p className="text-sm mb-4" style={{ color: 'var(--gray-600)' }}>{review.comment}</p>
                                            <div className="flex gap-2">
                                                {!review.approved ? (
                                                    <button onClick={() => handleApproveReview(review.id)}
                                                        disabled={reviewActionId === review.id}
                                                        className="flex-1 text-xs font-bold py-2.5 rounded-full transition-all hover:opacity-80 disabled:opacity-50"
                                                        style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>
                                                        {reviewActionId === review.id ? 'Approving…' : 'Approve'}
                                                    </button>
                                                ) : (
                                                    <span className="flex-1 text-xs font-bold py-2.5 rounded-full text-center"
                                                        style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>
                                                        ✓ Approved
                                                    </span>
                                                )}
                                                <button onClick={() => handleDeleteReview(review.id)}
                                                    disabled={reviewActionId === review.id}
                                                    className="flex-1 text-xs font-bold py-2.5 rounded-full transition-all hover:opacity-80 disabled:opacity-50"
                                                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                                    {reviewActionId === review.id ? 'Deleting…' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Insights View */}
                    {activeView === 'insights' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>Insights</h2>
                                <p className="text-base font-medium" style={{ color: 'var(--gray-500)' }}>Analytics and performance metrics.</p>
                            </div>

                            {/* Revenue & Orders Summary */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {(() => {
                                    const totalRevenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
                                    const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
                                    const deliveredRevenue = deliveredOrders.reduce((s, o) => s + (o.total || 0), 0);
                                    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
                                    const avgRating = allReviews.length > 0 ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0;
                                    return [
                                        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: `${allOrders.length} orders`, color: 'var(--green)' },
                                        { label: 'Delivered Revenue', value: `₹${deliveredRevenue.toLocaleString('en-IN')}`, sub: `${deliveredOrders.length} delivered`, color: '#2563EB' },
                                        { label: 'Avg Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`, sub: 'per order', color: 'var(--accent)' },
                                        { label: 'Avg Rating', value: avgRating.toFixed(1), sub: `${allReviews.length} reviews`, color: '#D97706' },
                                    ].map(stat => (
                                        <div key={stat.label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gray-400)' }}>{stat.label}</p>
                                            <p className="text-2xl font-extrabold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--gray-400)' }}>{stat.sub}</p>
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* Revenue by Day (last 7 days) */}
                            <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 className="text-sm font-bold mb-6" style={{ color: 'var(--foreground)' }}>Revenue — Last 7 Days</h3>
                                {(() => {
                                    const days: { label: string; revenue: number; orders: number }[] = [];
                                    for (let i = 6; i >= 0; i--) {
                                        const d = new Date(); d.setDate(d.getDate() - i);
                                        const ds = d.toISOString().split('T')[0];
                                        const dayOrders = allOrders.filter(o => o.createdAt?.startsWith(ds));
                                        days.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }), revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0), orders: dayOrders.length });
                                    }
                                    const maxRev = Math.max(...days.map(d => d.revenue), 1);
                                    return (
                                        <div className="flex items-end gap-3 h-40">
                                            {days.map((day, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold" style={{ color: 'var(--foreground)' }}>
                                                        {day.revenue > 0 ? `₹${day.revenue.toLocaleString('en-IN')}` : '—'}
                                                    </span>
                                                    <div className="w-full rounded-t-lg transition-all duration-500" style={{
                                                        height: `${Math.max((day.revenue / maxRev) * 100, 4)}%`,
                                                        backgroundColor: day.revenue > 0 ? 'var(--green)' : 'var(--gray-200)',
                                                        minHeight: '4px',
                                                    }} />
                                                    <span className="text-[10px]" style={{ color: 'var(--gray-400)' }}>{day.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Top Products by Orders */}
                                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                    <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Top Products</h3>
                                    {(() => {
                                        const productSales: Record<string, { title: string; qty: number; revenue: number }> = {};
                                        for (const order of allOrders) {
                                            for (const item of (order.items as any[] || [])) {
                                                const it = item;
                                                const prod = (it.product || {}) as Record<string, unknown>;
                                                const pid = (prod.id || it.productId || 'unknown') as string;
                                                const title = (prod.title || it.title || 'Unknown') as string;
                                                const price = (prod.sellingPrice || it.price || 0) as number;
                                                const qty = (it.quantity || 1) as number;
                                                if (!productSales[pid]) productSales[pid] = { title, qty: 0, revenue: 0 };
                                                productSales[pid].qty += qty;
                                                productSales[pid].revenue += qty * price;
                                            }
                                        }
                                        const top = Object.entries(productSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
                                        if (top.length === 0) return <p className="text-xs py-4 text-center" style={{ color: 'var(--gray-400)' }}>No sales data yet.</p>;
                                        return (
                                            <div className="space-y-3">
                                                {top.map(([pid, data], i) => (
                                                    <div key={pid} className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: i === 0 ? 'var(--accent)' : 'var(--gray-300)' }}>{i + 1}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{data.title}</p>
                                                            <p className="text-xs" style={{ color: 'var(--gray-400)' }}>{data.qty} sold</p>
                                                        </div>
                                                        <p className="text-sm font-bold" style={{ color: 'var(--green)' }}>₹{data.revenue.toLocaleString('en-IN')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Review Stats */}
                                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                                    <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Review Breakdown</h3>
                                    {allReviews.length === 0 ? (
                                        <p className="text-xs py-4 text-center" style={{ color: 'var(--gray-400)' }}>No reviews yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = allReviews.filter(r => r.rating === star).length;
                                                const pct = (count / allReviews.length) * 100;
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold w-8" style={{ color: 'var(--gray-600)' }}>{star} ★</span>
                                                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-100)' }}>
                                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
                                                        </div>
                                                        <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--foreground)' }}>{count}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="pt-3 mt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                                <span className="text-xs" style={{ color: 'var(--gray-400)' }}>Pending moderation</span>
                                                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                                                    {allReviews.filter(r => !r.approved).length}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs" style={{ color: 'var(--gray-400)' }}>Verified purchases</span>
                                                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>
                                                    {allReviews.filter(r => r.verifiedPurchase).length}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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