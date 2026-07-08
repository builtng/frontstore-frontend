'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Zap, Link, BarChart3, Globe, Palette, Search,
  Store, Star, ArrowRight, CheckCircle2, User, LogOut,
  Package, ShoppingBag, Settings, Share2, Copy, Plus, Tag,
  Trash2, Edit2, AlertCircle, Check, Loader2, Phone, Megaphone,
  DollarSign, Calendar, MapPin, Receipt, Menu, X, ArrowUpRight,
  TrendingUp, RefreshCw, Smartphone, Camera, Image as ImageIcon, ChevronDown,
  Download, FileText, ExternalLink, Shield, Rocket, BadgeCheck, BookOpen,
  ArrowUp, ArrowDown, Eye, EyeOff, Key, Clock, Send, Users, QrCode, Printer, Inbox, MessageSquare, Mail,
  Briefcase, CreditCard, Landmark, PenLine, Truck, Scale, Sparkles, LineChart, Archive
} from 'lucide-react';
import QRCodeSVG from 'react-qr-code';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import {
  TikTokIcon, TwitterXIcon, FacebookIcon, YouTubeIcon,
  LinkedInIcon, PinterestIcon, SnapchatIcon, InstagramIcon
} from '../../components/SocialIcons';
import ConfirmDialog from '../../components/ConfirmDialog';
import SearchableSelect from '../../components/SearchableSelect';
import FileUpload from '../../components/FileUpload';
import ThemeToggle from '../../components/ThemeToggle';
import Toggle from '../../components/Toggle';
import NinaWidget from '../../components/NinaWidget';
import { businessPersonas } from '../../utils/businessPersonas';
import { getServiceFactPresets } from '../../utils/serviceFactPresets';

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
  if (!code) return CURRENCY_SYMBOLS['USD'];
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
  plan?: string;
  has_password?: boolean;
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
  is_active?: boolean;
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
  type?: 'product' | 'service' | null;
  duration_minutes?: number | null;
  service_facts?: string[] | null;
  mobile_fee?: number | string | null;
  mobile_fee_label?: string | null;
  tags?: string[] | null;
  variants?: any[];
  track_inventory?: boolean;
  inventory_quantity?: number;
  low_stock_threshold?: number | null;
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
  };
}

interface BroadcastCampaign {
  id: string;
  audience: 'all' | 'repeat' | 'unpaid_whatsapp';
  message: string;
  status: 'queued' | 'sending' | 'completed' | 'failed';
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
}

type DashboardTab = 'overview' | 'orders' | 'products' | 'whatsapp' | 'share' | 'qr' | 'templates' | 'settings' | 'billing' | 'wallet' | 'reach' | 'reviews' | 'blog' | 'availability' | 'bookings' | 'invoices' | 'receipts' | 'inventory' | 'automations' | 'analytics' | 'team' | 'finance' | 'refunds' | 'inbox';

const DASHBOARD_TABS: DashboardTab[] = ['overview', 'orders', 'products', 'whatsapp', 'share', 'qr', 'templates', 'settings', 'billing', 'wallet', 'reach', 'reviews', 'blog', 'availability', 'bookings', 'invoices', 'receipts', 'inventory', 'automations', 'analytics', 'team', 'finance', 'refunds', 'inbox'];

const BROADCAST_AUDIENCES: Array<{ id: 'all' | 'repeat' | 'unpaid_whatsapp'; label: string; description: string }> = [
  { id: 'all', label: 'All customers', description: 'Everyone who has ever placed an order with your store.' },
  { id: 'repeat', label: 'Repeat buyers', description: 'Customers who have ordered from you more than once.' },
  { id: 'unpaid_whatsapp', label: 'Unpaid WhatsApp orders', description: 'Customers with pending WhatsApp orders awaiting payment — great for retargeting.' },
];

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
  const isPro = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';

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
      .replace(/[^a-z0-9_-]/g, '')
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

  const whatsappCooldownUntil = (!isPro && store?.whatsapp_phone_updated_at)
    ? new Date(new Date(store.whatsapp_phone_updated_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const whatsappOnCooldown = !!whatsappCooldownUntil && whatsappCooldownUntil.getTime() > Date.now();

  const [systemDomain, setSystemDomain] = useState('frontstore.app');
  const [domainTargetCname, setDomainTargetCname] = useState('');
  const [domainTargetIp, setDomainTargetIp] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.frontstore.app/api');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Dashboard Data State ---
  const [activeTab, setActiveTab] = useState<DashboardTab>(getDashboardTabFromUrl);
  
  // Coupon state variables
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

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
  const [withdrawalOtpSent, setWithdrawalOtpSent] = useState(false);
  const [withdrawalOtpCode, setWithdrawalOtpCode] = useState('');
  const [withdrawalOtpLoading, setWithdrawalOtpLoading] = useState(false);

  // Loading states
  const [dataLoading, setDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mobile navigation overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Billing Cycle state for Pro Subscription Plan
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [proMonthlyPrice, setProMonthlyPrice] = useState(1500);
  const [proYearlyPrice, setProYearlyPrice] = useState(15000);


  // --- Active Dialog/Modal States ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // --- Pro Merchant Features State Variables ---
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [invoiceItems, setInvoiceItems] = useState<Array<{ name: string, quantity: number, price: number }>>([
    { name: '', quantity: 1, price: 0 }
  ]);
  const [newInvoiceData, setNewInvoiceData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    due_date: '',
    notes: ''
  });

  // Receipts State
  const [receipts, setReceipts] = useState<any[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptSearch, setReceiptSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Inventory State
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustingVariant, setAdjustingVariant] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'restock' | 'manual'>('restock');
  const [adjustReason, setAdjustReason] = useState('');
  const [inventoryTab, setInventoryTab] = useState<'levels' | 'logs'>('levels');

  // Automation Settings State
  const [automationSetting, setAutomationSetting] = useState<any>({
    cart_recovery_enabled: false,
    order_confirmation_enabled: false,
    receipt_delivery_enabled: false,
    thank_you_enabled: false,
    review_request_enabled: false,
    win_back_enabled: false,
    win_back_days: 30,
    win_back_coupon_code: '',
    channels: ['email', 'whatsapp'],
  });
  const [automationLoading, setAutomationLoading] = useState(false);

  // Advanced Pro Analytics State
  const [proAnalytics, setProAnalytics] = useState<any>(null);
  const [proAnalyticsLoading, setProAnalyticsLoading] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // --- New Pro Features States (Team, Finance, Refunds, Inbox) ---
  const [teamData, setTeamData] = useState<{ owner: any, staff: any[] }>({ owner: null, staff: [] });
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamInvitations, setTeamInvitations] = useState<any[]>([]);
  const [teamRoles, setTeamRoles] = useState<any[]>([]);
  const [teamActivityLogs, setTeamActivityLogs] = useState<any[]>([]);
  const [teamLoginHistory, setTeamLoginHistory] = useState<any[]>([]);
  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [teamTab, setTeamTab] = useState<'members' | 'invites' | 'roles' | 'activity' | 'login_history'>('members');

  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'operations', description: '', incurred_at: new Date().toISOString().split('T')[0] });
  const [financeRange, setFinanceRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundStats, setRefundStats] = useState<any>(null);
  const [isRefundDetailsOpen, setIsRefundDetailsOpen] = useState(false);
  const [selectedRefundRequest, setSelectedRefundRequest] = useState<any>(null);
  const [refundMerchantNotes, setRefundMerchantNotes] = useState('');

  const [conversations, setConversations] = useState<any[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [activeConversationMessages, setActiveConversationMessages] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<any[]>([]);
  const [replyMessageText, setReplyMessageText] = useState('');
  const [isAddQuickReplyOpen, setIsAddQuickReplyOpen] = useState(false);
  const [newQuickReplyShortcut, setNewQuickReplyShortcut] = useState('');
  const [newQuickReplyMessage, setNewQuickReplyMessage] = useState('');
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

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

  // Dispute & Verification States & Handlers
  const [merchantDisputes, setMerchantDisputes] = useState<any[]>([]);
  const [activeDisputeChat, setActiveDisputeChat] = useState<any>(null);
  const [disputeReplyText, setDisputeReplyText] = useState('');
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [isRefundingDispute, setIsRefundingDispute] = useState(false);
  const [isSendingDisputeReply, setIsSendingDisputeReply] = useState(false);

  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isSelfieLivenessVerifying, setIsSelfieLivenessVerifying] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [businessCACName, setBusinessCACName] = useState('');
  const [businessCACNumber, setBusinessCACNumber] = useState('');
  const [isSubmittingBusinessCAC, setIsSubmittingBusinessCAC] = useState(false);

  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [loadingRates, setLoadingRates] = useState(false);
  const [isBookingShipping, setIsBookingShipping] = useState(false);
  const [isSimulatingTransit, setIsSimulatingTransit] = useState(false);

  const fetchMerchantDisputes = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/disputes`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        setMerchantDisputes(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load merchant disputes:", e);
    }
  };

  const fetchSingleDispute = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/public/disputes/${id}`);
      if (res.ok) {
        const json = await res.json();
        setActiveDisputeChat(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendDisputeReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDisputeChat || !disputeReplyText.trim()) return;
    try {
      setIsSendingDisputeReply(true);
      const res = await fetch(`${apiUrl}/v1/public/disputes/${activeDisputeChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: 'seller',
          sender_name: store?.store_name || 'Merchant',
          message: disputeReplyText,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send message.');
      setDisputeReplyText('');
      fetchSingleDispute(activeDisputeChat.id);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsSendingDisputeReply(false);
    }
  };

  const handleResolveDispute = async (id: string) => {
    try {
      setIsResolvingDispute(true);
      const res = await fetch(`${apiUrl}/v1/store/disputes/${id}/resolve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to resolve dispute.');
      toast.success('Dispute resolved. Escrow funds released to your withdrawable balance.');
      fetchSingleDispute(id);
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsResolvingDispute(false);
    }
  };

  const handleRefundDispute = async (id: string) => {
    try {
      setIsRefundingDispute(true);
      const res = await fetch(`${apiUrl}/v1/store/disputes/${id}/refund`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to refund dispute.');
      toast.success('Dispute refunded. Buyer has been credited.');
      fetchSingleDispute(id);
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsRefundingDispute(false);
    }
  };

  const handleSelfieSubmit = async () => {
    try {
      setIsSelfieLivenessVerifying(true);
      const res = await fetch(`${apiUrl}/v1/store/verify-selfie`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Verification failed.');
      toast.success('Selfie & liveness check completed successfully!');
      setIsSelfieModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Selfie verification failed.');
    } finally {
      setIsSelfieLivenessVerifying(false);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingBusinessCAC(true);
      const res = await fetch(`${apiUrl}/v1/store/verify-business`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_name: businessCACName,
          cac_number: businessCACNumber
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to verify business.');
      toast.success('Business info verified! Trust score updated.');
      setIsBusinessModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Business verification failed.');
    } finally {
      setIsSubmittingBusinessCAC(false);
    }
  };

  const fetchShippingRates = async (orderId: string) => {
    try {
      setLoadingRates(true);
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/shipping-rates`, {
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

  const getSelectedPersonaPreset = () => businessPersonas.find(item => item.id === selectedPersona);

  const businessPersonaOptions = businessPersonas.map(persona => ({
    value: persona.id,
    label: persona.name,
    sublabel: `${persona.persona} · ${persona.templateName} · ${persona.summary}`,
  }));

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
  const [prodTags, setProdTags] = useState<string[]>([]);
  const [prodTagInput, setProdTagInput] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [productPublishing, setProductPublishing] = useState(false);
  // Digital product states
  const [prodIsDigital, setProdIsDigital] = useState(false);
  const [prodDigitalFileUrl, setProdDigitalFileUrl] = useState('');
  const [prodDigitalLink, setProdDigitalLink] = useState('');
  const [prodDigitalUploading, setProdDigitalUploading] = useState(false);
  // Service product states
  const [prodType, setProdType] = useState<'product' | 'service'>('product');
  const [prodDurationMinutes, setProdDurationMinutes] = useState('');
  const [prodServiceFacts, setProdServiceFacts] = useState<string[]>([]);
  const [prodMobileFee, setProdMobileFee] = useState('');
  const [prodMobileFeeLabel, setProdMobileFeeLabel] = useState('');
  const [prodCustomFact, setProdCustomFact] = useState('');

  // Settings Form
  const [setStoreUsername, setSetStoreUsername] = useState('');
  const [setStoreName, setSetStoreName] = useState('');
  const [setStoreBio, setSetStoreBio] = useState('');
  const [setStoreLocation, setSetStoreLocation] = useState('');
  const [setStoreSince, setSetStoreSince] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [reviewsIntroText, setReviewsIntroText] = useState('');
  const [faqHelpText, setFaqHelpText] = useState('');
  const [aboutIntroText, setAboutIntroText] = useState('');
  const [portfolioIntroText, setPortfolioIntroText] = useState('');
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
  const [ninaAvatarUrl, setNinaAvatarUrl] = useState<string | null>(null);
  const [ninaAvatarUploading, setNinaAvatarUploading] = useState(false);
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
  const [setCurrency, setSetCurrency] = useState('USD');
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
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'design' | 'social' | 'payment' | 'security'>('profile');
  const [customLinks, setCustomLinks] = useState<StoreLink[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#25D366');
  const [selectedTemplate, setSelectedTemplate] = useState('luxe-market');
  const [selectedPersona, setSelectedPersona] = useState('');
  

  // Storefront custom sections and reply time
  const [storefrontSections, setStorefrontSections] = useState<string[]>(['reviews', 'replies_approximation', 'products', 'services', 'portfolio', 'about', 'faq', 'contact', 'blog']);
  const [replyTimeMinutes, setReplyTimeMinutes] = useState<number | ''>('');
  const [ninaChatQrEnabled, setNinaChatQrEnabled] = useState(false);

  // Availability / Booking settings
  const DEFAULT_WORKING_HOURS: Record<string, { open: string; close: string; enabled: boolean }> = {
    monday:    { open: '09:00', close: '17:00', enabled: true },
    tuesday:   { open: '09:00', close: '17:00', enabled: true },
    wednesday: { open: '09:00', close: '17:00', enabled: true },
    thursday:  { open: '09:00', close: '17:00', enabled: true },
    friday:    { open: '09:00', close: '17:00', enabled: true },
    saturday:  { open: '10:00', close: '14:00', enabled: false },
    sunday:    { open: '10:00', close: '14:00', enabled: false },
  };
  const DAYS_OF_WEEK = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const DAY_LABELS: Record<string,string> = { monday:'Mon',tuesday:'Tue',wednesday:'Wed',thursday:'Thu',friday:'Fri',saturday:'Sat',sunday:'Sun' };
  const [workingHours, setWorkingHours] = useState<Record<string, { open: string; close: string; enabled: boolean }>>(DEFAULT_WORKING_HOURS);
  const [bookingCapacityPerDay, setBookingCapacityPerDay] = useState<number | ''>(10);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  // Bookings list
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingActionId, setBookingActionId] = useState<string | null>(null);

  // Blog posts management states
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogBody, setBlogBody] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogImageMode, setBlogImageMode] = useState<'url' | 'upload'>('url');
  const [blogImageUploading, setBlogImageUploading] = useState(false);
  const [sendingReceiptId, setSendingReceiptId] = useState<string | null>(null);

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
  // MoMo Agent
  const [momoAgentNumber, setMomoAgentNumber] = useState('');
  const [momoAgentName, setMomoAgentName] = useState('');
  const [momoAgentNetwork, setMomoAgentNetwork] = useState('mtn');
  const [momoAgentEnabled, setMomoAgentEnabled] = useState(false);
  // Shipping Settings
  const [shippingType, setShippingType] = useState('customer_pays');
  const [shippingFlatFee, setShippingFlatFee] = useState('');
  const [shippingFreeThreshold, setShippingFreeThreshold] = useState('');
  const [shippingHandlingFee, setShippingHandlingFee] = useState('');
  const [shippingCustomRules, setShippingCustomRules] = useState<{ min_subtotal: string; fee: string }[]>([]);
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
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isLoadingStripeDashboard, setIsLoadingStripeDashboard] = useState(false);

  // --- AI Command Bar State ---
  const [aiCommand, setAiCommand] = useState('');
  const [aiResponseBubble, setAiResponseBubble] = useState<string | null>(null);

  const [waOrdersInternal, setWaOrdersInternal] = useState<Order[]>([]);
  const setWaOrders = wrapSetter(setWaOrdersInternal, normalizeOrders);
  const waOrders = waOrdersInternal;
  const [waLoading, setWaLoading] = useState(false);

  // --- Broadcast Messages (Pro automated WhatsApp campaigns) ---
  const [broadcastCampaigns, setBroadcastCampaigns] = useState<BroadcastCampaign[]>([]);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'repeat' | 'unpaid_whatsapp'>('all');
  const [broadcastAudiencePreview, setBroadcastAudiencePreview] = useState<{ audience: string; recipients_count: number } | null>(null);
  const [broadcastPreviewLoading, setBroadcastPreviewLoading] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
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
            if (response.status === 401) {
              triggerRedirect('Unauthorized access - token invalid or expired');
              return false;
            } else if (response.status === 404) {
              triggerRedirect('Account not found - account may have been deleted');
              return false;
            } else {
              // Transient/non-auth error (403 permission gate, 429, 5xx) - don't log the user out
              console.warn(`Account verification returned status ${response.status} - proceeding without logout`);
              return true;
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
              setSetStoreUsername(parsedStore.username || '');
              setSetStoreName(parsedStore.store_name || '');
              setSetStoreBio(parsedStore.store_bio || '');
              if (parsedStore.working_hours && typeof parsedStore.working_hours === 'object') {
                setWorkingHours({ ...DEFAULT_WORKING_HOURS, ...parsedStore.working_hours });
              }
              if (parsedStore.booking_capacity_per_day != null) {
                setBookingCapacityPerDay(Number(parsedStore.booking_capacity_per_day));
              }
              setSetStoreLocation(parsedStore.location || '');
              setSetStoreSince(parsedStore.since || '');
              setDeliveryInfo(parsedStore.delivery_info || '');
              setReturnPolicy(parsedStore.return_policy || '');
              setReviewsIntroText(parsedStore.reviews_intro_text || '');
              setFaqHelpText(parsedStore.faq_help_text || '');
              setAboutIntroText(parsedStore.about_intro_text || '');
              setPortfolioIntroText(parsedStore.portfolio_intro_text || '');
              setPolicyBookings(parsedStore.policy_bookings || '');
              setPolicyProducts(parsedStore.policy_products || '');
              setPolicyRefunds(parsedStore.policy_refunds || '');
              setAnnouncementTitle(parsedStore.announcement_title || '');
              setAnnouncementBody(parsedStore.announcement_body || '');
              setAnnouncementCtaLabel(parsedStore.announcement_cta_label || '');
              setAnnouncementCtaPage(parsedStore.announcement_cta_page || '');
              setSetBannerUrl(parsedStore.banner_url || '');
              const parsedPhone = parsePhoneNumber(parsedStore.whatsapp_phone || '');
              setSelectedCountry(parsedPhone.country);
              setLocalWhatsapp(parsedPhone.local);
              setSetInstagram(parsedStore.instagram_handle || '');
              setSetTiktok(parsedStore.tiktok_handle || '');
              setSetTwitter(parsedStore.twitter_handle || '');
              setSetCurrency(parsedStore.currency_code || 'USD');
              setSetStoreCountryCode(parsedStore.country_code || '');
              setSetPaymentProvider(parsedStore.payment_provider || '');
              setAvailableProviders(parsedStore.available_payment_providers || []);
              setPaymentBankName(parsedStore.bank_name || '');
              setPaymentBankCode(parsedStore.paystack_bank_code || '');
              setPaymentAccountNumber(parsedStore.bank_account_number || '');
              setPaymentAccountName(parsedStore.bank_account_name || '');
              setPaymentInstructions(parsedStore.payment_instructions || '');
              setMomoAgentNumber(parsedStore.momo_agent_number || '');
              setMomoAgentName(parsedStore.momo_agent_name || '');
              setMomoAgentNetwork(parsedStore.momo_agent_network || 'mtn');
              setMomoAgentEnabled(!!parsedStore.momo_agent_enabled);
              setShippingType(parsedStore.shipping_type || 'customer_pays');
              setShippingFlatFee(parsedStore.shipping_flat_fee != null ? String(parsedStore.shipping_flat_fee) : '');
              setShippingFreeThreshold(parsedStore.shipping_free_threshold != null ? String(parsedStore.shipping_free_threshold) : '');
              setShippingHandlingFee(parsedStore.shipping_handling_fee != null ? String(parsedStore.shipping_handling_fee) : '');
              setShippingCustomRules(
                Array.isArray(parsedStore.shipping_custom_rules)
                  ? parsedStore.shipping_custom_rules.map((r: any) => ({ min_subtotal: String(r.min_subtotal ?? ''), fee: String(r.fee ?? '') }))
                  : []
              );
              setAccountVerified(!!parsedStore.bank_account_verified);
              setNameMatchOk(parsedStore.bank_account_verified ? true : null);
              setLogoUrl(parsedStore.logo_url || null);
              setCustomLinks(parsedStore.custom_links || []);
              setPrimaryColor(parsedStore.primary_color || '#25D366');
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
        if (json?.data?.domain_target_cname) setDomainTargetCname(json.data.domain_target_cname);
        if (json?.data?.domain_target_ip) setDomainTargetIp(json.data.domain_target_ip);
      })
      .catch(err => console.error('Failed to fetch subscription pricing:', err));
  }, [apiUrl]);

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
  }, [apiUrl]);

  // Fetch the canonical country list for the Store Country selector
  useEffect(() => {
    fetch(`${apiUrl}/v1/meta/countries`)
      .then(res => res.json())
      .then(json => { if (json.data) setMetaCountries(json.data); })
      .catch(() => {});
  }, [apiUrl]);

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
      setSetCurrency(match.default_currency || detectedCurrencyCode || 'USD');
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
  }, [setStoreCountryCode, apiUrl]);

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

  // Auto-refresh Stripe Connect status when merchant returns from onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeReturn = params.get('stripe_return');
    const stripeRefresh = params.get('stripe_refresh');
    if (!stripeReturn && !stripeRefresh) return;

    const cleanUrl = `${window.location.pathname}?page=settings`;
    window.history.replaceState({ page: 'settings' }, '', cleanUrl);
    setActiveTab('settings');

    const token = localStorage.getItem('token');
    if (!token) return;

    const refreshStripeStatus = async () => {
      try {
        const url = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
        const res = await fetch(`${url}/v1/payments/stripe/return`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

      const [statsRes, productsRes, ordersRes, categoriesRes, storeRes, reviewsRes, blogRes] = await Promise.all([
        fetch(`${apiUrl}/v1/orders/stats`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/products`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/orders`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/categories`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/store`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/store/reviews`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/blog`, { headers: getAuthHeaders() })
      ]);

      const statsJson = await statsRes.json();
      const productsJson = await productsRes.json();
      const ordersJson = await ordersRes.json();
      const categoriesJson = await categoriesRes.json();
      const storeJson = await storeRes.json();
      const reviewsJson = await reviewsRes.json();
      const blogJson = await blogRes.json();

      if (statsRes.ok) setStats(statsJson.data);
      if (productsRes.ok) setProducts(productsJson.data?.data || productsJson.data || []);
      if (ordersRes.ok) setOrders(ordersJson.data?.data || ordersJson.data || []);
      if (categoriesRes.ok) setCategories(categoriesJson.data || []);
      if (reviewsRes.ok) setReviews(reviewsJson.data || []);
      if (blogRes.ok) setBlogPosts(blogJson.data || []);

      if (storeRes.ok && storeJson.data) {
        const liveStore = storeJson.data;
        setStore(liveStore);
        localStorage.setItem('store', JSON.stringify(liveStore));
        if (storeJson.system_domain) {
          setSystemDomain(storeJson.system_domain);
          localStorage.setItem('system_domain', storeJson.system_domain);
        }
        setSetStoreUsername(liveStore.username || '');
        setSetStoreName(liveStore.store_name || '');
        setSetStoreBio(liveStore.store_bio || '');
        setSetStoreLocation(liveStore.location || '');
        setSetStoreSince(liveStore.since || '');
        setDeliveryInfo(liveStore.delivery_info || '');
        setShippingType(liveStore.shipping_type || 'customer_pays');
        setShippingFlatFee(liveStore.shipping_flat_fee != null ? String(liveStore.shipping_flat_fee) : '');
        setShippingFreeThreshold(liveStore.shipping_free_threshold != null ? String(liveStore.shipping_free_threshold) : '');
        setShippingHandlingFee(liveStore.shipping_handling_fee != null ? String(liveStore.shipping_handling_fee) : '');
        setShippingCustomRules(
          Array.isArray(liveStore.shipping_custom_rules)
            ? liveStore.shipping_custom_rules.map((r: any) => ({ min_subtotal: String(r.min_subtotal ?? ''), fee: String(r.fee ?? '') }))
            : []
        );
        if (liveStore.working_hours && typeof liveStore.working_hours === 'object') {
          setWorkingHours({ ...DEFAULT_WORKING_HOURS, ...liveStore.working_hours });
        }
        if (liveStore.booking_capacity_per_day != null) {
          setBookingCapacityPerDay(Number(liveStore.booking_capacity_per_day));
        }
        setReturnPolicy(liveStore.return_policy || '');
        setReviewsIntroText(liveStore.reviews_intro_text || '');
        setFaqHelpText(liveStore.faq_help_text || '');
        setAboutIntroText(liveStore.about_intro_text || '');
        setPortfolioIntroText(liveStore.portfolio_intro_text || '');
        setPolicyBookings(liveStore.policy_bookings || '');
        setPolicyProducts(liveStore.policy_products || '');
        setPolicyRefunds(liveStore.policy_refunds || '');
        setAnnouncementTitle(liveStore.announcement_title || '');
        setAnnouncementBody(liveStore.announcement_body || '');
        setAnnouncementCtaLabel(liveStore.announcement_cta_label || '');
        setAnnouncementCtaPage(liveStore.announcement_cta_page || '');
        setSetBannerUrl(liveStore.banner_url || '');
        const parsedPhone = parsePhoneNumber(liveStore.whatsapp_phone || '');
        setSelectedCountry(parsedPhone.country);
        setLocalWhatsapp(parsedPhone.local);
        setSetInstagram(liveStore.instagram_handle || '');
        setSetTiktok(liveStore.tiktok_handle || '');
        setSetTwitter(liveStore.twitter_handle || '');
        setSetCurrency(liveStore.currency_code || 'USD');
        setSetStoreCountryCode(liveStore.country_code || '');
        setSetPaymentProvider(liveStore.payment_provider || '');
        setAvailableProviders(liveStore.available_payment_providers || []);
        setPaymentBankName(liveStore.bank_name || '');
        setPaymentBankCode(liveStore.paystack_bank_code || '');
        setPaymentAccountNumber(liveStore.bank_account_number || '');
        setPaymentAccountName(liveStore.bank_account_name || '');
        setPaymentInstructions(liveStore.payment_instructions || '');
        setAccountVerified(!!liveStore.bank_account_verified);
        setNameMatchOk(liveStore.bank_account_verified ? true : null);
        setLogoUrl(liveStore.logo_url || null);
        setNinaAvatarUrl(liveStore.nina_avatar_url || null);
        setCustomLinks(liveStore.custom_links || []);
        setPrimaryColor(liveStore.primary_color || '#25D366');
        setSelectedTemplate(liveStore.store_template || 'luxe-market');
        setSelectedPersona(liveStore.business_persona || '');
        setCatalogLabel(liveStore.catalog_label || 'product');
        setCategoryLabel(liveStore.category_label || 'collection');
        setTemplateHighlightLabel(liveStore.template_highlight_label || '');
        setProductSectionEyebrow(liveStore.product_section_eyebrow || 'Catalog');
        setProductSectionTitle(liveStore.product_section_title || '');
        setFeaturedCarouselEnabled(liveStore.featured_carousel_enabled !== false);
        setFeaturedCarouselEyebrow(liveStore.featured_carousel_eyebrow || 'Featured now');
        setFeaturedCarouselTitle(liveStore.featured_carousel_title || 'Fresh picks from the catalog');
        setFeaturedProductIds((liveStore.featured_product_ids || []).slice(0, 5));
        setStorefrontSections(liveStore.storefront_sections || ['reviews', 'replies_approximation', 'products', 'services', 'portfolio', 'about', 'faq', 'contact', 'blog']);
        setReplyTimeMinutes(liveStore.reply_time_minutes !== null && liveStore.reply_time_minutes !== undefined ? liveStore.reply_time_minutes : '');
        setNinaChatQrEnabled(!!liveStore.nina_chat_qr_enabled);
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
  const [verificationIdNumber, setVerificationIdNumber] = useState('');
  const [verificationUploading, setVerificationUploading] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationRedirectUrl, setVerificationRedirectUrl] = useState<string | null>(null);

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
      // Also fetch disputes for the Disputes Center widget
      await fetchMerchantDisputes();
    } catch (e) {
      toast.error('Failed to load wallet information.');
    } finally {
      setWalletLoading(false);
    }
  };

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

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    if (!blogCategory.trim()) {
      toast.error('Please enter a category.');
      return;
    }

    try {
      setBlogSubmitting(true);
      const paragraphs = blogBody.split('\n').filter(p => p.trim() !== '').map(p => ({ p: p.trim() }));
      
      const payload = {
        title: blogTitle.trim(),
        category: blogCategory.trim(),
        read_time: blogReadTime.trim() || '5 min read',
        excerpt: blogExcerpt.trim() || blogBody.substring(0, 150) + '...',
        body: paragraphs,
        image_url: blogImageUrl.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        published_at: new Date().toISOString()
      };

      const res = await fetch(`${apiUrl}/v1/blog`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to create blog post.');
      }

      toast.success('Blog post created successfully!');
      setBlogPosts(prev => [json.data, ...prev]);
      
      // Reset form states
      setBlogTitle('');
      setBlogCategory('');
      setBlogReadTime('');
      setBlogExcerpt('');
      setBlogBody('');
      setBlogImageUrl('');
      setShowBlogForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleUploadBlogImage = async (file: File) => {
    setBlogImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${apiUrl}/v1/blog/upload-image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed.');
      setBlogImageUrl(json.url);
      toast.success('Image uploaded successfully! 📸');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setBlogImageUploading(false);
    }
  };

  const handleSendReceipt = async (orderId: string, phone: string) => {
    setSendingReceiptId(orderId);
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/send-receipt`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send receipt.');
      toast.success('📄 Receipt PDF sent to customer via WhatsApp!');
      if (json.pdf_url) {
        window.open(json.pdf_url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not send receipt.');
    } finally {
      setSendingReceiptId(null);
    }
  };

  const handleDeleteBlogPost = (id: number | string) => {
    openConfirmationDialog(
      'Delete Blog Post',
      'Are you sure you want to delete this blog post? This action cannot be undone.',
      async () => {
        try {
          const res = await fetch(`${apiUrl}/v1/blog/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.message || 'Failed to delete blog post.');
          }
          toast.success('Blog post deleted successfully.');
          setBlogPosts(prev => prev.filter(p => p.id !== id));
          closeConfirmationDialog();
        } catch (err: any) {
          toast.error(err.message || 'Something went wrong.');
        }
      },
      'Delete',
      'Cancel'
    );
  };


  useEffect(() => {
    if (isAuthenticated && activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchInvoicesData = async () => {
    if (!isPro) return;
    try {
      setInvoicesLoading(true);
      const res = await fetch(`${apiUrl}/v1/invoices`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setInvoices(json.data || []);
      }
    } catch (e) {
      toast.error("Failed to load invoices.");
    } finally {
      setInvoicesLoading(false);
    }
  };

  const fetchReceiptsData = async () => {
    if (!isPro) return;
    try {
      setReceiptsLoading(true);
      const res = await fetch(`${apiUrl}/v1/receipts`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setReceipts(json.data || []);
      }
    } catch (e) {
      toast.error("Failed to load receipts.");
    } finally {
      setReceiptsLoading(false);
    }
  };

  const fetchInventoryLogsData = async () => {
    if (!isPro) return;
    try {
      setInventoryLoading(true);
      const res = await fetch(`${apiUrl}/v1/inventory/logs`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setInventoryLogs(json.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to load inventory adjustment history.");
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchAutomationSettingsData = async () => {
    if (!isPro) return;
    try {
      setAutomationLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/automations`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setAutomationSetting(json.data);
      }
    } catch (e) {
      toast.error("Failed to load growth automation settings.");
    } finally {
      setAutomationLoading(false);
    }
  };

  const fetchProAnalyticsData = async () => {
    if (!isPro) return;
    try {
      setProAnalyticsLoading(true);
      const res = await fetch(`${apiUrl}/v1/analytics/pro`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setProAnalytics(json.data);
      }
    } catch (e) {
      toast.error("Failed to load advanced analytics.");
    } finally {
      setProAnalyticsLoading(false);
    }
  };

  const fetchTeamData = async () => {
    if (!isPro) return;
    try {
      setTeamLoading(true);
      const headers = getAuthHeaders();
      const [resMembers, resInvites, resRoles, resLogs, resLogin] = await Promise.all([
        fetch(`${apiUrl}/v1/team/members`, { headers }),
        fetch(`${apiUrl}/v1/team/invitations`, { headers }),
        fetch(`${apiUrl}/v1/team/roles`, { headers }),
        fetch(`${apiUrl}/v1/team/activity-logs`, { headers }),
        fetch(`${apiUrl}/v1/team/login-history`, { headers })
      ]);
      if (resMembers.ok) setTeamData((await resMembers.json()).data);
      if (resInvites.ok) setTeamInvitations((await resInvites.json()).data);
      if (resRoles.ok) setTeamRoles((await resRoles.json()).data);
      if (resLogs.ok) setTeamActivityLogs((await resLogs.json()).data.data || []);
      if (resLogin.ok) setTeamLoginHistory((await resLogin.json()).data.data || []);
    } catch (e) {
      toast.error("Failed to load team data.");
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchFinanceData = async () => {
    if (!isPro) return;
    try {
      setFinanceLoading(true);
      const headers = getAuthHeaders();
      const [resSummary, resExpenses] = await Promise.all([
        fetch(`${apiUrl}/v1/finance/summary?range=${financeRange}`, { headers }),
        fetch(`${apiUrl}/v1/finance/expenses`, { headers })
      ]);
      if (resSummary.ok) setFinanceSummary((await resSummary.json()).data);
      if (resExpenses.ok) setExpenses((await resExpenses.json()).data.data || []);
    } catch (e) {
      toast.error("Failed to load financial records.");
    } finally {
      setFinanceLoading(false);
    }
  };

  const fetchRefundsData = async () => {
    if (!isPro) return;
    try {
      setRefundLoading(true);
      const headers = getAuthHeaders();
      const [resList, resStats] = await Promise.all([
        fetch(`${apiUrl}/v1/refunds`, { headers }),
        fetch(`${apiUrl}/v1/refunds/stats`, { headers })
      ]);
      if (resList.ok) setRefundRequests((await resList.json()).data.data || []);
      if (resStats.ok) setRefundStats((await resStats.json()).data);
    } catch (e) {
      toast.error("Failed to load refunds data.");
    } finally {
      setRefundLoading(false);
    }
  };

  const fetchInboxData = async () => {
    if (!isPro) return;
    try {
      setInboxLoading(true);
      const headers = getAuthHeaders();
      const [resConvs, resReplies, resTemplates] = await Promise.all([
        fetch(`${apiUrl}/v1/inbox/conversations`, { headers }),
        fetch(`${apiUrl}/v1/inbox/quick-replies`, { headers }),
        fetch(`${apiUrl}/v1/inbox/templates`, { headers })
      ]);
      if (resConvs.ok) setConversations((await resConvs.json()).data.data || []);
      if (resReplies.ok) setQuickReplies((await resReplies.json()).data);
      if (resTemplates.ok) setMessageTemplates((await resTemplates.json()).data);
    } catch (e) {
      toast.error("Failed to load unified inbox.");
    } finally {
      setInboxLoading(false);
    }
  };

  const fetchConversationMessages = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/inbox/conversations/${id}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok) {
        setActiveConversation(json.data.conversation);
        setActiveConversationMessages(json.data.messages);
      }
    } catch (e) {
      toast.error("Failed to load messages.");
    }
  };
  const downloadAnalyticsReport = async (type: 'weekly' | 'monthly') => {
    try {
      toast.loading("Generating report...");
      const res = await fetch(`${apiUrl}/v1/analytics/reports/${type}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.dismiss();
      toast.success("Report downloaded successfully!");
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to download statement report.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'invoices') fetchInvoicesData();
      if (activeTab === 'receipts') fetchReceiptsData();
      if (activeTab === 'inventory') fetchInventoryLogsData();
      if (activeTab === 'automations') fetchAutomationSettingsData();
      if (activeTab === 'analytics') fetchProAnalyticsData();
      if (activeTab === 'team') fetchTeamData();
      if (activeTab === 'finance') fetchFinanceData();
      if (activeTab === 'refunds') fetchRefundsData();
      if (activeTab === 'inbox') fetchInboxData();
    }
  }, [isAuthenticated, activeTab, isPro, financeRange]);

  const handleSendWithdrawalOtp = async () => {
    try {
      setWithdrawalOtpLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw/send-otp`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (res.ok) {
        setWithdrawalOtpSent(true);
        toast.success(json.message || 'Verification code sent to your WhatsApp number.');
      } else {
        toast.error(json.message || 'Failed to send verification code.');
      }
    } catch {
      toast.error('Network error sending verification code.');
    } finally {
      setWithdrawalOtpLoading(false);
    }
  };

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

    if (!withdrawalOtpSent) {
      await handleSendWithdrawalOtp();
      return;
    }

    if (!withdrawalOtpCode || withdrawalOtpCode.trim().length !== 6) {
      toast.warning('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setWithdrawalSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: amt, otp_code: withdrawalOtpCode.trim() })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Withdrawal request submitted.');
        setWithdrawalAmount('');
        setWithdrawalOtpCode('');
        setWithdrawalOtpSent(false);
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
    if (!verificationDocUrl && !verificationIdNumber) {
      toast.warning('Please enter an ID number or upload a document.');
      return;
    }
    try {
      setIsSubmittingVerification(true);
      setVerificationRedirectUrl(null);
      const res = await fetch(`${apiUrl}/v1/store/verify-request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          document_type: verificationDocType,
          document_url: verificationDocUrl || undefined,
          id_number: verificationIdNumber || undefined,
        })
      });
      const json = await res.json();
      if (res.ok) {
        const data = json.data ?? {};
        if (data.auto_approved) {
          toast.success('Identity verified automatically. Your badge is now active!');
        } else if (data.redirect_url) {
          setVerificationRedirectUrl(data.redirect_url);
          toast.success('Open the link below to complete your identity verification.');
        } else {
          toast.success(json.message || 'Verification request submitted.');
        }
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
    if (!isPro) return; // Pro-only feature
    try {
      setAiAnalyzing(true);
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${apiUrl}/v1/ai/generate-description`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          image_base64: base64,
          image_mime: file.type,
        })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const data = json.data;
        if (data.name) setProdName(data.name);
        if (data.description) setProdDesc(data.description);
        if (data.recommended_price) setProdPrice(String(data.recommended_price));
        if (Array.isArray(data.tags) && data.tags.length > 0) setProdTags(data.tags.slice(0, 10));
        toast.success('AI analyzed your photo! Fields pre-filled ✨');
      }
    } catch (err) {
      // Fail silently — the image was already uploaded successfully
      console.warn('AI image analysis failed (non-blocking):', err);
    } finally {
      setAiAnalyzing(false);
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
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
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
    setProdType(product.type === 'service' ? 'service' : 'product');
    setProdDurationMinutes(product.duration_minutes ? String(product.duration_minutes) : '');
    setProdServiceFacts(Array.isArray(product.service_facts) ? product.service_facts : []);
    setProdMobileFee(product.mobile_fee != null ? String(product.mobile_fee) : '');
    setProdMobileFeeLabel(product.mobile_fee_label || '');
    setProdCustomFact('');
    setProdTags(Array.isArray(product.tags) ? product.tags : []);
    setProdTagInput('');
    setAiAnalyzing(false);
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
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
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

  const handleDeleteProduct = (productId: string) => {
    openConfirmationDialog(
      'Delete product',
      'Are you sure you want to delete this product? This action is permanent.',
      async () => {
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

  // --- Broadcast Messages: load campaign history ---
  const loadBroadcastCampaigns = async () => {
    if (!token) return;
    setBroadcastLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/broadcasts`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok && json.data) {
        setBroadcastCampaigns(json.data);
      }
    } catch (e) {
      console.error('Failed to load broadcast campaigns:', e);
    } finally {
      setBroadcastLoading(false);
    }
  };

  // --- Broadcast Messages: preview audience size for the selected segment ---
  const loadBroadcastAudiencePreview = async (audience: 'all' | 'repeat' | 'unpaid_whatsapp') => {
    if (!token) return;
    setBroadcastPreviewLoading(true);
    setBroadcastAudiencePreview(null);
    try {
      const res = await fetch(`${apiUrl}/v1/broadcasts/audience-preview?audience=${audience}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.ok && json.data) {
        setBroadcastAudiencePreview(json.data);
      }
    } catch (e) {
      console.error('Failed to load audience preview:', e);
    } finally {
      setBroadcastPreviewLoading(false);
    }
  };

  // --- Broadcast Messages: queue a campaign for sending ---
  const handleSendBroadcast = async () => {
    if (!token || !broadcastMessage.trim()) return;
    setBroadcastSending(true);
    try {
      const res = await fetch(`${apiUrl}/v1/broadcasts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ audience: broadcastAudience, message: broadcastMessage.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Broadcast campaign queued for sending.');
        setBroadcastMessage('');
        setBroadcastAudiencePreview(null);
        loadBroadcastCampaigns();
      } else {
        toast.error(json.message || 'Could not queue this broadcast.');
      }
    } catch {
      toast.error('Could not queue this broadcast. Please try again.');
    } finally {
      setBroadcastSending(false);
    }
  };

  const confirmSendBroadcast = () => {
    const recipients = broadcastAudiencePreview?.recipients_count;
    openConfirmationDialog(
      'Send broadcast campaign?',
      `This message will be sent via WhatsApp to ${recipients ?? 'all matching'} customer${recipients === 1 ? '' : 's'} in the "${BROADCAST_AUDIENCES.find(a => a.id === broadcastAudience)?.label}" segment. This cannot be undone.`,
      async () => { await handleSendBroadcast(); },
      'Send Broadcast',
      'Cancel'
    );
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
      const isPro = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';
      const personaPreset = getSelectedPersonaPreset();
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: setStoreUsername,
          store_name: setStoreName,
          store_bio: setStoreBio,
          location: setStoreLocation || null,
          since: setStoreSince || null,
          banner_url: setBannerUrl || null,
          instagram_handle: setInstagram,
          tiktok_handle: setTiktok,
          twitter_handle: setTwitter,
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
          portfolio_intro_text: portfolioIntroText || null,
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
          nina_avatar_url: ninaAvatarUrl,
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
        setSetStoreSince(json.data.since || '');
        setDeliveryInfo(json.data.delivery_info || '');
        setReturnPolicy(json.data.return_policy || '');
        setReviewsIntroText(json.data.reviews_intro_text || '');
        setFaqHelpText(json.data.faq_help_text || '');
        setAboutIntroText(json.data.about_intro_text || '');
        setPortfolioIntroText(json.data.portfolio_intro_text || '');
        setPolicyBookings(json.data.policy_bookings || '');
        setPolicyProducts(json.data.policy_products || '');
        setPolicyRefunds(json.data.policy_refunds || '');
        setAnnouncementTitle(json.data.announcement_title || '');
        setAnnouncementBody(json.data.announcement_body || '');
        setAnnouncementCtaLabel(json.data.announcement_cta_label || '');
        setAnnouncementCtaPage(json.data.announcement_cta_page || '');
        setSetBannerUrl(json.data.banner_url || '');
        setLogoUrl(json.data.logo_url || null);
        setNinaAvatarUrl(json.data.nina_avatar_url || null);
        const parsedPhone = parsePhoneNumber(json.data.whatsapp_phone || '');
        setSelectedCountry(parsedPhone.country);
        setLocalWhatsapp(parsedPhone.local);
        setSetInstagram(json.data.instagram_handle || '');
        setSetTiktok(json.data.tiktok_handle || '');
        setSetTwitter(json.data.twitter_handle || '');
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
        setTemplateHighlightLabel(json.data.template_highlight_label || '');
        setProductSectionEyebrow(json.data.product_section_eyebrow || 'Catalog');
        setProductSectionTitle(json.data.product_section_title || '');
        setFeaturedCarouselEnabled(json.data.featured_carousel_enabled !== false);
        setFeaturedCarouselEyebrow(json.data.featured_carousel_eyebrow || 'Featured now');
        setFeaturedCarouselTitle(json.data.featured_carousel_title || 'Fresh picks from the catalog');
        setFeaturedProductIds((json.data.featured_product_ids || []).slice(0, 5));
        setStorefrontSections(json.data.storefront_sections || ['reviews', 'replies_approximation', 'products', 'services', 'portfolio', 'about', 'faq', 'contact', 'blog']);
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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

  const handleGenerateDedicatedAccount = async () => {
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

  const handleConnectStripe = async () => {
    try {
      setIsConnectingStripe(true);
      const res = await fetch(`${apiUrl}/v1/payments/stripe/connect`, {
        method: 'GET',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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

  const handleTemplateColorSave = async () => {
    const isProUser = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';
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
        headers: getAuthHeaders(),
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


  // --- Coupon code validation & application ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setIsValidatingCoupon(true);
      const targetPlan = billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly';
      const res = await fetch(`${apiUrl}/v1/payments/validate-coupon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code: couponCode.trim(), plan: targetPlan }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setAppliedCoupon(json.data);
        toast.success('Coupon applied successfully! 🎉');
      } else {
        throw new Error(json.message || 'Invalid coupon code.');
      }
    } catch (e: any) {
      setAppliedCoupon(null);
      toast.error(e.message || 'Could not validate coupon.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponCode('');
  }, [billingCycle]);

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
        body: JSON.stringify({
          plan: targetPlan,
          redirect_url: callbackUrl,
          coupon_code: appliedCoupon ? appliedCoupon.code : null
        }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.data?.direct_activation) {
          // Direct upgrade via 100% discount coupon
          toast.success(json.message || 'Plan upgraded to Pro successfully! 🎉');
          setUser(json.data.user);
          localStorage.setItem('user', JSON.stringify(json.data.user));
          if (json.data.store) {
            setStore(json.data.store);
            localStorage.setItem('store', JSON.stringify(json.data.store));
          }
          setAppliedCoupon(null);
          setCouponCode('');
        } else if (json.data?.authorization_url) {
          // Redirect to Paystack hosted checkout
          window.location.href = json.data.authorization_url;
        } else {
          throw new Error('Upgrade response was successful but missing activation instructions.');
        }
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

  const handleRemoveCustomDomain = () => {
    openConfirmationDialog(
      'Remove custom domain',
      'Are you sure you want to disconnect your custom domain? Your store will no longer be accessible via this domain.',
      async () => {
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
      },
      'Remove',
      'Cancel'
    );
  };

  // Poll the live provisioning/SSL status while a linked custom domain is
  // still pending, so the badge flips to Active/Failed without a page reload.
  useEffect(() => {
    if (!apiUrl || !store?.custom_domain || store?.domain_status !== 'pending') return;

    const poll = async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/store/custom-domain/status`, {
          headers: getAuthHeaders(),
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
  }, [apiUrl, store?.custom_domain, store?.domain_status]);

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
  const formatVal = (val: number | string | null | undefined) => {
    if (val === null || val === undefined) return '—';
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
          <img src="/logo.png" alt="Frontstore" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
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
                {(store.store_name || store.username || '').charAt(0).toUpperCase() || 'S'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.store_name || store.username}</p>
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
                {(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') ? <Zap size={8} /> : null}
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

        <nav className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} /> },
            { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} />, badge: orders.filter(o => o.order_status === 'pending').length },
            { id: 'products', label: 'My Products', icon: <Package size={18} /> },
            { id: 'inventory', label: 'Inventory', icon: <Archive size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'invoices', label: 'Invoices', icon: <FileText size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'receipts', label: 'Receipts', icon: <Receipt size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'automations', label: 'Automations', icon: <Sparkles size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'analytics', label: 'Pro Analytics', icon: <LineChart size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={18} /> },
            { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={18} />, badge: !isPro ? 'Pro' : (waOrders.filter(o => o.payment_status === 'unpaid').length || undefined) },
            { id: 'inbox', label: 'Unified Inbox', icon: <Inbox size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'team', label: 'Staff & Team', icon: <Users size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'finance', label: 'Profit & Expenses', icon: <TrendingUp size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'refunds', label: 'Refunds Center', icon: <RefreshCw size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'reach', label: 'Broadcast Messages', icon: <Megaphone size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'share', label: 'Share & Earn', icon: <Share2 size={18} /> },
            { id: 'qr', label: 'My QR Code', icon: <QrCode size={18} />, badge: isPro ? undefined : 'Pro' },
            { id: 'reviews', label: 'Customer Reviews', icon: <Star size={18} />, badge: !isPro ? 'Pro' : (reviews.filter(r => !r.reply).length || undefined) },
            { id: 'blog', label: 'Blog Posts', icon: <BookOpen size={18} /> },
            { id: 'availability', label: 'Availability', icon: <Clock size={18} /> },
            { id: 'bookings', label: 'Bookings', icon: <Calendar size={18} />, badge: bookings.filter((b: any) => b.status === 'pending').length || undefined },
            { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
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
                    background: item.badge === 'Pro' ? 'var(--danger)' : (item.id === 'whatsapp' ? 'var(--primary)' : 'var(--danger)'),
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
              <img src="/logo.png" alt="Frontstore" width={28} height={28} style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
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
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />

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
                            <TrendingUp size={20} />
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Business Insights</h3>
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
                                {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
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
                              {(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}
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
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Converts inventory into checkouts. Create items, update pricing, and generate descriptions using AI.</p>
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
              {activeTab === 'whatsapp' && !isPro && (
                <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
                  <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <WhatsAppIcon size={32} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>WhatsApp Inbox</h2>
                  <p style={{ fontSize: 11.5, fontWeight: 800, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Chat & Order Management</p>
                  <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                    Manage every WhatsApp order and conversation from one inbox — reply, send receipts, and follow up on unpaid orders without leaving your dashboard.
                  </p>

                  <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>All WhatsApp orders in one inbox</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Quick reply & receipt templates</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Real-time unpaid order alerts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUpgradePrompt(
                      'WhatsApp Inbox requires Pro',
                      'The dedicated WhatsApp inbox for managing orders and conversations is available on Pro. You can review the plan before upgrading.'
                    )}
                    className="btn btn-primary clickable"
                    style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
                  >
                    <Zap size={16} /> Upgrade to Pro to Unlock Inbox
                  </button>
                </div>
              )}

              {activeTab === 'whatsapp' && isPro && (() => {
                if (waOrders.length === 0 && !waLoading) loadWaOrders();
                const sym = getCurrencySymbol(store?.currency_code);
                const filtered = waOrders.filter(o =>
                  !waSearch ||
                  (o.customer_name || '').toLowerCase().includes(waSearch.toLowerCase()) ||
                  (o.customer_phone || '').includes(waSearch) ||
                  (o.order_number || '').toLowerCase().includes(waSearch.toLowerCase())
                );
                const buildReplyMsg = (order: Order) => encodeURIComponent(
                  `Hi ${order.customer_name}! This is ${store?.store_name || 'us'} 🛖\n\nRegarding your Order *#${order.order_number}* — ${sym}${parseFloat(order.total_amount as string || '0').toLocaleString()}\n\nStatus: ${(order.order_status || '').toUpperCase()} | Payment: ${(order.payment_status || '').toUpperCase()}\n\nFeel free to reply with any questions!`
                );
                const buildReceiptMsg = (order: Order) => {
                  const items = order.items?.map(i =>
                    `- ${i.quantity}x ${i.product_name} @ ${sym}${parseFloat(i.product_price as string || '0').toLocaleString()}`
                  ).join('\n') || `- Order total: ${sym}${parseFloat(order.total_amount as string || '0').toLocaleString()}`;
                  return encodeURIComponent(
                    `🧾 *RECEIPT — ${store?.store_name}*\n\nOrder: *#${order.order_number}*\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\n${items}\n\n*TOTAL: ${sym}${parseFloat(order.total_amount as string || '0').toLocaleString()}*\nStatus: ${(order.payment_status || '').toUpperCase()}\n\nThank you for your purchase! 🎉`
                  );
                };
                const cleanPhone = (p: string | null | undefined) => (p || '').replace(/\D/g, '');
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
                            const initials = (order.customer_name || 'Customer').split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
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
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', marginLeft: 'auto' }}>{(() => { const d = getOrderDisplayAmount(order, store?.currency_code); return <>{d.symbol}{formatVal(d.amount)}</>; })()}</span>
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
                        const initials = (o.customer_name || 'Customer').split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
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
                                <button
                                  onClick={() => handleSendReceipt(o.id, o.customer_whatsapp || o.customer_phone || '')}
                                  disabled={sendingReceiptId === o.id}
                                  className="btn btn-outline clickable"
                                  style={{ padding: '7px 14px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                  title="Generate PDF receipt & send to customer via WhatsApp"
                                >
                                  {sendingReceiptId === o.id ? (
                                    <><Loader2 size={13} className="spinner" /> Sending...</>
                                  ) : (
                                    <><Receipt size={13} /> Send Receipt PDF</>
                                  )}
                                </button>
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
                                    <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{sym}{(parseFloat(o.total_amount as string || '0') || 0).toLocaleString()}</span>
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
                                          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Qty: {item.quantity} × {sym}{(parseFloat(item.product_price as string || '0') || 0).toLocaleString()}</p>
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{sym}{((parseFloat(item.product_price as string || '0') || 0) * item.quantity).toLocaleString()}</span>
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

              {/* ── TAB: MY QR CODE ── */}
              {activeTab === 'qr' && !isPro && (
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
              )}

              {activeTab === 'qr' && isPro && (() => {
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
        <div class="footer">frontstore.app</div>
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
              })()}

              {/* ── TAB: STOREFRONT DESIGN (color only) ── */}
              {activeTab === 'templates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="animate-fade-in">
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Storefront design</p>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 950, margin: 0, letterSpacing: '-0.02em' }}>Store Color</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 640, marginTop: 8 }}>
                          Customize your storefront brand color — it controls buttons, highlights, catalog accents, and customer-facing styling.
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

                    {/* Persona template lock notice */}
                    {getSelectedPersonaPreset() && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary)',
                        marginBottom: 18,
                      }}>
                        <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontWeight: 700 }}>
                          Your storefront template is set to <strong>{getSelectedPersonaPreset()?.name}</strong> — perfectly matched to your store type. Only your brand color is customizable.
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'stretch' }} className="responsive-settings-grid">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 9 }}>Fast palettes</label>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {[
                              { name: 'Frontstore', value: '#25D366' },
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
                            placeholder="#25D366"
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

                  <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {settingsSubTab === 'profile' && (
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
                                ? 'This controls your public store link. Use letters, numbers, hyphens, or underscores.'
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
                            />
                            {detectedMerchantLocation && detectedMerchantLocation !== setStoreLocation && (
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
                              options={Array.from(new Set([...availableProviders, 'manual'])).map(p => ({
                                value: p,
                                label: p === 'paystack' ? 'Paystack' : p === 'flutterwave' ? 'Flutterwave' : p === 'stripe' ? 'Stripe' : 'Manual (Bank Transfer)',
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
                    )}

                    {settingsSubTab === 'design' && (
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
                                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
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
                          {ninaChatQrEnabled && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 10,
                              padding: '14px 0 4px 0',
                              borderTop: '1px dashed var(--border)'
                            }}>
                              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nina Avatar Image</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <FileUpload
                                  variant="avatar"
                                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                  previewUrl={ninaAvatarUrl || '/ninaAssistant.png'}
                                  uploading={ninaAvatarUploading}
                                  onRemove={ninaAvatarUrl ? () => setNinaAvatarUrl(null) : undefined}
                                  inputId="nina-avatar-upload-input"
                                  maxSize={5 * 1024 * 1024}
                                  onFile={async (file) => {
                                    try {
                                      setNinaAvatarUploading(true);
                                      const formData = new FormData();
                                      formData.append('avatar', file);
                                      const res = await fetch(`${apiUrl}/v1/store/upload-nina-avatar`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                                        body: formData
                                      });
                                      const json = await res.json();
                                      if (res.ok && json.url) {
                                        setNinaAvatarUrl(json.url);
                                        toast.success('Nina avatar updated! 🤖');
                                      } else {
                                        throw new Error(json.message || 'Upload failed');
                                      }
                                    } catch (err: any) {
                                      toast.error(err.message || 'Avatar upload error');
                                    } finally {
                                      setNinaAvatarUploading(false);
                                    }
                                  }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Custom Assistant Face</p>
                                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                    Upload a custom square avatar for Nina. If empty, the default assistant face will be used.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
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
                    )}

                    {(settingsSubTab === 'profile' || settingsSubTab === 'design') && (
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
                    )}

                  </form>

                  {settingsSubTab === 'security' && (
                  <>
                  {/* SECOND ROW: Security & Context */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">
                    
                    {/* Change Password Card */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <div style={{ background: 'var(--primary-light)', padding: 5, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
                          <Key size={14} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>
                          {user?.has_password === false ? 'Set Account Password' : 'Update Password'}
                        </h3>
                      </div>
                      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Current Password */}
                        {user?.has_password !== false && (
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
                        )}

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
                              Saving...
                            </>
                          ) : (user?.has_password === false ? 'Set Account Password' : 'Update Password')}
                        </button>
                      </form>
                    </div>

                    {/* Identity & Developer contexts */}
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


                    </div>

                  </div>
                  </>
                  )}

                  {settingsSubTab === 'social' && (
                  <>
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
                          Upgrade to Pro (₦{proMonthlyPrice.toLocaleString()}/mo)
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

                            {/* Bypass toggle */}
                            <div style={{ marginTop: 12 }}>
                              <Toggle
                                id="bypass-dns-checkbox"
                                checked={customDomainBypassDNS}
                                onChange={setCustomDomainBypassDNS}
                                label={<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Simulate DNS check (local/testing)</span>}
                              />
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 18 }}>
                            <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                              DNS Setup Instructions
                            </h4>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                              At your domain registrar (GoDaddy, Namecheap, etc.), add this record. Your existing email and other DNS records stay untouched.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {domainTargetCname ? (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <span style={{ width: 60 }}>Type</span>
                                    <span style={{ flex: 1 }}>Value</span>
                                  </div>
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
                                </>
                              ) : domainTargetIp ? (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <span style={{ width: 60 }}>Type</span>
                                    <span style={{ flex: 1 }}>Value</span>
                                  </div>
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
                                </>
                              ) : (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                  DNS target hasn't been configured on this platform yet — contact support.
                                </p>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 12 }}>
                              Using the domain's root (e.g. <code>mybrand.com</code> instead of <code>www</code>)? Some registrars don't allow a CNAME at the root — use an ALIAS/ANAME record with the same value, or ask your registrar for CNAME flattening.
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
                    </div>
                  </div>
                  </>
                  )}

                  {settingsSubTab === 'payment' && (
                  <>
                  {/* ── PAYMENT ACCOUNTS CARD ── */}
                  {store?.payment_provider === 'stripe' ? (
                  <div className="card" style={{ padding: 28 }}>

                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)', flexShrink: 0
                      }}>
                        <DollarSign size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Withdrawal & Payout Account
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          Connect your Stripe account to receive checkout payments and payouts in {(store?.currency_code || 'USD').toUpperCase()}.
                        </p>
                      </div>
                    </div>

                    <div style={{
                      padding: 18,
                      borderRadius: 'var(--r-xl)',
                      border: '1.5px solid var(--border)',
                      background: store?.stripe_payouts_enabled
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
                          <CreditCard size={18} color="var(--primary)" />
                          <strong style={{ fontSize: 14.5 }}>Stripe Connect account</strong>
                          {store?.stripe_payouts_enabled && (
                            <span className="badge badge-primary" style={{ fontSize: 10 }}>Active</span>
                          )}
                          {store?.stripe_account_id && !store?.stripe_payouts_enabled && (
                            <span className="badge" style={{ fontSize: 10 }}>Onboarding incomplete</span>
                          )}
                        </div>
                        {store?.stripe_account_id ? (
                          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                            {store.stripe_payouts_enabled
                              ? 'Payouts are enabled — checkout payments will be deposited to your connected Stripe account.'
                              : 'Account created — finish Stripe onboarding to enable charges and payouts.'}
                          </p>
                        ) : (
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Connect a Stripe Express account so buyers can check out and your earnings are paid out automatically.
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {store?.stripe_payouts_enabled && (
                          <button
                            type="button"
                            className="btn btn-secondary clickable"
                            onClick={handleOpenStripeDashboard}
                            disabled={isLoadingStripeDashboard}
                            style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                          >
                            {isLoadingStripeDashboard ? <><Loader2 size={15} className="spinner" /> Opening...</> : 'Open Stripe dashboard'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary clickable"
                          onClick={handleConnectStripe}
                          disabled={isConnectingStripe}
                          style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          {isConnectingStripe ? <><Loader2 size={15} className="spinner" /> Connecting...</> : store?.stripe_account_id ? 'Continue onboarding' : 'Connect Stripe'}
                        </button>
                      </div>
                    </div>

                  </div>
                  ) : (
                  <div className="card" style={{ padding: 28 }}>

                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)', flexShrink: 0
                      }}>
                        <DollarSign size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Withdrawal & Payout Bank Details
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          Configure the bank account where your store earnings are paid. Customer payments will be made to your dedicated virtual account or via standard Paystack checkout.
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
                            <Landmark size={18} color="var(--primary)" />
                            <strong style={{ fontSize: 14.5 }}>Dedicated Paystack account</strong>
                            {store?.paystack_dva_active && (
                              <span className="badge badge-primary" style={{ fontSize: 10 }}>Active</span>
                            )}
                            {!isPro && (
                              <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>Pro</span>
                            )}
                          </div>
                          {store?.paystack_dva_account_number ? (
                            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                              {store.paystack_dva_bank_name || 'Paystack'} · <strong>{store.paystack_dva_account_number}</strong> · {store.paystack_dva_account_name}
                            </p>
                          ) : (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                              Generate a dedicated virtual account that buyers pay into directly through Paystack.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary clickable"
                          onClick={() => {
                            if (!isPro) {
                              openUpgradePrompt(
                                'Dedicated Virtual Account requires Pro',
                                'Upgrade to Pro to generate or manage a dedicated virtual account for your storefront, enabling automated tracking of buyer bank transfers.'
                              );
                              return;
                            }
                            handleGenerateDedicatedAccount();
                          }}
                          disabled={isGeneratingDedicatedAccount}
                          style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          {isGeneratingDedicatedAccount ? (
                            <><Loader2 size={15} className="spinner" /> Generating...</>
                          ) : !isPro ? (
                            <><Zap size={14} /> Unlock with Pro</>
                          ) : store?.paystack_dva_account_number ? (
                            'Refresh account'
                          ) : (
                            'Generate account'
                          )}
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
                                    <Landmark size={16} color="var(--text-muted)" />
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
                                borderColor: accountVerified ? '#25D366' : undefined,
                              }}
                            />
                            {/* Right-side indicator */}
                            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                              {isVerifying ? (
                                <Loader2 size={15} className="spinner" style={{ color: 'var(--primary)' }} />
                              ) : accountVerified ? (
                                <span style={{ color: '#25D366', display: 'flex' }}><CheckCircle2 size={17} /></span>
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
                          border: `2px solid ${nameMatchOk === false ? 'var(--danger)' : '#25D366'}`,
                          background: nameMatchOk === false ? 'rgba(239,68,68,0.06)' : 'rgba(37, 211, 102, 0.07)',
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
                                background: '#25D366', color: '#fff',
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
                            <p style={{ fontSize: 12, color: '#25D366', fontWeight: 600, marginTop: 2 }}>
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

                      {/* Shipping & Delivery Fees */}
                      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Truck size={17} color="#fff" />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>Shipping &amp; Delivery Fees</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                              Frontstore never covers delivery costs — whatever you charge here is what the customer pays at checkout.
                            </div>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Shipping Type</label>
                          <select
                            value={shippingType}
                            onChange={e => setShippingType(e.target.value)}
                            className="input"
                            id="shipping-type"
                          >
                            <option value="customer_pays">Customer pays shipping (default)</option>
                            <option value="free">Free shipping</option>
                            <option value="free_above_threshold">Free shipping above an order amount</option>
                            <option value="flat_rate">Flat-rate shipping</option>
                            <option value="custom">Custom rules by order amount</option>
                          </select>
                        </div>

                        {(shippingType === 'customer_pays' || shippingType === 'flat_rate' || shippingType === 'free_above_threshold') && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {shippingType === 'free_above_threshold' && (
                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                                  Free Above ({getCurrencySymbol(store?.currency_code)})
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={shippingFreeThreshold}
                                  onChange={e => setShippingFreeThreshold(e.target.value)}
                                  className="input"
                                  placeholder="e.g. 50000"
                                  id="shipping-free-threshold"
                                />
                              </div>
                            )}
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                                {shippingType === 'free_above_threshold' ? 'Fee Below Threshold' : 'Shipping Fee'} ({getCurrencySymbol(store?.currency_code)})
                              </label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={shippingFlatFee}
                                onChange={e => setShippingFlatFee(e.target.value)}
                                className="input"
                                placeholder="e.g. 2500"
                                id="shipping-flat-fee"
                              />
                            </div>
                          </div>
                        )}

                        {shippingType === 'custom' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              Charge different fees depending on the order subtotal. The highest threshold the order clears wins.
                            </span>
                            {shippingCustomRules.map((rule, idx) => (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={rule.min_subtotal}
                                  onChange={e => setShippingCustomRules(prev => prev.map((r, i) => i === idx ? { ...r, min_subtotal: e.target.value } : r))}
                                  className="input"
                                  placeholder={`Order total ≥ (${getCurrencySymbol(store?.currency_code)})`}
                                />
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={rule.fee}
                                  onChange={e => setShippingCustomRules(prev => prev.map((r, i) => i === idx ? { ...r, fee: e.target.value } : r))}
                                  className="input"
                                  placeholder={`Fee (${getCurrencySymbol(store?.currency_code)})`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShippingCustomRules(prev => prev.filter((_, i) => i !== idx))}
                                  className="btn btn-outline"
                                  style={{ padding: '8px 12px' }}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setShippingCustomRules(prev => [...prev, { min_subtotal: '', fee: '' }])}
                              className="btn btn-outline"
                              style={{ alignSelf: 'flex-start' }}
                            >
                              + Add rule
                            </button>
                          </div>
                        )}

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                            Handling Fee ({getCurrencySymbol(store?.currency_code)}) <span style={{ fontWeight: 500, textTransform: 'none', color: 'var(--text-faint)', fontSize: 11 }}>(optional, added on top)</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={shippingHandlingFee}
                            onChange={e => setShippingHandlingFee(e.target.value)}
                            className="input"
                            placeholder="e.g. 500"
                            id="shipping-handling-fee"
                            style={{ maxWidth: 220 }}
                          />
                        </div>
                      </div>

                      {/* MTN MoMo Agent — only shown in supported countries */}
                      {['NG','GH','UG','CM','CI','BJ','SN'].includes((store?.country_code || '').toUpperCase()) && (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#FFCC00,#FF6600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 17 }}>📲</span>
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>MTN MoMo Agent</div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>Customers pay directly to your mobile money number</div>
                            </div>
                          </div>
                          <Toggle
                            checked={momoAgentEnabled}
                            onChange={val => setMomoAgentEnabled(val)}
                            id="momo-agent-toggle"
                          />
                        </div>

                        {momoAgentEnabled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Network</label>
                              <select
                                value={momoAgentNetwork}
                                onChange={e => setMomoAgentNetwork(e.target.value)}
                                className="input"
                                id="momo-agent-network"
                              >
                                <option value="mtn">MTN MoMo</option>
                                <option value="vodafone">Vodafone Cash</option>
                                <option value="airtel">Airtel Money</option>
                                <option value="tigo">Tigo Cash</option>
                              </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Agent Number</label>
                                <input
                                  type="tel"
                                  value={momoAgentNumber}
                                  onChange={e => setMomoAgentNumber(e.target.value.replace(/\D/g, ''))}
                                  className="input"
                                  placeholder="e.g. 0241234567"
                                  maxLength={15}
                                  id="momo-agent-number"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Account Name</label>
                                <input
                                  type="text"
                                  value={momoAgentName}
                                  onChange={e => setMomoAgentName(e.target.value)}
                                  className="input"
                                  placeholder="e.g. John's Fashion Store"
                                  maxLength={120}
                                  id="momo-agent-name"
                                />
                              </div>
                            </div>
                            <div style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                              💡 When enabled, customers will see your MoMo number and payment instructions immediately after checkout. You confirm payment manually in the Orders section.
                            </div>
                          </div>
                        )}
                      </div>
                      )}

                      {/* Save Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
                        <button
                          onClick={handleSettingsSave as any}
                          disabled={settingsSaving || !accountVerified || nameMatchOk === false}
                          className="btn btn-primary clickable"
                          style={{ padding: '13px 28px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : <><CreditCard size={16} /> Save Payment Details</>}
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
                  )}
                  </>
                  )}

                </div>
              )}

              {/* ── TAB: BROADCAST MESSAGES ── */}
              {activeTab === 'reach' && !isPro && (
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

              {activeTab === 'reach' && isPro && (() => {
                if (broadcastCampaigns.length === 0 && !broadcastLoading) loadBroadcastCampaigns();

                return (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: 'rgba(255, 159, 67, 0.15)', color: '#FF9F43', width: 44, height: 44, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Megaphone size={22} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Broadcast Messages</h2>
                        <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Send automated WhatsApp campaigns to your customers — included in your Pro plan.</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">
                      {/* Composer */}
                      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, height: 'fit-content' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                            Choose your audience
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                            {BROADCAST_AUDIENCES.map(seg => (
                              <button
                                key={seg.id}
                                type="button"
                                onClick={() => { setBroadcastAudience(seg.id); loadBroadcastAudiencePreview(seg.id); }}
                                className="clickable"
                                style={{
                                  textAlign: 'left',
                                  padding: 14,
                                  borderRadius: 'var(--r-lg)',
                                  border: broadcastAudience === seg.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                  background: broadcastAudience === seg.id ? 'var(--primary-light)' : 'var(--bg-2)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 4,
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: broadcastAudience === seg.id ? 'var(--primary)' : 'var(--text)' }}>
                                  <Users size={14} /> {seg.label}
                                </span>
                                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{seg.description}</span>
                              </button>
                            ))}
                          </div>
                          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {broadcastPreviewLoading ? (
                              <><Loader2 size={13} className="spinner" /> Calculating audience size...</>
                            ) : broadcastAudiencePreview ? (
                              <><Users size={13} style={{ color: 'var(--primary)' }} /> This will reach <strong style={{ color: 'var(--text)' }}>{broadcastAudiencePreview.recipients_count}</strong> customer{broadcastAudiencePreview.recipients_count === 1 ? '' : 's'}</>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                            Compose your message
                          </label>
                          <textarea
                            value={broadcastMessage}
                            onChange={e => setBroadcastMessage(e.target.value.slice(0, 1000))}
                            placeholder={"e.g. Hi {name}! 🎉 Enjoy 15% off your next order this week only — reply to this message to claim your discount."}
                            rows={5}
                            style={{ width: '100%', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Tip: use <code>{'{name}'}</code> to personalize each message with the customer's name.</span>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0, marginLeft: 12 }}>{broadcastMessage.length}/1000</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={confirmSendBroadcast}
                          disabled={!broadcastMessage.trim() || broadcastMessage.trim().length < 5 || broadcastSending || !broadcastAudiencePreview?.recipients_count}
                          className="btn btn-primary clickable"
                          style={{ alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, opacity: (!broadcastMessage.trim() || broadcastMessage.trim().length < 5 || broadcastSending || !broadcastAudiencePreview?.recipients_count) ? 0.6 : 1 }}
                        >
                          {broadcastSending ? <><Loader2 size={16} className="spinner" /> Queuing...</> : <><Send size={16} /> Review &amp; Send Broadcast</>}
                        </button>
                      </div>

                      {/* Campaign History */}
                      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 900 }}>Campaign History</h3>
                          <button onClick={loadBroadcastCampaigns} className="btn btn-ghost clickable" style={{ padding: 6, color: 'var(--primary)' }} title="Refresh"><RefreshCw size={14} /></button>
                        </div>
                        {broadcastLoading && broadcastCampaigns.length === 0 ? (
                          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
                            <Loader2 size={22} className="spinner" style={{ margin: '0 auto 10px' }} />
                            <p style={{ fontSize: 12.5 }}>Loading campaigns...</p>
                          </div>
                        ) : broadcastCampaigns.length === 0 ? (
                          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
                            <Megaphone size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                            <p style={{ fontSize: 13, fontWeight: 700 }}>No campaigns sent yet.</p>
                            <p style={{ fontSize: 11.5, marginTop: 4 }}>Compose your first broadcast above to start retargeting your customers.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {broadcastCampaigns.map(c => {
                              const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
                                queued: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', label: 'Queued' },
                                sending: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', label: 'Sending' },
                                completed: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', label: 'Completed' },
                                failed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Failed' },
                              };
                              const st = statusStyles[c.status] || statusStyles.queued;
                              const segLabel = BROADCAST_AUDIENCES.find(a => a.id === c.audience)?.label || c.audience;
                              return (
                                <div key={c.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ fontSize: 12.5, fontWeight: 800 }}>{segLabel}</span>
                                      <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: st.bg, color: st.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</span>
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>{new Date(c.created_at).toLocaleString()}</span>
                                  </div>
                                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.message}</p>
                                  <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700 }}>
                                    <span>{c.recipients_count} recipient{c.recipients_count === 1 ? '' : 's'}</span>
                                    {c.status === 'completed' && <span style={{ color: '#16a34a' }}>{c.sent_count} sent</span>}
                                    {c.status === 'completed' && c.failed_count > 0 && <span style={{ color: '#ef4444' }}>{c.failed_count} failed</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                        Unlock custom domain, store bio profile description, product details, and AI features.
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
                          <span><strong>Zero transaction fees</strong> on completed orders</span>
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
                          <span style={{ textDecoration: 'line-through' }}>AI description auto-write</span>
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
                        }}><Zap size={8} /> Active Pro ({user?.plan === 'pro_yearly' ? 'Yearly' : 'Monthly'})</span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Pro Business Plan</h3>
                        <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>POPULAR</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Unlock full branding, SEO features, and AI-powered tools.</p>

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
                            color: '#128C7E',
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
                        {appliedCoupon ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>
                              {billingCycle === 'monthly' ? `₦${proMonthlyPrice.toLocaleString()}` : `₦${proYearlyPrice.toLocaleString()}`}
                            </span>
                            <div>
                              <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                                ₦{(appliedCoupon.final_price || 0).toLocaleString()}
                              </span>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                                {billingCycle === 'monthly' ? ' / month' : ' / year'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span style={{ fontSize: 28, fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
                              {billingCycle === 'monthly' ? `₦${proMonthlyPrice.toLocaleString()}` : `₦${proYearlyPrice.toLocaleString()}`}
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                              {billingCycle === 'monthly' ? ' / month' : ' / year'}
                            </span>
                          </>
                        )}
                        {billingCycle === 'yearly' && !appliedCoupon && (
                          <div style={{ fontSize: 11.5, color: '#25D366', fontWeight: 700, marginTop: 4 }}>
                            equivalent to ₦{Math.round(proYearlyPrice / 12).toLocaleString()} / month (billed annually)
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <CheckCircle2 size={16} color="#d97706" />
                          <span><strong>Zero transaction fees</strong> on sales</span>
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
                          <span><strong>AI auto-write</strong> — generate title, bio &amp; descriptions instantly</span>
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

                      {/* Coupon input for non-pro users */}
                      {!(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') && (
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            Promo / Coupon Code
                          </label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="text"
                              placeholder="e.g. SAVE50"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setAppliedCoupon(null);
                              }}
                              disabled={isValidatingCoupon || isInitializingPayment}
                              style={{
                                flex: 1,
                                padding: '8px 10px',
                                background: 'var(--bg-2)',
                                border: '1.5px solid var(--border)',
                                borderRadius: 'var(--r-sm)',
                                color: 'var(--text)',
                                textTransform: 'uppercase',
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim() || isValidatingCoupon || isInitializingPayment}
                              className="btn btn-outline"
                              style={{
                                padding: '8px 14px',
                                fontSize: 12,
                                fontWeight: 700,
                                borderRadius: 'var(--r-sm)',
                                border: '1.5px solid var(--primary)',
                                color: 'var(--primary)',
                                background: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {isValidatingCoupon ? <Loader2 size={13} className="spinner animate-spin" /> : 'Apply'}
                            </button>
                          </div>

                          {appliedCoupon && (
                            <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--primary-light)', borderRadius: 'var(--r-sm)', fontSize: 11.5, border: '1px solid var(--primary)', color: 'var(--text)' }}>
                              <p style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Tag size={12} />
                                Code Applied: {appliedCoupon.code}
                              </p>
                              <p style={{ color: 'var(--text-muted)', fontSize: 10.5, marginTop: 2 }}>
                                Discount: {appliedCoupon.discount_type === 'percentage'
                                  ? `${parseFloat(appliedCoupon.discount_value || '0') || 0}% Off`
                                  : `₦${(parseFloat(appliedCoupon.discount_value || '0') || 0).toLocaleString()} Off`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 24 }}>
                        <button
                          type="button"
                          disabled={(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') || isInitializingPayment}
                          onClick={() => handleUpgradePlan(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly')}
                          className={`btn clickable`}
                          style={{
                            padding: 12,
                            background: (user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') 
                              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                              : appliedCoupon && appliedCoupon.final_price === 0
                                ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                                : 'none',
                            border: (user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') 
                              ? '1.5px solid #d97706' 
                              : appliedCoupon && appliedCoupon.final_price === 0
                                ? '1.5px solid #25D366'
                                : '1.5px solid #d97706',
                            color: (user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') || (appliedCoupon && appliedCoupon.final_price === 0) ? '#fff' : '#d97706',
                            fontWeight: 800, borderRadius: 'var(--r-md)', fontSize: 13,
                            opacity: ((user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly') || isInitializingPayment) ? 0.7 : 1,
                            display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                          }}
                        >
                          {isInitializingPayment ? <Loader2 size={14} className="spinner animate-spin" /> : null}
                          {(user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly')
                            ? `✓ Active Plan (${user?.plan === 'pro_yearly' ? 'Yearly' : 'Monthly'})`
                            : isInitializingPayment
                              ? 'Processing...'
                              : appliedCoupon && appliedCoupon.final_price === 0
                                ? 'Activate Plan Free'
                                : billingCycle === 'monthly'
                                  ? 'Go Pro Monthly'
                                  : 'Go Pro Yearly'}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ── TAB: INVOICES ── */}
              {activeTab === 'invoices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)', flexShrink: 0
                      }}>
                        <FileText size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Pro Invoices
                        </h2>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          Create, send, and track professional invoices.
                        </p>
                      </div>
                    </div>
                    {isPro && (
                      <button
                        onClick={() => {
                          setNewInvoiceData({ customer_name: '', customer_email: '', customer_phone: '', due_date: '', notes: '' });
                          setInvoiceItems([{ name: '', quantity: 1, price: 0 }]);
                          setIsAddInvoiceOpen(true);
                        }}
                        className="btn btn-primary clickable"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13.5 }}
                      >
                        <Plus size={16} /> Create Invoice
                      </button>
                    )}
                  </div>

                  {!isPro ? (
                    <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <FileText size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
                          Professional Merchant Invoices
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Request direct payments, track unpaid client orders, and generate download-ready PDF invoices tailored for African commerce.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
                        <button
                          onClick={() => navigateDashboardTab('billing')}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
                        >
                          🚀 Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Filter tabs */}
                      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, overflowX: 'auto' }}>
                        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setInvoiceFilter(f)}
                            className="clickable"
                            style={{
                              padding: '6px 14px',
                              borderRadius: 'var(--r-full)',
                              border: 'none',
                              fontSize: 13,
                              fontWeight: 700,
                              background: invoiceFilter === f ? 'var(--primary-light)' : 'transparent',
                              color: invoiceFilter === f ? 'var(--primary)' : 'var(--text-muted)',
                              textTransform: 'capitalize'
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Invoices List */}
                      {invoicesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                          <Loader2 className="spinner" size={32} />
                        </div>
                      ) : invoices.length === 0 ? (
                        <div className="card text-center" style={{ padding: 40 }}>
                          <p style={{ color: 'var(--text-muted)' }}>No invoices found. Click "Create Invoice" to issue one.</p>
                        </div>
                      ) : (
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Invoice #</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Customer</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Due Date</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Total Amount</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoices
                                .filter(inv => invoiceFilter === 'all' || inv.status === invoiceFilter)
                                .map(inv => {
                                  const currencySymbols: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$' };
                                  const symbol = currencySymbols[store?.currency_code || 'NGN'] || (store?.currency_code || '') + ' ';
                                  return (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{inv.invoice_number}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 14 }}>
                                        <div style={{ fontWeight: 700 }}>{inv.customer_name}</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{inv.customer_email || inv.customer_phone}</div>
                                      </td>
                                      <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--text-muted)' }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{symbol}{parseFloat(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <span style={{
                                          fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--r-full)',
                                          background: inv.status === 'paid' ? 'rgba(34,197,94,0.1)' : (inv.status === 'sent' ? 'rgba(59,130,246,0.1)' : (inv.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(156,163,175,0.1)')),
                                          color: inv.status === 'paid' ? 'var(--success)' : (inv.status === 'sent' ? 'var(--primary)' : (inv.status === 'overdue' ? 'var(--danger)' : 'var(--text-muted)')),
                                          textTransform: 'uppercase'
                                        }}>
                                          {inv.status}
                                        </span>
                                      </td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <a
                                            href={`${apiUrl}/v1/public/invoices/${inv.id}/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline clickable"
                                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                                          >
                                            PDF
                                          </a>
                                          {inv.status !== 'paid' && (
                                            <>
                                              <button
                                                onClick={async () => {
                                                  toast.loading("Sending invoice...");
                                                  try {
                                                    const res = await fetch(`${apiUrl}/v1/invoices/${inv.id}/send`, { method: 'POST', headers: getAuthHeaders() });
                                                    toast.dismiss();
                                                    if (res.ok) toast.success("Invoice sent to customer.");
                                                    else toast.error("Failed to send invoice.");
                                                  } catch {
                                                    toast.dismiss();
                                                    toast.error("Network error sending invoice.");
                                                  }
                                                }}
                                                className="btn btn-outline clickable"
                                                style={{ padding: '4px 8px', fontSize: 11.5 }}
                                              >
                                                Send
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  if (confirm("Record cash/bank transfer payment for this invoice?")) {
                                                    try {
                                                      const res = await fetch(`${apiUrl}/v1/invoices/${inv.id}/record-payment`, {
                                                        method: 'POST',
                                                        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ payment_method: 'bank_transfer' })
                                                      });
                                                      if (res.ok) {
                                                        toast.success("Payment recorded successfully.");
                                                        fetchInvoicesData();
                                                      }
                                                    } catch {
                                                      toast.error("Failed to record payment.");
                                                    }
                                                  }
                                                }}
                                                className="btn btn-primary clickable"
                                                style={{ padding: '4px 8px', fontSize: 11.5 }}
                                              >
                                                Paid
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB: RECEIPTS ── */}
              {activeTab === 'receipts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)', flexShrink: 0
                      }}>
                        <Receipt size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Pro Receipts
                        </h2>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          View generated receipts and instantly resend verification details.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isPro ? (
                    <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <Receipt size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
                          Automated Digital Receipts
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Deliver automated customer receipts on successful checkout payment verification, complete with customized PDF layouts for mobile printers.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
                        <button
                          onClick={() => navigateDashboardTab('billing')}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
                        >
                          🚀 Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <div className="card" style={{ padding: 12 }}>
                        <input
                          type="text"
                          placeholder="Search receipts by customer or receipt number..."
                          value={receiptSearch}
                          onChange={e => setReceiptSearch(e.target.value)}
                          style={{ width: '100%', border: 'none', background: 'none', fontSize: 14, outline: 'none' }}
                        />
                      </div>

                      {/* Receipts List */}
                      {receiptsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                          <Loader2 className="spinner" size={32} />
                        </div>
                      ) : receipts.length === 0 ? (
                        <div className="card text-center" style={{ padding: 40 }}>
                          <p style={{ color: 'var(--text-muted)' }}>No receipts have been generated yet.</p>
                        </div>
                      ) : (
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Receipt #</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Customer</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Paid Date</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Method</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {receipts
                                .filter(r => {
                                  const term = receiptSearch.toLowerCase();
                                  return r.receipt_number.toLowerCase().includes(term) || r.customer_name.toLowerCase().includes(term);
                                })
                                .map(r => {
                                  const currencySymbols: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$' };
                                  const symbol = currencySymbols[store?.currency_code || 'NGN'] || (store?.currency_code || '') + ' ';
                                  return (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{r.receipt_number}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 14 }}>
                                        <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{r.customer_email || r.customer_phone}</div>
                                      </td>
                                      <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--text-muted)' }}>{new Date(r.paid_at).toLocaleDateString()}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{symbol}{parseFloat(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, textTransform: 'capitalize' }}>{r.payment_method?.replace('_', ' ')}</td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <a
                                            href={`${apiUrl}/v1/public/receipts/${r.id}/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline clickable"
                                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                                          >
                                            View PDF
                                          </a>
                                          <button
                                            onClick={async () => {
                                              toast.loading("Resending receipt...");
                                              try {
                                                const res = await fetch(`${apiUrl}/v1/receipts/${r.id}/resend`, { method: 'POST', headers: getAuthHeaders() });
                                                toast.dismiss();
                                                if (res.ok) toast.success("Receipt resent to customer.");
                                                else toast.error("Failed to resend receipt.");
                                              } catch {
                                                toast.dismiss();
                                                toast.error("Network error resending receipt.");
                                              }
                                            }}
                                            className="btn btn-primary clickable"
                                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                                          >
                                            Resend
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB: INVENTORY ── */}
              {activeTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)', flexShrink: 0
                      }}>
                        <Archive size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Inventory Management
                        </h2>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          Track stock levels, configure low stock thresholds, and view adjustment logs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isPro ? (
                    <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <Archive size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
                          Advanced Inventory & Variants
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Track product sizes and colors, automatically deduct stock levels upon successful customer purchase, and configure instant notifications for low stock counts.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
                        <button
                          onClick={() => navigateDashboardTab('billing')}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
                        >
                          🚀 Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Sub-tabs toggle */}
                      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                        <button
                          onClick={() => setInventoryTab('levels')}
                          className="clickable"
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--r-full)',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 700,
                            background: inventoryTab === 'levels' ? 'var(--primary-light)' : 'transparent',
                            color: inventoryTab === 'levels' ? 'var(--primary)' : 'var(--text-muted)',
                          }}
                        >
                          Stock Levels
                        </button>
                        <button
                          onClick={() => setInventoryTab('logs')}
                          className="clickable"
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--r-full)',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 700,
                            background: inventoryTab === 'logs' ? 'var(--primary-light)' : 'transparent',
                            color: inventoryTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
                          }}
                        >
                          Adjustment History
                        </button>
                      </div>

                      {inventoryTab === 'levels' ? (
                        /* Stock Levels Table */
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Product</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Track Stock?</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Stock Count</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map(prod => {
                                const hasVariants = prod.variants && prod.variants.length > 0;
                                return (
                                  <React.Fragment key={prod.id}>
                                    <tr style={{ borderBottom: hasVariants ? 'none' : '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{prod.name}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 14 }}>{prod.track_inventory ? 'Yes' : 'No'}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 850 }}>
                                        {prod.track_inventory ? prod.inventory_quantity : '—'}
                                      </td>
                                      <td style={{ padding: '14px 18px' }}>
                                        {prod.track_inventory ? (
                                          <span style={{
                                            fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--r-full)',
                                            background: prod.stock_status === 'in_stock' ? 'rgba(34,197,94,0.1)' : (prod.stock_status === 'low_stock' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'),
                                            color: prod.stock_status === 'in_stock' ? 'var(--success)' : (prod.stock_status === 'low_stock' ? 'var(--warning)' : 'var(--danger)'),
                                            textTransform: 'uppercase'
                                          }}>
                                            {prod.stock_status?.replace('_', ' ')}
                                          </span>
                                        ) : '—'}
                                      </td>
                                      <td style={{ padding: '14px 18px' }}>
                                        {!hasVariants && prod.track_inventory && (
                                          <button
                                            onClick={() => {
                                              setAdjustingProduct(prod);
                                              setAdjustingVariant(null);
                                              setAdjustQty('');
                                              setAdjustType('restock');
                                              setAdjustReason('');
                                              setIsAdjustStockOpen(true);
                                            }}
                                            className="btn btn-outline clickable"
                                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                                          >
                                            Adjust Stock
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                    {hasVariants && prod.variants!.map((v: any) => (
                                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                        <td style={{ padding: '8px 18px 8px 36px', fontSize: 12.5, color: 'var(--text-muted)' }}>
                                          ↳ Variant: {v.size ? `Size ${v.size}` : ''} {v.color ? `Color ${v.color}` : ''}
                                        </td>
                                        <td style={{ padding: '8px 18px', fontSize: 12.5, color: 'var(--text-muted)' }}>Yes</td>
                                        <td style={{ padding: '8px 18px', fontSize: 13, fontWeight: 750 }}>{v.inventory_quantity}</td>
                                        <td style={{ padding: '8px 18px' }}>
                                          <span style={{
                                            fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-full)',
                                            background: v.inventory_quantity <= 0 ? 'rgba(239,68,68,0.1)' : (v.inventory_quantity <= (prod.low_stock_threshold ?? 5) ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)'),
                                            color: v.inventory_quantity <= 0 ? 'var(--danger)' : (v.inventory_quantity <= (prod.low_stock_threshold ?? 5) ? 'var(--warning)' : 'var(--success)'),
                                            textTransform: 'uppercase'
                                          }}>
                                            {v.inventory_quantity <= 0 ? 'OUT OF STOCK' : (v.inventory_quantity <= (prod.low_stock_threshold ?? 5) ? 'LOW STOCK' : 'IN STOCK')}
                                          </span>
                                        </td>
                                        <td style={{ padding: '8px 18px' }}>
                                          <button
                                            onClick={() => {
                                              setAdjustingProduct(prod);
                                              setAdjustingVariant(v);
                                              setAdjustQty('');
                                              setAdjustType('restock');
                                              setAdjustReason('');
                                              setIsAdjustStockOpen(true);
                                            }}
                                            className="btn btn-outline clickable"
                                            style={{ padding: '4px 8px', fontSize: 11 }}
                                          >
                                            Adjust
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* Adjustment Logs Table */
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Product</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Variant</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Type</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Adjustment</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Qty Before/After</th>
                                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Reason</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                                    {new Date(log.created_at).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 700 }}>
                                    {log.product?.name || '—'}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                                    {log.variant ? `${log.variant.size ? 'S: ' + log.variant.size : ''} ${log.variant.color ? 'C: ' + log.variant.color : ''}` : '—'}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 12.5, textTransform: 'capitalize' }}>
                                    {log.adjustment_type}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 800, color: log.quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                                    {log.previous_quantity} → {log.new_quantity}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 13 }}>
                                    {log.reason || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB: AUTOMATIONS ── */}
              {activeTab === 'automations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--r-md)',
                        background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)', flexShrink: 0
                      }}>
                        <Sparkles size={22} color="#fff" />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                          Growth Automations
                        </h2>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          Configure triggers, channels, and campaigns to automatically recover lost sales.
                        </p>
                      </div>
                    </div>
                    {isPro && (
                      <button
                        onClick={async () => {
                          try {
                            setAutomationLoading(true);
                            const res = await fetch(`${apiUrl}/v1/store/automations`, {
                              method: 'PUT',
                              headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                              body: JSON.stringify(automationSetting)
                            });
                            if (res.ok) {
                              toast.success("Automation settings saved successfully.");
                            } else {
                              toast.error("Failed to save settings.");
                            }
                          } catch {
                            toast.error("Network error saving automation settings.");
                          } finally {
                            setAutomationLoading(false);
                          }
                        }}
                        className="btn btn-primary clickable"
                        style={{ padding: '8px 16px', fontSize: 13.5 }}
                      >
                        Save Settings
                      </button>
                    )}
                  </div>

                  {!isPro ? (
                    <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <Sparkles size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
                          Growth & Marketing Journeys
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Launch multi-channel buyer automation flows. Recover abandoned checkouts, send automatic coupon thank-you gifts, dispatch reviews, and trigger win-back campaigns on Email & WhatsApp.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
                        <button
                          onClick={() => navigateDashboardTab('billing')}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
                        >
                          🚀 Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Channels selector */}
                      <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Enabled Notification Channels</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Select the multi-channel notification destinations for automated flows.</p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                          {['email', 'whatsapp'].map(ch => {
                            const active = automationSetting.channels?.includes(ch);
                            return (
                              <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer', fontWeight: 700 }}>
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={e => {
                                    const nextChs = e.target.checked
                                      ? [...(automationSetting.channels || []), ch]
                                      : (automationSetting.channels || []).filter((x: string) => x !== ch);
                                    setAutomationSetting({ ...automationSetting, channels: nextChs });
                                  }}
                                />
                                {ch.toUpperCase()}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Automations list */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                        {/* Cart Recovery */}
                        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 850 }}>Abandoned Cart Recovery</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Automatically recovers shoppers who dropped off during checkout without completing payment.</p>
                            </div>
                            <Toggle
                              checked={automationSetting.cart_recovery_enabled}
                              onChange={val => setAutomationSetting({ ...automationSetting, cart_recovery_enabled: val })}
                            />
                          </div>
                        </div>

                        {/* Order Confirmation */}
                        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 850 }}>Immediate Order Confirmation</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Sends immediate, rich order alerts with tracking links upon verified customer purchase.</p>
                            </div>
                            <Toggle
                              checked={automationSetting.order_confirmation_enabled}
                              onChange={val => setAutomationSetting({ ...automationSetting, order_confirmation_enabled: val })}
                            />
                          </div>
                        </div>

                        {/* Receipt Delivery */}
                        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 850 }}>Instant Receipt PDF Dispatch</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Generates and delivers printable receipts right to customer inbox instantly.</p>
                            </div>
                            <Toggle
                              checked={automationSetting.receipt_delivery_enabled}
                              onChange={val => setAutomationSetting({ ...automationSetting, receipt_delivery_enabled: val })}
                            />
                          </div>
                        </div>

                        {/* Thank You Coupon */}
                        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 850 }}>Customer Appreciation & Coupons</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Delivers a special thank you appreciation note along with an active coupon discount code.</p>
                            </div>
                            <Toggle
                              checked={automationSetting.thank_you_enabled}
                              onChange={val => setAutomationSetting({ ...automationSetting, thank_you_enabled: val })}
                            />
                          </div>
                        </div>

                        {/* Review Request */}
                        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 850 }}>Delayed Review Requests</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Triggers review feedback prompts 3 days after payment to build storefront social proof.</p>
                            </div>
                            <Toggle
                              checked={automationSetting.review_request_enabled}
                              onChange={val => setAutomationSetting({ ...automationSetting, review_request_enabled: val })}
                            />
                          </div>
                        </div>

                        {/* Win-back campaign */}
                        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 850 }}>Merchant Win-back Campaigns</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Nudges inactive customers who haven't made a purchase within a configured amount of days.</p>
                            </div>
                            <Toggle
                              checked={automationSetting.win_back_enabled}
                              onChange={val => setAutomationSetting({ ...automationSetting, win_back_enabled: val })}
                            />
                          </div>
                          {automationSetting.win_back_enabled && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Inactive Days Trigger</label>
                                <input
                                  type="number"
                                  value={automationSetting.win_back_days}
                                  onChange={e => setAutomationSetting({ ...automationSetting, win_back_days: parseInt(e.target.value) || 30 })}
                                  className="form-control"
                                  style={{ marginTop: 6 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Discount Coupon Code</label>
                                <input
                                  type="text"
                                  value={automationSetting.win_back_coupon_code}
                                  onChange={e => setAutomationSetting({ ...automationSetting, win_back_coupon_code: e.target.value })}
                                  placeholder="e.g. WELCOMEBACK"
                                  className="form-control"
                                  style={{ marginTop: 6 }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: PRO ANALYTICS ── */}
              {activeTab === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)', flexShrink: 0
                    }}>
                      <LineChart size={22} color="#fff" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                        Advanced Pro Analytics
                      </h2>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Real-time revenue metrics, repeat purchase rates, and top customer insights.
                      </p>
                    </div>
                  </div>

                  {!isPro ? (
                    <div className="card text-center animate-fade-in" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <LineChart size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>
                          Advanced Merchant Analytics
                        </h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Analyze gross/net earnings, track customer lifetime value (LTV), monitor repeat purchase rates, and isolate top performing products.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
                        <button
                          onClick={() => navigateDashboardTab('billing')}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}
                        >
                          🚀 Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  ) : proAnalyticsLoading || !proAnalytics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                      <Loader2 className="spinner" size={32} />
                    </div>
                  ) : (
                    <>
                      {/* Download reports buttons */}
                      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => downloadAnalyticsReport('weekly')}
                          className="btn btn-secondary clickable"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
                        >
                          <FileText size={15} /> Export Weekly Sales Report (PDF)
                        </button>
                        <button
                          onClick={() => downloadAnalyticsReport('monthly')}
                          className="btn btn-secondary clickable"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
                        >
                          <FileText size={15} /> Export Monthly Account Statement (PDF)
                        </button>
                      </div>

                      {/* Metric cards grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        <div className="card" style={{ padding: 20 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>GROSS REVENUE</span>
                          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                            {store?.currency_code} {parseFloat(proAnalytics.metrics?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h3>
                        </div>
                        <div className="card" style={{ padding: 20 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>NET REVENUE</span>
                          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                            {store?.currency_code} {parseFloat(proAnalytics.metrics?.net_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h3>
                        </div>
                        <div className="card" style={{ padding: 20 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>AVG ORDER VALUE</span>
                          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                            {store?.currency_code} {parseFloat(proAnalytics.metrics?.average_order_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h3>
                        </div>
                        <div className="card" style={{ padding: 20 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>REPEAT PURCHASE RATE</span>
                          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                            {parseFloat(proAnalytics.metrics?.repeat_purchase_rate || 0).toFixed(1)}%
                          </h3>
                        </div>
                      </div>

                      {/* Tables layout */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                        {/* Top Products */}
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Top Products</h3>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Product</th>
                                <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Qty Sold</th>
                                <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {proAnalytics.top_products?.map((p: any) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 750 }}>{p.name}</td>
                                  <td style={{ padding: '12px 18px', fontSize: 13 }}>{p.quantity_sold}</td>
                                  <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 800 }}>
                                    {store?.currency_code} {parseFloat(p.revenue_generated || 0).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Top Customers */}
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Top Customers</h3>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Customer</th>
                                <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Orders</th>
                                <th style={{ padding: '10px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Total Spent</th>
                              </tr>
                            </thead>
                            <tbody>
                              {proAnalytics.customer_insights?.map((c: any) => (
                                <tr key={c.id || c.customer_name} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 750 }}>{c.customer_name}</td>
                                  <td style={{ padding: '12px 18px', fontSize: 13 }}>{c.purchase_count}</td>
                                  <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 800 }}>
                                    {store?.currency_code} {parseFloat(c.total_spent || 0).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── TAB 8: WALLET & PAYOUTS ── */}
              {activeTab === 'wallet' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)',
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)', flexShrink: 0
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

                      {/* Premium Trust Engine Gauge & Levels Card */}
                      <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={18} style={{ color: 'var(--primary)' }} />
                          Trust Payout Engine & Score
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, alignItems: 'center' }}>
                          {/* Radial Gauge */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative', width: 120, height: 120 }}>
                              <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="10"
                                  strokeDasharray={`${2 * Math.PI * 50}`}
                                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - ((store as any)?.trust_score ?? 20) / 100)}`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 60 60)"
                                />
                              </svg>
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{(store as any)?.trust_score ?? 20}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Score</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 10px', borderRadius: 12 }}>
                                Level {(store as any)?.seller_level ?? 1} Seller
                              </span>
                            </div>
                          </div>

                          {/* Payout Hold Levels breakdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Payout Settlement Rules</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: ((store as any)?.seller_level ?? 1) === 1 ? 1 : 0.6, fontWeight: ((store as any)?.seller_level ?? 1) === 1 ? 800 : 500 }}>
                                <span>Level 1 (0-40 pts):</span>
                                <span>5 Days Hold</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: ((store as any)?.seller_level ?? 1) === 2 ? 1 : 0.6, fontWeight: ((store as any)?.seller_level ?? 1) === 2 ? 800 : 500 }}>
                                <span>Level 2 (41-70 pts):</span>
                                <span>Next-Day Payout</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: ((store as any)?.seller_level ?? 1) === 3 ? 1 : 0.6, fontWeight: ((store as any)?.seller_level ?? 1) === 3 ? 800 : 500 }}>
                                <span>Level 3 (71-90 pts):</span>
                                <span>Same-Day Payout</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: ((store as any)?.seller_level ?? 1) === 4 ? 1 : 0.6, fontWeight: ((store as any)?.seller_level ?? 1) === 4 ? 800 : 500 }}>
                                <span>Level 4 (91-100 pts):</span>
                                <span>Instant Payout</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Verification Checklist */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, margin: 0 }}>Verification Status Checklist</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
                            {/* Email Check */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                                <span>Email Address Verified</span>
                              </div>
                              <span style={{ color: '#25D366', fontWeight: 700 }}>+10 pts</span>
                            </div>

                            {/* Phone Check */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                                <span>Phone / WhatsApp Connected</span>
                              </div>
                              <span style={{ color: '#25D366', fontWeight: 700 }}>+10 pts</span>
                            </div>

                            {/* Selfie Liveness Check */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {(store as any)?.selfie_verified_at ? (
                                  <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                                ) : (
                                  <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                                )}
                                <span>Selfie Liveness check</span>
                              </div>
                              {(store as any)?.selfie_verified_at ? (
                                <span style={{ color: '#25D366', fontWeight: 700 }}>+10 pts</span>
                              ) : (
                                <button type="button" onClick={() => setIsSelfieModalOpen(true)} className="btn btn-outline clickable" style={{ padding: '2px 8px', fontSize: 11, borderRadius: 6 }}>
                                  Verify
                                </button>
                              )}
                            </div>

                            {/* CAC Business Check */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {(store as any)?.business_info_completed ? (
                                  <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                                ) : (
                                  <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                                )}
                                <span>CAC Business details</span>
                              </div>
                              {(store as any)?.business_info_completed ? (
                                <span style={{ color: '#25D366', fontWeight: 700 }}>+10 pts</span>
                              ) : (
                                <button type="button" onClick={() => setIsBusinessModalOpen(true)} className="btn btn-outline clickable" style={{ padding: '2px 8px', fontSize: 11, borderRadius: 6 }}>
                                  Verify
                                </button>
                              )}
                            </div>

                            {/* Gov ID Check */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {store?.verification_status === 'verified' ? (
                                  <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                                ) : (
                                  <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                                )}
                                <span>Identity Documents</span>
                              </div>
                              {store?.verification_status === 'verified' ? (
                                <span style={{ color: '#25D366', fontWeight: 700 }}>+15 pts</span>
                              ) : (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload below</span>
                              )}
                            </div>

                            {/* Bank Check */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {walletBalances.bank_account_verified ? (
                                  <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                                ) : (
                                  <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                                )}
                                <span>Settlement Bank account</span>
                              </div>
                              <span style={{ color: walletBalances.bank_account_verified ? '#25D366' : 'var(--text-muted)', fontWeight: 700 }}>
                                {walletBalances.bank_account_verified ? '+15 pts' : 'Unverified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Store verification Document Upload widget */}
                      <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={18} style={{ color: 'var(--primary)' }} />
                          Document Verification Upload
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

                              {verificationDocType === 'business_registration' && (
                                <div style={{ display: 'flex', gap: 12, background: '#fffbeb', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid #fcd34d' }}>
                                  <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                                  <p style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.55, margin: 0 }}>
                                    <strong>CAC is primarily for Nigerians.</strong> If you are not based in Nigeria, please select <strong>International Passport (IP)</strong> as your verification document instead.
                                  </p>
                                </div>
                              )}


                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>ID Number (Optional if uploading document)</label>
                                <input
                                  type="text"
                                  placeholder="Enter NIN, Passport #, Driver's License #, or CAC #"
                                  value={verificationIdNumber}
                                  onChange={e => setVerificationIdNumber(e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--surface)',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--r-md)',
                                    fontSize: 13.5,
                                    color: 'var(--text)',
                                    outline: 'none'
                                  }}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Upload Document File (Image/PDF)</label>
                                <FileUpload
                                  variant="default"
                                  accept="image/*,application/pdf"
                                  label="Drop your document here or click to upload"
                                  hint="JPG, PNG, or PDF accepted"
                                  previewUrl={verificationDocUrl || undefined}
                                  uploading={verificationUploading}
                                  success={verificationDocUrl ? 'Document uploaded successfully' : undefined}
                                  inputId="verification-file-input"
                                  onFile={async (file) => { await handleUploadVerificationDoc(file); }}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isSubmittingVerification || (!verificationDocUrl && !verificationIdNumber) || verificationUploading}
                                className="btn btn-primary clickable"
                                style={{
                                  padding: '12px 24px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13.5, width: 'fit-content', marginTop: 8
                                }}
                              >
                                {isSubmittingVerification ? <><Loader2 size={15} className="spinner" /> Submitting...</> : 'Submit Documents for Verification'}
                              </button>
                            </form>

                            {verificationRedirectUrl && (
                              <div style={{ marginTop: 16, padding: 16, background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, margin: 0 }}>
                                  Action Required: Complete verification on our secure partner portal.
                                </p>
                                <a
                                  href={verificationRedirectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary clickable"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    borderRadius: 'var(--r-md)',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    textDecoration: 'none',
                                    width: 'fit-content'
                                  }}
                                >
                                  Open Verification Portal
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Store Disputes Center Widget */}
                      <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
                          <Scale size={18} />
                          Store Disputes Center
                        </h3>
                        {merchantDisputes.length === 0 ? (
                          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
                            <AlertCircle size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No active store disputes</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4, margin: 0 }}>Good job! Your customers have not filed any disputes.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {merchantDisputes.map((disp: any) => (
                              <div key={disp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }}>
                                <div>
                                  <div style={{ fontWeight: 800 }}>Dispute #{disp.id.substring(0, 8).toUpperCase()}</div>
                                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>Reason: {disp.reason.replace(/_/g, ' ').toUpperCase()} • Status: <span style={{ fontWeight: 700, color: disp.status === 'open' ? '#d97706' : '#25D366' }}>{disp.status.toUpperCase()}</span></div>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await fetchSingleDispute(disp.id);
                                  }}
                                  className="btn btn-outline clickable"
                                  style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                                >
                                  View & Chat
                                </button>
                              </div>
                            ))}
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

              {/* ── TAB 11: REVIEWS MANAGER ── */}
              {activeTab === 'reviews' && !isPro && (
                <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
                  <div style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Star size={32} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Customer Reviews</h2>
                  <p style={{ fontSize: 11.5, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Ratings & Reputation</p>
                  <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                    See every rating and comment left by your customers, and reply publicly to build trust and win repeat business.
                  </p>

                  <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Read every customer review</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Reply publicly to build trust</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Track your store's overall rating</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUpgradePrompt(
                      'Customer Reviews requires Pro',
                      'Viewing and replying to customer reviews is available on Pro. You can review the plan before upgrading.'
                    )}
                    className="btn btn-primary clickable"
                    style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
                  >
                    <Zap size={16} /> Upgrade to Pro to Unlock Reviews
                  </button>
                </div>
              )}

              {activeTab === 'reviews' && isPro && (
                <div className="card animate-fade-in" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Customer Reviews</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage and respond to feedback left for your store and products.</p>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
                      <div className="empty-state__icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
                        <Star size={28} strokeWidth={1.25} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>No reviews yet</h3>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                        Once verified buyers review their orders, their ratings and comments will appear here.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {reviews.map((review) => (
                        <div key={review.id} style={{
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: '14.5px' }}>{review.customer_name}</span>
                              {review.order && (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  Order #{review.order.order_number}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  size={13}
                                  fill={star <= review.rating ? 'var(--primary)' : 'none'}
                                  stroke={star <= review.rating ? 'var(--primary)' : 'var(--text-faint)'}
                                />
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 'var(--r-full)',
                              background: review.product_id ? 'var(--bg)' : 'rgba(16, 185, 129, 0.08)',
                              color: review.product_id ? 'var(--text-muted)' : 'var(--primary)',
                              border: '1px solid var(--border)'
                            }}>
                              {review.product_id 
                                ? `Product: ${review.product?.name ?? 'Deleted Product'}`
                                : 'Store Experience'
                              }
                            </span>
                          </div>

                          {review.comment && (
                            <p style={{ fontSize: '13.5px', margin: 0, color: 'var(--text)', fontStyle: 'italic', background: 'var(--bg)', padding: '12px', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--border-strong)', lineHeight: 1.4 }}>
                              &ldquo;{review.comment}&rdquo;
                            </p>
                          )}

                          {review.reply ? (
                            <div style={{
                              marginTop: '4px',
                              padding: '12px 14px',
                              background: 'var(--bg)',
                              borderRadius: 'var(--r-sm)',
                              borderLeft: '3px solid var(--primary)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Response</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                                  {new Date(review.replied_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {review.reply}
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                              <textarea
                                placeholder="Type a response to this review..."
                                value={replyTexts[review.id] ?? ''}
                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                                className="input-field"
                                style={{
                                  fontSize: '13px',
                                  minHeight: '60px',
                                  padding: '10px',
                                  borderRadius: 'var(--r-md)',
                                  resize: 'vertical',
                                  background: 'var(--bg)',
                                  border: '1px solid var(--border)'
                                }}
                              />
                              <button
                                onClick={() => handleReplyReview(review.id)}
                                disabled={submittingReplyId === review.id}
                                className="btn btn-primary clickable"
                                style={{
                                  alignSelf: 'flex-end',
                                  padding: '8px 16px',
                                  fontSize: '12.5px',
                                  fontWeight: 700,
                                  borderRadius: 'var(--r-md)',
                                  backgroundColor: 'var(--primary)',
                                  color: '#fff',
                                  border: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                {submittingReplyId === review.id ? 'Submitting...' : 'Submit Response'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 12: BLOG MANAGER ── */}
              {activeTab === 'blog' && (
                <div className="card animate-fade-in" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Blog Posts</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage blog posts and search engine optimization (pSEO) articles for your storefront.</p>
                    </div>
                    <button
                      onClick={() => setShowBlogForm(true)}
                      className="btn btn-primary clickable"
                      style={{
                        padding: '10px 20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        borderRadius: 'var(--r-md)',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Plus size={16} /> New Post
                    </button>
                  </div>

                  {blogPosts.length === 0 ? (
                    <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
                      <div className="empty-state__icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
                        <BookOpen size={28} strokeWidth={1.25} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>No blog posts yet</h3>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                        Create articles or tutorials to engage your storefront visitors and improve search ranking.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {blogPosts.map((post) => (
                        <div key={post.id} style={{
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  color: 'var(--primary)',
                                  background: 'rgba(var(--primary-rgb), 0.08)',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--r-full)',
                                  border: '1px solid var(--border)'
                                }}>
                                  {post.category}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  {post.read_time || '5 min read'}
                                </span>
                                {post.is_pseo ? (
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--accent)',
                                    background: 'rgba(var(--accent-rgb), 0.08)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--r-full)',
                                    border: '1px solid var(--border)'
                                  }}>
                                    Seeded pSEO
                                  </span>
                                ) : null}
                              </div>
                              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text)' }}>{post.title}</h3>
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{post.excerpt}</p>
                              <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: 8 }}>
                                By <b style={{ color: 'var(--text-muted)' }}>{post.is_pseo ? 'Front Store Team' : (store?.store_name || 'My Store')}</b>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteBlogPost(post.id)}
                              className="btn btn-outline clickable"
                              style={{
                                color: 'var(--danger)',
                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                background: 'none',
                                padding: '8px 12px',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                borderRadius: 'var(--r-md)'
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 13: AVAILABILITY ── */}
              {activeTab === 'availability' && (
                <div className="card animate-fade-in" style={{ padding: 28 }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={20} style={{ color: 'var(--primary)' }} /> Availability & Booking Settings
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Set your weekly working hours and how many bookings you accept per day.</p>
                  </div>

                  {/* Weekly Schedule Builder */}
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: 0.6, marginBottom: 14 }}>Weekly Schedule</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {DAYS_OF_WEEK.map(day => {
                        const slot = workingHours[day] || { open: '09:00', close: '17:00', enabled: false };
                        return (
                          <div key={day} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            background: slot.enabled ? 'var(--surface-2)' : 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: '12px 16px',
                            transition: 'background 0.2s'
                          }}>
                            {/* Toggle */}
                            <button
                              type="button"
                              onClick={() => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: !slot.enabled } }))}
                              style={{
                                flexShrink: 0,
                                width: 40,
                                height: 22,
                                borderRadius: 11,
                                border: 'none',
                                background: slot.enabled ? 'var(--primary)' : 'var(--border)',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              aria-label={`Toggle ${day}`}
                            >
                              <span style={{
                                position: 'absolute',
                                top: 3,
                                left: slot.enabled ? 20 : 3,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: '#fff',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                              }} />
                            </button>

                            {/* Day label */}
                            <span style={{ width: 42, fontSize: 13, fontWeight: 700, color: slot.enabled ? 'var(--text)' : 'var(--text-faint)' }}>
                              {DAY_LABELS[day]}
                            </span>

                            {slot.enabled ? (
                              <>
                                <input
                                  type="time"
                                  value={slot.open}
                                  onChange={e => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                                  className="input-field"
                                  style={{ width: 120, fontSize: 13, padding: '6px 10px' }}
                                />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>to</span>
                                <input
                                  type="time"
                                  value={slot.close}
                                  onChange={e => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                                  className="input-field"
                                  style={{ width: 120, fontSize: 13, padding: '6px 10px' }}
                                />
                              </>
                            ) : (
                              <span style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>Closed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Booking Cap */}
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: 0.6, marginBottom: 6 }}>Daily Booking Capacity</h3>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                      Maximum number of bookings you can accept on any single day. Once this limit is reached, that day becomes unavailable.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={bookingCapacityPerDay}
                        onChange={e => setBookingCapacityPerDay(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                        className="input-field"
                        style={{ width: 120, fontSize: 14 }}
                        placeholder="e.g. 10"
                      />
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>bookings / day</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={async () => {
                      if (!token) return;
                      try {
                        setAvailabilitySaving(true);
                        const res = await fetch(`${apiUrl}/v1/store`, {
                          method: 'PUT',
                          headers: getAuthHeaders(),
                          body: JSON.stringify({
                            working_hours: workingHours,
                            booking_capacity_per_day: Number(bookingCapacityPerDay) || 10,
                          }),
                        });
                        const json = await res.json();
                        if (!res.ok) throw new Error(json.message || 'Save failed.');
                        if (json.data) {
                          setStore(json.data);
                          localStorage.setItem('store', JSON.stringify(json.data));
                        }
                        toast.success('Availability settings saved!');
                      } catch (err: any) {
                        toast.error(err.message || 'Could not save availability.');
                      } finally {
                        setAvailabilitySaving(false);
                      }
                    }}
                    disabled={availabilitySaving}
                    className="btn btn-primary clickable"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 14, fontWeight: 700 }}
                  >
                    {availabilitySaving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                    {availabilitySaving ? 'Saving…' : 'Save Availability'}
                  </button>
                </div>
              )}

              {/* ── TAB 14: BOOKINGS ── */}
              {activeTab === 'bookings' && (
                <div className="card animate-fade-in" style={{ padding: 28 }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={20} style={{ color: 'var(--primary)' }} /> Bookings
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>All service bookings made by customers on your storefront.</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!token) return;
                        try {
                          setBookingsLoading(true);
                          const res = await fetch(`${apiUrl}/v1/bookings`, { headers: getAuthHeaders() });
                          const json = await res.json();
                          if (res.ok) setBookings(json.data?.data || json.data || []);
                          else toast.error(json.message || 'Failed to load bookings.');
                        } catch { toast.error('Network error.'); }
                        finally { setBookingsLoading(false); }
                      }}
                      className="btn btn-outline clickable"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, padding: '9px 18px' }}
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>

                  {bookingsLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                      <Loader2 size={28} className="spin" style={{ marginBottom: 12 }} />
                      <p style={{ fontSize: 13 }}>Loading bookings…</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
                        <Calendar size={28} strokeWidth={1.25} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No bookings yet</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
                        Customers who book your services will appear here. Click Refresh to load.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {bookings.map((booking: any) => {
                        const isPending  = booking.status === 'pending';
                        const isConfirmed = booking.status === 'confirmed';
                        const isCancelled = booking.status === 'cancelled';
                        const statusColor = isPending ? '#f59e0b' : isConfirmed ? 'var(--primary)' : 'var(--text-faint)';
                        const statusBg   = isPending ? 'rgba(245,158,11,0.1)' : isConfirmed ? 'var(--primary-light)' : 'var(--surface-2)';

                        return (
                          <div key={booking.id} style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: '16px 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 12,
                            alignItems: 'flex-start',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--r-full)', background: statusBg, color: statusColor, border: `1px solid ${statusColor}22` }}>
                                  {(booking.status || 'pending').toUpperCase()}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>#{booking.id?.slice(0, 8) || '—'}</span>
                              </div>
                              <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', margin: '2px 0' }}>
                                {booking.customer_name || 'Customer'}
                              </p>
                              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                                {booking.service_name || booking.product_name || 'Service'}
                              </p>
                              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                                <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                                {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' }) : '—'}
                                {booking.start_time ? `  ·  ${booking.start_time}` : ''}
                                {booking.end_time   ? ` – ${booking.end_time}` : ''}
                              </p>
                              {booking.customer_phone && (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                  <Phone size={11} style={{ display: 'inline', marginRight: 4 }} />{booking.customer_phone}
                                </p>
                              )}
                            </div>

                            {!isCancelled && (
                              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                {isPending && (
                                  <button
                                    disabled={bookingActionId === booking.id}
                                    onClick={async () => {
                                      try {
                                        setBookingActionId(booking.id);
                                        const res = await fetch(`${apiUrl}/v1/bookings/${booking.id}/confirm`, {
                                          method: 'POST',
                                          headers: getAuthHeaders()
                                        });
                                        const json = await res.json();
                                        if (!res.ok) throw new Error(json.message || 'Failed.');
                                        setBookings(prev => prev.map((b: any) => b.id === booking.id ? { ...b, status: 'confirmed' } : b));
                                        toast.success('Booking confirmed!');
                                      } catch (err: any) { toast.error(err.message); }
                                      finally { setBookingActionId(null); }
                                    }}
                                    className="btn btn-primary clickable"
                                    style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                  >
                                    {bookingActionId === booking.id ? <Loader2 size={12} className="spin" /> : <CheckCircle2 size={12} />}
                                    Confirm
                                  </button>
                                )}
                                <button
                                  disabled={bookingActionId === booking.id}
                                  onClick={async () => {
                                    try {
                                      setBookingActionId(booking.id);
                                      const res = await fetch(`${apiUrl}/v1/bookings/${booking.id}/cancel`, {
                                        method: 'POST',
                                        headers: getAuthHeaders()
                                      });
                                      const json = await res.json();
                                      if (!res.ok) throw new Error(json.message || 'Failed.');
                                      setBookings(prev => prev.map((b: any) => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                                      toast.success('Booking cancelled.');
                                    } catch (err: any) { toast.error(err.message); }
                                    finally { setBookingActionId(null); }
                                  }}
                                  className="btn btn-outline clickable"
                                  style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.25)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                >
                                  {bookingActionId === booking.id ? <Loader2 size={12} className="spin" /> : <X size={12} />}
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 21: TEAM & STAFF ── */}
              {activeTab === 'team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {!isPro ? (
                    <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <Users size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Team & Staff Management</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Add managers, sales agents, and support staff to run your store together. Set custom permissions, view login histories, and audit activity logs.
                        </p>
                      </div>
                      <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
                        🚀 Upgrade to Pro Plan
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={22} color="#fff" />
                          </div>
                          <div>
                            <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Team & Staff</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage staff members, custom roles, and security audit logs.</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button onClick={() => setIsCreateRoleOpen(true)} className="btn btn-outline clickable" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                            + Create Custom Role
                          </button>
                          <button onClick={() => setIsInviteStaffOpen(true)} className="btn btn-primary clickable" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                            + Invite Staff Member
                          </button>
                        </div>
                      </div>

                      {/* Sub-nav */}
                      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 1 }}>
                        {(['members', 'invites', 'roles', 'activity', 'login_history'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setTeamTab(t)}
                            className="clickable"
                            style={{
                              padding: '10px 16px',
                              fontSize: 13.5,
                              fontWeight: 700,
                              background: 'none',
                              border: 'none',
                              borderBottom: teamTab === t ? '2px solid var(--primary)' : 'none',
                              color: teamTab === t ? 'var(--text)' : 'var(--text-muted)',
                            }}
                          >
                            {t === 'members' && 'Staff Members'}
                            {t === 'invites' && 'Pending Invites'}
                            {t === 'roles' && 'Custom Roles'}
                            {t === 'activity' && 'Activity Logs'}
                            {t === 'login_history' && 'Login Histories'}
                          </button>
                        ))}
                      </div>

                      {/* Content Panels */}
                      {teamLoading ? (
                        <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
                      ) : (
                        <>
                          {teamTab === 'members' && (
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Name</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Email</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Role</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date Joined</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {teamData.owner && (
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{teamData.owner.name}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13 }}>{teamData.owner.email}</td>
                                      <td style={{ padding: '14px 18px' }}><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>Owner</span></td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>Original Creator</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>—</td>
                                    </tr>
                                  )}
                                  {teamData.staff?.map((member: any) => (
                                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{member.name}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13 }}>{member.email}</td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                                          {member.role?.name || 'Staff'}
                                        </span>
                                      </td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                                        {new Date(member.created_at).toLocaleDateString()}
                                      </td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <button
                                          onClick={async () => {
                                            if (!confirm('Are you sure you want to remove this team member?')) return;
                                            try {
                                              const res = await fetch(`${apiUrl}/v1/team/members/${member.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                                              if (res.ok) {
                                                toast.success('Team member removed.');
                                                fetchTeamData();
                                              } else {
                                                toast.error('Failed to remove team member.');
                                              }
                                            } catch { toast.error('Error removing team member.'); }
                                          }}
                                          className="clickable"
                                          style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {(!teamData.staff || teamData.staff.length === 0) && (
                                    <tr>
                                      <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                                        No staff members added yet. Invite your first employee above!
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {teamTab === 'invites' && (
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Email</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Role</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {teamInvitations.map((invite: any) => (
                                    <tr key={invite.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{invite.email}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13 }}>{invite.role?.name || 'Staff'}</td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <span className="badge" style={{ background: invite.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: invite.status === 'pending' ? '#d97706' : 'var(--danger)' }}>
                                          {invite.status}
                                        </span>
                                      </td>
                                      <td style={{ padding: '14px 18px' }}>
                                        <button
                                          onClick={async () => {
                                            try {
                                              const res = await fetch(`${apiUrl}/v1/team/invitations/${invite.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                                              if (res.ok) {
                                                toast.success('Invitation cancelled.');
                                                fetchTeamData();
                                              } else {
                                                toast.error('Failed to cancel invitation.');
                                              }
                                            } catch { toast.error('Error cancelling invitation.'); }
                                          }}
                                          className="clickable"
                                          style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                                        >
                                          Cancel
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {teamInvitations.length === 0 && (
                                    <tr>
                                      <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                                        No pending staff invitations.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {teamTab === 'roles' && (
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Role Name</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Granted Permissions</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {teamRoles.map((role: any) => (
                                    <tr key={role.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{role.name}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, maxWidth: 400 }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                          {role.permissions?.map((perm: string) => (
                                            <span key={perm} className="badge" style={{ background: 'var(--card-hover)', color: 'var(--text-muted)', fontSize: 11 }}>
                                              {perm}
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td style={{ padding: '14px 18px' }}>
                                        {role.store_id ? (
                                          <button
                                            onClick={async () => {
                                              if (!confirm('Are you sure you want to delete this custom role?')) return;
                                              try {
                                                const res = await fetch(`${apiUrl}/v1/team/roles/${role.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                                                if (res.ok) {
                                                  toast.success('Role deleted.');
                                                  fetchTeamData();
                                                } else {
                                                  toast.error('Failed to delete role.');
                                                }
                                              } catch { toast.error('Error deleting role.'); }
                                            }}
                                            className="clickable"
                                            style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                                          >
                                            Delete
                                          </button>
                                        ) : (
                                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>System Default</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {teamTab === 'activity' && (
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>User</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Details</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date & Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {teamActivityLogs.map((log: any) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{log.user?.name || 'System'}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13 }}><span className="badge" style={{ background: 'var(--card-hover)' }}>{log.action}</span></td>
                                      <td style={{ padding: '14px 18px', fontSize: 13 }}>{log.details}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                                        {new Date(log.created_at).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                  {teamActivityLogs.length === 0 && (
                                    <tr>
                                      <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                                        No activity history logged yet.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {teamTab === 'login_history' && (
                            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>User</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>IP Address</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Browser / Device</th>
                                    <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Login Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {teamLoginHistory.map((login: any) => (
                                    <tr key={login.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>{login.user?.name || 'User'}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13 }}>{login.ip_address}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{login.user_agent}</td>
                                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                                        {new Date(login.login_at).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                  {teamLoginHistory.length === 0 && (
                                    <tr>
                                      <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                                        No login histories logged yet.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB 22: FINANCE & PROFIT/EXPENSES ── */}
              {activeTab === 'finance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {!isPro ? (
                    <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <TrendingUp size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Profit & Expense Tracking</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Track item cost prices, capture day-to-day business expenses, and view real-time net profits, margins, and monthly sales growth metrics.
                        </p>
                      </div>
                      <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
                        🚀 Upgrade to Pro Plan
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} color="#fff" />
                          </div>
                          <div>
                            <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Profit & Expenses</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Financial dashboard, cost tracking, and expenses ledger.</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <select
                            value={financeRange}
                            onChange={(e: any) => setFinanceRange(e.target.value)}
                            className="input"
                            style={{ padding: '6px 12px', fontSize: 13.5, width: 140 }}
                          >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                          </select>
                          <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary clickable" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                            + Log Expense
                          </button>
                        </div>
                      </div>

                      {/* Cards Grid */}
                      {financeLoading || !financeSummary ? (
                        <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
                      ) : (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Net Profit</span>
                              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: financeSummary.net_profit >= 0 ? '#10b981' : 'var(--danger)' }}>
                                {store?.currency_code} {parseFloat(financeSummary.net_profit || 0).toLocaleString()}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                Margin: <strong style={{ color: '#10b981' }}>{financeSummary.profit_margin}%</strong>
                              </div>
                            </div>
                            <div className="card">
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Revenue (Paid Orders)</span>
                              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>
                                {store?.currency_code} {parseFloat(financeSummary.revenue || 0).toLocaleString()}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                Today: <strong>{store?.currency_code} {parseFloat(financeSummary.today_revenue || 0).toLocaleString()}</strong>
                              </div>
                            </div>
                            <div className="card">
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Expenses Recorded</span>
                              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: 'var(--danger)' }}>
                                {store?.currency_code} {parseFloat(financeSummary.expenses || 0).toLocaleString()}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                Today: <strong>{store?.currency_code} {parseFloat(financeSummary.today_expenses || 0).toLocaleString()}</strong>
                              </div>
                            </div>
                            <div className="card">
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Monthly Revenue Growth</span>
                              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: financeSummary.monthly_growth >= 0 ? '#10b981' : 'var(--danger)' }}>
                                {financeSummary.monthly_growth >= 0 ? '+' : ''}{financeSummary.monthly_growth}%
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>VS previous calendar month</span>
                            </div>
                          </div>

                          {/* Detail Split */}
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
                            {/* Expense Ledger */}
                            <div className="card" style={{ padding: 0 }}>
                              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Expense Ledger</h3>
                              </div>
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date</th>
                                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Category</th>
                                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Description</th>
                                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expenses.map((expense: any) => (
                                      <tr key={expense.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{expense.incurred_at}</td>
                                        <td style={{ padding: '14px 18px' }}>
                                          <span className="badge" style={{ background: 'var(--card-hover)' }}>{expense.category}</span>
                                        </td>
                                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{expense.description || 'No description'}</td>
                                        <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--danger)' }}>
                                          {store?.currency_code} {parseFloat(expense.amount).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 18px' }}>
                                          <button
                                            onClick={async () => {
                                              if (!confirm('Are you sure you want to delete this expense?')) return;
                                              try {
                                                const res = await fetch(`${apiUrl}/v1/finance/expenses/${expense.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                                                if (res.ok) {
                                                  toast.success('Expense record deleted.');
                                                  fetchFinanceData();
                                                }
                                              } catch { toast.error('Error deleting expense.'); }
                                            }}
                                            className="clickable"
                                            style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                                          >
                                            Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                      <tr>
                                        <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                                          No business expenses logged in this range.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Expenses breakdown */}
                            <div className="card">
                              <h3 style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 16 }}>Category Breakdown</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {['inventory', 'marketing', 'operations', 'staff', 'miscellaneous'].map(cat => {
                                  const totalCat = financeSummary.expenses_by_category?.find((c: any) => c.category === cat)?.total || 0;
                                  const pct = financeSummary.expenses > 0 ? (totalCat / financeSummary.expenses) * 100 : 0;
                                  return (
                                    <div key={cat}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                                        <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{cat}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{store?.currency_code} {parseFloat(totalCat).toLocaleString()} ({Math.round(pct)}%)</span>
                                      </div>
                                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--card-hover)', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: cat === 'inventory' ? '#6366f1' : cat === 'marketing' ? '#ec4899' : cat === 'operations' ? '#3b82f6' : '#10b981', borderRadius: 3 }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB 23: REFUND REQUESTS ── */}
              {activeTab === 'refunds' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
                  {!isPro ? (
                    <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <RefreshCw size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Refunds & Returns Management</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Allow customers to submit refund claims directly from their digital order status tracking page, review details, check evidence uploads, and approve payouts reversely.
                        </p>
                      </div>
                      <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
                        🚀 Upgrade to Pro Plan
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RefreshCw size={22} color="#fff" />
                        </div>
                        <div>
                          <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Refund Center</h2>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage customer disputes, return submissions, and reversal claims.</p>
                        </div>
                      </div>

                      {/* Stats */}
                      {refundStats && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                          <div className="card">
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Active Disputes</span>
                            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{refundStats.total_requests || 0}</div>
                          </div>
                          <div className="card">
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Approved Refunds</span>
                            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: '#10b981' }}>{refundStats.approved_refunds || 0}</div>
                          </div>
                          <div className="card">
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Refund Rate</span>
                            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: 'var(--danger)' }}>{refundStats.refund_rate}%</div>
                          </div>
                          <div className="card">
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Primary Reason</span>
                            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {refundStats.common_reasons?.[0]?.reason || 'None logged'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ledger */}
                      {refundLoading ? (
                        <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
                      ) : (
                        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Order ID</th>
                                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Reason</th>
                                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Notes</th>
                                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {refundRequests.map((ref: any) => (
                                <tr key={ref.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 750 }}>#{ref.order?.order_number}</td>
                                  <td style={{ padding: '14px 18px', fontSize: 13 }}>{ref.reason}</td>
                                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {ref.customer_notes || '—'}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800 }}>
                                    {store?.currency_code} {parseFloat(ref.amount).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '14px 18px' }}>
                                    <span className="badge" style={{
                                      background: ref.status === 'requested' ? 'rgba(245,158,11,0.1)' : ref.status === 'approved' || ref.status === 'refunded' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                      color: ref.status === 'requested' ? '#d97706' : ref.status === 'approved' || ref.status === 'refunded' ? '#10b981' : 'var(--danger)'
                                    }}>
                                      {ref.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '14px 18px' }}>
                                    <button
                                      onClick={() => {
                                        setSelectedRefundRequest(ref);
                                        setRefundMerchantNotes('');
                                        setIsRefundDetailsOpen(true);
                                      }}
                                      className="btn btn-outline clickable"
                                      style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
                                    >
                                      Review
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {refundRequests.length === 0 && (
                                <tr>
                                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                                    No refund requests found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── TAB 24: UNIFIED COMMUNICATIONS INBOX ── */}
              {activeTab === 'inbox' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="no-scrollbar animate-fade-in">
                  {!isPro ? (
                    <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--r-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}>
                        <Inbox size={28} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Unified Customer Communications Center</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                          Consolidate customer conversations from WhatsApp API, email logs, and storefront contact pages in one central inbox with custom message templates and slash-command quick replies.
                        </p>
                      </div>
                      <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
                        🚀 Upgrade to Pro Plan
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Grid layout */}
                      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: 20, height: 'calc(100vh - 200px)', minHeight: 560, alignItems: 'stretch' }}>
                        {/* 1. Conversations List Pane */}
                        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                          <h3 style={{ fontSize: 14.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Inbox size={16} /> Chats Inbox
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                            {conversations.map((c: any) => {
                              const active = activeConversation?.id === c.id;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => fetchConversationMessages(c.id)}
                                  className="clickable text-left"
                                  style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 'var(--r-md)',
                                    background: active ? 'var(--card-hover)' : 'none',
                                    border: active ? '1px solid var(--border)' : '1px solid transparent',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                                      {c.customer_name}
                                    </span>
                                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                                      {c.source === 'whatsapp' && '💬 WA'}
                                      {c.source === 'email' && '✉️ Email'}
                                      {c.source === 'contact_form' && '📄 Form'}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: 11.5, color: 'var(--text-muted)' }}>
                                    <span className="badge" style={{
                                      fontSize: 10,
                                      padding: '1px 6px',
                                      background: c.label === 'new' ? 'rgba(239,68,68,0.1)' : c.label === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                      color: c.label === 'new' ? 'var(--danger)' : c.label === 'pending' ? '#d97706' : '#10b981'
                                    }}>
                                      {c.label}
                                    </span>
                                    <span>{new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </button>
                              );
                            })}
                            {conversations.length === 0 && (
                              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 32 }}>No chats available.</p>
                            )}
                          </div>
                        </div>

                        {/* 2. Active Chat Content Pane */}
                        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          {activeConversation ? (
                            <>
                              {/* Header */}
                              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                <div>
                                  <h4 style={{ fontSize: 14.5, fontWeight: 900 }}>{activeConversation.customer_name}</h4>
                                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    Source: {activeConversation.source} · {activeConversation.customer_phone || activeConversation.customer_email}
                                  </p>
                                </div>
                                <select
                                  value={activeConversation.label}
                                  onChange={async (e: any) => {
                                    const nextLabel = e.target.value;
                                    try {
                                      const res = await fetch(`${apiUrl}/v1/inbox/conversations/${activeConversation.id}/label`, {
                                        method: 'PUT',
                                        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ label: nextLabel })
                                      });
                                      if (res.ok) {
                                        setActiveConversation((prev: any) => ({ ...prev, label: nextLabel }));
                                        fetchInboxData();
                                        toast.success('Conversation label updated');
                                      }
                                    } catch { toast.error('Error changing label'); }
                                  }}
                                  className="input"
                                  style={{ padding: '4px 8px', fontSize: 12, width: 110 }}
                                >
                                  <option value="new">New</option>
                                  <option value="pending">Pending</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </div>

                              {/* Chat message bubbles scroll */}
                              <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="no-scrollbar">
                                {activeConversationMessages.map((m: any) => {
                                  const self = m.sender === 'agent';
                                  const isAi = m.sender === 'ai';
                                  return (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
                                      <div style={{
                                        maxWidth: '70%',
                                        padding: '10px 14px',
                                        borderRadius: self ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                        background: self ? 'var(--primary)' : isAi ? 'rgba(99,102,241,0.08)' : 'var(--card-hover)',
                                        border: isAi ? '1px dashed rgba(99,102,241,0.25)' : 'none',
                                        color: self ? '#fff' : 'var(--text)',
                                      }}>
                                        {isAi && (
                                          <div style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 900, color: 'var(--primary)', marginBottom: 4 }}>
                                            🤖 AI Copilot Response
                                          </div>
                                        )}
                                        <p style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}>{m.message}</p>
                                        <div style={{ fontSize: 10, textAlign: self ? 'right' : 'left', color: self ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: 4 }}>
                                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Message Input dispatch */}
                              <form
                                onSubmit={async (e: React.FormEvent) => {
                                  e.preventDefault();
                                  if (!replyMessageText.trim()) return;
                                  try {
                                    const bodyText = replyMessageText;
                                    setReplyMessageText('');
                                    const res = await fetch(`${apiUrl}/v1/inbox/conversations/${activeConversation.id}/send`, {
                                      method: 'POST',
                                      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ message: bodyText })
                                    });
                                    const json = await res.json();
                                    if (res.ok) {
                                      setActiveConversationMessages(prev => [...prev, json.data]);
                                      fetchInboxData();
                                    } else {
                                      toast.error(json.message || 'Failed to dispatch.');
                                    }
                                  } catch { toast.error('Error sending reply.'); }
                                }}
                                style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}
                              >
                                <input
                                  type="text"
                                  value={replyMessageText}
                                  onChange={(e: any) => setReplyMessageText(e.target.value)}
                                  placeholder="Type response, use templates/replies panel..."
                                  className="input"
                                  style={{ flex: 1, padding: 10, fontSize: 13.5 }}
                                />
                                <button type="submit" className="btn btn-primary clickable" style={{ padding: '10px 20px', fontSize: 13.5, fontWeight: 700 }}>
                                  Send
                                </button>
                              </form>
                            </>
                          ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12, padding: 32 }}>
                              <MessageSquare size={32} />
                              <p style={{ fontSize: 14 }}>Select a conversation thread to view logs and reply.</p>
                            </div>
                          )}
                        </div>

                        {/* 3. Right Profile & Utilities Panel */}
                        <div className="card no-scrollbar" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                          {activeConversation ? (
                            <>
                              <div>
                                <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                  <div>Name: <strong>{activeConversation.customer_name}</strong></div>
                                  {activeConversation.customer_phone && <div>Phone: <strong>{activeConversation.customer_phone}</strong></div>}
                                  {activeConversation.customer_email && <div>Email: <strong>{activeConversation.customer_email}</strong></div>}
                                </div>
                              </div>
                              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quick Replies</h4>
                                  <button onClick={() => setIsAddQuickReplyOpen(true)} className="clickable" style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>+ Add</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {quickReplies.map((r: any) => (
                                    <button
                                      key={r.id}
                                      onClick={() => setReplyMessageText(r.message)}
                                      className="clickable text-left"
                                      style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', background: 'var(--card-hover)', border: '1px solid var(--border)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}
                                    >
                                      <span>{r.shortcut}</span>
                                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Use</span>
                                    </button>
                                  ))}
                                  {quickReplies.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No quick replies added yet.</span>}
                                </div>
                              </div>
                              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Templates</h4>
                                  <button onClick={() => setIsAddTemplateOpen(true)} className="clickable" style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>+ Add</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {messageTemplates.map((t: any) => (
                                    <button
                                      key={t.id}
                                      onClick={() => setReplyMessageText(t.content)}
                                      className="clickable text-left"
                                      style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', background: 'var(--card-hover)', border: '1px solid var(--border)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}
                                    >
                                      <span>{t.name}</span>
                                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Use</span>
                                    </button>
                                  ))}
                                  {messageTemplates.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No templates added.</span>}
                                </div>
                              </div>
                            </>
                          ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 16 }}>Select a thread to view customer properties.</p>
                          )}
                        </div>
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
                { id: 'inventory', label: 'Inventory', icon: <Archive size={18} /> },
                { id: 'invoices', label: 'Invoices', icon: <FileText size={18} /> },
                { id: 'receipts', label: 'Receipts', icon: <Receipt size={18} /> },
                { id: 'automations', label: 'Automations', icon: <Sparkles size={18} /> },
                { id: 'analytics', label: 'Pro Analytics', icon: <LineChart size={18} /> },
                { id: 'wallet', label: 'Wallet & Payouts', icon: <DollarSign size={18} /> },
                { id: 'whatsapp', label: 'WhatsApp Inbox', icon: <WhatsAppIcon size={18} /> },
                { id: 'inbox', label: 'Unified Inbox', icon: <Inbox size={18} /> },
                { id: 'team', label: 'Staff & Team', icon: <Users size={18} /> },
                { id: 'finance', label: 'Profit & Expenses', icon: <TrendingUp size={18} /> },
                { id: 'refunds', label: 'Refunds Center', icon: <RefreshCw size={18} /> },
                { id: 'share', label: 'Share & Earn', icon: <Share2 size={18} /> },
                { id: 'qr', label: 'My QR Code', icon: <QrCode size={18} /> },
                { id: 'reviews', label: 'Customer Reviews', icon: <Star size={18} /> },
                { id: 'blog', label: 'Blog Posts', icon: <BookOpen size={18} /> },
                { id: 'availability', label: 'Availability', icon: <Clock size={18} /> },
                { id: 'bookings', label: 'Bookings', icon: <Calendar size={18} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
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
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 28, zIndex: 10 }}>
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
                    disabled={withdrawalOtpSent || withdrawalSubmitting || withdrawalOtpLoading}
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={e => setWithdrawalAmount(e.target.value)}
                    className="input-field"
                    style={{ paddingRight: 80 }}
                    min="1"
                    step="0.01"
                    max={walletBalances.withdrawable_balance}
                  />
                  {!withdrawalOtpSent && (
                    <button
                      type="button"
                      disabled={withdrawalSubmitting || withdrawalOtpLoading}
                      onClick={() => setWithdrawalAmount(walletBalances.withdrawable_balance.toString())}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        border: 'none', background: 'var(--primary-light)', color: 'var(--primary)',
                        fontSize: 10.5, fontWeight: 800, padding: '4px 8px', borderRadius: 4, cursor: 'pointer'
                      }}
                    >
                      Withdraw All
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Withdrawable Balance: {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.withdrawable_balance)}</span>
                </div>
              </div>

              {withdrawalOtpSent && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                    WhatsApp OTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="6-digit code"
                    value={withdrawalOtpCode}
                    onChange={e => setWithdrawalOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field"
                    style={{ letterSpacing: '0.1em', fontWeight: 'bold' }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span>Check your WhatsApp for the verification code.</span>
                    <button
                      type="button"
                      onClick={handleSendWithdrawalOtp}
                      disabled={withdrawalOtpLoading}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', padding: 0, cursor: 'pointer' }}
                    >
                      {withdrawalOtpLoading ? 'Resending...' : 'Resend Code'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button
                  type="submit"
                  disabled={
                    withdrawalSubmitting || 
                    withdrawalOtpLoading ||
                    !withdrawalAmount || 
                    parseFloat(withdrawalAmount) <= 0 || 
                    parseFloat(withdrawalAmount) > walletBalances.withdrawable_balance ||
                    (withdrawalOtpSent && (!withdrawalOtpCode || withdrawalOtpCode.trim().length !== 6))
                  }
                  className="btn btn-primary clickable"
                  style={{ flex: 1, padding: 12 }}
                >
                  {withdrawalSubmitting ? (
                    <Loader2 size={16} className="spinner" style={{ margin: '0 auto' }} />
                  ) : withdrawalOtpLoading ? (
                    'Sending Code...'
                  ) : withdrawalOtpSent ? (
                    'Verify & Request Payout'
                  ) : (
                    'Send OTP Verification'
                  )}
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
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 28, zIndex: 10 }}>
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

      {/* ── MODAL: CREATE BLOG POST ── */}
      {showBlogForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setShowBlogForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 28, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Create New Blog Post
              </h3>
              <button onClick={() => setShowBlogForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, paddingRight: 4, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Skincare Routine Mistakes to Avoid"
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skincare"
                    value={blogCategory}
                    onChange={e => setBlogCategory(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 min read"
                    value={blogReadTime}
                    onChange={e => setBlogReadTime(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Excerpt (Short Summary)</label>
                <textarea
                  placeholder="Brief teaser of what the post is about..."
                  value={blogExcerpt}
                  onChange={e => setBlogExcerpt(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: 60, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cover Image (Optional)</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setBlogImageMode('url')}
                      className={`btn clickable`}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)', background: blogImageMode === 'url' ? 'var(--primary)' : 'var(--surface)', color: blogImageMode === 'url' ? '#fff' : 'var(--text-muted)', fontWeight: 700, border: '1px solid var(--border)' }}
                    >
                      🔗 URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogImageMode('upload')}
                      className={`btn clickable`}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)', background: blogImageMode === 'upload' ? 'var(--primary)' : 'var(--surface)', color: blogImageMode === 'upload' ? '#fff' : 'var(--text-muted)', fontWeight: 700, border: '1px solid var(--border)' }}
                    >
                      📁 Upload
                    </button>
                  </div>
                </div>

                {blogImageMode === 'url' ? (
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={blogImageUrl}
                    onChange={e => setBlogImageUrl(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                  />
                ) : (
                  <div>
                    <label
                      htmlFor="blog-image-upload"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '24px 16px',
                        border: '2px dashed var(--border)',
                        borderRadius: 'var(--r-md)',
                        cursor: blogImageUploading ? 'not-allowed' : 'pointer',
                        background: 'var(--bg)',
                        transition: 'border-color 0.2s',
                        opacity: blogImageUploading ? 0.7 : 1,
                      }}
                    >
                      {blogImageUploading ? (
                        <><Loader2 size={20} className="spinner" style={{ color: 'var(--primary)' }} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading...</span></>
                      ) : blogImageUrl && blogImageMode === 'upload' ? (
                        <>
                          <img src={blogImageUrl} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 'var(--r-sm)' }} />
                          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Click to replace</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={24} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Click to upload cover image</span>
                          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>JPG, PNG, WebP — max 5MB</span>
                        </>
                      )}
                    </label>
                    <input
                      id="blog-image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={blogImageUploading}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadBlogImage(file);
                        e.target.value = '';
                      }}
                    />
                    {blogImageUrl && blogImageMode === 'upload' && (
                      <button type="button" onClick={() => setBlogImageUrl('')} style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                        Remove image
                      </button>
                    )}
                  </div>
                )}
              </div>


              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Body Paragraphs</label>
                <textarea
                  required
                  placeholder="Write your article paragraphs here. Use a blank line (press Enter twice) to start a new paragraph."
                  value={blogBody}
                  onChange={e => setBlogBody(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: 180, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexShrink: 0 }}>
                <button type="button" onClick={() => setShowBlogForm(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={blogSubmitting} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {blogSubmitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE INVOICE ── */}
      {isAddInvoiceOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddInvoiceOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 600, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create New Invoice</h3>
              <button onClick={() => setIsAddInvoiceOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const total = invoiceItems.reduce((acc, it) => acc + (it.quantity * it.price), 0);
                const payload = {
                  customer_name: newInvoiceData.customer_name,
                  customer_email: newInvoiceData.customer_email || null,
                  customer_phone: newInvoiceData.customer_phone,
                  due_date: newInvoiceData.due_date,
                  notes: newInvoiceData.notes || null,
                  items: invoiceItems.filter(it => it.name.trim() !== ''),
                  total_amount: total
                };
                const res = await fetch(`${apiUrl}/v1/invoices`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  toast.success("Invoice created successfully.");
                  setIsAddInvoiceOpen(false);
                  fetchInvoicesData();
                } else {
                  const errorJson = await res.json();
                  toast.error(errorJson.message || "Failed to create invoice.");
                }
              } catch {
                toast.error("Network error creating invoice.");
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newInvoiceData.customer_name}
                  onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_name: e.target.value })}
                  className="form-control"
                  style={{ marginTop: 6 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Customer Email</label>
                  <input
                    type="email"
                    value={newInvoiceData.customer_email}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_email: e.target.value })}
                    className="form-control"
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={newInvoiceData.customer_phone}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, customer_phone: e.target.value })}
                    className="form-control"
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.due_date}
                    onChange={e => setNewInvoiceData({ ...newInvoiceData, due_date: e.target.value })}
                    className="form-control"
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8 }}>Invoice Items</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr auto', gap: 10, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        required
                        onChange={e => {
                          const next = [...invoiceItems];
                          next[idx].name = e.target.value;
                          setInvoiceItems(next);
                        }}
                        className="form-control"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        min={1}
                        required
                        onChange={e => {
                          const next = [...invoiceItems];
                          next[idx].quantity = parseInt(e.target.value) || 1;
                          setInvoiceItems(next);
                        }}
                        className="form-control"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        min={0}
                        required
                        onChange={e => {
                          const next = [...invoiceItems];
                          next[idx].price = parseFloat(e.target.value) || 0;
                          setInvoiceItems(next);
                        }}
                        className="form-control"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (invoiceItems.length > 1) {
                            setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
                          }
                        }}
                        style={{ border: 'none', background: 'none', color: 'var(--danger)' }}
                        className="clickable"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setInvoiceItems([...invoiceItems, { name: '', quantity: 1, price: 0 }])}
                  className="btn btn-outline clickable"
                  style={{ marginTop: 12, padding: '4px 10px', fontSize: 12 }}
                >
                  + Add Item
                </button>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Notes / Instructions</label>
                <textarea
                  value={newInvoiceData.notes}
                  onChange={e => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })}
                  className="form-control"
                  style={{ marginTop: 6, height: 60 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsAddInvoiceOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>Save Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADJUST INVENTORY STOCK ── */}
      {isAdjustStockOpen && adjustingProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAdjustStockOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 450, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Adjust Stock Count</h3>
              <button onClick={() => setIsAdjustStockOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>PRODUCT</span>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{adjustingProduct.name}</div>
              {adjustingVariant && (
                <div style={{ fontSize: 12.5, color: 'var(--primary)', marginTop: 2, fontWeight: 700 }}>
                  Variant: {adjustingVariant.size ? `Size ${adjustingVariant.size}` : ''} {adjustingVariant.color ? `Color ${adjustingVariant.color}` : ''}
                </div>
              )}
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const qtyVal = parseInt(adjustQty);
                if (isNaN(qtyVal)) return;

                const payload = {
                  product_id: adjustingProduct.id,
                  product_variant_id: adjustingVariant?.id || null,
                  quantity: qtyVal,
                  adjustment_type: adjustType,
                  reason: adjustReason || null
                };

                const res = await fetch(`${apiUrl}/v1/inventory/adjust`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });

                if (res.ok) {
                  toast.success("Stock count adjusted successfully.");
                  setIsAdjustStockOpen(false);
                  loadAllData(true); // Refresh product list for stock count
                  fetchInventoryLogsData(); // Refresh history
                } else {
                  const errorJson = await res.json();
                  toast.error(errorJson.message || "Failed to adjust stock.");
                }
              } catch {
                toast.error("Network error adjusting stock.");
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as any)}
                  className="form-control"
                  style={{ marginTop: 6 }}
                >
                  <option value="restock">Restock (Add to stock count)</option>
                  <option value="manual">Manual Adjustment (Set new exact count or deduct)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>
                  Quantity change value (e.g. 10 to add, -5 to deduct) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  placeholder="e.g. 5 or -2"
                  className="form-control"
                  style={{ marginTop: 6 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Reason / Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Damaged inventory or Restocking new batch"
                  className="form-control"
                  style={{ marginTop: 6 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsAdjustStockOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>Adjust Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PRODUCT OVERLAY ── */}
      {isAddProductOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddProductOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 680, padding: 28, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

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
                            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
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
                      {aiImageGenerating ? <Loader2 size={18} className="spinner" /> : <><ImageIcon size={18} /><span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>AI Gen</span></>}
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
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 680, padding: 28, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

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
                            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
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
                      {aiImageGenerating ? <Loader2 size={18} className="spinner" /> : <><ImageIcon size={18} /><span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>AI Gen</span></>}
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

      {/* ── MODAL: Selfie Liveness Verification ── */}
      {isSelfieModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsSelfieModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={18} /> Selfie Liveness Check
              </h3>
              <button onClick={() => setIsSelfieModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Position your face in the oval below and click Capture to simulate facial liveness verification.
            </p>

            <div style={{
              width: '100%',
              height: 240,
              background: '#000',
              borderRadius: 12,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* Silhouette Overlay */}
              <div style={{
                width: 140,
                height: 180,
                border: '2px dashed rgba(255,255,255,0.6)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                position: 'relative'
              }} />
              <div style={{ position: 'absolute', bottom: 12, color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4 }}>
                Simulated Camera Active
              </div>
            </div>

            <button
              onClick={handleSelfieSubmit}
              disabled={isSelfieLivenessVerifying}
              className="btn btn-primary clickable"
              style={{ padding: 12, borderRadius: 10, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {isSelfieLivenessVerifying ? <><Loader2 size={14} className="spinner animate-spin" /> Verifying Liveness...</> : 'Capture & Verify Selfie'}
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Business Registration Verification ── */}
      {isBusinessModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsBusinessModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={18} /> Verify Business Info (CAC)
              </h3>
              <button onClick={() => setIsBusinessModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Enter your official Corporate Affairs Commission (CAC) details to unlock Level 3/4 payouts.
            </p>

            <form onSubmit={handleBusinessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Business Name</label>
                <input
                  required
                  type="text"
                  placeholder="E.g. Frontstore Technologies Ltd"
                  value={businessCACName}
                  onChange={e => setBusinessCACName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>CAC Registration Number</label>
                <input
                  required
                  type="text"
                  placeholder="E.g. RC 1234567"
                  value={businessCACNumber}
                  onChange={e => setBusinessCACNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setIsBusinessModalOpen(false)} style={{ flex: 1, padding: 12, border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'transparent', fontWeight: 700, color: 'var(--text)' }} className="clickable">Cancel</button>
                <button type="submit" disabled={isSubmittingBusinessCAC} style={{ flex: 1, padding: 12, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }} className="clickable">
                  {isSubmittingBusinessCAC ? 'Submitting...' : 'Verify CAC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Dispute Resolution Chat Center ── */}
      {activeDisputeChat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setActiveDisputeChat(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626' }}>
                <Scale size={18} /> Dispute Resolution Chat
              </h3>
              <button onClick={() => setActiveDisputeChat(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <div style={{ background: 'var(--bg-2)', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 800, color: '#d97706' }}>{activeDisputeChat.status.replace(/_/g, ' ')}</span></div>
              <div><strong>Reason:</strong> {activeDisputeChat.reason.replace(/_/g, ' ').toUpperCase()}</div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6 }}>
                <strong>Buyer Explanation:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{activeDisputeChat.explanation}</p>
              </div>
            </div>

            {/* Chat Timeline logs */}
            <div style={{ height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg)' }}>
              {activeDisputeChat.messages && activeDisputeChat.messages.map((msg: any) => {
                const isMe = msg.sender_type === 'seller';
                return (
                  <div key={msg.id} style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: isMe ? 'var(--primary)' : 'var(--bg-2)',
                    color: isMe ? '#fff' : 'var(--text)',
                    padding: '8px 12px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '13px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.8, marginBottom: 2 }}>{msg.sender_name} ({msg.sender_type})</div>
                    <div>{msg.message}</div>
                  </div>
                );
              })}
            </div>

            {/* Message input & Actions */}
            {['resolved', 'refunded', 'closed'].includes(activeDisputeChat.status) ? (
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                This dispute has been resolved and closed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <form onSubmit={handleSendDisputeReply} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={disputeReplyText}
                    onChange={e => setDisputeReplyText(e.target.value)}
                    placeholder="Type message to buyer/admin..."
                    style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)' }}
                    required
                  />
                  <button type="submit" disabled={isSendingDisputeReply} style={{ width: 38, height: 38, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="clickable">
                    {isSendingDisputeReply ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={15} />}
                  </button>
                </form>

                <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleResolveDispute(activeDisputeChat.id)}
                    disabled={isResolvingDispute}
                    style={{ flex: 1, padding: 10, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}
                    className="clickable"
                  >
                    {isResolvingDispute ? 'Processing...' : 'Resolve & Release Payout'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRefundDispute(activeDisputeChat.id)}
                    disabled={isRefundingDispute}
                    style={{ flex: 1, padding: 10, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}
                    className="clickable"
                  >
                    {isRefundingDispute ? 'Processing...' : 'Refund Buyer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: INVITE STAFF MEMBER ── */}
      {isInviteStaffOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsInviteStaffOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 450, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Invite Staff Member</h3>
              <button onClick={() => setIsInviteStaffOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${apiUrl}/v1/team/invite`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: inviteEmail, phone_number: invitePhone, role_id: inviteRoleId || null })
                });
                const json = await res.json();
                if (res.ok) {
                  toast.success('Invitation sent!');
                  setIsInviteStaffOpen(false);
                  setInviteEmail('');
                  setInvitePhone('');
                  setInviteRoleId('');
                  fetchTeamData();
                } else {
                  toast.error(json.message || 'Failed to send invite.');
                }
              } catch { toast.error('Error sending invitation.'); }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Email Address</label>
                  <input type="email" value={inviteEmail} onChange={(e: any) => setInviteEmail(e.target.value)} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>WhatsApp Phone (Optional)</label>
                  <input type="text" value={invitePhone} onChange={(e: any) => setInvitePhone(e.target.value)} className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Select Role</label>
                  <select value={inviteRoleId} onChange={(e: any) => setInviteRoleId(e.target.value)} required className="input" style={{ width: '100%' }}>
                    <option value="">-- Choose Role --</option>
                    {teamRoles.map((role: any) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setIsInviteStaffOpen(false)} className="btn btn-outline clickable" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1 }}>Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE CUSTOM ROLE ── */}
      {isCreateRoleOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsCreateRoleOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 450, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create Custom Role</h3>
              <button onClick={() => setIsCreateRoleOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newRolePermissions.length === 0) {
                toast.warning('Please select at least one permission.');
                return;
              }
              try {
                const res = await fetch(`${apiUrl}/v1/team/roles`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newRoleName, permissions: newRolePermissions })
                });
                const json = await res.json();
                if (res.ok) {
                  toast.success('Custom role created!');
                  setIsCreateRoleOpen(false);
                  setNewRoleName('');
                  setNewRolePermissions([]);
                  fetchTeamData();
                } else {
                  toast.error(json.message || 'Failed to create role.');
                }
              } catch { toast.error('Error creating custom role.'); }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Role Name</label>
                  <input type="text" value={newRoleName} onChange={(e: any) => setNewRoleName(e.target.value)} required placeholder="e.g. Sales Representative" className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Select Permissions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                    {[
                      { id: 'manage team members', label: 'Manage Team Members' },
                      { id: 'view orders', label: 'View Orders' },
                      { id: 'edit orders', label: 'Edit / Process Orders & Refunds' },
                      { id: 'access analytics', label: 'View Profit & Expenses' },
                      { id: 'access customer data', label: 'Access Inbox & Customer Profile' }
                    ].map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newRolePermissions.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRolePermissions(prev => [...prev, p.id]);
                            } else {
                              setNewRolePermissions(prev => prev.filter(x => x !== p.id));
                            }
                          }}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setIsCreateRoleOpen(false)} className="btn btn-outline clickable" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1 }}>Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: LOG EXPENSE ── */}
      {isAddExpenseOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddExpenseOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 450, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Log Business Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${apiUrl}/v1/finance/expenses`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify(newExpense)
                });
                const json = await res.json();
                if (res.ok) {
                  toast.success('Expense logged successfully!');
                  setIsAddExpenseOpen(false);
                  setNewExpense({ amount: '', category: 'operations', description: '', incurred_at: new Date().toISOString().split('T')[0] });
                  fetchFinanceData();
                } else {
                  toast.error(json.message || 'Failed to log expense.');
                }
              } catch { toast.error('Error logging expense.'); }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Amount ({store?.currency_code})</label>
                  <input type="number" step="0.01" min="0.01" value={newExpense.amount} onChange={(e: any) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Category</label>
                  <select value={newExpense.category} onChange={(e: any) => setNewExpense(prev => ({ ...prev, category: e.target.value }))} required className="input" style={{ width: '100%' }}>
                    <option value="inventory">Inventory / Product Sourcing</option>
                    <option value="marketing">Marketing & Ads</option>
                    <option value="operations">Operations & Utilities</option>
                    <option value="staff">Staff Wages</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Date Incurred</label>
                  <input type="date" value={newExpense.incurred_at} onChange={(e: any) => setNewExpense(prev => ({ ...prev, incurred_at: e.target.value }))} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Description / Note</label>
                  <textarea value={newExpense.description} onChange={(e: any) => setNewExpense(prev => ({ ...prev, description: e.target.value }))} className="input" style={{ width: '100%', height: 60, resize: 'none' }} placeholder="e.g. Paid for Facebook ads campaign" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="btn btn-outline clickable" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1 }}>Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REVIEW REFUND REQUEST ── */}
      {isRefundDetailsOpen && selectedRefundRequest && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsRefundDetailsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Review Refund Request</h3>
              <button onClick={() => setIsRefundDetailsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18, fontSize: 13.5 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Order Number</span>
                <strong>#{selectedRefundRequest.order?.order_number}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Requested Reversal Amount</span>
                <strong style={{ color: 'var(--danger)' }}>{store?.currency_code} {parseFloat(selectedRefundRequest.amount).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Reason</span>
                <strong>{selectedRefundRequest.reason}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Customer Notes</span>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>{selectedRefundRequest.customer_notes || 'No customer notes provided.'}</p>
              </div>
              {selectedRefundRequest.evidence_url && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: 6 }}>Customer Proof / Evidence</span>
                  <a href={selectedRefundRequest.evidence_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={selectedRefundRequest.evidence_url} alt="Dispute evidence" style={{ maxHeight: 120, objectFit: 'contain' }} />
                  </a>
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Internal Merchant Notes</label>
                <textarea
                  value={refundMerchantNotes}
                  onChange={(e: any) => setRefundMerchantNotes(e.target.value)}
                  placeholder="Notes explaining approval or rejection reason..."
                  className="input"
                  style={{ width: '100%', height: 60, resize: 'none', fontSize: 13 }}
                />
              </div>
            </div>

            {selectedRefundRequest.status === 'requested' ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={async () => {
                    if (!refundMerchantNotes.trim()) {
                      toast.warning('Please enter rejection notes.');
                      return;
                    }
                    try {
                      const res = await fetch(`${apiUrl}/v1/refunds/${selectedRefundRequest.id}/reject`, {
                        method: 'POST',
                        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                        body: JSON.stringify({ merchant_notes: refundMerchantNotes })
                      });
                      if (res.ok) {
                        toast.success('Refund request rejected.');
                        setIsRefundDetailsOpen(false);
                        fetchRefundsData();
                      }
                    } catch { toast.error('Error rejecting refund.'); }
                  }}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
                  Reject Claim
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to approve this refund and reverse the funds?')) return;
                    try {
                      const res = await fetch(`${apiUrl}/v1/refunds/${selectedRefundRequest.id}/approve`, {
                        method: 'POST',
                        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                        body: JSON.stringify({ merchant_notes: refundMerchantNotes })
                      });
                      if (res.ok) {
                        toast.success('Refund request approved. Funds reversed.');
                        setIsRefundDetailsOpen(false);
                        fetchRefundsData();
                      }
                    } catch { toast.error('Error approving refund.'); }
                  }}
                  className="btn btn-primary clickable"
                  style={{ flex: 1, background: '#10b981' }}
                >
                  Approve & Refund
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsRefundDetailsOpen(false)} className="btn btn-outline clickable" style={{ width: '100%' }}>Close View</button>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE QUICK REPLY ── */}
      {isAddQuickReplyOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddQuickReplyOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create Quick Reply</h3>
              <button onClick={() => setIsAddQuickReplyOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${apiUrl}/v1/inbox/quick-replies`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify({ shortcut: newQuickReplyShortcut, message: newQuickReplyMessage })
                });
                if (res.ok) {
                  toast.success('Quick reply created.');
                  setIsAddQuickReplyOpen(false);
                  setNewQuickReplyShortcut('');
                  setNewQuickReplyMessage('');
                  fetchInboxData();
                }
              } catch { toast.error('Error saving quick reply'); }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Shortcut Keyword</label>
                  <input type="text" placeholder="/thanks" value={newQuickReplyShortcut} onChange={(e: any) => setNewQuickReplyShortcut(e.target.value)} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Reply Message Content</label>
                  <textarea value={newQuickReplyMessage} onChange={(e: any) => setNewQuickReplyMessage(e.target.value)} required className="input" style={{ width: '100%', height: 80, resize: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setIsAddQuickReplyOpen(false)} className="btn btn-outline clickable" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE MESSAGE TEMPLATE ── */}
      {isAddTemplateOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddTemplateOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create Message Template</h3>
              <button onClick={() => setIsAddTemplateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }} className="clickable"><X size={18} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${apiUrl}/v1/inbox/templates`, {
                  method: 'POST',
                  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newTemplateName, content: newTemplateContent })
                });
                if (res.ok) {
                  toast.success('Template saved successfully.');
                  setIsAddTemplateOpen(false);
                  setNewTemplateName('');
                  setNewTemplateContent('');
                  fetchInboxData();
                }
              } catch { toast.error('Error saving message template'); }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Template Name</label>
                  <input type="text" placeholder="Greeting / FAQ" value={newTemplateName} onChange={(e: any) => setNewTemplateName(e.target.value)} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Template Content</label>
                  <textarea value={newTemplateContent} onChange={(e: any) => setNewTemplateContent(e.target.value)} required className="input" style={{ width: '100%', height: 100, resize: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setIsAddTemplateOpen(false)} className="btn btn-outline clickable" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary clickable" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
