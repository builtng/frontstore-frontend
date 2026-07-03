'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/stores', label: 'Stores' },
  { href: '/business', label: 'For Business' },
  { href: '/blog', label: 'Blog' },
  { href: '/docs', label: 'Help' },
];

export function PublicSiteNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appName, setAppName] = useState('Front Store');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(token && user && user !== 'undefined' && user !== 'null'));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.app_name) setAppName(json.data.app_name);
      } catch {
        // Keep the local fallback when settings cannot be loaded.
      }
    };
    loadPublicSettings();
  }, []);

  return (
    <>
      <nav
        className="glass public-site-nav"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <a href="/" style={{ display: 'inline-flex' }}>
          <Logo size={24} textColor="var(--primary)" text={appName} />
        </a>

        <div className="public-site-nav__links" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="btn btn-ghost public-site-nav__secondary" style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}>{link.label}</a>
          ))}
          {!mounted ? (
            <div style={{ width: 140, height: 36 }} />
          ) : isLoggedIn ? (
            <a href="/dashboard" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Dashboard <ArrowRight size={14} />
            </a>
          ) : (
            <>
              <a href="/login" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}>Sign in</a>
              <a href="/signup" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Get started <ArrowRight size={14} />
              </a>
            </>
          )}
          <button
            type="button"
            className="public-site-nav__hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="public-site-nav__mobile-panel">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>{link.label}</a>
            ))}
          </div>
        )}
      </nav>
      <style jsx global>{`
        @media (max-width: 768px) {
          .public-site-nav__secondary {
            display: none !important;
          }
          .public-site-nav__hamburger {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          .public-site-nav {
            padding: 10px 12px !important;
            gap: 10px !important;
          }
          .public-site-nav__links {
            gap: 4px !important;
          }
          .public-site-nav__links a {
            padding: 7px 9px !important;
            font-size: 12px !important;
          }
          .public-site-nav__links a svg {
            display: none !important;
          }
        }
        .public-site-nav__mobile-panel {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          flex-direction: column;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 8px 20px 14px;
          box-shadow: 0 12px 24px rgba(0,0,0,.08);
        }
        @media (max-width: 768px) {
          .public-site-nav__mobile-panel {
            display: flex;
          }
        }
        .public-site-nav__mobile-panel a {
          padding: 12px 4px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          text-decoration: none;
          border-bottom: 1px solid var(--border);
        }
        .public-site-nav__mobile-panel a:last-child {
          border-bottom: none;
        }
      `}</style>
    </>
  );
}

export function PublicSiteFooter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appName, setAppName] = useState('Front Store');

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(token && user && user !== 'undefined' && user !== 'null'));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.app_name) setAppName(json.data.app_name);
      } catch {
        // Keep the local fallback when settings cannot be loaded.
      }
    };
    loadPublicSettings();
  }, []);

  return (
    <footer style={{
      padding: '24px 20px',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 48
    }}>
      <a href="/" style={{ display: 'inline-flex' }}>
        <Logo size={20} textColor="var(--primary)" text={appName} />
      </a>
      <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
        © {new Date().getFullYear()} {appName}. Africa's #1 WhatsApp commerce platform.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/marketplace" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Marketplace</a>
        <a href="/stores" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Stores</a>
        <a href="/business" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>For Business</a>
        <a href="/blog" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</a>
        <a href={isLoggedIn ? '/dashboard' : '/signup'} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>{isLoggedIn ? 'Dashboard' : 'Sign up'}</a>
        <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
        <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
        <a href="/docs" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Help</a>
      </div>
    </footer>
  );
}
