export interface ShippingSettings {
  shipping_type?: string | null;
  shipping_flat_fee?: number | string | null;
  shipping_free_threshold?: number | string | null;
  shipping_handling_fee?: number | string | null;
  shipping_custom_rules?: { min_subtotal: number | string; fee: number | string }[] | null;
}

export interface ShippingFeeResult {
  shippingFee: number;
  handlingFee: number;
  total: number;
}

const num = (v: number | string | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Mirrors ShippingFeeCalculator on the backend so the checkout preview matches
 * what the order will actually be charged. The backend remains authoritative —
 * this is a preview only, computed client-side to show the fee before submit.
 */
export function calculateShippingFee(store: any, subtotal: number): ShippingFeeResult {
  const type = store?.shipping_type || 'customer_pays';
  const handlingFee = num(store?.shipping_handling_fee);
  let shippingFee = 0;

  if (type === 'free') {
    shippingFee = 0;
  } else if (type === 'free_above_threshold') {
    shippingFee = subtotal >= num(store?.shipping_free_threshold) ? 0 : num(store?.shipping_flat_fee);
  } else if (type === 'custom') {
    const rules = (store?.shipping_custom_rules || [])
      .map((r: any) => ({ min_subtotal: num(r.min_subtotal), fee: num(r.fee) }))
      .sort((a: { min_subtotal: number }, b: { min_subtotal: number }) => a.min_subtotal - b.min_subtotal);
    const matched = [...rules].reverse().find((r: { min_subtotal: number }) => subtotal >= r.min_subtotal);
    shippingFee = matched ? matched.fee : num(store?.shipping_flat_fee);
  } else {
    // 'customer_pays' and 'flat_rate' both charge the merchant's configured fee.
    shippingFee = num(store?.shipping_flat_fee);
  }

  return {
    shippingFee,
    handlingFee,
    total: subtotal + shippingFee + handlingFee,
  };
}
