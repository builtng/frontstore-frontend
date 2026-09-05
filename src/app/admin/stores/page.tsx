'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin, StoreInfo } from '../AdminContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Pencil,
  Power,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Zap,
} from 'lucide-react';
import { TableSkeleton, StatusChip, EmptyState } from '../components';
import CreateMerchantDrawer from './CreateMerchantDrawer';
import SearchableSelect, { SelectOption } from '@/components/SearchableSelect';
import { NIGERIAN_STATES } from '@/utils/nigerianStates';

export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'NG', label: 'Nigeria', sublabel: 'NG · +234', icon: <span>🇳🇬</span> },
  { value: 'GH', label: 'Ghana', sublabel: 'GH · +233', icon: <span>🇬🇭</span> },
  { value: 'KE', label: 'Kenya', sublabel: 'KE · +254', icon: <span>🇰🇪</span> },
  { value: 'ZA', label: 'South Africa', sublabel: 'ZA · +27', icon: <span>🇿🇦</span> },
  { value: 'GB', label: 'United Kingdom', sublabel: 'GB · +44', icon: <span>🇬🇧</span> },
  { value: 'US', label: 'United States', sublabel: 'US · +1', icon: <span>🇺🇸</span> },
  { value: 'CA', label: 'Canada', sublabel: 'CA · +1', icon: <span>🇨🇦</span> },
  { value: 'UG', label: 'Uganda', sublabel: 'UG · +256', icon: <span>🇺🇬</span> },
  { value: 'RW', label: 'Rwanda', sublabel: 'RW · +250', icon: <span>🇷🇼</span> },
  { value: 'CM', label: 'Cameroon', sublabel: 'CM · +237', icon: <span>🇨🇲</span> },
  { value: 'CI', label: 'Ivory Coast', sublabel: 'CI · +225', icon: <span>🇨🇮</span> },
  { value: 'SN', label: 'Senegal', sublabel: 'SN · +221', icon: <span>🇸🇳</span> },
  { value: 'TZ', label: 'Tanzania', sublabel: 'TZ · +255', icon: <span>🇹🇿</span> },
  { value: 'AE', label: 'United Arab Emirates', sublabel: 'AE · +971', icon: <span>🇦🇪</span> },
];

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  GB: 'GBP',
  US: 'USD',
  CA: 'CAD',
  UG: 'UGX',
  RW: 'RWF',
  CM: 'XAF',
  CI: 'XOF',
  SN: 'XOF',
  TZ: 'TZS',
  AE: 'AED',
};

export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'NGN', label: 'NGN (₦)', sublabel: 'Nigerian Naira' },
  { value: 'USD', label: 'USD ($)', sublabel: 'US Dollar' },
  { value: 'GBP', label: 'GBP (£)', sublabel: 'British Pound' },
  { value: 'EUR', label: 'EUR (€)', sublabel: 'Euro' },
  { value: 'GHS', label: 'GHS (₵)', sublabel: 'Ghanaian Cedi' },
  { value: 'KES', label: 'KES (KSh)', sublabel: 'Kenyan Shilling' },
  { value: 'ZAR', label: 'ZAR (R)', sublabel: 'South African Rand' },
  { value: 'CAD', label: 'CAD ($)', sublabel: 'Canadian Dollar' },
  { value: 'UGX', label: 'UGX (USh)', sublabel: 'Ugandan Shilling' },
  { value: 'RWF', label: 'RWF (FRw)', sublabel: 'Rwandan Franc' },
  { value: 'XOF', label: 'XOF (CFA)', sublabel: 'West African CFA Franc' },
  { value: 'XAF', label: 'XAF (FCFA)', sublabel: 'Central African CFA Franc' },
];

export const STATE_REGION_OPTIONS: SelectOption[] = [
  { value: '', label: 'None / Select State...', sublabel: 'Choose region' },
  ...NIGERIAN_STATES.map((s) => ({
    value: s.name,
    label: s.name,
    sublabel: 'Nigeria',
  })),
  { value: 'Greater London', label: 'Greater London', sublabel: 'United Kingdom' },
  { value: 'Greater Manchester', label: 'Greater Manchester', sublabel: 'United Kingdom' },
  { value: 'West Midlands', label: 'West Midlands (Birmingham)', sublabel: 'United Kingdom' },
  { value: 'New York', label: 'New York', sublabel: 'United States' },
  { value: 'California', label: 'California', sublabel: 'United States' },
  { value: 'Texas', label: 'Texas', sublabel: 'United States' },
  { value: 'Ontario', label: 'Ontario', sublabel: 'Canada' },
  { value: 'Greater Accra', label: 'Greater Accra', sublabel: 'Ghana' },
  { value: 'Nairobi County', label: 'Nairobi County', sublabel: 'Kenya' },
];

export const POPULAR_BANKS: SelectOption[] = [
  { value: 'Access Bank', label: 'Access Bank', sublabel: 'Commercial Bank' },
  { value: 'Guaranty Trust Bank', label: 'Guaranty Trust Bank (GTBank)', sublabel: 'Commercial Bank' },
  { value: 'Zenith Bank', label: 'Zenith Bank', sublabel: 'Commercial Bank' },
  { value: 'First Bank of Nigeria', label: 'First Bank of Nigeria', sublabel: 'Commercial Bank' },
  { value: 'United Bank for Africa', label: 'United Bank for Africa (UBA)', sublabel: 'Commercial Bank' },
  { value: 'Kuda Bank', label: 'Kuda Microfinance Bank', sublabel: 'Digital Bank' },
  { value: 'OPay', label: 'OPay (PayCom)', sublabel: 'Fintech / Mobile Money' },
  { value: 'Moniepoint Microfinance Bank', label: 'Moniepoint Microfinance Bank', sublabel: 'Fintech / Bank' },
  { value: 'PalmPay', label: 'PalmPay', sublabel: 'Fintech / Mobile Money' },
  { value: 'Fidelity Bank', label: 'Fidelity Bank', sublabel: 'Commercial Bank' },
  { value: 'Stanbic IBTC Bank', label: 'Stanbic IBTC Bank', sublabel: 'Commercial Bank' },
  { value: 'Sterling Bank', label: 'Sterling Bank', sublabel: 'Commercial Bank' },
  { value: 'First City Monument Bank', label: 'FCMB', sublabel: 'Commercial Bank' },
  { value: 'Wema Bank', label: 'Wema Bank (ALAT)', sublabel: 'Commercial Bank' },
  { value: 'Union Bank of Nigeria', label: 'Union Bank', sublabel: 'Commercial Bank' },
  { value: 'Polaris Bank', label: 'Polaris Bank', sublabel: 'Commercial Bank' },
  { value: 'Ecobank Nigeria', label: 'Ecobank Nigeria', sublabel: 'Commercial Bank' },
  { value: 'Providus Bank', label: 'Providus Bank', sublabel: 'Commercial Bank' },
  { value: 'Keystone Bank', label: 'Keystone Bank', sublabel: 'Commercial Bank' },
  { value: 'Jaiz Bank', label: 'Jaiz Bank', sublabel: 'Non-Interest Bank' },
  { value: 'Taj Bank', label: 'Taj Bank', sublabel: 'Non-Interest Bank' },
  { value: 'Standard Chartered Bank', label: 'Standard Chartered Bank', sublabel: 'International Bank' },
  { value: 'Citibank Nigeria', label: 'Citibank Nigeria', sublabel: 'International Bank' },
  { value: 'FairMoney Microfinance Bank', label: 'FairMoney Microfinance Bank', sublabel: 'Digital Bank' },
  { value: 'Carbon', label: 'Carbon (One Finance)', sublabel: 'Digital Bank' },
  { value: 'VFD Microfinance Bank', label: 'VFD Microfinance Bank', sublabel: 'Digital Bank' },
  { value: 'Rubies Bank', label: 'Rubies Bank', sublabel: 'Digital Bank' },
];

const STORE_COLOR_PRESETS = [
  { name: 'Frontstore', value: '#25D366' },
  { name: 'Ruby', value: '#e11d48' },
  { name: 'Royal', value: '#4f46e5' },
  { name: 'Ocean', value: '#0284c7' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Graphite', value: '#27272a' },
  { name: 'Teal', value: '#128c7e' },
  { name: 'Forest Green', value: '#0B5D39' },
  { name: 'Deep Emerald', value: '#074328' },
];

const formatMoney = (value?: number, currencyCode: string = 'NGN') =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const planLabel = (plan?: string | null) => {
  if (plan === 'pro_yearly') return 'Pro Yearly';
  if (plan === 'pro_monthly') return 'Pro Monthly';
  if (plan === 'legend_yearly') return 'Business Yearly';
  if (plan === 'legend_monthly') return 'Business Monthly';
  return 'Free';
};

const isProPlan = (plan?: string | null) => plan === 'pro_monthly' || plan === 'pro_yearly' || plan === 'legend_monthly' || plan === 'legend_yearly';

const PAYOUT_TIERS = [
  { level: 1, name: 'New Seller', range: '0–40 pts', payout: '5-day hold', icon: Clock },
  { level: 2, name: 'Verified Seller', range: '41–70 pts', payout: 'Next-day payout', icon: ShieldCheck },
  { level: 3, name: 'Trusted Seller', range: '71–90 pts', payout: 'Same-day payout', icon: BadgeCheck },
  { level: 4, name: 'Elite Seller', range: '91–100 pts', payout: 'Instant payout', icon: Zap },
] as const;

export default function AdminStoresPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog, settings } = useAdmin();

  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'edit'>('overview');
  const [drawerColor, setDrawerColor] = useState('#25D366');
  const [savingColorFor, setSavingColorFor] = useState<string | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [sendingLimitEmailFor, setSendingLimitEmailFor] = useState<string | null>(null);
  const [generatingDvaFor, setGeneratingDvaFor] = useState<string | null>(null);
  const [uploadingNinaAvatarFor, setUploadingNinaAvatarFor] = useState<string | null>(null);

  // --- Edit merchant info state ---
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  // user fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  // store fields
  const [editStoreName, setEditStoreName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWhatsappPhone, setEditWhatsappPhone] = useState('');
  const [editStoreSince, setEditStoreSince] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editCountry, setEditCountry] = useState('');
  // location & bank dropdown state
  const [editState, setEditState] = useState('');
  const [editArea, setEditArea] = useState('');
  const [customBankMode, setCustomBankMode] = useState(false);
  const [liveBanks, setLiveBanks] = useState<SelectOption[]>(POPULAR_BANKS);
  // payout bank fields
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editBankAccountName, setEditBankAccountName] = useState('');
  // admin note
  const [editNote, setEditNote] = useState('');

  // Fetch verified banks from API to enrich dropdown
  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch(`${apiUrl}/v1/banks`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const apiBankOptions: SelectOption[] = json.data.map((b: any) => ({
              value: b.name,
              label: b.name,
              sublabel: b.code ? `Bank · Code ${b.code}` : 'Bank',
            }));
            const map = new Map<string, SelectOption>();
            POPULAR_BANKS.forEach((b) => map.set(b.value.toLowerCase(), b));
            apiBankOptions.forEach((b) => {
              if (!map.has(b.value.toLowerCase())) {
                map.set(b.value.toLowerCase(), b);
              }
            });
            setLiveBanks(Array.from(map.values()));
          }
        }
      } catch {
        // use default POPULAR_BANKS fallback
      }
    }
    fetchBanks();
  }, [apiUrl]);

  const handleCountryChange = (val: string) => {
    setEditCountry(val);
    const suggestedCurrency = COUNTRY_TO_CURRENCY[val];
    if (suggestedCurrency) {
      setEditCurrency(suggestedCurrency);
    }
  };

  const handleStateChange = (stateVal: string) => {
    setEditState(stateVal);
    if (stateVal) {
      const combined = editArea.trim() ? `${editArea.trim()}, ${stateVal}` : stateVal;
      setEditLocation(combined);
    }
  };

  const handleAreaChange = (areaVal: string) => {
    setEditArea(areaVal);
    const combined = areaVal.trim()
      ? (editState ? `${areaVal.trim()}, ${editState}` : areaVal.trim())
      : (editState || '');
    setEditLocation(combined);
  };

  const bankSelectOptions: SelectOption[] = React.useMemo(() => {
    const list: SelectOption[] = [...liveBanks];
    if (editBankName && !list.some((b) => b.value.toLowerCase() === editBankName.toLowerCase())) {
      list.unshift({
        value: editBankName,
        label: editBankName,
        sublabel: 'Current Store Bank',
        icon: <Landmark size={14} />,
      });
    }
    list.push({
      value: '__CUSTOM__',
      label: '✏️ Type custom bank name...',
      sublabel: 'Enter an unlisted or international bank',
    });
    return list;
  }, [liveBanks, editBankName]);

  const handleBankSelect = (val: string) => {
    if (val === '__CUSTOM__') {
      setCustomBankMode(true);
      setEditBankName('');
    } else {
      setEditBankName(val);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      setDrawerColor(selectedStore.primary_color || '#25D366');
      // Seed the edit form with current values
      setEditOpen(false);
      setEditName(selectedStore.user?.name || '');
      setEditEmail(selectedStore.user?.email || '');
      setEditPhone(selectedStore.user?.phone_number || '');
      setEditStoreName(selectedStore.store_name || '');
      setEditUsername(selectedStore.username || '');
      setEditBio(selectedStore.store_bio || selectedStore.bio || '');
      setEditAddress(selectedStore.address || '');
      setEditWhatsappPhone(selectedStore.whatsapp_phone || '');
      setEditStoreSince(selectedStore.store_since || '');

      const initialCountry = (selectedStore.country_code || 'NG').toUpperCase();
      setEditCountry(initialCountry);

      const initialCurrency = (selectedStore.currency_code || COUNTRY_TO_CURRENCY[initialCountry] || 'NGN').toUpperCase();
      setEditCurrency(initialCurrency);

      const rawLoc = selectedStore.location || '';
      setEditLocation(rawLoc);

      let matchedState = '';
      for (const opt of STATE_REGION_OPTIONS) {
        if (opt.value && rawLoc.toLowerCase().includes(opt.value.toLowerCase())) {
          matchedState = opt.value;
          break;
        }
      }
      setEditState(matchedState);
      if (matchedState) {
        const regex = new RegExp(`\\b${matchedState}\\b`, 'gi');
        const areaCleaned = rawLoc
          .replace(regex, '')
          .replace(/Nigeria/gi, '')
          .replace(/United Kingdom/gi, '')
          .replace(/United States/gi, '')
          .replace(/^[\s,]+|[\s,]+$/g, '')
          .trim();
        setEditArea(areaCleaned);
      } else {
        setEditArea(rawLoc);
      }

      setEditBankName(selectedStore.bank_name || '');
      setEditBankAccount(selectedStore.bank_account_number || '');
      setEditBankAccountName(selectedStore.bank_account_name || '');
      setCustomBankMode(false);
      setEditNote('');
    } else {
      setInspectorTab('overview');
    }
  }, [selectedStore]);

  const freeProductLimit = Number(settings?.free_plan_product_limit) || 10;
  const hasReachedProductLimit = (store: StoreInfo) =>
    !isProPlan(store.user?.plan) && Number(store.products_count || 0) >= freeProductLimit;

  const needsDedicatedAccount = (store: StoreInfo) =>
    store.payment_provider !== 'stripe' && !store.paystack_dva_active;

  const loadStores = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setStoresLoading(true);
      const url = `${apiUrl}/v1/admin/stores?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { credentials: 'include', headers: getHeaders() });
      const json = await handleFetchResponse(res, 'Could not fetch stores directory.');
      setStores(json.data?.data || []);
      setCurrentPage(json.data?.current_page || 1);
      setLastPage(json.data?.last_page || 1);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setStoresLoading(false);
    }
  };

  const handleToggleStoreStatus = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to update store status.');
      toast.success(json.message);
      setStores((items) =>
        items.map((store) => (store.id === storeId ? { ...store, is_active: !store.is_active } : store))
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to delete store.');
      toast.success(json.message);
      setStores((items) => items.filter((store) => store.id !== storeId));
      setSelectedStore((prev) => (prev?.id === storeId ? null : prev));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  const handleSendLimitEmail = async (storeId: string) => {
    try {
      setSendingLimitEmailFor(storeId);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/send-limit-email`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to send limit-reached email.');
      toast.success(json.message);
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSendingLimitEmailFor(null);
    }
  };

  const handleGenerateDva = async (storeId: string) => {
    try {
      setGeneratingDvaFor(storeId);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/generate-dva`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      });
      const json = await handleFetchResponse(res, 'Failed to generate dedicated account.');
      toast.success(json.message);
      setStores((items) =>
        items.map((store) =>
          store.id === storeId
            ? {
                ...store,
                paystack_dva_active: true,
                paystack_dva_account_number: json.data?.paystack_dva_account_number,
                paystack_dva_bank_name: json.data?.paystack_dva_bank_name,
                paystack_dva_account_name: json.data?.paystack_dva_account_name,
              }
            : store
        )
      );
      setSelectedStore((prev) =>
        prev && prev.id === storeId
          ? {
              ...prev,
              paystack_dva_active: true,
              paystack_dva_account_number: json.data?.paystack_dva_account_number,
              paystack_dva_bank_name: json.data?.paystack_dva_bank_name,
              paystack_dva_account_name: json.data?.paystack_dva_account_name,
            }
          : prev
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setGeneratingDvaFor(null);
    }
  };

  const handleNinaAvatarFile = async (storeId: string, file: File) => {
    try {
      setUploadingNinaAvatarFor(storeId);
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/nina-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await handleFetchResponse(res, 'Could not upload Nina avatar.');
      toast.success(json.message);
      const newUrl = json.data?.nina_avatar_url;
      setStores((items) => items.map((store) => (store.id === storeId ? { ...store, nina_avatar_url: newUrl } : store)));
      setSelectedStore((prev) => (prev && prev.id === storeId ? { ...prev, nina_avatar_url: newUrl } : prev));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setUploadingNinaAvatarFor(null);
    }
  };

  const handleUpdateStoreColor = async (storeId: string, color: string) => {
    if (!color || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      toast.error('Please provide a valid hex color code (e.g. #25D366).');
      return;
    }
    try {
      setSavingColorFor(storeId);
      const res = await fetch(`${apiUrl}/v1/admin/stores/${storeId}/color`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary_color: color }),
      });
      const json = await handleFetchResponse(res, 'Failed to update store color.');
      toast.success(json.message || 'Store color updated.');
      setStores((items) =>
        items.map((store) => (store.id === storeId ? { ...store, primary_color: color } : store))
      );
      setSelectedStore((prev) => (prev && prev.id === storeId ? { ...prev, primary_color: color } : prev));
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSavingColorFor(null);
    }
  };

  const handleUpdateUserPlan = async (userId: string | undefined, plan: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiUrl}/v1/admin/users/${userId}/plan`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ plan }),
      });
      await handleFetchResponse(res, 'Failed to update user plan.');
      toast.success(`Plan updated to ${planLabel(plan)}.`);
      setStores((items) =>
        items.map((store) =>
          store.user?.id === userId
            ? {
                ...store,
                user: {
                  ...store.user,
                  plan,
                },
              }
            : store
        )
      );
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    }
  };

  // ---- Save editable merchant info (support override) ----
  const handleSaveMerchantInfo = async () => {
    if (!selectedStore) return;
    setEditSaving(true);
    try {
      const errors: string[] = [];

      // 1. Update user fields if user exists
      if (selectedStore.user?.id) {
        const userPayload: Record<string, string> = {};
        if (editName.trim()) userPayload.name = editName.trim();
        if (editEmail.trim()) userPayload.email = editEmail.trim();
        if (editPhone.trim()) userPayload.phone_number = editPhone.trim();
        if (editNote.trim()) userPayload.admin_note = editNote.trim();

        if (Object.keys(userPayload).length > 0) {
          const res = await fetch(`${apiUrl}/v1/admin/users/${selectedStore.user.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            errors.push(j.message || 'Failed to update user info.');
          } else {
            await res.json().catch(() => {});
            // reflect updates in local state
            setStores((items) =>
              items.map((s) =>
                s.id === selectedStore.id
                  ? {
                      ...s,
                      user: s.user
                        ? {
                            ...s.user,
                            name: editName.trim() || s.user.name,
                            email: editEmail.trim() || s.user.email,
                            phone_number: editPhone.trim() || s.user.phone_number,
                          }
                        : s.user,
                    }
                  : s
              )
            );
            setSelectedStore((prev) =>
              prev
                ? {
                    ...prev,
                    user: prev.user
                      ? {
                          ...prev.user,
                          name: editName.trim() || prev.user.name,
                          email: editEmail.trim() || prev.user.email,
                          phone_number: editPhone.trim() || prev.user.phone_number,
                        }
                      : prev.user,
                  }
                : prev
            );
          }
        }
      }

      // 2. Update store profile fields
      {
        const storePayload: Record<string, string> = {};
        if (editStoreName.trim()) storePayload.store_name = editStoreName.trim();
        if (editUsername.trim()) storePayload.username = editUsername.trim();
        if (editBio !== undefined) {
          storePayload.bio = editBio;
          storePayload.store_bio = editBio;
        }
        if (editLocation !== undefined) storePayload.location = editLocation;
        if (editAddress !== undefined) storePayload.address = editAddress;
        if (editWhatsappPhone !== undefined) storePayload.whatsapp_phone = editWhatsappPhone;
        if (editStoreSince !== undefined) storePayload.store_since = editStoreSince;
        if (editCurrency.trim()) storePayload.currency_code = editCurrency.trim();
        if (editCountry !== undefined) storePayload.country_code = editCountry;
        if (editNote.trim()) storePayload.admin_note = editNote.trim();

        const res = await fetch(`${apiUrl}/v1/admin/stores/${selectedStore.id}/profile`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { ...getHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(storePayload),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          errors.push(j.message || 'Failed to update store profile.');
        } else {
          setStores((items) =>
            items.map((s) =>
              s.id === selectedStore.id
                ? {
                    ...s,
                    store_name: editStoreName.trim() || s.store_name,
                    username: editUsername.trim() || s.username,
                    bio: editBio,
                    store_bio: editBio,
                    location: editLocation,
                    address: editAddress,
                    whatsapp_phone: editWhatsappPhone,
                    store_since: editStoreSince,
                    currency_code: editCurrency.trim() || s.currency_code,
                    country_code: editCountry,
                  }
                : s
            )
          );
          setSelectedStore((prev) =>
            prev
              ? {
                  ...prev,
                  store_name: editStoreName.trim() || prev.store_name,
                  username: editUsername.trim() || prev.username,
                  bio: editBio,
                  store_bio: editBio,
                  location: editLocation,
                  address: editAddress,
                  whatsapp_phone: editWhatsappPhone,
                  store_since: editStoreSince,
                  currency_code: editCurrency.trim() || prev.currency_code,
                  country_code: editCountry,
                }
              : prev
          );
        }
      }

      // 3. Update payout bank if any bank field is filled
      if (editBankAccount.trim()) {
        const bankPayload: Record<string, string> = {
          bank_name: editBankName.trim(),
          bank_account_number: editBankAccount.trim(),
          bank_account_name: editBankAccountName.trim(),
        };
        if (editNote.trim()) bankPayload.admin_note = editNote.trim();

        const res = await fetch(`${apiUrl}/v1/admin/stores/${selectedStore.id}/payout-bank`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { ...getHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(bankPayload),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          errors.push(j.message || 'Failed to update payout bank.');
        } else {
          setStores((items) =>
            items.map((s) =>
              s.id === selectedStore.id
                ? {
                    ...s,
                    bank_name: editBankName.trim(),
                    bank_account_number: editBankAccount.trim(),
                    bank_account_name: editBankAccountName.trim(),
                  }
                : s
            )
          );
          setSelectedStore((prev) =>
            prev
              ? {
                  ...prev,
                  bank_name: editBankName.trim(),
                  bank_account_number: editBankAccount.trim(),
                  bank_account_name: editBankAccountName.trim(),
                }
              : prev
          );
        }
      }

      if (errors.length > 0) {
        errors.forEach((e) => toast.error(e));
      } else {
        toast.success('Merchant details & location updated successfully.');
        setEditOpen(false);
        setInspectorTab('overview');
        setEditNote('');
      }
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setEditSaving(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadStores(1, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>Merchant stores</h2>
          <p>Search, suspend, activate, and update subscription plans.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <form
            className="admin-search"
            onSubmit={(event) => {
              event.preventDefault();
              loadStores(1, searchQuery);
            }}
          >
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search stores, owners, email, phone"
            />
            <button type="submit">Search</button>
          </form>
          <button type="button" className="admin-action" onClick={() => setShowCreateDrawer(true)}>
            <UserPlus size={15} /> Create merchant
          </button>
        </div>
      </div>

      {showCreateDrawer && (
        <CreateMerchantDrawer
          onClose={() => setShowCreateDrawer(false)}
          onCreated={() => loadStores(currentPage, searchQuery)}
        />
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Merchant</th>
              <th>Color</th>
              <th>Plan</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {storesLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : stores.length ? (
              stores.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  style={{ cursor: 'pointer' }}
                  className="admin-table-row-hoverable"
                >
                  <td>
                    <strong>
                      {store.store_name}
                      {store.is_verified && <BadgeCheck size={13} style={{ verticalAlign: 'middle', marginLeft: 4, color: '#25D366' }} />}
                    </strong>
                    <a
                      href={
                        store.custom_domain
                          ? `https://${store.custom_domain}`
                          : `https://${store.username}.frontstore.ng`
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{store.username} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td>
                    <strong>{store.user?.name || 'Unnamed merchant'}</strong>
                    <span>{store.user?.email || store.user?.phone_number || 'No contact'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: store.primary_color || '#25D366',
                          border: '1px solid rgba(255,255,255,0.25)',
                          flexShrink: 0,
                          display: 'inline-block',
                          boxShadow: `0 0 8px ${store.primary_color || '#25D366'}40`,
                        }}
                      />
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2, #d4d4d8)' }}>
                        {store.primary_color || '#25D366'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-plan-cell" onClick={(e) => e.stopPropagation()}>
                      <StatusChip tone={isProPlan(store.user?.plan) ? 'green' : 'gray'} label={planLabel(store.user?.plan)} />
                      {hasReachedProductLimit(store) && (
                        <StatusChip tone="orange" label={`${store.products_count}/${freeProductLimit} products`} />
                      )}
                      <label className="admin-select">
                        <select
                          value={store.user?.plan || 'free'}
                          onChange={(event) => handleUpdateUserPlan(store.user?.id, event.target.value)}
                          disabled={!store.user}
                        >
                          <option value="free">Free</option>
                          <option value="pro_monthly">Pro Monthly</option>
                          <option value="pro_yearly">Pro Yearly</option>
                          <option value="legend_monthly">Business Monthly</option>
                          <option value="legend_yearly">Business Yearly</option>
                        </select>
                        <ChevronDown size={14} />
                      </label>
                    </div>
                  </td>
                  <td>
                    <StatusChip tone={store.is_active ? 'green' : 'red'} label={store.is_active ? 'Active' : 'Suspended'} />
                  </td>
                  <td className="admin-table__actions">
                    {hasReachedProductLimit(store) && (
                      <button
                        type="button"
                        className="admin-action"
                        disabled={sendingLimitEmailFor === store.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmationDialog(
                            'Send limit-reached email',
                            `Email "${store.user?.name || store.store_name}" letting them know they've hit the ${freeProductLimit}-product free plan limit and can upgrade to Pro?`,
                            async () => {
                              await handleSendLimitEmail(store.id);
                            }
                          );
                        }}
                      >
                        <Mail size={15} />
                        {sendingLimitEmailFor === store.id ? 'Sending…' : 'Send limit email'}
                      </button>
                    )}
                    {needsDedicatedAccount(store) && (
                      <button
                        type="button"
                        className="admin-action"
                        disabled={generatingDvaFor === store.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmationDialog(
                            'Generate dedicated account',
                            `Generate a Paystack dedicated account for "${store.store_name}"? The merchant will be notified by email once it's ready.`,
                            async () => {
                              await handleGenerateDva(store.id);
                            }
                          );
                        }}
                      >
                        <Landmark size={15} />
                        {generatingDvaFor === store.id ? 'Generating…' : 'Generate DVA'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-action"
                      title="Edit Store Details & Locations"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStore(store);
                        setInspectorTab('edit');
                      }}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className={store.is_active ? 'admin-action warning' : 'admin-action'}
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmationDialog(
                          store.is_active ? 'Suspend store' : 'Activate store',
                          `Are you sure you want to ${store.is_active ? 'suspend' : 'activate'} "${store.store_name}"?`,
                          async () => {
                            await handleToggleStoreStatus(store.id);
                          }
                        );
                      }}
                    >
                      <Power size={15} />
                      {store.is_active ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="admin-action danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmationDialog(
                          'Delete store',
                          `This permanently deletes "${store.store_name}" and logs the merchant out of their dashboard. This cannot be undone.`,
                          async () => {
                            await handleDeleteStore(store.id);
                          }
                        );
                      }}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState label="No stores match this search." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="admin-pagination">
          <button type="button" onClick={() => loadStores(currentPage - 1, searchQuery)} disabled={currentPage === 1}>
            <ArrowLeft size={15} /> Previous
          </button>
          <span>
            Page {currentPage} of {lastPage}
          </span>
          <button type="button" onClick={() => loadStores(currentPage + 1, searchQuery)} disabled={currentPage === lastPage}>
            Next <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Drawer Inspector Overlay */}
      {selectedStore && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedStore(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer__header">
              <div>
                <h2>{inspectorTab === 'edit' ? 'Edit Store & Location' : 'Store Inspector'}</h2>
                <p>
                  {inspectorTab === 'edit'
                    ? `Editing merchant & store details for ${selectedStore.store_name}`
                    : 'Verify bank payouts, balances, and security'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setInspectorTab((tab) => (tab === 'edit' ? 'overview' : 'edit'))}
                  className={inspectorTab === 'edit' ? 'btn btn-outline' : 'btn btn-primary'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px' }}
                >
                  <Pencil size={13} />
                  {inspectorTab === 'edit' ? 'View Overview' : 'Edit Details'}
                </button>
                <button className="admin-drawer__close" onClick={() => setSelectedStore(null)} type="button">
                  &times;
                </button>
              </div>
            </div>

            {/* Top Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                background: 'var(--surface-2, #1c1c21)',
                borderBottom: '1px solid var(--border-strong, #30303a)',
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setInspectorTab('overview')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '11px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: inspectorTab === 'overview' ? 'var(--primary, #25D366)' : 'var(--text-muted, #8b8b9a)',
                  borderBottom: inspectorTab === 'overview' ? '2px solid var(--primary, #25D366)' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                <ShieldCheck size={14} />
                Overview & Balances
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('edit')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '11px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: inspectorTab === 'edit' ? 'var(--primary, #25D366)' : 'var(--text-muted, #8b8b9a)',
                  borderBottom: inspectorTab === 'edit' ? '2px solid var(--primary, #25D366)' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                <Pencil size={14} />
                Edit Store & Location
              </button>
            </div>

            {inspectorTab === 'edit' ? (
              <div className="admin-drawer__content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header note */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(37, 211, 102, 0.08)',
                    border: '1px solid rgba(37, 211, 102, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <strong style={{ color: 'var(--primary, #25D366)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Pencil size={14} /> Admin Support Override
                  </strong>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted, #94a3b8)', lineHeight: 1.4 }}>
                    Changes made here take effect immediately across the merchant profile, public storefront, and live database.
                  </p>
                </div>

                {/* 1. Account Info */}
                <div className="admin-drawer__section">
                  <h3>Merchant Account Details</h3>
                  <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                    <label className="admin-field">
                      <span>Full Name</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={selectedStore.user?.name || 'Full name'}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Email Address</span>
                      <input
                        className="admin-input"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder={selectedStore.user?.email || 'email@example.com'}
                      />
                    </label>
                    <label className="admin-field admin-field--full">
                      <span>Login / WhatsApp Phone</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder={selectedStore.user?.phone_number || '+2348012345678'}
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Store Identity */}
                <div className="admin-drawer__section">
                  <h3>Store Identity</h3>
                  <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                    <label className="admin-field">
                      <span>Store Name</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editStoreName}
                        onChange={(e) => setEditStoreName(e.target.value)}
                        placeholder={selectedStore.store_name}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Username / Handle</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editUsername}
                        onChange={(e) =>
                          setEditUsername(
                            e.target.value
                              .toLowerCase()
                              .replace(/^@+/, '')
                              .replace(/_/g, '-')
                              .replace(/[^a-z0-9-]/g, '')
                              .slice(0, 40)
                          )
                        }
                        placeholder={selectedStore.username}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Customer WhatsApp Contact Line</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editWhatsappPhone}
                        onChange={(e) => setEditWhatsappPhone(e.target.value)}
                        placeholder="e.g. +2348012345678"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Store Since (Year)</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editStoreSince}
                        onChange={(e) => setEditStoreSince(e.target.value)}
                        placeholder="e.g. 2022"
                      />
                    </label>
                    <label className="admin-field admin-field--full">
                      <span>Store Bio / Description</span>
                      <textarea
                        className="admin-input"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Short description of the store…"
                        rows={3}
                        style={{ resize: 'vertical', lineHeight: 1.5 }}
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Country & Currency (Modern Select Dropdowns) */}
                <div className="admin-drawer__section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>Country & Currency</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)' }}>Regional market & billing settings</span>
                  </div>
                  <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                    <label className="admin-field">
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Store Country
                        <span style={{ fontSize: 11, color: 'var(--primary, #25D366)', fontWeight: 500 }}>Auto-syncs currency</span>
                      </span>
                      <SearchableSelect
                        options={COUNTRY_OPTIONS}
                        value={editCountry}
                        onChange={handleCountryChange}
                        placeholder="Select Country..."
                        searchPlaceholder="Search country or code..."
                        triggerStyle={{
                          background: 'var(--surface-2, #1c1c21)',
                          border: '1px solid var(--border-strong, #30303a)',
                          borderRadius: 8,
                          minHeight: 42,
                          fontSize: 14,
                          color: 'var(--text, #f2f2f4)',
                        }}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Operating Currency</span>
                      <SearchableSelect
                        options={CURRENCY_OPTIONS}
                        value={editCurrency}
                        onChange={(val) => setEditCurrency(val)}
                        placeholder="Select Currency..."
                        searchPlaceholder="Search currency (e.g. NGN, USD)..."
                        triggerStyle={{
                          background: 'var(--surface-2, #1c1c21)',
                          border: '1px solid var(--border-strong, #30303a)',
                          borderRadius: 8,
                          minHeight: 42,
                          fontSize: 14,
                          color: 'var(--text, #f2f2f4)',
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 4. Location & Address */}
                <div className="admin-drawer__section">
                  <h3>Physical Location & Address</h3>
                  <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                    <label className="admin-field">
                      <span>State / Region</span>
                      <SearchableSelect
                        options={STATE_REGION_OPTIONS}
                        value={editState}
                        onChange={handleStateChange}
                        placeholder="Select State / Region..."
                        searchPlaceholder="Search states (Lagos, Abuja, Rivers...)..."
                        triggerStyle={{
                          background: 'var(--surface-2, #1c1c21)',
                          border: '1px solid var(--border-strong, #30303a)',
                          borderRadius: 8,
                          minHeight: 42,
                          fontSize: 14,
                          color: 'var(--text, #f2f2f4)',
                        }}
                      />
                    </label>
                    <label className="admin-field">
                      <span>City / Area / District</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editArea}
                        onChange={(e) => handleAreaChange(e.target.value)}
                        placeholder="e.g. Ikeja, Lekki, Victoria Island"
                      />
                    </label>
                    <label className="admin-field admin-field--full">
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Full Store Location Display
                        <span style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)', fontWeight: 400 }}>Shown to buyers on storefront</span>
                      </span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="e.g. Ikeja, Lagos, Nigeria"
                      />
                    </label>
                    <label className="admin-field admin-field--full">
                      <span>Physical Street Address</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="e.g. Suite 12, Victoria Mall, Plot 4"
                      />
                    </label>
                  </div>
                </div>

                {/* 5. Payout Bank Account */}
                <div className="admin-drawer__section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>Payout Bank Account</h3>
                    <button
                      type="button"
                      onClick={() => setCustomBankMode(!customBankMode)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary, #25D366)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {customBankMode ? '← Pick from Bank List' : '✏️ Type custom bank name'}
                    </button>
                  </div>
                  <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                    <label className="admin-field admin-field--full">
                      <span>Bank Name</span>
                      {customBankMode ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            className="admin-input"
                            type="text"
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            placeholder="Enter bank name..."
                            style={{ flex: 1 }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setCustomBankMode(false)}
                            style={{ padding: '0 14px', fontSize: 12, height: 42, whiteSpace: 'nowrap' }}
                          >
                            Back to List
                          </button>
                        </div>
                      ) : (
                        <SearchableSelect
                          options={bankSelectOptions}
                          value={editBankName}
                          onChange={handleBankSelect}
                          placeholder="Select Payout Bank..."
                          searchPlaceholder="Search bank (Access, GTBank, Zenith, OPay...)..."
                          triggerStyle={{
                            background: 'var(--surface-2, #1c1c21)',
                            border: '1px solid var(--border-strong, #30303a)',
                            borderRadius: 8,
                            minHeight: 42,
                            fontSize: 14,
                            color: 'var(--text, #f2f2f4)',
                          }}
                        />
                      )}
                    </label>
                    <label className="admin-field">
                      <span>Account Number</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editBankAccount}
                        onChange={(e) => setEditBankAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder={selectedStore.bank_account_number || '0123456789'}
                        maxLength={10}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Account Name</span>
                      <input
                        className="admin-input"
                        type="text"
                        value={editBankAccountName}
                        onChange={(e) => setEditBankAccountName(e.target.value)}
                        placeholder={selectedStore.bank_account_name || 'Account holder name'}
                      />
                    </label>
                  </div>
                </div>

                {/* 4. Admin Audit Note */}
                <div className="admin-drawer__section">
                  <label className="admin-field">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      Admin Note <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional — logged with change)</span>
                    </span>
                    <textarea
                      className="admin-input"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="e.g. Merchant requested location & contact update via support."
                      rows={2}
                      style={{ resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </label>
                </div>

                {/* Save button */}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={editSaving}
                  onClick={handleSaveMerchantInfo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'center',
                    padding: '12px 20px',
                    fontWeight: 700,
                    fontSize: 14,
                    width: '100%',
                  }}
                >
                  {editSaving ? (
                    <><Loader2 size={16} className="admin-spin" /> Saving Changes…</>
                  ) : (
                    <><Save size={16} /> Save All Changes</>
                  )}
                </button>
              </div>
            ) : (
              <div className="admin-drawer__content">
                <div className="admin-drawer__section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <h3 style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>Store Identity & Location</h3>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('edit')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary, #25D366)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Pencil size={12} /> Edit Details
                    </button>
                  </div>
                  <div className="admin-drawer__grid">
                    <div>
                      <label>Store Name</label>
                      <strong>{selectedStore.store_name}</strong>
                    </div>
                    <div>
                      <label>Handle</label>
                      <span>@{selectedStore.username}</span>
                    </div>
                    <div>
                      <label>Country & Currency</label>
                      <span>
                        {selectedStore.country_code ? `${selectedStore.country_code} · ` : ''}
                        {selectedStore.currency_code || 'NGN'}
                      </span>
                    </div>
                    <div>
                      <label>Location (City / State)</label>
                      <span>{selectedStore.location || 'Not specified'}</span>
                    </div>
                    <div>
                      <label>Physical Address</label>
                      <span>{selectedStore.address || 'Not specified'}</span>
                    </div>
                    <div>
                      <label>Store WhatsApp</label>
                      <span>{selectedStore.whatsapp_phone || selectedStore.user?.phone_number || 'None'}</span>
                    </div>
                    <div>
                      <label>Status</label>
                      <StatusChip tone={selectedStore.is_active ? 'green' : 'red'} label={selectedStore.is_active ? 'Active' : 'Suspended'} />
                    </div>
                    <div>
                      <label>Verification Badge</label>
                      <StatusChip
                        tone={
                          selectedStore.verification_status === 'verified'
                            ? 'green'
                            : selectedStore.verification_status === 'rejected'
                            ? 'red'
                            : 'gray'
                        }
                        label={selectedStore.verification_status || 'unverified'}
                      />
                    </div>
                  </div>
                </div>

                {/* Edit details quick banner */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'var(--surface-2, #1c1c21)',
                    border: '1px solid var(--border-strong, #30303a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--text, #f2f2f4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Pencil size={14} style={{ color: 'var(--primary, #25D366)' }} />
                      Need to edit merchant info or location?
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                      Update name, handle, city/state location, physical address, and contact details.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setInspectorTab('edit')}
                    style={{ flexShrink: 0, padding: '8px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Pencil size={13} />
                    Edit Details
                  </button>
                </div>

                {hasReachedProductLimit(selectedStore) && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(234, 179, 8, 0.08)',
                      border: '1px solid rgba(234, 179, 8, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: '#facc15', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} /> Product limit reached ({freeProductLimit} products)
                      </strong>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                        Notify merchant that they have reached the free tier limit.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                      disabled={sendingLimitEmailFor === selectedStore.id}
                      onClick={() => {
                        openConfirmationDialog(
                          'Send limit-reached email',
                          `Email "${selectedStore.user?.name || selectedStore.store_name}" letting them know they've hit the ${freeProductLimit}-product free plan limit and can upgrade to Pro?`,
                          async () => {
                            await handleSendLimitEmail(selectedStore.id);
                          }
                        );
                      }}
                    >
                      {sendingLimitEmailFor === selectedStore.id ? 'Sending…' : 'Send limit email'}
                    </button>
                  </div>
                )}

                <div className="admin-drawer__section">
                  <h3>Wallet Balances</h3>
                  <div className="admin-drawer__grid admin-drawer__grid--cols-2">
                    <div className="admin-balance-card withdrawable">
                      <label>Withdrawable Balance</label>
                      <strong>{formatMoney(selectedStore.withdrawable_balance, selectedStore.currency_code)}</strong>
                    </div>
                    <div className="admin-balance-card pending">
                      <label>Pending Escrow Balance</label>
                      <strong>{formatMoney(selectedStore.pending_balance, selectedStore.currency_code)}</strong>
                    </div>
                  </div>
                </div>

                <div className="admin-drawer__section">
                  <h3>Trust & Payout Level</h3>
                  <div className="admin-tier-list">
                    {PAYOUT_TIERS.map((tier) => {
                      const isActive = (selectedStore.seller_level ?? 1) === tier.level;
                      const Icon = tier.icon;
                      return (
                        <div key={tier.level} className={`admin-tier-row${isActive ? ' admin-tier-row--active' : ''}`}>
                          <div className="admin-tier-row__icon">
                            <Icon size={16} />
                          </div>
                          <div className="admin-tier-row__info">
                            <strong>Level {tier.level} · {tier.name}</strong>
                            <span>{tier.range}</span>
                          </div>
                          <span className="admin-tier-row__payout">{tier.payout}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-drawer__section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <h3 style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>Merchant details</h3>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('edit')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary, #25D366)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                  <div className="admin-drawer__grid">
                    <div>
                      <label>Owner Name</label>
                      <strong>{selectedStore.user?.name || 'No name'}</strong>
                    </div>
                    <div>
                      <label>Email Address</label>
                      <span>{selectedStore.user?.email || 'No email'}</span>
                    </div>
                    <div>
                      <label>Phone Number</label>
                      <span>{selectedStore.user?.phone_number || 'No phone'}</span>
                    </div>
                    <div>
                      <label>Joined Platform</label>
                      <span>
                        {selectedStore.user?.created_at
                          ? new Date(selectedStore.user.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-drawer__section">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <h3 style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>Payout Bank Account</h3>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('edit')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary, #25D366)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Pencil size={12} /> {selectedStore.bank_account_number ? 'Edit Bank' : '+ Add Bank'}
                    </button>
                  </div>
                  {selectedStore.bank_account_number ? (
                    <div className="admin-drawer__grid">
                      <div>
                        <label>Bank Name</label>
                        <strong>{selectedStore.bank_name || 'N/A'}</strong>
                      </div>
                      <div>
                        <label>Account Number</label>
                        <span>{selectedStore.bank_account_number}</span>
                      </div>
                      <div>
                        <label>Account Name</label>
                        <span>{selectedStore.bank_account_name || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-muted)' }}>
                      No payout bank account configured yet. Click &quot;+ Add Bank&quot; to configure payout credentials.
                    </div>
                  )}
                </div>

              <div className="admin-drawer__section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <h3 style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>Customer Payment Account (Dedicated Account)</h3>
                  {needsDedicatedAccount(selectedStore) && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      disabled={generatingDvaFor === selectedStore.id}
                      onClick={() => {
                        openConfirmationDialog(
                          'Generate dedicated account',
                          `Generate a Paystack dedicated account for "${selectedStore.store_name}"? The merchant will be notified by email once it's ready.`,
                          async () => {
                            await handleGenerateDva(selectedStore.id);
                          }
                        );
                      }}
                    >
                      <Landmark size={13} />
                      {generatingDvaFor === selectedStore.id ? 'Generating…' : 'Generate DVA'}
                    </button>
                  )}
                </div>
                {selectedStore.paystack_dva_active && selectedStore.paystack_dva_account_number ? (
                  <div className="admin-drawer__grid">
                    <div>
                      <label>Bank Name</label>
                      <strong>{selectedStore.paystack_dva_bank_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <label>Account Number</label>
                      <span>{selectedStore.paystack_dva_account_number}</span>
                    </div>
                    <div>
                      <label>Account Name</label>
                      <span>{selectedStore.paystack_dva_account_name || 'N/A'}</span>
                    </div>
                    <div>
                      <label>Status</label>
                      <StatusChip tone="green" label="Active" />
                    </div>
                  </div>
                ) : (
                  <EmptyState label="No dedicated account generated yet." />
                )}
              </div>

              <div className="admin-drawer__section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Palette size={16} /> Storefront Color & Branding
                  </h3>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-2, #d4d4d8)' }}>
                    {drawerColor}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: 0, marginBottom: 14 }}>
                  Controls buttons, highlights, badges, and accents on this merchant&apos;s customer storefront.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Presets */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted, #8b8b9a)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                      Color Presets
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {STORE_COLOR_PRESETS.map((preset) => {
                        const isSelected = drawerColor.toLowerCase() === preset.value.toLowerCase();
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setDrawerColor(preset.value)}
                            title={`${preset.name} (${preset.value})`}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: preset.value,
                              border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                              boxShadow: isSelected ? '0 0 0 2px var(--surface, #141417), 0 2px 8px rgba(0,0,0,0.4)' : 'none',
                              cursor: 'pointer',
                              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                              transition: 'transform 0.15s ease, border-color 0.15s ease',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Picker & Input */}
                  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 10, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={drawerColor.startsWith('#') && (drawerColor.length === 7 || drawerColor.length === 4) ? drawerColor : '#25D366'}
                      onChange={(e) => setDrawerColor(e.target.value)}
                      style={{
                        width: 44,
                        height: 38,
                        borderRadius: 8,
                        border: '1px solid var(--border-strong, #30303a)',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 2,
                      }}
                      aria-label="Store color picker"
                    />
                    <input
                      type="text"
                      value={drawerColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setDrawerColor(val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          setDrawerColor(`#${val}`);
                        }
                      }}
                      placeholder="#25D366"
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 13,
                        background: 'var(--surface-2, #1c1c21)',
                        border: '1px solid var(--border-strong, #30303a)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        color: 'var(--text, #f2f2f4)',
                        height: 38,
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      className="admin-action"
                      disabled={savingColorFor === selectedStore.id || drawerColor.toLowerCase() === (selectedStore.primary_color || '#25D366').toLowerCase()}
                      onClick={() => handleUpdateStoreColor(selectedStore.id, drawerColor)}
                      style={{ height: 38, padding: '0 14px' }}
                    >
                      <Palette size={15} />
                      {savingColorFor === selectedStore.id ? 'Saving…' : 'Save Color'}
                    </button>
                  </div>

                  {/* Live Preview Card */}
                  <div
                    style={{
                      borderRadius: 12,
                      padding: '14px 16px',
                      background: `linear-gradient(135deg, ${drawerColor} 0%, color-mix(in srgb, ${drawerColor} 40%, #0a0a0d) 100%)`,
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      boxShadow: `0 6px 20px ${drawerColor}30`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
                        Live Storefront Accent Preview
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 999 }}>
                        @{selectedStore.username}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: '#ffffff', color: drawerColor, fontSize: 12, fontWeight: 800 }}>
                        Order on WhatsApp
                      </span>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.18)', color: '#ffffff', fontSize: 12, fontWeight: 700 }}>
                        Featured Catalog
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-drawer__section">
                <h3>Nina Assistant Avatar</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: -4, marginBottom: 12 }}>
                  Admin-controlled — merchants can no longer change this photo themselves.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={selectedStore.nina_avatar_url || '/ninaAssistant.png'}
                    alt="Nina avatar"
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line, #e2e8f0)' }}
                  />
                  <label
                    className="btn btn-outline"
                    style={{ cursor: uploadingNinaAvatarFor === selectedStore.id ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Upload size={15} />
                    {uploadingNinaAvatarFor === selectedStore.id ? 'Uploading…' : 'Upload new photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      style={{ display: 'none' }}
                      disabled={uploadingNinaAvatarFor === selectedStore.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (file) handleNinaAvatarFile(selectedStore.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

            <div
              className="admin-drawer__actions"
              style={{
                display: 'grid',
                gridTemplateColumns: inspectorTab === 'edit' ? '1fr 1.5fr' : 'repeat(4, 1fr)',
                gap: 8,
                padding: '16px 20px',
              }}
            >
              {inspectorTab === 'edit' ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setInspectorTab('overview')}
                    style={{ minWidth: 0, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={editSaving}
                    onClick={handleSaveMerchantInfo}
                    style={{ minWidth: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {editSaving ? (
                      <><Loader2 size={15} className="admin-spin" /> Saving…</>
                    ) : (
                      <><Save size={15} /> Save Changes</>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedStore(null)}
                    style={{
                      minWidth: 0,
                      padding: '10px 4px',
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setInspectorTab('edit')}
                    style={{
                      minWidth: 0,
                      padding: '10px 4px',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className={selectedStore.is_active ? 'btn btn-primary btn-danger-tone' : 'btn btn-primary'}
                    onClick={() => {
                      openConfirmationDialog(
                        selectedStore.is_active ? 'Suspend store' : 'Activate store',
                        `Are you sure you want to ${selectedStore.is_active ? 'suspend' : 'activate'} "${selectedStore.store_name}"?`,
                        async () => {
                          await handleToggleStoreStatus(selectedStore.id);
                          setSelectedStore((prev) => (prev ? { ...prev, is_active: !prev.is_active } : null));
                        }
                      );
                    }}
                    style={{
                      minWidth: 0,
                      padding: '10px 4px',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Power size={13} />
                    {selectedStore.is_active ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-danger-tone"
                    onClick={() => {
                      openConfirmationDialog(
                        'Delete store',
                        `This permanently deletes "${selectedStore.store_name}" and logs the merchant out of their dashboard. This cannot be undone.`,
                        async () => {
                          await handleDeleteStore(selectedStore.id);
                        }
                      );
                    }}
                    style={{
                      minWidth: 0,
                      padding: '10px 4px',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
