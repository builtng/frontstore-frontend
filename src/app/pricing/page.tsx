import React from 'react';
import type { Metadata } from 'next';
import PricingPageClient from '../PricingPageClient';

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
  const description = 'Free, Pro, and Legend plans with no transaction fees, 14+ supported currencies, and payout speed that gets faster as your store earns trust.';
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

function formatNaira(raw: unknown, fallback: string): string {
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num.toLocaleString('en-NG') : fallback;
}

export default async function PricingPage() {
  const settings = await getPublicSettings();
  const monthlyPrice = formatNaira(settings?.pro_monthly_price, '2,000');
  const yearlyPrice = formatNaira(settings?.pro_yearly_price, '20,000');
  const legendMonthlyPrice = formatNaira(settings?.legend_monthly_price, '7,000');
  const legendYearlyPrice = formatNaira(settings?.legend_yearly_price, '70,000');

  return (
    <PricingPageClient
      monthlyPrice={monthlyPrice}
      yearlyPrice={yearlyPrice}
      legendMonthlyPrice={legendMonthlyPrice}
      legendYearlyPrice={legendYearlyPrice}
    />
  );
}
