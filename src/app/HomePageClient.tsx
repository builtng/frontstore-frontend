'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, Globe,
  Store, Star, ArrowRight, User, MessageCircle,
  CreditCard, Users, Brain, Megaphone, Check, X,
  ShoppingBasket, Shirt,
  UtensilsCrossed, Sparkles, Wrench, BookOpen, Camera, Building2,
  Smartphone, Recycle, HeartPulse, WashingMachine
} from 'lucide-react';
import Logo from '../components/Logo';
import { PublicSiteNav } from '../components/PublicSiteChrome';
import { RESERVED_SUBDOMAINS } from '../utils/reservedKeywords';

// Testimonials default empty — real ones are supplied via admin-configured homepage_content.
const TESTIMONIALS: ReadonlyArray<{
  name: string;
  role: string;
  initial: string;
  bg: string;
  color: string;
  text: string;
  stars: number;
}> = [];

const HOW_IT_WORKS = [
  { step: '01', title: 'Claim your URL', body: 'Type your business name and claim your branded store link in seconds.' },
  { step: '02', title: 'Add your products', body: 'Upload photos, add prices, and let AI write descriptions for you.' },
  { step: '03', title: 'Share & sell', body: 'Drop your store link on WhatsApp, Instagram, or TikTok and start receiving orders.' },
] as const;

const DEFAULT_PLATFORM_SUITE = [
  {
    brand: 'Online Store',
    tagline: 'Your store ready in 2 minutes',
    desc: 'Generate a stunning, mobile ready product catalog in under 2 minutes. No coding, no website builder — just add your products and go.',
    badge: 'Core Feature'
  },
  {
    brand: 'WhatsApp Checkout',
    tagline: 'Sell directly in WhatsApp',
    desc: 'Customers browse your store and tap "Order" — their message lands in your WhatsApp chat, pre filled and ready to confirm.',
    badge: 'WhatsApp Native'
  },
  {
    brand: 'Accept Payments',
    tagline: 'Cards, bank transfer & mobile money',
    desc: 'Collect payments securely from your customers. Supports Paystack, cards, bank transfers, and mobile money across Africa.',
    badge: 'Secure Payments'
  },
  {
    brand: 'Customer Records',
    tagline: 'Know who buys from you',
    desc: 'Automatically log every buyer, their orders, and purchase history. Follow up easily and build lasting customer relationships.',
    badge: 'Customer Logs'
  },
  {
    brand: 'AI Assistant',
    tagline: 'Write descriptions in one click',
    desc: 'Upload a product photo and let AI write your description, suggest prices, and answer customer questions — 24/7.',
    badge: 'AI Powered'
  },
  {
    brand: 'Broadcast Messages',
    tagline: 'Reach all your customers at once',
    desc: 'Send product drops, promos, and updates to your customer base without rebuilding your audience from scratch.',
    badge: 'Growth Tools'
  },
  {
    brand: 'Ultra Fast Loading',
    tagline: 'Built for African mobile networks',
    desc: 'Static pages load in under 2 seconds even on 3G, keeping your bounce rate low and buyers engaged.',
    badge: 'Speed'
  },
  {
    brand: 'Multi Currency Support',
    tagline: 'Sell in NGN, GHS, KES, ZAR & more',
    desc: 'frontstore handles local currency formatting automatically so prices feel right to your local buyers.',
    badge: 'Multi Currency'
  },
];

const STORE_SHOWCASE = [
  {
    name: 'Ankara & Co',
    slug: 'ankaraco',
    emoji: '👗',
    gradient: 'linear-gradient(135deg, #0A192F, #1B3A5C)',
    products: [
      { bg: '#EEF1F4', price: '₦18,500' },
      { bg: '#E4E9ED', price: '₦24,000' },
    ],
  },
  {
    name: 'Techville Gadgets',
    slug: 'techville',
    emoji: '🎧',
    gradient: 'linear-gradient(135deg, #1E293B, #3B4A5F)',
    products: [
      { bg: '#EEF1F4', price: '₦35,000' },
      { bg: '#E4E9ED', price: '₦52,000' },
    ],
  },
  {
    name: 'Glow Studio',
    slug: 'glowstudio',
    emoji: '💄',
    gradient: 'linear-gradient(135deg, #0F3D3E, #128C7E)',
    products: [
      { bg: '#EEF1F4', price: '₦12,000' },
      { bg: '#E4E9ED', price: '₦8,500' },
    ],
  },
  {
    name: 'Sole Kicks',
    slug: 'solekicks',
    emoji: '👟',
    gradient: 'linear-gradient(135deg, #0A192F, #1B3A5C)',
    products: [
      { bg: '#EEF1F4', price: '₦28,000' },
      { bg: '#E4E9ED', price: '₦19,500' },
    ],
  },
  {
    name: 'Spice Route',
    slug: 'spiceroute',
    emoji: '🌶️',
    gradient: 'linear-gradient(135deg, #1E293B, #3B4A5F)',
    products: [
      { bg: '#EEF1F4', price: '₦3,200' },
      { bg: '#E4E9ED', price: '₦5,800' },
    ],
  },
  {
    name: 'Phone Doctor NG',
    slug: 'phonedoctor',
    emoji: '📱',
    gradient: 'linear-gradient(135deg, #0F3D3E, #128C7E)',
    products: [
      { bg: '#EEF1F4', price: '₦8,500' },
      { bg: '#E4E9ED', price: '₦45,000' },
    ],
  },
] as const;

const SELL_CATEGORIES = [
  {
    icon: ShoppingBasket,
    title: 'Retail & Groceries',
    desc: 'Provision stores, supermarkets and neighborhood retail — customers order everyday essentials straight from WhatsApp.',
    color: 'var(--primary)', bg: 'var(--primary-light)',
  },
  {
    icon: Shirt,
    title: 'Fashion & Apparel',
    desc: 'Boutiques, thrift sellers and bespoke tailors show a lookbook style catalog with instant chat checkout.',
    color: 'hsl(340, 82%, 50%)', bg: 'hsl(340, 82%, 95%)',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food & Kitchens',
    desc: 'Cloud kitchens, bakeries and lunch spots take daily menu orders without scattered DMs during the rush.',
    color: 'hsl(38, 92%, 45%)', bg: 'hsl(38, 92%, 93%)',
  },
  {
    icon: Sparkles,
    title: 'Beauty & Barbering',
    desc: 'Stylists, salons, spas and barbershops manage appointment slots, deposits and product sales in one storefront.',
    color: 'hsl(280, 70%, 52%)', bg: 'hsl(280, 70%, 95%)',
  },
  {
    icon: Wrench,
    title: 'Home & Auto Services',
    desc: 'Painters, plumbers, mechanics and cleaners quote jobs, book a slot and get paid — all in the chat.',
    color: 'hsl(200, 98%, 42%)', bg: 'hsl(200, 98%, 94%)',
  },
  {
    icon: BookOpen,
    title: 'Digital Products & Courses',
    desc: 'E-books, templates and courses are delivered to buyers automatically the moment payment clears.',
    color: 'hsl(250, 84%, 58%)', bg: 'hsl(250, 84%, 95%)',
  },
  {
    icon: Camera,
    title: 'Events & Photography',
    desc: 'Planners, photographers and vendors sell packages and take bookings for weddings, shoots and parties.',
    color: 'hsl(170, 70%, 36%)', bg: 'hsl(170, 70%, 94%)',
  },
  {
    icon: Building2,
    title: 'Schools, Faith & Community',
    desc: 'Fees, offerings, event registration and community payments, collected and tracked in one place.',
    color: 'hsl(142, 71%, 40%)', bg: 'hsl(142, 71%, 94%)',
  },
  {
    icon: Smartphone,
    title: 'Tech & Gadgets',
    desc: 'Phone and gadget stores list devices and repair services with secure, trackable checkout.',
    color: 'hsl(215, 80%, 50%)', bg: 'hsl(215, 80%, 95%)',
  },
  {
    icon: Recycle,
    title: 'Thrift & Preloved',
    desc: 'Thrift and preloved sellers drop fresh bundles and let customers claim pieces before they sell out.',
    color: 'hsl(24, 85%, 48%)', bg: 'hsl(24, 85%, 94%)',
  },
  {
    icon: HeartPulse,
    title: 'Pharmacy & Health',
    desc: 'Pharmacies and wellness vendors take pre-orders for medication and health essentials with trusted delivery.',
    color: 'hsl(0, 72%, 50%)', bg: 'hsl(0, 72%, 95%)',
  },
  {
    icon: WashingMachine,
    title: 'Laundry Services',
    desc: 'Laundry and dry-cleaning businesses schedule pickup and drop-off slots without a single phone call.',
    color: 'hsl(190, 80%, 40%)', bg: 'hsl(190, 80%, 94%)',
  },
] as const;

const DEFAULT_COMPARISON_ROWS = [
  { feat: 'WhatsApp Checkout', alo: 'Direct order details sent straight to merchant chat', sho: 'Generic web cart & email confirmations', oth: 'Partial integrations / web redirects' },
  { feat: 'AI assisted Listings', alo: 'Upload photo → Auto price, tags, and rich descriptions', sho: 'Manual data entry required', oth: 'No built in AI catalog tool' },
  { feat: 'Mobile first Merchant Operations', alo: 'Manage store fully on 3G mobile network', sho: 'Complex desk oriented admin dashboard', oth: 'Limited mobile configuration' },
  { feat: 'African Payment Rails', alo: 'Escrow options + Paystack/Flutterwave/Mobile Money', sho: 'High card fees, complex setup for Africa', oth: 'Standard payments only, no escrow' },
  { feat: 'Setup Speed', alo: 'Under 2 minutes (claim & launch immediately)', sho: 'Hours/Days of theme editing', oth: '5-15 minutes configuration' },
  { feat: 'Pricing', alo: '₦1,500/month or ₦15,000/year flat — no tiers', sho: '$5–$399+/month by tier, Plus from $2,300+/month', oth: 'Bumpa: ₦15k–30k+/quarter by tier · Selar: free to start + ~₦22,500/month premium' },
];

const DEFAULT_HOME_CONTENT = {
  hero: {
    badges: ['Under 2 Minutes Setup', 'Conversational Commerce'],
    titlePrefix: 'Turn WhatsApp Conversations Into',
    titleHighlight: 'Sales',
    description: 'Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa.',
    primaryButton: { label: 'Start Free', href: '#store-name-input' },
    secondaryButton: { label: 'Live Demo', href: '/demo' },
  },
  stats: {
    sellerCount: '1,200+ sellers',
    text: 'already selling on Frontstore',
  },
  narrative: {
    eyebrow: 'Our Narrative',
    title: 'Commerce Through Conversation',
    body: 'Frontstore turns WhatsApp — the channel your customers already trust — into a structured commerce system: a branded store, one shareable link, and orders that land straight in your chat, ready to confirm.',
    steps: [
      { title: 'Create a Store', desc: 'Add products in 2 mins' },
      { title: 'Share a Link', desc: 'Status, Instagram, TikTok' },
      { title: 'Receive Orders', desc: 'Directly in WhatsApp' },
      { title: 'Manage Customers', desc: 'Conversation driven CRM' },
      { title: 'Grow Revenue', desc: 'Scale with simple analytics' },
    ],
  },
  platformSuite: {
    eyebrow: 'Platform Suite',
    title: 'Everything You Need to Sell Online',
    description: 'A unified suite of products engineered to run your entire business infrastructure through conversations.',
    items: DEFAULT_PLATFORM_SUITE,
  },
  comparison: {
    eyebrow: 'Why Frontstore?',
    title: 'Engineered for African Entrepreneurs',
    description: 'How we stand out against standard e-commerce site builders.',
    columns: ['Feature', 'Frontstore', 'Shopify', 'Bumpa / Selar'],
    rows: DEFAULT_COMPARISON_ROWS,
  },
  vision: {
    eyebrow: 'Our Vision',
    quote: 'Become the operating system for African businesses, helping millions of merchants sell, get paid, manage customers, and grow through conversations.',
    cite: '— The Frontstore Mission for African Commerce Infrastructure',
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Start selling in 3 simple steps',
    items: HOW_IT_WORKS,
  },
  testimonials: {
    eyebrow: 'Testimonials',
    title: 'Sellers love Frontstore',
    items: TESTIMONIALS,
  },
};

type HomeContent = typeof DEFAULT_HOME_CONTENT;

function mergeHomeContent(raw?: string): HomeContent {
  if (!raw) return DEFAULT_HOME_CONTENT;
  try {
    const parsed = JSON.parse(raw);
    
    // Helper to merge nested objects falling back to default values for falsy fields (like empty strings)
    const mergeWithFallback = (defaultObj: any, parsedObj: any): any => {
      if (!parsedObj) return defaultObj;
      const result = { ...defaultObj };
      for (const key in defaultObj) {
        if (Object.prototype.hasOwnProperty.call(defaultObj, key)) {
          if (typeof defaultObj[key] === 'object' && defaultObj[key] !== null && !Array.isArray(defaultObj[key])) {
            result[key] = mergeWithFallback(defaultObj[key], parsedObj[key]);
          } else {
            result[key] = parsedObj[key] || defaultObj[key];
          }
        }
      }
      return result;
    };

    return mergeWithFallback(DEFAULT_HOME_CONTENT, parsed);
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}

export default function HomePageClient({ initialSettings }: { initialSettings?: any }) {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [appName, setAppName] = useState(initialSettings?.app_name || 'Frontstore');
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logo_url || '');
  const [systemDomain, setSystemDomain] = useState(initialSettings?.system_domain || 'frontstore.app');
  const [homeContent, setHomeContent] = useState<HomeContent>(() => mergeHomeContent(initialSettings?.homepage_content));

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

  useEffect(() => {
    setMounted(true);
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(token && user && user !== 'undefined' && user !== 'null'));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSettings) {
      fetch(`${API_URL}/v1/public/settings`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            if (json.data.app_name) setAppName(json.data.app_name);
            if (json.data.logo_url) setLogoUrl(json.data.logo_url);
            if (json.data.system_domain) setSystemDomain(json.data.system_domain);
            setHomeContent(mergeHomeContent(json.data.homepage_content));
          }
        })
        .catch(err => console.error('Failed to fetch public settings:', err));
    }
  }, [initialSettings, API_URL]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || checking) return;

    const clean = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) {
      setMessage('Invalid name. Use letters, numbers, dashes, or underscores only.');
      setMessageType('error');
      return;
    }
    if (RESERVED_SUBDOMAINS.includes(clean)) {
      setMessage(`The name "${clean}" is reserved. Please choose another.`);
      setMessageType('error');
      return;
    }

    try {
      setChecking(true);
      setMessage('');
      setMessageType(null);

      const res = await fetch(`${API_URL}/v1/public/store/${clean}`);

      if (res.ok) {
        setMessage(`Sorry — ${systemDomain}/${clean} is already taken.`);
        setMessageType('error');
      } else if (res.status === 404) {
        setMessage(`🎉 ${systemDomain}/${clean} is available!`);
        setMessageType('success');
        setTimeout(() => {
          window.location.href = `/signup?username=${clean}`;
        }, 1200);
      } else {
        throw new Error('Connection issue');
      }
    } catch {
      setMessage('Checking availability...');
      setMessageType('success');
      setTimeout(() => {
        window.location.href = `/signup?username=${username.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
      }, 1000);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="hero-dark" style={{
        padding: 'clamp(48px, 9vw, 100px) 20px clamp(48px, 8vw, 80px)',
      }}>
        <div className="hero-blob" style={{ top: '-18%', right: '-12%', width: 420, height: 420, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-25%', left: '-10%', width: 480, height: 480, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />
        <div className="hero-dash" style={{ top: '18%', right: '10%', width: 54, height: 54 }} />
        <div className="hero-dash" style={{ bottom: '12%', left: '9%', width: 34, height: 34 }} />

        <div className="hero-inner" style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr', gap: 40,
          alignItems: 'center',
        }}>
        <div className="hero-copy" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div className="hero-eyebrow hero-badges" style={{ marginBottom: 22, justifyContent: 'center' }}>
            <Zap size={12} color="var(--accent)" /> <b>{homeContent.hero.badges[0]}</b>
            <span style={{ opacity: 0.5 }}>·</span>
            <Globe size={12} /> {homeContent.hero.badges[1]}
          </div>

          {/* Headline */}
          <h1
            className="text-display"
            style={{ marginBottom: 20, maxWidth: 640, margin: '0 auto 20px', lineHeight: 1.15, color: '#fff' }}
          >
            {homeContent.hero.titlePrefix}{' '}
            <span className="mark-highlight">
              {homeContent.hero.titleHighlight}
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.78)',
            fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.65,
            maxWidth: 540,
            margin: '0 auto 32px',
          }}>
            {homeContent.hero.description}
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
            <button
              onClick={() => {
                if (homeContent.hero.primaryButton.href && homeContent.hero.primaryButton.href !== '#store-name-input') {
                  window.location.href = homeContent.hero.primaryButton.href;
                  return;
                }
                const el = document.getElementById('store-name-input');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.focus();
                }
              }}
              className="btn"
              style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--r-xl)', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--primary-dark)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
            >
              {homeContent.hero.primaryButton.label} <ArrowRight size={16} />
            </button>
            <a
              href={homeContent.hero.secondaryButton.href || '/demo'}
              className="btn"
              style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--r-xl)', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              {homeContent.hero.secondaryButton.label}
            </a>
          </div>

          {/* Claim form */}
          <div style={{ maxWidth: 440, margin: '0 auto 32px' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 600, marginBottom: 12 }}>
              Or claim your instant store link directly:
            </p>
            <form
              onSubmit={handleClaim}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}
            >
              <div style={{
                display: 'flex',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                padding: 6,
                boxShadow: 'var(--shadow-lg)',
                gap: 4,
              }}>
                <input
                  type="text"
                  placeholder="your-store-name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    padding: '10px 12px', fontSize: 15,
                    background: 'transparent', color: 'var(--text)',
                    minWidth: 0,
                  }}
                  id="store-name-input"
                  aria-label="Choose your store name"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: 13, borderRadius: 'var(--r-lg)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  id="claim-url-btn"
                >
                  {checking ? (
                    <><span className="spinner" style={{ width: 14, height: 14 }} /> Checking...</>
                  ) : (
                    <>Claim URL <ArrowRight size={14} /></>
                  )}
                </button>
              </div>

              {message && (
                <div
                  className="animate-slide-up"
                  style={{
                    fontSize: 13, fontWeight: 600,
                    color: messageType === 'error' ? 'var(--danger)' : 'var(--primary)',
                    padding: '8px 14px',
                    borderRadius: 'var(--r-md)',
                    background: messageType === 'error' ? 'var(--danger-light)' : 'var(--primary-light)',
                    textAlign: 'center',
                  }}
                >
                  {message}
                </div>
              )}

              {mounted && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  Your store will be at <strong style={{ color: '#fff' }}>{systemDomain}/yourname</strong>
                </p>
              )}
            </form>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { bg: 'hsl(142, 70%, 85%)', color: 'hsl(142, 70%, 30%)' },
                { bg: 'hsl(210, 80%, 85%)', color: 'hsl(210, 80%, 30%)' },
                { bg: 'hsl(38, 90%, 85%)', color: 'hsl(38, 90%, 30%)' },
                { bg: 'hsl(280, 70%, 85%)', color: 'hsl(280, 70%, 30%)' },
                { bg: 'hsl(340, 80%, 85%)', color: 'hsl(340, 80%, 30%)' },
              ].map((style, i) => (
                <div
                  key={i}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: style.bg, color: style.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.9)',
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: 5 - i,
                  }}
                >
                  <User size={13} strokeWidth={2.5} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
              <strong style={{ color: '#fff' }}>{homeContent.stats.sellerCount}</strong> {homeContent.stats.text}
            </p>
          </div>
        </div>

        <div className="hero-visual" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div className="hero-float-chip glass" style={{ top: '10%', left: '-2%' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={15} color="var(--primary)" strokeWidth={3} />
            </span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>Order confirmed</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Paid via Paystack</p>
            </div>
          </div>

          <div className="hero-float-chip glass" style={{ bottom: '8%', right: '-4%', animationDelay: '1.6s' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={15} color="var(--accent)" strokeWidth={2.5} />
            </span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>Store live</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Set up in 2 minutes</p>
            </div>
          </div>

          <div className="hero-float-chip glass" style={{ top: '46%', left: '-9%', animationDelay: '0.8s' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={15} color="var(--primary)" strokeWidth={2.5} />
            </span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>{systemDomain}/amara</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Claimed just now</p>
            </div>
          </div>

          <div className="phone-mockup animate-fade-in">
            <div className="phone-mockup__notch" />
            <div className="phone-mockup__screen">
              <div className="phone-mockup__bar">
                <div className="phone-mockup__avatar">
                  <img src="/ninaAssistant.png" alt="Nina" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                {appName} Store
              </div>
              <div className="phone-mockup__body">
                <div className="phone-bubble phone-bubble--in" style={{ animationDelay: '200ms' }}>
                  Hi! Is the blue Ankara set still available? 😍
                </div>
                <div className="phone-bubble phone-bubble--out" style={{ animationDelay: '550ms' }}>
                  Yes it is! Here's the order summary 👇
                </div>
                <div className="phone-bubble phone-bubble--card" style={{ animationDelay: '900ms' }}>
                  <div style={{ width: '100%', height: 54, borderRadius: 6, background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))' }} />
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>Blue Ankara Set × 1</p>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)' }}>₦18,500</p>
                  <div style={{ background: 'var(--wa-green)', color: '#fff', fontSize: 9, fontWeight: 700, textAlign: 'center', padding: '5px 0', borderRadius: 5 }}>
                    Confirm Order
                  </div>
                </div>
                <div className="phone-bubble phone-bubble--in" style={{ animationDelay: '1250ms' }}>
                  Confirmed! When can I expect delivery? 🚚
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* ── Trust Marquee ── */}
      <section className="trust-banner" style={{ padding: '22px 0' }}>
        <div className="marquee-viewport no-scrollbar" style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div className="marquee-track">
            {[...Array(2)].map((_, dupe) => (
              [
                { icon: <Globe size={13} />, label: '🇳🇬 Nigeria · 🇬🇭 Ghana · 🇰🇪 Kenya · 🇿🇦 South Africa' },
                { icon: <CreditCard size={13} />, label: 'Paystack & Flutterwave secured' },
                { icon: <MessageCircle size={13} />, label: 'Built on WhatsApp Business' },
                { icon: <Zap size={13} />, label: 'Live stores in under 2 minutes' },
                { icon: <Users size={13} />, label: `${homeContent.stats.sellerCount} strong` },
              ].map((item, i) => (
                <div key={`${dupe}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent)', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))
            ))}
          </div>
        </div>
      </section>

      {/* ── Storefront Showcase ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) 20px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(22px, 4vw, 34px)', marginBottom: 52 }}>
            Your favorite stores' websites<br />are powered by Frontstore
          </h2>
          <div className="storefront-showcase">
            {STORE_SHOWCASE.map((store, i) => (
              <div
                key={store.slug}
                className="storefront-card animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="storefront-card__bar">
                  <span className="storefront-card__dot" />
                  <span className="storefront-card__dot" />
                  <span className="storefront-card__dot" />
                  <span className="storefront-card__url">frontstore.app/{store.slug}</span>
                </div>
                <div className="storefront-card__banner" style={{ background: store.gradient }}>
                  <div className="storefront-card__logo">{store.emoji}</div>
                  <span className="storefront-card__verified">
                    <Check size={9} strokeWidth={3.5} /> Verified
                  </span>
                </div>
                <div className="storefront-card__body">
                  <p className="storefront-card__name">{store.name}</p>
                  <div className="storefront-card__grid">
                    {store.products.map((p, j) => (
                      <div key={j} className="storefront-card__tile" style={{ background: p.bg }}>
                        <span className="storefront-card__price">{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sell Any Kind of Product or Service ── */}
      <section style={{
        padding: 'clamp(56px, 8vw, 88px) 20px',
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>Built For Every Business</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
              Sell any kind of product, service, or booking
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 560, margin: '12px auto 0' }}>
              Whatever your business looks like, Frontstore adapts the storefront and checkout flow to match how you actually sell.
            </p>
          </div>

          <div className="category-grid">
            {SELL_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="category-card hover-lift animate-fade-in"
                  style={{
                    '--cat-color': cat.color,
                    '--cat-bg': cat.bg,
                    padding: 28,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    animationDelay: `${idx * 70}ms`,
                  } as React.CSSProperties}
                >
                  <div className="category-card__icon">
                    <Icon size={24} color={cat.color} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800, marginBottom: 7, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Billion-Dollar Brand Architecture Showcase ── */}
      <section style={{
        padding: 'clamp(56px, 8vw, 88px) 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{homeContent.platformSuite.eyebrow}</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>{homeContent.platformSuite.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 600, margin: '12px auto 0' }}>
              {homeContent.platformSuite.description}
            </p>
          </div>

          <div className="bento-grid">
            {homeContent.platformSuite.items.map((prod, idx) => {
              const featured = idx < 2;
              const hues = [
                { color: 'var(--primary)', bg: 'var(--primary-light)' },
                { color: 'hsl(142, 71%, 40%)', bg: 'hsl(142, 71%, 94%)' },
                { color: 'hsl(200, 98%, 42%)', bg: 'hsl(200, 98%, 94%)' },
                { color: 'hsl(250, 84%, 58%)', bg: 'hsl(250, 84%, 95%)' },
                { color: 'hsl(280, 70%, 52%)', bg: 'hsl(280, 70%, 95%)' },
                { color: 'hsl(340, 82%, 50%)', bg: 'hsl(340, 82%, 95%)' },
                { color: 'hsl(38, 92%, 45%)', bg: 'hsl(38, 92%, 93%)' },
                { color: 'hsl(170, 70%, 36%)', bg: 'hsl(170, 70%, 94%)' },
              ][idx % 8];
              const icon = [
                <Store key="store" size={featured ? 26 : 22} color={hues.color} />,
                <MessageCircle key="message" size={featured ? 26 : 22} color={hues.color} />,
                <CreditCard key="credit" size={22} color={hues.color} />,
                <Users key="users" size={22} color={hues.color} />,
                <Brain key="brain" size={22} color={hues.color} />,
                <Megaphone key="mega" size={22} color={hues.color} />,
                <Zap key="zap" size={22} color={hues.color} />,
                <Globe key="globe" size={22} color={hues.color} />,
              ][idx % 8];

              return (
                <div
                  key={idx}
                  className={`card hover-lift ${featured ? 'bento-span-3' : 'bento-span-2'}`}
                  style={{
                    padding: featured ? '32px' : '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="icon-tile" style={{
                      width: featured ? 56 : 52, height: featured ? 56 : 52,
                      background: hues.bg,
                    }}>
                      {icon}
                    </div>
                    <span className="badge badge-verified" style={{ textTransform: 'none', fontSize: 10 }}>{prod.badge}</span>
                  </div>

                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: featured ? 20 : 17, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                      {prod.brand}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 12 }}>
                      {prod.tagline}
                    </p>
                    <p style={{ fontSize: featured ? 14 : 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {prod.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What Makes Frontstore Different (Comparison Matrix) ── */}
      <section style={{
        padding: 'clamp(56px, 8vw, 88px) 20px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-accent" style={{ marginBottom: 12 }}>{homeContent.comparison.eyebrow}</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>{homeContent.comparison.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 500, margin: '12px auto 0' }}>
              {homeContent.comparison.description}
            </p>
          </div>
          
          <div className="card" style={{ overflowX: 'auto', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', padding: 0 }}>
            <table className="no-scrollbar" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ padding: '18px 20px 14px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{homeContent.comparison.columns[0]}</th>
                  <th style={{ padding: '14px 20px 10px', fontSize: 14, fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="badge badge-primary" style={{ width: 'fit-content', marginBottom: 2, background: 'var(--primary)', color: '#fff' }}>Winner</span>
                      {homeContent.comparison.columns[1]}
                    </div>
                  </th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{homeContent.comparison.columns[2]}</th>
                  <th style={{ padding: '18px 20px 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{homeContent.comparison.columns[3]}</th>
                </tr>
              </thead>
              <tbody>
                {homeContent.comparison.rows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderTop: '1px solid var(--border)',
                      transition: 'background var(--t-fast) var(--ease)',
                    }}
                    className="comparison-row"
                  >
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.feat}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text)', background: 'var(--primary-light)', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
                        <Check size={14} color="var(--primary)" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} /> {row.alo}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
                        <X size={13} color="var(--text-faint)" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} /> {row.sho}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
                        <X size={13} color="var(--text-faint)" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} /> {row.oth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Operating System Vision Quote Callout ── */}
      <section className="hero-dark" style={{
        padding: 'clamp(64px, 10vw, 96px) 20px',
        textAlign: 'center',
      }}>
        {/* Decorative circle shapes */}
        <div style={{
          position: 'absolute', top: '-50%', left: '-20%', width: 500, height: 500,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-50%', right: '-20%', width: 500, height: 500,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
        }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="badge" style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: 24,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {homeContent.vision.eyebrow}
          </span>
          <blockquote style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(20px, 4.2vw, 30px)',
            fontWeight: 800,
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            marginBottom: 24,
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            "{homeContent.vision.quote}"
          </blockquote>
          <cite style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontStyle: 'normal', fontWeight: 600 }}>
            {homeContent.vision.cite}
          </cite>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: 'clamp(40px, 8vw, 72px) 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>{homeContent.howItWorks.eyebrow}</span>
            <h2 className="text-title">{homeContent.howItWorks.title}</h2>
          </div>
          <div className="step-rail">
            {homeContent.howItWorks.items.map((item, i) => (
              <div key={item.step} className="step-rail__item animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="step-rail__num">{i + 1}</div>
                <div style={{ paddingTop: 6 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {homeContent.testimonials.items.length > 0 && (
      <section className="trust-banner" style={{ padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge" style={{ marginBottom: 12, display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>{homeContent.testimonials.eyebrow}</span>
            <h2 className="text-title" style={{ color: '#fff' }}>{homeContent.testimonials.title}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {homeContent.testimonials.items.map((t, i) => (
              <div key={t.name} className="testimonial-overlap animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div
                  className="testimonial-overlap__avatar"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, color: t.color, fontWeight: 800, fontSize: 24, fontFamily: 'var(--font-heading)' }}
                >
                  {t.initial}
                </div>
                <div className="testimonial-overlap__card">
                  <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} fill="var(--accent)" color="var(--accent)" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 14 }}>
                    "{t.text}"
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Final CTA ── */}
      <section style={{ padding: 'clamp(40px, 8vw, 64px) 20px', background: 'var(--bg-2)' }}>
        <div className="hero-dark cta-inset" style={{
          padding: 'clamp(48px, 9vw, 76px) 20px',
          textAlign: 'center',
        }}>
          <div className="hero-blob" style={{ top: '-40%', left: '-10%', width: 320, height: 320, background: 'rgba(255,255,255,0.05)' }} />
          <div className="hero-blob" style={{ bottom: '-45%', right: '-8%', width: 340, height: 340, background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
            <h2 className="text-title" style={{ color: '#fff', marginBottom: 12 }}>
              Ready to start selling on WhatsApp?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
              Join 1,200+ African sellers already using Frontstore to grow their business. Free to start — no credit card needed.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <a
                href="/signup"
                className="btn"
                style={{
                  background: '#fff', color: 'var(--primary-dark)',
                  padding: '15px 28px', fontSize: 15, borderRadius: 'var(--r-xl)',
                  fontFamily: 'var(--font-heading)', fontWeight: 800,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                }}
                id="cta-get-started"
              >
                Create Your Free Store <ArrowRight size={16} />
              </a>
              <a
                href="/demo"
                className="btn"
                style={{
                  padding: '15px 28px', fontSize: 15, borderRadius: 'var(--r-xl)',
                  background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, textDecoration: 'none',
                }}
              >
                See a live demo
              </a>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
              Takes less than 2 minutes. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Logo size={20} textColor="var(--primary)" text={appName} />
        <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
          © {new Date().getFullYear()} {appName}. Conversational Commerce Platform.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
          <a href="/about" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>About</a>
          <a href="#how-it-works" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>How it works</a>
          <a href="/stores" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Stores</a>
          <a href="/blog" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</a>
          <a href={isLoggedIn ? '/dashboard' : '/signup'} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>{isLoggedIn ? 'Dashboard' : 'Sign up'}</a>
          <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>

    </div>
  );
}
