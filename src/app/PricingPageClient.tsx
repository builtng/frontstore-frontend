'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Check, CreditCard, Building2, Smartphone,
  ShieldCheck, Clock, Zap, Percent, BadgeCheck, X, ListChecks,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

const PAYMENT_METHODS = [
  { name: 'Paystack', icon: CreditCard, note: 'Cards, bank transfer & dedicated accounts', regions: 'Nigeria · Ghana · South Africa · Kenya' },
  { name: 'Stripe', icon: CreditCard, note: 'International cards for verified merchants', regions: 'US · UK · EU & more' },
  { name: 'MTN MoMo Agent', icon: Smartphone, note: 'Mobile money, confirmed straight to your dashboard', regions: 'Nigeria · Ghana · Uganda · Cameroon · Ivory Coast · Benin · Senegal' },
  { name: 'Bank transfer', icon: Building2, note: 'Direct-to-bank payment on every supported store', regions: 'All markets' },
] as const;

const COMING_SOON_METHODS = ['Flutterwave', 'M-Pesa'] as const;

const PAYOUT_TIERS = [
  { level: 1, name: 'New Seller', range: '0–40 pts', payout: '5-day hold', icon: Clock },
  { level: 2, name: 'Verified Seller', range: '41–70 pts', payout: 'Next-day payout', icon: ShieldCheck },
  { level: 3, name: 'Trusted Seller', range: '71–90 pts', payout: 'Same-day payout', icon: BadgeCheck },
  { level: 4, name: 'Elite Seller', range: '91–100 pts', payout: 'Instant payout', icon: Zap },
] as const;

export interface ApiPlanSku {
  key: string;
  billing_label: string | null;
  price: number;
}

export interface ApiPlanGroup {
  key: string;
  name: string;
  tagline: string | null;
  tier_rank: number;
  highlight: boolean;
  benefits: string[];
  plans: ApiPlanSku[];
}

interface PricingPageClientProps {
  plans: ApiPlanGroup[];
}

function formatNaira(value: number): string {
  return Math.round(value).toLocaleString('en-NG');
}

function toDisplayTier(group: ApiPlanGroup) {
  const monthlySku = group.plans.find((p) => p.billing_label === 'Monthly') || group.plans[0];
  const yearlySku = group.plans.find((p) => p.billing_label === 'Yearly') || monthlySku;
  const benefits = group.benefits || [];
  const shortFeatures = benefits.filter((b) => !b.endsWith(':')).slice(0, 4);

  return {
    name: group.name,
    tagline: group.tagline || '',
    monthly: formatNaira(monthlySku?.price || 0),
    yearly: formatNaira(yearlySku?.price || 0),
    highlight: group.highlight,
    features: shortFeatures,
    allBenefits: benefits,
  };
}

export default function PricingPageClient({ plans }: PricingPageClientProps) {
  const [activeTier, setActiveTier] = useState(1);
  const [benefitsModalTier, setBenefitsModalTier] = useState<string | null>(null);
  const tiers = plans.map(toDisplayTier);
  const modalTier = tiers.find((t) => t.name === benefitsModalTier) || null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(72px, 11vw, 120px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Percent size={12} color="var(--accent)" /> <b>Pricing</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Simple plans. <span className="mark-highlight">No transaction fees.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            {tiers.map((t) => t.name).join(', ')} — whichever you pick, you keep 100% of every sale. Upgrading unlocks features, never a cut of your revenue.
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%' }}>
        {/* ── Plan tier cards, overlapping the hero ── */}
        <section style={{ maxWidth: 980, margin: 'clamp(-56px, -6vw, -40px) auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="card"
                style={{
                  padding: 'clamp(24px, 4vw, 32px)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor: tier.highlight ? 'var(--primary)' : undefined,
                  borderWidth: tier.highlight ? 1.5 : undefined,
                }}
              >
                <span className={tier.highlight ? 'badge badge-primary' : 'badge'} style={{ marginBottom: 14, alignSelf: 'center' }}>{tier.name}</span>
                <h2 className="text-title" style={{ marginBottom: 4 }}>
                  ₦{tier.monthly}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/mo</span>
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 12 }}>
                  or ₦{tier.yearly}/year
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20, minHeight: 40 }}>
                  {tier.tagline}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22, textAlign: 'left', flex: 1 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
                      <Check size={14} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setBenefitsModalTier(tier.name)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12.5, fontWeight: 700, color: 'var(--primary)',
                    padding: '4px 0', marginBottom: 14,
                  }}
                >
                  <ListChecks size={13} /> See all benefits
                </button>
                <Link
                  href="/signup"
                  className={tier.highlight ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ padding: '12px 20px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                >
                  {tier.name === 'Free' ? 'Start selling free' : `Go ${tier.name}`} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Payment methods ── */}
        <section className="trust-banner" style={{ padding: 'clamp(48px, 8vw, 72px) 20px', marginTop: 'clamp(56px, 8vw, 88px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="badge" style={{ marginBottom: 12, display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                Get Paid Your Way
              </span>
              <h2 className="text-title" style={{ color: '#fff', marginBottom: 10 }}>
                Never lose a sale to a payment method you don&apos;t support
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
                Cards, bank transfer, and mobile money — wired straight into your storefront checkout.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.name}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 'var(--r-lg)', padding: 20,
                  }}
                >
                  <m.icon size={20} color="var(--accent)" style={{ marginBottom: 12 }} />
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                    {m.name}
                  </p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 10 }}>
                    {m.note}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {m.regions}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 24 }}>
              Coming soon: {COMING_SOON_METHODS.join(' · ')}
            </p>
          </div>
        </section>

        {/* ── Payouts ── */}
        <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>Payouts</span>
              <h2 className="text-title" style={{ marginBottom: 12 }}>Payout speed you can grow into</h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 16 }}>
                Frontstore doesn&apos;t hold your money by country — it holds it by trust score. Every new store starts with a short settlement hold, and every sale, low dispute rate, and clean refund record moves you up.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, color: 'var(--text-2)' }}>
                <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} /> Same payout ladder in every market we support
                </li>
                <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} /> Trust score is visible on your dashboard, so you always know what unlocks the next tier
                </li>
                <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} /> Frontstore Protect orders follow their own milestone-based escrow release, separate from this ladder
                </li>
              </ul>
            </div>

            <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYOUT_TIERS.map((t) => (
                  <button
                    key={t.level}
                    type="button"
                    onClick={() => setActiveTier(t.level)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      borderRadius: 'var(--r-lg)',
                      border: `1.5px solid ${activeTier === t.level ? 'var(--primary)' : 'var(--border)'}`,
                      background: activeTier === t.level ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all var(--t-fast) var(--ease)',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: activeTier === t.level ? 'var(--primary)' : 'var(--surface-2)',
                      color: activeTier === t.level ? '#fff' : 'var(--text-muted)',
                    }}>
                      <t.icon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>
                        Level {t.level} · {t.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.range}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: activeTier === t.level ? 'var(--primary)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                      {t.payout}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ padding: 'clamp(40px, 8vw, 64px) 20px' }}>
          <div className="hero-dark cta-inset" style={{ padding: 'clamp(48px, 9vw, 76px) 20px', textAlign: 'center' }}>
            <div className="hero-blob" style={{ top: '-40%', left: '-10%', width: 320, height: 320, background: 'rgba(255,255,255,0.05)' }} />
            <div className="hero-blob" style={{ bottom: '-45%', right: '-8%', width: 340, height: 340, background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
              <h2 className="text-title" style={{ color: '#fff', marginBottom: 12 }}>
                Ready to start selling on WhatsApp?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
                Simple plans, no transaction fees, no surprises at settlement. Free to start — no credit card needed.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                <Link
                  href="/signup"
                  className="btn"
                  style={{
                    background: '#fff', color: 'var(--primary-dark)',
                    padding: '15px 28px', fontSize: 15, borderRadius: 'var(--r-xl)',
                    fontFamily: 'var(--font-heading)', fontWeight: 800,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                  }}
                >
                  Create Your Free Store <ArrowRight size={16} />
                </Link>
                <Link
                  href="/demo"
                  className="btn"
                  style={{
                    padding: '15px 28px', fontSize: 15, borderRadius: 'var(--r-xl)',
                    background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  See a live demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />

      {modalTier && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${modalTier.name} plan benefits`}
          onClick={() => setBenefitsModalTier(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440, width: '100%', maxHeight: '85vh', overflowY: 'auto',
              padding: 'clamp(24px, 4vw, 32px)', position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setBenefitsModalTier(null)}
              aria-label="Close"
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'var(--surface-2)', border: 'none', borderRadius: 'var(--r-full)',
                width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <X size={16} />
            </button>

            <span className={modalTier.highlight ? 'badge badge-primary' : 'badge'} style={{ marginBottom: 12 }}>
              {modalTier.name}
            </span>
            <h2 className="text-title" style={{ marginBottom: 4 }}>
              ₦{modalTier.monthly}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/mo</span>
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 16 }}>
              or ₦{modalTier.yearly}/year — {modalTier.tagline}
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              {modalTier.allBenefits.map((b) => {
                const isHeading = b.endsWith(':');
                return (
                  <li
                    key={b}
                    style={{
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                      fontSize: isHeading ? 12 : 13.5,
                      fontWeight: isHeading ? 800 : 400,
                      textTransform: isHeading ? 'uppercase' : 'none',
                      letterSpacing: isHeading ? '0.03em' : 'normal',
                      color: isHeading ? 'var(--text-muted)' : 'var(--text-2)',
                      marginTop: isHeading ? 4 : 0,
                    }}
                  >
                    {!isHeading && <Check size={14} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />}
                    {b}
                  </li>
                );
              })}
            </ul>

            <Link
              href="/signup"
              className={modalTier.highlight ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '12px 20px', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%' }}
            >
              {modalTier.name === 'Free' ? 'Start selling free' : `Go ${modalTier.name}`} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
