import { CompareData, formatPrice, locationLabel } from './compareData';

const FAST_DELIVERY_KEYWORDS = ['same day', 'same-day', '24 hour', '24-hour', 'next day', 'next-day', 'instant'];

function mentionsFastDelivery(text: string | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FAST_DELIVERY_KEYWORDS.some((k) => lower.includes(k));
}

export function buildAboutContent(data: CompareData): string {
  const { product, location, insights, merchants } = data;
  const loc = locationLabel(location);
  const categoryName = product.category?.name || 'this category';
  const recommended = merchants[0];

  const opener = product.description
    ? product.description.trim().replace(/\s+/g, ' ')
    : `${product.name} is one of the ${categoryName.toLowerCase()} products shoppers in ${loc} search for most, sold here by verified local sellers rather than a single retailer.`;

  const marketParagraph = `Right now, ${insights.merchant_count} stores in ${loc} carry ${product.name}, with prices ranging from ${formatPrice(insights.lowest_price, insights.currency_code)} to ${formatPrice(insights.highest_price, insights.currency_code)}. That spread usually comes down to differences in seller overhead, stock sourcing, and bundled extras like delivery or after-sales support, not just markup — so it's worth checking what each price includes before deciding.`;

  const adviceParagraph = `If you're buying in ${loc}, weigh price alongside how established the seller is: ${recommended.store.store_name} currently offers the strongest overall combination of price, buyer trust, and availability among sellers we track here. Confirm stock and delivery timing directly with the seller before paying, especially for time-sensitive purchases.`;

  return [opener, marketParagraph, adviceParagraph].join(' ');
}

export function buildBuyingGuide(data: CompareData): string[] {
  const { location, merchants } = data;
  const loc = locationLabel(location);
  const anyVerified = merchants.some((m) => m.is_verified);

  const guide = [
    `Ask about warranty or return terms before paying — policies vary by seller and aren't always listed upfront.`,
    `Confirm the seller can actually deliver to your part of ${loc}, and get a delivery timeframe in writing before you pay.`,
    `Check seller reputation: prior reviews and order count are a better trust signal than price alone.`,
    `Verify product authenticity, especially for electronics and branded goods — ask for proof of purchase or original packaging.`,
  ];

  if (anyVerified) {
    guide.push(`Prefer sellers with a "Verified Seller" badge where possible — Frontstore verifies these merchants' identity documents before granting the badge.`);
  }

  guide.push(`Compare total cost, not just the sticker price — factor in delivery fees and any mobile transaction charges the seller quotes.`);

  return guide;
}

export function buildFaqs(data: CompareData): { question: string; answer: string }[] {
  const { product, location, insights, merchants } = data;
  const loc = locationLabel(location);
  const cheapest = merchants.find((m) => m.price === insights.lowest_price) || merchants[0];
  const recommended = merchants[0];

  const fastDeliverySellers = merchants.filter((m) => mentionsFastDelivery(m.store.delivery_info));

  const deliveryAnswer = fastDeliverySellers.length > 0
    ? `Yes — ${fastDeliverySellers.map((m) => m.store.store_name).join(', ')} mention fast or same-day delivery in ${loc}. Confirm the exact timing with the seller when you place your order.`
    : `Delivery speed varies by seller in ${loc}. None of the listed stores currently advertise guaranteed same-day delivery, so confirm timing directly with the seller before ordering.`;

  return [
    {
      question: `What is the cheapest ${product.name} in ${loc}?`,
      answer: `The lowest price we found is ${formatPrice(insights.lowest_price, insights.currency_code)} at ${cheapest.store.store_name}. Always confirm the price and stock with the seller before paying, since listings can change.`,
    },
    {
      question: `Which store sells ${product.name} near ${loc}?`,
      answer: `${recommended.store.store_name} is our top recommendation in ${loc}, based on a combination of price, ratings, verification status, and stock availability — not price alone.`,
    },
    {
      question: `Is ${product.name} available for same-day delivery in ${loc}?`,
      answer: deliveryAnswer,
    },
    {
      question: `How often are prices updated on this page?`,
      answer: `Prices are pulled directly from each seller's live store and refresh automatically as they update their listings, so figures here reflect current, not historical, pricing.`,
    },
    {
      question: `Can I compare multiple stores for ${product.name}?`,
      answer: `Yes — this page currently tracks ${insights.merchant_count} stores selling ${product.name} in ${loc}, ranked by price, rating, verification, and availability.`,
    },
  ];
}
