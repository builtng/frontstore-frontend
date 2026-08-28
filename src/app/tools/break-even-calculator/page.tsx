import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, HelpCircle } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { ToolsSidebar } from '@/components/ToolsSidebar';
import { getTool } from '@/utils/toolsData';
import BreakEvenCalculatorClient from './BreakEvenCalculatorClient';

const tool = getTool('break-even-calculator')!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: 'https://frontstore.ng/tools/break-even-calculator' },
};

const FAQS = [
  {
    question: 'What is the break-even point?',
    answer: 'The break-even point is the number of units you need to sell for your total revenue to equal your total costs — fixed costs plus variable costs. Beyond that point, every extra sale is pure profit.',
  },
  {
    question: 'What counts as a fixed cost vs a variable cost?',
    answer: 'Fixed costs stay the same regardless of sales volume — rent, staff salaries, subscriptions. Variable costs scale with each unit sold — raw materials, packaging, and per-item delivery cost.',
  },
  {
    question: 'How is break-even point calculated?',
    answer: 'Break-even units = fixed costs ÷ (selling price per unit − variable cost per unit). The denominator is called the contribution margin — how much each sale contributes toward covering fixed costs.',
  },
  {
    question: 'How do I lower my break-even target?',
    answer: 'You can lower your break-even point by negotiating lower wholesale prices, optimizing delivery packaging, or slightly raising prices to increase your per-unit contribution margin.',
  },
];

export default function BreakEvenCalculatorPage() {
  const url = 'https://frontstore.ng/tools/break-even-calculator';

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
            <Calculator size={12} color="var(--accent)" /> <b>Free Business Planning Tool</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Break-Even <span className="mark-highlight">Calculator</span>
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
                    <Calculator size={20} color="var(--primary)" /> Break-Even Point Calculator
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Calculate how many sales you need per month before your business turns a profit.
                  </p>
                </div>

                <BreakEvenCalculatorClient />
              </div>

              {/* How to Use Guide */}
              <section className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', background: 'var(--surface)', borderRadius: 24 }}>
                <h2 className="text-title" style={{ fontSize: 'clamp(18px, 3vw, 22px)', marginBottom: 14 }}>
                  How to Use This Calculator
                </h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Add up your monthly fixed costs (rent, salaries, subscriptions), enter what you sell each unit for,
                  and what each unit costs you to make or buy. The calculator shows how many units — and how much
                  revenue — you need before a month starts turning a real profit.
                </p>

                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 12, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
                      <strong>Fixed Expenses:</strong> Be honest with recurring operational costs (internet data, store hosting, staff allowances).
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
                      <strong>Sales Target Benchmark:</strong> Divide monthly break-even units by 30 to know your required daily order volume target.
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Desktop Sidebar Column */}
            <ToolsSidebar
              currentSlug="break-even-calculator"
              proTip={{
                title: 'Daily Sales Benchmarks',
                content: 'Once you know your monthly break-even units, divide by 30 days to get your Daily Minimum Sales Target for your WhatsApp status updates!',
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
            Know your numbers before you sell
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22, maxWidth: 540, margin: '0 auto 22px' }}>
            Frontstore gives you automated order and revenue reporting so you can see your break-even progress in real time.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12 }}>
            Get Started Free <ArrowRight size={15} />
          </a>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
