import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

async function getPublicSettings() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/settings`, {
      next: { revalidate: 60 }, // Cache settings for 60 seconds
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching public settings:', err);
    return null;
  }
}

// ── SEO & Platform Metadata ──────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const appName = settings?.app_name || 'Aloaye';
  const logoUrl = settings?.logo_url || 'https://aloaye.tech/icon.png';
  const systemDomain = settings?.system_domain || 'aloaye.tech';

  const title = `${appName} — Conversational Commerce Platform`;
  const description = "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.";
  const url = `https://${systemDomain}`;

  return {
    title,
    description,
    keywords: [
      "WhatsApp commerce", "conversational commerce", "African e-commerce", "digital catalog", "mobile store",
      "sell on WhatsApp", `${appName.toLowerCase()} store`, "online store Africa",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: appName,
      title,
      description,
      url,
      images: [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: `${appName} — Conversational Commerce Platform for Africa`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function HomePage() {
  const settings = await getPublicSettings();
  const appName = settings?.app_name || 'Aloaye';
  const logoUrl = settings?.logo_url || 'https://aloaye.tech/icon.png';
  const systemDomain = settings?.system_domain || 'aloaye.tech';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': appName,
    'url': `https://${systemDomain}`,
    'logo': logoUrl,
    'description': 'Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient initialSettings={settings} />
    </>
  );
}
