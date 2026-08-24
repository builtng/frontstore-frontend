'use client';

import React from 'react';
import { toast } from 'sonner';
import { Palette, Zap, Package, Loader2, Sparkles, Image as ImageIcon, Check, Eye } from 'lucide-react';
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

  storefrontSections?: string[];
  setStorefrontSections?: React.Dispatch<React.SetStateAction<string[]>>;
  replyTimeMinutes?: number | '';
  setReplyTimeMinutes?: (v: number | '') => void;

  ninaChatQrEnabled: boolean;
  setNinaChatQrEnabled: (v: boolean) => void;

  featuredCarouselEnabled: boolean;
  setFeaturedCarouselEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  featuredProductIds: string[];
  toggleFeaturedProduct: (productId: string) => void;
}

const PRESET_PALETTES = [
  { name: 'Frontstore Green', value: '#25D366', tag: 'Default' },
  { name: 'Ocean Blue', value: '#0284c7', tag: 'Fresh' },
  { name: 'Royal Indigo', value: '#4f46e5', tag: 'Luxe' },
  { name: 'Sunset Amber', value: '#ea580c', tag: 'Vibrant' },
  { name: 'Midnight Charcoal', value: '#1f2937', tag: 'Sleek' },
  { name: 'Plum Violet', value: '#7c3aed', tag: 'Elegant' },
  { name: 'Rose Pink', value: '#db2777', tag: 'Chic' },
  { name: 'Emerald Forest', value: '#075E54', tag: 'Classic' }
];

export default function SettingsDesignTab({
  isPro, openUpgradePrompt, settingsSaving, handleSettingsSave, products,
  logoUrl, setLogoUrl, logoUploading, setLogoUploading,
  setBannerUrl, setSetBannerUrl, bannerUploading, setBannerUploading,
  primaryColor, setPrimaryColor,
  ninaChatQrEnabled, setNinaChatQrEnabled,
}: SettingsDesignTabProps) {
  const apiUrl = getApiUrl();

  return (
    <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Main Card Container */}
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                <span style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <Palette size={20} />
                </span>
                Brand &amp; Storefront Design
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, margin: '6px 0 0 0', lineHeight: 1.5 }}>
                Customize your store logo, header banner, primary brand colors, and AI shopping widget.
              </p>
            </div>
          </div>

          {/* ── STORE LOGO CARD ── */}
          <div style={{
            background: 'var(--bg-2)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Logo</label>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-faint)', background: 'var(--surface)', padding: '2px 8px', borderRadius: 12, border: '1px solid var(--border)' }}>Square format</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                Appears in your storefront header, checkout receipts, and social link previews.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            </div>
          </div>

          {/* ── STOREFRONT BRANDING & COLORS SECTION ── */}
          <div style={{
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 24,
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                🎨 Storefront Brand Colors
              </h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                Select a preset palette or enter a custom hex color. Your choice automatically themes all storefront buttons, active pills, badges, and checkout options.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'center' }}>
              
              {/* Controls Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Swatches */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Preset Color Palettes
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {PRESET_PALETTES.map(preset => {
                      const active = primaryColor.toLowerCase() === preset.value.toLowerCase();
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setPrimaryColor(preset.value)}
                          className="clickable"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 10px',
                            borderRadius: 'var(--r-md)',
                            border: active ? `2px solid ${preset.value}` : '1px solid var(--border)',
                            background: active ? `${preset.value}14` : 'var(--bg-2)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: preset.value,
                            flexShrink: 0,
                            boxShadow: active ? `0 0 0 2px #fff, 0 0 10px ${preset.value}80` : 'var(--shadow-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}>
                            {active && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5, fontWeight: active ? 800 : 600, color: 'var(--text)' }}>
                            {preset.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Picker Input */}
                <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Custom Hex Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      position: 'relative',
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--r-md)',
                      overflow: 'hidden',
                      border: '1.5px solid var(--border)',
                      boxShadow: `0 0 12px ${primaryColor}33`,
                      flexShrink: 0
                    }}>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        style={{
                          position: 'absolute',
                          inset: -6,
                          width: 56,
                          height: 56,
                          cursor: 'pointer',
                          border: 'none',
                          background: 'none'
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setPrimaryColor(val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          setPrimaryColor(`#${val}`);
                        }
                      }}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: 13.5, fontFamily: 'monospace', fontWeight: 700, height: 42 }}
                      placeholder="#25D366"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Live Preview Mockup */}
              <div style={{
                background: 'var(--bg-2)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 850, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Eye size={13} color="var(--primary)" /> Storefront Live Preview
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: primaryColor,
                    background: `${primaryColor}14`,
                    border: `1px solid ${primaryColor}29`,
                    padding: '2px 8px',
                    borderRadius: 12
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: primaryColor }} /> Online
                  </span>
                </div>

                {/* Simulated Store Header */}
                <div style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--border)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 13,
                      border: `1.5px solid ${primaryColor}40`,
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'S'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 850, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Your Storefront
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        Handcrafted products &amp; services
                      </div>
                    </div>
                  </div>

                  {/* Simulated Action Pills */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" style={{
                      background: primaryColor,
                      color: '#fff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 800,
                      boxShadow: `0 4px 12px ${primaryColor}3D`,
                      flex: 1
                    }}>
                      Buy Now
                    </button>
                    <span style={{
                      background: `${primaryColor}14`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}3D`,
                      padding: '7px 12px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      💬 Message on WhatsApp
                    </span>
                  </div>
                </div>

                {/* Simulated Customer Chat Bubble */}
                <div style={{
                  alignSelf: 'flex-end',
                  background: primaryColor,
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: '14px 14px 2px 14px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  maxWidth: '88%',
                  boxShadow: `0 4px 10px ${primaryColor}29`
                }}>
                  Hi! Is this item available for delivery today?
                </div>
              </div>

            </div>
          </div>

          {/* ── NINA AI STOREFRONT ASSISTANT CARD ── */}
          <div style={{
            position: 'relative',
            border: isPro ? '1.5px solid rgba(124, 58, 237, 0.25)' : '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 24,
            background: isPro
              ? 'linear-gradient(135deg, var(--surface) 0%, rgba(124, 58, 237, 0.03) 100%)'
              : 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxShadow: isPro ? '0 4px 20px rgba(124, 58, 237, 0.06)' : 'none',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, margin: 0 }}>
                      Nina AI Storefront Assistant
                    </h3>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 850,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: isPro ? 'rgba(124, 58, 237, 0.12)' : 'var(--bg-3)',
                      color: isPro ? '#7c3aed' : 'var(--text-muted)',
                      border: isPro ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid var(--border)'
                    }}>
                      {isPro ? 'PRO ACTIVE' : 'PRO FEATURE'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45, margin: '4px 0 0 0' }}>
                    Enable an automated floating AI sales assistant on your storefront to answer customer product questions and close orders 24/7.
                  </p>
                </div>
              </div>

              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <Toggle
                  checked={ninaChatQrEnabled && isPro}
                  onChange={(next) => {
                    if (!isPro) {
                      openUpgradePrompt(
                        'Nina AI Assistant requires Pro',
                        'Upgrade to Pro to enable the Nina AI chatbot widget on your storefront.'
                      );
                      return;
                    }
                    setNinaChatQrEnabled(next);
                  }}
                  label=""
                />
              </div>
            </div>

            {/* Live Widget Preview Card */}
            <div style={{
              background: 'var(--bg-2)',
              borderRadius: 'var(--r-lg)',
              padding: 14,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #25D366 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <img src="/ninaAssistant.png" alt="Nina AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)' }}>
                    "Hi! Ask me anything about our store items..."
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    Floating widget launches direct web chat &amp; WhatsApp QR code
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 750,
                color: ninaChatQrEnabled && isPro ? 'var(--primary)' : 'var(--text-faint)',
                background: ninaChatQrEnabled && isPro ? 'var(--primary-light)' : 'var(--surface)',
                padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                flexShrink: 0
              }}>
                {ninaChatQrEnabled && isPro ? '● Live on Store' : 'Offline'}
              </span>
            </div>

            {/* Upgrade Card for Free Tier */}
            {!isPro && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06) 0%, rgba(168, 85, 247, 0.08) 100%)',
                border: '1.5px dashed rgba(124, 58, 237, 0.3)',
                borderRadius: 'var(--r-lg)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14
              }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', fontSize: 13, fontWeight: 900 }}>
                    <Zap size={16} /> Nina AI Requires a Pro Plan
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Upgrade your store to unlock automated 24/7 AI customer assistance, WhatsApp sales triggers, and instant product answers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openUpgradePrompt(
                    'Nina AI Assistant requires Pro',
                    'Free stores cannot use the Nina AI Widget. Upgrade to Pro when you want to enable the AI sales assistant.'
                  )}
                  className="btn clickable"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 'var(--r-md)',
                    fontWeight: 850,
                    fontSize: 12,
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                    flexShrink: 0
                  }}
                >
                  Upgrade to Pro →
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Save Button Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 18 }}>
        <button
          type="submit"
          disabled={settingsSaving}
          className="btn btn-primary clickable"
          style={{
            padding: '14px 28px',
            borderRadius: 'var(--r-xl)',
            fontWeight: 850,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)'
          }}
        >
          {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving Design...</> : 'Save Design Changes'}
        </button>
      </div>
    </form>
  );
}
