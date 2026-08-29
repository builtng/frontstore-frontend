'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Clock,
  BookOpen,
  RotateCcw,
  Compass,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Check,
  Globe2,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { BLOG_ARTICLES, CATEGORIES, CITIES } from '@/utils/blogData';

function getCountrySlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

// Popular primary commercial hubs for quick-select
const TOP_HUBS = [
  'All',
  'Lagos',
  'Abuja',
  'Nairobi',
  'Accra',
  'Johannesburg',
  'Port Harcourt',
  'Kumasi',
  'Kampala',
  'Cape Town',
  'Asaba',
  'Kano',
  'Enugu',
];

// Nigerian Geopolitical Zones for State Guides
const GEO_ZONES: Record<string, string[]> = {
  'South West': ['Lagos State', 'Oyo State', 'Ogun State', 'Ondo State', 'Osun State', 'Ekiti State'],
  'South East': ['Abia State', 'Anambra State', 'Ebonyi State', 'Enugu State', 'Imo State'],
  'South South': ['Rivers State', 'Delta State', 'Edo State', 'Akwa Ibom State', 'Bayelsa State', 'Cross River State'],
  'North Central': ['Benue State', 'Kogi State', 'Kwara State', 'Nasarawa State', 'Niger State', 'Plateau State'],
  'North West': ['Kano State', 'Kaduna State', 'Katsina State', 'Kebbi State', 'Sokoto State', 'Jigawa State', 'Zamfara State'],
  'North East': ['Bauchi State', 'Borno State', 'Adamawa State', 'Gombe State', 'Taraba State', 'Yobe State'],
  'FCT': ['the FCT'],
};

export default function BlogListingClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [guideMode, setGuideMode] = useState<'all' | 'industry' | 'state'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');

  // Location search modal / popover
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchInput, setLocationSearchInput] = useState('');

  // Pagination & progressive loading states
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Horizontal scroll container ref for hub pills
  const hubScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (hubScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = hubScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
  }, []);

  const scrollHubs = (direction: 'left' | 'right') => {
    if (hubScrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      hubScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  // Compute all unique location names from articles for search popover
  const allLocationsList = useMemo(() => {
    const locSet = new Set<string>();
    BLOG_ARTICLES.forEach((a) => {
      if (a.city) locSet.add(a.city);
    });
    return Array.from(locSet).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredLocationsForModal = useMemo(() => {
    if (!locationSearchInput.trim()) return allLocationsList;
    const q = locationSearchInput.toLowerCase();
    return allLocationsList.filter((loc) => loc.toLowerCase().includes(q));
  }, [allLocationsList, locationSearchInput]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const total = BLOG_ARTICLES.length;
    const stateCount = BLOG_ARTICLES.filter((a) => a.category === 'State Guide' || a.slug.includes('state') || a.slug.includes('fct-abuja')).length;
    const industryCount = total - stateCount;
    return { total, industryCount, stateCount };
  }, []);

  // Filter and search logic
  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const isStateArticle = article.category === 'State Guide' || article.slug.includes('state') || article.slug.includes('fct-abuja');

      // 1. Guide Mode Filter
      if (guideMode === 'industry' && isStateArticle) return false;
      if (guideMode === 'state' && !isStateArticle) return false;

      // 2. Zone Filter for State Guides
      if (guideMode === 'state' && selectedZone !== 'All') {
        const allowedStates = GEO_ZONES[selectedZone] || [];
        if (!allowedStates.includes(article.city)) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All') {
        if (article.category !== selectedCategory) return false;
      }

      // 4. City / Location Filter
      if (selectedCity !== 'All') {
        if (article.city !== selectedCity) return false;
      }

      // 5. Text Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          article.title.toLowerCase().includes(q) ||
          article.metaDescription.toLowerCase().includes(q) ||
          article.introduction.toLowerCase().includes(q) ||
          article.city.toLowerCase().includes(q) ||
          article.category.toLowerCase().includes(q) ||
          article.country.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [searchTerm, guideMode, selectedCategory, selectedCity, selectedZone]);

  // Sliced articles to render currently visible page
  const visibleArticles = useMemo(() => {
    return filteredArticles.slice(0, visibleCount);
  }, [filteredArticles, visibleCount]);

  // Reset pagination when active filters or search terms change
  useEffect(() => {
    setVisibleCount(9);
  }, [searchTerm, guideMode, selectedCategory, selectedCity, selectedZone]);

  // Load more handler with simulated transition for premium feel
  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 9, filteredArticles.length));
      setIsLoadingMore(false);
    }, 450);
  };

  // Intersection Observer for automated infinite scroll loading
  useEffect(() => {
    const currentSentinel = observerRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && visibleCount < filteredArticles.length && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [visibleCount, filteredArticles.length, isLoadingMore]);

  const handleReset = () => {
    setSearchTerm('');
    setGuideMode('all');
    setSelectedCategory('All');
    setSelectedCity('All');
    setSelectedZone('All');
    setVisibleCount(9);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    guideMode !== 'all' ||
    selectedCategory !== 'All' ||
    selectedCity !== 'All' ||
    selectedZone !== 'All';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      {/* ── Hero Section ── */}
      <header
        style={{
          padding: 'clamp(40px, 8vw, 68px) 20px clamp(32px, 6vw, 44px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Decorative dynamic background mesh */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70vw',
            maxWidth: 540,
            height: '80%',
            background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 75%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <span
            className="badge badge-primary"
            style={{
              marginBottom: 14,
              padding: '5px 12px',
              fontSize: 11,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 'var(--r-full)',
            }}
          >
            <BookOpen size={12} /> FRONTSTORE SELLER BLOG & PLAYBOOKS
          </span>
          <h1
            className="text-display"
            style={{ marginBottom: 16, fontSize: 'clamp(26px, 5vw, 40px)' }}
          >
            Grow Your Business on{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(142, 70%, 49%), hsl(168, 76%, 36%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              WhatsApp
            </span>
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'clamp(14px, 2.2vw, 16px)',
              lineHeight: 1.6,
              maxWidth: 540,
              margin: '0 auto 24px',
            }}
          >
            Expert commerce guides, local market playbooks, and state-by-state strategies to double your sales across Africa.
          </p>

          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: '4px 14px',
              maxWidth: 500,
              margin: '0 auto',
              boxShadow: 'var(--shadow-sm)',
              transition: 'border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease)',
            }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)', marginRight: 10, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search articles (e.g. Lagos, cosmetics, Rivers State...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '10px 0',
                fontSize: 14,
                background: 'transparent',
                color: 'var(--text)',
                minWidth: 0,
              }}
              id="blog-search-input"
              aria-label="Search blog articles"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Filters and Grid ── */}
      <main style={{ flex: 1, padding: '32px 20px 64px', maxWidth: 1060, width: '100%', margin: '0 auto' }}>
        {/* Filters Card Panel */}
        <section
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '20px 22px',
            marginBottom: 32,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* ── Guide Type Switcher (Segmented Control) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={13} style={{ color: 'var(--primary)' }} /> Guide Collection
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 6,
                background: 'var(--bg)',
                padding: 4,
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => {
                  setGuideMode('all');
                  setSelectedZone('All');
                }}
                className={`btn btn-sm ${guideMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  flex: '1 1 auto',
                  borderRadius: 'var(--r-md)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={14} /> All Playbooks ({tabCounts.total})
              </button>

              <button
                onClick={() => {
                  setGuideMode('industry');
                  setSelectedZone('All');
                }}
                className={`btn btn-sm ${guideMode === 'industry' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  flex: '1 1 auto',
                  borderRadius: 'var(--r-md)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Building2 size={14} /> Industry & City Guides ({tabCounts.industryCount})
              </button>

              <button
                onClick={() => {
                  setGuideMode('state');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                }}
                className={`btn btn-sm ${guideMode === 'state' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  flex: '1 1 auto',
                  borderRadius: 'var(--r-md)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Globe2 size={14} /> 🇳🇬 36 States & FCT Guides ({tabCounts.stateCount})
              </button>
            </div>
          </div>

          {/* ── Sub-Filters for Industry Mode / All Mode ── */}
          {guideMode !== 'state' && (
            <>
              {/* Category Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  Niche / Industry
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 'var(--r-full)',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Location / City Filter with Sleek Hubs + Dropdown Popover */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                    Target Location
                  </span>

                  {/* Search All Cities / States button */}
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Search size={12} />
                    {selectedCity !== 'All' && !TOP_HUBS.includes(selectedCity)
                      ? `Selected: ${selectedCity}`
                      : 'All Cities & States (130+)'}
                  </button>
                </div>

                {/* Hub Pills with Smooth Horizontal Scroll & Left/Right Arrows */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollHubs('left')}
                      aria-label="Scroll locations left"
                      style={{
                        position: 'absolute',
                        left: -8,
                        zIndex: 2,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text)',
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}

                  <div
                    ref={hubScrollRef}
                    onScroll={checkScroll}
                    style={{
                      display: 'flex',
                      gap: 8,
                      overflowX: 'auto',
                      padding: '4px 2px',
                      width: '100%',
                      scrollbarWidth: 'none',
                    }}
                    className="no-scrollbar"
                  >
                    {TOP_HUBS.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`category-chip ${selectedCity === city ? 'active' : ''}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          padding: '6px 14px',
                          fontSize: 13,
                          borderRadius: 'var(--r-full)',
                        }}
                      >
                        {city !== 'All' && <MapPin size={12} />}
                        {city}
                      </button>
                    ))}

                    {/* Show selected custom city if outside top hubs */}
                    {selectedCity !== 'All' && !TOP_HUBS.includes(selectedCity) && (
                      <button
                        onClick={() => setSelectedCity(selectedCity)}
                        className="category-chip active"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          padding: '6px 14px',
                          fontSize: 13,
                          borderRadius: 'var(--r-full)',
                        }}
                      >
                        <MapPin size={12} />
                        {selectedCity}
                      </button>
                    )}
                  </div>

                  {canScrollRight && (
                    <button
                      onClick={() => scrollHubs('right')}
                      aria-label="Scroll locations right"
                      style={{
                        position: 'absolute',
                        right: -8,
                        zIndex: 2,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text)',
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Sub-Filters for State Guide Mode ── */}
          {guideMode === 'state' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Filter by Geopolitical Zone
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedZone('All')}
                  className={`category-chip ${selectedZone === 'All' ? 'active' : ''}`}
                  style={{ borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: 13 }}
                >
                  All 37 States
                </button>
                {Object.keys(GEO_ZONES).map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`category-chip ${selectedZone === zone ? 'active' : ''}`}
                    style={{ borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: 13 }}
                  >
                    {zone} ({GEO_ZONES[zone].length})
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Results Header Metadata ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong style={{ color: 'var(--text)' }}>{filteredArticles.length}</strong>{' '}
            {filteredArticles.length === 1 ? 'guide' : 'guides'}
            {hasActiveFilters && ' matching your criteria'}
          </p>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="btn btn-ghost"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <RotateCcw size={12} /> Reset Filters
            </button>
          )}
        </div>

        {/* ── Grid of Articles ── */}
        {filteredArticles.length > 0 ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 22,
              }}
            >
              {visibleArticles.map((article, index) => {
                const isStateGuide = article.category === 'State Guide' || article.slug.includes('state') || article.slug.includes('fct-abuja');

                return (
                  <a
                    href={`/blog/${getCountrySlug(article.country)}/${article.slug}`}
                    key={article.slug}
                    className="card card-hover animate-fade-in stagger"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      animationDelay: `${(index % 9) * 40}ms`,
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-lg)',
                      background: 'var(--surface)',
                    }}
                  >
                    {/* Visual Header Block */}
                    <div
                      style={{
                        height: 140,
                        background: `linear-gradient(135deg, ${article.gradientFrom} 0%, ${article.gradientTo} 100%)`,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        color: '#fff',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Decorative background grid */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0.12,
                          background:
                            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23ffffff'/%3E%3C/svg%3E\") repeat",
                        }}
                      />

                      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '90%' }}>
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(255,255,255,0.22)',
                            color: '#fff',
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 'var(--r-sm)',
                            marginBottom: 8,
                            backdropFilter: 'blur(4px)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {isStateGuide ? '🇳🇬 State Commerce Guide' : article.category}
                        </span>
                        <h3
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 16,
                            fontWeight: 800,
                            textShadow: '0 2px 4px rgba(0,0,0,0.25)',
                            lineHeight: 1.25,
                          }}
                        >
                          {isStateGuide ? `${article.city} Playbook` : `${article.city} Shop Setup`}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                      {/* Location Tag */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--text-muted)',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        <MapPin size={11} style={{ color: 'var(--primary)' }} />
                        <span>
                          {article.city}, {article.country}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--text)',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40,
                        }}
                      >
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flex: 1,
                        }}
                      >
                        {article.metaDescription}
                      </p>

                      {/* Divider */}
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

                      {/* Author / Date / Read Time */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: 'var(--text-faint)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: article.author.avatarBg,
                              color: article.author.avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 10,
                              fontFamily: 'var(--font-heading)',
                            }}
                          >
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
                );
              })}

              {/* Skeleton loading cards when pagination/infinite scroll is active */}
              {isLoadingMore &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="card animate-fade-in"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      minHeight: 380,
                    }}
                  >
                    <div className="skeleton" style={{ height: 140, width: '100%' }} />
                    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
                      <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 4 }} />
                        <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 4 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, marginTop: 8 }}>
                        <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 3 }} />
                        <div className="skeleton" style={{ height: 12, width: '95%', borderRadius: 3 }} />
                        <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 3 }} />
                      </div>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                        <div className="skeleton" style={{ height: 10, width: 40, borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination Sentinel / Load More Button */}
            {visibleCount < filteredArticles.length && (
              <div
                ref={observerRef}
                style={{
                  marginTop: 48,
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="btn btn-outline"
                  style={{
                    padding: '12px 28px',
                    fontSize: 14,
                    borderRadius: 'var(--r-full)',
                    minWidth: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all var(--t-normal) var(--ease)',
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="spinner spinner-primary" style={{ width: 16, height: 16 }} />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              No guides found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 380, margin: '0 auto 20px' }}>
              We could not find any articles matching your search query or filters. Try adjusting your selections.
            </p>
            <button
              onClick={handleReset}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RotateCcw size={14} /> Clear Search & Filters
            </button>
          </div>
        )}
      </main>

      {/* ── Location Selector Modal ── */}
      {isLocationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLocationModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              width: '100%',
              maxWidth: 480,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              animation: 'fade-in 0.2s ease',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Select Target City or State
                </h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '4px 10px',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)', marginRight: 8 }} />
                <input
                  type="text"
                  placeholder="Search among 130+ African cities & Nigerian states..."
                  value={locationSearchInput}
                  onChange={(e) => setLocationSearchInput(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    color: 'var(--text)',
                    padding: '8px 0',
                  }}
                />
                {locationSearchInput && (
                  <button
                    onClick={() => setLocationSearchInput('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
              <button
                onClick={() => {
                  setSelectedCity('All');
                  setIsLocationModalOpen(false);
                  setLocationSearchInput('');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  background: selectedCity === 'All' ? 'var(--primary-light)' : 'transparent',
                  color: selectedCity === 'All' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: selectedCity === 'All' ? 700 : 500,
                  fontSize: 13.5,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span>🌍 All Locations</span>
                {selectedCity === 'All' && <Check size={16} />}
              </button>

              {filteredLocationsForModal.map((loc) => {
                const isSelected = selectedCity === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedCity(loc);
                      setIsLocationModalOpen(false);
                      setLocationSearchInput('');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 'var(--r-md)',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13.5,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={13} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span>{loc}</span>
                    </div>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}

              {filteredLocationsForModal.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                  No matching cities or states found for &quot;{locationSearchInput}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PublicSiteFooter />
    </div>
  );
}
