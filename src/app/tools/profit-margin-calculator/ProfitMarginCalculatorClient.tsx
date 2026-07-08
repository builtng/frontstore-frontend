'use client';

import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: 'var(--r-md)',
  border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, display: 'block',
};

export default function ProfitMarginCalculatorClient() {
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');

  const result = useMemo(() => {
    const costNum = parseFloat(cost);
    const priceNum = parseFloat(price);
    if (!Number.isFinite(costNum) || !Number.isFinite(priceNum) || priceNum <= 0) return null;

    const profit = priceNum - costNum;
    const margin = (profit / priceNum) * 100;
    const markup = costNum > 0 ? (profit / costNum) * 100 : null;

    return { profit, margin, markup };
  }, [cost, price]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Cost price (₦)</label>
        <input
          type="number"
          inputMode="decimal"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="e.g. 4000"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Selling price (₦)</label>
        <input
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 6000"
          style={inputStyle}
        />
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 4 }}>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profit</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: result.profit >= 0 ? 'var(--primary)' : '#ef4444' }}>
              ₦{result.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Margin</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
              {result.margin.toFixed(1)}%
            </p>
          </div>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Markup</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
              {result.markup === null ? '—' : `${result.markup.toFixed(1)}%`}
            </p>
          </div>
        </div>
      )}

      {!result && (
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calculator size={13} /> Enter a cost price and selling price to see your profit and margin.
        </p>
      )}
    </div>
  );
}
