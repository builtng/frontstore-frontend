import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant & Seller Documentation',
  description: 'Detailed instructions on how to use Frontstore Flow, Pay, Aura, Pulse, and Reach to launch and grow a WhatsApp storefront.',
  alternates: {
    canonical: '/docs/merchant',
  },
};

export default function MerchantDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
