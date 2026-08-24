'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  token: string;
}

const WA = ({ s = 20, c = 'currentColor' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);
const Check = ({ s = 18, c = 'currentColor' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Spinner = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ animation: 'av-spin 0.8s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const AlertIc = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const css = `
  .av-root { min-height: 100vh; background: #0b141a; color: #e9edef; display: flex; flex-direction: column; position: relative; overflow: hidden; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .av-glow { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 640px; height: 640px; background: radial-gradient(circle, rgba(37,211,102,0.16) 0%, transparent 70%); pointer-events: none; }
  .av-header { position: relative; padding: 22px 24px; display: flex; justify-content: center; }
  .av-mark { display: inline-flex; align-items: center; gap: 8px; font-weight: 800; font-size: 16px; letter-spacing: -0.02em; }
  .av-mark-dot { width: 24px; height: 24px; border-radius: 50%; background: #25d366; display: grid; place-items: center; }
  .av-main { position: relative; flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .av-card { width: 100%; max-width: 400px; background: #111b21; border: 1px solid #2a3942; border-radius: 18px; padding: 32px 28px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
  .av-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(37,211,102,0.12); color: #25d366; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 999px; width: fit-content; margin-bottom: 14px; }
  .av-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #25d366; }
  .av-title { font-size: 22px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.01em; }
  .av-sub { font-size: 13.5px; color: #8696a0; line-height: 1.5; margin: 0 0 20px; }
  .av-error { display: flex; align-items: flex-start; gap: 8px; background: rgba(240,114,106,0.1); color: #f0726a; padding: 10px 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
  .av-form { display: flex; flex-direction: column; gap: 16px; }
  .av-field { display: flex; flex-direction: column; gap: 6px; }
  .av-label { font-size: 12.5px; font-weight: 600; color: #8696a0; }
  .av-input { background: #202c33; border: 1px solid #2a3942; border-radius: 10px; padding: 12px 14px; font-size: 15px; color: #e9edef; outline: none; letter-spacing: 0.02em; }
  .av-input:focus { border-color: #25d366; }
  .av-otp-input { text-align: center; font-size: 22px; letter-spacing: 0.5em; font-weight: 700; }
  .av-btn { background: #25d366; color: #0b141a; border: none; border-radius: 10px; padding: 13px 18px; font-weight: 800; font-size: 14.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .av-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .av-link-btn { background: none; border: none; color: #8696a0; font-size: 13px; cursor: pointer; text-decoration: underline; align-self: center; margin-top: 4px; }
  .av-success-ic { width: 56px; height: 56px; border-radius: 50%; background: #25d366; display: grid; place-items: center; margin: 0 auto 18px; }
  .av-card--success { align-items: center; text-align: center; }
  @keyframes av-spin { to { transform: rotate(360deg); } }
`;

export default function ActivateAccountClient({ token }: Props) {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [step, setStep] = useState<'email' | 'otp' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/v1/auth/activate/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Could not send verification code. Please try again.');
        return;
      }

      setStep('otp');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loading || otp.trim().length !== 6) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/v1/auth/activate/verify-email-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, otp: otp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Incorrect or expired code. Please try again.');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('store', JSON.stringify(data.data.store));
      }

      setStep('done');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="av-root">
        <div className="av-glow" />

        <header className="av-header">
          <span className="av-mark">
            <span className="av-mark-dot"><WA s={13} c="#0b141a" /></span>
            Frontstore
          </span>
        </header>

        <main className="av-main">
          {step === 'done' ? (
            <div className="av-card av-card--success">
              <div className="av-success-ic">
                <Check s={30} c="#0b141a" />
              </div>
              <h1 className="av-title">You&apos;re activated!</h1>
              <p className="av-sub">Your email is verified and your payment account is being generated. Taking you to your dashboard…</p>
            </div>
          ) : step === 'otp' ? (
            <div className="av-card">
              <div className="av-badge">
                <span className="av-badge-dot" />
                Store is live
              </div>
              <h1 className="av-title">Enter your code</h1>
              <p className="av-sub">We sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your email.</p>

              {error && (
                <div className="av-error" role="alert">
                  <AlertIc s={16} />
                  <span>{error}</span>
                </div>
              )}

              <form className="av-form" onSubmit={handleVerifyOtp} noValidate>
                <div className="av-field">
                  <label className="av-label" htmlFor="av-otp">Verification Code</label>
                  <input
                    id="av-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="av-input av-otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    autoFocus
                    required
                  />
                </div>

                <button type="submit" className="av-btn" disabled={loading || otp.trim().length !== 6}>
                  {loading ? <Spinner s={16} /> : null}
                  {loading ? 'Verifying…' : 'Verify & Activate'}
                </button>

                <button type="button" className="av-link-btn" onClick={() => { setStep('email'); setOtp(''); setError(''); }}>
                  Use a different email
                </button>
              </form>
            </div>
          ) : (
            <div className="av-card">
              <div className="av-badge">
                <span className="av-badge-dot" />
                Store is live
              </div>
              <h1 className="av-title">Verify your email</h1>
              <p className="av-sub">
                One last step — verify your email to activate your account. This also generates your dedicated payment account, so orders can be paid straight to you.
              </p>

              {error && (
                <div className="av-error" role="alert">
                  <AlertIc s={16} />
                  <span>{error}</span>
                </div>
              )}

              <form className="av-form" onSubmit={handleSendOtp} noValidate>
                <div className="av-field">
                  <label className="av-label" htmlFor="av-email">Email Address</label>
                  <input
                    id="av-email"
                    type="email"
                    className="av-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    autoFocus
                    required
                  />
                </div>

                <button type="submit" className="av-btn" disabled={loading || !email.trim()}>
                  {loading ? <Spinner s={16} /> : null}
                  {loading ? 'Sending…' : 'Send Verification Code'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
