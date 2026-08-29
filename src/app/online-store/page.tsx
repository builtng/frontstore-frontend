import React from 'react';
import type { Metadata } from 'next';
import OnlineStoreClient from './OnlineStoreClient';

export const metadata: Metadata = {
  title: 'Online Storefront Creator & Builder - Frontstore',
  description: 'Create a stunning, high-converting online storefront in 30 seconds. Showcase products, automate WhatsApp orders, and accept payments seamlessly.',
  keywords: ['online storefront creator', 'free ecommerce website builder', 'WhatsApp store creator', 'African SME online shop'],
  openGraph: {
    title: 'Online Storefront Creator - Frontstore',
    description: 'Launch your dream digital store in under 30 seconds with automated WhatsApp checkout and instant payments.',
    url: 'https://frontstore.ng/online-store',
  }
};

export default function OnlineStorePage() {
  return <OnlineStoreClient />;
}
