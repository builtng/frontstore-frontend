'use client';

import React, { useMemo, useState } from 'react';
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
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

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

export default function MarketplaceHomeClient({
  initialData,
  initialSettings,
}: {
  initialData: MarketplaceData;
  initialSettings?: Settings | null;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const appName = initialSettings?.app_name || 'Frontstore';
  const products = initialData.products || [];
  const categories = initialData.categories || [];

  const filteredProducts = useMemo(
    () => products.filter((product) => productMatches(product, searchTerm, activeCategory)),
    [activeCategory, products, searchTerm]
  );

  const featuredProduct = products.find((product) => product.image_url) || products[0];
  const topCategories = categories.slice(0, 8);
  const storesCount = initialData.stats?.stores_count || new Set(products.map((product) => product.store?.username).filter(Boolean)).size;
  const productsCount = initialData.stats?.products_count || products.length;

  return (
    <div className="marketplace-page">
      <nav className="marketplace-nav glass">
        <a href="/" className="marketplace-logo" aria-label={`${appName} home`}>
          <Logo size={24} textColor="var(--primary)" />
        </a>
        <div className="marketplace-nav__links">
          <ThemeToggle />
          <a href="/stores" className="btn btn-ghost marketplace-nav__secondary">Stores</a>
          <a href="/business" className="btn btn-ghost marketplace-nav__secondary">For Business</a>
          <a href="/login" className="btn btn-ghost">Sign in</a>
          <a href="/signup" className="btn btn-primary">Sell here <ArrowRight size={14} /></a>
        </div>
      </nav>

      <header className="marketplace-hero">
        <section className="marketplace-hero__copy">
          <span className="badge badge-primary"><ShoppingBag size={12} /> Marketplace</span>
          <h1>Discover products uploaded by businesses on {appName}.</h1>
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
            <span><strong>{productsCount.toLocaleString()}</strong> uploads</span>
            <span><strong>{storesCount.toLocaleString()}</strong> businesses</span>
            <span><strong>{categories.length.toLocaleString()}</strong> categories</span>
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

      <footer className="marketplace-footer">
        <Logo size={20} textColor="var(--primary)" />
        <div>
          <a href="/stores">Stores</a>
          <a href="/business">For Business</a>
          <a href="/blog">Blog</a>
          <a href="/privacy">Privacy</a>
        </div>
      </footer>

      <style jsx global>{`
        .marketplace-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 12%, transparent), transparent 34rem),
            linear-gradient(180deg, var(--surface) 0%, var(--bg) 42%, var(--bg) 100%);
        }

        .marketplace-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
        }

        .marketplace-logo {
          display: inline-flex;
          flex-shrink: 0;
        }

        .marketplace-nav__links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .marketplace-nav__links .btn {
          padding: 8px 14px;
          font-size: 13px;
          text-decoration: none;
        }

        .marketplace-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 32px;
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 54px 0 34px;
          align-items: center;
        }

        .marketplace-hero__copy h1 {
          max-width: 780px;
          margin: 16px 0;
          font-family: var(--font-heading);
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1;
          letter-spacing: 0;
        }

        .marketplace-hero__copy p {
          max-width: 640px;
          color: var(--text-2);
          font-size: 18px;
          line-height: 1.65;
        }

        .marketplace-search {
          display: flex;
          align-items: center;
          gap: 12px;
          width: min(640px, 100%);
          margin-top: 28px;
          padding: 12px 16px;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-lg);
          background: var(--surface);
          box-shadow: var(--shadow-lg);
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
        }

        .marketplace-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .marketplace-stats span {
          display: inline-flex;
          gap: 5px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: color-mix(in srgb, var(--surface) 78%, transparent);
          color: var(--text-muted);
          font-size: 13px;
        }

        .marketplace-stats strong {
          color: var(--text);
        }

        .marketplace-featured__card,
        .marketplace-featured__empty {
          display: block;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          background: var(--surface);
          box-shadow: var(--shadow-xl);
        }

        .marketplace-featured__image {
          display: grid;
          place-items: center;
          aspect-ratio: 4 / 3;
          background: var(--surface-2);
          color: var(--text-faint);
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
          font-size: 25px;
          line-height: 1.15;
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
        }

        .marketplace-main {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 20px 0 64px;
        }

        .marketplace-categories {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 0 18px;
        }

        .marketplace-categories button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: var(--surface);
          color: var(--text-2);
          cursor: pointer;
          font-size: 13px;
          font-weight: 800;
        }

        .marketplace-categories button span {
          color: var(--text-faint);
          font-size: 11px;
        }

        .marketplace-categories button.is-active {
          border-color: var(--primary);
          background: var(--primary);
          color: #fff;
        }

        .marketplace-categories button.is-active span {
          color: color-mix(in srgb, #fff 75%, transparent);
        }

        .marketplace-section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin: 22px 0;
        }

        .marketplace-section-heading h2 {
          margin-top: 10px;
          font-family: var(--font-heading);
          font-size: clamp(24px, 4vw, 36px);
          line-height: 1.12;
        }

        .marketplace-section-heading p {
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 800;
        }

        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
        }

        .marketplace-product {
          overflow: hidden;
          border-radius: var(--r-lg);
        }

        .marketplace-product__image {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--surface-2);
          color: var(--text-faint);
        }

        .marketplace-product__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--t-slow) var(--ease);
        }

        .marketplace-product:hover .marketplace-product__image img {
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
          background: color-mix(in srgb, var(--surface) 88%, transparent);
          color: var(--text);
          font-size: 11px;
          font-weight: 900;
          box-shadow: var(--shadow-sm);
        }

        .marketplace-product__body {
          padding: 14px;
        }

        .marketplace-product__name {
          display: -webkit-box;
          min-height: 40px;
          overflow: hidden;
          color: var(--text);
          font-weight: 900;
          line-height: 1.35;
          text-decoration: none;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .marketplace-product__price {
          margin-top: 8px;
          color: var(--primary);
          font-size: 17px;
          font-weight: 950;
        }

        .marketplace-product__desc {
          display: -webkit-box;
          min-height: 40px;
          margin-top: 8px;
          overflow: hidden;
          color: var(--text-muted);
          font-size: 12.5px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .marketplace-product__store {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          text-decoration: none;
        }

        .marketplace-product__avatar {
          display: grid;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          place-items: center;
          overflow: hidden;
          border-radius: var(--r-full);
          background: var(--primary-light);
          color: var(--primary);
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
        }

        .marketplace-empty h2 {
          margin-top: 12px;
          color: var(--text);
          font-family: var(--font-heading);
        }

        .marketplace-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 24px 20px;
          border-top: 1px solid var(--border);
          background: var(--surface);
        }

        .marketplace-footer div {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 16px;
        }

        .marketplace-footer a {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 860px) {
          .marketplace-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .marketplace-nav {
            padding: 10px 12px;
          }

          .marketplace-nav__links {
            gap: 4px;
          }

          .marketplace-nav__links .btn {
            padding: 7px 9px;
            font-size: 12px;
          }

          .marketplace-nav__secondary {
            display: none;
          }

          .marketplace-hero,
          .marketplace-main {
            width: min(100% - 24px, 1180px);
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
          }

          .marketplace-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .marketplace-product__body {
            padding: 11px;
          }

          .marketplace-product__desc {
            display: none;
          }

          .marketplace-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .marketplace-footer div {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
