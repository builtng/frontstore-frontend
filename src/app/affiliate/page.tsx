'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Copy, LogIn, Wallet, Landmark, UserPlus } from 'lucide-react';

interface AffiliateDashboardData {
  affiliate_withdrawable_balance: number;
  affiliate_pending_balance: number;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_account_verified: boolean;
  affiliations: {
    id: string;
    status: string;
    tracking_code: string;
    store: { id: string; store_name: string; username: string };
    products: { product_id: string; product_name: string; commission_percent: number; link: string | null }[];
  }[];
  earnings: { id: string; store_name: string; product_name: string; amount: number; status: string; created_at: string }[];
  withdrawals: { id: string; amount: string; status: string; reference: string; created_at: string }[];
}

const getCurrencySymbol = (code?: string) => {
  if (code === 'NGN') return '₦';
  if (code === 'GHS') return 'GH₵';
  if (code === 'KES') return 'KSh';
  if (code === 'ZAR') return 'R';
  if (code === 'USD') return '$';
  if (code === 'GBP') return '£';
  return (code || '') + ' ';
};

const formatVal = (val: number | string) => Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AffiliatePortalPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [data, setData] = useState<AffiliateDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setCheckingAuth(false);
  }, []);

  const authHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const loadDashboard = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/v1/affiliate/dashboard`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
        setBankName(json.data.bank_name || '');
        setAccountNumber(json.data.bank_account_number || '');
        setAccountName(json.data.bank_account_name || '');
      } else {
        toast.error(json.message || 'Failed to load your affiliate dashboard.');
      }
    } catch {
      toast.error('Network error loading your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoggingIn(true);
      const res = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = await res.json();
      if (res.ok && json.data?.token) {
        localStorage.setItem('token', json.data.token);
        setToken(json.data.token);
      } else {
        toast.error(json.message || 'Login failed.');
      }
    } catch {
      toast.error('Network error logging in.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBank(true);
      const res = await fetch(`${API_URL}/v1/affiliate/bank-details`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ bank_name: bankName, account_number: accountNumber, account_name: accountName }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Bank details saved.');
        loadDashboard();
      } else {
        toast.error(json.message || 'Failed to save bank details.');
      }
    } catch {
      toast.error('Network error saving bank details.');
    } finally {
      setSavingBank(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await fetch(`${API_URL}/v1/affiliate/withdraw/send-otp`, { method: 'POST', headers: authHeaders() });
      const json = await res.json();
      if (res.ok) {
        toast.success('Verification code sent.');
        setOtpSent(true);
        if (json.data?.debug_otp) setOtpCode(json.data.debug_otp);
      } else {
        toast.error(json.message || 'Failed to send verification code.');
      }
    } catch {
      toast.error('Network error sending verification code.');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setWithdrawing(true);
      const res = await fetch(`${API_URL}/v1/affiliate/withdraw`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), otp_code: otpCode }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Withdrawal request submitted.');
        setWithdrawAmount('');
        setOtpCode('');
        setOtpSent(false);
        loadDashboard();
      } else {
        toast.error(json.message || 'Withdrawal failed.');
      }
    } catch {
      toast.error('Network error submitting withdrawal.');
    } finally {
      setWithdrawing(false);
    }
  };

  const copyLink = (link: string) => {
    const full = link.startsWith('http') ? link : `${window.location.origin}${link}`;
    navigator.clipboard.writeText(full);
    toast.success('Link copied.');
  };

  if (checkingAuth) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: 24 }}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <UserPlus size={20} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Affiliate Dashboard</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Log in with the email and password you set when you accepted your affiliate invite.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input required type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <input required type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <button type="submit" disabled={loggingIn} className="btn btn-primary clickable" style={{ padding: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loggingIn ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={16} /> Log In</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Affiliate Dashboard</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Everything you earn promoting products across every store you're affiliated with, pooled in one place.</p>

      {loading && !data ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Loader2 className="animate-spin" size={24} /></div>
      ) : data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Withdrawable Balance</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{getCurrencySymbol('NGN')}{formatVal(data.affiliate_withdrawable_balance)}</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Pending Balance</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-muted)' }}>{getCurrencySymbol('NGN')}{formatVal(data.affiliate_pending_balance)}</div>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><Wallet size={16} /> Withdraw</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <form onSubmit={handleSaveBank} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} required
                  style={{ flex: 1, minWidth: 140, padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                <input placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required
                  style={{ flex: 1, minWidth: 140, padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                <input placeholder="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} required
                  style={{ flex: 1, minWidth: 140, padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                <button type="submit" disabled={savingBank} className="btn btn-outline clickable" style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {savingBank ? <Loader2 size={14} className="animate-spin" /> : <><Landmark size={14} /> Save Bank</>}
                </button>
              </form>

              <form onSubmit={handleWithdraw} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Amount</label>
                  <input type="number" min="1" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                </div>
                {otpSent && (
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Verification Code</label>
                    <input required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                      style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                  </div>
                )}
                {!otpSent ? (
                  <button type="button" onClick={handleSendOtp} className="btn btn-outline clickable" style={{ padding: '10px 16px' }}>Send Code</button>
                ) : (
                  <button type="submit" disabled={withdrawing} className="btn btn-primary clickable" style={{ padding: '10px 16px' }}>
                    {withdrawing ? <Loader2 size={14} className="animate-spin" /> : 'Withdraw'}
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Your Tracking Links</h2>
            {data.affiliations.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You're not affiliated with any store's products yet.</p>
            ) : data.affiliations.map((aff) => (
              <div key={aff.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{aff.store.store_name}</div>
                {aff.products.map((p) => (
                  <div key={p.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '6px 0' }}>
                    <span>{p.product_name} <span style={{ color: 'var(--text-muted)' }}>({p.commission_percent}%)</span></span>
                    {p.link && (
                      <button onClick={() => copyLink(p.link!)} className="btn btn-ghost clickable" style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--border)', borderRadius: 6 }}>
                        <Copy size={13} /> Copy Link
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Earnings</h2>
            {data.earnings.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No sales yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: 8, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Store</th>
                    <th style={{ padding: 8, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: 8, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: 8, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.earnings.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 8, fontSize: 13 }}>{e.store_name}</td>
                      <td style={{ padding: 8, fontSize: 13 }}>{e.product_name}</td>
                      <td style={{ padding: 8, fontSize: 13 }}>{formatVal(e.amount)}</td>
                      <td style={{ padding: 8, fontSize: 13, textTransform: 'capitalize' }}>{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
