'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { BlockStyle, BlockVisibility, Device, SiteBlock } from './blockTypes';
import { CollapsibleGroup, ColorField, Field, NumberStepper, SegmentedControl, selectStyle } from './inspectorUi';
import SearchableSelect from '../SearchableSelect';

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Subtle' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Pronounced' },
];

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'No animation' },
  { value: 'fade-in', label: 'Fade in' },
  { value: 'fade-up', label: 'Fade up' },
  { value: 'zoom-in', label: 'Zoom in' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra bold' },
];

export default function StylePanel({ block, device, onChange, onVisibilityChange }: {
  block: SiteBlock;
  device: Device;
  onChange: (style: Partial<BlockStyle>) => void;
  onVisibilityChange: (visibility: BlockVisibility) => void;
}) {
  const base = block.style || {};
  const override = device === 'desktop' ? {} : (block.responsiveStyle?.[device] || {});
  const effective: BlockStyle = { ...base, ...override };
  const isOverrideMode = device !== 'desktop';

  const set = (patch: Partial<BlockStyle>) => onChange(patch);

  return (
    <>
      {isOverrideMode && (
        <div style={{
          fontSize: 11, color: '#7E93AE', background: 'rgba(100,255,218,0.06)',
          border: '1px solid rgba(100,255,218,0.25)', borderRadius: 8, padding: '8px 10px',
        }}>
          Editing {device} overrides. Values you don't set here fall back to the desktop style.
        </div>
      )}

      <CollapsibleGroup label="Typography">
        <Field label="Font size">
          <NumberStepper value={effective.fontSize ?? 16} min={10} max={72} onChange={(v) => set({ fontSize: v })} />
        </Field>
        <Field label="Font weight">
          <div style={selectStyle()}>
            <SearchableSelect
              value={String(effective.fontWeight ?? 400)}
              onChange={(v) => set({ fontWeight: Number(v) as BlockStyle['fontWeight'] })}
              options={FONT_WEIGHT_OPTIONS}
            />
          </div>
        </Field>
        <Field label="Alignment">
          <SegmentedControl
            value={effective.textAlign || 'left'}
            onChange={(v) => set({ textAlign: v })}
            options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
          />
        </Field>
        <Field label="Text color">
          <ColorField value={effective.textColor} onChange={(v) => set({ textColor: v })} />
        </Field>
      </CollapsibleGroup>

      <CollapsibleGroup label="Spacing">
        <Field label="Vertical padding">
          <NumberStepper value={effective.paddingY ?? 0} max={160} onChange={(v) => set({ paddingY: v })} />
        </Field>
        <Field label="Horizontal padding">
          <NumberStepper value={effective.paddingX ?? 0} max={120} onChange={(v) => set({ paddingX: v })} />
        </Field>
        {!isOverrideMode && (
          <>
            <Field label="Margin top">
              <NumberStepper value={effective.marginTop ?? 0} max={160} onChange={(v) => set({ marginTop: v })} />
            </Field>
            <Field label="Margin bottom">
              <NumberStepper value={effective.marginBottom ?? 0} max={160} onChange={(v) => set({ marginBottom: v })} />
            </Field>
          </>
        )}
      </CollapsibleGroup>

      <CollapsibleGroup label="Color" defaultOpen={false}>
        <Field label="Background">
          <ColorField value={effective.background} onChange={(v) => set({ background: v })} />
        </Field>
      </CollapsibleGroup>

      <CollapsibleGroup label="Border" defaultOpen={false}>
        <Field label="Corner radius">
          <NumberStepper value={effective.borderRadius ?? 0} max={48} onChange={(v) => set({ borderRadius: v })} />
        </Field>
        <Field label="Border width">
          <NumberStepper value={effective.borderWidth ?? 0} max={8} onChange={(v) => set({ borderWidth: v })} />
        </Field>
        {(effective.borderWidth ?? 0) > 0 && (
          <Field label="Border color">
            <ColorField value={effective.borderColor} onChange={(v) => set({ borderColor: v })} />
          </Field>
        )}
      </CollapsibleGroup>

      <CollapsibleGroup label="Shadow" defaultOpen={false}>
        <div style={selectStyle()}>
          <SearchableSelect value={effective.shadow || 'none'} onChange={(v) => set({ shadow: v as BlockStyle['shadow'] })} options={SHADOW_OPTIONS} />
        </div>
      </CollapsibleGroup>

      {!isOverrideMode && (
        <CollapsibleGroup label="Animation" defaultOpen={false}>
          <div style={selectStyle()}>
            <SearchableSelect value={effective.animation || 'none'} onChange={(v) => set({ animation: v as BlockStyle['animation'] })} options={ANIMATION_OPTIONS} />
          </div>
        </CollapsibleGroup>
      )}

      {!isOverrideMode && (
        <CollapsibleGroup label="Visibility" defaultOpen={false}>
          <p style={{ fontSize: 11.5, color: '#7E93AE', margin: 0 }}>Show or hide this block per device.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([key, Icon]) => {
              const visible = block.visibility?.[key] !== false;
              return (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#EAF1F8', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => onVisibilityChange({ ...block.visibility, [key]: e.target.checked })}
                  />
                  <Icon size={13} style={{ color: '#7E93AE' }} />
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                </label>
              );
            })}
          </div>
        </CollapsibleGroup>
      )}
    </>
  );
}
