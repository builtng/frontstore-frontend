'use client';

import React, { useState } from 'react';
import { 
  PublicSiteNav, 
  PublicSiteFooter 
} from '@/components/PublicSiteChrome';
import { 
  Store, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  ShoppingBag, 
  Globe, 
  MessageCircle, 
  Sparkles, 
  CreditCard, 
  TrendingUp, 
  BarChart3, 
  Copy, 
  Check, 
  ChevronDown, 
  Star, 
  Sliders, 
  Lock, 
  Plus,
  Shirt,
  Coffee,
  ShieldCheck,
  Clock,
  Truck
} from 'lucide-react';

interface ProductSample {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: string;
}

const CATEGORY_DATA: Record<string, { label: string; icon: any; banner: string; products: ProductSample[] }> = {
  fashion: {
    label: 'Fashion & Apparel',
    icon: Shirt,
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    products: [
      { id: '1', name: 'Silk Satin Wrap Dress', price: '₦28,500', originalPrice: '₦35,000', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80', badge: 'Best Seller' },
      { id: '2', name: 'Minimalist Leather Tote Bag', price: '₦18,000', originalPrice: '₦22,000', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', badge: 'Hot' },
      { id: '3', name: 'Oversized Street Linen Shirt', price: '₦14,500', originalPrice: '₦18,000', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
      { id: '4', name: 'Classic Retro Sunglasses', price: '₦9,500', originalPrice: '₦12,000', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80', badge: 'Trending' }
    ]
  },
  beauty: {
    label: 'Skincare & Cosmetics',
    icon: Sparkles,
    banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    products: [
      { id: '1', name: 'Hydrating Botanical Elixir', price: '₦12,500', originalPrice: '₦15,000', image: 'https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&w=600&q=80', badge: 'Organic' },
      { id: '2', name: 'Radiance Vitamin C Serum', price: '₦9,800', originalPrice: '₦12,000', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', badge: 'Popular' },
      { id: '3', name: 'Sheer Glow Tinted Lip Oil', price: '₦6,500', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
      { id: '4', name: 'Purifying Charcoal Face Mask', price: '₦8,200', originalPrice: '₦10,500', image: 'https://images.unsplash.com/photo-1567928257065-e131468c2a0e?auto=format&fit=crop&w=600&q=80', badge: 'New' }
    ]
  },
  food: {
    label: 'Bakery & Gourmet Food',
    icon: Coffee,
    banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    products: [
      { id: '1', name: 'Artisanal Sourdough & Pastry Box', price: '₦15,000', originalPrice: '₦18,000', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', badge: 'Fresh Daily' },
      { id: '2', name: 'Belgian Chocolate Drip Cake', price: '₦32,000', originalPrice: '₦38,000', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', badge: 'Signature' },
      { id: '3', name: 'Gourmet Macaron Gift Assortment', price: '₦11,200', image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80' },
      { id: '4', name: 'Craft Cold Brew Coffee Concentrate', price: '₦7,500', originalPrice: '₦9,000', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80', badge: 'Best Seller' }
    ]
  },
  gadgets: {
    label: 'Tech & Gadgets',
    icon: Smartphone,
    banner: 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=1200&q=80',
    products: [
      { id: '1', name: 'Wireless Active Noise-Canceling Buds', price: '₦35,000', originalPrice: '₦42,000', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', badge: 'Popular' },
      { id: '2', name: 'Ultra-Slim Magnetic Power Bank 10,000mAh', price: '₦16,500', originalPrice: '₦20,000', image: 'https://images.unsplash.com/photo-1622445268465-843dcb62a11b?auto=format&fit=crop&w=600&q=80', badge: 'Fast Charge' },
      { id: '3', name: 'Smart Fitness & Health Tracker Watch', price: '₦24,900', originalPrice: '₦30,000', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
      { id: '4', name: 'Portable HD Bluetooth Speaker', price: '₦19,800', originalPrice: '₦25,000', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', badge: 'Hot' }
    ]
  }
};

const FEATURE_TABS = [
  {
    id: 'setup',
    title: '30-Second Setup',
    icon: Zap,
    badge: 'Lightning Fast',
    headline: 'Launch your store without code or technical setup',
    description: 'Enter your business name, add your items, and immediately get your personalized storefront link. Zero hosting setup, SSL certificates, or complex design themes required.',
    bullets: ['Branded storefront URL (frontstore.ng/yourname or custom domain)', 'Optimized for 99.8% mobile responsiveness', 'Automated SEO meta tags & social cards']
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Commerce',
    icon: MessageCircle,
    badge: 'Zero Friction',
    headline: 'Orders routed directly into your WhatsApp chats',
    description: 'When buyers checkout on your store, Frontstore formats the selected items, delivery details, total calculation, and customer contact into a crisp WhatsApp message ready to send with 1 click.',
    bullets: ['Automated cart items summary & delivery instructions', 'Customer phone & address included automatically', 'Clear payment status tag']
  },
  {
    id: 'payments',
    title: 'Instant Payments',
    icon: CreditCard,
    badge: 'Local & Global',
    headline: 'Accept Cards, Transfers, USSD & Apple Pay',
    description: 'Built-in integration with Paystack and Stripe. Collect payments via cards, bank transfers, USSD, and international gateways with direct payouts.',
    bullets: ['Instant payment verification links', 'Automatic digital invoice PDF receipts', 'Direct settlement into local bank account']
  },
  {
    id: 'inventory',
    title: 'Smart Stock Control',
    icon: BarChart3,
    badge: 'Real-time Controls',
    headline: 'Manage stock, variants, and orders from your phone',
    description: 'Track pending orders, set inventory levels for variants (sizes, colors), receive low-stock alerts, and view live sales analytics right from your mobile dashboard.',
    bullets: ['Multi-variant support (size, color, style)', 'Automatic inventory deduction on paid orders', 'Sales overview charts and revenue analytics']
  }
];

const COMPARISON_ROWS = [
  { feature: 'Store Creation Time', frontstore: '30 Seconds', shopify: '2 - 5 Days', instagram: 'Manual DMs' },
  { feature: 'Setup & Technical Cost', frontstore: 'Free / Zero Setup', shopify: '$29/mo + dev fee', instagram: 'Free (but lost sales)' },
  { feature: 'WhatsApp Order Routing', frontstore: 'Automated 1-Click', shopify: 'Plugin required ($)', instagram: 'Manual text exchanges' },
  { feature: 'Mobile Page Load Speed', frontstore: '< 0.3 seconds', shopify: '1.5 - 3.5 seconds', instagram: 'App dependent' },
  { feature: 'Payment Gateway Integration', frontstore: 'Built-in (Instant)', shopify: 'Complex API setup', instagram: 'Manual account details' },
  { feature: 'Automated Invoice Receipts', frontstore: 'Instant PDF Receipt', shopify: 'Requires extra App', instagram: 'None' },
];

const TESTIMONIALS = [
  {
    name: 'Amara Okonkwo',
    store: 'Luxe Apparel',
    handle: 'luxeapparel.ng',
    category: 'Fashion Retail',
    growth: '+310% Sales',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
    text: 'Frontstore completely transformed our Instagram sales flow. Instead of answering 50 price DMs every morning, customers tap our link, select their size, and send complete orders straight to WhatsApp.'
  },
  {
    name: 'Kwame Mensah',
    store: 'Kube Organics',
    handle: 'kubeorganics.store',
    category: 'Skincare',
    growth: '₦4.2M/mo',
    avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=200&q=80',
    text: 'Having card payments and instant WhatsApp notifications gave my brand instant trust. We launched our store in under 2 minutes and had our first order 10 minutes later!'
  },
  {
    name: 'Fatima Bello',
    store: 'Zest Gourmet Kitchen',
    handle: 'zestkitchen.ng',
    category: 'Bakery & Food',
    growth: '140+ Orders/Wk',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    text: 'During flash sales, DM chaos used to ruin customer experience. Frontstore handles menu selections, delivery address input, and payment receipts automatically.'
  }
];

const FAQS = [
  {
    q: 'How fast can I start selling with Frontstore?',
    a: 'You can launch your store in under 30 seconds! Simply register, choose your custom URL (e.g. frontstore.ng/yourstore), upload your first product with price & photo, and start sharing your link.'
  },
  {
    q: 'Do I need coding skills or web hosting?',
    a: 'None at all. Frontstore handles all security, high-speed hosting, SSL certificates, mobile optimization, and database storage out of the box.'
  },
  {
    q: 'How do customers place orders on my storefront?',
    a: 'Customers browse your store like a native app, select items, enter delivery details, and click Checkout. Order summaries are formatted instantly and sent to your WhatsApp or paid via integrated card payment.'
  },
  {
    q: 'Can I connect my own custom domain (e.g. www.mybrand.com)?',
    a: 'Yes! You can link your custom domain to your Frontstore store with free automatic SSL security protection.'
  },
  {
    q: 'What payment options can my customers use?',
    a: 'Your store supports debit/credit cards, bank transfers, USSD codes, and Paystack payments directly into your local bank account.'
  }
];

export default function OnlineStoreClient() {
  const [storeSlug, setStoreSlug] = useState('luxe-boutique');
  const [activeCategory, setActiveCategory] = useState<string>('fashion');
  const [cartCount, setCartCount] = useState<number>(2);
  const [activeTabId, setActiveTabId] = useState<string>('setup');
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const currentCategoryData = CATEGORY_DATA[activeCategory] || CATEGORY_DATA.fashion;
  const activeTab = FEATURE_TABS.find(t => t.id === activeTabId) || FEATURE_TABS[0];

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://frontstore.ng/${storeSlug || 'luxe-boutique'}`);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCart = (id: string) => {
    setCartCount(prev => prev + 1);
    setLastAddedId(id);
    setTimeout(() => setLastAddedId(null), 1200);
  };

  return (
    <div style={{ background: '#FFFFFF', color: '#111827', minHeight: '100vh', fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)', overflowX: 'hidden' }}>
      
      {/* ── HERO BANNER (SIGNATURE DEEP ROYAL INDIGO) ── */}
      <section style={{ 
        background: 'radial-gradient(125% 125% at 50% 10%, #042A19 0%, #021C11 60%, #01120B 100%)', 
        color: '#FFFFFF', 
        paddingTop: 0, 
        paddingBottom: 72, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Background Mesh */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(86, 68, 179, 0.25) 0%, rgba(90, 69, 209, 0) 70%)',
          pointerEvents: 'none'
        }} />
        
        <PublicSiteNav />

        <div style={{ maxWidth: 1040, padding: '48px 24px 0', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Announcement Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(165, 180, 252, 0.25)',
            padding: '7px 20px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: '#C7D2FE',
            marginBottom: 26,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <Sparkles size={15} style={{ color: '#A5B4FC' }} />
            <span>Next-Gen Storefront Builder</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 auto 22px', color: '#FFFFFF' }}>
            Launch Your Dream Storefront <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #A5B4FC 0%, #818CF8 50%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>in 30 Seconds</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(16px, 2vw, 19.5px)', color: '#CBD5E1', maxWidth: 720, margin: '0 auto 38px', lineHeight: 1.6, fontWeight: 400 }}>
            Turn your social media audience or local business into a high-speed digital store optimized for instant checkout and automated WhatsApp orders.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 54 }}>
            
            <a href="/signup" style={{ 
              background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)', 
              color: '#FFFFFF', 
              fontWeight: 700, 
              fontSize: 15.5, 
              padding: '15px 34px', 
              borderRadius: 999, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 9, 
              boxShadow: '0 10px 30px rgba(86,68,179,0.45)', 
              transition: 'all 0.25s ease'
            }}>
              <span>Create Your Store Free</span>
              <ArrowRight size={17} />
            </a>

            <a href="#simulator" style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              color: '#042A19', 
              fontWeight: 700, 
              fontSize: 15.5, 
              padding: '15px 28px', 
              borderRadius: 999, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', 
              transition: 'all 0.25s ease'
            }}>
              <span>Try Live Simulator</span>
              <Smartphone size={17} />
            </a>

          </div>

          {/* Micro Trust Indicators */}
          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', color: '#94A3B8', fontSize: 13.5, fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} style={{ color: '#34D399' }} />
              <span>0% Commission Option</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} style={{ color: '#34D399' }} />
              <span>No Coding Required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} style={{ color: '#34D399' }} />
              <span>Instant WhatsApp Checkout</span>
            </div>
          </div>

        </div>

      </section>

      {/* ── INTERACTIVE STORE SIMULATOR SECTION ── */}
      <section id="simulator" style={{ padding: '64px 20px', maxWidth: 1120, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'rgba(86, 68, 179, 0.08)', 
            color: '#0B5D39', 
            padding: '5px 14px', 
            borderRadius: 999, 
            fontSize: 12, 
            fontWeight: 800, 
            letterSpacing: '0.06em', 
            textTransform: 'uppercase',
            marginBottom: 10
          }}>
            <Sparkles size={13} />
            <span>Interactive Live Preview</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 40px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>
            See How Your Store Will Look
          </h2>
          <p style={{ color: '#64748B', fontSize: 15.5, maxWidth: 580, margin: '8px auto 0', lineHeight: 1.55 }}>
            Customize your store URL, switch business categories, and test adding items to your cart in real-time.
          </p>
        </div>

        {/* Simulator Controls Bar */}
        <div style={{ 
          background: '#F8FAFC', 
          border: '1px solid #E2E8F0', 
          borderRadius: 20, 
          padding: '16px 20px', 
          display: 'flex', 
          gap: 16, 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
        }}>
          
          {/* Custom Slug Input */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#FFFFFF', 
            border: '1.5px solid #CBD5E1', 
            borderRadius: 14, 
            padding: '8px 16px',
            maxWidth: 420,
            width: '100%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s ease'
          }}>
            <Globe size={16} style={{ color: '#64748B', marginRight: 8, flexShrink: 0 }} />
            <span style={{ color: '#64748B', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>frontstore.ng/</span>
            <input 
              type="text" 
              value={storeSlug} 
              onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="yourname"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: '#0B5D39', 
                fontWeight: 800, 
                fontSize: 15,
                width: '100%',
                paddingLeft: 2
              }}
            />
            <button 
              onClick={handleCopyLink}
              title="Copy Store URL"
              style={{ 
                background: copiedLink ? '#ECFDF5' : '#F1F5F9', 
                border: 'none', 
                color: copiedLink ? '#059669' : '#475569', 
                cursor: 'pointer', 
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Category Selector Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(CATEGORY_DATA).map(([catKey, catVal]) => {
              const isActive = activeCategory === catKey;
              const IconComp = catVal.icon;
              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#475569',
                    border: isActive ? '1.5px solid #0B5D39' : '1px solid #CBD5E1',
                    padding: '9px 18px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    boxShadow: isActive ? '0 4px 14px rgba(86, 68, 179, 0.3)' : '0 1px 2px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <IconComp size={14} style={{ color: isActive ? '#FFFFFF' : '#64748B' }} />
                  <span>{catVal.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* ── BROWSER MOCKUP FRAME ── */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: 24, 
          border: '1px solid #E2E8F0', 
          overflow: 'hidden', 
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.15), 0 8px 24px -4px rgba(86, 68, 179, 0.08)',
          transition: 'all 0.3s ease'
        }}>
          
          {/* MacOS Dark Header Bar */}
          <div style={{ 
            background: '#0F172A', 
            padding: '12px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            {/* macOS Window Controls */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10B981' }} />
            </div>

            {/* Address Bar Pill */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              color: '#E2E8F0', 
              padding: '5px 22px', 
              borderRadius: 999, 
              fontSize: 12.5, 
              fontWeight: 500, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Lock size={12} style={{ color: '#10B981' }} />
              <span>frontstore.ng/<strong style={{ color: '#A5B4FC', fontWeight: 800 }}>{storeSlug || 'luxe-boutique'}</strong></span>
            </div>

            {/* Live Verified Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 800, letterSpacing: '0.05em' }}>VERIFIED</span>
            </div>
          </div>

          {/* Store Banner & Brand Header inside Mockup */}
          <div style={{ position: 'relative', minHeight: 180, overflow: 'hidden' }}>
            {/* Cover Image */}
            <img 
              src={currentCategoryData.banner} 
              alt="Store Cover Banner" 
              style={{ width: '100%', height: 180, objectFit: 'cover' }} 
            />
            {/* Gradient Overlay for Legibility */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)' 
            }} />
            
            {/* Store Profile Info Overlay */}
            <div style={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 24, 
              right: 24, 
              display: 'flex', 
              alignItems: 'flex-end', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Store Avatar Badge */}
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 18, 
                  background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 900, 
                  fontSize: 24, 
                  color: '#FFFFFF', 
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  border: '3px solid #FFFFFF'
                }}>
                  {(storeSlug || 'L').charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em', textTransform: 'capitalize' }}>
                      {(storeSlug || 'luxe-boutique').replace(/-/g, ' ')}
                    </h3>
                    <ShieldCheck size={18} style={{ color: '#38BDF8' }} />
                  </div>
                  
                  {/* Rating & Meta Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, color: '#FFFFFF', fontWeight: 700 }}>
                      <Star size={12} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                      <span>4.9 (128 reviews)</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} style={{ color: '#A5B4FC' }} />
                      <span>Responds in 5 mins</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Floating Cart Button */}
              <div style={{ 
                background: '#10B981', 
                color: '#FFFFFF', 
                padding: '8px 18px', 
                borderRadius: 999, 
                fontSize: 13, 
                fontWeight: 800, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}>
                <ShoppingBag size={16} />
                <span>Cart ({cartCount})</span>
              </div>
            </div>
          </div>

          {/* Product Items Catalog Grid inside Mockup */}
          <div style={{ padding: '28px 24px', background: '#FAFAFA' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Featured Catalogue ({currentCategoryData.products.length})
                </h4>
                <span style={{ fontSize: 12.5, color: '#64748B' }}>Tap + button to test instant cart calculation</span>
              </div>
              
              <div style={{ fontSize: 12, color: '#0B5D39', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Truck size={14} />
                <span>Nationwide Shipping Available</span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18 }}>
              {currentCategoryData.products.map((prod) => {
                const isJustAdded = lastAddedId === prod.id;
                return (
                  <div 
                    key={prod.id}
                    style={{ 
                      background: '#FFFFFF', 
                      border: isJustAdded ? '1.5px solid #10B981' : '1px solid #E2E8F0', 
                      borderRadius: 16, 
                      padding: 14, 
                      transition: 'all 0.2s ease',
                      boxShadow: isJustAdded ? '0 8px 24px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Image Container with Badge */}
                    <div style={{ 
                      position: 'relative', 
                      height: 150, 
                      borderRadius: 12, 
                      overflow: 'hidden', 
                      marginBottom: 12,
                      background: '#F1F5F9'
                    }}>
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          // Fallback to high quality placeholder if image fails
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      {prod.badge && (
                        <span style={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8, 
                          background: 'rgba(15, 23, 42, 0.85)', 
                          backdropFilter: 'blur(4px)',
                          color: '#FFFFFF', 
                          fontSize: 10.5, 
                          fontWeight: 800, 
                          padding: '3px 9px', 
                          borderRadius: 999,
                          letterSpacing: '0.02em'
                        }}>
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div>
                      <h5 style={{ 
                        fontSize: 14, 
                        fontWeight: 700, 
                        color: '#0F172A', 
                        margin: '0 0 6px', 
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {prod.name}
                      </h5>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: '#0B5D39' }}>{prod.price}</div>
                          {prod.originalPrice && (
                            <div style={{ fontSize: 11.5, color: '#94A3B8', textDecoration: 'line-through' }}>
                              {prod.originalPrice}
                            </div>
                          )}
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => handleAddToCart(prod.id)}
                          style={{
                            background: isJustAdded ? '#10B981' : '#F1F5F9',
                            color: isJustAdded ? '#FFFFFF' : '#0F172A',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: 10,
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isJustAdded ? <Check size={14} /> : <Plus size={14} />}
                          <span>{isJustAdded ? 'Added' : 'Add'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom WhatsApp Automated Checkout Banner inside Mockup */}
            <div style={{ 
              marginTop: 24, 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
              borderRadius: 16, 
              padding: '16px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: 14,
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
              color: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={22} style={{ color: '#FFFFFF' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF' }}>Automated WhatsApp Checkout Ready</div>
                  <div style={{ fontSize: 12, color: '#A7F3D0' }}>Cart items format into clean WhatsApp messages automatically</div>
                </div>
              </div>

              <a href="/signup" style={{ 
                background: '#FFFFFF', 
                color: '#047857', 
                fontSize: 13, 
                fontWeight: 800, 
                padding: '9px 18px', 
                borderRadius: 999, 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <span>Create Your Store Free</span>
                <ArrowRight size={14} />
              </a>
            </div>

          </div>

        </div>

      </section>

      {/* ── 6 CORE CAPABILITIES GRID ── */}
      <section style={{ padding: '64px 24px 84px', maxWidth: 1120, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#0B5D39', textTransform: 'uppercase' }}>CORE CAPABILITIES</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: '#0F172A', marginTop: 4, letterSpacing: '-0.02em' }}>
            Everything You Need to Sell Online
          </h2>
          <p style={{ color: '#64748B', fontSize: 16, maxWidth: 600, margin: '8px auto 0' }}>
            Built specifically for modern merchants in emerging markets to maximize conversions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', marginBottom: 20 }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Ultra-Fast Mobile Speed</h3>
            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.6 }}>
              Loads in under 0.3s over mobile 3G/4G networks. Designed to load instantly for buyers tapping your Instagram or TikTok link.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: 20 }}>
              <MessageCircle size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Direct WhatsApp Routing</h3>
            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.6 }}>
              Receive clean order summaries formatted directly to your WhatsApp with delivery address, item choices, and contact info.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: 20 }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Custom Domain & Branding</h3>
            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.6 }}>
              Connect your own custom domain name (e.g. yourbrand.com) or use your branded Frontstore URL with free SSL protection.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EDF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B5D39', marginBottom: 20 }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Integrated Card Payments</h3>
            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.6 }}>
              Accept Paystack and Stripe card payments, bank transfers, and USSD — with automatic bank settlements in your store's currency.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: 20 }}>
              <Sliders size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Variants & Stock Tracking</h3>
            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.6 }}>
              Set up product attributes (sizes, colors), monitor remaining inventory, and receive low-stock alerts automatically.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB2777', marginBottom: 20 }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Sales & Analytics Overview</h3>
            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.6 }}>
              Track visitor counts, top-performing products, and monthly revenue performance right from your mobile dashboard.
            </p>
          </div>

        </div>

      </section>

      {/* ── FEATURE TABS ── */}
      <section style={{ padding: '64px 24px', maxWidth: 1080, margin: '0 auto', background: '#F8FAFC', borderRadius: 28, border: '1px solid #E2E8F0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Designed for Simplicity & Speed
          </h2>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {FEATURE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                style={{
                  background: isActive ? '#0B5D39' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  border: isActive ? 'none' : '1px solid #CBD5E1',
                  padding: '11px 22px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 6px 18px rgba(86,68,179,0.3)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Showcase Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 36, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 32, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#0B5D39', background: '#EEF2FF', padding: '5px 14px', borderRadius: 999 }}>
              {activeTab.badge}
            </span>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginTop: 14, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {activeTab.headline}
            </h3>
            <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.65, marginTop: 12 }}>
              {activeTab.description}
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}>
              {activeTab.bullets.map((b, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', fontSize: 14.5, marginBottom: 12 }}>
                  <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#EEF2FF', color: '#0B5D39', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              {React.createElement(activeTab.icon, { size: 32 })}
            </div>
            <h4 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>{activeTab.title}</h4>
            <p style={{ fontSize: 13.5, color: '#64748B', marginBottom: 22, lineHeight: 1.5 }}>Launch your store and try this feature completely free.</p>
            <a href="/signup" style={{ background: '#0B5D39', color: '#FFFFFF', fontSize: 14, fontWeight: 800, padding: '12px 26px', borderRadius: 12, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(86,68,179,0.3)' }}>
              Create Free Store
            </a>
          </div>
        </div>

      </section>

      {/* ── COMPARISON MATRIX ── */}
      <section style={{ padding: '64px 24px', maxWidth: 1080, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#0B5D39', textTransform: 'uppercase' }}>COMPARISON MATRIX</span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0F172A', marginTop: 4, letterSpacing: '-0.02em' }}>
            Frontstore vs. Traditional Options
          </h2>
        </div>

        <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 620 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '18px 24px', color: '#64748B', fontSize: 13, fontWeight: 800 }}>Feature</th>
                <th style={{ padding: '18px 24px', color: '#0B5D39', fontSize: 14.5, fontWeight: 900, background: '#EEF2FF' }}>Frontstore</th>
                <th style={{ padding: '18px 24px', color: '#334155', fontSize: 13.5, fontWeight: 700 }}>Shopify / WooCommerce</th>
                <th style={{ padding: '18px 24px', color: '#334155', fontSize: 13.5, fontWeight: 700 }}>Manual Social DMs</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: 14, fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: '16px 24px', color: '#059669', fontSize: 14, fontWeight: 800, background: '#F0FDF4' }}>{row.frontstore}</td>
                  <td style={{ padding: '16px 24px', color: '#64748B', fontSize: 14 }}>{row.shopify}</td>
                  <td style={{ padding: '16px 24px', color: '#64748B', fontSize: 14 }}>{row.instagram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '64px 24px', maxWidth: 1120, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#D97706', textTransform: 'uppercase' }}>MERCHANT SUCCESS STORIES</span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0F172A', marginTop: 4, letterSpacing: '-0.02em' }}>
            Loved by Fast-Growing Sellers
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} style={{ 
              background: '#FFFFFF', 
              border: '1px solid #E2E8F0', 
              borderRadius: 20, 
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{ display: 'flex', gap: 4, color: '#F59E0B', marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: '#334155', fontSize: 14.5, lineHeight: 1.65, fontStyle: 'italic', marginBottom: 20 }}>
                  "{t.text}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h5 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>{t.name}</h5>
                    <span style={{ fontSize: 12.5, color: '#64748B' }}>{t.store}</span>
                  </div>
                </div>
                <span style={{ background: '#ECFDF5', color: '#047857', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>
                  {t.growth}
                </span>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ── FAQ ACCORDION ── */}
      <section style={{ padding: '64px 24px', maxWidth: 840, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: 15.5,
                    fontWeight: 800,
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} style={{ color: '#0B5D39', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0, marginLeft: 12 }} />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px', color: '#475569', fontSize: 14.5, lineHeight: 1.65, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section style={{ padding: '40px 24px 84px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ 
          background: 'radial-gradient(125% 125% at 50% 10%, #042A19 0%, #021C11 60%, #01120B 100%)', 
          borderRadius: 28, 
          padding: '56px 36px', 
          textAlign: 'center',
          color: '#FFFFFF',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)'
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px', letterSpacing: '-0.025em' }}>
            Start Selling Online in 30 Seconds
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: 16.5, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Join thousands of business owners using Frontstore to automate sales, collect payments, and manage orders effortlessly.
          </p>

          <a href="/signup" style={{ 
            background: '#FFFFFF', 
            color: '#042A19', 
            fontSize: 16, 
            fontWeight: 900, 
            padding: '16px 38px', 
            borderRadius: 999, 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 10, 
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)'
          }}>
            <span>Create Your Store Free</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <PublicSiteFooter />

    </div>
  );
}
