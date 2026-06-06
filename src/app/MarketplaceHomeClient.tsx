'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Boxes,
  Building2,
  ChevronRight,
  Clock,
  Flame,
  Grid3X3,
  Heart,
  HelpCircle,
  MessageCircle,
  Minus,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '../components/PublicSiteChrome';

/* ── Types ───────────────────────────────────────────────────────────── */
type StoreSummary = {
  id: string;
  store_name: string;
  store_bio?: string | null;
  username: string;
  logo_url?: string | null;
  currency_code: string;
  whatsapp_phone?: string | null;
  instagram_handle?: string | null;
  is_verified?: boolean;
};

type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  active_products_count?: number;
};

type MarketplaceProduct = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  compare_at_price?: string | number | null;
  description?: string | null;
  image_url?: string | null;
  stock_status?: string;
  is_digital?: boolean;
  views_count?: number;
  is_sponsored?: boolean;
  is_latest?: boolean;
  category?: CategorySummary | null;
  store?: StoreSummary | null;
};

type MarketplaceData = {
  products: MarketplaceProduct[];
  categories: CategorySummary[];
  stores?: StoreSummary[];
  stats?: {
    products_count?: number;
    stores_count?: number;
  };
};

type Settings = {
  app_name?: string;
  logo_url?: string;
  system_domain?: string;
};

/* ── Helpers ─────────────────────────────────────────────────────────── */
const currencySymbols: Record<string, string> = {
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  USD: '$',
  GBP: '£',
};

function normalizeCurrencyCode(currencyCode?: string) {
  const normalized = typeof currencyCode === 'string' ? currencyCode.trim().toUpperCase() : '';
  if (!normalized || normalized === 'UNDEFINED' || normalized === 'NULL') return 'NGN';
  return normalized;
}

function formatPrice(value: string | number, currencyCode?: string) {
  const amount = typeof value === 'number' ? value : Number(value);
  const normalizedCurrency = normalizeCurrencyCode(currencyCode);
  const symbol = currencySymbols[normalizedCurrency] || `${normalizedCurrency} `;
  if (!Number.isFinite(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function safePathSegment(value?: string | null) {
  if (typeof value !== 'string') return '';
  const segment = value.trim();
  if (!segment || segment.toLowerCase() === 'undefined' || segment.toLowerCase() === 'null') return '';
  return segment;
}

function getProductUrl(product: MarketplaceProduct) {
  const username = safePathSegment(product.store?.username);
  const slug = safePathSegment(product.slug);
  return username && slug ? `/${username}/products/${slug}` : '#';
}

function getStoreUrl(store?: StoreSummary | null) {
  const username = safePathSegment(store?.username);
  return username ? `/${username}` : '#';
}

function normalizeApiUrl(value?: string | null) {
  const fallback = 'https://api.frontstore.app/api';
  if (typeof value !== 'string') return fallback;
  const url = value.trim();
  if (!url || url.toLowerCase() === 'undefined' || url.toLowerCase() === 'null') return fallback;
  return url.replace(/\/+$/, '');
}

function productMatches(product: MarketplaceProduct, searchTerm: string, categorySlug: string) {
  const search = searchTerm.trim().toLowerCase();
  const matchesCategory = categorySlug === 'all' || product.category?.slug === categorySlug;
  if (!matchesCategory) return false;
  if (!search) return true;
  return [product.name, product.description, product.category?.name, product.store?.store_name, product.store?.username]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(search));
}

/* ── Static content ──────────────────────────────────────────────────── */
const FAQS = [
  { q: 'Is it safe to pay on Frontstore?', a: 'Yes. You pay securely on the platform — not by sending money to a stranger. Every payment is logged and you get a receipt the moment it goes through.' },
  { q: 'How do I receive what I buy?', a: 'After payment the store gets your order instantly and reaches out on WhatsApp to confirm delivery or pickup. You can follow the order status the whole way.' },
  { q: 'What if my order does not arrive?', a: 'Your order is tracked from payment to delivery. If something goes wrong you have a clear record to raise it with the store, and protected stores carry a buyer safeguard.' },
  { q: 'Can I buy from a store in another country?', a: 'Often yes for digital items, and for physical items where the store ships to you. Prices show in the store\'s own currency, with final charges in that currency.' },
];

/* ── Skeleton atoms ──────────────────────────────────────────────────── */
function Skeleton({ w, h, rounded }: { w?: number | string; h?: number | string; rounded?: boolean | number }) {
  return (
    <div
      className="skeleton"
      style={{
        width: w,
        height: h,
        borderRadius: rounded === true ? 'var(--r-full)' : typeof rounded === 'number' ? rounded : 6,
        flexShrink: 0,
      }}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="mp-product-card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '1 / 1', width: '100%' }} />
      <div className="mp-product-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton h={16} w="80%" />
        <Skeleton h={14} w="40%" />
        <Skeleton h={12} w="100%" rounded={3} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <Skeleton w={34} h={34} rounded={99} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <Skeleton h={10} w="30%" rounded={3} />
            <Skeleton h={12} w="60%" rounded={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Product card ────────────────────────────────────────────────────── */
function ProductCard({ product, liked, onLike }: { product: MarketplaceProduct; liked: boolean; onLike: () => void }) {
  const productUrl = getProductUrl(product);
  const storeUrl = getStoreUrl(product.store);
  const currency = normalizeCurrencyCode(product.store?.currency_code);
  return (
    <article className="mp-product-card card card-hover">
      <a href={productUrl} className="mp-product-image" aria-label={product.name}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <ShoppingBag size={42} />
        )}
        {product.category?.name && <span className="mp-product-cat-tag">{product.category.name}</span>}
        {product.is_sponsored && <span className="mp-product-sponsored-tag">Sponsored</span>}
        <button
          className={`mp-like-btn${liked ? ' on' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }}
          aria-label={liked ? 'Remove from saved' : 'Save product'}
        >
          <Heart size={14} fill={liked ? '#c2557a' : 'none'} color={liked ? '#c2557a' : 'currentColor'} />
        </button>
      </a>
      <div className="mp-product-body">
        <a href={productUrl} className="mp-product-name">{product.name}</a>
        <p className="mp-product-price">{formatPrice(product.price, currency)}</p>
        {product.description && <p className="mp-product-desc">{product.description}</p>}
        <a href={storeUrl} className="mp-product-store">
          <span className="mp-product-avatar">
            {product.store?.logo_url ? (
              <img src={product.store.logo_url} alt={product.store.store_name || 'Store'} />
            ) : (
              <Building2 size={14} />
            )}
          </span>
          <span className="mp-product-store-name">
            {product.store?.store_name || 'Business'}
            {product.store?.is_verified && <BadgeCheck size={13} />}
          </span>
        </a>
      </div>
    </article>
  );
}

/* ── Store card ──────────────────────────────────────────────────────── */
function StoreCard({ store }: { store: StoreSummary }) {
  const storeUrl = getStoreUrl(store);
  const initial = (store.store_name || 'S')[0].toUpperCase();
  return (
    <a href={storeUrl} className="mp-store-card">
      <span className="mp-store-avatar">
        {store.logo_url ? <img src={store.logo_url} alt={store.store_name} /> : initial}
      </span>
      <div className="mp-store-info">
        <span className="mp-store-name">
          {store.store_name}
          {store.is_verified && <BadgeCheck size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
        </span>
        {store.store_bio && <span className="mp-store-bio">{store.store_bio}</span>}
      </div>
      <ChevronRight size={15} className="mp-store-chevron" />
    </a>
  );
}

/* ── Section heading ─────────────────────────────────────────────────── */
function SectionHead({ title, icon: Icon, right }: { title: string; icon?: React.ElementType; right?: React.ReactNode }) {
  return (
    <div className="mp-sec-head">
      <h2 className="mp-sec-title">
        {Icon && <Icon size={18} className="mp-sec-icon" />}
        {title}
      </h2>
      {right && <div className="mp-sec-right">{right}</div>}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function MarketplaceHomeClient({
  initialData,
  initialSettings,
}: {
  initialData: MarketplaceData;
  initialSettings?: Settings | null;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<number>(-1);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const [products, setProducts] = useState<MarketplaceProduct[]>(() => {
    const prods = initialData?.products;
    return Array.isArray(prods) ? prods : prods ? Object.values(prods) : [];
  });
  const [categories, setCategories] = useState<CategorySummary[]>(() => {
    const cats = initialData?.categories;
    return Array.isArray(cats) ? cats : cats ? Object.values(cats) : [];
  });
  const [stores, setStores] = useState<StoreSummary[]>(() => {
    const st = initialData?.stores;
    return Array.isArray(st) ? st : st ? Object.values(st) : [];
  });
  const [stats, setStats] = useState(initialData?.stats);
  const [loading, setLoading] = useState(
    !initialData || !initialData.products || !Array.isArray(initialData.products) || initialData.products.length === 0
  );

  useEffect(() => {
    const loadFreshData = async () => {
      let savedApiUrl = '';
      try { savedApiUrl = localStorage.getItem('dev_api_url') || ''; } catch { /* ignore */ }
      const configuredApiUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
      const apiCandidates = Array.from(new Set([
        normalizeApiUrl(savedApiUrl),
        configuredApiUrl,
        'https://api.frontstore.app/api',
      ]));
      try {
        if (!Array.isArray(products) || products.length === 0) setLoading(true);
        for (const apiUrl of apiCandidates) {
          try {
            const res = await fetch(`${apiUrl}/v1/public/marketplace`);
            if (!res.ok) continue;
            const json = await res.json();
            if (json.data) {
              const prods = json.data.products;
              const cats  = json.data.categories;
              const st    = json.data.stores;
              setProducts(Array.isArray(prods) ? prods : prods ? Object.values(prods) : []);
              setCategories(Array.isArray(cats) ? cats : cats ? Object.values(cats) : []);
              if (st) setStores(Array.isArray(st) ? st : Object.values(st));
              setStats(json.data.stats);
              return;
            }
          } catch { /* try next */ }
        }
      } finally {
        setLoading(false);
      }
    };
    loadFreshData();
  }, []);

  const appName = initialSettings?.app_name || 'Frontstore';
  const systemDomain = initialSettings?.system_domain || 'frontstore.app';

  const toggleLike = (id: string) => setLiked((s) => ({ ...s, [id]: !s[id] }));

  const filteredProducts = useMemo(
    () => products.filter((p) => productMatches(p, searchTerm, activeCategory)),
    [activeCategory, products, searchTerm]
  );

  const sponsored   = useMemo(() => products.filter((p) => p.is_sponsored).slice(0, 4), [products]);
  const trending    = useMemo(() => [...products].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 8), [products]);
  const latestProds = useMemo(() => products.filter((p) => p.is_latest).slice(0, 8), [products]);
  const topStores   = useMemo(() => stores.slice(0, 6), [stores]);

  const topCategories  = categories.slice(0, 10);
  const storesCount    = stats?.stores_count || new Set(products.map((p) => p.store?.username).filter(Boolean)).size;
  const productsCount  = stats?.products_count || products.length;

  const isSearchActive = searchTerm.trim().length > 0 || activeCategory !== 'all';

  return (
    <div className="mp-page">
      <PublicSiteNav />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <header className="mp-hero">
        <div className="mp-hero-glow" />
        <div className="mp-hero-copy">
          <p className="mp-eyebrow">Africa's marketplace for independent stores</p>
          <h1 className="mp-hero-h1">
            Buy straight from real stores<br />
            <span className="mp-hero-gradient">you can trust.</span>
          </h1>
          <p className="mp-hero-sub">
            Browse products from {productsCount > 0 ? `${productsCount.toLocaleString()}+` : 'thousands of'} independent sellers across{' '}
            {storesCount > 0 ? `${storesCount.toLocaleString()}` : 'hundreds of'} stores. Pay safely, track every order.
          </p>

          {/* Search bar */}
          <div className="mp-hero-search-wrap">
            <Search size={17} className="mp-hs-icon" />
            <input
              className="mp-hero-search"
              placeholder="Search products, stores, categories…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search the marketplace"
            />
            {searchTerm && (
              <button className="mp-hs-clr" onClick={() => setSearchTerm('')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick category chips */}
          {!isSearchActive && (
            <div className="mp-chip-row" aria-label="Quick filters">
              {topCategories.slice(0, 6).map((cat) => (
                <button key={cat.id} className="mp-chip" onClick={() => setActiveCategory(cat.slug)}>
                  {cat.name}
                </button>
              ))}
              {loading && !categories.length && ['Fashion', 'Gadgets', 'Beauty', 'Food', 'Digital'].map((c) => (
                <button key={c} className="mp-chip">{c}</button>
              ))}
            </div>
          )}

          {/* Trust row */}
          <div className="mp-trust-row">
            <span><ShieldCheck size={14} />Secure payment</span>
            <span><Receipt size={14} />Instant receipt</span>
            <span><Truck size={14} />Order tracking</span>
          </div>
        </div>

        {/* Hero stats card */}
        <div className="mp-hero-stats-card">
          <div className="mp-hero-stat">
            {loading ? <Skeleton h={32} w={80} /> : <strong>{productsCount.toLocaleString()}+</strong>}
            <span>Products listed</span>
          </div>
          <div className="mp-hero-stat-divider" />
          <div className="mp-hero-stat">
            {loading ? <Skeleton h={32} w={60} /> : <strong>{storesCount.toLocaleString()}+</strong>}
            <span>Active stores</span>
          </div>
          <div className="mp-hero-stat-divider" />
          <div className="mp-hero-stat">
            {loading ? <Skeleton h={32} w={50} /> : <strong>{categories.length || '—'}</strong>}
            <span>Categories</span>
          </div>
        </div>
      </header>

      <main className="mp-main">
        {/* ─── CATEGORY PILLS ──────────────────────────────────────── */}
        {!isSearchActive && (
          <section className="mp-sec mp-cat-sec" aria-label="Browse by category">
            <SectionHead title="Browse by category" />
            <div className="mp-cat-pills-row">
              <button className={`mp-cat-pill${activeCategory === 'all' ? ' on' : ''}`} onClick={() => setActiveCategory('all')}>
                <Grid3X3 size={13} />All
              </button>
              {loading && !categories.length
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} w={88} h={36} rounded={99} />)
                : topCategories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`mp-cat-pill${activeCategory === cat.slug ? ' on' : ''}`}
                      onClick={() => setActiveCategory(cat.slug)}
                    >
                      <Tag size={12} />
                      {cat.name}
                      {typeof cat.active_products_count === 'number' && (
                        <span className="mp-cat-count">{cat.active_products_count}</span>
                      )}
                    </button>
                  ))
              }
            </div>
          </section>
        )}

        {/* ─── SEARCH RESULTS (when filtering) ────────────────────── */}
        {isSearchActive && (
          <section className="mp-sec">
            <div className="mp-search-header">
              <div>
                <h2 className="mp-sec-title">
                  {searchTerm ? `Results for "${searchTerm}"` : categories.find(c => c.slug === activeCategory)?.name || 'Products'}
                </h2>
                <p className="mp-result-count">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
              </div>
              <button className="mp-clear-btn" onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>
                <X size={14} /> Clear filters
              </button>
            </div>

            {/* Category pills still visible when filtering */}
            <div className="mp-cat-pills-row" style={{ marginBottom: 24 }}>
              <button className={`mp-cat-pill${activeCategory === 'all' ? ' on' : ''}`} onClick={() => setActiveCategory('all')}>
                <Grid3X3 size={13} />All
              </button>
              {topCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`mp-cat-pill${activeCategory === cat.slug ? ' on' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  <Tag size={12} />{cat.name}
                </button>
              ))}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="mp-product-grid">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />
                ))}
              </div>
            ) : (
              <div className="mp-empty card">
                <Search size={36} />
                <h3>No products found</h3>
                <p>Try a different keyword or browse a category below.</p>
                <button className="btn btn-primary" onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>
                  Clear filters <ArrowRight size={14} />
                </button>
              </div>
            )}
          </section>
        )}

        {/* ─── Below: only shown when NOT filtering ──────────────── */}
        {!isSearchActive && (
          <>
            {/* SPONSORED / FEATURED */}
            {(loading || sponsored.length > 0) && (
              <section className="mp-sec">
                <SectionHead
                  title="Featured today"
                  right={<span className="mp-sp-badge"><Sparkles size={11} />Sponsored</span>}
                />
                <div className="mp-product-grid">
                  {loading && !sponsored.length
                    ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : sponsored.map((p) => (
                        <ProductCard key={p.id} product={p} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />
                      ))
                  }
                </div>
              </section>
            )}

            {/* STORES WORTH FOLLOWING */}
            {(loading || topStores.length > 0) && (
              <section className="mp-sec">
                <SectionHead
                  title="Stores worth following"
                  right={
                    <a href="/stores" className="mp-see-all">
                      All stores <ChevronRight size={14} />
                    </a>
                  }
                />
                <div className="mp-store-grid">
                  {loading && !topStores.length
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="mp-store-card" style={{ gap: 12 }}>
                          <Skeleton w={46} h={46} rounded={99} />
                          <div style={{ flex: 1 }}>
                            <Skeleton h={14} w="60%" />
                            <Skeleton h={11} w="40%" />
                          </div>
                        </div>
                      ))
                    : topStores.map((s) => <StoreCard key={s.id || s.username} store={s} />)
                  }
                </div>
              </section>
            )}

            {/* TRENDING NOW */}
            <section className="mp-sec">
              <SectionHead title="Trending now" icon={Flame} />
              <div className="mp-product-grid">
                {loading && !trending.length
                  ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : trending.slice(0, 8).map((p) => (
                      <ProductCard key={p.id} product={p} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />
                    ))
                }
              </div>
            </section>

            {/* JUST UPLOADED / LATEST */}
            {(loading || latestProds.length > 0) && (
              <section className="mp-sec mp-latest-band">
                <SectionHead
                  title="Just uploaded"
                  icon={Clock}
                  right={<span className="mp-fresh-tag">Fresh from new sellers</span>}
                />
                <div className="mp-product-grid">
                  {loading && !latestProds.length
                    ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : latestProds.map((p) => (
                        <ProductCard key={p.id} product={p} liked={!!liked[p.id]} onLike={() => toggleLike(p.id)} />
                      ))
                  }
                </div>
              </section>
            )}

            {/* HOW IT WORKS */}
            <section className="mp-sec mp-hiw-sec">
              <SectionHead title="How buying works" />
              <div className="mp-steps-grid">
                {[
                  { Icon: Search,        t: 'Find it',    d: 'Browse stores or search for what you need.' },
                  { Icon: ShieldCheck,   t: 'Pay safely', d: 'Pay on Frontstore and get an instant receipt.' },
                  { Icon: MessageCircle, t: 'Get it',     d: 'The store confirms on WhatsApp and you track delivery.' },
                ].map(({ Icon, t, d }, i) => (
                  <div key={i} className="mp-step-card card">
                    <span className="mp-step-num">{i + 1}</span>
                    <span className="mp-step-ic"><Icon size={20} /></span>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="mp-sec">
              <SectionHead title="Buying with confidence" icon={HelpCircle} />
              <div className="mp-faq-list">
                {FAQS.map((f, i) => (
                  <div key={i} className={`mp-faq-item${openFaq === i ? ' open' : ''}`}>
                    <button className="mp-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                      <span>{f.q}</span>
                      {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                    </button>
                    <div className="mp-faq-body">
                      <p>{f.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SELL BAND */}
            <section className="mp-sell-band">
              <div className="mp-sell-inner">
                <div className="mp-sell-copy">
                  <h2>Selling something? Your store is two minutes away.</h2>
                  <p>Claim your link, add products, and share it anywhere. We handle payments and receipts.</p>
                  <a href="/signup" className="btn btn-primary mp-sell-cta">
                    Open your free store <ArrowRight size={15} />
                  </a>
                  <span className="mp-sell-url">{systemDomain}/yourname</span>
                </div>
                <div className="mp-sell-blob" aria-hidden="true" />
              </div>
            </section>
          </>
        )}
      </main>

      {/* ─── SAVED ITEMS NUDGE (when something liked) ─────────────── */}
      {Object.values(liked).some(Boolean) && (
        <div className="mp-saved-toast">
          <Bookmark size={15} fill="currentColor" />
          {Object.values(liked).filter(Boolean).length} item{Object.values(liked).filter(Boolean).length !== 1 ? 's' : ''} saved
          <button onClick={() => setLiked({})}>Clear</button>
        </div>
      )}

      <PublicSiteFooter />

      {/* ─── Styles ───────────────────────────────────────────────── */}
      <style jsx global>{`
        /* ── Page shell ─────────────────────────────────── */
        .mp-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }
        .mp-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          width: 100%;
          flex: 1;
        }

        /* ── Hero ────────────────────────────────────────── */
        .mp-hero {
          position: relative;
          padding: clamp(52px, 9vw, 88px) 20px clamp(40px, 7vw, 72px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 40px;
          overflow: hidden;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 860px) {
          .mp-hero { flex-direction: row; align-items: center; gap: 48px; }
          .mp-hero-copy { flex: 1; }
        }
        .mp-hero-glow {
          position: absolute;
          top: -80px; right: -60px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 65%);
          pointer-events: none;
        }
        .mp-eyebrow {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: .08em;
          margin-bottom: 10px;
        }
        .mp-hero-h1 {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: clamp(28px, 5vw, 46px);
          line-height: 1.08;
          letter-spacing: -.03em;
          margin-bottom: 14px;
          color: var(--text);
        }
        .mp-hero-gradient {
          background: linear-gradient(135deg, var(--primary), hsl(158,84%,39%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .mp-hero-sub {
          font-size: clamp(14px, 2vw, 16px);
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 520px;
          margin-bottom: 22px;
        }

        /* Hero search */
        .mp-hero-search-wrap {
          position: relative;
          max-width: 520px;
          width: 100%;
          margin-bottom: 16px;
        }
        .mp-hs-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .mp-hero-search {
          width: 100%;
          padding: 15px 44px;
          border-radius: var(--r-xl);
          border: 1.5px solid var(--border);
          background: var(--surface);
          font-size: 15px;
          font-family: inherit;
          color: var(--text);
          box-shadow: var(--shadow-lg);
          transition: border-color .18s, box-shadow .18s;
        }
        .mp-hero-search:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }
        .mp-hs-clr {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          display: grid;
          place-items: center;
          width: 26px; height: 26px;
        }

        /* Chips */
        .mp-chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .mp-chip {
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
          font-family: inherit;
        }
        .mp-chip:hover {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary-dark, var(--primary));
        }

        /* Trust row */
        .mp-trust-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .mp-trust-row span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--primary);
        }

        /* Hero stats card */
        .mp-hero-stats-card {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-2xl);
          box-shadow: var(--shadow-xl);
          padding: 28px 32px;
          min-width: 260px;
          flex-shrink: 0;
        }
        @media (min-width: 860px) {
          .mp-hero-stats-card { flex-direction: column; gap: 0; min-width: 220px; }
          .mp-hero-stat-divider { width: 60%; height: 1px !important; }
        }
        .mp-hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 20px;
          flex: 1;
        }
        .mp-hero-stat strong {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 800;
          color: var(--primary);
        }
        .mp-hero-stat span {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .mp-hero-stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border);
          flex-shrink: 0;
        }

        /* ── Sections ─────────────────────────────────────── */
        .mp-sec {
          padding: 36px 0 8px;
        }
        .mp-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .mp-sec-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: clamp(18px, 3vw, 22px);
          letter-spacing: -.02em;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text);
        }
        .mp-sec-icon { color: var(--accent, #e8a33d); }
        .mp-sec-right { flex-shrink: 0; }
        .mp-see-all {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        .mp-see-all:hover { opacity: .8; }
        .mp-sp-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--surface-2, var(--surface));
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mp-fresh-tag {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--primary);
        }

        /* Category pills row */
        .mp-cat-sec { padding-top: 20px; }
        .mp-cat-pills-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mp-cat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 999px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          color: var(--text);
          cursor: pointer;
          font-family: inherit;
          transition: background .15s, border-color .15s, color .15s;
        }
        .mp-cat-pill:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
        .mp-cat-pill.on { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 700; }
        .mp-cat-count {
          font-size: 10px;
          background: var(--primary);
          color: #fff;
          border-radius: 999px;
          padding: 1px 6px;
        }

        /* ── Product grid ─────────────────────────────────── */
        .mp-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        @media (min-width: 640px) { .mp-product-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); } }
        @media (min-width: 900px) { .mp-product-grid { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); } }

        /* Product card */
        .mp-product-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: var(--r-lg, 14px);
        }
        .mp-product-image {
          position: relative;
          display: block;
          aspect-ratio: 1 / 1;
          background: var(--surface-2, var(--surface));
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          text-decoration: none;
        }
        .mp-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .3s;
        }
        .mp-product-card:hover .mp-product-image img { transform: scale(1.04); }
        .mp-product-cat-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          font-weight: 700;
          background: rgba(255,255,255,.88);
          color: var(--text);
          border-radius: 6px;
          padding: 3px 8px;
          backdrop-filter: blur(4px);
        }
        .mp-product-sponsored-tag {
          position: absolute;
          top: 10px;
          right: 36px;
          font-size: 10px;
          font-weight: 700;
          background: var(--accent, #e8a33d);
          color: #fff;
          border-radius: 6px;
          padding: 3px 8px;
        }
        .mp-like-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,.88);
          border: none;
          cursor: pointer;
          display: grid;
          place-items: center;
          color: var(--text);
          backdrop-filter: blur(4px);
          transition: transform .15s, background .15s;
        }
        .mp-like-btn:hover { transform: scale(1.1); }
        .mp-like-btn.on { background: rgba(255,255,255,.95); }
        .mp-product-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          flex: 1;
        }
        .mp-product-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          text-decoration: none;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mp-product-name:hover { color: var(--primary); }
        .mp-product-price {
          font-size: 16px;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--primary);
          margin: 0;
        }
        .mp-product-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .mp-product-store {
          display: flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .mp-product-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 13px;
        }
        .mp-product-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .mp-product-store-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mp-product-store-name svg { color: var(--primary); }

        /* ── Store grid ───────────────────────────────────── */
        .mp-store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }
        .mp-store-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg, 14px);
          text-decoration: none;
          color: var(--text);
          transition: box-shadow .18s, border-color .18s, transform .18s;
        }
        .mp-store-card:hover {
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .mp-store-avatar {
          width: 46px; height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), hsl(158,84%,39%));
          color: #fff;
          font-size: 18px;
          font-weight: 800;
          font-family: var(--font-heading);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mp-store-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .mp-store-info { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
        .mp-store-name {
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mp-store-bio {
          font-size: 12px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mp-store-chevron { color: var(--text-muted); flex-shrink: 0; }

        /* ── How it works ─────────────────────────────────── */
        .mp-hiw-sec {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          border-radius: var(--r-2xl);
          padding: 36px 28px;
          margin: 24px 0;
        }
        .mp-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .mp-step-card {
          padding: 22px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mp-step-num {
          position: absolute;
          top: 14px;
          right: 14px;
          font-family: var(--font-heading);
          font-size: 42px;
          font-weight: 900;
          color: var(--primary-light);
          line-height: 1;
          user-select: none;
        }
        .mp-step-ic {
          width: 44px; height: 44px;
          border-radius: var(--r-md, 12px);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mp-step-card h3 { font-size: 16px; font-weight: 700; }
        .mp-step-card p  { font-size: 13px; color: var(--text-muted); line-height: 1.55; }

        /* ── FAQ ──────────────────────────────────────────── */
        .mp-faq-list { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: var(--r-xl); overflow: hidden; }
        .mp-faq-item { border-bottom: 1px solid var(--border); }
        .mp-faq-item:last-child { border-bottom: none; }
        .mp-faq-q {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text);
          background: var(--surface);
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background .15s;
        }
        .mp-faq-q:hover { background: var(--primary-light); }
        .mp-faq-item.open .mp-faq-q { background: var(--primary-light); color: var(--primary); }
        .mp-faq-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height .3s cubic-bezier(.4,0,.2,1);
        }
        .mp-faq-item.open .mp-faq-body { max-height: 300px; }
        .mp-faq-body p {
          padding: 0 20px 18px;
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0;
        }

        /* ── Sell band ───────────────────────────────────── */
        .mp-sell-band {
          margin: 32px 0 48px;
          border-radius: var(--r-2xl);
          background: linear-gradient(135deg, var(--primary-dark, #085f3f) 0%, var(--primary) 60%, hsl(158,84%,39%) 100%);
          overflow: hidden;
          position: relative;
        }
        .mp-sell-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: clamp(32px, 6vw, 56px) clamp(24px, 5vw, 52px);
          position: relative;
          z-index: 1;
        }
        .mp-sell-copy {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 560px;
        }
        .mp-sell-copy h2 {
          font-family: var(--font-heading);
          font-size: clamp(20px, 4vw, 30px);
          font-weight: 800;
          letter-spacing: -.02em;
          color: #fff;
          line-height: 1.2;
        }
        .mp-sell-copy p { font-size: 15px; color: rgba(255,255,255,.82); line-height: 1.55; }
        .mp-sell-cta {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: var(--primary);
          padding: 13px 24px;
          border-radius: var(--r-xl);
          font-size: 14.5px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 24px rgba(0,0,0,.18);
          transition: transform .15s, box-shadow .15s;
        }
        .mp-sell-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,0,0,.22); }
        .mp-sell-url {
          font-size: 12px;
          color: rgba(255,255,255,.65);
          font-weight: 600;
        }
        .mp-sell-blob {
          position: absolute;
          top: -40%;
          right: -10%;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: rgba(255,255,255,.05);
          pointer-events: none;
        }

        /* ── Search header (active filter) ──────────────── */
        .mp-search-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }
        .mp-result-count { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
        .mp-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md, 10px);
          padding: 8px 14px;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: border-color .15s, color .15s;
          flex-shrink: 0;
        }
        .mp-clear-btn:hover { border-color: var(--primary); color: var(--primary); }

        /* ── Empty state ─────────────────────────────────── */
        .mp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          padding: 56px 24px;
          color: var(--text-muted);
        }
        .mp-empty svg { opacity: .2; }
        .mp-empty h3 { font-size: 18px; font-weight: 700; color: var(--text); }
        .mp-empty p  { font-size: 14px; }
        .mp-empty .btn { margin-top: 8px; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }

        /* ── Saved toast ─────────────────────────────────── */
        .mp-saved-toast {
          position: fixed;
          bottom: 24px;
          right: 20px;
          z-index: 90;
          background: var(--text);
          color: var(--bg);
          border-radius: var(--r-xl);
          padding: 12px 18px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: var(--shadow-xl);
          animation: slide-up .22s ease;
        }
        .mp-saved-toast button {
          background: none;
          border: none;
          color: var(--primary-light, #9de3c3);
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          font-family: inherit;
          padding: 0;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }

        /* ── Latest band ─────────────────────────────────── */
        .mp-latest-band {
          background: linear-gradient(180deg, transparent, var(--surface-2, var(--surface)));
          border-radius: var(--r-2xl);
          padding: 32px 24px;
          margin: 8px 0;
        }

        /* ── Mobile overrides ────────────────────────────── */
        @media (max-width: 640px) {
          .mp-hero { padding-left: 16px; padding-right: 16px; }
          .mp-main { padding: 0 14px; }
          .mp-hero-stats-card { padding: 18px 20px; min-width: unset; width: 100%; }
          .mp-hero-stat strong { font-size: 22px; }
          .mp-sell-inner { flex-direction: column; }
          .mp-sell-blob { display: none; }
          .mp-product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .mp-store-grid { grid-template-columns: 1fr; }
          .mp-steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
