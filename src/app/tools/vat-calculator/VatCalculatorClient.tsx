'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, Copy, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const VAT_RATE = 0.075;

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

type Mode = 'add' | 'remove';

export default function VatCalculatorClient() {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<Mode>('add');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const amountNum = parseFloat(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) return null;

    if (mode === 'add') {
      const vat = amountNum * VAT_RATE;
      const gross = amountNum + vat;
      const netPercent = (amountNum / gross) * 100;
      const vatPercent = (vat / gross) * 100;
      return { net: amountNum, vat, gross, netPercent, vatPercent, mode };
    }

    const net = amountNum / (1 + VAT_RATE);
    const vat = amountNum - net;
    const netPercent = (net / amountNum) * 100;
    const vatPercent = (vat / amountNum) * 100;
    return { net, vat, gross: amountNum, netPercent, vatPercent, mode };
  }, [amount, mode]);

  const handleCopy = () => {
    if (!result) return;
    const text = `Nigeria VAT (7.5%) Calculation (${result.mode === 'add' ? 'Add VAT' : 'Extract VAT'}):\nNet (Ex-VAT): ₦${result.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}\nVAT (7.5%): ₦${result.vat.toLocaleString(undefined, { maximumFractionDigits: 2 })}\nGross Total: ₦${result.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('VAT calculation copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => setMode('add')}
          className="clickable"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
            fontWeight: 800,
            border: mode === 'add' ? '2px solid var(--primary)' : '1.5px solid var(--border)',
            background: mode === 'add' ? 'var(--primary-light)' : 'var(--surface-2)',
            color: mode === 'add' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Add 7.5% VAT
        </button>
        <button
          type="button"
          onClick={() => setMode('remove')}
          className="clickable"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
            fontWeight: 800,
            border: mode === 'remove' ? '2px solid var(--primary)' : '1.5px solid var(--border)',
            background: mode === 'remove' ? 'var(--primary-light)' : 'var(--surface-2)',
            color: mode === 'remove' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Extract / Remove VAT
        </button>
      </div>

      <div>
        <label style={labelStyle}>
          {mode === 'add' ? 'Amount before VAT (Net Price ₦)' : 'Amount including VAT (Gross Price ₦)'}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10000"
          style={inputStyle}
        />
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Net Price (Ex-VAT)</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                ₦{result.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>VAT Amount (7.5%)</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                ₦{result.vat.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="card" style={{ padding: 18, background: 'var(--bg-2)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Gross Price (Inc-VAT)</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                ₦{result.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Visual Bar */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-2)' }}>
              <span>Net Share: {result.netPercent.toFixed(1)}%</span>
              <span style={{ color: 'var(--primary)' }}>VAT Share: {result.vatPercent.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'var(--border)', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${result.netPercent}%`, background: 'var(--text-faint)', transition: 'width 0.3s ease' }} />
              <div style={{ width: `${result.vatPercent}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
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
              <span>{copied ? 'Copied' : 'Copy VAT Result'}</span>
            </button>
          </div>
        </div>
      )}

      {!result && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calculator size={16} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Enter an amount above to instantly add or extract Nigeria's standard 7.5% Value Added Tax (VAT).
          </span>
        </div>
      )}
    </div>
  );
}
