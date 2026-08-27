import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle, MapPin, Store as StoreIcon } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { StoreDirectoryCard, StoreItem, UnclaimedListingCard, UnclaimedListing } from '../../../StoresClient';
import { businessPersonas } from '@/utils/businessPersonas';
import { NIGERIAN_STATES } from '@/utils/nigerianStates';
import { NIGERIAN_CITIES } from '@/utils/nigerianCities';
import { getCityDirectoryContent, locationMatchesCity, normalizePersonaId } from '@/utils/directoryContent';

interface PageProps {
  params: Promise<{ category: string; state: string; city: string }>;
}

async function getMatchingStores(categorySlug: string, stateSlug: string, citySlug: string): Promise<StoreItem[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!state) return [];
  const stateCities = NIGERIAN_CITIES[stateSlug] || [];
  const city = stateCities.find((c) => c.slug === citySlug);
  if (!city) return [];

  try {
    const res = await fetch(`${API_URL}/v1/public/stores`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const stores: StoreItem[] = Array.isArray(data) ? data : [];

    return stores.filter((store) =>
      normalizePersonaId(store.business_persona) === categorySlug &&
      locationMatchesCity(store.location, city)
    );
  } catch (err) {
    console.error('Error fetching city directory stores:', err);
    return [];
  }
}

async function getUnclaimedListings(categorySlug: string, stateSlug: string, citySlug: string): Promise<UnclaimedListing[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const stateCities = NIGERIAN_CITIES[stateSlug] || [];
  const city = stateCities.find((c) => c.slug === citySlug);
  if (!city) return [];
  const aliases = city.aliases || [city.name.toLowerCase()];

  try {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores?state=${stateSlug}&persona=${categorySlug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const listings: UnclaimedListing[] = Array.isArray(data) ? data : [];
    return listings.filter((l) => {
      const loc = (l.city || '').toLowerCase();
      return aliases.some((alias) => loc.includes(alias));
    });
  } catch (err) {
    console.error('Error fetching unclaimed city listings:', err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, state: stateSlug, city: citySlug } = await params;
  const persona = businessPersonas.find((p) => p.id === category);
  const state = NIGERIAN_STATES.find((s) => s.slug === stateSlug);
  if (!persona || !state) return {};
  const stateCities = NIGERIAN_CITIES[stateSlug] || [];
  const city = stateCities.find((c) => c.slug === citySlug);
  if (!city) return {};

  const stores = await getMatchingStores(category, stateSlug, citySlug);
  const content = getCityDirectoryContent(persona, state, city, stores.length);
  const url = `https://frontstore.ng/stores/${category}/${stateSlug}/${citySlug}`;

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

export default async function DirectoryCityPage({ params }: PageProps) {
  void params;
  notFound();
}
