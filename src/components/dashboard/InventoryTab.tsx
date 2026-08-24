'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';
import type { Product, DashboardTab } from '@/types/dashboard';

interface InventoryLog {
  id: string;
  created_at: string;
  product?: { name: string } | null;
  variant?: { size?: string | null; color?: string | null } | null;
  adjustment_type: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
}

interface InventoryTabProps {
  isPro: boolean;
  products: Product[];
  navigateDashboardTab: (tab: DashboardTab) => void;
  refreshProducts: () => void;
}

export default function InventoryTab({ isPro, products, navigateDashboardTab, refreshProducts }: InventoryTabProps) {
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<'levels' | 'logs'>('levels');
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustingVariant, setAdjustingVariant] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'restock' | 'manual'>('restock');
  const [adjustReason, setAdjustReason] = useState('');

  const fetchInventoryLogsData = async () => {
    if (!isPro) return;
    try {
      setInventoryLoading(true);
      const data = await api.get<{ data: InventoryLog[] }>('/v1/inventory/logs');
      setInventoryLogs((data as any)?.data || []);
    } catch {
      toast.error('Failed to load inventory adjustment history.');
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryLogsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const qtyVal = parseInt(adjustQty);
      if (isNaN(qtyVal)) return;

      const payload = {
        product_id: adjustingProduct.id,
        product_variant_id: adjustingVariant?.id || null,
        quantity: qtyVal,
        adjustment_type: adjustType,
        reason: adjustReason || null
      };

      await api.post('/v1/inventory/adjust', payload);
      toast.success('Stock count adjusted successfully.');
      setIsAdjustStockOpen(false);
      refreshProducts();
      fetchInventoryLogsData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to adjust stock.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)', flexShrink: 0
          }}>
            <Archive size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Inventory Management
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Track stock levels, configure low stock thresholds, and view adjustment logs.
            </p>
          </div>
        </div>
      </div>

      {!isPro ? (
        <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <Archive size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
              Advanced Inventory & Variants
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Track product sizes and colors, automatically deduct stock levels upon successful customer purchase, and configure instant notifications for low stock counts.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
            <button
              onClick={() => navigateDashboardTab('billing')}
              className="btn btn-primary clickable"
              style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
            >
              🚀 Upgrade to Pro
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Sub-tabs toggle */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <button
              onClick={() => setInventoryTab('levels')}
              className="clickable"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-full)',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                background: inventoryTab === 'levels' ? 'var(--primary-light)' : 'transparent',
                color: inventoryTab === 'levels' ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              Stock Levels
            </button>
            <button
              onClick={() => setInventoryTab('logs')}
              className="clickable"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-full)',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                background: inventoryTab === 'logs' ? 'var(--primary-light)' : 'transparent',
                color: inventoryTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              Adjustment History
            </button>
          </div>

          {inventoryTab === 'levels' ? (
            /* Stock Levels Table */
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Track Stock?</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Stock Count</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => {
                    const hasVariants = prod.variants && prod.variants.length > 0;
                    return (
                      <React.Fragment key={prod.id}>
                        <tr style={{ borderBottom: hasVariants ? 'none' : '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{prod.name}</td>
                          <td style={{ padding: '14px 18px', fontSize: 14 }}>{prod.track_inventory ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 850 }}>
                            {prod.track_inventory ? prod.inventory_quantity : '—'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {prod.track_inventory ? (
                              <span style={{
                                fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--r-full)',
                                background: prod.stock_status === 'in_stock' ? 'rgba(34,197,94,0.1)' : (prod.stock_status === 'low_stock' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'),
                                color: prod.stock_status === 'in_stock' ? 'var(--success)' : (prod.stock_status === 'low_stock' ? 'var(--warning)' : 'var(--danger)'),
                                textTransform: 'uppercase'
                              }}>
                                {prod.stock_status?.replace('_', ' ')}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {!hasVariants && prod.track_inventory && (
                              <button
                                onClick={() => {
                                  setAdjustingProduct(prod);
                                  setAdjustingVariant(null);
                                  setAdjustQty('');
                                  setAdjustType('restock');
                                  setAdjustReason('');
                                  setIsAdjustStockOpen(true);
                                }}
                                className="btn btn-outline clickable"
                                style={{ padding: '4px 8px', fontSize: 11.5 }}
                              >
                                Adjust Stock
                              </button>
                            )}
                          </td>
                        </tr>
                        {hasVariants && prod.variants!.map((v: any) => (
                          <tr key={v.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                            <td style={{ padding: '8px 18px 8px 36px', fontSize: 12.5, color: 'var(--text-muted)' }}>
                              ↳ Variant: {v.size ? `Size ${v.size}` : ''} {v.color ? `Color ${v.color}` : ''}
                            </td>
                            <td style={{ padding: '8px 18px', fontSize: 12.5, color: 'var(--text-muted)' }}>Yes</td>
                            <td style={{ padding: '8px 18px', fontSize: 13, fontWeight: 750 }}>{v.inventory_quantity}</td>
                            <td style={{ padding: '8px 18px' }}>
                              <span style={{
                                fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-full)',
                                background: v.inventory_quantity <= 0 ? 'rgba(239,68,68,0.1)' : (v.inventory_quantity <= (prod.low_stock_threshold ?? 5) ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)'),
                                color: v.inventory_quantity <= 0 ? 'var(--danger)' : (v.inventory_quantity <= (prod.low_stock_threshold ?? 5) ? 'var(--warning)' : 'var(--success)'),
                                textTransform: 'uppercase'
                              }}>
                                {v.inventory_quantity <= 0 ? 'OUT OF STOCK' : (v.inventory_quantity <= (prod.low_stock_threshold ?? 5) ? 'LOW STOCK' : 'IN STOCK')}
                              </span>
                            </td>
                            <td style={{ padding: '8px 18px' }}>
                              <button
                                onClick={() => {
                                  setAdjustingProduct(prod);
                                  setAdjustingVariant(v);
                                  setAdjustQty('');
                                  setAdjustType('restock');
                                  setAdjustReason('');
                                  setIsAdjustStockOpen(true);
                                }}
                                className="btn btn-outline clickable"
                                style={{ padding: '4px 8px', fontSize: 11 }}
                              >
                                Adjust
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Adjustment Logs Table */
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Variant</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Type</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Adjustment</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Qty Before/After</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 700 }}>
                        {log.product?.name || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                        {log.variant ? `${log.variant.size ? 'S: ' + log.variant.size : ''} ${log.variant.color ? 'C: ' + log.variant.color : ''}` : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 12.5, textTransform: 'capitalize' }}>
                        {log.adjustment_type}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 800, color: log.quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                        {log.previous_quantity} → {log.new_quantity}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13 }}>
                        {log.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal
        open={isAdjustStockOpen && !!adjustingProduct}
        onClose={() => setIsAdjustStockOpen(false)}
        title="Adjust Stock Count"
        maxWidth={450}
        className="responsive-modal-container"
      >
        {adjustingProduct && (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Update inventory for this product</p>

            {/* Product info chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adjustingProduct.name}</div>
                {adjustingVariant && (
                  <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2, fontWeight: 700 }}>
                    {adjustingVariant.size ? `Size ${adjustingVariant.size}` : ''}{adjustingVariant.color ? ` · Color ${adjustingVariant.color}` : ''}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAdjustStock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field-group">
                <label className="form-label">Adjustment Type</label>
                <SearchableSelect
                  value={adjustType}
                  onChange={val => setAdjustType(val as any)}
                  options={[
                    { value: 'restock', label: 'Restock', sublabel: 'Add units to current stock count' },
                    { value: 'manual', label: 'Manual Adjustment', sublabel: 'Set exact count or deduct units' },
                  ]}
                  placeholder="Select adjustment type"
                />
              </div>

              <div className="field-group">
                <label className="form-label">Quantity <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="number" required value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="e.g. 10 to add, -5 to deduct" className="form-control" />
              </div>

              <div className="field-group">
                <label className="form-label">Reason / Note</label>
                <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="e.g. Damaged goods, New batch restocked" className="form-control" />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAdjustStockOpen(false)} className="btn btn-outline clickable">Cancel</button>
                <button type="submit" className="btn btn-primary clickable">Adjust Stock</button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
