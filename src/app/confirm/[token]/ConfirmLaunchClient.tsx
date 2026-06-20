'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  token: string;
}

/* ── icons ─────────────────────────────────────────────────────────────── */
const WA = ({ s = 20, c = 'currentColor' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);
const EyeOn = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a17.55 17.55 0 0 1 5.06-6.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Check = ({ s = 18, c = 'currentColor' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Spinner = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ animation: 'cl-spin 0.8s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const AlertIc = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── strength helper ────────────────────────────────────────────────────── */
function strength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#2a3942' };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak', color: '#f0726a' };
  if (s <= 2) return { score: s, label: 'Fair', color: '#d8b25a' };
  if (s <= 3) return { score: s, label: 'Good', color: '#4fc3f7' };
  return { score: s, label: 'Strong', color: '#25d366' };
}

/* ── component ──────────────────────────────────────────────────────────── */
export default function ConfirmLaunchClient({ token }: Props) {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  
  const [tokenType, setTokenType] = useState<'launch' | 'verify' | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  const pw = strength(password);
  const match = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && match && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/v1/auth/confirm-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, password, password_confirmation: confirm }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // Store auth data exactly as the dashboard expects
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('store', JSON.stringify(data.data.store));
      }

      setDone(true);

      // Small pause so user sees success state, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token || token.length < 16) {
      setError('This activation link appears to be invalid or incomplete.');
      setCheckingToken(false);
      return;
    }

    async function handleAutoVerify() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API}/v1/auth/confirm-launch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Verification failed. Please try again.');
          setCheckingToken(false);
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('auth_token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('store', JSON.stringify(data.data.store));
        }

        setDone(true);
        setCheckingToken(false);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1800);
      } catch {
        setError('Network error during auto-verification.');
        setCheckingToken(false);
      } finally {
        setLoading(false);
      }
    }

    async function check() {
      try {
        const res = await fetch(`${API}/v1/auth/check-token?token=${token}`, {
          headers: { Accept: 'application/json' }
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'This link is invalid or has expired.');
          setCheckingToken(false);
          return;
        }

        setTokenType(data.data.type);

        if (data.data.type === 'verify') {
          await handleAutoVerify();
        } else {
          setCheckingToken(false);
        }
      } catch (err) {
        setError('Connection error. Please try reloading the page.');
        setCheckingToken(false);
      }
    }

    check();
  }, [token, API, router]);

  if (checkingToken) {
    return (
      <>
        <style>{css}</style>
        <div className="cl-root">
          <div className="cl-glow" />
          <header className="cl-header">
            <span className="cl-mark">
              <span className="cl-mark-dot"><WA s={13} c="#0b141a" /></span>
              Frontstore
            </span>
          </header>
          <main className="cl-main">
            <div className="cl-card" style={{ alignItems: 'center', textAlign: 'center', gap: 16 }}>
              <Spinner s={32} />
              <h1 className="cl-title" style={{ marginTop: 8 }}>Verifying...</h1>
              <p className="cl-sub">Checking your activation link and preparing your dashboard.</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error && !tokenType) {
    return (
      <>
        <style>{css}</style>
        <div className="cl-root">
          <div className="cl-glow" />
          <header className="cl-header">
            <span className="cl-mark">
              <span className="cl-mark-dot"><WA s={13} c="#0b141a" /></span>
              Frontstore
            </span>
          </header>
          <main className="cl-main">
            <div className="cl-card" style={{ gap: 20 }}>
              <div className="cl-error" role="alert">
                <AlertIc s={16} />
                <span>{error}</span>
              </div>
              <p className="cl-sub" style={{ textAlign: 'center' }}>
                Please check the link sent to your WhatsApp or contact support.
              </p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="cl-root">
        <div className="cl-glow" />

        {/* ── header ── */}
        <header className="cl-header">
          <span className="cl-mark">
            <span className="cl-mark-dot"><WA s={13} c="#0b141a" /></span>
            Frontstore
          </span>
        </header>

        <main className="cl-main">
          {done ? (
            /* ── success state ── */
            <div className="cl-card cl-card--success">
              <div className="cl-success-ic">
                <Check s={30} c="#0b141a" />
              </div>
              <h1 className="cl-title">You&apos;re in!</h1>
              <p className="cl-sub">Your store is live and your account is active. Taking you to your dashboard…</p>
              <div className="cl-redirect-bar">
                <div className="cl-redirect-fill" />
              </div>
            </div>
          ) : (
            /* ── password form ── */
            <div className="cl-card">
              <div className="cl-badge">
                <span className="cl-badge-dot" />
                Store is live
              </div>

              <h1 className="cl-title">Set your password</h1>
              <p className="cl-sub">
                Your store is ready. Create a password to access your dashboard and start selling.
              </p>

              {error && (
                <div className="cl-error" role="alert">
                  <AlertIc s={16} />
                  <span>{error}</span>
                </div>
              )}

              <form className="cl-form" onSubmit={handleSubmit} noValidate>
                {/* New password */}
                <div className="cl-field">
                  <label className="cl-label" htmlFor="cl-pw">New Password</label>
                  <div className="cl-input-wrap">
                    <input
                      id="cl-pw"
                      type={showPw ? 'text' : 'password'}
                      className="cl-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      className="cl-eye"
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff s={17} /> : <EyeOn s={17} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="cl-strength">
                      <div className="cl-strength-track">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className="cl-strength-seg"
                            style={{ background: i <= pw.score ? pw.color : '#2a3942' }}
                          />
                        ))}
                      </div>
                      {pw.label && (
                        <span className="cl-strength-label" style={{ color: pw.color }}>
                          {pw.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="cl-field">
                  <label className="cl-label" htmlFor="cl-cf">Confirm Password</label>
                  <div className={`cl-input-wrap ${mismatch ? 'cl-input-wrap--bad' : match ? 'cl-input-wrap--ok' : ''}`}>
                    <input
                      id="cl-cf"
                      type={showCf ? 'text' : 'password'}
                      className="cl-input"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="cl-eye"
                      onClick={() => setShowCf(v => !v)}
                      aria-label={showCf ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showCf ? <EyeOff s={17} /> : <EyeOn s={17} />}
                    </button>
                    {match && (
                      <span className="cl-match-ic"><Check s={14} c="#25d366" /></span>
                    )}
                  </div>
                  {mismatch && (
                    <p className="cl-field-hint cl-field-hint--bad">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="cl-submit"
                  className={`cl-btn ${!canSubmit ? 'cl-btn--disabled' : ''}`}
                  disabled={!canSubmit}
                >
                  {loading ? (
                    <><Spinner s={17} /> Activating…</>
                  ) : (
                    '🚀 Activate My Store'
                  )}
                </button>
              </form>

              <p className="cl-note">
                A confirmation will be sent to your WhatsApp once your account is active.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

/* ── styles ─────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.cl-root *{box-sizing:border-box;margin:0;padding:0}
.cl-root{
  --bg:#0b141a;--panel:#111b21;--raise:#1d2a33;--field:#1a242c;
  --line:rgba(255,255,255,.08);--line2:rgba(255,255,255,.14);
  --text:#e9edef;--muted:#8696a0;--green:#25d366;--bad:#f0726a;
  font-family:'Inter',system-ui,sans-serif;
  color:var(--text);background:var(--bg);
  min-height:100vh;width:100%;position:relative;overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  display:flex;flex-direction:column;
}

/* glow */
.cl-glow{
  position:fixed;top:-180px;left:50%;transform:translateX(-50%);
  width:560px;height:400px;max-width:100%;
  background:radial-gradient(closest-side,rgba(37,211,102,.16),transparent 70%);
  pointer-events:none;z-index:0;
}

/* header */
.cl-header{
  position:relative;z-index:1;
  display:flex;align-items:center;padding:22px 24px 0;
}
.cl-mark{
  display:inline-flex;align-items:center;gap:9px;
  font-weight:700;font-size:18px;letter-spacing:-.01em;color:var(--text);
}
.cl-mark-dot{
  width:26px;height:26px;border-radius:8px;background:var(--green);
  display:flex;align-items:center;justify-content:center;flex:none;
}

/* main */
.cl-main{
  flex:1;display:flex;align-items:center;justify-content:center;
  padding:32px 20px 48px;position:relative;z-index:1;
}

/* card */
.cl-card{
  width:100%;max-width:440px;
  background:var(--panel);border:1px solid var(--line2);border-radius:20px;
  padding:36px 32px;display:flex;flex-direction:column;gap:20px;
  box-shadow:0 24px 64px rgba(0,0,0,.4);
  animation:cl-fadein .35s ease both;
}
@keyframes cl-fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

/* badge */
.cl-badge{
  display:inline-flex;align-items:center;gap:7px;
  font-size:12px;font-weight:600;color:var(--green);
  background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.24);
  padding:5px 11px;border-radius:999px;width:fit-content;
}
.cl-badge-dot{
  width:7px;height:7px;border-radius:50%;background:var(--green);
  box-shadow:0 0 0 3px rgba(37,211,102,.2);
  animation:cl-pulse 2s ease infinite;
}
@keyframes cl-pulse{0%,100%{box-shadow:0 0 0 3px rgba(37,211,102,.2)}50%{box-shadow:0 0 0 5px rgba(37,211,102,.08)}}

.cl-title{font-size:clamp(22px,4vw,28px);font-weight:800;letter-spacing:-.02em;line-height:1.1}
.cl-sub{font-size:14.5px;line-height:1.6;color:var(--muted)}

/* error */
.cl-error{
  display:flex;align-items:flex-start;gap:9px;
  background:rgba(240,114,106,.1);border:1px solid rgba(240,114,106,.28);
  color:#f0726a;border-radius:12px;padding:12px 14px;font-size:13.5px;line-height:1.5;
}

/* form */
.cl-form{display:flex;flex-direction:column;gap:18px}
.cl-field{display:flex;flex-direction:column;gap:7px}
.cl-label{font-size:13px;font-weight:600;color:var(--muted);letter-spacing:.01em}

/* input */
.cl-input-wrap{position:relative}
.cl-input{
  width:100%;background:var(--field);border:1.5px solid var(--line2);border-radius:12px;
  color:var(--text);font-size:15px;font-family:inherit;
  padding:13px 44px 13px 16px;outline:none;transition:border-color .2s;
}
.cl-input:focus{border-color:var(--green)}
.cl-input::placeholder{color:var(--muted)}
.cl-input-wrap--bad .cl-input{border-color:var(--bad)}
.cl-input-wrap--ok .cl-input{border-color:rgba(37,211,102,.5)}

/* eye toggle */
.cl-eye{
  position:absolute;right:13px;top:50%;transform:translateY(-50%);
  background:none;border:none;color:var(--muted);cursor:pointer;
  display:flex;align-items:center;padding:4px;border-radius:6px;
  transition:color .15s;
}
.cl-eye:hover{color:var(--text)}

/* match icon */
.cl-match-ic{
  position:absolute;right:40px;top:50%;transform:translateY(-50%);
  display:flex;align-items:center;pointer-events:none;
}

/* strength bar */
.cl-strength{display:flex;align-items:center;gap:10px;margin-top:2px}
.cl-strength-track{display:flex;gap:4px;flex:1}
.cl-strength-seg{flex:1;height:4px;border-radius:999px;transition:background .25s}
.cl-strength-label{font-size:12px;font-weight:600;white-space:nowrap;transition:color .25s}

/* hint */
.cl-field-hint{font-size:12px;color:var(--muted)}
.cl-field-hint--bad{color:var(--bad)}

/* button */
.cl-btn{
  width:100%;padding:15px;border-radius:13px;border:none;cursor:pointer;
  background:var(--green);color:#0b141a;font-size:15px;font-weight:700;
  font-family:inherit;letter-spacing:-.01em;
  display:flex;align-items:center;justify-content:center;gap:9px;
  transition:opacity .15s,transform .12s;
}
.cl-btn:hover:not(.cl-btn--disabled){opacity:.9;transform:translateY(-1px)}
.cl-btn:active:not(.cl-btn--disabled){transform:none}
.cl-btn--disabled{opacity:.45;cursor:not-allowed}

.cl-note{
  text-align:center;font-size:12.5px;color:var(--muted);
  padding-top:4px;line-height:1.5;
}

/* success state */
.cl-card--success{align-items:center;text-align:center;gap:16px}
.cl-success-ic{
  width:68px;height:68px;border-radius:50%;
  background:var(--green);display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 12px rgba(37,211,102,.12),0 0 0 24px rgba(37,211,102,.06);
  animation:cl-pop .4s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes cl-pop{from{transform:scale(0)}to{transform:scale(1)}}
.cl-redirect-bar{
  width:100%;height:4px;background:var(--raise);border-radius:999px;overflow:hidden;
}
.cl-redirect-fill{
  height:100%;background:var(--green);border-radius:999px;
  animation:cl-progress 1.8s linear forwards;
}
@keyframes cl-progress{from{width:0%}to{width:100%}}

/* spinner */
@keyframes cl-spin{to{transform:rotate(360deg)}}

@media(max-width:480px){
  .cl-card{padding:28px 20px;border-radius:16px}
  .cl-title{font-size:22px}
}
`;
