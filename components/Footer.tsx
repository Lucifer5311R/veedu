'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setSubscribed(true);
        }
    };

    return (
        <footer style={{ backgroundColor: 'var(--cream-dark)' }}>
            {/* Newsletter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                        style={{ backgroundColor: 'var(--green-light)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                        Get utility updates.
                    </h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--gray-500)' }}>
                        Join our newsletter to receive the latest updates on kitchen<br />
                        organization tips and new product arrivals.
                    </p>
                    {subscribed ? (
                        <div className="flex items-center justify-center gap-2 max-w-md mx-auto py-3.5 px-6 rounded-full" style={{ backgroundColor: 'var(--green-light)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
                                You&apos;re subscribed! Thank you.
                            </span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex items-center justify-center gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="flex-1 px-5 py-3.5 rounded-full border text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[var(--accent)]"
                                style={{
                                    borderColor: 'var(--gray-200)',
                                    backgroundColor: 'var(--white)',
                                    color: 'var(--foreground)',
                                }}
                            />
                            <button
                                type="submit"
                                className="px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-md)]"
                                style={{ backgroundColor: 'var(--foreground)' }}
                            >
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Footer Links */}
            <div className="border-t" style={{ borderColor: 'var(--gray-200)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div>
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                </div>
                                <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Veedu.</span>
                            </Link>
                            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--gray-500)' }}>
                                Premium home and kitchen utility items. Delivering quality to Kerala homes.
                            </p>
                            <div className="flex items-center gap-3">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full" style={{ border: '1px solid var(--gray-200)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gray-500)">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full" style={{ border: '1px solid var(--gray-200)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gray-500)">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Shop */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--gray-400)' }}>SHOP</h4>
                            <ul className="space-y-3">
                                <li><Link href="/catalog" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>All Products</Link></li>
                                <li><Link href="/new-arrivals" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>New Arrivals</Link></li>
                                <li><Link href="/wishlist" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Wishlist</Link></li>
                                <li><Link href="/bulk-order" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Bulk Pricing</Link></li>
                                <li><Link href="/orders" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Track Order</Link></li>
                            </ul>
                        </div>

                        {/* Help */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--gray-400)' }}>HELP</h4>
                            <ul className="space-y-3">
                                <li><Link href="/about" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>About Us</Link></li>
                                <li><Link href="/shipping-policy" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Shipping Policy</Link></li>
                                <li><Link href="/returns" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Returns & Refunds</Link></li>
                                <li><Link href="/faq" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>FAQs</Link></li>
                                <li><Link href="/contact" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* Reseller */}
                        <div>
                            <h4 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--gray-400)' }}>RESELLER</h4>
                            <div className="p-5 rounded-2xl transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:-translate-y-1" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                                <Link
                                    href="/bulk-order"
                                    className="inline-block text-sm font-bold px-5 py-2.5 rounded-full mb-3 transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-md)]"
                                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                                >
                                    Join the Network
                                </Link>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray-500)' }}>
                                    Start your own kitchen utility business today with Veedu.
                                </p>
                                <Link href="/bulk-order" className="text-xs font-bold mt-3 inline-flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                                    Reseller Platform <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t" style={{ borderColor: 'var(--gray-200)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs" style={{ color: 'var(--gray-400)' }}>
                        © 2026 VEEDU UTILITY. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy-policy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-400)' }}>PRIVACY POLICY</Link>
                        <Link href="/terms" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-400)' }}>TERMS OF SERVICE</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}