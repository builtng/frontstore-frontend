'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt, Search, ShoppingBag, Eye, ArrowUpRight,
  Filter, CheckCircle2, Clock, XCircle, AlertCircle, Sparkles,
  DollarSign, Check, ChevronRight, MessageCircle, Send,
  TrendingUp, ArrowDownRight, User, Phone, Calendar
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { getOrderDisplayAmount, getCurrencySymbol, formatVal } from '@/utils/currency';
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

  const currency = getCurrencySymbol(store?.currency_code);

  // Counts and metrics for summary ribbon
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.order_status === 'pending').length;
    const completed = orders.filter(o => o.order_status === 'completed').length;
    const cancelled = orders.filter(o => o.order_status === 'cancelled' || o.order_status === 'expired').length;

    const totalRevenue = orders.reduce((sum, o) => {
      if (o.order_status !== 'cancelled' && o.order_status !== 'expired') {
        const amt = typeof o.total_amount === 'string' ? parseFloat(o.total_amount) : (o.total_amount || 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }
      return sum;
    }, 0);

    return {
      all: total,
      pending,
      confirmed: orders.filter(o => o.order_status === 'confirmed').length,
      completed,
      cancelled,
      totalRevenue,
      fulfillmentRate: total > 0 ? Math.round((completed / total) * 100) : 100,
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
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(11, 93, 57, 0.1)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
            Fulfilled
          </span>
        );
      case 'confirmed':
        return (
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
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
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
            Cancelled
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#d97706',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            Pending Action
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Check size={11} strokeWidth={3} /> Paid
          </span>
        );
      case 'refunded':
        return (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', padding: '2px 8px', borderRadius: 'var(--r-sm)' }}>
            Refunded
          </span>
        );
      default:
        return (
          <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', background: 'rgba(245, 158, 11, 0.08)', padding: '2px 8px', borderRadius: 'var(--r-sm)' }}>
            Unpaid
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      
      {/* ── HEADER & SUMMARY STATS RIBBON ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 2.5vw, 26px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
            Order Management
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Process incoming customer checkouts, confirm payments, and dispatch receipts directly to buyers.
          </p>
        </div>
      </div>

      {/* Mini KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Orders
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.all}
          </p>
        </div>

        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Awaiting Fulfillment
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.pending}
          </p>
        </div>

        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Fulfilled
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.completed}
          </p>
        </div>

        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Processed Revenue
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {currency}{formatVal(metrics.totalRevenue)}
          </p>
        </div>
      </div>

      {/* ── MAIN ORDERS TABLE CARD ── */}
      <div className="card" style={{
        padding: 0,
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Controls Toolbar: Search & Segmented Filter */}
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
              const label = tab === 'all' ? 'All Orders' : tab.charAt(0).toUpperCase() + tab.slice(1);
              const count = metrics[tab];

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`filter-chip-btn ${active ? 'active' : ''}`}
                >
                  <span>{label}</span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 'var(--r-full)',
                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg-2)',
                    color: active ? '#fff' : 'var(--text-muted)'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
            <input
              type="text"
              placeholder="Search by order #, buyer name, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="dash-omni-input"
              style={{ padding: '8px 12px 8px 34px', fontSize: 12.5 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="desktop-table-view" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="table-stream">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', fontSize: 12.5 }}>
                        {order.order_number || `#${order.id?.slice(0, 6)}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: 'var(--bg-2)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 12,
                          flexShrink: 0
                        }}>
                          {(order.customer_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 750, color: 'var(--text)', margin: 0, fontSize: 13.5 }}>{order.customer_name || 'Anonymous Buyer'}</p>
                          <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{order.customer_phone}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', fontSize: 13.5 }}>
                        {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
                      </span>
                    </td>
                    <td>
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td>
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onViewOrder(order)}
                          className="btn btn-outline clickable"
                          style={{
                            padding: '5px 11px',
                            fontSize: 12,
                            borderRadius: 'var(--r-md)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 700,
                            background: 'var(--surface)'
                          }}
                        >
                          <Eye size={13} /> View Order
                        </button>
                        <button
                          onClick={() => onViewReceipt(order)}
                          className="btn btn-ghost clickable"
                          style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', color: 'var(--primary)' }}
                          title="Generate Receipt"
                        >
                          <Receipt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '52px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, maxWidth: 380, margin: '0 auto' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={22} />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                        {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No customer orders recorded yet'}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try resetting your search query or switching the status filter pill.'
                          : 'Share your WhatsApp catalog link with your customers to start seeing instant checkouts.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-cards-view" style={{ padding: 14, display: 'none', flexDirection: 'column', gap: 12 }}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div
                key={order.id}
                style={{
                  padding: 16,
                  borderRadius: 'var(--r-xl)',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13, fontFamily: 'monospace' }}>
                    {order.order_number || `#${order.id?.slice(0, 6)}`}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 750, fontSize: 14, margin: 0 }}>{order.customer_name || 'Anonymous Buyer'}</p>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{order.customer_phone}</span>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>
                    {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {getPaymentBadge(order.payment_status)}
                    {getStatusBadge(order.order_status)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onViewOrder(order)}
                      className="btn btn-outline clickable"
                      style={{ padding: '5px 10px', fontSize: 12, borderRadius: 'var(--r-md)' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => onViewReceipt(order)}
                      className="btn btn-ghost clickable"
                      style={{ padding: '5px 8px', borderRadius: 'var(--r-md)', color: 'var(--primary)' }}
                    >
                      <Receipt size={16} />
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
