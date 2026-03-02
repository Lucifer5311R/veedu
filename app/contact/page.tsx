'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Contact Us</h1>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>We&apos;re here to help. Reach out via form, WhatsApp, or email.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {[
                            {
                                icon: (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                ),
                                label: 'WhatsApp',
                                value: '+91 98470 00000',
                                href: 'https://wa.me/919847000000',
                            },
                            {
                                icon: (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                ),
                                label: 'Email',
                                value: 'hello@veedu.store',
                                href: 'mailto:hello@veedu.store',
                            },
                            {
                                icon: (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                ),
                                label: 'Location',
                                value: 'Kerala, India',
                                href: null,
                            },
                        ].map(item => (
                            <div key={item.label} className="flex items-start gap-4 p-5 rounded-2xl" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--gray-400)' }}>{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--foreground)' }}>{item.value}</a>
                                    ) : (
                                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--green-light)', border: '1px solid var(--green)' }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--green)' }}>Support Hours</p>
                            <p className="text-sm" style={{ color: 'var(--foreground)' }}>Monday – Saturday: 9 AM – 7 PM</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>WhatsApp support available 24/7 for urgent queries.</p>
                        </div>
                    </div>

                    {/* Form */}
                    {submitted ? (
                        <div className="flex flex-col items-center justify-center py-16 rounded-3xl" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--green-light)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Message Sent!</h2>
                            <p className="text-sm text-center" style={{ color: 'var(--gray-500)' }}>We&apos;ll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <div className="rounded-3xl p-6 sm:p-8" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-lg)' }}>
                            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Send a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Name *</label>
                                        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }} placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Phone *</label>
                                        <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }} placeholder="Mobile number" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }} placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray-600)' }}>Message *</label>
                                    <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ border: '1px solid var(--gray-200)', color: 'var(--foreground)' }}
                                        placeholder="How can we help you?" />
                                </div>
                                <button type="submit" className="w-full py-4 rounded-full text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-lg)]"
                                    style={{ backgroundColor: 'var(--accent)' }}>
                                    Send Message
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
