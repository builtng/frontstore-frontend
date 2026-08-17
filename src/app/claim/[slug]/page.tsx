import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Globe, CheckCircle2, Clock, ChevronRight, ShieldCheck, Zap, Search } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { businessPersonas } from '@/utils/businessPersonas';
import { formatOsmCategory } from '@/utils/osmCategoryLabels';
import { slugify, NIGERIAN_STATES } from '@/utils/nigerianStates';

const STATE_NAME_ALIASES: Record<string, string> = {
  'federal capital territory': 'fct-abuja',
};

function resolveStateSlug(stateName: string): string | null {
  const alias = STATE_NAME_ALIASES[stateName.toLowerCase()];
  if (alias) return alias;
  const match = NIGERIAN_STATES.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
  return match ? match.slug : null;
}
import { OsmPersonaIcon } from '@/utils/osmPersonaIcons';
import { getClaimPageContent } from '@/utils/claimPageContent';
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
  postcode: string | null;
  opening_hours: string | null;
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

interface NearbyListing {
  id: string;
  name: string;
  slug: string;
  category_value: string | null;
  persona_id: string;
  city: string | null;
  state: string | null;
}

async function getNearbyListings(city: string | null, currentSlug: string): Promise<NearbyListing[]> {
  if (!city) return [];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  try {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores?city=${encodeURIComponent(city)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const listings: NearbyListing[] = Array.isArray(data) ? data : [];
    return listings.filter((l) => l.slug !== currentSlug).slice(0, 6);
  } catch (err) {
    console.error('Error fetching nearby listings:', err);
    return [];
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

function StatusScreen({ icon, tone, title, body }: { icon: React.ReactNode; tone: 'wait' | 'done' | 'muted'; title: string; body: string }) {
  const toneColor = tone === 'done' ? 'var(--primary)' : tone === 'wait' ? 'var(--accent)' : 'var(--text-faint)';
  return (
    <main style={{ flex: 1, width: '100%', maxWidth: 520, margin: '0 auto', padding: 'clamp(56px, 10vw, 96px) 20px', textAlign: 'center' }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `color-mix(in srgb, ${toneColor} 12%, transparent)`,
          color: toneColor,
        }}
      >
        {icon}
      </div>
      <h1 className="text-title" style={{ color: 'var(--text)', marginBottom: 10 }}>{title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 28 }}>{body}</p>
      <Link href="/stores" className="btn btn-outline clickable" style={{ padding: '11px 22px', fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        Browse the business directory <ChevronRight size={14} />
      </Link>
    </main>
  );
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

  const blocked = listing.is_claimed || listing.token_state === 'already_claimed' || listing.token_state === 'expired';

  const { intro, faqs } = getClaimPageContent(persona, {
    name: listing.name,
    categoryLabel,
    city: listing.city,
    state: listing.state,
    specificLabel: formatOsmCategory(listing.category_value),
    openingHours: listing.opening_hours,
    postcode: listing.postcode,
  });
  const nearbyListings = blocked ? [] : await getNearbyListings(listing.city, listing.slug);
  const stateSlugForLinks = listing.state ? resolveStateSlug(listing.state) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    address: listing.address || location || undefined,
    telephone: listing.phone || undefined,
    url: listing.website || undefined,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {!blocked && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <PublicSiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="hero-dark" style={{ padding: 'clamp(52px, 9vw, 88px) 20px clamp(44px, 8vw, 72px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-mesh" />
        <div className="hero-grid" />
        <div className="hero-blob" style={{ top: '-30%', right: '-8%', width: 420, height: 420, background: 'rgba(255,255,255,0.045)' }} />
        <div className="hero-blob" style={{ bottom: '-45%', left: '-10%', width: 380, height: 380, background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <nav aria-label="Breadcrumb" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={11} />
            <Link href="/stores" style={{ color: 'inherit', textDecoration: 'none' }}>Directory</Link>
            <ChevronRight size={11} />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>Claim listing</span>
          </nav>

          <div
            className="animate-fade-in"
            style={{
              width: 76, height: 76, borderRadius: 22, margin: '0 auto 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(150deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              color: '#fff',
            }}
          >
            <OsmPersonaIcon personaId={listing.persona_id} size={32} />
          </div>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
            <Search size={11} color="var(--accent)" style={{ flexShrink: 0 }} /> <b>Unclaimed listing</b>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5.5vw, 46px)', color: '#fff', marginBottom: 12 }}>
            {listing.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 100, padding: '6px 14px', fontSize: 12.5, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {categoryLabel}
            </span>
            {location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                <MapPin size={13} /> {location}
              </span>
            )}
          </div>
        </div>
      </header>

      {listing.claim_status === 'pending_verification' ? (
        <StatusScreen
          icon={<Clock size={26} />}
          tone="wait"
          title="A claim request is under review"
          body="Someone already started claiming this business and submitted it for admin review. We'll email them once it's approved — check back soon."
        />
      ) : listing.token_state === 'expired' ? (
        <StatusScreen
          icon={<Clock size={26} />}
          tone="muted"
          title="This invite link has expired"
          body="Claim links are time-limited for security. Reach out to Frontstore support and we'll send a fresh one."
        />
      ) : blocked ? (
        <StatusScreen
          icon={<CheckCircle2 size={26} />}
          tone="done"
          title="This business has already been claimed"
          body="Its owner has already set up a Frontstore. If that wasn't you, get in touch and we'll help sort it out."
        />
      ) : (
        <main
          style={{
            flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto',
            padding: 'clamp(32px, 5vw, 56px) 20px clamp(56px, 8vw, 88px)',
            display: 'grid', gap: 28,
            gridTemplateColumns: '1fr',
          }}
        >
          <div className="claim-layout">
            {/* ── Left: business snapshot + value props ─────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>
                {intro}
              </p>

              <div className="card" style={{ padding: 'clamp(22px, 4vw, 30px)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 18 }}>
                  Business details
                </h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {listing.address && (
                    <DetailRow icon={<MapPin size={15} />} label="Address" value={listing.address} />
                  )}
                  {listing.phone && (
                    <DetailRow icon={<Phone size={15} />} label="Phone on file" value={listing.phone} />
                  )}
                  {listing.website && (
                    <DetailRow icon={<Globe size={15} />} label="Website on file" value={listing.website} />
                  )}
                  {listing.opening_hours && (
                    <DetailRow icon={<Clock size={15} />} label="Hours (public map data)" value={listing.opening_hours} />
                  )}
                  {!listing.address && !listing.phone && !listing.website && (
                    <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>No contact details on file yet — you can add them once you claim this listing.</p>
                  )}
                </div>

                <div style={{ marginTop: 22, padding: '14px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    This listing was sourced from public map data and hasn&apos;t been claimed by its owner yet.
                    No storefront, products, or WhatsApp ordering exist for it until it&apos;s claimed and verified.
                  </p>
                </div>
              </div>

              <div className="card" style={{ padding: 'clamp(22px, 4vw, 30px)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 18 }}>
                  What you get
                </h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  <ValueProp icon={<Zap size={16} />} title="Live storefront in 2 minutes" body="Skip the setup — your store name, category, and location carry over automatically." />
                  <ValueProp icon={<CheckCircle2 size={16} />} title="Accept orders on WhatsApp" body="Customers order directly in chat. No POS, no app to install, no learning curve." />
                  <ValueProp icon={<Search size={16} />} title="Get found by nearby customers" body={`Claimed businesses rank in Frontstore's directory for ${location || 'their area'} and beyond.`} />
                </div>
              </div>

              <div className="card" style={{ padding: 'clamp(22px, 4vw, 30px)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
                  Frequently asked questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {faqs.map((faq, idx) => (
                    <details key={idx} className="blog-faq" style={{ borderBottom: idx === faqs.length - 1 ? 'none' : '1px solid var(--border)', padding: '14px 0' }}>
                      <summary className="blog-faq__summary">
                        <span style={{ paddingRight: 16 }}>{faq.question}</span>
                      </summary>
                      <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.65 }}>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>

              {nearbyListings.length > 0 && (
                <div className="card" style={{ padding: 'clamp(22px, 4vw, 30px)' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
                    Other unclaimed businesses in {listing.city}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {nearbyListings.map((n) => (
                      <Link
                        key={n.id}
                        href={`/claim/${n.slug}`}
                        className="card clickable"
                        style={{ padding: '12px 14px', textDecoration: 'none', display: 'block' }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.name}
                        </p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                          {formatOsmCategory(n.category_value)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {stateSlugForLinks && (
                <p style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                  Looking for more? Browse every{' '}
                  <Link href={`/stores/${listing.persona_id}/${stateSlugForLinks}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {categoryLabel.toLowerCase()} business in {listing.state}
                  </Link>{' '}
                  on Frontstore.
                </p>
              )}
            </div>

            {/* ── Right: sticky claim action panel ─────────────────────── */}
            <div className="claim-sticky-col">
              <ClaimActions
                claimKey={claimKey}
                businessName={listing.name}
                city={listing.city}
                hasPhone={!!listing.phone}
                hasEmail={!!listing.email}
                website={listing.website}
                signupUrl={signupUrl}
              />
            </div>
          </div>
        </main>
      )}

      <PublicSiteFooter />
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--primary-light)', color: 'var(--primary)',
      }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 13.5, color: 'var(--text-2)', wordBreak: 'break-word' }}>{value}</p>
      </div>
    </div>
  );
}

function ValueProp({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--accent-light)', color: 'var(--accent)',
      }}>
        {icon}
      </span>
      <div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{body}</p>
      </div>
    </div>
  );
}
