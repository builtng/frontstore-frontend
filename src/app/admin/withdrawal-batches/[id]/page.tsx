'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Download, RefreshCw, RotateCcw } from 'lucide-react';
import { useAdmin } from '../../AdminContext';
import { TableSkeleton, StatusChip, EmptyState, Metric, withdrawalStatusTone } from '../../components';

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AdminWithdrawalBatchReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [batch, setBatch] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadReport = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches/${id}`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch batch report.');
      setBatch(json.data?.batch || null);
      setLogs(json.data?.logs || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const handleRetryFailed = async () => {
    if (!id) return;
    try {
      setRetrying(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches/${id}/retry-failed`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to retry failed transfers.');
      toast.success(json.message || 'Failed transfers have been resubmitted.');
      loadReport();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setRetrying(false);
    }
  };

  const handleExportCsv = async () => {
    if (!token || !id) return;
    try {
      setExporting(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches/${id}/export?format=csv`, { headers: getHeaders() });
      if (res.status === 401) {
        toast.error('Session expired. Please log in again.');
        return;
      }
      if (!res.ok) throw new Error('Failed to export batch report.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `withdrawal-batch-${batch?.reference || id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
  };

  const canRetry = (batch?.failed || 0) > 0 && batch?.status !== 'processing';

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/withdrawal-batches')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}
          >
            <ArrowLeft size={15} /> Back to batches
          </button>
          <h2>Batch #{batch?.reference || (loading ? '...' : id)}</h2>
          <p>Transfer log and outcome for this batch payout run.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadReport}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={16} className={loading ? 'admin-spin' : ''} /> Refresh
          </button>
          <a
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.6 : 1 }}
            onClick={(e) => {
              e.preventDefault();
              if (!exporting) handleExportCsv();
            }}
            href={`${apiUrl}/v1/admin/withdrawal-batches/${id}/export?format=csv`}
          >
            <Download size={15} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </a>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRetryFailed}
            disabled={!canRetry || retrying}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={15} /> {retrying ? 'Retrying...' : 'Retry Failed'}
          </button>
        </div>
      </div>

      <div className="admin-metric-grid">
        <Metric label="Total transfers" value={String(batch?.total_transfers ?? 0)} icon={<span>#</span>} />
        <Metric label="Successful" value={String(batch?.successful ?? 0)} tone="green" icon={<span>✓</span>} />
        <Metric label="Pending / submitted" value={String((batch?.total_transfers ?? 0) - (batch?.successful ?? 0) - (batch?.failed ?? 0))} icon={<span>…</span>} />
        <Metric label="Failed" value={String(batch?.failed ?? 0)} icon={<span>!</span>} />
        <Metric label="Total amount" value={formatMoney(batch?.total_amount)} tone="green" icon={<span>₦</span>} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <StatusChip tone={withdrawalStatusTone(batch?.status || 'pending')} label={batch?.status || 'unknown'} />
        {batch?.admin?.name && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Initiated by {batch.admin.name}</span>}
        {batch?.otp_verified_at && (
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Verified {new Date(batch.otp_verified_at).toLocaleString()}
          </span>
        )}
        {batch?.completed_at && (
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Completed {new Date(batch.completed_at).toLocaleString()}
          </span>
        )}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Merchant / Store</th>
              <th>Bank</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transfer Code</th>
              <th>Failure Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : logs.length ? (
              logs.map((log: any) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.merchant_name}</strong>
                    <span>{log.store_name}</span>
                  </td>
                  <td>
                    <strong>{log.bank_name}</strong>
                    <span>{log.account_number}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: 15 }}>{formatMoney(log.amount)}</strong>
                  </td>
                  <td>
                    <StatusChip tone={withdrawalStatusTone(log.status)} label={log.status} />
                  </td>
                  <td>
                    <span>{log.paystack_transfer_code || '—'}</span>
                  </td>
                  <td>
                    <span>{log.failure_reason || '—'}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState label="No transfer logs found for this batch." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
