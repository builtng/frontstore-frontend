'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Sparkles, Zap, Link, BarChart3, Globe,
  Store, Star, ArrowRight, CheckCircle2, User, LogOut,
  Package, ShoppingBag, Settings, Share2, Copy, Plus, Tag,
  Trash2, Edit2, AlertCircle, Check, Loader2, Phone, Megaphone,
  DollarSign, Calendar, MapPin, Receipt, Menu, X, ArrowUpRight,
  TrendingUp, RefreshCw, Smartphone, Camera, Image as ImageIcon, ChevronDown,
  Download, FileText, ExternalLink, Shield, Rocket, BadgeCheck,
  ArrowUp, ArrowDown, Facebook, Twitter, Music2, Eye, EyeOff, Key
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import SearchableSelect from '../../components/SearchableSelect';
import ThemeToggle from '../../components/ThemeToggle';

// --- Currency Configuration ---
const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  USD: '$',
  GBP: '£'
};

const getCurrencySymbol = (code?: string): string => {
  if (!code) return CURRENCY_SYMBOLS['NGN'];
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? `${code} `;
};

// --- Type Definitions ---
interface UserInfo {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  plan?: string;
}

interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface StoreInfo {
  id: string;
  store_name: string;
  store_bio: string | null;
  currency_code: string;
  whatsapp_phone: string;
  username: string;
  logo_url?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  is_active?: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  payment_instructions?: string | null;
  paystack_bank_code?: string | null;
  bank_account_verified?: boolean;
  paystack_dva_bank_name?: string | null;
  paystack_dva_account_number?: string | null;
  paystack_dva_account_name?: string | null;
  paystack_dva_currency?: string | null;
  paystack_dva_active?: boolean;
  custom_links?: StoreLink[] | null;
  custom_domain?: string | null;
  primary_color?: string | null;
  store_template?: string | null;
  is_pro?: boolean;
  catalog_label?: string | null;
  category_label?: string | null;
  template_highlight_label?: string | null;
  product_section_eyebrow?: string | null;
  product_section_title?: string | null;
  featured_carousel_enabled?: boolean;
  featured_carousel_eyebrow?: string | null;
  featured_carousel_title?: string | null;
  featured_product_ids?: string[] | null;
  verification_status?: string | null;
  verification_document_type?: string | null;
  verification_document_url?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_status: string;
  category_id?: string | null;
  category?: Category | null;
  description: string | null;
  image_urls?: string[];
  views_count?: number;
  is_digital?: boolean;
  digital_file_url?: string | null;
  digital_link?: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number | string;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string | null;
  delivery_method?: string | null;
  delivery_address?: string | null;
  total_amount: number | string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items?: OrderItem[];
}

interface DashboardStats {
  revenue: number;
  counts: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  top_products: Array<{
    product_name: string;
    total_sold: number;
    orders_count: number;
  }>;
  metrics: {
    total_views: number;
    whatsapp_redirects: number;
    conversion_rate: number;
  };
}

type DashboardTab = 'overview' | 'orders' | 'products' | 'whatsapp' | 'share' | 'templates' | 'settings' | 'billing' | 'wallet' | 'reach';

const DASHBOARD_TABS: DashboardTab[] = ['overview', 'orders', 'products', 'whatsapp', 'share', 'templates', 'settings', 'billing', 'wallet'];

const getDashboardTabFromUrl = (): DashboardTab => {
  if (typeof window === 'undefined') return 'overview';
  const tab = new URLSearchParams(window.location.search).get('page');
  return DASHBOARD_TABS.includes(tab as DashboardTab) ? tab as DashboardTab : 'overview';
};

const countries = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

const storeTemplates = [
  {
    id: 'luxe-market',
    name: 'Luxe Market',
    tone: 'Premium boutique',
    description: 'Large cinematic header, polished trust row, balanced catalog cards.',
    colors: ['#10b981', '#0f172a', '#f59e0b'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tone: 'Magazine commerce',
    description: 'Story-led layout for fashion, beauty, food, and lifestyle brands.',
    colors: ['#b42318', '#fbfaf7', '#0f766e'],
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    tone: 'Promo engine',
    description: 'Bold deal energy for drops, discounts, campaigns, and fast checkout.',
    colors: ['#e11d48', '#f59e0b', '#190915'],
  },
  {
    id: 'atelier',
    name: 'Atelier',
    tone: 'Minimal studio',
    description: 'Quiet, gallery-like storefront for handcrafted or premium goods.',
    colors: ['#27272a', '#f7f7f5', '#0e7490'],
  },
  {
    id: 'digital-studio',
    name: 'Digital Studio',
    tone: 'Digital products',
    description: 'Optimized for files, courses, services, templates, and creators.',
    colors: ['#2563eb', '#14b8a6', '#07152f'],
  },
  {
    id: 'whatsapp-native',
    name: 'WhatsApp Native',
    tone: 'Chat-first',
    description: 'Feels close to WhatsApp with rounded CTAs and chat-led buying.',
    colors: ['#128c7e', '#25d366', '#f3fbf6'],
  },
];

const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { country: countries[0], local: '' };
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const cleaned = fullPhone.replace(/[^\d+]/g, '');
  for (const c of sortedCountries) {
    if (cleaned.startsWith(c.dialCode)) {
      return { country: c, local: cleaned.slice(c.dialCode.length) };
    }
    const dialWithoutPlus = c.dialCode.slice(1);
    if (cleaned.startsWith(dialWithoutPlus)) {
      return { country: c, local: cleaned.slice(dialWithoutPlus.length) };
    }
  }
  return { country: countries[0], local: cleaned };
};

export default function DashboardPage() {
  const router = useRouter();
  const isDev = process.env.NODE_ENV !== 'production';

  // --- Auth & API Settings State ---
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const isPro = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [systemDomain, setSystemDomain] = useState('frontstore.app');
  const [apiUrl, setApiUrl] = useState('https://api.frontstore.app/api');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Dashboard Data State ---
  const [activeTab, setActiveTab] = useState<DashboardTab>(getDashboardTabFromUrl);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Wallet and Payouts States
  const [walletBalances, setWalletBalances] = useState({
    withdrawable_balance: 0,
    pending_balance: 0,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    bank_account_verified: false
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Loading states
  const [dataLoading, setDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mobile navigation overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Billing Cycle state for Pro Subscription Plan
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');


  // --- Active Dialog/Modal States ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Quick discount campaign modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('10');

  // --- Form Input States ---
  // Add/Edit Product Form
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('in_stock');
  const [prodImageUrls, setProdImageUrls] = useState<string[]>([]);
  const [prodImageUploading, setProdImageUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [productPublishing, setProductPublishing] = useState(false);
  // Digital product states
  const [prodIsDigital, setProdIsDigital] = useState(false);
  const [prodDigitalFileUrl, setProdDigitalFileUrl] = useState('');
  const [prodDigitalLink, setProdDigitalLink] = useState('');
  const [prodDigitalUploading, setProdDigitalUploading] = useState(false);

  // Settings Form
  const [setStoreName, setSetStoreName] = useState('');
  const [setStoreBio, setSetStoreBio] = useState('');
  const [localWhatsapp, setLocalWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number | null>(null);
  const [setInstagram, setSetInstagram] = useState('');
  const [setTiktok, setSetTiktok] = useState('');
  const [setCurrency, setSetCurrency] = useState('NGN');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [customLinks, setCustomLinks] = useState<StoreLink[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [selectedTemplate, setSelectedTemplate] = useState('luxe-market');
  const [catalogLabel, setCatalogLabel] = useState('product');
  const [categoryLabel, setCategoryLabel] = useState('collection');
  const [templateHighlightLabel, setTemplateHighlightLabel] = useState('');
  const [productSectionEyebrow, setProductSectionEyebrow] = useState('Catalog');
  const [productSectionTitle, setProductSectionTitle] = useState('');
  const [featuredCarouselEnabled, setFeaturedCarouselEnabled] = useState(true);
  const [featuredCarouselEyebrow, setFeaturedCarouselEyebrow] = useState('Featured now');
  const [featuredCarouselTitle, setFeaturedCarouselTitle] = useState('Fresh picks from the catalog');
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);
  const [templateSaving, setTemplateSaving] = useState<string | null>(null);
  // Form states for adding/editing a link
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPlatform, setLinkPlatform] = useState('custom');
  const [linkActive, setLinkActive] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  // Payment Account Form
  const [paymentBankName, setPaymentBankName] = useState('');
  const [paymentBankCode, setPaymentBankCode] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [paymentAccountName, setPaymentAccountName] = useState(''); // read-only after verify
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [paymentCopied, setPaymentCopied] = useState(false);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  // Paystack bank list fetched from API
  const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [accountVerified, setAccountVerified] = useState(false);
  const [nameMatchOk, setNameMatchOk] = useState<boolean | null>(null);

  // Developer Endpoint Form
  const [devApiInput, setDevApiInput] = useState('');

  const navigateDashboardTab = (tab: DashboardTab, replace = false) => {
    setActiveTab(tab);
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (tab === 'overview') {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', tab);
    }
    url.searchParams.delete('reference');
    url.searchParams.delete('trxref');

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    if (replace) {
      window.history.replaceState({ page: tab }, '', nextUrl);
    } else {
      window.history.pushState({ page: tab }, '', nextUrl);
    }
  };

  const openUpgradePrompt = (title: string, description: string) => {
    setUpgradePrompt({ title, description });
  };

  const goToBillingFromPrompt = () => {
    setUpgradePrompt(null);
    navigateDashboardTab('billing');
  };

  // Custom Domain Mapping Form
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [customDomainSaving, setCustomDomainSaving] = useState(false);
  const [customDomainBypassDNS, setCustomDomainBypassDNS] = useState(false);

  // Change Password Form
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpSaving, setCpSaving] = useState(false);
  const [showCpCurrent, setShowCpCurrent] = useState(false);
  const [showCpNew, setShowCpNew] = useState(false);
  const [showCpConfirm, setShowCpConfirm] = useState(false);

  // Paystack subscription payment state
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isGeneratingDedicatedAccount, setIsGeneratingDedicatedAccount] = useState(false);

  // --- AI Command Bar State ---
  const [aiCommand, setAiCommand] = useState('');
  const [aiResponseBubble, setAiResponseBubble] = useState<string | null>(null);

  // --- WhatsApp Sales Inbox State ---
  const [waOrders, setWaOrders] = useState<Order[]>([]);
  const [waLoading, setWaLoading] = useState(false);
  const [selectedWaOrder, setSelectedWaOrder] = useState<Order | null>(null);
  const [waSearch, setWaSearch] = useState('');
  const [activeWaView, setActiveWaView] = useState<'list' | 'chat'>('list');

  // Sample stock images for products
  const STOCK_IMAGE_OPTIONS = [
    { name: 'Dashiki Shirt', url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600' },
    { name: 'Leather Shoes', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600' },
    { name: 'Royal Bracelet', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600' },
    { name: 'Fashion Dress', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
    { name: 'Ankara Bag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' }
  ];

  // Replaced by dynamic bank list fetched from Paystack via backend

  // --- Auth verification & Initial load ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedStore = localStorage.getItem('store');
      const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

      setApiUrl(savedApiUrl);
      setDevApiInput(savedApiUrl);

      const triggerRedirect = (reason?: string) => {
        // Clear all stored data when logging out due to account verification failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('store');
        if (reason) {
          console.warn(`Account verification failed: ${reason}`);
          toast.error('Your session has expired. Please log in again.');
        }
        router.replace('/login');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        }, 1000);
      };

      const verifyAccountExists = async (token: string, apiUrl: string) => {
        try {
          const response = await fetch(`${apiUrl}/v1/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              triggerRedirect('Unauthorized access - token invalid or expired');
              return false;
            } else if (response.status === 404) {
              triggerRedirect('Account not found - account may have been deleted');
              return false;
            } else {
              triggerRedirect(`Account verification failed with status ${response.status}`);
              return false;
            }
          }

          const data = await response.json();
          if (!data.data || !data.data.user) {
            triggerRedirect('Account data is missing - account may have been deleted');
            return false;
          }

          return true;
        } catch (error) {
          console.error('Network error during account verification:', error);
          triggerRedirect('Network error during account verification');
          return false;
        }
      };

      if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Verify the account exists on the server before loading the dashboard
          verifyAccountExists(storedToken, savedApiUrl).then((accountExists) => {
            if (!accountExists) {
              setIsAuthChecking(false);
              return; // triggerRedirect has already been called
            }

            setToken(storedToken);
            setUser(parsedUser);

            const storedSystemDomain = localStorage.getItem('system_domain') || 'frontstore.app';
            setSystemDomain(storedSystemDomain);

            if (storedStore && storedStore !== 'undefined' && storedStore !== 'null') {
              const parsedStore = JSON.parse(storedStore);
              setStore(parsedStore);
              // Prefill settings form
              setSetStoreName(parsedStore.store_name || '');
              setSetStoreBio(parsedStore.store_bio || '');
              const parsedPhone = parsePhoneNumber(parsedStore.whatsapp_phone || '');
              setSelectedCountry(parsedPhone.country);
              setLocalWhatsapp(parsedPhone.local);
              setSetInstagram(parsedStore.instagram_handle || '');
              setSetTiktok(parsedStore.tiktok_handle || '');
              setSetCurrency(parsedStore.currency_code || 'NGN');
              setPaymentBankName(parsedStore.bank_name || '');
              setPaymentBankCode(parsedStore.paystack_bank_code || '');
              setPaymentAccountNumber(parsedStore.bank_account_number || '');
              setPaymentAccountName(parsedStore.bank_account_name || '');
              setPaymentInstructions(parsedStore.payment_instructions || '');
              setAccountVerified(!!parsedStore.bank_account_verified);
              setNameMatchOk(parsedStore.bank_account_verified ? true : null);
              setLogoUrl(parsedStore.logo_url || null);
              setCustomLinks(parsedStore.custom_links || []);
              setPrimaryColor(parsedStore.primary_color || '#10b981');
              setSelectedTemplate(parsedStore.store_template || 'luxe-market');
              setCatalogLabel(parsedStore.catalog_label || 'product');
              setCategoryLabel(parsedStore.category_label || 'collection');
              setTemplateHighlightLabel(parsedStore.template_highlight_label || '');
              setProductSectionEyebrow(parsedStore.product_section_eyebrow || 'Catalog');
              setProductSectionTitle(parsedStore.product_section_title || '');
              setFeaturedCarouselEnabled(parsedStore.featured_carousel_enabled !== false);
              setFeaturedCarouselEyebrow(parsedStore.featured_carousel_eyebrow || 'Featured now');
              setFeaturedCarouselTitle(parsedStore.featured_carousel_title || 'Fresh picks from the catalog');
              setFeaturedProductIds((parsedStore.featured_product_ids || []).slice(0, 5));
            }
            setIsAuthenticated(true);
            setIsAuthChecking(false);
          });
        } catch (e) {
          console.error("Failed to parse stored user or store:", e);
          triggerRedirect('Failed to parse user data');
          setIsAuthChecking(false);
        }
      } else {
        triggerRedirect();
        setIsAuthChecking(false);
      }
    }
  }, [router]);

  useEffect(() => {
    const syncTabFromUrl = () => setActiveTab(getDashboardTabFromUrl());
    syncTabFromUrl();
    window.addEventListener('popstate', syncTabFromUrl);
    return () => window.removeEventListener('popstate', syncTabFromUrl);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutsideClick = () => {
      setIsCountryDropdownOpen(false);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isCountryDropdownOpen]);

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
    const url = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
    fetch(`${url}/v1/payments/banks`)
      .then(r => r.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setBankList(json.data);
        }
      })
      .catch(() => { }); // silently fail — dropdown still works with empty list
  }, []);

  // Auto-verify Paystack payment when user returns from checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) return;

    // Remove payment query params immediately while keeping the user on Billing.
    const cleanUrl = `${window.location.pathname}?page=billing`;
    window.history.replaceState({ page: 'billing' }, '', cleanUrl);
    setActiveTab('billing');

    const token = localStorage.getItem('token');
    if (!token) return;

    const verifyPayment = async () => {
      setIsVerifyingPayment(true);
      try {
        const url = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
        const res = await fetch(`${url}/v1/payments/verify-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reference }),
        });
        const json = await res.json();
        if (res.ok && json.data?.user) {
          setUser(json.data.user);
          localStorage.setItem('user', JSON.stringify(json.data.user));
          if (json.data.store) {
            setStore(json.data.store);
            localStorage.setItem('store', JSON.stringify(json.data.store));
          }
          if (json.system_domain) {
            setSystemDomain(json.system_domain);
            localStorage.setItem('system_domain', json.system_domain);
          }
          toast.success('🎉 Payment verified! Your Pro plan is now active.');
          navigateDashboardTab('billing', true);
        } else {
          toast.error(json.message || 'Payment verification failed. Contact support.');
        }
      } catch {
        toast.error('Could not verify payment. Please try again or contact support.');
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        headers: getAuthHeaders(),
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

  // Headers helper
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // Fetch metrics, orders, products
  const loadAllData = async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setDataLoading(true);
      else setIsRefreshing(true);

      const [statsRes, productsRes, ordersRes, categoriesRes, storeRes] = await Promise.all([
        fetch(`${apiUrl}/v1/orders/stats`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/products`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/orders`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/categories`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/store`, { headers: getAuthHeaders() })
      ]);

      const statsJson = await statsRes.json();
      const productsJson = await productsRes.json();
      const ordersJson = await ordersRes.json();
      const categoriesJson = await categoriesRes.json();
      const storeJson = await storeRes.json();

      if (statsRes.ok) setStats(statsJson.data);
      if (productsRes.ok) setProducts(productsJson.data?.data || productsJson.data || []);
      if (ordersRes.ok) setOrders(ordersJson.data?.data || ordersJson.data || []);
      if (categoriesRes.ok) setCategories(categoriesJson.data || []);

      if (storeRes.ok && storeJson.data) {
        const liveStore = storeJson.data;
        setStore(liveStore);
        localStorage.setItem('store', JSON.stringify(liveStore));
        if (storeJson.system_domain) {
          setSystemDomain(storeJson.system_domain);
          localStorage.setItem('system_domain', storeJson.system_domain);
        }
        setSetStoreName(liveStore.store_name || '');
        setSetStoreBio(liveStore.store_bio || '');
        const parsedPhone = parsePhoneNumber(liveStore.whatsapp_phone || '');
        setSelectedCountry(parsedPhone.country);
        setLocalWhatsapp(parsedPhone.local);
        setSetInstagram(liveStore.instagram_handle || '');
        setSetTiktok(liveStore.tiktok_handle || '');
        setSetCurrency(liveStore.currency_code || 'NGN');
        setPaymentBankName(liveStore.bank_name || '');
        setPaymentBankCode(liveStore.paystack_bank_code || '');
        setPaymentAccountNumber(liveStore.bank_account_number || '');
        setPaymentAccountName(liveStore.bank_account_name || '');
        setPaymentInstructions(liveStore.payment_instructions || '');
        setAccountVerified(!!liveStore.bank_account_verified);
        setNameMatchOk(liveStore.bank_account_verified ? true : null);
        setLogoUrl(liveStore.logo_url || null);
        setCustomLinks(liveStore.custom_links || []);
        setPrimaryColor(liveStore.primary_color || '#10b981');
        setSelectedTemplate(liveStore.store_template || 'luxe-market');
        setCatalogLabel(liveStore.catalog_label || 'product');
        setCategoryLabel(liveStore.category_label || 'collection');
        setTemplateHighlightLabel(liveStore.template_highlight_label || '');
        setProductSectionEyebrow(liveStore.product_section_eyebrow || 'Catalog');
        setProductSectionTitle(liveStore.product_section_title || '');
        setFeaturedCarouselEnabled(liveStore.featured_carousel_enabled !== false);
        setFeaturedCarouselEyebrow(liveStore.featured_carousel_eyebrow || 'Featured now');
        setFeaturedCarouselTitle(liveStore.featured_carousel_title || 'Fresh picks from the catalog');
        setFeaturedProductIds((liveStore.featured_product_ids || []).slice(0, 5));
      }

    } catch (e) {
      console.error(e);
      toast.error('Failed to load live data. Please check your backend connection.');
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, apiUrl]);

  // Verification states
  const [verificationDocType, setVerificationDocType] = useState('national_id');
  const [verificationDocUrl, setVerificationDocUrl] = useState('');
  const [verificationUploading, setVerificationUploading] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  const fetchWalletData = async () => {
    if (!token) return;
    try {
      setWalletLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/wallet`, {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setWalletBalances({
          withdrawable_balance: json.data.withdrawable_balance,
          pending_balance: json.data.pending_balance,
          bank_name: json.data.bank_name || '',
          bank_account_number: json.data.bank_account_number || '',
          bank_account_name: json.data.bank_account_name || '',
          bank_account_verified: !!json.data.bank_account_verified
        });
        setWithdrawals(json.data.withdrawals || []);
      }
    } catch (e) {
      toast.error('Failed to load wallet information.');
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [isAuthenticated, activeTab]);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.warning('Please enter a valid amount.');
      return;
    }
    if (amt > walletBalances.withdrawable_balance) {
      toast.error('Amount exceeds your withdrawable balance.');
      return;
    }
    try {
      setWithdrawalSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: amt })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Withdrawal request submitted.');
        setWithdrawalAmount('');
        setIsWithdrawModalOpen(false);
        fetchWalletData();
        loadAllData(true);
      } else {
        toast.error(json.message || 'Failed to submit withdrawal request.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setWithdrawalSubmitting(false);
    }
  };

  const handleUploadVerificationDoc = async (file: File) => {
    try {
      setVerificationUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.url) {
        setVerificationDocUrl(json.url);
        toast.success('Document uploaded successfully! 📄');
      } else {
        throw new Error(json.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Document upload error');
    } finally {
      setVerificationUploading(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDocUrl) {
      toast.warning('Please upload a document first.');
      return;
    }
    try {
      setIsSubmittingVerification(true);
      const res = await fetch(`${apiUrl}/v1/store/verify-request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          document_type: verificationDocType,
          document_url: verificationDocUrl
        })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Verification request submitted.');
        loadAllData(true);
      } else {
        toast.error(json.message || 'Failed to submit request.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // --- AI Command Bar Submit handler ---
  const handleAiCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCommand.trim()) return;

    const text = aiCommand.toLowerCase().trim();
    setAiCommand('');

    if (text.includes('add') || text.includes('product') || text.includes('sell') || text.includes('list') || text.includes('create product')) {
      setAiResponseBubble(`✨ AI Assistant: Opening product creation forms for you...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        openAddProductModal();
      }, 1200);
    } else if (text.includes('discount') || text.includes('coupon') || text.includes('promo')) {
      setAiResponseBubble(`✨ AI Assistant: Launching discount campaign helper...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        setIsDiscountModalOpen(true);
      }, 1000);
    } else if (text.includes('order') || text.includes('sale') || text.includes('shipping')) {
      setAiResponseBubble(`✨ AI Assistant: Redirecting to Orders section...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        navigateDashboardTab('orders');
      }, 1000);
    } else if (text.includes('chat') || text.includes('whatsapp') || text.includes('simulator') || text.includes('message')) {
      setAiResponseBubble(`✨ AI Assistant: The WhatsApp Simulator is disabled for this environment. Share your store link to receive live customer checkouts!`);
      setTimeout(() => {
        setAiResponseBubble(null);
      }, 4000);
    } else if (text.includes('setting') || text.includes('bio') || text.includes('phone')) {
      setAiResponseBubble(`✨ AI Assistant: Navigating to settings...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        navigateDashboardTab('settings');
      }, 1000);
    } else {
      setAiResponseBubble(`💡 AI Coach: I can help you add products, launch discounts, inspect orders, or update settings. Try typing "Add product" or "view orders".`);
      setTimeout(() => setAiResponseBubble(null), 5500);
    }
  };

  // Quick 10% discount handler
  const handleApplyQuickDiscount = () => {
    setIsDiscountModalOpen(false);
    toast.success(`Discount of ${discountPercent}% applied! 🏷️`);

    // Simulate updating conversion stats
    if (stats) {
      setStats({
        ...stats,
        metrics: {
          ...stats.metrics,
          conversion_rate: parseFloat((stats.metrics.conversion_rate * 1.2).toFixed(1))
        }
      });
    }
  };

  // --- Add / Edit Product CRUD Handlers ---
  const openAddProductModal = () => {
    if (!isPro && products.length >= 3) {
      openUpgradePrompt(
        'Unlimited products require Pro',
        'Free stores can publish up to 3 products. Upgrade to Pro when you are ready to list more products and scale your catalog.'
      );
      return;
    }
    setProdName('');
    setProdPrice('');
    setProdComparePrice('');
    setProdCategory(categories[0]?.id || '');
    setProdDesc('');
    setProdStock('in_stock');
    setProdImageUrls([]);
    setProdIsDigital(false);
    setProdDigitalFileUrl('');
    setProdDigitalLink('');
    setIsAddProductOpen(true);
  };

  const handleGenerateAIDescription = async () => {
    if (user?.plan === 'free' || !user?.plan) {
      openUpgradePrompt(
        'AI product writing requires Pro',
        'Generate richer product descriptions automatically with AI. You can keep editing manually on Free, or upgrade when you want AI assistance.'
      );
      return;
    }

    if (!prodName.trim()) {
      toast.warning('Enter a product name first to generate details!');
      return;
    }

    try {
      setAiGenerating(true);
      const activeCat = categories.find(c => c.id === prodCategory);

      const res = await fetch(`${apiUrl}/v1/ai/generate-description`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_name: prodName,
          category_hint: activeCat ? activeCat.name : 'General',
          description_context: prodDesc
        })
      });

      const json = await res.json();
      if (res.ok && json.data?.description) {
        setProdDesc(json.data.description);
        toast.success('Description written by ChatGPT AI! 🧠✨');
      } else {
        throw new Error(json.message || 'Description generation failed.');
      }
    } catch (e: any) {
      console.error(e);
      // Fallback description in case of server failure
      const fallback = `Premium quality ${prodName}.\n\nHandcrafted design, breathable materials, perfect for all occasions.\nHandcrafted local inventory. Available now!`;
      setProdDesc(fallback);
      toast.info('Loaded visual fallback description outline.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateAIImage = async () => {
    if (user?.plan === 'free' || !user?.plan) {
      openUpgradePrompt(
        'AI image generation requires Pro',
        'Create product images with AI from your product name and description. You can still upload your own images on Free.'
      );
      return;
    }

    if (!prodName.trim()) {
      toast.warning('Enter a product name first to generate an image!');
      return;
    }

    // Check if an AI generated image is already present in the list
    const hasAiImage = prodImageUrls.some(url => url.includes('/products/ai_'));
    if (hasAiImage) {
      toast.warning('Pro plan is limited to generating exactly 1 AI image per product.');
      return;
    }

    try {
      setAiImageGenerating(true);
      const res = await fetch(`${apiUrl}/v1/ai/generate-image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_name: prodName,
          description: prodDesc
        })
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
        toast.success('Product image generated by AI! 🎨✨');
      } else {
        throw new Error(json.message || 'Image generation failed.');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'AI Image generation failed.');
    } finally {
      setAiImageGenerating(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      toast.error('Product name and price are required.');
      return;
    }

    try {
      setProductPublishing(true);
      const payload = {
        name: prodName,
        price: parseFloat(prodPrice),
        compare_at_price: prodComparePrice ? parseFloat(prodComparePrice) : null,
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
        is_draft: false,
        image_urls: prodImageUrls,
        is_digital: prodIsDigital,
        digital_file_url: prodIsDigital ? (prodDigitalFileUrl || null) : null,
        digital_link: prodIsDigital ? (prodDigitalLink || null) : null,
      };

      const res = await fetch(`${apiUrl}/v1/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Product published to storefront! 🚀');
        setIsAddProductOpen(false);
        loadAllData(true);
      } else {
        throw new Error(json.message || 'Failed to publish product');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred publishing product.');
    } finally {
      setProductPublishing(false);
    }
  };

  const handleEditProductClick = (product: Product) => {
    setSelectedProduct(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdComparePrice(product.compare_at_price?.toString() || '');
    setProdCategory(product.category_id || categories[0]?.id || '');
    setProdDesc(product.description || '');
    setProdStock(product.stock_status);
    setProdImageUrls(product.image_urls || []);
    setProdIsDigital(product.is_digital ?? false);
    setProdDigitalFileUrl(product.digital_file_url || '');
    setProdDigitalLink(product.digital_link || '');
    setIsEditProductOpen(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setProductPublishing(true);
      const payload = {
        name: prodName,
        price: parseFloat(prodPrice),
        compare_at_price: prodComparePrice ? parseFloat(prodComparePrice) : null,
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
        image_urls: prodImageUrls,
        is_digital: prodIsDigital,
        digital_file_url: prodIsDigital ? (prodDigitalFileUrl || null) : null,
        digital_link: prodIsDigital ? (prodDigitalLink || null) : null,
      };

      const res = await fetch(`${apiUrl}/v1/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Product updated successfully! 📝');
        setIsEditProductOpen(false);
        loadAllData(true);
      } else {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update product');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred saving product changes.');
    } finally {
      setProductPublishing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is permanent.')) return;
    try {
      const res = await fetch(`${apiUrl}/v1/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        toast.success('Product removed from store.');
        loadAllData(true);
      } else {
        throw new Error('Deletion failed.');
      }
    } catch {
      toast.error('Could not delete product.');
    }
  };

  // --- Order Management Status Updates ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ order_status: status })
      });
      if (res.ok) {
        toast.success(`Order status updated to ${status.toUpperCase()}!`);
        // If details modal is open, update selected order
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: status });
        }
        loadAllData(true);
      } else {
        throw new Error('Failed to update status.');
      }
    } catch {
      toast.error('Could not update order status.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ payment_status: status })
      });
      if (res.ok) {
        toast.success(`Payment status updated to ${status.toUpperCase()}!`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, payment_status: status });
        }
        loadAllData(true);
      } else {
        throw new Error('Failed to update status.');
      }
    } catch {
      toast.error('Could not update payment status.');
    }
  };

  // --- WhatsApp Sales Inbox: Load real WA orders ---
  const loadWaOrders = async () => {
    if (!token) return;
    setWaLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/orders?payment_method=whatsapp&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data?.data) {
        setWaOrders(json.data.data);
        // Auto-select first order if none selected
        if (!selectedWaOrder && json.data.data.length > 0) {
          setSelectedWaOrder(json.data.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load WA orders:', e);
    } finally {
      setWaLoading(false);
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
      const normalizePhone = (input: string, dialCode: string) => {
        const cleanDial = dialCode.replace(/[^\d]/g, '');
        let cleaned = input.replace(/[^\d]/g, '');
        if (cleaned.startsWith(cleanDial)) {
          cleaned = cleaned.slice(cleanDial.length);
        }
        cleaned = cleaned.replace(/^0+/, '');
        return `+${cleanDial}${cleaned}`;
      };
      const normalizedPhone = normalizePhone(localWhatsapp, selectedCountry.dialCode);
      const isPro = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          store_name: setStoreName,
          store_bio: setStoreBio,
          whatsapp_phone: normalizedPhone,
          instagram_handle: setInstagram,
          tiktok_handle: setTiktok,
          currency_code: setCurrency,
          bank_name: paymentBankName || null,
          bank_account_number: paymentAccountNumber || null,
          bank_account_name: paymentAccountName || null,
          payment_instructions: paymentInstructions || null,
          paystack_bank_code: paymentBankCode || null,
          bank_account_verified: accountVerified,
          custom_links: customLinks,
          logo_url: logoUrl,
          primary_color: isPro ? primaryColor : (store?.primary_color || '#10b981'),
          store_template: selectedTemplate,
          catalog_label: catalogLabel || null,
          category_label: categoryLabel || null,
          template_highlight_label: templateHighlightLabel || null,
          product_section_eyebrow: productSectionEyebrow || null,
          product_section_title: productSectionTitle || null,
          featured_carousel_enabled: featuredCarouselEnabled,
          featured_carousel_eyebrow: featuredCarouselEyebrow || null,
          featured_carousel_title: featuredCarouselTitle || null,
          featured_product_ids: featuredProductIds.slice(0, 5),
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        toast.success('Storefront settings updated! 🌟');
        setStore(json.data);
        localStorage.setItem('store', JSON.stringify(json.data));
        setLogoUrl(json.data.logo_url || null);
        const parsedPhone = parsePhoneNumber(json.data.whatsapp_phone || '');
        setSelectedCountry(parsedPhone.country);
        setLocalWhatsapp(parsedPhone.local);
        setPaymentBankName(json.data.bank_name || '');
        setPaymentBankCode(json.data.paystack_bank_code || '');
        setPaymentAccountNumber(json.data.bank_account_number || '');
        setPaymentAccountName(json.data.bank_account_name || '');
        setPaymentInstructions(json.data.payment_instructions || '');
        setAccountVerified(!!json.data.bank_account_verified);
        setNameMatchOk(json.data.bank_account_verified ? true : null);
        setCustomLinks(json.data.custom_links || []);
        setPrimaryColor(json.data.primary_color || '#10b981');
        setSelectedTemplate(json.data.store_template || 'luxe-market');
        setCatalogLabel(json.data.catalog_label || 'product');
        setCategoryLabel(json.data.category_label || 'collection');
        setTemplateHighlightLabel(json.data.template_highlight_label || '');
        setProductSectionEyebrow(json.data.product_section_eyebrow || 'Catalog');
        setProductSectionTitle(json.data.product_section_title || '');
        setFeaturedCarouselEnabled(json.data.featured_carousel_enabled !== false);
        setFeaturedCarouselEyebrow(json.data.featured_carousel_eyebrow || 'Featured now');
        setFeaturedCarouselTitle(json.data.featured_carousel_title || 'Fresh picks from the catalog');
        setFeaturedProductIds((json.data.featured_product_ids || []).slice(0, 5));
      } else {
        throw new Error(json.message || 'Store settings update failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred saving settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleTemplateActivate = async (templateId: string) => {
    if (templateSaving) return;
    const previousTemplate = selectedTemplate;
    const templateName = storeTemplates.find(t => t.id === templateId)?.name || 'Storefront';

    try {
      setTemplateSaving(templateId);
      setSelectedTemplate(templateId);

      const res = await fetch(`${apiUrl}/v1/store/template`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ store_template: templateId })
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.message || 'Template activation failed.');
      }
      if (json.data.store_template !== templateId) {
        throw new Error('The server did not save the selected template. Please run the latest database migration and try again.');
      }

      setStore(json.data);
      localStorage.setItem('store', JSON.stringify(json.data));
      setSelectedTemplate(json.data.store_template || templateId);
      toast.success(`${templateName} template activated. Refresh the public store to view it.`);
    } catch (e: any) {
      setSelectedTemplate(previousTemplate);
      toast.error(e.message || 'Could not activate template.');
    } finally {
      setTemplateSaving(null);
    }
  };

  const handleGenerateDedicatedAccount = async () => {
    if (!isPro) {
      openUpgradePrompt(
        'Dedicated virtual accounts require Pro',
        'Pro merchants can generate a Paystack virtual account that buyers pay into directly. You can review plans before deciding.'
      );
      return;
    }

    try {
      setIsGeneratingDedicatedAccount(true);
      const res = await fetch(`${apiUrl}/v1/payments/dedicated-account`, {
        method: 'POST',
        headers: getAuthHeaders(),
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

  const handleTemplateColorSave = async () => {
    const isProUser = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';
    if (!isProUser && primaryColor !== '#10b981') {
      openUpgradePrompt(
        'Custom storefront colors require Pro',
        'Free stores use the default brand color. Upgrade to Pro when you want custom theme colors across your storefront.'
      );
      return;
    }

    try {
      setTemplateSaving('color');
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ primary_color: primaryColor })
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.message || 'Color update failed.');
      }

      setStore(json.data);
      localStorage.setItem('store', JSON.stringify(json.data));
      setPrimaryColor(json.data.primary_color || '#10b981');
      toast.success('Template color updated.');
    } catch (e: any) {
      toast.error(e.message || 'Could not update template color.');
    } finally {
      setTemplateSaving(null);
    }
  };

  // --- Change Password Handler ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpCurrent || !cpNew || !cpConfirm) {
      toast.warning('Please fill in all password fields.');
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: cpCurrent,
          new_password: cpNew,
          new_password_confirmation: cpConfirm,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully! 🔒');
        setCpCurrent('');
        setCpNew('');
        setCpConfirm('');
      } else {
        throw new Error(json.message || 'Password update failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred updating password.');
    } finally {
      setCpSaving(false);
    }
  };


  // --- Upgrade Plan via Real Paystack Payment ---
  const handleUpgradePlan = async (targetPlan: 'free' | 'pro_monthly' | 'pro_yearly') => {
    if (targetPlan === 'free') {
      // Downgrade is free — no payment needed
      try {
        const res = await fetch(`${apiUrl}/v1/user/upgrade`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ plan: 'free' })
        });
        const json = await res.json();
        if (res.ok && json.data?.user) {
          toast.success('Switched back to Free Tier.');
          setUser(json.data.user);
          localStorage.setItem('user', JSON.stringify(json.data.user));
        } else {
          throw new Error(json.message || 'Downgrade failed');
        }
      } catch (e: any) {
        toast.error(e.message || 'Error downgrading plan.');
      }
      return;
    }

    // Pro plans require real payment via Paystack
    try {
      setIsInitializingPayment(true);
      const callbackUrl = `${window.location.origin}/dashboard`;
      const res = await fetch(`${apiUrl}/v1/payments/initialize-subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan: targetPlan, redirect_url: callbackUrl }),
      });
      const json = await res.json();
      if (res.ok && json.data?.authorization_url) {
        // Redirect to Paystack hosted checkout
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error(json.message || 'Could not start payment. Try again.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Payment initialization failed.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  // --- Custom Domain Mapping Handlers ---
  const handleLinkCustomDomain = async () => {
    if (!customDomainInput.trim()) return;
    try {
      setCustomDomainSaving(true);
      const res = await fetch(`${apiUrl}/v1/store/custom-domain`, {
        method: 'POST',
        headers: getAuthHeaders(),
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

  const handleRemoveCustomDomain = async () => {
    if (!window.confirm('Are you sure you want to disconnect your custom domain? Your store will no longer be accessible via this domain.')) {
      return;
    }
    try {
      setCustomDomainSaving(true);
      const res = await fetch(`${apiUrl}/v1/store/custom-domain`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
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
  };

  // --- Dev API endpoints config handler ---
  const handleSaveDevApi = () => {
    if (!devApiInput.trim()) return;
    localStorage.setItem('dev_api_url', devApiInput.trim());
    setApiUrl(devApiInput.trim());
    toast.success('Dev API Host Address updated!');
    loadAllData();
  };

  // --- Receipt view compiler ---
  const generateReceiptText = (order: Order) => {
    const divider = '===================================';
    const storeHeader = `🏪 STORE: ${store?.store_name || 'frontstore merchant'}\nURL: ${systemDomain}/${store?.username}\n`;
    const orderHeader = `ORDER NO: ${order.order_number}\nDATE: ${new Date(order.created_at).toLocaleDateString()}\n`;
    const customer = `CUSTOMER: ${order.customer_name}\nPHONE: ${order.customer_phone}\nADDRESS: ${order.delivery_address || 'N/A'}\n`;

    // items summary list
    const sym = getCurrencySymbol(store?.currency_code);
    let itemSummary = '';
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const itemTotal = parseFloat(item.product_price as string) * item.quantity;
        itemSummary += `- ${item.quantity}x ${item.product_name} (@ ${sym}${parseFloat(item.product_price as string).toLocaleString()}) - ${sym}${itemTotal.toLocaleString()}\n`;
      });
    } else {
      itemSummary += `- 1x Digital Cart Purchase - ${sym}${parseFloat(order.total_amount as string).toLocaleString()}\n`;
    }

    const total = `\nTOTAL PAID: ${sym}${parseFloat(order.total_amount as string).toLocaleString()}\nSTATUS: PAID & CONFIRMED\n`;
    const footer = `\nThank you for shopping with us!\nPowered by ${systemDomain}\n`;

    return `${divider}\n${storeHeader}${divider}\n${orderHeader}${customer}${divider}\nITEMS:\n${itemSummary}${divider}${total}${divider}${footer}${divider}`;
  };

  const copyReceiptToClipboard = (order: Order) => {
    const text = generateReceiptText(order);
    navigator.clipboard.writeText(text);
    toast.success('Receipt copied to clipboard! 🧾📋');
  };

  // --- Logout helper ---
  const handleLogout = () => {
    fetch(`${apiUrl}/v1/auth/logout`, { method: 'POST', headers: getAuthHeaders() }).catch(() => { });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    setIsAuthenticated(false);
    toast.info('Merchant session ended.');
    router.push('/login');
  };

  if (isAuthChecking || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 20, fontFamily: 'var(--font-heading)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer glowing pulse ring */}
          <div style={{
            position: 'absolute',
            width: 70,
            height: 70,
            borderRadius: '50%',
            border: '2px solid var(--primary)',
            opacity: 0,
            animation: 'pulse-ring-dash 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
          }} />
          <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)', animation: 'spin-loader-dash 1s linear infinite' }} />
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Verifying credentials...</span>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin-loader-dash {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse-ring-dash {
              0% { transform: scale(0.6); opacity: 0.8; }
              100% { transform: scale(1.3); opacity: 0; }
            }
          `
        }} />
      </div>
    );
  }

  // Formatting currency
  const formatVal = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '—' : num.toLocaleString();
  };

  const liveStoreUrl = store ? `${window.location.origin}/${store.username}` : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── SIDEBAR NAVIGATION (Desktop) ── */}
      <aside className="glass" style={{
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        height: '100vh',
        zIndex: 40,
        padding: '24px 16px',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{ background: 'var(--primary)', color: '#fff', width: 36, height: 36, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>
            <Store size={20} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>frontstore</h1>
            <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Merchant Dashboard v2.0</span>
          </div>
        </div>

        {/* Store Context Badge */}
        {store && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 'var(--r-lg)', marginBottom: 24, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                {store.store_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.store_name}</p>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>@{store.username}</span>
              </div>
            </div>
            {/* Plan Indicator Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: 4,
                background: user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--border)',
                color: user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly' ? '#fff' : 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                {(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') ? <Sparkles size={8} /> : null}
                {user?.plan === 'pro_monthly' ? 'Pro Monthly' : user?.plan === 'pro_yearly' ? 'Pro Yearly' : 'Free Tier'}
              </span>
              {(!user?.plan || user?.plan === 'free') && (
                <button
                  type="button"
                  onClick={() => navigateDashboardTab('billing')}
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'var(--primary)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} /> },
            { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} />, badge: orders.filter(o => o.order_status === 'pending').length },
            { id: 'products', label: 'My Products', icon: <Package size={18} /> },
            { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={18} /> },
            { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={18} />, badge: waOrders.filter(o => o.payment_status === 'unpaid').length || undefined },
            { id: 'reach', label: 'Broadcast Messages', icon: <Megaphone size={18} />, badge: 'Pro' },
            { id: 'share', label: 'Share & Earn', icon: <Share2 size={18} /> },
            { id: 'templates', label: 'Store Themes', icon: <Sparkles size={18} /> },
            { id: 'settings', label: isDev ? 'Settings & Dev' : 'Settings', icon: <Settings size={18} /> },
            { id: 'billing', label: 'Plans & Billing', icon: <Zap size={18} /> },
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateDashboardTab(item.id as DashboardTab)}
                className="clickable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: active ? 'var(--primary-light)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: 14.5,
                  fontWeight: active ? 750 : 600,
                  textAlign: 'left',
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {!!item.badge && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#fff',
                    background: item.id === 'whatsapp' ? 'var(--primary)' : 'var(--danger)',
                    padding: '2px 7px',
                    borderRadius: 'var(--r-full)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (Mobile size navigation bar) ── */}
      <div style={{ display: 'none' }} className="mobile-header-styles">
        {/* Handled by media queries at the bottom */}
      </div>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

        {/* Desktop & Mobile Header Topbar */}
        <header className="glass main-header" style={{
          position: 'sticky', top: 0, zIndex: 30,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          paddingBottom: '12px',
        }}>
          {/* Left section: mobile toggle and mobile brand logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-burger-btn"
              style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
            >
              <Menu size={24} />
            </button>

            {/* Mobile logo (hidden on desktop via css) */}
            <div className="header-logo-mobile" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
              <div style={{ background: 'var(--primary)', color: '#fff', width: 28, height: 28, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>
                <Store size={15} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>frontstore</span>
            </div>
          </div>

          {/* AI Command Input Bar */}
          <form onSubmit={handleAiCommandSubmit} className="header-search-form" style={{ display: 'flex', flex: 1, maxWidth: 460, position: 'relative', margin: '0 16px' }}>
            <input
              type="text"
              placeholder="⚡ Search or command..."
              value={aiCommand}
              onChange={e => setAiCommand(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                fontSize: 13,
                background: 'var(--bg-2)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                outline: 'none',
                color: 'var(--text)'
              }}
            />
            <Sparkles size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />

            {aiResponseBubble && (
              <div className="card glass animate-scale-in" style={{ position: 'absolute', top: '115%', left: 0, right: 0, padding: 12, fontSize: 13, fontWeight: 600, border: '1px solid var(--primary)', zIndex: 50, color: 'var(--text)' }}>
                {aiResponseBubble}
              </div>
            )}
          </form>

          {/* Right Action Widgets - Now aligned to top right on same line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', paddingRight: '16px' }}>
            <button
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
              className="btn btn-outline clickable"
              style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', whiteSpace: 'nowrap' }}
              title="Refresh Stats"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span className="desktop-only-text">Sync Live</span>
            </button>
            <a
              href={liveStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary clickable"
              style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--r-md)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', whiteSpace: 'nowrap' }}
              title="Visit Store"
            >
              <span className="desktop-only-text">Visit Store</span>
              <ArrowUpRight size={14} />
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Pane Wrapper */}
        <div style={{ padding: 'clamp(16px, 4vw, 32px)', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {dataLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14.5 }}>Fetching store datasets...</span>
            </div>
          ) : (
            <>
              {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Dashboard Overview</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Business Analytics & CRM metrics tracking customer purchases and conversion rates.</p>
                  </div>

                  {/* ── STORE SETUP CHECKLIST (shown until store is fully configured) ── */}
                  {(() => {
                    const hasProducts = products.length > 0;
                    const hasBio = !!(store?.store_bio && store.store_bio.trim().length > 5);
                    const hasBank = !!(store?.bank_account_number && store.bank_account_number.trim().length > 4);
                    const hasLogo = !!store?.logo_url;
                    const steps = [
                      { id: 'products', done: hasProducts, label: 'Add your first product', desc: 'List a physical or digital item to start selling.', action: () => openAddProductModal(), cta: 'Add Product', icon: <Package size={16} /> },
                      { id: 'bank', done: hasBank, label: 'Connect payment details', desc: 'Add your bank account to receive payments.', action: () => navigateDashboardTab('settings'), cta: 'Go to Settings', icon: <DollarSign size={16} /> },
                      { id: 'bio', done: hasBio, label: 'Write your store bio', desc: 'Tell customers who you are and what you sell.', action: () => navigateDashboardTab('settings'), cta: 'Edit Bio', icon: <Store size={16} /> },
                      { id: 'logo', done: hasLogo, label: 'Upload a store logo', desc: 'A logo builds trust and makes your store look professional.', action: () => navigateDashboardTab('settings'), cta: 'Upload Logo', icon: <Camera size={16} /> },
                    ];
                    const doneCount = steps.filter(s => s.done).length;
                    const allDone = doneCount === steps.length;
                    if (allDone) return null;
                    const progressPct = Math.round((doneCount / steps.length) * 100);
                    return (
                      <div className="card" style={{
                        padding: 0,
                        overflow: 'hidden',
                        border: '1.5px solid var(--primary)',
                        boxShadow: '0 0 0 4px rgba(16,185,129,0.06)',
                      }}>
                        {/* Header gradient */}
                        <div className="setup-checklist-header" style={{
                          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Rocket size={20} color="#fff" />
                            </div>
                            <div>
                              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                                Complete Your Store Setup
                              </h3>
                              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                                {doneCount} of {steps.length} steps done · {progressPct}% complete
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em' }}>{progressPct}%</span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 5, background: 'rgba(16,185,129,0.12)' }}>
                          <div style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            background: 'linear-gradient(90deg, var(--primary-dark), var(--primary))',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '0 4px 4px 0',
                          }} />
                        </div>

                        {/* Steps list */}
                        <div className="setup-checklist-body" style={{ padding: '8px 24px 20px' }}>
                          {steps.map((step, idx) => (
                            <div
                              key={step.id}
                              className="checklist-step-row"
                              style={{
                                borderBottom: idx < steps.length - 1 ? '1px solid var(--border)' : 'none',
                                opacity: step.done ? 0.55 : 1,
                              }}
                            >
                              {/* Status circle */}
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: step.done ? 'var(--primary-light)' : 'var(--bg-2)',
                                border: step.done ? '2px solid var(--primary)' : '2px solid var(--border)',
                                color: step.done ? 'var(--primary)' : 'var(--text-muted)',
                                transition: 'all 0.3s ease',
                              }}>
                                {step.done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : step.icon}
                              </div>

                              {/* Text */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: step.done ? 'var(--text-muted)' : 'var(--text)',
                                  textDecoration: step.done ? 'line-through' : 'none',
                                }}>
                                  {step.label}
                                </p>
                                {!step.done && (
                                  <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2, lineHeight: 1.4 }}>
                                    {step.desc}
                                  </p>
                                )}
                              </div>

                              {/* Action button */}
                              {!step.done && (
                                <button
                                  onClick={step.action}
                                  className="btn btn-primary clickable"
                                  style={{ padding: '8px 14px', fontSize: 12, borderRadius: 'var(--r-md)', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                >
                                  {step.cta} <ArrowRight size={11} />
                                </button>
                              )}
                              {step.done && (
                                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap' }}>
                                  ✓ Done
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Top Stats Row */}
                  <div className="responsive-stats-grid">

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Revenue</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {getCurrencySymbol(store?.currency_code)}{stats ? formatVal(stats.revenue) : '0'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Excludes cancelled orders</span>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats ? stats.counts.total : orders.length}
                      </p>
                      <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{stats?.counts.pending ?? 0} pending</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{stats?.counts.completed ?? 0} shipped</span>
                      </div>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storefront Views</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats?.metrics.total_views ?? '—'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Total catalog product clicks</span>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp Redirects</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats?.metrics.whatsapp_redirects ?? '—'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Redirects to initiate checkout</span>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20, background: 'linear-gradient(135deg, var(--surface), rgba(16, 185, 129, 0.03))' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conversion Rate</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats?.metrics.conversion_rate ?? '0'}%
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>WhatsApp clicks vs page views</span>
                    </div>
                  </div>

                  {/* Visual charts block */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }} className="responsive-chart-grid">

                    {/* SVG Analytics Graph */}
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800 }}>Weekly Traffic & Redirects</h3>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Last 7 Days</span>
                      </div>

                      {/* Bar columns scrollable wrapper */}
                      <div className="chart-scroll-container">
                        <div className="chart-scroll-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, padding: '0 10px', borderBottom: '1px solid var(--border)' }}>
                            {[
                              { day: 'Mon', views: 30, wa: 10 },
                              { day: 'Tue', views: 45, wa: 15 },
                              { day: 'Wed', views: 75, wa: 22 },
                              { day: 'Thu', views: 50, wa: 18 },
                              { day: 'Fri', views: 90, wa: 30 },
                              { day: 'Sat', views: 120, wa: 42 },
                              { day: 'Sun', views: 80, wa: 25 }
                            ].map((item, idx) => {
                              const maxVal = 130;
                              const viewsHeight = `${(item.views / maxVal) * 100}%`;
                              const waHeight = `${(item.wa / maxVal) * 100}%`;

                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                                  <div style={{ display: 'flex', gap: 4, width: '70%', height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    {/* Views bar */}
                                    <div style={{ height: viewsHeight, width: 8, background: 'var(--primary)', opacity: 0.35, borderRadius: '4px 4px 0 0' }} title={`Views: ${item.views}`} />
                                    {/* WhatsApp clicks bar */}
                                    <div style={{ height: waHeight, width: 8, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} title={`WhatsApp Clicks: ${item.wa}`} />
                                  </div>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: 4 }}>{item.day}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center', fontSize: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                              <span style={{ width: 10, height: 10, background: 'var(--primary)', opacity: 0.35, borderRadius: '50%' }} /> Catalog Views
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                              <span style={{ width: 10, height: 10, background: 'var(--primary)', borderRadius: '50%' }} /> WhatsApp checkouts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Coach Business Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="card" style={{
                        padding: 24,
                        border: '1.5px solid var(--primary)',
                        background: 'linear-gradient(135deg, var(--surface), rgba(16, 185, 129, 0.05))',
                        boxShadow: 'var(--shadow-primary)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                          <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 'var(--r-md)', color: 'var(--primary)' }}>
                            <Sparkles size={20} />
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>AI Business Coach</h3>
                        </div>

                        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
                          {stats && stats.metrics.total_views > 0
                            ? `Your storefront has recorded ${stats.metrics.total_views} visits with a ${stats.metrics.conversion_rate}% conversion rate. ${stats.metrics.conversion_rate < 15
                              ? 'Your conversion rate is slightly below the target of 15%. I recommend launching a quick flash discount campaign to encourage checkouts.'
                              : 'Fantastic! Your store conversion is highly optimized. List additional products to grow your revenue further.'
                            }`
                            : 'Welcome back! List some items and share your store link. I will populate automated marketing suggestions here once visitors arrive.'}
                        </p>

                        <button
                          onClick={() => setIsDiscountModalOpen(true)}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                        >
                          <Zap size={14} /> Launch Discount Campaign
                        </button>
                      </div>

                      {/* Top Selling Products List */}
                      <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Top Products</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {stats?.top_products && stats.top_products.length > 0 ? (
                            stats.top_products.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: idx < stats.top_products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                  <p style={{ fontSize: 13.5, fontWeight: 800 }}>{item.product_name}</p>
                                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{item.orders_count} orders filled</span>
                                </div>
                                <span className="badge badge-primary" style={{ padding: '4px 10px', fontSize: 11 }}>
                                  {item.total_sold} sold
                                </span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No top items recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ── TAB 2: ORDERS MANAGER ── */}
              {activeTab === 'orders' && (
                <div className="card animate-fade-in" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }} className="responsive-order-heading">
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Customer Orders</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Confirm, ship, and generate receipts for custom purchases.</p>
                    </div>
                  </div>

                  {/* Orders Table List (Desktop) */}
                  <div className="desktop-table-view" style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>Order No</th>
                          <th style={{ padding: '12px 8px' }}>Customer</th>
                          <th style={{ padding: '12px 8px' }}>Date</th>
                          <th style={{ padding: '12px 8px' }}>Amount</th>
                          <th style={{ padding: '12px 8px' }}>Payment</th>
                          <th style={{ padding: '12px 8px' }}>Order Status</th>
                          <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map(order => (
                            <tr
                              key={order.id}
                              style={{ borderBottom: '1px solid var(--border)', fontSize: 14 }}
                              className="table-row-hover"
                            >
                              <td style={{ padding: '16px 8px', fontWeight: 800, color: 'var(--primary)' }}>
                                {order.order_number}
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <p style={{ fontWeight: 700 }}>{order.customer_name}</p>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer_phone}</span>
                              </td>
                              <td style={{ padding: '16px 8px', color: 'var(--text-muted)', fontSize: 13 }}>
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td style={{ padding: '16px 8px', fontWeight: 800 }}>
                                {getCurrencySymbol(store?.currency_code)}{formatVal(order.total_amount)}
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <span className={`badge ${order.payment_status === 'paid' ? 'badge-primary' :
                                  order.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'
                                  }`} style={{ fontSize: 10 }}>
                                  {order.payment_status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <span className={`badge ${order.order_status === 'completed' ? 'badge-primary' :
                                  order.order_status === 'cancelled' ? 'badge-danger' :
                                    order.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'
                                  }`} style={{ fontSize: 10 }}>
                                  {order.order_status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsOrderDetailsOpen(true);
                                    }}
                                    className="btn btn-outline clickable"
                                    style={{ padding: '6px 10px', fontSize: 11.5, borderRadius: 'var(--r-sm)' }}
                                  >
                                    Inspect
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReceiptOrder(order);
                                      setIsReceiptOpen(true);
                                    }}
                                    className="btn btn-ghost clickable"
                                    style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}
                                    title="Receipt"
                                  >
                                    <Receipt size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ padding: '40px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                              No orders found yet. Share your store link on WhatsApp to receive your first order!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Orders Card List (Mobile) */}
                  <div className="mobile-cards-view">
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <div
                          key={order.id}
                          className="card"
                          style={{
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14.5 }}>
                              {order.order_number}
                            </span>
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                            <p style={{ fontWeight: 700, fontSize: 14 }}>{order.customer_name}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{order.customer_phone}</p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <span className={`badge ${order.payment_status === 'paid' ? 'badge-primary' :
                                order.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'
                                }`} style={{ fontSize: 9 }}>
                                Pay: {order.payment_status}
                              </span>
                              <span className={`badge ${order.order_status === 'completed' ? 'badge-primary' :
                                order.order_status === 'cancelled' ? 'badge-danger' :
                                  order.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'
                                }`} style={{ fontSize: 9 }}>
                                Status: {order.order_status}
                              </span>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 14.5 }}>
                              {getCurrencySymbol(store?.currency_code)}{formatVal(order.total_amount)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2 }}>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsOrderDetailsOpen(true);
                              }}
                              className="btn btn-outline clickable"
                              style={{ flex: 1, padding: '8px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => {
                                setReceiptOrder(order);
                                setIsReceiptOpen(true);
                              }}
                              className="btn btn-ghost clickable"
                              style={{ padding: '8px 10px', borderRadius: 'var(--r-sm)', color: 'var(--primary)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <Receipt size={14} /> Receipt
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ padding: '24px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
                        No orders found yet. Share your store link on WhatsApp to receive your first order!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 3: PRODUCTS CRUD ── */}
              {activeTab === 'products' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="responsive-product-header">
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>My Products</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Converts inventory into checkouts. Create items, update pricing, and generate descriptions using ChatGPT AI.</p>
                    </div>
                    <button
                      onClick={openAddProductModal}
                      className="btn btn-primary clickable"
                      style={{ padding: '10px 18px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={16} /> Add Product
                    </button>
                  </div>

                  {/* Product Grid */}
                  <div className="responsive-product-catalog-grid">
                    {products.length > 0 ? (
                      products.map(prod => (
                        <div
                          key={prod.id}
                          className="card hover-lift responsive-product-card"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative',
                            minHeight: 330
                          }}
                        >
                          {/* Image */}
                          <div style={{
                            width: '100%',
                            paddingTop: '80%',
                            position: 'relative',
                            background: 'var(--bg-2)'
                          }}>
                            {prod.image_urls?.[0] ? (
                              <img
                                src={prod.image_urls[0]}
                                alt={prod.name}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                                <Package size={40} strokeWidth={1} />
                              </div>
                            )}

                            {/* Stock badge */}
                            <span className={`badge ${prod.stock_status === 'in_stock' ? 'badge-primary' : 'badge-danger'}`} style={{ position: 'absolute', top: 10, left: 10, fontSize: 9 }}>
                              {prod.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                            </span>

                            {/* AI Image badge */}
                            {prod.image_urls?.[0] && (prod.image_urls[0].includes('/products/ai_') || prod.image_urls[0].includes('/ai_') || prod.image_urls[0].includes('products/ai_')) && (
                              <span className="badge" style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, background: 'rgba(15, 23, 42, 0.65)', color: '#fff', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                                ✨ AI Image
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="responsive-product-card-body" style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
                            <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {prod.category?.name || 'Uncategorized'}
                            </span>
                            <h4 className="responsive-product-card-title" style={{ fontSize: 14, fontWeight: 800, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text)' }}>
                              {prod.name}
                            </h4>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '4px 0' }}>
                              <span className="responsive-product-card-price" style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)' }}>
                                {getCurrencySymbol(store?.currency_code)}{formatVal(prod.price)}
                              </span>
                              {prod.compare_at_price && (
                                <span style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                                  {getCurrencySymbol(store?.currency_code)}{formatVal(prod.compare_at_price)}
                                </span>
                              )}
                            </div>

                            <p className="responsive-product-card-desc" style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>
                              {prod.description || 'No description added.'}
                            </p>

                            {/* Action Tools */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                              <button
                                onClick={() => handleEditProductClick(prod)}
                                className="btn btn-outline clickable"
                                style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="btn btn-ghost clickable"
                                style={{ padding: '6px 8px', borderRadius: 'var(--r-sm)', color: 'var(--danger)' }}
                                title="Delete Product"
                              >
                                <Trash2 size={13} />
                              </button>
</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="card" style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No products added to catalog. Add some items to showcase your storefront!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 4: WHATSAPP SALES INBOX ── */}
              {activeTab === 'whatsapp' && (() => {
                if (waOrders.length === 0 && !waLoading) loadWaOrders();
                const sym = getCurrencySymbol(store?.currency_code);
                const filtered = waOrders.filter(o =>
                  !waSearch ||
                  o.customer_name.toLowerCase().includes(waSearch.toLowerCase()) ||
                  o.customer_phone.includes(waSearch) ||
                  o.order_number.toLowerCase().includes(waSearch.toLowerCase())
                );
                const buildReplyMsg = (order: Order) => encodeURIComponent(
                  `Hi ${order.customer_name}! This is ${store?.store_name || 'us'} 🛖\n\nRegarding your Order *#${order.order_number}* — ${sym}${parseFloat(order.total_amount as string).toLocaleString()}\n\nStatus: ${order.order_status.toUpperCase()} | Payment: ${order.payment_status.toUpperCase()}\n\nFeel free to reply with any questions!`
                );
                const buildReceiptMsg = (order: Order) => {
                  const items = order.items?.map(i =>
                    `- ${i.quantity}x ${i.product_name} @ ${sym}${parseFloat(i.product_price as string).toLocaleString()}`
                  ).join('\n') || `- Order total: ${sym}${parseFloat(order.total_amount as string).toLocaleString()}`;
                  return encodeURIComponent(
                    `🧾 *RECEIPT — ${store?.store_name}*\n\nOrder: *#${order.order_number}*\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\n${items}\n\n*TOTAL: ${sym}${parseFloat(order.total_amount as string).toLocaleString()}*\nStatus: ${order.payment_status.toUpperCase()}\n\nThank you for your purchase! 🎉`
                  );
                };
                const cleanPhone = (p: string) => p.replace(/\D/g, '');
                return (
                  <div className="card animate-fade-in whatsapp-chat-shell" style={{ padding: 0, height: 'calc(100vh - 160px)', display: 'flex', overflow: 'hidden' }}>
                    {/* Left Panel — Contacts */}
                    <div style={{ width: 300, borderRight: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column' }} className={`wa-contacts-panel ${activeWaView === 'list' ? 'wa-mobile-show' : 'wa-mobile-hide'}`}>
                      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900 }}>WhatsApp Inbox</h3>
                          <button onClick={() => { loadWaOrders(); toast.success('Refreshing inbox...'); }} className="btn btn-ghost clickable" style={{ padding: 6, color: 'var(--primary)' }} title="Refresh"><RefreshCw size={14} /></button>
                        </div>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8 }}>AI Conversational assistant replying to your customer chats 24/7.</p>
                        <div style={{ position: 'relative' }}>
                          <input type="text" placeholder="Search by name, phone, order #..." value={waSearch} onChange={e => setWaSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 30px', fontSize: 12.5, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', outline: 'none', color: 'var(--text)' }} />
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 11 }}>🔍</span>
                        </div>
                        <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8 }}>
                          {waOrders.length} WA order{waOrders.length !== 1 ? 's' : ''} • {waOrders.filter(o => o.payment_status === 'unpaid').length} unpaid
                        </p>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {waLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)', gap: 8 }}>
                            <Loader2 size={20} className="spinner" style={{ color: 'var(--primary)' }} /> Loading...
                          </div>
                        ) : filtered.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                            <WhatsAppIcon size={32} color="var(--text-faint)" />
                            <p style={{ marginTop: 12, fontSize: 13, fontWeight: 700 }}>{waSearch ? 'No contacts match.' : 'No WhatsApp orders yet.'}</p>
                            {!waSearch && <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 6, lineHeight: 1.5 }}>When customers message your WhatsApp number, their orders appear here automatically.</p>}
                          </div>
                        ) : (
                          filtered.map(order => {
                            const isSelected = selectedWaOrder?.id === order.id;
                            const initials = order.customer_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                            const isUnpaid = order.payment_status === 'unpaid';
                            return (
                              <div key={order.id} onClick={() => { setSelectedWaOrder(order); setActiveWaView('chat'); }} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : 'transparent', border: isSelected ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.15s' }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: isUnpaid ? 'rgba(234,179,8,0.12)' : '#25d36618', color: isUnpaid ? '#d97706' : '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, border: `2px solid ${isUnpaid ? '#d97706' : '#25d366'}33` }}>
                                  {initials}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{order.customer_name}</p>
                                    <span style={{ fontSize: 10, color: 'var(--text-faint)', flexShrink: 0, marginLeft: 4 }}>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{order.order_number}</p>
                                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-full)', background: order.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(234,179,8,0.12)', color: order.payment_status === 'paid' ? 'var(--primary)' : '#d97706', textTransform: 'uppercase' }}>{order.payment_status}</span>
                                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-full)', background: 'var(--bg-2)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{order.order_status}</span>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', marginLeft: 'auto' }}>{sym}{formatVal(order.total_amount)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right Panel — Order Detail */}
                    <div className={`wa-chat-viewport ${activeWaView === 'chat' ? 'wa-mobile-show' : 'wa-mobile-hide'}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflowY: 'auto' }}>
                      {!selectedWaOrder ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
                          <WhatsAppIcon size={48} color="var(--text-faint)" />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 15 }}>Select a conversation</p>
                            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4 }}>Pick a WhatsApp order on the left to manage it here.</p>
                          </div>
                        </div>
                      ) : (() => {
                        const o = selectedWaOrder;
                        const phone = o.customer_whatsapp || o.customer_phone;
                        const waPhone = cleanPhone(phone);
                        const initials = o.customer_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                        return (
                          <>
                            {/* Header */}
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button onClick={() => setActiveWaView('list')} className="btn btn-ghost wa-back-button" style={{ display: 'none', padding: 6, marginLeft: -6, color: 'var(--text-muted)' }}><ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} /></button>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25d36618', border: '2px solid #25d36633', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>{initials}</div>
                                <div>
                                  <h4 style={{ fontSize: 14, fontWeight: 800 }}>{o.customer_name}</h4>
                                  <span style={{ fontSize: 11, color: '#25d366', fontWeight: 700 }}>{phone}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <a href={`https://wa.me/${waPhone}?text=${buildReplyMsg(o)}`} target="_blank" rel="noreferrer" className="btn clickable" style={{ padding: '7px 14px', fontSize: 12, borderRadius: 'var(--r-sm)', background: '#25d366', color: '#fff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                                  <WhatsAppIcon size={14} color="#fff" /> Reply on WhatsApp
                                </a>
                                <a href={`https://wa.me/${waPhone}?text=${buildReceiptMsg(o)}`} target="_blank" rel="noreferrer" className="btn btn-outline clickable" style={{ padding: '7px 14px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                                  <Receipt size={13} /> Send Receipt
                                </a>
                              </div>
                            </div>

                            {/* Body */}
                            <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                              {/* Order Summary */}
                              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                  <div>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order</span>
                                    <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{o.order_number}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{new Date(o.created_at).toLocaleString()}</p>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{sym}{parseFloat(o.total_amount as string).toLocaleString()}</span>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                      <span className={`badge ${o.payment_status === 'paid' ? 'badge-primary' : o.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'}`} style={{ fontSize: 10 }}>{o.payment_status}</span>
                                      <span className={`badge ${o.order_status === 'completed' ? 'badge-primary' : o.order_status === 'cancelled' ? 'badge-danger' : o.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'}`} style={{ fontSize: 10 }}>{o.order_status}</span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                                  <div>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</span>
                                    <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{o.customer_name}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{phone}</p>
                                  </div>
                                  {o.delivery_address && (
                                    <div>
                                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</span>
                                      <p style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: 'var(--text-2)' }}>{o.delivery_address}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Method</span>
                                    <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>{o.delivery_method || 'delivery'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Items */}
                              {o.items && o.items.length > 0 && (
                                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                                  <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Items Ordered</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {o.items.map((item, idx) => (
                                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                                        <div>
                                          <p style={{ fontSize: 13.5, fontWeight: 700 }}>{item.product_name}</p>
                                          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Qty: {item.quantity} × {sym}{parseFloat(item.product_price as string).toLocaleString()}</p>
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{sym}{(parseFloat(item.product_price as string) * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Quick Actions */}
                              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                                <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>Quick Actions</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                                  {o.payment_status !== 'paid' && (
                                    <button onClick={async () => { await handleUpdatePaymentStatus(o.id, 'paid'); const updated = { ...o, payment_status: 'paid' }; setSelectedWaOrder(updated as Order); setWaOrders(prev => prev.map(x => x.id === o.id ? updated as Order : x)); }} className="btn btn-primary clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                      <Check size={14} /> Mark Paid
                                    </button>
                                  )}
                                  {o.order_status !== 'completed' && o.order_status !== 'cancelled' && (
                                    <button onClick={async () => { await handleUpdateOrderStatus(o.id, 'completed'); const updated = { ...o, order_status: 'completed' }; setSelectedWaOrder(updated as Order); setWaOrders(prev => prev.map(x => x.id === o.id ? updated as Order : x)); }} className="btn btn-outline clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                                      <Package size={14} /> Mark Shipped
                                    </button>
                                  )}
                                  {o.order_status !== 'cancelled' && (
                                    <button onClick={async () => { await handleUpdateOrderStatus(o.id, 'cancelled'); const updated = { ...o, order_status: 'cancelled' }; setSelectedWaOrder(updated as Order); setWaOrders(prev => prev.map(x => x.id === o.id ? updated as Order : x)); }} className="btn btn-outline clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                      <X size={14} /> Cancel Order
                                    </button>
                                  )}
                                  <button onClick={() => { setSelectedOrder(o); setIsOrderDetailsOpen(true); }} className="btn btn-ghost clickable" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', border: '1px solid var(--border)' }}>
                                    <Eye size={14} /> Full Details
                                  </button>
                                </div>
                              </div>

                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* ── TAB 5: SHARE & REFERRALS ── */}
              {activeTab === 'share' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-share-grid animate-fade-in">

                  {/* Share Store Card */}
                  <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Viral Share Center</h2>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>Share your catalog link to receive instant shopper orders directly into your dashboard.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                      {/* URL Box */}
                      <div style={{ background: 'var(--bg-2)', padding: '16px 20px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store URL</label>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)', wordBreak: 'break-all' }}>
                            {store?.custom_domain ? store.custom_domain : (store ? `${systemDomain}/${store.username}` : systemDomain)}
                          </span>
                          <button
                            onClick={() => {
                              const storeUrl = store?.custom_domain ? `https://${store.custom_domain}` : `https://${systemDomain}/${store?.username}`;
                              navigator.clipboard.writeText(storeUrl);
                              toast.success('Store link copied! 📋');
                            }}
                            className="btn btn-outline clickable"
                            style={{ padding: '6px 12px', fontSize: 11, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp share CTA */}
                      <button
                        onClick={() => {
                          const url = store?.custom_domain ? `https://${store.custom_domain}` : `https://${systemDomain}/${store?.username}`;
                          const msg = encodeURIComponent(`🏪 Check out my digital store on Frontstore! Shop here: ${url}`);
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }}
                        className="btn clickable"
                        style={{ background: '#25d366', color: '#fff', padding: '14px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                      >
                        <WhatsAppIcon size={18} color="#fff" /> Share Store link on WhatsApp
                      </button>

                      {/* Visual storefront banner mock */}
                      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--bg-2)' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '16px 20px', color: '#fff' }}>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Store size={18} /> Shop Live: {store?.store_name}
                          </h4>
                          <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Fast browsing · Easy WhatsApp checkouts</p>
                        </div>
                        <div style={{ padding: 16, display: 'flex', gap: 10, overflowX: 'auto' }}>
                          {products.slice(0, 3).map(p => (
                            <div key={p.id} style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', width: 100, flexShrink: 0 }}>
                              <div style={{ width: '100%', height: 60, background: 'var(--bg-2)', borderRadius: 'var(--r-md)', overflow: 'hidden', position: 'relative' }}>
                                {p.image_urls?.[0] && <img src={p.image_urls[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                              </div>
                              <p style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 6 }}>{p.name}</p>
                              <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: 2 }}>{getCurrencySymbol(store?.currency_code)}{formatVal(p.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Viral referrals panel */}
                  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900 }}>Referral Reward Center</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Earn commissions by introducing other vendors to Frontstore.</p>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.02))', border: '1.5px dashed var(--primary)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>EARN MONEY</span>
                      <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', margin: '8px 0 2px' }}>
                        ₦1,500
                      </p>
                      <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>Paid for each store referral that publishes a product</span>
                    </div>

                    {/* Ref Link */}
                    <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your referral link</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{systemDomain}/ref/{store?.username}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://${systemDomain}/ref/${store?.username}`);
                            toast.success('Referral link copied! 💰');
                          }}
                          className="btn btn-outline clickable"
                          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)' }}
                        >
                          Copy link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 6: SETTINGS & DEVELOPER OVERRIDES ── */}
              {activeTab === 'templates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-fade-in">
                  <div className="card" style={{ padding: 24, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Storefront design</p>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 950, margin: 0, letterSpacing: '-0.02em' }}>Templates</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 680, marginTop: 8 }}>
                          Choose the public storefront design customers see when they visit your store. Activation is instant after selection.
                        </p>
                      </div>
                      <a
                        href={liveStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline clickable"
                        style={{ textDecoration: 'none', gap: 8, flexShrink: 0 }}
                      >
                        <ExternalLink size={16} /> View Store
                      </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                      {storeTemplates.map(template => {
                        const active = selectedTemplate === template.id;
                        const saving = templateSaving === template.id;
                        return (
                          <div
                            key={template.id}
                            className="card"
                            style={{
                              border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
                              borderRadius: 'var(--r-xl)',
                              overflow: 'hidden',
                              background: active ? 'var(--primary-light)' : 'var(--surface)',
                              boxShadow: active ? '0 16px 34px var(--primary-glow)' : 'var(--shadow-sm)',
                            }}
                          >
                            <div style={{
                              height: 140,
                              background: `linear-gradient(135deg, ${template.colors[0]} 0%, ${template.colors[1]} 56%, ${template.colors[2]} 100%)`,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(255,255,255,0.28)', borderRadius: 14 }} />
                              <div style={{ position: 'absolute', left: 22, bottom: 26, width: '52%', height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.9)' }} />
                              <div style={{ position: 'absolute', left: 22, bottom: 48, width: '34%', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.45)' }} />
                              <div style={{ position: 'absolute', right: 22, top: 22, width: 42, height: 42, borderRadius: template.id === 'atelier' ? 8 : 16, background: 'rgba(255,255,255,0.78)' }} />
                              <div style={{ position: 'absolute', right: 22, bottom: 22, display: 'grid', gridTemplateColumns: 'repeat(2, 28px)', gap: 7 }}>
                                {[0, 1, 2, 3].map(i => (
                                  <span key={i} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.32)' }} />
                                ))}
                              </div>
                            </div>

                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                                <div>
                                  <h3 style={{ fontSize: 16, fontWeight: 950, color: 'var(--text)', margin: 0 }}>{template.name}</h3>
                                  <p style={{ fontSize: 12, fontWeight: 850, color: active ? 'var(--primary)' : 'var(--text-2)', marginTop: 3 }}>{template.tone}</p>
                                </div>
                                {active && (
                                  <span className="badge badge-primary" style={{ flexShrink: 0 }}>
                                    <Check size={11} /> Active
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, minHeight: 38 }}>{template.description}</p>
                              <button
                                type="button"
                                onClick={() => handleTemplateActivate(template.id)}
                                disabled={saving || (active && !templateSaving)}
                                className={active ? 'btn btn-outline clickable' : 'btn btn-primary clickable'}
                                style={{ width: '100%', borderRadius: 'var(--r-md)', fontWeight: 850 }}
                              >
                                {saving ? <><Loader2 size={16} className="spinner" /> Activating...</> : active ? 'Active Template' : 'Activate Template'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Template colors</p>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 950, margin: 0 }}>Customize active storefront color</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 640, marginTop: 6 }}>
                          This color controls your active template buttons, highlights, catalog accents, and customer-facing storefront styling.
                        </p>
                      </div>
                      {!isPro && <span className="badge badge-accent" style={{ flexShrink: 0 }}>Pro feature</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'stretch' }} className="responsive-settings-grid">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 9 }}>Fast palettes</label>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {[
                              { name: 'Frontstore', value: '#10b981' },
                              { name: 'Ruby', value: '#e11d48' },
                              { name: 'Royal', value: '#4f46e5' },
                              { name: 'Ocean', value: '#0284c7' },
                              { name: 'Amber', value: '#d97706' },
                              { name: 'Graphite', value: '#27272a' },
                              { name: 'Teal', value: '#128c7e' },
                              { name: 'Violet', value: '#7c3aed' },
                            ].map(preset => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => setPrimaryColor(preset.value)}
                                title={preset.name}
                                aria-label={preset.name}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 12,
                                  background: preset.value,
                                  border: primaryColor === preset.value ? '3px solid var(--text)' : '1px solid var(--border)',
                                  boxShadow: primaryColor === preset.value ? '0 0 0 3px var(--surface), var(--shadow-md)' : 'var(--shadow-sm)',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center' }}>
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={e => setPrimaryColor(e.target.value)}
                            style={{ width: 56, height: 48, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                            aria-label="Custom template color"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={e => {
                              const val = e.target.value;
                              if (val.startsWith('#') && val.length <= 7) setPrimaryColor(val);
                            }}
                            className="input-field"
                            style={{ fontFamily: 'monospace', fontWeight: 800 }}
                            placeholder="#10b981"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleTemplateColorSave}
                          disabled={templateSaving === 'color'}
                          className="btn btn-primary clickable"
                          style={{ width: 'fit-content', borderRadius: 'var(--r-md)', fontWeight: 850 }}
                        >
                          {templateSaving === 'color' ? <><Loader2 size={16} className="spinner" /> Saving color...</> : 'Apply Color to Storefront'}
                        </button>
                      </div>

                      <div style={{
                        minHeight: 190,
                        borderRadius: 'var(--r-xl)',
                        padding: 18,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 56%, #ffffff) 100%)`,
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: `0 18px 42px ${primaryColor}33`
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 42px)', opacity: 0.45 }} />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{selectedTemplate.replace(/-/g, ' ')}</span>
                          <span style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(255,255,255,0.78)' }} />
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <h4 style={{ fontSize: 24, fontWeight: 950, margin: 0, fontFamily: 'var(--font-heading)' }}>Customer storefront preview</h4>
                          <p style={{ fontSize: 13, marginTop: 6, opacity: 0.86 }}>Buttons, badges, highlights, and accents use this color.</p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                            <span style={{ padding: '8px 12px', borderRadius: 999, background: '#fff', color: primaryColor, fontSize: 12, fontWeight: 900 }}>Shop now</span>
                            <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 900 }}>Featured</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">

                    {/* Shop Details updating form */}
                    <div className="card" style={{ padding: 24 }}>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 16 }}>Storefront Configuration</h2>

                      <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* ── Logo Upload ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                          <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'flex-start' }}>Store Logo</label>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <div
                              style={{
                                width: 90, height: 90, borderRadius: '50%',
                                background: logoUrl ? 'transparent' : 'var(--primary-light)',
                                border: '2.5px dashed var(--primary)',
                                overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', position: 'relative',
                                boxShadow: 'var(--shadow-md)'
                              }}
                              onClick={() => (document.getElementById('logo-upload-input') as HTMLInputElement)?.click()}
                              title="Click to upload logo"
                            >
                              {logoUploading ? (
                                <Loader2 size={24} className="spinner" style={{ color: 'var(--primary)' }} />
                              ) : logoUrl ? (
                                <img src={logoUrl} alt="Store logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                  <Camera size={24} style={{ color: 'var(--primary)' }} />
                                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Upload</span>
                                </div>
                              )}
                            </div>
                            {logoUrl && !logoUploading && (
                              <button
                                type="button"
                                onClick={() => setLogoUrl(null)}
                                style={{
                                  position: 'absolute', top: -4, right: -4,
                                  width: 22, height: 22, borderRadius: '50%',
                                  background: 'var(--danger)', border: 'none',
                                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', fontSize: 12, lineHeight: 1, boxShadow: 'var(--shadow-sm)'
                                }}
                                title="Remove logo"
                              >✕</button>
                            )}
                          </div>
                          <input
                            id="logo-upload-input"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setLogoUploading(true);
                                const formData = new FormData();
                                formData.append('logo', file);
                                const res = await fetch(`${apiUrl}/v1/store/upload-logo`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
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
                                e.target.value = '';
                              }
                            }}
                          />
                          <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>Click the circle to upload a logo<br />(JPG, PNG, WEBP · max 5MB)</p>
                        </div>
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
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, margin: 0 }}>Storefront Writing</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>
                              Control the words customers see on your public storefront. Free stores always show the active template name.
                            </p>
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
                        </div>

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

                        <div className="responsive-form-row">
                          <div>
                            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>WhatsApp Number</label>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1.5px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              background: 'var(--surface)',
                              transition: 'all var(--t-fast)',
                              position: 'relative'
                            }}>
                              {/* Country Code Trigger Button */}
                              <button
                                type="button"
                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '0 14px',
                                  height: '100%',
                                  minHeight: 46,
                                  background: 'none',
                                  border: 'none',
                                  borderRight: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  fontSize: 15,
                                  color: 'var(--text)',
                                  fontWeight: 600,
                                  userSelect: 'none'
                                }}
                              >
                                <span style={{ fontSize: 18 }}>{selectedCountry.flag}</span>
                                <span>{selectedCountry.dialCode}</span>
                                <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
                              </button>

                              {/* Real Phone Input */}
                              <input
                                type="tel"
                                required
                                placeholder="e.g. 803 123 4567"
                                value={localWhatsapp}
                                onChange={e => setLocalWhatsapp(e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '13px 14px',
                                  border: 'none',
                                  fontSize: 15,
                                  outline: 'none',
                                  background: 'transparent',
                                  color: 'var(--text)',
                                  minWidth: 0,
                                }}
                                autoComplete="tel"
                              />

                              {/* Dropdown Menu */}
                              {isCountryDropdownOpen && (
                                <div className="glass animate-scale-in" style={{
                                  position: 'absolute',
                                  top: '110%',
                                  left: 0,
                                  width: 280,
                                  maxHeight: 250,
                                  overflowY: 'auto',
                                  borderRadius: 'var(--r-lg)',
                                  border: '1px solid var(--border)',
                                  background: 'var(--surface)',
                                  boxShadow: 'var(--shadow-lg)',
                                  zIndex: 100,
                                  padding: '6px 0'
                                }}>
                                  {countries.map((c, idx) => (
                                    <button
                                      key={c.code}
                                      type="button"
                                      onMouseEnter={() => setHoveredCountryIndex(idx)}
                                      onMouseLeave={() => setHoveredCountryIndex(null)}
                                      onClick={() => {
                                        setSelectedCountry(c);
                                        setIsCountryDropdownOpen(false);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: selectedCountry.code === c.code
                                          ? 'var(--primary-light)'
                                          : hoveredCountryIndex === idx
                                            ? 'var(--bg-2)'
                                            : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        textAlign: 'left',
                                        color: selectedCountry.code === c.code ? 'var(--primary)' : 'var(--text)',
                                        fontWeight: selectedCountry.code === c.code ? 750 : 600,
                                        transition: 'background var(--t-fast)'
                                      }}
                                    >
                                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 18 }}>{c.flag}</span>
                                        <span>{c.name}</span>
                                      </span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.dialCode}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
                              Enter local number (e.g. 0808 943 7483). Country code is added automatically.
                            </span>
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
                        </div>

                        {/* Storefront Branding & Colors */}
                        <div style={{
                          position: 'relative',
                          border: '1.5px solid var(--border)',
                          borderRadius: 'var(--r-xl)',
                          padding: 20,
                          background: 'var(--bg-2)',
                          marginTop: 16,
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
                          </h3>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
                            Customize the primary color of your storefront buttons, badges, highlights, and icons.
                          </p>

                          {/* Preset Swatches */}
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8 }}>Preset Color Palettes</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              {[
                                { name: 'WhatsApp', value: '#10b981' },
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

                          {/* Custom Picker & Live Preview Grid */}
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
                                  placeholder="#10b981"
                                />
                              </div>
                            </div>

                            {/* Live Preview UI Widget */}
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

                              {/* Sample primary button */}
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

                              {/* Sample Chat bubble */}
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

                        <button
                          type="submit"
                          disabled={settingsSaving}
                          className="btn btn-primary clickable"
                          style={{ padding: '14px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10 }}
                        >
                          {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : 'Save Configuration Changes'}
                        </button>
                      </form>
                    </div>

                    {/* Settings Side Panels (Identity, Developer Overrides) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                      {/* Identity Info Panel */}
                      <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Identity Context</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Merchant Name</span>
                            <span style={{ fontWeight: 800 }}>{user?.name}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Sign-in Phone</span>
                            <span style={{ fontWeight: 700 }}>{user?.phone_number}</span>
                          </div>
                          {user?.email && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Registered Email</span>
                              <span style={{ fontWeight: 700 }}>{user.email}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Store Username</span>
                            <span style={{ fontWeight: 700 }}>@{store?.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Change Password Card */}
                      <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                          <div style={{ background: 'var(--primary-light)', padding: 5, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
                            <Key size={14} />
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>Update Password</h3>
                        </div>
                        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Current Password */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showCpCurrent ? 'text' : 'password'}
                                value={cpCurrent}
                                onChange={e => setCpCurrent(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingRight: 40, height: 38, fontSize: 13.5 }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCpCurrent(!showCpCurrent)}
                                style={{
                                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                  background: 'none', border: 'none', color: 'var(--text-muted)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >
                                {showCpCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showCpNew ? 'text' : 'password'}
                                value={cpNew}
                                onChange={e => setCpNew(e.target.value)}
                                className="input-field"
                                placeholder="Min 6 characters"
                                style={{ paddingRight: 40, height: 38, fontSize: 13.5 }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCpNew(!showCpNew)}
                                style={{
                                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                  background: 'none', border: 'none', color: 'var(--text-muted)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >
                                {showCpNew ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showCpConfirm ? 'text' : 'password'}
                                value={cpConfirm}
                                onChange={e => setCpConfirm(e.target.value)}
                                className="input-field"
                                placeholder="Confirm new password"
                                style={{ paddingRight: 40, height: 38, fontSize: 13.5 }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCpConfirm(!showCpConfirm)}
                                style={{
                                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                  background: 'none', border: 'none', color: 'var(--text-muted)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >
                                {showCpConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={cpSaving}
                            className="btn btn-primary clickable"
                            style={{
                              width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)',
                              fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                          >
                            {cpSaving ? (
                              <>
                                <Loader2 size={14} className="spinner" />
                                Updating...
                              </>
                            ) : 'Update Password'}
                          </button>
                        </form>
                      </div>


                      {/* Developer settings URL override */}
                      {isDev && (
                        <div className="card" style={{ padding: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <div style={{ background: 'var(--danger-light)', padding: 4, borderRadius: 'var(--r-sm)', color: 'var(--danger)' }}>
                              <Settings size={14} />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800 }}>Developer Overrides</h3>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                            Change the backend API endpoint address. (Default port is 8000). Useful for connecting local network devices.
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input
                              type="text"
                              value={devApiInput}
                              onChange={e => setDevApiInput(e.target.value)}
                              className="input-field"
                              style={{ padding: '8px 12px', fontSize: 13, height: 38 }}
                            />
                            <button
                              onClick={handleSaveDevApi}
                              className="btn btn-outline clickable"
                              style={{ width: '100%', padding: '8px', fontSize: 12, borderRadius: 'var(--r-md)', fontWeight: 700 }}
                            >
                              Sync Host Address
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* ── CUSTOM DOMAIN CONFIGURATION CARD ── */}
                  <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24, position: 'relative', overflow: 'hidden' }}>

                    {/* Lock Overlay if Free */}
                    {(user?.plan === 'free' || !user?.plan) && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(5px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        textAlign: 'center', zIndex: 10, padding: 24
                      }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: '50%',
                          background: '#fef3c7', color: '#d97706',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(217,119,6,0.15)', marginBottom: 12
                        }}>
                          <Zap size={24} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>Custom Domain Mapping</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, marginTop: 4, marginBottom: 16, lineHeight: 1.5 }}>
                          Connect your own custom domain (e.g. <code>mybrand.com</code>) to personalize your store URL. Requires a Pro subscription.
                        </p>
                        <button
                          type="button"
                          onClick={() => openUpgradePrompt(
                            'Custom domain mapping requires Pro',
                            'Connect your own domain to your store when you are ready for a more branded storefront experience.'
                          )}
                          className="btn btn-primary clickable"
                          style={{ padding: '8px 20px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13 }}
                        >
                          Upgrade to Pro (₦1,500/mo)
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
                          Connect your own custom domain (e.g. <code>mybrand.com</code>) to your Frontstore storefront using nameservers.
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
                              {store.custom_domain}
                              <span style={{ fontSize: 11, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 800 }}>ACTIVE</span>
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
                        <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: 12, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                          ✨ Shoppers can now access your store directly at <a href={`https://${store.custom_domain}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800, color: 'var(--primary-dark)', textDecoration: 'underline' }}>https://{store.custom_domain}</a>
                        </div>
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

                            {/* Bypass checkbox */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                              <input
                                type="checkbox"
                                id="bypass-dns-checkbox"
                                checked={customDomainBypassDNS}
                                onChange={e => setCustomDomainBypassDNS(e.target.checked)}
                                style={{ cursor: 'pointer', width: 15, height: 15 }}
                              />
                              <label htmlFor="bypass-dns-checkbox" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                Simulate DNS check (local/testing)
                              </label>
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 18 }}>
                            <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                              Nameservers Setup Instructions
                            </h4>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                              At your domain registrar (GoDaddy, Namecheap, etc.), change your nameservers to:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '6px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 12.5, fontFamily: 'monospace' }}>
                                <span>ns1.{systemDomain}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`ns1.${systemDomain}`);
                                    toast.success(`Copied ns1.${systemDomain}`);
                                  }}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                                >Copy</button>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '6px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 12.5, fontFamily: 'monospace' }}>
                                <span>ns2.{systemDomain}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`ns2.${systemDomain}`);
                                    toast.success(`Copied ns2.${systemDomain}`);
                                  }}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                                >Copy</button>
                              </div>
                            </div>
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
                                    { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon size={14} /> },
                                    { value: 'instagram', label: 'Instagram', icon: <Camera size={14} /> },
                                    { value: 'tiktok', label: 'TikTok', icon: <Zap size={14} /> },
                                    { value: 'twitter', label: 'Twitter / X', icon: <Zap size={14} /> },
                                    { value: 'facebook', label: 'Facebook', icon: <Globe size={14} /> },
                                    { value: 'youtube', label: 'YouTube', icon: <Globe size={14} /> },
                                    { value: 'linkedin', label: 'LinkedIn', icon: <Globe size={14} /> },
                                    { value: 'pinterest', label: 'Pinterest', icon: <Globe size={14} /> },
                                    { value: 'snapchat', label: 'Snapchat', icon: <Globe size={14} /> }
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
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                <input
                                  type="checkbox"
                                  checked={linkActive}
                                  onChange={e => setLinkActive(e.target.checked)}
                                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                                />
                                Show link on storefront
                              </label>

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
                                  case 'instagram': return <Camera size={14} style={{ color: '#e1306c' }} />;
                                  case 'tiktok': return <Music2 size={14} style={{ color: '#00f2fe' }} />;
                                  case 'facebook': return <Facebook size={14} style={{ color: '#1877f2' }} />;
                                  case 'twitter': return <Twitter size={14} style={{ color: '#1da1f2' }} />;
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
                                        if (confirm(`Are you sure you want to remove "${link.title}"?`)) {
                                          setCustomLinks(prev => prev.filter(l => l.id !== link.id));
                                          toast.info('Link deleted locally.');
                                        }
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
                                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{setStoreName.charAt(0).toUpperCase() || 'A'}</span>
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
                                  <Camera size={11} />
                                </div>
                              )}
                              {setTiktok && (
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                  <Zap size={11} />
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
                                  {link.platform === 'instagram' && <Camera size={11} style={{ color: '#e1306c' }} />}
                                  {link.platform === 'tiktok' && <Music2 size={11} style={{ color: '#00f2fe' }} />}
                                  {link.platform === 'facebook' && <Facebook size={11} style={{ color: '#1877f2' }} />}
                                  {link.platform === 'twitter' && <Twitter size={11} style={{ color: '#1da1f2' }} />}
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
                    </div>
                  </div>

                  {/* ── PAYMENT ACCOUNTS CARD ── */}
                  <div className="card" style={{ padding: 28 }}>

                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(22,163,74,0.35)', flexShrink: 0
                      }}>
                        <DollarSign size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Payment Accounts
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          Bank transfer details buyers use to pay you. Account name must match your registered name or business name.
                        </p>
                      </div>
                    </div>

                    {/* Step 1: Bank selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{
                        padding: 18,
                        borderRadius: 'var(--r-xl)',
                        border: '1.5px solid var(--border)',
                        background: store?.paystack_dva_active
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.03))'
                          : 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 18 }}>🏦</span>
                            <strong style={{ fontSize: 14.5 }}>Dedicated Paystack account</strong>
                            {store?.paystack_dva_active && (
                              <span className="badge badge-primary" style={{ fontSize: 10 }}>Active</span>
                            )}
                          </div>
                          {store?.paystack_dva_account_number ? (
                            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                              {store.paystack_dva_bank_name || 'Paystack'} · <strong>{store.paystack_dva_account_number}</strong> · {store.paystack_dva_account_name}
                            </p>
                          ) : (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                              Pro merchants can generate a dedicated account buyers pay into through Paystack.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className={isPro ? 'btn btn-primary clickable' : 'btn btn-outline clickable'}
                          onClick={handleGenerateDedicatedAccount}
                          disabled={isGeneratingDedicatedAccount}
                          style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          {isGeneratingDedicatedAccount ? <><Loader2 size={15} className="spinner" /> Generating...</> : store?.paystack_dva_account_number ? 'Refresh account' : 'Generate account'}
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

                        {/* Bank Searchable Dropdown */}
                        <div style={{ position: 'relative' }}>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            Bank / Provider
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={paymentBankName}
                              onChange={e => {
                                setPaymentBankName(e.target.value);
                                setPaymentBankCode('');
                                setPaymentAccountName('');
                                setAccountVerified(false);
                                setNameMatchOk(null);
                                setVerifyError('');
                                setBankDropdownOpen(true);
                              }}
                              onFocus={() => setBankDropdownOpen(true)}
                              className="input-field"
                              placeholder={bankList.length > 0 ? 'Search bank or provider...' : 'Loading banks...'}
                              id="payment-bank-name"
                              autoComplete="off"
                            />
                            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                          </div>
                          {/* Bank dropdown list */}
                          {bankDropdownOpen && (() => {
                            const q = paymentBankName.toLowerCase();
                            const filtered = bankList.filter(b => b.name.toLowerCase().includes(q));
                            if (filtered.length === 0) return null;
                            return (
                              <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
                                background: 'var(--surface)', border: '1.5px solid var(--border)',
                                borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
                                maxHeight: 230, overflowY: 'auto', marginTop: 4,
                              }}>
                                {filtered.map((bank, i) => (
                                  <button
                                    key={bank.code}
                                    type="button"
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      setPaymentBankName(bank.name);
                                      setPaymentBankCode(bank.code);
                                      setBankDropdownOpen(false);
                                      // Auto-resolve if account number already entered
                                      if (paymentAccountNumber.length === 10) {
                                        resolveAccountName(paymentAccountNumber, bank.code);
                                      }
                                    }}
                                    style={{
                                      width: '100%', textAlign: 'left', background: 'none',
                                      border: 'none', padding: '10px 14px', fontSize: 13.5,
                                      fontWeight: 600, cursor: 'pointer', color: 'var(--text)',
                                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      transition: 'background var(--t-fast)',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                  >
                                    <span style={{ fontSize: 16 }}>🏦</span>
                                    <span style={{ flex: 1 }}>{bank.name}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{bank.code}</span>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                          {paymentBankCode && (
                            <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Check size={11} /> Bank selected
                            </span>
                          )}
                        </div>

                        {/* Account Number — auto-resolves on 10 digits */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            Account Number
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={10}
                              value={paymentAccountNumber}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPaymentAccountNumber(val);
                                setPaymentAccountName('');
                                setAccountVerified(false);
                                setNameMatchOk(null);
                                setVerifyError('');
                                if (val.length === 10 && paymentBankCode) {
                                  resolveAccountName(val, paymentBankCode);
                                }
                              }}
                              className="input-field"
                              placeholder="10-digit account number"
                              id="payment-account-number"
                              style={{
                                paddingRight: 44,
                                fontFamily: 'monospace',
                                letterSpacing: '0.08em',
                                fontSize: 15,
                                borderColor: accountVerified ? '#16a34a' : undefined,
                              }}
                            />
                            {/* Right-side indicator */}
                            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                              {isVerifying ? (
                                <Loader2 size={15} className="spinner" style={{ color: 'var(--primary)' }} />
                              ) : accountVerified ? (
                                <span style={{ color: '#16a34a', display: 'flex' }}><CheckCircle2 size={17} /></span>
                              ) : paymentAccountNumber.length === 10 && paymentBankCode ? (
                                <span style={{ color: 'var(--danger)', display: 'flex' }}><AlertCircle size={17} /></span>
                              ) : null}
                            </div>
                          </div>
                          {/* Resolve status messages */}
                          {isVerifying && (
                            <p style={{ fontSize: 11.5, color: 'var(--primary)', marginTop: 5, fontWeight: 600 }}>⏳ Verifying account with Paystack...</p>
                          )}
                          {verifyError && !isVerifying && (
                            <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5, fontWeight: 600 }}>⚠️ {verifyError}</p>
                          )}
                          {!paymentBankCode && paymentAccountNumber.length > 0 && (
                            <p style={{ fontSize: 11.5, color: 'var(--accent)', marginTop: 5, fontWeight: 600 }}>⬆️ Please select a bank first.</p>
                          )}
                        </div>

                      </div>

                      {/* Verified Account Name — read-only result */}
                      {(accountVerified || isVerifying) && (
                        <div style={{
                          padding: '16px 20px',
                          borderRadius: 'var(--r-lg)',
                          border: `2px solid ${nameMatchOk === false ? 'var(--danger)' : '#16a34a'}`,
                          background: nameMatchOk === false ? 'rgba(239,68,68,0.06)' : 'rgba(22,163,74,0.07)',
                          display: 'flex', flexDirection: 'column', gap: 6,
                          transition: 'all 0.3s'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                              <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Verified Account Name</span>
                              <p style={{ fontSize: 16, fontWeight: 900, marginTop: 2, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                                {paymentAccountName || '...'}
                              </p>
                            </div>
                            {nameMatchOk === true && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                background: '#16a34a', color: '#fff',
                                padding: '5px 12px', borderRadius: 'var(--r-full)',
                                fontSize: 12, fontWeight: 800
                              }}>
                                <Check size={13} /> Name Match
                              </span>
                            )}
                            {nameMatchOk === false && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                background: 'var(--danger)', color: '#fff',
                                padding: '5px 12px', borderRadius: 'var(--r-full)',
                                fontSize: 12, fontWeight: 800
                              }}>
                                <AlertCircle size={13} /> Mismatch
                              </span>
                            )}
                          </div>
                          {nameMatchOk === false && (
                            <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginTop: 4, lineHeight: 1.5 }}>
                              ⚠️ The verified name <strong>{paymentAccountName}</strong> does not match your registered name (<strong>{user?.name}</strong>) or store name. Please use a bank account that matches your identity.
                            </p>
                          )}
                          {nameMatchOk === true && (
                            <p style={{ fontSize: 12, color: '#15803d', fontWeight: 600, marginTop: 2 }}>
                              ✅ Account verified — name matches your profile. You can save.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Payment Instructions */}
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Payment Instructions <span style={{ fontWeight: 500, textTransform: 'none', color: 'var(--text-faint)', fontSize: 11 }}>(optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={paymentInstructions}
                          onChange={e => setPaymentInstructions(e.target.value)}
                          className="input-field"
                          style={{ resize: 'vertical' }}
                          placeholder="e.g. Send payment screenshot to WhatsApp after transfer."
                          id="payment-instructions"
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>Shown to buyers after checkout so they know next steps.</span>
                      </div>

                      {/* Save Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
                        <button
                          onClick={handleSettingsSave as any}
                          disabled={settingsSaving || !accountVerified || nameMatchOk === false}
                          className="btn btn-primary clickable"
                          style={{ padding: '13px 28px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : '💳 Save Payment Details'}
                        </button>
                        {!accountVerified && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                            Account must be verified before saving.
                          </span>
                        )}
                        {accountVerified && nameMatchOk === false && (
                          <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
                            Name mismatch — cannot save until resolved.
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* ── TAB: BROADCAST MESSAGES ── */}
              {activeTab === 'reach' && (
                <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
                  <div style={{ background: 'rgba(255, 159, 67, 0.15)', color: '#FF9F43', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Megaphone size={32} style={{ margin: 'auto' }} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Broadcast Messages</h2>
                  <p style={{ fontSize: 11.5, fontWeight: 800, color: '#FF9F43', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Automated Marketing & Broadcasting</p>
                  <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                    Retarget your customers automatically. Send updates, discount codes, or custom promotional messages directly to your shoppers' WhatsApp inboxes with 98% open rates.
                  </p>
                  
                  {/* Features List */}
                  <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Smart Retargeting Campaigns</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>WhatsApp Broadcast Newsletters</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Custom Discount Trigger Automations</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUpgradePrompt(
                      'Broadcast reach requires Pro',
                      'Automated WhatsApp campaigns and retargeting tools are available on Pro. You can review the plan before upgrading.'
                    )}
                    className="btn btn-primary clickable"
                    style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
                  >
                    <Zap size={16} /> Upgrade to Pro to Unlock Reach
                  </button>
                </div>
              )}

              {/* ── TAB 7: PLANS & BILLING ── */}
              {activeTab === 'billing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(245,158,11,0.3)', flexShrink: 0
                    }}>
                      <Zap size={22} color="#fff" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                        Subscription Plans & Billing
                      </h2>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Unlock custom domain, store bio profile description, product details, and ChatGPT AI features.
                      </p>
                    </div>
                  </div>

                  {/* Plan Card Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }} className="responsive-settings-grid">

                    {/* Free Plan */}
                    <div className="card" style={{
                      padding: 28,
                      display: 'flex',
                      flexDirection: 'column',
                      border: user?.plan === 'free' || !user?.plan ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                      position: 'relative',
                      background: 'var(--surface)'
                    }}>
                      {(user?.plan === 'free' || !user?.plan) && (
                        <span style={{
                          position: 'absolute', top: 12, right: 12,
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          fontSize: 10, fontWeight: 900, padding: '4px 10px',
                          borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>Current Plan</span>
                      )}

                      <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Free Starter Plan</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>For small merchants starting their digital shop.</p>

                      <div style={{ marginTop: 20, marginBottom: 24 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>₦0</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}> / free forever</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span><strong>4% transaction fee</strong> per completed order</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span>Limit of 3 products total</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span>Unlimited WhatsApp orders</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span>Public catalog storefront</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span>Verify Paystack bank account</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span>Manually edit store title, bio &amp; description</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="var(--primary)" />
                          <span>Manually upload product images</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.5 }}>
                          <span style={{ color: 'var(--danger)', fontWeight: 900, marginRight: 6 }}>✕</span>
                          <span style={{ textDecoration: 'line-through' }}>Custom domain name mapping</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.5 }}>
                          <span style={{ color: 'var(--danger)', fontWeight: 900, marginRight: 6 }}>✕</span>
                          <span style={{ textDecoration: 'line-through' }}>AI description auto-write (ChatGPT)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={user?.plan === 'free' || !user?.plan}
                        onClick={() => handleUpgradePlan('free')}
                        className={`btn clickable`}
                        style={{
                          width: '100%', marginTop: 24, padding: 12,
                          background: user?.plan === 'free' || !user?.plan ? 'var(--bg-2)' : 'transparent',
                          border: user?.plan === 'free' || !user?.plan ? '1px solid var(--border)' : '1px solid var(--primary)',
                          color: user?.plan === 'free' || !user?.plan ? 'var(--text-muted)' : 'var(--primary)',
                          fontWeight: 800, borderRadius: 'var(--r-md)'
                        }}
                      >
                        {user?.plan === 'free' || !user?.plan ? 'Active Plan' : 'Downgrade to Free'}
                      </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="card" style={{
                      padding: 28,
                      display: 'flex',
                      flexDirection: 'column',
                      border: user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly' ? '2.5px solid #f59e0b' : '1px solid var(--border)',
                      position: 'relative',
                      background: 'var(--surface)',
                      boxShadow: '0 10px 25px -5px rgba(245,158,11,0.08)'
                    }}>
                      {(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') && (
                        <span style={{
                          position: 'absolute', top: 12, right: 12,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff',
                          fontSize: 10, fontWeight: 900, padding: '4px 10px',
                          borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.05em',
                          display: 'flex', alignItems: 'center', gap: 4
                        }}><Sparkles size={8} /> Active Pro ({user?.plan === 'pro_yearly' ? 'Yearly' : 'Monthly'})</span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Pro Business Plan</h3>
                        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>POPULAR</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Unlock full branding, SEO features, and ChatGPT AI.</p>

                      {/* Billing Cycle Toggle */}
                      <div style={{
                        display: 'flex',
                        background: 'var(--bg-2)',
                        padding: 4,
                        borderRadius: 'var(--r-md)',
                        marginTop: 16,
                        marginBottom: 4,
                        border: '1px solid var(--border)',
                        width: 'fit-content'
                      }}>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('monthly')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--r-sm)',
                            border: 'none',
                            background: billingCycle === 'monthly' ? 'var(--surface)' : 'transparent',
                            color: billingCycle === 'monthly' ? 'var(--text)' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            boxShadow: billingCycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('yearly')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--r-sm)',
                            border: 'none',
                            background: billingCycle === 'yearly' ? 'var(--surface)' : 'transparent',
                            color: billingCycle === 'yearly' ? 'var(--text)' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            boxShadow: billingCycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.2s'
                          }}
                        >
                          Yearly
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            fontSize: 9,
                            fontWeight: 900,
                            padding: '1px 5px',
                            borderRadius: 4
                          }}>
                            Save 17%
                          </span>
                        </button>
                      </div>

                      <div style={{ marginTop: 16, marginBottom: 20 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
                          {billingCycle === 'monthly' ? '₦1,500' : '₦15,000'}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                          {billingCycle === 'monthly' ? ' / month' : ' / year'}
                        </span>
                        {billingCycle === 'yearly' && (
                          <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 700, marginTop: 4 }}>
                            equivalent to ₦1,250 / month (billed annually)
                          </div>
                        )}
                      </div>
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span><strong>1.5% transaction fee</strong> on sales</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span><strong>Unlimited products</strong> (unlimited listings)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span><strong>Custom domain name</strong> (e.g. <code>mybrand.com</code>)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span><strong>ChatGPT AI auto-write</strong> — generate title, bio &amp; descriptions instantly</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span><strong>AI product description</strong> generation for every listing</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span>Priority support &amp; instant feature updates</span>
                        </div>
                      </div>
 
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 24 }}>
                        <button
                          type="button"
                          disabled={(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') || isInitializingPayment}
                          onClick={() => handleUpgradePlan(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly')}
                          className={`btn clickable`}
                          style={{
                            padding: 12,
                            background: (user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'none',
                            border: '1.5px solid #d97706',
                            color: (user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') ? '#fff' : '#d97706',
                            fontWeight: 800, borderRadius: 'var(--r-md)', fontSize: 13,
                            opacity: ((user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') || isInitializingPayment) ? 0.7 : 1,
                            display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                          }}
                        >
                          {isInitializingPayment ? <Loader2 size={14} className="spinner" /> : null}
                          {(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly')
                            ? `✓ Active Plan (${user?.plan === 'pro_yearly' ? 'Yearly' : 'Monthly'})`
                            : isInitializingPayment
                              ? 'Redirecting...'
                              : billingCycle === 'monthly'
                                ? 'Go Pro Monthly'
                                : 'Go Pro Yearly'}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ── TAB 8: WALLET & PAYOUTS ── */}
              {activeTab === 'wallet' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.3)', flexShrink: 0
                    }}>
                      <DollarSign size={22} color="#fff" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                        Wallet Balance
                      </h2>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Wallet & Payouts: Withdraw funds to your verified bank account instantly.
                      </p>
                    </div>
                  </div>

                  {/* Wallet loading/error state if applicable */}
                  {walletLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                      <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)' }} />
                    </div>
                  )}

                  {!walletLoading && (
                    <>
                      {/* Balance Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                        {/* Withdrawable Balance Card */}
                        <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Withdrawable Balance</span>
                          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                            {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.withdrawable_balance)}
                          </div>
                          <button
                            onClick={() => {
                              if (!walletBalances.bank_account_verified) {
                                toast.warning('Please verify and save your Bank Details in Settings first.');
                                return;
                              }
                              setIsWithdrawModalOpen(true);
                            }}
                            className="btn btn-primary clickable"
                            style={{ marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13 }}
                          >
                            Withdraw Funds
                          </button>
                        </div>

                        {/* Pending Escrow Balance Card */}
                        <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            Pending (Escrow) Balance
                            <span title="Funds held in escrow until buyers confirm delivery of order."><AlertCircle size={14} style={{ color: 'var(--text-faint)' }} /></span>
                          </span>
                          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                            {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.pending_balance)}
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 16, lineHeight: 1.4 }}>
                            {isPro ? 'Pro plan bypasses escrow. Upfront payments credit immediately to your withdrawable balance!' : 'Under the Free Starter plan, checkout payments are held in escrow and released only when customers confirm delivery.'}
                          </p>
                        </div>
                      </div>

                      {/* Trust Verification Card */}
                      <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={18} style={{ color: 'var(--primary)' }} />
                          Trust & Store Verification
                        </h3>

                        {store?.verification_status === 'verified' && (
                          <div style={{ display: 'flex', gap: 16, background: 'var(--primary-light)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--primary-border)' }}>
                            <BadgeCheck size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <div>
                              <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)' }}>Storefront Verified!</h4>
                              <p style={{ fontSize: 12.5, color: 'var(--text)', marginTop: 4, lineHeight: 1.5 }}>
                                Your business registration details or identity documents have been approved. A green "Verified" checkmark badge is now visible on your public storefront to build buyer trust.
                              </p>
                            </div>
                          </div>
                        )}

                        {store?.verification_status === 'pending' && (
                          <div style={{ display: 'flex', gap: 16, background: 'var(--bg-2)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                            <RefreshCw size={24} className="spinner" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <div>
                              <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Verification Under Review</h4>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                                We are currently reviewing your submitted verification document ({store?.verification_document_type ? store.verification_document_type.replace('_', ' ').toUpperCase() : 'ID'}). The verification badge will appear once approved.
                              </p>
                            </div>
                          </div>
                        )}

                        {(store?.verification_status === 'unverified' || store?.verification_status === 'rejected' || !store?.verification_status) && (
                          <div>
                            {store?.verification_status === 'rejected' && (
                              <div style={{ display: 'flex', gap: 16, background: '#fee2e2', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid #fca5a5', marginBottom: 20 }}>
                                <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                                <div>
                                  <h4 style={{ fontWeight: 800, fontSize: 14, color: '#b91c1c' }}>Verification Request Declined</h4>
                                  <p style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4, lineHeight: 1.5 }}>
                                    Your previous submission was rejected. Please ensure your document scan is clearly visible and matches your account details, then upload and resubmit.
                                  </p>
                                </div>
                              </div>
                            )}

                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                              To display a "Verified" trust badge on your public storefront and access higher payout limits, submit a scan of a government-issued ID or official business registration document.
                            </p>

                            <form onSubmit={handleSubmitVerification} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Document Type</label>
                                <SearchableSelect
                                  options={[
                                    { value: 'national_id', label: 'National ID Card (NIN)' },
                                    { value: 'intl_passport', label: 'International Passport' },
                                    { value: 'drivers_license', label: "Driver's License" },
                                    { value: 'business_registration', label: 'CAC Business Registration Document' },
                                  ]}
                                  value={verificationDocType}
                                  onChange={val => setVerificationDocType(val)}
                                  placeholder="Select document type"
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Upload Document File (Image/PDF)</label>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={async e => {
                                      const file = e.target.files?.[0];
                                      if (file) await handleUploadVerificationDoc(file);
                                    }}
                                    style={{ display: 'none' }}
                                    id="verification-file-input"
                                  />
                                  <label
                                    htmlFor="verification-file-input"
                                    className="btn btn-outline clickable"
                                    style={{
                                      padding: '12px 20px', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                                    }}
                                  >
                                    {verificationUploading ? <Loader2 size={16} className="spinner" /> : <Camera size={16} />}
                                    {verificationDocUrl ? 'Change Document File' : 'Choose Document File'}
                                  </label>
                                  {verificationDocUrl && (
                                    <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <CheckCircle2 size={14} /> Document Uploaded
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={isSubmittingVerification || !verificationDocUrl || verificationUploading}
                                className="btn btn-primary clickable"
                                style={{
                                  padding: '12px 24px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13.5, width: 'fit-content', marginTop: 8
                                }}
                              >
                                {isSubmittingVerification ? <><Loader2 size={15} className="spinner" /> Submitting...</> : 'Submit Documents for Verification'}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* Withdrawal Request History Log */}
                      <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16 }}>Withdrawal History</h3>
                        {withdrawals.length === 0 ? (
                          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
                            <Receipt size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ fontSize: 13.5, fontWeight: 600 }}>No withdrawal transactions yet.</p>
                            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>Your withdrawal history logs will appear here.</p>
                          </div>
                        ) : (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 500 }}>
                              <thead>
                                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                                  <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                  <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                                  <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Bank Details</th>
                                  <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {withdrawals.map((w: any) => {
                                  const dateStr = new Date(w.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  });
                                  return (
                                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
                                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{dateStr}</td>
                                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text)' }}>{getCurrencySymbol(store?.currency_code)}{formatVal(w.amount)}</td>
                                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                                        {w.bank_name} • {w.account_number} <span style={{ fontSize: 11, display: 'block', color: 'var(--text-faint)' }}>{w.account_name}</span>
                                      </td>
                                      <td style={{ padding: '12px 8px' }}>
                                        <span style={{
                                          padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                                          background: w.status === 'approved' ? 'var(--primary-light)' : w.status === 'rejected' ? '#fee2e2' : '#ffedd5',
                                          color: w.status === 'approved' ? 'var(--primary)' : w.status === 'rejected' ? '#dc2626' : '#d97706'
                                        }}>
                                          {w.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                </div>
              )}
            </>
          )}

        </div>

      </main>

      {/* ── MOBILE MENU SLIDEOUT DRAWER ── */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} className="animate-fade-in">
          {/* Overlay mask */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
          />
          {/* Drawer content */}
          <div className="animate-drawer" style={{
            position: 'relative',
            width: 280,
            background: 'var(--surface)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            borderRight: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Store size={22} style={{ color: 'var(--primary)' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18 }}>frontstore</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {[
                { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} /> },
                { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
                { id: 'products', label: 'My Products', icon: <Package size={18} /> },
                { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={18} /> },
                { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={18} /> },
                { id: 'share', label: 'Share & Earn', icon: <Share2 size={18} /> },
                { id: 'templates', label: 'Store Themes', icon: <Sparkles size={18} /> },
                { id: 'settings', label: isDev ? 'Settings & Dev' : 'Settings', icon: <Settings size={18} /> },
                { id: 'billing', label: 'Plans & Billing', icon: <Zap size={18} /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateDashboardTab(item.id as DashboardTab);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: 14.5,
                    fontWeight: activeTab === item.id ? 800 : 600,
                    textAlign: 'left'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Theme Mode</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost clickable"
                style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', justifyContent: 'flex-start', padding: 10 }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WITHDRAW FUNDS OVERLAY ── */}
      {isWithdrawModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsWithdrawModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 440, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={18} style={{ color: 'var(--primary)' }} /> Request Payout Withdrawal
              </h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
              Specify the amount you would like to withdraw from your withdrawable balance. Funds will be transferred to your verified bank account below.
            </p>

            <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Destination Bank Details</span>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>
                {walletBalances.bank_name} • {walletBalances.bank_account_number}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {walletBalances.bank_account_name}
              </div>
            </div>

            <form onSubmit={handleRequestWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Amount to Withdraw ({getCurrencySymbol(store?.currency_code)})
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    required
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={e => setWithdrawalAmount(e.target.value)}
                    className="input-field"
                    style={{ paddingRight: 80 }}
                    min="1"
                    step="0.01"
                    max={walletBalances.withdrawable_balance}
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawalAmount(walletBalances.withdrawable_balance.toString())}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      border: 'none', background: 'var(--primary-light)', color: 'var(--primary)',
                      fontSize: 10.5, fontWeight: 800, padding: '4px 8px', borderRadius: 4, cursor: 'pointer'
                    }}
                  >
                    Withdraw All
                  </button>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Withdrawable Balance: {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.withdrawable_balance)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button
                  type="submit"
                  disabled={withdrawalSubmitting || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > walletBalances.withdrawable_balance}
                  className="btn btn-primary clickable"
                  style={{ flex: 1, padding: 12 }}
                >
                  {withdrawalSubmitting ? <Loader2 size={16} className="spinner" style={{ margin: '0 auto' }} /> : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: INSIGHTS DISCOUNT CAMPAIGN ── */}
      {isDiscountModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsDiscountModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 440, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={18} style={{ color: 'var(--accent)' }} /> Create Flash Campaign
              </h3>
              <button onClick={() => setIsDiscountModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
              Launch a flash discount campaign to automatically display sale pricing to shoppers and lift your conversion rates by over 15%.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Discount Rate (%)</label>
                <SearchableSelect
                  options={[
                    { value: '5', label: '5% Discount' },
                    { value: '10', label: '10% Discount (Recommended)' },
                    { value: '15', label: '15% Discount' },
                    { value: '20', label: '20% Discount' }
                  ]}
                  value={discountPercent}
                  onChange={val => setDiscountPercent(val)}
                  placeholder="Select discount rate"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setIsDiscountModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
              <button onClick={handleApplyQuickDiscount} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>Deploy Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PRODUCT OVERLAY ── */}
      {isAddProductOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddProductOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 540, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create Store Product</h3>
              <button onClick={() => setIsAddProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankara Loose Kaftan"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="responsive-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Sales Price ({getCurrencySymbol(store?.currency_code)})</label>
                  <input
                    type="number"
                    required
                    placeholder="8500"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Compare Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={prodComparePrice}
                    onChange={e => setProdComparePrice(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="responsive-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                  <SearchableSelect
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    value={prodCategory}
                    onChange={val => setProdCategory(val)}
                    placeholder="Select Category"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Inventory Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'in_stock', label: `In Stock ${prodIsDigital ? '(Auto-Managed)' : ''}` },
                      { value: 'out_of_stock', label: 'Out of Stock' }
                    ]}
                    value={prodStock}
                    onChange={val => setProdStock(val)}
                    disabled={prodIsDigital}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              {/* Digital Product Settings */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1.5px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--r-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={prodIsDigital}
                    onChange={e => {
                      setProdIsDigital(e.target.checked);
                      if (e.target.checked) {
                        setProdStock('in_stock');
                      }
                    }}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block' }}>Digital Product</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Sell eBooks, courses, templates, music, PDFs, etc.</span>
                  </div>
                </label>

                {prodIsDigital && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: 14 }} className="animate-fade-in">

                    {/* File Upload Slot */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Digital File (Optional, max 20MB)
                      </label>
                      {prodDigitalFileUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                          <FileText size={18} color="var(--primary)" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prodDigitalFileUrl.split('/').pop()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProdDigitalFileUrl('')}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: 10, color: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: 'var(--r-sm)' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: prodDigitalUploading ? 'not-allowed' : 'pointer',
                            background: 'var(--bg-2)',
                            color: 'var(--text-muted)',
                            opacity: prodDigitalUploading ? 0.6 : 1,
                            transition: 'all var(--t-fast)'
                          }}
                        >
                          {prodDigitalUploading ? (
                            <Loader2 size={20} className="spinner" />
                          ) : (
                            <>
                              <Download size={20} />
                              <span style={{ fontSize: 12, fontWeight: 700 }}>Upload Product File</span>
                            </>
                          )}
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            disabled={prodDigitalUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setProdDigitalUploading(true);
                                const fd = new FormData();
                                fd.append('file', file);
                                const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                                  body: fd
                                });
                                const json = await res.json();
                                if (res.ok && json.url) {
                                  setProdDigitalFileUrl(json.url);
                                  toast.success('Digital file uploaded successfully! 📁');
                                } else throw new Error(json.message || 'File upload failed');
                              } catch (err: any) {
                                toast.error(err.message || 'File upload error');
                              } finally {
                                setProdDigitalUploading(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* External Link */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Download / Access Link (Optional)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="url"
                          placeholder="e.g. https://drive.google.com/..."
                          value={prodDigitalLink}
                          onChange={e => setProdDigitalLink(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: 34 }}
                        />
                        <ExternalLink size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                        Or provide a URL to a Google Drive folder, Notion page, private video, etc.
                      </p>
                    </div>

                  </div>
                )}
              </div>


              {/* Multi-Image Upload Slots (up to 3) */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Product Images ({prodImageUrls.length}/3)
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {prodImageUrls.map((url, idx) => (
                    <div key={idx} style={{ width: 80, height: 80, borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '2px solid var(--primary)' }}>
                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Product image ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => setProdImageUrls(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                        title="Remove image"
                      >✕</button>
                    </div>
                  ))}
                  {prodImageUrls.length < 3 && (
                    <label
                      style={{
                        width: 80, height: 80, borderRadius: 'var(--r-md)', flexShrink: 0,
                        border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 4,
                        cursor: prodImageUploading ? 'not-allowed' : 'pointer',
                        background: 'var(--bg-2)', color: 'var(--text-muted)', opacity: prodImageUploading ? 0.6 : 1,
                        transition: 'all var(--t-fast)'
                      }}
                    >
                      {prodImageUploading ? <Loader2 size={18} className="spinner" /> : <><ImageIcon size={18} /><span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>Upload</span></>}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        style={{ display: 'none' }}
                        disabled={prodImageUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setProdImageUploading(true);
                            const fd = new FormData();
                            fd.append('image', file);
                            const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                              body: fd
                            });
                            const json = await res.json();
                            if (res.ok && json.url) {
                              setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
                              toast.success('Image uploaded! 📸');
                            } else throw new Error(json.message || 'Upload failed');
                          } catch (err: any) {
                            toast.error(err.message || 'Image upload error');
                          } finally {
                            setProdImageUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  )}
                  {prodImageUrls.length < 3 && (
                    <button
                      type="button"
                      disabled={prodImageUploading || aiImageGenerating}
                      onClick={handleGenerateAIImage}
                      style={{
                        width: 80, height: 80, borderRadius: 'var(--r-md)', flexShrink: 0,
                        border: '2.5px dashed #d97706', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 4,
                        cursor: (prodImageUploading || aiImageGenerating) ? 'not-allowed' : 'pointer',
                        background: 'var(--bg-2)', color: '#d97706', opacity: (prodImageUploading || aiImageGenerating) ? 0.6 : 1,
                        transition: 'all var(--t-fast)'
                      }}
                      title="Generate AI Image"
                    >
                      {aiImageGenerating ? <Loader2 size={18} className="spinner" /> : <><Sparkles size={18} /><span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>AI Gen</span></>}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>Upload up to 3 photos. First image is the main product thumbnail.</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Description & Details</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiGenerating}
                    className="btn btn-outline"
                    style={{
                      padding: '4px 10px', fontSize: 10.5, borderRadius: 'var(--r-sm)',
                      color: '#d97706', borderColor: '#d97706',
                      display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Sparkles size={11} /> AI Auto-Write</>}
                    {(user?.plan === 'free' || !user?.plan) && (
                      <span style={{ fontSize: 8, fontWeight: 900, background: '#d97706', color: '#fff', padding: '1px 4px', borderRadius: 2 }}>PRO</span>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your item sizes, materials, colors..."
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsAddProductOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={productPublishing} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {productPublishing ? <><Loader2 size={14} className="spinner" /> Publishing...</> : 'Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PRODUCT OVERLAY ── */}
      {isEditProductOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsEditProductOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 540, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Edit Product Settings</h3>
              <button onClick={() => setIsEditProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Title</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="responsive-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Sales Price ({getCurrencySymbol(store?.currency_code)})</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Compare Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={prodComparePrice}
                    onChange={e => setProdComparePrice(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="responsive-form-row">
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                  <SearchableSelect
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    value={prodCategory}
                    onChange={val => setProdCategory(val)}
                    placeholder="Select Category"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Inventory Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'in_stock', label: `In Stock ${prodIsDigital ? '(Auto-Managed)' : ''}` },
                      { value: 'out_of_stock', label: 'Out of Stock' }
                    ]}
                    value={prodStock}
                    onChange={val => setProdStock(val)}
                    disabled={prodIsDigital}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              {/* Digital Product Settings */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1.5px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--r-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={prodIsDigital}
                    onChange={e => {
                      setProdIsDigital(e.target.checked);
                      if (e.target.checked) {
                        setProdStock('in_stock');
                      }
                    }}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block' }}>Digital Product</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Sell eBooks, courses, templates, music, PDFs, etc.</span>
                  </div>
                </label>

                {prodIsDigital && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: 14 }} className="animate-fade-in">

                    {/* File Upload Slot */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Digital File (Optional, max 20MB)
                      </label>
                      {prodDigitalFileUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                          <FileText size={18} color="var(--primary)" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prodDigitalFileUrl.split('/').pop()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProdDigitalFileUrl('')}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: 10, color: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: 'var(--r-sm)' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: prodDigitalUploading ? 'not-allowed' : 'pointer',
                            background: 'var(--bg-2)',
                            color: 'var(--text-muted)',
                            opacity: prodDigitalUploading ? 0.6 : 1,
                            transition: 'all var(--t-fast)'
                          }}
                        >
                          {prodDigitalUploading ? (
                            <Loader2 size={20} className="spinner" />
                          ) : (
                            <>
                              <Download size={20} />
                              <span style={{ fontSize: 12, fontWeight: 700 }}>Upload Product File</span>
                            </>
                          )}
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            disabled={prodDigitalUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setProdDigitalUploading(true);
                                const fd = new FormData();
                                fd.append('file', file);
                                const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                                  body: fd
                                });
                                const json = await res.json();
                                if (res.ok && json.url) {
                                  setProdDigitalFileUrl(json.url);
                                  toast.success('Digital file uploaded successfully! 📁');
                                } else throw new Error(json.message || 'File upload failed');
                              } catch (err: any) {
                                toast.error(err.message || 'File upload error');
                              } finally {
                                setProdDigitalUploading(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* External Link */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Download / Access Link (Optional)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="url"
                          placeholder="e.g. https://drive.google.com/..."
                          value={prodDigitalLink}
                          onChange={e => setProdDigitalLink(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: 34 }}
                        />
                        <ExternalLink size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                        Or provide a URL to a Google Drive folder, Notion page, private video, etc.
                      </p>
                    </div>

                  </div>
                )}
              </div>


              {/* Multi-Image Upload Slots (up to 3) */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Product Images ({prodImageUrls.length}/3)
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {prodImageUrls.map((url, idx) => (
                    <div key={idx} style={{ width: 80, height: 80, borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '2px solid var(--primary)' }}>
                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Product image ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => setProdImageUrls(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                        title="Remove image"
                      >✕</button>
                    </div>
                  ))}
                  {prodImageUrls.length < 3 && (
                    <label
                      style={{
                        width: 80, height: 80, borderRadius: 'var(--r-md)', flexShrink: 0,
                        border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 4,
                        cursor: prodImageUploading ? 'not-allowed' : 'pointer',
                        background: 'var(--bg-2)', color: 'var(--text-muted)', opacity: prodImageUploading ? 0.6 : 1,
                        transition: 'all var(--t-fast)'
                      }}
                    >
                      {prodImageUploading ? <Loader2 size={18} className="spinner" /> : <><ImageIcon size={18} /><span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>Upload</span></>}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        style={{ display: 'none' }}
                        disabled={prodImageUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setProdImageUploading(true);
                            const fd = new FormData();
                            fd.append('image', file);
                            const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                              body: fd
                            });
                            const json = await res.json();
                            if (res.ok && json.url) {
                              setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
                              toast.success('Image uploaded! 📸');
                            } else throw new Error(json.message || 'Upload failed');
                          } catch (err: any) {
                            toast.error(err.message || 'Image upload error');
                          } finally {
                            setProdImageUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  )}
                  {prodImageUrls.length < 3 && (
                    <button
                      type="button"
                      disabled={prodImageUploading || aiImageGenerating}
                      onClick={handleGenerateAIImage}
                      style={{
                        width: 80, height: 80, borderRadius: 'var(--r-md)', flexShrink: 0,
                        border: '2.5px dashed #d97706', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 4,
                        cursor: (prodImageUploading || aiImageGenerating) ? 'not-allowed' : 'pointer',
                        background: 'var(--bg-2)', color: '#d97706', opacity: (prodImageUploading || aiImageGenerating) ? 0.6 : 1,
                        transition: 'all var(--t-fast)'
                      }}
                      title="Generate AI Image"
                    >
                      {aiImageGenerating ? <Loader2 size={18} className="spinner" /> : <><Sparkles size={18} /><span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>AI Gen</span></>}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>Upload up to 3 photos. First image is the main product thumbnail.</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Description & Details</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiGenerating}
                    className="btn btn-outline"
                    style={{
                      padding: '4px 10px', fontSize: 10.5, borderRadius: 'var(--r-sm)',
                      color: '#d97706', borderColor: '#d97706',
                      display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Sparkles size={11} /> AI Auto-Write</>}
                    {(user?.plan === 'free' || !user?.plan) && (
                      <span style={{ fontSize: 8, fontWeight: 900, background: '#d97706', color: '#fff', padding: '1px 4px', borderRadius: 2 }}>PRO</span>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your product specs..."
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsEditProductOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={productPublishing} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {productPublishing ? <><Loader2 size={14} className="spinner" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {upgradePrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setUpgradePrompt(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.52)', backdropFilter: 'blur(6px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 430, padding: 28, zIndex: 10, textAlign: 'center' }}>
            <button
              onClick={() => setUpgradePrompt(null)}
              aria-label="Close upgrade prompt"
              style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>

            <div style={{ width: 58, height: 58, borderRadius: '50%', margin: '0 auto 16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 32px rgba(217,119,6,0.28)' }}>
              <Zap size={26} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
              {upgradePrompt.title}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 22 }}>
              {upgradePrompt.description}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setUpgradePrompt(null)}
                className="btn btn-outline clickable"
                style={{ flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800 }}
              >
                Not now
              </button>
              <button
                type="button"
                onClick={goToBillingFromPrompt}
                className="btn btn-primary clickable"
                style={{ flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800 }}
              >
                View Pro plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ORDER DETAILS INPSECT ── */}
      {isOrderDetailsOpen && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsOrderDetailsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Inspect Order {selectedOrder.order_number}</h3>
              <button onClick={() => setIsOrderDetailsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Customer summary */}
              <div style={{ background: 'var(--bg-2)', padding: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Customer Details</h4>
                <p style={{ fontWeight: 800, fontSize: 15 }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Phone: {selectedOrder.customer_phone}</p>
                {selectedOrder.delivery_address && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'start', gap: 4, marginTop: 8 }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>Address: {selectedOrder.delivery_address}</span>
                  </p>
                )}
              </div>

              {/* Status row */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Order Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'pending', label: 'Pending', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> },
                      { value: 'confirmed', label: 'Confirmed', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} /> },
                      { value: 'completed', label: 'Completed/Shipped', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-dark)', display: 'inline-block' }} /> },
                      { value: 'cancelled', label: 'Cancelled', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} /> }
                    ]}
                    value={selectedOrder.order_status}
                    onChange={val => handleUpdateOrderStatus(selectedOrder.id, val)}
                    style={{ padding: '8px 12px', fontSize: 12.5 }}
                    placeholder="Order Status"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Payment Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'unpaid', label: 'Unpaid', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} /> },
                      { value: 'paid', label: 'Paid', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} /> },
                      { value: 'refunded', label: 'Refunded', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} /> }
                    ]}
                    value={selectedOrder.payment_status}
                    onChange={val => handleUpdatePaymentStatus(selectedOrder.id, val)}
                    style={{ padding: '8px 12px', fontSize: 12.5 }}
                    placeholder="Payment Status"
                  />
                </div>
              </div>

              {/* Action tools */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <button
                  onClick={() => {
                    const msg = `Hi ${selectedOrder.customer_name}! This is ${store?.store_name || 'frontstore merchant'} following up regarding your Order ${selectedOrder.order_number} totaling ${getCurrencySymbol(store?.currency_code)}${parseFloat(selectedOrder.total_amount as string).toLocaleString()}.`;
                    window.open(`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, padding: 10, fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                >
                  <WhatsAppIcon size={14} color="#25d366" /> Chat WhatsApp
                </button>

                <button
                  onClick={() => {
                    setIsOrderDetailsOpen(false);
                    setReceiptOrder(selectedOrder);
                    setIsReceiptOpen(true);
                  }}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, padding: 10, fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                >
                  <Receipt size={14} /> Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: Sleek customer receipt view ── */}
      {isReceiptOpen && receiptOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsReceiptOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 420, padding: 24, zIndex: 10 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={18} style={{ color: 'var(--primary)' }} /> Sales Receipt
              </h3>
              <button onClick={() => setIsReceiptOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            {/* Receipt raw monospace render */}
            <div style={{
              background: '#1e293b',
              color: '#34d399',
              fontFamily: 'monospace',
              fontSize: 12.5,
              padding: 16,
              borderRadius: 'var(--r-md)',
              whiteSpace: 'pre-wrap',
              maxHeight: 300,
              overflowY: 'auto',
              marginBottom: 18,
              lineHeight: 1.45,
              border: '1px solid #334155'
            }}>
              {generateReceiptText(receiptOrder)}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setIsReceiptOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Close</button>
              <button onClick={() => copyReceiptToClipboard(receiptOrder)} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>Copy Text</button>
            </div>

          </div>
        </div>
      )}

      {/* Styled JSX layout rules to make dashboard fully responsive */}
      <style jsx global>{`
        .main-content {
          margin-left: 260px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        .table-row-hover:hover {
          background: var(--bg-2);
        }

        @media (max-width: 1024px) {
          .responsive-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-share-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          aside {
            display: none !important;
          }
          .mobile-burger-btn {
            display: block !important;
          }
          .header-logo-mobile {
            display: flex !important;
          }
          .desktop-only-text {
            display: none !important;
          }
          .main-header {
            padding: 10px 14px !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
            align-items: center !important;
          }
          .header-search-form {
            order: 3 !important;
            flex-basis: 100% !important;
            margin: 4px 0 0 !important;
            max-width: none !important;
          }
          .main-header > div:last-child {
            padding-right: 0 !important;
            gap: 8px !important;
          }
          .main-header > div:last-child .btn {
            width: 38px !important;
            height: 38px !important;
            padding: 0 !important;
          }
          .main-header > div:last-child > :last-child {
            display: none !important;
          }
          .main-content > div {
            padding: 14px !important;
          }
          .whatsapp-chat-shell {
            flex-direction: row !important;
            height: calc(100vh - 120px) !important;
          }
          .wa-contacts-panel.wa-mobile-hide,
          .wa-chat-viewport.wa-mobile-hide {
            display: none !important;
          }
          .wa-contacts-panel.wa-mobile-show {
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
          }
          .wa-chat-viewport.wa-mobile-show {
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
          }
          .wa-back-button {
            display: inline-flex !important;
          }
          .responsive-order-heading {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start !important;
          }
          .responsive-product-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 520px) {
          .setup-checklist-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px !important;
          }
          .setup-checklist-header > span {
            align-self: flex-start !important;
            font-size: 18px !important;
          }
          .setup-checklist-body {
            padding: 6px 16px 16px !important;
          }
          .responsive-chart-grid .card {
            padding: 16px !important;
          }
          .chart-scroll-content {
            min-width: 420px !important;
          }
          .responsive-chart-grid h3 {
            font-size: 14px !important;
          }
          .responsive-chart-grid .btn {
            white-space: normal !important;
          }
        }
      `}</style>

    </div>
  );
}
