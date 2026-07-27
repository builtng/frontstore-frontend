'use client';

import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImageLightboxProps {
    open: boolean;
    images: string[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
    alt?: string;
}

export default function ImageLightbox({
    open,
    images,
    index,
    onIndexChange,
    onClose,
    alt = 'Product image',
}: ImageLightboxProps) {
    const goPrev = useCallback(() => {
        onIndexChange((index - 1 + images.length) % images.length);
    }, [index, images.length, onIndexChange]);

    const goNext = useCallback(() => {
        onIndexChange((index + 1) % images.length);
    }, [index, images.length, onIndexChange]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', onKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose, goPrev, goNext]);

    if (!open || images.length === 0) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3000,
                background: 'rgba(10, 10, 12, 0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close full image view"
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 40,
                    height: 40,
                    display: 'grid',
                    placeItems: 'center',
                    border: 'none',
                    background: 'rgba(255,255,255,.12)',
                    color: '#fff',
                    borderRadius: '50%',
                    cursor: 'pointer',
                }}
            >
                <X size={20} />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); goPrev(); }}
                        aria-label="Previous image"
                        style={{
                            position: 'absolute',
                            left: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 44,
                            height: 44,
                            display: 'grid',
                            placeItems: 'center',
                            border: 'none',
                            background: 'rgba(255,255,255,.12)',
                            color: '#fff',
                            borderRadius: '50%',
                            cursor: 'pointer',
                        }}
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); goNext(); }}
                        aria-label="Next image"
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 44,
                            height: 44,
                            display: 'grid',
                            placeItems: 'center',
                            border: 'none',
                            background: 'rgba(255,255,255,.12)',
                            color: '#fff',
                            borderRadius: '50%',
                            cursor: 'pointer',
                        }}
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            <img
                src={images[index]}
                alt={`${alt} - ${index + 1} of ${images.length}`}
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: 'min(92vw, 1100px)',
                    maxHeight: '86vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 8,
                }}
            />

            {images.length > 1 && (
                <span
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        background: 'rgba(255,255,255,.12)',
                        padding: '5px 12px',
                        borderRadius: 20,
                    }}
                >
                    {index + 1} / {images.length}
                </span>
            )}
        </div>
    );
}
