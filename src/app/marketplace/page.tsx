import React from 'react';
import type { Metadata } from 'next';
import MarketplaceHomeClient from '../MarketplaceHomeClient';

async function getPublicSettings() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching public settings:', err);
    return null;
  }
}

async function getMarketplaceData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/marketplace`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { products: [], categories: [], stores: [] };
    }
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching marketplace data:', err);
    return { products: [], categories: [], stores: [] };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const appName = settings?.app_name || 'Frontstore';
  const logoUrl = settings?.logo_url || 'https://frontstore.app/icon.png';
  const systemDomain = settings?.system_domain || 'frontstore.app';

  const title = `${appName} Marketplace - Shop Products from Local Businesses`;
  const description = `Discover products uploaded by businesses on ${appName}. Browse by category, see the business behind each product, and shop directly from trusted storefronts.`;
  const url = `https://${systemDomain}/marketplace`;

  return {
    title,
    description,
    keywords: [
      `${appName} marketplace`,
      'online marketplace',
      'African businesses',
      'shop local businesses',
      'WhatsApp stores',
      'product discovery',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      siteName: appName,
      title,
      description,
      url,
      images: [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: `${appName} Marketplace`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function MarketplacePage() {
  const [settings, marketplaceData] = await Promise.all([
    getPublicSettings(),
    getMarketplaceData(),
  ]);

  const appName = settings?.app_name || 'Frontstore';
  const systemDomain = settings?.system_domain || 'frontstore.app';
  const logoUrl = settings?.logo_url || `https://${systemDomain}/icon.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${appName} Marketplace`,
    url: `https://${systemDomain}/marketplace`,
    logo: logoUrl,
    description: `Discover products uploaded by businesses on ${appName}.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://${systemDomain}/marketplace?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketplaceHomeClient initialData={marketplaceData} initialSettings={settings} />
    </>
  );
}
