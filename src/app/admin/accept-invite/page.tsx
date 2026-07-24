'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAdmin } from '../AdminContext';
import { Shield, Lock, Eye, EyeOff, Loader2, ArrowRight, UserCheck } from 'lucide-react';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAdmin();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('This invitation link is missing its token.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/v1/auth/accept-staff-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Could not activate this account.');
      }

      login(json.data.token, json.data.user, null);
      toast.success('Account activated! Welcome to the team.');
      router.push('/admin');
    } catch (err: any) {
      setError(
        err instanceof TypeError
          ? 'Could not reach the server. Please try again.'
          : err.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--primary-light)',
            marginBottom: 20,
          }}>
            <UserCheck size={26} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>
            Activate Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5 }}>
            Set a password to access the platform console.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            border: '1.5px solid rgba(239, 68, 68, 0.15)',
            borderRadius: 'var(--r-xl)',
            padding: '14px 18px',
            fontSize: 14,
            marginBottom: 24,
            fontWeight: 600,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}>
            <Shield size={18} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 44, paddingRight: 48 }}
                  autoComplete="new-password"
                />
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', padding: 4 }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={passwordConfirmation}
                  onChange={e => setPasswordConfirmation(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 44 }}
                  autoComplete="new-password"
                />
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary clickable"
            style={{
              padding: '16px',
              fontSize: 16,
              borderRadius: 'var(--r-xl)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{loading ? 'Activating...' : 'Activate Account'}</span>
            {!loading ? <ArrowRight size={18} /> : null}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}
