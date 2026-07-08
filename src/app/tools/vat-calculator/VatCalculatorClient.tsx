'use client';

import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const VAT_RATE = 0.075;

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: 'var(--r-md)',
  border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface)', color: 'var(--text)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, display: 'block',
};

type Mode = 'add' | 'remove';

export default function VatCalculatorClient() {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<Mode>('add');

  const result = useMemo(() => {
    const amountNum = parseFloat(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) return null;

    if (mode === 'add') {
      const vat = amountNum * VAT_RATE;
      return { net: amountNum, vat, gross: amountNum + vat };
    }

    const net = amountNum / (1 + VAT_RATE);
    const vat = amountNum - net;
    return { net, vat, gross: amountNum };
  }, [amount, mode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setMode('add')}
          className="clickable"
          style={{
            flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700,
            border: mode === 'add' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: mode === 'add' ? 'var(--primary-light)' : 'var(--surface)',
            color: mode === 'add' ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          Add VAT
        </button>
        <button
          type="button"
          onClick={() => setMode('remove')}
          className="clickable"
          style={{
            flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700,
            border: mode === 'remove' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: mode === 'remove' ? 'var(--primary-light)' : 'var(--surface)',
            color: mode === 'remove' ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          Remove VAT
        </button>
      </div>

      <div>
        <label style={labelStyle}>
          {mode === 'add' ? 'Amount before VAT (₦)' : 'Amount including VAT (₦)'}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 4 }}>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Net (Ex-VAT)</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
              ₦{result.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>VAT (7.5%)</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
              ₦{result.vat.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card" style={{ padding: 16, background: 'var(--bg-2)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Gross (Inc. VAT)</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
              ₦{result.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {!result && (
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calculator size={13} /> Enter an amount to calculate VAT at Nigeria's standard 7.5% rate.
        </p>
      )}
    </div>
  );
}
