'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/lib/types';

const statusColors: Record<Order['status'], { bg: string; text: string; label: string }> = {
    pending: { bg: 'var(--yellow-light, #FEF9C3)', text: 'var(--yellow-dark, #A16207)', label: 'Pending' },
    paid: { bg: 'var(--blue-light, #DBEAFE)', text: 'var(--blue-dark, #1D4ED8)', label: 'Paid' },
    shipped: { bg: 'var(--orange-light, #FFF7ED)', text: 'var(--accent)', label: 'Shipped' },
    delivered: { bg: 'var(--green-light)', text: 'var(--green)', label: 'Delivered' },
};

export default function OrdersPage() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const isValidPhone = /^[6-9]\d{9}$/.test(phone);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!isValidPhone) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/orders?phone=${phone}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1
                        className="text-4xl font-extrabold tracking-tight mb-3"
                        style={{ color: 'var(--foreground)' }}
                    >
                        Track Your Orders
                    </h1>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>
                        Enter your phone number to view your order history
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
                    <div className="flex gap-3">
                        <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Enter 10-digit mobile number"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="flex-1 px-5 py-3.5 rounded-xl text-base outline-none transition-all duration-200"
                            style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--gray-200)',
                                color: 'var(--foreground)',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
                        />
                        <button
                            type="submit"
                            disabled={!isValidPhone || loading}
                            className="px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                    {phone.length > 0 && !isValidPhone && (
                        <p className="text-xs mt-2 ml-1" style={{ color: 'var(--accent)' }}>
                            Enter a valid 10-digit Indian mobile number
                        </p>
                    )}
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <div
                            className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
                            style={{ borderColor: 'var(--gray-200)', borderTopColor: 'var(--accent)' }}
                        />
                    </div>
                )}

                {/* Results */}
                {!loading && searched && orders.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">📦</div>
                        <p className="text-lg font-medium mb-1" style={{ color: 'var(--gray-400)' }}>
                            No orders found for this number
                        </p>
                        <p className="text-sm" style={{ color: 'var(--gray-400)' }}>
                            Make sure you entered the number used while placing the order
                        </p>
                    </div>
                )}

                {!loading && orders.length > 0 && (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {orders.map(order => {
                            const isExpanded = expandedId === order.id;
                            const colors = statusColors[order.status];
                            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                            return (
                                <div
                                    key={order.id}
                                    className="rounded-3xl overflow-hidden transition-all duration-200"
                                    style={{
                                        backgroundColor: 'var(--white)',
                                        border: '1px solid var(--gray-200)',
                                    }}
                                >
                                    {/* Order Summary Row */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <span
                                                    className="text-sm font-bold tracking-wide"
                                                    style={{ color: 'var(--foreground)' }}
                                                >
                                                    {order.id}
                                                </span>
                                                <span
                                                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: colors.bg,
                                                        color: colors.text,
                                                    }}
                                                >
                                                    {colors.label}
                                                </span>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                {formatDate(order.createdAt)} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-base font-bold"
                                                style={{ color: 'var(--foreground)' }}
                                            >
                                                ₹{order.total.toLocaleString('en-IN')}
                                            </span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="var(--gray-400)"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="transition-transform duration-200"
                                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div
                                            className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4"
                                            style={{ borderTop: '1px solid var(--gray-200)' }}
                                        >
                                            {/* Items */}
                                            <div className="pt-4">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gray-400)' }}>
                                                    Items
                                                </h4>
                                                <div className="space-y-2">
                                                    {order.items.map((item, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <span style={{ color: 'var(--foreground)' }}>
                                                                {item.product.title}
                                                                {item.quantity > 1 && (
                                                                    <span style={{ color: 'var(--gray-400)' }}> × {item.quantity}</span>
                                                                )}
                                                            </span>
                                                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                                ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Totals */}
                                            <div className="space-y-1 text-sm" style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px' }}>
                                                <div className="flex justify-between" style={{ color: 'var(--gray-500)' }}>
                                                    <span>Subtotal</span>
                                                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between" style={{ color: 'var(--gray-500)' }}>
                                                    <span>Shipping</span>
                                                    <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString('en-IN')}`}</span>
                                                </div>
                                                <div className="flex justify-between" style={{ color: 'var(--gray-500)' }}>
                                                    <span>Tax</span>
                                                    <span>₹{order.tax.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div
                                                    className="flex justify-between font-bold pt-1"
                                                    style={{ color: 'var(--foreground)', borderTop: '1px solid var(--gray-200)' }}
                                                >
                                                    <span>Total</span>
                                                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            {/* View Full Details */}
                                            <div className="pt-2">
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                                                    style={{ color: 'var(--accent)' }}
                                                >
                                                    View Full Details
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                        <polyline points="12 5 19 12 12 19" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
