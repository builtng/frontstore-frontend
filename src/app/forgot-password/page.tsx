'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Mail } from 'lucide-react';
import AuthShell from '@/components/AuthShell';

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await resilientFetch(`${getApiUrl()}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send password reset link.');
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      appName="Frontstore"
      panelHeadline={"Security first,\nalways."}
      panelSubline="We take your account security seriously. Reset your password and get back to selling."
    >
      <div style={{ width: '100%' }}>

        {/* Back link */}
        <a
          href="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 28, transition: 'color 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#0B5D39'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </a>

        {!submitted ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Mail size={22} style={{ color: '#0B5D39' }} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
                Reset your password
              </h1>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.55 }}>
                Enter the email address linked to your account and we&apos;ll send you a reset link.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
                <AlertCircle size={15} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13.5, color: '#DC2626', fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '0.02em' }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  className="fs-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="fs-primary-btn"
                style={{ width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', boxShadow: '0 8px 24px -8px rgba(16,185,129,0.35)' }}>
              <CheckCircle2 size={36} style={{ color: '#16A34A' }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 10, letterSpacing: '-0.025em', fontFamily: 'var(--font-heading, system-ui)' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.65 }}>
              We&apos;ve sent password reset instructions to{' '}
              <span style={{ fontWeight: 700, color: '#111827' }}>{email}</span>.<br />
              Check your spam folder if you don&apos;t see it.
            </p>
            <a
              href="/login"
              className="fs-primary-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 50, background: '#0B5D39', color: '#FFFFFF', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px -4px rgba(11,93,57,0.3)' }}
            >
              <ArrowLeft size={16} /> Return to sign in
            </a>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
