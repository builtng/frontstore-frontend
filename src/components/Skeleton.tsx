import React from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height, ...style }} />;
}

interface SkeletonGridProps {
  count?: number;
  itemHeight?: number;
  minColumnWidth?: number;
}

export function SkeletonGrid({ count = 4, itemHeight = 90, minColumnWidth = 220 }: SkeletonGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={itemHeight} style={{ borderRadius: 'var(--r-lg)' }} />
      ))}
    </div>
  );
}
