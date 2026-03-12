'use client';

import React, { useEffect, useState } from 'react';

export interface ToastData {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
}

const icons: Record<ToastData['type'], React.ReactNode> = {
    success: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="var(--green)" />
            <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="var(--white)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    error: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="var(--accent)" />
            <path d="M6.5 6.5L11.5 11.5M11.5 6.5L6.5 11.5" stroke="var(--white)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    ),
    info: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="#3B82F6" />
            <text x="9" y="13" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">i</text>
        </svg>
    ),
};

export default function Toast({ toast, onDismiss }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const enterFrame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(enterFrame);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => handleDismiss(), 3000);
        return () => clearTimeout(timer);
    }, []);

    function handleDismiss() {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 280);
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'var(--white)',
                color: 'var(--foreground)',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: '14px',
                padding: '12px 16px',
                minWidth: '280px',
                maxWidth: '380px',
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
                fontSize: '14px',
                lineHeight: '1.4',
                pointerEvents: 'auto',
                transform: visible && !exiting ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
                opacity: visible && !exiting ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
                border: '1px solid rgba(0,0,0,0.06)',
            }}
        >
            <span style={{ flexShrink: 0, display: 'flex' }}>
                {icons[toast.type]}
            </span>

            <span style={{ flex: 1, wordBreak: 'break-word' }}>
                {toast.message}
            </span>

            <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--gray-400)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--foreground)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--gray-400)';
                    e.currentTarget.style.background = 'transparent';
                }}
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
}
