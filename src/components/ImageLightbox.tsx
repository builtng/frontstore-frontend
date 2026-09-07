'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image';

export interface ImageLightboxProps {
    open: boolean;
    images: (string | null | undefined)[];
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
    const [mounted, setMounted] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Filter out null / empty images
    const validImages = React.useMemo(() => {
        return (images || []).filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
    }, [images]);

    const activeIndex = Math.min(Math.max(0, index), Math.max(0, validImages.length - 1));

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset zoom level whenever slide changes
    useEffect(() => {
        setIsZoomed(false);
    }, [activeIndex]);

    const goPrev = useCallback(() => {
        if (validImages.length <= 1) return;
        onIndexChange((activeIndex - 1 + validImages.length) % validImages.length);
    }, [activeIndex, validImages.length, onIndexChange]);

    const goNext = useCallback(() => {
        if (validImages.length <= 1) return;
        onIndexChange((activeIndex + 1) % validImages.length);
    }, [activeIndex, validImages.length, onIndexChange]);

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

    // Handle touch swipes for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const diff = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;
        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) {
                // Swiped Left -> Next
                goNext();
            } else {
                // Swiped Right -> Prev
                goPrev();
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!mounted || !open || validImages.length === 0) return null;

    const rawUrl = validImages[activeIndex] || '';
    const hasFailedOptimized = failedUrls[rawUrl];
    const imageSrc = hasFailedOptimized ? rawUrl : (getOptimizedImageUrl(rawUrl, 'lg') || rawUrl);

    const lightboxContent = (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999999,
                background: 'rgba(7, 9, 13, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fsLightboxFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                userSelect: 'none',
                overflow: 'hidden',
            }}
        >
            <style>{`
                @keyframes fsLightboxFadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            {/* Top Controls Bar */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: 18,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 20,
                    pointerEvents: 'none',
                }}
            >
                {/* Counter / Title */}
                <div
                    style={{
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '6px 14px',
                        borderRadius: 24,
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                    }}
                >
                    <span>{activeIndex + 1}</span>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <span>{validImages.length}</span>
                </div>

                {/* Actions: Zoom Toggle & Close */}
                <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        type="button"
                        onClick={() => setIsZoomed((prev) => !prev)}
                        aria-label={isZoomed ? "Reset zoom" : "Zoom in"}
                        title={isZoomed ? "Reset zoom" : "Zoom in"}
                        style={{
                            width: 42,
                            height: 42,
                            display: 'grid',
                            placeItems: 'center',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: isZoomed ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                            transition: 'all 0.18s ease',
                        }}
                    >
                        {isZoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Exit full screen (Esc)"
                        title="Exit full screen (Esc)"
                        style={{
                            width: 42,
                            height: 42,
                            display: 'grid',
                            placeItems: 'center',
                            border: '1px solid rgba(255,255,255,0.24)',
                            background: 'rgba(255, 255, 255, 0.14)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                            transition: 'all 0.18s ease',
                        }}
                    >
                        <X size={20} strokeWidth={2.4} />
                    </button>
                </div>
            </div>

            {/* Navigation Chevron: Prev */}
            {validImages.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                    }}
                    aria-label="Previous image"
                    title="Previous (Left arrow)"
                    style={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 48,
                        height: 48,
                        display: 'grid',
                        placeItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        background: 'rgba(255, 255, 255, 0.14)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        transition: 'transform 0.16s ease, background 0.16s ease',
                        zIndex: 20,
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Main Image Container */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed((prev) => !prev);
                }}
                style={{
                    maxWidth: isZoomed ? 'none' : 'min(92vw, 1100px)',
                    maxHeight: isZoomed ? 'none' : '86vh',
                    width: isZoomed ? 'auto' : undefined,
                    height: isZoomed ? 'auto' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                    padding: 16,
                    overflow: 'visible',
                }}
            >
                <img
                    src={imageSrc}
                    alt={`${alt} - ${activeIndex + 1} of ${validImages.length}`}
                    onError={() => {
                        if (!hasFailedOptimized) {
                            setFailedUrls((prev) => ({ ...prev, [rawUrl]: true }));
                        }
                    }}
                    style={{
                        maxWidth: isZoomed ? '90vw' : 'min(92vw, 1100px)',
                        maxHeight: isZoomed ? '90vh' : '84vh',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 12,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        pointerEvents: 'auto',
                    }}
                />
            </div>

            {/* Navigation Chevron: Next */}
            {validImages.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                    }}
                    aria-label="Next image"
                    title="Next (Right arrow)"
                    style={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 48,
                        height: 48,
                        display: 'grid',
                        placeItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        background: 'rgba(255, 255, 255, 0.14)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        transition: 'transform 0.16s ease, background 0.16s ease',
                        zIndex: 20,
                    }}
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {/* Bottom thumbnail dots / strip if more than 1 image */}
            {validImages.length > 1 && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(15, 18, 24, 0.65)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        padding: '8px 14px',
                        borderRadius: 30,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        zIndex: 20,
                        maxWidth: '90vw',
                        overflowX: 'auto',
                    }}
                >
                    {validImages.map((img, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onIndexChange(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            style={{
                                width: i === activeIndex ? 24 : 10,
                                height: 10,
                                borderRadius: 5,
                                background: i === activeIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                padding: 0,
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return createPortal(lightboxContent, document.body);
}
