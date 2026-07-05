import React from 'react';
import type { Metadata } from 'next';
import DashboardSessionGuard from '@/components/DashboardSessionGuard';

// Dashboard is a private, authenticated app shell — keep it out of search indices
export const metadata: Metadata = {
  title: 'Merchant Dashboard',
  description: 'Manage your storefront — products, orders, analytics, and settings.',
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
  return (
    <DashboardSessionGuard>
      {children}
    </DashboardSessionGuard>
  );
}

