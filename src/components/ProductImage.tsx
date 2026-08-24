'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { getOptimizedImageUrl, ImageSizeVariant } from '@/lib/image';

export interface ProductImageProps {
  src?: string | null;
  alt: string;
  variant?: ImageSizeVariant;
  aspectRatio?: '4/5' | '1/1' | '3/4' | '16/9' | string;
  fit?: 'cover' | 'contain';
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
  padding?: string | number;
  backgroundColor?: string;
  borderRadius?: string;
  unoptimized?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ProductImage({
  src,
  alt,
  variant = 'md',
  aspectRatio = '4/5',
  fit = 'cover',
  className = '',
  containerClassName = '',
  fallbackIcon,
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  padding = '0px',
  backgroundColor,
  borderRadius,
  unoptimized = false,
  onClick,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [useUnoptimizedFallback, setUseUnoptimizedFallback] = useState<boolean>(unoptimized);

  // Normalize ratio string into a CSS style format if needed
  const getAspectRatioStyle = (ratio: string): string => {
    if (ratio === '4/5') return '4 / 5';
    if (ratio === '1/1') return '1 / 1';
    if (ratio === '3/4') return '3 / 4';
    if (ratio === '16/9') return '16 / 9';
    return ratio;
  };

  const optimizedSrc = src ? getOptimizedImageUrl(src, variant) : null;
  const cleanSrc = optimizedSrc ? optimizedSrc.trim() : null;
  const showFallback = !cleanSrc || hasError;

  return (
    <div
      className={`fs-product-image__container relative overflow-hidden flex items-center justify-center transition-all duration-300 bg-neutral-100 dark:bg-neutral-800 ${containerClassName}`}
      style={{
        aspectRatio: getAspectRatioStyle(aspectRatio),
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        width: '100%',
        position: 'relative',
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    >
      {/* Loading Skeleton Shimmer */}
      {isLoading && !showFallback && (
        <div className="absolute inset-0 bg-neutral-200/80 dark:bg-neutral-800 animate-pulse z-0" />
      )}

      {/* Fallback View when image is missing or failed */}
      {showFallback ? (
        <div className="flex flex-col items-center justify-center p-4 text-neutral-400 dark:text-neutral-500 z-10 w-full h-full bg-neutral-100 dark:bg-neutral-850">
          {fallbackIcon || <ShoppingBag className="w-8 h-8 opacity-40" strokeWidth={1.25} />}
        </div>
      ) : (
        <div
          className="relative w-full h-full z-10 overflow-hidden"
          style={{ padding: typeof padding === 'number' ? `${padding}px` : padding }}
        >
          <Image
            src={cleanSrc!}
            alt={alt || 'Product Image'}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            unoptimized={useUnoptimizedFallback}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              if (!useUnoptimizedFallback) {
                // Retry loading as unoptimized if Next.js image proxy fails for obscure URL
                setUseUnoptimizedFallback(true);
              } else {
                setIsLoading(false);
                setHasError(true);
              }
            }}
            className={`transition-all duration-500 ease-out ${
              fit === 'contain' ? 'object-contain' : 'object-cover'
            } object-center ${
              isLoading ? 'opacity-0 scale-102 blur-xs' : 'opacity-100 scale-100 blur-none'
            } ${className}`}
          />
        </div>
      )}
    </div>
  );
}
