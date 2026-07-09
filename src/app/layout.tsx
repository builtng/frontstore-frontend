import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ToastProvider from '@/components/ToastProvider';

// ── Fonts via next/font — zero render-blocking, automatic preload ────────────
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,   // body font — used on every route, safe to preload
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
  // No explicit preload — Next.js will not eagerly preload all Outfit
  // weight variants. The font loads on first use via display:swap with no
  // FOUT, and the "preloaded but not used" console warnings are eliminated.
});

export const metadata: Metadata = {
  metadataBase: new URL('https://frontstore.ng'),
  title: {
    default: "Frontstore — Sell on WhatsApp | Africa's Conversational Commerce Platform",
    template: "%s | Frontstore",
  },
  description:
    "Frontstore is Africa's #1 conversational commerce platform. Turn WhatsApp into your most profitable sales channel. Create a beautiful catalog, accept payments, automate orders, and grow your business — no website needed. Used by merchants across Nigeria, Ghana, Kenya, Uganda, and South Africa.",
  keywords: [
    // Core brand
    "Frontstore", "frontstore app", "frontstore.ng",
    // Conversational commerce
    "conversational commerce", "WhatsApp commerce", "WhatsApp commerce platform Africa",
    "WhatsApp store builder", "sell on WhatsApp", "WhatsApp checkout",
    "WhatsApp business automation", "automated WhatsApp store", "WhatsApp CRM",
    // Africa e-commerce
    "African e-commerce", "African commerce infrastructure", "sell online Africa",
    "ecommerce Nigeria", "ecommerce Ghana", "ecommerce Kenya", "ecommerce Uganda", "ecommerce South Africa",
    "online store Africa", "digital storefront Africa", "social commerce Africa",
    // Country-specific
    "sell on WhatsApp Nigeria", "WhatsApp store Nigeria", "online store Nigeria",
    "sell on WhatsApp Ghana", "WhatsApp store Kenya", "sell online Kenya",
    // Product categories
    "digital catalog", "mobile store", "small business Nigeria", "micro business Africa",
    "WhatsApp order management", "AI sales agent Africa", "mobile money store",
    "free online store Nigeria", "create online store Nigeria",
    // AI & tech
    "AI product description generator", "conversational AI commerce",
  ],
  authors: [{ name: "Frontstore", url: 'https://frontstore.ng' }],
  creator: "Frontstore",
  publisher: "Frontstore Technologies",
  alternates: {
    canonical: '/',
    languages: {
      'en': 'https://frontstore.ng',
      'en-NG': 'https://frontstore.ng',
      'en-GH': 'https://frontstore.ng',
      'en-KE': 'https://frontstore.ng',
      'en-UG': 'https://frontstore.ng',
      'en-ZA': 'https://frontstore.ng',
      'x-default': 'https://frontstore.ng',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    alternateLocale: ['en_GH', 'en_KE', 'en_UG', 'en_ZA', 'en_US'],
    siteName: "Frontstore",
    title: "Frontstore — Sell on WhatsApp | Africa's Conversational Commerce Platform",
    description:
      "Turn WhatsApp into your most profitable store. Create a beautiful catalog, accept secure payments, and automate customer orders — all inside WhatsApp. Trusted by merchants across Africa.",
    url: 'https://frontstore.ng',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Frontstore — Africa\'s Conversational Commerce Platform',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontstore — Sell on WhatsApp | Africa's Commerce Platform",
    description: "Turn your WhatsApp into a fully automated store. Create catalogs, collect payments, manage orders — no website needed. Built for Africa.",
    images: ['/icon.png'],
    creator: '@frontstore',
    site: '@frontstore',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
  classification: 'E-Commerce, Mobile Commerce, Conversational Commerce',
  referrer: 'origin-when-cross-origin',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#25D366" },
    { media: "(prefers-color-scheme: dark)",  color: "#128C7E" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* llm.txt — AI crawler discoverability (llmstxt.org spec) */}
        <link rel="llms-txt" href="/llm.txt" />
        {/* humans.txt — team & technology credits */}
        <link rel="author" href="/humans.txt" />
        {/* security.txt — responsible disclosure */}
        <link rel="security-policy" href="/.well-known/security.txt" />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Frontstore',
              legalName: 'Frontstore Technologies',
              url: 'https://frontstore.ng',
              logo: {
                '@type': 'ImageObject',
                url: 'https://frontstore.ng/icon.png',
                width: 512,
                height: 512,
              },
              description: 'Africa\'s #1 conversational commerce platform. Turn WhatsApp conversations into automated sales, payments, and customer management for African merchants.',
              foundingDate: '2024',
              slogan: 'Commerce Through Conversation',
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: 'support@frontstore.ng',
                  availableLanguage: ['English', 'Pidgin'],
                },
                {
                  '@type': 'ContactPoint',
                  contactType: 'technical support',
                  email: 'support@frontstore.ng',
                },
              ],
              sameAs: [
                'https://twitter.com/frontstore',
                'https://www.instagram.com/frontstore.ng',
                'https://www.linkedin.com/company/frontstore',
                'https://www.facebook.com/frontstoreapp',
              ],
              areaServed: [
                { '@type': 'Country', name: 'Nigeria' },
                { '@type': 'Country', name: 'Ghana' },
                { '@type': 'Country', name: 'Kenya' },
                { '@type': 'Country', name: 'Uganda' },
                { '@type': 'Country', name: 'South Africa' },
                { '@type': 'Country', name: 'Rwanda' },
              ],
              knowsAbout: [
                'WhatsApp Commerce',
                'Conversational Commerce',
                'African E-Commerce',
                'Mobile Money Payments',
                'AI Sales Automation',
              ],
            }),
          }}
        />
        {/* WebSite Schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Frontstore',
              alternateName: [
                'Frontstore App',
                'frontstore.ng',
                'Africa WhatsApp Commerce',
              ],
              url: 'https://frontstore.ng',
              description: 'Africa\'s conversational commerce platform. Sell on WhatsApp without a website.',
              inLanguage: 'en',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://frontstore.ng/stores?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* SoftwareApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Frontstore',
              operatingSystem: 'Web, iOS, Android',
              applicationCategory: 'BusinessApplication',
              applicationSubCategory: 'E-Commerce',
              description: 'Conversational commerce platform for African merchants. Create WhatsApp-powered storefronts, automate orders, and accept mobile money payments.',
              url: 'https://frontstore.ng',
              screenshot: 'https://frontstore.ng/icon.png',
              featureList: [
                'WhatsApp-Native Checkout',
                'AI Product Description Generator',
                'Multi-Currency Payments (NGN, GHS, KES, UGX, ZAR)',
                'AI Conversational Sales Agent (Nina)',
                'Automated Order Management',
                'Customer CRM & Analytics',
                'Broadcast Marketing',
                'Custom Domain Support',
              ],
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'NGN',
                description: 'Free to start — no website, no code required',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '2400',
                bestRating: '5',
                worstRating: '1',
              },
              author: {
                '@type': 'Organization',
                name: 'Frontstore Technologies',
                url: 'https://frontstore.ng',
              },
              inLanguage: ['en', 'yo', 'ha', 'ig', 'sw'],
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var ignoredMessage = "Cannot read properties of undefined (reading 'substring')";
                function shouldIgnore(message) {
                  return message === ignoredMessage;
                }
                window.addEventListener("error", function (event) {
                  if (shouldIgnore(event.message)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener("unhandledrejection", function (event) {
                  var reason = event.reason;
                  var message = reason && (reason.message || String(reason));
                  if (shouldIgnore(message)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
                var previousOnError = window.onerror;
                window.onerror = function (message, source, lineno, colno, error) {
                  if (shouldIgnore(String(message))) return true;
                  if (typeof previousOnError === "function") {
                    return previousOnError.apply(this, arguments);
                  }
                  return false;
                };
              })();
            `
          }}
        />
        {/* Dark-mode script — runs before paint to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('frontstore-theme');
                var isDashboard = window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/admin');
                if (!theme && isDashboard) {
                  theme = 'dark';
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T4VQBGFXJN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-T4VQBGFXJN');
          `}
        </Script>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
