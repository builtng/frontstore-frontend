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
  is_pro?: boolean;
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

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function buildSingleWAMsg(store: Store, product: Product, qty: number, symbol: string): string {
  return `Hi ${store.store_name}! 👋\n\nI'd like to order:\n\n🛍️ *${product.name}*\nQty: ${qty}\nPrice: ${fmt(parseFloat(product.price) * qty, symbol)}\n\nPlease confirm availability. Thank you!`;
}

function buildCartWAMsg(store: Store, cart: CartItem[], total: number, symbol: string): string {
  const lines = cart.map(i => `• ${i.product.name} × ${i.quantity} — ${fmt(parseFloat(i.product.price) * i.quantity, symbol)}`).join('\n');
  return `Hi ${store.store_name}! 👋\n\nI'd like to place an order:\n\n${lines}\n\n*Total: ${fmt(total, symbol)}*\n\nPlease confirm and share delivery details. Thank you!`;
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
      <div className="card glass animate-scale-in" style={{
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
  product, currencySymbol, onView, onWhatsApp, onShare,
}: {
  product: Product; currencySymbol: string;
  onView: () => void; onWhatsApp: () => void; onShare: () => void;
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
            onClick={e => { e.stopPropagation(); onWhatsApp(); }}
            id={`wa-buy-${product.id}`}
            aria-label={`Order ${product.name} via WhatsApp`}
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
  product, store, currencySymbol, onClose, onAddToCart,
}: {
  product: Product; store: Store; currencySymbol: string;
  onClose: () => void; onAddToCart: (p: Product, q: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
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

  const handleWhatsApp = () => {
    window.open(buildWhatsAppUrl(store.whatsapp_phone, buildSingleWAMsg(store, product, qty, currencySymbol)), '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: product.name, text: `${product.name} — ${fmt(product.price, currencySymbol)}`, url });
    else { navigator.clipboard.writeText(url); }
  };

  return (
    <>
      <div className="drawer-backdrop animate-backdrop" onClick={onClose} />
      <div className="drawer animate-drawer" role="dialog" aria-modal="true" aria-label={product.name}>
        <div className="drawer__handle" />

        {/* Carousel */}
        {images.length > 0 ? (
          <div className="product-detail__carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <img src={images[imgIdx]} alt={`${product.name} - image ${imgIdx + 1}`} />
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
                onClick={handleWhatsApp}
                id={`whatsapp-order-${product.id}`}
              >
                <WhatsAppIcon size={20} />
                Order on WhatsApp — {fmt(total, currencySymbol)}
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
  cart, store, currencySymbol, cartTotal, onClose, onBack, onOrderCreated, API_URL, uname
}: {
  cart: CartItem[]; store: Store; currencySymbol: string; cartTotal: number;
  onClose: () => void; onBack: () => void; onOrderCreated: (whatsappUrl: string) => void;
  API_URL: string; uname: string;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'digital'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAllDigital = cart.every(item => item.product.is_digital);

  useEffect(() => {
    if (isAllDigital) {
      setDeliveryMethod('digital');
    } else if (deliveryMethod === 'digital') {
      setDeliveryMethod('delivery');
    }
  }, [isAllDigital, deliveryMethod]);

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

      onOrderCreated(json.data.whatsapp_url);
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
              <Loader2 size={20} className="spinner" />
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

function StoreHeader({ store }: { store: Store }) {
  const initial = store.store_name.charAt(0).toUpperCase();

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: store.store_name, text: store.store_bio ?? `Check out my store!`, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="store-header animate-fade-in">
      {store.banner_url
        ? <img src={store.banner_url} alt={`${store.store_name} banner`} className="store-header__banner" />
        : <div className="store-header__banner-placeholder" />
      }

      <div className="store-header__info">
        {/* Avatar */}
        <div className="store-header__avatar-wrap">
          {store.logo_url
            ? <img src={store.logo_url} alt={store.store_name} className="store-header__avatar" style={{ display: 'block' }} />
            : <div className="store-header__avatar">{initial}</div>
          }
          {store.is_verified && (
            <div className="store-header__verified" title="Verified Store">
              <CheckCircle2 size={11} strokeWidth={3} color="#fff" />
            </div>
          )}
        </div>

        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <h1 className="store-header__name">{store.store_name}</h1>
          {store.is_verified && (
            <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={10} strokeWidth={3} /> Verified
            </span>
          )}
        </div>

        {store.store_bio && <p className="store-header__bio">{store.store_bio}</p>}

        {/* Social actions */}
        <div className="store-header__socials">
          <a
            href={buildWhatsAppUrl(store.whatsapp_phone, `Hi ${store.store_name}!`)}
            target="_blank" rel="noopener noreferrer"
            className="social-btn clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            id="store-whatsapp-link"
          >
            <WhatsAppIcon size={14} /> Chat on WhatsApp
          </a>

          {store.instagram_handle && (
            <a href={`https://instagram.com/${store.instagram_handle}`} target="_blank" rel="noopener noreferrer"
              className="social-btn clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Instagram size={13} strokeWidth={2} /> Instagram
            </a>
          )}

          {store.tiktok_handle && (
            <a href={`https://tiktok.com/@${store.tiktok_handle}`} target="_blank" rel="noopener noreferrer"
              className="social-btn clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Music2 size={13} strokeWidth={2} /> TikTok
            </a>
          )}

          <button className="social-btn clickable" onClick={handleShare} id="share-store-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={13} strokeWidth={2} /> Share Store
          </button>
        </div>

        {/* Linktree style Custom Links Stack */}
        {store.custom_links && store.custom_links.filter(l => l.is_active).length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: '100%',
            maxWidth: 480,
            marginTop: 18,
            borderTop: '1px solid var(--border)',
            paddingTop: 16
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              Store Links & Socials
            </p>
            {store.custom_links.filter(l => l.is_active).map(link => {
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
                  className="clickable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 18px',
                    borderRadius: 'var(--r-xl)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: 13.5,
                    fontWeight: 750,
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all var(--t-fast) var(--ease)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.background = 'var(--primary-light)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px var(--primary-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
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

function StoreFooter({ store }: { store: Store }) {
  return (
    <footer className="store-footer">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Contact</p>
          <a
            href={buildWhatsAppUrl(store.whatsapp_phone, `Hi ${store.store_name}!`)}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-whatsapp clickable"
            style={{ display: 'inline-flex', padding: '10px 16px', fontSize: 13, gap: 8, textDecoration: 'none' }}
            id="footer-whatsapp-link"
          >
            <WhatsAppIcon size={16} /> Chat on WhatsApp
          </a>
        </div>

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
            Powered by <a href="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>aloaye</a> · Africa&apos;s #1 WhatsApp Commerce Platform
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>© {new Date().getFullYear()} {store.store_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StorefrontClient({ username }: { username: string }) {
  const uname = username;

  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<string | null>(null);
  const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';

  useEffect(() => {
    if (!uname) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/store/${uname}`);
        if (!res.ok) throw new Error('Store not found or currently inactive');
        const { data } = await res.json();
        setStore(data.store);
        setCategories(data.categories ?? []);
        setProducts(data.products ?? []);
      } catch (e: any) {
        setError(e.message ?? 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, [uname]);

  useEffect(() => {
    if (!uname) return;
    try { const s = localStorage.getItem(`aloaye_cart_${uname}`); if (s) setCart(JSON.parse(s)); } catch {}
  }, [uname]);

  const addToCart = useCallback((product: Product, qty: number) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      const next = [...prev];
      if (idx > -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      else next.push({ product, quantity: qty });
      try { localStorage.setItem(`aloaye_cart_${uname}`, JSON.stringify(next)); } catch {}
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
      try { localStorage.setItem(`aloaye_cart_${uname}`, JSON.stringify(next)); } catch {}
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

  const handleCartWhatsApp = () => {
    if (!store || !cart.length) return;
    window.open(buildWhatsAppUrl(store.whatsapp_phone, buildCartWAMsg(store, cart, cartTotal, currencySymbol)), '_blank');
    setIsCartOpen(false);
  };

  const handleShareProduct = async (product: Product) => {
    if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }}><StoreSkeleton /></div>;

  if (error || !store) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', background: 'var(--bg)' }}>
        <AlertCircle size={56} strokeWidth={1} color="var(--text-faint)" style={{ marginBottom: 16 }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Store Unavailable</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>{error ?? "We couldn't load this storefront. Please check the URL and try again."}</p>
        <a href="/" className="btn btn-primary" style={{ textDecoration: 'none', gap: 8 }}>
          <ArrowRight size={16} /> Go to aloaye
        </a>
      </div>
    );
  }

  return (
    <>
      <title>{`${store.store_name} — Shop on aloaye`}</title>
      {store.is_pro && store.primary_color && (
        <style dangerouslySetInnerHTML={{
          __html: `:root { --primary: ${store.primary_color} !important; }`
        }} />
      )}
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: cartCount > 0 ? 90 : 32 }}>

        <StoreHeader store={store} />

        {/* Sticky search + categories */}
        <div className="sticky-bar">
          <div style={{ padding: '12px 16px 8px' }}>
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
            <div style={{ display: 'flex', overflowX: 'auto', padding: '0 16px 12px', gap: 8 }} className="no-scrollbar" role="tablist">
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
        <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
            {filteredProducts.length === 0 ? 'No products found' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
          {searchQuery && <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>for &ldquo;{searchQuery}&rdquo;</p>}
        </div>

        {/* Product grid */}
        <main style={{ padding: '0 16px 24px' }} id="products-grid" aria-label="Products">
          {filteredProducts.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state__icon"><Package size={44} strokeWidth={1} /></div>
              <p className="empty-state__title">No products found</p>
              <p className="empty-state__body">Try a different search or select another category.</p>
              {(searchQuery || selectedCategoryId !== 'all') && (
                <button className="btn btn-outline clickable" style={{ marginTop: 16, gap: 6 }}
                  onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}>
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid stagger">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  onView={() => setSelectedProduct(product)}
                  onWhatsApp={() => {
                    if (!store) return;
                    window.open(buildWhatsAppUrl(store.whatsapp_phone, buildSingleWAMsg(store, product, 1, currencySymbol)), '_blank');
                  }}
                  onShare={() => handleShareProduct(product)}
                />
              ))}
            </div>
          )}
        </main>

        <StoreFooter store={store} />

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
            onOrderCreated={(whatsappUrl) => {
              window.open(whatsappUrl, '_blank');
              setCart([]);
              try { localStorage.removeItem(`aloaye_cart_${uname}`); } catch {}
              setIsCheckoutOpen(false);
              toast.success('Order created! Opening WhatsApp... 🚀');
            }}
            API_URL={API_URL}
            uname={uname as string}
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
            try { localStorage.removeItem(`aloaye_cart_${uname}`); } catch {}
            setIsClearCartConfirmOpen(false);
            toast.info('Cart cleared');
          }}
          onCancel={() => setIsClearCartConfirmOpen(false)}
        />
      </div>
    </>
  );
}
