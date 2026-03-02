'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const faqs = [
    {
        category: 'Orders & Delivery',
        items: [
            { q: 'Where do you deliver?', a: 'We currently deliver only within Kerala. All pincodes from 670001 to 695615 are covered. We plan to expand to other states soon.' },
            { q: 'How long does delivery take?', a: 'Standard delivery takes 2–4 business days. Express delivery (1–2 days) is available for select areas in Thiruvananthapuram, Kochi, and Kozhikode.' },
            { q: 'How can I track my order?', a: 'Once your order is dispatched, you will receive a WhatsApp message with a tracking link. You can also contact our support team for updates.' },
            { q: 'Is there a minimum order value?', a: 'No minimum order value for retail purchases. For bulk orders, a minimum of ₹1,000 applies.' },
        ],
    },
    {
        category: 'Payments',
        items: [
            { q: 'What payment methods do you accept?', a: 'We accept UPI payments (GPay, PhonePe, Paytm, BHIM UPI). We are working on adding card and net banking support.' },
            { q: 'Is my payment secure?', a: 'All UPI transactions are processed securely through your UPI app. We never store your UPI PIN or bank credentials.' },
            { q: 'Can I get an invoice?', a: 'Yes. You can request a GST invoice by contacting us via the contact page after placing your order.' },
        ],
    },
    {
        category: 'Returns & Refunds',
        items: [
            { q: 'What is your return policy?', a: 'We offer 14-day hassle-free returns on all products. Items must be unused and in original packaging.' },
            { q: 'How do I initiate a return?', a: 'Contact us via WhatsApp or the Contact page within 14 days of delivery with your order details and reason for return.' },
            { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days of receiving the returned item. Amount is credited to your original payment method.' },
        ],
    },
    {
        category: 'Products',
        items: [
            { q: 'Are the products original?', a: 'Yes. All products are sourced from reputable suppliers and are 100% authentic. We personally verify quality before listing.' },
            { q: 'Can I request a specific product?', a: 'Absolutely! Use the Contact page to request specific products. If we can source it, we will list it within 3–5 days.' },
            { q: 'Do products come with warranty?', a: 'Most kitchen utility items have a 6-month manufacturer warranty. Check individual product descriptions for warranty details.' },
        ],
    },
];

export default function FAQPage() {
    const [openItem, setOpenItem] = useState<string | null>(null);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--foreground)' }}>Frequently Asked Questions</h1>
                    <p className="text-base" style={{ color: 'var(--gray-500)' }}>Can&apos;t find your answer? <a href="/contact" className="font-semibold underline" style={{ color: 'var(--accent)' }}>Contact us</a></p>
                </div>

                <div className="space-y-8">
                    {faqs.map(section => (
                        <div key={section.category}>
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 px-1" style={{ color: 'var(--accent)' }}>{section.category}</h2>
                            <div className="space-y-2">
                                {section.items.map(item => {
                                    const key = `${section.category}-${item.q}`;
                                    const isOpen = openItem === key;
                                    return (
                                        <div key={key} className="rounded-2xl overflow-hidden transition-all" style={{ border: '1px solid var(--gray-200)', backgroundColor: 'var(--white)' }}>
                                            <button
                                                onClick={() => setOpenItem(isOpen ? null : key)}
                                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                                            >
                                                <span className="text-sm font-semibold pr-4" style={{ color: 'var(--foreground)' }}>{item.q}</span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </button>
                                            {isOpen && (
                                                <div className="px-5 pb-5">
                                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--gray-500)' }}>{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
