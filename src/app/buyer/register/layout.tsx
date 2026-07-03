import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Buyer Account',
  description: 'Create a buyer account to save your details, track orders, and check out faster.',
  alternates: {
    canonical: '/buyer/signup',
  },
};

export default function BuyerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
