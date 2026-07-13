'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DollarSign,
  Layers,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { TableSkeleton, StatusChip, EmptyState, Metric, withdrawalStatusTone } from '../components';

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const TIER_NAMES: Record<number, string> = {
  1: 'New Seller',
  2: 'Verified Seller',
  3: 'Trusted Seller',
  4: 'Elite Seller',
};

const tierTone = (level: number) => (level >= 3 ? 'green' : level === 2 ? 'blue' : 'gray');

type ModalStep = 'confirm' | 'otp';

export default function AdminWithdrawalBatchesPage() {
  const router = useRouter();
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [pending, setPending] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [batches, setBatches] = useState<any[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesPage, setBatchesPage] = useState(1);
  const [batchesLastPage, setBatchesLastPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('confirm');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchReference, setBatchReference] = useState('');
  const [batchTotalTransfers, setBatchTotalTransfers] = useState(0);
  const [otpSentTo, setOtpSentTo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);

  const loadPending = async () => {
    if (!token) return;
    try {
      setPendingLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawals?status=pending&limit=100`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch pending withdrawals.');
      setPending(json.data?.data || []);
      setSelectedIds(new Set());
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setPendingLoading(false);
    }
  };

  const loadBatches = async (page = 1) => {
    if (!token) return;
    try {
      setBatchesLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches?page=${page}&limit=20`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch batch history.');
      setBatches(json.data?.data || []);
      setBatchesPage(json.data?.current_page || 1);
      setBatchesLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadPending();
      loadBatches(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedWithdrawals = useMemo(
    () => pending.filter((w) => selectedIds.has(w.id)),
    [pending, selectedIds]
  );
  const selectedTotal = useMemo(
    () => selectedWithdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0),
    [selectedWithdrawals]
  );
  const allSelected = pending.length > 0 && selectedIds.size === pending.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(pending.map((w) => w.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetModal = () => {
    setModalOpen(false);
    setModalStep('confirm');
    setBatchId(null);
    setBatchReference('');
    setBatchTotalTransfers(0);
    setOtpSentTo('');
    setOtpCode('');
    setOtpError('');
  };

  const handleSendOtp = async () => {
    if (!selectedIds.size) return;
    try {
      setSendingOtp(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ withdrawal_ids: Array.from(selectedIds) }),
      });
      const json = await handleFetchResponse(res, 'Failed to start withdrawal batch.');
      const batch = json.data?.batch;
      setBatchId(batch?.id);
      setBatchReference(batch?.reference || '');
      setBatchTotalTransfers(batch?.total_transfers || selectedWithdrawals.length);
      setOtpSentTo(json.data?.otp_sent_to || '');
      setModalStep('otp');
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!batchId) return;
    try {
      setOtpResending(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches/${batchId}/resend-otp`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to resend OTP.');
      toast.success(json.message || 'A new verification code has been sent.');
      setOtpError('');
      setOtpCode('');
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setOtpResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!batchId || otpCode.trim().length !== 6) return;
    try {
      setOtpVerifying(true);
      setOtpError('');
      const res = await fetch(`${apiUrl}/v1/admin/withdrawal-batches/${batchId}/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ otp_code: otpCode }),
      });
      const json = await handleFetchResponse(res, 'That code is invalid or has expired.');
      const batch = json.data?.batch;
      const reference = batch?.reference || batchReference;
      const transfers = batch?.total_transfers || batchTotalTransfers;
      const targetId = batchId;
      toast.success(`Batch #${reference} is processing — ${transfers} transfers submitted.`);
      resetModal();
      loadPending();
      loadBatches(1);
      router.push(`/admin/withdrawal-batches/${targetId}`);
    } catch (error: any) {
      if (error.message === 'Session expired') {
        resetModal();
      } else {
        setOtpError(error.message);
      }
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Withdrawal batches</h2>
          <p>Select pending withdrawals and process them together in a single Paystack transfer run.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            loadPending();
            loadBatches(batchesPage);
          }}
          disabled={pendingLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={pendingLoading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="admin-metric-grid">
        <Metric icon={<Users size={18} />} label="Pending withdrawals" value={String(pending.length)} />
        <Metric icon={<DollarSign size={18} />} label="Total amount selected" value={formatMoney(selectedTotal)} tone="green" />
        <Metric icon={<Check size={18} />} label="Number selected" value={String(selectedIds.size)} />
      </div>

      <label className="admin-checkbox-row">
        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={!pending.length} />
        Select all pending withdrawals
      </label>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36 }} />
              <th>Merchant / Store</th>
              <th>Bank</th>
              <th>Amount</th>
              <th>Trust Level</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingLoading ? (
              <TableSkeleton rows={6} columns={7} />
            ) : pending.length ? (
              pending.map((w: any) => {
                const dateStr = new Date(w.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const level = w.store?.seller_level ?? 1;
                return (
                  <tr key={w.id}>
                    <td>
                      <input type="checkbox" checked={selectedIds.has(w.id)} onChange={() => toggleSelect(w.id)} />
                    </td>
                    <td>
                      <strong>{w.store?.store_name || 'Unknown store'}</strong>
                      <span>{w.store?.user?.email || w.store?.user?.phone_number || `@${w.store?.username || 'unknown'}`}</span>
                    </td>
                    <td>
                      <strong>{w.bank_name}</strong>
                      <span>
                        {w.account_number} • {w.account_name}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: 15 }}>{formatMoney(w.amount, w.store?.currency_code)}</strong>
                    </td>
                    <td>
                      <StatusChip tone={tierTone(level)} label={`Level ${level} · ${TIER_NAMES[level] || 'New Seller'}`} />
                    </td>
                    <td>
                      <span>{dateStr}</span>
                    </td>
                    <td>
                      <StatusChip tone={withdrawalStatusTone(w.status)} label={w.status} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <EmptyState label="No pending withdrawals to process." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selectedIds.size}
          onClick={() => setModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Send size={15} /> Process Batch{selectedIds.size ? ` (${selectedIds.size})` : ''}
        </button>
      </div>

      <div className="admin-section-heading" style={{ marginTop: 48 }}>
        <div>
          <h2>Batch history</h2>
          <p>Past batch payout runs, their transfer counts and outcomes.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Transfers</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Initiated By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {batchesLoading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : batches.length ? (
              batches.map((b: any) => {
                const dateStr = new Date(b.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <tr
                    key={b.id}
                    className="admin-table-row-hoverable"
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/withdrawal-batches/${b.id}`)}
                  >
                    <td>
                      <strong>#{b.reference}</strong>
                    </td>
                    <td>
                      <span>
                        {b.successful ?? 0}/{b.total_transfers} successful
                        {b.failed ? `, ${b.failed} failed` : ''}
                      </span>
                    </td>
                    <td>
                      <strong>{formatMoney(b.total_amount)}</strong>
                    </td>
                    <td>
                      <StatusChip tone={withdrawalStatusTone(b.status)} label={b.status} />
                    </td>
                    <td>
                      <span>{b.admin?.name || b.admin?.email || 'System'}</span>
                    </td>
                    <td>
                      <span>{dateStr}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState label="No batches have been processed yet." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {batchesLastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadBatches(batchesPage - 1)} disabled={batchesPage === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {batchesPage} of {batchesLastPage}
          </span>
          <button type="button" onClick={() => loadBatches(batchesPage + 1)} disabled={batchesPage === batchesLastPage}>
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              width: 'min(100%, 480px)',
              background: 'var(--surface)',
              color: 'var(--text)',
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
              padding: 28,
              border: '1px solid var(--border)',
            }}
          >
            {modalStep === 'confirm' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                    }}
                  >
                    <Layers size={18} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Confirm batch payout</h2>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)' }}>
                  You are about to process <strong>{selectedIds.size}</strong> withdrawal{selectedIds.size === 1 ? '' : 's'}{' '}
                  totaling <strong>{formatMoney(selectedTotal)}</strong>.
                </p>

                <div
                  style={{
                    background: 'var(--danger-light)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 12.5,
                    color: 'var(--danger)',
                    fontWeight: 600,
                    margin: '16px 0',
                  }}
                >
                  This will send money to merchants via Paystack. This cannot be undone once processed.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-outline" onClick={resetModal} disabled={sendingOtp}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSendOtp} disabled={sendingOtp}>
                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>Verify with OTP</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
                  Verification code sent to <strong>{otpSentTo}</strong>. Expires in 10 minutes.
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setOtpError('');
                  }}
                  className="input-field"
                  style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: 18, textAlign: 'center' }}
                />

                {otpError && (
                  <p style={{ color: 'var(--danger)', fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>{otpError}</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Didn&apos;t get a code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpResending}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    {otpResending ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                  <button type="button" className="btn btn-outline" onClick={resetModal} disabled={otpVerifying}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || otpCode.trim().length !== 6}
                  >
                    {otpVerifying ? 'Verifying...' : 'Verify & Process'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
