'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart3, Mail, Zap, Send, BookOpen, CheckCircle2, Loader2, X,
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

function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
}

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  analytics: <BarChart3 size={20} />,
  email: <Mail size={20} />,
  automation: <Zap size={20} />,
  notifications: <Send size={20} />,
  courses: <BookOpen size={20} />,
};

const CATEGORY_LABEL: Record<string, string> = {
  analytics: 'Analytics & Ad Pixels',
  email: 'Email Marketing',
  automation: 'Automation',
  notifications: 'Notifications',
  courses: 'Courses & Membership',
};

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<Integration | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/v1/integrations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.status === 'success') {
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
  };

  const handleConnect = async () => {
    if (!activeModal) return;
    const missing = activeModal.fields.some((f) => !formValues[f.key]?.trim());
    if (missing) {
      toast.error('Please fill in all fields.');
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formValues),
      });
      const json = await res.json();

      if (!res.ok || json.status === 'error') {
        toast.error(json.message || 'Could not connect this integration.');
        return;
      }

      toast.success(`${activeModal.name} connected.`);
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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(clearedValues),
        });
      } else {
        await fetch(`${getApiUrl()}/v1/integrations/${disconnectTarget.id}/disconnect`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const categories = Array.from(new Set(integrations.map((i) => i.category)));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Integrations</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
          Connect Frontstore to the tools you already use. Buyers sync automatically on every paid order.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)', marginBottom: 12 }}>
            {CATEGORY_LABEL[category] || category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {integrations.filter((i) => i.category === category).map((integration) => (
              <div
                key={integration.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  padding: 18,
                  background: 'var(--bg-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, background: 'var(--primary-light)',
                      color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    >
                      {CATEGORY_ICON[integration.category] || <Zap size={20} />}
                    </div>
                    <span style={{ fontSize: 14.5, fontWeight: 800 }}>{integration.name}</span>
                  </div>
                  {integration.connected && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800,
                      color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: 999,
                    }}
                    >
                      <CheckCircle2 size={12} /> Connected
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                  {integration.description}
                </p>

                {integration.connected && integration.last_error && (
                  <p style={{ fontSize: 11.5, color: '#ef4444', margin: 0 }}>
                    Last sync failed: {integration.last_error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openModal(integration)}
                    className="clickable"
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 'var(--r-md)', fontSize: 12.5, fontWeight: 700,
                      border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer',
                    }}
                  >
                    {integration.connected ? 'Edit' : 'Connect'}
                  </button>
                  {integration.connected && (
                    <button
                      type="button"
                      onClick={() => setDisconnectTarget(integration)}
                      className="clickable"
                      style={{
                        padding: '8px 12px', borderRadius: 'var(--r-md)', fontSize: 12.5, fontWeight: 700,
                        border: '1px solid var(--border)', background: 'transparent', color: '#ef4444', cursor: 'pointer',
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {activeModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.45)',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              width: 'min(100%, 440px)', background: 'var(--surface, #fff)', borderRadius: 20,
              padding: 24, border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Connect {activeModal.name}</h3>
              <button
                type="button"
                onClick={closeModal}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeModal.fields.map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type === 'password' ? 'password' : 'text'}
                    value={formValues[field.key] || ''}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border)', fontSize: 13.5, background: 'var(--bg)', color: 'var(--text)',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleConnect}
              disabled={saving}
              style={{
                width: '100%', marginTop: 20, padding: '11px 16px', borderRadius: 'var(--r-md)',
                border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 13.5,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!disconnectTarget}
        title={`Disconnect ${disconnectTarget?.name || ''}?`}
        description="Buyers will stop syncing to this integration after your next order."
        confirmLabel="Disconnect"
        loading={disconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  );
}
