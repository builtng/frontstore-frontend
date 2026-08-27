'use client';

import dynamic from 'next/dynamic';

const StorefrontClient = dynamic(() => import('./StorefrontClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div className="spinner spinner-primary" style={{ width: 44, height: 44, borderWidth: 3 }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary, #64748b)', letterSpacing: '0.02em' }}>Loading store...</span>
    </div>
  ),
});

export default StorefrontClient;
