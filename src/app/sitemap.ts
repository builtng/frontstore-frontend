import { MetadataRoute } from 'next';
import { BLOG_ARTICLES } from '@/utils/blogData';
import { VS_COMPETITORS } from '@/utils/vsData';
import { SOLUTION_PAGES } from '@/utils/solutionsData';
import { FREE_TOOLS } from '@/utils/toolsData';
import { businessPersonas } from '@/utils/businessPersonas';
import { NIGERIAN_STATES } from '@/utils/nigerianStates';
import { locationMatchesState, normalizePersonaId } from '@/utils/directoryContent';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frontstore.ng';
  const apiHost = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  const now = new Date();

  // ── Static core pages ─────────────────────────────────────────────────────
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
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
      priority: 0.85,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/business`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/docs/merchant`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/docs/buyer`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.45,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ── PSEO Blog Articles ────────────────────────────────────────────────────
  // Grouped by recency — newer articles get a slight priority bump
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  BLOG_ARTICLES.forEach((article) => {
    const countrySlug = article.country.toLowerCase().replace(/\s+/g, '-');
    const lastMod = article.updatedAt ? new Date(article.updatedAt) : now;
    const isRecent = lastMod > thirtyDaysAgo;
    routes.push({
      url: `${baseUrl}/blog/${countrySlug}/${article.slug}`,
      lastModified: lastMod,
      changeFrequency: isRecent ? 'daily' : 'weekly',
      priority: isRecent ? 0.75 : 0.7,
    });
  });

  // ── Competitor comparison pages ──────────────────────────────────────────
  VS_COMPETITORS.forEach((competitor) => {
    routes.push({
      url: `${baseUrl}/vs/${competitor.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  // ── Long-tail solution / guide pages ─────────────────────────────────────
  SOLUTION_PAGES.forEach((solution) => {
    routes.push({
      url: `${baseUrl}/solutions/${solution.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  });

  // ── Free tool / calculator pages ─────────────────────────────────────────
  FREE_TOOLS.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });

  // ── Dynamic merchant storefronts ──────────────────────────────────────────
  try {
    const res = await fetch(`${apiHost}/v1/public/stores`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const stores: Array<{ username: string; updated_at?: string; store_name?: string }> =
        Array.isArray(json.data) ? json.data : [];

      stores.forEach((store) => {
        if (!store.username) return;

        const lastMod = store.updated_at ? new Date(store.updated_at) : now;
        const isActive = store.updated_at
          ? new Date(store.updated_at) > thirtyDaysAgo
          : false;

        // Storefront home
        routes.push({
          url: `${baseUrl}/${store.username}`,
          lastModified: lastMod,
          changeFrequency: isActive ? 'daily' : 'weekly',
          priority: isActive ? 0.85 : 0.75,
        });
      });
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch dynamic storefronts:', error);
  }

  // ── Category × state merchant directory pages ─────────────────────────────
  try {
    const res = await fetch(`${apiHost}/v1/public/stores`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const stores: Array<{ business_persona?: string | null; location?: string | null }> =
        Array.isArray(json.data) ? json.data : [];

      businessPersonas.forEach((persona) => {
        NIGERIAN_STATES.forEach((state) => {
          const hasMatch = stores.some((store) =>
            normalizePersonaId(store.business_persona) === persona.id &&
            locationMatchesState(store.location, state)
          );

          if (hasMatch) {
            routes.push({
              url: `${baseUrl}/stores/${persona.id}/${state.slug}`,
              lastModified: now,
              changeFrequency: 'weekly',
              priority: 0.6,
            });
          }
        });
      });
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch directory pages:', error);
  }

  // ── Individual product pages ──────────────────────────────────────────────
  try {
    const res = await fetch(`${apiHost}/v1/public/sitemap/products`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const products: Array<{ slug: string; username: string; updated_at?: string }> =
        Array.isArray(json.data) ? json.data : [];

      products.forEach((product) => {
        if (!product.slug || !product.username) return;

        routes.push({
          url: `${baseUrl}/${product.username}/products/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      });
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch product pages:', error);
  }

  // ── PSEO price-comparison pages ───────────────────────────────────────────
  try {
    const res = await fetch(`${apiHost}/v1/public/sitemap/compare`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const entries: Array<{ product_slug: string; state_slug: string; updated_at?: string }> =
        Array.isArray(json.data) ? json.data : [];

      entries.forEach((entry) => {
        if (!entry.product_slug || !entry.state_slug) return;

        routes.push({
          url: `${baseUrl}/compare/${entry.product_slug}/${entry.state_slug}`,
          lastModified: entry.updated_at ? new Date(entry.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.65,
        });
      });
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch compare pages:', error);
  }

  // ── Deduplicate (safety guard — prevents duplicate URL submissions) ────────
  const seen = new Set<string>();
  const deduped = routes.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return deduped;
}
