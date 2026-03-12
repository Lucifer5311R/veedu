'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast, { type ToastData } from '@/components/Toast';

const MAX_TOASTS = 5;

interface ToastContextType {
    showToast: (message: string, type?: ToastData['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        setToasts((prev) => {
            const next = [...prev, { id, message, type }];
            return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
        });
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast container — fixed bottom-right, stacking upward */}
            <div
                aria-live="polite"
                aria-label="Notifications"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: '10px',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            >
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
