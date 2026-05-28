'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Clock, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { BLOG_ARTICLES, CATEGORIES, CITIES } from '@/utils/blogData';

function getCountrySlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

export default function BlogListingClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Filter and search logic
  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.metaDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.introduction.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;

      const matchesCity =
        selectedCity === 'All' || article.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [searchTerm, selectedCategory, selectedCity]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedCity('All');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
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
            Get Started <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header
        style={{
          padding: 'clamp(40px, 8vw, 72px) 20px clamp(32px, 6vw, 48px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Decorative dynamic background mesh */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '70vw', maxWidth: 500, height: '80%',
          background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <span className="badge badge-primary" style={{ marginBottom: 14, padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> ALOAYE SELLER BLOG
          </span>
          <h1
            className="text-display"
            style={{ marginBottom: 16, fontSize: 'clamp(26px, 5vw, 40px)' }}
          >
            Grow Your Business on{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(142, 71%, 45%), hsl(158, 84%, 39%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              WhatsApp
            </span>
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: 'clamp(14px, 2.2vw, 16px)',
            lineHeight: 1.6,
            maxWidth: 520,
            margin: '0 auto 24px',
          }}>
            Expert strategies, local market insights, and step-by-step guides to double your e-commerce sales in Africa.
          </p>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '4px 12px',
            maxWidth: 480,
            margin: '0 auto',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--t-fast) var(--ease)',
          }}>
            <Search size={18} style={{ color: 'var(--text-muted)', marginRight: 10, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search articles (e.g. Lagos, cosmetics, cake...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '10px 0', fontSize: 14,
                background: 'transparent', color: 'var(--text)',
                minWidth: 0,
              }}
              id="blog-search-input"
              aria-label="Search blog articles"
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      {/* ── Filters and Grid ── */}
      <main style={{ flex: 1, padding: '32px 20px 64px', maxWidth: 1000, width: '100%', margin: '0 auto' }}>
        {/* Filters Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {/* Category Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Niche / Industry
            </span>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%' }} className="no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* City Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Target City
            </span>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%' }} className="no-scrollbar">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`category-chip ${selectedCity === city ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {city !== 'All' && <MapPin size={12} />}
                  {city}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong style={{ color: 'var(--text)' }}>{filteredArticles.length}</strong>{' '}
            {filteredArticles.length === 1 ? 'article' : 'articles'}
            {(selectedCategory !== 'All' || selectedCity !== 'All' || searchTerm) && ' matching filters'}
          </p>

          {(selectedCategory !== 'All' || selectedCity !== 'All' || searchTerm) && (
            <button
              onClick={handleReset}
              className="btn btn-ghost"
              style={{
                padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)'
              }}
            >
              <RotateCcw size={12} /> Reset Filters
            </button>
          )}
        </div>

        {/* Grid of Articles */}
        {filteredArticles.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 20,
          }}>
            {filteredArticles.map((article, index) => (
              <a
                href={`/blog/${getCountrySlug(article.country)}/${article.slug}`}
                key={article.slug}
                className="card card-hover animate-fade-in stagger"
                style={{
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', textDecoration: 'none',
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Visual Header Block */}
                <div style={{
                  height: 140,
                  background: `linear-gradient(135deg, ${article.gradientFrom} 0%, ${article.gradientTo} 100%)`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                  color: '#fff',
                  overflow: 'hidden'
                }}>
                  {/* Decorative background grid */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.1,
                    background: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23ffffff'/%3E%3C/svg%3E\") repeat"
                  }} />

                  <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 'var(--r-sm)', marginBottom: 8 }}>
                      {article.category}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.15)', lineHeight: 1.2 }}>
                      {article.city} Shop Setup
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                  {/* City/Location Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    <MapPin size={11} style={{ color: 'var(--primary)' }} />
                    <span>{article.city}, {article.country}</span>
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'var(--text)',
                    lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', minHeight: 40
                  }}>
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  <p style={{
                    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', flex: 1
                  }}>
                    {article.metaDescription}
                  </p>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

                  {/* Author / Date / Read Time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: article.author.avatarBg, color: article.author.avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 10, fontFamily: 'var(--font-heading)'
                      }}>
                        {article.author.avatarInitials}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{article.author.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} /> {article.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '64px 20px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No articles found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 360, margin: '0 auto 20px' }}>
              We could not find any articles matching your search query or filters. Try adjusting your selections.
            </p>
            <button onClick={handleReset} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={14} /> Clear Search & Filters
            </button>
          </div>
        )}
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
        marginTop: 48
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
