'use client';

import React, { useState, useEffect, useMemo } from "react";
import StorefrontNinaWidget from "../../components/StorefrontNinaWidget";
import BeautyStorefront from "./BeautyStorefront";
import FashionStorefront from "./FashionStorefront";
import RestaurantStorefront from "./RestaurantStorefront";
import TechStorefront from "./TechStorefront";
import ThriftStorefront from "./ThriftStorefront";
import ComingSoonStorefront from "./ComingSoonStorefront";
import FoodStorefront from "./FoodStorefront";
import CleaningStorefront from "./CleaningStorefront";
import CreatorStorefront from "./CreatorStorefront";
import EventsStorefront from "./EventsStorefront";
import LaundryStorefront from "./LaundryStorefront";
import PhotographerStorefront from "./PhotographerStorefront";
import WhatsAppTVStorefront from "./WhatsAppTVStorefront";
import AgentStorefront from "./AgentStorefront";
import RetailStorefront from "./RetailStorefront";
import FaithStorefront from "./FaithStorefront";
import SchoolStorefront from "./SchoolStorefront";
import PharmacyStorefront from "./PharmacyStorefront";
import HomeServicesStorefront from "./HomeServicesStorefront";
import AutoRepairStorefront from "./AutoRepairStorefront";

// --- Types & Interfaces ---
interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface Store {
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
  is_verified?: boolean | number;
  custom_links?: StoreLink[] | null;
  primary_color?: string | null;
  store_template?: string | null;
  is_pro?: boolean | number;
  business_persona?: string | null;
  location?: string | null;
  // Merchant-configurable stats
  rating?: number | null;
  review_count?: number | null;
  total_orders?: number | string | null;
  working_hours?: string | null;
  announcement_title?: string | null;
  announcement_body?: string | null;
  announcement_cta_label?: string | null;
  announcement_cta_page?: string | null;
  // Computed server-side from WhatsApp chat response timestamps
  reply_time_minutes?: number | null;
  nina_chat_qr_enabled?: boolean | number;
  nina_avatar_url?: string | null;
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
  service_facts?: string[] | null;
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
    portfolio?: any[];
    blog?: any[];
    system_domain?: string;
    store_disclaimer?: string;
    app_name?: string;
    logo_url?: string;
  } | null;
}

// --- Helpers ---
function normalizeApiUrl(url: string | undefined): string {
  if (!url) return '';
  return url.replace(/\/+$/, '');
}

function normalizeTemplateKey(value: string | null | undefined): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function StorefrontClient({
  username,
  initialProductSlug,
  initialData,
}: StorefrontClientProps) {
  // ⚠️ React Hooks Rule: isComingSoon must be computed from props only (before any hooks)
  // so we can safely call all hooks every render regardless of the condition.
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
      currency_code: s.currency_code || 'NGN',
      whatsapp_phone: s.whatsapp_phone || '',
      location: s.location || 'Online store',
      business_persona: s.business_persona === 'whatsapp-tv' ? 'WhatsApp TV' : s.business_persona,
    };
  }, [initialData, username]);

  const categories: Category[] = useMemo(() => initialData?.categories || [], [initialData]);
  const products: Product[] = useMemo(() => initialData?.products || [], [initialData]);
  const systemDomain = initialData?.system_domain || 'frontstore.app';
  const storeDisclaimer = initialData?.store_disclaimer || '';
  const appName = initialData?.app_name || 'Frontstore';

  // --- Reviews ---
  const [reviews, setReviews] = useState<Review[]>(initialData?.reviews || []);

  const faqs = useMemo(() => initialData?.faqs || [], [initialData]);
  const portfolio = useMemo(() => initialData?.portfolio || [], [initialData]);
  const blog = useMemo(() => initialData?.blog || [], [initialData]);

  // Fetch reviews from API if not provided in initial data
  useEffect(() => {
    if (initialData?.reviews && initialData.reviews.length > 0) return;
    const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
    fetch(`${API_URL}/v1/public/store/${username}/reviews`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data && Array.isArray(json.data)) setReviews(json.data);
      })
      .catch(() => {});
  }, [username]);

  // --- Conditional renders (AFTER all hooks) ---
  // Pre-launch (coming-soon template): show ComingSoon page
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

  // ── Persona-based storefront dispatch ──────────────────────────────────────
  // Each business persona maps to a dedicated storefront template.

  const sharedTemplateProps = {
    username,
    store,
    categories,
    products,
    reviews,
    faqs,
    portfolio,
    blog,
    systemDomain,
    storeDisclaimer,
    appName,
  };

  // Thrift / vintage
  const personaKey = normalizeTemplateKey(store.business_persona);
  const templateKey = normalizeTemplateKey(store.store_template);

  const thriftPersonas = [
    'thrift-store', 'thrift', 'vintage', 'secondhand', 'second-hand', 'preloved', 'pre-loved', 'consignment',
    'thrift-preloved', 'thrift-and-preloved', 'thrift-and-vintage', 'thrift-and-preloved-fashion',
    'thrift-vintage', 'vintage-store', 'preloved-fashion'
  ];

  const storefrontElement = (() => {
    if (thriftPersonas.includes(personaKey) || thriftPersonas.includes(templateKey)) {
      return <ThriftStorefront {...sharedTemplateProps} />;
    }

    // Tech
    const techPersonas = [
      'tech-store', 'electronics', 'gadgets', 'computers', 'phones', 'tech',
      'Gadgets and repairs', 'gadgets-and-repairs', 'gadgets and repairs'
    ];
    if (techPersonas.map(normalizeTemplateKey).includes(personaKey) || ['tech', 'tech-store'].includes(templateKey)) {
      return <TechStorefront {...sharedTemplateProps} />;
    }

    // Fashion
    const fashionPersonas = [
      'fashion', 'fashion-store', 'fashion-apparel', 'clothing', 'streetwear', 'accessories',
      'Fashion and Clothing', 'fashion and clothing', 'fashion-clothing', 'fashion-and-clothing'
    ];
    if (fashionPersonas.map(normalizeTemplateKey).includes(personaKey) || ['fashion', 'fashion-store'].includes(templateKey)) {
      return <FashionStorefront {...sharedTemplateProps} />;
    }

    // Restaurant / food
    const restaurantPersonas = [
      'restaurant', 'food', 'food-delivery', 'cafeteria', 'bakery', 'fast-food', 'catering', 'cafe', 'food-vendor',
      'Restaurant and bars', 'restaurant-bars', 'restaurant and bars', 'restaurant-and-bars'
    ];
    if (restaurantPersonas.map(normalizeTemplateKey).includes(personaKey) || ['restaurant', 'food-vendor', 'flash-sale'].includes(templateKey)) {
      return <FoodStorefront {...sharedTemplateProps} />;
    }

    // Cleaning
    const cleaningPersonas = ['cleaning-service', 'cleaning', 'laundry-cleaning'];
    if (cleaningPersonas.map(normalizeTemplateKey).includes(personaKey) || ['cleaning-service'].includes(templateKey)) {
      return <CleaningStorefront {...sharedTemplateProps} />;
    }

    // Creator / Digital
    const creatorPersonas = ['creator-digital', 'digital-products', 'creator', 'downloads', 'ebooks'];
    if (creatorPersonas.map(normalizeTemplateKey).includes(personaKey) || ['creator-digital', 'digital-studio'].includes(templateKey)) {
      return <CreatorStorefront {...sharedTemplateProps} />;
    }

    // Events
    const eventsPersonas = ['event-services', 'events', 'planning', 'wedding-planner', 'consultation'];
    if (eventsPersonas.map(normalizeTemplateKey).includes(personaKey) || ['event-services'].includes(templateKey)) {
      return <EventsStorefront {...sharedTemplateProps} />;
    }

    // Laundry
    const laundryPersonas = ['laundry', 'laundry-service', 'dry-cleaning'];
    if (laundryPersonas.map(normalizeTemplateKey).includes(personaKey) || ['laundry', 'laundry-service'].includes(templateKey)) {
      return <LaundryStorefront {...sharedTemplateProps} />;
    }

    // Photographer
    const photographerPersonas = ['photographer', 'photography', 'videography', 'photographer-service'];
    if (photographerPersonas.map(normalizeTemplateKey).includes(personaKey) || ['photographer', 'photographer-service'].includes(templateKey)) {
      return <PhotographerStorefront {...sharedTemplateProps} />;
    }

    // WhatsApp TV / Advertising
    const whatsappTvPersonas = ['whatsapp-tv', 'advertising', 'promo', 'shoutout'];
    if (whatsappTvPersonas.map(normalizeTemplateKey).includes(personaKey) || ['whatsapp-tv'].includes(templateKey)) {
      return <WhatsAppTVStorefront {...sharedTemplateProps} />;
    }

    // Agent / real estate
    const agentPersonas = ['agent', 'agency', 'consulting', 'estate-agent', 'real-estate'];
    if (agentPersonas.map(normalizeTemplateKey).includes(personaKey) || ['agent', 'estate-agent'].includes(templateKey)) {
      return <AgentStorefront {...sharedTemplateProps} />;
    }

    // Beauty / editorial
    const beautyPersonas = [
      'beauty-service', 'barber-shop', 'Beauty and hair', 'beauty-and-hair', 'beauty and hair', 'beauty-hair'
    ];
    if (beautyPersonas.map(normalizeTemplateKey).includes(personaKey) || ['editorial', 'beauty'].includes(templateKey)) {
      return <BeautyStorefront {...sharedTemplateProps} />;
    }

    // Retail & groceries
    const retailPersonas = ['retail-groceries', 'groceries', 'supermarket'];
    if (retailPersonas.map(normalizeTemplateKey).includes(personaKey) || ['retail-groceries'].includes(templateKey)) {
      return <RetailStorefront {...sharedTemplateProps} />;
    }

    // Faith community
    const faithPersonas = ['faith-community', 'church', 'ministry'];
    if (faithPersonas.map(normalizeTemplateKey).includes(personaKey) || ['faith-community'].includes(templateKey)) {
      return <FaithStorefront {...sharedTemplateProps} />;
    }

    // School & education
    const schoolPersonas = ['school-education', 'school', 'education'];
    if (schoolPersonas.map(normalizeTemplateKey).includes(personaKey) || ['school-education'].includes(templateKey)) {
      return <SchoolStorefront {...sharedTemplateProps} />;
    }

    // Pharmacy & health
    const pharmacyPersonas = ['pharmacy-health', 'pharmacy', 'wellness'];
    if (pharmacyPersonas.map(normalizeTemplateKey).includes(personaKey) || ['pharmacy-health'].includes(templateKey)) {
      return <PharmacyStorefront {...sharedTemplateProps} />;
    }

    // Home services
    const homeServicesPersonas = ['home-services', 'home-repair', 'handyman'];
    if (homeServicesPersonas.map(normalizeTemplateKey).includes(personaKey) || ['home-services'].includes(templateKey)) {
      return <HomeServicesStorefront {...sharedTemplateProps} />;
    }

    // Auto repair
    const autoRepairPersonas = ['auto-repair', 'mechanic', 'auto-electrician'];
    if (autoRepairPersonas.map(normalizeTemplateKey).includes(personaKey) || ['auto-repair'].includes(templateKey)) {
      return <AutoRepairStorefront {...sharedTemplateProps} />;
    }

    // General store / default — modern catch-all for any unmatched persona.
    return <RetailStorefront {...sharedTemplateProps} />;
  })();

  return (
    <>
      {storefrontElement}
      {store.nina_chat_qr_enabled ? <StorefrontNinaWidget store={store} /> : null}
    </>
  );
}
