import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Privacy Policy</h1>
                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Last updated: February 2026</p>
                </div>

                <div className="space-y-8" style={{ color: 'var(--gray-600)' }}>
                    {[
                        {
                            title: '1. Information We Collect',
                            content: 'When you place an order or contact us, we collect: your name, phone number, delivery address, and email (if provided). We do not collect payment credentials — all UPI transactions are handled by your UPI app.',
                        },
                        {
                            title: '2. How We Use Your Information',
                            content: 'We use your information exclusively to: process and deliver your orders, send order confirmations and tracking updates via WhatsApp, respond to your queries, and improve our service. We do not sell or share your personal data with third parties.',
                        },
                        {
                            title: '3. Data Storage',
                            content: 'Order information is stored securely on our servers. We retain order data for up to 3 years for support and legal compliance purposes. You may request deletion of your data by contacting us.',
                        },
                        {
                            title: '4. Cookies',
                            content: 'Our website uses minimal cookies for session management (to keep you logged in) and cart persistence (localStorage). We do not use tracking or advertising cookies.',
                        },
                        {
                            title: '5. WhatsApp Communication',
                            content: 'By providing your phone number, you consent to receive order-related WhatsApp messages from Veedu. You may opt out at any time by contacting us. We do not send unsolicited promotional messages without consent.',
                        },
                        {
                            title: '6. Your Rights',
                            content: 'You have the right to: access your personal data we hold, request correction of inaccurate data, request deletion of your data, and opt out of marketing communications. Contact us at hello@veedu.store to exercise these rights.',
                        },
                        {
                            title: '7. Changes to This Policy',
                            content: 'We may update this privacy policy from time to time. Any significant changes will be communicated via our website. Continued use of our service after changes constitutes acceptance of the updated policy.',
                        },
                        {
                            title: '8. Contact',
                            content: 'For privacy-related queries, contact us at: hello@veedu.store or via WhatsApp at +91 98470 00000.',
                        },
                    ].map(section => (
                        <div key={section.title} className="rounded-2xl p-6" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
                            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--foreground)' }}>{section.title}</h2>
                            <p className="text-sm leading-relaxed">{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
