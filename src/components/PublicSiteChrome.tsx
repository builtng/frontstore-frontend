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
