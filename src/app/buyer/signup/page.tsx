'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Store, Lock, Eye, EyeOff, Loader2, ArrowRight, ShoppingBag, Check, User
} from 'lucide-react';

const countries = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

export default function BuyerSignupPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('buyer_token')) {
      router.push('/?tab=account');
    }
  }, [router]);

  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const close = () => setIsCountryDropdownOpen(false);
    const timer = setTimeout(() => window.addEventListener('click', close), 50);
    return () => { clearTimeout(timer); window.removeEventListener('click', close); };
  }, [isCountryDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      setError('Please fill in your name, phone number, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/v1/buyer/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name,
          phone_number: phone,
          country_dial_code: selectedCountry.dialCode,
          password,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const firstError = json.errors ? Object.values(json.errors)[0] as string[] : null;
        throw new Error(firstError?.[0] || json.message || 'Could not create your account.');
      }

      if (typeof window !== 'undefined' && json.data?.token) {
        localStorage.setItem('buyer_token', json.data.token);
        localStorage.setItem('buyer', JSON.stringify(json.data.buyer));
        toast.success(`Welcome to frontstore, ${json.data.buyer?.name || 'shopper'}! 🛍️`);
        router.push('/?tab=account');
      } else {
        throw new Error('No authentication token received.');
      }
    } catch (err: any) {
      setError(err instanceof TypeError
        ? `Could not reach the server. Please try again.`
        : err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <header style={{ textAlign: 'center', marginBottom: 28 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', marginBottom: 12 }}>
            <Store size={24} style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
            <span>frontstore</span>
          </a>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>
            Create your buyer account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Save your details once, then check out faster everywhere.
          </p>
        </header>

        {error && (
          <div style={{
            background: 'var(--danger-light)', color: 'var(--danger)',
            border: '1.5px solid rgba(239, 68, 68, 0.15)', borderRadius: 'var(--r-xl)',
            padding: '12px 16px', fontSize: 13.5, marginBottom: 18, fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amaka Johnson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 44 }}
                  autoComplete="name"
                />
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Phone Number
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
                background: 'var(--surface)', position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsCountryDropdownOpen(v => !v); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', minHeight: 46, background: 'none', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}
                >
                  <span style={{ fontSize: 16 }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
                </button>
                <input
                  type="tel"
                  required
                  placeholder="803 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ flex: 1, padding: '12px 14px', border: 'none', fontSize: 15, outline: 'none', background: 'transparent', color: 'var(--text)', minWidth: 0 }}
                  autoComplete="tel"
                />
                {isCountryDropdownOpen && (
                  <div className="glass animate-scale-in" style={{
                    position: 'absolute', top: '110%', left: 0, width: 240, maxHeight: 220, overflowY: 'auto',
                    borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', background: 'var(--surface)',
                    boxShadow: 'var(--shadow-lg)', zIndex: 100, padding: '6px 0'
                  }}>
                    {countries.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setSelectedCountry(c); setIsCountryDropdownOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                          padding: '9px 14px', background: selectedCountry.code === c.code ? 'var(--primary-light)' : 'none',
                          border: 'none', cursor: 'pointer', fontSize: 13.5, textAlign: 'left',
                          color: selectedCountry.code === c.code ? 'var(--primary)' : 'var(--text)',
                          fontWeight: selectedCountry.code === c.code ? 750 : 600
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                          {c.dialCode}
                          {selectedCountry.code === c.code ? <Check size={12} color="var(--primary)" /> : null}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Password
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
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-faint)', padding: 4 }}
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
            style={{ padding: '15px', fontSize: 15.5, borderRadius: 'var(--r-xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-primary)' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading ? <ArrowRight size={18} /> : null}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <a href="/buyer/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Sign in
            </a>
          </p>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>
            Looking to sell instead?{' '}
            <a href="/merchant/register" style={{ color: 'var(--text-muted)', fontWeight: 700, textDecoration: 'underline' }}>
              Create a seller account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
