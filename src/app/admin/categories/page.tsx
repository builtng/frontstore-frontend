'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, Category } from '../AdminContext';
import { toast } from 'sonner';
import {
  Check,
  CreditCard,
  Edit2,
  Info,
  Loader2,
  Plus,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { EmptyState } from '../components';

const DELIVERY_PRESETS = [
  'Instant (Digital)',
  'Same day (1–3 hours)',
  '24–48 hours',
  '1–2 days',
  '2–3 days',
  '3–5 days',
  '5–7 days',
];

export default function AdminCategoriesPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTimeline, setNewCatTimeline] = useState('24–48 hours');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatTimeline, setEditingCatTimeline] = useState('');
  const [catActionSaving, setCatActionSaving] = useState(false);

  const loadCategories = async () => {
    if (!token) return;
    try {
      setCategoriesLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories`, { credentials: 'include', headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch global categories.');
      setCategories(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreateCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCatActionSaving(true);
      const res = await fetch(`${apiUrl}/v1/admin/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newCatName.trim(),
          delivery_timeline: newCatTimeline.trim() || '24–48 hours',
        }),
      });
      await handleFetchResponse(res, 'Could not create category.');
      toast.success('Category created.');
      setNewCatName('');
      setNewCatTimeline('24–48 hours');
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
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({
          name: editingCatName.trim(),
          delivery_timeline: editingCatTimeline.trim() || '24–48 hours',
        }),
      });
      await handleFetchResponse(res, 'Could not update category.');
      toast.success('Category updated.');
      setEditingCatId(null);
      setEditingCatName('');
      setEditingCatTimeline('');
      loadCategories();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setCatActionSaving(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCatId(category.id);
    setEditingCatName(category.name);
    setEditingCatTimeline(category.delivery_timeline || '24–48 hours');
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setEditingCatName('');
    setEditingCatTimeline('');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    openConfirmationDialog(
      'Delete category',
      `Are you sure you want to delete the global category "${name}"?`,
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/admin/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include',
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

  useEffect(() => {
    if (token) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section admin-section--narrow animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Global categories</h2>
          <p>Categories available to every merchant catalog with fulfillment timelines.</p>
        </div>
      </div>

      {/* Payout Rule Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(37, 211, 102, 0.08)',
          border: '1px solid rgba(37, 211, 102, 0.22)',
          marginBottom: 16,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--text-main, #EDEDED)',
        }}
      >
        <Info size={18} style={{ color: '#25D366', marginTop: 2, flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#25D366', display: 'block', marginBottom: 2 }}>
            Merchant Payment SLA: 24–48 Hours Post-Delivery
          </strong>
          <span>
            Each category's delivery timeline determines when fulfillment is expected. Platform payout to the merchant is scheduled <strong>24–48 hours</strong> after delivery.
          </span>
        </div>
      </div>

      {/* Category Creation / Edit Form */}
      <form
        onSubmit={editingCatId ? handleUpdateCategory : handleCreateCategory}
        style={{
          background: 'var(--surface-1, #13151b)',
          border: '1px solid var(--border, #262935)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto auto', gap: 10, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #8b92a5)', marginBottom: 4 }}>
              Category Name
            </label>
            <input
              style={{ width: '100%' }}
              value={editingCatId ? editingCatName : newCatName}
              onChange={(event) => (editingCatId ? setEditingCatName(event.target.value) : setNewCatName(event.target.value))}
              placeholder="e.g. Beauty & Cosmetics"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #8b92a5)', marginBottom: 4 }}>
              Delivery Timeline
            </label>
            <input
              style={{ width: '100%' }}
              value={editingCatId ? editingCatTimeline : newCatTimeline}
              onChange={(event) =>
                editingCatId ? setEditingCatTimeline(event.target.value) : setNewCatTimeline(event.target.value)
              }
              placeholder="e.g. 2–3 days"
              list="delivery-timeline-presets"
              required
            />
            <datalist id="delivery-timeline-presets">
              {DELIVERY_PRESETS.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={catActionSaving} style={{ height: 42 }}>
              {catActionSaving ? <Loader2 className="admin-spin" size={16} /> : editingCatId ? <Check size={16} /> : <Plus size={16} />}
              {editingCatId ? 'Update' : 'Add'}
            </button>
          </div>

          {editingCatId && (
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancelEdit}
                style={{ height: 42 }}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Quick Presets Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 2 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted, #8b92a5)' }}>Presets:</span>
          {DELIVERY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                if (editingCatId) {
                  setEditingCatTimeline(preset);
                } else {
                  setNewCatTimeline(preset);
                }
              }}
              style={{
                background:
                  (editingCatId ? editingCatTimeline : newCatTimeline) === preset
                    ? 'rgba(37, 211, 102, 0.2)'
                    : 'var(--surface-2, #1c1f2a)',
                border:
                  (editingCatId ? editingCatTimeline : newCatTimeline) === preset
                    ? '1px solid #25D366'
                    : '1px solid var(--border, #262935)',
                color:
                  (editingCatId ? editingCatTimeline : newCatTimeline) === preset
                    ? '#25D366'
                    : 'var(--text-main, #d1d5db)',
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </form>

      <div className="admin-list">
        {categoriesLoading ? (
          [1, 2, 3, 4].map((item) => <div key={item} className="admin-list-skeleton" />)
        ) : categories.length ? (
          categories.map((category) => (
            <div
              className="admin-list-row"
              key={category.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14 }}>{category.name}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted, #8b92a5)' }}>{category.slug}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                    }}
                  >
                    <Truck size={12} /> Delivery: {category.delivery_timeline || '24–48 hours'}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(37, 211, 102, 0.12)',
                      color: '#25D366',
                      border: '1px solid rgba(37, 211, 102, 0.25)',
                    }}
                  >
                    <CreditCard size={12} /> Payout: 24–48h post-delivery
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  title="Edit category"
                  onClick={() => handleStartEdit(category)}
                  style={{
                    background: 'var(--surface-2, #1c1f2a)',
                    border: '1px solid var(--border, #262935)',
                    color: 'var(--text-main, #EDEDED)',
                    padding: 8,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  className="danger"
                  title="Delete category"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: 8,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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
  );
}

