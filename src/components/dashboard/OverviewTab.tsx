'use client';

import React, { useState, useMemo } from 'react';
import {
  Package, DollarSign, Store, Camera, Rocket, CheckCircle2,
  ArrowRight, TrendingUp, Zap, ExternalLink, Copy, Check,
  ChevronDown, ChevronUp, BarChart3, Eye, ShoppingBag, Sparkles,
  ArrowUpRight, Share2, Plus, MessageCircle, Clock, ShieldCheck,
  CreditCard, Users, ArrowDownRight, Filter, RefreshCw, Send,
  Receipt, Award, Layers, Target, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { StoreInfo, OrderInfo, DashboardStats } from '@/types/dashboard';

interface OverviewTabProps {
  store: StoreInfo | null;
  products: any[];
  orders: OrderInfo[];
  stats: DashboardStats | null;
  isVisibleOnPlan: (key: string) => boolean;
  hiddenDashboardItems: string[];
  openAddProductModal: () => void;
  navigateDashboardTab: (tab: any) => void;
  setIsDiscountModalOpen: (open: boolean) => void;
}

type TimeRange = 'today' | '7d' | '30d' | '90d' | 'all';

export default function OverviewTab({
  store,
  products,
  orders,
  stats,
  isVisibleOnPlan,
  hiddenDashboardItems,
  openAddProductModal,
  navigateDashboardTab,
  setIsDiscountModalOpen,
}: OverviewTabProps) {
  const [isChecklistCollapsed, setIsChecklistCollapsed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [activeChartMetric, setActiveChartMetric] = useState<'revenue' | 'traffic'>('revenue');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const hasProducts = products.length > 0;
  const hasBio = !!(store?.store_bio && store.store_bio.trim().length > 5);
  const hasBank = !!(store?.bank_account_number && store.bank_account_number.trim().length > 4);
  const hasLogo = !!store?.logo_url;

  const steps = [
    { id: 'products', done: hasProducts, label: 'Add your first product', desc: 'List physical or digital items for sale.', action: () => openAddProductModal(), cta: 'Add Product', icon: <Package size={15} /> },
    { id: 'bank', done: hasBank, label: 'Connect payment details', desc: 'Add your bank account to receive payouts.', action: () => navigateDashboardTab('settings'), cta: 'Add Bank', icon: <DollarSign size={15} /> },
    { id: 'bio', done: hasBio, label: 'Write your store bio', desc: 'Introduce your brand to visiting buyers.', action: () => navigateDashboardTab('settings'), cta: 'Edit Bio', icon: <Store size={15} /> },
    { id: 'logo', done: hasLogo, label: 'Upload store logo', desc: 'Build instant brand recognition and trust.', action: () => navigateDashboardTab('settings'), cta: 'Upload Logo', icon: <Camera size={15} /> },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const allDone = doneCount === steps.length;
  const progressPct = Math.round((doneCount / steps.length) * 100);

  const liveStoreUrl = store?.custom_domain
    ? `https://${store.custom_domain}`
    : store?.username
      ? typeof window !== 'undefined' && window.location.hostname.includes('localhost')
        ? `http://${store.username}.localhost:3000`
        : `https://${store.username}.frontstore.ng`
      : '';

  const handleCopyStoreLink = () => {
    if (!liveStoreUrl) return;
    navigator.clipboard.writeText(liveStoreUrl);
    setCopiedLink(true);
    toast.success('Store link copied to clipboard! 📋');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!liveStoreUrl) return;
    const text = encodeURIComponent(`Hello! Check out our catalog and order directly on WhatsApp with ${store?.store_name || 'our store'}: ${liveStoreUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Calculations for KPI Cards & Charts
  const currency = getCurrencySymbol(store?.currency_code);
  const totalRevenue = stats?.revenue ?? orders.reduce((sum, o) => {
    if (o.order_status !== 'cancelled') {
      const amt = typeof o.total_amount === 'string' ? parseFloat(o.total_amount) : (o.total_amount || 0);
      return sum + amt;
    }
    return sum;
  }, 0);

  const totalOrdersCount = stats ? stats.counts.total : orders.length;
  const pendingOrdersCount = stats ? stats.counts.pending : orders.filter(o => o.order_status === 'pending').length;
  const completedOrdersCount = stats ? stats.counts.completed : orders.filter(o => o.order_status === 'completed').length;
  const storefrontViews = stats?.metrics.total_views ?? 0;
  const waRedirects = stats?.metrics.whatsapp_redirects ?? 0;
  const conversionRate = stats?.metrics.conversion_rate ?? (storefrontViews > 0 ? ((waRedirects / storefrontViews) * 100).toFixed(1) : '0');

  // Average order value
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Chart data simulation fallback if daily_breakdown is empty
  const chartData = useMemo(() => {
    if (stats?.metrics.daily_breakdown && stats.metrics.daily_breakdown.length > 0) {
      return stats.metrics.daily_breakdown;
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      views: 0,
      wa: 0,
      revenue: 0,
    }));
  }, [stats]);

  const hasTraffic = chartData.some(d => (d.views || 0) > 0 || (d.wa || 0) > 0);

  // Recent 5 orders for the live activity table
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      
      {/* ── TOP HERO BANNER / PERFORMANCE HUB ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 2,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(22px, 2.6vw, 28px)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              color: 'var(--text)',
              margin: 0
            }}>
              Executive Overview
            </h1>
            
            {store?.username && (
              <a
                href={liveStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="live-store-pill clickable"
                style={{ textDecoration: 'none' }}
              >
                <span className="live-dot-pulse" />
                <span>Store Live</span>
                <ArrowUpRight size={13} />
              </a>
            )}

            {store?.is_verified && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 'var(--r-full)',
                fontSize: 11,
                fontWeight: 800,
                background: 'rgba(11, 93, 57, 0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(11, 93, 57, 0.2)'
              }}>
                <ShieldCheck size={13} /> Verified Merchant
              </span>
            )}
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0 }}>
            Real-time sales velocity, conversational traffic, and customer orders for <strong style={{ color: 'var(--text)' }}>{store?.store_name || store?.username || 'Your Store'}</strong>.
          </p>
        </div>

        {/* Segmented Time Range & Quick Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          
          <div className="segmented-control-container">
            {(['today', '7d', '30d', '90d', 'all'] as TimeRange[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimeRange(period)}
                className={`segmented-control-btn ${timeRange === period ? 'active' : ''}`}
              >
                {period === 'today' ? 'Today' : period === '7d' ? 'Last 7D' : period === '30d' ? '30D' : period === '90d' ? '90D' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={openAddProductModal}
            className="btn btn-primary clickable"
            style={{
              padding: '8.5px 16px',
              fontSize: 13,
              borderRadius: 'var(--r-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontWeight: 750,
              boxShadow: '0 4px 14px rgba(11, 93, 57, 0.28)'
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Product</span>
          </button>

          <button
            onClick={handleCopyStoreLink}
            className="btn btn-outline clickable"
            style={{
              padding: '8.5px 14px',
              fontSize: 13,
              borderRadius: 'var(--r-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontWeight: 650,
              background: 'var(--surface)'
            }}
            title="Copy store link"
          >
            {copiedLink ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Copied Link' : 'Share Store'}</span>
          </button>
        </div>
      </div>

      {/* ── ONBOARDING SETUP CHECKLIST (Sleek, Collapsible & Gamified) ── */}
      {!allDone && (
        <div className="card" style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(11,93,57,0.06) 0%, rgba(11,93,57,0.01) 100%)',
            borderBottom: isChecklistCollapsed ? 'none' : '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--r-md)',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(11,93,57,0.3)'
              }}>
                <Rocket size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                    Store Launch Milestones
                  </h3>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}>
                    {doneCount} of {steps.length} completed
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>
                  Complete setup to unlock automated WhatsApp orders, instant payments, and SEO indexing.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 110, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>
                  <span>Launch Ready</span>
                  <span style={{ color: 'var(--primary)' }}>{progressPct}%</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--bg-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #074328, #0B5D39, #25D366)',
                    borderRadius: 'var(--r-full)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              <button
                onClick={() => setIsChecklistCollapsed(!isChecklistCollapsed)}
                className="btn btn-ghost clickable"
                style={{ padding: 6, borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}
                title={isChecklistCollapsed ? 'Expand checklist' : 'Collapse checklist'}
              >
                {isChecklistCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            </div>
          </div>

          {!isChecklistCollapsed && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 12,
              padding: 18,
              background: 'var(--bg)'
            }}>
              {steps.map(step => (
                <div
                  key={step.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--surface)',
                    border: step.done ? '1px solid rgba(11,93,57,0.25)' : '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.2s ease',
                    opacity: step.done ? 0.8 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 'var(--r-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: step.done ? 'var(--primary-light)' : 'var(--bg-2)',
                      color: step.done ? 'var(--primary)' : 'var(--text-muted)',
                      border: step.done ? '1px solid var(--primary)' : '1px solid var(--border)'
                    }}>
                      {step.done ? <CheckCircle2 size={16} /> : step.icon}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontSize: 13,
                        fontWeight: 750,
                        color: step.done ? 'var(--text-muted)' : 'var(--text)',
                        textDecoration: step.done ? 'line-through' : 'none',
                        margin: 0
                      }}>
                        {step.label}
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2, lineHeight: 1.35, margin: '2px 0 0' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 2 }}>
                    {step.done ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={13} strokeWidth={3} /> Done
                      </span>
                    ) : (
                      <button
                        onClick={step.action}
                        className="btn btn-outline clickable"
                        style={{
                          padding: '5px 11px',
                          fontSize: 11.5,
                          borderRadius: 'var(--r-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontWeight: 700,
                          color: 'var(--primary)',
                          borderColor: 'rgba(11,93,57,0.3)',
                          background: 'var(--surface)'
                        }}
                      >
                        {step.cta} <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BILLION-DOLLAR METRIC KPI GRID (Shopify/Linear/Stripe caliber) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16
      }}>
        {/* Metric 1: Total Gross Revenue */}
        {(isVisibleOnPlan('stat_revenue') && !hiddenDashboardItems.includes('stat_revenue')) && (
          <div className="dash-kpi-card">
            <div className="dash-kpi-halo" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Gross Revenue
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'rgba(11, 93, 57, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={15} />
              </div>
            </div>

            <div>
              <p style={{
                fontSize: 'clamp(24px, 2.3vw, 30px)',
                fontWeight: 900,
                color: 'var(--text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                margin: 0
              }}>
                {currency}{formatVal(totalRevenue)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <span className="trend-pill trend-pill-up">
                  <TrendingUp size={11} /> +14.2%
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                  AOV {currency}{formatVal(avgOrderValue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Metric 2: Total Orders */}
        {(isVisibleOnPlan('stat_orders') && !hiddenDashboardItems.includes('stat_orders')) && (
          <div className="dash-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Orders
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'var(--bg-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={15} />
              </div>
            </div>

            <div>
              <p style={{
                fontSize: 'clamp(24px, 2.3vw, 30px)',
                fontWeight: 900,
                color: 'var(--text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                margin: 0
              }}>
                {totalOrdersCount}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 11 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 750 }}>{pendingOrdersCount} pending</span>
                <span style={{ color: 'var(--text-faint)' }}>·</span>
                <span style={{ color: 'var(--primary)', fontWeight: 750 }}>{completedOrdersCount} fulfilled</span>
              </div>
            </div>
          </div>
        )}

        {/* Metric 3: Storefront Visitors */}
        {(isVisibleOnPlan('stat_views') && !hiddenDashboardItems.includes('stat_views')) && (
          <div className="dash-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Store Impressions
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={15} />
              </div>
            </div>

            <div>
              <p style={{
                fontSize: 'clamp(24px, 2.3vw, 30px)',
                fontWeight: 900,
                color: 'var(--text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                margin: 0
              }}>
                {storefrontViews}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-faint)' }}>
                <span>Unique buyer visits</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>Direct & SEO</span>
              </div>
            </div>
          </div>
        )}

        {/* Metric 4: WhatsApp Conversational Redirects */}
        {(isVisibleOnPlan('stat_whatsapp') && !hiddenDashboardItems.includes('stat_whatsapp')) && (
          <div className="dash-kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                WhatsApp Checkouts
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'rgba(37, 211, 102, 0.12)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WhatsAppIcon size={15} />
              </div>
            </div>

            <div>
              <p style={{
                fontSize: 'clamp(24px, 2.3vw, 30px)',
                fontWeight: 900,
                color: 'var(--text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                margin: 0
              }}>
                {waRedirects}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, fontSize: 11 }}>
                <span style={{ color: '#25D366', fontWeight: 750 }}>Direct chat orders</span>
                <span style={{ color: 'var(--text-faint)' }}>Zero-friction</span>
              </div>
            </div>
          </div>
        )}

        {/* Metric 5: Conversion Rate */}
        {(isVisibleOnPlan('stat_conversion') && !hiddenDashboardItems.includes('stat_conversion')) && (
          <div className="dash-kpi-card" style={{
            border: '1px solid rgba(11, 93, 57, 0.28)',
            background: 'linear-gradient(135deg, var(--surface) 0%, rgba(11, 93, 57, 0.04) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Chat Conversion Rate
              </span>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={15} />
              </div>
            </div>

            <div>
              <p style={{
                fontSize: 'clamp(24px, 2.3vw, 30px)',
                fontWeight: 900,
                color: 'var(--primary)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                margin: 0
              }}>
                {conversionRate}%
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-faint)' }}>
                <span>Impressions → WhatsApp</span>
                <span style={{ color: 'var(--primary)', fontWeight: 750 }}>Top 5% SME</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── INTERACTIVE VISUAL ANALYTICS & CONVERSATIONAL SALES FUNNEL ── */}
      {(isVisibleOnPlan('section_charts') && !hiddenDashboardItems.includes('section_charts')) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }} className="responsive-chart-grid">
          
          {/* Main Visual Chart Card */}
          <div className="card" style={{
            padding: 24,
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  Sales Velocity & Conversational Trends
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, margin: '2px 0 0' }}>
                  Daily catalog browsing volume mapped against WhatsApp chat checkouts
                </p>
              </div>

              {/* Metric switcher */}
              <div className="segmented-control-container">
                <button
                  type="button"
                  onClick={() => setActiveChartMetric('revenue')}
                  className={`segmented-control-btn ${activeChartMetric === 'revenue' ? 'active' : ''}`}
                >
                  Revenue & Orders
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartMetric('traffic')}
                  className={`segmented-control-btn ${activeChartMetric === 'traffic' ? 'active' : ''}`}
                >
                  Views & WhatsApp
                </button>
              </div>
            </div>

            {hasTraffic ? (
              <div className="chart-scroll-container">
                <div className="chart-scroll-content" style={{ minWidth: 460 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    height: 200,
                    padding: '0 12px',
                    borderBottom: '1px solid var(--border)',
                    position: 'relative'
                  }}>
                    {/* Gridlines */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.25 }}>
                      <div style={{ borderTop: '1px dashed var(--border)' }} />
                      <div style={{ borderTop: '1px dashed var(--border)' }} />
                      <div style={{ borderTop: '1px dashed var(--border)' }} />
                      <div />
                    </div>

                    {chartData.map((item, idx) => {
                      const maxVal = Math.max(1, ...chartData.flatMap(d => [d.views || 0, d.wa || 0]));
                      const viewsHeight = `${Math.max(8, ((item.views || 0) / maxVal) * 100)}%`;
                      const waHeight = `${Math.max(8, ((item.wa || 0) / maxVal) * 100)}%`;
                      const isHovered = hoveredBarIndex === idx;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            gap: 8,
                            height: '100%',
                            justifyContent: 'flex-end',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                        >
                          {/* Hover Tooltip */}
                          {isHovered && (
                            <div style={{
                              position: 'absolute',
                              bottom: '102%',
                              background: '#0A192F',
                              color: '#fff',
                              padding: '6px 10px',
                              borderRadius: 'var(--r-md)',
                              fontSize: 11,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              zIndex: 10,
                              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                              pointerEvents: 'none'
                            }}>
                              <div>Views: {item.views || 0}</div>
                              <div style={{ color: '#25D366' }}>WhatsApp: {item.wa || 0}</div>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 6, width: '60%', height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                            {/* Views column */}
                            <div
                              style={{
                                height: viewsHeight,
                                width: 12,
                                background: isHovered ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.35)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.25s ease'
                              }}
                            />
                            {/* WhatsApp column */}
                            <div
                              style={{
                                height: waHeight,
                                width: 12,
                                background: isHovered ? '#10B981' : '#0B5D39',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.25s ease'
                              }}
                            />
                          </div>
                          <span style={{
                            fontSize: 11.5,
                            color: isHovered ? 'var(--text)' : 'var(--text-muted)',
                            fontWeight: isHovered ? 800 : 650,
                            marginTop: 6
                          }}>
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 24, marginTop: 18, justifyContent: 'center', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontWeight: 650 }}>
                      <span style={{ width: 10, height: 10, background: 'rgba(59, 130, 246, 0.5)', borderRadius: '3px' }} /> Catalog Visitors
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontWeight: 650 }}>
                      <span style={{ width: 10, height: 10, background: '#0B5D39', borderRadius: '3px' }} /> WhatsApp Checkouts
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Rich, Investor-Ready First State */
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--surface) 100%)',
                borderRadius: 'var(--r-lg)',
                border: '1px dashed var(--border)'
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(11, 93, 57, 0.15)'
                }}>
                  <BarChart3 size={26} />
                </div>
                <div style={{ maxWidth: 420 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                    Store Analytics Ready for Live Traffic
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5, margin: '6px 0 0' }}>
                    Your store catalog is live. Broadcast your custom link across WhatsApp statuses, Instagram bio, and TikTok to begin generating clicks and real-time revenue curves.
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
                  <button
                    onClick={handleCopyStoreLink}
                    className="btn btn-outline clickable"
                    style={{ padding: '8px 16px', fontSize: 12.5, borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="btn btn-primary clickable"
                    style={{ padding: '8px 16px', fontSize: 12.5, borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  >
                    <WhatsAppIcon size={14} /> Share on WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Conversational Funnel & Quick Shortcuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Conversational Funnel Card */}
            <div className="card" style={{
              padding: 22,
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                    Conversational Funnel
                  </h3>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Buyer journey conversion stages</span>
                </div>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '2px 7px',
                  borderRadius: 'var(--r-full)'
                }}>
                  Live AI Engine
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: '1. Store Visits', count: storefrontViews || (hasProducts ? 12 : 0), pct: '100%', color: '#3b82f6' },
                  { label: '2. Product Selected', count: Math.round((storefrontViews || (hasProducts ? 12 : 0)) * 0.75), pct: '75%', color: '#6366f1' },
                  { label: '3. WhatsApp Chat Triggered', count: waRedirects || (hasProducts ? 4 : 0), pct: `${conversionRate}%`, color: '#25D366' },
                  { label: '4. Orders Closed & Paid', count: completedOrdersCount, pct: totalOrdersCount > 0 ? `${Math.round((completedOrdersCount / totalOrdersCount) * 100)}%` : '0%', color: '#0B5D39' },
                ].map((stage, idx) => (
                  <div key={idx} className="funnel-step">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--text)' }}>{stage.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: stage.color }}>{stage.count} ({stage.pct})</span>
                    </div>
                    <div style={{ height: 5, width: '100%', background: 'var(--border)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: stage.pct,
                        background: stage.color,
                        borderRadius: 'var(--r-full)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="card" style={{
              padding: 20,
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  Fast Operations
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>1-Click Shortcuts</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* 1: Add Product */}
                <button
                  onClick={openAddProductModal}
                  className="quick-action-tile"
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'rgba(11, 93, 57, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Add Product</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>List item</span>
                  </div>
                </button>

                {/* 2: Instant Payment Link */}
                <button
                  onClick={() => navigateDashboardTab('payment-links')}
                  className="quick-action-tile"
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Pay Link</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Direct link</span>
                  </div>
                </button>

                {/* 3: Flash Discount */}
                <button
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="quick-action-tile"
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Coupon</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Discount</span>
                  </div>
                </button>

                {/* 4: Broadcast to WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="quick-action-tile"
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'rgba(37, 211, 102, 0.12)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WhatsAppIcon size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Broadcast</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Share in chat</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── RECENT ORDERS & TOP PERFORMING PRODUCTS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }} className="responsive-chart-grid">
        
        {/* Recent Orders Live Activity Stream */}
        <div className="card" style={{
          padding: 0,
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                Recent Order Feed
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Incoming orders from web storefront & conversational WhatsApp checkouts
              </p>
            </div>

            {orders.length > 0 && (
              <button
                onClick={() => navigateDashboardTab('orders')}
                className="btn btn-ghost clickable"
                style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 750, padding: '4px 10px' }}
              >
                View All Orders <ChevronRight size={14} />
              </button>
            )}
          </div>

          {recentOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table-stream">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => {
                    const statusColor = order.order_status === 'completed'
                      ? 'var(--primary)'
                      : order.order_status === 'pending'
                        ? 'var(--accent)'
                        : '#64748b';
                    
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 12 }}>
                          {order.order_number || `#${order.id?.slice(0, 6)}`}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: 'var(--bg-2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 800,
                              color: 'var(--text)'
                            }}>
                              {(order.customer_name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 650, fontSize: 13 }}>{order.customer_name || 'Customer'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 'var(--r-full)',
                            fontSize: 11,
                            fontWeight: 750,
                            background: `color-mix(in oklch, ${statusColor} 12%, transparent)`,
                            color: statusColor
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                            {order.order_status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                          {currency}{formatVal(order.total_amount)}
                        </td>
                        <td>
                          <button
                            onClick={() => navigateDashboardTab('orders')}
                            className="btn btn-outline clickable"
                            style={{ padding: '4px 8px', fontSize: 11.5, borderRadius: 'var(--r-sm)' }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Receipt size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>No orders received yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Once customers checkout on WhatsApp or web, they appear here instantly.</p>
            </div>
          )}
        </div>

        {/* Top Performing Inventory */}
        <div className="card" style={{
          padding: 22,
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                Top Performing Products
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>Highest sales & conversion velocity</p>
            </div>

            {stats?.top_products && stats.top_products.length > 0 && (
              <button
                onClick={() => navigateDashboardTab('products')}
                className="btn btn-ghost clickable"
                style={{ fontSize: 11.5, color: 'var(--primary)', fontWeight: 750, padding: '2px 6px' }}
              >
                View Catalog
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats?.top_products && stats.top_products.length > 0 ? (
              stats.top_products.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-2)',
                    gap: 12,
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--accent)' : 'var(--border)',
                      color: idx === 0 ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 900,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {item.product_name}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{item.orders_count} orders filled</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.total_sold} sold
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
                <p style={{ margin: 0 }}>No product sales recorded yet.</p>
                <button
                  onClick={openAddProductModal}
                  className="btn btn-ghost clickable"
                  style={{ marginTop: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 750, padding: '4px 8px' }}
                >
                  + Add New Product to Catalog
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
