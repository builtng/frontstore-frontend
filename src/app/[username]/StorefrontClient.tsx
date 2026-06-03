'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
// useParams imported removed for prop transition
import { toast } from 'sonner';
import {
  Search, X, ChevronLeft, ChevronRight, Share2, ShoppingCart,
  Instagram, Music2, CheckCircle2, Star,
  Minus, Plus, Trash2, Package, AlertCircle, ArrowRight,
  Copy, Heart, Tag, Truck, MapPin, Eye, Zap, Loader2,
  Download, ExternalLink, Shield, FileText, Globe, Facebook,
  Twitter
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';

// ─── Types ───────────────────────────────────────────────────────────────────

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
  is_verified?: boolean;
  custom_links?: StoreLink[] | null;
  primary_color?: string | null;
  store_template?: StoreTemplateId | null;
  is_pro?: boolean;
  catalog_label?: string | null;
  category_label?: string | null;
  template_highlight_label?: string | null;
  product_section_eyebrow?: string | null;
  product_section_title?: string | null;
  featured_carousel_enabled?: boolean;
  featured_carousel_eyebrow?: string | null;
  featured_carousel_title?: string | null;
  featured_product_ids?: string[] | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
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
  digital_file_url?: string | null;
  digital_link?: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CreatedOrder {
  id: string;
  order_number: string;
  customer_name: string;
  delivery_method: string;
  total_amount: string;
  payment_status: string;
  order_status: string;
}

interface CreatedOrderReceipt {
  order: CreatedOrder;
  whatsapp_url: string;
}

interface CustomerProfileLookup {
  name?: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  preferred_delivery_method?: 'delivery' | 'pickup' | 'digital' | null;
  preferred_delivery_address?: string | null;
  purchase_count?: number;
}

// ─── Currency ─────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', UGX: 'USh',
  TZS: 'TSh', XOF: 'CFA', EGP: 'E£', MAD: 'د.م.', ETB: 'Br',
  USD: '$', GBP: '£', EUR: '€',
};

function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? `${code} `;
}

function fmt(amount: string | number, symbol: string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${symbol}${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function discountPercent(price: string, compare: string): number {
  const p = parseFloat(price), c = parseFloat(compare);
  if (c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}

type StoreTemplateId = 'luxe-market' | 'editorial' | 'flash-sale' | 'atelier' | 'digital-studio' | 'whatsapp-native';

const STORE_TEMPLATES: Record<StoreTemplateId, { name: string; tagline: string }> = {
  'luxe-market': { name: 'Luxe Market', tagline: 'Premium boutique storefront' },
  editorial: { name: 'Editorial', tagline: 'Magazine-style product storytelling' },
  'flash-sale': { name: 'Flash Sale', tagline: 'High-conversion drops and promos' },
  atelier: { name: 'Atelier', tagline: 'Minimal studio for crafted goods' },
  'digital-studio': { name: 'Digital Studio', tagline: 'Software, files, services, and courses' },
  'whatsapp-native': { name: 'WhatsApp Native', tagline: 'Chat-first commerce experience' },
};

function getTemplateId(store?: Store | null): StoreTemplateId {
  const template = store?.store_template;
  return template && template in STORE_TEMPLATES ? template as StoreTemplateId : 'luxe-market';
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function isAiGeneratedImage(url?: string | null): boolean {
  if (!url) return false;
  return url.includes('/products/ai_') || url.includes('/ai_') || url.includes('products/ai_');
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmationModal({
  isOpen, title, message, confirmText, cancelText, onConfirm, onCancel
}: {
  isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <>
      <div className="drawer-backdrop animate-backdrop" style={{ zIndex: 200 }} onClick={onCancel} />
      <div className="card glass confirmation-modal" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 210, width: 'calc(100% - 32px)', maxWidth: 400, padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onCancel} className="btn btn-outline clickable" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 'var(--r-md)' }}>
            {cancelText ?? 'Cancel'}
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary clickable" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 'var(--r-md)', background: 'var(--danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', color: '#fff' }}>
            {confirmText ?? 'Confirm'}
          </button>
        </div>
      </div>
    </>
  );
}

function OrderReceiptModal({
  receipt, store, currencySymbol, onContinue, onClose
}: {
  receipt: CreatedOrderReceipt; store: Store; currencySymbol: string;
  onContinue: () => void; onClose: () => void;
}) {
  const trackUrl = `/track/${receipt.order.id}`;
  const [isPaying, setIsPaying] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  const copyTrackingLink = async () => {
    const absoluteUrl = `${window.location.origin}${trackUrl}`;
    await navigator.clipboard.writeText(absoluteUrl);
    toast.success('Tracking link copied');
  };

  const handlePayNow = async () => {
    try {
      setIsPaying(true);
      const res = await fetch(`${API_URL}/v1/public/orders/${receipt.order.id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to initialize payment.');
      }
      if (json.data && json.data.authorization_url) {
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error('Invalid payment response.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment initialization failed.');
    } finally {
      setIsPaying(false);
    }
  };

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
          inset: 'auto 16px 16px',
          zIndex: 230,
          maxWidth: 440,
          margin: '0 auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                Order created
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                Receipt from {store.store_name}
              </p>
            </div>
          </div>
          <button className="drawer__close clickable" onClick={onClose} aria-label="Close receipt">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 14, background: 'var(--surface-2)', display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Order ID</span>
            <strong style={{ color: 'var(--text)', fontSize: 14 }}>#{receipt.order.order_number}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total</span>
            <strong style={{ color: 'var(--primary)', fontSize: 15 }}>{fmt(receipt.order.total_amount, currencySymbol)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Delivery</span>
            <strong style={{ color: 'var(--text)', fontSize: 14, textTransform: 'capitalize' }}>{receipt.order.delivery_method}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Status</span>
            <span className="badge badge-accent">{receipt.order.order_status}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--text-muted)', fontSize: 12.5, lineHeight: 1.45 }}>
          <Shield size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
          <span>Your tracking page is ready. Keep the link so you can confirm payment and order updates outside the WhatsApp chat.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 10 }}>
          <a href={trackUrl} className="btn btn-outline clickable" style={{ textDecoration: 'none', minWidth: 0 }}>
            <ExternalLink size={16} /> View tracking page
          </a>
          <button type="button" onClick={copyTrackingLink} className="btn btn-outline clickable" aria-label="Copy tracking link" title="Copy tracking link" style={{ padding: 0 }}>
            <Copy size={16} />
          </button>
        </div>

        {receipt.order.payment_status === 'unpaid' && (
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isPaying}
            className="btn btn-primary clickable"
            style={{
              width: '100%',
              padding: '14px 18px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-lg)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            {isPaying ? 'Initializing payment...' : `Pay Online Now (${fmt(receipt.order.total_amount, currencySymbol)})`}
          </button>
        )}

        <button type="button" onClick={onContinue} className="btn btn-whatsapp clickable" style={{ width: '100%', padding: '15px 18px', fontWeight: 800 }}>
          <WhatsAppIcon size={20} />
          Continue on WhatsApp
        </button>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StoreSkeleton() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 0 }} />
      <div style={{ padding: '0 20px 20px', position: 'relative' }}>
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 16, marginTop: -40, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 22, width: '55%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
      </div>
      <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ height: 40, borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, padding: 16, overflow: 'hidden' }}>
        {[80, 96, 72, 100].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 34, width: w, borderRadius: 999, flexShrink: 0 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '0 16px 32px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ width: '100%', paddingTop: '100%', borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
            <div className="skeleton" style={{ height: 12, width: '45%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product, currencySymbol, onView, onShare,
}: {
  product: Product; currencySymbol: string;
  onView: () => void; onShare: () => void;
}) {
  const hasImage = product.image_urls && product.image_urls.length > 0;
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const hasDiscount = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
  const pct = hasDiscount ? discountPercent(product.price, product.compare_at_price!) : 0;

  return (
    <div className="product-card animate-fade-in" onClick={onView} role="button" tabIndex={0} aria-label={`View ${product.name}`}>

      {/* Image */}
      <div className="product-card__image-wrap">
        {hasImage ? (
          <img src={product.image_urls![0]} alt={product.name} loading="lazy" decoding="async" />
        ) : (
          <div className="product-card__placeholder">
            <Package size={36} strokeWidth={1.2} />
          </div>
        )}

        {/* Discount ribbon */}
        {!isOutOfStock && pct >= 5 && (
          <div className="sale-ribbon" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Tag size={9} />
            {pct}% OFF
          </div>
        )}

        {/* Sold out overlay badge */}
        {isOutOfStock && (
          <div className="product-card__badge">
            <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={9} /> Sold Out
            </span>
          </div>
        )}

        {/* Digital badge */}
        {product.is_digital && (
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            zIndex: 3,
            background: 'var(--primary)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 'var(--r-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
          }}>
            <Download size={9} strokeWidth={2.5} />
            Digital
          </div>
        )}

        {/* AI Generated badge */}
        {hasImage && isAiGeneratedImage(product.image_urls![0]) && (
          <div style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            zIndex: 3,
            background: 'rgba(15, 23, 42, 0.65)',
            color: '#fff',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            fontSize: 9,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 'var(--r-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            <span>✨ AI Generated</span>
          </div>
        )}

        {/* Share button */}
        <button
          className="product-card__share"
          onClick={e => { e.stopPropagation(); onShare(); }}
          aria-label="Share product"
          title="Share"
        >
          <Share2 size={13} strokeWidth={2} />
        </button>

        {/* Sold out dim */}
        {isOutOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(1px)' }} />
        )}
      </div>

      {/* Body */}
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__price-row">
          <span className="product-card__price">{fmt(product.price, currencySymbol)}</span>
          {hasDiscount && (
            <span className="product-card__compare">{fmt(product.compare_at_price!, currencySymbol)}</span>
          )}
        </div>

        {!isOutOfStock ? (
          <button
            className="product-card__buy"
            onClick={e => { e.stopPropagation(); onView(); }}
            id={`wa-buy-${product.id}`}
            aria-label={`View ${product.name} details`}
          >
            <WhatsAppIcon size={12} />
            Order on WhatsApp
          </button>
        ) : (
          <div style={{
            marginTop: 10, padding: '8px 10px', borderRadius: 'var(--r-md)',
            background: 'var(--danger-light)', color: 'var(--danger)',
            fontSize: 11, fontWeight: 700, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <AlertCircle size={11} /> Out of Stock
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Detail Drawer ────────────────────────────────────────────────────

function ProductDetailDrawer({
  product, store, currencySymbol, onClose, onAddToCart, onOrderNow,
}: {
  product: Product; store: Store; currencySymbol: string;
  onClose: () => void; onAddToCart: (p: Product, q: number) => void;
  onOrderNow: (p: Product, q: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const images = product.image_urls ?? [];
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const isLowStock = product.stock_status === 'low_stock' || (product.stock_quantity != null && product.stock_quantity <= 5 && product.stock_quantity > 0);
  const hasDiscount = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
  const pct = hasDiscount ? discountPercent(product.price, product.compare_at_price!) : 0;
  const total = parseFloat(product.price) * qty;

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && images.length > 1) {
      if (diff > 0) setImgIdx(i => Math.min(i + 1, images.length - 1));
      else setImgIdx(i => Math.max(i - 1, 0));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: product.name, text: `${product.name} — ${fmt(product.price, currencySymbol)}`, url });
    else { navigator.clipboard.writeText(url); }
  };

  return (
    <>
      <div className="drawer-backdrop animate-backdrop" onClick={onClose} />
      <div className="drawer drawer--product-detail animate-drawer" role="dialog" aria-modal="true" aria-label={product.name}>
        <div className="drawer__handle" />

        {/* Carousel */}
        {images.length > 0 ? (
          <div className="product-detail__carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <img src={images[imgIdx]} alt={`${product.name} - image ${imgIdx + 1}`} />
            {/* <button
              type="button"
              className="product-detail__image-view clickable"
              onClick={() => setImageViewerOpen(true)}
              aria-label="View product image"
            >
              <Eye size={17} strokeWidth={2.4} />
            </button> */}
            {isAiGeneratedImage(images[imgIdx]) && (
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#fff',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                fontSize: 9,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--r-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}>
                <span>✨ AI Generated Image</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <div className="carousel-dots">
                  {images.map((_, i) => (
                    <button key={i} className={`carousel-dot${i === imgIdx ? ' active' : ''}`} onClick={() => setImgIdx(i)} aria-label={`Image ${i + 1}`} />
                  ))}
                </div>
                {imgIdx > 0 && (
                  <button onClick={() => setImgIdx(i => i - 1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }} aria-label="Previous">
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>
                )}
                {imgIdx < images.length - 1 && (
                  <button onClick={() => setImgIdx(i => i + 1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }} aria-label="Next">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{ height: 200, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={56} strokeWidth={1} color="var(--text-faint)" />
          </div>
        )}

        {imageViewerOpen && images.length > 0 && (
          <div className="product-image-viewer animate-backdrop" role="dialog" aria-modal="true" aria-label={`${product.name} image viewer`} onClick={() => setImageViewerOpen(false)}>
            <button
              type="button"
              className="product-image-viewer__close clickable"
              onClick={() => setImageViewerOpen(false)}
              aria-label="Close image viewer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {images.length > 1 && imgIdx > 0 && (
              <button
                type="button"
                className="product-image-viewer__nav product-image-viewer__nav--prev clickable"
                onClick={(event) => {
                  event.stopPropagation();
                  setImgIdx(i => Math.max(i - 1, 0));
                }}
                aria-label="Previous product image"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
            )}

            <div className="product-image-viewer__stage" onClick={(event) => event.stopPropagation()}>
              <img src={images[imgIdx]} alt={`${product.name} - image ${imgIdx + 1}`} />
              {images.length > 1 && (
                <div className="product-image-viewer__count">{imgIdx + 1} / {images.length}</div>
              )}
            </div>

            {images.length > 1 && imgIdx < images.length - 1 && (
              <button
                type="button"
                className="product-image-viewer__nav product-image-viewer__nav--next clickable"
                onClick={(event) => {
                  event.stopPropagation();
                  setImgIdx(i => Math.min(i + 1, images.length - 1));
                }}
                aria-label="Next product image"
              >
                <ChevronRight size={24} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="product-detail__body">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
            <h2 className="product-detail__title" style={{ flex: 1, marginBottom: 0 }}>{product.name}</h2>
            <button className="drawer__close clickable" onClick={onClose} aria-label="Close">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Price */}
          <div className="product-detail__price-row">
            <span className="product-detail__price">{fmt(product.price, currencySymbol)}</span>
            {hasDiscount && (
              <>
                <span className="product-detail__compare">{fmt(product.compare_at_price!, currencySymbol)}</span>
                <span className="product-detail__discount-tag" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Tag size={9} />{pct}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`product-detail__stock ${product.is_digital ? 'in-stock' : (isOutOfStock ? 'out-of-stock' : (isLowStock ? 'low-stock' : 'in-stock'))}`} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div className="product-detail__stock-dot" />
            {product.is_digital
              ? 'Instant Digital Download · Available Immediately'
              : (isOutOfStock ? 'Out of Stock' : (isLowStock ? `Low Stock — Only ${product.stock_quantity ?? 'a few'} left` : 'In Stock · Ready to ship'))
            }
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginBottom: 18 }}>
              <p className="product-detail__desc-label">About this product</p>
              <p className="product-detail__desc">{product.description}</p>
            </div>
          )}

          {/* AI generated image disclaimer */}
          {images.some(url => isAiGeneratedImage(url)) && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 12px',
              background: 'var(--surface-2)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 'var(--r-md)',
              marginBottom: 18,
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.4
            }}>
              <AlertCircle size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
              <span>Note: One or more product images are AI-generated to showcase the item contextually.</span>
            </div>
          )}

          {/* Share */}
          <div style={{ marginBottom: 20 }}>
            <button className="social-btn clickable" onClick={handleShare} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Share2 size={13} /> Share Product
            </button>
          </div>

          {/* CTA section */}
          {!isOutOfStock ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Qty + subtotal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div className="qty-selector">
                  <button className="qty-btn clickable" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="qty-display">{qty}</span>
                  <button className="qty-btn clickable" onClick={() => setQty(q => q + 1)} aria-label="Increase">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Subtotal</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{fmt(total, currencySymbol)}</div>
                </div>
              </div>

              {/* WhatsApp primary CTA */}
              <button
                className="btn btn-whatsapp clickable"
                style={{ width: '100%', padding: '15px 20px', fontSize: 15, borderRadius: 'var(--r-lg)', fontFamily: 'var(--font-heading)', fontWeight: 800, gap: 10 }}
                onClick={() => onOrderNow(product, qty)}
                id={`whatsapp-order-${product.id}`}
              >
                <WhatsAppIcon size={20} />
                Buy Now — {fmt(total, currencySymbol)}
              </button>

              {/* Add to cart secondary */}
              <button
                className="btn btn-outline clickable"
                style={{ width: '100%', padding: '13px', gap: 8 }}
                onClick={() => { onAddToCart(product, qty); onClose(); }}
                id={`add-cart-${product.id}`}
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, borderRadius: 'var(--r-lg)', background: 'var(--danger-light)', color: 'var(--danger)', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <AlertCircle size={16} /> This item is currently unavailable
            </div>
          )}
          <div style={{ height: 'max(16px, env(safe-area-inset-bottom))' }} />
        </div>
      </div>
    </>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({
  cart, store, currencySymbol, cartTotal, onClose, onUpdateQty, onWhatsAppCheckout, onRemoveItem, onClearCart
}: {
  cart: CartItem[]; store: Store; currencySymbol: string; cartTotal: number;
  onClose: () => void; onUpdateQty: (id: string, delta: number) => void; onWhatsAppCheckout: () => void;
  onRemoveItem: (id: string) => void; onClearCart: () => void;
}) {
  return (
    <>
      <div className="drawer-backdrop animate-backdrop" onClick={onClose} />
      <div className="drawer animate-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawer__handle" />
        <div className="drawer__header">
          <span className="drawer__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} /> Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </span>
          {cart.length > 0 && (
            <button onClick={onClearCart} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginRight: 'auto', marginLeft: 16 }} className="clickable">
              <Trash2 size={12} /> Clear
            </button>
          )}
          <button className="drawer__close clickable" onClick={onClose} aria-label="Close cart">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ padding: '12px 20px 0', flex: 1 }}>
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><ShoppingCart size={44} strokeWidth={1} /></div>
              <p className="empty-state__title">Your cart is empty</p>
              <p className="empty-state__body">Browse the products and tap to add items to your cart.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cart.map(item => {
                  const subtotal = parseFloat(item.product.price) * item.quantity;
                  return (
                    <div key={item.product.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                        {item.product.image_urls?.[0]
                          ? <img src={item.product.image_urls[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={22} strokeWidth={1.2} color="var(--text-faint)" /></div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                        <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(subtotal, currencySymbol)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                        <button onClick={() => item.quantity === 1 ? onRemoveItem(item.product.id) : onUpdateQty(item.product.id, -1)} style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.quantity === 1 ? 'var(--danger)' : 'var(--text)' }} className="clickable" aria-label="Remove one">
                          {item.quantity === 1 ? <Trash2 size={13} strokeWidth={2} /> : <Minus size={14} strokeWidth={2.5} />}
                        </button>
                        <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.product.id, 1)} style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="clickable" aria-label="Add one">
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--text-muted)' }}>
                  <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>{fmt(cartTotal, currencySymbol)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>{fmt(cartTotal, currencySymbol)}</span>
                </div>
              </div>

              <button
                className="btn btn-whatsapp clickable"
                style={{ width: '100%', padding: '15px 20px', fontSize: 15, borderRadius: 'var(--r-lg)', marginBottom: 10, fontFamily: 'var(--font-heading)', fontWeight: 800, gap: 10 }}
                onClick={onWhatsAppCheckout}
                id="whatsapp-checkout-btn"
              >
                <WhatsAppIcon size={20} />
                Complete Order on WhatsApp
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>
                You'll be redirected to WhatsApp with your order pre-filled.
              </p>
            </>
          )}
        </div>
        <div style={{ height: 'max(24px, env(safe-area-inset-bottom))' }} />
      </div>
    </>
  );
}

// ─── Checkout Drawer ──────────────────────────────────────────────────────────

function CheckoutDrawer({
  cart, store, currencySymbol, cartTotal, onClose, onBack, onOrderCreated, API_URL, uname, storeDisclaimer
}: {
  cart: CartItem[]; store: Store; currencySymbol: string; cartTotal: number;
  onClose: () => void; onBack: () => void; onOrderCreated: (receipt: CreatedOrderReceipt) => void;
  API_URL: string; uname: string; storeDisclaimer: string;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'digital'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isAllDigital = cart.every(item => item.product.is_digital);

  useEffect(() => {
    if (isAllDigital) {
      setDeliveryMethod('digital');
    } else if (deliveryMethod === 'digital') {
      setDeliveryMethod('delivery');
    }
  }, [isAllDigital, deliveryMethod]);

  const applyCustomerProfile = useCallback((profile: CustomerProfileLookup, source: 'local' | 'network') => {
    if (!profile) return;

    if (profile.name && !customerName) setCustomerName(profile.name);
    if (profile.email && !customerEmail) setCustomerEmail(profile.email);
    if (profile.whatsapp_number && !customerWhatsapp) setCustomerWhatsapp(profile.whatsapp_number);
    if (profile.preferred_delivery_address && !deliveryAddress) setDeliveryAddress(profile.preferred_delivery_address);
    if (!isAllDigital && profile.preferred_delivery_method && profile.preferred_delivery_method !== 'digital') {
      setDeliveryMethod(profile.preferred_delivery_method);
    }

    setProfileMessage(source === 'network'
      ? 'Saved checkout details found. Review them before placing your order.'
      : 'Using your saved checkout details from this device.');
  }, [customerName, customerEmail, customerWhatsapp, deliveryAddress, isAllDigital]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('frontstore_customer_profile');
      if (saved) applyCustomerProfile(JSON.parse(saved), 'local');
    } catch { }
  }, [applyCustomerProfile]);

  useEffect(() => {
    const phone = customerPhone.trim();
    if (phone.replace(/\D/g, '').length < 8) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setProfileLoading(true);
        const res = await fetch(`${API_URL}/v1/public/customers/profile?phone=${encodeURIComponent(phone)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.data) applyCustomerProfile(json.data, 'network');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setProfileMessage('');
        }
      } finally {
        setProfileLoading(false);
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [API_URL, customerPhone, applyCustomerProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || (deliveryMethod === 'delivery' && !isAllDigital && !deliveryAddress)) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const res = await fetch(`${API_URL}/v1/public/store/${uname}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          customer_whatsapp: customerWhatsapp || customerPhone,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
          items
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to place order.');
      }

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

      onOrderCreated(json.data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="drawer-backdrop animate-backdrop" onClick={onClose} />
      <div className="drawer animate-drawer" role="dialog" aria-modal="true" aria-label="Checkout details">
        <div className="drawer__handle" />
        <div className="drawer__header">
          <button className="clickable" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13.5 }}>
            <ChevronLeft size={16} /> Back to Cart
          </button>
          <span className="drawer__title">Checkout</span>
          <button className="drawer__close clickable" onClick={onClose} aria-label="Close checkout">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '12px 20px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }} className="no-scrollbar">
          {error && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--r-md)', padding: 12, fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {storeDisclaimer && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              color: '#d97706',
              borderRadius: 'var(--r-md)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              lineHeight: '1.4'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{storeDisclaimer}</div>
            </div>
          )}

          {(profileMessage || profileLoading) && (
            <div style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--r-md)',
              padding: '10px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>{profileLoading ? 'Checking for saved checkout details...' : profileMessage}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Full Name *</label>
            <input type="text" required placeholder="e.g. Amina Bello" value={customerName} onChange={e => setCustomerName(e.target.value)} className="input-field" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Phone Number *</label>
              <input type="tel" required placeholder="e.g. +234..." value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>WhatsApp Number</label>
              <input type="tel" placeholder="Defaults to phone" value={customerWhatsapp} onChange={e => setCustomerWhatsapp(e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Email Address (Optional)</label>
            <input type="email" placeholder="For order updates & tracking" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="input-field" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Delivery Method *</label>
            {!isAllDigital ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button type="button" onClick={() => setDeliveryMethod('delivery')} style={{ padding: 12, borderRadius: 'var(--r-md)', border: deliveryMethod === 'delivery' ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: deliveryMethod === 'delivery' ? 'var(--primary-light)' : 'transparent', color: deliveryMethod === 'delivery' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>
                  Delivery
                </button>
                <button type="button" onClick={() => setDeliveryMethod('pickup')} style={{ padding: 12, borderRadius: 'var(--r-md)', border: deliveryMethod === 'pickup' ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: deliveryMethod === 'pickup' ? 'var(--primary-light)' : 'transparent', color: deliveryMethod === 'pickup' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>
                  Self-Pickup
                </button>
              </div>
            ) : (
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: 'var(--r-md)', padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Shield size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>Digital delivery active: link/file will be unlocked instantly on checkout payment confirmation.</span>
              </div>
            )}
          </div>

          {deliveryMethod === 'delivery' && !isAllDigital && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Delivery Address *</label>
              <textarea required placeholder="Enter your full street address, city, and state" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="input-field" style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>{fmt(cartTotal, currencySymbol)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-whatsapp clickable"
            style={{ width: '100%', padding: '15px 20px', fontSize: 15, borderRadius: 'var(--r-lg)', marginBottom: 12, fontFamily: 'var(--font-heading)', fontWeight: 800, gap: 10 }}
            id="submit-checkout-btn"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <WhatsAppIcon size={20} />
                Complete Order & Chat on WhatsApp
              </>
            )}
          </button>
        </form>
        <div style={{ height: 'max(24px, env(safe-area-inset-bottom))' }} />
      </div>
    </>
  );
}

// ─── Store Header ─────────────────────────────────────────────────────────────

function StoreHeader({
  store,
  productCount,
  categoryCount,
  featuredProducts,
  currencySymbol,
}: {
  store: Store;
  productCount: number;
  categoryCount: number;
  featuredProducts: Product[];
  currencySymbol: string;
}) {
  const initial = store.store_name.charAt(0).toUpperCase();
  const template = STORE_TEMPLATES[getTemplateId(store)];
  const selectedFeaturedIds = store.featured_product_ids ?? [];
  const spotlightProducts = store.featured_carousel_enabled === false
    ? []
    : (selectedFeaturedIds.length
      ? selectedFeaturedIds
        .map(id => featuredProducts.find(product => product.id === id))
        .filter((product): product is Product => Boolean(product))
      : featuredProducts
    ).slice(0, 5);
  const catalogLabel = store.catalog_label || 'product';
  const categoryLabel = store.category_label || 'collection';
  const templateHighlight = store.is_pro
    ? (store.template_highlight_label || template.tagline)
    : template.name;
  const featuredEyebrow = store.featured_carousel_eyebrow || 'Featured now';
  const featuredTitle = store.featured_carousel_title || 'Fresh picks from the catalog';

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: store.store_name, text: store.store_bio ?? `Check out my store!`, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="store-header animate-fade-in">
      <div className="store-header__media">
        {store.banner_url
          ? <img src={store.banner_url} alt={`${store.store_name} banner`} className="store-header__banner" />
          : <div className="store-header__banner-placeholder" />
        }
        <div className="store-header__media-shade" />
      </div>

      <div className="store-header__content">
        <div className="store-header__brand-row">
          <div className="store-header__avatar-wrap">
            {store.logo_url
              ? <img src={store.logo_url} alt={store.store_name} className="store-header__avatar" />
              : <div className="store-header__avatar">{initial}</div>
            }
            {store.is_verified && (
              <div className="store-header__verified" title="Verified Store">
                <CheckCircle2 size={12} strokeWidth={3} color="#fff" />
              </div>
            )}
          </div>

          <div className="store-header__title-block">
            <div className="store-header__eyebrow">
              {store.is_pro ? <span>Premium merchant</span> : <span>Storefront</span>}
            </div>

            <div className="store-header__name-row">
              <h1 className="store-header__name">{store.store_name}</h1>
              {store.is_verified && (
                <span className="badge badge-verified store-header__verified-badge">
                  <CheckCircle2 size={11} strokeWidth={3} /> Verified
                </span>
              )}
            </div>

            {store.store_bio && <p className="store-header__bio">{store.store_bio}</p>}
          </div>
        </div>

        <div className="store-header__trust-row" aria-label="Store highlights">
          <div className="store-header__trust-item">
            <Package size={15} />
            <span>{productCount} {catalogLabel}{productCount === 1 ? '' : 's'}</span>
          </div>
          <div className="store-header__trust-item">
            <Tag size={15} />
            <span>{categoryCount > 0 ? `${categoryCount} ${categoryLabel}${categoryCount === 1 ? '' : 's'}` : 'Fresh catalog'}</span>
          </div>
          <div className="store-header__trust-item">
            <Shield size={15} />
            <span>{templateHighlight}</span>
          </div>
        </div>

        {spotlightProducts.length > 0 && (
          <div className="store-header__spotlight" aria-label="Featured products">
            <div className="store-header__spotlight-copy">
              <span>{featuredEyebrow}</span>
              <strong>{featuredTitle}</strong>
            </div>
            <div className="store-header__spotlight-products">
              {spotlightProducts.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  className="store-header__spotlight-card clickable"
                  onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="store-header__spotlight-image">
                    {product.image_urls?.[0]
                      ? <img src={product.image_urls[0]} alt={product.name} loading="eager" decoding="async" />
                      : <Package size={22} strokeWidth={1.4} />
                    }
                  </span>
                  <span className="store-header__spotlight-meta">
                    <span>{product.name}</span>
                    <strong>{fmt(product.price, currencySymbol)}</strong>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="store-header__socials">
          <a
            href={buildWhatsAppUrl(store.whatsapp_phone, `Hi ${store.store_name}!`)}
            target="_blank" rel="noopener noreferrer"
            className="social-btn social-btn--primary clickable"
            id="store-whatsapp-link"
          >
            <WhatsAppIcon size={14} /> Chat on WhatsApp
          </a>

          {store.instagram_handle && (
            <a href={`https://instagram.com/${store.instagram_handle}`} target="_blank" rel="noopener noreferrer"
              className="social-btn clickable">
              <Instagram size={13} strokeWidth={2} /> Instagram
            </a>
          )}

          {store.tiktok_handle && (
            <a href={`https://tiktok.com/@${store.tiktok_handle}`} target="_blank" rel="noopener noreferrer"
              className="social-btn clickable">
              <Music2 size={13} strokeWidth={2} /> TikTok
            </a>
          )}

          <button className="social-btn clickable" onClick={handleShare} id="share-store-btn"
          >
            <Share2 size={13} strokeWidth={2} /> Share Store
          </button>
        </div>

        {store.custom_links && store.custom_links.filter(l => l.is_active && l.platform !== 'whatsapp').length > 0 && (
          <div className="store-header__links">
            <p className="store-header__links-label">
              Store Links & Socials
            </p>
            {store.custom_links.filter(l => l.is_active && l.platform !== 'whatsapp').map(link => {
              const IconComponent = () => {
                switch (link.platform) {
                  case 'whatsapp': return <WhatsAppIcon size={14} style={{ color: 'var(--wa-green)' }} />;
                  case 'instagram': return <Instagram size={14} style={{ color: '#e1306c' }} />;
                  case 'tiktok': return <Music2 size={14} style={{ color: '#00f2fe' }} />;
                  case 'facebook': return <Facebook size={14} style={{ color: '#1877f2' }} />;
                  case 'twitter': return <Twitter size={14} style={{ color: '#1da1f2' }} />;
                  default: return <Globe size={14} />;
                }
              };
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-header__link clickable"
                >
                  <IconComponent />
                  <span>{link.title}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Store Footer ─────────────────────────────────────────────────────────────

function StoreFooter({ store, systemDomain = 'frontstore.app', appName = 'Front Store' }: { store: Store; systemDomain?: string; appName?: string }) {
  const templateId = getTemplateId(store);
  const template = STORE_TEMPLATES[templateId];

  return (
    <footer className="store-footer">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        {(store.instagram_handle || store.tiktok_handle) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {store.instagram_handle && (
              <a href={`https://instagram.com/${store.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                className="social-btn clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Instagram size={13} /> @{store.instagram_handle}
              </a>
            )}
            {store.tiktok_handle && (
              <a href={`https://tiktok.com/@${store.tiktok_handle}`} target="_blank" rel="noopener noreferrer"
                className="social-btn clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Music2 size={13} /> @{store.tiktok_handle}
              </a>
            )}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Powered by <a href="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>{appName}</a> · Africa&apos;s #1 WhatsApp Commerce Platform · Template: <strong>{template.name}</strong>
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>© {new Date().getFullYear()} {store.store_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StorefrontClient({
  username,
  initialProductSlug,
  initialData,
}: {
  username: string;
  initialProductSlug?: string;
  initialData?: {
    store: Store;
    categories?: Category[];
    products?: Product[];
    system_domain?: string;
    store_disclaimer?: string;
    app_name?: string;
    logo_url?: string;
  } | null;
}) {
  const uname = username;

  const [store, setStore] = useState<Store | null>(initialData?.store || null);
  const [categories, setCategories] = useState<Category[]>(initialData?.categories || []);
  const [products, setProducts] = useState<Product[]>(initialData?.products || []);
  const [loading, setLoading] = useState(!initialData || !initialData.store);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    initialProductSlug && initialData?.products
      ? initialData.products.find(item => item.slug === initialProductSlug) || null
      : null
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [systemDomain, setSystemDomain] = useState(initialData?.system_domain || 'frontstore.app');
  const [storeDisclaimer, setStoreDisclaimer] = useState(initialData?.store_disclaimer || '');
  const [appName, setAppName] = useState(initialData?.app_name || 'Front Store');
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<string | null>(null);
  const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  useEffect(() => {
    if (!uname) return;
    (async () => {
      try {
        if (!store) {
          setLoading(true);
        }
        const res = await fetch(`${API_URL}/v1/public/store/${uname}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Store not found or currently inactive');
        const { data } = await res.json();
        setStore(data.store);
        setCategories(data.categories ?? []);
        setProducts(data.products ?? []);
        if (data.system_domain) setSystemDomain(data.system_domain);
        if (data.store_disclaimer) setStoreDisclaimer(data.store_disclaimer);
        if (data.app_name) setAppName(data.app_name);
        if (data.logo_url) setLogoUrl(data.logo_url);
      } catch (e: any) {
        if (!store) {
          setError(e.message ?? 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [uname]);

  useEffect(() => {
    if (!initialProductSlug || products.length === 0) return;
    const product = products.find(item => item.slug === initialProductSlug);
    if (product) {
      setSelectedProduct(product);
    }
  }, [initialProductSlug, products]);

  useEffect(() => {
    if (loading || !store) return;
    if (selectedProduct) {
      const targetUrl = `/${store.username}/products/${selectedProduct.slug}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
    } else {
      const targetUrl = `/${store.username}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
    }
  }, [selectedProduct, store, loading]);

  useEffect(() => {
    if (!uname) return;
    try { const s = localStorage.getItem(`frontstore_cart_${uname}`); if (s) setCart(JSON.parse(s)); } catch { }
  }, [uname]);

  const addToCart = useCallback((product: Product, qty: number) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      const next = [...prev];
      if (idx > -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      else next.push({ product, quantity: qty });
      try { localStorage.setItem(`frontstore_cart_${uname}`, JSON.stringify(next)); } catch { }
      return next;
    });
    toast.success(`Added ${qty}× ${product.name}`);
  }, [uname]);

  const updateCartQty = useCallback((productId: string, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === productId);
      if (idx === -1) return prev;
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) next.splice(idx, 1);
      else next[idx] = { ...next[idx], quantity: newQty };
      try { localStorage.setItem(`frontstore_cart_${uname}`, JSON.stringify(next)); } catch { }
      return next;
    });
  }, [uname]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
      && (selectedCategoryId === 'all' || p.category_id === selectedCategoryId);
  });

  const currencySymbol = store ? getCurrencySymbol(store.currency_code) : '₦';
  const templateId = getTemplateId(store);
  const productSectionEyebrow = store?.product_section_eyebrow || 'Catalog';
  const productSectionTitle = store?.product_section_title
    || (products.length === 0
      ? 'Catalog opening soon'
      : templateId === 'flash-sale'
        ? 'Limited offers'
        : templateId === 'digital-studio'
          ? 'Browse digital products'
          : templateId === 'editorial'
            ? 'Featured collection'
            : 'Shop the collection');
  const pageStyle = store?.is_pro && store.primary_color
    ? ({ '--primary': store.primary_color } as React.CSSProperties)
    : undefined;

  const startCheckoutForProduct = useCallback((product: Product, quantity: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      const next = [...prev];
      if (idx > -1) {
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      } else {
        next.push({ product, quantity });
      }
      try {
        localStorage.setItem(`frontstore_cart_${uname}`, JSON.stringify(next));
      } catch { }
      return next;
    });
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [uname]);

  const handleShareProduct = async (product: Product) => {
    const productUrl = `${window.location.origin}/${store?.username || uname}/products/${product.slug}`;
    const shareText = `${product.name} — ${fmt(product.price, currencySymbol)}`;
    if (navigator.share) await navigator.share({ title: product.name, text: shareText, url: productUrl });
    else { navigator.clipboard.writeText(productUrl); toast.success('Product link copied!'); }
  };

  const handleShareStore = async () => {
    if (!store) return;
    if (navigator.share) await navigator.share({ title: store.store_name, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success('Store link copied!'); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }}><StoreSkeleton /></div>;

  if (error || !store) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', background: 'var(--bg)' }}>
        <AlertCircle size={56} strokeWidth={1} color="var(--text-faint)" style={{ marginBottom: 16 }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Store Unavailable</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>{error ?? "We couldn't load this storefront. Please check the URL and try again."}</p>
        <a href="/" className="btn btn-primary" style={{ textDecoration: 'none', gap: 8 }}>
          <ArrowRight size={16} /> Go to {appName}
        </a>
      </div>
    );
  }

  return (
    <>
      <title>{`${store.store_name} — Shop on ${appName}`}</title>
      <div className={`public-store-page template-${templateId}`} data-template={templateId} style={{ ...pageStyle, paddingBottom: cartCount > 0 ? 90 : 32 }}>

        <StoreHeader store={store} productCount={products.length} categoryCount={categories.length} featuredProducts={products} currencySymbol={currencySymbol} />

        {storeDisclaimer && (
          <div className="storefront-shell" style={{ marginTop: 12, marginBottom: 4 }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              color: '#d97706',
              borderRadius: 'var(--r-md)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              lineHeight: '1.4'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{storeDisclaimer}</div>
            </div>
          </div>
        )}

        {/* Sticky search + categories */}
        <div className="sticky-bar">
          <div className="storefront-shell storefront-toolbar">
            <div className="search-wrap">
              <Search size={15} strokeWidth={2} className="search-icon" style={{ position: 'absolute', left: 14, color: 'var(--text-faint)', pointerEvents: 'none' }} />
              <input
                type="search"
                className="search-input"
                placeholder={`Search in ${store.store_name}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                id="product-search-input"
                aria-label="Search products"
                autoComplete="off"
              />
              {searchQuery && (
                <button className="search-clear clickable" onClick={() => setSearchQuery('')} aria-label="Clear">
                  <X size={10} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="storefront-shell category-scroll no-scrollbar" role="tablist">
              <button
                className={`category-chip clickable${selectedCategoryId === 'all' ? ' active' : ''}`}
                onClick={() => setSelectedCategoryId('all')} role="tab" id="category-all"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Zap size={12} strokeWidth={2} /> All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-chip clickable${selectedCategoryId === cat.id ? ' active' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.id)} role="tab" id={`category-${cat.slug}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product count */}
        <div className="storefront-shell product-section-heading">
          <div>
            <p className="product-section-heading__eyebrow">{productSectionEyebrow}</p>
            <h2>{productSectionTitle}</h2>
          </div>
          <p>
            {products.length === 0 ? 'New products are being prepared' : filteredProducts.length === 0 ? 'No matching products' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
            {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
          </p>
        </div>

        {/* Product grid */}
        <main className="storefront-shell storefront-products" id="products-grid" aria-label="Products">
          {filteredProducts.length === 0 ? (
            <div className="storefront-empty animate-fade-in">
              <div className="storefront-empty__visual" aria-hidden="true">
                <div className="storefront-empty__shelf">
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ animationDelay: `${i * 90}ms` }}>
                      <Package size={28} strokeWidth={1.25} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="storefront-empty__copy">
                <span>{products.length === 0 ? 'Opening soon' : 'Filter results'}</span>
                <h3>{products.length === 0 ? `${store.store_name} is preparing its first drop` : 'No products match this view'}</h3>
                <p>{products.length === 0 ? 'The merchant has not published products yet. You can still chat with them directly on WhatsApp for availability and custom requests.' : 'Try a different search term or browse the full catalog.'}</p>
                <div className="storefront-empty__actions">
                  <button className="btn btn-outline clickable" onClick={handleShareStore}>
                    <Share2 size={14} /> Share Store
                  </button>
                  {(searchQuery || selectedCategoryId !== 'all') && (
                    <button className="btn btn-outline clickable"
                      onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}>
                      <X size={14} /> Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="product-grid stagger">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onView={() => setSelectedProduct(product)}
                  onShare={() => handleShareProduct(product)}
                />
              ))}
            </div>
          )}
        </main>

        <StoreFooter store={store} systemDomain={systemDomain} appName={appName} />

        {/* Cart FAB */}
        {cartCount > 0 && (
          <div className="cart-fab">
            <button
              className="btn btn-primary clickable"
              style={{ width: '100%', padding: '15px 20px', borderRadius: 'var(--r-xl)', fontSize: 14.5, justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)' }}
              onClick={() => setIsCartOpen(true)}
              id="view-cart-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 700 }}>{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 800 }}>{fmt(cartTotal, currencySymbol)}</span>
                <ChevronRight size={16} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        )}

        {selectedProduct && (
          <ProductDetailDrawer
            product={selectedProduct} store={store} currencySymbol={currencySymbol}
            onClose={() => setSelectedProduct(null)} onAddToCart={addToCart}
            onOrderNow={startCheckoutForProduct}
          />
        )}

        {isCartOpen && (
          <CartDrawer
            cart={cart} store={store} currencySymbol={currencySymbol} cartTotal={cartTotal}
            onClose={() => setIsCartOpen(false)} onUpdateQty={updateCartQty}
            onWhatsAppCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
            onRemoveItem={(id) => setPendingRemoveItem(id)}
            onClearCart={() => setIsClearCartConfirmOpen(true)}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutDrawer
            cart={cart}
            store={store}
            currencySymbol={currencySymbol}
            cartTotal={cartTotal}
            onClose={() => setIsCheckoutOpen(false)}
            onBack={() => { setIsCheckoutOpen(false); setIsCartOpen(true); }}
            onOrderCreated={(receipt) => {
              setOrderReceipt(receipt);
              setCart([]);
              try { localStorage.removeItem(`frontstore_cart_${uname}`); } catch { }
              setIsCheckoutOpen(false);
              toast.success('Order created. Tracking page is ready.');
            }}
            API_URL={API_URL}
            uname={uname as string}
            storeDisclaimer={storeDisclaimer}
          />
        )}

        {orderReceipt && store && (
          <OrderReceiptModal
            receipt={orderReceipt}
            store={store}
            currencySymbol={currencySymbol}
            onClose={() => setOrderReceipt(null)}
            onContinue={() => {
              window.open(orderReceipt.whatsapp_url, '_blank');
              setOrderReceipt(null);
            }}
          />
        )}

        <ConfirmationModal
          isOpen={!!pendingRemoveItem}
          title="Remove Item?"
          message={`Are you sure you want to remove "${cart.find(i => i.product.id === pendingRemoveItem)?.product.name}" from your cart?`}
          confirmText="Remove"
          onConfirm={() => {
            if (pendingRemoveItem) {
              updateCartQty(pendingRemoveItem, -1);
              setPendingRemoveItem(null);
              toast.info('Item removed from cart');
            }
          }}
          onCancel={() => setPendingRemoveItem(null)}
        />

        <ConfirmationModal
          isOpen={isClearCartConfirmOpen}
          title="Clear Cart?"
          message="Are you sure you want to remove all items from your cart?"
          confirmText="Clear Cart"
          onConfirm={() => {
            setCart([]);
            try { localStorage.removeItem(`frontstore_cart_${uname}`); } catch { }
            setIsClearCartConfirmOpen(false);
            toast.info('Cart cleared');
          }}
          onCancel={() => setIsClearCartConfirmOpen(false)}
        />
      </div>
    </>
  );
}
