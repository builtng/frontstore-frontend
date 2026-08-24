'use client';

import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import Toggle from './Toggle';
import {
  getStoredConsent,
  saveConsent,
  OPEN_COOKIE_PREFERENCES_EVENT,
} from '@/lib/cookieConsent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    if (!getStoredConsent()) setVisible(true);

    const openForManaging = () => {
      const stored = getStoredConsent();
      setAnalytics(stored ? stored.analytics : true);
      setPreferences(stored ? stored.preferences : true);
      setManaging(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openForManaging);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openForManaging);
  }, []);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    setManaging(false);
  };

  const acceptAll = () => {
    saveConsent({ analytics: true, preferences: true });
    close();
  };

  const rejectNonEssential = () => {
    saveConsent({ analytics: false, preferences: false });
    close();
  };

  const savePreferences = () => {
    saveConsent({ analytics, preferences });
    close();
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1500,
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: 'min(100%, 720px)',
          background: 'var(--surface, #ffffff)',
          color: 'var(--text, #111827)',
          border: '1px solid var(--border, rgba(15, 23, 42, 0.1))',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.16)',
          padding: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              background: 'var(--primary-light, rgba(18, 140, 126, 0.12))',
              color: 'var(--primary, #128C7E)',
            }}
          >
            <Cookie size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="cookie-consent-title" style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>
              We use cookies
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-muted, #475569)' }}>
              We use essential cookies to keep checkout and your dashboard working, plus optional
              analytics and preference cookies to improve the experience. Read our{' '}
              <a href="/privacy" style={{ color: 'var(--primary, #128C7E)', fontWeight: 600 }}>
                Privacy Policy
              </a>{' '}
              to learn more.
            </p>

            {managing && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Essential</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted, #64748b)' }}>
                      Required for login, cart, and checkout. Always on.
                    </div>
                  </div>
                  <Toggle checked disabled onChange={() => {}} />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Analytics</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted, #64748b)' }}>
                      Helps us understand traffic and improve page performance.
                    </div>
                  </div>
                  <Toggle checked={analytics} onChange={setAnalytics} />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Preferences</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted, #64748b)' }}>
                      Remembers currency, language, and theme between visits.
                    </div>
                  </div>
                  <Toggle checked={preferences} onChange={setPreferences} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
              {managing ? (
                <button type="button" onClick={savePreferences} style={primaryButtonStyle}>
                  Save preferences
                </button>
              ) : (
                <>
                  <button type="button" onClick={acceptAll} style={primaryButtonStyle}>
                    Accept all
                  </button>
                  <button type="button" onClick={rejectNonEssential} style={secondaryButtonStyle}>
                    Reject non-essential
                  </button>
                  <button type="button" onClick={() => setManaging(true)} style={linkButtonStyle}>
                    Manage preferences
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  background: 'var(--primary)',
  color: '#fff',
  borderRadius: 12,
  padding: '11px 18px',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  appearance: 'none',
  border: '1px solid var(--border-strong, rgba(15, 23, 42, 0.16))',
  background: 'transparent',
  color: 'var(--text, #111827)',
  borderRadius: 12,
  padding: '11px 18px',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
};

const linkButtonStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-muted, #475569)',
  borderRadius: 12,
  padding: '11px 12px',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
  textDecoration: 'underline',
};
