import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description: 'Frontstore\'s copyright policy and DMCA takedown notice procedure for merchant storefronts.',
  alternates: {
    canonical: '/dmca',
  },
};

export default function DmcaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
