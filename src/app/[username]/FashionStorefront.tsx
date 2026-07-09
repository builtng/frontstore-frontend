'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
  Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store,
  Search, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft,
  Truck, ShieldCheck, Lock, Plus, Minus, Copy, Instagram,
  Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell, Ruler, Receipt,
  Camera
} from "lucide-react";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { InstagramIcon, TikTokIcon } from "../../components/SocialIcons";
import { calculateShippingFee } from "../../utils/shippingFee";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoreData {
  id: string; username: string; store_name: string; store_bio: string | null;
  logo_url: string | null; banner_url?: string | null; currency_code: string;
  whatsapp_phone: string; instagram_handle: string | null; tiktok_handle: string | null;
  twitter_handle?: string | null; is_verified?: boolean | number;
  primary_color?: string | null; store_template?: string | null;
  is_pro?: boolean | number; business_persona?: string | null;
  location?: string | null; since?: string | null; address?: string | null;
  working_hours?: any; email?: string | null; phone?: string | null;
  announcement_title?: string | null; announcement_body?: string | null;
  announcement_cta_label?: string | null; announcement_cta_page?: string | null;
  rating?: number | null; review_count?: number | null;
  total_orders?: number | string | null; reply_time_minutes?: number | null;
  storefront_sections?: string[] | null;
  founder_name?: string | null; founder_role?: string | null;
  founder_bio?: string | null; founder_avatar_url?: string | null;
  founder_quote?: string | null; founder_socials?: any;
  founder_credentials?: string[] | null; founder_specialities?: string[] | null;
  recognition?: string[] | null; about_facts?: [string, string][] | null;
}
interface Category { id: string; name: string; slug: string; }
interface Product {
  id: string; name: string; slug: string; price: string;
  compare_at_price: string | null; description: string | null;
  image_url?: string | null; image_urls: string[] | null;
  stock_status: string; category_id: string | null;
  is_digital?: boolean; type?: 'service' | 'product';
  duration_minutes?: number | null; service_facts?: string[] | null;
}
interface Review { id: string; reviewer_name: string; body: string; rating: number; created_at?: string; }
interface StoreFaq { id: string; question: string; answer: string; }
interface BlogPost {
  id: string; title: string; slug?: string; category?: string; read_time?: string;
  excerpt?: string; body?: any[]; image_url?: string | null; published_at?: string | null;
  is_pseo?: boolean;
}
interface PortfolioItem {
  id: string; label?: string; category?: string; image_url?: string | null;
  is_before_after?: boolean; sort_order?: number;
}
interface CartItem {
  key: string; id: string; name: string; price: number; qty: number;
  type: 'service' | 'product'; image_url?: string | null;
  slot?: string; duration?: number;
}

interface FashionStorefrontProps {
  username: string; store: StoreData; categories: Category[];
  products: Product[]; reviews: Review[]; faqs: StoreFaq[];
  portfolio?: PortfolioItem[]; blog?: BlogPost[];
  systemDomain: string; storeDisclaimer: string; appName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeApiUrl = (url?: string | null) => (url || '').replace(/\/+$/, '');
const fmtCurrency = (amount: number, code: string) => {
  const syms: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵', KES: 'KSh' };
  return `${syms[code] || code + ' '}${amount.toLocaleString()}`;
};
const initials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const fmtDate = (s?: string | null) => {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return s; }
};
const clr = (i: number) => ['c0', 'c1', 'c2', 'c3'][i % 4];
const replyFmt = (m?: number | null) => !m ? '~10 min' : m < 60 ? `~${m} min` : `~${Math.round(m / 60)} hr`;

// TikTok SVG (not in lucide)
function Tiktok({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FashionStorefront({
  username, store, categories, products, reviews, faqs,
  portfolio = [], blog = [], systemDomain, storeDisclaimer, appName,
}: FashionStorefrontProps) {
  const currency = store.currency_code || 'NGN';
  const money = (n: number) => fmtCurrency(n, currency);

  // ── State ──
  const [page, setPage] = useState('home');
  const [drawer, setDrawer] = useState(false);
  const [annOff, setAnnOff] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [bag, setBag] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [pfCat, setPfCat] = useState('All');
  const [blogCat, setBlogCat] = useState('All');
  const [revSort, setRevSort] = useState('recent');
  const [revStar, setRevStar] = useState(0);

  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [orderNote, setOrderNote] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Toast
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(null), 2000); return () => clearTimeout(t); }, [toastMsg]);

  // Cart persistence
  useEffect(() => { try { const s = localStorage.getItem(`frontstore_cart_${username}`); if (s) setBag(JSON.parse(s)); } catch { } }, [username]);
  const saveCart = (b: CartItem[]) => { try { localStorage.setItem(`frontstore_cart_${username}`, JSON.stringify(b)); } catch { } };

  const bagCount = bag.reduce((n, b) => n + b.qty, 0);
  const bagTotal = bag.reduce((n, b) => n + b.qty * b.price, 0);
  const shippingPreview = calculateShippingFee(store, bagTotal);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/v1/public/store/${username}/coupons/${couponCodeInput.trim()}/validate`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const minOrder = parseFloat(json.data.min_order_amount);
        if (minOrder > 0 && bagTotal < minOrder) {
          setCouponError(`This coupon requires a minimum order of ${money(minOrder)}`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(json.data);
          ping('Coupon applied!');
        }
      } else {
        setCouponError(json.message || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError('Error validating coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      const minOrder = parseFloat(appliedCoupon.min_order_amount);
      if (minOrder > 0 && bagTotal < minOrder) {
        setAppliedCoupon(null);
        setCouponError(`Coupon removed: subtotal is below minimum order.`);
      }
    }
  }, [bagTotal, appliedCoupon]);
  const ping = (m: string) => setToastMsg(m);

  const go = (p: string) => { setPage(p); setDrawer(false); setPost(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openPost = (p: BlogPost) => { setPost(p); setPage('post'); setDrawer(false); window.scrollTo({ top: 0 }); };

  const addToBag = (p: Product) => {
    const key = 'p' + p.id;
    setBag(prev => {
      const ex = prev.find(x => x.key === key);
      const next = ex ? prev.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x)
        : [...prev, { key, id: p.id, name: p.name, price: parseFloat(p.price), qty: 1, type: 'product' as const, image_url: p.image_url }];
      saveCart(next); return next;
    });
    ping('Added to bag');
  };
  const updateQty = (key: string, d: number) => setBag(prev => { const n = prev.map(x => x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x); saveCart(n); return n; });
  const removeItem = (key: string) => setBag(prev => { const n = prev.filter(x => x.key !== key); saveCart(n); return n; });

  const handleWA = (msg: string) => {
    if (!store.whatsapp_phone) return;
    setPendingWaUrl(`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const activeCategories = useMemo(() => {
    const ids = new Set(products.map(p => p.category_id).filter(Boolean));
    return categories.filter(c => ids.has(c.id));
  }, [categories, products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchCat = !activeCat || p.category_id === activeCat;
    const q = searchQuery.trim().toLowerCase();
    return matchCat && (!q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }), [products, activeCat, searchQuery]);

  const revFiltered = useMemo(() => reviews
    .filter(r => revStar === 0 || r.rating === revStar)
    .sort((a, b) => revSort === 'high' ? b.rating - a.rating : revSort === 'low' ? a.rating - b.rating : 0),
    [reviews, revStar, revSort]);

  const pfCats = useMemo(() => ['All', ...Array.from(new Set(portfolio.map(p => p.category || '').filter(Boolean)))], [portfolio]);
  const pfList = useMemo(() => pfCat === 'All' ? portfolio : portfolio.filter(p => p.category === pfCat), [portfolio, pfCat]);
  const blogCats = useMemo(() => ['All', ...Array.from(new Set(blog.map(b => b.category || '').filter(Boolean)))], [blog]);
  const blogList = useMemo(() => blogCat === 'All' ? blog : blog.filter(b => b.category === blogCat), [blog, blogCat]);

  const navItems: [string, string][] = ([
    ['home', 'Home'],
    ['products', 'Shop'],
    ['portfolio', 'Portfolio'],
    ['reviews', 'Reviews'],
    ['blog', 'Journal'],
    ['about', 'About'],
    ['faq', 'FAQ'],
    ['contact', 'Contact'],
  ] as [string, string][]).filter(([key]) => {
    if (key === 'home') return true;
    return (store.storefront_sections || []).includes(key);
  });

  const submitOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) { ping('Please fill in your name and phone'); return; }
    setCheckoutLoading(true);
    try {
      const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
      const res = await fetch(`${API_URL}/v1/public/store/${username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName, customer_phone: customerPhone,
          customer_email: customerEmail, delivery_address: deliveryAddress,
          delivery_method: deliveryMethod, note: orderNote,
          items: bag.map(b => ({ product_id: b.id, quantity: b.qty })),
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Order failed');
      setOrderReceipt(json.data); setBag([]); saveCart([]); setCheckoutStep('success');
    } catch (err: any) { ping(err.message || 'Something went wrong'); }
    finally { setCheckoutLoading(false); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  // ─── Product image helper ────────────────────────────────────────────────────
  const productImg = (p: Product) => (p.image_urls && p.image_urls[0]) || p.image_url || null;

  // ─── Sub-components ──────────────────────────────────────────────────────────
  const ProductCard = ({ p }: { p: Product }) => {
    const img = productImg(p);
    const catName = categories.find(c => c.id === p.category_id)?.name || '';
    const idx = activeCategories.findIndex(c => c.id === p.category_id);
    const sold = p.stock_status === 'out_of_stock';
    return (
      <button className={`ps-card prod-card ${clr(idx)}`} onClick={() => setSelectedProduct(p)}>
        {p.stock_status === 'out_of_stock' && <div className="ps-badge ps-badge--sold">Sold Out</div>}
        {p.compare_at_price && !sold && <div className="ps-badge ps-badge--sale">Sale</div>}
        {img ? <img src={img} alt={p.name} className="ps-card-img" style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }} loading="lazy" /> : <div className="ps-card-icn"><ShoppingBag size={28} /></div>}
        <div className="ps-card-foot">
          {catName && <span className="ps-card-cat">{catName}</span>}
          <span className="ps-card-name">{p.name}</span>
          <span className="ps-card-price">{money(parseFloat(p.price))}</span>
        </div>
      </button>
    );
  };

  const ProductDetail = ({ p }: { p: Product }) => {
    const img = productImg(p);
    const imgs = p.image_urls && p.image_urls.length > 0 ? p.image_urls : (p.image_url ? [p.image_url] : []);
    const [activeImg, setActiveImg] = useState(0);
    const catName = categories.find(c => c.id === p.category_id)?.name || '';
    const idx = activeCategories.findIndex(c => c.id === p.category_id);
    const sold = p.stock_status === 'out_of_stock';
    const look = products.filter(x => x.id !== p.id).slice(0, 4);
    return (
      <div className="pv">
        <button className="pv-back" onClick={() => setSelectedProduct(null)}>
          <ChevronLeft size={16} /> Back to shop
        </button>
        <div className="pv-grid">
          <div className="pv-gallery">
            <div className={`pv-main ${clr(idx)}`}>
              {imgs.length > 0 ? (
                <img src={imgs[activeImg]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              ) : (
                <span className="pv-main-icn"><ShoppingBag size={40} /></span>
              )}
              {p.compare_at_price && !sold && <span className="pv-tag"><Star size={11} /> Sale</span>}
              {catName && <span className="pv-cat">{catName}</span>}
            </div>
            {imgs.length > 1 && (
              <div className="pv-thumbs">
                {imgs.map((src, i) => (
                  <button key={i} className={`pv-thumb ${clr(i)}`} onClick={() => setActiveImg(i)} style={{ padding: 0, border: i === activeImg ? '2px solid #1d7a5e' : undefined, overflow: 'hidden' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="pv-info">
            <div className="pv-infocat">{catName}</div>
            <h2 className="pv-name">{p.name}</h2>
            <div className="pv-price">
              {money(parseFloat(p.price))}
              {p.compare_at_price && <span className="pv-approx" style={{ textDecoration: 'line-through' }}>{money(parseFloat(p.compare_at_price))}</span>}
            </div>
            {p.description && <p className="pv-desc">{p.description}</p>}
            <div className="pv-add">
              <button
                className="ps-sheet-cta"
                disabled={sold}
                onClick={() => { if (!sold) { addToBag(p); setSelectedProduct(null); setBagOpen(true); } }}
              >
                {sold ? 'Out of Stock' : <><ShoppingBag size={16} /> Add to Bag</>}
              </button>
              {store.whatsapp_phone && (
                <button className="ps-wa-cta" style={{ marginTop: 10 }}
                  onClick={() => handleWA(`Hi ${store.store_name}! I'd like to enquire about "${p.name}" (${money(parseFloat(p.price))}).`)}>
                  <WhatsAppIcon size={18} /> Enquire on WhatsApp
                </button>
              )}
            </div>
            <div className="pv-meta">
              <div><Truck size={15} /><span>Delivery available · Pickup at checkout</span></div>
              <div><ShieldCheck size={15} /><span>Secured by {appName} · Buyer protected</span></div>
              <div><RotateCcw size={15} /><span>Returns accepted · Check store policy</span></div>
            </div>
            {look.length > 0 && (
              <div className="pv-look">
                <div className="pv-look-h">You may also like</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {look.slice(0, 4).map(lp => {
                    const li = productImg(lp);
                    const li_idx = activeCategories.findIndex(c => c.id === lp.category_id);
                    return (
                      <button key={lp.id} className={`ps-card ${clr(li_idx)}`} style={{ aspectRatio: '1', cursor: 'pointer' }} onClick={() => setSelectedProduct(lp)}>
                        {li ? <img src={li} alt={lp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : <span style={{ color: 'rgba(255,255,255,.5)' }}><ShoppingBag size={20} /></span>}
                        <div className="ps-card-foot" style={{ padding: '6px 8px' }}>
                          <span className="ps-card-name" style={{ fontSize: 12 }}>{lp.name}</span>
                          <span className="ps-card-price" style={{ fontSize: 12 }}>{money(parseFloat(lp.price))}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Cart Drawer ─────────────────────────────────────────────────────────────
  const CartDrawer = () => (
    <>
      <div className="ps-overlay" onClick={() => setBagOpen(false)} />
      <div className="ps-sheet">
        <div className="ps-sheet-handle" />
        <div className="ps-sheet-head">
          <span className="ps-sheet-title">
            {checkoutStep === 'cart' ? `Your Bag (${bagCount})` : checkoutStep === 'details' ? 'Your Details' : 'Order Confirmed'}
          </span>
          <button className="ps-sheet-close" onClick={() => setBagOpen(false)}><X size={20} /></button>
        </div>
        <div className="ps-sheet-body">
          {checkoutStep === 'cart' && (
            bag.length === 0 ? (
              <div className="ps-bag-empty">
                <ShoppingBag size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                Your bag is empty
              </div>
            ) : (
              <>
                {bag.map(item => (
                  <div key={item.key} className="ps-bag-line">
                    <div className={`ps-bag-img ${clr(0)}`}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} />}
                    </div>
                    <div>
                      <b>{item.name}</b>
                      <span>{money(item.price)}</span>
                    </div>
                    <div className="ps-qty-row">
                      <button className="ps-qty-btn" onClick={() => updateQty(item.key, -1)}><Minus size={12} /></button>
                      <span>{item.qty}</span>
                      <button className="ps-qty-btn" onClick={() => updateQty(item.key, 1)}><Plus size={12} /></button>
                    </div>
                    <button className="ps-bag-rm" onClick={() => removeItem(item.key)}>Remove</button>
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="ps-bag-total">
                    <span>Subtotal</span><b>{money(bagTotal)}</b>
                  </div>
                  {deliveryMethod === 'delivery' && shippingPreview.shippingFee > 0 && (
                    <div className="ps-bag-total" style={{ fontSize: 13, color: 'var(--muted)' }}>
                      <span>Shipping</span><span>{money(shippingPreview.shippingFee)}</span>
                    </div>
                  )}
                  {deliveryMethod === 'delivery' && shippingPreview.handlingFee > 0 && (
                    <div className="ps-bag-total" style={{ fontSize: 13, color: 'var(--muted)' }}>
                      <span>Handling Fee</span><span>{money(shippingPreview.handlingFee)}</span>
                    </div>
                  )}
                  <div className="ps-bag-total" style={{ fontWeight: 800 }}>
                    <span>Total</span><b>{money(deliveryMethod === 'delivery' ? shippingPreview.total : bagTotal)}</b>
                  </div>
                </div>
                <button className="ps-sheet-cta" onClick={() => setCheckoutStep('details')}>Continue <ChevronRight size={16} /></button>
                <button className="ps-wa-cta" onClick={() => {
                  const lines = bag.map(b => `• ${b.name} ×${b.qty} — ${money(b.price * b.qty)}`).join('\n');
                  const grandTotal = deliveryMethod === 'delivery' ? shippingPreview.total : bagTotal;
                  handleWA(`Hi ${store.store_name}! I'd like to order:\n${lines}\n\nTotal: ${money(grandTotal)}`);
                }}>
                  <WhatsAppIcon size={18} /> Order via WhatsApp
                </button>
              </>
            )
          )}

          {checkoutStep === 'details' && (
            <>
              <div className="ps-field-lbl">Full Name *</div>
              <input className="ps-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your full name" />
              <div className="ps-field-lbl">Phone / WhatsApp *</div>
              <input className="ps-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+234..." type="tel" />
              <div className="ps-field-lbl">Email (optional)</div>
              <input className="ps-input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@example.com" type="email" />
              <div className="ps-field-lbl">Delivery Method</div>
              <select className="ps-input" value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as any)} style={{ cursor: 'pointer' }}>
                <option value="delivery">Delivery to my address</option>
                <option value="pickup">Pickup from store</option>
              </select>
              {deliveryMethod === 'delivery' && (
                <>
                  <div className="ps-field-lbl">Delivery Address</div>
                  <textarea className="ps-input" style={{ resize: 'vertical', minHeight: 72 }} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Full delivery address" />
                </>
              )}
               <div className="ps-field-lbl">Order Note (optional)</div>
              <textarea className="ps-input" style={{ resize: 'vertical', minHeight: 60 }} value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Sizes, colours, special instructions..." />
              
              {/* Coupon Form */}
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon || validatingCoupon}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      fontSize: 13,
                      background: 'var(--bg)',
                      textTransform: 'uppercase'
                    }}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCodeInput('');
                      }}
                      className="btn clickable"
                      style={{
                        padding: '8px 16px',
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: 8,
                        background: '#fde8e8',
                        color: '#e53e3e',
                        border: '1px solid #f8b4b4'
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCodeInput.trim()}
                      className="btn clickable"
                      style={{
                        padding: '8px 16px',
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: 8,
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        opacity: (!couponCodeInput.trim() || validatingCoupon) ? 0.6 : 1
                      }}
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p style={{ fontSize: 11, color: '#e53e3e', marginTop: 4, margin: 0 }}>{couponError}</p>
                )}
                {appliedCoupon && (
                  <p style={{ fontSize: 11, color: '#2f855a', marginTop: 4, margin: 0, fontWeight: 700 }}>
                    Coupon "{appliedCoupon.code}" applied: {appliedCoupon.discount_type === 'percentage' ? `${parseFloat(appliedCoupon.discount_value)}%` : money(parseFloat(appliedCoupon.discount_value))} discount
                  </p>
                )}
              </div>

              <div className="ps-deposit" style={{ marginBottom: 14 }}>
                <Lock size={12} /> Your details are used only for this order and protected by {appName}.
              </div>

              {(() => {
                let discountAmount = 0;
                if (appliedCoupon) {
                  if (appliedCoupon.discount_type === 'percentage') {
                    discountAmount = Math.round(bagTotal * (parseFloat(appliedCoupon.discount_value) / 100));
                  } else {
                    discountAmount = Math.round(parseFloat(appliedCoupon.discount_value));
                  }
                  discountAmount = Math.min(discountAmount, bagTotal);
                }
                const discountedSubtotal = Math.max(0, bagTotal - discountAmount);
                const finalTotal = deliveryMethod === 'delivery' ? (shippingPreview.total - discountAmount) : discountedSubtotal;

                return (
                  <>
                    <button className="ps-sheet-cta" disabled={checkoutLoading} onClick={submitOrder}>
                      {checkoutLoading ? 'Placing Order...' : `Place Order · ${money(finalTotal)}`}
                    </button>
                    <button className="ps-wa-cta" onClick={() => {
                      const lines = bag.map(b => `• ${b.name} ×${b.qty}`).join('\n');
                      handleWA(`Hi ${store.store_name}! Order:\n${lines}\n\nName: ${customerName}\nPhone: ${customerPhone}\nDelivery: ${deliveryMethod === 'pickup' ? 'Pickup' : deliveryAddress}${appliedCoupon ? `\nCoupon applied: ${appliedCoupon.code}` : ''}`);
                    }}>
                      <WhatsAppIcon size={18} /> Send via WhatsApp Instead
                    </button>
                  </>
                );
              })()}
            </>
          )}

          {checkoutStep === 'success' && orderReceipt && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2e7d32' }}>
                <Check size={28} />
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Order Confirmed!</div>
              <div style={{ fontSize: 13, color: '#6e545d', lineHeight: 1.6, marginBottom: 16 }}>
                Order #{orderReceipt.order?.order_number} placed. {store.store_name} will reach out shortly.
              </div>
              {orderReceipt.whatsapp_url && (
                <button className="ps-wa-cta" onClick={() => setPendingWaUrl(orderReceipt.whatsapp_url)}>
                  <WhatsAppIcon size={18} /> Track on WhatsApp
                </button>
              )}
              <button className="ps-sheet-cta" style={{ marginTop: 10 }} onClick={() => { setBagOpen(false); setCheckoutStep('cart'); setOrderReceipt(null); }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ─── Pages ───────────────────────────────────────────────────────────────────
  const HomePage = () => (
    <>
      {/* Hero */}
      <section className="ps-hero">
        {store.banner_url && <div className="ps-hero-bg" style={{ backgroundImage: `url(${store.banner_url})` }} />}
        <div className="ps-hero-content">
          <div className="ps-hero-tag"><Award size={12} /> {store.business_persona?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) || 'Fashion & Clothing'}</div>
          <h1 className="ps-hero-name">{store.store_name}</h1>
          {store.store_bio && <p className="ps-hero-bio">{store.store_bio}</p>}
          <div className="ps-hero-meta">
            {store.location && <span><MapPin size={12} /> {store.location}</span>}
            {store.rating && <span><Star size={12} fill="currentColor" /> {store.rating} ({store.review_count || reviews.length} reviews)</span>}
            {store.total_orders && <span><ShoppingBag size={12} /> {store.total_orders} orders</span>}
            {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && (
              <span><Clock size={12} /> Replies {replyFmt(store.reply_time_minutes!)}</span>
            )}
          </div>
          <div className="ps-hero-ctas">
            <button className="ps-hero-cta-primary" onClick={() => go('products')}>
              <ShoppingBag size={16} /> Shop Now
            </button>
            {store.whatsapp_phone && (
              <button className="ps-hero-cta-sec" onClick={() => handleWA(`Hi ${store.store_name}! I'd like to enquire about your products.`)}>
                <WhatsAppIcon size={16} /> WhatsApp Us
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="ps-trust-bar">
        <div className="ps-trust-item"><ShieldCheck size={14} /> Secure checkout</div>
        <div className="ps-trust-item"><Truck size={14} /> Fast delivery</div>
        <div className="ps-trust-item"><BadgeCheck size={14} /> Verified store</div>
        <div className="ps-trust-item"><RotateCcw size={14} /> Easy returns</div>
      </div>

      {/* Products preview */}
      {products.length > 0 && (
        <div className="ps-section">
          <div className="ps-section-head">
            <div>
              <div className="ps-eyebrow">Collection</div>
              <h2 className="ps-section-title">Latest Arrivals</h2>
            </div>
            <button className="ps-see-all" onClick={() => go('products')}>See all <ChevronRight size={14} /></button>
          </div>
          <div className="ps-cards-grid">
            {products.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* Portfolio preview */}
      {portfolio.length > 0 && (
        <div className="ps-section" style={{ background: 'var(--bg2)', margin: '0 -16px', padding: '40px 16px' }}>
          <div className="ps-section-head">
            <div>
              <div className="ps-eyebrow">Our Work</div>
              <h2 className="ps-section-title">Portfolio</h2>
            </div>
            <button className="ps-see-all" onClick={() => go('portfolio')}>See all <ChevronRight size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {portfolio.slice(0, 6).map((item, i) => (
              <div key={item.id} className={`pf-shot ${clr(i)}`} onClick={() => go('portfolio')}>
                {item.image_url && <img src={item.image_url} alt={item.label || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div className="pf-shot-cap">
                  {item.label && <b>{item.label}</b>}
                  {item.category && <span>{item.category}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews snippet */}
      {reviews.length > 0 && (
        <div className="ps-section">
          <div className="ps-section-head">
            <div>
              <div className="ps-eyebrow">Reviews</div>
              <h2 className="ps-section-title">What Customers Say</h2>
            </div>
            <button className="ps-see-all" onClick={() => go('reviews')}>See all <ChevronRight size={14} /></button>
          </div>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="rev-card" style={{ minWidth: 240, flex: '0 0 240px' }}>
                <div className="rev-card-head">
                  <div className="rev-av">{initials(r.reviewer_name)}</div>
                  <div className="rev-card-who">
                    <b>{r.reviewer_name}</b>
                    <div className="rev-card-stars">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'f' : ''} />)}
                    </div>
                  </div>
                </div>
                <p className="rev-card-text">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog preview */}
      {blog.length > 0 && (
        <div className="ps-section" style={{ background: 'var(--bg2)', margin: '0 -16px', padding: '40px 16px' }}>
          <div className="ps-section-head">
            <div>
              <div className="ps-eyebrow">Journal</div>
              <h2 className="ps-section-title">From the Studio</h2>
            </div>
            <button className="ps-see-all" onClick={() => go('blog')}>See all <ChevronRight size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {blog.slice(0, 3).map((b, i) => (
              <button key={b.id} className={`blog-card ${clr(i)}`} onClick={() => openPost(b)}>
                {b.image_url && <img src={b.image_url} alt={b.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                {b.category && <span className="blog-cat">{b.category}</span>}
                <div className="blog-card-info">
                  <b>{b.title}</b>
                  {b.excerpt && <span>{b.excerpt}</span>}
                  <span className="blog-meta">{b.read_time ? `${b.read_time} read` : ''} {fmtDate(b.published_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const ProductsPage = () => {
    if (products.length === 0) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <div className="ps-section">
      <div className="ps-eyebrow">Shop</div>
      <h2 className="ps-section-title">All Products</h2>
      <div className="ps-search-bar">
        <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products…" className="ps-search-input" />
        {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={14} /></button>}
      </div>
      {activeCategories.length > 0 && (
        <div className="ps-chips">
          <button className={`ps-chip${!activeCat ? ' on' : ''}`} onClick={() => setActiveCat(null)}>All</button>
          {activeCategories.map(c => (
            <button key={c.id} className={`ps-chip${activeCat === c.id ? ' on' : ''}`} onClick={() => setActiveCat(c.id)}>{c.name}</button>
          ))}
        </div>
      )}
      {filteredProducts.length > 0 ? (
        <div className="ps-cards-grid">{filteredProducts.map(p => selectedProduct?.id === p.id ? null : <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="ps-empty">
          <ShoppingBag size={40} />
          <div className="ps-empty-title">No products found</div>
          <div className="ps-empty-sub">Try a different search or category.</div>
        </div>
      )}
    </div>
  );
  };

  const PortfolioPage = () => {
    if (portfolio.length === 0) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <div className="ps-section">
      <div className="ps-eyebrow">Portfolio</div>
      <h2 className="ps-section-title">Our Work</h2>
      {pfCats.length > 1 && (
        <div className="ps-chips">
          {pfCats.map(c => <button key={c} className={`ps-chip${pfCat === c ? ' on' : ''}`} onClick={() => setPfCat(c)}>{c}</button>)}
        </div>
      )}
      {pfList.length > 0 ? (
        <div className="pf-grid">
          {pfList.map((item, i) => (
            <div key={item.id} className={`pf-shot ${clr(i)}`}>
              {item.image_url && <img src={item.image_url} alt={item.label || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              {item.is_before_after && <div className="pf-ba"><span className="pf-ba-h">Before</span><span className="pf-ba-h">After</span></div>}
              <div className="pf-shot-cap">
                {item.label && <b>{item.label}</b>}
                {item.category && <span>{item.category}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ps-empty"><Camera size={40} /><div className="ps-empty-title">No portfolio items yet</div></div>
      )}
    </div>
  );
  };

  const ReviewsPage = () => {
    if (reviews.length === 0) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <div className="ps-section">
      <div className="ps-eyebrow">Reviews</div>
      <h2 className="ps-section-title">Customer Reviews</h2>
      {avgRating && (
        <div className="rev-summary" style={{ marginBottom: 20 }}>
          <div className="rev-score">
            <b>{avgRating}</b>
            <div className="rev-score-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < parseFloat(avgRating) ? 'f' : ''} />)}</div>
            <i>{reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}</i>
          </div>
          <div className="ps-chips" style={{ marginTop: 12 }}>
            <button className={`ps-chip${revStar === 0 ? ' on' : ''}`} onClick={() => setRevStar(0)}>All</button>
            {[5, 4, 3, 2, 1].filter(s => reviews.some(r => r.rating === s)).map(s => (
              <button key={s} className={`ps-chip${revStar === s ? ' on' : ''}`} onClick={() => setRevStar(s)}>
                <Star size={11} className="f" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {revFiltered.length > 0 ? revFiltered.map(r => (
        <div key={r.id} className="rev-card" style={{ marginBottom: 14 }}>
          <div className="rev-card-head">
            <div className="rev-av">{initials(r.reviewer_name)}</div>
            <div className="rev-card-who">
              <b>{r.reviewer_name}</b>
              <span><div className="rev-verif"><BadgeCheck size={12} /> Verified</div></span>
            </div>
            <div className="rev-card-stars">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < r.rating ? 'f' : ''} />)}
            </div>
          </div>
          <p className="rev-card-text">{r.body}</p>
          {r.created_at && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{fmtDate(r.created_at)}</div>}
        </div>
      )) : (
        <div className="ps-empty"><Star size={40} /><div className="ps-empty-title">No reviews yet</div><div className="ps-empty-sub">Be the first to shop and leave a review.</div></div>
      )}
    </div>
  );
  };

  const BlogPage = () => {
    if (blog.length === 0) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <div className="ps-section">
      <div className="ps-eyebrow">Journal</div>
      <h2 className="ps-section-title">From the Studio</h2>
      {blogCats.length > 1 && (
        <div className="ps-chips">
          {blogCats.map(c => <button key={c} className={`ps-chip${blogCat === c ? ' on' : ''}`} onClick={() => setBlogCat(c)}>{c}</button>)}
        </div>
      )}
      {blogList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {blogList.map((b, i) => (
            <button key={b.id} className={`blog-card ${clr(i)}`} onClick={() => openPost(b)}>
              {b.image_url && <img src={b.image_url} alt={b.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              {b.category && <span className="blog-cat">{b.category}</span>}
              <div className="blog-card-info">
                <b>{b.title}</b>
                {b.excerpt && <span>{b.excerpt}</span>}
                <span className="blog-meta">{b.read_time ? `${b.read_time} read · ` : ''}{fmtDate(b.published_at)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="ps-empty"><Quote size={40} /><div className="ps-empty-title">No posts yet</div></div>
      )}
    </div>
  );
  };

  const PostPage = ({ p }: { p: BlogPost }) => (
    <div className="ps-section">
      <button className="art-back" onClick={() => go('blog')}><ChevronLeft size={16} /> Back to Journal</button>
      {p.image_url && (
        <div className={`art-hero ${clr(0)}`}>
          <img src={p.image_url} alt={p.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          {p.category && <span className="blog-cat">{p.category}</span>}
        </div>
      )}
      <h1 className="art-title" style={{ marginTop: 16 }}>{p.title}</h1>
      <div className="art-meta">
        {p.is_pseo ? (
          <><div className="art-meta-av">{initials(store.store_name)}</div>
            <span className="art-meta-by">{store.store_name}</span>
            <span>·</span></>
        ) : store.founder_name ? (
          <><div className="art-meta-av">{initials(store.founder_name)}</div>
            <span className="art-meta-by">{store.founder_name}</span>
            <span>·</span></>
        ) : (
          <><div className="art-meta-av">{initials(store.store_name)}</div>
            <span className="art-meta-by">{store.store_name}</span>
            <span>·</span></>
        )}
        {p.read_time && <span>{p.read_time} read</span>}
        {p.published_at && <span>· {fmtDate(p.published_at)}</span>}
      </div>
      <div className="art-body">
        {p.excerpt && <p>{p.excerpt}</p>}
        {Array.isArray(p.body) && p.body.map((block: any, i: number) => {
          if (block.p) return <p key={i}>{block.p}</p>;
          if (block.h) return <h3 key={i}>{block.h}</h3>;
          if (block.list) return <ul key={i}>{block.list.map((li: string, j: number) => <li key={j}>{li}</li>)}</ul>;
          return null;
        })}
      </div>
    </div>
  );

  const FaqPage = () => {
    if (faqs.length === 0) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <div className="ps-section">
      <div className="ps-eyebrow">FAQ</div>
      <h2 className="ps-section-title">Frequently Asked</h2>
      {faqs.length > 0 ? faqs.map(f => (
        <div key={f.id} className="faq-item">
          <button className="faq-q" onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}>
            <span>{f.question}</span>
            {openFaq === f.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {openFaq === f.id && <div className="faq-a">{f.answer}</div>}
        </div>
      )) : (
        <div className="ps-empty">
          <div className="ps-empty-sub">Questions? Reach out via WhatsApp.</div>
          {store.whatsapp_phone && (
            <button className="ps-wa-cta" style={{ marginTop: 16 }} onClick={() => handleWA(`Hi ${store.store_name}! I have a question.`)}>
              <WhatsAppIcon size={18} /> Chat with Us
            </button>
          )}
        </div>
      )}
      {store.whatsapp_phone && faqs.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="faq-help">
            <b>Still have questions?</b>
            <p>Can't find what you're looking for? Chat with us directly.</p>
            <button className="faq-help-cta" onClick={() => handleWA(`Hi ${store.store_name}! I have a question.`)}>
              <WhatsAppIcon size={16} /> Chat on WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
  };

  const AboutPage = () => {
    if (!store.store_bio && !store.founder_bio) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <>
        <div className="ab-hero">
        {store.banner_url && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="ab-av" style={{ objectFit: 'contain' }} />
          ) : (
            <div className="ab-av">{initials(store.store_name)}</div>
          )}
          <h1 className="ab-store-name">{store.store_name}</h1>
          {store.business_persona && <div className="ab-persona">{store.business_persona.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}</div>}
          {store.founder_quote && <div className="ab-quote"><Quote size={16} /> {store.founder_quote}</div>}
        </div>
      </div>
      <div className="ps-section">
        <div className="ps-eyebrow">About</div>
        <h2 className="ps-section-title">{store.store_name}</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 24 }}>
          {store.founder_bio || store.store_bio || `${store.store_name} is a verified store on ${appName}.`}
        </p>
        {/* Founder card */}
        {store.founder_name && (
          <div className="ab-founder-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {store.founder_avatar_url ? (
                <img src={store.founder_avatar_url} alt={store.founder_name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(150deg, var(--brand), var(--brand-deep))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{initials(store.founder_name)}</div>
              )}
              <div>
                <b style={{ fontSize: 16, fontWeight: 700 }}>{store.founder_name}</b>
                {store.founder_role && <div style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 600, marginTop: 2 }}>{store.founder_role}</div>}
                {store.founder_specialities && store.founder_specialities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {store.founder_specialities.map((s, i) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 600, background: '#e7f1ec', color: 'var(--brand-deep)', padding: '3px 9px', borderRadius: 7 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* About facts */}
        {store.about_facts && store.about_facts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
            {store.about_facts.map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 14px', borderBottom: i < (store.about_facts?.length || 0) - 1 ? '1px solid var(--line)' : 'none', fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: 'var(--ink)', flexBasis: '40%' }}>{k}</span>
                <span style={{ color: 'var(--muted)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {/* Recognition */}
        {store.recognition && store.recognition.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div className="ps-eyebrow" style={{ marginBottom: 12 }}>As Seen In</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {store.recognition.map((r, i) => (
                <span key={i} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--brand-deep)' }}>{r}</span>
              ))}
            </div>
          </div>
        )}
        {/* Location / contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
          {store.location && <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
            <MapPin size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>{store.location}</span></div>}
          {store.since && <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
            <Award size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>Established {store.since}</span></div>}
          <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center' }}>
            <ShieldCheck size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>Verified store on {appName} · Buyer protected</span></div>
        </div>
        {store.whatsapp_phone && (
          <button className="ps-wa-cta" onClick={() => handleWA(`Hi ${store.store_name}! I'd like to get in touch.`)}>
            <WhatsAppIcon size={18} /> Chat with {store.store_name}
          </button>
        )}
      </div>
    </>
  );
  };

  const ContactPage = () => {
    const [cName, setCName] = useState('');
    const [cMsg, setCMsg] = useState('');
    if (!store.whatsapp_phone && !store.email && !store.location && !store.address) {
      return (
        <div className="ps-section">
          <div className="ps-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
            Nothing to see here, comeback later
          </div>
        </div>
      );
    }
    return (
      <div className="ps-section">
        <div className="ps-eyebrow">Contact</div>
        <h2 className="ps-section-title">Get in Touch</h2>
        {store.whatsapp_phone && (
          <button className="ps-wa-cta" style={{ marginBottom: 20 }}
            onClick={() => handleWA(`Hi ${store.store_name}! I'd like to get in touch.`)}>
            <WhatsAppIcon size={18} /> Chat on WhatsApp
          </button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
          {store.whatsapp_phone && <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
            <WhatsAppIcon size={16} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>{store.whatsapp_phone}</span></div>}
          {store.email && <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
            <Mail size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>{store.email}</span></div>}
          {store.location && <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderBottom: (store.address ? true : false) ? '1px solid var(--line)' : 'none' }}>
            <MapPin size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>{store.location}</span></div>}
          {store.address && <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center' }}>
            <Store size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'var(--muted)' }}>{store.address}</span></div>}
        </div>
        {/* Simple contact form */}
        <div className="ct-form">
          <div className="ab-subhead" style={{ marginBottom: 4 }}>Send a message</div>
          <p className="ct-form-sub">We'll reply on WhatsApp as soon as possible.</p>
          <input className="ct-input" placeholder="Your name" value={cName} onChange={e => setCName(e.target.value)} />
          <textarea className="ct-input ct-textarea" placeholder="Your message" value={cMsg} onChange={e => setCMsg(e.target.value)} />
          <button className="ct-send" onClick={() => {
            if (cName && cMsg) { handleWA(`Hi ${store.store_name}, I'm ${cName}.\n\n${cMsg}`); }
            else ping('Please enter your name and message');
          }}>
            <WhatsAppIcon size={16} /> Send via WhatsApp
          </button>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (selectedProduct && (page === 'products' || page === 'home')) return <ProductDetail p={selectedProduct} />;
    if (post && page === 'post') return <PostPage p={post} />;
    switch (page) {
      case 'products': return <ProductsPage />;
      case 'portfolio': return <PortfolioPage />;
      case 'reviews': return <ReviewsPage />;
      case 'blog': return <BlogPage />;
      case 'faq': return <FaqPage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };

  // ─── Root render ─────────────────────────────────────────────────────────────
  return (
    <div className="fs-fashion-root">
      <style dangerouslySetInnerHTML={{ __html: FASHION_CSS }} />

      <WhatsAppDisclaimerModal
        open={!!pendingWaUrl}
        storeName={store.store_name}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)}
      />

      {/* Announcement */}
      {!annOff && (store.announcement_title || store.announcement_body) && (
        <div className="ps-ann">
          <span className="ps-ann-text"><b>{store.announcement_title || "Announcement"}</b>{store.announcement_body && ` · ${store.announcement_body}`}</span>
          <button className="ps-ann-close" onClick={() => setAnnOff(true)} aria-label="Dismiss announcement"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <header className="ps-header">
        <button className="ps-logo" onClick={() => go('home')}>
          {store.logo_url
            ? <img src={store.logo_url} alt={store.store_name} style={{ height: 32, objectFit: 'contain' }} />
            : <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>{store.store_name}</span>}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {store.is_verified && <BadgeCheck size={18} style={{ color: 'var(--brand)' }} />}
          <button className="ps-icon-btn" onClick={() => setBagOpen(true)} aria-label="Open bag">
            <ShoppingBag size={20} />
            {bagCount > 0 && <span className="ps-bag-badge">{bagCount}</span>}
          </button>
          {store.whatsapp_phone && (
            <button className="ps-icon-btn" onClick={() => handleWA(`Hi ${store.store_name}!`)} aria-label="WhatsApp">
              <WhatsAppIcon size={20} />
            </button>
          )}
          <button className="ps-icon-btn" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={20} /></button>
        </div>
      </header>

      {/* Nav tab bar */}
      <div className="ps-tabbar">
        {navItems.map(([key, label]) => (
          <button key={key} className={`ps-tab${page === key ? ' active' : ''}`} onClick={() => go(key)}>{label}</button>
        ))}
      </div>

      {/* Drawer */}
      {drawer && (
        <>
          <div className="ps-overlay" onClick={() => setDrawer(false)} />
          <div className="ps-drawer">
            <div className="ps-drawer-head">
              <span style={{ fontWeight: 700 }}>{store.store_name}</span>
              <button onClick={() => setDrawer(false)}><X size={20} /></button>
            </div>
            <nav className="ps-drawer-nav">
              {navItems.map(([key, label]) => (
                <button key={key} className={`ps-drawer-item${page === key ? ' active' : ''}`} onClick={() => go(key)}>
                  {label} <ChevronRight size={15} />
                </button>
              ))}
            </nav>
            <div className="ps-drawer-socials">
              {store.instagram_handle && (
                <button onClick={() => window.open(`https://instagram.com/${store.instagram_handle?.replace('@', '')}`, '_blank')}><InstagramIcon size={20} /></button>
              )}
              {store.tiktok_handle && (
                <button onClick={() => window.open(`https://tiktok.com/${store.tiktok_handle}`, '_blank')}><TikTokIcon size={20} /></button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="ps-main">{renderPage()}</main>

      {/* Footer */}
      <footer className="ps-footer">
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{store.store_name}</div>
        <div className="ps-footer-links">
          {navItems.map(([key, label]) => (
            <span key={key} className="ps-footer-link" onClick={() => go(key)}>{label}</span>
          ))}
        </div>
        <div className="ps-footer-socials">
          {store.instagram_handle && (
            <button onClick={() => window.open(`https://instagram.com/${store.instagram_handle?.replace('@', '')}`, '_blank')} aria-label="Instagram"><InstagramIcon size={20} /></button>
          )}
          {store.tiktok_handle && (
            <button onClick={() => window.open(`https://tiktok.com/${store.tiktok_handle}`, '_blank')} aria-label="TikTok"><TikTokIcon size={20} /></button>
          )}
        </div>
        <div className="ps-footer-trust"><ShieldCheck size={13} /> Powered by {appName} · Buyer Protected</div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,.3)' }}>© {new Date().getFullYear()} {store.store_name}. All rights reserved.</div>
      </footer>

      {/* Sheets */}
      {bagOpen && <CartDrawer />}

      {/* Toast */}
      {toastMsg && (
        <div className="ps-toast">{toastMsg}</div>
      )}
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const FASHION_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap');

.fs-fashion-root *, .fs-fashion-root *::before, .fs-fashion-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
.fs-fashion-root {
  --brand: #1d7a5e;
  --brand-deep: #0d4a38;
  --gold: #b07c3a;
  --ok: #1f7a4d;
  --ink: #2a1f16;
  --muted: #7a6358;
  --bg: #fdf8f4;
  --bg2: #f5ede6;
  --card: #fff;
  --line: #e8ddd7;
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── Announcement ── */
.ps-ann { background: var(--ink); color: rgba(255,255,255,.9); display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; gap: 10px; font-size: 12.5px; }
.ps-ann-text b { color: var(--gold); }
.ps-ann-close { background: none; border: none; color: rgba(255,255,255,.5); cursor: pointer; }

/* ── Header ── */
.ps-header { position: sticky; top: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 54px; backdrop-filter: blur(12px); }
.ps-logo { background: none; border: none; cursor: pointer; font-size: 17px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.ps-icon-btn { background: none; border: none; cursor: pointer; color: var(--ink); padding: 7px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background .15s; position: relative; }
.ps-icon-btn:hover { background: var(--bg2); }
.ps-bag-badge { position: absolute; top: 1px; right: 1px; background: var(--brand); color: #fff; font-size: 9px; font-weight: 800; width: 15px; height: 15px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* ── Tab bar ── */
.ps-tabbar { position: sticky; top: 54px; z-index: 99; background: var(--card); border-bottom: 1px solid var(--line); display: flex; overflow-x: auto; padding: 0 12px; }
.ps-tabbar::-webkit-scrollbar { display: none; }
.ps-tab { background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); padding: 12px 14px; white-space: nowrap; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; }
.ps-tab.active, .ps-tab:hover { color: var(--brand); border-bottom-color: var(--brand); }

/* ── Drawer ── */
.ps-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(42,31,22,.45); backdrop-filter: blur(2px); }
.ps-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 201; background: var(--card); width: 280px; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,.15); }
.ps-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--line); }
.ps-drawer-head button { background: none; border: none; cursor: pointer; color: var(--muted); }
.ps-drawer-nav { flex: 1; overflow-y: auto; padding: 8px; }
.ps-drawer-item { display: flex; align-items: center; justify-content: space-between; width: 100%; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--ink); padding: 12px 11px; border-radius: 10px; transition: background .12s; }
.ps-drawer-item:hover, .ps-drawer-item.active { background: #e7f1ec; color: var(--brand); }
.ps-drawer-socials { display: flex; gap: 10px; padding: 14px 18px; border-top: 1px solid var(--line); }
.ps-drawer-socials button { background: none; border: none; cursor: pointer; color: var(--muted); }

/* ── Sheet (cart/checkout) ── */
.ps-sheet { position: fixed; bottom: 0; left: 0; right: 0; z-index: 201; background: var(--card); border-radius: 18px 18px 0 0; max-height: 92vh; overflow-y: auto; }
@media(min-width:600px) { .ps-sheet { left: auto; right: 0; top: 0; bottom: 0; width: 420px; border-radius: 0; max-height: 100vh; } }
.ps-sheet-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--line); margin: 10px auto 0; }
.ps-sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.ps-sheet-title { font-size: 15px; font-weight: 700; }
.ps-sheet-close { background: none; border: none; cursor: pointer; color: var(--muted); }
.ps-sheet-body { padding: 18px; }
.ps-sheet-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--brand); color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700; padding: 14px; border-radius: 13px; margin-top: 14px; box-shadow: 0 6px 16px rgba(29,122,94,.28); transition: opacity .15s; }
.ps-sheet-cta:hover { opacity: .9; }
.ps-sheet-cta:disabled { opacity: .5; cursor: not-allowed; }
.ps-wa-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #25d366; color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700; padding: 13px; border-radius: 13px; margin-top: 10px; transition: opacity .15s; }
.ps-wa-cta:hover { opacity: .9; }

/* ── Bag items ── */
.ps-bag-empty { text-align: center; color: var(--muted); padding: 32px; font-size: 14px; }
.ps-bag-line { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.ps-bag-img { width: 52px; height: 64px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; color: rgba(255,255,255,.6); }
.ps-bag-line > div:nth-child(2) { flex: 1; }
.ps-bag-line > div:nth-child(2) b { display: block; font-size: 13px; font-weight: 600; }
.ps-bag-line > div:nth-child(2) span { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
.ps-qty-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.ps-qty-btn { background: var(--bg2); border: 1px solid var(--line); border-radius: 7px; cursor: pointer; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: var(--ink); }
.ps-qty-row > span { font-size: 14px; font-weight: 700; min-width: 18px; text-align: center; }
.ps-bag-rm { background: none; border: none; cursor: pointer; font-size: 11px; font-weight: 600; color: var(--muted); flex-shrink: 0; }
.ps-bag-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 14px; border-top: 1px solid var(--line); margin-top: 4px; }
.ps-bag-total b { font-weight: 700; }

/* ── Inputs ── */
.ps-field-lbl { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 14px 0 5px; }
.ps-input { width: 100%; background: var(--bg); border: 1px solid var(--line); border-radius: 11px; padding: 11px 13px; font-size: 14px; color: var(--ink); font-family: inherit; outline: none; transition: border-color .15s; }
.ps-input:focus { border-color: var(--brand); }
.ps-deposit { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--muted); line-height: 1.5; margin: 6px 0; }

/* ── Main ── */
.ps-main { min-height: 60vh; }

/* ── Hero ── */
.ps-hero { position: relative; background: linear-gradient(150deg, #1a1612 0%, #2d2520 50%, #3d3028 100%); color: #fff; min-height: 360px; display: flex; flex-direction: column; justify-content: flex-end; padding: 48px 20px 32px; overflow: hidden; }
.ps-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: .3; }
.ps-hero-content { position: relative; z-index: 1; }
.ps-hero-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(176,124,58,.2); border: 1px solid rgba(176,124,58,.4); color: var(--gold); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; }
.ps-hero-name { font-family: 'Fraunces', serif; font-size: clamp(32px, 8vw, 54px); font-weight: 600; line-height: 1.06; margin-bottom: 10px; letter-spacing: -.02em; }
.ps-hero-bio { font-size: 14px; color: rgba(255,255,255,.7); max-width: 480px; margin-bottom: 14px; line-height: 1.7; }
.ps-hero-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; font-size: 12px; color: rgba(255,255,255,.6); }
.ps-hero-meta span { display: flex; align-items: center; gap: 5px; }
.ps-hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
.ps-hero-cta-primary { background: #fff; color: var(--ink); border: none; cursor: pointer; font-size: 12.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 13px 22px; border-radius: 10px; display: flex; align-items: center; gap: 8px; transition: opacity .15s; }
.ps-hero-cta-primary:hover { opacity: .88; }
.ps-hero-cta-sec { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.3); color: #fff; cursor: pointer; font-size: 12.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 13px 20px; border-radius: 10px; display: flex; align-items: center; gap: 8px; transition: background .15s; }
.ps-hero-cta-sec:hover { background: rgba(255,255,255,.2); }

/* ── Trust bar ── */
.ps-trust-bar { background: var(--card); border-bottom: 1px solid var(--line); padding: 10px 16px; display: flex; gap: 20px; overflow-x: auto; justify-content: center; }
.ps-trust-bar::-webkit-scrollbar { display: none; }
.ps-trust-item { display: flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 11.5px; font-weight: 600; color: var(--muted); }
.ps-trust-item svg { color: var(--brand); }

/* ── Section ── */
.ps-section { padding: 32px 16px; max-width: 960px; margin: 0 auto; }
.ps-section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; }
.ps-eyebrow { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--brand); margin-bottom: 4px; }
.ps-section-title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600; letter-spacing: -.02em; line-height: 1.1; }
.ps-see-all { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: var(--brand); background: none; border: none; cursor: pointer; }

/* ── Product cards ── */
.ps-cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media(min-width:600px) { .ps-cards-grid { grid-template-columns: repeat(3, 1fr); } }
@media(min-width:900px) { .ps-cards-grid { grid-template-columns: repeat(4, 1fr); } }
.ps-card { position: relative; aspect-ratio: 4/5; border-radius: 16px; overflow: hidden; cursor: pointer; border: none; display: flex; align-items: flex-end; transition: transform .15s, box-shadow .15s; }
.ps-card:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(13,74,56,.18); }
.ps-card.c0 { background: linear-gradient(150deg, var(--brand), var(--brand-deep)); }
.ps-card.c1 { background: linear-gradient(150deg, var(--brand-deep), var(--gold)); }
.ps-card.c2 { background: linear-gradient(150deg, #caa06f, var(--brand)); }
.ps-card.c3 { background: linear-gradient(150deg, var(--brand), #a86b8a); }
.ps-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.55), transparent 48%); z-index: 1; }
.ps-card-foot { position: relative; z-index: 2; padding: 10px 12px; width: 100%; text-align: left; }
.ps-card-cat { display: block; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: rgba(255,255,255,.7); }
.ps-card-name { display: block; font-size: 13.5px; font-weight: 700; color: #fff; line-height: 1.2; margin: 2px 0; }
.ps-card-price { display: block; font-family: 'Fraunces', serif; font-size: 15px; font-weight: 700; color: #fff; }
.ps-card-icn { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.45); z-index: 0; }
.ps-badge { position: absolute; top: 10px; left: 10px; z-index: 3; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 4px 9px; border-radius: 8px; }
.ps-badge--sold { background: rgba(0,0,0,.55); color: rgba(255,255,255,.85); }
.ps-badge--sale { background: #c44; color: #fff; }

/* ── Filters ── */
.ps-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.ps-chip { background: var(--card); border: 1px solid var(--line); border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 500; padding: 7px 14px; transition: all .15s; color: var(--muted); }
.ps-chip.on, .ps-chip:hover { background: var(--brand); color: #fff; border-color: var(--brand); }

/* ── Search ── */
.ps-search-bar { display: flex; align-items: center; gap: 10px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 11px 14px; margin-bottom: 16px; }
.ps-search-input { flex: 1; border: none; background: none; outline: none; font-family: inherit; font-size: 14px; color: var(--ink); }
.ps-search-input::placeholder { color: var(--muted); }

/* ── Empty state ── */
.ps-empty { text-align: center; padding: 52px 20px; color: var(--muted); }
.ps-empty svg { margin: 0 auto 14px; display: block; color: var(--line); }
.ps-empty-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
.ps-empty-sub { font-size: 13.5px; }

/* ── Product detail ── */
.pv { padding: 16px; max-width: 960px; margin: 0 auto; }
.pv-back { display: inline-flex; align-items: center; gap: 5px; font-size: 13.5px; font-weight: 700; color: var(--brand); background: none; border: none; cursor: pointer; margin-bottom: 16px; }
.pv-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media(min-width:700px) { .pv-grid { grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: start; } }
.pv-main { position: relative; aspect-ratio: 4/5; border-radius: 18px; overflow: hidden; display: grid; place-items: center; border: 2px solid transparent; }
.pv-main.c0 { background: linear-gradient(150deg, var(--brand), var(--brand-deep)); }
.pv-main.c1 { background: linear-gradient(150deg, var(--brand-deep), var(--gold)); }
.pv-main.c2 { background: linear-gradient(150deg, #caa06f, var(--brand)); }
.pv-main.c3 { background: linear-gradient(150deg, var(--brand), #a86b8a); }
.pv-main-icn { color: rgba(255,255,255,.5); }
.pv-tag { position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #fff; background: rgba(0,0,0,.32); padding: 5px 10px; border-radius: 8px; }
.pv-cat { position: absolute; bottom: 12px; left: 12px; font-size: 11px; font-weight: 700; color: #fff; background: rgba(0,0,0,.3); padding: 4px 10px; border-radius: 8px; }
.pv-thumbs { display: flex; gap: 10px; margin-top: 10px; }
.pv-thumb { width: 64px; height: 80px; border-radius: 11px; border: none; cursor: pointer; }
.pv-thumb.c0 { background: linear-gradient(150deg, var(--brand), var(--brand-deep)); }
.pv-thumb.c1 { background: linear-gradient(150deg, var(--brand-deep), var(--gold)); }
.pv-thumb.c2 { background: linear-gradient(150deg, #caa06f, var(--brand)); }
.pv-thumb.c3 { background: linear-gradient(150deg, var(--brand), #a86b8a); }
.pv-infocat { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.pv-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 28px; line-height: 1.1; margin: 5px 0 8px; }
.pv-price { font-size: 20px; font-weight: 800; display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.pv-approx { font-size: 14px; font-weight: 500; color: var(--muted); }
.pv-desc { font-size: 14.5px; line-height: 1.65; color: #5a4a40; margin: 12px 0; }
.pv-add { margin-top: 20px; }
.pv-meta { margin-top: 20px; display: flex; flex-direction: column; gap: 11px; border-top: 1px solid var(--line); padding-top: 16px; }
.pv-meta > div { display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; color: #5a534d; line-height: 1.45; }
.pv-meta svg { flex: none; color: var(--brand-deep); margin-top: 1px; }
.pv-look { margin-top: 28px; }
.pv-look-h { font-family: 'Fraunces', serif; font-weight: 600; font-size: 18px; margin-bottom: 12px; }

/* ── Portfolio ── */
.pf-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }
@media(min-width:600px) { .pf-grid { grid-template-columns: repeat(3, 1fr); } }
.pf-shot { position: relative; aspect-ratio: 4/5; border-radius: 14px; overflow: hidden; cursor: pointer; display: block; transition: transform .12s, box-shadow .12s; }
.pf-shot:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(13,74,56,.16); }
.pf-shot::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(40,12,24,.5), transparent 46%); z-index: 1; }
.pf-shot.c0 { background: linear-gradient(150deg, var(--brand-deep), var(--brand)); }
.pf-shot.c1 { background: linear-gradient(150deg, var(--brand), var(--gold)); }
.pf-shot.c2 { background: linear-gradient(150deg, #caa06f, var(--brand-deep)); }
.pf-shot.c3 { background: linear-gradient(150deg, var(--brand), #a86b8a); }
.pf-ba { position: absolute; top: 10px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 10px; z-index: 2; }
.pf-ba-h { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: #fff; background: rgba(60,20,36,.42); padding: 3px 8px; border-radius: 10px; }
.pf-shot-cap { position: absolute; left: 12px; bottom: 11px; z-index: 2; }
.pf-shot-cap b { display: block; font-size: 13px; font-weight: 700; color: #fff; }
.pf-shot-cap span { font-size: 11px; color: rgba(255,255,255,.85); }

/* ── Reviews ── */
.rev-summary { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.rev-score { text-align: center; padding-bottom: 14px; border-bottom: 1px solid var(--line); margin-bottom: 12px; }
.rev-score b { font-family: 'Fraunces', serif; font-size: 40px; font-weight: 700; color: var(--brand-deep); line-height: 1; }
.rev-score-stars { display: flex; gap: 2px; justify-content: center; margin: 5px 0 3px; }
.rev-score-stars .f, .rev-card-stars .f, .rev-rate .f { color: var(--gold); fill: var(--gold); }
.rev-score i { font-size: 12px; color: var(--muted); font-style: normal; }
.rev-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 16px; }
.rev-card-head { display: flex; align-items: flex-start; gap: 11px; margin-bottom: 10px; }
.rev-av { width: 40px; height: 40px; border-radius: 50%; flex: 0 0 auto; background: linear-gradient(150deg, var(--brand), var(--brand-deep)); color: #fff; font-weight: 700; font-size: 15px; display: grid; place-items: center; }
.rev-card-who { flex: 1; }
.rev-card-who > b { font-size: 14px; font-weight: 700; display: block; }
.rev-card-who > span { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.rev-verif { display: inline-flex; align-items: center; gap: 4px; color: var(--ok); font-weight: 700; }
.rev-card-stars { display: flex; gap: 2px; }
.rev-card-stars svg { color: #e0d2cb; }
.rev-card-text { font-size: 13.5px; line-height: 1.55; color: #4f3f46; }

/* ── Blog ── */
.blog-card { position: relative; border-radius: 16px; overflow: hidden; min-height: 160px; display: flex; align-items: flex-end; border: none; cursor: pointer; transition: transform .12s; }
.blog-card:hover { transform: translateY(-2px); }
.blog-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.6), transparent 50%); z-index: 1; }
.blog-card.c0 { background: linear-gradient(150deg, var(--brand-deep), var(--brand)); }
.blog-card.c1 { background: linear-gradient(150deg, var(--brand), var(--gold)); }
.blog-card.c2 { background: linear-gradient(150deg, #caa06f, var(--brand-deep)); }
.blog-card.c3 { background: linear-gradient(150deg, var(--brand), #a86b8a); }
.blog-cat { position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--brand-deep); background: rgba(255,255,255,.92); padding: 4px 9px; border-radius: 7px; }
.blog-card-info { position: relative; z-index: 2; padding: 14px; text-align: left; width: 100%; }
.blog-card-info b { display: block; font-size: 15px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 4px; }
.blog-card-info > span { display: block; font-size: 12.5px; color: rgba(255,255,255,.75); line-height: 1.4; margin-bottom: 6px; }
.blog-meta { font-size: 11px; color: rgba(255,255,255,.55); }

/* ── Article ── */
.art-back { display: inline-flex; align-items: center; gap: 5px; background: none; border: none; color: var(--brand); font-weight: 700; font-size: 13.5px; cursor: pointer; padding: 4px 0; margin-bottom: 14px; }
.art-hero { position: relative; aspect-ratio: 16/9; border-radius: 18px; overflow: hidden; margin-bottom: 18px; }
.art-hero.c0 { background: linear-gradient(150deg, var(--brand-deep), var(--brand)); }
.art-hero.c1 { background: linear-gradient(150deg, var(--brand), var(--gold)); }
.art-title { font-family: 'Fraunces', serif; font-weight: 700; font-size: 28px; line-height: 1.12; letter-spacing: -.02em; }
.art-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; font-size: 12.5px; color: var(--muted); margin: 12px 0 22px; }
.art-meta-av { width: 28px; height: 28px; border-radius: 50%; background: var(--brand); color: #fff; font-weight: 800; font-size: 12px; display: grid; place-items: center; }
.art-meta-by { font-weight: 700; color: var(--ink); }
.art-body p { font-size: 15px; line-height: 1.72; color: var(--ink); margin-bottom: 16px; }
.art-body h3 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 20px; color: var(--ink); margin: 24px 0 10px; }
.art-body ul { list-style: none; margin: 0 0 16px; display: flex; flex-direction: column; gap: 9px; }
.art-body li { position: relative; padding-left: 22px; font-size: 14.5px; line-height: 1.6; color: var(--ink); }
.art-body li::before { content: ''; position: absolute; left: 4px; top: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }

/* ── FAQ ── */
.faq-item { border-bottom: 1px solid var(--line); }
.faq-q { background: none; border: none; cursor: pointer; width: 100%; text-align: left; font-family: inherit; font-size: 14px; font-weight: 600; color: var(--ink); display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 16px 0; }
.faq-a { font-size: 13.5px; color: var(--muted); line-height: 1.7; padding-bottom: 14px; }
.faq-help { background: #e7f1ec; border: 1px solid #cfe4d8; border-radius: 16px; padding: 18px; }
.faq-help b { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; display: block; margin-bottom: 6px; }
.faq-help p { font-size: 13px; color: #6e545d; line-height: 1.5; margin-bottom: 14px; }
.faq-help-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--brand); color: #fff; border: none; cursor: pointer; font-weight: 700; font-size: 14px; padding: 12px; border-radius: 11px; }

/* ── About hero ── */
.ab-hero { position: relative; background: linear-gradient(150deg, var(--ink), #2d2520); color: #fff; padding: 40px 20px; text-align: center; overflow: hidden; }
.ab-av { width: 76px; height: 76px; border-radius: 50%; background: var(--brand); color: #fff; font-family: 'Fraunces', serif; font-weight: 700; font-size: 26px; display: grid; place-items: center; margin: 0 auto 14px; border: 3px solid var(--gold); }
.ab-store-name { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.ab-persona { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
.ab-quote { font-family: 'Fraunces', serif; font-style: italic; font-size: 17px; opacity: .85; line-height: 1.5; max-width: 480px; margin: 0 auto; display: flex; align-items: flex-start; gap: 8px; }
.ab-founder-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.ab-subhead { font-family: 'Fraunces', serif; font-weight: 600; font-size: 20px; }

/* ── Contact form ── */
.ct-form { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 20px; }
.ct-form-sub { font-size: 13px; color: #5f4d55; line-height: 1.5; margin-bottom: 14px; }
.ct-input { width: 100%; font-family: inherit; font-size: 14px; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 11px; padding: 12px 13px; outline: none; margin-bottom: 10px; }
.ct-input::placeholder { color: #a78d97; }
.ct-input:focus { border-color: var(--brand); }
.ct-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
.ct-send { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--brand); color: #fff; font-weight: 700; font-size: 14px; padding: 13px; border-radius: 11px; border: none; cursor: pointer; }

/* ── Footer ── */
.ps-footer { background: var(--ink); color: rgba(255,255,255,.6); padding: 32px 20px; text-align: center; font-size: 12px; }
.ps-footer-links { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; margin-bottom: 14px; }
.ps-footer-link { color: rgba(255,255,255,.45); text-decoration: none; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; transition: color .15s; }
.ps-footer-link:hover { color: #fff; }
.ps-footer-socials { display: flex; justify-content: center; gap: 14px; margin-bottom: 16px; }
.ps-footer-socials button { background: none; border: none; cursor: pointer; color: rgba(255,255,255,.5); transition: color .15s; }
.ps-footer-socials button:hover { color: #fff; }
.ps-footer-trust { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11.5px; color: rgba(255,255,255,.35); margin-bottom: 6px; }

/* ── Toast ── */
.ps-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--ink); color: #fff; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 500; white-space: nowrap; box-shadow: 0 6px 20px rgba(0,0,0,.25); animation: ps-toast-in .2s ease; }
@keyframes ps-toast-in { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

@media(min-width:700px) {
  .ps-hero { min-height: 460px; padding: 64px 40px 48px; }
  .ps-section { padding: 40px 32px; }
  .ps-tabbar { padding: 0 24px; }
}
`;
