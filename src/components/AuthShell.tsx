'use client';

import React from 'react';
import Logo from '@/components/Logo';
import NinaWidget from '@/components/NinaWidget';
import { ShoppingBag, TrendingUp, Users, Star } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  iconType?: 'user' | 'store';
  appName?: string;
  panelHeadline?: string;
  panelSubline?: string;
}

const TRUST_STATS = [
  { icon: ShoppingBag, value: '50K+', label: 'Active Stores' },
  { icon: TrendingUp, value: '₦2B+', label: 'Monthly Sales' },
  { icon: Users, value: '200K+', label: 'Customers' },
];

const TESTIMONIAL = {
  quote: 'I launched my store in under 3 minutes. My first sale came in the same day.',
  author: 'Chioma A.',
  role: 'Fashion Merchant, Lagos',
  stars: 5,
};

export default function AuthShell({
  children,
  appName = 'Frontstore',
  panelHeadline = 'Your store, live\nin minutes.',
  panelSubline = 'Join 50,000+ merchants already selling smarter with Frontstore.',
}: AuthShellProps) {
  return (
    <>
      <style>{`
        @keyframes fs-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fs-fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fs-form-inner { animation: fs-fadein 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fs-stat:hover { background: rgba(255,255,255,0.13) !important; transform: translateY(-2px); }
        .fs-stat { transition: all 0.2s ease; }
        .fs-primary-btn { transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease !important; }
        .fs-primary-btn:hover:not(:disabled) {
          background: #074328 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 10px 30px -6px rgba(11,93,57,0.55) !important;
        }
        .fs-primary-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .fs-tab-btn { transition: all 0.15s ease; }
        .fs-tab-btn:hover { color: #111827 !important; }
        .fs-link { transition: color 0.15s ease; }
        .fs-link:hover { color: #074328 !important; }
        .fs-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease !important;
        }
        .fs-input:focus {
          border-color: #0B5D39 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(11,93,57,0.10) !important;
          outline: none !important;
        }
        @media (min-width: 900px) {
          .fs-left { display: flex !important; }
          .fs-mobile-header { display: none !important; }
          .fs-right { min-height: 100vh; }
        }
        @media (max-width: 899px) {
          .fs-right { min-height: 100vh; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)' }}>

        {/* ══ LEFT BRAND PANEL ══════════════════════════════════════════════════ */}
        <div
          className="fs-left"
          style={{
            display: 'none',
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '42%',
            flexShrink: 0,
            backgroundColor: '#042A19',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 44px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Dot grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
          {/* Top glow */}
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Bottom glow */}
          <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,93,57,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <Logo size={28} textColor="#FFFFFF" text={appName} />
            </a>
          </div>

          {/* Illustration + Headline */}
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 32, boxShadow: '0 32px 64px -16px rgba(0,0,0,0.5)', animation: 'fs-float 6s ease-in-out infinite' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/auth-panel.jpg" alt="" style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, margin: '0 0 12px 0', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading, system-ui)', whiteSpace: 'pre-line' }}>
              {panelHeadline}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
              {panelSubline}
            </p>
          </div>

          {/* Stats + Testimonial */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {TRUST_STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="fs-stat" style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 10px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <Icon size={13} style={{ color: '#4ADE80', marginBottom: 4 }} />
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                {Array.from({ length: TESTIMONIAL.stars }).map((_, i) => (
                  <Star key={i} size={12} fill="#FBBF24" color="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: '0 0 10px 0', fontStyle: 'italic' }}>
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4ADE80 0%, #0B5D39 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {TESTIMONIAL.author.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{TESTIMONIAL.author}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{TESTIMONIAL.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT FORM PANEL ══════════════════════════════════════════════════ */}
        <div
          className="fs-right"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
            overflowY: 'auto',
          }}
        >
          {/* Mobile logo */}
          <div className="fs-mobile-header" style={{ marginBottom: 36, textAlign: 'center' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <Logo size={26} text={appName} />
            </a>
          </div>

          {/* Form content */}
          <div className="fs-form-inner" style={{ width: '100%', maxWidth: 420 }}>
            {children}
          </div>

          {/* Footer */}
          <p style={{ marginTop: 40, fontSize: 11.5, color: '#D1D5DB', textAlign: 'center' }}>
            © {new Date().getFullYear()} Frontstore · All rights reserved
          </p>
        </div>
      </div>

      <NinaWidget />
    </>
  );
}
