import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  PublicSiteFooter, 
  PublicSiteNav 
} from '@/components/PublicSiteChrome';
import { 
  SOLUTION_PAGES, 
  SolutionPage 
} from '@/utils/solutionsData';
import { 
  Utensils, 
  Shirt, 
  Smartphone, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ChevronRight,
  Store
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'What Can I Sell? - Storefront Solutions by Business Industry',
  description: 'Explore Frontstore online storefront solutions tailored for Food & Drinks, Fashion & Boutique, Gadgets, Beauty & Makeup, and Physical Retail.',
  alternates: { canonical: 'https://frontstore.ng/solutions' },
};

const CATEGORY_CARDS = [
  {
    slug: 'food-drinks',
    title: 'Food & Drinks',
    desc: 'Artisanal bakeries, gourmet meal prep, juices & drinks with daily perishable stock management and delivery zones.',
    icon: Utensils,
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    tags: ['Bakeries', 'Gourmet Meals', 'Juices', 'Catering']
  },
  {
    slug: 'fashion-items',
    title: 'Fashion Items',
    desc: 'Clothing boutiques, accessories, shoes & wear with size/color variant matrix, new drop collections, and instant stock deduction.',
    icon: Shirt,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    tags: ['Apparel', 'Footwear', 'Bags & Accessories', 'Drop Collections']
  },
  {
    slug: 'gadgets',
    title: 'Gadgets & Tech',
    desc: 'Smartphones, audio gear, power banks & electronics with tech spec listings, warranty badges, and card payment links.',
    icon: Smartphone,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    image: 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=600&q=80',
    tags: ['Earbuds & Audio', 'Smartphones', 'Power Banks', 'Accessories']
  },
  {
    slug: 'beauty-makeup',
    title: 'Beauty & Makeup',
    desc: 'Cosmetics, skincare serums, wigs & beauty kits with shade selectors, skin-type recommendations, and organic badges.',
    icon: Sparkles,
    color: '#0B5D39',
    bgColor: '#EDF7F2',
    borderColor: 'rgba(11, 93, 57, 0.2)',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    tags: ['Skincare Serums', 'Cosmetics', 'Wigs & Extensions', 'Makeup Kits']
  },
  {
    slug: 'physical-products',
    title: 'Physical Products',
    desc: 'Universal storefront for home decor, handmade crafts, baby items, tools, and general retail goods with zero setup friction.',
    icon: ShoppingBag,
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
    tags: ['Home Decor', 'Handmade Goods', 'Baby Items', 'Retail Goods']
  }
];

export default function SolutionsIndexPage() {
  const gettingStartedPages = SOLUTION_PAGES.filter(s => s.category === 'Getting Started');
  const aiPages = SOLUTION_PAGES.filter(s => s.category === 'AI & Automation');

  return (
    <div style={{ background: '#FFFFFF', color: '#111827', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      
      {/* ── HERO BANNER (SIGNATURE DEEP ROYAL INDIGO) ── */}
      <section style={{ background: 'linear-gradient(135deg, #021C11 0%, #042A19 50%, #074328 100%)', color: '#FFFFFF', paddingTop: 0, paddingBottom: 64, position: 'relative' }}>
        <PublicSiteNav />

        <div style={{ maxWidth: 1040, padding: '40px 24px 0', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(90, 69, 209, 0.25)',
            border: '1px solid rgba(165, 180, 252, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: '#C7D2FE',
            marginBottom: 24
          }}>
            <Store size={15} style={{ color: '#A5B4FC' }} />
            <span>Storefront Industry Directory</span>
          </div>

          <h1 style={{ fontSize: 'clamp(34px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 auto 20px', color: '#FFFFFF' }}>
            WHAT CAN I SELL? <br />
            <span style={{ color: '#A5B4FC' }}>Built for Every Business</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#CBD5E1', maxWidth: 720, margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 400 }}>
            Frontstore powers online sales for thousands of African merchants selling food, fashion, gadgets, cosmetics, and general merchandise. Select your industry to explore.
          </p>

        </div>
      </section>

      {/* ── 5 CORE INDUSTRY CATEGORIES GRID ── */}
      <section style={{ padding: '60px 24px', maxWidth: 1150, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#0B5D39', textTransform: 'uppercase' }}>EXPLORE BY CATEGORY</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#111827', marginTop: 4 }}>
            Tailored Solutions for Your Specific Products
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.slug} 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
                    
                    <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.bgColor, border: `1px solid ${cat.borderColor}`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFF', margin: 0 }}>
                        {cat.title}
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: 24 }}>
                    <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                      {cat.desc}
                    </p>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                      {cat.tags.map((tag, i) => (
                        <span key={i} style={{ background: '#F3F4F6', color: '#374151', fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 24px 24px' }}>
                  <Link 
                    href={`/solutions/${cat.slug}`} 
                    style={{ 
                      background: '#0B5D39', 
                      color: '#FFFFFF', 
                      fontSize: 14, 
                      fontWeight: 800, 
                      padding: '12px 20px', 
                      borderRadius: 12, 
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 8,
                      width: '100%',
                      boxShadow: '0 4px 12px rgba(90, 69, 209, 0.25)'
                    }}
                  >
                    <span>Explore {cat.title} Storefronts</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* ── ADDITIONAL GUIDES ── */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1040, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Getting Started & AI Automation Guides</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {[...gettingStartedPages, ...aiPages].map((page) => (
            <Link 
              key={page.slug} 
              href={`/solutions/${page.slug}`}
              style={{ 
                background: '#FFFFFF', 
                border: '1px solid #E5E7EB', 
                borderRadius: 14, 
                padding: '18px 20px', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                  {page.headline} {page.headlineHighlight}
                </h4>
                <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0 }}>{page.subhead}</p>
              </div>
              <ChevronRight size={18} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #021C11 0%, #042A19 50%, #074328 100%)', 
          borderRadius: 24, 
          padding: '50px 32px', 
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#FFF', margin: '0 0 14px' }}>
            Ready to Sell Your Products Online?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: 16, maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Launch your store in under 30 seconds with zero coding or hosting configuration.
          </p>

          <a href="/signup" style={{ 
            background: '#FFFFFF', 
            color: '#042A19', 
            fontSize: 16, 
            fontWeight: 800, 
            padding: '14px 36px', 
            borderRadius: 999, 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}>
            <span>Create Free Store</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <PublicSiteFooter />

    </div>
  );
}
