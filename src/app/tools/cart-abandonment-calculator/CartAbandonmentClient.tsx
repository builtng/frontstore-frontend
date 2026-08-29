'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Lock,
  Download,
  MessageSquare,
  ChevronRight,
  Flame,
  BarChart3,
  RefreshCw,
  Zap,
  Percent,
  Mail,
  Smartphone
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'sonner';

export default function CartAbandonmentClient() {
  // Calculator Inputs
  const [calcVisitors, setCalcVisitors] = useState<number>(3500);
  const [calcAov, setCalcAov] = useState<number>(18500);
  const [calcAbandonmentRate, setCalcAbandonmentRate] = useState<number>(72);
  const [calcChannel, setCalcChannel] = useState<string>('WhatsApp & Automated DMs');

  // Lead Collection Modal & State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // Form Lead Inputs
  const [leadName, setLeadName] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [storePlatform, setStorePlatform] = useState<string>('WhatsApp Store');
  const [monthlyRevenueBand, setMonthlyRevenueBand] = useState<string>('₦500k - ₦2m / month');

  // Math Computations
  const addToCartRate = 0.35; // Estimated 35% add to cart rate
  const totalCarts = Math.round(calcVisitors * addToCartRate);
  const abandonedCarts = Math.round(totalCarts * (calcAbandonmentRate / 100));
  const monthlyLostRevenue = abandonedCarts * calcAov;

  // Recovery Math (18% benchmark recovery with automated multi-channel follow-ups)
  const recoveryRate = 0.18;
  const recoveredCarts = Math.round(abandonedCarts * recoveryRate);
  const monthlyRecoveredRevenue = recoveredCarts * calcAov;
  const annualRecoveredRevenue = monthlyRecoveredRevenue * 12;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
      toast.error('Please enter your name, email, and WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Post lead to backend API endpoint
      const response = await fetch('/api/v1/public/tool-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_slug: 'cart-abandonment-calculator',
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          platform: storePlatform,
          monthly_revenue: monthlyRevenueBand,
          meta_data: {
            monthly_visitors: calcVisitors,
            average_order_value: calcAov,
            abandonment_rate: calcAbandonmentRate,
            primary_channel: calcChannel,
            monthly_lost_revenue: monthlyLostRevenue,
            monthly_recovered_revenue: monthlyRecoveredRevenue,
          },
        }),
      });

      if (!response.ok) {
        // Log fallback notice if API server returns error
        console.warn('Tool lead API responded with status:', response.status);
      }
    } catch (err) {
      console.error('Error submitting tool lead:', err);
    } finally {
      setIsSubmitting(false);
      setIsUnlocked(true);
      setIsModalOpen(false);
      toast.success('Your custom recovery report has been generated!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 5%, var(--bg)) 0%, var(--bg) 480px)' }}>
      <PublicSiteNav />

      {/* Hero Header */}
      <header className="hero-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 20px clamp(64px, 9vw, 104px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-15%', right: '-5%', width: 450, height: 450, background: 'rgba(37, 211, 102, 0.15)', filter: 'blur(80px)' }} />
        <div className="hero-blob" style={{ bottom: '-20%', left: '-8%', width: 500, height: 500, background: 'rgba(18, 140, 126, 0.12)', filter: 'blur(90px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18, background: 'rgba(255,255,255,0.12)', padding: '6px 16px', borderRadius: 20, backdropFilter: 'blur(10px)', display: 'inline-flex', gap: 8, color: '#fff' }}>
            <Flame size={14} color="#ffd700" />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>FREE BUSINESS OPTIMIZER TOOL</span>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(32px, 5.5vw, 52px)', color: '#ffffff', lineHeight: 1.15, marginBottom: 18, fontWeight: 800 }}>
            Cart Abandonment & <span className="mark-highlight" style={{ background: 'linear-gradient(120deg, rgba(37,211,102,0.3) 0%, rgba(37,211,102,0.6) 100%)', color: '#fff', padding: '0 6px', borderRadius: 6 }}>Revenue Recovery Calculator</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(16px, 2.2vw, 19px)', lineHeight: 1.65, maxWidth: 680, margin: '0 auto 28px' }}>
            Discover how much revenue your store is bleeding every month due to incomplete checkouts — and calculate how much you can instantly recover with automated follow-ups.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20, color: 'rgba(255,255,255,0.9)', fontSize: 13.5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="var(--wa-green)" /> 100% Free Calculator</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="var(--wa-green)" /> Real E-Commerce Benchmarks</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="var(--wa-green)" /> Customized Recovery PDF Report</span>
          </div>
        </div>
      </header>

      {/* Main Calculator Content */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1140, margin: '0 auto', padding: 'clamp(48px, 7vw, 88px) 20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 36, alignItems: 'start' }}>
          
          {/* Interactive Sliders Column */}
          <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 'clamp(24px, 4vw, 36px)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShoppingCart size={22} color="var(--primary)" /> Configure Store Parameters
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 28 }}>
              Adjust the values below to match your monthly store traffic and order numbers:
            </p>

            <div style={{ display: 'grid', gap: 24 }}>
              {/* Monthly Visitors */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  <span>Monthly Store Visitors:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{calcVisitors.toLocaleString()} visitors</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={calcVisitors}
                  onChange={(e) => setCalcVisitors(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>500</span>
                  <span>25,000</span>
                  <span>50,000+</span>
                </div>
              </div>

              {/* Average Order Value (AOV) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  <span>Average Order Value (AOV):</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>₦{calcAov.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="150000"
                  step="1000"
                  value={calcAov}
                  onChange={(e) => setCalcAov(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>₦2,000</span>
                  <span>₦75,000</span>
                  <span>₦150,000</span>
                </div>
              </div>

              {/* Cart Abandonment Rate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  <span>Estimated Cart Abandonment Rate:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 800 }}>{calcAbandonmentRate}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="1"
                  value={calcAbandonmentRate}
                  onChange={(e) => setCalcAbandonmentRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--danger)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>40% (Optimized)</span>
                  <span>70% (Global Avg)</span>
                  <span>90% (High Friction)</span>
                </div>
              </div>

              {/* Primary Channel */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  Primary Recovery Follow-Up Channel:
                </label>
                <SearchableSelect
                  options={[
                    { value: 'WhatsApp & Automated DMs (Highest Conversion)', label: 'WhatsApp & Automated DMs (Highest Conversion)' },
                    { value: 'Email Automated Sequences', label: 'Email Automated Sequences' },
                    { value: 'SMS Text Notifications', label: 'SMS Text Notifications' },
                    { value: 'None (Manual Follow-ups)', label: 'None (Manual Follow-ups)' },
                  ]}
                  value={calcChannel}
                  onChange={setCalcChannel}
                  searchable={false}
                />
              </div>
            </div>
          </div>

          {/* Real-time Calculation Results Card */}
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, #0d5c52 0%, #128C7E 100%)',
                borderRadius: 24,
                padding: 'clamp(24px, 4vw, 36px)',
                color: '#ffffff',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Diagnostic Breakdown
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> Live Calculation
                </span>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 6 }}>
                  🚨 Estimated Monthly Lost Sales Revenue
                </div>
                <div style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, color: '#ffd700', lineHeight: 1.1, marginBottom: 8 }}>
                  ₦{monthlyLostRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)' }}>
                  Lost Carts: <strong>{abandonedCarts.toLocaleString()} orders</strong> / month drop off without paying.
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 6 }}>
                  ✨ Potential Monthly Recoverable Revenue (+18%)
                </div>
                <div style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 900, color: '#25D366', lineHeight: 1.1, marginBottom: 8 }}>
                  +₦{monthlyRecoveredRevenue.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>/ month</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                  That is an additional <strong>+₦{annualRecoveredRevenue.toLocaleString()}</strong> added to your bottom line every year!
                </p>
              </div>

              {!isUnlocked ? (
                <button
                  onClick={handleOpenModal}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: 16,
                    fontWeight: 800,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    background: '#ffffff',
                    color: '#0d5c52',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={18} color="#0d5c52" />
                  <span>Send Me My Full Recovery Plan</span>
                  <ArrowRight size={16} color="#0d5c52" />
                </button>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                  <CheckCircle2 size={24} color="#25D366" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Full Report Unlocked!</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                    Scroll down to view your custom 5-step recovery blueprint.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unlocked Recovery Dashboard View */}
        {isUnlocked && (
          <section style={{ marginTop: 64, background: 'var(--surface)', borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 32 }}>
              <div>
                <span style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                  Actionable Strategy Blueprint
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  5-Step Automated Cart Recovery Plan for {leadName || 'Your Store'}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => window.print()}
                  className="btn"
                  style={{ padding: '10px 16px', fontSize: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <Download size={15} /> Save / Print PDF
                </button>
                <a
                  href={`https://wa.me/?text=Hi%20Frontstore%20team,%20I%20calculated%20my%20lost%20revenue%20of%20%E2%82%A6${monthlyLostRevenue.toLocaleString()}/mo%20on%20the%20Cart%20Abandonment%20Tool.%20Help%20me%20set%20up%20automated%20WhatsApp%20checkout!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '10px 16px', fontSize: 13, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <MessageSquare size={15} /> Set Up On WhatsApp
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 18, borderLeft: '4px solid var(--primary)', display: 'flex', gap: 14 }}>
                <CheckCircle2 size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>1. Implement Instant 1-Click Checkout Links</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                    Remove mandatory account creation and long form fields. Allow customers to complete orders instantly via WhatsApp or direct payment links.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 18, borderLeft: '4px solid var(--primary)', display: 'flex', gap: 14 }}>
                <Clock size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>2. Send 15-Minute Automated Follow-Up Reminders</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                    Send an automated message 15 minutes after cart abandonment containing a direct link back to their saved cart. Over 45% of recovered carts happen within the first hour.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 18, borderLeft: '4px solid var(--primary)', display: 'flex', gap: 14 }}>
                <Percent size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>3. Offer Limited-Time Incentive (Free Shipping or 5% Off)</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                    If the customer hasn't purchased after 2 hours, trigger a second automated follow-up offering a discount or free delivery voucher expiring in 24 hours.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 18, borderLeft: '4px solid var(--primary)', display: 'flex', gap: 14 }}>
                <ShieldCheck size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>4. Highlight Payment Trust & Customer Reviews</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                    Ensure trust badges (Paystack, Escrow Guarantee, Customer Ratings) are clearly visible right next to the checkout button.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Lead Capture Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 'clamp(24px, 4vw, 36px)', maxWidth: 540, width: '100%', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', position: 'relative' }}>
            
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 18, right: 20, background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                Unlock Your Free Cart Recovery Report
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Enter your details to receive your customized PDF audit report and step-by-step cart recovery checklist.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Johnson"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@mybrand.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 801 234 5678"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Store Platform
                  </label>
                  <SearchableSelect
                    options={[
                      { value: 'WhatsApp Store', label: 'WhatsApp Store' },
                      { value: 'Instagram / FB Store', label: 'Instagram / FB Store' },
                      { value: 'Shopify Store', label: 'Shopify Store' },
                      { value: 'WooCommerce', label: 'WooCommerce' },
                      { value: 'Custom Website', label: 'Custom Website' },
                    ]}
                    value={storePlatform}
                    onChange={setStorePlatform}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Monthly Revenue Band
                  </label>
                  <SearchableSelect
                    options={[
                      { value: 'Under ₦100k / month', label: 'Under ₦100k / month' },
                      { value: '₦100k - ₦500k / month', label: '₦100k - ₦500k / month' },
                      { value: '₦500k - ₦2m / month', label: '₦500k - ₦2m / month' },
                      { value: '₦2m - ₦10m / month', label: '₦2m - ₦10m / month' },
                      { value: 'Over ₦10m / month', label: 'Over ₦10m / month' },
                    ]}
                    value={monthlyRevenueBand}
                    onChange={setMonthlyRevenueBand}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 800,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <span>Generating Report...</span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Get My Instant PDF Report</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Lock size={12} color="var(--primary)" /> 100% Secure & Confidential. We never spam.
            </div>
          </div>
        </div>
      )}

      <PublicSiteFooter />
    </div>
  );
}
