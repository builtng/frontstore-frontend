import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowRight, ChevronRight } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { VS_COMPETITORS } from '@/utils/vsData';

export const metadata: Metadata = {
  title: 'Frontstore Comparisons – See How We Stack Up Against the Alternatives',
  description: 'Compare Frontstore against Bumpa, MyShoplet, Catlog, Selar, and Vendda on WhatsApp checkout, AI product listings, pricing, and setup time.',
  alternates: { canonical: 'https://frontstore.app/vs' },
};

export default function VsIndexPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Scale size={12} color="var(--accent)" /> <b>Compare Platforms</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Frontstore vs <span className="mark-highlight">The Alternatives</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Fair, feature-by-feature comparisons to help you pick the right platform for selling on WhatsApp and social media in Africa.
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 760, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          {VS_COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/vs/${c.slug}`}
              className="card clickable"
              style={{
                padding: '20px 24px', background: 'var(--surface)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                  Frontstore vs {c.name}
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  {c.name} — {c.tagline}
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>

        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center', marginTop: 48 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#fff', marginBottom: 12 }}>
            Ready to launch your own WhatsApp store?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22 }}>
            Free to start. No credit card required. Live in under 2 minutes.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={15} />
          </a>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
