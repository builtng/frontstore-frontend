'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Share2, ChevronLeft, Star, ShieldCheck, Clock, MapPin, Camera,
  Search, X, Plus, Minus, ShoppingBag, BadgeCheck,
  Store, Calendar, Check, Receipt, ChevronRight, Crown, Heart, Truck, Menu,
  ExternalLink, Copy, CheckCircle2, Shield,
  Link, Megaphone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { InstagramIcon, TikTokIcon, TwitterXIcon } from "../../components/SocialIcons";
import { businessPersonas } from "../../utils/businessPersonas";
import BeautyStorefront from "./BeautyStorefront";
import FashionStorefront from "./FashionStorefront";
import RestaurantStorefront from "./RestaurantStorefront";
import TechStorefront from "./TechStorefront";
import ThriftStorefront from "./ThriftStorefront";
import ComingSoonStorefront from "./ComingSoonStorefront";

// --- Types & Interfaces ---
interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface Store {
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
  is_verified?: boolean | number;
  custom_links?: StoreLink[] | null;
  primary_color?: string | null;
  store_template?: string | null;
  is_pro?: boolean | number;
  business_persona?: string | null;
  location?: string | null;
  // Merchant-configurable stats
  rating?: number | null;
  review_count?: number | null;
  total_orders?: number | string | null;
  working_hours?: string | null;
  announcement_title?: string | null;
  announcement_body?: string | null;
  announcement_cta_label?: string | null;
  announcement_cta_page?: string | null;
  // Computed server-side from WhatsApp chat response timestamps
  reply_time_minutes?: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
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
  service_facts?: string[] | null;
}

interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'service' | 'product';
  slot?: string;
  duration?: number;
  image_url?: string;
  productRef: Product;
}

interface Review {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
  created_at?: string;
}

interface CreatedOrderReceipt {
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    payment_status: string;
    order_status: string;
    delivery_method: string;
    delivery_address: string;
  };
  whatsapp_url: string;
}

interface StorefrontClientProps {
  username: string;
  initialProductSlug?: string;
  initialData?: {
    store: Store;
    categories?: Category[];
    products?: Product[];
    reviews?: Review[];
    faqs?: any[];
    portfolio?: any[];
    blog?: any[];
    system_domain?: string;
    store_disclaimer?: string;
    app_name?: string;
    logo_url?: string;
  } | null;
}

// --- Helpers ---
function normalizeApiUrl(url: string | undefined): string {
  if (!url) return '';
  return url.replace(/\/+$/, '');
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', UGX: 'USh',
  TZS: 'TSh', XOF: 'CFA', EGP: 'E£', MAD: 'د.م.', ETB: 'Br',
  USD: '$', GBP: '£', EUR: '€',
};

function getCurrencySymbol(code: string): string {
  const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (!normalizedCode || normalizedCode === 'UNDEFINED' || normalizedCode === 'NULL') {
    return CURRENCY_SYMBOLS.NGN;
  }
  return CURRENCY_SYMBOLS[normalizedCode] ?? `${normalizedCode} `;
}

function fmt(amount: string | number | null | undefined, symbol: string): string {
  if (amount === null || amount === undefined) return `${symbol}0`;
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  const n = isNaN(parsed) ? 0 : parsed;
  return `${symbol}${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const CAT_THEME: Record<string, string[]> = {
  Lashes: ["#25D366", "#4ADE80"],
  Brows: ["#128c7e", "#25D366"],
  Skincare: ["#25D366", "#4ADE80"],
  Aftercare: ["#128c7e", "#25D366"],
  Gifting: ["#075e54", "#128c7e"],
};

function getCategoryTheme(catName: string) {
  const normalized = catName.trim();
  // Check exact match
  for (const k of Object.keys(CAT_THEME)) {
    if (normalized.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(normalized.toLowerCase())) {
      return CAT_THEME[k];
    }
  }
  // Hash fallback
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const themes = Object.values(CAT_THEME);
  return themes[Math.abs(hash) % themes.length];
}

function formatReplyTime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '~10 min';
  if (minutes < 60) return `~${minutes} min`;
  const hrs = Math.round(minutes / 60);
  return `~${hrs} hr`;
}

function fmtDuration(minutes: number | null | undefined): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.round(minutes / 60 * 10) / 10;
  return `~${hrs} hr`;
}

function formatOrderCount(orders: number | string | null | undefined): string {
  if (typeof orders === 'string') return orders;
  const n = orders ?? 0;
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`;
  return `${n}+`;
}

type StoreTheme = React.CSSProperties & {
  '--brand': string;
  '--brand-deep': string;
  '--tint': string;
};

const TEMPLATE_THEME: Record<string, StoreTheme> = {
  'luxe-market': { '--brand': '#25D366', '--brand-deep': '#128c7e', '--tint': '#dcf8c6' },
  editorial: { '--brand': '#25D366', '--brand-deep': '#128c7e', '--tint': '#dcf8c6' },
  'flash-sale': { '--brand': '#e11d48', '--brand-deep': '#190915', '--tint': '#ffe4e6' },
  atelier: { '--brand': '#0e7490', '--brand-deep': '#27272a', '--tint': '#ecfeff' },
  'digital-studio': { '--brand': '#2563eb', '--brand-deep': '#07152f', '--tint': '#dbeafe' },
  'whatsapp-native': { '--brand': '#128c7e', '--brand-deep': '#075e54', '--tint': '#dcf8c6' },
};

const PERSONA_THEME: Record<string, StoreTheme> = {
  'general-store': { '--brand': '#25D366', '--brand-deep': '#128c7e', '--tint': '#dcf8c6' },
  'beauty-service': { '--brand': '#25D366', '--brand-deep': '#128c7e', '--tint': '#dcf8c6' },
  'fashion-apparel': { '--brand': '#7c2d12', '--brand-deep': '#431407', '--tint': '#ffedd5' },
  'food-vendor': { '--brand': '#e11d48', '--brand-deep': '#7f1d1d', '--tint': '#ffe4e6' },
  'creator-digital': { '--brand': '#2563eb', '--brand-deep': '#07152f', '--tint': '#dbeafe' },
  'pharmacy-health': { '--brand': '#0e7490', '--brand-deep': '#164e63', '--tint': '#ecfeff' },
  'retail-groceries': { '--brand': '#128c7e', '--brand-deep': '#075e54', '--tint': '#dcf8c6' },
  'faith-community': { '--brand': '#128c7e', '--brand-deep': '#075e54', '--tint': '#dcf8c6' },
  'school-education': { '--brand': '#25D366', '--brand-deep': '#128c7e', '--tint': '#dcf8c6' },
  'thrift-store': { '--brand': '#8b5e3c', '--brand-deep': '#2f241b', '--tint': '#f1e8dd' },
};

function normalizeTemplateKey(value: string | null | undefined): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveStoreTheme(store: Pick<Store, 'primary_color' | 'business_persona' | 'store_template'>): StoreTheme {
  if (store.primary_color) {
    return {
      '--brand': store.primary_color,
      '--brand-deep': store.primary_color,
      '--tint': `color-mix(in srgb, ${store.primary_color} 14%, white)`,
    };
  }

  return PERSONA_THEME[normalizeTemplateKey(store.business_persona)]
    || TEMPLATE_THEME[normalizeTemplateKey(store.store_template)]
    || TEMPLATE_THEME['luxe-market'];
}

// Classifier helper to determine if a product is a service
function isProductService(product: Product, store: Store): boolean {
  if (product.type === 'service') return true;
  if (product.type === 'product') return false;

  const catName = (product.category_id || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  if (name.includes('lashe') || name.includes('brow') || name.includes('lamination') || name.includes('tint') || name.includes('massage') || name.includes('treatment') || name.includes('facial') || name.includes('appointment') || name.includes('session') || name.includes('booking')) {
    return true;
  }
  if (store.business_persona === 'beauty-service') {
    if (name.includes('serum') || name.includes('cleanser') || name.includes('kit') || name.includes('oil') || name.includes('cream') || name.includes('shampoo') || name.includes('gel') || name.includes('brush') || name.includes('remover') || name.includes('foam')) {
      return false;
    }
    return true;
  }
  return false;
}

// Dynamic Media component that displays image or fallback gradient
function Media({ cat, h, imgUrl }: { cat: string; h: number; imgUrl?: string }) {
  if (imgUrl) {
    return (
      <div style={{ height: h, width: '100%', overflow: 'hidden', position: 'relative' }}>
        <img src={imgUrl} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  const [a, b] = getCategoryTheme(cat);
  return (
    <div style={{ background: `linear-gradient(150deg,${a},${b})`, height: h, display: "grid", placeItems: "center", position: "relative", overflow: "hidden", width: '100%' }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.16) 1px,transparent 1px)", backgroundSize: "13px 13px" }} />
      <Camera size={h > 130 ? 32 : 24} strokeWidth={1.3} color="rgba(255,255,255,.9)" style={{ position: "relative" }} />
    </div>
  );
}

export default function StorefrontClient({
  username,
  initialProductSlug,
  initialData,
}: StorefrontClientProps) {
  // ⚠️ React Hooks Rule: isComingSoon must be computed from props only (before any hooks)
  // so we can safely call all hooks every render regardless of the condition.
  const isComingSoon = !initialData || !initialData.store
    || (initialData.store as Store).store_template === 'coming-soon'
    || (initialData.store as Store).store_template === 'waitlist';

  const router = useRouter();

  // --- Normalize Data ---
  const store: Store = useMemo(() => {
    let s = initialData?.store || {} as Store;

    // Load waitlist settings from localStorage if database record is missing
    if (!s.store_name && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`waitlist_store:${username}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          s = { ...s, ...parsed };
        }
      } catch (e) {
        console.error("Error loading cached waitlist store:", e);
      }
    }

    const rawName = s.store_name || username || 'Store';
    const formattedName = rawName.includes('-') || rawName.includes('_') || rawName === rawName.toLowerCase()
      ? rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : rawName;
    return {
      ...s,
      username: s.username || username,
      store_name: formattedName,
      currency_code: s.currency_code || 'NGN',
      whatsapp_phone: s.whatsapp_phone || '',
      location: s.location || 'Online store',
    };
  }, [initialData, username]);

  const categories: Category[] = useMemo(() => initialData?.categories || [], [initialData]);
  const products: Product[] = useMemo(() => initialData?.products || [], [initialData]);
  const systemDomain = initialData?.system_domain || 'frontstore.app';
  const storeDisclaimer = initialData?.store_disclaimer || '';
  const appName = initialData?.app_name || 'Frontstore';
  const storeTheme = useMemo(() => resolveStoreTheme(store), [store]);

  // --- Reviews ---
  const [reviews, setReviews] = useState<Review[]>(initialData?.reviews || []);

  const faqs = useMemo(() => initialData?.faqs || [], [initialData]);
  const portfolio = useMemo(() => initialData?.portfolio || [], [initialData]);
  const blog = useMemo(() => initialData?.blog || [], [initialData]);

  // --- All hooks must run before any conditional return ---
  // --- States ---
  const premium = !!(store.is_pro || store.primary_color);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<"all" | "service" | "product">("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [annOff, setAnnOff] = useState(false);
  
  // Cart & Drawer States
  const [bag, setBag] = useState<CartItem[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [booking, setBooking] = useState<Product | null>(null);
  const [bDate, setBDate] = useState(0);
  const [bTime, setBTime] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Checkout Form States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'digital'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);
  const receipt = orderReceipt;
  const [isPaying, setIsPaying] = useState(false);

  // Pending WhatsApp deep-link awaiting disclaimer confirmation
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);
  const openWhatsAppChat = (message: string) => {
    setPendingWaUrl(`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
  };
  const announcement = !annOff && (store.announcement_title || store.announcement_body) && (
    <div className="fs-ann">
      <Megaphone size={16} />
      <p><b>{store.announcement_title || "Announcement"}</b>{store.announcement_body ? ` ${store.announcement_body}` : ""}</p>
      <button onClick={() => setAnnOff(true)} aria-label="Dismiss announcement"><X size={15} /></button>
    </div>
  );

  // Viewport scroll targets
  const searchRef = useRef<HTMLDivElement>(null);      // mobile
  const reviewsRef = useRef<HTMLDivElement>(null);     // mobile
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopReviewsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Fetch reviews from API if not provided in initial data
  useEffect(() => {
    if (initialData?.reviews && initialData.reviews.length > 0) return;
    const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
    fetch(`${API_URL}/v1/public/store/${username}/reviews`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data && Array.isArray(json.data)) setReviews(json.data);
      })
      .catch(() => {});
  }, [username]);

  // Toast Timer
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 1900);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Persistent Cart Loading
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`frontstore_cart_${username}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBag(parsed);
      }
    } catch { }
  }, [username]);

  // Load Saved Client Profile
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('frontstore_customer_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone_number) setCustomerPhone(parsed.phone_number);
        if (parsed.whatsapp_number) setCustomerWhatsapp(parsed.whatsapp_number);
        if (parsed.email) setCustomerEmail(parsed.email);
        if (parsed.preferred_delivery_address) setDeliveryAddress(parsed.preferred_delivery_address);
      }
    } catch { }
  }, []);

  // Update Cart LocalStorage helper
  const saveCartToStorage = (newBag: CartItem[]) => {
    try {
      localStorage.setItem(`frontstore_cart_${username}`, JSON.stringify(newBag));
    } catch { }
  };

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
  };

  // Calendar dates lookup
  const days = useMemo(() => {
    const out = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push({
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "short" }),
        date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        formatted: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      });
    }
    return out;
  }, []);
  const slots = ["10:00 AM", "12:30 PM", "03:00 PM", "05:30 PM"];

  // Filter Categories present in active products
  const activeCategories = useMemo(() => {
    const ids = new Set(products.map(p => p.category_id).filter(Boolean));
    return categories.filter(c => ids.has(c.id));
  }, [categories, products]);

  // Find signature treatment or first active product as featured
  const pinnedProduct = useMemo(() => {
    return products.find(p => p.stock_status === 'in_stock') || products[0] || null;
  }, [products]);

  // Browse filtering grid
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => segment !== "all" || p.id !== (pinnedProduct?.id || ''))
      .filter(p => {
        const isService = isProductService(p, store);
        if (segment === "service") return isService;
        if (segment === "product") return !isService;
        return true;
      })
      .filter(p => !activeCat || p.category_id === activeCat)
      .filter(p => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      });
  }, [products, pinnedProduct, segment, activeCat, query, store]);

  // Cart Counts & Calculations
  const bagCount = bag.reduce((n, b) => n + b.qty, 0);
  const bagTotal = bag.reduce((n, b) => n + b.qty * b.price, 0);
  const currencySymbol = getCurrencySymbol(store.currency_code);

  // Direct checkout link if direct navigation to product slug
  useEffect(() => {
    if (initialProductSlug && products.length > 0) {
      const matched = products.find(p => p.slug === initialProductSlug);
      if (matched) {
        if (isProductService(matched, store)) {
          setBooking(matched);
        } else {
          // Add product to bag and open checkout
          const key = "p" + matched.id;
          setBag(b => {
            const ex = b.find(x => x.key === key);
            let nextBag;
            if (ex) {
              nextBag = b.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
            } else {
              nextBag = [...b, {
                key,
                id: matched.id,
                name: matched.name,
                price: parseFloat(matched.price),
                qty: 1,
                type: "product",
                productRef: matched
              } as CartItem];
            }
            saveCartToStorage(nextBag);
            return nextBag;
          });
          setCheckoutStep('details');
          setBagOpen(true);
        }
      }
    }
  }, [initialProductSlug, products, store]);

  // Cart operations
  const addProduct = (it: Product) => {
    const key = "p" + it.id;
    setBag(b => {
      const ex = b.find(x => x.key === key);
      let nextBag;
      if (ex) {
        nextBag = b.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
      } else {
        nextBag = [...b, {
          key,
          id: it.id,
          name: it.name,
          price: parseFloat(it.price),
          qty: 1,
          type: "product",
          productRef: it
        } as CartItem];
      }
      saveCartToStorage(nextBag);
      return nextBag;
    });
    triggerToast("Added to order");
  };

  const openBooking = (it: Product) => {
    setBooking(it);
    setBDate(0);
    setBTime(null);
  };

  const confirmBooking = () => {
    if (bTime === null || !booking) {
      triggerToast("Pick a time slot");
      return;
    }
    const d = days[bDate];
    const key = `s${booking.id}-${d.date}-${bTime}`;
    setBag(b => {
      const nextBag = [...b, {
        key,
        id: booking.id,
        name: booking.name,
        price: parseFloat(booking.price),
        qty: 1,
        type: "service",
        slot: `${d.label} ${d.date}, ${slots[bTime]}`,
        duration: booking.duration_minutes ?? undefined,
        productRef: booking
      } as CartItem];
      saveCartToStorage(nextBag);
      return nextBag;
    });
    setBooking(null);
    triggerToast("Appointment added");
  };

  const changeQty = (key: string, d: number) => {
    setBag(b => {
      const nextBag = b.map(x => x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x);
      saveCartToStorage(nextBag);
      return nextBag;
    });
  };

  const removeItem = (key: string) => {
    setBag(b => {
      const nextBag = b.filter(x => x.key !== key);
      saveCartToStorage(nextBag);
      return nextBag;
    });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${store.username}`;
    navigator.clipboard.writeText(link);
    triggerToast("Store link copied");
  };

  const focusSearch = () => {
    const isDesktop = window.innerWidth >= 768;
    const target = isDesktop ? desktopSearchRef.current : searchRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => target?.querySelector("input")?.focus(), 350);
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Order Submission ---
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setCheckoutError('Name and WhatsApp number are required.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

    // Compile slots list for session-booking address details
    const serviceItems = bag.filter(x => x.type === 'service');
    let compiledAddress = deliveryAddress;
    if (serviceItems.length > 0) {
      const slotDetails = serviceItems.map(x => `${x.name} booking: ${x.slot}`).join(', ');
      compiledAddress = `Booking details: ${slotDetails}` + (deliveryAddress ? ` | Session Location: ${deliveryAddress}` : '');
    }

    try {
      const res = await fetch(`${API_URL}/v1/public/store/${store.username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          customer_whatsapp: customerWhatsapp || customerPhone,
          delivery_method: serviceItems.length > 0 ? (deliveryAddress ? 'delivery' : 'pickup') : deliveryMethod,
          delivery_address: compiledAddress || 'None specified',
          items: bag.map(item => ({
            product_id: item.id,
            quantity: item.qty
          }))
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit order.');
      }

      // Save customer profile for future checkout speedups
      try {
        localStorage.setItem('frontstore_customer_profile', JSON.stringify({
          name: customerName,
          phone_number: customerPhone,
          whatsapp_number: customerWhatsapp || customerPhone,
          email: customerEmail || null,
          preferred_delivery_method: deliveryMethod,
          preferred_delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
        }));
      } catch { }

      // Clear local bag
      setBag([]);
      saveCartToStorage([]);
      setOrderReceipt(json.data);
      setBagOpen(false);
      setCheckoutStep('cart');
      triggerToast('Order placed successfully!');
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Pay online now logic
  const handlePayOnline = async () => {
    if (!orderReceipt) return;
    setIsPaying(true);
    const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
    try {
      const res = await fetch(`${API_URL}/v1/public/orders/${orderReceipt.order.id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Payment initialization failed.');
      }
      if (json.data && json.data.authorization_url) {
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error('Secure payment link unavailable.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment.');
    } finally {
      setIsPaying(false);
    }
  };

  const activeCategoryName = useMemo(() => {
    if (!activeCat) return '';
    return categories.find(c => c.id === activeCat)?.name || '';
  }, [activeCat, categories]);

  // --- Conditional renders (AFTER all hooks) ---
  // Pre-launch / Waitlist: show ComingSoon page
  if (isComingSoon) {
    return (
      <ComingSoonStorefront
        username={username}
        store={store}
        systemDomain={systemDomain}
        appName={appName}
      />
    );
  }

  // ── Persona-based storefront dispatch ──────────────────────────────────────
  // Each business persona maps to a dedicated storefront template.

  const sharedTemplateProps = {
    username,
    store,
    categories,
    products,
    reviews,
    faqs,
    portfolio,
    blog,
    systemDomain,
    storeDisclaimer,
    appName,
  };

  // Thrift / vintage
  const personaKey = normalizeTemplateKey(store.business_persona);
  const templateKey = normalizeTemplateKey(store.store_template);

  const thriftPersonas = [
    'thrift-store', 'thrift', 'vintage', 'secondhand', 'second-hand', 'preloved', 'pre-loved', 'consignment',
    'thrift-preloved', 'thrift-and-preloved', 'thrift-and-vintage', 'thrift-and-preloved-fashion',
    'thrift-vintage', 'vintage-store', 'preloved-fashion'
  ];
  if (thriftPersonas.includes(personaKey) || thriftPersonas.includes(templateKey)) {
    return <ThriftStorefront {...sharedTemplateProps} />;
  }

  // Tech
  const techPersonas = [
    'tech-store', 'electronics', 'gadgets', 'computers', 'phones', 'tech',
    'Gadgets and repairs', 'gadgets-and-repairs', 'gadgets and repairs'
  ];
  if (techPersonas.map(normalizeTemplateKey).includes(personaKey) || ['tech', 'tech-store'].includes(templateKey)) {
    return <TechStorefront {...sharedTemplateProps} />;
  }

  // Fashion
  const fashionPersonas = [
    'fashion', 'fashion-store', 'fashion-apparel', 'clothing', 'streetwear', 'accessories',
    'Fashion and Clothing', 'fashion and clothing', 'fashion-clothing', 'fashion-and-clothing'
  ];
  if (fashionPersonas.map(normalizeTemplateKey).includes(personaKey) || ['fashion', 'fashion-store'].includes(templateKey)) {
    return <FashionStorefront {...sharedTemplateProps} />;
  }

  // Restaurant / food
  const restaurantPersonas = [
    'restaurant', 'food', 'food-delivery', 'cafeteria', 'bakery', 'fast-food', 'catering', 'cafe', 'food-vendor',
    'Restaurant and bars', 'restaurant-bars', 'restaurant and bars', 'restaurant-and-bars'
  ];
  if (restaurantPersonas.map(normalizeTemplateKey).includes(personaKey) || ['restaurant', 'food-vendor'].includes(templateKey)) {
    return <RestaurantStorefront {...sharedTemplateProps} />;
  }

  // Beauty / editorial
  const beautyPersonas = [
    'beauty-service', 'barber-shop', 'Beauty and hair', 'beauty-and-hair', 'beauty and hair', 'beauty-hair'
  ];
  if (beautyPersonas.map(normalizeTemplateKey).includes(personaKey) || ['editorial', 'beauty'].includes(templateKey)) {
    return <BeautyStorefront {...sharedTemplateProps} />;
  }

  return (
    <div className="fs-root" style={storeTheme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <WhatsAppDisclaimerModal
        open={!!pendingWaUrl}
        storeName={store.store_name}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)}
      />

      {/* ── DESKTOP LAYOUT ── */}
      <div className="fs-desktop">

        {/* Sidebar */}
        <aside className="fs-sidebar">
          {/* Store identity */}
          <div className="fs-sid-cover" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover' } : undefined} />
          <div className="fs-sid-id">
            {store.logo_url ? (
              <img src={store.logo_url || undefined} alt="store logo" className="fs-sid-av" style={{ objectFit: 'cover' }} />
            ) : (
              <span className="fs-sid-av">{store.store_name[0].toUpperCase()}</span>
            )}
            <div>
              <h2>{store.store_name} {store.is_verified ? <BadgeCheck size={16} className="fs-verif" /> : null}</h2>
              <p className="fs-sid-meta"><MapPin size={11} /> {store.location}</p>
            </div>
          </div>

          <button className="fs-sid-url" onClick={copyLink}>
            frontstore.app/<b>{store.username}</b> <Share2 size={12} />
          </button>

          <div className="fs-sid-stats">
            {store.rating != null ? (
              <div><Star size={13} fill="#c79a4b" color="#c79a4b" /> {store.rating} <span>({store.review_count ?? 0} reviews)</span></div>
            ) : (
              <div><Store size={13} /> New store</div>
            )}
            <div><ShoppingBag size={12} /> {formatOrderCount(store.total_orders)} orders</div>
            {store.reply_time_minutes != null && <div><Clock size={12} /> replies in {formatReplyTime(store.reply_time_minutes)}</div>}
            {store.working_hours && <div><Clock size={12} /> {store.working_hours}</div>}
          </div>

          <p className="fs-sid-bio">{store.store_bio || "Premium conversational commerce storefront."}</p>

          <div className="fs-sid-trust"><ShieldCheck size={13} /> Payments secured by Frontstore</div>

          {/* Nav links */}
          <nav className="fs-sid-nav">
            <button onClick={() => scrollTo(desktopSearchRef)}><Search size={15} /> Browse items</button>
            <button onClick={() => scrollTo(desktopReviewsRef)}><Star size={15} /> Reviews</button>
            <button onClick={() => {
              openWhatsAppChat(`Hi ${store.store_name}! I have a question about your shop items.`);
            }}><WhatsAppIcon size={15} /> Chat with us</button>
          </nav>

          {/* Bag CTA */}
          <button className="fs-sid-bag" onClick={() => { setCheckoutStep('cart'); setBagOpen(true); }}>
            <ShoppingBag size={18} />
            {bagCount > 0 ? `View order (${bagCount})` : "Your order"}
            {bagCount > 0 && <span className="fs-sid-total">{fmt(bagTotal, currencySymbol)}</span>}
          </button>
        </aside>

        {/* Main content */}
        <main className="fs-main" ref={mainRef}>

          {/* Top nav bar (desktop) */}
          <header className="fs-topbar">
            <div className="fs-topbar-left">
              {!premium && <span className="fs-fs-logo">front<span>store</span></span>}
              {premium && <span className="fs-premium-label"><Crown size={12} /> Premium Store</span>}
            </div>
            <div className="fs-topbar-right">
              <button className="fs-tb-btn" onClick={focusSearch} aria-label="Search items"><Search size={17} /></button>
              <button className="fs-tb-btn" onClick={copyLink} aria-label="Copy store link"><Share2 size={17} /></button>
              <button className="fs-tb-bag" onClick={() => { setCheckoutStep('cart'); setBagOpen(true); }} aria-label="View order">
                <ShoppingBag size={17} />
                {bagCount > 0 && <span className="fs-badge">{bagCount}</span>}
              </button>
              <button className="fs-tb-btn" onClick={() => {
                openWhatsAppChat(`Hi ${store.store_name}!`);
              }} aria-label="Chat on WhatsApp"><WhatsAppIcon size={17} /></button>
            </div>
          </header>

          {/* Hero cover */}
          <section className="fs-hero">
            <div className="fs-hero-art" style={{ background: `linear-gradient(135deg, ${storeTheme['--brand']}, ${storeTheme['--brand-deep']})` }}>
              <div className="fs-hero-grain" />
            </div>
            <div className="fs-hero-content">
              <span className="fs-hero-cat">Storefront Catalog</span>
              <h1 className="fs-hero-name">{store.store_name}</h1>
              <p className="fs-hero-bio">{store.store_bio || "Browse our items and place orders directly via WhatsApp chat."}</p>
              <div className="fs-hero-socials">
                {store.whatsapp_phone && (
                  <button type="button" className="fs-social-link" onClick={() => openWhatsAppChat(`Hi ${store.store_name}!`)} aria-label="WhatsApp">
                    <WhatsAppIcon size={20} />
                  </button>
                )}
                {store.instagram_handle && (
                  <a className="fs-social-link" href={`https://instagram.com/${(store.instagram_handle || '').replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <InstagramIcon size={20} />
                  </a>
                )}
                {store.tiktok_handle && (
                  <a className="fs-social-link" href={`https://tiktok.com/@${(store.tiktok_handle || '').replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <TikTokIcon size={20} />
                  </a>
                )}
                {store.twitter_handle && (
                  <a className="fs-social-link" href={`https://x.com/${(store.twitter_handle || '').replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                    <TwitterXIcon size={20} />
                  </a>
                )}
                {store.custom_links?.filter(l => l.is_active).map(link => (
                  <a key={link.id} className="fs-social-link" href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.title}>
                    <Link size={20} />
                  </a>
                ))}
              </div>
            </div>
          </section>

          {announcement}

          {/* Pinned / featured signature treatment */}
          {pinnedProduct && (
            <section className="fs-featured">
              <div className="fs-section-label"><Crown size={14} /> Signature Treatment</div>
              <div className="fs-feat-card">
                <div className="fs-feat-media">
                  <Media cat={pinnedProduct.category_id || "Lashes"} h={220} imgUrl={pinnedProduct.image_urls?.[0]} />
                </div>
                <div className="fs-feat-body">
                  <span className="fs-feat-badge">Most booked</span>
                  <h3>{pinnedProduct.name}</h3>
                  <p>{pinnedProduct.description || "Nourishing treatment custom mapped to your preferences."}</p>
                  <div className="fs-feat-row">
                    <span className="fs-price">{fmt(pinnedProduct.price, currencySymbol)}</span>
                    {isProductService(pinnedProduct, store) ? (
                      <span className="fs-dur"><Clock size={13} /> {fmtDuration(pinnedProduct.duration_minutes) || 'Service'}</span>
                    ) : (
                      <span className="fs-dur"><Truck size={13} /> Ready to ship</span>
                    )}
                  </div>
                  {isProductService(pinnedProduct, store) ? (
                    <button className="fs-cta fs-book fs-cta-full" onClick={() => openBooking(pinnedProduct)}><Calendar size={16} /> Book this treatment</button>
                  ) : (
                    <button className="fs-cta fs-buy fs-cta-full" onClick={() => addProduct(pinnedProduct)}><ShoppingBag size={16} /> Order this product</button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Filters */}
          <div className="fs-filters" ref={desktopSearchRef}>
            <div className="fs-filter-top">
              <div className="fs-searchwrap">
                <Search size={16} className="fs-search-ic" />
                <input placeholder="Search treatments & products…" value={query} onChange={e => setQuery(e.target.value)} />
                {query && <button onClick={() => setQuery("")} aria-label="Clear query"><X size={14} /></button>}
              </div>
              <div className="fs-segs">
                {(["all", "service", "product"] as const).map(k => (
                  <button key={k} className={segment === k ? "on" : ""} onClick={() => setSegment(k)}>
                    {k === "all" ? "All" : k === "service" ? "Services" : "Products"}
                  </button>
                ))}
              </div>
            </div>
            <div className="fs-cats">
              <button className={!activeCat ? "on" : ""} onClick={() => setActiveCat(null)}>All</button>
              {activeCategories.map(c => (
                <button key={c.id} className={activeCat === c.id ? "on" : ""} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}>{c.name}</button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <section className="fs-grid">
            {filteredProducts.length === 0 && <p className="fs-empty">Nothing matches. Try a different search or category.</p>}
            {filteredProducts.map((it, idx) => {
              const isService = isProductService(it, store);
              return (
                <article key={it.id} className="fs-card" style={{ animationDelay: `${idx * 35}ms` }} onClick={() => router.push(`/${username}/products/${it.slug}`)}>
                  <div className="fs-card-media">
                    <Media cat={activeCategoryName || "Lashes"} h={118} imgUrl={it.image_urls?.[0]} />
                    <span className={`fs-type ${isService ? 'service' : 'product'}`}>{isService ? "Service" : "Product"}</span>
                    {it.compare_at_price && <span className="fs-pop"><Heart size={9} fill="#fff" color="#fff" /> Loved</span>}
                  </div>
                  <div className="fs-card-body">
                    <h3>{it.name}</h3>
                    <p className="fs-card-desc">{it.description || "Nourishing beauty collection essential."}</p>
                    <div className="fs-card-foot">
                      {isService ? (
                        <span className="fs-line"><Clock size={12} /> {fmtDuration(it.duration_minutes) || 'Service'}</span>
                      ) : (
                        <span className={`fs-line ${it.stock_status === "low_stock" ? "low" : ""}`}><Truck size={12} /> {it.stock_status === "low_stock" ? "Low stock" : "In stock"}</span>
                      )}
                      <span className="fs-price">{fmt(it.price, currencySymbol)}</span>
                    </div>
                    {isService ? (
                      <button className="fs-cta fs-book fs-cta-full" onClick={e => { e.stopPropagation(); openBooking(it); }}><Calendar size={14} /> Book</button>
                    ) : (
                      <button className="fs-cta fs-buy fs-cta-full" onClick={e => { e.stopPropagation(); addProduct(it); }}><ShoppingBag size={14} /> Buy</button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {/* Reviews */}
          {reviews.length > 0 && (
          <section className="fs-reviews" ref={desktopReviewsRef}>
            <div className="fs-section-label"><Star size={14} fill="#c79a4b" color="#c79a4b" /> Client Reviews</div>
            <div className="fs-rev-head">
              <span className="fs-rev-rating">{(store.rating ?? (reviews.reduce((sum, rv) => sum + rv.rating, 0) / reviews.length)).toFixed(1)}</span>
              <div>
                <div className="fs-rev-stars">{"★".repeat(Math.round(store.rating ?? (reviews.reduce((sum, rv) => sum + rv.rating, 0) / reviews.length)))}</div>
                <span>{reviews.length} verified review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="fs-rev-grid">
              {reviews.map((rv) => (
                <div className="fs-rev" key={rv.id}>
                  <div className="fs-rev-top">
                    <span className="fs-rev-av">{rv.reviewer_name[0].toUpperCase()}</span>
                    <div><b>{rv.reviewer_name}</b><span className="fs-rev-stars-sm">{"★".repeat(Math.max(1, Math.min(5, rv.rating)))}</span></div>
                  </div>
                  <p>{rv.body}</p>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* Footer */}
          <footer className="fs-foot">
            <div className="fs-foot-inner">
              <span className="fs-foot-brand">{store.store_name}</span>
              {premium ? (
                <span className="fs-foot-sec"><ShieldCheck size={13} /> Payments secured by Frontstore</span>
              ) : (
                <>
                  <span className="fs-foot-sec"><ShieldCheck size={13} /> Secured by Frontstore</span>
                  <button className="fs-foot-link" onClick={() => window.location.href = '/'}>Explore more stores <ChevronRight size={13} /></button>
                </>
              )}
            </div>
          </footer>
        </main>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="fs-mobile">
        <header className="fs-m-top">
          {premium ? (
            <div className="fs-m-brand">
              {store.logo_url ? (
                <img src={store.logo_url || undefined} alt="Logo" className="fs-m-av" style={{ objectFit: 'cover' }} />
              ) : (
                <span className="fs-m-av">{store.store_name[0].toUpperCase()}</span>
              )}
              <span className="fs-m-name">{store.store_name}</span>
            </div>
          ) : (
            <>
              <button className="fs-m-icn" onClick={() => window.location.href = '/'} aria-label="Go back"><ChevronLeft size={22} /></button>
              <span className="fs-fs-logo">front<span>store</span></span>
            </>
          )}
          <div className="fs-m-actions">
            <button className="fs-m-icn" onClick={copyLink} aria-label="Share store link"><Share2 size={19} /></button>
            <button className="fs-m-icn fs-m-bagbtn" onClick={() => { setCheckoutStep('cart'); setBagOpen(true); }} aria-label="View order bag">
              <ShoppingBag size={20} />
              {bagCount > 0 && <span className="fs-badge">{bagCount}</span>}
            </button>
          </div>
        </header>

        <section className="fs-m-cover">
          <div
            className="fs-m-cover-art"
            style={
              store.banner_url
                ? { backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.38), rgba(0,0,0,.12)), url(${store.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: `linear-gradient(135deg, ${storeTheme['--brand']}, ${storeTheme['--brand-deep']})` }
            }
          >
            {!store.banner_url && <div className="fs-m-grain" />}
            <div className="fs-m-id-row">
              {store.logo_url ? (
                <img src={store.logo_url || undefined} alt="Logo" className="fs-m-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <span className="fs-m-avatar">{store.store_name[0].toUpperCase()}</span>
              )}
              <div className="fs-m-id-info">
                <h1 className="fs-m-id-name">{store.store_name} {store.is_verified ? <BadgeCheck size={16} style={{ color: '#fff', verticalAlign: 'middle' }} /> : null}</h1>
                <p className="fs-m-meta fs-m-meta-hero">
                  {businessPersonas.find(p => p.id === store.business_persona)?.name ?? 'Online store'}
                  {store.location && store.location !== 'Online store' && <><span> • </span><MapPin size={11} /> {store.location}</>}
                </p>
              </div>
            </div>
          </div>
          <button className="fs-m-url" onClick={copyLink}><span>frontstore.app/<b>{store.username}</b></span><Share2 size={13} /></button>
          <div className="fs-m-stats">
            {store.rating != null ? (
              <span><Star size={13} fill="#c79a4b" color="#c79a4b" /> {store.rating} <i>({store.review_count ?? 0})</i></span>
            ) : (
              <span><Store size={13} /> New store</span>
            )}
            <span><ShoppingBag size={12} /> {formatOrderCount(store.total_orders)}</span>
            {store.reply_time_minutes != null && <span><Clock size={12} /> replies in {formatReplyTime(store.reply_time_minutes)}</span>}
          </div>
          <p className="fs-m-bio">{store.store_bio || "Premium conversational commerce storefront."}</p>
          {store.working_hours && <div className="fs-m-hours"><Clock size={12} /> {store.working_hours}</div>}
          <div className="fs-m-trust"><ShieldCheck size={13} /> Secure payment and instant receipt, secured by Frontstore</div>
        </section>

        {announcement}

        {pinnedProduct && (
          <section className="fs-m-pinned">
            <span className="fs-m-pin-flag"><Crown size={11} /> Signature treatment</span>
            <div className="fs-m-pin-card">
              <Media cat={pinnedProduct.category_id || "Lashes"} h={160} imgUrl={pinnedProduct.image_urls?.[0]} />
              <div className="fs-m-pin-body">
                <h3>{pinnedProduct.name}</h3>
                <p>{pinnedProduct.description || "Nourishing beauty collection signature treatment."}</p>
                <div className="fs-m-pin-foot">
                  <span className="fs-price">{fmt(pinnedProduct.price, currencySymbol)}</span>
                  {isProductService(pinnedProduct, store) ? (
                    <span className="fs-dur"><Clock size={12} /> {fmtDuration(pinnedProduct.duration_minutes) || 'Service'}</span>
                  ) : (
                    <span className="fs-dur"><Truck size={12} /> Ready to ship</span>
                  )}
                </div>
                {isProductService(pinnedProduct, store) ? (
                  <button className="fs-cta fs-book fs-cta-full" onClick={() => openBooking(pinnedProduct)}><Calendar size={15} /> Book this treatment</button>
                ) : (
                  <button className="fs-cta fs-buy fs-cta-full" onClick={() => addProduct(pinnedProduct)}><ShoppingBag size={15} /> Order this product</button>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="fs-filters fs-m-filters" ref={searchRef}>
          <div className="fs-searchwrap">
            <Search size={16} className="fs-search-ic" />
            <input placeholder="Search this store" value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button onClick={() => setQuery("")} aria-label="Clear query"><X size={14} /></button>}
          </div>
          <div className="fs-segs">
            {(["all", "service", "product"] as const).map(k => (
              <button key={k} className={segment === k ? "on" : ""} onClick={() => setSegment(k)}>
                {k === "all" ? "All" : k === "service" ? "Services" : "Products"}
              </button>
            ))}
          </div>
          <div className="fs-cats">
            <button className={!activeCat ? "on" : ""} onClick={() => setActiveCat(null)}>All</button>
            {activeCategories.map(c => (
              <button key={c.id} className={activeCat === c.id ? "on" : ""} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}>{c.name}</button>
            ))}
          </div>
        </div>

        <section className="fs-m-grid">
          {filteredProducts.length === 0 && <p className="fs-empty">Nothing matches that yet.</p>}
          {filteredProducts.map((it, idx) => {
            const isService = isProductService(it, store);
            return (
              <article key={it.id} className="fs-card" style={{ animationDelay: `${idx * 40}ms` }} onClick={() => router.push(`/${username}/products/${it.slug}`)}>
                <div className="fs-card-media">
                  <Media cat={activeCategoryName || "Lashes"} h={96} imgUrl={it.image_urls?.[0]} />
                  <span className={`fs-type ${isService ? 'service' : 'product'}`}>{isService ? "Service" : "Product"}</span>
                  {it.compare_at_price && <span className="fs-pop"><Heart size={9} fill="#fff" color="#fff" /> Loved</span>}
                </div>
                <div className="fs-card-body">
                  <h3>{it.name}</h3>
                  <div className="fs-card-foot">
                    {isService ? (
                      <span className="fs-line"><Clock size={11} /> {fmtDuration(it.duration_minutes) || 'Service'}</span>
                    ) : (
                      <span className={`fs-line ${it.stock_status === "low_stock" ? "low" : ""}`}><Truck size={11} /> {it.stock_status === "low_stock" ? "Low stock" : "In stock"}</span>
                    )}
                    <span className="fs-price">{fmt(it.price, currencySymbol)}</span>
                  </div>
                  {isService ? (
                    <button className="fs-cta fs-book fs-cta-full" onClick={e => { e.stopPropagation(); openBooking(it); }}><Calendar size={13} /> Book</button>
                  ) : (
                    <button className="fs-cta fs-buy fs-cta-full" onClick={e => { e.stopPropagation(); addProduct(it); }}><ShoppingBag size={13} /> Buy</button>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="fs-reviews fs-m-reviews" ref={reviewsRef}>
          <div className="fs-section-label" style={{ padding: "0 0 10px" }}><Star size={13} fill="#c79a4b" color="#c79a4b" /> Reviews</div>
          {reviews.length > 0 ? reviews.slice(0, 3).map((rv) => (
            <div className="fs-rev" key={rv.id}>
              <div className="fs-rev-top"><span className="fs-rev-av">{rv.reviewer_name[0].toUpperCase()}</span><div><b>{rv.reviewer_name}</b><span className="fs-rev-stars-sm">{"★".repeat(Math.max(1, Math.min(5, rv.rating)))}</span></div></div>
              <p>{rv.body}</p>
            </div>
          )) : (
            <p className="fs-empty">No reviews yet.</p>
          )}
        </section>

        <footer className="fs-m-foot">
          {premium ? (
            <span className="fs-foot-sec"><ShieldCheck size={12} /> Payments secured by Frontstore</span>
          ) : (
            <>
              <span className="fs-foot-sec"><ShieldCheck size={12} /> Secured by Frontstore</span>
              <button className="fs-foot-link" onClick={() => window.location.href = '/'}>More stores <ChevronRight size={13} /></button>
            </>
          )}
        </footer>
        <div style={{ height: 78 }} />

        {/* Mobile sticky bottom bar */}
        <nav className="fs-m-bottom">
          {premium ? (
            <button className="fs-bn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Store size={19} /><span>Shop</span></button>
          ) : (
            <button className="fs-bn" onClick={() => window.location.href = '/'}><Store size={19} /><span>Home</span></button>
          )}
          <button className="fs-bn" onClick={focusSearch}><Search size={19} /><span>Search</span></button>
          <button className="fs-bn-primary" onClick={() => { setCheckoutStep('cart'); setBagOpen(true); }} aria-label="Order bag checkout" style={{ background: `linear-gradient(150deg, ${storeTheme['--brand']}, ${storeTheme['--brand-deep']})` }}>
            <ShoppingBag size={22} color="#fff" />
            {bagCount > 0 && <span className="fs-badge" style={{ top: -2, right: -2, border: "2px solid var(--bg)" }}>{bagCount}</span>}
          </button>
          <button className="fs-bn" onClick={() => scrollTo(reviewsRef)}><Star size={19} /><span>Reviews</span></button>
          <button className="fs-bn" onClick={() => {
            openWhatsAppChat(`Hi ${store.store_name}!`);
          }}><WhatsAppIcon size={19} /><span>Chat</span></button>
        </nav>
      </div>

      {/* ── SHARED: Booking Sheet ── */}
      <div className={`fs-scrim ${booking ? "show" : ""}`} onClick={() => setBooking(null)} />
      <div className={`fs-sheet ${booking ? "open" : ""}`}>
        {booking ? (() => {
          const b = booking!;
          return (
            <>
              <div className="fs-sheet-grab" />
              <div className="fs-sheet-head">
                <div><h3>{b.name}</h3><span><Clock size={12} /> {fmtDuration(b.duration_minutes) || 'Service'} · {fmt(b.price, currencySymbol)}</span></div>
                <button className="fs-m-icn" onClick={() => setBooking(null)} aria-label="Close booking"><X size={20} /></button>
              </div>
              <p className="fs-sheet-lbl">Choose a day</p>
              <div className="fs-daterow">
                {days.map((d, i) => (
                  <button key={i} className={`fs-date ${bDate === i ? "on" : ""}`} onClick={() => setBDate(i)}>
                    <b>{d.label}</b><span>{d.date}</span>
                  </button>
                ))}
              </div>
              <p className="fs-sheet-lbl">Choose a time</p>
              <div className="fs-timerow">
                {slots.map((s, i) => (
                  <button key={i} className={`fs-time ${bTime === i ? "on" : ""}`} onClick={() => setBTime(i)}>{s}</button>
                ))}
              </div>
              <button className="fs-sheet-cta" onClick={confirmBooking} style={{ background: storeTheme['--brand'], color: '#fff' }}>
                Confirm Date &amp; Proceed · {fmt(b.price, currencySymbol)}
              </button>
              <span className="fs-sheet-note">Confirm and pay securely on the next step.</span>
            </>
          );
        })() : null}
      </div>

      {/* ── SHARED: Bag/Cart Checkout Drawer ── */}
      <div className={`fs-scrim ${bagOpen ? "show" : ""}`} onClick={() => setBagOpen(false)} />
      <div className={`fs-sheet fs-bag ${bagOpen ? "open" : ""}`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="fs-sheet-grab" />
        <div className="fs-sheet-head">
          {checkoutStep === 'details' ? (
            <button className="fs-back" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }} onClick={() => setCheckoutStep('cart')}>
              <ChevronLeft size={16} /> Back to Bag
            </button>
          ) : (
            <h3>Your order</h3>
          )}
          <button className="fs-m-icn" onClick={() => setBagOpen(false)} aria-label="Close drawer"><X size={20} /></button>
        </div>

        {checkoutStep === 'cart' ? (
          bag.length === 0 ? (
            <p className="fs-bag-empty">Your order is empty. Add a product or book a treatment to get started.</p>
          ) : (
            <>
              <div className="fs-bag-list">
                {bag.map(b => (
                  <div className="fs-bag-item" key={b.key}>
                    <div className="fs-bag-info">
                      <b>{b.name}</b>
                      {b.type === "service" ? <span><Calendar size={11} /> {b.slot}</span> : <span>Product</span>}
                      <span className="fs-bag-price">{fmt(b.price, currencySymbol)}</span>
                    </div>
                    {b.type === "product" ? (
                      <div className="fs-step">
                        <button onClick={() => changeQty(b.key, -1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                        <span>{b.qty}</span>
                        <button onClick={() => changeQty(b.key, 1)} aria-label="Increase quantity"><Plus size={13} /></button>
                      </div>
                    ) : (
                      <button className="fs-rm" onClick={() => removeItem(b.key)} aria-label="Remove item"><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="fs-bag-total"><span>Total</span><b>{fmt(bagTotal, currencySymbol)}</b></div>
              <button className="fs-pay" onClick={() => setCheckoutStep('details')}><ShieldCheck size={16} /> Pay securely {fmt(bagTotal, currencySymbol)}</button>
              <span className="fs-pay-note"><Receipt size={11} /> You get an instant WhatsApp receipt. Secured by Frontstore.</span>
            </>
          )
        ) : (
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'grid', gap: 14, paddingBottom: 24 }}>
            {storeDisclaimer && (
              <div style={{
                background: 'var(--tint)',
                color: 'var(--brand-deep)',
                borderRadius: 12,
                border: '1px solid color-mix(in srgb, var(--brand) 20%, transparent)',
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                lineHeight: 1.4
              }}>
                <ShieldCheck size={16} style={{ flexShrink: 0, color: 'var(--brand)' }} />
                <div>{storeDisclaimer}</div>
              </div>
            )}

            {checkoutError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600 }}>
                {checkoutError}
              </div>
            )}

            <div>
              <label className="fs-opt-lbl">Your Name</label>
              <input 
                type="text" 
                className="fs-input-field" 
                required
                placeholder="e.g. Joy Okafor" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="fs-opt-lbl">WhatsApp Number</label>
              <input 
                type="tel" 
                className="fs-input-field" 
                required
                placeholder="e.g. +234 803 123 4567" 
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="fs-opt-lbl">Email Address (Optional)</label>
              <input 
                type="email" 
                className="fs-input-field" 
                placeholder="e.g. joy@example.com" 
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>

            {bag.some(x => x.type === 'service') ? (
              <div>
                <label className="fs-opt-lbl">Fulfillment / Session Location</label>
                <div className="fs-sizes" style={{ marginBottom: 10 }}>
                  <button 
                    type="button" 
                    className={`fs-size ${deliveryMethod === 'pickup' ? 'on' : ''}`}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    <b>Studio Session</b>
                    <span>At our salon</span>
                  </button>
                  <button 
                    type="button" 
                    className={`fs-size ${deliveryMethod === 'delivery' ? 'on' : ''}`}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    <b>Mobile Session</b>
                    <span>We come to you</span>
                  </button>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div>
                    <label className="fs-opt-lbl">Your Address</label>
                    <textarea 
                      className="fs-input-field" 
                      required
                      placeholder="Enter your street address for the mobile service"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      style={{ minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="fs-opt-lbl">Fulfillment Method</label>
                <div className="fs-sizes" style={{ marginBottom: 10 }}>
                  <button 
                    type="button" 
                    className={`fs-size ${deliveryMethod === 'delivery' ? 'on' : ''}`}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    <b>Door Delivery</b>
                    <span>Ship to my address</span>
                  </button>
                  <button 
                    type="button" 
                    className={`fs-size ${deliveryMethod === 'pickup' ? 'on' : ''}`}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    <b>Self-Pickup</b>
                    <span>Collect at store</span>
                  </button>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div>
                    <label className="fs-opt-lbl">Shipping Address</label>
                    <textarea 
                      className="fs-input-field" 
                      required
                      placeholder="Enter your full home or office address"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      style={{ minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="fs-pay" 
              disabled={checkoutLoading}
              style={{ marginTop: 8 }}
            >
              {checkoutLoading ? "Placing Order..." : `Place Order · ${fmt(bagTotal, currencySymbol)}`}
            </button>
          </form>
        )}
      </div>

      {/* Order confirmation receipt modal */}
      {receipt ? (() => {
        const r = receipt!;
        return (
          <>
            <div className="drawer-backdrop animate-backdrop" style={{ zIndex: 220 }} />
            <div
              className="card animate-scale-in"
              role="dialog"
              aria-modal="true"
              aria-label="Order receipt"
              style={{
                position: 'fixed',
                left: 16,
                right: 16,
                bottom: 16,
                zIndex: 230,
                maxWidth: 440,
                margin: '0 auto',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                backgroundColor: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--line)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--tint)',
                    color: 'var(--brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Fraunces', fontSize: 19, fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                      Order Created!
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: '3px 0 0' }}>
                      Receipt from {store.store_name}
                    </p>
                  </div>
                </div>
                <button 
                  className="clickable" 
                  onClick={() => setOrderReceipt(null)} 
                  aria-label="Close receipt"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, background: 'var(--bg)', display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Order Reference</span>
                  <strong style={{ color: 'var(--ink)', fontSize: 14 }}>#{r.order.order_number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Total Amount</span>
                  <strong style={{ color: 'var(--brand)', fontSize: 15 }}>{fmt(r.order.total_amount, currencySymbol)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Fulfillment</span>
                  <strong style={{ color: 'var(--ink)', fontSize: 14, textTransform: 'capitalize' }}>{r.order.delivery_method}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Status</span>
                  <span className="badge" style={{ backgroundColor: 'var(--tint)', color: 'var(--brand-deep)', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                    {r.order.order_status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.45 }}>
                <Shield size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
                <span>Your tracking page is ready. Save the link to check updates and confirm payment outside WhatsApp.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 10 }}>
                <a 
                  href={`/track/${r.order.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="fs-msg-btn" 
                  style={{ textDecoration: 'none', margin: 0, padding: 10, display: 'flex', gap: 6 }}
                >
                  <ExternalLink size={15} /> View tracking page
                </a>
                <button 
                  type="button" 
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/track/${r.order.id}`);
                    toast.success('Tracking link copied to clipboard!');
                  }} 
                  className="fs-msg-btn" 
                  aria-label="Copy tracking link" 
                  title="Copy tracking link" 
                  style={{ padding: 0, margin: 0 }}
                >
                  <Copy size={15} />
                </button>
              </div>

              {r.order.payment_status === 'unpaid' && (
                <button
                  type="button"
                  onClick={handlePayOnline}
                  disabled={isPaying}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: 'var(--brand)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, .16)'
                  }}
                >
                  {isPaying ? 'Initializing payment...' : `Pay Online Now (${fmt(r.order.total_amount, currencySymbol)})`}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setPendingWaUrl(r.whatsapp_url);
                  setOrderReceipt(null);
                }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer'
                }}
              >
                <WhatsAppIcon size={18} />
                Continue on WhatsApp
              </button>
            </div>
          </>
        );
      })() : null}

      {/* Toast Alert popup */}
      <div className={`fs-toast ${toastMsg ? "show" : ""}`}><Check size={14} /> {toastMsg}</div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.fs-root {
  /* --bg/--surface inherit from the shared :root / :root.dark theme so dark mode applies here too;
     --ink/--muted/--line alias the shared text/border tokens for the same reason */
  --ink: var(--text); --muted: var(--text-muted);
  --brand: #25D366; --brand-deep: #128c7e; --tint: #dcf8c6; --gold: #c79a4b;
  --line: var(--border); --radius: 16px;
  --t-fast: 0.2s;
  font-family: 'Hanken Grotesk', sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.fs-root button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }

@keyframes rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

/* ── show/hide by viewport ── */
.fs-desktop { display: none; }
.fs-mobile  { display: block; }
@media (min-width: 768px) {
  .fs-desktop { display: flex; }
  .fs-mobile  { display: none; }
}

/* ══════════════════════════════
   DESKTOP
══════════════════════════════ */
.fs-desktop {
  min-height: 100vh;
  align-items: flex-start;
  background: var(--bg);
  width: 100%;
}

/* Sidebar */
.fs-sidebar {
  width: 280px;
  flex: 0 0 280px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background: var(--surface);
  border-right: 1px solid var(--line);
  padding: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-width: none;
}
.fs-sidebar::-webkit-scrollbar { display: none; }

.fs-plan {
  display: flex;
  padding: 10px 12px;
  gap: 6px;
  background: #221019;
}
.fs-plan button {
  flex: 1; display: inline-flex; align-items: center; justify-content: center;
  gap: 5px; padding: 7px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 600; color: #e7c9d5;
  border: 1px dashed rgba(231,201,213,.4);
}
.fs-plan button.on { background: var(--brand); color: #fff; border-style: solid; border-color: var(--brand); }

.fs-sid-cover {
  height: 80px;
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
  position: relative;
  flex-shrink: 0;
}

.fs-sid-id {
  display: flex; flex-direction: column; align-items: flex-start;
  padding: 0 16px; position: relative;
  min-width: 0;
}
.fs-sid-id > div { min-width: 0; width: 100%; margin-top: 10px; }
.fs-sid-av {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  color: #fff; font-family: 'Fraunces', serif; font-weight: 700; font-size: 26px;
  display: grid; place-items: center; border: 3px solid var(--surface); flex-shrink: 0;
  margin-top: -28px;
}
.fs-sid-id h2 {
  font-family: 'Fraunces', serif; font-weight: 700; font-size: 15px;
  line-height: 1.25; display: flex; align-items: center; gap: 5px;
  flex-wrap: wrap; word-break: break-word;
}
.fs-sid-meta { font-size: 11.5px; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-top: 3px; }
.fs-verif { color: var(--brand); }

.fs-sid-url {
  display: flex; align-items: center; gap: 6px;
  margin: 12px 16px 0; padding: 8px 12px;
  background: var(--tint); border-radius: 10px;
  font-size: 12px; color: var(--muted); cursor: pointer;
  text-align: left;
}
.fs-sid-url b { color: var(--brand-deep); font-weight: 700; }
.fs-sid-url svg { color: var(--brand); margin-left: auto; }

.fs-sid-stats {
  display: flex; flex-direction: column; gap: 7px;
  padding: 14px 16px 0; font-size: 12.5px; font-weight: 500;
}
.fs-sid-stats div { display: flex; align-items: center; gap: 6px; color: var(--ink); }
.fs-sid-stats span { color: var(--muted); font-weight: 400; }

.fs-sid-bio { font-size: 12.5px; line-height: 1.55; color: #5a4751; padding: 12px 16px 0; }

.fs-sid-trust {
  display: flex; align-items: center; gap: 6px;
  margin: 14px 16px 0; padding: 10px 12px;
  background: var(--tint); color: var(--brand-deep);
  font-size: 11.5px; font-weight: 600; border-radius: 10px;
}

.fs-sid-nav {
  display: flex; flex-direction: column; gap: 2px;
  padding: 16px 10px 0;
}
.fs-sid-nav button {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 12px; border-radius: 10px;
  font-size: 13px; font-weight: 600; color: var(--ink);
  text-align: left;
}
.fs-sid-nav button:hover { background: var(--tint); color: var(--brand-deep); }

.fs-sid-bag {
  margin: auto 16px 0; padding: 13px 16px;
  background: var(--brand); color: #fff !important;
  border-radius: 13px; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
}
.fs-sid-bag:hover { background: var(--brand-deep); color: #fff !important; }
.fs-sid-bag:active { transform: translateY(1px); }
.fs-sid-total { margin-left: auto; font-size: 12px; font-weight: 600; opacity: .85; }

/* Main area */
.fs-main {
  flex: 1; min-width: 0; overflow-y: auto;
  height: 100vh; scrollbar-width: thin;
}

.fs-topbar {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 28px;
  background: color-mix(in srgb, var(--bg) 90%, transparent); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.fs-topbar-left { display: flex; align-items: center; gap: 10px; }
.fs-topbar-right { display: flex; align-items: center; gap: 6px; }
.fs-tb-btn {
  width: 38px; height: 38px; border-radius: 10px;
  display: grid; place-items: center; color: var(--muted);
}
.fs-tb-btn:hover { background: var(--tint); color: var(--brand); }
.fs-tb-bag {
  display: flex; align-items: center; gap: 7px; position: relative;
  padding: 9px 16px; border-radius: 11px;
  background: var(--brand); color: #fff;
  font-size: 13px; font-weight: 700;
}
.fs-tb-bag:hover { background: var(--brand-deep); }
.fs-fs-logo { font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px; }
.fs-fs-logo span { color: var(--brand); }
.fs-premium-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 700; color: var(--gold);
  background: rgba(199,154,75,.12); padding: 5px 10px; border-radius: 8px;
}

/* Hero */
.fs-hero {
  position: relative; height: 260px; overflow: hidden;
}
.fs-hero-art {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
}
.fs-hero-grain {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px);
  background-size: 14px 14px;
}
.fs-hero-content {
  position: relative; z-index: 2;
  padding: 36px 32px; color: #fff;
  max-width: 600px;
}
.fs-hero-cat {
  font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
  opacity: .8; display: block; margin-bottom: 8px;
}
.fs-hero-name {
  font-family: 'Fraunces', serif; font-weight: 700; font-size: 32px;
  letter-spacing: -.02em; line-height: 1.1; margin-bottom: 10px;
}
.fs-hero-bio { font-size: 14px; opacity: .85; line-height: 1.5; margin-bottom: 20px; max-width: 460px; }
.fs-hero-socials { display: flex; gap: 12px; align-items: center; margin-top: 4px; }
.fs-social-link {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.18); color: #fff;
  transition: background .18s, transform .15s;
  text-decoration: none;
  border: none; cursor: pointer; appearance: none;
}
.fs-social-link:hover { background: rgba(255,255,255,0.32); transform: scale(1.1); }
.fs-ann {
  display: flex; align-items: flex-start; gap: 10px;
  margin: 18px 28px 0; padding: 12px 13px;
  border-radius: 14px; background: #fbf2e3; border: 1px solid #ecd9bf; color: #7a5a36;
}
.fs-ann svg:first-child { color: var(--gold); flex: 0 0 auto; margin-top: 1px; }
.fs-ann p { flex: 1; font-size: 13px; line-height: 1.5; margin: 0; }
.fs-ann b { color: var(--brand-deep); margin-right: 5px; }
.fs-ann button { flex: 0 0 auto; color: #b39064; display: grid; place-items: center; }

/* Featured */
.fs-featured { padding: 28px 28px 8px; }
.fs-section-label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; color: var(--gold);
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 12px;
}
.fs-feat-card {
  display: flex; gap: 0; border-radius: 20px; overflow: hidden;
  border: 1px solid var(--line); background: var(--surface);
  box-shadow: 0 8px 24px rgba(43,29,42,.07);
}
.fs-feat-media { flex: 0 0 44%; }
.fs-feat-body { flex: 1; padding: 22px 24px; display: flex; flex-direction: column; gap: 0; }
.fs-feat-badge {
  display: inline-block; font-size: 11px; font-weight: 700;
  background: var(--tint); color: var(--brand-deep);
  padding: 4px 10px; border-radius: 8px; margin-bottom: 10px;
  align-self: flex-start;
}
.fs-feat-body h3 { font-family: 'Fraunces', serif; font-weight: 700; font-size: 22px; letter-spacing: -.01em; }
.fs-feat-body p { font-size: 13.5px; color: var(--muted); line-height: 1.55; margin-top: 8px; }
.fs-feat-row { display: flex; align-items: center; gap: 12px; margin-top: 16px; }

/* Filters */
.fs-filters { padding: 20px 28px 12px; position: sticky; top: 62px; z-index: 20; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.fs-filter-top { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.fs-searchwrap { flex: 1; position: relative; display: flex; align-items: center; }
.fs-search-ic { position: absolute; left: 13px; color: var(--muted); }
.fs-searchwrap input {
  width: 100%; padding: 11px 38px; border-radius: 11px;
  border: 1.5px solid var(--line); background: var(--surface);
  font-size: 13.5px; font-family: inherit;
}
.fs-searchwrap input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px var(--tint); }
.fs-searchwrap > button { position: absolute; right: 11px; color: var(--muted); width: 24px; height: 24px; display: grid; place-items: center; }
.fs-segs { display: flex; gap: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 3px; flex-shrink: 0; }
.fs-segs button { padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); }
.fs-segs button.on { background: var(--brand); color: #fff; }
.fs-cats { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; }
.fs-cats::-webkit-scrollbar { display: none; }
.fs-cats button {
  flex: 0 0 auto; font-size: 12px; font-weight: 600; padding: 6px 13px;
  border-radius: 999px; background: var(--surface); border: 1px solid var(--line);
}
.fs-cats button.on { background: var(--brand-deep); color: #fff; border-color: var(--brand-deep); }

/* Desktop grid — 3 cols */
.fs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px 28px 10px;
}
@media (min-width: 1100px) { .fs-grid { grid-template-columns: repeat(4, 1fr); } }

/* Mobile grid — 2 cols */
.fs-m-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; padding: 6px 16px 4px;
}

.fs-empty { grid-column: 1/-1; text-align: center; color: var(--muted); font-size: 13.5px; padding: 30px 0; }

.fs-card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 16px; overflow: hidden; animation: rise .45s both;
  box-shadow: 0 4px 12px rgba(43,29,42,.05);
  display: grid;
  grid-template-rows: auto 1fr;
}
.fs-card:hover { box-shadow: 0 8px 24px rgba(43,29,42,.1); transform: translateY(-2px); transition: .2s; }
.fs-card-media { position: relative; overflow: hidden; }
.fs-type {
  position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 7px; backdrop-filter: blur(4px);
  z-index: 2;
}
.fs-type.service { background: rgba(255,255,255,.92); color: var(--brand-deep); }
.fs-type.product { background: rgba(43,29,42,.78); color: #fff; }
.fs-pop {
  position: absolute; top: 8px; right: 8px; display: inline-flex; align-items: center; gap: 3px;
  font-size: 9.5px; font-weight: 700; color: #fff; background: rgba(129,0,209,.85);
  padding: 3px 7px; border-radius: 7px;
  z-index: 2;
}
.fs-card-body { padding: 11px 12px 12px; min-height: 0; display: flex; flex-direction: column; }
.fs-card-body h3 {
  font-size: 13px; font-weight: 700; letter-spacing: -.01em; line-height: 1.25;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 32px;
}
.fs-card-desc {
  font-size: 11.5px; color: var(--muted); line-height: 1.45; margin-top: 5px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 33px;
}
.fs-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 9px; gap: 6px; }
.fs-line { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); }
.fs-line.low { color: var(--brand); font-weight: 600; }
.fs-price { font-family: 'Fraunces', serif; font-weight: 700; font-size: 17px; color: var(--brand-deep); }
.fs-dur { font-size: 12px; color: var(--muted); display: inline-flex; align-items: center; gap: 4px; }

/* CTAs */
.fs-cta {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; font-size: 13px; font-weight: 700; padding: 9px 14px;
  border-radius: 11px; color: #fff;
}
.fs-cta-full { width: 100%; margin-top: 10px; padding: 10px 12px; border-radius: 12px; }
.fs-cta:active { transform: translateY(1px); }
.fs-buy { background: var(--brand-deep); color: #fff; box-shadow: 0 3px 8px rgba(18, 140, 126, .16); }
.fs-buy:hover { filter: brightness(1.08); }
.fs-book { background: var(--brand); color: #fff; box-shadow: 0 3px 8px rgba(37, 211, 102, .16); }
.fs-book:hover { filter: brightness(1.08); }

@media (max-width: 767px) {
  .fs-card-body { padding: 10px 10px 11px; }
  .fs-card-body h3 { font-size: 12.5px; min-height: 31px; }
  .fs-card-desc { display: none; }
  .fs-card-foot { margin-top: 7px; align-items: flex-end; }
  .fs-line { font-size: 10.5px; }
  .fs-price { font-size: 15.5px; }
  .fs-cta-full { margin-top: 9px; padding: 9px 10px; font-size: 12.5px; }
}

/* Reviews (desktop) */
.fs-reviews { padding: 24px 28px 10px; }
.fs-rev-head {
  display: flex; align-items: center; gap: 16px; margin: 12px 0 20px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 16px; padding: 18px 20px;
}
.fs-rev-rating { font-family: 'Fraunces', serif; font-weight: 700; font-size: 42px; color: var(--brand-deep); line-height: 1; }
.fs-rev-stars { color: var(--gold); font-size: 18px; letter-spacing: 2px; }
.fs-rev-head span { font-size: 13px; color: var(--muted); }
.fs-rev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 900px) { .fs-rev-grid { grid-template-columns: 1fr 1fr; } }

/* Reviews shared */
.fs-rev { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 14px; }
.fs-rev-top { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.fs-rev-av {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--tint); color: var(--brand-deep);
  font-weight: 700; display: grid; place-items: center; font-size: 14px;
}
.fs-rev-top b { font-size: 13.5px; display: block; }
.fs-rev-stars-sm { color: var(--gold); font-size: 11px; display: block; margin-top: 1px; }
.fs-rev p { font-size: 13px; color: #5a4751; line-height: 1.5; }

/* Desktop footer */
.fs-foot { border-top: 1px solid var(--line); margin-top: 16px; padding: 20px 28px; }
.fs-foot-inner { display: flex; align-items: center; gap: 16px; }
.fs-foot-brand { font-family: 'Fraunces', serif; font-weight: 600; font-size: 15px; }
.fs-foot-sec { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--muted); margin-left: auto; }
.fs-foot-link { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: var(--brand-deep); }

/* Badge */
.fs-badge {
  position: absolute; top: 3px; right: 3px;
  min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px;
  background: var(--brand); color: #fff;
  font-size: 10px; font-weight: 700; display: grid; place-items: center;
}

/* ══════════════════════════════
   MOBILE
══════════════════════════════ */
.fs-m-top {
  position: sticky; top: 0; z-index: 40; display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.fs-m-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
.fs-m-av {
  width: 30px; height: 30px; border-radius: 9px;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  color: #fff; font-family: 'Fraunces', serif; font-weight: 700;
  display: grid; place-items: center; font-size: 16px; flex: 0 0 auto;
}
.fs-m-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fs-m-actions { margin-left: auto; display: flex; align-items: center; gap: 2px; }
.fs-m-icn { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; position: relative; }
.fs-m-icn:active { background: var(--tint); }
.fs-m-bagbtn { position: relative; }

.fs-m-cover { padding: 0 16px 16px; }
.fs-m-cover-art { height: 134px; margin: 0 -16px; background: linear-gradient(135deg, var(--brand), var(--brand-deep)); position: relative; overflow: visible; }
.fs-m-grain { position: absolute; inset: 0; overflow: hidden; background-image: radial-gradient(rgba(255,255,255,.16) 1px, transparent 1px); background-size: 13px 13px; }
.fs-m-id-row { position: absolute; bottom: -10px; left: 16px; right: 16px; display: flex; align-items: flex-start; gap: 12px; }
.fs-m-id-info { padding-top: 6px; }
.fs-m-id-name { font-family: 'Fraunces', serif; font-weight: 700; font-size: 19px; letter-spacing: -.01em; color: #fff; display: flex; align-items: center; gap: 6px; line-height: 1.15; }
.fs-m-meta-hero { color: rgba(255,255,255,.75) !important; margin-top: 4px; }
.fs-m-avatar {
  width: 66px; height: 66px; border-radius: 18px;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  color: #fff; font-family: 'Fraunces', serif; font-weight: 700; font-size: 30px;
  display: grid; place-items: center; border: 4px solid var(--bg); flex: 0 0 auto;
}
.fs-m-meta { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-top: 3px; }
.fs-m-url { display: inline-flex; align-items: center; gap: 7px; margin-top: 40px; background: var(--surface); border: 1px solid var(--line); padding: 8px 12px; border-radius: 10px; font-size: 12.5px; color: var(--muted); }
.fs-m-url b { color: var(--brand-deep); font-weight: 700; }
.fs-m-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; font-size: 12px; font-weight: 600; }
.fs-m-stats span { display: inline-flex; align-items: center; gap: 4px; }
.fs-m-stats i { color: var(--muted); font-style: normal; font-weight: 400; }
.fs-m-bio { font-size: 13px; line-height: 1.55; color: #5a4751; margin-top: 12px; }
.fs-m-hours { font-size: 12px; color: var(--muted); display: inline-flex; align-items: center; gap: 5px; margin-top: 9px; }
.fs-m-trust { display: flex; align-items: center; gap: 6px; margin-top: 12px; background: var(--tint); color: var(--brand-deep); font-size: 11.5px; font-weight: 600; padding: 9px 11px; border-radius: 10px; }
.fs-mobile .fs-ann { margin: 10px 16px 6px; }

.fs-m-pinned { padding: 4px 16px 4px; }
.fs-m-pin-flag { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
.fs-m-pin-card { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
.fs-m-pin-body { padding: 13px 14px 14px; }
.fs-m-pin-body h3 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 17px; }
.fs-m-pin-body p { font-size: 12.5px; color: var(--muted); line-height: 1.5; margin-top: 5px; }
.fs-m-pin-foot { display: flex; align-items: center; gap: 8px; margin-top: 12px; }

.fs-m-filters { position: sticky; top: 58px; z-index: 30; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); padding: 12px 16px 9px; margin-top: 6px; }
.fs-m-filters .fs-filter-top { display: none; }

.fs-m-reviews { padding: 18px 16px 6px; display: flex; flex-direction: column; gap: 10px; }

.fs-m-foot { padding: 16px 16px 20px; display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--line); margin-top: 8px; }

.fs-m-bottom {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 45;
  background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-around;
  padding: 8px 8px 12px;
}
.fs-bn { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; color: var(--muted); flex: 1; }
.fs-bn span { line-height: 1; }
.fs-bn:active { color: var(--brand); }
.fs-bn-primary {
  position: relative; width: 54px; height: 54px; border-radius: 50%;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  display: grid; place-items: center; margin-top: -24px;
  box-shadow: 0 4px 12px rgba(18, 140, 126, .2); border: 4px solid var(--bg);
}
.fs-bn-primary:active { transform: scale(.95); }

/* ── SHARED: Sheets / Overlays ── */
.fs-scrim {
  position: fixed; inset: 0; background: rgba(43,29,42,.5);
  opacity: 0; pointer-events: none; transition: .25s; z-index: 80;
}
.fs-scrim.show { opacity: 1; pointer-events: auto; }
.fs-sheet {
  position: fixed; bottom: 0; left: 50%; transform: translate(-50%, 103%);
  width: 100%; max-width: 540px; z-index: 90;
  background: var(--surface); border-radius: 26px 26px 0 0;
  padding: 8px 22px 28px; transition: transform .3s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 -10px 40px rgba(43,29,42,.18);
}
.fs-sheet.open { transform: translate(-50%, 0); }
.fs-sheet-grab { width: 42px; height: 5px; border-radius: 3px; background: var(--line); margin: 6px auto 14px; }
.fs-sheet-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.fs-sheet-head h3 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 19px; letter-spacing: -.01em; }
.fs-sheet-head span { font-size: 12.5px; color: var(--muted); display: inline-flex; align-items: center; gap: 5px; margin-top: 4px; }
.fs-sheet-lbl { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 4px 0 9px; }
.fs-daterow { display: flex; gap: 8px; overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; margin-bottom: 14px; }
.fs-daterow::-webkit-scrollbar { display: none; }
.fs-date { flex: 0 0 auto; min-width: 64px; padding: 10px; border-radius: 12px; border: 1.5px solid var(--line); background: var(--bg); text-align: center; display: flex; flex-direction: column; }
.fs-date b { display: block; font-size: 13px; }
.fs-date span { font-size: 11px; color: var(--muted); }
.fs-date.on { border-color: var(--brand); background: var(--tint); }
.fs-date.on b { color: var(--brand-deep); }
.fs-timerow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; }
.fs-time { padding: 11px 0; border-radius: 10px; border: 1.5px solid var(--line); background: var(--bg); font-size: 13px; font-weight: 600; text-align: center; }
.fs-time.on { border-color: var(--brand); background: var(--tint); color: var(--brand-deep); }

.fs-sheet-cta, .fs-pay {
  width: 100%; padding: 14px; border-radius: 14px;
  background: var(--brand) !important; color: #fff !important;
  font-size: 15px; font-weight: 700; border: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, .18);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.fs-sheet-cta:hover, .fs-pay:hover { filter: brightness(1.05); background: var(--brand-deep) !important; color: #fff !important; }
.fs-sheet-note, .fs-pay-note { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 11.5px; color: var(--muted); margin-top: 12px; }

/* Bag drawer specific list */
.fs-bag-empty { text-align: center; color: var(--muted); font-size: 14px; padding: 36px 0; }
.fs-bag-list { display: flex; flex-direction: column; gap: 12px; max-height: 280px; overflow-y: auto; margin-bottom: 14px; }
.fs-bag-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 10px; }
.fs-bag-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.fs-bag-info b { font-size: 13.5px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fs-bag-info span { font-size: 11.5px; color: var(--muted); display: inline-flex; align-items: center; gap: 4px; }
.fs-bag-price { font-size: 13.5px; font-weight: 700; color: var(--brand-deep); }
.fs-step { display: flex; align-items: center; gap: 10px; background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 5px 10px; }
.fs-step button { width: 20px; height: 20px; display: grid; place-items: center; color: var(--brand-deep); }
.fs-step span { font-weight: 700; font-size: 13px; min-width: 14px; text-align: center; }
.fs-rm { width: 32px; height: 32px; display: grid; place-items: center; color: var(--muted); border-radius: 8px; }
.fs-rm:active { background: var(--tint); color: var(--brand); }
.fs-bag-total { display: flex; justify-content: space-between; align-items: baseline; font-size: 15px; font-weight: 700; padding: 8px 0 16px; border-top: 1px solid var(--line); }
.fs-bag-total b { font-family: 'Fraunces', serif; font-size: 20px; color: var(--brand-deep); }

/* Fields styling */
.fs-input-field {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: var(--bg);
  color: var(--ink);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.fs-input-field:focus {
  border-color: var(--brand);
  background: var(--surface);
}

/* Toast popup styling */
.fs-toast {
  position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%) translateY(10px); z-index: 100;
  background: var(--ink); color: #fff; font-size: 13px; font-weight: 600; padding: 11px 16px;
  border-radius: 12px; display: flex; align-items: center; gap: 7px; opacity: 0; pointer-events: none;
  transition: .22s; box-shadow: 0 10px 28px rgba(43,29,42,.28);
}
.fs-toast svg { color: #7fdcae; }
.fs-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
@media(min-width:768px) { .fs-toast { bottom: 24px; } }
`;
