import React from 'react';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

async function getStoreData(username: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
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

interface ProductReview {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
  created_at?: string | null;
}

async function getProductReviews(username: string, slug: string): Promise<ProductReview[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/store/${username}/products/${slug}/reviews`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
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

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  if (!text || text.toLowerCase() === 'undefined' || text.toLowerCase() === 'null') return fallback;
  return text;
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
  const rawDomain = storeData.system_domain || 'frontstore.ng';
  const systemDomain = rawDomain === 'frontstore.app' ? 'frontstore.ng' : rawDomain;
  const appName = safeText(storeData.app_name, 'Front Store');
  const productUsername = productPathUsername(store.username, username);
  const storeName = safeText(store.store_name, productUsername || 'Store');
  const productName = safeText(product.name, safePathSegment(slug) || 'Product');
  const symbol = currencySymbol(store.currency_code || 'NGN');
  const price = Number(product.price || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const title = `${productName} - ${symbol}${price} at ${storeName}`;
  const description = safeText(product.description, `Buy ${productName} from ${storeName}. Order directly on WhatsApp.`);
  const image = product.image_urls?.[0] || store.logo_url || storeData.logo_url || `https://${systemDomain}/icon.png`;
  const url = `https://${systemDomain}/${productUsername}/products/${safePathSegment(product.slug) || slug}`;

  return {
    title,
    description,
    keywords: [
      productName,
      storeName,
      `${productName} price`,
      `buy ${productName}`,
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
          alt: productName,
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
  const [storeData, product, productReviews] = await Promise.all([
    getStoreData(username),
    getProductData(username, slug),
    getProductReviews(username, slug),
  ]);

  if (!storeData?.store || !product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', background: '#f8f1ee', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#2b1d2a' }}>Product Not Found</h1>
        <p style={{ color: '#8a7782', marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>We couldn't locate the requested product. It may have been removed or set to draft mode.</p>
        <a href={`/${username}`} style={{ textDecoration: 'none', background: '#b14a6e', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700 }}>
          Go to Storefront
        </a>
      </div>
    );
  }

  const rawDomain = storeData.system_domain || 'frontstore.ng';
  const systemDomain = rawDomain === 'frontstore.app' ? 'frontstore.ng' : rawDomain;
  const store = storeData.store;
  const productUsername = productPathUsername(store.username, username);
  const storeName = safeText(store.store_name, productUsername || 'Store');
  const productName = safeText(product.name, safePathSegment(slug) || 'Product');
  const productUrl = `https://${systemDomain}/${productUsername}/products/${safePathSegment(product.slug) || slug}`;

  const validReviews = productReviews.filter((r) => Number.isFinite(r.rating) && r.rating > 0);
  const aggregateRating = validReviews.length > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: (validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1),
    reviewCount: validReviews.length,
  } : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: safeText(product.description, '') || undefined,
    image: product.image_urls || undefined,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(validReviews.length > 0 ? {
      review: validReviews.slice(0, 10).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: safeText(r.reviewer_name, 'Anonymous') },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.body || undefined,
        datePublished: r.created_at || undefined,
      })),
    } : {}),
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
        name: storeName,
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${systemDomain}/` },
      { '@type': 'ListItem', position: 2, name: storeName, item: `https://${systemDomain}/${productUsername}` },
      { '@type': 'ListItem', position: 3, name: productName, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient
        initialProduct={product}
        store={storeData.store}
        allProducts={storeData.products || []}
        reviews={storeData.reviews || []}
        systemDomain={systemDomain}
        storeDisclaimer={storeData.store_disclaimer || ''}
      />
    </>
  );
}
