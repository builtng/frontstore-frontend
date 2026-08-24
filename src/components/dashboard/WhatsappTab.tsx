'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2, Zap, RefreshCw, Loader2, ChevronDown, Receipt, Check, Package, X, Eye, Search,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { getApiUrl } from '@/lib/api';
import { getCurrencySymbol, getOrderDisplayAmount, formatVal } from '@/utils/currency';
import type { Order, StoreInfo } from '@/types/dashboard';

interface WhatsappTabProps {
  isPro: boolean;
  store: StoreInfo | null;
  openUpgradePrompt: (title: string, description: string) => void;
  waOrders: Order[];
  waLoading: boolean;
  loadWaOrders: () => void;
  setWaOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  selectedWaOrder: Order | null;
  setSelectedWaOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  handleUpdatePaymentStatus: (orderId: string, status: string) => Promise<void>;
  handleUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  onViewFullDetails: (order: Order) => void;
}

export default function WhatsappTab({
  isPro, store, openUpgradePrompt, waOrders, waLoading, loadWaOrders, setWaOrders,
  selectedWaOrder, setSelectedWaOrder, handleUpdatePaymentStatus, handleUpdateOrderStatus,
  onViewFullDetails,
}: WhatsappTabProps) {
  const apiUrl = getApiUrl();
  const [waSearch, setWaSearch] = useState('');
  const [activeWaView, setActiveWaView] = useState<'list' | 'chat'>('list');
  const [sendingReceiptId, setSendingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (isPro && waOrders.length === 0 && !waLoading) {
      loadWaOrders();
    }
  }, [isPro]);

  const handleSendReceipt = async (orderId: string, phone: string) => {
    setSendingReceiptId(orderId);
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/send-receipt`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send receipt.');
      toast.success('📄 Receipt PDF sent to customer via WhatsApp!');
      if (json.pdf_url) {
        window.open(json.pdf_url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not send receipt.');
    } finally {
      setSendingReceiptId(null);
    }
  };

  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <WhatsAppIcon size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>WhatsApp Inbox</h2>
        <p style={{ fontSize: 11.5, fontWeight: 800, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Chat & Order Management</p>
        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Manage every WhatsApp order and conversation from one inbox — reply, send receipts, and follow up on unpaid orders without leaving your dashboard.
        </p>

        <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>All WhatsApp orders in one inbox</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Quick reply & receipt templates</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Real-time unpaid order alerts</span>
          </div>
        </div>

        <button
          onClick={() => openUpgradePrompt(
            'WhatsApp Inbox requires Pro',
            'The dedicated WhatsApp inbox for managing orders and conversations is available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock Inbox
        </button>
      </div>
    );
  }

  const sym = getCurrencySymbol(store?.currency_code);
  const filtered = waOrders.filter(o =>
    !waSearch ||
    (o.customer_name || '').toLowerCase().includes(waSearch.toLowerCase()) ||
    (o.customer_phone || '').includes(waSearch) ||
    (o.order_number || '').toLowerCase().includes(waSearch.toLowerCase())
  );
  const buildReplyMsg = (order: Order) => encodeURIComponent(
    `Hi ${order.customer_name}! This is ${store?.store_name || 'us'} 🛖\n\nRegarding your Order *#${order.order_number}* — ${sym}${parseFloat(order.total_amount as string || '0').toLocaleString()}\n\nStatus: ${(order.order_status || '').toUpperCase()} | Payment: ${(order.payment_status || '').toUpperCase()}\n\nFeel free to reply with any questions!`
  );
  const buildReceiptMsg = (order: Order) => {
    const items = order.items?.map(i =>
      `- ${i.quantity}x ${i.product_name} @ ${sym}${parseFloat(i.product_price as string || '0').toLocaleString()}`
    ).join('\n') || `- Order total: ${sym}${parseFloat(order.total_amount as string || '0').toLocaleString()}`;
    return encodeURIComponent(
      `🧾 *RECEIPT — ${store?.store_name}*\n\nOrder: *#${order.order_number}*\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\n${items}\n\n*TOTAL: ${sym}${parseFloat(order.total_amount as string || '0').toLocaleString()}*\nStatus: ${(order.payment_status || '').toUpperCase()}\n\nThank you for your purchase! 🎉`
    );
  };
  const cleanPhone = (p: string | null | undefined) => (p || '').replace(/\D/g, '');
  return (
    <div className="card animate-fade-in whatsapp-chat-shell" style={{ padding: 0, height: 'calc(100vh - 160px)', display: 'flex', overflow: 'hidden' }}>
      {/* Left Panel — Contacts */}
      <div style={{ width: 300, borderRight: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column' }} className={`wa-contacts-panel ${activeWaView === 'list' ? 'wa-mobile-show' : 'wa-mobile-hide'}`}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900 }}>WhatsApp Inbox</h3>
            <button onClick={() => { loadWaOrders(); toast.success('Refreshing inbox...'); }} className="btn btn-ghost clickable" style={{ padding: 6, color: 'var(--primary)' }} title="Refresh"><RefreshCw size={14} /></button>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8 }}>AI Conversational assistant replying to your customer chats 24/7.</p>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search by name, phone, order #..." value={waSearch} onChange={e => setWaSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 30px', fontSize: 12.5, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', outline: 'none', color: 'var(--text)' }} />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8 }}>
            {waOrders.length} WA order{waOrders.length !== 1 ? 's' : ''} • {waOrders.filter(o => o.payment_status === 'unpaid').length} unpaid
          </p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {waLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)', gap: 8 }}>
              <Loader2 size={20} className="spinner" style={{ color: 'var(--primary)' }} /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <WhatsAppIcon size={32} color="var(--text-faint)" />
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: 700 }}>{waSearch ? 'No contacts match.' : 'No WhatsApp orders yet.'}</p>
              {!waSearch && <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 6, lineHeight: 1.5 }}>When customers message your WhatsApp number, their orders appear here automatically.</p>}
            </div>
          ) : (
            filtered.map(order => {
              const isSelected = selectedWaOrder?.id === order.id;
              const initials = (order.customer_name || 'Customer').split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
              const isUnpaid = order.payment_status === 'unpaid';
              return (
                <div key={order.id} onClick={() => { setSelectedWaOrder(order); setActiveWaView('chat'); }} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : 'transparent', border: isSelected ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: isUnpaid ? 'rgba(234,179,8,0.12)' : '#25d36618', color: isUnpaid ? '#d97706' : '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, border: `2px solid ${isUnpaid ? '#d97706' : '#25d366'}33` }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{order.customer_name}</p>
                      <span style={{ fontSize: 10, color: 'var(--text-faint)', flexShrink: 0, marginLeft: 4 }}>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{order.order_number}</p>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-full)', background: order.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(234,179,8,0.12)', color: order.payment_status === 'paid' ? 'var(--primary)' : '#d97706', textTransform: 'uppercase' }}>{order.payment_status}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-full)', background: 'var(--bg-2)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{order.order_status}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', marginLeft: 'auto' }}>{(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel — Order Detail */}
      <div className={`wa-chat-viewport ${activeWaView === 'chat' ? 'wa-mobile-show' : 'wa-mobile-hide'}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflowY: 'auto' }}>
        {!selectedWaOrder ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
            <WhatsAppIcon size={48} color="var(--text-faint)" />
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Select a conversation</p>
              <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4 }}>Pick a WhatsApp order on the left to manage it here.</p>
            </div>
          </div>
        ) : (() => {
          const o = selectedWaOrder;
          const phone = o.customer_whatsapp || o.customer_phone;
          const waPhone = cleanPhone(phone);
          const initials = (o.customer_name || 'Customer').split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
          return (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setActiveWaView('list')} className="btn btn-ghost wa-back-button" style={{ display: 'none', padding: 6, marginLeft: -6, color: 'var(--text-muted)' }}><ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} /></button>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25d36618', border: '2px solid #25d36633', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>{initials}</div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800 }}>{o.customer_name}</h4>
                    <span style={{ fontSize: 11, color: '#25d366', fontWeight: 700 }}>{phone}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={`https://wa.me/${waPhone}?text=${buildReplyMsg(o)}`} target="_blank" rel="noreferrer" className="btn clickable" style={{ padding: '7px 14px', fontSize: 12, borderRadius: 'var(--r-sm)', background: '#25d366', color: '#fff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                    <WhatsAppIcon size={14} color="#fff" /> Reply on WhatsApp
                  </a>
                  <button
                    onClick={() => handleSendReceipt(o.id, o.customer_whatsapp || o.customer_phone || '')}
                    disabled={sendingReceiptId === o.id}
                    className="btn btn-outline clickable"
                    style={{ padding: '7px 14px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Generate PDF receipt & send to customer via WhatsApp"
                  >
                    {sendingReceiptId === o.id ? (
                      <><Loader2 size={13} className="spinner" /> Sending...</>
                    ) : (
                      <><Receipt size={13} /> Send Receipt PDF</>
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Order Summary */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order</span>
                      <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{o.order_number}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{sym}{(parseFloat(o.total_amount as string || '0') || 0).toLocaleString()}</span>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <span className={`badge ${o.payment_status === 'paid' ? 'badge-primary' : o.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'}`} style={{ fontSize: 10 }}>{o.payment_status}</span>
                        <span className={`badge ${o.order_status === 'completed' ? 'badge-primary' : o.order_status === 'cancelled' || o.order_status === 'expired' ? 'badge-danger' : o.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'}`} style={{ fontSize: 10 }}>{o.order_status}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</span>
                      <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{o.customer_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{phone}</p>
                    </div>
                    {o.delivery_address && (
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</span>
                        <p style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: 'var(--text-2)' }}>{o.delivery_address}</p>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Method</span>
                      <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>{o.delivery_method || 'delivery'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {o.items && o.items.length > 0 && (
                  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Items Ordered</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {o.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 700 }}>{item.product_name}</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Qty: {item.quantity} × {sym}{(parseFloat(item.product_price as string || '0') || 0).toLocaleString()}</p>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{sym}{((parseFloat(item.product_price as string || '0') || 0) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>Quick Actions</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {o.payment_status !== 'paid' && (
                      <button onClick={async () => { await handleUpdatePaymentStatus(o.id, 'paid'); const updated = { ...o, payment_status: 'paid' }; setSelectedWaOrder(updated as Order); setWaOrders(prev => prev.map(x => x.id === o.id ? updated as Order : x)); }} className="btn btn-primary clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <Check size={14} /> Mark Paid
                      </button>
                    )}
                    {o.order_status !== 'completed' && o.order_status !== 'cancelled' && (
                      <button onClick={async () => { await handleUpdateOrderStatus(o.id, 'completed'); const updated = { ...o, order_status: 'completed' }; setSelectedWaOrder(updated as Order); setWaOrders(prev => prev.map(x => x.id === o.id ? updated as Order : x)); }} className="btn btn-outline clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                        <Package size={14} /> Mark Shipped
                      </button>
                    )}
                    {o.order_status !== 'cancelled' && (
                      <button onClick={async () => { await handleUpdateOrderStatus(o.id, 'cancelled'); const updated = { ...o, order_status: 'cancelled' }; setSelectedWaOrder(updated as Order); setWaOrders(prev => prev.map(x => x.id === o.id ? updated as Order : x)); }} className="btn btn-outline clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        <X size={14} /> Cancel Order
                      </button>
                    )}
                    <button onClick={() => onViewFullDetails(o)} className="btn btn-ghost clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Eye size={14} /> Full Details
                    </button>
                  </div>
                </div>

              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
