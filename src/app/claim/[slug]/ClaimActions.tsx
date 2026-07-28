'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Check, Flag, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
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

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Claim started', 'Evidence submitted', 'Under review'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 26 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n <= step;
        const isLast = n === steps.length;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: isLast ? 'auto' : undefined }}>
              <span
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? '#fff' : 'rgba(255,255,255,0.14)',
                  color: active ? 'var(--primary-dark)' : 'rgba(255,255,255,0.5)',
                  fontSize: 10.5, fontWeight: 800,
                  transition: 'all var(--t-normal) var(--ease)',
                }}
              >
                {active ? <Check size={12} strokeWidth={3} /> : n}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 74, lineHeight: 1.3 }}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div style={{ flex: 1, height: 2, marginTop: 10, background: n < step ? '#fff' : 'rgba(255,255,255,0.16)', transition: 'background var(--t-normal) var(--ease)' }} />
            )}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        className="hero-dark"
        style={{
          borderRadius: 24, padding: 'clamp(26px, 4vw, 34px) clamp(22px, 4vw, 28px)',
          boxShadow: '0 20px 48px -12px rgba(10, 25, 47, 0.35)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {!canAutoVerify && manualSubmitted && <Stepper step={2} />}

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            <Sparkles size={11} color="var(--accent)" /> 100% free to claim
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(19px, 3vw, 23px)', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 10 }}>
            Is {businessName} your business?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 24 }}>
            Claim it for free and turn it into a WhatsApp storefront — accept orders, list products,
            and get discovered by customers searching in {city || 'your area'}.
          </p>

          {canAutoVerify ? (
            <Link
              href={signupUrl}
              className="clickable"
              style={{
                width: '100%', padding: '15px 22px', fontSize: 14.5, fontWeight: 800,
                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#fff', color: 'var(--primary-dark)', borderRadius: 14,
                boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
              }}
            >
              Claim this business free <ArrowRight size={15} />
            </Link>
          ) : manualSubmitted ? (
            <p style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, textAlign: 'center' }}>
              Claim request started — submit evidence below to speed up review.
            </p>
          ) : !showManualForm ? (
            <button
              onClick={() => setShowManualForm(true)}
              className="clickable"
              style={{
                width: '100%', padding: '15px 22px', fontSize: 14.5, fontWeight: 800, border: 'none',
                background: '#fff', color: 'var(--primary-dark)', borderRadius: 14,
                boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
              }}
            >
              Request to claim this business
            </button>
          ) : (
            <form onSubmit={submitManualClaim} style={{ textAlign: 'left', display: 'grid', gap: 10 }}>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 2, lineHeight: 1.55 }}>
                No phone or email is on file for this listing, so a Frontstore admin will manually verify your request.
              </p>
              <input
                className="input-field" type="text" placeholder="Your full name" value={manualName} onChange={(e) => setManualName(e.target.value)}
              />
              <input
                className="input-field" type="email" placeholder="Your email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)}
              />
              <input
                className="input-field" type="tel" placeholder="Your WhatsApp number" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)}
              />
              <textarea
                className="input-field" placeholder="How can we verify you own this business? (optional)" value={manualNote} onChange={(e) => setManualNote(e.target.value)}
                rows={2} style={{ resize: 'vertical' }}
              />
              <button
                type="submit" disabled={submitting} className="clickable"
                style={{ padding: '13px 20px', fontSize: 13.5, fontWeight: 800, border: 'none', background: '#fff', color: 'var(--primary-dark)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit claim request'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            <ShieldCheck size={12} /> Ownership always verified before transfer
          </div>
        </div>
      </div>

      {!canAutoVerify && manualSubmitted && (
        <EvidencePanel claimKey={claimKey} website={website} signupUrl={signupUrl} />
      )}

      <div style={{ textAlign: 'center' }}>
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
          <form onSubmit={submitReport} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              className="input-field"
              type="text" placeholder="What's wrong with this listing?" value={reportReason} onChange={(e) => setReportReason(e.target.value)}
              style={{ flex: 1, padding: '9px 12px', fontSize: 12.5 }}
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
