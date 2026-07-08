import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { getTool } from '@/utils/toolsData';
import VatCalculatorClient from './VatCalculatorClient';

const tool = getTool('vat-calculator')!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: { canonical: 'https://frontstore.app/tools/vat-calculator' },
};

const FAQS = [
  {
    question: 'What is the current VAT rate in Nigeria?',
    answer: 'Nigeria\'s standard VAT rate is 7.5%, set by the Finance Act. It applies to most goods and services sold by VAT-registered businesses, with some categories (like basic food items and medical products) exempted.',
  },
  {
    question: 'How do I add VAT to a price?',
    answer: 'Multiply the price by 0.075 to get the VAT amount, then add it to the original price. For example, ₦10,000 + (₦10,000 × 0.075) = ₦10,750.',
  },
  {
    question: 'How do I remove VAT from a price that already includes it?',
    answer: 'Divide the VAT-inclusive price by 1.075 to get the net price, then subtract that from the original amount to find the VAT portion. For example, ₦10,750 ÷ 1.075 = ₦10,000 net, so VAT was ₦750.',
  },
  {
    question: 'Do small businesses need to charge VAT?',
    answer: 'Under Nigerian tax law, businesses with turnover below a set threshold may qualify for VAT exemption. Always confirm your obligations with FIRS or a tax professional, since thresholds and rules can change.',
  },
];

export default function VatCalculatorPage() {
  const url = 'https://frontstore.app/tools/vat-calculator';

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

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(64px, 10vw, 120px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <Link
            href="/tools"
            className="clickable"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textDecoration: 'none', marginBottom: 28 }}
          >
            <ArrowLeft size={14} /> All Free Tools
          </Link>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Calculator size={12} color="var(--accent)" /> <b>Free Calculator</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Nigeria VAT <span className="mark-highlight">Calculator</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            {tool.tagline}
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 640, margin: '0 auto', padding: '0 20px clamp(48px, 8vw, 72px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -48, position: 'relative', zIndex: 2, marginBottom: 56 }}>
          <div className="card animate-fade-in" style={{ width: '100%', padding: 28, background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}>
            <VatCalculatorClient />
          </div>
        </div>

        <section style={{ marginBottom: 48 }}>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 26px)', marginBottom: 16 }}>
            How to Use This Calculator
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text-muted)' }}>
            Switch to "Add VAT" if you have a price before tax and want to know what to charge including VAT.
            Switch to "Remove VAT" if you have a final price and want to know how much of it is VAT versus the
            actual cost of goods. Both use Nigeria's standard 7.5% rate.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 26px)', marginBottom: 20 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {FAQS.map((f) => (
              <div key={f.question} className="card" style={{ padding: 20, background: 'var(--surface)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{f.question}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-muted)' }}>{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center' }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#fff', marginBottom: 12 }}>
            Sell with tax handled correctly
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22 }}>
            Frontstore keeps a clear record of every sale so VAT and reporting are never a guessing game.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={15} />
          </a>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
