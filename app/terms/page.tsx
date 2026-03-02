import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Terms of Service</h1>
                    <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Last updated: February 2026</p>
                </div>

                <div className="space-y-6" style={{ color: 'var(--gray-600)' }}>
                    {[
                        {
                            title: '1. Acceptance of Terms',
                            content: 'By accessing or using Veedu ("the Store"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
                        },
                        {
                            title: '2. Eligibility',
                            content: 'You must be at least 18 years old to place an order. By using the Store, you represent that you meet this requirement. Delivery is available only to addresses within Kerala, India.',
                        },
                        {
                            title: '3. Product Listings',
                            content: 'We strive to keep product descriptions and prices accurate. However, we reserve the right to correct any errors and cancel orders if products were incorrectly priced. You will be notified and fully refunded in such cases.',
                        },
                        {
                            title: '4. Orders & Payment',
                            content: 'Orders are confirmed once payment is completed via UPI. We reserve the right to cancel orders due to stock unavailability, incorrect pricing, or suspected fraud. Payments are non-refundable except as described in our Returns & Refunds policy.',
                        },
                        {
                            title: '5. Delivery',
                            content: 'Delivery timelines are estimates and not guarantees. We are not responsible for delays caused by courier services, weather, or circumstances beyond our control. Refer to our Shipping Policy for details.',
                        },
                        {
                            title: '6. Returns & Refunds',
                            content: 'Returns and refunds are governed by our Returns & Refunds Policy, which is incorporated by reference into these terms.',
                        },
                        {
                            title: '7. Intellectual Property',
                            content: 'All content on this website including product images, text, and branding are the property of Veedu. You may not reproduce, distribute, or use any content without prior written permission.',
                        },
                        {
                            title: '8. Limitation of Liability',
                            content: 'Veedu is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability in any case shall not exceed the value of the order in dispute.',
                        },
                        {
                            title: '9. Governing Law',
                            content: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Kerala, India.',
                        },
                        {
                            title: '10. Contact',
                            content: 'For questions about these terms, contact us at hello@veedu.store.',
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
