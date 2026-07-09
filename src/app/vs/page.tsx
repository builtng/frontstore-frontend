import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowRight, ArrowUpRight, Check, X } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { VS_COMPETITORS } from '@/utils/vsData';

export const metadata: Metadata = {
  title: 'Frontstore Comparisons – See How We Stack Up Against the Alternatives',
  description: 'Compare Frontstore against Bumpa, MyShoplet, Catlog, Selar, Vendda, and Shopify on WhatsApp checkout, AI product listings, pricing, and setup time.',
  alternates: { canonical: 'https://frontstore.ng/vs' },
};

interface QuickFacts {
  whatsapp: { yes: boolean; note: string };
  ai: { yes: boolean; note: string };
  price: string;
  setup: string;
  fee: string;
}

const QUICK_FACTS: Record<string, QuickFacts> = {
  frontstore: {
    whatsapp: { yes: true, note: 'Order = a WhatsApp message' },
    ai: { yes: true, note: 'Photo in, full listing out' },
    price: '₦1,500/mo or ₦15,000/yr',
    setup: '< 2 minutes',
    fee: 'None',
  },
  bumpa: {
    whatsapp: { yes: false, note: 'Dashboard, not WhatsApp' },
    ai: { yes: false, note: 'Manual entry' },
    price: '~₦15,000/quarter+',
    setup: 'Guided onboarding',
    fee: 'Not published',
  },
  myshoplet: {
    whatsapp: { yes: false, note: 'AI agent replies in-chat' },
    ai: { yes: false, note: 'Chat-focused, not catalogue' },
    price: '₦15,000–₦75,000/mo',
    setup: 'Minutes',
    fee: '1% on entry tier',
  },
  catlog: {
    whatsapp: { yes: false, note: 'Standalone catalogue' },
    ai: { yes: false, note: 'Manual entry' },
    price: 'Varies by plan',
    setup: '~5 minutes',
    fee: 'Not published',
  },
  selar: {
    whatsapp: { yes: false, note: 'Hosted payment link' },
    ai: { yes: false, note: 'Manual entry' },
    price: 'Free – ₦22,500/mo',
    setup: 'Minutes',
    fee: '~4% + ₦50/sale',
  },
  vendda: {
    whatsapp: { yes: false, note: 'Notifications only' },
    ai: { yes: false, note: 'Not published' },
    price: 'Not published',
    setup: 'Minutes',
    fee: 'Not published',
  },
  shopify: {
    whatsapp: { yes: false, note: 'Web cart checkout' },
    ai: { yes: false, note: 'Sidekick assists, doesn’t list' },
    price: '$19–$299+/mo',
    setup: 'Hours to days',
    fee: '0.6%–2% (3rd-party)',
  },
};

function FactCell({ yes, note }: { yes: boolean; note: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
      {yes
        ? <Check size={14} color="var(--primary)" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />
        : <X size={14} color="var(--text-faint)" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />}
      {note}
    </span>
  );
}

export default function VsIndexPage() {
  const frontstoreFacts = QUICK_FACTS.frontstore;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Scale size={12} color="var(--accent)" /> <b>Compare Platforms</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Frontstore vs <span className="mark-highlight">The Alternatives</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
            Fair, feature-by-feature comparisons to help you pick the right platform for selling on WhatsApp and social media in Africa.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Try Frontstore Free <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 1040, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>

        {/* ── At a glance matrix ── */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 20, textAlign: 'center' }}>
            All Platforms at a Glance
          </h2>
          <div className="card" style={{ overflowX: 'auto', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', padding: 0 }}>
            <table className="no-scrollbar" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Platform</th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>WhatsApp Checkout</th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>AI Product Listings</th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Starting Price</th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Setup Time</th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Transaction Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid var(--border)', background: 'var(--primary-light)' }}>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                    <span className="badge badge-primary" style={{ background: 'var(--primary)', color: '#fff' }}>Frontstore</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}><FactCell {...frontstoreFacts.whatsapp} /></td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}><FactCell {...frontstoreFacts.ai} /></td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{frontstoreFacts.price}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{frontstoreFacts.setup}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{frontstoreFacts.fee}</td>
                </tr>
                {VS_COMPETITORS.map((c) => {
                  const facts = QUICK_FACTS[c.slug];
                  return (
                    <tr key={c.slug} className="comparison-row" style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                        <Link href={`/vs/${c.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{c.name}</Link>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 12.5, color: 'var(--text-muted)' }}><FactCell {...facts.whatsapp} /></td>
                      <td style={{ padding: '16px 20px', fontSize: 12.5, color: 'var(--text-muted)' }}><FactCell {...facts.ai} /></td>
                      <td style={{ padding: '16px 20px', fontSize: 12.5, color: 'var(--text-muted)' }}>{facts.price}</td>
                      <td style={{ padding: '16px 20px', fontSize: 12.5, color: 'var(--text-muted)' }}>{facts.setup}</td>
                      <td style={{ padding: '16px 20px', fontSize: 12.5, color: 'var(--text-muted)' }}>{facts.fee}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--text-faint)', marginTop: 12 }}>
            Based on information publicly listed by each platform. Pricing and features can change — see each comparison page for sources and details.
          </p>
        </section>

        {/* ── Comparison grid ── */}
        <section>
          <h2 className="text-title" style={{ fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 20, textAlign: 'center' }}>
            Browse Every Comparison
          </h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {VS_COMPETITORS.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="card clickable"
                style={{
                  padding: 22, background: 'var(--surface)', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `hsl(${c.hue}, 70%, 94%)`, color: `hsl(${c.hue}, 55%, 38%)`,
                      fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <span className="badge badge-accent">{c.category}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                    Frontstore vs {c.name}
                  </p>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {c.name} — {c.tagline}
                  </p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--primary)' }}>
                  Compare <ArrowUpRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center', marginTop: 56 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#fff', marginBottom: 12 }}>
            Ready to launch your own WhatsApp store?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22 }}>
            Free to start. No credit card required. Live in under 2 minutes.
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
