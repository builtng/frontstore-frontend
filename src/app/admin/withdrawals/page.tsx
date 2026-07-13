'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState, withdrawalStatusTone } from '../components';

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AdminWithdrawalsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [withdrawalsLastPage, setWithdrawalsLastPage] = useState(1);

  const loadWithdrawals = async (page = 1) => {
    if (!token) return;
    try {
      setWithdrawalsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawals?page=${page}`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch withdrawals list.');
      setWithdrawals(json.data?.data || []);
      setWithdrawalsPage(json.data?.current_page || 1);
      setWithdrawalsLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleApproveWithdrawal = (id: string, amountStr: string) => {
    openConfirmationDialog(
      'Approve withdrawal',
      `Approve this payout of ${amountStr}? This confirms you have sent the bank transfer.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/withdrawals/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to approve withdrawal.');
          toast.success(json.message || 'Withdrawal approved.');
          loadWithdrawals(withdrawalsPage);
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Approve',
      'Cancel'
    );
  };

  const handleRejectWithdrawal = (id: string, amountStr: string) => {
    openConfirmationDialog(
      'Reject withdrawal',
      `Reject this withdrawal payout of ${amountStr}? The funds will be refunded back to the merchant wallet balance.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/withdrawals/${id}/reject`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject withdrawal.');
          toast.success(json.message || 'Withdrawal rejected & refunded.');
          loadWithdrawals(withdrawalsPage);
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Reject',
      'Cancel'
    );
  };

  useEffect(() => {
    if (token) {
      loadWithdrawals(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Withdrawal requests</h2>
          <p>Review and approve pending withdrawal payout requests from store wallets.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => loadWithdrawals(1)}
          disabled={withdrawalsLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={withdrawalsLoading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store / Merchant</th>
              <th>Amount</th>
              <th>Destination Bank details</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {withdrawalsLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : withdrawals.length ? (
              withdrawals.map((w: any) => {
                const dateStr = new Date(w.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const amountStr = formatMoney(w.amount, w.store?.currency_code);
                return (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.store?.store_name || 'Unknown Store'}</strong>
                      <span>{w.store?.user?.email || w.store?.user?.phone_number || 'No contact'}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: 15 }}>{amountStr}</strong>
                    </td>
                    <td>
                      <strong>{w.bank_name}</strong>
                      <span>
                        {w.account_number} • {w.account_name}
                      </span>
                    </td>
                    <td>
                      <span>{dateStr}</span>
                    </td>
                    <td>
                      <StatusChip tone={withdrawalStatusTone(w.status)} label={w.status} />
                    </td>
                    <td className="admin-table__actions">
                      {w.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="admin-action"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleApproveWithdrawal(w.id, amountStr)}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            className="admin-action danger"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRejectWithdrawal(w.id, amountStr)}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState label="No withdrawal requests found." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {withdrawalsLastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadWithdrawals(withdrawalsPage - 1)} disabled={withdrawalsPage === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {withdrawalsPage} of {withdrawalsLastPage}
          </span>
          <button
            type="button"
            onClick={() => loadWithdrawals(withdrawalsPage + 1)}
            disabled={withdrawalsPage === withdrawalsLastPage}
          >
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
