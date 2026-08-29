import React from 'react';
import type { Metadata } from 'next';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';
import {
  CreditCard, Shield, Lock, Globe, ArrowRight, Zap, CheckCircle2,
  Smartphone, Building2, RefreshCw, TrendingUp, Users, Clock,
  Star, BadgeCheck, Banknote, BarChart3, ChevronRight, Wallet,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Global Payments — Frontstore Pay',
  description: 'Accept local cards, bank transfers, mobile money, and international payments. Frontstore Pay settles funds instantly to your verified bank account with zero hassle.',
};

/* ─── Static data ─────────────────────────────────────────────────────────── */

const PAYMENT_METHODS = [
  {
    name: 'Paystack',
    tag: 'Most popular in Africa',
    desc: 'Cards, dedicated virtual accounts & instant bank transfer. The preferred rails for Nigeria, Ghana, South Africa & Kenya.',
    regions: ['Nigeria', 'Ghana', 'South Africa', 'Kenya'],
    color: '#00C3F7',
    bg: 'rgba(0,195,247,0.08)',
    border: 'rgba(0,195,247,0.2)',
    icon: CreditCard,
    live: true,
  },
  {
    name: 'Stripe',
    tag: 'International checkout',
    desc: 'Accept Visa, Mastercard, and AMEX from global buyers. Perfect for creators selling digital products worldwide.',
    regions: ['US', 'UK', 'EU', 'Global'],
    color: '#635BFF',
    bg: 'rgba(99,91,255,0.08)',
    border: 'rgba(99,91,255,0.2)',
    icon: CreditCard,
    live: true,
  },
  {
    name: 'MTN MoMo',
    tag: 'Mobile money',
    desc: 'WhatsApp-native mobile money collection confirmed straight to your Frontstore dashboard. No banking required.',
    regions: ['Nigeria', 'Ghana', 'Uganda', 'Cameroon', 'Ivory Coast', 'Senegal'],
    color: '#FFCC00',
    bg: 'rgba(255,204,0,0.08)',
    border: 'rgba(255,204,0,0.2)',
    icon: Smartphone,
    live: true,
  },
  {
    name: 'Bank Transfer',
    tag: 'Direct to bank',
    desc: 'Automated dynamic virtual accounts so customers transfer directly. Verified & matched in real-time — no manual confirmation.',
    regions: ['All markets'],
    color: '#34D399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
    icon: Building2,
    live: true,
  },
  {
    name: 'Flutterwave',
    tag: 'Coming soon',
    desc: 'Pan-African payment infrastructure covering 34+ African countries. Integration in progress.',
    regions: ['34+ African markets'],
    color: '#FF5733',
    bg: 'rgba(255,87,51,0.06)',
    border: 'rgba(255,87,51,0.15)',
    icon: Globe,
    live: false,
  },
  {
    name: 'M-Pesa',
    tag: 'Coming soon',
    desc: 'East Africa\'s dominant mobile payment network with 50M+ active users across Kenya, Tanzania, and beyond.',
    regions: ['Kenya', 'Tanzania', 'DRC', 'Ethiopia'],
    color: '#4CAF50',
    bg: 'rgba(76,175,80,0.06)',
    border: 'rgba(76,175,80,0.15)',
    icon: Smartphone,
    live: false,
  },
];

const STATS = [
  { value: '₦0', label: 'Setup fee', sub: 'Free forever' },
  { value: '<2s', label: 'Payment confirmation', sub: 'Real-time verification' },
  { value: '6+', label: 'Payment methods', sub: 'And growing' },
  { value: '99.9%', label: 'Uptime SLA', sub: 'Bank-grade reliability' },
];

const CURRENCIES = [
  { code: 'NGN', flag: '🇳🇬', name: 'Nigerian Naira' },
  { code: 'GHS', flag: '🇬🇭', name: 'Ghanaian Cedi' },
  { code: 'KES', flag: '🇰🇪', name: 'Kenyan Shilling' },
  { code: 'ZAR', flag: '🇿🇦', name: 'South African Rand' },
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'UGX', flag: '🇺🇬', name: 'Ugandan Shilling' },
];

const FEATURES = [
  {
    icon: Zap,
    color: '#FFCC00',
    bg: 'rgba(255,204,0,0.1)',
    title: 'Instant Settlement',
    desc: 'Payments land in your verified bank account automatically — no manual withdrawal requests, no 48-hour waits.',
  },
  {
    icon: RefreshCw,
    color: '#00C3F7',
    bg: 'rgba(0,195,247,0.1)',
    title: 'Automated Reconciliation',
    desc: 'Every order, payment, and refund is matched automatically. Your dashboard stays clean without a single spreadsheet.',
  },
  {
    icon: Shield,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.1)',
    title: 'PCI-DSS Level 1',
    desc: 'Bank-grade encryption and compliance across all transaction types. Fraud detection runs 24/7 in the background.',
  },
  {
    icon: Globe,
    color: '#635BFF',
    bg: 'rgba(99,91,255,0.1)',
    title: 'Multi-Currency Display',
    desc: 'Show prices in your buyer\'s local currency while receiving payouts in your preferred settlement currency.',
  },
  {
    icon: Lock,
    color: '#FF9F43',
    bg: 'rgba(255,159,67,0.1)',
    title: 'Escrow Protection',
    desc: 'Funds are held securely until delivery is confirmed — building the trust that keeps African buyers coming back.',
  },
  {
    icon: BarChart3,
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.1)',
    title: 'Revenue Analytics',
    desc: 'Real-time dashboards showing GMV, conversion rates, failed payments, and payout history in one view.',
  },
];

const SECURITY_POINTS = [
  'PCI-DSS Level 1 Certified',
  'End-to-End TLS Encryption',
  '3D Secure Card Authentication',
  'Real-Time Fraud Detection',
  'Automatic Chargeback Defence',
  'NDPR & GDPR Data Compliance',
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function PaymentsPage() {
  return (
    <>
      <style>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        .pay-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(52,211,153,0.12);
          border: 1px solid rgba(52,211,153,0.3);
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #34D399;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          animation: slide-in-up 0.5s ease both;
        }
        .pay-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .pay-stat-card:hover {
          border-color: rgba(52,211,153,0.3);
          background: rgba(52,211,153,0.04);
        }
        .pay-method-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          transition: transform 0.25s ease, border-color 0.25s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }
        .pay-method-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .pay-feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 28px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .pay-feature-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.15);
        }
        .pay-currency-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #E5E7EB;
          transition: background 0.2s, border-color 0.2s;
          cursor: default;
        }
        .pay-currency-pill:hover {
          background: rgba(52,211,153,0.1);
          border-color: rgba(52,211,153,0.3);
          color: #34D399;
        }
        .pay-live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #34D399;
          position: relative;
        }
        .pay-live-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid rgba(52,211,153,0.4);
          animation: pulse-ring 2s ease-out infinite;
        }
        .pay-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #0B5D39;
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          padding: 15px 34px;
          border-radius: 14px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(11,93,57,0.35);
        }
        .pay-cta-btn:hover {
          background: #094E30;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(11,93,57,0.45);
        }
        .pay-outline-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #E5E7EB;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 28px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.18);
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .pay-outline-btn:hover {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #34D399;
          margin-bottom: 16px;
        }
      `}</style>

      <div style={{ background: '#020C1B', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        <PublicSiteNav />

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 80px', textAlign: 'center' }}>
          {/* Background orbs */}
          <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(11,93,57,0.25) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="orb" style={{ width: 300, height: 300, background: 'rgba(99,91,255,0.12)', top: '10%', right: '-5%' }} />
          <div className="orb" style={{ width: 250, height: 250, background: 'rgba(0,195,247,0.08)', bottom: '0', left: '-5%' }} />

          <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
            <span className="pay-hero-badge">
              <span className="pay-live-dot" />
              Frontstore Pay — Global Payments Engine
            </span>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginTop: 24,
              marginBottom: 24,
            }}>
              Every way your customer
              <br />
              <span style={{ background: 'linear-gradient(135deg, #34D399 0%, #00C3F7 50%, #635BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                wants to pay
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#9CA3AF', maxWidth: 680, margin: '0 auto 48px', lineHeight: 1.65 }}>
              Cards, bank transfer, mobile money, and international cards — all inside your WhatsApp chat.
              Frontstore Pay handles the money so you can focus on the hustle.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/signup" className="pay-cta-btn">
                Start Accepting Payments <ArrowRight size={18} />
              </a>
              <a href="/pricing" className="pay-outline-btn">
                View Transaction Fees
              </a>
            </div>

            {/* Floating payment method logos strip */}
            <div style={{
              marginTop: 56,
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'Paystack', color: '#00C3F7' },
                { label: 'Stripe', color: '#635BFF' },
                { label: 'MTN MoMo', color: '#FFCC00' },
                { label: 'Bank Transfer', color: '#34D399' },
                { label: 'Flutterwave', color: '#FF5733' },
                { label: 'M-Pesa', color: '#4CAF50' },
              ].map((m) => (
                <span key={m.label} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#D1D5DB',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block', flexShrink: 0 }} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {STATS.map((s) => (
              <div key={s.label} className="pay-stat-card">
                <div style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E5E7EB', marginTop: 6 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Payment Methods ────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <div className="section-label"><Wallet size={13} /> Payment Methods</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>
              Built for how Africa pays
            </h2>
            <p style={{ color: '#9CA3AF', maxWidth: 560, margin: '0 auto', lineHeight: 1.6, fontSize: 16 }}>
              From Lagos street markets to Nairobi cloud kitchens — your customers can pay the way they feel comfortable.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20 }}>
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.name}
                  className="pay-method-card"
                  style={{
                    borderColor: method.live ? method.border : 'rgba(255,255,255,0.06)',
                    opacity: method.live ? 1 : 0.65,
                  }}
                >
                  {/* Top glow accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: method.live
                      ? `linear-gradient(90deg, transparent, ${method.color}, transparent)`
                      : 'transparent',
                    borderRadius: '20px 20px 0 0',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: method.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: method.color,
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '4px 10px', borderRadius: 999,
                      background: method.live ? `rgba(52,211,153,0.1)` : 'rgba(255,255,255,0.06)',
                      color: method.live ? '#34D399' : '#6B7280',
                      border: method.live ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                      {method.live ? '● Live' : '◌ Soon'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: '#FFFFFF' }}>{method.name}</h3>
                  <p style={{ fontSize: 13, color: '#EF940F', fontWeight: 700, marginBottom: 12 }}>{method.tag}</p>
                  <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 20 }}>{method.desc}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {method.regions.map((r) => (
                      <span key={r} style={{
                        fontSize: 11, fontWeight: 600,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 999,
                        padding: '3px 10px',
                        color: '#9CA3AF',
                      }}>{r}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 48, textAlign: 'center' }}>
              <div className="section-label"><Zap size={13} /> Features</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>
                Payments that just work
              </h2>
              <p style={{ color: '#9CA3AF', maxWidth: 540, margin: '0 auto', lineHeight: 1.6, fontSize: 16 }}>
                We handle every edge case so you never have to chase a payment again.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="pay-feature-card">
                    <div style={{
                      width: 48, height: 48, borderRadius: 13,
                      background: f.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: f.color,
                      marginBottom: 20,
                    }}>
                      <Icon size={22} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: '#FFFFFF' }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Currency Coverage ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="section-label"><Globe size={13} /> Currency Coverage</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 18 }}>
                Sell local.
                <br />
                <span style={{ background: 'linear-gradient(135deg, #34D399, #00C3F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Receive global.
                </span>
              </h2>
              <p style={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: 16, marginBottom: 32 }}>
                Display prices in any currency your buyer recognises while receiving your payouts in your preferred settlement currency. 
                One store, every market.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Automatic real-time exchange rate display',
                  'NGN, GHS, KES, ZAR, USD, GBP & EUR',
                  'Localised payment methods per region',
                  'Payout in your preferred settlement currency',
                ].map((pt) => (
                  <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle2 size={18} style={{ color: '#34D399', marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: '#D1D5DB', lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {CURRENCIES.map((c) => (
                  <span key={c.code} className="pay-currency-pill">
                    <span style={{ fontSize: 18 }}>{c.flag}</span>
                    <strong style={{ color: '#FFFFFF' }}>{c.code}</strong>
                    <span style={{ color: '#6B7280', fontSize: 12 }}>{c.name}</span>
                  </span>
                ))}
              </div>
              <div style={{
                marginTop: 24,
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 16,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <TrendingUp size={22} style={{ color: '#34D399', flexShrink: 0 }} />
                <p style={{ fontSize: 13.5, color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: '#34D399' }}>More currencies coming.</strong> We're adding support for XOF (CFA Franc), EGP, and MAD in 2025.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Security Trust Section ────────────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
              {/* Security checklist */}
              <div>
                <div className="section-label"><Shield size={13} /> Security & Trust</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 18 }}>
                  Your money is safe.
                  <br />
                  <span style={{ color: '#9CA3AF', fontWeight: 500, fontSize: '0.75em' }}>Always.</span>
                </h2>
                <p style={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: 16, marginBottom: 32 }}>
                  We've implemented the highest standards of payment security so every transaction is protected — from click to confirmation.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SECURITY_POINTS.map((pt) => (
                    <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                      <BadgeCheck size={16} style={{ color: '#34D399', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#D1D5DB', fontWeight: 600 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escrow flow visual */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: 'rgba(11,93,57,0.08)',
                  border: '1px solid rgba(11,93,57,0.25)',
                  borderRadius: 24,
                  padding: 32,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#34D399', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
                    How escrow works
                  </p>
                  {[
                    { step: '01', title: 'Customer pays', desc: 'Funds are instantly captured by Frontstore Pay.' },
                    { step: '02', title: 'Order fulfilled', desc: 'Merchant ships or delivers the product.' },
                    { step: '03', title: 'Buyer confirms', desc: 'Customer confirms delivery via WhatsApp.' },
                    { step: '04', title: 'You get paid', desc: 'Funds settle to your bank account automatically.' },
                  ].map((item, i, arr) => (
                    <div key={item.step} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 24 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 900, color: '#34D399',
                        }}>
                          {item.step}
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{ flex: 1, width: 1, background: 'rgba(52,211,153,0.2)', marginTop: 6, minHeight: 28 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < arr.length - 1 ? 0 : 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{item.title}</p>
                        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof ──────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label"><Star size={13} /> Merchant Stories</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.025em' }}>
              Merchants love how easy it is
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                quote: "Before Frontstore, I was manually checking my bank app after every single order. Now payments confirm themselves and I get a notification. It's like having a cashier I never have to pay.",
                name: 'Adaeze O.',
                role: 'Fashion seller · Lagos',
                stars: 5,
              },
              {
                quote: "My international customers kept dropping off when I shared my bank details. With Stripe connected through Frontstore, they just pay with their card right inside WhatsApp. My conversion rate doubled.",
                name: 'Tobi A.',
                role: 'Digital creator · Johannesburg',
                stars: 5,
              },
              {
                quote: "MoMo payments used to be a nightmare to track. Now everything hits my dashboard in real-time. I can see exactly who paid and for which order. Game changer for my catering business.",
                name: 'Ama K.',
                role: 'Cloud kitchen · Accra',
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: 28,
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} fill="#EF940F" style={{ color: '#EF940F' }} />
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: '#D1D5DB', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 2 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 100px' }}>
          <div style={{
            maxWidth: 1100,
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(11,93,57,0.3) 0%, rgba(99,91,255,0.15) 100%)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 28,
            padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="orb" style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(11,93,57,0.3) 0%, transparent 70%)', top: '-100px', left: '-80px' }} />
            <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,91,255,0.2) 0%, transparent 70%)', bottom: '-80px', right: '-60px' }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 800,
                color: '#34D399', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24,
              }}>
                <Banknote size={14} /> No setup fee. No monthly payment lock-in.
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 18, lineHeight: 1.15 }}>
                Ready to get paid
                <br />without the back-and-forth?
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.65 }}>
                Set up Frontstore Pay in under 5 minutes. Connect your bank account, choose your payment methods, and start collecting money from your very first customer.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/signup" className="pay-cta-btn">
                  Start Selling Free <ArrowRight size={18} />
                </a>
                <a href="/pricing" className="pay-outline-btn">
                  See Transaction Fees <ChevronRight size={16} />
                </a>
              </div>

              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
                {['No credit card required', 'Free plan available', 'Cancel anytime'].map((item) => (
                  <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                    <CheckCircle2 size={14} style={{ color: '#34D399' }} /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PublicSiteFooter />
      </div>
    </>
  );
}
