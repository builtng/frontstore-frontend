import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Stores',
  description: 'Discover and shop directly from verified WhatsApp-native stores on the aloaye platform. Browse catalogs and order in one click.',
  keywords: ['WhatsApp stores', 'African vendors', 'whatsapp shop directory', 'online storefronts Nigeria', 'aloaye directory'],
  openGraph: {
    title: 'Explore Verified Stores | aloaye',
    description: 'Find and browse verified WhatsApp-native stores on the aloaye platform. Buy directly from local African merchants.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Verified Stores | aloaye',
    description: 'Discover WhatsApp-native stores on the aloaye commerce platform.',
  }
};

export default function StoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
