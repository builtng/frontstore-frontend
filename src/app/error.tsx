'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <PublicSiteNav />

      <main style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', padding: '64px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="card"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)',
            boxShadow: 'var(--shadow-xl)',
            width: '100%',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-full)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(22px, 4vw, 28px)',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 10,
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: 15,
              color: 'var(--text-muted)',
              maxWidth: 460,
              margin: '0 auto 28px',
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred while loading this page. Please try reloading or head back to the homepage.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              className="btn btn-primary"
              style={{
                padding: '11px 22px',
                fontSize: 14,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 'var(--r-lg)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="btn btn-ghost"
              style={{
                padding: '11px 22px',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid var(--border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 'var(--r-lg)',
                textDecoration: 'none',
              }}
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
