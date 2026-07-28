'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Eye,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  X,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState, Metric, StatusTone } from '../components';
import EvidenceReviewDrawer from './EvidenceReviewDrawer';
import EditListingDrawer from './EditListingDrawer';
import SearchableSelect from '../../../components/SearchableSelect';

const CLAIM_STATUS_OPTIONS = [
  { value: '', label: 'All claim statuses' },
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'rejected', label: 'Rejected' },
];

const INVITE_STATUS_OPTIONS = [
  { value: '', label: 'All invite statuses' },
  { value: 'never_invited', label: 'Never Invited' },
  { value: 'queued', label: 'Queued' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'opted_out', label: 'Opted Out' },
];

interface ClaimListing {
  id: string;
  name: string;
  category_key: string | null;
  category_value: string | null;
  persona_id: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  postcode: string | null;
  opening_hours: string | null;
  source: string;
  claim_status: 'unclaimed' | 'pending_verification' | 'claimed' | 'rejected';
  invite_status: string;
  last_invited_at: string | null;
  imported_at: string | null;
  claim_url: string | null;
  claim_token_url: string | null;
  manual_claim_request: { name: string; email: string; phone: string; note?: string } | null;
}

interface ClaimStats {
  total_imported: number;
  unclaimed: number;
  pending_verification: number;
  claimed: number;
  rejected: number;
}

const claimStatusTone: Record<string, StatusTone> = {
  unclaimed: 'gray',
  pending_verification: 'orange',
  claimed: 'green',
  rejected: 'red',
};

const inviteStatusTone: Record<string, StatusTone> = {
  never_invited: 'gray',
  queued: 'blue',
  sending: 'blue',
  sent: 'blue',
  delivered: 'green',
  failed: 'red',
  bounced: 'red',
  opted_out: 'gray',
};

export default function MerchantClaimsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [listings, setListings] = useState<ClaimListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState('');
  const [inviteStatusFilter, setInviteStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<ClaimListing | null>(null);
  const [channels, setChannels] = useState<{ email: boolean; whatsapp: boolean; sms: boolean }>({
    email: true,
    whatsapp: false,
    sms: false,
  });
  const [sendingInvites, setSendingInvites] = useState(false);

  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/stats`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch claim stats.');
      setStats(json.data);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const loadListings = async (page = 1) => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (searchQuery) params.set('search', searchQuery);
      if (claimStatusFilter) params.set('claim_status', claimStatusFilter);
      if (inviteStatusFilter) params.set('invite_status', inviteStatusFilter);

      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims?${params.toString()}`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch merchant claim listings.');
      setListings(json.data?.data || []);
      setCurrentPage(json.data?.current_page || 1);
      setLastPage(json.data?.last_page || 1);
      setSelectedIds([]);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadListings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, claimStatusFilter, inviteStatusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === listings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings.filter((l) => l.claim_status === 'unclaimed').map((l) => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkInvite = async () => {
    const selectedChannels = Object.entries(channels)
      .filter(([, enabled]) => enabled)
      .map(([channel]) => channel);

    if (selectedChannels.length === 0) {
      toast.error('Pick at least one channel.');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Select at least one listing.');
      return;
    }

    try {
      setSendingInvites(true);
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/bulk-invite`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, channels: selectedChannels }),
      });
      const json = await handleFetchResponse(res, 'Failed to queue invitations.');
      toast.success(json.message);
      loadListings(currentPage);
      loadStats();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSendingInvites(false);
    }
  };

  const handleRegenerateLinks = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one listing.');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/regenerate-links`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await handleFetchResponse(res, 'Failed to regenerate claim links.');
      toast.success(json.message);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleRetryFailed = async () => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/retry-failed`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to queue retries.');
      toast.success(json.message);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const downloadInviteReport = () => {
    window.open(`${apiUrl}/v1/admin/frontstore-claims/invite-report`, '_blank');
  };

  const copyClaimLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Claim link copied.');
    } catch {
      toast.error('Could not copy link.');
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Merchant claim management</h2>
          <p>Businesses imported from public map data — invite, verify, and track claims.</p>
        </div>
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            loadListings(1);
          }}
        >
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name, phone, email, state, city, category"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {stats && (
        <div className="admin-metric-grid">
          <Metric icon={<Send size={16} />} label="Imported businesses" value={String(stats.total_imported)} tone="gray" />
          <Metric icon={<X size={16} />} label="Unclaimed" value={String(stats.unclaimed)} tone="gray" />
          <Metric icon={<RefreshCw size={16} />} label="Pending verification" value={String(stats.pending_verification)} tone="gray" />
          <Metric icon={<Check size={16} />} label="Claimed" value={String(stats.claimed)} tone="green" />
          <Metric icon={<X size={16} />} label="Rejected" value={String(stats.rejected)} tone="gray" />
        </div>
      )}

      <div className="admin-section-heading" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <SearchableSelect
              options={CLAIM_STATUS_OPTIONS}
              value={claimStatusFilter}
              onChange={setClaimStatusFilter}
              placeholder="All claim statuses"
              searchPlaceholder="Search status..."
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <SearchableSelect
              options={INVITE_STATUS_OPTIONS}
              value={inviteStatusFilter}
              onChange={setInviteStatusFilter}
              placeholder="All invite statuses"
              searchPlaceholder="Search status..."
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="admin-action" onClick={handleRetryFailed}>
            <RefreshCw size={15} /> Retry failed invites
          </button>
          <button type="button" className="admin-action" onClick={downloadInviteReport}>
            <Download size={15} /> Invite report
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="admin-metric" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', marginBottom: 16, flexWrap: 'wrap' }}>
          <strong>{selectedIds.length} selected</strong>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <input type="checkbox" checked={channels.email} onChange={(e) => setChannels((c) => ({ ...c, email: e.target.checked }))} />
            <Mail size={13} /> Email
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <input type="checkbox" checked={channels.whatsapp} onChange={(e) => setChannels((c) => ({ ...c, whatsapp: e.target.checked }))} />
            <MessageCircle size={13} /> WhatsApp
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <input type="checkbox" checked={channels.sms} onChange={(e) => setChannels((c) => ({ ...c, sms: e.target.checked }))} />
            <Smartphone size={13} /> SMS
          </label>
          <button type="button" className="admin-action" disabled={sendingInvites} onClick={handleBulkInvite}>
            <Send size={15} /> {sendingInvites ? 'Queuing…' : 'Queue invitations'}
          </button>
          <button type="button" className="admin-action" onClick={handleRegenerateLinks}>
            <RefreshCw size={15} /> Regenerate claim links
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={listings.length > 0 && selectedIds.length === listings.filter((l) => l.claim_status === 'unclaimed').length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Business</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Claim Status</th>
              <th>Invite</th>
              <th>Claim Link</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} columns={8} />
            ) : listings.length ? (
              listings.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    {listing.claim_status === 'unclaimed' && (
                      <input type="checkbox" checked={selectedIds.includes(listing.id)} onChange={() => toggleSelect(listing.id)} />
                    )}
                  </td>
                  <td>
                    <strong>{listing.name}</strong>
                    <span>{listing.category_value?.replace(/_/g, ' ') || listing.category_key}</span>
                  </td>
                  <td>{[listing.city, listing.state].filter(Boolean).join(', ') || '—'}</td>
                  <td>
                    {listing.phone && <div>{listing.phone}</div>}
                    {listing.email && <div>{listing.email}</div>}
                    {!listing.phone && !listing.email && '—'}
                  </td>
                  <td>
                    <StatusChip tone={claimStatusTone[listing.claim_status] || 'gray'} label={listing.claim_status.replace(/_/g, ' ')} />
                  </td>
                  <td>
                    <StatusChip tone={inviteStatusTone[listing.invite_status] || 'gray'} label={listing.invite_status.replace(/_/g, ' ')} />
                    {listing.last_invited_at && (
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>
                        {new Date(listing.last_invited_at).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td>
                    {listing.claim_url ? (
                      <button
                        type="button"
                        className="admin-action"
                        style={{ minHeight: 28, padding: '4px 10px', fontSize: 11.5 }}
                        onClick={() => copyClaimLink(listing.claim_token_url || listing.claim_url!)}
                      >
                        <LinkIcon size={12} /> {listing.claim_token_url ? 'Copy invite link' : 'Copy link'}
                      </button>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {listing.claim_status === 'pending_verification' && (
                        <button type="button" className="admin-action" onClick={() => setReviewingId(listing.id)}>
                          <Eye size={14} /> Review
                        </button>
                      )}
                      <button type="button" className="admin-action" onClick={() => setEditingListing(listing)}>
                        <Pencil size={14} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <EmptyState label="No listings match this filter." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadListings(currentPage - 1)} disabled={currentPage === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {currentPage} of {lastPage}
          </span>
          <button type="button" onClick={() => loadListings(currentPage + 1)} disabled={currentPage === lastPage}>
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}

      {reviewingId && (
        <EvidenceReviewDrawer
          listingId={reviewingId}
          onClose={() => setReviewingId(null)}
          onDecided={() => {
            loadListings(currentPage);
            loadStats();
          }}
        />
      )}

      {editingListing && (
        <EditListingDrawer
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSaved={() => loadListings(currentPage)}
        />
      )}
    </section>
  );
}
