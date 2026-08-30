'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PublicSiteNav, 
  PublicSiteFooter 
} from '@/components/PublicSiteChrome';
import { SolutionPage } from '@/utils/solutionsData';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ShoppingBag, 
  Utensils, 
  Shirt, 
  Smartphone, 
  Sparkles, 
  Lock, 
  MessageCircle, 
  Star, 
  Plus, 
  Layers, 
  ListChecks, 
  HelpCircle
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Utensils,
  Shirt,
  Smartphone,
  Sparkles,
  ShoppingBag,
  Layers
};

export default function SolutionDetailClient({ data }: { data: SolutionPage }) {
  const [cartCount, setCartCount] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const IconComponent = (data.iconName && ICON_MAP[data.iconName]) || Layers;

  return (
    <div style={{ background: '#FFFFFF', color: '#111827', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      
      {/* ── HERO BANNER (SIGNATURE DEEP ROYAL INDIGO) ── */}
      <section style={{ background: 'linear-gradient(135deg, #021C11 0%, #042A19 50%, #074328 100%)', color: '#FFFFFF', paddingTop: 0, paddingBottom: 64, position: 'relative' }}>
        
        <PublicSiteNav />

        <div style={{ maxWidth: 1040, padding: '40px 24px 0', margin: '0 auto', textAlign: 'center' }}>
          
          <Link
            href="/solutions"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#C7D2FE', fontWeight: 700, textDecoration: 'none', marginBottom: 20 }}
          >
            <ArrowLeft size={14} /> What Can I Sell?
          </Link>

          {/* Eyebrow Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'rgba(90, 69, 209, 0.25)',
            border: '1px solid rgba(165, 180, 252, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: '#C7D2FE',
            maxWidth: 'fit-content',
            margin: '0 auto 24px'
          }}>
            <IconComponent size={15} style={{ color: '#A5B4FC' }} />
            <span>{data.eyebrow}</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 auto 20px', color: '#FFFFFF' }}>
            {data.headline} <br />
            <span style={{ color: '#A5B4FC' }}>{data.headlineHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#CBD5E1', maxWidth: 740, margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 400 }}>
            {data.subhead}
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
            
            <a href="/signup" style={{ 
              background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)', 
              color: '#FFFFFF', 
              fontWeight: 700, 
              fontSize: 15, 
              padding: '14px 32px', 
              borderRadius: 999, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              boxShadow: '0 8px 24px rgba(90,69,209,0.4)', 
              transition: 'all 0.2s ease'
            }}>
              <span>Launch {data.eyebrow} Store Free</span>
              <ArrowRight size={16} />
            </a>

            <a href="#demo-preview" style={{ 
              background: '#FFFFFF', 
              color: '#042A19', 
              fontWeight: 700, 
              fontSize: 15, 
              padding: '14px 28px', 
              borderRadius: 999, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
            }}>
              <span>See Live Demo</span>
            </a>

          </div>

          {/* Micro Trust Indicators */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34D399' }} />
              <span>Zero Technical Setup</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34D399' }} />
              <span>Automated WhatsApp Orders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34D399' }} />
              <span>Instant Card & Bank Payments</span>
            </div>
          </div>

        </div>

      </section>

      {/* ── INTERACTIVE CATEGORY STORE PREVIEW DEMO ── */}
      {data.productSamples && data.productSamples.length > 0 && (
        <section id="demo-preview" style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#0B5D39', textTransform: 'uppercase' }}>REAL-TIME STORE PREVIEW</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, marginTop: 4, color: '#111827' }}>
              How Your {data.eyebrow} Store Will Look
            </h2>
            <p style={{ color: '#4B5563', fontSize: 15, maxWidth: 560, margin: '6px auto 0' }}>
              Tap products below to test the live cart counter and WhatsApp order workflow.
            </p>
          </div>

          {/* Browser Frame */}
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: 20, 
            border: '1px solid #E5E7EB', 
            overflow: 'hidden', 
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)' 
          }}>
            
            {/* Header Bar */}
            <div style={{ background: '#181924', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                color: '#FFFFFF', 
                padding: '3px 18px', 
                borderRadius: 999, 
                fontSize: 11, 
                fontWeight: 500, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6 
              }}>
                <Lock size={11} style={{ color: '#27C93F' }} />
                <span>frontstore.ng/<strong style={{ color: '#A5B4FC' }}>{data.slug}</strong></span>
              </div>

              <div style={{ width: 40 }} />
            </div>

            {/* Banner */}
            {data.bannerImage && (
              <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
                <img 
                  src={data.bannerImage} 
                  alt={data.eyebrow} 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)' }} />
                
                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#0B5D39', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFF', margin: 0 }}>
                        {data.eyebrow} Storefront
                      </h3>
                      <span style={{ fontSize: 12, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366">
                          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.784-1.674-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.236-.244-.588-.493-.508-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.51 0 1.48 1.08 2.909 1.23 3.11.15.2 2.126 3.246 5.15 4.552.72.31 1.282.496 1.72.635.723.23 1.381.197 1.902.12.58-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.577-.35zM12.04 21.784h-.002c-1.737 0-3.44-.467-4.935-1.353l-.354-.21-3.67.962.98-3.578-.23-.366A9.742 9.742 0 0 1 2.256 12c0-5.38 4.38-9.76 9.784-9.76 2.607 0 5.058 1.016 6.902 2.86A9.708 9.708 0 0 1 21.784 12c0 5.38-4.38 9.784-9.744 9.784zM12.04 0C5.4 0 0 5.4 0 12.04c0 2.12.553 4.19 1.604 6.01L0 24l6.14-1.61A12.015 12.015 0 0 0 12.04 24c6.64 0 12.04-5.4 12.04-12.04C24.08 5.4 18.68 0 12.04 0z"/>
                        </svg>
                        <span>Verified WhatsApp Merchant</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#16A34A', color: '#FFF', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingBag size={14} />
                    <span>Cart ({cartCount})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Cards */}
            <div style={{ padding: 24, background: '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: 0 }}>Sample {data.eyebrow} Store</h4>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Tap product to test cart</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {data.productSamples.map((prod, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCartCount(prev => prev + 1)}
                    style={{ 
                      background: '#FFFFFF', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: 14, 
                      padding: 12, 
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0B5D39')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  >
                    {prod.badge && (
                      <span style={{ position: 'absolute', top: 18, left: 18, background: '#0B5D39', color: '#FFF', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, zIndex: 1 }}>
                        {prod.badge}
                      </span>
                    )}

                    <div style={{ height: 130, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    <h5 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.name}
                    </h5>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0B5D39' }}>{prod.price}</span>
                        {prod.originalPrice && (
                          <span style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 4 }}>
                            {prod.originalPrice}
                          </span>
                        )}
                      </div>
                      <div style={{ background: '#F3F4F6', color: '#374151', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={14} />
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* WhatsApp Checkout Bar */}
              <div style={{ marginTop: 20, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.784-1.674-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.236-.244-.588-.493-.508-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.51 0 1.48 1.08 2.909 1.23 3.11.15.2 2.126 3.246 5.15 4.552.72.31 1.282.496 1.72.635.723.23 1.381.197 1.902.12.58-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.577-.35zM12.04 21.784h-.002c-1.737 0-3.44-.467-4.935-1.353l-.354-.21-3.67.962.98-3.578-.23-.366A9.742 9.742 0 0 1 2.256 12c0-5.38 4.38-9.76 9.784-9.76 2.607 0 5.058 1.016 6.902 2.86A9.708 9.708 0 0 1 21.784 12c0 5.38-4.38 9.784-9.744 9.784zM12.04 0C5.4 0 0 5.4 0 12.04c0 2.12.553 4.19 1.604 6.01L0 24l6.14-1.61A12.015 12.015 0 0 0 12.04 24c6.64 0 12.04-5.4 12.04-12.04C24.08 5.4 18.68 0 12.04 0z"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>Automated WhatsApp Order Checkout</span>
                </div>
                <a href="/signup" style={{ background: '#059669', color: '#FFF', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>Create My Store</span>
                  <ArrowRight size={13} />
                </a>
              </div>

            </div>

          </div>

        </section>
      )}

      {/* ── DIRECT ANSWER SUMMARY ── */}
      <section style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ background: '#F9FAFB', borderLeft: '4px solid #0B5D39', borderRadius: '0 16px 16px 0', padding: 24 }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 600, color: '#1F2937', margin: 0 }}>
            {data.directAnswer}
          </p>
        </div>
      </section>

      {/* ── INDUSTRY PAIN POINTS & SOLUTIONS ── */}
      <section style={{ padding: '40px 24px 60px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 28 }}>
          {data.sections.map((sec, idx) => (
            <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
                {sec.heading}
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#4B5563', margin: 0 }}>
                {sec.body}
              </p>

              {sec.bullets && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'grid', gap: 10 }}>
                  {sec.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                      <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── STEP-BY-STEP LAUNCH GUIDE ── */}
      {data.steps && data.steps.length > 0 && (
        <section style={{ padding: '60px 24px', maxWidth: 1040, margin: '0 auto', background: '#F9FAFB', borderRadius: 24, border: '1px solid #E5E7EB' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#0B5D39', letterSpacing: '0.08em', textTransform: 'uppercase' }}>EASY LAUNCH PROCESS</span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#111827', marginTop: 4 }}>
              How to Launch Your {data.eyebrow} Store
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {data.steps.map((step, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, position: 'relative' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0B5D39', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, marginBottom: 14 }}>
                  {idx + 1}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.5, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* ── FAQ ACCORDION ── */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#111827' }}>
            {data.eyebrow} FAQs
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: 14, 
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: '#111827',
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={18} style={{ color: '#0B5D39', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 20px 16px', color: '#4B5563', fontSize: 14, lineHeight: 1.6, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ── BOTTOM SIGNUP CTA BANNER ── */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #021C11 0%, #042A19 50%, #074328 100%)', 
          borderRadius: 24, 
          padding: '50px 32px', 
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#FFF', margin: '0 0 14px' }}>
            Start Selling Your {data.eyebrow} Online
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: 16, maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join thousands of merchants taking organized WhatsApp orders with zero technical hassle.
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
            <span>Create Your Free Store</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <PublicSiteFooter />

    </div>
  );
}
