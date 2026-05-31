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
    canonical: 'https://frontstore.app/blog',
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "frontstore",
    title: "Seller Growth Blog — WhatsApp Commerce & Retail Guides | frontstore",
    description:
      "Grow your retail business on WhatsApp. Discover expert guides, catalog marketing tips, and localized growth strategies for merchants in Lagos, Nairobi, Accra, and Johannesburg.",
    url: 'https://frontstore.app/blog',
    images: [
      {
        url: 'https://frontstore.app/icon.png',
        width: 512,
        height: 512,
        alt: 'frontstore Seller Growth Blog',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seller Growth Blog — WhatsApp Commerce & Retail Guides | frontstore",
    description: "Grow your business on WhatsApp with localized African e-commerce guides.",
    images: ['https://frontstore.app/icon.png'],
  },
};

// ── Injected Schema.org Structured Data (JSON-LD) ───────────────────────────
const blogHubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  'name': 'frontstore Seller Growth Blog',
  'description': 'Grow your retail business on WhatsApp. Discover expert guides, catalog marketing tips, and localized growth strategies for African merchants.',
  'url': 'https://frontstore.app/blog',
  'publisher': {
    '@type': 'Organization',
    'name': 'frontstore Technologies',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://frontstore.app/icon.png'
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
