'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
}

function PlaceholderSVG() {
    return (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--gray-200)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--gray-400)" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="var(--gray-400)" />
                <path d="M21 15l-5-5L5 21" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState('center center');
    const [imgError, setImgError] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setOrigin(`${x}% ${y}%`);
    }, [isTouchDevice]);

    const handleMouseEnter = useCallback(() => {
        if (!isTouchDevice) setZoomed(true);
    }, [isTouchDevice]);

    const handleMouseLeave = useCallback(() => {
        if (!isTouchDevice) setZoomed(false);
    }, [isTouchDevice]);

    const handleTouchStart = useCallback(() => {
        setIsTouchDevice(true);
        setOrigin('center center');
        setZoomed((prev) => !prev);
    }, []);

    if (imgError) {
        return (
            <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: 'var(--radius-lg)' }}>
                <PlaceholderSVG />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden select-none ${className}`}
            style={{
                cursor: zoomed ? 'zoom-out' : 'zoom-in',
                borderRadius: 'var(--radius-lg)',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
        >
            <img
                src={src}
                alt={alt}
                draggable={false}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                style={{
                    transform: zoomed ? 'scale(2.5)' : 'scale(1)',
                    transformOrigin: origin,
                    transition: 'transform 0.3s var(--ease-smooth)',
                }}
            />
        </div>
    );
}
