'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, Link, BarChart3, Globe,
  Store, Star, ArrowRight, User, MessageCircle,
  CreditCard, Users, Brain, Megaphone, TrendingUp, Check, X,
  PenTool, Play
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { RESERVED_SUBDOMAINS } from '../utils/reservedKeywords';

// ── Sample Store Feature Cards ───────────────────────────────────────────────
const FEATURES = [
  {
    title: 'WhatsApp-Native Checkout',
    body: 'No complex payment setup. Customers browse, tap "Order on WhatsApp", and land directly in your chat with a pre-filled message ready to send.',
    color: 'hsl(142, 71%, 45%)',
    bg: 'hsl(142, 71%, 96%)',
  },
  {
    title: 'AI-Powered Listings',
    body: 'Upload a photo — ChatGPT AI writes your product descriptions, suggests local prices, and creates searchable tags in seconds.',
    color: 'hsl(250, 84%, 60%)',
    bg: 'hsl(250, 84%, 97%)',
  },
  {
    title: 'Ultra-Fast Loading',
    body: 'Optimized for African mobile networks. Static pages load in under 2 seconds even on 3G, keeping your bounce rate low and buyers engaged.',
    color: 'hsl(38, 92%, 50%)',
    bg: 'hsl(38, 92%, 96%)',
  },
  {
    title: 'Shareable Store Links',
    body: 'Your store gets a clean frontstore link — share it on Instagram bio, TikTok profile, or WhatsApp status to drive traffic instantly.',
    color: 'hsl(200, 98%, 45%)',
    bg: 'hsl(200, 98%, 96%)',
  },
  {
    title: 'Simple Order Tracking',
    body: "Every order creates a trackable record. See what's pending, confirmed, or shipped — all in one clean dashboard.",
    color: 'hsl(340, 82%, 55%)',
    bg: 'hsl(340, 82%, 97%)',
  },
  {
    title: 'Multi-Currency Support',
    body: 'Sell in NGN, GHS, KES, ZAR and more. frontstore handles local currency formatting so prices feel right to your local buyers.',
    color: 'hsl(170, 70%, 40%)',
    bg: 'hsl(170, 70%, 96%)',
  },
] as const;

const TESTIMONIALS = [
  {
    name: 'Chioma A.',
    role: 'Fashion Vendor, Lagos',
    initial: 'C',
    bg: 'hsl(142, 70%, 94%)',
    color: 'hsl(142, 70%, 35%)',
    text: 'I set up my store in 5 minutes and got 3 orders the same day via WhatsApp. frontstore is a game changer for small businesses.',
    stars: 5,
  },
  {
    name: 'Kwame O.',
    role: 'Electronics Reseller, Accra',
    initial: 'K',
    bg: 'hsl(210, 80%, 94%)',
    color: 'hsl(210, 80%, 35%)',
    text: 'My customers love how easy it is to browse and order. The WhatsApp button makes them feel comfortable and trusted.',
    stars: 5,
  },
  {
    name: 'Fatima B.',
    role: 'Food Vendor, Kano',
    initial: 'F',
    bg: 'hsl(340, 80%, 94%)',
    color: 'hsl(340, 80%, 35%)',
    text: 'Before frontstore I was sending photos one-by-one on WhatsApp. Now I just share my store link and let customers browse themselves!',
    stars: 5,
  },
] as const;

const HOW_IT_WORKS = [
  { step: '01', title: 'Claim your URL', body: 'Type your business name and claim your branded store link in seconds.' },
  { step: '02', title: 'Add your products', body: 'Upload photos, add prices, and let AI write descriptions for you.' },
  { step: '03', title: 'Share & sell', body: 'Drop your store link on WhatsApp, Instagram, or TikTok and start receiving orders.' },
] as const;

const DEFAULT_PLATFORM_SUITE = [
  {
    brand: 'Online Store',
    tagline: 'Your store ready in 2 minutes',
    desc: 'Generate a stunning, mobile-ready product catalog in under 2 minutes. No coding, no website builder — just add your products and go.',
    badge: 'Core Feature'
  },
  {
    brand: 'WhatsApp Checkout',
    tagline: 'Sell directly in WhatsApp',
    desc: 'Customers browse your store and tap "Order" — their message lands in your WhatsApp chat, pre-filled and ready to confirm.',
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
];

const DEFAULT_COMPARISON_ROWS = [
  { feat: 'WhatsApp-first Checkout', alo: 'Direct order details sent straight to merchant chat', sho: 'Generic web-cart & email confirmations', oth: 'Partial integrations / web-redirects' },
  { feat: 'AI-assisted Listings', alo: 'Upload photo → Auto price, tags, and rich descriptions', sho: 'Manual data entry required', oth: 'No built-in AI catalog tool' },
  { feat: 'Mobile-first Merchant Operations', alo: 'Manage store fully on 3G mobile network', sho: 'Complex desk-oriented admin dashboard', oth: 'Limited mobile configuration' },
  { feat: 'African Payment Rails', alo: 'Escrow options + Paystack/Flutterwave/Mobile Money', sho: 'High card fees, complex setup for Africa', oth: 'Standard payments only, no escrow' },
  { feat: 'Setup Speed', alo: 'Under 2 minutes (claim & launch immediately)', sho: 'Hours/Days of theme editing', oth: '5-15 minutes configuration' },
];

const DEFAULT_HOME_CONTENT = {
  hero: {
    badges: ['Under 2 Minutes Setup', 'Conversational Commerce'],
    titlePrefix: 'Turn WhatsApp Conversations Into',
    titleHighlight: 'Sales',
    description: 'Build a beautiful online store, accept orders, manage customers, and grow your business from a single platform designed for Africa.',
    primaryButton: { label: 'Start Free', href: '#store-name-input' },
    secondaryButton: { label: 'Book Demo', href: '#book-demo' },
  },
  stats: {
    sellerCount: '1,200+ sellers',
    text: 'already selling on Frontstore',
  },
  narrative: {
    eyebrow: 'Our Narrative',
    title: 'Commerce Through Conversation',
    body: "Most African businesses don't need complicated ecommerce websites before they can start selling with confidence. They need a fast way to show products, answer questions, confirm orders, and collect buyer details without leaving the channel their customers already trust.\n\nThat channel is WhatsApp. It is where discovery, negotiation, referrals, payment conversations, and repeat purchases already happen every day.\n\nFrontstore turns those conversations into a structured commerce system. A merchant can launch a branded store, organize products, share one link, receive clear order intent, and keep customer conversations moving toward payment and delivery.\n\nInstead of forcing sellers to choose between a website and WhatsApp, Frontstore connects both. The store gives buyers a clean catalog experience, while WhatsApp keeps the human relationship that drives trust.\n\nThe result is simple: sellers look more professional, customers understand what to buy, and every conversation has a clearer path to revenue.",
    steps: [
      { title: 'Create a Store', desc: 'Add products in 2 mins' },
      { title: 'Share a Link', desc: 'Status, Instagram, TikTok' },
      { title: 'Receive Orders', desc: 'Directly in WhatsApp' },
      { title: 'Manage Customers', desc: 'Conversation-driven CRM' },
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
  features: {
    eyebrow: 'Features',
    title: 'Built for how business is done in Africa',
    description: 'Every feature is designed for African sellers — low bandwidth, WhatsApp-first, and mobile-optimized.',
    items: FEATURES,
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
    return {
      ...DEFAULT_HOME_CONTENT,
      ...parsed,
      hero: { ...DEFAULT_HOME_CONTENT.hero, ...(parsed.hero || {}) },
      stats: { ...DEFAULT_HOME_CONTENT.stats, ...(parsed.stats || {}) },
      narrative: { ...DEFAULT_HOME_CONTENT.narrative, ...(parsed.narrative || {}) },
      platformSuite: { ...DEFAULT_HOME_CONTENT.platformSuite, ...(parsed.platformSuite || {}) },
      comparison: { ...DEFAULT_HOME_CONTENT.comparison, ...(parsed.comparison || {}) },
      vision: { ...DEFAULT_HOME_CONTENT.vision, ...(parsed.vision || {}) },
      howItWorks: { ...DEFAULT_HOME_CONTENT.howItWorks, ...(parsed.howItWorks || {}) },
      features: { ...DEFAULT_HOME_CONTENT.features, ...(parsed.features || {}) },
      testimonials: { ...DEFAULT_HOME_CONTENT.testimonials, ...(parsed.testimonials || {}) },
    };
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}

const getFeatureIcon = (title: string, color: string) => {
  switch (title) {
    case 'WhatsApp-Native Checkout':
      return <WhatsAppIcon size={22} color={color} />;
    case 'AI-Powered Listings':
      return <PenTool size={22} color={color} />;
    case 'Ultra-Fast Loading':
      return <Zap size={22} color={color} />;
    case 'Shareable Store Links':
      return <Link size={22} color={color} />;
    case 'Simple Order Tracking':
      return <BarChart3 size={22} color={color} />;
    case 'Multi-Currency Support':
      return <Globe size={22} color={color} />;
    default:
      return <Store size={22} color={color} />;
  }
};

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
  const narrativeParagraphs = homeContent.narrative.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  
  // Demo modal state variables
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoBusiness, setDemoBusiness] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleBookDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoBusiness.trim() || !demoPhone.trim()) {
      return;
    }
    // Simulate booking demo submission
    setDemoSubmitted(true);
    setTimeout(() => {
      setShowDemoModal(false);
      setDemoSubmitted(false);
      setDemoName('');
      setDemoBusiness('');
      setDemoPhone('');
      setDemoEmail('');
    }, 2500);
  };

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
      <nav
        className="glass home-nav"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Logo size={24} textColor="var(--primary)" text={appName} />

        <div className="home-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <a
            href="/"
            className="btn btn-ghost home-nav-link"
            style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}
          >
            Home
          </a>
          <a
            href="#about"
            className="btn btn-ghost home-nav-link"
            style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}
          >
            About
          </a>
          <a
            href="#how-it-works"
            className="btn btn-ghost home-nav-link"
            style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}
          >
            How it works
          </a>
          <a
            href="/blog"
            className="btn btn-ghost home-nav-link"
            style={{ padding: '8px 10px', fontSize: 13, textDecoration: 'none' }}
          >
            Blog
          </a>
          {isLoggedIn ? (
            <a
              href="/dashboard"
              className="btn btn-primary"
              style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              id="nav-dashboard"
            >
              Dashboard <ArrowRight size={14} />
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="btn btn-ghost"
                style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="btn btn-primary"
                style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                id="nav-get-started"
              >
                Get started <ArrowRight size={14} />
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{
        padding: 'clamp(48px, 10vw, 96px) 20px clamp(48px, 8vw, 72px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background blob */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '80vw', maxWidth: 600, height: '60%',
          background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          {/* Pill badges */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <span className="badge badge-primary" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> {homeContent.hero.badges[0]}
            </span>
            <span className="badge badge-verified" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Globe size={11} /> {homeContent.hero.badges[1]}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-display"
            style={{ marginBottom: 20, maxWidth: 620, margin: '0 auto 20px', lineHeight: 1.15 }}
          >
            {homeContent.hero.titlePrefix}{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(142, 70%, 49%), hsl(168, 76%, 36%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {homeContent.hero.titleHighlight}
            </span>
          </h1>

          <p style={{
            color: 'var(--text-muted)',
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
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--r-xl)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {homeContent.hero.primaryButton.label} <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                if (homeContent.hero.secondaryButton.href && homeContent.hero.secondaryButton.href !== '#book-demo') {
                  window.location.href = homeContent.hero.secondaryButton.href;
                  return;
                }
                setShowDemoModal(true);
              }}
              className="btn btn-outline"
              style={{ padding: '14px 28px', fontSize: 15, borderRadius: 'var(--r-xl)' }}
            >
              {homeContent.hero.secondaryButton.label}
            </button>
          </div>

          {/* Claim form */}
          <div style={{ maxWidth: 440, margin: '0 auto 32px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>
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
                <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
                  Your store will be at <strong style={{ color: 'var(--text-muted)' }}>{systemDomain}/yourname</strong>
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
                    border: '2px solid var(--bg)',
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: 5 - i,
                  }}
                >
                  <User size={13} strokeWidth={2.5} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{homeContent.stats.sellerCount}</strong> {homeContent.stats.text}
            </p>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @media (max-width: 640px) {
          .home-nav {
            padding: 10px 12px !important;
            gap: 10px !important;
          }
          .home-nav-actions {
            gap: 4px !important;
          }
          .home-nav-actions a {
            padding: 7px 9px !important;
            font-size: 12px !important;
          }
          .home-nav-actions .home-nav-link {
            display: none !important;
          }
          #nav-get-started svg,
          #nav-dashboard svg {
            display: none !important;
          }
          #store-name-input {
            font-size: 14px !important;
            padding: 10px 8px !important;
          }
          #claim-url-btn {
            padding: 10px 12px !important;
            min-width: 118px !important;
          }
          #claim-url-btn svg {
            display: none !important;
          }
          footer {
            justify-content: center !important;
            text-align: center !important;
          }
        }

        @media (max-width: 430px) {
          #claim-url-btn {
            min-width: 104px !important;
            font-size: 12px !important;
          }
          .badge {
            white-space: normal;
          }
        }
      `}</style>

      {/* ── Premium Brand Narrative ── */}
      <section id="about" style={{
        padding: 'clamp(56px, 8vw, 88px) 20px',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface-2) 100%)',
        borderTop: '1px solid var(--border)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-accent" style={{ marginBottom: 16 }}>{homeContent.narrative.eyebrow}</span>
          <h2 className="text-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: 32 }}>
            {homeContent.narrative.title}
          </h2>
          
          <div className="card animate-fade-in" style={{
            padding: '40px 30px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background glow */}
            <div style={{
              position: 'absolute', top: '-20%', right: '-10%',
              width: 300, height: 300,
              background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            
            <div style={{
              display: 'grid',
              gap: 18,
              marginBottom: 36,
              position: 'relative',
              zIndex: 1
            }}>
              {narrativeParagraphs.map((paragraph, index) => (
                <p key={index} style={{
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  lineHeight: 1.75,
                  color: index === 0 ? 'var(--text)' : 'var(--text-2)',
                  fontWeight: index === 0 ? 650 : 500,
                  margin: 0
                }}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* Steps timeline */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 20,
              borderTop: '1px solid var(--border)',
              paddingTop: 32
            }}>
              {homeContent.narrative.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{step.title}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 32 }}>{step.desc}</span>
                </div>
              ))}
            </div>
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
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{homeContent.platformSuite.eyebrow}</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>{homeContent.platformSuite.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 600, margin: '12px auto 0' }}>
              {homeContent.platformSuite.description}
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}>
            {homeContent.platformSuite.items.map((prod, idx) => (
              <div
                key={idx}
                className="card hover-lift"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--r-md)',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {[<Store key="store" size={22} color="var(--primary)" />, <MessageCircle key="message" size={22} color="hsl(142, 71%, 45%)" />, <CreditCard key="credit" size={22} color="hsl(200, 98%, 45%)" />, <Users key="users" size={22} color="hsl(250, 84%, 60%)" />, <Brain key="brain" size={22} color="hsl(280, 70%, 55%)" />, <Megaphone key="mega" size={22} color="hsl(340, 82%, 55%)" />, <TrendingUp key="trend" size={22} color="hsl(38, 92%, 50%)" />][idx % 7]}
                  </div>
                  <span className="badge badge-verified" style={{ textTransform: 'none', fontSize: 10 }}>{prod.badge}</span>
                </div>
                
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                    {prod.brand}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 12 }}>
                    {prod.tagline}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {prod.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Makes Frontstore Different (Comparison Matrix) ── */}
      <section style={{
        padding: 'clamp(56px, 8vw, 88px) 20px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-accent" style={{ marginBottom: 12 }}>{homeContent.comparison.eyebrow}</span>
            <h2 className="text-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>{homeContent.comparison.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16, maxWidth: 500, margin: '12px auto 0' }}>
              {homeContent.comparison.description}
            </p>
          </div>
          
          <div className="card" style={{ overflowX: 'auto', background: 'var(--surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{homeContent.comparison.columns[0]}</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)' }}>{homeContent.comparison.columns[1]}</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{homeContent.comparison.columns[2]}</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{homeContent.comparison.columns[3]}</th>
                </tr>
              </thead>
              <tbody>
                {homeContent.comparison.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.feat}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text)', background: 'var(--primary-light)', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Check size={14} color="var(--primary)" strokeWidth={3} /> {row.alo}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>{row.sho}</td>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--text-muted)' }}>{row.oth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Operating System Vision Quote Callout ── */}
      <section style={{
        padding: 'clamp(64px, 10vw, 96px) 20px',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
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
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>{homeContent.howItWorks.eyebrow}</span>
            <h2 className="text-title">{homeContent.howItWorks.title}</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {homeContent.howItWorks.items.map((item, i) => (
              <div
                key={item.step}
                className="card hover-lift animate-fade-in"
                style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  position: 'absolute', top: -16, right: -8,
                  fontSize: 64, fontWeight: 900, color: 'var(--primary-light)',
                  fontFamily: 'var(--font-heading)', lineHeight: 1,
                  userSelect: 'none',
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--r-md)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
                  marginBottom: 14,
                }}>
                  {i + 1}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>{homeContent.features.eyebrow}</span>
            <h2 className="text-title">{homeContent.features.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 15, maxWidth: 500, margin: '12px auto 0' }}>
              {homeContent.features.description}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {homeContent.features.items.map((f, i) => (
              <div
                key={f.title}
                className="card hover-lift animate-fade-in"
                style={{ padding: '22px', display: 'flex', gap: 14, animationDelay: `${i * 60}ms` }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  background: f.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {getFeatureIcon(f.title, f.color)}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 72px) 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="badge badge-accent" style={{ marginBottom: 12, display: 'inline-block' }}>{homeContent.testimonials.eyebrow}</span>
            <h2 className="text-title">{homeContent.testimonials.title}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {homeContent.testimonials.items.map((t, i) => (
              <div key={t.name} className="card animate-fade-in" style={{ padding: '22px', animationDelay: `${i * 80}ms` }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="var(--accent)" color="var(--accent)" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: t.bg, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-heading)'
                  }}>
                    {t.initial}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        padding: 'clamp(48px, 10vw, 80px) 20px',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, hsl(178, 70%, 45%) 100%)',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\") repeat",
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
          <h2 className="text-title" style={{ color: '#fff', marginBottom: 12 }}>
            Ready to start selling on WhatsApp?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
            Join 1,200+ African sellers already using Frontstore to grow their business. Free to start — no credit card needed.
          </p>
          <a
            href="/signup"
            className="btn"
            style={{
              background: '#fff', color: 'var(--primary)',
              padding: '16px 32px', fontSize: 16, borderRadius: 'var(--r-xl)',
              fontFamily: 'var(--font-heading)', fontWeight: 800,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            }}
            id="cta-get-started"
          >
            Create Your Free Store <ArrowRight size={16} />
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 14 }}>
            Takes less than 2 minutes. No credit card required.
          </p>
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
          <a href="#about" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>About</a>
          <a href="#how-it-works" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>How it works</a>
          <a href="/blog" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</a>
          <a href={isLoggedIn ? '/dashboard' : '/signup'} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>{isLoggedIn ? 'Dashboard' : 'Sign up'}</a>
          <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>

      {/* ── Demo Booking Modal ── */}
      {showDemoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => setShowDemoModal(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }} 
          />
          
          {/* Modal Container */}
          <div 
            className="card animate-scale-in"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 460,
              background: 'var(--surface)',
              padding: 32,
              borderRadius: 'var(--r-2xl)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1001,
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowDemoModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                <Play size={24} />
              </div>
              <h3 className="text-title" style={{ marginBottom: 6 }}>Book a Live Demo</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                See how Frontstore can help you sell more, manage orders, and grow your business on WhatsApp.
              </p>
            </div>
            
            {demoSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'hsl(142, 71%, 96%)', color: 'hsl(142, 71%, 45%)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Check size={28} strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Demo Request Received!</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  One of our WhatsApp Commerce specialists will reach out to you on <strong>{demoPhone}</strong> via WhatsApp shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookDemo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="demo-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Your Name *
                  </label>
                  <input 
                    type="text" 
                    id="demo-name"
                    required
                    placeholder="e.g. Adebayo Benson"
                    value={demoName}
                    onChange={e => setDemoName(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 14 }}
                  />
                </div>
                
                <div>
                  <label htmlFor="demo-business" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Business Name *
                  </label>
                  <input 
                    type="text" 
                    id="demo-business"
                    required
                    placeholder="e.g. Benson Fashion Hub"
                    value={demoBusiness}
                    onChange={e => setDemoBusiness(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 14 }}
                  />
                </div>
                
                <div>
                  <label htmlFor="demo-phone" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    WhatsApp Number *
                  </label>
                  <input 
                    type="tel" 
                    id="demo-phone"
                    required
                    placeholder="e.g. +234 80 1234 5678"
                    value={demoPhone}
                    onChange={e => setDemoPhone(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 14 }}
                  />
                </div>
                
                <div>
                  <label htmlFor="demo-email" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Email Address (Optional)
                  </label>
                  <input 
                    type="email" 
                    id="demo-email"
                    placeholder="e.g. adebayo@gmail.com"
                    value={demoEmail}
                    onChange={e => setDemoEmail(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 14 }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-xl)', fontSize: 14, marginTop: 8 }}
                >
                  Schedule Demo Call
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
