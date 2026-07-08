export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
}

export const FREE_TOOLS: ToolDefinition[] = [
  {
    slug: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    tagline: 'Find your profit and margin from cost price and selling price.',
    metaTitle: 'Free Profit Margin Calculator for Nigerian Sellers – Frontstore',
    metaDescription: 'Calculate profit, profit margin, and markup instantly from your cost price and selling price. Built for WhatsApp and social media sellers in Nigeria.',
  },
  {
    slug: 'selling-price-calculator',
    name: 'Selling Price Calculator',
    tagline: 'Work out what to charge to hit your target profit margin.',
    metaTitle: 'Selling Price Calculator – What to Charge for a Target Margin | Frontstore',
    metaDescription: 'Enter your cost price and desired profit margin to find the exact selling price to charge. Free calculator for African merchants.',
  },
  {
    slug: 'break-even-calculator',
    name: 'Break-Even Calculator',
    tagline: 'See how many units you need to sell before you start making profit.',
    metaTitle: 'Break-Even Calculator for Small Businesses – Frontstore',
    metaDescription: 'Calculate your break-even point in units and revenue from fixed costs, price per unit, and variable cost per unit.',
  },
  {
    slug: 'vat-calculator',
    name: 'Nigeria VAT Calculator',
    tagline: 'Add or remove 7.5% VAT from any amount in seconds.',
    metaTitle: 'Nigeria VAT Calculator (7.5%) – Add or Remove VAT | Frontstore',
    metaDescription: 'Free VAT calculator for Nigeria. Add 7.5% VAT to a price or extract the VAT already included in a price, instantly.',
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return FREE_TOOLS.find((t) => t.slug === slug);
}
