'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from './AdminContext';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';
import ConfirmDialog from '../../components/ConfirmDialog';
import './admin.css';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Layers,
  Loader2,
  LogOut,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Analytics',
    items: [
      { href: '/admin', label: 'Overview', icon: <BarChart3 size={16} />, permission: 'overview' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { href: '/admin/stores', label: 'Stores', icon: <Store size={16} />, permission: 'stores' },
      { href: '/admin/products', label: 'Products', icon: <Package size={16} />, permission: 'products' },
      { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={16} />, permission: 'orders' },
      { href: '/admin/categories', label: 'Categories', icon: <Tag size={16} />, permission: 'categories' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/withdrawals', label: 'Payouts', icon: <DollarSign size={16} />, permission: 'payouts' },
      { href: '/admin/withdrawal-batches', label: 'Withdrawal Batches', icon: <Layers size={16} />, permission: 'payouts' },
      { href: '/admin/payments', label: 'Payment Gateways', icon: <CreditCard size={16} />, permission: 'payments' },
      { href: '/admin/coupons', label: 'Coupons', icon: <Tag size={16} />, permission: 'coupons' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/admin/verifications', label: 'Verifications', icon: <Shield size={16} />, permission: 'verifications' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/roles', label: 'Roles & Staff', icon: <Users size={16} />, permission: 'roles' },
      { href: '/admin/health', label: 'System Health', icon: <Activity size={16} />, permission: 'health' },
      { href: '/admin/settings', label: 'Settings', icon: <Settings size={16} />, permission: 'settings' },
    ],
  },
];

// Flat list for active-tab matching
const allTabs = navGroups.flatMap((g) => g.items);

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isAuthenticated,
    isAdmin,
    isAuthChecking,
    adminEmail,
    settings,
    loadSettings,
    handleLogout,
    confirmationDialog,
    executeConfirmationDialog,
    closeConfirmationDialog,
  } = useAdmin();

  const isLoginPage = pathname === '/admin/login';

  const isStaff = () => {
    if (isAdmin) return true;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        return !!(userObj?.role_id || userObj?.role);
      } catch {}
    }
    return false;
  };

  const hasPermission = (permission?: string) => {
    if (isAdmin) return true;
    if (!permission) return true;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj?.role_id || userObj?.role) {
          if (permission === 'overview') return true;
          const permissions = userObj?.role?.permissions || [];
          return permissions.includes(permission);
        }
      } catch {}
    }
    return false;
  };

  useEffect(() => {
    if (!isLoginPage && !isAuthChecking && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isAuthChecking, isLoginPage, router]);

  useEffect(() => {
    if (isAuthenticated && (isAdmin || isStaff()) && !isLoginPage) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (isAuthChecking) {
    return (
      <div className="admin-state-screen">
        <Loader2 className="admin-spin" size={30} />
        <p>Checking admin session</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isAuthenticated && !isStaff()) {
    return (
      <div className="admin-state-screen admin-state-screen--padded">
        <div className="admin-denied">
          <span className="admin-denied__icon">
            <AlertTriangle size={28} />
          </span>
          <h1>Access denied</h1>
          <p>This account does not have platform administrator or staff privileges.</p>
          <div className="admin-denied__actions">
            <button onClick={() => router.push('/dashboard')} className="btn btn-primary" type="button">
              <LayoutDashboard size={17} /> Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-outline" type="button">
              <LogOut size={17} /> Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const activeTabLabel = allTabs.find((tab) => isActive(tab.href))?.label || 'Platform Console';
  const currentTab = allTabs.find((tab) => isActive(tab.href));

  if (currentTab && !hasPermission(currentTab.permission)) {
    return (
      <div className="admin-state-screen admin-state-screen--padded animate-fade-in" style={{ background: 'var(--bg)' }}>
        <div className="admin-denied">
          <span className="admin-denied__icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertTriangle size={28} />
          </span>
          <h1>Access Denied</h1>
          <p>Your account does not have permission to view the "{currentTab.label}" module.</p>
          <div className="admin-denied__actions">
            <button onClick={() => router.push('/admin')} className="btn btn-primary" type="button">
              Return to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Avatar initials from email
  const avatarInitials = adminEmail
    ? adminEmail.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="admin-shell">
      {/* ─── SIDEBAR ─── */}
      <aside className="admin-rail">
        {/* Brand */}
        <div className="admin-brand">
          <div className="admin-brand__logo-wrap">
            <img
              src="/logo.png"
              alt={settings.app_name || 'Logo'}
              width={34}
              height={34}
              style={{ width: 34, height: 34, objectFit: 'contain', display: 'block' }}
            />
          </div>
          <div className="admin-brand__text">
            <strong>{settings.app_name || 'Frontstore'}</strong>
            <span>Platform Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-nav" aria-label="Admin navigation">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((tab) => hasPermission(tab.permission));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="admin-nav-group">
                <p className="admin-nav-group__label">{group.label}</p>
                {visibleItems.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={isActive(tab.href) ? 'admin-nav-item is-active' : 'admin-nav-item'}
                  >
                    <span className="admin-nav-item__icon">{tab.icon}</span>
                    <span className="admin-nav-item__label">{tab.label}</span>
                    {isActive(tab.href) && <span className="admin-nav-item__pip" />}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-rail__footer">
          <div className="admin-rail__user">
            <div className="admin-rail__avatar">{avatarInitials}</div>
            <div className="admin-rail__user-info">
              <strong>{isAdmin ? 'Super Admin' : 'Staff'}</strong>
              <span>{adminEmail}</span>
            </div>
          </div>
          <div className="admin-rail__footer-actions">
            <ThemeToggle />
            <button type="button" className="admin-rail__logout" onClick={handleLogout} title="Log out">
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="admin-workspace">
        <header className="admin-topbar" style={{ justifyContent: 'flex-end' }}>
          <div className="admin-topbar__actions">
            <ThemeToggle />
            <button type="button" className="admin-icon-button" onClick={handleLogout} title="Log out">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="admin-mobile-tabs">
          {allTabs.filter((tab) => hasPermission(tab.permission)).map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={isActive(tab.href) ? 'is-active' : ''}
              style={{ textDecoration: 'none' }}
            >
              {tab.icon}
              <span style={{ marginLeft: 4 }}>{tab.label}</span>
            </Link>
          ))}
        </div>

        {children}
      </main>

      {confirmationDialog.open && (
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
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
