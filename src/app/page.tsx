import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

// ── SEO & Platform Metadata ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Aloaye — Conversational Commerce Platform",
  description:
    "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.",
  keywords: [
    "WhatsApp commerce", "conversational commerce", "African e-commerce", "digital catalog", "mobile store",
    "small business Nigeria", "sell on WhatsApp", "Africa shops", "WhatsApp store",
    "online store Africa", "ecommerce Nigeria", "ecommerce Ghana", "ecommerce Kenya",
    "sell online Africa", "digital storefront", "WhatsApp business", "micro business Africa",
    "Aloaye", "Aloaye store", "African commerce infrastructure", "WhatsApp CRM",
  ],
  alternates: {
    canonical: 'https://aloaye.tech',
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Aloaye",
    title: "Aloaye — Conversational Commerce Platform",
    description:
      "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.",
    url: 'https://aloaye.tech',
    images: [
      {
        url: 'https://aloaye.tech/icon.png',
        width: 512,
        height: 512,
        alt: 'Aloaye — Conversational Commerce Platform for Africa',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aloaye — Conversational Commerce Platform",
    description: "Turn WhatsApp conversations into sales. Build a beautiful store and grow your business.",
    images: ['https://aloaye.tech/icon.png'],
  },
};

// ── JSON-LD Structured Business Schema ───────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'Aloaye',
  'url': 'https://aloaye.tech',
  'logo': 'https://aloaye.tech/icon.png',
  'description': 'Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.',
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
