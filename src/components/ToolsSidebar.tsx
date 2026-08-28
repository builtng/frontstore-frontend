import React from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, Lightbulb, ChevronRight, Zap } from 'lucide-react';
import { FREE_TOOLS } from '@/utils/toolsData';

interface ToolsSidebarProps {
  currentSlug: string;
  proTip?: {
    title: string;
    content: string;
  };
}

export function ToolsSidebar({ currentSlug, proTip }: ToolsSidebarProps) {
  const otherTools = FREE_TOOLS.filter((t) => t.slug !== currentSlug);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Merchant Pro Tip */}
      {proTip && (
        <div
          className="card"
          style={{
            padding: 24,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--surface)) 0%, var(--surface) 100%)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Lightbulb size={18} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
              {proTip.title}
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>
            {proTip.content}
          </p>
        </div>
      )}

      {/* Related Free Calculators */}
      <div className="card" style={{ padding: 24, background: 'var(--surface)', borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={16} color="var(--primary)" /> Related Tools
          </h3>
          <Link href="/tools" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            View All
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {otherTools.slice(0, 4).map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="clickable"
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tool.name}
                </p>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                  {tool.tagline}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Frontstore CTA Box */}
      <div
        className="hero-dark"
        style={{
          borderRadius: 20,
          padding: 24,
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="hero-blob" style={{ top: '-30%', right: '-20%', width: 220, height: 220, background: 'color-mix(in srgb, var(--accent) 18%, transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '3px 10px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginBottom: 12,
            }}
          >
            <Zap size={12} color="var(--accent)" /> Automated Store Financials
          </span>
          <h3 className="text-display" style={{ fontSize: 18, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
            Stop manual calculations on every WhatsApp order
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, lineHeight: 1.6, marginBottom: 18 }}>
            Frontstore automatically calculates profit margins, tracks cost prices, and handles payouts for your social business.
          </p>
          <a
            href="/signup"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: 13,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 12,
            }}
          >
            <span>Set Up Your Store Free</span> <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </aside>
  );
}
