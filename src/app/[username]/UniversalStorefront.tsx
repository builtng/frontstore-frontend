'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Plus, Minus, Trash2, X, Check,
  MapPin, Clock, ShieldCheck, Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Share2, ArrowRight, Phone, MessageCircle, ExternalLink,
  Sparkles, Tag, Info, AlertCircle, QrCode, Copy,
  Truck, ShieldAlert, Bell, User, Edit3, Package, Building,
  Filter, Heart, RefreshCw, Layers, CreditCard, Lock,
  Navigation, MoreVertical, RotateCcw, Calendar, Download,
  CheckCircle2, Mail, Home, LayoutGrid, List, Maximize2, Receipt
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import QRCodeSVG from 'react-qr-code';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { InstagramIcon, TikTokIcon, FacebookIcon, TwitterXIcon } from '../../components/SocialIcons';
import { resilientFetch } from '../../utils/resilientFetch';
import { getOptimizedImageUrl } from '@/lib/image';
import BuiltWithFrontstoreBadge from '@/components/BuiltWithFrontstoreBadge';
import { truncateStoreBio } from '@/utils/storeBio';
import BankTransferPaymentModal from '../../components/BankTransferPaymentModal';
import ImageLightbox from '../../components/ImageLightbox';
import OrderReceiptModal from '@/components/OrderReceiptModal';
import { getApiUrl } from '@/lib/api';

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
  refund: 'Items in original, unworn or unused condition with packaging intact can be returned or exchanged within 7 days. Buyer protection guarantees a refund if items are defective or not as described.',
  booking: 'Reschedule or cancel up to 24 hours before your appointment for a full refund.',
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
  nina_chat_qr_enabled?: boolean | number;
  nina_avatar_url?: string | null;
  shipping_type?: string | null;
  shipping_flat_fee?: string | number | null;
  shipping_free_threshold?: string | number | null;
  shipping_handling_fee?: string | number | null;
  shipping_custom_rules?: { min_subtotal: string | number; fee: string | number }[] | null;
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
  digital_file_url?: string | null;
  digital_link?: string | null;
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
  is_digital?: boolean;
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
  isNinaOpen?: boolean;
  onToggleNina?: () => void;
}

export const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number; label: string; flag: string }> = {
  NGN: { symbol: '₦', rate: 1, label: 'NGN', flag: '🇳🇬' },
  USD: { symbol: '$', rate: 0.00072, label: 'USD', flag: '🇺🇸' },
  KES: { symbol: 'KES ', rate: 0.093, label: 'KES', flag: '🇰🇪' },
  ZAR: { symbol: 'R ', rate: 0.012, label: 'ZAR', flag: '🇿🇦' },
  GHS: { symbol: 'GH₵ ', rate: 0.0084, label: 'GHS', flag: '🇬🇭' },
  GBP: { symbol: '£', rate: 0.00053, label: 'GBP', flag: '🇬🇧' },
  EUR: { symbol: '€', rate: 0.00062, label: 'EUR', flag: '🇪🇺' },
};

function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const config = CURRENCY_CONFIG[currency] || { symbol: currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '₦', rate: 1, flag: '' };
  const converted = amount * (config.rate || 1);
  if (currency === 'USD' || currency === 'GBP' || currency === 'EUR') {
    return `${config.symbol}${converted.toFixed(2)}`;
  }
  return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

function ProductImageWithSkeleton({
  src,
  alt,
  loading = 'lazy',
  style,
}: {
  src: string | null;
  alt: string;
  loading?: 'eager' | 'lazy';
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);

    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }

    const timer = setTimeout(() => {
      setLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [src]);

  if (!src || error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', background: '#f1f5f9' }}>
        <ShoppingBag size={32} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
      {!loaded && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', borderRadius: 0 }} />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.25s ease, transform 0.3s ease',
          ...style,
        }}
      />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="storefront-product-card" style={{ borderColor: '#e2e8f0', pointerEvents: 'none' }}>
      <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ width: '75%', height: 16, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '45%', height: 14, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '100%', height: 36, borderRadius: 8, marginTop: 8 }} />
      </div>
    </div>
  );
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
  if (!url) return '';
  return getOptimizedImageUrl(url, variant);
}


function getWishlistFromStorage(storeUsername: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `fs_wishlist_${storeUsername}`;
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
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
  isNinaOpen,
  onToggleNina,
}: UniversalStorefrontProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(store.currency_code || 'NGN');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Navigation & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services' | 'saved'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'sale'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hydrate viewMode preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('frontstore_storefront_view_mode');
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('frontstore_storefront_view_mode', mode);
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeTab !== 'all') setActiveTab('all');
    if (selectedCategoryId !== 'all') setSelectedCategoryId('all');
    if (searchTerm) setSearchTerm('');
  };

  const handleNinaClick = () => {
    if (onToggleNina) {
      onToggleNina();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('frontstore:open-nina'));
    }
  };

  // Cart & Checkout
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<'cart' | 'checkout_step1' | 'checkout_step2' | 'checkout_step3' | 'payment' | 'confirmed'>('cart');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Lagos State');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isRecipientDifferent, setIsRecipientDifferent] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isTotalExpanded, setIsTotalExpanded] = useState(false);
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
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'all' | 'delivery' | 'refund' | 'product' | 'booking'>('all');
  const storeMenuRef = useRef<HTMLDivElement>(null);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const [isQuickViewLightboxOpen, setIsQuickViewLightboxOpen] = useState(false);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [showPolicies, setShowPolicies] = useState(false);
  const [bankTransferModalOpen, setBankTransferModalOpen] = useState(false);
  const [bankTransferDetails, setBankTransferDetails] = useState<any>(null);

  useEffect(() => {
    setIsQuickViewLightboxOpen(false);
    setQuickViewImageIndex(0);
  }, [quickViewProduct?.id]);

  useEffect(() => {
    const storeUser = store.username || username;
    if (storeUser) {
      const saved = getWishlistFromStorage(storeUser);
      if (saved && saved.length > 0) {
        setWishlist(saved);
      }
    }
  }, [store.username, username]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target as Node)) {
        setIsStoreMenuOpen(false);
      }
    }
    if (isStoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isStoreMenuOpen]);

  useEffect(() => {
    if (isCartOpen && cartStep !== 'confirmed') setCartStep('cart');
  }, [isCartOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('fs_customer_name');
      const savedPhone = localStorage.getItem('fs_customer_phone');
      const savedEmail = localStorage.getItem('fs_customer_email');
      const savedAddress = localStorage.getItem('fs_customer_address');
      const savedLocation = localStorage.getItem('fs_delivery_location');
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedEmail) setCustomerEmail(savedEmail);
      if (savedAddress) setCustomerNote(savedAddress);
      if (savedLocation) setDeliveryLocation(savedLocation);
    }
  }, []);

  const saveCustomerDetailsToStorage = (name: string, phone: string, email: string, address: string, location: string) => {
    if (typeof window !== 'undefined') {
      if (name) localStorage.setItem('fs_customer_name', name);
      if (phone) localStorage.setItem('fs_customer_phone', phone);
      if (email) localStorage.setItem('fs_customer_email', email);
      if (address) localStorage.setItem('fs_customer_address', address);
      if (location) localStorage.setItem('fs_delivery_location', location);
    }
  };

  const primaryColor = store.primary_color || '#0B5D39';
  const currencyCode = store.currency_code || 'NGN';
  const isVerified = Boolean(store.is_verified);
  const workingHoursDisplay = useMemo(() => formatWorkingHours(store.working_hours), [store.working_hours]);
  const storeUrl = isMounted && typeof window !== 'undefined'
    ? (window.location.hostname.includes('localhost')
        ? `http://${username}.localhost:3000`
        : `https://${username}.${systemDomain}`)
    : `https://${username}.${systemDomain}`;

  const getProductUrl = (item: Product) => {
    if (isMounted && typeof window !== 'undefined') {
      const host = window.location.host;
      const isSubdomain = host.startsWith(`${username}.`) || host.endsWith('.localhost:3000') || host.endsWith('.frontstore.ng');
      if (isSubdomain) {
        return `/${item.slug}`;
      }
    }
    return `/${username}/${item.slug}`;
  };

  const getStoreHomeUrl = () => {
    if (isMounted && typeof window !== 'undefined') {
      const host = window.location.host;
      const isSubdomain = host.startsWith(`${username}.`) || host.endsWith('.localhost:3000') || host.endsWith('.frontstore.ng');
      if (isSubdomain) {
        return '/';
      }
    }
    return `/${username}`;
  };

  const getReviewsUrl = () => {
    if (isMounted && typeof window !== 'undefined') {
      const host = window.location.host;
      const isSubdomain = host.startsWith(`${username}.`) || host.endsWith('.localhost:3000') || (host.endsWith('.frontstore.ng') && host !== 'frontstore.ng' && host !== 'www.frontstore.ng');
      if (isSubdomain) {
        return '/reviews';
      }
    }
    return `/${username}/reviews`;
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

  // Mirrors the backend's ShippingFeeCalculator so the buyer sees the same
  // fee here that the order will actually be charged at creation time.
  const shippingFee = useMemo(() => {
    if (deliveryMethod !== 'delivery') return 0;
    const type = store.shipping_type || 'customer_pays';
    const flatFee = parseFloat(String(store.shipping_flat_fee ?? 0)) || 0;
    if (type === 'free') return 0;
    if (type === 'free_above_threshold') {
      const threshold = parseFloat(String(store.shipping_free_threshold ?? 0)) || 0;
      return cartTotal >= threshold ? 0 : flatFee;
    }
    if (type === 'custom' && Array.isArray(store.shipping_custom_rules) && store.shipping_custom_rules.length > 0) {
      const matched = [...store.shipping_custom_rules]
        .map((r) => ({ min: parseFloat(String(r.min_subtotal)) || 0, fee: parseFloat(String(r.fee)) || 0 }))
        .sort((a, b) => a.min - b.min)
        .filter((r) => cartTotal >= r.min)
        .pop();
      return matched ? matched.fee : flatFee;
    }
    return flatFee;
  }, [deliveryMethod, cartTotal, store.shipping_type, store.shipping_flat_fee, store.shipping_free_threshold, store.shipping_custom_rules]);

  const handlingFee = useMemo(() => {
    if (deliveryMethod !== 'delivery') return 0;
    return parseFloat(String(store.shipping_handling_fee ?? 0)) || 0;
  }, [deliveryMethod, store.shipping_handling_fee]);

  const isDigitalOnly = useMemo(() => {
    if (cart.length === 0) return false;
    return cart.every(item => {
      if (item.is_digital !== undefined) return item.is_digital;
      const product = products.find(p => p.id === item.productId);
      return Boolean(product?.is_digital);
    });
  }, [cart, products]);

  const orderTotal = cartTotal + (isDigitalOnly ? 0 : shippingFee + handlingFee);

  const [createdOrderData, setCreatedOrderData] = useState<any>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [confirmedOrderSnapshot, setConfirmedOrderSnapshot] = useState<any>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  const confirmedOrderId = confirmedOrderSnapshot?.orderId || createdOrderData?.order?.id || bankTransferDetails?.order_id;
  const confirmedOrderNum = confirmedOrderSnapshot?.orderNumber || createdOrderData?.order?.order_number || bankTransferDetails?.order_number;
  const confirmedAmount = confirmedOrderSnapshot?.totalAmount ?? (createdOrderData?.order?.total_amount ? Number(createdOrderData.order.total_amount) : (Number(bankTransferDetails?.amount) || orderTotal));
  const confirmedCurrency = confirmedOrderSnapshot?.currencyCode || createdOrderData?.order?.currency_code || bankTransferDetails?.currency_code || selectedCurrency;
  const confirmedDeliveryMethod = confirmedOrderSnapshot?.deliveryMethod || createdOrderData?.order?.delivery_method || (isDigitalOnly ? 'digital' : deliveryMethod);
  const confirmedDeliveryAddress = confirmedOrderSnapshot?.deliveryAddress || createdOrderData?.order?.delivery_address || (deliveryMethod === 'delivery' ? customerNote : undefined);
  const confirmedCustomerName = confirmedOrderSnapshot?.customerName || createdOrderData?.order?.customer_name || customerName;
  const confirmedCustomerPhone = confirmedOrderSnapshot?.customerPhone || createdOrderData?.order?.customer_phone || customerPhone;
  const confirmedCustomerEmail = confirmedOrderSnapshot?.customerEmail || createdOrderData?.order?.customer_email || customerEmail;
  const displayItems = confirmedOrderSnapshot?.items || createdOrderData?.order?.items || (cart.length > 0 ? cart : []);

  const handleCopyOrderNumber = (num?: string) => {
    const val = num || confirmedOrderNum;
    if (!val) return;
    navigator.clipboard?.writeText(val);
    setCopiedOrderNumber(true);
    sonnerToast.success('Order reference copied to clipboard!');
    setTimeout(() => setCopiedOrderNumber(false), 2000);
  };

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const receiptOrderData = useMemo(() => {
    if (!confirmedOrderId) return null;
    return {
      id: confirmedOrderId,
      order_number: confirmedOrderNum || '0000',
      receipt_number: `REC-${confirmedOrderNum || '0000'}`,
      customer_name: confirmedCustomerName || 'Customer',
      customer_phone: confirmedCustomerPhone,
      customer_email: confirmedCustomerEmail,
      delivery_method: confirmedDeliveryMethod,
      delivery_address: confirmedDeliveryAddress,
      total_amount: confirmedAmount,
      currency_code: confirmedCurrency,
      payment_status: 'paid',
      payment_method: createdOrderData?.order?.payment_method || 'Paystack / Online',
      created_at: createdOrderData?.order?.created_at || new Date().toISOString(),
      shipping_fee: shippingFee,
      discount_amount: appliedDiscount,
      frontstore_protect_fee: 0,
      store: {
        store_name: store.store_name,
        username: store.username,
        whatsapp_phone: store.whatsapp_phone,
        is_verified: Boolean(store.is_verified),
        logo_url: store.logo_url,
        currency_code: store.currency_code,
      },
      items: (displayItems || []).map((it: any) => ({
        id: it.id,
        product_name: it.name || it.product_name || 'Product',
        product_price: it.price || it.product_price || 0,
        quantity: it.quantity || it.qty || 1,
        product: {
          is_digital: Boolean(it.is_digital),
          image_url: it.image_url || it.product?.image_url,
        },
      })),
    };
  }, [confirmedOrderId, confirmedOrderNum, confirmedCustomerName, confirmedCustomerPhone, confirmedCustomerEmail, confirmedDeliveryMethod, confirmedDeliveryAddress, confirmedAmount, confirmedCurrency, createdOrderData, shippingFee, appliedDiscount, store, displayItems]);


  const digitalItems = useMemo(() => {
    return displayItems.filter((i: any) => {
      if (i.is_digital) return true;
      const prod = products.find((p: any) => p.id === (i.productId || i.product_id));
      return Boolean(prod?.is_digital);
    });
  }, [displayItems, products]);

  const hasDigital = digitalItems.length > 0 || confirmedDeliveryMethod === 'digital' || isDigitalOnly;

  const whatsappFollowupUrl = useMemo(() => {
    if (createdOrderData?.whatsapp_url) return createdOrderData.whatsapp_url;
    const phone = store.whatsapp_phone ? store.whatsapp_phone.replace(/[^0-9]/g, '') : '';
    if (!phone) return null;
    const refText = confirmedOrderNum ? ` #${confirmedOrderNum}` : '';
    const text = `Hello *${store.store_name}*, I have confirmed and paid for my order${refText} on your store!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }, [createdOrderData, store.whatsapp_phone, store.store_name, confirmedOrderNum]);


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
          is_digital: Boolean(product.is_digital),
        },
      ];
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1400);


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
      message += `• *${p.name}${varInfo}* x ${quantity} — ${formatCurrency(totalItemPrice, selectedCurrency)}\n\n`;
      message += `💰 *Total:* ${formatCurrency(totalItemPrice, selectedCurrency)}\n`;
    } else {
      cart.forEach((item, index) => {
        const varInfo = item.variantName ? ` (${item.variantName})` : '';
        message += `${index + 1}. *${item.name}${varInfo}* x ${item.qty} — ${formatCurrency(item.price * item.qty, selectedCurrency)}\n`;
      });
      message += `──────────────────────\n`;
      if (appliedDiscount > 0) {
        message += `🏷️ *Discount applied:* -${formatCurrency(appliedDiscount, selectedCurrency)}\n`;
      }
      if (shippingFee > 0) {
        message += `🚚 *Shipping:* ${formatCurrency(shippingFee, selectedCurrency)}\n`;
      }
      message += `💰 *Total Amount:* ${formatCurrency(orderTotal, selectedCurrency)}\n`;
    }

    if (customerName.trim()) {
      message += `\n👤 *Customer:* ${customerName.trim()}`;
    }
    if (customerPhone.trim()) {
      message += `\n📱 *Phone:* ${customerPhone.trim()}`;
    }
    if (!singleItem) {
      message += `\n🚛 *Method:* ${isDigitalOnly ? 'Digital Delivery (Instant Access)' : (deliveryMethod === 'pickup' ? 'Store Pickup' : 'Delivery')}`;
    }
    if (!isDigitalOnly && customerNote.trim()) {
      message += `\n📝 *${deliveryMethod === 'pickup' ? 'Note' : 'Delivery Address'}:* ${customerNote.trim()}`;
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
      setCartStep('checkout_step1');
      setIsEditingDetails(true);
      return;
    }
    if (!customerPhone.trim()) {
      sonnerToast.error('Please enter your WhatsApp phone number before placing an order.');
      setCartStep('checkout_step1');
      setIsEditingDetails(true);
      return;
    }
    if (!isDigitalOnly && deliveryMethod === 'delivery' && !customerNote.trim()) {
      sonnerToast.error('Please enter a delivery address before placing an order.');
      setCartStep('checkout_step1');
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
            product_variant_id: i.variantId,
            quantity: i.qty,
          })),
          customer_name: customerName || 'Guest Shopper',
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          delivery_method: isDigitalOnly ? 'digital' : deliveryMethod,
          delivery_address: isDigitalOnly ? undefined : (deliveryMethod === 'delivery' ? customerNote : undefined),
          delivery_location: isDigitalOnly ? undefined : (deliveryLocation || undefined),
          notes: orderNotes || undefined,
          payment_method: 'paystack',
        }),
      });

      const data = await res.json();
      const checkoutUrl = data?.checkout_url || data?.data?.checkout_url;

      if (res.ok && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        // Show payment screen modal so user can choose payment method
        setCartStep('payment');
        if (res.ok) {
          setCreatedOrderData(data?.data);
          sonnerToast.success('Order created! Please complete payment below.');
        } else {
          const errorMsg = data?.message || data?.error;
          if (errorMsg) sonnerToast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('Online checkout failed:', err);
      setCartStep('payment');
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
          text: truncateStoreBio(store.store_bio, 306) || `Shop directly from ${store.store_name}!`,
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
      <BankTransferPaymentModal
        open={bankTransferModalOpen}
        onClose={() => setBankTransferModalOpen(false)}
        details={bankTransferDetails}
        currencySymbol={selectedCurrency ? CURRENCY_CONFIG[selectedCurrency]?.symbol : ''}
        onPaid={() => {
          const activeOrder = createdOrderData?.order;
          setConfirmedOrderSnapshot({
            orderId: activeOrder?.id || bankTransferDetails?.order_id,
            orderNumber: activeOrder?.order_number || bankTransferDetails?.order_number,
            totalAmount: activeOrder?.total_amount ? Number(activeOrder.total_amount) : (Number(bankTransferDetails?.amount) || orderTotal),
            currencyCode: activeOrder?.currency_code || selectedCurrency,
            items: (activeOrder?.items && activeOrder.items.length > 0) ? activeOrder.items : [...cart],
            deliveryMethod: activeOrder?.delivery_method || (isDigitalOnly ? 'digital' : deliveryMethod),
            deliveryAddress: activeOrder?.delivery_address || (deliveryMethod === 'delivery' ? customerNote : undefined),
            customerName: activeOrder?.customer_name || customerName,
            customerPhone: activeOrder?.customer_phone || customerPhone,
            customerEmail: activeOrder?.customer_email || customerEmail,
            whatsappUrl: createdOrderData?.whatsapp_url,
          });
          setCartStep('confirmed');
          setCart([]);
        }}
      />
      {/* ── TOP ANNOUNCEMENT / PROMO BANNER ── */}
      {(store.announcement_title || store.announcement_body) && (
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}e6)`,
            color: '#ffffff',
            fontSize: 12.5,
            fontWeight: 700,
            padding: '7.5px 16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: '-0.01em',
            position: 'relative',
            zIndex: 41,
          }}
        >
          <Sparkles size={13} color="#ffffff" />
          <span>{store.announcement_title || store.announcement_body}</span>
        </div>
      )}

      {/* ── STORE HERO & PROFILE COVER ── */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: 'clamp(28px, 5vw, 44px) 20px clamp(24px, 4vw, 36px)',
          position: 'relative',
        }}
      >
        {/* Store Top-Right Policies & Info Menu (⋮) */}
        <div
          ref={storeMenuRef}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 45,
          }}
        >
          <button
            type="button"
            onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
            aria-label="Store menu and policies"
            aria-expanded={isStoreMenuOpen}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
              color: isStoreMenuOpen ? primaryColor : '#334155',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = primaryColor;
              e.currentTarget.style.color = primaryColor;
            }}
            onMouseOut={(e) => {
              if (!isStoreMenuOpen) {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
              }
            }}
          >
            <MoreVertical size={19} />
          </button>

          {isStoreMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 270,
                background: '#ffffff',
                borderRadius: 18,
                border: '1px solid #e2e8f0',
                boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06)',
                padding: '8px 6px',
                zIndex: 60,
                textAlign: 'left',
              }}
            >
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Store Policies &amp; Info
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {store.store_name}
                </div>
              </div>

              {/* Delivery & Fulfillment */}
              <button
                type="button"
                onClick={() => {
                  setIsStoreMenuOpen(false);
                  setActivePolicyTab('delivery');
                  setIsPoliciesOpen(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${primaryColor}14`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Delivery &amp; Fulfillment</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Shipping rates &amp; dispatch timeline</div>
                </div>
              </button>

              {/* Return & Refund */}
              <button
                type="button"
                onClick={() => {
                  setIsStoreMenuOpen(false);
                  setActivePolicyTab('refund');
                  setIsPoliciesOpen(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${primaryColor}14`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <RotateCcw size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Return &amp; Refund Policy</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Buyer protection &amp; returns</div>
                </div>
              </button>

              {/* Product Policy */}
              <button
                type="button"
                onClick={() => {
                  setIsStoreMenuOpen(false);
                  setActivePolicyTab('product');
                  setIsPoliciesOpen(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${primaryColor}14`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Product Policy</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Authenticity &amp; quality guarantee</div>
                </div>
              </button>

              {/* Booking Policy (if configured) */}
              {store.policy_bookings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    setActivePolicyTab('booking');
                    setIsPoliciesOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '9px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: `${primaryColor}14`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Booking &amp; Cancellation</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Appointment terms &amp; rules</div>
                  </div>
                </button>
              )}

              {/* Store Location (if configured) */}
              {store.location && (
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    setIsLocationOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '9px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: `${primaryColor}14`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Store Location</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Pickup address &amp; map</div>
                  </div>
                </button>
              )}

              <div style={{ height: 1, background: '#f1f5f9', margin: '6px 6px' }} />

              {/* Quick actions: Share & QR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '2px 4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    handleShare();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={13} /> Share
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    setIsQrOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <QrCode size={13} /> QR Code
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          {/* Store Logo Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            {store.logo_url ? (
              <img
                src={getOptimizedImageUrl(store.logo_url, 'md')}
                alt={store.store_name}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #ffffff',
                  boxShadow: '0 6px 24px rgba(15, 23, 42, 0.12)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: primaryColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 800,
                  border: '4px solid #ffffff',
                  boxShadow: '0 6px 24px rgba(15, 23, 42, 0.12)',
                }}
              >
                {store.store_name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
          </div>

          {/* Store Title */}
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {store.store_name}
            {isVerified && (
              <span title="Verified Merchant" style={{ display: 'inline-flex', marginLeft: 6, color: primaryColor, verticalAlign: 'middle' }}>
                <ShieldCheck size={22} />
              </span>
            )}
          </h1>

          {/* Store Bio */}
          {store.store_bio && (
            <p
              style={{
                fontSize: 15,
                color: '#334155',
                lineHeight: 1.65,
                margin: '0 auto 22px',
                maxWidth: 620,
                fontWeight: 450,
                whiteSpace: 'pre-line',
              }}
            >
              {truncateStoreBio(store.store_bio, 306)}
            </p>
          )}

          {/* Chat With Nina / Reviews CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleNinaClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#fff',
                color: primaryColor,
                border: `1.5px solid ${primaryColor}`,
                padding: '9px 22px',
                borderRadius: 24,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={15} /> Chat with Nina
            </button>
            <button
              onClick={() => window.location.href = getReviewsUrl()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#fff',
                color: primaryColor,
                border: `1.5px solid ${primaryColor}`,
                padding: '9px 22px',
                borderRadius: 24,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              <Star size={15} /> Reviews
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN CATALOGUE CONTAINER ── */}
      <main id="store-catalog-section" style={{ flex: 1, maxWidth: 1120, width: '100%', margin: '0 auto', padding: '28px 20px calc(96px + env(safe-area-inset-bottom, 0px))' }}>
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

        {/* ── CATALOG TOOLBAR (Item Count & Grid/List View Toggle) ── */}
        {filteredItems.length > 0 && (
          <div className="storefront-catalog-toolbar">
            <div className="storefront-catalog-count">
              <span>
                {activeTab === 'saved'
                  ? `${filteredItems.length} saved item${filteredItems.length === 1 ? '' : 's'}`
                  : `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`}
              </span>
            </div>

            <div className="storefront-view-toggle" role="group" aria-label="Catalog view mode">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`storefront-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid view"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`storefront-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="List view"
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List size={16} />
              </button>
            </div>
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

              return (
                <Link
                  key={item.id}
                  href={getProductUrl(item)}
                  className="storefront-product-card"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    setQuickViewImageIndex(0);
                    setQuickViewQty(1);
                    setQuickViewProduct(item);
                  }}
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
                    <div style={{ opacity: isOutOfStock ? 0.5 : 1 }}>
                      <ProductImageWithSkeleton
                        src={imageUrl}
                        alt={item.name}
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    </div>

                    {/* Discount / Out of Stock Pill */}
                    {isOutOfStock ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: '#ffffff',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 9999,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        Out of Stock
                      </span>
                    ) : hasDiscount && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: '#e11d48',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 9999,
                          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.35)',
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
                      <h4 className="storefront-card-title" style={{ color: isOutOfStock ? '#94a3b8' : undefined }}>
                        {item.name}
                      </h4>

                      <div className="storefront-card-price-row">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
                          <span className="storefront-card-price" style={{ color: isOutOfStock ? '#94a3b8' : undefined }}>
                            {formatCurrency(priceNum, selectedCurrency)}
                          </span>
                          {hasDiscount && !isOutOfStock && (
                            <span style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                              {formatCurrency(compareNum, selectedCurrency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart / Edit Selection Button */}
                    {!isOutOfStock && (() => {
                      const inCartItem = cart.find(c => c.productId === item.id);
                      const cartQty = inCartItem ? inCartItem.qty : 0;
                      if (cartQty > 0) {
                        return (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsCartOpen(true);
                            }}
                            className="storefront-card-btn"
                            style={{
                              background: '#fff',
                              color: '#e11d48',
                              border: '1.5px solid #e11d48',
                              borderRadius: 9999,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              fontWeight: 700,
                            }}
                          >
                            Edit Selection
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                background: '#e11d48',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {cartQty}
                            </span>
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="storefront-card-btn"
                          style={{
                            background: isJustAdded ? '#10b981' : '#fff',
                            color: isJustAdded ? '#ffffff' : primaryColor,
                            border: isJustAdded ? 'none' : `1.5px solid ${primaryColor}`,
                            cursor: 'pointer',
                            boxShadow: isJustAdded ? '0 4px 14px rgba(16, 185, 129, 0.45)' : 'none',
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
                      );
                    })()}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW (Big Jiji-sized image with clean Frontstore details) */
          <div className="storefront-list-container">
            {paginatedItems.map((item, index) => {
              const priceNum = parseFloat(item.price || '0');
              const compareNum = item.compare_at_price ? parseFloat(item.compare_at_price) : 0;
              const hasDiscount = compareNum > priceNum;
              const discountPercent = hasDiscount ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0;
              const isOutOfStock = item.stock_status === 'out_of_stock';
              const rawImageUrl = (item.image_urls && item.image_urls[0]) || null;
              const imageUrl = optimizeImageUrl(rawImageUrl, 'md');
              const isService = item.type === 'service';
              const isSaved = wishlist.includes(item.id);
              const isJustAdded = recentlyAddedId === item.id;

              return (
                <div
                  key={item.id}
                  className="storefront-list-card"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    setQuickViewImageIndex(0);
                    setQuickViewQty(1);
                    setQuickViewProduct(item);
                  }}
                >
                  {/* Left Column: Big Image (Jiji size) */}
                  <div className="storefront-list-thumb-wrapper">
                    <div style={{ width: '100%', height: '100%', opacity: isOutOfStock ? 0.5 : 1 }}>
                      <ProductImageWithSkeleton
                        src={imageUrl}
                        alt={item.name}
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    </div>

                    {/* Stock / Discount Tag */}
                    {isOutOfStock ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: '#ffffff',
                          color: '#e11d48',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 9999,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        Out of stock
                      </span>
                    ) : hasDiscount ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: '#e11d48',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 9999,
                          boxShadow: '0 2px 6px rgba(225, 29, 72, 0.35)',
                        }}
                      >
                        -{discountPercent}%
                      </span>
                    ) : null}
                  </div>

                  {/* Right Column: Title, Price & Action Buttons */}
                  <div className="storefront-list-content">
                    <div className="storefront-list-details">
                      <h4 className="storefront-list-title" style={{ color: isOutOfStock ? '#94a3b8' : undefined }}>
                        {item.name}
                      </h4>
                      <div className="storefront-list-price-row">
                        <span
                          className="storefront-list-price"
                          style={{ color: isOutOfStock ? '#94a3b8' : undefined }}
                        >
                          {formatCurrency(priceNum, selectedCurrency)}
                        </span>
                        {hasDiscount && !isOutOfStock && (
                          <span className="storefront-list-compare-price">
                            {formatCurrency(compareNum, selectedCurrency)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons (Wishlist + Cart) */}
                    <div className="storefront-list-actions" onClick={(e) => e.stopPropagation()}>
                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(item.id, e);
                        }}
                        title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                        aria-label="Save to wishlist"
                        className={`storefront-list-wishlist-btn ${isSaved ? 'saved' : ''}`}
                      >
                        <Heart size={15} fill={isSaved ? '#ef4444' : 'transparent'} />
                      </button>

                      {/* Add to Cart Button */}
                      {!isOutOfStock && (() => {
                        const inCartItem = cart.find((c) => c.productId === item.id);
                        const cartQty = inCartItem ? inCartItem.qty : 0;

                        if (cartQty > 0) {
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsCartOpen(true);
                              }}
                              className="storefront-flyer-action-btn added"
                              title={`In your bag (${cartQty}). Click to view bag`}
                              aria-label="View bag"
                              style={{ position: 'relative' }}
                            >
                              <ShoppingBag size={16} />
                              <span className="storefront-list-badge-count">
                                {cartQty}
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isService || (item.variants && item.variants.length > 0)) {
                                setQuickViewImageIndex(0);
                                setQuickViewQty(1);
                                setQuickViewProduct(item);
                              } else {
                                addToCart(item);
                              }
                            }}
                            className={`storefront-flyer-action-btn ${isJustAdded ? 'added' : ''}`}
                            title={isService ? 'Book service' : isJustAdded ? 'Added to bag!' : 'Add to bag'}
                            aria-label="Add to cart"
                          >
                            {isJustAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
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

              <div style={{ display: 'flex', overflowX: 'auto', gap: 16, scrollSnapType: 'x mandatory', paddingBottom: 12, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                {reviews.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      minWidth: 280,
                      maxWidth: 320,
                      flex: '0 0 auto',
                      scrollSnapAlign: 'start',
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

      {/* ── PROFESSIONAL STICKY FOOTER (HOME - ASK NINA - CART) ── */}
      {!isCartOpen && (
        <nav
          aria-label="Store bottom navigation"
          className="storefront-bottom-nav"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 150,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.06)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: '0 auto',
              padding: '0 24px',
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
              {/* Home Tab */}
              <button
                type="button"
                onClick={handleHomeClick}
                aria-label="Home"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  gap: 3,
                }}
              >
                <Home
                  size={22}
                  strokeWidth={1.8}
                  color={activeTab === 'all' && selectedCategoryId === 'all' && !searchTerm ? '#0f172a' : '#64748b'}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: activeTab === 'all' && selectedCategoryId === 'all' && !searchTerm ? '#0f172a' : '#64748b',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Home
                </span>
              </button>

              {/* Middle: Ask Nina (Elevated protruding button) */}
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -22,
                }}
              >
                <button
                  type="button"
                  onClick={handleNinaClick}
                  aria-label={store.nina_chat_qr_enabled ? 'Chat with Nina AI' : 'Contact Store'}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '3.5px solid #ffffff',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.14), 0 0 0 1.5px rgba(226, 232, 240, 0.8)',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: primaryColor || '#0B5D39',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={store.nina_avatar_url || '/ninaAssistant.png'}
                      alt="Nina AI"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Sparkle badge at bottom-right corner of avatar */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: primaryColor || '#0B5D39',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Sparkles size={9} color="#ffffff" strokeWidth={2.5} />
                  </span>
                </button>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    color: '#0f172a',
                    marginTop: 3,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Chat with Nina
                </span>
              </div>

              {/* Cart Tab */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Cart (${totalCartCount} items)`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  gap: 3,
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag
                    size={22}
                    strokeWidth={1.8}
                    color={totalCartCount > 0 ? '#0f172a' : '#64748b'}
                  />
                  {totalCartCount > 0 && (
                    <span
                      key={totalCartCount}
                      className="cart-alert-badge"
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -9,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 999,
                        background: '#ea580c',
                        color: '#ffffff',
                        fontSize: 10.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
                        lineHeight: 1,
                        animation: 'cartBadgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      {totalCartCount > 99 ? '99+' : totalCartCount}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: totalCartCount > 0 ? 700 : 600,
                    color: totalCartCount > 0 ? '#0f172a' : '#64748b',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Cart
                </span>
              </button>
          </div>
        </nav>
      )}

      {/* Styled Keyframes */}
      <style>{`
        @keyframes cartBadgePop {
          0% { transform: scale(0.35); }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* ── FLOATING SAVED ITEMS BUTTON ── */}
      {wishlist.length > 0 && !isWishlistOpen && (
        <button
          onClick={() => setIsWishlistOpen(true)}
          aria-label="View Saved Items"
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 90,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
          }}
        >
          <Heart size={18} fill="#ef4444" />
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
        </button>
      )}

      {/* ── PRODUCT QUICK VIEW MODAL ── */}
      {quickViewProduct && (() => {
        const item = quickViewProduct;
        const priceNum = parseFloat(item.price || '0');
        const compareNum = item.compare_at_price ? parseFloat(item.compare_at_price) : 0;
        const hasDiscount = compareNum > priceNum;
        const isOutOfStock = item.stock_status === 'out_of_stock';
        const isService = item.type === 'service';
        const isJustAdded = recentlyAddedId === item.id;
        const images = item.image_urls && item.image_urls.length > 0 ? item.image_urls : [null];
        const activeImage = optimizeImageUrl(images[quickViewImageIndex] ?? images[0], 'lg');
        const maxQty = item.stock_quantity && item.stock_quantity > 0 ? item.stock_quantity : undefined;

        return (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#fff', overflowY: 'auto' }}>
            {/* Top Bar */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid #e2e8f0',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}${getProductUrl(item)}` : '';
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: item.name, url }).catch(() => {});
                  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                    sonnerToast.success('Product link copied');
                  }
                }}
                aria-label="Share product"
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', cursor: 'pointer' }}
              >
                <Share2 size={16} />
              </button>

              <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {store.logo_url && (
                  <img
                    src={getOptimizedImageUrl(store.logo_url, 'thumb')}
                    alt={store.store_name}
                    style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }}
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                  />
                )}
                <span>{store.store_name}</span>
              </div>

              <button
                onClick={() => setQuickViewProduct(null)}
                aria-label="Close"
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 40 }}>
              {/* Image Gallery */}
              <div>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    background: '#f1f5f9',
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: 'zoom-in',
                  }}
                  onClick={() => setIsQuickViewLightboxOpen(true)}
                >
                  <ProductImageWithSkeleton src={activeImage} alt={item.name} loading="eager" />

                  {/* Expand Image Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsQuickViewLightboxOpen(true);
                    }}
                    aria-label="Expand image to full view"
                    title="Expand to full view"
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      right: 14,
                      zIndex: 10,
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a',
                      cursor: 'pointer',
                      transition: 'transform 0.16s ease, background 0.16s ease',
                    }}
                  >
                    <Maximize2 size={17} strokeWidth={2.2} />
                  </button>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewImageIndex((i) => (i - 1 + images.length) % images.length);
                        }}
                        aria-label="Previous image"
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 10 }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewImageIndex((i) => (i + 1) % images.length);
                        }}
                        aria-label="Next image"
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 10 }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuickViewImageIndex(idx)}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          overflow: 'hidden',
                          padding: 0,
                          background: '#f1f5f9',
                          border: idx === quickViewImageIndex ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                          cursor: 'pointer',
                        }}
                      >
                        <img src={optimizeImageUrl(img, 'thumb')} alt={`${item.name} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, margin: '0 0 16px' }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', margin: 0, wordBreak: 'break-word' }}>{item.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 19, fontWeight: 700, color: '#0f172a' }}>{formatCurrency(priceNum, selectedCurrency)}</span>
                    {hasDiscount && (
                      <span style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'line-through' }}>{formatCurrency(compareNum, selectedCurrency)}</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 16 }}>
                  {item.description && (
                    <p style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.65, margin: '0 0 16px', whiteSpace: 'pre-line' }}>{item.description}</p>
                  )}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: isOutOfStock ? '#fef2f2' : `${primaryColor}14`,
                      color: isOutOfStock ? '#ef4444' : primaryColor,
                    }}
                  >
                    {isOutOfStock ? 'OUT OF STOCK' : maxQty ? `${maxQty} IN STOCK` : 'IN STOCK'}
                  </span>
                </div>

                <div style={{ 
                  marginTop: 'auto', 
                  paddingTop: 16, 
                  paddingBottom: 16, 
                  borderTop: '1px solid #e2e8f0', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 12,
                  position: 'sticky',
                  bottom: 0,
                  background: '#fff',
                  zIndex: 10
                }}>
                  {!isOutOfStock && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', background: '#f8fafc' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{formatCurrency(priceNum, selectedCurrency)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button
                          onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                          aria-label="Decrease quantity"
                          style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 15, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{quickViewQty}</span>
                        <button
                          onClick={() => setQuickViewQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))}
                          aria-label="Increase quantity"
                          style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    {!isOutOfStock && (
                      <button
                        onClick={() => {
                          addToCart(item, null, undefined, quickViewQty);
                          setQuickViewProduct(null);
                          setIsCartOpen(true);
                          setCartStep('checkout_step1');
                        }}
                        style={{
                          flex: 1,
                          padding: '15px',
                          borderRadius: 12,
                          border: 'none',
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          background: '#0f172a',
                          color: '#fff',
                        }}
                      >
                        Buy it Now
                      </button>
                    )}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(item, null, undefined, quickViewQty)}
                      style={{
                        flex: 1,
                        padding: '15px',
                        borderRadius: 12,
                        border: 'none',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        background: isOutOfStock ? '#e2e8f0' : isJustAdded ? '#10b981' : primaryColor,
                        color: isOutOfStock ? '#94a3b8' : '#fff',
                      }}
                    >
                      {isOutOfStock ? (
                        'Out of Stock'
                      ) : isJustAdded ? (
                        <>
                          <Check size={17} /> Added!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={17} /> {isService ? 'Book' : 'Add To Cart'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── QUICK VIEW IMAGE LIGHTBOX ── */}
      {quickViewProduct && (
        <ImageLightbox
          open={isQuickViewLightboxOpen}
          images={quickViewProduct.image_urls || []}
          index={quickViewImageIndex}
          onIndexChange={setQuickViewImageIndex}
          onClose={() => setIsQuickViewLightboxOpen(false)}
          alt={quickViewProduct.name}
        />
      )}

      {/* ── PRODUCT CART MODAL ── */}
      {isCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsCartOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)',
            }}
          >
            {/* Header */}
            <div
              style={{
                flexShrink: 0,
                padding: '20px 24px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1e293b' }}>
                  {cartStep === 'cart' && 'Your Cart'}
                  {cartStep === 'checkout_step1' && 'Purchase Information'}
                  {cartStep === 'checkout_step2' && 'Extra Information'}
                  {cartStep === 'checkout_step3' && 'Order Summary'}
                  {cartStep === 'payment' && 'Make Payment'}
                  {cartStep === 'confirmed' && 'Order Confirmed'}
                </h3>
                {cartStep === 'cart' && (
                  <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                    {totalCartCount} {totalCartCount === 1 ? 'Item' : 'Items'}
                  </p>
                )}
                {cartStep === 'confirmed' && (
                  <p style={{ fontSize: 13, color: '#16a34a', margin: '2px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Payment verified
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (cartStep === 'confirmed') {
                    setCart([]);
                    setCartStep('cart');
                  }
                }}
                aria-label="Close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Progress Line for Checkout Steps */}
            {['checkout_step1', 'checkout_step2', 'checkout_step3'].includes(cartStep) && (
              <div style={{ display: 'flex', gap: 6, padding: '12px 24px 0' }}>
                <div
                  style={{
                    height: 4,
                    flex: 1,
                    background: '#e11d48',
                    borderRadius: 2,
                  }}
                />
                <div
                  style={{
                    height: 4,
                    flex: 1,
                    background: ['checkout_step2', 'checkout_step3'].includes(cartStep) ? '#e11d48' : '#e2e8f0',
                    borderRadius: 2,
                    transition: 'background 0.3s',
                  }}
                />
                <div
                  style={{
                    height: 4,
                    flex: 1,
                    background: cartStep === 'checkout_step3' ? '#e11d48' : '#e2e8f0',
                    borderRadius: 2,
                    transition: 'background 0.3s',
                  }}
                />
              </div>
            )}

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* STEP 0: YOUR CART */}
              {cartStep === 'cart' && (
                <div>
                  <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Review your items and proceed to checkout when you're ready
                  </p>



                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                      <ShoppingBag size={48} style={{ margin: '0 auto 14px', opacity: 0.35, color: primaryColor }} />
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Your cart is empty</p>
                      <p style={{ fontSize: 13.5, color: '#64748b' }}>Add products from the store to continue.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            gap: 14,
                            alignItems: 'center',
                          }}
                        >
                          <img
                            src={item.image_url || ''}
                            alt={item.name}
                            style={{ width: 68, height: 68, borderRadius: 14, objectFit: 'cover', background: '#f1f5f9', flexShrink: 0 }}
                          />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 4px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </p>
                            <p style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {formatCurrency(item.price * item.qty, selectedCurrency)}
                            </p>

                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                aria-label="Decrease quantity"
                                style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                              >
                                <Minus size={12} />
                              </button>
                              <span style={{ fontSize: 13.5, fontWeight: 700, minWidth: 16, textAlign: 'center', color: '#0f172a' }}>
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, 1)}
                                aria-label="Increase quantity"
                                style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ background: '#fff', border: '1px solid #fecdd3', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', color: '#e11d48', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: PURCHASE INFORMATION */}
              {cartStep === 'checkout_step1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Processing timeline notice */}
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #D1FAE5',
                      borderRadius: 14,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bell size={16} />
                    </div>
                    <p style={{ fontSize: 12.5, color: '#047857', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                      It typically takes 3 day(s) to process and complete your order. Once your order is ready, we'll notify you.
                    </p>
                  </div>

                  {/* Cart item summary pill */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, border: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', marginLeft: 4 }}>
                        {cart.slice(0, 3).map((item, idx) => (
                          <img
                            key={item.id}
                            src={item.image_url || ''}
                            alt={item.name}
                            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: idx > 0 ? -8 : 0 }}
                          />
                        ))}
                      </div>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                          {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginLeft: 8 }}>
                          {formatCurrency(cartTotal, selectedCurrency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCartStep('cart')}
                      style={{
                        background: '#FFF5F5',
                        color: '#e11d48',
                        border: '1px solid #FECDD3',
                        borderRadius: 9999,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ChevronLeft size={14} /> Back to Cart
                    </button>
                  </div>

                  {/* Section: Your Details */}
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', margin: '0 0 10px' }}>Your Details</h4>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: '14px 16px', background: '#fff' }}>
                      {!isEditingDetails && customerName ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEE2E2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={20} />
                            </div>
                            <div>
                              <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>{customerName}</p>
                              <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                                {customerPhone}{customerEmail ? ` • ${customerEmail}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsEditingDetails(true)}
                            style={{
                              background: '#FFF5F5',
                              color: '#e11d48',
                              border: '1px solid #FECDD3',
                              borderRadius: 9999,
                              padding: '5px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            Edit <Edit3 size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input
                            type="text"
                            placeholder="Full name *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13.5, color: '#0f172a', outline: 'none' }}
                          />
                          <input
                            type="tel"
                            placeholder="WhatsApp phone number *"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13.5, color: '#0f172a', outline: 'none' }}
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13.5, color: '#0f172a', outline: 'none' }}
                          />
                          <button
                            onClick={() => {
                              saveCustomerDetailsToStorage(customerName, customerPhone, customerEmail, customerNote, deliveryLocation);
                              setIsEditingDetails(false);
                            }}
                            style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end' }}
                          >
                            Save Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isDigitalOnly ? (
                    <>
                      {/* Section: Delivery Location & Address */}
                      <div>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', margin: '0 0 10px' }}>How would you like to get your order?</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <button
                            onClick={() => setIsRecipientDifferent(!isRecipientDifferent)}
                            style={{
                              background: '#FFF5F5',
                              color: '#e11d48',
                              border: '1px solid #FECDD3',
                              borderRadius: 9999,
                              padding: '7px 16px',
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              alignSelf: 'flex-start',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            {isRecipientDifferent ? 'Sending to yourself?' : 'Sending this to someone else?'} <Edit3 size={13} />
                          </button>

                          {isRecipientDifferent && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: '#fff', border: '1px dashed #fecdd3', borderRadius: 12 }}>
                              <input
                                type="text"
                                placeholder="Recipient full name *"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                              />
                              <input
                                type="tel"
                                placeholder="Recipient phone number *"
                                value={recipientPhone}
                                onChange={(e) => setRecipientPhone(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                              />
                            </div>
                          )}

                          {/* Select Delivery Location */}
                          <div style={{ position: 'relative', marginTop: 4 }}>
                            <label style={{ position: 'absolute', top: -9, left: 12, background: '#fff', padding: '0 4px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                              Select Delivery Location
                            </label>
                            <select
                              value={deliveryLocation}
                              onChange={(e) => {
                                setDeliveryLocation(e.target.value);
                                saveCustomerDetailsToStorage(customerName, customerPhone, customerEmail, customerNote, e.target.value);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: '1px solid #cbd5e1',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0f172a',
                                background: '#fff',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="Lagos State">Lagos State</option>
                              <option value="Other States [GIGL]">Other States [GIGL]</option>
                              <option value="Abuja (FCT)">Abuja (FCT)</option>
                              <option value="Port Harcourt">Port Harcourt</option>
                              <option value="International Shipping">International Shipping</option>
                            </select>
                          </div>

                          {/* Delivery Address Textarea */}
                          <div style={{ position: 'relative', marginTop: 6 }}>
                            <label style={{ position: 'absolute', top: -9, left: 12, background: '#fff', padding: '0 4px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                              Delivery Address
                            </label>
                            <textarea
                              rows={3}
                              value={customerNote}
                              onChange={(e) => {
                                setCustomerNote(e.target.value);
                                saveCustomerDetailsToStorage(customerName, customerPhone, customerEmail, e.target.value, deliveryLocation);
                              }}
                              placeholder="Enter street address, landmark, or city..."
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: '1px solid #cbd5e1',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#0f172a',
                                background: '#fff',
                                outline: 'none',
                                resize: 'none',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section: Delivery Options */}
                      <div>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', margin: '0 0 10px' }}>Delivery Options</h4>
                        <div
                          onClick={() => setDeliveryMethod('delivery')}
                          style={{ border: '1px solid #f1f5f9', borderRadius: 16, padding: '14px 16px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FEE2E2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Truck size={18} />
                            </div>
                            <div>
                              <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>
                                {deliveryMethod === 'pickup' ? 'Store Pickup' : 'Standard'}
                              </p>
                              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                {deliveryMethod === 'pickup' ? (store.location || 'Pick up directly from store') : "We'll find a courier to deliver your order"}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                              {deliveryMethod === 'pickup' ? 'Free' : shippingFee > 0 ? formatCurrency(shippingFee, selectedCurrency) : 'Free'}
                            </span>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '5px solid #e11d48', background: '#fff' }} />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Section: Digital Product Info */
                    <div style={{
                      padding: '16px',
                      background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                      border: '1px solid #BBF7D0',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Download size={18} />
                      </div>
                      <div>
                        <h5 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#14532D' }}>Instant Digital Delivery</h5>
                        <p style={{ margin: 0, fontSize: 12.5, color: '#166534', lineHeight: 1.45 }}>
                          No shipping address required. Download links and access credentials will be delivered immediately after payment.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: EXTRA INFORMATION */}
              {cartStep === 'checkout_step2' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 14, color: '#334155', margin: 0, fontWeight: 500 }}>
                    Do you have any notes or special instructions?
                  </p>

                  <div style={{ position: 'relative', marginTop: 10 }}>
                    <label style={{ position: 'absolute', top: -9, left: 12, background: '#fff', padding: '0 4px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                      Order Notes
                    </label>
                    <textarea
                      rows={5}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Please include a gift card, call before delivery, color preferences, etc."
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        color: '#0f172a',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER SUMMARY */}
              {cartStep === 'checkout_step3' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Summary</h4>
                  </div>

                  {/* Cart Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>{item.name}</p>
                          {item.variantName && <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px' }}>{item.variantName}</p>}
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {formatCurrency(item.price * item.qty, selectedCurrency)}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={11} /></button>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={11} /></button>
                          </div>
                        </div>
                        <Trash2 size={16} style={{ color: '#e11d48', cursor: 'pointer' }} onClick={() => removeFromCart(item.id)} />
                      </div>
                    ))}
                  </div>

                  {/* Summarized Contact/Shipping Cards */}
                  <div style={{ border: '1px solid #f1f5f9', borderRadius: 16, background: '#fafafa', overflow: 'hidden' }}>
                    {/* Contact */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px' }}>Contact:</p>
                        <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>{customerName || 'Guest Customer'}</p>
                        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>{customerPhone || 'No phone'}{customerEmail ? ` • ${customerEmail}` : ''}</p>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <User size={16} />
                      </div>
                    </div>

                    {/* Ship To */}
                    {!isDigitalOnly && (
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px' }}>Ship To:</p>
                          <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>{isRecipientDifferent && recipientName ? recipientName : customerName || 'Guest'}</p>
                          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>{customerNote || 'No address provided'} ({deliveryLocation})</p>
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <MapPin size={16} />
                        </div>
                      </div>
                    )}

                    {/* Delivery / Fulfillment Method */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px' }}>{isDigitalOnly ? 'Fulfillment:' : 'Delivery Method:'}</p>
                        <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>
                          {isDigitalOnly ? 'Digital Delivery' : (deliveryMethod === 'pickup' ? 'Store Pickup' : 'Standard')}
                        </p>
                        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
                          {isDigitalOnly ? 'Instant Download & Access' : (deliveryMethod === 'pickup' ? 'Pick up from store' : 'Standard Delivery')}
                        </p>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        {isDigitalOnly ? <Download size={16} /> : <Package size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY breakdown */}
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>SUMMARY</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>Total Items ({totalCartCount})</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(cartTotal, selectedCurrency)}</span>
                      </div>
                      {!isDigitalOnly && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Delivery Fee</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {deliveryMethod === 'pickup' ? 'Free' : shippingFee > 0 ? formatCurrency(shippingFee, selectedCurrency) : 'Free'}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 800, fontSize: 15, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                        <span>Total</span>
                        <span>{formatCurrency(orderTotal, selectedCurrency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: MAKE PAYMENT */}
              {cartStep === 'payment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Warning banner */}
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #D1FAE5',
                      borderRadius: 14,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#D1FAE5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertCircle size={15} />
                    </div>
                    <p style={{ fontSize: 12.5, color: '#047857', margin: 0, fontWeight: 500 }}>
                      Please make payment within 30 minutes to avoid order being cancelled
                    </p>
                  </div>

                  {/* Payment Header Badge */}
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#0F766E', color: '#fff', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={26} />
                    </div>
                    <p style={{ fontSize: 16, color: '#475569', margin: '0 0 4px', fontWeight: 500 }}>Pay</p>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {formatCurrency(orderTotal, selectedCurrency)}
                    </h2>
                  </div>

                  {/* Payment Options */}
                  <div style={{ border: '1px solid #f1f5f9', borderRadius: 16, background: '#fafafa', overflow: 'hidden' }}>
                    {/* Share with friend */}
                    <div
                      onClick={handleShare}
                      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Share2 size={18} />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>Share with friend to pay</p>
                        </div>
                      </div>
                      <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: ORDER CONFIRMED */}
              {cartStep === 'confirmed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Visual Celebration Hero */}
                  <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        boxShadow: '0 0 0 8px #f0fdf4, 0 4px 12px rgba(22, 163, 74, 0.15)',
                      }}
                    >
                      <CheckCircle2 size={34} style={{ strokeWidth: 2.4 }} />
                    </div>
                    <h4 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                      Payment Received!
                    </h4>
                    <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Thank you{confirmedCustomerName ? `, ${confirmedCustomerName}` : ''}! Your order has been placed and confirmed with{' '}
                      <strong style={{ color: '#0f172a' }}>{store.store_name}</strong>.
                    </p>
                  </div>

                  {/* Success Alert Banner Card */}
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: 16,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#dcfce7',
                          color: '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <Check size={18} style={{ strokeWidth: 3 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {hasDigital ? 'Downloads Ready & Link Sent' : 'Order Link & Confirmation Sent'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.45 }}>
                          {hasDigital ? (
                            <>
                              We've sent your order receipt and access link to your <strong>WhatsApp</strong>
                              {confirmedCustomerPhone ? ` (${confirmedCustomerPhone})` : ''}
                              {confirmedCustomerEmail ? ` and email (${confirmedCustomerEmail})` : ''}. You can also download your digital files directly below!
                            </>
                          ) : (
                            <>
                              We've sent your order receipt and live tracking link to your <strong>WhatsApp</strong>
                              {confirmedCustomerPhone ? ` (${confirmedCustomerPhone})` : ''}
                              {confirmedCustomerEmail ? ` and email (${confirmedCustomerEmail})` : ''}. Check your messages to follow your order!
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Order Reference Pill */}
                    {confirmedOrderNum && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#ffffff',
                          borderRadius: 10,
                          border: '1px solid #bbf7d0',
                          padding: '8px 12px',
                          marginTop: 4,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>Order Ref:</span>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                            #{confirmedOrderNum}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderNumber(confirmedOrderNum)}
                          style={{
                            background: copiedOrderNumber ? '#dcfce7' : '#f8fafc',
                            border: '1px solid',
                            borderColor: copiedOrderNumber ? '#86efac' : '#e2e8f0',
                            color: copiedOrderNumber ? '#15803d' : '#475569',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.2s',
                          }}
                        >
                          {copiedOrderNumber ? (
                            <>
                              <Check size={12} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Official Receipt Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 16,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: '#f0fdf4',
                          color: '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Receipt size={20} />
                      </div>
                      <div>
                        <h5 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          Official Order Receipt
                        </h5>
                        <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                          Download PDF or view verified receipt
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setIsReceiptModalOpen(true)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                      {confirmedOrderId && (
                        <a
                          href={`${getApiUrl()}/v1/orders/${confirmedOrderId}/receipt/pdf`}
                          download={`receipt-${confirmedOrderNum || 'order'}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: '#075E54',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: 12.5,
                            fontWeight: 700,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(7, 94, 84, 0.2)',
                          }}
                        >
                          <Download size={13} /> PDF
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Digital Downloads Card (If Order Contains Digital Items) */}
                  {hasDigital && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: 16,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Download size={16} />
                          </div>
                          <div>
                            <h5 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                              Digital Product Downloads
                            </h5>
                            <p style={{ fontSize: 11.5, color: '#64748b', margin: 0 }}>Instant access unlocked</p>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: 20,
                          }}
                        >
                          Ready
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {digitalItems.map((item: any, idx: number) => {
                          const prod = products.find((p: any) => p.id === (item.productId || item.product_id));
                          const name = item.product_name || item.name || prod?.name || 'Digital Item';
                          const fileUrl = prod?.digital_file_url;
                          const directLink = prod?.digital_link;

                          return (
                            <div
                              key={item.id || idx}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                                  {name}
                                </span>
                                <span style={{ fontSize: 12, color: '#64748b' }}>Qty: {item.quantity || item.qty || 1}</span>
                              </div>

                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {fileUrl && (
                                  <a
                                    href={fileUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      background: primaryColor || '#e11d48',
                                      color: '#ffffff',
                                      padding: '8px 14px',
                                      borderRadius: 8,
                                      fontSize: 12.5,
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <Download size={14} /> Download File
                                  </a>
                                )}
                                {directLink && (
                                  <a
                                    href={directLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      background: '#ffffff',
                                      color: '#0f172a',
                                      border: '1.5px solid #e2e8f0',
                                      padding: '8px 14px',
                                      borderRadius: 8,
                                      fontSize: 12.5,
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <ExternalLink size={14} /> Open Access Link
                                  </a>
                                )}
                                {confirmedOrderId && !fileUrl && !directLink && (
                                  <Link
                                    href={`/track/${confirmedOrderId}`}
                                    onClick={() => {
                                      setIsCartOpen(false);
                                      setCart([]);
                                      setCartStep('cart');
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      background: primaryColor || '#e11d48',
                                      color: '#ffffff',
                                      padding: '8px 14px',
                                      borderRadius: 8,
                                      fontSize: 12.5,
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <Download size={14} /> View Downloads on Tracking Page
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Details Breakdown Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 16,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Amount Paid</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: 12 }}>
                          PAID
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                          {formatCurrency(confirmedAmount, confirmedCurrency)}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: 1, background: '#f1f5f9' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>Fulfillment</span>
                      <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                        {confirmedDeliveryMethod === 'digital'
                          ? 'Digital Delivery (Instant Access)'
                          : confirmedDeliveryMethod === 'pickup'
                          ? 'Store Pickup'
                          : 'Standard Delivery'}
                      </span>
                    </div>

                    {confirmedDeliveryAddress && confirmedDeliveryMethod !== 'pickup' && confirmedDeliveryMethod !== 'digital' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Delivery Address</span>
                        <span style={{ fontWeight: 500, color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>
                          {confirmedDeliveryAddress}
                        </span>
                      </div>
                    )}

                    {confirmedCustomerName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <span style={{ color: '#64748b' }}>Customer</span>
                        <span style={{ fontWeight: 500, color: '#0f172a' }}>
                          {confirmedCustomerName} {confirmedCustomerPhone ? `(${confirmedCustomerPhone})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items Preview */}
                  {displayItems && displayItems.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                        Ordered Items ({displayItems.length})
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto' }}>
                        {displayItems.map((item: any, idx: number) => {
                          const name = item.product_name || item.name;
                          const qty = item.quantity || item.qty || 1;
                          const price = item.product_price || item.price;
                          const img = item.image_url || item.product?.image_url;
                          return (
                            <div
                              key={item.id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '8px 10px',
                                background: '#f8fafc',
                                borderRadius: 12,
                                border: '1px solid #f1f5f9',
                              }}
                            >
                              {img ? (
                                <img
                                  src={img}
                                  alt={name}
                                  style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', background: '#e2e8f0', flexShrink: 0 }}
                                />
                              ) : (
                                <div style={{ width: 42, height: 42, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                                  <Package size={20} />
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {name}
                                </p>
                                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                                  Qty: {qty}
                                </p>
                              </div>
                              {price && (
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                                  {formatCurrency(Number(price) * qty, confirmedCurrency)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Frontstore Buyer Protection guarantee pill */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 14,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <ShieldCheck size={20} style={{ color: '#059669', flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>Frontstore Buyer Protection:</strong> Your payment is held safely until the seller fulfills your order.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#ffffff', flexShrink: 0 }}>
              {/* Step 0: Cart */}
              {cartStep === 'cart' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Subtotal</span>
                      <div style={{ display: 'flex', marginLeft: 4 }}>
                        {cart.slice(0, 3).map((item, idx) => (
                          <img
                            key={item.id}
                            src={item.image_url || ''}
                            alt={item.name}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #fff',
                              marginLeft: idx > 0 ? -8 : 0,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(cartTotal, selectedCurrency)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      onClick={() => setCart([])}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: '#FFF5F5',
                        color: '#e11d48',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => setCartStep('checkout_step1')}
                      disabled={cart.length === 0}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: '#e11d48',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Purchase Information */}
              {cartStep === 'checkout_step1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(orderTotal, selectedCurrency)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      onClick={() => handleWhatsAppCheckout()}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: '#FFF5F5',
                        color: '#e11d48',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Make Enquiry
                    </button>
                    <button
                      onClick={() => setCartStep(isDigitalOnly ? 'checkout_step3' : 'checkout_step2')}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: '#e11d48',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Extra Information */}
              {cartStep === 'checkout_step2' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => setIsTotalExpanded(!isTotalExpanded)}>
                      <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Total</span>
                      <ChevronDown size={14} style={{ color: '#64748b' }} />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(orderTotal, selectedCurrency)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      onClick={() => setCartStep('checkout_step1')}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: '#FFF5F5',
                        color: '#e11d48',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => setCartStep('checkout_step3')}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: '#e11d48',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Summary */}
              {cartStep === 'checkout_step3' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    onClick={() => setCartStep(isDigitalOnly ? 'checkout_step1' : 'checkout_step2')}
                    style={{
                      padding: '14px',
                      borderRadius: 14,
                      background: '#FFF5F5',
                      color: '#e11d48',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => {
                      if (!createdOrderData) {
                        handleOnlinePayment();
                      } else {
                        setCartStep('payment');
                      }
                    }}
                    disabled={isCheckingOut}
                    style={{
                      padding: '14px',
                      borderRadius: 14,
                      background: '#e11d48',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                      opacity: isCheckingOut ? 0.7 : 1,
                    }}
                  >
                    {isCheckingOut ? 'Processing...' : 'Complete Order'}
                  </button>
                </div>
              )}

              {/* Step 4: Make Payment */}
              {cartStep === 'payment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={async () => {
                      setIsInitializingPayment(true);
                      try {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
                        let orderId = createdOrderData?.order?.id;
                        let orderNumber = createdOrderData?.order?.order_number;

                        // If order is not created yet, create it first
                        if (!orderId) {
                          const orderRes = await resilientFetch(`${API_URL}/v1/public/store/${username}/orders`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              items: cart.map((i) => ({
                                product_id: i.productId,
                                product_variant_id: i.variantId,
                                quantity: i.qty,
                              })),
                              customer_name: customerName || 'Guest Shopper',
                              customer_phone: customerPhone,
                              customer_email: customerEmail || undefined,
                              delivery_method: isDigitalOnly ? 'digital' : deliveryMethod,
                              delivery_address: isDigitalOnly ? undefined : (deliveryMethod === 'delivery' ? customerNote : undefined),
                              delivery_location: isDigitalOnly ? undefined : (deliveryLocation || undefined),
                              notes: orderNotes || undefined,
                              payment_method: 'paystack',
                            }),
                          });
                          const orderData = await orderRes.json();
                          if (!orderRes.ok) {
                            sonnerToast.error(orderData?.message || orderData?.error || 'Failed to create order.');
                            setIsInitializingPayment(false);
                            return;
                          }
                          setCreatedOrderData(orderData?.data);
                          orderId = orderData?.data?.order?.id;
                          orderNumber = orderData?.data?.order?.order_number;
                        }

                        if (!orderId) {
                          sonnerToast.error('Could not find order ID to process payment.');
                          setIsInitializingPayment(false);
                          return;
                        }

                        const res = await fetch(`${API_URL}/v1/public/orders/${orderId}/initialize-payment`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        const json = await res.json();
                        if (json?.data?.authorization_url) {
                           window.location.href = json.data.authorization_url;
                        } else if (json?.status === 'bank_transfer') {
                           setBankTransferDetails({
                             order_id: orderId,
                             order_number: orderNumber,
                             bank_name: json.data.bank_name,
                             bank_account_number: json.data.bank_account_number,
                             bank_account_name: json.data.bank_account_name,
                             amount: orderTotal,
                             currency_code: selectedCurrency
                           });
                           setBankTransferModalOpen(true);
                        } else {
                           sonnerToast.error(json.message || 'Payment initialization failed.');
                        }
                      } catch (err) {
                        sonnerToast.error('Payment initialization failed.');
                      } finally {
                        setIsInitializingPayment(false);
                      }
                    }}
                    disabled={isInitializingPayment}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: isInitializingPayment ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {isInitializingPayment ? 'Processing Payment...' : 'Pay Securely Online'}
                  </button>
                  {/* Order via WhatsApp Fallback commented out */}
                  {/* <button
                    onClick={() => handleWhatsAppCheckout()}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      background: '#FFF5F5',
                      color: '#e11d48',
                      border: 'none',
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
                    Order via WhatsApp Fallback
                  </button> */}
                </div>
              )}

              {/* Step 5: Confirmed Action Buttons */}
              {cartStep === 'confirmed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {confirmedOrderId && (
                    <Link
                      href={`/track/${confirmedOrderId}`}
                      onClick={() => {
                        setIsCartOpen(false);
                        setCart([]);
                        setCartStep('cart');
                      }}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 14,
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                      }}
                    >
                      {hasDigital ? <Download size={17} /> : <Truck size={17} />}
                      {hasDigital ? 'Access Downloads & Track Order' : 'Track Order Status'}
                    </Link>
                  )}

                  {whatsappFollowupUrl && (
                    <a
                      href={whatsappFollowupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 14,
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                      }}
                    >
                      <WhatsAppIcon size={18} />
                      Chat with Seller on WhatsApp
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 14,
                      background: '#f0fdf4',
                      color: '#075E54',
                      border: '1.5px solid #86efac',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Receipt size={17} />
                    View Order Receipt
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setCart([]);
                      setCartStep('cart');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 14,
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Digital Order Receipt Modal */}
      <OrderReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={receiptOrderData}
      />

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
                                {formatCurrency(priceNum, selectedCurrency)}
                              </span>
                              {hasDiscount && (
                                <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                                  {formatCurrency(compareNum, selectedCurrency)}
                                </span>
                              )}
                            </div>
                            <button
                              disabled={isOutOfStock}
                              onClick={(e) => {
                                addToCart(item, null, e);
                                sonnerToast.success('Added to bag', {
                                  action: {
                                    label: 'View Cart',
                                    onClick: () => setIsCartOpen(true),
                                  },
                                });
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
                    sonnerToast.success(`Added ${savedProducts.length} saved items to your bag`, {
                      action: {
                        label: 'View Cart',
                        onClick: () => setIsCartOpen(true),
                      },
                    });
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
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#fff',
              borderRadius: 24,
              padding: '26px 22px 22px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <button
              onClick={() => setIsPoliciesOpen(false)}
              aria-label="Close policies modal"
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
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingRight: 32 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: `${primaryColor}18`,
                  color: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  Store Policies &amp; Buyer Terms
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                  Verified terms for {store.store_name}
                </p>
              </div>
            </div>

            {/* Policy Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 8,
                marginBottom: 16,
                borderBottom: '1px solid #f1f5f9',
                scrollbarWidth: 'none',
              }}
            >
              {[
                { id: 'all', label: 'All Policies', icon: Layers },
                { id: 'delivery', label: 'Delivery', icon: Truck },
                { id: 'refund', label: 'Return & Refund', icon: RotateCcw },
                { id: 'product', label: 'Product Policy', icon: ShieldCheck },
                ...(store.policy_bookings ? [{ id: 'booking', label: 'Bookings', icon: Calendar }] : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activePolicyTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePolicyTab(tab.id as any)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      background: isActive ? primaryColor : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={13} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Policy Cards Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Delivery Policy Card */}
              {(activePolicyTab === 'all' || activePolicyTab === 'delivery') && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: activePolicyTab === 'delivery' ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: `${primaryColor}14`,
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Truck size={19} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Delivery &amp; Fulfillment
                        </h4>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: primaryColor, background: `${primaryColor}12`, padding: '2px 8px', borderRadius: 999 }}>
                          Standard Terms
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {store.delivery_info?.trim() || DEFAULT_STORE_POLICIES.delivery}
                      </p>
                      {store.shipping_type === 'free' && (
                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 9px', borderRadius: 6 }}>
                          ✨ This merchant offers Free Delivery on all items
                        </div>
                      )}
                      {store.shipping_type === 'free_above_threshold' && store.shipping_free_threshold && (
                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 9px', borderRadius: 6 }}>
                          ✨ Free delivery on orders above {CURRENCY_CONFIG[store.currency_code]?.symbol || '₦'}{Number(store.shipping_free_threshold).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Return & Refund Policy Card */}
              {(activePolicyTab === 'all' || activePolicyTab === 'refund') && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: activePolicyTab === 'refund' ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: `${primaryColor}14`,
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <RotateCcw size={19} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Return &amp; Refund Policy
                        </h4>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 999 }}>
                          Buyer Protected
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {store.return_policy?.trim() || store.policy_refunds?.trim() || DEFAULT_STORE_POLICIES.refund}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, padding: '12px 14px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fee2e2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <ShieldAlert size={16} style={{ color: '#dc2626' }} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>
                        Wrong or damaged product guarantee
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#7f1d1d', lineHeight: 1.45 }}>
                      Under Frontstore Buyer Protection, merchant payouts are held until delivery is verified. If you receive the wrong product, damaged goods, or incomplete order, you can pause merchant payout immediately.
                    </p>
                    <a
                      href="/appeal"
                      style={{
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#b91c1c',
                        textDecoration: 'underline',
                        marginTop: 2,
                      }}
                    >
                      File an Official Appeal with Proof &rarr;
                    </a>
                  </div>
                </div>
              )}

              {/* Product Policy Card */}
              {(activePolicyTab === 'all' || activePolicyTab === 'product') && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: activePolicyTab === 'product' ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: `${primaryColor}14`,
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={19} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          100% Authenticity Guarantee (Product Policy)
                        </h4>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 999 }}>
                          Authentic
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {store.policy_products?.trim() || DEFAULT_STORE_POLICIES.authenticity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking & Cancellation Policy Card (if configured) */}
              {(activePolicyTab === 'all' || activePolicyTab === 'booking') && store.policy_bookings && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: activePolicyTab === 'booking' ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: `${primaryColor}14`,
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Calendar size={19} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Service Booking &amp; Cancellation
                        </h4>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 999 }}>
                          Appointments
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {store.policy_bookings.trim()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsPoliciesOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 14,
                  background: primaryColor,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${primaryColor}35`,
                  transition: 'opacity 0.15s ease',
                }}
              >
                Got it, Close
              </button>
              {store.whatsapp_phone && (
                <a
                  href={`https://wa.me/${store.whatsapp_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${store.store_name}, I have a question about your store policies.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#25D366',
                    textDecoration: 'none',
                    padding: '6px 0',
                  }}
                >
                  <WhatsAppIcon size={14} /> Have questions? Chat with merchant on WhatsApp
                </a>
              )}
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
          padding: '36px 20px calc(96px + env(safe-area-inset-bottom, 0px))',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {store.logo_url && (
              <img
                src={getOptimizedImageUrl(store.logo_url, 'thumb')}
                alt={store.store_name}
                style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            )}
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {store.store_name}
            </span>
            {isVerified && <ShieldCheck size={16} color={primaryColor} />}
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 440 }}>
            {truncateStoreBio(store.store_bio, 306) || 'Shop directly on WhatsApp with fast delivery and buyer protection.'}
          </p>

          {(store.whatsapp_phone || store.instagram_handle || store.tiktok_handle || store.twitter_handle || store.facebook_handle) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Our Socials</span>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                {store.whatsapp_phone && (
                  <a
                    href={`https://wa.me/${store.whatsapp_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#25D366', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <WhatsAppIcon size={15} /> WhatsApp
                  </a>
                )}
                {store.instagram_handle && (
                  <a
                    href={`https://instagram.com/${store.instagram_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#e1306c', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <InstagramIcon size={15} /> Instagram
                  </a>
                )}
                {store.tiktok_handle && (
                  <a
                    href={`https://tiktok.com/@${store.tiktok_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0f172a', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <TikTokIcon size={15} /> TikTok
                  </a>
                )}
                {store.twitter_handle && (
                  <a
                    href={`https://x.com/${store.twitter_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0f172a', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <TwitterXIcon size={15} /> Twitter
                  </a>
                )}
                {store.facebook_handle && (
                  <a
                    href={`https://facebook.com/${store.facebook_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1877f2', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <FacebookIcon size={15} /> Facebook
                  </a>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => {
                setActivePolicyTab('all');
                setIsPoliciesOpen(true);
              }}
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
            <span style={{ color: '#cbd5e1' }}>•</span>
            <button
              onClick={handleShare}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Share Store
            </button>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              © {new Date().getFullYear()} {store.store_name}. All rights reserved.
            </p>
            <BuiltWithFrontstoreBadge href={`https://${systemDomain}`} />
          </div>
        </div>
      </footer>
    </div>
  );
}
