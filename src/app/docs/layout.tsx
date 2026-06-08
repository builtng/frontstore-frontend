import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center & Documentation',
  description: 'Guides, tutorials, and documentation for sellers and buyers using Frontstore.',
  alternates: {
    canonical: '/docs',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
