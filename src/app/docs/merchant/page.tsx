'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Store, 
  Settings, 
  Package, 
  CreditCard, 
  Bot, 
  TrendingUp, 
  Megaphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export default function MerchantDocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const navSections: NavSection[] = [
    { id: 'overview', title: '1. Overview', icon: <Store size={16} /> },
    { id: 'onboarding', title: '2. Onboarding', icon: <Settings size={16} /> },
    { id: 'flow', title: '3. Frontstore Flow', icon: <Package size={16} /> },
    { id: 'pay', title: '4. Frontstore Pay', icon: <CreditCard size={16} /> },
    { id: 'aura', title: '5. Frontstore Aura (AI)', icon: <Bot size={16} /> },
    { id: 'pulse', title: '6. Frontstore Pulse', icon: <TrendingUp size={16} /> },
    { id: 'reach', title: '7. Frontstore Reach', icon: <Megaphone size={16} /> },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // Adjust for sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <PublicSiteNav />

      {/* Main Content Layout */}
      <div style={{ flex: 1, width: '100%', maxWidth: 1150, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Back navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <a href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }} className="clickable">
            <ArrowLeft size={14} /> Back to Help Center
          </a>
          <span className="badge badge-primary" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Store size={11} /> Merchant Resources
          </span>
        </div>

        {/* Title Header */}
        <header style={{ marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
          <h1 className="text-display" style={{ marginBottom: 12, fontSize: 'clamp(28px, 4.5vw, 40px)' }}>Merchant & Seller Guide</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, maxWidth: 800 }}>
            Everything you need to set up, customize, automate, and scale your business using Frontstore’s conversational commerce infrastructure.
          </p>
        </header>

        {/* Content Layout Grid */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="docs-layout-grid">
          
          {/* Sticky Sidebar Navigation */}
          <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 8 }} className="docs-sidebar">
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', padding: '0 12px 6px' }}>
              Guide Sections
            </span>
            {navSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: activeSection === sec.id ? 'var(--primary)' : 'transparent',
                  color: activeSection === sec.id ? '#fff' : 'var(--text-muted)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast) var(--ease)',
                  boxShadow: activeSection === sec.id ? 'var(--shadow-md)' : 'none'
                }}
                className={activeSection !== sec.id ? "btn-ghost" : ""}
              >
                {sec.icon}
                <span style={{ flex: 1 }}>{sec.title}</span>
                <ChevronRight size={14} style={{ opacity: activeSection === sec.id ? 1 : 0 }} />
              </button>
            ))}

            <div style={{ marginTop: 24, padding: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Need Direct Help?</h4>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>Our seller support team is available on WhatsApp.</p>
              <a href="https://wa.me/2348030000000" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-sm)' }}>
                Chat Support
              </a>
            </div>
          </aside>

          {/* Main Documentation Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }} className="docs-main-content">
            
            {/* Overview */}
            <section id="overview" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Store size={22} style={{ color: 'var(--primary)' }} /> 1. Overview & Positioning
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore is **Conversational Commerce Infrastructure** built specifically for African merchants. In Africa, retail isn't purely transactional—it is personal, relational, and runs heavily inside chat threads. Traditional e-commerce setups force customers away from their native environments to checkout on rigid websites. 
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore bridges this gap by embedding the tools to catalog items, process payments, verify bank transfers, and run automated marketing broadcasts directly into **WhatsApp**. 
              </p>

              <div style={{ 
                background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.05))', 
                borderLeft: '4px solid var(--primary)', 
                borderRadius: 'var(--r-md)', 
                padding: 20,
                display: 'flex',
                gap: 12
              }}>
                <Lightbulb size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Relational-First Commerce</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Frontstore is designed around chat interactions. When customers click to buy, they are checking out in a frictionless mobile catalog and automatically sharing their order details on WhatsApp to close the deal naturally.
                  </p>
                </div>
              </div>
            </section>

            {/* Onboarding */}
            <section id="onboarding" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Settings size={22} style={{ color: 'var(--primary)' }} /> 2. Account Registration & Personas
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Creating your account takes under two minutes. During registration, you specify:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--text-2)' }}>
                <li><strong>Store Name:</strong> The customer-facing title of your shop.</li>
                <li><strong>Store Link Name (Username):</strong> The path that defines your URL, yielding `frontstore.app/yourname`.</li>
                <li><strong>WhatsApp Phone Number:</strong> The linked business phone where WhatsApp order receipts and buyer notifications land.</li>
              </ul>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>Selecting a Business Persona</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Frontstore uses presets to pre-configure appropriate default layouts, color variables, and terminology (e.g. replacing &quot;Catalog&quot; with &quot;Menu&quot; for restaurants or &quot;Bookings&quot; for stylists):
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 12,
                marginTop: 8
              }}>
                <div style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 4 }}>👗 Retail & Apparel</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>Configures product sizes, categories, compare pricing, and ready-to-ship shipping workflows.</span>
                </div>
                <div style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 4 }}>💅 Beauty & Wellness</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>Activates calendar booking flows, time-slots, service durations, and signature treatment cards.</span>
                </div>
                <div style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 4 }}>🍳 Food & Kitchen</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>Optimizes local pickup/delivery limits, custom checkout notes, and instant dispatch coordinates.</span>
                </div>
              </div>
            </section>

            {/* Frontstore Flow */}
            <section id="flow" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={22} style={{ color: 'var(--primary)' }} /> 3. Frontstore Flow (Catalogs)
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                **Frontstore Flow** is our storefront catalog builder. From the merchant portal, you can structure categories and upload products or services easily.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>Theme Templates</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                We provide professionally styled templates that alter the vibe of your store with one click:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--text-2)' }}>
                <li><strong>Luxe Market:</strong> Deep purples and cinematic headers, ideal for premium boutique brands.</li>
                <li><strong>Editorial:</strong> Newspaper styling, story-focused layout suitable for luxury clothing and designs.</li>
                <li><strong>Flash Sale:</strong> High-energy red and amber deals theme built for drops and promotional campaigns.</li>
                <li><strong>WhatsApp Native:</strong> Matches WhatsApp's interface style to increase trust for chat-accustomed shoppers.</li>
              </ul>

              <div style={{ 
                background: 'var(--danger-light)', 
                borderLeft: '4px solid var(--danger)', 
                borderRadius: 'var(--r-md)', 
                padding: 16,
                marginTop: 12
              }}>
                <div style={{ display: 'flex', gap: 10, color: 'var(--danger)', fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                  <CheckCircle2 size={16} /> Services vs. Products
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  Make sure you select the correct type when uploading items. Physical goods require stock levels and shipping details, while services require booking durations and display dynamic appointment calendar controls on your storefront.
                </p>
              </div>
            </section>

            {/* Frontstore Pay */}
            <section id="pay" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={22} style={{ color: 'var(--primary)' }} /> 4. Frontstore Pay & Escrow
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore handles payment collections inside your chat flows securely, integrating with top local gateways.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 8 }}>
                <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Paystack Integration
                  </h4>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Accept local cards, mobile money networks (M-Pesa, MoMo), and temporary dedicated virtual bank accounts (DVAs). Virtual transfers auto-verify in seconds.
                  </p>
                </div>
                <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ExternalLink size={16} style={{ color: 'var(--primary)' }} /> Stripe Connection
                  </h4>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Connect Stripe directly to collect payments in international currencies (USD/GBP) from global credit cards.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>The Escrow Protection Rule</h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                Funds are held securely in the Frontstore Escrow and released to your settlement wallet when the buyer confirms delivery, or after the regional holding period (3–7 days depending on validation and account standing). 
              </p>
            </section>

            {/* Frontstore Aura */}
            <section id="aura" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bot size={22} style={{ color: 'var(--primary)' }} /> 5. Frontstore Aura (WhatsApp AI)
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                **Frontstore Aura** is an AI sales agent that acts on your behalf 24/7 inside WhatsApp. By scanning QR verification or hooking up the API, Aura handles customer chats autonomously.
              </p>

              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Key Capabilities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13.5, color: 'var(--text-2)' }} className="grid-2col">
                <div>
                  <strong>🤖 Auto Checkout:</strong> Parses customer requests and sends a click-to-pay receipt instantly.
                </div>
                <div>
                  <strong>🗣️ Local Slang:</strong> Trained to understand Pidgin, Sheng, and typos easily.
                </div>
                <div>
                  <strong>📊 FAQ & Bio:</strong> Answers questions regarding store location, delivery options, and sizing.
                </div>
                <div>
                  <strong>📷 Screenshot Parser:</strong> Scans buyer bank receipts via computer vision to match and update order states.
                </div>
              </div>

              <div style={{ 
                background: 'var(--accent-light)', 
                borderLeft: '4px solid var(--accent)', 
                borderRadius: 'var(--r-md)', 
                padding: 16,
                marginTop: 8
              }}>
                <div style={{ display: 'flex', gap: 10, color: 'var(--accent)', fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                  <AlertTriangle size={16} /> Merchant Accountability
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  You configure Aura's bargaining thresholds in settings. You remain contractually responsible for the agreements and pricing guidelines dispatched by Aura in chats.
                </p>
              </div>
            </section>

            {/* Frontstore Pulse */}
            <section id="pulse" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={22} style={{ color: 'var(--primary)' }} /> 6. Frontstore Pulse (Analytics & CRM)
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Monitor your sales metrics, view customer ratings, and analyze performance funnels:
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: 12,
                marginTop: 8
              }} className="stats-4col">
                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <strong style={{ fontSize: 20, display: 'block', color: 'var(--primary)' }}>₦350K+</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue Tracked</span>
                </div>
                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <strong style={{ fontSize: 20, display: 'block', color: 'var(--primary)' }}>1,200</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Page Views</span>
                </div>
                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <strong style={{ fontSize: 20, display: 'block', color: 'var(--primary)' }}>22%</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>WhatsApp Redirects</span>
                </div>
                <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <strong style={{ fontSize: 20, display: 'block', color: 'var(--primary)' }}>4.8★</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Verified Reviews</span>
                </div>
              </div>

              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 12 }}>
                <strong>Review Responses:</strong> Replying to reviews in your dashboard publishes the replies beneath client comments, demonstrating responsive customer support.
              </p>
            </section>

            {/* Frontstore Reach */}
            <section id="reach" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Megaphone size={22} style={{ color: 'var(--primary)' }} /> 7. Frontstore Reach (WhatsApp Campaigns)
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Launch automated campaigns and follow-ups through **Frontstore Reach**. Retarget segments based on previous purchase histories:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                <li><strong>All Customers:</strong> Announce major product drops, discount seasons, or address changes.</li>
                <li><strong>Repeat Buyers:</strong> Send dedicated discounts to loyal patrons to incentivize further orders.</li>
                <li><strong>Unpaid Orders (Bargain Recovery):</strong> Reach back out to customers with pending carts or WhatsApp negotiations that did not finalize payment.</li>
              </ul>
              
              <div style={{ 
                background: 'var(--primary-light)', 
                borderLeft: '4px solid var(--primary)', 
                borderRadius: 'var(--r-md)', 
                padding: 16,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginTop: 8
              }}>
                <Clock size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                  <strong>Compliance Nudge:</strong> Custom broadcast templates must be submitted and approved before dispatch to conform with WhatsApp anti-spam guidelines.
                </span>
              </div>
            </section>

          </main>

        </div>

      </div>

      {/* Footer */}
      <PublicSiteFooter />

      {/* Media Queries */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .docs-layout-grid {
            flex-direction: column !important;
          }
          .docs-sidebar {
            width: 100% !important;
            position: relative !important;
            top: 0 !important;
            margin-bottom: 24px;
          }
        }
        @media (max-width: 640px) {
          .stats-4col {
            grid-template-columns: 1fr 1fr !important;
          }
          .grid-2col {
            grid-template-columns: 1fr !important;
          }
          .docs-main-content {
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
