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

function SignupFormContent({ appName, registrationMethod = 'whatsapp' }: { appName: string; registrationMethod?: 'email' | 'whatsapp' | 'both' }) {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [storeName, setStoreName] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('general-store');
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number | null>(null);
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPersonaDetails = businessPersonas.find(persona => persona.id === selectedPersona) || businessPersonas[0];
  const businessPersonaOptions = businessPersonas.map(persona => ({
    value: persona.id,
    label: persona.name,
    sublabel: `${persona.persona} · ${persona.templateName} · ${persona.summary}`,
  }));

  const [successData, setSuccessData] = useState<{
    storeName: string;
    username: string;
    storeUrl: string;
  } | null>(null);

  const [referredBy, setReferredBy] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
      setIsUsernameManuallyEdited(true);
    }
  }, [searchParams]);

  // Load B2B referral username
  useEffect(() => {
    const refParam = searchParams.get('ref') || localStorage.getItem('referrer_username');
    if (refParam) {
      setReferredBy(refParam);
    }
  }, [searchParams]);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Helper to normalize phone
  const getNormalizedPhone = () => {
    const cleanDial = selectedCountry.dialCode.replace(/[^\d]/g, '');
    let cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith(cleanDial)) {
      cleaned = cleaned.slice(cleanDial.length);
    }
    cleaned = cleaned.replace(/^0+/, '');
    return `+${cleanDial}${cleaned}`;
  };

  // ── Step 1 Submit (Email + Store Info → Send Email OTP) ──────────────────────
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!storeName.trim()) {
      setError('Please enter your Store Name.');
      return;
    }
    if (!username.trim()) {
      setError('Please choose a Store Link Name.');
      return;
    }

    // Token Saver: Avoid resending if email hasn't changed
    if (lastSentEmail === email.trim().toLowerCase()) {
      setCurrentStep(2);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/v1/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          store_name: storeName.trim(),
          username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to send verification code. Please check your email.');
      }

      if (json.is_new_user === false) {
        const errorMsg = 'An account with this email already exists. Please log in instead.';
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }

      toast.success(json.message || 'Verification code sent to your email! Check your inbox.');
      setLastSentEmail(email.trim().toLowerCase());
      setResendCooldown(60);
      setCurrentStep(2);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to resend OTP via email
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/v1/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          store_name: storeName.trim(),
          username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to resend code.');
      }

      toast.success('A new verification code has been sent to your email!');
      setLastSentEmail(email.trim().toLowerCase());
      setResendCooldown(60);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 Submit (Verify Email OTP) ─────────────────────────────────────────
  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const verifyRes = await fetch(`${API_URL}/v1/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp,
          store_name: storeName.trim(),
          username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        })
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyJson.message || 'Incorrect verification code. Please check and try again.');
      }

      // Existing user → log in immediately
      if (!verifyJson.is_new_user) {
        if (typeof window !== 'undefined' && verifyJson.token) {
          localStorage.setItem('token', verifyJson.token);
          localStorage.setItem('user', JSON.stringify(verifyJson.data?.user));
          localStorage.setItem('store', JSON.stringify(verifyJson.data?.user?.store));
        }
        toast.success(`Welcome back, ${verifyJson.data?.user?.name || 'Merchant'}!`);
        window.location.replace('/dashboard');
        return;
      }

      // New user → save setup token and move to step 3 (WhatsApp phone)
      setSetupToken(verifyJson.setup_token);
      toast.success('Email verified! Now add your WhatsApp number.');
      setCurrentStep(3);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 Submit (WhatsApp + Name → Complete Setup) ─────────────────────────
  const handleSubmitStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your WhatsApp phone number.');
      return;
    }

    const normalizedPhone = getNormalizedPhone();
    const localPhoneDigits = normalizedPhone.replace(/[^\d]/g, '').slice(selectedCountry.dialCode.replace(/[^\d]/g, '').length);
    if (localPhoneDigits.length < 7) {
      setError('Please enter a valid WhatsApp phone number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const setupRes = await fetch(`${API_URL}/v1/auth/complete-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          setup_token: setupToken,
          name: name.trim(),
          store_name: storeName.trim(),
          username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
          business_persona: selectedPersona,
          email: email.trim() || undefined,
          phone_number: normalizedPhone,
          country_dial_code: selectedCountry.dialCode,
          referred_by: referredBy || undefined
        })
      });

      const setupJson = await setupRes.json();
      if (!setupRes.ok) {
        throw new Error(setupJson.message || 'Failed to complete store setup. Please check your inputs.');
      }

      // Store credentials locally for automatic login
      if (typeof window !== 'undefined' && setupJson.token) {
        localStorage.setItem('token', setupJson.token);
        localStorage.setItem('user', JSON.stringify(setupJson.data?.user));
        localStorage.setItem('store', JSON.stringify(setupJson.data?.store));
      }

      toast.success('Store created successfully! Redirecting to dashboard...');
      window.location.replace('/dashboard');

    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            <Globe size={12} /> Your Live Digital Storefront
          </div>
          <a
            href={successData.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-dark)', textDecoration: 'underline', wordBreak: 'break-all', fontFamily: 'var(--font-heading)' }}
          >
            {successData.storeUrl.replace(/^https?:\/\//, '')}
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText(successData.storeUrl); toast.success('Storefront link copied! 📋'); }}
            id="copy-url-btn"
            className="btn btn-outline clickable"
            style={{ marginTop: 16, padding: '10px 16px', fontSize: 13, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 'var(--r-lg)', background: 'var(--surface)', fontWeight: 700 }}
          >
            <Copy size={14} /> Copy Store Link
          </button>
        </div>

        {/* Primary Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href="/dashboard" className="btn btn-primary clickable" style={{ padding: '16px', fontSize: 15, textDecoration: 'none', borderRadius: 'var(--r-lg)', fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ArrowRight size={18} /> Go to Web Dashboard
          </a>
          <a href={successData.storeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline clickable" style={{ padding: '14px', fontSize: 14, textDecoration: 'none', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Store size={18} /> View Your Storefront
          </a>
          <a href="/" className="btn btn-ghost clickable" style={{ padding: '12px', fontSize: 13.5, textDecoration: 'none', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Go Back Home
          </a>
        </div>

      </div>
    );
  }

  // ── SIGNUP FORM ─────────────────────────────────────────────────────────────

  const stepOnSubmit = currentStep === 1 ? handleSubmitStep1 : currentStep === 2 ? handleSubmitStep2 : handleSubmitStep3;

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
            style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
          />
          <span>{appName}</span>
        </a>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Create Your Storefront
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5 }}>
          Launch your digital shop and start taking orders in under 2 minutes.
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

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[
          { label: '1. Email & Store', active: currentStep === 1, done: currentStep > 1 },
          { label: '2. Verify Code', active: currentStep === 2, done: currentStep > 2 },
          { label: '3. WhatsApp', active: currentStep === 3, done: false },
        ].map((step) => (
          <div key={step.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              height: 4, width: '100%', borderRadius: 99,
              background: step.done || step.active ? 'var(--primary)' : 'var(--border)',
              opacity: step.done || step.active ? 1 : 0.6,
              transition: 'all 0.3s var(--ease)'
            }} />
            <span style={{
              fontSize: 10,
              color: step.done || step.active ? 'var(--primary)' : 'var(--text-muted)',
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
      <form onSubmit={stepOnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── STEP 1: Email + Store Info ── */}
        {currentStep === 1 && (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
              <div style={{ background: 'var(--primary-light)', padding: 6, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
                <Mail size={16} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Store & Email Setup</h3>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email-signup" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Email Address <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email-signup"
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{ paddingLeft: 44, borderColor: focusedInput === 'email' ? 'var(--primary)' : 'var(--border)' }}
                  autoComplete="email"
                />
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'email' ? 'var(--primary)' : 'var(--text-faint)', transition: 'color var(--t-fast)' }} />
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                We will send a verification code to this email.
              </span>
            </div>

            {/* Store Name */}
            <div>
              <label htmlFor="store-name" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Store Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="store-name"
                  type="text"
                  required
                  placeholder="e.g. Chioma's Fashion, Eko Goods"
                  value={storeName}
                  onChange={e => {
                    const newName = e.target.value;
                    setStoreName(newName);
                    if (!isUsernameManuallyEdited) {
                      const slug = newName
                        .toLowerCase()
                        .replace(/[^a-z0-9\s_-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                      setUsername(slug);
                    }
                  }}
                  onFocus={() => setFocusedInput('store-name')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{ paddingLeft: 44, borderColor: focusedInput === 'store-name' ? 'var(--primary)' : 'var(--border)' }}
                  autoComplete="organization"
                />
                <Store size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'store-name' ? 'var(--primary)' : 'var(--text-faint)', transition: 'color var(--t-fast)' }} />
              </div>
            </div>

            {/* Store URL */}
            <div>
              <label htmlFor="store-username" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Store Link Name <span style={{ color: 'var(--danger)' }}>*</span>
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
                <Globe size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'store-username' ? 'var(--primary)' : 'var(--text-faint)', transition: 'color var(--t-fast)' }} />
                <span style={{ padding: '0 0 0 44px', color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', userSelect: 'none' }}>
                  frontstore.ng/
                </span>
                <input
                  id="store-username"
                  type="text"
                  required
                  value={username}
                  onFocus={() => setFocusedInput('store-username')}
                  onBlur={() => setFocusedInput(null)}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    setUsername(val);
                    setIsUsernameManuallyEdited(val !== '');
                  }}
                  placeholder="yourname"
                  style={{ flex: 1, border: 'none', padding: '14px 14px 14px 0', fontSize: 15, outline: 'none', background: 'transparent', color: 'var(--text)', minWidth: 0 }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {username && (
                <span style={{ fontSize: 11.5, color: 'var(--primary)', display: 'block', marginTop: 6, fontWeight: 700 }}>
                  Live link: frontstore.ng/{username.toLowerCase()}
                </span>
              )}
            </div>

            {/* Business Category */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Business Category
              </label>
              <SearchableSelect
                options={businessPersonaOptions}
                value={selectedPersona}
                onChange={setSelectedPersona}
                placeholder="Select your business category"
                searchPlaceholder="Search category..."
                style={{ zIndex: 20 }}
              />
            </div>

            {/* Submit Step 1 */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary clickable"
              style={{ padding: '16px', fontSize: 16, borderRadius: 'var(--r-xl)', marginTop: 4, fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-primary)', width: '100%' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
              {!loading ? <ArrowRight size={18} /> : null}
            </button>
          </div>
        )}

        {/* ── STEP 2: Verify Email OTP ── */}
        {currentStep === 2 && (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-xl)' }}>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => { setError(null); setCurrentStep(1); }}
              style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', padding: '4px 0' }}
            >
              ← Edit Email / Store
            </button>

            {/* Info Banner */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.05))', color: 'var(--primary-dark)', padding: '14px 18px', borderRadius: 'var(--r-xl)', fontSize: 14, fontWeight: 700, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, color: 'var(--primary)' }} />
              <span>Check your inbox at <strong>{email}</strong> for a 6-digit verification code.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
              <div style={{ background: 'var(--primary-light)', padding: 6, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
                <ShieldCheck size={16} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Verify Your Email</h3>
            </div>

            {/* OTP Code */}
            <div>
              <label htmlFor="otp-code" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Verification Code (OTP)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="otp-code"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="\d{6}"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setFocusedInput('otp-code')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{ paddingLeft: 44, borderColor: focusedInput === 'otp-code' ? 'var(--primary)' : 'var(--border)', letterSpacing: otp ? '0.3em' : 'normal', fontSize: otp ? 18 : 15, fontWeight: otp ? 'bold' : 'normal' }}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'otp-code' ? 'var(--primary)' : 'var(--text-faint)', transition: 'color var(--t-fast)' }} />
              </div>
              {/* Resend link */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                {resendCooldown > 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>

            {/* Submit Step 2 */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary clickable"
              style={{ padding: '16px', fontSize: 16, borderRadius: 'var(--r-xl)', marginTop: 4, fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-primary)', width: '100%' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              {!loading ? <ArrowRight size={18} /> : null}
            </button>
          </div>
        )}

        {/* ── STEP 3: WhatsApp Phone + Name → Complete ── */}
        {currentStep === 3 && (
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-xl)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4 }}>
              <div style={{ background: 'var(--primary-light)', padding: 6, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
                <Phone size={16} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Add Your WhatsApp Number</h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Required for order alerts and customer messages</p>
              </div>
            </div>

            {/* Info nudge */}
            <div style={{ background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 12.5, color: 'var(--primary-dark)', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Lock size={13} style={{ flexShrink: 0 }} />
              Email verified! ✅ Now set up your merchant WhatsApp so customers can reach you.
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full-name" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Your Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="full-name"
                  type="text"
                  required
                  placeholder="e.g. Chidi Emmanuel"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocusedInput('full-name')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{ paddingLeft: 44, borderColor: focusedInput === 'full-name' ? 'var(--primary)' : 'var(--border)' }}
                  autoComplete="name"
                  autoFocus
                />
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'full-name' ? 'var(--primary)' : 'var(--text-faint)', transition: 'color var(--t-fast)' }} />
              </div>
            </div>

            {/* WhatsApp Phone Number */}
            <div>
              <label htmlFor="phone-wa" style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                WhatsApp Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: focusedInput === 'phone' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)', background: 'var(--surface)',
                boxShadow: focusedInput === 'phone' ? '0 0 0 3px var(--primary-glow)' : 'none',
                transition: 'all var(--t-fast)', position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: '100%', minHeight: 46, background: 'none', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontSize: 15, color: 'var(--text)', fontWeight: 600, userSelect: 'none' }}
                >
                  <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
                </button>

                <input
                  id="phone-wa"
                  type="tel"
                  required
                  placeholder="e.g. 803 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  style={{ flex: 1, padding: '13px 14px', border: 'none', fontSize: 15, outline: 'none', background: 'transparent', color: 'var(--text)', minWidth: 0 }}
                  autoComplete="tel"
                />

                {isCountryDropdownOpen && (
                  <div className="glass animate-scale-in" style={{ position: 'absolute', top: '110%', left: 0, width: 280, maxHeight: 250, overflowY: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', zIndex: 100, padding: '6px 0' }}>
                    {countries.map((c, idx) => (
                      <button
                        key={c.code}
                        type="button"
                        onMouseEnter={() => setHoveredCountryIndex(idx)}
                        onMouseLeave={() => setHoveredCountryIndex(null)}
                        onClick={() => { setSelectedCountry(c); setIsCountryDropdownOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: selectedCountry.code === c.code ? 'var(--primary-light)' : hoveredCountryIndex === idx ? 'var(--bg-2)' : 'none', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left', color: selectedCountry.code === c.code ? 'var(--primary)' : 'var(--text)', fontWeight: selectedCountry.code === c.code ? 750 : 600, transition: 'background var(--t-fast)' }}
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
              <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 6 }}>
                Customers will send orders directly to this WhatsApp number.
              </span>
            </div>

            {/* Submit Step 3 */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary clickable"
              id="create-store-btn"
              style={{ padding: '16px', fontSize: 16, borderRadius: 'var(--r-xl)', marginTop: 8, fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-primary)', width: '100%' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{loading ? 'Launching Your Store...' : 'Create My Live Store 🚀'}</span>
              {!loading ? <ArrowRight size={18} /> : null}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          By launching your store, you agree to {appName}&apos;s{' '}
          <a href="/terms" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
            Log in
          </a>
        </p>

      </form>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────


// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [appName, setAppName] = useState('Front Store');
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'whatsapp' | 'both'>('whatsapp');

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
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
