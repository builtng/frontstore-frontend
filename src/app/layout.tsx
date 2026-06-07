import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL('https://frontstore.app'),
  title: {
    default: "Frontstore — Conversational Commerce Platform",
    template: "%s | Frontstore",
  },
  description:
    "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.",
  keywords: [
    "WhatsApp commerce", "conversational commerce", "African e-commerce", "digital catalog", "mobile store",
    "small business Nigeria", "sell on WhatsApp", "Africa shops", "WhatsApp store",
    "online store Africa", "ecommerce Nigeria", "ecommerce Ghana", "ecommerce Kenya",
    "sell online Africa", "digital storefront", "WhatsApp business", "micro business Africa",
    "Frontstore", "social commerce", "African commerce infrastructure", "WhatsApp CRM",
  ],
  authors: [{ name: "Frontstore", url: 'https://frontstore.app' }],
  creator: "Frontstore",
  publisher: "Frontstore Technologies",
  alternates: {
    canonical: '/',
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
    siteName: "Frontstore",
    title: "Frontstore — Conversational Commerce Platform",
    description:
      "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.",
    url: 'https://frontstore.app',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Frontstore — Conversational Commerce Platform for Africa',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontstore — Conversational Commerce Platform",
    description: "Turn WhatsApp conversations into sales. Build a beautiful store and grow your business.",
    images: ['/icon.png'],
    creator: '@frontstore',
    site: '@frontstore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#62109F" },
    { media: "(prefers-color-scheme: dark)",  color: "#48097A" },
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
        {/* Dark-mode script — runs before paint to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('frontstore-theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
