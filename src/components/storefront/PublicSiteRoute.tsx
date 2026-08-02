import React from 'react';
import type { Metadata } from 'next';
import BlockRenderer from './BlockRenderer';

export async function getSiteData(username: string, slug: string, page?: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const path = page ? `/v1/public/store/${username}/site/${slug}/${page}` : `/v1/public/store/${username}/site/${slug}`;
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

export function buildSiteMetadata(data: any): Metadata {
  if (!data || !data.store || !data.site) {
    return { title: 'Page Not Found | Frontstore' };
  }

  const storeName = data.store.store_name || data.store.username;
  const pageName = data.site.pages?.find((p: any) => p.slug === data.site.current_page_slug)?.name;
  const title = data.site.seo_title || [pageName, data.site.name, storeName].filter(Boolean).join(' | ');
  const description = data.site.seo_description || data.store.store_bio || `Shop directly from ${storeName} on WhatsApp.`;

  return {
    title,
    description,
    openGraph: { title, description, images: data.store.logo_url ? [{ url: data.store.logo_url }] : undefined },
  };
}

export function PublicSiteView({ data }: { data: any }) {
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

  const otherPages = (data.site.pages || []).filter((p: any) => p.slug !== data.site.current_page_slug);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {otherPages.length > 0 && (
        <nav style={{ display: 'flex', gap: 16, padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600 }}>
          {(data.site.pages || []).map((p: any) => {
            const href = p.is_home
              ? `/${data.store.username}/site/${data.site.slug}`
              : `/${data.store.username}/site/${data.site.slug}/${p.slug}`;
            const active = p.slug === data.site.current_page_slug;
            return (
              <a key={p.id} href={href} style={{ color: active ? '#128C7E' : '#334155', textDecoration: 'none' }}>
                {p.name}
              </a>
            );
          })}
        </nav>
      )}
      <BlockRenderer
        layout={data.site.layout || []}
        store={data.store}
        products={data.products || []}
        categories={data.categories || []}
        faqs={data.faqs || []}
        reviews={data.reviews || []}
        apiUrl={apiUrl}
        editable={false}
        siteTheme={data.site.theme}
        whatsappLines={data.whatsapp_lines}
      />
    </div>
  );
}
