'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartProvider';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, subtotal, total, itemCount } = useCart();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Your Cart</h1>
                    <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                        {itemCount > 0
                            ? `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart ready for checkout.`
                            : 'Your cart is empty.'}
                    </p>
                </div>

                {itemCount === 0 ? (
                    /* Empty Cart */
                    <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--white)', border: '1px dashed var(--gray-300)' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <p className="text-xl font-semibold mb-2" style={{ color: 'var(--gray-400)' }}>
                            Your cart is empty
                        </p>
                        <p className="text-sm mb-6" style={{ color: 'var(--gray-400)' }}>
                            Browse our catalog and add some items!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    /* Cart with Items */
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.product.id} className="flex gap-6 sm:gap-8 py-6" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                    {/* Product Image */}
                                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-[1.5rem] flex-shrink-0 flex justify-center items-center overflow-hidden transition-transform duration-500 hover:scale-[1.02]" style={{ backgroundColor: '#F3F4F3' }}>
                                        {item.product.images?.[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        )}
                                        <button
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                            style={{ backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)', color: 'var(--gray-600)' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                                                {item.product.title}
                                            </h3>
                                            <span className="text-base font-bold whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                                                ₹{item.product.sellingPrice.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--green)' }}>
                                            {item.product.category}
                                        </p>
                                        <p className="text-sm line-clamp-2 mb-4 hidden sm:block" style={{ color: 'var(--gray-500)' }}>
                                            {item.product.description}
                                        </p>

                                        <div className="flex items-center gap-6 mt-6">
                                            <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--gray-200)' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-lg font-medium transition-colors hover:opacity-70"
                                                    style={{ color: 'var(--foreground)' }}
                                                >
                                                    −
                                                </button>
                                                <span
                                                    className="w-10 h-10 flex items-center justify-center text-sm font-semibold"
                                                    style={{ color: 'var(--foreground)', borderLeft: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)' }}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-lg font-medium transition-colors hover:opacity-70"
                                                    style={{ color: 'var(--foreground)' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button className="text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--green)' }}>
                                                Save for Later
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div
                                className="sticky top-24 rounded-3xl p-6 sm:p-8 transition-all duration-300"
                                style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-md)' }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            >
                                <h3 className="text-xl font-extrabold tracking-tight mb-8" style={{ color: 'var(--foreground)' }}>Order Summary</h3>

                                <div className="space-y-5 mb-8">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>Subtotal ({itemCount} items)</span>
                                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>Shipping</span>
                                        <span
                                            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                            style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}
                                        >
                                            FREE
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>Estimated Tax</span>
                                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>₹0.00</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 mb-8" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                    <span className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
                                    <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>₹{total.toLocaleString('en-IN')}</span>
                                </div>

                                {/* CTA */}
                                <Link
                                    href="/checkout"
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold text-white uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-md)] mb-3"
                                    style={{ backgroundColor: 'var(--accent)' }}
                                >
                                    Proceed to Checkout
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </Link>
                                <Link
                                    href="/"
                                    className="flex items-center justify-center w-full py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:opacity-80"
                                    style={{ color: 'var(--foreground)', backgroundColor: 'var(--gray-100)' }}
                                >
                                    Continue Shopping
                                </Link>

                                {/* Trust Badge */}
                                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-100)' }}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Safe & Secure</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>
                                                Every transaction is encrypted and protected by Veedu&apos;s buyer guarantee.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Help Link */}
                                <p className="text-center text-xs mt-4" style={{ color: 'var(--gray-500)' }}>
                                    Need help with your order?{' '}
                                    <a href="/" className="font-medium underline" style={{ color: 'var(--foreground)' }}>Contact Support</a>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Features Bar */}
            {itemCount > 0 && (
                <div className="mt-16 mb-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Fast Delivery */}
                            <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ border: '1px solid var(--gray-200)' }}>
                                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13"></rect>
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Fast Delivery</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>Arrives in 2-3 business days with real-time tracking.</p>
                                </div>
                            </div>

                            {/* Easy Returns */}
                            <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ border: '1px solid var(--gray-200)' }}>
                                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#FFF0E6' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="1 4 1 10 7 10"></polyline>
                                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Easy Returns</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>Hassle-free 14-day returns on all utility items.</p>
                                </div>
                            </div>

                            {/* Premium Support */}
                            <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ border: '1px solid var(--gray-200)' }}>
                                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Premium Support</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>Dedicated kitchen and home experts available 24/7.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
