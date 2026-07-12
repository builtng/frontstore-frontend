'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Sparkles, Save, EyeOff, LayoutGrid, BarChart3,
  ShoppingBag, Package, Tag, Users, DollarSign, Link, Gift, Share2, QrCode,
  Star, BookOpen, Clock, Calendar, Settings, Plug, Zap, Menu, X, LogOut,
} from 'lucide-react';
import { WhatsAppIcon } from '../../../components/WhatsAppIcon';
import ThemeToggle from '../../../components/ThemeToggle';
import Toggle from '../../../components/Toggle';

interface StoreShape {
  store_name?: string;
  username?: string;
  is_pro?: boolean;
  hidden_dashboard_items?: string[] | null;
}

const NAV_ITEMS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
  { id: 'products', label: 'My Products', icon: <Package size={18} /> },
  { id: 'coupons', label: 'Store Coupons', icon: <Tag size={18} /> },
  { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
  { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={18} /> },
  { id: 'payment-links', label: 'Payment Links', icon: <Link size={18} /> },
  { id: 'giveaways', label: 'Giveaways', icon: <Gift size={18} /> },
  { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={18} /> },
  { id: 'share', label: 'Share & Earn', icon: <Share2 size={18} /> },
  { id: 'qr', label: 'My QR Code', icon: <QrCode size={18} /> },
  { id: 'reviews', label: 'Customer Reviews', icon: <Star size={18} /> },
  { id: 'blog', label: 'Blog Posts', icon: <BookOpen size={18} /> },
  { id: 'availability', label: 'Availability', icon: <Clock size={18} /> },
  { id: 'bookings', label: 'Bookings', icon: <Calendar size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={18} /> },
  { id: 'billing', label: 'Plans & Billing', icon: <Zap size={18} /> },
];

const SIDEBAR_ITEMS: { id: string; label: string }[] = [
  { id: 'orders', label: 'My Orders' },
  { id: 'products', label: 'My Products' },
  { id: 'coupons', label: 'Store Coupons' },
  { id: 'customers', label: 'Customers' },
  { id: 'wallet', label: 'Wallet & Payouts' },
  { id: 'payment-links', label: 'Payment Links' },
  { id: 'giveaways', label: 'Giveaways' },
  { id: 'whatsapp', label: 'WhatsApp Inbox' },
  { id: 'share', label: 'Share & Earn' },
  { id: 'qr', label: 'My QR Code' },
  { id: 'reviews', label: 'Customer Reviews' },
  { id: 'blog', label: 'Blog Posts' },
  { id: 'availability', label: 'Availability' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Plans & Billing' },
];

const STAT_ITEMS: { id: string; label: string }[] = [
  { id: 'stat_revenue', label: 'Total Revenue' },
  { id: 'stat_orders', label: 'Total Orders' },
  { id: 'stat_views', label: 'Storefront Views' },
  { id: 'stat_whatsapp', label: 'WhatsApp Redirects' },
  { id: 'stat_conversion', label: 'Conversion Rate' },
];

const FEATURE_SECTIONS: { id: string; label: string; hint: string }[] = [
  { id: 'section_charts', label: 'Charts & Analytics', hint: 'Weekly traffic graph, AI coach card, and top products list on the Dashboard tab' },
];

export default function RemoveDistractionsPage() {
  const router = useRouter();
  const apiUrl = (typeof window !== 'undefined' && localStorage.getItem('dev_api_url')) || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [storeName, setStoreName] = useState('');
  const [storeUsername, setStoreUsername] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const authHeaders = (t: string | null) => ({
    'Authorization': `Bearer ${t}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    const cachedStore = localStorage.getItem('store');
    if (cachedStore) {
      try {
        const parsed = JSON.parse(cachedStore);
        setStoreName(parsed.store_name || parsed.username || '');
        setStoreUsername(parsed.username || '');
      } catch { }
    }

    if (!storedToken) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/store`, { headers: authHeaders(storedToken) });
        const json = await res.json();
        if (res.ok && json.data) {
          const liveStore: StoreShape = json.data;
          setIsPro(!!liveStore.is_pro);
          setHidden(liveStore.hidden_dashboard_items || []);
          setStoreName(liveStore.store_name || liveStore.username || '');
          setStoreUsername(liveStore.username || '');
        } else {
          toast.error('Could not load your dashboard preferences.');
        }
      } catch {
        toast.error('Network error loading your dashboard preferences.');
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

  const toggleItem = (id: string, next: boolean) => {
    setHidden(prev => (next ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ hidden_dashboard_items: hidden }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Dashboard preferences saved.');
        const cachedStore = localStorage.getItem('store');
        if (cachedStore) {
          try {
            const parsed = JSON.parse(cachedStore);
            parsed.hidden_dashboard_items = hidden;
            localStorage.setItem('store', JSON.stringify(parsed));
          } catch {
            // cached store payload wasn't valid JSON — next dashboard load will refetch it anyway
          }
        }
      } else {
        toast.error(json.message || 'Could not save your dashboard preferences.');
      }
    } catch {
      toast.error('Network error saving your dashboard preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    fetch(`${apiUrl}/v1/auth/logout`, { method: 'POST', headers: authHeaders(token) }).catch(() => { });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    toast.info('Merchant session ended.');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Loader2 size={28} className="spinner" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── SIDEBAR NAVIGATION (Desktop) ── */}
      <aside className="glass" style={{
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        height: '100vh',
        zIndex: 40,
        padding: '24px 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <img src="/logo.png" alt="Frontstore" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>frontstore</h1>
            <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Merchant Dashboard v2.0</span>
          </div>
        </div>

        {storeUsername && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 'var(--r-lg)', marginBottom: 24, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                {(storeName || storeUsername).charAt(0).toUpperCase() || 'S'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{storeName || storeUsername}</p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>@{storeUsername}</span>
              </div>
            </div>
          </div>
        )}

        <nav className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS
            .filter(item => item.id === 'overview' || item.id === 'settings' || !hidden.includes(item.id))
            .map(item => (
              <button
                key={item.id}
                onClick={() => router.push(`/dashboard?page=${item.id}`)}
                className="clickable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: 14.5,
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <EyeOff size={16} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 750 }}>Remove Distractions</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE MENU DRAWER ── */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} className="animate-fade-in">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
          />
          <div className="animate-drawer" style={{
            position: 'relative',
            width: 280,
            background: 'var(--surface)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            borderRight: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="Frontstore" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18 }}>frontstore</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
              {NAV_ITEMS
                .filter(item => item.id === 'overview' || item.id === 'settings' || !hidden.includes(item.id))
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(`/dashboard?page=${item.id}`);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      fontSize: 14.5,
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-ghost clickable"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}
              >
                <EyeOff size={16} />
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 750 }}>Remove Distractions</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost clickable"
                style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', justifyContent: 'flex-start', padding: 10 }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <header className="glass main-header" style={{
          position: 'sticky', top: 0, zIndex: 30,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          paddingBottom: '12px',
          padding: '12px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-burger-btn"
              style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
            >
              <Menu size={24} />
            </button>
            <div className="header-logo-mobile" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
              <img src="/logo.png" alt="Frontstore" width={28} height={28} style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>frontstore</span>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="clickable desktop-only-text"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, padding: 0 }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>

          <ThemeToggle />
        </header>

        <div style={{ padding: 'clamp(16px, 4vw, 32px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: 900, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EyeOff size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, margin: 0 }}>Remove Distractions</h1>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 28 }}>
              Hide sidebar items, stats, and feature sections you don't use, so your dashboard only shows what matters to you. Nothing is deleted — you can turn any of these back on anytime.
            </p>

            {!isPro ? (
              <div className="card" style={{ padding: 28, textAlign: 'center', border: '1.5px dashed var(--border-strong)' }}>
                <Sparkles size={28} style={{ color: 'var(--primary)', marginBottom: 12 }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>This is a Frontstore Pro feature</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
                  Upgrade to Pro to customize which sidebar items, stats, and feature sections show up on your dashboard.
                </p>
                <button
                  onClick={() => router.push('/dashboard?page=billing')}
                  className="btn btn-primary clickable"
                  style={{ padding: '10px 20px', borderRadius: 'var(--r-lg)' }}
                >
                  Upgrade to Pro
                </button>
              </div>
            ) : (
              <>
                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <LayoutGrid size={16} style={{ color: 'var(--text-muted)' }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, margin: 0 }}>Sidebar Items</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {SIDEBAR_ITEMS.map(item => (
                      <Toggle
                        key={item.id}
                        checked={!hidden.includes(item.id)}
                        onChange={(next) => toggleItem(item.id, next)}
                        label={<span style={{ fontSize: 13 }}>{item.label}</span>}
                      />
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, margin: 0 }}>Dashboard Stats</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {STAT_ITEMS.map(item => (
                      <Toggle
                        key={item.id}
                        checked={!hidden.includes(item.id)}
                        onChange={(next) => toggleItem(item.id, next)}
                        label={<span style={{ fontSize: 13 }}>{item.label}</span>}
                      />
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: 20, marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Sparkles size={16} style={{ color: 'var(--text-muted)' }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800, margin: 0 }}>Feature Sections</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {FEATURE_SECTIONS.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Toggle
                          checked={!hidden.includes(item.id)}
                          onChange={(next) => toggleItem(item.id, next)}
                        />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{item.label}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '2px 0 0' }}>{item.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary clickable"
                  style={{ padding: '12px 22px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .main-content {
          margin-left: 260px;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          aside {
            display: none !important;
          }
          .mobile-burger-btn {
            display: block !important;
          }
          .header-logo-mobile {
            display: flex !important;
          }
          .desktop-only-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
