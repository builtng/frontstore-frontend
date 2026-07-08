import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, X, HelpCircle, Scale, Sparkles, Zap,
} from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { VS_COMPETITORS, getVsCompetitor } from '@/utils/vsData';

interface PageProps {
  params: Promise<{ competitor: string }>;
}

export async function generateStaticParams() {
  return VS_COMPETITORS.map((c) => ({ competitor: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor } = await params;
  const data = getVsCompetitor(competitor);
  if (!data) return {};

  const url = `https://frontstore.app/vs/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: [
      `Frontstore vs ${data.name}`, `${data.name} alternative`, `${data.name} vs Frontstore`,
      `${data.name} pricing`, 'WhatsApp commerce platform Nigeria', 'WhatsApp store builder Africa',
    ],
    alternates: { canonical: url },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url,
      type: 'website',
      locale: 'en_NG',
      siteName: 'Frontstore',
      images: [{ url: 'https://frontstore.app/icon.png', width: 512, height: 512, alt: data.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: ['https://frontstore.app/icon.png'],
    },
  };
}

export default async function VsCompetitorPage({ params }: PageProps) {
  const { competitor } = await params;
  const data = getVsCompetitor(competitor);
  if (!data) return notFound();

  const url = `https://frontstore.app/vs/${data.slug}`;
  const others = VS_COMPETITORS.filter((c) => c.slug !== data.slug).slice(0, 3);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://frontstore.app/' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://frontstore.app/vs' },
      { '@type': 'ListItem', position: 3, name: `Frontstore vs ${data.name}`, item: url },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-22%', right: '-10%', width: 360, height: 360, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-30%', left: '-12%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Link
            href="/vs"
            className="clickable"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textDecoration: 'none', marginBottom: 28 }}
          >
            <ArrowLeft size={14} /> All Comparisons
          </Link>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Scale size={12} color="var(--accent)" /> <b>Frontstore vs {data.name}</b>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15 }}>
            Frontstore vs {data.name}: <span className="mark-highlight">Which Is Better</span> for WhatsApp Sellers?
          </h1>

          <p style={{
            marginTop: 20, color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.65, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {data.heroLine}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <a href="/signup" className="btn btn-primary" style={{ padding: '12px 22px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Try Frontstore Free <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 880, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>

        {/* ── Summary ── */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.8, color: 'var(--text-2)', fontWeight: 500 }}>
            {data.summary}
          </p>
        </section>

        {/* ── Feature comparison table ── */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 20 }}>
            Feature-by-Feature Comparison
          </h2>
          <div className="card" style={{ overflowX: 'auto', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', padding: 0 }}>
            <table className="no-scrollbar" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Feature</th>
                  <th style={{ padding: '14px 20px 10px', fontSize: 13, fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)' }}>
                    <span className="badge badge-primary" style={{ width: 'fit-content', marginBottom: 4, background: 'var(--primary)', color: '#fff' }}>Frontstore</span>
                  </th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{data.name}</th>
                </tr>
              </thead>
              <tbody>
                {data.featureRows.map((row, i) => (
                  <tr key={i} className="comparison-row" style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.feature}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text)', background: 'var(--primary-light)', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
                        <Check size={14} color="var(--primary)" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} /> {row.frontstore}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {row.competitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 16 }}>
            Pricing: Frontstore vs {data.name}
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text-muted)' }}>{data.pricingNote}</p>
        </section>

        {/* ── Strengths / Gaps ── */}
        <section style={{ marginBottom: 56, display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="card" style={{ padding: 24, background: 'var(--surface)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} style={{ color: 'var(--primary)' }} /> Where {data.name} Is Strong
            </h3>
            <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
              {data.strengths.map((s, i) => (
                <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--text-faint)' }}>—</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ padding: 24, background: 'var(--surface)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} /> What Frontstore Adds
            </h3>
            <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
              {data.gaps.map((s, i) => (
                <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--text-faint)' }}>—</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Best for ── */}
        <section className="card" style={{ marginBottom: 56, padding: 24, background: 'var(--primary-light)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 8, color: 'var(--primary-dark)' }}>
            {data.name} is the better fit if:
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>{data.bestFor}</p>
        </section>

        {/* ── Why merchants switch ── */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 20 }}>
            Why Merchants Switch to Frontstore
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {data.switchReasons.map((r, i) => (
              <div key={i} className="card" style={{ padding: 20, background: 'var(--surface)', display: 'flex', gap: 14 }}>
                <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={15} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>{r.title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-muted)' }}>{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="card" style={{ padding: 'clamp(20px, 3vw, 32px)', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 800, color: 'var(--text)',
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18,
          }}>
            <HelpCircle size={19} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.faqs.map((faq, idx) => (
              <details key={idx} className="blog-faq" style={{ borderBottom: idx === data.faqs.length - 1 ? 'none' : '1px solid var(--border)', padding: '16px 0' }}>
                <summary className="blog-faq__summary">
                  <span style={{ paddingRight: 16 }}>{faq.question}</span>
                </summary>
                <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.65 }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <p style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--text-faint)', marginBottom: 56 }}>
          Pricing and features for {data.name} are based on information publicly listed at {data.website} and are provided for comparison purposes only. Third-party pricing and features can change — confirm current details directly with {data.name} before making a decision.
        </p>

        {/* ── CTA ── */}
        <section className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center' }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', color: '#fff', marginBottom: 12 }}>
            Launch your WhatsApp store in under 2 minutes
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14.5, marginBottom: 24, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            Free to start. No credit card required.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '13px 26px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={15} />
          </a>
        </section>

        {/* ── Other comparisons ── */}
        {others.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 16, color: 'var(--text)' }}>
              More Comparisons
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {others.map((c) => (
                <Link
                  key={c.slug}
                  href={`/vs/${c.slug}`}
                  className="card clickable"
                  style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', background: 'var(--surface)' }}
                >
                  Frontstore vs {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicSiteFooter />
    </div>
  );
}
