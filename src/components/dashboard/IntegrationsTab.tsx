'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  BarChart3, Mail, Zap, Send, BookOpen, CheckCircle2, Loader2, X,
  Search, Crown, ArrowRight, Eye, EyeOff, Activity, ShieldCheck,
  Sparkles, SlidersHorizontal, RefreshCw, AlertTriangle
} from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';

interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password';
}

interface Integration {
  id: string;
  type: 'pixel' | 'connectable';
  name: string;
  category: string;
  description: string;
  fields: IntegrationField[];
  connected: boolean;
  values?: Record<string, string | null>;
  last_synced_at?: string | null;
  last_error?: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  analytics: 'Analytics & Ad Pixels',
  email: 'Email Marketing',
  automation: 'Automation',
  notifications: 'Notifications',
  courses: 'Courses & Membership',
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  analytics: <BarChart3 size={16} />,
  email: <Mail size={16} />,
  automation: <Zap size={16} />,
  notifications: <Send size={16} />,
  courses: <BookOpen size={16} />,
};

interface BrandConfig {
  bg: string;
  color: string;
  border: string;
  badgeBg: string;
  icon: React.ReactNode;
}

const BRAND_CONFIGS: Record<string, BrandConfig> = {
  facebook_pixel: {
    bg: 'linear-gradient(135deg, #1877F2 0%, #0056C6 100%)',
    color: '#ffffff',
    border: 'rgba(24, 119, 242, 0.25)',
    badgeBg: 'rgba(24, 119, 242, 0.1)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  google_tag_manager: {
    bg: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
    color: '#ffffff',
    border: 'rgba(66, 133, 244, 0.25)',
    badgeBg: 'rgba(66, 133, 244, 0.1)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.87 15.07l-2.54-2.54 2.54-2.54 2.54 2.54-2.54 2.54zm-6.2-2.54l6.2-6.2 6.2 6.2-6.2 6.2-6.2-6.2zm6.2-8.68L2.4 12.53l10.47 10.47 10.47-10.47L12.87 3.85z"/>
      </svg>
    ),
  },
  tiktok_pixel: {
    bg: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
    color: '#00F2FE',
    border: 'rgba(0, 242, 254, 0.3)',
    badgeBg: 'rgba(0, 242, 254, 0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.05.82.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 003 15.68 6.34 6.34 0 009.34 22a6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.91 1.62V7.54a4.85 4.85 0 01-1-.85z"/>
      </svg>
    ),
  },
  mailchimp: {
    bg: 'linear-gradient(135deg, #FFE01B 0%, #F5CE00 100%)',
    color: '#241C15',
    border: 'rgba(255, 224, 27, 0.4)',
    badgeBg: 'rgba(255, 224, 27, 0.15)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
    ),
  },
  sendpulse: {
    bg: 'linear-gradient(135deg, #008BF6 0%, #0066C0 100%)',
    color: '#ffffff',
    border: 'rgba(0, 139, 246, 0.25)',
    badgeBg: 'rgba(0, 139, 246, 0.1)',
    icon: <Send size={20} color="#ffffff" />,
  },
  convertkit: {
    bg: 'linear-gradient(135deg, #FF5A5F 0%, #E03E44 100%)',
    color: '#ffffff',
    border: 'rgba(255, 90, 95, 0.25)',
    badgeBg: 'rgba(255, 90, 95, 0.1)',
    icon: <Mail size={20} color="#ffffff" />,
  },
  mailerlite: {
    bg: 'linear-gradient(135deg, #00A154 0%, #007A3E 100%)',
    color: '#ffffff',
    border: 'rgba(0, 161, 84, 0.25)',
    badgeBg: 'rgba(0, 161, 84, 0.1)',
    icon: <Mail size={20} color="#ffffff" />,
  },
  zapier: {
    bg: 'linear-gradient(135deg, #FF4A00 0%, #D63B00 100%)',
    color: '#ffffff',
    border: 'rgba(255, 74, 0, 0.25)',
    badgeBg: 'rgba(255, 74, 0, 0.1)',
    icon: <Zap size={20} color="#ffffff" />,
  },
  telegram: {
    bg: 'linear-gradient(135deg, #229ED9 0%, #157EAF 100%)',
    color: '#ffffff',
    border: 'rgba(34, 158, 217, 0.25)',
    badgeBg: 'rgba(34, 158, 217, 0.1)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.4-3.63 4-.17 4.83.69 4.84 1.47z"/>
      </svg>
    ),
  },
  thinkific: {
    bg: 'linear-gradient(135deg, #0B1B3D 0%, #162B56 100%)',
    color: '#F3AA00',
    border: 'rgba(243, 170, 0, 0.3)',
    badgeBg: 'rgba(243, 170, 0, 0.1)',
    icon: <BookOpen size={20} color="#F3AA00" />,
  },
  kartra: {
    bg: 'linear-gradient(135deg, #00A3E0 0%, #0077A3 100%)',
    color: '#ffffff',
    border: 'rgba(0, 163, 224, 0.25)',
    badgeBg: 'rgba(0, 163, 224, 0.1)',
    icon: <Activity size={20} color="#ffffff" />,
  },
};

function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
}

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLegendLocked, setIsLegendLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<Integration | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    setIsLegendLocked(false);
    try {
      const res = await fetch(`${getApiUrl()}/v1/integrations`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (res.status === 403) {
        setIsLegendLocked(true);
      } else if (json.status === 'success') {
        setIntegrations(json.data);
      }
    } catch {
      toast.error('Failed to load integrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const openModal = (integration: Integration) => {
    const initial: Record<string, string> = {};
    integration.fields.forEach((f) => {
      initial[f.key] = integration.values?.[f.key] || '';
    });
    setFormValues(initial);
    setActiveModal(integration);
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormValues({});
    setShowPassword({});
  };

  const handleConnect = async () => {
    if (!activeModal) return;
    const missing = activeModal.fields.some((f) => !formValues[f.key]?.trim());
    if (missing) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const url = activeModal.type === 'pixel'
        ? `${getApiUrl()}/v1/store`
        : `${getApiUrl()}/v1/integrations/${activeModal.id}/connect`;
      const method = activeModal.type === 'pixel' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });
      const json = await res.json();

      if (!res.ok || json.status === 'error') {
        toast.error(json.message || 'Could not connect this integration.');
        return;
      }

      toast.success(`${activeModal.name} connected successfully!`);
      closeModal();
      fetchIntegrations();
    } catch {
      toast.error('Network error while connecting.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    setDisconnecting(true);
    try {
      if (disconnectTarget.type === 'pixel') {
        const clearedValues: Record<string, string | null> = {};
        disconnectTarget.fields.forEach((f) => { clearedValues[f.key] = null; });
        await fetch(`${getApiUrl()}/v1/store`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clearedValues),
        });
      } else {
        await fetch(`${getApiUrl()}/v1/integrations/${disconnectTarget.id}/disconnect`, {
          method: 'POST',
          credentials: 'include',
        });
      }
      toast.success(`${disconnectTarget.name} disconnected.`);
      setDisconnectTarget(null);
      fetchIntegrations();
    } catch {
      toast.error('Network error while disconnecting.');
    } finally {
      setDisconnecting(false);
    }
  };

  const connectedCount = useMemo(() => integrations.filter((i) => i.connected).length, [integrations]);
  const totalAvailableCount = integrations.length;

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((i) => {
      const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (CATEGORY_LABEL[i.category] || i.category).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [integrations, selectedCategory, searchQuery]);

  const categoriesPresent = useMemo(() => {
    return Array.from(new Set(integrations.map((i) => i.category)));
  }, [integrations]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="skeleton" style={{ width: 220, height: 28, borderRadius: 8, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 340, height: 16, borderRadius: 6 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card" style={{ padding: 18 }}>
              <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 6 }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, height: 180 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 6, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 4 }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: 32, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '100%', height: 36, borderRadius: 8, marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLegendLocked) {
    return (
      <div style={{ padding: '24px 0' }}>
        <div
          className="glass animate-scale-in"
          style={{
            borderRadius: 'var(--r-2xl)',
            padding: 'clamp(32px, 5vw, 48px) 32px',
            background: 'linear-gradient(135deg, rgba(18, 140, 126, 0.08) 0%, rgba(15, 23, 42, 0.03) 100%)',
            border: '1.5px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--r-full)',
                background: 'linear-gradient(135deg, #F3AA00 0%, #D48800 100%)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.05em',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(243, 170, 0, 0.3)',
              }}
            >
              <Crown size={14} /> FRONTSTORE BUSINESS FEATURE
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1.2, marginBottom: 12 }}>
              Connect your store with automated integrations
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 24 }}>
              Connect Facebook Pixel, Google Tag Manager, TikTok Pixel, Mailchimp, ConvertKit, Zapier, Telegram, and more to sync buyers and track conversions automatically on every paid order.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
              {['Facebook Pixel', 'Google Tag Manager', 'Mailchimp', 'Zapier Webhooks', 'Telegram Alerts', 'ConvertKit'].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  <ShieldCheck size={14} color="var(--primary)" /> {tag}
                </div>
              ))}
            </div>

            <a
              href="/dashboard?tab=billing"
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Sparkles size={16} /> Upgrade to Business Plan <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>
                Integrations & Automation
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 'var(--r-full)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={12} /> Active Sync
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Connect Frontstore to your marketing, analytics, email, and notification tools. Buyers sync automatically on every paid order.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchIntegrations}
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh Status
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div
            className="card"
            style={{
              padding: '16px 20px',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connected Tools
              </span>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)', marginTop: 2 }}>
                {connectedCount} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)' }}>/ {totalAvailableCount} active</span>
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--r-md)',
                background: connectedCount > 0 ? 'var(--primary-light)' : 'var(--bg-2)',
                color: connectedCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '16px 20px',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Automated Event Sync
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Real-time Orders</span>
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--r-md)',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={22} />
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '16px 20px',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Account Plan
              </span>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crown size={15} color="#F3AA00" /> Frontstore Business
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--r-md)',
                background: 'rgba(243, 170, 0, 0.1)',
                color: '#F3AA00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations by name..."
              className="input-field"
              style={{ paddingLeft: 36, paddingRight: searchQuery ? 32 : 14, height: 42, fontSize: 13.5 }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              <SlidersHorizontal size={13} /> All ({totalAvailableCount})
            </button>
            {categoriesPresent.map((cat) => {
              const count = integrations.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {CATEGORY_ICON[cat] || null}
                  {CATEGORY_LABEL[cat] || cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredIntegrations.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            background: 'var(--surface)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--bg-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Search size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>No integrations match your search</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
            Try searching with a different term or select another category filter above.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="btn btn-outline"
            style={{ marginTop: 8, padding: '8px 16px', fontSize: 13 }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {(selectedCategory === 'all' ? categoriesPresent : [selectedCategory]).map((cat) => {
            const catItems = filteredIntegrations.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                    }}
                  >
                    {CATEGORY_ICON[cat] || <Zap size={14} />}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.02em', color: 'var(--text)', margin: 0 }}>
                    {CATEGORY_LABEL[cat] || cat}
                  </h3>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    ({catItems.length})
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                  {catItems.map((integration) => {
                    const brand = BRAND_CONFIGS[integration.id] || {
                      bg: 'var(--primary)',
                      color: '#ffffff',
                      border: 'var(--border)',
                      badgeBg: 'var(--primary-light)',
                      icon: CATEGORY_ICON[integration.category] || <Zap size={20} />,
                    };

                    return (
                      <div
                        key={integration.id}
                        className="card card-hover"
                        style={{
                          padding: 20,
                          background: 'var(--surface)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 16,
                          position: 'relative',
                          borderColor: integration.connected ? 'color-mix(in srgb, var(--primary) 40%, transparent)' : 'var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  background: brand.bg,
                                  color: brand.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                              >
                                {brand.icon}
                              </div>
                              <div>
                                <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>
                                  {integration.name}
                                </h4>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                                  {integration.type === 'pixel' ? 'Tracking Pixel' : 'Direct API Sync'}
                                </span>
                              </div>
                            </div>

                            {integration.connected ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: '#16a34a',
                                  background: 'rgba(22, 163, 74, 0.12)',
                                  padding: '4px 10px',
                                  borderRadius: 999,
                                  border: '1px solid rgba(22, 163, 74, 0.2)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse-ring 2s infinite' }} />
                                Connected
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: 'var(--text-muted)',
                                  background: 'var(--bg-2)',
                                  padding: '4px 10px',
                                  borderRadius: 999,
                                  border: '1px solid var(--border)',
                                }}
                              >
                                Available
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                            {integration.description}
                          </p>

                          {integration.connected && integration.last_error && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                borderRadius: 'var(--r-md)',
                                background: 'var(--danger-light)',
                                color: 'var(--danger)',
                                fontSize: 11.5,
                                fontWeight: 600,
                              }}
                            >
                              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Sync issue: {integration.last_error}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                          <button
                            type="button"
                            onClick={() => openModal(integration)}
                            className={integration.connected ? 'btn btn-outline' : 'btn btn-primary'}
                            style={{
                              flex: 1,
                              padding: '9px 14px',
                              fontSize: 13,
                              fontWeight: 700,
                              gap: 6,
                              borderRadius: 'var(--r-md)',
                            }}
                          >
                            {integration.connected ? 'Configure Settings' : 'Connect Integration'}
                            {!integration.connected && <ArrowRight size={14} />}
                          </button>

                          {integration.connected && (
                            <button
                              type="button"
                              onClick={() => setDisconnectTarget(integration)}
                              className="btn btn-ghost"
                              style={{
                                padding: '9px 12px',
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: 'var(--danger)',
                                borderRadius: 'var(--r-md)',
                              }}
                              title="Disconnect"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeModal && (
        <div
          className="animate-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="animate-scale-in"
            style={{
              width: 'min(100%, 460px)',
              background: 'var(--surface)',
              borderRadius: 24,
              padding: 28,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: BRAND_CONFIGS[activeModal.id]?.bg || 'var(--primary)',
                    color: BRAND_CONFIGS[activeModal.id]?.color || '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {BRAND_CONFIGS[activeModal.id]?.icon || CATEGORY_ICON[activeModal.category] || <Zap size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>
                    {activeModal.connected ? `Configure ${activeModal.name}` : `Connect ${activeModal.name}`}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {activeModal.category.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="modal-close-btn"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 20 }}>
              {activeModal.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeModal.fields.map((field) => {
                const isPass = field.type === 'password';
                const isShowing = showPassword[field.key];

                return (
                  <div key={field.key} className="field-group">
                    <label className="form-label">
                      {field.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={isPass && !isShowing ? 'password' : 'text'}
                        value={formValues[field.key] || ''}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={`Enter your ${field.label}...`}
                        className="input-field"
                        style={{ paddingRight: isPass ? 40 : 14 }}
                      />
                      {isPass && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 2,
                          }}
                        >
                          {isShowing ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-outline"
                style={{ flex: 1, padding: '11px 16px', fontSize: 13.5 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnect}
                disabled={saving}
                className="btn btn-primary"
                style={{ flex: 1.5, padding: '11px 16px', fontSize: 13.5, gap: 8 }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {activeModal.connected ? 'Save Changes' : 'Connect Tool'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!disconnectTarget}
        title={`Disconnect ${disconnectTarget?.name || ''}?`}
        description="Buyers will stop syncing to this integration after your next order. You can reconnect at any time."
        confirmLabel="Disconnect Integration"
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}
