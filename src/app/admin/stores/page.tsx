'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, StoreInfo } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock,
  ExternalLink,
  Landmark,
  Mail,
  Palette,
  Power,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Zap,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';
import CreateMerchantDrawer from './CreateMerchantDrawer';

const STORE_COLOR_PRESETS = [
  { name: 'Frontstore', value: '#25D366' },
  { name: 'Ruby', value: '#e11d48' },
  { name: 'Royal', value: '#4f46e5' },
  { name: 'Ocean', value: '#0284c7' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Graphite', value: '#27272a' },
  { name: 'Teal', value: '#128c7e' },
  { name: 'Forest Green', value: '#0B5D39' },
  { name: 'Deep Emerald', value: '#074328' },
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
  if (plan === 'legend_yearly') return 'Business Yearly';
  if (plan === 'legend_monthly') return 'Business Monthly';
  return 'Free';
};

const isProPlan = (plan?: string | null) => plan === 'pro_monthly' || plan === 'pro_yearly' || plan === 'legend_monthly' || plan === 'legend_yearly';

const PAYOUT_TIERS = [
  { level: 1, name: 'New Seller', range: '0–40 pts', payout: '5-day hold', icon: Clock },
  { level: 2, name: 'Verified Seller', range: '41–70 pts', payout: 'Next-day payout', icon: ShieldCheck },
  { level: 3, name: 'Trusted Seller', range: '71–90 pts', payout: 'Same-day payout', icon: BadgeCheck },
  { level: 4, name: 'Elite Seller', range: '91–100 pts', payout: 'Instant payout', icon: Zap },
] as const;

export default function AdminStoresPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog, settings } = useAdmin();

  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [drawerColor, setDrawerColor] = useState('#25D366');
  const [savingColorFor, setSavingColorFor] = useState<string | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [sendingLimitEmailFor, setSendingLimitEmailFor] = useState<string | null>(null);
  const [generatingDvaFor, setGeneratingDvaFor] = useState<string | null>(null);
  const [uploadingNinaAvatarFor, setUploadingNinaAvatarFor] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStore) {
      setDrawerColor(selectedStore.primary_color || '#25D366');
    }
  }, [selectedStore]);

  const freeProductLimit = Number(settings?.free_plan_product_limit) || 10;
  const hasReachedProductLimit = (store: StoreInfo) =>
    !isProPlan(store.user?.plan) && Number(store.products_count || 0) >= freeProductLimit;

  const needsDedicatedAccount = (store: StoreInfo) =>
    store.payment_provider !== 'stripe' && !store.paystack_dva_active;

  const loadStores = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setStoresLoading(true);
      const url = `${apiUrl}/v1/admin/stores?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { credentials: 'include', headers: getHeaders() });
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

  const handleToggleStoreStatus = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to update store status.');
      toast.success(json.message);
      setStores((items) =>
        items.map((store) => (store.id === storeId ? { ...store, is_active: !store.is_active } : store))
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to delete store.');
      toast.success(json.message);
      setStores((items) => items.filter((store) => store.id !== storeId));
      setSelectedStore((prev) => (prev?.id === storeId ? null : prev));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleSendLimitEmail = async (storeId: string) => {
    try {
      setSendingLimitEmailFor(storeId);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/send-limit-email`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to send limit-reached email.');
      toast.success(json.message);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSendingLimitEmailFor(null);
    }
  };

  const handleGenerateDva = async (storeId: string) => {
    try {
      setGeneratingDvaFor(storeId);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/generate-dva`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to generate dedicated account.');
      toast.success(json.message);
      setStores((items) =>
        items.map((store) =>
          store.id === storeId
            ? {
                ...store,
                paystack_dva_active: true,
                paystack_dva_account_number: json.data?.paystack_dva_account_number,
                paystack_dva_bank_name: json.data?.paystack_dva_bank_name,
                paystack_dva_account_name: json.data?.paystack_dva_account_name,
              }
            : store
        )
      );
      setSelectedStore((prev) =>
        prev && prev.id === storeId
          ? {
              ...prev,
              paystack_dva_active: true,
              paystack_dva_account_number: json.data?.paystack_dva_account_number,
              paystack_dva_bank_name: json.data?.paystack_dva_bank_name,
              paystack_dva_account_name: json.data?.paystack_dva_account_name,
            }
          : prev
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setGeneratingDvaFor(null);
    }
  };

  const handleNinaAvatarFile = async (storeId: string, file: File) => {
    try {
      setUploadingNinaAvatarFor(storeId);
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/nina-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await handleFetchResponse(res, 'Could not upload Nina avatar.');
      toast.success(json.message);
      const newUrl = json.data?.nina_avatar_url;
      setStores((items) => items.map((store) => (store.id === storeId ? { ...store, nina_avatar_url: newUrl } : store)));
      setSelectedStore((prev) => (prev && prev.id === storeId ? { ...prev, nina_avatar_url: newUrl } : prev));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setUploadingNinaAvatarFor(null);
    }
  };

  const handleUpdateStoreColor = async (storeId: string, color: string) => {
    if (!color || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      toast.error('Please provide a valid hex color code (e.g. #25D366).');
      return;
    }
    try {
      setSavingColorFor(storeId);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/color`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary_color: color }),
      });
      const json = await handleFetchResponse(res, 'Failed to update store color.');
      toast.success(json.message || 'Store color updated.');
      setStores((items) =>
        items.map((store) => (store.id === storeId ? { ...store, primary_color: color } : store))
      );
      setSelectedStore((prev) => (prev && prev.id === storeId ? { ...prev, primary_color: color } : prev));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSavingColorFor(null);
    }
  };

  const handleUpdateUserPlan = async (userId: string | undefined, plan: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/users/${userId}/plan`, {
        method: 'PATCH',
        credentials: 'include',
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
            : store
        )
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadStores(1, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Merchant stores</h2>
          <p>Search, suspend, activate, and update subscription plans.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <form
            className="admin-search"
            onSubmit={(event) => {
              event.preventDefault();
              loadStores(1, searchQuery);
            }}
          >
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search stores, owners, email, phone"
            />
            <button type="submit">Search</button>
          </form>
          <button type="button" className="admin-action" onClick={() => setShowCreateDrawer(true)}>
            <UserPlus size={15} /> Create merchant
          </button>
        </div>
      </div>

      {showCreateDrawer && (
        <CreateMerchantDrawer
          onClose={() => setShowCreateDrawer(false)}
          onCreated={() => loadStores(currentPage, searchQuery)}
        />
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Merchant</th>
              <th>Color</th>
              <th>Plan</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {storesLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : stores.length ? (
              stores.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  style={{ cursor: 'pointer' }}
                  className="admin-table-row-hoverable"
                >
                  <td>
                    <strong>
                      {store.store_name}
                      {store.is_verified && <BadgeCheck size={13} style={{ verticalAlign: 'middle', marginLeft: 4, color: '#25D366' }} />}
                    </strong>
                    <a
                      href={
                        store.custom_domain
                          ? `https://${store.custom_domain}`
                          : `https://${store.username}.frontstore.ng`
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{store.username} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td>
                    <strong>{store.user?.name || 'Unnamed merchant'}</strong>
                    <span>{store.user?.email || store.user?.phone_number || 'No contact'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: store.primary_color || '#25D366',
                          border: '1px solid rgba(255,255,255,0.25)',
                          flexShrink: 0,
                          display: 'inline-block',
                          boxShadow: `0 0 8px ${store.primary_color || '#25D366'}40`,
                        }}
                      />
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2, #d4d4d8)' }}>
                        {store.primary_color || '#25D366'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-plan-cell" onClick={(e) => e.stopPropagation()}>
                      <StatusChip tone={isProPlan(store.user?.plan) ? 'green' : 'gray'} label={planLabel(store.user?.plan)} />
                      {hasReachedProductLimit(store) && (
                        <StatusChip tone="orange" label={`${store.products_count}/${freeProductLimit} products`} />
                      )}
                      <label className="admin-select">
                        <select
                          value={store.user?.plan || 'free'}
                          onChange={(event) => handleUpdateUserPlan(store.user?.id, event.target.value)}
                          disabled={!store.user}
                        >
                          <option value="free">Free</option>
                          <option value="pro_monthly">Pro Monthly</option>
                          <option value="pro_yearly">Pro Yearly</option>
                          <option value="legend_monthly">Business Monthly</option>
                          <option value="legend_yearly">Business Yearly</option>
                        </select>
                        <ChevronDown size={14} />
                      </label>
                    </div>
                  </td>
                  <td>
                    <StatusChip tone={store.is_active ? 'green' : 'red'} label={store.is_active ? 'Active' : 'Suspended'} />
                  </td>
                  <td className="admin-table__actions">
                    {hasReachedProductLimit(store) && (
                      <button
                        type="button"
                        className="admin-action"
                        disabled={sendingLimitEmailFor === store.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmationDialog(
                            'Send limit-reached email',
                            `Email "${store.user?.name || store.store_name}" letting them know they've hit the ${freeProductLimit}-product free plan limit and can upgrade to Pro?`,
                            async () => {
                              await handleSendLimitEmail(store.id);
                            }
                          );
                        }}
                      >
                        <Mail size={15} />
                        {sendingLimitEmailFor === store.id ? 'Sending…' : 'Send limit email'}
                      </button>
                    )}
                    {needsDedicatedAccount(store) && (
                      <button
                        type="button"
                        className="admin-action"
                        disabled={generatingDvaFor === store.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmationDialog(
                            'Generate dedicated account',
                            `Generate a Paystack dedicated account for "${store.store_name}"? The merchant will be notified by email once it's ready.`,
                            async () => {
                              await handleGenerateDva(store.id);
                            }
                          );
                        }}
                      >
                        <Landmark size={15} />
                        {generatingDvaFor === store.id ? 'Generating…' : 'Generate DVA'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={store.is_active ? 'admin-action warning' : 'admin-action'}
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmationDialog(
                          store.is_active ? 'Suspend store' : 'Activate store',
                          `Are you sure you want to ${store.is_active ? 'suspend' : 'activate'} "${store.store_name}"?`,
                          async () => {
                            await handleToggleStoreStatus(store.id);
                          }
                        );
                      }}
                    >
                      <Power size={15} />
                      {store.is_active ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="admin-action danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmationDialog(
                          'Delete store',
                          `This permanently deletes "${store.store_name}" and logs the merchant out of their dashboard. This cannot be undone.`,
                          async () => {
                            await handleDeleteStore(store.id);
                          }
                        );
                      }}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
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

      {/* Drawer Inspector Overlay */}
      {selectedStore && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedStore(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer__header">
              <div>
                <h2>Store Inspector</h2>
                <p>Verify bank payouts, balances, and security</p>
              </div>
              <button className="admin-drawer__close" onClick={() => setSelectedStore(null)} type="button">
                &times;
              </button>
            </div>

            <div className="admin-drawer__content">
              <div className="admin-drawer__section">
                <h3>Store Identity</h3>
                <div className="admin-drawer__grid">
                  <div>
                    <label>Store Name</label>
                    <strong>{selectedStore.store_name}</strong>
                  </div>
                  <div>
                    <label>Handle</label>
                    <span>@{selectedStore.username}</span>
                  </div>
                  <div>
                    <label>Status</label>
                    <StatusChip tone={selectedStore.is_active ? 'green' : 'red'} label={selectedStore.is_active ? 'Active' : 'Suspended'} />
                  </div>
                  <div>
                    <label>Verification Badge</label>
                    <StatusChip
                      tone={
                        selectedStore.verification_status === 'verified'
                          ? 'green'
                          : selectedStore.verification_status === 'rejected'
                          ? 'red'
                          : 'gray'
                      }
                      label={selectedStore.verification_status || 'unverified'}
                    />
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
                <h3>Trust & Payout Level</h3>
                <div className="admin-tier-list">
                  {PAYOUT_TIERS.map((tier) => {
                    const isActive = (selectedStore.seller_level ?? 1) === tier.level;
                    const Icon = tier.icon;
                    return (
                      <div key={tier.level} className={`admin-tier-row${isActive ? ' admin-tier-row--active' : ''}`}>
                        <div className="admin-tier-row__icon">
                          <Icon size={16} />
                        </div>
                        <div className="admin-tier-row__info">
                          <strong>Level {tier.level} · {tier.name}</strong>
                          <span>{tier.range}</span>
                        </div>
                        <span className="admin-tier-row__payout">{tier.payout}</span>
                      </div>
                    );
                  })}
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
                    <span>
                      {selectedStore.user?.created_at
                        ? new Date(selectedStore.user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
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

              <div className="admin-drawer__section">
                <h3>Customer Payment Account (Dedicated Account)</h3>
                {selectedStore.paystack_dva_active && selectedStore.paystack_dva_account_number ? (
                  <div className="admin-drawer__grid">
                    <div>
                      <label>Bank Name</label>
                      <strong>{selectedStore.paystack_dva_bank_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <label>Account Number</label>
                      <span>{selectedStore.paystack_dva_account_number}</span>
                    </div>
                    <div>
                      <label>Account Name</label>
                      <span>{selectedStore.paystack_dva_account_name || 'N/A'}</span>
                    </div>
                    <div>
                      <label>Status</label>
                      <StatusChip tone="green" label="Active" />
                    </div>
                  </div>
                ) : (
                  <EmptyState label="No dedicated account generated yet." />
                )}
              </div>

              <div className="admin-drawer__section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Palette size={16} /> Storefront Color & Branding
                  </h3>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-2, #d4d4d8)' }}>
                    {drawerColor}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: 0, marginBottom: 14 }}>
                  Controls buttons, highlights, badges, and accents on this merchant&apos;s customer storefront.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Presets */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted, #8b8b9a)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                      Color Presets
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {STORE_COLOR_PRESETS.map((preset) => {
                        const isSelected = drawerColor.toLowerCase() === preset.value.toLowerCase();
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setDrawerColor(preset.value)}
                            title={`${preset.name} (${preset.value})`}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: preset.value,
                              border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                              boxShadow: isSelected ? '0 0 0 2px var(--surface, #141417), 0 2px 8px rgba(0,0,0,0.4)' : 'none',
                              cursor: 'pointer',
                              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                              transition: 'transform 0.15s ease, border-color 0.15s ease',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Picker & Input */}
                  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 10, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={drawerColor.startsWith('#') && (drawerColor.length === 7 || drawerColor.length === 4) ? drawerColor : '#25D366'}
                      onChange={(e) => setDrawerColor(e.target.value)}
                      style={{
                        width: 44,
                        height: 38,
                        borderRadius: 8,
                        border: '1px solid var(--border-strong, #30303a)',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 2,
                      }}
                      aria-label="Store color picker"
                    />
                    <input
                      type="text"
                      value={drawerColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setDrawerColor(val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          setDrawerColor(`#${val}`);
                        }
                      }}
                      placeholder="#25D366"
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 13,
                        background: 'var(--surface-2, #1c1c21)',
                        border: '1px solid var(--border-strong, #30303a)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        color: 'var(--text, #f2f2f4)',
                        height: 38,
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      className="admin-action"
                      disabled={savingColorFor === selectedStore.id || drawerColor.toLowerCase() === (selectedStore.primary_color || '#25D366').toLowerCase()}
                      onClick={() => handleUpdateStoreColor(selectedStore.id, drawerColor)}
                      style={{ height: 38, padding: '0 14px' }}
                    >
                      <Palette size={15} />
                      {savingColorFor === selectedStore.id ? 'Saving…' : 'Save Color'}
                    </button>
                  </div>

                  {/* Live Preview Card */}
                  <div
                    style={{
                      borderRadius: 12,
                      padding: '14px 16px',
                      background: `linear-gradient(135deg, ${drawerColor} 0%, color-mix(in srgb, ${drawerColor} 40%, #0a0a0d) 100%)`,
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      boxShadow: `0 6px 20px ${drawerColor}30`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
                        Live Storefront Accent Preview
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 999 }}>
                        @{selectedStore.username}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: '#ffffff', color: drawerColor, fontSize: 12, fontWeight: 800 }}>
                        Order on WhatsApp
                      </span>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.18)', color: '#ffffff', fontSize: 12, fontWeight: 700 }}>
                        Featured Catalog
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-drawer__section">
                <h3>Nina Assistant Avatar</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: -4, marginBottom: 12 }}>
                  Admin-controlled — merchants can no longer change this photo themselves.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={selectedStore.nina_avatar_url || '/ninaAssistant.png'}
                    alt="Nina avatar"
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line, #e2e8f0)' }}
                  />
                  <label
                    className="btn btn-outline"
                    style={{ cursor: uploadingNinaAvatarFor === selectedStore.id ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Upload size={15} />
                    {uploadingNinaAvatarFor === selectedStore.id ? 'Uploading…' : 'Upload new photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      style={{ display: 'none' }}
                      disabled={uploadingNinaAvatarFor === selectedStore.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (file) handleNinaAvatarFile(selectedStore.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-drawer__actions">
              <button type="button" className="btn btn-outline" onClick={() => setSelectedStore(null)}>
                Close Inspector
              </button>
              {hasReachedProductLimit(selectedStore) && (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={sendingLimitEmailFor === selectedStore.id}
                  onClick={() => {
                    openConfirmationDialog(
                      'Send limit-reached email',
                      `Email "${selectedStore.user?.name || selectedStore.store_name}" letting them know they've hit the ${freeProductLimit}-product free plan limit and can upgrade to Pro?`,
                      async () => {
                        await handleSendLimitEmail(selectedStore.id);
                      }
                    );
                  }}
                >
                  <Mail size={15} />
                  {sendingLimitEmailFor === selectedStore.id ? 'Sending…' : 'Send limit email'}
                </button>
              )}
              {needsDedicatedAccount(selectedStore) && (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={generatingDvaFor === selectedStore.id}
                  onClick={() => {
                    openConfirmationDialog(
                      'Generate dedicated account',
                      `Generate a Paystack dedicated account for "${selectedStore.store_name}"? The merchant will be notified by email once it's ready.`,
                      async () => {
                        await handleGenerateDva(selectedStore.id);
                      }
                    );
                  }}
                >
                  <Landmark size={15} />
                  {generatingDvaFor === selectedStore.id ? 'Generating…' : 'Generate DVA'}
                </button>
              )}
              <button
                type="button"
                className={selectedStore.is_active ? 'btn btn-primary btn-danger-tone' : 'btn btn-primary'}
                onClick={() => {
                  openConfirmationDialog(
                    selectedStore.is_active ? 'Suspend store' : 'Activate store',
                    `Are you sure you want to ${selectedStore.is_active ? 'suspend' : 'activate'} "${selectedStore.store_name}"?`,
                    async () => {
                      await handleToggleStoreStatus(selectedStore.id);
                      setSelectedStore((prev) => (prev ? { ...prev, is_active: !prev.is_active } : null));
                    }
                  );
                }}
              >
                {selectedStore.is_active ? 'Suspend Store' : 'Activate Store'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-danger-tone"
                onClick={() => {
                  openConfirmationDialog(
                    'Delete store',
                    `This permanently deletes "${selectedStore.store_name}" and logs the merchant out of their dashboard. This cannot be undone.`,
                    async () => {
                      await handleDeleteStore(selectedStore.id);
                    }
                  );
                }}
              >
                <Trash2 size={15} />
                Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
