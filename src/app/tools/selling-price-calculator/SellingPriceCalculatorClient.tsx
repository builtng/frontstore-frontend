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

export default function SellingPriceCalculatorClient() {
  const [cost, setCost] = useState('');
  const [margin, setMargin] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const costNum = parseFloat(cost);
    const marginNum = parseFloat(margin);
    if (!Number.isFinite(costNum) || !Number.isFinite(marginNum) || marginNum >= 100 || marginNum < 0) return null;

    const price = costNum / (1 - marginNum / 100);
    const profit = price - costNum;
    const costPercent = 100 - marginNum;
    const profitPercent = marginNum;

    return { price, profit, costPercent, profitPercent, costNum, marginNum };
  }, [cost, margin]);

  const handleCopy = () => {
    if (!result) return;
    const text = `Selling Price Breakdown:\nCost Price: ₦${result.costNum.toLocaleString()}\nTarget Margin: ${result.marginNum}%\nRecommended Selling Price: ₦${Math.round(result.price).toLocaleString()}\nNet Profit: ₦${Math.round(result.profit).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Calculation results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCost('');
    setMargin('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
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
      </div>

      {/* Preset Target Margin Quick Chips */}
      <div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
          Preset Target Margins:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[15, 25, 35, 50].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMargin(m.toString())}
              className="clickable"
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: margin === m.toString() ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: margin === m.toString() ? 'var(--primary-light)' : 'var(--surface-2)',
                color: margin === m.toString() ? 'var(--primary)' : 'var(--text)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {m}% Target Margin
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Recommended Selling Price</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                ₦{result.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profit Per Unit</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                ₦{result.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Visual Ratio Gauge Bar */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-2)' }}>
              <span>Cost Share: {result.costPercent.toFixed(0)}%</span>
              <span style={{ color: 'var(--primary)' }}>Profit Share: {result.profitPercent.toFixed(0)}%</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'var(--border)', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${result.costPercent}%`, background: 'var(--text-faint)', transition: 'width 0.3s ease' }} />
              <div style={{ width: `${result.profitPercent}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
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
              <span>{copied ? 'Copied' : 'Copy Breakdown'}</span>
            </button>
          </div>
        </div>
      )}

      {!result && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calculator size={16} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Enter a cost price and desired margin percentage (less than 100%) to calculate your selling price.
          </span>
        </div>
      )}
    </div>
  );
}
