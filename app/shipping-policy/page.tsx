import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
    {
        title: 'Delivery Zone',
        content: 'Veedu currently delivers exclusively within Kerala. All pincodes between 670001 and 695615 are eligible for delivery. We do not ship to other states at this time.',
    },
    {
        title: 'Delivery Timeframes',
        content: 'Standard delivery: 2–4 business days after order confirmation. Express delivery (select areas in Thiruvananthapuram, Kochi, Kozhikode): 1–2 business days. Orders placed before 12 PM on business days are processed the same day.',
    },
    {
        title: 'Shipping Charges',
        content: 'All orders are shipped FREE of charge regardless of order value or quantity. There are no hidden delivery fees at checkout.',
    },
    {
        title: 'Order Tracking',
        content: 'Once your order is dispatched, you will receive a WhatsApp notification with a tracking link. You can also contact our support team via WhatsApp or the Contact page for real-time updates.',
    },
    {
        title: 'Packaging',
        content: 'All items are securely packed with protective materials to prevent damage during transit. Fragile items receive extra padding and foam wrapping.',
    },
    {
        title: 'Delivery Attempts',
        content: 'Our delivery partner will attempt delivery up to 2 times. If the order cannot be delivered, you will be contacted via phone/WhatsApp to reschedule. Undelivered orders will be returned after 5 days.',
    },
    {
        title: 'Bulk Orders',
        content: 'For bulk orders (10+ units), special delivery arrangements may apply. Contact us through the Bulk Order page for custom shipping timelines.',
    },
];

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Shipping Policy</h1>
                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Last updated: February 2026</p>
                </div>

                <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid var(--gray-200)' }}>
                    {sections.map((section, i) => (
                        <div key={section.title} className="p-6 sm:p-8" style={{ borderBottom: i < sections.length - 1 ? '1px solid var(--gray-200)' : 'none', backgroundColor: 'var(--white)' }}>
                            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--foreground)' }}>{section.title}</h2>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray-500)' }}>{section.content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl flex items-start gap-4" style={{ backgroundColor: 'var(--green-light)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        Questions about your shipment? <Link href="/contact" className="font-semibold underline" style={{ color: 'var(--green)' }}>Contact our support team</Link> — we typically respond within 2 hours on business days.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
