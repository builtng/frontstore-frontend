import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle, MapPin, Store as StoreIcon } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { StoreDirectoryCard, StoreItem, UnclaimedListingCard, UnclaimedListing } from '../../StoresClient';
import { businessPersonas } from '@/utils/businessPersonas';
import { NIGERIAN_STATES } from '@/utils/nigerianStates';
import { NIGERIAN_CITIES } from '@/utils/nigerianCities';
import { getDirectoryContent, locationMatchesState, normalizePersonaId } from '@/utils/directoryContent';

interface PageProps {
  params: Promise<{ category: string; state: string }>;
}

async function getMatchingStores(categorySlug: string, stateSlug: string): Promise<StoreItem[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!state) return [];

  try {
    const res = await fetch(`${API_URL}/v1/public/stores`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const stores: StoreItem[] = Array.isArray(data) ? data : [];

    return stores.filter((store) =>
      normalizePersonaId(store.business_persona) === categorySlug &&
      locationMatchesState(store.location, state)
    );
  } catch (err) {
    console.error('Error fetching directory stores:', err);
    return [];
  }
}

async function getUnclaimedListings(categorySlug: string, stateSlug: string): Promise<UnclaimedListing[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores?state=${stateSlug}&persona=${categorySlug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching unclaimed listings:', err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, state: stateSlug } = await params;
  const persona = businessPersonas.find((p) => p.id === category);
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!persona || !state) return {};

  const [stores, unclaimedListings] = await Promise.all([
    getMatchingStores(category, stateSlug),
    getUnclaimedListings(category, stateSlug),
  ]);
  const content = getDirectoryContent(persona, state, stores.length);
  const url = `https://frontstore.ng/stores/${category}/${stateSlug}`;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      type: 'website',
      locale: 'en_NG',
      siteName: 'Frontstore',
      images: [{ url: 'https://frontstore.ng/icon.png', width: 512, height: 512, alt: content.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
      images: ['https://frontstore.ng/icon.png'],
    },
  };
}

export default async function DirectoryPage({ params }: PageProps) {
  const { category, state: stateSlug } = await params;
  const persona = businessPersonas.find((p) => p.id === category);
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!persona || !state) return notFound();

  const [stores, unclaimedListings] = await Promise.all([
    getMatchingStores(category, stateSlug),
    getUnclaimedListings(category, stateSlug),
  ]);

  const content = getDirectoryContent(persona, state, stores.length);
  const canonicalUrl = `https://frontstore.ng/stores/${category}/${stateSlug}`;

  const stateCities = NIGERIAN_CITIES[stateSlug] || [];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://frontstore.ng' },
      { '@type': 'ListItem', position: 2, name: 'Store Directory', item: 'https://frontstore.ng/stores' },
      { '@type': 'ListItem', position: 3, name: content.headline, item: canonicalUrl },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <PublicSiteNav />

      {/* Hero */}
      <header style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(56px, 9vw, 88px) 20px clamp(40px, 7vw, 64px)', borderBottom: '1px solid var(--border)' }}>
        <div className="hero-mesh" />
        <div className="hero-grid" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--text-faint)', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <ArrowRight size={11} />
            <Link href="/stores" style={{ color: 'inherit', textDecoration: 'none' }}>Stores</Link>
            <ArrowRight size={11} />
            <span style={{ color: 'var(--text-muted)' }}>{content.headline}</span>
          </nav>

          <span className="badge badge-verified animate-fade-in" style={{ marginBottom: 16 }}>
            <MapPin size={11} /> {state.name}
          </span>

          <h1 className="text-display" style={{ marginTop: 14, marginBottom: 14 }}>
            {content.headline}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>
            {content.metaDescription}
          </p>
        </div>
      </header>

      <main style={{ flex: 1, padding: 'clamp(32px, 5vw, 56px) 20px clamp(48px, 7vw, 72px)', maxWidth: 1120, margin: '0 auto', width: '100%' }}>

        {/* Intro */}
        <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 720, marginBottom: 36 }}>
          {content.intro}
        </p>

        {/* Claimed stores */}
        {stores.length > 0 ? (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, marginBottom: 48 }}>
            {stores.map((store) => (
              <StoreDirectoryCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '52px 20px', textAlign: 'center', marginBottom: 48 }}>
            <StoreIcon size={28} style={{ color: 'var(--text-faint)', marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text)' }}>No stores yet in {state.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>New stores join every week — check back soon or <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>create yours today</Link>.</p>
          </div>
        )}

        {/* City sub-directory links */}
        {stateCities.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>
              Browse by city in {state.name}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stateCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/stores/${category}/${stateSlug}/${city.slug}`}
                  className="btn btn-outline"
                  style={{ padding: '7px 14px', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <MapPin size={11} /> {city.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Buyer guide */}
        <section className="card" style={{ padding: 'clamp(22px, 4vw, 36px)', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
            Buyer tips
          </h2>
          <ul style={{ display: 'grid', gap: 10, paddingLeft: 0, listStyle: 'none' }}>
            {content.guideBullets.map((bullet, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                <HelpCircle size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                {bullet}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQs */}
        <section className="card" style={{ padding: 'clamp(22px, 4vw, 36px)', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
            Frequently asked questions
          </h2>
          {content.faqs.map((faq, i) => (
            <details key={i} style={{ borderBottom: i < content.faqs.length - 1 ? '1px solid var(--border)' : 'none', padding: '13px 0' }}>
              <summary style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'var(--text)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.question}
              </summary>
              <p style={{ marginTop: 8, fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{faq.answer}</p>
            </details>
          ))}
        </section>

        {/* Unclaimed listings */}
        {unclaimedListings.length > 0 && (
          <section style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 18 }}>
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

      {/* CTA band */}
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Sell {persona.name.toLowerCase()} in {state.name}?
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', lineHeight: 1.55 }}>
              Claim your free store link, list your products, and start taking orders on WhatsApp today.
            </p>
          </div>
          <Link href="/signup" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: 'var(--primary-dark)', padding: '13px 24px', borderRadius: 12, fontWeight: 750, fontSize: 14, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}>
            Create your free store <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <PublicSiteFooter />
    </div>
  );
}
