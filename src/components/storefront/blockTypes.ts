import type { CSSProperties } from 'react';

export type BlockType =
  | 'section' | 'columns' | 'spacer' | 'divider'
  | 'hero' | 'product_grid' | 'featured_product' | 'categories'
  | 'digital_spotlight' | 'pricing_table'
  | 'booking'
  | 'whatsapp_cta' | 'testimonials' | 'faq' | 'countdown'
  | 'image' | 'gallery' | 'video'
  | 'trust_badges' | 'logos_strip'
  | 'stats_counters' | 'team' | 'about_story' | 'comparison_table'
  | 'announcement_bar' | 'newsletter'
  | 'menu'
  | 'social_links'
  | 'popup_trigger';

export interface BlockStyle {
  paddingY?: number;
  paddingX?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  display?: 'block' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: number;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
  background?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  animation?: 'none' | 'fade-in' | 'fade-up' | 'zoom-in';
}

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface BlockVisibility {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface SiteBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  style?: BlockStyle;
  responsiveStyle?: Partial<Record<'tablet' | 'mobile', Partial<BlockStyle>>>;
  visibility?: BlockVisibility;
  locked?: boolean;
}

export function isBlockHiddenOn(block: SiteBlock, device: Device): boolean {
  return block.visibility?.[device] === false;
}

export function resolveBlockStyle(block: SiteBlock, device: Device): BlockStyle {
  if (device === 'desktop') return block.style || {};
  return { ...(block.style || {}), ...(block.responsiveStyle?.[device] || {}) };
}

const SHADOW_VALUES: Record<string, string> = {
  sm: '0 1px 3px rgba(15,23,42,0.08)',
  md: '0 8px 20px -6px rgba(15,23,42,0.16)',
  lg: '0 20px 40px -12px rgba(15,23,42,0.28)',
};

/**
 * Inline style for the wrapper around a block's rendered content. Only the
 * desktop `style` is applied inline in the public render — tablet/mobile
 * overrides ship as CSS custom properties consumed by media queries in
 * SB_CSS, since inline styles can't express breakpoints.
 */
export function blockWrapperStyle(block: SiteBlock): CSSProperties {
  const s = block.style || {};
  const vars: Record<string, string> = {};
  const push = (key: string, val: number | string | undefined, unit = 'px') => {
    if (val !== undefined) vars[key] = `${val}${unit}`;
  };
  push('--sb-b-pad-y', s.paddingY);
  push('--sb-b-pad-x', s.paddingX);
  push('--sb-b-pt', s.paddingTop ?? s.paddingY);
  push('--sb-b-pr', s.paddingRight ?? s.paddingX);
  push('--sb-b-pb', s.paddingBottom ?? s.paddingY);
  push('--sb-b-pl', s.paddingLeft ?? s.paddingX);

  push('--sb-b-mt', s.marginTop);
  push('--sb-b-mr', s.marginRight);
  push('--sb-b-mb', s.marginBottom);
  push('--sb-b-ml', s.marginLeft);

  if (s.display) vars['--sb-b-display'] = s.display;
  if (s.flexDirection) vars['--sb-b-flex-dir'] = s.flexDirection;
  if (s.alignItems) vars['--sb-b-align-items'] = s.alignItems;
  if (s.justifyContent) vars['--sb-b-justify'] = s.justifyContent;
  push('--sb-b-gap', s.gap);

  if (s.fontFamily) vars['--sb-b-font-family'] = s.fontFamily;
  push('--sb-b-fs', s.fontSize);
  if (s.fontWeight) vars['--sb-b-fw'] = String(s.fontWeight);
  if (s.textAlign) vars['--sb-b-align'] = s.textAlign;
  if (s.textColor) vars['--sb-b-color'] = s.textColor;
  if (s.background) vars['--sb-b-bg'] = s.background;
  push('--sb-b-radius', s.borderRadius);
  push('--sb-b-bw', s.borderWidth);
  if (s.borderColor) vars['--sb-b-bc'] = s.borderColor;
  if (s.shadow && s.shadow !== 'none') vars['--sb-b-shadow'] = SHADOW_VALUES[s.shadow];

  const tablet = block.responsiveStyle?.tablet;
  if (tablet) {
    push('--sb-b-pad-y-t', tablet.paddingY);
    push('--sb-b-pad-x-t', tablet.paddingX);
    push('--sb-b-fs-t', tablet.fontSize);
    if (tablet.textAlign) vars['--sb-b-align-t'] = tablet.textAlign;
  }
  const mobile = block.responsiveStyle?.mobile;
  if (mobile) {
    push('--sb-b-pad-y-m', mobile.paddingY);
    push('--sb-b-pad-x-m', mobile.paddingX);
    push('--sb-b-fs-m', mobile.fontSize);
    if (mobile.textAlign) vars['--sb-b-align-m'] = mobile.textAlign;
  }

  return vars as CSSProperties;
}

export function blockWrapperClassName(block: SiteBlock): string {
  const classes = ['sb-block'];
  if (block.style && Object.keys(block.style).length > 0) classes.push('sb-block-styled');
  if (block.visibility?.desktop === false) classes.push('sb-hide-desktop');
  if (block.visibility?.tablet === false) classes.push('sb-hide-tablet');
  if (block.visibility?.mobile === false) classes.push('sb-hide-mobile');
  if (block.style?.animation && block.style.animation !== 'none') classes.push(`sb-anim-${block.style.animation}`);
  return classes.join(' ');
}

export interface BlockGroup {
  label: string;
  types: BlockType[];
}

export const BLOCK_GROUPS: BlockGroup[] = [
  { label: 'Layout', types: ['section', 'columns', 'spacer', 'divider'] },
  { label: 'Storefront', types: ['hero', 'product_grid', 'featured_product', 'categories'] },
  { label: 'Trust', types: ['trust_badges', 'logos_strip', 'testimonials'] },
  { label: 'Content', types: ['about_story', 'stats_counters', 'team', 'comparison_table', 'faq'] },
  { label: 'Marketing', types: ['announcement_bar', 'newsletter', 'whatsapp_cta', 'countdown', 'popup_trigger'] },
  { label: 'Restaurant', types: ['menu'] },
  { label: 'Course & creator', types: ['digital_spotlight', 'pricing_table', 'social_links'] },
  { label: 'Booking', types: ['booking'] },
  { label: 'Media', types: ['image', 'gallery', 'video'] },
];

export const BLOCK_LABELS: Record<BlockType, string> = {
  section: 'Section band',
  columns: 'Feature columns',
  spacer: 'Spacer',
  divider: 'Divider',
  hero: 'Hero banner',
  product_grid: 'Product grid',
  featured_product: 'Featured product',
  categories: 'Categories strip',
  digital_spotlight: 'Digital product spotlight',
  pricing_table: 'Pricing table',
  booking: 'Book a slot',
  whatsapp_cta: 'WhatsApp CTA',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  countdown: 'Countdown',
  image: 'Image',
  gallery: 'Gallery',
  video: 'Video',
  trust_badges: 'Trust badges',
  logos_strip: 'Brand logos strip',
  stats_counters: 'Stats & counters',
  team: 'Team',
  about_story: 'About / story',
  comparison_table: 'Comparison table',
  announcement_bar: 'Announcement bar',
  newsletter: 'Newsletter signup',
  menu: 'Menu',
  social_links: 'Social links',
  popup_trigger: 'Popup',
};

let counter = 0;
function blockId(type: BlockType): string {
  counter += 1;
  return `${type}-${Date.now().toString(36)}-${counter}`;
}

export function createDefaultBlock(type: BlockType): SiteBlock {
  const id = blockId(type);
  switch (type) {
    case 'section':
      return { id, type, data: { background: 'tint', height: 'md' } };
    case 'columns':
      return {
        id, type, data: {
          heading: 'Why shop with us',
          items: [
            { title: 'Fast delivery', text: 'Orders leave same day across the city.' },
            { title: 'Secure payment', text: 'Every order is protected until it arrives.' },
            { title: 'Real support', text: 'Chat us on WhatsApp any time you need help.' },
          ],
        },
      };
    case 'spacer':
      return { id, type, data: { size: 'md' } };
    case 'divider':
      return { id, type, data: {} };
    case 'hero':
      return {
        id, type, data: {
          eyebrow: '', headline: 'A headline your customers will remember',
          subheadline: 'Say what makes this store worth ordering from today.',
          ctaLabel: 'Chat to Order', background: 'navy', align: 'center', layout: 'centered', imageUrl: '',
        },
      };
    case 'product_grid':
      return { id, type, data: { heading: 'Best sellers', mode: 'all', limit: 6 } };
    case 'featured_product':
      return { id, type, data: { productId: '' } };
    case 'categories':
      return { id, type, data: { heading: 'Shop by category' } };
    case 'digital_spotlight':
      return { id, type, data: { productId: '', curriculumLabel: "What's included" } };
    case 'pricing_table':
      return {
        id, type, data: {
          heading: 'Pick your plan',
          tiers: [
            { name: 'Starter', price: '₦0', period: '', features: ['Access to free lessons'], ctaLabel: 'Start free' },
            { name: 'Pro', price: '₦15,000', period: '/course', features: ['Full curriculum', 'Certificate'], ctaLabel: 'Enroll now', highlighted: true },
          ],
        },
      };
    case 'booking':
      return { id, type, data: { productId: '', heading: 'Book a session' } };
    case 'whatsapp_cta':
      return { id, type, data: { heading: 'Questions before you order?', subtext: 'Usually replies in minutes', buttonLabel: 'Chat now', lineId: '' } };
    case 'testimonials':
      return { id, type, data: { heading: 'What customers say', mode: 'real' } };
    case 'faq':
      return { id, type, data: { heading: 'Frequently asked questions', mode: 'real' } };
    case 'countdown':
      return { id, type, data: { heading: 'Sale ends soon', endsAt: new Date(Date.now() + 86400000 * 3).toISOString(), expiredText: 'This offer has ended' } };
    case 'image':
      return { id, type, data: { url: '', caption: '' } };
    case 'gallery':
      return { id, type, data: { images: [] } };
    case 'video':
      return { id, type, data: { url: '' } };
    case 'trust_badges':
      return {
        id, type, data: {
          items: [
            { label: 'Secure payment', icon: 'shield' },
            { label: 'Fast delivery', icon: 'truck' },
            { label: 'Money-back guarantee', icon: 'badge' },
          ],
        },
      };
    case 'logos_strip':
      return { id, type, data: { heading: 'As seen with', logos: [] } };
    case 'stats_counters':
      return {
        id, type, data: {
          items: [
            { value: '500+', label: 'Orders delivered' },
            { value: '4.9★', label: 'Average rating' },
            { value: '24hr', label: 'Avg. response time' },
          ],
        },
      };
    case 'team':
      return { id, type, data: { heading: 'Meet the team', members: [{ name: 'Founder name', role: 'Founder', photoUrl: '' }] } };
    case 'about_story':
      return {
        id, type, data: {
          heading: 'Our story', body: 'Tell customers why you started and what makes this business different.',
          imageUrl: '', imagePosition: 'right',
        },
      };
    case 'comparison_table':
      return {
        id, type, data: {
          heading: 'Why choose us', columns: ['Us', 'Others'],
          rows: [
            { label: 'Same-day delivery', values: [true, false] },
            { label: 'WhatsApp support', values: [true, false] },
          ],
        },
      };
    case 'announcement_bar':
      return { id, type, data: { text: 'Free delivery on orders above ₦20,000 this week', ctaLabel: '', ctaLink: '', background: 'brand' } };
    case 'newsletter':
      return { id, type, data: { heading: 'Get updates on new drops', subtext: 'No spam, unsubscribe any time.', buttonLabel: 'Subscribe' } };
    case 'menu':
      return {
        id, type, data: {
          heading: 'Our menu',
          items: [
            { name: 'Jollof Rice & Chicken', price: '₦4,500', description: 'Smoky party jollof with grilled chicken.' },
            { name: 'Suya Platter', price: '₦3,000', description: 'Spiced skewers, onions and pepper.' },
          ],
        },
      };
    case 'social_links':
      return { id, type, data: { heading: 'Follow us', instagram: '', tiktok: '', twitter: '', facebook: '' } };
    case 'popup_trigger':
      return {
        id, type, data: {
          heading: 'Get 10% off your first order', subtext: 'Chat us on WhatsApp to claim it.',
          ctaLabel: 'Chat now', imageUrl: '',
          trigger: 'delay', delaySeconds: 8, scrollPercent: 50, dismissDays: 7,
        },
      };
    default:
      return { id, type, data: {} };
  }
}
