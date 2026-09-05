'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import { AlertCircle, Loader2, ChevronDown, Mail, Phone, ArrowRight, RotateCcw } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import SelectCountryModal, { COUNTRIES, Country, getSavedCountry, saveCountry, detectAndSaveCountry } from '@/components/SelectCountryModal';

/* ─── Shared input style ─────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 50,
  padding: '0 16px',
  borderRadius: 12,
  border: '1.5px solid #E5E7EB',
  background: '#F9FAFB',
  fontSize: 15,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

function LoginFormContent({ isAdminMode = false, merchantLoginUrl = '/login', appName = 'Frontstore' }: { isAdminMode?: boolean; merchantLoginUrl?: string; appName?: string }) {
  const router = useRouter();

  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  useEffect(() => {
    const saved = getSavedCountry();
    setSelectedCountry(saved);
    detectAndSaveCountry().then((detected) => {
      if (detected) setSelectedCountry(detected);
    });
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const normalizePhone = (input: string, dialCode: string) => {
    const cleanDial = dialCode.replace(/[^\d]/g, '');
    let cleaned = input.replace(/[^\d]/g, '');
    if (cleaned.startsWith(cleanDial)) cleaned = cleaned.slice(cleanDial.length);
    cleaned = cleaned.replace(/^0+/, '');
    return `+${cleanDial}${cleaned}`;
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!loginIdentifier.trim()) {
      setError(isAdminMode ? 'Please enter your administrator email.' : 'Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      const trimmed = loginIdentifier.trim();
      const isEmail = isAdminMode || loginMethod === 'email' || trimmed.includes('@');
      const phoneVal = isEmail ? trimmed : normalizePhone(trimmed, selectedCountry.dialCode);
      setNormalizedPhone(phoneVal);
      const res = await resilientFetch(`${getApiUrl()}/v1/auth/${isEmail ? 'send-email-otp' : 'send-otp'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(isEmail ? { email: trimmed } : { phone_number: phoneVal, country_dial_code: selectedCountry.dialCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send login code.');
      toast.success(json.message || 'Verification code sent!');
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      const res = await resilientFetch(`${getApiUrl()}/v1/auth/${isEmail ? 'verify-email-otp' : 'verify-otp'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(isEmail ? { email: normalizedPhone, otp: otp.trim() } : { phone_number: normalizedPhone, otp: otp.trim(), country_dial_code: selectedCountry.dialCode }),
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
          toast.success(isAdmin ? 'Welcome, Administrator! 🛡️' : 'Welcome back! 👋');
          router.push(isAdmin ? '/admin' : '/dashboard');
        }
      } else if (json.is_new_user) {
        toast.info('Account not found. Please sign up first.');
        router.push('/signup');
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      appName={appName}
      panelHeadline={"Welcome back,\nMerchant."}
      panelSubline="Sign in to manage your store, track orders, and grow your sales."
    >
      <div style={{ width: '100%' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          {step === 'identifier' ? (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
                {isAdminMode ? 'Admin sign in' : 'Sign in to your store'}
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                {isAdminMode ? 'Enter your administrator credentials.' : "We'll send a quick 6-digit code — no password needed."}
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('identifier'); setOtp(''); setError(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#0B5D39', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16 }}
              >
                <RotateCcw size={13} />
                Change {loginMethod === 'email' ? 'email' : 'number'}
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
                Check your {loginMethod === 'email' ? 'inbox' : 'WhatsApp'}
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                6-digit code sent to <span style={{ fontWeight: 600, color: '#374151' }}>{loginIdentifier}</span>
              </p>
            </>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <AlertCircle size={15} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13.5, color: '#DC2626', fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        {/* ── Step 1: Identifier ── */}
        {step === 'identifier' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Toggle tabs */}
            {!isAdminMode && (
              <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, gap: 4, marginBottom: 2 }}>
                {(['email', 'phone'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="fs-tab-btn"
                    onClick={() => { setLoginMethod(m); setLoginIdentifier(''); }}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 9,
                      border: 'none',
                      background: loginMethod === m ? '#FFFFFF' : 'transparent',
                      color: loginMethod === m ? '#111827' : '#9CA3AF',
                      boxShadow: loginMethod === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    {m === 'email' ? <Mail size={13} /> : <Phone size={13} />}
                    {m === 'email' ? 'Email' : 'WhatsApp'}
                  </button>
                ))}
              </div>
            )}

            {/* Input field */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '0.02em' }}>
                {loginMethod === 'email' || isAdminMode ? 'Email address' : 'Phone number'}
              </label>
              {loginMethod === 'email' || isAdminMode ? (
                <input
                  type="email"
                  required
                  className="fs-input"
                  placeholder="you@example.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  style={inputStyle}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', height: 50, borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F9FAFB', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setIsCountryModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: '100%', background: 'transparent', border: 'none', borderRight: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#374151', flexShrink: 0 }}
                  >
                    <span style={{ fontSize: 16 }}>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                    <ChevronDown size={13} style={{ color: '#9CA3AF' }} />
                  </button>
                  <input
                    type="tel"
                    required
                    className="fs-input"
                    placeholder="Phone number"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    style={{ flex: 1, height: '100%', padding: '0 14px', border: 'none', background: 'transparent', fontSize: 15, color: '#111827', outline: 'none' }}
                  />
                </div>
              )}
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '6px 0 0 2px', lineHeight: 1.4 }}>
                {loginMethod === 'email' || isAdminMode ? 'We will email you a 6-digit sign-in code.' : 'We will WhatsApp you a 6-digit code.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="fs-primary-btn"
              style={{ width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Continue</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '0.02em' }}>
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...inputStyle, textAlign: 'center', fontSize: 28, letterSpacing: '0.4em', fontWeight: 800, height: 62 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="fs-primary-btn"
              style={{ width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Sign in'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
              Didn&apos;t receive a code?{' '}
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendOtp()}
                style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#9CA3AF' : '#0B5D39', fontWeight: 700, cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: 13 }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {/* ── Divider + Footer ── */}
        <div style={{ margin: '28px 0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
          <span style={{ fontSize: 12, color: '#D1D5DB', whiteSpace: 'nowrap' }}>New to Frontstore?</span>
          <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
        </div>
        <a
          href="/signup"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 48, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14.5, fontWeight: 700, color: '#374151', textDecoration: 'none', background: '#FFFFFF', transition: 'border-color 0.15s ease, background 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0B5D39'; e.currentTarget.style.color = '#0B5D39'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
        >
          Create a free store
        </a>
      </div>

      <SelectCountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountry={selectedCountry}
        onSelectCountry={(c) => { setSelectedCountry(c); saveCountry(c); }}
      />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#042A19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}><Loader2 size={32} className="animate-spin" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
