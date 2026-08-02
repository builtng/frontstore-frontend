import React from 'react';
import type { Metadata } from 'next';
import { buildSiteMetadata, getSiteData, PublicSiteView } from '../../../../../components/storefront/PublicSiteRoute';

interface PageProps {
  params: Promise<{ username: string; slug: string; page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug, page } = await params;
  return buildSiteMetadata(await getSiteData(username, slug, page));
}

export default async function SiteSubPage({ params }: PageProps) {
  const { username, slug, page } = await params;
  const data = await getSiteData(username, slug, page);
  return <PublicSiteView data={data} />;
}
