import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle, MapPin, Store as StoreIcon } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { StoreDirectoryCard, StoreItem, UnclaimedListingCard, UnclaimedListing } from '../../StoresClient';
import { businessPersonas } from '@/utils/businessPersonas';
import { NIGERIAN_STATES } from '@/utils/nigerianStates';
import { NIGERIAN_CITIES } from '@/utils/nigerianCities';
import { getDirectoryContent, locationMatchesState, normalizePersonaId } from '@/utils/directoryContent';

interface PageProps {
  params: Promise<{ category: string; state: string }>;
}

async function getMatchingStores(categorySlug: string, stateSlug: string): Promise<StoreItem[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!state) return [];

  try {
    const res = await fetch(`${API_URL}/v1/public/stores`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const stores: StoreItem[] = Array.isArray(data) ? data : [];

    return stores.filter((store) =>
      normalizePersonaId(store.business_persona) === categorySlug &&
      locationMatchesState(store.location, state)
    );
  } catch (err) {
    console.error('Error fetching directory stores:', err);
    return [];
  }
}

async function getUnclaimedListings(categorySlug: string, stateSlug: string): Promise<UnclaimedListing[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores?state=${stateSlug}&persona=${categorySlug}`, {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, state: stateSlug } = await params;
  const persona = businessPersonas.find((p) => p.id === category);
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!persona || !state) return {};

  const [stores, unclaimedListings] = await Promise.all([
    getMatchingStores(category, stateSlug),
    getUnclaimedListings(category, stateSlug),
  ]);
  const content = getDirectoryContent(persona, state, stores.length);
  const url = `https://frontstore.ng/stores/${category}/${stateSlug}`;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      type: 'website',
      locale: 'en_NG',
      siteName: 'Frontstore',
      images: [{ url: 'https://frontstore.ng/icon.png', width: 512, height: 512, alt: content.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
      images: ['https://frontstore.ng/icon.png'],
    },
  };
}

export default async function DirectoryPage({ params }: PageProps) {
  void params;
  notFound();
}
