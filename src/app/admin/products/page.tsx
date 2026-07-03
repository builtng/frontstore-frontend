'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, ProductInfo } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Search,
  TrendingUp,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AdminProductsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productsCurrentPage, setProductsCurrentPage] = useState(1);
  const [productsLastPage, setProductsLastPage] = useState(1);
  const [sponsoredOnly, setSponsoredOnly] = useState(false);

  const loadProducts = async (page = 1, search = '', sponsoredFilter = sponsoredOnly) => {
    if (!token) return;
    try {
      setProductsLoading(true);
      const url = `${apiUrl}/v1/admin/products?page=${page}&search=${encodeURIComponent(search)}${sponsoredFilter ? '&sponsored=1' : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch products directory.');
      setProducts(json.data?.data || []);
      setProductsCurrentPage(json.data?.current_page || 1);
      setProductsLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleToggleProductSponsor = async (product: ProductInfo) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/products/${product.id}/toggle-sponsor`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to update sponsored placement.');
      toast.success(json.message);
      setProducts((items) =>
        items.map((p) =>
          p.id === product.id
            ? { ...p, is_sponsored: json.data?.is_sponsored, sponsored_until: json.data?.sponsored_until }
            : p
        )
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadProducts(1, productSearchQuery, sponsoredOnly);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Product directory</h2>
          <p>Promote a product to "Featured today" / "Sponsored" placement once a merchant has paid for sponsored space.</p>
        </div>
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            loadProducts(1, productSearchQuery, sponsoredOnly);
          }}
        >
          <Search size={16} />
          <input
            value={productSearchQuery}
            onChange={(event) => setProductSearchQuery(event.target.value)}
            placeholder="Search products or stores"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <label className="admin-switch" style={{ margin: '14px 0 8px' }}>
        <input
          type="checkbox"
          checked={sponsoredOnly}
          onChange={(event) => {
            const checked = event.target.checked;
            setSponsoredOnly(checked);
            loadProducts(1, productSearchQuery, checked);
          }}
        />
        <span className="admin-switch__slider" />
        <span>Show sponsored products only</span>
      </label>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Category</th>
              <th>Price</th>
              <th>Placement</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {productsLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : products.length ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    {product.store?.username && (
                      <a
                        href={`${window.location.origin}/${product.store.username}/products/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View product <ExternalLink size={12} />
                      </a>
                    )}
                  </td>
                  <td>
                    <strong>{product.store?.store_name || 'Unknown store'}</strong>
                    <span>@{product.store?.username || '—'}</span>
                  </td>
                  <td>{product.category?.name || '—'}</td>
                  <td>{formatMoney(Number(product.price))}</td>
                  <td>
                    {product.is_sponsored ? (
                      <StatusChip
                        tone="green"
                        label={
                          product.sponsored_until
                            ? `Sponsored until ${new Date(product.sponsored_until).toLocaleDateString()}`
                            : 'Sponsored'
                        }
                      />
                    ) : (
                      <StatusChip tone="gray" label="Editors' picks" />
                    )}
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className={product.is_sponsored ? 'admin-action danger' : 'admin-action'}
                      onClick={() => handleToggleProductSponsor(product)}
                    >
                      <TrendingUp size={15} />
                      {product.is_sponsored ? 'Remove from featured' : 'Promote to featured'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState label="No products match this search." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {productsLastPage > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            onClick={() => loadProducts(productsCurrentPage - 1, productSearchQuery, sponsoredOnly)}
            disabled={productsCurrentPage === 1}
          >
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {productsCurrentPage} of {productsLastPage}
          </span>
          <button
            type="button"
            onClick={() => loadProducts(productsCurrentPage + 1, productSearchQuery, sponsoredOnly)}
            disabled={productsCurrentPage === productsLastPage}
          >
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
