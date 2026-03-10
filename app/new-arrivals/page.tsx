'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(r => r.json())
            .then((data: Product[]) => {
                if (!Array.isArray(data)) { setProducts([]); return; }
                const newOnes = data.filter(p => p.isNew).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setProducts(newOnes.length > 0 ? newOnes : data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Just Arrived</span>
                    <h1 className="text-4xl font-extrabold tracking-tight mt-2 mb-2" style={{ color: 'var(--foreground)' }}>New Arrivals</h1>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>
                        Fresh additions to our home and kitchen collection. Be the first to get them.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-[2rem] aspect-[3/4] animate-pulse" style={{ backgroundColor: 'var(--gray-100)' }} />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product, i) => (
                            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed var(--gray-300)' }}>
                        <p className="text-lg font-medium mb-4" style={{ color: 'var(--gray-400)' }}>No new arrivals yet. Check back soon!</p>
                        <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
                            Browse Full Catalog
                        </Link>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
