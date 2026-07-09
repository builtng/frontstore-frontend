import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BLOG_ARTICLES } from '@/utils/blogData';
import BlogArticleClient from './BlogArticleClient';

interface PageProps {
  params: Promise<{
    country: string;
    slug: string;
  }>;
}

function getCountrySlug(country?: string): string {
  return (country || '').toLowerCase().replace(/\s+/g, '-');
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    country: getCountrySlug(article.country),
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, slug } = await params;
  const article = BLOG_ARTICLES.find(
    (a) => a.slug === slug && getCountrySlug(a.country) === country
  );
  if (!article) return {};

  const url = `https://frontstore.ng/blog/${getCountrySlug(article.country)}/${article.slug}`;

  return {
    title: `${article.title} | frontstore Blog`,
    description: article.metaDescription,
    keywords: [
      article.category, article.city, article.country,
      `sell on WhatsApp ${article.city}`, `WhatsApp store ${article.city}`,
      `digital catalog ${article.city}`, `${article.category} boutique ${article.city}`
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${article.title} | frontstore Blog`,
      description: article.metaDescription,
      url,
      type: 'article',
      locale: 'en_NG',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      siteName: 'frontstore',
      images: [
        {
          url: 'https://frontstore.ng/icon.png',
          width: 512,
          height: 512,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
      images: ['https://frontstore.ng/icon.png'],
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { country, slug } = await params;
  const article = BLOG_ARTICLES.find(
    (a) => a.slug === slug && getCountrySlug(a.country) === country
  );
  if (!article) return notFound();

  const relatedArticles = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);
  const canonicalUrl = `https://frontstore.ng/blog/${getCountrySlug(article.country)}/${article.slug}`;

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    'headline': article.title,
    'description': article.metaDescription,
    'image': 'https://frontstore.ng/icon.png',
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt,
    'author': {
      '@type': 'Person',
      'name': article.author.name,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'frontstore Technologies',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://frontstore.ng/icon.png',
      },
    },
  };

  const faqJsonLd = article.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': article.faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <BlogArticleClient article={article} relatedArticles={relatedArticles} canonicalUrl={canonicalUrl} />
    </>
  );
}
