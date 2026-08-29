import React from 'react';
import type { Metadata } from 'next';
import RecordKeepingClient from './RecordKeepingClient';

export const metadata: Metadata = {
  title: 'Automated Record Keeping & Bookkeeping - Frontstore',
  description: 'Track all sales, expenses, net profits, and customer credit balances in real-time with automated bookkeeping for SMBs across Africa.',
  keywords: ['automated bookkeeping Africa', 'small business record keeping', 'WhatsApp business debts', 'profit and loss calculator SMB'],
  openGraph: {
    title: 'Automated Bookkeeping & Record Keeping - Frontstore',
    description: 'Track sales, log operating expenses, calculate net margins, and manage customer credit in real-time.',
    url: 'https://frontstore.ng/record-keeping',
  }
};

export default function RecordKeepingPage() {
  return <RecordKeepingClient />;
}
