import React from 'react';
import type { Metadata } from 'next';
import StorefrontClient from '../../StorefrontClient';

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

async function getStoreData(username: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/store/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

async function getProductData(username: string, slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/store/${username}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

function currencySymbol(code: string): string {
  const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (!normalizedCode || normalizedCode === 'UNDEFINED' || normalizedCode === 'NULL') {
    return '₦';
  }
  return {
    NGN: '₦',
    GHS: 'GH₵',
    KES: 'KSh',
    ZAR: 'R',
    USD: '$',
    GBP: '£',
  }[normalizedCode] ?? `${normalizedCode} `;
}

function safePathSegment(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  const segment = value.trim();
  if (!segment || segment.toLowerCase() === 'undefined' || segment.toLowerCase() === 'null') return '';
  return segment;
}

function productPathUsername(storeUsername: string | null | undefined, routeUsername: string): string {
  return safePathSegment(storeUsername) || safePathSegment(routeUsername);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const [storeData, product] = await Promise.all([
    getStoreData(username),
    getProductData(username, slug),
  ]);

  if (!storeData?.store || !product) {
    return {
      title: 'Product not found',
      description: 'The requested product could not be located.',
    };
  }

  const store = storeData.store;
  const systemDomain = storeData.system_domain || 'frontstore.app';
  const appName = storeData.app_name || 'Front Store';
  const symbol = currencySymbol(store.currency_code || 'NGN');
  const price = Number(product.price || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const title = `${product.name} - ${symbol}${price} at ${store.store_name}`;
  const description = product.description
    || `Buy ${product.name} from ${store.store_name}. Order directly on WhatsApp.`;
  const image = product.image_urls?.[0] || store.logo_url || storeData.logo_url || `https://${systemDomain}/icon.png`;
  const productUsername = productPathUsername(store.username, username);
  const url = `https://${systemDomain}/${productUsername}/products/${safePathSegment(product.slug) || slug}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      store.store_name,
      `${product.name} price`,
      `buy ${product.name}`,
      'WhatsApp order',
      'online store',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: appName,
      type: 'website',
      locale: 'en_NG',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { username, slug } = await params;
  const [storeData, product] = await Promise.all([
    getStoreData(username),
    getProductData(username, slug),
  ]);

  const systemDomain = storeData?.system_domain || 'frontstore.app';
  const store = storeData?.store;
  const productUrl = store && product
    ? `https://${systemDomain}/${productPathUsername(store.username, username)}/products/${safePathSegment(product.slug) || slug}`
    : '';
  const jsonLd = store && product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.image_urls || undefined,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: store.store_name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: store.currency_code || 'NGN',
      availability: product.stock_status === 'out_of_stock'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      url: productUrl,
      seller: {
        '@type': 'Store',
        name: store.store_name,
      },
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StorefrontClient username={username} initialProductSlug={slug} initialData={storeData} />
    </>
  );
}
