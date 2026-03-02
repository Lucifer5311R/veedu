'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                redirect: false,
                username,
                password,
            });

            if (res?.error) {
                setError('Invalid admin credentials.');
            } else {
                router.push('/admin');
                router.refresh(); // Force Next.js to re-evaluate the auth state
            }
        } catch (err) {
            setError('An error occurred during sign in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-4 py-20">
                <div
                    className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[var(--shadow-xl)] animate-fade-in relative overflow-hidden"
                    style={{ border: '1px solid var(--gray-200)' }}
                >
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-10 filter blur-3xl" style={{ backgroundColor: 'var(--green)' }}></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-10 filter blur-3xl" style={{ backgroundColor: 'var(--accent)' }}></div>

                    <div className="relative z-10">
                        <div className="flex justify-center mb-8">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-[var(--shadow-md)]" style={{ backgroundColor: 'var(--green)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>Admin Access</h1>
                            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Enter your admin credentials to manage your catalog.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-slide-up" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-bold mb-2 ml-1" style={{ color: 'var(--gray-700)' }}>
                                    Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent)]" style={{ color: 'var(--gray-400)' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
                                        style={{
                                            backgroundColor: 'var(--gray-100)',
                                            color: 'var(--foreground)',
                                            border: '2px solid transparent'
                                        }}
                                        placeholder="admin username"
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-bold mb-2 ml-1" style={{ color: 'var(--gray-700)' }}>
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--accent)]" style={{ color: 'var(--gray-400)' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
                                        style={{
                                            backgroundColor: 'var(--gray-100)',
                                            color: 'var(--foreground)',
                                            border: '2px solid transparent'
                                        }}
                                        placeholder="••••••••••••"
                                        required
                                        autoComplete="current-password"
                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-lg)] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                style={{ backgroundColor: 'var(--accent)' }}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Secure Login
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link href="/" className="text-sm font-semibold transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--gray-500)' }}>
                                ← Return to Storefront
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
