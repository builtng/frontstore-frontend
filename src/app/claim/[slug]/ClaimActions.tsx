'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Flag, Loader2, ShieldCheck, X } from 'lucide-react';
import EvidencePanel from './EvidencePanel';

interface ClaimActionsProps {
  claimKey: string;
  businessName: string;
  city: string | null;
  hasPhone: boolean;
  hasEmail: boolean;
  website: string | null;
  signupUrl: string;
}

function ProgressTracker({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Claim started', 'Evidence submitted', 'Under review'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n <= step;
        return (
          <React.Fragment key={label}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--primary)' : 'rgba(255,255,255,0.15)', fontSize: 9.5 }}>
                {active ? '✓' : n}
              </span>
              {label}
            </span>
            {n < steps.length && <span style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.25)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ClaimActions({ claimKey, businessName, city, hasPhone, hasEmail, website, signupUrl }: ClaimActionsProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const canAutoVerify = hasPhone || hasEmail;

  const [showManualForm, setShowManualForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manualSubmitted, setManualSubmitted] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [reportReason, setReportReason] = useState('');

  const submitManualClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim() || !manualPhone.trim()) {
      toast.error('Please fill in your name, email, and phone number.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/v1/public/frontstore-stores/${claimKey}/manual-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: manualName.trim(), email: manualEmail.trim(), phone: manualPhone.trim(), note: manualNote.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit claim request.');
      setManualSubmitted(true);
      toast.success('Claim request submitted for review.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error('Please tell us what\'s wrong with this listing.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/v1/public/frontstore-stores/${claimKey}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit report.');
      setReportSubmitted(true);
      toast.success('Thanks — we\'ll review this listing.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="hero-dark" style={{ borderRadius: 20, padding: 'clamp(28px, 5vw, 40px) 24px', textAlign: 'center' }}>
        {!canAutoVerify && manualSubmitted && <ProgressTracker step={2} />}
        <ShieldCheck size={26} style={{ color: '#fff', marginBottom: 10 }} />
        <h2 className="text-display" style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: '#fff', marginBottom: 10 }}>
          Is {businessName} your business?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13.5, marginBottom: 22, maxWidth: 440, margin: '0 auto 22px' }}>
          Claim this listing for free and turn it into a WhatsApp storefront — accept orders,
          list products, and get discovered by customers searching in {city || 'your area'}.
        </p>

        {canAutoVerify ? (
          <Link
            href={signupUrl}
            className="btn btn-primary"
            style={{ padding: '12px 26px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Claim this business free <ArrowRight size={14} />
          </Link>
        ) : manualSubmitted ? (
          <p style={{ color: '#fff', fontSize: 13.5, fontWeight: 600 }}>
            Claim request started — submit evidence below to speed up review.
          </p>
        ) : !showManualForm ? (
          <button
            onClick={() => setShowManualForm(true)}
            className="btn btn-primary clickable"
            style={{ padding: '12px 26px', fontSize: 14, border: 'none' }}
          >
            Request to claim this business
          </button>
        ) : (
          <form onSubmit={submitManualClaim} style={{ textAlign: 'left', maxWidth: 340, margin: '0 auto', display: 'grid', gap: 10 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 }}>
              No phone or email is on file for this listing, so a Frontstore admin will manually verify your request.
            </p>
            <input
              type="text" placeholder="Your full name" value={manualName} onChange={(e) => setManualName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13.5 }}
            />
            <input
              type="email" placeholder="Your email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13.5 }}
            />
            <input
              type="tel" placeholder="Your WhatsApp number" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13.5 }}
            />
            <textarea
              placeholder="How can we verify you own this business? (optional)" value={manualNote} onChange={(e) => setManualNote(e.target.value)}
              rows={2}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13.5, resize: 'vertical' }}
            />
            <button type="submit" disabled={submitting} className="btn btn-primary clickable" style={{ padding: '11px 20px', fontSize: 13.5, border: 'none' }}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit claim request'}
            </button>
          </form>
        )}
      </div>

      {!canAutoVerify && manualSubmitted && (
        <div style={{ marginTop: 20 }}>
          <EvidencePanel claimKey={claimKey} website={website} signupUrl={signupUrl} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {reportSubmitted ? (
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Thanks for the report.</p>
        ) : !showReportForm ? (
          <button
            onClick={() => setShowReportForm(true)}
            className="clickable"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-faint)', background: 'none', border: 'none' }}
          >
            <Flag size={12} /> Report incorrect listing
          </button>
        ) : (
          <form onSubmit={submitReport} style={{ maxWidth: 380, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              type="text" placeholder="What's wrong with this listing?" value={reportReason} onChange={(e) => setReportReason(e.target.value)}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12.5 }}
            />
            <button type="submit" disabled={submitting} className="btn btn-outline clickable" style={{ padding: '9px 12px', fontSize: 12 }}>
              Send
            </button>
            <button type="button" onClick={() => setShowReportForm(false)} className="clickable" style={{ padding: 9, color: 'var(--text-faint)', background: 'none', border: 'none' }}>
              <X size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
