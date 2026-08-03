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

export function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
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

export function VisualBoxModel({
  marginTop = 0, marginRight = 0, marginBottom = 0, marginLeft = 0,
  paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0,
  onChangeMargin, onChangePadding,
}: {
  marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number;
  onChangeMargin: (side: 'top' | 'right' | 'bottom' | 'left', val: number) => void;
  onChangePadding: (side: 'top' | 'right' | 'bottom' | 'left', val: number) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: 32, height: 20, background: '#0D2036', border: '1px solid #1E3350',
    borderRadius: 4, color: '#64FFDA', fontSize: 10, textAlign: 'center',
    fontWeight: 600, padding: 0, outline: 'none'
  };

  return (
    <div style={{ background: '#071626', borderRadius: 10, padding: 12, border: '1px solid #1E3350' }}>
      {/* Outer Margin Box */}
      <div style={{
        position: 'relative', border: '1px dashed #3B82F6', borderRadius: 8,
        background: 'rgba(59,130,246,0.04)', padding: '24px 30px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <span style={{ position: 'absolute', top: 3, left: 6, fontSize: 8.5, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margin</span>
        
        {/* Margin Top */}
        <input
          type="number" style={{ ...inputStyle, position: 'absolute', top: 4 }}
          value={marginTop} onChange={(e) => onChangeMargin('top', Number(e.target.value))}
        />
        {/* Margin Left */}
        <input
          type="number" style={{ ...inputStyle, position: 'absolute', left: 4, top: 'calc(50% - 10px)' }}
          value={marginLeft} onChange={(e) => onChangeMargin('left', Number(e.target.value))}
        />
        {/* Margin Right */}
        <input
          type="number" style={{ ...inputStyle, position: 'absolute', right: 4, top: 'calc(50% - 10px)' }}
          value={marginRight} onChange={(e) => onChangeMargin('right', Number(e.target.value))}
        />
        {/* Margin Bottom */}
        <input
          type="number" style={{ ...inputStyle, position: 'absolute', bottom: 4 }}
          value={marginBottom} onChange={(e) => onChangeMargin('bottom', Number(e.target.value))}
        />

        {/* Inner Padding Box */}
        <div style={{
          position: 'relative', width: '100%', border: '1px solid #25D366', borderRadius: 6,
          background: 'rgba(37,211,102,0.06)', padding: '22px 28px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <span style={{ position: 'absolute', top: 2, left: 6, fontSize: 8.5, fontWeight: 700, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Padding</span>
          
          {/* Padding Top */}
          <input
            type="number" style={{ ...inputStyle, position: 'absolute', top: 3 }}
            value={paddingTop} onChange={(e) => onChangePadding('top', Number(e.target.value))}
          />
          {/* Padding Left */}
          <input
            type="number" style={{ ...inputStyle, position: 'absolute', left: 3, top: 'calc(50% - 10px)' }}
            value={paddingLeft} onChange={(e) => onChangePadding('left', Number(e.target.value))}
          />
          {/* Padding Right */}
          <input
            type="number" style={{ ...inputStyle, position: 'absolute', right: 3, top: 'calc(50% - 10px)' }}
            value={paddingRight} onChange={(e) => onChangePadding('right', Number(e.target.value))}
          />
          {/* Padding Bottom */}
          <input
            type="number" style={{ ...inputStyle, position: 'absolute', bottom: 3 }}
            value={paddingBottom} onChange={(e) => onChangePadding('bottom', Number(e.target.value))}
          />

          {/* Core Content Box */}
          <div style={{
            background: '#112640', border: '1px solid #1E3350', borderRadius: 4,
            padding: '6px 12px', fontSize: 9.5, fontWeight: 700, color: '#EAF1F8', letterSpacing: '0.05em'
          }}>
            ELEMENT
          </div>
        </div>
      </div>
    </div>
  );
}
