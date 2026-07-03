import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const appName = settings?.app_name || 'Frontstore';
  const logoUrl = settings?.logo_url || 'https://frontstore.app/icon.png';
  const systemDomain = settings?.system_domain || 'frontstore.app';

  const title = `${appName} - Conversational Commerce Engine for Africa`;
  const description = `Build your store in under 2 minutes. Automate order taking, handle checkout inside WhatsApp, and manage payments and delivery with ${appName}.`;
  const url = `https://${systemDomain}`;

  return {
    title,
    description,
    keywords: [
      `${appName}`,
      'conversational commerce',
      'African businesses',
      'WhatsApp stores',
      'WhatsApp checkout',
      'SME platform Africa',
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
          alt: `${appName} - Conversational Commerce Platform`,
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

export default async function HomePage() {
  const settings = await getPublicSettings();

  const appName = settings?.app_name || 'Frontstore';
  const systemDomain = settings?.system_domain || 'frontstore.app';
  const logoUrl = settings?.logo_url || `https://${systemDomain}/icon.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appName,
    url: `https://${systemDomain}`,
    logo: logoUrl,
    description: `The conversational commerce engine for Africa.`,
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
