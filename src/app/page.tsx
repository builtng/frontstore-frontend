'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Sparkles, Zap, Link, BarChart3, Globe,
  Store, Star, ArrowRight, CheckCircle2, User, Flame
} from 'lucide-react';

// ── Sample Store Feature Cards ───────────────────────────────────────────────

const FEATURES = [
  {
    title: 'WhatsApp-Native Checkout',
    body: 'No complex payment setup. Customers browse, tap "Order on WhatsApp", and land directly in your chat with a pre-filled message ready to send.',
    color: 'hsl(142, 71%, 45%)',
    bg: 'hsl(142, 71%, 96%)',
  },
  {
    title: 'AI-Powered Listings',
    body: 'Upload a photo — Gemini AI writes your product descriptions, suggests local prices, and creates searchable tags in seconds.',
    color: 'hsl(250, 84%, 60%)',
    bg: 'hsl(250, 84%, 97%)',
  },
  {
    title: 'Ultra-Fast Loading',
    body: 'Optimized for African mobile networks. Static pages load in under 2 seconds even on 3G, keeping your bounce rate low and buyers engaged.',
    color: 'hsl(38, 92%, 50%)',
    bg: 'hsl(38, 92%, 96%)',
  },
  {
    title: 'Shareable Store Links',
    body: 'Your store lives at yourbrand.aloaye.com — share it on Instagram bio, TikTok profile, or WhatsApp status to drive traffic instantly.',
    color: 'hsl(200, 98%, 45%)',
    bg: 'hsl(200, 98%, 96%)',
  },
  {
    title: 'Simple Order Tracking',
    body: "Every order creates a trackable record. See what's pending, confirmed, or shipped — all in one clean dashboard.",
    color: 'hsl(340, 82%, 55%)',
    bg: 'hsl(340, 82%, 97%)',
  },
  {
    title: 'Multi-Currency Support',
    body: 'Sell in NGN, GHS, KES, ZAR and more. aloaye handles local currency formatting so prices feel right to your local buyers.',
    color: 'hsl(170, 70%, 40%)',
    bg: 'hsl(170, 70%, 96%)',
  },
] as const;

const TESTIMONIALS = [
  {
    name: 'Chioma A.',
    role: 'Fashion Vendor, Lagos',
    initial: 'C',
    bg: 'hsl(142, 70%, 94%)',
    color: 'hsl(142, 70%, 35%)',
    text: 'I set up my store in 5 minutes and got 3 orders the same day via WhatsApp. aloaye is a game changer for small businesses.',
    stars: 5,
  },
  {
    name: 'Kwame O.',
    role: 'Electronics Reseller, Accra',
    initial: 'K',
    bg: 'hsl(210, 80%, 94%)',
    color: 'hsl(210, 80%, 35%)',
    text: 'My customers love how easy it is to browse and order. The WhatsApp button makes them feel comfortable and trusted.',
    stars: 5,
  },
  {
    name: 'Fatima B.',
    role: 'Food Vendor, Kano',
    initial: 'F',
    bg: 'hsl(340, 80%, 94%)',
    color: 'hsl(340, 80%, 35%)',
    text: 'Before aloaye I was sending photos one-by-one on WhatsApp. Now I just share my store link and let customers browse themselves!',
    stars: 5,
  },
] as const;

const HOW_IT_WORKS = [
  { step: '01', title: 'Claim your URL', body: 'Type your business name and claim yourbrand.aloaye.com in seconds.' },
  { step: '02', title: 'Add your products', body: 'Upload photos, add prices, and let AI write descriptions for you.' },
  { step: '03', title: 'Share & sell', body: 'Drop your store link on WhatsApp, Instagram, or TikTok and start receiving orders.' },
] as const;

const getFeatureIcon = (title: string, color: string) => {
  switch (title) {
    case 'WhatsApp-Native Checkout':
      return <MessageSquare size={22} color={color} />;
    case 'AI-Powered Listings':
      return <Sparkles size={22} color={color} />;
    case 'Ultra-Fast Loading':
      return <Zap size={22} color={color} />;
    case 'Shareable Store Links':
      return <Link size={22} color={color} />;
    case 'Simple Order Tracking':
      return <BarChart3 size={22} color={color} />;
    case 'Multi-Currency Support':
      return <Globe size={22} color={color} />;
    default:
      return <Store size={22} color={color} />;
  }
};

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null);
  const [hostSuffix, setHostSuffix] = useState('.aloaye.com');
  const [mounted, setMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const clean = window.location.host.replace(/^www\./, '');
      setHostSuffix(`.${clean}`);
    }
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || checking) return;

    const clean = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) {
      setMessage('Invalid name. Use letters, numbers, dashes, or underscores only.');
      setMessageType('error');
      return;
    }
    if (clean === 'aloaye') {
      setMessage('The name "aloaye" is reserved. Please choose another.');
      setMessageType('error');
      return;
    }

    try {
      setChecking(true);
      setMessage('');
      setMessageType(null);

      const res = await fetch(`${API_URL}/v1/public/store/${clean}`);

      if (res.ok) {
        setMessage(`Sorry — ${clean}${hostSuffix} is already taken.`);
        setMessageType('error');
      } else if (res.status === 404) {
        setMessage(`🎉 ${clean}${hostSuffix} is available!`);
        setMessageType('success');
        setTimeout(() => {
          window.location.href = `/signup?username=${clean}`;
        }, 1200);
      } else {
        throw new Error('Connection issue');
      }
    } catch {
      setMessage('Checking availability...');
      setMessageType('success');
      setTimeout(() => {
        window.location.href = `/signup?username=${username.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
      }, 1000);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav
        className="glass"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 20,
          fontWeight: 900,
          color: 'var(--primary)',
          letterSpacing: '-0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Store size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          aloaye
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href="/signup"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            id="nav-get-started"
          >
            Get Started <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{
        padding: 'clamp(48px, 10vw, 96px) 20px clamp(48px, 8vw, 72px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background blob */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '80vw', maxWidth: 600, height: '60%',
          background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <span className="badge badge-primary" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> Under 2 Minutes Setup
            </span>
            <span className="badge badge-verified" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Globe size={11} /> Built for Africa
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-display"
            style={{ marginBottom: 20, maxWidth: 560, margin: '0 auto 20px' }}
          >
            Sell to anyone on{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(142, 71%, 45%), hsl(158, 84%, 39%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              WhatsApp
            </span>
            , Instantly.
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.65,
            maxWidth: 480,
            margin: '0 auto 32px',
          }}>
            aloaye gives African small businesses a stunning digital store. Upload products with AI, share your link, and get orders straight to your WhatsApp in minutes.
          </p>

          {/* Claim form */}
          <form
            onSubmit={handleClaim}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420, margin: '0 auto' }}
          >
            <div style={{
              display: 'flex',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: 6,
              boxShadow: 'var(--shadow-lg)',
              gap: 4,
            }}>
              <input
                type="text"
                placeholder="your-store-name"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  padding: '10px 12px', fontSize: 15,
                  background: 'transparent', color: 'var(--text)',
                  minWidth: 0,
                }}
                id="store-name-input"
                aria-label="Choose your store name"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={checking}
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontSize: 13, borderRadius: 'var(--r-lg)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                id="claim-url-btn"
              >
                {checking ? (
                  <><span className="spinner" style={{ width: 14, height: 14 }} /> Checking...</>
                ) : (
                  <>Claim URL <ArrowRight size={14} /></>
                )}
              </button>
            </div>

            {message && (
              <div
                className="animate-slide-up"
                style={{
                  fontSize: 13, fontWeight: 600,
                  color: messageType === 'error' ? 'var(--danger)' : 'var(--primary)',
                  padding: '8px 14px',
                  borderRadius: 'var(--r-md)',
                  background: messageType === 'error' ? 'var(--danger-light)' : 'var(--primary-light)',
                  textAlign: 'center',
                }}
              >
                {message}
              </div>
            )}

            {mounted && (
              <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
                Your store will be at <strong style={{ color: 'var(--text-muted)' }}>yourname{hostSuffix}</strong>
              </p>
            )}
          </form>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { bg: 'hsl(142, 70%, 85%)', color: 'hsl(142, 70%, 30%)' },
                { bg: 'hsl(210, 80%, 85%)', color: 'hsl(210, 80%, 30%)' },
                { bg: 'hsl(38, 90%, 85%)', color: 'hsl(38, 90%, 30%)' },
                { bg: 'hsl(280, 70%, 85%)', color: 'hsl(280, 70%, 30%)' },
                { bg: 'hsl(340, 80%, 85%)', color: 'hsl(340, 80%, 30%)' },
              ].map((style, i) => (
                <div
                  key={i}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: style.bg, color: style.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--bg)',
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: 5 - i,
                  }}
                >
                  <User size={13} strokeWidth={2.5} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>1,200+ sellers</strong> already selling on aloaye
            </p>
          </div>
        </div>
      </header>

      {/* ── How It Works ── */}
      <section style={{ padding: 'clamp(40px, 8vw, 72px) 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>How it works</span>
            <h2 className="text-title">Start selling in 3 simple steps</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className="card hover-lift animate-fade-in"
                style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  position: 'absolute', top: -16, right: -8,
                  fontSize: 64, fontWeight: 900, color: 'var(--primary-light)',
                  fontFamily: 'var(--font-heading)', lineHeight: 1,
                  userSelect: 'none',
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--r-md)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
                  marginBottom: 14,
                }}>
                  {i + 1}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>Features</span>
            <h2 className="text-title">Built for how business is done in Africa</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 15, maxWidth: 500, margin: '12px auto 0' }}>
              Every feature is designed for African sellers — low bandwidth, WhatsApp-first, and mobile-optimized.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card hover-lift animate-fade-in"
                style={{ padding: '22px', display: 'flex', gap: 14, animationDelay: `${i * 60}ms` }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  background: f.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {getFeatureIcon(f.title, f.color)}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 72px) 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="badge badge-accent" style={{ marginBottom: 12, display: 'inline-block' }}>Testimonials</span>
            <h2 className="text-title">Sellers love aloaye</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="card animate-fade-in" style={{ padding: '22px', animationDelay: `${i * 80}ms` }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="var(--accent)" color="var(--accent)" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: t.bg, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-heading)'
                  }}>
                    {t.initial}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        padding: 'clamp(48px, 10vw, 80px) 20px',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, hsl(178, 70%, 45%) 100%)',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\") repeat",
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
          <h2 className="text-title" style={{ color: '#fff', marginBottom: 12 }}>
            Ready to start selling on WhatsApp?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
            Join 1,200+ African sellers already using aloaye to grow their business. Free to start — no credit card needed.
          </p>
          <a
            href="/signup"
            className="btn"
            style={{
              background: '#fff', color: 'var(--primary)',
              padding: '16px 32px', fontSize: 16, borderRadius: 'var(--r-xl)',
              fontFamily: 'var(--font-heading)', fontWeight: 800,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            }}
            id="cta-get-started"
          >
            Create Your Free Store <ArrowRight size={16} />
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 14 }}>
            Takes less than 2 minutes. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--primary)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Store size={18} style={{ color: 'var(--primary)' }} />
          aloaye
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
          © {new Date().getFullYear()} aloaye. Africa's #1 WhatsApp Commerce Platform.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="/signup" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</a>
          <a href="#" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>

    </div>
  );
}
