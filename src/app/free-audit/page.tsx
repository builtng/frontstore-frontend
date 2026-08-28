import React from 'react';
import type { Metadata } from 'next';
import FreeAuditClient from './FreeAuditClient';

export const metadata: Metadata = {
  title: 'Free Business & Store Page Audit & Conversion Optimizer – Frontstore',
  description: 'Analyze why your Facebook, Instagram, or social ad traffic is not making sales. Run our free 60-second business analyzer to uncover revenue leaks and boost conversions.',
  alternates: { canonical: 'https://frontstore.ng/free-audit' },
  openGraph: {
    title: 'Why Is Your Page Wasting Ad Money & Not Making Sales? – Free Business Audit',
    description: 'Run our free 60-second business analyzer to pinpoint conversion leaks, fix mobile friction, and double your sales.',
    url: 'https://frontstore.ng/free-audit',
    type: 'website',
  },
};

export default function FreeAuditPage() {
  return <FreeAuditClient />;
}
