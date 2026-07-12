import React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Plug } from 'lucide-react';
import { PublicSiteFooter, PublicSiteNav } from '@/components/PublicSiteChrome';
import { INTEGRATIONS, INTEGRATION_CATEGORIES } from '@/utils/integrationsData';

export const metadata: Metadata = {
  title: 'Integrations – Connect Frontstore to Your Favourite Tools',
  description: 'Connect your Frontstore to Facebook Pixel, Google Tag Manager, TikTok Pixel, Mailchimp, SendPulse, ConvertKit, MailerLite, Zapier, Telegram, and Thinkific.',
  alternates: { canonical: 'https://frontstore.ng/integrations' },
};

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />

      <header className="hero-dark" style={{ padding: 'clamp(48px, 9vw, 88px) 20px clamp(56px, 9vw, 96px)' }}>
        <div className="hero-blob" style={{ top: '-20%', right: '-8%', width: 380, height: 380, background: 'rgba(255,255,255,0.05)' }} />
        <div className="hero-blob" style={{ bottom: '-35%', left: '-10%', width: 400, height: 400, background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Plug size={12} color="var(--accent)" /> <b>Integrations</b>
          </div>
          <h1 className="text-display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Seamlessly connect Frontstore to <span className="mark-highlight">your favourite tools</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Every paid order syncs automatically — no manual exports, no copy-pasting customer lists.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Try Frontstore Free <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 1040, margin: '0 auto', padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        {INTEGRATION_CATEGORIES.map((category) => {
          const items = INTEGRATIONS.filter((i) => i.category === category);
          if (items.length === 0) return null;

          return (
            <section key={category} style={{ marginBottom: 48 }}>
              <h2 className="text-title" style={{ fontSize: 'clamp(18px, 2.6vw, 22px)', marginBottom: 20 }}>
                {category}
              </h2>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {items.map((integration) => (
                  <div
                    key={integration.id}
                    className="card"
                    style={{ padding: 22, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `hsl(${integration.hue}, 70%, 94%)`, color: `hsl(${integration.hue}, 55%, 38%)`,
                          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15,
                        }}
                      >
                        {integration.name.charAt(0)}
                      </div>
                      <span className="badge badge-primary" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>Live</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                        {integration.name}
                      </p>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {integration.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', textAlign: 'center', marginBottom: 8 }}>
          More integrations are on the way. Have a request?{' '}
          <a href="mailto:support@frontstore.ng" style={{ color: 'var(--primary)' }}>Tell us</a>.
        </p>

        <div className="hero-dark" style={{ borderRadius: 24, padding: 'clamp(36px, 6vw, 56px) 24px', textAlign: 'center', marginTop: 40 }}>
          <h2 className="text-display" style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: '#fff', marginBottom: 12 }}>
            Ready to launch your own WhatsApp store?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginBottom: 22 }}>
            Free to start. No credit card required. Live in under 2 minutes.
          </p>
          <a href="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get Started <ArrowRight size={15} />
          </a>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
