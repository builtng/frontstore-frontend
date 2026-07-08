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

export default function BreakEvenCalculatorClient() {
  const [fixedCosts, setFixedCosts] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('');

  const result = useMemo(() => {
    const fixed = parseFloat(fixedCosts);
    const price = parseFloat(pricePerUnit);
    const variableCost = parseFloat(variableCostPerUnit);
    if (!Number.isFinite(fixed) || !Number.isFinite(price) || !Number.isFinite(variableCost)) return null;

    const contributionMargin = price - variableCost;
    if (contributionMargin <= 0) return null;

    const units = fixed / contributionMargin;
    const revenue = units * price;

    return { units, revenue, contributionMargin };
  }, [fixedCosts, pricePerUnit, variableCostPerUnit]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Total fixed costs (₦/month)</label>
        <input
          type="number"
          inputMode="decimal"
          value={fixedCosts}
          onChange={(e) => setFixedCosts(e.target.value)}
          placeholder="e.g. 150000"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Selling price per unit (₦)</label>
        <input
          type="number"
          inputMode="decimal"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(e.target.value)}
          placeholder="e.g. 3000"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Variable cost per unit (₦)</label>
        <input
          type="number"
          inputMode="decimal"
          value={variableCostPerUnit}
          onChange={(e) => setVariableCostPerUnit(e.target.value)}
          placeholder="e.g. 1800"
          style={inputStyle}
        />
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 4 }}>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Break-Even Units</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
              {Math.ceil(result.units).toLocaleString()}
            </p>
          </div>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Break-Even Revenue</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
              ₦{result.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {!result && (
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calculator size={13} /> Selling price must be higher than variable cost per unit to break even.
        </p>
      )}
    </div>
  );
}
