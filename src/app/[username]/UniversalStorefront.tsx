'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingBag, Plus, Minus, Trash2, X, Check,
  MapPin, Clock, ShieldCheck, Star, ChevronDown, ChevronUp,
  Share2, ArrowRight, Phone, MessageCircle, ExternalLink,
  Sparkles, Tag, Info, AlertCircle, QrCode, Copy,
  CheckCircle2, Truck, ShieldAlert, LayoutGrid, List,
  Filter, Zap, Heart, RefreshCw, Layers, CreditCard, Lock,
  Navigation
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import QRCodeSVG from 'react-qr-code';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { InstagramIcon, TikTokIcon, FacebookIcon, TwitterXIcon } from '../../components/SocialIcons';
import { resilientFetch } from '../../utils/resilientFetch';
import { getOptimizedImageUrl } from '@/lib/image';
import SearchableSelect from '@/components/SearchableSelect';

export interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

export const DEFAULT_STORE_POLICIES = {
  delivery: 'Orders are dispatched within 24 hours of confirmation. Lagos deliveries arrive same-day or next-day. Nationwide deliveries arrive in 24–48 hours.',
  authenticity: 'We only sell 100% genuine and verified items. Inspect your order on delivery.',
  payment: 'All online payments made through Frontstore are held under buyer protection until delivery confirmation.',
};

export interface StoreType {
  id: string;
  username: string;
  store_name: string;
  store_bio: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  currency_code: string;
  whatsapp_phone: string;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle?: string | null;
  facebook_handle?: string | null;
  is_verified?: boolean | number;
  custom_links?: StoreLink[] | null;
  primary_color?: string | null;
  location?: string | null;
  working_hours?: any;
  announcement_title?: string | null;
  announcement_body?: string | null;
  rating?: number | null;
  review_count?: number | null;
  delivery_info?: string | null;
  return_policy?: string | null;
  policy_products?: string | null;
  policy_refunds?: string | null;
  policy_bookings?: string | null;
  about_intro_text?: string | null;
  faq_help_text?: string | null;
  payment_provider?: string | null;
  reply_time_minutes?: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  name?: string;
  title?: string;
  price?: string | number;
  stock_quantity?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  description: string | null;
  image_urls: string[] | null;
  stock_status: string;
  stock_quantity?: number | null;
  category_id: string | null;
  is_digital?: boolean;
  type?: 'service' | 'product';
  duration_minutes?: number | null;
  variants?: ProductVariant[];
}

export interface Review {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
  created_at?: string;
  reply?: string | null;
}

export interface StoreFaq {
  id: string;
  question: string;
  answer: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  variantId?: string;
  variantName?: string;
  image_url?: string;
  type: 'product' | 'service';
}

interface UniversalStorefrontProps {
  username: string;
  store: StoreType;
  categories: Category[];
  products: Product[];
  reviews: Review[];
  faqs: StoreFaq[];
  blog?: any[];
  systemDomain: string;
  storeDisclaimer: string;
  appName: string;
}

function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '₦';
  return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatWorkingHours(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatWorkingHours(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, any>;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const activeDays = days.filter(d => obj[d] && obj[d].enabled !== false);
    if (activeDays.length === 0) return 'Closed';

    const firstDay = obj[activeDays[0]];
    const openTime = firstDay?.open || firstDay?.from || '';
    const closeTime = firstDay?.close || firstDay?.to || '';

    if (openTime && closeTime) {
      const dayRange =
        activeDays.length === 7
          ? 'Daily'
          : activeDays.length >= 5 && activeDays.includes('monday') && activeDays.includes('friday')
          ? activeDays.includes('saturday')
            ? 'Mon–Sat'
            : 'Mon–Fri'
          : activeDays.map(d => d.slice(0, 3).toUpperCase()).join(', ');
      return `${dayRange} (${openTime} - ${closeTime})`;
    }

    const entries = Object.entries(obj).filter(([_, v]) => Boolean(v));
    if (entries.length > 0) {
      return entries
        .map(([k, v]) =>
          typeof v === 'object' && v
            ? `${k.slice(0, 3)}: ${v.open || ''}-${v.close || ''}`
            : `${k.slice(0, 3)}: ${v}`
        )
        .join(' | ');
    }
  }
  return '';
}

function optimizeImageUrl(url: string | null | undefined, variant: 'thumb' | 'md' | 'lg' = 'md'): string {
  return getOptimizedImageUrl(url, variant);
}


function getWishlistFromStorage(storeUsername: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `fs_wishlist_${storeUsername}`;
    const name = `${key}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        const val = c.substring(name.length, c.length);
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    const localVal = localStorage.getItem(key);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading wishlist storage', e);
  }
  return [];
}

function saveWishlistToStorage(storeUsername: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `fs_wishlist_${storeUsername}`;
    const jsonStr = JSON.stringify(ids);
    document.cookie = `${key}=${encodeURIComponent(jsonStr)}; max-age=31536000; path=/; SameSite=Lax`;
    localStorage.setItem(key, jsonStr);
  } catch (e) {
    console.error('Error saving wishlist storage', e);
  }
}

export default function UniversalStorefront({
  username,
  store,
  categories = [],
  products = [],
  reviews = [],
  faqs = [],
  systemDomain = 'frontstore.ng',
  storeDisclaimer,
  appName = 'Frontstore',
}: UniversalStorefrontProps) {
  // Navigation & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services' | 'saved'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'sale'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Cart & Checkout
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modals & Drawers
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    const storeUser = store.username || username;
    if (storeUser) {
      const saved = getWishlistFromStorage(storeUser);
      if (saved && saved.length > 0) {
        setWishlist(saved);
      }
    }
  }, [store.username, username]);

  const primaryColor = store.primary_color || '#075E54';
  const currencyCode = store.currency_code || 'NGN';
  const isVerified = Boolean(store.is_verified);
  const workingHoursDisplay = useMemo(() => formatWorkingHours(store.working_hours), [store.working_hours]);
  const storeUrl = typeof window !== 'undefined'
    ? (window.location.hostname.includes('localhost')
        ? `http://${username}.localhost:3000`
        : `https://${username}.${systemDomain}`)
    : `https://${username}.${systemDomain}`;

  const getProductUrl = (item: Product) => {
    return `/${username}/${item.slug}`;
  };

  const getStoreHomeUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const isSubdomain = host.startsWith(`${username}.`) || host.endsWith('.localhost:3000') || host.endsWith('.frontstore.ng');
      if (isSubdomain) {
        return '/';
      }
    }
    return `/${username}`;
  };

  // Dynamic primary color CSS variables
  useEffect(() => {
    if (primaryColor && typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary', primaryColor);
      document.documentElement.style.setProperty('--primary-light', `${primaryColor}14`);
      document.documentElement.style.setProperty('--primary-border', `${primaryColor}3D`);
      document.documentElement.style.setProperty('--brand', primaryColor);
      document.documentElement.style.setProperty('--brand-deep', primaryColor);
      document.documentElement.style.setProperty('--tint', `color-mix(in srgb, ${primaryColor} 14%, white)`);
    }
  }, [primaryColor]);

  // Derived state
  const totalCartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.qty, 0), [cart]);
  const cartTotal = useMemo(() => Math.max(0, cartSubtotal - appliedDiscount), [cartSubtotal, appliedDiscount]);

  const hasProducts = useMemo(() => products.some(p => p.type !== 'service'), [products]);
  const hasServices = useMemo(() => products.some(p => p.type === 'service'), [products]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    categories.forEach((cat) => {
      map[cat.id] = products.filter((p) => p.category_id === cat.id).length;
    });
    return map;
  }, [categories, products]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let list = products.filter((p) => {
      if (activeTab === 'products' && p.type === 'service') return false;
      if (activeTab === 'services' && p.type !== 'service') return false;
      if (activeTab === 'saved' && !wishlist.includes(p.id)) return false;
      if (selectedCategoryId !== 'all' && p.category_id !== selectedCategoryId) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    });

    if (sortBy === 'price-low') {
      list.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
    } else if (sortBy === 'sale') {
      list.sort((a, b) => {
        const discA = parseFloat(a.compare_at_price || '0') - parseFloat(a.price || '0');
        const discB = parseFloat(b.compare_at_price || '0') - parseFloat(b.price || '0');
        return discB - discA;
      });
    }

    return list;
  }, [products, activeTab, wishlist, selectedCategoryId, searchTerm, sortBy]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryId, activeTab, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    const catalogEl = document.getElementById('store-catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Wishlist toggle
  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      if (exists) {
        sonnerToast('Removed from saved items');
      } else {
        sonnerToast.success('Saved to your wishlist');
      }
      saveWishlistToStorage(store.username || username, next);
      return next;
    });
  };

  // Cart operations
  const addToCart = (product: Product, variant?: ProductVariant | null, e?: React.MouseEvent, quantity: number = 1) => {
    if (e) e.stopPropagation();
    const unitPrice = variant?.price ? parseFloat(String(variant.price)) : parseFloat(product.price || '0');
    const itemId = variant ? `${product.id}-${variant.id}` : product.id;
    const itemImage = (product.image_urls && product.image_urls[0]) || undefined;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) => (i.id === itemId ? { ...i, qty: i.qty + quantity } : i));
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          price: unitPrice,
          qty: quantity,
          variantId: variant?.id,
          variantName: variant?.title || variant?.name,
          image_url: itemImage,
          type: product.type === 'service' ? 'service' : 'product',
        },
      ];
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1400);

    sonnerToast.success(`Added ${quantity > 1 ? `${quantity}x ` : ''}${product.name} to bag`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Direct WhatsApp Checkout
  const handleWhatsAppCheckout = (singleItem?: { product: Product; variant?: ProductVariant | null; qty?: number }) => {
    if (!singleItem) {
      if (!customerName.trim()) {
        sonnerToast.error('Please enter your full name before placing an order.');
        return;
      }
      if (!customerPhone.trim()) {
        sonnerToast.error('Please enter your WhatsApp phone number before placing an order.');
        return;
      }
    }

    const phone = store.whatsapp_phone ? store.whatsapp_phone.replace(/[^0-9]/g, '') : '';
    if (!phone) {
      sonnerToast.error('Store WhatsApp contact is unavailable.');
      return;
    }

    let message = `Hello *${store.store_name}*, I would like to place an order from your Frontstore:\n\n`;
    message += `🛒 *ORDER SUMMARY:*\n`;
    message += `──────────────────────\n`;

    if (singleItem) {
      const p = singleItem.product;
      const v = singleItem.variant;
      const quantity = singleItem.qty || 1;
      const unitPrice = v?.price ? parseFloat(String(v.price)) : parseFloat(p.price || '0');
      const totalItemPrice = unitPrice * quantity;
      const varInfo = v ? ` (${v.title || v.name})` : '';
      message += `• *${p.name}${varInfo}* x ${quantity} — ${formatCurrency(totalItemPrice, currencyCode)}\n\n`;
      message += `💰 *Total:* ${formatCurrency(totalItemPrice, currencyCode)}\n`;
    } else {
      cart.forEach((item, index) => {
        const varInfo = item.variantName ? ` (${item.variantName})` : '';
        message += `${index + 1}. *${item.name}${varInfo}* x ${item.qty} — ${formatCurrency(item.price * item.qty, currencyCode)}\n`;
      });
      message += `──────────────────────\n`;
      if (appliedDiscount > 0) {
        message += `🏷️ *Discount applied:* -${formatCurrency(appliedDiscount, currencyCode)}\n`;
      }
      message += `💰 *Total Amount:* ${formatCurrency(cartTotal, currencyCode)}\n`;
    }

    if (customerName.trim()) {
      message += `\n👤 *Customer:* ${customerName.trim()}`;
    }
    if (customerPhone.trim()) {
      message += `\n📱 *Phone:* ${customerPhone.trim()}`;
    }
    if (customerNote.trim()) {
      message += `\n📝 *Delivery / Note:* ${customerNote.trim()}`;
    }

    message += `\n\n🔗 *Storefront:* ${storeUrl}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  // Online Payment Flow
  const handleOnlinePayment = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      sonnerToast.error('Please enter your full name before placing an order.');
      return;
    }
    if (!customerPhone.trim()) {
      sonnerToast.error('Please enter your WhatsApp phone number before placing an order.');
      return;
    }

    setIsCheckingOut(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
      const res = await resilientFetch(`${API_URL}/v1/public/store/${username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            product_id: i.productId,
            variant_id: i.variantId,
            quantity: i.qty,
          })),
          customer_name: customerName || 'Guest Shopper',
          customer_phone: customerPhone,
          delivery_note: customerNote,
          payment_method: 'paystack',
        }),
      });

      const data = await res.json();
      const orderId = data?.data?.order?.id || data?.order?.id;
      const checkoutUrl = data?.checkout_url || data?.data?.checkout_url;

      if (res.ok && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else if (res.ok && orderId) {
        sonnerToast.success('Order created! Redirecting to payment page...');
        window.location.href = `/track/${orderId}`;
      } else {
        const errorMsg = data?.message || data?.error || 'Could not initialize order payment. Redirecting to WhatsApp...';
        sonnerToast.error(errorMsg);
        handleWhatsAppCheckout();
      }
    } catch (err) {
      console.error('Online checkout failed:', err);
      sonnerToast.error('Network error during checkout. Falling back to WhatsApp...');
      handleWhatsAppCheckout();
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Share store
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.store_name,
          text: store.store_bio || `Shop directly from ${store.store_name}!`,
          url: storeUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(storeUrl);
      sonnerToast.success('Store link copied to clipboard!');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      sonnerToast.error('Please fill in your name and comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
      const res = await resilientFetch(`${API_URL}/v1/public/store/${username}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: reviewName.trim(),
          rating: reviewRating,
          body: reviewComment.trim(),
        }),
      });

      if (res.ok) {
        sonnerToast.success('Thank you for your review!');
        setIsReviewOpen(false);
        setReviewComment('');
      } else {
        sonnerToast.error('Failed to submit review. Please try again.');
      }
    } catch (err) {
      sonnerToast.error('Error submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        fontFamily: 'var(--font-sans, "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        color: '#0f172a',
      }}
    >
      {/* ── STICKY LUXURY HEADER ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          className="px-2.5 sm:px-5 py-2.5 sm:py-3"
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          {/* Brand Identity */}
          <Link
            href={getStoreHomeUrl()}
            onClick={(e) => {
              setSelectedCategoryId('all');
              setSearchTerm('');
              if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === `/${username}`)) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              flex: '1 1 auto',
              overflow: 'hidden',
            }}
            className="hover:opacity-85"
            title={`Go to ${store.store_name} home`}
          >
            {store.logo_url ? (
              <img
                src={getOptimizedImageUrl(store.logo_url, 'thumb')}
                alt={store.store_name}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  objectFit: 'cover',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  flexShrink: 0,
                }}
                className="sm:w-[42px] sm:h-[42px] sm:rounded-xl"
              />
            ) : (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: primaryColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  boxShadow: `0 4px 12px ${primaryColor}33`,
                  flexShrink: 0,
                }}
                className="sm:w-[42px] sm:h-[42px] sm:rounded-xl sm:text-[18px]"
              >
                {store.store_name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                  }}
                  className="sm:text-[15.5px]"
                >
                  {store.store_name}
                </span>
                {isVerified && (
                  <span
                    title="Verified Merchant"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: primaryColor,
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={15} />
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    flexShrink: 1,
                  }}
                >
                  @{username}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    color: primaryColor,
                    background: `${primaryColor}14`,
                    border: `1px solid ${primaryColor}29`,
                    padding: '1px 5px',
                    borderRadius: 10,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: primaryColor }} />
                  Online
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} className="sm:gap-2">
            {/* QR Scanner modal trigger */}
            <button
              onClick={() => setIsQrOpen(true)}
              aria-label="Store QR Code"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              className="sm:w-[36px] sm:h-[36px] sm:rounded-[10px]"
            >
              <QrCode size={15} />
            </button>

            {/* Share Store */}
            <button
              onClick={handleShare}
              aria-label="Share Store"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              className="sm:w-[36px] sm:h-[36px] sm:rounded-[10px]"
            >
              <Share2 size={15} />
            </button>

            {/* Wishlist Header Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              aria-label="View Saved Items"
              style={{
                position: 'relative',
                width: 34,
                height: 34,
                borderRadius: 9,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: wishlist.length > 0 ? '#ef4444' : '#475569',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                flexShrink: 0,
              }}
              className="sm:w-[36px] sm:h-[36px] sm:rounded-[10px]"
            >
              <Heart size={15} fill={wishlist.length > 0 ? '#ef4444' : 'transparent'} />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 9.5,
                    fontWeight: 800,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Floating Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: primaryColor,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                height: 34,
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${primaryColor}40`,
                transition: 'transform 0.15s ease',
                flexShrink: 0,
              }}
              className="sm:h-[36px] sm:px-3.5 sm:rounded-[12px] sm:text-[13.5px]"
            >
              <ShoppingBag size={15} />
              <span style={{ fontWeight: 700 }}>Bag</span>
              {totalCartCount > 0 && (
                <span
                  style={{
                    background: '#fff',
                    color: primaryColor,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 8,
                    marginLeft: 1,
                  }}
                >
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── STORE HERO & PROFILE COVER ── */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: 'clamp(28px, 5vw, 44px) 20px clamp(24px, 4vw, 36px)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          {/* Announcement Pill */}
          {store.announcement_title && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                color: '#854d0e',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '6px 16px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
              }}
            >
              <Sparkles size={14} color="#d97706" /> {store.announcement_title}
            </div>
          )}

          {/* Store Bio */}
          {store.store_bio && (
            <p
              style={{
                fontSize: 15.5,
                color: '#334155',
                lineHeight: 1.65,
                margin: '0 auto 20px',
                maxWidth: 580,
                fontWeight: 450,
              }}
            >
              {store.store_bio}
            </p>
          )}

          {/* Key Badges & Contact */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 13,
              color: '#475569',
            }}
          >
            {store.location && (
              <button
                type="button"
                onClick={() => setIsLocationOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="View location & map"
              >
                <MapPin size={14} color={primaryColor} /> {store.location}
              </button>
            )}

            {workingHoursDisplay && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontWeight: 500,
                }}
              >
                <Clock size={14} color={primaryColor} /> {workingHoursDisplay}
              </span>
            )}

            {store.whatsapp_phone && (
              <a
                href={`https://wa.me/${store.whatsapp_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: `${primaryColor}14`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}3D`,
                  padding: '5px 14px',
                  borderRadius: 16,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <WhatsAppIcon size={14} /> Message on WhatsApp
              </a>
            )}

            <button
              onClick={() => setIsPoliciesOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#fff',
                border: '1px solid #e2e8f0',
                padding: '5px 12px',
                borderRadius: 16,
                fontSize: 13,
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <Info size={14} /> Store Policies
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS STRIP ── */}
      <section
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: 16,
            fontSize: 12.5,
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={15} color={primaryColor} />
            <span>Fast WhatsApp Checkout</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={15} color={primaryColor} />
            <span>Next-Day Delivery Across Nigeria</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={15} color={primaryColor} />
            <span>100% Genuine Items Guaranteed</span>
          </div>
        </div>
      </section>

      {/* ── MAIN CATALOGUE CONTAINER ── */}
      <main id="store-catalog-section" style={{ flex: 1, maxWidth: 1120, width: '100%', margin: '0 auto', padding: '28px 20px 80px' }}>
        {/* Navigation Tabs (Goods vs Services vs Saved) */}
        {( (hasProducts && hasServices) || wishlist.length > 0 || activeTab === 'saved') && (
          <div
            style={{
              display: 'inline-flex',
              background: '#e2e8f0',
              padding: 4,
              borderRadius: 14,
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'all' ? '#fff' : 'transparent',
                color: activeTab === 'all' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              All Items ({products.length})
            </button>
            {hasProducts && hasServices && (
              <>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'products' ? '#fff' : 'transparent',
                    color: activeTab === 'products' ? '#0f172a' : '#64748b',
                    boxShadow: activeTab === 'products' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'services' ? '#fff' : 'transparent',
                    color: activeTab === 'services' ? '#0f172a' : '#64748b',
                    boxShadow: activeTab === 'services' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  Services
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('saved')}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'saved' ? '#fff' : 'transparent',
                color: activeTab === 'saved' ? '#ef4444' : '#64748b',
                boxShadow: activeTab === 'saved' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Heart size={14} fill={wishlist.length > 0 ? '#ef4444' : 'transparent'} color={wishlist.length > 0 ? '#ef4444' : '#64748b'} />
              Saved ({wishlist.length})
            </button>
          </div>
        )}

        {/* Toolbar: Search, Sort, View Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by name, brand, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 40px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                background: '#fff',
                outline: 'none',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort & View Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchableSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              searchable={false}
              triggerStyle={{
                padding: '8px 14px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#334155',
                minWidth: 165,
              }}
              options={[
                { value: 'featured', label: 'Sort: Featured' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'sale', label: 'Biggest Discount' },
              ]}
            />

            <div style={{ display: 'flex', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 2 }}>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                style={{
                  padding: 6,
                  border: 'none',
                  borderRadius: 8,
                  background: viewMode === 'grid' ? primaryColor : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                style={{
                  padding: 6,
                  border: 'none',
                  borderRadius: 8,
                  background: viewMode === 'list' ? primaryColor : 'transparent',
                  color: viewMode === 'list' ? '#fff' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips with Counters */}
        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 12,
              marginBottom: 24,
              scrollbarWidth: 'none',
            }}
          >
            <button
              onClick={() => setSelectedCategoryId('all')}
              style={{
                padding: '7px 16px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: selectedCategoryId === 'all' ? `1.5px solid ${primaryColor}` : '1px solid #cbd5e1',
                background: selectedCategoryId === 'all' ? `${primaryColor}14` : '#fff',
                color: selectedCategoryId === 'all' ? primaryColor : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              All Items
              <span style={{ fontSize: 11, opacity: 0.7 }}>({categoryCounts['all'] || 0})</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    border: isSelected ? `1.5px solid ${primaryColor}` : '1px solid #cbd5e1',
                    background: isSelected ? `${primaryColor}14` : '#fff',
                    color: isSelected ? primaryColor : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {cat.name}
                  <span style={{ fontSize: 11, opacity: 0.7 }}>({categoryCounts[cat.id] || 0})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── PRODUCT GRID / LIST ── */}
        {filteredItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: '#fff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
            }}
          >
            {activeTab === 'saved' ? (
              <Heart size={44} color="#ef4444" fill="rgba(239, 68, 68, 0.1)" style={{ marginBottom: 12 }} />
            ) : (
              <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
            )}
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
              {activeTab === 'saved' ? 'No saved items yet' : 'No items match your filter'}
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 380, margin: '0 auto 16px' }}>
              {activeTab === 'saved'
                ? 'Tap the heart icon on any product card to save items to your wishlist for easy access later.'
                : 'Try searching with different keywords or clearing active category filters.'}
            </p>
            <button
              onClick={() => {
                if (activeTab === 'saved') {
                  setActiveTab('all');
                } else {
                  setSearchTerm('');
                  setSelectedCategoryId('all');
                }
              }}
              style={{
                padding: '9px 18px',
                borderRadius: 12,
                background: primaryColor,
                color: '#fff',
                border: 'none',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {activeTab === 'saved' ? 'Browse All Items' : 'Clear Filters'}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW (2 columns on mobile, auto-fill on desktop) */
          <div className="storefront-product-grid">
            {paginatedItems.map((item, index) => {
              const priceNum = parseFloat(item.price || '0');
              const compareNum = item.compare_at_price ? parseFloat(item.compare_at_price) : 0;
              const hasDiscount = compareNum > priceNum;
              const discountPercent = hasDiscount ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0;
              const isOutOfStock = item.stock_status === 'out_of_stock';
              const rawImageUrl = (item.image_urls && item.image_urls[0]) || null;
              const imageUrl = optimizeImageUrl(rawImageUrl, 'thumb');
              const isService = item.type === 'service';
              const isSaved = wishlist.includes(item.id);
              const isJustAdded = recentlyAddedId === item.id;
              const stockText = isOutOfStock
                ? 'Sold out'
                : item.stock_quantity && item.stock_quantity > 0
                ? `${item.stock_quantity} left`
                : 'In stock';

              return (
                <Link
                  key={item.id}
                  href={getProductUrl(item)}
                  className="storefront-product-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = primaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {/* Image Canvas */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: '#f1f5f9',
                      overflow: 'hidden',
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                        <ShoppingBag size={32} />
                      </div>
                    )}

                    {/* Discount Pill */}
                    {hasDiscount && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '3px 7px',
                          borderRadius: 6,
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                        }}
                      >
                        -{discountPercent}% OFF
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(item.id, e);
                      }}
                      aria-label="Save to Wishlist"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        background: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(6px)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSaved ? '#ef4444' : '#64748b',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Heart size={15} fill={isSaved ? '#ef4444' : 'transparent'} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="storefront-card-body">
                    <div>
                      <h4 className="storefront-card-title">
                        {item.name}
                      </h4>

                      <div className="storefront-card-price-row">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
                          <span className="storefront-card-price">
                            {formatCurrency(priceNum, currencyCode)}
                          </span>
                          {hasDiscount && (
                            <span style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                              {formatCurrency(compareNum, currencyCode)}
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: 11, fontWeight: 600, color: isOutOfStock ? '#ef4444' : '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {stockText}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="storefront-card-btn"
                      style={{
                        background: isOutOfStock
                          ? '#f1f5f9'
                          : isJustAdded
                          ? '#10b981'
                          : primaryColor,
                        color: isOutOfStock ? '#94a3b8' : '#ffffff',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        boxShadow: isOutOfStock
                          ? 'none'
                          : isJustAdded
                          ? '0 4px 14px rgba(16, 185, 129, 0.45)'
                          : `0 4px 14px ${primaryColor}38`,
                      }}
                    >
                      {isJustAdded ? (
                        <>
                          <Check size={15} />
                          Added!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} />
                          {isService ? 'Book' : 'Add to Cart'}
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginatedItems.map((item) => {
              const priceNum = parseFloat(item.price || '0');
              const compareNum = item.compare_at_price ? parseFloat(item.compare_at_price) : 0;
              const hasDiscount = compareNum > priceNum;
              const rawImageUrl = (item.image_urls && item.image_urls[0]) || null;
              const imageUrl = optimizeImageUrl(rawImageUrl, 'thumb');

              return (
                <Link
                  key={item.id}
                  href={getProductUrl(item)}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    padding: 14,
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = primaryColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={imageUrl || ''}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    style={{ width: 84, height: 84, borderRadius: 12, objectFit: 'cover', background: '#f1f5f9' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>{item.name}</h4>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || 'Quality product from this store.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{formatCurrency(priceNum, currencyCode)}</span>
                      {hasDiscount && (
                        <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                          {formatCurrency(compareNum, currencyCode)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      background: recentlyAddedId === item.id ? '#10b981' : primaryColor,
                      color: '#fff',
                      border: 'none',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'background-color 0.2s ease, transform 0.15s ease',
                    }}
                  >
                    {recentlyAddedId === item.id ? (
                      <>
                        <Check size={15} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Add
                      </>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION CONTROLS ── */}
        {filteredItems.length > 0 && (
          <div
            style={{
              marginTop: 36,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '14px 20px',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#64748b' }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)}–
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </span>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                    color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: isActive ? `1.5px solid ${primaryColor}` : '1px solid #cbd5e1',
                        background: isActive ? primaryColor : '#ffffff',
                        color: isActive ? '#ffffff' : '#0f172a',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                    color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MODULAR SECTIONS: REVIEWS & FAQS ── */}
        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Customer Reviews */}
          {reviews.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 'clamp(20px, 4vw, 32px)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Verified Customer Reviews</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ display: 'flex', color: '#eab308' }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={15} fill="#eab308" />
                      ))}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>5.0</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>({reviews.length} reviews)</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsReviewOpen(true)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '8px 18px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    color: primaryColor,
                    cursor: 'pointer',
                  }}
                >
                  Write a Review
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{r.reviewer_name}</span>
                      <div style={{ display: 'flex', color: '#eab308' }}>
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} size={13} fill="#eab308" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.55 }}>
                      &ldquo;{r.body}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Accordion */}
          {faqs.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 'clamp(20px, 4vw, 32px)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Frequently Asked Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {faqs.map((faq) => {
                  const isOpen = activeFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: isOpen ? '#f8fafc' : '#fff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: 700,
                          fontSize: 14,
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#0f172a',
                        }}
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '14px 18px 18px', fontSize: 13.5, color: '#475569', lineHeight: 1.6, borderTop: '1px solid #f1f5f9' }}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── SLIDE-OVER CHECKOUT DRAWER ── */}
      {isCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsCartOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 460,
              height: '100%',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-12px 0 32px rgba(0,0,0,0.18)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={20} color={primaryColor} />
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Your Order ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 14px', opacity: 0.35, color: primaryColor }} />
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Your bag is empty</p>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>Explore our collection and add your favorite items to complete your order.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '12px',
                        borderRadius: 14,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={item.image_url || ''}
                        alt={item.name}
                        style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', background: '#e2e8f0', flexShrink: 0 }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 3px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        {item.variantName && (
                          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 3px' }}>{item.variantName}</p>
                        )}
                        <p style={{ fontSize: 14, fontWeight: 800, color: primaryColor, margin: 0 }}>
                          {formatCurrency(item.price * item.qty, currencyCode)}
                        </p>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: 2,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '2px 4px' }}>
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            style={{
                              width: 22,
                              height: 22,
                              border: 'none',
                              background: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#475569'
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 800, minWidth: 16, textAlign: 'center', color: '#0f172a' }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            style={{
                              width: 22,
                              height: 22,
                              border: 'none',
                              background: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#475569'
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Form & Actions */}
            {cart.length > 0 && (
              <div style={{ padding: '20px 22px', borderTop: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 -4px 20px rgba(0,0,0,0.03)' }}>
                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Joy Okafor"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 14,
                        fontWeight: 500,
                        background: '#f8fafc',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>
                      WhatsApp Phone Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +234 803 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 14,
                        fontWeight: 500,
                        background: '#f8fafc',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>
                      Delivery Address / Special Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Enter street address or instructions"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 14,
                        fontWeight: 500,
                        background: '#f8fafc',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                {/* Subtotal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: 16
                }}>
                  <span style={{ fontSize: 13.5, color: '#64748b', fontWeight: 700 }}>Total Payable</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                    {formatCurrency(cartTotal, currencyCode)}
                  </span>
                </div>

                {/* Checkout Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    disabled={isCheckingOut}
                    onClick={handleOnlinePayment}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: 12,
                      background: primaryColor,
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                    }}
                  >
                    {isCheckingOut ? 'Processing Order...' : 'Pay Online (Card / Transfer / MoMo)'}
                  </button>

                  <button
                    onClick={() => handleWhatsAppCheckout()}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 12,
                      background: `${primaryColor}14`,
                      color: primaryColor,
                      border: `1.5px solid ${primaryColor}3D`,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <WhatsAppIcon size={18} />
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SLIDE-OVER WISHLIST DRAWER ── */}
      {isWishlistOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsWishlistOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 460,
              height: '100%',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-12px 0 32px rgba(0,0,0,0.18)',
            }}
          >
            {/* Wishlist Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={20} color="#ef4444" fill="#ef4444" />
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Saved Items ({wishlist.length})</h3>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Wishlist Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <Heart size={48} style={{ margin: '0 auto 14px', opacity: 0.35, color: '#ef4444' }} />
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Your wishlist is empty</p>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                    Tap the heart icon on any product to save items for later without needing an account.
                  </p>
                  <button
                    onClick={() => setIsWishlistOpen(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      background: primaryColor,
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {products
                    .filter((item) => wishlist.includes(item.id))
                    .map((item) => {
                      const priceNum = parseFloat(item.price || '0');
                      const compareNum = item.compare_at_price ? parseFloat(item.compare_at_price) : 0;
                      const hasDiscount = compareNum > priceNum;
                      const isOutOfStock = item.stock_status === 'out_of_stock';
                      const rawImageUrl = (item.image_urls && item.image_urls[0]) || null;
                      const imageUrl = optimizeImageUrl(rawImageUrl, 'thumb');

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            gap: 14,
                            padding: 12,
                            borderRadius: 14,
                            border: '1px solid #f1f5f9',
                            background: '#f8fafc',
                            alignItems: 'center',
                          }}
                        >
                          <img
                            src={imageUrl || ''}
                            alt={item.name}
                            style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', background: '#e2e8f0' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                                {formatCurrency(priceNum, currencyCode)}
                              </span>
                              {hasDiscount && (
                                <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                                  {formatCurrency(compareNum, currencyCode)}
                                </span>
                              )}
                            </div>
                            <button
                              disabled={isOutOfStock}
                              onClick={(e) => {
                                addToCart(item, null, e);
                                sonnerToast.success('Added to bag');
                              }}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 8,
                                background: isOutOfStock ? '#e2e8f0' : primaryColor,
                                color: isOutOfStock ? '#94a3b8' : '#fff',
                                border: 'none',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <ShoppingBag size={13} />
                              {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                            </button>
                          </div>
                          <button
                            onClick={(e) => toggleWishlist(item.id, e)}
                            title="Remove from saved items"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: 6,
                              borderRadius: 8,
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Wishlist Footer */}
            {wishlist.length > 0 && (
              <div style={{ padding: '16px 22px 22px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    const savedProducts = products.filter((p) => wishlist.includes(p.id) && p.stock_status !== 'out_of_stock');
                    savedProducts.forEach((p) => addToCart(p));
                    setIsWishlistOpen(false);
                    setIsCartOpen(true);
                    sonnerToast.success(`Added ${savedProducts.length} saved items to your bag`);
                  }}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: primaryColor,
                    color: '#fff',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: `0 4px 14px ${primaryColor}35`,
                  }}
                >
                  <ShoppingBag size={17} />
                  Add All Saved Items to Bag
                </button>
                <button
                  onClick={() => {
                    setWishlist([]);
                    saveWishlistToStorage(store.username || username, []);
                    sonnerToast('Wishlist cleared');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '6px 0',
                  }}
                >
                  Clear all saved items
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QR CODE MODAL ── */}
      {isQrOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsQrOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              background: '#fff',
              borderRadius: 24,
              padding: 28,
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsQrOpen(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Scan to Open Store</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Scan with your smartphone camera to browse {store.store_name} instantly.
            </p>

            <div
              style={{
                padding: 16,
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 16,
                display: 'inline-block',
                marginBottom: 20,
              }}
            >
              <QRCodeSVG value={storeUrl} size={180} />
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl);
                sonnerToast.success('Store link copied!');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: primaryColor,
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: `0 4px 14px ${primaryColor}40`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <Copy size={16} color="#fff" /> Copy Store Link
            </button>
          </div>
        </div>
      )}

      {/* ── STORE POLICIES MODAL ── */}
      {isPoliciesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPoliciesOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#fff',
              borderRadius: 24,
              padding: 28,
              position: 'relative',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setIsPoliciesOpen(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Store Policies & Info</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${primaryColor}14`,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Truck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Delivery & Fulfillment
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.55 }}>
                    {store.delivery_info?.trim() || DEFAULT_STORE_POLICIES.delivery}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${primaryColor}14`,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    100% Authenticity Guarantee
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.55 }}>
                    {store.policy_products?.trim() || DEFAULT_STORE_POLICIES.authenticity}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${primaryColor}14`,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Secure Payment Protection
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.55 }}>
                    {store.policy_refunds?.trim() || store.return_policy?.trim() || DEFAULT_STORE_POLICIES.payment}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STORE LOCATION & MAP MODAL ── */}
      {isLocationOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLocationOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#fff',
              borderRadius: 24,
              padding: 26,
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setIsLocationOpen(false)}
              aria-label="Close location modal"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: '#ecfdf5',
                  color: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>Store Location & Map</h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>{store.store_name}</p>
              </div>
            </div>

            {/* Address / Location Details */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={16} color={primaryColor} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8' }}>
                    Physical Address / Operating City
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                    {store.location || 'Online Store (Nationwide Delivery)'}
                  </div>
                </div>
              </div>

              {workingHoursDisplay && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: '1px solid #edf2f7' }}>
                  <Clock size={15} color={primaryColor} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                    Working hours: <strong>{workingHoursDisplay}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Visual Map Preview & Direct Navigation Card */}
            {store.location && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 180,
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 16,
                  border: '1px solid #e2e8f0',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f8fafc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Stylized vector map grid pattern */}
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.35,
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="store-map-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                      <circle cx="20" cy="20" r="1.5" fill="#64748b" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#store-map-pattern)" />
                  <path d="M -20 60 Q 140 140 380 40 T 600 120" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                  <path d="M 80 -10 Q 190 70 270 200" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 230 -10 Q 310 90 460 190" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                </svg>

                {/* Radar pulse effect & center pin */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        background: `${primaryColor}22`,
                        border: `1.5px solid ${primaryColor}55`,
                      }}
                    />
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: primaryColor,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
                        border: '3px solid #fff',
                      }}
                    >
                      <MapPin size={22} />
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(8px)',
                      padding: '5px 14px',
                      borderRadius: 20,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#0f172a',
                      maxWidth: 280,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    📍 {store.location}
                  </div>
                </div>

                {/* Top-right GPS status badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(6px)',
                    padding: '3px 9px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Navigation size={12} /> Map Ready
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {store.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.location + (store.location.toLowerCase().includes('nigeria') ? '' : ', Nigeria'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: primaryColor,
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  <MapPin size={16} /> Open in Google Maps <ExternalLink size={14} />
                </a>
              )}

              {store.location && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(store.location + (store.location.toLowerCase().includes('nigeria') ? '' : ', Nigeria'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Navigation size={14} /> Apple Maps
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(store.location || '');
                      sonnerToast.success('Address copied to clipboard!');
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Copy size={14} /> Copy Address
                  </button>
                </div>
              )}

              {store.whatsapp_phone && (
                <a
                  href={`https://wa.me/${store.whatsapp_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${store.store_name}, I would like to inquire about your store location and pickup/delivery options.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    padding: '11px 18px',
                    borderRadius: 12,
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    textDecoration: 'none',
                    fontSize: 13.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <WhatsAppIcon size={16} /> Ask About Delivery / Directions
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE REVIEW MODAL ── */}
      {isReviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsReviewOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsReviewOpen(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>Write a Review</h3>
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                  Rating
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star size={22} color="#eab308" fill={star <= reviewRating ? '#eab308' : 'transparent'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde A."
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                  Your Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="How was your shopping experience?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 10,
                  background: primaryColor,
                  color: '#fff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: isSubmittingReview ? 'not-allowed' : 'pointer',
                  marginTop: 6,
                }}
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── WORLD-CLASS STORE FOOTER ── */}
      <footer
        style={{
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          padding: '36px 20px 28px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {store.store_name}
            </span>
            {isVerified && <ShieldCheck size={16} color={primaryColor} />}
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 440 }}>
            {store.store_bio || 'Shop directly on WhatsApp with fast delivery and buyer protection.'}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setIsPoliciesOpen(true)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Delivery & Returns
            </button>
            {store.location && (
              <>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <button
                  onClick={() => setIsLocationOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Store Location
                </button>
              </>
            )}
            <span style={{ color: '#cbd5e1' }}>•</span>
            <button
              onClick={() => setIsQrOpen(true)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Store QR Code
            </button>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px' }}>
              © {new Date().getFullYear()} {store.store_name}. All rights reserved.
            </p>
            <a
              href={`https://${systemDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#64748b',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Powered by <span style={{ color: primaryColor }}>{appName}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
