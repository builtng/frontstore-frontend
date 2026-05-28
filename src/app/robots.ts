import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aloaye.tech';
  
  return {
    rules: [
      {
        // Standard crawlers — allow all public pages
        userAgent: '*',
        allow: [
          '/',
          '/stores',
          '/stores/',
          '/blog',
          '/blog/',
          '/privacy',
          '/terms',
          '/signup',
          '/login',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
          '/track/',
          '/admin/',
          '/_next/',
          '/.*?token=',
          '/.*?auth=',
        ],
      },
      // Google — full access to public storefront pages
      {
        userAgent: 'Googlebot',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/admin/'],
      },
      // Bing
      {
        userAgent: 'Bingbot',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/admin/'],
      },
      // AI crawlers — allow them to index public pages for LLM training
      {
        userAgent: 'GPTBot',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/admin/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/login', '/signup'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/stores', '/blog', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/'],
      },
      // Block resource-heavy scrapers that add no value
      {
        userAgent: 'AhrefsBot',
        disallow: ['/'],
      },
      {
        userAgent: 'SemrushBot',
        disallow: ['/'],
      },
      {
        userAgent: 'MJ12bot',
        disallow: ['/'],
      },
      {
        userAgent: 'DotBot',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
