'use client';

import React from 'react';
import Logo from '@/components/Logo';
import { User, Store } from 'lucide-react';
import NinaWidget from '@/components/NinaWidget';

interface AuthShellProps {
  children: React.ReactNode;
  iconType?: 'user' | 'store';
  appName?: string;
}

export default function AuthShell({
  children,
  iconType = 'user',
  appName = 'Frontstore',
}: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#042A19',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%),
          url("data:image/svg+xml,%3Csvg width='120' height='40' viewBox='0 0 120 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 20 Q 30 5, 60 20 T 120 20' fill='none' stroke='rgba(255, 255, 255, 0.05)' stroke-width='2'/%3E%3C/svg%3E")
        `,
        backgroundRepeat: 'repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      {/* Top Header Logo */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          <Logo size={30} textColor="#FFFFFF" text={appName} />
        </a>
      </div>

      {/* Main Centered Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 450,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 24px 64px -12px rgba(4, 42, 25, 0.45), 0 4px 16px rgba(0, 0, 0, 0.08)',
          padding: '36px 32px 32px 32px',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Top Avatar Badge Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -4px rgba(11, 93, 57, 0.35)',
            marginBottom: 20,
            flexShrink: 0,
          }}
        >
          {iconType === 'store' ? (
            <Store size={30} strokeWidth={2.2} />
          ) : (
            <User size={32} strokeWidth={2.2} />
          )}
        </div>

        {/* Form Body */}
        <div style={{ width: '100%' }}>{children}</div>
      </div>

      {/* Nina Chat Agent Widget */}
      <NinaWidget />
    </div>
  );
}
