'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  DollarSign,
  Edit2,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Power,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Smartphone,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

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

type AdminTab = 'overview' | 'stores' | 'categories' | 'settings';

const defaultSettings: SystemSettings = {
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
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
  { id: 'stores', label: 'Stores', icon: <Store size={17} /> },
  { id: 'categories', label: 'Categories', icon: <Tag size={17} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
];

const formatMoney = (value?: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const planLabel = (plan?: string | null) => {
  if (plan === 'pro_yearly') return 'Pro Yearly';
  if (plan === 'pro_monthly') return 'Pro Monthly';
  return 'Free';
};

const isProPlan = (plan?: string | null) => plan === 'pro_monthly' || plan === 'pro_yearly';

export default function AdminPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('https://api.aloaye.tech/api');
  const [adminEmail, setAdminEmail] = useState('admin@aloaye.tech');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catActionSaving, setCatActionSaving] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const proRate = useMemo(() => {
    if (!stats?.total_users) return 0;
    return Math.round((stats.plans.pro / stats.total_users) * 1000) / 10;
  }, [stats]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';

    setApiUrl(savedApiUrl);

    const redirectToLogin = () => {
      router.replace('/login');
      setTimeout(() => {
        if (window.location.pathname !== '/login') window.location.replace('/login');
      }, 800);
    };

    if (!storedToken || !storedUser || storedUser === 'undefined' || storedUser === 'null') {
      redirectToLogin();
      setIsAuthChecking(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const userIsAdmin = parsedUser?.is_admin === true || parsedUser?.is_admin === 1 || parsedUser?.is_admin === 'true' || parsedUser?.is_admin === '1';
      setAdminEmail(parsedUser?.email || parsedUser?.phone_number || 'admin@aloaye.tech');
      setToken(storedToken);
      setIsAuthenticated(true);
      setIsAdmin(userIsAdmin);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      redirectToLogin();
    } finally {
      setIsAuthChecking(false);
    }
  }, [router]);

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  const handleFetchResponse = async (res: Response, defaultError: string) => {
    if (res.status === 401) {
      toast.error('Session expired. Please log in again.');
      localStorage.clear();
      router.push('/login');
      throw new Error('Session expired');
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || defaultError);
    return json;
  };

  const loadStats = async () => {
    if (!token) return;
    try {
      setStatsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/stats`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch dashboard analytics.');
      setStats(json.data);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadStores = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setStoresLoading(true);
      const url = `${apiUrl}/v1/admin/stores?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch stores directory.');
      setStores(json.data?.data || []);
      setCurrentPage(json.data?.current_page || 1);
      setLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setStoresLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!token) return;
    try {
      setCategoriesLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch global categories.');
      setCategories(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!token) return;
    try {
      setSettingsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/settings`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch settings.');
      setSettings({ ...defaultSettings, ...(json.data || {}) });
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !isAdmin) return;
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'stores') loadStores(1, searchQuery);
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'settings') loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token, isAdmin]);

  const handleToggleStoreStatus = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to update store status.');
      toast.success(json.message);
      setStores((items) => items.map((store) => (store.id === storeId ? { ...store, is_active: !store.is_active } : store)));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleUpdateUserPlan = async (userId: string | undefined, plan: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ plan }),
      });
      await handleFetchResponse(res, 'Failed to update user plan.');
      toast.success(`Plan updated to ${planLabel(plan)}.`);
      setStores((items) =>
        items.map((store) =>
          store.user?.id === userId
            ? {
                ...store,
                user: {
                  ...store.user,
                  plan,
                },
              }
            : store,
        ),
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleCreateCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCatActionSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      await handleFetchResponse(res, 'Could not create category.');
      toast.success('Category created.');
      setNewCatName('');
      loadCategories();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCatActionSaving(false);
    }
  };

  const handleUpdateCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCatId || !editingCatName.trim()) return;
    try {
      setCatActionSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories/${editingCatId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: editingCatName.trim() }),
      });
      await handleFetchResponse(res, 'Could not update category.');
      toast.success('Category updated.');
      setEditingCatId(null);
      setEditingCatName('');
      loadCategories();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCatActionSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this global category?')) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      await handleFetchResponse(res, 'Could not delete category.');
      toast.success('Category deleted.');
      loadCategories();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSettingsSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/settings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      });
      await handleFetchResponse(res, 'Could not save settings.');
      toast.success('Settings saved.');
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (isAuthChecking || !isAuthenticated) {
    return (
      <div className="admin-state-screen">
        <Loader2 className="admin-spin" size={30} />
        <p>Checking admin session</p>
        <AdminStyles />
      </div>
    );
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="admin-state-screen admin-state-screen--padded">
        <div className="admin-denied">
          <span className="admin-denied__icon">
            <AlertTriangle size={28} />
          </span>
          <h1>Access denied</h1>
          <p>This account does not have platform administrator permissions.</p>
          <div className="admin-denied__actions">
            <button onClick={() => router.push('/dashboard')} className="btn btn-primary">
              <LayoutDashboard size={17} /> Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-outline">
              <LogOut size={17} /> Log out
            </button>
          </div>
        </div>
        <AdminStyles />
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <div className="admin-brand">
          <span className="admin-brand__mark">
            <Shield size={21} />
          </span>
          <div>
            <strong>{settings.app_name || 'Aloaye'}</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-rail__footer">
          <span>Signed in</span>
          <strong>{adminEmail}</strong>
          <button type="button" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <p>Platform Console</p>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div className="admin-topbar__actions">
            <button type="button" className="admin-icon-button" onClick={() => (activeTab === 'overview' ? loadStats() : activeTab === 'stores' ? loadStores(currentPage, searchQuery) : activeTab === 'categories' ? loadCategories() : loadSettings())}>
              <RefreshCw size={17} className={statsLoading || storesLoading || categoriesLoading || settingsLoading ? 'admin-spin' : ''} />
            </button>
            <button type="button" className="admin-icon-button" onClick={handleLogout}>
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <div className="admin-mobile-tabs">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Platform health</h2>
                <p>Revenue, merchant activity, storefronts, and subscription split.</p>
              </div>
              <button type="button" className="btn btn-outline" onClick={loadStats} disabled={statsLoading}>
                <RefreshCw size={16} className={statsLoading ? 'admin-spin' : ''} /> Refresh
              </button>
            </div>

            {statsLoading && !stats ? (
              <SkeletonGrid />
            ) : (
              <>
                <div className="admin-metric-grid">
                  <Metric icon={<DollarSign size={18} />} label="Paid revenue" value={formatMoney(stats?.total_revenue)} tone="green" />
                  <Metric icon={<Users size={18} />} label="Merchants" value={(stats?.total_users || 0).toLocaleString()} detail={`${stats?.plans?.pro || 0} Pro`} />
                  <Metric icon={<Store size={18} />} label="Active stores" value={`${stats?.active_stores || 0}/${stats?.total_stores || 0}`} detail="Live storefronts" />
                  <Metric icon={<Package size={18} />} label="Catalog" value={(stats?.total_products || 0).toLocaleString()} detail={`${stats?.total_orders || 0} orders`} />
                </div>

                <div className="admin-overview-grid">
                  <div className="admin-panel">
                    <div className="admin-panel__header">
                      <div>
                        <h3>Monthly revenue</h3>
                        <p>Paid order value by month</p>
                      </div>
                      <TrendingUp size={18} />
                    </div>
                    {stats?.revenue_trend?.length ? (
                      <div className="admin-trend-list">
                        {stats.revenue_trend.map((item) => (
                          <div key={item.month} className="admin-trend-row">
                            <span>{item.month}</span>
                            <strong>{formatMoney(item.total)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState label="No paid revenue has been recorded yet." />
                    )}
                  </div>

                  <div className="admin-panel">
                    <div className="admin-panel__header">
                      <div>
                        <h3>Subscription mix</h3>
                        <p>{proRate}% of merchants are on Pro</p>
                      </div>
                      <Users size={18} />
                    </div>
                    <PlanMeter label="Pro" value={stats?.plans?.pro || 0} total={stats?.total_users || 0} tone="green" />
                    <PlanMeter label="Free" value={stats?.plans?.free || 0} total={stats?.total_users || 0} tone="gray" />
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'stores' && (
          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Merchant stores</h2>
                <p>Search, suspend, activate, and update subscription plans.</p>
              </div>
              <form className="admin-search" onSubmit={(event) => { event.preventDefault(); loadStores(1, searchQuery); }}>
                <Search size={16} />
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search stores, owners, email, phone" />
                <button type="submit">Search</button>
              </form>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Merchant</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {storesLoading ? (
                    <TableSkeleton rows={6} columns={5} />
                  ) : stores.length ? (
                    stores.map((store) => (
                      <tr key={store.id}>
                        <td>
                          <strong>{store.store_name}</strong>
                          <a href={`http://${store.username}.localhost:3001`} target="_blank" rel="noreferrer">
                            @{store.username} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td>
                          <strong>{store.user?.name || 'Unnamed merchant'}</strong>
                          <span>{store.user?.email || store.user?.phone_number || 'No contact'}</span>
                        </td>
                        <td>
                          <div className="admin-plan-cell">
                            <StatusChip tone={isProPlan(store.user?.plan) ? 'green' : 'gray'} label={planLabel(store.user?.plan)} />
                            <label className="admin-select">
                              <select value={store.user?.plan || 'free'} onChange={(event) => handleUpdateUserPlan(store.user?.id, event.target.value)} disabled={!store.user}>
                                <option value="free">Free</option>
                                <option value="pro_monthly">Pro Monthly</option>
                                <option value="pro_yearly">Pro Yearly</option>
                              </select>
                              <ChevronDown size={14} />
                            </label>
                          </div>
                        </td>
                        <td>
                          <StatusChip tone={store.is_active ? 'green' : 'red'} label={store.is_active ? 'Active' : 'Suspended'} />
                        </td>
                        <td className="admin-table__actions">
                          <button type="button" className={store.is_active ? 'admin-action danger' : 'admin-action'} onClick={() => handleToggleStoreStatus(store.id)}>
                            <Power size={15} />
                            {store.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState label="No stores match this search." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {lastPage > 1 && (
              <div className="admin-pagination">
                <button type="button" onClick={() => loadStores(currentPage - 1, searchQuery)} disabled={currentPage === 1}>
                  <ArrowLeft size={15} /> Previous
                </button>
                <span>
                  Page {currentPage} of {lastPage}
                </span>
                <button type="button" onClick={() => loadStores(currentPage + 1, searchQuery)} disabled={currentPage === lastPage}>
                  Next <ArrowRight size={15} />
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'categories' && (
          <section className="admin-section admin-section--narrow">
            <div className="admin-section-heading">
              <div>
                <h2>Global categories</h2>
                <p>Categories available to every merchant catalog.</p>
              </div>
            </div>

            <form className="admin-inline-form" onSubmit={editingCatId ? handleUpdateCategory : handleCreateCategory}>
              <input value={editingCatId ? editingCatName : newCatName} onChange={(event) => (editingCatId ? setEditingCatName(event.target.value) : setNewCatName(event.target.value))} placeholder="Category name" />
              <button type="submit" className="btn btn-primary" disabled={catActionSaving}>
                {catActionSaving ? <Loader2 className="admin-spin" size={16} /> : editingCatId ? <Check size={16} /> : <Plus size={16} />}
                {editingCatId ? 'Update' : 'Add'}
              </button>
              {editingCatId && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditingCatId(null); setEditingCatName(''); }}>
                  <X size={16} /> Cancel
                </button>
              )}
            </form>

            <div className="admin-list">
              {categoriesLoading ? (
                [1, 2, 3, 4].map((item) => <div key={item} className="admin-list-skeleton" />)
              ) : categories.length ? (
                categories.map((category) => (
                  <div className="admin-list-row" key={category.id}>
                    <div>
                      <strong>{category.name}</strong>
                      <span>{category.slug}</span>
                    </div>
                    <div>
                      <button type="button" onClick={() => { setEditingCatId(category.id); setEditingCatName(category.name); }}>
                        <Edit2 size={15} />
                      </button>
                      <button type="button" className="danger" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState label="No categories have been created." />
              )}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="admin-section admin-section--narrow">
            <div className="admin-section-heading">
              <div>
                <h2>System settings</h2>
                <p>Branding, mail, Twilio, and social account configuration.</p>
              </div>
            </div>

            {settingsLoading ? (
              <SkeletonGrid />
            ) : (
              <form className="admin-settings-form" onSubmit={handleSaveSettings}>
                <SettingsGroup icon={<Globe size={17} />} title="Branding">
                  <Field label="App name" value={settings.app_name} onChange={(value) => setSettings({ ...settings, app_name: value })} required />
                  <Field label="Logo URL" value={settings.logo_url} onChange={(value) => setSettings({ ...settings, logo_url: value })} />
                </SettingsGroup>

                <SettingsGroup icon={<Mail size={17} />} title="SMTP mail">
                  <Field label="Host" value={settings.smtp_host} onChange={(value) => setSettings({ ...settings, smtp_host: value })} />
                  <Field label="Port" value={settings.smtp_port} onChange={(value) => setSettings({ ...settings, smtp_port: value })} />
                  <Field label="Username" value={settings.smtp_username} onChange={(value) => setSettings({ ...settings, smtp_username: value })} />
                  <Field label="Password" type="password" value={settings.smtp_password} onChange={(value) => setSettings({ ...settings, smtp_password: value })} />
                </SettingsGroup>

                <SettingsGroup icon={<Smartphone size={17} />} title="Twilio">
                  <Field label="SID" value={settings.twilio_sid} onChange={(value) => setSettings({ ...settings, twilio_sid: value })} />
                  <Field label="Auth token" type="password" value={settings.twilio_auth_token} onChange={(value) => setSettings({ ...settings, twilio_auth_token: value })} />
                  <Field label="WhatsApp sender" value={settings.twilio_whatsapp_from} onChange={(value) => setSettings({ ...settings, twilio_whatsapp_from: value })} />
                </SettingsGroup>

                <SettingsGroup icon={<MessageSquare size={17} />} title="Socials">
                  <Field label="Instagram" value={settings.social_instagram} onChange={(value) => setSettings({ ...settings, social_instagram: value })} />
                  <Field label="Twitter" value={settings.social_twitter} onChange={(value) => setSettings({ ...settings, social_twitter: value })} />
                  <Field label="TikTok" value={settings.social_tiktok} onChange={(value) => setSettings({ ...settings, social_tiktok: value })} />
                </SettingsGroup>

                <div className="admin-form-footer">
                  <button type="submit" className="btn btn-primary" disabled={settingsSaving}>
                    {settingsSaving ? <Loader2 className="admin-spin" size={17} /> : <Check size={17} />}
                    Save settings
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </main>
      <AdminStyles />
    </div>
  );
}

function Metric({ icon, label, value, detail, tone = 'gray' }: { icon: React.ReactNode; label: string; value: string; detail?: string; tone?: 'green' | 'gray' }) {
  return (
    <div className={`admin-metric admin-metric--${tone}`}>
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: 'green' | 'gray' | 'red' }) {
  return <span className={`admin-chip admin-chip--${tone}`}>{label}</span>;
}

function PlanMeter({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'green' | 'gray' }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="admin-meter">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <span className="admin-meter__track">
        <span className={`admin-meter__fill admin-meter__fill--${tone}`} style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="admin-empty">{label}</div>;
}

function SkeletonGrid() {
  return (
    <div className="admin-metric-grid">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="admin-skeleton" />
      ))}
    </div>
  );
}

function TableSkeleton({ rows, columns }: { rows: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: columns }).map((__, column) => (
            <td key={column}>
              <span className="admin-table-skeleton" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}

function SettingsGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="admin-settings-group">
      <legend>
        {icon}
        {title}
      </legend>
      <div>{children}</div>
    </fieldset>
  );
}

function AdminStyles() {
  return (
    <style jsx global>{`
      .admin-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        background: var(--bg);
        color: var(--text);
      }

      .admin-rail {
        position: sticky;
        top: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 20px 16px;
        background: var(--surface);
        border-right: 1px solid var(--border);
      }

      .admin-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 8px 18px;
        border-bottom: 1px solid var(--border);
      }

      .admin-brand__mark {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        color: var(--primary);
        background: var(--primary-light);
      }

      .admin-brand strong,
      .admin-brand span {
        display: block;
      }

      .admin-brand strong {
        font-family: var(--font-heading);
        font-size: 17px;
        line-height: 1.1;
      }

      .admin-brand div > span {
        margin-top: 3px;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .admin-nav {
        display: grid;
        gap: 6px;
      }

      .admin-nav button,
      .admin-mobile-tabs button,
      .admin-icon-button,
      .admin-action,
      .admin-pagination button,
      .admin-list-row button,
      .admin-rail__footer button {
        border: 0;
        cursor: pointer;
        font: inherit;
      }

      .admin-nav button {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 42px;
        padding: 0 12px;
        border-radius: 8px;
        color: var(--text-muted);
        background: transparent;
        font-size: 14px;
        font-weight: 750;
        text-align: left;
      }

      .admin-nav button:hover,
      .admin-nav button.is-active {
        color: var(--text);
        background: var(--surface-2);
      }

      .admin-nav button.is-active {
        color: var(--primary);
        box-shadow: inset 3px 0 0 var(--primary);
      }

      .admin-rail__footer {
        margin-top: auto;
        display: grid;
        gap: 6px;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface-2);
      }

      .admin-rail__footer span {
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .admin-rail__footer strong {
        overflow: hidden;
        color: var(--text);
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .admin-rail__footer button {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
        padding: 8px 0 0;
        color: var(--danger);
        background: transparent;
        border-top: 1px solid var(--border);
        font-size: 13px;
        font-weight: 750;
      }

      .admin-workspace {
        min-width: 0;
        padding: 22px clamp(16px, 3vw, 36px) 40px;
      }

      .admin-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }

      .admin-topbar p {
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .admin-topbar h1 {
        margin-top: 2px;
        font-family: var(--font-heading);
        font-size: clamp(24px, 3vw, 34px);
        letter-spacing: 0;
      }

      .admin-topbar__actions {
        display: flex;
        gap: 8px;
      }

      .admin-icon-button {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        color: var(--text-2);
        background: var(--surface);
        border: 1px solid var(--border);
      }

      .admin-mobile-tabs {
        display: none;
      }

      .admin-section {
        display: grid;
        gap: 18px;
      }

      .admin-section--narrow {
        max-width: 960px;
      }

      .admin-section-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
      }

      .admin-section-heading h2 {
        font-family: var(--font-heading);
        font-size: 20px;
        line-height: 1.2;
      }

      .admin-section-heading p {
        margin-top: 4px;
        color: var(--text-muted);
        font-size: 13px;
      }

      .admin-metric-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .admin-metric,
      .admin-panel,
      .admin-table-wrap,
      .admin-inline-form,
      .admin-list,
      .admin-settings-group {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: var(--shadow-xs);
      }

      .admin-metric {
        min-height: 136px;
        padding: 16px;
      }

      .admin-metric > span {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        color: var(--text-2);
        background: var(--surface-2);
      }

      .admin-metric--green > span {
        color: var(--primary);
        background: var(--primary-light);
      }

      .admin-metric p {
        margin-top: 16px;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .admin-metric strong {
        display: block;
        margin-top: 5px;
        font-family: var(--font-heading);
        font-size: 25px;
        line-height: 1;
      }

      .admin-metric small {
        display: block;
        margin-top: 8px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .admin-overview-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.8fr);
        gap: 12px;
      }

      .admin-panel {
        padding: 18px;
      }

      .admin-panel__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .admin-panel__header h3,
      .admin-settings-group legend {
        color: var(--text);
        font-size: 15px;
        font-weight: 850;
      }

      .admin-panel__header p {
        margin-top: 3px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .admin-trend-list,
      .admin-settings-form {
        display: grid;
        gap: 10px;
      }

      .admin-trend-row,
      .admin-list-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .admin-trend-row {
        padding: 11px 12px;
        border-radius: 8px;
        background: var(--surface-2);
      }

      .admin-trend-row span,
      .admin-meter span,
      .admin-list-row span {
        color: var(--text-muted);
        font-size: 13px;
      }

      .admin-trend-row strong {
        color: var(--primary);
        font-size: 14px;
      }

      .admin-meter {
        display: grid;
        gap: 8px;
        margin-top: 18px;
      }

      .admin-meter > div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
      }

      .admin-meter__track {
        height: 9px;
        overflow: hidden;
        border-radius: 99px;
        background: var(--surface-2);
      }

      .admin-meter__fill {
        display: block;
        height: 100%;
        border-radius: inherit;
      }

      .admin-meter__fill--green {
        background: var(--primary);
      }

      .admin-meter__fill--gray {
        background: var(--text-muted);
      }

      .admin-search {
        min-width: min(460px, 100%);
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr) auto;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        overflow: hidden;
      }

      .admin-search svg {
        margin-left: 13px;
        color: var(--text-muted);
      }

      .admin-search input,
      .admin-inline-form input,
      .admin-field input {
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        color: var(--text);
        background: transparent;
        font: inherit;
      }

      .admin-search input {
        height: 42px;
        font-size: 14px;
      }

      .admin-search button {
        height: 42px;
        padding: 0 14px;
        border: 0;
        border-left: 1px solid var(--border);
        color: var(--primary);
        background: var(--primary-light);
        font-weight: 800;
        cursor: pointer;
      }

      .admin-table-wrap {
        overflow: auto;
      }

      .admin-table {
        width: 100%;
        min-width: 860px;
        border-collapse: collapse;
        text-align: left;
      }

      .admin-table th {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border);
        color: var(--text-muted);
        background: var(--surface-2);
        font-size: 11px;
        font-weight: 850;
        text-transform: uppercase;
      }

      .admin-table td {
        padding: 14px;
        border-bottom: 1px solid var(--border);
        vertical-align: middle;
      }

      .admin-table tbody tr:last-child td {
        border-bottom: 0;
      }

      .admin-table td strong,
      .admin-table td span,
      .admin-table td a {
        display: block;
      }

      .admin-table td strong {
        font-size: 14px;
      }

      .admin-table td span,
      .admin-table td a {
        margin-top: 3px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .admin-table td a {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--primary);
        font-weight: 750;
      }

      .admin-table__actions {
        text-align: right;
      }

      .admin-plan-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .admin-chip {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        border-radius: 999px;
        padding: 4px 9px;
        font-size: 11px;
        font-weight: 850;
        text-transform: uppercase;
      }

      .admin-chip--green {
        color: var(--primary);
        background: var(--primary-light);
      }

      .admin-chip--gray {
        color: var(--text-muted);
        background: var(--surface-2);
      }

      .admin-chip--red {
        color: var(--danger);
        background: var(--danger-light);
      }

      .admin-select {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .admin-select select {
        height: 32px;
        min-width: 126px;
        padding: 0 28px 0 10px;
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        background: var(--surface);
        font-size: 12px;
        font-weight: 750;
        outline: 0;
        appearance: none;
      }

      .admin-select svg {
        position: absolute;
        right: 9px;
        pointer-events: none;
        color: var(--text-muted);
      }

      .admin-action {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 34px;
        padding: 0 11px;
        border-radius: 8px;
        color: var(--primary);
        background: var(--primary-light);
        font-size: 12px;
        font-weight: 850;
      }

      .admin-action.danger {
        color: var(--danger);
        background: var(--danger-light);
      }

      .admin-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .admin-pagination button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 36px;
        padding: 0 13px;
        border-radius: 8px;
        color: var(--text);
        background: var(--surface);
        border: 1px solid var(--border);
        font-size: 13px;
        font-weight: 750;
      }

      .admin-pagination button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .admin-pagination span {
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 750;
      }

      .admin-inline-form {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 10px;
        padding: 12px;
      }

      .admin-inline-form input,
      .admin-field input {
        height: 42px;
        padding: 0 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        font-size: 14px;
      }

      .admin-list {
        overflow: hidden;
      }

      .admin-list-row {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
      }

      .admin-list-row:last-child {
        border-bottom: 0;
      }

      .admin-list-row strong {
        display: block;
        font-size: 14px;
      }

      .admin-list-row button {
        width: 34px;
        height: 34px;
        display: inline-grid;
        place-items: center;
        margin-left: 6px;
        border-radius: 8px;
        color: var(--text-2);
        background: var(--surface-2);
      }

      .admin-list-row button.danger {
        color: var(--danger);
        background: var(--danger-light);
      }

      .admin-settings-group {
        min-width: 0;
        padding: 16px;
      }

      .admin-settings-group legend {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 6px;
      }

      .admin-settings-group legend svg {
        color: var(--primary);
      }

      .admin-settings-group > div {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        padding-top: 10px;
      }

      .admin-field span {
        display: block;
        margin-bottom: 6px;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 850;
        text-transform: uppercase;
      }

      .admin-form-footer {
        display: flex;
        justify-content: flex-end;
      }

      .admin-empty {
        display: grid;
        place-items: center;
        min-height: 110px;
        padding: 22px;
        color: var(--text-muted);
        font-size: 13px;
        text-align: center;
      }

      .admin-state-screen {
        min-height: 100vh;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 14px;
        background: var(--bg);
      }

      .admin-state-screen--padded {
        padding: 16px;
      }

      .admin-state-screen p {
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 750;
      }

      .admin-denied {
        width: min(430px, 100%);
        display: grid;
        justify-items: center;
        gap: 14px;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        text-align: center;
      }

      .admin-denied__icon {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: var(--danger);
        background: var(--danger-light);
      }

      .admin-denied h1 {
        font-size: 24px;
      }

      .admin-denied__actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        width: 100%;
        margin-top: 6px;
      }

      .admin-skeleton,
      .admin-list-skeleton,
      .admin-table-skeleton {
        display: block;
        border-radius: 8px;
        background: linear-gradient(90deg, var(--surface-2) 25%, var(--border) 37%, var(--surface-2) 63%);
        background-size: 400% 100%;
        animation: admin-shimmer 1.2s ease-in-out infinite;
      }

      .admin-skeleton {
        height: 136px;
      }

      .admin-list-skeleton {
        height: 62px;
        margin: 10px;
      }

      .admin-table-skeleton {
        width: 100%;
        height: 18px;
      }

      .admin-spin {
        animation: admin-spin 0.9s linear infinite;
      }

      @keyframes admin-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes admin-shimmer {
        0% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0 50%;
        }
      }

      @media (max-width: 1120px) {
        .admin-shell {
          grid-template-columns: 1fr;
        }

        .admin-rail {
          display: none;
        }

        .admin-mobile-tabs {
          position: sticky;
          top: 0;
          z-index: 5;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 8px 0 14px;
          margin-bottom: 4px;
          background: var(--bg);
        }

        .admin-mobile-tabs button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 36px;
          padding: 0 12px;
          border-radius: 8px;
          color: var(--text-muted);
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .admin-mobile-tabs button.is-active {
          color: var(--primary);
          border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
          background: var(--primary-light);
        }
      }

      @media (max-width: 900px) {
        .admin-section-heading {
          align-items: stretch;
          flex-direction: column;
        }

        .admin-metric-grid,
        .admin-overview-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .admin-search {
          min-width: 0;
          width: 100%;
        }

        .admin-settings-group > div {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 620px) {
        .admin-workspace {
          padding: 16px 12px 28px;
        }

        .admin-topbar {
          align-items: flex-start;
        }

        .admin-topbar h1 {
          font-size: 25px;
        }

        .admin-metric-grid,
        .admin-overview-grid,
        .admin-inline-form,
        .admin-denied__actions {
          grid-template-columns: 1fr;
        }

        .admin-search {
          grid-template-columns: 34px minmax(0, 1fr);
        }

        .admin-search button {
          grid-column: 1 / -1;
          border-top: 1px solid var(--border);
          border-left: 0;
        }

        .admin-plan-cell {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `}</style>
  );
}
