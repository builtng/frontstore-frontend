import { MetadataRoute } from 'next';
import { BLOG_ARTICLES } from '@/utils/blogData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloaye.tech';
  const apiHost = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // ── PSEO Blog Articles ──────────────────────────────────────────────────
  BLOG_ARTICLES.forEach((article) => {
    const countrySlug = article.country.toLowerCase().replace(/\s+/g, '-');
    routes.push({
      url: `${baseUrl}/blog/${countrySlug}/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // ── Dynamic merchant storefronts ──────────────────────────────────────────
  try {
    const res = await fetch(`${apiHost}/v1/public/stores`, {
      next: { revalidate: 3600 }, // revalidate once per hour in Next.js ISR
    });

    if (res.ok) {
      const json = await res.json();
      const stores: Array<{ username: string; updated_at?: string; store_name?: string }> =
        Array.isArray(json.data) ? json.data : [];

      stores.forEach((store) => {
        if (!store.username) return;

        // Subdomain store URL (e.g. myshop.aloaye.tech)
        routes.push({
          url: `https://${store.username}.aloaye.tech`,
          lastModified: store.updated_at ? new Date(store.updated_at) : now,
          changeFrequency: 'daily',
          priority: 0.8,
        });

        // Also index via main domain path (e.g. aloaye.tech/myshop)
        routes.push({
          url: `${baseUrl}/${store.username}`,
          lastModified: store.updated_at ? new Date(store.updated_at) : now,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch dynamic storefronts:', error);
  }

  return routes;
}
