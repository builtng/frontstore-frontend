// Shared currency/number formatting — moved out of dashboard/page.tsx so
// extracted tab components can format money without importing the monolith.

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  USD: '$',
  GBP: '£',
};

export const getCurrencySymbol = (code?: string): string => {
  if (!code) return CURRENCY_SYMBOLS['NGN'];
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? `${code} `;
};

// Orders may have been placed in a different currency than the store currently
// operates in (e.g. the merchant switched currency after taking orders). The
// backend converts these into `display_amount`/`display_currency` — fall back
// to the raw amount when that's not present (e.g. cached/older order payloads).
export const getOrderDisplayAmount = (
  order: { total_amount: number | string; currency_code?: string | null; display_amount?: number | string; display_currency?: string | null },
  storeCurrency?: string,
) => {
  const amount = order.display_amount ?? order.total_amount;
  const currency = order.display_currency ?? order.currency_code ?? storeCurrency;
  return { symbol: getCurrencySymbol(currency || undefined), amount };
};

export const formatVal = (val: number | string | null | undefined) => {
  if (val === null || val === undefined) return '—';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? '—' : num.toLocaleString();
};
