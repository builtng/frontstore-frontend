import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://frontstore.ng';

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
          '/return-policy',
          '/refund-policy',
          '/returns',
          '/signup',
          '/login',
          '/demo',
          '/ref',
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/admin',
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/track/', '/_next/', '/confirm/', '/buyer/', '/merchant/'],
      },

      // ── Google Image bot — allow all images on public pages ──────────────────
      {
        userAgent: 'Googlebot-Image',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },

      // ── Google Video bot ──────────────────────────────────────────────────────
      {
        userAgent: 'Googlebot-Video',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/signup', '/admin', '/admin/', '/_next/'],
        crawlDelay: 2,
      },

      // ── Yandex ───────────────────────────────────────────────────────────────
      {
        userAgent: 'YandexBot',
        allow: ['/', '/stores', '/blog', '/about', '/privacy', '/terms'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
        crawlDelay: 2,
      },

      // ── Apple (Applebot for Siri / Spotlight) ──────────────────────────────
      {
        userAgent: 'Applebot',
        allow: ['/', '/stores', '/blog', '/solutions', '/tools', '/marketplace', '/about', '/nigeria-states', '/nigeria-states/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },

      // ── DuckDuckGo ───────────────────────────────────────────────────────────
      {
        userAgent: 'DuckDuckBot',
        allow: ['/', '/stores', '/blog', '/marketplace', '/about', '/privacy', '/terms', '/nigeria-states', '/nigeria-states/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/signup', '/admin', '/admin/', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/signup', '/_next/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/stores', '/blog', '/marketplace', '/solutions', '/about', '/llm.txt', '/nigeria-states', '/nigeria-states/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/signup', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/signup', '/_next/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/stores', '/blog', '/marketplace', '/solutions', '/about', '/llm.txt', '/nigeria-states', '/nigeria-states/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
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
          '/nigeria-states',
          '/nigeria-states/',
        ],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },

      // ── Meta AI ──────────────────────────────────────────────────────────────
      {
        userAgent: 'meta-externalagent',
        allow: ['/', '/stores', '/blog', '/about', '/llm.txt'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },

      // ── Cohere AI ────────────────────────────────────────────────────────────
      {
        userAgent: 'cohere-ai',
        allow: ['/', '/stores', '/blog', '/solutions', '/about', '/llm.txt'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },

      // ── Common AI Training Crawlers ───────────────────────────────────────────
      {
        userAgent: 'CCBot',
        allow: ['/', '/stores', '/blog', '/about', '/privacy', '/terms'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
        crawlDelay: 5,
      },

      // ── Social Media / Rich Preview Bots (allow for link previews) ────────────
      {
        userAgent: 'facebookexternalhit',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },
      {
        userAgent: 'Twitterbot',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },
      {
        userAgent: 'LinkedInBot',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },
      {
        userAgent: 'WhatsApp',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },
      {
        userAgent: 'Slackbot',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
      },
      {
        userAgent: 'TelegramBot',
        allow: ['/'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/admin', '/admin/', '/_next/'],
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
