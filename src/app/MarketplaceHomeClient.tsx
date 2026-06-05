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

  const [products, setProducts] = useState<MarketplaceProduct[]>(() => {
    const prods = initialData?.products;
    return Array.isArray(prods) ? prods : (prods ? Object.values(prods) : []);
  });
  const [categories, setCategories] = useState<CategorySummary[]>(() => {
    const cats = initialData?.categories;
    return Array.isArray(cats) ? cats : (cats ? Object.values(cats) : []);
  });
  const [stats, setStats] = useState(initialData?.stats);
  const [loading, setLoading] = useState(!initialData || !initialData.products || !Array.isArray(initialData.products) || initialData.products.length === 0);

  useEffect(() => {
    const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
    const loadFreshData = async () => {
      try {
        if (!Array.isArray(products) || products.length === 0) {
          setLoading(true);
        }
        const res = await fetch(`${savedApiUrl}/v1/public/marketplace`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setProducts(Array.isArray(json.data.products) ? json.data.products : (json.data.products ? Object.values(json.data.products) : []));
            setCategories(Array.isArray(json.data.categories) ? json.data.categories : (json.data.categories ? Object.values(json.data.categories) : []));
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
          {featuredProduct && featuredProduct.store?.username ? (
            <a href={`/${featuredProduct.store.username}/products/${featuredProduct.slug}`} className="marketplace-featured__card">
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
                          <img src={product.store.logo_url} alt={product.store.store_name || 'Store'} />
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
    </div>
  );
}
