import { BusinessPersona } from './businessPersonas';

interface ClaimPageListing {
  name: string;
  categoryLabel: string;
  city: string | null;
  state: string | null;
}

export interface ClaimPageContent {
  intro: string;
  faqs: { question: string; answer: string }[];
}

export function getClaimPageContent(persona: BusinessPersona | undefined, listing: ClaimPageListing): ClaimPageContent {
  const groupLabel = (persona?.name || listing.categoryLabel).toLowerCase();
  const place = [listing.city, listing.state].filter(Boolean).join(', ');
  const areaLabel = listing.city || listing.state || 'your area';
  const personaSummary = persona?.summary || `${listing.categoryLabel} businesses selling directly to local customers.`;

  const intro = `${listing.name} shows up in Frontstore's directory as a ${groupLabel} business${place ? ` in ${place}` : ''}, `
    + `pulled from public map data rather than added by the owner. ${personaSummary} Once claimed, ${listing.name} gets a real storefront — `
    + `a product catalog, WhatsApp checkout, and a public page customers can order from directly, instead of just a name and pin on a map.`;

  const faqs = [
    {
      question: `Is ${listing.name} already selling on Frontstore?`,
      answer: `Not yet. This listing was imported from public map data to help ${groupLabel} businesses in ${areaLabel} get discovered — it isn't a live storefront until the real owner claims it.`,
    },
    {
      question: `How do I claim ${listing.name}?`,
      answer: `If a phone number or email is on file for this listing, click "Claim this business" and verify it with a one-time code — you'll have a working storefront in about 2 minutes. If no contact details are on file, you can submit ownership evidence (a business document, photo at the shop, or website ownership check) for manual review instead.`,
    },
    {
      question: `Does it cost anything to claim ${listing.name}?`,
      answer: `No — claiming is free, and so is the storefront it creates. Frontstore never charges to claim or list a business.`,
    },
    {
      question: `What if ${listing.name} isn't my business?`,
      answer: `Only claim a listing if you own or run it. If you spot wrong details — wrong name, closed business, duplicate listing — use "Report incorrect listing" below instead of claiming it.`,
    },
    {
      question: `What happens right after I claim it?`,
      answer: `${listing.name}'s name, category, and location carry over automatically into a new Frontstore storefront under your account. From there you can add products or services, set a logo, and start taking orders on WhatsApp immediately.`,
    },
  ];

  return { intro, faqs };
}
