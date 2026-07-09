'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BarChart3, ShoppingBag, Package, Settings as SettingsIcon, ArrowRight,
  RefreshCw, Search, Menu, X, Plus, Edit2, Trash2, Send, ArrowUpRight,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

type DemoTab = 'overview' | 'orders' | 'products' | 'whatsapp' | 'settings';

const NAV_ITEMS: { id: DemoTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
  { id: 'products', label: 'My Products', icon: <Package size={18} /> },
  { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={18} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
];

const DEMO_STORE = { name: "Amara's Boutique", username: 'amarasboutique', currency: '₦' };

const DEMO_STATS = {
  revenue: 482500,
  ordersTotal: 96,
  ordersPending: 8,
  ordersShipped: 84,
  views: 3210,
  waRedirects: 812,
  conversion: 25.3,
};

const WEEKLY_TRAFFIC = [
  { day: 'Mon', views: 30, wa: 10 },
  { day: 'Tue', views: 45, wa: 15 },
  { day: 'Wed', views: 75, wa: 22 },
  { day: 'Thu', views: 50, wa: 18 },
  { day: 'Fri', views: 90, wa: 30 },
  { day: 'Sat', views: 120, wa: 42 },
  { day: 'Sun', views: 80, wa: 25 },
];

const DEMO_PRODUCTS = [
  { id: 1, name: 'Ankara Wrap Dress', price: 18500, stock: 12, color: 'hsl(340, 70%, 50%)' },
  { id: 2, name: 'Beaded Clutch Bag', price: 9200, stock: 24, color: 'hsl(28, 80%, 50%)' },
  { id: 3, name: 'Kente Print Kaftan', price: 22000, stock: 6, color: 'hsl(200, 70%, 45%)' },
  { id: 4, name: 'Gold Hoop Earrings', price: 5400, stock: 40, color: 'hsl(45, 90%, 45%)' },
  { id: 5, name: 'Adire Head Wrap', price: 4200, stock: 30, color: 'hsl(150, 60%, 40%)' },
  { id: 6, name: 'Leather Sandals', price: 13500, stock: 15, color: 'hsl(20, 50%, 35%)' },
];

const DEMO_ORDERS = [
  { id: 'ORD-1042', customer: 'Ngozi Umeh', product: 'Ankara Wrap Dress', amount: 18500, status: 'pending', date: '2 hours ago' },
  { id: 'ORD-1041', customer: 'Tunde Bakare', product: 'Leather Sandals', amount: 13500, status: 'shipped', date: '5 hours ago' },
  { id: 'ORD-1040', customer: 'Blessing Okoro', product: 'Beaded Clutch Bag', amount: 9200, status: 'completed', date: 'Yesterday' },
  { id: 'ORD-1039', customer: 'Emeka Nwosu', product: 'Gold Hoop Earrings', amount: 5400, status: 'completed', date: 'Yesterday' },
  { id: 'ORD-1038', customer: 'Fatima Sule', product: 'Kente Print Kaftan', amount: 22000, status: 'cancelled', date: '2 days ago' },
  { id: 'ORD-1037', customer: 'Chidi Eze', product: 'Adire Head Wrap', amount: 4200, status: 'shipped', date: '3 days ago' },
] as const;

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'hsl(38, 92%, 95%)', color: 'hsl(32, 95%, 40%)', label: 'Pending' },
  shipped: { bg: 'var(--primary-light)', color: 'var(--primary)', label: 'Shipped' },
  completed: { bg: 'hsl(142, 71%, 95%)', color: 'hsl(142, 71%, 35%)', label: 'Completed' },
  cancelled: { bg: 'hsl(0, 72%, 96%)', color: 'hsl(0, 72%, 50%)', label: 'Cancelled' },
};

const DEMO_CHAT = [
  { from: 'customer', text: 'Hi! Is the Ankara Wrap Dress still available in size M?' },
  { from: 'merchant', text: 'Yes it is 🙌 Size M, ₦18,500. Want me to send the payment link?' },
  { from: 'customer', text: 'Yes please' },
  { from: 'merchant', text: "Here you go: frontstore.ng/pay/ord-1042 — once paid I'll ship same day 📦" },
  { from: 'customer', text: 'Just paid ✅' },
] as const;

const DEMO_CONTACTS = [
  { name: 'Ngozi Umeh', preview: 'Just paid ✅', time: '2h', unread: 0, active: true },
  { name: 'Tunde Bakare', preview: 'Thank you, order received!', time: '5h', unread: 0, active: false },
  { name: 'Blessing Okoro', preview: 'Do you have this in blue?', time: '1d', unread: 2, active: false },
  { name: 'Fatima Sule', preview: 'I need to cancel my order', time: '2d', unread: 0, active: false },
];

function formatMoney(amount: number) {
  return `${DEMO_STORE.currency}${amount.toLocaleString()}`;
}

export default function DemoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DemoTab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const locked = (message?: string) => {
    toast('This is a live demo', {
      description: message || 'Create your free store to manage real products, orders, and customers.',
      action: { label: 'Sign up free', onClick: () => router.push('/signup') },
    });
  };

  const bannerHeight = showBanner ? 44 : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {showBanner && (
        <div style={{
          height: bannerHeight,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '0 16px',
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'center',
          position: 'relative',
        }}>
          <span>🟢 You&apos;re viewing a live demo with sample data — nothing here is real</span>
          <a href="/signup" style={{ color: '#fff', textDecoration: 'underline', whiteSpace: 'nowrap' }}>Create your free store</a>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss banner"
            style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* ── SIDEBAR (Desktop) ── */}
        <aside className="glass demo-aside" style={{
          width: 260,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          position: 'sticky',
          top: bannerHeight,
          height: `calc(100vh - ${bannerHeight}px)`,
          alignSelf: 'flex-start',
          padding: '24px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingLeft: 8 }}>
            <img src="/logo.png" alt="Frontstore" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>frontstore</h1>
              <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Demo</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 'var(--r-lg)', marginBottom: 24, border: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-heading)' }}>
              A
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{DEMO_STORE.name}</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{DEMO_STORE.username}</span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {NAV_ITEMS.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="clickable"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 14px', borderRadius: 'var(--r-md)', border: 'none',
                    background: active ? 'var(--primary-light)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: 14.5, fontWeight: active ? 750 : 600, textAlign: 'left',
                  }}
                >
                  {item.icon}
                  <span style={{ flex: 1 }}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
              <ThemeToggle />
            </div>
            <a
              href="/signup"
              className="btn btn-primary clickable"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--r-md)', textDecoration: 'none' }}
            >
              Create your free store <ArrowRight size={14} />
            </a>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header className="glass demo-header" style={{
            position: 'sticky', top: bannerHeight, zIndex: 30,
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setMobileOpen(true)}
                className="demo-mobile-burger"
                style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
              >
                <Menu size={22} />
              </button>
              <div className="demo-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
                <Logo size={22} textColor="var(--primary)" text="Frontstore" />
              </div>
            </div>

            <div style={{ position: 'relative', flex: 1, maxWidth: 420, margin: '0 16px' }} className="demo-search">
              <input
                readOnly
                onFocus={() => locked('Search is disabled in the demo.')}
                placeholder="⚡ Search or command..."
                style={{
                  width: '100%', padding: '9px 12px 9px 36px', fontSize: 13,
                  background: 'var(--bg-2)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-lg)', outline: 'none', color: 'var(--text)',
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => locked('Live sync is only available on a real store.')}
                className="btn btn-outline clickable"
                style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <RefreshCw size={14} />
                <span className="demo-desktop-text">Sync Live</span>
              </button>
              <button
                onClick={() => locked('Your store gets a real shareable link like frontstore.ng/yourstore.')}
                className="btn btn-primary clickable"
                style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <span className="demo-desktop-text">Visit Store</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </header>

          <div style={{ padding: 'clamp(16px, 4vw, 32px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Dashboard Overview</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sample analytics for {DEMO_STORE.name} — this is what you&apos;ll see from day one.</p>
                </div>

                <div className="responsive-stats-grid">
                  <div className="card hover-lift" style={{ padding: 20 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Revenue</span>
                    <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>{formatMoney(DEMO_STATS.revenue)}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Excludes cancelled orders</span>
                  </div>
                  <div className="card hover-lift" style={{ padding: 20 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
                    <p style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: 8 }}>{DEMO_STATS.ordersTotal}</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11 }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{DEMO_STATS.ordersPending} pending</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{DEMO_STATS.ordersShipped} shipped</span>
                    </div>
                  </div>
                  <div className="card hover-lift" style={{ padding: 20 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storefront Views</span>
                    <p style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: 8 }}>{DEMO_STATS.views.toLocaleString()}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Total catalog product clicks</span>
                  </div>
                  <div className="card hover-lift" style={{ padding: 20 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp Redirects</span>
                    <p style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: 8 }}>{DEMO_STATS.waRedirects.toLocaleString()}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Redirects to initiate checkout</span>
                  </div>
                  <div className="card hover-lift" style={{ padding: 20, background: 'linear-gradient(135deg, var(--surface), rgba(16, 185, 102, 0.05))' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conversion Rate</span>
                    <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>{DEMO_STATS.conversion}%</p>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>WhatsApp clicks vs page views</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }} className="demo-chart-grid">
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800 }}>Weekly Traffic & Redirects</h3>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Last 7 Days</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, padding: '0 10px', borderBottom: '1px solid var(--border)' }}>
                      {WEEKLY_TRAFFIC.map((item, idx) => {
                        const maxVal = 130;
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: 4, width: '70%', height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                              <div style={{ height: `${(item.views / maxVal) * 100}%`, width: 8, background: 'var(--primary)', opacity: 0.35, borderRadius: '4px 4px 0 0' }} title={`Views: ${item.views}`} />
                              <div style={{ height: `${(item.wa / maxVal) * 100}%`, width: 8, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} title={`WhatsApp Clicks: ${item.wa}`} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center', fontSize: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                        <span style={{ width: 10, height: 10, background: 'var(--primary)', opacity: 0.35, borderRadius: '50%' }} /> Catalog Views
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                        <span style={{ width: 10, height: 10, background: 'var(--primary)', borderRadius: '50%' }} /> WhatsApp checkouts
                      </span>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Recent Orders</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {DEMO_ORDERS.slice(0, 5).map(order => {
                        const s = STATUS_STYLES[order.status];
                        return (
                          <div key={order.id} className="table-row-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: 'var(--r-md)' }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customer}</p>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.product}</span>
                            </div>
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: s.color, background: s.bg, padding: '3px 8px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap' }}>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>My Orders</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Orders placed on {DEMO_STORE.name}&apos;s storefront and WhatsApp.</p>
                </div>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Order', 'Customer', 'Product', 'Amount', 'Status', 'Date', ''].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DEMO_ORDERS.map(order => {
                        const s = STATUS_STYLES[order.status];
                        return (
                          <tr key={order.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700 }}>{order.id}</td>
                            <td style={{ padding: '14px 16px', fontSize: 13 }}>{order.customer}</td>
                            <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{order.product}</td>
                            <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700 }}>{formatMoney(order.amount)}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: 10.5, fontWeight: 800, color: s.color, background: s.bg, padding: '3px 8px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap' }}>{s.label}</span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{order.date}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <button onClick={() => locked()} className="btn btn-ghost clickable" style={{ padding: '6px 12px', fontSize: 12 }}>View</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>My Products</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{DEMO_PRODUCTS.length} products in {DEMO_STORE.name}&apos;s catalog.</p>
                  </div>
                  <button onClick={() => locked('Add products in seconds once your store is live.')} className="btn btn-primary clickable" style={{ padding: '10px 18px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> Add Product
                  </button>
                </div>
                <div className="demo-products-grid">
                  {DEMO_PRODUCTS.map(product => (
                    <div key={product.id} className="card hover-lift" style={{ overflow: 'hidden' }}>
                      <div style={{ height: 140, background: product.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                        {product.name.charAt(0)}
                      </div>
                      <div style={{ padding: 14 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{product.name}</p>
                        <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--primary)', marginBottom: 6 }}>{formatMoney(product.price)}</p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{product.stock} in stock</span>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button onClick={() => locked()} className="btn btn-outline clickable" style={{ flex: 1, padding: '8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => locked()} className="btn btn-ghost clickable" style={{ padding: '8px', color: 'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }} className="animate-fade-in">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>WhatsApp Inbox</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Every order and question lands here — no separate app to check.</p>
                </div>
                <div className="card demo-wa-shell" style={{ display: 'flex', flex: 1, minHeight: 420, overflow: 'hidden', padding: 0 }}>
                  <div className="demo-wa-contacts" style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
                    {DEMO_CONTACTS.map(c => (
                      <div key={c.name} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
                        background: c.active ? 'var(--primary-light)' : 'transparent',
                        borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{c.time}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</p>
                        </div>
                        {c.unread > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--primary)', borderRadius: 'var(--r-full)', padding: '2px 6px' }}>{c.unread}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>N</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700 }}>Ngozi Umeh</p>
                        <span style={{ fontSize: 11, color: 'var(--primary)' }}>Order #ORD-1042</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', background: 'var(--bg-2)' }}>
                      {DEMO_CHAT.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: msg.from === 'merchant' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '75%', padding: '9px 13px', borderRadius: 'var(--r-lg)', fontSize: 13, lineHeight: 1.45,
                            background: msg.from === 'merchant' ? 'var(--primary)' : 'var(--surface)',
                            color: msg.from === 'merchant' ? '#fff' : 'var(--text)',
                            border: msg.from === 'merchant' ? 'none' : '1px solid var(--border)',
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                      <input
                        readOnly
                        onFocus={() => locked('Reply to real customers once your store is set up.')}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '10px 14px', fontSize: 13, background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', color: 'var(--text)' }}
                      />
                      <button onClick={() => locked()} className="btn btn-primary clickable" style={{ padding: '10px 14px' }}>
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }} className="animate-fade-in">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Store Settings</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Settings are read-only in the demo — sign up to customize your own store.</p>
                </div>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Store Name', value: DEMO_STORE.name },
                    { label: 'Store Bio', value: 'Handmade Ankara & accessories, made in Lagos with love.' },
                    { label: 'WhatsApp Number', value: '+234 801 234 5678' },
                    { label: 'Currency', value: 'Nigerian Naira (₦)' },
                  ].map(field => (
                    <div key={field.label}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>{field.label}</label>
                      <input
                        readOnly
                        value={field.value}
                        onFocus={() => locked()}
                        style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      />
                    </div>
                  ))}
                  <button onClick={() => locked()} className="btn btn-primary clickable" style={{ padding: 12, marginTop: 4 }}>Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} className="animate-fade-in">
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="animate-drawer" style={{ position: 'relative', width: 280, background: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column', padding: 24, borderRight: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <Logo size={22} textColor="var(--primary)" text="Frontstore" />
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 14px', borderRadius: 'var(--r-md)', border: 'none',
                    background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: 14.5, fontWeight: activeTab === item.id ? 800 : 600, textAlign: 'left',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
                <ThemeToggle />
              </div>
              <a href="/signup" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
                Create your free store <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .demo-aside {
            display: none !important;
          }
          .demo-mobile-burger {
            display: flex !important;
          }
          .demo-mobile-logo {
            display: flex !important;
          }
          .demo-desktop-text {
            display: none !important;
          }
          .demo-header {
            padding: 10px 14px !important;
          }
          .demo-search {
            display: none !important;
          }
          .demo-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .demo-wa-shell {
            flex-direction: column !important;
          }
          .demo-wa-contacts {
            width: 100% !important;
            max-height: 160px !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
        }
        .demo-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
      `}</style>
    </div>
  );
}
