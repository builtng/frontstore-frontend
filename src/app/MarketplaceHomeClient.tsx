'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import ThemeToggle from "../components/ThemeToggle";
import {
  Menu, X, Search, MapPin, ChevronDown, Heart, Star, ShieldCheck,
  Receipt, Truck, Sparkles, Clock, Flame, Store, BadgeCheck,
  ChevronRight, Home, LayoutGrid, User, Bookmark, ArrowRight,
  MessageCircle, Plus, Minus, SlidersHorizontal, Package, Bell,
  CreditCard, Settings, LogOut, ChevronLeft, TrendingUp,
  ShoppingBag, Globe, Lock, HelpCircle, Edit3, Camera,
  CheckCircle, AlertCircle, Trash2, Loader2
} from "lucide-react";

/* ─── TOKENS & REGIONS ───────────────────────────── */
const MARKETS = [
  { code:"NG", label:"Nigeria",      ccy:"NGN", symbol:"₦",   perNgn:1       },
  { code:"GH", label:"Ghana",        ccy:"GHS", symbol:"GH₵", perNgn:0.0077  },
  { code:"KE", label:"Kenya",        ccy:"KES", symbol:"KSh", perNgn:0.084   },
  { code:"ZA", label:"South Africa", ccy:"ZAR", symbol:"R",   perNgn:0.0116  },
  { code:"GB", label:"United Kingdom",ccy:"GBP", symbol:"£",  perNgn:0.00049 },
  { code:"US", label:"United States",ccy:"USD", symbol:"$",   perNgn:0.00062 },
];
const ccyToNgn = { NGN:1, GHS:130, KES:11.9, ZAR:86, GBP:2040, USD:1610 };

// Live exchange rates (NGN-based: liveRates[CCY] = units of CCY per 1 NGN), populated from a rates API on mount.
// Falls back to the static estimates above (ccyToNgn / MARKETS[].perNgn) until they load or if the fetch fails.
let liveRates: Record<string, number> | null = null;
const ngnPerUnit = (ccy: string) => (liveRates?.[ccy] ? 1 / liveRates[ccy] : (ccyToNgn[ccy as keyof typeof ccyToNgn] || 1));
const unitsPerNgn = (ccy: string) => liveRates?.[ccy] ?? (MARKETS.find(m => m.ccy === ccy)?.perNgn || 1);

// Category styling tokens mapping
const CATS_MAP: Record<string, { icon: any; from: string; to: string }> = {
  "Fashion":           { icon:Store,      from:"#25D366", to:"#4ADE80" },
  "Apparel":           { icon:Store,      from:"#25D366", to:"#4ADE80" },
  "Footwear":          { icon:Store,      from:"#c2557a", to:"#e0789a" },
  "Beauty & Cosmetics":{ icon:Sparkles,   from:"#c2557a", to:"#e0789a" },
  "Gadgets":           { icon:LayoutGrid, from:"#2f6f9e", to:"#4f97c7" },
  "Accessories":       { icon:LayoutGrid, from:"#2f6f9e", to:"#4f97c7" },
  "Food":              { icon:Flame,      from:"#d98324", to:"#eaa64a" },
  "Digital Products":  { icon:BadgeCheck, from:"#6a52b8", to:"#8b73d8" },
};

const FAQS = [
  { q:"Is it safe to pay on Frontstore?",         a:"Yes. You pay securely on the platform — not by sending money to a stranger. Every payment is logged and you get a receipt by WhatsApp the moment it goes through." },
  { q:"How do I receive what I buy?",              a:"After payment the store gets your order instantly and reaches out on WhatsApp to confirm delivery or pickup. You can follow the order status the whole way." },
  { q:"What if my order does not arrive?",         a:"Your order is tracked from payment to delivery. If something goes wrong you have a clear record to raise it with the store, and protected stores carry a buyer safeguard." },
  { q:"Can I buy from a store in another country?",a:"Often yes for digital items, and for physical items where the store ships to you. Prices show in your local currency as a guide, while the final charge is in the store's own currency." },
];

const STATUS_MAP: Record<string, { label:string; color:string; bg:string; Icon:any }> = {
  pending:    { label:"Pending",    color:"#d98324", bg:"#fbecd1", Icon:Clock        },
  confirmed:  { label:"Confirmed",  color:"#2f6f9e", bg:"#ddeefa", Icon:CheckCircle  },
  processing: { label:"Processing", color:"#2f6f9e", bg:"#ddeefa", Icon:Truck        },
  completed:  { label:"Delivered",  color:"#25D366", bg:"#dcfce7", Icon:CheckCircle  },
  cancelled:  { label:"Cancelled",  color:"#c0392b", bg:"#fde8e8", Icon:AlertCircle  },
  // legacy aliases
  delivered:  { label:"Delivered",  color:"#25D366", bg:"#dcfce7", Icon:CheckCircle  },
  transit:    { label:"In transit", color:"#2f6f9e", bg:"#ddeefa", Icon:Truck        },
};

const fmt = (p: number, ccy: string, market: typeof MARKETS[0]) => {
  const ngn = p * ngnPerUnit(ccy);
  const t   = MARKETS.find(m => m.ccy === market.ccy) || MARKETS[0];
  let val   = ngn * unitsPerNgn(t.ccy);
  val = val >= 1000 ? Math.round(val) : Math.round(val * 100) / 100;
  return `${t.symbol}${new Intl.NumberFormat("en-GB", { maximumFractionDigits: val >= 1000 ? 0 : 2 }).format(val)}`;
};

// Ranks items from the shopper's own market/currency ahead of others — used to surface nearby stores & products first
const nearFirst = (market: typeof MARKETS[0], ccyA?: string, ccyB?: string) =>
  Number(ccyB === market.ccy) - Number(ccyA === market.ccy);

/* ─── SHARED UI ATOMS ────────────────────────────── */
function Thumb({ cat, h = 148, image }: { cat: string; h?: number; image?: string | null }) {
  const c = CATS_MAP[cat] || CATS_MAP.Fashion, Icon = c.icon;
  if (image) {
    return (
      <div style={{ height:h, position:"relative", overflow:"hidden" }}>
        <img src={image} alt={cat} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        <div className="thumb-shade" />
        <span className="thumb-cat">{cat}</span>
      </div>
    );
  }
  return (
    <div style={{ background:`linear-gradient(150deg,${c.from},${c.to})`, height:h, position:"relative", display:"grid", placeItems:"center", overflow:"hidden" }}>
      <div className="thumb-grain" />
      <Icon size={h > 160 ? 42 : 30} strokeWidth={1.4} color="rgba(255,255,255,.9)" />
      <span className="thumb-cat">{cat}</span>
    </div>
  );
}

function ProductCard({ p, market, liked, onLike }: { p: any; market: any; liked: boolean; onLike: () => void }) {
  const priceNum = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
  const storeName = p.store?.store_name || "Oja Wear";
  const storeLoc = p.store?.location;
  const isSponsored = p.is_sponsored || p.sponsored;
  const productUrl = `/${p.store?.username}/products/${p.slug}`;
  
  return (
    <a href={productUrl} className="p-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position:"relative" }}>
        <Thumb cat={p.category?.name || p.cat} image={p.image_url || p.image_urls?.[0]} />
        {isSponsored && <span className="tag tag-sp">Sponsored</span>}
        <button
          className={`like-btn${liked ? " on" : ""}`}
          onClick={e => { e.preventDefault(); e.stopPropagation(); onLike(); }}
          aria-label="Save"
        >
          <Heart size={14} fill={liked ? "#c2557a" : "none"} color={liked ? "#c2557a" : "#1d2b22"} />
        </button>
      </div>
      <div className="p-body">
        <span className="p-name">{p.name}</span>
        <div className="p-store">
          <Store size={11} />
          <span
            onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = `/${p.store?.username}`; }}
            style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {storeName}
          </span>
          {storeLoc && <><span className="dot">•</span>{storeLoc}</>}
        </div>
        <div className="p-foot">
          <div>
            <span className="p-price">{fmt(priceNum, p.store?.currency_code || p.ccy || 'NGN', market)}</span>
            {(p.store?.currency_code || p.ccy) !== market.ccy && <span className="approx">approx</span>}
          </div>
        </div>
      </div>
    </a>
  );
}

function StoreCard({ s }: { s: any }) {
  const meta = CATS_MAP[s.category?.name || s.cat] || CATS_MAP.Fashion;
  const rating = typeof s.rating === 'number' ? s.rating : null;
  const items = s.items ?? s.items_count ?? 0;
  const isVerified = s.is_verified || s.verified;
  const isRising = s.rising;
  const slug = s.username || s.slug || "";

  return (
    <a className="store-card" href={`/${slug}`}>
      <span className="store-av" style={{ background:`linear-gradient(150deg,${meta.from},${meta.to})` }}>{(s.store_name || s.name || 'S')[0]}</span>
      <span className="store-name">
        {s.store_name || s.name}
        {isVerified && <BadgeCheck size={13} color="#25D366" fill="#dcfce7" />}
      </span>
      <span className="store-meta">
        {rating !== null && <><Star size={11} fill="#e8a33d" color="#e8a33d" />{rating}<span className="dot">•</span></>}
        {items} item{items === 1 ? '' : 's'}
      </span>
      {s.location && <span className="store-loc"><MapPin size={11} />{s.location}</span>}
      {isRising && <span className="rising-tag">Rising</span>}
      <span className="store-url">frontstore.app/{slug}</span>
    </a>
  );
}

function SectionHead({ title, icon: Icon, right }: { title: string; icon?: any; right?: React.ReactNode }) {
  return (
    <div className="sec-head">
      <h2 className="sec-title">{Icon && <Icon size={17} className="sec-icon" />}{title}</h2>
      {right}
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, btnLabel, onBtn }: { icon: any; title: string; sub: string; btnLabel?: string; onBtn?: () => void }) {
  return (
    <div className="empty-state">
      <Icon size={38} style={{ opacity:.2 }} />
      <p>{title}</p>
      <span>{sub}</span>
      {btnLabel && <button className="es-btn" onClick={onBtn}>{btnLabel}</button>}
    </div>
  );
}

/* ─── LAYOUT SHELL ───────────────────────────────── */
function Shell({ tab, setTab, market, setMarket, onSearchTap, children, buyer }: { tab: string; setTab: (t: string) => void; market: any; setMarket: (m: any) => void; onSearchTap: () => void; children: React.ReactNode; buyer?: any | null }) {
  const [drawer, setDrawer]   = useState(false);
  const [mktOpen, setMktOpen] = useState(false);

  const goToMerchantArea = () => {
    try {
      const merchantToken = localStorage.getItem('token');
      window.location.href = merchantToken ? '/dashboard' : '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const NAV = [
    { k:"home",    Icon:Home,        label:"Home"    },
    { k:"browse",  Icon:LayoutGrid,  label:"Browse"  },
    { k:"search",  Icon:Search,      label:"Search",  primary:true },
    { k:"saved",   Icon:Bookmark,    label:"Saved"   },
    { k:"account", Icon:User,        label:"Account" },
  ];

  return (
    <div className="root">
      {/* ── TOP NAV ── */}
      <header className="top-nav">
        <div className="nav-inner">
          <button className="icon-btn hamburger" onClick={() => setDrawer(true)}><Menu size={21} /></button>
          <button className="logo" onClick={() => setTab("home")}>front<span>store</span><i /></button>



          <nav className="desk-links">
            <button onClick={() => setTab("browse")}>Marketplace</button>
            <button onClick={() => setTab("browse")}>Stores</button>
            <button onClick={() => setTab("home")}>How it works</button>
          </nav>

          <div className="nav-right">
            <div style={{ position:"relative" }}>
              <button className="mkt-btn" onClick={() => setMktOpen(o => !o)}>
                <MapPin size={13} />{market.symbol} {market.ccy}<ChevronDown size={13} />
              </button>
              {mktOpen && (
                <div className="mkt-dropdown">
                  <p className="mkt-dh">Shopping in</p>
                  {MARKETS.map(m => (
                    <button key={m.code} className={`mkt-opt${m.ccy === market.ccy ? " on" : ""}`}
                      onClick={() => { setMarket(m); setMktOpen(false); }}>
                      <span>{m.label}</span><span className="mkt-sym">{m.symbol} {m.ccy}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ThemeToggle />
            {buyer
              ? <button className="signin-btn nav-acct-btn" onClick={() => setTab("account")}><User size={14} />{(buyer.name || 'Account').split(' ')[0]}</button>
              : <button className="signin-btn" onClick={() => setTab("account")}>Sign in</button>}
            <button className="open-store-btn" onClick={goToMerchantArea}>Open store</button>
          </div>
        </div>
      </header>

      {/* ── DRAWER ── */}
      <div className={`scrim${drawer ? " show" : ""}`} onClick={() => setDrawer(false)} />
      <aside className={`fs-drawer${drawer ? " open" : ""}`}>
        <div className="drawer-head">
          <span className="logo sm">front<span>store</span><i /></span>
          <button className="icon-btn" onClick={() => setDrawer(false)}><X size={20} /></button>
        </div>
        <nav className="drawer-nav">
          {["Marketplace","Browse categories","Stores","How buying works","Help & safety"].map(l => (
            <button key={l} className="drawer-link" onClick={() => setDrawer(false)}>{l}</button>
          ))}
        </nav>
        <div className="drawer-sell">
          <p>Got something to sell?</p>
          <button className="ds-btn">Open your free store <ArrowRight size={14} /></button>
          <span>frontstore.app/yourname</span>
        </div>
      </aside>

      {/* ── PAGE ── */}
      <main className="page-wrap">{children}</main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="bottom-nav">
        {NAV.map(({ k, Icon, label, primary }) => {
          if (primary) return (
            <button key={k} className="bn-primary" onClick={() => { setTab("browse"); onSearchTap(); }} aria-label="Search products">
              <Icon size={22} color="#fff" />
            </button>
          );
          return (
            <button key={k} className={`bn-item${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>
              <Icon size={20} /><span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ─── PAGE: HOME ─────────────────────────────────── */
interface PageHomeProps {
  market: any;
  liked: Record<string, boolean>;
  toggleLike: (id: string) => void;
  setTab: (t: string) => void;
  products: any[];
  categories: any[];
  stores: any[];
  setActiveCat: (cat: string) => void;
  q: string;
  setQ: (q: string) => void;
}
function PageHome({ market, liked, toggleLike, setTab, products, categories, stores, setActiveCat, q, setQ }: PageHomeProps) {
  const [openFaq, setOpenFaq] = useState(0);

  const filtered = useMemo(() => {
    if (!q.trim()) return products;
    const lq = q.toLowerCase();
    return products.filter(p => 
      (p.name || "").toLowerCase().includes(lq) || 
      (p.store?.store_name || "").toLowerCase().includes(lq) || 
      (p.category?.name || "").toLowerCase().includes(lq)
    );
  }, [q, products]);

  const sponsored = filtered.filter(p => p.is_sponsored || p.sponsored);
  // Fallback: if no explicitly sponsored products, pick top-viewed ones as featured — stores in the shopper's own market surface first
  const featuredProducts = sponsored.length > 0
    ? sponsored
    : [...filtered].sort((a, b) => nearFirst(market, a.store?.currency_code, b.store?.currency_code) || (b.views_count || 0) - (a.views_count || 0)).slice(0, 4);
  const trending  = [...filtered].sort((a, b) => nearFirst(market, a.store?.currency_code, b.store?.currency_code) || (b.views_count || 0) - (a.views_count || 0)).slice(0, 4);
  const latest    = [...filtered].sort((a, b) => nearFirst(market, a.store?.currency_code, b.store?.currency_code) || new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 6);
  // Surface stores from the shopper's own market first, then rank by real traffic (page views)
  const nearbyStores = [...stores].sort((a, b) => nearFirst(market, a.currency_code, b.currency_code) || (b.traffic || 0) - (a.traffic || 0));
  // Sellers and listings actually based in the shopper's detected country
  const nearYouStores = stores.filter(s => s.currency_code === market.ccy);
  const nearYouProducts = [...filtered]
    .filter(p => p.store?.currency_code === market.ccy)
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-copy">
          <p className="eyebrow">Africa's marketplace for everyday stores</p>
          <h1 className="hero-h1">Buy straight from real stores you can trust.</h1>
          <p className="hero-sub">Browse thousands of products from independent sellers, pay safely, and track every order.</p>

          <div className="hero-search-wrap">
            <Search size={17} className="hs-icon" />
            <input className="hero-search" placeholder="Search products, stores, categories…"
              value={q} onChange={e => setQ(e.target.value)} onFocus={() => setTab("browse")} />
            {q && <button className="hs-clr" onClick={() => setQ("")}><X size={15} /></button>}
          </div>

          <div className="chip-row">
            {["Ankara","Phones","Skincare","Sneakers","Snacks","eBooks"].map(c => (
              <button key={c} className="chip"
                onClick={() => {
                  const mappedSearch = c === "Ankara" ? "adire" : c === "Phones" ? "phone" : c.toLowerCase();
                  setQ(mappedSearch);
                  setTab("browse");
                }}>
                {c}
              </button>
            ))}
          </div>

          <div className="trust-row">
            <span><ShieldCheck size={14} />Secure payment</span>
            <span><Receipt size={14} />Instant receipt</span>
            <span><Truck size={14} />Order tracking</span>
          </div>
        </div>

        {/* decorative product grid — desktop only */}
        <div className="hero-visual">
          {[
            { name:"Classic Set Lashes",   price:30,      ccy:"GBP", cat:"Beauty & Cosmetics" },
            { name:"Ankara Two Piece Set", price:28000,   ccy:"NGN", cat:"Fashion"            },
            { name:"iPhone 15 Pro",        price:1180,    ccy:"USD", cat:"Gadgets"            },
            { name:"Shea Butter Glow Kit", price:15600,   ccy:"NGN", cat:"Beauty & Cosmetics" },
          ].map((p, i) => {
            const m = CATS_MAP[p.cat] || CATS_MAP.Fashion;
            return (
              <div key={i} className="hv-card"
                style={{ background:`linear-gradient(150deg,${m.from},${m.to})`, animationDelay:`${i * 80}ms` }}>
                <span className="hv-name">{p.name}</span>
                <span className="hv-price">{fmt(p.price, p.ccy, market)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="sec">
        <SectionHead title="Browse by category" />
        <div className="cat-scroll">
          {categories.map((cat: any) => {
            const meta = CATS_MAP[cat.name] || CATS_MAP.Fashion;
            const Icon = meta.icon;
            const n    = products.filter(p => p.category?.id === cat.id).length;
            return (
              <button key={cat.id} className="cat-card" onClick={() => { setActiveCat(cat.name); setTab("browse"); }}>
                <span className="cat-ic" style={{ background:`linear-gradient(150deg,${meta.from},${meta.to})` }}>
                  <Icon size={21} color="#fff" strokeWidth={1.6} />
                </span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-n">{n} items</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      {featuredProducts.length > 0 && (
        <section className="sec">
          <SectionHead
            title="Featured today"
            right={
              sponsored.length > 0
                ? <span className="sp-badge">Sponsored</span>
                : <span className="sp-badge" style={{ background: 'var(--brand-tint)', color: 'var(--brand-text)' }}>Sponsored</span>
            }
          />
          <div className="featured-scroll">
            {featuredProducts.map(p => <div className="featured-item" key={p.id}><ProductCard p={p} market={market} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} /></div>)}
          </div>
        </section>
      )}

      {/* NEAR YOU */}
      {(nearYouStores.length > 0 || nearYouProducts.length > 0) && (
        <section className="sec near-you-sec">
          <SectionHead title={`Near you in ${market.label}`} icon={MapPin}
            right={<button className="see-all" onClick={() => setTab("browse")}>See all <ChevronRight size={14} /></button>} />
          {nearYouStores.length > 0 && (
            <div className="store-scroll">
              {nearYouStores.slice(0, 8).map(s => <StoreCard key={s.id} s={s} />)}
            </div>
          )}
          {nearYouProducts.length > 0 && (
            <div className="product-grid" style={{ marginTop: nearYouStores.length > 0 ? 16 : 8 }}>
              {nearYouProducts.map(p => <ProductCard key={p.id} p={p} market={market} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />)}
            </div>
          )}
        </section>
      )}

      {/* STORES */}
      <section className="sec">
        <SectionHead title="Stores worth following"
          right={<button className="see-all" onClick={() => setTab("browse")}>All stores <ChevronRight size={14} /></button>} />
        <div className="store-scroll">
          {nearbyStores.map(s => <StoreCard key={s.id} s={s} />)}
        </div>
      </section>

      {/* TRENDING */}
      <section className="sec">
        <SectionHead title="Trending now" icon={Flame} />
        <div className="product-grid">
          {trending.map(p => <ProductCard key={p.id} p={p} market={market} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />)}
        </div>
      </section>

      {/* LATEST */}
      <section className="sec latest-band">
        <SectionHead title="Just uploaded" icon={Clock} right={<span className="fresh-tag">Fresh from new sellers</span>} />
        <div className="product-grid">
          {latest.map(p => <ProductCard key={p.id} p={p} market={market} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sec">
        <SectionHead title="How buying works" />
        <div className="steps-list">
          {[
            { Icon:Search,       t:"Find it",     d:"Browse stores or search for what you need."                           },
            { Icon:ShieldCheck,  t:"Pay safely",  d:"Pay on Frontstore and get an instant receipt."                       },
            { Icon:MessageCircle,t:"Get it",      d:"The store confirms on WhatsApp and you track delivery."               },
          ].map(({ Icon, t, d }, i) => (
            <div key={i} className="step-card">
              <span className="step-num">{i + 1}</span>
              <Icon size={18} className="step-ic" />
              <h3>{t}</h3><p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <SectionHead title="Buying with confidence" />
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{f.q}</span>{openFaq === i ? <Minus size={17} /> : <Plus size={17} />}
              </button>
              <div className="faq-body"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* SELL BAND */}
      <section className="sell-band">
        <div className="sell-inner">
          <div className="sell-copy">
            <h2>Selling something? Your store is two minutes away.</h2>
            <p>Claim your link, add products, and share it anywhere. We handle payments and receipts.</p>
            <button className="sell-cta">Open your free store <ArrowRight size={15} /></button>
            <span className="sell-url">frontstore.app/yourname</span>
          </div>
          <div className="sell-blob" />
        </div>
      </section>

      {/* Spacer to push footer to the bottom and ensure minimum spacing */}
      <div style={{ marginTop: 'auto', paddingTop: 40 }} />

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <span className="logo sm">front<span>store</span><i /></span>
            <p className="footer-tag">Conversational commerce for Africa and beyond.</p>
          </div>
          <div className="footer-cols">
            {(
              [
                {
                  h: "Shop",
                  links: [
                    { label: "Marketplace", href: "/", onClick: (e: React.MouseEvent) => { e.preventDefault(); setTab("browse"); } },
                    { label: "Categories", href: "/", onClick: (e: React.MouseEvent) => { e.preventDefault(); setTab("browse"); } },
                    { label: "Stores", href: "/stores" }
                  ]
                },
                {
                  h: "Sell",
                  links: [
                    { label: "For business", href: "/business" },
                    { label: "Pricing", href: "/business#pricing" },
                    { label: "Blog", href: "/blog" }
                  ]
                },
                {
                  h: "Company",
                  links: [
                    { label: "About", href: "/business#about" },
                    { label: "Privacy", href: "/privacy" },
                    { label: "Terms", href: "/terms" }
                  ]
                },
                {
                  h: "Support",
                  links: [
                    { label: "Help centre", href: "/docs" },
                    { label: "WhatsApp", href: "https://wa.me/2348030000000", target: "_blank", rel: "noopener noreferrer" },
                    { label: "Contact", href: "mailto:support@frontstore.app" }
                  ]
                }
              ] as { h: string; links: { label: string; href: string; onClick?: (e: React.MouseEvent) => void; target?: string; rel?: string; }[] }[]
            ).map(({ h, links }) => (
              <div key={h}>
                <h4>{h}</h4>
                {links.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={link.onClick}
                    target={link.target}
                    rel={link.rel}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <p className="footer-note">© 2026 Frontstore. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

/* ─── PAGE: BROWSE ───────────────────────────────── */
interface PageBrowseProps {
  market: any;
  liked: Record<string, boolean>;
  toggleLike: (id: string) => void;
  products: any[];
  categories: any[];
  activeCat: string;
  setActiveCat: (cat: string) => void;
  q: string;
  setQ: (q: string) => void;
  focusSignal?: number;
}
function PageBrowse({ market, liked, toggleLike, products, categories, activeCat, setActiveCat, q, setQ, focusSignal }: PageBrowseProps) {
  const [sortBy,    setSortBy]    = useState("popular");
  const [showFilter,setShowFilter]= useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Jump straight into the search box when the user taps the bottom-nav search shortcut
  useEffect(() => {
    if (focusSignal) searchInputRef.current?.focus();
  }, [focusSignal]);

  const cats     = ["All", ...categories.map((c: any) => c.name)];
  const filtered = useMemo(() => {
    let r = products;
    if (activeCat !== "All") r = r.filter(p => p.category?.name === activeCat);
    if (q.trim())            r = r.filter(p => 
      (p.name || "").toLowerCase().includes(q.toLowerCase()) || 
      (p.store?.store_name || "").toLowerCase().includes(q.toLowerCase())
    );
    if (sortBy === "popular")    r = [...r].sort((a, b) => nearFirst(market, a.store?.currency_code, b.store?.currency_code) || (b.views_count || 0) - (a.views_count || 0));
    if (sortBy === "newest")     r = [...r].sort((a, b) => nearFirst(market, a.store?.currency_code, b.store?.currency_code) || new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    if (sortBy === "price_asc")  r = [...r].sort((a, b) => {
      const pA = (typeof a.price === 'number' ? a.price : Number(a.price) || 0) * (ccyToNgn[a.store?.currency_code as keyof typeof ccyToNgn] || 1);
      const pB = (typeof b.price === 'number' ? b.price : Number(b.price) || 0) * (ccyToNgn[b.store?.currency_code as keyof typeof ccyToNgn] || 1);
      return pA - pB;
    });
    if (sortBy === "price_desc") r = [...r].sort((a, b) => {
      const pA = (typeof a.price === 'number' ? a.price : Number(a.price) || 0) * (ccyToNgn[a.store?.currency_code as keyof typeof ccyToNgn] || 1);
      const pB = (typeof b.price === 'number' ? b.price : Number(b.price) || 0) * (ccyToNgn[b.store?.currency_code as keyof typeof ccyToNgn] || 1);
      return pB - pA;
    });
    return r;
  }, [activeCat, sortBy, q, products, market]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Browse</h1>
        <p className="page-sub">Explore {products.length} products from independent stores.</p>
      </div>

      {/* toolbar */}
      <div className="toolbar">
        <div style={{ position:"relative", flex:1 }}>
          <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} />
          <input ref={searchInputRef} className="tb-search" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} />
          {q && <button style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} onClick={() => setQ("")}><X size={14} /></button>}
        </div>
        <button className={`filter-btn${showFilter ? " on" : ""}`} onClick={() => setShowFilter(s => !s)}>
          <SlidersHorizontal size={15} />Filter
        </button>
      </div>

      {/* filter panel */}
      {showFilter && (
        <div className="filter-panel">
          <p className="fp-label">Sort by</p>
          <div className="fp-pills">
            {[["popular","Most popular"],["newest","Newest"],["price_asc","Price ↑"],["price_desc","Price ↓"]].map(([v, l]) => (
              <button key={v} className={`fp-pill${sortBy === v ? " on" : ""}`} onClick={() => setSortBy(v)}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* category pills */}
      <div className="cat-pills-row">
        {cats.map(c => (
          <button key={c} className={`cat-pill${activeCat === c ? " on" : ""}`} onClick={() => setActiveCat(c)}>
            {c !== "All" && CATS_MAP[c] && React.createElement(CATS_MAP[c].icon, { size:12, strokeWidth:2 })}
            {c}
          </button>
        ))}
      </div>

      <p className="result-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}{activeCat !== "All" ? ` in ${activeCat}` : ""}</p>

      {filtered.length > 0
        ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} p={p} market={market} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />)}</div>
        : <EmptyState icon={Search} title="No products found" sub="Try a different search or category"
            btnLabel="Clear filters" onBtn={() => { setQ(""); setActiveCat("All"); }} />
      }
    </>
  );
}

/* ─── PAGE: SAVED ────────────────────────────────── */
interface PageSavedProps {
  market: any;
  liked: Record<string, boolean>;
  toggleLike: (id: string) => void;
  setTab: (t: string) => void;
  products: any[];
}
function PageSaved({ market, liked, toggleLike, setTab, products }: PageSavedProps) {
  const saved = products.filter(p => liked[p.id]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Saved</h1>
        {saved.length > 0 && <p className="page-sub">{saved.length} saved item{saved.length !== 1 ? "s" : ""}</p>}
      </div>

      {saved.length > 0 ? (
        <div className="product-grid">
          {saved.map(p => (
            <div key={p.id} style={{ position:"relative" }}>
              <ProductCard p={p} market={market} liked={true} onLike={() => toggleLike(p.id)} />
              <button className="sv-remove" onClick={() => toggleLike(p.id)} title="Remove">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Bookmark} title="Nothing saved yet"
          sub="Tap the heart on any product to save it here."
          btnLabel="Browse products" onBtn={() => setTab("browse")} />
      )}
    </>
  );
}

/* ─── PAGE: ACCOUNT ──────────────────────────────── */
interface PageAccountProps {
  market: any;
  setMarket: (m: any) => void;
  products: any[];
  liked: Record<string, boolean>;
  buyer: any | null;
  setBuyer: (b: any | null) => void;
  buyerAuthChecked: boolean;
}
function PageAccount({ market, setMarket, products, liked, buyer, setBuyer, buyerAuthChecked }: PageAccountProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  const [section, setSection] = useState("main"); // main | orders | settings | password | payment-methods | help
  const [mktOpen, setMktOpen] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, in_transit: 0, reviews_count: 0 });
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!buyer) return;
    const token = localStorage.getItem('buyer_token');
    if (!token) return;
    setOrdersLoading(true);
    fetch(`${API_URL}/v1/buyer/auth/orders`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) {
          setOrders(Array.isArray(json.data.orders) ? json.data.orders : []);
          if (json.data.stats) setOrderStats(s => ({ ...s, ...json.data.stats }));
        }
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [buyer, API_URL]);

  const handleSignOut = () => {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      fetch(`${API_URL}/v1/buyer/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      }).catch(() => {});
    }
    localStorage.removeItem('buyer_token');
    localStorage.removeItem('buyer');
    setBuyer(null);
    setOrders([]);
    setOrderStats({ total: 0, pending: 0, confirmed: 0, completed: 0, in_transit: 0, reviews_count: 0 });
    setSection('main');
  };

  /* Routes a business owner to their dashboard if already signed in as a merchant, or to merchant login otherwise — separate session keys ('token'/'user') from the buyer session */
  const handleMerchantEntry = () => {
    try {
      const merchantToken = localStorage.getItem('token');
      window.location.href = merchantToken ? '/dashboard' : '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const handlePwChange = async () => {
    if (!pwForm.current || !pwForm.next) { setPwMsg('Please fill in all fields.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg('New passwords do not match.'); return; }
    const token = localStorage.getItem('buyer_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/v1/buyer/auth/password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current, password: pwForm.next, password_confirmation: pwForm.confirm }),
      });
      const json = await res.json();
      setPwMsg(res.ok ? 'Password updated successfully.' : (json?.message || 'Failed to update password.'));
      if (res.ok) setPwForm({ current: '', next: '', confirm: '' });
    } catch {
      setPwMsg('Something went wrong. Please try again.');
    }
  };

  /* SIGN-IN GATE — the buyer account area requires a buyer session, not the merchant 'user'/'token' pair */
  if (buyerAuthChecked && !buyer) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"64px 20px" }}>
      <span style={{ width:56, height:56, borderRadius:"50%", background:"var(--brand-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <User size={26} color="var(--brand)" />
      </span>
      <h1 className="page-title" style={{ marginTop:16 }}>Sign in to view your account</h1>
      <p style={{ color:"var(--muted)", fontSize:13, maxWidth:280, marginTop:6 }}>
        Track orders, save favourites, and check out faster once you're signed in.
      </p>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <a href="/buyer/login" style={{ textDecoration:"none", background:"var(--brand)", color:"#fff", fontWeight:700, fontSize:13, padding:"11px 20px", borderRadius:11 }}>Sign in</a>
        <a href="/buyer/register" style={{ textDecoration:"none", background:"var(--brand-tint)", color:"var(--brand-text)", fontWeight:700, fontSize:13, padding:"11px 20px", borderRadius:11 }}>Create account</a>
      </div>
    </div>
  );

  const savedCount = Object.values(liked).filter(Boolean).length;
  const STATS = [
    { Icon:ShoppingBag, label:"Orders",     val: String(orderStats.total),          color:"#25D366" },
    { Icon:Heart,       label:"Saved",      val: String(savedCount),                color:"#c2557a" },
    { Icon:Star,        label:"Reviews",    val: String(orderStats.reviews_count),  color:"#e8a33d" },
    { Icon:Package,     label:"In transit", val: String(orderStats.in_transit),     color:"#2f6f9e" },
  ];

  // Normalise API order shape → display shape
  const ORDERS = orders.map(o => ({
    id: o.id,
    order_number: o.order_number,
    item: o.items?.[0]?.product_name ?? 'Order',
    store: o.store?.store_name ?? '',
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '',
    status: o.order_status ?? 'pending',
    amount: Number(o.total_amount) || 0,
    ccy: o.store?.currency_code ?? o.currency_code ?? 'NGN',
    items_count: Array.isArray(o.items) ? o.items.length : 1,
  }));

  /* ORDER HISTORY */
  if (section === "orders") return (
    <>
      <div className="sub-header">
        <button className="back-btn" onClick={() => setSection("main")}><ChevronLeft size={20} /></button>
        <h1 className="page-title">Order history</h1>
      </div>
      {ordersLoading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}>
          <Loader2 size={28} className="animate-spin" style={{ color:"var(--brand)", opacity:.6 }} />
        </div>
      ) : ORDERS.length === 0
        ? <EmptyState icon={Package} title="No orders yet" sub="Orders you place will show up here so you can track them." btnLabel="Start shopping" onBtn={() => setSection("main")} />
        : (
        <div className="orders-list">
          {ORDERS.map(o => {
            const st = STATUS_MAP[o.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending, StIc = st.Icon;
            return (
              <div key={o.id} className="order-card">
                <div className="order-top">
                  <div>
                    <p className="order-name">{o.item}{o.items_count > 1 ? ` +${o.items_count - 1} more` : ''}</p>
                    <p className="order-meta">{o.store} · {o.date}</p>
                  </div>
                  <span className="order-amount">{fmt(o.amount, o.ccy, market)}</span>
                </div>
                <div className="order-bottom">
                  <span className="status-pill" style={{ background:st.bg, color:st.color }}>
                    <StIc size={12} />{st.label}
                  </span>
                  <div style={{ display:"flex", gap:8 }}>
                    <a href={`/track/${o.id}`} className="o-btn" style={{ textDecoration:"none" }}>Track</a>
                    {o.status === "completed" && <button className="o-btn o-btn-primary">Review</button>}
                  </div>
                </div>
                <p className="order-id">{o.order_number || `Order: ${o.id.slice(0,8)}`}</p>
              </div>
            );
          })}
        </div>
        )}
    </>
  );

  /* SETTINGS */
  if (section === "settings") return (
    <>
      <div className="sub-header">
        <button className="back-btn" onClick={() => setSection("main")}><ChevronLeft size={20} /></button>
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-block">
        <p className="settings-group-label">Shopping market</p>
        <button className="settings-row" onClick={() => setMktOpen(o => !o)}>
          <MapPin size={15} style={{ color:"var(--brand)" }} />
          <span>Currency &amp; region</span>
          <span className="sr-val">{market.symbol} {market.ccy} <ChevronDown size={13} /></span>
        </button>
        {mktOpen && (
          <div className="mkt-inline">
            {MARKETS.map(m => (
              <button key={m.code} className={`mkt-opt${m.ccy === market.ccy ? " on" : ""}`}
                style={{ width:"100%" }} onClick={() => { setMarket(m); setMktOpen(false); }}>
                <span>{m.label}</span><span className="mkt-sym">{m.symbol} {m.ccy}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="settings-block">
        <p className="settings-group-label">Account</p>
        <div className="settings-row">
          <Bell size={15} style={{ color:"var(--brand)" }} />
          <span>Notifications</span>
          <label className="toggle-switch" style={{ marginLeft:"auto" }}>
            <input type="checkbox" checked={notifOn} onChange={e => setNotifOn(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
        <button className="settings-row" onClick={() => setSection("password")}>
          <Lock size={15} style={{ color:"var(--brand)" }} />
          <span>Password &amp; security</span>
          <span className="sr-val"><ChevronRight size={14} style={{ color:"var(--muted)" }} /></span>
        </button>
        <button className="settings-row" onClick={() => setSection("payment-methods")}>
          <CreditCard size={15} style={{ color:"var(--brand)" }} />
          <span>Payment methods</span>
          <span className="sr-val"><ChevronRight size={14} style={{ color:"var(--muted)" }} /></span>
        </button>
        <button className="settings-row" onClick={() => setLangOpen(o => !o)}>
          <Globe size={15} style={{ color:"var(--brand)" }} />
          <span>Language</span>
          <span className="sr-val">{language} <ChevronDown size={13} /></span>
        </button>
        {langOpen && (
          <div className="mkt-inline" style={{ marginTop:4 }}>
            {["English","French","Arabic","Portuguese","Swahili"].map(l => (
              <button key={l} className={`mkt-opt${language === l ? " on" : ""}`}
                style={{ width:"100%" }} onClick={() => { setLanguage(l); setLangOpen(false); }}>
                <span>{l}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="settings-block">
        <p className="settings-group-label">Support</p>
        <button className="settings-row" onClick={() => setSection("help")}>
          <HelpCircle size={15} style={{ color:"var(--brand)" }} />
          <span>Help centre</span>
          <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
        </button>
        <button className="settings-row" onClick={() => window.open('https://wa.me/2348030000000', '_blank')}>
          <MessageCircle size={15} style={{ color:"var(--brand)" }} />
          <span>Chat on WhatsApp</span>
          <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
        </button>
        <button className="settings-row" onClick={() => window.open('mailto:support@frontstore.app')}>
          <AlertCircle size={15} style={{ color:"var(--brand)" }} />
          <span>Report a problem</span>
          <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
        </button>
      </div>

      <button className="logout-btn" onClick={handleSignOut}><LogOut size={14} />Sign out</button>
    </>
  );

  /* PASSWORD & SECURITY */
  if (section === "password") return (
    <>
      <div className="sub-header">
        <button className="back-btn" onClick={() => { setSection("settings"); setPwMsg(''); }}><ChevronLeft size={20} /></button>
        <h1 className="page-title">Password &amp; security</h1>
      </div>
      <div className="settings-block">
        <p className="settings-group-label">Change password</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"6px 0" }}>
          <input
            type="password"
            placeholder="Current password"
            value={pwForm.current}
            onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
            className="pw-input"
          />
          <input
            type="password"
            placeholder="New password"
            value={pwForm.next}
            onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
            className="pw-input"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            className="pw-input"
          />
          {pwMsg && <p style={{ fontSize:12.5, color: pwMsg.includes('success') ? "var(--brand-text)" : "#c0392b", fontWeight:600 }}>{pwMsg}</p>}
          <button className="es-btn" style={{ marginTop:4, justifyContent:"center", padding:"12px 0" }} onClick={handlePwChange}>
            Update password
          </button>
        </div>
      </div>
    </>
  );

  /* PAYMENT METHODS */
  if (section === "payment-methods") return (
    <>
      <div className="sub-header">
        <button className="back-btn" onClick={() => setSection("settings")}><ChevronLeft size={20} /></button>
        <h1 className="page-title">Payment methods</h1>
      </div>
      <EmptyState icon={CreditCard} title="No payment methods saved"
        sub="Add a card or bank account to check out faster next time." />
      <button className="add-pm-btn">
        <Plus size={16} />Add payment method
      </button>
    </>
  );

  /* HELP & SUPPORT */
  if (section === "help") return (
    <>
      <div className="sub-header">
        <button className="back-btn" onClick={() => setSection("main")}><ChevronLeft size={20} /></button>
        <h1 className="page-title">Help &amp; support</h1>
      </div>
      <div className="settings-block">
        <button className="settings-row" onClick={() => window.open('/docs', '_blank')}>
          <HelpCircle size={15} style={{ color:"var(--brand)" }} />
          <span>Help centre</span>
          <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
        </button>
        <button className="settings-row" onClick={() => window.open('https://wa.me/2348030000000', '_blank')}>
          <MessageCircle size={15} style={{ color:"var(--brand)" }} />
          <span>Chat on WhatsApp</span>
          <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
        </button>
        <button className="settings-row" onClick={() => window.open('mailto:support@frontstore.app')}>
          <AlertCircle size={15} style={{ color:"var(--brand)" }} />
          <span>Report a problem</span>
          <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
        </button>
      </div>
    </>
  );

  /* MAIN ACCOUNT DASHBOARD */
  const finalProfileName = buyer?.name || "Shopper";
  const finalProfileEmail = buyer?.email || buyer?.phone_number || "";
  const isVerifiedBuyer = !!(buyer?.is_verified || buyer?.verified);
  return (
    <>
      <div className="page-header" style={{ marginBottom:0 }}>
        <h1 className="page-title">Account</h1>
      </div>

      {/* profile card */}
      <div className="profile-card">
        <div className="avatar-wrap">
          <div className="avatar">{finalProfileName[0]}</div>
          <button className="avatar-edit"><Camera size={12} color="#fff" /></button>
        </div>
        <div style={{ flex:1 }}>
          <p className="ac-name">{finalProfileName}</p>
          {finalProfileEmail && <p className="ac-email">{finalProfileEmail}</p>}
          {isVerifiedBuyer && <span className="verified-badge"><BadgeCheck size={11} />Verified buyer</span>}
        </div>
        <button className="edit-btn" onClick={() => setSection("settings")}><Edit3 size={14} /></button>
      </div>

      {/* stats */}
      <div className="ac-stats">
        {STATS.map(({ Icon, label, val, color }) => (
          <div key={label} className="ac-stat-card">
            <span className="ac-stat-ic" style={{ background:`${color}18` }}><Icon size={18} color={color} /></span>
            <span className="ac-stat-val">{val}</span>
            <span className="ac-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* recent orders */}
      <div className="ac-block">
        <div className="ac-block-head">
          <h2>Recent orders</h2>
          {ORDERS.length > 0 && <button className="see-all" onClick={() => setSection("orders")}>See all <ChevronRight size={13} /></button>}
        </div>
        {ordersLoading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"20px 0" }}>
            <Loader2 size={22} className="animate-spin" style={{ color:"var(--brand)", opacity:.5 }} />
          </div>
        ) : ORDERS.length === 0
          ? <EmptyState icon={Package} title="No orders yet" sub="When you buy something, it'll show up here." />
          : ORDERS.slice(0, 2).map(o => {
          const st = STATUS_MAP[o.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending, StIc = st.Icon;
          return (
            <div key={o.id} className="mini-order">
              <div style={{ width:52, height:52, borderRadius:10, flexShrink:0, background:"var(--brand-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Package size={22} color="var(--brand-text)" strokeWidth={1.5} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.item}</p>
                <p style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{o.store} · {o.date}</p>
                <span className="status-pill" style={{ background:st.bg, color:st.color, marginTop:5, display:"inline-flex" }}>
                  <StIc size={11} />{st.label}
                </span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--brand-text)", flexShrink:0 }}>{fmt(o.amount, o.ccy, market)}</span>
            </div>
          );
        })}
      </div>

      {/* quick actions */}
      <div className="ac-block">
        <div className="ac-block-head"><h2>Quick actions</h2></div>
        <div className="quick-actions">
          {[
            { Icon:Package,    label:"Track order",   color:"#2f6f9e", onClick: () => setSection("orders") },
            { Icon:CreditCard, label:"Payment",        color:"#25D366", onClick: () => setSection("payment-methods") },
            { Icon:Bell,       label:"Alerts",         color:"#d98324", onClick: () => setSection("settings") },
            { Icon:Store,      label:"Open store",     color:"#6a52b8", onClick: handleMerchantEntry },
          ].map(({ Icon, label, color, onClick }) => (
            <button key={label} className="qa-btn" onClick={onClick}>
              <span className="qa-ic" style={{ background:`${color}18` }}><Icon size={21} color={color} /></span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* menu */}
      <div className="ac-block">
        {[
          { Icon:Settings,   label:"Account settings",    onClick:() => setSection("settings") },
          { Icon:HelpCircle, label:"Help & support",       onClick:() => setSection("help")    },
          { Icon:TrendingUp, label:"Sell on Frontstore",   onClick: handleMerchantEntry         },
        ].map(({ Icon, label, onClick }) => (
          <button key={label} className="ac-menu-row" onClick={onClick}>
            <span className="ac-menu-ic"><Icon size={16} color="var(--brand)" /></span>
            <span>{label}</span>
            <ChevronRight size={14} style={{ marginLeft:"auto", color:"var(--muted)" }} />
          </button>
        ))}
        <button className="ac-menu-row" style={{ color:"#d0392b" }} onClick={handleSignOut}>
          <span className="ac-menu-ic"><LogOut size={16} color="#d0392b" /></span>
          <span>Sign out</span>
        </button>
      </div>
    </>
  );
}

/* ─── ROOT ───────────────────────────────────────── */
export default function MarketplaceHomeClient({ initialData, initialSettings }: { initialData?: any; initialSettings?: any }) {
  const [tab,    setTab]    = useState<string>(() => {
    if (typeof window === 'undefined') return 'home';
    const p = new URLSearchParams(window.location.search).get('tab');
    return ['home','browse','saved','account'].includes(p as string) ? (p as string) : 'home';
  });
  const [market, setMarket] = useState(MARKETS[0]);
  const [liked,  setLiked]  = useState<Record<string, boolean>>({});
  const toggleLike = (id: string) => setLiked(s => ({ ...s, [id]: !s[id] }));

  // Buyer session — read once on mount and re-checked whenever the Account tab is opened,
  // so the header reflects sign-in state right away (incl. returning from /buyer/login).
  const [buyer, setBuyer] = useState<any | null>(null);
  const [buyerAuthChecked, setBuyerAuthChecked] = useState(false);
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyer_token');
      const stored = localStorage.getItem('buyer');
      setBuyer(token && stored ? JSON.parse(stored) : null);
    } catch {
      setBuyer(null);
    }
    setBuyerAuthChecked(true);
  }, [tab]);

  // Auto-detect the shopper's market/currency from their location so items & prices show in their local context by default
  useEffect(() => {
    let cancelled = false;
    const detectMarket = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) return;
        const data = await res.json();
        const found = MARKETS.find(m => m.code === data?.country_code);
        if (found && !cancelled) setMarket(found);
      } catch (e) {
        console.warn('Location auto-detection failed, using default market:', e);
      }
    };
    detectMarket();
    return () => { cancelled = true; };
  }, []);

  // Fetch live exchange rates so converted prices reflect real rates rather than the static estimates
  const [, bumpRates] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const loadRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/NGN');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.rates && !cancelled) {
          liveRates = data.rates;
          bumpRates(n => n + 1); // re-render so prices reformat with live rates
        }
      } catch (e) {
        console.warn('Live exchange rates unavailable, using static estimates:', e);
      }
    };
    loadRates();
    return () => { cancelled = true; };
  }, []);

  // Live database states
  const [products, setProducts] = useState<any[]>(() => {
    const prods = initialData?.products;
    return Array.isArray(prods) ? prods : prods ? Object.values(prods) : [];
  });
  const [categories, setCategories] = useState<any[]>(() => {
    const cats = initialData?.categories;
    return Array.isArray(cats) ? cats : cats ? Object.values(cats) : [];
  });
  const [stores, setStores] = useState<any[]>(() => {
    const st = initialData?.stores;
    return Array.isArray(st) ? st : st ? Object.values(st) : [];
  });

  const [activeCat, setActiveCat] = useState("All");
  const [q, setQ] = useState("");
  const [searchFocusSignal, setSearchFocusSignal] = useState(0);

  // Populate unique stores list based on products if stores list is empty from API
  const finalStores = useMemo(() => {
    if (stores.length > 0) return stores;
    const storeMap = new Map();
    products.forEach(p => {
      if (p.store && p.store.id && !storeMap.has(p.store.id)) {
        storeMap.set(p.store.id, p.store);
      }
    });
    return Array.from(storeMap.values());
  }, [stores, products]);

  // Fetch live marketplace records on mount
  useEffect(() => {
    const fetchMarketplace = async () => {
      const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
      try {
        const res = await fetch(`${configuredApiUrl}/v1/public/marketplace`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const prods = json.data.products;
            const cats = json.data.categories;
            const st = json.data.stores;
            setProducts(Array.isArray(prods) ? prods : prods ? Object.values(prods) : []);
            setCategories(Array.isArray(cats) ? cats : cats ? Object.values(cats) : []);
            setStores(Array.isArray(st) ? st : st ? Object.values(st) : []);
          }
        }
      } catch (err) {
        console.error("Failed to load live marketplace data:", err);
      }
    };
    fetchMarketplace();
  }, []);

  const pages = {
    home:    <PageHome    market={market} liked={liked} toggleLike={toggleLike} setTab={setTab} products={products} categories={categories} stores={finalStores} setActiveCat={setActiveCat} q={q} setQ={setQ} />,
    browse:  <PageBrowse  market={market} liked={liked} toggleLike={toggleLike} products={products} categories={categories} activeCat={activeCat} setActiveCat={setActiveCat} q={q} setQ={setQ} focusSignal={searchFocusSignal} />,
    saved:   <PageSaved   market={market} liked={liked} toggleLike={toggleLike} setTab={setTab} products={products} />,
    account: <PageAccount market={market} setMarket={setMarket} products={products} liked={liked} buyer={buyer} setBuyer={setBuyer} buyerAuthChecked={buyerAuthChecked} />,
  };

  return (
    <Shell tab={tab} setTab={setTab} market={market} setMarket={setMarket} onSearchTap={() => setSearchFocusSignal(s => s + 1)} buyer={buyer}>
      {/* dangerouslySetInnerHTML prevents React from diffing style content during hydration, avoiding mismatches from browser extensions that modify <style> tags */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="inner-wrap" key={tab}>
        {pages[tab as keyof typeof pages] || pages.home}
        <div style={{ height:80 }} />
      </div>
    </Shell>
  );
}

/* ─── STYLES ─────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

/* tokens — scoped to .root (not :root) so they never leak onto other pages */
.root{
  --bg:#f7f2e9; --surface:#fffdf8; --ink:#16261d; --muted:#6c7a70;
  --brand:#25D366; --brand-dark:#128C7E; --brand-text:#128C7E; --brand-tint:#dcfce7;
  --accent:#e8a33d; --accent-soft:#fbeccf; --line:#e9e1d2;
  --nav-h:62px; --r:18px;
}

/* dark mode token overrides — driven by the shared .dark class on <html> */
:root.dark .root {
  color-scheme: dark;
  --bg: hsl(240,14%,8%);
  --surface: hsl(240,12%,11%);
  --ink: hsl(210,30%,94%);
  --muted: hsl(215,14%,52%);
  --line: hsl(240,10%,18%);
  --brand-tint: hsl(150,50%,12%);
  --brand-text: hsl(145,65%,60%);
  --accent-soft: hsl(38,60%,12%);
}

/* dark mode element overrides (fixed rgba nav backgrounds) */
:root.dark .root .top-nav { background: rgba(14,12,22,.92) !important; }
:root.dark .root .bottom-nav { background: rgba(14,12,22,.92) !important; }
:root.dark .root .hero-search, :root.dark .root .nav-search { background: var(--surface) !important; color: var(--ink) !important; }
:root.dark .root .fs-drawer { background: var(--surface) !important; }
:root.dark .root .mkt-dropdown { background: var(--surface) !important; }

/* reset */
.root *{box-sizing:border-box;margin:0;padding:0;}
.root button{font-family:inherit;cursor:pointer;border:none;background:none;}
.root a{text-decoration:none;color:inherit;}
.root{font-family:'Hanken Grotesk',sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden;display:flex;flex-direction:column;}


@keyframes rise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
@keyframes fade{from{opacity:0;}to{opacity:1;}}

/* ── top nav ── */
.top-nav{position:sticky;top:0;z-index:40;background:rgba(247,242,233,.9);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);}
.nav-inner{display:flex;align-items:center;gap:12px;padding:0 18px;height:var(--nav-h);max-width:1280px;margin:0 auto;}
.icon-btn{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;color:var(--ink);flex-shrink:0;}
.hamburger{display:flex;}
.logo{font-family:'Bricolage Grotesque';font-weight:800;font-size:21px;letter-spacing:-.02em;color:var(--ink);display:inline-flex;align-items:center;flex-shrink:0;}
.logo span{color:var(--brand);}
.logo i{width:6px;height:6px;border-radius:50%;background:var(--accent);margin-left:3px;margin-bottom:-8px;}
.logo.sm{font-size:18px;}

.nav-search-wrap{display:none;position:relative;flex:1;max-width:440px;}
.nav-si{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);}
.nav-search{width:100%;padding:10px 36px;border-radius:11px;border:1.5px solid var(--line);background:var(--surface);font-size:14px;font-family:inherit;}
.nav-search:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-tint);}

.desk-links{display:none;gap:2px;}
.desk-links button{font-size:14px;font-weight:600;padding:8px 12px;border-radius:10px;color:var(--ink);}
.desk-links button:hover{background:var(--brand-tint);color:var(--brand-text);}

.nav-right{display:flex;align-items:center;gap:10px;margin-left:auto;}
.mkt-btn{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:var(--brand-text);background:var(--brand-tint);padding:8px 12px;border-radius:10px;white-space:nowrap;flex-shrink:0;}
.signin-btn{font-size:13.5px;font-weight:600;padding:8px 6px;white-space:nowrap;flex-shrink:0;}
.nav-acct-btn{display:inline-flex;align-items:center;gap:6px;color:var(--brand-text);background:var(--brand-tint);padding:8px 12px;border-radius:10px;}
.open-store-btn{display:none;font-size:13px;font-weight:700;background:var(--brand) !important;color:#fff !important;padding:9px 15px;border-radius:11px;white-space:nowrap;flex-shrink:0;}
.open-store-btn:hover{background:var(--brand-dark) !important;}

.mkt-dropdown{position:absolute;top:calc(100% + 8px);right:0;width:230px;background:var(--surface);border:1px solid var(--line);border-radius:13px;padding:8px;box-shadow:0 18px 36px rgba(20,38,29,.15);z-index:60;animation:rise .18s ease;}
.mkt-dh{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);padding:6px 8px;}
.mkt-opt{width:100%;display:flex;justify-content:space-between;align-items:center;padding:9px 8px;border-radius:99px;font-size:13px;font-weight:500;}
.mkt-opt:hover{background:var(--bg);}
.mkt-opt.on{background:var(--brand-tint);color:var(--brand-text);font-weight:700;}
.mkt-sym{color:var(--muted);font-size:11.5px;}
.mkt-inline{background:var(--bg);border-radius:10px;padding:6px;margin-top:4px;}

@media(max-width:767px){
  .nav-inner{gap:8px;padding:0 14px;}
  .nav-right{gap:6px;}
  .mkt-btn{padding:7px 9px;font-size:11.5px;gap:3px;}
  .signin-btn{padding:8px 10px;}
}

/* ── drawer ── */
.scrim{position:fixed;inset:0;background:rgba(16,38,29,.45);opacity:0;pointer-events:none;transition:.25s;z-index:60;}
.scrim.show{opacity:1;pointer-events:auto;}
.fs-drawer{position:fixed;top:0;left:0;height:100%;width:280px;max-width:84%;background:var(--surface);z-index:70;transform:translateX(-102%);transition:transform .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;padding:16px;box-shadow:0 0 60px rgba(16,38,29,.2);}
.fs-drawer.open{transform:none;}
.drawer-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.drawer-nav{display:flex;flex-direction:column;}
.drawer-link{padding:14px 6px;font-size:15px;font-weight:600;border-bottom:1px solid var(--line);text-align:left;}
.drawer-sell{margin-top:auto;background:var(--brand-tint);border-radius:16px;padding:16px;}
.drawer-sell p{font-weight:700;font-size:14px;margin-bottom:10px;}
.ds-btn{display:inline-flex;align-items:center;gap:6px;background:var(--brand) !important;color:#fff !important;font-weight:700;font-size:13px;padding:10px 14px;border-radius:11px;}
.drawer-sell span{display:block;margin-top:8px;font-size:11.5px;color:var(--brand-text);font-weight:600;}

/* ── page layout ── */
.page-wrap{max-width:1280px;margin:0 auto;width:100%;flex:1;display:flex;flex-direction:column;}
.inner-wrap{padding:0 18px;animation:fade .22s ease;flex:1;display:flex;flex-direction:column;}

/* page headings */
.page-header{padding-top:28px;margin-bottom:20px;}
.page-title{font-family:'Bricolage Grotesque';font-weight:800;font-size:28px;letter-spacing:-.02em;}
.page-sub{font-size:14px;color:var(--muted);margin-top:4px;}
.sub-header{display:flex;align-items:center;gap:10px;padding-top:24px;margin-bottom:22px;}
.back-btn{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;border:1px solid var(--line);background:var(--surface);}

/* section */
.sec{padding:28px 0 6px;}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;}
.sec-title{font-family:'Bricolage Grotesque';font-weight:700;font-size:21px;letter-spacing:-.02em;display:inline-flex;align-items:center;gap:7px;}
.sec-icon{color:var(--accent);}
.see-all{font-size:13px;font-weight:600;color:var(--brand-text);display:inline-flex;align-items:center;gap:2px;}
.see-all:hover{color:var(--brand);}
.sp-badge{font-size:11px;color:var(--muted);font-weight:600;background:var(--accent-soft);padding:3px 9px;border-radius:8px;}
.fresh-tag{font-size:11.5px;color:var(--brand-text);font-weight:600;}
.result-count{font-size:13px;color:var(--muted);margin-bottom:14px;}

/* hero */
.hero{position:relative;padding:44px 0 32px;display:flex;flex-direction:column;overflow:hidden;}
.hero-glow{position:absolute;top:-100px;right:-60px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(15,174,114,.22),transparent 70%);pointer-events:none;}
.hero-copy{position:relative;max-width:560px;}
.hero-visual{display:none;}
.eyebrow{font-size:12px;font-weight:700;color:var(--brand-text);text-transform:uppercase;letter-spacing:.07em;}
.hero-h1{font-family:'Bricolage Grotesque';font-weight:800;font-size:32px;line-height:1.06;letter-spacing:-.03em;margin:9px 0;}
.hero-sub{font-size:14.5px;color:var(--muted);line-height:1.55;}
.hero-search-wrap{position:relative;margin:17px 0 12px;}
.hs-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);}
.hero-search{width:100%;padding:14px 42px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);font-size:14px;font-family:inherit;box-shadow:0 5px 16px rgba(20,38,29,.05);}
.hero-search:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-tint);}
.hs-clr{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:var(--muted);width:26px;height:26px;display:grid;place-items:center;}
.chip-row{display:flex;gap:7px;overflow-x:auto;padding-bottom:5px;margin-top:14px;scrollbar-width:none;}
.chip-row::-webkit-scrollbar{display:none;}
.chip{flex:0 0 auto;font-size:12.5px;font-weight:600;padding:7px 14px;border-radius:999px;background:var(--surface);border:1px solid var(--line);}
.chip:hover{background:var(--brand-tint);border-color:var(--brand);color:var(--brand-text);}
.trust-row{display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;}
.trust-row span{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:var(--brand-text);}

/* hero visual */
.hv-card{border-radius:16px;padding:17px 14px;display:flex;flex-direction:column;gap:7px;animation:rise .5s both;position:relative;overflow:hidden;}
.hv-card::after{content:"";position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(255,255,255,.12)'/%3E%3C/svg%3E");}
.hv-name{font-size:13px;font-weight:700;color:#fff;position:relative;}
.hv-price{font-family:'Bricolage Grotesque';font-size:17px;font-weight:800;color:#fff;position:relative;}

/* categories */
.cat-scroll{display:flex;gap:11px;overflow-x:auto;padding-bottom:7px;scrollbar-width:none;}
.cat-scroll::-webkit-scrollbar{display:none;}
.cat-card{flex:0 0 auto;width:112px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px 10px;display:flex;flex-direction:column;align-items:center;text-align:center;transition:transform .2s,border-color .2s,box-shadow .2s;gap:8px;}
.cat-card:hover{transform:translateY(-2px);border-color:var(--brand);box-shadow:0 6px 16px rgba(16,38,29,.05);}
.cat-ic{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;}
.cat-name{font-size:13px;font-weight:700;color:var(--ink);margin-top:2px;}
.cat-n{font-size:11px;color:var(--muted);}

/* product grid */
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:8px;}
@media(min-width:768px){.product-grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;}}

/* product card */
.p-card{display:flex;flex-direction:column;border-radius:var(--r);border:1px solid var(--line);background:var(--surface);overflow:hidden;position:relative;transition:transform .2s,box-shadow .2s;height:100%;cursor:pointer;text-decoration:none;color:inherit;}
.p-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(16,38,29,.08);}
.thumb-grain{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.15) 0%,transparent 80%);pointer-events:none;}
.thumb-cat{position:absolute;bottom:8px;left:10px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.05em;background:rgba(15,23,20,.55);backdrop-filter:blur(3px);padding:3px 8px;border-radius:6px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.thumb-shade{position:absolute;left:0;right:0;bottom:0;height:46%;background:linear-gradient(to top,rgba(0,0,0,.35),transparent);pointer-events:none;}
.tag{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;z-index:10;}
.tag-sp{background:var(--accent);color:#fff;}
.like-btn{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.88);backdrop-filter:blur(4px);display:grid;place-items:center;z-index:10;transition:transform .15s;}
.like-btn:hover{transform:scale(1.1);}
.like-btn.on{background:rgba(255,255,255,.95);}
.p-body{padding:14px;display:flex;flex-direction:column;gap:6px;flex:1;}
.p-name{font-size:14.5px;font-weight:700;color:var(--ink);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.p-store{display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--muted);margin-top:2px;}
.p-store svg{color:var(--brand-text);margin-right:1px;}
.dot{margin:0 3px;opacity:.5;}
.p-foot{display:flex;align-items:flex-end;margin-top:auto;padding-top:10px;}
.p-price{font-family:'Bricolage Grotesque';font-size:16px;font-weight:800;color:var(--brand-text);}
.approx{font-size:10px;color:var(--muted);margin-left:3px;text-transform:uppercase;font-weight:600;}

/* store cards */
.store-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:7px;scrollbar-width:none;}
.store-scroll::-webkit-scrollbar{display:none;}
.featured-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:7px;margin-top:8px;scroll-snap-type:x mandatory;scrollbar-width:none;}
.featured-scroll::-webkit-scrollbar{display:none;}
.featured-item{flex:0 0 auto;width:200px;scroll-snap-align:start;}
@media(min-width:768px){.featured-item{width:240px;}}
.store-card{flex:0 0 auto;width:190px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px 14px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;transition:transform .2s,box-shadow .2s;}
.store-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(16,38,29,.05);}
.store-av{width:48px;height:48px;border-radius:50%;color:#fff;font-family:'Bricolage Grotesque';font-size:18px;font-weight:800;display:grid;place-items:center;margin-bottom:10px;}
.store-name{font-size:14px;font-weight:700;color:var(--ink);display:inline-flex;align-items:center;gap:3px;margin-bottom:2px;}
.store-meta{font-size:11.5px;color:var(--muted);display:inline-flex;align-items:center;gap:3px;}
.store-loc{font-size:11px;color:var(--muted);display:inline-flex;align-items:center;gap:3px;margin-top:3px;}
.store-loc svg{color:var(--brand-text);flex-shrink:0;}
.rising-tag{position:absolute;top:10px;right:10px;font-size:9.5px;font-weight:700;color:var(--brand-text);background:var(--brand-tint);padding:2px 7px;border-radius:6px;}
.store-url{font-size:11px;color:var(--brand);font-weight:600;margin-top:10px;}

/* latest band */
.latest-band{background:linear-gradient(180deg,transparent,var(--surface));border-radius:24px;padding:28px 18px 18px;}

/* steps list */
.steps-list{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:640px){.steps-list{grid-template-columns:repeat(3,1fr);gap:18px;}}
.step-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:20px;position:relative;display:flex;flex-direction:column;gap:8px;}
.step-num{position:absolute;top:12px;right:14px;font-family:'Bricolage Grotesque';font-size:36px;font-weight:800;color:var(--brand-tint);line-height:1;opacity:.6;}
.step-ic{width:38px;height:38px;border-radius:10px;background:var(--brand-tint);color:var(--brand-text);display:grid;place-items:center;}
.step-card h3{font-size:15.5px;font-weight:700;}
.step-card p{font-size:13px;color:var(--muted);line-height:1.5;}

/* faq list */
.faq-list{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;}
.faq-item{border-bottom:1px solid var(--line);background:var(--surface);}
.faq-item:last-child{border-bottom:none;}
.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;padding:16px 18px;font-size:14px;font-weight:700;color:var(--ink);text-align:left;}
.faq-body{max-height:0;overflow:hidden;transition:max-height .25s ease-out;}
.faq-item.open .faq-body{max-height:200px;}
.faq-body p{padding:0 18px 16px;font-size:13.5px;color:var(--muted);line-height:1.6;}

/* sell band */
.sell-band{margin:36px 0 20px;border-radius:24px;background:linear-gradient(135deg,var(--brand-dark),var(--brand));color:#fff;overflow:hidden;position:relative;}
.sell-inner{padding:32px 20px;position:relative;z-index:10;}
@media(min-width:768px){.sell-inner{padding:48px 40px;}}
.sell-copy{max-width:540px;display:flex;flex-direction:column;gap:10px;}
.sell-copy h2{font-family:'Bricolage Grotesque';font-size:24px;font-weight:800;line-height:1.15;letter-spacing:-.02em;}
@media(min-width:768px){.sell-copy h2{font-size:30px;}}
.sell-copy p{font-size:14px;color:rgba(255,255,255,.85);line-height:1.55;}
.sell-cta{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;background:#fff;color:var(--brand-dark);font-weight:750;font-size:13.5px;padding:12px 20px;border-radius:11px;box-shadow:0 6px 20px rgba(0,0,0,.1);transition:transform .15s;}
.sell-cta:hover{transform:translateY(-2px);}
.sell-url{font-size:11.5px;color:rgba(255,255,255,.6);font-weight:600;}
.sell-blob{position:absolute;top:-40%;right:-10%;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none;}

/* footer */
.site-footer{background:var(--surface);border-top:1px solid var(--line);margin-left:calc(-50vw + 50%);margin-right:calc(-50vw + 50%);padding:36px 0 24px;}
.footer-inner{max-width:1280px;margin:0 auto;padding:0 18px;}
.footer-top{margin-bottom:24px;}
.footer-tag{font-size:13.5px;color:var(--muted);margin-top:6px;}
.footer-cols{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:32px;}
@media(min-width:640px){.footer-cols{grid-template-columns:repeat(4,1fr);}}
.footer-cols h4{font-size:13.5px;font-weight:700;color:var(--ink);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em;}
.footer-cols a{display:block;font-size:13px;color:var(--muted);padding:4px 0;}
.footer-cols a:hover{color:var(--brand);}
.footer-note{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:16px;text-align:center;}

/* toolbar */
.toolbar{display:flex;gap:10px;margin-bottom:14px;padding-top:10px;}
.tb-search{width:100%;padding:10px 12px 10px 36px;border-radius:11px;border:1.5px solid var(--line);background:var(--surface);font-size:14px;font-family:inherit;}
.tb-search:focus{outline:none;border-color:var(--brand);}
.filter-btn{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--ink);border:1.5px solid var(--line);background:var(--surface);padding:10px 14px;border-radius:11px;cursor:pointer;}
.filter-btn.on{border-color:var(--brand);color:var(--brand);background:var(--brand-tint);}

/* filter panel */
.filter-panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px;margin-bottom:14px;animation:rise .2s ease;}
.fp-label{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
.fp-pills{display:flex;flex-wrap:wrap;gap:6px;}
.fp-pill{font-size:12.5px;font-weight:600;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg);cursor:pointer;}
.fp-pill.on{background:var(--brand-tint);border-color:var(--brand);color:var(--brand-text);font-weight:700;}

/* category pills */
.cat-pills-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:5px;margin-bottom:14px;scrollbar-width:none;}
.cat-pills-row::-webkit-scrollbar{display:none;}
.cat-pill{flex:0 0 auto;display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;padding:7px 14px;border-radius:999px;background:var(--surface);border:1px solid var(--line);cursor:pointer;}
.cat-pill.on{background:var(--brand-tint);border-color:var(--brand);color:var(--brand-text);font-weight:750;}

/* empty state */
.empty-state{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:40px 16px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);color:var(--muted);}
.empty-state p{font-size:15px;font-weight:700;color:var(--ink);}
.empty-state span{font-size:13px;}
.es-btn{display:inline-flex;align-items:center;background:var(--brand) !important;color:#fff !important;font-weight:700;font-size:12.5px;padding:8px 16px;border-radius:8px;margin-top:6px;}

/* saved page */
.sv-tabs{display:flex;border-bottom:1.5px solid var(--line);margin-bottom:16px;}
.sv-tab{padding:10px 14px;font-size:14px;font-weight:600;color:var(--muted);position:relative;cursor:pointer;}
.sv-tab.on{color:var(--brand-text);font-weight:700;}
.sv-tab.on::after{content:"";position:absolute;bottom:-1.5px;left:0;right:0;height:2px;background:var(--brand);}
.sv-badge{font-size:10.5px;font-weight:700;background:var(--line);color:var(--ink);padding:1px 5px;border-radius:6px;margin-left:4px;}
.sv-remove{position:absolute;top:10px;right:10px;width:24px;height:24px;border-radius:50%;background:#fff;border:1px solid var(--line);display:grid;place-items:center;cursor:pointer;z-index:20;color:#c0392b;}
.sv-collections{display:grid;grid-template-columns:1fr;gap:10px;}
@media(min-width:640px){.sv-collections{grid-template-columns:repeat(3,1fr);}}
.sv-col-card{width:100%;display:flex;align-items:center;gap:12px;padding:14px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);text-align:left;cursor:pointer;}
.sv-col-ic{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;}
.sv-col-name{font-size:14px;font-weight:700;color:var(--ink);}
.sv-col-n{font-size:11.5px;color:var(--muted);margin-top:1px;}
.sv-col-new{border-style:dashed;border-width:1.5px;justify-content:center;font-size:13.5px;}

.sv-stores{display:flex;flex-direction:column;gap:10px;}
.sv-store-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);}
.sv-unfollow{font-size:11.5px;font-weight:700;color:var(--muted);border:1px solid var(--line);padding:5px 10px;border-radius:8px;}

/* order history */
.orders-list{display:flex;flex-direction:column;gap:12px;}
.order-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px;}
.order-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
.order-name{font-size:14.5px;font-weight:700;color:var(--ink);}
.order-meta{font-size:11.5px;color:var(--muted);margin-top:2px;}
.order-amount{font-family:'Bricolage Grotesque';font-size:15.5px;font-weight:800;color:var(--brand-text);}
.order-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px dashed var(--line);}
.status-pill{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;}
.o-btn{font-size:12px;font-weight:700;color:var(--ink);border:1px solid var(--line);padding:6px 12px;border-radius:8px;cursor:pointer;}
.o-btn-primary{background:var(--brand) !important;color:#fff !important;border-color:var(--brand);}
.order-id{font-size:10.5px;color:var(--muted);margin-top:10px;text-align:right;}

/* settings */
.settings-block{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px;margin-bottom:14px;}
.settings-group-label{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;}
.settings-row{width:100%;display:flex;align-items:center;gap:10px;padding:12px 6px;border-bottom:1px solid var(--line);font-size:13.5px;font-weight:600;color:var(--ink);text-align:left;}
.settings-row:last-child{border-bottom:none;}
.sr-val{margin-left:auto;color:var(--muted);font-size:12.5px;display:inline-flex;align-items:center;gap:4px;}
.logout-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;font-size:13.5px;font-weight:750;color:#c0392b;border:1.5px solid var(--line);background:var(--surface);padding:12px;border-radius:11px;margin-top:10px;}

/* toggle switch */
.toggle-switch{position:relative;display:inline-block;width:40px;height:23px;flex-shrink:0;}
.toggle-switch input{opacity:0;width:0;height:0;position:absolute;}
.toggle-slider{position:absolute;inset:0;background:var(--line);border-radius:24px;transition:.2s;cursor:pointer;}
.toggle-slider::before{content:"";position:absolute;height:17px;width:17px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s;}
.toggle-switch input:checked + .toggle-slider{background:var(--brand);}
.toggle-switch input:checked + .toggle-slider::before{transform:translateX(17px);}

/* password form inputs */
.pw-input{width:100%;padding:12px 14px;border-radius:11px;border:1.5px solid var(--line);background:var(--bg);font-size:13.5px;font-family:inherit;color:var(--ink);}
.pw-input:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-tint);}

/* add payment method */
.add-pm-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13.5px;font-weight:700;color:var(--brand-text);border:1.5px dashed var(--line);background:none;padding:13px;border-radius:var(--r);margin-top:14px;}
.add-pm-btn:hover{border-color:var(--brand);background:var(--brand-tint);}

/* profile card */
.profile-card{display:flex;align-items:center;gap:14px;padding:16px 14px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);margin-bottom:14px;}
.avatar-wrap{position:relative;width:56px;height:56px;flex-shrink:0;}
.avatar{width:100%;height:100%;border-radius:50%;background:var(--brand-tint);color:var(--brand-text);font-family:'Bricolage Grotesque';font-size:24px;font-weight:800;display:grid;place-items:center;}
.avatar-edit{position:absolute;bottom:0;right:0;width:18px;height:18px;border-radius:50%;background:var(--brand);display:grid;place-items:center;border:1.5px solid var(--surface);}
.ac-name{font-size:16px;font-weight:700;color:var(--ink);}
.ac-email{font-size:12.5px;color:var(--muted);margin-top:1px;}
.verified-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;color:var(--brand-text);background:var(--brand-tint);padding:2px 6px;border-radius:5px;margin-top:4px;}
.edit-btn{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;border:1px solid var(--line);color:var(--muted);margin-left:auto;}

/* stats */
.ac-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
.ac-stat-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 4px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.ac-stat-ic{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;margin-bottom:6px;}
.ac-stat-val{font-family:'Bricolage Grotesque';font-size:16px;font-weight:800;color:var(--ink);}
.ac-stat-label{font-size:10.5px;color:var(--muted);margin-top:2px;}

/* account blocks */
.ac-block{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:14px;margin-bottom:14px;}
.ac-block-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.ac-block-head h2{font-family:'Bricolage Grotesque';font-size:15px;font-weight:800;}
.mini-order{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);}
.mini-order:last-child{border-bottom:none;}
.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.qa-btn{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11.5px;font-weight:700;color:var(--ink);text-align:center;}
.qa-ic{width:42px;height:42px;border-radius:10px;display:grid;place-items:center;margin-bottom:2px;}

.ac-menu-row{width:100%;display:flex;align-items:center;gap:10px;padding:12px 6px;border-bottom:1px solid var(--line);font-size:13.5px;font-weight:600;color:var(--ink);text-align:left;}
.ac-menu-row:last-child{border-bottom:none;}
.ac-menu-ic{width:24px;height:24px;border-radius:6px;background:var(--brand-tint);display:grid;place-items:center;}

/* bottom nav */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;height:58px;background:rgba(255,253,248,.92);backdrop-filter:blur(10px);border-top:1px solid var(--line);display:flex;justify-content:space-around;align-items:center;z-index:50;padding-bottom:env(safe-area-inset-bottom);}
.bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:600;color:var(--muted);flex:1;height:100%;justify-content:center;}
.bn-item.on{color:var(--brand-text);font-weight:700;}
.bn-primary{width:44px;height:44px;border-radius:50%;background:var(--brand) !important;display:grid;place-items:center;box-shadow:0 4px 12px rgba(37,211,102,.35);transform:translateY(-8px);flex-shrink:0;}

@media(min-width:768px){
  .bottom-nav{display:none;}
  .hamburger{display:none !important;}
  .nav-search-wrap{display:block;}
  .desk-links{display:flex;}
  .open-store-btn{display:block;}
  .hero{flex-direction:row;align-items:center;justify-content:space-between;padding:60px 0 40px;}
  .hero-copy{flex:1;}
  .hero-visual{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;width:340px;flex-shrink:0;margin-left:40px;}
  .hero-h1{font-size:46px;}
}
`;
