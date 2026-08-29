'use client';

import React from 'react';
import { ExternalLink, Check, Loader2 } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Sleek Green', value: '#0B5D39' },
  { name: 'Ruby', value: '#e11d48' },
  { name: 'Royal', value: '#4f46e5' },
  { name: 'Ocean', value: '#0284c7' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Graphite', value: '#27272a' },
  { name: 'Teal', value: '#128c7e' },
  { name: 'Violet', value: '#7c3aed' },
];

interface TemplatesTabProps {
  liveStoreUrl: string;
  personaPresetName: string | null;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  selectedTemplate: string;
  templateSaving: string | null;
  onSaveColor: () => void;
}

// State (primaryColor/selectedTemplate/templateSaving) and the save handler
// stay owned by dashboard/page.tsx — they're also read by the settings
// design sub-tab and product-fact suggestions elsewhere, not exclusive to
// this tab, so this component takes them as props rather than owning them.
export default function TemplatesTab({
  liveStoreUrl, personaPresetName, primaryColor, setPrimaryColor, selectedTemplate, templateSaving, onSaveColor,
}: TemplatesTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-fade-in">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Storefront design</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 950, margin: 0, letterSpacing: '-0.02em' }}>Store Color</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 640, marginTop: 8 }}>
              Customize your storefront brand color — it controls buttons, highlights, catalog accents, and customer-facing styling.
            </p>
          </div>
          <a
            href={liveStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline clickable"
            style={{ textDecoration: 'none', gap: 8, flexShrink: 0 }}
          >
            <ExternalLink size={16} /> View Store
          </a>
        </div>

        {/* Persona template lock notice */}
        {personaPresetName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary)',
            marginBottom: 18,
          }}>
            <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontWeight: 700 }}>
              Your storefront template is set to <strong>{personaPresetName}</strong> — perfectly matched to your store type. Only your brand color is customizable.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'stretch' }} className="responsive-settings-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 9 }}>Fast palettes</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setPrimaryColor(preset.value)}
                    title={preset.name}
                    aria-label={preset.name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: preset.value,
                      border: primaryColor === preset.value ? '3px solid var(--text)' : '1px solid var(--border)',
                      boxShadow: primaryColor === preset.value ? '0 0 0 3px var(--surface), var(--shadow-md)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: 56, height: 48, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                aria-label="Custom template color"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => {
                  const val = e.target.value;
                  if (val.startsWith('#') && val.length <= 7) setPrimaryColor(val);
                }}
                className="input-field"
                style={{ fontFamily: 'monospace', fontWeight: 800 }}
                placeholder="#0B5D39"
              />
            </div>

            <button
              type="button"
              onClick={onSaveColor}
              disabled={templateSaving === 'color'}
              className="btn btn-primary clickable"
              style={{ width: 'fit-content', borderRadius: 'var(--r-md)', fontWeight: 850 }}
            >
              {templateSaving === 'color' ? <><Loader2 size={16} className="spinner" /> Saving color...</> : 'Apply Color to Storefront'}
            </button>
          </div>

          <div style={{
            minHeight: 190,
            borderRadius: 'var(--r-xl)',
            padding: 18,
            background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 56%, #ffffff) 100%)`,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `0 18px 42px ${primaryColor}33`
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 42px)', opacity: 0.45 }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{selectedTemplate.replace(/-/g, ' ')}</span>
              <span style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(255,255,255,0.78)' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{ fontSize: 24, fontWeight: 950, margin: 0, fontFamily: 'var(--font-heading)' }}>Customer storefront preview</h4>
              <p style={{ fontSize: 13, marginTop: 6, opacity: 0.86 }}>Buttons, badges, highlights, and accents use this color.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <span style={{ padding: '8px 12px', borderRadius: 999, background: '#fff', color: primaryColor, fontSize: 12, fontWeight: 900 }}>Shop now</span>
                <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 900 }}>Featured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
