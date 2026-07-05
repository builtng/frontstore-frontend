'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { NIGERIAN_STATES, slugify } from '@/utils/nigerianStates';
import SearchableSelect from '@/components/SearchableSelect';

const POPULAR_SEARCHES = ['iPhone 15 Pro', 'Generator', 'Ankara fabric', 'Air fryer'];

export default function CompareSearchClient() {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [lga, setLga] = useState('');

  const stateOptions = NIGERIAN_STATES.map((s) => ({
    value: s.slug,
    label: s.name,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !state) return;

    const segments = [slugify(productName), state];
    if (city.trim()) segments.push(slugify(city));
    if (lga.trim()) segments.push(slugify(lga));

    router.push(`/compare/${segments.join('/')}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
          What are you shopping for?
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. iPhone 16 Pro"
            required
            style={{
              width: '100%', padding: '12px 12px 12px 36px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setProductName(term)}
              className="clickable"
              style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '5px 12px',
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
          State
        </label>
        <SearchableSelect
          options={stateOptions}
          value={state}
          onChange={setState}
          placeholder="Select a state"
          searchPlaceholder="Search states..."
          prefixIcon={<MapPin size={16} />}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
            City <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Ikeja"
            style={{
              width: '100%', padding: '12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
            LGA <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            placeholder="e.g. Ikeja"
            style={{
              width: '100%', padding: '12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)',
            }}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }}>
        <Search size={16} /> Compare Prices
      </button>
    </form>
  );
}
