'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Power,
  Trash2,
  X,
} from 'lucide-react';
import { SkeletonGrid, EmptyState } from '../components';

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AdminCouponsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(0);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState('');
  const [newCouponExpiresAt, setNewCouponExpiresAt] = useState('');
  const [couponSaving, setCouponSaving] = useState(false);

  const loadCoupons = async () => {
    if (!token) return;
    try {
      setCouponsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/coupons`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch coupons.');
      setCoupons(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleToggleCouponStatus = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/coupons/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to update coupon status.');
      toast.success(json.message);
      loadCoupons();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    openConfirmationDialog(
      'Delete coupon',
      `Are you sure you want to delete coupon code "${code}"? This action is permanent.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
          });
          await handleFetchResponse(res, 'Could not delete coupon.');
          toast.success('Coupon deleted.');
          loadCoupons();
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Delete',
      'Cancel'
    );
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponValue <= 0) {
      toast.warning('Please fill code and value fields.');
      return;
    }

    try {
      setCouponSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/coupons`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          code: newCouponCode.trim(),
          discount_type: newCouponType,
          discount_value: newCouponValue,
          max_uses: newCouponMaxUses ? parseInt(newCouponMaxUses) : null,
          expires_at: newCouponExpiresAt || null,
        }),
      });

      const json = await handleFetchResponse(res, 'Could not create coupon.');
      toast.success(json.message || 'Coupon created successfully.');
      setIsCreateCouponOpen(false);
      setNewCouponCode('');
      setNewCouponType('percentage');
      setNewCouponValue(0);
      setNewCouponMaxUses('');
      setNewCouponExpiresAt('');
      loadCoupons();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCouponSaving(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2>Coupon Codes</h2>
          <p>Create and manage discount codes for merchants to upgrade their subscription plans.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateCouponOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {couponsLoading && coupons.length === 0 ? (
        <SkeletonGrid />
      ) : coupons.length === 0 ? (
        <EmptyState label="No coupon codes have been created yet." />
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Max Uses</th>
                  <th>Uses Count</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon: any) => (
                  <tr key={coupon.id}>
                    <td>
                      <span className="admin-chip admin-chip--gray" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em' }}>
                        {coupon.code}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {coupon.discount_type}
                      </span>
                    </td>
                    <td>
                      {coupon.discount_type === 'percentage'
                        ? `${parseFloat(coupon.discount_value)}%`
                        : formatMoney(coupon.discount_value)}
                    </td>
                    <td>{coupon.max_uses ?? 'Unlimited'}</td>
                    <td>{coupon.uses_count}</td>
                    <td>
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <span className={`admin-chip admin-chip--${coupon.is_active ? 'green' : 'gray'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-table__actions">
                      <div className="admin-actions-cell" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="admin-action"
                          onClick={() => handleToggleCouponStatus(coupon.id)}
                          title={coupon.is_active ? 'Deactivate Coupon' : 'Activate Coupon'}
                          style={{ minHeight: 30, padding: '4px 8px' }}
                        >
                          <Power size={13} style={{ color: coupon.is_active ? 'var(--text-muted)' : 'var(--success)' }} />
                        </button>
                        <button
                          type="button"
                          className="admin-action danger"
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          title="Delete Coupon"
                          style={{ minHeight: 30, padding: '4px 8px' }}
                        >
                          <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isCreateCouponOpen && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="admin-panel" style={{ width: '100%', maxWidth: 450, padding: 24, position: 'relative', background: 'var(--surface)' }}>
            <button
              type="button"
              onClick={() => setIsCreateCouponOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Create Coupon Code</h3>
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. PRO50OFF"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--surface-2)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: 14,
                      fontWeight: 600,
                      height: 42,
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Value (NGN)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Discount Value</label>
                  <input
                    type="number"
                    placeholder={newCouponType === 'percentage' ? 'e.g. 50' : 'e.g. 1500'}
                    value={newCouponValue || ''}
                    onChange={(e) => setNewCouponValue(parseFloat(e.target.value) || 0)}
                    required
                    min="0.01"
                    max={newCouponType === 'percentage' ? 100 : undefined}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--surface-2)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: 14,
                      fontWeight: 600,
                      height: 42,
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Uses (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 100 (Leave blank for unlimited)"
                  value={newCouponMaxUses}
                  onChange={(e) => setNewCouponMaxUses(e.target.value)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: 14,
                    height: 42,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={newCouponExpiresAt}
                  onChange={(e) => setNewCouponExpiresAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: 14,
                    height: 42,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCreateCouponOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={couponSaving}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {couponSaving ? <Loader2 size={16} className="admin-spin" /> : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
