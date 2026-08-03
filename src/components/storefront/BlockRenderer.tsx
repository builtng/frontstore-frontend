'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ShoppingBag, MessageCircle, Star, Clock, ChevronRight, Check,
  Calendar as CalendarIcon, Play, ImageIcon,
  ShieldCheck, Truck, BadgeCheck, Users, BookOpen,
  Instagram, Facebook, Twitter, X as CloseIcon, Share2,
} from 'lucide-react';
import { blockWrapperClassName, blockWrapperStyle, SiteBlock } from './blockTypes';
import ProductImage from '../ProductImage';

export interface RenderStore {
  id?: string;
  username?: string;
  store_name?: string;
  primary_color?: string | null;
  currency_code?: string | null;
  whatsapp_phone?: string | null;
}

export interface SiteThemeTokens {
  colors?: { primary?: string; secondary?: string; accent?: string; background?: string; surface?: string; text?: string; textMuted?: string };
  typography?: { headingFont?: string; bodyFont?: string; headingWeight?: number };
  buttonStyle?: 'rounded' | 'pill' | 'square';
  cardStyle?: 'elevated' | 'bordered' | 'glass' | 'minimal';
  radius?: number;
  appliedThemeKey?: string;
}

export interface WhatsappLine {
  id: string;
  label: string;
  phone: string;
  department?: string | null;
  is_default?: boolean;
}

export interface RenderContext {
  store: RenderStore;
  products: any[];
  categories: any[];
  faqs: any[];
  reviews: any[];
  apiUrl: string;
  editable?: boolean;
  siteTheme?: SiteThemeTokens | null;
  whatsappLines?: WhatsappLine[];
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

/** Resolves a block's chosen WhatsApp line to a phone number, falling back
 * to the store's main WhatsApp number when no line is picked or found. */
function resolveWaPhone(ctx: RenderContext, lineId?: string): string | null | undefined {
  if (lineId) {
    const line = (ctx.whatsappLines || []).find((l) => l.id === lineId);
    if (line) return line.phone;
  }
  return ctx.store.whatsapp_phone;
}

const CARD_SHADOWS: Record<string, string> = {
  elevated: '0 0 0 1px rgba(15,23,42,0.055), 0 1px 2px rgba(15,23,42,0.04), 0 16px 28px -18px rgba(15,23,42,0.22)',
  bordered: '0 0 0 1px #e5e7eb',
  glass: '0 0 0 1px rgba(15,23,42,0.05), 0 12px 28px -14px rgba(15,23,42,0.2)',
  minimal: 'none',
};

const BUTTON_RADII: Record<string, string> = {
  pill: '999px',
  rounded: '12px',
  square: '4px',
};

export function themeVars(store: RenderStore, siteTheme?: SiteThemeTokens | null): React.CSSProperties {
  const colors = siteTheme?.colors || {};
  const typography = siteTheme?.typography || {};
  const brand = colors.primary || store.primary_color || '#128C7E';
  const buttonStyle = siteTheme?.buttonStyle || 'rounded';
  const cardStyle = siteTheme?.cardStyle || 'elevated';

  return {
    '--brand': brand,
    '--brand-deep': `color-mix(in srgb, ${brand} 78%, black)`,
    '--tint': `color-mix(in srgb, ${brand} 12%, white)`,
    '--brand-secondary': colors.secondary || brand,
    '--brand-accent': colors.accent || brand,
    '--sb-bg': colors.background || '#fff',
    '--sb-surface': cardStyle === 'glass' ? 'rgba(255,255,255,0.72)' : (colors.surface || '#fff'),
    '--sb-text': colors.text || '#0A192F',
    '--sb-text-muted': colors.textMuted || '#55677E',
    '--sb-border': `color-mix(in srgb, ${colors.text || '#0A192F'} 12%, transparent)`,
    '--font-heading': typography.headingFont ? `'${typography.headingFont}', var(--font-outfit), sans-serif` : `var(--font-outfit, 'Outfit'), sans-serif`,
    '--font-body': typography.bodyFont ? `'${typography.bodyFont}', var(--font-inter), sans-serif` : `var(--font-inter, 'Inter'), sans-serif`,
    '--heading-weight': String(typography.headingWeight || 700),
    '--radius-base': `${siteTheme?.radius ?? 12}px`,
    '--button-radius': BUTTON_RADII[buttonStyle] || '999px',
    '--sb-card-shadow': CARD_SHADOWS[cardStyle] || CARD_SHADOWS.elevated,
  } as React.CSSProperties;
}

/** Google Fonts loaded on demand for whatever fonts the active theme names,
 * rather than statically importing every font this builder could ever offer. */
function ThemeFontLink({ siteTheme }: { siteTheme?: SiteThemeTokens | null }) {
  const families = Array.from(new Set([siteTheme?.typography?.headingFont, siteTheme?.typography?.bodyFont].filter(Boolean))) as string[];
  if (families.length === 0) return null;
  const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`).join('&')}&display=swap`;
  return <link rel="stylesheet" href={href} />;
}

export default function BlockRenderer({ layout, ...ctx }: { layout: SiteBlock[] } & RenderContext) {
  return (
    <div className="sb-root" style={themeVars(ctx.store, ctx.siteTheme)}>
      <ThemeFontLink siteTheme={ctx.siteTheme} />
      {(layout || []).map((block) => (
        <RevealBlock key={block.id} block={block}>
          {renderBlock(block, ctx)}
        </RevealBlock>
      ))}
      <style jsx global>{SB_CSS}</style>
    </div>
  );
}

/** Plays a block's configured entrance animation the first time it scrolls
 * into view, rather than firing every animation at once on page load. */
function RevealBlock({ block, children }: { block: SiteBlock; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(!block.style?.animation || block.style.animation === 'none');

  useEffect(() => {
    if (revealed || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const className = blockWrapperClassName(block) + (revealed ? ' sb-revealed' : '');
  return <div ref={ref} className={className} style={blockWrapperStyle(block)}>{children}</div>;
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
      const dark = data.background !== 'white' && data.layout !== 'minimal';
      const heroBg = data.background === 'navy'
        ? 'linear-gradient(160deg, #0A192F, #060d1a)'
        : data.background === 'white' ? '#fff' : 'linear-gradient(160deg, var(--brand-deep), var(--brand))';
      const heroCta = data.ctaLabel && (
        <a
          className="sb-hero-cta"
          href={ctx.editable ? undefined : waLink(ctx.store.whatsapp_phone, `Hi ${ctx.store.store_name || ''}, I'm interested!`)}
          target="_blank" rel="noreferrer"
          onClick={ctx.editable ? (e) => e.preventDefault() : undefined}
        >
          {data.ctaLabel}
        </a>
      );
      const heroText = (
        <>
          {data.eyebrow && <span className="sb-hero-eyebrow">{data.eyebrow}</span>}
          <h1 className="sb-hero-headline">{data.headline || 'Your headline goes here'}</h1>
          {data.subheadline && <p className="sb-hero-sub" style={{ color: dark ? 'rgba(255,255,255,0.78)' : 'var(--sb-text-muted, #55677E)' }}>{data.subheadline}</p>}
          {heroCta}
        </>
      );

      if (data.layout === 'split') {
        return (
          <div className="sb-hero sb-hero-split" style={{ background: heroBg, color: dark ? '#fff' : 'var(--sb-text, #0A192F)' }}>
            <div className="sb-hero-split-text">{heroText}</div>
            <div className="sb-hero-split-media">
              {data.imageUrl ? <img src={data.imageUrl} alt="" /> : <div className="sb-hero-split-placeholder"><ImageIcon size={28} /></div>}
            </div>
          </div>
        );
      }

      if (data.layout === 'minimal') {
        return (
          <div className="sb-hero sb-hero-minimal" style={{ textAlign: data.align === 'left' ? 'left' : 'center', alignItems: data.align === 'left' ? 'flex-start' : 'center' }}>
            {heroText}
          </div>
        );
      }

      return (
        <div
          className="sb-hero"
          style={{
            background: heroBg,
            color: dark ? '#fff' : 'var(--sb-text, #0A192F)',
            textAlign: data.align === 'left' ? 'left' : 'center',
            alignItems: data.align === 'left' ? 'flex-start' : 'center',
          }}
        >
          {heroText}
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
                <div className="relative w-full overflow-hidden">
                  <ProductImage src={p.image_url || (p.image_urls && p.image_urls[0]) || null} alt={p.name} aspectRatio="4/5" />
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
          <div className="relative w-full md:w-1/2 overflow-hidden rounded-2xl">
            <ProductImage src={product.image_url || (product.image_urls && product.image_urls[0]) || null} alt={product.name} aspectRatio="4/5" />
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
            href={ctx.editable ? undefined : waLink(resolveWaPhone(ctx, data.lineId), `Hi ${ctx.store.store_name || ''}!`)}
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

    case 'trust_badges': {
      const iconMap: Record<string, React.ComponentType<any>> = { shield: ShieldCheck, truck: Truck, badge: BadgeCheck };
      const items = data.items || [];
      return (
        <div className="sb-section sb-trust-badges">
          {items.length === 0 && <p className="sb-empty">Add a badge to get started.</p>}
          {items.map((item: any, i: number) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={i} className="sb-trust-badge">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      );
    }

    case 'logos_strip':
      return (
        <div className="sb-section sb-logos-strip">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-logos-row">
            {(data.logos || []).length === 0 && <p className="sb-empty">Add logo images to show here.</p>}
            {(data.logos || []).map((url: string, i: number) => <img key={i} src={url} alt="" />)}
          </div>
        </div>
      );

    case 'stats_counters':
      return (
        <div className="sb-section sb-stats-row">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="sb-stat">
              <b>{item.value}</b>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      );

    case 'team':
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-team-grid">
            {(data.members || []).map((m: any, i: number) => (
              <div key={i} className="sb-team-card">
                {m.photoUrl ? <img src={m.photoUrl} alt={m.name} /> : <div className="sb-team-avatar"><Users size={20} /></div>}
                <b>{m.name}</b>
                <span>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'about_story': {
      const reversed = data.imagePosition === 'left';
      return (
        <div className={`sb-section sb-about-story${reversed ? ' reversed' : ''}`}>
          <div className="sb-about-media">
            {data.imageUrl ? <img src={data.imageUrl} alt="" /> : <div className="sb-empty-media"><BookOpen size={22} /><span>Add a photo</span></div>}
          </div>
          <div className="sb-about-text">
            {data.heading && <h2 className="sb-heading" style={{ textAlign: 'left' }}>{data.heading}</h2>}
            <p>{data.body}</p>
          </div>
        </div>
      );
    }

    case 'comparison_table':
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-compare-wrap">
            <table className="sb-compare-table">
              <thead>
                <tr>
                  <th />
                  {(data.columns || []).map((c: string, i: number) => <th key={i}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {(data.rows || []).map((row: any, i: number) => (
                  <tr key={i}>
                    <td>{row.label}</td>
                    {(row.values || []).map((v: boolean, j: number) => (
                      <td key={j}>{v ? <Check size={16} className="yes" /> : <CloseIcon size={16} className="no" />}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'announcement_bar': {
      const bg = data.background === 'navy' ? '#0A192F' : data.background === 'white' ? '#fff' : 'var(--brand)';
      return (
        <div className="sb-announcement" style={{ background: bg, color: data.background === 'white' ? 'var(--sb-text, #0A192F)' : '#fff' }}>
          <span>{data.text || 'Add an announcement'}</span>
          {data.ctaLabel && (
            <a href={ctx.editable ? undefined : (data.ctaLink || '#')} onClick={ctx.editable ? (e) => e.preventDefault() : undefined}>
              {data.ctaLabel} <ChevronRight size={13} />
            </a>
          )}
        </div>
      );
    }

    case 'newsletter':
      return <NewsletterBlock data={data} ctx={ctx} />;

    case 'menu':
      return (
        <div className="sb-section">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-menu-list">
            {(data.items || []).length === 0 && <p className="sb-empty">Add a dish to get started.</p>}
            {(data.items || []).map((item: any, i: number) => (
              <div key={i} className="sb-menu-item">
                <div className="sb-menu-item-head">
                  <b>{item.name}</b>
                  <em>{item.price}</em>
                </div>
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'social_links': {
      const links: { key: string; url?: string; icon: React.ComponentType<any> }[] = [
        { key: 'Instagram', url: data.instagram, icon: Instagram },
        { key: 'Facebook', url: data.facebook, icon: Facebook },
        { key: 'Twitter', url: data.twitter, icon: Twitter },
        { key: 'TikTok', url: data.tiktok, icon: Share2 },
      ].filter((l) => l.url);
      return (
        <div className="sb-section sb-social-links">
          {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
          <div className="sb-social-row">
            {links.length === 0 && <p className="sb-empty">Add a social profile link.</p>}
            {links.map((l) => (
              <a key={l.key} href={ctx.editable ? undefined : l.url} target="_blank" rel="noreferrer" onClick={ctx.editable ? (e) => e.preventDefault() : undefined}>
                <l.icon size={16} /> {l.key}
              </a>
            ))}
          </div>
        </div>
      );
    }

    case 'popup_trigger': {
      const triggerLabel = data.trigger === 'exit_intent' ? 'when a visitor is about to leave'
        : data.trigger === 'scroll' ? `after scrolling ${data.scrollPercent || 50}% down the page`
        : `${data.delaySeconds || 8}s after the page loads`;
      if (ctx.editable) {
        return (
          <div className="sb-popup-placeholder">
            <MessageCircle size={16} />
            <div>
              <b>{data.heading || 'Popup'}</b>
              <span>Shows {triggerLabel}. Not shown while editing.</span>
            </div>
          </div>
        );
      }
      return <PopupTriggerBlock block={block} data={data} ctx={ctx} />;
    }

    default:
      return null;
  }
}

function NewsletterBlock({ data, ctx }: { data: any; ctx: RenderContext }) {
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ctx.editable || !phone.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${ctx.apiUrl}/v1/public/store/${ctx.store.username}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ phone_number: phone.trim(), topics: data.topics?.length ? data.topics : ['news'] }),
      });
      if (res.ok) setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sb-section sb-newsletter">
      {data.heading && <h2 className="sb-heading">{data.heading}</h2>}
      {data.subtext && <p className="sb-newsletter-sub">{data.subtext}</p>}
      {done ? (
        <p className="sb-newsletter-done"><Check size={15} /> You're subscribed!</p>
      ) : (
        <form className="sb-newsletter-form" onSubmit={submit}>
          <input type="tel" placeholder="WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button type="submit" disabled={submitting}>{submitting ? 'Adding…' : (data.buttonLabel || 'Subscribe')}</button>
        </form>
      )}
    </div>
  );
}

function PopupTriggerBlock({ block, data, ctx }: { block: SiteBlock; data: any; ctx: RenderContext }) {
  const [open, setOpen] = useState(false);
  const dismissKey = `sb-popup-dismissed:${block.id}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissedAt = Number(window.localStorage.getItem(dismissKey) || 0);
    const dismissDays = data.dismissDays ?? 7;
    if (dismissedAt && Date.now() - dismissedAt < dismissDays * 86400000) return;

    if (data.trigger === 'exit_intent') {
      const handler = (e: MouseEvent) => { if (e.clientY <= 0) { setOpen(true); document.removeEventListener('mouseleave', handler); } };
      document.addEventListener('mouseleave', handler);
      return () => document.removeEventListener('mouseleave', handler);
    }

    if (data.trigger === 'scroll') {
      const handler = () => {
        const pct = (window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)) * 100;
        if (pct >= (data.scrollPercent || 50)) { setOpen(true); window.removeEventListener('scroll', handler); }
      };
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    }

    const timer = setTimeout(() => setOpen(true), (data.delaySeconds ?? 8) * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(dismissKey, String(Date.now()));
  };

  if (!open) return null;

  return (
    <div className="sb-popup-overlay" onClick={close}>
      <div className="sb-popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="sb-popup-close" onClick={close}><CloseIcon size={16} /></button>
        {data.imageUrl && <img src={data.imageUrl} alt="" />}
        <b>{data.heading}</b>
        {data.subtext && <p>{data.subtext}</p>}
        {data.ctaLabel && (
          <a className="sb-mini-btn" href={waLink(resolveWaPhone(ctx, data.lineId), `Hi ${ctx.store.store_name || ''}!`)} target="_blank" rel="noreferrer" onClick={close}>
            {data.ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
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
.sb-root { display: flex; flex-direction: column; font-family: var(--font-body, var(--font-inter)), -apple-system, sans-serif; color: var(--sb-text, #0A192F); background: var(--sb-bg, #fff); -webkit-font-smoothing: antialiased; }
.sb-block + .sb-block { margin-top: 0; }

.sb-block-styled { padding-top: var(--sb-b-pad-y, 0); padding-bottom: var(--sb-b-pad-y, 0); padding-left: var(--sb-b-pad-x, 0); padding-right: var(--sb-b-pad-x, 0);
  margin-top: var(--sb-b-mt, 0); margin-bottom: var(--sb-b-mb, 0); background: var(--sb-b-bg, transparent); color: var(--sb-b-color, inherit);
  font-size: var(--sb-b-fs, inherit); font-weight: var(--sb-b-fw, inherit); text-align: var(--sb-b-align, inherit);
  border-radius: var(--sb-b-radius, 0); border-style: solid; border-width: var(--sb-b-bw, 0); border-color: var(--sb-b-bc, transparent);
  box-shadow: var(--sb-b-shadow, none); }

.sb-hide-desktop, .sb-hide-tablet, .sb-hide-mobile { display: block; }
@media (min-width: 992px) { .sb-hide-desktop { display: none !important; } }
@media (min-width: 576px) and (max-width: 991.98px) {
  .sb-hide-tablet { display: none !important; }
  .sb-block-styled { padding-top: var(--sb-b-pad-y-t, var(--sb-b-pad-y, 0)); padding-bottom: var(--sb-b-pad-y-t, var(--sb-b-pad-y, 0));
    padding-left: var(--sb-b-pad-x-t, var(--sb-b-pad-x, 0)); padding-right: var(--sb-b-pad-x-t, var(--sb-b-pad-x, 0));
    font-size: var(--sb-b-fs-t, var(--sb-b-fs, inherit)); text-align: var(--sb-b-align-t, var(--sb-b-align, inherit)); }
}
@media (max-width: 575.98px) {
  .sb-hide-mobile { display: none !important; }
  .sb-block-styled { padding-top: var(--sb-b-pad-y-m, var(--sb-b-pad-y, 0)); padding-bottom: var(--sb-b-pad-y-m, var(--sb-b-pad-y, 0));
    padding-left: var(--sb-b-pad-x-m, var(--sb-b-pad-x, 0)); padding-right: var(--sb-b-pad-x-m, var(--sb-b-pad-x, 0));
    font-size: var(--sb-b-fs-m, var(--sb-b-fs, inherit)); text-align: var(--sb-b-align-m, var(--sb-b-align, inherit)); }
}

.sb-anim-fade-in { opacity: 0; transition: opacity 0.6s ease; }
.sb-anim-fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.sb-anim-zoom-in { opacity: 0; transform: scale(0.94); transition: opacity 0.5s ease, transform 0.5s ease; }
.sb-anim-fade-in.sb-revealed, .sb-anim-fade-up.sb-revealed, .sb-anim-zoom-in.sb-revealed { opacity: 1; transform: none; }
.sb-heading { font-family: var(--font-heading, inherit); font-size: 23px; font-weight: var(--heading-weight, 700); letter-spacing: -0.015em; margin: 0 0 20px; text-align: center; }
.sb-section { padding: 56px 24px; }
.sb-empty { color: var(--sb-text-muted, #94a3b8); font-size: 13px; text-align: center; padding: 20px; }
.sb-empty-media { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: #94a3b8; background: #f1f5f9; border-radius: 16px; margin: 20px; }

.sb-columns { padding: 40px 20px; }
.sb-columns-grid { display: grid; gap: 20px; max-width: 1000px; margin: 0 auto; }
.sb-column { text-align: center; padding: 20px; }
.sb-column-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--tint); border: 1px solid color-mix(in srgb, var(--brand) 22%, transparent); color: var(--brand); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.sb-column b { display: block; font-size: 15px; margin-bottom: 6px; }
.sb-column p { font-size: 13px; color: var(--sb-text-muted, #64748b); margin: 0; line-height: 1.5; }

.sb-divider { border: none; border-top: 1px solid var(--sb-border, #e2e8f0); margin: 0 20px; }

.sb-hero { display: flex; flex-direction: column; gap: 14px; padding: 88px 28px; }
.sb-hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.7; }
.sb-hero-headline { font-family: var(--font-heading, inherit); font-size: 40px; font-weight: var(--heading-weight, 700); letter-spacing: -0.025em; margin: 0; max-width: 18ch; line-height: 1.08; }
.sb-hero-sub { font-size: 16px; line-height: 1.55; margin: 0; max-width: 38ch; font-weight: 400; }
.sb-hero-cta { margin-top: 10px; display: inline-flex; align-items: center; padding: 14px 28px; border-radius: var(--button-radius, 999px); background: #fff; color: var(--brand-deep); font-weight: 600; font-size: 13.5px; letter-spacing: 0.01em; text-decoration: none; width: fit-content; box-shadow: 0 12px 28px -12px rgba(0,0,0,0.35); transition: transform 0.15s ease, box-shadow 0.15s ease; }
.sb-hero-cta:hover { transform: translateY(-1px); box-shadow: 0 16px 32px -12px rgba(0,0,0,0.4); }

.sb-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 22px; max-width: 1100px; margin: 0 auto; }
.sb-product-card { border-radius: var(--radius-base, 14px); overflow: hidden; box-shadow: var(--sb-card-shadow, 0 0 0 1px #e2e8f0); background: var(--sb-surface, #fff); }
.sb-product-thumb { height: 130px; background: var(--tint); display: flex; align-items: center; justify-content: center; color: var(--brand); }
.sb-product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.sb-product-body { padding: 14px; display: flex; flex-direction: column; gap: 9px; }
.sb-product-body b { font-size: 13.5px; font-weight: 600; letter-spacing: -0.005em; }
.sb-product-foot { display: flex; align-items: center; justify-content: space-between; }
.sb-product-foot em { font-style: normal; font-weight: 600; color: var(--sb-text, #0A192F); font-variant-numeric: tabular-nums; }
.sb-mini-btn, .sb-cta-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--brand); color: #fff; font-weight: 600; font-size: 12px; letter-spacing: 0.01em; padding: 8px 15px; border-radius: var(--button-radius, 999px); border: none; cursor: pointer; text-decoration: none; transition: filter 0.15s ease, transform 0.1s ease; }
.sb-mini-btn:hover, .sb-cta-btn:hover { filter: brightness(1.08); }

.sb-featured { display: flex; gap: 24px; padding: 32px 20px; max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
.sb-featured-thumb { width: 220px; height: 220px; border-radius: 16px; background: var(--tint); color: var(--brand); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-featured-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
.sb-featured-body { flex: 1; min-width: 220px; }
.sb-featured-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--brand); }
.sb-featured-body h3 { font-size: 22px; margin: 6px 0; }
.sb-featured-body p { color: var(--sb-text-muted, #64748b); font-size: 14px; line-height: 1.6; }
.sb-featured-foot { display: flex; align-items: center; gap: 16px; margin-top: 14px; }
.sb-featured-foot em { font-style: normal; font-weight: 800; font-size: 18px; }

.sb-categories { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 900px; margin: 0 auto; }
.sb-category-pill { padding: 8px 16px; border-radius: var(--button-radius, 999px); background: var(--tint); color: var(--brand-deep); font-size: 13px; font-weight: 600; }

.sb-digital { display: flex; gap: 28px; padding: 40px 20px; max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
.sb-digital-main { flex: 1.3; min-width: 240px; }
.sb-digital-main h3 { font-size: 24px; margin: 0 0 8px; }
.sb-digital-main p { color: var(--sb-text-muted, #64748b); font-size: 14px; line-height: 1.6; }
.sb-digital-price { display: flex; align-items: center; gap: 16px; margin-top: 16px; }
.sb-digital-price em { font-style: normal; font-weight: 800; font-size: 20px; }
.sb-digital-curriculum { flex: 1; min-width: 220px; background: var(--tint); border-radius: 16px; padding: 20px; }
.sb-digital-curriculum b { display: block; margin-bottom: 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--brand-deep); }
.sb-digital-curriculum ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sb-digital-curriculum li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--sb-text-muted, #334155); }
.sb-digital-curriculum svg { color: var(--brand); flex-shrink: 0; }

.sb-pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto; }
.sb-pricing-card { border-radius: 18px; padding: 24px; background: var(--sb-surface, #fff); box-shadow: var(--sb-card-shadow, 0 0 0 1px #e2e8f0); display: flex; flex-direction: column; gap: 14px; }
.sb-pricing-card.highlighted { box-shadow: 0 0 0 2px var(--brand); position: relative; }
.sb-pricing-card b { font-size: 15px; }
.sb-pricing-price { font-size: 28px; font-weight: 800; }
.sb-pricing-price span { font-size: 13px; font-weight: 500; color: var(--sb-text-muted, #64748b); }
.sb-pricing-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.sb-pricing-card li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--sb-text-muted, #475569); }
.sb-pricing-card svg { color: var(--brand); flex-shrink: 0; }

.sb-wa-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; background: var(--tint); border-radius: 18px; margin: 20px; flex-wrap: wrap; }
.sb-wa-cta b { font-size: 15px; }
.sb-wa-cta p { margin: 2px 0 0; font-size: 13px; color: var(--sb-text-muted, #64748b); }
.sb-wa-btn { display: inline-flex; align-items: center; gap: 8px; background: #128C7E; color: #fff; font-weight: 700; font-size: 13.5px; padding: 12px 20px; border-radius: var(--button-radius, 999px); text-decoration: none; }

.sb-testimonials { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; max-width: 1000px; margin: 0 auto; }
.sb-testimonial-card { background: var(--sb-surface, #fff); box-shadow: var(--sb-card-shadow, 0 0 0 1px #e2e8f0); border-radius: 16px; padding: 18px; }
.sb-stars { color: #f59e0b; display: flex; gap: 2px; margin-bottom: 10px; }
.sb-testimonial-card p { font-size: 13.5px; color: var(--sb-text-muted, #334155); line-height: 1.6; }
.sb-testimonial-card b { display: block; margin-top: 10px; font-size: 12.5px; }

.sb-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 700px; margin: 0 auto; }
.sb-faq-item { background: var(--sb-surface, #fff); box-shadow: var(--sb-card-shadow, 0 0 0 1px #e2e8f0); border-radius: 12px; padding: 14px 16px; }
.sb-faq-item summary { cursor: pointer; font-weight: 700; font-size: 13.5px; display: flex; align-items: center; justify-content: space-between; list-style: none; }
.sb-faq-item summary::-webkit-details-marker { display: none; }
.sb-faq-chevron { transition: transform 0.15s; }
.sb-faq-item[open] .sb-faq-chevron { transform: rotate(90deg); }
.sb-faq-item p { margin: 10px 0 0; font-size: 13px; color: var(--sb-text-muted, #64748b); line-height: 1.6; }

.sb-countdown { text-align: center; padding: 32px 20px; }
.sb-countdown b { display: block; margin-bottom: 14px; font-size: 15px; }
.sb-countdown-units { display: flex; gap: 12px; justify-content: center; }
.sb-countdown-unit { background: var(--tint); border-radius: 12px; padding: 10px 14px; min-width: 56px; }
.sb-countdown-unit span { display: block; font-size: 22px; font-weight: 800; color: var(--brand-deep); font-variant-numeric: tabular-nums; }
.sb-countdown-unit small { font-size: 10px; color: var(--sb-text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.05em; }

.sb-booking { max-width: 480px; margin: 0 auto; padding: 24px 20px; background: var(--sb-surface, #fff); border-radius: 18px; box-shadow: var(--sb-card-shadow, 0 0 0 1px #e2e8f0); }
.sb-booking-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; color: var(--brand); }
.sb-booking-head b { display: block; font-size: 14.5px; color: #0f172a; }
.sb-booking-head span { font-size: 12px; color: var(--sb-text-muted, #64748b); }
.sb-booking-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.sb-booking-days button { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 10px; border: 1px solid var(--sb-border, #e2e8f0); background: var(--sb-surface, #fff); font-size: 11px; color: var(--sb-text-muted, #64748b); cursor: pointer; }
.sb-booking-days button b { font-size: 15px; color: var(--sb-text, #0f172a); }
.sb-booking-times { display: flex; flex-wrap: wrap; gap: 8px; }
.sb-booking-times button { padding: 8px 14px; border-radius: 999px; border: 1px solid var(--sb-border, #e2e8f0); background: var(--sb-surface, #fff); color: var(--sb-text, #0A192F); font-size: 13px; cursor: pointer; }
.sb-booking-form { display: flex; flex-direction: column; gap: 10px; }
.sb-booking-form input { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--sb-border, #e2e8f0); background: var(--sb-surface, #fff); color: var(--sb-text, #0A192F); font-size: 13.5px; }
.sb-booking-success { display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 600; font-size: 14px; }

.sb-image { margin: 0; padding: 0 20px; }
.sb-image img { width: 100%; border-radius: 16px; display: block; }
.sb-image figcaption { font-size: 12px; color: var(--sb-text-muted, #64748b); text-align: center; margin-top: 8px; }
.sb-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 0 20px; }
.sb-gallery img { width: 100%; height: 140px; object-fit: cover; border-radius: 12px; }
.sb-video { padding: 0 20px; }
.sb-video iframe { width: 100%; aspect-ratio: 16/9; border-radius: 16px; border: none; }

.sb-hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; padding: 48px 24px; text-align: left !important; }
.sb-hero-split-text { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.sb-hero-split-media { display: flex; }
.sb-hero-split-media img { width: 100%; border-radius: 18px; object-fit: cover; aspect-ratio: 4/5; }
.sb-hero-split-placeholder { width: 100%; aspect-ratio: 4/5; border-radius: 18px; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; }
.sb-hero-minimal { display: flex; flex-direction: column; gap: 10px; padding: 40px 24px; background: var(--sb-bg, #fff); }
.sb-hero-minimal .sb-hero-headline { font-size: 26px; }

.sb-trust-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 28px; padding: 28px 20px; }
.sb-trust-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--sb-text-muted, #55677E); }
.sb-trust-badge svg { color: var(--brand); }

.sb-logos-strip { padding: 32px 20px; }
.sb-logos-row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 32px; }
.sb-logos-row img { height: 28px; object-fit: contain; opacity: 0.7; }

.sb-stats-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 36px; padding: 32px 20px; }
.sb-stat { text-align: center; }
.sb-stat b { display: block; font-family: var(--font-heading, inherit); font-size: 26px; font-weight: var(--heading-weight, 800); color: var(--brand-deep); }
.sb-stat span { font-size: 12.5px; color: var(--sb-text-muted, #55677E); }

.sb-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto; }
.sb-team-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.sb-team-card img { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; margin-bottom: 6px; }
.sb-team-avatar { width: 84px; height: 84px; border-radius: 50%; background: var(--tint); color: var(--brand); display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
.sb-team-card b { font-size: 13.5px; }
.sb-team-card span { font-size: 12px; color: var(--sb-text-muted, #55677E); }

.sb-about-story { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; padding: 40px 20px; }
.sb-about-story.reversed { direction: rtl; }
.sb-about-story.reversed > * { direction: ltr; }
.sb-about-media img { width: 100%; border-radius: 18px; object-fit: cover; aspect-ratio: 4/3; }
.sb-about-text p { font-size: 14px; line-height: 1.7; color: var(--sb-text-muted, #55677E); margin: 0; }

.sb-compare-wrap { overflow-x: auto; padding: 0 20px; }
.sb-compare-table { width: 100%; border-collapse: collapse; max-width: 640px; margin: 0 auto; }
.sb-compare-table th, .sb-compare-table td { padding: 12px; text-align: center; border-bottom: 1px solid var(--sb-border, #e2e8f0); font-size: 13px; }
.sb-compare-table th:first-child, .sb-compare-table td:first-child { text-align: left; font-weight: 600; }
.sb-compare-table .yes { color: #16a34a; }
.sb-compare-table .no { color: #cbd5e1; }

.sb-announcement { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 20px; font-size: 12.5px; font-weight: 600; text-align: center; }
.sb-announcement a { color: inherit; display: inline-flex; align-items: center; gap: 2px; text-decoration: underline; flex-shrink: 0; }

.sb-newsletter { text-align: center; padding: 36px 20px; }
.sb-newsletter-sub { font-size: 13px; color: var(--sb-text-muted, #55677E); margin: -10px 0 16px; }
.sb-newsletter-form { display: flex; gap: 8px; max-width: 360px; margin: 0 auto; }
.sb-newsletter-form input { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--sb-border, #e2e8f0); background: var(--sb-surface, #fff); color: var(--sb-text, #0A192F); font-size: 13.5px; }
.sb-newsletter-form button { padding: 10px 18px; border-radius: var(--button-radius, 999px); border: none; background: var(--brand); color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; }
.sb-newsletter-form button:disabled { opacity: 0.6; cursor: not-allowed; }
.sb-newsletter-done { display: flex; align-items: center; justify-content: center; gap: 6px; color: #15803d; font-weight: 600; font-size: 14px; }

.sb-menu-list { display: flex; flex-direction: column; gap: 16px; max-width: 640px; margin: 0 auto; padding: 0 20px; }
.sb-menu-item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.sb-menu-item-head b { font-size: 15px; }
.sb-menu-item-head em { font-style: normal; font-weight: 700; color: var(--brand-deep); }
.sb-menu-item p { margin: 4px 0 0; font-size: 12.5px; color: var(--sb-text-muted, #55677E); }

.sb-social-links { text-align: center; padding: 28px 20px; }
.sb-social-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.sb-social-row a { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--button-radius, 999px); background: var(--tint); color: var(--brand-deep); font-size: 12.5px; font-weight: 600; text-decoration: none; }

.sb-popup-placeholder { display: flex; align-items: center; gap: 10px; margin: 20px; padding: 14px; border: 1px dashed #cbd5e1; border-radius: 12px; color: var(--sb-text-muted, #64748b); }
.sb-popup-placeholder svg { color: var(--brand); flex-shrink: 0; }
.sb-popup-placeholder b { display: block; font-size: 13px; color: var(--sb-text-muted, #334155); }
.sb-popup-placeholder span { font-size: 11.5px; }
.sb-popup-overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(10,25,47,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
.sb-popup-card { position: relative; width: min(100%, 380px); background: var(--sb-surface, #fff); color: var(--sb-text, #0A192F); border-radius: 18px; padding: 28px 24px 24px; text-align: center; }
.sb-popup-card img { width: 100%; border-radius: 12px; margin-bottom: 14px; max-height: 160px; object-fit: cover; }
.sb-popup-card b { display: block; font-size: 17px; margin-bottom: 6px; }
.sb-popup-card p { font-size: 13px; color: var(--sb-text-muted, #64748b); margin: 0 0 16px; }
.sb-popup-close { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%; background: var(--tint); border: none; color: var(--sb-text-muted, #64748b); cursor: pointer; display: flex; align-items: center; justify-content: center; }
`;
