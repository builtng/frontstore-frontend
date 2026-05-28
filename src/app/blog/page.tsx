import React from 'react';
import type { Metadata } from 'next';
import BlogListingClient from './BlogListingClient';

// ── Master SEO Metadata for Blog Hub ──────────────────────────────────────────
export const metadata: Metadata = {
  title: "Seller Growth Blog — WhatsApp Commerce & Retail Guides",
  description:
    "Grow your retail business on WhatsApp. Discover expert guides, catalog marketing tips, and localized growth strategies for merchants in Lagos, Nairobi, Accra, and Johannesburg.",
  keywords: [
    "WhatsApp commerce blog", "African retail guides", "digital catalog tips",
    "Lagos small business blog", "Nairobi M-Pesa business guides", "sell on WhatsApp Africa",
    "e-commerce strategies Nigeria", "Ghana online retail", "South Africa small business guides"
  ],
  alternates: {
    canonical: 'https://aloaye.tech/blog',
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "aloaye",
    title: "Seller Growth Blog — WhatsApp Commerce & Retail Guides | aloaye",
    description:
      "Grow your retail business on WhatsApp. Discover expert guides, catalog marketing tips, and localized growth strategies for merchants in Lagos, Nairobi, Accra, and Johannesburg.",
    url: 'https://aloaye.tech/blog',
    images: [
      {
        url: 'https://aloaye.tech/icon.png',
        width: 512,
        height: 512,
        alt: 'aloaye Seller Growth Blog',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seller Growth Blog — WhatsApp Commerce & Retail Guides | aloaye",
    description: "Grow your business on WhatsApp with localized African e-commerce guides.",
    images: ['https://aloaye.tech/icon.png'],
  },
};

// ── Injected Schema.org Structured Data (JSON-LD) ───────────────────────────
const blogHubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  'name': 'aloaye Seller Growth Blog',
  'description': 'Grow your retail business on WhatsApp. Discover expert guides, catalog marketing tips, and localized growth strategies for African merchants.',
  'url': 'https://aloaye.tech/blog',
  'publisher': {
    '@type': 'Organization',
    'name': 'aloaye Technologies',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://aloaye.tech/icon.png'
    }
  }
};

export default function BlogHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogHubJsonLd) }}
      />
      <BlogListingClient />
    </>
  );
}
