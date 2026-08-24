// Shared dashboard domain types — moved out of dashboard/page.tsx so extracted
// tab components (src/components/dashboard/*Tab.tsx) can import them without
// pulling in the monolith itself.

export interface UserInfo {
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

export interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

export interface StoreInfo {
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
  reviews_intro_text?: string | null;
  faq_help_text?: string | null;
  about_intro_text?: string | null;
  portfolio_intro_text?: string | null;
  policy_bookings?: string | null;
  policy_products?: string | null;
  policy_refunds?: string | null;
  announcement_title?: string | null;
  announcement_body?: string | null;
  announcement_cta_label?: string | null;
  announcement_cta_page?: string | null;
  is_online_only?: boolean;
  shipping_type?: string | null;
  shipping_flat_fee?: number | string | null;
  shipping_free_threshold?: number | string | null;
  shipping_handling_fee?: number | string | null;
  shipping_custom_rules?: { min_subtotal: number | string; fee: number | string }[] | null;
  storefront_sections?: string[] | null;
  reply_time_minutes?: number | null;
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

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
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

export interface OrderItem {
  id: string;
  product_name: string;
  product_price: number | string;
  quantity: number;
}

export interface Order {
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

export interface DashboardStats {
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

export interface BroadcastCampaign {
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

export type PayoutStatus = 'processing' | 'scheduled' | 'paid' | 'under_review';

export interface PayoutStatusSummary {
  state: PayoutStatus;
  next_payout_at: string | null;
}

export type DashboardTab =
  | 'overview' | 'orders' | 'products' | 'whatsapp' | 'share' | 'qr' | 'templates'
  | 'settings' | 'billing' | 'wallet' | 'reach' | 'reviews' | 'blog' | 'availability'
  | 'bookings' | 'invoices' | 'receipts' | 'payment-links' | 'inventory'
  | 'automations' | 'analytics' | 'team' | 'finance' | 'refunds' | 'inbox' | 'coupons'
  | 'affiliates' | 'integrations' | 'customers';
