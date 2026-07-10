'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft, Share2, ShoppingBag, Star, Clock, MapPin, ShieldCheck,
  Check, Calendar, Plus, Minus, BadgeCheck, ChevronRight, Camera,
  Truck, RotateCcw, X, Heart, Copy, ExternalLink, CheckCircle2, Shield, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { WhatsAppIcon } from "../../../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../../../components/WhatsAppDisclaimerModal";

// --- Types & Interfaces ---
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  description: string | null;
  image_urls: string[] | null;
  stock_status: string;
  views_count: number;
  is_digital?: boolean;
  digital_file_url?: string | null;
  digital_link?: string | null;
  category?: Category | null;
  type?: 'service' | 'product';
  duration_minutes?: number | null;
  service_facts?: string[] | null;
  mobile_fee?: number | string | null;
  mobile_fee_label?: string | null;
}

interface Store {
  id: string;
  username: string;
  store_name: string;
  store_bio?: string | null;
  logo_url?: string | null;
  currency_code: string;
  whatsapp_phone: string;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  business_persona?: string | null;
  store_template?: string | null;
  primary_color?: string | null;
  is_pro?: boolean | number;
  is_verified?: boolean | number;
  delivery_info?: string | null;
  return_policy?: string | null;
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

interface Review {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
  created_at?: string;
}

interface ProductVariant {
  label: string;
  price: string;
}

interface ProductDetailClientProps {
  initialProduct: Product & {
    variants?: ProductVariant[] | null;
    duration_minutes?: number | null;
    rating?: number | null;
    review_count?: number | null;
  };
  store: Store & {
    rating?: number | null;
    review_count?: number | null;
  };
  allProducts: Product[];
  reviews: Review[];
  systemDomain: string;
  storeDisclaimer: string;
}

// --- Helpers ---
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  USD: '$',
  GBP: '£',
  EUR: '€'
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

function discountPercent(price: string, compare: string): number {
  const p = parseFloat(price), c = parseFloat(compare);
  if (c <= p || isNaN(p) || isNaN(c)) return 0;
  return Math.round(((c - p) / c) * 100);
}

// Classifier helper to determine if a product is a service
function isProductService(product: Product, store: Store): boolean {
  if (product.type === 'service') return true;
  if (product.type === 'product') return false;

  // If product belongs to a service category
  const catName = (product.category?.name || '').toLowerCase();
  if (catName.includes('lashes') || catName.includes('brows') || catName.includes('treatment') || catName.includes('session') || catName.includes('booking') || catName.includes('nails') || catName.includes('makeup') || catName.includes('service') || catName.includes('hair') || catName.includes('facial') || catName.includes('massage') || catName.includes('spa')) {
    return true;
  }
  // Check product name keywords
  const name = (product.name || '').toLowerCase();
  if (name.includes('lashe') || name.includes('brow') || name.includes('lamination') || name.includes('tint') || name.includes('massage') || name.includes('treatment') || name.includes('facial') || name.includes('appointment') || name.includes('session') || name.includes('booking')) {
    return true;
  }
  // If store persona is beauty-service, default to service unless it matches product keywords
  if (store.business_persona === 'beauty-service') {
    if (name.includes('serum') || name.includes('cleanser') || name.includes('kit') || name.includes('oil') || name.includes('cream') || name.includes('shampoo') || name.includes('gel') || name.includes('brush') || name.includes('remover') || name.includes('foam')) {
      return false;
    }
    return true;
  }
  return false;
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

// Simple hash-based gradients for products without images
const GRADS = [
  ["#b14a6e", "#7c2f4d"], // Pinkish/Rose
  ["#9a6079", "#5e2a44"], // Plum/Purple
  ["#0a4b8f", "#03285c"], // Deep Blue
  ["#0f9d58", "#085732"], // Emerald Green
  ["#c79a4b", "#7e5a1b"], // Golden/Amber
  ["#4a0e4e", "#2a082c"], // Royal Violet
];

function getGradForProduct(id: string): string[] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADS.length;
  return GRADS[index];
}

export default function ProductDetailClient({
  initialProduct,
  store,
  allProducts,
  reviews,
  storeDisclaimer
}: ProductDetailClientProps) {
  // Navigation & Page State
  const [kind, setKind] = useState<'service' | 'product'>(() => 
    isProductService(initialProduct, store) ? 'service' : 'product'
  );
  
  const [slide, setSlide] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQty] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bDate, setBDate] = useState(0);
  const [bTime, setBTime] = useState<number | null>(null);
  
  // Checkout Dialog State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutWhatsapp, setCheckoutWhatsapp] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'digital'>(
    kind === 'service' ? 'pickup' : (initialProduct.is_digital ? 'digital' : 'delivery')
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Pending WhatsApp deep-link awaiting disclaimer confirmation
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);

  // Pre-populate client profile details
  useEffect(() => {
    try {
      const saved = localStorage.getItem('frontstore_customer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setCheckoutName(parsed.name);
        if (parsed.phone_number) setCheckoutPhone(parsed.phone_number);
        if (parsed.whatsapp_number) setCheckoutWhatsapp(parsed.whatsapp_number);
        if (parsed.email) setCheckoutEmail(parsed.email);
        if (parsed.preferred_delivery_address) setDeliveryAddress(parsed.preferred_delivery_address);
      }
    } catch { }
  }, []);

  // Sync state if product changes
  useEffect(() => {
    setSlide(0);
    setSize(0);
    setQty(1);
    setBTime(null);
    setBooking(false);
    setIsCheckoutOpen(false);
    setKind(isProductService(initialProduct, store) ? 'service' : 'product');
  }, [initialProduct, store]);

  // Derived Properties
  const currencySymbol = getCurrencySymbol(store.currency_code);
  const grad = getGradForProduct(initialProduct.id);
  const [a, b] = grad;

  const productVariants = useMemo(() => {
    if (initialProduct.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map(v => ({ l: v.label, price: parseFloat(v.price) }));
    }
    return null;
  }, [initialProduct.variants]);

  const unitPrice = productVariants ? productVariants[size].price : parseFloat(initialProduct.price);
  const mobileFeeAmount = kind === 'service' && deliveryMethod === 'delivery' && initialProduct.mobile_fee
    ? parseFloat(String(initialProduct.mobile_fee))
    : 0;
  const mobileFeeLabel = initialProduct.mobile_fee_label || 'Mobile Service Fee';
  const totalAmount = kind === 'product' ? unitPrice * qty : unitPrice + mobileFeeAmount;

  // Generate Booking Dates (Next 5 Days)
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

  // Filter other store products for Related Grid
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.id !== initialProduct.id)
      .slice(0, 4);
  }, [allProducts, initialProduct.id]);

  // Handle WhatsApp Question Link
  const handleAskQuestion = () => {
    const shareText = `Hi ${store.store_name}, I have a question about the ${kind === 'service' ? 'service' : 'product'} "${initialProduct.name}":`;
    const shareUrl = `${window.location.origin}/${store.username}/products/${initialProduct.slug}`;
    const fullMsg = `${shareText}\n${shareUrl}`;
    setPendingWaUrl(`https://wa.me/${store.whatsapp_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(fullMsg)}`);
  };

  // Copy product link to clipboard
  const handleShareProduct = async () => {
    const productUrl = `${window.location.origin}/${store.username}/products/${initialProduct.slug}`;
    const shareText = `${initialProduct.name} — ${fmt(initialProduct.price, currencySymbol)}`;
    if (navigator.share) {
      await navigator.share({ title: initialProduct.name, text: shareText, url: productUrl });
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success('Product link copied to clipboard!');
    }
  };

  // Submit checkout order to backend API
  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone) {
      setCheckoutError('Name and WhatsApp number are required.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
    
    // Address compilation
    let finalAddress = deliveryAddress;
    if (kind === 'service') {
      const selectedDay = days[bDate].formatted;
      const selectedTime = bTime !== null ? slots[bTime] : 'Unspecified';
      const sessionType = deliveryMethod === 'delivery' ? 'Mobile Session' : 'Studio Session';
      finalAddress = `${sessionType} on ${selectedDay} at ${selectedTime}` + (deliveryMethod === 'delivery' ? ` | Address: ${deliveryAddress}` : '');
    }

    try {
      const res = await fetch(`${API_URL}/v1/public/store/${store.username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: checkoutName,
          customer_phone: checkoutPhone,
          customer_email: checkoutEmail || undefined,
          customer_whatsapp: checkoutWhatsapp || checkoutPhone,
          delivery_method: kind === 'service' ? (deliveryMethod === 'delivery' ? 'delivery' : 'pickup') : deliveryMethod,
          delivery_address: finalAddress || 'None specified',
          items: [{
            product_id: initialProduct.id,
            quantity: qty
          }]
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to complete checkout.');
      }

      // Save customer profile details
      try {
        localStorage.setItem('frontstore_customer_profile', JSON.stringify({
          name: checkoutName,
          phone_number: checkoutPhone,
          whatsapp_number: checkoutWhatsapp || checkoutPhone,
          email: checkoutEmail || null,
          preferred_delivery_method: deliveryMethod,
          preferred_delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
        }));
      } catch { }

      setOrderReceipt(json.data);
      setIsCheckoutOpen(false);
      setBooking(false);
      toast.success('Order placed successfully!');
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please check your inputs and try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Paystack online payment initializer
  const handlePayOnline = async () => {
    if (!orderReceipt) return;
    setIsPaying(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
    try {
      const res = await fetch(`${API_URL}/v1/public/orders/${orderReceipt.order.id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Online payment initialization failed.');
      }
      if (json.data && json.data.authorization_url) {
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error('Could not retrieve secure payment link.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment.');
    } finally {
      setIsPaying(false);
    }
  };

  // Product Images Array
  const images = initialProduct.image_urls || [];
  const storeTheme = useMemo(() => resolveStoreTheme(store), [store]);

  return (
    <div className="fs-root" style={storeTheme}>
      <style suppressHydrationWarning>{CSS}</style>

      <WhatsAppDisclaimerModal
        open={!!pendingWaUrl}
        storeName={store.store_name}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)}
      />

      {/* Top Nav */}
      <header className="fs-nav">
        <div className="fs-nav-inner">
          <button className="fs-back" onClick={() => window.location.href = `/${store.username}`}>
            <ChevronLeft size={18} /> {store.store_name.split(' ')[0]}
          </button>
          <span className="fs-nav-store">{store.store_name}</span>
          <div className="fs-nav-right">
            <button className="fs-icn" onClick={handleShareProduct} aria-label="Share product page"><Share2 size={18} /></button>
            <button className="fs-icn" onClick={() => {
              if (kind === 'service') setBooking(true);
              else setIsCheckoutOpen(true);
            }} aria-label="Quick Checkout"><ShoppingBag size={19} /></button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="fs-main">

        {/* ---- LEFT COLUMN ---- */}
        <div className="fs-left">
          {/* Gallery Slider */}
          <div className="fs-gallery">
            {images.length > 0 ? (
              <div className="fs-hero" style={{ overflow: 'hidden', background: '#f5ebe7' }}>
                <img 
                  src={images[slide]} 
                  alt={`${initialProduct.name} - slide ${slide + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="fs-type-badge">{kind === "service" ? "Service" : "Product"}</span>
                {initialProduct.compare_at_price && (
                  <span className="fs-tag">
                    <Heart size={11} fill="#fff" color="#fff" /> 
                    {discountPercent(initialProduct.price, initialProduct.compare_at_price)}% Off
                  </span>
                )}
              </div>
            ) : (
              <div className="fs-hero" style={{ background: `linear-gradient(${140 + slide * 12}deg, ${a}, ${b})` }}>
                <div className="fs-grain" />
                <Camera size={60} strokeWidth={1.1} color="rgba(255,255,255,.9)" />
                <span className="fs-type-badge">{kind === "service" ? "Service" : "Product"}</span>
                {initialProduct.compare_at_price && (
                  <span className="fs-tag">
                    <Heart size={11} fill="#fff" color="#fff" /> Special Offer
                  </span>
                )}
              </div>
            )}
            
            {/* Thumbnail buttons */}
            <div className="fs-thumbs">
              {images.length > 0 ? (
                images.map((imgUrl, i) => (
                  <button 
                    key={i} 
                    className={`fs-thumb ${slide === i ? "on" : ""}`} 
                    onClick={() => setSlide(i)}
                    style={{ overflow: 'hidden' }}
                  >
                    <img src={imgUrl} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))
              ) : (
                [0, 1, 2, 3].map(i => (
                  <button 
                    key={i} 
                    className={`fs-thumb ${slide === i ? "on" : ""}`} 
                    onClick={() => setSlide(i)}
                    style={{ background: `linear-gradient(${140 + i * 12}deg, ${a}, ${b})` }} 
                  />
                ))
              )}
            </div>
          </div>

          {/* Left Column Details: About + Included/Delivery + Reviews */}
          <div className="fs-left-details">
            <section className="fs-sec">
              <h2>{kind === "service" ? "About this service" : "About this product"}</h2>
              <p className="fs-desc" style={{ whiteSpace: 'pre-line' }}>{initialProduct.description || "No description provided."}</p>
            </section>

            {kind === "service" ? (
              <section className="fs-sec">
                <h2>What is included</h2>
                <ul className="fs-incl">
                  {getIncludedList(initialProduct).map((x, i) => <li key={i}><Check size={15} /> {x}</li>)}
                </ul>
              </section>
            ) : (
              <section className="fs-sec">
                <h2>Delivery &amp; returns</h2>
                <div className="fs-deliv">
                  <div>
                    <Truck size={17} />
                    <div>
                      <b>Delivery</b>
                      <span>{store.delivery_info || "Delivery in 1–3 business days. Local rates apply, nationwide shipping available at checkout."}</span>
                    </div>
                  </div>
                  <div>
                    <RotateCcw size={17} />
                    <div>
                      <b>Returns</b>
                      <span>{store.return_policy || "Return unopened, unused items within 7 days. Secured by Frontstore."}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
            <section className="fs-sec">
              <h2>Client reviews</h2>
              <div className="fs-revgrid">
                {reviews.map((rv) => (
                  <div className="fs-rev" key={rv.id}>
                    <div className="fs-rev-top">
                      <span className="fs-rev-av">{rv.reviewer_name[0]}</span>
                      <div>
                        <b>{rv.reviewer_name}</b>
                        <span className="fs-stars">{"★".repeat(rv.rating)}</span>
                      </div>
                    </div>
                    <p>{rv.body}</p>
                  </div>
                ))}
              </div>
            </section>
            )}
          </div>
        </div>

        {/* ---- RIGHT COLUMN (sticky panel) ---- */}
        <div className="fs-right">
          <div className="fs-panel">
            {/* Header info */}
            <p className="fs-cat">{initialProduct.category?.name || "General"}</p>
            <h1 className="fs-name">{initialProduct.name}</h1>
            {(store.rating != null || reviews.length > 0) && (
            <div className="fs-rating">
              <Star size={13} fill="#c79a4b" color="#c79a4b" />
              {store.rating != null ? store.rating : (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
              <i>({reviews.length > 0 ? reviews.length : (store.review_count ?? 0)} reviews)</i>
            </div>
            )}
            
            <div className="fs-price-row">
              <span className="fs-price">{fmt(unitPrice, currencySymbol)}</span>
              {initialProduct.compare_at_price && (
                <span className="fs-compare" style={{ textDecoration: 'line-through', color: 'var(--muted)', marginLeft: 8, fontSize: 16 }}>
                  {fmt(initialProduct.compare_at_price, currencySymbol)}
                </span>
              )}
              {kind === "service" && <span className="fs-per" style={{ marginLeft: 6 }}>per session</span>}
            </div>

            {/* Facts Panel for Service — only shown when merchant has set real data */}
            {kind === "service" && (initialProduct.duration_minutes || (initialProduct.service_facts && initialProduct.service_facts.length > 0)) ? (
              <div className="fs-facts">
                {initialProduct.duration_minutes ? (
                  <div className="fs-fact"><Clock size={16} /><span>Duration: ~{Math.round(initialProduct.duration_minutes / 60 * 10) / 10} hours</span></div>
                ) : null}
                {(initialProduct.service_facts || []).map((fact, idx) => (
                  <div className="fs-fact" key={idx}><CheckCircle2 size={16} /><span>{fact}</span></div>
                ))}
              </div>
            ) : null}

            {/* Product Options */}
            {kind === "product" && (
              <div className="fs-options">
                {productVariants && (
                  <>
                    <p className="fs-opt-lbl">Option</p>
                    <div className="fs-sizes">
                      {productVariants.map((v, i) => (
                        <button key={i} className={`fs-size ${size === i ? "on" : ""}`} onClick={() => setSize(i)}>
                          <b>{v.l}</b>
                          <span>{fmt(v.price, currencySymbol)}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div className="fs-qty-row">
                  <p className="fs-opt-lbl">Quantity</p>
                  <div className="fs-step">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="fs-stock">
                  <Check size={13} /> 
                  {initialProduct.stock_status === 'out_of_stock' ? "Special order request" : "In stock, ready to ship"}
                </div>
              </div>
            )}

            {/* Main CTA — Buy/Book on top, Ask a question below (desktop panel only) */}
            <div className="fs-cta-row">
              {kind === "service" ? (
                <button className="fs-cta fs-panel-cta book" onClick={() => setBooking(true)}>
                  <Calendar size={18} /> Book Now <span className="fs-cta-price">{fmt(totalAmount, currencySymbol)}</span>
                </button>
              ) : (
                <button className="fs-cta fs-panel-cta buy" onClick={() => setIsCheckoutOpen(true)}>
                  <ShoppingBag size={18} /> Buy Now <span className="fs-cta-price">{fmt(totalAmount, currencySymbol)}</span>
                </button>
              )}
              <button className="fs-msg-btn" onClick={handleAskQuestion}>
                <WhatsAppIcon size={16} /> Ask a question
              </button>
            </div>

            {/* Trust badge */}
            <div className="fs-trust"><ShieldCheck size={14} /> Secured by Frontstore · Instant receipt</div>

            {/* Store Profile Card */}
            <div className="fs-store-card">
              {store.logo_url ? (
                <img src={store.logo_url} alt="Store logo" style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <span className="fs-store-av">{store.store_name[0].toUpperCase()}</span>
              )}
              <div className="fs-store-info">
                <b>{store.store_name} {store.is_verified ? <BadgeCheck size={13} className="fs-verif" /> : null}</b>
                <span>{store.rating != null ? <><Star size={11} fill="#c79a4b" color="#c79a4b" /> {store.rating} · </> : ''}{allProducts.length} items</span>
              </div>
              <button className="fs-store-go" onClick={() => window.location.href = `/${store.username}`}>
                Store <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* More items from same store */}
      {relatedProducts.length > 0 && (
        <section className="fs-more-section">
          <div className="fs-more-inner">
            <h2>More from {store.store_name}</h2>
            <div className="fs-more-grid">
              {relatedProducts.map((r, i) => {
                const rpGrad = getGradForProduct(r.id);
                return (
                  <button 
                    key={i} 
                    className="fs-more-card" 
                    onClick={() => {
                      window.location.href = `/${store.username}/products/${r.slug}`;
                    }}
                  >
                    <span className="fs-more-img" style={r.image_urls?.[0] ? { overflow: 'hidden' } : { background: `linear-gradient(150deg, ${rpGrad[0]}, ${rpGrad[1]})` }}>
                      {r.image_urls?.[0] ? (
                        <img src={r.image_urls[0]} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Camera size={22} color="rgba(255,255,255,.9)" />
                      )}
                    </span>
                    <div className="fs-more-body">
                      <b>{r.name}</b>
                      <span>{isProductService(r, store) ? "Service" : "Product"} · {fmt(r.price, currencySymbol)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="fs-footer">
        <ShieldCheck size={14} /> Payments are fully protected and receipts are instant, secured by Frontstore
      </footer>

      {/* Mobile Sticky CTA Bar */}
      <div className="fs-mobile-bar">
        <button className="fs-mob-msg" onClick={handleAskQuestion}>
          <WhatsAppIcon size={17} /> Ask a question
        </button>
        {kind === "service" ? (
          <button className="fs-mob-cta book" onClick={() => setBooking(true)}>
            <Calendar size={17} /> Book Now
          </button>
        ) : (
          <button className="fs-mob-cta buy" onClick={() => setIsCheckoutOpen(true)}>
            <ShoppingBag size={17} /> Buy Now
          </button>
        )}
      </div>

      {/* Mobile details inline for mobile viewports */}
      <div className="fs-mobile-sections storefront-shell" style={{ display: 'none', padding: '0 18px 100px' }}>
        <section className="fs-sec">
          <h2>{kind === "service" ? "About this service" : "About this product"}</h2>
          <p className="fs-desc">{initialProduct.description || "No description provided."}</p>
        </section>
        
        {kind === "service" ? (
          <section className="fs-sec">
            <h2>What is included</h2>
            <ul className="fs-incl">
              {getIncludedList(initialProduct).map((x, i) => <li key={i}><Check size={15} /> {x}</li>)}
            </ul>
          </section>
        ) : (
          <section className="fs-sec">
            <h2>Delivery &amp; returns</h2>
            <div className="fs-deliv">
              <div>
                <Truck size={17} />
                <div>
                  <b>Delivery</b>
                  <span>{store.delivery_info || "Delivery in 1–3 business days. Local rates apply, nationwide shipping available at checkout."}</span>
                </div>
              </div>
              <div>
                <RotateCcw size={17} />
                <div>
                  <b>Returns</b>
                  <span>{store.return_policy || "Return unopened, unused items within 7 days. Secured by Frontstore."}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {reviews.length > 0 && (
        <section className="fs-sec">
          <h2>Client reviews</h2>
          <div className="fs-revgrid">
            {reviews.map((rv) => (
              <div className="fs-rev" key={rv.id}>
                <div className="fs-rev-top">
                  <span className="fs-rev-av">{rv.reviewer_name[0]}</span>
                  <div>
                    <b>{rv.reviewer_name}</b>
                    <span className="fs-stars">{"★".repeat(rv.rating)}</span>
                  </div>
                </div>
                <p>{rv.body}</p>
              </div>
            ))}
          </div>
        </section>
        )}
      </div>

      {/* Service booking selection sheet */}
      <div className={`fs-scrim ${booking ? "show" : ""}`} onClick={() => setBooking(false)} />
      <div className={`fs-sheet ${booking ? "open" : ""}`}>
        <div className="fs-grab" />
        <div className="fs-sheet-head">
          <div>
            <h3>Book Slot: {initialProduct.name}</h3>
            <span><Clock size={13} /> {initialProduct.duration_minutes ? `~${Math.round(initialProduct.duration_minutes / 60 * 10) / 10} hours · ` : ''}{fmt(initialProduct.price, currencySymbol)}</span>
          </div>
          <button className="fs-icn" onClick={() => setBooking(false)} aria-label="Close sheet"><X size={20} /></button>
        </div>
        
        <p className="fs-sheet-lbl">Choose a day</p>
        <div className="fs-daterow">
          {days.map((d, i) => (
            <button key={i} className={`fs-date ${bDate === i ? "on" : ""}`} onClick={() => setBDate(i)}>
              <b>{d.label}</b>
              <span>{d.date}</span>
            </button>
          ))}
        </div>
        
        <p className="fs-sheet-lbl">Choose a time</p>
        <div className="fs-timerow">
          {slots.map((s, i) => (
            <button key={i} className={`fs-time ${bTime === i ? "on" : ""}`} onClick={() => setBTime(i)}>
              {s}
            </button>
          ))}
        </div>
        
        <button 
          className="fs-sheet-cta" 
          onClick={() => {
            if (bTime === null) {
              toast.error("Please pick a time slot first.");
              return;
            }
            setBooking(false);
            setIsCheckoutOpen(true);
          }}
        >
          Confirm Date &amp; Proceed · {fmt(initialProduct.price, currencySymbol)}
        </button>
        <span className="fs-sheet-note"><ShieldCheck size={12} /> Secure booking, payment on WhatsApp receipt</span>
      </div>

      {/* Checkout details sheet */}
      <div className={`fs-scrim ${isCheckoutOpen ? "show" : ""}`} onClick={() => setIsCheckoutOpen(false)} />
      <div className={`fs-sheet ${isCheckoutOpen ? "open" : ""}`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="fs-grab" />
        <div className="fs-sheet-head" style={{ marginBottom: 12 }}>
          <div>
            <h3>Enter Checkout Details</h3>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Complete order for {initialProduct.name}
            </span>
          </div>
          <button className="fs-icn" onClick={() => setIsCheckoutOpen(false)} aria-label="Close checkout"><X size={20} /></button>
        </div>

        {storeDisclaimer && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            color: '#d97706',
            borderRadius: 12,
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '10px 14px',
            fontSize: 12.5,
            fontWeight: 600,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginBottom: 12,
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>{storeDisclaimer}</div>
          </div>
        )}

        {checkoutError && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            {checkoutError}
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <label className="fs-opt-lbl">Your Name</label>
            <input 
              type="text" 
              className="fs-input-field" 
              required
              placeholder="e.g. Joy Okafor" 
              value={checkoutName}
              onChange={e => setCheckoutName(e.target.value)}
            />
          </div>

          <div>
            <label className="fs-opt-lbl">WhatsApp Number</label>
            <input 
              type="tel" 
              className="fs-input-field" 
              required
              placeholder="e.g. +234 803 123 4567" 
              value={checkoutPhone}
              onChange={e => setCheckoutPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="fs-opt-lbl">Email Address (Optional)</label>
            <input 
              type="email" 
              className="fs-input-field" 
              placeholder="e.g. joy@example.com" 
              value={checkoutEmail}
              onChange={e => setCheckoutEmail(e.target.value)}
            />
          </div>

          {kind === 'service' ? (
            <div>
              <label className="fs-opt-lbl">Session Type</label>
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
                  {mobileFeeAmount > 0 && (
                    <div style={{ background: 'var(--tint)', border: '1px solid var(--brand)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, color: 'var(--brand-deep)', fontWeight: 600 }}>+ {mobileFeeLabel}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-deep)' }}>{fmt(mobileFeeAmount, currencySymbol)}</span>
                    </div>
                  )}
                  <label className="fs-opt-lbl">Your Address</label>
                  <textarea
                    className="fs-input-field"
                    required
                    placeholder="Enter your street address for the mobile session"
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
                {!initialProduct.is_digital && (
                  <>
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
                  </>
                )}
                {initialProduct.is_digital && (
                  <button 
                    type="button" 
                    className="fs-size on" 
                    disabled
                  >
                    <b>Digital Delivery</b>
                    <span>Instant WhatsApp Download</span>
                  </button>
                )}
              </div>
              {deliveryMethod === 'delivery' && !initialProduct.is_digital && (
                <div>
                  <label className="fs-opt-lbl">Shipping Address</label>
                  <textarea 
                    className="fs-input-field" 
                    required
                    placeholder="Enter your full home or office shipping address"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    style={{ minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
              )}
            </div>
          )}

          {kind === 'service' && mobileFeeAmount > 0 && deliveryMethod === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px', background: 'var(--tint)', borderRadius: 10, fontSize: 12.5, color: 'var(--brand-deep)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Service</span>
                <span>{fmt(unitPrice, currencySymbol)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>{mobileFeeLabel}</span>
                <span>{fmt(mobileFeeAmount, currencySymbol)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--brand)', paddingTop: 4 }}>
                <span>Total</span>
                <span>{fmt(totalAmount, currencySymbol)}</span>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="fs-sheet-cta"
            disabled={checkoutLoading}
            style={{ marginTop: 8 }}
          >
            {checkoutLoading ? "Placing Order..." : `Place Order · ${fmt(totalAmount, currencySymbol)}`}
          </button>
        </form>
      </div>

      {/* Order receipt confirmation modal (from standard storefront style) */}
      {orderReceipt && (
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
                <strong style={{ color: 'var(--ink)', fontSize: 14 }}>#{orderReceipt.order.order_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Total Amount</span>
                <strong style={{ color: 'var(--brand)', fontSize: 15 }}>{fmt(orderReceipt.order.total_amount, currencySymbol)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Fulfillment</span>
                <strong style={{ color: 'var(--ink)', fontSize: 14, textTransform: 'capitalize' }}>{orderReceipt.order.delivery_method}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Status</span>
                <span className="badge" style={{ backgroundColor: 'var(--tint)', color: 'var(--brand-deep)', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {orderReceipt.order.order_status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.45 }}>
              <Shield size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
              <span>Your tracking page is ready. Save the link to check updates and confirm payment outside WhatsApp.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 10 }}>
              <a 
                href={`/track/${orderReceipt.order.id}`} 
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
                  await navigator.clipboard.writeText(`${window.location.origin}/track/${orderReceipt.order.id}`);
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

            {orderReceipt.order.payment_status === 'unpaid' && (
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
                {isPaying ? 'Initializing payment...' : `Pay Online Now (${fmt(orderReceipt.order.total_amount, currencySymbol)})`}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setPendingWaUrl(orderReceipt.whatsapp_url);
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
      )}
    </div>
  );
}

// Extract a clean list of inclusions from product description
function getIncludedList(product: Product): string[] {
  if (product.description) {
    const list = product.description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
      .map(line => line.replace(/^[\-\*•]\s*/, ''));
    if (list.length > 0) return list.slice(0, 4);
  }
  return [
    "Premium, lightweight components",
    "Tailored mapping matching shape preferences",
    "Professional sanitation and clean studio standards",
    "Complete aftercare guide and support"
  ];
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

.fs-root {
  /* --bg/--surface inherit from the shared :root / :root.dark theme so dark mode applies here too;
     --ink/--muted/--line alias the shared text/border tokens for the same reason */
  --ink: var(--text);
  --muted: var(--text-muted);
  --brand: #25D366;
  --brand-deep: #128c7e;
  --tint: #dcf8c6;
  --gold: #c79a4b;
  --line: var(--border);
  font-family: 'Hanken Grotesk', sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.fs-root button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

/* Developer preview bar */
.fs-preview-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 20px;
  background: #1e0f1a;
  font-size: 12px;
  color: #e7c9d5;
}

.fs-preview-bar span {
  opacity: .65;
}

.fs-preview-btns {
  display: flex;
  gap: 6px;
}

.fs-preview-btns button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #e7c9d5;
  border: 1px dashed rgba(231,201,213,.35);
}

.fs-preview-btns button.on {
  background: var(--brand);
  color: #fff;
  border-style: solid;
  border-color: var(--brand);
}

/* Nav */
.fs-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg) 90%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}

.fs-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
}

.fs-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  padding: 7px 10px;
  border-radius: 9px;
}

.fs-back:hover {
  background: var(--tint);
}

.fs-nav-store {
  font-size: 14px;
  font-weight: 700;
  opacity: .6;
  display: none;
}

@media(min-width:640px) {
  .fs-nav-store {
    display: block;
  }
}

.fs-nav-right {
  display: flex;
  gap: 4px;
}

.fs-icn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.fs-icn:hover {
  background: var(--tint);
}

/* Main content */
.fs-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 18px 100px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

@media(min-width:900px) {
  .fs-main {
    grid-template-columns: 1fr 380px;
    padding: 36px 32px 60px;
    align-items: start;
  }
}

/* LEFT */
.fs-left {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.fs-hero {
  position: relative;
  height: 320px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  overflow: hidden;
}

@media(min-width:900px) {
  .fs-hero {
    height: 420px;
  }
}

.fs-grain {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.15) 1px,transparent 1px);
  background-size: 14px 14px;
  opacity: .5;
}

.fs-type-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 8px;
  background: rgba(255,255,255,.92);
  color: var(--brand-deep);
}

.fs-tag {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: rgba(43,29,42,.38);
  backdrop-filter: blur(6px);
  padding: 5px 10px;
  border-radius: 8px;
}

.fs-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.fs-thumb {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  border: 2px solid transparent;
  opacity: .55;
  transition: .2s;
}

.fs-thumb.on {
  opacity: 1;
  border-color: var(--brand);
}

@media(min-width:900px) {
  .fs-thumb {
    width: 72px;
    height: 72px;
  }
}

/* Details columns */
.fs-left-details {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

@media(max-width:899px) {
  .fs-left-details {
    display: none;
  }
  .fs-mobile-sections {
    display: flex !important;
    flex-direction: column;
  }
}

/* Sections */
.fs-sec {
  padding: 24px 0 0;
}

.fs-sec h2 {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 19px;
  letter-spacing: -.01em;
  margin-bottom: 12px;
}

.fs-desc {
  font-size: 14px;
  line-height: 1.65;
  color: #5a4751;
}

.fs-incl {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fs-incl li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 13.5px;
  line-height: 1.45;
  color: #5a4751;
}

.fs-incl svg {
  color: var(--brand);
  flex: 0 0 auto;
  margin-top: 2px;
}

.fs-deliv {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fs-deliv > div {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.fs-deliv svg {
  color: var(--brand);
  flex: 0 0 auto;
  margin-top: 2px;
}

.fs-deliv b {
  font-size: 13.5px;
  display: block;
}

.fs-deliv span {
  font-size: 12.5px;
  color: var(--muted);
}

.fs-revgrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media(min-width:900px) {
  .fs-revgrid {
    grid-template-columns: 1fr 1fr;
  }
}

.fs-rev {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 15px;
  padding: 15px;
}

.fs-rev-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.fs-rev-av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--tint);
  color: var(--brand-deep);
  font-weight: 700;
  display: grid;
  place-items: center;
  font-size: 14px;
  flex: 0 0 auto;
}

.fs-rev-top b {
  font-size: 13.5px;
}

.fs-stars {
  display: block;
  color: var(--gold);
  font-size: 12px;
}

.fs-rev p {
  font-size: 13px;
  color: #5a4751;
  line-height: 1.5;
}

/* RIGHT PANEL */
.fs-right {
}

@media(min-width:900px) {
  .fs-right {
    position: sticky;
    top: 70px;
  }
}

.fs-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
}

@media(max-width:899px) {
  .fs-panel {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    border-top: 1px solid var(--line);
    padding-top: 20px;
  }
}

.fs-cat {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: .07em;
}

.fs-name {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: -.02em;
  line-height: 1.1;
  margin: 6px 0 9px;
}

@media(min-width:900px) {
  .fs-name {
    font-size: 28px;
  }
}

.fs-rating {
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.fs-rating i {
  color: var(--muted);
  font-style: normal;
  font-weight: 500;
}

.fs-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
}

.fs-price {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 30px;
  color: var(--brand-deep);
}

.fs-per {
  font-size: 13px;
  color: var(--muted);
}

/* Facts */
.fs-facts {
  margin-top: 16px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}

.fs-fact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid var(--line);
}

.fs-fact:last-child {
  border-bottom: none;
}

.fs-fact svg {
  color: var(--brand);
}

/* Options */
.fs-options {
  margin-top: 16px;
}

.fs-opt-lbl {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
  margin-bottom: 8px;
  display: block;
}

.fs-sizes {
  display: flex;
  gap: 9px;
}

.fs-size {
  flex: 1;
  padding: 12px;
  border-radius: 13px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  text-align: left;
  display: flex;
  flex-direction: column;
}

.fs-size b {
  display: block;
  font-size: 13.5px;
}

.fs-size span {
  font-size: 12px;
  color: var(--muted);
}

.fs-size.on {
  border-color: var(--brand);
  background: var(--tint);
}

.fs-size.on span {
  color: var(--brand-deep);
  font-weight: 600;
}

.fs-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.fs-qty-row .fs-opt-lbl {
  margin-bottom: 0;
}

.fs-step {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 11px;
  padding: 7px 12px;
}

.fs-step button {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  color: var(--brand-deep);
}

.fs-step span {
  font-weight: 700;
  font-size: 14px;
  min-width: 16px;
  text-align: center;
}

.fs-stock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--brand-deep);
}

/* CTA */
.fs-cta-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.fs-cta {
  flex: 1;
  width: 100%;
  padding: 15px;
  border-radius: 14px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  transition: filter var(--t-fast);
}

.fs-cta.book {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 211, 102, .18);
}

.fs-cta.buy {
  background: var(--brand-deep);
  color: #fff;
  box-shadow: 0 4px 12px rgba(18, 140, 126, .18);
}

.fs-cta:hover {
  filter: brightness(1.06);
}

.fs-cta:active {
  filter: brightness(.95);
}

.fs-cta-price {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  padding-left: 8px;
  margin-left: 6px;
  border-left: 1px solid rgba(255, 255, 255, .35);
}

@media(max-width:899px) {
  .fs-panel-cta {
    display: none;
  }
  .fs-cta-row {
    display: none;
  }
}

.fs-msg-btn {
  flex: 1;
  width: 100%;
  padding: 13px;
  border-radius: 13px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brand-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  white-space: nowrap;
}

.fs-root .fs-msg-btn {
  color: var(--brand);
}

.fs-msg-btn:hover {
  background: var(--tint);
}

.fs-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
}

/* Store card */
.fs-store-card {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 16px;
  padding: 13px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 15px;
}

.fs-store-av {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  flex: 0 0 auto;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  color: #fff;
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 20px;
  display: grid;
  place-items: center;
}

.fs-store-info {
  flex: 1;
  min-width: 0;
}

.fs-store-info b {
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fs-verif {
  color: var(--brand);
}

.fs-store-info span {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}

.fs-store-go {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-deep);
  background: var(--tint);
  padding: 8px 11px;
  border-radius: 9px;
}

.fs-store-go:hover {
  background: #f0d0d9;
}

/* More from store */
.fs-more-section {
  background: var(--surface);
  border-top: 1px solid var(--line);
  margin-top: 24px;
}

.fs-more-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 36px;
}

.fs-more-inner h2 {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 20px;
  letter-spacing: -.01em;
  margin-bottom: 18px;
}

.fs-more-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media(min-width:640px) {
  .fs-more-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.fs-more-card {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  text-align: left;
}

.fs-more-card:hover {
  border-color: var(--brand);
}

.fs-more-img {
  display: grid;
  place-items: center;
  height: 96px;
  width: 100%;
}

.fs-more-body {
  padding: 11px 12px 13px;
}

.fs-more-body b {
  font-size: 13px;
  display: block;
  line-height: 1.25;
}

.fs-more-body span {
  font-size: 12px;
  color: var(--muted);
  display: block;
  margin-top: 4px;
}

/* Footer */
.fs-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  border-top: 1px solid var(--line);
}

/* Mobile sticky CTA bar */
.fs-mobile-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 18px;
  background: var(--surface);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
}

@media(min-width:900px) {
  .fs-mobile-bar {
    display: none;
  }
}

.fs-mob-msg {
  flex: 1;
  height: 50px;
  border-radius: 13px;
  border: 1.5px solid var(--line);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--brand-deep);
  white-space: nowrap;
}

.fs-root .fs-mob-msg {
  color: var(--brand);
}

.fs-mob-cta {
  flex: 1;
  height: 50px;
  border-radius: 14px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.fs-mob-cta.book {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 3px 10px rgba(37, 211, 102, .18);
}

.fs-mob-cta.buy {
  background: var(--brand-deep);
  color: #fff;
  box-shadow: 0 3px 10px rgba(18, 140, 126, .18);
}

.fs-mob-cta span {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  padding-left: 7px;
  margin-left: 5px;
  border-left: 1px solid rgba(255, 255, 255, .35);
}

/* Booking/Checkout Sheets */
.fs-scrim {
  position: fixed;
  inset: 0;
  background: rgba(43, 29, 42, .5);
  opacity: 0;
  pointer-events: none;
  transition: .25s;
  z-index: 80;
}

.fs-scrim.show {
  opacity: 1;
  pointer-events: auto;
}

.fs-sheet {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 103%);
  width: 100%;
  max-width: 520px;
  z-index: 90;
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  padding: 8px 22px 28px;
  transition: transform .3s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 0 -12px 44px rgba(43, 29, 42, .18);
}

.fs-sheet.open {
  transform: translate(-50%, 0);
}

.fs-grab {
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: var(--line);
  margin: 6px auto 16px;
}

.fs-sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.fs-sheet-head h3 {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 18px;
}

.fs-sheet-head span {
  font-size: 12.5px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
}

.fs-sheet-lbl {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
  margin: 4px 0 9px;
  display: block;
}

.fs-daterow {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  margin-bottom: 16px;
  padding-bottom: 2px;
}

.fs-daterow::-webkit-scrollbar {
  display: none;
}

.fs-date {
  flex: 0 0 auto;
  min-width: 66px;
  padding: 11px 10px;
  border-radius: 13px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  text-align: center;
  display: flex;
  flex-direction: column;
}

.fs-date b {
  display: block;
  font-size: 13px;
}

.fs-date span {
  font-size: 11px;
  color: var(--muted);
}

.fs-date.on {
  border-color: var(--brand);
  background: var(--tint);
}

.fs-date.on b {
  color: var(--brand-deep);
}

.fs-timerow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.fs-time {
  padding: 12px 0;
  border-radius: 11px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.fs-time.on {
  border-color: var(--brand);
  background: var(--tint);
  color: var(--brand-deep);
}

.fs-sheet-cta {
  width: 100%;
  padding: 15px;
  border-radius: 14px;
  background: var(--brand);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, .18);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fs-sheet-cta:hover {
  filter: brightness(1.05);
}

.fs-sheet-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 12px;
}

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
`;
