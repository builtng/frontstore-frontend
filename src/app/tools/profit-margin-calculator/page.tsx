import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, HelpCircle } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { ToolsSidebar } from '@/components/ToolsSidebar';
import { getTool } from '@/utils/toolsData';
import ProfitMarginCalculatorClient from './ProfitMarginCalculatorClient';

const tool = getTool('profit-margin-calculator')!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: 'https://frontstore.ng/tools/profit-margin-calculator' },
};

const FAQS = [
  {
    question: 'What is profit margin?',
    answer: 'Profit margin is your profit expressed as a percentage of your selling price. If you sell an item for ₦6,000 that cost you ₦4,000, your profit is ₦2,000 and your margin is 33.3% (₦2,000 ÷ ₦6,000).',
  },
  {
    question: 'What is the difference between margin and markup?',
    answer: 'Margin is profit divided by selling price. Markup is profit divided by cost price. On the same sale, markup is always a higher number than margin — a 50% markup on cost gives a 33.3% margin, not a 50% margin.',
  },
  {
    question: 'What is a good profit margin for a small business in Nigeria?',
    answer: 'It varies by category, but many retail and fashion sellers target 30–50% margin, while food and grocery sellers often work with thinner margins of 10–20% due to higher volume and perishability.',
  },
  {
    question: 'How do I track margins automatically on WhatsApp orders?',
    answer: 'Frontstore allows you to set the cost price on every product variant. Whenever an order comes in through your WhatsApp store, the system automatically logs your net profit and margin without spreadsheets.',
  },
];

export default function ProfitMarginCalculatorPage() {
  const url = 'https://frontstore.ng/tools/profit-margin-calculator';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    url,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 5%, var(--bg)) 0%, var(--bg) 480px)', color: 'var(--text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      <PublicSiteNav />

      {/* Hero Header */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 8vw, 88px) 20px clamp(56px, 9vw, 100px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <Link
            href="/tools"
            className="clickable"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textDecoration: 'none', marginBottom: 24 }}
          >
            <ArrowLeft size={14} /> Back to All Free Tools
          </Link>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>
            <Calculator size={12} color="var(--accent)" /> <b>Free Profit Calculator</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Profit Margin <span className="mark-highlight">Calculator</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 540, margin: '0 auto' }}>
            {tool.tagline}
          </p>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1140, margin: '0 auto', padding: '0 20px clamp(48px, 8vw, 88px)' }}>
        
        <div style={{ marginTop: -40, position: 'relative', zIndex: 2, marginBottom: 56 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* Main Column: Calculator + How to Use */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {/* Interactive Calculator Card */}
              <div className="card animate-fade-in" style={{ width: '100%', padding: 'clamp(20px, 4vw, 32px)', background: 'var(--surface)', boxShadow: 'var(--shadow-xl)', borderRadius: 24 }}>
                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calculator size={20} color="var(--primary)" /> Profit & Margin Calculator
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Enter cost price and selling price below to instantly evaluate your numbers.
                  </p>
                </div>

                <ProfitMarginCalculatorClient />
              </div>

              {/* How to Use Guide */}
              <section className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', background: 'var(--surface)', borderRadius: 24 }}>
                <h2 className="text-title" style={{ fontSize: 'clamp(18px, 3vw, 22px)', marginBottom: 14 }}>
                  How to Use This Calculator
                </h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Enter what an item cost you to buy or make, then enter what you sold it for (or plan to sell it for).
                  The calculator instantly shows your profit in naira, your profit margin, and your markup — the three
                  numbers most WhatsApp and social media sellers need to price confidently and know if a sale is actually worth it.
                </p>

                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 12, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
                      <strong>Margin vs Markup:</strong> Margin measures profit relative to selling price; markup measures profit relative to cost.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
                      <strong>Targeting Profitability:</strong> Use the quick preset margin chips above to set ideal prices before uploading products to your store.
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Desktop Sidebar Column */}
            <ToolsSidebar
              currentSlug="profit-margin-calculator"
              proTip={{
                title: 'Merchant Pro Tip: The 35% Rule',
                content: 'Successful fashion and retail sellers on Instagram and WhatsApp target at least 35–40% profit margin to safely cover delivery logistics, social media ad costs, and payment gateway fees.',
              }}
            />
          </div>
        </div>

        {/* FAQs 2-Column Responsive Grid */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Common Questions
            </span>
            <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={22} color="var(--primary)" /> Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {FAQS.map((f) => (
              <div key={f.question} className="card" style={{ padding: 22, background: 'var(--surface)', borderRadius: 18 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>
                  {f.question}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-muted)' }}>
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Full-width dark CTA banner */}
        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center' }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#fff', marginBottom: 12 }}>
            Track every sale's margin automatically
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22, maxWidth: 540, margin: '0 auto 22px' }}>
            Frontstore records cost and selling price on every product so you always know your real profit on WhatsApp orders.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12 }}>
            Set Up Your Store Free <ArrowRight size={15} />
          </a>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
