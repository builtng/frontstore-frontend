'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
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
  Sparkles,
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
  custom_domain?: string | null;
  verification_status?: string | null;
  withdrawable_balance?: number;
  pending_balance?: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
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
  system_domain: string;
  store_disclaimer: string;
  homepage_content: string;
}

type AdminTab = 'overview' | 'stores' | 'orders' | 'categories' | 'withdrawals' | 'verifications' | 'settings';

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
  system_domain: '',
  store_disclaimer: '',
  homepage_content: '',
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
  { id: 'stores', label: 'Stores', icon: <Store size={17} /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag size={17} /> },
  { id: 'categories', label: 'Categories', icon: <Tag size={17} /> },
  { id: 'withdrawals', label: 'Payouts', icon: <DollarSign size={17} /> },
  { id: 'verifications', label: 'Verifications', icon: <Shield size={17} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
];

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
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
  const [apiUrl, setApiUrl] = useState('https://api.frontstore.app/api');
  const [adminEmail, setAdminEmail] = useState('admin@frontstore.app');
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

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLastPage, setOrdersLastPage] = useState(1);

  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => Promise<void>;
    loading: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: async () => { },
    loading: false,
  });

  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);

  const openConfirmationDialog = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel'
  ) => {
    setConfirmationDialog({
      open: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      loading: false,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog((prev) => ({ ...prev, open: false, loading: false }));
  };

  const executeConfirmationDialog = async () => {
    setConfirmationDialog((prev) => ({ ...prev, loading: true }));
    try {
      await confirmationDialog.onConfirm();
    } finally {
      closeConfirmationDialog();
    }
  };

  const proRate = useMemo(() => {
    if (!stats?.total_users) return 0;
    return Math.round((stats.plans.pro / stats.total_users) * 1000) / 10;
  }, [stats]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

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
      setAdminEmail(parsedUser?.email || parsedUser?.phone_number || 'admin@frontstore.app');
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

  const loadWithdrawals = async () => {
    if (!token) return;
    try {
      setWithdrawalsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/withdrawals`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch withdrawals list.');
      setWithdrawals(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const loadVerifications = async () => {
    if (!token) return;
    try {
      setVerificationsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/verifications`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch verifications list.');
      setVerifications(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setVerificationsLoading(false);
    }
  };

  const loadOrders = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setOrdersLoading(true);
      const url = `${apiUrl}/v1/admin/orders?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch platform orders.');
      setOrders(json.data?.data || []);
      setOrdersPage(json.data?.current_page || 1);
      setOrdersLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleApproveWithdrawal = (id: string) => {
    openConfirmationDialog(
      'Approve withdrawal',
      'Approve this withdrawal payout? This confirms you have sent the bank transfer.',
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/withdrawals/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to approve withdrawal.');
          toast.success(json.message || 'Withdrawal approved.');
          loadWithdrawals();
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Approve',
      'Cancel'
    );
  };

  const handleRejectWithdrawal = (id: string) => {
    openConfirmationDialog(
      'Reject withdrawal',
      'Reject this withdrawal payout? The funds will be refunded back to the store withdrawable balance.',
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/withdrawals/${id}/reject`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject withdrawal.');
          toast.success(json.message || 'Withdrawal rejected & refunded.');
          loadWithdrawals();
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Reject',
      'Cancel'
    );
  };

  const handleApproveVerification = (id: string) => {
    openConfirmationDialog(
      'Approve verification',
      'Approve this store verification request? This will activate the verified badge on their storefront.',
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/verifications/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to approve verification.');
          toast.success(json.message || 'Verification approved.');
          loadVerifications();
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Approve',
      'Cancel'
    );
  };

  const handleRejectVerification = (id: string) => {
    openConfirmationDialog(
      'Reject verification',
      'Reject this store verification request?',
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/verifications/${id}/reject`, {
            method: 'POST',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject verification.');
          toast.success(json.message || 'Verification rejected.');
          loadVerifications();
        } catch (error: any) {
          if (error.message !== 'Session expired') toast.error(error.message);
        }
      },
      'Reject',
      'Cancel'
    );
  };

  useEffect(() => {
    if (!token || !isAdmin) return;
    if (activeTab === 'overview') {
      loadStats();
      loadStores(1, '');
    }
    if (activeTab === 'stores') loadStores(1, searchQuery);
    if (activeTab === 'orders') loadOrders(1, ordersSearch);
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'withdrawals') loadWithdrawals();
    if (activeTab === 'verifications') loadVerifications();
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

  const handleDeleteCategory = (id: string) => {
    openConfirmationDialog(
      'Delete category',
      'Delete this global category?',
      async () => {
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
      },
      'Delete',
      'Cancel'
    );
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
          <strong>{settings.app_name || 'Frontstore'}</strong>
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
          <button type="button" className="admin-icon-button" onClick={() => {
            if (activeTab === 'overview') { loadStats(); loadStores(1, ''); }
            else if (activeTab === 'stores') loadStores(currentPage, searchQuery);
            else if (activeTab === 'orders') loadOrders(ordersPage, ordersSearch);
            else if (activeTab === 'categories') loadCategories();
            else if (activeTab === 'settings') loadSettings();
            else if (activeTab === 'withdrawals') loadWithdrawals();
            else if (activeTab === 'verifications') loadVerifications();
          }}>
            <RefreshCw size={17} className={statsLoading || storesLoading || ordersLoading || categoriesLoading || settingsLoading || withdrawalsLoading || verificationsLoading ? 'admin-spin' : ''} />
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
                    <div className="admin-chart-container">
                      <div className="admin-chart">
                        {stats.revenue_trend.map((item: any) => {
                          const maxVal = Math.max(...stats.revenue_trend.map((r: any) => r.total)) || 1;
                          const heightPercent = Math.min(100, Math.max(10, (item.total / maxVal) * 100));
                          return (
                            <div key={item.month} className="admin-chart-bar-wrapper">
                              <div className="admin-chart-bar-tooltip">
                                <span className="tooltip-date">{item.month}</span>
                                <strong className="tooltip-value">{formatMoney(item.total)}</strong>
                              </div>
                              <div className="admin-chart-bar" style={{ height: `${heightPercent}%` }}>
                                <span className="admin-chart-bar-fill" />
                              </div>
                              <span className="admin-chart-bar-label">{item.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <EmptyState label="No paid revenue has been recorded yet." />
                  )}
                </div>

                <div className="admin-panel admin-flex-column-panel">
                  <div className="admin-panel-sub-card">
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

                  <div className="admin-panel-sub-card border-top-divider">
                    <div className="admin-panel__header" style={{ marginBottom: 12 }}>
                      <div>
                        <h3>Top stores</h3>
                        <p>Most active stores listed in console</p>
                      </div>
                      <Store size={18} />
                    </div>
                    <div className="admin-top-stores-list">
                      {stores.slice(0, 3).map((store) => (
                        <div key={store.id} className="admin-top-store-row" onClick={() => setSelectedStore(store)} style={{ cursor: 'pointer' }}>
                          <div>
                            <strong>{store.store_name}</strong>
                            <span>@{store.username}</span>
                          </div>
                          <span className={`admin-chip admin-chip--${isProPlan(store.user?.plan) ? 'green' : 'gray'}`}>
                            {planLabel(store.user?.plan)}
                          </span>
                        </div>
                      ))}
                      {!stores.length && <span className="admin-no-data-hint">No stores registered yet</span>}
                    </div>
                  </div>
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
                    <tr key={store.id} onClick={() => setSelectedStore(store)} style={{ cursor: 'pointer' }} className="admin-table-row-hoverable">
                      <td>
                        <strong>{store.store_name}</strong>
                        <a href={store.custom_domain ? `https://${store.custom_domain}` : `https://frontstore.app/${store.username}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
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
                          <label className="admin-select" onClick={(e) => e.stopPropagation()}>
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
                        <button type="button" className={store.is_active ? 'admin-action danger' : 'admin-action'} onClick={(e) => { e.stopPropagation(); handleToggleStoreStatus(store.id); }}>
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

      {activeTab === 'orders' && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Platform Transaction Audit</h2>
              <p>Monitor customer orders, payment status, and order totals across all merchants.</p>
            </div>
            <form className="admin-search" onSubmit={(event) => { event.preventDefault(); loadOrders(1, ordersSearch); }}>
              <Search size={16} />
              <input value={ordersSearch} onChange={(event) => setOrdersSearch(event.target.value)} placeholder="Search orders, store name, customer name" />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Store</th>
                  <th>Customer details</th>
                  <th>Subtotal</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <TableSkeleton rows={6} columns={6} />
                ) : orders.length ? (
                  orders.map((order) => {
                    const dateStr = new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    const currencySymbol = order.store?.currency_code === 'NGN' ? '₦' : (order.store?.currency_code || '₦');
                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.order_number}</strong>
                          <span>{order.payment_method ? order.payment_method.toUpperCase() : 'WHATSAPP'}</span>
                        </td>
                        <td>
                          <strong>{order.store?.store_name || 'Unknown Store'}</strong>
                          <span>@{order.store?.username}</span>
                        </td>
                        <td>
                          <strong>{order.customer_name}</strong>
                          <span>{order.customer_phone || order.customer_email}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--primary)' }}>{currencySymbol}{Number(order.total_amount).toLocaleString()}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <StatusChip tone={order.payment_status === 'paid' ? 'green' : 'red'} label={`Payment: ${order.payment_status}`} />
                            <StatusChip tone={order.order_status === 'completed' ? 'green' : order.order_status === 'cancelled' ? 'red' : 'gray'} label={`Order: ${order.order_status}`} />
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12 }}>{dateStr}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState label="No orders match this search." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {ordersLastPage > 1 && (
            <div className="admin-pagination">
              <button type="button" onClick={() => loadOrders(ordersPage - 1, ordersSearch)} disabled={ordersPage === 1}>
                <ArrowLeft size={15} /> Previous
              </button>
              <span>
                Page {ordersPage} of {ordersLastPage}
              </span>
              <button type="button" onClick={() => loadOrders(ordersPage + 1, ordersSearch)} disabled={ordersPage === ordersLastPage}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          )}
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
              <SettingsGroup icon={<Globe size={17} />} title="Branding & Domain settings">
                <Field label="App name" value={settings.app_name} onChange={(value) => setSettings({ ...settings, app_name: value })} required />
                <Field label="Logo URL" value={settings.logo_url} onChange={(value) => setSettings({ ...settings, logo_url: value })} />
                <Field
                  label="System Domain"
                  value={settings.system_domain}
                  onChange={(value) => setSettings({ ...settings, system_domain: value })}
                  placeholder="e.g. frontstore.app"
                  description="The main platform domain used for link generation and routing."
                  required
                />
                <Field
                  label="Global Storefront Disclaimer"
                  value={settings.store_disclaimer}
                  onChange={(value) => setSettings({ ...settings, store_disclaimer: value })}
                  placeholder="e.g. Ensure you go through products before paying kind message"
                  description="The disclaimer message shown to buyers across all store checkout pages."
                  required
                />
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

              <SettingsGroup icon={<Sparkles size={17} />} title="Homepage content">
                <TextAreaField
                  label="Homepage content JSON"
                  value={settings.homepage_content}
                  onChange={(value) => setSettings({ ...settings, homepage_content: value })}
                  rows={18}
                  placeholder='{"hero":{"titlePrefix":"Turn WhatsApp Conversations Into","titleHighlight":"Sales"}}'
                  description="Controls hero text, badges, buttons, stats, narrative, platform suite, comparison, vision, how-it-works, features, and testimonials. Leave blank to use default homepage copy."
                />
              </SettingsGroup>

              <SettingsGroup icon={<Shield size={17} />} title="System Connection Health">
                <div className="admin-health-grid">
                  <div className="admin-health-item">
                    <div>
                      <strong>Laravel Backend API</strong>
                      <span>Endpoint connection secure</span>
                    </div>
                    <span className="admin-health-dot online" />
                  </div>
                  <div className="admin-health-item">
                    <div>
                      <strong>Platform SQLite Database</strong>
                      <span>Write and read operations active</span>
                    </div>
                    <span className="admin-health-dot online" />
                  </div>
                  <div className="admin-health-item">
                    <div>
                      <strong>Twilio WhatsApp Service</strong>
                      <span>Webhook listener online</span>
                    </div>
                    <span className="admin-health-dot online" />
                  </div>
                  <div className="admin-health-item">
                    <div>
                      <strong>Paystack API Gateway</strong>
                      <span>Key authentication success</span>
                    </div>
                    <span className="admin-health-dot online" />
                  </div>
                </div>
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

      {activeTab === 'withdrawals' && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Withdrawal requests</h2>
              <p>Review and approve pending withdrawal payout requests from store wallets.</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={loadWithdrawals} disabled={withdrawalsLoading}>
              <RefreshCw size={16} className={withdrawalsLoading ? 'admin-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Store / Merchant</th>
                  <th>Amount</th>
                  <th>Destination Bank details</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {withdrawalsLoading ? (
                  <TableSkeleton rows={6} columns={6} />
                ) : withdrawals.length ? (
                  withdrawals.map((w: any) => {
                    const dateStr = new Date(w.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    return (
                      <tr key={w.id}>
                        <td>
                          <strong>{w.store?.store_name || 'Unknown Store'}</strong>
                          <span>{w.store?.user?.email || w.store?.user?.phone_number || 'No contact'}</span>
                        </td>
                        <td>
                          <strong style={{ fontSize: 15 }}>{formatMoney(w.amount, w.store?.currency_code)}</strong>
                        </td>
                        <td>
                          <strong>{w.bank_name}</strong>
                          <span>{w.account_number} • {w.account_name}</span>
                        </td>
                        <td>
                          <span>{dateStr}</span>
                        </td>
                        <td>
                          <StatusChip tone={w.status === 'approved' ? 'green' : w.status === 'rejected' ? 'red' : 'gray'} label={w.status} />
                        </td>
                        <td className="admin-table__actions">
                          {w.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button" className="admin-action" style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleApproveWithdrawal(w.id)}>
                                <Check size={14} /> Approve
                              </button>
                              <button type="button" className="admin-action danger" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleRejectWithdrawal(w.id)}>
                                <X size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState label="No withdrawal requests found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'verifications' && (
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Store Trust Verifications</h2>
              <p>Review uploaded ID/business documents and manage storefront verified badges.</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={loadVerifications} disabled={verificationsLoading}>
              <RefreshCw size={16} className={verificationsLoading ? 'admin-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Store / Merchant</th>
                  <th>Document Type</th>
                  <th>Uploaded Document File</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {verificationsLoading ? (
                  <TableSkeleton rows={6} columns={5} />
                ) : verifications.length ? (
                  verifications.map((v: any) => {
                    const docLabel = v.verification_document_type ? v.verification_document_type.replace('_', ' ').toUpperCase() : 'ID';
                    return (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.store_name}</strong>
                          <a href={v.custom_domain ? `https://${v.custom_domain}` : `https://frontstore.app/${v.username}`} target="_blank" rel="noreferrer">
                            @{v.username} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td>
                          <strong style={{ fontSize: 13 }}>{docLabel}</strong>
                        </td>
                        <td>
                          {v.verification_document_url ? (
                            <a
                              href={v.verification_document_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700 }}
                            >
                              View File <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-faint)' }}>No file uploaded</span>
                          )}
                        </td>
                        <td>
                          <StatusChip tone={v.verification_status === 'verified' ? 'green' : v.verification_status === 'rejected' ? 'red' : 'gray'} label={v.verification_status} />
                        </td>
                        <td className="admin-table__actions">
                          {v.verification_status === 'pending' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button" className="admin-action" style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleApproveVerification(v.id)}>
                                <Check size={14} /> Approve
                              </button>
                              <button type="button" className="admin-action danger" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => handleRejectVerification(v.id)}>
                                <X size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState label="No verification requests found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>

    {selectedStore && (
      <div className="admin-drawer-overlay" onClick={() => setSelectedStore(null)}>
        <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="admin-drawer__header">
            <div>
              <h2>Store Inspector</h2>
              <p>Inspect and manage details for @{selectedStore.username}</p>
            </div>
            <button type="button" className="admin-drawer__close" onClick={() => setSelectedStore(null)}>
              <X size={20} />
            </button>
          </div>

          <div className="admin-drawer__content">
            <div className="admin-drawer__section">
              <h3>Store Information</h3>
              <div className="admin-drawer__grid">
                <div>
                  <label>Store Name</label>
                  <strong>{selectedStore.store_name}</strong>
                </div>
                <div>
                  <label>Username</label>
                  <span>@{selectedStore.username}</span>
                </div>
                <div>
                  <label>Status</label>
                  <StatusChip tone={selectedStore.is_active ? 'green' : 'red'} label={selectedStore.is_active ? 'Active' : 'Suspended'} />
                </div>
                <div>
                  <label>Verification Badge</label>
                  <StatusChip tone={selectedStore.verification_status === 'verified' ? 'green' : selectedStore.verification_status === 'rejected' ? 'red' : 'gray'} label={selectedStore.verification_status || 'unverified'} />
                </div>
              </div>
            </div>

            <div className="admin-drawer__section">
              <h3>Wallet Balances</h3>
              <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                <div className="admin-balance-card withdrawable">
                  <label>Withdrawable Balance</label>
                  <strong>{formatMoney(selectedStore.withdrawable_balance, selectedStore.currency_code)}</strong>
                </div>
                <div className="admin-balance-card pending">
                  <label>Pending Escrow Balance</label>
                  <strong>{formatMoney(selectedStore.pending_balance, selectedStore.currency_code)}</strong>
                </div>
              </div>
            </div>

            <div className="admin-drawer__section">
              <h3>Merchant details</h3>
              <div className="admin-drawer__grid">
                <div>
                  <label>Owner Name</label>
                  <strong>{selectedStore.user?.name || 'No name'}</strong>
                </div>
                <div>
                  <label>Email Address</label>
                  <span>{selectedStore.user?.email || 'No email'}</span>
                </div>
                <div>
                  <label>Phone Number</label>
                  <span>{selectedStore.user?.phone_number || 'No phone'}</span>
                </div>
                <div>
                  <label>Joined Platform</label>
                  <span>{selectedStore.user?.created_at ? new Date(selectedStore.user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {selectedStore.bank_account_number && (
              <div className="admin-drawer__section">
                <h3>Payout Bank account</h3>
                <div className="admin-drawer__grid">
                  <div>
                    <label>Bank Name</label>
                    <strong>{selectedStore.bank_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <label>Account Number</label>
                    <span>{selectedStore.bank_account_number}</span>
                  </div>
                  <div>
                    <label>Account Name</label>
                    <span>{selectedStore.bank_account_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="admin-drawer__actions">
            <button type="button" className="btn btn-outline" onClick={() => setSelectedStore(null)}>Close Inspector</button>
            <button
              type="button"
              className={selectedStore.is_active ? 'btn btn-primary btn-danger-tone' : 'btn btn-primary'}
              onClick={() => {
                handleToggleStoreStatus(selectedStore.id);
                setSelectedStore(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
              }}
            >
              {selectedStore.is_active ? 'Suspend Store' : 'Activate Store'}
            </button>
          </div>
        </div>
      </div>
    )}

    <ConfirmDialog
      open={confirmationDialog.open}
      title={confirmationDialog.title}
      description={confirmationDialog.message}
      confirmLabel={confirmationDialog.confirmLabel}
      cancelLabel={confirmationDialog.cancelLabel}
      onConfirm={executeConfirmationDialog}
      onCancel={closeConfirmationDialog}
      loading={confirmationDialog.loading}
    />

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

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '', description = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; description?: string }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {description && <small className="admin-field-desc">{description}</small>}
      <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} />
    </label>
  );
}

function TextAreaField({ label, value, onChange, required = false, placeholder = '', description = '', rows = 8 }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string; description?: string; rows?: number }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {description && <small className="admin-field-desc">{description}</small>}
      <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} rows={rows} />
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
        --bg: #09090b;
        --bg-2: #09090b;
        --surface: #121214;
        --surface-2: #1c1c1f;
        --border: #222226;
        --border-strong: #2f2f36;
        --text: #f4f4f5;
        --text-2: #e4e4e7;
        --text-muted: #a1a1aa;
        --text-faint: #71717a;
        --primary: #8b5cf6; /* violet accent */
        --primary-light: rgba(139, 92, 246, 0.12);
        --primary-hover: #a78bfa;
        --danger: #ef4444;
        --danger-light: rgba(239, 68, 68, 0.12);
        --accent: #f59e0b;
        --accent-light: rgba(245, 158, 11, 0.12);

        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        background: var(--bg);
        color: var(--text);
        font-family: var(--font-sans);
      }

      .admin-shell ::-webkit-scrollbar-thumb {
        background: var(--surface-2);
      }
      .admin-shell ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }

      .admin-rail {
        position: sticky;
        top: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px 18px;
        background: var(--surface);
        border-right: 1px solid var(--border);
      }

      .admin-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 20px;
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
        border: 1px solid rgba(139, 92, 246, 0.25);
      }

      .admin-brand strong,
      .admin-brand span {
        display: block;
      }

      .admin-brand strong {
        font-family: var(--font-heading);
        font-size: 17px;
        line-height: 1.1;
        letter-spacing: -0.01em;
      }

      .admin-brand div > span {
        margin-top: 3px;
        color: var(--text-muted);
        font-size: 11px;
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
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .admin-nav button {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 42px;
        padding: 0 14px;
        border-radius: 8px;
        color: var(--text-muted);
        background: transparent;
        font-size: 14px;
        font-weight: 600;
        text-align: left;
      }

      .admin-nav button:hover,
      .admin-nav button.is-active {
        color: var(--text);
        background: var(--surface-2);
      }

      .admin-nav button.is-active {
        color: var(--primary);
        background: var(--primary-light);
        box-shadow: inset 3px 0 0 var(--primary);
      }
      .admin-nav button:hover {
        transform: translateX(4px);
      }

      .admin-rail__footer {
        margin-top: auto;
        display: grid;
        gap: 6px;
        padding: 14px;
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
        padding: 30px clamp(16px, 4vw, 40px) 40px;
      }

      .admin-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 28px;
      }

      .admin-topbar p {
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .admin-topbar h1 {
        margin-top: 2px;
        font-family: var(--font-heading);
        font-size: clamp(24px, 3vw, 34px);
        letter-spacing: -0.02em;
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
      .admin-icon-button:hover {
        background: var(--surface-2);
        color: var(--text);
        border-color: var(--border-strong);
      }

      .admin-mobile-tabs {
        display: none;
      }

      .admin-section {
        display: grid;
        gap: 20px;
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
        font-size: 22px;
        line-height: 1.2;
        letter-spacing: -0.01em;
      }

      .admin-section-heading p {
        margin-top: 4px;
        color: var(--text-muted);
        font-size: 13px;
      }

      .admin-metric-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .admin-metric,
      .admin-panel,
      .admin-table-wrap,
      .admin-inline-form,
      .admin-list,
      .admin-settings-group {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      .admin-metric {
        min-height: 136px;
        padding: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--border);
      }
      .admin-metric:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        border-color: var(--primary);
      }

      .admin-metric > span {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        color: var(--text-2);
        background: var(--surface-2);
      }

      .admin-metric--green > span {
        color: var(--primary);
        background: var(--primary-light);
        border: 1px solid rgba(139, 92, 246, 0.2);
      }

      .admin-metric p {
        margin-top: 16px;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .admin-metric strong {
        display: block;
        margin-top: 5px;
        font-family: var(--font-heading);
        font-size: 26px;
        line-height: 1;
        color: var(--text);
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
        gap: 16px;
      }

      .admin-panel {
        padding: 24px;
        border: 1px solid var(--border);
      }

      .admin-panel__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
      }

      .admin-panel__header h3,
      .admin-settings-group legend {
        color: var(--text);
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      .admin-panel__header p {
        margin-top: 3px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .admin-trend-list,
      .admin-settings-form {
        display: grid;
        gap: 12px;
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
        margin-top: 14px;
      }

      .admin-meter > div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
      }

      .admin-meter__track {
        height: 8px;
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
        background: var(--surface-2);
        overflow: hidden;
      }

      .admin-search svg {
        margin-left: 13px;
        color: var(--text-muted);
      }

      .admin-search input,
      .admin-inline-form input,
      .admin-field input,
      .admin-field textarea {
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
        padding: 0 16px;
        border: 0;
        border-left: 1px solid var(--border);
        color: var(--primary);
        background: var(--primary-light);
        font-weight: 800;
        cursor: pointer;
      }
      .admin-search button:hover {
        background: rgba(139, 92, 246, 0.2);
        color: var(--primary-hover);
      }

      .admin-table-wrap {
        overflow: auto;
        border: 1px solid var(--border);
      }

      .admin-table {
        width: 100%;
        min-width: 860px;
        border-collapse: collapse;
        text-align: left;
      }

      .admin-table th {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        color: var(--text-muted);
        background: var(--surface-2);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .admin-table td {
        padding: 16px;
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
        color: var(--text-2);
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
      .admin-table td a:hover {
        color: var(--primary-hover);
        text-decoration: underline;
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
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .admin-chip--green {
        color: #10b981;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .admin-chip--gray {
        color: var(--text-muted);
        background: var(--surface-2);
        border: 1px solid var(--border);
      }

      .admin-chip--red {
        color: var(--danger);
        background: var(--danger-light);
        border: 1px solid rgba(239, 68, 68, 0.2);
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
        background: var(--surface-2);
        font-size: 12px;
        font-weight: 750;
        outline: 0;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      .admin-select select:hover {
        border-color: var(--border-strong);
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
        padding: 0 12px;
        border-radius: 8px;
        color: var(--primary);
        background: var(--primary-light);
        font-size: 12px;
        font-weight: 800;
        border: 1px solid rgba(139, 92, 246, 0.2);
      }
      .admin-action:hover {
        background: rgba(139, 92, 246, 0.2);
        color: var(--primary-hover);
        transform: translateY(-1px);
      }

      .admin-action.danger {
        color: var(--danger);
        background: var(--danger-light);
        border: 1px solid rgba(239, 68, 68, 0.2);
      }
      .admin-action.danger:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: translateY(-1px);
      }

      .admin-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 10px;
      }

      .admin-pagination button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 36px;
        padding: 0 14px;
        border-radius: 8px;
        color: var(--text);
        background: var(--surface);
        border: 1px solid var(--border);
        font-size: 13px;
        font-weight: 750;
      }
      .admin-pagination button:hover:not(:disabled) {
        background: var(--surface-2);
        border-color: var(--border-strong);
      }

      .admin-pagination button:disabled {
        opacity: 0.35;
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
        gap: 12px;
        padding: 14px;
      }

      .admin-inline-form input,
      .admin-field input,
      .admin-field textarea {
        height: 42px;
        padding: 0 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface-2);
        font-size: 14px;
        transition: all 0.2s;
      }
      .admin-field textarea {
        height: auto;
        min-height: 180px;
        padding: 12px 14px;
        resize: vertical;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        line-height: 1.5;
      }
      .admin-inline-form input:focus,
      .admin-field input:focus,
      .admin-field textarea:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary-light);
      }

      .admin-list {
        overflow: hidden;
      }

      .admin-list-row {
        padding: 14px 18px;
        border-bottom: 1px solid var(--border);
        transition: background 0.2s;
      }
      .admin-list-row:hover {
        background: rgba(255, 255, 255, 0.01);
      }

      .admin-list-row:last-child {
        border-bottom: 0;
      }

      .admin-list-row strong {
        display: block;
        font-size: 14px;
        color: var(--text-2);
      }

      .admin-list-row button {
        width: 34px;
        height: 34px;
        display: inline-grid;
        place-items: center;
        margin-left: 6px;
        border-radius: 8px;
        color: var(--text-muted);
        background: var(--surface-2);
        border: 1px solid var(--border);
      }
      .admin-list-row button:hover {
        background: var(--border-strong);
        color: var(--text);
      }

      .admin-list-row button.danger {
        color: var(--danger);
        background: var(--danger-light);
        border-color: rgba(239, 68, 68, 0.2);
      }
      .admin-list-row button.danger:hover {
        background: rgba(239, 68, 68, 0.2);
      }

      .admin-settings-group {
        min-width: 0;
        padding: 20px;
        border: 1px solid var(--border);
      }

      .admin-settings-group legend {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px;
        color: var(--text);
        font-weight: 700;
      }

      .admin-settings-group legend svg {
        color: var(--primary);
      }

      .admin-settings-group > div {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        padding-top: 14px;
      }

      .admin-field span {
        display: block;
        margin-bottom: 6px;
        color: var(--text-2);
        font-size: 12px;
        font-weight: 700;
      }
      .admin-field-desc {
        display: block;
        font-size: 11px;
        color: var(--text-muted);
        margin-top: -4px;
        margin-bottom: 8px;
        line-height: 1.4;
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
        color: var(--text);
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

      /* ── Custom visual CSS chart components ── */
      .admin-chart-container {
        margin-top: 14px;
        height: 200px;
        display: flex;
        align-items: flex-end;
        border-bottom: 2px solid var(--border);
        padding-bottom: 8px;
        position: relative;
      }
      .admin-chart {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        gap: 12px;
      }
      .admin-chart-bar-wrapper {
        flex: 1;
        max-width: 60px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        position: relative;
        cursor: pointer;
      }
      .admin-chart-bar {
        width: 100%;
        border-radius: 6px 6px 0 0;
        background: linear-gradient(180deg, var(--primary) 0%, rgba(139, 92, 246, 0.25) 100%);
        position: relative;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .admin-chart-bar-fill {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
      }
      .admin-chart-bar-wrapper:hover .admin-chart-bar {
        transform: scaleY(1.05);
        filter: brightness(1.2);
        box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
      }
      .admin-chart-bar-label {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 8px;
        white-space: nowrap;
      }
      .admin-chart-bar-tooltip {
        position: absolute;
        bottom: 100%;
        margin-bottom: 8px;
        background: var(--surface-2);
        border: 1px solid var(--primary);
        border-radius: 6px;
        padding: 6px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transform: translateY(4px);
        transition: all 0.2s ease;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }
      .admin-chart-bar-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--primary);
      }
      .admin-chart-bar-wrapper:hover .admin-chart-bar-tooltip {
        opacity: 1;
        transform: translateY(0);
      }
      .tooltip-date {
        font-size: 10px;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 700;
        white-space: nowrap;
      }
      .tooltip-value {
        font-size: 12px;
        color: var(--text);
        font-weight: 800;
        margin-top: 2px;
        white-space: nowrap;
      }

      /* ── Connection Health widget ── */
      .admin-health-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .admin-health-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-radius: 8px;
        background: var(--surface-2);
        border: 1px solid var(--border);
      }
      .admin-health-item strong {
        display: block;
        font-size: 13px;
        color: var(--text);
      }
      .admin-health-item span {
        font-size: 11px;
        color: var(--text-muted);
      }
      .admin-health-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }
      .admin-health-dot.online {
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulseDot 2s infinite;
      }
      @keyframes pulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.25); opacity: 0.5; }
      }

      /* ── Top Stores list ── */
      .admin-panel-sub-card {
        padding: 4px;
      }
      .border-top-divider {
        border-top: 1px solid var(--border);
        padding-top: 16px;
        margin-top: 16px;
      }
      .admin-top-stores-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .admin-top-store-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        transition: all 0.2s ease;
      }
      .admin-top-store-row:hover {
        transform: translateY(-2px);
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
      }
      .admin-top-store-row strong {
        display: block;
        font-size: 13px;
        color: var(--text-2);
      }
      .admin-top-store-row span {
        font-size: 11px;
        color: var(--text-muted);
      }
      .admin-no-data-hint {
        font-size: 12px;
        color: var(--text-faint);
        text-align: center;
        display: block;
      }

      /* ── Drawer / Inspector Sidebar ── */
      .admin-drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 100;
        display: flex;
        justify-content: flex-end;
        animation: fadeIn 0.2s ease-out;
      }
      .admin-drawer {
        width: 100%;
        max-width: 480px;
        background: var(--surface);
        border-left: 1px solid var(--border);
        height: 100%;
        display: flex;
        flex-direction: column;
        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .admin-drawer__header {
        padding: 24px;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .admin-drawer__header h2 {
        font-family: var(--font-heading);
        font-size: 20px;
        color: var(--text);
      }
      .admin-drawer__header p {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .admin-drawer__close {
        background: transparent;
        border: 0;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s;
        display: grid;
        place-items: center;
      }
      .admin-drawer__close:hover {
        background: var(--surface-2);
        color: var(--text);
      }
      .admin-drawer__content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .admin-drawer__section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .admin-drawer__section h3 {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--primary);
        font-weight: 800;
        border-bottom: 1px solid var(--border);
        padding-bottom: 6px;
      }
      .admin-drawer__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .admin-drawer__grid--cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .admin-drawer__grid label {
        display: block;
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .admin-drawer__grid strong {
        font-size: 14px;
        color: var(--text);
      }
      .admin-drawer__grid span {
        font-size: 13px;
        color: var(--text-2);
      }
      .admin-balance-card {
        padding: 16px;
        border-radius: 8px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .admin-balance-card strong {
        font-size: 22px;
        color: #10b981;
        font-family: var(--font-heading);
      }
      .admin-drawer__actions {
        padding: 24px;
        border-top: 1px solid var(--border);
        background: var(--surface-2);
        display: flex;
        gap: 12px;
      }
      .admin-drawer__actions button {
        flex: 1;
      }
      .btn-danger-tone {
        background: var(--danger) !important;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important;
      }
      .btn-danger-tone:hover {
        background: #dc2626 !important;
      }

      .admin-table-row-hoverable:hover {
        background: rgba(255, 255, 255, 0.015) !important;
      }

      .admin-panel-sub-card {
        padding: 4px;
      }
      .admin-flex-column-panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
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
        .admin-health-grid {
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
