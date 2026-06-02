'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  ChevronRight,
  Grid3X3,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '../components/PublicSiteChrome';
import Logo from '../components/Logo';

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
  category?: CategorySummary | null;
  store?: StoreSummary | null;
};

type MarketplaceData = {
  products: MarketplaceProduct[];
  categories: CategorySummary[];
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

const currencySymbols: Record<string, string> = {
  NGN: 'NGN ',
  GHS: 'GHS ',
  KES: 'KES ',
  ZAR: 'R',
  USD: '$',
  GBP: 'GBP ',
};

function formatPrice(value: string | number, currencyCode?: string) {
  const amount = typeof value === 'number' ? value : Number(value);
  const symbol = currencySymbols[(currencyCode || 'NGN').toUpperCase()] || `${currencyCode || 'NGN'} `;

  if (!Number.isFinite(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function productMatches(product: MarketplaceProduct, searchTerm: string, categorySlug: string) {
  const search = searchTerm.trim().toLowerCase();
  const matchesCategory = categorySlug === 'all' || product.category?.slug === categorySlug;
  if (!matchesCategory) return false;
  if (!search) return true;

  return [
    product.name,
    product.description,
    product.category?.name,
    product.store?.store_name,
    product.store?.username,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(search));
}

function ProductCardSkeleton() {
  return (
    <div className="marketplace-product card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '1 / 1', width: '100%' }} />
      <div className="marketplace-product__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 3, marginTop: 4 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div className="skeleton" style={{ width: 34, height: 34, borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div className="skeleton" style={{ height: 10, width: '30%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedProductSkeleton() {
  return (
    <div className="marketplace-featured__card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '4 / 3', width: '100%' }} />
      <div className="marketplace-featured__meta" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 16, width: '30%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 24, width: '80%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 20, width: '40%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4, marginTop: 12 }} />
      </div>
    </div>
  );
}

export default function MarketplaceHomeClient({
  initialData,
  initialSettings,
}: {
  initialData: MarketplaceData;
  initialSettings?: Settings | null;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [products, setProducts] = useState<MarketplaceProduct[]>(initialData.products || []);
  const [categories, setCategories] = useState<CategorySummary[]>(initialData.categories || []);
  const [stats, setStats] = useState(initialData.stats);
  const [loading, setLoading] = useState(!initialData || !initialData.products || initialData.products.length === 0);

  useEffect(() => {
    const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
    const loadFreshData = async () => {
      try {
        if (products.length === 0) {
          setLoading(true);
        }
        const res = await fetch(`${savedApiUrl}/v1/public/marketplace`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setProducts(json.data.products || []);
            setCategories(json.data.categories || []);
            setStats(json.data.stats);
          }
        }
      } catch (err) {
        console.error('Failed to fetch marketplace data on client:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFreshData();
  }, []);

  const appName = initialSettings?.app_name || 'Frontstore';

  const filteredProducts = useMemo(
    () => products.filter((product) => productMatches(product, searchTerm, activeCategory)),
    [activeCategory, products, searchTerm]
  );

  const featuredProduct = products.find((product) => product.image_url) || products[0];
  const topCategories = categories.slice(0, 8);
  const storesCount = stats?.stores_count || new Set(products.map((product) => product.store?.username).filter(Boolean)).size;
  const productsCount = stats?.products_count || products.length;

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 16
      }}>
        <Logo size={48} textColor="var(--primary)" />
        <div className="spinner" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Loading marketplace...</span>
        
        <style jsx global>{`
          .spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <PublicSiteNav />

      <header className="marketplace-hero">
        <div className="marketplace-hero__grid-overlay" />
        <section className="marketplace-hero__copy">
          <span className="badge badge-primary"><ShoppingBag size={12} /> Marketplace</span>
          <h1>Discover products uploaded by businesses on <span className="brand-gradient">{appName}</span>.</h1>
          <p>
            Browse fresh products by category, see the business behind every upload, and open the store when you are ready to buy.
          </p>

          <div className="marketplace-search" role="search">
            <Search size={20} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, stores, or categories"
              aria-label="Search products, stores, or categories"
            />
          </div>

          <div className="marketplace-stats" aria-label="Marketplace stats">
            {loading ? (
              <>
                <span className="skeleton" style={{ width: 80, height: 28, borderRadius: 'var(--r-full)' }} />
                <span className="skeleton" style={{ width: 95, height: 28, borderRadius: 'var(--r-full)' }} />
                <span className="skeleton" style={{ width: 95, height: 28, borderRadius: 'var(--r-full)' }} />
              </>
            ) : (
              <>
                <span><strong>{productsCount.toLocaleString()}</strong> uploads</span>
                <span><strong>{storesCount.toLocaleString()}</strong> businesses</span>
                <span><strong>{categories.length.toLocaleString()}</strong> categories</span>
              </>
            )}
          </div>
        </section>

        <aside className="marketplace-featured" aria-label="Featured product">
          {featuredProduct ? (
            <a href={`/${featuredProduct.store?.username}/products/${featuredProduct.slug}`} className="marketplace-featured__card">
              <div className="marketplace-featured__image">
                {featuredProduct.image_url ? (
                  <img src={featuredProduct.image_url} alt={featuredProduct.name} />
                ) : (
                  <Boxes size={54} />
                )}
              </div>
              <div className="marketplace-featured__meta">
                <span className="badge badge-accent"><Sparkles size={11} /> Fresh upload</span>
                <h2>{featuredProduct.name}</h2>
                <p>{formatPrice(featuredProduct.price, featuredProduct.store?.currency_code)}</p>
                <span>Uploaded by {featuredProduct.store?.store_name || 'a business'} <ChevronRight size={14} /></span>
              </div>
            </a>
          ) : (
            <div className="marketplace-featured__empty">
              <Store size={42} />
              <h2>No products yet</h2>
              <p>Products uploaded by businesses will appear here.</p>
            </div>
          )}
        </aside>
      </header>

      <main className="marketplace-main">
        <section className="marketplace-categories" aria-label="Product categories">
          {loading && categories.length === 0 ? (
            <>
              <div className="skeleton" style={{ width: 68, height: 38, borderRadius: 'var(--r-full)' }} />
              <div className="skeleton" style={{ width: 88, height: 38, borderRadius: 'var(--r-full)' }} />
              <div className="skeleton" style={{ width: 100, height: 38, borderRadius: 'var(--r-full)' }} />
              <div className="skeleton" style={{ width: 80, height: 38, borderRadius: 'var(--r-full)' }} />
              <div className="skeleton" style={{ width: 92, height: 38, borderRadius: 'var(--r-full)' }} />
            </>
          ) : (
            <>
              <button
                type="button"
                className={activeCategory === 'all' ? 'is-active' : ''}
                onClick={() => setActiveCategory('all')}
              >
                <Grid3X3 size={15} /> All
              </button>
              {topCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={activeCategory === category.slug ? 'is-active' : ''}
                  onClick={() => setActiveCategory(category.slug)}
                >
                  <Tag size={15} /> {category.name}
                  {typeof category.active_products_count === 'number' && <span>{category.active_products_count}</span>}
                </button>
              ))}
            </>
          )}
        </section>

        <section className="marketplace-section-heading">
          <div>
            <span className="badge badge-primary"><Boxes size={12} /> Latest uploads</span>
            <h2>{activeCategory === 'all' ? 'Shop everything businesses are uploading' : `Shop ${categories.find((category) => category.slug === activeCategory)?.name || 'this category'}`}</h2>
          </div>
          <p>{filteredProducts.length.toLocaleString()} product{filteredProducts.length === 1 ? '' : 's'} visible</p>
        </section>

        {filteredProducts.length > 0 ? (
          <section className="marketplace-grid">
            {filteredProducts.map((product) => {
              const productUrl = product.store?.username ? `/${product.store.username}/products/${product.slug}` : '#';
              const storeUrl = product.store?.username ? `/${product.store.username}` : '#';
              return (
                <article key={product.id} className="marketplace-product card card-hover">
                  <a href={productUrl} className="marketplace-product__image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} loading="lazy" />
                    ) : (
                      <ShoppingBag size={42} />
                    )}
                    {product.category?.name && <span>{product.category.name}</span>}
                  </a>
                  <div className="marketplace-product__body">
                    <a href={productUrl} className="marketplace-product__name">{product.name}</a>
                    <p className="marketplace-product__price">{formatPrice(product.price, product.store?.currency_code)}</p>
                    {product.description && <p className="marketplace-product__desc">{product.description}</p>}
                    <a href={storeUrl} className="marketplace-product__store">
                      <span className="marketplace-product__avatar">
                        {product.store?.logo_url ? (
                          <img src={product.store.logo_url} alt={product.store.store_name} />
                        ) : (
                          <Building2 size={16} />
                        )}
                      </span>
                      <span>
                        <small>Uploaded by</small>
                        <strong>
                          {product.store?.store_name || 'Business'}
                          {product.store?.is_verified && <BadgeCheck size={14} />}
                        </strong>
                      </span>
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="marketplace-empty card">
            <Search size={34} />
            <h2>No matching products</h2>
            <p>Try another search term or choose a different category.</p>
          </section>
        )}
      </main>

      <PublicSiteFooter />

      <style jsx global>{`
        .marketplace-page {
          min-height: 100vh;
          background-color: var(--bg);
          background-image:
            radial-gradient(circle at 10% 20%, var(--primary-glow) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, var(--primary-glow) 0%, transparent 35%),
            linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%);
          position: relative;
        }

        .brand-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }

        .marketplace-hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 40px;
          width: min(1200px, calc(100% - 40px));
          margin: 0 auto;
          padding: 72px 0 54px;
          align-items: center;
          z-index: 1;
        }

        .marketplace-hero__grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at 20% 40%, black 30%, transparent 90%);
          opacity: 0.16;
          pointer-events: none;
          z-index: -1;
        }

        .marketplace-hero__copy h1 {
          max-width: 780px;
          margin: 16px 0;
          font-family: var(--font-heading);
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.1;
          letter-spacing: -0.03em;
          font-weight: 900;
        }

        .marketplace-hero__copy p {
          max-width: 600px;
          color: var(--text-2);
          font-size: 17.5px;
          line-height: 1.65;
          margin-bottom: 24px;
        }

        .marketplace-search {
          display: flex;
          align-items: center;
          gap: 12px;
          width: min(640px, 100%);
          margin-top: 28px;
          padding: 14px 20px;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-xl);
          background: var(--glass-bg);
          backdrop-filter: blur(8px);
          box-shadow: var(--shadow-md);
          transition: all var(--t-normal) var(--ease);
        }

        .marketplace-search:focus-within {
          border-color: var(--primary);
          box-shadow: 0 10px 25px -5px var(--primary-glow), 0 0 0 3px var(--primary-glow);
        }

        .marketplace-search svg {
          color: var(--text-faint);
          flex-shrink: 0;
        }

        .marketplace-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 15px;
          color: var(--text);
        }

        .marketplace-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .marketplace-stats span {
          display: inline-flex;
          gap: 6px;
          padding: 7px 14px;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: var(--surface);
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          box-shadow: var(--shadow-xs);
          transition: all var(--t-fast) var(--ease);
        }

        .marketplace-stats span:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .marketplace-stats strong {
          color: var(--text);
        }

        .marketplace-featured__card,
        .marketplace-featured__empty {
          display: block;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          border-radius: var(--r-2xl);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          box-shadow: var(--shadow-xl);
          transition: transform var(--t-slow) var(--ease-spring), box-shadow var(--t-slow) var(--ease), border-color var(--t-normal) var(--ease);
        }

        .marketplace-featured__card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: var(--primary);
          box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.15), 0 0 0 1px var(--primary-glow);
        }

        .marketplace-featured__image {
          display: grid;
          place-items: center;
          aspect-ratio: 4 / 3;
          background: var(--surface-2);
          color: var(--text-faint);
          border-bottom: 1px solid var(--border);
        }

        .marketplace-featured__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .marketplace-featured__meta {
          padding: 20px;
        }

        .marketplace-featured__meta h2 {
          margin: 12px 0 6px;
          font-family: var(--font-heading);
          font-size: 24px;
          line-height: 1.15;
          font-weight: 800;
          color: var(--text);
        }

        .marketplace-featured__meta p {
          color: var(--primary);
          font-size: 20px;
          font-weight: 900;
        }

        .marketplace-featured__meta > span:last-child {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 16px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 700;
        }

        .marketplace-featured__empty {
          display: grid;
          min-height: 360px;
          place-items: center;
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
        }

        .marketplace-featured__empty h2 {
          color: var(--text);
          font-family: var(--font-heading);
          font-weight: 800;
          margin-top: 14px;
        }

        .marketplace-main {
          width: min(1200px, calc(100% - 40px));
          margin: 0 auto;
          padding: 20px 0 64px;
        }

        .marketplace-categories {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 4px 18px;
          scrollbar-width: none;
        }

        .marketplace-categories::-webkit-scrollbar {
          display: none;
        }

        .marketplace-categories button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
          padding: 10px 18px;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: var(--surface);
          color: var(--text-2);
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          box-shadow: var(--shadow-xs);
          transition: all var(--t-normal) var(--ease);
        }

        .marketplace-categories button span {
          color: var(--text-faint);
          font-size: 11px;
        }

        .marketplace-categories button:hover:not(.is-active) {
          border-color: var(--primary);
          background: var(--primary-light);
          color: var(--primary);
        }

        .marketplace-categories button.is-active {
          border-color: var(--primary);
          background: var(--primary);
          color: #fff;
          box-shadow: var(--shadow-primary);
        }

        .marketplace-categories button.is-active span {
          color: color-mix(in srgb, #fff 75%, transparent);
        }

        .marketplace-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin: 36px 0 24px;
        }

        .marketplace-section-heading h2 {
          margin-top: 10px;
          font-family: var(--font-heading);
          font-size: clamp(24px, 4vw, 32px);
          line-height: 1.15;
          font-weight: 800;
          color: var(--text);
        }

        .marketplace-section-heading p {
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 800;
        }

        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .marketplace-product.card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          box-shadow: var(--shadow-xs);
          transition: all var(--t-slow) var(--ease-spring);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .marketplace-product.card:hover {
          transform: translateY(-6px);
          border-color: var(--primary);
          box-shadow: 0 20px 40px -12px var(--primary-glow), 0 0 0 1px var(--primary-glow);
        }

        .marketplace-product__image {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--surface-2);
          color: var(--text-faint);
          border-bottom: 1px solid var(--border);
        }

        .marketplace-product__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--t-slow) var(--ease);
        }

        .marketplace-product.card:hover .marketplace-product__image img {
          transform: scale(1.04);
        }

        .marketplace-product__image span {
          position: absolute;
          left: 10px;
          bottom: 10px;
          max-width: calc(100% - 20px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 5px 9px;
          border-radius: var(--r-full);
          background: color-mix(in srgb, var(--surface) 92%, transparent);
          color: var(--text);
          font-size: 11px;
          font-weight: 800;
          box-shadow: var(--shadow-sm);
        }

        .marketplace-product__body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .marketplace-product__name {
          font-family: var(--font-heading);
          font-weight: 850;
          font-size: 15px;
          color: var(--text);
          line-height: 1.4;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
          margin-bottom: 6px;
        }

        .marketplace-product__name:hover {
          color: var(--primary);
        }

        .marketplace-product__price {
          color: var(--primary);
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .marketplace-product__desc {
          color: var(--text-muted);
          font-size: 12.5px;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
          margin-bottom: 14px;
        }

        .marketplace-product__store {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          text-decoration: none;
          margin-top: auto;
        }

        .marketplace-product__avatar {
          display: grid;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          place-items: center;
          overflow: hidden;
          border-radius: var(--r-full);
          background: var(--primary-light);
          color: var(--primary);
          border: 1px solid var(--border);
        }

        .marketplace-product__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .marketplace-product__store small {
          display: block;
          color: var(--text-faint);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .marketplace-product__store strong {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-2);
          font-size: 12.5px;
          line-height: 1.25;
        }

        .marketplace-product__store strong svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        .marketplace-empty {
          display: grid;
          place-items: center;
          padding: 54px 20px;
          text-align: center;
          color: var(--text-muted);
          margin-top: 12px;
          color: var(--text);
          font-family: var(--font-heading);
        }

        @media (max-width: 860px) {
          .marketplace-hero {
            grid-template-columns: 1fr;
            padding: 40px 0;
            gap: 24px;
          }
        }

        @media (max-width: 640px) {
          .marketplace-hero,
          .marketplace-main {
            width: min(100% - 24px, 1200px);
          }

          .marketplace-hero {
            padding-top: 34px;
          }

          .marketplace-hero__copy p {
            font-size: 15px;
          }

          .marketplace-section-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .marketplace-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .marketplace-product__body {
            padding: 12px;
          }

          .marketplace-product__desc {
            display: none;
          }

          .marketplace-product__price {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
