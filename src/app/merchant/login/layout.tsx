import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Login',
  description: 'Log in to your frontstore merchant dashboard to manage your products, track orders, and view sales metrics.',
  alternates: {
    canonical: '/merchant/login',
  },
};

export default function MerchantLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
