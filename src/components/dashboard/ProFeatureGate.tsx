'use client';

import React from 'react';
import { Zap, Sparkles, CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ProFeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

export interface ProFeatureGateProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  features?: ProFeatureItem[];
  badgeText?: string;
  onUpgrade: () => void;
  previewChildren?: React.ReactNode;
}

export default function ProFeatureGate({
  title,
  subtitle,
  icon: Icon,
  features = [],
  badgeText = 'PRO FEATURE',
  onUpgrade,
  previewChildren,
}: ProFeatureGateProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        width: '100%',
        maxWidth: 820,
        margin: '24px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Main Glassmorphic Hero Paywall Card */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--r-xl, 24px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(99, 102, 241, 0.05)',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Decorative background glow accents */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 50%, rgba(255,255,255,0) 75%)',
            pointerEvents: 'none',
            filter: 'blur(30px)',
          }}
        />

        {/* Top Floating Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: 11.5,
            fontWeight: 800,
            color: '#4F46E5',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)',
          }}
        >
          <Zap size={14} className="animate-pulse" style={{ color: '#6366F1' }} />
          <span>{badgeText}</span>
        </div>

        {/* Icon & Title */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 28px -6px rgba(79, 70, 229, 0.4)',
            marginBottom: 20,
          }}
        >
          <Icon size={34} color="#ffffff" />
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 900,
            color: 'var(--text-main, #0F172A)',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: 14.5,
            color: 'var(--text-muted, #64748B)',
            marginTop: 10,
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>

        {/* Feature Highlights Grid */}
        {features.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
              width: '100%',
              marginTop: 28,
              marginBottom: 28,
              textAlign: 'left',
            }}
          >
            {features.map((feat, idx) => {
              const FeatIcon = feat.icon || CheckCircle2;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <FeatIcon size={18} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: 'var(--text-main, #0F172A)',
                        margin: 0,
                      }}
                    >
                      {feat.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted, #64748B)',
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upgrade Action CTA */}
        <div style={{ width: '100%', maxWidth: 440, marginTop: features.length === 0 ? 24 : 0 }}>
          <button
            onClick={onUpgrade}
            className="clickable"
            style={{
              width: '100%',
              padding: '16px 28px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.4)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
            }}
          >
            <Sparkles size={20} color="#FDE047" />
            <span>Upgrade to Pro Now</span>
            <ArrowRight size={18} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginTop: 14,
              fontSize: 12,
              color: 'var(--text-muted, #64748B)',
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={14} color="#10B981" /> Instant Access
            </span>
            <span>•</span>
            <span>Cancel Anytime</span>
            <span>•</span>
            <span>Unlocks All Pro Tools</span>
          </div>
        </div>
      </div>

      {/* Blurred Interactive Dashboard Preview Mockup */}
      {previewChildren && (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--r-xl, 24px)',
            overflow: 'hidden',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            opacity: 0.65,
            filter: 'blur(3px)',
            pointerEvents: 'none',
            userSelect: 'none',
            maxHeight: 280,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Lock size={14} /> Feature Preview Locked
            </div>
          </div>
          {previewChildren}
        </div>
      )}
    </div>
  );
}
