'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Users, CheckCircle2, AlertCircle, Clock, Copy, Share2,
  ExternalLink, ArrowUpRight, ShieldCheck, Sparkles,
  Package, Instagram, Twitter, DollarSign, ChevronRight,
  TrendingUp, Award, Check, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { getApiUrl } from '@/lib/api';
import { formatVal } from '@/utils/currency';
import type { StoreInfo, UserInfo } from '@/types/dashboard';

interface MerchantReferralsTabProps {
  store: StoreInfo | null;
  user: UserInfo | null;
  isPro: boolean;
  refreshDashboard: () => void;
  navigateDashboardTab?: (tab: any) => void;
}

interface CriteriaItem {
  title: string;
  description: string;
  fulfilled: boolean;
  current?: number;
  required?: number;
  days?: number;
  handles?: Record<string, string>;
  status?: string;
}

interface CriteriaStatus {
  is_approved: boolean;
  is_pending: boolean;
  is_rejected: boolean;
  can_apply: boolean;
  criteria: {
    min_products: CriteriaItem;
    social_media: CriteriaItem;
    platform_age: CriteriaItem;
    background_check: CriteriaItem;
  };
  all_criteria_met: boolean;
  latest_application?: any;
}

interface ReferredMerchant {
  id: number;
  status: string;
  referee_name: string;
  referee_email?: string;
  store_name: string;
  store_username: string;
  store_logo?: string;
  joined_at?: string;
  plan: string;
  subscription_status: string;
  first_product_status: 'none' | 'pending_verification' | 'verified' | 'rejected';
  first_product_name?: string;
  first_product_price?: number;
  first_product_image?: string;
  first_product_reward_paid: boolean;
  first_product_verified_at?: string;
  pro_reward_paid: boolean;
  pro_reward_paid_at?: string;
  legend_reward_paid: boolean;
  legend_reward_paid_at?: string;
  total_earned: number;
  lifetime_cap: number;
}

interface EarningsLog {
  id: number;
  event_type: string;
  amount: number;
  referee: string;
  date: string;
}

export default function MerchantReferralsTab({
  store,
  user,
  navigateDashboardTab,
}: MerchantReferralsTabProps) {
  const apiUrl = getApiUrl();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [criteriaStatus, setCriteriaStatus] = useState<CriteriaStatus | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({
    total_earned: 0,
    referrals_count: 0,
    active_subscriptions_count: 0,
    pending_verifications_count: 0,
    is_withdrawal_unlocked: false,
    minimum_withdrawal_threshold: 1000,
    needed_for_withdrawal: 1000,
  });
  const [referrals, setReferrals] = useState<ReferredMerchant[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<EarningsLog[]>([]);

  // Application form social handles (if missing)
  const [instagramInput, setInstagramInput] = useState(store?.instagram_handle || '');
  const [twitterInput, setTwitterInput] = useState(store?.twitter_handle || '');
  const [tiktokInput, setTiktokInput] = useState(store?.tiktok_handle || '');

  const fetchReferralStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/v1/merchant-referrals/status`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setCriteriaStatus(json.data.criteria_status);
        setReferralLink(json.data.referral_link || '');
        setReferralCode(json.data.referral_code || '');
        if (json.data.stats) setStats(json.data.stats);
        if (json.data.referrals) setReferrals(json.data.referrals);
        if (json.data.earnings_history) setEarningsHistory(json.data.earnings_history);
      }
    } catch (e) {
      toast.error('Could not load referral program information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStatus();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/merchant-referrals/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          instagram_handle: instagramInput.trim() || undefined,
          twitter_handle: twitterInput.trim() || undefined,
          tiktok_handle: tiktokInput.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Application submitted successfully!');
        if (json.data?.criteria_status) {
          setCriteriaStatus(json.data.criteria_status);
        } else {
          fetchReferralStatus();
        }
      } else {
        toast.error(json.message || 'Failed to submit application.');
      }
    } catch (e) {
      toast.error('Network error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! I run my online store on Frontstore. It is fast, has instant WhatsApp orders and seamless payouts. Start your store today: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading referral program...</p>
      </div>
    );
  }

  const isApproved = criteriaStatus?.is_approved;
  const isPending = criteriaStatus?.is_pending;
  const criteria = criteriaStatus?.criteria;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Top Banner Header */}
      <div
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <Sparkles size={14} />
            <span>IN-HOUSE MERCHANT REFERRALS</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Refer Fellow Merchants & Earn up to ₦1,000
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Grow the Frontstore ecosystem together. Earn <strong>₦100</strong> when a merchant you refer posts their first verified product, <strong>₦400</strong> when they upgrade to Pro, and <strong>₦500</strong> when they upgrade to Legend — capped at <strong>₦1,000 lifetime</strong> per merchant.
          </p>
        </div>
      </div>

      {/* STATE 1: APPLICATION REVIEW IN PROGRESS */}
      {isPending && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 18,
            padding: 32,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={32} />
          </div>

          <div style={{ maxWidth: 520 }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              Under Review
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Thank you, we are reviewing your application
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Our merchant safety and partnerships team is reviewing your store details, product catalog quality, and background check. You will be notified as soon as your referral link is activated!
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 14px', borderRadius: 10, fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Products Catalog Checked
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 14px', borderRadius: 10, fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Social Handles Logged
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 14px', borderRadius: 10, fontWeight: 600 }}>
              <Clock size={16} /> Final Safety Verification
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: NOT APPROVED YET — CRITERIA APPLICATION CHECKLIST */}
      {!isApproved && !isPending && criteria && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Application Requirements
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Fulfill the 4 merchant authenticity criteria below to unlock your referral link and dashboard.
              </p>
            </div>
            <button
              onClick={fetchReferralStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Refresh Criteria
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Criteria 1: 5 Products */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${criteria.min_products.fulfilled ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: criteria.min_products.fulfilled ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-subtle)', color: criteria.min_products.fulfilled ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
                {criteria.min_products.fulfilled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle2 size={18} /> Fulfilled
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 12, fontWeight: 700 }}>
                    <AlertCircle size={16} /> {criteria.min_products.current} / 5 items
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {criteria.min_products.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {criteria.min_products.description}
                </p>
              </div>
              {!criteria.min_products.fulfilled && navigateDashboardTab && (
                <button
                  type="button"
                  onClick={() => navigateDashboardTab('products')}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Upload Products <ArrowUpRight size={14} />
                </button>
              )}
            </div>

            {/* Criteria 2: Social Media Accounts */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${criteria.social_media.fulfilled ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: criteria.social_media.fulfilled ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-subtle)', color: criteria.social_media.fulfilled ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Instagram size={20} />
                </div>
                {criteria.social_media.fulfilled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle2 size={18} /> Fulfilled
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 12, fontWeight: 700 }}>
                    <AlertCircle size={16} /> Link Account
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {criteria.social_media.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {criteria.social_media.description}
                </p>
              </div>
              {criteria.social_media.fulfilled ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(criteria.social_media.handles || {}).map(([platform, handle]) => (
                    <span key={platform} style={{ fontSize: 11, background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>
                      {platform}: {handle}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    placeholder="Instagram handle (e.g. @mystore)"
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="X / Twitter handle (optional)"
                    value={twitterInput}
                    onChange={(e) => setTwitterInput(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Criteria 3: Platform Age (1 Week) */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${criteria.platform_age.fulfilled ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: criteria.platform_age.fulfilled ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-subtle)', color: criteria.platform_age.fulfilled ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                {criteria.platform_age.fulfilled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle2 size={18} /> Fulfilled
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 12, fontWeight: 700 }}>
                    <Clock size={16} /> {criteria.platform_age.days} / 7 days
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {criteria.platform_age.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Registered {criteria.platform_age.days} days ago. Merchants must be active for at least 7 days before referring peers.
                </p>
              </div>
            </div>

            {/* Criteria 4: Background Check */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${criteria.background_check.fulfilled ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: criteria.background_check.fulfilled ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-subtle)', color: criteria.background_check.fulfilled ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                {criteria.background_check.fulfilled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle2 size={18} /> Passed
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3b82f6', fontSize: 12, fontWeight: 700 }}>
                    <ShieldCheck size={16} /> On Submission
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {criteria.background_check.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {criteria.background_check.fulfilled
                    ? 'Your store authenticity has been confirmed.'
                    : 'Our safety team verifies your store credibility automatically when you click Apply.'}
                </p>
              </div>
            </div>
          </div>

          {/* Apply Button Action Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Ready to become a Frontstore Referral Partner?
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                Submit your application for immediate review by our merchant relations team.
              </p>
            </div>
            <button
              onClick={handleApply}
              disabled={submitting}
              className="dashboard-primary-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Apply for Referral Program <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: APPROVED REFERRAL PARTNER DASHBOARD */}
      {isApproved && (
        <>
          {/* Share & Referral Link Hub */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 18,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981' }}>
                  ACTIVE REFERRAL PARTNER
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  Your Unique Merchant Referral Link
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={shareWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <WhatsAppIcon size={16} /> Share via WhatsApp
                </button>
                <button
                  onClick={copyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={15} /> Copy Link
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg-primary)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px dashed var(--border-color)',
              }}
            >
              <span style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all', flex: 1 }}>
                {referralLink}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                Code: <strong>{referralCode}</strong>
              </span>
            </div>
          </div>

          {/* ₦1,000 Minimum Withdrawal Unlock Threshold Card */}
          <div
            style={{
              background: stats.is_withdrawal_unlocked
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.02) 100%)',
              border: `1px solid ${stats.is_withdrawal_unlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: stats.is_withdrawal_unlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: stats.is_withdrawal_unlocked ? '#10b981' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stats.is_withdrawal_unlocked ? <CheckCircle2 size={20} /> : <DollarSign size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {stats.is_withdrawal_unlocked
                      ? 'Withdrawals Unlocked!'
                      : 'Withdrawal Threshold: Minimum ₦1,000 across Referrals'}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    {stats.is_withdrawal_unlocked
                      ? 'Your referral rewards have met the ₦1,000 threshold and are available for payout in your wallet.'
                      : `Referral rewards become available for withdrawal once your total referral earnings reach at least ₦1,000.`}
                  </p>
                </div>
              </div>

              {stats.is_withdrawal_unlocked ? (
                navigateDashboardTab && (
                  <button
                    onClick={() => navigateDashboardTab('wallet')}
                    className="dashboard-primary-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 18px',
                      fontSize: 13,
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    Go to Wallet & Withdraw <ArrowUpRight size={15} />
                  </button>
                )
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#d97706',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ₦{formatVal(stats.needed_for_withdrawal || Math.max(0, 1000 - stats.total_earned))} more to unlock
                </div>
              )}
            </div>

            {/* Progress Bar towards ₦1,000 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: stats.is_withdrawal_unlocked ? '#10b981' : 'var(--text-primary)' }}>
                  ₦{formatVal(stats.total_earned)} Earned
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>Goal: ₦1,000 to Withdraw</span>
              </div>
              <div style={{ height: 8, width: '100%', background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, (stats.total_earned / 1000) * 100))}%`,
                    background: stats.is_withdrawal_unlocked ? '#10b981' : '#d97706',
                    borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Earned</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                ₦{formatVal(stats.total_earned)}
              </div>
              {stats.is_withdrawal_unlocked ? (
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginTop: 4, display: 'block' }}>
                  Available in wallet
                </span>
              ) : (
                <span style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginTop: 4, display: 'block' }}>
                  Locked until ₦1,000
                </span>
              )}
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Merchants Referred</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {stats.referrals_count}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                Registered via your link
              </span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Active Subscriptions</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-primary)', marginTop: 4 }}>
                {stats.active_subscriptions_count}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                Pro / Legend active peers
              </span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Verifications</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                {stats.pending_verifications_count}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                1st product anti-fraud review
              </span>
            </div>
          </div>

          {/* Reward Milestones Explainer Bar */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                How Your Milestone Rewards Work (₦1,000 Lifetime Cap Per Merchant)
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Max ₦1,000 / Peer
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>1. First Product Upload</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>+₦100</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Verified by Frontstore against fake/nonsense spam uploads.
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>2. Upgrade to Pro</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>+₦400</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Brings cumulative earnings to ₦500 once your peer joins Pro.
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>3. Upgrade to Legend</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>+₦500</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Hits the maximum ₦1,000 lifetime reward for that referred store.
                </p>
              </div>
            </div>
          </div>

          {/* Referred Merchants Table */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 18,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Referred Merchants ({referrals.length})
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Track peer upload verification, current subscription tiers, cancellations, and earnings.
                </p>
              </div>
            </div>

            {referrals.length === 0 ? (
              <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 6px 0' }}>No referred merchants yet</p>
                <p style={{ fontSize: 12, maxWidth: 360, margin: '0 auto 16px auto', color: 'var(--text-faint)' }}>
                  Share your referral link with fellow sellers on WhatsApp, Instagram, or Twitter to start earning!
                </p>
                <button onClick={shareWhatsApp} className="dashboard-primary-btn" style={{ padding: '8px 18px', fontSize: 13, borderRadius: 10 }}>
                  Share on WhatsApp
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Merchant & Store</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Joined</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Current Plan</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>1st Product Upload</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Earned / Max</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => {
                      const isCancelled = ref.subscription_status === 'cancelled' || ref.status === 'cancelled';
                      const planLabel = ref.plan?.toLowerCase().includes('legend')
                        ? 'Legend'
                        : ref.plan?.toLowerCase().includes('pro')
                        ? 'Pro'
                        : 'Free';

                      return (
                        <tr key={ref.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          {/* Merchant & Store */}
                          <td style={{ padding: '14px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 8,
                                  background: 'var(--bg-subtle)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: 'var(--text-secondary)',
                                  overflow: 'hidden',
                                }}
                              >
                                {ref.store_logo ? (
                                  <img src={ref.store_logo} alt={ref.store_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  ref.store_name?.charAt(0).toUpperCase() || 'M'
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ref.store_name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>@{ref.store_username}</div>
                              </div>
                            </div>
                          </td>

                          {/* Joined */}
                          <td style={{ padding: '14px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {ref.joined_at ? new Date(ref.joined_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </td>

                          {/* Current Plan */}
                          <td style={{ padding: '14px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background:
                                    planLabel === 'Legend'
                                      ? 'rgba(147, 51, 234, 0.12)'
                                      : planLabel === 'Pro'
                                      ? 'rgba(16, 185, 129, 0.12)'
                                      : 'var(--bg-subtle)',
                                  color:
                                    planLabel === 'Legend'
                                      ? '#9333ea'
                                      : planLabel === 'Pro'
                                      ? '#10b981'
                                      : 'var(--text-secondary)',
                                }}
                              >
                                {planLabel} Plan
                              </span>
                              {isCancelled && (
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 700 }}>
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 1st Product Status */}
                          <td style={{ padding: '14px 10px' }}>
                            {ref.first_product_status === 'verified' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                                <CheckCircle2 size={14} /> Verified (₦100)
                              </span>
                            )}
                            {ref.first_product_status === 'pending_verification' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 12, fontWeight: 600 }}>
                                <Clock size={14} /> In Review
                              </span>
                            )}
                            {ref.first_product_status === 'rejected' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
                                <AlertTriangle size={14} /> Rejected
                              </span>
                            )}
                            {ref.first_product_status === 'none' && (
                              <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                                No product yet
                              </span>
                            )}
                          </td>

                          {/* Earned / Max Lifetime */}
                          <td style={{ padding: '14px 10px' }}>
                            <div style={{ minWidth: 120 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                                <span style={{ color: '#10b981' }}>₦{formatVal(ref.total_earned)}</span>
                                <span style={{ color: 'var(--text-faint)' }}>₦1,000</span>
                              </div>
                              <div style={{ height: 6, width: '100%', background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, (ref.total_earned / 1000) * 100)}%`,
                                    background: ref.total_earned >= 1000 ? '#9333ea' : '#10b981',
                                    borderRadius: 999,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 10px' }}>
                            {ref.total_earned >= 1000 ? (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#9333ea' }}>Cap Reached</span>
                            ) : isCancelled ? (
                              <span style={{ fontSize: 11, color: '#ef4444' }}>Subscription Stopped</span>
                            ) : (
                              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Active</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Earnings History Log */}
          {earningsHistory.length > 0 && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                Recent Referral Earnings History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {earningsHistory.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.event_type === 'first_product_verified'
                          ? '1st Product Verification Reward'
                          : entry.event_type === 'pro_plan_upgrade'
                          ? 'Pro Plan Upgrade Reward'
                          : entry.event_type === 'legend_plan_upgrade'
                          ? 'Legend Plan Upgrade Reward'
                          : 'Referral Reward'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Referred: {entry.referee} • {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }}>
                      +₦{formatVal(entry.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
