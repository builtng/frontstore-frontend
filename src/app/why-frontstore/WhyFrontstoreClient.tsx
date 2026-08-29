'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  FileText,
  Users2,
  Calculator,
  ChevronDown,
  Store,
  ArrowUpRight,
  ShoppingCart,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

// ----------------------------------------------------------------------
// DATA & CONTENT (GROUNDED, DIRECT, HUMAN)
// ----------------------------------------------------------------------

const COMPARISON_POINTS = [
  {
    title: 'Answering "How much?" in DMs',
    oldWay: 'Typing out prices, color options, stock availability, and bank details individually for every customer chat.',
    frontstoreWay: 'Send one link: frontstore.ng/yourname. Customers browse live stock, select options, and submit structured orders.',
    benefit: 'Save 2+ hours daily',
  },
  {
    title: 'Verifying Customer Payments',
    oldWay: 'Waiting for bank SMS alerts, cross-checking customer transfer screenshots, and risking fake transfer scams.',
    frontstoreWay: 'Automated bank reconciliation via Paystack. Orders update to paid only when money hits your account.',
    benefit: 'Zero transfer fraud',
  },
  {
    title: 'Keeping Track of Sales & Stock',
    oldWay: 'Jotting orders in physical notebooks or trying to update spreadsheets on your phone at the end of the day.',
    frontstoreWay: 'Every sale automatically updates stock counts, customer profiles, and daily revenue reports in real time.',
    benefit: 'Automatic bookkeeping',
  },
  {
    title: 'Sending Receipts & Invoices',
    oldWay: 'Writing paper receipts or sending unformatted text messages with no business branding.',
    frontstoreWay: 'Professional PDF invoices and digital receipts generated instantly and shareable on WhatsApp.',
    benefit: 'Instant professional proof',
  },
  {
    title: 'Hiring & Managing Staff',
    oldWay: 'Sharing personal bank accounts or WhatsApp logins with staff, taking full financial risk yourself.',
    frontstoreWay: 'Assign staff accounts with granular roles so team members fulfill orders without seeing bank payouts.',
    benefit: 'Safe delegation',
  },
];

const FEATURES = [
  {
    id: 'storefront',
    name: 'WhatsApp Storefront',
    icon: MessageSquare,
    headline: 'Let customers order in seconds, directly to WhatsApp.',
    description:
      'Your customers browse your items on a clean, fast mobile site. When they check out, their cart turns into a structured WhatsApp message ready for you to confirm.',
    points: [
      'No customer account creation required',
      'Instant item options (sizes, colors, add-ons)',
      'Works seamlessly on Instagram bio links and WhatsApp status',
    ],
  },
  {
    id: 'catalog',
    name: 'Quick Catalog & AI Assistant',
    icon: Sparkles,
    headline: 'Upload products straight from your phone camera.',
    description:
      'Snap pictures of your items and let Frontstore fill in titles, product descriptions, and category tags automatically.',
    points: [
      'Publish new inventory in seconds',
      'Auto-generated product titles & copy',
      'Organize into clean collections',
    ],
  },
  {
    id: 'bookkeeping',
    name: 'Automatic Sales Ledger',
    icon: FileText,
    headline: 'Know your revenue, expenses, and net profit daily.',
    description:
      'Every order logs automatically. Track your sales trends, top-performing items, and download financial reports whenever you need them.',
    points: [
      'Daily, weekly, and monthly sales summaries',
      'Track paid vs unpaid customer orders',
      'Export audit-ready reports in PDF or CSV',
    ],
  },
  {
    id: 'payments',
    name: 'Direct Bank Settlement',
    icon: ShieldCheck,
    headline: 'Collect payments via Transfer, Cards, or USSD.',
    description:
      'Accept payments with Paystack integration. Payments are verified automatically and settled directly into your Nigerian bank account.',
    points: [
      'Automated reconciliation against every order',
      'No manual screenshot checking required',
      'Support for Cards, Bank Transfers, and USSD',
    ],
  },
  {
    id: 'team',
    name: 'Staff & Team Roles',
    icon: Users2,
    headline: 'Delegate order fulfillment safely.',
    description:
      'Give your sales reps or store managers their own login details with restricted access to protect sensitive financial records.',
    points: [
      'Custom permissions for sales vs admin staff',
      'Full audit trail of team actions',
      'Add team members as your business expands',
    ],
  },
];

const COMPARISON_TABLE = [
  { feature: 'Setup Time', frontstore: '2 minutes', instagram: 'Hours of chatting', shopify: '3–7 days', excel: 'Manual entry' },
  { feature: 'WhatsApp Cart Checkout', frontstore: true, instagram: false, shopify: false, excel: false },
  { feature: 'Auto Payment Verification', frontstore: true, instagram: false, shopify: true, excel: false },
  { feature: 'Automatic Bookkeeping', frontstore: true, instagram: false, shopify: 'Needs plugins', excel: 'Manual typing' },
  { feature: 'Mobile-First Dashboard', frontstore: true, instagram: true, shopify: 'Complex desktop UI', excel: 'Clunky on phone' },
  { feature: 'Monthly Cost', frontstore: 'Free / ₦2,000 / ₦7,000', instagram: 'Free (costs time)', shopify: '$39+/month', excel: 'Free' },
];

const FAQS = [
  {
    q: 'How does Frontstore work for WhatsApp sellers?',
    a: 'You get a simple web storefront link (e.g. frontstore.ng/yourbrand). You put this link in your Instagram bio, TikTok, or WhatsApp status. Customers open it, pick what they want, and send a pre-formatted order directly to your WhatsApp chat or pay online.',
  },
  {
    q: 'Do I need a laptop to run my store?',
    a: 'No. Frontstore is built mobile-first. You can manage products, view sales, track inventory, and send invoices entirely from your phone.',
  },
  {
    q: 'How do I receive payments?',
    a: 'Frontstore integrates with Paystack. Customers can pay using Bank Transfer, Card, USSD, or Apple Pay. Verified funds are deposited directly into your bank account.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. Frontstore has a free tier that lets you set up your store and start taking orders right away. You can upgrade whenever you need team logins or advanced features.',
  },
  {
    q: 'Can I connect a custom domain like mybrand.com?',
    a: 'Yes, on Pro and Business plans you can point your custom domain directly to your Frontstore.',
  },
];

const SIMILAR_RESOURCES = [
  {
    title: 'Platform Comparisons',
    desc: 'See how Frontstore compares to Bumpa, Selar, Catlog, and Shopify side by side.',
    href: '/vs',
    icon: Layers,
  },
  {
    title: 'Frontstore vs Shopify',
    desc: 'Why social sellers in Africa prefer Frontstore over complex e-commerce setups.',
    href: '/vs/shopify',
    icon: ShoppingCart,
  },
  {
    title: 'Online Storefront Features',
    desc: 'Explore all capabilities of our mobile storefront builder.',
    href: '/online-store',
    icon: Store,
  },
  {
    title: 'Record Keeping System',
    desc: 'Learn how automated bookkeeping replaces physical notebooks.',
    href: '/record-keeping',
    icon: FileText,
  },
];

// ----------------------------------------------------------------------
// MAIN CLIENT COMPONENT
// ----------------------------------------------------------------------

export default function WhyFrontstoreClient() {
  const [weeklyOrders, setWeeklyOrders] = useState<number>(20);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(15000);
  const [selectedFeature, setSelectedFeature] = useState<string>('storefront');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [claimName, setClaimName] = useState<string>('');

  // Grounded calculations
  const hoursSavedPerMonth = Math.round((weeklyOrders * 4 * 10) / 60); // 10 mins saved per order
  const monthlyRevenue = weeklyOrders * 4 * avgOrderValue;

  const activeFeatureObj = FEATURES.find((f) => f.id === selectedFeature) || FEATURES[0];

  return (
    <div style={{ background: '#0B0F19', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <PublicSiteNav />

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: 900,
            margin: '0 auto 20px',
          }}
        >
          Why sellers run their business on <span style={{ color: '#10B981' }}>Frontstore</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: '#9CA3AF',
            maxWidth: 720,
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Stop typing prices in DMs, verifying bank screenshots manually, and writing sales in paper notebooks. Frontstore gives you a clear storefront link, automatic bank reconciliation, and real-time sales records.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <Link
            href="/signup"
            style={{
              background: '#0B5D39',
              color: '#FFF',
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Start for free <ArrowRight size={18} />
          </Link>

          <a
            href="#comparison"
            style={{
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#FFF',
            }}
          >
            See how it works
          </a>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13.5, color: '#9CA3AF' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10B981" /> Ready in 2 minutes
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10B981" /> No coding needed
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10B981" /> Paystack bank payouts
          </span>
        </div>
      </section>

      {/* Section 2: Comparison (Old Way vs Frontstore) */}
      <section id="comparison" style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 800, color: '#10B981', letterSpacing: '0.08em', marginBottom: 8 }}>
          The Difference
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 32 }}>
          What changes when you switch to Frontstore
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {COMPARISON_POINTS.map((item, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0 }}>{item.title}</h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: 6 }}>
                  {item.benefit}
                </span>
              </div>

              {/* Old Way */}
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F87171', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <X size={14} /> Manual Process
                </div>
                <p style={{ fontSize: 14, color: '#D1D5DB', margin: 0, lineHeight: 1.5 }}>{item.oldWay}</p>
              </div>

              {/* Frontstore Way */}
              <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34D399', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} /> Frontstore
                </div>
                <p style={{ fontSize: 14, color: '#FFFFFF', margin: 0, lineHeight: 1.5 }}>{item.frontstoreWay}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Feature Deep-Dive */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 800, color: '#3B82F6', letterSpacing: '0.08em', marginBottom: 8 }}>
          Capabilities
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 32 }}>
          Everything built into your account
        </h2>

        {/* Feature Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedFeature === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFeature(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#FFF' : '#9CA3AF',
                }}
              >
                <Icon size={16} color={isSelected ? '#10B981' : '#9CA3AF'} />
                {f.name}
              </button>
            );
          })}
        </div>

        {/* Selected Feature Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: 32,
          }}
        >
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#FFF' }}>
            {activeFeatureObj.headline}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: 15, lineHeight: 1.6, maxWidth: 700, marginBottom: 24 }}>
            {activeFeatureObj.description}
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, margin: 0, listStyle: 'none' }}>
            {activeFeatureObj.points.map((pt, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#E5E7EB' }}>
                <Check size={16} color="#10B981" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 4: Practical Estimator */}
      <section
        style={{
          padding: '70px 24px',
          background: 'rgba(255, 255, 255, 0.015)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800 }}>
              Estimate time saved each month
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 15 }}>
              Based on an average savings of 10 minutes per customer transaction.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 32,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: 32,
            }}
          >
            <div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#E5E7EB' }}>
                  Orders per week: <span style={{ color: '#10B981', fontWeight: 700 }}>{weeklyOrders}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={weeklyOrders}
                  onChange={(e) => setWeeklyOrders(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10B981' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#E5E7EB' }}>
                  Average order value: <span style={{ color: '#34D399', fontWeight: 700 }}>₦{avgOrderValue.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="3000"
                  max="80000"
                  step="1000"
                  value={avgOrderValue}
                  onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#34D399' }}
                />
              </div>
            </div>

            <div
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>Estimated time saved:</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#34D399', marginBottom: 12 }}>
                {hoursSavedPerMonth} Hours / Month
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>
                Estimated monthly sales throughput: <span style={{ color: '#FFF', fontWeight: 700 }}>₦{monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Comparison Matrix */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>
          Platform comparison
        </h2>

        <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 640 }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: '#FFF' }}>Feature</th>
                <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 800, color: '#10B981' }}>Frontstore</th>
                <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#9CA3AF' }}>Instagram DMs</th>
                <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#9CA3AF' }}>Shopify</th>
                <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#9CA3AF' }}>Excel / Notes</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_TABLE.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#E5E7EB' }}>{r.feature}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#FFF' }}>
                    {typeof r.frontstore === 'boolean' ? (r.frontstore ? <Check size={16} color="#34D399" /> : <X size={16} color="#F87171" />) : r.frontstore}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#9CA3AF' }}>
                    {typeof r.instagram === 'boolean' ? (r.instagram ? <Check size={16} color="#34D399" /> : <X size={16} color="#F87171" />) : r.instagram}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#9CA3AF' }}>
                    {typeof r.shopify === 'boolean' ? (r.shopify ? <Check size={16} color="#34D399" /> : <X size={16} color="#F87171" />) : r.shopify}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#9CA3AF' }}>
                    {typeof r.excel === 'boolean' ? (r.excel ? <Check size={16} color="#34D399" /> : <X size={16} color="#F87171" />) : r.excel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: FAQ */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 850, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>
          Frequently asked questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFF',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} color="#9CA3AF" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 7: Similar Pages */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#FFF' }}>
          Explore related guides & tools
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {SIMILAR_RESOURCES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: 20,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: 12 }}>
                    <Icon size={18} />
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#FFF', marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: '#10B981', marginTop: 16 }}>
                  Learn more <ArrowUpRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section 8: Store Claim CTA */}
      <section style={{ padding: '0 24px 90px', maxWidth: 1000, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)',
            borderRadius: 20,
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: '#FFF', marginBottom: 12 }}>
            Start selling on Frontstore today
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16, maxWidth: 550, margin: '0 auto 28px' }}>
            Set up your storefront in under 2 minutes. Free forever tier available.
          </p>

          <div style={{ maxWidth: 460, margin: '0 auto', display: 'flex', background: '#FFF', borderRadius: 12, padding: 4, gap: 4, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>
              frontstore.ng/
            </span>
            <input
              type="text"
              placeholder="your-store-name"
              value={claimName}
              onChange={(e) => setClaimName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14.5,
                fontWeight: 600,
                color: '#111827',
                padding: '10px 6px',
                minWidth: 120,
              }}
            />
            <Link
              href={`/signup?username=${encodeURIComponent(claimName)}`}
              style={{
                background: '#0B0F19',
                color: '#FFF',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Create store
            </Link>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </div>
  );
}
