'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, Category } from '../AdminContext';
import { toast } from 'sonner';
import {
  Check,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { EmptyState } from '../components';

export default function AdminCategoriesPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catActionSaving, setCatActionSaving] = useState(false);

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

  const handleDeleteCategory = (id: string, name: string) => {
    openConfirmationDialog(
      'Delete category',
      `Are you sure you want to delete the global category "${name}"?`,
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
          <p>Categories available to every merchant catalog.</p>
        </div>
      </div>

      <form className="admin-inline-form" onSubmit={editingCatId ? handleUpdateCategory : handleCreateCategory}>
        <input
          value={editingCatId ? editingCatName : newCatName}
          onChange={(event) => (editingCatId ? setEditingCatName(event.target.value) : setNewCatName(event.target.value))}
          placeholder="Category name"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={catActionSaving}>
          {catActionSaving ? <Loader2 className="admin-spin" size={16} /> : editingCatId ? <Check size={16} /> : <Plus size={16} />}
          {editingCatId ? 'Update' : 'Add'}
        </button>
        {editingCatId && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setEditingCatId(null);
              setEditingCatName('');
            }}
          >
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
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(category.id);
                    setEditingCatName(category.name);
                  }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
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
