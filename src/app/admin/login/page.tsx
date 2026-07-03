'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Shield, Lock, Eye, EyeOff, Loader2, ArrowRight, Mail, LogIn,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [appName, setAppName] = useState('Frontstore');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  // Redirect if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const isAdmin = parsedUser?.is_admin === true || parsedUser?.is_admin === 1 || parsedUser?.is_admin === 'true' || parsedUser?.is_admin === '1';
        if (isAdmin) router.replace('/admin');
      } catch {
        // ignore parse errors
      }
    }
  }, [router]);

  // Load app name
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/public/settings`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.app_name) setAppName(json.data.app_name);
      } catch {
        // keep fallback
      }
    };
    loadSettings();
  }, [API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Login failed. Please check your credentials.');
      }

      const user = json.data?.user;
      const isAdmin = user?.is_admin === true || user?.is_admin === 1 || user?.is_admin === 'true' || user?.is_admin === '1';

      if (!isAdmin) {
        throw new Error('This account does not have administrator permissions.');
      }

      localStorage.setItem('token', json.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('store', JSON.stringify(json.data.store || null));

      toast.success('Welcome, Administrator!');
      router.push('/admin');
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
        {/* Header */}
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
            <Shield size={26} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 900,
            color: 'var(--text)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>
            Admin Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5 }}>
            {appName} platform management portal
          </p>
        </div>

        {/* Error banner */}
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
            <LogIn size={18} style={{ flexShrink: 0 }} /> {error}
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
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Admin Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@frontstore.app"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{
                    paddingLeft: 44,
                    borderColor: focusedInput === 'email' ? 'var(--primary)' : 'var(--border)',
                  }}
                  autoComplete="username"
                />
                <Mail size={18} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedInput === 'email' ? 'var(--primary)' : 'var(--text-faint)',
                  transition: 'color var(--t-fast)',
                }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className="input-field"
                  style={{
                    paddingLeft: 44,
                    paddingRight: 48,
                    borderColor: focusedInput === 'password' ? 'var(--primary)' : 'var(--border)',
                  }}
                  autoComplete="current-password"
                />
                <Lock size={18} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedInput === 'password' ? 'var(--primary)' : 'var(--text-faint)',
                  transition: 'color var(--t-fast)',
                }} />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-faint)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
            <span>{loading ? 'Signing in...' : 'Access Admin Portal'}</span>
            {!loading ? <ArrowRight size={18} /> : null}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Not an admin?{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Go to merchant login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
