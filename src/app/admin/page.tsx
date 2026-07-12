'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin, AdminStats, StoreInfo } from './AdminContext';
import { toast } from 'sonner';
import {
  BarChart3,
  Check,
  DollarSign,
  Package,
  RefreshCw,
  Shield,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { Metric, PlanMeter, SkeletonGrid, EmptyState } from './components';

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const planLabel = (plan?: string | null) => {
  if (plan === 'pro_yearly') return 'Pro Yearly';
  if (plan === 'pro_monthly') return 'Pro Monthly';
  if (plan === 'legend_yearly') return 'Legend Yearly';
  if (plan === 'legend_monthly') return 'Legend Monthly';
  return 'Free';
};

const isProPlan = (plan?: string | null) => plan === 'pro_monthly' || plan === 'pro_yearly' || plan === 'legend_monthly' || plan === 'legend_yearly';

export default function AdminOverviewPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  const proRate = useMemo(() => {
    if (!stats?.total_users) return 0;
    return Math.round((stats.plans.pro / stats.total_users) * 1000) / 10;
  }, [stats]);

  const loadStats = async () => {
    if (!token) return;
    try {
      setStatsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/stats`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch dashboard analytics.');
      setStats(json.data);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTopStores = async () => {
    if (!token) return;
    try {
      setStoresLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/stores?page=1&limit=5`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch stores.');
      setStores(json.data?.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadStats();
      loadTopStores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Platform health</h2>
          <p>Revenue, merchant activity, storefronts, and subscription split.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            loadStats();
            loadTopStores();
          }}
          disabled={statsLoading || storesLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={statsLoading || storesLoading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      {statsLoading && !stats ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="admin-metric-grid">
            <Metric icon={<DollarSign size={18} />} label="Paid revenue" value={formatMoney(stats?.total_revenue)} tone="green" />
            <Metric icon={<Users size={18} />} label="Merchants" value={(stats?.total_users || 0).toLocaleString()} detail={`${stats?.plans?.pro || 0} Pro`} />
            <Metric icon={<Store size={18} />} label="Active stores" value={`${stats?.active_stores || 0}/${stats?.total_stores || 0}`} detail="Live storefronts" />
            <Metric icon={<Package size={18} />} label="Catalog" value={(stats?.total_products || 0).toLocaleString()} detail={`${stats?.total_orders || 0} orders`} />
          </div>

          <div className="admin-overview-grid">
            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3>Monthly revenue</h3>
                  <p>Paid order value by month</p>
                </div>
                <TrendingUp size={18} />
              </div>
              {stats?.revenue_trend?.length ? (
                <div className="admin-chart-container">
                  <div className="admin-chart">
                    {stats.revenue_trend.map((item: any) => {
                      const maxVal = Math.max(...stats.revenue_trend.map((r: any) => r.total)) || 1;
                      const heightPercent = Math.min(100, Math.max(10, (item.total / maxVal) * 100));
                      return (
                        <div key={item.month} className="admin-chart-bar-wrapper">
                          <div className="admin-chart-bar-tooltip">
                            <span className="tooltip-date">{item.month}</span>
                            <strong className="tooltip-value">{formatMoney(item.total)}</strong>
                          </div>
                          <div className="admin-chart-bar" style={{ height: `${heightPercent}%` }}>
                            <span className="admin-chart-bar-fill" />
                          </div>
                          <span className="admin-chart-bar-label">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState label="No paid revenue has been recorded yet." />
              )}
            </div>

            <div className="admin-panel admin-flex-column-panel">
              <div className="admin-panel-sub-card">
                <div className="admin-panel__header">
                  <div>
                    <h3>Subscription mix</h3>
                    <p>{proRate}% of merchants are on Pro</p>
                  </div>
                  <Users size={18} />
                </div>
                <PlanMeter label="Pro" value={stats?.plans?.pro || 0} total={stats?.total_users || 0} tone="green" />
                <PlanMeter label="Free" value={stats?.plans?.free || 0} total={stats?.total_users || 0} tone="gray" />
              </div>

              <div className="admin-panel-sub-card border-top-divider">
                <div className="admin-panel__header" style={{ marginBottom: 12 }}>
                  <div>
                    <h3>Top stores</h3>
                    <p>Most active stores listed in console</p>
                  </div>
                  <Store size={18} />
                </div>
                <div className="admin-top-stores-list">
                  {stores.slice(0, 3).map((store) => (
                    <div key={store.id} className="admin-top-store-row">
                      <div>
                        <strong style={{ display: 'block', fontSize: 13, color: 'var(--text-2)' }}>{store.store_name}</strong>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{store.username}</span>
                      </div>
                      <span className={`admin-chip admin-chip--${isProPlan(store.user?.plan) ? 'green' : 'gray'}`}>
                        {planLabel(store.user?.plan)}
                      </span>
                    </div>
                  ))}
                  {!stores.length && !storesLoading && <span className="admin-no-data-hint">No stores registered yet</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Account Types & Permissions Privileges Matrix */}
          <div className="admin-panel" style={{ marginTop: 24 }}>
            <div className="admin-panel__header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h3>Account Types & Permissions Matrix</h3>
                <p>Overview of feature access, limitations, and admin capabilities across different roles.</p>
              </div>
              <Shield size={18} />
            </div>

            <div className="admin-privileges-grid">
              {/* Role Card: Free Merchant */}
              <div className="privilege-card">
                <div className="privilege-card-header">
                  <span className="badge-gray">Free Merchant</span>
                  <h4>Essential WhatsApp Store</h4>
                </div>
                <ul className="privilege-list">
                  <li><Check size={14} className="text-green" /> Direct WhatsApp Order checkout</li>
                  <li><Check size={14} className="text-green" /> Standard Catalog Template</li>
                  <li><Check size={14} className="text-green" /> Local bank transfer instructions</li>
                  <li><Check size={14} className="text-green" /> Basic storefront hosting</li>
                  <li className="text-muted"><X size={14} className="text-red" /> No Custom domain support</li>
                  <li className="text-muted"><X size={14} className="text-red" /> Standard styling (No colors override)</li>
                  <li className="text-muted"><X size={14} className="text-red" /> Manual verification uploads</li>
                </ul>
              </div>

              {/* Role Card: Pro Merchant */}
              <div className="privilege-card featured">
                <div className="privilege-card-header">
                  <span className="badge-green">Pro Merchant</span>
                  <h4>Premium Growth Suite</h4>
                </div>
                <ul className="privilege-list">
                  <li><Check size={14} className="text-green" /> Branded Custom Domain integration</li>
                  <li><Check size={14} className="text-green" /> Advanced Layouts (Luxe, Editorial, Atelier)</li>
                  <li><Check size={14} className="text-green" /> Primary brand color & customization overrides</li>
                  <li><Check size={14} className="text-green" /> Interactive Appointment Booking & Slot Scheduler</li>
                  <li><Check size={14} className="text-green" /> Pinned product signature treatments</li>
                  <li><Check size={14} className="text-green" /> Customer Broadcast Campaigns (Reach)</li>
                  <li><Check size={14} className="text-green" /> Priority AI Sales Agent (Nina) automation</li>
                </ul>
              </div>

              {/* Role Card: Platform Admin */}
              <div className="privilege-card">
                <div className="privilege-card-header">
                  <span className="badge-primary">Platform Admin</span>
                  <h4>Full Control Console</h4>
                </div>
                <ul className="privilege-list">
                  <li><Check size={14} className="text-green" /> Suspend / activate any merchant store</li>
                  <li><Check size={14} className="text-green" /> Approve or reject verification requests</li>
                  <li><Check size={14} className="text-green" /> Change merchant plans (Free / Pro)</li>
                  <li><Check size={14} className="text-green" /> Escrow payment auditing & payouts release</li>
                  <li><Check size={14} className="text-green" /> System-wide promo coupon codes CRUD</li>
                  <li><Check size={14} className="text-green" /> Global settings (SMTP, Twilio, KYC provider)</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
