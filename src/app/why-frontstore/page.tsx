import React from 'react';
import type { Metadata } from 'next';
import WhyFrontstoreClient from './WhyFrontstoreClient';

export const metadata: Metadata = {
  title: 'Why Choose Frontstore – The All-in-One Business & WhatsApp Storefront Platform',
  description:
    'Discover why 1,000+ modern merchants use Frontstore for instant WhatsApp storefronts, AI magic product creation, auto bookkeeping, and Paystack bank payouts.',
  alternates: { canonical: 'https://frontstore.ng/why-frontstore' },
  openGraph: {
    title: 'Why Choose Frontstore – Sell 10x Faster on WhatsApp',
    description:
      'Ditch manual DMs, paper notebooks, and fake payment alerts. Frontstore powers instant storefronts, AI listings, and automated bookkeeping.',
    url: 'https://frontstore.ng/why-frontstore',
    siteName: 'Frontstore',
    type: 'website',
  },
};

export default function WhyFrontstorePage() {
  return <WhyFrontstoreClient />;
}

