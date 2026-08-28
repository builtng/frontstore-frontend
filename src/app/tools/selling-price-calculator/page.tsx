import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, HelpCircle } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { ToolsSidebar } from '@/components/ToolsSidebar';
import { getTool } from '@/utils/toolsData';
import SellingPriceCalculatorClient from './SellingPriceCalculatorClient';

const tool = getTool('selling-price-calculator')!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: 'https://frontstore.ng/tools/selling-price-calculator' },
};

const FAQS = [
  {
    question: 'How do I calculate selling price from cost and margin?',
    answer: 'Divide your cost price by (1 minus your target margin as a decimal). For example, at a 30% margin: selling price = cost ÷ (1 − 0.30) = cost ÷ 0.70.',
  },
  {
    question: 'Why can\'t margin be 100% or higher?',
    answer: 'Margin is profit divided by selling price, so it can never reach 100% — that would mean the item cost you nothing. As margin approaches 100%, the required selling price grows toward infinity.',
  },
  {
    question: 'Should I price based on margin or markup?',
    answer: 'Margin tells you what share of each sale is profit, which is more useful for comparing profitability across products. Markup tells you how much you added on top of cost. Most retailers plan with margin and check markup as a sanity check.',
  },
  {
    question: 'How do I factor shipping and payment fees into my price?',
    answer: 'Include courier charges, packaging costs, and gateway transaction fees (e.g. 1.5% Paystack fee) directly inside your cost price before applying your target profit margin.',
  },
];

export default function SellingPriceCalculatorPage() {
  const url = 'https://frontstore.ng/tools/selling-price-calculator';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
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
            <Calculator size={12} color="var(--accent)" /> <b>Free Pricing Tool</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Selling Price <span className="mark-highlight">Calculator</span>
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
                    <Calculator size={20} color="var(--primary)" /> Target Margin Price Calculator
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Input cost price and desired profit margin percentage to get your exact selling price.
                  </p>
                </div>

                <SellingPriceCalculatorClient />
              </div>

              {/* How to Use Guide */}
              <section className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', background: 'var(--surface)', borderRadius: 24 }}>
                <h2 className="text-title" style={{ fontSize: 'clamp(18px, 3vw, 22px)', marginBottom: 14 }}>
                  How to Use This Calculator
                </h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Enter what an item costs you and the profit margin you want to hit. The calculator works backwards
                  from your target margin to tell you exactly what to charge — useful when you're setting prices for
                  new stock and want to guarantee a margin rather than guessing at a markup.
                </p>

                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 12, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
                      <strong>Full Cost Accounting:</strong> Ensure item cost includes wholesale cost, delivery to your store, and packaging materials.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
                      <strong>Standardize Prices:</strong> Price products based on percentage margin to maintain overall store profitability regardless of stock cost inflation.
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Desktop Sidebar Column */}
            <ToolsSidebar
              currentSlug="selling-price-calculator"
              proTip={{
                title: 'Pricing Strategy for WhatsApp Catalogs',
                content: 'Always account for seasonal discounts. Setting a 35–45% base margin allows you to safely run 10% promo sales on WhatsApp Status without cutting into your operating cost.',
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
            Price every product with confidence
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22, maxWidth: 540, margin: '0 auto 22px' }}>
            Frontstore lets you set cost price per product and see your margin before you publish to WhatsApp.
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
