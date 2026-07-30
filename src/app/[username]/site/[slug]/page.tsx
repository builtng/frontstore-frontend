import React from 'react';
import type { Metadata } from 'next';
import BlockRenderer from '../../../../components/storefront/BlockRenderer';

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

async function getSiteData(username: string, slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/store/${username}/site/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const data = await getSiteData(username, slug);

  if (!data || !data.store || !data.site) {
    return { title: 'Page Not Found | Frontstore' };
  }

  const storeName = data.store.store_name || username;
  const title = data.site.seo_title || `${data.site.name} | ${storeName}`;
  const description = data.site.seo_description || data.store.store_bio || `Shop directly from ${storeName} on WhatsApp.`;

  return {
    title,
    description,
    openGraph: { title, description, images: data.store.logo_url ? [{ url: data.store.logo_url }] : undefined },
  };
}

export default async function SitePage({ params }: PageProps) {
  const { username, slug } = await params;
  const data = await getSiteData(username, slug);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  if (!data || !data.store || !data.site) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F8FA', fontFamily: 'sans-serif', color: '#0A192F' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Page not found</h1>
          <p style={{ color: '#64748b' }}>This page may have been unpublished or moved.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <BlockRenderer
        layout={data.site.layout || []}
        store={data.store}
        products={data.products || []}
        categories={data.categories || []}
        faqs={data.faqs || []}
        reviews={data.reviews || []}
        apiUrl={apiUrl}
        editable={false}
      />
    </div>
  );
}
