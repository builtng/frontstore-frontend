import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle, MapPin, Store as StoreIcon } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { StoreDirectoryCard, StoreItem } from '../../../StoresClient';
import { businessPersonas } from '@/utils/businessPersonas';
import { NIGERIAN_STATES } from '@/utils/nigerianStates';
import { NIGERIAN_CITIES } from '@/utils/nigerianCities';
import { getCityDirectoryContent, locationMatchesCity, normalizePersonaId } from '@/utils/directoryContent';

interface PageProps {
  params: Promise<{ category: string; state: string; city: string }>;
}

async function getMatchingStores(categorySlug: string, stateSlug: string, citySlug: string): Promise<StoreItem[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!state) return [];
  const stateCities = NIGERIAN_CITIES[stateSlug] || [];
  const city = stateCities.find((c) => c.slug === citySlug);
  if (!city) return [];

  try {
    const res = await fetch(`${API_URL}/v1/public/stores`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const stores: StoreItem[] = Array.isArray(data) ? data : [];

    return stores.filter((store) =>
      normalizePersonaId(store.business_persona) === categorySlug &&
      locationMatchesCity(store.location, city)
    );
  } catch (err) {
    console.error('Error fetching city directory stores:', err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, state: stateSlug, city: citySlug } = await params;
  const persona = businessPersonas.find((p) => p.id === category);
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!persona || !state) return {};
  const stateCities = NIGERIAN_CITIES[stateSlug] || [];
  const city = stateCities.find((c) => c.slug === citySlug);
  if (!city) return {};

  const stores = await getMatchingStores(category, stateSlug, citySlug);
  const content = getCityDirectoryContent(persona, state, city, stores.length);
  const url = `https://frontstore.ng/stores/${category}/${stateSlug}/${citySlug}`;

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

export default async function DirectoryCityPage({ params }: PageProps) {
  const { category, state: stateSlug, city: citySlug } = await params;
  const persona = businessPersonas.find((p) => p.id === category);
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!persona || !state) return notFound();
  const stateCities = NIGERIAN_CITIES[stateSlug] || [];
  const city = stateCities.find((c) => c.slug === citySlug);
  if (!city) return notFound();

  const stores = await getMatchingStores(category, stateSlug, citySlug);
  const content = getCityDirectoryContent(persona, state, city, stores.length);
  const url = `https://frontstore.ng/stores/${category}/${stateSlug}/${citySlug}`;

  const otherCities = stateCities.filter((c) => c.slug !== city.slug).slice(0, 8);
  const otherCategories = businessPersonas.filter((p) => p.id !== persona.id).slice(0, 8);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://frontstore.ng/' },
      { '@type': 'ListItem', position: 2, name: 'Stores', item: 'https://frontstore.ng/stores' },
      { '@type': 'ListItem', position: 3, name: persona.name, item: `https://frontstore.ng/stores/${category}` },
      { '@type': 'ListItem', position: 4, name: state.name, item: `https://frontstore.ng/stores/${category}/${stateSlug}` },
      { '@type': 'ListItem', position: 5, name: city.name, item: url },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const collectionJsonLd = stores.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: content.metaTitle,
    description: content.metaDescription,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: stores.map((store, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://frontstore.ng/${store.username}`,
        name: store.store_name,
      })),
    },
  } : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {collectionJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      )}

      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 80px) 20px clamp(40px, 7vw, 64px)' }}>
        <div className="hero-blob" style={{ top: '-22%', right: '-10%', width: 340, height: 340, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Link
            href={`/stores/${category}/${stateSlug}`}
            className="clickable"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textDecoration: 'none', marginBottom: 24 }}
          >
            <ArrowLeft size={14} /> {state.name} Directory
          </Link>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>
            <MapPin size={12} color="var(--accent)" /> <b>{city.name}, {state.name}</b>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(24px, 5vw, 38px)', color: '#fff', lineHeight: 1.18 }}>
            {content.headline}
          </h1>

          <p style={{
            marginTop: 18, color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(14px, 2vw, 16px)',
            lineHeight: 1.65, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {content.intro}
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 1120, margin: '0 auto', padding: 'clamp(36px, 6vw, 56px) 20px' }}>

        {stores.length > 0 ? (
          <>
            <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {stores.length} store{stores.length === 1 ? '' : 's'} found in {city.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, marginBottom: 48 }}>
              {stores.map((store) => (
                <StoreDirectoryCard key={store.id} store={store} />
              ))}
            </div>
          </>
        ) : (
          <div className="card" style={{ padding: '48px 20px', textAlign: 'center', marginBottom: 48 }}>
            <StoreIcon size={28} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text)' }}>
              No {persona.name.toLowerCase()} sellers listed in {city.name} yet
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 400, margin: '0 auto' }}>
              Are you a local business? Sign up to be the first listed in {city.name}! Or check the <Link href={`/stores/${category}/${stateSlug}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>{state.name} directory</Link>.
            </p>
          </div>
        )}

        <section className="card" style={{ padding: 'clamp(20px, 3vw, 28px)', background: 'var(--surface)', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--text)' }}>
            Buying from a {persona.name.toLowerCase()} seller in {city.name}
          </h2>
          <ul style={{ display: 'grid', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
            {content.guideBullets.map((b, i) => (
              <li key={i} style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>—</span> {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ padding: 'clamp(20px, 3vw, 28px)', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 40 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800, color: 'var(--text)',
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16,
          }}>
            <HelpCircle size={17} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {content.faqs.map((faq, idx) => (
              <details key={idx} className="blog-faq" style={{ borderBottom: idx === content.faqs.length - 1 ? 'none' : '1px solid var(--border)', padding: '14px 0' }}>
                <summary className="blog-faq__summary">
                  <span style={{ paddingRight: 16 }}>{faq.question}</span>
                </summary>
                <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.65 }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(32px, 5vw, 48px) 24px', textAlign: 'center', marginBottom: 40 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: '#fff', marginBottom: 10 }}>
            Sell as a {persona.name.toLowerCase()} business in {city.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13.5, marginBottom: 20 }}>
            Claim your storefront link in under 2 minutes. Free to start.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '11px 22px', fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={14} />
          </a>
        </section>

        <div style={{ display: 'grid', gap: 24 }}>
          {otherCities.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
                {persona.name} in other {state.name} cities
              </h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/stores/${category}/${stateSlug}/${c.slug}`}
                    className="card clickable"
                    style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', background: 'var(--surface)' }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
              Other categories in {city.name}
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {otherCategories.map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${p.id}/${stateSlug}/${citySlug}`}
                  className="card clickable"
                  style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', background: 'var(--surface)' }}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
