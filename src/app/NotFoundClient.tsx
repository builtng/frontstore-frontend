'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Store,
  Home,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  HelpCircle,
  Compass,
  CornerUpLeft,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

const QUICK_TAGS = [
  { label: 'Fashion & Clothing', query: 'fashion' },
  { label: 'Gadgets & Electronics', query: 'electronics' },
  { label: 'Personal Care & Beauty', query: 'beauty' },
  { label: 'Shoes & Sneakers', query: 'shoes' },
];

const NAVIGATION_CARDS = [
  {
    icon: ShoppingBag,
    title: 'Product Marketplace',
    description: 'Discover products, compare prices across vendors, and order instantly.',
    href: '/compare',
    badge: 'Trending',
    color: '#3B82F6',
  },
  {
    icon: Sparkles,
    title: 'Front Store Pricing',
    description: 'Start selling on WhatsApp with an automated checkout store in minutes.',
    href: '/pricing',
    badge: 'For Sellers',
    color: '#8B5CF6',
  },
  {
    icon: HelpCircle,
    title: 'Help & Support',
    description: 'Search documentation, order tracking support, or contact customer care.',
    href: '/docs',
    badge: 'Support',
    color: '#F59E0B',
  },
];

export default function NotFoundClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <PublicSiteNav />

      <main style={{ flex: 1, width: '100%', maxWidth: 1120, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Top Hero Card */}
        <section
          style={{
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)',
            padding: '56px 28px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            marginBottom: 40,
          }}
        >
          {/* Subtle Ambient Radial Background Glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-30%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 500,
              height: 350,
              background: 'radial-gradient(ellipse at center, rgba(18, 140, 126, 0.15) 0%, rgba(37, 211, 102, 0.05) 50%, transparent 75%)',
              pointerEvents: 'none',
              filter: 'blur(40px)',
            }}
          />

          {/* 404 Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={15} />
            <span>404 Error • Page Not Found</span>
          </div>

          {/* Big Graphic 404 Artwork */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(72px, 12vw, 130px)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                background: 'linear-gradient(135deg, var(--primary) 0%, #059669 50%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                userSelect: 'none',
                opacity: 0.95,
              }}
            >
              404
            </span>
            <div
              style={{
                position: 'absolute',
                padding: 12,
                borderRadius: 'var(--r-full)',
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                color: 'var(--primary)',
              }}
            >
              <Compass size={36} className="animate-spin-slow" />
            </div>
          </div>

          {/* Title & Description */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 14,
            }}
          >
            We couldn&apos;t find the page you were looking for
          </h1>

          <p
            style={{
              fontSize: 16,
              color: 'var(--text-muted)',
              maxWidth: 580,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            The link you clicked may be outdated, misspelled, or the merchant storefront or product item has been moved.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: 540,
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg)',
              padding: 6,
              borderRadius: 'var(--r-xl)',
              border: '1.5px solid var(--border-strong)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ paddingLeft: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores, brands, or products..."
              aria-label="Search stores or products"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 15,
                color: 'var(--text)',
                padding: '8px 4px',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--r-lg)',
                fontSize: 14,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Search</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Popular Search Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Tag size={13} /> Popular:
            </span>
            {QUICK_TAGS.map((tag) => (
              <Link
                key={tag.label}
                href={`/?q=${tag.query}`}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-2)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-full)',
                  padding: '5px 13px',
                  textDecoration: 'none',
                  transition: 'all var(--t-fast) var(--ease)',
                }}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Section Navigation Cards */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
              Or explore popular destinations
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Find what you need with direct links to main site sections
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {NAVIGATION_CARDS.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-xl)',
                      padding: 24,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      transition: 'transform var(--t-fast) var(--ease), boxShadow var(--t-fast) var(--ease), borderColor var(--t-fast) var(--ease)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--r-lg)',
                          background: `${card.color}15`,
                          color: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--r-sm)',
                          background: 'var(--bg-2)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 17,
                          fontWeight: 800,
                          color: 'var(--text)',
                          marginBottom: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {card.title}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                        {card.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
          }}
        >
          <Link
            href="/"
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Home size={17} />
            <span>Back to Homepage</span>
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="btn btn-ghost"
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 'var(--r-lg)',
              cursor: 'pointer',
            }}
          >
            <CornerUpLeft size={17} />
            <span>Go Back</span>
          </button>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
