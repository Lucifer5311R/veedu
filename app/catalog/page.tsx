'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import productsData from '@/data/products.json';
import { Product } from '@/lib/types';

const products: Product[] = productsData as Product[];
const categories = ['All Items', 'Kitchen', 'Laundry', 'Home & Bath', 'Organization'];

function CatalogContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const [activeCategory, setActiveCategory] = useState('All Items');

    const filtered = products.filter(p => {
        if (p.status !== 'published') return false;
        if (activeCategory !== 'All Items' && p.category !== activeCategory) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <>
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                        style={{ backgroundColor: activeCategory === cat ? 'var(--foreground)' : 'transparent', color: activeCategory === cat ? 'var(--white)' : 'var(--gray-500)' }}>
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filtered.map((product, i) => (
                    <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-lg font-medium" style={{ color: 'var(--gray-400)' }}>No products found.</p>
                </div>
            )}
        </>
    );
}

export default function CatalogPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Full Catalog</h1>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>Browse our complete collection of home and kitchen essentials.</p>
                </div>
                <Suspense fallback={<p style={{ color: 'var(--gray-400)' }}>Loading...</p>}>
                    <CatalogContent />
                </Suspense>
            </div>
            <Footer />
        </div>
    );
}
