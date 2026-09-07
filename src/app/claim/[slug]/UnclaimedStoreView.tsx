'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Store,
  Clock,
  Globe,
  Phone,
} from 'lucide-react';
import Logo from '@/components/Logo';

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

  // Preview tab state for desktop
  const [previewTab, setPreviewTab] = useState<'all' | 'popular' | 'featured'>('all');

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
    <div className="unclaimed-page-root">
      {/* ── Desktop Top Chrome / Breadcrumbs Bar ─────────────────────────── */}
      <nav className="unclaimed-desktop-chrome" aria-label="Breadcrumb and brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <Logo size={26} showText={true} textColor="#064E3B" text="Frontstore" />
          </Link>

          <div style={{ width: 1, height: 20, backgroundColor: '#E5E7EB' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={13} color="#9CA3AF" />
            <Link href="/stores" style={{ color: '#6B7280', textDecoration: 'none' }}>
              Business Directory
            </Link>
            {listing.state && (
              <>
                <ChevronRight size={13} color="#9CA3AF" />
                <span>{listing.state}</span>
              </>
            )}
            <ChevronRight size={13} color="#9CA3AF" />
            <span style={{ color: '#111827', fontWeight: 600 }}>{listing.name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/stores"
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: '#374151',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 8,
              transition: 'background-color 0.15s',
            }}
          >
            Browse Stores
          </Link>
          <button
            onClick={handleClaimClick}
            type="button"
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              backgroundColor: '#064E3B',
              color: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(6, 78, 59, 0.2)',
            }}
          >
            <Flag size={13} />
            Claim this business
          </button>
        </div>
      </nav>

      {/* ── Sticky Notice Bar ─────────────────────────────────────────────── */}
      <header className="unclaimed-sticky-header">
        {/* Mobile View: Centered banner */}
        <div
          className="unclaimed-banner-mobile"
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

        {/* Desktop View: Full container banner with direct CTA */}
        <div className="unclaimed-banner-desktop">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Flag size={15} strokeWidth={2.2} />
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>
                Are you the owner of <strong style={{ color: '#FFFFFF' }}>{listing.name}</strong>?
              </span>{' '}
              <span style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
                This storefront is reserved for your business. Turn it into a WhatsApp store in 2 minutes.
              </span>
            </div>
          </div>

          <button
            onClick={handleClaimClick}
            type="button"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#064E3B',
              border: 'none',
              borderRadius: 9999,
              padding: '8px 20px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            Claim Store Free <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MOBILE LAYOUT (Exactly as approved, < 1024px) ────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <main className="unclaimed-mobile-layout">
        {/* Store Header */}
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
            >
              <MessageSquare size={16} strokeWidth={2.2} />
              Chat with us
            </button>

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
            >
              <Flag size={16} strokeWidth={2.2} />
              Claim
            </button>
          </div>
        </section>

        {/* Storefront Preview Section */}
        <section style={{ marginBottom: 28 }}>
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
            <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </div>

          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
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
              >
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

        {/* What You Unlock By Claiming Card */}
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
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>
            What you unlock by claiming
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                  Store live in 2 minutes
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
                  Add products, set your colour and domain.
                </p>
              </div>
            </div>

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
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                  Get paid anywhere
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
                  Accept Naira and 7+ currencies.
                </p>
              </div>
            </div>

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
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                  Sell on WhatsApp
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
                  Nina takes orders and payments for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Footer */}
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

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── DESKTOP LAYOUT (Spacious 2-Column Experience, ≥ 1024px) ───────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <main className="unclaimed-desktop-layout">
        {/* ── LEFT COLUMN: Storefront Showcase & Catalog Simulation ───────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minWidth: 0 }}>
          {/* Store Hero Showcase Card */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2ECE5',
              overflow: 'hidden',
              boxShadow: '0 4px 20px -4px rgba(6, 78, 59, 0.06)',
            }}
          >
            {/* Branded Cover Banner Art */}
            <div
              style={{
                height: 140,
                background: 'linear-gradient(135deg, #064E3B 0%, #0D684D 55%, #10B981 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '16px 24px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.1,
                  backgroundImage:
                    'radial-gradient(#ffffff 1.5px, transparent 1.5px), radial-gradient(#ffffff 1.5px, transparent 1.5px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />

              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(0, 0, 0, 0.28)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 9999,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                <Store size={13} />
                <span>Reserved Business Storefront</span>
              </div>
            </div>

            {/* Profile Meta & Actions */}
            <div style={{ padding: '0 32px 32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: -52,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                {/* Monogram Avatar */}
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    backgroundColor: '#064E3B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    boxShadow: '0 10px 25px -4px rgba(6, 78, 59, 0.28)',
                    border: '4px solid #FFFFFF',
                    position: 'relative',
                    zIndex: 3,
                  }}
                >
                  {initials}
                </div>

                {/* Primary Action Buttons on Desktop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => setActiveModal('not-live')}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #064E3B',
                      color: '#064E3B',
                      borderRadius: 9999,
                      padding: '11px 22px',
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <MessageSquare size={16} strokeWidth={2.2} />
                    Chat with us
                  </button>

                  <button
                    onClick={handleClaimClick}
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#064E3B',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 9999,
                      padding: '12px 24px',
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(6, 78, 59, 0.24)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Flag size={16} strokeWidth={2.2} />
                    Claim This Store
                  </button>
                </div>
              </div>

              {/* Title & Badges */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: 36,
                      fontWeight: 800,
                      color: '#064E3B',
                      margin: 0,
                      lineHeight: 1.15,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {listing.name}
                  </h1>

                  {/* Status Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        borderRadius: 100,
                        padding: '4px 12px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#4B5563',
                      }}
                    >
                      {categoryLabel}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {locationLabel && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 14,
                      color: '#6B7280',
                      marginBottom: 14,
                    }}
                  >
                    <MapPin size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    <span>{locationLabel}</span>
                  </div>
                )}

                {/* Bio text */}
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: '#4B5563',
                    maxWidth: 680,
                    margin: 0,
                  }}
                >
                  {bioText}
                </p>
              </div>
            </div>
          </section>

          {/* ── Storefront Catalog Interactive Simulation ─────────────────── */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2ECE5',
              padding: '28px 32px 32px',
              boxShadow: '0 4px 20px -4px rgba(6, 78, 59, 0.04)',
            }}
          >
            {/* Header & Filter Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#111827',
                      margin: 0,
                    }}
                  >
                    Storefront Catalog Preview
                  </h2>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Lock size={11} strokeWidth={2.5} />
                    Locked Preview
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>
                  Products and instant WhatsApp checkout activate once {listing.name} claims this store.
                </p>
              </div>

              {/* Simulation Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#F7FAF7',
                  border: '1px solid #E5EBE7',
                  borderRadius: 12,
                  padding: 3,
                  gap: 4,
                }}
              >
                {(
                  [
                    { id: 'all', label: 'All Items (6)' },
                    { id: 'popular', label: 'Popular' },
                    { id: 'featured', label: 'Featured' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                    type="button"
                    style={{
                      border: 'none',
                      backgroundColor: previewTab === tab.id ? '#FFFFFF' : 'transparent',
                      color: previewTab === tab.id ? '#064E3B' : '#6B7280',
                      fontWeight: previewTab === tab.id ? 700 : 600,
                      fontSize: 12.5,
                      padding: '6px 14px',
                      borderRadius: 9,
                      cursor: 'pointer',
                      boxShadow: previewTab === tab.id ? '0 2px 5px rgba(0,0,0,0.04)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Desktop Locked Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 18,
                marginBottom: 24,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveModal('not-live')}
                  role="button"
                  tabIndex={0}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: '1px solid #E6ECE8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 22px rgba(6, 78, 59, 0.08)';
                    e.currentTarget.style.borderColor = '#C2DEC9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#E6ECE8';
                  }}
                >
                  {/* Square Product Image Placeholder */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      backgroundColor: '#EAF1EC',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      gap: 8,
                    }}
                    className="unclaimed-shimmer"
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#064E3B',
                      }}
                    >
                      <Lock size={18} strokeWidth={2.2} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#064E3B',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        padding: '2px 8px',
                        borderRadius: 9999,
                      }}
                    >
                      Claim to reveal
                    </span>
                  </div>

                  {/* Card Content Skeleton Details */}
                  <div style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{
                          width: '45%',
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#E2E8E4',
                        }}
                      />
                      <div
                        style={{
                          width: '28%',
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#E2E8E4',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        width: '85%',
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#D1DCD4',
                      }}
                    />

                    {/* Simulated price & locked order button */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 8,
                        borderTop: '1px solid #F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#9CA3AF',
                          letterSpacing: '0.02em',
                        }}
                      >
                        ₦ ••••••
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#064E3B',
                          backgroundColor: '#EAF5EE',
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                      >
                        <MessageSquare size={11} /> Order
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulation Explainer Banner */}
            <div
              style={{
                backgroundColor: '#F7FAF7',
                border: '1px solid #E2ECE5',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                    Want to see your real products live on this page?
                  </h4>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0 }}>
                    Claiming connects your WhatsApp phone number and lets you upload unlimited items in minutes.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClaimClick}
                type="button"
                style={{
                  backgroundColor: '#064E3B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background-color 0.15s ease',
                }}
              >
                Claim & Add Products <ArrowRight size={13} />
              </button>
            </div>
          </section>

          {/* ── Visual Explainer: How Frontstore Commerce Works ───────────── */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2ECE5',
              padding: '28px 32px',
              boxShadow: '0 4px 20px -4px rgba(6, 78, 59, 0.04)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              How WhatsApp commerce works for your business
            </h3>
            <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 22px' }}>
              Frontstore replaces endless back-and-forth chats with clean catalogs, automated orders, and instant bank verification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  1
                </div>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Share your link
                </h4>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  Drop your link in Instagram bio, WhatsApp status, or marketing messages.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  2
                </div>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Shopper adds to bag
                </h4>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  Customers choose their size, quantity, and delivery address on a fast mobile menu.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  3
                </div>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Paid order in WhatsApp
                </h4>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  You receive a pre-formatted WhatsApp order message and instant bank settlement.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN: High-Converting Sticky Claim Sidebar ──────────── */}
        <div
          style={{
            position: 'sticky',
            top: 76,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Card 1: Main Conversion Claim Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2ECE5',
              padding: '28px 24px',
              boxShadow: '0 8px 30px -6px rgba(6, 78, 59, 0.08)',
            }}
          >
            {/* Pill Header */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#EAF5EE',
                color: '#064E3B',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 9999,
                marginBottom: 16,
              }}
            >
              <Zap size={13} strokeWidth={2.5} />
              Instant Setup
            </div>

            <h3
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 22,
                fontWeight: 800,
                color: '#064E3B',
                margin: '0 0 8px',
                lineHeight: 1.25,
              }}
            >
              Turn this page into your WhatsApp storefront
            </h3>

            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.55, margin: '0 0 20px' }}>
              Claim ownership to activate order links, customize your store branding, and get paid directly.
            </p>

            {/* Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Store live in 2 minutes
                  </h4>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                    Add products, set your colors and custom handle.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Wallet size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Get paid anywhere
                  </h4>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                    Accept instant bank transfers, cards, and 7+ currencies.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: '#EAF5EE',
                    color: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Sell on WhatsApp with Nina
                  </h4>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                    Nina AI answers customer questions and collects payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.28)',
                transition: 'all 0.15s ease',
                marginBottom: 12,
              }}
            >
              <Flag size={16} strokeWidth={2.2} />
              Claim {listing.name} Now
            </button>

            {/* Shopper link */}
            <button
              onClick={handleShopperClick}
              type="button"
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#4B5563',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px 0',
                transition: 'color 0.15s ease',
              }}
            >
              Are you a shopper? Let the owner know you&apos;re waiting &rarr;
            </button>

            {/* Trust reassurance note */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                fontSize: 12,
                color: '#6B7280',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} color="#064E3B" strokeWidth={3} /> Free listing
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} color="#064E3B" strokeWidth={3} /> No card required
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} color="#064E3B" strokeWidth={3} /> Verified claim
              </span>
            </div>
          </div>

          {/* Card 2: Business Information on File & Report Link */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #E2ECE5',
              padding: '20px 22px',
              fontSize: 13,
              color: '#4B5563',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <h4
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 12px',
              }}
            >
              Directory Information
            </h4>

            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              {listing.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <MapPin size={14} color="#9CA3AF" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{listing.address}</span>
                </div>
              )}
              {listing.opening_hours && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Clock size={14} color="#9CA3AF" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{listing.opening_hours}</span>
                </div>
              )}
              {listing.website && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Globe size={14} color="#9CA3AF" style={{ marginTop: 2, flexShrink: 0 }} />
                  <a
                    href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#064E3B', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    {listing.website}
                  </a>
                </div>
              )}
            </div>

            <div
              style={{
                paddingTop: 12,
                borderTop: '1px solid #F3F4F6',
                fontSize: 12,
                lineHeight: 1.5,
                color: '#6B7280',
              }}
            >
              <span>This listing was created from verified public map sources. </span>
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
            </div>
          </div>
        </div>
      </main>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MODALS (Mobile Bottom-Sheet / Desktop Centered Dialog) ─────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeModal !== 'none' && (
        <div
          className="unclaimed-modal-overlay"
          onClick={() => setActiveModal('none')}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="unclaimed-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── MODAL 1: This store isn't live yet ────────────────────────── */}
            {activeModal === 'not-live' && (
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
