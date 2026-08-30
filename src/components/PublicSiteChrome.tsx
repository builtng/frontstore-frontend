'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, X, Menu, Store, CreditCard, FileText, BookOpen, HelpCircle, UserCheck, Smartphone } from 'lucide-react';
import Logo from './Logo';
import SelectCountryModal, { COUNTRIES, Country } from './SelectCountryModal';

export function PublicSiteNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appName, setAppName] = useState('Frontstore');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const [learnOpen, setLearnOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const countryMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryMenuRef.current && !countryMenuRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    if (countryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countryDropdownOpen]);

  useEffect(() => {
    setMounted(true);
    try {
      const savedCode = localStorage.getItem('frontstore_country_code');
      if (savedCode) {
        const found = COUNTRIES.find((c) => c.code === savedCode);
        if (found) setSelectedCountry(found);
      }
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
        // Fallback
      }
    };
    loadPublicSettings();
  }, []);

  return (
    <>
      <header className="catlog-nav-header">
        <div className="catlog-nav-container">
          
          {/* Official Frontstore Logo & Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="/" className="catlog-brand-logo" style={{ textDecoration: 'none' }}>
              <Logo size={32} showText={true} textColor="#ffffff" text={appName} />
            </a>

            {/* Nav Menu */}
            <nav className="catlog-nav-menu" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
              
              {/* Products Dropdown */}
              <div 
                className="catlog-nav-item"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button className="catlog-nav-link" type="button" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>
                  Products <ChevronDown size={14} style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {productsOpen && (
                  <div className="catlog-dropdown">
                    <div className="catlog-dropdown-card">
                      <a href="/online-store" className="catlog-dropdown-item">
                        <div className="catlog-dropdown-icon-yellow">
                          <Store size={20} />
                        </div>
                        <div>
                          <div className="catlog-dropdown-title">Online Store</div>
                          <div className="catlog-dropdown-desc">Showcase your products and take orders with one simple link</div>
                        </div>
                      </a>

                      <a href="/record-keeping" className="catlog-dropdown-item">
                        <div className="catlog-dropdown-icon-red">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="catlog-dropdown-title">Record Keeping</div>
                          <div className="catlog-dropdown-desc">Easily keep track of all your sales, inventory & customers</div>
                        </div>
                      </a>

                      <a href="/payments" className="catlog-dropdown-item">
                        <div className="catlog-dropdown-icon-green">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="catlog-dropdown-title">Global Payments</div>
                          <div className="catlog-dropdown-desc">Collect local & international payments with instant invoices</div>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>


              <a href="/pricing" className="catlog-nav-link" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>Pricing</a>

              <a href="/why-frontstore" className="catlog-nav-link" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>Why {appName}</a>

              {/* Learn Dropdown */}
              <div 
                className="catlog-nav-item"
                onMouseEnter={() => setLearnOpen(true)}
                onMouseLeave={() => setLearnOpen(false)}
              >
                <button className="catlog-nav-link" type="button" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>
                  Learn <ChevronDown size={14} style={{ transform: learnOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {learnOpen && (
                  <div className="catlog-dropdown" style={{ width: 260 }}>
                    <div className="catlog-dropdown-card">
                      <a href="/about" className="catlog-dropdown-item">
                        <div className="catlog-dropdown-icon-red" style={{ width: 32, height: 32 }}>
                          <UserCheck size={16} />
                        </div>
                        <div className="catlog-dropdown-title" style={{ alignSelf: 'center' }}>About Us</div>
                      </a>

                      <a href="/blog" className="catlog-dropdown-item">
                        <div className="catlog-dropdown-icon-yellow" style={{ width: 32, height: 32 }}>
                          <BookOpen size={16} />
                        </div>
                        <div className="catlog-dropdown-title" style={{ alignSelf: 'center' }}>Blog & Guides</div>
                      </a>

                      <a href="/docs" className="catlog-dropdown-item">
                        <div className="catlog-dropdown-icon-green" style={{ width: 32, height: 32 }}>
                          <HelpCircle size={16} />
                        </div>
                        <div className="catlog-dropdown-title" style={{ alignSelf: 'center' }}>Help Center</div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Items: Country Flag, Log In, Get Started */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            
            {/* Country Flag Selector Popover */}
            <div ref={countryMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '5px 8px 5px 6px', borderRadius: 999,
                  cursor: 'pointer', color: '#ffffff', fontSize: 13, fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                aria-label="Select country"
              >
                <img
                  src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  width={20}
                  height={20}
                  style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                />
                <span style={{ fontSize: 10, opacity: 0.8, transform: countryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  ▼
                </span>
              </button>

              {countryDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: -10,
                    width: 220,
                    background: '#FFFFFF',
                    borderRadius: 20,
                    padding: 8,
                    boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    zIndex: 1000,
                    animation: 'catlogFadeIn 0.18s ease-out',
                  }}
                >
                  {/* Speech Bubble Arrow Tip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: 22,
                      width: 12,
                      height: 12,
                      background: '#FFFFFF',
                      transform: 'rotate(45deg)',
                      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                      borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
                      zIndex: 1001,
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { code: 'NG', name: 'Nigeria', bg: '#E8F5E9' },
                      { code: 'GH', name: 'Ghana', bg: '#FFF8E1' },
                      { code: 'ZA', name: 'South Africa', bg: '#E3F2FD' },
                      { code: 'KE', name: 'Kenya', bg: '#FBE9E7' },
                    ].map((country) => {
                      const isSelected = selectedCountry.code === country.code;
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            const full = COUNTRIES.find((c) => c.code === country.code) || {
                              code: country.code,
                              name: country.name,
                              dialCode: '',
                              flag: '',
                            };
                            setSelectedCountry(full);
                            setCountryDropdownOpen(false);
                            try {
                              localStorage.setItem('frontstore_country_code', country.code);
                            } catch {}
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            borderRadius: 14,
                            background: isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'; }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: country.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                              alt={country.name}
                              width={22}
                              height={22}
                              style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#111827',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {country.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {!mounted ? (
              <div style={{ width: 140, height: 42 }} />
            ) : isLoggedIn ? (
              <a href="/dashboard" className="catlog-purple-btn" style={{ background: '#0B5D39', borderRadius: 999, padding: '10px 22px', fontSize: 14 }}>
                Dashboard <ArrowRight size={14} />
              </a>
            ) : (
              <>
                <a href="/login" className="catlog-nav-link" style={{ fontSize: 14.5, color: '#ffffff', fontWeight: 600 }}>Log In</a>
                <a href="/signup" className="catlog-purple-btn" style={{ background: '#0B5D39', borderRadius: 999, padding: '10px 22px', fontSize: 14, fontWeight: 750 }}>
                  Get Started →
                </a>
              </>
            )}

            {/* Mobile Menu Button */}
            <button 
              type="button" 
              className="catlog-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'flex-end'
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div 
            style={{
              width: '100%', maxWidth: 320, background: '#ffffff', color: '#111827',
              height: '100%', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Logo size={24} showText={true} textColor="#3B24B2" text={appName} />
                <button type="button" onClick={() => setMobileOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="/online-store" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, padding: '10px 0' }}>Online Store</a>
                <a href="/record-keeping" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, padding: '10px 0' }}>Record Keeping</a>
                <a href="/payments" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, padding: '10px 0' }}>Global Payments</a>
                <a href="/pricing" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, padding: '10px 0' }}>Pricing</a>
                <a href="/why-frontstore" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, padding: '10px 0' }}>Why {appName}</a>
                <a href="/blog" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, padding: '10px 0' }}>Blog</a>
              </nav>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="/signup" className="catlog-purple-btn" style={{ width: '100%', background: '#0B5D39' }}>Get Started Free</a>
              <a href="/login" className="catlog-white-btn" style={{ width: '100%', border: '1px solid #E5E7EB', color: '#111827' }}>Sign In</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PublicSiteFooter() {
  const [appName, setAppName] = useState('Frontstore');

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.app_name) setAppName(json.data.app_name);
      } catch {
        // Fallback
      }
    };
    loadPublicSettings();
  }, []);

  return (
    <footer className="catlog-footer">
      <div className="catlog-footer-container">
        
        {/* Banner */}
        <div className="catlog-footer-banner">
          <div className="catlog-footer-banner-content">
            <div className="catlog-footer-banner-badge">
              Available in: 🇳🇬 🇬🇭 🇿🇦 🇰🇪
            </div>
            <h2>Get started in under 2 minutes</h2>
            <p>
              Set up an online store, accept payments, and manage operations all from your phone or browser.
            </p>
          </div>

          <div className="catlog-footer-actions">
            <a href="/signup" className="catlog-purple-btn" style={{ background: '#0B5D39', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.7-1.13 1.84-.99 2.94 1.07.08 2.14-.54 2.8-1.34z"/>
              </svg>
              <span>Download App</span>
            </a>
            <a href="/signup" className="catlog-white-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>Use the web</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="catlog-footer-grid">
          <div className="catlog-footer-brand">
            <div style={{ marginBottom: 14 }}>
              <a href="/" style={{ textDecoration: 'none' }}>
                <Logo size={28} showText={true} textColor="#ffffff" text={appName} />
              </a>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
              The smartest way to manage your business and accept payments everywhere.
            </p>
          </div>

          <div className="catlog-footer-col">
            <h4>PRODUCTS</h4>
            <ul>
              <li><a href="/online-store">Online Store</a></li>
              <li><a href="/record-keeping">Record Keeping</a></li>
              <li><a href="/payments">Global Payments</a></li>
            </ul>
          </div>

          <div className="catlog-footer-col">
            <h4>LEARN</h4>
            <ul>
              <li><a href="/why-frontstore">Why {appName}</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/docs">Help Articles</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="catlog-footer-col">
            <h4>WHAT CAN I SELL?</h4>
            <ul>
              <li><a href="/solutions/food-drinks">Food & Drinks</a></li>
              <li><a href="/solutions/fashion-items">Fashion Items</a></li>
              <li><a href="/solutions/gadgets">Gadgets</a></li>
              <li><a href="/solutions/beauty-makeup">Beauty & Makeup</a></li>
              <li><a href="/solutions/physical-products">Physical Products</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          <span>© {new Date().getFullYear()} {appName}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
