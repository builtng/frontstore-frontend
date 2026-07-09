import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle, Layers, ListChecks } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { SOLUTION_PAGES, getSolutionPage } from '@/utils/solutionsData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SOLUTION_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getSolutionPage(slug);
  if (!data) return {};

  const url = `https://frontstore.ng/solutions/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: [data.keyword, 'WhatsApp commerce Nigeria', 'WhatsApp store Africa', 'Frontstore'],
    alternates: { canonical: url },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url,
      type: 'article',
      locale: 'en_NG',
      siteName: 'Frontstore',
      images: [{ url: 'https://frontstore.ng/icon.png', width: 512, height: 512, alt: data.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: ['https://frontstore.ng/icon.png'],
    },
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getSolutionPage(slug);
  if (!data) return notFound();

  const url = `https://frontstore.ng/solutions/${data.slug}`;
  const related = SOLUTION_PAGES.filter((s) => s.slug !== data.slug && s.category === data.category).slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: data.metaTitle,
    description: data.metaDescription,
    image: 'https://frontstore.ng/icon.png',
    publisher: {
      '@type': 'Organization',
      name: 'Frontstore Technologies',
      logo: { '@type': 'ImageObject', url: 'https://frontstore.ng/icon.png' },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const howToJsonLd = data.steps ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.metaTitle,
    step: data.steps.map((s) => ({
      '@type': 'HowToStep',
      name: s.title,
      text: s.body,
    })),
  } : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {howToJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      )}

      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-22%', right: '-10%', width: 360, height: 360, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-30%', left: '-12%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <Link
            href="/solutions"
            className="clickable"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textDecoration: 'none', marginBottom: 28 }}
          >
            <ArrowLeft size={14} /> All Guides
          </Link>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Layers size={12} color="var(--accent)" /> <b>{data.eyebrow}</b>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(26px, 5vw, 42px)', color: '#fff', lineHeight: 1.15 }}>
            {data.headline} <span className="mark-highlight">{data.headlineHighlight}</span>
          </h1>

          <p style={{
            marginTop: 20, color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.65, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
          }}>
            {data.subhead}
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 760, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>

        {/* ── Direct answer ── */}
        <section style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(17px, 2.4vw, 20px)', lineHeight: 1.6,
            fontWeight: 700, color: 'var(--text)', margin: 0, borderLeft: '3px solid var(--primary)', paddingLeft: 20,
          }}>
            {data.directAnswer}
          </p>
        </section>

        {/* ── Body sections ── */}
        <div style={{ display: 'grid', gap: 40, marginBottom: 48 }}>
          {data.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-title" style={{ fontSize: 'clamp(19px, 3vw, 24px)', marginBottom: 12 }}>
                {section.heading}
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: section.bullets ? 14 : 0 }}>
                {section.body}
              </p>
              {section.bullets && (
                <ul style={{ display: 'grid', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--primary)', flexShrink: 0 }}>—</span> {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* ── Steps ── */}
        {data.steps && (
          <section className="card" style={{ padding: 'clamp(20px, 3vw, 32px)', background: 'var(--surface)', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--text)',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
            }}>
              <ListChecks size={18} style={{ color: 'var(--primary)' }} /> Step by Step
            </h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {data.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12.5, fontWeight: 800,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, marginBottom: 3, color: 'var(--text)' }}>{step.title}</h3>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="card" style={{ padding: 'clamp(20px, 3vw, 32px)', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 48 }}>
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

        {/* ── CTA ── */}
        <section className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center', marginBottom: 48 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', color: '#fff', marginBottom: 12 }}>
            Launch your storefront in under 2 minutes
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22 }}>
            Free to start. No credit card required.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={15} />
          </a>
        </section>

        {related.length > 0 && (
          <section>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 16, color: 'var(--text)' }}>
              More in {data.category}
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {related.map((s) => (
                <Link
                  key={s.slug}
                  href={`/solutions/${s.slug}`}
                  className="card clickable"
                  style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text)', textDecoration: 'none', background: 'var(--surface)' }}
                >
                  {s.headline} {s.headlineHighlight}
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
