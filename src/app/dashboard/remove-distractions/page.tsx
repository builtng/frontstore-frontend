'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Sparkles, Save, EyeOff, LayoutGrid, BarChart3 } from 'lucide-react';
import Toggle from '../../../components/Toggle';

interface StoreShape {
  is_pro?: boolean;
  hidden_dashboard_items?: string[] | null;
}

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

  const authHeaders = (t: string | null) => ({
    'Authorization': `Bearer ${t}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Loader2 size={28} className="spinner" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="clickable"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, marginBottom: 20, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

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
  );
}
