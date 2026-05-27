'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Sparkles, Globe, Store, Lock, Eye, EyeOff, Loader2, ArrowRight, Phone, Check, LogIn
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      setError('Please enter your phone number and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phone,
          password: password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Login failed. Please check your credentials.');
      }

      if (typeof window !== 'undefined' && json.data?.token) {
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data.user));
        localStorage.setItem('store', JSON.stringify(json.data.store || null));
        
        toast.success('Welcome back to aloaye! 👋');
        router.push('/dashboard');
      } else {
        throw new Error('No authentication token received.');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <a
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', marginBottom: 12 }}
        >
          <Store size={28} style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
          <span>aloaye</span>
        </a>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Merchant Log In
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.5 }}>
          Access your digital storefront dashboard, manage orders, and upload products.
        </p>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'var(--danger-light)', color: 'var(--danger)',
          border: '1.5px solid rgba(239, 68, 68, 0.15)',
          borderRadius: 'var(--r-xl)', padding: '14px 18px',
          fontSize: 14, marginBottom: 24, fontWeight: 600,
          display: 'flex', gap: 10, alignItems: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
        }}>
          <LogIn size={18} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
            >
              WhatsApp Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="phone"
                type="tel"
                required
                placeholder="e.g. +2348031234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                style={{
                  paddingLeft: 44,
                  borderColor: focusedInput === 'phone' ? 'var(--primary)' : 'var(--border)'
                }}
                autoComplete="tel"
              />
              <Phone size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'phone' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
              Use your registered WhatsApp phone number (with country code e.g. +234...)
            </span>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Enter your account password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="input-field"
                style={{
                  paddingLeft: 44,
                  paddingRight: 48,
                  borderColor: focusedInput === 'password' ? 'var(--primary)' : 'var(--border)'
                }}
                autoComplete="current-password"
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focusedInput === 'password' ? 'var(--primary)' : 'var(--text-faint)',
                transition: 'color var(--t-fast)'
              }} />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none', background: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-faint)', padding: 4,
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary clickable"
          style={{
            padding: '16px',
            fontSize: 16,
            borderRadius: 'var(--r-xl)',
            marginTop: 8,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: 'var(--shadow-primary)'
          }}
          id="login-btn"
        >
          {loading ? (
            <><Loader2 size={18} className="spinner" /> Signing In...</>
          ) : (
            <>Access Dashboard <ArrowRight size={18} /></>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 8 }}>
          Don't have a store yet?{' '}
          <a href="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
            Create storefront
          </a>
        </p>

      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'row',
      width: '100%'
    }}>
      {/* LEFT PANEL: Premium value prop (visible on desktop) */}
      <div className="left-hero-panel" style={{
        flex: 1.1,
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Soft floating blur shapes */}
        <div style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-10%',
          right: '-10%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          bottom: '-5%',
          left: '-5%',
          filter: 'blur(60px)'
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-heading)',
            fontSize: 24,
            fontWeight: 900,
            marginBottom: 48,
            color: '#fff'
          }}>
            <Store size={26} style={{ strokeWidth: 2.5 }} />
            <span>aloaye</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 24,
            letterSpacing: '-0.03em'
          }}>
            Welcome Back to Your Store Headquarters.
          </h2>

          <p style={{
            fontSize: 17,
            opacity: 0.9,
            lineHeight: 1.6,
            marginBottom: 40,
            fontWeight: 500
          }}>
            Sign in to manage your orders, tweak storefront settings, create products with Gemini AI descriptions, and interact with prospective buyers in real time.
          </p>

          {/* Quick specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'Track visitor views & conversion rates',
              'Update order shipping & payment statuses',
              'Generate Gemini AI product descriptions',
              'Manage storefront details in real-time'
            ].map(spec => (
              <div key={spec} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={14} style={{ color: '#fff', strokeWidth: 3 }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form card */}
      <div className="right-form-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 20px',
        maxWidth: 580,
        margin: '0 auto',
        width: '100%',
        minHeight: '100vh',
      }}>
        {/* Subtle decorative blob */}
        <div style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          zIndex: -1,
          top: '30%',
          right: '5%',
          filter: 'blur(40px)'
        }} />

        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
            <div className="spinner spinner-primary" style={{ width: 36, height: 36 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading storefront dashboard login...</span>
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>

      {/* Styled JSX/Responsive rules for pure CSS hero hidden logic */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .left-hero-panel {
            display: none !important;
          }
          .right-form-panel {
            max-width: 480px !important;
            padding: 32px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
