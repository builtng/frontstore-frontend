'use client';

import React from 'react';
import {
  FileText, Megaphone, ShieldCheck, Truck, RotateCcw, Calendar, Loader2,
} from 'lucide-react';
import Toggle from '../Toggle';
import SearchableSelect from '../SearchableSelect';
import { countries } from '@/utils/phone';
import type { StoreInfo } from '@/types/dashboard';
import { STORE_BIO_MAX_LENGTH, cleanStoreBio } from '@/utils/storeBio';

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
  policyProducts: string;
  setPolicyProducts: (v: string) => void;
  policyBookings: string;
  setPolicyBookings: (v: string) => void;

  announcementTitle: string;
  setAnnouncementTitle: (v: string) => void;
  announcementCtaLabel: string;
  setAnnouncementCtaLabel: (v: string) => void;
  announcementBody: string;
  setAnnouncementBody: (v: string) => void;
  announcementCtaPage: string;
  setAnnouncementCtaPage: (v: string) => void;
}

export default function SettingsProfileTab({
  store, isPro, systemDomain, openUpgradePrompt, settingsSaving, handleSettingsSave,
  setStoreName, setSetStoreName, setStoreUsername, setSetStoreUsername,
  setStoreLocation, setSetStoreLocation,
  isOnlineOnly, setIsOnlineOnly, setStoreSince, setSetStoreSince, setStoreBio, setSetStoreBio,
  selectedCountry, localWhatsapp, isChangingWhatsapp, setIsChangingWhatsapp,
  whatsappOtpStage, setWhatsappOtpStage, newWhatsappDialCode, setNewWhatsappDialCode,
  newWhatsappLocal, setNewWhatsappLocal, whatsappOtpCode, setWhatsappOtpCode,
  whatsappOtpSending, whatsappOtpVerifying, handleSendWhatsappOtp, handleVerifyWhatsappOtp,
  setCurrency, setSetCurrency, metaCountries, setStoreCountryCode, setSetStoreCountryCode,
  countryDetectionFailed, availableProviders, setPaymentProvider, setSetPaymentProvider,
  deliveryInfo, setDeliveryInfo, returnPolicy, setReturnPolicy,
  policyProducts, setPolicyProducts, policyBookings, setPolicyBookings,
  announcementTitle, setAnnouncementTitle, announcementCtaLabel, setAnnouncementCtaLabel,
  announcementBody, setAnnouncementBody, announcementCtaPage, setAnnouncementCtaPage,
}: SettingsProfileTabProps) {
  const whatsappCooldownUntil = (!isPro && store?.whatsapp_phone_updated_at)
    ? new Date(new Date(store.whatsapp_phone_updated_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const whatsappOnCooldown = !!whatsappCooldownUntil && whatsappCooldownUntil.getTime() > Date.now();

  return (
    <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Card 1: Store Profile & Identity */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--primary)" /> Store Profile & Identity
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Configure your public details, bio, WhatsApp contact, currency, and location.
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
                  https://
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
                <span style={{ padding: '0 12px', fontSize: 13, fontWeight: 750, color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  .{systemDomain}
                </span>
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
              Shown on your storefront as "X yrs in business". Leave blank to hide it.
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Store Description (Bio)</label>
              <span style={{ fontSize: 11, fontWeight: 600, color: (setStoreBio || '').length >= STORE_BIO_MAX_LENGTH ? 'var(--primary)' : 'var(--text-faint)' }}>
                {(setStoreBio || '').length}/{STORE_BIO_MAX_LENGTH}
              </span>
            </div>
            <textarea
              rows={3}
              value={setStoreBio}
              maxLength={STORE_BIO_MAX_LENGTH}
              onChange={e => setSetStoreBio(e.target.value.slice(0, STORE_BIO_MAX_LENGTH))}
              onBlur={() => setSetStoreBio(cleanStoreBio(setStoreBio))}
              placeholder="Brief description of your shop (max 306 characters)..."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
              Brief intro for your storefront header and SEO. Maximum 306 characters.
            </span>
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
                        Upgrade to Pro to change it anytime.
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
                  ? "We couldn't detect your country automatically — please select it above."
                  : 'Determines available payment providers.'}
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
                Only providers enabled for your country are shown.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Store Policies & Guarantees */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="var(--primary)" /> Store Policies & Buyer Guarantees
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Set the terms customers see in your store policies modal and product pages.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="responsive-settings-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                  <Truck size={14} color="var(--primary)" /> Delivery &amp; Fulfillment Policy
                </label>
                <button
                  type="button"
                  onClick={() => setDeliveryInfo('Orders are dispatched within 24 hours of confirmation. Lagos deliveries arrive same-day or next-day. Nationwide deliveries arrive in 24–48 hours.')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset to default
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Displayed in the storefront policies modal and during checkout.</p>
              <textarea
                rows={3}
                value={deliveryInfo}
                onChange={e => setDeliveryInfo(e.target.value)}
                placeholder="Orders are dispatched within 24 hours of confirmation. Lagos deliveries arrive same-day or next-day. Nationwide deliveries arrive in 24–48 hours."
                className="input-field"
                style={{ resize: 'vertical' }}
                maxLength={500}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                  <RotateCcw size={14} color="var(--primary)" /> Return &amp; Refund Policy
                </label>
                <button
                  type="button"
                  onClick={() => setReturnPolicy('All online payments made through Frontstore are held under buyer protection until delivery confirmation.')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset to default
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Displayed on product pages and in the policies modal.</p>
              <textarea
                rows={3}
                value={returnPolicy}
                onChange={e => setReturnPolicy(e.target.value)}
                placeholder="All online payments made through Frontstore are held under buyer protection until delivery confirmation."
                className="input-field"
                style={{ resize: 'vertical' }}
                maxLength={500}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                  <ShieldCheck size={14} color="var(--primary)" /> 100% Authenticity Guarantee (Product Policy)
                </label>
                <button
                  type="button"
                  onClick={() => setPolicyProducts('We only sell 100% genuine and verified items. Inspect your order on delivery.')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset to default
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Displayed under buyer protection guarantees in the store policies modal.</p>
              <textarea
                rows={3}
                value={policyProducts}
                onChange={e => setPolicyProducts(e.target.value)}
                placeholder="We only sell 100% genuine and verified items. Inspect your order on delivery."
                className="input-field"
                style={{ resize: 'vertical' }}
                maxLength={500}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                  <Calendar size={14} color="var(--primary)" /> Service Booking &amp; Cancellation Policy
                </label>
                <button
                  type="button"
                  onClick={() => setPolicyBookings('Reschedule or cancel up to 24 hours before your appointment for a full refund.')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset to default
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>For stores offering bookable appointments and services.</p>
              <textarea
                rows={3}
                value={policyBookings}
                onChange={e => setPolicyBookings(e.target.value)}
                placeholder="Reschedule or cancel up to 24 hours before your appointment for a full refund."
                className="input-field"
                style={{ resize: 'vertical' }}
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Announcement Banner */}
        <div style={{
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: 20,
          background: 'var(--bg-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} color="var(--primary)" /> Store Announcement Banner <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'none' }}>(Optional)</span>
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
              Displays a prominent header alert on your public storefront. <strong>Leave blank to disable the banner on your store.</strong>
            </p>
          </div>

          <div className="responsive-form-row">
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Title</label>
              <input
                type="text"
                value={announcementTitle}
                onChange={e => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. Weekend Flash Sale"
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
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button
          type="submit"
          disabled={settingsSaving}
          className="btn btn-primary clickable"
          style={{ padding: '14px 28px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
        >
          {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
}
