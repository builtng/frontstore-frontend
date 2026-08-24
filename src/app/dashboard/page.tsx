'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Zap, Link, BarChart3, Search,
  Store, Star, ArrowRight, CheckCircle2, LogOut,
  Package, ShoppingBag, Settings, Share2, Copy, Tag,
  Trash2, Edit2, AlertCircle, Check, Loader2, Phone,
  DollarSign, Calendar, MapPin, Receipt, Menu, X, ArrowUpRight,
  TrendingUp, RefreshCw, Camera,
  Download, FileText, ExternalLink, Shield, Rocket, BadgeCheck, BookOpen,
  EyeOff, Key, Clock, Send, Users, QrCode, Inbox,
  Briefcase, Truck, Scale, Archive,
  Laptop, Bell, Ticket, Plug, LayoutTemplate, ChevronDown, Upload, ImagePlus
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import ConfirmDialog from '../../components/ConfirmDialog';
import SearchableSelect from '../../components/SearchableSelect';
import FileUpload from '../../components/FileUpload';
import ThemeToggle from '../../components/ThemeToggle';
import Toggle from '../../components/Toggle';
import NinaWidget from '../../components/NinaWidget';
import IntegrationsTab from '../../components/dashboard/IntegrationsTab';
import { getColorHex } from '@/utils/colorUtils';
import ShareTab from '../../components/dashboard/ShareTab';
import TemplatesTab from '../../components/dashboard/TemplatesTab';
import SettingsTab from '../../components/dashboard/SettingsTab';
import ReachTab from '../../components/dashboard/ReachTab';
import AnalyticsTab from '../../components/dashboard/AnalyticsTab';
import FinanceTab from '../../components/dashboard/FinanceTab';
import RefundsTab from '../../components/dashboard/RefundsTab';
import CouponsTab from '../../components/dashboard/CouponsTab';
import InvoicesTab from '../../components/dashboard/InvoicesTab';
import ReceiptsTab from '../../components/dashboard/ReceiptsTab';
import InventoryTab from '../../components/dashboard/InventoryTab';
import AutomationsTab from '../../components/dashboard/AutomationsTab';
import PaymentLinksTab from '../../components/dashboard/PaymentLinksTab';
import AffiliatesTab from '../../components/dashboard/AffiliatesTab';
import TeamTab from '../../components/dashboard/TeamTab';
import InboxTab from '../../components/dashboard/InboxTab';
import ReviewsTab from '../../components/dashboard/ReviewsTab';
import OrdersTab from '../../components/dashboard/OrdersTab';
import ProductsTab from '../../components/dashboard/ProductsTab';
import WhatsappTab from '../../components/dashboard/WhatsappTab';
import QrTab from '../../components/dashboard/QrTab';
import BillingTab from '../../components/dashboard/BillingTab';
import OverviewTab from '../../components/dashboard/OverviewTab';
import CustomersTab from '../../components/dashboard/CustomersTab';
import WalletTab from '../../components/dashboard/WalletTab';
import { businessPersonas } from '../../utils/businessPersonas';
import { getServiceFactPresets } from '../../utils/serviceFactPresets';
import { resilientFetch } from '../../utils/resilientFetch';

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

// Orders may have been placed in a different currency than the store currently
// operates in (e.g. the merchant switched currency after taking orders). The
// backend converts these into `display_amount`/`display_currency` — fall back
// to the raw amount when that's not present (e.g. cached/older order payloads).
const getOrderDisplayAmount = (order: { total_amount: number | string; currency_code?: string | null; display_amount?: number | string; display_currency?: string | null }, storeCurrency?: string) => {
  const amount = order.display_amount ?? order.total_amount;
  const currency = order.display_currency ?? order.currency_code ?? storeCurrency;
  return { symbol: getCurrencySymbol(currency || undefined), amount };
};

interface UserInfo {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  plan?: string;
  is_pro?: boolean;
  is_legend?: boolean;
  has_password?: boolean;
  ai_analyses_used?: number;
  is_admin?: boolean | number | string;
  subscription_status?: 'active' | 'attention' | 'non_renewing' | 'cancelled' | null;
  paystack_subscription_code?: string | null;
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
  country_code?: string | null;
  available_payment_providers?: string[];
  whatsapp_phone: string;
  whatsapp_phone_updated_at?: string | null;
  username: string;
  banner_url?: string | null;
  location?: string | null;
  since?: string | null;
  logo_url?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  twitter_handle?: string | null;
  facebook_handle?: string | null;
  linkedin_handle?: string | null;
  facebook_pixel_id?: string | null;
  google_tag_manager_id?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  payment_instructions?: string | null;
  delivery_info?: string | null;
  return_policy?: string | null;
  paystack_bank_code?: string | null;
  bank_account_verified?: boolean;
  paystack_dva_bank_name?: string | null;
  paystack_dva_account_number?: string | null;
  paystack_dva_account_name?: string | null;
  paystack_dva_currency?: string | null;
  paystack_dva_active?: boolean;
  payment_provider?: string | null;
  momo_agent_number?: string | null;
  momo_agent_name?: string | null;
  momo_agent_network?: string | null;
  momo_agent_enabled?: boolean;
  stripe_account_id?: string | null;
  stripe_onboarding_complete?: boolean;
  stripe_charges_enabled?: boolean;
  stripe_payouts_enabled?: boolean;
  custom_links?: StoreLink[] | null;
  custom_domain?: string | null;
  domain_status?: 'pending' | 'active' | 'failed' | null;
  domain_error?: string | null;
  primary_color?: string | null;
  store_template?: string | null;
  business_persona?: string | null;
  is_pro?: boolean;
  catalog_label?: string | null;
  category_label?: string | null;
  store_label?: string | null;
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
  working_hours?: Record<string, { open: string; close: string; enabled: boolean }> | null;
  booking_capacity_per_day?: number | null;
  nina_chat_qr_enabled?: boolean | number;
  nina_avatar_url?: string | null;
  hidden_dashboard_items?: string[] | null;
  plan_dashboard_items?: string[] | null;
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
  negotiable?: boolean;
  min_price?: number | string | null;
  stock_status: string;
  category_id?: string | null;
  category?: Category | null;
  description: string | null;
  image_urls?: string[];
  views_count?: number;
  is_digital?: boolean;
  digital_file_url?: string | null;
  digital_link?: string | null;
  type?: 'product' | 'service' | 'bundle' | 'ticket' | null;
  duration_minutes?: number | null;
  service_facts?: string[] | null;
  mobile_fee?: number | string | null;
  mobile_fee_label?: string | null;
  tags?: string[] | null;
  variants?: any[];
  track_inventory?: boolean;
  inventory_quantity?: number;
  low_stock_threshold?: number | null;
  expected_availability_date?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  bundle_items?: { id: string; child_product_id: string; quantity: number; child_product?: { id: string; name: string } }[];
  related_product_ids?: string[] | null;
  qr_code_url?: string | null;
  digital_files?: { path: string; name: string }[] | null;
  download_limit?: number | null;
  read_online_only?: boolean;
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
  currency_code?: string | null;
  display_amount?: number | string;
  display_currency?: string | null;
  payment_status: string;
  order_status: string;
  created_at: string;
  items?: OrderItem[];
  dispute_status?: string | null;
  frontstore_protect?: boolean;
  frontstore_protect_fee?: string | number | null;
  delivery_milestone?: string | null;
  tracking_number?: string | null;
  shipping_provider?: string | null;
  payout_hold_until?: string | null;
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
    daily_breakdown?: Array<{ day: string; views: number; wa: number }>;
  };
}

type DashboardTab = 'overview' | 'orders' | 'products' | 'whatsapp' | 'share' | 'qr' | 'templates' | 'settings' | 'billing' | 'wallet' | 'reach' | 'reviews' | 'invoices' | 'receipts' | 'payment-links' | 'inventory' | 'automations' | 'analytics' | 'team' | 'finance' | 'refunds' | 'inbox' | 'coupons' | 'affiliates' | 'integrations' | 'customers';

const DASHBOARD_TABS: DashboardTab[] = ['overview', 'orders', 'products', 'whatsapp', 'share', 'qr', 'templates', 'settings', 'billing', 'wallet', 'reach', 'reviews', 'invoices', 'receipts', 'payment-links', 'inventory', 'automations', 'analytics', 'team', 'finance', 'refunds', 'inbox', 'coupons', 'affiliates', 'integrations', 'customers'];

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
    colors: ['#25D366', '#0f172a', '#f59e0b'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tone: 'Magazine commerce',
    description: 'Story-led layout for fashion, beauty, food, and lifestyle brands.',
    colors: ['#b42318', '#fbfaf7', '#25D366'],
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
  const isPro = !!user?.is_pro;
  const isAdminUser = user?.is_admin === true || user?.is_admin === 1 || user?.is_admin === 'true' || user?.is_admin === '1';
  const isLegend = !!user?.is_legend;

  // State wrapper helper for functional & direct updates
  const wrapSetter = <T,>(
    internalSetter: React.Dispatch<React.SetStateAction<T>>,
    normalizeFn: (val: T) => T
  ) => {
    return (valueOrFn: React.SetStateAction<T>) => {
      if (typeof valueOrFn === 'function') {
        internalSetter((prev) => normalizeFn((valueOrFn as Function)(prev)));
      } else {
        internalSetter(normalizeFn(valueOrFn));
      }
    };
  };

  const normalizeStore = (s: StoreInfo | null): StoreInfo | null => {
    if (!s) return null;
    return {
      ...s,
      custom_links: Array.isArray(s.custom_links)
        ? s.custom_links
        : (s.custom_links ? Object.values(s.custom_links) : []),
      featured_product_ids: Array.isArray(s.featured_product_ids)
        ? s.featured_product_ids
        : (s.featured_product_ids ? Object.values(s.featured_product_ids) : []),
    };
  };

  const normalizeProducts = (prods: Product[]): Product[] => {
    const arr = Array.isArray(prods) ? prods : (prods ? Object.values(prods) : []);
    return arr.map((p: any) => ({
      ...p,
      image_urls: Array.isArray(p.image_urls)
        ? p.image_urls
        : (p.image_urls ? Object.values(p.image_urls) : []),
    }));
  };

  const normalizeUsernameInput = (value: string) => (
    value
      .toLowerCase()
      .replace(/^@+/, '')
      .replace(/_/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 40)
  );

  const normalizeCategories = (cats: Category[]): Category[] => {
    return Array.isArray(cats) ? cats : (cats ? Object.values(cats) : []);
  };

  const normalizeOrders = (ords: Order[]): Order[] => {
    return Array.isArray(ords) ? ords : (ords ? Object.values(ords) : []);
  };

  const normalizeReviews = (revs: any[]): any[] => {
    return Array.isArray(revs) ? revs : (revs ? Object.values(revs) : []);
  };

  const [storeInternal, setStoreInternal] = useState<StoreInfo | null>(null);
  const setStore = wrapSetter(setStoreInternal, normalizeStore);
  const store = storeInternal;
  const hiddenDashboardItems = store?.hidden_dashboard_items || [];
  // Plan-level baseline, admin-controlled — null means "not loaded yet", not "hide everything".
  const planDashboardItems = store?.plan_dashboard_items ?? null;
  const isVisibleOnPlan = (itemId: string) => planDashboardItems === null || planDashboardItems.includes(itemId);

  const whatsappCooldownUntil = (!isPro && store?.whatsapp_phone_updated_at)
    ? new Date(new Date(store.whatsapp_phone_updated_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const whatsappOnCooldown = !!whatsappCooldownUntil && whatsappCooldownUntil.getTime() > Date.now();

  const [systemDomain, setSystemDomain] = useState('frontstore.ng');
  const [domainTargetCname, setDomainTargetCname] = useState('');
  const [domainTargetIp, setDomainTargetIp] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.frontstore.ng/api');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Dashboard Data State ---
  const [activeTab, setActiveTab] = useState<DashboardTab>(getDashboardTabFromUrl);

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [productsInternal, setProductsInternal] = useState<Product[]>([]);
  const setProducts = wrapSetter(setProductsInternal, normalizeProducts);
  const products = productsInternal;

  const [categoriesInternal, setCategoriesInternal] = useState<Category[]>([]);
  const setCategories = wrapSetter(setCategoriesInternal, normalizeCategories);
  const categories = categoriesInternal;

  const [ordersInternal, setOrdersInternal] = useState<Order[]>([]);
  const setOrders = wrapSetter(setOrdersInternal, normalizeOrders);
  const orders = ordersInternal;

  const [reviewsInternal, setReviewsInternal] = useState<any[]>([]);
  const setReviews = wrapSetter(setReviewsInternal, normalizeReviews);
  const reviews = reviewsInternal;

  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [reviewId: string]: string }>({});

  // Loading states
  const [dataLoading, setDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mobile navigation overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile dropdown menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Billing Cycle state for Pro Subscription Plan
  const [proMonthlyPrice, setProMonthlyPrice] = useState(2000);
  const [proYearlyPrice, setProYearlyPrice] = useState(20000);
  const [freeProductLimit, setFreeProductLimit] = useState(40);

  // Billing cycle + coupon state for the Legend Subscription Plan (independent of Pro's above)
  const [legendMonthlyPrice, setLegendMonthlyPrice] = useState(7000);
  const [legendYearlyPrice, setLegendYearlyPrice] = useState(70000);

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

  // --- New Pro Features States (Team, Finance, Refunds, Inbox) ---

  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => Promise<void>;
    loading: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: async () => { },
    loading: false,
  });

  const openConfirmationDialog = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel'
  ) => {
    setConfirmationDialog({
      open: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      loading: false,
    });
  };

  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [loadingRates, setLoadingRates] = useState(false);
  const [isBookingShipping, setIsBookingShipping] = useState(false);
  const [isSimulatingTransit, setIsSimulatingTransit] = useState(false);

  const fetchShippingRates = async (orderId: string) => {
    try {
      setLoadingRates(true);
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/shipping-rates`, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        setShippingRates(json.data || []);
        if (json.data && json.data.length > 0) {
          setSelectedCarrier(json.data[0].carrier);
        }
      }
    } catch (e) {
      toast.error("Failed to load shipping rates.");
    } finally {
      setLoadingRates(false);
    }
  };

  const handleBookShipping = async (orderId: string) => {
    if (!selectedCarrier) return;
    try {
      setIsBookingShipping(true);
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/book-shipping`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ carrier: selectedCarrier })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to book shipping.');
      toast.success('Shipment booked successfully!');
      
      // Update selected order details
      const orderRes = await fetch(`${apiUrl}/v1/public/orders/${orderId}`);
      if (orderRes.ok) {
        const orderJson = await orderRes.json();
        setSelectedOrder(orderJson.data);
        loadAllData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsBookingShipping(false);
    }
  };

  const handleSimulateTransit = async (orderId: string) => {
    try {
      setIsSimulatingTransit(true);
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/simulate-transit`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to simulate transit.');
      toast.success(`Transit updated to: ${json.data.delivery_milestone}`);
      
      // Update selected order details
      const orderRes = await fetch(`${apiUrl}/v1/public/orders/${orderId}`);
      if (orderRes.ok) {
        const orderJson = await orderRes.json();
        setSelectedOrder(orderJson.data);
        loadAllData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsSimulatingTransit(false);
    }
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog((prev) => ({ ...prev, open: false, loading: false }));
  };

  const executeConfirmationDialog = async () => {
    setConfirmationDialog((prev) => ({ ...prev, loading: true }));
    try {
      await confirmationDialog.onConfirm();
    } finally {
      closeConfirmationDialog();
    }
  };


  const getSelectedPersonaPreset = () => businessPersonas.find(item => item.id === selectedPersona);

  const businessPersonaOptions = businessPersonas.map(persona => ({
    value: persona.id,
    label: persona.name,
    sublabel: `${persona.persona} · ${persona.templateName} · ${persona.summary}`,
  }));

  // Quick discount campaign modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Withdraw funds modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('10');

  // --- Form Input States ---
  // Add/Edit Product Form
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodNegotiable, setProdNegotiable] = useState(false);
  const [prodMinPrice, setProdMinPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('in_stock');
  const [prodImageUrls, setProdImageUrls] = useState<string[]>([]);
  const [prodImageUploading, setProdImageUploading] = useState(false);
  const [prodTags, setProdTags] = useState<string[]>([]);
  const [prodTagInput, setProdTagInput] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [productPublishing, setProductPublishing] = useState(false);
  // Digital product states
  const [prodIsDigital, setProdIsDigital] = useState(false);
  const [prodDigitalFileUrl, setProdDigitalFileUrl] = useState('');
  const [prodDigitalLink, setProdDigitalLink] = useState('');
  const [prodDigitalUploading, setProdDigitalUploading] = useState(false);
  const [prodDigitalFiles, setProdDigitalFiles] = useState<{ path: string; name: string }[]>([]);
  const [prodDownloadLimit, setProdDownloadLimit] = useState('');
  const [prodReadOnlineOnly, setProdReadOnlineOnly] = useState(false);
  // Service product states
  const [prodType, setProdType] = useState<'product' | 'service' | 'bundle' | 'ticket'>('product');
  const [prodDurationMinutes, setProdDurationMinutes] = useState('');
  const [prodServiceFacts, setProdServiceFacts] = useState<string[]>([]);
  const [prodMobileFee, setProdMobileFee] = useState('');
  const [prodMobileFeeLabel, setProdMobileFeeLabel] = useState('');
  const [prodCustomFact, setProdCustomFact] = useState('');
  // Pre-order
  const [prodExpectedAvailabilityDate, setProdExpectedAvailabilityDate] = useState('');
  // Variants (size / colour options)
  const [prodVariants, setProdVariants] = useState<{ id?: string; size: string; color: string; price: string; inventory_quantity: string }[]>([]);
  // Bundle product states
  const [prodBundleItems, setProdBundleItems] = useState<{ product_id: string; quantity: number }[]>([]);
  // Cross-sell (merchant-curated related products, optional — auto-falls back to same-category on the storefront)
  const [prodRelatedProductIds, setProdRelatedProductIds] = useState<string[]>([]);
  // Ticket (event) product states
  const [prodEventDate, setProdEventDate] = useState('');
  const [prodEventLocation, setProdEventLocation] = useState('');

  // Customers (CRM)
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState<Record<string, any[]>>({});
  const [customerNotesLoading, setCustomerNotesLoading] = useState(false);
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [newCustomerTag, setNewCustomerTag] = useState('');
  const [customerTagSaving, setCustomerTagSaving] = useState<string | null>(null);

  // Settings Form
  const [primaryColor, setPrimaryColor] = useState('#25D366');
  const [selectedTemplate, setSelectedTemplate] = useState('luxe-market');
  const [selectedPersona, setSelectedPersona] = useState('');
  




  const [templateSaving, setTemplateSaving] = useState<string | null>(null);

  const [paymentCopied, setPaymentCopied] = useState(false);

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



  // Paystack subscription payment state
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // --- AI Command Bar State ---
  const [aiCommand, setAiCommand] = useState('');
  const [aiResponseBubble, setAiResponseBubble] = useState<string | null>(null);

  const [waOrdersInternal, setWaOrdersInternal] = useState<Order[]>([]);
  const setWaOrders = wrapSetter(setWaOrdersInternal, normalizeOrders);
  const waOrders = waOrdersInternal;
  const [waLoading, setWaLoading] = useState(false);

  const [selectedWaOrder, setSelectedWaOrder] = useState<Order | null>(null);

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
      const storedUser = localStorage.getItem('user');
      const storedStore = localStorage.getItem('store');
      const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

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

      const verifyAccountExists = async (apiUrl: string) => {
        try {
          const response = await fetch(`${apiUrl}/v1/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              triggerRedirect('Unauthorized access - token invalid or expired');
              return { accountExists: false };
            } else if (response.status === 404) {
              triggerRedirect('Account not found - account may have been deleted');
              return { accountExists: false };
            } else {
              // Transient/non-auth error (403 permission gate, 429, 5xx) - don't log the user out
              console.warn(`Account verification returned status ${response.status} - proceeding without logout`);
              return { accountExists: true };
            }
          }

          const data = await response.json();
          if (!data.data || !data.data.user) {
            triggerRedirect('Account data is missing - account may have been deleted');
            return { accountExists: false };
          }

          return { accountExists: true, user: data.data.user, store: data.data.store };
        } catch (error) {
          console.error('Network error during account verification:', error);
          triggerRedirect('Network error during account verification');
          return { accountExists: false };
        }
      };

      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Verify the account exists on the server before loading the dashboard.
          // Auth is the httpOnly fs_auth_token cookie now, not storedToken —
          // this call succeeds or fails purely based on whether that cookie
          // (sent automatically via credentials: 'include') is still valid.
          verifyAccountExists(savedApiUrl).then((result) => {
            if (!result.accountExists) {
              setIsAuthChecking(false);
              return; // triggerRedirect has already been called
            }

            setToken('session');
            const currentUser = result.user || parsedUser;
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));

            const rawSystemDomain = localStorage.getItem('system_domain') || 'frontstore.ng';
            const storedSystemDomain = rawSystemDomain === 'frontstore.app' ? 'frontstore.ng' : rawSystemDomain;
            setSystemDomain(storedSystemDomain);

            const currentStore = result.store || (storedStore && storedStore !== 'undefined' && storedStore !== 'null' ? JSON.parse(storedStore) : null);
            if (currentStore) {
              setStore(currentStore);
              localStorage.setItem('store', JSON.stringify(currentStore));
              setPrimaryColor(currentStore.primary_color || '#25D366');
              setSelectedTemplate(currentStore.store_template || 'luxe-market');
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

  // Fetch admin-configured Pro subscription pricing so the upgrade UI never drifts from what checkout actually charges
  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/v1/public/settings`)
      .then(res => res.json())
      .then(json => {
        const monthly = Number(json?.data?.pro_monthly_price);
        const yearly = Number(json?.data?.pro_yearly_price);
        if (!Number.isNaN(monthly) && monthly > 0) setProMonthlyPrice(monthly);
        if (!Number.isNaN(yearly) && yearly > 0) setProYearlyPrice(yearly);
        const legendMonthly = Number(json?.data?.legend_monthly_price);
        const legendYearly = Number(json?.data?.legend_yearly_price);
        if (!Number.isNaN(legendMonthly) && legendMonthly > 0) setLegendMonthlyPrice(legendMonthly);
        if (!Number.isNaN(legendYearly) && legendYearly > 0) setLegendYearlyPrice(legendYearly);
        const productLimit = Number(json?.data?.free_plan_product_limit);
        if (!Number.isNaN(productLimit) && productLimit > 0) setFreeProductLimit(productLimit);
        if (json?.data?.domain_target_cname) setDomainTargetCname(json.data.domain_target_cname);
        if (json?.data?.domain_target_ip) setDomainTargetIp(json.data.domain_target_ip);
      })
      .catch(err => console.error('Failed to fetch subscription pricing:', err));
  }, [apiUrl]);


  // Auto-verify Paystack payment when user returns from checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) return;

    // Remove payment query params immediately while keeping the user on Billing.
    const cleanUrl = `${window.location.pathname}?page=billing`;
    window.history.replaceState({ page: 'billing' }, '', cleanUrl);
    setActiveTab('billing');

    const verifyPayment = async () => {
      setIsVerifyingPayment(true);
      try {
        const url = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const res = await fetch(`${url}/v1/payments/verify-subscription`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
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
            const domain = json.system_domain === 'frontstore.app' ? 'frontstore.ng' : json.system_domain;
            setSystemDomain(domain);
            localStorage.setItem('system_domain', domain);
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

  // Auto-refresh Stripe Connect status when merchant returns from onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeReturn = params.get('stripe_return');
    const stripeRefresh = params.get('stripe_refresh');
    if (!stripeReturn && !stripeRefresh) return;

    const cleanUrl = `${window.location.pathname}?page=settings`;
    window.history.replaceState({ page: 'settings' }, '', cleanUrl);
    setActiveTab('settings');

    const refreshStripeStatus = async () => {
      try {
        const url = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const res = await fetch(`${url}/v1/payments/stripe/return`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setStore(json.data);
          localStorage.setItem('store', JSON.stringify(json.data));
          if (json.data.stripe_payouts_enabled) {
            toast.success('🎉 Stripe account connected! Payouts are now enabled.');
          } else if (stripeReturn) {
            toast('Stripe onboarding saved — finish any remaining steps to enable payouts.');
          }
        }
      } catch {
        // Silent — merchant can retry from the dashboard
      }
    };

    refreshStripeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Headers helper — auth now travels via the httpOnly fs_auth_token cookie
  // (see AuthController::authCookie on the backend), not this header. `token`
  // is kept as a truthy in-memory marker only; every fetch using these headers
  // must also pass `credentials: 'include'` so the browser sends that cookie.
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // Fetch metrics, orders, products
  const loadAllData = async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setDataLoading(true);
      else setIsRefreshing(true);

      const [statsRes, productsRes, ordersRes, categoriesRes, storeRes, reviewsRes] = await Promise.all([
        fetch(`${apiUrl}/v1/orders/stats`, { credentials: 'include', headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/products`, { credentials: 'include', headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/orders`, { credentials: 'include', headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/categories`, { credentials: 'include', headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/store`, { credentials: 'include', headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/store/reviews`, { credentials: 'include', headers: getAuthHeaders() })
      ]);

      const statsJson = await statsRes.json();
      const productsJson = await productsRes.json();
      const ordersJson = await ordersRes.json();
      const categoriesJson = await categoriesRes.json();
      const storeJson = await storeRes.json();
      const reviewsJson = await reviewsRes.json();

      if (statsRes.ok) setStats(statsJson.data);
      if (productsRes.ok) setProducts(productsJson.data?.data || productsJson.data || []);
      if (ordersRes.ok) setOrders(ordersJson.data?.data || ordersJson.data || []);
      if (categoriesRes.ok) setCategories(categoriesJson.data || []);
      if (reviewsRes.ok) setReviews(reviewsJson.data || []);

      if (storeRes.ok && storeJson.data) {
        const liveStore = storeJson.data;
        setStore(liveStore);
        localStorage.setItem('store', JSON.stringify(liveStore));
        if (storeJson.system_domain) {
          const domain = storeJson.system_domain === 'frontstore.app' ? 'frontstore.ng' : storeJson.system_domain;
          setSystemDomain(domain);
          localStorage.setItem('system_domain', domain);
        }
        setPrimaryColor(liveStore.primary_color || '#25D366');
        setSelectedTemplate(liveStore.store_template || 'luxe-market');
        setSelectedPersona(liveStore.business_persona || '');
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

  const handleReplyReview = async (reviewId: string) => {
    const text = replyTexts[reviewId];
    if (!text || !text.trim()) {
      toast.error('Reply content cannot be empty.');
      return;
    }

    try {
      setSubmittingReplyId(reviewId);
      const res = await fetch(`${apiUrl}/v1/store/reviews/${reviewId}/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: text }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit reply.');
      }

      toast.success('Reply submitted successfully!');
      
      // Update reviews list locally
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: text, replied_at: new Date().toISOString() } : r));
      setReplyTexts(prev => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const fetchCustomersData = async () => {
    try {
      setCustomersLoading(true);
      const res = await fetch(`${apiUrl}/v1/customers`, { credentials: 'include', headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setCustomers(json.data?.data || []);
      } else {
        toast.error(json.message || 'Failed to load customers.');
      }
    } catch (e) {
      toast.error('Failed to load customers.');
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchCustomerNotes = async (customerId: string) => {
    try {
      setCustomerNotesLoading(true);
      const res = await fetch(`${apiUrl}/v1/customers/${customerId}/notes`, { credentials: 'include', headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setCustomerNotes(prev => ({ ...prev, [customerId]: json.data || [] }));
      }
    } catch (e) {
      toast.error('Failed to load customer notes.');
    } finally {
      setCustomerNotesLoading(false);
    }
  };

  const handleAddCustomerNote = async (customerId: string) => {
    if (!newCustomerNote.trim()) return;
    try {
      const res = await fetch(`${apiUrl}/v1/customers/${customerId}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note: newCustomerNote.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setCustomerNotes(prev => ({ ...prev, [customerId]: [json.data, ...(prev[customerId] || [])] }));
        setNewCustomerNote('');
      } else {
        toast.error(json.message || 'Failed to add note.');
      }
    } catch (e) {
      toast.error('Failed to add note.');
    }
  };

  const handleAddCustomerTag = async (customerId: string, currentTags: string[]) => {
    const tag = newCustomerTag.trim();
    if (!tag || currentTags.includes(tag)) return;
    const updatedTags = [...currentTags, tag];
    try {
      setCustomerTagSaving(customerId);
      const res = await fetch(`${apiUrl}/v1/customers/${customerId}/tags`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tags: updatedTags }),
      });
      const json = await res.json();
      if (res.ok) {
        setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, tags: updatedTags } : c));
        setNewCustomerTag('');
      } else {
        toast.error(json.message || 'Failed to update tags.');
      }
    } catch (e) {
      toast.error('Failed to update tags.');
    } finally {
      setCustomerTagSaving(null);
    }
  };

  const handleRemoveCustomerTag = async (customerId: string, currentTags: string[], tagToRemove: string) => {
    const updatedTags = currentTags.filter(t => t !== tagToRemove);
    try {
      setCustomerTagSaving(customerId);
      const res = await fetch(`${apiUrl}/v1/customers/${customerId}/tags`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tags: updatedTags }),
      });
      const json = await res.json();
      if (res.ok) {
        setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, tags: updatedTags } : c));
      } else {
        toast.error(json.message || 'Failed to update tags.');
      }
    } catch (e) {
      toast.error('Failed to update tags.');
    } finally {
      setCustomerTagSaving(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'customers') fetchCustomersData();
    }
  }, [isAuthenticated, activeTab, isPro]);

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

  // Quick flash-discount handler — creates a real storefront coupon
  const handleApplyQuickDiscount = async () => {
    const code = `FLASH${discountPercent}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    try {
      const res = await fetch(`${apiUrl}/v1/store-coupons`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          discount_type: 'percentage',
          discount_value: parseFloat(discountPercent),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setIsDiscountModalOpen(false);
        toast.success(`Flash campaign live! Code ${code} gives shoppers ${discountPercent}% off. 🏷️`);
      } else {
        toast.error(json.message || 'Failed to launch campaign.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred.');
    }
  };

  // --- Add / Edit Product CRUD Handlers ---
  const openAddProductModal = () => {
    if (!isPro && products.length >= freeProductLimit) {
      openUpgradePrompt(
        'Unlimited products require Pro',
        `Free stores can publish up to ${freeProductLimit} products. Upgrade to Pro when you are ready to list more products and scale your catalog.`
      );
      return;
    }
    setProdName('');
    setProdPrice('');
    setProdComparePrice('');
    setProdNegotiable(false);
    setProdMinPrice('');
    setProdCategory(categories[0]?.id || '');
    setProdDesc('');
    setProdStock('in_stock');
    setProdImageUrls([]);
    setProdTags([]);
    setProdTagInput('');
    setAiAnalyzing(false);
    setProdIsDigital(false);
    setProdDigitalFileUrl('');
    setProdDigitalLink('');
    setProdType('product');
    setProdDurationMinutes('');
    setProdServiceFacts([]);
    setProdCustomFact('');
    setProdExpectedAvailabilityDate('');
    setProdBundleItems([]);
    setProdRelatedProductIds([]);
    setProdDigitalFiles([]);
    setProdDownloadLimit('');
    setProdReadOnlineOnly(false);
    setProdEventDate('');
    setProdEventLocation('');
    setProdVariants([]);
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
        credentials: 'include',
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
        toast.success('Description written by AI! 🧠✨');
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

  const handleAutoAnalyzeImage = async (file: File) => {
    // Available to all merchants — AI pre-fill on first image upload with client-side compression for speed
    try {
      setAiAnalyzing(true);
      
      // Client-side image compression to speed up transfer & processing
      const compressed: { base64: string; mime: string } = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024; // higher res so brand/model text on the item or box stays legible to the vision model
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
              resolve({ base64: compressedBase64, mime: 'image/jpeg' });
            } else {
              resolve({ base64: e.target?.result as string, mime: file.type });
            }
          };
          img.onerror = () => {
            resolve({ base64: e.target?.result as string, mime: file.type });
          };
          img.src = e.target?.result as string;
        };
        reader.onerror = () => {
          resolve({ base64: '', mime: file.type });
        };
        reader.readAsDataURL(file);
      });

      if (!compressed.base64) {
        throw new Error('Could not read image file.');
      }

      const res = await fetch(`${apiUrl}/v1/ai/generate-description`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          image_base64: compressed.base64,
          image_mime: compressed.mime,
        })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const data = json.data;
        if (data.name) setProdName(data.name);
        if (data.description) setProdDesc(data.description);
        if (data.recommended_price) setProdPrice(String(data.recommended_price));
        if (Array.isArray(data.tags) && data.tags.length > 0) setProdTags(data.tags.slice(0, 10));
        if (data.listing_type === 'digital') {
          setProdIsDigital(true);
          setProdType('product');
          setProdStock('in_stock');
        } else if (data.listing_type === 'service') {
          setProdIsDigital(false);
          setProdType('service');
        } else if (data.listing_type === 'physical') {
          setProdIsDigital(false);
          setProdType('product');
        }

        // Update user state with the new quota used counter
        if (typeof json.quota_used !== 'undefined') {
          setUser(prev => prev ? { ...prev, ai_analyses_used: json.quota_used } : null);
        }

        toast.success('AI analyzed your photo! Fields pre-filled ✨');
      } else {
        toast.error(json.message || 'AI image analysis failed.');
      }
    } catch (err: any) {
      console.warn('AI image analysis failed:', err);
      toast.error(err.message || 'Failed to analyze product image.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      toast.error('Product name and price are required.');
      return;
    }
    if (prodImageUrls.length === 0) {
      toast.error('Add at least one product image before publishing.');
      return;
    }

    try {
      setProductPublishing(true);
      const payload = {
        name: prodName,
        price: parseFloat(prodPrice),
        compare_at_price: prodComparePrice ? parseFloat(prodComparePrice) : null,
        negotiable: prodNegotiable,
        min_price: prodNegotiable && prodMinPrice ? parseFloat(prodMinPrice) : null,
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
        expected_availability_date: prodStock === 'preorder' && prodExpectedAvailabilityDate ? prodExpectedAvailabilityDate : null,
        is_draft: false,
        image_urls: prodImageUrls,
        is_digital: prodIsDigital,
        digital_file_url: prodIsDigital ? (prodDigitalFileUrl || null) : null,
        digital_link: prodIsDigital ? (prodDigitalLink || null) : null,
        type: prodType,
        duration_minutes: prodType === 'service' && prodDurationMinutes ? parseInt(prodDurationMinutes, 10) : null,
        service_facts: prodType === 'service' && prodServiceFacts.length > 0 ? prodServiceFacts : null,
        mobile_fee: prodType === 'service' && prodMobileFee ? parseFloat(prodMobileFee) : null,
        mobile_fee_label: prodType === 'service' && prodMobileFeeLabel ? prodMobileFeeLabel.trim() : null,
        tags: prodTags.length > 0 ? prodTags : null,
        bundle_items: prodType === 'bundle' ? prodBundleItems : undefined,
        related_product_ids: prodRelatedProductIds.length > 0 ? prodRelatedProductIds : null,
        digital_files: prodDigitalFiles.length > 0 ? prodDigitalFiles : null,
        download_limit: prodDigitalFiles.length > 0 && prodDownloadLimit ? parseInt(prodDownloadLimit, 10) : null,
        read_online_only: prodDigitalFiles.length > 0 ? prodReadOnlineOnly : false,
        event_date: prodType === 'ticket' ? (prodEventDate || null) : null,
        event_location: prodType === 'ticket' ? (prodEventLocation || null) : null,
        variants: prodVariants.length > 0 ? prodVariants.map(v => ({
          size: v.size.trim() || null,
          color: v.color.trim() || null,
          price: v.price ? parseFloat(v.price) : null,
          inventory_quantity: parseInt(v.inventory_quantity, 10) || 0,
        })) : undefined,
      };

      const res = await resilientFetch(`${apiUrl}/v1/products`, {
        method: 'POST',
        credentials: 'include',
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
    setProdNegotiable(product.negotiable ?? false);
    setProdMinPrice(product.min_price != null ? String(product.min_price) : '');
    setProdCategory(product.category_id || categories[0]?.id || '');
    setProdDesc(product.description || '');
    setProdStock(product.stock_status);
    setProdImageUrls(product.image_urls || []);
    setProdIsDigital(product.is_digital ?? false);
    setProdDigitalFileUrl(product.digital_file_url || '');
    setProdDigitalLink(product.digital_link || '');
    setProdType(product.type === 'service' || product.type === 'bundle' || product.type === 'ticket' ? product.type : 'product');
    setProdDurationMinutes(product.duration_minutes ? String(product.duration_minutes) : '');
    setProdServiceFacts(Array.isArray(product.service_facts) ? product.service_facts : []);
    setProdMobileFee(product.mobile_fee != null ? String(product.mobile_fee) : '');
    setProdMobileFeeLabel(product.mobile_fee_label || '');
    setProdCustomFact('');
    setProdTags(Array.isArray(product.tags) ? product.tags : []);
    setProdTagInput('');
    setAiAnalyzing(false);
    setProdExpectedAvailabilityDate(product.expected_availability_date ? product.expected_availability_date.slice(0, 10) : '');
    setProdBundleItems(Array.isArray(product.bundle_items) ? product.bundle_items.map(bi => ({ product_id: bi.child_product_id, quantity: bi.quantity })) : []);
    setProdRelatedProductIds(Array.isArray(product.related_product_ids) ? product.related_product_ids : []);
    setProdDigitalFiles(Array.isArray(product.digital_files) ? product.digital_files : []);
    setProdDownloadLimit(product.download_limit != null ? String(product.download_limit) : '');
    setProdReadOnlineOnly(product.read_online_only ?? false);
    setProdEventDate(product.event_date ? product.event_date.slice(0, 16) : '');
    setProdEventLocation(product.event_location || '');
    setProdVariants(Array.isArray(product.variants) ? product.variants.map((v: any) => ({
      id: v.id,
      size: v.size || '',
      color: v.color || '',
      price: v.price != null ? String(v.price) : '',
      inventory_quantity: v.inventory_quantity != null ? String(v.inventory_quantity) : '0',
    })) : []);
    setIsEditProductOpen(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (prodImageUrls.length === 0) {
      toast.error('Add at least one product image before saving.');
      return;
    }

    try {
      setProductPublishing(true);
      const payload = {
        name: prodName,
        price: parseFloat(prodPrice),
        compare_at_price: prodComparePrice ? parseFloat(prodComparePrice) : null,
        negotiable: prodNegotiable,
        min_price: prodNegotiable && prodMinPrice ? parseFloat(prodMinPrice) : null,
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
        expected_availability_date: prodStock === 'preorder' && prodExpectedAvailabilityDate ? prodExpectedAvailabilityDate : null,
        image_urls: prodImageUrls,
        is_digital: prodIsDigital,
        digital_file_url: prodIsDigital ? (prodDigitalFileUrl || null) : null,
        digital_link: prodIsDigital ? (prodDigitalLink || null) : null,
        type: prodType,
        duration_minutes: prodType === 'service' && prodDurationMinutes ? parseInt(prodDurationMinutes, 10) : null,
        service_facts: prodType === 'service' && prodServiceFacts.length > 0 ? prodServiceFacts : null,
        mobile_fee: prodType === 'service' && prodMobileFee ? parseFloat(prodMobileFee) : null,
        mobile_fee_label: prodType === 'service' && prodMobileFeeLabel ? prodMobileFeeLabel.trim() : null,
        tags: prodTags.length > 0 ? prodTags : null,
        bundle_items: prodType === 'bundle' ? prodBundleItems : undefined,
        related_product_ids: prodRelatedProductIds.length > 0 ? prodRelatedProductIds : null,
        digital_files: prodDigitalFiles.length > 0 ? prodDigitalFiles : null,
        download_limit: prodDigitalFiles.length > 0 && prodDownloadLimit ? parseInt(prodDownloadLimit, 10) : null,
        read_online_only: prodDigitalFiles.length > 0 ? prodReadOnlineOnly : false,
        event_date: prodType === 'ticket' ? (prodEventDate || null) : null,
        event_location: prodType === 'ticket' ? (prodEventLocation || null) : null,
        // Only send the `variants` key when there's something to sync — omitting it
        // entirely for variant-less products avoids the backend's variants branch
        // (which recalculates inventory_quantity/stock_status from the array and
        // would otherwise zero out stock on every edit of a plain product).
        variants: (prodVariants.length > 0 || (selectedProduct.variants && selectedProduct.variants.length > 0))
          ? prodVariants.map(v => ({
            id: v.id || undefined,
            size: v.size.trim() || null,
            color: v.color.trim() || null,
            price: v.price ? parseFloat(v.price) : null,
            inventory_quantity: parseInt(v.inventory_quantity, 10) || 0,
          }))
          : undefined,
      };

      const res = await resilientFetch(`${apiUrl}/v1/products/${selectedProduct.id}`, {
        method: 'PUT',
        credentials: 'include',
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

  const handleDeleteProduct = (productId: string) => {
    openConfirmationDialog(
      'Delete product',
      'Are you sure you want to delete this product? This action is permanent.',
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
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
      },
      'Delete',
      'Cancel'
    );
  };

  // --- Order Management Status Updates ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
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




  const handleTemplateActivate = async (templateId: string) => {
    if (templateSaving) return;
    const personaPreset = getSelectedPersonaPreset();
    if (personaPreset && personaPreset.template !== templateId) {
      toast.warning(`${personaPreset.name} uses the ${personaPreset.templateName} template. Clear the persona first to activate a different template.`);
      return;
    }

    const previousTemplate = selectedTemplate;
    const templateName = storeTemplates.find(t => t.id === templateId)?.name || 'Storefront';

    try {
      setTemplateSaving(templateId);
      setSelectedTemplate(templateId);

      const res = await fetch(`${apiUrl}/v1/store/template`, {
        method: 'PATCH',
        credentials: 'include',
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
      setSelectedPersona(json.data.business_persona || '');
      toast.success(`${templateName} template activated. Refresh the public store to view it.`);
    } catch (e: any) {
      setSelectedTemplate(previousTemplate);
      toast.error(e.message || 'Could not activate template.');
    } finally {
      setTemplateSaving(null);
    }
  };


  const handleTemplateColorSave = async () => {
    const isProUser = !!user?.is_pro;
    if (!isProUser && primaryColor !== '#25D366') {
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
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ primary_color: primaryColor })
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.message || 'Color update failed.');
      }

      setStore(json.data);
      localStorage.setItem('store', JSON.stringify(json.data));
      setPrimaryColor(json.data.primary_color || '#25D366');
      toast.success('Template color updated.');
    } catch (e: any) {
      toast.error(e.message || 'Could not update template color.');
    } finally {
      setTemplateSaving(null);
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
    const storeHeader = `🏪 STORE: ${store?.store_name || 'frontstore merchant'}\nURL: https://${store?.username}.${systemDomain}\n`;
    const orderHeader = `ORDER NO: ${order.order_number}\nDATE: ${new Date(order.created_at).toLocaleDateString()}\n`;
    const customer = `CUSTOMER: ${order.customer_name}\nPHONE: ${order.customer_phone}\nADDRESS: ${order.delivery_address || 'N/A'}\n`;

    // items summary list
    const sym = getCurrencySymbol(store?.currency_code);
    let itemSummary = '';
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const itemTotal = (parseFloat(item.product_price as string || '0') || 0) * item.quantity;
        itemSummary += `- ${item.quantity}x ${item.product_name} (@ ${sym}${(parseFloat(item.product_price as string || '0') || 0).toLocaleString()}) - ${sym}${(itemTotal || 0).toLocaleString()}\n`;
      });
    } else {
      itemSummary += `- 1x Digital Cart Purchase - ${sym}${(parseFloat(order.total_amount as string || '0') || 0).toLocaleString()}\n`;
    }

    const total = `\nTOTAL PAID: ${sym}${(parseFloat(order.total_amount as string || '0') || 0).toLocaleString()}\nSTATUS: PAID & CONFIRMED\n`;
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
    fetch(`${apiUrl}/v1/auth/logout`, { credentials: 'include', method: 'POST', headers: getAuthHeaders() }).catch(() => { });
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
  const formatVal = (val: number | string | null | undefined) => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '—' : num.toLocaleString();
  };

  const liveStoreUrl = store
    ? store.custom_domain
      ? `https://${store.custom_domain}`
      : typeof window !== 'undefined' && window.location.hostname.includes('localhost')
        ? `http://${store.username}.localhost:3000`
        : `https://${store.username}.${systemDomain}`
    : '';

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
        padding: '20px 14px',
        flexShrink: 0,
        background: 'var(--surface)',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Frontstore" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, borderRadius: 'var(--r-sm)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>frontstore</span>
          </div>
        </div>



        {/* Grouped Sidebar Navigation */}
        <nav className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto', paddingRight: 2 }}>
          {([
            {
              group: 'Core',
              items: [
                { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
                { id: 'orders', label: 'Orders', icon: <ShoppingBag size={17} />, count: orders.filter(o => o.order_status === 'pending').length },
                { id: 'products', label: 'Products', icon: <Package size={17} /> },
                { id: 'customers', label: 'Customers', icon: <Users size={17} />, pro: !isPro },
              ]
            },
            {
              group: 'Commerce',
              items: [
                { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={17} /> },
                { id: 'payment-links', label: 'Payment Links', icon: <Link size={17} />, pro: !isPro },
                { id: 'invoices', label: 'Invoices', icon: <FileText size={17} />, pro: !isPro },
                { id: 'receipts', label: 'Receipts', icon: <Receipt size={17} />, pro: !isPro },
                { id: 'inventory', label: 'Inventory', icon: <Archive size={17} />, pro: !isPro },
              ]
            },
            {
              group: 'Marketing',
              items: [
                { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={17} />, count: waOrders.filter(o => o.payment_status === 'unpaid').length || undefined },
                { id: 'coupons', label: 'Store Coupons', icon: <Tag size={17} />, pro: !isPro },
                { id: 'qr', label: 'My QR Code', icon: <QrCode size={17} />, pro: !isPro },
                { id: 'reviews', label: 'Reviews', icon: <Star size={17} />, count: reviews.filter(r => !r.reply).length || undefined },
                { id: 'share', label: 'Share & Earn', icon: <Share2 size={17} /> },
              ]
            }
          ] as Array<{ group: string; items: Array<{ id: string; label: string; icon: React.ReactNode; count?: number; pro?: boolean; legend?: boolean }> }>).map(section => {
            const visibleItems = section.items.filter(item => item.id === 'overview' || (isVisibleOnPlan(item.id) && !hiddenDashboardItems.includes(item.id)));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.group} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                }}>
                  {section.group}
                </span>
                {visibleItems.map(item => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateDashboardTab(item.id as DashboardTab)}
                      className="clickable"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--r-md)',
                        border: 'none',
                        background: active ? 'var(--primary-light)' : 'transparent',
                        color: active ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: 13.5,
                        fontWeight: active ? 750 : 600,
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ color: active ? 'var(--primary)' : 'var(--text-faint)' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      
                      {/* Pro Badge Tag */}
                      {item.pro && (
                        <span style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          color: '#9333ea',
                          background: 'rgba(147, 51, 234, 0.12)',
                          padding: '1px 5px',
                          borderRadius: 'var(--r-sm)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          Pro
                        </span>
                      )}

                      {/* Counter Badge */}
                      {Boolean(item.count && item.count > 0) && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#fff',
                          background: item.id === 'orders' ? 'var(--accent)' : 'var(--primary)',
                          padding: '1px 6px',
                          borderRadius: 'var(--r-full)',
                          minWidth: 18,
                          textAlign: 'center'
                        }}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => router.push('/dashboard/remove-distractions')}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '7px 10px', borderRadius: 'var(--r-md)', color: 'var(--text-muted)', fontSize: 12.5 }}
          >
            <EyeOff size={15} />
            <span style={{ flex: 1, textAlign: 'left' }}>Focus Mode</span>
            {!isLegend && (
              <span style={{ fontSize: 9.5, fontWeight: 800, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', padding: '1px 5px', borderRadius: 'var(--r-sm)' }}>Business</span>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Dark Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '7px 10px', borderRadius: 'var(--r-md)', color: 'var(--danger)', fontSize: 12.5 }}
          >
            <LogOut size={15} />
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
          padding: '10px 24px',
          background: 'var(--surface)',
        }}>
          {/* Left section: mobile toggle and mobile brand logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-burger-btn"
              style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
            >
              <Menu size={22} />
            </button>

            {/* Mobile logo (hidden on desktop via css) */}
            <div className="header-logo-mobile" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
              <img src="/logo.svg" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Frontstore" width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em' }}>frontstore</span>
            </div>
          </div>

          {/* AI Command Input Bar */}
          <form onSubmit={handleAiCommandSubmit} className="header-search-form" style={{ display: 'flex', flex: 1, maxWidth: 420, position: 'relative', margin: '0 16px' }}>
            <input
              type="text"
              placeholder="Search or ask AI copilot... (e.g. /discount)"
              value={aiCommand}
              onChange={e => setAiCommand(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: 12.5,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)',
                outline: 'none',
                color: 'var(--text)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />

            {aiResponseBubble && (
              <div className="card glass animate-scale-in" style={{ position: 'absolute', top: '115%', left: 0, right: 0, padding: 12, fontSize: 13, fontWeight: 600, border: '1px solid var(--primary)', zIndex: 50, color: 'var(--text)', borderRadius: 'var(--r-lg)' }}>
                {aiResponseBubble}
              </div>
            )}
          </form>

          {/* Right Action Widgets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <button
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
              className="btn btn-outline clickable"
              style={{
                padding: '7px 12px',
                fontSize: 12,
                borderRadius: 'var(--r-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                background: 'var(--surface)'
              }}
              title="Refresh Stats"
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
              <span className="desktop-only-text">Sync Live</span>
            </button>
            <ThemeToggle />

            {/* Store Profile Menu Dropdown */}
            {store && (
              <div ref={profileMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}
                  className="clickable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 7px 3px 3px',
                    borderRadius: 'var(--r-full)',
                    background: isProfileMenuOpen ? 'var(--bg-2)' : 'transparent',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  aria-label="Account and store menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.store_name || store.username}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #128C7E, #25D366)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 12,
                        fontFamily: 'var(--font-heading)',
                        flexShrink: 0,
                      }}
                    >
                      {(store.store_name || store.username || '').charAt(0).toUpperCase() || 'S'}
                    </div>
                  )}
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'var(--text-muted)',
                      transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="card glass animate-scale-in"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 260,
                      padding: '8px',
                      borderRadius: 'var(--r-xl)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    {/* Header Store Profile Card */}
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {store.logo_url ? (
                          <img
                            src={store.logo_url}
                            alt=""
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--r-md)',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid var(--border)'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--r-md)',
                              background: 'linear-gradient(135deg, #128C7E, #25D366)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: 14,
                              fontFamily: 'var(--font-heading)',
                              flexShrink: 0,
                            }}
                          >
                            {(store.store_name || store.username || '').charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                            {store.store_name || store.username}
                          </p>
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            @{store.username}
                          </span>
                        </div>
                      </div>

                      {/* Plan Tag */}
                      <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: 'var(--r-sm)',
                            background: isLegend ? 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' : isPro ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--bg-2)',
                            color: (isPro || isLegend) ? '#fff' : 'var(--text-muted)',
                            border: (isPro || isLegend) ? 'none' : '1px solid var(--border)',
                            letterSpacing: '0.04em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isPro ? <Zap size={8} /> : null}
                          {user?.plan === 'pro_monthly' ? 'Pro' : user?.plan === 'pro_yearly' ? 'Pro Yearly' : user?.plan === 'legend_monthly' ? 'Business' : user?.plan === 'legend_yearly' ? 'Business' : 'Free Tier'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)' }}>
                          {store.currency_code || 'NGN'}
                        </span>
                      </div>
                    </div>

                    {/* Upgrade / Billing Action */}
                    {(!user?.plan || user?.plan === 'free') ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigateDashboardTab('billing');
                        }}
                        className="clickable"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 'var(--r-md)',
                          background: 'linear-gradient(135deg, rgba(18,140,126,0.12), rgba(37,211,102,0.12))',
                          border: '1px solid var(--primary-border, rgba(18,140,126,0.3))',
                          color: 'var(--primary)',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          marginTop: 4,
                          marginBottom: 3,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Zap size={14} color="var(--primary)" />
                          <span>Upgrade to Pro</span>
                        </div>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigateDashboardTab('billing');
                        }}
                        className="clickable"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '8px 10px',
                          borderRadius: 'var(--r-md)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <Zap size={14} style={{ color: 'var(--primary)' }} />
                        <span>Manage Subscription</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigateDashboardTab('settings');
                      }}
                      className="clickable"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--r-md)', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <Settings size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigateDashboardTab('integrations');
                      }}
                      className="clickable"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--r-md)', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <Plug size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Integrations</span>
                      {!isLegend && (
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '1px 5px', borderRadius: 'var(--r-sm)', marginLeft: 'auto' }}>Business</span>
                      )}
                    </button>

                    <a
                      href={liveStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="clickable"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--r-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>View Live Store</span>
                      </div>
                      <ArrowUpRight size={13} style={{ color: 'var(--text-faint)' }} />
                    </a>

                    <div style={{ height: 1, background: 'var(--border)', margin: '3px 0' }} />

                    {/* Log out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="clickable"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '8px 10px',
                        borderRadius: 'var(--r-md)',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Pane Wrapper */}
        <div style={{ padding: 'clamp(16px, 3vw, 28px)', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {dataLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14.5 }}>Fetching store datasets...</span>
            </div>
          ) : (
            <>
              {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
              {activeTab === 'overview' && (
                <OverviewTab
                  store={store}
                  products={products}
                  orders={orders}
                  stats={stats}
                  isVisibleOnPlan={isVisibleOnPlan}
                  hiddenDashboardItems={hiddenDashboardItems}
                  openAddProductModal={openAddProductModal}
                  navigateDashboardTab={navigateDashboardTab}
                  setIsDiscountModalOpen={setIsDiscountModalOpen}
                />
              )}

              {/* ── TAB 2: ORDERS MANAGER ── */}
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  store={store}
                  onViewOrder={(order) => { setSelectedOrder(order); setIsOrderDetailsOpen(true); }}
                  onViewReceipt={(order) => { setReceiptOrder(order); setIsReceiptOpen(true); }}
                />
              )}

              {/* ── TAB 3: PRODUCTS CRUD ── */}
              {activeTab === 'products' && (
                <ProductsTab
                  products={products}
                  store={store}
                  onAddProduct={openAddProductModal}
                  onEditProduct={handleEditProductClick}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {/* ── TAB 4: WHATSAPP SALES INBOX ── */}
              {activeTab === 'whatsapp' && (
                <WhatsappTab
                  isPro={isPro}
                  store={store}
                  openUpgradePrompt={openUpgradePrompt}
                  waOrders={waOrders}
                  waLoading={waLoading}
                  loadWaOrders={loadWaOrders}
                  setWaOrders={setWaOrders}
                  selectedWaOrder={selectedWaOrder}
                  setSelectedWaOrder={setSelectedWaOrder}
                  handleUpdatePaymentStatus={handleUpdatePaymentStatus}
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  onViewFullDetails={(order) => { setSelectedOrder(order); setIsOrderDetailsOpen(true); }}
                />
              )}

              {/* ── TAB 5: SHARE & REFERRALS ── */}
              {activeTab === 'share' && (
                <ShareTab store={store} products={products} systemDomain={systemDomain} />
              )}

              {/* ── TAB: MY QR CODE ── */}
              {activeTab === 'qr' && (
                <QrTab store={store} systemDomain={systemDomain} isPro={isPro} openUpgradePrompt={openUpgradePrompt} />
              )}

              {/* ── TAB: STOREFRONT DESIGN (color only) ── */}
              {activeTab === 'templates' && (
                <TemplatesTab
                  liveStoreUrl={liveStoreUrl}
                  personaPresetName={getSelectedPersonaPreset()?.name ?? null}
                  primaryColor={primaryColor}
                  setPrimaryColor={setPrimaryColor}
                  selectedTemplate={selectedTemplate}
                  templateSaving={templateSaving}
                  onSaveColor={handleTemplateColorSave}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  store={store}
                  setStore={setStore}
                  user={user}
                  setUser={setUser}
                  token={token}
                  isPro={isPro}
                  isLegend={isLegend}
                  systemDomain={systemDomain}
                  domainTargetCname={domainTargetCname}
                  domainTargetIp={domainTargetIp}
                  openUpgradePrompt={openUpgradePrompt}
                  openConfirmationDialog={openConfirmationDialog}
                  legendMonthlyPrice={legendMonthlyPrice}
                  products={products}
                  primaryColor={primaryColor}
                  setPrimaryColor={setPrimaryColor}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  selectedPersona={selectedPersona}
                  setSelectedPersona={setSelectedPersona}
                />
              )}

              {/* ── TAB: BROADCAST MESSAGES ── */}
              {activeTab === 'reach' && (
                <ReachTab isPro={isPro} openUpgradePrompt={openUpgradePrompt} />
              )}

              {activeTab === 'integrations' && !isLegend && (
                <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
                  <div style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Plug size={32} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Integrations</h2>
                  <p style={{ fontSize: 11.5, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Marketing & Automation</p>
                  <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                    Connect Facebook Pixel, Google Tag Manager, and other marketing tools to track conversions and automate your storefront.
                  </p>

                  <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: '#7c3aed' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Facebook Pixel & Google Tag Manager</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: '#7c3aed' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Marketing & automation tool connections</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: '#7c3aed' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Track ad conversions across your storefront</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUpgradePrompt(
                      'Integrations requires Business',
                      'Connecting marketing pixels and automation tools is available on the Business plan. You can review the plan before upgrading.'
                    )}
                    className="btn btn-primary clickable"
                    style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, background: '#7c3aed', borderColor: '#7c3aed' }}
                  >
                    <Zap size={16} /> Upgrade to Business to Unlock Integrations
                  </button>
                </div>
              )}

              {activeTab === 'integrations' && isLegend && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  <IntegrationsTab />
                </div>
              )}

              {/* ── TAB 7: PLANS & BILLING ── */}
              {activeTab === 'billing' && (
                <BillingTab
                  user={user}
                  setUser={setUser}
                  setStore={setStore}
                  isPro={isPro}
                  isLegend={isLegend}
                  proMonthlyPrice={proMonthlyPrice}
                  proYearlyPrice={proYearlyPrice}
                  legendMonthlyPrice={legendMonthlyPrice}
                  legendYearlyPrice={legendYearlyPrice}
                  freeProductLimit={freeProductLimit}
                />
              )}

              {/* ── TAB: INVOICES ── */}
              {activeTab === 'invoices' && (
                <InvoicesTab store={store} isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB: PAYMENT LINKS ── */}
              {activeTab === 'payment-links' && (
                <PaymentLinksTab store={store} isPro={isPro} openUpgradePrompt={openUpgradePrompt} />
              )}

              {/* ── TAB: RECEIPTS ── */}
              {activeTab === 'receipts' && (
                <ReceiptsTab store={store} isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB: INVENTORY ── */}
              {activeTab === 'inventory' && (
                <InventoryTab isPro={isPro} products={products} navigateDashboardTab={navigateDashboardTab} refreshProducts={() => loadAllData(true)} />
              )}

              {/* ── TAB: AUTOMATIONS ── */}
              {activeTab === 'automations' && (
                <AutomationsTab isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB: PRO ANALYTICS ── */}
              {activeTab === 'analytics' && (
                <AnalyticsTab store={store} isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB 8: WALLET & PAYOUTS ── */}
              {activeTab === 'wallet' && (
                <WalletTab
                  store={store}
                  user={user}
                  isPro={isPro}
                  refreshDashboard={loadAllData}
                  navigateDashboardTab={navigateDashboardTab}
                />
              )}

              {/* ── TAB: CUSTOMERS (CRM) ── */}
              {activeTab === 'customers' && (
                <CustomersTab
                  isPro={isPro}
                  openUpgradePrompt={openUpgradePrompt}
                  store={store}
                  customers={customers}
                  customersLoading={customersLoading}
                  expandedCustomerId={expandedCustomerId}
                  setExpandedCustomerId={setExpandedCustomerId}
                  customerNotes={customerNotes}
                  customerNotesLoading={customerNotesLoading}
                  fetchCustomerNotes={fetchCustomerNotes}
                  newCustomerTag={newCustomerTag}
                  setNewCustomerTag={setNewCustomerTag}
                  handleAddCustomerTag={handleAddCustomerTag}
                  handleRemoveCustomerTag={handleRemoveCustomerTag}
                  customerTagSaving={customerTagSaving}
                  newCustomerNote={newCustomerNote}
                  setNewCustomerNote={setNewCustomerNote}
                  handleAddCustomerNote={handleAddCustomerNote}
                />
              )}

              {/* ── TAB 11: REVIEWS MANAGER ── */}
              {activeTab === 'reviews' && (
                <ReviewsTab
                  isPro={isPro}
                  reviews={reviews}
                  replyTexts={replyTexts}
                  setReplyTexts={setReplyTexts}
                  submittingReplyId={submittingReplyId}
                  handleReplyReview={handleReplyReview}
                  openUpgradePrompt={openUpgradePrompt}
                />
              )}

              {/* ── TAB: STOREFRONT COUPONS ── */}
              {activeTab === 'coupons' && (
                <CouponsTab store={store} isPro={isPro} openUpgradePrompt={openUpgradePrompt} />
              )}

              {/* ── TAB: AFFILIATES ── */}
              {activeTab === 'affiliates' && (
                <AffiliatesTab store={store} products={products} />
              )}

              {/* ── TAB 21: TEAM & STAFF ── */}
              {activeTab === 'team' && (
                <TeamTab isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB 22: PROFIT ANALYTICS ── */}
              {activeTab === 'finance' && (
                <FinanceTab store={store} isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB 23: REFUND REQUESTS ── */}
              {activeTab === 'refunds' && (
                <RefundsTab store={store} isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
              )}

              {/* ── TAB 24: UNIFIED COMMUNICATIONS INBOX ── */}
              {activeTab === 'inbox' && (
                <InboxTab isPro={isPro} navigateDashboardTab={navigateDashboardTab} />
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
            borderRight: '1px solid var(--border)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
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

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, paddingRight: 4 }}>
              {([
                {
                  group: 'Core',
                  items: [
                    { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
                    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={17} />, count: orders.filter(o => o.order_status === 'pending').length },
                    { id: 'products', label: 'Products', icon: <Package size={17} /> },
                    { id: 'customers', label: 'Customers', icon: <Users size={17} />, pro: !isPro },
                  ]
                },
                {
                  group: 'Commerce',
                  items: [
                    { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={17} /> },
                    { id: 'payment-links', label: 'Payment Links', icon: <Link size={17} />, pro: !isPro },
                    { id: 'invoices', label: 'Invoices', icon: <FileText size={17} />, pro: !isPro },
                    { id: 'receipts', label: 'Receipts', icon: <Receipt size={17} />, pro: !isPro },
                    { id: 'inventory', label: 'Inventory', icon: <Archive size={17} />, pro: !isPro },
                  ]
                },
                  {
                  group: 'Marketing',
                  items: [
                    { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={17} />, count: waOrders.filter(o => o.payment_status === 'unpaid').length || undefined },
                    { id: 'coupons', label: 'Store Coupons', icon: <Tag size={17} />, pro: !isPro },
                    { id: 'qr', label: 'My QR Code', icon: <QrCode size={17} />, pro: !isPro },
                    { id: 'reviews', label: 'Reviews', icon: <Star size={17} />, count: reviews.filter(r => !r.reply).length || undefined },
                    { id: 'share', label: 'Share & Earn', icon: <Share2 size={17} /> },
                  ]
                }
              ] as { group: string; items: { id: string; label: string; icon: React.ReactNode; count?: number; pro?: boolean; legend?: boolean }[] }[]).map(section => {
                const visibleItems = section.items.filter(item => item.id === 'overview' || (isVisibleOnPlan(item.id) && !hiddenDashboardItems.includes(item.id)));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.group} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--text-faint)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '2px 8px',
                    }}>
                      {section.group}
                    </span>
                    {visibleItems.map(item => {
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            navigateDashboardTab(item.id as DashboardTab);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 'var(--r-md)',
                            border: 'none',
                            background: active ? 'var(--primary-light)' : 'transparent',
                            color: active ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: 13.5,
                            fontWeight: active ? 750 : 600,
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ color: active ? 'var(--primary)' : 'var(--text-faint)' }}>{item.icon}</span>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {Boolean(item.count && item.count > 0) && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: '#fff',
                              background: item.id === 'orders' ? 'var(--accent)' : 'var(--primary)',
                              padding: '1px 6px',
                              borderRadius: 'var(--r-full)'
                            }}>
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => {
                  router.push('/dashboard/remove-distractions');
                  setIsMobileMenuOpen(false);
                }}
                className="btn btn-ghost clickable"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 'var(--r-md)', color: 'var(--text-muted)', fontSize: 12.5 }}
              >
                <EyeOff size={15} />
                <span style={{ flex: 1, textAlign: 'left' }}>Focus Mode</span>
                {!isLegend && (
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', padding: '1px 5px', borderRadius: 'var(--r-sm)' }}>Legend</span>
                )}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Dark Theme</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost clickable"
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12.5 }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INSIGHTS DISCOUNT CAMPAIGN ── */}
      {isDiscountModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsDiscountModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 28, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={18} style={{ color: 'var(--accent)' }} /> Create Flash Campaign
              </h3>
              <button onClick={() => setIsDiscountModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
              Launch a flash discount campaign to automatically display sale pricing to shoppers at checkout.
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
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 820, padding: 28, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* ── Modal Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--r-lg)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>New Product</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>Upload a photo to get started — AI will fill in the details.</p>
                </div>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', padding: 4, borderRadius: 'var(--r-sm)', cursor: 'pointer', flexShrink: 0 }} className="clickable"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── STEP 1: Product Photo Upload — Full-bleed drop zone ── */}
              <div
                id="prod-img-drop-zone"
                style={{
                  borderRadius: 'var(--r-xl)',
                  border: `1.5px ${prodImageUrls.length === 0 ? 'dashed' : 'solid'} var(--border)`,
                  background: 'var(--bg-2)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: prodImageUrls.length > 0 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)' }}>Product Photos</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>Upload up to 3 — AI auto-fills title, price & description.</div>
                  </div>
                  {aiAnalyzing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-light)', border: '1px solid rgba(18,140,126,0.2)', borderRadius: 'var(--r-full)', padding: '5px 12px', flexShrink: 0 }}>
                      <Loader2 size={12} className="spinner" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 11.5, color: 'var(--primary)', fontWeight: 750 }}>AI analyzing...</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 750, padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'var(--primary-light)', color: 'var(--primary)', flexShrink: 0 }}>
                      {(user?.plan === 'pro_yearly' || isLegend) ? '✦ Unlimited AI' : `${Math.max(0, (user?.plan === 'pro_monthly' ? 15 : 3) - (user?.ai_analyses_used ?? 0))} AI credits left`}
                    </span>
                  )}
                </div>

                {/* Hidden input */}
                <input
                  id="prod-img-input-inline"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || prodImageUrls.length >= 3) return;
                    e.target.value = '';
                    try {
                      setProdImageUploading(true);
                      const fd = new FormData(); fd.append('image', file);
                      const res = await fetch(`${apiUrl}/v1/products/upload-image`, { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json' }, body: fd });
                      const json = await res.json();
                      if (res.ok && json.url) {
                        const isFirst = prodImageUrls.length === 0;
                        setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
                        toast.success('Image uploaded!');
                        if (isFirst) handleAutoAnalyzeImage(file);
                      } else throw new Error(json.message || 'Upload failed');
                    } catch (err: any) { toast.error(err.message || 'Image upload error'); }
                    finally { setProdImageUploading(false); }
                  }}
                />

                {prodImageUrls.length === 0 ? (
                  /* Full-bleed empty drop zone — whole area is the click/drop target */
                  <div
                    onClick={() => !prodImageUploading && (document.getElementById('prod-img-input-inline') as HTMLInputElement)?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onDragLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.style.background = '';
                      const file = e.dataTransfer.files[0];
                      if (!file || prodImageUrls.length >= 3) return;
                      try {
                        setProdImageUploading(true);
                        const fd = new FormData(); fd.append('image', file);
                        const res = await fetch(`${apiUrl}/v1/products/upload-image`, { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json' }, body: fd });
                        const json = await res.json();
                        if (res.ok && json.url) {
                          const isFirst = prodImageUrls.length === 0;
                          setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
                          toast.success('Image uploaded!');
                          if (isFirst) handleAutoAnalyzeImage(file);
                        } else throw new Error(json.message || 'Upload failed');
                      } catch (err: any) { toast.error(err.message || 'Image upload error'); }
                      finally { setProdImageUploading(false); }
                    }}
                    style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: prodImageUploading ? 'not-allowed' : 'pointer' }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 'var(--r-full)', background: 'var(--surface)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      {prodImageUploading ? <Loader2 size={22} className="spinner" style={{ color: 'var(--primary)' }} /> : <Upload size={22} strokeWidth={1.8} />}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 13.5, fontWeight: 750, color: 'var(--text)', marginBottom: 4 }}>
                        {prodImageUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, WEBP · AI fills in price, title & description</p>
                    </div>
                  </div>
                ) : (
                  /* Has images — tile grid + small add-more button */
                  <div style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {prodImageUrls.map((url, idx) => (
                      <div key={idx} className="fu-tile-img" style={{ position: 'relative', width: idx === 0 ? 110 : 80, height: idx === 0 ? 110 : 80, flexShrink: 0 }}>
                        <img src={url} alt={`Product image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--r-lg)' }} />
                        {idx === 0 && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, fontWeight: 900, background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Cover</span>}
                        <button type="button" onClick={() => setProdImageUrls(prev => prev.filter((_, i) => i !== idx))} className="fu-tile-img__remove" title="Remove">✕</button>
                      </div>
                    ))}
                    {prodImageUrls.length < 3 && (
                      <button
                        type="button"
                        onClick={() => (document.getElementById('prod-img-input-inline') as HTMLInputElement)?.click()}
                        disabled={prodImageUploading}
                        style={{ width: 80, height: 80, borderRadius: 'var(--r-lg)', border: '1.5px dashed var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                      >
                        {prodImageUploading ? <Loader2 size={18} className="spinner" style={{ color: 'var(--primary)' }} /> : <><ImagePlus size={18} strokeWidth={1.8} /><span>ADD</span></>}
                      </button>
                    )}
                    <div style={{ width: '100%', fontSize: 11.5, color: 'var(--text-faint)', paddingTop: 4 }}>
                      {prodImageUrls.length}/3 photos · {prodImageUrls.length < 3 ? `Add ${3 - prodImageUrls.length} more for a richer listing` : 'All slots filled'}
                    </div>
                  </div>
                )}
              </div>

              {/* ── STEP 2+: Rest of the form — revealed once the main image is uploaded & analyzed ── */}
              {prodImageUrls.length === 0 ? (
                /* ── Locked State — shown before first image is uploaded ── */
                <div style={{ borderRadius: 'var(--r-xl)', border: '1px dashed var(--border)', background: 'var(--surface)', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 0.65 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, width: '100%', maxWidth: 320, pointerEvents: 'none' }}>
                    {['Product Title', 'Price', 'Category', 'Description'].map(field => (
                      <div key={field} style={{ padding: '8px 10px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>{field}</div>
                        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, width: field === 'Description' ? '80%' : '60%' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect width="11" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Upload a photo above to unlock the full form</span>
                  </div>
                </div>
              ) : aiAnalyzing ? null : (
              <>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8 }}>What are you selling?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { id: 'physical', icon: ShoppingBag, label: 'Physical', sublabel: 'Shipped or handed over', active: !prodIsDigital && prodType !== 'bundle' },
                    { id: 'digital', icon: Laptop, label: 'Digital', sublabel: 'Downloads, files, links', active: prodIsDigital },
                    { id: 'bundle', icon: Package, label: 'Bundle', sublabel: 'Combo of other products', active: prodType === 'bundle' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (opt.id === 'physical') { setProdIsDigital(false); setProdType('product'); }
                        if (opt.id === 'digital') { setProdIsDigital(true); setProdType('product'); setProdStock('in_stock'); }
                        if (opt.id === 'bundle') { setProdIsDigital(false); setProdType('bundle'); setProdStock('in_stock'); }
                      }}
                      style={{
                        padding: '12px 8px',
                        border: opt.active ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        background: opt.active ? 'var(--primary-light)' : 'var(--surface)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all var(--t-fast)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                      }}
                    >
                      <opt.icon size={22} strokeWidth={2} color={opt.active ? 'var(--primary)' : 'var(--text-faint)'} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: opt.active ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-faint)', lineHeight: 1.3 }}>{opt.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── STEP 3: Pre-filled fields (AI fills these) ── */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                  <input type="checkbox" id="prodNegotiable" checked={prodNegotiable} onChange={e => setProdNegotiable(e.target.checked)} />
                  <label htmlFor="prodNegotiable" style={{ fontSize: 12.5, fontWeight: 600 }}>Allow Nina AI to negotiate price on WhatsApp</label>
                </div>
                {prodNegotiable && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Lowest Price Nina Can Accept ({getCurrencySymbol(store?.currency_code)})</label>
                    <input
                      type="number"
                      placeholder="8000"
                      value={prodMinPrice}
                      onChange={e => setProdMinPrice(e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}
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
                      { value: 'out_of_stock', label: 'Out of Stock' },
                      { value: 'low_stock', label: 'Low Stock' },
                      { value: 'preorder', label: 'Pre-order' },
                    ]}
                    value={prodStock}
                    onChange={val => setProdStock(val)}
                    disabled={prodIsDigital || prodType === 'bundle'}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              {prodStock === 'preorder' && (
                <div className="animate-fade-in">
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Expected Availability Date</label>
                  <input
                    type="date"
                    value={prodExpectedAvailabilityDate}
                    onChange={e => setProdExpectedAvailabilityDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              {/* Variants — size / colour options for physical products */}
              {prodType === 'product' && !prodIsDigital && (
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>🎨 Variants (Size / Colour)</div>
                    <button
                      type="button"
                      className="btn clickable"
                      onClick={() => setProdVariants(prev => [...prev, { size: '', color: '', price: '', inventory_quantity: '1' }])}
                      style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none' }}
                    >
                      + Add Variant
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Let buyers pick a size and/or colour before adding to cart. Use the color picker to set visual swatches.</p>

                  {/* Preset Color Swatches */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Quick Swatches:</span>
                    {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#d97706', '#94a3b8'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        title={`Add variant with color ${hex}`}
                        onClick={() => {
                          setProdVariants(prev => {
                            if (prev.length === 0) return [{ size: '', color: hex, price: '', inventory_quantity: '1' }];
                            const lastEmptyIdx = prev.findIndex(row => !row.color);
                            if (lastEmptyIdx !== -1) {
                              return prev.map((row, ri) => ri === lastEmptyIdx ? { ...row, color: hex } : row);
                            }
                            return [...prev, { size: '', color: hex, price: '', inventory_quantity: '1' }];
                          });
                        }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          background: hex,
                          border: hex === '#ffffff' ? '1.5px solid #cbd5e1' : '1px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      />
                    ))}
                  </div>

                  {prodVariants.map((v, i) => {
                    const currentHex = getColorHex(v.color) || '#3b82f6';
                    return (
                      <div key={i} className="pv-variant-row">
                        <input className="input-field" placeholder="Size (e.g. M)" value={v.size} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, size: e.target.value } : row))} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 140px' }}>
                          <input
                            type="color"
                            value={currentHex}
                            onChange={e => {
                              const hex = e.target.value;
                              setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, color: hex } : row));
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              padding: 0,
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              background: 'transparent',
                              flexShrink: 0,
                            }}
                            title="Pick visual color"
                          />
                          <input
                            className="input-field"
                            placeholder="Colour (e.g. Red / #ef4444)"
                            value={v.color}
                            onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, color: e.target.value } : row))}
                          />
                        </div>
                        <input className="input-field" type="number" min={0} step="0.01" placeholder="Price override" value={v.price} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, price: e.target.value } : row))} />
                        <input className="input-field" type="number" min={0} placeholder="Stock qty" value={v.inventory_quantity} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, inventory_quantity: e.target.value } : row))} />
                        <button type="button" className="pv-variant-remove" onClick={() => setProdVariants(prev => prev.filter((_, ri) => ri !== i))}>
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bundle Extras — shown when Bundle type is selected */}
              {prodType === 'bundle' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>📦 Bundle Components</div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Pick the products included in this bundle and how many of each.</p>
                  {products.filter(p => p.type !== 'bundle').map(p => {
                    const selected = prodBundleItems.find(bi => bi.product_id === p.id);
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={e => {
                            if (e.target.checked) {
                              setProdBundleItems(prev => [...prev, { product_id: p.id, quantity: 1 }]);
                            } else {
                              setProdBundleItems(prev => prev.filter(bi => bi.product_id !== p.id));
                            }
                          }}
                        />
                        <span style={{ fontSize: 13, flex: 1 }}>{p.name}</span>
                        {selected && (
                          <input
                            type="number"
                            min={1}
                            value={selected.quantity}
                            onChange={e => {
                              const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                              setProdBundleItems(prev => prev.map(bi => bi.product_id === p.id ? { ...bi, quantity: qty } : bi));
                            }}
                            className="input-field"
                            style={{ width: 60, padding: '4px 8px' }}
                          />
                        )}
                      </div>
                    );
                  })}
                  {products.filter(p => p.type !== 'bundle').length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Add other products first, then come back to bundle them.</p>
                  )}
                </div>
              )}

              {/* Ticket Extras — shown when Ticket type is selected */}
              {prodType === 'ticket' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>🎫 Event Details</div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Event Date & Time</label>
                    <input
                      type="datetime-local"
                      value={prodEventDate}
                      onChange={e => setProdEventDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Event Location</label>
                    <input
                      type="text"
                      placeholder="e.g. The Zone, Gbagada, Lagos or 'Online'"
                      value={prodEventLocation}
                      onChange={e => setProdEventLocation(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Turn on inventory tracking below to cap how many tickets can be sold.</p>
                </div>
              )}

              {/* Digital Product Extras — shown when Digital type is selected */}
              {prodIsDigital && (
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>💻 Digital Product Details</div>

                  {/* File Upload Slot */}
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Digital File (Optional, max 20MB)
                    </label>
                    <FileUpload
                      variant="default"
                      accept="*"
                      label="Upload Product File"
                      hint="eBooks, courses, templates, music, PDFs, etc. (max 20MB)"
                      previewUrl={prodDigitalFileUrl || undefined}
                      uploading={prodDigitalUploading}
                      onRemove={() => setProdDigitalFileUrl('')}
                      maxSize={20 * 1024 * 1024}
                      onFile={async (file) => {
                        try {
                          setProdDigitalUploading(true);
                          const fd = new FormData();
                          fd.append('file', file);
                          const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                            method: 'POST',
                            credentials: 'include',
        headers: { 'Accept': 'application/json' },
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
                        }
                      }}
                    />
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

                  {/* Extra files (multi-file delivery) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Extra Files (Optional — e.g. bonus chapters, workbook)
                    </label>
                    {prodDigitalFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, flex: 1, wordBreak: 'break-all' }}>{f.name}</span>
                        <button type="button" onClick={() => setProdDigitalFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <FileUpload
                      variant="default"
                      accept="*"
                      label="Add another file"
                      hint="Uploads here are added to the list above, not replaced."
                      uploading={prodDigitalUploading}
                      maxSize={20 * 1024 * 1024}
                      onFile={async (file) => {
                        try {
                          setProdDigitalUploading(true);
                          const fd = new FormData();
                          fd.append('file', file);
                          const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                            method: 'POST',
                            credentials: 'include',
        headers: { 'Accept': 'application/json' },
                            body: fd
                          });
                          const json = await res.json();
                          if (res.ok && json.path) {
                            setProdDigitalFiles(prev => [...prev, { path: json.path, name: file.name }]);
                            toast.success('File added! 📁');
                          } else throw new Error(json.message || 'File upload failed');
                        } catch (err: any) {
                          toast.error(err.message || 'File upload error');
                        } finally {
                          setProdDigitalUploading(false);
                        }
                      }}
                    />
                  </div>

                  {prodDigitalFiles.length > 0 && (
                    <div className="responsive-form-row">
                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Download Limit (Optional)</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="Unlimited"
                          value={prodDownloadLimit}
                          onChange={e => setProdDownloadLimit(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                        <input type="checkbox" id="prodReadOnlineOnly" checked={prodReadOnlineOnly} onChange={e => setProdReadOnlineOnly(e.target.checked)} />
                        <label htmlFor="prodReadOnlineOnly" style={{ fontSize: 12.5, fontWeight: 600 }}>Read online only (no download link, e.g. for ebooks)</label>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* Service Extras — shown when Service type is selected */}
              {prodType === 'service' && (
                <div style={{ background: 'rgba(129, 0, 209, 0.04)', border: '1.5px solid rgba(129, 0, 209, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#8100d1' }}>🛎️ Service Details</div>
                  <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Duration (Optional)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 90"
                          value={prodDurationMinutes}
                          onChange={e => setProdDurationMinutes(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: 34 }}
                        />
                        <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>How long this service typically takes, in minutes.</p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Service Details (Optional)
                      </label>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>
                        Pick a few quick facts to show customers on this service&apos;s page{getSelectedPersonaPreset() ? ` — suggested for ${getSelectedPersonaPreset()?.name} stores` : ''}.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {getServiceFactPresets(selectedPersona).map(preset => {
                          const checked = prodServiceFacts.includes(preset.label);
                          return (
                            <Toggle
                              key={preset.label}
                              checked={checked}
                              onChange={(next) => {
                                if (next) {
                                  setProdServiceFacts(prev => [...prev, preset.label]);
                                } else {
                                  setProdServiceFacts(prev => prev.filter(f => f !== preset.label));
                                }
                              }}
                              label={<span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600 }}>{preset.label}</span>}
                            />
                          );
                        })}
                      </div>

                      {/* Custom facts the merchant typed in */}
                      {prodServiceFacts.filter(f => !getServiceFactPresets(selectedPersona).some(p => p.label === f)).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                          {prodServiceFacts.filter(f => !getServiceFactPresets(selectedPersona).some(p => p.label === f)).map(fact => (
                            <div key={fact} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--bg-2)', borderRadius: 'var(--r-sm)', padding: '8px 10px' }}>
                              <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600 }}>{fact}</span>
                              <button
                                type="button"
                                onClick={() => setProdServiceFacts(prev => prev.filter(f2 => f2 !== fact))}
                                style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}
                                title="Remove"
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <input
                          type="text"
                          placeholder="Write your own detail…"
                          value={prodCustomFact}
                          onChange={e => setProdCustomFact(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const text = prodCustomFact.trim();
                            if (!text) return;
                            if (prodServiceFacts.includes(text)) { setProdCustomFact(''); return; }
                            setProdServiceFacts(prev => [...prev, text]);
                            setProdCustomFact('');
                          }}
                          className="btn btn-secondary"
                          style={{ flexShrink: 0 }}
                        >Add</button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Mobile Service Fee (Optional)
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 2000"
                          value={prodMobileFee}
                          onChange={e => setProdMobileFee(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          placeholder='Label, e.g. "Bike Fee"'
                          value={prodMobileFeeLabel}
                          onChange={e => setProdMobileFeeLabel(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Extra charge added when a customer selects Mobile Session. Give it a name so they know what it covers (e.g. &ldquo;Bike Fee&rdquo;, &ldquo;Travel Fee&rdquo;).</p>
                    </div>

                  </div>
              )}


              

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
                    {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Edit2 size={11} /> AI Auto-Write</>}
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

              {/* Tags editor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Product Tags</label>
                  {isPro ? (
                    <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>AI-SUGGESTED</span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>Pro</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {prodTags.map((tag, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.35)', fontSize: 12, fontWeight: 600, color: '#d97706' }}>
                      {tag}
                      <button type="button" onClick={() => setProdTags(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#d97706', lineHeight: 1, display: 'flex', alignItems: 'center' }} aria-label={`Remove tag ${tag}`}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {prodTags.length === 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic' }}>{isPro ? 'Upload a photo and AI will suggest tags automatically.' : 'Add up to 10 tags to help buyers find your product.'}</span>
                  )}
                </div>
                {prodTags.length < 10 && (
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter..."
                    value={prodTagInput}
                    onChange={e => setProdTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const t = prodTagInput.trim();
                        if (t && !prodTags.includes(t) && prodTags.length < 10) {
                          setProdTags(prev => [...prev, t]);
                          setProdTagInput('');
                        }
                      }
                    }}
                    className="input-field"
                    style={{ fontSize: 13 }}
                  />
                )}
              </div>

              {/* Cross-sell picker — optional, storefront falls back to same-category automatically */}
              {products.filter(p => p.id !== selectedProduct?.id).length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    "You May Also Like" Picks (Optional, up to 8)
                  </label>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8 }}>Leave unchecked and we'll auto-suggest same-category products instead.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
                    {products.filter(p => p.id !== selectedProduct?.id).map(p => {
                      const checked = prodRelatedProductIds.includes(p.id);
                      return (
                        <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, border: checked ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: checked ? 'var(--primary-light)' : 'var(--surface)', fontSize: 12, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              if (e.target.checked) {
                                if (prodRelatedProductIds.length >= 8) return;
                                setProdRelatedProductIds(prev => [...prev, p.id]);
                              } else {
                                setProdRelatedProductIds(prev => prev.filter(id => id !== p.id));
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          {p.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              </>
              )}

              {/* ── Footer Actions ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="btn btn-ghost clickable"
                  style={{ padding: '10px 18px', fontSize: 13.5, fontWeight: 700, color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productPublishing || prodImageUrls.length === 0}
                  className="btn btn-primary clickable"
                  style={{
                    padding: '11px 28px', fontSize: 14, fontWeight: 800, borderRadius: 'var(--r-lg)',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: prodImageUrls.length > 0 ? '0 4px 14px rgba(18, 140, 126, 0.3)' : 'none',
                    opacity: prodImageUrls.length === 0 ? 0.45 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {productPublishing ? <><Loader2 size={15} className="spinner" /> Publishing...</> : <><Package size={15} /> Publish Product</>}
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
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 680, padding: 28, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Edit Product Settings</h3>
              <button onClick={() => setIsEditProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            {selectedProduct?.qr_code_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <img src={selectedProduct.qr_code_url} alt="Product QR code" width={64} height={64} style={{ borderRadius: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>Scan to view this product</div>
                  <a href={selectedProduct.qr_code_url} download={`product-${selectedProduct.id}-qr.png`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                    Download QR code
                  </a>
                </div>
              </div>
            )}

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                  <input type="checkbox" id="prodNegotiableEdit" checked={prodNegotiable} onChange={e => setProdNegotiable(e.target.checked)} />
                  <label htmlFor="prodNegotiableEdit" style={{ fontSize: 12.5, fontWeight: 600 }}>Allow Nina AI to negotiate price on WhatsApp</label>
                </div>
                {prodNegotiable && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Lowest Price Nina Can Accept ({getCurrencySymbol(store?.currency_code)})</label>
                    <input
                      type="number"
                      placeholder="8000"
                      value={prodMinPrice}
                      onChange={e => setProdMinPrice(e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}
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
                      { value: 'out_of_stock', label: 'Out of Stock' },
                      { value: 'low_stock', label: 'Low Stock' },
                      { value: 'preorder', label: 'Pre-order' },
                    ]}
                    value={prodStock}
                    onChange={val => setProdStock(val)}
                    disabled={prodIsDigital || prodType === 'bundle'}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              {prodStock === 'preorder' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Expected Availability Date</label>
                  <input
                    type="date"
                    value={prodExpectedAvailabilityDate}
                    onChange={e => setProdExpectedAvailabilityDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              {/* Variants — size / colour options for physical products */}
              {prodType === 'product' && !prodIsDigital && (
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>🎨 Variants (Size / Colour)</div>
                    <button
                      type="button"
                      className="btn clickable"
                      onClick={() => setProdVariants(prev => [...prev, { size: '', color: '', price: '', inventory_quantity: '1' }])}
                      style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none' }}
                    >
                      + Add Variant
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Let buyers pick a size and/or colour before adding to cart. Use the color picker to set visual swatches.</p>

                  {/* Preset Color Swatches */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Quick Swatches:</span>
                    {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#d97706', '#94a3b8'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        title={`Add variant with color ${hex}`}
                        onClick={() => {
                          setProdVariants(prev => {
                            if (prev.length === 0) return [{ size: '', color: hex, price: '', inventory_quantity: '1' }];
                            const lastEmptyIdx = prev.findIndex(row => !row.color);
                            if (lastEmptyIdx !== -1) {
                              return prev.map((row, ri) => ri === lastEmptyIdx ? { ...row, color: hex } : row);
                            }
                            return [...prev, { size: '', color: hex, price: '', inventory_quantity: '1' }];
                          });
                        }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          background: hex,
                          border: hex === '#ffffff' ? '1.5px solid #cbd5e1' : '1px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      />
                    ))}
                  </div>

                  {prodVariants.map((v, i) => {
                    const currentHex = getColorHex(v.color) || '#3b82f6';
                    return (
                      <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <input className="input-field" style={{ flex: '1 1 90px', minWidth: 80 }} placeholder="Size (e.g. M)" value={v.size} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, size: e.target.value } : row))} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 140px' }}>
                          <input
                            type="color"
                            value={currentHex}
                            onChange={e => {
                              const hex = e.target.value;
                              setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, color: hex } : row));
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              padding: 0,
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              background: 'transparent',
                              flexShrink: 0,
                            }}
                            title="Pick visual color"
                          />
                          <input
                            className="input-field"
                            style={{ flex: '1 1 90px', minWidth: 80 }}
                            placeholder="Colour (e.g. Red / #ef4444)"
                            value={v.color}
                            onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, color: e.target.value } : row))}
                          />
                        </div>
                        <input className="input-field" style={{ flex: '1 1 110px', minWidth: 90 }} type="number" min={0} step="0.01" placeholder="Price override" value={v.price} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, price: e.target.value } : row))} />
                        <input className="input-field" style={{ flex: '1 1 90px', minWidth: 80 }} type="number" min={0} placeholder="Stock qty" value={v.inventory_quantity} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, inventory_quantity: e.target.value } : row))} />
                        <button type="button" onClick={() => setProdVariants(prev => prev.filter((_, ri) => ri !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', flexShrink: 0 }}>
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bundle Product Settings */}
              <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px dashed rgba(16, 185, 129, 0.3)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Toggle
                  checked={prodType === 'bundle'}
                  onChange={(next) => {
                    setProdType(next ? 'bundle' : 'product');
                    setProdIsDigital(false);
                    if (next) setProdStock('in_stock');
                  }}
                  label={
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block' }}>Bundle Product</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Combine other products into one discounted combo.</span>
                    </div>
                  }
                />
                {prodType === 'bundle' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
                    {products.filter(p => p.type !== 'bundle' && p.id !== selectedProduct?.id).map(p => {
                      const selected = prodBundleItems.find(bi => bi.product_id === p.id);
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={e => {
                              if (e.target.checked) {
                                setProdBundleItems(prev => [...prev, { product_id: p.id, quantity: 1 }]);
                              } else {
                                setProdBundleItems(prev => prev.filter(bi => bi.product_id !== p.id));
                              }
                            }}
                          />
                          <span style={{ fontSize: 13, flex: 1 }}>{p.name}</span>
                          {selected && (
                            <input
                              type="number"
                              min={1}
                              value={selected.quantity}
                              onChange={e => {
                                const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                                setProdBundleItems(prev => prev.map(bi => bi.product_id === p.id ? { ...bi, quantity: qty } : bi));
                              }}
                              className="input-field"
                              style={{ width: 60, padding: '4px 8px' }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ticket (Event) Product Settings */}
              <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px dashed rgba(16, 185, 129, 0.3)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Toggle
                  checked={prodType === 'ticket'}
                  onChange={(next) => {
                    setProdType(next ? 'ticket' : 'product');
                    setProdIsDigital(false);
                  }}
                  label={
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block' }}>Event Ticket</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Sell tickets with a QR check-in code.</span>
                    </div>
                  }
                />
                {prodType === 'ticket' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="animate-fade-in">
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Event Date & Time</label>
                      <input
                        type="datetime-local"
                        value={prodEventDate}
                        onChange={e => setProdEventDate(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Event Location</label>
                      <input
                        type="text"
                        placeholder="e.g. The Zone, Gbagada, Lagos or 'Online'"
                        value={prodEventLocation}
                        onChange={e => setProdEventLocation(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
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
                <Toggle
                  checked={prodIsDigital}
                  onChange={(next) => {
                    setProdIsDigital(next);
                    if (next) {
                      setProdStock('in_stock');
                    }
                  }}
                  label={
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block' }}>Digital Product</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Sell eBooks, courses, templates, music, PDFs, etc.</span>
                    </div>
                  }
                />

                {prodIsDigital && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: 14 }} className="animate-fade-in">

                    {/* File Upload Slot */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Digital File (Optional, max 20MB)
                      </label>
                      <FileUpload
                        variant="default"
                        accept="*"
                        label="Upload Product File"
                        hint="eBooks, courses, templates, music, PDFs, etc. (max 20MB)"
                        previewUrl={prodDigitalFileUrl || undefined}
                        uploading={prodDigitalUploading}
                        onRemove={() => setProdDigitalFileUrl('')}
                        maxSize={20 * 1024 * 1024}
                        onFile={async (file) => {
                          try {
                            setProdDigitalUploading(true);
                            const fd = new FormData();
                            fd.append('file', file);
                            const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                              method: 'POST',
                              credentials: 'include',
        headers: { 'Accept': 'application/json' },
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
                          }
                        }}
                      />
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

                    {/* Extra files (multi-file delivery) */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Extra Files (Optional — e.g. bonus chapters, workbook)
                      </label>
                      {prodDigitalFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12.5, flex: 1, wordBreak: 'break-all' }}>{f.name}</span>
                          <button type="button" onClick={() => setProdDigitalFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <FileUpload
                        variant="default"
                        accept="*"
                        label="Add another file"
                        hint="Uploads here are added to the list above, not replaced."
                        uploading={prodDigitalUploading}
                        maxSize={20 * 1024 * 1024}
                        onFile={async (file) => {
                          try {
                            setProdDigitalUploading(true);
                            const fd = new FormData();
                            fd.append('file', file);
                            const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                              method: 'POST',
                              credentials: 'include',
        headers: { 'Accept': 'application/json' },
                              body: fd
                            });
                            const json = await res.json();
                            if (res.ok && json.path) {
                              setProdDigitalFiles(prev => [...prev, { path: json.path, name: file.name }]);
                              toast.success('File added! 📁');
                            } else throw new Error(json.message || 'File upload failed');
                          } catch (err: any) {
                            toast.error(err.message || 'File upload error');
                          } finally {
                            setProdDigitalUploading(false);
                          }
                        }}
                      />
                    </div>

                    {prodDigitalFiles.length > 0 && (
                      <div className="responsive-form-row">
                        <div>
                          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Download Limit (Optional)</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="Unlimited"
                            value={prodDownloadLimit}
                            onChange={e => setProdDownloadLimit(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                          <input type="checkbox" id="prodReadOnlineOnlyEdit" checked={prodReadOnlineOnly} onChange={e => setProdReadOnlineOnly(e.target.checked)} />
                          <label htmlFor="prodReadOnlineOnlyEdit" style={{ fontSize: 12.5, fontWeight: 600 }}>Read online only (no download link, e.g. for ebooks)</label>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Service Settings */}
              <div style={{
                background: 'rgba(129, 0, 209, 0.04)',
                border: '1.5px dashed rgba(129, 0, 209, 0.25)',
                borderRadius: 'var(--r-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <Toggle
                  checked={prodType === 'service'}
                  onChange={(next) => setProdType(next ? 'service' : 'product')}
                  label={
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block' }}>This is a Service</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Bookable services like appointments, sessions, or consultations.</span>
                    </div>
                  }
                />

                {prodType === 'service' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid rgba(129, 0, 209, 0.15)', paddingTop: 14 }} className="animate-fade-in">
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Duration (Optional)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 90"
                          value={prodDurationMinutes}
                          onChange={e => setProdDurationMinutes(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: 34 }}
                        />
                        <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>How long this service typically takes, in minutes.</p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Service Details (Optional)
                      </label>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>
                        Pick a few quick facts to show customers on this service&apos;s page{getSelectedPersonaPreset() ? ` — suggested for ${getSelectedPersonaPreset()?.name} stores` : ''}.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {getServiceFactPresets(selectedPersona).map(preset => {
                          const checked = prodServiceFacts.includes(preset.label);
                          return (
                            <Toggle
                              key={preset.label}
                              checked={checked}
                              onChange={(next) => {
                                if (next) {
                                  setProdServiceFacts(prev => [...prev, preset.label]);
                                } else {
                                  setProdServiceFacts(prev => prev.filter(f => f !== preset.label));
                                }
                              }}
                              label={<span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600 }}>{preset.label}</span>}
                            />
                          );
                        })}
                      </div>

                      {/* Custom facts the merchant typed in */}
                      {prodServiceFacts.filter(f => !getServiceFactPresets(selectedPersona).some(p => p.label === f)).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                          {prodServiceFacts.filter(f => !getServiceFactPresets(selectedPersona).some(p => p.label === f)).map(fact => (
                            <div key={fact} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--bg-2)', borderRadius: 'var(--r-sm)', padding: '8px 10px' }}>
                              <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600 }}>{fact}</span>
                              <button
                                type="button"
                                onClick={() => setProdServiceFacts(prev => prev.filter(f2 => f2 !== fact))}
                                style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}
                                title="Remove"
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <input
                          type="text"
                          placeholder="Write your own detail…"
                          value={prodCustomFact}
                          onChange={e => setProdCustomFact(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const text = prodCustomFact.trim();
                            if (!text) return;
                            if (prodServiceFacts.includes(text)) { setProdCustomFact(''); return; }
                            setProdServiceFacts(prev => [...prev, text]);
                            setProdCustomFact('');
                          }}
                          className="btn btn-secondary"
                          style={{ flexShrink: 0 }}
                        >Add</button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Mobile Service Fee (Optional)
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 2000"
                          value={prodMobileFee}
                          onChange={e => setProdMobileFee(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          placeholder='Label, e.g. "Bike Fee"'
                          value={prodMobileFeeLabel}
                          onChange={e => setProdMobileFeeLabel(e.target.value)}
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Extra charge added when a customer selects Mobile Session. Give it a name so they know what it covers (e.g. &ldquo;Bike Fee&rdquo;, &ldquo;Travel Fee&rdquo;).</p>
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
                    <div key={idx} className="fu-tile-img">
                      <img src={url} alt={`Product image ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => setProdImageUrls(prev => prev.filter((_, i) => i !== idx))}
                        className="fu-tile-img__remove"
                        title="Remove image"
                      >✕</button>
                    </div>
                  ))}
                  {prodImageUrls.length < 3 && (
                    <FileUpload
                      variant="tile"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      uploading={prodImageUploading}
                      disabled={prodImageUploading}
                      onFile={async (file) => {
                        try {
                          setProdImageUploading(true);
                          const fd = new FormData();
                          fd.append('image', file);
                          const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
                            method: 'POST',
                            credentials: 'include',
        headers: { 'Accept': 'application/json' },
                            body: fd
                          });
                          const json = await res.json();
                          if (res.ok && json.url) {
                            const isFirstImage = prodImageUrls.length === 0;
                            setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
                            toast.success('Image uploaded! 📸');
                            if (isFirstImage && isPro) {
                              handleAutoAnalyzeImage(file);
                            }
                          } else throw new Error(json.message || 'Upload failed');
                        } catch (err: any) {
                          toast.error(err.message || 'Image upload error');
                        } finally {
                          setProdImageUploading(false);
                        }
                      }}
                    />
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
                    {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Edit2 size={11} /> AI Auto-Write</>}
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
                {aiAnalyzing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, padding: '8px 12px', borderRadius: 'var(--r-sm)', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                    <Loader2 size={13} className="spinner" style={{ color: '#d97706' }} />
                    <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>AI is analyzing your photo and pre-filling product details...</span>
                  </div>
                )}
              </div>

              {/* Tags editor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Product Tags</label>
                  {isPro ? (
                    <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>AI-SUGGESTED</span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>Pro</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {prodTags.map((tag, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.35)', fontSize: 12, fontWeight: 600, color: '#d97706' }}>
                      {tag}
                      <button type="button" onClick={() => setProdTags(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#d97706', lineHeight: 1, display: 'flex', alignItems: 'center' }} aria-label={`Remove tag ${tag}`}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {prodTags.length === 0 && !aiAnalyzing && (
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic' }}>{isPro ? 'Upload a photo and AI will suggest tags automatically.' : 'Add up to 10 tags to help buyers find your product.'}</span>
                  )}
                </div>
                {prodTags.length < 10 && (
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter..."
                    value={prodTagInput}
                    onChange={e => setProdTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const t = prodTagInput.trim();
                        if (t && !prodTags.includes(t) && prodTags.length < 10) {
                          setProdTags(prev => [...prev, t]);
                          setProdTagInput('');
                        }
                      }
                    }}
                    className="input-field"
                    style={{ fontSize: 13 }}
                  />
                )}
              </div>

              {/* Cross-sell picker — optional, storefront falls back to same-category automatically */}
              {products.filter(p => p.id !== selectedProduct?.id).length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    "You May Also Like" Picks (Optional, up to 8)
                  </label>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8 }}>Leave unchecked and we'll auto-suggest same-category products instead.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
                    {products.filter(p => p.id !== selectedProduct?.id).map(p => {
                      const checked = prodRelatedProductIds.includes(p.id);
                      return (
                        <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, border: checked ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: checked ? 'var(--primary-light)' : 'var(--surface)', fontSize: 12, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              if (e.target.checked) {
                                if (prodRelatedProductIds.length >= 8) return;
                                setProdRelatedProductIds(prev => [...prev, p.id]);
                              } else {
                                setProdRelatedProductIds(prev => prev.filter(id => id !== p.id));
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          {p.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

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
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 680, padding: 28, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

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
                      { value: 'cancelled', label: 'Cancelled', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} /> },
                      { value: 'expired', label: 'Expired', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} /> }
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
                    const msg = `Hi ${selectedOrder.customer_name}! This is ${store?.store_name || 'frontstore merchant'} following up regarding your Order ${selectedOrder.order_number} totaling ${getCurrencySymbol(store?.currency_code)}${(parseFloat(selectedOrder.total_amount as string || '0') || 0).toLocaleString()}.`;
                    window.open(`https://wa.me/${(selectedOrder.customer_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
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

              {/* Logistics & Shipping Booking Box */}
              {selectedOrder.delivery_method === 'delivery' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={14} /> Logistics & Shipping
                  </h4>
                  {(selectedOrder as any).tracking_number ? (
                    <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span><strong>Shipping Provider:</strong> {(selectedOrder as any).shipping_provider}</span>
                        <span><strong>Tracking #:</strong> {(selectedOrder as any).tracking_number}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                        <span><strong>Current Milestone:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)' }}>{(selectedOrder as any).delivery_milestone}</span></span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleSimulateTransit(selectedOrder.id)}
                            disabled={isSimulatingTransit}
                            className="btn btn-outline clickable"
                            style={{ padding: '4px 8px', fontSize: 11, borderRadius: 'var(--r-sm)' }}
                          >
                            {isSimulatingTransit ? 'Updating...' : 'Simulate Transit'}
                          </button>
                          <a
                            href={`${apiUrl}/v1/orders/${selectedOrder.id}/shipping-label`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary clickable"
                            style={{ padding: '4px 8px', fontSize: 11, borderRadius: 'var(--r-sm)', textDecoration: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <ExternalLink size={10} /> Label
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>No active shipment booked yet for this order. Retrieve carrier rates to book.</p>
                      {shippingRates.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => fetchShippingRates(selectedOrder.id)}
                          disabled={loadingRates}
                          className="btn btn-outline clickable"
                          style={{ padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-md)', width: 'fit-content' }}
                        >
                          {loadingRates ? 'Loading Rates...' : 'Retrieve Shipping Rates'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 800 }}>Select Carrier Provider</label>
                            <select
                              value={selectedCarrier}
                              onChange={e => setSelectedCarrier(e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text)' }}
                            >
                              {shippingRates.map((r: any) => (
                                <option key={r.carrier} value={r.carrier}>
                                  {r.carrier} - {getCurrencySymbol(store?.currency_code)}{r.price} ({r.eta})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => handleBookShipping(selectedOrder.id)}
                              disabled={isBookingShipping}
                              className="btn btn-primary clickable"
                              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-md)' }}
                            >
                              {isBookingShipping ? 'Booking...' : 'Confirm & Book'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShippingRates([])}
                              className="btn btn-ghost clickable"
                              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-md)' }}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: Sleek customer receipt view ── */}
      {isReceiptOpen && receiptOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsReceiptOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 28, zIndex: 10 }}>

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

        .chart-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .chart-scroll-container::-webkit-scrollbar {
          display: none;
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

      <ConfirmDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        description={confirmationDialog.message}
        confirmLabel={confirmationDialog.confirmLabel}
        cancelLabel={confirmationDialog.cancelLabel}
        onConfirm={executeConfirmationDialog}
        onCancel={closeConfirmationDialog}
        loading={confirmationDialog.loading}
      />

      {/* ── NINA AI WIDGET ── */}
      <NinaWidget ninaAvatarUrl={store?.nina_avatar_url} />
    </div>
  );
}
