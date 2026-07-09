import React from 'react';
import type { Metadata } from 'next';
import StorefrontClientNoSsr from './StorefrontClientNoSsr';

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
  const systemDomain = data.system_domain || 'frontstore.ng';
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
    const supportEmail = data?.support_email || 'hello@frontstore.ng';
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text)',
      }}>
        {/* Main Card */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Logo Mark */}
          <div style={{ marginBottom: '28px' }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img 
                src="/logo.png" 
                alt="Frontstore Logo"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--primary)',
                letterSpacing: '-0.03em'
              }}>
                frontstore
              </span>
            </a>
          </div>

          {/* Alert / Warning Icon Container */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--danger-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'var(--danger)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          {/* Message */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '24px',
            fontWeight: 900,
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            color: 'var(--text)',
          }}>
            Store Not Found
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '15px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}>
            We couldn't find a storefront registered under <strong style={{ color: 'var(--text)', fontWeight: 700 }}>@{username}</strong>. The username might be misspelled or the store has been deactivated.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
          }}>
            <a 
              href="/signup" 
              style={{
                background: 'var(--primary)',
                color: '#fff',
                textDecoration: 'none',
                padding: '14px 20px',
                borderRadius: 'var(--r-lg)',
                fontSize: '15px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-primary)',
                transition: 'all var(--t-fast) var(--ease)',
              }}
            >
              <span>Create Your Store</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>

            <a 
              href="/" 
              style={{
                background: 'var(--bg-2)',
                color: 'var(--text-2)',
                textDecoration: 'none',
                padding: '14px 20px',
                borderRadius: 'var(--r-lg)',
                fontSize: '15px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid var(--border)',
                transition: 'all var(--t-fast) var(--ease)',
              }}
            >
              <span>Go to Homepage</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <p style={{
          marginTop: '32px',
          fontSize: '13px',
          color: 'var(--text-faint)',
        }}>
          Need help? Contact <a href={`mailto:${supportEmail}`} style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>{supportEmail}</a>
        </p>
      </div>
    );
  }

  // Inject Google Schema.org structured data (JSON-LD)
  const systemDomain = data?.system_domain || 'frontstore.ng';
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
      <StorefrontClientNoSsr username={username} initialData={data} />
    </>
  );
}
