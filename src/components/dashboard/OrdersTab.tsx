'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt, Search, ShoppingBag, Eye, ArrowUpRight,
  Filter, CheckCircle2, Clock, XCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { getOrderDisplayAmount, formatVal } from '@/utils/currency';
import type { Order, StoreInfo } from '@/types/dashboard';

interface OrdersTabProps {
  orders: Order[];
  store: StoreInfo | null;
  onViewOrder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
}

export default function OrdersTab({ orders, store, onViewOrder, onViewReceipt }: OrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.order_status === 'pending').length,
      confirmed: orders.filter(o => o.order_status === 'confirmed').length,
      completed: orders.filter(o => o.order_status === 'completed').length,
      cancelled: orders.filter(o => o.order_status === 'cancelled' || o.order_status === 'expired').length,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter === 'pending' && order.order_status !== 'pending') return false;
      if (statusFilter === 'confirmed' && order.order_status !== 'confirmed') return false;
      if (statusFilter === 'completed' && order.order_status !== 'completed') return false;
      if (statusFilter === 'cancelled' && order.order_status !== 'cancelled' && order.order_status !== 'expired') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.order_number?.toLowerCase().includes(q);
        const matchesName = order.customer_name?.toLowerCase().includes(q);
        const matchesPhone = order.customer_phone?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesPhone) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span style={{
            fontSize: 11,
            fontWeight: 750,
            padding: '3px 8px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(18, 140, 126, 0.1)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
            Completed
          </span>
        );
      case 'confirmed':
        return (
          <span style={{
            fontSize: 11,
            fontWeight: 750,
            padding: '3px 8px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            Confirmed
          </span>
        );
      case 'cancelled':
      case 'expired':
        return (
          <span style={{
            fontSize: 11,
            fontWeight: 750,
            padding: '3px 8px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
            Cancelled
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: 11,
            fontWeight: 750,
            padding: '3px 8px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--primary)', background: 'rgba(18, 140, 126, 0.08)', padding: '2px 7px', borderRadius: 'var(--r-sm)' }}>
            Paid
          </span>
        );
      case 'refunded':
        return (
          <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', padding: '2px 7px', borderRadius: 'var(--r-sm)' }}>
            Refunded
          </span>
        );
      default:
        return (
          <span style={{ fontSize: 11, fontWeight: 750, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)', padding: '2px 7px', borderRadius: 'var(--r-sm)' }}>
            Unpaid
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Customer Orders
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Track fulfillments, confirm payments, and dispatch receipts to buyers.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{
        padding: 0,
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Controls Toolbar: Search & Tabs */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          background: 'var(--bg)'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }} className="no-scrollbar">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(tab => {
              const active = statusFilter === tab;
              const label = tab.charAt(0).toUpperCase() + tab.slice(1);
              const count = counts[tab];

              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className="clickable"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--r-full)',
                    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: active ? 'var(--primary-light)' : 'var(--surface)',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: 12.5,
                    fontWeight: active ? 800 : 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{label}</span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 'var(--r-full)',
                    background: active ? 'var(--primary)' : 'var(--bg-2)',
                    color: active ? '#fff' : 'var(--text-faint)'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <input
              type="text"
              placeholder="Search by order #, name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                fontSize: 12.5,
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="desktop-table-view" style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 680 }}>
            <thead>
              <tr style={{
                background: 'var(--bg-2)',
                borderBottom: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)'
              }}>
                <th style={{ padding: '12px 18px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Payment</th>
                <th style={{ padding: '12px 16px' }}>Fulfillment</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: idx < filteredOrders.length - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: 13.5,
                      transition: 'background 0.15s ease'
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'var(--bg-2)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 11,
                          flexShrink: 0
                        }}>
                          {(order.customer_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 750, color: 'var(--text)', lineHeight: 1.2 }}>{order.customer_name || 'Anonymous'}</p>
                          <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{order.customer_phone}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                        {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onViewOrder(order)}
                          className="btn btn-outline clickable"
                          style={{
                            padding: '5px 10px',
                            fontSize: 12,
                            borderRadius: 'var(--r-md)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 700,
                            background: 'var(--surface)'
                          }}
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        <button
                          onClick={() => onViewReceipt(order)}
                          className="btn btn-ghost clickable"
                          style={{ padding: '5px 8px', borderRadius: 'var(--r-md)', color: 'var(--primary)' }}
                          title="Generate Receipt"
                        >
                          <Receipt size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, maxWidth: 360, margin: '0 auto' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={20} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 750, color: 'var(--text)' }}>
                        {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No orders received yet'}
                      </p>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try resetting your search query or changing the status filter.'
                          : 'Share your storefront catalog on WhatsApp to start generating customer checkouts.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-cards-view" style={{ padding: 12, display: 'none', flexDirection: 'column', gap: 10 }}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div
                key={order.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--r-lg)',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13.5 }}>
                    {order.order_number}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 750, fontSize: 13.5 }}>{order.customer_name || 'Anonymous'}</p>
                    <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{order.customer_phone}</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>
                    {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {getPaymentBadge(order.payment_status)}
                    {getStatusBadge(order.order_status)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onViewOrder(order)}
                      className="btn btn-outline clickable"
                      style={{ padding: '4px 8px', fontSize: 11.5, borderRadius: 'var(--r-md)' }}
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onViewReceipt(order)}
                      className="btn btn-ghost clickable"
                      style={{ padding: '4px 6px', borderRadius: 'var(--r-md)', color: 'var(--primary)' }}
                    >
                      <Receipt size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ padding: '24px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
              No orders found matching your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
