'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Receipt, Plus, Loader2 } from 'lucide-react';
import { api, getApiUrl } from '@/lib/api';
import Modal from '@/components/Modal';
import SearchableSelect from '@/components/SearchableSelect';
import type { StoreInfo } from '@/types/dashboard';

interface StoreReceipt {
  id: string;
  receipt_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  paid_at: string;
  amount: number | string;
  payment_method: string;
}

interface ReceiptsTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$' };

export default function ReceiptsTab({ store, isPro, navigateDashboardTab }: ReceiptsTabProps) {
  const [receipts, setReceipts] = useState<StoreReceipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptSearch, setReceiptSearch] = useState('');
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false);
  const [receiptSaving, setReceiptSaving] = useState(false);
  const [newReceiptData, setNewReceiptData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    amount: '',
    payment_method: 'cash',
    paid_at: new Date().toISOString().slice(0, 10),
    message: '',
  });

  const fetchReceiptsData = async () => {
    if (!isPro) return;
    try {
      setReceiptsLoading(true);
      const data = await api.get<StoreReceipt[]>('/v1/receipts');
      setReceipts(data || []);
    } catch {
      toast.error('Failed to load receipts.');
    } finally {
      setReceiptsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiptsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptSaving(true);
    try {
      const payload = {
        customer_name: newReceiptData.customer_name,
        customer_email: newReceiptData.customer_email || null,
        customer_phone: newReceiptData.customer_phone || null,
        amount: parseFloat(newReceiptData.amount) || 0,
        payment_method: newReceiptData.payment_method,
        paid_at: newReceiptData.paid_at,
        message: newReceiptData.message || null,
      };
      await api.post('/v1/receipts', payload);
      toast.success('Receipt created successfully.');
      setIsAddReceiptOpen(false);
      fetchReceiptsData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create receipt.');
    } finally {
      setReceiptSaving(false);
    }
  };

  const handleResendReceipt = async (id: string) => {
    toast.loading('Resending receipt...');
    try {
      await api.post(`/v1/receipts/${id}/resend`);
      toast.dismiss();
      toast.success('Receipt resent to customer.');
    } catch {
      toast.dismiss();
      toast.error('Failed to resend receipt.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)', flexShrink: 0
          }}>
            <Receipt size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Pro Receipts
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              View generated receipts and instantly resend verification details.
            </p>
          </div>
        </div>
        {isPro && (
          <button
            onClick={() => {
              setNewReceiptData({ customer_name: '', customer_email: '', customer_phone: '', amount: '', payment_method: 'cash', paid_at: new Date().toISOString().slice(0, 10), message: '' });
              setIsAddReceiptOpen(true);
            }}
            className="btn btn-primary clickable"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13.5 }}
          >
            <Plus size={16} /> Create Receipt
          </button>
        )}
      </div>

      {!isPro ? (
        <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <Receipt size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
              Automated Digital Receipts
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Deliver automated customer receipts on successful checkout payment verification, complete with customized PDF layouts for mobile printers.
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
          {/* Search Bar */}
          <div className="card" style={{ padding: 12 }}>
            <input
              type="text"
              placeholder="Search receipts by customer or receipt number..."
              value={receiptSearch}
              onChange={e => setReceiptSearch(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'none', fontSize: 14, outline: 'none' }}
            />
          </div>

          {/* Receipts List */}
          {receiptsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Loader2 className="spinner" size={32} />
            </div>
          ) : receipts.length === 0 ? (
            <div className="card text-center" style={{ padding: 40 }}>
              <p style={{ color: 'var(--text-muted)' }}>No receipts have been generated yet.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Receipt #</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Customer</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Paid Date</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Method</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts
                    .filter(r => {
                      const term = receiptSearch.toLowerCase();
                      return r.receipt_number.toLowerCase().includes(term) || r.customer_name.toLowerCase().includes(term);
                    })
                    .map(r => {
                      const symbol = CURRENCY_SYMBOLS[store?.currency_code || 'NGN'] || (store?.currency_code || '') + ' ';
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{r.receipt_number}</td>
                          <td style={{ padding: '14px 18px', fontSize: 14 }}>
                            <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{r.customer_email || r.customer_phone}</div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--text-muted)' }}>{new Date(r.paid_at).toLocaleDateString()}</td>
                          <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{symbol}{parseFloat(r.amount as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, textTransform: 'capitalize' }}>{r.payment_method?.replace('_', ' ')}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <a
                                href={`${getApiUrl()}/v1/public/receipts/${r.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline clickable"
                                style={{ padding: '4px 8px', fontSize: 11.5 }}
                              >
                                View PDF
                              </a>
                              <button
                                onClick={() => handleResendReceipt(r.id)}
                                className="btn btn-primary clickable"
                                style={{ padding: '4px 8px', fontSize: 11.5 }}
                              >
                                Resend
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal
        open={isAddReceiptOpen}
        onClose={() => setIsAddReceiptOpen(false)}
        title="Create Receipt"
        maxWidth={520}
        className="responsive-modal-container"
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Issue a receipt for a payment received off-platform (cash, bank transfer, etc.)</p>
        <form onSubmit={handleCreateReceipt} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="form-label">Customer Name *</label>
            <input type="text" required value={newReceiptData.customer_name} onChange={e => setNewReceiptData({ ...newReceiptData, customer_name: e.target.value })} className="form-control" placeholder="e.g. Amaka Obi" />
          </div>

          <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field-group">
              <label className="form-label">Customer Email</label>
              <input type="email" value={newReceiptData.customer_email} onChange={e => setNewReceiptData({ ...newReceiptData, customer_email: e.target.value })} className="form-control" placeholder="email@example.com" />
            </div>
            <div className="field-group">
              <label className="form-label">Customer Phone</label>
              <input type="text" value={newReceiptData.customer_phone} onChange={e => setNewReceiptData({ ...newReceiptData, customer_phone: e.target.value })} className="form-control" placeholder="+234 800 000 0000" />
            </div>
          </div>

          <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field-group">
              <label className="form-label">Amount Paid *</label>
              <input type="number" required min={0} step="0.01" value={newReceiptData.amount} onChange={e => setNewReceiptData({ ...newReceiptData, amount: e.target.value })} className="form-control" placeholder="0.00" />
            </div>
            <div className="field-group">
              <label className="form-label">Date Paid *</label>
              <input type="date" required value={newReceiptData.paid_at} onChange={e => setNewReceiptData({ ...newReceiptData, paid_at: e.target.value })} className="form-control" />
            </div>
          </div>

          <div className="field-group">
            <label className="form-label">Payment Method</label>
            <SearchableSelect
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'pos', label: 'POS' },
                { value: 'mobile_money', label: 'Mobile Money' },
                { value: 'other', label: 'Other' },
              ]}
              value={newReceiptData.payment_method}
              onChange={val => setNewReceiptData({ ...newReceiptData, payment_method: val })}
              placeholder="Select payment method"
            />
          </div>

          <div className="field-group">
            <label className="form-label">Message / Notes</label>
            <textarea value={newReceiptData.message} onChange={e => setNewReceiptData({ ...newReceiptData, message: e.target.value })} className="form-control" placeholder="What was this payment for?" style={{ height: 72 }} />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAddReceiptOpen(false)} className="btn btn-outline clickable">Cancel</button>
            <button type="submit" disabled={receiptSaving} className="btn btn-primary clickable">{receiptSaving ? 'Saving...' : 'Save Receipt'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
