'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface AdminStats {
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

export interface MerchantInfo {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  plan: string;
  created_at: string;
}

export interface StoreInfo {
  id: string;
  store_name: string;
  username: string;
  is_active: boolean;
  user?: MerchantInfo | null;
  currency_code: string;
  custom_domain?: string | null;
  verification_status?: string | null;
  is_verified?: boolean;
  withdrawable_balance?: number;
  pending_balance?: number;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  trust_score?: number;
  seller_level?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  image_url?: string | null;
  is_sponsored: boolean;
  sponsored_until?: string | null;
  store?: { id: string; store_name: string; username: string } | null;
  category?: { id: string; name: string } | null;
}

export interface SystemSettings {
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
  social_facebook: string;
  social_linkedin: string;
  system_domain: string;
  support_email: string;
  store_disclaimer: string;
  admin_notify_email: string;
  admin_notify_phone: string;
  homepage_content: string;
  mobile_hero: string;
  registration_method: 'email' | 'whatsapp' | 'both';
  pro_monthly_price: string;
  pro_yearly_price: string;
  legend_monthly_price: string;
  legend_yearly_price: string;
  free_plan_product_limit: string;
  verification_provider: 'manual' | 'idenverify' | 'idanalyzer' | 'didit';
  idenverify_api_key: string;
  idanalyzer_api_key: string;
  idanalyzer_confidence_threshold: string | number;
  idanalyzer_region: string;
  didit_api_key: string;
  didit_webhook_secret: string;
  didit_workflow_id: string;
  didit_callback_url: string;
  modules: Record<string, string>;
  access_control_mode?: 'everyone' | 'particular_country' | 'restrict_countries';
  access_control_allowed_country?: string;
  access_control_restricted_countries?: string;
  real_store_count?: number;
}

export interface PaymentProviderCountry {
  code: string;
  name: string;
  providers: {
    paystack: boolean;
    flutterwave: boolean;
    stripe: boolean;
  };
}

export const defaultSettings: SystemSettings = {
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
  social_facebook: '',
  social_linkedin: '',
  system_domain: '',
  support_email: '',
  store_disclaimer: '',
  admin_notify_email: '',
  admin_notify_phone: '',
  homepage_content: '',
  mobile_hero: '',
  registration_method: 'whatsapp',
  pro_monthly_price: '1500',
  pro_yearly_price: '15000',
  legend_monthly_price: '5000',
  legend_yearly_price: '50000',
  free_plan_product_limit: '10',
  verification_provider: 'manual',
  idenverify_api_key: '',
  idanalyzer_api_key: '',
  idanalyzer_confidence_threshold: 0.7,
  idanalyzer_region: 'US',
  didit_api_key: '',
  didit_webhook_secret: '',
  didit_workflow_id: '',
  didit_callback_url: '',
  modules: {},
  access_control_mode: 'everyone',
  access_control_allowed_country: '',
  access_control_restricted_countries: '',
};

export interface ConfirmationDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export interface SystemHealth {
  backend: boolean;
  database: boolean;
  twilio: boolean;
  paystack: boolean;
}

export interface Role {
  id: string | number;
  name: string;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserDetails {
  id: string | number;
  name: string;
  email: string | null;
  phone_number: string;
  is_admin?: boolean | number;
  role_id: string | number | null;
  role?: Role | null;
  created_at: string;
}

interface AdminContextProps {
  token: string | null;
  apiUrl: string;
  adminEmail: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthChecking: boolean;
  getHeaders: () => Record<string, string>;
  handleFetchResponse: (res: Response, defaultError: string) => Promise<any>;
  handleLogout: () => void;
  login: (token: string, user: any, store?: any) => void;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  settingsLoading: boolean;
  loadSettings: () => Promise<void>;
  healthStatus: SystemHealth;
  healthLoading: boolean;
  checkHealth: () => Promise<void>;
  confirmationDialog: ConfirmationDialogState;
  openConfirmationDialog: (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    confirmLabel?: string,
    cancelLabel?: string
  ) => void;
  closeConfirmationDialog: () => void;
  executeConfirmationDialog: () => Promise<void>;
  roles: Role[];
  rolesLoading: boolean;
  loadRoles: () => Promise<void>;
  createRole: (name: string, permissions: string[]) => Promise<void>;
  updateRole: (id: string | number, name: string, permissions: string[]) => Promise<void>;
  deleteRole: (id: string | number) => Promise<void>;
  users: UserDetails[];
  usersLoading: boolean;
  loadUsers: (search?: string, page?: number, limit?: number) => Promise<any>;
  assignUserRole: (userId: string | number, roleId: string | number | null) => Promise<void>;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('https://api.frontstore.ng/api');
  const [adminEmail, setAdminEmail] = useState('admin@frontstore.ng');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [healthStatus, setHealthStatus] = useState<SystemHealth>({
    backend: false,
    database: false,
    twilio: false,
    paystack: false,
  });
  const [healthLoading, setHealthLoading] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: async () => {},
    loading: false,
  });

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

  const login = (newToken: string, newUser: any, newStore: any = null) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('store', JSON.stringify(newStore));

    const userIsAdmin =
      newUser?.is_admin === true ||
      newUser?.is_admin === 1 ||
      newUser?.is_admin === 'true' ||
      newUser?.is_admin === '1';

    setAdminEmail(newUser?.email || newUser?.phone_number || 'admin@frontstore.ng');
    setToken(newToken);
    setIsAuthenticated(true);
    setIsAdmin(userIsAdmin);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push('/admin/login');
  };

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  const handleFetchResponse = async (res: Response, defaultError: string) => {
    if (res.status === 401) {
      toast.error('Session expired. Please log in again.');
      localStorage.clear();
      setToken(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      router.push('/admin/login');
      throw new Error('Session expired');
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || defaultError);
    return json;
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

  const checkHealth = async () => {
    if (!token) return;
    try {
      setHealthLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/health`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch health status.');
      if (json.status === 'success') setHealthStatus(json.data);
    } catch {
      // keep default false values
    } finally {
      setHealthLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!token) return;
    try {
      setRolesLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/roles`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch roles.');
      setRoles(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setRolesLoading(false);
    }
  };

  const createRole = async (name: string, permissions: string[]) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, permissions }),
      });
      const json = await handleFetchResponse(res, 'Could not create role.');
      toast.success(json.message || 'Role created successfully.');
      loadRoles();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
      throw error;
    }
  };

  const updateRole = async (id: string | number, name: string, permissions: string[]) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/roles/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, permissions }),
      });
      const json = await handleFetchResponse(res, 'Could not update role.');
      toast.success(json.message || 'Role updated successfully.');
      loadRoles();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
      throw error;
    }
  };

  const deleteRole = async (id: string | number) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Could not delete role.');
      toast.success(json.message || 'Role deleted successfully.');
      loadRoles();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
      throw error;
    }
  };

  const loadUsers = async (search = '', page = 1, limit = 15) => {
    if (!token) return;
    try {
      setUsersLoading(true);
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) query.append('search', search);

      const res = await fetch(`${apiUrl}/v1/admin/users?${query.toString()}`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch staff & users.');
      setUsers(json.data?.data || []);
      return json.data;
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const assignUserRole = async (userId: string | number, roleId: string | number | null) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role_id: roleId }),
      });
      const json = await handleFetchResponse(res, 'Could not assign role.');
      toast.success(json.message || 'User role updated.');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role_id: roleId, role: json.data?.role } : u))
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

    setApiUrl(savedApiUrl);

    if (!storedToken || !storedUser || storedUser === 'undefined' || storedUser === 'null') {
      setIsAuthChecking(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const userIsAdmin =
        parsedUser?.is_admin === true ||
        parsedUser?.is_admin === 1 ||
        parsedUser?.is_admin === 'true' ||
        parsedUser?.is_admin === '1';

      setAdminEmail(parsedUser?.email || parsedUser?.phone_number || 'admin@frontstore.ng');
      setToken(storedToken);
      setIsAuthenticated(true);
      setIsAdmin(userIsAdmin);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        token,
        apiUrl,
        adminEmail,
        isAuthenticated,
        isAdmin,
        isAuthChecking,
        getHeaders,
        handleFetchResponse,
        handleLogout,
        login,
        settings,
        setSettings,
        settingsLoading,
        loadSettings,
        healthStatus,
        healthLoading,
        checkHealth,
        confirmationDialog,
        openConfirmationDialog,
        closeConfirmationDialog,
        executeConfirmationDialog,
        roles,
        rolesLoading,
        loadRoles,
        createRole,
        updateRole,
        deleteRole,
        users,
        usersLoading,
        loadUsers,
        assignUserRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
