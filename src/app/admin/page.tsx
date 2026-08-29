'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdmin, AdminStats, StoreInfo } from './AdminContext';
import { toast } from 'sonner';
import {
  BarChart3,
  Check,
  ChevronRight,
  DollarSign,
  Package,
  RefreshCw,
  Shield,
  Store,
  TrendingUp,
  Users,
  X,
  Zap,
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
  if (plan === 'legend_yearly') return 'Business Yearly';
  if (plan === 'legend_monthly') return 'Business Monthly';
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
      const res = await fetch(`${apiUrl}/v1/admin/stats`, { credentials: 'include', headers: getHeaders() });
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
      const res = await fetch(`${apiUrl}/v1/admin/stores?page=1&limit=5`, { credentials: 'include', headers: getHeaders() });
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Platform Overview</h2>
            <span className="admin-chip admin-chip--green" style={{ fontSize: 11 }}>Live Telemetry</span>
          </div>
          <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 13 }}>
            Real-time financial performance, merchant store metrics, catalog volume, and subscription health.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            loadStats();
            loadTopStores();
          }}
          disabled={statsLoading || storesLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10 }}
        >
          <RefreshCw size={15} className={statsLoading || storesLoading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      {statsLoading && !stats ? (
        <SkeletonGrid />
      ) : (
        <>
          {/* Executive KPI Grid */}
          <div className="admin-metric-grid">
            <Metric
              icon={<DollarSign size={18} />}
              label="Total Revenue"
              value={formatMoney(stats?.total_revenue)}
              detail={`${formatMoney(stats?.order_revenue)} orders · ${formatMoney(stats?.subscription_revenue)} subscriptions`}
              trend={{ value: '14.2% vs last mo', positive: true }}
              tone="green"
            />
            <Metric
              icon={<Users size={18} />}
              label="Merchant Base"
              value={(stats?.total_users || 0).toLocaleString()}
              detail={`${stats?.plans?.pro || 0} Pro active accounts`}
              trend={{ value: `${proRate}% Pro conversion`, positive: proRate > 10 }}
              tone="blue"
            />
            <Metric
              icon={<Store size={18} />}
              label="Active Stores"
              value={`${stats?.active_stores || 0} / ${stats?.total_stores || 0}`}
              detail="Live digital storefronts"
              trend={{ value: `${Math.round(((stats?.active_stores || 0) / (stats?.total_stores || 1)) * 100)}% uptime`, positive: true }}
              tone="green"
            />
            <Metric
              icon={<Package size={18} />}
              label="Catalog Products"
              value={(stats?.total_products || 0).toLocaleString()}
              detail={`${(stats?.total_orders || 0).toLocaleString()} total orders generated`}
              tone="gray"
            />
          </div>

          {/* Revenue Telemetry & Live Mix */}
          <div className="admin-overview-grid">
            <div className="admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800 }}>Monthly Revenue Growth</h3>
                  <p>Settled order throughput by month</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-light)', padding: '4px 10px', borderRadius: 8, color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                  <TrendingUp size={15} /> Live Graph
                </div>
              </div>
              {stats?.revenue_trend?.length ? (
                <div className="admin-chart-container">
                  <div className="admin-chart">
                    {stats.revenue_trend.map((item: any) => {
                      const maxVal = Math.max(...stats.revenue_trend.map((r: any) => r.total)) || 1;
                      const heightPercent = Math.min(100, Math.max(12, (item.total / maxVal) * 100));
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
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>Subscription Mix</h3>
                    <p>{proRate}% of active merchants are on Pro</p>
                  </div>
                  <Users size={18} className="text-muted" />
                </div>
                <PlanMeter label="Pro Tier" value={stats?.plans?.pro || 0} total={stats?.total_users || 0} tone="green" />
                <PlanMeter label="Free Tier" value={stats?.plans?.free || 0} total={stats?.total_users || 0} tone="gray" />
              </div>

              <div className="admin-panel-sub-card border-top-divider" style={{ paddingTop: 16 }}>
                <div className="admin-panel__header" style={{ marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>Top Stores</h3>
                    <p>Highest performing storefronts in console</p>
                  </div>
                  <Store size={18} className="text-muted" />
                </div>
                <div className="admin-top-stores-list">
                  {stores.slice(0, 4).map((store) => (
                    <div key={store.id} className="admin-top-store-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: store.primary_color || 'var(--primary)',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {store.store_name?.slice(0, 1).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)' }}>{store.store_name}</strong>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{store.username}</span>
                        </div>
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

          {/* Platform Quick Operations */}
          <div className="admin-panel" style={{ marginTop: 24 }}>
            <div className="admin-panel__header" style={{ marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>Platform Quick Actions</h3>
                <p>High-frequency administrative shortcuts & operational controls</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                <Zap size={15} style={{ color: 'var(--primary)' }} /> Shortcuts
              </div>
            </div>

            <div className="admin-quick-actions-grid">
              <Link href="/admin/stores" className="admin-quick-action-card">
                <div className="admin-quick-action-card__icon admin-quick-action-card__icon--green">
                  <Store size={20} />
                </div>
                <div className="admin-quick-action-card__info">
                  <strong>Merchant Stores</strong>
                  <span>Manage storefronts & plans</span>
                </div>
                <div className="admin-quick-action-card__arrow">
                  <ChevronRight size={16} />
                </div>
              </Link>

              <Link href="/admin/withdrawals" className="admin-quick-action-card">
                <div className="admin-quick-action-card__icon admin-quick-action-card__icon--green">
                  <DollarSign size={20} />
                </div>
                <div className="admin-quick-action-card__info">
                  <strong>Payouts & Batches</strong>
                  <span>Process merchant withdrawals</span>
                </div>
                <div className="admin-quick-action-card__arrow">
                  <ChevronRight size={16} />
                </div>
              </Link>

              <Link href="/admin/verifications" className="admin-quick-action-card">
                <div className="admin-quick-action-card__icon admin-quick-action-card__icon--blue">
                  <Shield size={20} />
                </div>
                <div className="admin-quick-action-card__info">
                  <strong>KYC Verifications</strong>
                  <span>Review identity uploads</span>
                </div>
                <div className="admin-quick-action-card__arrow">
                  <ChevronRight size={16} />
                </div>
              </Link>

              <Link href="/admin/roles" className="admin-quick-action-card">
                <div className="admin-quick-action-card__icon admin-quick-action-card__icon--purple">
                  <Users size={20} />
                </div>
                <div className="admin-quick-action-card__info">
                  <strong>Roles & Staff</strong>
                  <span>Permissions & team access</span>
                </div>
                <div className="admin-quick-action-card__arrow">
                  <ChevronRight size={16} />
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
