import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { businessPersonas } from '@/utils/businessPersonas';
import { formatOsmCategory } from '@/utils/osmCategoryLabels';
import { slugify } from '@/utils/nigerianStates';
import UnclaimedStoreView, { UnclaimedListingData } from './UnclaimedStoreView';

interface ClaimListing extends UnclaimedListingData {
  is_claimed: boolean;
  claim_status: 'unclaimed' | 'pending_verification' | 'claimed' | 'rejected';
  token_state: 'valid' | 'expired' | 'already_claimed' | null;
}

async function getListing(slug: string): Promise<ClaimListing | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching claim listing:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: 'Business Not Found | Frontstore' };

  const location = [listing.city, listing.state].filter(Boolean).join(', ');
  const title = `Are you the owner of ${listing.name}? Claim this store on Frontstore${location ? ` — ${location}` : ''}`;
  const description = `${listing.name} on Frontstore. Claim this free listing and turn it into a WhatsApp storefront in minutes.`;
  const url = `https://frontstore.ng/claim/${listing.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: (listing.is_claimed || listing.token_state === 'expired') ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      siteName: 'Frontstore',
      title,
      description,
      url,
      images: [{ url: 'https://frontstore.ng/icon.png', width: 512, height: 512, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://frontstore.ng/icon.png'],
    },
  };
}

function StatusScreen({ icon, tone, title, body }: { icon: React.ReactNode; tone: 'wait' | 'done' | 'muted'; title: string; body: string }) {
  const toneColor = tone === 'done' ? '#064E3B' : tone === 'wait' ? 'var(--accent)' : 'var(--text-faint)';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F7FAF7' }}>
      <PublicSiteNav />
      <main style={{ flex: 1, width: '100%', maxWidth: 520, margin: '0 auto', padding: 'clamp(56px, 10vw, 96px) 20px', textAlign: 'center' }}>
        <div
          style={{
            width: 68, height: 68, borderRadius: '50%', margin: '0 auto 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `color-mix(in srgb, ${toneColor} 12%, transparent)`,
            color: toneColor,
          }}
        >
          {icon}
        </div>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 700, color: '#064E3B', marginBottom: 10 }}>{title}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 28 }}>{body}</p>
        <Link href="/stores" className="btn btn-outline clickable" style={{ padding: '11px 22px', fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 9999 }}>
          Browse the business directory <ChevronRight size={14} />
        </Link>
      </main>
      <PublicSiteFooter />
    </div>
  );
}

export default async function ClaimListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: claimKey } = await params;
  const listing = await getListing(claimKey);
  if (!listing) notFound();

  const persona = businessPersonas.find((p) => p.id === listing.persona_id);
  const categoryLabel = persona?.name || formatOsmCategory(listing.category_value) || 'retail';
  const locationLabel = [listing.address, listing.city, listing.state]
    .filter(Boolean)
    .filter((item, pos, self) => self.indexOf(item) === pos)
    .join(', ');
  const areaName = listing.address || listing.city || 'your area';
  const bioText = `${listing.name} is a ${categoryLabel.toLowerCase()} business in ${areaName}. This page is reserved for the owner. Claim it to add products and start taking orders.`;

  const suggestedUsername = slugify(listing.name).slice(0, 50);
  const signupUrl = `/signup?claim=${encodeURIComponent(claimKey)}&username=${encodeURIComponent(suggestedUsername)}&business_persona=${encodeURIComponent(listing.persona_id)}`;

  const blocked = listing.is_claimed || listing.token_state === 'already_claimed' || listing.token_state === 'expired';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    address: listing.address || locationLabel || undefined,
    telephone: listing.phone || undefined,
    url: listing.website || undefined,
  };

  if (listing.claim_status === 'pending_verification') {
    return (
      <StatusScreen
        icon={<Clock size={28} />}
        tone="wait"
        title="A claim request is under review"
        body="Someone already started claiming this business and submitted it for admin review. We'll email them once it's approved — check back soon."
      />
    );
  }

  if (listing.token_state === 'expired') {
    return (
      <StatusScreen
        icon={<Clock size={28} />}
        tone="muted"
        title="This invite link has expired"
        body="Claim links are time-limited for security. Reach out to Frontstore support and we'll send a fresh one."
      />
    );
  }

  if (blocked) {
    return (
      <StatusScreen
        icon={<CheckCircle2 size={28} />}
        tone="done"
        title="This business has already been claimed"
        body="Its owner has already set up a Frontstore. If that wasn't you, get in touch and we'll help sort it out."
      />
    );
  }

  const canAutoVerify = Boolean(listing.phone || listing.email);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UnclaimedStoreView
        listing={listing}
        categoryLabel={categoryLabel}
        locationLabel={locationLabel}
        bioText={bioText}
        signupUrl={signupUrl}
        canAutoVerify={canAutoVerify}
      />
    </>
  );
}
