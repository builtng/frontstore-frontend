'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import { RefreshCw, Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Metric, SkeletonGrid } from '../components';

interface SlaReport {
  window_days: number;
  settled_orders: number;
  payouts_completed: number;
  avg_payout_hours: number | null;
  median_payout_hours: number | null;
  pct_paid_within_24h: number | null;
  pct_paid_same_day: number | null;
  first_order_avg_payout_hours: number | null;
  risk_distribution: { low: number; medium: number; high: number };
  payout_review_rate_pct: number | null;
  withdrawal_failure_rate_pct: number | null;
  withdrawals_in_window: number;
}

const WINDOW_OPTIONS = [7, 30, 90] as const;

export default function AdminPayoutSlaPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [report, setReport] = useState<SlaReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [windowDays, setWindowDays] = useState<number>(30);

  const loadReport = async (days: number) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/payouts/sla-report?days=${days}`, {
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Could not fetch the payout SLA report.');
      setReport(json.data || null);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadReport(windowDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, windowDays]);

  const fmtHours = (value: number | null) => (value === null ? '—' : `${value}h`);
  const fmtPct = (value: number | null) => (value === null ? '—' : `${value}%`);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Payout SLA Performance</h2>
          <p>Whether the "payouts within 24 hours" promise is actually being kept, measured from risk-engine settlement data.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {WINDOW_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={windowDays === d ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '6px 12px', fontSize: 12.5 }}
                onClick={() => setWindowDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => loadReport(windowDays)}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={16} className={loading ? 'admin-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {loading && !report ? (
        <SkeletonGrid />
      ) : report ? (
        <>
          <div className="admin-metric-grid">
            <Metric
              icon={<Clock size={18} />}
              label="Median payout time"
              value={fmtHours(report.median_payout_hours)}
              detail={`Average ${fmtHours(report.avg_payout_hours)}`}
              tone={report.median_payout_hours !== null && report.median_payout_hours <= 24 ? 'green' : 'gray'}
            />
            <Metric
              icon={<CheckCircle2 size={18} />}
              label="Paid within 24h"
              value={fmtPct(report.pct_paid_within_24h)}
              detail={`Same-day: ${fmtPct(report.pct_paid_same_day)}`}
              tone={report.pct_paid_within_24h !== null && report.pct_paid_within_24h >= 80 ? 'green' : 'gray'}
            />
            <Metric
              icon={<TrendingUp size={18} />}
              label="First-order payout time"
              value={fmtHours(report.first_order_avg_payout_hours)}
              detail="Average across each store's first settled order"
              tone="gray"
            />
            <Metric
              icon={<AlertTriangle size={18} />}
              label="Under review rate"
              value={fmtPct(report.payout_review_rate_pct)}
              detail={`${report.settled_orders} orders in window`}
              tone={report.payout_review_rate_pct !== null && report.payout_review_rate_pct > 10 ? 'gray' : 'green'}
            />
          </div>

          <div className="admin-panel" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Risk distribution ({report.settled_orders} settled orders)</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <strong style={{ fontSize: 20 }}>{report.risk_distribution.low}</strong>
                <p style={{ fontSize: 12.5, color: 'var(--admin-text-muted, #6b7280)' }}>Low risk</p>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>{report.risk_distribution.medium}</strong>
                <p style={{ fontSize: 12.5, color: 'var(--admin-text-muted, #6b7280)' }}>Medium risk</p>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>{report.risk_distribution.high}</strong>
                <p style={{ fontSize: 12.5, color: 'var(--admin-text-muted, #6b7280)' }}>High risk</p>
              </div>
            </div>
          </div>

          <div className="admin-panel" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Withdrawal reliability ({report.withdrawals_in_window} requests in window)</h3>
            <p style={{ fontSize: 13.5 }}>
              Failure rate (failed/rejected/reversed): <strong>{fmtPct(report.withdrawal_failure_rate_pct)}</strong>
            </p>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13.5, color: 'var(--admin-text-muted, #6b7280)' }}>No data available for this window yet.</p>
      )}
    </section>
  );
}
