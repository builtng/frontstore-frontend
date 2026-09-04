'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Script from 'next/script';
import StorefrontNinaWidget from '../../components/StorefrontNinaWidget';
import UniversalStorefront from './UniversalStorefront';
import ComingSoonStorefront from './ComingSoonStorefront';
import { truncateStoreBio } from '@/utils/storeBio';

// --- Types & Interfaces ---
interface StoreLink {
  store_label?: string | null;
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface Store {
  reviews_intro_text?: string | null;
  faq_help_text?: string | null;
  about_intro_text?: string | null;
  delivery_info?: string | null;
  return_policy?: string | null;
  policy_bookings?: string | null;
  policy_products?: string | null;
  policy_refunds?: string | null;

  id: string;
  username: string;
  store_name: string;
  store_bio: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  currency_code: string;
  whatsapp_phone: string;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle?: string | null;
  facebook_handle?: string | null;
  linkedin_handle?: string | null;
  is_verified?: boolean | number;
  custom_links?: StoreLink[] | null;
  primary_color?: string | null;
  store_template?: string | null;
  is_pro?: boolean | number;
  business_persona?: string | null;
  location?: string | null;
  rating?: number | null;
  review_count?: number | null;
  total_orders?: number | string | null;
  working_hours?: any;
  announcement_title?: string | null;
  announcement_body?: string | null;
  announcement_cta_label?: string | null;
  announcement_cta_page?: string | null;
  reply_time_minutes?: number | null;
  nina_chat_qr_enabled?: boolean | number;
  nina_avatar_url?: string | null;
  facebook_pixel_id?: string | null;
  google_tag_manager_id?: string | null;
  tiktok_pixel_id?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  description: string | null;
  image_urls: string[] | null;
  stock_status: string;
  stock_quantity?: number | null;
  category_id: string | null;
  is_digital?: boolean;
  type?: 'service' | 'product';
  duration_minutes?: number | null;
  variants?: any[];
}

interface Review {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
  created_at?: string;
}

interface StorefrontClientProps {
  username: string;
  initialProductSlug?: string;
  initialData?: {
    store: Store;
    categories?: Category[];
    products?: Product[];
    reviews?: Review[];
    faqs?: any[];
    blog?: any[];
    systemDomain?: string;
    store_disclaimer?: string;
    app_name?: string;
    logo_url?: string;
  } | null;
}

function normalizeApiUrl(url: string | undefined): string {
  if (!url) return 'https://api.frontstore.ng/api';
  return url.replace(/\/+$/, '');
}

export default function StorefrontClient({
  username,
  initialProductSlug,
  initialData,
}: StorefrontClientProps) {
  const isComingSoon = !initialData || !initialData.store
    || (initialData.store as Store).store_template === 'coming-soon';

  // --- Normalize Data ---
  const store: Store = useMemo(() => {
    let s = initialData?.store || {} as Store;

    const rawName = s.store_name || username || 'Store';
    const formattedName = rawName.includes('-') || rawName.includes('_') || rawName === rawName.toLowerCase()
      ? rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : rawName;
    return {
      ...s,
      username: s.username || username,
      store_name: formattedName,
      store_bio: truncateStoreBio(s.store_bio, 306),
      currency_code: s.currency_code || 'NGN',
      whatsapp_phone: s.whatsapp_phone || '',
      location: s.location || 'Online store',
    };
  }, [initialData, username]);

  const categories: Category[] = useMemo(() => initialData?.categories || [], [initialData]);
  const products: Product[] = useMemo(() => initialData?.products || [], [initialData]);
  const systemDomain = initialData?.systemDomain || 'frontstore.ng';
  const storeDisclaimer = initialData?.store_disclaimer || '';
  const appName = initialData?.app_name || 'Frontstore';

  // --- Reviews ---
  const [reviews, setReviews] = useState<Review[]>(initialData?.reviews || []);
  const faqs = useMemo(() => initialData?.faqs || [], [initialData]);
  const blog = useMemo(() => initialData?.blog || [], [initialData]);

  useEffect(() => {
    if (initialData?.reviews && initialData.reviews.length > 0) return;
    const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
    fetch(`${API_URL}/v1/public/store/${username}/reviews`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data && Array.isArray(json.data)) setReviews(json.data);
      })
      .catch(() => {});
  }, [username, initialData]);

  if (isComingSoon) {
    return (
      <ComingSoonStorefront
        username={username}
        store={store}
        systemDomain={systemDomain}
        appName={appName}
      />
    );
  }

  return (
    <>
      {store.facebook_pixel_id ? (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${store.facebook_pixel_id}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
      {store.google_tag_manager_id ? (
        <>
          <Script id="gtm-storefront" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${store.google_tag_manager_id}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${store.google_tag_manager_id}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      ) : null}
      {store.tiktok_pixel_id ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{};var n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(n,o)};
ttq.load('${store.tiktok_pixel_id}');
ttq.page();}(window,document,'ttq');`}
        </Script>
      ) : null}
      <UniversalStorefront
        username={username}
        store={store}
        categories={categories}
        products={products}
        reviews={reviews}
        faqs={faqs}
        blog={blog}
        systemDomain={systemDomain}
        storeDisclaimer={storeDisclaimer}
        appName={appName}
      />
      {store.nina_chat_qr_enabled ? <StorefrontNinaWidget store={store} /> : null}
    </>
  );
}

