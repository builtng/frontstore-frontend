'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, StoreInfo } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Power,
  Search,
  Trash2,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';

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

export default function AdminStoresPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);

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

  const handleToggleStoreStatus = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
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
                <tr
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  style={{ cursor: 'pointer' }}
                  className="admin-table-row-hoverable"
                >
                  <td>
                    <strong>{store.store_name}</strong>
                    <a
                      href={
                        store.custom_domain
                          ? `https://${store.custom_domain}`
                          : `${window.location.origin}/${store.username}`
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
                    <div className="admin-plan-cell" onClick={(e) => e.stopPropagation()}>
                      <StatusChip tone={isProPlan(store.user?.plan) ? 'green' : 'gray'} label={planLabel(store.user?.plan)} />
                      <label className="admin-select">
                        <select
                          value={store.user?.plan || 'free'}
                          onChange={(event) => handleUpdateUserPlan(store.user?.id, event.target.value)}
                          disabled={!store.user}
                        >
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
                    <button
                      type="button"
                      className={store.is_active ? 'admin-action danger' : 'admin-action'}
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
            </div>

            <div className="admin-drawer__actions">
              <button type="button" className="btn btn-outline" onClick={() => setSelectedStore(null)}>
                Close Inspector
              </button>
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
