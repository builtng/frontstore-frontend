'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, ChevronDown, ChevronUp, Loader2, Layers } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import Toggle from '../../../components/Toggle';
import { SkeletonGrid } from '../components';

interface PlanSku {
  id: string;
  key: string;
  billing_label: string | null;
  price: string;
  paystack_plan_code: string | null;
}

interface PlanFeatureRow {
  id: string;
  feature_key: string;
  enabled: boolean;
}

interface PlanDashboardItemRow {
  id: string;
  item_key: string;
  is_visible: boolean;
}

interface PlanGroup {
  id: string;
  key: string;
  name: string;
  tagline: string | null;
  tier_rank: number;
  highlight: boolean;
  benefits: string[] | null;
  is_active: boolean;
  plans: PlanSku[];
  features: PlanFeatureRow[];
  dashboard_items: PlanDashboardItemRow[];
}

const FEATURE_LABELS: Record<string, string> = {
  custom_domain: 'Custom Domain',
  remove_distractions: 'Remove Distractions (dashboard customization)',
  pixel_tracking: 'Pixel Tracking (Facebook/GTM/TikTok)',
  affiliate_program: 'Affiliate Program',
};

const DASHBOARD_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: 'Sidebar',
    keys: [
      'orders', 'products', 'inventory', 'coupons', 'customers', 'wallet',
      'payment-links', 'invoices', 'receipts', 'whatsapp',
      'share', 'qr', 'reviews', 'blog', 'availability', 'bookings',
      'integrations', 'billing',
    ],
  },
  { label: 'Stats', keys: ['stat_revenue', 'stat_orders', 'stat_views', 'stat_whatsapp', 'stat_conversion'] },
  { label: 'Feature sections', keys: ['section_charts'] },
];

export default function AdminPlansPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [groups, setGroups] = useState<PlanGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTierRank, setNewTierRank] = useState('5');
  const [newMonthlyPrice, setNewMonthlyPrice] = useState('');
  const [newYearlyPrice, setNewYearlyPrice] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups`, { credentials: 'include', headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not load plans.');
      setGroups(json.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Could not load plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newName.trim(),
          tier_rank: Number(newTierRank) || 0,
          monthly_price: newMonthlyPrice === '' ? null : Number(newMonthlyPrice),
          yearly_price: newYearlyPrice === '' ? null : Number(newYearlyPrice),
        }),
      });
      await handleFetchResponse(res, 'Could not create plan.');
      toast.success('Plan created.');
      setShowCreate(false);
      setNewName('');
      setNewTierRank('5');
      setNewMonthlyPrice('');
      setNewYearlyPrice('');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not create plan.');
    } finally {
      setCreating(false);
    }
  };

  const updateSkuPriceLocal = (groupId: string, skuId: string, price: string) => {
    setGroups((prev) => prev.map((g) => g.id !== groupId ? g : {
      ...g, plans: g.plans.map((p) => p.id === skuId ? { ...p, price } : p),
    }));
  };

  const savePrices = async (group: PlanGroup) => {
    setSavingGroupId(group.id);
    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups/${group.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({
          plans: group.plans.map((p) => ({ id: p.id, price: Number(p.price) })),
        }),
      });
      await handleFetchResponse(res, 'Could not save prices.');
      toast.success('Prices saved.');
    } catch (err: any) {
      toast.error(err.message || 'Could not save prices.');
    } finally {
      setSavingGroupId(null);
    }
  };

  const updateCopyLocal = (groupId: string, field: 'tagline' | 'benefitsText', value: string) => {
    setGroups((prev) => prev.map((g) => g.id !== groupId ? g : (
      field === 'tagline' ? { ...g, tagline: value } : { ...g, benefits: value.split('\n') }
    )));
  };

  const saveCopy = async (group: PlanGroup) => {
    setSavingGroupId(group.id);
    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups/${group.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({
          tagline: group.tagline || '',
          benefits: (group.benefits || []).map((b) => b.trim()).filter(Boolean),
        }),
      });
      await handleFetchResponse(res, 'Could not save plan copy.');
      toast.success('Plan copy saved.');
    } catch (err: any) {
      toast.error(err.message || 'Could not save plan copy.');
    } finally {
      setSavingGroupId(null);
    }
  };

  const toggleHighlight = async (group: PlanGroup, highlight: boolean) => {
    setGroups((prev) => prev.map((g) => g.id !== group.id ? g : { ...g, highlight }));
    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups/${group.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ highlight }),
      });
      await handleFetchResponse(res, 'Could not update highlight.');
    } catch (err: any) {
      toast.error(err.message || 'Could not update highlight.');
      load();
    }
  };

  const toggleFeature = async (group: PlanGroup, featureKey: string, enabled: boolean) => {
    setGroups((prev) => prev.map((g) => g.id !== group.id ? g : {
      ...g,
      features: g.features.some((f) => f.feature_key === featureKey)
        ? g.features.map((f) => f.feature_key === featureKey ? { ...f, enabled } : f)
        : [...g.features, { id: featureKey, feature_key: featureKey, enabled }],
    }));

    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups/${group.id}/features`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ features: { [featureKey]: enabled } }),
      });
      await handleFetchResponse(res, 'Could not update feature.');
    } catch (err: any) {
      toast.error(err.message || 'Could not update feature.');
      load();
    }
  };

  const toggleDashboardItem = async (group: PlanGroup, itemKey: string, visible: boolean) => {
    setGroups((prev) => prev.map((g) => g.id !== group.id ? g : {
      ...g,
      dashboard_items: g.dashboard_items.some((d) => d.item_key === itemKey)
        ? g.dashboard_items.map((d) => d.item_key === itemKey ? { ...d, is_visible: visible } : d)
        : [...g.dashboard_items, { id: itemKey, item_key: itemKey, is_visible: visible }],
    }));

    try {
      const res = await fetch(`${apiUrl}/v1/admin/plan-groups/${group.id}/dashboard-items`, {
        method: 'PUT',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ items: { [itemKey]: visible } }),
      });
      await handleFetchResponse(res, 'Could not update dashboard visibility.');
    } catch (err: any) {
      toast.error(err.message || 'Could not update dashboard visibility.');
      load();
    }
  };

  if (loading) {
    return <section className="admin-section animate-fade-in"><SkeletonGrid /></section>;
  }

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2>Plans</h2>
          <p>Create plans, edit pricing, and control which features and dashboard items each plan gets.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.sort((a, b) => a.tier_rank - b.tier_rank).map((group) => {
          const isOpen = expanded === group.id;
          return (
            <div key={group.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : group.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={17} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <b style={{ fontSize: 15 }}>{group.name}</b>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>key: {group.key} · tier rank {group.tier_rank}</div>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {isOpen && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Pricing</h4>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      {group.plans.map((sku) => (
                        <div key={sku.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{sku.billing_label || 'Price'} (₦)</label>
                          <input
                            type="number" className="form-control" style={{ width: 140 }}
                            value={sku.price}
                            onChange={(e) => updateSkuPriceLocal(group.id, sku.id, e.target.value)}
                          />
                        </div>
                      ))}
                      <button className="btn btn-outline" disabled={savingGroupId === group.id} onClick={() => savePrices(group)}>
                        {savingGroupId === group.id ? <Loader2 size={14} className="spinner" /> : 'Save prices'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Pricing page copy</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 460 }}>
                      <div>
                        <label style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Tagline</label>
                        <input
                          className="form-control" style={{ width: '100%' }}
                          value={group.tagline || ''}
                          onChange={(e) => updateCopyLocal(group.id, 'tagline', e.target.value)}
                          placeholder="e.g. Unlimited products, AI listings, and branding."
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Benefits (one per line — end a line with &quot;:&quot; to make it a section heading)</label>
                        <textarea
                          className="form-control" style={{ width: '100%', minHeight: 110, fontFamily: 'inherit' }}
                          value={(group.benefits || []).join('\n')}
                          onChange={(e) => updateCopyLocal(group.id, 'benefitsText', e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Toggle checked={group.highlight} onChange={(v) => toggleHighlight(group, v)} label={<span style={{ fontSize: 13 }}>Highlight this plan on the pricing page</span>} />
                        <button className="btn btn-outline" disabled={savingGroupId === group.id} onClick={() => saveCopy(group)}>
                          {savingGroupId === group.id ? <Loader2 size={14} className="spinner" /> : 'Save copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Features</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                      {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                        const enabled = !!group.features.find((f) => f.feature_key === key)?.enabled;
                        return (
                          <Toggle key={key} checked={enabled} onChange={(v) => toggleFeature(group, key, v)} label={<span style={{ fontSize: 13 }}>{label}</span>} />
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', margin: '0 0 10px' }}>Dashboard visibility</h4>
                    {DASHBOARD_GROUPS.map((sub) => (
                      <div key={sub.label} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>{sub.label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                          {sub.keys.map((key) => {
                            const visible = group.dashboard_items.find((d) => d.item_key === key)?.is_visible ?? true;
                            return (
                              <Toggle key={key} checked={visible} onChange={(v) => toggleDashboardItem(group, key, v)} label={<span style={{ fontSize: 12.5 }}>{key}</span>} />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.45)' }}>
          <div style={{ width: 'min(100%, 440px)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 20, padding: 26 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>New plan</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-muted)' }}>
              Creates the plan tier plus a Monthly and/or Yearly billing SKU. A Paystack subscription plan is created automatically for any SKU with a price above ₦0.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Name</label>
                <input className="form-control" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Turbo" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Tier rank</label>
                <input type="number" className="form-control" value={newTierRank} onChange={(e) => setNewTierRank(e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '4px 0 0' }}>Free=0, Pro=10, Legend=20 — rank at or above 10/20 automatically inherits Pro/Legend gates elsewhere in the app.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Monthly price (₦)</label>
                  <input type="number" className="form-control" value={newMonthlyPrice} onChange={(e) => setNewMonthlyPrice(e.target.value)} placeholder="Leave blank to skip" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Yearly price (₦)</label>
                  <input type="number" className="form-control" value={newYearlyPrice} onChange={(e) => setNewYearlyPrice(e.target.value)} placeholder="Leave blank to skip" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowCreate(false)} disabled={creating} style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', borderRadius: 10, padding: '10px 16px' }}>Cancel</button>
              <button className="btn btn-primary" disabled={creating || !newName.trim()} onClick={handleCreate}>
                {creating ? 'Creating…' : 'Create plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
