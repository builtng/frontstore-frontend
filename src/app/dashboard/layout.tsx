import React from 'react';
import type { Metadata } from 'next';

// Dashboard is a private, authenticated app shell — keep it out of search indices
export const metadata: Metadata = {
  title: 'Merchant Dashboard',
  description: 'Manage your frontstore store — products, orders, analytics, and settings.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
