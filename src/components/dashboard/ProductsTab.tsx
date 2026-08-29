'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus, Package, Edit2, Trash2, Search, Filter,
  Copy, Check, ExternalLink, Sparkles, Tag, CheckCircle2, XCircle,
  LayoutGrid, List, DollarSign, TrendingUp, AlertTriangle, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { Product, StoreInfo } from '@/types/dashboard';

interface ProductsTabProps {
  products: Product[];
  store: StoreInfo | null;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function ProductsTab({
  products,
  store,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currency = getCurrencySymbol(store?.currency_code);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [products]);

  // Inventory stats summary ribbon
  const stats = useMemo(() => {
    const totalCount = products.length;
    const inStockCount = products.filter(p => p.stock_status === 'in_stock').length;
    const outOfStockCount = totalCount - inStockCount;

    const totalCatalogValue = products.reduce((sum, p) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0);
      const stock = typeof p.inventory_quantity === 'number' ? p.inventory_quantity : 1;
      return sum + (isNaN(price) ? 0 : price * Math.max(1, stock));
    }, 0);

    return {
      total: totalCount,
      inStock: inStockCount,
      outOfStock: outOfStockCount,
      totalCatalogValue,
    };
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      // Category filter
      if (selectedCategory !== 'all' && prod.category?.name !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (stockFilter === 'in_stock' && prod.stock_status !== 'in_stock') return false;
      if (stockFilter === 'out_of_stock' && prod.stock_status === 'in_stock') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name?.toLowerCase().includes(q);
        const matchesDesc = prod.description?.toLowerCase().includes(q);
        const matchesCat = prod.category?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  const handleCopyProductLink = (product: Product) => {
    if (!store?.username) return;
    const systemDomain = typeof window !== 'undefined' && (localStorage.getItem('system_domain') || process.env.NEXT_PUBLIC_SYSTEM_DOMAIN) || 'frontstore.ng';
    const domain = systemDomain === 'frontstore.app' ? 'frontstore.ng' : systemDomain;
    const url = `https://${store.username}.${domain}/${product.slug || product.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(product.id);
    toast.success('Product link copied to clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ── HEADER & TOP ACTION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 2.5vw, 26px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
              Product Inventory
            </h1>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              background: 'var(--bg-2)',
              color: 'var(--text-muted)'
            }}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Manage catalog items, pricing variants, stock levels, and AI photography enhancements.
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="btn btn-primary clickable"
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--r-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontWeight: 750,
            fontSize: 13,
            boxShadow: '0 4px 14px rgba(11, 93, 57, 0.28)'
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* ── INVENTORY KPI RIBBON ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Items
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {stats.total}
          </p>
        </div>

        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            In Stock
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {stats.inStock}
          </p>
        </div>

        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: stats.outOfStock > 0 ? 'var(--danger)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Out of Stock
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: stats.outOfStock > 0 ? 'var(--danger)' : 'var(--text)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {stats.outOfStock}
          </p>
        </div>

        <div className="dash-kpi-card" style={{ padding: '16px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Est. Catalog Value
          </span>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {currency}{formatVal(stats.totalCatalogValue)}
          </p>
        </div>
      </div>

      {/* ── TOOLBAR & FILTERS CARD ── */}
      <div className="card" style={{
        padding: '14px 18px',
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Category & Stock Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }} className="no-scrollbar">
          <button
            type="button"
            onClick={() => { setSelectedCategory('all'); setStockFilter('all'); }}
            className={`filter-chip-btn ${(selectedCategory === 'all' && stockFilter === 'all') ? 'active' : ''}`}
          >
            All Items
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`filter-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setStockFilter(stockFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
            className={`filter-chip-btn ${stockFilter === 'out_of_stock' ? 'active' : ''}`}
          >
            Out of Stock ({stats.outOfStock})
          </button>
        </div>

        {/* Search and Grid/Table Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="dash-omni-input"
              style={{ padding: '7px 12px 7px 32px', fontSize: 12.5 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          </div>

          <div className="segmented-control-container">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`segmented-control-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
              style={{ padding: '5px 8px' }}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`segmented-control-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Table View"
              style={{ padding: '5px 8px' }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── PRODUCTS CONTENT (Grid or Table View) ── */}
      {viewMode === 'grid' ? (
        <div className="responsive-product-catalog-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(prod => {
              const hasDiscount = Boolean(prod.compare_at_price && Number(prod.compare_at_price) > Number(prod.price));
              const isAiImage = prod.image_urls?.[0] && (prod.image_urls[0].includes('/products/ai_') || prod.image_urls[0].includes('/ai_') || prod.image_urls[0].includes('products/ai_'));

              return (
                <div
                  key={prod.id}
                  className="card hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--r-xl)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Product Image Area */}
                  <div style={{
                    width: '100%',
                    paddingTop: '75%',
                    position: 'relative',
                    background: 'var(--bg-2)',
                    overflow: 'hidden'
                  }}>
                    {prod.image_urls?.[0] ? (
                      <img
                        src={prod.image_urls[0]}
                        alt={prod.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                        <Package size={38} strokeWidth={1.2} />
                      </div>
                    )}

                    {/* Stock Pill */}
                    <span style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--r-full)',
                      background: prod.stock_status === 'in_stock' ? 'rgba(11, 93, 57, 0.92)' : 'rgba(239, 68, 68, 0.92)',
                      color: '#fff',
                      backdropFilter: 'blur(6px)'
                    }}>
                      {prod.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    </span>

                    {/* AI Badge */}
                    {isAiImage && (
                      <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--r-full)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#fff',
                        backdropFilter: 'blur(6px)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Sparkles size={10} color="#facc15" /> AI Enhanced
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {prod.category?.name || 'General'}
                    </span>

                    <h4 style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: 'var(--text)',
                      lineHeight: 1.35,
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: 0
                    }}>
                      {prod.name}
                    </h4>

                    {/* Pricing row */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'auto' }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', fontVariantNumeric: 'tabular-nums' }}>
                        {currency}{formatVal(prod.price)}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: 12, color: 'var(--text-faint)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>
                          {currency}{formatVal(prod.compare_at_price)}
                        </span>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)',
                      marginTop: 6
                    }}>
                      <button
                        onClick={() => onEditProduct(prod)}
                        className="btn btn-outline clickable"
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          fontSize: 12,
                          borderRadius: 'var(--r-md)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          fontWeight: 700,
                          background: 'var(--surface)'
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleCopyProductLink(prod)}
                        className="btn btn-ghost clickable"
                        style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}
                        title="Copy Product Link"
                      >
                        {copiedId === prod.id ? <Check size={15} color="var(--primary)" /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="btn btn-ghost clickable"
                        style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{
              gridColumn: '1/-1',
              padding: '52px 20px',
              textAlign: 'center',
              borderRadius: 'var(--r-xl)',
              border: '1px dashed var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {searchQuery || selectedCategory !== 'all' || stockFilter !== 'all' ? 'No Matching Products' : 'No Products Listed Yet'}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.45, margin: '6px 0 0' }}>
                  {searchQuery || selectedCategory !== 'all' || stockFilter !== 'all'
                    ? 'Try clearing your search query or selecting a different category filter.'
                    : 'Start adding items to your store to showcase your inventory to WhatsApp shoppers.'}
                </p>
              </div>
              {!searchQuery && selectedCategory === 'all' && stockFilter === 'all' && (
                <button
                  onClick={onAddProduct}
                  className="btn btn-primary clickable"
                  style={{ padding: '9px 18px', borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 750, marginTop: 6 }}
                >
                  + Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="card" style={{
          padding: 0,
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table-stream">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {prod.image_urls?.[0] ? (
                            <img
                              src={prod.image_urls[0]}
                              alt=""
                              style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', objectFit: 'cover', border: '1px solid var(--border)' }}
                            />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                              <Package size={16} />
                            </div>
                          )}
                          <div>
                            <p style={{ fontWeight: 750, color: 'var(--text)', margin: 0, fontSize: 13.5 }}>{prod.name}</p>
                            <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>ID: {prod.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                        {prod.category?.name || 'General'}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', fontSize: 13.5 }}>
                          {currency}{formatVal(prod.price)}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--r-full)',
                          background: prod.stock_status === 'in_stock' ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.1)',
                          color: prod.stock_status === 'in_stock' ? 'var(--primary)' : 'var(--danger)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: prod.stock_status === 'in_stock' ? 'var(--primary)' : 'var(--danger)' }} />
                          {prod.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onEditProduct(prod)}
                            className="btn btn-outline clickable"
                            style={{ padding: '5px 10px', fontSize: 12, borderRadius: 'var(--r-md)', background: 'var(--surface)' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCopyProductLink(prod)}
                            className="btn btn-ghost clickable"
                            style={{ padding: '5px 8px', borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}
                            title="Copy Link"
                          >
                            {copiedId === prod.id ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="btn btn-ghost clickable"
                            style={{ padding: '5px 8px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No matching products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
