'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/lib/types';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('veedu-cart');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch {
                localStorage.removeItem('veedu-cart');
            }
        }
        setIsHydrated(true);
    }, []);

    // Persist cart to localStorage
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('veedu-cart', JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addToCart = useCallback((product: Product) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(item => item.product.id !== productId));
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
    const total = subtotal; // Free shipping, no tax

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal, total }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
