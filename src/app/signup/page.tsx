'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Sparkles, Globe, Copy, CheckCircle2, Smartphone, Lock, Lightbulb,
  Share2, Store, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, User, Phone, Check, ShieldCheck, Mail
} from 'lucide-react';
import { RESERVED_SUBDOMAINS } from '../../utils/reservedKeywords';

// ── Password strength helper ─────────────────────────────────────────────────

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'var(--danger)' };
  if (score <= 3) return { score, label: 'Fair', color: 'var(--accent)' };
  return { score, label: 'Strong', color: 'var(--primary)' };
}

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

const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { country: countries[0], local: '' };
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const cleaned = fullPhone.replace(/[^\d+]/g, '');
  for (const c of sortedCountries) {
    if (cleaned.startsWith(c.dialCode)) {
      return { country: c, local: cleaned.slice(c.dialCode.length) };
    }
    const dialWithoutPlus = c.dialCode.slice(1);
    if (cleaned.startsWith(dialWithoutPlus)) {
      return { country: c, local: cleaned.slice(dialWithoutPlus.length) };
    }
  }
  return { country: countries[0], local: cleaned };
};

// ── Main form component ───────────────────────────────────────────────────────

function SignupFormContent() {
  const searchParams = useSearchParams();

  const [storeName, setStoreName] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [hostSuffix, setHostSuffix] = useState('.aloaye.tech');
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // successData intentionally does NOT contain the password field
  const [successData, setSuccessData] = useState<{
    storeName: string;
    username: string;
    storeUrl: string;
  } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';

  // Detect host suffix
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const clean = window.location.host.replace(/^www\./, '');
      setHostSuffix(`.${clean}`);
    }
  }, []);

  // Auto-detect country code from IP
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const found = countries.find(c => c.code === data.country_code);
          if (found) {
            setSelectedCountry(found);
          }
        }
      } catch (e) {
        console.warn('Country auto-detection failed, using default:', e);
      }
    };
    detectCountry();
  }, []);

  // Close dropdown on click outside
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

  // Pre-fill from URL param
  useEffect(() => {
    const q = searchParams.get('username');
    if (q) {
      const cleaned = q.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      setUsername(cleaned);
      const guessed = cleaned
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setStoreName(guessed);
    }
  }, [searchParams]);

  const pwStrength = password.length > 0 ? getPasswordStrength(password) : null;

  // Track active input focus for premium interactive styling
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName || !username || !name || !phone.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const normalizePhone = (input: string, dialCode: string) => {
      const cleanDial = dialCode.replace(/[^\d]/g, '');
      let cleaned = input.replace(/[^\d]/g, '');
      if (cleaned.startsWith(cleanDial)) {
        cleaned = cleaned.slice(cleanDial.length);
      }
      cleaned = cleaned.replace(/^0+/, '');
      return `+${cleanDial}${cleaned}`;
    };
    const normalizedPhone = normalizePhone(phone, selectedCountry.dialCode);

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      setError('Store username must be at least 3 characters.');
      return;
    }
    if (RESERVED_SUBDOMAINS.includes(cleanUsername)) {
      setError(`The username "${cleanUsername}" is reserved.`);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          username: cleanUsername,
          name,
          phone_number: normalizedPhone,
          password,
          email: email || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Registration failed. Try a different username or phone number.');
      }

      // Store credentials locally for automatic login
      if (typeof window !== 'undefined' && json.data?.token) {
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data.user));
        localStorage.setItem('store', JSON.stringify(json.data.store));
      }

      // Build store URL
      let storeUrl = '';
      if (typeof window !== 'undefined') {
        const { protocol, host } = window.location;
        storeUrl = host.includes('localhost')
          ? `${protocol}//${cleanUsername}.localhost:3000`
          : `${protocol}//${cleanUsername}.${host.replace(/^www\./, '')}`;
      }

      setSuccessData({
        storeName: json.data?.store?.store_name ?? storeName,
        username: cleanUsername,
        storeUrl,
      });

      // Wipe sensitive state from memory immediately
      setPassword('');

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────

  if (successData) {
    return (
      <div className="card glass fade-in" style={{
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        maxWidth: 500,
        width: '100%',
        margin: '20px auto',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--r-2xl)'
      }}>

        {/* Celebration */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
          }}>
            <Sparkles size={40} className="pulse" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Store Created Successfully!
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6 }}>
            Congratulations! <strong style={{ color: 'var(--primary)' }}>{successData.storeName}</strong> is now live on the internet.
          </p>
        </div>

        {/* Store URL Box */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.05))',
          border: '1.5px dashed var(--primary)',
          borderRadius: 'var(--r-xl)',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            <Globe size={12} /> Your Live Digital Storefront
          </div>

          <a
            href={successData.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--primary-dark)',
              textDecoration: 'underline',
              wordBreak: 'break-all',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {successData.storeUrl.replace(/^https?:\/\//, '')}
          </a>

          <button
            onClick={() => {
              navigator.clipboard.writeText(successData.storeUrl);
              toast.success('Storefront link copied! 📋');
            }}
            id="copy-url-btn"
            className="btn btn-outline clickable"
            style={{
              marginTop: 16,
              padding: '10px 16px',
              fontSize: 13,
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 'var(--r-lg)',
              background: 'var(--surface)',
              fontWeight: 700
            }}
          >
            <Copy size={14} /> Copy Store Link
          </button>
        </div>

        {/* Action Flow Guidance */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
            <Smartphone size={18} style={{ color: 'var(--primary)' }} /> Next Step: Manage on the App
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Download the <strong>aloaye Store OS</strong> app on your Android or iOS device to start uploading products, tracking orders, and customizing your catalogs in seconds.
          </p>

          <div style={{
            background: 'var(--bg-2)',
            borderRadius: 'var(--r-lg)',
            padding: '14px 16px',
            fontSize: 13.5,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            borderLeft: '4px solid var(--primary)'
          }}>
            <Lock size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: 'var(--text-2)', lineHeight: 1.55 }}>
              Use your <strong>WhatsApp phone number</strong> and the <strong>password you just set</strong> to log in securely.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-muted)', alignItems: 'center' }}>
            <Lightbulb size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>Need support? Simply reach out directly to us on WhatsApp inside the app.</span>
          </div>
        </div>

        {/* WhatsApp Nudge */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          borderRadius: 'var(--r-xl)',
          padding: 24,
          color: '#fff',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={16} /> Share & Start Selling
          </p>
          <p style={{ fontSize: 13.5, opacity: 0.9, marginBottom: 18, lineHeight: 1.5 }}>
            Put your store link on your WhatsApp Status or Instagram Bio to receive your first order today!
          </p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: successData.storeName,
                  text: `Visit my new store: ${successData.storeName}!`,
                  url: successData.storeUrl,
                });
              } else {
                navigator.clipboard.writeText(successData.storeUrl);
              }
            }}
            className="btn clickable"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '12px 20px',
              width: '100%',
              borderRadius: 'var(--r-lg)',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backdropFilter: 'blur(8px)'
            }}
          >
            <Share2 size={15} /> Share Store Link
          </button>
        </div>

        {/* Primary Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href="/dashboard"
            className="btn btn-primary clickable"
            style={{ padding: '16px', fontSize: 15, textDecoration: 'none', borderRadius: 'var(--r-lg)', fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Sparkles size={18} /> Go to Web Dashboard
          </a>
          <a
            href={successData.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline clickable"
            style={{ padding: '14px', fontSize: 14, textDecoration: 'none', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Store size={18} /> View Your Storefront
          </a>
          <a
            href="/"
            className="btn btn-ghost clickable"
            style={{ padding: '12px', fontSize: 13.5, textDecoration: 'none', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Go Back Home
          </a>
        </div>

      </div>
    );
  }

  // ── SIGNUP FORM ─────────────────────────────────────────────────────────────

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
          Create Your Storefront
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5 }}>
          Launch your digital shop and start taking orders directly on WhatsApp in under 2 minutes.
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
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Visual elegant step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[
          { label: 'Store Info', check: storeName && username },
          { label: 'Your Details', check: name && phone },
          { label: 'Security', check: password.length >= 6 }
        ].map((step, i) => (
          <div key={step.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              height: 4, width: '100%', borderRadius: 99,
              background: step.check ? 'var(--primary)' : (i === 0 ? 'var(--primary)' : 'var(--border)'),
              opacity: step.check ? 1 : (i === 0 ? 1 : 0.6),
              transition: 'all 0.3s var(--ease)'
            }} />
            <span style={{
              fontSize: 11,
              color: step.check ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textAlign: 'center'
            }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Section 1: Store Setup */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
            <div style={{ background: 'var(--primary-light)', padding: 6, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
              <Store size={16} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Store Information</h3>
          </div>

          {/* Store Name */}
          <div>
            <label
              htmlFor="store-name"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              Store Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="store-name"
                type="text"
                required
                placeholder="e.g. Chioma's Fashion, Lagos Tech Hub"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                onFocus={() => setFocusedInput('store-name')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                style={{
                  paddingLeft: 44,
                  borderColor: focusedInput === 'store-name' ? 'var(--primary)' : 'var(--border)'
                }}
                autoComplete="organization"
              />
              <Store size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'store-name' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
            </div>
          </div>

          {/* Store URL */}
          <div>
            <label
              htmlFor="store-username"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              Store Link Name
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: focusedInput === 'store-username' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
              borderRadius: 'var(--r-md)',
              background: 'var(--surface)',
              boxShadow: focusedInput === 'store-username' ? '0 0 0 3px var(--primary-glow)' : 'none',
              transition: 'all var(--t-fast)',
              position: 'relative'
            }}>
              <Globe size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'store-username' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
              <input
                id="store-username"
                type="text"
                required
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                onFocus={() => setFocusedInput('store-username')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  flex: 1,
                  padding: '13px 4px 13px 44px',
                  border: 'none',
                  fontSize: 15,
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text)',
                  minWidth: 0,
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <span style={{ padding: '0 14px 0 0', color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', userSelect: 'none' }}>
                {hostSuffix}
              </span>
            </div>

            {/* Live Link Preview Nudge */}
            {username && (
              <span style={{ fontSize: 11.5, color: 'var(--primary)', display: 'block', marginTop: 6, fontWeight: 700 }}>
                Live link: {username.toLowerCase()}{hostSuffix}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 4 }}>
              Used to access your storefront · Letters, numbers & dashes only
            </span>
          </div>
        </div>

        {/* Section 2: Contact Info */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
            <div style={{ background: 'var(--primary-light)', padding: 6, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
              <User size={16} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Account & WhatsApp Details</h3>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="full-name"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="full-name"
                type="text"
                required
                placeholder="e.g. Babajide Kolawole"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocusedInput('full-name')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                style={{
                  paddingLeft: 44,
                  borderColor: focusedInput === 'full-name' ? 'var(--primary)' : 'var(--border)'
                }}
                autoComplete="name"
              />
              <User size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'full-name' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              WhatsApp Number
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: focusedInput === 'phone' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
              borderRadius: 'var(--r-md)',
              background: 'var(--surface)',
              boxShadow: focusedInput === 'phone' ? '0 0 0 3px var(--primary-glow)' : 'none',
              transition: 'all var(--t-fast)',
              position: 'relative'
            }}>
              {/* Country Code Trigger Button */}
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

              {/* Real Phone Input */}
              <input
                id="phone"
                type="tel"
                required
                placeholder="e.g. 803 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setFocusedInput('phone')}
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

              {/* Dropdown Menu */}
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
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
              Enter your local number (e.g. 0808 943 7483). Country code is added automatically.
            </span>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              Email Address (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                placeholder="e.g. merchant@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                style={{
                  paddingLeft: 44,
                  borderColor: focusedInput === 'email' ? 'var(--primary)' : 'var(--border)'
                }}
                autoComplete="email"
              />
              <Mail size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'email' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
              For receiving shop performance reports & order alerts.
            </span>
          </div>
        </div>

        {/* Section 3: Password */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
            <div style={{ background: 'var(--primary-light)', padding: 6, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
              <Lock size={16} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Account Security</h3>
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Choose a secure password"
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
                autoComplete="new-password"
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

            {/* Strength meter */}
            {pwStrength && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: 4, borderRadius: 99,
                        background: i <= pwStrength.score ? pwStrength.color : 'var(--border)',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: pwStrength.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {pwStrength.label} Security
                </span>
              </div>
            )}
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
          id="create-store-btn"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          <span>
            {loading ? 'Launching Your Store...' : 'Create My Live Store'}
          </span>
          {!loading ? (
            <ArrowRight size={18} />
          ) : null}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          By launching your store, you agree to aloaye&apos;s{' '}
          <a href="/terms" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>

      </form>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
        const port = window.location.port;
        const mainHost = hostname.replace('admin.', '');
        const targetUrl = `${window.location.protocol}//${mainHost}${port ? `:${port}` : ''}/signup`;
        window.location.replace(targetUrl);
      }
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
            Sell to millions directly on WhatsApp.
          </h2>

          <p style={{
            fontSize: 17,
            opacity: 0.9,
            lineHeight: 1.6,
            marginBottom: 40,
            fontWeight: 500
          }}>
            Create a fast, responsive mobile catalog for your business. Accept orders instantly, manage payments, and chat with customers directly. No high commissions, no complexity.
          </p>

          {/* Quick specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'Direct-to-WhatsApp order routing',
              'Zero setup fees or listing commissions',
              'Sleek, responsive premium checkout screens',
              'Lightning-fast page loading across all networks'
            ].map(spec => (
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

          {/* Testimonial preview */}
          <div style={{
            marginTop: 48,
            padding: 20,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--r-xl)',
            backdropFilter: 'blur(8px)'
          }}>
            <p style={{ fontSize: 14.5, fontStyle: 'italic', opacity: 0.95, lineHeight: 1.6, marginBottom: 12 }}>
              &quot;Setting up my storefront on aloaye completely changed how I deal with online orders. Now customers see everything I have, choose their sizes, and order automatically on my WhatsApp.&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                FA
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Funmi Alao</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Fashion Retailer, Lagos</div>
              </div>
            </div>
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
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading storefront creator...</span>
            </div>
          }>
            <SignupFormContent />
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
