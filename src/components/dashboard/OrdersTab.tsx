'use client';

import React from 'react';
import { Receipt } from 'lucide-react';
import { getOrderDisplayAmount, formatVal } from '@/utils/currency';
import type { Order, StoreInfo } from '@/types/dashboard';

interface OrdersTabProps {
  orders: Order[];
  store: StoreInfo | null;
  onViewOrder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
}

export default function OrdersTab({ orders, store, onViewOrder, onViewReceipt }: OrdersTabProps) {
  return (
    <div className="card animate-fade-in" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }} className="responsive-order-heading">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Customer Orders</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Confirm, ship, and generate receipts for custom purchases.</p>
        </div>
      </div>

      {/* Orders Table List (Desktop) */}
      <div className="desktop-table-view" style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 8px' }}>Order No</th>
              <th style={{ padding: '12px 8px' }}>Customer</th>
              <th style={{ padding: '12px 8px' }}>Date</th>
              <th style={{ padding: '12px 8px' }}>Amount</th>
              <th style={{ padding: '12px 8px' }}>Payment</th>
              <th style={{ padding: '12px 8px' }}>Order Status</th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid var(--border)', fontSize: 14 }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '16px 8px', fontWeight: 800, color: 'var(--primary)' }}>
                    {order.order_number}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <p style={{ fontWeight: 700 }}>{order.customer_name}</p>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer_phone}</span>
                  </td>
                  <td style={{ padding: '16px 8px', color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: 800 }}>
                    {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span className={`badge ${order.payment_status === 'paid' ? 'badge-primary' :
                      order.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'
                      }`} style={{ fontSize: 10 }}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span className={`badge ${order.order_status === 'completed' ? 'badge-primary' :
                      order.order_status === 'cancelled' || order.order_status === 'expired' ? 'badge-danger' :
                        order.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'
                      }`} style={{ fontSize: 10 }}>
                      {order.order_status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => onViewOrder(order)}
                        className="btn btn-outline clickable"
                        style={{ padding: '6px 10px', fontSize: 11.5, borderRadius: 'var(--r-sm)' }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onViewReceipt(order)}
                        className="btn btn-ghost clickable"
                        style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}
                        title="Receipt"
                      >
                        <Receipt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '40px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No orders found yet. Share your store link on WhatsApp to receive your first order!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orders Card List (Mobile) */}
      <div className="mobile-cards-view">
        {orders.length > 0 ? (
          orders.map(order => (
            <div
              key={order.id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14.5 }}>
                  {order.order_number}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{order.customer_name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{order.customer_phone}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${order.payment_status === 'paid' ? 'badge-primary' :
                    order.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'
                    }`} style={{ fontSize: 9 }}>
                    Pay: {order.payment_status}
                  </span>
                  <span className={`badge ${order.order_status === 'completed' ? 'badge-primary' :
                    order.order_status === 'cancelled' || order.order_status === 'expired' ? 'badge-danger' :
                      order.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'
                    }`} style={{ fontSize: 9 }}>
                    Status: {order.order_status}
                  </span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14.5 }}>
                  {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2 }}>
                <button
                  onClick={() => onViewOrder(order)}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, padding: '8px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  Inspect
                </button>
                <button
                  onClick={() => onViewReceipt(order)}
                  className="btn btn-ghost clickable"
                  style={{ padding: '8px 10px', borderRadius: 'var(--r-sm)', color: 'var(--primary)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <Receipt size={14} /> Receipt
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ padding: '24px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
            No orders found yet. Share your store link on WhatsApp to receive your first order!
          </p>
        )}
      </div>
    </div>
  );
}
