import React from 'react';
import type { Metadata } from 'next';
import PricingPageClient, { ApiPlanGroup } from '../PricingPageClient';

async function getPublicSettings() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
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
  const logoUrl = settings?.logo_url || 'https://frontstore.ng/icon.png';
  const rawDomain = settings?.system_domain || 'frontstore.ng';
  const systemDomain = rawDomain === 'frontstore.app' ? 'frontstore.ng' : rawDomain;

  const title = `Pricing – ${appName}`;
  const description = 'Free, Pro, and Business plans with no transaction fees, 14+ supported currencies, and payout speed that gets faster as your store earns trust.';
  const url = `https://${systemDomain}/pricing`;

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
          alt: `${appName} Pricing`,
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

async function getPlans(): Promise<ApiPlanGroup[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/plans`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching plans:', err);
    return [];
  }
}

export default async function PricingPage() {
  const plans = await getPlans();

  return <PricingPageClient plans={plans} />;
}
