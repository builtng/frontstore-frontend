import { notFound } from 'next/navigation';
import StoreReviewsClient from './StoreReviewsClient';
import { Metadata } from 'next';
import { headers } from 'next/headers';

async function getStore(username: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/store/${username}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

async function getReviews(username: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/store/${username}/reviews`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const store = await getStore(params.username);
  if (!store) {
    return { title: 'Store Not Found | Frontstore' };
  }
  return {
    title: `Reviews - ${store.store_name} | Frontstore`,
    description: `Read reviews from customers of ${store.store_name}.`,
  };
}

export default async function StoreReviewsPage({ params }: { params: { username: string } }) {
  const store = await getStore(params.username);
  if (!store) {
    notFound();
  }

  const reviews = await getReviews(params.username);

  // We need to resolve system domain for the client
  const headersList = headers();
  const host = headersList.get('host') || 'frontstore.ng';
  let systemDomain = 'frontstore.ng';
  
  if (host.includes('.localhost')) {
    systemDomain = host.split('.').slice(1).join('.');
  } else if (host.includes('.frontstore.ng')) {
    systemDomain = 'frontstore.ng';
  } else if (!host.includes('localhost')) {
    systemDomain = host;
  }

  return (
    <StoreReviewsClient
      store={store}
      initialReviews={reviews}
      systemDomain={systemDomain}
    />
  );
}
