import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight, ChevronRight } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { SOLUTION_PAGES, SolutionPage } from '@/utils/solutionsData';

export const metadata: Metadata = {
  title: 'Guides – Selling on WhatsApp, By Business Type, and AI Tools',
  description: 'Practical guides for African merchants: how to sell on WhatsApp, set up an online store, run a fashion, grocery, or pharmacy storefront, and use AI listing tools.',
  alternates: { canonical: 'https://frontstore.app/solutions' },
};

const CATEGORY_ORDER: SolutionPage['category'][] = ['Getting Started', 'By Business Type', 'AI & Automation'];

export default function SolutionsIndexPage() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    pages: SOLUTION_PAGES.filter((s) => s.category === category),
  }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Layers size={12} color="var(--accent)" /> <b>Guides</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Guides for <span className="mark-highlight">Selling Smarter</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Practical, no-fluff guides for merchants selling on WhatsApp, Instagram, and TikTok across Africa.
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 820, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        {grouped.map(({ category, pages }) => pages.length > 0 && (
          <section key={category} style={{ marginBottom: 48 }}>
            <h2 className="text-title" style={{ fontSize: 'clamp(18px, 3vw, 22px)', marginBottom: 16 }}>{category}</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {pages.map((s) => (
                <Link
                  key={s.slug}
                  href={`/solutions/${s.slug}`}
                  className="card clickable"
                  style={{
                    padding: '18px 22px', background: 'var(--surface)', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                      {s.headline} {s.headlineHighlight}
                    </p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{s.subhead}</p>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center' }}>
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
