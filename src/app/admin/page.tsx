'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Shield, BarChart3, Store, Tag, Settings, LogOut,
  Users, ShoppingBag, DollarSign, Activity, Search,
  Power, Trash2, Edit2, Plus, Check, X, RefreshCw,
  Mail, MessageSquare, ExternalLink, Globe, LayoutDashboard,
  Smartphone, Award, AlertTriangle, Key, Heart
} from 'lucide-react';

// --- Type Definitions ---
interface AdminStats {
  total_revenue: number;
  total_users: number;
  total_stores: number;
  active_stores: number;
  total_products: number;
  total_orders: number;
  plans: {
    pro: number;
    free: number;
  };
  revenue_trend: Array<{ month: string; total: number }>;
}

interface MerchantInfo {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  plan: string;
  created_at: string;
}

interface StoreInfo {
  id: string;
  store_name: string;
  username: string;
  is_active: boolean;
  user?: MerchantInfo | null;
  currency_code: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SystemSettings {
  app_name: string;
  logo_url: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  twilio_sid: string;
  twilio_auth_token: string;
  twilio_whatsapp_from: string;
  social_instagram: string;
  social_twitter: string;
  social_tiktok: string;
}

export default function AdminPage() {
  const router = useRouter();

  // --- Auth & Endpoint States ---
  const [token, setToken] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('https://api.aloaye.tech/api');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'categories' | 'settings'>('overview');

  // --- Stats tab State ---
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // --- Stores Directory State ---
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // --- Categories CRUD State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catActionSaving, setCatActionSaving] = useState(false);

  // --- Dynamic System Settings State ---
  const [settings, setSettings] = useState<SystemSettings>({
    app_name: '',
    logo_url: '',
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    twilio_sid: '',
    twilio_auth_token: '',
    twilio_whatsapp_from: '',
    social_instagram: '',
    social_twitter: '',
    social_tiktok: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Auth & Permissions check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';

      setApiUrl(savedApiUrl);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.is_admin) {
          setToken(storedToken);
          setIsAdmin(true);
          setIsAuthenticated(true);
        } else {
          setIsAdmin(false);
          setIsAuthenticated(true); // Is a merchant, but NOT an admin
        }
      } else {
        router.push('/login');
      }
      setIsAuthChecking(false);
    }
  }, [router]);

  // Headers helper
  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  // Fetch Overview Stats
  const loadStats = async () => {
    if (!token) return;
    try {
      setStatsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/stats`, { headers: getHeaders() });
      const json = await res.json();
      if (res.ok) {
        setStats(json.data);
      } else {
        throw new Error(json.message || 'Could not fetch dashboard analytics.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Stores list
  const loadStores = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setStoresLoading(true);
      const url = `${apiUrl}/v1/admin/stores?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: getHeaders() });
      const json = await res.json();
      if (res.ok) {
        setStores(json.data?.data || []);
        setCurrentPage(json.data?.current_page || 1);
        setLastPage(json.data?.last_page || 1);
      } else {
        throw new Error(json.message || 'Could not fetch stores directory.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStoresLoading(false);
    }
  };

  // Fetch Categories List
  const loadCategories = async () => {
    if (!token) return;
    try {
      setCategoriesLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories`, { headers: getHeaders() });
      const json = await res.json();
      if (res.ok) {
        setCategories(json.data || []);
      } else {
        throw new Error(json.message || 'Could not fetch global categories.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch dynamic system settings
  const loadSettings = async () => {
    if (!token) return;
    try {
      setSettingsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/settings`, { headers: getHeaders() });
      const json = await res.json();
      if (res.ok) {
        setSettings(json.data);
      } else {
        throw new Error(json.message || 'Could not fetch dynamic settings configurations.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Load correct tab data on tab switch
  useEffect(() => {
    if (token && isAdmin) {
      if (activeTab === 'overview') loadStats();
      if (activeTab === 'stores') loadStores(1, searchQuery);
      if (activeTab === 'categories') loadCategories();
      if (activeTab === 'settings') loadSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token, isAdmin]);

  // --- Handlers ---
  const handleToggleStoreStatus = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message);
        // Refresh local list smoothly
        setStores(stores.map(s => s.id === storeId ? { ...s, is_active: !s.is_active } : s));
      } else {
        throw new Error(json.message || 'Failed to update store status.');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Update merchant's plan (Upgrade to Pro / Downgrade to Free)
  const handleUpdateUserPlan = async (userId: string | undefined, plan: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`User plan updated to ${plan.toUpperCase()}! 🎉`);
        // Smoothly update state in local component
        setStores(stores.map(s => {
          if (s.user?.id === userId) {
            return {
              ...s,
              user: {
                ...s.user,
                plan
              }
            };
          }
          return s;
        }));
      } else {
        throw new Error(json.message || 'Failed to update user plan.');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCatActionSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newCatName }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Category created successfully! 🏷️');
        setNewCatName('');
        loadCategories();
      } else {
        throw new Error(json.message || 'Could not create category.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCatActionSaving(false);
    }
  };

  // Edit/Update Category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId || !editingCatName.trim()) return;
    try {
      setCatActionSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories/${editingCatId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: editingCatName }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Category updated successfully! 📝');
        setEditingCatId(null);
        setEditingCatName('');
        loadCategories();
      } else {
        throw new Error(json.message || 'Could not update category.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCatActionSaving(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this global category? Products mapped to this category will revert to uncategorized.')) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Category removed successfully!');
        loadCategories();
      } else {
        throw new Error(json.message || 'Could not delete category.');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/settings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('System settings saved successfully! ⚙️');
      } else {
        throw new Error(json.message || 'Could not save configurations.');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // --- UI Renders ---

  // Auth checking indicator
  if (isAuthChecking) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', gap: 16 }}>
        <RefreshCw style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} size={32} />
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Securing Administrator Dashboard...</p>
      </div>
    );
  }

  // Not an Admin layout (403 card)
  if (isAuthenticated && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', padding: 16 }} className="animate-fade-in">
        <div style={{ maxWidth: 440, width: '100%', padding: 32, textAlign: 'center' }} className="card glass">
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertTriangle style={{ color: 'var(--danger)' }} size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>Access Denied</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
            Your account does not have platform-level administrator permissions. If this is a mistake, please reach out to the system setup files.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => router.push('/dashboard')} className="btn btn-primary" style={{ width: '100%' }}>
              <LayoutDashboard size={18} /> Go to Store Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
      {/* Top Header Row */}
      <header style={{ height: 72, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield style={{ color: 'var(--primary)' }} size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {settings.app_name || 'aloaye'} <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--primary)', color: '#fff' }}>Admin</span>
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Platform Management Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>System Operator</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin@aloaye.tech</p>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: 8, borderRadius: 10 }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar Nav */}
        <aside style={{ width: 260, borderRight: '1px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <BarChart3 size={18} /> Overview & Stats
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Store size={18} /> Stores Directory
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Tag size={18} /> Global Categories
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Settings size={18} /> System Settings
          </button>
          
          <div style={{ marginTop: 'auto', padding: '16px 12px', borderRadius: 12, backgroundColor: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Aloaye System v2.1.2</p>
            <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>Crafted for Social Sellers</p>
          </div>
        </aside>

        {/* Content Tabs */}
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in stagger">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>Platform Performance</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Realtime database aggregation statistics across all stores</p>
                </div>
                <button onClick={loadStats} disabled={statsLoading} className="btn btn-outline" style={{ padding: 10, borderRadius: 10 }}>
                  <RefreshCw style={{ animation: statsLoading ? 'spin 1.5s linear infinite' : 'none' }} size={16} />
                </button>
              </div>

              {statsLoading && !stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                  {[1, 2, 3, 4].map(n => <div key={n} style={{ height: 120 }} className="shimmer-loader rounded-xl" />)}
                </div>
              ) : (
                <>
                  {/* Grid stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
                    
                    <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, var(--surface) 0%, var(--primary-light) 100%)', position: 'relative', overflow: 'hidden' }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>Total Platform Sales</p>
                      <h3 style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', marginTop: 8 }}>
                        ₦{(stats?.total_revenue || 0).toLocaleString()}
                      </h3>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Paid orders via Paystack/Direct Transfer</p>
                      <DollarSign style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.1, color: 'var(--primary)' }} size={90} />
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>Active Storefronts</p>
                      <h3 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginTop: 8 }}>
                        {stats?.active_stores || 0} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats?.total_stores || 0}</span>
                      </h3>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Stores loaded with active catalog views</p>
                      <Store style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05 }} size={90} />
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>Registered Merchants</p>
                      <h3 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginTop: 8 }}>
                        {stats?.total_users || 0}
                      </h3>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Independent merchant sellers</p>
                      <Users style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05 }} size={90} />
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>Catalog Items & Orders</p>
                      <h3 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginTop: 8 }}>
                        {stats?.total_products || 0} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>products</span>
                      </h3>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Over {stats?.total_orders || 0} orders recorded</p>
                      <ShoppingBag style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05 }} size={90} />
                    </div>

                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    
                    {/* Monthly Trend list */}
                    <div className="card" style={{ padding: 24 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={18} color="var(--primary)" /> Monthly Revenue breakdown
                      </h4>
                      {stats?.revenue_trend && stats.revenue_trend.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {stats.revenue_trend.map(t => (
                            <div key={t.month} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, backgroundColor: 'var(--bg)' }}>
                              <p style={{ fontWeight: 700, fontSize: 14 }}>{t.month}</p>
                              <p style={{ fontWeight: 800, color: 'var(--primary)' }}>₦{t.total.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No paid order trends tracked yet.</p>
                      )}
                    </div>

                    {/* Pro tier distributions */}
                    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Award size={18} color="var(--accent)" /> Premium Subscription share
                        </h4>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>Free vs Pro Merchant accounts split</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)' }} /> Pro Plan (₦3,999/mo)</span>
                            <span>{stats?.plans?.pro || 0}</span>
                          </div>
                          <div style={{ height: 10, width: '100%', borderRadius: 5, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stats?.total_users ? ((stats.plans.pro / stats.total_users) * 100) : 0}%`, backgroundColor: 'var(--primary)' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} /> Free Plan</span>
                            <span>{stats?.plans?.free || 0}</span>
                          </div>
                          <div style={{ height: 10, width: '100%', borderRadius: 5, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stats?.total_users ? ((stats.plans.free / stats.total_users) * 100) : 0}%`, backgroundColor: 'var(--text-muted)' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Paid Conversion:</span>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {stats?.total_users ? ((stats.plans.pro / stats.total_users) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: STORES DIRECTORY */}
          {activeTab === 'stores' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>Stores Directory</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search and manage active merchant stores on your network</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <form onSubmit={(e) => { e.preventDefault(); loadStores(1, searchQuery); }} style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Search store, merchant or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: 40, width: 280, paddingRight: 16 }}
                    />
                    <Search style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} size={16} />
                  </form>
                  
                  <button onClick={() => loadStores(1, searchQuery)} disabled={storesLoading} className="btn btn-outline" style={{ padding: 12, borderRadius: 10 }}>
                    <RefreshCw style={{ animation: storesLoading ? 'spin 1.5s linear infinite' : 'none' }} size={16} />
                  </button>
                </div>
              </div>

              {storesLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3, 4, 5].map(n => <div key={n} style={{ height: 64 }} className="shimmer-loader rounded-xl" />)}
                </div>
              ) : (
                <>
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-2)' }}>
                          <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase' }}>Store Details</th>
                          <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase' }}>Merchant Owner</th>
                          <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase' }}>Membership</th>
                          <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                          <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stores.length > 0 ? (
                          stores.map(store => (
                            <tr key={store.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 120ms ease' }} className="clickable-row">
                              <td style={{ padding: '16px 20px' }}>
                                <p style={{ fontWeight: 700, color: 'var(--text)' }}>{store.store_name}</p>
                                <a
                                  href={`http://${store.username}.localhost:3001`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}
                                >
                                  @{store.username} <ExternalLink size={10} />
                                </a>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <p style={{ fontWeight: 600 }}>{store.user?.name || 'Unnamed Merchant'}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{store.user?.phone_number}</p>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span className={`badge ${store.user?.plan && ['pro_monthly', 'pro_yearly'].includes(store.user.plan) ? 'badge-primary' : 'badge-ghost'}`}>
                                    {store.user?.plan === 'pro_yearly' ? 'PRO YEARLY' : store.user?.plan === 'pro_monthly' ? 'PRO MONTHLY' : 'FREE'}
                                  </span>
                                  <select
                                    value={store.user?.plan || 'free'}
                                    onChange={(e) => handleUpdateUserPlan(store.user?.id, e.target.value)}
                                    style={{
                                      padding: '6px 10px',
                                      fontSize: 12,
                                      borderRadius: 8,
                                      border: '1px solid var(--border)',
                                      backgroundColor: 'var(--bg-2)',
                                      color: 'var(--text)',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      outline: 'none',
                                      transition: 'border-color var(--t-fast)'
                                    }}
                                    disabled={!store.user}
                                  >
                                    <option value="free">Free Tier</option>
                                    <option value="pro_monthly">Pro Monthly</option>
                                    <option value="pro_yearly">Pro Yearly</option>
                                  </select>
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: store.is_active ? 'var(--primary)' : 'var(--danger)' }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: store.is_active ? 'var(--primary)' : 'var(--danger)' }} />
                                  {store.is_active ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <button
                                  onClick={() => handleToggleStoreStatus(store.id)}
                                  className={`btn ${store.is_active ? 'btn-ghost' : 'btn-primary'}`}
                                  style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8 }}
                                >
                                  <Power size={14} />
                                  {store.is_active ? 'Suspend' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                              No registered merchant stores matching your search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination row */}
                  {lastPage > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                      <button
                        onClick={() => loadStores(currentPage - 1, searchQuery)}
                        disabled={currentPage === 1}
                        className="btn btn-outline"
                        style={{ padding: '8px 16px', fontSize: 13 }}
                      >
                        Prev
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
                        Page {currentPage} of {lastPage}
                      </span>
                      <button
                        onClick={() => loadStores(currentPage + 1, searchQuery)}
                        disabled={currentPage === lastPage}
                        className="btn btn-outline"
                        style={{ padding: '8px 16px', fontSize: 13 }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: GLOBAL CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in" style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>Global Categories</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage global platform product categories. Storefronts dynamically consume this list.</p>
                </div>
                <button onClick={loadCategories} disabled={categoriesLoading} className="btn btn-outline" style={{ padding: 10, borderRadius: 10 }}>
                  <RefreshCw style={{ animation: categoriesLoading ? 'spin 1.5s linear infinite' : 'none' }} size={16} />
                </button>
              </div>

              {/* Form creation */}
              <div className="card glass" style={{ padding: 24, marginBottom: 32 }}>
                <form onSubmit={editingCatId ? handleUpdateCategory : handleCreateCategory} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                      {editingCatId ? 'Edit Category' : 'Create New Platform Category'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Health & Fitness, Gadgets, Baby Products..."
                      value={editingCatId ? editingCatName : newCatName}
                      onChange={(e) => editingCatId ? setEditingCatName(e.target.value) : setNewCatName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" disabled={catActionSaving} className="btn btn-primary" style={{ padding: '13px 24px' }}>
                    {catActionSaving ? (
                      <RefreshCw style={{ animation: 'spin 1.5s linear infinite' }} size={16} />
                    ) : editingCatId ? (
                      <Check size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    {editingCatId ? 'Update' : 'Add Category'}
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => { setEditingCatId(null); setEditingCatName(''); }}
                      className="btn btn-ghost"
                      style={{ padding: '13px 16px' }}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>

              {categoriesLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3, 4].map(n => <div key={n} style={{ height: 50 }} className="shimmer-loader rounded-xl" />)}
                </div>
              ) : (
                <div className="card">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <span>Category details ({categories.length})</span>
                    <span>Actions</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <div
                          key={cat.id}
                          style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text)' }}>{cat.name}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>slug: {cat.slug}</p>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                              className="btn btn-ghost"
                              style={{ padding: 8, color: 'var(--text)' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="btn btn-ghost"
                              style={{ padding: 8, color: 'var(--danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No global categories initialized.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in" style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>System Settings</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configure dynamially overridable platform integrations and settings</p>
                </div>
                <button onClick={loadSettings} disabled={settingsLoading} className="btn btn-outline" style={{ padding: 10, borderRadius: 10 }}>
                  <RefreshCw style={{ animation: settingsLoading ? 'spin 1.5s linear infinite' : 'none' }} size={16} />
                </button>
              </div>

              {settingsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ height: 150 }} className="shimmer-loader rounded-xl" />
                  <div style={{ height: 200 }} className="shimmer-loader rounded-xl" />
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Branding Card */}
                  <div className="card glass animate-slide-up" style={{ padding: 28, position: 'relative' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe size={18} color="var(--primary)" /> Platform Branding
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>App Display Name</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.app_name}
                          onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>App Logo URL</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.logo_url}
                          onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mail SMTP Card */}
                  <div className="card glass animate-slide-up" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={18} color="var(--primary)" /> Dynamic SMTP Mail Server
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>SMTP Host</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.smtp_host}
                          onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                          placeholder="e.g. smtp.mailgun.org"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>SMTP Port</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.smtp_port}
                          onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>SMTP Username</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.smtp_username}
                          onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>SMTP Password</label>
                        <input
                          type="password"
                          className="input-field"
                          value={settings.smtp_password}
                          onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Twilio configurations */}
                  <div className="card glass animate-slide-up" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Smartphone size={18} color="var(--primary)" /> Twilio Integrations (WhatsApp Alerts)
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Twilio SID</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.twilio_sid}
                          onChange={(e) => setSettings({ ...settings, twilio_sid: e.target.value })}
                          placeholder="AC..."
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Twilio Auth Token</label>
                        <input
                          type="password"
                          className="input-field"
                          value={settings.twilio_auth_token}
                          onChange={(e) => setSettings({ ...settings, twilio_auth_token: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Twilio WhatsApp Sender Number</label>
                      <input
                        type="text"
                        className="input-field"
                        value={settings.twilio_whatsapp_from}
                        onChange={(e) => setSettings({ ...settings, twilio_whatsapp_from: e.target.value })}
                        placeholder="whatsapp:+14155238886"
                      />
                    </div>
                  </div>

                  {/* Social Handles */}
                  <div className="card glass animate-slide-up" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={18} color="var(--primary)" /> Global Platform Socials
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Instagram Handle</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.social_instagram}
                          onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Twitter Handle</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.social_twitter}
                          onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>TikTok Handle</label>
                        <input
                          type="text"
                          className="input-field"
                          value={settings.social_tiktok}
                          onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="submit" disabled={settingsSaving} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 14 }}>
                      {settingsSaving ? (
                        <RefreshCw style={{ animation: 'spin 1.5s linear infinite' }} size={18} />
                      ) : (
                        <Check size={18} />
                      )}
                      Save Settings Configuration
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer style={{ height: 60, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-faint)', backgroundColor: 'var(--surface)' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Security Audited Platform &bull; Made with <Heart size={12} color="var(--danger)" style={{ fill: 'var(--danger)' }} /> for Charles Aloaye Platform Admin.
        </p>
      </footer>
    </div>
  );
}
