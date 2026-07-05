import React from 'react';
import type { Metadata } from 'next';
import BusinessPageClient from '../BusinessPageClient';

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

  const title = `${appName} for Business - Conversational Commerce Platform`;
  const description = 'Build a beautiful online store, accept orders, manage customers, and grow your business from a single WhatsApp-first platform.';
  const url = `https://${systemDomain}/business`;

  return {
    title,
    description,
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
          alt: `${appName} for Business`,
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

export default async function BusinessPage() {
  const settings = await getPublicSettings();

  return <BusinessPageClient initialSettings={settings} />;
}
