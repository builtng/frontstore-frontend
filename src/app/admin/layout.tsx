import React from 'react';
import type { Metadata } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

// Admin console is a private, authenticated app shell — keep it out of search indices
export const metadata: Metadata = {
  title: 'Platform Console',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
