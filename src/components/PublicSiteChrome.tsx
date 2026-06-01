'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export function PublicSiteNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(token && user && user !== 'undefined' && user !== 'null'));
    } catch {
      setIsLoggedIn(false);
    }
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
          <Logo size={24} textColor="var(--primary)" />
        </a>

        <div className="public-site-nav__links" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <a href="/" className="btn btn-ghost public-site-nav__secondary" style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}>Home</a>
          <a href="/#about" className="btn btn-ghost public-site-nav__secondary" style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}>About</a>
          <a href="/#how-it-works" className="btn btn-ghost public-site-nav__secondary" style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}>How it works</a>
          <a href="/blog" className="btn btn-ghost public-site-nav__secondary" style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Blog</a>
          {isLoggedIn ? (
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
        </div>
      </nav>
      <style jsx global>{`
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
          .public-site-nav__secondary {
            display: none !important;
          }
          .public-site-nav__links a svg {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

export function PublicSiteFooter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(token && user && user !== 'undefined' && user !== 'null'));
    } catch {
      setIsLoggedIn(false);
    }
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
        <Logo size={20} textColor="var(--primary)" />
      </a>
      <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
        © {new Date().getFullYear()} frontstore. Africa's #1 WhatsApp commerce platform.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
        <a href="/#about" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>About</a>
        <a href="/#how-it-works" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>How it works</a>
        <a href="/blog" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</a>
        <a href={isLoggedIn ? '/dashboard' : '/signup'} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>{isLoggedIn ? 'Dashboard' : 'Sign up'}</a>
        <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
        <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
      </div>
    </footer>
  );
}
