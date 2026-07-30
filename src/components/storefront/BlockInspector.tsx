'use client';

import React from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import SearchableSelect, { SelectOption } from '../SearchableSelect';
import { SiteBlock } from './blockTypes';

interface InspectorCtx {
  products: any[];
  categories: any[];
  onUploadImage: (file: File) => Promise<string | null>;
}

const darkFieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid #1E3350',
  background: '#112640',
  color: '#EAF1F8',
  fontSize: 13,
  fontFamily: 'inherit',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#7E93AE' }}>{label}</label>
      {children}
    </div>
  );
}

function selectStyle(): React.CSSProperties {
  return { '--surface': '#112640', '--border': '#1E3350', '--text': '#EAF1F8', '--text-muted': '#7E93AE', '--text-faint': '#5A6E86', '--bg-2': '#0D2036', '--primary': '#25D366', '--primary-glow': 'rgba(37,211,102,0.18)', '--primary-light': 'rgba(37,211,102,0.18)', '--r-md': '8px', '--r-lg': '10px', '--shadow-lg': '0 20px 40px -12px rgba(0,0,0,0.6)' } as React.CSSProperties;
}

export default function BlockInspector({ block, onChange, ctx }: { block: SiteBlock; onChange: (data: Record<string, any>) => void; ctx: InspectorCtx }) {
  const set = (patch: Record<string, any>) => onChange({ ...block.data, ...patch });
  const d = block.data;

  const productOptions = (filter?: (p: any) => boolean): SelectOption[] =>
    ctx.products.filter((p) => (filter ? filter(p) : true)).map((p) => ({ value: p.id, label: p.name, sublabel: `₦${Number(p.price).toLocaleString()}` }));

  const categoryOptions: SelectOption[] = ctx.categories.map((c) => ({ value: c.id, label: c.name }));

  const upload = async (onUrl: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await ctx.onUploadImage(file);
      if (url) onUrl(url);
    };
    input.click();
  };

  switch (block.type) {
    case 'section':
      return (
        <>
          <Field label="Background">
            <div style={selectStyle()}>
              <SearchableSelect
                value={d.background || 'tint'}
                onChange={(v) => set({ background: v })}
                options={[{ value: 'tint', label: 'Tint' }, { value: 'brand', label: 'Brand color' }, { value: 'navy', label: 'Navy' }, { value: 'white', label: 'White' }]}
              />
            </div>
          </Field>
          <Field label="Height">
            <div style={selectStyle()}>
              <SearchableSelect
                value={d.height || 'md'}
                onChange={(v) => set({ height: v })}
                options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]}
              />
            </div>
          </Field>
        </>
      );

    case 'columns':
      return (
        <>
          <Field label="Heading">
            <input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Columns (2–4)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.items || []).map((item: any, i: number) => (
                <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Title" value={item.title} onChange={(e) => {
                      const items = [...d.items]; items[i] = { ...items[i], title: e.target.value }; set({ items });
                    }} />
                    <button onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <textarea style={{ ...darkFieldStyle, minHeight: 44, resize: 'vertical' }} placeholder="Text" value={item.text} onChange={(e) => {
                    const items = [...d.items]; items[i] = { ...items[i], text: e.target.value }; set({ items });
                  }} />
                </div>
              ))}
              {(d.items || []).length < 4 && (
                <button onClick={() => set({ items: [...(d.items || []), { title: 'New column', text: '' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                  <Plus size={13} /> Add column
                </button>
              )}
            </div>
          </Field>
        </>
      );

    case 'spacer':
      return (
        <Field label="Size">
          <div style={selectStyle()}>
            <SearchableSelect value={d.size || 'md'} onChange={(v) => set({ size: v })} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
          </div>
        </Field>
      );

    case 'divider':
      return <p style={{ fontSize: 12, color: '#7E93AE' }}>A plain horizontal rule — nothing to configure.</p>;

    case 'hero':
      return (
        <>
          <Field label="Eyebrow"><input style={darkFieldStyle} value={d.eyebrow || ''} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <Field label="Headline"><textarea style={{ ...darkFieldStyle, minHeight: 50 }} value={d.headline || ''} onChange={(e) => set({ headline: e.target.value })} /></Field>
          <Field label="Subheadline"><textarea style={{ ...darkFieldStyle, minHeight: 50 }} value={d.subheadline || ''} onChange={(e) => set({ subheadline: e.target.value })} /></Field>
          <Field label="Button text"><input style={darkFieldStyle} value={d.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
          <Field label="Background">
            <div style={selectStyle()}>
              <SearchableSelect value={d.background || 'brand'} onChange={(v) => set({ background: v })} options={[{ value: 'brand', label: 'Brand gradient' }, { value: 'navy', label: 'Navy' }, { value: 'white', label: 'White' }]} />
            </div>
          </Field>
          <Field label="Alignment">
            <div style={selectStyle()}>
              <SearchableSelect value={d.align || 'center'} onChange={(v) => set({ align: v })} options={[{ value: 'center', label: 'Centered' }, { value: 'left', label: 'Left aligned' }]} />
            </div>
          </Field>
        </>
      );

    case 'product_grid':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Show">
            <div style={selectStyle()}>
              <SearchableSelect value={d.mode || 'all'} onChange={(v) => set({ mode: v })} options={[{ value: 'all', label: 'All products' }, { value: 'category', label: 'One category' }]} />
            </div>
          </Field>
          {d.mode === 'category' && (
            <Field label="Category">
              <div style={selectStyle()}>
                <SearchableSelect value={d.categoryId || ''} onChange={(v) => set({ categoryId: v })} options={categoryOptions} placeholder="Choose a category…" />
              </div>
            </Field>
          )}
          <Field label="Max products to show">
            <input type="number" min={1} max={24} style={darkFieldStyle} value={d.limit || 6} onChange={(e) => set({ limit: Number(e.target.value) })} />
          </Field>
        </>
      );

    case 'featured_product':
      return (
        <Field label="Product">
          <div style={selectStyle()}>
            <SearchableSelect value={d.productId || ''} onChange={(v) => set({ productId: v })} options={productOptions()} placeholder="Choose a product…" />
          </div>
        </Field>
      );

    case 'categories':
      return <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>;

    case 'digital_spotlight':
      return (
        <>
          <Field label="Digital product">
            <div style={selectStyle()}>
              <SearchableSelect value={d.productId || ''} onChange={(v) => set({ productId: v })} options={productOptions((p) => p.is_digital)} placeholder="Choose a digital product…" />
            </div>
          </Field>
          <Field label="Curriculum label"><input style={darkFieldStyle} value={d.curriculumLabel || ''} onChange={(e) => set({ curriculumLabel: e.target.value })} /></Field>
        </>
      );

    case 'pricing_table':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Tiers">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.tiers || []).map((tier: any, i: number) => (
                <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Name" value={tier.name} onChange={(e) => { const tiers = [...d.tiers]; tiers[i] = { ...tiers[i], name: e.target.value }; set({ tiers }); }} />
                    <button onClick={() => set({ tiers: d.tiers.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Price (e.g. ₦15,000)" value={tier.price} onChange={(e) => { const tiers = [...d.tiers]; tiers[i] = { ...tiers[i], price: e.target.value }; set({ tiers }); }} />
                    <input style={{ ...darkFieldStyle, width: 90 }} placeholder="/period" value={tier.period || ''} onChange={(e) => { const tiers = [...d.tiers]; tiers[i] = { ...tiers[i], period: e.target.value }; set({ tiers }); }} />
                  </div>
                  <input style={darkFieldStyle} placeholder="Features, comma separated" value={(tier.features || []).join(', ')} onChange={(e) => { const tiers = [...d.tiers]; tiers[i] = { ...tiers[i], features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }; set({ tiers }); }} />
                  <input style={darkFieldStyle} placeholder="Button text" value={tier.ctaLabel || ''} onChange={(e) => { const tiers = [...d.tiers]; tiers[i] = { ...tiers[i], ctaLabel: e.target.value }; set({ tiers }); }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#7E93AE' }}>
                    <input type="checkbox" checked={!!tier.highlighted} onChange={(e) => { const tiers = [...d.tiers]; tiers[i] = { ...tiers[i], highlighted: e.target.checked }; set({ tiers }); }} />
                    Highlight this tier
                  </label>
                </div>
              ))}
              {(d.tiers || []).length < 3 && (
                <button onClick={() => set({ tiers: [...(d.tiers || []), { name: 'New tier', price: '₦0', period: '', features: [], ctaLabel: 'Choose plan' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                  <Plus size={13} /> Add tier
                </button>
              )}
            </div>
          </Field>
        </>
      );

    case 'booking':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Service">
            <div style={selectStyle()}>
              <SearchableSelect value={d.productId || ''} onChange={(v) => set({ productId: v })} options={productOptions((p) => p.type === 'service')} placeholder="Choose a service…" />
            </div>
          </Field>
        </>
      );

    case 'whatsapp_cta':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Subtext"><input style={darkFieldStyle} value={d.subtext || ''} onChange={(e) => set({ subtext: e.target.value })} /></Field>
          <Field label="Button text"><input style={darkFieldStyle} value={d.buttonLabel || ''} onChange={(e) => set({ buttonLabel: e.target.value })} /></Field>
        </>
      );

    case 'testimonials':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Source">
            <div style={selectStyle()}>
              <SearchableSelect value={d.mode || 'real'} onChange={(v) => set({ mode: v })} options={[{ value: 'real', label: 'Real reviews' }, { value: 'manual', label: 'Written manually' }]} />
            </div>
          </Field>
          {d.mode === 'manual' && (
            <Field label="Entries">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(d.manualItems || []).map((item: any, i: number) => (
                  <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Name" value={item.name} onChange={(e) => { const items = [...d.manualItems]; items[i] = { ...items[i], name: e.target.value }; set({ manualItems: items }); }} />
                      <button onClick={() => set({ manualItems: d.manualItems.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                    <textarea style={{ ...darkFieldStyle, minHeight: 44 }} placeholder="Review text" value={item.text} onChange={(e) => { const items = [...d.manualItems]; items[i] = { ...items[i], text: e.target.value }; set({ manualItems: items }); }} />
                  </div>
                ))}
                <button onClick={() => set({ manualItems: [...(d.manualItems || []), { name: '', text: '', rating: 5 }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                  <Plus size={13} /> Add testimonial
                </button>
              </div>
            </Field>
          )}
        </>
      );

    case 'faq':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Source">
            <div style={selectStyle()}>
              <SearchableSelect value={d.mode || 'real'} onChange={(v) => set({ mode: v })} options={[{ value: 'real', label: 'Real store FAQs' }, { value: 'manual', label: 'Written manually' }]} />
            </div>
          </Field>
          {d.mode === 'manual' && (
            <Field label="Entries">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(d.manualItems || []).map((item: any, i: number) => (
                  <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Question" value={item.question} onChange={(e) => { const items = [...d.manualItems]; items[i] = { ...items[i], question: e.target.value }; set({ manualItems: items }); }} />
                      <button onClick={() => set({ manualItems: d.manualItems.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                    <textarea style={{ ...darkFieldStyle, minHeight: 44 }} placeholder="Answer" value={item.answer} onChange={(e) => { const items = [...d.manualItems]; items[i] = { ...items[i], answer: e.target.value }; set({ manualItems: items }); }} />
                  </div>
                ))}
                <button onClick={() => set({ manualItems: [...(d.manualItems || []), { question: '', answer: '' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                  <Plus size={13} /> Add FAQ
                </button>
              </div>
            </Field>
          )}
        </>
      );

    case 'countdown':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Ends at">
            <input type="datetime-local" style={darkFieldStyle} value={d.endsAt ? new Date(d.endsAt).toISOString().slice(0, 16) : ''} onChange={(e) => set({ endsAt: new Date(e.target.value).toISOString() })} />
          </Field>
          <Field label="Expired message"><input style={darkFieldStyle} value={d.expiredText || ''} onChange={(e) => set({ expiredText: e.target.value })} /></Field>
        </>
      );

    case 'image':
      return (
        <>
          <Field label="Image URL">
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{ ...darkFieldStyle, flex: 1 }} value={d.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://…" />
              <button onClick={() => upload((url) => set({ url }))} style={{ background: '#112640', border: '1px solid #1E3350', color: '#EAF1F8', borderRadius: 8, padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Upload size={14} /></button>
            </div>
          </Field>
          <Field label="Caption"><input style={darkFieldStyle} value={d.caption || ''} onChange={(e) => set({ caption: e.target.value })} /></Field>
        </>
      );

    case 'gallery':
      return (
        <Field label="Images">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(d.images || []).map((url: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...darkFieldStyle, flex: 1 }} value={url} onChange={(e) => { const images = [...d.images]; images[i] = e.target.value; set({ images }); }} />
                <button onClick={() => set({ images: d.images.filter((_: string, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => upload((url) => set({ images: [...(d.images || []), url] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
              <Upload size={13} /> Upload image
            </button>
          </div>
        </Field>
      );

    case 'video':
      return <Field label="Embed URL"><input style={darkFieldStyle} placeholder="https://www.youtube.com/embed/…" value={d.url || ''} onChange={(e) => set({ url: e.target.value })} /></Field>;

    default:
      return null;
  }
}
