'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, RefreshCw, Mail, Globe, Lock } from 'lucide-react';

export default function AccessRefusedPage() {
  const router = useRouter();
  const [appName, setAppName] = useState('Frontstore');
  const [logoUrl, setLogoUrl] = useState('https://frontstore.ng/icon.png');
  const [supportEmail, setSupportEmail] = useState('hello@frontstore.ng');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setAppName(json.data.app_name || 'Frontstore');
            setLogoUrl(json.data.logo_url || 'https://frontstore.ng/icon.png');
            setSupportEmail(json.data.support_email || 'hello@frontstore.ng');
            setDetectedCountry(json.data.detected_country || null);
          }
        }
      } catch (err) {
        console.error('Failed to load settings on refusal page:', err);
      }
    };
    loadSettings();
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    // Add a slight artificial delay for a premium feel & show state
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(18, 140, 126, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(18, 140, 126, 0.05), transparent 45%), var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'var(--text)',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: 'var(--r-2xl)',
        padding: '40px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* App Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={appName}
              style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: 'var(--r-sm)' }}
            />
          )}
          <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {appName}
          </span>
        </div>

        {/* Warning Icon Badge */}
        <div style={{
          position: 'relative',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
          marginBottom: '24px'
        }}>
          <Lock size={32} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          marginBottom: '12px',
          letterSpacing: '-0.015em',
          lineHeight: '1.25'
        }}>
          Access Denied
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '15px',
          lineHeight: '1.6',
          color: 'var(--text-2)',
          marginBottom: '24px'
        }}>
          This platform is currently restricted in your country or region. We apologize for any inconvenience this may cause.
        </p>

        {/* Meta info card (Geo IP context) */}
        {detectedCountry && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '32px',
            width: '100%'
          }}>
            <Globe size={14} className="text-primary" style={{ color: 'var(--primary)' }} />
            <span>Detected Location: {detectedCountry}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleRetry}
          disabled={retrying}
          style={{
            width: '100%',
            height: '46px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r-lg)',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-primary)',
            transition: 'all 0.2s var(--ease)',
            opacity: retrying ? 0.8 : 1,
            pointerEvents: retrying ? 'none' : 'auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(18, 140, 126, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
          }}
        >
          <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} style={{ animation: retrying ? 'spin 1s linear infinite' : 'none' }} />
          {retrying ? 'Checking connection...' : 'Try again'}
        </button>
      </div>

      {/* Support footer */}
      {supportEmail && (
        <a
          href={`mailto:${supportEmail}`}
          style={{
            marginTop: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Mail size={13} />
          Contact Support
        </a>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}
