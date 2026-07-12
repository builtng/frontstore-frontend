'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Calculator, ChevronRight, HelpCircle, Menu, Newspaper, PlayCircle, Store, Percent, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/pricing', label: 'Pricing', icon: Percent },
  { href: '/demo', label: 'Live Demo', icon: PlayCircle },
  { href: '/tools', label: 'Free Tools', icon: Calculator },
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
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
        style={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none' }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`public-site-drawer${mobileOpen ? ' is-open' : ''}`}
        style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)' }}
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
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
    <footer className="site-footer">
      <img src="/logo-mark.png" alt="" aria-hidden="true" className="site-footer__watermark" />

      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a href="/" style={{ display: 'inline-flex' }}>
              <Logo size={22} textColor="var(--primary)" text={appName} />
            </a>
            <p>Africa's #1 WhatsApp commerce platform — sell, get paid, and manage orders without leaving the chat.</p>
          </div>

          <div className="site-footer__col">
            <h4>Product</h4>
            <a href="/stores">Stores</a>
            <a href="/pricing">Pricing</a>
            <a href="/demo">Live Demo</a>
            <a href="/tools">Free Tools</a>
            <a href="/integrations">Integrations</a>
          </div>

          <div className="site-footer__col">
            <h4>Company</h4>
            <a href="/business">For Business</a>
            <a href="/solutions">Guides</a>
            <a href="/vs">Compare</a>
            <a href="/blog">Blog</a>
          </div>

          <div className="site-footer__col">
            <h4>Account</h4>
            <a href="/docs">Help</a>
            <a href={isLoggedIn ? '/dashboard' : '/signup'}>{isLoggedIn ? 'Dashboard' : 'Sign up'}</a>
          </div>

          <div className="site-footer__col">
            <h4>Legal</h4>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/dmca">DMCA</a>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} {appName}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
