import React from 'react';
import type { Metadata } from 'next';
import { Trophy, ShieldCheck, MapPin } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import CompareSearchClient from './CompareSearchClient';

export const metadata: Metadata = {
  title: 'Compare Prices – Find the Best Deals Near You',
  description: 'Search a product and location to compare prices from verified sellers on Frontstore and find the best deal near you.',
  alternates: { canonical: 'https://frontstore.ng/compare' },
};

const TRUST_POINTS = [
  { icon: Trophy, label: 'Ranked by price, ratings & trust' },
  { icon: ShieldCheck, label: 'Verified sellers only' },
  { icon: MapPin, label: 'Matched to your state & city' },
];

export default function CompareLandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(64px, 10vw, 120px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Trophy size={12} color="var(--accent)" /> <b>Price Comparison</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Compare Prices <span className="mark-highlight">Near You</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Search a product and your state to see prices from verified sellers across Frontstore — not price
            alone, but ranked by trust and availability too.
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 960, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -64, position: 'relative', zIndex: 2 }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            <div className="card animate-fade-in" style={{ padding: 28, background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}>
              <CompareSearchClient />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', justifyContent: 'center', marginTop: 24 }}>
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  <Icon size={13} color="var(--primary)" /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
