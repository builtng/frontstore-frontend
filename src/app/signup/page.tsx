'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Globe, Copy, CheckCircle2, Lock,
  Share2, Store, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, User, Phone, Check, ShieldCheck, Mail
} from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { RESERVED_SUBDOMAINS } from '../../utils/reservedKeywords';
import { businessPersonas } from '../../utils/businessPersonas';

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

function SignupFormContent({ appName, registrationMethod = 'email' }: { appName: string; registrationMethod?: 'email' | 'whatsapp' | 'both' }) {
  const searchParams = useSearchParams();

  const [storeName, setStoreName] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('general-store');
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPersonaDetails = businessPersonas.find(persona => persona.id === selectedPersona) || businessPersonas[0];
  const businessPersonaOptions = businessPersonas.map(persona => ({
    value: persona.id,
    label: persona.name,
    sublabel: `${persona.persona} · ${persona.templateName} · ${persona.summary}`,
  }));

  const isEmailRequired = registrationMethod === 'email' || registrationMethod === 'both';
  const isPhoneRequired = registrationMethod === 'whatsapp' || registrationMethod === 'both';

  // successData intentionally does NOT contain the password field
  const [successData, setSuccessData] = useState<{
    storeName: string;
    username: string;
    storeUrl: string;
  } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  // Detect host suffix
  useEffect(() => {
    setMounted(true);
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

    const isEmailRequired = registrationMethod === 'email' || registrationMethod === 'both';
    const isPhoneRequired = registrationMethod === 'whatsapp' || registrationMethod === 'both';

    if (isEmailRequired && !email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (isPhoneRequired && !phone.trim()) {
      setError('Please enter your WhatsApp phone number.');
      return;
    }
    if (!storeName || !username || !name || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    let normalizedPhone = undefined;
    let countryDialCode = undefined;

    if (phone.trim()) {
      const normalizePhone = (input: string, dialCode: string) => {
        const cleanDial = dialCode.replace(/[^\d]/g, '');
        let cleaned = input.replace(/[^\d]/g, '');
        if (cleaned.startsWith(cleanDial)) {
          cleaned = cleaned.slice(cleanDial.length);
        }
        cleaned = cleaned.replace(/^0+/, '');
        return `+${cleanDial}${cleaned}`;
      };
      normalizedPhone = normalizePhone(phone, selectedCountry.dialCode);
      countryDialCode = selectedCountry.dialCode;
      const localPhoneDigits = normalizedPhone.replace(/[^\d]/g, '').slice(selectedCountry.dialCode.replace(/[^\d]/g, '').length);
      if (localPhoneDigits.length < 7) {
        setError('Please enter a valid WhatsApp phone number.');
        return;
      }
    }

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
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          username: cleanUsername,
          name,
          phone_number: normalizedPhone,
          country_dial_code: countryDialCode,
          business_persona: selectedPersona,
          password,
          email: email || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Registration failed. Try a different username or email.');
      }

      // Store credentials locally for automatic login
      if (typeof window !== 'undefined' && json.data?.token) {
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data.user));
        localStorage.setItem('store', JSON.stringify(json.data.store));
      }

      const storeUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${cleanUsername}`
        : `https://frontstore.app/${cleanUsername}`;

      setSuccessData({
        storeName: json.data?.store?.store_name ?? storeName,
        username: cleanUsername,
        storeUrl,
      });

      // Wipe sensitive state from memory immediately
      setPassword('');

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
            <CheckCircle2 size={40} className="pulse" />
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
            <ArrowRight size={18} /> Go to Web Dashboard
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
          <img 
            src="/logo.png" 
            alt="Logo"
            width={28}
            height={28}
            style={{
              width: 28,
              height: 28,
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <span>{appName}</span>
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

          {/* Business Type */}
          <div>
            <label
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              Business Type
            </label>
            <SearchableSelect
              options={businessPersonaOptions}
              value={selectedPersona}
              onChange={setSelectedPersona}
              placeholder="Select your business type"
              searchPlaceholder="Search business types, templates, or examples..."
              style={{ zIndex: 20 }}
            />
            <div
              style={{
                marginTop: 10,
                padding: '12px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-2)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 10.5, color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>
                  {selectedPersonaDetails.persona} · {selectedPersonaDetails.templateName}
                </span>
                <strong style={{ display: 'block', color: 'var(--text)', fontSize: 13.5, marginBottom: 3 }}>
                  {selectedPersonaDetails.name}
                </strong>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11.5, lineHeight: 1.45 }}>
                  {selectedPersonaDetails.summary}
                </span>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 10.5,
                  fontWeight: 900,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                  borderRadius: 999,
                  padding: '5px 8px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Template
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 8 }}>
              We will activate the best default template and storefront copy for this business type. You can change everything later in your dashboard.
            </span>
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
              <span style={{ padding: '0 0 0 44px', color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', userSelect: 'none' }}>
                frontstore.app/
              </span>
              <input
                id="store-username"
                type="text"
                required
                value={username}
                onFocus={() => setFocusedInput('store-username')}
                onBlur={() => setFocusedInput(null)}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="yourname"
                style={{
                  flex: 1,
                  border: 'none',
                  padding: '14px 14px 14px 0',
                  fontSize: 15,
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text)',
                  minWidth: 0,
                }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Live Link Preview Nudge */}
            {username && (
              <span style={{ fontSize: 11.5, color: 'var(--primary)', display: 'block', marginTop: 6, fontWeight: 700 }}>
                Live link: frontstore.app/{username.toLowerCase()}
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
              {isPhoneRequired ? 'WhatsApp Number' : 'WhatsApp Number (Optional)'}
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
                required={isPhoneRequired}
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
              {isEmailRequired ? 'Email Address' : 'Email Address (Optional)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                required={isEmailRequired}
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
          By launching your store, you agree to {appName}&apos;s{' '}
          <a href="/terms" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>
          Just here to shop, not sell?{' '}
          <a href="/buyer/register" style={{ color: 'var(--text-muted)', fontWeight: 700, textDecoration: 'underline' }}>
            Create a buyer account
          </a>
        </p>

      </form>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [appName, setAppName] = useState('Front Store');
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'whatsapp' | 'both'>('email');

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.app_name) setAppName(json.data.app_name);
        if (json.data?.registration_method) setRegistrationMethod(json.data.registration_method);
      } catch {
        // Keep the local fallback when settings cannot be loaded.
      }
    };
    loadPublicSettings();
  }, []);

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
            <img 
              src="/logo.png" 
              alt="Logo"
              width={26}
              height={26}
              style={{
                width: 26,
                height: 26,
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'brightness(0) invert(1)',
              }}
            />
            <span>{appName}</span>
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
            Create a fast, responsive mobile catalog for your business. Accept orders instantly, manage payments, and chat with customers directly. No commissions, no complexity.
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
              &quot;Setting up my storefront on {appName} completely changed how I deal with online orders. Now customers see everything I have, choose their sizes, and order automatically on my WhatsApp.&quot;
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
            <SignupFormContent appName={appName} registrationMethod={registrationMethod} />
          </Suspense>
        </div>
      </div>

      {/* Styled JSX/Responsive rules for pure CSS hero hidden logic */}
      <style>{`
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
