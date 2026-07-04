export interface CompareMerchant {
  rank: number;
  store: {
    username: string;
    store_name: string;
    logo_url: string | null;
    location: string | null;
    currency_code: string;
    delivery_info: string | null;
    whatsapp_phone: string;
  };
  product_slug: string;
  price: number;
  compare_at_price: number | null;
  rating: number | null;
  review_count: number;
  is_verified: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  suspicious_price: boolean;
  score: number;
  badges: string[];
}

export interface CompareData {
  product: {
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    category: { id: string; name: string; slug: string } | null;
  };
  location: {
    state: string;
    state_slug: string;
    city: string | null;
    city_slug: string | null;
    lga: string | null;
    lga_slug: string | null;
  };
  merchants: CompareMerchant[];
  insights: {
    average_price: number;
    lowest_price: number;
    highest_price: number;
    price_spread: number;
    savings_vs_highest: number;
    merchant_count: number;
    currency_code: string;
  };
  generated_at: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$', GBP: '£',
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] || `${code} `;
}

export function formatPrice(amount: number, currencyCode: string): string {
  const symbol = currencySymbol(currencyCode);
  return `${symbol}${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(amount)}`;
}

/** Most specific named location: LGA > city > state. */
export function locationLabel(loc: CompareData['location']): string {
  return loc.lga || loc.city || loc.state;
}

export function locationBreadcrumb(loc: CompareData['location']): string {
  return [loc.lga, loc.city, loc.state].filter(Boolean).join(', ');
}

export async function getComparisonData(
  productSlug: string,
  locationSegments: string[]
): Promise<CompareData | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  const path = [productSlug, ...locationSegments].map(encodeURIComponent).join('/');

  try {
    const res = await fetch(`${API_URL}/v1/public/compare/${path}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data as CompareData;
  } catch (err) {
    console.error('Error fetching price comparison data:', err);
    return null;
  }
}
