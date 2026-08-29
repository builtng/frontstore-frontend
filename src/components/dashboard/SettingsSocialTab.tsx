'use client';

import React from 'react';
import { toast } from 'sonner';
import {
  Zap, Globe, Loader2, Trash2, Link, Plus, ArrowUp, ArrowDown, Edit2,
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import {
  TikTokIcon, TwitterXIcon, FacebookIcon, YouTubeIcon,
  LinkedInIcon, PinterestIcon, SnapchatIcon, InstagramIcon,
} from '../SocialIcons';
import SearchableSelect from '../SearchableSelect';
import Toggle from '../Toggle';
import type { StoreInfo, StoreLink } from '@/types/dashboard';

interface SettingsSocialTabProps {
  isLegend: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
  legendMonthlyPrice: number;
  store: StoreInfo | null;
  settingsSaving: boolean;
  handleSettingsSave: (e: React.FormEvent) => void;

  customDomainSaving: boolean;
  handleRemoveCustomDomain: () => void;
  handleLinkCustomDomain: () => void;
  customDomainInput: string;
  setCustomDomainInput: (v: string) => void;
  customDomainBypassDNS: boolean;
  setCustomDomainBypassDNS: (v: boolean) => void;
  domainTargetCname: string;
  domainTargetIp: string;

  setInstagram: string;
  setSetInstagram: (v: string) => void;
  setTiktok: string;
  setSetTiktok: (v: string) => void;
  setTwitter: string;
  setSetTwitter: (v: string) => void;
  setFacebookPixelId: string;
  setSetFacebookPixelId: (v: string) => void;
  setGoogleTagManagerId: string;
  setSetGoogleTagManagerId: (v: string) => void;

  showLinkForm: boolean;
  setShowLinkForm: (v: boolean) => void;
  editingLinkId: string | null;
  setEditingLinkId: (v: string | null) => void;
  linkTitle: string;
  setLinkTitle: (v: string) => void;
  linkUrl: string;
  setLinkUrl: (v: string) => void;
  linkPlatform: string;
  setLinkPlatform: (v: string) => void;
  linkActive: boolean;
  setLinkActive: (v: boolean) => void;

  customLinks: StoreLink[];
  setCustomLinks: React.Dispatch<React.SetStateAction<StoreLink[]>>;
  moveLink: (index: number, direction: 'up' | 'down') => void;
  openConfirmationDialog: (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    confirmLabel?: string,
    cancelLabel?: string
  ) => void;

  logoUrl: string | null;
  setStoreName: string;
  setStoreBio: string;
  localWhatsapp: string;
}

export default function SettingsSocialTab({
  isLegend, openUpgradePrompt, legendMonthlyPrice, store, settingsSaving, handleSettingsSave,
  customDomainSaving, handleRemoveCustomDomain, handleLinkCustomDomain,
  customDomainInput, setCustomDomainInput, customDomainBypassDNS, setCustomDomainBypassDNS,
  domainTargetCname, domainTargetIp,
  setInstagram, setSetInstagram, setTiktok, setSetTiktok, setTwitter, setSetTwitter,
  setFacebookPixelId, setSetFacebookPixelId, setGoogleTagManagerId, setSetGoogleTagManagerId,
  showLinkForm, setShowLinkForm, editingLinkId, setEditingLinkId,
  linkTitle, setLinkTitle, linkUrl, setLinkUrl, linkPlatform, setLinkPlatform, linkActive, setLinkActive,
  customLinks, setCustomLinks, moveLink, openConfirmationDialog,
  logoUrl, setStoreName, setStoreBio, localWhatsapp,
}: SettingsSocialTabProps) {
  return (
    <>
      {/* ── CUSTOM DOMAIN CONFIGURATION CARD ── */}
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24, position: 'relative', overflow: 'hidden' }}>

        {/* Lock Overlay if not Legend */}
        {!isLegend && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(5px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', zIndex: 10, padding: 24
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: '#EDF7F2', color: '#0B5D39',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(11,93,57,0.15)', marginBottom: 12
            }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>Custom Domain Mapping</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, marginTop: 4, marginBottom: 16, lineHeight: 1.5 }}>
              Connect your own custom domain (e.g. <code>mybrand.com</code>) to personalize your store URL. Requires a Business subscription.
            </p>
            <button
              type="button"
              onClick={() => openUpgradePrompt(
                'Custom domain mapping requires Business',
                'Connect your own domain to your store when you are ready for a more branded storefront experience.'
              )}
              className="btn btn-primary clickable"
              style={{ padding: '8px 20px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13, background: '#0B5D39', borderColor: '#0B5D39' }}
            >
              Upgrade to Business (₦{legendMonthlyPrice.toLocaleString()}/mo)
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16,185,129,0.35)', flexShrink: 0
          }}>
            <Globe size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Custom Domain Mapping
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Connect your own custom domain (e.g. <code>mybrand.com</code>) to your Frontstore storefront with a simple DNS record — SSL is provisioned automatically.
            </p>
          </div>
        </div>

        {store?.custom_domain ? (
          // Linked Domain State
          <div style={{ background: 'var(--primary-light)', border: '1.5px solid var(--primary)', borderRadius: 'var(--r-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Custom Domain</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary-dark)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {store?.custom_domain}
                  {store?.domain_status === 'failed' ? (
                    <span style={{ fontSize: 11, background: 'var(--danger)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 800 }}>FAILED</span>
                  ) : store?.domain_status === 'active' ? (
                    <span style={{ fontSize: 11, background: '#25D366', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 800 }}>ACTIVE</span>
                  ) : (
                    <span style={{ fontSize: 11, background: '#D97706', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Loader2 size={10} className="spinner" /> PROVISIONING
                    </span>
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleRemoveCustomDomain}
                disabled={customDomainSaving}
                className="btn btn-outline clickable"
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {customDomainSaving ? <Loader2 size={14} className="spinner" /> : <Trash2 size={14} />}
                Disconnect Domain
              </button>
            </div>
            {store?.domain_status === 'failed' && store?.domain_error ? (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: 'var(--r-md)', padding: 12, fontSize: 12.5, color: 'var(--danger)', lineHeight: 1.5 }}>
                {store?.domain_error}
              </div>
            ) : store?.domain_status === 'pending' ? (
              <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: 12, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                ⏳ SSL certificate is being provisioned for your domain — this usually takes a few minutes. This page updates automatically.
              </div>
            ) : (
              <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: 12, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                ✨ Shoppers can now access your store directly at <a href={`https://${store?.custom_domain}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: 'var(--primary-dark)', textDecoration: 'underline' }}>https://{store?.custom_domain}</a>
              </div>
            )}
          </div>
        ) : (
          // Not Linked Domain State
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Enter your domain name
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={e => setCustomDomainInput(e.target.value)}
                    className="input-field"
                    placeholder="e.g. mybrand.com"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleLinkCustomDomain}
                    disabled={customDomainSaving || !customDomainInput}
                    className="btn btn-primary clickable"
                    style={{ padding: '0 20px', borderRadius: 'var(--r-md)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {customDomainSaving ? <Loader2 size={16} className="spinner" /> : <Link size={16} />}
                    Link Domain
                  </button>
                </div>

                {/* Bypass toggle — dev/testing only; backend also rejects this outside local/testing envs */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ marginTop: 12 }}>
                    <Toggle
                      id="bypass-dns-checkbox"
                      checked={customDomainBypassDNS}
                      onChange={setCustomDomainBypassDNS}
                      label={<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Simulate DNS check (local/testing)</span>}
                    />
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                  DNS Setup Instructions
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                  At your domain registrar (GoDaddy, Namecheap, etc.), add this record. Your existing email and other DNS records stay untouched.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(domainTargetCname || domainTargetIp) ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span style={{ width: 60 }}>Type</span>
                        <span style={{ flex: 1 }}>Value</span>
                      </div>
                      {domainTargetCname && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '6px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 12.5, fontFamily: 'monospace' }}>
                          <span style={{ width: 60, opacity: 0.7 }}>CNAME</span>
                          <span style={{ flex: 1 }}>{domainTargetCname}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(domainTargetCname);
                              toast.success(`Copied ${domainTargetCname}`);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                          >Copy</button>
                        </div>
                      )}
                      {domainTargetIp && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '6px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 12.5, fontFamily: 'monospace' }}>
                          <span style={{ width: 60, opacity: 0.7 }}>A</span>
                          <span style={{ flex: 1 }}>{domainTargetIp}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(domainTargetIp);
                              toast.success(`Copied ${domainTargetIp}`);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                          >Copy</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      DNS target hasn't been configured on this platform yet — contact support.
                    </p>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 12 }}>
                  {domainTargetCname && domainTargetIp
                    ? <>Using the domain's root (e.g. <code>mybrand.com</code> instead of <code>www</code>)? Use the <strong>A</strong> record above — a CNAME can't be set at the root. Using <code>www</code>? Use the <strong>CNAME</strong> record instead.</>
                    : <>Using the domain's root (e.g. <code>mybrand.com</code> instead of <code>www</code>)? Some registrars don't allow a CNAME at the root — use an ALIAS/ANAME record with the same value, or ask your registrar for CNAME flattening.</>
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CUSTOM LINKS / LINKTREE SECTION ── */}
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--r-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16,185,129,0.35)', flexShrink: 0
            }}>
              <Link size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900 }}>Store Linktree & Socials</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Add external links, websites, blogs, or chat channels that display as custom buttons on your storefront.
              </p>
            </div>
          </div>

          {!showLinkForm && (
            <button
              type="button"
              onClick={() => {
                setEditingLinkId(null);
                setLinkTitle('');
                setLinkUrl('');
                setLinkPlatform('custom');
                setLinkActive(true);
                setShowLinkForm(true);
              }}
              className="btn btn-primary clickable"
              style={{ padding: '10px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} /> Add Custom Link
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }} className="responsive-settings-grid">
          {/* Left Side: Editor list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Social Handles Inputs (merged from general settings) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, background: 'var(--bg-2)', padding: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginBottom: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Instagram Handle</label>
                <input
                  type="text"
                  value={setInstagram}
                  onChange={e => setSetInstagram(e.target.value)}
                  className="input-field"
                  placeholder="username"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>TikTok Handle</label>
                <input
                  type="text"
                  value={setTiktok}
                  onChange={e => setSetTiktok(e.target.value)}
                  className="input-field"
                  placeholder="username"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Twitter / X Handle</label>
                <input
                  type="text"
                  value={setTwitter}
                  onChange={e => setSetTwitter(e.target.value.replace(/^@+/, ''))}
                  className="input-field"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Tracking Pixels (Facebook Pixel + Google Tag Manager) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, background: 'var(--bg-2)', padding: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginBottom: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={setFacebookPixelId}
                  onChange={e => setSetFacebookPixelId(e.target.value.trim())}
                  className="input-field"
                  placeholder="e.g. 1234567890123456"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Google Tag Manager ID</label>
                <input
                  type="text"
                  value={setGoogleTagManagerId}
                  onChange={e => setSetGoogleTagManagerId(e.target.value.trim())}
                  className="input-field"
                  placeholder="e.g. GTM-XXXXXXX"
                />
              </div>
            </div>

            {/* Inline Form to Add/Edit Link */}
            {showLinkForm && (
              <div className="glass" style={{ padding: 20, borderRadius: 'var(--r-lg)', border: '1px solid var(--primary)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {editingLinkId ? 'Edit Link Details' : 'Add a New Store Link'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 12 }} className="responsive-settings-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>Platform / Icon</label>
                    <SearchableSelect
                      options={[
                        { value: 'custom', label: 'Website / Custom', icon: <Globe size={14} /> },
                        { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon size={14} style={{ color: 'var(--wa-green)' }} /> },
                        { value: 'instagram', label: 'Instagram', icon: <InstagramIcon size={14} style={{ color: '#e1306c' }} /> },
                        { value: 'tiktok', label: 'TikTok', icon: <TikTokIcon size={14} /> },
                        { value: 'twitter', label: 'Twitter / X', icon: <TwitterXIcon size={14} /> },
                        { value: 'facebook', label: 'Facebook', icon: <FacebookIcon size={14} style={{ color: '#1877f2' }} /> },
                        { value: 'youtube', label: 'YouTube', icon: <YouTubeIcon size={14} style={{ color: '#ff0000' }} /> },
                        { value: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon size={14} style={{ color: '#0a66c2' }} /> },
                        { value: 'pinterest', label: 'Pinterest', icon: <PinterestIcon size={14} style={{ color: '#e60023' }} /> },
                        { value: 'snapchat', label: 'Snapchat', icon: <SnapchatIcon size={14} style={{ color: '#fffc00' }} /> }
                      ]}
                      value={linkPlatform}
                      onChange={val => setLinkPlatform(val)}
                      placeholder="Select Icon"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>Button Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chat on Telegram, Visit my site"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: 14, height: 46 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>Destination URL *</label>
                  <input
                    type="text"
                    placeholder="e.g. https://mywebsite.com or t.me/mychannel"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: 14, height: 46 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <Toggle
                    checked={linkActive}
                    onChange={setLinkActive}
                    label={<span style={{ fontSize: 13, fontWeight: 700 }}>Show link on storefront</span>}
                  />

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowLinkForm(false)}
                      className="btn btn-outline clickable"
                      style={{ padding: '8px 14px', fontSize: 12.5, borderRadius: 'var(--r-md)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!linkTitle.trim() || !linkUrl.trim()) {
                          toast.warning('Please enter a link title and destination URL.');
                          return;
                        }
                        let formattedUrl = linkUrl.trim();
                        if (!/^https?:\/\//i.test(formattedUrl)) {
                          formattedUrl = 'https://' + formattedUrl;
                        }

                        const newLink: StoreLink = {
                          id: editingLinkId || Math.random().toString(36).substring(2, 9),
                          title: linkTitle.trim(),
                          url: formattedUrl,
                          platform: linkPlatform,
                          is_active: linkActive
                        };

                        if (editingLinkId) {
                          setCustomLinks(prev => prev.map(l => l.id === editingLinkId ? newLink : l));
                          toast.info('Link updated locally. Remember to save changes below!');
                        } else {
                          setCustomLinks(prev => [...prev, newLink]);
                          toast.success('Link added locally. Remember to save changes below!');
                        }
                        setShowLinkForm(false);
                      }}
                      className="btn btn-primary clickable"
                      style={{ padding: '8px 14px', fontSize: 12.5, borderRadius: 'var(--r-md)' }}
                    >
                      {editingLinkId ? 'Update' : 'Add Link'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of custom links */}
            {customLinks.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--bg-2)', borderRadius: 'var(--r-xl)', border: '1px dashed var(--border)' }}>
                <Link size={32} color="var(--text-faint)" style={{ marginBottom: 12, marginInline: 'auto' }} />
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>No custom links added yet</p>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, textAlign: 'center' }}>
                  Click "Add Custom Link" above to customize buttons like Linktree.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {customLinks.map((link, idx) => {
                  const IconComponent = () => {
                    switch (link.platform) {
                      case 'whatsapp': return <WhatsAppIcon size={14} style={{ color: 'var(--wa-green)' }} />;
                      case 'instagram': return <InstagramIcon size={14} style={{ color: '#e1306c' }} />;
                      case 'tiktok': return <TikTokIcon size={14} />;
                      case 'facebook': return <FacebookIcon size={14} style={{ color: '#1877f2' }} />;
                      case 'twitter': return <TwitterXIcon size={14} />;
                      case 'youtube': return <YouTubeIcon size={14} style={{ color: '#ff0000' }} />;
                      case 'linkedin': return <LinkedInIcon size={14} style={{ color: '#0a66c2' }} />;
                      case 'pinterest': return <PinterestIcon size={14} style={{ color: '#e60023' }} />;
                      case 'snapchat': return <SnapchatIcon size={14} style={{ color: '#fffc00' }} />;
                      default: return <Globe size={14} />;
                    }
                  };
                  return (
                    <div
                      key={link.id}
                      className="glass"
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--r-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        border: '1.5px solid var(--border)',
                        opacity: link.is_active ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        background: 'var(--surface)'
                      }}
                    >
                      {/* Sort, title, URL */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                        {/* Sort handlers */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveLink(idx, 'up')}
                            style={{ background: 'none', border: 'none', padding: 2, cursor: idx === 0 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', opacity: idx === 0 ? 0.3 : 1 }}
                            title="Move up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === customLinks.length - 1}
                            onClick={() => moveLink(idx, 'down')}
                            style={{ background: 'none', border: 'none', padding: 2, cursor: idx === customLinks.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', opacity: idx === customLinks.length - 1 ? 0.3 : 1 }}
                            title="Move down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        {/* Platform Icon Badge */}
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComponent />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</p>
                          <span style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', marginTop: 2 }}>
                            {link.url}
                          </span>
                        </div>
                      </div>

                      {/* Edit, status, delete buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Visibility Checkbox */}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomLinks(prev => prev.map((l, i) => i === idx ? { ...l, is_active: !l.is_active } : l));
                          }}
                          style={{
                            border: 'none',
                            background: link.is_active ? 'var(--primary-light)' : 'var(--bg-2)',
                            color: link.is_active ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: 'var(--r-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          {link.is_active ? 'Active' : 'Hidden'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLinkId(link.id);
                            setLinkTitle(link.title);
                            setLinkUrl(link.url);
                            setLinkPlatform(link.platform);
                            setLinkActive(link.is_active);
                            setShowLinkForm(true);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          title="Edit link"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            openConfirmationDialog(
                              'Remove link',
                              `Are you sure you want to remove "${link.title}"?`,
                              async () => {
                                setCustomLinks((prev) => prev.filter((l) => l.id !== link.id));
                                toast.info('Link deleted locally.');
                              },
                              'Remove',
                              'Cancel'
                            );
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                          title="Delete link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Smartphone Mockup Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }} className="desktop-only">
            <div style={{
              width: 250,
              height: 480,
              borderRadius: 36,
              border: '10px solid #1e293b',
              background: 'var(--bg)',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Notch */}
              <div style={{ width: 110, height: 18, background: '#1e293b', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', borderRadius: '0 0 12px 12px', zIndex: 10 }} />

              {/* Screen Scroll Container */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 14px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="no-scrollbar">

                {/* Avatar */}
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: logoUrl ? 'transparent' : 'var(--primary-light)', border: '2px solid var(--primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{(setStoreName || '').charAt(0).toUpperCase() || 'A'}</span>
                  )}
                </div>

                {/* Store Name & Bio */}
                <h4 style={{ fontSize: 13.5, fontWeight: 900, marginTop: 10, textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {setStoreName || 'My Store'}
                </h4>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, lineHeight: 1.4, maxHeight: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {setStoreBio || 'No store description yet.'}
                </p>

                {/* Hardcoded Social Icons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {localWhatsapp && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <WhatsAppIcon size={11} color="#fff" />
                    </div>
                  )}
                  {setInstagram && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e1306c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <InstagramIcon size={11} />
                    </div>
                  )}
                  {setTiktok && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <TikTokIcon size={11} />
                    </div>
                  )}
                  {setTwitter && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <TwitterXIcon size={11} />
                    </div>
                  )}
                </div>

                {/* Linktree style Custom Links Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 20 }}>
                  {customLinks.filter(l => l.is_active).map(link => (
                    <div
                      key={link.id}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        textAlign: 'center',
                        cursor: 'default',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        boxShadow: 'var(--shadow-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      {link.platform === 'whatsapp' && <WhatsAppIcon size={11} style={{ color: 'var(--wa-green)' }} />}
                      {link.platform === 'instagram' && <InstagramIcon size={11} style={{ color: '#e1306c' }} />}
                      {link.platform === 'tiktok' && <TikTokIcon size={11} />}
                      {link.platform === 'facebook' && <FacebookIcon size={11} style={{ color: '#1877f2' }} />}
                      {link.platform === 'twitter' && <TwitterXIcon size={11} />}
                      {link.platform === 'youtube' && <YouTubeIcon size={11} style={{ color: '#ff0000' }} />}
                      {link.platform === 'linkedin' && <LinkedInIcon size={11} style={{ color: '#0a66c2' }} />}
                      {link.platform === 'pinterest' && <PinterestIcon size={11} style={{ color: '#e60023' }} />}
                      {link.platform === 'snapchat' && <SnapchatIcon size={11} style={{ color: '#fffc00' }} />}
                      {link.platform === 'custom' && <Globe size={11} />}
                      <span>{link.title}</span>
                    </div>
                  ))}
                  {customLinks.filter(l => l.is_active).length === 0 && (
                    <p style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', marginTop: 12 }}>
                      Active links will display here in real time.
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Save Button Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleSettingsSave as any}
              disabled={settingsSaving}
              className="btn btn-primary clickable"
              style={{ padding: '13px 28px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {settingsSaving ? (
                <><Loader2 size={16} className="spinner" /> Saving...</>
              ) : (
                <><Link size={16} /> Save Social &amp; Linktree Settings</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
