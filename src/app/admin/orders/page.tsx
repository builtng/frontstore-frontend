'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Search,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';

export default function AdminOrdersPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLastPage, setOrdersLastPage] = useState(1);

  const loadOrders = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setOrdersLoading(true);
      const url = `${apiUrl}/v1/admin/orders?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch platform orders.');
      setOrders(json.data?.data || []);
      setOrdersPage(json.data?.current_page || 1);
      setOrdersLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrders(1, ordersSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Platform Transaction Audit</h2>
          <p>Monitor customer orders, payment status, and order totals across all merchants.</p>
        </div>
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            loadOrders(1, ordersSearch);
          }}
        >
          <Search size={16} />
          <input
            value={ordersSearch}
            onChange={(event) => setOrdersSearch(event.target.value)}
            placeholder="Search orders, store name, customer name"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Store</th>
              <th>Customer details</th>
              <th>Subtotal</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : orders.length ? (
              orders.map((order) => {
                const dateStr = new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const orderCurrencySymbols: Record<string, string> = {
                  NGN: '₦',
                  GHS: 'GH₵',
                  KES: 'KSh',
                  ZAR: 'R',
                  USD: '$',
                  GBP: '£',
                };
                const orderCurrencyCode = order.store?.currency_code?.toUpperCase();
                const currencySymbol = orderCurrencyCode
                  ? orderCurrencySymbols[orderCurrencyCode] || `${orderCurrencyCode} `
                  : '₦';
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.order_number}</strong>
                      <span style={{ textTransform: 'uppercase' }}>
                        {order.payment_method ? order.payment_method.toUpperCase() : 'WHATSAPP'}
                      </span>
                    </td>
                    <td>
                      <strong>{order.store?.store_name || 'Unknown Store'}</strong>
                      <span>@{order.store?.username}</span>
                    </td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <span>{order.customer_phone || order.customer_email}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>
                        {currencySymbol}
                        {Number(order.total_amount || 0).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <StatusChip
                          tone={order.payment_status === 'paid' ? 'green' : 'red'}
                          label={`Payment: ${order.payment_status}`}
                        />
                        <StatusChip
                          tone={
                            order.order_status === 'completed'
                              ? 'green'
                              : order.order_status === 'cancelled'
                              ? 'red'
                              : 'gray'
                          }
                          label={`Order: ${order.order_status}`}
                        />
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12 }}>{dateStr}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState label="No orders match this search." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ordersLastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadOrders(ordersPage - 1, ordersSearch)} disabled={ordersPage === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {ordersPage} of {ordersLastPage}
          </span>
          <button
            type="button"
            onClick={() => loadOrders(ordersPage + 1, ordersSearch)}
            disabled={ordersPage === ordersLastPage}
          >
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
