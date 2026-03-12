'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

const CATEGORIES = ['Kitchen', 'Laundry', 'Home & Bath', 'Organization'];

type PriceRange = 'under200' | '200to500' | '500to1000' | 'over1000';
const PRICE_RANGES: { key: PriceRange; label: string; min: number; max: number }[] = [
    { key: 'under200', label: 'Under ₹200', min: 0, max: 200 },
    { key: '200to500', label: '₹200 - ₹500', min: 200, max: 500 },
    { key: '500to1000', label: '₹500 - ₹1000', min: 500, max: 1000 },
    { key: 'over1000', label: 'Over ₹1000', min: 1000, max: Infinity },
];

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/products');
                const data: Product[] = await res.json();
                setProducts(data);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const matchesQuery = useCallback((product: Product, q: string): boolean => {
        if (!q) return true;
        const lower = q.toLowerCase();
        return (
            product.title.toLowerCase().includes(lower) ||
            product.description.toLowerCase().includes(lower) ||
            product.category.toLowerCase().includes(lower)
        );
    }, []);

    const filteredProducts = useMemo(() => {
        let results = products.filter((p) => matchesQuery(p, query));

        if (selectedCategories.length > 0) {
            results = results.filter((p) =>
                selectedCategories.some((c) => p.category.toLowerCase() === c.toLowerCase())
            );
        }

        if (selectedPriceRange) {
            const range = PRICE_RANGES.find((r) => r.key === selectedPriceRange);
            if (range) {
                results = results.filter(
                    (p) => p.sellingPrice >= range.min && p.sellingPrice < range.max
                );
            }
        }

        if (inStockOnly) {
            results = results.filter((p) => p.inStock !== false);
        }

        switch (sortBy) {
            case 'price-asc':
                results.sort((a, b) => a.sellingPrice - b.sellingPrice);
                break;
            case 'price-desc':
                results.sort((a, b) => b.sellingPrice - a.sellingPrice);
                break;
            case 'newest':
                results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            default:
                break;
        }

        return results;
    }, [products, query, selectedCategories, selectedPriceRange, inStockOnly, sortBy, matchesQuery]);

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const togglePriceRange = (key: PriceRange) => {
        setSelectedPriceRange((prev) => (prev === key ? null : key));
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedPriceRange(null);
        setInStockOnly(false);
        setSortBy('relevance');
    };

    const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRange !== null || inStockOnly;

    /* ─── Filter sidebar content (shared between desktop & mobile) ─── */
    const filterContent = (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--foreground)' }}
                >
                    Category
                </h3>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                        <label
                            key={cat}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat)}
                                onChange={() => toggleCategory(cat)}
                                className="sr-only"
                            />
                            <span
                                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                                style={{
                                    backgroundColor: selectedCategories.includes(cat)
                                        ? 'var(--accent)'
                                        : 'transparent',
                                    border: selectedCategories.includes(cat)
                                        ? '2px solid var(--accent)'
                                        : '2px solid var(--gray-300)',
                                }}
                            >
                                {selectedCategories.includes(cat) && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            <span
                                className="text-sm transition-colors"
                                style={{ color: 'var(--gray-500)' }}
                            >
                                {cat}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--foreground)' }}
                >
                    Price Range
                </h3>
                <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                        <button
                            key={range.key}
                            onClick={() => togglePriceRange(range.key)}
                            className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300"
                            style={
                                selectedPriceRange === range.key
                                    ? { backgroundColor: 'var(--foreground)', color: 'var(--white)' }
                                    : { backgroundColor: 'transparent', color: 'var(--gray-500)', border: '1px solid var(--gray-200)' }
                            }
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* In Stock */}
            <div>
                <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--foreground)' }}
                >
                    Availability
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                    <button
                        onClick={() => setInStockOnly(!inStockOnly)}
                        className="relative w-10 h-5 rounded-full transition-colors duration-300"
                        style={{
                            backgroundColor: inStockOnly ? 'var(--green)' : 'var(--gray-200)',
                        }}
                    >
                        <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-300"
                            style={{
                                backgroundColor: 'var(--white)',
                                transform: inStockOnly ? 'translateX(20px)' : 'translateX(0)',
                            }}
                        />
                    </button>
                    <span className="text-sm" style={{ color: 'var(--gray-500)' }}>
                        In Stock Only
                    </span>
                </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: 'var(--gray-100)', color: 'var(--foreground)' }}
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );

    return (
        <>
            <Navbar />
            <main
                className="min-h-screen"
                style={{ backgroundColor: 'var(--background)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Results Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            {query ? (
                                <h1
                                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {loading ? 'Searching' : filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &lsquo;{query}&rsquo;
                                </h1>
                            ) : (
                                <h1
                                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    All Products
                                </h1>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Mobile filter toggle */}
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: 'var(--white)',
                                    color: 'var(--foreground)',
                                    border: '1px solid var(--gray-200)',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Filters
                                {hasActiveFilters && (
                                    <span
                                        className="w-5 h-5 flex items-center justify-center text-xs rounded-full"
                                        style={{ backgroundColor: 'var(--accent)', color: 'var(--white)' }}
                                    >
                                        {selectedCategories.length + (selectedPriceRange ? 1 : 0) + (inStockOnly ? 1 : 0)}
                                    </span>
                                )}
                            </button>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-4 py-2 text-sm font-medium rounded-full appearance-none cursor-pointer transition-all duration-300 pr-8"
                                style={{
                                    backgroundColor: 'var(--white)',
                                    color: 'var(--foreground)',
                                    border: '1px solid var(--gray-200)',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%2371717A' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                }}
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>
                    </div>

                    {/* Layout: Sidebar + Grid */}
                    <div className="flex gap-8">
                        {/* Desktop sidebar */}
                        <aside
                            className="hidden lg:block w-56 flex-shrink-0 rounded-2xl p-5 h-fit sticky top-24"
                            style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--gray-200)',
                            }}
                        >
                            {filterContent}
                        </aside>

                        {/* Mobile filter drawer overlay */}
                        {filtersOpen && (
                            <div className="fixed inset-0 z-50 lg:hidden">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 transition-opacity"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                                    onClick={() => setFiltersOpen(false)}
                                />
                                {/* Drawer */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] p-6 overflow-y-auto animate-slide-in"
                                    style={{ backgroundColor: 'var(--white)' }}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2
                                            className="text-lg font-bold"
                                            style={{ color: 'var(--foreground)' }}
                                        >
                                            Filters
                                        </h2>
                                        <button
                                            onClick={() => setFiltersOpen(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                                            style={{ backgroundColor: 'var(--gray-100)' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                    {filterContent}
                                    <button
                                        onClick={() => setFiltersOpen(false)}
                                        className="w-full mt-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105"
                                        style={{ backgroundColor: 'var(--accent)', color: 'var(--white)' }}
                                    >
                                        Show {filteredProducts.length} Result{filteredProducts.length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Main content area */}
                        <div className="flex-1 min-w-0">
                            {loading ? (
                                /* Loading skeleton */
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-[2rem] aspect-[3/4] animate-pulse"
                                            style={{ backgroundColor: 'var(--gray-100)' }}
                                        />
                                    ))}
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                /* Product grid */
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {filteredProducts.map((product, i) => (
                                        <div
                                            key={product.id}
                                            className="animate-fade-in"
                                            style={{ animationDelay: `${i * 80}ms` }}
                                        >
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* No results */
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                        style={{ backgroundColor: 'var(--gray-100)' }}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                            <circle cx="11" cy="11" r="7" stroke="var(--gray-400)" strokeWidth="2" />
                                            <path d="M16 16l4.5 4.5" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <h2
                                        className="text-xl font-bold mb-2"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        No results found
                                    </h2>
                                    <p
                                        className="max-w-md mb-6"
                                        style={{ color: 'var(--gray-500)' }}
                                    >
                                        {query
                                            ? `We couldn't find anything matching "${query}". Try a different search term or browse our full catalog.`
                                            : 'Try adjusting your filters or browse our full catalog.'}
                                    </p>
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105"
                                                style={{
                                                    backgroundColor: 'var(--gray-100)',
                                                    color: 'var(--foreground)',
                                                }}
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                        <Link
                                            href="/catalog"
                                            className="px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105"
                                            style={{
                                                backgroundColor: 'var(--accent)',
                                                color: 'var(--white)',
                                            }}
                                        >
                                            Browse All Products
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div style={{ backgroundColor: 'var(--background)' }} className="min-h-screen">
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div
                            className="h-8 w-64 rounded-full animate-pulse mb-8"
                            style={{ backgroundColor: 'var(--gray-100)' }}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-[2rem] aspect-[3/4] animate-pulse"
                                    style={{ backgroundColor: 'var(--gray-100)' }}
                                />
                            ))}
                        </div>
                    </div>
                    <Footer />
                </div>
            }
        >
            <SearchResults />
        </Suspense>
    );
}
