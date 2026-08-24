import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoresClient from './StoresClient';
import { UnclaimedListing } from './StoresClient';

async function getStores() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/stores`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data || [];
  } catch (err) {
    console.error('Error fetching stores:', err);
    return [];
  }
}

async function getUnclaimedListings(): Promise<UnclaimedListing[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching unclaimed listings:', err);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Stores Directory - Explore Verified Stores on Frontstore',
  description: 'Browse and purchase directly from verified WhatsApp-native stores on the frontstore platform.',
};

export default async function StoresDirectoryPage() {
  notFound();
}
