import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Login',
  description: 'Log in to your aloaye merchant dashboard to manage your products, track orders, and view sales metrics.',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
