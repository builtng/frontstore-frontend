import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getStoreData(username: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/store/${username}`, {
      next: { revalidate: 60 }, // Cache store details for 60 seconds
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching store data for metadata (${username}):`, err);
    return null;
  }
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  if (!text || text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return fallback;
  return text;
}

function safePathSegment(value: unknown): string {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (!text || text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return '';
  return text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getStoreData(username);
  
  if (!data || !data.store) {
    return {
      title: "Store Not Found | Frontstore",
      description: "The storefront you are looking for does not exist on Frontstore.",
    };
  }

  if (data.store.store_template === 'coming-soon') {
    const rawName = safeText(data.store.store_name || username, 'Store');
    const storeName = rawName.includes('-') || rawName.includes('_') || rawName === rawName.toLowerCase()
      ? rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : rawName;
    const appName = safeText(data.app_name, 'Frontstore');
    return {
      title: `${storeName} | Launching Soon`,
      description: `Get ready for ${storeName} on ${appName}. Browse and order products directly inside WhatsApp coming soon.`,
    };
  }

  const { store } = data;
  const rawDomain = data.system_domain || 'frontstore.ng';
  const systemDomain = rawDomain === 'frontstore.app' ? 'frontstore.ng' : rawDomain;
  const appName = safeText(data.app_name, 'Front Store');
  const routeUsername = safePathSegment(username);
  const storeUsername = safePathSegment(store.username) || routeUsername;
  const rawStoreName = safeText(store.store_name, storeUsername || 'Store');
  const storeName = rawStoreName.includes('-') || rawStoreName.includes('_') || rawStoreName === rawStoreName.toLowerCase()
    ? rawStoreName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : rawStoreName;
  const title = `${storeName} | Shop on ${appName}`;
  const description = safeText(store.store_bio, `Shop directly from ${storeName} on WhatsApp. Browse products and place orders instantly.`);
  const logo = store.logo_url || data.logo_url || `https://${systemDomain}/icon.png`;
  const url = `https://${systemDomain}/${storeUsername}`;

  return {
    title,
    description,
    keywords: [storeName, 'WhatsApp commerce', 'WhatsApp storefront', `${appName.toLowerCase()} store`, 'online shop', 'conversational commerce'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: appName,
      images: [
        {
          url: logo,
          width: 500,
          height: 500,
          alt: `${storeName} Logo`,
        },
      ],
      type: 'website',
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [logo],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const data = await getStoreData(username);
  
  if (!data || !data.store) {
    return notFound();
  }

  // Inject Google Schema.org structured data (JSON-LD)
  const rawDomain = data?.system_domain || 'frontstore.ng';
  const systemDomain = rawDomain === 'frontstore.app' ? 'frontstore.ng' : rawDomain;
  const routeUsername = safePathSegment(username);
  const storeUsername = safePathSegment(data?.store?.username) || routeUsername;
  const rawStoreName = safeText(data?.store?.store_name, storeUsername || 'Store');
  const storeName = rawStoreName.includes('-') || rawStoreName.includes('_') || rawStoreName === rawStoreName.toLowerCase()
    ? rawStoreName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : rawStoreName;
  const storeReviews: Array<{ rating: number }> = Array.isArray(data.reviews) ? data.reviews : [];
  const validReviews = storeReviews.filter((r) => Number.isFinite(r.rating) && r.rating > 0);
  const aggregateRating = validReviews.length > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: (validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1),
    reviewCount: validReviews.length,
  } : undefined;

  const sameAs = [
    data.store.instagram_handle ? `https://instagram.com/${safePathSegment(data.store.instagram_handle).replace(/^@/, '')}` : null,
    data.store.tiktok_handle ? `https://tiktok.com/@${safePathSegment(data.store.tiktok_handle).replace(/^@/, '')}` : null,
    data.store.twitter_handle ? `https://x.com/${safePathSegment(data.store.twitter_handle).replace(/^@/, '')}` : null,
  ].filter(Boolean);

  const storeUrl = `https://${systemDomain}/${storeUsername}`;

  const jsonLd = data && data.store ? {
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': storeName,
    'description': safeText(data.store.store_bio, '') || undefined,
    'url': storeUrl,
    'image': data.store.logo_url || undefined,
    'telephone': data.store.whatsapp_phone || undefined,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'NG'
    }
  } : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${systemDomain}/` },
      { '@type': 'ListItem', position: 2, name: storeName, item: storeUrl },
    ],
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StorefrontClient username={username} initialData={data} />
    </>
  );
}
