import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frontstore.app';

  return {
    rules: [
      // ── Standard crawlers — allow all public-facing pages ────────────────────
      {
        userAgent: '*',
        allow: [
          '/',
          '/stores',
          '/stores/',
          '/blog',
          '/blog/',
          '/marketplace',
          '/marketplace/',
          '/solutions',
          '/solutions/',
          '/tools',
          '/tools/',
          '/vs',
          '/vs/',
          '/compare',
          '/compare/',
          '/about',
          '/business',
          '/docs',
          '/docs/merchant',
          '/docs/buyer',
          '/privacy',
          '/terms',
          '/signup',
          '/login',
          '/demo',
          '/ref',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/track/',
          '/_next/',
          '/confirm/',
          '/buyer/',
          '/merchant/',
          '/*?token=',
          '/*?auth=',
          '/*?reset=',
          '/*?session=',
          '/*?preview=',
        ],
        crawlDelay: 1,
      },

      // ── Google — full access to all indexable content ────────────────────────
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/vs',
          '/compare',
          '/about',
          '/business',
          '/docs',
          '/privacy',
          '/terms',
          '/signup',
          '/demo',
          '/ref',
        ],
        disallow: ['/dashboard/', '/api/', '/admin/', '/track/', '/confirm/', '/buyer/', '/merchant/'],
      },

      // ── Google Image bot — allow all images on public pages ──────────────────
      {
        userAgent: 'Googlebot-Image',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Google Video bot ──────────────────────────────────────────────────────
      {
        userAgent: 'Googlebot-Video',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Bing ──────────────────────────────────────────────────────────────────
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/vs',
          '/compare',
          '/about',
          '/privacy',
          '/terms',
        ],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/admin/'],
        crawlDelay: 2,
      },

      // ── Yandex ───────────────────────────────────────────────────────────────
      {
        userAgent: 'YandexBot',
        allow: ['/', '/stores', '/blog', '/about', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
        crawlDelay: 2,
      },

      // ── Apple (Applebot for Siri / Spotlight) ──────────────────────────────
      {
        userAgent: 'Applebot',
        allow: ['/', '/stores', '/blog', '/solutions', '/tools', '/marketplace', '/about'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── DuckDuckGo ───────────────────────────────────────────────────────────
      {
        userAgent: 'DuckDuckBot',
        allow: ['/', '/stores', '/blog', '/marketplace', '/about', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── OpenAI / ChatGPT ─────────────────────────────────────────────────────
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/vs',
          '/compare',
          '/about',
          '/docs',
          '/privacy',
          '/terms',
          '/llm.txt',
        ],
        disallow: ['/dashboard/', '/api/', '/login', '/signup', '/admin/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/about',
          '/privacy',
          '/terms',
          '/llm.txt',
        ],
        disallow: ['/dashboard/', '/api/', '/login', '/signup'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/stores', '/blog', '/marketplace', '/solutions', '/about', '/llm.txt'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Anthropic (Claude) ────────────────────────────────────────────────────
      {
        userAgent: 'Claude-Web',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/vs',
          '/about',
          '/privacy',
          '/terms',
          '/llm.txt',
        ],
        disallow: ['/dashboard/', '/api/', '/login', '/signup'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/vs',
          '/about',
          '/privacy',
          '/terms',
          '/llm.txt',
        ],
        disallow: ['/dashboard/', '/api/', '/login', '/signup'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/stores', '/blog', '/marketplace', '/solutions', '/about', '/llm.txt'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Perplexity AI ─────────────────────────────────────────────────────────
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/vs',
          '/about',
          '/privacy',
          '/terms',
          '/llm.txt',
        ],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Google Gemini / Bard ──────────────────────────────────────────────────
      {
        userAgent: 'Google-Extended',
        allow: [
          '/',
          '/stores',
          '/blog',
          '/marketplace',
          '/solutions',
          '/tools',
          '/about',
          '/llm.txt',
        ],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Meta AI ──────────────────────────────────────────────────────────────
      {
        userAgent: 'meta-externalagent',
        allow: ['/', '/stores', '/blog', '/about', '/llm.txt'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Cohere AI ────────────────────────────────────────────────────────────
      {
        userAgent: 'cohere-ai',
        allow: ['/', '/stores', '/blog', '/solutions', '/about', '/llm.txt'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Common AI Training Crawlers ───────────────────────────────────────────
      {
        userAgent: 'CCBot',
        allow: ['/', '/stores', '/blog', '/about', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
        crawlDelay: 5,
      },

      // ── Social Media / Rich Preview Bots (allow for link previews) ────────────
      {
        userAgent: 'facebookexternalhit',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
      {
        userAgent: 'Twitterbot',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
      {
        userAgent: 'LinkedInBot',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
      {
        userAgent: 'WhatsApp',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
      {
        userAgent: 'Slackbot',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
      {
        userAgent: 'TelegramBot',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },

      // ── Block resource-heavy scrapers with no indexing value ──────────────────
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
      {
        userAgent: 'BLEXBot',
        disallow: ['/'],
      },
      {
        userAgent: 'DataForSeoBot',
        disallow: ['/'],
      },
      {
        userAgent: 'PetalBot',
        disallow: ['/'],
      },
      {
        userAgent: 'MegaIndex',
        disallow: ['/'],
      },
      {
        userAgent: 'SEOkicks',
        disallow: ['/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  };
}
