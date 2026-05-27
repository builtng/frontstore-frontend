import React from 'react';
import type { Metadata } from 'next';
import StorefrontClient from './StorefrontClient';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getStoreData(username: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getStoreData(username);
  
  if (!data || !data.store) {
    return {
      title: 'Store Not Found',
      description: 'The requested aloaye storefront could not be located.',
    };
  }

  const { store } = data;
  const title = `${store.store_name} | Shop on aloaye`;
  const description = store.store_bio || `Shop directly from ${store.store_name} on WhatsApp. Browse products and place orders instantly.`;
  const logo = store.logo_url || 'https://aloaye.tech/icon.png';
  const url = `https://${store.username}.aloaye.tech`;

  return {
    title,
    description,
    keywords: [store.store_name, 'WhatsApp commerce', 'WhatsApp storefront', 'aloaye store', 'online shop', 'Africa e-commerce'],
    openGraph: {
      title,
      description,
      url,
      siteName: 'aloaye',
      images: [
        {
          url: logo,
          width: 500,
          height: 500,
          alt: `${store.store_name} Logo`,
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
  
  // Inject Google Schema.org structured data (JSON-LD)
  const jsonLd = data && data.store ? {
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': data.store.store_name,
    'description': data.store.store_bio || undefined,
    'url': `https://${data.store.username}.aloaye.tech`,
    'image': data.store.logo_url || undefined,
    'telephone': data.store.whatsapp_phone || undefined,
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'NG'
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StorefrontClient username={username} />
    </>
  );
}
