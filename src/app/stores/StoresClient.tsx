'use client';

import React, { useState, useEffect } from 'react';
import { Store, ArrowRight, Search, Globe, Instagram, ShieldCheck, ShoppingBag } from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { PublicSiteNav, PublicSiteFooter } from '../../components/PublicSiteChrome';
import Logo from '../../components/Logo';

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
}

export default function StoresClient({ initialStores }: { initialStores: StoreItem[] }) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(!initialStores || initialStores.length === 0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  useEffect(() => {
    const fetchStores = async () => {
      try {
        if (stores.length === 0) {
          setLoading(true);
        }
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
  }, []);

  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.store_bio && store.store_bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
    store.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Loading stores...</span>
        
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      <PublicSiteNav />

      {/* Hero Header */}
      <header style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--surface) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>
            <ShoppingBag size={11} /> Storefront Directory
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Explore Verified Stores
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15.5, lineHeight: 1.6, marginBottom: 28 }}>
            Browse and purchase directly from verified WhatsApp-native stores on the frontstore platform.
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '6px 14px',
            boxShadow: 'var(--shadow-md)',
            alignItems: 'center',
            gap: 10,
            maxWidth: 480,
            margin: '0 auto'
          }}>
            <Search size={18} style={{ color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search stores by name, bio, or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '8px 0', fontSize: 14.5,
                background: 'transparent', color: 'var(--text)'
              }}
            />
          </div>
        </div>
      </header>

      {/* Directory list container */}
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800 }}>
            {searchTerm ? 'Search Results' : 'All Stores'}
          </h3>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'} found
          </span>
        </div>

        {filteredStores.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {filteredStores.map(store => {
              const storeUrl = `/${store.username}`;

              return (
                <div
                  key={store.id}
                  className="card hover-lift"
                  style={{
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 220
                  }}
                >
                  <div>
                    {/* Title block */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-heading)',
                        overflow: 'hidden', flexShrink: 0
                      }}>
                        {store.logo_url ? (
                          <img src={store.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.store_name} />
                        ) : (
                          store.store_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {store.store_name} <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                        </h4>
                        <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>
                          @{store.username}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{
                      fontSize: 13,
                      color: 'var(--text-2)',
                      lineHeight: 1.55,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: 60
                    }}>
                      {store.store_bio || 'No bio description provided.'}
                    </p>
                  </div>

                  {/* Store footer info */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, color: 'var(--text-muted)' }}>
                      <a
                        href={`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: 4 }}
                        title="Chat on WhatsApp"
                      >
                        <WhatsAppIcon size={16} style={{ color: '#25d366' }} />
                      </a>
                      {store.instagram_handle && (
                        <a
                          href={`https://instagram.com/${store.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: 4 }}
                          title="Instagram"
                        >
                          <Instagram size={16} />
                        </a>
                      )}
                    </div>

                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary clickable"
                      style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                    >
                      Visit Store <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No stores matched your search filter. Try different keywords!
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <section style={{
        padding: '50px 20px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
            Are you a merchant?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.5, marginBottom: 20 }}>
            Create your live store, catalog your products using AI, and receive orders on WhatsApp today.
          </p>
          <a
            href="/signup"
            className="btn btn-primary clickable"
            style={{ padding: '12px 24px', borderRadius: 'var(--r-xl)', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Create Your Free Store <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <PublicSiteFooter />

      {/* CSS Spin style helper */}
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
