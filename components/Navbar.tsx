'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartProvider';
import { useWishlist } from '@/context/WishlistProvider';
import { useSession } from 'next-auth/react';
import { trackSearch } from '@/lib/analytics';

export default function Navbar() {
    const { itemCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchValue.trim();
        if (q) {
            trackSearch(q);
            router.push(`/search?q=${encodeURIComponent(q)}`);
        } else {
            router.push('/catalog');
        }
        setMobileOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 glass transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Veedu.</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/catalog" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Catalog</Link>
                        <Link href="/new-arrivals" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>New Arrivals</Link>
                        <Link href="/about" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>About</Link>
                        <Link href="/orders" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Orders</Link>
                        <Link href="/bulk-order" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--gray-600)' }}>Bulk Order</Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--gray-100)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search utility essentials..."
                                className="bg-transparent border-none outline-none text-sm w-40 lg:w-52"
                                style={{ color: 'var(--foreground)' }}
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                            />
                        </form>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="relative p-2 hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            {wishlistCount > 0 && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-semibold"
                                    style={{ backgroundColor: 'var(--green)', fontSize: '10px' }}
                                >
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            {itemCount > 0 && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-semibold"
                                    style={{ backgroundColor: 'var(--accent)', fontSize: '10px' }}
                                >
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Login / Dashboard */}
                        {session ? (
                            <Link
                                href="/admin"
                                className="hidden sm:flex items-center gap-2 text-sm font-bold ml-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                            >
                                Dashboard
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:flex text-sm font-bold ml-2 transition-opacity hover:opacity-70"
                                style={{ color: 'var(--foreground)' }}
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {mobileOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--gray-200)' }}>
                    <div className="px-4 py-4 flex flex-col gap-3">
                        <Link href="/catalog" className="text-sm font-medium py-2" style={{ color: 'var(--gray-600)' }} onClick={() => setMobileOpen(false)}>Catalog</Link>
                        <Link href="/new-arrivals" className="text-sm font-medium py-2" style={{ color: 'var(--gray-600)' }} onClick={() => setMobileOpen(false)}>New Arrivals</Link>
                        <Link href="/about" className="text-sm font-medium py-2" style={{ color: 'var(--gray-600)' }} onClick={() => setMobileOpen(false)}>About</Link>
                        <Link href="/orders" className="text-sm font-medium py-2" style={{ color: 'var(--gray-600)' }} onClick={() => setMobileOpen(false)}>Orders</Link>
                        <Link href="/wishlist" className="text-sm font-medium py-2" style={{ color: 'var(--gray-600)' }} onClick={() => setMobileOpen(false)}>Wishlist</Link>
                        <Link href="/bulk-order" className="text-sm font-medium py-2" style={{ color: 'var(--gray-600)' }} onClick={() => setMobileOpen(false)}>Bulk Order</Link>
                        <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-2 rounded-full mt-1" style={{ backgroundColor: 'var(--gray-100)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm flex-1"
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                            />
                        </form>
                        {session ? (
                            <Link
                                href="/admin"
                                className="text-sm font-bold text-center py-2.5 rounded-full mt-1 text-white"
                                style={{ backgroundColor: 'var(--accent)' }}
                                onClick={() => setMobileOpen(false)}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium text-center py-2 rounded-full mt-1"
                                style={{ border: '1px solid var(--gray-200)' }}
                                onClick={() => setMobileOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}