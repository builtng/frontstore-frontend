import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description: 'Frontstore Return & Refund Policy. Guidelines on escrow buyer protection, merchant store returns, cancellations, and SaaS plan subscription refunds.',
  alternates: {
    canonical: '/return-policy',
  },
};

export default function ReturnPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
