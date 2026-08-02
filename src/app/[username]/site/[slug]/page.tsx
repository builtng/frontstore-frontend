import React from 'react';
import type { Metadata } from 'next';
import { buildSiteMetadata, getSiteData, PublicSiteView } from '../../../../components/storefront/PublicSiteRoute';

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  return buildSiteMetadata(await getSiteData(username, slug));
}

export default async function SitePage({ params }: PageProps) {
  const { username, slug } = await params;
  const data = await getSiteData(username, slug);
  return <PublicSiteView data={data} />;
}
