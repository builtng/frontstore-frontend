'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, UserPlus, LogIn } from 'lucide-react';

interface InviteInfo {
  email: string;
  store_name: string;
  has_account: boolean;
}

function AcceptInviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This invitation link is missing a token.');
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/public/affiliate-invitations/${token}`);
        const json = await res.json();
        if (res.ok) {
          setInvite(json.data);
        } else {
          setError(json.message || 'This invitation has expired or is invalid.');
        }
      } catch {
        setError('Network error loading this invitation.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/v1/public/affiliate-invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          password,
          password_confirmation: passwordConfirmation,
          phone_number: phoneNumber || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.token) {
        localStorage.setItem('token', json.token);
        toast.success('You are now an affiliate!');
        router.push('/affiliate');
      } else {
        toast.error(json.message || 'Failed to accept this invitation.');
      }
    } catch {
      toast.error('Network error accepting this invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    try {
      setSubmitting(true);
      const loginRes = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invite.email, password: loginPassword }),
      });
      const loginJson = await loginRes.json();
      if (!loginRes.ok || !loginJson.token) {
        toast.error(loginJson.message || 'Login failed.');
        return;
      }

      localStorage.setItem('token', loginJson.token);

      const claimRes = await fetch(`${API_URL}/v1/affiliate-invitations/${token}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${loginJson.token}`, 'Content-Type': 'application/json' },
      });
      const claimJson = await claimRes.json();
      if (claimRes.ok) {
        toast.success('Invitation claimed!');
        router.push('/affiliate');
      } else {
        toast.error(claimJson.message || 'Failed to claim this invitation.');
      }
    } catch {
      toast.error('Network error claiming this invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (error || !invite) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--danger)' }}>{error || 'This invitation is invalid.'}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24 }}>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <UserPlus size={20} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Become an Affiliate</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          <strong>{invite.store_name}</strong> invited <strong>{invite.email}</strong> to earn commission promoting their products.
        </p>

        {invite.has_account ? (
          <form onSubmit={handleLoginAndClaim} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>An account with this email already exists — log in to claim your invitation.</p>
            <input required type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <button type="submit" disabled={submitting} className="btn btn-primary clickable" style={{ padding: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={16} /> Log In &amp; Claim</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input required type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <input type="tel" placeholder="Phone number (optional)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <input required type="password" placeholder="Confirm password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
              style={{ padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
            <button type="submit" disabled={submitting} className="btn btn-primary clickable" style={{ padding: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Accept Invitation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptAffiliateInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin" size={24} /></div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
