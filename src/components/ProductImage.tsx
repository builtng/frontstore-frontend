'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

export interface ProductImageProps {
  src?: string | null;
  alt: string;
  aspectRatio?: '4/5' | '1/1' | '3/4' | '16/9' | string;
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
  aspectRatio = '4/5',
  className = '',
  containerClassName = '',
  fallbackIcon,
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  padding = '0px',
  backgroundColor = '#f8f8f8',
  borderRadius = '12px',
  unoptimized = true,
  onClick,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Normalize ratio string into a CSS style format if needed
  const getAspectRatioStyle = (ratio: string): string => {
    if (ratio === '4/5') return '4 / 5';
    if (ratio === '1/1') return '1 / 1';
    if (ratio === '3/4') return '3 / 4';
    if (ratio === '16/9') return '16 / 9';
    return ratio;
  };

  const cleanSrc = src ? src.trim() : null;
  const showFallback = !cleanSrc || hasError;

  return (
    <div
      className={`fs-product-image__container relative overflow-hidden flex items-center justify-center transition-all duration-200 ${containerClassName}`}
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
        <div className="absolute inset-0 bg-neutral-200 animate-pulse z-0" />
      )}

      {/* Fallback View when image is missing or failed */}
      {showFallback ? (
        <div className="flex flex-col items-center justify-center p-4 text-neutral-400 z-10 w-full h-full">
          {fallbackIcon || <ShoppingBag className="w-8 h-8 opacity-60" strokeWidth={1.5} />}
        </div>
      ) : (
        <div
          className="relative w-full h-full z-10"
          style={{ padding: typeof padding === 'number' ? `${padding}px` : padding }}
        >
          <Image
            src={cleanSrc!}
            alt={alt || 'Product Image'}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={unoptimized}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className={`object-contain object-center transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${className}`}
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        </div>
      )}
    </div>
  );
}
