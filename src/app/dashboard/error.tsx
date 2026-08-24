'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Dashboard render error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: 16,
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-light, #fee2e2)',
        color: 'var(--danger, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertTriangle size={26} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
        Something went wrong loading your dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 380, margin: 0 }}>
        This has been logged. You can try again, or come back in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}
      >
        <RotateCw size={16} /> Try again
      </button>
    </div>
  );
}
