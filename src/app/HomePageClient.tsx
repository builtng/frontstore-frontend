'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Check, Truck, CreditCard, ShoppingBag, Crown, Zap,
  Minus, Plus, Star, BarChart3, Sparkles, Lock,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '../components/PublicSiteChrome';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { InstagramIcon, TikTokIcon } from '../components/SocialIcons';

// Testimonials default empty — real ones are supplied via admin-configured homepage_content.
const TESTIMONIALS: ReadonlyArray<{
  name: string;
  role: string;
  initial: string;
  color: string;
  text: string;
}> = [];

const HOW_IT_WORKS = [
  { title: 'Claim your URL', body: 'Type your business name and claim your branded store link in seconds.' },
  { title: 'Add your products', body: 'Upload photos, add prices, and let Frontstore Nina write descriptions for you.' },
  { title: 'Share & sell', body: 'Drop your store link on WhatsApp Status, Instagram, or TikTok and start receiving orders.' },
] as const;

const CATEGORIES = [
  { title: 'Retail & Groceries', color: '#128C7E' },
  { title: 'Fashion & Clothing', color: '#E23F84' },
  { title: 'Confectionaries & Food', color: '#FF9F43' },
  { title: 'Personal Care & Beauty', color: '#9B5DE5' },
  { title: 'Gadgets & Electronics', color: '#2563EB' },
  { title: 'Shoes & Sneakers', color: '#0D9488' },
  { title: 'Jewellery', color: '#D97706' },
  { title: 'Gifts & Hampers', color: '#E11D48' },
  { title: 'Home & Auto Services', color: '#118AB2' },
  { title: 'Digital Products', color: '#6D5AE6' },
  { title: 'Pharmacy & Health', color: '#DC2626' },
  { title: 'Schools & Faith', color: '#0E9BB3' },
] as const;

const FAQS = [
  {
    q: 'Do I need a WhatsApp Business number to use Frontstore?',
    a: "No — Frontstore connects to the WhatsApp number you already use. There's nothing to migrate and no new number to register.",
  },
  {
    q: 'Is my money safe while an order is in transit?',
    a: "Payments are processed through Paystack and Flutterwave, and funds settle directly to your linked bank account — you're never waiting on Frontstore to release money.",
  },
  {
    q: 'Can I use my own domain instead of frontstore.ng/yourname?',
    a: 'Yes, on the Pro and Business plans you can connect a custom domain to your storefront.',
  },
  {
    q: 'What happens after a customer pays?',
    a: 'You get an instant notification in WhatsApp with the order details and payment confirmation, so you can fulfil immediately — no separate dashboard to check.',
  },
  {
    q: 'Which countries and currencies are supported?',
    a: "Nigeria, Ghana, Kenya, and South Africa today, with pricing shown in NGN, GHS, KES, or ZAR automatically based on your store's country.",
  },
] as const;

const DEFAULT_HOME_CONTENT = {
  hero: {
    badges: ['Under 2 Minutes Setup', 'Conversational Commerce'],
    titlePrefix: 'Start selling online.',
    titleHighlight: 'Get paid fast.',
    description: 'Launch your online store for free, share it anywhere your customers already are, and start accepting payments instantly.',
    primaryButton: { label: 'Create Your Free Store', href: '/signup' },
    secondaryButton: { label: 'See how it works', href: '#how-it-works' },
  },
  stats: {
    sellerCount: 'Trusted platform',
    text: 'for independent sellers across Africa',
  },
  testimonials: {
    eyebrow: 'Testimonials',
    title: 'Trusted by sellers, not just software',
    items: TESTIMONIALS,
  },
};

type HomeContent = typeof DEFAULT_HOME_CONTENT;

function mergeHomeContent(raw?: string): HomeContent {
  const liveDefault: HomeContent = DEFAULT_HOME_CONTENT;

  if (!raw) return liveDefault;
  try {
    const parsed = JSON.parse(raw);

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

    return mergeWithFallback(liveDefault, parsed);
  } catch {
    return liveDefault;
  }
}

export default function HomePageClient({ initialSettings }: { initialSettings?: any }) {
  const [systemDomain, setSystemDomain] = useState(() => {
    const val = initialSettings?.system_domain || 'frontstore.ng';
    return val === 'frontstore.app' ? 'frontstore.ng' : val;
  });
  const [homeContent, setHomeContent] = useState<HomeContent>(() => mergeHomeContent(initialSettings?.homepage_content));

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    if (!initialSettings) {
      fetch(`${API_URL}/v1/public/settings`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            if (json.data.system_domain) {
              const domain = json.data.system_domain;
              setSystemDomain(domain === 'frontstore.app' ? 'frontstore.ng' : domain);
            }
            setHomeContent(mergeHomeContent(json.data.homepage_content));
          }
        })
        .catch(err => console.error('Failed to fetch public settings:', err));
    }
  }, [initialSettings, API_URL]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowX: 'hidden' }}>
      <PublicSiteNav />

      {/* ── Hero ── */}
      <header className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            {(homeContent.hero.badges[0] || homeContent.hero.badges[1]) && (
              <span className="home-eyebrow hide-on-mobile">
                <Zap size={12} /> {homeContent.hero.badges[0]}
                {homeContent.hero.badges[1] && <>&nbsp;·&nbsp;{homeContent.hero.badges[1]}</>}
              </span>
            )}
            <h1 className="balance">
              {homeContent.hero.titlePrefix}
              <br />
              <span className="mark-highlight">{homeContent.hero.titleHighlight}</span>
            </h1>
            <p>{homeContent.hero.description}</p>
            <div className="home-hero-cta-row">
              <a href={homeContent.hero.primaryButton.href} className="btn btn-primary">
                {homeContent.hero.primaryButton.label} <ArrowRight size={16} />
              </a>
              <a href={homeContent.hero.secondaryButton.href} className="home-link-arrow">
                {homeContent.hero.secondaryButton.label} ›
              </a>
            </div>

            <div className="home-social-proof">
              <div className="home-avatar-stack">
                <span style={{ background: '#128C7E' }}>M</span>
                <span style={{ background: '#25D366' }}>C</span>
                <span style={{ background: '#FF9F43' }}>A</span>
                <span style={{ background: '#0A192F' }}>T</span>
              </div>
              <p><strong>{homeContent.stats.sellerCount}</strong> {homeContent.stats.text}</p>
            </div>
          </div>

          <div className="home-collage">
            <div className="home-collage-frame">
              <div className="home-photo-card home-photo-bag">
                <img src="/home-hero-bag.jpg" alt="Woven leather tote bag — an example product on a Frontstore catalog" className="home-collage-img" />
              </div>
              <div className="home-photo-card home-photo-shoe">
                <img src="/home-hero-sneakers.jpg" alt="Colourblock sneakers — an example product on a Frontstore catalog" className="home-collage-img" />
              </div>
              <span className="home-sale-badge">LIVE NOW</span>
              <span className="home-wish-btn">
                <ShoppingBag size={18} color="#fff" strokeWidth={2} />
              </span>

              <div className="home-product-card">
                <div className="home-pc-top">
                  <img src="/home-hero-sneakers.jpg" alt="" className="home-pc-thumb" style={{ objectFit: 'cover' }} />
                  <div><h4>Colourblock Sneakers</h4><p className="home-pc-price">₦18,500</p></div>
                </div>
                <div className="home-pc-qty">
                  <div className="home-steps-inline">
                    <button aria-label="Decrease quantity"><Minus size={12} /></button>1<button aria-label="Increase quantity"><Plus size={12} /></button>
                  </div>
                  <span className="home-link-arrow" style={{ fontSize: 11 }}>Order ›</span>
                </div>
              </div>

              <div className="home-pay-card">
                <p style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Get paid via</p>
                <div className="home-pay-row">Paystack <span className="home-toggle" /></div>
                <div className="home-pay-row">Flutterwave <span className="home-toggle" /></div>
                <div className="home-pay-row">Bank Transfer <span className="home-toggle" /></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── How it works ── */}
      <section className="home-steps-sec" id="how-it-works">
        <div className="home-steps-glow" />
        <div className="home-inner">
          <div className="home-steps-header">
            <span className="home-eyebrow"><Zap size={12} /> Quick Setup</span>
            <h2 className="balance">Start selling in three simple steps</h2>
            <p>No complicated website builders or coding required. Get your store live and start collecting orders in under two minutes.</p>
          </div>

          <div className="home-steps-grid">
            {/* Step 1 */}
            <div className="home-step-card">
              <div className="home-step-head">
                <span className="home-step-badge">Step 01</span>
                <span className="home-step-time"><Zap size={11} /> 30 secs</span>
              </div>
              <div className="home-step-body">
                <h3>Claim your URL</h3>
                <p>Type your business name and secure your branded storefront link instantly.</p>
              </div>
              <div className="home-step-visual v-url">
                <div className="step-url-box">
                  <span className="step-url-prefix">{systemDomain}/</span>
                  <span className="step-url-handle">yourbrand</span>
                  <span className="step-url-status">
                    <span className="step-url-dot" /> Available
                  </span>
                </div>
                <div className="step-url-features">
                  <span><Lock size={10} /> Free SSL</span>
                  <span><Zap size={10} /> Instant Live</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="home-step-card">
              <div className="home-step-head">
                <span className="home-step-badge">Step 02</span>
                <span className="home-step-time ai">
                  <Sparkles size={11} /> Nina AI
                </span>
              </div>
              <div className="home-step-body">
                <h3>Add your products</h3>
                <p>Upload photos, set prices, and let Frontstore Nina craft descriptions automatically.</p>
              </div>
              <div className="home-step-visual v-product">
                <div className="step-product-preview">
                  <img src="/home-hero-bag.jpg" alt="Product" className="step-product-img" />
                  <div className="step-product-info">
                    <strong>Leather Tote Bag</strong>
                    <span className="step-product-price">₦18,500</span>
                    <span className="step-ai-tag"><Sparkles size={10} /> AI description ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="home-step-card">
              <div className="home-step-head">
                <span className="home-step-badge">Step 03</span>
                <span className="home-step-time wa">
                  <WhatsAppIcon size={11} /> Instant Orders
                </span>
              </div>
              <div className="home-step-body">
                <h3>Share & get paid</h3>
                <p>Drop your link anywhere — customers browse and checkout straight to your WhatsApp.</p>
              </div>
              <div className="home-step-visual v-chat">
                <div className="step-chat-bubble">
                  <p className="step-chat-text"><ShoppingBag size={12} /> <em>"Hi! I want to order 1x Leather Tote Bag"</em></p>
                  <div className="step-chat-meta">
                    <span className="step-paid-chip"><Check size={10} strokeWidth={3} /> Paid via Paystack</span>
                  </div>
                </div>
                <div className="step-share-channels">
                  <span className="channel-chip wa"><WhatsAppIcon size={12} /> WhatsApp</span>
                  <span className="channel-chip ig"><InstagramIcon size={12} /> IG</span>
                  <span className="channel-chip tt"><TikTokIcon size={12} /> TikTok</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Diagonal community band ── */}
      <section className="home-diag">
        <div className="home-diag-grid">
          <div>
            <h2 className="balance">One Platform, Every African Market</h2>
            <p>From Lagos to Nairobi to Accra, Frontstore speaks the local currency and the local hustle — empowering independent businesses and creators across four countries.</p>
            <a href="/demo" className="btn" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }}>See a live demo</a>
          </div>
          <div className="home-diag-phone">
            <span className="home-float-flag home-flag-1">🇳🇬 🇬🇭 🇰🇪 🇿🇦</span>
            <div className="home-mini-phone">
              <div className="home-mini-phone-screen">
                <div className="home-mini-bubble a">
                  <span className="home-bi" style={{ background: 'var(--primary)' }}><Check size={10} color="#fff" strokeWidth={3} /></span>
                  Order confirmed
                </div>
                <div className="home-mini-bubble b">
                  <span className="home-bi" style={{ background: 'rgba(255,255,255,.25)' }}><Truck size={10} color="#fff" strokeWidth={2.5} /></span>
                  Delivered in 2 days
                </div>
                <div className="home-mini-bubble a">
                  <span className="home-bi" style={{ background: 'var(--accent)' }}><CreditCard size={10} color="#fff" strokeWidth={2.5} /></span>
                  Paid via Paystack
                </div>
              </div>
            </div>
            <span className="home-float-flag home-flag-2">Active in 4 Countries</span>
          </div>
        </div>
      </section>

      {/* ── Testimonials (admin-editable; hidden until real ones are added) ── */}
      {homeContent.testimonials.items.length > 0 && (
        <section className="home-trusted">
          <span className="home-eyebrow">{homeContent.testimonials.eyebrow}</span>
          <h2 className="balance">{homeContent.testimonials.title}</h2>
          <div className="home-testi-grid">
            {homeContent.testimonials.items.map(t => (
              <div className="home-quote-card" key={t.name}>
                <div className="home-quote-mark">&ldquo;</div>
                <p>{t.text}</p>
                <div className="home-testi-foot">
                  <span className="home-avatar-round" style={{ background: t.color }}>{t.initial}</span>
                  <p className="home-quote-attr">{t.name}<span>{t.role}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Made simple (3-col) ── */}
      <section className="home-simple">
        <div className="home-simple-head">
          <h2 className="balance">Your storefront made simple</h2>
        </div>
        <div className="home-simple-grid">
          <div className="home-simple-card">
            <div className="home-simple-visual v1">
              <span className="home-chip-icon" style={{ width: 50, height: 50, top: 24, left: 24 }}><ShoppingBag size={24} color="var(--primary)" strokeWidth={1.8} /></span>
              <span className="home-chip-icon" style={{ width: 42, height: 42, top: 70, left: 90 }}><Star size={20} color="var(--accent)" fill="var(--accent)" /></span>
              <span className="home-chip-icon" style={{ width: 46, height: 46, bottom: 22, left: 130 }}><BarChart3 size={22} color="#0F9C86" strokeWidth={1.9} /></span>
            </div>
            <h3>All You Need to Sell</h3>
            <p>Catalog, checkout, and payments — pre-wired the moment you claim your store link.</p>
            <a href="/pricing" className="home-link-arrow">Explore features ›</a>
          </div>
          <div className="home-simple-card">
            <div className="home-simple-visual v2">
              <span className="home-chip-icon" style={{ width: 48, height: 48, top: 26, left: 28, background: 'var(--wa-green)' }}><WhatsAppIcon size={22} color="#fff" /></span>
              <span className="home-chip-icon" style={{ width: 42, height: 42, top: 60, left: 100 }}><InstagramIcon size={20} color="#E23F84" /></span>
              <span className="home-chip-icon" style={{ width: 44, height: 44, bottom: 20, left: 20 }}><TikTokIcon size={20} color="#000" /></span>
            </div>
            <h3>Built to Fit Anywhere</h3>
            <p>Drop your link on WhatsApp Status, Instagram, or TikTok — one storefront, every channel.</p>
            <a href="/integrations" className="home-link-arrow">See integrations ›</a>
          </div>
          <div className="home-simple-card">
            <div className="home-simple-visual v3">
              <span className="home-comm-dot" style={{ width: 40, height: 40, top: 22, left: 26, background: '#128C7E' }}>M</span>
              <span className="home-comm-dot" style={{ width: 32, height: 32, top: 34, left: 86, background: '#FF9F43' }}>C</span>
              <span className="home-comm-dot" style={{ width: 36, height: 36, top: 80, left: 44, background: '#64FFDA', color: '#0A192F' }}>A</span>
              <span className="home-comm-dot" style={{ width: 28, height: 28, bottom: 26, left: 110, background: '#E23F84' }}>T</span>
              <span className="home-comm-dot" style={{ width: 30, height: 30, bottom: 24, left: 24, background: '#25D366', color: '#06331f' }}>S</span>
            </div>
            <h3>Real Community, Real Support</h3>
            <p>A thriving merchant community sharing what works — backed by a support team that actually replies.</p>
            <a href="/docs" className="home-link-arrow">Join the community ›</a>
          </div>
        </div>
      </section>

      {/* ── Category coverage ── */}
      <section className="home-cats-sec">
        <div className="home-inner">
          <h2 className="balance">Whatever you sell, it fits</h2>
          <div className="home-chip-row">
            {CATEGORIES.map(cat => (
              <span className="home-cat-chip" key={cat.title}>
                <span className="home-dot" style={{ background: cat.color }} />{cat.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="home-pricing-sec">
        <div className="home-inner">
          <span className="home-eyebrow">Pricing</span>
          <h2 className="balance">Simple pricing, no transaction fees</h2>
          <div className="home-price-grid">
            <div className="home-price-card">
              <span className="home-price-icon"><ShoppingBag size={21} color="var(--primary)" /></span>
              <h3>Free</h3>
              <p className="home-price-amt">₦0</p>
              <p className="home-price-desc">Everything to launch your first store and start taking orders — free forever.</p>
              <ul className="home-price-feats">
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />1 storefront</li>
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />Up to 10 products</li>
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />WhatsApp checkout</li>
              </ul>
              <a href="/signup" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>Start Free</a>
            </div>
            <div className="home-price-card featured">
              <span className="home-price-badge">Most popular</span>
              <span className="home-price-icon"><Zap size={21} color="#fff" fill="#fff" /></span>
              <h3>Pro</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, textDecoration: 'line-through', color: 'var(--text-faint)', fontWeight: 600 }}>₦4,999</span>
                <p className="home-price-amt" style={{ margin: 0 }}>₦2,000<span>/mo</span></p>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#e11d48', color: '#fff', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>60% OFF</span>
              </div>
              <p className="home-price-desc">For sellers ready to scale — unlimited products, AI studio, and custom branding.</p>
              <ul className="home-price-feats">
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />Everything in Free</li>
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />Unlimited products</li>
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />AI photo &amp; description generator</li>
              </ul>
              <a href="/signup?plan=pro" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>Start Pro</a>
            </div>
            <div className="home-price-card home-price-legend home-price-business">
              <span className="home-price-icon"><Crown size={21} color="var(--primary)" /></span>
              <h3>Business</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, textDecoration: 'line-through', color: 'var(--text-faint)', fontWeight: 600 }}>₦14,999</span>
                <p className="home-price-amt" style={{ margin: 0 }}>₦7,000<span>/mo</span></p>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#e11d48', color: '#fff', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>53% OFF</span>
              </div>
              <p className="home-price-desc">Full power for high-volume stores, custom domain, and ad tracking.</p>
              <ul className="home-price-feats">
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />Everything in Pro</li>
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />Custom domain</li>
                <li><Check size={15} color="var(--primary)" strokeWidth={3} />Ad pixel tracking &amp; priority support</li>
              </ul>
              <a href="/signup?plan=legend" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>Start Business</a>
            </div>
          </div>
          <p className="home-price-note">No transaction fees on any tier · <a href="/pricing" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>see full pricing ›</a></p>
        </div>
      </section>

      {/* ── Sell without limits (Nina promo band) ── */}
      <section className="home-promo">
        <div className="home-promo-band">
          <div className="home-ring" />
          <div className="home-promo-visual">
            <div className="home-ai-card">
              <span className="home-spark"><img src="/ninaAssistant.png" alt="Frontstore Nina" className="home-nina-avatar" /></span>
              <div className="home-ln w1" /><div className="home-ln w2" /><div className="home-ln w3" />
            </div>
          </div>
          <div className="home-promo-text">
            <h2 className="balance">Sell Without Limits</h2>
            <p>Frontstore Nina writes your listings, answers customer FAQs, and suggests prices — 24/7, in the languages your customers actually type.</p>
            <a href="/docs" className="btn" style={{ padding: '10px 18px', fontSize: 13, background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }}>Meet Frontstore Nina ›</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="home-faq-sec">
        <div className="home-inner" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="home-eyebrow">FAQ</span>
            <h2 className="balance" style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 800, letterSpacing: '-.02em' }}>Questions sellers actually ask</h2>
          </div>
          <div className="home-faq-list">
            {FAQS.map((faq, i) => (
              <details className="home-faq-item" key={faq.q} open={i === 0}>
                <summary>{faq.q}<span className="home-faq-plus">+</span></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported / final CTA ── */}
      <section className="home-support-band">
        <svg className="home-support-dots" width="120" height="120" viewBox="0 0 120 120"><g fill="var(--primary)"><circle cx="6" cy="6" r="3" /><circle cx="30" cy="4" r="3" /><circle cx="54" cy="6" r="3" /><circle cx="4" cy="30" r="3" /><circle cx="4" cy="54" r="3" /></g></svg>
        <img src="/logo-mark.png" alt="" aria-hidden="true" className="home-watermark" width="360" height="360" style={{ objectFit: 'contain' }} />
        <h2 className="balance">Backed by real support</h2>
        <p>No ticket queues, no chatbots pretending to be human. When you message us, a real person on the Frontstore team replies.</p>
        <div className="home-team-strip">
          <span className="home-initial" style={{ background: '#128C7E' }}>O</span>
          <span className="home-initial" style={{ background: '#25D366' }}>B</span>
          <span className="home-initial" style={{ background: '#FF9F43' }}>N</span>
          <span className="home-initial" style={{ background: '#0A192F' }}>K</span>
          <span className="home-initial" style={{ background: '#E23F84' }}>F</span>
          <span className="home-initial" style={{ background: '#64FFDA', color: '#0A192F' }}>D</span>
          <span className="home-initial" style={{ background: '#2563EB' }}>R</span>
        </div>
        <a href="/signup" className="btn btn-primary">Start Selling Free</a>
        <p className="home-support-foot" style={{ marginTop: 16 }}>Takes less than 2 minutes. No credit card required.</p>
      </section>

      <PublicSiteFooter />
    </div>
  );
}
