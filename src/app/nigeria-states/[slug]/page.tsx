import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Users, Maximize, ArrowRight, ChevronRight, Building2, Landmark, Palette, Camera, Globe, ChevronLeft } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { STATE_DATA_MAP, NIGERIAN_STATES_DATA } from '@/utils/nigerianStatesData';

// ── Static params ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return NIGERIAN_STATES_DATA.map((s) => ({ slug: s.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const state = STATE_DATA_MAP[slug];
  if (!state) return { title: 'State Not Found | Frontstore' };

  return {
    title: state.seoTitle,
    description: state.seoDescription,
    keywords: state.keywords,
    alternates: { canonical: `https://frontstore.ng/nigeria-states/${state.slug}` },
    openGraph: {
      type: 'article',
      locale: 'en_NG',
      siteName: 'Frontstore',
      title: state.seoTitle,
      description: state.seoDescription,
      url: `https://frontstore.ng/nigeria-states/${state.slug}`,
      images: [{ url: 'https://frontstore.ng/icon.png', width: 512, height: 512, alt: `${state.name} State Nigeria — Frontstore` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: state.seoTitle,
      description: state.seoDescription,
      images: ['https://frontstore.ng/icon.png'],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function NigerianStatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = STATE_DATA_MAP[slug];
  if (!state) notFound();

  // Structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${state.name} State, Nigeria`,
    description: state.seoDescription,
    url: `https://frontstore.ng/nigeria-states/${state.slug}`,
    containedInPlace: { '@type': 'Country', name: 'Nigeria' },
    geo: { '@type': 'GeoCoordinates' },
    additionalType: 'https://schema.org/AdministrativeArea',
    keywords: state.keywords.join(', '),
  };

  // Related states (same region, up to 4)
  const relatedStates = NIGERIAN_STATES_DATA
    .filter((s) => s.region === state.region && s.slug !== state.slug)
    .slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicSiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="hero-dark" style={{ padding: 'clamp(40px, 8vw, 80px) 20px clamp(48px, 8vw, 88px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-25%', right: '-6%', width: 380, height: 380, background: 'rgba(255,255,255,0.04)' }} />
        <div className="hero-blob" style={{ bottom: '-40%', left: '-8%', width: 420, height: 420, background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
            <ChevronRight size={12} />
            <a href="/nigeria-states" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Nigeria States</a>
            <ChevronRight size={12} />
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>{state.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 56, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{state.emoji}</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="hero-eyebrow" style={{ marginBottom: 10 }}>
                <Globe size={12} color="var(--accent)" /> <b>{state.region} · Nigeria</b>
              </div>
              <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
                {state.name} State
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 14, fontStyle: 'italic' }}>
                "{state.nickname}" · {state.tagline}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: 1.7, maxWidth: 580 }}>
                {state.summary}
              </p>
            </div>
          </div>

          {/* Stat Pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: Building2, label: `Capital: ${state.capital}` },
              { icon: Users, label: `Pop: ${state.population}` },
              { icon: Maximize, label: `${state.area} km²` },
              { icon: MapPin, label: `Est. ${state.established}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 100, padding: '7px 14px', fontSize: 12.5, color: 'rgba(255,255,255,0.9)' }}>
                <Icon size={12} /> {label}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, width: '100%', maxWidth: 920, margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px' }}>

        {/* Long Description */}
        <div className="card" style={{ padding: 'clamp(24px, 4vw, 36px)', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
            About {state.name} State
          </h2>
          {state.longDescription.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 16 }}>
              {para}
            </p>
          ))}
        </div>

        {/* 4-column grid for lists */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>

          {/* Known For */}
          <InfoCard
            icon={<Landmark size={16} />}
            title={`What ${state.name} is Known For`}
            items={state.knownFor}
            accent="#128C7E"
          />

          {/* Economy */}
          <InfoCard
            icon={<Building2 size={16} />}
            title="Economy & Industries"
            items={state.economy}
            accent="#f59e0b"
          />

          {/* Culture */}
          <InfoCard
            icon={<Palette size={16} />}
            title="Culture & Traditions"
            items={state.culture}
            accent="#6366f1"
          />

          {/* Tourism */}
          <InfoCard
            icon={<Camera size={16} />}
            title="Tourism & Attractions"
            items={state.tourism}
            accent="#10b981"
          />
        </div>

        {/* Major Cities + Languages row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, marginBottom: 32 }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>
              🏙️ Major Cities
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {state.majorCities.map((city) => (
                <span key={city} style={{ fontSize: 12.5, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 6, padding: '4px 10px', fontWeight: 600 }}>
                  {city}
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px 22px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>
              🗣️ Languages Spoken
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {state.languages.map((lang) => (
                <span key={lang} style={{ fontSize: 12.5, background: 'var(--surface-2)', color: 'var(--text-2)', borderRadius: 6, padding: '4px 10px', border: '1px solid var(--border)', fontWeight: 500 }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px 22px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>
              📊 Quick Facts
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { label: 'Geopolitical Zone', value: state.geoPoliticalZone },
                { label: 'State Capital', value: state.capital },
                { label: 'Population', value: state.population },
                { label: 'Area', value: `${state.area} km²` },
                { label: 'Established', value: state.established },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-faint)' }}>{label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA: Sell Online in this State */}
        <div className="hero-dark" style={{ borderRadius: 20, padding: 'clamp(28px, 5vw, 44px) 24px', textAlign: 'center', marginBottom: 40 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(18px, 3vw, 26px)', color: '#fff', marginBottom: 10 }}>
            Are you a merchant in {state.name} State?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13.5, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
            Create your free WhatsApp store on Frontstore and reach customers across {state.name} and all of Nigeria. No website needed — live in 2 minutes.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '11px 24px', fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Launch Your Store Free <ArrowRight size={14} />
          </a>
        </div>

        {/* AI Credit */}
        <div style={{
          padding: '10px 16px',
          marginBottom: 32,
          background: 'var(--surface)',
          border: '1px dashed var(--border)',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Content credit:</strong>{' '}
            This page was written with AI assistance and edited &amp; reviewed by a human editor for accuracy and quality.
          </p>
        </div>

        {/* Related States */}
        {relatedStates.length > 0 && (
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
              Other States in {state.region}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              {relatedStates.map((s) => (
                <Link key={s.slug} href={`/nigeria-states/${s.slug}`} className="card clickable" style={{ padding: '14px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13.5, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: 0 }}>{s.capital}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                </Link>
              ))}
            </div>
            <Link href="/nigeria-states" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              <ChevronLeft size={14} /> View All Nigerian States
            </Link>
          </section>
        )}
      </main>

      <PublicSiteFooter />
    </div>
  );
}

// ── Helper Component ──────────────────────────────────────────────────────────
function InfoCard({ icon, title, items, accent }: { icon: React.ReactNode; title: string; items: string[]; accent: string }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: accent }}>{icon}</span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13.5, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{title}</h3>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 7 }}>
        {items.map((item) => (
          <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
            <span style={{ color: accent, marginTop: 3, flexShrink: 0 }}>▸</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
