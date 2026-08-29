'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import {
  AlertCircle, Loader2, ChevronDown
} from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import SelectCountryModal, { COUNTRIES, Country, getSavedCountry, saveCountry, detectAndSaveCountry } from '@/components/SelectCountryModal';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedCountry();
    setSelectedCountry(saved);
    // If no saved country was stored, auto-detect location
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
    if (cleaned.startsWith(cleanDial)) {
      cleaned = cleaned.slice(cleanDial.length);
    }
    cleaned = cleaned.replace(/^0+/, '');
    return `+${cleanDial}${cleaned}`;
  };

  // Step 1: Handle Send Verification / Login
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
        body: JSON.stringify(
          isEmail
            ? { email: trimmed }
            : { phone_number: phoneVal, country_dial_code: selectedCountry.dialCode }
        ),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send login code.');

      toast.success(json.message || 'Verification code sent to your email!');
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete login
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
          toast.success(isAdmin ? 'Welcome, Administrator! 🛡️' : `Welcome back! 👋`);
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
    <AuthShell iconType="store" appName={appName}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#6B7280',
            margin: '0 0 2px 0',
            fontFamily: 'var(--font-sans, system-ui)',
          }}
        >
          Welcome back,
        </p>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
            margin: 0,
            fontFamily: 'var(--font-heading, system-ui, sans-serif)',
          }}
        >
          Login to your account
        </h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 13,
            color: '#DC2626',
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Identifier Input Form */}
      {step === 'identifier' && (
        <form onSubmit={handleSendOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email / Phone Mode Switch Pill */}
          {!isAdminMode && (
            <div
              style={{
                display: 'flex',
                background: '#F4F4F7',
                borderRadius: 10,
                padding: 3,
                marginBottom: 4,
              }}
            >
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  background: loginMethod === 'email' ? '#FFFFFF' : 'transparent',
                  color: loginMethod === 'email' ? '#111827' : '#6B7280',
                  boxShadow: loginMethod === 'email' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Use Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  background: loginMethod === 'phone' ? '#FFFFFF' : 'transparent',
                  color: loginMethod === 'phone' ? '#111827' : '#6B7280',
                  boxShadow: loginMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Use WhatsApp Phone
              </button>
            </div>
          )}

          {/* Email Input */}
          {loginMethod === 'email' || isAdminMode ? (
            <div>
              <input
                type="email"
                required
                placeholder="Your email"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                onFocus={() => setFocusedInput('identifier')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  width: '100%',
                  height: 48,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: focusedInput === 'identifier' ? '1.5px solid #0B5D39' : '1px solid #EAEAEA',
                  background: '#F7F7FA',
                  fontSize: 14.5,
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          ) : (
            /* Phone Input with Flag trigger */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 48,
                borderRadius: 12,
                border: focusedInput === 'identifier' ? '1.5px solid #0B5D39' : '1px solid #EAEAEA',
                background: '#F7F7FA',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '0 12px',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderRight: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#374151',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 16 }}>{selectedCountry.flag}</span>
                <span>{selectedCountry.dialCode}</span>
                <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
              </button>
              <input
                type="tel"
                required
                placeholder="Phone number"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                onFocus={() => setFocusedInput('identifier')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  flex: 1,
                  height: '100%',
                  padding: '0 14px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14.5,
                  color: '#111827',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          )}

          {/* Helper hint */}
          <p
            style={{
              fontSize: 12.5,
              color: '#6B7280',
              margin: '2px 0 0 2px',
              lineHeight: 1.4,
            }}
          >
            {loginMethod === 'email' || isAdminMode
              ? 'We will send a 6-digit verification code to your email.'
              : 'We will send a 6-digit verification code to your account.'}
          </p>

          {/* Primary Login / Send Code Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 50,
              background: '#0B5D39',
              color: '#FFFFFF',
              borderRadius: 12,
              border: 'none',
              fontSize: 15.5,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#074328';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#0B5D39';
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Continue with Code'}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
              Enter 6-Digit Code
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Code sent to <strong>{loginIdentifier}</strong>
            </p>
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{
              width: '100%',
              height: 54,
              textAlign: 'center',
              fontSize: 26,
              letterSpacing: '0.35em',
              fontWeight: 800,
              borderRadius: 12,
              border: '1.5px solid #0B5D39',
              background: '#F7F7FA',
              outline: 'none',
              color: '#111827',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 50,
              background: '#0B5D39',
              color: '#FFFFFF',
              borderRadius: 12,
              border: 'none',
              fontSize: 15.5,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Code & Login'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            Didn't receive code?{' '}
            <button
              type="button"
              disabled={resendCooldown > 0 || loading}
              onClick={() => handleSendOtp()}
              style={{
                background: 'none',
                border: 'none',
                color: '#0B5D39',
                fontWeight: 700,
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      )}

      {/* Footer Link */}
      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13.5, color: '#6B7280' }}>
        New to Frontstore?{' '}
        <a
          href="/signup"
          style={{
            color: '#0B5D39',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Create an account
        </a>
      </div>

      {/* Select Country Modal */}
      <SelectCountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountry={selectedCountry}
        onSelectCountry={(c) => {
          setSelectedCountry(c);
          saveCountry(c);
        }}
      />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#042A19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
