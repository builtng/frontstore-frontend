import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOLUTION_PAGES, getSolutionPage } from '@/utils/solutionsData';
import SolutionDetailClient from './SolutionDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SOLUTION_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getSolutionPage(slug);
  if (!data) return {};

  const url = `https://frontstore.ng/solutions/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: [data.keyword, 'WhatsApp commerce Nigeria', 'WhatsApp store Africa', 'Frontstore'],
    alternates: { canonical: url },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url,
      type: 'article',
      locale: 'en_NG',
      siteName: 'Frontstore',
      images: [{ url: data.bannerImage || 'https://frontstore.ng/icon.png', width: 1200, height: 630, alt: data.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: [data.bannerImage || 'https://frontstore.ng/icon.png'],
    },
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getSolutionPage(slug);
  if (!data) return notFound();

  const url = `https://frontstore.ng/solutions/${data.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: data.metaTitle,
    description: data.metaDescription,
    image: data.bannerImage || 'https://frontstore.ng/icon.png',
    publisher: {
      '@type': 'Organization',
      name: 'Frontstore Technologies',
      logo: { '@type': 'ImageObject', url: 'https://frontstore.ng/icon.png' },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const howToJsonLd = data.steps ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.metaTitle,
    step: data.steps.map((s) => ({
      '@type': 'HowToStep',
      name: s.title,
      text: s.body,
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {howToJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      )}

      <SolutionDetailClient data={data} />
    </>
  );
}
