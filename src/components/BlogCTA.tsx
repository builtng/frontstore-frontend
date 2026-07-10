'use client';

import React, { useState } from 'react';
import { ArrowRight, Zap, Globe } from 'lucide-react';
import { RESERVED_SUBDOMAINS } from '@/utils/reservedKeywords';

interface BlogCTAProps {
  city: string;
  category: string;
  ctaText: string;
}

export default function BlogCTA({ city, category, ctaText }: BlogCTAProps) {
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    const clean = storeName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) {
      setError('Invalid name. Use letters, numbers, dashes, or underscores only.');
      return;
    }
    if (RESERVED_SUBDOMAINS.includes(clean)) {
      setError(`The name "${clean}" is reserved. Please choose another.`);
      return;
    }

    setError('');
    window.location.href = `/signup?username=${clean}`;
  };

  return (
    <div
      className="card"
      style={{
        padding: '32px 24px',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 70%, hsl(178, 70%, 45%) 100%)',
        color: '#fff',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--r-xl)',
        position: 'relative',
        overflow: 'hidden',
        marginTop: 40,
        marginBottom: 40,
      }}
    >
      {/* Background patterns */}
      <div style={{
        position: 'absolute', inset: 0,
        background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E\") repeat",
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '4px 10px', fontSize: 10, borderRadius: 'var(--r-full)' }}>
            <Zap size={10} style={{ marginRight: 2 }} /> 2-Minute Setup
          </span>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '4px 10px', fontSize: 10, borderRadius: 'var(--r-full)' }}>
            <Globe size={10} style={{ marginRight: 2 }} /> Free to Start
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#fff', lineHeight: 1.25 }}>
          Ready to scale your {category} shop in {city}?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>
          Claim your personalized link, showcase products using AI description builders, and receive orders directly in your WhatsApp chat instantly.
        </p>

        {/* Claim mini-form */}
        <form
          onSubmit={handleClaim}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 400, margin: '0 auto' }}
        >
          <div style={{
            display: 'flex',
            background: '#fff',
            borderRadius: 'var(--r-md)',
            padding: 4,
            gap: 4,
          }}>
            <input
              type="text"
              placeholder="your-brand-name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '10px 12px', fontSize: 14,
                background: 'transparent', color: '#111b21',
                minWidth: 0,
              }}
              aria-label="Enter store name"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '8px 16px', fontSize: 12, borderRadius: 'var(--r-sm)',
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--primary-dark)',
              }}
            >
              Setup your Store <ArrowRight size={12} />
            </button>
          </div>

          {error && (
            <div style={{ fontSize: 12, fontWeight: 700, color: 'hsl(0, 100%, 80%)', marginTop: 4 }}>
              {error}
            </div>
          )}

          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            Your URL will be: frontstore.ng/yourname
          </p>
        </form>
      </div>
    </div>
  );
}
