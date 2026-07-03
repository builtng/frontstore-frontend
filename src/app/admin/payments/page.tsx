'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, PaymentProviderCountry } from '../AdminContext';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { SkeletonGrid, EmptyState } from '../components';

export default function AdminPaymentsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [paymentProviderSettings, setPaymentProviderSettings] = useState<PaymentProviderCountry[]>([]);
  const [paymentProviderSettingsLoading, setPaymentProviderSettingsLoading] = useState(false);
  const [paymentProviderSearch, setPaymentProviderSearch] = useState('');

  const loadPaymentProviderSettings = async () => {
    if (!token) return;
    try {
      setPaymentProviderSettingsLoading(true);
      const res = await fetch(`${apiUrl}/v1/admin/payment-providers`, { headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch payment provider settings.');
      setPaymentProviderSettings(json.data || []);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setPaymentProviderSettingsLoading(false);
    }
  };

  const handleTogglePaymentProvider = async (
    countryCode: string,
    provider: 'paystack' | 'flutterwave' | 'stripe',
    nextValue: boolean
  ) => {
    // Optimistic update
    setPaymentProviderSettings((prev) =>
      prev.map((c) => (c.code === countryCode ? { ...c, providers: { ...c.providers, [provider]: nextValue } } : c))
    );

    try {
      const res = await fetch(`${apiUrl}/v1/admin/payment-providers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ settings: [{ country_code: countryCode, provider, is_enabled: nextValue }] }),
      });
      await handleFetchResponse(res, 'Could not update payment provider setting.');
      toast.success('Payment provider settings updated.');
    } catch (error: any) {
      // Roll back on failure
      setPaymentProviderSettings((prev) =>
        prev.map((c) => (c.code === countryCode ? { ...c, providers: { ...c.providers, [provider]: !nextValue } } : c))
      );
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadPaymentProviderSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredCountries = paymentProviderSettings.filter((c) => {
    const q = paymentProviderSearch.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Payment Providers</h2>
          <p>Choose which payment providers merchants can accept, per country. Merchants may only select a provider you've enabled for their country.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="admin-search" style={{ margin: 0 }}>
            <Search size={16} />
            <input
              value={paymentProviderSearch}
              onChange={(e) => setPaymentProviderSearch(e.target.value)}
              placeholder="Search by country or code..."
              style={{ height: 38 }}
            />
          </div>
        </div>
      </div>

      {paymentProviderSettingsLoading && paymentProviderSettings.length === 0 ? (
        <SkeletonGrid />
      ) : filteredCountries.length === 0 ? (
        <EmptyState label="No payment provider configuration countries matched." />
      ) : (
        <div className="admin-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>Country</th>
                  <th>Country Code</th>
                  <th>Paystack</th>
                  <th>Flutterwave</th>
                  <th>Stripe</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountries.map((country) => (
                  <tr key={country.code} className="admin-table-row-hoverable">
                    <td style={{ paddingLeft: 24 }}>
                      <strong style={{ fontSize: 14 }}>{country.name}</strong>
                    </td>
                    <td>
                      <span className="admin-chip admin-chip--gray" style={{ fontWeight: 700 }}>
                        {country.code.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <label className="admin-switch" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={country.providers.paystack}
                          onChange={(e) => handleTogglePaymentProvider(country.code, 'paystack', e.target.checked)}
                        />
                        <span className="admin-switch__slider" />
                        <span>Paystack</span>
                      </label>
                    </td>
                    <td>
                      <label className="admin-switch" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={country.providers.flutterwave}
                          onChange={(e) => handleTogglePaymentProvider(country.code, 'flutterwave', e.target.checked)}
                        />
                        <span className="admin-switch__slider" />
                        <span>Flutterwave</span>
                      </label>
                    </td>
                    <td>
                      <label className="admin-switch" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={country.providers.stripe}
                          onChange={(e) => handleTogglePaymentProvider(country.code, 'stripe', e.target.checked)}
                        />
                        <span className="admin-switch__slider" />
                        <span>Stripe</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
