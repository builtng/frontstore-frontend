'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Plus, Loader2, Trash2, Send, Download, Clock, ShieldCheck } from 'lucide-react';
import { api, getApiUrl } from '@/lib/api';
import Modal from '@/components/Modal';
import ProFeatureGate from '@/components/dashboard/ProFeatureGate';
import type { StoreInfo } from '@/types/dashboard';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  due_date: string;
  total_amount: number | string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface InvoicesTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$' };

export default function InvoicesTab({ store, isPro, navigateDashboardTab }: InvoicesTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [invoiceItems, setInvoiceItems] = useState<Array<{ name: string, quantity: number, price: number }>>([
    { name: '', quantity: 1, price: 0 }
  ]);
  const [newInvoiceData, setNewInvoiceData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    due_date: '',
    notes: ''
  });

  const fetchInvoicesData = async () => {
    if (!isPro) return;
    try {
      setInvoicesLoading(true);
      const data = await api.get<Invoice[]>('/v1/invoices');
      setInvoices(data || []);
    } catch {
      toast.error('Failed to load invoices.');
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const items = invoiceItems.filter(it => it.name.trim() !== '').map(it => ({ name: it.name, qty: it.quantity, price: it.price }));
      const subtotal = items.reduce((acc, it) => acc + (it.qty * it.price), 0);
      const payload = {
        customer_name: newInvoiceData.customer_name,
        customer_email: newInvoiceData.customer_email || null,
        customer_phone: newInvoiceData.customer_phone,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: newInvoiceData.due_date,
        notes: newInvoiceData.notes || null,
        items,
        subtotal
      };
      await api.post('/v1/invoices', payload);
      toast.success('Invoice created successfully.');
      setIsAddInvoiceOpen(false);
      fetchInvoicesData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice.');
    }
  };

  const handleSendInvoice = async (id: string) => {
    toast.loading('Sending invoice...');
    try {
      await api.post(`/v1/invoices/${id}/send`);
      toast.dismiss();
      toast.success('Invoice sent to customer.');
    } catch {
      toast.dismiss();
      toast.error('Failed to send invoice.');
    }
  };

  const handleRecordPayment = async (id: string) => {
    if (!confirm('Record cash/bank transfer payment for this invoice?')) return;
    try {
      await api.post(`/v1/invoices/${id}/record-payment`, { payment_method: 'bank_transfer' });
      toast.success('Payment recorded successfully.');
      fetchInvoicesData();
    } catch {
      toast.error('Failed to record payment.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)', flexShrink: 0
          }}>
            <FileText size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Pro Invoices
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Create, send, and track professional invoices.
            </p>
          </div>
        </div>
        {isPro && (
          <button
            onClick={() => {
              setNewInvoiceData({ customer_name: '', customer_email: '', customer_phone: '', due_date: '', notes: '' });
              setInvoiceItems([{ name: '', quantity: 1, price: 0 }]);
              setIsAddInvoiceOpen(true);
            }}
            className="btn btn-primary clickable"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13.5 }}
          >
            <Plus size={16} /> Create Invoice
          </button>
        )}
      </div>

      {!isPro ? (
        <ProFeatureGate
          title="Professional Merchant Invoices"
          subtitle="Send branded PDF invoices directly to clients, track unpaid balances, schedule automatic due date reminders, and collect payments seamlessly."
          icon={FileText}
          badgeText="PRO MERCHANT INVOICING"
          onUpgrade={() => navigateDashboardTab('billing')}
          features={[
            {
              icon: Send,
              title: 'Direct Client Dispatch',
              description: 'Send invoices instantly via WhatsApp or Email with custom merchant branding.',
            },
            {
              icon: Download,
              title: 'Branded PDF Generation',
              description: 'Generate itemized PDF invoices styled with your store logo and legal details.',
            },
            {
              icon: Clock,
              title: 'Overdue Tracking & Reminders',
              description: 'Automatically monitor due dates and dispatch automated payment reminders.',
            },
            {
              icon: ShieldCheck,
              title: 'Instant Reconciliation',
              description: 'Payments auto-update invoice status to paid upon buyer checkout completion.',
            },
          ]}
          previewChildren={
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Client Invoices (12 Issued)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ padding: '4px 12px', borderRadius: 9999, background: '#ECFDF5', color: '#059669', fontSize: 12, fontWeight: 700 }}>Paid (₦1.2M)</div>
                  <div style={{ padding: '4px 12px', borderRadius: 9999, background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 700 }}>Pending (₦350K)</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', padding: 12, borderRadius: 12, background: '#F8FAFC', fontSize: 12, fontWeight: 700 }}>
                <div>Invoice #</div>
                <div>Client Name</div>
                <div>Amount</div>
                <div>Status</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', padding: 12, borderBottom: '1px solid #E2E8F0', fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>INV-2026-089</div>
                <div>Kemi Adeleke Design Co.</div>
                <div style={{ fontWeight: 700, color: '#059669' }}>₦280,000.00</div>
                <span style={{ color: '#059669', fontWeight: 600 }}>Paid</span>
              </div>
            </div>
          }
        />
      ) : (
        <>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, overflowX: 'auto' }}>
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(f => (
              <button
                key={f}
                onClick={() => setInvoiceFilter(f)}
                className="clickable"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  background: invoiceFilter === f ? 'var(--primary-light)' : 'transparent',
                  color: invoiceFilter === f ? 'var(--primary)' : 'var(--text-muted)',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Invoices List */}
          {invoicesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Loader2 className="spinner" size={32} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="card text-center" style={{ padding: 40 }}>
              <p style={{ color: 'var(--text-muted)' }}>No invoices found. Click "Create Invoice" to issue one.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Invoice #</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Customer</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Due Date</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Total Amount</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .filter(inv => invoiceFilter === 'all' || inv.status === invoiceFilter)
                    .map(inv => {
                      const symbol = CURRENCY_SYMBOLS[store?.currency_code || 'NGN'] || (store?.currency_code || '') + ' ';
                      return (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{inv.invoice_number}</td>
                          <td style={{ padding: '14px 18px', fontSize: 14 }}>
                            <div style={{ fontWeight: 700 }}>{inv.customer_name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{inv.customer_email || inv.customer_phone}</div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--text-muted)' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                          <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{symbol}{parseFloat(inv.total_amount as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--r-full)',
                              background: inv.status === 'paid' ? 'rgba(34,197,94,0.1)' : (inv.status === 'sent' ? 'rgba(59,130,246,0.1)' : (inv.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(156,163,175,0.1)')),
                              color: inv.status === 'paid' ? 'var(--success)' : (inv.status === 'sent' ? 'var(--primary)' : (inv.status === 'overdue' ? 'var(--danger)' : 'var(--text-muted)')),
                              textTransform: 'uppercase'
                            }}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <a
                                href={`${getApiUrl()}/v1/public/invoices/${inv.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline clickable"
                                style={{ padding: '4px 8px', fontSize: 11.5 }}
                              >
                                PDF
                              </a>
                              {inv.status !== 'paid' && (
                                <>
                                  <button
                                    onClick={() => handleSendInvoice(inv.id)}
                                    className="btn btn-outline clickable"
                                    style={{ padding: '4px 8px', fontSize: 11.5 }}
                                  >
                                    Send
                                  </button>
                                  <button
                                    onClick={() => handleRecordPayment(inv.id)}
                                    className="btn btn-primary clickable"
                                    style={{ padding: '4px 8px', fontSize: 11.5 }}
                                  >
                                    Paid
                                  </button>
                                </>
                              )}
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
        open={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
        title="Create New Invoice"
        maxWidth={700}
        className="responsive-modal-container"
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Fill in customer and item details</p>
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer Name */}
          <div className="field-group">
            <label className="form-label">Customer Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" required value={newInvoiceData.customer_name} onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_name: e.target.value })} className="form-control" placeholder="e.g. Amaka Obi" />
          </div>

          {/* Email + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field-group">
              <label className="form-label">Customer Email</label>
              <input type="email" value={newInvoiceData.customer_email} onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_email: e.target.value })} className="form-control" placeholder="email@example.com" />
            </div>
            <div className="field-group">
              <label className="form-label">Customer Phone <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" required value={newInvoiceData.customer_phone} onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_phone: e.target.value })} className="form-control" placeholder="+234 800 000 0000" />
            </div>
          </div>

          {/* Due Date */}
          <div className="field-group">
            <label className="form-label">Due Date <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="date" required value={newInvoiceData.due_date} onChange={e => setNewInvoiceData({ ...newInvoiceData, due_date: e.target.value })} className="form-control" />
          </div>

          {/* Invoice Items */}
          <div>
            <label className="form-label">Invoice Items</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {invoiceItems.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 110px 32px', gap: 8, alignItems: 'center' }}>
                  <input type="text" placeholder="Item name" value={item.name} required onChange={e => { const next = [...invoiceItems]; next[idx].name = e.target.value; setInvoiceItems(next); }} className="form-control" />
                  <input type="number" placeholder="Qty" value={item.quantity} min={1} required onChange={e => { const next = [...invoiceItems]; next[idx].quantity = parseInt(e.target.value) || 1; setInvoiceItems(next); }} className="form-control" style={{ textAlign: 'center' }} />
                  <input type="number" placeholder="Price" value={item.price} min={0} required onChange={e => { const next = [...invoiceItems]; next[idx].price = parseFloat(e.target.value) || 0; setInvoiceItems(next); }} className="form-control" />
                  <button type="button" onClick={() => { if (invoiceItems.length > 1) setInvoiceItems(invoiceItems.filter((_, i) => i !== idx)); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--danger)', background: 'var(--danger-light)', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { name: '', quantity: 1, price: 0 }])} style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--primary)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all var(--t-fast)' }}>
              <Plus size={13} /> Add Line Item
            </button>
          </div>

          {/* Notes */}
          <div className="field-group">
            <label className="form-label">Notes / Instructions</label>
            <textarea value={newInvoiceData.notes} onChange={e => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })} className="form-control" placeholder="Payment terms, delivery notes..." style={{ height: 72 }} />
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={() => setIsAddInvoiceOpen(false)} className="btn btn-outline clickable">Cancel</button>
            <button type="submit" className="btn btn-primary clickable">Save Invoice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
