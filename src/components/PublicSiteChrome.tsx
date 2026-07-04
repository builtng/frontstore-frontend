'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, ChevronRight, HelpCircle, Menu, Newspaper, Store, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/business', label: 'For Business', icon: Briefcase },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/docs', label: 'Help', icon: HelpCircle },
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

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

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
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={19} />
          </button>
        </div>
      </nav>

      <div
        className={`public-site-drawer__backdrop${mobileOpen ? ' is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`public-site-drawer${mobileOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="public-site-drawer__header">
          <Logo size={22} textColor="var(--primary)" text={appName} />
          <button
            type="button"
            className="public-site-drawer__close"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="public-site-drawer__actions">
          <ThemeToggle />
          {!mounted ? null : isLoggedIn ? (
            <a href="/dashboard" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Dashboard <ArrowRight size={14} />
            </a>
          ) : (
            <a href="/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Get started <ArrowRight size={14} />
            </a>
          )}
        </div>

        <nav className="public-site-drawer__links" aria-label="Site navigation">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <span className="public-site-drawer__link-icon"><Icon size={17} /></span>
                <span className="public-site-drawer__link-label">{link.label}</span>
                <ChevronRight size={16} className="public-site-drawer__link-chevron" />
              </a>
            );
          })}
        </nav>

        {mounted && !isLoggedIn && (
          <div className="public-site-drawer__footer">
            <a href="/login" onClick={() => setMobileOpen(false)}>Sign in</a>
          </div>
        )}
      </aside>

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
        .public-site-nav__hamburger {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: var(--r-md, 10px);
          align-items: center;
          justify-content: center;
          color: var(--text);
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .public-site-nav__hamburger:hover {
          border-color: var(--primary);
          background: var(--surface-2);
        }

        .public-site-drawer__backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 12, 22, 0.5);
          -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
          z-index: 90;
        }
        .public-site-drawer__backdrop.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .public-site-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(340px, 86vw);
          background: var(--surface);
          border-left: 1px solid var(--border);
          box-shadow: -16px 0 40px rgba(0,0,0,.18);
          z-index: 91;
          display: flex;
          flex-direction: column;
          padding: 16px 18px 20px;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .public-site-drawer.is-open {
          transform: translateX(0);
        }

        .public-site-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .public-site-drawer__close {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-2);
          color: var(--text-muted);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .public-site-drawer__close:hover {
          background: var(--danger-light, rgba(231,76,60,.12));
          color: var(--danger, #e74c3c);
          transform: rotate(90deg);
        }

        .public-site-drawer__actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .public-site-drawer__actions .btn {
          flex: 1;
          justify-content: center;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          font-size: 13px;
          text-decoration: none;
        }

        .public-site-drawer__links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .public-site-drawer__links a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 10px;
          border-radius: var(--r-md, 12px);
          color: var(--text);
          text-decoration: none;
          font-size: 14.5px;
          font-weight: 600;
          transition: background 0.15s ease;
        }
        .public-site-drawer__links a:hover {
          background: var(--surface-2);
        }
        .public-site-drawer__link-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: var(--surface-2);
          color: var(--primary);
          flex-shrink: 0;
        }
        .public-site-drawer__link-label {
          flex: 1;
        }
        .public-site-drawer__link-chevron {
          color: var(--text-faint);
          flex-shrink: 0;
        }

        .public-site-drawer__footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .public-site-drawer__footer a {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
        }

        @media (min-width: 769px) {
          .public-site-drawer,
          .public-site-drawer__backdrop {
            display: none;
          }
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
