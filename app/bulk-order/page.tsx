'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = ['Kitchen', 'Laundry', 'Home & Bath', 'Organization', 'Mixed / Other'];

export default function BulkOrderPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', category: '', quantity: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>For Resellers & Businesses</span>
                    <h1 className="text-4xl font-extrabold tracking-tight mt-2 mb-3" style={{ color: 'var(--foreground)' }}>Bulk Order Enquiry</h1>
                    <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--gray-500)' }}>
                        Get special pricing for bulk orders. We supply to retailers, homestays, and kitchen businesses across Kerala.
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    {[
                        { icon: '📦', title: 'MOQ 10 units', desc: 'Minimum order of just 10 units per SKU' },
                        { icon: '💰', title: 'Up to 25% off', desc: 'Tiered pricing for larger quantities' },
                        { icon: '🚚', title: 'Free delivery', desc: 'Free shipping on all bulk orders across Kerala' },
                    ].map(b => (
                        <div key={b.title} className="p-5 rounded-2xl text-center" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                            <div className="text-3xl mb-2">{b.icon}</div>
                            <p className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>{b.title}</p>
                            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{b.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Form */}
                {submitted ? (
                    <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Enquiry Received!</h2>
                        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                            We&apos;ll contact you within 24 hours on your phone or WhatsApp.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-3xl p-6 sm:p-10" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-lg)' }}>
                        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Submit Your Enquiry</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Full Name *</label>
                                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                        placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Phone / WhatsApp *</label>
                                    <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                        placeholder="10-digit number" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                        placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Product Category *</label>
                                    <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)', backgroundColor: 'var(--white)' }}>
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Estimated Quantity *</label>
                                <input type="text" required value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                    placeholder="e.g. 50 units, 100 pieces" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Message</label>
                                <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                    placeholder="Tell us about your requirements, business type, or any specific products you need." />
                            </div>
                            <button type="submit"
                                className="w-full py-4 rounded-full text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-lg)]"
                                style={{ backgroundColor: 'var(--accent)' }}>
                                Submit Enquiry
                            </button>
                        </form>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
