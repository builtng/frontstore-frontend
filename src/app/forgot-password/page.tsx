'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import AuthShell from '@/components/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const API_URL = getApiUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await resilientFetch(`${API_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to send password reset link.');
      }

      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell iconType="store" appName="Frontstore">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 6px 0',
            fontFamily: 'var(--font-heading, system-ui, sans-serif)',
          }}
        >
          Reset your password
        </h1>
        <p
          style={{
            fontSize: 13.5,
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {submitted
            ? 'Check your email inbox for password recovery instructions.'
            : 'Enter the email address associated with your account to receive a reset link.'}
        </p>
      </div>

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

      {submitted ? (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 20 }}>
            We've sent password reset instructions to <strong>{email}</strong>.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              height: 48,
              background: '#0B5D39',
              color: '#FFFFFF',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Return to Sign in
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <input
              type="email"
              required
              placeholder="Your email"
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      )}

      {!submitted && (
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13.5, color: '#6B7280' }}>
          Remembered your password?{' '}
          <a
            href="/login"
            style={{
              color: '#0B5D39',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign in
          </a>
        </div>
      )}
    </AuthShell>
  );
}
