'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Upload, Sparkles, Loader2 } from 'lucide-react';
import SearchableSelect, { SelectOption } from '../SearchableSelect';
import { SiteBlock } from './blockTypes';
import { darkFieldStyle, Field, selectStyle } from './inspectorUi';

interface InspectorCtx {
  products: any[];
  categories: any[];
  whatsappLines?: { id: string; label: string; department?: string | null }[];
  onUploadImage: (file: File) => Promise<string | null>;
  onGenerateCopy?: (kind: string, context: string) => Promise<string | null>;
}

/** Small "write this with AI" affordance next to a single field's label. */
function AiFieldButton({ kind, context, ctx, onResult }: {
  kind: string; context: string; ctx: InspectorCtx; onResult: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!ctx.onGenerateCopy) return null;

  const run = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const text = await ctx.onGenerateCopy!(kind, context);
      if (text) onResult(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      title="Write with AI"
      style={{ background: 'none', border: 'none', color: '#64FFDA', cursor: loading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}
    >
      {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
    </button>
  );
}

function FieldLabelWithAi({ label, aiKind, aiContext, ctx, onResult }: {
  label: string; aiKind: string; aiContext: string; ctx: InspectorCtx; onResult: (text: string) => void;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {label}
      <AiFieldButton kind={aiKind} context={aiContext} ctx={ctx} onResult={onResult} />
    </span>
  );
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
          <Field label="Layout">
            <div style={selectStyle()}>
              <SearchableSelect
                value={d.layout || 'centered'}
                onChange={(v) => set({ layout: v })}
                options={[{ value: 'centered', label: 'Centered' }, { value: 'split', label: 'Split with image' }, { value: 'minimal', label: 'Minimal' }]}
              />
            </div>
          </Field>
          {d.layout === 'split' && (
            <Field label="Image URL">
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...darkFieldStyle, flex: 1 }} value={d.imageUrl || ''} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" />
                <button onClick={() => upload((url) => set({ imageUrl: url }))} style={{ background: '#112640', border: '1px solid #1E3350', color: '#EAF1F8', borderRadius: 8, padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Upload size={14} /></button>
              </div>
            </Field>
          )}
          <Field label="Eyebrow"><input style={darkFieldStyle} value={d.eyebrow || ''} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <Field label={<FieldLabelWithAi label="Headline" aiKind="headline" aiContext="Hero banner headline for the homepage" ctx={ctx} onResult={(text) => set({ headline: text })} />}>
            <textarea style={{ ...darkFieldStyle, minHeight: 50 }} value={d.headline || ''} onChange={(e) => set({ headline: e.target.value })} />
          </Field>
          <Field label="Subheadline"><textarea style={{ ...darkFieldStyle, minHeight: 50 }} value={d.subheadline || ''} onChange={(e) => set({ subheadline: e.target.value })} /></Field>
          <Field label="Button text"><input style={darkFieldStyle} value={d.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
          {d.layout !== 'minimal' && (
            <Field label="Background">
              <div style={selectStyle()}>
                <SearchableSelect value={d.background || 'brand'} onChange={(v) => set({ background: v })} options={[{ value: 'brand', label: 'Brand gradient' }, { value: 'navy', label: 'Navy' }, { value: 'white', label: 'White' }]} />
              </div>
            </Field>
          )}
          {d.layout !== 'split' && (
            <Field label="Alignment">
              <div style={selectStyle()}>
                <SearchableSelect value={d.align || 'center'} onChange={(v) => set({ align: v })} options={[{ value: 'center', label: 'Centered' }, { value: 'left', label: 'Left aligned' }]} />
              </div>
            </Field>
          )}
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
          <Field label={<FieldLabelWithAi label="Heading" aiKind="headline" aiContext="Heading for a WhatsApp chat call-to-action section" ctx={ctx} onResult={(text) => set({ heading: text })} />}>
            <input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} />
          </Field>
          <Field label="Subtext"><input style={darkFieldStyle} value={d.subtext || ''} onChange={(e) => set({ subtext: e.target.value })} /></Field>
          <Field label="Button text"><input style={darkFieldStyle} value={d.buttonLabel || ''} onChange={(e) => set({ buttonLabel: e.target.value })} /></Field>
          {(ctx.whatsappLines || []).length > 0 && (
            <Field label="Routes to">
              <div style={selectStyle()}>
                <SearchableSelect
                  value={d.lineId || ''}
                  onChange={(v) => set({ lineId: v })}
                  options={[{ value: '', label: 'Main WhatsApp number' }, ...(ctx.whatsappLines || []).map((l) => ({ value: l.id, label: l.label, sublabel: l.department || undefined }))]}
                />
              </div>
            </Field>
          )}
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

    case 'trust_badges':
      return (
        <Field label="Badges">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(d.items || []).map((item: any, i: number) => (
              <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ ...selectStyle(), width: 120 }}>
                  <SearchableSelect
                    value={item.icon || 'shield'}
                    onChange={(v) => { const items = [...d.items]; items[i] = { ...items[i], icon: v }; set({ items }); }}
                    options={[{ value: 'shield', label: 'Shield' }, { value: 'truck', label: 'Truck' }, { value: 'badge', label: 'Badge' }]}
                  />
                </div>
                <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Label" value={item.label} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }} />
                <button onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => set({ items: [...(d.items || []), { label: 'New badge', icon: 'shield' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
              <Plus size={13} /> Add badge
            </button>
          </div>
        </Field>
      );

    case 'logos_strip':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Logos">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(d.logos || []).map((url: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <input style={{ ...darkFieldStyle, flex: 1 }} value={url} onChange={(e) => { const logos = [...d.logos]; logos[i] = e.target.value; set({ logos }); }} />
                  <button onClick={() => set({ logos: d.logos.filter((_: string, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => upload((url) => set({ logos: [...(d.logos || []), url] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                <Upload size={13} /> Upload logo
              </button>
            </div>
          </Field>
        </>
      );

    case 'stats_counters':
      return (
        <Field label="Stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(d.items || []).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...darkFieldStyle, width: 90 }} placeholder="500+" value={item.value} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], value: e.target.value }; set({ items }); }} />
                <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Label" value={item.label} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], label: e.target.value }; set({ items }); }} />
                <button onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => set({ items: [...(d.items || []), { value: '100+', label: 'New stat' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
              <Plus size={13} /> Add stat
            </button>
          </div>
        </Field>
      );

    case 'team':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Members">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.members || []).map((m: any, i: number) => (
                <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Name" value={m.name} onChange={(e) => { const members = [...d.members]; members[i] = { ...members[i], name: e.target.value }; set({ members }); }} />
                    <button onClick={() => set({ members: d.members.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <input style={darkFieldStyle} placeholder="Role" value={m.role} onChange={(e) => { const members = [...d.members]; members[i] = { ...members[i], role: e.target.value }; set({ members }); }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Photo URL" value={m.photoUrl || ''} onChange={(e) => { const members = [...d.members]; members[i] = { ...members[i], photoUrl: e.target.value }; set({ members }); }} />
                    <button onClick={() => upload((url) => { const members = [...d.members]; members[i] = { ...members[i], photoUrl: url }; set({ members }); })} style={{ background: '#112640', border: '1px solid #1E3350', color: '#EAF1F8', borderRadius: 8, padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Upload size={14} /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => set({ members: [...(d.members || []), { name: 'New member', role: 'Role', photoUrl: '' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                <Plus size={13} /> Add member
              </button>
            </div>
          </Field>
        </>
      );

    case 'about_story':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Story"><textarea style={{ ...darkFieldStyle, minHeight: 90 }} value={d.body || ''} onChange={(e) => set({ body: e.target.value })} /></Field>
          <Field label="Image URL">
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{ ...darkFieldStyle, flex: 1 }} value={d.imageUrl || ''} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" />
              <button onClick={() => upload((url) => set({ imageUrl: url }))} style={{ background: '#112640', border: '1px solid #1E3350', color: '#EAF1F8', borderRadius: 8, padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Upload size={14} /></button>
            </div>
          </Field>
          <Field label="Image position">
            <div style={selectStyle()}>
              <SearchableSelect value={d.imagePosition || 'right'} onChange={(v) => set({ imagePosition: v })} options={[{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }]} />
            </div>
          </Field>
        </>
      );

    case 'comparison_table':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Column names (2, comma separated)">
            <input style={darkFieldStyle} value={(d.columns || []).join(', ')} onChange={(e) => set({ columns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3) })} />
          </Field>
          <Field label="Rows">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.rows || []).map((row: any, i: number) => (
                <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Feature" value={row.label} onChange={(e) => { const rows = [...d.rows]; rows[i] = { ...rows[i], label: e.target.value }; set({ rows }); }} />
                    <button onClick={() => set({ rows: d.rows.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(d.columns || ['Us', 'Others']).map((col: string, ci: number) => (
                      <label key={ci} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7E93AE' }}>
                        <input type="checkbox" checked={!!row.values?.[ci]} onChange={(e) => {
                          const rows = [...d.rows]; const values = [...(row.values || [])]; values[ci] = e.target.checked; rows[i] = { ...rows[i], values }; set({ rows });
                        }} />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => set({ rows: [...(d.rows || []), { label: 'New row', values: [] }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                <Plus size={13} /> Add row
              </button>
            </div>
          </Field>
        </>
      );

    case 'announcement_bar':
      return (
        <>
          <Field label={<FieldLabelWithAi label="Text" aiKind="announcement" aiContext="Site-wide announcement bar text" ctx={ctx} onResult={(text) => set({ text })} />}>
            <input style={darkFieldStyle} value={d.text || ''} onChange={(e) => set({ text: e.target.value })} />
          </Field>
          <Field label="Button text (optional)"><input style={darkFieldStyle} value={d.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
          {d.ctaLabel && <Field label="Button link"><input style={darkFieldStyle} value={d.ctaLink || ''} onChange={(e) => set({ ctaLink: e.target.value })} placeholder="https://…" /></Field>}
          <Field label="Background">
            <div style={selectStyle()}>
              <SearchableSelect value={d.background || 'brand'} onChange={(v) => set({ background: v })} options={[{ value: 'brand', label: 'Brand color' }, { value: 'navy', label: 'Navy' }, { value: 'white', label: 'White' }]} />
            </div>
          </Field>
        </>
      );

    case 'newsletter':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Subtext"><input style={darkFieldStyle} value={d.subtext || ''} onChange={(e) => set({ subtext: e.target.value })} /></Field>
          <Field label="Button text"><input style={darkFieldStyle} value={d.buttonLabel || ''} onChange={(e) => set({ buttonLabel: e.target.value })} /></Field>
          <p style={{ fontSize: 11.5, color: '#7E93AE', margin: 0 }}>Collects a WhatsApp number, same list as your other subscribers.</p>
        </>
      );

    case 'menu':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Dishes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.items || []).map((item: any, i: number) => (
                <div key={i} style={{ border: '1px solid #1E3350', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input style={{ ...darkFieldStyle, flex: 1 }} placeholder="Dish name" value={item.name} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], name: e.target.value }; set({ items }); }} />
                    <input style={{ ...darkFieldStyle, width: 90 }} placeholder="₦4,500" value={item.price} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], price: e.target.value }; set({ items }); }} />
                    <button onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <input style={darkFieldStyle} placeholder="Description" value={item.description || ''} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], description: e.target.value }; set({ items }); }} />
                </div>
              ))}
              <button onClick={() => set({ items: [...(d.items || []), { name: 'New dish', price: '₦0', description: '' }] })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #1E3350', color: '#7E93AE', borderRadius: 8, padding: 8, cursor: 'pointer', fontSize: 12 }}>
                <Plus size={13} /> Add dish
              </button>
            </div>
          </Field>
        </>
      );

    case 'social_links':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Instagram"><input style={darkFieldStyle} placeholder="https://instagram.com/…" value={d.instagram || ''} onChange={(e) => set({ instagram: e.target.value })} /></Field>
          <Field label="TikTok"><input style={darkFieldStyle} placeholder="https://tiktok.com/@…" value={d.tiktok || ''} onChange={(e) => set({ tiktok: e.target.value })} /></Field>
          <Field label="Twitter / X"><input style={darkFieldStyle} placeholder="https://x.com/…" value={d.twitter || ''} onChange={(e) => set({ twitter: e.target.value })} /></Field>
          <Field label="Facebook"><input style={darkFieldStyle} placeholder="https://facebook.com/…" value={d.facebook || ''} onChange={(e) => set({ facebook: e.target.value })} /></Field>
        </>
      );

    case 'popup_trigger':
      return (
        <>
          <Field label="Heading"><input style={darkFieldStyle} value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></Field>
          <Field label="Subtext"><input style={darkFieldStyle} value={d.subtext || ''} onChange={(e) => set({ subtext: e.target.value })} /></Field>
          <Field label="Image URL (optional)">
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{ ...darkFieldStyle, flex: 1 }} value={d.imageUrl || ''} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" />
              <button onClick={() => upload((url) => set({ imageUrl: url }))} style={{ background: '#112640', border: '1px solid #1E3350', color: '#EAF1F8', borderRadius: 8, padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Upload size={14} /></button>
            </div>
          </Field>
          <Field label="Button text"><input style={darkFieldStyle} value={d.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
          {(ctx.whatsappLines || []).length > 0 && (
            <Field label="Routes to">
              <div style={selectStyle()}>
                <SearchableSelect
                  value={d.lineId || ''}
                  onChange={(v) => set({ lineId: v })}
                  options={[{ value: '', label: 'Main WhatsApp number' }, ...(ctx.whatsappLines || []).map((l) => ({ value: l.id, label: l.label, sublabel: l.department || undefined }))]}
                />
              </div>
            </Field>
          )}
          <Field label="Show">
            <div style={selectStyle()}>
              <SearchableSelect
                value={d.trigger || 'delay'}
                onChange={(v) => set({ trigger: v })}
                options={[{ value: 'delay', label: 'After a delay' }, { value: 'scroll', label: 'After scrolling' }, { value: 'exit_intent', label: 'When leaving the page' }]}
              />
            </div>
          </Field>
          {d.trigger === 'delay' && (
            <Field label="Delay (seconds)"><input type="number" min={1} max={60} style={darkFieldStyle} value={d.delaySeconds ?? 8} onChange={(e) => set({ delaySeconds: Number(e.target.value) })} /></Field>
          )}
          {d.trigger === 'scroll' && (
            <Field label="Scroll depth (%)"><input type="number" min={10} max={100} style={darkFieldStyle} value={d.scrollPercent ?? 50} onChange={(e) => set({ scrollPercent: Number(e.target.value) })} /></Field>
          )}
          <Field label="Don't show again for (days)"><input type="number" min={0} max={90} style={darkFieldStyle} value={d.dismissDays ?? 7} onChange={(e) => set({ dismissDays: Number(e.target.value) })} /></Field>
        </>
      );

    default:
      return null;
  }
}
