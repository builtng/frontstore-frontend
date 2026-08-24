'use client';

import React from 'react';
import { Plus, Package, Edit2, Trash2 } from 'lucide-react';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { Product, StoreInfo } from '@/types/dashboard';

interface ProductsTabProps {
  products: Product[];
  store: StoreInfo | null;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function ProductsTab({ products, store, onAddProduct, onEditProduct, onDeleteProduct }: ProductsTabProps) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="responsive-product-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>My Products</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Converts inventory into checkouts. Create items, update pricing, and generate descriptions using AI.</p>
        </div>
        <button
          onClick={onAddProduct}
          className="btn btn-primary clickable"
          style={{ padding: '10px 18px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="responsive-product-catalog-grid">
        {products.length > 0 ? (
          products.map(prod => (
            <div
              key={prod.id}
              className="card hover-lift responsive-product-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                minHeight: 330
              }}
            >
              {/* Image */}
              <div style={{
                width: '100%',
                paddingTop: '80%',
                position: 'relative',
                background: 'var(--bg-2)'
              }}>
                {prod.image_urls?.[0] ? (
                  <img
                    src={prod.image_urls[0]}
                    alt={prod.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                    <Package size={40} strokeWidth={1} />
                  </div>
                )}

                {/* Stock badge */}
                <span className={`badge ${prod.stock_status === 'in_stock' ? 'badge-primary' : 'badge-danger'}`} style={{ position: 'absolute', top: 10, left: 10, fontSize: 9 }}>
                  {prod.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                </span>

                {/* AI Image badge */}
                {prod.image_urls?.[0] && (prod.image_urls[0].includes('/products/ai_') || prod.image_urls[0].includes('/ai_') || prod.image_urls[0].includes('products/ai_')) && (
                  <span className="badge" style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, background: 'rgba(15, 23, 42, 0.65)', color: '#fff', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                    ✨ AI Image
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="responsive-product-card-body" style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
                <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {prod.category?.name || 'Uncategorized'}
                </span>
                <h4 className="responsive-product-card-title" style={{ fontSize: 14, fontWeight: 800, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text)' }}>
                  {prod.name}
                </h4>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '4px 0' }}>
                  <span className="responsive-product-card-price" style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)' }}>
                    {getCurrencySymbol(store?.currency_code)}{formatVal(prod.price)}
                  </span>
                  {prod.compare_at_price && (
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                      {getCurrencySymbol(store?.currency_code)}{formatVal(prod.compare_at_price)}
                    </span>
                  )}
                </div>

                <p className="responsive-product-card-desc" style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>
                  {prod.description || 'No description added.'}
                </p>

                {/* Action Tools */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <button
                    onClick={() => onEditProduct(prod)}
                    className="btn btn-outline clickable"
                    style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => onDeleteProduct(prod.id)}
                    className="btn btn-ghost clickable"
                    style={{ padding: '6px 8px', borderRadius: 'var(--r-sm)', color: 'var(--danger)' }}
                    title="Delete Product"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No products added to catalog. Add some items to showcase your storefront!
          </div>
        )}
      </div>
    </div>
  );
}
