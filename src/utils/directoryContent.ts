import { BusinessPersona } from './businessPersonas';

interface StateLike {
  slug: string;
  name: string;
}

/** Legacy/duplicate business_persona values that map onto a current persona id. */
export const PERSONA_ALIASES: Record<string, string> = {
  'fashion-clothing': 'fashion-apparel',
  'gadgets-and-repairs': 'tech-store',
  'thrift-preloved': 'thrift-store',
  'restaurant-bars': 'food-vendor',
};

export function normalizePersonaId(rawPersona: string | null | undefined): string | null {
  if (!rawPersona) return null;
  return PERSONA_ALIASES[rawPersona] || rawPersona;
}

/** Loose match: a store's free-text location matches a state if it mentions the state name (or a known alias). */
const STATE_ALIASES: Record<string, string[]> = {
  'fct-abuja': ['abuja', 'fct'],
};

export function locationMatchesState(location: string | null | undefined, state: StateLike): boolean {
  if (!location) return false;
  const loc = location.toLowerCase();
  const aliases = STATE_ALIASES[state.slug] || [state.name.toLowerCase()];
  return aliases.some((alias) => loc.includes(alias));
}

export interface DirectoryContent {
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  guideBullets: string[];
  faqs: { question: string; answer: string }[];
}

export function getDirectoryContent(
  persona: BusinessPersona,
  state: StateLike,
  storeCount: number
): DirectoryContent {
  const catalogWord = persona.catalogLabel;
  const groupLabel = persona.name.toLowerCase();

  const metaTitle = `${persona.name} Sellers in ${state.name} | Frontstore`;
  const metaDescription = storeCount > 0
    ? `Browse ${storeCount} ${groupLabel} seller${storeCount === 1 ? '' : 's'} in ${state.name} on Frontstore. Order directly on WhatsApp — no middlemen.`
    : `Find ${groupLabel} sellers in ${state.name} on Frontstore. Every store on this list takes orders directly on WhatsApp.`;

  const headline = `${persona.name} in ${state.name}`;

  const intro = storeCount > 0
    ? `${persona.summary} Below are ${storeCount} verified ${groupLabel} store${storeCount === 1 ? '' : 's'} operating out of ${state.name}, each running their own Frontstore storefront with WhatsApp checkout built in — no marketplace commission, no middleman.`
    : `${persona.summary} Frontstore doesn't yet have a ${groupLabel} store listed with ${state.name} as their location, but new stores join every week. Check the full ${persona.name.toLowerCase()} directory below or explore other categories in ${state.name}.`;

  const guideBullets = [
    `Confirm the seller's exact base within ${state.name} and whether they deliver to your area or require pickup.`,
    `Ask about ${catalogWord} availability and lead time directly on WhatsApp before paying — stock changes faster than any directory can track.`,
    `Look for the "Verified Seller" badge — Frontstore checks a merchant's identity documents before granting it.`,
    `Compare more than one seller where possible; price and turnaround time both vary within the same city.`,
  ];

  const faqs = [
    {
      question: `How many ${groupLabel} sellers are on Frontstore in ${state.name}?`,
      answer: storeCount > 0
        ? `There are currently ${storeCount} ${groupLabel} store${storeCount === 1 ? '' : 's'} on Frontstore listing ${state.name} as their base. This list updates automatically as new merchants join and set their location.`
        : `None yet have ${state.name} set as their location, but the ${persona.name.toLowerCase()} category is active across other states — check the full directory or check back soon.`,
    },
    {
      question: `How do I order from a ${groupLabel} seller in ${state.name}?`,
      answer: `Open the seller's storefront, add what you want to your order, and checkout — it opens a pre-filled WhatsApp message straight to the seller with your order details. No app download or account needed.`,
    },
    {
      question: `Are sellers on this page verified?`,
      answer: `Some are — look for the "Verified Seller" badge, which Frontstore only grants after checking a merchant's identity documents. Unverified sellers can still be legitimate; use normal buyer caution either way.`,
    },
    {
      question: `Can I sell as a ${groupLabel} business in ${state.name} on Frontstore?`,
      answer: `Yes — signing up takes under 2 minutes, and choosing the "${persona.name}" business type sets up your storefront, catalog labels, and checkout flow for you automatically.`,
    },
  ];

  return { metaTitle, metaDescription, headline, intro, guideBullets, faqs };
}
