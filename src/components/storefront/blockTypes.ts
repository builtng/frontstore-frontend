export type BlockType =
  | 'section' | 'columns' | 'spacer' | 'divider'
  | 'hero' | 'product_grid' | 'featured_product' | 'categories'
  | 'digital_spotlight' | 'pricing_table'
  | 'booking'
  | 'whatsapp_cta' | 'testimonials' | 'faq' | 'countdown'
  | 'image' | 'gallery' | 'video';

export interface SiteBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

export interface BlockGroup {
  label: string;
  types: BlockType[];
}

export const BLOCK_GROUPS: BlockGroup[] = [
  { label: 'Layout', types: ['section', 'columns', 'spacer', 'divider'] },
  { label: 'Storefront', types: ['hero', 'product_grid', 'featured_product', 'categories'] },
  { label: 'Course & creator', types: ['digital_spotlight', 'pricing_table'] },
  { label: 'Booking', types: ['booking'] },
  { label: 'Engagement', types: ['whatsapp_cta', 'testimonials', 'faq', 'countdown'] },
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
          ctaLabel: 'Chat to Order', background: 'brand', align: 'center',
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
      return { id, type, data: { heading: 'Questions before you order?', subtext: 'Usually replies in minutes', buttonLabel: 'Chat now' } };
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
    default:
      return { id, type, data: {} };
  }
}
