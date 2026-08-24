'use client';

import React from 'react';
import { toast } from 'sonner';
import { QrCode, CheckCircle2, Zap, Phone, MapPin, Download, Copy, Printer } from 'lucide-react';
import QRCodeSVG from 'react-qr-code';
import type { StoreInfo } from '@/types/dashboard';

interface QrTabProps {
  isPro: boolean;
  store: StoreInfo | null;
  systemDomain: string;
  openUpgradePrompt: (title: string, description: string) => void;
}

export default function QrTab({ isPro, store, systemDomain, openUpgradePrompt }: QrTabProps) {
  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(98, 16, 159, 0.12)', color: 'var(--primary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <QrCode size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>My QR Code</h2>
        <p style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Print-Ready Store QR</p>
        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Get a branded, downloadable QR flyer for your store so customers can scan and shop instantly — perfect for packaging, receipts, and signage.
        </p>

        <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Printable, branded store QR flyer</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Instant scan-to-shop for customers</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>High-res downloads for print</span>
          </div>
        </div>

        <button
          onClick={() => openUpgradePrompt(
            'My QR Code requires Pro',
            'Downloadable, print-ready store QR flyers are available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock QR Code
        </button>
      </div>
    );
  }

  const qrUrl = store?.custom_domain
    ? `https://${store.custom_domain}`
    : `https://${systemDomain}/${store?.username}`;
  const storeName = store?.store_name || store?.username || 'My Store';

  // ── Download full flyer as PNG ──────────────────────────────────────
  const downloadFlyer = async () => {
    const svg = document.getElementById('merchant-qr-svg');
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const W = 900, H = 1200, M = 64;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    grad.addColorStop(0, '#1a0830');
    grad.addColorStop(1, '#0c0418');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative orbs
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#8b21f0';
    ctx.beginPath(); ctx.arc(W * 0.88, H * 0.1, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.08, H * 0.82, 160, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Top accent bar
    const barGrad = ctx.createLinearGradient(0, 0, W, 0);
    barGrad.addColorStop(0, '#62109F');
    barGrad.addColorStop(1, '#9b30f0');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, W, 8);

    // ── Header: logo + store name, left-aligned ──
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
    ctx.font = 'bold 52px Arial, sans-serif';
    const nameText = storeName.length > 20 ? storeName.slice(0, 20) + '…' : storeName;
    ctx.fillText(nameText, nameX, M + headerSz / 2 + 18);
    let yOffset = M + Math.max(headerSz, 70) + 44;

    // ── Bio — wrapped to max 3 lines, left-aligned ──
    if (store?.store_bio) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '30px Arial, sans-serif';
      const maxWidth = W - M * 2;
      const words = store.store_bio.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
          if (lines.length === 2) break;
        } else {
          line = test;
        }
      }
      if (line && lines.length < 3) lines.push(line);
      lines.forEach((l, i) => ctx.fillText(l, M, yOffset + i * 42));
      yOffset += lines.length * 42 + 20;
    }

    // ── Divider ──
    yOffset += 24;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(M, yOffset); ctx.lineTo(W - M, yOffset); ctx.stroke();
    yOffset += 50;

    // ── Contact rows ──
    ctx.font = '30px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    if (store?.whatsapp_phone) {
      ctx.fillText(`📞  ${store.whatsapp_phone}`, M, yOffset);
      yOffset += 52;
    }
    if (store?.location) {
      ctx.fillText(`📍  ${store.location}`, M, yOffset);
      yOffset += 52;
    }

    // ── QR code, bottom-right, beneath the merchant info ──
    const qrImg = new Image();
    await new Promise<void>(res => { qrImg.onload = () => res(); qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(serialized))); });

    const qrSize = 220, qrPad = 20;
    const qrBoxSize = qrSize + qrPad * 2;
    const qrBoxX = W - M - qrBoxSize;
    const qrBoxY = H - M - qrBoxSize - 56;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22); ctx.fill();
    ctx.drawImage(qrImg, qrBoxX + qrPad, qrBoxY + qrPad, qrSize, qrSize);

    const appLogo = new Image();
    await new Promise<void>(res => { appLogo.onload = () => res(); appLogo.onerror = () => res(); appLogo.src = '/icon.png'; });
    if (appLogo.naturalWidth > 0) {
      const lSz = 48;
      const lX = qrBoxX + qrPad + (qrSize - lSz) / 2;
      const lY = qrBoxY + qrPad + (qrSize - lSz) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.roundRect(lX - 6, lY - 6, lSz + 12, lSz + 12, 12); ctx.fill();
      ctx.drawImage(appLogo, lX, lY, lSz, lSz);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#c084fc';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText(qrUrl.replace('https://', ''), qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 34);

    // ── CTA + footer, bottom-left, level with the QR block ──
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('📱 Scan to Shop', M, qrBoxY + 40);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('on WhatsApp', M, qrBoxY + 76);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('Powered by Frontstore', M, H - M);

    const link = document.createElement('a');
    link.download = `${store?.username ?? 'store'}-flyer.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ── Print flyer ────────────────────────────────────────────────────
  const printFlyer = () => {
    const svg = document.getElementById('merchant-qr-svg');
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const b64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(serialized)));
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><title>${storeName} — Store Flyer</title>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
  @page { size: auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
  html, body { width: 100%; height: 100%; }
  body { font-family: Inter, Arial, sans-serif; background: #128C7E; }
  .flyer { width: 100vw; height: 100vh; background: linear-gradient(160deg, #128C7E 0%, #075E52 100%); padding: 8vh 7vw; display: flex; flex-direction: column; justify-content: space-between; gap: 40px; position: relative; overflow: hidden; }
  .flyer::before { content: ''; position: absolute; top: -15vh; right: -15vh; width: 45vh; height: 45vh; border-radius: 50%; background: rgba(37,211,102,0.22); }
  .flyer::after { content: ''; position: absolute; bottom: -12vh; left: -12vh; width: 35vh; height: 35vh; border-radius: 50%; background: rgba(100,255,218,0.14); }
  .accent { position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, #0A192F, #25D366); }
  .header { display: flex; align-items: center; gap: 24px; z-index: 1; }
  .store-logo { width: 96px; height: 96px; border-radius: 22px; object-fit: cover; flex-shrink: 0; }
  .store-name { color: #fff; font-size: 44px; font-weight: 900; letter-spacing: -0.5px; }
  .store-bio { color: rgba(255,255,255,0.7); font-size: 18px; line-height: 1.6; z-index: 1; max-width: 65%; }
  .divider { height: 1px; background: rgba(255,255,255,0.12); z-index: 1; }
  .contacts { display: flex; flex-direction: column; gap: 12px; z-index: 1; }
  .contact-row { color: rgba(255,255,255,0.8); font-size: 20px; font-weight: 600; }
  .bottom-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; z-index: 1; }
  .cta { color: #fff; font-size: 26px; font-weight: 700; }
  .cta-sub { color: rgba(255,255,255,0.65); font-size: 16px; margin-top: 4px; }
  .footer { color: rgba(255,255,255,0.45); font-size: 13px; margin-top: 18px; }
  .qr-col { display: flex; flex-direction: column; align-items: center; gap: 12px; flex-shrink: 0; }
  .qr-wrap { background: #fff; padding: 22px; border-radius: 24px; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
  .qr-img { width: 220px; height: 220px; display: block; }
  .qr-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 52px; height: 52px; border-radius: 12px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.18); object-fit: contain; }
  .url { color: #64FFDA; font-size: 16px; font-weight: 600; }
  @media print { .flyer { width: 100%; height: 100%; } }
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
      ${store?.whatsapp_phone ? `<div class="contact-row">📞 ${store.whatsapp_phone}</div>` : ''}
      ${store?.location ? `<div class="contact-row">📍 ${store.location}</div>` : ''}
    </div>
    <div class="bottom-row">
      <div>
        <div class="cta">📱 Scan to Shop on WhatsApp</div>
        <div class="cta-sub">Powered by Frontstore</div>
        <div class="footer">frontstore.ng</div>
      </div>
      <div class="qr-col">
        <div class="qr-wrap">
          <img class="qr-img" src="${b64}" alt="QR Code" />
          <img class="qr-logo" src="/icon.png" alt="Frontstore" />
        </div>
        <div class="url">${qrUrl.replace('https://', '')}</div>
      </div>
    </div>
  </div>
  <script>window.onload = () => { setTimeout(() => { window.print(); }, 600); }<\/script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900 }}>My QR Code</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
          Download or print this flyer and display it in your physical store so customers can scan to shop online.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, alignItems: 'start' }} className="responsive-share-grid">
        {/* ── Flyer Preview Card ── */}
        <div style={{
          background: 'linear-gradient(160deg, #1a0830 0%, #0c0418 100%)',
          borderRadius: 24,
          padding: 28,
          display: 'flex', flexDirection: 'column', gap: 16,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: 'linear-gradient(90deg,#62109F,#9b30f0)', borderRadius: '24px 24px 0 0' }} />
          {/* BG orbs */}
          <div style={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'rgba(139,33,240,0.15)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(139,33,240,0.08)' }} />

          {/* Header: logo + store name, left-aligned */}
          <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
            {store?.logo_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={store.logo_url} alt={storeName} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', flexShrink: 0, border: '2px solid rgba(255,255,255,0.15)' }} />
            )}
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 19, letterSpacing: -0.3 }}>{storeName}</div>
          </div>

          {/* Bio */}
          {store?.store_bio && (
            <div style={{ zIndex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
              {store.store_bio.length > 140 ? store.store_bio.slice(0, 140) + '…' : store.store_bio}
            </div>
          )}

          {/* Divider */}
          <div style={{ zIndex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />

          {/* Contact rows */}
          {(store?.whatsapp_phone || store?.location) && (
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {store?.whatsapp_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>
                  <Phone size={14} color="rgba(255,255,255,0.5)" /> {store.whatsapp_phone}
                </div>
              )}
              {store?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>
                  <MapPin size={14} color="rgba(255,255,255,0.5)" /> {store.location}
                </div>
              )}
            </div>
          )}

          {/* Bottom row: CTA left, QR bottom-right beneath the info above */}
          <div style={{ zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>📱 Scan to Shop</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 1 }}>on WhatsApp</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5, marginTop: 10 }}>Powered by Frontstore</div>
            </div>

            {/* QR Code — smaller, anchored bottom-right */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                background: '#fff',
                padding: 10,
                borderRadius: 16,
                boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
                position: 'relative',
              }}>
                <div style={{ position: 'relative', width: 110, height: 110 }}>
                  <QRCodeSVG
                    id="merchant-qr-svg"
                    value={qrUrl}
                    size={110}
                    fgColor="#1a0830"
                    bgColor="#ffffff"
                    level="H"
                    style={{ display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 26, height: 26,
                    borderRadius: 7,
                    background: '#fff',
                    boxShadow: '0 2px 14px rgba(0,0,0,0.22)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon.png" alt="Frontstore" style={{ width: 22, height: 22, borderRadius: 5, display: 'block' }} />
                  </div>
                </div>
              </div>
              <div style={{ color: '#c084fc', fontSize: 10.5, fontWeight: 600 }}>{qrUrl.replace('https://', '')}</div>
            </div>
          </div>
        </div>

        {/* ── Actions panel ── */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Share your store</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
              Download the flyer as an image, copy your store link, or print it directly to hang up in your physical store.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={downloadFlyer}
              className="clickable"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 14,
                background: 'linear-gradient(135deg,#62109F,#9b30f0)',
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(98,16,159,0.4)',
              }}
            >
              <Download size={18} color="#fff" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Download Flyer</span>
            </button>

            <button
              onClick={() => { navigator.clipboard.writeText(qrUrl); toast.success('Store link copied!'); }}
              className="clickable"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--surface-2)', border: '1.5px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <Copy size={18} color="var(--text)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>Copy Link</span>
            </button>

            <button
              onClick={printFlyer}
              className="clickable"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--surface-2)', border: '1.5px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <Printer size={18} color="var(--text)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>Print Flyer</span>
            </button>
          </div>

          <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Store URL</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginTop: 4, wordBreak: 'break-all' }}>
              {qrUrl.replace('https://', '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
