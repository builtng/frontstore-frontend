import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

// ── SEO & Platform Metadata ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "aloaye — Africa's WhatsApp Commerce Platform",
  description:
    "Create a stunning mobile storefront in under 2 minutes and sell directly via WhatsApp. Built for African small businesses.",
  keywords: [
    "WhatsApp commerce", "African e-commerce", "digital catalog", "mobile store",
    "small business Nigeria", "sell on WhatsApp", "Africa shops", "WhatsApp store",
    "online store Africa", "ecommerce Nigeria", "ecommerce Ghana", "ecommerce Kenya",
    "sell online Africa", "digital storefront", "WhatsApp business", "micro business Africa",
    "aloaye", "aloaye store",
  ],
  alternates: {
    canonical: 'https://aloaye.tech',
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "aloaye",
    title: "aloaye — Africa's WhatsApp Commerce Platform",
    description:
      "Create a stunning mobile storefront in under 2 minutes and sell directly via WhatsApp. Built for African small businesses.",
    url: 'https://aloaye.tech',
    images: [
      {
        url: 'https://aloaye.tech/icon.png',
        width: 512,
        height: 512,
        alt: 'aloaye — WhatsApp Commerce Platform for Africa',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "aloaye — Africa's WhatsApp Commerce Platform",
    description: "Sell to anyone on WhatsApp, instantly. No technical setup required.",
    images: ['https://aloaye.tech/icon.png'],
  },
};

// ── JSON-LD Structured Business Schema ───────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'aloaye',
  'url': 'https://aloaye.tech',
  'logo': 'https://aloaye.tech/icon.png',
  'description': 'Create a stunning mobile storefront in under 2 minutes and sell directly via WhatsApp. Built for African small businesses.',
  'applicationCategory': 'BusinessApplication',
  'operatingSystem': 'All',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD'
  }
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
