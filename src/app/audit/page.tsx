import React from 'react';
import type { Metadata } from 'next';
import FreeAuditClient from '../free-audit/FreeAuditClient';

export const metadata: Metadata = {
  title: 'Free Business & Store Audit Tool – Fix Wasted Ad Spend | Frontstore',
  description: 'Uncover why your social media and Facebook ad visitors bounce without converting. Get a free 60-second store analysis.',
  alternates: { canonical: 'https://frontstore.ng/audit' },
};

export default function AuditAliasPage() {
  return <FreeAuditClient />;
}
