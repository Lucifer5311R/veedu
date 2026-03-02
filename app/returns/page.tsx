import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const sections = [
    {
        title: 'Return Eligibility',
        content: 'Items are eligible for return within 14 days of delivery. Products must be unused, in original condition, and in original packaging. Items damaged due to misuse or normal wear are not eligible.',
    },
    {
        title: 'Non-Returnable Items',
        content: 'The following cannot be returned: items marked "Final Sale", perishable goods, and items that have been opened/used (unless defective). Custom or personalized orders are also non-returnable.',
    },
    {
        title: 'How to Initiate a Return',
        content: 'Step 1: Contact us via WhatsApp (+91 98470 00000) or the Contact page within 14 days of delivery. Step 2: Share your order details and a photo of the item. Step 3: Our team will arrange a pickup from your address in Kerala within 2–3 business days.',
    },
    {
        title: 'Refund Process',
        content: 'Once the returned item is received and inspected, we will process your refund within 5–7 business days. Refunds are credited to the original payment method (UPI). You will receive a confirmation on WhatsApp.',
    },
    {
        title: 'Damaged or Defective Items',
        content: 'If you receive a damaged or defective product, contact us within 48 hours of delivery with a photo. We will arrange an immediate replacement or full refund at no extra cost to you.',
    },
    {
        title: 'Exchange Policy',
        content: 'We currently offer exchanges for size or colour variants of the same product. Contact our team within 14 days to initiate an exchange. Shipping for exchange items is free.',
    },
    {
        title: 'Cancellations',
        content: 'Orders can be cancelled before dispatch at no charge. Once dispatched, cancellations are not possible — please initiate a return after delivery. Contact us immediately if you need to cancel an order.',
    },
];

export default function ReturnsPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Returns & Refunds</h1>
                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Last updated: February 2026</p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl mb-8" style={{ backgroundColor: 'var(--green-light)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
                        14-day hassle-free returns on all eligible products
                    </p>
                </div>

                <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid var(--gray-200)' }}>
                    {sections.map((section, i) => (
                        <div key={section.title} className="p-6 sm:p-8" style={{ borderBottom: i < sections.length - 1 ? '1px solid var(--gray-200)' : 'none', backgroundColor: 'var(--white)' }}>
                            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--foreground)' }}>{section.title}</h2>
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--gray-500)' }}>{section.content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl flex items-start gap-4" style={{ backgroundColor: '#FFF0E6' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        Need help with a return? <Link href="/contact" className="font-semibold underline" style={{ color: 'var(--accent)' }}>Contact us</Link> — our team will guide you through the process.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
