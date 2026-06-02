import React from 'react';
import type { Metadata } from 'next';
import StoresClient from './StoresClient';

async function getStores() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/stores`, {
      next: { revalidate: 60 }, // Cache store list for 60 seconds
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data || [];
  } catch (err) {
    console.error('Error fetching stores:', err);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Stores Directory - Explore Verified Stores on Frontstore',
  description: 'Browse and purchase directly from verified WhatsApp-native stores on the frontstore platform.',
};

export default async function StoresDirectoryPage() {
  const stores = await getStores();
  return <StoresClient initialStores={stores} />;
}
