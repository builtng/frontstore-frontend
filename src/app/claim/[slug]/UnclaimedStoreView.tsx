'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Flag,
  MessageSquare,
  Lock,
  Zap,
  Wallet,
  MapPin,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export interface UnclaimedListingData {
  id: string;
  name: string;
  slug: string;
  category_key?: string | null;
  category_value?: string | null;
  persona_id: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  opening_hours?: string | null;
}

interface UnclaimedStoreViewProps {
  listing: UnclaimedListingData;
  categoryLabel: string;
  locationLabel: string;
  bioText: string;
  signupUrl: string;
  canAutoVerify: boolean;
}

function getInitials(name: string): string {
  if (!name) return 'FS';
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function UnclaimedStoreView({
  listing,
  categoryLabel,
  locationLabel,
  bioText,
  signupUrl,
  canAutoVerify,
}: UnclaimedStoreViewProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  // Modal States: 'none' | 'not-live' | 'shopper-thanks' | 'manual-claim' | 'report'
  const [activeModal, setActiveModal] = useState<
    'none' | 'not-live' | 'shopper-thanks' | 'manual-claim' | 'report'
  >('none');

  // Manual Claim Form States
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [manualClaimSuccess, setManualClaimSuccess] = useState(false);

  // Report Form States
  const [reportReason, setReportReason] = useState('Incorrect business details');
  const [reportNotes, setReportNotes] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const initials = getInitials(listing.name);

  // Claim click handler
  const handleClaimClick = () => {
    if (canAutoVerify) {
      router.push(signupUrl);
    } else {
      setActiveModal('manual-claim');
    }
  };

  // Shopper click in Modal 1
  const handleShopperClick = async () => {
    setActiveModal('shopper-thanks');
    try {
      fetch(`${API_URL}/v1/public/frontstore-stores/${listing.slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Shopper looking for this store' }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }
  };

  // Submit manual claim request
  const submitManualClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim() || !manualPhone.trim()) {
      toast.error('Please provide your name, email, and phone number.');
      return;
    }
    try {
      setSubmittingClaim(true);
      const res = await fetch(`${API_URL}/v1/public/frontstore-stores/${listing.slug}/manual-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: manualName.trim(),
          email: manualEmail.trim(),
          phone: manualPhone.trim(),
          note: manualNote.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit claim request.');
      setManualClaimSuccess(true);
      toast.success('Claim request submitted for admin review.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Submit report
  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reportNotes.trim()
      ? `${reportReason}: ${reportNotes.trim()}`
      : reportReason;

    try {
      setSubmittingReport(true);
      const res = await fetch(`${API_URL}/v1/public/frontstore-stores/${listing.slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ reason: finalReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit report.');
      toast.success("Thank you — we'll review this listing promptly.");
      setActiveModal('none');
      setReportNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit report. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7FAF7',
        color: '#111827',
        fontFamily: 'var(--font-jakarta), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* ── Top Sticky Notice Bar ─────────────────────────────────────────── */}
      <header
        style={{
          width: '100%',
          backgroundColor: '#064E3B',
          color: '#FFFFFF',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 4px 14px rgba(6, 78, 59, 0.18)',
        }}
      >
        <div
          style={{
            maxWidth: 540,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '13.5px',
            fontWeight: 600,
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={handleClaimClick}
          role="button"
          tabIndex={0}
        >
          <Flag size={15} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: -1 }} />
          <span>
            Are you the owner of {listing.name}?{' '}
            <span
              style={{
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                fontWeight: 700,
              }}
            >
              Claim this store
            </span>
          </span>
        </div>
      </header>

      {/* ── Main Phone-width Content Column ────────────────────────────────── */}
      <main
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '36px 20px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {/* ── Store Header ─────────────────────────────────────────────────── */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {/* Avatar Monogram */}
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              backgroundColor: '#064E3B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow: '0 10px 25px -4px rgba(6, 78, 59, 0.28)',
              border: '3px solid #FFFFFF',
              marginBottom: 18,
            }}
          >
            {initials}
          </div>

          {/* Store Name in Fraunces Serif */}
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(28px, 7vw, 36px)',
              fontWeight: 800,
              color: '#064E3B',
              margin: '0 0 8px',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {listing.name}
          </h1>

          {/* Location */}
          {locationLabel && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                fontSize: 13.5,
                color: '#6B7280',
                marginBottom: 12,
              }}
            >
              <MapPin size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
              <span>{locationLabel}</span>
            </div>
          )}

          {/* Unclaimed store pill badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#EAF5EE',
              border: '1px solid #D1E7D8',
              borderRadius: 100,
              padding: '4px 12px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#064E3B',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#064E3B',
                display: 'inline-block',
              }}
            />
            Unclaimed store
          </div>

          {/* Bio text */}
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#4B5563',
              maxWidth: 420,
              margin: '0 0 24px',
            }}
          >
            {bioText}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              width: '100%',
              maxWidth: 340,
            }}
          >
            {/* Chat with us (Secondary outline) */}
            <button
              onClick={() => setActiveModal('not-live')}
              type="button"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #064E3B',
                color: '#064E3B',
                borderRadius: 9999,
                padding: '11px 18px',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F7F2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <MessageSquare size={16} strokeWidth={2.2} />
              Chat with us
            </button>

            {/* Claim (Primary solid dark green) */}
            <button
              onClick={handleClaimClick}
              type="button"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#064E3B',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: 9999,
                padding: '12px 20px',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.22)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#053C2E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#064E3B')}
            >
              <Flag size={16} strokeWidth={2.2} />
              Claim
            </button>
          </div>
        </section>

        {/* ── Storefront Preview Section ───────────────────────────────────── */}
        <section style={{ marginBottom: 28 }}>
          {/* Header with hairline divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 4,
            }}
          >
            <h2
              style={{
                fontSize: 14.5,
                fontWeight: 700,
                color: '#1F2937',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Storefront preview
            </h2>
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: '#E5E7EB',
              }}
            />
          </div>

          <p
            style={{
              fontSize: 13,
              color: '#6B7280',
              margin: '0 0 16px',
            }}
          >
            Products appear here once {listing.name} claims the store.
          </p>

          {/* 2x2 Locked Skeleton Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
            }}
          >
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                onClick={() => setActiveModal('not-live')}
                role="button"
                tabIndex={0}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '1px solid #E6ECE8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                }}
              >
                {/* Product Image Box with centered Lock Badge */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#EAF1EC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6B7280',
                    }}
                  >
                    <Lock size={16} strokeWidth={2} />
                  </div>
                </div>

                {/* Skeleton bottom lines */}
                <div style={{ padding: '14px 12px' }}>
                  <div
                    style={{
                      width: '72%',
                      height: 10,
                      borderRadius: 6,
                      backgroundColor: '#E2E8E4',
                      marginBottom: 7,
                    }}
                  />
                  <div
                    style={{
                      width: '46%',
                      height: 10,
                      borderRadius: 6,
                      backgroundColor: '#E2E8E4',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What You Unlock By Claiming Card ─────────────────────────────── */}
        <section
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            border: '1px solid #E2ECE5',
            padding: '24px 20px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 18px',
            }}
          >
            What you unlock by claiming
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Feature 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#EAF5EE',
                  color: '#064E3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={18} strokeWidth={2.2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 2px',
                  }}
                >
                  Store live in 2 minutes
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  Add products, set your colour and domain.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#EAF5EE',
                  color: '#064E3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Wallet size={18} strokeWidth={2.2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 2px',
                  }}
                >
                  Get paid anywhere
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  Accept Naira and 7+ currencies.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#EAF5EE',
                  color: '#064E3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={18} strokeWidth={2.2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 2px',
                  }}
                >
                  Sell on WhatsApp
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  Nina takes orders and payments for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer Disclaimer & Report ───────────────────────────────────── */}
        <footer
          style={{
            textAlign: 'center',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: '#6B7280',
            padding: '0 8px',
          }}
        >
          <span>This listing was created by Frontstore from public information. </span>
          <span>Not the owner or spotted an error? </span>
          <button
            onClick={() => setActiveModal('report')}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#064E3B',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            Report this page.
          </button>
        </footer>
      </main>

      {/* ── Backdrop for Modals ───────────────────────────────────────────── */}
      {activeModal !== 'none' && (
        <div
          onClick={() => setActiveModal('none')}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 30, 20, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* Modal Card / Bottom Sheet Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: '#FFFFFF',
              borderRadius: '26px 26px 0 0',
              padding: '24px 22px 32px',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
              position: 'relative',
            }}
          >
            {/* ── MODAL 1: This store isn't live yet ────────────────────────── */}
            {activeModal === 'not-live' && (
              <div>
                {/* Header row: Icon on left, Close button on right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: '#EAF5EE',
                      color: '#064E3B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MessageSquare size={20} strokeWidth={2.2} />
                  </div>
                  <button
                    onClick={() => setActiveModal('none')}
                    type="button"
                    aria-label="Close"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#064E3B',
                    margin: '0 0 10px',
                    lineHeight: 1.25,
                  }}
                >
                  This store isn&apos;t live yet
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#4B5563',
                    margin: '0 0 24px',
                  }}
                >
                  {listing.name} hasn&apos;t claimed their Frontstore account, so orders and chat are
                  switched off for now. Are you the owner?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={handleClaimClick}
                    type="button"
                    style={{
                      width: '100%',
                      backgroundColor: '#064E3B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 14,
                      padding: '14px 20px',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#053C2E')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#064E3B')}
                  >
                    Yes, claim my store
                  </button>

                  <button
                    onClick={handleShopperClick}
                    type="button"
                    style={{
                      width: '100%',
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: 14,
                      padding: '14px 20px',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    I&apos;m a shopper
                  </button>
                </div>
              </div>
            )}

            {/* ── MODAL 2: Thanks for stopping by ───────────────────────────── */}
            {activeModal === 'shopper-thanks' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: '#EAF5EE',
                      color: '#064E3B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={22} strokeWidth={2.5} />
                  </div>
                  <button
                    onClick={() => setActiveModal('none')}
                    type="button"
                    aria-label="Close"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#064E3B',
                    margin: '0 0 10px',
                    lineHeight: 1.25,
                  }}
                >
                  Thanks for stopping by
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#4B5563',
                    margin: '0 0 24px',
                  }}
                >
                  We&apos;ll let {listing.name} know shoppers are looking for them. The more interest
                  we can show the owner, the sooner they set up their store.
                </p>

                <button
                  onClick={() => setActiveModal('none')}
                  type="button"
                  style={{
                    width: '100%',
                    backgroundColor: '#064E3B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px 20px',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            )}

            {/* ── MODAL 3: Manual Claim Flow ─────────────────────────────────── */}
            {activeModal === 'manual-claim' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: '#EAF5EE',
                      color: '#064E3B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Flag size={20} strokeWidth={2.2} />
                  </div>
                  <button
                    onClick={() => setActiveModal('none')}
                    type="button"
                    aria-label="Close"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#064E3B',
                    margin: '0 0 8px',
                  }}
                >
                  Claim {listing.name}
                </h3>

                {manualClaimSuccess ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#EAF5EE',
                        color: '#064E3B',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={28} strokeWidth={2.5} />
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>
                      Request Submitted!
                    </h4>
                    <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6, marginBottom: 20 }}>
                      Our team will review your details and contact you via WhatsApp or email within 24
                      hours to complete ownership verification.
                    </p>
                    <button
                      onClick={() => setActiveModal('none')}
                      type="button"
                      style={{
                        width: '100%',
                        backgroundColor: '#064E3B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 14,
                        padding: '13px 20px',
                        fontSize: 14.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Got it
                    </button>
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        color: '#4B5563',
                        margin: '0 0 16px',
                      }}
                    >
                      Provide your contact details so our team can verify your ownership and activate
                      your store.
                    </p>

                    <form onSubmit={submitManualClaim} style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#374151',
                            marginBottom: 4,
                          }}
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="e.g. John Okoro"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            fontSize: 14,
                            borderRadius: 12,
                            border: '1px solid #D1D5DB',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#374151',
                            marginBottom: 4,
                          }}
                        >
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          placeholder="owner@yourbusiness.com"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            fontSize: 14,
                            borderRadius: 12,
                            border: '1px solid #D1D5DB',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#374151',
                            marginBottom: 4,
                          }}
                        >
                          WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={manualPhone}
                          onChange={(e) => setManualPhone(e.target.value)}
                          placeholder="0801 234 5678"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            fontSize: 14,
                            borderRadius: 12,
                            border: '1px solid #D1D5DB',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#374151',
                            marginBottom: 4,
                          }}
                        >
                          Ownership Note (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={manualNote}
                          onChange={(e) => setManualNote(e.target.value)}
                          placeholder="e.g. Instagram handle, shop receipt, or registration details"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: 13.5,
                            borderRadius: 12,
                            border: '1px solid #D1D5DB',
                            outline: 'none',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingClaim}
                        style={{
                          marginTop: 4,
                          width: '100%',
                          backgroundColor: '#064E3B',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 14,
                          padding: '14px 20px',
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {submittingClaim ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Submitting...
                          </>
                        ) : (
                          'Submit Claim Request'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ── MODAL 4: Report Listing ────────────────────────────────────── */}
            {activeModal === 'report' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AlertCircle size={20} strokeWidth={2.2} />
                  </div>
                  <button
                    onClick={() => setActiveModal('none')}
                    type="button"
                    aria-label="Close"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 8px',
                  }}
                >
                  Report this listing
                </h3>

                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: '#4B5563',
                    margin: '0 0 16px',
                  }}
                >
                  Help keep Frontstore accurate. Let us know what needs to be fixed.
                </p>

                <form onSubmit={submitReport} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      'Incorrect business details',
                      'This business has permanently closed',
                      'I am the owner and want it removed',
                      'Duplicate or spam listing',
                    ].map((reason) => (
                      <label
                        key={reason}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 13.5,
                          color: '#374151',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: 10,
                          backgroundColor: reportReason === reason ? '#F3F4F6' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={reportReason === reason}
                          onChange={(e) => setReportReason(e.target.value)}
                        />
                        {reason}
                      </label>
                    ))}
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: 4,
                      }}
                    >
                      Additional details (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      placeholder="Provide any additional context or correct information..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        borderRadius: 12,
                        border: '1px solid #D1D5DB',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport}
                    style={{
                      width: '100%',
                      backgroundColor: '#064E3B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 14,
                      padding: '14px 20px',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {submittingReport ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Send Report'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
