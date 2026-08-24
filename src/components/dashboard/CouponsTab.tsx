'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Tag, Plus, CheckCircle2, Zap, Loader2, QrCode, Edit2, Trash2, X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { StoreInfo } from '@/types/dashboard';

interface StoreCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number | string;
  min_order_amount: number | string;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  qr_code_url?: string | null;
}

interface CouponsTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
}

export default function CouponsTab({ store, isPro, openUpgradePrompt }: CouponsTabProps) {
  const [storeCoupons, setStoreCoupons] = useState<StoreCoupon[]>([]);
  const [storeCouponsLoading, setStoreCouponsLoading] = useState(false);
  const [isStoreCouponModalOpen, setIsStoreCouponModalOpen] = useState(false);
  const [editingStoreCoupon, setEditingStoreCoupon] = useState<StoreCoupon | null>(null);
  const [storeCouponCode, setStoreCouponCode] = useState('');
  const [storeCouponType, setStoreCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [storeCouponValue, setStoreCouponValue] = useState('');
  const [storeCouponMinOrderAmount, setStoreCouponMinOrderAmount] = useState('');
  const [storeCouponMaxUses, setStoreCouponMaxUses] = useState('');
  const [storeCouponExpiresAt, setStoreCouponExpiresAt] = useState('');
  const [storeCouponSaving, setStoreCouponSaving] = useState(false);

  const loadStoreCoupons = async () => {
    try {
      setStoreCouponsLoading(true);
      const data = await api.get<StoreCoupon[]>('/v1/store-coupons');
      setStoreCoupons(data || []);
    } catch (err) {
      console.error('Failed to load store coupons:', err);
    } finally {
      setStoreCouponsLoading(false);
    }
  };

  useEffect(() => {
    if (isPro) loadStoreCoupons();
  }, [isPro]);

  const handleToggleStoreCouponStatus = async (id: string) => {
    try {
      const json: any = await api.patch(`/v1/store-coupons/${id}/toggle-status`);
      toast.success(json?.message || 'Coupon status updated.');
      loadStoreCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update coupon status.');
    }
  };

  const handleDeleteStoreCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      await api.del(`/v1/store-coupons/${id}`);
      toast.success('Coupon deleted successfully.');
      loadStoreCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete coupon.');
    }
  };

  const handleCreateStoreCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeCouponCode.trim() || !storeCouponValue) {
      toast.warning('Please fill in coupon code and discount value.');
      return;
    }

    try {
      setStoreCouponSaving(true);
      const payload = {
        code: storeCouponCode.trim(),
        discount_type: storeCouponType,
        discount_value: parseFloat(storeCouponValue),
        min_order_amount: storeCouponMinOrderAmount ? parseFloat(storeCouponMinOrderAmount) : 0,
        max_uses: storeCouponMaxUses ? parseInt(storeCouponMaxUses) : null,
        expires_at: storeCouponExpiresAt || null,
      };

      const json: any = editingStoreCoupon
        ? await api.put(`/v1/store-coupons/${editingStoreCoupon.id}`, payload)
        : await api.post('/v1/store-coupons', payload);

      toast.success(json?.message || 'Coupon saved successfully.');
      setIsStoreCouponModalOpen(false);
      setEditingStoreCoupon(null);
      setStoreCouponCode('');
      setStoreCouponType('percentage');
      setStoreCouponValue('');
      setStoreCouponMinOrderAmount('');
      setStoreCouponMaxUses('');
      setStoreCouponExpiresAt('');
      loadStoreCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save coupon.');
    } finally {
      setStoreCouponSaving(false);
    }
  };

  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: 'var(--primary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Tag size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Store Coupons</h2>
        <p style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Discounts & Promotions</p>
        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Create discount codes your customers can apply at checkout to boost sales and reward loyal buyers.
        </p>

        <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Percentage or fixed-amount discounts</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Usage limits & expiry dates</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Minimum order amount rules</span>
          </div>
        </div>

        <button
          onClick={() => openUpgradePrompt(
            'Store Coupons requires Pro',
            'Creating and managing discount codes for your storefront is available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock Coupons
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card animate-fade-in" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Store Coupons</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create and manage discount codes for your customers to use at checkout.</p>
          </div>
          <button
            onClick={() => {
              setEditingStoreCoupon(null);
              setStoreCouponCode('');
              setStoreCouponType('percentage');
              setStoreCouponValue('');
              setStoreCouponMinOrderAmount('');
              setStoreCouponMaxUses('');
              setStoreCouponExpiresAt('');
              setIsStoreCouponModalOpen(true);
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
            <Plus size={16} /> Create Coupon
          </button>
        </div>

        {storeCouponsLoading && storeCoupons.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Loader2 className="animate-spin" size={24} /></div>
        ) : storeCoupons.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="empty-state__icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
              <Tag size={28} strokeWidth={1.25} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>No storefront coupons yet</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
              Create a discount code (e.g. SAVE10) to reward your customers and increase sales.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Code</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Discount</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Order</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Usage</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expires</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: 12, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {storeCoupons.map((coupon) => (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12 }}>
                      <span className="admin-chip admin-chip--gray" style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {coupon.code}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontWeight: 700 }}>
                      {coupon.discount_type === 'percentage'
                        ? `${parseFloat(coupon.discount_value as string)}%`
                        : `${getCurrencySymbol(store?.currency_code)}${formatVal(coupon.discount_value)}`}
                    </td>
                    <td style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                      {parseFloat(coupon.min_order_amount as string) > 0
                        ? `${getCurrencySymbol(store?.currency_code)}${formatVal(coupon.min_order_amount)}`
                        : 'None'}
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : 'uses'}
                    </td>
                    <td style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => handleToggleStoreCouponStatus(coupon.id)}
                        className="clickable"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <span className={`admin-chip admin-chip--${coupon.is_active ? 'green' : 'gray'}`} style={{
                          display: 'inline-block',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999,
                          color: coupon.is_active ? '#10b981' : 'var(--text-muted)',
                          background: coupon.is_active ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-2)'
                        }}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {coupon.qr_code_url && (
                          <a
                            href={coupon.qr_code_url}
                            download={`coupon-${coupon.code}-qr.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download coupon QR code"
                            className="btn btn-ghost clickable"
                            style={{ padding: 6, display: 'inline-flex', background: 'transparent', border: 'none', color: 'var(--text-2)' }}
                          >
                            <QrCode size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setEditingStoreCoupon(coupon);
                            setStoreCouponCode(coupon.code);
                            setStoreCouponType(coupon.discount_type);
                            setStoreCouponValue(String(coupon.discount_value));
                            setStoreCouponMinOrderAmount(String(coupon.min_order_amount));
                            setStoreCouponMaxUses(coupon.max_uses ? String(coupon.max_uses) : '');
                            setStoreCouponExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : '');
                            setIsStoreCouponModalOpen(true);
                          }}
                          className="btn btn-ghost clickable"
                          style={{ padding: 6, display: 'inline-flex', background: 'transparent', border: 'none', color: 'var(--text-2)' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteStoreCoupon(coupon.id, coupon.code)}
                          className="btn btn-ghost clickable"
                          style={{ padding: 6, display: 'inline-flex', background: 'transparent', border: 'none', color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: CREATE/EDIT STOREFRONT COUPON ── */}
      {isStoreCouponModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsStoreCouponModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 28, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={18} style={{ color: 'var(--primary)' }} /> {editingStoreCoupon ? 'Edit Store Coupon' : 'Create Store Coupon'}
              </h3>
              <button onClick={() => setIsStoreCouponModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateStoreCoupon} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Coupon Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SAVE10"
                  value={storeCouponCode}
                  onChange={(e) => setStoreCouponCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Discount Type</label>
                  <select
                    value={storeCouponType}
                    onChange={(e) => setStoreCouponType(e.target.value as 'percentage' | 'fixed')}
                    style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Discount Value</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 10"
                    value={storeCouponValue}
                    onChange={(e) => setStoreCouponValue(e.target.value)}
                    style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Min Order ({getCurrencySymbol(store?.currency_code)})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1000 (optional)"
                    value={storeCouponMinOrderAmount}
                    onChange={(e) => setStoreCouponMinOrderAmount(e.target.value)}
                    style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100 (optional)"
                    value={storeCouponMaxUses}
                    onChange={(e) => setStoreCouponMaxUses(e.target.value)}
                    style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Expiry Date</label>
                <input
                  type="date"
                  value={storeCouponExpiresAt}
                  onChange={(e) => setStoreCouponExpiresAt(e.target.value)}
                  style={{ width: '100%', padding: 11, border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsStoreCouponModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={storeCouponSaving} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {storeCouponSaving ? <Loader2 size={16} className="animate-spin" /> : (editingStoreCoupon ? 'Save Changes' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
