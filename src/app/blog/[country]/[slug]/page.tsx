import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, Clock, ArrowLeft, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import BlogCTA from '@/components/BlogCTA';
import { BLOG_ARTICLES } from '@/utils/blogData';

interface PageProps {
  params: Promise<{
    country: string;
    slug: string;
  }>;
}

// Helper to slugify country names
function getCountrySlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

// ── Static Pre-rendering Params ──────────────────────────────────────────────
export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    country: getCountrySlug(article.country),
    slug: article.slug,
  }));
}

// ── Dynamic SEO Metadata Generator ──────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, slug } = await params;
  const article = BLOG_ARTICLES.find(
    (a) => a.slug === slug && getCountrySlug(a.country) === country
  );
  if (!article) return {};

  const url = `https://aloaye.tech/blog/${getCountrySlug(article.country)}/${article.slug}`;

  return {
    title: `${article.title} | aloaye Blog`,
    description: article.metaDescription,
    keywords: [
      article.category, article.city, article.country,
      `sell on WhatsApp ${article.city}`, `WhatsApp store ${article.city}`,
      `digital catalog ${article.city}`, `${article.category} boutique ${article.city}`
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${article.title} | aloaye Blog`,
      description: article.metaDescription,
      url,
      type: 'article',
      locale: 'en_NG',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      siteName: 'aloaye',
      images: [
        {
          url: 'https://aloaye.tech/icon.png',
          width: 512,
          height: 512,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
      images: ['https://aloaye.tech/icon.png'],
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { country, slug } = await params;
  const article = BLOG_ARTICLES.find(
    (a) => a.slug === slug && getCountrySlug(a.country) === country
  );
  if (!article) return notFound();

  // Pick 2 related articles for high-quality internal linking
  const relatedArticles = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);

  // Injected Schema.org Structured Data
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://aloaye.tech/blog/${getCountrySlug(article.country)}/${article.slug}`
    },
    'headline': article.title,
    'description': article.metaDescription,
    'image': 'https://aloaye.tech/icon.png',
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt,
    'author': {
      '@type': 'Person',
      'name': article.author.name
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'aloaye Technologies',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://aloaye.tech/icon.png'
      }
    }
  };

  const faqJsonLd = article.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': article.faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  } : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ── Navbar ── */}
      <nav
        className="glass"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <a href="/" style={{ display: 'inline-flex' }}>
          <Logo size={24} textColor="var(--primary)" />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <a
            href="/blog"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}
          >
            Blog
          </a>
          <a
            href="/login"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 20px 64px', maxWidth: 840, width: '100%', margin: '0 auto' }}>
        {/* Navigation Breadcrumbs (Safe from event handler rendering issues) */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-faint)', marginBottom: 20 }}>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</a>
          <ChevronRight size={12} />
          <a href="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</a>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{article.title}</span>
        </nav>

        {/* Back Link */}
        <a href="/blog" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 0', fontSize: 13, textDecoration: 'none', marginBottom: 24, alignSelf: 'flex-start' }}>
          <ArrowLeft size={14} /> Back to Hub
        </a>

        {/* Article Cover Card */}
        <header
          className="card"
          style={{
            padding: '32px 24px',
            background: `linear-gradient(135deg, ${article.gradientFrom} 0%, ${article.gradientTo} 100%)`,
            color: '#fff',
            borderRadius: 'var(--r-xl)',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Subtle design grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.08,
            background: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23ffffff'/%3E%3C/svg%3E\") repeat"
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Badges / Taxonomy */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: 10, padding: '4px 10px', borderRadius: 'var(--r-full)' }}>
                {article.category}
              </span>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: 10, padding: '4px 10px', borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} /> {article.city}, {article.country}
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(22px, 4.5vw, 32px)',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: 20,
              textShadow: '0 2px 4px rgba(0,0,0,0.15)',
              maxWidth: 700
            }}>
              {article.title}
            </h1>

            {/* Author Profile Information */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: 12, borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-heading)'
                }}>
                  {article.author.avatarInitials}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#fff' }}>{article.author.name}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.75)' }}>{article.author.role}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, color: 'rgba(255, 255, 255, 0.8)', marginLeft: 'auto' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {article.readTime}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Article Semantic Body */}
          <article
            className="card"
            style={{
              padding: '24px 20px 32px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Introduction */}
            <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.65, fontWeight: 500, marginBottom: 24, fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: 12 }}>
              {article.introduction}
            </p>

            {/* Dynamically parsed sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {article.sections.map((section, index) => (
                <section key={index} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    {section.heading}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {section.body}
                  </p>
                  {section.bullets && (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 20, marginTop: 4 }}>
                      {section.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>

          {/* High Conversion Localized CTA Widget */}
          <BlogCTA
            city={article.city}
            category={article.category}
            ctaText={article.ctaText}
          />

          {/* FAQ Accordion Section (Search engine indexable details layout) */}
          {article.faqs.length > 0 && (
            <section
              className="card"
              style={{
                padding: '24px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <HelpCircle size={18} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {article.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    style={{
                      borderBottom: idx === article.faqs.length - 1 ? 'none' : '1px solid var(--border)',
                      padding: '16px 0',
                      outline: 'none'
                    }}
                  >
                    <summary
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 700,
                        fontSize: 14,
                        color: 'var(--text)',
                        cursor: 'pointer',
                        listStyle: 'none',
                        outline: 'none',
                        userSelect: 'none'
                      }}
                    >
                      <span style={{ paddingRight: 12 }}>{faq.question}</span>
                      <span style={{ fontSize: 18, color: 'var(--primary-dark)', fontWeight: 300 }}>+</span>
                    </summary>
                    <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Internal Related Links grid */}
          <section style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={16} /> Recommended Reads
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {relatedArticles.map((rel) => (
                <a
                  href={`/blog/${getCountrySlug(rel.country)}/${rel.slug}`}
                  key={rel.slug}
                  className="card card-hover"
                  style={{
                    padding: 16, display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none'
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {rel.category}
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                    {rel.title}
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                    <MapPin size={10} /> {rel.city}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 64
      }}>
        <a href="/" style={{ display: 'inline-flex' }}>
          <Logo size={20} textColor="var(--primary)" />
        </a>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
          © {new Date().getFullYear()} aloaye. Africa's #1 WhatsApp Commerce Platform.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="/signup" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</a>
          <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
