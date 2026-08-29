'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Copy,
  Store,
  Share2,
  Sparkles,
  Gift,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Check,
  ShoppingBag,
  Send,
  Zap,
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { TwitterXIcon, FacebookIcon, LinkedInIcon } from '../SocialIcons';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { StoreInfo, Product } from '@/types/dashboard';

interface ShareTabProps {
  store: StoreInfo | null;
  products: Product[];
  systemDomain: string;
}

export default function ShareTab({ store, products, systemDomain }: ShareTabProps) {
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);
  const [copiedRefLink, setCopiedRefLink] = useState(false);

  const storeUrl = store?.custom_domain
    ? `https://${store.custom_domain}`
    : store?.username
      ? `https://${store.username}.${systemDomain}`
      : `https://${systemDomain}`;

  const referralUrl = store?.username
    ? `https://${store.username}.${systemDomain}/ref`
    : `https://${systemDomain}/ref`;

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedStoreLink(true);
    toast.success('Store link copied to clipboard! 📋');
    setTimeout(() => setCopiedStoreLink(false), 2000);
  };

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedRefLink(true);
    toast.success('Referral link copied! 💰');
    setTimeout(() => setCopiedRefLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `🏪 Check out my digital store on Frontstore! Browse products & order on WhatsApp here: ${storeUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Check out my store on Frontstore! Shop online directly on WhatsApp:`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(storeUrl)}`,
      '_blank'
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
      '_blank'
    );
  };

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storeUrl)}`,
      '_blank'
    );
  };

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 24 }}
      className="responsive-share-grid animate-fade-in"
    >
      {/* ── LEFT COLUMN: VIRAL SHARE CENTER ── */}
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--text)' }}>
              Viral Share Center
            </h2>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'rgba(37, 211, 102, 0.12)', color: '#16a34a' }}>
              Instant Traffic
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0 }}>
            Share your catalog link across WhatsApp and social media to drive buyers directly into your dashboard.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Store URL Container */}
          <div
            style={{
              background: 'var(--bg-2)',
              padding: '16px 20px',
              borderRadius: 18,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Store Address
              </span>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
              >
                Preview Store <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-dark)', wordBreak: 'break-all' }}>
                {storeUrl.replace('https://', '')}
              </span>
              <button
                onClick={handleCopyStoreLink}
                className="btn clickable"
                style={{
                  padding: '8px 16px',
                  fontSize: 12.5,
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {copiedStoreLink ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                {copiedStoreLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* WhatsApp Main Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="clickable"
            style={{
              background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)',
              color: '#fff',
              padding: '16px 20px',
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 15,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <WhatsAppIcon size={20} color="#fff" /> Share Store Link on WhatsApp
          </button>

          {/* Quick Social Shares */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
              Quick Share to Social Networks
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <button
                onClick={handleShareTwitter}
                className="clickable"
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <TwitterXIcon size={15} color="var(--text)" /> X / Twitter
              </button>

              <button
                onClick={handleShareFacebook}
                className="clickable"
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <FacebookIcon size={15} color="#1877F2" /> Facebook
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="clickable"
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <LinkedInIcon size={15} color="#0A66C2" /> LinkedIn
              </button>
            </div>
          </div>

          {/* Visual Storefront Card Preview */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 18,
              overflow: 'hidden',
              background: 'var(--bg-2)',
              marginTop: 4,
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                padding: '16px 20px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={18} /> Shop Live: {store?.store_name || 'My Store'}
                </h4>
                <p style={{ fontSize: 12, opacity: 0.85, margin: '2px 0 0' }}>Instant catalog & WhatsApp checkouts</p>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                Live Preview
              </span>
            </div>

            <div style={{ padding: 16, display: 'flex', gap: 12, overflowX: 'auto' }}>
              {products.length > 0 ? (
                products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: 'var(--surface)',
                      padding: 10,
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      width: 110,
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 64,
                        background: 'var(--bg-2)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {p.image_urls?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.image_urls[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '6px 0 2px' }}>
                      {p.name}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, display: 'block' }}>
                      {getCurrencySymbol(store?.currency_code)}{formatVal(p.price)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', width: '100%', fontSize: 13, color: 'var(--text-muted)' }}>
                  Add products to preview your store layout.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: REFERRAL REWARD CENTER ── */}
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--text)' }}>
              Referral Reward Center
            </h2>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'rgba(234, 179, 8, 0.14)', color: '#ca8a04' }}>
              Earn ₦1,500 / Ref
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0 }}>
            Invite fellow merchants to Frontstore and earn cash payouts straight to your balance.
          </p>
        </div>

        {/* Hero Bounty Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: 24,
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)',
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.25)',
              filter: 'blur(30px)',
            }}
          />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.16)', color: '#34d399', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            <Gift size={13} /> Referral Bonus
          </div>

          <p style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: '4px 0 2px', letterSpacing: '-0.03em' }}>
            ₦1,500
          </p>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            Paid per merchant referral who upgrades to Pro & publishes their first product
          </span>
        </div>

        {/* Referral Link Box */}
        <div
          style={{
            background: 'var(--bg-2)',
            padding: '16px 20px',
            borderRadius: 18,
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your Unique Referral Link
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {referralUrl.replace('https://', '')}
            </span>
            <button
              onClick={handleCopyRefLink}
              className="btn clickable"
              style={{
                padding: '7px 14px',
                fontSize: 12,
                borderRadius: 10,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              {copiedRefLink ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
              {copiedRefLink ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        {/* WhatsApp Vendor Invite CTA */}
        <button
          onClick={() => {
            const msg = encodeURIComponent(
              `Hey! I'm using Frontstore to sell online and receive WhatsApp checkouts. Use my link to register your store: ${referralUrl}`
            );
            window.open(`https://wa.me/?text=${msg}`, '_blank');
          }}
          className="clickable"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1.5px solid var(--border)',
            padding: '12px 16px',
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <Send size={15} color="var(--primary)" /> Invite Vendor on WhatsApp
        </button>

        {/* How It Works Infographic */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            How Referral Payouts Work
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: 'var(--text-2)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                1
              </div>
              <span>Share your referral link with store owners & sellers.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: 'var(--text-2)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                2
              </div>
              <span>Vendor registers their store using your referral link.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: 'var(--text-2)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                3
              </div>
              <span>Vendor upgrades to Pro and publishes their first product to their storefront.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: 'var(--text-2)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.14)', color: '#10b981', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                4
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                You get ₦1,500 credited straight to your store wallet balance!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
