'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';
import { trackAddToWishlist } from '@/lib/analytics';

interface WishlistContextType {
    wishlist: Product[];
    toggleWishlist: (product: Product) => void;
    isWishlisted: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('veedu-wishlist');
        if (stored) {
            try {
                setWishlist(JSON.parse(stored));
            } catch {
                localStorage.removeItem('veedu-wishlist');
            }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('veedu-wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, isHydrated]);

    const toggleWishlist = useCallback((product: Product) => {
        setWishlist(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (!exists) {
                trackAddToWishlist({ id: product.id, title: product.title, price: product.sellingPrice });
            }
            return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
        });
    }, []);

    const isWishlisted = useCallback((productId: string) => {
        return wishlist.some(p => p.id === productId);
    }, [wishlist]);

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, wishlistCount }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
}
