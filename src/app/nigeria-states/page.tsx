import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, ChevronRight, Globe } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { REGION_GROUPS, NIGERIAN_STATES_DATA } from '@/utils/nigerianStatesData';

export const metadata: Metadata = {
  title: 'All 36 Nigerian States + FCT — Comprehensive Guide | Frontstore',
  description:
    'Explore all 36 states of Nigeria plus the Federal Capital Territory (FCT) Abuja. Discover what each state is known for — history, culture, economy, tourism, major cities, and more. The most comprehensive Nigerian states guide online.',
  keywords: [
    'Nigerian states', 'all 36 states Nigeria', 'states of Nigeria', 'FCT Abuja',
    'Nigeria states guide', 'Nigerian states and capitals', 'Nigeria geography',
    'Nigeria culture', 'Nigeria tourism', 'Nigerian economy by state',
    'South West Nigeria', 'South East Nigeria', 'South South Nigeria',
    'North Central Nigeria', 'North West Nigeria', 'North East Nigeria',
    'Nigeria geopolitical zones', 'Nigerian cities',
  ],
  alternates: { canonical: 'https://frontstore.ng/nigeria-states' },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Frontstore',
    title: 'All 36 Nigerian States + FCT — Comprehensive Guide | Frontstore',
    description:
      'Explore all 36 states of Nigeria plus FCT Abuja. Discover history, culture, economy, tourism, and commerce for every Nigerian state.',
    url: 'https://frontstore.ng/nigeria-states',
    images: [{ url: 'https://frontstore.ng/icon.png', width: 512, height: 512, alt: 'Nigeria States Guide — Frontstore' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 36 Nigerian States + FCT — Comprehensive Guide | Frontstore',
    description: 'The ultimate guide to every Nigerian state — culture, economy, tourism, and commerce.',
    images: ['https://frontstore.ng/icon.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'All 36 Nigerian States + FCT — Comprehensive Guide',
  description: 'A comprehensive guide to all 36 states of Nigeria plus the Federal Capital Territory (FCT) Abuja, covering history, culture, economy, tourism, and commerce.',
  url: 'https://frontstore.ng/nigeria-states',
  publisher: {
    '@type': 'Organization',
    name: 'Frontstore',
    url: 'https://frontstore.ng',
    logo: { '@type': 'ImageObject', url: 'https://frontstore.ng/icon.png' },
  },
  about: { '@type': 'Country', name: 'Nigeria' },
};

const REGION_COLOURS: Record<string, string> = {
  'South West':   '#128C7E',
  'South East':   '#25D366',
  'South South':  '#0e7a6e',
  'North Central':'#f59e0b',
  'North West':   '#d97706',
  'North East':   '#b45309',
  'FCT':          '#6366f1',
};

export default function NigeriaStatesIndexPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicSiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 400, height: 400, background: 'rgba(255,255,255,0.04)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 440, height: 440, background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Globe size={12} color="var(--accent)" /> <b>Nigeria States Guide</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5.5vw, 48px)', color: '#fff', lineHeight: 1.12, marginBottom: 18 }}>
            All <span className="mark-highlight">36 States</span> of Nigeria<br />+ FCT Abuja
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            The most comprehensive guide to every Nigerian state — covering history, culture, economy, tourism, major cities, and what makes each state unique.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
              <MapPin size={13} /> 36 States + FCT
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
              6 Geopolitical Zones
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
              220M+ Population
            </div>
          </div>
        </div>
      </header>

      {/* ── Quick Stats Bar ───────────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total States', value: '36 + FCT' },
            { label: 'Geopolitical Zones', value: '6' },
            { label: 'Largest State (Area)', value: 'Niger' },
            { label: 'Most Populous State', value: 'Kano' },
            { label: 'Commercial Capital', value: 'Lagos' },
            { label: 'Federal Capital', value: 'Abuja' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--primary)', margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── States by Region ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, width: '100%', maxWidth: 960, margin: '0 auto', padding: 'clamp(40px, 7vw, 64px) 20px' }}>

        {REGION_GROUPS.map(({ region, states }) => states.length > 0 && (
          <section key={region} style={{ marginBottom: 56 }}>
            {/* Region Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: REGION_COLOURS[region] ?? 'var(--primary)', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {region}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                  {states.length} {states.length === 1 ? 'state' : 'states'}
                </p>
              </div>
            </div>

            {/* State Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {states.map((state) => (
                <Link
                  key={state.slug}
                  href={`/nigeria-states/${state.slug}`}
                  className="card clickable"
                  style={{
                    padding: '18px 20px',
                    background: 'var(--surface)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    borderLeft: `3px solid ${REGION_COLOURS[region] ?? 'var(--primary)'}`,
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{state.emoji}</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
                          {state.name}
                        </p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: 0 }}>
                          Capital: {state.capital}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{state.nickname}</span>
                    {' · '}
                    {state.knownFor[0]}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* ── CTA Section ──────────────────────────────────────────────────── */}
        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 52px) 24px', textAlign: 'center', marginTop: 16 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', color: '#fff', marginBottom: 12 }}>
            Selling to customers across Nigeria?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22, maxWidth: 480, margin: '0 auto 22px' }}>
            Reach buyers in all 36 states and FCT. Create your free WhatsApp store on Frontstore and start selling anywhere in Nigeria.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start Selling Free <ArrowRight size={15} />
          </a>
        </div>
      </main>

      {/* AI Credit */}
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 20px 32px',
      }}>
        <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Content credit:</strong>{' '}
          State information on this page was written with AI assistance and edited &amp; reviewed by a human editor for accuracy and quality.
        </p>
      </div>

      <PublicSiteFooter />
    </div>
  );
}
