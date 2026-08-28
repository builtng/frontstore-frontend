'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, Copy, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 'var(--r-md)',
  border: '1.5px solid var(--border)',
  fontSize: 15,
  background: 'var(--surface)',
  color: 'var(--text)',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: 'var(--text-2)',
  marginBottom: 6,
  display: 'block',
};

export default function BreakEvenCalculatorClient() {
  const [fixedCosts, setFixedCosts] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const fixed = parseFloat(fixedCosts);
    const price = parseFloat(pricePerUnit);
    const variableCost = parseFloat(variableCostPerUnit);
    if (!Number.isFinite(fixed) || !Number.isFinite(price) || !Number.isFinite(variableCost)) return null;

    const contributionMargin = price - variableCost;
    if (contributionMargin <= 0) return null;

    const units = fixed / contributionMargin;
    const revenue = units * price;
    const marginRatio = (contributionMargin / price) * 100;

    return { units, revenue, contributionMargin, marginRatio, fixed, price, variableCost };
  }, [fixedCosts, pricePerUnit, variableCostPerUnit]);

  const handleCopy = () => {
    if (!result) return;
    const text = `Break-Even Analysis:\nMonthly Fixed Costs: ₦${result.fixed.toLocaleString()}\nUnit Price: ₦${result.price.toLocaleString()}\nUnit Variable Cost: ₦${result.variableCost.toLocaleString()}\nBreak-Even Sales Target: ${Math.ceil(result.units).toLocaleString()} units (₦${Math.round(result.revenue).toLocaleString()} revenue)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Calculation results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFixedCosts('');
    setPricePerUnit('');
    setVariableCostPerUnit('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div>
          <label style={labelStyle}>Total fixed costs (₦/month)</label>
          <input
            type="number"
            inputMode="decimal"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            placeholder="e.g. 150000 (rent, wifi, staff)"
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
            placeholder="e.g. 8000"
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
            placeholder="e.g. 4500 (buy cost + packaging)"
            style={inputStyle}
          />
        </div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Break-Even Target</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                {Math.ceil(result.units).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600 }}>units</span>
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Required Revenue</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                ₦{result.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Unit Profit Contribution</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                ₦{result.contributionMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              <RotateCcw size={14} /> Clear
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-outline"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Analysis'}</span>
            </button>
          </div>
        </div>
      )}

      {!result && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calculator size={16} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Enter your monthly fixed costs, selling price, and unit variable cost to calculate your break-even point.
          </span>
        </div>
      )}
    </div>
  );
}
