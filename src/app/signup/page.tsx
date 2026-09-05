'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ChevronDown, ArrowLeft, Sparkles } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import SelectCountryModal, { COUNTRIES, Country, getSavedCountry, saveCountry, detectAndSaveCountry } from '@/components/SelectCountryModal';

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 7,
  letterSpacing: '0.02em',
};

function toUsernameSlug(value: string): string {
  return value.toLowerCase().replace(/_/g, '-').replace(/[^a-z0-9-]/g, '');
}

const FIND_OUT_OPTIONS = ['Instagram', 'TikTok', 'Twitter / X', 'Facebook', 'Friend or Family referral', 'Google Search', 'Other'];

const STEPS = [
  { label: 'Your details', num: 1 },
  { label: 'Verify email', num: 2 },
];

function SignupFormContent() {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
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
  const [referredBy, setReferredBy] = useState<string>('');
  const [successData, setSuccessData] = useState<{ storeName: string; username: string; storeUrl: string } | null>(null);

  useEffect(() => {
    const saved = getSavedCountry();
    setSelectedCountry(saved);
    detectAndSaveCountry().then((detected) => { if (detected) setSelectedCountry(detected); });
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const q = searchParams.get('username');
    if (q) {
      const cleaned = toUsernameSlug(q);
      setUsername(cleaned);
      const guessed = cleaned.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setStoreName(guessed);
      setIsUsernameManuallyEdited(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const refParam = searchParams.get('ref') || localStorage.getItem('referrer_username');
    if (refParam) setReferredBy(refParam);
  }, [searchParams]);

  const getNormalizedPhone = () => {
    const cleanDial = selectedCountry.dialCode.replace(/[^\d]/g, '');
    let cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith(cleanDial)) cleaned = cleaned.slice(cleanDial.length);
    cleaned = cleaned.replace(/^0+/, '');
    return `+${cleanDial}${cleaned}`;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isUsernameManuallyEdited) {
      const derivedStoreName = val.trim() ? `${val.trim()}'s Store` : '';
      setStoreName(derivedStoreName);
      setUsername(toUsernameSlug(derivedStoreName));
    }
  };

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (!phone.trim()) { setError('Please enter your WhatsApp phone number.'); return; }

    const effectiveStoreName = storeName.trim() || `${name.trim()}'s Store`;
    const effectiveUsername = username.trim() || toUsernameSlug(effectiveStoreName);

    if (lastSentEmail === email.trim().toLowerCase()) { setCurrentStep(2); return; }

    try {
      setLoading(true); setError(null);
      const res = await resilientFetch(`${getApiUrl()}/v1/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), store_name: effectiveStoreName, username: effectiveUsername }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || 'Failed to send verification code.');
      if (json?.is_new_user === false) {
        const errorMsg = 'An account with this email already exists. Please log in instead.';
        toast.error(errorMsg); setError(errorMsg); return;
      }
      toast.success(json?.message || 'Verification code sent to your email!');
      setLastSentEmail(email.trim().toLowerCase());
      setResendCooldown(60);
      setCurrentStep(2);
    } catch (err: any) {
      toast.error(err.message); setError(err.message);
    } finally { setLoading(false); }
  };

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) { setError('Please enter the 6-digit verification code.'); return; }
    const effectiveStoreName = storeName.trim() || `${name.trim()}'s Store`;
    const effectiveUsername = username.trim() || toUsernameSlug(effectiveStoreName);
    try {
      setLoading(true); setError(null);
      const verifyRes = await resilientFetch(`${getApiUrl()}/v1/auth/verify-email-otp`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp, store_name: effectiveStoreName, username: effectiveUsername }),
      });
      const verifyJson = await verifyRes.json().catch(() => null);
      if (!verifyRes.ok) throw new Error(verifyJson?.message || 'Incorrect code. Please try again.');
      if (!verifyJson?.is_new_user) {
        if (typeof window !== 'undefined' && verifyJson?.token) {
          localStorage.setItem('user', JSON.stringify(verifyJson.data?.user));
          localStorage.setItem('store', JSON.stringify(verifyJson.data?.user?.store));
        }
        toast.success(`Welcome back, ${verifyJson?.data?.user?.name || 'Merchant'}!`);
        window.location.replace('/dashboard'); return;
      }
      setSetupToken(verifyJson.setup_token);
      await handleCompleteSetup(verifyJson.setup_token);
    } catch (err: any) {
      toast.error(err.message); setError(err.message);
    } finally { setLoading(false); }
  };

  const handleCompleteSetup = async (tokenToUse: string) => {
    const normalizedPhone = getNormalizedPhone();
    const effectiveStoreName = storeName.trim() || `${name.trim()}'s Store`;
    const effectiveUsername = username.trim() || toUsernameSlug(effectiveStoreName);
    try {
      const setupRes = await resilientFetch(`${getApiUrl()}/v1/auth/complete-setup`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ setup_token: tokenToUse, name: name.trim(), store_name: effectiveStoreName, username: effectiveUsername, email: email.trim(), phone_number: normalizedPhone, country_dial_code: selectedCountry.dialCode, referred_by: referredBy || undefined }),
      });
      const setupJson = await setupRes.json().catch(() => null);
      if (!setupRes.ok) throw new Error(setupJson?.message || 'Failed to complete store setup.');
      const setupTokenResult = setupJson?.data?.token || setupJson?.token;
      if (typeof window !== 'undefined') {
        if (setupTokenResult) localStorage.setItem('token', setupTokenResult);
        if (setupJson?.data?.user) localStorage.setItem('user', JSON.stringify(setupJson.data.user));
        if (setupJson?.data?.store) localStorage.setItem('store', JSON.stringify(setupJson.data.store));
      }
      const finalUrl = setupJson?.data?.store?.url || `https://frontstore.ng/${effectiveUsername}`;
      setSuccessData({ storeName: effectiveStoreName, username: effectiveUsername, storeUrl: finalUrl });
      toast.success('Store created successfully! 🎉');
    } catch (err: any) {
      toast.error(err.message); setError(err.message);
    }
  };

  /* ── Success state ── */
  if (successData) {
    return (
      <AuthShell appName="Frontstore" panelHeadline={"You're live,\nMerchant! 🎉"} panelSubline="Your store is now on the internet. Start adding products and sharing your link.">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 8px 24px -8px rgba(16,185,129,0.35)' }}>
            <CheckCircle2 size={36} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
            Store Created!
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
            <strong style={{ color: '#111827' }}>{successData.storeName}</strong> is now live on the internet.
          </p>
          <div style={{ background: '#F0FDF4', border: '1.5px dashed #4ADE80', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Your live storefront link
            </div>
            <a href={successData.storeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 700, color: '#0B5D39', wordBreak: 'break-all', textDecoration: 'none' }}>
              {successData.storeUrl.replace(/^https?:\/\//, '')}
            </a>
          </div>
          <a href="/dashboard" className="fs-primary-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}>
            Go to Dashboard <ArrowRight size={17} />
          </a>
        </div>
      </AuthShell>
    );
  }

  /* ── Main form ── */
  return (
    <AuthShell appName="Frontstore" panelHeadline={"Start selling online\nin 2 minutes."} panelSubline="No tech skills needed. Your professional store is ready before your coffee cools.">
      <div style={{ width: '100%' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: currentStep >= s.num ? '#0B5D39' : '#E5E7EB', color: currentStep >= s.num ? '#fff' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {currentStep > s.num ? <CheckCircle2 size={14} /> : s.num}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: currentStep === s.num ? 700 : 500, color: currentStep >= s.num ? '#111827' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, background: currentStep > s.num ? '#0B5D39' : '#E5E7EB', borderRadius: 2, transition: 'background 0.3s ease' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          {currentStep === 1 && (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
                Create your store
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                Free forever on Frontstore. No credit card required.
              </p>
            </>
          )}
          {currentStep === 2 && (
            <>
              <button
                onClick={() => { setCurrentStep(1); setOtp(''); setError(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#0B5D39', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16 }}
              >
                <ArrowLeft size={13} /> Change email
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
                Verify your email
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                Code sent to <span style={{ fontWeight: 600, color: '#374151' }}>{email}</span>
              </p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <AlertCircle size={15} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13.5, color: '#DC2626', fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        {/* ── Step 1 ── */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmitStep1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input type="text" required className="fs-input" placeholder="e.g. Amaka Johnson" value={name} onChange={(e) => handleNameChange(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" required className="fs-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp number</label>
              <div style={{ display: 'flex', alignItems: 'center', height: 50, borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F9FAFB', overflow: 'hidden' }}>
                <button type="button" onClick={() => setIsCountryModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: '100%', background: 'transparent', border: 'none', borderRight: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#374151', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <ChevronDown size={13} style={{ color: '#9CA3AF' }} />
                </button>
                <input type="tel" required className="fs-input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flex: 1, height: '100%', padding: '0 14px', border: 'none', background: 'transparent', fontSize: 15, color: '#111827', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>How did you hear about us?</label>
              <div style={{ position: 'relative' }}>
                <select value={findOutSource} onChange={(e) => setFindOutSource(e.target.value)} style={{ ...inputStyle, padding: '0 36px 0 16px', appearance: 'none', cursor: 'pointer', color: findOutSource ? '#111827' : '#9CA3AF' }}>
                  <option value="" disabled hidden>Select an option</option>
                  {FIND_OUT_OPTIONS.map((opt) => <option key={opt} value={opt} style={{ color: '#111827' }}>{opt}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Custom store URL */}
            <div>
              <button type="button" onClick={() => setShowCustomStoreUrl(!showCustomStoreUrl)} style={{ background: 'none', border: 'none', color: '#0B5D39', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {showCustomStoreUrl ? 'Hide store URL customization' : 'Customize your store URL (optional)'}
              </button>
              {showCustomStoreUrl && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#F9FAFB' }}>
                    <span style={{ padding: '0 10px 0 14px', fontSize: 13, color: '#9CA3AF', whiteSpace: 'nowrap', borderRight: '1px solid #E5E7EB', height: 50, display: 'flex', alignItems: 'center' }}>frontstore.ng/</span>
                    <input type="text" className="fs-input" placeholder="my-store" value={username} onChange={(e) => { setUsername(toUsernameSlug(e.target.value)); setIsUsernameManuallyEdited(true); }} style={{ ...inputStyle, border: 'none', borderRadius: 0, height: 50 }} />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="fs-primary-btn" style={{ width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Continue</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmitStep2} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Verification code</label>
              <input
                type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder="000000"
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="fs-input"
                style={{ ...inputStyle, textAlign: 'center', fontSize: 28, letterSpacing: '0.4em', fontWeight: 800, height: 62 }}
              />
            </div>
            <button type="submit" disabled={loading} className="fs-primary-btn" style={{ width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Create Store'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
              Didn&apos;t receive the code?{' '}
              <button type="button" disabled={resendCooldown > 0 || loading} onClick={() => { setResendCooldown(60); toast.success('New code sent!'); }} style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#9CA3AF' : '#0B5D39', fontWeight: 700, cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: 13 }}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={{ margin: '28px 0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
          <span style={{ fontSize: 12, color: '#D1D5DB', whiteSpace: 'nowrap' }}>Already have a store?</span>
          <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
        </div>
        <a
          href="/login"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14.5, fontWeight: 700, color: '#374151', textDecoration: 'none', background: '#FFFFFF' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0B5D39'; e.currentTarget.style.color = '#0B5D39'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
        >
          Sign in to existing account
        </a>
      </div>

      <SelectCountryModal isOpen={isCountryModalOpen} onClose={() => setIsCountryModalOpen(false)} selectedCountry={selectedCountry} onSelectCountry={(c) => { setSelectedCountry(c); saveCountry(c); }} />
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#042A19', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}><Loader2 size={32} className="animate-spin" /></div>}>
      <SignupFormContent />
    </Suspense>
  );
}
