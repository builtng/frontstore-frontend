'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Check, X, Users2, BarChart3, FileText, Receipt,
  CalendarCheck2, Megaphone, ShieldCheck, KeyRound, Activity, Building2,
  Percent, Clock,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '../components/PublicSiteChrome';

const PAIN_POINTS = [
  { before: 'Orders buried somewhere in a WhatsApp chat you can barely scroll back through', after: 'Every order logged automatically and searchable from one dashboard' },
  { before: 'No record of who your customers are or what they have bought before', after: 'A customer profile with full order history, built without extra work' },
  { before: "You're the only person who can take an order or answer a question", after: 'Invite staff with their own logins and their own permission level' },
  { before: 'Chasing payment screenshots to confirm whether an order is real', after: 'Payments verified and reconciled automatically against every order' },
  { before: "No clear picture of how the week or month actually went", after: 'Weekly performance summaries and monthly statements, generated for you' },
  { before: 'Reminding customers about appointments and deposits by hand', after: 'Slots, bookings and deposits managed without a single back-and-forth' },
] as const;

const OPERATIONS = [
  {
    icon: Users2,
    title: 'Team & Roles',
    tagline: 'Bring your staff onto the platform',
    desc: 'Invite team members, assign custom roles and permissions, and keep an activity log of every login and change made to your store.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    tagline: 'Know exactly how business is going',
    desc: 'Weekly performance summaries and monthly statements are generated automatically, so revenue, orders and growth are never a guess.',
  },
  {
    icon: FileText,
    title: 'Invoices',
    tagline: 'Bill clients like an established company',
    desc: 'Send branded invoices with a payment link attached, track what has been paid, and export a PDF copy whenever you need one.',
  },
  {
    icon: Receipt,
    title: 'Receipts',
    tagline: 'Professional proof for every sale',
    desc: 'Every order generates a receipt your customer can be sent, resent, or you can export as a PDF for your own records.',
  },
  {
    icon: CalendarCheck2,
    title: 'Bookings & Appointments',
    tagline: 'For service and appointment led businesses',
    desc: 'Open available slots, collect deposits up front, and let customers book a time without a single message back and forth.',
  },
  {
    icon: Megaphone,
    title: 'Growth Broadcasts',
    tagline: 'Bring customers back without ad spend',
    desc: 'Send one message to your entire customer base the moment you have a restock, a promo, or a new drop worth announcing.',
  },
] as const;

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Payments you can rely on', desc: 'Paystack-secured checkout with payout tiers that speed up as your store earns trust — from a five-day hold to instant payout.' },
  { icon: KeyRound, title: 'A full audit trail', desc: 'Login history and activity logs for every team member, so you always know who did what, and when, on your store.' },
  { icon: Activity, title: 'Built to scale with you', desc: 'The same dashboard runs a one-person store and a multi-staff operation — you add what you need as the business grows.' },
] as const;

const PLAN_SNAPSHOT = [
  { name: 'Free', note: 'For a business just getting its structure in place', highlight: false },
  { name: 'Pro', note: 'For businesses ready to hand off the manual work', highlight: true },
  { name: 'Legend', note: 'For established operations running a full team', highlight: false },
] as const;

export default function BusinessPageClient({ initialSettings }: { initialSettings?: any }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [systemDomain, setSystemDomain] = useState(() => {
    const val = initialSettings?.system_domain || 'frontstore.ng';
    return val === 'frontstore.app' ? 'frontstore.ng' : val;
  });
  const [sellerCount, setSellerCount] = useState<number | null>(initialSettings?.real_store_count || null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(token && user && user !== 'undefined' && user !== 'null'));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (initialSettings) return;
    fetch(`${API_URL}/v1/public/settings`)
      .then(res => res.json())
      .then(json => {
        if (json.data?.system_domain) {
          const domain = json.data.system_domain;
          setSystemDomain(domain === 'frontstore.app' ? 'frontstore.ng' : domain);
        }
        if (json.data?.real_store_count) setSellerCount(json.data.real_store_count);
      })
      .catch(err => console.error('Failed to fetch public settings:', err));
  }, [initialSettings, API_URL]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowX: 'hidden' }}>
      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 96px) 20px clamp(64px, 10vw, 100px)' }}>
        <div className="hero-blob" style={{ top: '-18%', right: '-12%', width: 420, height: 420, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-25%', left: '-10%', width: 480, height: 480, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />
        <div className="hero-dash" style={{ top: '18%', right: '10%', width: 54, height: 54 }} />

        <div style={{
          position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center',
        }} className="hero-inner">
          <div style={{ maxWidth: 620 }} className="hero-copy">
            <div className="hero-eyebrow" style={{ marginBottom: 22 }}>
              <Building2 size={12} color="var(--accent)" /> <b>Frontstore for Business</b>
            </div>

            <h1 className="text-display" style={{ marginBottom: 20, lineHeight: 1.15, color: '#fff' }}>
              The back office for <span className="mark-highlight">your whole business</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 540, marginBottom: 32 }}>
              A storefront is only the front door. Behind it, Frontstore gives you the team accounts, reports, invoices, bookings and payment records that turn a one-person hustle into a business that runs without you holding every piece in your head.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
              <a
                href={isLoggedIn ? '/dashboard' : '/signup'}
                className="btn"
                style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--r-xl)', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--primary-dark)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', textDecoration: 'none' }}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free'} <ArrowRight size={16} />
              </a>
              <a
                href="mailto:hello@frontstore.ng?subject=Talk%20to%20Sales"
                className="btn"
                style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--r-xl)', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Talk to Our Team
              </a>
            </div>

            {sellerCount && sellerCount > 0 && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                Already running the back office for <strong style={{ color: '#fff' }}>{sellerCount.toLocaleString()}+ businesses</strong> across Africa.
              </p>
            )}
          </div>

          {/* ── Dashboard mockup ── */}
          <div className="browser-frame" style={{ maxWidth: 480, width: '100%', justifySelf: 'center' }}>
            <div className="browser-frame__bar">
              <div className="browser-frame__dots">
                <span className="browser-frame__dot" style={{ background: '#ff5f57' }} />
                <span className="browser-frame__dot" style={{ background: '#febc2e' }} />
                <span className="browser-frame__dot" style={{ background: '#28c840' }} />
              </div>
              <div className="browser-frame__url">{systemDomain}/dashboard</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'This week', value: '₦482,000', tone: 'var(--primary)' },
                  { label: 'Orders', value: '64', tone: 'var(--text)' },
                  { label: 'New customers', value: '12', tone: 'var(--text)' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-md)', padding: '10px 12px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: stat.tone, fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Amara O.', item: 'Blue Ankara Set', status: 'Paid', tone: 'primary' },
                  { name: 'Chidi E.', item: 'Wireless Earbuds', status: 'Pending', tone: 'muted' },
                  { name: 'Fatima K.', item: 'Skincare Bundle', status: 'Paid', tone: 'primary' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{row.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.item}</p>
                    </div>
                    <span
                      className={row.tone === 'primary' ? 'badge badge-primary' : 'badge'}
                      style={row.tone !== 'primary' ? { background: 'var(--bg-2)', color: 'var(--text-muted)' } : undefined}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: ['hsl(142, 70%, 85%)', 'hsl(210, 80%, 85%)', 'hsl(38, 90%, 85%)'][i],
                      border: '2px solid var(--surface)', marginLeft: i > 0 ? -8 : 0,
                    }}
                  />
                ))}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>3 team members active today</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Pain points: chaos vs control ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>Where businesses get stuck</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
              Running a business from a chat app only gets you so far
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 580, margin: '12px auto 0' }}>
              WhatsApp is where the sales happen. It was never built to hold your records, your team, or your numbers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {PAIN_POINTS.map((point, idx) => (
              <div
                key={idx}
                className="card animate-fade-in"
                style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: `${idx * 60}ms` }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <X size={15} color="var(--text-faint)" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{point.before}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={15} color="var(--primary)" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, lineHeight: 1.6 }}>{point.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business operations suite ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-accent" style={{ marginBottom: 12 }}>Business Operations</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>Everything your back office needs</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 600, margin: '12px auto 0' }}>
              The parts of running a business that have nothing to do with the storefront, and everything to do with staying in control of it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {OPERATIONS.map((op, idx) => {
              const Icon = op.icon;
              const hues = [
                { color: 'var(--primary)', bg: 'var(--primary-light)' },
                { color: 'hsl(200, 98%, 42%)', bg: 'hsl(200, 98%, 94%)' },
                { color: 'hsl(280, 70%, 52%)', bg: 'hsl(280, 70%, 95%)' },
                { color: 'hsl(38, 92%, 45%)', bg: 'hsl(38, 92%, 93%)' },
                { color: 'hsl(170, 70%, 36%)', bg: 'hsl(170, 70%, 94%)' },
                { color: 'hsl(340, 82%, 50%)', bg: 'hsl(340, 82%, 95%)' },
              ][idx % 6];
              return (
                <div
                  key={op.title}
                  className="card hover-lift animate-fade-in"
                  style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg)', border: '1px solid var(--border)', animationDelay: `${idx * 70}ms` }}
                >
                  <div className="icon-tile" style={{ width: 52, height: 52, background: hues.bg }}>
                    <Icon size={22} color={hues.color} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{op.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 10 }}>{op.tagline}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{op.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust & scale ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>Why business owners trust it</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>Built for accountability, not just aesthetics</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {TRUST_POINTS.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="card animate-fade-in" style={{ padding: 26, background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: `${idx * 80}ms` }}>
                  <div className="icon-tile" style={{ width: 48, height: 48, background: 'var(--primary-light)', marginBottom: 16 }}>
                    <Icon size={22} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{point.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{point.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing snapshot ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-accent" style={{ marginBottom: 12 }}>Pricing for growing teams</span>
          <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: 12 }}>One flat fee, whatever size you're at</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 560, margin: '0 auto 40px' }}>
            Free, Pro, or Legend, the transaction fee on every sale stays a flat 1.5%. Upgrading unlocks more of the back office, not a lower fee held hostage behind a higher tier.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
            {PLAN_SNAPSHOT.map(plan => (
              <div
                key={plan.name}
                className="card"
                style={{
                  padding: 24, textAlign: 'left', background: 'var(--bg)',
                  border: plan.highlight ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Percent size={16} color={plan.highlight ? 'var(--primary)' : 'var(--text-muted)'} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{plan.name}</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{plan.note}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="btn btn-primary" style={{ padding: '13px 26px', fontSize: 14, borderRadius: 'var(--r-xl)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            See full pricing & fees <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: 'clamp(40px, 8vw, 64px) 20px', background: 'var(--bg-2)' }}>
        <div className="hero-dark cta-inset" style={{ padding: 'clamp(48px, 9vw, 76px) 20px', textAlign: 'center' }}>
          <div className="hero-blob" style={{ top: '-40%', left: '-10%', width: 320, height: 320, background: 'rgba(255,255,255,0.05)' }} />
          <div className="hero-blob" style={{ bottom: '-45%', right: '-8%', width: 340, height: 340, background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto' }}>
            <h2 className="text-title" style={{ color: '#fff', marginBottom: 12 }}>
              Give your business the back office it's missing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
              Start free, or bring your team in and let's set it up together.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <a
                href={isLoggedIn ? '/dashboard' : '/signup'}
                className="btn"
                style={{
                  background: '#fff', color: 'var(--primary-dark)',
                  padding: '15px 28px', fontSize: 15, borderRadius: 'var(--r-xl)',
                  fontFamily: 'var(--font-heading)', fontWeight: 800,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                }}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free'} <ArrowRight size={16} />
              </a>
              <a
                href="mailto:hello@frontstore.ng?subject=Talk%20to%20Sales"
                className="btn"
                style={{
                  padding: '15px 28px', fontSize: 15, borderRadius: 'var(--r-xl)',
                  background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, textDecoration: 'none',
                }}
              >
                Talk to Our Team
              </a>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Clock size={12} /> Takes less than 2 minutes. No credit card required.
            </p>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </div>
  );
}
