import React from 'react';
import type { Metadata } from 'next';
import FreeAuditClient from '../../free-audit/FreeAuditClient';

export const metadata: Metadata = {
  title: 'Free Store & Page Business Analyzer & Optimizer – Frontstore',
  description: 'Analyze why your Facebook, Instagram, or website traffic is not converting. Run our free 60-second business audit tool and unlock revenue leaks.',
  alternates: { canonical: 'https://frontstore.ng/tools/free-audit' },
};

export default function ToolsFreeAuditPage() {
  return <FreeAuditClient />;
}
