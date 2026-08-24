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
import { TableSkeleton, StatusChip, EmptyState } from '../components';

const statusTone = (status: string) => {
  if (status === 'approved') return 'green';
  if (status === 'rejected') return 'red';
  return 'orange';
};

export default function AdminPayoutAccountChangesPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const loadRequests = async (p = 1) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/payout-account-change-requests?page=${p}`, { credentials: 'include', headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch payout account change requests.');
      setRequests(json.data?.data || []);
      setPage(json.data?.current_page || 1);
      setLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string, storeName: string) => {
    openConfirmationDialog(
      'Approve payout account change',
      `Approve the new payout account for "${storeName}"? Future payouts will go to the requested account immediately.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/payout-account-change-requests/${id}/approve`, {
            method: 'POST',
            credentials: 'include',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to approve request.');
          toast.success(json.message || 'Payout account updated.');
          loadRequests(page);
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Approve',
      'Cancel'
    );
  };

  const handleReject = (id: string, storeName: string) => {
    openConfirmationDialog(
      'Reject payout account change',
      `Reject this payout account change for "${storeName}"? The merchant's existing payout account stays unchanged.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/payout-account-change-requests/${id}/reject`, {
            method: 'POST',
            credentials: 'include',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject request.');
          toast.success(json.message || 'Request rejected.');
          loadRequests(page);
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
      loadRequests(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Payout account change requests</h2>
          <p>Every payout bank account change after a store's first verified setup lands here for review before it takes effect — protects merchants if their WhatsApp or dashboard session is ever compromised.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => loadRequests(1)}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={loading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store / Merchant</th>
              <th>Current Account</th>
              <th>Requested Account</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : requests.length ? (
              requests.map((r: any) => {
                const dateStr = new Date(r.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.store?.store_name || 'Unknown Store'}</strong>
                      <span>{r.store?.user?.email || r.store?.user?.phone_number || 'No contact'}</span>
                    </td>
                    <td>
                      <strong>{r.current_bank_name || '—'}</strong>
                      <span>{r.current_bank_account_number || '—'}</span>
                    </td>
                    <td>
                      <strong>{r.requested_bank_name}</strong>
                      <span>
                        {r.requested_bank_account_number} • {r.requested_bank_account_name}
                      </span>
                    </td>
                    <td>
                      <span>{dateStr}</span>
                    </td>
                    <td>
                      <StatusChip tone={statusTone(r.status)} label={r.status} />
                    </td>
                    <td className="admin-table__actions">
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="admin-action"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleApprove(r.id, r.store?.store_name || 'this store')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            className="admin-action danger"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleReject(r.id, r.store?.store_name || 'this store')}
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
                  <EmptyState label="No payout account change requests." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadRequests(page - 1)} disabled={page === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {page} of {lastPage}
          </span>
          <button type="button" onClick={() => loadRequests(page + 1)} disabled={page === lastPage}>
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
