'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/lib/types';

const statusSteps: { key: Order['status']; label: string; icon: string }[] = [
    { key: 'pending', label: 'Pending', icon: '🕐' },
    { key: 'paid', label: 'Paid', icon: '💳' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
];

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        fetch(`/api/orders?id=${orderId}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => setOrder(data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [orderId]);

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const currentStepIndex = order
        ? statusSteps.findIndex(s => s.key === order.status)
        : -1;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Link */}
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--gray-500)' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Orders
                </Link>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div
                            className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
                            style={{ borderColor: 'var(--gray-200)', borderTopColor: 'var(--accent)' }}
                        />
                    </div>
                )}

                {/* Not Found */}
                {!loading && notFound && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                            Order Not Found
                        </h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--gray-400)' }}>
                            We couldn&apos;t find an order with ID &ldquo;{orderId}&rdquo;
                        </p>
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            Search Orders
                        </Link>
                    </div>
                )}

                {/* Order Detail */}
                {!loading && order && (
                    <div className="space-y-6">
                        {/* Header Card */}
                        <div
                            className="rounded-3xl p-6 sm:p-8"
                            style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--gray-200)',
                            }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <div>
                                    <h1
                                        className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {order.id}
                                    </h1>
                                    <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
                                        Placed on {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                {order.upiTransactionId && (
                                    <span className="text-xs font-medium" style={{ color: 'var(--gray-400)' }}>
                                        UPI: {order.upiTransactionId}
                                    </span>
                                )}
                            </div>

                            {/* Status Timeline */}
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    {statusSteps.map((step, i) => {
                                        const isCompleted = i <= currentStepIndex;
                                        const isCurrent = i === currentStepIndex;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                                                <div
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-300"
                                                    style={{
                                                        backgroundColor: isCompleted ? 'var(--green-light)' : 'var(--gray-100, #F3F4F6)',
                                                        border: isCurrent ? '2px solid var(--green)' : '2px solid transparent',
                                                    }}
                                                >
                                                    {step.icon}
                                                </div>
                                                <span
                                                    className="text-xs font-semibold mt-2 text-center"
                                                    style={{
                                                        color: isCompleted ? 'var(--green)' : 'var(--gray-400)',
                                                    }}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Progress bar behind icons */}
                                <div
                                    className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 -z-0"
                                    style={{ backgroundColor: 'var(--gray-200)' }}
                                >
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            backgroundColor: 'var(--green)',
                                            width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items Card */}
                        <div
                            className="rounded-3xl p-6 sm:p-8"
                            style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--gray-200)',
                            }}
                        >
                            <h3
                                className="text-sm font-semibold uppercase tracking-wider mb-4"
                                style={{ color: 'var(--gray-400)' }}
                            >
                                Items Ordered
                            </h3>
                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-3"
                                        style={{ borderBottom: i < order.items.length - 1 ? '1px solid var(--gray-200)' : 'none' }}
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                                                {item.product.title}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>
                                                Qty: {item.quantity} × ₹{item.product.sellingPrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                                            ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-4 pt-4 space-y-2 text-sm" style={{ borderTop: '1px solid var(--gray-200)' }}>
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
                                    className="flex justify-between text-base font-bold pt-2"
                                    style={{ color: 'var(--foreground)', borderTop: '1px solid var(--gray-200)' }}
                                >
                                    <span>Total</span>
                                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Address Card */}
                        <div
                            className="rounded-3xl p-6 sm:p-8"
                            style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--gray-200)',
                            }}
                        >
                            <h3
                                className="text-sm font-semibold uppercase tracking-wider mb-4"
                                style={{ color: 'var(--gray-400)' }}
                            >
                                Delivery Address
                            </h3>
                            <div className="space-y-1 text-sm" style={{ color: 'var(--foreground)' }}>
                                <p className="font-semibold">{order.customer.name}</p>
                                <p style={{ color: 'var(--gray-500)' }}>{order.customer.address}</p>
                                <p style={{ color: 'var(--gray-500)' }}>
                                    {order.customer.city}, {order.customer.state} — {order.customer.pincode}
                                </p>
                                <p className="pt-1" style={{ color: 'var(--gray-500)' }}>
                                    📞 {order.customer.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
