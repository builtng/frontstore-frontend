import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Globe, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { businessPersonas } from '@/utils/businessPersonas';
import { formatOsmCategory } from '@/utils/osmCategoryLabels';
import { slugify } from '@/utils/nigerianStates';
import ClaimActions from './ClaimActions';

interface ClaimListing {
  id: string;
  name: string;
  slug: string;
  category_key: string | null;
  category_value: string | null;
  persona_id: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
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
  const title = `Claim ${listing.name} on Frontstore${location ? ` — ${location}` : ''}`;
  const description = `Is ${listing.name} your business? Claim this free listing and turn it into a WhatsApp storefront on Frontstore in minutes.`;
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

export default async function ClaimListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: claimKey } = await params;
  const listing = await getListing(claimKey);
  if (!listing) notFound();

  const persona = businessPersonas.find((p) => p.id === listing.persona_id);
  const categoryLabel = persona?.name || formatOsmCategory(listing.category_value);
  const location = [listing.city, listing.state].filter(Boolean).join(', ');
  const suggestedUsername = slugify(listing.name).slice(0, 50);

  const signupUrl = `/signup?claim=${encodeURIComponent(claimKey)}&username=${encodeURIComponent(suggestedUsername)}&business_persona=${encodeURIComponent(listing.persona_id)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    address: listing.address || location || undefined,
    telephone: listing.phone || undefined,
    url: listing.website || undefined,
  };

  const blocked = listing.is_claimed || listing.token_state === 'already_claimed' || listing.token_state === 'expired';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 80px) 20px clamp(40px, 7vw, 64px)' }}>
        <div className="hero-blob" style={{ top: '-22%', right: '-10%', width: 340, height: 340, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-verified animate-fade-in">
            <Sparkles size={11} /> Unclaimed business listing
          </span>
          <h1 className="text-display" style={{ marginTop: 18, marginBottom: 10, fontSize: 'clamp(24px, 5vw, 38px)', color: '#fff' }}>
            {listing.name}
          </h1>
          {location && (
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
              <MapPin size={14} /> {location}
            </p>
          )}
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', padding: 'clamp(36px, 6vw, 56px) 20px' }}>
        {listing.claim_status === 'pending_verification' ? (
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 32 }}>
            <Clock size={28} style={{ color: 'var(--accent)', marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>A claim request for this business is under review.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>We&apos;ll email the claimant once it&apos;s approved.</p>
          </div>
        ) : listing.token_state === 'expired' ? (
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 32 }}>
            <Clock size={28} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>This invite link has expired.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Contact Frontstore support for a new claim link.</p>
          </div>
        ) : blocked ? (
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 32 }}>
            <CheckCircle2 size={28} style={{ color: 'var(--primary)', marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>This business has already been claimed.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ padding: 'clamp(24px, 4vw, 32px)', marginBottom: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <span className="badge badge-primary">{categoryLabel}</span>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {listing.address && (
                  <div style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--text-2)' }}>
                    <MapPin size={15} style={{ flexShrink: 0, color: 'var(--text-faint)', marginTop: 1 }} /> {listing.address}
                  </div>
                )}
                {listing.phone && (
                  <div style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--text-2)' }}>
                    <Phone size={15} style={{ flexShrink: 0, color: 'var(--text-faint)', marginTop: 1 }} /> {listing.phone}
                  </div>
                )}
                {listing.website && (
                  <div style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--text-2)' }}>
                    <Globe size={15} style={{ flexShrink: 0, color: 'var(--text-faint)', marginTop: 1 }} /> {listing.website}
                  </div>
                )}
              </div>

              <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--text-faint)', lineHeight: 1.6 }}>
                This listing was sourced from public map data and hasn&apos;t been claimed by its owner yet.
                No storefront, products, or WhatsApp ordering exist for it until it&apos;s claimed.
              </p>
            </div>

            <ClaimActions
              claimKey={claimKey}
              businessName={listing.name}
              city={listing.city}
              hasPhone={!!listing.phone}
              hasEmail={!!listing.email}
              website={listing.website}
              signupUrl={signupUrl}
            />
          </>
        )}
      </main>

      <PublicSiteFooter />
    </div>
  );
}
