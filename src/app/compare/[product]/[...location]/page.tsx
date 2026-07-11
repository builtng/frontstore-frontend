import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, ChevronRight, Trophy, Star, ShieldCheck, Flame, TrendingDown,
  HelpCircle, CheckCircle2, PackageX, Truck, AlertTriangle,
} from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import {
  getComparisonData, formatPrice, locationLabel, locationBreadcrumb, CompareMerchant,
} from '@/utils/compareData';
import { buildAboutContent, buildBuyingGuide, buildFaqs } from '@/utils/compareContent';

interface PageProps {
  params: Promise<{ product: string; location: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product, location } = await params;
  const data = await getComparisonData(product, location);
  if (!data) return {};

  const loc = locationLabel(data.location);
  const title = `${data.product.name} Price in ${loc} – Compare Prices & Best Deals`;
  const description = `Compare ${data.product.name} prices from trusted stores in ${loc}. Find the lowest prices, top-rated sellers, and best deals.`;
  const url = `https://frontstore.ng/compare/${data.product.slug}/${location.join('/')}`;

  return {
    title,
    description,
    keywords: [
      data.product.name, loc, `${data.product.name} price`, `${data.product.name} ${loc}`,
      'price comparison Nigeria', 'buy online Nigeria',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'en_NG',
      siteName: 'Frontstore',
      images: data.product.image_url
        ? [{ url: data.product.image_url, width: 512, height: 512, alt: data.product.name }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.product.image_url ? [data.product.image_url] : undefined,
    },
  };
}

function BadgePill({ label }: { label: string }) {
  const map: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    'Lowest Price': { icon: Trophy, bg: 'var(--accent-light)', color: 'var(--accent)' },
    'Best Value': { icon: Star, bg: 'var(--primary-light)', color: 'var(--primary-dark)' },
    'Verified Seller': { icon: ShieldCheck, bg: 'var(--primary-light)', color: 'var(--primary-dark)' },
    'Popular Choice': { icon: Flame, bg: 'var(--accent-light)', color: 'var(--accent)' },
  };
  const cfg = map[label] || { icon: CheckCircle2, bg: 'var(--surface-2)', color: 'var(--text-muted)' };
  const Icon = cfg.icon;
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={10} /> {label}
    </span>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function recommendedReasons(m: CompareMerchant, loc: string): string[] {
  const reasons: string[] = [];
  if (m.badges.includes('Lowest Price')) {
    reasons.push('Offers the lowest price among all sellers we track for this product.');
  }
  if (m.rating && m.rating >= 4) {
    reasons.push(`Highly rated by previous customers — ${m.rating}/5 from ${m.review_count} review${m.review_count === 1 ? '' : 's'}.`);
  }
  if (m.is_verified) {
    reasons.push('Verified seller — Frontstore has confirmed this merchant\'s identity documents.');
  }
  if (m.stock_status === 'in_stock') {
    reasons.push('Currently in stock and ready to ship.');
  }
  reasons.push(`Best overall combination of price, trust, and availability in ${loc}.`);
  return reasons;
}

function alternativeBenefit(m: CompareMerchant): string {
  if (m.badges.length > 0) return m.badges.join(' · ');
  if (m.rating) return `${m.rating}/5 rating from ${m.review_count} review${m.review_count === 1 ? '' : 's'}`;
  return m.stock_status === 'in_stock' ? 'In stock and available now' : 'Limited stock — confirm before ordering';
}

export default async function ComparePage({ params }: PageProps) {
  const { product, location } = await params;
  const data = await getComparisonData(product, location);
  if (!data) return notFound();

  const loc = locationLabel(data.location);
  const breadcrumbLoc = locationBreadcrumb(data.location);
  const recommended = data.merchants[0];
  const alternatives = data.merchants.slice(1, 4);
  const about = buildAboutContent(data);
  const buyingGuide = buildBuyingGuide(data);
  const faqs = buildFaqs(data);
  const pageUrl = `https://frontstore.ng/compare/${data.product.slug}/${location.join('/')}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.product.name,
    description: data.product.description || `${data.product.name} price comparison in ${loc}`,
    ...(data.product.image_url ? { image: data.product.image_url } : {}),
    category: data.product.category?.name,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: data.insights.currency_code,
      lowPrice: data.insights.lowest_price,
      highPrice: data.insights.highest_price,
      offerCount: data.insights.merchant_count,
      offers: data.merchants.map((m) => {
        const currencyToCountry: Record<string, string> = {
          NGN: 'NG',
          GHS: 'GH',
          KES: 'KE',
          ZAR: 'ZA',
          USD: 'US',
          GBP: 'GB',
        };
        const countryCode = currencyToCountry[m.store.currency_code.toUpperCase()] || 'NG';

        let shippingRate = 0;
        if (m.store.delivery_info) {
          const rateMatch = m.store.delivery_info.replace(/,/g, '').match(/(?:₦|GH₵|KSh|R|\$|£|NGN|GHS|KES|ZAR|USD|GBP)\s*(\d+)/i);
          if (rateMatch) {
            shippingRate = parseInt(rateMatch[1], 10);
          } else {
            const numMatch = m.store.delivery_info.replace(/,/g, '').match(/(\d+)/);
            if (numMatch && m.store.delivery_info.toLowerCase().includes('delivery')) {
              shippingRate = parseInt(numMatch[1], 10);
            }
          }
        }

        return {
          '@type': 'Offer',
          price: m.price,
          priceCurrency: m.store.currency_code,
          availability: m.stock_status === 'in_stock'
            ? 'https://schema.org/InStock'
            : m.stock_status === 'low_stock'
              ? 'https://schema.org/LimitedAvailability'
              : 'https://schema.org/OutOfStock',
          url: `https://frontstore.ng/${m.store.username}/products/${m.product_slug}`,
          seller: { '@type': 'Organization', name: m.store.store_name },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: shippingRate,
              currency: m.store.currency_code,
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: countryCode,
            },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: countryCode,
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 7,
            returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
            returnMethod: 'https://schema.org/ReturnByMail',
          },
        };
      }),
    },
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

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://frontstore.ng/' },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://frontstore.ng/compare' },
    {
      '@type': 'ListItem',
      position: 3,
      name: data.location.state,
      item: `https://frontstore.ng/compare/${data.product.slug}/${data.location.state_slug}`,
    },
  ];
  if (data.location.city) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 4,
      name: data.location.city,
      item: `https://frontstore.ng/compare/${data.product.slug}/${data.location.state_slug}/${data.location.city_slug}`,
    });
  }
  if (data.location.lga) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 5, name: data.location.lga, item: pageUrl });
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const merchantsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: data.merchants.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Organization',
        name: m.store.store_name,
        url: `https://frontstore.ng/${m.store.username}`,
      },
    })),
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(merchantsJsonLd) }} />

      <PublicSiteNav />

      <main style={{ flex: 1, padding: '24px 20px 64px', maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-faint)', marginBottom: 20 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/compare" style={{ textDecoration: 'none', color: 'inherit' }}>Compare</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-muted)' }}>{breadcrumbLoc}</span>
        </nav>

        {/* Hero */}
        <section
          className="card"
          style={{
            padding: '32px 24px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: '#fff',
            borderRadius: 'var(--r-xl)',
            marginBottom: 28,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 'var(--r-full)', marginBottom: 16 }}>
            <MapPin size={12} /> {breadcrumbLoc}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 4.5vw, 32px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 12, maxWidth: 700 }}>
            {data.product.name} Prices in {loc}
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, maxWidth: 600 }}>
            Compare prices from {data.insights.merchant_count} verified stores in this area.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Lowest price today</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900 }}>
                {formatPrice(data.insights.lowest_price, data.insights.currency_code)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Available at</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>{recommended.store.store_name}</p>
            </div>
            <a
              href={`/${recommended.store.username}/products/${recommended.product_slug}`}
              className="btn"
              style={{ background: '#fff', color: 'var(--primary-dark)', marginLeft: 'auto' }}
            >
              View best deal <ChevronRight size={16} />
            </a>
          </div>
        </section>

        {/* Price comparison table */}
        <section className="card" style={{ padding: 20, marginBottom: 28, overflowX: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Price Comparison
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 8px' }}>Rank</th>
                <th style={{ padding: '8px 8px' }}>Store</th>
                <th style={{ padding: '8px 8px' }}>Price</th>
                <th style={{ padding: '8px 8px' }}>Rating</th>
                <th style={{ padding: '8px 8px' }}>Badges</th>
              </tr>
            </thead>
            <tbody>
              {data.merchants.map((m) => (
                <tr key={m.store.username} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-muted)' }}>#{m.rank}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <a href={`/${m.store.username}/products/${m.product_slug}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
                      {m.store.store_name}
                    </a>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <MapPin size={10} /> {m.store.location}
                    </p>
                    {m.store.delivery_info && (
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Truck size={10} /> {m.store.delivery_info}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>
                    {formatPrice(m.price, m.store.currency_code)}
                    {m.suspicious_price && (
                      <span title="Price is unusually low — confirm with the seller before paying" style={{ marginLeft: 6, color: 'var(--accent)' }}>
                        <AlertTriangle size={12} style={{ display: 'inline' }} />
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {m.rating ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Star size={12} fill="var(--accent)" color="var(--accent)" /> {m.rating}{' '}
                        <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>({m.review_count})</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>New</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {m.badges.map((b) => <BadgePill key={b} label={b} />)}
                      {m.stock_status !== 'in_stock' && (
                        <span className="badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                          <PackageX size={10} /> {m.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Recommended store */}
        <section className="card" style={{ padding: 24, marginBottom: 28, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', marginBottom: 10 }}>
            <Trophy size={14} /> Recommended Store
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
            {recommended.store.store_name}
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0 }}>
            {recommendedReasons(recommended, loc).map((reason, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text-2)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                {reason}
              </li>
            ))}
          </ul>
        </section>

        {/* Other stores */}
        {alternatives.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Other Stores You May Like
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {alternatives.map((m) => (
                <a
                  key={m.store.username}
                  href={`/${m.store.username}/products/${m.product_slug}`}
                  className="card card-hover"
                  style={{ padding: 16, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{m.store.store_name}</h4>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)' }}>{formatPrice(m.price, m.store.currency_code)}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{alternativeBenefit(m)}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Price insights */}
        <section className="card" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={18} style={{ color: 'var(--primary)' }} /> Price Insights
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            <Insight label="Average Price" value={formatPrice(data.insights.average_price, data.insights.currency_code)} />
            <Insight label="Lowest Price" value={formatPrice(data.insights.lowest_price, data.insights.currency_code)} />
            <Insight label="Highest Price" value={formatPrice(data.insights.highest_price, data.insights.currency_code)} />
            <Insight label="Price Spread" value={formatPrice(data.insights.price_spread, data.insights.currency_code)} />
            <Insight label="Savings vs Highest" value={formatPrice(data.insights.savings_vs_highest, data.insights.currency_code)} />
          </div>
        </section>

        {/* About */}
        <section className="card" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            About {data.product.name}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>{about}</p>
        </section>

        {/* Buying guide */}
        <section className="card" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            Buying Guide
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20 }}>
            {buyingGuide.map((tip, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{tip}</li>
            ))}
          </ul>
        </section>

        {/* FAQs */}
        <section className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={18} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {faqs.map((faq, idx) => (
              <details key={idx} style={{ borderBottom: idx === faqs.length - 1 ? 'none' : '1px solid var(--border)', padding: '16px 0' }}>
                <summary style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, cursor: 'pointer', listStyle: 'none' }}>
                  <span style={{ paddingRight: 12 }}>{faq.question}</span>
                  <span style={{ fontSize: 18, color: 'var(--primary-dark)', fontWeight: 300 }}>+</span>
                </summary>
                <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
