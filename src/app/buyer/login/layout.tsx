import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buyer Sign In',
  description: 'Sign in to your buyer account to track orders and check out faster.',
  alternates: {
    canonical: '/buyer/login',
  },
};

export default function BuyerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
