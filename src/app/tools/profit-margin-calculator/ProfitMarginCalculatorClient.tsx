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

export default function ProfitMarginCalculatorClient() {
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const costNum = parseFloat(cost);
    const priceNum = parseFloat(price);
    if (!Number.isFinite(costNum) || !Number.isFinite(priceNum) || priceNum <= 0) return null;

    const profit = priceNum - costNum;
    const margin = (profit / priceNum) * 100;
    const markup = costNum > 0 ? (profit / costNum) * 100 : null;

    const costPercent = Math.max(0, Math.min(100, (costNum / priceNum) * 100));
    const profitPercent = Math.max(0, Math.min(100, 100 - costPercent));

    return { profit, margin, markup, costPercent, profitPercent, costNum, priceNum };
  }, [cost, price]);

  const applyPresetMargin = (targetMarginPercent: number) => {
    const costNum = parseFloat(cost);
    if (!Number.isFinite(costNum) || costNum <= 0) {
      toast.error('Please enter a valid cost price first.');
      return;
    }
    const calculatedPrice = costNum / (1 - targetMarginPercent / 100);
    setPrice(Math.round(calculatedPrice).toString());
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Profit Margin Breakdown:\nCost Price: ₦${result.costNum.toLocaleString()}\nSelling Price: ₦${result.priceNum.toLocaleString()}\nProfit: ₦${result.profit.toLocaleString()}\nProfit Margin: ${result.margin.toFixed(1)}%\nMarkup: ${result.markup ? result.markup.toFixed(1) + '%' : 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Calculation results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCost('');
    setPrice('');
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
      </div>

      {/* Preset Target Margin Quick Chips */}
      <div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
          Quick Target Margin Presets:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[20, 30, 40, 50].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => applyPresetMargin(m)}
              className="clickable"
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              Set {m}% Margin
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
          {/* Results Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Net Profit</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: result.profit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                ₦{result.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profit Margin</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                {result.margin.toFixed(1)}%
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Markup</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                {result.markup === null ? '—' : `${result.markup.toFixed(1)}%`}
              </p>
            </div>
          </div>

          {/* Visual Ratio Gauge Bar */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-2)' }}>
              <span>Cost Share: {result.costPercent.toFixed(0)}%</span>
              <span style={{ color: result.profit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>Profit Share: {result.profitPercent.toFixed(0)}%</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'var(--border)', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${result.costPercent}%`, background: 'var(--text-faint)', transition: 'width 0.3s ease' }} />
              <div style={{ width: `${result.profitPercent}%`, background: result.profit >= 0 ? 'var(--primary)' : 'var(--danger)', transition: 'width 0.3s ease' }} />
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
            Enter a cost price and selling price above to see live profit, margin %, and markup ratio.
          </span>
        </div>
      )}
    </div>
  );
}
