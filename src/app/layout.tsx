import type { Metadata, Viewport } from "next";
import "./globals.css";
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: {
    default: "aloaye — Africa's WhatsApp Commerce Platform",
    template: "%s | aloaye",
  },
  description:
    "Create a stunning mobile storefront in under 2 minutes and sell directly via WhatsApp. Built for African small businesses.",
  keywords: ["WhatsApp commerce", "African e-commerce", "digital catalog", "mobile store", "small business Nigeria"],
  authors: [{ name: "aloaye" }],
  creator: "aloaye",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "aloaye",
    title: "aloaye — Africa's WhatsApp Commerce Platform",
    description:
      "Create a stunning mobile storefront in under 2 minutes and sell directly via WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "aloaye — Africa's WhatsApp Commerce Platform",
    description: "Sell to anyone on WhatsApp, instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
