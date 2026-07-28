'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, ExternalLink, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { StatusChip, StatusTone } from '../components';

interface Evidence {
  id: string;
  type: string;
  subtype: string | null;
  file_url: string | null;
  value: string | null;
  status: 'pending' | 'verified' | 'rejected';
  weight: number;
  meta: Record<string, any> | null;
  created_at: string;
}

interface ClaimLog {
  id: string;
  event: string;
  actor_type: string | null;
  meta: Record<string, any> | null;
  created_at: string;
}

interface ListingDetail {
  id: string;
  name: string;
  slug: string;
  claim_status: string;
  verification_score: number;
  risk_level: string | null;
  claim_url: string | null;
  claim_token_url: string | null;
  manual_claim_request: { name: string; email: string; phone: string; note?: string } | null;
}

const evidenceStatusTone: Record<string, StatusTone> = {
  pending: 'gray',
  verified: 'green',
  rejected: 'red',
};

const riskTone: Record<string, StatusTone> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

export default function EvidenceReviewDrawer({ listingId, onClose, onDecided }: { listingId: string; onClose: () => void; onDecided: () => void }) {
  const { apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [logs, setLogs] = useState<ClaimLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/${listingId}/evidence`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not load evidence.');
      setListing(json.data.listing);
      setEvidence(json.data.evidence);
      setLogs(json.data.claim_logs);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Claim link copied.');
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const decideEvidence = async (evidenceId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/${listingId}/evidence/${evidenceId}/decide`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await handleFetchResponse(res, 'Failed to update evidence.');
      toast.success(json.message);
      load();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const requestMoreInfo = async () => {
    if (!note.trim()) { toast.error('Write a note for the claimant first.'); return; }
    try {
      setBusy(true);
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/${listingId}/request-more-info`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });
      const json = await handleFetchResponse(res, 'Failed to send request.');
      toast.success(json.message);
      setNote('');
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    try {
      setBusy(true);
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/${listingId}/approve-manual`, { method: 'POST', headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Failed to approve claim.');
      toast.success(json.message);
      onDecided();
      onClose();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    try {
      setBusy(true);
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/${listingId}/reject-manual`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: note.trim() || undefined }),
      });
      const json = await handleFetchResponse(res, 'Failed to reject claim.');
      toast.success(json.message);
      onDecided();
      onClose();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="admin-drawer__header">
          <div>
            <h2>{listing?.name || 'Claim review'}</h2>
            <p>Evidence, verification score, and admin decision.</p>
          </div>
          <button className="admin-drawer__close" onClick={onClose} type="button">&times;</button>
        </div>

        <div className="admin-drawer__content">
          {loading || !listing ? (
            <div className="admin-drawer__section"><Loader2 size={16} className="animate-spin" /></div>
          ) : (
            <>
              <div className="admin-drawer__section">
                <h3>Verification</h3>
                <div className="admin-drawer__grid">
                  <div>
                    <label>Score</label>
                    <strong>{listing.verification_score} / 100</strong>
                  </div>
                  <div>
                    <label>Risk level</label>
                    <StatusChip tone={riskTone[listing.risk_level || 'high'] || 'gray'} label={listing.risk_level || 'unassessed'} />
                  </div>
                  <div>
                    <label>Status</label>
                    <StatusChip tone={listing.claim_status === 'claimed' ? 'green' : listing.claim_status === 'rejected' ? 'red' : 'orange'} label={listing.claim_status.replace(/_/g, ' ')} />
                  </div>
                </div>
                {(listing.claim_url || listing.claim_token_url) && (
                  <button
                    type="button"
                    className="admin-action"
                    style={{ marginTop: 12 }}
                    onClick={() => copyLink(listing.claim_token_url || listing.claim_url!)}
                  >
                    <LinkIcon size={14} /> {listing.claim_token_url ? 'Copy invite link' : 'Copy claim link'}
                  </button>
                )}
              </div>

              {listing.manual_claim_request && (
                <div className="admin-drawer__section">
                  <h3>Claimant</h3>
                  <div className="admin-drawer__grid">
                    <div><label>Name</label><strong>{listing.manual_claim_request.name}</strong></div>
                    <div><label>Email</label><span>{listing.manual_claim_request.email}</span></div>
                    <div><label>Phone</label><span>{listing.manual_claim_request.phone}</span></div>
                  </div>
                  {listing.manual_claim_request.note && (
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 10 }}>&ldquo;{listing.manual_claim_request.note}&rdquo;</p>
                  )}
                </div>
              )}

              <div className="admin-drawer__section">
                <h3>Evidence ({evidence.length})</h3>
                {evidence.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>No evidence submitted yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {evidence.map((ev) => (
                      <div key={ev.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: 12.5, textTransform: 'capitalize' }}>{ev.type}{ev.subtype ? ` — ${ev.subtype.replace(/_/g, ' ')}` : ''}</strong>
                          {ev.value && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{ev.value}</div>}
                          {ev.meta?.distance_meters !== undefined && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>~{Math.round(ev.meta.distance_meters)}m from listing</div>
                          )}
                          {ev.file_url && (
                            <a href={ev.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              View file <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StatusChip tone={evidenceStatusTone[ev.status]} label={ev.status} />
                          {ev.status === 'pending' && (
                            <>
                              <button type="button" className="admin-action" onClick={() => decideEvidence(ev.id, 'verified')}><Check size={13} /></button>
                              <button type="button" className="admin-action danger" onClick={() => decideEvidence(ev.id, 'rejected')}><X size={13} /></button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-drawer__section">
                <h3>Decision</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note to the claimant (used for request-more-info and reject reason)"
                  rows={3}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5, marginBottom: 10, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="admin-action" disabled={busy} onClick={requestMoreInfo}>Request more info</button>
                  <button
                    type="button"
                    className="admin-action"
                    disabled={busy}
                    onClick={() => openConfirmationDialog('Approve claim', `Create a merchant account and store for "${listing.name}"?`, async () => approve())}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-action danger"
                    disabled={busy}
                    onClick={() => openConfirmationDialog('Reject claim', `Reject the claim for "${listing.name}"?`, async () => reject())}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="admin-drawer__section">
                <h3>Activity</h3>
                <div style={{ display: 'grid', gap: 6 }}>
                  {logs.map((log) => (
                    <div key={log.id} style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{log.event.replace(/_/g, ' ')}</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
