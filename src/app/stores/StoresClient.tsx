'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Store, ArrowRight, Search, Instagram, ShieldCheck, MapPin, Star, Package, Sparkles, X, Megaphone } from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { PublicSiteNav, PublicSiteFooter } from '../../components/PublicSiteChrome';
import { formatOsmCategory } from '../../utils/osmCategoryLabels';
import { getOptimizedImageUrl } from '../../lib/image';

export interface UnclaimedListing {
  id: string;
  name: string;
  slug: string;
  category_key: string | null;
  category_value: string | null;
  persona_id: string;
  address: string | null;
  city: string | null;
  state: string | null;
}

export interface StoreItem {
  id: string;
  store_name: string;
  store_bio: string | null;
  username: string;
  currency_code: string;
  whatsapp_phone: string;
  logo_url?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  location?: string | null;
  category_label?: string | null;
  business_persona?: string | null;
  is_verified?: boolean;
  items_count?: number;
  reviews_avg_rating?: number | null;
  created_at?: string;
}

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'az', label: 'A–Z' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

const UNCLAIMED_DISPLAY_LIMIT = 60;

export default function StoresClient({ initialStores, initialUnclaimed }: { initialStores: StoreItem[]; initialUnclaimed?: UnclaimedListing[] }) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [loading, setLoading] = useState(!initialStores || initialStores.length === 0);
  const unclaimedListings = (initialUnclaimed || []).slice(0, UNCLAIMED_DISPLAY_LIMIT);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    // Skip client-side fetch on mount if stores are already loaded from the server
    if (initialStores && initialStores.length > 0) {
      return;
    }

    const fetchStores = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/stores`);
        const json = await res.json();
        if (res.ok && json.data) {
          setStores(json.data);
        }
      } catch (err) {
        console.error('Failed to load store list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [initialStores, API_URL]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    stores.forEach(s => { if (s.category_label) set.add(s.category_label); });
    return ['All', ...Array.from(set).sort()];
  }, [stores]);

  const filteredStores = useMemo(() => {
    let list = stores.filter(store =>
      (store.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.store_bio && store.store_bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (store.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeCategory !== 'All') {
      list = list.filter(s => s.category_label === activeCategory);
    }

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else if (sortBy === 'az') {
      list = [...list].sort((a, b) => (a.store_name || a.username).localeCompare(b.store_name || b.username));
    }

    return list;
  }, [stores, searchTerm, activeCategory, sortBy]);

  if (loading) {
    return <StoresLoadingState />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      {/* Hero */}
      <header style={{ position: 'relative', overflow: 'hidden', padding: '76px 20px 52px', borderBottom: '1px solid var(--border)' }}>
        <div className="hero-mesh" />
        <div className="hero-grid" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-verified animate-fade-in">
            <Sparkles size={11} /> Verified store directory
          </span>
          <h1 className="text-display" style={{ marginTop: 18, marginBottom: 14 }}>
            Real stores. Real sellers.<br />Shop with confidence.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 32px' }}>
            Every store here runs on Frontstore&apos;s secure checkout. Browse independent businesses
            and buy direct &mdash; no middlemen, no guesswork.
          </p>

          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--r-xl)', padding: '8px 8px 8px 18px', maxWidth: 520, margin: '0 auto' }}>
            <Search size={18} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search stores by name, category, or bio..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '10px 0', fontSize: 14.5, background: 'transparent', color: 'var(--text)' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clickable" style={{ color: 'var(--text-faint)', padding: 6, flexShrink: 0 }} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { icon: ShieldCheck, text: 'Verified Sellers' },
              { icon: WhatsAppIcon, text: 'Direct WhatsApp Checkout' },
              { icon: Package, text: 'Direct Delivery & Pickup' },
            ].map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--surface-2, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  <Icon size={15} color="var(--primary)" />
                  <span>{pill.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 20px 24px', maxWidth: 1120, margin: '0 auto', width: '100%' }}>
        {categories.length > 1 && (
          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 22 }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-chip${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'}{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {SORTS.map(s => (
              <button
                key={s.key}
                className={`btn ${sortBy === s.key ? 'btn-outline' : 'btn-ghost'}`}
                style={{ padding: '7px 14px', fontSize: 12.5 }}
                onClick={() => setSortBy(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {filteredStores.length > 0 ? (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {filteredStores.map(store => (
              <StoreDirectoryCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '64px 20px', textAlign: 'center' }}>
            <Store size={30} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text)' }}>No stores matched your search</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Try a different keyword or clear your filters.</p>
          </div>
        )}

        {unclaimedListings.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                More businesses to discover
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Found on public map data but not yet on Frontstore — the owner can claim any of these for free.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {unclaimedListings.map((listing) => (
                <UnclaimedListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Merchant CTA band */}
      <section style={{ padding: '56px 20px 64px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          maxWidth: 1120, margin: '0 auto', borderRadius: 28,
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          padding: '44px 36px', color: '#fff',
          display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ position: 'absolute', top: '-45%', right: '-8%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <h3 className="font-heading" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-.02em' }}>
              Got something to sell?
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', lineHeight: 1.55 }}>
              Claim your store link, list your products, and start taking orders on WhatsApp today.
            </p>
          </div>
          <a
            href="/signup"
            className="clickable"
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: 'var(--primary-dark)', padding: '13px 24px', borderRadius: 12, fontWeight: 750, fontSize: 14, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
          >
            Create your free store <ArrowRight size={15} />
          </a>
        </div>
      </section>

      <PublicSiteFooter />
    </div>
  );
}

export function StoreDirectoryCard({ store }: { store: StoreItem }) {
  const storeUrl = `/${store.username}`;
  const initials = (store.store_name || store.username || 'S').charAt(0).toUpperCase();
  const rating = typeof store.reviews_avg_rating === 'number' ? store.reviews_avg_rating : null;
  const [imgError, setImgError] = useState(false);

  const logoSrc = store.logo_url ? getOptimizedImageUrl(store.logo_url, 'thumb') : null;

  return (
    <div className="card card-hover hover-lift" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0, overflow: 'hidden',
          background: (logoSrc && !imgError) ? 'transparent' : 'linear-gradient(135deg, var(--primary), hsl(178, 76%, 45%))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)',
        }}>
          {logoSrc && !imgError ? (
            <img
              src={logoSrc}
              alt={store.store_name || store.username}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <h4 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {store.store_name || store.username}
            </h4>
            {store.is_verified && <ShieldCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>@{store.username}</span>
            {store.location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--text-faint)' }}>
                <MapPin size={10} />{store.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, minHeight: 40,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {store.store_bio || 'No bio description provided.'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {store.category_label && <span className="badge badge-primary">{store.category_label}</span>}
        {rating !== null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
            <Star size={12} fill="var(--accent)" color="var(--accent)" />{rating.toFixed(1)}
          </span>
        )}
        {!!store.items_count && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--text-muted)' }}>
            <Package size={12} />{store.items_count} item{store.items_count === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          <a
            href={`https://wa.me/${(store.whatsapp_phone || '').replace(/\D/g, '')}`}
            className="clickable"
            style={{ padding: 6, color: '#25d366' }}
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon size={16} />
          </a>
          {store.instagram_handle && (
            <a
              href={`https://instagram.com/${store.instagram_handle}`}
              className="clickable"
              style={{ padding: 6, color: 'var(--text-muted)' }}
              title="Instagram"
            >
              <Instagram size={16} />
            </a>
          )}
        </div>

        <Link
          href={storeUrl}
          className="btn btn-primary clickable"
          style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 'var(--r-sm)', textDecoration: 'none' }}
        >
          Visit store <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function UnclaimedListingCard({ listing }: { listing: UnclaimedListing }) {
  const initials = (listing.name || 'B').charAt(0).toUpperCase();
  const location = [listing.city, listing.state].filter(Boolean).join(', ');

  return (
    <div className="card card-hover hover-lift" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, borderStyle: 'dashed' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-faint)', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)',
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.name}
          </h4>
          {location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
              <MapPin size={10} />{location}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {formatOsmCategory(listing.category_value)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>
          <Megaphone size={11} /> Unclaimed listing
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 'auto' }}>
        <Link
          href={`/claim/${listing.slug}`}
          className="btn btn-outline clickable"
          style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 'var(--r-sm)', textDecoration: 'none', width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          Is this your business? Claim it <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function StoresLoadingState() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '76px 20px 40px', width: '100%' }}>
        <div className="skeleton" style={{ height: 22, width: 190, borderRadius: 999, margin: '0 auto 18px' }} />
        <div className="skeleton" style={{ height: 40, width: '55%', margin: '0 auto 14px' }} />
        <div className="skeleton" style={{ height: 52, width: '100%', maxWidth: 520, margin: '0 auto 44px', borderRadius: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: '40%' }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '80%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
