'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Sparkles, Plus, Menu, X, LogOut, LayoutTemplate,
  Globe, Copy, Trash2, ExternalLink, CheckCircle2, PencilLine,
} from 'lucide-react';
import ThemeToggle from '../../../components/ThemeToggle';
import ConfirmDialog from '../../../components/ConfirmDialog';

interface StoreSite {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  custom_domain: string | null;
  domain_status: string | null;
  published_at: string | null;
  updated_at: string;
}

export default function StoreBuildPage() {
  const router = useRouter();
  const apiUrl = (typeof window !== 'undefined' && localStorage.getItem('dev_api_url')) || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canUseStoreBuild, setCanUseStoreBuild] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeUsername, setStoreUsername] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [sites, setSites] = useState<StoreSite[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; site: StoreSite | null; loading: boolean }>({ open: false, site: null, loading: false });

  // Auth is the httpOnly fs_auth_token cookie now — `t` is kept only as a
  // truthy in-memory marker so existing call sites don't need restructuring.
  // Every fetch using these headers must also pass `credentials: 'include'`.
  const authHeaders = (t: string | null) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const loadSites = async (t: string) => {
    const res = await fetch(`${apiUrl}/v1/store/sites`, { credentials: 'include', headers: authHeaders(t) });
    const json = await res.json();
    if (res.ok) setSites(json.data || []);
  };

  useEffect(() => {
    const cachedStore = localStorage.getItem('store');
    if (cachedStore) {
      try {
        const parsed = JSON.parse(cachedStore);
        setStoreName(parsed.store_name || parsed.username || '');
        setStoreUsername(parsed.username || '');
      } catch { }
    }

    (async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/store`, { credentials: 'include', headers: authHeaders(null) });
        if (res.status === 401) {
          setToken(null);
          setLoading(false);
          return;
        }
        setToken('session');
        const json = await res.json();
        if (res.ok && json.data) {
          const hasStoreBuild = (json.data.plan_features || []).includes('store_build');
          setCanUseStoreBuild(hasStoreBuild);
          setStoreName(json.data.store_name || json.data.username || '');
          setStoreUsername(json.data.username || '');
          if (hasStoreBuild) await loadSites('session');
        }
      } catch {
        toast.error('Network error loading Store Build.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = async () => {
    if (!token || !newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(token),
        body: JSON.stringify({ name: newName.trim(), slug: slugify(newName) || `site-${Date.now()}` }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Site created.');
        setShowCreate(false);
        setNewName('');
        router.push(`/dashboard/store-build/${json.data.id}`);
      } else {
        toast.error(json.message || 'Could not create site.');
      }
    } catch {
      toast.error('Network error creating site.');
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (site: StoreSite) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${site.id}/duplicate`, { method: 'POST', credentials: 'include', headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) {
        toast.success('Site duplicated.');
        await loadSites(token);
      } else {
        toast.error(json.message || 'Could not duplicate site.');
      }
    } catch {
      toast.error('Network error duplicating site.');
    }
  };

  const requestDelete = (site: StoreSite) => setConfirmDialog({ open: true, site, loading: false });

  const handleDelete = async () => {
    if (!token || !confirmDialog.site) return;
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${confirmDialog.site.id}`, { method: 'DELETE', credentials: 'include', headers: authHeaders(token) });
      if (res.ok) {
        toast.success('Site deleted.');
        setSites((prev) => prev.filter((s) => s.id !== confirmDialog.site!.id));
      } else {
        toast.error('Could not delete site.');
      }
    } catch {
      toast.error('Network error deleting site.');
    } finally {
      setConfirmDialog({ open: false, site: null, loading: false });
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Loader2 size={28} className="spinner" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      <aside className="glass" style={{
        width: 260, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)',
        position: 'fixed', top: 0, left: 0, bottom: 0, height: '100vh', zIndex: 40, padding: '24px 16px', flexShrink: 0,
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

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <button
            onClick={() => router.push('/dashboard')}
            className="clickable"
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', borderRadius: 'var(--r-md)', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 14.5, fontWeight: 600, textAlign: 'left' }}
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
            <ThemeToggle />
          </div>
          <button onClick={handleLogout} className="btn btn-ghost clickable" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}>
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)' }} />
          <div style={{ position: 'relative', width: 260, background: 'var(--surface)', height: '100%', padding: 24 }}>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, background: 'none', border: 'none', color: 'var(--text)', fontWeight: 700 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="glass main-header" style={{ position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
          <button onClick={() => setIsMobileMenuOpen(true)} className="mobile-burger-btn" style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}>
            <Menu size={24} />
          </button>
          <span />
          <ThemeToggle />
        </header>

        <div style={{ padding: 'clamp(16px, 4vw, 32px)', flex: 1 }}>
          <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--r-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutTemplate size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, margin: 0 }}>Store Build</h1>
              </div>
              {canUseStoreBuild && (
                <button onClick={() => setShowCreate(true)} className="btn btn-primary clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--r-lg)' }}>
                  <Plus size={16} /> New site
                </button>
              )}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 28, maxWidth: 640 }}>
              Design your own storefront pages from a blank canvas — landing pages, seasonal microsites, course or wholesale sites — all pulling from the same products and orders, each with an optional custom domain.
            </p>

            {!canUseStoreBuild ? (
              <div className="card" style={{ padding: 28, textAlign: 'center', border: '1.5px dashed var(--border-strong)' }}>
                <Sparkles size={28} style={{ color: '#7c3aed', marginBottom: 12 }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>Store Build is a Frontstore Legend feature</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
                  Upgrade to Legend to design free-form storefront pages and connect a custom domain to each one.
                </p>
                <button onClick={() => router.push('/dashboard?page=billing')} className="btn btn-primary clickable" style={{ padding: '10px 20px', borderRadius: 'var(--r-lg)', background: '#7c3aed', borderColor: '#7c3aed' }}>
                  Upgrade to Legend
                </button>
              </div>
            ) : sites.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', border: '1.5px dashed var(--border-strong)' }}>
                <LayoutTemplate size={28} style={{ color: 'var(--primary)', marginBottom: 12 }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, margin: '0 0 8px' }}>Build your first site</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Start from a blank canvas — you can publish it, then attach a domain whenever you're ready.</p>
                <button onClick={() => setShowCreate(true)} className="btn btn-primary clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 'var(--r-lg)' }}>
                  <Plus size={16} /> New site
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {sites.map((site) => (
                  <div key={site.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <b style={{ fontSize: 15, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.name}</b>
                        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>/{storeUsername}/site/{site.slug}</span>
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                        background: site.is_published ? 'var(--primary-light)' : 'var(--bg-2)',
                        color: site.is_published ? 'var(--primary)' : 'var(--text-muted)',
                      }}>
                        {site.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {site.custom_domain && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Globe size={13} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.custom_domain}</span>
                        {site.domain_status === 'active' && <CheckCircle2 size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <button onClick={() => router.push(`/dashboard/store-build/${site.id}`)} className="btn btn-primary clickable" style={{ flex: 1, minWidth: 100, padding: '9px 12px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                        <PencilLine size={14} /> Edit
                      </button>
                      {site.is_published && (
                        <a href={`/${storeUsername}/site/${site.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline clickable" style={{ padding: '9px 10px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button onClick={() => handleDuplicate(site)} className="btn btn-outline clickable" style={{ padding: '9px 10px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Copy size={14} />
                      </button>
                      <button onClick={() => requestDelete(site)} className="btn btn-outline clickable" style={{ padding: '9px 10px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.45)' }}>
          <div style={{ width: 'min(100%, 420px)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 24, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>Name your site</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>You can rename this later — it just helps you tell your sites apart.</p>
            <input
              autoFocus
              className="form-control"
              placeholder="e.g. Wholesale Landing"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={{ width: '100%', marginBottom: 20 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => { setShowCreate(false); setNewName(''); }} disabled={creating} style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', borderRadius: 12, padding: '12px 18px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating || !newName.trim()} className="btn btn-primary clickable" style={{ borderRadius: 12, padding: '12px 18px' }}>
                {creating ? 'Creating…' : 'Create site'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete this site?"
        description={`"${confirmDialog.site?.name}" and its published page will be permanently removed. This can't be undone.`}
        confirmLabel="Delete site"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ open: false, site: null, loading: false })}
        loading={confirmDialog.loading}
      />

      <style jsx global>{`
        .main-content { margin-left: 260px; }
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          aside { display: none !important; }
          .mobile-burger-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
