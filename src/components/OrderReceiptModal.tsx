'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Copy, 
  ShieldCheck, 
  ExternalLink, 
  Receipt, 
  CheckCircle2, 
  BadgeCheck, 
  Package 
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export interface OrderReceiptItem {
  id?: string;
  product_name: string;
  product_price: number | string;
  quantity: number;
  product?: {
    is_digital?: boolean;
    image_url?: string | null;
  } | null;
}

export interface OrderReceiptData {
  id: string;
  order_number: string;
  receipt_number?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  delivery_method?: string | null;
  delivery_address?: string | null;
  total_amount: number | string;
  currency_code?: string;
  payment_status?: string;
  payment_method?: string | null;
  created_at?: string;
  shipping_fee?: number | string | null;
  discount_amount?: number | string | null;
  frontstore_protect_fee?: number | string | null;
  store: {
    store_name: string;
    username?: string;
    whatsapp_phone?: string | null;
    is_verified?: boolean;
    logo_url?: string | null;
    currency_code?: string;
  };
  items: OrderReceiptItem[];
}

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderReceiptData | null;
}

export default function OrderReceiptModal({ isOpen, onClose, order }: OrderReceiptModalProps) {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen || !order) return null;

  const apiUrl = getApiUrl();
  const pdfDownloadUrl = `${apiUrl}/v1/orders/${order.id}/receipt/pdf`;
  const receiptNumber = order.receipt_number || `REC-${order.order_number}`;

  const currencySymbol = (() => {
    const code = (order.currency_code || order.store?.currency_code || 'NGN').toUpperCase();
    const map: Record<string, string> = {
      NGN: '₦',
      USD: '$',
      GBP: '£',
      EUR: '€',
      GHS: 'GH₵',
      KES: 'KSh',
      ZAR: 'R',
      CAD: 'CA$',
      AUD: 'A$',
    };
    return map[code] || `${code} `;
  })();

  const formatPrice = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `${currencySymbol}${isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
  const isDigital = order.delivery_method === 'digital' || order.items?.every(i => i.product?.is_digital);

  // Compute subtotal from items if available
  const itemsSubtotal = order.items?.reduce((sum, item) => {
    const p = parseFloat(String(item.product_price)) || 0;
    const q = item.quantity || 1;
    return sum + p * q;
  }, 0) || parseFloat(String(order.total_amount)) || 0;

  const discount = parseFloat(String(order.discount_amount || 0));
  const shipping = parseFloat(String(order.shipping_fee || 0));
  const protectFee = parseFloat(String(order.frontstore_protect_fee || 0));
  const totalPaid = parseFloat(String(order.total_amount)) || 0;

  const dateFormatted = order.created_at 
    ? new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

  return (
    <>
      {/* Inline styles for clean print handling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-order-receipt, #printable-order-receipt * {
            visibility: visible;
          }
          #printable-order-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="no-print"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Modal Dialog Card */}
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 540,
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Top Sticky Action Bar */}
          <div 
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Receipt size={17} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                Official Order Receipt
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={handlePrint}
                title="Print Receipt"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Printer size={14} /> Print
              </button>

              <a
                href={pdfDownloadUrl}
                download={`receipt-${order.order_number}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                title="Download PDF"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: '#075E54',
                  border: 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(7, 94, 84, 0.2)',
                }}
              >
                <Download size={14} /> PDF
              </a>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Receipt Body */}
          <div 
            id="printable-order-receipt"
            style={{
              padding: '24px 28px',
              overflowY: 'auto',
              background: '#ffffff',
              color: '#0f172a',
            }}
          >
            {/* Header / Store details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                {order.store?.logo_url && (
                  <img
                    src={order.store.logo_url}
                    alt={order.store.store_name}
                    style={{ height: 36, maxWidth: 120, objectFit: 'contain', borderRadius: 6, marginBottom: 8 }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                    {order.store?.store_name}
                  </h3>
                  {order.store?.is_verified && (
                    <BadgeCheck size={16} style={{ color: '#075E54', flexShrink: 0 }} />
                  )}
                </div>
                {order.store?.username && (
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    frontstore.ng/{order.store.username}
                  </p>
                )}
              </div>

              {/* Receipt / Status Pill */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: isPaid ? '#dcfce7' : '#fef3c7',
                    color: isPaid ? '#15803d' : '#b45309',
                    border: `1px solid ${isPaid ? '#86efac' : '#fde68a'}`,
                    marginBottom: 6,
                  }}
                >
                  {isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}
                </span>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                  {dateFormatted}
                </div>
              </div>
            </div>

            {/* Reference Numbers Grid */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Receipt No.
                </span>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#075E54', margin: '2px 0 0', fontFamily: 'monospace' }}>
                  {receiptNumber}
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Order Ref
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="no-print"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 11,
                      color: copiedRef ? '#15803d' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    {copiedRef ? <Check size={11} /> : <Copy size={11} />}
                    {copiedRef ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '2px 0 0', fontFamily: 'monospace' }}>
                  #{order.order_number}
                </p>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                paddingBottom: 16,
                borderBottom: '1px dashed #e2e8f0',
                marginBottom: 18,
                fontSize: 12.5,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Billed To
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: '4px 0 1px' }}>
                  {order.customer_name}
                </p>
                {order.customer_phone && (
                  <p style={{ color: '#475569', margin: 0, fontSize: 12 }}>
                    {order.customer_phone}
                  </p>
                )}
                {order.customer_email && (
                  <p style={{ color: '#475569', margin: 0, fontSize: 12 }}>
                    {order.customer_email}
                  </p>
                )}
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Fulfillment & Payment
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: '4px 0 1px' }}>
                  {isDigital ? 'Instant Digital Access' : (order.delivery_method === 'pickup' ? 'Store Pickup' : 'Standard Delivery')}
                </p>
                <p style={{ color: '#475569', margin: 0, fontSize: 12 }}>
                  Method: {order.payment_method ? (order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)) : 'Online Payment'}
                </p>
                {order.delivery_address && !isDigital && (
                  <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: 11.5 }}>
                    {order.delivery_address}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Purchased Items ({order.items?.length || 0})
              </span>

              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.items?.map((item, idx) => {
                  const unitPrice = parseFloat(String(item.product_price)) || 0;
                  const qty = item.quantity || 1;
                  const lineTotal = unitPrice * qty;

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        borderRadius: 12,
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            flexShrink: 0,
                          }}
                        >
                          <Package size={16} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.product_name}
                          </p>
                          <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                            Qty: {qty} × {formatPrice(unitPrice)}
                          </p>
                        </div>
                      </div>

                      <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginLeft: 12 }}>
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Totals Block */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatPrice(itemsSubtotal)}</span>
              </div>

              {shipping > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b' }}>
                  <span>Shipping & Handling</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatPrice(shipping)}</span>
                </div>
              )}

              {protectFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b' }}>
                  <span>Buyer Protection</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatPrice(protectFee)}</span>
                </div>
              )}

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#15803d' }}>
                  <span>Discount Applied</span>
                  <span style={{ fontWeight: 700 }}>-{formatPrice(discount)}</span>
                </div>
              )}

              <div style={{ height: 1, background: '#cbd5e1', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>Total Amount Paid</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#075E54' }}>
                  {formatPrice(totalPaid)}
                </span>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <ShieldCheck size={20} style={{ color: '#15803d', flexShrink: 0 }} />
              <p style={{ fontSize: 11.5, color: '#166534', margin: 0, lineHeight: 1.45 }}>
                <strong>Frontstore Escrow Protected:</strong> This purchase is backed by buyer protection. Funds are disbursed upon delivery or fulfillment verification.
              </p>
            </div>

            {/* Footer Notice */}
            <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: 14 }}>
              <p style={{ margin: 0 }}>
                Thank you for shopping with {order.store?.store_name}!
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 10 }}>
                Powered by Frontstore · Africa's #1 WhatsApp Commerce Platform
              </p>
            </div>
          </div>

          {/* Bottom Dialog Action Bar */}
          <div 
            className="no-print"
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #f1f5f9',
              background: '#ffffff',
              display: 'flex',
              gap: 10,
            }}
          >
            <a
              href={pdfDownloadUrl}
              download={`receipt-${order.order_number}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                background: '#075E54',
                color: '#ffffff',
                border: 'none',
                fontSize: 13.5,
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(7, 94, 84, 0.2)',
              }}
            >
              <Download size={16} /> Download PDF Receipt
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
