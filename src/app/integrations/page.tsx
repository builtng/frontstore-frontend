import React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Plug, Zap, BarChart3, Mail, Send, BookOpen, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { INTEGRATIONS, INTEGRATION_CATEGORIES } from '@/utils/integrationsData';

export const metadata: Metadata = {
  title: 'Integrations – Connect Frontstore to Your Favourite Tools',
  description: 'Connect your Frontstore to Facebook Pixel, Google Tag Manager, TikTok Pixel, Mailchimp, SendPulse, ConvertKit, MailerLite, Zapier, Telegram, and Thinkific.',
  alternates: { canonical: 'https://frontstore.ng/integrations' },
};

const BRAND_ICONS: Record<string, React.ReactNode> = {
  'facebook-pixel': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  'google-tag-manager': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.87 15.07l-2.54-2.54 2.54-2.54 2.54 2.54-2.54 2.54zm-6.2-2.54l6.2-6.2 6.2 6.2-6.2 6.2-6.2-6.2zm6.2-8.68L2.4 12.53l10.47 10.47 10.47-10.47L12.87 3.85z"/>
    </svg>
  ),
  'tiktok-pixel': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.05.82.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 003 15.68 6.34 6.34 0 009.34 22a6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.91 1.62V7.54a4.85 4.85 0 01-1-.85z"/>
    </svg>
  ),
  mailchimp: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
  telegram: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.4-3.63 4-.17 4.83.69 4.84 1.47z"/>
    </svg>
  ),
  zapier: <Zap size={20} color="#ffffff" />,
  sendpulse: <Send size={20} color="#ffffff" />,
  convertkit: <Mail size={20} color="#ffffff" />,
  mailerlite: <Mail size={20} color="#ffffff" />,
  thinkific: <BookOpen size={20} color="#F3AA00" />,
  kartra: <BarChart3 size={20} color="#ffffff" />,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Analytics & Ad Pixels': <BarChart3 size={18} color="var(--primary)" />,
  'Email Marketing': <Mail size={18} color="var(--primary)" />,
  Automation: <Zap size={18} color="var(--primary)" />,
  Notifications: <Send size={18} color="var(--primary)" />,
  'Courses & Membership': <BookOpen size={18} color="var(--primary)" />,
};

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Plug size={14} color="var(--accent)" /> <b>Frontstore Ecosystem</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 46px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Seamlessly connect Frontstore to <span className="mark-highlight">your favourite tools</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
            Every paid order syncs automatically — no manual exports, no copy-pasting customer lists. Real-time webhooks & tracking pixels.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <a href="/signup" className="btn btn-primary" style={{ padding: '13px 26px', fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 'var(--r-md)' }}>
              Start Connecting Free <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        {INTEGRATION_CATEGORIES.map((category) => {
          const items = INTEGRATIONS.filter((i) => i.category === category);
          if (items.length === 0) return null;

          return (
            <section key={category} style={{ marginBottom: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                {CATEGORY_ICONS[category]}
                <h2 className="text-title" style={{ fontSize: 'clamp(18px, 2.6vw, 22px)', margin: 0 }}>
                  {category}
                </h2>
              </div>
              <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {items.map((integration) => (
                  <div
                    key={integration.id}
                    className="card card-hover"
                    style={{
                      padding: 22,
                      background: 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      justifyContent: 'space-between',
                      borderRadius: 'var(--r-xl)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `hsl(${integration.hue}, 70%, 94%)`,
                              color: `hsl(${integration.hue}, 55%, 38%)`,
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 800,
                              fontSize: 16,
                              boxShadow: 'var(--shadow-xs)',
                            }}
                          >
                            {BRAND_ICONS[integration.id] || integration.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                              {integration.name}
                            </p>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                              Automated Sync
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-primary" style={{ background: 'var(--primary-light)', color: 'var(--primary)', gap: 4 }}>
                          <Sparkles size={10} /> Live
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                        {integration.description}
                      </p>
                    </div>

                    <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} color="var(--primary)" /> Ready out of box
                      </span>
                      <a href="/signup" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Connect <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            More integrations are added every month. Have a specific tool request?{' '}
            <a href="mailto:support@frontstore.ng" style={{ color: 'var(--primary)', fontWeight: 700 }}>Tell us what to add next</a>.
          </p>
        </div>

        <div className="hero-dark" style={{ borderRadius: 28, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center', marginTop: 40, position: 'relative', overflow: 'hidden' }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', color: '#fff', marginBottom: 12 }}>
            Ready to launch your own automated storefront?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Free to start. No credit card required. Connect your pixels and email tools in under 2 minutes.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '13px 26px', fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}

