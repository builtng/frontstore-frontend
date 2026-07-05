'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
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

      {/* ── Hero ── */}
      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-22%', right: '-10%', width: 360, height: 360, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-30%', left: '-12%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />
        <div className="hero-dash" style={{ top: '20%', left: '8%', width: 40, height: 40 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <a
            href="/"
            className="clickable"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textDecoration: 'none', marginBottom: 28 }}
          >
            <ArrowLeft size={14} /> Back to Home
          </a>

          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <MessageCircle size={12} color="var(--accent)" /> <b>Our Narrative</b>
          </div>

          <h1 className="text-display" style={{ fontSize: 'clamp(30px, 5vw, 46px)', color: '#fff', lineHeight: 1.15 }}>
            Commerce Through <span className="mark-highlight">Conversation</span>
          </h1>

          <p style={{
            marginTop: 20,
            color: 'rgba(255,255,255,0.78)',
            fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: 1.65,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Frictionless commerce in the chats you already have.
          </p>
        </div>
      </header>

      {/* ── Narrative ── */}
      <div style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        <div style={{ display: 'grid', gap: 22, marginBottom: 56 }}>
          {NARRATIVE_PARAGRAPHS.map((paragraph, index) => (
            <p
              key={index}
              style={index === 0 ? {
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(19px, 2.6vw, 24px)',
                lineHeight: 1.5,
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
                borderLeft: '3px solid var(--primary)',
                paddingLeft: 20,
              } : {
                fontSize: 'clamp(15px, 2vw, 17px)',
                lineHeight: 1.8,
                color: 'var(--text-2)',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <span className="badge badge-primary" style={{ marginBottom: 16 }}>How it comes together</span>
        </div>
        <div className="step-rail">
          {STEPS.map((step, idx) => (
            <div key={idx} className="step-rail__item animate-fade-in" style={{ animationDelay: `${idx * 90}ms` }}>
              <div className="step-rail__num">{idx + 1}</div>
              <div style={{ paddingTop: 6 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Closing CTA ── */}
      <section style={{ padding: '0 20px clamp(56px, 9vw, 88px)' }}>
        <div className="hero-dark cta-inset" style={{ padding: 'clamp(40px, 7vw, 64px) 20px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          <div className="hero-blob" style={{ top: '-45%', right: '-8%', width: 280, height: 280, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="text-title" style={{ color: '#fff', marginBottom: 12 }}>
              Ready to turn your chats into a store?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 24, fontSize: 15, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
              Claim your link and start receiving orders on WhatsApp in under two minutes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <a
                href="/signup"
                className="btn"
                style={{
                  background: '#fff', color: 'var(--primary-dark)',
                  padding: '13px 26px', fontSize: 14, borderRadius: 'var(--r-xl)',
                  fontFamily: 'var(--font-heading)', fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                }}
              >
                Start Selling Free <ArrowRight size={15} />
              </a>
              <a
                href="/business"
                className="btn"
                style={{
                  padding: '13px 26px', fontSize: 14, borderRadius: 'var(--r-xl)',
                  background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, textDecoration: 'none',
                }}
              >
                See it for your business
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </div>
  );
}
