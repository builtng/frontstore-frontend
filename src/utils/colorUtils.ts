export const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  black: '#000000',
  white: '#ffffff',
  green: '#10b981',
  yellow: '#eab308',
  pink: '#ec4899',
  purple: '#8b5cf6',
  orange: '#f97316',
  grey: '#64748b',
  gray: '#64748b',
  navy: '#1e3a8a',
  gold: '#d97706',
  silver: '#cbd5e1',
  teal: '#14b8a6',
  maroon: '#800000',
  beige: '#f5f5dc',
  brown: '#78350f',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  lime: '#84cc16',
  amber: '#f59e0b',
  violet: '#7c3aed',
  cream: '#fffdd0',
  bronze: '#cd7f32',
  copper: '#b87333',
  peach: '#ffdab9',
  khaki: '#c3b091',
  mint: '#98ff98',
  olive: '#808000',
  burgundy: '#800020',
};

export function getColorHex(colorStr: string | null | undefined): string | null {
  if (!colorStr) return null;
  const trimmed = colorStr.trim();
  if (trimmed.startsWith('#')) return trimmed;

  const hexMatch = trimmed.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
  if (hexMatch) return hexMatch[0];

  const cleanName = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (cleanName === key || cleanName.includes(key)) return hex;
  }

  return null;
}
