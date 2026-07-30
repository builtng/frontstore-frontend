'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag, MessageCircle, Star, Clock, ChevronRight, Check,
  Calendar as CalendarIcon, Play, ImageIcon,
} from 'lucide-react';
import { SiteBlock } from './blockTypes';

export interface RenderStore {
  id?: string;
  username?: string;
  store_name?: string;
  primary_color?: string | null;
  currency_code?: string | null;
  whatsapp_phone?: string | null;
}

export interface RenderContext {
  store: RenderStore;
  products: any[];
  categories: any[];
  faqs: any[];
  reviews: any[];
  apiUrl: string;
  editable?: boolean;
}

function formatMoney(amount: any, currency?: string | null): string {
  const value = Number(amount) || 0;
  const code = currency || 'NGN';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₦${value.toLocaleString()}`;
  }
}

function waLink(phone: string | null | undefined, text: string): string {
  const digits = (phone || '').replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function themeVars(store: RenderStore): React.CSSProperties {
  const brand = store.primary_color || '#128C7E';
  return {
    '--brand': brand,
    '--brand-deep': `color-mix(in srgb, ${brand} 78%, black)`,
    '--tint': `color-mix(in srgb, ${brand} 12%, white)`,
  } as React.CSSProperties;
}

export default function BlockRenderer({ layout, ...ctx }: { layout: SiteBlock[] } & RenderContext) {
  return (
    <div className="sb-root" style={themeVars(ctx.store)}>
      {(layout || []).map((block) => (
        <div key={block.id} className="sb-block">
          {renderBlock(block, ctx)}
        </div>
      ))}
      <style jsx global>{SB_CSS}</style>
    </div>
  );
}

export function renderBlock(block: SiteBlock, ctx: RenderContext): React.ReactNode {
  const { data } = block;
  switch (block.type) {
    case 'section': {
      const bgMap: Record<string, string> = {
        brand: 'var(--brand)', navy: '#0A192F', tint: 'var(--tint)', white: '#fff',
      };
      const heightMap: Record<string, number> = { sm: 40, md: 80, lg: 140 };
      return <div style={{ background: bgMap[data.background] || 'var(--tint)', height: heightMap[data.height] || 80, borderRadius: 16 }} />;
    }

    case 'columns':
      return (
        <div className="sb-columns">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-columns-grid" style={{ gridTemplateColumns: `repeat(${Math.min(Math.max((data.items || []).length, 1), 4)}, 1fr)` }}>
            {(data.items || []).map((item: any, i: number) => (
              <div key={i} className="sb-column">
                <div className="sb-column-icon"><Check size={16} /></div>
                <b>{item.title}</b>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'spacer': {
      const sizeMap: Record<string, number> = { sm: 16, md: 40, lg: 80 };
      return <div style={{ height: sizeMap[data.size] || 40 }} />;
    }

    case 'divider':
      return <hr className="sb-divider" />;

    case 'hero': {
      const dark = data.background !== 'white';
      return (
        <div
          className="sb-hero"
          style={{
            background: data.background === 'navy' ? '#0A192F' : data.background === 'white' ? '#fff' : 'linear-gradient(160deg, var(--brand-deep), var(--brand))',
            color: dark ? '#fff' : 'var(--text, #0A192F)',
            textAlign: data.align === 'left' ? 'left' : 'center',
            alignItems: data.align === 'left' ? 'flex-start' : 'center',
          }}
        >
          {data.eyebrow && <span className="sb-hero-eyebrow">{data.eyebrow}</span>}
          <h1 className="sb-hero-headline">{data.headline || 'Your headline goes here'}</h1>
          {data.subheadline && <p className="sb-hero-sub" style={{ color: dark ? 'rgba(255,255,255,0.78)' : 'var(--text-muted, #55677E)' }}>{data.subheadline}</p>}
          {data.ctaLabel && (
            <a
              className="sb-hero-cta"
              href={ctx.editable ? undefined : waLink(ctx.store.whatsapp_phone, `Hi ${ctx.store.store_name || ''}, I'm interested!`)}
              target="_blank" rel="noreferrer"
              onClick={ctx.editable ? (e) => e.preventDefault() : undefined}
            >
              {data.ctaLabel}
            </a>
          )}
        </div>
      );
    }

    case 'product_grid': {
      let items = ctx.products || [];
      if (data.mode === 'category' && data.categoryId) {
        items = items.filter((p) => p.category_id === data.categoryId);
      } else if (data.mode === 'manual' && Array.isArray(data.productIds) && data.productIds.length) {
        const set = new Set(data.productIds);
        items = items.filter((p) => set.has(p.id));
      }
      items = items.slice(0, data.limit || 6);
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-product-grid">
            {items.length === 0 && <p className="sb-empty">No products to show yet.</p>}
            {items.map((p) => (
              <div key={p.id} className="sb-product-card">
                <div className="sb-product-thumb">
                  {p.image_url ? <img src={p.image_url} alt={p.name} /> : <ShoppingBag size={22} />}
                </div>
                <div className="sb-product-body">
                  <b>{p.name}</b>
                  <div className="sb-product-foot">
                    <em>{formatMoney(p.price, ctx.store.currency_code)}</em>
                    <span className="sb-mini-btn">Buy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'featured_product': {
      const product = (ctx.products || []).find((p) => p.id === data.productId);
      if (!product) return <p className="sb-empty">Pick a product in the inspector.</p>;
      return (
        <div className="sb-featured">
          <div className="sb-featured-thumb">
            {product.image_url ? <img src={product.image_url} alt={product.name} /> : <ShoppingBag size={32} />}
          </div>
          <div className="sb-featured-body">
            <span className="sb-featured-tag">Featured</span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="sb-featured-foot">
              <em>{formatMoney(product.price, ctx.store.currency_code)}</em>
              <span className="sb-cta-btn">Buy now</span>
            </div>
          </div>
        </div>
      );
    }

    case 'categories':
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-categories">
            {(ctx.categories || []).length === 0 && <p className="sb-empty">No categories yet.</p>}
            {(ctx.categories || []).map((c: any) => (
              <span key={c.id} className="sb-category-pill">{c.name}</span>
            ))}
          </div>
        </div>
      );

    case 'digital_spotlight': {
      const product = (ctx.products || []).find((p) => p.id === data.productId);
      if (!product) return <p className="sb-empty">Pick a digital product in the inspector.</p>;
      const files: any[] = Array.isArray(product.digital_files) ? product.digital_files : [];
      return (
        <div className="sb-digital">
          <div className="sb-digital-main">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="sb-digital-price">
              <em>{formatMoney(product.price, ctx.store.currency_code)}</em>
              <span className="sb-cta-btn">Get instant access</span>
            </div>
          </div>
          <div className="sb-digital-curriculum">
            <b>{data.curriculumLabel || "What's included"}</b>
            <ul>
              {files.length > 0 ? files.map((f: any, i: number) => (
                <li key={i}><Check size={14} /> {f.name || `File ${i + 1}`}</li>
              )) : <li><Check size={14} /> {product.name}</li>}
            </ul>
          </div>
        </div>
      );
    }

    case 'pricing_table':
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-pricing-grid">
            {(data.tiers || []).map((tier: any, i: number) => (
              <div key={i} className={`sb-pricing-card${tier.highlighted ? ' highlighted' : ''}`}>
                <b>{tier.name}</b>
                <div className="sb-pricing-price">{tier.price}<span>{tier.period}</span></div>
                <ul>
                  {(tier.features || []).map((f: string, j: number) => (
                    <li key={j}><Check size={14} /> {f}</li>
                  ))}
                </ul>
                <span className="sb-cta-btn" style={{ width: '100%', justifyContent: 'center' }}>{tier.ctaLabel || 'Choose plan'}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'booking':
      return <BookingBlock data={data} ctx={ctx} />;

    case 'whatsapp_cta':
      return (
        <div className="sb-wa-cta">
          <div>
            <b>{data.heading}</b>
            {data.subtext && <p>{data.subtext}</p>}
          </div>
          <a
            className="sb-wa-btn"
            href={ctx.editable ? undefined : waLink(ctx.store.whatsapp_phone, `Hi ${ctx.store.store_name || ''}!`)}
            target="_blank" rel="noreferrer"
            onClick={ctx.editable ? (e) => e.preventDefault() : undefined}
          >
            <MessageCircle size={15} /> {data.buttonLabel || 'Chat now'}
          </a>
        </div>
      );

    case 'testimonials': {
      const items = data.mode === 'manual' ? (data.manualItems || []) : (ctx.reviews || []).slice(0, 6);
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-testimonials">
            {items.length === 0 && <p className="sb-empty">No reviews yet.</p>}
            {items.map((r: any, i: number) => (
              <div key={i} className="sb-testimonial-card">
                <div className="sb-stars">
                  {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={13} fill={s < (r.rating || 5) ? 'currentColor' : 'none'} />)}
                </div>
                <p>{r.body || r.text}</p>
                <b>{r.reviewer_name || r.name}</b>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'faq': {
      const items = data.mode === 'manual' ? (data.manualItems || []) : (ctx.faqs || []);
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-faq-list">
            {items.length === 0 && <p className="sb-empty">No FAQs yet.</p>}
            {items.map((f: any, i: number) => (
              <details key={i} className="sb-faq-item">
                <summary>{f.question}<ChevronRight size={15} className="sb-faq-chevron" /></summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      );
    }

    case 'countdown':
      return <CountdownBlock data={data} />;

    case 'image':
      return data.url ? (
        <figure className="sb-image">
          <img src={data.url} alt={data.caption || ''} />
          {data.caption && <figcaption>{data.caption}</figcaption>}
        </figure>
      ) : <div className="sb-empty-media"><ImageIcon size={22} /><span>Add an image URL</span></div>;

    case 'gallery':
      return (
        <div className="sb-gallery">
          {(data.images || []).length === 0 && <div className="sb-empty-media"><ImageIcon size={22} /><span>Add images</span></div>}
          {(data.images || []).map((url: string, i: number) => (
            <img key={i} src={url} alt="" />
          ))}
        </div>
      );

    case 'video':
      return data.url ? (
        <div className="sb-video">
          <iframe src={data.url} allowFullScreen title="Video" />
        </div>
      ) : <div className="sb-empty-media"><Play size={22} /><span>Add a video embed URL</span></div>;

    default:
      return null;
  }
}

function CountdownBlock({ data }: { data: any }) {
  const [remaining, setRemaining] = useState<number>(() => new Date(data.endsAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(data.endsAt).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [data.endsAt]);

  if (remaining <= 0) {
    return <div className="sb-countdown"><b>{data.expiredText || 'This offer has ended'}</b></div>;
  }

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="sb-countdown">
      {data.heading && <b>{data.heading}</b>}
      <div className="sb-countdown-units">
        {[['Days', days], ['Hrs', hours], ['Min', mins], ['Sec', secs]].map(([label, value]) => (
          <div key={label as string} className="sb-countdown-unit">
            <span>{String(value).padStart(2, '0')}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingBlock({ data, ctx }: { data: any; ctx: RenderContext }) {
  const product = (ctx.products || []).find((p) => p.id === data.productId);
  const [step, setStep] = useState<'date' | 'time' | 'form' | 'done'>('date');
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const nextDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const pickDate = async (d: Date) => {
    if (ctx.editable) return;
    const iso = d.toISOString().slice(0, 10);
    setDate(iso);
    setLoading(true);
    try {
      const res = await fetch(`${ctx.apiUrl}/v1/public/store/${ctx.store.username}/slots?product_id=${data.productId}&date=${iso}`);
      const json = await res.json();
      setSlots(json?.data || []);
      setStep('time');
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!slotId || !name || !phone) return;
    setLoading(true);
    try {
      const res = await fetch(`${ctx.apiUrl}/v1/public/store/${ctx.store.username}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId, customer_name: name, customer_phone: phone }),
      });
      if (res.ok) setStep('done');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <p className="sb-empty">Pick a service in the inspector.</p>;

  return (
    <div className="sb-booking">
      <div className="sb-booking-head">
        <CalendarIcon size={18} />
        <div>
          <b>{data.heading || 'Book a session'}</b>
          <span>{product.name} · {formatMoney(product.price, ctx.store.currency_code)}</span>
        </div>
      </div>

      {step === 'date' && (
        <div className="sb-booking-days">
          {nextDays.map((d) => (
            <button key={d.toISOString()} onClick={() => pickDate(d)} disabled={ctx.editable}>
              <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <b>{d.getDate()}</b>
            </button>
          ))}
        </div>
      )}

      {step === 'time' && (
        <div className="sb-booking-times">
          {loading && <span className="sb-empty">Loading times…</span>}
          {!loading && slots.length === 0 && <span className="sb-empty">No times available {date}.</span>}
          {slots.map((s: any) => (
            <button key={s.id} onClick={() => { setSlotId(s.id); setStep('form'); }}>
              {s.start_time?.slice(0, 5)}
            </button>
          ))}
        </div>
      )}

      {step === 'form' && (
        <div className="sb-booking-form">
          <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="sb-cta-btn" onClick={submit} disabled={loading}>{loading ? 'Booking…' : 'Confirm booking'}</button>
        </div>
      )}

      {step === 'done' && <p className="sb-booking-success"><Check size={16} /> Booking confirmed — see you then!</p>}
    </div>
  );
}

export const SB_CSS = `
.sb-root { display: flex; flex-direction: column; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; color: #0A192F; background: #fff; }
.sb-block + .sb-block { margin-top: 0; }
.sb-heading { font-size: 22px; font-weight: 800; margin: 0 0 18px; text-align: center; }
.sb-section { padding: 32px 20px; }
.sb-empty { color: #94a3b8; font-size: 13px; text-align: center; padding: 20px; }
.sb-empty-media { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: #94a3b8; background: #f1f5f9; border-radius: 16px; margin: 20px; }

.sb-columns { padding: 40px 20px; }
.sb-columns-grid { display: grid; gap: 20px; max-width: 1000px; margin: 0 auto; }
.sb-column { text-align: center; padding: 20px; }
.sb-column-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--tint); color: var(--brand); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.sb-column b { display: block; font-size: 15px; margin-bottom: 6px; }
.sb-column p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }

.sb-divider { border: none; border-top: 1px solid #e2e8f0; margin: 0 20px; }

.sb-hero { display: flex; flex-direction: column; gap: 12px; padding: 64px 24px; }
.sb-hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.75; }
.sb-hero-headline { font-size: 32px; font-weight: 800; margin: 0; max-width: 20ch; line-height: 1.15; }
.sb-hero-sub { font-size: 15px; margin: 0; max-width: 40ch; }
.sb-hero-cta { margin-top: 6px; display: inline-flex; align-items: center; padding: 12px 24px; border-radius: 999px; background: #fff; color: var(--brand-deep); font-weight: 700; font-size: 14px; text-decoration: none; width: fit-content; }

.sb-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; max-width: 1100px; margin: 0 auto; }
.sb-product-card { border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px #e2e8f0; background: #fff; }
.sb-product-thumb { height: 130px; background: var(--tint); display: flex; align-items: center; justify-content: center; color: var(--brand); }
.sb-product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.sb-product-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.sb-product-body b { font-size: 13.5px; }
.sb-product-foot { display: flex; align-items: center; justify-content: space-between; }
.sb-product-foot em { font-style: normal; font-weight: 700; color: var(--brand-deep); font-variant-numeric: tabular-nums; }
.sb-mini-btn, .sb-cta-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--brand); color: #fff; font-weight: 700; font-size: 12.5px; padding: 8px 14px; border-radius: 999px; border: none; cursor: pointer; text-decoration: none; }

.sb-featured { display: flex; gap: 24px; padding: 32px 20px; max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
.sb-featured-thumb { width: 220px; height: 220px; border-radius: 16px; background: var(--tint); color: var(--brand); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-featured-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
.sb-featured-body { flex: 1; min-width: 220px; }
.sb-featured-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--brand); }
.sb-featured-body h3 { font-size: 22px; margin: 6px 0; }
.sb-featured-body p { color: #64748b; font-size: 14px; line-height: 1.6; }
.sb-featured-foot { display: flex; align-items: center; gap: 16px; margin-top: 14px; }
.sb-featured-foot em { font-style: normal; font-weight: 800; font-size: 18px; }

.sb-categories { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 900px; margin: 0 auto; }
.sb-category-pill { padding: 8px 16px; border-radius: 999px; background: var(--tint); color: var(--brand-deep); font-size: 13px; font-weight: 600; }

.sb-digital { display: flex; gap: 28px; padding: 40px 20px; max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
.sb-digital-main { flex: 1.3; min-width: 240px; }
.sb-digital-main h3 { font-size: 24px; margin: 0 0 8px; }
.sb-digital-main p { color: #64748b; font-size: 14px; line-height: 1.6; }
.sb-digital-price { display: flex; align-items: center; gap: 16px; margin-top: 16px; }
.sb-digital-price em { font-style: normal; font-weight: 800; font-size: 20px; }
.sb-digital-curriculum { flex: 1; min-width: 220px; background: var(--tint); border-radius: 16px; padding: 20px; }
.sb-digital-curriculum b { display: block; margin-bottom: 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--brand-deep); }
.sb-digital-curriculum ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sb-digital-curriculum li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #334155; }
.sb-digital-curriculum svg { color: var(--brand); flex-shrink: 0; }

.sb-pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto; }
.sb-pricing-card { border-radius: 18px; padding: 24px; background: #fff; box-shadow: 0 0 0 1px #e2e8f0; display: flex; flex-direction: column; gap: 14px; }
.sb-pricing-card.highlighted { box-shadow: 0 0 0 2px var(--brand); position: relative; }
.sb-pricing-card b { font-size: 15px; }
.sb-pricing-price { font-size: 28px; font-weight: 800; }
.sb-pricing-price span { font-size: 13px; font-weight: 500; color: #64748b; }
.sb-pricing-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.sb-pricing-card li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
.sb-pricing-card svg { color: var(--brand); flex-shrink: 0; }

.sb-wa-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; background: var(--tint); border-radius: 18px; margin: 20px; flex-wrap: wrap; }
.sb-wa-cta b { font-size: 15px; }
.sb-wa-cta p { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.sb-wa-btn { display: inline-flex; align-items: center; gap: 8px; background: #128C7E; color: #fff; font-weight: 700; font-size: 13.5px; padding: 12px 20px; border-radius: 999px; text-decoration: none; }

.sb-testimonials { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; max-width: 1000px; margin: 0 auto; }
.sb-testimonial-card { background: #fff; box-shadow: 0 0 0 1px #e2e8f0; border-radius: 16px; padding: 18px; }
.sb-stars { color: #f59e0b; display: flex; gap: 2px; margin-bottom: 10px; }
.sb-testimonial-card p { font-size: 13.5px; color: #334155; line-height: 1.6; }
.sb-testimonial-card b { display: block; margin-top: 10px; font-size: 12.5px; }

.sb-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 700px; margin: 0 auto; }
.sb-faq-item { background: #fff; box-shadow: 0 0 0 1px #e2e8f0; border-radius: 12px; padding: 14px 16px; }
.sb-faq-item summary { cursor: pointer; font-weight: 700; font-size: 13.5px; display: flex; align-items: center; justify-content: space-between; list-style: none; }
.sb-faq-item summary::-webkit-details-marker { display: none; }
.sb-faq-chevron { transition: transform 0.15s; }
.sb-faq-item[open] .sb-faq-chevron { transform: rotate(90deg); }
.sb-faq-item p { margin: 10px 0 0; font-size: 13px; color: #64748b; line-height: 1.6; }

.sb-countdown { text-align: center; padding: 32px 20px; }
.sb-countdown b { display: block; margin-bottom: 14px; font-size: 15px; }
.sb-countdown-units { display: flex; gap: 12px; justify-content: center; }
.sb-countdown-unit { background: var(--tint); border-radius: 12px; padding: 10px 14px; min-width: 56px; }
.sb-countdown-unit span { display: block; font-size: 22px; font-weight: 800; color: var(--brand-deep); font-variant-numeric: tabular-nums; }
.sb-countdown-unit small { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

.sb-booking { max-width: 480px; margin: 0 auto; padding: 24px 20px; background: #fff; border-radius: 18px; box-shadow: 0 0 0 1px #e2e8f0; }
.sb-booking-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; color: var(--brand); }
.sb-booking-head b { display: block; font-size: 14.5px; color: #0f172a; }
.sb-booking-head span { font-size: 12px; color: #64748b; }
.sb-booking-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.sb-booking-days button { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 11px; color: #64748b; cursor: pointer; }
.sb-booking-days button b { font-size: 15px; color: #0f172a; }
.sb-booking-times { display: flex; flex-wrap: wrap; gap: 8px; }
.sb-booking-times button { padding: 8px 14px; border-radius: 999px; border: 1px solid #e2e8f0; background: #fff; font-size: 13px; cursor: pointer; }
.sb-booking-form { display: flex; flex-direction: column; gap: 10px; }
.sb-booking-form input { padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13.5px; }
.sb-booking-success { display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 600; font-size: 14px; }

.sb-image { margin: 0; padding: 0 20px; }
.sb-image img { width: 100%; border-radius: 16px; display: block; }
.sb-image figcaption { font-size: 12px; color: #64748b; text-align: center; margin-top: 8px; }
.sb-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 0 20px; }
.sb-gallery img { width: 100%; height: 140px; object-fit: cover; border-radius: 12px; }
.sb-video { padding: 0 20px; }
.sb-video iframe { width: 100%; aspect-ratio: 16/9; border-radius: 16px; border: none; }
`;
