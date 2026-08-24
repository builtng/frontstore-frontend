'use client';

import React from 'react';
import {
  FileText, MapPin, Megaphone, PenLine, Briefcase, Loader2,
} from 'lucide-react';
import Toggle from '../Toggle';
import SearchableSelect from '../SearchableSelect';
import { countries } from '@/utils/phone';
import { businessPersonas } from '@/utils/businessPersonas';
import type { StoreInfo } from '@/types/dashboard';

const businessPersonaOptions = businessPersonas.map(persona => ({
  value: persona.id,
  label: persona.name,
  sublabel: `${persona.persona} · ${persona.templateName} · ${persona.summary}`,
}));

const normalizeUsernameInput = (value: string) => (
  value
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40)
);

interface SettingsProfileTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  systemDomain: string;
  openUpgradePrompt: (title: string, description: string) => void;
  settingsSaving: boolean;
  handleSettingsSave: (e: React.FormEvent) => void;

  setStoreName: string;
  setSetStoreName: (v: string) => void;
  setStoreUsername: string;
  setSetStoreUsername: (v: string) => void;
  setStoreLocation: string;
  setSetStoreLocation: (v: string) => void;
  detectedMerchantLocation: string | null;
  isOnlineOnly: boolean;
  setIsOnlineOnly: (v: boolean) => void;
  setStoreSince: string;
  setSetStoreSince: (v: string) => void;
  setStoreBio: string;
  setSetStoreBio: (v: string) => void;

  selectedCountry: { code: string; name: string; dialCode: string; flag: string };
  localWhatsapp: string;
  isChangingWhatsapp: boolean;
  setIsChangingWhatsapp: (v: boolean) => void;
  whatsappOtpStage: 'entry' | 'otp';
  setWhatsappOtpStage: (v: 'entry' | 'otp') => void;
  newWhatsappDialCode: string;
  setNewWhatsappDialCode: (v: string) => void;
  newWhatsappLocal: string;
  setNewWhatsappLocal: (v: string) => void;
  whatsappOtpCode: string;
  setWhatsappOtpCode: (v: string) => void;
  whatsappOtpSending: boolean;
  whatsappOtpVerifying: boolean;
  handleSendWhatsappOtp: () => void;
  handleVerifyWhatsappOtp: () => void;

  setCurrency: string;
  setSetCurrency: (v: string) => void;
  metaCountries: Array<{ code: string; name: string; default_currency: string }>;
  setStoreCountryCode: string;
  setSetStoreCountryCode: (v: string) => void;
  countryDetectionFailed: boolean;
  availableProviders: string[];
  setPaymentProvider: string;
  setSetPaymentProvider: (v: string) => void;

  deliveryInfo: string;
  setDeliveryInfo: (v: string) => void;
  returnPolicy: string;
  setReturnPolicy: (v: string) => void;

  announcementTitle: string;
  setAnnouncementTitle: (v: string) => void;
  announcementCtaLabel: string;
  setAnnouncementCtaLabel: (v: string) => void;
  announcementBody: string;
  setAnnouncementBody: (v: string) => void;
  announcementCtaPage: string;
  setAnnouncementCtaPage: (v: string) => void;

  selectedPersona: string;
  applyPersonaPreset: (personaId: string) => void;
  catalogLabel: string;
  setCatalogLabel: (v: string) => void;
  categoryLabel: string;
  setCategoryLabel: (v: string) => void;
  storeLabel: string;
  setStoreLabel: (v: string) => void;
  templateHighlightLabel: string;
  setTemplateHighlightLabel: (v: string) => void;
  productSectionEyebrow: string;
  setProductSectionEyebrow: (v: string) => void;
  productSectionTitle: string;
  setProductSectionTitle: (v: string) => void;

  reviewsIntroText: string;
  setReviewsIntroText: (v: string) => void;
  faqHelpText: string;
  setFaqHelpText: (v: string) => void;
  aboutIntroText: string;
  setAboutIntroText: (v: string) => void;
  policyBookings: string;
  setPolicyBookings: (v: string) => void;
  policyProducts: string;
  setPolicyProducts: (v: string) => void;
  policyRefunds: string;
  setPolicyRefunds: (v: string) => void;
}

export default function SettingsProfileTab({
  store, isPro, systemDomain, openUpgradePrompt, settingsSaving, handleSettingsSave,
  setStoreName, setSetStoreName, setStoreUsername, setSetStoreUsername,
  setStoreLocation, setSetStoreLocation, detectedMerchantLocation,
  isOnlineOnly, setIsOnlineOnly, setStoreSince, setSetStoreSince, setStoreBio, setSetStoreBio,
  selectedCountry, localWhatsapp, isChangingWhatsapp, setIsChangingWhatsapp,
  whatsappOtpStage, setWhatsappOtpStage, newWhatsappDialCode, setNewWhatsappDialCode,
  newWhatsappLocal, setNewWhatsappLocal, whatsappOtpCode, setWhatsappOtpCode,
  whatsappOtpSending, whatsappOtpVerifying, handleSendWhatsappOtp, handleVerifyWhatsappOtp,
  setCurrency, setSetCurrency, metaCountries, setStoreCountryCode, setSetStoreCountryCode,
  countryDetectionFailed, availableProviders, setPaymentProvider, setSetPaymentProvider,
  deliveryInfo, setDeliveryInfo, returnPolicy, setReturnPolicy,
  announcementTitle, setAnnouncementTitle, announcementCtaLabel, setAnnouncementCtaLabel,
  announcementBody, setAnnouncementBody, announcementCtaPage, setAnnouncementCtaPage,
  selectedPersona, applyPersonaPreset,
  catalogLabel, setCatalogLabel, categoryLabel, setCategoryLabel, storeLabel, setStoreLabel,
  templateHighlightLabel, setTemplateHighlightLabel,
  productSectionEyebrow, setProductSectionEyebrow, productSectionTitle, setProductSectionTitle,
  reviewsIntroText, setReviewsIntroText, faqHelpText, setFaqHelpText,
  aboutIntroText, setAboutIntroText, portfolioIntroText, setPortfolioIntroText,
  policyBookings, setPolicyBookings, policyProducts, setPolicyProducts,
  policyRefunds, setPolicyRefunds,
}: SettingsProfileTabProps) {
  const whatsappCooldownUntil = (!isPro && store?.whatsapp_phone_updated_at)
    ? new Date(new Date(store.whatsapp_phone_updated_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const whatsappOnCooldown = !!whatsappCooldownUntil && whatsappCooldownUntil.getTime() > Date.now();

  return (
    <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Left Column Card: Store Details & Info */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--primary)" /> Store Profile & Info
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Configure your public details, bio, WhatsApp contact, currency, and policies.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Name</label>
            <input
              type="text"
              required
              value={setStoreName}
              onChange={e => setSetStoreName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="responsive-form-row">
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                Store URL Username
                {!isPro && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)', textTransform: 'none' }}>Pro</span>
                )}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', background: isPro ? 'var(--surface)' : 'var(--bg-2)', overflow: 'hidden', opacity: isPro ? 1 : 0.75 }}>
                <span style={{ padding: '0 12px', fontSize: 13, fontWeight: 750, color: 'var(--text-muted)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {systemDomain}/
                </span>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={40}
                  value={setStoreUsername}
                  onChange={e => setSetStoreUsername(normalizeUsernameInput(e.target.value))}
                  placeholder="my-store"
                  disabled={!isPro}
                  readOnly={!isPro}
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '13px 14px', background: 'transparent', color: isPro ? 'var(--text)' : 'var(--text-muted)', fontSize: 14.5, fontWeight: 700, cursor: isPro ? 'text' : 'not-allowed' }}
                />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                {isPro
                  ? 'This controls your public store link. Use letters, numbers, and hyphens.'
                  : 'Free plan usernames are locked after setup. '}
                {!isPro && (
                  <button
                    type="button"
                    onClick={() => openUpgradePrompt(
                      'Changing your username requires Pro',
                      'Upgrade to Pro to change your store URL username at any time. Usernames stay unique across all merchants.'
                    )}
                    style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Upgrade to Pro to change it
                  </button>
                )}
              </span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Location</label>
              <input
                type="text"
                value={setStoreLocation}
                onChange={e => setSetStoreLocation(e.target.value)}
                className="input-field"
                placeholder="e.g. Lekki, Lagos"
                maxLength={120}
                disabled={isOnlineOnly}
              />
              {detectedMerchantLocation && detectedMerchantLocation !== setStoreLocation && !isOnlineOnly && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
                  <MapPin size={12} style={{ flexShrink: 0 }} />
                  Detected near {detectedMerchantLocation} —{' '}
                  <button
                    type="button"
                    onClick={() => setSetStoreLocation(detectedMerchantLocation)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}
                  >
                    use this
                  </button>
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--card-hover)' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800 }}>This is an online-only store</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>No physical address or pickup location — hides "Visit us" from your storefront</div>
                </div>
                <Toggle
                  checked={isOnlineOnly}
                  onChange={val => setIsOnlineOnly(val)}
                  id="online-only-toggle"
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Established Since (Year)</label>
            <input
              type="number"
              value={setStoreSince}
              onChange={e => setSetStoreSince(e.target.value)}
              className="input-field"
              placeholder="e.g. 2019"
              min={1900}
              max={new Date().getFullYear()}
            />
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
              Shown on your storefront as "X yrs in practice". Leave blank to hide it.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Description (Bio)</label>
            <textarea
              rows={3}
              value={setStoreBio}
              onChange={e => setSetStoreBio(e.target.value)}
              placeholder="Brief description of your shop..."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="responsive-form-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>WhatsApp Number</label>
                {!isChangingWhatsapp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingWhatsapp(true);
                      setWhatsappOtpStage('entry');
                      setNewWhatsappDialCode(selectedCountry.dialCode);
                      setNewWhatsappLocal('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', padding: 0 }}
                  >
                    Change number
                  </button>
                )}
              </div>

              {/* Current number — read-only, changed only via the verified flow below */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-2)',
                padding: '13px 14px',
              }}>
                <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                <span style={{ fontSize: 15, color: 'var(--text)' }}>{selectedCountry.dialCode} {localWhatsapp || '—'}</span>
              </div>

              {isChangingWhatsapp && (
                <div style={{
                  marginTop: 10,
                  padding: 14,
                  borderRadius: 'var(--r-md)',
                  border: '1.5px dashed var(--border)',
                  background: 'var(--bg-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  {whatsappOnCooldown ? (
                    <>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                        You can change your WhatsApp number again on{' '}
                        <strong style={{ color: 'var(--text)' }}>{whatsappCooldownUntil!.toLocaleDateString()}</strong>.
                        Upgrade to Pro to change it anytime, with no waiting period.
                      </p>
                      <button type="button" onClick={() => setIsChangingWhatsapp(false)} className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12.5, padding: '8px 14px' }}>
                        Cancel
                      </button>
                    </>
                  ) : whatsappOtpStage === 'entry' ? (
                    <>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                        We'll text a verification code to the new number before it replaces your current one.
                        {!isPro && ' Free stores can do this once every 30 days.'}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ width: 130 }}>
                          <SearchableSelect
                            options={countries.map(c => ({ value: c.dialCode, label: `${c.flag} ${c.dialCode}` }))}
                            value={newWhatsappDialCode}
                            onChange={setNewWhatsappDialCode}
                            placeholder="Code"
                          />
                        </div>
                        <input
                          type="tel"
                          placeholder="e.g. 803 123 4567"
                          value={newWhatsappLocal}
                          onChange={e => setNewWhatsappLocal(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                          autoComplete="tel"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={handleSendWhatsappOtp} disabled={whatsappOtpSending} className="btn btn-primary" style={{ fontSize: 12.5, padding: '8px 14px' }}>
                          {whatsappOtpSending ? 'Sending…' : 'Send verification code'}
                        </button>
                        <button type="button" onClick={() => setIsChangingWhatsapp(false)} className="btn btn-ghost" style={{ fontSize: 12.5, padding: '8px 14px' }}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                        Enter the 6-digit code sent to {newWhatsappDialCode} {newWhatsappLocal}.
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={whatsappOtpCode}
                        onChange={e => setWhatsappOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="input-field"
                        style={{ maxWidth: 160, letterSpacing: 4, textAlign: 'center', fontWeight: 700 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={handleVerifyWhatsappOtp} disabled={whatsappOtpVerifying} className="btn btn-primary" style={{ fontSize: 12.5, padding: '8px 14px' }}>
                          {whatsappOtpVerifying ? 'Verifying…' : 'Verify & update'}
                        </button>
                        <button type="button" onClick={() => setWhatsappOtpStage('entry')} className="btn btn-ghost" style={{ fontSize: 12.5, padding: '8px 14px' }}>
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Currency</label>
              <SearchableSelect
                options={[
                  { value: 'NGN', label: 'NGN (₦)', icon: <span style={{ fontSize: 16 }}>🇳🇬</span> },
                  { value: 'GHS', label: 'GHS (₵)', icon: <span style={{ fontSize: 16 }}>🇬🇭</span> },
                  { value: 'KES', label: 'KES (KSh)', icon: <span style={{ fontSize: 16 }}>🇰🇪</span> },
                  { value: 'ZAR', label: 'ZAR (R)', icon: <span style={{ fontSize: 16 }}>🇿🇦</span> },
                  { value: 'USD', label: 'USD ($)', icon: <span style={{ fontSize: 16 }}>🇺🇸</span> },
                  { value: 'GBP', label: 'GBP (£)', icon: <span style={{ fontSize: 16 }}>🇬🇧</span> }
                ]}
                value={setCurrency}
                onChange={val => setSetCurrency(val)}
                placeholder="Select Currency"
              />
            </div>
          </div>

          <div className="responsive-form-row">
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Country</label>
              <SearchableSelect
                options={metaCountries.map(c => ({ value: c.code, label: c.name }))}
                value={setStoreCountryCode}
                onChange={val => setSetStoreCountryCode(val)}
                placeholder="Select Country"
                disabled={!!store?.country_code}
              />
              <span style={{ fontSize: 11, color: countryDetectionFailed && !store?.country_code ? 'var(--warning, #b45309)' : 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                {store?.country_code
                  ? 'Locked once set. Contact support to change your store country.'
                  : countryDetectionFailed
                  ? "We couldn't detect your country automatically — please select it below."
                  : 'Determines which payment providers you can accept below.'}
              </span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Payment Provider</label>
              <SearchableSelect
                options={Array.from(new Set(availableProviders)).map(p => ({
                  value: p,
                  label: p === 'paystack' ? 'Paystack' : p === 'flutterwave' ? 'Flutterwave' : p === 'stripe' ? 'Stripe' : p,
                }))}
                value={setPaymentProvider}
                onChange={val => setSetPaymentProvider(val)}
                placeholder="Select Payment Provider"
              />
              <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                Only providers enabled for your country are shown. Contact support if you need another option.
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 4 }}>Delivery Info</label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Shown on every product page under "Delivery &amp; returns". Leave blank to use the default.</p>
            <textarea
              rows={2}
              value={deliveryInfo}
              onChange={e => setDeliveryInfo(e.target.value)}
              placeholder="e.g. Delivery in 1–3 business days. Local rates apply, nationwide shipping available at checkout."
              className="input-field"
              style={{ resize: 'vertical' }}
              maxLength={300}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 4 }}>Return Policy</label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Shown on every product page under "Delivery &amp; returns". Leave blank to use the default.</p>
            <textarea
              rows={2}
              value={returnPolicy}
              onChange={e => setReturnPolicy(e.target.value)}
              placeholder="e.g. Return unopened, unused items within 7 days. Secured by Frontstore."
              className="input-field"
              style={{ resize: 'vertical' }}
              maxLength={300}
            />
          </div>

          {/* ── Announcement Banner ── */}
          <div style={{
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 18,
            background: 'var(--bg-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Megaphone size={16} color="var(--primary)" /> Announcement Banner
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
                Shows a dismissible banner at the top of your storefront. Leave the title and message blank to hide it.
              </p>
            </div>

            <div className="responsive-form-row">
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Sale ends Sunday"
                  className="input-field"
                  maxLength={255}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Button Label (optional)</label>
                <input
                  type="text"
                  value={announcementCtaLabel}
                  onChange={e => setAnnouncementCtaLabel(e.target.value)}
                  placeholder="e.g. Shop now"
                  className="input-field"
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Message</label>
              <textarea
                rows={2}
                value={announcementBody}
                onChange={e => setAnnouncementBody(e.target.value)}
                placeholder="e.g. 20% off all products this weekend only. Free delivery on orders over ₦20,000."
                className="input-field"
                style={{ resize: 'vertical' }}
                maxLength={300}
              />
            </div>

            {announcementCtaLabel && (
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Button Links To</label>
                <input
                  type="text"
                  value={announcementCtaPage}
                  onChange={e => setAnnouncementCtaPage(e.target.value)}
                  placeholder="e.g. shop, services, contact"
                  className="input-field"
                  maxLength={100}
                />
                <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                  The storefront section your button opens, e.g. "shop", "services", or "contact".
                </span>
              </div>
            )}
          </div>

          {/* ── Storefront Writing (moved here from right column) ── */}
          <div style={{
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: 18,
            background: 'var(--bg-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 4
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PenLine size={16} color="var(--primary)" /> Storefront Writing
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
                Control the words customers see on your public storefront. Free stores always show the active template name.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8 }}>Business Persona</label>
              {isPro ? (
                <>
                  <SearchableSelect
                    options={businessPersonaOptions}
                    value={selectedPersona}
                    onChange={applyPersonaPreset}
                    placeholder="Select your business category"
                    searchPlaceholder="Search category..."
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 6 }}>
                    Changing this switches your storefront's template and default copy. Save settings to publish it.
                  </span>
                </>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    opacity: 0.85,
                  }}>
                    <Briefcase size={20} color="var(--primary)" />
                    <div>
                      <strong style={{ display: 'block', fontSize: 14, color: 'var(--text)' }}>
                        {businessPersonas.find(p => p.id === selectedPersona)?.name || 'Custom / Unassigned'}
                      </strong>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {businessPersonas.find(p => p.id === selectedPersona)?.summary || 'Custom storefront setup'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block', marginTop: 6 }}>
                    Upgrade to Pro to change your business category and storefront template.
                  </span>
                </>
              )}
            </div>

            <div className="responsive-form-row">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Count Label</label>
                <input
                  type="text"
                  value={catalogLabel}
                  onChange={e => setCatalogLabel(e.target.value)}
                  className="input-field"
                  placeholder="product"
                  maxLength={80}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Category Count Label</label>
                <input
                  type="text"
                  value={categoryLabel}
                  onChange={e => setCategoryLabel(e.target.value)}
                  className="input-field"
                  placeholder="collection"
                  maxLength={80}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>What Customers Call Your Business</label>
              <input
                type="text"
                value={storeLabel}
                onChange={e => setStoreLabel(e.target.value)}
                className="input-field"
                placeholder="store"
                maxLength={40}
              />
              <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                Used across your storefront, e.g. &ldquo;Visit the {storeLabel || 'store'}&rdquo;, &ldquo;Follow the {storeLabel || 'store'}&rdquo;. Try "studio", "salon", "shop", or leave as "store".
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Template Highlight Text</label>
              <input
                type="text"
                value={templateHighlightLabel}
                onChange={e => setTemplateHighlightLabel(e.target.value)}
                className="input-field"
                placeholder="High-conversion drops and promos"
                maxLength={120}
                disabled={!isPro}
              />
              {!isPro && (
                <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                  Free stores show the active template name here.
                </span>
              )}
            </div>

            <div className="responsive-form-row">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Catalog Eyebrow</label>
                <input
                  type="text"
                  value={productSectionEyebrow}
                  onChange={e => setProductSectionEyebrow(e.target.value)}
                  className="input-field"
                  placeholder="Catalog"
                  maxLength={80}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Catalog Section Title</label>
                <input
                  type="text"
                  value={productSectionTitle}
                  onChange={e => setProductSectionTitle(e.target.value)}
                  className="input-field"
                  placeholder="Limited offers"
                  maxLength={120}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Custom Storefront Write-ups & Policies</h4>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Reviews Section Notice</label>
                <textarea
                  rows={2}
                  value={reviewsIntroText}
                  onChange={e => setReviewsIntroText(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Reviews come from verified orders. Add your order reference so we can confirm it."
                  maxLength={1000}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>FAQ Help Card Text</label>
                <textarea
                  rows={2}
                  value={faqHelpText}
                  onChange={e => setFaqHelpText(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Message the studio directly and we will get back to you."
                  maxLength={1000}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>About Section Description</label>
                <textarea
                  rows={4}
                  value={aboutIntroText}
                  onChange={e => setAboutIntroText(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. What began in 2018 with one van and one cleaner is now a vetted team..."
                  maxLength={2000}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Portfolio Section Subtitle</label>
                <textarea
                  rows={2}
                  value={portfolioIntroText}
                  onChange={e => setPortfolioIntroText(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Before and after from real jobs, from kitchens and bathrooms to offices..."
                  maxLength={1000}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Bookings Policy</label>
                <textarea
                  rows={3}
                  value={policyBookings}
                  onChange={e => setPolicyBookings(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Reschedule or cancel up to 24 hours before your clean for a full refund..."
                  maxLength={2000}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Products Policy</label>
                <textarea
                  rows={3}
                  value={policyProducts}
                  onChange={e => setPolicyProducts(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Unopened products can be returned within 7 days of delivery..."
                  maxLength={2000}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Refunds Policy</label>
                <textarea
                  rows={3}
                  value={policyRefunds}
                  onChange={e => setPolicyRefunds(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g. Orders paid through Frontstore are refunded to your original payment method..."
                  maxLength={2000}
                />
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
