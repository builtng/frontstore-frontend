'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Zap, CheckCircle2, Tag, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import type { StoreInfo, UserInfo } from '@/types/dashboard';

interface OtherPlanSku {
  key: string;
  billing_label: string | null;
  price: number;
}

interface OtherPlan {
  key: string;
  name: string;
  tagline: string | null;
  benefits: string[];
  plans: OtherPlanSku[];
}

interface BillingTabProps {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  setStore: (store: StoreInfo) => void;
  isPro: boolean;
  isLegend: boolean;
  proMonthlyPrice: number;
  proYearlyPrice: number;
  legendMonthlyPrice: number;
  legendYearlyPrice: number;
  freeProductLimit: number;
}

export default function BillingTab({
  user, setUser, setStore, isPro, isLegend,
  proMonthlyPrice, proYearlyPrice, legendMonthlyPrice, legendYearlyPrice, freeProductLimit,
}: BillingTabProps) {
  const apiUrl = getApiUrl();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const [legendBillingCycle, setLegendBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [legendCouponCode, setLegendCouponCode] = useState('');
  const [isValidatingLegendCoupon, setIsValidatingLegendCoupon] = useState(false);
  const [appliedLegendCoupon, setAppliedLegendCoupon] = useState<any>(null);

  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);

  // Any admin-created plans beyond the default Free/Pro/Legend three — fetched
  // from the public plans endpoint and rendered generically below those cards.
  const [otherPlans, setOtherPlans] = useState<OtherPlan[]>([]);
  const [otherPlanCycle, setOtherPlanCycle] = useState<Record<string, 'monthly' | 'yearly'>>({});
  const [otherPlanProcessing, setOtherPlanProcessing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/public/plans`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) {
          setOtherPlans(json.data.filter((g: any) => !['free', 'pro', 'legend'].includes(g.key)));
        }
      } catch {
        // Non-critical — the default three plan cards above still work fine without this.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenericPlanUpgrade = async (planKey: string, planName: string, price: number) => {
    if (price <= 0) {
      try {
        const res = await fetch(`${apiUrl}/v1/user/upgrade`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planKey }),
        });
        const json = await res.json();
        if (res.ok && json.data?.user) {
          toast.success(`Switched to ${planName}.`);
          setUser(json.data.user);
          localStorage.setItem('user', JSON.stringify(json.data.user));
        } else {
          throw new Error(json.message || 'Could not switch plans.');
        }
      } catch (e: any) {
        toast.error(e.message || 'Error switching plans.');
      }
      return;
    }

    try {
      setOtherPlanProcessing(planKey);
      const callbackUrl = `${window.location.origin}/dashboard`;
      const res = await fetch(`${apiUrl}/v1/payments/initialize-subscription`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, redirect_url: callbackUrl }),
      });
      const json = await res.json();
      if (res.ok && json.data?.authorization_url) {
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error(json.message || 'Could not start payment. Try again.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Payment initialization failed.');
    } finally {
      setOtherPlanProcessing(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setIsValidatingCoupon(true);
      const targetPlan = billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly';
      const res = await fetch(`${apiUrl}/v1/payments/validate-coupon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), plan: targetPlan }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setAppliedCoupon(json.data);
        toast.success('Coupon applied successfully! 🎉');
      } else {
        throw new Error(json.message || 'Invalid coupon code.');
      }
    } catch (e: any) {
      setAppliedCoupon(null);
      toast.error(e.message || 'Could not validate coupon.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponCode('');
  }, [billingCycle]);

  // --- Legend coupon code validation & application (mirrors handleApplyCoupon for Pro) ---
  const handleApplyLegendCoupon = async () => {
    if (!legendCouponCode.trim()) return;
    try {
      setIsValidatingLegendCoupon(true);
      const targetPlan = legendBillingCycle === 'monthly' ? 'legend_monthly' : 'legend_yearly';
      const res = await fetch(`${apiUrl}/v1/payments/validate-coupon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: legendCouponCode.trim(), plan: targetPlan }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setAppliedLegendCoupon(json.data);
        toast.success('Coupon applied successfully! 🎉');
      } else {
        throw new Error(json.message || 'Invalid coupon code.');
      }
    } catch (e: any) {
      setAppliedLegendCoupon(null);
      toast.error(e.message || 'Could not validate coupon.');
    } finally {
      setIsValidatingLegendCoupon(false);
    }
  };

  useEffect(() => {
    setAppliedLegendCoupon(null);
    setLegendCouponCode('');
  }, [legendBillingCycle]);

  // --- Upgrade Plan via Real Paystack Payment ---
  const handleUpgradePlan = async (targetPlan: 'free' | 'pro_monthly' | 'pro_yearly' | 'legend_monthly' | 'legend_yearly') => {
    if (targetPlan === 'free') {
      // Downgrade is free — no payment needed
      try {
        const res = await fetch(`${apiUrl}/v1/user/upgrade`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'free' })
        });
        const json = await res.json();
        if (res.ok && json.data?.user) {
          toast.success('Switched back to Free Tier.');
          setUser(json.data.user);
          localStorage.setItem('user', JSON.stringify(json.data.user));
        } else {
          throw new Error(json.message || 'Downgrade failed');
        }
      } catch (e: any) {
        toast.error(e.message || 'Error downgrading plan.');
      }
      return;
    }

    const isLegendTarget = targetPlan === 'legend_monthly' || targetPlan === 'legend_yearly';
    const planLabel = isLegendTarget ? 'Business' : 'Pro';

    // Paid plans require real payment via Paystack
    try {
      setIsInitializingPayment(true);
      const callbackUrl = `${window.location.origin}/dashboard`;
      const res = await fetch(`${apiUrl}/v1/payments/initialize-subscription`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: targetPlan,
          redirect_url: callbackUrl,
          coupon_code: isLegendTarget
            ? (appliedLegendCoupon ? appliedLegendCoupon.code : null)
            : (appliedCoupon ? appliedCoupon.code : null)
        }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.data?.direct_activation) {
          // Direct upgrade via 100% discount coupon
          toast.success(json.message || `Plan upgraded to ${planLabel} successfully! 🎉`);
          setUser(json.data.user);
          localStorage.setItem('user', JSON.stringify(json.data.user));
          if (json.data.store) {
            setStore(json.data.store);
            localStorage.setItem('store', JSON.stringify(json.data.store));
          }
          if (isLegendTarget) {
            setAppliedLegendCoupon(null);
            setLegendCouponCode('');
          } else {
            setAppliedCoupon(null);
            setCouponCode('');
          }
        } else if (json.data?.authorization_url) {
          // Redirect to Paystack hosted checkout
          window.location.href = json.data.authorization_url;
        } else {
          throw new Error('Upgrade response was successful but missing activation instructions.');
        }
      } else {
        throw new Error(json.message || 'Could not start payment. Try again.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Payment initialization failed.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Cancel auto-renewal? Your plan will move back to Free immediately.")) {
      return;
    }
    try {
      setIsCancellingSubscription(true);
      const res = await fetch(`${apiUrl}/v1/payments/cancel-subscription`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok && json.data?.user) {
        toast.success(json.message || 'Auto-renewal cancelled.');
        setUser(json.data.user);
        localStorage.setItem('user', JSON.stringify(json.data.user));
      } else {
        throw new Error(json.message || 'Could not cancel subscription.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error cancelling subscription.');
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245,158,11,0.3)', flexShrink: 0
        }}>
          <Zap size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
            Subscription Plans & Billing
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
            Unlock unlimited products, AI studio tools, custom domain, and pixel tracking.
          </p>
        </div>
      </div>

      {/* Manage Subscription — only for users on a real recurring Paystack subscription */}
      {user?.plan && user.plan !== 'free' && user?.paystack_subscription_code && (
        <div className="card" style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          background: user.subscription_status === 'attention' ? 'var(--danger-light)' : 'var(--bg-2)',
          border: user.subscription_status === 'attention' ? '1px solid var(--danger)' : '1px solid var(--border)',
        }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>
              {user.subscription_status === 'attention'
                ? 'Your last renewal payment failed'
                : `Auto-renewing ${user.plan.startsWith('legend') ? 'LEGEND' : 'PRO'} (${user.plan.endsWith('yearly') ? 'Yearly' : 'Monthly'}) subscription`}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {user.subscription_status === 'attention'
                ? 'Update your card with Paystack or contact support to keep your plan active.'
                : "Billed automatically by Paystack on your plan's cycle. Cancel anytime — you'll move back to Free immediately."}
            </p>
          </div>
          {user.subscription_status !== 'non_renewing' && user.subscription_status !== 'cancelled' && (
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={isCancellingSubscription}
              className="btn clickable"
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontWeight: 800,
                fontSize: 13,
                opacity: isCancellingSubscription ? 0.7 : 1,
              }}
            >
              {isCancellingSubscription ? 'Cancelling…' : 'Cancel Auto-Renewal'}
            </button>
          )}
        </div>
      )}

      {/* Plan Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1.1fr', gap: 24 }} className="responsive-settings-grid">

        {/* Free Plan */}
        <div className="card" style={{
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          border: user?.plan === 'free' || !user?.plan ? '2.5px solid var(--primary)' : '1px solid var(--border)',
          position: 'relative',
          background: 'var(--surface)'
        }}>
          {(user?.plan === 'free' || !user?.plan) && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: 'var(--primary-light)', color: 'var(--primary)',
              fontSize: 10, fontWeight: 900, padding: '4px 10px',
              borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>Current Plan</span>
          )}

          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Free Starter Plan</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>For small merchants starting their digital shop.</p>

          <div style={{ marginTop: 20, marginBottom: 24 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>₦0</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}> / free forever</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span><strong>No transaction fees</strong> — 0% on every plan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span>Up to {freeProductLimit} products listed at once</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span>WhatsApp checkout on every order</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span>Public storefront page with your own link</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span>Bank transfer &amp; MTN MoMo Agent payment methods</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span>Next-day payouts to your bank</span>
            </div>
          </div>

          <button
            type="button"
            disabled={user?.plan === 'free' || !user?.plan}
            onClick={() => handleUpgradePlan('free')}
            className={`btn clickable`}
            style={{
              width: '100%', marginTop: 24, padding: 12,
              background: user?.plan === 'free' || !user?.plan ? 'var(--bg-2)' : 'transparent',
              border: user?.plan === 'free' || !user?.plan ? '1px solid var(--border)' : '1px solid var(--primary)',
              color: user?.plan === 'free' || !user?.plan ? 'var(--text-muted)' : 'var(--primary)',
              fontWeight: 800, borderRadius: 'var(--r-md)'
            }}
          >
            {user?.plan === 'free' || !user?.plan ? 'Active Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="card" style={{
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          border: user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly' ? '2.5px solid #f59e0b' : '1px solid var(--border)',
          position: 'relative',
          background: 'var(--surface)',
          boxShadow: '0 10px 25px -5px rgba(245,158,11,0.08)'
        }}>
          {(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff',
              fontSize: 10, fontWeight: 900, padding: '4px 10px',
              borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', gap: 4
            }}><Zap size={8} /> Active Pro ({user?.plan === 'pro_yearly' ? 'Yearly' : 'Monthly'})</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Pro Business Plan</h3>
            <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>POPULAR</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Unlock full branding, SEO features, and AI-powered tools.</p>

          {/* Billing Cycle Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-2)',
            padding: 4,
            borderRadius: 'var(--r-md)',
            marginTop: 16,
            marginBottom: 4,
            border: '1px solid var(--border)',
            width: 'fit-content'
          }}>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--surface)' : 'transparent',
                color: billingCycle === 'monthly' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: billingCycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: billingCycle === 'yearly' ? 'var(--surface)' : 'transparent',
                color: billingCycle === 'yearly' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: billingCycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s'
              }}
            >
              Yearly
              <span style={{
                background: '#dcfce7',
                color: '#128C7E',
                fontSize: 9,
                fontWeight: 900,
                padding: '1px 5px',
                borderRadius: 4
              }}>
                Save 17%
              </span>
            </button>
          </div>

          <div style={{ marginTop: 16, marginBottom: 20 }}>
            {appliedCoupon ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>
                  {billingCycle === 'monthly' ? `₦${proMonthlyPrice.toLocaleString()}` : `₦${proYearlyPrice.toLocaleString()}`}
                </span>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                    ₦{(appliedCoupon.final_price || 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {billingCycle === 'monthly' ? ' / month' : ' / year'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
                  {billingCycle === 'monthly' ? `₦${proMonthlyPrice.toLocaleString()}` : `₦${proYearlyPrice.toLocaleString()}`}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {billingCycle === 'monthly' ? ' / month' : ' / year'}
                </span>
              </>
            )}
            {billingCycle === 'yearly' && !appliedCoupon && (
              <div style={{ fontSize: 11.5, color: '#25D366', fontWeight: 700, marginTop: 4 }}>
                equivalent to ₦{Math.round(proYearlyPrice / 12).toLocaleString()} / month (billed annually)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span><strong>No transaction fees</strong> — 0% on every plan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span><strong>Everything in Free, plus:</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span><strong>Unlimited products &amp; categories</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span><strong>AI photo-to-listing &amp; AI auto-write</strong> descriptions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span>Custom storefront branding &amp; colors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span>Sales &amp; visitor analytics with report exports</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span>Invoice &amp; receipt generation, coupons &amp; flash sales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#d97706" />
              <span>Nina AI Chat Widget &amp; priority feature updates</span>
            </div>
          </div>

          {/* Coupon input for non-pro users (also hidden for Legend, which already includes Pro) */}
          {!isPro && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Promo / Coupon Code
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. SAVE50"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setAppliedCoupon(null);
                  }}
                  disabled={isValidatingCoupon || isInitializingPayment}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    background: 'var(--bg-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isValidatingCoupon || isInitializingPayment}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 'var(--r-sm)',
                    border: '1.5px solid var(--primary)',
                    color: 'var(--primary)',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isValidatingCoupon ? <Loader2 size={13} className="spinner animate-spin" /> : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--primary-light)', borderRadius: 'var(--r-sm)', fontSize: 11.5, border: '1px solid var(--primary)', color: 'var(--text)' }}>
                  <p style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={12} />
                    Code Applied: {appliedCoupon.code}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10.5, marginTop: 2 }}>
                    Discount: {appliedCoupon.discount_type === 'percentage'
                      ? `${parseFloat(appliedCoupon.discount_value || '0') || 0}% Off`
                      : `₦${(parseFloat(appliedCoupon.discount_value || '0') || 0).toLocaleString()} Off`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              disabled={isPro || isInitializingPayment}
              onClick={() => handleUpgradePlan(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly')}
              className={`btn clickable`}
              style={{
                padding: 12,
                background: isPro
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : appliedCoupon && appliedCoupon.final_price === 0
                    ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                    : 'none',
                border: isPro
                  ? '1.5px solid #d97706'
                  : appliedCoupon && appliedCoupon.final_price === 0
                    ? '1.5px solid #25D366'
                    : '1.5px solid #d97706',
                color: isPro || (appliedCoupon && appliedCoupon.final_price === 0) ? '#fff' : '#d97706',
                fontWeight: 800, borderRadius: 'var(--r-md)', fontSize: 13,
                opacity: (isPro || isInitializingPayment) ? 0.7 : 1,
                display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              }}
            >
              {isInitializingPayment ? <Loader2 size={14} className="spinner animate-spin" /> : null}
              {user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly'
                ? `✓ Active Plan (${user?.plan === 'pro_yearly' ? 'Yearly' : 'Monthly'})`
                : isLegend
                  ? '✓ Included in Business'
                  : isInitializingPayment
                    ? 'Processing...'
                    : appliedCoupon && appliedCoupon.final_price === 0
                      ? 'Activate Plan Free'
                      : billingCycle === 'monthly'
                        ? 'Go Pro Monthly'
                        : 'Go Pro Yearly'}
            </button>
            {!isPro && !(appliedCoupon && appliedCoupon.final_price === 0) && (
              <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.5 }}>
                Billed automatically via Paystack. Cancel auto-renewal anytime from this page — you'll move back to Free immediately, no questions asked.
              </p>
            )}
          </div>
        </div>

        {/* Legend Plan */}
        <div className="card" style={{
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          border: isLegend ? '2.5px solid #7c3aed' : '1px solid var(--border)',
          position: 'relative',
          background: 'var(--surface)',
          boxShadow: '0 10px 25px -5px rgba(124,58,237,0.08)'
        }}>
          {isLegend && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', color: '#fff',
              fontSize: 10, fontWeight: 900, padding: '4px 10px',
              borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', gap: 4
            }}><Zap size={8} /> Active Business ({user?.plan === 'legend_yearly' ? 'Yearly' : 'Monthly'})</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Business Plan</h3>
            <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>UNLIMITED AI</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Everything in Pro, plus custom domain, ad pixels, and unlimited AI.</p>

          {/* Billing Cycle Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-2)',
            padding: 4,
            borderRadius: 'var(--r-md)',
            marginTop: 16,
            marginBottom: 4,
            border: '1px solid var(--border)',
            width: 'fit-content'
          }}>
            <button
              type="button"
              onClick={() => setLegendBillingCycle('monthly')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: legendBillingCycle === 'monthly' ? 'var(--surface)' : 'transparent',
                color: legendBillingCycle === 'monthly' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: legendBillingCycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setLegendBillingCycle('yearly')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: legendBillingCycle === 'yearly' ? 'var(--surface)' : 'transparent',
                color: legendBillingCycle === 'yearly' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: legendBillingCycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s'
              }}
            >
              Yearly
              <span style={{
                background: '#dcfce7',
                color: '#128C7E',
                fontSize: 9,
                fontWeight: 900,
                padding: '1px 5px',
                borderRadius: 4
              }}>
                Save 17%
              </span>
            </button>
          </div>

          <div style={{ marginTop: 16, marginBottom: 20 }}>
            {appliedLegendCoupon ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>
                  {legendBillingCycle === 'monthly' ? `₦${legendMonthlyPrice.toLocaleString()}` : `₦${legendYearlyPrice.toLocaleString()}`}
                </span>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>
                    ₦{(appliedLegendCoupon.final_price || 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {legendBillingCycle === 'monthly' ? ' / month' : ' / year'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>
                  {legendBillingCycle === 'monthly' ? `₦${legendMonthlyPrice.toLocaleString()}` : `₦${legendYearlyPrice.toLocaleString()}`}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {legendBillingCycle === 'monthly' ? ' / month' : ' / year'}
                </span>
              </>
            )}
            {legendBillingCycle === 'yearly' && !appliedLegendCoupon && (
              <div style={{ fontSize: 11.5, color: '#25D366', fontWeight: 700, marginTop: 4 }}>
                equivalent to ₦{Math.round(legendYearlyPrice / 12).toLocaleString()} / month (billed annually)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span><strong>No transaction fees</strong> — 0% on every plan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span><strong>Everything in Pro, plus:</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span>Connect a custom domain (e.g. <strong>yourbrand.com</strong>)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span>Facebook Pixel, Google Tag Manager &amp; TikTok Pixel tracking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span>Custom Storefront Builder with advanced section layouts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span><strong>Unlimited AI Studio generations</strong> on any billing cycle</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span>Dashboard customization (Remove distractions)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span>Business storefront badge &amp; priority founder support</span>
            </div>
          </div>

          {/* Coupon input for non-legend users */}
          {!isLegend && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Promo / Coupon Code
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. SAVE50"
                  value={legendCouponCode}
                  onChange={(e) => {
                    setLegendCouponCode(e.target.value.toUpperCase());
                    setAppliedLegendCoupon(null);
                  }}
                  disabled={isValidatingLegendCoupon || isInitializingPayment}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    background: 'var(--bg-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyLegendCoupon}
                  disabled={!legendCouponCode.trim() || isValidatingLegendCoupon || isInitializingPayment}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 'var(--r-sm)',
                    border: '1.5px solid #7c3aed',
                    color: '#7c3aed',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isValidatingLegendCoupon ? <Loader2 size={13} className="spinner animate-spin" /> : 'Apply'}
                </button>
              </div>

              {appliedLegendCoupon && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: '#ede9fe', borderRadius: 'var(--r-sm)', fontSize: 11.5, border: '1px solid #7c3aed', color: 'var(--text)' }}>
                  <p style={{ color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={12} />
                    Code Applied: {appliedLegendCoupon.code}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10.5, marginTop: 2 }}>
                    Discount: {appliedLegendCoupon.discount_type === 'percentage'
                      ? `${parseFloat(appliedLegendCoupon.discount_value || '0') || 0}% Off`
                      : `₦${(parseFloat(appliedLegendCoupon.discount_value || '0') || 0).toLocaleString()} Off`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              disabled={isLegend || isInitializingPayment}
              onClick={() => handleUpgradePlan(legendBillingCycle === 'monthly' ? 'legend_monthly' : 'legend_yearly')}
              className={`btn clickable`}
              style={{
                padding: 12,
                background: isLegend
                  ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
                  : appliedLegendCoupon && appliedLegendCoupon.final_price === 0
                    ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                    : 'none',
                border: isLegend
                  ? '1.5px solid #6d28d9'
                  : appliedLegendCoupon && appliedLegendCoupon.final_price === 0
                    ? '1.5px solid #25D366'
                    : '1.5px solid #7c3aed',
                color: isLegend || (appliedLegendCoupon && appliedLegendCoupon.final_price === 0) ? '#fff' : '#7c3aed',
                fontWeight: 800, borderRadius: 'var(--r-md)', fontSize: 13,
                opacity: (isLegend || isInitializingPayment) ? 0.7 : 1,
                display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              }}
            >
              {isInitializingPayment ? <Loader2 size={14} className="spinner animate-spin" /> : null}
              {isLegend
                ? `✓ Active Plan (${user?.plan === 'legend_yearly' ? 'Yearly' : 'Monthly'})`
                : isInitializingPayment
                  ? 'Processing...'
                  : appliedLegendCoupon && appliedLegendCoupon.final_price === 0
                    ? 'Activate Plan Free'
                    : legendBillingCycle === 'monthly'
                      ? 'Go Business Monthly'
                      : 'Go Business Yearly'}
            </button>
            {!isLegend && !(appliedLegendCoupon && appliedLegendCoupon.final_price === 0) && (
              <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.5 }}>
                Billed automatically via Paystack. Cancel auto-renewal anytime from this page — you'll move back to Free immediately, no questions asked.
              </p>
            )}
          </div>
        </div>

      </div>

      {otherPlans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900 }}>More plans</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {otherPlans.map((plan) => {
              const cycle = otherPlanCycle[plan.key] || 'monthly';
              const monthlySku = plan.plans.find((p) => p.billing_label === 'Monthly') || plan.plans[0];
              const yearlySku = plan.plans.find((p) => p.billing_label === 'Yearly') || monthlySku;
              const activeSku = cycle === 'yearly' ? yearlySku : monthlySku;
              const isCurrent = user?.plan === activeSku?.key;
              return (
                <div key={plan.key} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', border: isCurrent ? '2.5px solid var(--primary)' : '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 900 }}>{plan.name}</h4>
                  {plan.tagline && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{plan.tagline}</p>}
                  <div style={{ marginTop: 16, marginBottom: 12 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>₦{Math.round(activeSku?.price || 0).toLocaleString('en-NG')}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}> / {cycle}</span>
                  </div>
                  {yearlySku && monthlySku !== yearlySku && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                      {(['monthly', 'yearly'] as const).map((c) => (
                        <button key={c} type="button" onClick={() => setOtherPlanCycle((prev) => ({ ...prev, [plan.key]: c }))}
                          className="clickable"
                          style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--r-md)', fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize', border: '1px solid var(--border)', background: cycle === c ? 'var(--primary-light)' : 'transparent', color: cycle === c ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, flex: 1 }}>
                    {(plan.benefits || []).filter((b) => !b.endsWith(':')).slice(0, 5).map((b) => (
                      <li key={b} style={{ display: 'flex', gap: 6, fontSize: 12.5, color: 'var(--text-2)' }}>
                        <CheckCircle2 size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} /> {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={isCurrent || otherPlanProcessing === activeSku?.key}
                    onClick={() => activeSku && handleGenericPlanUpgrade(activeSku.key, plan.name, activeSku.price)}
                    className="btn btn-primary clickable"
                    style={{ padding: 12, fontSize: 13, fontWeight: 800, opacity: (isCurrent || otherPlanProcessing === activeSku?.key) ? 0.7 : 1 }}
                  >
                    {isCurrent ? '✓ Active Plan' : otherPlanProcessing === activeSku?.key ? 'Processing…' : `Go ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
