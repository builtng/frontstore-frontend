'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Sparkles, Save, EyeOff, LayoutGrid, BarChart3,
  ShoppingBag, Package, Tag, Users, DollarSign, Link, Share2, QrCode,
  Star, Menu, X, LogOut, Archive, FileText, Receipt, Copy, ExternalLink, Check,
  Search, ChevronDown, Zap, ArrowRight, Settings, Plug, ArrowUpRight,
} from 'lucide-react';
import { WhatsAppIcon } from '../../../components/WhatsAppIcon';
import ThemeToggle from '../../../components/ThemeToggle';
import Toggle from '../../../components/Toggle';

interface StoreShape {
  store_name?: string;
  username?: string;
  custom_domain?: string | null;
  logo_url?: string | null;
  currency_code?: string | null;
  is_pro?: boolean;
  is_legend?: boolean;
  hidden_dashboard_items?: string[] | null;
  plan_dashboard_items?: string[] | null;
}

interface UserShape {
  id?: number;
  name?: string;
  email?: string;
  plan?: string;
  role?: string;
}

const SIDEBAR_SECTIONS = [
  {
    group: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
      { id: 'orders', label: 'Orders', icon: <ShoppingBag size={17} /> },
      { id: 'products', label: 'Products', icon: <Package size={17} /> },
      { id: 'customers', label: 'Customers', icon: <Users size={17} />, pro: true },
    ],
  },
  {
    group: 'Finance & Sales',
    items: [
      { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={17} /> },
      { id: 'coupons', label: 'Store Coupons', icon: <Tag size={17} />, pro: true },
      { id: 'qr', label: 'My QR Code', icon: <QrCode size={17} />, pro: true },
    ],
  },
  {
    group: 'Conversations & Growth',
    items: [
      { id: 'whatsapp', label: 'WhatsApp & Growth', icon: <WhatsAppIcon size={17} /> },
      { id: 'reviews', label: 'Reviews', icon: <Star size={17} /> },
    ],
  },
];

const TOGGLEABLE_SIDEBAR_ITEMS: { id: string; label: string }[] = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'wallet', label: 'Wallet & Payouts' },
  { id: 'coupons', label: 'Store Coupons' },
  { id: 'qr', label: 'My QR Code' },
  { id: 'whatsapp', label: 'WhatsApp & Growth' },
  { id: 'reviews', label: 'Reviews' },
];

const STAT_ITEMS: { id: string; label: string }[] = [
  { id: 'stat_revenue', label: 'Total Revenue' },
  { id: 'stat_orders', label: 'Total Orders' },
  { id: 'stat_views', label: 'Storefront Views' },
  { id: 'stat_whatsapp', label: 'WhatsApp Redirects' },
  { id: 'stat_conversion', label: 'Conversion Rate' },
];

const FEATURE_SECTIONS: { id: string; label: string; hint: string }[] = [
  { id: 'section_charts', label: 'Charts & Analytics', hint: 'Weekly traffic graph, AI coach card, and top products list on the Overview tab' },
];

export default function RemoveDistractionsPage() {
  const router = useRouter();
  const apiUrl = (typeof window !== 'undefined' && localStorage.getItem('dev_api_url')) || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const systemDomain = process.env.NEXT_PUBLIC_SYSTEM_DOMAIN || 'frontstore.ng';

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLegend, setIsLegend] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [planItems, setPlanItems] = useState<string[] | null>(null);
  const [store, setStore] = useState<StoreShape | null>(null);
  const [user, setUser] = useState<UserShape | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  const [aiResponseBubble, setAiResponseBubble] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const authHeaders = (t: string | null) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const cachedStore = localStorage.getItem('store');
    if (cachedStore) {
      try {
        const parsed = JSON.parse(cachedStore);
        setStore(parsed);
        setIsLegend(!!parsed.is_legend);
        setHidden(parsed.hidden_dashboard_items || []);
        setPlanItems(parsed.plan_dashboard_items ?? null);
      } catch { }
    }

    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch { }
    }

    (async () => {
      try {
        const [resStore, resMe] = await Promise.all([
          fetch(`${apiUrl}/v1/store`, { credentials: 'include', headers: authHeaders(null) }),
          fetch(`${apiUrl}/v1/auth/me`, { credentials: 'include', headers: authHeaders(null) }).catch(() => null),
        ]);

        if (resStore.status === 401) {
          setToken(null);
          setLoading(false);
          return;
        }
        setToken('session');

        const jsonStore = await resStore.json();
        if (resStore.ok && jsonStore.data) {
          const liveStore: StoreShape = jsonStore.data;
          setStore(liveStore);
          setIsLegend(!!liveStore.is_legend);
          setHidden(liveStore.hidden_dashboard_items || []);
          setPlanItems(liveStore.plan_dashboard_items ?? null);
        }

        if (resMe && resMe.ok) {
          const jsonMe = await resMe.json();
          if (jsonMe.data && jsonMe.data.user) {
            setUser(jsonMe.data.user);
            localStorage.setItem('user', JSON.stringify(jsonMe.data.user));
          }
        }
      } catch {
        toast.error('Network error loading your dashboard preferences.');
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

  const handleAiCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCommand.trim()) return;

    const text = aiCommand.toLowerCase().trim();
    setAiCommand('');

    if (text.includes('add') || text.includes('product') || text.includes('sell') || text.includes('list') || text.includes('create product')) {
      setAiResponseBubble('✨ AI Copilot: Redirecting to Products section...');
      setTimeout(() => {
        setAiResponseBubble(null);
        router.push('/dashboard?page=products');
      }, 1000);
    } else if (text.includes('discount') || text.includes('coupon') || text.includes('promo')) {
      setAiResponseBubble('✨ AI Copilot: Redirecting to Coupons section...');
      setTimeout(() => {
        setAiResponseBubble(null);
        router.push('/dashboard?page=coupons');
      }, 1000);
    } else if (text.includes('order') || text.includes('sale') || text.includes('shipping')) {
      setAiResponseBubble('✨ AI Copilot: Redirecting to Orders section...');
      setTimeout(() => {
        setAiResponseBubble(null);
        router.push('/dashboard?page=orders');
      }, 1000);
    } else if (text.includes('setting') || text.includes('bio') || text.includes('phone')) {
      setAiResponseBubble('✨ AI Copilot: Navigating to Settings...');
      setTimeout(() => {
        setAiResponseBubble(null);
        router.push('/dashboard?page=settings');
      }, 1000);
    } else {
      setAiResponseBubble(`✨ AI Copilot: Navigating to Dashboard for "${text}"...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        router.push('/dashboard');
      }, 1200);
    }
  };

  const toggleItem = (id: string, next: boolean) => {
    setHidden(prev => (next ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const isPlanDisabled = (id: string) => planItems !== null && !planItems.includes(id);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        credentials: 'include',
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
          } catch { }
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
    fetch(`${apiUrl}/v1/auth/logout`, { method: 'POST', credentials: 'include', headers: authHeaders(token) }).catch(() => { });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    toast.info('Merchant session ended.');
    router.push('/login');
  };

  const liveStoreUrl = store
    ? store.custom_domain
      ? `https://${store.custom_domain}`
      : typeof window !== 'undefined' && window.location.hostname.includes('localhost')
        ? `http://${store.username}.localhost:3000`
        : `https://${store.username}.${systemDomain}`
    : '';

  const handleCopyLink = () => {
    if (!liveStoreUrl) return;
    navigator.clipboard.writeText(liveStoreUrl);
    setCopiedLink(true);
    toast.success('Store URL copied! 📋');
    setTimeout(() => setCopiedLink(false), 2000);
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
        padding: '20px 14px',
        flexShrink: 0,
        background: 'var(--surface)',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Frontstore" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, borderRadius: 'var(--r-sm)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>frontstore</span>
          </div>
        </div>

        {/* Grouped Sidebar Navigation */}
        <nav className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto', paddingRight: 2 }}>
          {SIDEBAR_SECTIONS.map(section => {
            const visibleItems = section.items.filter(item => item.id === 'overview' || !hidden.includes(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.group} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                }}>
                  {section.group}
                </span>
                {visibleItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/dashboard?page=${item.id}`)}
                    className="clickable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--r-md)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      fontSize: 13.5,
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ color: 'var(--text-faint)' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.pro && !store?.is_pro && (
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: '#9333ea',
                        background: 'rgba(147, 51, 234, 0.12)',
                        padding: '1px 5px',
                        borderRadius: 'var(--r-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        Pro
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => router.push('/dashboard/remove-distractions')}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '7px 10px', borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12.5 }}
          >
            <EyeOff size={15} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 750 }}>Focus Mode</span>
            {!isLegend && (
              <span style={{ fontSize: 9.5, fontWeight: 800, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', padding: '1px 5px', borderRadius: 'var(--r-sm)' }}>Legend</span>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Dark Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '7px 10px', borderRadius: 'var(--r-md)', color: 'var(--danger)', fontSize: 12.5 }}
          >
            <LogOut size={15} />
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
            padding: 20,
            borderRight: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Frontstore" width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 16 }}>frontstore</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
              {SIDEBAR_SECTIONS.map(section => {
                const visibleItems = section.items.filter(item => item.id === 'overview' || !hidden.includes(item.id));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.group} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', padding: '4px 10px' }}>
                      {section.group}
                    </span>
                    {visibleItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          router.push(`/dashboard?page=${item.id}`);
                          setIsMobileMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--r-md)',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          fontSize: 13.5,
                          fontWeight: 600,
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ color: 'var(--text-faint)' }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.pro && !store?.is_pro && (
                          <span style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            color: '#9333ea',
                            background: 'rgba(147, 51, 234, 0.12)',
                            padding: '1px 5px',
                            borderRadius: 'var(--r-sm)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            Pro
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                className="btn btn-ghost clickable"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '7px 10px', borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12.5 }}
              >
                <EyeOff size={15} />
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 750 }}>Focus Mode</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Dark Theme</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost clickable"
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', justifyContent: 'flex-start', padding: '7px 10px', fontSize: 12.5 }}
              >
                <LogOut size={15} />
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
          padding: '10px 24px',
          background: 'var(--surface)',
        }}>
          {/* Left section: mobile toggle and mobile brand logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-burger-btn"
              style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
            >
              <Menu size={22} />
            </button>

            {/* Mobile logo (hidden on desktop via css) */}
            <div className="header-logo-mobile" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Frontstore" width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em' }}>frontstore</span>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-outline clickable"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 'var(--r-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                background: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              <ArrowLeft size={13} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* AI Command Input Bar */}
          <form onSubmit={handleAiCommandSubmit} className="header-search-form" style={{ display: 'flex', flex: 1, maxWidth: 420, position: 'relative', margin: '0 16px' }}>
            <input
              type="text"
              placeholder="Search or ask AI copilot... (e.g. /discount)"
              value={aiCommand}
              onChange={e => setAiCommand(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: 12.5,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)',
                outline: 'none',
                color: 'var(--text)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />

            {aiResponseBubble && (
              <div className="card glass animate-scale-in" style={{ position: 'absolute', top: '115%', left: 0, right: 0, padding: 12, fontSize: 13, fontWeight: 600, border: '1px solid var(--primary)', zIndex: 50, color: 'var(--text)', borderRadius: 'var(--r-lg)' }}>
                {aiResponseBubble}
              </div>
            )}
          </form>

          {/* Right Action Widgets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <ThemeToggle />

            {/* Store Profile Menu Dropdown */}
            {store && (
              <div ref={profileMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}
                  className="clickable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 7px 3px 3px',
                    borderRadius: 'var(--r-full)',
                    background: isProfileMenuOpen ? 'var(--bg-2)' : 'transparent',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  aria-label="Account and store menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.store_name || store.username}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #128C7E, #25D366)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 12,
                        fontFamily: 'var(--font-heading)',
                        flexShrink: 0,
                      }}
                    >
                      {(store.store_name || store.username || '').charAt(0).toUpperCase() || 'S'}
                    </div>
                  )}
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'var(--text-muted)',
                      transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="card glass animate-scale-in"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 260,
                      padding: '8px',
                      borderRadius: 'var(--r-xl)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    {/* Header Store Profile Card */}
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {store.logo_url ? (
                          <img
                            src={store.logo_url}
                            alt=""
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--r-md)',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid var(--border)'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--r-md)',
                              background: 'linear-gradient(135deg, #128C7E, #25D366)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: 14,
                              fontFamily: 'var(--font-heading)',
                              flexShrink: 0,
                            }}
                          >
                            {(store.store_name || store.username || '').charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                            {store.store_name || store.username}
                          </p>
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            @{store.username}
                          </span>
                        </div>
                      </div>

                      {/* Plan Tag */}
                      <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: 'var(--r-sm)',
                            background: isLegend ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' : store.is_pro ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--bg-2)',
                            color: (store.is_pro || isLegend) ? '#fff' : 'var(--text-muted)',
                            border: (store.is_pro || isLegend) ? 'none' : '1px solid var(--border)',
                            letterSpacing: '0.04em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {store.is_pro ? <Zap size={8} /> : null}
                          {user?.plan === 'pro_monthly' ? 'Pro' : user?.plan === 'pro_yearly' ? 'Pro Yearly' : user?.plan === 'legend_monthly' ? 'Legend' : user?.plan === 'legend_yearly' ? 'Legend' : store.is_pro ? 'Pro Tier' : 'Free Tier'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)' }}>
                          {store.currency_code || 'NGN'}
                        </span>
                      </div>
                    </div>

                    {/* Upgrade / Billing Action */}
                    {(!user?.plan || user?.plan === 'free') && !store.is_pro && !isLegend ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          router.push('/dashboard?page=billing');
                        }}
                        className="clickable"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 'var(--r-md)',
                          background: 'linear-gradient(135deg, rgba(18,140,126,0.12), rgba(37,211,102,0.12))',
                          border: '1px solid var(--primary-border, rgba(18,140,126,0.3))',
                          color: 'var(--primary)',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          marginTop: 4,
                          marginBottom: 3,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Zap size={14} color="var(--primary)" />
                          <span>Upgrade to Pro</span>
                        </div>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          router.push('/dashboard?page=billing');
                        }}
                        className="clickable"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '8px 10px',
                          borderRadius: 'var(--r-md)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <Zap size={14} style={{ color: 'var(--primary)' }} />
                        <span>Manage Subscription</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/dashboard?page=settings');
                      }}
                      className="clickable"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--r-md)', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <Settings size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/dashboard?page=integrations');
                      }}
                      className="clickable"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--r-md)', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <Plug size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Integrations</span>
                      {!isLegend && (
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '1px 5px', borderRadius: 'var(--r-sm)', marginLeft: 'auto' }}>Legend</span>
                      )}
                    </button>

                    {liveStoreUrl && (
                      <a
                        href={liveStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="clickable"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--r-md)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>View Live Store</span>
                        </div>
                        <ArrowUpRight size={13} style={{ color: 'var(--text-faint)' }} />
                      </a>
                    )}

                    <div style={{ height: 1, background: 'var(--border)', margin: '3px 0' }} />

                    {/* Log out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="clickable"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '8px 10px',
                        borderRadius: 'var(--r-md)',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

            {!isLegend ? (
              <div className="card" style={{ padding: 28, textAlign: 'center', border: '1.5px dashed var(--border-strong)' }}>
                <Sparkles size={28} style={{ color: '#7c3aed', marginBottom: 12 }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>This is a Frontstore Legend feature</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
                  Upgrade to Legend to customize which sidebar items, stats, and feature sections show up on your dashboard.
                </p>
                <button
                  onClick={() => router.push('/dashboard?page=billing')}
                  className="btn btn-primary clickable"
                  style={{ padding: '10px 20px', borderRadius: 'var(--r-lg)', background: '#7c3aed', borderColor: '#7c3aed' }}
                >
                  Upgrade to Legend
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
                    {TOGGLEABLE_SIDEBAR_ITEMS.map(item => (
                      <div key={item.id}>
                        <Toggle
                          checked={!isPlanDisabled(item.id) && !hidden.includes(item.id)}
                          disabled={isPlanDisabled(item.id)}
                          onChange={(next) => toggleItem(item.id, next)}
                          label={<span style={{ fontSize: 13 }}>{item.label}</span>}
                        />
                        {isPlanDisabled(item.id) && (
                          <p style={{ fontSize: 10.5, color: 'var(--text-faint)', margin: '2px 0 0 46px' }}>Not available on your plan</p>
                        )}
                      </div>
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
                      <div key={item.id}>
                        <Toggle
                          checked={!isPlanDisabled(item.id) && !hidden.includes(item.id)}
                          disabled={isPlanDisabled(item.id)}
                          onChange={(next) => toggleItem(item.id, next)}
                          label={<span style={{ fontSize: 13 }}>{item.label}</span>}
                        />
                        {isPlanDisabled(item.id) && (
                          <p style={{ fontSize: 10.5, color: 'var(--text-faint)', margin: '2px 0 0 46px' }}>Not available on your plan</p>
                        )}
                      </div>
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
                          checked={!isPlanDisabled(item.id) && !hidden.includes(item.id)}
                          disabled={isPlanDisabled(item.id)}
                          onChange={(next) => toggleItem(item.id, next)}
                        />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{item.label}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '2px 0 0' }}>
                            {isPlanDisabled(item.id) ? 'Not available on your plan' : item.hint}
                          </p>
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
          .desktop-only-flex {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
