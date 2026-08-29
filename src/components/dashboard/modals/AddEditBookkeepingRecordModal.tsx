'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Loader2, DollarSign, Calendar, FileText, Tag, User, Hash,
  CheckCircle2, Upload, AlertCircle, ArrowDownLeft, ArrowUpRight,
  Clock, CreditCard, Check, Receipt, Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import FileUpload from '@/components/FileUpload';
import SearchableSelect from '@/components/SearchableSelect';
import type { BookkeepingRecord, StoreInfo } from '@/types/dashboard';

interface AddEditBookkeepingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: BookkeepingRecord | null;
  store: StoreInfo | null;
  onSaved: () => void;
}

const CATEGORY_OPTIONS: Record<string, Array<{ value: string; label: string; sublabel?: string }>> = {
  income: [
    { value: 'store_sales', label: 'Storefront Sales', sublabel: 'Direct buyer payments via online checkout' },
    { value: 'offline_sales', label: 'Offline / POS Sales', sublabel: 'Walk-in orders or physical pop-up sales' },
    { value: 'wholesale', label: 'Wholesale / Bulk Orders', sublabel: 'High-volume merchant orders' },
    { value: 'services', label: 'Consulting & Services', sublabel: 'Service delivery or consultation fees' },
    { value: 'investments', label: 'Investments & Capital', sublabel: 'Business capital injections or grants' },
    { value: 'refund_received', label: 'Vendor Refund Received', sublabel: 'Returned supplier funds or adjustments' },
    { value: 'miscellaneous_income', label: 'Other Income', sublabel: 'Any non-operational inflow' },
  ],
  expense: [
    { value: 'inventory_restock', label: 'Inventory & Raw Materials', sublabel: 'Cost of stock, manufacturing or goods' },
    { value: 'shipping', label: 'Shipping & Delivery Fees', sublabel: 'Courier, rider, or freight charges' },
    { value: 'marketing', label: 'Marketing & Advertisements', sublabel: 'Social ads, promotions, and sponsorships' },
    { value: 'software', label: 'Software & Tools', sublabel: 'Subscriptions, cloud hosting, and SaaS' },
    { value: 'rent_utilities', label: 'Rent, Power & Internet', sublabel: 'Office, storage or retail space utilities' },
    { value: 'salaries', label: 'Salaries & Contractor Fees', sublabel: 'Staff wages, rider fees, or gig payments' },
    { value: 'packaging', label: 'Packaging & Supplies', sublabel: 'Branded bags, boxes, tape, and labels' },
    { value: 'tax_payment', label: 'Tax & VAT Payments', sublabel: 'Statutory compliance and tax remittances' },
    { value: 'bank_fees', label: 'Bank Charges & Payment Fees', sublabel: 'Gateway commissions and transfer fees' },
    { value: 'miscellaneous_expense', label: 'Other Expenses', sublabel: 'Uncategorized operational overhead' },
  ],
  receivable: [
    { value: 'customer_credit', label: 'Customer Credit Sale', sublabel: 'Goods dispatched with payment on terms' },
    { value: 'unpaid_invoice', label: 'Unpaid Customer Invoice', sublabel: 'Issued billing awaiting client settlement' },
    { value: 'security_deposit', label: 'Pending Security Deposit', sublabel: 'Refundable deposits held by partners' },
    { value: 'other_receivable', label: 'Other Receivable', sublabel: 'Any balance owed to the business' },
  ],
  payable: [
    { value: 'supplier_bill', label: 'Supplier Credit / Bill', sublabel: 'Delivered inventory awaiting payment' },
    { value: 'pending_rent', label: 'Pending Rent / Utility Bill', sublabel: 'Upcoming facility and utility dues' },
    { value: 'contractor_payable', label: 'Pending Contractor Payment', sublabel: 'Freelancer or delivery partner payouts' },
    { value: 'other_payable', label: 'Other Payable', sublabel: 'Short-term debt owed by the business' },
  ],
};

const TYPE_CONFIG = [
  { id: 'income', label: 'Inflow', sub: 'Revenue', icon: ArrowDownLeft, color: '#10B981', activeBg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'expense', label: 'Outflow', sub: 'Expense', icon: ArrowUpRight, color: '#EF4444', activeBg: 'rgba(239, 68, 68, 0.08)' },
  { id: 'receivable', label: 'Receivable', sub: 'Owed to You', icon: Clock, color: '#3B82F6', activeBg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'payable', label: 'Payable', sub: 'You Owe', icon: CreditCard, color: '#F59E0B', activeBg: 'rgba(245, 158, 11, 0.08)' },
] as const;

export default function AddEditBookkeepingRecordModal({
  isOpen,
  onClose,
  record,
  store,
  onSaved,
}: AddEditBookkeepingRecordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<'income' | 'expense' | 'receivable' | 'payable'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('inventory_restock');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending' | 'overdue' | 'cancelled'>('completed');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptUploading, setReceiptUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (record) {
      setType(record.type);
      setTitle(record.title || '');
      setAmount(String(record.amount || ''));
      setCategory(record.category || CATEGORY_OPTIONS[record.type][0].value);
      setTransactionDate(record.transaction_date ? record.transaction_date.substring(0, 10) : new Date().toISOString().split('T')[0]);
      setDueDate(record.due_date ? record.due_date.substring(0, 10) : '');
      setPartyName(record.party_name || '');
      setReferenceNo(record.reference_no || '');
      setStatus(record.status || 'completed');
      setReceiptUrl(record.receipt_url || '');
      setTaxAmount(String(record.tax_amount || '0'));
      setNotes(record.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('inventory_restock');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setPartyName('');
      setReferenceNo('');
      setStatus('completed');
      setReceiptUrl('');
      setTaxAmount('0');
      setNotes('');
    }
  }, [record, isOpen]);

  const handleTypeChange = (newType: 'income' | 'expense' | 'receivable' | 'payable') => {
    setType(newType);
    setCategory(CATEGORY_OPTIONS[newType][0].value);
    if (newType === 'receivable' || newType === 'payable') {
      setStatus('pending');
    } else {
      setStatus('completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a description or title for this entry.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid numeric amount.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type,
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        transaction_date: transactionDate,
        due_date: dueDate || null,
        party_name: partyName.trim() || null,
        reference_no: referenceNo.trim() || null,
        status,
        receipt_url: receiptUrl || null,
        tax_amount: parseFloat(taxAmount || '0'),
        notes: notes.trim() || null,
      };

      if (record) {
        await api.put(`/v1/bookkeeping/records/${record.id}`, payload);
        toast.success('Transaction record updated.');
      } else {
        await api.post('/v1/bookkeeping/records', payload);
        toast.success('Transaction recorded in ledger.');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save transaction record.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const currency = store?.currency_code || 'NGN';
  const activeTypeMeta = TYPE_CONFIG.find(t => t.id === type) || TYPE_CONFIG[1];

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '90vh',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--r-md)',
              background: activeTypeMeta.activeBg,
              color: activeTypeMeta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${activeTypeMeta.color}30`
            }}>
              <activeTypeMeta.icon size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {record ? 'Edit Financial Record' : 'Record Transaction'}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Bookkeeping Ledger &bull; {store?.store_name || store?.username || 'Store'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="clickable"
            title="Close (Esc)"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              width: 32,
              height: 32,
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>
          <form id="bookkeeping-popup-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Type Switcher */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>
                Transaction Flow
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                background: 'var(--bg-2)',
                padding: 6,
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)'
              }}>
                {TYPE_CONFIG.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id)}
                      className="clickable"
                      style={{
                        padding: '8px 4px',
                        borderRadius: 'var(--r-md)',
                        border: isSelected ? `1.5px solid ${t.color}` : '1px solid transparent',
                        background: isSelected ? 'var(--surface)' : 'transparent',
                        color: isSelected ? t.color : 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: isSelected ? 800 : 600 }}>
                        <Icon size={12} style={{ color: isSelected ? t.color : 'var(--text-muted)' }} />
                        <span>{t.label}</span>
                      </div>
                      <span style={{ fontSize: 9.5, color: 'var(--text-faint)' }}>{t.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount & Category Side by Side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 12,
              padding: 14,
              background: 'var(--bg-2)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border)'
            }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                  Amount ({currency}) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input"
                    style={{
                      paddingLeft: currency.length > 3 ? 58 : 48,
                      fontSize: 18,
                      fontWeight: 900,
                      fontFamily: 'var(--font-heading)',
                      height: 42,
                      background: 'var(--surface)',
                      color: activeTypeMeta.color,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                  Category *
                </label>
                <SearchableSelect
                  options={(CATEGORY_OPTIONS[type] || []).map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                    sublabel: opt.sublabel,
                  }))}
                  value={category}
                  onChange={(val) => setCategory(val)}
                  placeholder="Select category..."
                  searchPlaceholder="Search category..."
                  searchable={true}
                  triggerStyle={{ padding: '8px 12px', fontSize: '13px', height: '42px', background: 'var(--surface)' }}
                />
              </div>
            </div>

            {/* Description / Item Title */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                Description *
              </label>
              <input
                type="text"
                required
                placeholder={
                  type === 'income' ? 'e.g. Bulk order payment from VIP client' :
                  type === 'expense' ? 'e.g. Raw materials inventory restock (100 units)' :
                  type === 'receivable' ? 'e.g. Dispatch on 14-day credit terms' :
                  'e.g. Fabric supplier bill settlement'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                style={{ fontSize: 13, height: 38 }}
              />
            </div>

            {/* Date, Due Date, Reference */}
            <div style={{ display: 'grid', gridTemplateColumns: type === 'receivable' || type === 'payable' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="input"
                  style={{ fontSize: 12.5, height: 36 }}
                />
              </div>

              {(type === 'receivable' || type === 'payable') && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input"
                    style={{ fontSize: 12.5, height: 36 }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                  Ref / Invoice #
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-1082"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="input"
                  style={{ fontSize: 12.5, height: 36 }}
                />
              </div>
            </div>

            {/* Counterparty & Settlement Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                  {type === 'income' || type === 'receivable' ? 'Customer / Client Name' : 'Supplier / Vendor Name'}
                </label>
                <input
                  type="text"
                  placeholder={type === 'income' || type === 'receivable' ? 'e.g. Grace Adewale' : 'e.g. Prime Logistics Ltd'}
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="input"
                  style={{ fontSize: 13, height: 40 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                  Settlement Status
                </label>
                <SearchableSelect
                  options={[
                    { value: 'completed', label: 'Settled / Completed' },
                    { value: 'pending', label: 'Pending / Outstanding' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  value={status}
                  onChange={(val) => setStatus(val as any)}
                  placeholder="Select status..."
                  searchable={false}
                  triggerStyle={{ padding: '8px 12px', fontSize: '13px', height: '40px' }}
                />
              </div>
            </div>

            {/* Tax & Receipt File */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                  Tax / VAT ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="input"
                  style={{ fontSize: 13, height: 40 }}
                />
                <span style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                  Optional statutory tax component.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                  Receipt / Invoice Document
                </label>
                <FileUpload
                  previewUrl={receiptUrl}
                  uploading={receiptUploading}
                  onFile={async (file: File) => {
                    try {
                      setReceiptUploading(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      const res = await api.post<{ url: string }>('/v1/bookkeeping/upload-receipt', formData);
                      if (res.url) {
                        setReceiptUrl(res.url);
                        toast.success('Receipt attached.');
                      }
                    } catch (e) {
                      toast.error('Failed to upload receipt.');
                    } finally {
                      setReceiptUploading(false);
                    }
                  }}
                  onRemove={() => setReceiptUrl('')}
                  accept="image/*,application/pdf"
                  label="Attach receipt or bill"
                  hint="PNG, JPG, or PDF up to 10MB"
                />
              </div>
            </div>

            {/* Internal Memo / Notes */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }}>
                Internal Memo (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Add payment method reference, check number, or delivery terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                style={{ fontSize: 12.5, resize: 'vertical', minHeight: 52 }}
              />
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Press <kbd style={{ padding: '2px 5px', borderRadius: 'var(--r-sm)', background: 'var(--bg-2)', border: '1px solid var(--border)', fontSize: 10.5, fontWeight: 700 }}>Esc</kbd> to cancel
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary clickable"
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="bookkeeping-popup-form"
              className="btn btn-primary clickable"
              disabled={loading}
              style={{ padding: '8px 22px', fontSize: 13, fontWeight: 800, minWidth: 140 }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 className="spin" size={14} /> Saving...
                </span>
              ) : record ? (
                'Save Changes'
              ) : (
                'Record Entry'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
