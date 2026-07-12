'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Check, CreditCard, Building2, Smartphone,
  ShieldCheck, Clock, Zap, Percent, BadgeCheck,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

const CURRENCIES = [
  { code: 'NGN', country: 'Nigeria', flag: '🇳🇬' },
  { code: 'GHS', country: 'Ghana', flag: '🇬🇭' },
  { code: 'KES', country: 'Kenya', flag: '🇰🇪' },
  { code: 'ZAR', country: 'South Africa', flag: '🇿🇦' },
  { code: 'EGP', country: 'Egypt', flag: '🇪🇬' },
  { code: 'RWF', country: 'Rwanda', flag: '🇷🇼' },
  { code: 'TZS', country: 'Tanzania', flag: '🇹🇿' },
  { code: 'UGX', country: 'Uganda', flag: '🇺🇬' },
  { code: 'ZMW', country: 'Zambia', flag: '🇿🇲' },
  { code: 'XOF', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'XOF', country: 'Senegal', flag: '🇸🇳' },
  { code: 'XOF', country: 'Benin', flag: '🇧🇯' },
  { code: 'USD', country: 'United States', flag: '🇺🇸' },
  { code: 'GBP', country: 'United Kingdom', flag: '🇬🇧' },
] as const;

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

interface PricingPageClientProps {
  monthlyPrice: string;
  yearlyPrice: string;
  legendMonthlyPrice: string;
  legendYearlyPrice: string;
}

const PLAN_TIERS = (monthlyPrice: string, yearlyPrice: string, legendMonthlyPrice: string, legendYearlyPrice: string) => [
  {
    name: 'Free',
    tagline: 'Start selling with no monthly cost.',
    monthly: '0',
    yearly: '0',
    highlight: false,
    features: ['Up to 40 products', 'WhatsApp checkout', 'Public storefront', 'Flat 1.5% transaction fee'],
  },
  {
    name: 'Pro',
    tagline: 'Unlimited products, AI listings, and branding.',
    monthly: monthlyPrice,
    yearly: yearlyPrice,
    highlight: true,
    features: ['Unlimited products', 'AI photo-to-listing', 'Custom storefront branding', 'Flat 1.5% transaction fee'],
  },
  {
    name: 'Legend',
    tagline: 'Everything in Pro, with unlimited AI and a status badge.',
    monthly: legendMonthlyPrice,
    yearly: legendYearlyPrice,
    highlight: false,
    features: ['Everything in Pro', 'Unlimited AI analyses on any billing cycle', 'Legend storefront badge', 'Flat 1.5% transaction fee'],
  },
];

export default function PricingPageClient({ monthlyPrice, yearlyPrice, legendMonthlyPrice, legendYearlyPrice }: PricingPageClientProps) {
  const [activeCurrency, setActiveCurrency] = useState(0);
  const [activeTier, setActiveTier] = useState(1);
  const tiers = PLAN_TIERS(monthlyPrice, yearlyPrice, legendMonthlyPrice, legendYearlyPrice);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(72px, 11vw, 120px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Percent size={12} color="var(--accent)" /> <b>Pricing & Fees</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Three simple plans. <span className="mark-highlight">One fee that never changes.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Free, Pro, or Legend — whichever you pick, the transaction fee on every sale stays a flat 1.5%. Upgrading unlocks features, never a lower fee held hostage behind a higher tier.
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

        {/* ── Transaction fees ── */}
        <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px 0' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>Transaction Fees</span>
              <h2 className="text-title" style={{ marginBottom: 10 }}>About our transaction fees</h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
                Every plan carries the same small transaction fee when you make a successful sale, regardless of which of these currencies you sell in.
              </p>
            </div>

            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {CURRENCIES.map((c, i) => (
                  <button
                    key={`${c.code}-${c.country}`}
                    type="button"
                    onClick={() => setActiveCurrency(i)}
                    className="btn"
                    title={c.country}
                    aria-label={c.country}
                    style={{
                      padding: '8px 14px',
                      fontSize: 13,
                      borderRadius: 'var(--r-md)',
                      background: activeCurrency === i ? 'var(--primary)' : 'var(--surface-2)',
                      color: activeCurrency === i ? '#fff' : 'var(--text-2)',
                      boxShadow: 'none',
                    }}
                  >
                    <span>{c.flag}</span> {c.code}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{
                maxWidth: 380, margin: '0 auto', padding: 'clamp(28px, 5vw, 36px)', textAlign: 'center',
                borderColor: 'var(--primary)', borderWidth: 1.5,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                Standard rate
              </p>
              <p className="text-display" style={{ fontSize: 'clamp(32px, 5vw, 40px)', color: 'var(--primary)', marginBottom: 6 }}>
                1.5%
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                per sale in {CURRENCIES[activeCurrency].code} — no fixed fee added on top
              </p>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-faint)', textAlign: 'center', maxWidth: 480, margin: '20px auto 0', lineHeight: 1.6 }}>
              This is separate from the optional Frontstore Protect buyer-protection fee, which customers can choose to cover at checkout.
            </p>
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
                Three simple plans, one transparent fee that never changes by tier, no surprises at settlement. Free to start — no credit card needed.
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
    </div>
  );
}
