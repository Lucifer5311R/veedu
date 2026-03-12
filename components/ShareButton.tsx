'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ShareButtonProps {
    title: string;
    url?: string;
    price?: number;
}

export default function ShareButton({ title, url, price }: ShareButtonProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const resolvedUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(resolvedUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setOpen(false);
            }, 1500);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = resolvedUrl;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setOpen(false);
            }, 1500);
        }
    }, [resolvedUrl]);

    const handleWhatsApp = useCallback(() => {
        const priceStr = price != null ? ` - ₹${price}` : '';
        const text = encodeURIComponent(`Check out ${title}${priceStr} at ${resolvedUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
        setOpen(false);
    }, [title, price, resolvedUrl]);

    return (
        <div ref={containerRef} className="relative inline-block">
            {/* Dropdown (above button) */}
            {open && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl overflow-hidden animate-fade-in"
                    style={{
                        backgroundColor: 'var(--white)',
                        border: '1px solid var(--gray-200)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gray-100)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        {copied ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span style={{ color: 'var(--green)' }}>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>
                    <div style={{ height: '1px', backgroundColor: 'var(--gray-200)' }} />
                    <button
                        onClick={handleWhatsApp}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gray-100)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Share on WhatsApp
                    </button>
                </div>
            )}

            {/* Trigger button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-110"
                style={{
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    boxShadow: 'var(--shadow-xs)',
                }}
                aria-label="Share"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gray-600)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
            </button>
        </div>
    );
}
