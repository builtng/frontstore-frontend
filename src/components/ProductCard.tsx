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
  aspectRatio?: '4/5' | '1/1' | string;
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

  const isSoldOut = product.stock_status === 'out_of_stock' || (product.stock_quantity !== undefined && product.stock_quantity !== null && product.stock_quantity <= 0);

  const displayBadge = isSoldOut ? 'Sold Out' : badge || (comparePriceNum && comparePriceNum > priceNum ? 'Sale' : null);

  return (
    <div
      className={`fs-product-card group relative flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 ${className}`}
    >
      {/* Product Image Area */}
      <div className="relative w-full cursor-pointer overflow-hidden" onClick={onView}>
        {displayBadge && (
          <span
            className={`absolute top-2.5 left-2.5 z-20 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-full shadow-xs ${
              isSoldOut
                ? 'bg-neutral-800 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {displayBadge}
          </span>
        )}
        <ProductImage
          src={imageUrl}
          alt={product.name}
          aspectRatio={aspectRatio}
          padding="8px"
          backgroundColor="#f8f8f8"
          borderRadius="12px"
        />
      </div>

      {/* Card Content Area - Flex-1 to ensure equal height alignment */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {showCategory && product.category_name && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 line-clamp-1">
            {product.category_name}
          </span>
        )}

        <h3
          className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug mb-2 cursor-pointer hover:text-emerald-600 transition-colors"
          onClick={onView}
        >
          {product.name}
        </h3>

        {/* Pricing & Footer Action pinned to bottom */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
              {currencySymbol}{priceNum.toLocaleString()}
            </span>
            {comparePriceNum && comparePriceNum > priceNum && (
              <span className="text-[11px] text-neutral-400 line-through">
                {currencySymbol}{comparePriceNum.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onView && (
              <button
                type="button"
                onClick={onView}
                aria-label="View product details"
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onBuy && !isSoldOut && (
              <button
                type="button"
                onClick={onBuy}
                aria-label="Add to cart"
                className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
