import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Stores Directory - Explore Verified Stores on Frontstore',
  description: 'Browse and purchase directly from verified WhatsApp-native stores on the frontstore platform.',
};

export default async function StoresDirectoryPage() {
  notFound();
}
