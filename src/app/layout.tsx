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
  preload: true,
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aloaye.tech'),
  title: {
    default: "Aloaye — Conversational Commerce Platform",
    template: "%s | Aloaye",
  },
  description:
    "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.",
  keywords: [
    "WhatsApp commerce", "conversational commerce", "African e-commerce", "digital catalog", "mobile store",
    "small business Nigeria", "sell on WhatsApp", "Africa shops", "WhatsApp store",
    "online store Africa", "ecommerce Nigeria", "ecommerce Ghana", "ecommerce Kenya",
    "sell online Africa", "digital storefront", "WhatsApp business", "micro business Africa",
    "Aloaye", "Aloaye store", "African commerce infrastructure", "WhatsApp CRM",
  ],
  authors: [{ name: "Aloaye", url: 'https://aloaye.tech' }],
  creator: "Aloaye",
  publisher: "Aloaye Technologies",
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
    siteName: "Aloaye",
    title: "Aloaye — Conversational Commerce Platform",
    description:
      "Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa. Turn WhatsApp conversations into sales.",
    url: 'https://aloaye.tech',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Aloaye — Conversational Commerce Platform for Africa',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aloaye — Conversational Commerce Platform",
    description: "Turn WhatsApp conversations into sales. Build a beautiful store and grow your business.",
    images: ['/icon.png'],
    creator: '@aloaye',
    site: '@aloaye',
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
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)",  color: "#059669" },
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
                var theme = localStorage.getItem('aloaye-theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
