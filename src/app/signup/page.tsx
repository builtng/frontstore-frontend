'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CheckCircle2, AlertCircle, Loader2, ArrowRight, ChevronDown
} from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import SelectCountryModal, { COUNTRIES, Country, getSavedCountry, saveCountry, detectAndSaveCountry } from '@/components/SelectCountryModal';

function toUsernameSlug(value: string): string {
  return value.toLowerCase().replace(/_/g, '-').replace(/[^a-z0-9-]/g, '');
}

const FIND_OUT_OPTIONS = [
  'Instagram',
  'TikTok',
  'Twitter / X',
  'Facebook',
  'Friend or Family referral',
  'Google Search',
  'Other',
];

function SignupFormContent() {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [findOutSource, setFindOutSource] = useState('');

  const [storeName, setStoreName] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);
  const [showCustomStoreUrl, setShowCustomStoreUrl] = useState(false);

  const [otp, setOtp] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string>('');

  const [successData, setSuccessData] = useState<{
    storeName: string;
    username: string;
    storeUrl: string;
  } | null>(null);

  const API_URL = getApiUrl();

  useEffect(() => {
    const saved = getSavedCountry();
    setSelectedCountry(saved);
    detectAndSaveCountry().then((detected) => {
      if (detected) setSelectedCountry(detected);
    });
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Pre-fill from URL params
  useEffect(() => {
    const q = searchParams.get('username');
    if (q) {
      const cleaned = toUsernameSlug(q);
      setUsername(cleaned);
      const guessed = cleaned
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setStoreName(guessed);
      setIsUsernameManuallyEdited(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const refParam = searchParams.get('ref') || localStorage.getItem('referrer_username');
    if (refParam) {
      setReferredBy(refParam);
    }
  }, [searchParams]);

  const getNormalizedPhone = () => {
    const cleanDial = selectedCountry.dialCode.replace(/[^\d]/g, '');
    let cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith(cleanDial)) {
      cleaned = cleaned.slice(cleanDial.length);
    }
    cleaned = cleaned.replace(/^0+/, '');
    return `+${cleanDial}${cleaned}`;
  };

  // Helper to sync storeName & username when Name changes if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isUsernameManuallyEdited) {
      const derivedStoreName = val.trim() ? `${val.trim()}'s Store` : '';
      setStoreName(derivedStoreName);
      setUsername(toUsernameSlug(derivedStoreName));
    }
  };

  // ── Step 1 Submit ─────────────────────────────────────────────────────────────
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your WhatsApp phone number.');
      return;
    }

    const effectiveStoreName = storeName.trim() || `${name.trim()}'s Store`;
    const effectiveUsername = username.trim() || toUsernameSlug(effectiveStoreName);

    if (lastSentEmail === email.trim().toLowerCase()) {
      setCurrentStep(2);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await resilientFetch(`${getApiUrl()}/v1/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          store_name: effectiveStoreName,
          username: effectiveUsername,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to send verification code. Please check your email.');
      }

      if (json?.is_new_user === false) {
        const errorMsg = 'An account with this email already exists. Please log in instead.';
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }

      toast.success(json?.message || 'Verification code sent to your email!');
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

  // ── Step 2 Submit (Verify OTP) ───────────────────────────────────────────────
  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const effectiveStoreName = storeName.trim() || `${name.trim()}'s Store`;
    const effectiveUsername = username.trim() || toUsernameSlug(effectiveStoreName);

    try {
      setLoading(true);
      setError(null);

      const verifyRes = await resilientFetch(`${getApiUrl()}/v1/auth/verify-email-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp,
          store_name: effectiveStoreName,
          username: effectiveUsername,
        }),
      });

      const verifyJson = await verifyRes.json().catch(() => null);
      if (!verifyRes.ok) {
        throw new Error(verifyJson?.message || 'Incorrect verification code. Please try again.');
      }

      if (!verifyJson?.is_new_user) {
        if (typeof window !== 'undefined' && verifyJson?.token) {
          localStorage.setItem('user', JSON.stringify(verifyJson.data?.user));
          localStorage.setItem('store', JSON.stringify(verifyJson.data?.user?.store));
        }
        toast.success(`Welcome back, ${verifyJson?.data?.user?.name || 'Merchant'}!`);
        window.location.replace('/dashboard');
        return;
      }

      setSetupToken(verifyJson.setup_token);
      
      // Auto complete setup if step 1 gathered all info!
      await handleCompleteSetup(verifyJson.setup_token);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async (tokenToUse: string) => {
    const normalizedPhone = getNormalizedPhone();
    const effectiveStoreName = storeName.trim() || `${name.trim()}'s Store`;
    const effectiveUsername = username.trim() || toUsernameSlug(effectiveStoreName);

    try {
      const setupRes = await resilientFetch(`${getApiUrl()}/v1/auth/complete-setup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          setup_token: tokenToUse,
          name: name.trim(),
          store_name: effectiveStoreName,
          username: effectiveUsername,
          email: email.trim(),
          phone_number: normalizedPhone,
          country_dial_code: selectedCountry.dialCode,
          referred_by: referredBy || undefined,
        }),
      });

      const setupJson = await setupRes.json().catch(() => null);
      if (!setupRes.ok) {
        throw new Error(setupJson?.message || 'Failed to complete store setup.');
      }

      const setupTokenResult = setupJson?.data?.token || setupJson?.token;
      if (typeof window !== 'undefined') {
        if (setupTokenResult) localStorage.setItem('token', setupTokenResult);
        if (setupJson?.data?.user) localStorage.setItem('user', JSON.stringify(setupJson.data.user));
        if (setupJson?.data?.store) localStorage.setItem('store', JSON.stringify(setupJson.data.store));
      }

      const finalUrl = setupJson?.data?.store?.url || `https://frontstore.ng/${effectiveUsername}`;
      setSuccessData({
        storeName: effectiveStoreName,
        username: effectiveUsername,
        storeUrl: finalUrl,
      });
      toast.success('Store created successfully! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete setup.');
      setError(err.message || 'Failed to complete setup.');
    }
  };

  // ── SUCCESS RENDER ──────────────────────────────────────────────────────────
  if (successData) {
    return (
      <AuthShell iconType="store" appName="Frontstore">
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <CheckCircle2 size={38} />
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              marginBottom: 8,
              fontFamily: 'var(--font-heading, system-ui)',
            }}
          >
            Store Created!
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.5 }}>
            Congratulations! <strong>{successData.storeName}</strong> is now live on the internet.
          </p>

          <div
            style={{
              background: '#F9FAFB',
              border: '1.5px dashed #0B5D39',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0B5D39', textTransform: 'uppercase', marginBottom: 6 }}>
              Your Live Storefront Link
            </div>
            <a
              href={successData.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 16, fontWeight: 750, color: '#111827', wordBreak: 'break-all' }}
            >
              {successData.storeUrl.replace(/^https?:\/\//, '')}
            </a>
          </div>

          <a
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              height: 50,
              background: '#0B5D39',
              color: '#FFFFFF',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: 12,
            }}
          >
            Go to Web Dashboard <ArrowRight size={18} />
          </a>
        </div>
      </AuthShell>
    );
  }

  // ── MAIN SIGNUP FORM ────────────────────────────────────────────────────────
  return (
    <AuthShell iconType="user" appName="Frontstore">
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 10px 0',
            lineHeight: 1.25,
            fontFamily: 'var(--font-heading, system-ui, sans-serif)',
          }}
        >
          Create your Online
          <br />
          <span style={{ fontWeight: 800 }}>Store In ~2 Minutes</span>
        </h1>

        {/* Country Badge Selector Pill */}
        <button
          type="button"
          onClick={() => setIsCountryModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            background: '#F4F4F7',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <span style={{ fontSize: 15 }}>{selectedCountry.flag}</span>
          <span>{selectedCountry.name}</span>
          <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
        </button>
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

      {/* ── STEP 1 FORM ── */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmitStep1} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Full Name */}
          <div>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                borderRadius: 12,
                border: focusedInput === 'name' ? '1.5px solid #0B5D39' : '1px solid #EAEAEA',
                background: '#F7F7FA',
                fontSize: 14.5,
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease',
              }}
            />
          </div>

          {/* Email Address */}
          <div>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                borderRadius: 12,
                border: focusedInput === 'email' ? '1.5px solid #0B5D39' : '1px solid #EAEAEA',
                background: '#F7F7FA',
                fontSize: 14.5,
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease',
              }}
            />
          </div>

          {/* Phone Input with Country Code Dropdown Trigger */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 48,
              borderRadius: 12,
              border: focusedInput === 'phone' ? '1.5px solid #0B5D39' : '1px solid #EAEAEA',
              background: '#F7F7FA',
              overflow: 'hidden',
              transition: 'all 0.15s ease',
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
              placeholder="Phone number (Whatsapp)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusedInput('phone')}
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

          {/* How did you find out about Frontstore? Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={findOutSource}
              onChange={(e) => setFindOutSource(e.target.value)}
              onFocus={() => setFocusedInput('findOut')}
              onBlur={() => setFocusedInput(null)}
              style={{
                width: '100%',
                height: 48,
                padding: '0 36px 0 16px',
                borderRadius: 12,
                border: focusedInput === 'findOut' ? '1.5px solid #0B5D39' : '1px solid #EAEAEA',
                background: '#F7F7FA',
                fontSize: 14,
                color: findOutSource ? '#111827' : '#9CA3AF',
                outline: 'none',
                appearance: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled hidden>
                How did you find out about Frontstore?
              </option>
              {FIND_OUT_OPTIONS.map((opt) => (
                <option key={opt} value={opt} style={{ color: '#111827' }}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Optional Customize Store Link Toggle */}
          <div style={{ marginTop: 2 }}>
            <button
              type="button"
              onClick={() => setShowCustomStoreUrl(!showCustomStoreUrl)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0B5D39',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showCustomStoreUrl ? '- Hide store link customization' : '+ Customize store link (optional)'}
            </button>

            {showCustomStoreUrl && (
              <div style={{ marginTop: 8, animation: 'fadeIn 0.2s ease' }}>
                <input
                  type="text"
                  placeholder="custom-store-name"
                  value={username}
                  onChange={(e) => {
                    const slug = toUsernameSlug(e.target.value);
                    setUsername(slug);
                    setIsUsernameManuallyEdited(true);
                  }}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px',
                    borderRadius: 10,
                    border: '1px solid #EAEAEA',
                    background: '#FFFFFF',
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>

          {/* Continue Submit Button */}
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
              marginTop: 8,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#074328';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#0B5D39';
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Continue'}
          </button>
        </form>
      )}

      {/* ── STEP 2 FORM: OTP CODE ── */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmitStep2} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
              Verify Your Email
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Enter the 6-digit code sent to <strong>{email}</strong>
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Complete Setup'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            Didn't receive the code?{' '}
            <button
              type="button"
              disabled={resendCooldown > 0 || loading}
              onClick={() => {
                setResendCooldown(60);
                toast.success('New code sent!');
              }}
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
        Already have an account?{' '}
        <a href="/login" style={{ color: '#0B5D39', fontWeight: 700, textDecoration: 'none' }}>
          Sign in
        </a>
      </div>

      {/* Bottom Step Indicator Dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 20,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: currentStep === 1 ? '#0B5D39' : '#D1D5DB',
            transition: 'all 0.2s ease',
          }}
        />
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: currentStep === 2 ? '#0B5D39' : '#D1D5DB',
            transition: 'all 0.2s ease',
          }}
        />
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: currentStep === 3 ? '#0B5D39' : '#D1D5DB',
            transition: 'all 0.2s ease',
          }}
        />
      </div>

      {/* Country Selection Modal */}
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#042A19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
