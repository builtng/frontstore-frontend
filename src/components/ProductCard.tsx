'use client';

import React from 'react';
import ProductImage from './ProductImage';
import { ShoppingBag, Eye } from 'lucide-react';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug?: string;
    price: string | number;
    compare_at_price?: string | number | null;
    image_url?: string | null;
    image_urls?: string[] | null;
    stock_status?: string;
    category_id?: string | null;
    category_name?: string | null;
    stock_quantity?: number | null;
    [key: string]: any;
  };
  currencySymbol?: string;
  badge?: string | null;
  aspectRatio?: '4/5' | '1/1' | '3/4' | string;
  onView?: () => void;
  onBuy?: () => void;
  className?: string;
  showCategory?: boolean;
}

export default function ProductCard({
  product,
  currencySymbol = '₦',
  badge,
  aspectRatio = '4/5',
  onView,
  onBuy,
  className = '',
  showCategory = true,
}: ProductCardProps) {
  const imageUrl =
    (product.image_urls && product.image_urls.length > 0 && product.image_urls[0]) ||
    product.image_url ||
    null;

  const priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
  const comparePriceNum =
    product.compare_at_price
      ? typeof product.compare_at_price === 'number'
        ? product.compare_at_price
        : parseFloat(product.compare_at_price)
      : null;

  const isSoldOut =
    product.stock_status === 'out_of_stock' ||
    (product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0);

  const discountPercent =
    comparePriceNum && comparePriceNum > priceNum
      ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
      : null;

  const displayBadge = isSoldOut
    ? 'Sold Out'
    : badge || (discountPercent ? `-${discountPercent}%` : null);

  return (
    <div
      className={`fs-product-card group relative flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 ${className}`}
    >
      {/* Product Image Container */}
      <div className="relative w-full cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800" onClick={onView}>
        {/* Badge Pill */}
        {displayBadge && (
          <span
            className={`absolute top-2.5 left-2.5 z-20 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border shadow-sm backdrop-blur-md transition-transform duration-200 ${
              isSoldOut
                ? 'bg-neutral-900/90 text-neutral-200 border-neutral-700'
                : 'bg-emerald-600/90 text-white border-emerald-500/30'
            }`}
          >
            {displayBadge}
          </span>
        )}

        <ProductImage
          src={imageUrl}
          alt={product.name}
          aspectRatio={aspectRatio}
          fit="cover"
          padding={0}
          borderRadius="0px"
          className="transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick Action Overlay for Desktop */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
          {onView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              aria-label="Quick View"
              className="p-2.5 bg-white/95 dark:bg-neutral-900/95 text-neutral-800 dark:text-neutral-100 rounded-full shadow-md hover:bg-neutral-900 hover:text-white dark:hover:bg-emerald-600 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onBuy && !isSoldOut && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              aria-label="Add to Cart"
              className="p-2.5 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {showCategory && product.category_name && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1 line-clamp-1">
            {product.category_name}
          </span>
        )}

        <h3
          className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug mb-2 cursor-pointer group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
          onClick={onView}
        >
          {product.name}
        </h3>

        {/* Pricing Footer */}
        <div className="mt-auto pt-2.5 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {currencySymbol}{priceNum.toLocaleString()}
            </span>
            {comparePriceNum && comparePriceNum > priceNum && (
              <span className="text-[11px] text-neutral-400 line-through font-normal">
                {currencySymbol}{comparePriceNum.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quick Mobile Cart Action */}
          {onBuy && !isSoldOut && (
            <button
              type="button"
              onClick={onBuy}
              aria-label="Add to cart"
              className="sm:hidden p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white rounded-full transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
