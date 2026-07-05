'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin, Calendar, Clock, ArrowLeft, ArrowUp, ArrowRight, BookOpen,
  HelpCircle, Link2, Check, ChevronDown, List,
} from 'lucide-react';
import BlogCTA from '@/components/BlogCTA';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import type { BlogArticle } from '@/utils/blogData';

function getCountrySlug(country?: string): string {
  return (country || '').toLowerCase().replace(/\s+/g, '-');
}

function headingToId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface Props {
  article: BlogArticle;
  relatedArticles: BlogArticle[];
  canonicalUrl: string;
}

export default function BlogArticleClient({ article, relatedArticles, canonicalUrl }: Props) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copied, setCopied] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocItems = useMemo(
    () => article.sections.map((s) => ({ id: headingToId(s.heading), label: s.heading })),
    [article.sections]
  );

  useEffect(() => {
    let ticking = false;

    const measure = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
      setShowBackToTop(scrollTop > 640);

      let current = '';
      for (const item of tocItems) {
        const el = sectionRefs.current[item.id];
        if (el && el.getBoundingClientRect().top < 160) current = item.id;
      }
      setActiveId(current);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tocItems]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this link:', canonicalUrl);
    }
  };

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const shareText = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(canonicalUrl);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Reading progress rail */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 60, background: 'transparent' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--wa-green))',
            transition: 'width 80ms linear',
          }}
        />
      </div>

      <PublicSiteNav />

      {/* ── Editorial Hero ── */}
      <header style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="hero-mesh" />
        <div className="hero-grid" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, width: '100%', margin: '0 auto', padding: 'clamp(28px, 6vw, 56px) 20px 40px' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-faint)', marginBottom: 24, flexWrap: 'wrap' }}>
            <a href="/" style={{ color: 'inherit' }}>Home</a>
            <span>/</span>
            <a href="/blog" style={{ color: 'inherit' }}>Blog</a>
            <span>/</span>
            <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{article.title}</span>
          </nav>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            <span className="badge badge-primary">{article.category}</span>
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} /> {article.city}, {article.country}
            </span>
          </div>

          <h1
            className="font-heading"
            style={{
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 18,
            }}
          >
            {article.title}
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28, maxWidth: 640 }}>
            {article.metaDescription}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: article.author.avatarBg, color: article.author.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-heading)', flexShrink: 0,
              }}>
                {article.author.avatarInitials}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>{article.author.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{article.author.role}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, color: 'var(--text-faint)', fontSize: 12.5, marginLeft: 'auto' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} />
                {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile TOC strip */}
      {tocItems.length > 1 && (
        <div className="sticky-bar no-scrollbar blog-mobile-toc" style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto' }}>
          <a href="/blog" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }}>
            <ArrowLeft size={13} /> Hub
          </a>
          {tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`category-chip ${activeId === item.id ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '6px 14px', fontSize: 12 }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <main style={{
        flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto',
        padding: '40px 20px 64px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 40,
      }}>
        <div className="blog-layout">
          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minWidth: 0 }}>
            <article
              className="card"
              style={{ padding: 'clamp(24px, 4vw, 40px)', background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="blog-drop-cap" style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 32 }}>
                {article.introduction}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {article.sections.map((section, index) => {
                  const id = headingToId(section.heading);
                  return (
                    <section
                      key={index}
                      id={id}
                      ref={(el) => { sectionRefs.current[id] = el; }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12, scrollMarginTop: 100 }}
                    >
                      <h2 style={{
                        fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px, 2.4vw, 22px)', fontWeight: 800,
                        color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)',
                          color: 'var(--primary)', fontSize: 13, fontWeight: 800, flexShrink: 0,
                        }}>
                          {index + 1}
                        </span>
                        {section.heading}
                      </h2>
                      <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, paddingLeft: 38 }}>
                        {section.body}
                      </p>
                      {section.bullets && (
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 38, marginTop: 4 }}>
                          {section.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
                                marginTop: 8, flexShrink: 0,
                              }} />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* Author sign-off */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, marginTop: 40, paddingTop: 28,
                borderTop: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: article.author.avatarBg, color: article.author.avatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)', flexShrink: 0,
                }}>
                  {article.author.avatarInitials}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 2 }}>
                    Written by
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{article.author.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{article.author.role} at frontstore</p>
                </div>
              </div>
            </article>

            <BlogCTA city={article.city} category={article.category} ctaText={article.ctaText} />

            {article.faqs.length > 0 && (
              <section className="card" style={{ padding: 'clamp(20px, 3vw, 32px)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 800, color: 'var(--text)',
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18,
                }}>
                  <HelpCircle size={19} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {article.faqs.map((faq, idx) => (
                    <details key={idx} className="blog-faq" style={{ borderBottom: idx === article.faqs.length - 1 ? 'none' : '1px solid var(--border)', padding: '16px 0' }}>
                      <summary className="blog-faq__summary">
                        <span style={{ paddingRight: 16 }}>{faq.question}</span>
                        <ChevronDown size={18} className="blog-faq__chevron" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      </summary>
                      <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.65 }}>
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {relatedArticles.length > 0 && (
              <section>
                <h3 style={{
                  fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800, color: 'var(--text)',
                  marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  <BookOpen size={17} /> Recommended Reads
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {relatedArticles.map((rel) => (
                    <a
                      href={`/blog/${getCountrySlug(rel.country)}/${rel.slug}`}
                      key={rel.slug}
                      className="card card-hover"
                      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textDecoration: 'none' }}
                    >
                      <div style={{
                        height: 84, background: `linear-gradient(135deg, ${rel.gradientFrom} 0%, ${rel.gradientTo} 100%)`,
                        display: 'flex', alignItems: 'center', padding: '0 16px',
                      }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10 }}>
                          {rel.category}
                        </span>
                      </div>
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>
                          {rel.title}
                        </h4>
                        <p style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={10} /> {rel.city} · {rel.readTime}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sticky side rail */}
          <aside className="blog-rail">
            <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tocItems.length > 1 && (
                <div className="card" style={{ padding: 18, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p style={{
                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--text-faint)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <List size={13} /> On this page
                  </p>
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        style={{
                          textAlign: 'left', border: 'none', cursor: 'pointer',
                          padding: '7px 10px', borderRadius: 8, fontSize: 13, lineHeight: 1.4,
                          fontWeight: activeId === item.id ? 700 : 500,
                          color: activeId === item.id ? 'var(--primary)' : 'var(--text-muted)',
                          background: activeId === item.id ? 'var(--primary-light)' : 'transparent',
                          transition: 'all var(--t-fast) var(--ease)',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              <div className="card" style={{ padding: 18, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p style={{
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--text-faint)', marginBottom: 12,
                }}>
                  Share this guide
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '9px 0', fontSize: 12 }}
                    aria-label="Share on WhatsApp"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '9px 0', fontSize: 12 }}
                    aria-label="Share on X"
                  >
                    X
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-outline"
                    style={{ padding: '9px 12px', fontSize: 12 }}
                    aria-label="Copy link"
                  >
                    {copied ? <Check size={14} /> : <Link2 size={14} />}
                  </button>
                </div>
              </div>

              <a
                href="/signup"
                className="card card-hover"
                style={{
                  padding: 18, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6,
                  background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: '#fff',
                  border: 'none',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800 }}>Ready to sell on WhatsApp?</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                  Launch your free storefront in {article.city} today.
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>
                  Get started <ArrowRight size={13} />
                </span>
              </a>
            </div>
          </aside>
        </div>
      </main>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn btn-primary animate-fade-in"
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 44, height: 44, padding: 0,
            borderRadius: 'var(--r-full)', zIndex: 40,
          }}
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      <PublicSiteFooter />
    </div>
  );
}
