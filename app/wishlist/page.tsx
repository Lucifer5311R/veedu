'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistProvider';

export default function WishlistPage() {
    const { wishlist, toggleWishlist } = useWishlist();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
                        Your Wishlist
                    </h1>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>
                        {wishlist.length > 0 ? `${wishlist.length} saved item${wishlist.length > 1 ? 's' : ''}` : 'Save products you love for later.'}
                    </p>
                </div>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {wishlist.map((product, i) => (
                            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed var(--gray-300)' }}>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <p className="text-lg font-medium mb-2" style={{ color: 'var(--gray-400)' }}>Your wishlist is empty</p>
                        <p className="text-sm mb-6" style={{ color: 'var(--gray-400)' }}>
                            Tap the heart icon on any product to save it here.
                        </p>
                        <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
                            Browse Products
                        </Link>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
