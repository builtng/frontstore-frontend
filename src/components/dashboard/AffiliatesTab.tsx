'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Loader2, Edit2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import Modal from '@/components/Modal';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { StoreInfo, Product } from '@/types/dashboard';

interface Affiliate {
  id: string;
  name: string | null;
  email: string;
  tracking_code: string;
  status: 'invited' | 'active' | 'removed';
  sales_count?: number;
  total_earned?: number;
  total_pending?: number;
  products?: { product_id: string; commission_percent: number }[];
}

interface AffiliatesTabProps {
  store: StoreInfo | null;
  products: Product[];
}

// Matches the AFFILIATE_PROGRAM_LIVE convention already used in
// src/app/affiliate/page.tsx and accept-invite/page.tsx — the merchant
// affiliate program is frozen pending a product-strategy decision. The
// backend already rejects every affiliate write regardless of this flag
// (AffiliateController/AffiliateWalletController/AffiliateInvitationController
// all gate on hasFeature('affiliate_program')); this just keeps a merchant
// who reaches this tab directly (e.g. a stale bookmark) from seeing a
// silently-empty "No affiliates yet" screen instead of the real reason.
const AFFILIATE_PROGRAM_LIVE = false;

export default function AffiliatesTab({ store, products }: AffiliatesTabProps) {
  if (!AFFILIATE_PROGRAM_LIVE) {
    return (
      <div className="card animate-fade-in" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-2)',
          color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <UserPlus size={26} strokeWidth={1.25} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Affiliates — coming soon</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto' }}>
          Affiliate selling is currently unavailable. We&apos;re working on making this feature even better — check back soon.
        </p>
      </div>
    );
  }

  return <AffiliatesTabContent store={store} products={products} />;
}

function AffiliatesTabContent({ store, products }: AffiliatesTabProps) {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [affiliateEmail, setAffiliateEmail] = useState('');
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateProductRates, setAffiliateProductRates] = useState<Record<string, string>>({});
  const [affiliateSaving, setAffiliateSaving] = useState(false);

  const apiUrl = getApiUrl();

  const loadAffiliates = async () => {
    try {
      setAffiliatesLoading(true);
      const res = await fetch(`${apiUrl}/v1/affiliates`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setAffiliates(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load affiliates:', err);
    } finally {
      setAffiliatesLoading(false);
    }
  };

  useEffect(() => {
    loadAffiliates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAffiliateStatus = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/affiliates/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Affiliate status updated.');
        loadAffiliates();
      } else {
        toast.error(json.message || 'Failed to update affiliate status.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred.');
    }
  };

  const handleSaveAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    const productRates = Object.entries(affiliateProductRates)
      .filter(([, percent]) => percent && parseFloat(percent) > 0)
      .map(([product_id, percent]) => ({ product_id, commission_percent: parseFloat(percent) }));

    if (productRates.length === 0) {
      toast.warning('Set a commission rate for at least one product.');
      return;
    }

    try {
      setAffiliateSaving(true);

      if (editingAffiliate) {
        const res = await fetch(`${apiUrl}/v1/affiliates/${editingAffiliate.id}/products`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productRates }),
        });
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message || 'Commission rates updated.');
          setIsAffiliateModalOpen(false);
          loadAffiliates();
        } else {
          toast.error(json.message || 'Failed to update commission rates.');
        }
        return;
      }

      if (!affiliateEmail.trim()) {
        toast.warning('Please enter the affiliate\'s email address.');
        return;
      }

      const res = await fetch(`${apiUrl}/v1/affiliates`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: affiliateEmail.trim(),
          name: affiliateName.trim() || undefined,
          products: productRates,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Affiliate invited successfully.');
        setIsAffiliateModalOpen(false);
        setAffiliateEmail('');
        setAffiliateName('');
        setAffiliateProductRates({});
        loadAffiliates();
      } else {
        toast.error(json.message || 'Failed to invite affiliate.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred.');
    } finally {
      setAffiliateSaving(false);
    }
  };

  return (
    <>
      <div className="card animate-fade-in" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Affiliates</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Invite affiliates to promote your products for a commission — they get their own dashboard and payout wallet.</p>
          </div>
          <button
            onClick={() => {
              setEditingAffiliate(null);
              setAffiliateEmail('');
              setAffiliateName('');
              setAffiliateProductRates({});
              setIsAffiliateModalOpen(true);
            }}
            className="btn btn-primary clickable"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--r-md)',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <UserPlus size={16} /> Invite Affiliate
          </button>
        </div>

        {affiliatesLoading && affiliates.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Loader2 className="animate-spin" size={24} /></div>
        ) : affiliates.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="empty-state__icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
              <UserPlus size={28} strokeWidth={1.25} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>No affiliates yet</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.5 }}>
              Invite someone by email, set a commission % per product, and they'll get a tracking link and their own payout dashboard.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Affiliate</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Code</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Products</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sales</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Earned</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{affiliate.name || affiliate.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{affiliate.email}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span className="admin-chip admin-chip--gray" style={{ fontWeight: 800, fontSize: 13, background: 'var(--surface-2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {affiliate.tracking_code}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {affiliate.products?.length || 0} product{affiliate.products?.length === 1 ? '' : 's'}
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>{affiliate.sales_count ?? 0}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {getCurrencySymbol(store?.currency_code)}{formatVal(affiliate.total_earned ?? 0)}
                      {(affiliate.total_pending ?? 0) > 0 && (
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                          +{getCurrencySymbol(store?.currency_code)}{formatVal(affiliate.total_pending)} pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => affiliate.status !== 'invited' && handleToggleAffiliateStatus(affiliate.id)}
                        className="clickable"
                        disabled={affiliate.status === 'invited'}
                        style={{ border: 'none', background: 'transparent', display: 'inline-flex', alignItems: 'center', cursor: affiliate.status === 'invited' ? 'default' : 'pointer' }}
                      >
                        <span className={`admin-chip admin-chip--${affiliate.status === 'active' ? 'green' : 'gray'}`} style={{
                          display: 'inline-block',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999,
                          color: affiliate.status === 'active' ? '#10b981' : 'var(--text-muted)',
                          background: affiliate.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-2)'
                        }}>
                          {affiliate.status === 'invited' ? 'Invited' : affiliate.status === 'active' ? 'Active' : 'Removed'}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingAffiliate(affiliate);
                          const rates: Record<string, string> = {};
                          (affiliate.products || []).forEach((p) => { rates[p.product_id] = String(p.commission_percent); });
                          setAffiliateProductRates(rates);
                          setIsAffiliateModalOpen(true);
                        }}
                        className="btn btn-ghost clickable"
                        style={{ padding: 6, display: 'inline-flex', background: 'transparent', border: 'none', color: 'var(--text-2)' }}
                        title="Edit commission rates"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: INVITE / EDIT AFFILIATE ── */}
      <Modal
        open={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        title={editingAffiliate ? `Commission Rates — ${editingAffiliate.name || editingAffiliate.email}` : 'Invite Affiliate'}
        maxWidth={520}
        className="responsive-modal-container"
      >
        <form onSubmit={handleSaveAffiliate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!editingAffiliate && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Affiliate Email</label>
                <input
                  required
                  type="email"
                  placeholder="affiliate@example.com"
                  value={affiliateEmail}
                  onChange={(e) => setAffiliateEmail(e.target.value)}
                  style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Amaka Obi"
                  value={affiliateName}
                  onChange={(e) => setAffiliateName(e.target.value)}
                  style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Commission % per product
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Leave a product blank to exclude it — the affiliate only earns commission on products with a rate set.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
              {products.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: 8 }}>Add a product first before inviting affiliates.</p>
              ) : products.map((product) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{product.name}</span>
                  <div style={{ position: 'relative', width: 90 }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={affiliateProductRates[product.id] || ''}
                      onChange={(e) => setAffiliateProductRates({ ...affiliateProductRates, [product.id]: e.target.value })}
                      style={{ width: '100%', padding: '8px 24px 8px 8px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--card)' }}
                    />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAffiliateModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
            <button type="submit" disabled={affiliateSaving} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
              {affiliateSaving ? <Loader2 size={16} className="animate-spin" /> : (editingAffiliate ? 'Save Rates' : 'Send Invite')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
