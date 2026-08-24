'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { StoreInfo } from '@/types/dashboard';

interface RefundRequest {
  id: string;
  order?: { order_number: string };
  reason: string;
  customer_notes?: string | null;
  amount: number | string;
  status: string;
  evidence_url?: string | null;
}

interface RefundStats {
  total_requests?: number;
  approved_refunds?: number;
  refund_rate?: number | string;
  common_reasons?: Array<{ reason: string }>;
}

interface RefundsTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

export default function RefundsTab({ store, isPro, navigateDashboardTab }: RefundsTabProps) {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundStats, setRefundStats] = useState<RefundStats | null>(null);
  const [isRefundDetailsOpen, setIsRefundDetailsOpen] = useState(false);
  const [selectedRefundRequest, setSelectedRefundRequest] = useState<RefundRequest | null>(null);
  const [refundMerchantNotes, setRefundMerchantNotes] = useState('');

  const fetchRefundsData = async () => {
    if (!isPro) return;
    try {
      setRefundLoading(true);
      const [list, stats] = await Promise.all([
        api.get<{ data: RefundRequest[] }>('/v1/refunds'),
        api.get<RefundStats>('/v1/refunds/stats'),
      ]);
      setRefundRequests(list?.data || []);
      setRefundStats(stats);
    } catch (e) {
      toast.error('Failed to load refunds data.');
    } finally {
      setRefundLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleReject = async () => {
    if (!selectedRefundRequest) return;
    if (!refundMerchantNotes.trim()) {
      toast.warning('Please enter rejection notes.');
      return;
    }
    try {
      await api.post(`/v1/refunds/${selectedRefundRequest.id}/reject`, { merchant_notes: refundMerchantNotes });
      toast.success('Refund request rejected.');
      setIsRefundDetailsOpen(false);
      fetchRefundsData();
    } catch {
      toast.error('Error rejecting refund.');
    }
  };

  const handleApprove = async () => {
    if (!selectedRefundRequest) return;
    if (!confirm('Are you sure you want to approve this refund and reverse the funds?')) return;
    try {
      await api.post(`/v1/refunds/${selectedRefundRequest.id}/approve`, { merchant_notes: refundMerchantNotes });
      toast.success('Refund request approved. Funds reversed.');
      setIsRefundDetailsOpen(false);
      fetchRefundsData();
    } catch {
      toast.error('Error approving refund.');
    }
  };

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
            <RefreshCw size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Refunds & Returns Management</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Allow customers to submit refund claims directly from their digital order status tracking page, review details, check evidence uploads, and approve payouts reversely.
            </p>
          </div>
          <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
            🚀 Upgrade to Pro Plan
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Refund Center</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage customer disputes, return submissions, and reversal claims.</p>
            </div>
          </div>

          {/* Stats */}
          {refundStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card">
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Active Disputes</span>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{refundStats.total_requests || 0}</div>
              </div>
              <div className="card">
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Approved Refunds</span>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: '#10b981' }}>{refundStats.approved_refunds || 0}</div>
              </div>
              <div className="card">
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Refund Rate</span>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: 'var(--danger)' }}>{refundStats.refund_rate}%</div>
              </div>
              <div className="card">
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Primary Reason</span>
                <div style={{ fontSize: 17, fontWeight: 800, marginTop: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {refundStats.common_reasons?.[0]?.reason || 'None logged'}
                </div>
              </div>
            </div>
          )}

          {/* Ledger */}
          {refundLoading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Order ID</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Reason</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Notes</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map((ref: any) => (
                    <tr key={ref.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>#{ref.order?.order_number}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13 }}>{ref.reason}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ref.customer_notes || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800 }}>
                        {store?.currency_code} {parseFloat(ref.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge" style={{
                          background: ref.status === 'requested' ? 'rgba(245,158,11,0.1)' : ref.status === 'approved' || ref.status === 'refunded' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: ref.status === 'requested' ? '#d97706' : ref.status === 'approved' || ref.status === 'refunded' ? '#10b981' : 'var(--danger)'
                        }}>
                          {ref.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => {
                            setSelectedRefundRequest(ref);
                            setRefundMerchantNotes('');
                            setIsRefundDetailsOpen(true);
                          }}
                          className="btn btn-outline clickable"
                          style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {refundRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                        No refund requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── MODAL: REVIEW REFUND REQUEST ── */}
      {isRefundDetailsOpen && selectedRefundRequest && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsRefundDetailsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Review Refund Request</h3>
              <button onClick={() => setIsRefundDetailsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18, fontSize: 13.5 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Order Number</span>
                <strong>#{selectedRefundRequest.order?.order_number}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Requested Reversal Amount</span>
                <strong style={{ color: 'var(--danger)' }}>{store?.currency_code} {parseFloat(selectedRefundRequest.amount as string).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Reason</span>
                <strong>{selectedRefundRequest.reason}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Customer Notes</span>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>{selectedRefundRequest.customer_notes || 'No customer notes provided.'}</p>
              </div>
              {selectedRefundRequest.evidence_url && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: 6 }}>Customer Proof / Evidence</span>
                  <a href={selectedRefundRequest.evidence_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={selectedRefundRequest.evidence_url} alt="Dispute evidence" style={{ maxHeight: 120, objectFit: 'contain' }} />
                  </a>
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Internal Merchant Notes</label>
                <textarea
                  value={refundMerchantNotes}
                  onChange={(e: any) => setRefundMerchantNotes(e.target.value)}
                  placeholder="Notes explaining approval or rejection reason..."
                  className="input"
                  style={{ width: '100%', height: 60, resize: 'none', fontSize: 13 }}
                />
              </div>
            </div>

            {selectedRefundRequest.status === 'requested' ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleReject}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
                  Reject Claim
                </button>
                <button
                  onClick={handleApprove}
                  className="btn btn-primary clickable"
                  style={{ flex: 1, background: '#10b981' }}
                >
                  Approve & Refund
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsRefundDetailsOpen(false)} className="btn btn-outline clickable" style={{ width: '100%' }}>Close View</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
