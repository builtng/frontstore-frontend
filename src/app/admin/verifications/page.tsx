'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';

export default function AdminVerificationsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [verificationsPage, setVerificationsPage] = useState(1);
  const [verificationsLastPage, setVerificationsLastPage] = useState(1);

  const loadVerifications = async (page = 1) => {
    if (!token) return;
    try {
      setVerificationsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/verifications?page=${page}`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch verifications list.');
      setVerifications(json.data?.data || []);
      setVerificationsPage(json.data?.current_page || 1);
      setVerificationsLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setVerificationsLoading(false);
    }
  };

  const handleApproveVerification = (id: string, storeName: string) => {
    openConfirmationDialog(
      'Approve verification',
      `Approve the verification request for "${storeName}"? This will activate the verified badge on their storefront.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/verifications/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to approve verification.');
          toast.success(json.message || 'Verification approved.');
          loadVerifications(verificationsPage);
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Approve',
      'Cancel'
    );
  };

  const handleRejectVerification = (id: string, storeName: string) => {
    openConfirmationDialog(
      'Reject verification',
      `Reject the verification request for "${storeName}"?`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/verifications/${id}/reject`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject verification.');
          toast.success(json.message || 'Verification rejected.');
          loadVerifications(verificationsPage);
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
      loadVerifications(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Store Trust Verifications</h2>
          <p>Review uploaded ID/business documents and manage storefront verified badges.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => loadVerifications(1)}
          disabled={verificationsLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={verificationsLoading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store / Merchant</th>
              <th>Document Type</th>
              <th>Uploaded Document File</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {verificationsLoading ? (
              <TableSkeleton rows={6} columns={5} />
            ) : verifications.length ? (
              verifications.map((v: any) => {
                const docLabel = v.verification_document_type
                  ? v.verification_document_type.replace('_', ' ').toUpperCase()
                  : 'ID';
                return (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.store_name}</strong>
                      <a
                        href={
                          v.custom_domain
                            ? `https://${v.custom_domain}`
                            : `${window.location.origin}/${v.username}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        @{v.username} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13 }}>{docLabel}</strong>
                    </td>
                    <td>
                      {v.verification_document_url ? (
                        <a
                          href={v.verification_document_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'var(--primary)',
                            fontWeight: 700,
                          }}
                        >
                          View File <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>No file uploaded</span>
                      )}
                    </td>
                    <td>
                      <StatusChip
                        tone={
                          v.verification_status === 'verified'
                            ? 'green'
                            : v.verification_status === 'rejected'
                            ? 'red'
                            : 'gray'
                        }
                        label={v.verification_status}
                      />
                    </td>
                    <td className="admin-table__actions">
                      {v.verification_status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="admin-action"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleApproveVerification(v.id, v.store_name)}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            className="admin-action danger"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRejectVerification(v.id, v.store_name)}
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
                <td colSpan={5}>
                  <EmptyState label="No verification requests found." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {verificationsLastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadVerifications(verificationsPage - 1)} disabled={verificationsPage === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {verificationsPage} of {verificationsLastPage}
          </span>
          <button
            type="button"
            onClick={() => loadVerifications(verificationsPage + 1)}
            disabled={verificationsPage === verificationsLastPage}
          >
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
