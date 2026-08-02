'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const darkFieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid #1E3350',
  background: '#112640',
  color: '#EAF1F8',
  fontSize: 13,
  fontFamily: 'inherit',
};

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#7E93AE' }}>{label}</label>
      {children}
    </div>
  );
}

export function selectStyle(): React.CSSProperties {
  return {
    '--surface': '#112640', '--border': '#1E3350', '--text': '#EAF1F8', '--text-muted': '#7E93AE',
    '--text-faint': '#5A6E86', '--bg-2': '#0D2036', '--primary': '#25D366', '--primary-glow': 'rgba(37,211,102,0.18)',
    '--primary-light': 'rgba(37,211,102,0.18)', '--r-md': '8px', '--r-lg': '10px', '--shadow-lg': '0 20px 40px -12px rgba(0,0,0,0.6)',
  } as React.CSSProperties;
}

export function CollapsibleGroup({ label, defaultOpen = true, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #1E3350', paddingBottom: 14 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 10px', color: '#EAF1F8',
          fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}
      >
        {label}
        <ChevronDown size={14} style={{ color: '#7E93AE', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>}
    </div>
  );
}

export function NumberStepper({ value, onChange, min = 0, max = 200, step = 1, suffix = 'px' }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#25D366' }}
      />
      <span style={{ fontSize: 11.5, color: '#7E93AE', width: 42, textAlign: 'right', flexShrink: 0 }}>{value}{suffix}</span>
    </div>
  );
}

export function ColorField({ value, onChange, allowEmpty = true }: { value?: string; onChange: (v: string | undefined) => void; allowEmpty?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        type="color"
        value={value && value.startsWith('#') ? value : '#128C7E'}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #1E3350', background: '#112640', padding: 2, cursor: 'pointer', flexShrink: 0 }}
      />
      <input
        style={{ ...darkFieldStyle, flex: 1 }}
        placeholder="Inherit from theme"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
      {allowEmpty && value && (
        <button
          onClick={() => onChange(undefined)}
          style={{ fontSize: 11, color: '#7E93AE', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

export function SegmentedControl<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div style={{ display: 'flex', background: '#112640', border: '1px solid #1E3350', borderRadius: 8, padding: 3, gap: 2 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '6px 4px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600,
            background: value === opt.value ? '#0D2036' : 'transparent',
            color: value === opt.value ? '#EAF1F8' : '#7E93AE',
            boxShadow: value === opt.value ? '0 0 0 1px #25D366' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
