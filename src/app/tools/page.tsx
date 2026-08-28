import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Percent,
  Receipt,
  ShoppingCart,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { FREE_TOOLS } from '@/utils/toolsData';

export const metadata: Metadata = {
  title: 'Free Business Calculators for Nigerian & African Merchants – Frontstore',
  description: 'Free profit margin, selling price, break-even, VAT, and conversion calculators built for small business owners selling on WhatsApp and social media in Africa.',
  alternates: { canonical: 'https://frontstore.ng/tools' },
};

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'profit-margin-calculator': <TrendingUp size={22} color="var(--primary)" />,
  'selling-price-calculator': <Percent size={22} color="var(--primary)" />,
  'break-even-calculator': <Calculator size={22} color="var(--primary)" />,
  'cart-abandonment-calculator': <ShoppingCart size={22} color="var(--primary)" />,
  'free-audit': <Zap size={22} color="var(--accent)" />,
  'vat-calculator': <Receipt size={22} color="var(--primary)" />,
};

const TOOL_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  'profit-margin-calculator': { label: 'Pricing & Margins', bg: 'var(--primary-light)', color: 'var(--primary)' },
  'selling-price-calculator': { label: 'Pricing Strategy', bg: 'var(--primary-light)', color: 'var(--primary)' },
  'break-even-calculator': { label: 'Financial Planning', bg: 'var(--primary-light)', color: 'var(--primary)' },
  'cart-abandonment-calculator': { label: 'Revenue Recovery', bg: 'color-mix(in srgb, var(--wa-green) 18%, transparent)', color: '#0d6e63' },
  'free-audit': { label: 'AI Optimizer', bg: 'var(--accent-light)', color: 'var(--accent)' },
  'vat-calculator': { label: 'Tax & Compliance', bg: 'var(--primary-light)', color: 'var(--primary)' },
};

export default function ToolsIndexPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      {/* Hero Header */}
      <header className="hero-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 20px clamp(64px, 9vw, 108px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 450, height: 450, background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 500, height: 500, background: 'color-mix(in srgb, var(--accent) 14%, transparent)', filter: 'blur(90px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Calculator size={13} color="var(--accent)" /> <b>100% Free Merchant Tools</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(32px, 5.5vw, 52px)', color: '#fff', lineHeight: 1.15, marginBottom: 20, fontWeight: 800 }}>
            Free Calculators & Optimizers for <span className="mark-highlight">Growing Your Store</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(16px, 2.2vw, 19px)', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 28px' }}>
            Instant, no-signup business calculators to price your products, calculate your true margins, audit your funnel, and stay on top of VAT — built for social commerce sellers across Africa.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20, color: 'rgba(255,255,255,0.9)', fontSize: 13.5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="var(--wa-green)" /> 100% Free & Unlimited</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="var(--wa-green)" /> No Registration Needed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="var(--wa-green)" /> Built for WhatsApp & Instagram Sellers</span>
          </div>
        </div>
      </header>

      {/* Main Grid Section */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1140, margin: '0 auto', padding: 'clamp(48px, 7vw, 88px) 20px' }}>
        
        {/* Section Title */}
        <div style={{ marginBottom: 36, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Free Financial & Conversion Tools
            </span>
            <h2 className="text-title" style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', color: 'var(--text)', marginTop: 4 }}>
              Select a Calculator
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 460 }}>
            Click on any tool below to run instant calculations tailored for retail, wholesale, and social media commerce.
          </p>
        </div>

        {/* Tools Cards Responsive Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
            marginBottom: 64,
          }}
        >
          {FREE_TOOLS.map((tool) => {
            const badge = TOOL_BADGES[tool.slug] || { label: 'Calculator', bg: 'var(--primary-light)', color: 'var(--primary)' };
            const icon = TOOL_ICONS[tool.slug] || <Calculator size={22} color="var(--primary)" />;

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="card card-hover clickable"
                style={{
                  padding: 28,
                  background: 'var(--surface)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: badge.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </div>

                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: badge.bg,
                        color: badge.color,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
                    {tool.name}
                  </h3>

                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                    {tool.tagline}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: 16,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--primary)',
                  }}
                >
                  <span style={{ color: 'var(--text-faint)', fontSize: 12, fontWeight: 500 }}>
                    ⚡ Instant Results
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Use Calculator <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop Showcase Platform Banner */}
        <div
          className="hero-dark"
          style={{
            borderRadius: 24,
            padding: 'clamp(36px, 6vw, 64px) clamp(24px, 5vw, 48px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 36,
            alignItems: 'center',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--accent)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.1)',
                padding: '4px 12px',
                borderRadius: 20,
                display: 'inline-block',
                marginBottom: 14,
              }}
            >
              FRONTSTORE FOR MERCHANTS
            </span>
            <h2 className="text-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', color: '#fff', marginBottom: 14 }}>
              Ready to sell with clarity & automated margins?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
              Launch your official WhatsApp storefront on Frontstore. Track product cost prices, real profit margins, inventory, and instant bank payouts in one dashboard.
            </p>
            <a
              href="/signup"
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 14,
              }}
            >
              Start Free Trial <ArrowRight size={16} />
            </a>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: 24,
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="var(--wa-green)" /> Why Merchants Love Frontstore
            </h4>
            <div style={{ display: 'grid', gap: 14, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <CheckCircle2 size={16} color="var(--wa-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Instant 1-Click WhatsApp Ordering:</strong> Customers order without download or app friction.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <CheckCircle2 size={16} color="var(--wa-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Automatic Cost & Margin Tracking:</strong> See your profit on every item sold automatically.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <CheckCircle2 size={16} color="var(--wa-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Instant Bank Settlement:</strong> Receive customer payments directly to your bank account.</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      <PublicSiteFooter />
    </div>
  );
}
