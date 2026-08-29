'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  QrCode,
  CheckCircle2,
  Zap,
  Phone,
  MapPin,
  Download,
  Copy,
  Printer,
  ExternalLink,
  Sparkles,
  Check,
  Store,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Eye,
} from 'lucide-react';
import QRCodeSVG from 'react-qr-code';
import type { StoreInfo } from '@/types/dashboard';

interface QrTabProps {
  isPro: boolean;
  store: StoreInfo | null;
  systemDomain: string;
  openUpgradePrompt: (title: string, description: string) => void;
}

export default function QrTab({ isPro, store, systemDomain, openUpgradePrompt }: QrTabProps) {
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'luxe' | 'emerald' | 'minimal'>('emerald');

  if (!isPro) {
    return (
      <div
        className="card animate-fade-in"
        style={{
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 680,
          margin: '30px auto',
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(11, 93, 57, 0.14), rgba(4, 42, 25, 0.08))',
            color: '#0B5D39',
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 24px rgba(11, 93, 57, 0.18)',
          }}
        >
          <QrCode size={36} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(11, 93, 57, 0.1)', color: '#0B5D39', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          <Sparkles size={13} /> Pro Feature
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
          Print-Ready QR Store Flyer
        </h2>

        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 520, marginBottom: 28 }}>
          Download branded 300 DPI high-resolution QR flyers for your physical store, packaging, receipts, or social channels so customers can scan to browse and checkout on WhatsApp in seconds.
        </p>

        <div
          style={{
            alignSelf: 'stretch',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 24,
            textAlign: 'left',
            marginBottom: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>300 DPI High-Res Export</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Crisp vectors perfect for printing on posters, counters & flyers.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>Instant WhatsApp Checkout</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Customers scan with any camera app without downloading an app.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>Store Branding Embedded</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Includes your store logo, phone number, location, and web URL.</div>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            openUpgradePrompt(
              'My QR Code requires Pro',
              'Downloadable, print-ready store QR flyers are available on Pro. You can review the plan before upgrading.'
            )
          }
          className="clickable"
          style={{
            padding: '14px 28px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 800,
            fontSize: 15,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            cursor: 'pointer',
          }}
        >
          <Zap size={18} /> Upgrade to Pro to Unlock QR Code
        </button>
      </div>
    );
  }

  const qrUrl = store?.custom_domain
    ? `https://${store.custom_domain}`
    : store?.username
      ? `https://${store.username}.${systemDomain}`
      : `https://${systemDomain}`;
  const storeName = store?.store_name || store?.username || 'My Store';

  // ── Download full flyer as PNG ──────────────────────────────────────
  const downloadFlyer = async () => {
    const svg = document.getElementById('merchant-qr-svg');
    if (!svg) return;
    const W = 900, H = 1200, M = 64;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background based on activeTheme
    if (activeTheme === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
    } else if (activeTheme === 'minimal') {
      ctx.fillStyle = '#0f172a';
    } else {
      const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
      grad.addColorStop(0, '#1a0830');
      grad.addColorStop(1, '#0c0418');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, W, H);

    // Decorative orbs
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = activeTheme === 'emerald' ? '#10b981' : '#8b21f0';
    ctx.beginPath(); ctx.arc(W * 0.88, H * 0.1, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.08, H * 0.82, 160, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Top accent bar
    const barGrad = ctx.createLinearGradient(0, 0, W, 0);
    barGrad.addColorStop(0, activeTheme === 'emerald' ? '#059669' : activeTheme === 'minimal' ? '#3b82f6' : '#042A19');
    barGrad.addColorStop(1, activeTheme === 'emerald' ? '#34d399' : activeTheme === 'minimal' ? '#60a5fa' : '#0B5D39');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, W, 10);

    // Header: logo + store name
    const headerSz = store?.logo_url ? 110 : 0;
    let nameX = M;
    if (store?.logo_url) {
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>(res => { logoImg.onload = () => res(); logoImg.onerror = () => res(); logoImg.src = store.logo_url!; });
        if (logoImg.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(M, M, headerSz, headerSz, 22);
          ctx.clip();
          ctx.drawImage(logoImg, M, M, headerSz, headerSz);
          ctx.restore();
          nameX = M + headerSz + 28;
        }
      } catch { /* ignore */ }
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    const nameText = storeName.length > 20 ? storeName.slice(0, 20) + '…' : storeName;
    ctx.fillText(nameText, nameX, M + (headerSz ? headerSz / 2 : 40) + 18);
    let yOffset = M + Math.max(headerSz, 70) + 44;

    if (store?.store_bio) {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '22px sans-serif';
      const bioText = store.store_bio.length > 120 ? store.store_bio.slice(0, 120) + '…' : store.store_bio;
      ctx.fillText(bioText, M, yOffset);
      yOffset += 40;
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(M, yOffset); ctx.lineTo(W - M, yOffset); ctx.stroke();
    yOffset += 48;

    if (store?.whatsapp_phone) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Phone: ${store.whatsapp_phone}`, M, yOffset);
      yOffset += 38;
    }
    if (store?.location) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Location: ${store.location}`, M, yOffset);
    }

    // QR Image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(W - M - 260, H - M - 290, 260, 260, 28);
      ctx.fill();
      ctx.drawImage(img, W - M - 240, H - M - 270, 220, 220);

      // Bottom CTA left
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Scan to Shop', M, H - M - 130);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '22px sans-serif';
      ctx.fillText('Instant WhatsApp Storefront', M, H - M - 90);
      ctx.fillStyle = activeTheme === 'emerald' ? '#34d399' : '#c084fc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(qrUrl.replace('https://', ''), M, H - M - 40);

      DOMURL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `${storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr-flyer.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Flyer downloaded successfully!');
    };
    img.src = url;
  };

  // ── Direct Browser Print ──────────────────────────────────────────────
  const printFlyer = () => {
    const svg = document.getElementById('merchant-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const b64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${storeName} Store QR Flyer</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0418; color: #fff; }
  .flyer { width: 100vw; height: 100vh; box-sizing: border-box; padding: 60px; display: flex; flex-direction: column; justify-content: space-between; position: relative; background: linear-gradient(160deg, #1a0830 0%, #0c0418 100%); }
  .accent { position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, #059669, #10b981); }
  .header { display: flex; align-items: center; gap: 24px; }
  .store-logo { width: 96px; height: 96px; border-radius: 22px; object-fit: cover; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2); }
  .store-name { color: #fff; font-size: 44px; font-weight: 900; letter-spacing: -0.5px; }
  .store-bio { color: rgba(255,255,255,0.7); font-size: 18px; line-height: 1.6; max-width: 70%; }
  .divider { height: 1px; background: rgba(255,255,255,0.12); }
  .contacts { display: flex; flex-direction: column; gap: 12px; }
  .contact-row { color: rgba(255,255,255,0.85); font-size: 20px; font-weight: 600; }
  .bottom-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
  .cta { color: #fff; font-size: 28px; font-weight: 800; }
  .cta-sub { color: rgba(255,255,255,0.7); font-size: 18px; margin-top: 4px; }
  .footer { color: #c084fc; font-size: 20px; font-weight: 700; margin-top: 14px; }
  .qr-col { display: flex; flex-direction: column; align-items: center; gap: 12px; flex-shrink: 0; }
  .qr-wrap { background: #fff; padding: 22px; border-radius: 24px; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
  .qr-img { width: 220px; height: 220px; display: block; }
</style></head>
<body>
  <div class="flyer">
    <div class="accent"></div>
    <div class="header">
      ${store?.logo_url ? `<img class="store-logo" src="${store.logo_url}" alt="${storeName}" />` : ''}
      <div class="store-name">${storeName}</div>
    </div>
    ${store?.store_bio ? `<div class="store-bio">${store.store_bio}</div>` : ''}
    <div class="divider"></div>
    <div class="contacts">
      ${store?.whatsapp_phone ? `<div class="contact-row">Phone: ${store.whatsapp_phone}</div>` : ''}
      ${store?.location ? `<div class="contact-row">Location: ${store.location}</div>` : ''}
    </div>
    <div class="bottom-row">
      <div>
        <div class="cta">Scan to Shop</div>
        <div class="cta-sub">Instant WhatsApp Storefront</div>
        <div class="footer">${qrUrl.replace('https://', '')}</div>
      </div>
      <div class="qr-col">
        <div class="qr-wrap">
          <img class="qr-img" src="${b64}" alt="QR Code" />
        </div>
      </div>
    </div>
  </div>
  <script>window.onload = () => { setTimeout(() => { window.print(); }, 600); }</script>
</body></html>`);
    win.document.close();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success('Store link copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '24px 28px',
          borderRadius: 20,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--text)' }}>
              My Store QR & Printable Flyer
            </h2>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'rgba(18, 140, 126, 0.12)', color: 'var(--primary)' }}>
              Pro Print-Ready
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0 }}>
            Display this QR flyer in your physical store, on packaging, or share digitally so shoppers can scan and checkout instantly.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTheme('luxe')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTheme === 'luxe' ? 'var(--surface)' : 'transparent',
              color: activeTheme === 'luxe' ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: activeTheme === 'luxe' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Luxe Dark
          </button>
          <button
            onClick={() => setActiveTheme('emerald')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTheme === 'emerald' ? 'var(--surface)' : 'transparent',
              color: activeTheme === 'emerald' ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: activeTheme === 'emerald' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Emerald
          </button>
          <button
            onClick={() => setActiveTheme('minimal')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTheme === 'minimal' ? 'var(--surface)' : 'transparent',
              color: activeTheme === 'minimal' ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: activeTheme === 'minimal' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Midnight
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 440px) 1fr', gap: 24, alignItems: 'start' }} className="responsive-share-grid">
        {/* ── Flyer Preview Card ── */}
        <div
          style={{
            background:
              activeTheme === 'emerald'
                ? 'linear-gradient(160deg, #064e3b 0%, #022c22 100%)'
                : activeTheme === 'minimal'
                ? 'linear-gradient(160deg, #0f172a 0%, #020617 100%)'
                : 'linear-gradient(160deg, #1a0830 0%, #0c0418 100%)',
            borderRadius: 24,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.38)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'background 0.3s ease',
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background:
                activeTheme === 'emerald'
                  ? 'linear-gradient(90deg, #059669, #34d399)'
                  : activeTheme === 'minimal'
                  ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                  : 'linear-gradient(90deg, #042A19, #0B5D39)',
            }}
          />

          {/* Background Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: activeTheme === 'emerald' ? 'rgba(16,185,129,0.14)' : 'rgba(139,33,240,0.15)',
              filter: 'blur(30px)',
            }}
          />

          {/* Header: logo + store name */}
          <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
            {store?.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={store.logo_url}
                alt={storeName}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                <Store size={26} />
              </div>
            )}
            <div>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em' }}>{storeName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={13} style={{ color: '#34d399' }} /> Verified Storefront
              </div>
            </div>
          </div>

          {/* Bio Excerpt */}
          {store?.store_bio && (
            <div style={{ zIndex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5 }}>
              {store.store_bio.length > 130 ? store.store_bio.slice(0, 130) + '…' : store.store_bio}
            </div>
          )}

          {/* Divider */}
          <div style={{ zIndex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />

          {/* Contact Details */}
          {(store?.whatsapp_phone || store?.location) && (
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {store?.whatsapp_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={13} color="#fff" />
                  </div>
                  {store.whatsapp_phone}
                </div>
              )}
              {store?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={13} color="#fff" />
                  </div>
                  {store.location}
                </div>
              )}
            </div>
          )}

          {/* Bottom Banner Row: CTA + QR Code */}
          <div style={{ zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 6, paddingTop: 14, borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                <Smartphone size={12} /> Scan to Shop
              </div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>Instant WhatsApp Storefront</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 }}>Powered by Frontstore</div>
            </div>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: 10,
                  borderRadius: 18,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative', width: 116, height: 116 }}>
                  <QRCodeSVG
                    id="merchant-qr-svg"
                    value={qrUrl}
                    size={116}
                    fgColor={activeTheme === 'emerald' ? '#064e3b' : '#1a0830'}
                    bgColor="#ffffff"
                    level="H"
                    style={{ display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: '#fff',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon.png" alt="Frontstore" style={{ width: 22, height: 22, borderRadius: 5, display: 'block' }} />
                  </div>
                </div>
              </div>
              <div style={{ color: activeTheme === 'emerald' ? '#34d399' : '#c084fc', fontSize: 11, fontWeight: 700 }}>
                {qrUrl.replace('https://', '')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions Hub Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Action Card */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, margin: '0 0 4px', color: 'var(--text)' }}>
                Download & Print Flyer
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Export a high-resolution 300 DPI image or send directly to your printer to display in your store.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={downloadFlyer}
                className="clickable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 16,
                  background:
                    activeTheme === 'emerald'
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : activeTheme === 'minimal'
                      ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'
                      : 'linear-gradient(135deg, #042A19 0%, #0B5D39 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow:
                    activeTheme === 'emerald'
                      ? '0 8px 24px rgba(16, 185, 129, 0.35)'
                      : activeTheme === 'minimal'
                      ? '0 8px 24px rgba(15, 23, 42, 0.35)'
                      : '0 8px 24px rgba(124, 58, 237, 0.35)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Download size={18} color="#fff" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800 }}>Download High-Res Flyer</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>300 DPI PNG • Ready for print</div>
                  </div>
                </div>
                <ArrowUpRight size={18} color="#fff" />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={handleCopyLink}
                  className="clickable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '13px 16px',
                    borderRadius: 14,
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: 13.5,
                    fontWeight: 700,
                  }}
                >
                  {copied ? <Check size={16} color="var(--primary)" /> : <Copy size={16} color="var(--text-muted)" />}
                  {copied ? 'Copied Link' : 'Copy Store Link'}
                </button>

                <button
                  onClick={printFlyer}
                  className="clickable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '13px 16px',
                    borderRadius: 14,
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: 13.5,
                    fontWeight: 700,
                  }}
                >
                  <Printer size={16} color="var(--text-muted)" />
                  Print Direct
                </button>
              </div>
            </div>

            {/* Store URL Bar */}
            <div
              style={{
                background: 'var(--bg-2)',
                padding: '14px 16px',
                borderRadius: 16,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Store URL
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--primary-dark)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {qrUrl}
                </div>
              </div>
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                Visit <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Usage Ideas Box */}
          <div
            className="card"
            style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(18, 140, 126, 0.05) 0%, rgba(37, 211, 102, 0.02) 100%)',
              border: '1px solid rgba(18, 140, 126, 0.2)',
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Sparkles size={15} color="var(--primary)" /> Where to display your QR flyer
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--primary)" /> Checkout Counter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--primary)" /> Product Packaging
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--primary)" /> Storefront Window
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--primary)" /> Receipts & Bags
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
