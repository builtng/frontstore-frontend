import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloaye.tech';
  const apiHost = process.env.NEXT_PUBLIC_API_URL || 'https://api.aloaye.tech/api';

  // Base static pages of the platform
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Dynamic fetch of all merchant storefronts
    const res = await fetch(`${apiHost}/v1/public/stores`, {
      next: { revalidate: 3600 }, // Cache sitemap fetches for an hour in Next.js cache
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach((store: any) => {
          if (store.username) {
            routes.push({
              url: `https://${store.username}.aloaye.tech`,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error compiling dynamic storefront sitemap:', error);
  }

  return routes;
}
