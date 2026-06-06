'use client';

import dynamic from 'next/dynamic';

const StorefrontClient = dynamic(() => import('./StorefrontClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton" style={{ width: 220, height: 24, borderRadius: 8 }} />
    </div>
  ),
});

export default StorefrontClient;
