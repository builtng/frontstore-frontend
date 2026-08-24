'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Palette, Link, DollarSign, Key } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { countries, parsePhoneNumber } from '@/utils/phone';
import { businessPersonas } from '@/utils/businessPersonas';
import type { StoreInfo, UserInfo, StoreLink, Product } from '@/types/dashboard';
import SettingsProfileTab from './SettingsProfileTab';
import SettingsDesignTab from './SettingsDesignTab';
import SettingsSocialTab from './SettingsSocialTab';
import SettingsPaymentTab from './SettingsPaymentTab';
import SettingsSecurityTab from './SettingsSecurityTab';

const authHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

interface SettingsTabProps {
  store: StoreInfo | null;
  setStore: React.Dispatch<React.SetStateAction<StoreInfo | null>>;
  user: UserInfo | null;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  token: string | null;
  isPro: boolean;
  isLegend: boolean;
  systemDomain: string;
  domainTargetCname: string;
  domainTargetIp: string;
  openUpgradePrompt: (title: string, description: string) => void;
  openConfirmationDialog: (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    confirmLabel?: string,
    cancelLabel?: string
  ) => void;
  legendMonthlyPrice: number;
  products: Product[];
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;
  selectedPersona: string;
  setSelectedPersona: (v: string) => void;
}

export default function SettingsTab({
  store, setStore, user, setUser, token, isPro, isLegend,
  systemDomain, domainTargetCname, domainTargetIp,
  openUpgradePrompt, openConfirmationDialog, legendMonthlyPrice, products,
  primaryColor, setPrimaryColor, selectedTemplate, setSelectedTemplate,
  selectedPersona, setSelectedPersona,
}: SettingsTabProps) {
  const apiUrl = getApiUrl();

  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'design' | 'social' | 'payment' | 'security'>('profile');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Profile
  const [setStoreUsername, setSetStoreUsername] = useState('');
  const [setStoreName, setSetStoreName] = useState('');
  const [setStoreBio, setSetStoreBio] = useState('');
  const [setStoreLocation, setSetStoreLocation] = useState('');
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);
  const [setStoreSince, setSetStoreSince] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [reviewsIntroText, setReviewsIntroText] = useState('');
  const [faqHelpText, setFaqHelpText] = useState('');
  const [aboutIntroText, setAboutIntroText] = useState('');
  const [policyBookings, setPolicyBookings] = useState('');
  const [policyProducts, setPolicyProducts] = useState('');
  const [policyRefunds, setPolicyRefunds] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementCtaLabel, setAnnouncementCtaLabel] = useState('');
  const [announcementCtaPage, setAnnouncementCtaPage] = useState('');
  const [setBannerUrl, setSetBannerUrl] = useState('');
  const [localWhatsapp, setLocalWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isChangingWhatsapp, setIsChangingWhatsapp] = useState(false);
  const [whatsappOtpStage, setWhatsappOtpStage] = useState<'entry' | 'otp'>('entry');
  const [newWhatsappDialCode, setNewWhatsappDialCode] = useState(countries[0].dialCode);
  const [newWhatsappLocal, setNewWhatsappLocal] = useState('');
  const [whatsappOtpCode, setWhatsappOtpCode] = useState('');
  const [whatsappOtpSending, setWhatsappOtpSending] = useState(false);
  const [whatsappOtpVerifying, setWhatsappOtpVerifying] = useState(false);
  const [setInstagram, setSetInstagram] = useState('');
  const [setTiktok, setSetTiktok] = useState('');
  const [setTwitter, setSetTwitter] = useState('');
  const [setFacebook, setSetFacebook] = useState('');
  const [setLinkedin, setSetLinkedin] = useState('');
  const [setFacebookPixelId, setSetFacebookPixelId] = useState('');
  const [setGoogleTagManagerId, setSetGoogleTagManagerId] = useState('');
  const [setCurrency, setSetCurrency] = useState('NGN');
  const [setStoreCountryCode, setSetStoreCountryCode] = useState('');
  const [setPaymentProvider, setSetPaymentProvider] = useState('');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [metaCountries, setMetaCountries] = useState<Array<{ code: string; name: string; default_currency: string }>>([]);
  const [detectedMerchantLocation, setDetectedMerchantLocation] = useState<string | null>(null);
  const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(null);
  const [detectedCurrencyCode, setDetectedCurrencyCode] = useState<string | null>(null);
  const [geoDetectionDone, setGeoDetectionDone] = useState(false);
  const [countryDetectionFailed, setCountryDetectionFailed] = useState(false);
  const autoDetectAppliedRef = useRef(false);

  // Design
  const [customLinks, setCustomLinks] = useState<StoreLink[]>([]);
  const [storefrontSections, setStorefrontSections] = useState<string[]>(['reviews', 'replies_approximation', 'products', 'services', 'about', 'faq', 'contact', 'blog']);
  const [replyTimeMinutes, setReplyTimeMinutes] = useState<number | ''>('');
  const [ninaChatQrEnabled, setNinaChatQrEnabled] = useState(false);
  const [catalogLabel, setCatalogLabel] = useState('product');
  const [categoryLabel, setCategoryLabel] = useState('collection');
  const [storeLabel, setStoreLabel] = useState('store');
  const [templateHighlightLabel, setTemplateHighlightLabel] = useState('');
  const [productSectionEyebrow, setProductSectionEyebrow] = useState('Catalog');
  const [productSectionTitle, setProductSectionTitle] = useState('');
  const [featuredCarouselEnabled, setFeaturedCarouselEnabled] = useState(true);
  const [featuredCarouselEyebrow, setFeaturedCarouselEyebrow] = useState('Featured now');
  const [featuredCarouselTitle, setFeaturedCarouselTitle] = useState('Fresh picks from the catalog');
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);

  // Social — custom links form + custom domain
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPlatform, setLinkPlatform] = useState('custom');
  const [linkActive, setLinkActive] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [customDomainSaving, setCustomDomainSaving] = useState(false);
  const [customDomainBypassDNS, setCustomDomainBypassDNS] = useState(false);

  // Payment
  const [paymentBankName, setPaymentBankName] = useState('');
  const [paymentBankCode, setPaymentBankCode] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [paymentAccountName, setPaymentAccountName] = useState(''); // read-only after verify
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [momoAgentNumber, setMomoAgentNumber] = useState('');
  const [momoAgentName, setMomoAgentName] = useState('');
  const [momoAgentNetwork, setMomoAgentNetwork] = useState('mtn');
  const [momoAgentEnabled, setMomoAgentEnabled] = useState(false);
  const [shippingType, setShippingType] = useState('customer_pays');
  const [shippingFlatFee, setShippingFlatFee] = useState('');
  const [shippingFreeThreshold, setShippingFreeThreshold] = useState('');
  const [shippingHandlingFee, setShippingHandlingFee] = useState('');
  const [shippingCustomRules, setShippingCustomRules] = useState<{ min_subtotal: string; fee: string }[]>([]);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [accountVerified, setAccountVerified] = useState(false);
  const [nameMatchOk, setNameMatchOk] = useState<boolean | null>(null);
  const [isGeneratingDedicatedAccount, setIsGeneratingDedicatedAccount] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isLoadingStripeDashboard, setIsLoadingStripeDashboard] = useState(false);

  // Security
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpSaving, setCpSaving] = useState(false);
  const [showCpCurrent, setShowCpCurrent] = useState(false);
  const [showCpNew, setShowCpNew] = useState(false);
  const [showCpConfirm, setShowCpConfirm] = useState(false);

  // Re-derive every settings-tab-owned field from `store` whenever it changes
  // (mirrors the population that used to run inline in page.tsx's mount effect
  // and loadAllData — primaryColor/selectedTemplate/selectedPersona stay there
  // since the Templates tab also needs them).
  useEffect(() => {
    if (!store) return;
    setSetStoreUsername(store.username || '');
    setSetStoreName(store.store_name || '');
    setSetStoreBio(store.store_bio || '');
    setSetStoreLocation(store.location || '');
    setIsOnlineOnly(!!store.is_online_only);
    setSetStoreSince(store.since || '');
    setDeliveryInfo(store.delivery_info || '');
    setShippingType(store.shipping_type || 'customer_pays');
    setShippingFlatFee(store.shipping_flat_fee != null ? String(store.shipping_flat_fee) : '');
    setShippingFreeThreshold(store.shipping_free_threshold != null ? String(store.shipping_free_threshold) : '');
    setShippingHandlingFee(store.shipping_handling_fee != null ? String(store.shipping_handling_fee) : '');
    setShippingCustomRules(
      Array.isArray(store.shipping_custom_rules)
        ? store.shipping_custom_rules.map((r: any) => ({ min_subtotal: String(r.min_subtotal ?? ''), fee: String(r.fee ?? '') }))
        : []
    );
    setReturnPolicy(store.return_policy || '');
    setReviewsIntroText(store.reviews_intro_text || '');
    setFaqHelpText(store.faq_help_text || '');
    setAboutIntroText(store.about_intro_text || '');
    setPolicyBookings(store.policy_bookings || '');
    setPolicyProducts(store.policy_products || '');
    setPolicyRefunds(store.policy_refunds || '');
    setAnnouncementTitle(store.announcement_title || '');
    setAnnouncementBody(store.announcement_body || '');
    setAnnouncementCtaLabel(store.announcement_cta_label || '');
    setAnnouncementCtaPage(store.announcement_cta_page || '');
    setSetBannerUrl(store.banner_url || '');
    const parsedPhone = parsePhoneNumber(store.whatsapp_phone || '');
    setSelectedCountry(parsedPhone.country);
    setLocalWhatsapp(parsedPhone.local);
    setSetInstagram(store.instagram_handle || '');
    setSetTiktok(store.tiktok_handle || '');
    setSetTwitter(store.twitter_handle || '');
    setSetFacebook(store.facebook_handle || '');
    setSetLinkedin(store.linkedin_handle || '');
    setSetFacebookPixelId(store.facebook_pixel_id || '');
    setSetGoogleTagManagerId(store.google_tag_manager_id || '');
    setSetCurrency(store.currency_code || 'NGN');
    setSetStoreCountryCode(store.country_code || '');
    setSetPaymentProvider(store.payment_provider || '');
    setAvailableProviders(store.available_payment_providers || []);
    setPaymentBankName(store.bank_name || '');
    setPaymentBankCode(store.paystack_bank_code || '');
    setPaymentAccountNumber(store.bank_account_number || '');
    setPaymentAccountName(store.bank_account_name || '');
    setPaymentInstructions(store.payment_instructions || '');
    setMomoAgentNumber(store.momo_agent_number || '');
    setMomoAgentName(store.momo_agent_name || '');
    setMomoAgentNetwork(store.momo_agent_network || 'mtn');
    setMomoAgentEnabled(!!store.momo_agent_enabled);
    setAccountVerified(!!store.bank_account_verified);
    setNameMatchOk(store.bank_account_verified ? true : null);
    setLogoUrl(store.logo_url || null);
    setCustomLinks(store.custom_links || []);
    setCatalogLabel(store.catalog_label || 'product');
    setCategoryLabel(store.category_label || 'collection');
    setStoreLabel(store.store_label || 'store');
    setTemplateHighlightLabel(store.template_highlight_label || '');
    setProductSectionEyebrow(store.product_section_eyebrow || 'Catalog');
    setProductSectionTitle(store.product_section_title || '');
    setFeaturedCarouselEnabled(store.featured_carousel_enabled !== false);
    setFeaturedCarouselEyebrow(store.featured_carousel_eyebrow || 'Featured now');
    setFeaturedCarouselTitle(store.featured_carousel_title || 'Fresh picks from the catalog');
    setFeaturedProductIds((store.featured_product_ids || []).slice(0, 5));
    setStorefrontSections(store.storefront_sections || ['reviews', 'replies_approximation', 'products', 'services', 'about', 'faq', 'contact', 'blog']);
    setReplyTimeMinutes(store.reply_time_minutes !== null && store.reply_time_minutes !== undefined ? store.reply_time_minutes : '');
    setNinaChatQrEnabled(!!store.nina_chat_qr_enabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  // Best-effort city/country label for the Store Location hint — third-party and
  // frequently blocked by ad blockers/privacy extensions, so failures here are silent
  // and non-fatal (worst case the "Detected near…" hint just doesn't show).
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const parts = [data?.city, data?.country_name].filter(Boolean);
        if (parts.length > 0) setDetectedMerchantLocation(parts.join(', '));
      })
      .catch(() => {});
  }, []);

  // Authoritative country/currency detection for auto-selecting Store Country + Currency
  // below. Routed through our own backend (same GeoIP lookup used at signup) instead of
  // calling a third-party IP API directly from the browser, since that call is commonly
  // blocked by ad blockers/privacy extensions — which was silently leaving stores on the
  // USD/no-country fallback even for merchants outside the US.
  useEffect(() => {
    fetch(`${apiUrl}/v1/meta/detect-location`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        const data = json?.data;
        if (data?.country_code) setDetectedCountryCode(String(data.country_code).toUpperCase());
        if (data?.currency_code) setDetectedCurrencyCode(String(data.currency_code).toUpperCase());
        if (!data?.country_code) setCountryDetectionFailed(true);
      })
      .catch(() => setCountryDetectionFailed(true))
      .finally(() => setGeoDetectionDone(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the canonical country list for the Store Country selector
  useEffect(() => {
    fetch(`${apiUrl}/v1/meta/countries`)
      .then(res => res.json())
      .then(json => { if (json.data) setMetaCountries(json.data); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // For a store that has no country locked in yet, auto-select the Store Country + Currency
  // from the merchant's detected IP location. If detection fails (or the detected country
  // isn't in our supported list), leave both fields unset rather than silently guessing USD —
  // countryDetectionFailed drives a prompt telling the merchant to pick their country manually.
  // Runs once; never overrides an existing selection or a saved store.country_code.
  useEffect(() => {
    if (autoDetectAppliedRef.current) return;
    if (store?.country_code) return; // already saved server-side — field is locked, leave it alone
    if (setStoreCountryCode) return; // user already picked one (or it was prefilled)
    if (!geoDetectionDone || metaCountries.length === 0) return;

    autoDetectAppliedRef.current = true;
    const match = detectedCountryCode
      ? metaCountries.find(c => c.code.toUpperCase() === detectedCountryCode)
      : undefined;
    if (match) {
      setSetStoreCountryCode(match.code);
      setSetCurrency(match.default_currency || detectedCurrencyCode || 'NGN');
    } else {
      setCountryDetectionFailed(true);
    }
  }, [geoDetectionDone, metaCountries, detectedCountryCode, detectedCurrencyCode, setStoreCountryCode, store]);

  // Keep the Payment Provider options in sync with the (possibly unsaved) Store
  // Country selection, instead of only reflecting whatever country was last saved.
  useEffect(() => {
    if (!setStoreCountryCode) return;
    let cancelled = false;
    fetch(`${apiUrl}/v1/meta/payment-providers?country_code=${setStoreCountryCode}`)
      .then(res => res.json())
      .then(json => {
        if (cancelled || !json.data) return;
        setAvailableProviders(json.data);
        if (!json.data.includes(setPaymentProvider)) {
          setSetPaymentProvider(json.data[0] || '');
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStoreCountryCode]);

  // Close bank dropdown on click outside
  useEffect(() => {
    if (!bankDropdownOpen) return;
    const handleOutsideClick = () => {
      setBankDropdownOpen(false);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [bankDropdownOpen]);

  // Fetch Paystack bank list from backend
  useEffect(() => {
    fetch(`${apiUrl}/v1/payments/banks`)
      .then(r => r.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setBankList(json.data);
        }
      })
      .catch(() => { }); // silently fail — dropdown still works with empty list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the live provisioning/SSL status while a linked custom domain is
  // still pending, so the badge flips to Active/Failed without a page reload.
  useEffect(() => {
    if (!store?.custom_domain || store?.domain_status !== 'pending') return;

    const poll = async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/store/custom-domain/status`, {
          credentials: 'include',
          headers: authHeaders,
        });
        const json = await res.json();
        if (res.ok && json?.data) {
          setStore(prev => prev ? { ...prev, domain_status: json.data.domain_status, domain_error: json.data.domain_error } : prev);
        }
      } catch {
        // Silent — next interval tick retries.
      }
    };

    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [apiUrl, store?.custom_domain, store?.domain_status, setStore]);

  const applyPersonaPreset = (personaId: string) => {
    const persona = businessPersonas.find(item => item.id === personaId);
    if (!persona) return;

    setSelectedPersona(persona.id);
    setSelectedTemplate(persona.template);
    setCatalogLabel(persona.catalogLabel);
    setCategoryLabel(persona.categoryLabel);
    setTemplateHighlightLabel(persona.highlight);
    setProductSectionEyebrow(persona.sectionEyebrow);
    setProductSectionTitle(persona.sectionTitle);
    setFeaturedCarouselEyebrow(persona.carouselEyebrow);
    setFeaturedCarouselTitle(persona.carouselTitle);
    toast.success(`${persona.name} persona applied. Save settings to publish it.`);
  };

  // Auto-resolve account name when 10 digits entered and bank selected
  const resolveAccountName = async (accountNumber: string, bankCode: string) => {
    if (accountNumber.length !== 10 || !bankCode || !token) return;
    try {
      setIsVerifying(true);
      setVerifyError('');
      setPaymentAccountName('');
      setAccountVerified(false);
      setNameMatchOk(null);

      const res = await fetch(`${apiUrl}/v1/payments/resolve-account`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
      });
      const json = await res.json();

      if (res.ok && json.account_name) {
        const verifiedName: string = json.account_name;
        setPaymentAccountName(verifiedName);
        setAccountVerified(true);

        // Name-match check: compare against user full name or store name
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const vn = normalize(verifiedName);
        const userName = normalize(user?.name || '');
        const storeName = normalize(store?.store_name || '');
        const matched = vn.includes(userName) || userName.includes(vn) ||
          vn.includes(storeName) || storeName.includes(vn) ||
          verifiedName.toLowerCase().split(' ').some(w => w.length > 2 && (user?.name || '').toLowerCase().includes(w));
        setNameMatchOk(matched);
      } else {
        setVerifyError(json.message || 'Could not verify account. Check account number and bank.');
      }
    } catch {
      setVerifyError('Network error during account verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= customLinks.length) return;
    const updated = [...customLinks];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setCustomLinks(updated);
  };

  const toggleFeaturedProduct = (productId: string) => {
    setFeaturedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 5) {
        toast.error('You can feature up to 5 products in the carousel.');
        return prev;
      }
      return [...prev, productId];
    });
  };

  // --- Settings Update Handler ---
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const personaPreset = businessPersonas.find(item => item.id === selectedPersona);
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          username: setStoreUsername,
          store_name: setStoreName,
          store_bio: setStoreBio,
          location: setStoreLocation || null,
          is_online_only: isOnlineOnly,
          since: setStoreSince || null,
          banner_url: setBannerUrl || null,
          instagram_handle: setInstagram,
          tiktok_handle: setTiktok,
          twitter_handle: setTwitter,
          facebook_handle: setFacebook,
          linkedin_handle: setLinkedin,
          facebook_pixel_id: setFacebookPixelId || null,
          google_tag_manager_id: setGoogleTagManagerId || null,
          currency_code: setCurrency,
          country_code: setStoreCountryCode || null,
          payment_provider: setPaymentProvider || null,
          bank_name: paymentBankName || null,
          bank_account_number: paymentAccountNumber || null,
          bank_account_name: paymentAccountName || null,
          payment_instructions: paymentInstructions || null,
          momo_agent_number: momoAgentNumber || null,
          momo_agent_name: momoAgentName || null,
          momo_agent_network: momoAgentNetwork || 'mtn',
          momo_agent_enabled: momoAgentEnabled,
          shipping_type: shippingType,
          shipping_flat_fee: shippingFlatFee !== '' ? Number(shippingFlatFee) : 0,
          shipping_free_threshold: shippingFreeThreshold !== '' ? Number(shippingFreeThreshold) : null,
          shipping_handling_fee: shippingHandlingFee !== '' ? Number(shippingHandlingFee) : 0,
          shipping_custom_rules: shippingCustomRules
            .filter(r => r.min_subtotal !== '' && r.fee !== '')
            .map(r => ({ min_subtotal: Number(r.min_subtotal), fee: Number(r.fee) })),
          delivery_info: deliveryInfo || null,
          return_policy: returnPolicy || null,
          reviews_intro_text: reviewsIntroText || null,
          faq_help_text: faqHelpText || null,
          about_intro_text: aboutIntroText || null,
          policy_bookings: policyBookings || null,
          policy_products: policyProducts || null,
          policy_refunds: policyRefunds || null,
          announcement_title: announcementTitle || null,
          announcement_body: announcementBody || null,
          announcement_cta_label: announcementCtaLabel || null,
          announcement_cta_page: announcementCtaPage || null,
          paystack_bank_code: paymentBankCode || null,
          bank_account_verified: accountVerified,
          custom_links: customLinks,
          logo_url: logoUrl,
          primary_color: isPro ? primaryColor : (store?.primary_color || '#25D366'),
          store_template: personaPreset?.template || selectedTemplate,
          business_persona: selectedPersona || null,
          catalog_label: personaPreset?.catalogLabel || catalogLabel || null,
          category_label: personaPreset?.categoryLabel || categoryLabel || null,
          store_label: storeLabel || null,
          template_highlight_label: personaPreset?.highlight || templateHighlightLabel || null,
          product_section_eyebrow: personaPreset?.sectionEyebrow || productSectionEyebrow || null,
          product_section_title: personaPreset?.sectionTitle || productSectionTitle || null,
          featured_carousel_enabled: personaPreset ? true : featuredCarouselEnabled,
          featured_carousel_eyebrow: personaPreset?.carouselEyebrow || featuredCarouselEyebrow || null,
          featured_carousel_title: personaPreset?.carouselTitle || featuredCarouselTitle || null,
          featured_product_ids: featuredProductIds.slice(0, 5),
          storefront_sections: storefrontSections,
          reply_time_minutes: replyTimeMinutes !== '' ? Number(replyTimeMinutes) : null,
          nina_chat_qr_enabled: ninaChatQrEnabled,
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        toast.success('Storefront settings updated! 🌟');
        setStore(json.data);
        localStorage.setItem('store', JSON.stringify(json.data));
        setSetStoreUsername(json.data.username || '');
        setSetStoreName(json.data.store_name || '');
        setSetStoreBio(json.data.store_bio || '');
        setSetStoreLocation(json.data.location || '');
        setIsOnlineOnly(!!json.data.is_online_only);
        setSetStoreSince(json.data.since || '');
        setDeliveryInfo(json.data.delivery_info || '');
        setReturnPolicy(json.data.return_policy || '');
        setReviewsIntroText(json.data.reviews_intro_text || '');
        setFaqHelpText(json.data.faq_help_text || '');
        setAboutIntroText(json.data.about_intro_text || '');
        setPolicyBookings(json.data.policy_bookings || '');
        setPolicyProducts(json.data.policy_products || '');
        setPolicyRefunds(json.data.policy_refunds || '');
        setAnnouncementTitle(json.data.announcement_title || '');
        setAnnouncementBody(json.data.announcement_body || '');
        setAnnouncementCtaLabel(json.data.announcement_cta_label || '');
        setAnnouncementCtaPage(json.data.announcement_cta_page || '');
        setSetBannerUrl(json.data.banner_url || '');
        setLogoUrl(json.data.logo_url || null);
        const parsedPhone = parsePhoneNumber(json.data.whatsapp_phone || '');
        setSelectedCountry(parsedPhone.country);
        setLocalWhatsapp(parsedPhone.local);
        setSetInstagram(json.data.instagram_handle || '');
        setSetTiktok(json.data.tiktok_handle || '');
        setSetTwitter(json.data.twitter_handle || '');
        setSetFacebook(json.data.facebook_handle || '');
        setSetLinkedin(json.data.linkedin_handle || '');
        setSetFacebookPixelId(json.data.facebook_pixel_id || '');
        setSetGoogleTagManagerId(json.data.google_tag_manager_id || '');
        setPaymentBankName(json.data.bank_name || '');
        setPaymentBankCode(json.data.paystack_bank_code || '');
        setPaymentAccountNumber(json.data.bank_account_number || '');
        setPaymentAccountName(json.data.bank_account_name || '');
        setPaymentInstructions(json.data.payment_instructions || '');
        setMomoAgentNumber(json.data.momo_agent_number || '');
        setMomoAgentName(json.data.momo_agent_name || '');
        setMomoAgentNetwork(json.data.momo_agent_network || 'mtn');
        setMomoAgentEnabled(!!json.data.momo_agent_enabled);
        setShippingType(json.data.shipping_type || 'customer_pays');
        setShippingFlatFee(json.data.shipping_flat_fee != null ? String(json.data.shipping_flat_fee) : '');
        setShippingFreeThreshold(json.data.shipping_free_threshold != null ? String(json.data.shipping_free_threshold) : '');
        setShippingHandlingFee(json.data.shipping_handling_fee != null ? String(json.data.shipping_handling_fee) : '');
        setShippingCustomRules(
          Array.isArray(json.data.shipping_custom_rules)
            ? json.data.shipping_custom_rules.map((r: any) => ({ min_subtotal: String(r.min_subtotal ?? ''), fee: String(r.fee ?? '') }))
            : []
        );
        setAccountVerified(!!json.data.bank_account_verified);
        setNameMatchOk(json.data.bank_account_verified ? true : null);
        setCustomLinks(json.data.custom_links || []);
        setPrimaryColor(json.data.primary_color || '#25D366');
        setSelectedTemplate(json.data.store_template || 'luxe-market');
        setSelectedPersona(json.data.business_persona || '');
        setCatalogLabel(json.data.catalog_label || 'product');
        setCategoryLabel(json.data.category_label || 'collection');
        setStoreLabel(json.data.store_label || 'store');
        setTemplateHighlightLabel(json.data.template_highlight_label || '');
        setProductSectionEyebrow(json.data.product_section_eyebrow || 'Catalog');
        setProductSectionTitle(json.data.product_section_title || '');
        setFeaturedCarouselEnabled(json.data.featured_carousel_enabled !== false);
        setFeaturedCarouselEyebrow(json.data.featured_carousel_eyebrow || 'Featured now');
        setFeaturedCarouselTitle(json.data.featured_carousel_title || 'Fresh picks from the catalog');
        setFeaturedProductIds((json.data.featured_product_ids || []).slice(0, 5));
        setStorefrontSections(json.data.storefront_sections || ['reviews', 'replies_approximation', 'products', 'services', 'about', 'faq', 'contact', 'blog']);
        setReplyTimeMinutes(json.data.reply_time_minutes !== null && json.data.reply_time_minutes !== undefined ? json.data.reply_time_minutes : '');
        setNinaChatQrEnabled(!!json.data.nina_chat_qr_enabled);
      } else {
        throw new Error(json.message || 'Store settings update failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred saving settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const normalizeNewWhatsappNumber = () => {
    const cleanDial = newWhatsappDialCode.replace(/[^\d]/g, '');
    const cleaned = newWhatsappLocal.replace(/[^\d]/g, '').replace(/^0+/, '');
    return `+${cleanDial}${cleaned}`;
  };

  const handleSendWhatsappOtp = async () => {
    if (!newWhatsappLocal.trim()) {
      toast.error('Enter the new WhatsApp number first.');
      return;
    }
    setWhatsappOtpSending(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/whatsapp-phone/send-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ whatsapp_phone: normalizeNewWhatsappNumber() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send verification code.');
      toast.success('Verification code sent to your new WhatsApp number.');
      setWhatsappOtpStage('otp');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send verification code.');
    } finally {
      setWhatsappOtpSending(false);
    }
  };

  const handleVerifyWhatsappOtp = async () => {
    if (whatsappOtpCode.trim().length !== 6) {
      toast.error('Enter the 6-digit code sent to your new number.');
      return;
    }
    setWhatsappOtpVerifying(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/whatsapp-phone/verify-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ whatsapp_phone: normalizeNewWhatsappNumber(), otp: whatsappOtpCode.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Invalid or expired code.');
      toast.success('WhatsApp number updated!');
      setStore(json.data);
      localStorage.setItem('store', JSON.stringify(json.data));
      const parsedPhone = parsePhoneNumber(json.data.whatsapp_phone || '');
      setSelectedCountry(parsedPhone.country);
      setLocalWhatsapp(parsedPhone.local);
      setIsChangingWhatsapp(false);
      setWhatsappOtpStage('entry');
      setNewWhatsappLocal('');
      setWhatsappOtpCode('');
    } catch (e: any) {
      toast.error(e.message || 'Invalid or expired code.');
    } finally {
      setWhatsappOtpVerifying(false);
    }
  };

  const handleGenerateDedicatedAccount = async () => {
    try {
      setIsGeneratingDedicatedAccount(true);
      const res = await fetch(`${apiUrl}/v1/payments/dedicated-account`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ preferred_bank: 'titan-paystack' }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.message || 'Could not generate dedicated account.');
      }

      setStore(json.data);
      localStorage.setItem('store', JSON.stringify(json.data));
      toast.success('Dedicated Paystack account generated.');
    } catch (e: any) {
      toast.error(e.message || 'Could not generate dedicated account.');
    } finally {
      setIsGeneratingDedicatedAccount(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setIsConnectingStripe(true);
      const res = await fetch(`${apiUrl}/v1/payments/stripe/connect`, {
        method: 'GET',
        credentials: 'include',
        headers: authHeaders,
      });

      const json = await res.json();
      if (!res.ok || !json.data?.onboarding_url) {
        throw new Error(json.message || 'Could not start Stripe onboarding.');
      }

      window.location.href = json.data.onboarding_url;
    } catch (e: any) {
      toast.error(e.message || 'Could not start Stripe onboarding.');
      setIsConnectingStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      setIsLoadingStripeDashboard(true);
      const res = await fetch(`${apiUrl}/v1/payments/stripe/dashboard-link`, {
        method: 'GET',
        credentials: 'include',
        headers: authHeaders,
      });

      const json = await res.json();
      if (!res.ok || !json.data?.url) {
        throw new Error(json.message || 'Could not open Stripe dashboard.');
      }

      window.open(json.data.url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      toast.error(e.message || 'Could not open Stripe dashboard.');
    } finally {
      setIsLoadingStripeDashboard(false);
    }
  };

  // --- Change Password Handler ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCurrentRequired = user?.has_password !== false;

    if ((isCurrentRequired && !cpCurrent) || !cpNew || !cpConfirm) {
      toast.warning(isCurrentRequired ? 'Please fill in all password fields.' : 'Please fill in the new password fields.');
      return;
    }

    if (cpNew.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }

    if (cpNew !== cpConfirm) {
      toast.warning('New password and confirmation do not match.');
      return;
    }

    try {
      setCpSaving(true);
      const res = await fetch(`${apiUrl}/v1/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          current_password: isCurrentRequired ? cpCurrent : undefined,
          new_password: cpNew,
          new_password_confirmation: cpConfirm,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(isCurrentRequired ? 'Password updated successfully! 🔒' : 'Password set successfully! 🔒');
        setCpCurrent('');
        setCpNew('');
        setCpConfirm('');

        // Update user has_password status
        const updatedUser = json.user || { ...user, has_password: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(json.message || 'Password update failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred updating password.');
    } finally {
      setCpSaving(false);
    }
  };

  // --- Custom Domain Mapping Handlers ---
  const handleLinkCustomDomain = async () => {
    if (!customDomainInput.trim()) return;
    try {
      setCustomDomainSaving(true);
      const res = await fetch(`${apiUrl}/v1/store/custom-domain`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          custom_domain: customDomainInput.trim(),
          bypass_dns: customDomainBypassDNS ? 1 : 0
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        toast.success(json.message || 'Custom domain linked successfully! 🌐');
        setStore(json.data);
        localStorage.setItem('store', JSON.stringify(json.data));
        setCustomDomainInput('');
      } else {
        throw new Error(json.message || 'Verification failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error linking custom domain.');
    } finally {
      setCustomDomainSaving(false);
    }
  };

  const handleRemoveCustomDomain = () => {
    openConfirmationDialog(
      'Remove custom domain',
      'Are you sure you want to disconnect your custom domain? Your store will no longer be accessible via this domain.',
      async () => {
        try {
          setCustomDomainSaving(true);
          const res = await fetch(`${apiUrl}/v1/store/custom-domain`, {
            method: 'DELETE',
            credentials: 'include',
            headers: authHeaders,
          });

          const json = await res.json();
          if (res.ok && json.data) {
            toast.success(json.message || 'Custom domain removed.');
            setStore(json.data);
            localStorage.setItem('store', JSON.stringify(json.data));
          } else {
            throw new Error(json.message || 'Failed to remove custom domain.');
          }
        } catch (e: any) {
          toast.error(e.message || 'Error removing custom domain.');
        } finally {
          setCustomDomainSaving(false);
        }
      },
      'Remove',
      'Cancel'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Settings Sub-Tab Navigation */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
        {([
          { id: 'profile', label: 'Profile', icon: <FileText size={14} /> },
          { id: 'design', label: 'Design', icon: <Palette size={14} /> },
          { id: 'social', label: 'Social & Links', icon: <Link size={14} /> },
          { id: 'payment', label: 'Payment', icon: <DollarSign size={14} /> },
          { id: 'security', label: 'Security', icon: <Key size={14} /> },
        ] as const).map(sub => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setSettingsSubTab(sub.id)}
            className="clickable"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', fontSize: 13, fontWeight: 800,
              border: 'none', borderBottom: settingsSubTab === sub.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              background: 'none', cursor: 'pointer',
              color: settingsSubTab === sub.id ? 'var(--primary)' : 'var(--text-muted)',
              marginBottom: -5,
            }}
          >
            {sub.icon} {sub.label}
          </button>
        ))}
      </div>

      {settingsSubTab === 'profile' && (
        <SettingsProfileTab
          store={store}
          isPro={isPro}
          systemDomain={systemDomain}
          openUpgradePrompt={openUpgradePrompt}
          settingsSaving={settingsSaving}
          handleSettingsSave={handleSettingsSave}
          setStoreName={setStoreName}
          setSetStoreName={setSetStoreName}
          setStoreUsername={setStoreUsername}
          setSetStoreUsername={setSetStoreUsername}
          setStoreLocation={setStoreLocation}
          setSetStoreLocation={setSetStoreLocation}
          detectedMerchantLocation={detectedMerchantLocation}
          isOnlineOnly={isOnlineOnly}
          setIsOnlineOnly={setIsOnlineOnly}
          setStoreSince={setStoreSince}
          setSetStoreSince={setSetStoreSince}
          setStoreBio={setStoreBio}
          setSetStoreBio={setSetStoreBio}
          selectedCountry={selectedCountry}
          localWhatsapp={localWhatsapp}
          isChangingWhatsapp={isChangingWhatsapp}
          setIsChangingWhatsapp={setIsChangingWhatsapp}
          whatsappOtpStage={whatsappOtpStage}
          setWhatsappOtpStage={setWhatsappOtpStage}
          newWhatsappDialCode={newWhatsappDialCode}
          setNewWhatsappDialCode={setNewWhatsappDialCode}
          newWhatsappLocal={newWhatsappLocal}
          setNewWhatsappLocal={setNewWhatsappLocal}
          whatsappOtpCode={whatsappOtpCode}
          setWhatsappOtpCode={setWhatsappOtpCode}
          whatsappOtpSending={whatsappOtpSending}
          whatsappOtpVerifying={whatsappOtpVerifying}
          handleSendWhatsappOtp={handleSendWhatsappOtp}
          handleVerifyWhatsappOtp={handleVerifyWhatsappOtp}
          setCurrency={setCurrency}
          setSetCurrency={setSetCurrency}
          metaCountries={metaCountries}
          setStoreCountryCode={setStoreCountryCode}
          setSetStoreCountryCode={setSetStoreCountryCode}
          countryDetectionFailed={countryDetectionFailed}
          availableProviders={availableProviders}
          setPaymentProvider={setPaymentProvider}
          setSetPaymentProvider={setSetPaymentProvider}
          deliveryInfo={deliveryInfo}
          setDeliveryInfo={setDeliveryInfo}
          returnPolicy={returnPolicy}
          setReturnPolicy={setReturnPolicy}
          announcementTitle={announcementTitle}
          setAnnouncementTitle={setAnnouncementTitle}
          announcementCtaLabel={announcementCtaLabel}
          setAnnouncementCtaLabel={setAnnouncementCtaLabel}
          announcementBody={announcementBody}
          setAnnouncementBody={setAnnouncementBody}
          announcementCtaPage={announcementCtaPage}
          setAnnouncementCtaPage={setAnnouncementCtaPage}
          selectedPersona={selectedPersona}
          applyPersonaPreset={applyPersonaPreset}
          catalogLabel={catalogLabel}
          setCatalogLabel={setCatalogLabel}
          categoryLabel={categoryLabel}
          setCategoryLabel={setCategoryLabel}
          storeLabel={storeLabel}
          setStoreLabel={setStoreLabel}
          templateHighlightLabel={templateHighlightLabel}
          setTemplateHighlightLabel={setTemplateHighlightLabel}
          productSectionEyebrow={productSectionEyebrow}
          setProductSectionEyebrow={setProductSectionEyebrow}
          productSectionTitle={productSectionTitle}
          setProductSectionTitle={setProductSectionTitle}
          reviewsIntroText={reviewsIntroText}
          setReviewsIntroText={setReviewsIntroText}
          faqHelpText={faqHelpText}
          setFaqHelpText={setFaqHelpText}
          aboutIntroText={aboutIntroText}
          setAboutIntroText={setAboutIntroText}
          policyBookings={policyBookings}
          setPolicyBookings={setPolicyBookings}
          policyProducts={policyProducts}
          setPolicyProducts={setPolicyProducts}
          policyRefunds={policyRefunds}
          setPolicyRefunds={setPolicyRefunds}
        />
      )}

      {settingsSubTab === 'design' && (
        <SettingsDesignTab
          isPro={isPro}
          openUpgradePrompt={openUpgradePrompt}
          settingsSaving={settingsSaving}
          handleSettingsSave={handleSettingsSave}
          products={products}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          logoUploading={logoUploading}
          setLogoUploading={setLogoUploading}
          setBannerUrl={setBannerUrl}
          setSetBannerUrl={setSetBannerUrl}
          bannerUploading={bannerUploading}
          setBannerUploading={setBannerUploading}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          storefrontSections={storefrontSections}
          setStorefrontSections={setStorefrontSections}
          replyTimeMinutes={replyTimeMinutes}
          setReplyTimeMinutes={setReplyTimeMinutes}
          ninaChatQrEnabled={ninaChatQrEnabled}
          setNinaChatQrEnabled={setNinaChatQrEnabled}
          featuredCarouselEnabled={featuredCarouselEnabled}
          setFeaturedCarouselEnabled={setFeaturedCarouselEnabled}
          featuredCarouselEyebrow={featuredCarouselEyebrow}
          setFeaturedCarouselEyebrow={setFeaturedCarouselEyebrow}
          featuredCarouselTitle={featuredCarouselTitle}
          setFeaturedCarouselTitle={setFeaturedCarouselTitle}
          featuredProductIds={featuredProductIds}
          toggleFeaturedProduct={toggleFeaturedProduct}
        />
      )}

      {settingsSubTab === 'security' && (
        <SettingsSecurityTab
          user={user}
          store={store}
          handlePasswordChange={handlePasswordChange}
          cpCurrent={cpCurrent}
          setCpCurrent={setCpCurrent}
          cpNew={cpNew}
          setCpNew={setCpNew}
          cpConfirm={cpConfirm}
          setCpConfirm={setCpConfirm}
          cpSaving={cpSaving}
          showCpCurrent={showCpCurrent}
          setShowCpCurrent={setShowCpCurrent}
          showCpNew={showCpNew}
          setShowCpNew={setShowCpNew}
          showCpConfirm={showCpConfirm}
          setShowCpConfirm={setShowCpConfirm}
        />
      )}

      {settingsSubTab === 'social' && (
        <SettingsSocialTab
          isLegend={isLegend}
          openUpgradePrompt={openUpgradePrompt}
          legendMonthlyPrice={legendMonthlyPrice}
          store={store}
          customDomainSaving={customDomainSaving}
          handleRemoveCustomDomain={handleRemoveCustomDomain}
          handleLinkCustomDomain={handleLinkCustomDomain}
          customDomainInput={customDomainInput}
          setCustomDomainInput={setCustomDomainInput}
          customDomainBypassDNS={customDomainBypassDNS}
          setCustomDomainBypassDNS={setCustomDomainBypassDNS}
          domainTargetCname={domainTargetCname}
          domainTargetIp={domainTargetIp}
          setInstagram={setInstagram}
          setSetInstagram={setSetInstagram}
          setTiktok={setTiktok}
          setSetTiktok={setSetTiktok}
          setTwitter={setTwitter}
          setSetTwitter={setSetTwitter}
          setFacebookPixelId={setFacebookPixelId}
          setSetFacebookPixelId={setSetFacebookPixelId}
          setGoogleTagManagerId={setGoogleTagManagerId}
          setSetGoogleTagManagerId={setSetGoogleTagManagerId}
          showLinkForm={showLinkForm}
          setShowLinkForm={setShowLinkForm}
          editingLinkId={editingLinkId}
          setEditingLinkId={setEditingLinkId}
          linkTitle={linkTitle}
          setLinkTitle={setLinkTitle}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          linkPlatform={linkPlatform}
          setLinkPlatform={setLinkPlatform}
          linkActive={linkActive}
          setLinkActive={setLinkActive}
          customLinks={customLinks}
          setCustomLinks={setCustomLinks}
          moveLink={moveLink}
          openConfirmationDialog={openConfirmationDialog}
          logoUrl={logoUrl}
          setStoreName={setStoreName}
          setStoreBio={setStoreBio}
          localWhatsapp={localWhatsapp}
        />
      )}

      {settingsSubTab === 'payment' && (
        <SettingsPaymentTab
          store={store}
          user={user}
          isPro={isPro}
          openUpgradePrompt={openUpgradePrompt}
          settingsSaving={settingsSaving}
          handleSettingsSave={handleSettingsSave}
          isLoadingStripeDashboard={isLoadingStripeDashboard}
          handleOpenStripeDashboard={handleOpenStripeDashboard}
          isConnectingStripe={isConnectingStripe}
          handleConnectStripe={handleConnectStripe}
          isGeneratingDedicatedAccount={isGeneratingDedicatedAccount}
          handleGenerateDedicatedAccount={handleGenerateDedicatedAccount}
          paymentBankName={paymentBankName}
          setPaymentBankName={setPaymentBankName}
          paymentBankCode={paymentBankCode}
          setPaymentBankCode={setPaymentBankCode}
          paymentAccountNumber={paymentAccountNumber}
          setPaymentAccountNumber={setPaymentAccountNumber}
          paymentAccountName={paymentAccountName}
          setPaymentAccountName={setPaymentAccountName}
          setAccountVerified={setAccountVerified}
          setNameMatchOk={setNameMatchOk}
          setVerifyError={setVerifyError}
          bankDropdownOpen={bankDropdownOpen}
          setBankDropdownOpen={setBankDropdownOpen}
          bankList={bankList}
          resolveAccountName={resolveAccountName}
          isVerifying={isVerifying}
          verifyError={verifyError}
          accountVerified={accountVerified}
          nameMatchOk={nameMatchOk}
          paymentInstructions={paymentInstructions}
          setPaymentInstructions={setPaymentInstructions}
          shippingType={shippingType}
          setShippingType={setShippingType}
          shippingFreeThreshold={shippingFreeThreshold}
          setShippingFreeThreshold={setShippingFreeThreshold}
          shippingFlatFee={shippingFlatFee}
          setShippingFlatFee={setShippingFlatFee}
          shippingCustomRules={shippingCustomRules}
          setShippingCustomRules={setShippingCustomRules}
          shippingHandlingFee={shippingHandlingFee}
          setShippingHandlingFee={setShippingHandlingFee}
          momoAgentEnabled={momoAgentEnabled}
          setMomoAgentEnabled={setMomoAgentEnabled}
          momoAgentNetwork={momoAgentNetwork}
          setMomoAgentNetwork={setMomoAgentNetwork}
          momoAgentNumber={momoAgentNumber}
          setMomoAgentNumber={setMomoAgentNumber}
          momoAgentName={momoAgentName}
          setMomoAgentName={setMomoAgentName}
        />
      )}

    </div>
  );
}
