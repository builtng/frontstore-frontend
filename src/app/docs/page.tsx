'use client';

import React from 'react';
import { 
  ArrowRight, 
  Store, 
  ShoppingBag, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  MessageSquare,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function DocsLandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <PublicSiteNav />

      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        padding: '80px 20px', 
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, #1a0833 100%)', 
        color: '#fff', 
        textAlign: 'center', 
        overflow: 'hidden' 
      }}>
        {/* Dynamic Background Mesh */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.12, 
          backgroundImage: 'radial-gradient(var(--primary) 1.5px, transparent 1.5px)', 
          backgroundSize: '24px 24px' 
        }} />
        <div style={{ 
          position: 'absolute', 
          top: '-20%', 
          left: '30%', 
          width: '500px', 
          height: '500px', 
          borderRadius: '50%', 
          background: 'var(--primary)', 
          filter: 'blur(160px)', 
          opacity: 0.3,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto' }}>
          <span className="badge font-heading animate-fade-in" style={{ 
            background: 'rgba(255,255,255,0.08)', 
            color: 'var(--primary)', 
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            padding: '6px 16px',
            fontSize: 12,
            marginBottom: 16
          }}>
            <BookOpen size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Help Center
          </span>
          <h1 className="text-display animate-slide-up" style={{ fontSize: 'clamp(32px, 5.5vw, 52px)', marginBottom: 20, color: '#fff' }}>
            How can we help you today?
          </h1>
          <p className="animate-slide-up" style={{ 
            color: 'rgba(255, 255, 255, 0.75)', 
            fontSize: 'clamp(15px, 2.5vw, 18px)', 
            lineHeight: 1.6, 
            maxWidth: 600, 
            margin: '0 auto 32px' 
          }}>
            Explore step-by-step guides, payment integrations, and automation features built specifically for the conversational commerce ecosystem.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1150, margin: '-40px auto 0', padding: '0 20px 60px', position: 'relative', zIndex: 10 }}>
        
        {/* Guides Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: 24,
          marginBottom: 48
        }}>
          {/* Merchant Card */}
          <article className="card glass card-hover animate-scale-in" style={{ 
            padding: '40px 32px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 24,
            borderRadius: 'var(--r-2xl)'
          }}>
            <div style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 'var(--r-md)', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              display: 'grid', 
              placeItems: 'center' 
            }}>
              <Store size={28} />
            </div>
            <div>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
                For Merchants & Sellers
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6, minHeight: 96 }}>
                Learn how to create your automated storefront, customize styles and templates, verify bank details for instant payouts, configure the WhatsApp Nina AI sales assistant, and launch marketing broadcasts to repeat buyers.
              </p>
            </div>
            <a href="/docs/merchant" className="btn btn-primary clickable" style={{ width: '100%', gap: 8, padding: '14px 20px', fontSize: 14.5, textDecoration: 'none' }}>
              Read Merchant Guide <ArrowRight size={16} />
            </a>
          </article>

          {/* Buyer Card */}
          <article className="card glass card-hover animate-scale-in" style={{ 
            padding: '40px 32px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 24,
            borderRadius: 'var(--r-2xl)'
          }}>
            <div style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 'var(--r-md)', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              display: 'grid', 
              placeItems: 'center' 
            }}>
              <ShoppingBag size={28} />
            </div>
            <div>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
                For Shoppers & Buyers
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.6, minHeight: 96 }}>
                Find out how to browse storefronts, book appointments with calendar slots, pay securely using local cards, bank transfers, or mobile money, utilize Escrow protection for safe shopping, and complete order checkout directly inside WhatsApp.
              </p>
            </div>
            <a href="/docs/buyer" className="btn btn-outline clickable" style={{ width: '100%', gap: 8, padding: '14px 20px', fontSize: 14.5, textDecoration: 'none' }}>
              Read Shopper Guide <ArrowRight size={16} />
            </a>
          </article>
        </div>

        {/* Feature Highlights Section */}
        <section className="card" style={{ padding: '40px 32px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 24, textAlign: 'center' }}>
            Explore Core Conversational Products
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: 24 
          }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}><Layers size={20} /></div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Frontstore Flow</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Configure interactive products and time-based slots for booking with premium custom templates.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}><ShieldCheck size={20} /></div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Frontstore Pay</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Secure payments via cards, mobile money, and virtual bank accounts with escrow trust safeguards.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}><MessageSquare size={20} /></div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Frontstore Nina</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Intelligent AI sales agent responding, negotiating, and verifying transfer screenshots in WhatsApp 24/7.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}><TrendingUp size={20} /></div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Frontstore Pulse</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Detailed sales dashboards, views, conversion funnels, and verified customer reviews.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <PublicSiteFooter />
    </div>
  );
}
