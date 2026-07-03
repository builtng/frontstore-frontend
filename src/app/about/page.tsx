'use client';

import React from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

const NARRATIVE_PARAGRAPHS = [
  "Most African businesses don't need complicated ecommerce websites before they can start selling with confidence. They need a fast way to show products, answer questions, confirm orders, and collect buyer details without leaving the channel their customers already trust.",
  'That channel is WhatsApp. It is where discovery, negotiation, referrals, payment conversations, and repeat purchases already happen every day.',
  'Frontstore turns those conversations into a structured commerce system. A merchant can launch a branded store, organize products, share one link, receive clear order intent, and keep customer conversations moving toward payment and delivery.',
  'Instead of forcing sellers to choose between a website and WhatsApp, Frontstore connects both. The store gives buyers a clean catalog experience, while WhatsApp keeps the human relationship that drives trust.',
  'The result is simple: sellers look more professional, customers understand what to buy, and every conversation has a clearer path to revenue.',
];

const STEPS = [
  { title: 'Create a Store', desc: 'Add products in 2 mins' },
  { title: 'Share a Link', desc: 'Status, Instagram, TikTok' },
  { title: 'Receive Orders', desc: 'Directly in WhatsApp' },
  { title: 'Manage Customers', desc: 'Conversation-driven CRM' },
  { title: 'Grow Revenue', desc: 'Scale with simple analytics' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <PublicSiteNav />

      <div style={{ flex: 1, width: '100%', maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', marginBottom: 24 }} className="clickable">
          <ArrowLeft size={14} /> Back to Home
        </a>

        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <span className="badge badge-accent" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <MessageCircle size={11} /> Our Narrative
          </span>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>Commerce Through Conversation</h1>
        </header>

        <div className="card animate-fade-in" style={{
          padding: '40px 30px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'grid', gap: 18, marginBottom: 36, position: 'relative', zIndex: 1 }}>
            {NARRATIVE_PARAGRAPHS.map((paragraph, index) => (
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 20,
            borderTop: '1px solid var(--border)',
            paddingTop: 32
          }}>
            {STEPS.map((step, idx) => (
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

      <PublicSiteFooter />
    </div>
  );
}
