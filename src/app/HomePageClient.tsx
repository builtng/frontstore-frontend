'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, Play, ChevronDown, Star, 
  Smartphone, Zap, CreditCard, 
  ShoppingBag, BarChart3, ChevronLeft, ChevronRight, Sparkles,
  Tag, Heart, MessageCircle, Check, Bell, TrendingUp, Plus, Share2, ArrowUpRight
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '../components/PublicSiteChrome';

const SELLER_LOGOS = [
  { name: 'Kube Organics', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80', tag: 'Skincare' },
  { name: 'Luxe Apparel', avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=300&q=80', tag: 'Fashion' },
  { name: 'Aura Beauty', avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=300&q=80', tag: 'Cosmetics' },
  { name: 'Urban Threads', avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=300&q=80', tag: 'Streetwear' },
  { name: 'Harvest Fresh', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80', tag: 'Groceries' },
  { name: 'Zest Kitchen', avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=300&q=80', tag: 'Bakery' },
];

const TESTIMONIALS = [
  {
    quote: "Organization in business is very important to me. When I started, there was a rush from clients during flash sales, but Frontstore streamlined all orders into WhatsApp effortlessly.",
    author: "Amara Okonkwo",
    role: "Owner, Luxe Apparel",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
    category: "Fashion Retail"
  },
  {
    quote: "Before Frontstore, I was mixing my business money with personal funds. Since I started using Frontstore for instant invoices and card payments, my financial clarity has improved 100%.",
    author: "Kwame Mensah",
    role: "Owner, Kube Organics",
    image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80",
    category: "Skincare & Wellness"
  },
  {
    quote: "All I have to do is send customers my Frontstore link, and they can shop directly. No more endless back-and-forth price messages on Instagram DMs!",
    author: "Fatima Bello",
    role: "Owner, Zest Kitchen",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    category: "Food & Confectionery"
  }
];

const FAQS = [
  {
    question: "What is Frontstore?",
    answer: "Frontstore is an app that helps you run your business online with ease. You can create an online store in under 2 minutes, collect payments locally & internationally, handle checkout directly via WhatsApp, and manage records effortlessly."
  },
  {
    question: "Is Frontstore a marketplace like Jumia or Amazon?",
    answer: "No. Frontstore gives you your own branded standalone store link (e.g., frontstore.ng/yourname). You own your customer relationships and sell directly to them with zero marketplace commissions."
  },
  {
    question: "Who can use Frontstore?",
    answer: "Frontstore is for business owners of all sizes who sell physical or digital products — from fashion and food to beauty, personal care, electronics, gadgets, and service providers."
  },
  {
    question: "How do I get paid?",
    answer: "Frontstore integrates seamlessly with Paystack and Stripe so your customers can pay via card, bank transfer, USSD, or international cards. Payments settle directly into your connected account with instant notification."
  },
  {
    question: "Where is Frontstore available?",
    answer: "Frontstore is available across Nigeria, Ghana, Kenya, and South Africa, with support for multi-currency display (NGN, GHS, KES, ZAR, USD)."
  },
  {
    question: "Is Frontstore free to try?",
    answer: "Yes! You can set up your store and try Frontstore completely free. Upgrade anytime to access custom domain integration, unlimited products, and advanced marketing tools."
  }
];

export default function HomePageClient({ initialSettings }: { initialSettings?: any }) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const homeContent = React.useMemo(() => {
    if (!initialSettings?.homepage_content) return null;
    try {
      return typeof initialSettings.homepage_content === 'string'
        ? JSON.parse(initialSettings.homepage_content)
        : initialSettings.homepage_content;
    } catch {
      return null;
    }
  }, [initialSettings]);

  const heroTitlePrefix = homeContent?.hero?.titlePrefix || 'Stop Sending Pictures.';
  const heroTitleHighlight = homeContent?.hero?.titleHighlight || 'Start Selling Smarter.';
  const heroDescription = homeContent?.hero?.description || 'Stop sending pictures and repeating prices in DMs. Create your online store in under 2 minutes, share one link, and collect payments automatically with zero back-and-forth.';

  const trustBarHeadline = React.useMemo(() => {
    if (homeContent?.stats?.trustBarHeadline?.trim()) {
      return homeContent.stats.trustBarHeadline.trim();
    }
    const count = homeContent?.stats?.sellerCount?.trim();
    const region = homeContent?.stats?.text?.trim() || 'across Africa';
    if (count) {
      if (count.toLowerCase().startsWith('trusted by')) {
        return count;
      }
      return `Trusted by ${count} ${region}`.trim();
    }
    return 'Trusted by 50,000+ businesses across Africa';
  }, [homeContent]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div style={{ background: '#ffffff', color: '#111827', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%' }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{ background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(16, 185, 129, 0.22) 0%, rgba(2, 28, 17, 0) 70%), linear-gradient(180deg, #021C11 0%, #042A19 55%, #031D12 100%)', color: '#ffffff', paddingTop: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}>
        
        {/* Subtle Ambient Radial Glows */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <PublicSiteNav />

        <div className="catlog-hero-container" style={{ padding: '64px 24px 0', textAlign: 'center' }}>
          
          {/* Announcement Badge */}
          <div className="catlog-hero-badge">
            <span className="catlog-badge-pill">NEW</span>
            <span>Introducing Frontstore's Mobile App</span>
            <ArrowRight size={14} style={{ color: '#0B5D39' }} />
          </div>

          {/* Headline */}
          <h1 className="catlog-hero-title">
            {heroTitlePrefix} <br />
            <span className="catlog-hero-highlight">{heroTitleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="catlog-hero-subtitle">
            {heroDescription}
          </p>

          {/* Action Buttons */}
          <div className="catlog-hero-cta-group">
            <a href="/signup" className="catlog-hero-app-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.7-1.13 1.84-.99 2.94 1.07.08 2.14-.54 2.8-1.34z"/>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-1.636V3.45c0-.624.226-1.207.61-1.636zM15.207 13.414l2.42-2.42-12.87-7.43 10.45 9.85zm0-2.828L4.757 20.436l12.87-7.43-2.42-2.42zM18.336 10.536l2.368 1.367c.806.465.806 1.229 0 1.694l-2.368 1.367-2.13-2.13 2.13-2.298z"/>
              </svg>
              <span>Download App</span>
            </a>

            <a href="/signup" className="catlog-hero-web-btn">
              <span>Continue on the web</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Hero Image Mockup (Merchant Store Showcase) */}
          <div className="catlog-hero-mockup-frame">
            <div className="catlog-hero-mockup-header">
              <div className="catlog-browser-dots">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
              </div>
              <div className="catlog-browser-url">
                frontstore.ng/luxe-apparel
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85" 
                alt="Merchant Storefront Preview" 
                style={{ width: '100%', height: 460, objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ffffff', color: '#0B5D39', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 36px rgba(0,0,0,0.35)', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                  <Play size={26} style={{ fill: '#0B5D39', transform: 'translateX(2px)' }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── TRUSTED SELLERS BAR ── */}
      <section className="catlog-trust-bar">
        <div className="catlog-trust-container">
          <div className="catlog-trust-title">
            <span style={{ color: '#10B981', marginRight: 6 }}>★</span>
            {trustBarHeadline}
          </div>

          <div className="catlog-seller-flex">
            {SELLER_LOGOS.map((seller, idx) => (
              <div key={idx} className="catlog-seller-pill">
                <img src={seller.avatar} alt={seller.name} className="catlog-seller-avatar" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{seller.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{seller.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID 1: SELL SMARTER ── */}
      <section className="catlog-section">
        <div style={{ textAlign: 'left', marginBottom: 44 }}>
          <h2 style={{ fontSize: 'clamp(36px, 4.8vw, 54px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.035em', lineHeight: 1.12, margin: 0 }}>
            Sell Smarter <br />
            <span style={{ color: '#5B45E0' }}>Get Paid Faster.</span>
          </h2>
        </div>

        <div className="catlog-feature-grid-2">
          
          {/* Card 1: Online Store in 5 Minutes (Span 2) */}
          <div className="catlog-card-purple" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
            <div style={{ maxWidth: 440 }}>
              <h3 style={{ fontSize: 'clamp(28px, 3.2vw, 38px)', fontWeight: 900, color: '#111827', margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.18 }}>
                Online Store in 2 Minutes
              </h3>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.65, marginBottom: 32 }}>
                Connect your Instagram to import posts as products or add them manually. Customise with your brand colour and domain - and you're ready to go!
              </p>
              <div>
                <a href="/signup" style={{ background: '#5B45E0', color: '#ffffff', fontWeight: 700, fontSize: 14.5, padding: '13px 26px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(91, 69, 224, 0.3)', transition: 'all 0.2s ease' }}>
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Right side visual: Tablet mockup with sneaker products & floating badges */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              
              {/* Tablet Frame */}
              <div style={{
                width: '100%',
                maxWidth: 460,
                background: '#FFFFFF',
                borderRadius: 22,
                border: '7px solid #8B5CF6',
                boxShadow: '0 25px 60px -10px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* Category Pills Header */}
                <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', background: '#FAFAFD' }}>
                  {[
                    { name: 'New Kicks', icon: '👟' },
                    { name: 'Nike', icon: '✔️' },
                    { name: 'Adidas', icon: '⚡' },
                    { name: 'Clearance', icon: '🏷️' },
                    { name: 'Vintage', icon: '✨' },
                  ].map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: i === 0 ? '#5B45E0' : '#FFFFFF', color: i === 0 ? '#FFFFFF' : '#475569', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', border: '1px solid', borderColor: i === 0 ? '#5B45E0' : '#E2E8F0' }}>
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>

                {/* Featured Products Bar */}
                <div style={{ padding: '10px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B' }}>Featured Products</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#5B45E0' }}>All Products →</span>
                </div>

                {/* Products Grid (Sneakers) */}
                <div style={{ padding: '8px 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { name: 'Nike Dunk Low', price: '₦30,000.00', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' },
                    { name: 'Air Jordan 1', price: '₦45,000.00', img: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=200&q=80' },
                    { name: 'Nike Air Max', price: '₦35,000.00', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=200&q=80' },
                    { name: 'Retro High', price: '₦40,000.00', img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=200&q=80' },
                  ].map((prod, i) => (
                    <div key={i} style={{ background: '#F8FAFC', borderRadius: 10, padding: 6, border: '1px solid #F1F5F9', textAlign: 'center' }}>
                      <div style={{ width: '100%', height: 48, borderRadius: 6, overflow: 'hidden', marginBottom: 4, background: '#FFFFFF' }}>
                        <img src={prod.img} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                      <div style={{ fontSize: 8.5, fontWeight: 800, color: '#5B45E0' }}>{prod.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Pink 3D Clock Badge */}
              <div style={{
                position: 'absolute',
                top: -12,
                right: 0,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #F472B6 0%, #DB2777 60%, #9D174D 100%)',
                boxShadow: '0 10px 25px rgba(219, 39, 119, 0.45), inset 0 2px 4px rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                animation: 'catlogFloatSlow 3s ease-in-out infinite'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>

              {/* Floating "Online store created!" Toast Pill */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: -16,
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '10px 16px',
                boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                zIndex: 10,
              }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={15} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: '#111827', lineHeight: 1.2 }}>Online store created!</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>You've successfully created your store.</div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Take orders while you sleep */}
          <div className="catlog-card-yellow" style={{ minHeight: 380 }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Take orders while you sleep
              </h3>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Share your store link everywhere — use discounts and coupons to run sales. Customers pay online or send their order via WhatsApp or Instagram.
              </p>
            </div>

            {/* Visual: Smartphone Lockscreen with Night Clock 01:00 & Notification Toast */}
            <div style={{ position: 'relative', marginTop: 32, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 220,
                background: '#0B0D17',
                borderRadius: '28px 28px 0 0',
                border: '6px solid #1E2235',
                borderBottom: 'none',
                padding: '16px 14px 20px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                color: '#ffffff',
                position: 'relative',
              }}>
                {/* Dynamic Island */}
                <div style={{ width: 60, height: 14, background: '#000000', borderRadius: 999, margin: '0 auto 12px' }} />

                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Friday, Aug 14</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '2px 0 14px' }}>
                  01:00
                </div>

                {/* Floating Notification Toast */}
                <div style={{
                  position: 'absolute',
                  bottom: -10,
                  left: -20,
                  right: -20,
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: '10px 12px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: '#111827',
                  textAlign: 'left',
                  zIndex: 5,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#5B45E0', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: 12 }}>
                    FS
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 11.5, color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>You have a new order 🎉</span>
                      <span style={{ fontSize: 9.5, color: '#94A3B8', fontWeight: 500 }}>now</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 1 }}>Chloe just ordered 5 items</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Showcase your products */}
          <div className="catlog-card-red" style={{ minHeight: 380 }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Showcase your products
              </h3>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Add videos, images, and detailed options. Use Highlights like "Best Sellers" to guide shoppers and boost sales.
              </p>
            </div>

            {/* Visual: Product showcase gallery with luxury bag + sneaker video + floating badges + highlights bar */}
            <div style={{ position: 'relative', marginTop: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#FFFFFF', padding: 10, borderRadius: 18, border: '1px solid #FFE4E6', boxShadow: '0 10px 25px rgba(225, 29, 72, 0.06)' }}>
                {/* Red Handbag */}
                <div style={{ borderRadius: 12, overflow: 'hidden', height: 110, background: '#FDF2F4', position: 'relative' }}>
                  <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80" alt="Luxury Bag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* Sneakers Video with Play Button */}
                <div style={{ borderRadius: 12, overflow: 'hidden', height: 110, background: '#EFF6FF', position: 'relative' }}>
                  <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80" alt="Sneakers Video" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F97316', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.5)' }}>
                      <Play size={14} style={{ fill: '#ffffff', transform: 'translateX(1px)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Star Ribbon Badge */}
              <div style={{ position: 'absolute', bottom: -10, left: 10, width: 34, height: 34, borderRadius: '50%', background: '#F59E0B', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)', zIndex: 6 }}>
                <Star size={16} style={{ fill: '#ffffff' }} />
              </div>

              {/* Floating Shopping Bag Ribbon Badge */}
              <div style={{ position: 'absolute', top: -10, right: 10, width: 34, height: 34, borderRadius: '50%', background: '#E11D48', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(225, 29, 72, 0.4)', zIndex: 6 }}>
                <ShoppingBag size={16} />
              </div>

              {/* Floating Story Highlights Row with Cursor */}
              <div style={{
                position: 'absolute',
                bottom: -20,
                right: -10,
                background: '#FFFFFF',
                borderRadius: 999,
                padding: '5px 12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 10,
              }}>
                {[
                  { name: 'Vigor Set', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
                  { name: 'Fusion', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
                  { name: 'Oym', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
                  { name: 'O-Shields', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' },
                ].map((st, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #5B45E0', padding: 1, margin: '0 auto' }}>
                      <img src={st.img} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                ))}

                {/* Green Click Cursor */}
                <div style={{ position: 'absolute', right: -6, bottom: -8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#10B981" stroke="#ffffff" strokeWidth="1.5">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

          {/* Card 4: Get Paid, from Anywhere */}
          <div className="catlog-card-green" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
            <div style={{ maxWidth: 440, position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: 'clamp(28px, 3.2vw, 38px)', fontWeight: 900, color: '#111827', margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.18 }}>
                Get Paid, from Anywhere
              </h3>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.65, marginBottom: 32 }}>
                Accept payments in Naira or 7+ global currencies. You can also generate payment links or branded invoices for custom orders.
              </p>
              <div>
                <a href="/signup" style={{ background: '#5B45E0', color: '#ffffff', fontWeight: 700, fontSize: 14.5, padding: '13px 26px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(91, 69, 224, 0.3)', transition: 'all 0.2s ease' }}>
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Right side visual: 3D Globe with orbiting flags & payment pills */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
              
              {/* Dotted Matrix Background Grid */}
              <div style={{
                position: 'absolute',
                inset: -20,
                backgroundImage: 'radial-gradient(#10B981 1.2px, transparent 1.2px)',
                backgroundSize: '16px 16px',
                opacity: 0.18,
                pointerEvents: 'none',
              }} />

              {/* Central 3D Globe */}
              <div style={{
                width: 170,
                height: 170,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #34D399 0%, #059669 65%, #064E3B 100%)',
                boxShadow: '0 20px 50px rgba(5, 150, 105, 0.35), inset -8px -8px 16px rgba(0,0,0,0.3), inset 8px 8px 16px rgba(255,255,255,0.4)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Continents overlay SVG */}
                <svg width="150" height="150" viewBox="0 0 100 100" style={{ position: 'absolute', opacity: 0.85 }}>
                  <path d="M25,35 Q35,20 50,30 Q65,40 60,60 Q55,75 40,70 Q25,65 25,35 Z" fill="#10B981" />
                  <path d="M68,25 Q80,20 85,35 Q90,50 78,55 Q70,45 68,25 Z" fill="#047857" />
                </svg>

                {/* Swirling Golden/Orange Transaction Arrows */}
                <svg width="220" height="220" viewBox="0 0 200 200" style={{ position: 'absolute', pointerEvents: 'none' }}>
                  <path d="M 30,100 A 70,70 0 0,1 170,100" fill="none" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" strokeDasharray="80 30" />
                  <polygon points="175,100 160,90 160,110" fill="#F59E0B" />
                  <path d="M 170,110 A 70,70 0 0,1 30,110" fill="none" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" strokeDasharray="80 30" />
                  <polygon points="25,110 40,100 40,120" fill="#FBBF24" />
                </svg>
              </div>

              {/* Orbiting Country Currency Flag Circular Badges */}
              {[
                { code: 'za', top: '2%', left: '50%', transform: 'translateX(-50%)' },
                { code: 'ke', top: '20%', left: '15%' },
                { code: 'ng', bottom: '25%', left: '8%' },
                { code: 'us', top: '20%', right: '15%' },
                { code: 'gb', top: '50%', right: '8%' },
                { code: 'ca', bottom: '22%', right: '15%' },
                { code: 'gh', bottom: '2%', left: '50%', transform: 'translateX(-50%)' },
              ].map((flag, idx) => (
                <div key={idx} style={{
                  position: 'absolute',
                  top: flag.top,
                  left: flag.left,
                  right: flag.right,
                  bottom: flag.bottom,
                  transform: flag.transform,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  border: '2px solid #FFFFFF',
                  overflow: 'hidden',
                  zIndex: 8,
                }}>
                  <img src={`https://flagcdn.com/w40/${flag.code}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}

              {/* Floating Payment Methods Bar */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '6px 14px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                zIndex: 10,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900 }}>₦</div>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900 }}>⚡</div>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 900 }}>S</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#F59E0B', marginLeft: -6, opacity: 0.85 }} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── NINA ASSISTANT SPOTLIGHT (WHATSAPP STOREFRONT) ── */}
      <section style={{ background: 'linear-gradient(135deg, #FFF9F3 0%, #FFF4EB 50%, #FFECE0 100%)', color: '#111827', padding: '120px 24px', position: 'relative', overflow: 'hidden', borderTop: '1px solid #FEE2E2' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 64, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 900, color: '#111827', margin: '0 0 24px', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
              Nina: Your WhatsApp <br />
              <span style={{ color: '#5B45E0' }}>Automated Sales Assistant.</span>
            </h2>
            <p style={{ fontSize: 17.5, color: '#4B5563', lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
              Let customers browse your live product catalog, select sizes and colors, and complete payments — directly via WhatsApp with zero back-and-forth messaging.
            </p>
            <a href="/signup" style={{ background: '#5B45E0', color: '#ffffff', fontWeight: 750, fontSize: 16, padding: '16px 36px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 28px rgba(91, 69, 224, 0.32)', transition: 'all 0.2s ease' }}>
              <span>Learn More</span>
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Right Column: Clean, Expansive WhatsApp iPhone Mockup */}
          <div style={{ background: '#FFE6D8', borderRadius: 48, padding: '56px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 24px 60px rgba(255, 150, 100, 0.18)' }}>
            
            {/* Phone Body */}
            <div style={{
              width: '100%',
              maxWidth: 380,
              background: '#0B0F19',
              borderRadius: 44,
              border: '9px solid #1E293B',
              boxShadow: '0 35px 80px -15px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              
              {/* WhatsApp Phone Status Bar */}
              <div style={{ background: '#005D4B', padding: '12px 22px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffffff', fontSize: 13, fontWeight: 700 }}>
                <span>10:08</span>
                {/* Dynamic Island */}
                <div style={{ width: 68, height: 16, background: '#000000', borderRadius: 999 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span>5G</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* WhatsApp Top Navigation Bar */}
              <div style={{ background: '#005D4B', padding: '10px 18px 16px', display: 'flex', alignItems: 'center', gap: 12, color: '#ffffff' }}>
                <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.9 }}>‹ 252</span>
                <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Store Profile"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '1.5px solid #005D4B' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: '#ffffff', lineHeight: 1.2 }}>Luxe Apparel</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Official Store • Online</div>
                </div>
              </div>

              {/* WhatsApp Chat Canvas */}
              <div style={{ background: '#EFEAE2', padding: '20px 16px 28px', minHeight: 440, display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {/* Customer Greeting Bubble */}
                <div style={{
                  alignSelf: 'flex-end',
                  background: '#D9FDD3',
                  borderRadius: '18px 0 18px 18px',
                  padding: '10px 14px',
                  maxWidth: 270,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, lineHeight: 1.4 }}>
                    Hi! I'd like to see your new arrivals & place an order please 👋
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10, color: '#64748B', marginTop: 3 }}>
                    5:50 PM ✓✓
                  </div>
                </div>

                {/* Merchant / Frontstore Instant Storefront Link Bubble */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '0 18px 18px 18px',
                  padding: '14px 16px',
                  maxWidth: 315,
                  boxShadow: '0 1.5px 4px rgba(0,0,0,0.08)',
                }}>
                  {/* Digital Store Link Preview Card */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}>
                    <img
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80"
                      alt="Store Catalog"
                      style={{ width: '100%', height: 100, objectFit: 'cover' }}
                    />
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Luxe Apparel — Online Store</div>
                      <div style={{ fontSize: 11, color: '#5B45E0', fontWeight: 600 }}>frontstore.ng/luxe</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5, margin: '0 0 10px' }}>
                    Welcome! Tap our store link above to browse 24 items in stock and checkout instantly.
                  </p>

                  <div style={{ textAlign: 'right', fontSize: 10, color: '#94A3B8' }}>
                    5:50 PM
                  </div>
                </div>

                {/* Customer Checkout Order Confirmation Bubble */}
                <div style={{
                  alignSelf: 'flex-end',
                  background: '#D9FDD3',
                  borderRadius: '18px 0 18px 18px',
                  padding: '12px 14px',
                  maxWidth: 290,
                  boxShadow: '0 1.5px 4px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', marginBottom: 4, letterSpacing: '0.02em' }}>
                    🛒 ORDER PLACED • #FS-8492
                  </div>
                  <div style={{ fontSize: 12.5, color: '#0F172A', lineHeight: 1.45 }}>
                    • 2x Silk Shirts (Size M) — <b>₦32,000</b><br />
                    • 1x Leather Bag — <b>₦24,000</b>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 850, color: '#047857' }}>Paid ₦56,000 ✓</span>
                    <span style={{ fontSize: 10, color: '#64748B' }}>5:52 PM <span style={{ color: '#53BDEB' }}>✓✓</span></span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURE GRID 2: MANAGE BUSINESS ── */}
      <section className="catlog-section">
        <h2 className="catlog-section-heading">
          Manage Your Business <br />
          <span style={{ color: '#0B5D39' }}>Like a Pro.</span>
        </h2>

        <div className="catlog-feature-grid-3">
          <div className="catlog-card-yellow">
            <div>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <BarChart3 size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 850, color: '#111827', margin: '0 0 10px' }}>Your Business in One View</h3>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.65 }}>Track sales revenue, order volumes, customer return rates, and abandoned carts from a clean unified dashboard.</p>
            </div>
          </div>

          <div className="catlog-card-red">
            <div>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <ShoppingBag size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 850, color: '#111827', margin: '0 0 10px' }}>Smart Inventory Controls</h3>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.65 }}>Manage product stock levels, set low-stock warnings, and automatically hide out-of-stock items so you never over-sell.</p>
            </div>
          </div>

          <div className="catlog-card-green" style={{ gridColumn: 'span 1', minHeight: 310 }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 850, color: '#111827', margin: '0 0 10px' }}>Marketing That Converts</h3>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.65 }}>Send promotional broadcast messages via WhatsApp/SMS, create coupon codes, and track referral sales effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#FAFAFD', padding: '104px 24px', borderTop: '1px solid #EEF0F6', borderBottom: '1px solid #EEF0F6' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', fontWeight: 900, color: '#111827', marginBottom: 56, textAlign: 'center', letterSpacing: '-0.03em' }}>
            Real Businesses <br />
            <span style={{ color: '#0B5D39' }}>Growing with Frontstore.</span>
          </h2>

          <div style={{ background: '#ffffff', borderRadius: 28, boxShadow: '0 12px 36px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'row', alignItems: 'center', maxWidth: 920, margin: '0 auto', padding: 28, gap: 36, flexWrap: 'wrap' }}>
            <div style={{ width: 240, height: 240, flexShrink: 0, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
              <img src={TESTIMONIALS[activeTestimonial].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            </div>

            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 8 }}>
              <div>
                <div style={{ display: 'flex', gap: 4, color: '#F59E0B', marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} style={{ fill: '#F59E0B' }} />
                  ))}
                </div>

                <p style={{ fontSize: 16.5, color: '#1F2937', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 20 }}>
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>

                <div>
                  <div style={{ fontWeight: 850, fontSize: 16, color: '#111827' }}>{TESTIMONIALS[activeTestimonial].author}</div>
                  <div style={{ fontSize: 13.5, color: '#6B7280' }}>{TESTIMONIALS[activeTestimonial].role}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, borderTop: '1px solid #F1F5F9', marginTop: 20 }}>
                <span style={{ fontSize: 11.5, fontWeight: 750, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {activeTestimonial + 1} of {TESTIMONIALS.length} Stories
                </span>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={prevTestimonial} style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextTestimonial} style={{ width: 38, height: 38, borderRadius: '50%', background: '#0B5D39', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="catlog-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="catlog-section-heading" style={{ marginBottom: 0 }}>
            Got Questions? <br />
            <span style={{ color: '#0B5D39' }}>We've Got Answers.</span>
          </h2>
        </div>

        <div className="catlog-faq-container">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="catlog-faq-item">
                <button onClick={() => setActiveFaq(isOpen ? null : index)} className="catlog-faq-trigger">
                  <span>{faq.question}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isOpen ? '#0B5D39' : '#F1F5F9', color: isOpen ? '#ffffff' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </button>

                {isOpen && (
                  <div className="catlog-faq-content">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, color: '#64748B', fontSize: 15, fontWeight: 500 }}>
          Still have questions? Email us at{' '}
          <a href="mailto:hello@frontstore.ng" style={{ color: '#0B5D39', fontWeight: 700, textDecoration: 'none' }}>
            hello@frontstore.ng
          </a>
        </div>
      </section>

      <PublicSiteFooter />
    </div>
  );
}
