'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Sparkles, Globe, Store, Lock, Eye, EyeOff, Loader2, ArrowRight, Check, LogIn, Mail
} from 'lucide-react';

const countries = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

const normalizePhone = (input: string, dialCode: string) => {
  const cleanDial = dialCode.replace(/[^\d]/g, '');
  let cleaned = input.replace(/[^\d]/g, '');
  if (cleaned.startsWith(cleanDial)) {
    cleaned = cleaned.slice(cleanDial.length);
  }
  cleaned = cleaned.replace(/^0+/, '');
  return `+${cleanDial}${cleaned}`;
};

const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { country: countries[0], local: '' };
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const cleaned = fullPhone.replace(/[^\d+]/g, '');
  for (const c of sortedCountries) {
    if (cleaned.startsWith(c.dialCode)) {
      return { country: c, local: cleaned.slice(c.dialCode.length).replace(/^0+/, '') };
    }
    const dialWithoutPlus = c.dialCode.slice(1);
    if (cleaned.startsWith(dialWithoutPlus)) {
      return { country: c, local: cleaned.slice(dialWithoutPlus.length).replace(/^0+/, '') };
    }
  }
  return { country: countries[0], local: cleaned.replace(/^0+/, '') };
};

function LoginFormContent({ isAdminMode, merchantLoginUrl }: { isAdminMode: boolean; merchantLoginUrl: string }) {
  const router = useRouter();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const found = countries.find(c => c.code === data.country_code);
          if (found) setSelectedCountry(found);
        }
      } catch {
        // Keep Nigeria as the default when detection is unavailable.
      }
    };
    if (!isAdminMode) detectCountry();
  }, [isAdminMode]);

  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutsideClick = () => {
      setIsCountryDropdownOpen(false);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isCountryDropdownOpen]);

  const handleMerchantPhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const hasCountryPrefix = value.trim().startsWith('+') || countries.some(c => digits.startsWith(c.dialCode.slice(1)));
    if (hasCountryPrefix) {
      const parsed = parsePhoneNumber(value);
      setSelectedCountry(parsed.country);
      setLoginIdentifier(parsed.local);
      return;
    }
    setLoginIdentifier(value);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const isAdmin = parsedUser?.is_admin === true || parsedUser?.is_admin === 1 || parsedUser?.is_admin === 'true' || parsedUser?.is_admin === '1';
          router.push(isAdmin ? '/admin' : '/dashboard');
        } catch (e) {
          console.error("Failed to parse user details in login redirect hook", e);
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginIdentifier || !password) {
      setError(isAdminMode ? 'Please enter your administrator email and password.' : 'Please enter your phone number and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const trimmedIdentifier = loginIdentifier.trim();
      const normalizedIdentifier = isAdminMode || trimmedIdentifier.includes('@')
        ? trimmedIdentifier
        : normalizePhone(trimmedIdentifier, selectedCountry.dialCode);

      const res = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phone_number: normalizedIdentifier,
          country_dial_code: selectedCountry.dialCode,
          password: password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Login failed. Please check your credentials.');
      }

      if (typeof window !== 'undefined' && json.data?.token) {
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data.user));
        localStorage.setItem('store', JSON.stringify(json.data.store || null));

        const isAdmin = json.data.user?.is_admin === true || json.data.user?.is_admin === 1 || json.data.user?.is_admin === 'true' || json.data.user?.is_admin === '1';
        toast.success(isAdmin ? 'Welcome, Administrator! 🛡️' : 'Welcome back to aloaye! 👋');
        router.push(isAdmin ? '/admin' : '/dashboard');
      } else {
        throw new Error('No authentication token received.');
      }

    } catch (err: any) {
      setError(
        err instanceof TypeError
          ? `Could not reach the server at ${API_URL}. Please check the API URL and try again.`
          : err.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <a
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', marginBottom: 12 }}
        >
          <Store size={28} style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
          <span>aloaye</span>
        </a>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          {isAdminMode ? 'Admin Log In' : 'Merchant Log In'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5 }}>
          {isAdminMode
            ? 'Access the platform management, configure global settings, and view growth statistics.'
            : 'Access your digital storefront dashboard, manage orders, and upload products.'
          }
        </p>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'var(--danger-light)', color: 'var(--danger)',
          border: '1.5px solid rgba(239, 68, 68, 0.15)',
          borderRadius: 'var(--r-xl)', padding: '14px 18px',
          fontSize: 14, marginBottom: 24, fontWeight: 600,
          display: 'flex', gap: 10, alignItems: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
        }}>
          <LogIn size={18} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {/* Phone Number / Email */}
          <div>
            <label
              htmlFor="loginIdentifier"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              {isAdminMode ? 'Admin Email Address' : 'Local WhatsApp Number'}
            </label>
            {isAdminMode ? (
              <div style={{ position: 'relative' }}>
                <input
                  id="loginIdentifier"
                  type="email"
                  required
                  placeholder="e.g. admin@aloaye.tech"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  onFocus={() => setFocusedInput('loginIdentifier')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{
                    paddingLeft: 44,
                    borderColor: focusedInput === 'loginIdentifier' ? 'var(--primary)' : 'var(--border)'
                  }}
                  autoComplete="username"
                />
                <Mail size={18} style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedInput === 'loginIdentifier' ? 'var(--primary)' : 'var(--text-faint)',
                    transition: 'color var(--t-fast)'
                  }} />
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: focusedInput === 'loginIdentifier' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface)',
                boxShadow: focusedInput === 'loginIdentifier' ? '0 0 0 3px var(--primary-glow)' : 'none',
                transition: 'all var(--t-fast)',
                position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0 14px',
                    height: '100%',
                    minHeight: 46,
                    background: 'none',
                    border: 'none',
                    borderRight: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 15,
                    color: 'var(--text)',
                    fontWeight: 600,
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
                </button>
                <input
                  id="loginIdentifier"
                  type="tel"
                  required
                  placeholder="803 123 4567"
                  value={loginIdentifier}
                  onChange={e => handleMerchantPhoneChange(e.target.value)}
                  onFocus={() => setFocusedInput('loginIdentifier')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    flex: 1,
                    padding: '13px 14px',
                    border: 'none',
                    fontSize: 15,
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    minWidth: 0,
                  }}
                  autoComplete="tel"
                />
                {isCountryDropdownOpen && (
                  <div className="glass animate-scale-in" style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    width: 280,
                    maxHeight: 250,
                    overflowY: 'auto',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    padding: '6px 0'
                  }}>
                    {countries.map((c, idx) => (
                      <button
                        key={c.code}
                        type="button"
                        onMouseEnter={() => setHoveredCountryIndex(idx)}
                        onMouseLeave={() => setHoveredCountryIndex(null)}
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsCountryDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 14px',
                          background: selectedCountry.code === c.code
                            ? 'var(--primary-light)'
                            : hoveredCountryIndex === idx
                              ? 'var(--bg-2)'
                              : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          textAlign: 'left',
                          color: selectedCountry.code === c.code ? 'var(--primary)' : 'var(--text)',
                          fontWeight: selectedCountry.code === c.code ? 750 : 600,
                          transition: 'background var(--t-fast)'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                          {c.dialCode}
                          {selectedCountry.code === c.code ? <Check size={13} color="var(--primary)" /> : null}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
              {isAdminMode
                ? 'Enter your registered administrator email address'
                : `Select ${selectedCountry.dialCode} from the dropdown, then enter only your local number. Do not type the country code.`
              }
            </span>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Enter your account password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                style={{
                  paddingLeft: 44,
                  paddingRight: 48,
                  borderColor: focusedInput === 'password' ? 'var(--primary)' : 'var(--border)'
                }}
                autoComplete="current-password"
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'password' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none', background: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-faint)', padding: 4,
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                suppressHydrationWarning
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary clickable"
          style={{
            padding: '16px',
            fontSize: 16,
            borderRadius: 'var(--r-xl)',
            marginTop: 8,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: 'var(--shadow-primary)'
          }}
          id="login-btn"
        >
          {mounted && loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          <span>
            {!mounted ? 'Access Dashboard' : (loading ? 'Signing In...' : (isAdminMode ? 'Access Admin Portal' : 'Access Dashboard'))}
          </span>
          {mounted && !loading ? (
            <ArrowRight size={18} />
          ) : null}
        </button>

        {isAdminMode ? (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 8 }}>
            Looking for merchant login?{' '}
            <a href={merchantLoginUrl} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Go to merchant login
            </a>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 8 }}>
            Don't have a store yet?{' '}
            <a href="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Create storefront
            </a>
          </p>
        )}

      </form>
    </div>
  );
}

export default function LoginPage() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [merchantLoginUrl, setMerchantLoginUrl] = useState('/login');

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const isLocal = hostname.endsWith('localhost') || hostname.endsWith('lvh.me');
    let subdomain = '';
    if (isLocal) {
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== 'lvh') {
        subdomain = parts[0];
      }
    } else {
      if (parts.length >= 3 && parts[0] !== 'www') {
        subdomain = parts[0];
      }
    }
    if (subdomain === 'admin') {
      setIsAdminMode(true);
      // Build the merchant-facing login URL (strip the admin. subdomain)
      const port = window.location.port;
      const mainHost = hostname.replace('admin.', '');
      setMerchantLoginUrl(`${window.location.protocol}//${mainHost}${port ? `:${port}` : ''}/login`);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'row',
      width: '100%'
    }}>
      {/* LEFT PANEL: Premium value prop (visible on desktop) */}
      <div className="left-hero-panel" style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Soft floating blur shapes */}
        <div style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-10%',
          right: '-10%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          bottom: '-5%',
          left: '-5%',
          filter: 'blur(60px)'
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-heading)',
            fontSize: 24,
            fontWeight: 900,
            marginBottom: 48,
            color: '#fff'
          }}>
            <Store size={26} style={{ strokeWidth: 2.5 }} />
            <span>aloaye</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 24,
            letterSpacing: '-0.03em'
          }}>
            {isAdminMode ? 'Welcome Back to Your Admin Control Center.' : 'Welcome Back to Your Store Headquarters.'}
          </h2>

          <p style={{
            fontSize: 17,
            opacity: 0.9,
            lineHeight: 1.6,
            marginBottom: 40,
            fontWeight: 500
          }}>
            {isAdminMode
              ? 'Sign in to monitor system performance, manage merchants, resolve support queries, and configure global platform settings.'
              : 'Sign in to manage your orders, tweak storefront settings, create products with ChatGPT AI descriptions, and interact with prospective buyers in real time.'
            }
          </p>

          {/* Quick specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(isAdminMode
              ? [
                'Monitor real-time platform transactions',
                'Manage storefront statuses & active plans',
                'Configure application-wide settings & APIs',
                'Audit system activity & user accounts'
              ]
              : [
                'Track visitor views & conversion rates',
                'Update order shipping & payment statuses',
                'Generate ChatGPT AI product descriptions',
                'Manage storefront details in real-time'
              ]
            ).map(spec => (
              <div key={spec} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={14} style={{ color: '#fff', strokeWidth: 3 }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form card */}
      <div className="right-form-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
      }}>
        {/* Subtle decorative blob */}
        <div style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          zIndex: -1,
          top: '30%',
          right: '5%',
          filter: 'blur(40px)'
        }} />

        <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
              <div className="spinner spinner-primary" style={{ width: 36, height: 36 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading storefront dashboard login...</span>
            </div>
          }>
            <LoginFormContent isAdminMode={isAdminMode} merchantLoginUrl={merchantLoginUrl} />
          </Suspense>
        </div>
      </div>

      {/* Styled JSX/Responsive rules for pure CSS hero hidden logic */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .left-hero-panel {
            display: none !important;
          }
          .right-form-panel {
            padding: 32px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
