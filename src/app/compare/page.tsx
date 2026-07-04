import React from 'react';
import type { Metadata } from 'next';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import CompareSearchClient from './CompareSearchClient';

export const metadata: Metadata = {
  title: 'Compare Prices – Find the Best Deals Near You',
  description: 'Search a product and location to compare prices from verified sellers on Frontstore and find the best deal near you.',
  alternates: { canonical: 'https://frontstore.app/compare' },
};

export default function CompareLandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />
      <main style={{ flex: 1, padding: '48px 20px 64px', maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, maxWidth: 600 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>
            Compare Prices Near You
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Search a product and your state to see prices from verified sellers across Frontstore, ranked by
            price, ratings, trust, and availability — not price alone.
          </p>
        </div>
        <CompareSearchClient />
      </main>
      <PublicSiteFooter />
    </div>
  );
}
