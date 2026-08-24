'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LineChart, Loader2, FileText } from 'lucide-react';
import { api, getApiUrl } from '@/lib/api';
import type { StoreInfo } from '@/types/dashboard';

interface ProAnalytics {
  metrics?: {
    total_revenue?: number | string;
    net_revenue?: number | string;
    average_order_value?: number | string;
    repeat_purchase_rate?: number | string;
  };
  top_products?: Array<{ id: string; name: string; quantity_sold: number; revenue_generated: number | string }>;
  customer_insights?: Array<{ id?: string; customer_name: string; purchase_count: number; total_spent: number | string }>;
}

interface AnalyticsTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

export default function AnalyticsTab({ store, isPro, navigateDashboardTab }: AnalyticsTabProps) {
  const [proAnalytics, setProAnalytics] = useState<ProAnalytics | null>(null);
  const [proAnalyticsLoading, setProAnalyticsLoading] = useState(false);

  const fetchProAnalyticsData = async () => {
    if (!isPro) return;
    try {
      setProAnalyticsLoading(true);
      const data = await api.get<ProAnalytics>('/v1/analytics/pro');
      setProAnalytics(data);
    } catch (e) {
      toast.error('Failed to load advanced analytics.');
    } finally {
      setProAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchProAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const downloadAnalyticsReport = async (type: 'weekly' | 'monthly') => {
    try {
      toast.loading('Generating report...');
      const res = await fetch(`${getApiUrl()}/v1/analytics/reports/${type}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.dismiss();
      toast.success('Report downloaded successfully!');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to download statement report.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)', flexShrink: 0
        }}>
          <LineChart size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
            Advanced Pro Analytics
          </h2>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
            Real-time revenue metrics, repeat purchase rates, and top customer insights.
          </p>
        </div>
      </div>

      {!isPro ? (
        <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <LineChart size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
              Advanced Merchant Analytics
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Analyze gross/net earnings, track customer lifetime value (LTV), monitor repeat purchase rates, and isolate top performing products.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
            <button
              onClick={() => navigateDashboardTab('billing')}
              className="btn btn-primary clickable"
              style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
            >
              🚀 Upgrade to Pro
            </button>
          </div>
        </div>
      ) : proAnalyticsLoading || !proAnalytics ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : (
        <>
          {/* Download reports buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => downloadAnalyticsReport('weekly')}
              className="btn btn-secondary clickable"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
            >
              <FileText size={15} /> Export Weekly Sales Report (PDF)
            </button>
            <button
              onClick={() => downloadAnalyticsReport('monthly')}
              className="btn btn-secondary clickable"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
            >
              <FileText size={15} /> Export Monthly Account Statement (PDF)
            </button>
          </div>

          {/* Metric cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>GROSS REVENUE</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                {store?.currency_code} {parseFloat((proAnalytics.metrics?.total_revenue as any) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>NET REVENUE</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                {store?.currency_code} {parseFloat((proAnalytics.metrics?.net_revenue as any) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>AVG ORDER VALUE</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                {store?.currency_code} {parseFloat((proAnalytics.metrics?.average_order_value as any) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>REPEAT PURCHASE RATE</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                {parseFloat((proAnalytics.metrics?.repeat_purchase_rate as any) || 0).toFixed(1)}%
              </h3>
            </div>
          </div>

          {/* Tables layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Top Products */}
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Top Products</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Qty Sold</th>
                    <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {proAnalytics.top_products?.map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 750 }}>{p.name}</td>
                      <td style={{ padding: '12px 18px', fontSize: 13 }}>{p.quantity_sold}</td>
                      <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 800 }}>
                        {store?.currency_code} {parseFloat(p.revenue_generated || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Customers */}
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Top Customers</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Customer</th>
                    <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Orders</th>
                    <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {proAnalytics.customer_insights?.map((c: any) => (
                    <tr key={c.id || c.customer_name} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 750 }}>{c.customer_name}</td>
                      <td style={{ padding: '12px 18px', fontSize: 13 }}>{c.purchase_count}</td>
                      <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 800 }}>
                        {store?.currency_code} {parseFloat(c.total_spent || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
