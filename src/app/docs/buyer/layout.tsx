import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopper & Buyer Documentation',
  description: 'Detailed instructions on how to browse stores, place orders, book appointment slots, pay securely, and buy via WhatsApp chat with buyer protection.',
  alternates: {
    canonical: '/docs/buyer',
  },
};

export default function BuyerDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
