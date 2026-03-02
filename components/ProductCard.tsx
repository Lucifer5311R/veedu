'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartProvider';
import { useWishlist } from '@/context/WishlistProvider';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const wishlisted = isWishlisted(product.id);

    return (
        <div className="group relative transition-all duration-500 hover:-translate-y-1">
            {/* Image Container */}
            <Link href={`/product/${product.id}`} className="block">
            <div
                className="relative aspect-square overflow-hidden rounded-[2rem] mb-4 transition-transform duration-500 group-hover:shadow-[var(--shadow-lg)]"
                style={{ backgroundColor: '#F3F4F3' }}
            >
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                )}

                {/* Wishlist Heart */}
                <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <svg
                        width="15" height="15" viewBox="0 0 24 24"
                        fill={wishlisted ? 'var(--accent)' : 'none'}
                        stroke={wishlisted ? 'var(--accent)' : 'var(--gray-600)'}
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            </Link>

            {/* Info */}
            <div className="px-1">
                {/* Category + New Badge */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--gray-500)' }}>
                        {product.category}
                    </span>
                    {product.isNew && (
                        <span
                            className="text-[10px] font-bold uppercase"
                            style={{ color: '#E3520D' }}
                        >
                            New
                        </span>
                    )}
                </div>

                {/* Title */}
                <Link href={`/product/${product.id}`}>
                <h3 className="text-sm font-bold mb-3 line-clamp-1 hover:underline" style={{ color: 'var(--foreground)' }}>
                    {product.title}
                </h3>
                </Link>

                {/* Price + Add to Cart */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
                        ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <button
                        onClick={() => addToCart(product)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-md)]"
                        style={{ backgroundColor: 'var(--green)', color: 'white' }}
                        aria-label="Add to cart"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}