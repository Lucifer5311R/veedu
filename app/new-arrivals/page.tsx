'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import productsData from '@/data/products.json';
import { Product } from '@/lib/types';

const newProducts = (productsData as Product[])
    .filter(p => p.status === 'published' && p.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const allPublished = (productsData as Product[])
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const products = newProducts.length > 0 ? newProducts : allPublished;

export default function NewArrivalsPage() {
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

                {products.length > 0 ? (
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
