'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus, Package, Edit2, Trash2, Search, Filter,
  Copy, Check, ExternalLink, Sparkles, Tag, CheckCircle2, XCircle
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
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
    toast.success('Product link copied! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
              My Products
            </h2>
            <span style={{
              fontSize: 11.5,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              background: 'var(--bg-2)',
              color: 'var(--text-muted)'
            }}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 2 }}>
            Manage catalog items, pricing, inventory stock, and AI enhancements.
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="btn btn-primary clickable"
          style={{
            padding: '9px 16px',
            borderRadius: 'var(--r-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 750,
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(18, 140, 126, 0.25)'
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar & Filters Card */}
      <div className="card" style={{
        padding: '14px 18px',
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14
      }}>
        {/* Category & Stock Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', maxWidth: '100%' }} className="no-scrollbar">
          {/* All button */}
          <button
            onClick={() => { setSelectedCategory('all'); setStockFilter('all'); }}
            className="clickable"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--r-full)',
              fontSize: 12,
              fontWeight: (selectedCategory === 'all' && stockFilter === 'all') ? 800 : 600,
              background: (selectedCategory === 'all' && stockFilter === 'all') ? 'var(--primary-light)' : 'var(--bg-2)',
              color: (selectedCategory === 'all' && stockFilter === 'all') ? 'var(--primary)' : 'var(--text-muted)',
              border: (selectedCategory === 'all' && stockFilter === 'all') ? '1px solid var(--primary)' : '1px solid var(--border)',
              whiteSpace: 'nowrap'
            }}
          >
            All Items
          </button>

          {/* Categories */}
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="clickable"
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--r-full)',
                fontSize: 12,
                fontWeight: selectedCategory === cat ? 800 : 600,
                background: selectedCategory === cat ? 'var(--primary-light)' : 'var(--bg-2)',
                color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}

          {/* Stock toggle pill */}
          <button
            onClick={() => setStockFilter(stockFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
            className="clickable"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--r-full)',
              fontSize: 12,
              fontWeight: stockFilter === 'out_of_stock' ? 800 : 600,
              background: stockFilter === 'out_of_stock' ? 'rgba(239,68,68,0.1)' : 'var(--bg-2)',
              color: stockFilter === 'out_of_stock' ? 'var(--danger)' : 'var(--text-muted)',
              border: stockFilter === 'out_of_stock' ? '1px solid var(--danger)' : '1px solid var(--border)',
              whiteSpace: 'nowrap'
            }}
          >
            Out of Stock
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              fontSize: 12.5,
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              outline: 'none'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
        </div>
      </div>

      {/* Product Catalog Grid */}
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
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                      <Package size={36} strokeWidth={1.2} />
                    </div>
                  )}

                  {/* Stock Pill */}
                  <span style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--r-full)',
                    background: prod.stock_status === 'in_stock' ? 'rgba(18, 140, 126, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)'
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
                      padding: '2px 7px',
                      borderRadius: 'var(--r-full)',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Sparkles size={10} color="#facc15" /> AI
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 6 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {prod.category?.name || 'General'}
                  </span>

                  <h4 style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'var(--text)',
                    lineHeight: 1.35,
                    minHeight: 38,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {prod.name}
                  </h4>

                  {/* Pricing row */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', fontVariantNumeric: 'tabular-nums' }}>
                      {getCurrencySymbol(store?.currency_code)}{formatVal(prod.price)}
                    </span>
                    {hasDiscount && (
                      <span style={{ fontSize: 11.5, color: 'var(--text-faint)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>
                        {getCurrencySymbol(store?.currency_code)}{formatVal(prod.compare_at_price)}
                      </span>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)'
                  }}>
                    <button
                      onClick={() => onEditProduct(prod)}
                      className="btn btn-outline clickable"
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 'var(--r-md)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
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
                      {copiedId === prod.id ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => onDeleteProduct(prod.id)}
                      className="btn btn-ghost clickable"
                      style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{
            gridColumn: '1/-1',
            padding: '48px 20px',
            textAlign: 'center',
            borderRadius: 'var(--r-xl)',
            border: '1px dashed var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} />
            </div>
            <div style={{ maxWidth: 360 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                {searchQuery || selectedCategory !== 'all' || stockFilter !== 'all' ? 'No Matching Products' : 'No Products Listed Yet'}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                {searchQuery || selectedCategory !== 'all' || stockFilter !== 'all'
                  ? 'Try clearing your search query or selecting a different category filter.'
                  : 'Start adding items to your store to showcase your inventory to WhatsApp shoppers.'}
              </p>
            </div>
            {!searchQuery && selectedCategory === 'all' && stockFilter === 'all' && (
              <button
                onClick={onAddProduct}
                className="btn btn-primary clickable"
                style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', fontSize: 12.5, fontWeight: 750, marginTop: 4 }}
              >
                + Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
