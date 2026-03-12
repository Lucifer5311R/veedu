'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const values = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        ),
        title: 'Quality First',
        description: 'Every product is hand-picked and quality tested before it reaches your home. We never compromise on durability or usability.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        ),
        title: 'Affordable Pricing',
        description: 'Fair markup, no middlemen inflation. We source directly and pass the savings on to you — quality essentials at honest prices.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        ),
        title: 'Kerala Focused',
        description: 'Local delivery, local support, and a deep understanding of what Kerala homes need. Built by Keralites, for Kerala.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        ),
        title: 'Customer Care',
        description: 'WhatsApp support, easy returns, and a hassle-free experience from browsing to delivery. Your satisfaction drives everything we do.',
    },
];

const stats = [
    { value: '500+', label: 'Products' },
    { value: '1000+', label: 'Happy Customers' },
    { value: 'Kerala-wide', label: 'Delivery' },
    { value: '24hr', label: 'Support' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="text-center animate-fade-in">
                    <span
                        className="inline-block text-xs font-semibold tracking-widest uppercase mb-4"
                        style={{ color: 'var(--accent)' }}
                    >
                        Our Story
                    </span>
                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
                        style={{ color: 'var(--foreground)' }}
                    >
                        About <span style={{ color: 'var(--green)' }}>Veedu</span>
                    </h1>
                    <p
                        className="text-base lg:text-xl leading-relaxed max-w-2xl mx-auto text-balance"
                        style={{ color: 'var(--gray-500)' }}
                    >
                        Bringing quality home essentials to Kerala — one carefully curated product at a time.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div
                    className="rounded-3xl p-8 sm:p-12 lg:p-16 animate-fade-in"
                    style={{
                        backgroundColor: 'var(--green-light)',
                        animationDelay: '100ms',
                    }}
                >
                    <div className="max-w-3xl mx-auto text-center">
                        <h2
                            className="text-3xl font-bold mb-6"
                            style={{ color: 'var(--foreground)' }}
                        >
                            &ldquo;Veedu&rdquo; means <span style={{ color: 'var(--green)' }}>Home</span> in Malayalam
                        </h2>
                        <div className="space-y-4">
                            <p
                                className="text-base leading-relaxed"
                                style={{ color: 'var(--gray-600)' }}
                            >
                                Veedu was born from a simple idea — every Kerala home deserves access to
                                quality, affordable home and kitchen essentials without the hassle of
                                sifting through endless options online. We started from a genuine passion
                                for organizing modern Indian kitchens and making everyday tasks a little
                                more joyful.
                            </p>
                            <p
                                className="text-base leading-relaxed"
                                style={{ color: 'var(--gray-600)' }}
                            >
                                Today, Veedu is a curated marketplace where every product is selected
                                with care — from highly absorbent kitchen cloths to airtight storage
                                containers, minimalist organizers, and smart laundry solutions. We believe
                                your home utility products should be functional, durable, and beautifully
                                designed.
                            </p>
                            <p
                                className="text-base leading-relaxed"
                                style={{ color: 'var(--gray-600)' }}
                            >
                                We&apos;re not just another online store. We&apos;re a small, passionate team
                                based in Kerala that personally tests and approves every item before it
                                reaches your doorstep. When you shop with Veedu, you&apos;re choosing quality
                                over quantity — and that makes all the difference.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2
                        className="text-3xl font-bold mb-2"
                        style={{ color: 'var(--foreground)' }}
                    >
                        What We Stand For
                    </h2>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>
                        The values that guide every decision we make.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((item, index) => (
                        <div
                            key={item.title}
                            className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                            style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--gray-200)',
                                boxShadow: 'var(--shadow-sm)',
                                animationDelay: `${index * 100}ms`,
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                                style={{ backgroundColor: 'var(--green-light)' }}
                            >
                                {item.icon}
                            </div>
                            <h3
                                className="text-base font-bold mb-2"
                                style={{ color: 'var(--foreground)' }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: 'var(--gray-500)' }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Numbers Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div
                    className="rounded-3xl p-8 sm:p-12"
                    style={{
                        backgroundColor: 'var(--foreground)',
                    }}
                >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="text-center animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <p
                                    className="text-3xl sm:text-4xl font-extrabold mb-1"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--gray-400)' }}
                                >
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="text-center animate-fade-in">
                    <h2
                        className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4"
                        style={{ color: 'var(--foreground)' }}
                    >
                        Ready to transform your <span style={{ color: 'var(--green)' }}>home</span>?
                    </h2>
                    <p
                        className="text-base leading-relaxed max-w-xl mx-auto mb-8"
                        style={{ color: 'var(--gray-500)' }}
                    >
                        Browse our curated collection of home and kitchen essentials.
                        Quality products, honest prices, delivered across Kerala.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-lg)]"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            Browse Catalog
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-4 text-sm font-medium transition-opacity hover:opacity-70"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
