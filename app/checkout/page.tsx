'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/context/ToastProvider';
import { trackBeginCheckout, trackPurchase } from '@/lib/analytics';

interface FormErrors {
    phone?: string;
    pincode?: string;
}

export default function CheckoutPage() {
    const { items, total, itemCount, clearCart } = useCart();
    const { showToast } = useToast();
    const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const deliveryState = 'Kerala';

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        const phoneDigits = form.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
            newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
        }

        const pincode = form.pincode.trim();
        if (!/^\d{6}$/.test(pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        } else {
            const pin = parseInt(pincode, 10);
            if (pin < 670001 || pin > 695615) {
                newErrors.pincode = 'We only deliver within Kerala (670001–695615)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            trackBeginCheckout(total, itemCount);
            setStep('payment');
        }
    };

    const upiLink = `upi://pay?pa=veedu@upi&pn=Veedu%20Store&am=${total}&cu=INR&tn=VDU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const handlePaymentDone = async () => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(i => ({ product: i.product, quantity: i.quantity })),
                    total,
                    customer: { name: form.name, phone: form.phone, address: form.address, city: form.city, pincode: form.pincode, state: 'Kerala' },
                }),
            });
            if (res.ok) {
                const order = await res.json();
                setOrderId(order.id);
                trackPurchase(order.id, total, items.map(i => ({ id: i.product.id, title: i.product.title, price: i.product.sellingPrice, quantity: i.quantity })));
                showToast('Order placed successfully!');
            }
        } catch {
            showToast('Order saved locally', 'info');
        }
        clearCart();
        setStep('success');
    };

    if (itemCount === 0 && step !== 'success') {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
                <Navbar />
                <div className="max-w-xl mx-auto px-4 py-20 text-center">
                    <p className="text-xl font-semibold mb-2" style={{ color: 'var(--gray-400)' }}>Your cart is empty</p>
                    <p className="text-sm mb-6" style={{ color: 'var(--gray-400)' }}>
                        Add some products before checking out.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Progress */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {['Address', 'Payment', 'Done'].map((label, i) => {
                        const states = ['address', 'payment', 'success'];
                        const isActive = states.indexOf(step) >= i;
                        return (
                            <React.Fragment key={label}>
                                {i > 0 && <div className="w-12 h-px" style={{ backgroundColor: isActive ? 'var(--green)' : 'var(--gray-200)' }} />}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{
                                            backgroundColor: isActive ? 'var(--green)' : 'var(--gray-200)',
                                            color: isActive ? 'white' : 'var(--gray-400)',
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-medium hidden sm:inline" style={{ color: isActive ? 'var(--foreground)' : 'var(--gray-400)' }}>
                                        {label}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Address Step */}
                {step === 'address' && (
                    <div className="rounded-3xl p-6 sm:p-10 animate-fade-in transition-all duration-300" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-lg)' }}>
                        <h2 className="text-2xl font-extrabold tracking-tight mb-8" style={{ color: 'var(--foreground)' }}>Delivery Address</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-600)' }}>Full Name</label>
                                <input
                                    type="text" required
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                                    style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-600)' }}>Phone Number</label>
                                <input
                                    type="tel" required
                                    value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: undefined })); }}
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                                    style={{ border: `1px solid ${errors.phone ? '#ef4444' : 'var(--gray-200)'}`, color: 'var(--foreground)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                                    placeholder="10-digit mobile number"
                                    maxLength={13}
                                />
                                {errors.phone && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-600)' }}>Address</label>
                                <textarea
                                    required rows={3}
                                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                                    style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                                    placeholder="House/Flat No., Street, Area"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-600)' }}>City</label>
                                    <input
                                        type="text" required
                                        value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                                        style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-600)' }}>Pincode</label>
                                    <input
                                        type="text" required
                                        value={form.pincode} onChange={e => { setForm({ ...form, pincode: e.target.value }); setErrors(prev => ({ ...prev, pincode: undefined })); }}
                                        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                                        style={{ border: `1px solid ${errors.pincode ? '#ef4444' : 'var(--gray-200)'}`, color: 'var(--foreground)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                    />
                                    {errors.pincode && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{errors.pincode}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-600)' }}>State</label>
                                <div
                                    className="w-full px-4 py-3.5 rounded-xl text-sm flex items-center justify-between"
                                    style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-500)', border: '1px solid var(--gray-200)' }}
                                >
                                    {deliveryState}
                                    <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>
                                        Delivery Zone
                                    </span>
                                </div>
                                <p className="text-xs mt-1.5" style={{ color: 'var(--gray-400)' }}>
                                    Currently delivering within {deliveryState} only.
                                </p>
                            </div>

                            {/* Order Summary */}
                            <div className="pt-6 mt-6" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span style={{ color: 'var(--gray-500)' }}>{itemCount} items</span>
                                    <span className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--foreground)' }}>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-full text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-lg)]"
                                style={{ backgroundColor: 'var(--accent)' }}
                            >
                                Continue to Payment
                            </button>
                        </form>
                    </div>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                    <div className="rounded-2xl p-6 sm:p-8 text-center animate-fade-in" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Pay via UPI</h2>
                        <p className="text-sm mb-8" style={{ color: 'var(--gray-500)' }}>
                            Tap the button below to pay ₹{total.toLocaleString('en-IN')} using any UPI app.
                        </p>

                        <div className="inline-block mb-8 px-8 py-4 rounded-2xl" style={{ backgroundColor: 'var(--gray-100)' }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--gray-400)' }}>Amount to Pay</p>
                            <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>₹{total.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={upiLink}
                                className="flex items-center justify-center gap-3 w-full py-4 rounded-full text-base font-semibold text-white transition-all hover:scale-[1.02]"
                                style={{ backgroundColor: 'var(--green)' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                                Pay with UPI App
                            </a>
                            <button
                                onClick={handlePaymentDone}
                                className="w-full py-3 rounded-full text-sm font-semibold transition-colors"
                                style={{ color: 'var(--foreground)', border: '1px solid var(--gray-200)' }}
                            >
                                I&apos;ve completed the payment
                            </button>
                            <button
                                onClick={() => setStep('address')}
                                className="text-sm font-medium" style={{ color: 'var(--gray-400)' }}
                            >
                                ← Go back
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="rounded-2xl p-8 sm:p-12 text-center animate-slide-up" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Order Placed!</h2>
                        {orderId && (
                            <p className="text-sm font-mono mb-2 px-4 py-2 rounded-xl inline-block" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--foreground)' }}>{orderId}</p>
                        )}
                        <p className="text-sm mb-8" style={{ color: 'var(--gray-500)' }}>
                            Your order has been received. You&apos;ll get a WhatsApp confirmation shortly with tracking details.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {orderId && (
                                <Link
                                    href={`/orders/${orderId}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
                                    style={{ color: 'var(--accent)', border: '1px solid var(--accent)' }}
                                >
                                    Track Order
                                </Link>
                            )}
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
                                style={{ backgroundColor: 'var(--accent)' }}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}