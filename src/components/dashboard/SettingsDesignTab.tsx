'use client';

import React from 'react';
import { toast } from 'sonner';
import { Palette, Zap, Package, Loader2 } from 'lucide-react';
import FileUpload from '../FileUpload';
import Toggle from '../Toggle';
import { getApiUrl } from '@/lib/api';
import type { Product } from '@/types/dashboard';

interface SettingsDesignTabProps {
  isPro: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
  settingsSaving: boolean;
  handleSettingsSave: (e: React.FormEvent) => void;
  products: Product[];

  logoUrl: string | null;
  setLogoUrl: (v: string | null) => void;
  logoUploading: boolean;
  setLogoUploading: (v: boolean) => void;

  setBannerUrl: string;
  setSetBannerUrl: (v: string) => void;
  bannerUploading: boolean;
  setBannerUploading: (v: boolean) => void;

  primaryColor: string;
  setPrimaryColor: (v: string) => void;

  storefrontSections: string[];
  setStorefrontSections: React.Dispatch<React.SetStateAction<string[]>>;
  replyTimeMinutes: number | '';
  setReplyTimeMinutes: (v: number | '') => void;

  ninaChatQrEnabled: boolean;
  setNinaChatQrEnabled: (v: boolean) => void;

  featuredCarouselEnabled: boolean;
  setFeaturedCarouselEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  featuredCarouselEyebrow: string;
  setFeaturedCarouselEyebrow: (v: string) => void;
  featuredCarouselTitle: string;
  setFeaturedCarouselTitle: (v: string) => void;
  featuredProductIds: string[];
  toggleFeaturedProduct: (productId: string) => void;
}

export default function SettingsDesignTab({
  isPro, openUpgradePrompt, settingsSaving, handleSettingsSave, products,
  logoUrl, setLogoUrl, logoUploading, setLogoUploading,
  setBannerUrl, setSetBannerUrl, bannerUploading, setBannerUploading,
  primaryColor, setPrimaryColor,
  storefrontSections, setStorefrontSections, replyTimeMinutes, setReplyTimeMinutes,
  ninaChatQrEnabled, setNinaChatQrEnabled,
  featuredCarouselEnabled, setFeaturedCarouselEnabled, featuredCarouselEyebrow, setFeaturedCarouselEyebrow,
  featuredCarouselTitle, setFeaturedCarouselTitle, featuredProductIds, toggleFeaturedProduct,
}: SettingsDesignTabProps) {
  const apiUrl = getApiUrl();

  return (
    <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Right Column Card: Design & Customization */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color="var(--primary)" /> Brand & Storefront Design
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Customize your store theme, logo, banner, writing style, and visible sections.
          </p>

          {/* ── Logo Upload ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'flex-start' }}>Store Logo</label>
            <FileUpload
              variant="avatar"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              previewUrl={logoUrl}
              uploading={logoUploading}
              onRemove={() => setLogoUrl(null)}
              inputId="logo-upload-input"
              maxSize={5 * 1024 * 1024}
              onFile={async (file) => {
                try {
                  setLogoUploading(true);
                  const formData = new FormData();
                  formData.append('logo', file);
                  const res = await fetch(`${apiUrl}/v1/store/upload-logo`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                  });
                  const json = await res.json();
                  if (res.ok && json.url) {
                    setLogoUrl(json.url);
                    toast.success('Logo uploaded! 🎨');
                  } else {
                    throw new Error(json.message || 'Upload failed');
                  }
                } catch (err: any) {
                  toast.error(err.message || 'Logo upload error');
                } finally {
                  setLogoUploading(false);
                }
              }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>Click or drop to upload a logo<br />(JPG, PNG, WEBP · max 5MB)</p>
          </div>

          {/* ── Banner Upload ── */}
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Banner Image</label>
            <FileUpload
              variant="default"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              label="Drop banner image here or click to upload"
              hint="JPG, PNG, WEBP · max 5MB · Recommended 1200×400"
              previewUrl={setBannerUrl || undefined}
              uploading={bannerUploading}
              onRemove={() => setSetBannerUrl('')}
              inputId="banner-upload-input"
              maxSize={5 * 1024 * 1024}
              onFile={async (file) => {
                try {
                  setBannerUploading(true);
                  const formData = new FormData();
                  formData.append('banner', file);
                  const res = await fetch(`${apiUrl}/v1/store/upload-banner`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                  });
                  const json = await res.json();
                  if (res.ok && json.url) {
                    setSetBannerUrl(json.url);
                    toast.success('Banner uploaded! 🖼️');
                  } else {
                    throw new Error(json.message || 'Upload failed');
                  }
                } catch (err: any) {
                  toast.error(err.message || 'Banner upload error');
                } finally {
                  setBannerUploading(false);
                }
              }}
            />
            <div style={{ marginTop: 10 }}>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 5 }}>Or paste an image URL</label>
              <input
                type="url"
                value={setBannerUrl}
                onChange={e => setSetBannerUrl(e.target.value)}
                className="input-field"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
              Optional. Leave blank to use the storefront theme gradient.
            </span>
          </div>

          {/* Storefront Branding & Colors */}
          <div style={{
            position: 'relative',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 20,
            background: 'var(--bg-2)',
            overflow: 'hidden'
          }}>
            {/* Lock Overlay if Free */}
            {!isPro && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', zIndex: 10, padding: 16
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#fef3c7', color: '#d97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(217,119,6,0.12)', marginBottom: 8
                }}>
                  <Zap size={18} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Custom Storefront Colors</h4>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 280, marginTop: 4, marginBottom: 12, lineHeight: 1.4 }}>
                  Choose a custom theme color for your storefront. Requires a Pro subscription.
                </p>
                <button
                  type="button"
                  onClick={() => openUpgradePrompt(
                    'Custom storefront colors require Pro',
                    'Free stores use the default brand color. Upgrade to Pro when you want custom theme colors across your storefront.'
                  )}
                  className="btn btn-primary clickable"
                  style={{ padding: '6px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12 }}
                >
                  Upgrade to Pro
                </button>
              </div>
            )}

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎨 Storefront Branding & Colors
              {!isPro && (
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>Pro</span>
              )}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
              Customize the primary color of your storefront buttons, highlights, and icons.
            </p>

            {/* Preset Palettes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8 }}>Preset Color Palettes</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { name: 'Frontstore', value: '#25D366' },
                  { name: 'Ocean', value: '#0284c7' },
                  { name: 'Royal', value: '#4f46e5' },
                  { name: 'Sunset', value: '#ea580c' },
                  { name: 'Midnight', value: '#1f2937' },
                  { name: 'Plum', value: '#7c3aed' },
                  { name: 'Rose', value: '#db2777' }
                ].map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setPrimaryColor(preset.value)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: preset.value,
                      border: primaryColor === preset.value ? '3px solid var(--text)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      boxShadow: primaryColor === preset.value ? '0 0 0 2px var(--surface), var(--shadow-sm)' : 'var(--shadow-sm)',
                      transition: 'transform var(--t-fast)',
                      transform: primaryColor === preset.value ? 'scale(1.1)' : 'scale(1)'
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }} className="responsive-settings-grid">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8 }}>Custom Primary Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    style={{
                      border: 'none',
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      background: 'none',
                      padding: 0
                    }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => {
                      const val = e.target.value;
                      if (val.startsWith('#') && val.length <= 7) {
                        setPrimaryColor(val);
                      }
                    }}
                    className="input-field"
                    style={{ padding: '8px 10px', fontSize: 13, height: 38, fontFamily: 'monospace' }}
                    placeholder="#25D366"
                  />
                </div>
              </div>

              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Preview</span>
                <button type="button" style={{
                  background: primaryColor,
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 12,
                  fontWeight: 750,
                  textAlign: 'center',
                  boxShadow: `0 4px 10px ${primaryColor}2A`
                }}>
                  Buy Now
                </button>
                <div style={{
                  alignSelf: 'flex-end',
                  background: primaryColor,
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '12px 12px 0 12px',
                  fontSize: 11,
                  maxWidth: '85%',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  Hi! Can I order this item?
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Section Display */}
          <div style={{
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 18,
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0 }}>Storefront Navigation & Display</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
                Select which tabs and features are enabled on your storefront. Disabled sections will be completely hidden.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { id: 'products', label: 'Products / Catalog' },
                { id: 'services', label: 'Services' },
                { id: 'portfolio', label: 'Portfolio / Gallery' },
                { id: 'reviews', label: 'Customer Reviews' },
                { id: 'blog', label: 'Blog Posts' },
                { id: 'about', label: 'About Page' },
                { id: 'faq', label: 'FAQ Page' },
                { id: 'contact', label: 'Contact Details' },
                { id: 'replies_approximation', label: 'Replies Approximation' },
              ].map(sec => {
                const isEnabled = storefrontSections.includes(sec.id);
                return (
                  <Toggle
                    key={sec.id}
                    checked={isEnabled}
                    onChange={(next) => {
                      if (!next) {
                        setStorefrontSections(prev => prev.filter(x => x !== sec.id));
                      } else {
                        setStorefrontSections(prev => [...prev, sec.id]);
                      }
                    }}
                    label={<span style={{ fontSize: 13 }}>{sec.label}</span>}
                  />
                );
              })}
            </div>

            {storefrontSections.includes('replies_approximation') && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Average Reply Time (minutes)
                </label>
                <input
                  type="number"
                  value={replyTimeMinutes}
                  onChange={e => {
                    const val = e.target.value;
                    setReplyTimeMinutes(val === '' ? '' : Math.max(0, parseInt(val)));
                  }}
                  className="input-field"
                  placeholder="e.g. 10 (Leave blank or 0 to hide)"
                  style={{ maxWidth: 200 }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                  Show customers how fast you typically respond. Hidden if left blank.
                </span>
              </div>
            )}
          </div>

          {/* Nina AI Floating QR Code & Live Chat Widget */}
          <div style={{
            position: 'relative',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 18,
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {!isPro && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', zIndex: 10, padding: 16,
                borderRadius: 'inherit'
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(124, 58, 237, 0.12)', marginBottom: 8
                }}>
                  <Zap size={18} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Nina AI Requires Pro</h4>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 280, marginTop: 4, marginBottom: 12, lineHeight: 1.4 }}>
                  Upgrade to the Pro plan to add an AI sales assistant to your storefront and answer customer questions instantly.
                </p>
                <button
                  type="button"
                  onClick={() => openUpgradePrompt(
                    'Nina AI chat requires Pro',
                    'Free stores cannot use the Nina AI Widget. Upgrade to Pro when you want to enable the AI sales assistant.'
                  )}
                  className="btn btn-primary clickable"
                  style={{ padding: '6px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12 }}
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0 }}>Nina AI Floating Widget</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
                  Enable a floating chat launcher on your storefront. Customers can scan a QR code to chat on WhatsApp or start a live web chat directly with your Nina AI sales assistant.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Toggle
                  checked={ninaChatQrEnabled}
                  onChange={(next) => setNinaChatQrEnabled(next)}
                  label=""
                />
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: 'var(--bg-2)',
              borderRadius: 'var(--r-md)',
              padding: '10px 14px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                This widget is <strong>off by default</strong>. When enabled, customer queries on your public store will be handled autonomously by your configured sales assistant.
              </span>
            </div>
          </div>

          {/* Storefront Writing — moved to left column */}

          {/* Top Products Carousel */}
          <div style={{
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 18,
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0 }}>Top Products Carousel</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
                  Show a polished carousel at the top of the store. Select up to 5 products.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeaturedCarouselEnabled(v => !v)}
                className={featuredCarouselEnabled ? 'btn btn-primary clickable' : 'btn btn-outline clickable'}
                style={{ flexShrink: 0, padding: '8px 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 850 }}
              >
                {featuredCarouselEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="responsive-form-row">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Carousel Eyebrow</label>
                <input
                  type="text"
                  value={featuredCarouselEyebrow}
                  onChange={e => setFeaturedCarouselEyebrow(e.target.value)}
                  className="input-field"
                  placeholder="Featured now"
                  maxLength={80}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Carousel Title</label>
                <input
                  type="text"
                  value={featuredCarouselTitle}
                  onChange={e => setFeaturedCarouselTitle(e.target.value)}
                  className="input-field"
                  placeholder="Fresh picks from the catalog"
                  maxLength={120}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Featured Products</label>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 750 }}>{featuredProductIds.length}/5 selected</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {products.slice(0, 20).map(product => {
                  const active = featuredProductIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleFeaturedProduct(product.id)}
                      className="clickable"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '42px minmax(0, 1fr)',
                        gap: 10,
                        alignItems: 'center',
                        textAlign: 'left',
                        padding: 10,
                        borderRadius: 'var(--r-md)',
                        border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: active ? 'var(--primary-light)' : 'var(--surface)',
                        color: 'var(--text)',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.image_urls?.[0]
                          ? <img src={product.image_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={18} color="var(--text-faint)" />
                        }
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</strong>
                        <span style={{ fontSize: 11, color: active ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800 }}>{active ? 'Featured' : 'Tap to feature'}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button
          type="submit"
          disabled={settingsSaving}
          className="btn btn-primary clickable"
          style={{ padding: '14px 28px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
        >
          {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : 'Save Configuration Changes'}
        </button>
      </div>
    </form>
  );
}
