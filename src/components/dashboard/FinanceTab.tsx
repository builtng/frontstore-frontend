'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { StoreInfo } from '@/types/dashboard';

interface FinanceSummary {
  net_profit: number | string;
  profit_margin: number | string;
  revenue: number | string;
  today_revenue: number | string;
  monthly_growth: number | string;
}

interface FinanceTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

export default function FinanceTab({ store, isPro, navigateDashboardTab }: FinanceTabProps) {
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeRange, setFinanceRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  const fetchFinanceData = async () => {
    if (!isPro) return;
    try {
      setFinanceLoading(true);
      const summary = await api.get<FinanceSummary>(`/v1/finance/summary?range=${financeRange}`);
      setFinanceSummary(summary);
    } catch (e) {
      toast.error('Failed to load financial records.');
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, financeRange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {!isPro ? (
        <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Profit Analytics</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              View real-time net profits, margins, and monthly sales growth metrics based on your item cost prices.
            </p>
          </div>
          <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
            🚀 Upgrade to Pro Plan
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Profit Analytics</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Revenue, cost tracking, and profit margins.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                value={financeRange}
                onChange={(e: any) => setFinanceRange(e.target.value)}
                className="input"
                style={{ padding: '6px 12px', fontSize: 13.5, width: 140 }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {financeLoading || !financeSummary ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Net Profit</span>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: Number(financeSummary.net_profit) >= 0 ? '#10b981' : 'var(--danger)' }}>
                  {store?.currency_code} {parseFloat(financeSummary.net_profit as string || '0').toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Margin: <strong style={{ color: '#10b981' }}>{financeSummary.profit_margin}%</strong>
                </div>
              </div>
              <div className="card">
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Revenue (Paid Orders)</span>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>
                  {store?.currency_code} {parseFloat(financeSummary.revenue as string || '0').toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Today: <strong>{store?.currency_code} {parseFloat(financeSummary.today_revenue as string || '0').toLocaleString()}</strong>
                </div>
              </div>
              <div className="card">
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Monthly Revenue Growth</span>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: Number(financeSummary.monthly_growth) >= 0 ? '#10b981' : 'var(--danger)' }}>
                  {Number(financeSummary.monthly_growth) >= 0 ? '+' : ''}{financeSummary.monthly_growth}%
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>VS previous calendar month</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
