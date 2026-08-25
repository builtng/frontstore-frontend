'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import {
  Globe, Loader2, ArrowRight, Check, LogIn, Mail, MessageSquare, RefreshCw, ShieldCheck, Zap, Search, Sparkles, Store, Lock, ChevronDown
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

function LoginFormContent({ isAdminMode, merchantLoginUrl, appName }: { isAdminMode: boolean; merchantLoginUrl: string; appName: string }) {
  const router = useRouter();

  // Step: 'identifier' | 'otp'
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [needsEmail, setNeedsEmail] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

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
        // Keep Nigeria as default
      }
    };
    if (!isAdminMode) detectCountry();
  }, [isAdminMode]);

  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isCountryDropdownOpen]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown(v => v - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

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

  const [devLoggingIn, setDevLoggingIn] = useState<string | null>(null);

  const handleDevLogin = async (role: 'merchant' | 'admin' = 'merchant') => {
    try {
      setDevLoggingIn(role);
      setError(null);
      const res = await fetch(`${API_URL}/v1/auth/dev-login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ role }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Dev login failed.');

      if (json.token && json.data) {
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', JSON.stringify(json.data.user));
        localStorage.setItem('store', JSON.stringify(json.data.store || null));
        const isAdmin = json.data.user?.is_admin === true || json.data.user?.is_admin === 1 || json.data.user?.is_admin === 'true' || json.data.user?.is_admin === '1';
        toast.success(isAdmin ? 'Welcome, Administrator! 🛡️' : `Welcome back to ${appName}! 👋`);
        router.push(isAdmin ? '/admin' : '/dashboard');
      } else {
        throw new Error('Unexpected response from dev login.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Auto-login failed');
      setError(err.message);
    } finally {
      setDevLoggingIn(null);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const auto = params.get('auto');
      if (auto === 'merchant' || auto === 'true' || auto === '1') {
        handleDevLogin('merchant');
      } else if (auto === 'admin') {
        handleDevLogin('admin');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
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

  // Step 1: Request OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim()) {
      setError(isAdminMode ? 'Please enter your administrator email.' : 'Please enter your phone number or email.');
      return;
    }

    try {
      setLoading(true);
      const trimmed = loginIdentifier.trim();
      const isEmail = isAdminMode || loginMethod === 'email' || trimmed.includes('@');
      const phoneVal = isEmail ? trimmed : normalizePhone(trimmed, selectedCountry.dialCode);
      setNormalizedPhone(phoneVal);

      const res = await fetch(`${API_URL}/v1/auth/${isEmail ? 'send-email-otp' : 'send-otp'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(
          isEmail
            ? { email: trimmed }
            : { phone_number: phoneVal, country_dial_code: selectedCountry.dialCode, email: needsEmail ? otpEmail.trim() : undefined }
        ),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send verification code.');

      if (json.needs_email) {
        setNeedsEmail(true);
        return;
      }

      setSuccessMsg(json.message || 'Verification code sent!');
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(
        err instanceof TypeError
          ? `Could not reach the server. Please try again.`
          : err.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to you.');
      return;
    }

    try {
      setLoading(true);
      const isEmail = isAdminMode || loginMethod === 'email' || normalizedPhone.includes('@');
      const res = await fetch(`${API_URL}/v1/auth/${isEmail ? 'verify-email-otp' : 'verify-otp'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(
          isEmail
            ? { email: normalizedPhone, otp: otp.trim() }
            : { phone_number: normalizedPhone, otp: otp.trim(), country_dial_code: selectedCountry.dialCode }
        ),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Invalid or expired code.');

      const authToken = json.data?.token || json.token;
      if (authToken && json.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', authToken);
          localStorage.setItem('user', JSON.stringify(json.data.user));
          localStorage.setItem('store', JSON.stringify(json.data.store || null));
          const isAdmin = json.data.user?.is_admin === true || json.data.user?.is_admin === 1 || json.data.user?.is_admin === 'true' || json.data.user?.is_admin === '1';
          toast.success(isAdmin ? 'Welcome, Administrator! 🛡️' : `Welcome back to ${appName}! 👋`);
          router.push(isAdmin ? '/admin' : '/dashboard');
        }
      } else if (json.is_new_user) {
        toast.info('Account not found. Please sign up first.');
        router.push('/signup');
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err: any) {
      setError(
        err instanceof TypeError
          ? `Could not reach the server. Please try again.`
          : err.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.dialCode.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 28 }}>
        <a
          href="/"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 10, 
            fontFamily: 'var(--font-heading)', 
            fontSize: 26, 
            fontWeight: 900, 
            color: 'var(--primary)', 
            textDecoration: 'none', 
            marginBottom: 16 
          }}
        >
          <Logo size={30} textColor="var(--text)" text={appName} />
        </a>
        
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: 26, 
          fontWeight: 900, 
          color: 'var(--text)', 
          marginBottom: 8, 
          letterSpacing: '-0.025em' 
        }}>
          {isAdminMode ? 'Admin Portal Sign In' : 'Merchant Log In'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5, maxWidth: 380, margin: '0 auto' }}>
          {isAdminMode
            ? 'Access platform management, configure global settings, and view growth analytics.'
            : 'Access your storefront dashboard, manage orders, and upload products.'
          }
        </p>
      </header>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 20,
          background: step === 'identifier' ? 'var(--primary-light)' : 'var(--bg-2)',
          border: `1px solid ${step === 'identifier' ? 'var(--primary)' : 'var(--border)'}`,
          color: step === 'identifier' ? 'var(--primary)' : 'var(--text-muted)',
          fontSize: 12.5, fontWeight: 750, transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: step === 'identifier' ? 'var(--primary)' : (step === 'otp' ? 'var(--wa-green)' : 'var(--border-strong)'),
            color: '#fff', fontSize: 10, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {step === 'otp' ? <Check size={10} strokeWidth={3} /> : '1'}
          </div>
          <span>{isAdminMode ? 'Email' : 'Authentication'}</span>
        </div>

        <div style={{ width: 24, height: 2, borderRadius: 2, background: step === 'otp' ? 'var(--primary)' : 'var(--border)' }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 20,
          background: step === 'otp' ? 'var(--primary-light)' : 'var(--bg-2)',
          border: `1px solid ${step === 'otp' ? 'var(--primary)' : 'var(--border)'}`,
          color: step === 'otp' ? 'var(--primary)' : 'var(--text-faint)',
          fontSize: 12.5, fontWeight: 750, transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: step === 'otp' ? 'var(--primary)' : 'var(--border-strong)',
            color: '#fff', fontSize: 10, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            2
          </div>
          <span>Verify OTP</span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'var(--danger-light)', color: 'var(--danger)',
          border: '1.5px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--r-lg)', padding: '12px 16px',
          fontSize: 13.5, marginBottom: 20, fontWeight: 600,
          display: 'flex', gap: 10, alignItems: 'center',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <LogIn size={17} style={{ flexShrink: 0 }} /> 
          <span style={{ flex: 1 }}>{error}</span>
        </div>
      )}

      {/* Success banner */}
      {successMsg && step === 'otp' && (
        <div style={{
          background: 'var(--primary-light)', color: 'var(--primary)',
          border: '1.5px solid color-mix(in srgb, var(--primary) 30%, transparent)',
          borderRadius: 'var(--r-lg)', padding: '12px 16px',
          fontSize: 13.5, marginBottom: 20, fontWeight: 600,
          display: 'flex', gap: 10, alignItems: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <ShieldCheck size={17} style={{ flexShrink: 0 }} /> {successMsg}
        </div>
      )}

      {/* ── STEP 1: Identifier ── */}
      {step === 'identifier' && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ 
            padding: 24, 
            borderRadius: 'var(--r-2xl)',
            background: 'var(--surface)', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 20 
          }}>
            {!isAdminMode && (
              <div style={{ 
                display: 'flex', 
                gap: 6, 
                padding: 4, 
                borderRadius: 'var(--r-lg)', 
                background: 'var(--bg-2)', 
                border: '1px solid var(--border)' 
              }}>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setLoginIdentifier(''); setError(null); setNeedsEmail(false); setOtpEmail(''); }}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
                    background: loginMethod === 'phone' ? 'var(--surface)' : 'transparent',
                    color: loginMethod === 'phone' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: 13, transition: 'all 0.2s',
                    boxShadow: loginMethod === 'phone' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <MessageSquare size={15} style={{ color: loginMethod === 'phone' ? 'var(--wa-green)' : 'currentColor' }} />
                  WhatsApp Phone
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setLoginIdentifier(''); setError(null); setNeedsEmail(false); setOtpEmail(''); }}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
                    background: loginMethod === 'email' ? 'var(--surface)' : 'transparent',
                    color: loginMethod === 'email' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: 13, transition: 'all 0.2s',
                    boxShadow: loginMethod === 'email' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Mail size={15} /> Email Address
                </button>
              </div>
            )}

            {/* Input Field Area */}
            <div>
              <label
                htmlFor="loginIdentifier"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12, 
                  fontWeight: 800, 
                  color: 'var(--text-2)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: 8 
                }}
              >
                <span>{isAdminMode ? 'Admin Email Address' : loginMethod === 'email' ? 'Email Address' : 'WhatsApp Phone Number'}</span>
                {loginMethod === 'phone' && !isAdminMode && (
                  <span style={{ fontSize: 11, color: 'var(--wa-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--wa-green)', display: 'inline-block' }} />
                    Instant Verification
                  </span>
                )}
              </label>

              {isAdminMode || loginMethod === 'email' ? (
                <div style={{ position: 'relative' }}>
                  <input
                    id="loginIdentifier"
                    type="email"
                    required
                    placeholder={isAdminMode ? 'e.g. admin@frontstore.ng' : 'you@example.com'}
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    onFocus={() => setFocusedInput('loginIdentifier')}
                    onBlur={() => setFocusedInput(null)}
                    className="input-field"
                    style={{ 
                      paddingLeft: 44, 
                      height: 48,
                      borderRadius: 'var(--r-xl)',
                      borderColor: focusedInput === 'loginIdentifier' ? 'var(--primary)' : 'var(--border)',
                      fontSize: 15,
                    }}
                    autoComplete="email"
                  />
                  <Mail size={18} style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    color: focusedInput === 'loginIdentifier' ? 'var(--primary)' : 'var(--text-faint)',
                    transition: 'color 0.2s'
                  }} />
                </div>
              ) : (
                <div 
                  ref={dropdownRef}
                  style={{
                    display: 'flex', alignItems: 'center',
                    border: focusedInput === 'loginIdentifier' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                    borderRadius: 'var(--r-xl)', background: 'var(--surface)',
                    boxShadow: focusedInput === 'loginIdentifier' ? '0 0 0 4px var(--primary-glow)' : 'none',
                    transition: 'all 0.2s', position: 'relative', height: 48
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0 12px', height: '100%',
                      background: 'none', border: 'none', borderRight: '1px solid var(--border)',
                      cursor: 'pointer', fontSize: 14, color: 'var(--text)', fontWeight: 700, userSelect: 'none',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                      flex: 1, padding: '0 14px', border: 'none', fontSize: 15, 
                      outline: 'none', background: 'transparent', color: 'var(--text)', 
                      minWidth: 0, fontWeight: 600 
                    }}
                    autoComplete="tel"
                  />

                  {/* Country Selector Dropdown */}
                  {isCountryDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '115%', left: 0, width: 300, maxHeight: 280, overflow: 'hidden',
                      borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', background: 'var(--surface)',
                      boxShadow: 'var(--shadow-xl)', zIndex: 100, display: 'flex', flexDirection: 'column',
                      animation: 'scaleIn 0.15s ease-out'
                    }}>
                      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Search size={14} style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Search country or code..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', color: 'var(--text)' }}
                          autoFocus
                        />
                      </div>
                      <div style={{ overflowY: 'auto', padding: '6px 0', flex: 1 }}>
                        {filteredCountries.length === 0 ? (
                          <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No countries found</div>
                        ) : (
                          filteredCountries.map((c, idx) => (
                            <button
                              key={c.code}
                              type="button"
                              onMouseEnter={() => setHoveredCountryIndex(idx)}
                              onMouseLeave={() => setHoveredCountryIndex(null)}
                              onClick={() => { setSelectedCountry(c); setIsCountryDropdownOpen(false); setCountrySearch(''); }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', padding: '10px 14px',
                                background: selectedCountry.code === c.code ? 'var(--primary-light)' : hoveredCountryIndex === idx ? 'var(--bg-2)' : 'none',
                                border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left',
                                color: selectedCountry.code === c.code ? 'var(--primary)' : 'var(--text)',
                                fontWeight: selectedCountry.code === c.code ? 750 : 600,
                                transition: 'background 0.15s'
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 18 }}>{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                                {c.dialCode}
                                {selectedCountry.code === c.code ? <Check size={14} color="var(--primary)" strokeWidth={2.5} /> : null}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-faint)', display: 'block', marginTop: 7 }}>
                {isAdminMode || loginMethod === 'email'
                  ? 'We will send a one-time verification code to your email.'
                  : 'A 6-digit code will be sent to the email registered on your account.'
                }
              </span>
            </div>

            {!isAdminMode && loginMethod === 'phone' && needsEmail && (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <label
                  htmlFor="otpEmail"
                  style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
                >
                  Email Address Required
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="otpEmail"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)}
                    onFocus={() => setFocusedInput('otpEmail')}
                    onBlur={() => setFocusedInput(null)}
                    className="input-field"
                    style={{ paddingLeft: 44, height: 48, borderRadius: 'var(--r-xl)', borderColor: focusedInput === 'otpEmail' ? 'var(--primary)' : 'var(--border)' }}
                    autoComplete="email"
                    autoFocus
                  />
                  <Mail size={18} style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    color: focusedInput === 'otpEmail' ? 'var(--primary)' : 'var(--text-faint)',
                  }} />
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                  No email associated with this number yet. Please provide your email to receive the code.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary clickable"
              id="send-otp-btn"
              style={{
                height: 50, fontSize: 15.5, borderRadius: 'var(--r-xl)',
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(18, 140, 126, 0.35)',
                width: '100%', marginTop: 4
              }}
            >
              {mounted && loading ? <Loader2 size={19} className="animate-spin" /> : null}
              <span>
                {!mounted ? 'Send Verification Code' : (loading ? 'Sending Code...' : 'Send Verification Code')}
              </span>
              {mounted && !loading ? <ArrowRight size={18} /> : null}
            </button>
          </div>

          {/* Footer Links (BUYER LINK REMOVED PER USER REQUEST) */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {isAdminMode ? (
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                Merchant account?{' '}
                <a href={merchantLoginUrl} style={{ color: 'var(--primary)', fontWeight: 750, textDecoration: 'none' }}>
                  Go to merchant login →
                </a>
              </p>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Don't have a storefront yet?{' '}
                <a href="/signup" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>
                  Create a free store
                </a>
              </p>
            )}
          </div>
        </form>
      )}

      {/* ── STEP 2: Enter OTP ── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ 
            padding: 24, 
            borderRadius: 'var(--r-2xl)',
            background: 'var(--surface)', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 20 
          }}>
            <div>
              <label
                htmlFor="otp-input"
                style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, textAlign: 'center' }}
              >
                Enter 6-Digit Code
              </label>
              
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onFocus={() => setFocusedInput('otp')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                autoComplete="one-time-code"
                autoFocus
                style={{
                  textAlign: 'center',
                  fontSize: 28,
                  letterSpacing: '0.4em',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  height: 56,
                  borderRadius: 'var(--r-xl)',
                  borderColor: focusedInput === 'otp' ? 'var(--primary)' : 'var(--border)',
                  boxShadow: focusedInput === 'otp' ? '0 0 0 4px var(--primary-glow)' : 'none',
                }}
              />
              
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginTop: 10, textAlign: 'center', lineHeight: 1.4 }}>
                Code sent to <strong style={{ color: 'var(--text)' }}>{normalizedPhone}</strong>. Check your WhatsApp or email inbox.
              </span>
            </div>

            {/* Resend Cooldown */}
            <div style={{ textAlign: 'center' }}>
              {resendCooldown > 0 ? (
                <span style={{ fontSize: 13, color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-2)', borderRadius: 20 }}>
                  <RefreshCw size={13} className="animate-spin" />
                  Resend available in <strong>{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--primary)', fontWeight: 800, fontSize: 13.5,
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px',
                  }}
                >
                  <RefreshCw size={14} /> Resend verification code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="btn btn-primary clickable"
              id="verify-otp-btn"
              style={{
                height: 50, fontSize: 15.5, borderRadius: 'var(--r-xl)',
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(18, 140, 126, 0.35)',
                opacity: otp.length < 6 ? 0.6 : 1,
                width: '100%'
              }}
            >
              {mounted && loading ? <Loader2 size={19} className="animate-spin" /> : null}
              <span>
                {!mounted ? 'Verify & Sign In' : (loading ? 'Verifying Code...' : 'Verify & Sign In')}
              </span>
              {mounted && !loading ? <ArrowRight size={18} /> : null}
            </button>

            <button
              type="button"
              onClick={() => { setStep('identifier'); setOtp(''); setError(null); setSuccessMsg(null); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontWeight: 700, fontSize: 13.5,
                textAlign: 'center', padding: '4px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              ← Back to login details
            </button>
          </div>
        </form>
      )}

      {/* ── Quick Dev Auto-Login (Localhost Development) ── */}
      {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <div style={{
          marginTop: 24,
          padding: '16px 18px',
          borderRadius: 'var(--r-xl)',
          background: 'linear-gradient(135deg, rgba(18, 140, 126, 0.05) 0%, rgba(37, 211, 102, 0.05) 100%)',
          border: '1.5px dashed var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} /> Quick Dev Auto-Login
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)' }}>Localhost</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              id="dev-login-merchant-btn"
              disabled={!!devLoggingIn}
              onClick={() => handleDevLogin('merchant')}
              className="btn clickable"
              style={{
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 'var(--r-lg)',
                background: 'var(--surface, #fff)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              {devLoggingIn === 'merchant' ? <Loader2 size={15} className="animate-spin" /> : '🏪 Merchant'}
            </button>
            <button
              type="button"
              id="dev-login-admin-btn"
              disabled={!!devLoggingIn}
              onClick={() => handleDevLogin('admin')}
              className="btn clickable"
              style={{
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 'var(--r-lg)',
                background: 'var(--surface, #fff)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              {devLoggingIn === 'admin' ? <Loader2 size={15} className="animate-spin" /> : '🛡️ Admin'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [merchantLoginUrl, setMerchantLoginUrl] = useState('/login');
  const [appName, setAppName] = useState('Front Store');

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.app_name) setAppName(json.data.app_name);
      } catch {
        // Keep the local fallback
      }
    };
    loadPublicSettings();
  }, []);

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
      {/* LEFT PANEL: Modern Hero & Brand Panel (Visible on Desktop) */}
      <div className="left-hero-panel" style={{
        flex: 1.1,
        background: 'linear-gradient(135deg, #0b4d44 0%, #128C7E 50%, #075e54 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative ambient glowing orbs */}
        <div style={{
          position: 'absolute', width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 211, 102, 0.25) 0%, rgba(0,0,0,0) 70%)',
          top: '-10%', right: '-15%', filter: 'blur(40px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(18, 140, 126, 0.4) 0%, rgba(0,0,0,0) 70%)',
          bottom: '-10%', left: '-10%', filter: 'blur(50px)', pointerEvents: 'none'
        }} />

        {/* Top Header Logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, color: '#fff',
              background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(12px)',
              padding: '8px 18px', borderRadius: 40, border: '1px solid rgba(255, 255, 255, 0.18)',
              textDecoration: 'none'
            }}
          >
            <Logo size={24} textColor="#ffffff" text={appName} />
          </a>
        </div>

        {/* Center Main Copy */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 540, margin: 'auto 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 30, background: 'rgba(37, 211, 102, 0.2)',
            color: '#25D366', fontSize: 13, fontWeight: 800, marginBottom: 24,
            border: '1px solid rgba(37, 211, 102, 0.3)'
          }}>
            <Sparkles size={14} />
            <span>{isAdminMode ? 'System Control Center' : 'WhatsApp Social Commerce'}</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: 44, fontWeight: 900,
            lineHeight: 1.12, marginBottom: 20, letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {isAdminMode ? 'Welcome Back to Your Admin Center.' : 'Welcome Back to Your Store Headquarters.'}
          </h2>

          <p style={{ fontSize: 17, color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.6, marginBottom: 36, fontWeight: 500 }}>
            {isAdminMode
              ? 'Sign in to monitor system activity, manage merchant accounts, track platform metrics, and configure environment settings.'
              : 'Sign in to manage orders, customize your digital storefront, auto-generate AI descriptions, and connect with customers.'
            }
          </p>

          {/* Value Props Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {(isAdminMode
              ? [
                { title: 'Live Platform Stats', desc: 'Real-time GMV & order tracking' },
                { title: 'Merchant Management', desc: 'Plan billing & store status' },
                { title: 'Global Settings', desc: 'API keys & system controls' },
                { title: 'Audit Trail', desc: 'Full activity & security log' }
              ]
              : [
                { title: 'WhatsApp Checkout', desc: 'Instant 1-click cart links' },
                { title: 'AI Product Generator', desc: 'Automated description writing' },
                { title: 'Order Management', desc: 'Real-time payment tracking' },
                { title: 'Store Analytics', desc: 'Visitor counts & conversions' }
              ]
            ).map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#25D366', color: '#0b4d44',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{item.title}</h4>
                  <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 16, paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
            <Lock size={14} style={{ color: '#25D366' }} />
            256-Bit Encrypted Sessions
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form card */}
      <div className="right-form-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', position: 'relative', width: '100%', minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
              <div className="spinner spinner-primary" style={{ width: 36, height: 36 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading merchant portal...</span>
            </div>
          }>
            <LoginFormContent isAdminMode={isAdminMode} merchantLoginUrl={merchantLoginUrl} appName={appName} />
          </Suspense>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .left-hero-panel {
            display: none !important;
          }
          .right-form-panel {
            padding: 32px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

