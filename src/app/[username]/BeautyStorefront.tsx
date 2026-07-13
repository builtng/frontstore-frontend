'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store as StoreIcon, Search as SearchIcon, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft, Megaphone, Truck, ShieldCheck, Navigation, Lock, Plus, Minus, Copy, Instagram, Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell, Receipt, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast as sonnerToast } from "sonner";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { calculateShippingFee } from "../../utils/shippingFee";
import { storePath } from "../../utils/storePath";
import { InstagramIcon, TikTokIcon } from "../../components/SocialIcons";
import { captureAffiliateRef, getPersistedAffiliateRef } from "../../lib/affiliate";

const EXTENSION_SUBSTRING_ERROR = "Cannot read properties of undefined (reading 'substring')";

if (typeof window !== "undefined") {
  const suppressInjectedSubstringError = (event: ErrorEvent) => {
    const stack = event.error?.stack || "";
    const source = event.filename || "";
    if (
      event.message === EXTENSION_SUBSTRING_ERROR &&
      (stack.includes("chrome-extension://egjidjbpglichdcondbcbdnbeeppgdph/") ||
        source.includes("chrome-extension://egjidjbpglichdcondbcbdnbeeppgdph/"))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  window.addEventListener("error", suppressInjectedSubstringError, true);
}

// --- Types & Interfaces ---
interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface Store {
  reviews_intro_text?: string | null;
  faq_help_text?: string | null;
  about_intro_text?: string | null;
  portfolio_intro_text?: string | null;
  policy_bookings?: string | null;
  policy_products?: string | null;
  policy_refunds?: string | null;
  id: string;
  username: string;
  store_name: string;
  store_bio: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  currency_code: string;
  whatsapp_phone: string;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle?: string | null;
  is_verified?: boolean | number;
  custom_links?: StoreLink[] | null;
  primary_color?: string | null;
  store_template?: string | null;
  is_pro?: boolean | number;
  business_persona?: string | null;
  location?: string | null;
  since?: string | null;
  address?: string | null;
  working_hours?: any;
  announcement_title?: string | null;
  announcement_body?: string | null;
  announcement_cta_label?: string | null;
  announcement_cta_page?: string | null;
  rating?: number | null;
  review_count?: number | null;
  total_orders?: number | string | null;
  reply_time_minutes?: number | null;
  storefront_sections?: string[] | null;
  phone?: string | null;
  email?: string | null;
  // Founder details
  founder_name?: string | null;
  founder_role?: string | null;
  founder_bio?: string | null;
  founder_avatar_url?: string | null;
  founder_quote?: string | null;
  founder_socials?: any;
  founder_credentials?: any;
  founder_specialities?: any;
  recognition?: any;
  about_facts?: any;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  description: string | null;
  image_urls: string[] | null;
  stock_status: string;
  category_id: string | null;
  is_digital?: boolean;
  type?: 'service' | 'product';
  duration_minutes?: number | null;
}

interface Review {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
}

interface StoreFaq {
  id: string;
  question: string;
  answer: string;
}

interface CreatedOrderReceipt {
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    payment_status: string;
    order_status: string;
    delivery_method: string;
    delivery_address: string;
  };
  whatsapp_url: string;
}

interface BeautyStorefrontProps {
  username: string;
  store: Store;
  categories: Category[];
  products: Product[];
  reviews: Review[];
  faqs: StoreFaq[];
  portfolio?: any[];
  blog?: any[];
  systemDomain: string;
  storeDisclaimer: string;
  appName: string;
}

interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'service' | 'product';
  slot?: string;
  slotId?: string;
  duration?: number;
  image_url?: string;
}

type HourTuple = [string, string];

const DEFAULT_HOURS: HourTuple[] = [
  ["Mon", "9:00am - 7:00pm"],
  ["Tue", "9:00am - 7:00pm"],
  ["Wed", "9:00am - 7:00pm"],
  ["Thu", "9:00am - 7:00pm"],
  ["Fri", "9:00am - 8:00pm"],
  ["Sat", "10:00am - 6:00pm"],
  ["Sun", "Closed"],
];

const DAY_KEYS: Record<string, string> = {
  mon: "Mon",
  monday: "Mon",
  tue: "Tue",
  tues: "Tue",
  tuesday: "Tue",
  wed: "Wed",
  wednesday: "Wed",
  thu: "Thu",
  thur: "Thu",
  thurs: "Thu",
  thursday: "Thu",
  fri: "Fri",
  friday: "Fri",
  sat: "Sat",
  saturday: "Sat",
  sun: "Sun",
  sunday: "Sun",
};

const EMPTY_SECTION_MESSAGE = "Nothing to see here, comeback later";

function normalizeWorkingDay(value: unknown) {
  if (value === null || value === undefined) return "";
  try {
    const key = String(value).trim().toLowerCase();
    return DAY_KEYS[key] || DAY_KEYS[key.slice(0, 3)] || "";
  } catch {
    return "";
  }
}

function normalizeWorkingHoursValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Closed";
}

function parseWorkingHourItem(item: unknown): HourTuple | null {
  if (Array.isArray(item)) {
    const day = normalizeWorkingDay(item[0]);
    return day ? [day, normalizeWorkingHoursValue(item[1])] : null;
  }

  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  const day = normalizeWorkingDay(record.d ?? record.day ?? record.name);
  if (!day) return null;

  const open = record.o ?? record.open;
  const close = record.c ?? record.close;
  const hours = open && close
    ? `${String(open)} - ${String(close)}`
    : normalizeWorkingHoursValue(record.hours ?? record.value ?? record.time);

  return [day, hours];
}

function parseWorkingHours(workingHours: unknown): HourTuple[] {
  try {
    const hoursMap: Record<string, string> = Object.fromEntries(DEFAULT_HOURS);
    let source = workingHours;

    if (typeof source === "string") {
      if (!source.trim()) return DEFAULT_HOURS;
      source = JSON.parse(source);
    }

    const items: unknown[] = [];
    if (Array.isArray(source)) {
      items.push(...source);
    } else if (source && typeof source === "object") {
      for (const [day, value] of Object.entries(source as Record<string, unknown>)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          items.push({ day, ...(value as Record<string, unknown>) });
        } else {
          items.push([day, value]);
        }
      }
    }

    for (const item of items) {
      const parsed = parseWorkingHourItem(item);
      if (parsed) hoursMap[parsed[0]] = parsed[1];
    }

    return DEFAULT_HOURS.map(([day]) => [day, hoursMap[day]]);
  } catch {
    return DEFAULT_HOURS;
  }
}

// Tiktok Icon component matching template
function Tiktok({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// WhatsApp Icon component matching template
function WhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

// Media category color themes
const CAT_THEMES: Record<string, string[]> = {
  Lashes: ["#b14a6e", "#d27695"],
  Brows: ["#7c2f4d", "#a85273"],
  Skincare: ["#b07d3a", "#d4a657"],
  Aftercare: ["#9a6079", "#bd86a0"],
  Gifting: ["#5e2a44", "#8a4567"],
};

function getCategoryTheme(catName: string) {
  const normalized = catName.trim();
  for (const k of Object.keys(CAT_THEMES)) {
    if (normalized.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(normalized.toLowerCase())) {
      return CAT_THEMES[k];
    }
  }
  return CAT_THEMES.Lashes;
}

// Desktop mode hook
function useIsDesktop() {
  const q = "(min-width: 980px)";
  const [d, setD] = useState(typeof window !== "undefined" ? window.matchMedia(q).matches : false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const fn = (e: MediaQueryListEvent) => setD(e.matches);
    m.addEventListener ? m.addEventListener("change", fn) : m.addListener(fn);
    return () => { m.removeEventListener ? m.removeEventListener("change", fn) : m.removeListener(fn); };
  }, []);
  return d;
}

export default function BeautyStorefront({
  username,
  store,
  categories,
  products,
  reviews,
  faqs,
  portfolio = [],
  blog = [],
  systemDomain,
  storeDisclaimer,
  appName,
}: BeautyStorefrontProps) {
  const isDesktop = useIsDesktop();
  const router = useRouter();

  // --- Theme configuration ---
  const customBrandColor = store.primary_color || '#b14a6e';
  const customBrandDeep = store.primary_color ? `color-mix(in srgb, ${store.primary_color} 80%, black)` : '#7c2f4d';
  const customTint = store.primary_color ? `color-mix(in srgb, ${store.primary_color} 14%, white)` : '#f6e4ea';

  const storeStyleTheme = {
    '--brand': customBrandColor,
    '--brand-deep': customBrandDeep,
    '--tint': customTint,
  } as React.CSSProperties;

  // --- Dynamic Store Stats & Open status ---
  const hours = useMemo(() => parseWorkingHours(store?.working_hours), [store?.working_hours]);
  const hasHours = useMemo(() => {
    const wh = store?.working_hours;
    if (!wh) return false;
    if (typeof wh === "string") return wh.trim().length > 0;
    if (Array.isArray(wh)) return wh.length > 0;
    if (typeof wh === "object") return Object.keys(wh).length > 0;
    return false;
  }, [store?.working_hours]);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const openToday = hasHours && (hours[todayIdx][1] || "").toLowerCase() !== "closed";
  const hoursForDate = (d: Date) => hours[(d.getDay() + 6) % 7][1];
  const parseClock = (s: string) => {
    const m = s.trim().match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!m) return 0;
    let h = (+m[1]) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return h * 60 + (+m[2]);
  };
  const fmtMins = (min: number) => {
    const h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "pm" : "am", hh = h % 12 || 12;
    return `${hh}:${String(m).padStart(2, "0")}${ap}`;
  };

  const isOpen = useMemo(() => {
    const todayHrs = hours[todayIdx][1];
    if (todayHrs === "Closed") return false;
    const [o, c] = todayHrs.split(" - ");
    const openMin = parseClock(o), closeMin = parseClock(c);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= openMin && nowMin < closeMin;
  }, [hours, todayIdx]);

  // --- Dynamic Announcement ---
  const announcement = useMemo(() => {
    if (store.announcement_title || store.announcement_body) {
      return {
        title: store.announcement_title || 'Announcement',
        body: store.announcement_body || '',
        cta: store.announcement_cta_label ? { label: store.announcement_cta_label, page: store.announcement_cta_page || 'services' } : null
      };
    }
    return null;
  }, [store]);

  // --- Dynamic Products & Services ---
  const displayItems = useMemo(() => {
    if (products && products.length > 0) {
      return products.map(p => {
        const isService = p.type === 'service';
        const catObj = categories.find(c => c.id === p.category_id);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: isService ? 'service' as const : 'product' as const,
          cat: catObj ? catObj.name : 'General',
          price: parseFloat(p.price),
          duration: p.duration_minutes || 60,
          stock: p.stock_status === 'in_stock' ? 'in' as const : (p.stock_status === 'low_stock' ? 'low' as const : 'out' as const),
          desc: p.description || '',
          popular: p.compare_at_price ? true : false,
          image_url: p.image_urls?.[0] || null,
        };
      });
    }
    return [];
  }, [products, categories]);

  const SERVICES = useMemo(() => displayItems.filter(i => i.type === 'service'), [displayItems]);
  const PRODUCTS = useMemo(() => displayItems.filter(i => i.type === 'product'), [displayItems]);

  // --- Dynamic Reviews ---
  const displayReviews = useMemo(() => {
    return (reviews || []).map(r => ({
      id: r.id,
      name: r.reviewer_name,
      r: r.rating,
      when: "Verified Order",
      service: "Store order",
      verified: true,
      photos: 0,
      text: r.body,
      response: null
    }));
  }, [reviews]);

  // --- Dynamic FAQs ---
  const displayFaqs = useMemo(() => {
    return (faqs || []).map(f => [f.question, f.answer]);
  }, [faqs]);

  // --- Dynamic Portfolio ---
  const displayPortfolio = useMemo(() => {
    return (portfolio || []).map(p => ({
      label: p.label || p.title || "Portfolio Item",
      cat: p.category || "General",
      c: p.image_url ? "" : "c0",
      image_url: p.image_url || null,
      ba: !!p.is_before_after,
      before_image_url: p.before_image_url || null,
      after_image_url: p.after_image_url || null,
    }));
  }, [portfolio]);

  // --- Dynamic Blog ---
  const displayBlog = useMemo(() => {
    return (blog || []).map(b => ({
      title: b.title,
      date: b.published_at ? new Date(b.published_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently",
      cat: b.category || "Updates",
      read: b.read_time || "5 min",
      excerpt: b.excerpt || "",
      body: Array.isArray(b.body) ? b.body : [],
      image_url: b.image_url || null,
      is_pseo: !!b.is_pseo,
    }));
  }, [blog]);

  // --- Founder details & recognition ---
  const AUTHOR = {
    name: store.founder_name || "",
    initial: (store.founder_name || store.store_name || "S")[0].toUpperCase(),
    role: store.founder_role || "",
    bio: store.founder_bio || "",
    long: store.founder_bio || "",
    quote: store.founder_quote || "",
    socials: { instagram: store.instagram_handle || "", tiktok: store.tiktok_handle || "" },
    specialities: store.founder_specialities || [],
    credentials: store.founder_credentials || [],
  };

  const getPostAuthorName = (post: any) => {
    if (post.is_pseo) {
      return store.store_name;
    }
    return store.founder_name || AUTHOR.name || store.store_name;
  };

  const getPostAuthorInitial = (post: any) => {
    const name = getPostAuthorName(post);
    return (name || "S")[0].toUpperCase();
  };

  const recognition = store.recognition || [];
  const aboutFacts = (store.about_facts || []) as [string, string][];

  // --- Global state variables ---
  const [page, setPage] = useState("home");
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookSvc, setBookSvc] = useState<any>(null);
  const [bookStep, setBookStep] = useState<"service" | "date" | "time" | "review">("service");
  const [bookDate, setBookDate] = useState<Date | null>(null);
  const [bookTime, setBookTime] = useState<string | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookNote, setBookNote] = useState("");
  const [calMonth, setCalMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyTopics, setNotifyTopics] = useState(["services", "products", "offers", "news"]);
  const [bagOpen, setBagOpen] = useState(false);
  const [bag, setBag] = useState<CartItem[]>([]);
  const [share, setShare] = useState(false);
  const [annOff, setAnnOff] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [faqQuery, setFaqQuery] = useState("");
  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  // Contact state
  const [cName, setCName] = useState("");
  const [cMsg, setCMsg] = useState("");
  const [cSvc, setCSvc] = useState("");
  const [cDate, setCDate] = useState("");

  // Filter query states
  const [query, setQuery] = useState("");
  const [svcQuery, setSvcQuery] = useState("");
  const [svcCat, setSvcCat] = useState("All");
  const [svcDur, setSvcDur] = useState("All");
  const [svcSort, setSvcSort] = useState("popular");
  const [svcFaq, setSvcFaq] = useState(0);
  const [prodQuery, setProdQuery] = useState("");
  const [prodCat, setProdCat] = useState("All");
  const [prodPrice, setProdPrice] = useState("All");
  const [prodSort, setProdSort] = useState("popular");
  const [prodFaq, setProdFaq] = useState(0);
  const [revStar, setRevStar] = useState(0);
  const [revSort, setRevSort] = useState("recent");
  const [revPhotos, setRevPhotos] = useState(false);

  // Review submissions
  const [reviewOpen, setReviewOpen] = useState(false);
  const [revRating, setRevRating] = useState(0);
  const [revText, setRevText] = useState("");
  const [revRef, setRevRef] = useState("");
  const [revPhoto, setRevPhoto] = useState<string | null>(null);

  // Active blog & portfolio filter Category lists
  const [blogCat, setBlogCat] = useState("All");
  const [pfCat, setPfCat] = useState("All");
  const [post, setPost] = useState<any>(null);
  const [toast, setToast] = useState("");

  // Live Slots States
  const [apiSlots, setApiSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Checkout flows
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'digital'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Pending WhatsApp disclaimer
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const ping = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };
  const go = (p: string) => { setPost(null); setPage(p); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPost = (p: any) => { setPost(p); setPage("post"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const currencySymbol = useMemo(() => {
    const symbols: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$', EUR: '€', GBP: '£' };
    return symbols[store.currency_code] || `${store.currency_code} `;
  }, [store.currency_code]);
  const money = (n: number) => currencySymbol + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const copyUrl = () => {
    const link = `${window.location.origin}/${store.username}`;
    navigator.clipboard?.writeText(link);
    ping("Store link copied");
  };

  // Persistent Cart Loading
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`frontstore_cart_${store.username}`);
      if (saved) {
        setBag(JSON.parse(saved));
      }
    } catch { }
  }, [store.username]);

  // Load Saved Client Profile
  useEffect(() => {
    captureAffiliateRef();
    try {
      const savedProfile = localStorage.getItem('frontstore_customer_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone_number) setCustomerPhone(parsed.phone_number);
        if (parsed.whatsapp_number) setCustomerWhatsapp(parsed.whatsapp_number);
        if (parsed.email) setCustomerEmail(parsed.email);
        if (parsed.preferred_delivery_address) setDeliveryAddress(parsed.preferred_delivery_address);
      }
    } catch { }
  }, []);

  const saveCartToStorage = (newBag: CartItem[]) => {
    try {
      localStorage.setItem(`frontstore_cart_${store.username}`, JSON.stringify(newBag));
    } catch { }
  };

  const addBag = (it: typeof displayItems[0]) => {
    setBag((b) => {
      const ex = b.find((x) => x.key === "p" + it.id);
      let nextBag;
      if (ex) {
        nextBag = b.map((x) => (x.key === "p" + it.id ? { ...x, qty: x.qty + 1 } : x));
      } else {
        nextBag = [...b, { key: "p" + it.id, id: it.id, name: it.name, price: it.price, qty: 1, type: "product" as const, image_url: it.image_url || undefined }];
      }
      saveCartToStorage(nextBag);
      return nextBag;
    });
    ping("Added to bag");
  };

  const openWhatsAppChat = (message: string) => {
    const phone = store.whatsapp_phone.replace(/\D/g, '');
    setPendingWaUrl(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  const primaryCta = useMemo(() => {
    return { label: "Book a slot", Icon: Calendar, run: () => openBooking() };
  }, []);

  // Fetch live slots when service or bookOpen details change
  useEffect(() => {
    if (!bookSvc) {
      setApiSlots([]);
      return;
    }
    setLoadingSlots(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
    fetch(`${API_URL}/v1/public/store/${store.username}/slots?product_id=${bookSvc.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          setApiSlots(json.data);
        }
      })
      .catch(err => console.error("Error fetching slots:", err))
      .finally(() => setLoadingSlots(false));
  }, [bookSvc, store.username]);

  const openBooking = (svc?: any) => {
    const resolved = svc ? (SERVICES.find((s) => s.id === svc.id) || svc) : null;
    setBookSvc(resolved);
    setBookStep(resolved ? "date" : "service");
    setBookDate(null); setBookTime(null); setBookName(""); setBookNote("");
    setCalMonth(new Date());
    setDrawer(false);
    setBookOpen(true);
  };

  const confirmBooking = () => {
    if (!bookSvc || !bookDate || !bookTime) return;

    // Find slot UUID if matching active live slots
    const dateStr = `${bookDate.getFullYear()}-${String(bookDate.getMonth() + 1).padStart(2, '0')}-${String(bookDate.getDate()).padStart(2, '0')}`;
    const slotObj = apiSlots.find(s => s.slot_date === dateStr && s.start_time === bookTime);
    const slotIdVal = slotObj && slotObj.id ? slotObj.id : undefined;

    setBag((b) => {
      const nextBag = [...b, {
        key: "s" + bookSvc.id + dateStr + bookTime,
        id: bookSvc.id,
        name: bookSvc.name,
        price: bookSvc.price,
        qty: 1,
        type: "service" as const,
        slot: `${bookDate.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}, ${bookTime}`,
        slotId: slotIdVal,
        duration: bookSvc.duration,
        image_url: bookSvc.image_url || undefined
      }];
      saveCartToStorage(nextBag);
      return nextBag;
    });

    setBookOpen(false);
    ping("Appointment added to order");
  };

  const changeQty = (key: string, d: number) => {
    setBag((b) => {
      const nextBag = b.map((x) => (x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x));
      saveCartToStorage(nextBag);
      return nextBag;
    });
  };

  const removeItem = (key: string) => {
    setBag((b) => {
      const nextBag = b.filter((x) => x.key !== key);
      saveCartToStorage(nextBag);
      return nextBag;
    });
  };

  // Dynamic booking slots UI
  const bookingFlow = () => {
    const titles = { service: "Choose a service", date: "Choose a date", time: "Choose a time", review: "Confirm booking" };
    const backTo: Record<string, "service" | "date" | "time" | "review"> = { date: "service", time: "date", review: "time" };
    const onBack = backTo[bookStep] ? () => setBookStep(backTo[bookStep]) : undefined;
    const deposit = bookSvc ? Math.max(2000, Math.round((bookSvc.price * 0.2) / 500) * 500) : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 90);

    const y = calMonth.getFullYear(), mo = calMonth.getMonth();
    const monthStart = new Date(y, mo, 1);
    const offset = (monthStart.getDay() + 6) % 7;
    const dim = new Date(y, mo + 1, 0).getDate();

    const prevOff = monthStart.getFullYear() <= today.getFullYear() && monthStart.getMonth() <= today.getMonth();
    const nextOff = monthStart.getFullYear() >= horizon.getFullYear() && monthStart.getMonth() >= horizon.getMonth();

    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(y, mo, d));

    // Determine if date c is enabled
    const isDateEnabled = (c: Date) => {
      if (c < today || c > horizon) return false;
      const dateStr = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`;
      if (apiSlots.length > 0) {
        return apiSlots.some(s => s.slot_date === dateStr && !s.is_full);
      }
      return hoursForDate(c) !== "Closed";
    };

    // Slots times selection list
    const slots = (() => {
      if (!bookSvc || !bookDate) return [];
      const dateStr = `${bookDate.getFullYear()}-${String(bookDate.getMonth() + 1).padStart(2, '0')}-${String(bookDate.getDate()).padStart(2, '0')}`;
      if (apiSlots.length > 0) {
        return apiSlots.filter(s => s.slot_date === dateStr && !s.is_full).map(s => s.start_time);
      }

      const h = hoursForDate(bookDate);
      if (h === "Closed") return [];
      const [o, c] = h.split(" - ");
      const open = parseClock(o), close = parseClock(c);
      const out = [];
      for (let t = open; t <= close - bookSvc.duration; t += 60) {
        out.push(fmtMins(t));
      }
      return out;
    })();

    const svcBar = bookSvc && (
      <div className="bk-svcbar">
        <span><b>{bookSvc.name}</b><i>{bookSvc.duration} min <span className="ps-dot">•</span> {money(bookSvc.price)}</i></span>
        <button onClick={() => setBookStep("service")}>Change</button>
      </div>
    );

    return (
      <Sheet onClose={() => setBookOpen(false)} onBack={onBack} title={titles[bookStep]}>
        {bookStep === "service" && (
          <>
            <p className="ps-sheet-sub">Pick the treatment you would like to book.</p>
            <div className="bk-svclist">
              {SERVICES.map((s) => (
                <button key={s.id} className="bk-svc" onClick={() => { setBookSvc(s); setBookStep("date"); }}>
                  <span className={`bk-thumb ${getCategoryTheme(s.cat)[0]}`} style={{ background: getCategoryTheme(s.cat)[0] }}><Calendar size={18} /></span>
                  <span className="bk-svc-main"><b>{s.name}</b><i>{s.cat} <span className="ps-dot">•</span> {s.duration} min</i></span>
                  <span className="bk-svc-price">{money(s.price)} <ChevronRight size={15} /></span>
                </button>
              ))}
            </div>
          </>
        )}

        {bookStep === "date" && (
          <>
            {svcBar}
            {loadingSlots ? (
              <div style={{ display: 'grid', placeItems: 'center', height: 160 }}>
                <span className="spinner" style={{ border: '2px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', width: 24, height: 24, animation: 'spin 0.6s linear infinite' }} />
              </div>
            ) : (
              <div className="bk-cal">
                <div className="bk-cal-head">
                  <button disabled={prevOff} onClick={() => !prevOff && setCalMonth(new Date(y, mo - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
                  <b>{calMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b>
                  <button disabled={nextOff} onClick={() => !nextOff && setCalMonth(new Date(y, mo + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
                </div>
                <div className="bk-cal-wd">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => <span key={w}>{w}</span>)}</div>
                <div className="bk-cal-grid">
                  {cells.map((c, i) => {
                    if (!c) return <span key={"b" + i} className="bk-cal-blank" />;
                    const active = isDateEnabled(c);
                    const sel = bookDate && c.toDateString() === bookDate.toDateString();
                    return (
                      <button key={i} disabled={!active} className={`bk-cal-day${sel ? " sel" : ""}${!active ? " off" : ""}`}
                        onClick={() => { setBookDate(c); setBookTime(null); setBookStep("time"); }}>{c.getDate()}</button>
                    );
                  })}
                </div>
                <p className="ps-deposit"><Lock size={12} /> Closed days and past dates cannot be selected. You can book up to three months ahead.</p>
              </div>
            )}
          </>
        )}

        {bookStep === "time" && (
          <>
            {svcBar}
            <p className="ps-field-lbl">{bookDate ? bookDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : ""}</p>
            {slots.length > 0 ? (
              <div className="bk-times">
                {slots.map((timeStr) => (
                  <button key={timeStr} className="bk-slot" onClick={() => { setBookTime(timeStr); setBookStep("review"); }}>{timeStr}</button>
                ))}
              </div>
            ) : (
              <p className="bk-empty">No times available on this day. Try another date.</p>
            )}
          </>
        )}

        {bookStep === "review" && bookSvc && bookDate && bookTime && (
          <>
            {svcBar}
            <div className="bk-summary">
              <div><span>Date</span><b>{bookDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</b></div>
              <div><span>Time</span><b>{bookTime}</b></div>
              <div><span>Duration</span><b>{bookSvc.duration} min</b></div>
              <div><span>Total</span><b>{money(bookSvc.price)}</b></div>
            </div>
            <div className="bk-deposit-row"><span><Lock size={13} /> Deposit to secure</span><b>{money(deposit)}</b></div>
            <p className="ps-deposit">Frontstore holds your deposit until your appointment, then the {money(bookSvc.price - deposit)} balance is due in person. Covered by buyer protection.</p>
            <button className="ps-sheet-cta" onClick={confirmBooking}>Add appointment to order</button>
          </>
        )}
      </Sheet>
    );
  };

  // Submit dynamic checkout order & bookings
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setCheckoutError('Name and WhatsApp number are required.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
    const serviceItems = bag.filter(x => x.type === 'service');
    let compiledAddress = deliveryAddress;
    if (serviceItems.length > 0) {
      const slotDetails = serviceItems.map(x => `${x.name} booking: ${x.slot}`).join(', ');
      compiledAddress = `Booking details: ${slotDetails}` + (deliveryAddress ? ` | Session Location: ${deliveryAddress}` : '');
    }

    // Submit live booking slots to backend first
    const bookingItems = bag.filter(x => x.type === 'service' && x.slotId);
    for (const bItem of bookingItems) {
      try {
        await fetch(`${API_URL}/v1/public/store/${store.username}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot_id: bItem.slotId,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail || undefined,
            notes: compiledAddress
          })
        });
      } catch (err) {
        console.error("Failed to register live booking slot on backend:", err);
      }
    }

    try {
      const res = await fetch(`${API_URL}/v1/public/store/${store.username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          customer_whatsapp: customerWhatsapp || customerPhone,
          delivery_method: serviceItems.length > 0 ? (deliveryAddress ? 'delivery' : 'pickup') : deliveryMethod,
          delivery_address: compiledAddress || 'None specified',
          items: bag.map(item => ({
            product_id: item.id,
            quantity: item.qty
          })),
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
          affiliate_code: getPersistedAffiliateRef()
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit order.');
      }

      // Save customer profile locally
      try {
        localStorage.setItem('frontstore_customer_profile', JSON.stringify({
          name: customerName,
          phone_number: customerPhone,
          whatsapp_number: customerWhatsapp || customerPhone,
          email: customerEmail || null,
          preferred_delivery_method: deliveryMethod,
          preferred_delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
        }));
      } catch { }

      setBag([]);
      saveCartToStorage([]);
      setOrderReceipt(json.data);
      setCheckoutStep('cart');
      setToast('Order created successfully!');
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!orderReceipt) return;
    setIsPaying(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
    try {
      const res = await fetch(`${API_URL}/v1/public/orders/${orderReceipt.order.id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Payment initialization failed.');
      }
      const redirectUrl = json.data?.authorization_url || json.data?.checkout_url || json.data?.link;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('Secure payment link unavailable.');
      }
    } catch (err: any) {
      sonnerToast.error(err.message || 'Failed to initialize payment.');
    } finally {
      setIsPaying(false);
    }
  };

  // Submit review form
  const submitReview = async () => {
    if (!revRating || !revRef.trim()) {
      ping("Add a rating and your order reference");
      return;
    }
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
    try {
      const res = await fetch(`${API_URL}/v1/public/orders/${revRef}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews: [
            {
              rating: revRating,
              comment: revText || undefined
            }
          ]
        })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to submit review");
      }
      setReviewOpen(false);
      setRevRating(0);
      setRevText("");
      setRevRef("");
      setRevPhoto(null);
      ping("Thank you, your review has been submitted");
    } catch (err: any) {
      sonnerToast.error(err.message || "Failed to submit review. Make sure the order reference is correct and order is paid.");
    }
  };

  // --- Search results & filters computation ---
  const svcFiltered = SERVICES
    .filter((s) => (svcCat === "All" || s.cat === svcCat) &&
      (svcDur === "All" || (svcDur === "short" && s.duration < 60) || (svcDur === "mid" && s.duration >= 60 && s.duration <= 120) || (svcDur === "long" && s.duration > 120)) &&
      (svcQuery.trim() === "" || (s.name + " " + s.desc + " " + s.cat).toLowerCase().includes(svcQuery.trim().toLowerCase())))
    .sort((a, b) => (svcSort === "priceAsc" ? a.price - b.price : svcSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const svcHasFilters = svcCat !== "All" || svcDur !== "All" || svcQuery.trim() !== "";
  const clearSvc = () => { setSvcQuery(""); setSvcCat("All"); setSvcDur("All"); setSvcSort("popular"); };
  const catColor = (cat: string) => "c" + (categories.findIndex(c => c.name === cat) % 4);

  const prodFiltered = PRODUCTS
    .filter((p) => (prodCat === "All" || p.cat === prodCat) &&
      (prodPrice === "All" || (prodPrice === "lo" && p.price < 10000) || (prodPrice === "mid" && p.price >= 10000 && p.price <= 15000) || (prodPrice === "hi" && p.price > 15000)) &&
      (prodQuery.trim() === "" || (p.name + " " + p.desc + " " + p.cat).toLowerCase().includes(prodQuery.trim().toLowerCase())))
    .sort((a, b) => (prodSort === "priceAsc" ? a.price - b.price : prodSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const prodHasFilters = prodCat !== "All" || prodPrice !== "All" || prodQuery.trim() !== "";
  const clearProd = () => { setProdQuery(""); setProdCat("All"); setProdPrice("All"); setProdSort("popular"); };
  const prodColor = (cat: string) => "c" + (categories.findIndex(c => c.name === cat) % 4);

  const blogCats = [...new Set(displayBlog.map((b) => b.cat))];
  const blogList = blogCat === "All" ? displayBlog : displayBlog.filter((b) => b.cat === blogCat);

  const pfCats = [...new Set(displayPortfolio.map((p) => p.cat))];
  const pfList = pfCat === "All" ? displayPortfolio : displayPortfolio.filter((p) => p.cat === pfCat);

  const faqId = (c: string) => "faq-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const termId = (c: string) => "tm-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // FAQs Filter
  const faqFiltered = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) {
      return [
        { cat: "Booking and appointments", icon: Calendar, items: displayFaqs.slice(0, 3) },
        { cat: "Payments and deposits", icon: Lock, items: displayFaqs.slice(1, 4) },
      ];
    }
    return [
      {
        cat: "Search results", icon: SearchIcon, items: displayFaqs.filter(([qa, ans]) => (qa + " " + ans).toLowerCase().includes(q))
      }
    ].filter(g => g.items.length > 0);
  }, [faqQuery, displayFaqs]);

  const revFiltered = displayReviews
    .filter((rv) => (revStar === 0 || rv.r === revStar) && (!revPhotos || rv.photos > 0))
    .sort((a, b) => (revSort === "high" ? b.r - a.r : revSort === "low" ? a.r - b.r : 0));
  const revPhotoTiles = displayReviews.filter((rv) => rv.photos > 0).flatMap((rv) => Array.from({ length: rv.photos }).map((_, i) => rv.id + i)).slice(0, 8);

  const bagCount = bag.reduce((n, b) => n + b.qty, 0);
  const bagTotal = bag.reduce((n, b) => n + b.qty * b.price, 0);
  const shippingPreview = calculateShippingFee(store, bagTotal);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/v1/public/store/${store.username}/coupons/${couponCodeInput.trim()}/validate`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const minOrder = parseFloat(json.data.min_order_amount);
        if (minOrder > 0 && bagTotal < minOrder) {
          setCouponError(`This coupon requires a minimum order of ${money(minOrder)}`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(json.data);
          ping('Coupon applied!');
        }
      } else {
        setCouponError(json.message || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError('Error validating coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      const minOrder = parseFloat(appliedCoupon.min_order_amount);
      if (minOrder > 0 && bagTotal < minOrder) {
        setAppliedCoupon(null);
        setCouponError(`Coupon removed: subtotal is below minimum order.`);
      }
    }
  }, [bagTotal, appliedCoupon]);

  const homeServices = SERVICES.slice(0, 4);
  const homeProducts = PRODUCTS.slice(0, 4);

  /* ---- Shared pure elements ---- */
  const servicesGrid = (gClass: string, list: typeof SERVICES) => (
    <div className={gClass}>{(list || SERVICES).map((s) => <ServiceCard key={s.id} s={s} onBook={() => openBooking(s)} />)}</div>
  );
  const productsGrid = (gClass: string, list: typeof PRODUCTS) => (
    <div className={gClass}>{(list || PRODUCTS).map((p) => <ProductCard key={p.id} p={p} onBuy={() => addBag(p)} />)}</div>
  );

  const RatingSummary = () => {
    if (displayReviews.length === 0 && !store.rating && !store.review_count) {
      return <EmptyState />;
    }
    const bars = [["5", 80], ["4", 14], ["3", 3], ["2", 2], ["1", 1]];
    const overallRating = store.rating || (displayReviews.reduce((s, x) => s + x.r, 0) / displayReviews.length);
    return (
      <div className="ps-rating">
        <div className="ps-rating-score">
          <b>{overallRating.toFixed(1)}</b>
          <div className="ps-rating-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className="f" />)}</div>
          <span>Excellent</span>
          <i>{store.review_count || displayReviews.length} reviews</i>
        </div>
        <div className="ps-rating-bars">
          {bars.map(([n, w]) => (
            <div key={n} className="ps-bar"><span>{n}</span><div><i style={{ width: w + "%" }} /></div></div>
          ))}
        </div>
      </div>
    );
  };

  const reviewsBody = () => (
    <>
      <p className="svc-intro">Every review here comes from a verified order on Frontstore. The studio can respond, but cannot remove genuine reviews.</p>
      <RatingSummary />
      <button className="rev-leave rev-leave-m" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
      <div className="rev-trust rev-trust-m">
      <ShieldCheck size={14} /> Reviews are from verified orders.
      {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && ` The studio typically responds in ~${store.reply_time_minutes} min.`}
    </div>
      {revPhotoTiles.length > 0 && (
        <div className="rev-photostrip">
          <h4>Customer photos</h4>
          <div className="rev-photos">{revPhotoTiles.map((k, i) => <button key={k} className={`rev-ph c${i % 3}`} onClick={() => ping("Opening photo")} aria-label="Photo" />)}</div>
        </div>
      )}
      <div className="rev-filter-m">
        {[5, 4, 3].map((n) => <button key={n} className={revStar === n ? "on" : ""} onClick={() => setRevStar(revStar === n ? 0 : n)}>{n} <Star size={11} className="f" /></button>)}
        <button className={revPhotos ? "on" : ""} onClick={() => setRevPhotos(!revPhotos)}>With photos</button>
      </div>
      <div className="svc-results-head">
        <b>{revFiltered.length} {revFiltered.length === 1 ? "review" : "reviews"}</b>
        {(revStar !== 0 || revPhotos) && <button className="svc-clear" onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear</button>}
      </div>
      {displayReviews.length === 0 ? (
        <EmptyState />
      ) : revFiltered.length > 0 ? (
        <div className="rev-list rev-list-m">{revFiltered.map((rv) => <ReviewCardRich key={rv.id} rv={rv} />)}</div>
      ) : <div className="svc-empty">No reviews match your filters.<button onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button></div>}
    </>
  );

  const aboutFounderBody = () => (
    <>
      <span className="ab-kicker">Meet the founder</span>
      <h3 className="ab-name">{AUTHOR.name}</h3>
      {AUTHOR.role && <span className="ab-role">{AUTHOR.role}</span>}
      {store.is_verified && <span className="ab-verified"><BadgeCheck size={14} /> Verified by Frontstore</span>}
      <p className="ab-bio">{AUTHOR.long}</p>
      <div className="ab-chips">{AUTHOR.specialities.map((s: any) => <span key={s}>{s}</span>)}</div>
      {AUTHOR.credentials.length > 0 && (
        <div className="ab-creds">
          <span className="ab-creds-h">Training and credentials</span>
          <ul>{AUTHOR.credentials.map((c: any) => <li key={c}><Check size={14} /> {c}</li>)}</ul>
        </div>
      )}
      {AUTHOR.quote && <p className="ab-quote">"{AUTHOR.quote}"</p>}
      <div className="ab-socials">
        {AUTHOR.socials.instagram && <button onClick={() => window.open(`https://instagram.com/${AUTHOR.socials.instagram.replace(/^@/, '')}`, '_blank')}><Instagram size={16} /> {AUTHOR.socials.instagram}</button>}
        {AUTHOR.socials.tiktok && <button onClick={() => window.open(`https://tiktok.com/@${AUTHOR.socials.tiktok.replace(/^@/, '')}`, '_blank')}><Tiktok size={16} /> {AUTHOR.socials.tiktok}</button>}
      </div>
    </>
  );

  const aboutWork = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">Our work</h4>
        <button className="ab-seclink" onClick={() => go("portfolio")}>See more <ChevronRight size={14} /></button>
      </div>
      <div className="ab-gallery">
        {displayPortfolio.slice(0, 6).map((g, index) => (
          <button key={index} className={`ab-shot c${index % 3}`} onClick={() => go("portfolio")}>
            {g.image_url ? <img src={g.image_url} alt={g.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            <span className="ab-shot-cap">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const aboutFeatured = () => {
    if (!recognition.length) return null;
    return (
    <div className="ab-featured">
      <span className="ab-featured-h"><Award size={14} /> As seen in and trusted by</span>
      <div className="ab-featured-row">
        {recognition.map((r: any) => <span key={r} className="ab-logo">{r}</span>)}
      </div>
    </div>
  );
  };

  const aboutReview = () => {
    const best = displayReviews.find((r) => r.r === 5);
    if (!best) return null;
    return (
      <div className="ab-review">
        <span className="ab-quote-mark"><Quote size={36} fill="currentColor" /></span>
        <p className="ab-review-text">"{best.text}"</p>
        <div className="ab-review-foot">
          <div className="ab-review-by">
            <span className="ab-review-av">{best.name[0]}</span>
            <div><b>{best.name}</b><span>Verified client</span></div>
          </div>
          <button className="ab-review-all" onClick={() => go("reviews")}>See all reviews <ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  const aboutJournal = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">From the journal</h4>
        <button className="ab-seclink" onClick={() => go("blog")}>All articles <ChevronRight size={14} /></button>
      </div>
      <div className="ab-journal">
        {displayBlog.slice(0, 3).map((b) => (
          <button key={b.title} className="ab-journal-item" onClick={() => openPost(b)}>
            <span className="ab-journal-cat">{b.cat}</span>
            <b>{b.title}</b>
            <span className="ab-journal-meta">{b.read} read · {b.date}</span>
          </button>
        ))}
      </div>
      <p className="ab-journal-note">We share routines, prep guides and notes from the studio twice a month.</p>
    </div>
  );

  const aboutBody = () => (
    <>
      <span className="ab-kicker">Our story</span>
      <h2 className="ab-headline">{store.store_name}</h2>
      {store.store_bio ? <p className="ab-lede">{store.store_bio}</p> : <EmptyState />}
      {store.founder_name && (
        <div className="ab-founder ab-founder-m">
          <div className="ab-portrait">
            {store.founder_avatar_url ? <img src={store.founder_avatar_url} alt={AUTHOR.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="ab-portrait-mono">{AUTHOR.initial}</span>}
            <span className="ab-portrait-tag">Founder</span>
          </div>
          <div className="ab-founder-body">{aboutFounderBody()}</div>
        </div>
      )}
      {displayPortfolio.length > 0 && aboutWork()}
      {recognition.length > 0 && aboutFeatured()}
      <div className="ab-section">
        <h4 className="ab-subhead">What we offer</h4>
        <div className="ab-offer-grid ab-grid-m">
          <button className="ab-offer-card" onClick={() => go("services")}>
            <b>Services</b>
            <p>Glams, facials, and protective styling.</p>
            <span className="ab-offer-link">View services <ChevronRight size={14} /></span>
          </button>
          <button className="ab-offer-card" onClick={() => go("products")}>
            <b>Products</b>
            <p>Professional clean beauty ranges.</p>
            <span className="ab-offer-link">Shop products <ChevronRight size={14} /></span>
          </button>
        </div>
      </div>
      <div className="ab-section">
        <h4 className="ab-subhead">Good to know</h4>
        {aboutFacts.length > 0 ? (
          <div className="ab-facts ab-facts-m">
            {aboutFacts.map(([k, v]) => (
              <div className="ab-fact" key={k}><span className="ab-fact-k">{k}</span><span className="ab-fact-v">{v}</span></div>
            ))}
          </div>
        ) : <EmptyState />}
      </div>
      {aboutReview()}
      {displayBlog.length > 0 && aboutJournal()}
      <div className="ps-about-grid">
        {store.total_orders ? <div><b>{store.total_orders}</b><span>orders delivered</span></div> : null}
        {store.rating ? <div><b>{store.rating.toFixed(1)}</b><span>average rating</span></div> : null}
        {store.since && <div><b>{new Date().getFullYear() - parseInt(store.since)} yrs</b><span>in practice</span></div>}
      </div>
      <div className="ab-follow">
        <span className="ab-follow-h">Follow the studio</span>
        <div className="ab-socials">
          {(store.instagram_handle || AUTHOR.socials.instagram) && <button onClick={() => window.open(`https://instagram.com/${(store.instagram_handle || AUTHOR.socials.instagram).replace(/^@/, '')}`, '_blank')}><Instagram size={16} /> {store.instagram_handle ? `@${store.instagram_handle.replace(/^@/, '')}` : AUTHOR.socials.instagram}</button>}
          {(store.tiktok_handle || AUTHOR.socials.tiktok) && <button onClick={() => window.open(`https://tiktok.com/@${(store.tiktok_handle || AUTHOR.socials.tiktok).replace(/^@/, '')}`, '_blank')}><Tiktok size={16} /> {store.tiktok_handle ? `@${store.tiktok_handle.replace(/^@/, '')}` : AUTHOR.socials.tiktok}</button>}
          <button onClick={() => openWhatsAppChat("Hi!")}><WhatsApp size={16} /> WhatsApp</button>
        </div>
      </div>
      <button className="ab-book-m" onClick={() => openBooking()}><Calendar size={16} /> Book a treatment</button>
    </>
  );

  const faqSections = () => (
    <div className="faq-groups">
      {faqFiltered.length === 0 && (
        <div className="faq-empty">No questions match that search. Try another word, or message the studio below.</div>
      )}
      {faqFiltered.map((g) => {
        const Icon = g.icon;
        return (
          <section key={g.cat} id={faqId(g.cat)} className="faq-group">
            <h3 className="faq-group-head"><Icon size={16} /> {g.cat}</h3>
            <div className="ps-acc">
              {g.items.map(([q, a]) => {
                const key = g.cat + q;
                const isOpen = faqOpen === key;
                return (
                  <div key={q} className={`ps-acc-item ${isOpen ? "open" : ""}`}>
                    <button onClick={() => setFaqOpen(isOpen ? null : key)}>{q}<ChevronDown size={17} /></button>
                    {isOpen && <p>{a}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );

  const faqHelp = () => (
    <div className="faq-help">
      <b style={{ fontFamily: 'Fraunces' }}>Still need help?</b>
      <p>{store.faq_help_text || "Message the studio directly and we will get back to you, usually in ~10 min."}</p>
      <button className="faq-help-cta" onClick={() => openWhatsAppChat("Hello, I have a question about my booking.")}><WhatsApp size={15} /> Message on WhatsApp</button>
    </div>
  );

  const faqBody = () => (
    <>
      <div className="faq-search faq-search-m">
        <SearchIcon size={15} />
        <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions" />
      </div>
      {faqSections()}
      {faqHelp()}
    </>
  );

  const contactChannels = () => (
    <div className="ct-channels">
      <button className="ct-wa" onClick={() => openWhatsAppChat("Hi! I have a question about your treatments.")}><WhatsApp size={18} /> Chat on WhatsApp</button>
      <div className="ct-alt">
        <button onClick={() => window.location.href = `mailto:${store.email || `${store.username || 'hello'}@frontstore.ng`}`}><Mail size={15} /> {store.email || `${store.username || 'hello'}@frontstore.ng`}</button>
        {store.whatsapp_phone && <button onClick={() => window.location.href = `tel:${store.whatsapp_phone}`}><Phone size={15} /> {store.whatsapp_phone}</button>}
      </div>
    </div>
  );

  const contactForm = () => (
    <div className="ct-form">
      <h4 className="ab-subhead">Send an enquiry</h4>
      <p className="ct-form-sub">Tell us what you are after and we will reply by email. A real person will answer.</p>
      <div className="ct-form-row">
        <select className="ct-input" value={cSvc} onChange={(e) => setCSvc(e.target.value)}>
          <option value="">Service (optional)</option>
          {SERVICES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          <option value="Not sure yet">Not sure yet</option>
        </select>
        <input type="date" className="ct-input" value={cDate} onChange={(e) => setCDate(e.target.value)} aria-label="Preferred date" />
      </div>
      <input className="ct-input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Your name" />
      <textarea className="ct-input ct-textarea" rows={4} value={cMsg} onChange={(e) => setCMsg(e.target.value)} placeholder="Any details, like your preferred time or the look you have in mind." />
      <button className="ct-send" onClick={() => { if (!cName.trim() || !cMsg.trim()) { ping("Please add your name and a short note"); return; } window.location.href = `mailto:${store.email || `${store.username || 'hello'}@frontstore.ng`}`; }}><Mail size={16} /> Send email</button>
      <p className="ct-form-note">This opens your email app with the details ready to send.</p>
    </div>
  );

  const contactVisit = () => {
    const todayHrs = hours[todayIdx][1];
    const openToday = todayHrs !== "Closed";
    return (
      <div className="ct-visit">
        <div className="ab-rail-h"><MapPin size={15} /> Visit the studio</div>
        {store.location && <div className="ct-map"><span className="ct-map-pin"><MapPin size={15} /></span><span className="ct-map-label">{store.location}</span></div>}
        {store.address && <p className="ab-addr">{store.address}</p>}
        {store.address && <button className="ps-dir" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address as string)}`, '_blank')}><Navigation size={15} /> Directions</button>}
        <div className="ct-hours">
          <div className="ct-hours-head">
            <b>Opening hours</b>
            {hasHours && <span className={`ct-open ${openToday ? "" : "closed"}`}><span className="dot" /> {openToday ? "Open today" : "Closed today"}</span>}
          </div>
          {hasHours ? (
            <ul className="ct-hours-list">
              {hours.map(([d, h], i) => (
                <li key={d} className={i === todayIdx ? "today" : ""}>
                  <span>{d}</span>
                  {h === "Closed" ? <span className="clo">Closed</span> : <b>{h}</b>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ct-hours-empty">This studio hasn't added opening hours yet. Message on WhatsApp to check availability.</p>
          )}
        </div>
        <div className="ab-follow-rail">
          <span>Follow the studio</span>
          <div className="ab-follow-icons">
            {(store.instagram_handle || AUTHOR.socials.instagram) && <button onClick={() => window.open(`https://instagram.com/${(store.instagram_handle || AUTHOR.socials.instagram).replace(/^@/, '')}`, '_blank')} aria-label="Instagram"><Instagram size={17} /></button>}
            <button onClick={() => openWhatsAppChat("Hi!")} aria-label="WhatsApp"><WhatsApp size={17} /></button>
          </div>
        </div>
      </div>
    );
  };

  const contactBody = () => (
    <>
      <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email.</p>
      {contactChannels()}
      {contactForm()}
      {contactVisit()}
    </>
  );

  const refundsSections = () => (
    <div className="rf-sections">
      <div className="rf-section">
        <h3 className="rf-section-head"><Calendar size={17} /> Appointments</h3>
        <ul className="rf-list">
          <li><Check size={15} /> Reschedule or cancel up to 48 hours before your appointment for a full refund of your deposit.</li>
          <li><Check size={15} /> Within 48 hours of your appointment, the deposit is held against the booking and is not refunded.</li>
          <li><Check size={15} /> Need a different day? You can reschedule once at no cost up to 48 hours before, subject to availability.</li>
        </ul>
      </div>
      <div className="rf-section">
        <h3 className="rf-section-head"><ShoppingBag size={17} /> Products</h3>
        <ul className="rf-list">
          <li><Check size={15} /> Unopened products can be returned within 7 days of delivery, in their original packaging, for a refund.</li>
          <li><Check size={15} /> For hygiene reasons, opened skincare and used items cannot be returned unless they are faulty.</li>
        </ul>
      </div>
      <div className="rf-section">
        <h3 className="rf-section-head"><RotateCcw size={17} /> Refunds</h3>
        <ul className="rf-list">
          <li><Check size={15} /> Orders paid through Frontstore are refunded to your original payment method, usually within a few working days.</li>
        </ul>
      </div>
    </div>
  );

  const refundsKeyPoints = () => (
    <div className="rf-keys">
      <div className="rf-keys-h">Key points</div>
      <ul>
        <li><Calendar size={16} /><div><b>Reschedule</b><span>Free up to 48 hrs before</span></div></li>
        <li><ShoppingBag size={16} /><div><b>Returns</b><span>Unopened, within 7 days</span></div></li>
        <li><RotateCcw size={16} /><div><b>Refunds</b><span>To original payment method</span></div></li>
      </ul>
    </div>
  );

  const refundsAction = () => (
    <div className="blog-convert">
      <b style={{ fontFamily: 'Fraunces' }}>Need to cancel or return?</b>
      <p>Message the studio and we will sort your cancellation, return or refund.</p>
      <button className="blog-convert-cta" onClick={() => openWhatsAppChat("Hi, I would like to manage my booking/order.")}><WhatsApp size={15} /> Message on WhatsApp</button>
      <button className="blog-convert-ghost" onClick={() => go("contact")}>Contact options</button>
    </div>
  );

  const refundsRelated = () => (
    <div className="rf-related">
      <span className="rf-related-h">Related</span>
      <button onClick={() => go("terms")}>Terms <ChevronRight size={15} /></button>
      <button onClick={() => go("faq")}>FAQ <ChevronRight size={15} /></button>
    </div>
  );

  const returnsBody = () => (
    <div className="rf-body-m">
      <p className="svc-intro">Plans change. Here is exactly how cancellations, returns and refunds work on this store.</p>
      {refundsKeyPoints()}
      {refundsSections()}
      <LockedFrontstorePanel title="Frontstore buyer protection" body="Orders paid through Frontstore are protected. If an order does not arrive as described, you can raise a dispute and we will help mediate a resolution. This protection cannot be removed by the vendor." />
      {refundsAction()}
      {refundsRelated()}
    </div>
  );

  const policySections = (items: any[]) => items.map((s) => (
    <section key={s.t} id={termId(s.t)} className="tm-section">
      <h3>{s.t}</h3>
      {s.p.map((para: string, i: number) => <p key={i}>{para}</p>)}
      {s.locked && <LockedFrontstorePanel title={s.locked.title} body={s.locked.body} link={s.locked.link} />}
      {s.link && <button className="tm-link" onClick={() => go(s.link.page)}>{s.link.label} <ChevronRight size={14} /></button>}
    </section>
  ));

  const policyRelated = (links: any[]) => (
    <div className="rf-related">
      <span className="rf-related-h">Related</span>
      {links.map(([label, pg]) => <button key={pg} onClick={() => go(pg)}>{label} <ChevronRight size={15} /></button>)}
    </div>
  );

  const TERMS = [
    { t: "Who these terms are between", p: [`These terms are an agreement between you and ${store.store_name}, the studio that sells the services and products on this store. The store runs on Frontstore, which provides the platform and buyer protection but is not the seller.`] },
    { t: "Bookings and deposits", p: ["Appointments are made by booking through this store. A deposit secures your slot and the balance is paid on the day of your appointment. Your slot is confirmed once the deposit is received."] },
    { t: "Pricing and payment", p: ["Prices are shown in Nigerian naira. You can pay securely through Frontstore at checkout, or by bank transfer where the studio offers it. Your receipt always arrives on WhatsApp."] },
  ];

  const PRIVACY = [
    { t: "What we collect", p: [`When you book, buy or get in touch, ${store.store_name} collects the details you give us: your name, contact details such as a WhatsApp number, phone or email, your booking and order details, and reviews you choose to share.`] },
    { t: "How we use it", p: ["We use your details to take and confirm bookings and orders, reply to your enquiries, arrange delivery or pickup, process payments, show verified reviews, and improve the store."] },
  ];

  const termsBody = () => (
    <div className="tm-body-m">
      <p className="tm-intro">By booking or buying from {store.store_name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
      {policySections(TERMS)}
      {policyRelated([["Refunds", "returns"], ["FAQ", "faq"]])}
    </div>
  );

  const privacyBody = () => (
    <div className="tm-body-m">
      <p className="tm-intro">This notice explains what {store.store_name} does with your information when you book, buy or get in touch.</p>
      {policySections(PRIVACY)}
      {policyRelated([["Terms", "terms"], ["Refunds", "returns"]])}
    </div>
  );

  const blogBody = () => (
    blogList.length > 0 ? (
      <div className="blog-grid">
        {blogList.map((b, i) => (
          <BlogCard key={b.title} b={b} colour={`c${i % 3}`} onOpen={() => openPost(b)} />
        ))}
      </div>
    ) : <EmptyState />
  );

  const portfolioChips = () => (
    <div className="blog-topics">
      {["All", ...pfCats].map((c) => (
        <button key={c} className={pfCat === c ? "on" : ""} onClick={() => setPfCat(c)}>{c}</button>
      ))}
    </div>
  );

  const portfolioGrid = () => (
    <div className="pf-grid">
      {pfList.map((p, index) => (
        <button key={p.label} className={`pf-shot c${index % 3}${p.ba ? " ba" : ""}`} onClick={() => ping("Opening photo")}>
          {p.image_url ? <img src={p.image_url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          {p.ba && <span className="pf-ba"><span className="pf-ba-h">Before</span><span className="pf-ba-h">After</span></span>}
          <span className="pf-shot-cap"><b>{p.label}</b><span>{p.cat}</span></span>
        </button>
      ))}
    </div>
  );

  const portfolioFollow = () => (
    <div className="ab-follow">
      <span className="ab-follow-h">More on social</span>
      <div className="ab-socials">
        {(store.instagram_handle || AUTHOR.socials.instagram) && <button onClick={() => window.open(`https://instagram.com/${(store.instagram_handle || AUTHOR.socials.instagram).replace(/^@/, '')}`, '_blank')}><Instagram size={16} /> {store.instagram_handle ? `@${store.instagram_handle.replace(/^@/, '')}` : AUTHOR.socials.instagram}</button>}
        <button onClick={() => openWhatsAppChat("Hi!")}><WhatsApp size={16} /> WhatsApp</button>
      </div>
    </div>
  );

  const portfolioBody = () => (
    <>
      <p className="svc-intro">A look at recent work from the studio, from bridal glam to skin and hair.</p>
      {displayPortfolio.length > 0 ? (
        <>
          {portfolioChips()}
          {portfolioGrid()}
        </>
      ) : <EmptyState />}
      <button className="ab-book-m" onClick={() => openBooking()}><Calendar size={16} /> Book a treatment</button>
      {portfolioFollow()}
    </>
  );

  const articleView = () => {
    if (!post) return null;
    const idx = displayBlog.indexOf(post);
    const colour = `c${(idx < 0 ? 0 : idx) % 3}`;
    const sameCat = displayBlog.filter((b) => b !== post && b.cat === post.cat);
    const others = displayBlog.filter((b) => b !== post && b.cat !== post.cat);
    const related = [...sameCat, ...others].slice(0, 3);
    return (
      <div className="art">
        <button className="art-back" onClick={() => go("blog")}><ChevronLeft size={16} /> All articles</button>
        <div className="art-wrap">
          <article className="art-main">
            <div className={`art-hero ${colour}`}>
              {post.image_url ? <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              <span className="blog-cat">{post.cat}</span>
            </div>
            <span className="art-kicker">{post.cat}</span>
            <h1 className="art-title">{post.title}</h1>
            <div className="art-meta">
              <span className="art-meta-av">{getPostAuthorInitial(post)}</span>
              <span className="art-meta-by">By {getPostAuthorName(post)}</span>
              <span className="ps-dot">•</span> {post.date} <span className="ps-dot">•</span> {post.read} read
            </div>
            <div className="art-body">
              {Array.isArray(post.body) && post.body.map((blk: any, i: number) =>
                blk.h ? <h3 key={i}>{blk.h}</h3>
                  : blk.list ? <ul key={i}>{blk.list.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
                    : <p key={i}>{blk.p}</p>
              )}
            </div>
            <div className="art-author">
              <span className="author-av">{getPostAuthorInitial(post)}</span>
              <div className="art-author-main">
                <span className="art-author-tag">Written by</span>
                <b>{getPostAuthorName(post)}</b>
                {!post.is_pseo && <span className="art-author-role">{AUTHOR.role}</span>}
                <p>{post.is_pseo ? `${store.store_name} team.` : AUTHOR.bio}</p>
                {!post.is_pseo && AUTHOR.name && (
                  <button className="author-link" onClick={() => go("about")}>More about {AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
                )}
              </div>
            </div>
          </article>
          <aside className="art-rail">
            <div className="art-share">
              <span className="art-share-h">Share this article</span>
              <div className="art-share-row">
                <button onClick={() => openWhatsAppChat(`Check out this article: ${post.title}`)}><WhatsApp size={16} /> WhatsApp</button>
                <button onClick={copyUrl}><Copy size={15} /> Copy link</button>
              </div>
            </div>
            <div className="blog-convert">
              <b style={{ fontFamily: 'Fraunces' }}>Enjoyed the read?</b>
              <p>Book a treatment with the team, or shop the products we reach for.</p>
              <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a treatment</button>
              <button className="blog-convert-ghost" onClick={() => go("products")}>Shop products</button>
            </div>
          </aside>
        </div>
        <div className="art-related">
          <h3 className="ab-subhead">More from the journal</h3>
          <div className="blog-grid">
            {related.map((b) => <BlogCard key={b.title} b={b} colour={`c${displayBlog.indexOf(b) % 3}`} onOpen={() => openPost(b)} />)}
          </div>
        </div>
        <StoreFoot onNav={go} slug={store.username} />
      </div>
    );
  };

  const aggregateRating = store.rating && (store.review_count ?? 0) > 0 ? { "@type": "AggregateRating", ratingValue: store.rating, reviewCount: store.review_count, bestRating: 5 } : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
    name: store.store_name,
    description: store.store_bio,
    url: `https://${systemDomain}/${store.username}`,
    priceRange: "$$",
    address: { "@type": "PostalAddress", streetAddress: store.address || undefined, addressLocality: store.location || undefined, addressCountry: "NG" },
    telephone: store.whatsapp_phone,
    email: store.email,
    ...(aggregateRating ? { aggregateRating } : {}),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: displayFaqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div className="ps-root" style={storeStyleTheme}>
      <style>{css}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <WhatsAppDisclaimerModal
        open={!!pendingWaUrl}
        storeName={store.store_name} isVerified={!!store.is_verified}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)}
      />

      {/* ============ MOBILE ============ */}
      {!isDesktop && (
        <div className="ps-col">
          <header className="ps-top">
            <button className="ps-burger" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={22} /></button>
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></button>
            <button className="ps-top-icon" onClick={() => setSearch(true)} aria-label="Search"><SearchIcon size={20} /></button>
            <button className="ps-top-share" onClick={() => setShare(true)} aria-label="Share"><Share2 size={19} /></button>
          </header>

          <main className="ps-main">
            {page === "home" && (
              <>
                <section className="ps-cover-wrap">
                  <div className="ps-cover" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    {!store.banner_url && <StoreIcon className="ps-cover-icn" strokeWidth={1.1} />}
                  </div>
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="Logo" className="ps-avatar" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className="ps-avatar">{store.store_name[0].toUpperCase()}</span>
                  )}
                  <h1 className="ps-name">{store.store_name} {store.is_verified ? <BadgeCheck size={20} className="ps-verif" /> : null}</h1>
                  <p className="ps-meta">Beauty &amp; Skincare{store.location && <> <span className="ps-dot">•</span> <MapPin size={13} /> {store.location}</>}</p>
                  <div className="ps-id-actions-row">
                    <button className="ps-url" onClick={copyUrl}><span className="ps-url-text">frontstore.ng/{store.username}</span> <Copy size={13} /></button>
                    <button className="ps-notify" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                  </div>
                  <div className="ps-stats">
                    {store.rating ? <div><b><Star size={14} className="ps-star" /> {store.rating.toFixed(1)}</b><span>{store.review_count || displayReviews.length} reviews</span></div> : null}
                    {store.total_orders ? <div><b>{store.total_orders}</b><span>orders</span></div> : null}
                    <div><b>~10 min</b><span>reply time</span></div>
                  </div>
                  {store.store_bio && <p className="ps-bio">{store.store_bio}</p>}
                  <div className="ps-statusline">
                    {hasHours && <span className={`ps-open${openToday ? "" : " closed"}`}><span className="ps-pulse" /> {openToday ? "Open now" : "Closed today"}</span>}
                    <span className="ps-secure"><ShieldCheck size={13} /> Secured by Frontstore</span>
                  </div>
                </section>

                {!annOff && announcement && (
                  <div className="ps-ann">
                    <Megaphone size={16} />
                    <p><b>{announcement.title}</b> {announcement.body}</p>
                    <button onClick={() => setAnnOff(true)} aria-label="Dismiss"><X size={15} /></button>
                  </div>
                )}

                {SERVICES[0] && (
                  <section className="ps-signature">
                    <span className="ps-sig-tag"><Award size={12} /> Featured treatment</span>
                    <div className="ps-sig-body">
                      <div className="ps-sig-thumb">
                        {SERVICES[0].image_url ? <img src={SERVICES[0].image_url} alt={SERVICES[0].name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : <Calendar size={26} />}
                      </div>
                      <div className="ps-sig-main">
                        <b>{SERVICES[0].name}</b>
                        <span><Clock size={12} /> {SERVICES[0].duration} min</span>
                        <em>{money(SERVICES[0].price)}</em>
                      </div>
                    </div>
                    <button className="ps-book-btn" onClick={() => openBooking(SERVICES[0])}><Calendar size={16} /> Book this treatment</button>
                  </section>
                )}

                <div className="ps-searchbar" onClick={() => setSearch(true)}><SearchIcon size={17} /> <span>Search services and products</span></div>
                <div className="ps-chips">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => { if (SERVICES.some(s => s.cat === c.name)) { setSvcCat(c.name); go("services"); } else { setProdCat(c.name); go("products"); } }}>{c.name}</button>
                  ))}
                </div>

                {homeServices.length > 0 && (
                  <>
                    <SectionHead title="Services" action={`See all ${SERVICES.length}`} onAction={() => go("services")} />
                    {servicesGrid("ps-grid", homeServices)}
                    <button className="ps-seeall" onClick={() => go("services")}>See all {SERVICES.length} services <ChevronRight size={16} /></button>
                  </>
                )}

                {homeProducts.length > 0 && (
                  <>
                    <SectionHead title="Products" action={`See all ${PRODUCTS.length}`} onAction={() => go("products")} />
                    {productsGrid("ps-grid", homeProducts)}
                    <button className="ps-seeall" onClick={() => go("products")}>See all {PRODUCTS.length} products <ChevronRight size={16} /></button>
                  </>
                )}

                {displayReviews.length > 0 && (
                  <>
                    <SectionHead title="Reviews" />
                    <RatingSummary />
                    <div className="ps-reviews-row">
                      {displayReviews.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} />)}
                    </div>
                    <button className="ps-seeall" onClick={() => go("reviews")}>See all reviews <ChevronRight size={16} /></button>
                  </>
                )}

                <SectionHead title="Visit the studio" />
                <div className="ps-visit">
                  <div className="ps-map"><MapPin size={26} /><span>Map preview</span></div>
                  <div className="ps-visit-info">
                    {store.address && <p className="ps-addr"><MapPin size={15} /> {store.address}</p>}
                    {store.address && <button className="ps-dir" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address as string)}`, '_blank')}><Navigation size={15} /> Directions</button>}
                    {hasHours ? (
                      <ul className="ps-hours">
                        {hours.map(([d, h], i) => (
                          <li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="ps-hours-empty">Opening hours not added yet</p>
                    )}
                  </div>
                </div>

                <SectionHead title="Good to know" />
                {displayFaqs.length > 0 ? <Accordion items={displayFaqs.slice(0, 5)} open={openFaq} setOpen={setOpenFaq} /> : <EmptyState />}
                <StoreFoot onNav={go} slug={store.username} />
              </>
            )}

            {page === "services" && <Sub title="Services">{SERVICES.length === 0 ? <EmptyState /> : servicesGrid("ps-grid", SERVICES)}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "products" && <Sub title="Products">{PRODUCTS.length === 0 ? <EmptyState /> : productsGrid("ps-grid", PRODUCTS)}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "portfolio" && <Sub title="Portfolio">{displayPortfolio.length === 0 ? <EmptyState /> : portfolioBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "post" && articleView()}
            {page === "reviews" && <Sub title="Reviews">{displayReviews.length === 0 ? <EmptyState /> : reviewsBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "blog" && <Sub title="Blog">{displayBlog.length === 0 ? <EmptyState /> : blogBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "about" && <Sub title="About">{(!store.store_bio && !store.founder_bio) ? <EmptyState /> : aboutBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "faq" && <Sub title="FAQ">{displayFaqs.length === 0 ? <EmptyState /> : faqBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "contact" && <Sub title="Contact">{((!store.address && !store.email && !store.phone && !store.whatsapp_phone)) ? <EmptyState /> : contactBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "returns" && <Sub title="Refunds">{returnsBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "terms" && <Sub title="Terms">{termsBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "privacy" && <Sub title="Privacy">{privacyBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
          </main>
        </div>
      )}

      {/* ============ DESKTOP ============ */}
      {isDesktop && (
        <div className="pd-wrap">
          <header className="pd-header">
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></button>
            <button className="pd-search" onClick={() => setSearch(true)}><SearchIcon size={17} /> <span>Search {store.store_name}</span></button>
            <div className="pd-header-actions">
              <button className="pd-hicon" onClick={copyUrl} aria-label="Share"><Share2 size={18} /></button>
              <button className="pd-hicon" onClick={() => setBagOpen(true)} aria-label="Bag">
                <ShoppingBag size={18} />{bagCount > 0 && <i>{bagCount}</i>}
              </button>
              <button className="pd-head-book" onClick={() => openBooking()}><Calendar size={16} /> Book a treatment</button>
            </div>
          </header>

          <div className="pd-container">
            <section className="pd-cover">
              <div className="pd-cover-art" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                {!store.banner_url && <StoreIcon className="pd-cover-icn" strokeWidth={1.05} />}
              </div>
              <div className="pd-identity">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="pd-avatar" style={{ objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span className="pd-avatar">{store.store_name[0].toUpperCase()}</span>
                )}
                <div className="pd-identity-main">
                  <h1>{store.store_name} {store.is_verified ? <BadgeCheck size={22} className="ps-verif" /> : null}</h1>
                  <p>
                    <span>Beauty &amp; Skincare</span>
                    {store.location && <><span className="ps-dot">•</span><span><MapPin size={13} /> {store.location}</span></>}
                    {store.rating ? <><span className="ps-dot">•</span><span><Star size={13} className="ps-star" /> {store.rating.toFixed(1)} ({store.review_count || displayReviews.length})</span></> : null}
                    {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && (
                      <><span className="ps-dot">•</span><span>Replies ~{store.reply_time_minutes} min</span></>
                    )}
                  </p>
                </div>
                <div className="pd-identity-actions">
                  <button className="pd-book" onClick={() => openBooking()}><Calendar size={16} /> Book a treatment</button>
                  <button className="pd-ghost" onClick={() => openWhatsAppChat("Hi!")}><WhatsApp size={16} /> Message</button>
                  <button className="pd-ghost" onClick={() => setNotifyOpen(true)}><Bell size={16} /> Get notified</button>
                </div>
              </div>
            </section>

            <nav className="pd-tabs">
              {[
                ["home", "Home"], ["services", "Services"], ["products", "Products"], ["portfolio", "Portfolio"], ["reviews", "Reviews"], ["blog", "Blog"],
                ["about", "About"], ["faq", "FAQ"], ["contact", "Contact"]
              ].filter(([id]) => {
                if (id === 'home') return true;
                return (store.storefront_sections || []).includes(id);
              }).map(([id, label]) => (
                <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
              ))}
            </nav>

            {page === "home" && (
              <>
                {!annOff && announcement && (
                  <div className="ps-ann">
                    <Megaphone size={16} />
                    <p><b>{announcement.title}</b> {announcement.body}</p>
                    <button onClick={() => setAnnOff(true)} aria-label="Dismiss"><X size={15} /></button>
                  </div>
                )}
                <div className="pd-home">
                  <aside className="pd-rail">
                    {store.store_bio && (
                      <div className="pd-railcard">
                        <h3>About</h3>
                        <p>{store.store_bio}</p>
                        <button className="pd-raillink" onClick={() => go("about")}>More about us <ChevronRight size={14} /></button>
                      </div>
                    )}
                    <div className="pd-railcard">
                      <h3>Visit us</h3>
                      <div className="pd-railmap"><MapPin size={22} /></div>
                      {store.address && <p className="ps-addr"><MapPin size={14} /> {store.address}</p>}
                      <div className="pd-railbtns">
                        {store.address && <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address as string)}`, '_blank')}><Navigation size={14} /> Directions</button>}
                        <button onClick={() => openWhatsAppChat("Hi!")}><WhatsApp size={14} /> Message</button>
                      </div>
                      {hasHours ? (
                        <ul className="ps-hours">{hours.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                      ) : (
                        <p className="ps-hours-empty">Opening hours not added yet</p>
                      )}
                    </div>
                    <div className="pd-railcard trust">
                      <span className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</span>
                      <p>Buyer protection and platform terms apply to every order on this store and cannot be removed by the vendor.</p>
                    </div>
                  </aside>

                  <div className="pd-feed">
                    {SERVICES[0] && (
                      <section className="ps-signature" style={{ marginBottom: 24 }}>
                        <span className="ps-sig-tag"><Award size={12} /> Signature treatment</span>
                        <div className="ps-sig-body">
                          <div className="ps-sig-thumb">
                            {SERVICES[0].image_url ? <img src={SERVICES[0].image_url} alt={SERVICES[0].name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : <Calendar size={26} />}
                          </div>
                          <div className="ps-sig-main">
                            <b>{SERVICES[0].name}</b>
                            <span><Clock size={12} /> {SERVICES[0].duration} min</span>
                            <em>{money(SERVICES[0].price)}</em>
                          </div>
                        </div>
                        <button className="ps-book-btn" onClick={() => openBooking(SERVICES[0])}><Calendar size={16} /> Book this treatment</button>
                      </section>
                    )}
                    <div className="pd-sec-head"><h2>Services</h2><button onClick={() => go("services")}>See all {SERVICES.length}</button></div>
                    {servicesGrid("pd-grid", SERVICES.slice(0, 6))}
                    <div className="pd-sec-head"><h2>Products</h2><button onClick={() => go("products")}>See all {PRODUCTS.length}</button></div>
                    {productsGrid("pd-grid", PRODUCTS.slice(0, 6))}
                    <div className="pd-sec-head"><h2>Reviews</h2><button onClick={() => go("reviews")}>See all</button></div>
                    <RatingSummary />
                    <div className="pd-grid reviews">{displayReviews.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} full />)}</div>
                  </div>
                </div>
                <StoreFoot onNav={go} slug={store.username} />
              </>
            )}

            {(page === "services" || page === "products" || page === "reviews" || page === "blog" || page === "portfolio" || page === "about" || page === "faq" || page === "contact") && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>{page === "services" ? "Services" : page === "products" ? "Products" : page === "reviews" ? "Reviews" : page === "blog" ? "Blog" : page === "portfolio" ? "Portfolio" : page === "about" ? "About" : page === "faq" ? "FAQ" : "Contact"}</h1>
                  <span>frontstore.ng/{store.username}</span>
                </div>
                {page === "services" && (SERVICES.length === 0 ? <EmptyState /> : (
                  <div className="svc-page">
                    <p className="svc-intro">Book a treatment with our team. A deposit secures your slot, with the balance paid at your appointment.</p>
                    <div className="pd-sec-head"><h2>Most booked</h2></div>
                    <div className="svc-feat-grid">
                      {SERVICES.slice(0, 3).map((s) => (
                        <ServiceCardRich key={s.id} s={s} colour={catColor(s.cat)} badge="Most booked" onBook={() => openBooking(s)} />
                      ))}
                    </div>
                    <div className="svc-body">
                      <aside className="svc-rail">
                        <div className="svc-search">
                          <SearchIcon size={16} />
                          <input value={svcQuery} onChange={(e) => setSvcQuery(e.target.value)} placeholder="Search services" />
                          {svcQuery && <button onClick={() => setSvcQuery("")} aria-label="Clear"><X size={15} /></button>}
                        </div>
                        <div className="svc-filters">
                          <div className="svc-fgroup">
                            <h4>Category</h4>
                            <div className="svc-radios">
                              <button className={svcCat === "All" ? "on" : ""} onClick={() => setSvcCat("All")}>All services</button>
                              {categories.map((c) => <button key={c.id} className={svcCat === c.name ? "on" : ""} onClick={() => setSvcCat(c.name)}>{c.name}</button>)}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Duration</h4>
                            <div className="svc-radios">
                              {[["All", "Any length"], ["short", "Under 1 hour"], ["mid", "1 to 2 hours"], ["long", "Over 2 hours"]].map(([v, l]) => (
                                <button key={v} className={svcDur === v ? "on" : ""} onClick={() => setSvcDur(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="svc-book-card">
                          {hasHours && <span className={`svc-open${openToday ? "" : " closed"}`}><span className="ps-pulse" /> {openToday ? "Open now" : "Closed today"}</span>}
                          <button className="svc-book-cta" onClick={() => openBooking()}><Calendar size={16} /> Book a slot</button>
                        </div>
                      </aside>
                      <div className="svc-main">
                        <div className="svc-results-head">
                          <b>{svcFiltered.length} {svcFiltered.length === 1 ? "service" : "services"}</b>
                          {svcHasFilters && <button className="svc-clear" onClick={clearSvc}>Clear filters</button>}
                        </div>
                        {svcFiltered.length > 0 ? (
                          <div className="svc-grid">
                            {svcFiltered.map((s) => <ServiceCardRich key={s.id} s={s} colour={catColor(s.cat)} onBook={() => openBooking(s)} />)}
                          </div>
                        ) : <div className="svc-empty">No services match your filters.<button onClick={clearSvc}>Clear filters</button></div>}
                      </div>
                    </div>
                  </div>
                ))}
                {page === "products" && (
                  <div className="svc-page">
                    <p className="svc-intro">Shop the studio's favourites. Delivery across Lagos in 1 to 3 days, with nationwide shipping{store.location ? ` and ${store.location} pickup at checkout` : ""}.</p>
                    <div className="pd-sec-head"><h2>Best sellers</h2></div>
                    <div className="svc-feat-grid">
                      {PRODUCTS.slice(0, 3).map((p) => (
                        <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} badge="Best seller" onView={() => router.push(storePath(username, `/products/${p.slug}`))} onBuy={() => addBag(p)} />
                      ))}
                    </div>
                    <div className="svc-body">
                      <aside className="svc-rail">
                        <div className="svc-search">
                          <SearchIcon size={16} />
                          <input value={prodQuery} onChange={(e) => setProdQuery(e.target.value)} placeholder="Search products" />
                          {prodQuery && <button onClick={() => setProdQuery("")} aria-label="Clear"><X size={15} /></button>}
                        </div>
                        <div className="svc-filters">
                          <div className="svc-fgroup">
                            <h4>Category</h4>
                            <div className="svc-radios">
                              <button className={prodCat === "All" ? "on" : ""} onClick={() => setProdCat("All")}>All products</button>
                              {categories.map((c) => <button key={c.id} className={prodCat === c.name ? "on" : ""} onClick={() => setProdCat(c.name)}>{c.name}</button>)}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Price</h4>
                            <div className="svc-radios">
                              {[["All", "Any price"], ["lo", "Under ₦10,000"], ["mid", "₦10,000 to ₦15,000"], ["hi", "Over ₦15,000"]].map(([v, l]) => (
                                <button key={v} className={prodPrice === v ? "on" : ""} onClick={() => setProdPrice(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </aside>
                      <div className="svc-main">
                        <div className="svc-results-head">
                          <b>{prodFiltered.length} {prodFiltered.length === 1 ? "product" : "products"}</b>
                          {prodHasFilters && <button className="svc-clear" onClick={clearProd}>Clear filters</button>}
                        </div>
                        {prodFiltered.length > 0 ? (
                          <div className="svc-grid">
                            {prodFiltered.map((p) => <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} onView={() => router.push(storePath(username, `/products/${p.slug}`))} onBuy={() => addBag(p)} />)}
                          </div>
                        ) : <div className="svc-empty">No products match your filters.<button onClick={clearProd}>Clear filters</button></div>}
                      </div>
                    </div>
                  </div>
                )}
                {page === "reviews" && (
                  <div className="svc-page">
                    <p className="svc-intro">Every review here comes from a verified order on Frontstore. The studio can respond, but cannot remove genuine reviews.</p>
                    <div className="svc-body">
                      <aside className="svc-rail">
                        <RatingSummary />
                        <button className="rev-leave" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
                      </aside>
                      <div className="svc-main">
                        <div className="svc-results-head">
                          <b>{revFiltered.length} {revFiltered.length === 1 ? "review" : "reviews"}</b>
                        </div>
                        {revFiltered.length > 0 ? (
                          <div className="rev-list">{revFiltered.map((rv) => <ReviewCardRich key={rv.id} rv={rv} />)}</div>
                        ) : <div className="svc-empty">No reviews match your filters.</div>}
                      </div>
                    </div>
                  </div>
                )}
                {page === "blog" && (
                  <div className="blogp">
                    <p className="svc-intro">Tips, routines and studio notes from the team.</p>
                    <div className="blog-topics">
                      {["All", ...blogCats].map((c) => (
                        <button key={c} className={blogCat === c ? "on" : ""} onClick={() => setBlogCat(c)}>{c}</button>
                      ))}
                    </div>
                    <div className="blogp-body">
                      <div className="blogp-main">
                        {blogList[0] && (
                          <article className="blog-hero" onClick={() => openPost(blogList[0])}>
                            <div className={`blog-hero-img c${displayBlog.indexOf(blogList[0]) % 3}`}>
                              {blogList[0].image_url ? <img src={blogList[0].image_url} alt={blogList[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                              <span className="blog-cat">{blogList[0].cat}</span>
                            </div>
                            <div className="blog-hero-body">
                              <span className="blog-kicker">{blogCat === "All" ? "Latest" : blogCat}</span>
                              <h3>{blogList[0].title}</h3>
                              <p>{blogList[0].excerpt}</p>
                              <span className="blog-read">Read article <ChevronRight size={15} /></span>
                            </div>
                          </article>
                        )}
                        {blogList.slice(1).length > 0 && (
                          <div className="blog-grid">
                            {blogList.slice(1).map((b) => (
                              <BlogCard key={b.title} b={b} colour={`c${displayBlog.indexOf(b) % 3}`} onOpen={() => openPost(b)} />
                            ))}
                          </div>
                        )}
                      </div>
                      <aside className="blogp-rail">
                        <div className="author-card">
                          <div className="author-top">
                            <span className="author-av">{AUTHOR.initial}</span>
                            <div><b>{AUTHOR.name}</b><span>{AUTHOR.role}</span></div>
                          </div>
                          <p>{AUTHOR.bio}</p>
                          <button className="author-link" onClick={() => go("about")}>More about {AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
                        </div>
                      </aside>
                    </div>
                  </div>
                )}
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "post" && articleView()}

            {page === "portfolio" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Portfolio</h1>
                  <span>frontstore.ng/{store.username}</span>
                </div>
                <p className="svc-intro">A look at recent work from the studio, from bridal glam to skin and hair. Tap any image to see it larger.</p>
                {portfolioChips()}
                <div className="pf-wrap">
                  <div className="pf-main">{portfolioGrid()}</div>
                  <aside className="pf-rail">
                    {portfolioFollow()}
                  </aside>
                </div>
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "about" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>About</h1>
                  <span>frontstore.ng/{store.username}</span>
                </div>
                <div className="ab-wrap">
                  <div className="ab-main">{aboutBody()}</div>
                  <aside className="ab-rail">
                    <div className="pd-railcard">
                      <h3>Visit us</h3>
                      {store.address && <p className="ps-addr">{store.address}</p>}
                      {hasHours ? (
                        <ul className="ps-hours">{hours.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                      ) : (
                        <p className="ps-hours-empty">Opening hours not added yet</p>
                      )}
                    </div>
                  </aside>
                </div>
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "faq" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>FAQ</h1>
                  <span>frontstore.ng/{store.username}</span>
                </div>
                <div className="faq-wrap">
                  <aside className="faq-rail">
                    <div className="faq-search">
                      <SearchIcon size={15} />
                      <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions" />
                    </div>
                    {faqHelp()}
                  </aside>
                  <div className="faq-main">{faqSections()}</div>
                </div>
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "contact" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Contact</h1>
                  <span>frontstore.ng/{store.username}</span>
                </div>
                <div className="ct-wrap">
                  <div className="ct-main">
                    <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email.</p>
                    {contactChannels()}
                    {contactForm()}
                  </div>
                  <aside className="ct-rail">{contactVisit()}</aside>
                </div>
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* drawer (mobile only) */}
      {!isDesktop && drawer && (
        <div className="ps-drawer-back" onClick={() => setDrawer(false)}>
          <div className="ps-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ps-panel">
              <div className="ps-panel-top">
                <span className="ps-logo"><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></span>
                <button className="ps-x" onClick={() => setDrawer(false)} aria-label="Close"><X size={20} /></button>
              </div>
              <button className="ps-id" onClick={() => go("home")}>
                <span className="ps-id-av">{store.store_name[0].toUpperCase()}</span>
                <span className="ps-id-main">
                  <b>{store.store_name} {store.is_verified ? <BadgeCheck size={14} className="ps-verif" /> : null}</b>
                  <i>frontstore.ng/{store.username}</i>
                </span>
              </button>
              <nav className="ps-nav">
                {[
                  ["home", "Home"], ["services", "Services"], ["products", "Products"], ["portfolio", "Portfolio"], ["reviews", "Reviews"], ["blog", "Blog"],
                  ["about", "About"], ["faq", "FAQ"], ["contact", "Contact"]
                ].filter(([id]) => {
                  if (id === 'home') return true;
                  return (store.storefront_sections || []).includes(id);
                }).map(([id, label]) => (
                  <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
                ))}
              </nav>
              <div className="ps-panel-actions">
                <button className="ps-act-book" onClick={() => { setDrawer(false); openBooking(); }}><Calendar size={17} /> Book appointment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* bottom nav (mobile only) */}
      {!isDesktop && (
        <nav className="ps-bottom">
          <button className={page === "home" ? "on" : ""} onClick={() => go("home")}><StoreIcon size={21} /><span>Home</span></button>
          {(store.storefront_sections || []).includes("services") && (
            <button className={page === "services" ? "on" : ""} onClick={() => go("services")}><Calendar size={21} /><span>Services</span></button>
          )}
          <button className="ps-fab" onClick={() => setBagOpen(true)} aria-label="Cart">
            <span className="ps-fab-ring" />
            <ShoppingBag size={22} />
            {bagCount > 0 && <i className="ps-fab-badge">{bagCount}</i>}
          </button>
          {(store.storefront_sections || []).includes("products") && (
            <button className={page === "products" ? "on" : ""} onClick={() => go("products")}><Package size={21} /><span>Products</span></button>
          )}
          {(store.storefront_sections || []).includes("reviews") && (
            <button className={page === "reviews" ? "on" : ""} onClick={() => go("reviews")}><Star size={21} /><span>Reviews</span></button>
          )}
        </nav>
      )}

      {/* search overlay (shared) */}
      {search && (
        <div className="ps-overlay" onClick={() => setSearch(false)}>
          <div className="ps-search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ps-search-top">
              <SearchIcon size={18} />
              <input autoFocus placeholder={`Search ${store.store_name}`} value={query} onChange={(e) => { setQuery(e.target.value); setSvcQuery(e.target.value); setProdQuery(e.target.value); }} />
              <button onClick={() => setSearch(false)}><X size={20} /></button>
            </div>
            <p className="ps-search-lbl">Categories</p>
            <div className="ps-chips">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setSearch(false); if (SERVICES.some(s => s.cat === c.name)) { setSvcCat(c.name); go("services"); } else { setProdCat(c.name); go("products"); } }}>{c.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* booking flow sheet (shared) */}
      {bookOpen && bookingFlow()}

      {/* bag / order sheet drawer (shared) */}
      {bagOpen && (
        <div className="ps-overlay" onClick={() => setBagOpen(false)}>
          <div className="ps-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ps-sheet-grip" />
            <div className="ps-sheet-head">
              <b>{orderReceipt ? "Success" : "Your bag"}</b>
              <button onClick={() => setBagOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>

            {orderReceipt ? (
              <div className="checkout-receipt-success" style={{ padding: '10px 0' }}>
                <div style={{ display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'grid', placeItems: 'center' }}>
                    <Check size={26} />
                  </div>
                </div>
                <h4 style={{ textAlign: 'center', fontSize: 16, fontWeight: 700 }}>Order Received!</h4>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Reference: #{orderReceipt.order.order_number}</p>
                <div className="receipt-summary" style={{ background: '#f9f5f3', borderRadius: 12, padding: 14, marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>Customer</span>
                    <b>{orderReceipt.order.customer_name}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>Total Amount</span>
                    <b>{money(orderReceipt.order.total_amount)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>Escrow Status</span>
                    <span style={{ color: '#047857', fontWeight: 600 }}>Secured</span>
                  </div>
                </div>
                <button className="ps-sheet-cta" onClick={handlePayOnline} disabled={isPaying} style={{ marginTop: 20 }}>
                  {isPaying ? "Initializing secure payment..." : "Pay Securely Online Now"}
                </button>
                <button className="ps-sheet-cta" onClick={() => setPendingWaUrl(orderReceipt.whatsapp_url)} style={{ marginTop: 10, background: '#25D366', color: '#fff', boxShadow: 'none' }}>
                  <MessageCircle size={16} /> Send receipt on WhatsApp
                </button>
              </div>
            ) : checkoutStep === 'details' ? (
              <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 8 }}>
                  <button type="button" onClick={() => setCheckoutStep('cart')} style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 13 }}><ChevronLeft size={16} /> Back to cart</button>
                </div>
                {checkoutError && <div style={{ color: 'red', fontSize: 12, background: '#fee2e2', padding: 10, borderRadius: 8 }}>{checkoutError}</div>}

                <div>
                  <label className="ps-field-lbl" style={{ margin: 0 }}>Full Name</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Chioma Nwachukwu" style={{ width: '100%', padding: 11, border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
                </div>

                <div>
                  <label className="ps-field-lbl" style={{ margin: 0 }}>WhatsApp Number</label>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required placeholder="+234 812 345 6789" style={{ width: '100%', padding: 11, border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
                </div>

                <div>
                  <label className="ps-field-lbl" style={{ margin: 0 }}>Email Address</label>
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="chioma@gmail.com" style={{ width: '100%', padding: 11, border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: 'var(--card)' }} />
                </div>

                {bag.filter(x => x.type === 'service').length === 0 && (
                  <div>
                    <label className="ps-field-lbl" style={{ margin: 0 }}>Delivery Method</label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button type="button" className={`nt-topic ${deliveryMethod === 'delivery' ? 'on' : ''}`} onClick={() => setDeliveryMethod('delivery')} style={{ flex: 1, padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Truck size={14} /> Shipping</button>
                      <button type="button" className={`nt-topic ${deliveryMethod === 'pickup' ? 'on' : ''}`} onClick={() => setDeliveryMethod('pickup')} style={{ flex: 1, padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><StoreIcon size={14} /> Pickup</button>
                    </div>
                  </div>
                )}

                {(deliveryMethod === 'delivery' || bag.filter(x => x.type === 'service').length > 0) && (
                  <div>
                    <label className="ps-field-lbl" style={{ margin: 0 }}>
                      {bag.filter(x => x.type === 'service').length > 0 ? "Session / Delivery Address (Optional)" : "Shipping Address"}
                    </label>
                    <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Suite 4, Admiralty Way, Lekki Phase 1" style={{ width: '100%', padding: 11, border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, height: 60, background: 'var(--card)', resize: 'none' }} />
                  </div>
                )}

                {/* Coupon Form */}
                <div style={{ marginTop: 6, marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon || validatingCoupon}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        fontSize: 13,
                        background: 'var(--card)',
                        textTransform: 'uppercase'
                      }}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCodeInput('');
                        }}
                        className="btn clickable"
                        style={{
                          padding: '8px 16px',
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 10,
                          background: '#fde8e8',
                          color: '#e53e3e',
                          border: '1px solid #f8b4b4'
                        }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCodeInput.trim()}
                        className="btn clickable"
                        style={{
                          padding: '8px 16px',
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 10,
                          background: 'var(--brand)',
                          color: '#fff',
                          border: 'none',
                          opacity: (!couponCodeInput.trim() || validatingCoupon) ? 0.6 : 1
                        }}
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p style={{ fontSize: 11, color: '#e53e3e', marginTop: 4, margin: 0 }}>{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p style={{ fontSize: 11, color: '#2f855a', marginTop: 4, margin: 0, fontWeight: 700 }}>
                      Coupon "{appliedCoupon.code}" applied: {appliedCoupon.discount_type === 'percentage' ? `${parseFloat(appliedCoupon.discount_value)}%` : money(parseFloat(appliedCoupon.discount_value))} discount
                    </p>
                  )}
                </div>

                {(() => {
                  let discountAmount = 0;
                  if (appliedCoupon) {
                    if (appliedCoupon.discount_type === 'percentage') {
                      discountAmount = Math.round(bagTotal * (parseFloat(appliedCoupon.discount_value) / 100));
                    } else {
                      discountAmount = Math.round(parseFloat(appliedCoupon.discount_value));
                    }
                    discountAmount = Math.min(discountAmount, bagTotal);
                  }
                  const discountedSubtotal = Math.max(0, bagTotal - discountAmount);
                  const totalWithShipping = (deliveryMethod === 'delivery' ? shippingPreview.total : bagTotal) - discountAmount;

                  return (
                    <>
                      {appliedCoupon && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, background: 'var(--tint)', borderRadius: 10, fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Original Subtotal:</span>
                            <span>{money(bagTotal)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e53e3e', fontWeight: 600 }}>
                            <span>Discount ({appliedCoupon.code}):</span>
                            <span>-{money(discountAmount)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--line)', paddingTop: 4, marginTop: 4 }}>
                            <span>New Total:</span>
                            <span>{money(totalWithShipping)}</span>
                          </div>
                        </div>
                      )}
                      <button type="submit" className="ps-sheet-cta" disabled={checkoutLoading} style={{ marginTop: 12 }}>
                        {checkoutLoading ? "Submitting Order..." : `Proceed to Secure Checkout (Total: ${money(totalWithShipping)})`}
                      </button>
                    </>
                  );
                })()}
              </form>
            ) : bag.length === 0 ? (
              <p className="ps-bag-empty">Your order is empty. Add a product or book a treatment to get started.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, maxHeight: '280px', overflowY: 'auto' }}>
                  {bag.map((b) => (
                    <div key={b.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
                        <b style={{ display: 'block', fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</b>
                        {b.type === "service" ? (
                          <span style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginTop: 2 }}><Calendar size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> {b.slot}</span>
                        ) : (
                          <span style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginTop: 2 }}>Product</span>
                        )}
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brand-deep)', display: 'block', marginTop: 2 }}>{money(b.price)}</span>
                      </div>
                      {b.type === "product" ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--tint)', padding: '4px 8px', borderRadius: 8 }}>
                          <button onClick={() => changeQty(b.key, -1)} style={{ color: 'var(--brand-deep)' }}><Minus size={14} /></button>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-deep)' }}>{b.qty}</span>
                          <button onClick={() => changeQty(b.key, 1)} style={{ color: 'var(--brand-deep)' }}><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => removeItem(b.key)} style={{ color: 'var(--muted)' }}><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Subtotal</span>
                    <span style={{ fontSize: 13 }}>{money(bagTotal)}</span>
                  </div>
                  {deliveryMethod === 'delivery' && shippingPreview.shippingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Shipping</span>
                      <span style={{ fontSize: 13 }}>{money(shippingPreview.shippingFee)}</span>
                    </div>
                  )}
                  {deliveryMethod === 'delivery' && shippingPreview.handlingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Handling Fee</span>
                      <span style={{ fontSize: 13 }}>{money(shippingPreview.handlingFee)}</span>
                    </div>
                  )}
                  <div className="ps-bag-total" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
                    <b style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-deep)' }}>{money(deliveryMethod === 'delivery' ? shippingPreview.total : bagTotal)}</b>
                  </div>
                </div>
                <button className="ps-sheet-cta" onClick={() => setCheckoutStep('details')}>
                  <ShieldCheck size={17} /> Checkout Order
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* share sheet (shared) */}
      {share && (
        <Sheet onClose={() => setShare(false)} title="Share this store">
          <div className="ps-share-url">
            <span>frontstore.ng/{store.username}</span>
            <button onClick={copyUrl}><Copy size={15} /></button>
          </div>
          <button className="ps-share-wa" onClick={() => { setShare(false); openWhatsAppChat(`Take a look at this shop: ${store.store_name} (frontstore.ng/${store.username})`); }}><WhatsApp size={18} /> Share on WhatsApp</button>
        </Sheet>
      )}

      {/* notify opt-in sheet (shared) */}
      {notifyOpen && (
        <Sheet onClose={() => setNotifyOpen(false)} title={`Get updates from ${store.store_name}`}>
          <p className="ps-sheet-sub"><Bell size={13} /> Be first to hear about new services, products, drops and announcements.</p>
          <p className="ps-field-lbl">Your WhatsApp number</p>
          <input className="bk-input" value={notifyPhone} onChange={(e) => setNotifyPhone(e.target.value)} placeholder="e.g. 0801 234 5678" inputMode="tel" style={{ width: '100%', padding: 11, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--card)' }} />
          <p className="ps-field-lbl">What should we send you?</p>
          <div className="nt-topics">
            {[["services", "New services"], ["products", "New products"], ["offers", "Offers & drops"], ["news", "Announcements"]].map(([id, label]) => {
              const on = notifyTopics.includes(id);
              return <button key={id} className={`nt-topic ${on ? "on" : ""}`} onClick={() => setNotifyTopics(on ? notifyTopics.filter((t) => t !== id) : [...notifyTopics, id])}>{on && <Check size={13} />}{label}</button>;
            })}
          </div>
          <p className="ps-deposit">Updates are sent through Frontstore. No spam, opt out any time.</p>
          <button className="ps-sheet-cta" disabled={!notifyPhone.trim() || notifyTopics.length === 0} onClick={() => { setNotifyOpen(false); ping(`You will get updates from ${store.store_name}`); }}><Bell size={16} /> Notify me</button>
        </Sheet>
      )}

      {/* review submission sheet (shared) */}
      {reviewOpen && (
        <Sheet onClose={() => setReviewOpen(false)} title="Leave a review">
          <p className="rev-form-note"><ShieldCheck size={13} /> {store.reviews_intro_text || "Reviews come from verified orders. Add your order reference so we can confirm it."}</p>
          <p className="ps-field-lbl">Your rating</p>
          <div className="rev-rate" style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRevRating(i + 1)} aria-label={(i + 1) + " star"}><Star size={28} className={i < revRating ? "f" : ""} /></button>
            ))}
          </div>
          <p className="ps-field-lbl">Order reference</p>
          <input className="rev-input" value={revRef} onChange={(e) => setRevRef(e.target.value)} placeholder="e.g. FS-7Q2K9" />
          <p className="ps-field-lbl">Your review</p>
          <textarea className="rev-textarea" value={revText} onChange={(e) => setRevText(e.target.value)} placeholder="Tell others about your experience" rows={4} />
          <button className="ps-sheet-cta" onClick={submitReview} style={{ marginTop: 14 }}>Submit review</button>
        </Sheet>
      )}

      {toast && <div className="ps-toast show"><Check size={15} /> {toast}</div>}
    </div>
  );
}

/* ---- Shared pure elements ---- */
function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (<div className="ps-sec-head"><h2>{title}</h2>{action && <button onClick={onAction}>{action}</button>}</div>);
}

function ServiceCard({ s, onBook }: { s: any; onBook: () => void }) {
  const currencySymbol = useMemo(() => "₦", []);
  return (
    <div className="ps-card">
      <div className="ps-card-thumb svc" style={{ background: getCategoryTheme(s.cat)[0] }}>
        {s.image_url ? <img src={s.image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Calendar size={22} />}
      </div>
      <div className="ps-card-body">
        <b>{s.name}</b>
        <span className="ps-card-sub"><Clock size={12} /> {s.duration} min</span>
        <div className="ps-card-foot">
          <em>{currencySymbol + s.price.toLocaleString("en-NG")}</em>
          <button className="ps-mini book" onClick={onBook}>Book</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, onBuy }: { p: any; onBuy: () => void }) {
  const currencySymbol = useMemo(() => "₦", []);
  return (
    <div className="ps-card">
      <div className="ps-card-thumb prod" style={{ background: `linear-gradient(150deg, ${getCategoryTheme(p.cat)[0]}, ${getCategoryTheme(p.cat)[1]})` }}>
        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={22} />}
      </div>
      <div className="ps-card-body">
        <b>{p.name}</b>
        <div className="ps-card-foot">
          <em>{currencySymbol + p.price.toLocaleString("en-NG")}</em>
          <button className="ps-mini buy" onClick={onBuy}>Buy</button>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ b, colour, onOpen }: { b: any; colour: string; onOpen: () => void }) {
  return (
    <div className="blog-card" onClick={onOpen}>
      <div className={`blog-img ${colour}`}>
        {b.image_url ? <img src={b.image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        <span className="blog-cat">{b.cat}</span>
      </div>
      <div className="blog-body">
        <span className="blog-date">{b.read} read · {b.date}</span>
        <b>{b.title}</b>
        <p>{b.excerpt}</p>
        <span className="blog-read">Read article <ChevronRight size={14} /></span>
      </div>
    </div>
  );
}

function ServiceCardRich({ s, onBook, colour, badge }: { s: any; onBook: () => void; colour?: string; badge?: string }) {
  const currencySymbol = useMemo(() => "₦", []);
  return (
    <div className="svc-card" onClick={onBook}>
      <div className={`svc-card-thumb ${colour || "c0"}`}>
        {s.image_url ? <img src={s.image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Calendar size={24} />}
        {badge && <span className="svc-badge"><Star size={11} /> {badge}</span>}
        <span className="svc-card-cat">{s.cat}</span>
      </div>
      <div className="svc-card-body">
        <b>{s.name}</b>
        <span className="svc-card-dur"><Clock size={12} /> {s.duration} min</span>
        <p className="svc-card-desc">{s.desc}</p>
        <div className="svc-card-foot">
          <em>{currencySymbol + s.price.toLocaleString("en-NG")}</em>
          <span className="svc-card-book">Book <ChevronRight size={14} /></span>
        </div>
      </div>
    </div>
  );
}

function ProductCardRich({ p, onView, onBuy, colour, badge }: { p: any; onView: () => void; onBuy: () => void; colour?: string; badge?: string }) {
  const currencySymbol = useMemo(() => "₦", []);
  return (
    <div className="svc-card" onClick={onView}>
      <div className={`svc-card-thumb ${colour || "c0"}`}>
        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={24} />}
        {badge && <span className="svc-badge"><Star size={11} /> {badge}</span>}
        <span className="svc-card-cat">{p.cat}</span>
      </div>
      <div className="svc-card-body">
        <b>{p.name}</b>
        <p className="svc-card-desc">{p.desc}</p>
        <div className="svc-card-foot">
          <em>{currencySymbol + p.price.toLocaleString("en-NG")}</em>
          <button className="svc-card-book" onClick={(e) => { e.stopPropagation(); onBuy(); }}>Buy</button>
        </div>
      </div>
    </div>
  );
}

function ReviewCardRich({ rv }: { rv: any }) {
  return (
    <div className="rev-card">
      <div className="rev-card-head">
        <span className="rev-av">{rv.name[0]}</span>
        <div className="rev-card-who">
          <b>{rv.name}</b>
          <span>{rv.verified && <span className="rev-verif"><ShieldCheck size={12} /> Verified order</span>}<span className="ps-dot">•</span>{rv.when}</span>
        </div>
        <div className="rev-card-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < rv.r ? "f" : ""} />)}</div>
      </div>
      {rv.service && <span className="rev-card-svc">{rv.service}</span>}
      <p className="rev-card-text">{rv.text}</p>
      {rv.response && (
        <div className="rev-response">
          <div className="rev-response-head"><span className="rev-resp-av">V</span><b>Response from the studio</b><span>{rv.response.when}</span></div>
          <p>{rv.response.text}</p>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ rv, full }: { rv: any; full?: boolean }) {
  return (
    <div className={`ps-review ${full ? "full" : ""}`}>
      <div className="ps-review-top"><span className="ps-review-av">{rv.name[0]}</span><div><b>{rv.name}</b><span>{rv.when}</span></div></div>
      <div className="ps-review-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < rv.r ? "f" : ""} />)}</div>
      <p>{rv.text}</p>
    </div>
  );
}

function Accordion({ items, open, setOpen }: { items: any[]; open: number; setOpen: (i: number) => void }) {
  return (
    <div className="ps-acc">
      {items.map(([q, a], i) => (
        <div key={i} className={`ps-acc-item ${open === i ? "open" : ""}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)}>{q}<ChevronDown size={17} /></button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}

function LockedFrontstorePanel({ title, body, link }: { title: string; body: string; link?: string }) {
  return (
    <div className="ps-locked">
      <div className="ps-locked-top"><ShieldCheck size={16} /><b>{title}</b><Lock size={13} className="ps-locked-lock" /></div>
      <p style={{ margin: '8px 0 0' }}>{body}</p>
      {link && <button className="ps-locked-link">{link} <ChevronRight size={14} /></button>}
    </div>
  );
}

function StoreFoot({ onNav, slug }: { onNav: (p: string) => void, slug?: string }) {
  return (
    <footer className="ps-foot">
      <span className="ps-foot-secure"><Lock size={13} /> Secured by Frontstore</span>
      <p>Buyer protection and platform terms apply to every order on this store.</p>
      <div className="ps-foot-links">
        <button onClick={() => onNav("returns")}>Refunds</button>
        <button onClick={() => onNav("terms")}>Terms</button>
        <button onClick={() => onNav("privacy")}>Privacy</button>
        <button onClick={() => window.open('/terms', '_self')}>Platform terms</button>
        <button onClick={() => window.open(`mailto:hello@frontstore.ng?subject=Reporting Store: ${slug || 'store'}`, '_self')}>Report this store</button>
      </div>
    </footer>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="ps-sub"><div className="ps-sub-head"><h1>{title}</h1></div>{children}</div>);
}

function EmptyState() {
  return <div className="svc-empty">{EMPTY_SECTION_MESSAGE}</div>;
}

function Sheet({ title, children, onClose, onBack }: { title: string; children: React.ReactNode; onClose: () => void; onBack?: () => void }) {
  return (
    <div className="ps-overlay" onClick={onClose}>
      <div className="ps-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ps-sheet-grip" />
        <div className="ps-sheet-head">
          {onBack ? <button className="ps-sheet-back" onClick={onBack} aria-label="Back"><ChevronLeft size={20} /></button> : <span className="ps-sheet-back-sp" />}
          <b>{title}</b>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Embedded premium styles string from template
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');

.ps-root{--brand:#b14a6e;--brand-deep:#7c2f4d;--gold:#c79a4b;--bg:#faf4ef;--card:#fff;--ink:#2a1d22;
  --muted:#8a7680;--line:#efe1da;--ok:#1f9d57;--wa:#25d366;
  font-family:'Hanken Grotesk',system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;}
.ps-root *{box-sizing:border-box;}
.ps-root :where(button){font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;padding:0;}

.ps-logo{font-weight:800;font-size:19px;letter-spacing:-.02em;color:var(--primary);flex:1;text-align:left;display:inline-flex;align-items:center;gap:7px;}

.ps-logo.as-btn{cursor:pointer;}
.ps-verif{color:var(--brand);vertical-align:-2px;}
.ps-star{color:var(--gold);fill:var(--gold);}
.ps-dot{opacity:.5;margin:0 2px;}

/* ===================== MOBILE ===================== */
.ps-col{max-width:860px;margin:0 auto;}
.ps-top{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:13px 16px;background:rgba(250,244,239,.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);}
.ps-burger,.ps-top-icon,.ps-top-share{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;color:var(--ink);}
.ps-main{padding:16px 16px 96px;}

.ps-cover-wrap{margin-bottom:18px;}
.ps-cover{height:clamp(150px,42vw,210px);margin:0 -16px;background:linear-gradient(135deg,var(--brand-deep),var(--brand) 55%,var(--gold));
  position:relative;overflow:hidden;border-radius:0 0 18px 18px;}
.ps-cover-icn{position:absolute;right:-26px;bottom:-36px;width:clamp(200px,52vw,280px);height:clamp(200px,52vw,280px);color:#fff;opacity:.2;pointer-events:none;
  -webkit-mask-image:radial-gradient(circle at 60% 44%,#000 32%,transparent 74%);mask-image:radial-gradient(circle at 60% 44%,#000 32%,transparent 74%);}
.ps-avatar{width:84px;height:84px;border-radius:22px;background:linear-gradient(150deg,var(--brand),var(--brand-deep));
  color:#fff;font-family:'Fraunces';font-weight:700;font-size:38px;display:grid;place-items:center;border:4px solid var(--bg);margin-top:-44px;position:relative;}
.ps-name{font-family:'Fraunces';font-weight:700;font-size:24px;letter-spacing:-.02em;line-height:1.15;margin-top:13px;display:flex;align-items:center;gap:6px;}
.ps-meta{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:5px;margin-top:4px;}
.ps-url{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--brand-deep);background:#f6e8ee;padding:7px 12px;border-radius:9px;margin-top:11px;max-width:100%;min-width:0}
.ps-id-actions-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:11px;}
.ps-id-actions-row .ps-url{margin-top:0;max-width:100%;min-width:0}
.ps-url-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.ps-url svg{flex-shrink:0}
.ps-notify{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#fff;background:var(--brand);padding:8px 13px;border-radius:9px;box-shadow:0 4px 12px rgba(177,74,110,.28);cursor:pointer;flex-shrink:0}
.nt-topics{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px;}
.nt-topic{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;padding:9px 13px;border-radius:11px;border:1px solid var(--line);background:var(--card);color:#4f3f46;cursor:pointer;}
.nt-topic.on{background:#f6e8ee;border-color:var(--brand);color:var(--brand-deep);}
.ps-stats{display:flex;gap:10px;margin-top:16px;}
.ps-stats div{flex:1;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:11px;text-align:center;}
.ps-stats b{display:flex;align-items:center;justify-content:center;gap:4px;font-family:'Fraunces';font-weight:700;font-size:17px;}
.ps-stats span{font-size:11px;color:var(--muted);}
.ps-bio{font-size:14px;line-height:1.55;color:#4f3f46;margin-top:15px;}
.ps-statusline{display:flex;align-items:center;gap:14px;margin-top:13px;flex-wrap:wrap;}
.ps-open{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ok);}
.ps-open.closed{color:#9a3b3b;}
.svc-open{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ok);}
.svc-open.closed{color:#9a3b3b;}
.ps-pulse{width:8px;height:8px;border-radius:50%;background:var(--ok);animation:pspulse 1.8s infinite;}
@keyframes pspulse{0%{box-shadow:0 0 0 0 rgba(31,157,87,.45);}70%{box-shadow:0 0 0 7px rgba(31,157,87,0);}100%{box-shadow:0 0 0 0 rgba(31,157,87,0);}}
.ps-secure{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);}
.ps-secure svg{color:var(--brand);}

.ps-ann{display:flex;align-items:flex-start;gap:10px;background:#fbf2e3;border:1px solid #ecd9bf;border-radius:14px;padding:12px 13px;margin-bottom:18px;}
.ps-ann svg:first-child{color:var(--gold);flex:0 0 auto;margin-top:1px;}
.ps-ann p{flex:1;font-size:13px;color:#7a5a36;line-height:1.5;}
.ps-ann b{color:var(--brand-deep);margin-right:5px;}
.ps-ann button{flex:0 0 auto;color:#b39064;}

.ps-signature{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:18px;box-shadow:0 8px 22px rgba(124,47,77,.07);}
.ps-sig-tag{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand-deep);background:#f6e8ee;padding:4px 9px;border-radius:7px;}
.ps-sig-body{display:flex;align-items:center;gap:12px;margin:12px 0;}
.ps-sig-thumb{width:60px;height:60px;border-radius:14px;flex:0 0 auto;background:linear-gradient(150deg,#f0dfe6,#e7cdb6);color:var(--brand-deep);display:grid;place-items:center;}
.ps-sig-main b{display:block;font-size:15.5px;font-weight:700;}
.ps-sig-main span{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--muted);margin:2px 0;}
.ps-sig-main em{font-family:'Fraunces';font-weight:700;font-size:17px;font-style:normal;color:var(--brand-deep);}
.ps-book-btn,.ps-sheet-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:15px;padding:13px;border-radius:12px;box-shadow:0 6px 16px rgba(177,74,110,.3);}
.ps-book-btn:active,.ps-sheet-cta:active{transform:translateY(2px);}

.ps-searchbar{display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px 14px;color:var(--muted);font-size:14px;cursor:pointer;margin-bottom:11px;}
.ps-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:22px;scrollbar-width:none;}
.ps-chips::-webkit-scrollbar{display:none;}
.ps-chips button{flex:0 0 auto;font-size:13px;font-weight:600;padding:8px 14px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:#4f3f46;}

.ps-sec-head{display:flex;align-items:baseline;justify-content:space-between;margin:6px 0 12px;}
.ps-sec-head h2{font-family:'Fraunces';font-weight:600;font-size:19px;letter-spacing:-.01em;}
.ps-sec-head button{font-size:12.5px;font-weight:600;color:var(--brand);}

.ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;}
.ps-card{background:var(--card);border:1px solid var(--line);border-radius:15px;overflow:hidden;display:flex;flex-direction:column;}
.ps-card-thumb{height:108px;display:grid;place-items:center;color:#fff;position:relative;}
.ps-card-thumb.svc{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.ps-card-thumb.prod{background:linear-gradient(150deg,#caa06f,var(--gold));}
.ps-card-thumb img{width:100%;height:100%;object-fit:cover;}
.ps-card-body{padding:11px 12px 12px;display:flex;flex-direction:column;flex:1;}
.ps-card-body b{font-size:14px;font-weight:600;line-height:1.3;}
.ps-card-sub{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);margin-top:3px;}
.ps-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:10px;}
.ps-card-foot em{font-family:'Fraunces';font-weight:700;font-size:15px;font-style:normal;color:var(--brand-deep);}
.ps-mini{font-size:13px;font-weight:700;padding:7px 15px;border-radius:9px;color:#fff;background:var(--brand);box-shadow:0 3px 8px rgba(177,74,110,.28);}
.ps-mini:active{transform:translateY(1px);}
.ps-seeall{display:flex;align-items:center;justify-content:center;gap:5px;width:100%;font-size:13.5px;font-weight:700;color:var(--brand-deep);background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:13px 0 24px;}

.ps-rating{display:flex;gap:18px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px;}
.ps-rating-score{text-align:center;flex:0 0 auto;}
.ps-rating-score>b{font-family:'Fraunces';font-weight:700;font-size:40px;line-height:1;color:var(--brand-deep);}
.ps-rating-stars{display:flex;gap:2px;justify-content:center;margin:5px 0 3px;}
.ps-rating-stars .f,.ps-review-stars .f{color:var(--gold);fill:var(--gold);}
.ps-rating-score span{display:block;font-size:13px;font-weight:700;}
.ps-rating-score i{font-size:11px;color:var(--muted);font-style:normal;}
.ps-rating-bars{flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px;}
.ps-bar{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--muted);}
.ps-bar>div{flex:1;height:7px;background:#f0e4de;border-radius:4px;overflow:hidden;}
.ps-bar i{display:block;height:100%;background:var(--brand);border-radius:4px;}

.ps-reviews-row{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none;}
.ps-reviews-row::-webkit-scrollbar{display:none;}
.ps-reviews-row .ps-review{flex:0 0 78%;max-width:300px;}
.ps-reviews-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;}
.ps-review{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;}
.ps-review-top{display:flex;align-items:center;gap:9px;margin-bottom:8px;}
.ps-review-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-weight:700;font-size:14px;display:grid;place-items:center;}
.ps-review-top b{font-size:13.5px;font-weight:700;display:block;}
.ps-review-top span{font-size:11px;color:var(--muted);}
.ps-review-stars{display:flex;gap:2px;margin-bottom:7px;}
.ps-review-stars svg{color:#e0d2cb;}
.ps-review p{font-size:13px;line-height:1.5;color:#4f3f46;}

.ps-visit{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:24px;}
.ps-map{height:150px;background:repeating-linear-gradient(45deg,#ece0d9,#ece0d9 12px,#e6d8d0 12px,#e6d8d0 24px);display:grid;place-items:center;color:var(--brand-deep);gap:4px;}
.ps-map span{font-size:12px;color:var(--muted);}
.ps-map.lg{height:200px;border-radius:16px;margin-bottom:14px;}
.ps-visit-info{padding:15px;}
.ps-addr{display:flex;align-items:flex-start;gap:7px;font-size:13.5px;color:#4f3f46;line-height:1.5;}
.ps-addr svg{flex:0 0 auto;margin-top:2px;color:var(--brand);}
.ps-dir{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--brand-deep);border:1px solid var(--line);border-radius:10px;padding:9px 14px;margin-top:12px;}
.ps-hours{list-style:none;margin-top:14px;border-top:1px solid var(--line);}
.ps-hours li{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid var(--line);color:#5f4d55;}
.ps-hours li b{font-weight:600;color:var(--ink);}
.ps-hours li.today{color:var(--brand-deep);font-weight:700;}
.ps-hours li.today b{color:var(--brand-deep);}
.ps-hours.wide{max-width:420px;}
.ps-hours-empty{margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);}

.ps-acc{display:flex;flex-direction:column;gap:9px;margin-bottom:24px;}
.ps-acc-item{background:var(--card);border:1px solid var(--line);border-radius:13px;overflow:hidden;}
.ps-acc-item>button{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;font-size:14px;font-weight:600;padding:14px;}
.ps-acc-item>button svg{flex:0 0 auto;color:var(--muted);transition:transform .2s;}
.ps-acc-item.open>button svg{transform:rotate(180deg);}
.ps-acc-item p{padding:0 14px 14px;font-size:13px;line-height:1.55;color:#4f3f46;}

.ps-locked{background:#f6e8ee;border:1px solid #e6c9d5;border-radius:14px;padding:14px;margin:16px 0 8px;}
.ps-locked-top{display:flex;align-items:center;gap:8px;}
.ps-locked-top b{flex:1;font-size:14px;font-weight:700;color:var(--brand-deep);}
.ps-locked-top svg{color:var(--brand);}
.ps-locked-lock{color:var(--muted)!important;}
.ps-locked p{font-size:12.5px;line-height:1.55;color:#6e545d;margin-top:8px;}
.ps-locked-link{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:10px;}

.ps-sub-head{margin-bottom:18px;}
.ps-sub-head h1{font-family:'Fraunces';font-weight:700;font-size:26px;letter-spacing:-.02em;}
.ps-sub-head span{font-size:12px;color:var(--muted);}
.ps-prose{font-size:14px;line-height:1.65;color:#4f3f46;margin-bottom:13px;}
.ps-prose b{color:var(--ink);}
.ps-about-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:8px 0 16px;}
.ps-about-grid div{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:14px;text-align:center;}
.ps-about-grid b{font-family:'Fraunces';font-weight:700;font-size:20px;color:var(--brand-deep);display:block;}
.ps-about-grid span{font-size:11.5px;color:var(--muted);}
.ps-contact-actions{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0;}
.ps-msg{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:#fff;background:var(--wa);border-radius:10px;padding:9px 14px;}
.ps-socials{display:flex;gap:10px;margin-top:16px;}
.ps-socials button{width:44px;height:44px;border-radius:12px;border:1px solid var(--line);display:grid;place-items:center;color:var(--brand-deep);}

.ps-foot{border-top:1px solid var(--line);margin-top:10px;padding-top:18px;text-align:center;}
.ps-foot-secure{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--brand-deep);}
.ps-foot p{font-size:12px;color:var(--muted);margin:6px auto 12px;line-height:1.5;max-width:320px;}
.ps-foot-links{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:12px;}
.ps-foot-links button{font-size:12px;font-weight:600;color:#6e545d;}
.ps-foot small{font-size:11px;color:var(--muted);}

.ps-drawer-back{position:fixed;inset:0;background:rgba(42,29,34,.45);z-index:60;animation:psfade .2s;}
.ps-drawer{position:absolute;top:0;left:0;bottom:0;width:84%;max-width:330px;background:var(--card);animation:psslide .25s ease;overflow-y:auto;}
@keyframes psslide{from{transform:translateX(-100%);}to{transform:translateX(0);}}
.ps-panel{display:flex;flex-direction:column;min-height:100%;padding:20px 18px;gap:16px;}
.ps-panel-top{display:flex;align-items:center;justify-content:space-between;}
.ps-x{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;color:var(--ink);}
.ps-id{display:flex;gap:11px;align-items:center;text-align:left;padding:13px;border:1px solid var(--line);border-radius:14px;width:100%;}
.ps-id-av{width:42px;height:42px;border-radius:12px;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:20px;display:grid;place-items:center;}
.ps-id-main{display:flex;flex-direction:column;gap:2px;min-width:0;}
.ps-id-main b{font-size:14px;font-weight:700;display:flex;align-items:center;gap:4px;}
.ps-id-main i{font-size:11px;color:var(--muted);font-style:normal;}
.ps-id-main em{font-size:11.5px;font-style:normal;color:var(--muted);display:flex;align-items:center;gap:4px;}
.ps-nav{display:flex;flex-direction:column;gap:1px;}
.ps-nav button{display:flex;align-items:center;justify-content:space-between;text-align:left;font-size:14.5px;font-weight:500;padding:11px 12px;border-radius:10px;color:#4f3f46;}
.ps-nav button.on{background:#f6e8ee;color:var(--brand-deep);font-weight:700;}
.ps-panel-actions{display:flex;flex-direction:column;gap:9px;margin-top:auto;}
.ps-act-book{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:13px;border-radius:12px;box-shadow:0 6px 16px rgba(177,74,110,.3);}
.ps-act-row{display:flex;gap:9px;}
.ps-act-row button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:600;padding:11px;border-radius:11px;border:1px solid var(--line);color:var(--brand-deep);}
.ps-panel-foot{border-top:1px solid var(--line);padding-top:13px;}
.ps-panel-foot span{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--brand-deep);}
.ps-panel-foot p{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.5;}

.ps-bottom{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;align-items:center;justify-content:space-around;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);padding:8px 0 calc(8px + env(safe-area-inset-bottom));}
.ps-bottom>button{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;font-weight:600;color:var(--muted);flex:1;}
.ps-bottom>button.on{color:var(--brand);}
.ps-fab{position:relative;}
.ps-fab svg{position:relative;z-index:1;width:54px;height:54px;background:var(--brand);color:#fff;padding:16px;border-radius:50%;box-shadow:0 8px 20px rgba(177,74,110,.4);margin-top:-26px;}
.ps-fab-ring{position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:54px;height:54px;border-radius:50%;border:2px solid var(--brand);opacity:.5;animation:psring 2s infinite;}
.ps-fab-badge{position:absolute;top:-30px;left:50%;transform:translateX(9px);z-index:3;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:var(--gold);color:#3a1d22;font-size:11px;font-weight:800;font-style:normal;display:grid;place-items:center;border:2px solid #fff;}
@keyframes psring{0%{transform:translateX(-50%) scale(1);opacity:.5;}100%{transform:translateX(-50%) scale(1.5);opacity:0;}}
.ps-cart-ic{position:relative;}
.ps-cart-ic i{position:absolute;top:-5px;right:-8px;background:var(--brand);color:#fff;font-size:9px;font-weight:800;font-style:normal;min-width:15px;height:15px;border-radius:8px;display:grid;place-items:center;padding:0 3px;}

.ps-overlay{position:fixed;inset:0;background:rgba(42,29,34,.5);z-index:70;display:flex;align-items:flex-end;justify-content:center;animation:psfade .2s;}
@keyframes psfade{from{opacity:0;}to{opacity:1;}}
.ps-sheet,.ps-search-panel{background:var(--bg);width:100%;max-width:560px;border-radius:22px 22px 0 0;padding:8px 18px calc(24px + env(safe-area-inset-bottom));animation:pssheet .26s ease;max-height:88vh;overflow-y:auto;}
@keyframes pssheet{from{transform:translateY(100%);}to{transform:translateY(0);}}
@media(min-width:760px){.ps-overlay{align-items:center;}.ps-sheet,.ps-search-panel{border-radius:20px;margin:0 16px;max-height:82vh;}}
.ps-sheet-grip{width:40px;height:4px;border-radius:3px;background:#d8c4bc;margin:6px auto 12px;}
.ps-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.ps-sheet-head b{font-family:'Fraunces';font-weight:600;font-size:18px;}
.ps-sheet-head button{color:var(--muted);}
.ps-sheet-sub{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);margin-bottom:16px;}
.ps-field-lbl{font-size:12.5px;font-weight:700;color:#5f4d55;margin:14px 0 8px;}
.ps-pick{display:flex;gap:9px;flex-wrap:wrap;}
.ps-pick button{font-size:13px;font-weight:600;padding:9px 15px;border-radius:11px;border:1px solid var(--line);background:var(--card);color:#4f3f46;}
.ps-pick button.on{background:var(--brand);color:#fff;border-color:var(--brand);}
.ps-deposit{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);margin:16px 0;line-height:1.5;}
.ps-deposit.center{justify-content:center;margin:12px 0 0;}
.ps-sheet-back,.ps-sheet-back-sp{width:24px;flex:none;display:inline-flex;align-items:center;justify-content:center;color:var(--muted);cursor:pointer;}
.ps-sheet-head b{flex:1;text-align:center;}
.ps-sheet-cta:disabled{opacity:.45;box-shadow:none;cursor:default;}

/* booking flow */
.bk-svclist{display:flex;flex-direction:column;gap:9px;}
.bk-svc{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:11px 13px;border:1px solid var(--line);border-radius:13px;background:var(--card);cursor:pointer;transition:border-color .12s,background .12s;}
.bk-svc:hover{border-color:var(--brand);background:#fff;}
.bk-thumb{width:44px;height:44px;flex:none;border-radius:10px;display:grid;place-items:center;color:#fff;}
.bk-svc-main{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;}
.bk-svc-main b{font-size:14.5px;font-weight:700;color:var(--ink);}
.bk-svc-main i{font-style:normal;font-size:12px;color:var(--muted);}
.bk-svc-price{display:inline-flex;align-items:center;gap:5px;flex:none;font-size:13.5px;font-weight:700;color:var(--brand);}
.bk-svcbar{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#f6e8ee;border:1px solid #e6c9d5;border-radius:12px;padding:10px 13px;margin-bottom:16px;}
.bk-svcbar span{display:flex;flex-direction:column;gap:2px;min-width:0;}
.bk-svcbar b{font-size:13.5px;font-weight:700;color:var(--brand-deep);}
.bk-svcbar i{font-style:normal;font-size:11.5px;color:var(--brand);}
.bk-svcbar button{flex:none;font-size:12px;font-weight:700;color:var(--brand);text-decoration:underline;cursor:pointer;}
.bk-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.bk-cal-head b{font-family:'Fraunces';font-weight:600;font-size:16px;color:var(--ink);}
.bk-cal-head button{width:34px;height:34px;border-radius:9px;border:1px solid var(--line);display:grid;place-items:center;color:var(--ink);cursor:pointer;}
.bk-cal-head button:disabled{opacity:.3;cursor:default;}
.bk-cal-wd{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px;}
.bk-cal-wd span{text-align:center;font-size:11px;font-weight:700;color:var(--muted);}
.bk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;}
.bk-cal-blank{aspect-ratio:1;}
.bk-cal-day{aspect-ratio:1;display:grid;place-items:center;border-radius:9px;font-size:13.5px;font-weight:600;color:var(--ink);background:var(--card);border:1px solid var(--line);cursor:pointer;transition:background .1s,color .1s,border-color .1s;}
.bk-cal-day:hover:not(.off){border-color:var(--brand);color:var(--brand);}
.bk-cal-day.sel{background:var(--brand);color:#fff;border-color:var(--brand);}
.bk-cal-day.off{opacity:.3;cursor:default;background:transparent;border-color:transparent;}
.bk-times{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px;}
.bk-slot{padding:11px 0;border-radius:10px;border:1px solid var(--line);background:var(--card);font-size:13.5px;font-weight:600;color:var(--ink);cursor:pointer;}
.bk-slot:hover:not(.taken){border-color:var(--brand);color:var(--brand);}
.bk-slot.taken{opacity:.32;cursor:default;text-decoration:line-through;}
.bk-empty{font-size:13px;color:var(--muted);padding:14px 0;text-align:center;}
.bk-summary{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:13px;overflow:hidden;margin-bottom:6px;}
.bk-summary div{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--line);}
.bk-summary div:last-child{border-bottom:none;}
.bk-summary span{font-size:12.5px;color:var(--muted);}
.bk-summary b{font-size:13.5px;font-weight:700;color:var(--ink);}
.bk-input{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--ink);font-size:13.5px;outline:none;}
.bk-input:focus{border-color:var(--brand);}
.bk-textarea{height:80px;resize:none;}
.bk-deposit-row{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:0 2px;}
.bk-deposit-row span{font-size:13.5px;font-weight:600;color:var(--brand-deep);display:inline-flex;align-items:center;gap:5px;}
.bk-deposit-row b{font-size:16.5px;font-weight:800;color:var(--brand-deep);}

/* share details */
.ps-share-url{display:flex;align-items:center;justify-content:space-between;background:#f3eae5;border-radius:11px;padding:10px 14px;font-size:13px;margin-bottom:16px;}
.ps-share-url button{color:var(--brand);display:grid;place-items:center;}
.ps-share-wa{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;background:#25d366;color:#fff;font-weight:700;font-size:14.5px;padding:12px;border-radius:12px;margin-bottom:12px;}

/* toast notification styling */
.ps-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(40px);background:rgba(43,29,42,.9);
  color:#fff;padding:10px 18px;border-radius:24px;font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:6px;
  opacity:0;pointer-events:none;transition:transform .2s,opacity .2s;z-index:200;}
.ps-toast.show{opacity:1;transform:translateX(-50%);}

/* ===================== DESKTOP STYLING ===================== */
.pd-wrap{max-width:1200px;margin:0 auto;padding:0 24px 80px;}
.pd-header{display:flex;align-items:center;justify-content:space-between;height:72px;border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(250,244,239,.9);backdrop-filter:blur(8px);z-index:30;}
.pd-search{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;color:var(--muted);font-size:13.5px;cursor:pointer;width:320px;}
.pd-header-actions{display:flex;align-items:center;gap:10px;}
.pd-hicon{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;border:1px solid var(--line);background:var(--card);position:relative;}
.pd-hicon i{position:absolute;top:-4px;right:-4px;background:var(--brand);color:#fff;font-size:9px;font-weight:800;font-style:normal;min-width:16px;height:16px;border-radius:8px;display:grid;place-items:center;}
.pd-head-book{background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px 18px;border-radius:11px;box-shadow:0 4px 12px rgba(177,74,110,.25);}

.pd-container{margin-top:20px;}
.pd-cover{border-radius:24px;overflow:hidden;background:var(--card);border:1px solid var(--line);box-shadow:0 4px 14px rgba(43,29,42,.03);margin-bottom:24px;}
.pd-cover-art{height:200px;background:linear-gradient(135deg,var(--brand-deep),var(--brand) 55%,var(--gold));position:relative;overflow:hidden;}
.pd-cover-icn{position:absolute;right:-32px;bottom:-44px;width:260px;height:260px;color:#fff;opacity:.15;pointer-events:none;}
.pd-identity{padding:0 28px 24px;display:flex;align-items:flex-end;gap:20px;position:relative;}
.pd-avatar{width:112px;height:112px;border-radius:28px;background:linear-gradient(150deg,var(--brand),var(--brand-deep));
  color:#fff;font-family:'Fraunces';font-weight:700;font-size:48px;display:grid;place-items:center;border:6px solid var(--card);margin-top:-56px;z-index:2;position:relative;}
.pd-identity-main{flex:1;min-width:0;}
.pd-identity-main h1{font-family:'Fraunces';font-weight:700;font-size:28px;letter-spacing:-.02em;line-height:1.2;display:flex;align-items:center;gap:8px;text-shadow:0 1px 2px rgba(255,255,255,.9),0 0 14px rgba(255,255,255,.55);}
.pd-identity-main p{font-size:13.5px;color:var(--muted);display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap;text-shadow:0 1px 2px rgba(255,255,255,.9),0 0 14px rgba(255,255,255,.55);}
.pd-identity-actions{display:flex;gap:10px;}
.pd-book{background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px 18px;border-radius:11px;}
.pd-ghost{border:1px solid var(--line);background:var(--card);color:var(--ink);font-weight:600;font-size:13.5px;padding:11px 18px;border-radius:11px;}

.pd-tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:24px;overflow-x:auto;}
.pd-tabs button{font-size:14.5px;font-weight:600;color:var(--muted);padding:10px 18px;border-bottom:2px solid transparent;transition:color .12s,border-color .12s;}
.pd-tabs button.on{color:var(--brand-deep);border-bottom-color:var(--brand-deep);font-weight:700;}

.pd-home{display:grid;grid-template-columns:300px 1fr;gap:30px;align-items:start;}
.pd-railcard{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px;margin-bottom:16px;}
.pd-railcard h3{font-family:'Fraunces';font-size:16px;font-weight:700;margin-bottom:12px;}
.pd-railcard p{font-size:13.5px;line-height:1.55;color:#4f3f46;}
.pd-raillink{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:var(--brand);margin-top:12px;}
.pd-railmap{height:120px;border-radius:12px;background:#ecdcd2;display:grid;place-items:center;color:var(--brand-deep);margin-bottom:12px;}
.pd-railbtns{display:flex;gap:8px;margin-top:12px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:12px;}
.pd-railbtns button{flex:1;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:5px;}
.pd-trust-h{font-size:13.5px;font-weight:700;color:var(--brand-deep);display:inline-flex;align-items:center;gap:6px;margin-bottom:6px;}

.pd-feed{min-width:0;}
.pd-sec-head{display:flex;justify-content:space-between;align-items:baseline;margin:28px 0 16px;border-bottom:1px solid var(--line);padding-bottom:10px;}
.pd-sec-head h2{font-family:'Fraunces';font-size:22px;font-weight:700;letter-spacing:-.01em;}
.pd-sec-head button{font-size:13px;font-weight:700;color:var(--brand);}
.pd-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;}
.pd-grid.reviews{grid-template-columns:1fr;gap:12px;}

/* services & products list desktop styles */
.svc-page{padding-bottom:20px;}
.svc-feat-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-bottom:28px;}
.svc-body{display:grid;grid-template-columns:260px 1fr;gap:26px;align-items:start;}
.svc-rail{position:sticky;top:90px;display:flex;flex-direction:column;gap:16px;}
.svc-search{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;}
.svc-search input{border:none;background:none;outline:none;font-size:13.5px;width:100%;}
.svc-filters{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:6px 14px;}
.svc-fgroup{padding:14px 0;border-top:1px solid var(--line);}
.svc-fgroup:first-child{border-top:none;}
.svc-fgroup h4{font-size:11px;font-weight:800;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
.svc-radios{display:flex;flex-direction:column;gap:2px;}
.svc-radios button{text-align:left;padding:8px;font-size:13px;border-radius:8px;}
.svc-radios button.on{background:var(--tint);color:var(--brand-deep);font-weight:700;}
.svc-book-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.svc-book-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14px;padding:12px;border-radius:11px;box-shadow:0 4px 12px rgba(177,74,110,.25);}
.svc-main{min-width:0;}
.svc-results-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.svc-clear{font-size:12.5px;color:var(--brand);font-weight:700;}
.svc-card{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:transform .12s;}
.svc-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(43,29,42,.06);}
.svc-card-thumb{height:140px;position:relative;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--brand),var(--brand-deep));}
.svc-card-thumb img{width:100%;height:100%;object-fit:cover;}
.svc-card-cat{position:absolute;bottom:10px;left:10px;width:max-content;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--brand-deep);background:#fff;padding:3px 8px;border-radius:6px;}
.svc-card-body{padding:14px;display:flex;flex-direction:column;flex:1;}
.svc-card-body b{font-size:14.5px;font-weight:700;}
.svc-card-dur{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:4px;margin-top:4px;}
.svc-card-desc{font-size:12.5px;color:#5f4d55;line-height:1.5;margin-top:10px;flex:1;}
.svc-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;}
.svc-card-foot em{font-family:'Fraunces';font-size:16.5px;font-weight:700;font-style:normal;}
.svc-card-book{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:#fff;background:var(--brand);padding:8px 14px;border-radius:9px;}

/* blog Listing desktop styles */
.blogp-body{display:grid;grid-template-columns:1fr 300px;gap:30px;align-items:start;}
.blogp-main{min-width:0;}
.blog-hero{background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden;cursor:pointer;margin-bottom:24px;}
.blog-hero-img{height:240px;position:relative;}
.blog-hero-img img{width:100%;height:100%;object-fit:cover;}
.blog-hero-body{padding:20px;}
.blog-kicker{font-size:11px;font-weight:800;text-transform:uppercase;color:var(--brand);display:block;margin-bottom:6px;}
.blog-hero-body h3{font-family:'Fraunces';font-size:20px;font-weight:700;margin-bottom:8px;}
.blog-hero-body p{font-size:13.5px;color:var(--muted);line-height:1.55;margin-bottom:14px;}
.blog-meta{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);margin-bottom:14px;}
.blog-author{display:flex;align-items:center;gap:6px;font-weight:700;color:var(--ink);}
.blog-author-av{width:20px;height:20px;border-radius:50%;background:var(--brand);color:#fff;display:inline-grid;place-items:center;font-size:10px;}
.blog-read{font-size:13px;font-weight:700;color:var(--brand);display:inline-flex;align-items:center;gap:2px;}
.blog-grid{display:grid;grid-template-columns:repeat(2, 1fr);gap:16px;}
.blog-card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;cursor:pointer;}
.blog-img{height:120px;position:relative;}
.blog-img img{width:100%;height:100%;object-fit:cover;}
.blog-body{padding:14px;}
.blog-date{font-size:11px;color:var(--muted);display:block;margin-bottom:6px;}
.blog-card b{font-size:14px;font-weight:700;line-height:1.35;display:block;margin-bottom:6px;}
.blog-card p{font-size:12.5px;color:var(--muted);line-height:1.5;margin-bottom:12px;}
.blogp-rail{position:sticky;top:90px;}
.author-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:16px;}
.author-top{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.author-av{width:36px;height:36px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;}
.author-top b{display:block;font-size:14px;}
.author-top span{font-size:11.5px;color:var(--muted);}
.author-card p{font-size:12.5px;color:#5f4d55;line-height:1.5;}
.author-link{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:12px;}
.blog-convert{background:var(--tint);border:1px solid #e6c9d5;border-radius:18px;padding:16px;margin-top:16px;}
.blog-convert b{font-size:14.5px;font-weight:700;display:block;}
.blog-convert p{font-size:12.5px;color:#6e545d;line-height:1.5;margin:6px 0 12px;}
.blog-convert-cta{width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:10px;border-radius:10px;}
.blog-convert-ghost{width:100%;background:none;border:none;color:var(--brand-deep);font-weight:700;font-size:13px;margin-top:8px;}

/* article details desktop */
.art-hero{height:300px;position:relative;}
.art-hero img{width:100%;height:100%;object-fit:cover;}
.art-wrap{display:grid;grid-template-columns:1fr 300px;gap:30px;align-items:start;}
.art-main{min-width:0;}
.art-kicker{font-size:11px;font-weight:800;text-transform:uppercase;color:var(--brand);margin-bottom:6px;}
.art-title{font-family:'Fraunces';font-size:30px;line-height:1.15;font-weight:700;margin-bottom:12px;}
.art-meta{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted);margin-bottom:24px;}
.art-meta-av{width:22px;height:22px;border-radius:50%;background:var(--brand);color:#fff;display:inline-grid;place-items:center;font-size:11px;font-weight:700;}
.art-meta-by{font-weight:700;color:var(--ink);}
.art-body{font-size:14.5px;line-height:1.65;color:var(--ink);}
.art-body p{margin-bottom:14px;}
.art-body h3{font-family:'Fraunces';font-size:18px;font-weight:700;margin:24px 0 10px;}
.art-body ul{margin:0 0 14px;padding-left:18px;}
.art-body li{margin-bottom:6px;}
.art-author{display:flex;gap:12px;align-items:start;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:30px;}
.art-author-tag{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;}
.art-author-main b{display:block;font-size:14.5px;margin-top:2px;}
.art-author-role{font-size:12px;color:var(--brand);font-weight:700;display:block;margin-bottom:6px;}
.art-author-main p{font-size:13px;line-height:1.5;color:var(--muted);}
.art-rail{position:sticky;top:90px;}
.art-share{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.art-share-h{font-size:13px;font-weight:700;display:block;margin-bottom:10px;}
.art-share-row{display:flex;gap:8px;}
.art-share-row button{flex:1;border:1px solid var(--line);background:var(--bg);border-radius:9px;padding:8px;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:4px;}
.art-related{margin-top:40px;border-top:1px solid var(--line);padding-top:24px;}

/* about & portfolio desktop */
.ab-wrap{display:grid;grid-template-columns:1fr 300px;gap:30px;align-items:start;}
.ab-main{min-width:0;}
.ab-rail{position:sticky;top:90px;}
.ab-kicker{font-size:11px;font-weight:800;text-transform:uppercase;color:var(--brand);letter-spacing:.05em;}
.ab-headline{font-family:'Fraunces';font-size:32px;line-height:1.2;font-weight:700;margin:8px 0 14px;}
.ab-lede{font-size:15px;line-height:1.6;color:#5f4d55;}
.ab-founder{display:grid;grid-template-columns:220px 1fr;gap:24px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px;margin:24px 0;}
.ab-portrait{position:relative;aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,var(--brand-deep),var(--brand) 55%,var(--gold));display:grid;place-items:center;}
.ab-portrait img{width:100%;height:100%;object-fit:cover;}
.ab-portrait-mono{font-family:'Fraunces';font-size:72px;color:rgba(255,255,255,.3);}
.ab-portrait-tag{position:absolute;left:10px;bottom:10px;font-size:10px;font-weight:700;color:var(--brand-deep);background:#fff;padding:4px 9px;border-radius:14px;}
.ab-name{font-family:'Fraunces';font-size:20px;font-weight:700;margin:6px 0 2px;}
.ab-role{font-size:12.5px;color:var(--brand-deep);font-weight:700;display:block;}
.ab-bio{font-size:13.5px;line-height:1.55;color:#5f4d55;margin:10px 0;}
.ab-chips{display:flex;flex-wrap:wrap;gap:6px;}
.ab-chips span{font-size:11px;font-weight:700;color:var(--brand-deep);background:var(--tint);padding:4px 10px;border-radius:14px;}
.ab-creds{margin-top:16px;}
.ab-creds-h{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;}
.ab-creds ul{list-style:none;padding:0;margin-top:8px;}
.ab-creds li{font-size:12.5px;color:#4f3f46;display:flex;align-items:center;gap:6px;margin-bottom:6px;}
.ab-creds li svg{color:var(--brand);flex-shrink:0;}
.ab-quote{font-family:'Fraunces';font-style:italic;font-size:15px;line-height:1.5;border-left:3px solid var(--brand);padding-left:12px;margin:16px 0;}
.ab-socials{display:flex;gap:8px;}
.ab-socials button{border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:12.5px;font-weight:600;display:inline-flex;align-items:center;gap:6px;}
.ab-section{margin:24px 0;}
.ab-subhead{font-family:'Fraunces';font-size:18px;font-weight:700;margin-bottom:12px;}
.ab-gallery{display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;}
.ab-shot{aspect-ratio:1;border-radius:14px;overflow:hidden;cursor:pointer;position:relative;}
.ab-shot img{width:100%;height:100%;object-fit:cover;}
.ab-shot-cap{position:absolute;left:10px;bottom:10px;font-size:11px;font-weight:700;color:#fff;background:rgba(43,29,42,.5);padding:4px 8px;border-radius:10px;}
.ab-featured{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin:24px 0;}
.ab-featured-h{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;display:flex;align-items:center;gap:6px;}
.ab-featured-row{display:flex;flex-wrap:wrap;gap:16px;margin-top:10px;}
.ab-logo{font-size:13.5px;font-weight:700;color:var(--brand-deep);background:var(--tint);padding:4px 10px;border-radius:8px;}
.ab-review{background:var(--tint);border:1px solid #e6c9d5;border-radius:18px;padding:20px;margin:24px 0;}
.ab-quote-mark{color:var(--brand);display:block;margin-bottom:4px;}
.ab-review-text{font-family:'Fraunces';font-size:17px;line-height:1.4;font-weight:600;}
.ab-review-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;}
.ab-review-by{display:flex;align-items:center;gap:8px;}
.ab-review-av{width:32px;height:32px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:12px;}
.ab-review-by b{font-size:13px;display:block;}
.ab-review-by span{font-size:11px;color:var(--muted);}
.ab-review-all{font-size:12.5px;color:var(--brand);font-weight:700;}
.ab-journal{display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;}
.ab-journal-item{text-align:left;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;cursor:pointer;}
.ab-journal-cat{font-size:10px;font-weight:800;color:var(--brand);text-transform:uppercase;display:block;}
.ab-journal-item b{font-size:13px;display:block;margin:4px 0;}
.ab-journal-meta{font-size:11px;color:var(--muted);}
.ab-journal-note{font-size:12px;color:var(--muted);margin-top:10px;}
.ab-offer-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.ab-offer-card{text-align:left;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;}
.ab-offer-card b{font-size:14px;}
.ab-offer-card p{font-size:12.5px;color:#5f4d55;margin:4px 0 8px;}
.ab-offer-link{font-size:12px;color:var(--brand);font-weight:700;display:inline-flex;align-items:center;gap:2px;}
.ab-facts{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border-radius:14px;overflow:hidden;}
.ab-fact{background:var(--card);padding:12px;display:flex;flex-direction:column;gap:2px;}
.ab-fact-k{font-size:10px;text-transform:uppercase;color:var(--brand);font-weight:700;}
.ab-fact-v{font-size:12.5px;color:#4f3f46;}

/* portfolio page layout */
.pf-wrap{display:grid;grid-template-columns:1fr 300px;gap:30px;align-items:start;}
.pf-main{min-width:0;}
.pf-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;}
.pf-shot{aspect-ratio:4/5;border-radius:14px;overflow:hidden;position:relative;}
.pf-shot img{width:100%;height:100%;object-fit:cover;}
.pf-shot-cap{position:absolute;bottom:10px;left:10px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.5);text-align:left;}
.pf-shot-cap b{display:block;font-size:12.5px;}
.pf-shot-cap span{font-size:11px;opacity:0.9;}
.pf-ba{position:absolute;top:10px;left:0;right:0;display:flex;justify-content:space-between;padding:0 10px;}
.pf-ba-h{font-size:9px;font-weight:800;color:#fff;background:rgba(43,29,42,.5);padding:2px 6px;border-radius:6px;}
.pf-shot.ba::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.55);}
.pf-rail{position:sticky;top:90px;}

/* faq details desktop */
.faq-wrap{display:grid;grid-template-columns:260px 1fr;gap:30px;align-items:start;}
.faq-rail{position:sticky;top:90px;}
.faq-search{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;}
.faq-search input{border:none;background:none;outline:none;font-size:13.5px;width:100%;}
.faq-help{background:var(--tint);border:1px solid #e6c9d5;border-radius:16px;padding:16px;margin-top:16px;}
.faq-help-cta{width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13px;padding:10px;border-radius:10px;}
.faq-main{min-width:0;}
.faq-groups{display:flex;flex-direction:column;gap:24px;}
.faq-group-head{font-family:'Fraunces';font-size:18px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;}

/* contact page desktop */
.ct-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.ct-main{min-width:0;}
.ct-channels{display:flex;flex-direction:column;gap:10px;}
.ct-wa{width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:14px;border-radius:12px;box-shadow:0 4px 12px rgba(177,74,110,.25);display:flex;align-items:center;justify-content:center;gap:6px;}
.ct-alt{display:flex;gap:8px;}
.ct-alt button{flex:1;border:1px solid var(--line);background:var(--card);border-radius:10px;padding:10px;font-size:13px;display:flex;align-items:center;justify-content:center;gap:4px;}
.ct-form{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px;margin-top:20px;}
.ct-form-sub{font-size:13px;color:var(--muted);margin-bottom:14px;}
.ct-form-row{display:grid;grid-template-columns:1.5fr 1fr;gap:10px;}
.ct-input{width:100%;border:1px solid var(--line);border-radius:11px;padding:10px 12px;font-size:13.5px;background:var(--bg);margin-bottom:10px;outline:none;}
.ct-textarea{height:80px;resize:none;}
.ct-send{width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px;border-radius:10px;}
.ct-form-note{font-size:11.5px;color:var(--muted);margin-top:8px;}
.ct-visit{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.ct-map{height:120px;border-radius:12px;background:#ecdcd2;margin-bottom:12px;}
.ct-hours{border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:12px 0;}
.ct-hours-head{display:flex;justify-content:space-between;align-items:center;background:#faf6f2;padding:10px;border-bottom:1px solid var(--line);font-size:12.5px;}
.ct-open{font-size:11px;color:#1f7a4d;font-weight:700;}
.ct-open.closed{color:#9a3b3b;}
.ct-hours-list{list-style:none;padding:0;}
.ct-hours-list li{display:flex;justify-content:space-between;padding:8px 10px;font-size:12.5px;border-bottom:1px solid var(--line);}
.ct-hours-list li:last-child{border-bottom:none;}
.ct-hours-list li.today{background:var(--tint);color:var(--brand-deep);font-weight:700;}
.ct-hours-empty{padding:14px 10px;font-size:12.5px;color:var(--muted);line-height:1.5;}
.ct-rail{position:sticky;top:90px;}

/* refunds page desktop */
.rf-wrap{display:grid;grid-template-columns:1fr 300px;gap:30px;align-items:start;}
.rf-main{min-width:0;}
.rf-sections{display:flex;flex-direction:column;gap:20px;}
.rf-section-head{font-family:'Fraunces';font-size:16.5px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.rf-list{list-style:none;padding:0;}
.rf-list li{font-size:13.5px;color:#4f3f46;display:flex;align-items:start;gap:8px;margin-bottom:8px;}
.rf-list li svg{color:var(--brand);flex-shrink:0;margin-top:2px;}
.rf-keys{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.rf-keys-h{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;margin-bottom:12px;}
.rf-keys ul{list-style:none;padding:0;}
.rf-keys li{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.rf-keys li svg{color:var(--brand);flex-shrink:0;}
.rf-keys li b{display:block;font-size:13px;}
.rf-keys li span{font-size:11.5px;color:var(--muted);}
.rf-related{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:8px;}
.rf-related-h{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;padding:6px 10px;display:block;}
.rf-related button{width:100%;text-align:left;padding:8px 10px;font-size:13px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;}
.rf-related button.on{background:var(--tint);color:var(--brand-deep);font-weight:700;}
.rf-rail{position:sticky;top:90px;}

/* terms page desktop */
.tm-wrap{display:grid;grid-template-columns:1fr 240px;gap:30px;align-items:start;}
.tm-main{min-width:0;}
.tm-intro{font-size:14.5px;color:#5f4d55;margin-bottom:20px;}
.tm-section{margin-top:24px;}
.tm-section h3{font-family:'Fraunces';font-size:18px;font-weight:700;margin-bottom:8px;}
.tm-section p{font-size:13.5px;line-height:1.6;color:#4f3f46;margin-bottom:8px;}
.tm-link{font-size:12.5px;color:var(--brand);font-weight:700;display:inline-flex;align-items:center;gap:2px;}
.tm-contents{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px;}
.tm-contents-h{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:700;padding:6px 10px;display:block;}
.tm-contents button{width:100%;text-align:left;padding:8px 10px;font-size:12.5px;border-radius:8px;}
.tm-contents button:hover{background:#f6e8ee;color:var(--brand-deep);}
.tm-meta{font-size:11px;color:var(--muted);margin-top:10px;padding-left:10px;}
.tm-rail{position:sticky;top:90px;}

@media(max-width:979px){
  .pd-home{grid-template-columns:1fr;}
  .pd-rail{position:static;}
  .svc-body{grid-template-columns:1fr;}
  .svc-rail{position:static;}
  .blogp-body{grid-template-columns:1fr;}
  .blogp-rail{position:static;}
  .pf-wrap{grid-template-columns:1fr;}
  .pf-rail{position:static;}
  .ab-wrap{grid-template-columns:1fr;}
  .ab-rail{position:static;}
  .faq-wrap{grid-template-columns:1fr;}
  .faq-rail{position:static;}
  .ct-wrap{grid-template-columns:1fr;}
  .ct-rail{position:static;}
  .rf-wrap{grid-template-columns:1fr;}
  .rf-rail{position:static;}
  .tm-wrap{grid-template-columns:1fr;}
  .tm-rail{position:static;}
}
`;
