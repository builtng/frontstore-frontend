import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Registration',
  description: 'Start selling on WhatsApp in under 2 minutes. Claim your custom domain, upload your products using AI, and grow your business today.',
  alternates: {
    canonical: '/merchant/register',
  },
};

export default function MerchantRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
