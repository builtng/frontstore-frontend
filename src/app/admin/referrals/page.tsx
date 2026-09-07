'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  Users, CheckCircle2, XCircle, Clock, ShieldCheck,
  AlertTriangle, Check, RefreshCw, ExternalLink, Package,
  DollarSign, Search, ArrowRight, ArrowLeft
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';

export default function AdminReferralsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [activeTab, setActiveTab] = useState<'applications' | 'products' | 'overview'>('applications');

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState('pending');
  const [appsPage, setAppsPage] = useState(1);
  const [appsLastPage, setAppsLastPage] = useState(1);

  // Products awaiting verification state
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [prodPage, setProdPage] = useState(1);
  const [prodLastPage, setProdLastPage] = useState(1);

  // Overview stats & all referrals state
  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [referralSearch, setReferralSearch] = useState('');

  const loadApplications = async (page = 1, status = appStatusFilter) => {
    if (!token) return;
    try {
      setAppsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/applications?page=${page}&status=${status}`, {
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Could not fetch applications.');
      setApplications(json.data?.data || []);
      setAppsPage(json.data?.current_page || 1);
      setAppsLastPage(json.data?.last_page || 1);
    } catch (e: any) {
      if (e.message !== 'Session expired') toast.error(e.message);
    } finally {
      setAppsLoading(false);
    }
  };

  const loadPendingProducts = async (page = 1) => {
    if (!token) return;
    try {
      setProductsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/pending-products?page=${page}`, {
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Could not fetch pending products.');
      setPendingProducts(json.data?.data || []);
      setProdPage(json.data?.current_page || 1);
      setProdLastPage(json.data?.last_page || 1);
    } catch (e: any) {
      if (e.message !== 'Session expired') toast.error(e.message);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOverview = async (page = 1, search = referralSearch) => {
    if (!token) return;
    try {
      setOverviewLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/overview?page=${page}&search=${encodeURIComponent(search)}`, {
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Could not fetch referral overview.');
      setOverviewData(json.data || null);
    } catch (e: any) {
      if (e.message !== 'Session expired') toast.error(e.message);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'applications') loadApplications(1, appStatusFilter);
      if (activeTab === 'products') loadPendingProducts(1);
      if (activeTab === 'overview') loadOverview(1);
    }
  }, [token, activeTab]);

  const handleApproveApplication = (app: any) => {
    openConfirmationDialog(
      'Approve Referral Application',
      `Approve ${app.user?.name} (@${app.store?.username}) to become a referral partner? Their background check will be marked as passed.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/applications/${app.id}/approve`, {
            method: 'POST',
            credentials: 'include',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to approve application.');
          toast.success(json.message || 'Application approved.');
          loadApplications(appsPage, appStatusFilter);
        } catch (e: any) {
          if (e.message !== 'Session expired') toast.error(e.message);
        }
      },
      'Approve Partner',
      'Cancel'
    );
  };

  const handleRejectApplication = (app: any) => {
    openConfirmationDialog(
      'Reject Referral Application',
      `Reject ${app.user?.name}'s application? They will not be granted referral partner status at this time.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/applications/${app.id}/reject`, {
            method: 'POST',
            credentials: 'include',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject application.');
          toast.success(json.message || 'Application rejected.');
          loadApplications(appsPage, appStatusFilter);
        } catch (e: any) {
          if (e.message !== 'Session expired') toast.error(e.message);
        }
      },
      'Reject Application',
      'Cancel'
    );
  };

  const handleVerifyProduct = (referral: any) => {
    openConfirmationDialog(
      'Verify First Product & Pay ₦100',
      `Verify "${referral.first_product?.name}" from store "${referral.referee_store?.store_name}"? This will confirm the upload is legitimate and release ₦100 to referrer ${referral.referrer?.name} (${referral.referrer?.store?.store_name}).`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/products/${referral.id}/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to verify product.');
          toast.success(json.message || 'Product verified! ₦100 reward released.');
          loadPendingProducts(prodPage);
        } catch (e: any) {
          if (e.message !== 'Session expired') toast.error(e.message);
        }
      },
      'Verify & Release ₦100',
      'Cancel'
    );
  };

  const handleRejectProduct = (referral: any) => {
    openConfirmationDialog(
      'Reject Product (Fake/Nonsense)',
      `Reject "${referral.first_product?.name}" as a fake or spam upload? No referral reward will be issued for this upload.`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/merchant-referrals/products/${referral.id}/reject`, {
            method: 'POST',
            credentials: 'include',
            headers: getHeaders(),
          });
          const json = await handleFetchResponse(res, 'Failed to reject product.');
          toast.success(json.message || 'Product marked as fake/nonsense.');
          loadPendingProducts(prodPage);
        } catch (e: any) {
          if (e.message !== 'Session expired') toast.error(e.message);
        }
      },
      'Reject Fake Upload',
      'Cancel'
    );
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>In-House Merchant Referrals</h2>
          <p>Review partner applications, verify referee first product uploads, and monitor platform-wide referral rewards.</p>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('applications')}
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <Users size={15} /> Partner Applications
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <Package size={15} /> First Product Verifications
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <DollarSign size={15} /> Platform Referrals Overview
        </button>
      </div>

      {/* SUBTAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Status filter:</span>
            {['pending', 'approved', 'rejected', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setAppStatusFilter(st);
                  loadApplications(1, st);
                }}
                className={`btn ${appStatusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: 12, textTransform: 'capitalize' }}
              >
                {st}
              </button>
            ))}
          </div>

          {appsLoading ? (
            <TableSkeleton rows={4} columns={6} />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications found"
              description={`There are currently no ${appStatusFilter} merchant referral applications.`}
              icon={<Users size={32} />}
            />
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant / Store</th>
                    <th>Catalog</th>
                    <th>Social Handles</th>
                    <th>Platform Age</th>
                    <th>Background Check</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{app.user?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {app.store?.store_name} (@{app.store?.username})
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{app.user?.email}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: app.products_count >= 5 ? '#10b981' : '#d97706' }}>
                          {app.products_count} / 5 products
                        </span>
                      </td>
                      <td>
                        {app.social_links && Object.keys(app.social_links).length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
                            {Object.entries(app.social_links).map(([k, v]: any) => (
                              <span key={k} style={{ fontSize: 11, background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>None provided</span>
                        )}
                      </td>
                      <td>{app.platform_age_days} days active</td>
                      <td>
                        <StatusChip
                          tone={
                            app.status === 'approved' || app.background_check_status === 'passed'
                              ? 'green'
                              : app.status === 'rejected'
                              ? 'red'
                              : 'orange'
                          }
                          label={
                            app.background_check_status === 'passed'
                              ? 'Passed'
                              : app.background_check_status === 'failed'
                              ? 'Failed'
                              : 'Pending'
                          }
                        />
                      </td>
                      <td>
                        {app.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleApproveApplication(app)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectApplication(app)}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: 12, color: '#ef4444' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 600 }}>
                            {app.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: FIRST PRODUCT VERIFICATIONS */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Referred merchants must post an authentic first product to trigger the <strong>₦100</strong> referral reward for their referrer. Review and verify products below against fake/nonsense spam uploads.
          </div>

          {productsLoading ? (
            <TableSkeleton rows={3} columns={5} />
          ) : pendingProducts.length === 0 ? (
            <EmptyState
              title="No pending product verifications"
              description="All first product uploads by referred merchants have been verified or none are pending."
              icon={<Package size={32} />}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {pendingProducts.map((ref) => {
                const prod = ref.first_product;
                return (
                  <div
                    key={ref.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 16,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          background: 'var(--bg-subtle)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {prod?.image_urls?.[0] ? (
                          <img src={prod.image_urls[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={24} style={{ opacity: 0.4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{prod?.name || 'Untitled Product'}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginTop: 2 }}>₦{prod?.price?.toLocaleString() || '0'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Store: <strong>{ref.referee_store?.store_name}</strong> (@{ref.referee_store?.username})
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, background: 'var(--bg-subtle)', padding: 10, borderRadius: 8 }}>
                      {prod?.description ? (
                        prod.description.length > 120 ? `${prod.description.slice(0, 120)}...` : prod.description
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>No description provided</span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-faint)', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                      Referrer who will earn ₦100: <strong>{ref.referrer?.name}</strong> ({ref.referrer?.store?.store_name})
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button
                        onClick={() => handleVerifyProduct(ref)}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '8px 12px', fontSize: 12, justifyContent: 'center' }}
                      >
                        <Check size={14} /> Verify & Pay ₦100
                      </button>
                      <button
                        onClick={() => handleRejectProduct(ref)}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: 12, color: '#ef4444' }}
                      >
                        Reject Spam
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PLATFORM OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {overviewData?.stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Merchant Referrals</span>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{overviewData.stats.total_referrals}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Rewards Paid</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                  ₦{overviewData.stats.total_rewards_paid?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending Applications</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                  {overviewData.stats.pending_applications}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending Product Verifications</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>
                  {overviewData.stats.pending_product_reviews}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by referee or referrer..."
              value={referralSearch}
              onChange={(e) => setReferralSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadOverview(1, referralSearch)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, width: 280 }}
            />
            <button onClick={() => loadOverview(1, referralSearch)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Search
            </button>
          </div>

          {overviewLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : overviewData?.referrals?.data?.length === 0 ? (
            <EmptyState title="No referrals found" description="No merchant referrals match your filter." icon={<Users size={32} />} />
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Referrer (Earner)</th>
                    <th>Referee (Joined)</th>
                    <th>Current Plan</th>
                    <th>1st Product Status</th>
                    <th>Total Earned (Max ₦1k)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewData?.referrals?.data?.map((ref: any) => (
                    <tr key={ref.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{ref.referrer?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ref.referrer?.store?.store_name}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{ref.referee?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ref.refereeStore?.store_name}</div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{ref.referee?.plan || 'Free'}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: ref.first_product_status === 'verified' ? '#10b981' : ref.first_product_status === 'rejected' ? '#ef4444' : '#d97706',
                          }}
                        >
                          {ref.first_product_status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#10b981' }}>₦{ref.total_earned?.toLocaleString()}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{ref.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
