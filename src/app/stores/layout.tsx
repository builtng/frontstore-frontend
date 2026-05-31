import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Stores',
  description: 'Discover and shop directly from verified WhatsApp-native stores on the frontstore platform. Browse catalogs and order in one click.',
  keywords: ['WhatsApp stores', 'African vendors', 'whatsapp shop directory', 'online storefronts Nigeria', 'frontstore directory'],
  alternates: {
    canonical: '/stores',
  },
  openGraph: {
    title: 'Explore Verified Stores | frontstore',
    description: 'Find and browse verified WhatsApp-native stores on the frontstore platform. Buy directly from local African merchants.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Verified Stores | frontstore',
    description: 'Discover WhatsApp-native stores on the frontstore commerce platform.',
  }
};

export default function StoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
