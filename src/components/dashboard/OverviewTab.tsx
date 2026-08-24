'use client';

import React, { useState } from 'react';
import {
  Package, DollarSign, Store, Camera, Rocket, CheckCircle2,
  ArrowRight, TrendingUp, Zap, ExternalLink, Copy, Check,
  ChevronDown, ChevronUp, BarChart3, Eye, ShoppingBag, Sparkles,
  ArrowUpRight, Share2, Plus, MessageCircle
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
    const text = encodeURIComponent(`Check out my store ${store?.store_name || ''} on Frontstore: ${liveStoreUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const hasTraffic = stats?.metrics.daily_breakdown?.some(d => d.views > 0 || d.wa > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      
      {/* ── HEADER BANNER ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 4
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(20px, 2.5vw, 24px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text)'
            }}>
              Overview
            </h2>
            {store?.username && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 'var(--r-full)',
                fontSize: 11.5,
                fontWeight: 700,
                background: 'rgba(18, 140, 126, 0.08)',
                color: 'var(--primary)',
                border: '1px solid rgba(18, 140, 126, 0.2)'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
                Live Storefront
              </span>
            )}
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Real-time analytics and performance metrics for <strong style={{ color: 'var(--text)' }}>{store?.store_name || store?.username || 'your store'}</strong>
          </p>
        </div>

        {/* Quick actions top pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={openAddProductModal}
            className="btn btn-primary clickable"
            style={{
              padding: '8px 14px',
              fontSize: 12.5,
              borderRadius: 'var(--r-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(18, 140, 126, 0.25)'
            }}
          >
            <Plus size={15} /> Add Product
          </button>
          <button
            onClick={handleCopyStoreLink}
            className="btn btn-outline clickable"
            style={{
              padding: '8px 14px',
              fontSize: 12.5,
              borderRadius: 'var(--r-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              background: 'var(--surface)'
            }}
            title="Copy store link"
          >
            {copiedLink ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* ── ONBOARDING SETUP PROGRESS (Modern, Slim & Collapsible) ── */}
      {!allDone && (
        <div className="card" style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header row */}
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(18,140,126,0.06) 0%, rgba(18,140,126,0.02) 100%)',
            borderBottom: isChecklistCollapsed ? 'none' : '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--r-md)',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(18,140,126,0.3)'
              }}>
                <Rocket size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                    Store Setup Checklist
                  </h3>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}>
                    {doneCount}/{steps.length} completed
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Finish setting up your store to maximize buyer trust and conversion rates.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Mini progress bar */}
              <div style={{ width: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>
                  <span>Progress</span>
                  <span style={{ color: 'var(--primary)' }}>{progressPct}%</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--bg-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #128C7E, #25D366)',
                    borderRadius: 'var(--r-full)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Collapse Toggle */}
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

          {/* Checklist steps */}
          {!isChecklistCollapsed && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 12,
              padding: 16,
              background: 'var(--bg)'
            }}>
              {steps.map(step => (
                <div
                  key={step.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--surface)',
                    border: step.done ? '1px solid rgba(18,140,126,0.2)' : '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                    transition: 'all 0.2s ease',
                    opacity: step.done ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--r-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: step.done ? 'var(--primary-light)' : 'var(--bg-2)',
                      color: step.done ? 'var(--primary)' : 'var(--text-muted)',
                      border: step.done ? '1px solid var(--primary)' : '1px solid var(--border)'
                    }}>
                      {step.done ? <CheckCircle2 size={15} /> : step.icon}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontSize: 13,
                        fontWeight: 750,
                        color: step.done ? 'var(--text-muted)' : 'var(--text)',
                        textDecoration: step.done ? 'line-through' : 'none'
                      }}>
                        {step.label}
                      </p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2, lineHeight: 1.35 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 2 }}>
                    {step.done ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} strokeWidth={3} /> Done
                      </span>
                    ) : (
                      <button
                        onClick={step.action}
                        className="btn btn-outline clickable"
                        style={{
                          padding: '5px 10px',
                          fontSize: 11.5,
                          borderRadius: 'var(--r-md)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 700,
                          color: 'var(--primary)',
                          borderColor: 'rgba(18,140,126,0.3)'
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

      {/* ── METRIC KPI CARDS (Fintech / World-Class Clean) ── */}
      <div className="responsive-stats-grid">
        {(isVisibleOnPlan('stat_revenue') && !hiddenDashboardItems.includes('stat_revenue')) && (
          <div className="card hover-lift" style={{
            padding: '18px 20px',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Revenue
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'rgba(18,140,126,0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={14} />
              </div>
            </div>
            <p style={{
              fontSize: 'clamp(22px, 2.2vw, 28px)',
              fontWeight: 900,
              color: 'var(--text)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {getCurrencySymbol(store?.currency_code)}{stats ? formatVal(stats.revenue) : '0'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
              Excludes cancelled orders
            </div>
          </div>
        )}

        {(isVisibleOnPlan('stat_orders') && !hiddenDashboardItems.includes('stat_orders')) && (
          <div className="card hover-lift" style={{
            padding: '18px 20px',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Orders
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'var(--bg-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={14} />
              </div>
            </div>
            <p style={{
              fontSize: 'clamp(22px, 2.2vw, 28px)',
              fontWeight: 900,
              color: 'var(--text)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {stats ? stats.counts.total : orders.length}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 11 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 750 }}>{stats?.counts.pending ?? 0} pending</span>
              <span style={{ color: 'var(--text-faint)' }}>·</span>
              <span style={{ color: 'var(--primary)', fontWeight: 750 }}>{stats?.counts.completed ?? 0} shipped</span>
            </div>
          </div>
        )}

        {(isVisibleOnPlan('stat_views') && !hiddenDashboardItems.includes('stat_views')) && (
          <div className="card hover-lift" style={{
            padding: '18px 20px',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Storefront Views
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'var(--bg-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={14} />
              </div>
            </div>
            <p style={{
              fontSize: 'clamp(22px, 2.2vw, 28px)',
              fontWeight: 900,
              color: 'var(--text)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {stats?.metrics.total_views ?? 0}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
              <span>Catalog & item clicks</span>
            </div>
          </div>
        )}

        {(isVisibleOnPlan('stat_whatsapp') && !hiddenDashboardItems.includes('stat_whatsapp')) && (
          <div className="card hover-lift" style={{
            padding: '18px 20px',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                WhatsApp Redirects
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WhatsAppIcon size={14} />
              </div>
            </div>
            <p style={{
              fontSize: 'clamp(22px, 2.2vw, 28px)',
              fontWeight: 900,
              color: 'var(--text)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {stats?.metrics.whatsapp_redirects ?? 0}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
              <span>Initiated checkouts</span>
            </div>
          </div>
        )}

        {(isVisibleOnPlan('stat_conversion') && !hiddenDashboardItems.includes('stat_conversion')) && (
          <div className="card hover-lift" style={{
            padding: '18px 20px',
            borderRadius: 'var(--r-xl)',
            border: '1px solid rgba(18, 140, 126, 0.25)',
            background: 'linear-gradient(135deg, var(--surface) 0%, rgba(18, 140, 126, 0.03) 100%)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Conversion Rate
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={14} />
              </div>
            </div>
            <p style={{
              fontSize: 'clamp(22px, 2.2vw, 28px)',
              fontWeight: 900,
              color: 'var(--primary)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {stats?.metrics.conversion_rate ?? '0'}%
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
              <span>Clicks vs page visitors</span>
            </div>
          </div>
        )}
      </div>

      {/* ── CHARTS & INSIGHTS GRID ── */}
      {(isVisibleOnPlan('section_charts') && !hiddenDashboardItems.includes('section_charts')) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }} className="responsive-chart-grid">
          
          {/* Main Traffic & Redirects Chart Card */}
          <div className="card" style={{
            padding: 24,
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                  Weekly Traffic & Conversions
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Store views mapped against WhatsApp checkout triggers
                </p>
              </div>
              <span style={{
                fontSize: 11.5,
                color: 'var(--text-muted)',
                fontWeight: 700,
                background: 'var(--bg-2)',
                padding: '4px 10px',
                borderRadius: 'var(--r-full)'
              }}>
                Last 7 Days
              </span>
            </div>

            {hasTraffic ? (
              <div className="chart-scroll-container">
                <div className="chart-scroll-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, padding: '0 10px', borderBottom: '1px solid var(--border)' }}>
                    {stats!.metrics.daily_breakdown!.map((item, idx) => {
                      const maxVal = Math.max(1, ...stats!.metrics.daily_breakdown!.flatMap(d => [d.views, d.wa]));
                      const viewsHeight = `${Math.max(6, (item.views / maxVal) * 100)}%`;
                      const waHeight = `${Math.max(6, (item.wa / maxVal) * 100)}%`;

                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ display: 'flex', gap: 5, width: '60%', height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                            {/* Views bar */}
                            <div
                              style={{
                                height: viewsHeight,
                                width: 10,
                                background: 'rgba(18, 140, 126, 0.25)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease'
                              }}
                              title={`Views: ${item.views}`}
                            />
                            {/* WhatsApp clicks bar */}
                            <div
                              style={{
                                height: waHeight,
                                width: 10,
                                background: '#128C7E',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease'
                              }}
                              title={`WhatsApp Clicks: ${item.wa}`}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginTop: 6 }}>{item.day}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 24, marginTop: 16, justifyContent: 'center', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontWeight: 600 }}>
                      <span style={{ width: 10, height: 10, background: 'rgba(18, 140, 126, 0.25)', borderRadius: '3px' }} /> Catalog Views
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontWeight: 600 }}>
                      <span style={{ width: 10, height: 10, background: '#128C7E', borderRadius: '3px' }} /> WhatsApp Checkouts
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Rich, Beautiful Empty State with Immediate Action CTAs */
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
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 size={24} />
                </div>
                <div style={{ maxWidth: 380 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                    No Traffic Recorded Yet
                  </h4>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                    Your store is ready for visitors! Share your storefront link on WhatsApp statuses, chats, and Instagram to start seeing clicks.
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
                  <button
                    onClick={handleCopyStoreLink}
                    className="btn btn-outline clickable"
                    style={{ padding: '8px 14px', fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="btn btn-primary clickable"
                    style={{ padding: '8px 14px', fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  >
                    <WhatsAppIcon size={14} /> Share to WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Insights + Top Products */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Quick Action Hub */}
            <div className="card" style={{
              padding: 20,
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, color: 'var(--text)' }}>
                  Quick Actions
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Shortcuts
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Action 1: Add Product */}
                <button
                  onClick={openAddProductModal}
                  className="clickable hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    textAlign: 'left',
                    color: 'var(--text)',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(18, 140, 126, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Plus size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Add Product</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>List new item</span>
                  </div>
                </button>

                {/* Action 2: Payment Link */}
                <button
                  onClick={() => navigateDashboardTab('payment-links')}
                  className="clickable hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    textAlign: 'left',
                    color: 'var(--text)',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Payment Link</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Instant checkout</span>
                  </div>
                </button>

                {/* Action 3: Flash Discount */}
                <button
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="clickable hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    textAlign: 'left',
                    color: 'var(--text)',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Flash Discount</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Create coupon</span>
                  </div>
                </button>

                {/* Action 4: Share Store on WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="clickable hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    textAlign: 'left',
                    color: 'var(--text)',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(37, 211, 102, 0.1)',
                    color: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <WhatsAppIcon size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>Broadcast</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Share on WhatsApp</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Top Products Card */}
            <div className="card" style={{
              padding: 20,
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, color: 'var(--text)' }}>
                  Top Performing Products
                </h3>
                {stats?.top_products && stats.top_products.length > 0 && (
                  <button
                    onClick={() => navigateDashboardTab('products')}
                    className="btn btn-ghost clickable"
                    style={{ padding: '2px 6px', fontSize: 11.5, color: 'var(--primary)', fontWeight: 700 }}
                  >
                    View All
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
                        padding: '8px 10px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--bg-2)',
                        gap: 10
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
                          <p style={{ fontSize: 13, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product_name}
                          </p>
                          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{item.orders_count} orders filled</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: '3px 8px',
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
                  <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
                    <p>No product sales recorded yet.</p>
                    <button
                      onClick={openAddProductModal}
                      className="btn btn-ghost clickable"
                      style={{ marginTop: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 700, padding: '4px 8px' }}
                    >
                      + Add New Product
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
