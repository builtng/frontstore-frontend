'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: 20,
      fontFamily: 'var(--font-heading)',
    }}>
      <Loader2 size={30} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Loading your dashboard…</span>
    </div>
  );
}
