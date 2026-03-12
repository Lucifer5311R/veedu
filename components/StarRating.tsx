'use client';

import React, { useState } from 'react';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const sizeMap = { sm: 14, md: 18, lg: 24 } as const;

function StarIcon({ filled, half, size }: { filled: boolean; half: boolean; size: number }) {
    const id = React.useId();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {half && (
                <defs>
                    <linearGradient id={`half-${id}`}>
                        <stop offset="50%" stopColor="var(--accent)" />
                        <stop offset="50%" stopColor="var(--gray-300)" />
                    </linearGradient>
                </defs>
            )}
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                fill={half ? `url(#half-${id})` : filled ? 'var(--accent)' : 'var(--gray-300)'}
            />
        </svg>
    );
}

export default function StarRating({
    rating,
    maxStars = 5,
    size = 'md',
    interactive = false,
    onChange,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);
    const px = sizeMap[size];
    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

    return (
        <div
            className="inline-flex items-center gap-0.5"
            onMouseLeave={() => interactive && setHoverRating(0)}
        >
            {Array.from({ length: maxStars }, (_, i) => {
                const starIndex = i + 1;
                const filled = displayRating >= starIndex;
                const half = !filled && displayRating >= starIndex - 0.5;

                return (
                    <span
                        key={i}
                        className={interactive ? 'cursor-pointer transition-transform duration-150 hover:scale-110' : ''}
                        onMouseEnter={() => interactive && setHoverRating(starIndex)}
                        onClick={() => interactive && onChange?.(starIndex)}
                        role={interactive ? 'button' : undefined}
                        aria-label={interactive ? `Rate ${starIndex} star${starIndex > 1 ? 's' : ''}` : undefined}
                    >
                        <StarIcon filled={filled} half={half} size={px} />
                    </span>
                );
            })}
        </div>
    );
}
