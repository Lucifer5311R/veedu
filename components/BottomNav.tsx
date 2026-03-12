'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartProvider';

const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/catalog', label: 'Shop', icon: 'grid' },
    { href: '/search', label: 'Search', icon: 'search' },
    { href: '/cart', label: 'Cart', icon: 'cart' },
    { href: '/orders', label: 'Orders', icon: 'orders' },
];

function NavIcon({ type, active }: { type: string; active: boolean }) {
    const color = active ? 'var(--accent)' : 'var(--gray-400)';
    const sw = active ? '2.5' : '2';
    switch (type) {
        case 'home':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            );
        case 'grid':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
            );
        case 'search':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            );
        case 'cart':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
            );
        case 'orders':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
            );
        default:
            return null;
    }
}

export default function BottomNav() {
    const pathname = usePathname();
    const { itemCount } = useCart();

    // Hide on admin and login pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            style={{
                backgroundColor: 'var(--white)',
                borderTop: '1px solid var(--gray-200)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
            }}
        >
            <div className="flex items-center justify-around h-16">
                {navItems.map(item => {
                    const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] relative"
                        >
                            <div className="relative">
                                <NavIcon type={item.icon} active={active} />
                                {item.icon === 'cart' && itemCount > 0 && (
                                    <span
                                        className="absolute -top-1.5 -right-2 text-[10px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    >
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </div>
                            <span
                                className="text-[10px] font-medium"
                                style={{ color: active ? 'var(--accent)' : 'var(--gray-400)' }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
