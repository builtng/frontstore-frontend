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

export default function SellingPriceCalculatorClient() {
  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('');

  const result = useMemo(() => {
    const costNum = parseFloat(cost);
    const marginNum = parseFloat(margin);
    if (!Number.isFinite(costNum) || !Number.isFinite(marginNum) || marginNum >= 100 || marginNum < 0) return null;

    const price = costNum / (1 - marginNum / 100);
    const profit = price - costNum;

    return { price, profit };
  }, [cost, margin]);

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
        <label style={labelStyle}>Desired profit margin (%)</label>
        <input
          type="number"
          inputMode="decimal"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          placeholder="e.g. 30"
          style={inputStyle}
        />
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 4 }}>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Selling Price</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
              ₦{result.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profit</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
              ₦{result.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {!result && (
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calculator size={13} /> Enter a cost price and a margin below 100% to see what to charge.
        </p>
      )}
    </div>
  );
}
