import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast as sonnerToast } from "sonner";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { calculateShippingFee } from "../../utils/shippingFee";
import { storePath } from "../../utils/storePath";
import { captureAffiliateRef, getPersistedAffiliateRef } from "../../lib/affiliate";
import { InstagramIcon, TikTokIcon, FacebookIcon, TwitterXIcon } from "../../components/SocialIcons";

import { Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store as StoreIcon, Search, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft, Megaphone, Truck, Sparkles, ShieldCheck, Navigation, Lock, Plus, Minus, Copy, Instagram, Facebook, Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell, BedDouble, Bath, Ruler, SlidersHorizontal, Building2, FileText, CookingPot, MessageCircle, UtensilsCrossed, Receipt } from "lucide-react";


// --- Types & Interfaces ---
interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface StoreType {
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
  payment_provider?: string | null;
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
  image_url?: string | null;
}

interface Review {
  id: string;
  reviewer_name: string;
  body: string;
  rating: number;
  created_at?: string;
  reply?: string | null;
  reply_at?: string | null;
  photos?: string[] | null;
  service_name?: string | null;
}

interface StoreFaq {
  id: string;
  question: string;
  answer: string;
}

interface CartItem {
  key: string;
  id: string;
  name: string;
  price: number;
  opts?: string;
  size?: string;
  colour?: string;
  qty: number;
  type: 'service' | 'product';
  slot?: string;
  slotId?: string;
  duration?: number;
  image_url?: string;
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


interface AgentStorefrontProps {
  username: string;
  store: StoreType;
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

const MOCK_STORE = {
  name: "", initial: "", slug: "",
  primaryCta: "",
  category: "", location: "",
  rating: undefined as number | undefined, reviews: 0, orders: 0, reply: "",
  bio: "",
  address: "",
  phone: "",
  email: "",
  socials: { instagram: "", tiktok: "", twitter: "" },
};
const MOCK_SERVICES: any[] = [];
const MOCK_PRODUCTS: any[] = [];
const MOCK_REVIEWS: any[] = [];
const MOCK_PRODUCT_FAQS = [
  ["How do I get the guide after I pay?", "It is a digital download. As soon as your payment clears, the PDF is sent to you on WhatsApp and by email, so you can read it on any device."],
  ["Can I get a refund on a guide?", "Because guides are digital and delivered instantly, they cannot be refunded once sent. If a download fails or you receive the wrong file, I will fix it straight away."],
  ["Are the guides up to date?", "Yes. Each guide shows the year it was last updated, and the area reports are refreshed as the market moves. You get the current version at the time of purchase."],
  ["Can I share a guide with family?", "The guide is licensed for your own use. You are welcome to read it with the people buying or renting with you, but please do not resell or repost it."],
  ["How do I pay?", "Pay securely through Frontstore, or by bank transfer where offered. Your receipt and download arrive on WhatsApp."],
];
const MOCK_SERVICE_FAQS = [
  ["How does the viewing fee work?", "The inspection fee covers a guided viewing and my time. Where you go on to buy or rent through me, it is credited back against what you owe, so a serious buyer never really pays it twice."],
  ["Can I reschedule or cancel?", "Yes, up to 24 hours before for a full refund of the fee. Inside 24 hours the fee is held against a rebooked viewing."],
  ["What if I am running late?", "Message me on WhatsApp. I hold the slot for 15 minutes where I can, but some sellers and tenants keep tight windows."],
  ["Do you cover areas outside Lekki and Ikoyi?", "Lekki and Ikoyi are home, but I take on Victoria Island and Ikate by arrangement. Ask before you book and I will tell you honestly if I can help."],
  ["How do I pay?", "Pay securely through Frontstore, or by bank transfer where offered. Your receipt always arrives on WhatsApp."],
];
const MOCK_FAQ_GROUPS: any[] = [];
const MOCK_FAQS_PREVIEW = MOCK_FAQ_GROUPS.map((g: any) => g.items[0]);
const MOCK_TERMS: any[] = [
  { t: "Who these terms are between", p: ["These terms are an agreement between you and the store owner, who sells the products and services on this store. The store runs on Frontstore, which provides the platform and buyer protection but is not the seller."] },
  { t: "Bookings and calls", p: ["Appointments and coaching sessions are booked through this store. Where a deposit or full payment applies, it secures your slot. Your slot is confirmed once payment is received."] },
  { t: "Pricing and payment", p: ["Prices are shown in Nigerian naira (or the local currency of the store). You can pay securely through Frontstore at checkout, or by bank transfer where the merchant offers it. Your receipt always arrives on WhatsApp or by email."] },
  { t: "Cancellations and refunds", p: ["You can cancel or reschedule bookings, and request returns/refunds for products under the conditions set out on the Refunds page. Digital downloads, templates, and courses are non-refundable once accessed."] },
  { t: "The Frontstore platform", p: [], locked: { title: "Frontstore platform terms", body: "Every Frontstore store also operates under the Frontstore platform terms and buyer protection policy. These apply alongside the store's own policies and cannot be removed by the vendor.", link: "Read the Frontstore platform terms" } },
];
const MOCK_PRIVACY: any[] = [
  { t: "What we collect", p: ["When you book, buy or get in touch, the store collects the details you give: your name, contact details such as a WhatsApp number, phone or email, booking and order details, and reviews you choose to share."] },
  { t: "How we use it", p: ["We use your details to take and confirm bookings and orders, reply to your enquiries, deliver products and services, process payments, show verified reviews, and improve the store."] },
  { t: "Payments", p: ["Payments made through Frontstore are handled by Frontstore and its payment providers under buyer protection, and the store does not see or store your card details. Bank transfers are made directly to the store."] },
  { t: "WhatsApp and messaging", p: ["When you message us, the conversation takes place on WhatsApp or email and is subject to WhatsApp's own privacy terms."] },
  { t: "Who we share it with", p: ["We share only what is needed: with payment providers to take payment, and with Frontstore as the platform the store runs on. We never sell your data."] },
];
const MOCK_PORTFOLIO: any[] = [];
const MOCK_NOTIFY_TOPICS = [["listings", "New listings"], ["viewings", "Viewing slots"], ["guides", "New guides"], ["news", "Announcements"]];
const MOCK_HOURS = [
  ["Mon", "9:00am - 6:00pm"], ["Tue", "9:00am - 6:00pm"], ["Wed", "9:00am - 6:00pm"],
  ["Thu", "9:00am - 6:00pm"], ["Fri", "9:00am - 6:00pm"], ["Sat", "10:00am - 4:00pm"], ["Sun", "Closed"],
];
const MOCK_NAV = [
  ["home", "Home"], ["services", "Services"], ["products", "Guides"], ["portfolio", "Listings"], ["reviews", "Reviews"], ["blog", "Blog"],
  ["about", "About"], ["faq", "FAQ"], ["contact", "Contact"],
];
const MOCK_LEGAL = [["returns", "Refunds"], ["terms", "Terms"], ["privacy", "Privacy"]];
const MOCK_CATS = ["Viewings", "Consultations", "Valuations", "Buying", "Renting", "Investing"];
const MOCK_FEATURED: any[] = [];
const MOCK_AUTHOR = {
  name: "",
  initial: "",
  role: "",
  bio: "",
  long: "",
  quote: "",
  specialities: [],
  socials: { instagram: "", tiktok: "" },
  credentials: []
};
const MOCK_OFFERINGS: any[] = [];
const MOCK_GALLERY: any[] = [];
const MOCK_RECOGNITION: any[] = [];
const MOCK_ABOUT_FACTS: any[] = [];
const MOCK_BLOG: any[] = [];

const money = (n: number) => "₦" + n.toLocaleString("en-NG");
const money2 = (n: number) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const priceShort = (n: number) => { if (n >= 1000000) { const m = n / 1000000; return "₦" + (m % 1 === 0 ? m : m.toFixed(1)) + "m"; } if (n >= 1000) return "₦" + Math.round(n / 1000) + "k"; return money(n); };
const listingPrice = (p: any) => priceShort(p.price) + (p.basis === "month" ? " / month" : "");
const metaPrice = (p: any) => priceShort(p.price) + (p.basis === "month" ? "/mo" : "");
const typeWord = (t: string) => (t === "Apartment" ? "Flat" : t === "Detached" ? "Detached House" : t === "Semi-detached" ? "Semi-detached House" : t);
const listingName = (p: any) => `${p.beds} Bedroom ${typeWord(p.ptype)} in ${p.area}`;
const basisLabel = (b: string) => (b === "month" ? "per month" : b === "day" ? "per day" : b === "year" ? "per year" : "");
const MOCK_AREA_GUIDE = {
  _default: { intro: "", points: [] },
};
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a: Date | null, b: Date | null) => !!(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
const hoursForDate = (d: Date) => MOCK_HOURS[(d.getDay() + 6) % 7][1];
const parseClock = (s: string) => { const m = s.trim().match(/(\d+):(\d+)\s*(am|pm)/i); if (!m) return 0; let h = (+m[1]) % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + (+m[2]); };
const fmtMins = (min: number) => { const h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "pm" : "am", hh = h % 12 || 12; return `${hh}:${String(m).padStart(2, "0")}${ap}`; };
const fmtDateFull = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const daySlots = (date: Date, durMin: number) => { const h = hoursForDate(date); if (h === "Closed") return []; const [o, c] = h.split(" - "); const open = parseClock(o), close = parseClock(c); const out = []; for (let t = open; t <= close - durMin; t += 60) out.push(t); return out; };
const todayIdx = (new Date().getDay() + 6) % 7;

function Tiktok({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

function WhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
    </svg>
  );
}

function useIsDesktop(): boolean {
  const q = "(min-width: 980px)";
  const [d, setD] = useState(typeof window !== "undefined" ? window.matchMedia(q).matches : false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const fn = (e: MediaQueryListEvent | any) => setD(e.matches);
    m.addEventListener ? m.addEventListener("change", fn) : m.addListener(fn);
    return () => { m.removeEventListener ? m.removeEventListener("change", fn) : m.removeListener(fn); };
  }, []);
  return d;
}

export default function AgentStorefront({
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
}: AgentStorefrontProps) {
  const router = useRouter();

  const NAV = useMemo(() => {
    return MOCK_NAV.filter(([id]) => {
      if (id === 'home') return true;
      return (store.storefront_sections || ['reviews', 'replies_approximation', 'products', 'services', 'portfolio', 'about', 'faq', 'contact', 'blog']).includes(id);
    });
  }, [store.storefront_sections]);

  // --- UI State Variables ---
  const [bag, setBag] = useState(false);
  const [toast, setToast] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [bookSvc, setBookSvc] = useState<any>(null);
  const [bookDate, setBookDate] = useState<Date | null>(null);
  const [bookTime, setBookTime] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [revRating, setRevRating] = useState(0);
  const [revRef, setRevRef] = useState("");
  const [revText, setRevText] = useState("");
  const [revPhoto, setRevPhoto] = useState<string | null>(null);
  const [faqQuery, setFaqQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(-1);
  const [share, setShare] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyTopics, setNotifyTopics] = useState<string[]>([]);
  const [page, setPage] = useState("home");

  // --- Dynamic Option Presets / Fallbacks ---
  const customBrandColor = store.primary_color || '#1f4e87';
  const customBrandDeep = store.primary_color ? `color-mix(in srgb, ${store.primary_color} 80%, black)` : '#12305a';
  const customTint = store.primary_color ? `color-mix(in srgb, ${store.primary_color} 14%, white)` : '#fbe9e4';

  const storeStyleTheme = {
    '--brand': customBrandColor,
    '--brand-deep': customBrandDeep,
    '--tint': customTint,
  } as React.CSSProperties;

  // --- Load Cart & Customer Profile ---
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);
  
  const [bagItems, setBagItems] = useState<CartItem[]>([]);
  const [apiSlots, setApiSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`frontstore_cart_${username}`);
      if (saved) setBagItems(JSON.parse(saved));
    } catch { }
  }, [username]);

  const saveCartToStorage = (newBag: CartItem[]) => {
    try {
      localStorage.setItem(`frontstore_cart_${username}`, JSON.stringify(newBag));
    } catch { }
  };

  const ping = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1600);
  };

  // --- Dynamic Mappings ---
  const SERVICES = useMemo<any[]>(() => {
    const list = products.filter(p => p.type === 'service');
    if (list.length > 0) {
      return list.map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        price: parseFloat(s.price),
        dur: s.duration_minutes ? `${s.duration_minutes} min` : "1 hr",
        durMin: s.duration_minutes || 60,
        cat: categories.find(c => c.id === s.category_id)?.name || "Service",
        desc: s.description || "",
        popular: s.compare_at_price ? true : false,
        image_url: s.image_url || s.image_urls?.[0] || null,
        image_urls: s.image_urls || null
      }));
    }
    return MOCK_SERVICES;
  }, [products, categories]);

  const PRODUCTS = useMemo<any[]>(() => {
    const list = products.filter(p => p.type === 'product');
    if (list.length > 0) {
      return list.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price),
        compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
        cat: categories.find(c => c.id === p.category_id)?.name || "Product",
        desc: p.description || "",
        popular: p.compare_at_price ? true : false,
        image_url: p.image_url || p.image_urls?.[0] || null,
        image_urls: p.image_urls || null
      }));
    }
    return MOCK_PRODUCTS;
  }, [products, categories]);

  const CATS = useMemo(() => {
    if (categories.length > 0) return categories.map((c: any) => c.name);
    return MOCK_CATS;
  }, [categories]);

  const displayReviews = useMemo<any[]>(() => {
    if (reviews.length > 0) {
      return reviews.map((r: any) => ({
        id: r.id,
        name: r.reviewer_name || 'Anonymous',
        r: r.rating || 5,
        when: r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
        service: r.service_name || 'Store purchase',
        verified: true,
        photos: r.photos?.length || 0,
        text: r.body || '',
        response: r.reply ? { when: r.reply_at ? new Date(r.reply_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently', text: r.reply } : null
      }));
    }
    return MOCK_REVIEWS;
  }, [reviews]);

  const displayFaqs = useMemo(() => {
    if (faqs.length > 0) {
      return faqs.map((f: any) => [f.question, f.answer]) as [string, string][];
    }
    return MOCK_FAQ_GROUPS.flatMap(g => g.items) as [string, string][];
  }, [faqs]);

  const FAQ_GROUPS = useMemo(() => {
    if (faqs.length > 0) {
      return [
        {
          cat: "Frequently Asked Questions",
          icon: ShieldCheck,
          items: faqs.map((f: any) => [f.question, f.answer])
        }
      ];
    }
    return MOCK_FAQ_GROUPS;
  }, [faqs]);

  const displayPortfolio = useMemo<any[]>(() => {
    if (portfolio.length > 0) {
      return portfolio.map((p: any, i: number) => ({
        label: p.label || p.title || "Portfolio Item",
        cat: p.category || "General",
        c: p.image_url ? "" : `c${i % 3}`,
        image_url: p.image_url || null,
        ba: !!p.is_before_after,
        before_image_url: p.before_image_url || null,
        after_image_url: p.after_image_url || null,
      }));
    }
    return MOCK_PORTFOLIO;
  }, [portfolio]);

  const displayBlog = useMemo<any[]>(() => {
    if (blog.length > 0) {
      return blog.map((b: any) => ({
        title: b.title,
        date: b.published_at ? new Date(b.published_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently",
        cat: b.category || "Updates",
        read: b.read_time || "4 min",
        excerpt: b.excerpt || "",
        body: Array.isArray(b.body) ? b.body : [],
        image_url: b.image_url || null,
        is_pseo: !!b.is_pseo,
      }));
    }
    return MOCK_BLOG;
  }, [blog]);

  const DUMMY_STORE = {
    name: store.store_name || MOCK_STORE.name,
    initial: store.store_name ? store.store_name[0].toUpperCase() : MOCK_STORE.initial,
    slug: username,
    category: store.business_persona ? store.business_persona.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) : MOCK_STORE.category,
    location: store.location || MOCK_STORE.location,
    rating: store.rating || MOCK_STORE.rating,
    reviews: store.review_count || MOCK_STORE.reviews,
    orders: store.total_orders || MOCK_STORE.orders,
    reply: store.reply_time_minutes ? `~${store.reply_time_minutes} min` : MOCK_STORE.reply,
    bio: store.store_bio || MOCK_STORE.bio,
    address: store.address || MOCK_STORE.address,
    phone: store.whatsapp_phone || MOCK_STORE.phone,
    email: store.email || MOCK_STORE.email,
    primaryCta: (MOCK_STORE as any).primaryCta || "book",
    socials: {
      instagram: store.instagram_handle || (MOCK_STORE.socials as any)?.instagram || "",
      tiktok: store.tiktok_handle || (MOCK_STORE.socials as any)?.tiktok || "",
      twitter: store.twitter_handle || (MOCK_STORE.socials as any)?.twitter || ""
    }
  };

  const DUMMY_AUTHOR = {
    name: store.founder_name || MOCK_AUTHOR.name,
    initial: (store.founder_name || MOCK_AUTHOR.name || "S")[0].toUpperCase(),
    role: store.founder_role || MOCK_AUTHOR.role,
    bio: store.founder_bio || MOCK_AUTHOR.bio,
    long: store.founder_bio || MOCK_AUTHOR.long,
    quote: store.founder_quote || MOCK_AUTHOR.quote,
    specialities: store.founder_specialities || MOCK_AUTHOR.specialities || [],
    socials: store.founder_socials || MOCK_AUTHOR.socials || {},
    credentials: store.founder_credentials || MOCK_AUTHOR.credentials || []
  };

  const ABOUT_FACTS = useMemo(() => {
    if (store.about_facts && store.about_facts.length > 0) return store.about_facts;
    return MOCK_ABOUT_FACTS;
  }, [store.about_facts]);

  const RECOGNITION = useMemo(() => {
    if (store.recognition && store.recognition.length > 0) return store.recognition;
    return MOCK_RECOGNITION;
  }, [store.recognition]);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const HOURS = useMemo(() => {
    if (store.working_hours) {
      try {
        const parsed = typeof store.working_hours === 'string' ? JSON.parse(store.working_hours) : store.working_hours;
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return MOCK_HOURS;
  }, [store.working_hours]);
  const hoursForDate = (d: Date) => HOURS[(d.getDay() + 6) % 7][1];

  const bagCount = bagItems.reduce((acc, item) => acc + item.qty, 0);
  const bagTotal = bagItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shippingPreview = calculateShippingFee(store, bagTotal);

  const addToBag = (p: any, size: string | null = "One size", colour: string | null = "Original") => {
    const sz = size || "One size";
    const clr = colour || "Original";
    const key = p.id + "|" + sz + "|" + clr;
    setBagItems((prev) => {
      const ex = prev.find((b) => b.key === key);
      const next = ex
        ? prev.map((b: any) => (b.key === key ? { ...b, qty: b.qty + 1 } : b))
        : [...prev, { key, id: p.id, name: p.name, price: typeof p.price === 'string' ? parseFloat(p.price) : p.price, size: sz, colour: clr, qty: 1, type: p.type || 'product' }];
      saveCartToStorage(next);
      return next;
    });
    ping("Added to your bag");
  };

  const changeQty = (key: string, d: number) => {
    setBagItems((prev) => {
      const next = prev.map((b: any) => (b.key === key ? { ...b, qty: Math.max(1, b.qty + d) } : b));
      saveCartToStorage(next);
      return next;
    });
  };

  const removeItem = (key: string) => {
    setBagItems((prev) => {
      const next = prev.filter((b) => b.key !== key);
      saveCartToStorage(next);
      return next;
    });
  };

  const addBag = (name: string) => {
    const found = products.find(x => x.name === name);
    if (found) {
      addToBag(found);
    } else {
      const mockFound: any = MOCK_PRODUCTS.find(x => x.name === name);
      if (mockFound) {
        addToBag({
          id: mockFound.id,
          name: mockFound.name,
          price: String(mockFound.price),
          compare_at_price: mockFound.compare_at_price ? String(mockFound.compare_at_price) : null,
          description: mockFound.desc || null,
          image_urls: mockFound.image_url ? [mockFound.image_url] : null,
          stock_status: 'in_stock',
          category_id: null,
          type: 'product'
        } as any);
      }
    }
  };

  const orderForm = () => {
    return (
      <Sheet onClose={() => setBag(false)} title={checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Details' : 'Order Placed'}>
        <div className="ps-sheet-body">
          {checkoutStep !== 'success' && (
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <button className={`nt-topic ${checkoutStep === 'cart' ? 'on' : ''}`} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 6 }} onClick={() => setCheckoutStep('cart')}>Cart</button>
              <button className={`nt-topic ${checkoutStep === 'details' ? 'on' : ''}`} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 6 }} onClick={() => setCheckoutStep('details')}>Details</button>
            </div>
          )}

          {checkoutStep === 'cart' && (
            bagItems.length === 0 ? (
              <p className="ps-bag-empty">Your order is empty.</p>
            ) : (
              <>
                {bagItems.map((b: any) => (
                  <div className="ps-bag-line" key={b.key}>
                    <span className="ps-bag-th"><StoreIcon size={16} /></span>
                    <div style={{ flex: 1, paddingLeft: 10 }}>
                      <b>{b.name}</b>
                      <span>{b.opts ? b.opts + "  ·  " : ""}{money(b.price)}</span>
                      <button className="ps-bag-rm" onClick={() => removeItem(b.key)} style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Remove</button>
                    </div>
                    <div className="ps-qty">
                      <button onClick={() => changeQty(b.key, -1)} aria-label="Less"><Minus size={14} /></button>
                      <b>{b.qty}</b>
                      <button onClick={() => changeQty(b.key, 1)} aria-label="More"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <b>{money(bagTotal)}</b>
                  </div>
                  {deliveryMethod === 'delivery' && shippingPreview.shippingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
                      <span>Shipping</span>
                      <span>{money(shippingPreview.shippingFee)}</span>
                    </div>
                  )}
                  {deliveryMethod === 'delivery' && shippingPreview.shippingFee === 0 && (store as any)?.shipping_type === 'free' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                  )}
                  {deliveryMethod === 'delivery' && shippingPreview.handlingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
                      <span>Handling Fee</span>
                      <span>{money(shippingPreview.handlingFee)}</span>
                    </div>
                  )}
                  <div className="ps-bag-total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total</span>
                    <b>{money(deliveryMethod === 'delivery' ? shippingPreview.total : bagTotal)}</b>
                  </div>
                </div>
                <button className="ps-sheet-cta" onClick={() => setCheckoutStep('details')} style={{ marginTop: 14 }}>Proceed to Checkout</button>
              </>
            )
          )}

          {checkoutStep === 'details' && (
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              {bagItems.filter(x => x.type === 'service').length === 0 && (
                <div>
                  <label className="ps-field-lbl" style={{ margin: 0 }}>Delivery Method</label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" className={`nt-topic ${deliveryMethod === 'delivery' ? 'on' : ''}`} onClick={() => setDeliveryMethod('delivery')} style={{ flex: 1, padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Truck size={14} /> Shipping</button>
                    <button type="button" className={`nt-topic ${deliveryMethod === 'pickup' ? 'on' : ''}`} onClick={() => setDeliveryMethod('pickup')} style={{ flex: 1, padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><StoreIcon size={14} /> Pickup</button>
                  </div>
                </div>
              )}
              {(deliveryMethod === 'delivery' || bagItems.filter(x => x.type === 'service').length > 0) && (
                <div>
                  <label className="ps-field-lbl" style={{ margin: 0 }}>Shipping Address</label>
                  <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Suite 4, Admiralty Way, Lekki Phase 1" style={{ width: '100%', padding: 11, border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, height: 60, background: 'var(--card)', resize: 'none' }} />
                </div>
              )}
              <button type="submit" className="ps-sheet-cta" disabled={checkoutLoading} style={{ marginTop: 12 }}>
                {checkoutLoading ? "Submitting Order..." : `Proceed to Secure Checkout`}
              </button>
            </form>
          )}

          {checkoutStep === 'success' && orderReceipt && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 56, height: 56, background: '#e6f4ea', color: '#137333', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <Check size={28} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>Order Placed!</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Your order reference is <b>{orderReceipt.order.order_number}</b>.</p>
              
              {store.payment_provider && store.payment_provider !== 'manual' && (
                <div style={{ background: '#f9f5f3', borderRadius: 12, padding: 14, marginTop: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>Total Amount</span>
                    <b>{money(orderReceipt.order.total_amount)}</b>
                  </div>
                  <button className="ps-sheet-cta" onClick={handlePayOnline} disabled={isPaying} style={{ marginTop: 12 }}>
                    {isPaying ? "Initializing Secure Payment..." : "Pay Securely Online Now"}
                  </button>
                </div>
              )}

              <button className="ps-sheet-cta" onClick={() => setPendingWaUrl(orderReceipt.whatsapp_url)} style={{ background: '#25D366', color: '#fff', boxShadow: 'none' }}>
                <MessageCircle size={16} /> Send receipt on WhatsApp
              </button>
            </div>
          )}
        </div>
      </Sheet>
    );
  };

  const handlePayOnline = async () => {
    if (!orderReceipt || isPaying) return;
    setIsPaying(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/v1/public/orders/${orderReceipt.order.id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      const redirectUrl = json.data?.authorization_url || json.data?.checkout_url || json.data?.link;
      if (res.ok && redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        sonnerToast.error(json.message || "Online payment setup failed.");
      }
    } catch (e) {
      console.error(e);
      sonnerToast.error("Failed to setup online payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');

    // Formulate notes with booking info if any
    let compiledAddress = deliveryAddress;
    const serviceItems = bagItems.filter(x => x.type === 'service');
    if (serviceItems.length > 0) {
      const slotDetails = serviceItems.map((x: any) => `${x.name} booking: ${x.slot}`).join(', ');
      compiledAddress = `Booking details: ${slotDetails}` + (deliveryAddress ? ` | Session Location: ${deliveryAddress}` : '');
    }

    // Submit live booking slots first
    const bookingItems = bagItems.filter(x => x.type === 'service' && x.slotId && !x.slotId.startsWith('mock-'));
    for (const bItem of bookingItems) {
      try {
        await fetch(`${API_URL}/v1/public/store/${username}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: bItem.id,
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
      const res = await fetch(`${API_URL}/v1/public/store/${username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_code: getPersistedAffiliateRef(),
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          customer_whatsapp: customerWhatsapp || customerPhone,
          delivery_method: serviceItems.length > 0 ? (deliveryAddress ? 'delivery' : 'pickup') : deliveryMethod,
          delivery_address: compiledAddress || 'None specified',
          notes: `Selected sizes/colors:\n${bagItems.map((b: any) => `- ${b.name}: Size ${b.size}, Color ${b.colour}`).join('\n')}\n\nNotes: ${orderNote}`,
          items: bagItems.map((item: any) => ({
            product_id: item.id,
            quantity: item.qty
          }))
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
          email: customerEmail,
          preferred_delivery_address: deliveryAddress
        }));
      } catch (e) {}

      setOrderReceipt(json.data);
      setBagItems([]);
      saveCartToStorage([]);
      setCheckoutStep('success');
    } catch (err: any) {
      setCheckoutError(err.message || 'Could not complete order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const fetchAvailableSlots = async (svcId?: string) => {
    setLoadingSlots(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
      const url = svcId
        ? `${API_URL}/v1/public/store/${username}/slots?product_id=${svcId}`
        : `${API_URL}/v1/public/store/${username}/slots`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        setApiSlots(json.data);
      } else {
        setApiSlots([]);
      }
    } catch (e) {
      console.error("Error fetching slots:", e);
      setApiSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Hook slots fetch to bookSvc changes
  useEffect(() => {
    if (bookOpen && bookSvc) {
      fetchAvailableSlots(bookSvc.id);
    }
  }, [bookOpen, bookSvc]);

  const confirmBooking = () => {
    if (!bookSvc || !bookDate || !bookTime) return;
    const dateStr = `${bookDate.getFullYear()}-${String(bookDate.getMonth() + 1).padStart(2, '0')}-${String(bookDate.getDate()).padStart(2, '0')}`;
    const slotObj = apiSlots.find(s => s.slot_date === dateStr && s.start_time === bookTime);
    const slotIdVal = slotObj && slotObj.id ? slotObj.id : undefined;

    setBagItems((prev) => {
      const next = [...prev, {
        key: "s" + bookSvc.id + dateStr + bookTime,
        id: bookSvc.id,
        name: bookSvc.name,
        price: bookSvc.price,
        qty: 1,
        type: "service" as const,
        size: "One size",
        colour: "Original",
        slot: `${bookDate.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}, ${bookTime}`,
        slotId: slotIdVal,
        duration: bookSvc.durMin
      }];
      saveCartToStorage(next);
      return next;
    });

    setBookOpen(false);
    ping("Slot added to bag");
  };

  const submitReview = async () => {
    if (!revRating || !revRef.trim()) {
      ping("Add a rating and your order reference");
      return;
    }
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/v1/public/orders/${revRef}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: revRating,
          body: revText,
          reviewer_name: customerName || 'Anonymous'
        })
      });
      if (res.ok) {
        sonnerToast.success("Review submitted successfully! Thank you. 🌟");
        setReviewOpen(false);
        setRevRating(0);
        setRevText("");
        setRevRef("");
      } else {
        sonnerToast.error("Failed to submit review.");
      }
    } catch (e) {
      console.error(e);
      sonnerToast.error("Error submitting review.");
    }
  };

  const handleWa = (msg: string) => {
    const rawPhone = store.whatsapp_phone || "";
    setPendingWaUrl(`https://wa.me/${rawPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(`${window.location.origin}${storePath(username)}`);
    ping("Store link copied");
  };
  
  const TERMS = useMemo(() => {
    return MOCK_TERMS.map((t: any) => ({
      ...t,
      p: t.p.map((str: any) => typeof str === 'string' ? str.replace(MOCK_STORE.name, DUMMY_STORE.name) : str)
    }));
  }, [DUMMY_STORE]);

  const PRIVACY = useMemo(() => {
    return MOCK_PRIVACY.map((p: any) => ({
      ...p,
      p: p.p.map((str: any) => typeof str === 'string' ? str.replace(MOCK_STORE.name, DUMMY_STORE.name) : str)
    }));
  }, [DUMMY_STORE]);

  const FAQS_PREVIEW = useMemo(() => {
    return FAQ_GROUPS.map((g: any) => g.items[0]);
  }, [FAQ_GROUPS]);

  const getDaySlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayApiSlots = apiSlots.filter(s => s.slot_date === dateStr);
    if (dayApiSlots.length > 0) {
      return dayApiSlots.map((s: any) => ({
        id: s.id,
        time: s.start_time.substring(0, 5) + (parseInt(s.start_time.substring(0, 2)) >= 12 ? ' PM' : ' AM'),
        taken: !s.is_available
      }));
    }
    // Fallback standard slots if API returns empty
    const h = hoursForDate(date);
    if (h === "Closed") return [];
    const [o, c] = h.split(" - ");
    const open = parseClock(o), close = parseClock(c);
    const duration = bookSvc ? bookSvc.duration_minutes || 60 : 60;
    const out = [];
    let idx = 0;
    for (let t = open; t <= close - duration; t += 60) {
      out.push({
        id: `mock-slot-${dateStr}-${t}`,
        time: fmtMins(t),
        taken: (date.getDate() + idx) % 4 === 0
      });
      idx++;
    }
    return out;
  };

  const isDesktop = useIsDesktop();
  
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  
  
  const [bookStep, setBookStep] = useState("service");
  
  
  const [bookName, setBookName] = useState("");
  const [bookNote, setBookNote] = useState("");
  const [bookListing, setBookListing] = useState<any>(null);
  const [calMonth, setCalMonth] = useState(() => startOfMonth(new Date()));
  
  
  
  
  
  
  const [annOff, setAnnOff] = useState(false);
  
  
  const [faqOpen, setFaqOpen] = useState<any>(null);
  const [cName, setCName] = useState("");
  const [cMsg, setCMsg] = useState("");
  const [cSvc, setCSvc] = useState("");
  const [cDate, setCDate] = useState("");
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
  
  
  
  
  
  const [blogCat, setBlogCat] = useState("All");
  const [pfCat, setPfCat] = useState("All");
  const [pfArea, setPfArea] = useState("All");
  const [pfSort, setPfSort] = useState("");
  const [pfBeds, setPfBeds] = useState(0);
  const [pfMenu, setPfMenu] = useState<any>(null);
  const [pfAll, setPfAll] = useState(false);
  const [listTab, setListTab] = useState("overview");
  const [post, setPost] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  

  
  const go = (p: string) => { setPost(null); setPage(p); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPost = (p: any) => { setPost(p); setPage("post"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openListing = (p?: any) => { setListing(p); setListTab("overview"); setPage("listing"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const homeListings = displayPortfolio.filter((p) => p.status !== "taken");
  
  

  const primaryCta = ({

    book: { label: "Browse listings", Icon: MapPin, run: () => go("portfolio") },
    shop: { label: "Shop now", Icon: ShoppingBag, run: () => go("products") },
    message: { label: "Message us", Icon: WhatsApp, run: () => handleWa("Hello! I'm interested in your services.") },
  } as Record<string, any>)[DUMMY_STORE.primaryCta as any] || { label: "Book a slot", Icon: Calendar, run: () => openBooking() };

  const openBooking = (svc?: any, listing: any = null) => {
    const resolved = svc ? (SERVICES.find((s) => s.id === svc.id) || svc) : null;
    setBookSvc(resolved);
    setBookListing(listing);
    setBookStep(resolved ? "date" : "service");
    setBookDate(null); setBookTime(null); setBookName(""); setBookNote("");
    setCalMonth(startOfMonth(new Date()));
    setDrawer(false);
    setBookOpen(true);
  };
  const openViewing = (listing: any) => openBooking(SERVICES[0], listing);

  const bookingFlow = () => {
    const titles = { service: "Choose a service", date: "Choose a date", time: "Choose a time", review: "Confirm booking" };
    const backTo = { date: "service", time: "date", review: "time" };
    const onBack = (backTo as any)[bookStep] ? () => setBookStep((backTo as any)[bookStep]) : undefined;
    const deposit = bookSvc ? Math.max(2000, Math.round((bookSvc.price * 0.2) / 500) * 500) : 0;
    const today = startOfDay(new Date());
    const horizon = addDays(today, 90);
    const y = calMonth.getFullYear(), mo = calMonth.getMonth();
    const monthStart = new Date(y, mo, 1);
    const offset = (monthStart.getDay() + 6) % 7;
    const dim = new Date(y, mo + 1, 0).getDate();
    const prevOff = monthStart <= startOfMonth(today);
    const nextOff = monthStart >= startOfMonth(horizon);
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(y, mo, d));
    const slots = bookSvc && bookDate ? getDaySlots(bookDate) : [];
    const svcBar = bookSvc && (<>
      <div className="bk-svcbar">
        <span><b>{bookSvc.name}</b><i>{bookSvc.dur} <span className="ps-dot">•</span> {money(bookSvc.price)}</i></span>
        <button onClick={() => setBookStep("service")}>Change</button>
      </div>
      {bookListing && <div className="bk-listing"><MapPin size={13} /> <span>{listingName(bookListing)}</span><b>{listingPrice(bookListing)}</b></div>}
    </>);
    return (
      <Sheet onClose={() => setBookOpen(false)} onBack={onBack} title={(titles as any)[bookStep]}>
        {bookStep === "service" && (<>
          <p className="ps-sheet-sub">Pick the service you would like to book.</p>
          <div className="bk-svclist">
            {SERVICES.map((s: any) => (
              <button key={s.id} className="bk-svc" onClick={() => { setBookSvc(s); setBookStep("date"); }}>
                <span className={`bk-thumb ${catColor(s.cat)}`}><Sparkles size={18} /></span>
                <span className="bk-svc-main"><b>{s.name}</b><i>{s.cat} <span className="ps-dot">•</span> {s.dur}</i></span>
                <span className="bk-svc-price">{money(s.price)} <ChevronRight size={15} /></span>
              </button>
            ))}
          </div>
        </>)}

        {bookStep === "date" && (<>
          {svcBar}
          <div className="bk-cal">
            <div className="bk-cal-head">
              <button disabled={prevOff} onClick={() => !prevOff && setCalMonth(new Date(y, mo - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
              <b>{calMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b>
              <button disabled={nextOff} onClick={() => !nextOff && setCalMonth(new Date(y, mo + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
            </div>
            <div className="bk-cal-wd">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w: any) => <span key={w}>{w}</span>)}</div>
            <div className="bk-cal-grid">
              {cells.map((c: any, i: number) => {
                if (!c) return <span key={"b" + i} className="bk-cal-blank" />;
                const off = hoursForDate(c) === "Closed" || c < today || c > horizon;
                const sel = sameDay(c, bookDate);
                return (
                  <button key={i} disabled={off} className={`bk-cal-day${sel ? " sel" : ""}${off ? " off" : ""}`}
                    onClick={() => { if (!off) { setBookDate(c); setBookTime(null); setBookStep("time"); } }}>{c.getDate()}</button>
                );
              })}
            </div>
            <p className="ps-deposit"><Lock size={12} /> Closed days and past dates cannot be selected. You can book up to three months ahead.</p>
          </div>
        </>)}

        {bookStep === "time" && (<>
          {svcBar}
          <p className="ps-field-lbl">{bookDate ? fmtDateFull(bookDate) : ''}</p>
          {slots.length > 0 ? (
            <div className="bk-times">
              {slots.map((slot: any) => (
                <button
                  key={slot.id}
                  disabled={slot.taken}
                  className={`bk-slot${slot.taken ? " taken" : ""}`}
                  onClick={() => { if (!slot.taken) { setBookTime(slot.time); setBookStep("review"); } }}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : <p className="bk-empty">No times available on this day. Try another date.</p>}
        </>)}

        {bookStep === "review" && (<>
          {svcBar}
          <div className="bk-summary">
            <div><span>Date</span><b>{bookDate ? fmtDateFull(bookDate) : ''}</b></div>
            <div><span>Time</span><b>{bookTime}</b></div>
            <div><span>Duration</span><b>{bookSvc.dur}</b></div>
            <div><span>Total</span><b>{money(bookSvc.price)}</b></div>
          </div>
          <p className="ps-field-lbl">Your name</p>
          <input className="bk-input" value={bookName} onChange={(e) => setBookName(e.target.value)} placeholder="Name on the booking" />
          <p className="ps-field-lbl">Anything we should know? (optional)</p>
          <textarea className="bk-input bk-textarea" value={bookNote} onChange={(e) => setBookNote(e.target.value)} placeholder="Allergies, references, parking, anything useful" />
          <div className="bk-deposit-row"><span><Lock size={13} /> Deposit to secure</span><b>{money(deposit)}</b></div>
          <p className="ps-deposit">Frontstore holds your deposit until your appointment, then the {money(bookSvc.price - deposit)} balance is due in person. Covered by buyer protection.</p>
          <button className="ps-sheet-cta" disabled={!bookName.trim()} onClick={() => { setBookOpen(false); ping("Slot secured, deposit held by Frontstore"); }}>Pay {money(deposit)} deposit to secure</button>
        </>)}
      </Sheet>
    );
  };
  const svcCats = [...new Set(SERVICES.map((s: any) => s.cat))];
  const durTest = (m: number) => svcDur === "All" || (svcDur === "short" && m < 60) || (svcDur === "mid" && m >= 60 && m <= 120) || (svcDur === "long" && m > 120);
  const svcFiltered = SERVICES
    .filter((s) => (svcCat === "All" || s.cat === svcCat) && durTest(s.durMin) &&
      (svcQuery.trim() === "" || (s.name + " " + s.desc + " " + s.cat).toLowerCase().includes(svcQuery.trim().toLowerCase())))
    .sort((a, b) => (svcSort === "priceAsc" ? a.price - b.price : svcSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const svcHasFilters = svcCat !== "All" || svcDur !== "All" || svcQuery.trim() !== "";
  const clearSvc = () => { setSvcQuery(""); setSvcCat("All"); setSvcDur("All"); setSvcSort("popular"); };
  const catColor = (cat: string) => "c" + (svcCats.indexOf(cat) % 4);
  const prodCats = [...new Set(PRODUCTS.map((p: any) => p.cat))];
  const priceTest = (price: number) => prodPrice === "All" || (prodPrice === "lo" && price < 10000) || (prodPrice === "mid" && price >= 10000 && price <= 15000) || (prodPrice === "hi" && price > 15000);
  const prodFiltered = PRODUCTS
    .filter((p) => (prodCat === "All" || p.cat === prodCat) && priceTest(p.price) &&
      (prodQuery.trim() === "" || (p.name + " " + p.desc + " " + p.cat).toLowerCase().includes(prodQuery.trim().toLowerCase())))
    .sort((a, b) => (prodSort === "priceAsc" ? a.price - b.price : prodSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const prodHasFilters = prodCat !== "All" || prodPrice !== "All" || prodQuery.trim() !== "";
  const clearProd = () => { setProdQuery(""); setProdCat("All"); setProdPrice("All"); setProdSort("popular"); };
  const prodColor = (cat: string) => "c" + (prodCats.indexOf(cat) % 4);
  const blogCats = [...new Set(displayBlog.map((b: any) => b.cat))];
  const blogList = blogCat === "All" ? displayBlog : displayBlog.filter((b) => b.cat === blogCat);
  const pfCats = [...new Set(displayPortfolio.map((p: any) => p.cat))];
  const pfAreas = [...new Set(displayPortfolio.map((p: any) => p.area))];
  const pfList = displayPortfolio
    .filter((p) => pfCat === "All" || p.cat === pfCat)
    .filter((p) => pfArea === "All" || p.area === pfArea)
    .filter((p) => !pfBeds || p.beds >= pfBeds)
    .slice()
    .sort((a, b) => {
      const t = (a.status === "taken" ? 1 : 0) - (b.status === "taken" ? 1 : 0);
      if (t !== 0) return t;
      if (pfSort === "asc") return a.price - b.price;
      if (pfSort === "desc") return b.price - a.price;
      return 0;
    });
  const faqId = (c: string) => "faq-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const termId = (c: string) => "tm-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const faqQ = faqQuery.trim().toLowerCase();
  const faqFiltered = FAQ_GROUPS
    .map((g: any) => ({ ...g, items: faqQ ? g.items.filter(([q, a]: any) => (q + " " + a).toLowerCase().includes(faqQ)) : g.items }))
    .filter((g) => g.items.length > 0);
  const REV_DIST = [[5, 80], [4, 14], [3, 3], [2, 2], [1, 1]];
  const revFiltered = displayReviews
    .filter((rv) => (revStar === 0 || rv.r === revStar) && (!revPhotos || rv.photos > 0))
    .sort((a, b) => (revSort === "high" ? b.r - a.r : revSort === "low" ? a.r - b.r : 0));
  const revPhotoTiles = displayReviews.filter((rv) => rv.photos > 0).flatMap((rv) => Array.from({ length: rv.photos }).map((_: any, i: number) => rv.id + i)).slice(0, 8);
  
  const featSvcIds = MOCK_FEATURED.filter((f) => f.type === "service").map((f: any) => f.id);
  const featProdIds = MOCK_FEATURED.filter((f) => f.type === "product").map((f: any) => f.id);
  const homeServices = SERVICES.filter((s) => !featSvcIds.includes(s.id));
  const homeProducts = PRODUCTS.filter((p) => !featProdIds.includes(p.id));

  /* ---- shared content blocks ---- */
  const servicesGrid = (g: any, list: any) => (
    <div className={g}>{(list || SERVICES).map((s: any) => <ServiceCard key={s.id} s={s} onBook={() => openBooking(s)} />)}</div>
  );
  const productsGrid = (g: any, list: any) => (
    <div className={g}>{(list || PRODUCTS).map((p: any) => <ProductCard key={p.id} p={p} onBuy={() => addBag(p.name)} onView={() => router.push(storePath(username, `/products/${p.slug}`))} />)}</div>
  );
  const reviewsBody = () => (<>
    <p className="svc-intro">Every review here comes from a verified order on Frontstore. The agent can respond, but cannot remove genuine reviews.</p>
    <RatingSummary rating={DUMMY_STORE.rating} reviews={DUMMY_STORE.reviews} />
    <button className="rev-leave rev-leave-m" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
    <div className="rev-trust rev-trust-m"><ShieldCheck size={14} /> Reviews are from verified orders. The agent typically responds in {DUMMY_STORE.reply}.</div>
    {revPhotoTiles.length > 0 && (
      <div className="rev-photostrip">
        <h4>Customer photos</h4>
        <div className="rev-photos">{revPhotoTiles.map((k: any, i: number) => <button key={k} className={`rev-ph c${i % 3}`} onClick={() => ping("Opening photo")} aria-label="Photo" />)}</div>
      </div>
    )}
    <div className="rev-filter-m">
      {[5, 4, 3].map((n: any) => <button key={n} className={revStar === n ? "on" : ""} onClick={() => setRevStar(revStar === n ? 0 : n)}>{n} <Star size={11} className="f" /></button>)}
      <button className={revPhotos ? "on" : ""} onClick={() => setRevPhotos(!revPhotos)}>With photos</button>
    </div>
    <div className="svc-results-head">
      <b>{revFiltered.length} {revFiltered.length === 1 ? "review" : "reviews"}</b>
      {(revStar !== 0 || revPhotos) && <button className="svc-clear" onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear</button>}
    </div>
    {revFiltered.length > 0 ? (
      <div className="rev-list rev-list-m">{revFiltered.map((rv: any) => <ReviewCardRich storeInitial={DUMMY_STORE.initial} key={rv.id} rv={rv} />)}</div>
    ) : <div className="svc-empty">No reviews match your filters.<button onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button></div>}
  </>);
  const aboutFounderBody = () => (<>
    <span className="ab-kicker">Meet the founder</span>
    <h3 className="ab-name">{DUMMY_AUTHOR.name}</h3>
    <span className="ab-role">{DUMMY_AUTHOR.role}</span>
    <span className="ab-verified"><BadgeCheck size={14} /> Verified by Frontstore</span>
    <p className="ab-bio">{DUMMY_AUTHOR.long}</p>
    <div className="ab-chips">{DUMMY_AUTHOR.specialities.map((s: any) => <span key={s}>{s}</span>)}</div>
    <div className="ab-creds">
      <span className="ab-creds-h">Training and credentials</span>
      <ul>{DUMMY_AUTHOR.credentials.map((c: any) => <li key={c}><Check size={14} /> {c}</li>)}</ul>
    </div>
    <p className="ab-quote">{DUMMY_AUTHOR.quote}</p>
    <div className="ab-socials">
      {DUMMY_AUTHOR.socials?.instagram && <button onClick={() => window.open(`https://instagram.com/${DUMMY_AUTHOR.socials.instagram.replace(/^@/, '')}`, '_blank')}><Instagram size={16} /> {DUMMY_AUTHOR.socials.instagram}</button>}
      {DUMMY_AUTHOR.socials?.tiktok && <button onClick={() => window.open(`https://tiktok.com/@${DUMMY_AUTHOR.socials.tiktok.replace(/^@/, '')}`, '_blank')}><Tiktok size={16} /> {DUMMY_AUTHOR.socials.tiktok}</button>}
    </div>
  </>);
  const aboutWork = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">Recent listings</h4>
        <button className="ab-seclink" onClick={() => go("portfolio")}>See more <ChevronRight size={14} /></button>
      </div>
      <div className="ab-gallery">
        {MOCK_GALLERY.map((g: any) => (
          <button key={g.label} className={`ab-shot ${g.c}`} onClick={() => ping("Opening photo")}>
            <span className="ab-shot-cap">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
  const aboutFeatured = () => (
    <div className="ab-featured">
      <span className="ab-featured-h"><Award size={14} /> As seen in and trusted by</span>
      <div className="ab-featured-row">{RECOGNITION.map((r: any) => <span key={r} className="ab-logo">{r}</span>)}</div>
    </div>
  );
  const aboutReview = () => {
    const r = displayReviews[0];
    if (!r) return null;
    return (
      <div className="ab-review">
        <Quote className="ab-quote-mark" size={28} />
        <p className="ab-review-text">{r.text}</p>
        <div className="ab-review-foot">
          <div className="ab-review-by">
            <span className="ab-review-av">{r.name[0]}</span>
            <div><b>{r.name}</b><span className="ab-review-tag"><BadgeCheck size={13} /> Verified order · {r.service}</span></div>
          </div>
          {(store.storefront_sections || []).includes("reviews") && (
          <button className="ab-review-all" onClick={() => go("reviews")}>Read all {DUMMY_STORE.reviews} reviews <ChevronRight size={14} /></button>
        )}
        </div>
      </div>
    );
  };
  const aboutJournal = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">{DUMMY_AUTHOR.name ? `From ${DUMMY_AUTHOR.name.split(" ")[0]}'s journal` : "From the journal"}</h4>
        <button className="ab-seclink" onClick={() => go("blog")}>All articles <ChevronRight size={14} /></button>
      </div>
      <div className="ab-journal">
        {displayBlog.slice(0, 3).map((b: any) => (
          <button key={b.title} className="ab-journal-item" onClick={() => go("blog")}>
            <span className="ab-journal-cat">{b.cat}</span>
            <b>{b.title}</b>
            <span className="ab-journal-meta">{b.read} read</span>
          </button>
        ))}
      </div>
      <p className="ab-journal-note">Written by {DUMMY_AUTHOR.name}, drawing on twelve years in Lagos property.</p>
    </div>
  );
  const aboutBody = () => (<>
    <p className="ps-prose">{DUMMY_STORE.bio}</p>
    <p className="ab-para">{store.about_intro_text || "What began in 2014 as one agent with a phone and a patch of Lekki is now a small, trusted practice across Lekki and Ikoyi, known for honest advice and properties that hold their value."}</p>
    <div className="ab-founder ab-founder-m">
      <div className="ab-portrait"><span className="ab-portrait-mono">{DUMMY_AUTHOR.initial}</span><span className="ab-portrait-tag">Agent</span></div>
      <div className="ab-founder-body">{aboutFounderBody()}</div>
    </div>
    {aboutWork()}
    {aboutFeatured()}
    <div className="ab-section">
      <h4 className="ab-subhead">What we offer</h4>
      <div className="ab-offer-grid ab-grid-m">
        {MOCK_OFFERINGS.map(([t, d, pg]: any) => (
          <button key={t} className="ab-offer-card" onClick={() => go(pg)}>
            <b>{t}</b>
            <p>{d}</p>
            <span className="ab-offer-link">{pg === "products" ? "View guides" : "View services"} <ChevronRight size={14} /></span>
          </button>
        ))}
      </div>
    </div>
    <div className="ab-section">
      <h4 className="ab-subhead">Good to know</h4>
      <div className="ab-facts ab-facts-m">
        {ABOUT_FACTS.map(([k, v]: any) => (
          <div className="ab-fact" key={k}><span className="ab-fact-k">{k}</span><span className="ab-fact-v">{v}</span></div>
        ))}
      </div>
    </div>
    {aboutReview()}
    {aboutJournal()}
    <div className="ps-about-grid">
      {DUMMY_STORE.orders ? <div><b>{DUMMY_STORE.orders}</b><span>deals closed</span></div> : null}
      {DUMMY_STORE.rating ? <div><b>{DUMMY_STORE.rating}</b><span>average rating</span></div> : null}
      {store.since && <div><b>{new Date().getFullYear() - parseInt(store.since)} yrs</b><span>in practice</span></div>}
    </div>
    <div className="ab-follow">
      <span className="ab-follow-h">Follow the agent</span>
      <div className="ab-socials">
        {DUMMY_STORE.socials?.instagram && <button onClick={() => window.open(`https://instagram.com/${DUMMY_STORE.socials.instagram.replace(/^@/, '')}`, '_blank')}><Instagram size={16} /> {DUMMY_STORE.socials.instagram}</button>}
        {DUMMY_STORE.socials?.tiktok && <button onClick={() => window.open(`https://tiktok.com/@${DUMMY_STORE.socials.tiktok.replace(/^@/, '')}`, '_blank')}><Tiktok size={16} /> {DUMMY_STORE.socials.tiktok}</button>}
        <button onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={16} /> WhatsApp</button>
      </div>
    </div>
    <button className="ab-book-m" onClick={() => openBooking()}><Calendar size={16} /> Book a viewing</button></>);
  const faqSections = () => (
    <div className="faq-groups">
      {faqFiltered.length === 0 && (
        <div className="faq-empty">No questions match that search. Try another word, or message the agent below.</div>
      )}
      {faqFiltered.map((g: any) => (
        <section key={g.cat} id={faqId(g.cat)} className="faq-group">
          <h3 className="faq-group-head"><g.icon size={16} /> {g.cat}</h3>
          <div className="ps-acc">
            {g.items.map(([q, a]: any) => {
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
      ))}
    </div>
  );
  const faqHelp = () => (
    <div className="faq-help">
      <b>Still need help?</b>
      <p>{store.faq_help_text || "Message the agent directly and we will get back to you" + (DUMMY_STORE.reply ? ", usually in " + DUMMY_STORE.reply : "") + "."}</p>
      <button className="faq-help-cta" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={15} /> Message on WhatsApp</button>
    </div>
  );
  const faqBody = () => (<>
    <div className="faq-search faq-search-m">
      <Search size={15} />
      <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions" />
    </div>
    {faqSections()}
    {faqHelp()}
  </>);
  const contactChannels = () => (
    <div className="ct-channels">
      <button className="ct-wa" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={18} /> Chat on WhatsApp</button>
      <div className="ct-alt">
        {DUMMY_STORE.email && <button onClick={() => window.location.href = `mailto:${DUMMY_STORE.email}`}><Mail size={15} /> {DUMMY_STORE.email}</button>}
        {DUMMY_STORE.phone && <button onClick={() => window.location.href = `tel:${DUMMY_STORE.phone}`}><Phone size={15} /> {DUMMY_STORE.phone}</button>}
      </div>
    </div>
  );
  const contactForm = () => (
    <div className="ct-form">
      <h4 className="ab-subhead">Send an enquiry</h4>
      <p className="ct-form-sub">Tell us what you are after and we will reply by email. A real person from the team will answer.</p>
      <div className="ct-form-row">
        <select className="ct-input" value={cSvc} onChange={(e) => setCSvc(e.target.value)}>
          <option value="">Service (optional)</option>
          {SERVICES.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
          <option value="Not sure yet">Not sure yet</option>
        </select>
        <input type="date" className="ct-input" value={cDate} onChange={(e) => setCDate(e.target.value)} aria-label="Preferred date" />
      </div>
      <input className="ct-input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Your name" />
      <textarea className="ct-input ct-textarea" rows={4} value={cMsg} onChange={(e) => setCMsg(e.target.value)} placeholder="Any details, like your preferred time or the look you have in mind." />
      <button className="ct-send" onClick={() => { if (!cName.trim() || !cMsg.trim()) { ping("Please add your name and a short note"); return; } window.location.href = `mailto:${DUMMY_STORE.email}`; }}><Mail size={16} /> Send email</button>
      <p className="ct-form-note">This opens your email app with the details ready to send to {DUMMY_STORE.email}.</p>
    </div>
  );
  const contactVisit = () => {
    const openToday = (HOURS[todayIdx][1] || "").toLowerCase() !== "closed";
    return (
      <div className="ct-visit">
        <div className="ab-rail-h"><MapPin size={15} /> Visit the office</div>
        <div className="ct-map"><span className="ct-map-pin"><MapPin size={15} /></span><span className="ct-map-label">Lekki Phase 1</span></div>
        <p className="ab-addr">{DUMMY_STORE.address}</p>
        {DUMMY_STORE.address && <button className="ps-dir" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DUMMY_STORE.address)}`, '_blank')}><Navigation size={15} /> Directions</button>}
        <div className="ct-hours">
          <div className="ct-hours-head">
            <b>Opening hours</b>
            <span className={`ct-open ${openToday ? "" : "closed"}`}><span className="dot" /> {openToday ? "Open today" : "Closed today"}</span>
          </div>
          <ul className="ct-hours-list">
            {HOURS.map(([d, h]: any, i: number) => (
              <li key={d} className={i === todayIdx ? "today" : ""}>
                <span>{d}</span>
                {(h || "").toLowerCase() === "closed" ? <span className="clo">Closed</span> : <b>{h}</b>}
              </li>
            ))}
          </ul>
        </div>
        <div className="ab-follow-rail">
          <span>Follow the agent</span>
          <div className="ab-follow-icons">
            {DUMMY_STORE.socials?.instagram && <button onClick={() => window.open(`https://instagram.com/${DUMMY_STORE.socials.instagram.replace(/^@/, '')}`, '_blank')} aria-label="Instagram"><Instagram size={17} /></button>}
            {DUMMY_STORE.socials?.tiktok && <button onClick={() => window.open(`https://tiktok.com/@${DUMMY_STORE.socials.tiktok.replace(/^@/, '')}`, '_blank')} aria-label="TikTok"><Tiktok size={17} /></button>}
            <button onClick={() => handleWa("Hello! I'm interested in your services.")} aria-label="WhatsApp"><WhatsApp size={17} /></button>
          </div>
        </div>
      </div>
    );
  };
  const contactBody = () => (<>
    <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email.</p>
    {contactChannels()}
    {contactForm()}
    {contactVisit()}
  </>);
  const refundsSections = () => (
    <div className="rf-sections">
      <div className="rf-section">
        <h3 className="rf-section-head"><Calendar size={17} /> Appointments</h3>
        <ul className="rf-list">
          <li><Check size={15} /> Reschedule or cancel up to 24 hours before your appointment for a full refund of your deposit.</li>
          <li><Check size={15} /> Within 24 hours of your appointment, the deposit is held against the booking and is not refunded.</li>
          <li><Check size={15} /> Need a different day? You can reschedule once at no cost up to 24 hours before, subject to availability.</li>
        </ul>
      </div>
      <div className="rf-section">
        <h3 className="rf-section-head"><ShoppingBag size={17} /> Guides</h3>
        <ul className="rf-list">
          <li><Check size={15} /> Guides are digital and sent the moment you pay, so there is nothing to post back.</li>
          <li><Check size={15} /> As digital downloads, guides cannot be returned once sent, unless the file is faulty or wrong.</li>
          <li><Check size={15} /> A failed download or the wrong file is put right at no cost, just message the agent.</li>
        </ul>
      </div>
      <div className="rf-section">
        <h3 className="rf-section-head"><RotateCcw size={17} /> Refunds</h3>
        <ul className="rf-list">
          {store.policy_refunds ? (
            store.policy_refunds.split('\n').filter(Boolean).map((line: string, idx: number) => (
              <li key={idx}><Check size={15} /> {line}</li>
            ))
          ) : (
            <>
              <li><Check size={15} /> Orders paid through Frontstore are refunded to your original payment method, usually within a few working days.</li>
              <li><Check size={15} /> For bank transfer orders, the agent arranges your refund directly, since those funds are paid straight to them.</li>
            </>
          )}
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
        <li><RotateCcw size={16} /><div><b>Refunds</b><span>To your original payment method</span></div></li>
      </ul>
    </div>
  );
  const refundsAction = () => (
    <div className="blog-convert">
      <b>Need to cancel or return something?</b>
      <p>Message the agent and we will sort your cancellation, return or refund.</p>
      <button className="blog-convert-cta" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={15} /> Message on WhatsApp</button>
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
      <p className="svc-intro">Plans change, and sometimes things go wrong. Here is exactly how cancellations, returns and refunds work on this store.</p>
      {refundsKeyPoints()}
      {refundsSections()}
      <LockedFrontstorePanel title="Frontstore buyer protection" body="Orders paid through Frontstore are protected. If an order does not arrive as described, you can raise a dispute and we will help mediate a resolution. This protection cannot be removed by the vendor." />
      {refundsAction()}
      {refundsRelated()}
    </div>
  );
  const policySections = (items: any[]) => items.map((s: any) => (
    <section key={s.t} id={termId(s.t)} className="tm-section">
      <h3>{s.t}</h3>
      {(s.p as any[]).map((para: any, i: number) => <p key={i}>{para}</p>)}
      {s.locked && <LockedFrontstorePanel title={s.locked.title} body={s.locked.body} link={s.locked.link} />}
      {s.link && <button className="tm-link" onClick={() => go(s.link.page)}>{s.link.label} <ChevronRight size={14} /></button>}
    </section>
  ));
  const policyRelated = (links: any) => (
    <div className="rf-related">
      <span className="rf-related-h">Related</span>
      {links.map(([label, pg]: any) => <button key={pg} onClick={() => go(pg)}>{label} <ChevronRight size={15} /></button>)}
    </div>
  );
  const termsBody = () => (
    <div className="tm-body-m">
      <p className="tm-intro">By booking or buying from {DUMMY_STORE.name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
      {policySections(TERMS)}
      <div className="tm-meta">Last updated 1 June 2026</div>
      {policyRelated([["Refunds", "returns"], ["FAQ", "faq"]])}
    </div>
  );
  const privacyBody = () => (
    <div className="tm-body-m">
      <p className="tm-intro">This notice explains what {DUMMY_STORE.name} does with your information when you book, buy or get in touch.</p>
      {policySections(PRIVACY)}
      <div className="tm-meta">Last updated 1 June 2026</div>
      {policyRelated([["Terms", "terms"], ["Refunds", "returns"]])}
    </div>
  );
  const blogBody = () => (
    <div className="blog-grid">
      {displayBlog.map((b: any, i: number) => (
        <BlogCard authorName={DUMMY_AUTHOR.name} key={b.title} b={b} colour={`c${i % 3}`} onOpen={() => openPost(b)} />
      ))}
    </div>
  );
  const portfolioChips = () => (
    <div className="blog-topics">
      {["All", ...pfCats].map((c: any) => (
        <button key={c} className={pfCat === c ? "on" : ""} onClick={() => setPfCat(c)}>{c}</button>
      ))}
    </div>
  );
  const pfFilters = () => (
    <div className="pf-filters">
      {pfMenu && <div className="pf-fscrim" onClick={() => setPfMenu(null)} />}
      <div className="pf-fdrop">
        <button className={`pf-fbtn${pfArea !== "All" ? " active" : ""}`} onClick={() => setPfMenu(pfMenu === "area" ? null : "area")}>{pfArea === "All" ? "Location" : pfArea} <ChevronDown size={15} /></button>
        {pfMenu === "area" && (
          <div className="pf-fmenu">
            {["All", ...pfAreas].map((a: any) => (
              <button key={a} className={pfArea === a ? "on" : ""} onClick={() => { setPfArea(a); setPfMenu(null); }}>{a === "All" ? "All locations" : a}</button>
            ))}
          </div>
        )}
      </div>
      <div className="pf-fdrop">
        <button className={`pf-fbtn${pfSort ? " active" : ""}`} onClick={() => setPfMenu(pfMenu === "price" ? null : "price")}>Price <ChevronDown size={15} /></button>
        {pfMenu === "price" && (
          <div className="pf-fmenu">
            {[["", "Any price"], ["asc", "Low to high"], ["desc", "High to low"]].map(([v, l]: any) => (
              <button key={v} className={pfSort === v ? "on" : ""} onClick={() => { setPfSort(v); setPfMenu(null); }}>{l}</button>
            ))}
          </div>
        )}
      </div>
      <button className="pf-fall" onClick={() => setPfAll(true)}><SlidersHorizontal size={15} /> All filters</button>
    </div>
  );
  const listingCard = (p: any) => {
    const taken = p.status === "taken";
    return (
      <div key={p.id} className={`pf-card${taken ? " is-taken" : ""}`} role="button" tabIndex={0}
        onClick={() => openListing(p)} onKeyDown={(e) => { if (e.key === "Enter") openListing(p); }}>
        <ListingPhotos p={p} taken={taken} />
        <div className="pf-body">
          <h3 className="pf-name">{listingName(p)}</h3>
          <div className="pf-price">
            <span className="pf-amt">{money2(p.price)}</span>
            {p.basis && <span className="pf-per">{basisLabel(p.basis)}</span>}
          </div>
        </div>
      </div>
    );
  };
  const listingCards = (items: any) => (<div className="pf-grid">{items.map((p: any) => listingCard(p))}</div>);
  const portfolioGrid = () => listingCards(pfList);
  const portfolioFollow = () => (
    <div className="ab-follow">
      <span className="ab-follow-h">More on social</span>
      <div className="ab-socials">
        {DUMMY_STORE.socials?.instagram && <button onClick={() => window.open(`https://instagram.com/${DUMMY_STORE.socials.instagram.replace(/^@/, '')}`, '_blank')}><Instagram size={16} /> {DUMMY_STORE.socials.instagram}</button>}
        {DUMMY_STORE.socials?.tiktok && <button onClick={() => window.open(`https://tiktok.com/@${DUMMY_STORE.socials.tiktok.replace(/^@/, '')}`, '_blank')}><Tiktok size={16} /> {DUMMY_STORE.socials.tiktok}</button>}
      </div>
    </div>
  );
  const portfolioBody = () => (<>
    <p className="svc-intro">A look at current and recent listings across Lekki and Ikoyi.</p>
    {pfFilters()}
    {portfolioChips()}
    {portfolioGrid()}
    <button className="ab-book-m" onClick={() => openBooking()}><Calendar size={16} /> Book a viewing</button>
    {portfolioFollow()}
  </>);
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
            <div className={`art-hero ${colour}`}><span className="blog-cat">{post.cat}</span></div>
            <span className="art-kicker">{post.cat}</span>
            <h1 className="art-title">{post.title}</h1>
            <div className="art-meta">
              <span className="art-meta-av">{DUMMY_AUTHOR.initial}</span>
              <span className="art-meta-by">By {DUMMY_AUTHOR.name}</span>
              <span className="ps-dot">•</span> {post.date} <span className="ps-dot">•</span> {post.read} read
            </div>
            <div className="art-body">
              {post.body.map((blk: any, i: number) =>
                blk.h ? <h3 key={i}>{blk.h}</h3>
                : blk.list ? <ul key={i}>{(blk.list as any[]).map((it: any, j: number) => <li key={j}>{it}</li>)}</ul>
                : <p key={i}>{blk.p}</p>
              )}
            </div>
            <div className="art-author">
              <span className="author-av">{DUMMY_AUTHOR.initial}</span>
              <div className="art-author-main">
                <span className="art-author-tag">Written by</span>
                <b>{DUMMY_AUTHOR.name}</b>
                <span className="art-author-role">{DUMMY_AUTHOR.role}</span>
                <p>{DUMMY_AUTHOR.bio}</p>
                <button className="author-link" onClick={() => go("about")}>More about {DUMMY_AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
              </div>
            </div>
          </article>
          <aside className="art-rail">
            <div className="art-share">
              <span className="art-share-h">Share this article</span>
              <div className="art-share-row">
                <button onClick={() => ping("Sharing on WhatsApp")}><WhatsApp size={16} /> WhatsApp</button>
                <button onClick={() => ping("Link copied")}><Copy size={15} /> Copy link</button>
              </div>
            </div>
            <div className="blog-convert">
              <b>Enjoyed the read?</b>
              <p>Book a viewing, or pick up one of the guides.</p>
              <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a viewing</button>
              {(store.storefront_sections || []).includes("products") && (
          <button className="blog-convert-ghost" onClick={() => go("products")}>View guides</button>
        )}
            </div>
          </aside>
        </div>
        <div className="art-related">
          <h3 className="ab-subhead">More from the journal</h3>
          <div className="blog-grid">
            {related.map((b: any) => <BlogCard authorName={DUMMY_AUTHOR.name} key={b.title} b={b} colour={`c${displayBlog.indexOf(b) % 3}`} onOpen={() => openPost(b)} />)}
          </div>
        </div>
        <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
      </div>
    );
  };

  const listingView = () => {
    if (!listing) return null;
    const p = listing;
    const taken = p.status === "taken";
    const ref = "CB-" + p.id.toUpperCase();
    const kitchen = p.beds >= 5 ? 2 : 1;
    const facts = [
      ["Listing type", p.cat],
      ["Property type", p.ptype],
      ["Bedrooms", String(p.beds)],
      ["Bathrooms", String(p.baths)],
      ["Kitchen", kitchen > 1 ? kitchen + " kitchens" : "1 kitchen"],
      ["Area", p.area],
      ["Status", taken ? "Taken" : "Available"],
      ["Reference", ref],
    ];
    const isRent = p.basis === "month";
    const annual = p.price * 12;
    const pbreak = isRent
      ? { rows: [["Rent", listingPrice(p)], ["Caution deposit (refundable)", money(p.price)], ["Agency fee", money(Math.round(annual * 0.1))], ["Legal and agreement", money(Math.round(annual * 0.1))]], note: "Indicative move-in costs. The caution deposit is refundable. Confirm the exact figures with the agent before you commit." }
      : { rows: [["Asking price", money(p.price)], ["Agency fee (5%)", money(Math.round(p.price * 0.05))], ["Legal and documentation (5%)", money(Math.round(p.price * 0.05))]], note: "Indicative. The final fees are confirmed during the transaction." };
    const prefer = ["Suited to a working professional or a family", "Minimum let of one year", "Valid ID and references may be requested"];
    if (p.extra === "Serviced") prefer.push("Service charge covers power, security and shared facilities");
    const guide = (MOCK_AREA_GUIDE as any)[p.area] || MOCK_AREA_GUIDE._default;
    const tabs = [
      ["overview", "Overview"],
      ["description", "Description"],
      ["price", "Price"],
      ...(isRent ? [["tenant", "Tenant"]] : []),
      ["features", "Features"],
      ["area", "Area"],
    ];
    return (
      <div className="lst">
        <button className="lst-back" onClick={() => go("portfolio")}><ChevronLeft size={16} /> All listings</button>
        <div className="lst-top">
          <div className="lst-gallery"><ListingPhotos p={p} taken={taken} hero /></div>
          <div className="lst-detail">
            <div className="lst-summary">
              <h1 className="lst-title">{listingName(p)}</h1>
              <div className="lst-price"><span className="lst-amt">{money2(p.price)}</span>{p.basis && <span className="pf-per">{basisLabel(p.basis)}</span>}</div>
              <div className="lst-specs">
                <span><BedDouble size={15} /> {p.beds} bed</span>
                <span><Bath size={15} /> {p.baths} bath</span>
                <span><CookingPot size={15} /> {kitchen} kitchen</span>
              </div>
            </div>
            <div className="lst-tabs">
              {tabs.map(([id, label]: any) => (
                <button key={id} className={listTab === id ? "on" : ""} onClick={() => setListTab(id)}>{label}</button>
              ))}
            </div>
            <div className="lst-tabbody">
              {listTab === "overview" && <div className="lst-facts">{facts.map(([k, v]: any) => (<div key={k}><span>{k}</span><b>{v}</b></div>))}</div>}
              {listTab === "description" && <p className="lst-desc">{p.desc}</p>}
              {listTab === "price" && (<><div className="lst-pbreak">{pbreak.rows.map(([k, v]: any) => (<div key={k}><span>{k}</span><b>{v}</b></div>))}</div><p className="lst-pnote">{pbreak.note}</p></>)}
              {listTab === "tenant" && isRent && <ul className="lst-pref">{prefer.map((f: any, i: number) => <li key={i}><Check size={15} /> {f}</li>)}</ul>}
              {listTab === "features" && <ul className="lst-features">{(p.features || []).map((f: any, i: number) => <li key={i}><Check size={15} /> {f}</li>)}</ul>}
              {listTab === "area" && (<><p className="lst-desc">{guide.intro}</p><ul className="lst-pref">{(guide.points || []).map((f: any, i: number) => <li key={i}><MapPin size={15} /> {f}</li>)}</ul></>)}
            </div>
            <div className="lst-act">
              <div className="lst-act-info">
                <div className="lst-act-price"><span className="lst-amt">{money2(p.price)}</span>{p.basis && <span className="pf-per">{basisLabel(p.basis)}</span>}</div>
              </div>
              <div className="lst-act-btns">
                <button className="lst-msg" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={15} /> Enquire</button>
                {taken
                  ? <button className="lst-cta ghost" onClick={() => setNotifyOpen(true)}><Bell size={15} /> Notify me</button>
                  : <button className="lst-cta" onClick={() => openViewing(p)}><Calendar size={15} /> Book a viewing</button>}
              </div>
              <p className="lst-note">The viewing fee secures your slot and is credited back if you go on to buy or rent through {DUMMY_AUTHOR.name.split(" ")[0]}.</p>
              <div className="lst-trust"><ShieldCheck size={14} /> Secured by Frontstore</div>
            </div>
          </div>
        </div>
        <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
      </div>
    );
  };

  const announcement = !annOff && (
    <div className="ps-ann">
      <Megaphone size={16} />
      <p><b>Announcement</b> Fresh listings across Lekki and Ikoyi this month. Book a viewing before they go.</p>
      <button onClick={() => setAnnOff(true)} aria-label="Dismiss"><X size={15} /></button>
    </div>
  );
  const featured = MOCK_FEATURED.length > 0 ? (
    <section className="feat">
      <div className="feat-head"><span className="feat-tag"><Sparkles size={13} /> Featured</span></div>
      <div className="feat-grid">
        {MOCK_FEATURED.map((f: any) => (
          <FeaturedCard key={f.id} f={f} onAction={() => (f.type === "service" ? openBooking(f) : addBag(f.name))} />
        ))}
      </div>
    </section>
  ) : null;

  /* ---- drawer panel (mobile only) ---- */
  const Panel = ({ onClose }: { onClose?: () => void }) => (
    <div className="ps-panel">
      <div className="ps-panel-top">
        <span className="ps-logo"><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></span>
        {onClose && <button className="ps-x" onClick={onClose} aria-label="Close"><X size={20} /></button>}
      </div>
      <button className="ps-id" onClick={() => go("home")}>
        <span className="ps-id-av">{DUMMY_STORE.initial}</span>
        <span className="ps-id-main">
          <b>{DUMMY_STORE.name} {store.is_verified ? <BadgeCheck size={14} className="ps-verif" /> : null}</b>
          <i>frontstore.ng/{username}</i>
          {DUMMY_STORE.rating ? <em><Star size={12} className="ps-star" /> {DUMMY_STORE.rating} ({DUMMY_STORE.reviews})</em> : null}
        </span>
      </button>
      <nav className="ps-nav">
        {NAV.map(([id, label]: any) => (
          <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>
            {label}{page === id && <ChevronRight size={16} />}
          </button>
        ))}
      </nav>
      <div className="ps-panel-actions">
        <button className="ps-act-book" onClick={() => { primaryCta.run(); onClose && onClose(); }}><primaryCta.Icon size={17} /> {primaryCta.label}</button>
        <div className="ps-act-row">
          {DUMMY_STORE.primaryCta !== "message" && <button onClick={() => { handleWa("Hello! I'm interested in your services."); onClose && onClose(); }}><WhatsApp size={16} /> Message</button>}
          <button onClick={() => { setShare(true); onClose && onClose(); }}><Share2 size={16} /> Share</button>
        </div>
      </div>
      <div className="ps-panel-foot">
        <span><Lock size={12} /> Secured by Frontstore</span>
        <p>Buyer protection and platform terms apply to every order.</p>
      </div>
    </div>
  );

  const igH = (DUMMY_STORE.socials?.instagram || '').replace(/^@/, "");
  const tkH = (DUMMY_STORE.socials?.tiktok || '').replace(/^@/, "");
  const jIg = (DUMMY_AUTHOR.socials?.instagram || '').replace(/^@/, "");
  const jTk = (DUMMY_AUTHOR.socials?.tiktok || '').replace(/^@/, "");
  const aggregateRating = DUMMY_STORE.rating && (DUMMY_STORE.reviews ?? 0) > 0 ? { "@type": "AggregateRating", ratingValue: DUMMY_STORE.rating, reviewCount: DUMMY_STORE.reviews, bestRating: 5 } : null;
  const schema = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: DUMMY_STORE.name,
    description: DUMMY_STORE.bio,
    url: `https://frontstore.ng/${DUMMY_STORE.slug}`,
    image: `https://frontstore.ng/${DUMMY_STORE.slug}/cover.jpg`,
    priceRange: "$$",
    address: { "@type": "PostalAddress", streetAddress: DUMMY_STORE.address, addressLocality: "Lekki", addressRegion: "Lagos", addressCountry: "NG" },
    telephone: DUMMY_STORE.phone,
    email: DUMMY_STORE.email,
    sameAs: [`https://instagram.com/${igH}`, `https://tiktok.com/@${tkH}`],
    ...(aggregateRating ? { aggregateRating } : {}),
    founder: { "@type": "Person", name: DUMMY_AUTHOR.name, jobTitle: DUMMY_AUTHOR.role, sameAs: [`https://instagram.com/${jIg}`, `https://tiktok.com/@${jTk}`] },
    review: displayReviews.slice(0, 3).map((rv: any) => ({ "@type": "Review", author: { "@type": "Person", name: rv.name }, reviewRating: { "@type": "Rating", ratingValue: rv.r, bestRating: 5 }, reviewBody: rv.text })),
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "NG",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map(([q, a]: any) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div className="ps-root" style={storeStyleTheme}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ============ MOBILE ============ */}
      {!isDesktop && (
        <div className="ps-col">
          <header className="ps-top">
            <button className="ps-burger" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={22} /></button>
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></button>
            <button className="ps-top-icon" onClick={() => setSearch(true)} aria-label="Search"><Search size={20} /></button>
            <button className="ps-top-share" onClick={() => setShare(true)} aria-label="Share"><Share2 size={19} /></button>
          </header>

          <main className="ps-main">
            {page === "home" && (<>
              <section className="ps-cover-wrap">
                <div className="ps-cover"><StoreIcon className="ps-cover-icn" strokeWidth={1.1} /></div>
                <span className="ps-avatar">{DUMMY_STORE.initial}</span>
                <h1 className="ps-name">{DUMMY_STORE.name} {store.is_verified ? <BadgeCheck size={20} className="ps-verif" /> : null}</h1>
                <p className="ps-meta">{DUMMY_STORE.category} <span className="ps-dot">•</span> <MapPin size={13} /> {DUMMY_STORE.location}</p>
                <div className="ps-id-actions-row">
                  <button className="ps-url" onClick={copyUrl}>frontstore.ng/{username} <Copy size={13} /></button>
                  <button className="ps-notify" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                </div>
                <div className="ps-stats">
                  {DUMMY_STORE.rating ? <div><b><Star size={14} className="ps-star" /> {DUMMY_STORE.rating}</b><span>{DUMMY_STORE.reviews} reviews</span></div> : null}
                  {DUMMY_STORE.orders ? <div><b>{DUMMY_STORE.orders}</b><span>orders</span></div> : null}
                  <div><b>{DUMMY_STORE.reply}</b><span>reply time</span></div>
                </div>
                <p className="ps-bio">{DUMMY_STORE.bio}</p>
                <div className="ps-statusline">
                  <span className="ps-open"><span className="ps-pulse" /> Open now</span>
                  <span className="ps-secure"><ShieldCheck size={13} /> Secured by Frontstore</span>
                </div>
              </section>

              {announcement}

              <SectionHead title="Latest listings" action="See all" onAction={() => go("portfolio")} />
              {listingCards(homeListings.slice(0, 4))}
              <button className="ps-seeall" onClick={() => go("portfolio")}>See all {homeListings.length} listings <ChevronRight size={16} /></button>

              <div className="ps-searchbar" onClick={() => setSearch(true)}><Search size={17} /> <span>Search services and guides</span></div>
              <div className="ps-chips">{CATS.map((c: any) => <button key={c} onClick={() => setSearch(true)}>{c}</button>)}</div>

              <SectionHead title="Services" action={`See all ${SERVICES.length}`} onAction={() => go("services")} />
              {servicesGrid("ps-grid", homeServices.slice(0, 4))}
              {(store.storefront_sections || []).includes("services") && (
          <button className="ps-seeall" onClick={() => go("services")}>See all {SERVICES.length} services <ChevronRight size={16} /></button>
        )}

              <SectionHead title="Guides" action={`See all ${PRODUCTS.length}`} onAction={() => go("products")} />
              {productsGrid("ps-grid", homeProducts.slice(0, 4))}
              {(store.storefront_sections || []).includes("products") && (
          <button className="ps-seeall" onClick={() => go("products")}>See all {PRODUCTS.length} guides <ChevronRight size={16} /></button>
        )}

              <SectionHead title="Reviews" />
              <RatingSummary rating={DUMMY_STORE.rating} reviews={DUMMY_STORE.reviews} />
              <div className="ps-reviews-row">{displayReviews.slice(0, 3).map((rv: any, i: number) => <ReviewCard key={i} rv={rv} />)}</div>
              {(store.storefront_sections || []).includes("reviews") && (
          <button className="ps-seeall" onClick={() => go("reviews")}>See all reviews <ChevronRight size={16} /></button>
        )}

              <SectionHead title="Visit the office" />
              <div className="ps-visit">
                <div className="ps-map"><MapPin size={26} /><span>Map preview</span></div>
                <div className="ps-visit-info">
                  <p className="ps-addr"><MapPin size={15} /> {DUMMY_STORE.address}</p>
                  {DUMMY_STORE.address && <button className="ps-dir" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DUMMY_STORE.address)}`, '_blank')}><Navigation size={15} /> Directions</button>}
                  <ul className="ps-hours">{HOURS.map(([d, h]: any, i: number) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                </div>
              </div>

              <SectionHead title="Good to know" />
              <Accordion items={FAQS_PREVIEW} open={openFaq} setOpen={setOpenFaq} />
              <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
            </>)}

            {page === "services" && <Sub title="Services" slug={DUMMY_STORE.slug}>{servicesGrid("ps-grid", SERVICES)}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "products" && <Sub title="Products" slug={DUMMY_STORE.slug}>{productsGrid("ps-grid", PRODUCTS)}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "portfolio" && <Sub title="Listings" slug={DUMMY_STORE.slug}>{portfolioBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "post" && articleView()}
            {page === "listing" && listingView()}
            {page === "reviews" && <Sub title="Reviews" slug={DUMMY_STORE.slug}>{reviewsBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "blog" && <Sub title="Blog" slug={DUMMY_STORE.slug}>{blogBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "about" && <Sub title="About" slug={DUMMY_STORE.slug}>{aboutBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "faq" && <Sub title="FAQ" slug={DUMMY_STORE.slug}>{faqBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "contact" && <Sub title="Contact" slug={DUMMY_STORE.slug}>{contactBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "returns" && <Sub title="Refunds" slug={DUMMY_STORE.slug}>{returnsBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "terms" && <Sub title="Terms" slug={DUMMY_STORE.slug}>{termsBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
            {page === "privacy" && <Sub title="Privacy" slug={DUMMY_STORE.slug}>{privacyBody()}<StoreFoot onNav={go}  slug={DUMMY_STORE.slug} /></Sub>}
          </main>
        </div>
      )}

      {/* ============ DESKTOP ============ */}
      {isDesktop && (
        <div className="pd-wrap">
          <header className="pd-header">
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></button>
            <button className="pd-search" onClick={() => setSearch(true)}><Search size={17} /> <span>Search {DUMMY_STORE.name}</span></button>
            <div className="pd-header-actions">
              <button className="pd-hicon" onClick={() => setShare(true)} aria-label="Share"><Share2 size={18} /></button>
              <button className="pd-hicon" onClick={() => setBag(true)} aria-label="Bag">
                <ShoppingBag size={18} />{bagCount > 0 && <i>{bagCount}</i>}
              </button>
              <button className="pd-head-book" onClick={primaryCta.run}><primaryCta.Icon size={16} /> {primaryCta.label}</button>
            </div>
          </header>

          <div className="pd-container">
            <section className="pd-cover">
              <div className="pd-cover-art"><StoreIcon className="pd-cover-icn" strokeWidth={1.05} /></div>
              <div className="pd-identity">
                <span className="pd-avatar">{DUMMY_STORE.initial}</span>
                <div className="pd-identity-main">
                  <h1>{DUMMY_STORE.name} {store.is_verified ? <BadgeCheck size={22} className="ps-verif" /> : null}</h1>
                  <p>
                    <span>{DUMMY_STORE.category}</span><span className="ps-dot">•</span>
                    <span><MapPin size={13} /> {DUMMY_STORE.location}</span><span className="ps-dot">•</span>
                    {DUMMY_STORE.rating ? <><span><Star size={13} className="ps-star" /> {DUMMY_STORE.rating} ({DUMMY_STORE.reviews})</span><span className="ps-dot">•</span></> : null}
                    <span>Replies {DUMMY_STORE.reply}</span>
                  </p>
                </div>
                <div className="pd-identity-actions">
                  <button className="pd-book" onClick={primaryCta.run}><primaryCta.Icon size={16} /> {primaryCta.label}</button>
                  {DUMMY_STORE.primaryCta !== "message" && <button className="pd-ghost" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={16} /> Message</button>}
                  <button className="pd-ghost" onClick={() => setNotifyOpen(true)}><Bell size={16} /> Get notified</button>
                </div>
              </div>
            </section>

            <nav className="pd-tabs">
              {NAV.map(([id, label]: any) => (
                <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
              ))}
            </nav>

            {page === "home" && (<>
              {announcement}
              <div className="pd-home">
                <aside className="pd-rail">
                  <div className="pd-railcard">
                    <h3>About</h3>
                    <p>{DUMMY_STORE.bio}</p>
                    <button className="pd-raillink" onClick={() => go("about")}>More about us <ChevronRight size={14} /></button>
                  </div>
                  <div className="pd-railcard">
                    <h3>Visit us</h3>
                    <div className="pd-railmap"><MapPin size={22} /></div>
                    <p className="ps-addr"><MapPin size={14} /> {DUMMY_STORE.address}</p>
                    <div className="pd-railbtns">
                      {DUMMY_STORE.address && <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DUMMY_STORE.address)}`, '_blank')}><Navigation size={14} /> Directions</button>}
                      <button onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={14} /> Message</button>
                    </div>
                    <ul className="ps-hours">{HOURS.map(([d, h]: any, i: number) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                  </div>
                  <div className="pd-railcard trust">
                    <span className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</span>
                    <p>Buyer protection and platform terms apply to every order on this store and cannot be removed by the vendor.</p>
                  </div>
                </aside>

                <div className="pd-feed">
                  <div className="pd-sec-head"><h2>Latest listings</h2><button onClick={() => go("portfolio")}>See all {homeListings.length}</button></div>
                  {listingCards(homeListings.slice(0, 6))}
                  <div className="pd-sec-head"><h2>Services</h2>{(store.storefront_sections || []).includes("services") && (
          <button onClick={() => go("services")}>See all {SERVICES.length}</button>
        )}</div>
                  {servicesGrid("pd-grid", homeServices.slice(0, 6))}
                  <div className="pd-sec-head"><h2>Guides</h2>{(store.storefront_sections || []).includes("products") && (
          <button onClick={() => go("products")}>See all {PRODUCTS.length}</button>
        )}</div>
                  {productsGrid("pd-grid", homeProducts.slice(0, 6))}
                  <div className="pd-sec-head"><h2>Reviews</h2>{(store.storefront_sections || []).includes("reviews") && (
          <button onClick={() => go("reviews")}>See all</button>
        )}</div>
                  <RatingSummary rating={DUMMY_STORE.rating} reviews={DUMMY_STORE.reviews} />
                  <div className="pd-grid reviews">{displayReviews.slice(0, 3).map((rv: any, i: number) => <ReviewCard key={i} rv={rv} full />)}</div>
                </div>
              </div>
              <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
            </>)}

            {(page === "services" || page === "products" || page === "reviews" || page === "blog") && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>{NAV.find(([id]: any) => id === page)?.[1]}</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                {page === "services" && (
                  <div className="svc-page">
                    <p className="svc-intro">Book a viewing of any listing, or a valuation or consultation. A fee secures your slot and is credited back where you go on to transact.</p>

                    <div className="pd-sec-head"><h2>Most booked</h2></div>
                    <div className="svc-feat-grid">
                      {SERVICES.filter((s) => s.popular).slice(0, 3).map((s: any) => (
                        <ServiceCardRich key={s.id} s={s} colour={catColor(s.cat)} badge="Most booked" onBook={() => openBooking(s)} />
                      ))}
                    </div>

                    <div className="svc-body">
                      <aside className="svc-rail">
                        <div className="svc-search">
                          <Search size={16} />
                          <input value={svcQuery} onChange={(e) => setSvcQuery(e.target.value)} placeholder="Search services" />
                          {svcQuery && <button onClick={() => setSvcQuery("")} aria-label="Clear"><X size={15} /></button>}
                        </div>
                        <div className="svc-filters">
                          <div className="svc-fgroup">
                            <h4>Category</h4>
                            <div className="svc-radios">
                              <button className={svcCat === "All" ? "on" : ""} onClick={() => setSvcCat("All")}>All services</button>
                              {svcCats.map((c: any) => <button key={c} className={svcCat === c ? "on" : ""} onClick={() => setSvcCat(c)}>{c}</button>)}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Duration</h4>
                            <div className="svc-radios">
                              {[["All", "Any length"], ["short", "Under 1 hour"], ["mid", "1 to 2 hours"], ["long", "Over 2 hours"]].map(([v, l]: any) => (
                                <button key={v} className={svcDur === v ? "on" : ""} onClick={() => setSvcDur(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Sort by</h4>
                            <div className="svc-radios">
                              {[["popular", "Most booked"], ["priceAsc", "Price: low to high"], ["priceDesc", "Price: high to low"]].map(([v, l]: any) => (
                                <button key={v} className={svcSort === v ? "on" : ""} onClick={() => setSvcSort(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="svc-book-card">
                          <span className="svc-open"><span className="ps-pulse" /> Open now</span>
                          <p className="svc-next">Next availability <b>Today, 3:00pm</b></p>
                          <button className="svc-book-cta" onClick={() => openBooking()}><Calendar size={16} /> Book a slot</button>
                          <button className="svc-msg" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={15} /> Message on WhatsApp</button>
                        </div>
                      </aside>

                      <div className="svc-main">
                        <div className="svc-results-head">
                          <b>{svcFiltered.length} {svcFiltered.length === 1 ? "service" : "services"}</b>
                          {svcHasFilters && <button className="svc-clear" onClick={clearSvc}>Clear filters</button>}
                        </div>
                        {svcFiltered.length > 0 ? (
                          <div className="svc-grid">
                            {svcFiltered.map((s: any) => <ServiceCardRich key={s.id} s={s} colour={catColor(s.cat)} onBook={() => openBooking(s)} />)}
                          </div>
                        ) : (
                          <div className="svc-empty">No services match your filters.<button onClick={clearSvc}>Clear filters</button></div>
                        )}
                      </div>
                    </div>

                    <div className="pd-sec-head"><h2>Booking questions</h2></div>
                    <Accordion items={MOCK_SERVICE_FAQS} open={svcFaq} setOpen={setSvcFaq} />
                  </div>
                )}
                {page === "products" && (
                  <div className="svc-page">
                    <p className="svc-intro">Practical guides on buying, renting and investing in Lagos property. Each one is a digital download, sent on WhatsApp the moment you pay.</p>

                    <div className="pd-sec-head"><h2>Best sellers</h2></div>
                    <div className="svc-feat-grid">
                      {PRODUCTS.filter((p) => p.popular).slice(0, 3).map((p: any) => (
                        <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} badge="Best seller" onView={() => router.push(storePath(username, `/products/${p.slug}`))} onBuy={() => addBag(p.name)} />
                      ))}
                    </div>

                    <div className="svc-body">
                      <aside className="svc-rail">
                        <div className="svc-search">
                          <Search size={16} />
                          <input value={prodQuery} onChange={(e) => setProdQuery(e.target.value)} placeholder="Search products" />
                          {prodQuery && <button onClick={() => setProdQuery("")} aria-label="Clear"><X size={15} /></button>}
                        </div>
                        <div className="svc-filters">
                          <div className="svc-fgroup">
                            <h4>Category</h4>
                            <div className="svc-radios">
                              <button className={prodCat === "All" ? "on" : ""} onClick={() => setProdCat("All")}>All products</button>
                              {prodCats.map((c: any) => <button key={c} className={prodCat === c ? "on" : ""} onClick={() => setProdCat(c)}>{c}</button>)}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Price</h4>
                            <div className="svc-radios">
                              {[["All", "Any price"], ["lo", "Under ₦10,000"], ["mid", "₦10,000 to ₦15,000"], ["hi", "Over ₦15,000"]].map(([v, l]: any) => (
                                <button key={v} className={prodPrice === v ? "on" : ""} onClick={() => setProdPrice(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Sort by</h4>
                            <div className="svc-radios">
                              {[["popular", "Best selling"], ["priceAsc", "Price: low to high"], ["priceDesc", "Price: high to low"]].map(([v, l]: any) => (
                                <button key={v} className={prodSort === v ? "on" : ""} onClick={() => setProdSort(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="svc-book-card">
                          <span className="svc-trust"><ShieldCheck size={15} /> Secured by Frontstore</span>
                          <ul className="svc-deliv">
                            <li><Check size={14} /> Instant download the moment you pay</li>
                            <li><Mail size={14} /> Sent to your WhatsApp and email</li>
                          </ul>
                          <button className="svc-book-cta" onClick={() => setBag(true)}><ShoppingBag size={16} /> View bag{bagCount > 0 ? ` (${bagCount})` : ""}</button>
                          <button className="svc-msg" onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={15} /> Ask about a guide</button>
                        </div>
                      </aside>

                      <div className="svc-main">
                        <div className="svc-results-head">
                          <b>{prodFiltered.length} {prodFiltered.length === 1 ? "guide" : "guides"}</b>
                          {prodHasFilters && <button className="svc-clear" onClick={clearProd}>Clear filters</button>}
                        </div>
                        {prodFiltered.length > 0 ? (
                          <div className="svc-grid">
                            {prodFiltered.map((p: any) => <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} onView={() => router.push(storePath(username, `/products/${p.slug}`))} onBuy={() => addBag(p.name)} />)}
                          </div>
                        ) : (
                          <div className="svc-empty">No guides match your filters.<button onClick={clearProd}>Clear filters</button></div>
                        )}
                      </div>
                    </div>

                    <div className="pd-sec-head"><h2>Download and refunds</h2></div>
                    <Accordion items={MOCK_PRODUCT_FAQS} open={prodFaq} setOpen={setProdFaq} />
                  </div>
                )}
                {page === "reviews" && (
                  <div className="svc-page">
                    <p className="svc-intro">Every review here comes from a verified order on Frontstore. The agent can respond, but cannot remove genuine reviews.</p>
                    <div className="svc-body">
                      <aside className="svc-rail">
                        {DUMMY_STORE.rating ? (
                        <div className="rev-summary">
                          <div className="rev-score">
                            <b>{DUMMY_STORE.rating}</b>
                            <div className="rev-score-stars">{Array.from({ length: 5 }).map((_: any, i: number) => <Star key={i} size={14} className="f" />)}</div>
                            <span>Excellent</span><i>{DUMMY_STORE.reviews} verified reviews</i>
                          </div>
                          <div className="rev-bars">
                            {REV_DIST.map(([n, w]: any) => (
                              <button key={n} className={`rev-bar ${revStar === n ? "on" : ""}`} onClick={() => setRevStar(revStar === n ? 0 : n)}>
                                <span>{n}</span><Star size={11} className="f" /><div className="rev-bar-track"><i style={{ width: w + "%" }} /></div>
                              </button>
                            ))}
                          </div>
                        </div>
                        ) : null}
                        <div className="svc-filters">
                          <div className="svc-fgroup">
                            <h4>Sort by</h4>
                            <div className="svc-radios">
                              {[["recent", "Most recent"], ["high", "Highest rated"], ["low", "Lowest rated"]].map(([v, l]: any) => (
                                <button key={v} className={revSort === v ? "on" : ""} onClick={() => setRevSort(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                          <div className="svc-fgroup">
                            <h4>Show</h4>
                            <div className="svc-radios">
                              <button className={revPhotos ? "on" : ""} onClick={() => setRevPhotos(!revPhotos)}>With photos only</button>
                            </div>
                          </div>
                        </div>
                        <button className="rev-leave" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
                        <div className="rev-trust"><ShieldCheck size={14} /> Reviews are from verified orders. The agent typically responds in {DUMMY_STORE.reply}.</div>
                      </aside>

                      <div className="svc-main">
                        {revPhotoTiles.length > 0 && (
                          <div className="rev-photostrip">
                            <h4>Customer photos</h4>
                            <div className="rev-photos">{revPhotoTiles.map((k: any, i: number) => <button key={k} className={`rev-ph c${i % 3}`} onClick={() => ping("Opening photo")} aria-label="Photo" />)}</div>
                          </div>
                        )}
                        <div className="svc-results-head">
                          <b>{revFiltered.length} {revFiltered.length === 1 ? "review" : "reviews"}</b>
                          {(revStar !== 0 || revPhotos) && <button className="svc-clear" onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button>}
                        </div>
                        {revFiltered.length > 0 ? (
                          <div className="rev-list">{revFiltered.map((rv: any) => <ReviewCardRich storeInitial={DUMMY_STORE.initial} key={rv.id} rv={rv} />)}</div>
                        ) : (
                          <div className="svc-empty">No reviews match your filters.<button onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {page === "blog" && (
                  <div className="blogp">
                    <p className="svc-intro">Notes on buying, renting and investing in Lagos property, from {DUMMY_AUTHOR.name} at {DUMMY_STORE.name}.</p>
                    <div className="blog-topics">
                      {["All", ...blogCats].map((c: any) => (
                        <button key={c} className={blogCat === c ? "on" : ""} onClick={() => setBlogCat(c)}>{c}</button>
                      ))}
                    </div>
                    <div className="blogp-body">
                      <div className="blogp-main">
                        {blogList[0] && (
                          <article className="blog-hero" onClick={() => openPost(blogList[0])}>
                            <div className={`blog-hero-img c${displayBlog.indexOf(blogList[0]) % 3}`}><span className="blog-cat">{blogList[0].cat}</span></div>
                            <div className="blog-hero-body">
                              <span className="blog-kicker">{blogCat === "All" ? "Latest" : blogCat}</span>
                              <h3>{blogList[0].title}</h3>
                              <p>{blogList[0].excerpt}</p>
                              <div className="blog-meta">
                                <span className="blog-author"><span className="blog-author-av">{DUMMY_AUTHOR.initial}</span> {DUMMY_AUTHOR.name}</span>
                                <span className="ps-dot">•</span>{blogList[0].date}<span className="ps-dot">•</span>{blogList[0].read} read
                              </div>
                              <span className="blog-read">Read article <ChevronRight size={15} /></span>
                            </div>
                          </article>
                        )}
                        {blogList.slice(1).length > 0 && (
                          <div className="blog-grid">
                            {blogList.slice(1).map((b: any) => (
                              <BlogCard authorName={DUMMY_AUTHOR.name} key={b.title} b={b} colour={`c${displayBlog.indexOf(b) % 3}`} onOpen={() => openPost(b)} />
                            ))}
                          </div>
                        )}
                      </div>
                      <aside className="blogp-rail">
                        <div className="author-card">
                          <div className="author-top">
                            <span className="author-av">{DUMMY_AUTHOR.initial}</span>
                            <div><b>{DUMMY_AUTHOR.name}</b><span>{DUMMY_AUTHOR.role}</span></div>
                          </div>
                          <p>{DUMMY_AUTHOR.bio}</p>
                          <div className="author-cred"><Sparkles size={13} /> Over twelve years in Lagos property</div>
                          <button className="author-link" onClick={() => go("about")}>More about {DUMMY_AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
                        </div>
                        <div className="blog-convert">
                          <b>Enjoyed the read?</b>
                          <p>Book a viewing, or pick up one of the guides.</p>
                          <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a viewing</button>
                          {(store.storefront_sections || []).includes("products") && (
          <button className="blog-convert-ghost" onClick={() => go("products")}>View guides</button>
        )}
                        </div>
                      </aside>
                    </div>
                  </div>
                )}
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "post" && articleView()}
            {page === "listing" && listingView()}

            {page === "portfolio" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Listings</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <p className="svc-intro">A look at current and recent listings across Lekki and Ikoyi. Tap any listing to book a viewing.</p>
                {pfFilters()}
                {portfolioChips()}
                <div className="pf-wrap">
                  <div className="pf-main">{portfolioGrid()}</div>
                  <aside className="pf-rail">
                    <div className="blog-convert">
                      <b>Like what you see?</b>
                      <p>Book a viewing of any property that catches your eye.</p>
                      <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a viewing</button>
                      {(store.storefront_sections || []).includes("services") && (
          <button className="blog-convert-ghost" onClick={() => go("services")}>Browse services</button>
        )}
                    </div>
                    {portfolioFollow()}
                    <div className="pd-railcard trust">
                      <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                      <p>Bookings and orders placed through Frontstore are covered by buyer protection the agent cannot remove.</p>
                    </div>
                  </aside>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "about" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>About</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <div className="ab-wrap">
                  <div className="ab-main">
                    <span className="ab-kicker">Our story</span>
                    <h2 className="ab-headline">An agent who would rather you bought the right place than any place.</h2>
                    {DUMMY_STORE.bio && <p className="ab-lede">{DUMMY_STORE.bio}</p>}

                    <div className="ab-founder">
                      <div className="ab-portrait"><span className="ab-portrait-mono">{DUMMY_AUTHOR.initial}</span><span className="ab-portrait-tag">Agent</span></div>
                      <div className="ab-founder-body">{aboutFounderBody()}</div>
                    </div>
                    {aboutWork()}
                    {aboutFeatured()}

                    <div className="ab-section">
                      <h4 className="ab-subhead">What we offer</h4>
                      <div className="ab-offer-grid">
                        {MOCK_OFFERINGS.map(([t, d, pg]: any) => (
                          <button key={t} className="ab-offer-card" onClick={() => go(pg)}>
                            <b>{t}</b>
                            <p>{d}</p>
                            <span className="ab-offer-link">{pg === "products" ? "View guides" : "View services"} <ChevronRight size={14} /></span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ab-approach">
                      <h4>How we work</h4>
                      <div className="ab-approach-grid">
                        <div><span className="ab-num">01</span><b>Honest shortlist first</b><p>We start with your budget, your area and how you live, then I bring only properties actually worth your time.</p></div>
                        <div><span className="ab-num">02</span><b>Checked before you commit</b><p>I view each property in person and help verify title and paperwork, so the surprises turn up before you pay, not after.</p></div>
                        <div><span className="ab-num">03</span><b>Right, not rushed</b><p>I would rather lose a quick commission than put you in a place you regret. The aim is a deal that still feels good a year later.</p></div>
                      </div>
                    </div>

                    {aboutReview()}
                    {aboutJournal()}
                    <div className="ab-section">
                      <h4 className="ab-subhead">Good to know</h4>
                      <div className="ab-facts">
                        {ABOUT_FACTS.map(([k, v]: any) => (
                          <div className="ab-fact" key={k}><span className="ab-fact-k">{k}</span><span className="ab-fact-v">{v}</span></div>
                        ))}
                      </div>
                    </div>

                    <div className="ps-about-grid ab-stats">
                      {DUMMY_STORE.orders ? <div><b>{DUMMY_STORE.orders}</b><span>deals closed</span></div> : null}
                      {DUMMY_STORE.rating ? <div><b>{DUMMY_STORE.rating}</b><span>average rating</span></div> : null}
                      {store.since && <div><b>{new Date().getFullYear() - parseInt(store.since)} yrs</b><span>in practice</span></div>}
                    </div>
                  </div>

                  <aside className="ab-rail">
                    <div className="pd-railcard">
                      <div className="ab-rail-h"><MapPin size={15} /> Visit the office</div>
                      <div className="pd-railmap">Map preview</div>
                      <p className="ab-addr">{DUMMY_STORE.address}</p>
                      <div className="ab-open"><Clock size={13} /> Today · {HOURS[todayIdx][1]}</div>
                      <div className="pd-railbtns">
                        {DUMMY_STORE.address && <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DUMMY_STORE.address)}`, '_blank')}><Navigation size={14} /> Directions</button>}
                        <button onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsApp size={14} /> Message</button>
                      </div>
                      <div className="ab-follow-rail">
                        <span>Follow the agent</span>
                        <div className="ab-follow-icons">
                          {DUMMY_STORE.socials?.instagram && <button onClick={() => window.open(`https://instagram.com/${DUMMY_STORE.socials.instagram.replace(/^@/, '')}`, '_blank')} aria-label="Instagram"><Instagram size={17} /></button>}
                          {DUMMY_STORE.socials?.tiktok && <button onClick={() => window.open(`https://tiktok.com/@${DUMMY_STORE.socials.tiktok.replace(/^@/, '')}`, '_blank')} aria-label="TikTok"><Tiktok size={17} /></button>}
                          <button onClick={() => handleWa("Hello! I'm interested in your services.")} aria-label="WhatsApp"><WhatsApp size={17} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="blog-convert">
                      <b>Ready when you are</b>
                      <p>Book a viewing, or browse the full list of services.</p>
                      <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a viewing</button>
                      {(store.storefront_sections || []).includes("services") && (
          <button className="blog-convert-ghost" onClick={() => go("services")}>Browse services</button>
        )}
                    </div>

                    <div className="pd-railcard trust">
                      <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                      <p>Bookings and orders placed through Frontstore are covered by buyer protection that the agent cannot remove.</p>
                    </div>
                  </aside>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "faq" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>FAQ</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <p className="svc-intro">Answers to the questions we are asked most. If you cannot find yours, the agent is a message away.</p>
                <div className="faq-wrap">
                  <aside className="faq-rail">
                    <div className="faq-search">
                      <Search size={15} />
                      <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions" />
                    </div>
                    <nav className="faq-cats">
                      {FAQ_GROUPS.map((g: any) => (
                        <button key={g.cat} onClick={() => { const el = document.getElementById(faqId(g.cat)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                          <g.icon size={15} /> {g.cat}
                        </button>
                      ))}
                    </nav>
                    {faqHelp()}
                    <div className="pd-railcard trust">
                      <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                      <p>Payments and orders through Frontstore are covered by buyer protection the agent cannot remove.</p>
                    </div>
                  </aside>
                  <div className="faq-main">{faqSections()}</div>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "contact" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Contact</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <div className="ct-wrap">
                  <div className="ct-main">
                    <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email. A real person from the team will answer.</p>
                    {contactChannels()}
                    {contactForm()}
                  </div>
                  <aside className="ct-rail">
                    {contactVisit()}
                    <div className="blog-convert">
                      <b>Prefer to book?</b>
                      <p>Skip the message and book a viewing in a couple of taps.</p>
                      <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a viewing</button>
                      {(store.storefront_sections || []).includes("services") && (
          <button className="blog-convert-ghost" onClick={() => go("services")}>Browse services</button>
        )}
                    </div>
                    <div className="pd-railcard trust">
                      <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                      <p>Payments and orders through Frontstore are covered by buyer protection the agent cannot remove.</p>
                    </div>
                  </aside>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "returns" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Refunds</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <div className="rf-wrap">
                  <div className="rf-main">
                    <p className="svc-intro">Plans change, and sometimes things go wrong. Here is exactly how cancellations, returns and refunds work on this store.</p>
                    {refundsSections()}
                    <LockedFrontstorePanel title="Frontstore buyer protection" body="Orders paid through Frontstore are protected. If an order does not arrive as described, you can raise a dispute and we will help mediate a resolution. This protection cannot be removed by the vendor." />
                  </div>
                  <aside className="rf-rail">
                    {refundsKeyPoints()}
                    {refundsAction()}
                    {refundsRelated()}
                  </aside>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "privacy" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Privacy</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <div className="tm-wrap">
                  <div className="tm-main">
                    <p className="tm-intro">This notice explains what {DUMMY_STORE.name} does with your information when you book, buy or get in touch.</p>
                    {policySections(PRIVACY)}
                  </div>
                  <aside className="tm-rail">
                    <div className="tm-contents">
                      <span className="tm-contents-h">On this page</span>
                      <nav>
                        {PRIVACY.map((s: any) => (
                          <button key={s.t} onClick={() => { const el = document.getElementById(termId(s.t)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{s.t}</button>
                        ))}
                      </nav>
                    </div>
                    <div className="tm-meta">Last updated 1 June 2026</div>
                    {policyRelated([["Terms", "terms"], ["Refunds", "returns"]])}
                  </aside>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}

            {page === "terms" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Terms</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                <div className="tm-wrap">
                  <div className="tm-main">
                    <p className="tm-intro">By booking or buying from {DUMMY_STORE.name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
                    {policySections(TERMS)}
                  </div>
                  <aside className="tm-rail">
                    <div className="tm-contents">
                      <span className="tm-contents-h">On this page</span>
                      <nav>
                        {TERMS.map((s: any) => (
                          <button key={s.t} onClick={() => { const el = document.getElementById(termId(s.t)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{s.t}</button>
                        ))}
                      </nav>
                    </div>
                    <div className="tm-meta">Last updated 1 June 2026</div>
                    {policyRelated([["Refunds", "returns"], ["FAQ", "faq"]])}
                  </aside>
                </div>
                <StoreFoot onNav={go}  slug={DUMMY_STORE.slug} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* drawer (mobile only) */}
      {!isDesktop && drawer && (
        <div className="ps-drawer-back" onClick={() => setDrawer(false)}>
          <div className="ps-drawer" onClick={(e) => e.stopPropagation()}><Panel onClose={() => setDrawer(false)} /></div>
        </div>
      )}

      {/* bottom nav (mobile only) */}
      {!isDesktop && (
        <nav className="ps-bottom">
          <button className={page === "home" ? "on" : ""} onClick={() => go("home")}><StoreIcon size={21} /><span>Home</span></button>
          <button className={page === "portfolio" ? "on" : ""} onClick={() => go("portfolio")}><Building2 size={21} /><span>Listings</span></button>
          <button className="ps-fab" onClick={() => setBag(true)} aria-label="Cart"><span className="ps-fab-ring" /><ShoppingBag size={22} />{bagCount > 0 && <i className="ps-fab-badge">{bagCount}</i>}</button>
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
            <div className="ps-search-top"><Search size={18} /><input autoFocus placeholder={`Search ${DUMMY_STORE.name}`} /><button onClick={() => setSearch(false)}><X size={20} /></button></div>
            <p className="ps-search-lbl">Popular</p>
            <div className="ps-chips">{["Property Valuation", "Buyer Consultation", "Area Report", "First-Time Buyer", "Off-Plan"].map((c: any) => (<button key={c} onClick={() => { setSearch(false); ping("Searching " + c); }}>{c}</button>))}</div>
          </div>
        </div>
      )}

      {/* all-filters sheet (shared) */}
      {pfAll && (
        <Sheet title="Filters" onClose={() => setPfAll(false)}>
          <div className="pf-fsheet">
            <div className="pf-fgroup"><span>Type</span><div className="pf-fopts">{["All", ...pfCats].map((c: any) => <button key={c} className={pfCat === c ? "on" : ""} onClick={() => setPfCat(c)}>{c}</button>)}</div></div>
            <div className="pf-fgroup"><span>Location</span><div className="pf-fopts">{["All", ...pfAreas].map((a: any) => <button key={a} className={pfArea === a ? "on" : ""} onClick={() => setPfArea(a)}>{a === "All" ? "All" : a}</button>)}</div></div>
            <div className="pf-fgroup"><span>Bedrooms</span><div className="pf-fopts">{[0, 1, 2, 3, 4].map((n: any) => <button key={n} className={pfBeds === n ? "on" : ""} onClick={() => setPfBeds(n)}>{n === 0 ? "Any" : n + "+"}</button>)}</div></div>
            <div className="pf-fgroup"><span>Price</span><div className="pf-fopts">{[["", "Any"], ["asc", "Low to high"], ["desc", "High to low"]].map(([v, l]: any) => <button key={v} className={pfSort === v ? "on" : ""} onClick={() => setPfSort(v)}>{l}</button>)}</div></div>
            <button className="pf-fapply" onClick={() => setPfAll(false)}>Show {pfList.length} listings</button>
          </div>
        </Sheet>
      )}

      {/* booking flow (shared) */}
      {bookOpen && bookingFlow()}

      {/* bag sheet (shared) */}
      {bag && orderForm()}

      {/* share sheet (shared) */}
      {share && (
        <Sheet onClose={() => setShare(false)} title="Share this store">
          <div className="ps-share-url"><span>frontstore.ng/{username}</span><button onClick={() => { navigator.clipboard?.writeText(`frontstore.ng/${DUMMY_STORE.slug}`); ping("Link copied"); }}><Copy size={15} /></button></div>
          <button className="ps-share-wa" onClick={() => { setShare(false); ping("Sharing to WhatsApp"); }}><WhatsApp size={18} /> Share on WhatsApp</button>
          <div className="ps-share-row"><button onClick={() => ping("Instagram")}><Instagram size={18} /> Instagram</button><button onClick={() => ping("Facebook")}><Facebook size={18} /> Facebook</button></div>
        </Sheet>
      )}

      {/* notify opt-in (shared) */}
      {notifyOpen && (
        <Sheet onClose={() => setNotifyOpen(false)} title={`Get updates from ${DUMMY_STORE.name}`}>
          <p className="ps-sheet-sub"><Bell size={13} /> Be first to hear about new services, products, drops and announcements.</p>
          <p className="ps-field-lbl">Your WhatsApp number</p>
          <input className="bk-input" value={notifyPhone} onChange={(e) => setNotifyPhone(e.target.value)} placeholder="e.g. 0801 234 5678" inputMode="tel" />
          <p className="ps-field-lbl">What should we send you?</p>
          <div className="nt-topics">
            {MOCK_NOTIFY_TOPICS.map(([id, label]: any) => {
              const on = notifyTopics.includes(id);
              return <button key={id} className={`nt-topic ${on ? "on" : ""}`} onClick={() => setNotifyTopics(on ? notifyTopics.filter((t) => t !== id) : [...notifyTopics, id])}>{on && <Check size={13} />}{label}</button>;
            })}
          </div>
          <p className="ps-deposit">Updates are sent through Frontstore. No spam, opt out any time, and your number is never shared with other stores.</p>
          <button className="ps-sheet-cta" disabled={!notifyPhone.trim() || notifyTopics.length === 0} onClick={() => { setNotifyOpen(false); ping(`You will get updates from ${DUMMY_STORE.name}`); }}><Bell size={16} /> Notify me</button>
        </Sheet>
      )}

      {reviewOpen && (
        <Sheet onClose={() => setReviewOpen(false)} title="Leave a review">
          <p className="rev-form-note"><ShieldCheck size={13} /> {store.reviews_intro_text || "Reviews come from verified orders. Add your order reference so we can confirm it."}</p>
          <p className="ps-field-lbl">Your rating</p>
          <div className="rev-rate">{Array.from({ length: 5 }).map((_: any, i: number) => (
            <button key={i} onClick={() => setRevRating(i + 1)} aria-label={(i + 1) + " star"}><Star size={28} className={i < revRating ? "f" : ""} /></button>
          ))}</div>
          <p className="ps-field-lbl">Order reference</p>
          <input className="rev-input" value={revRef} onChange={(e) => setRevRef(e.target.value)} placeholder="e.g. FS-7Q2K9" />
          <p className="ps-field-lbl">Your review</p>
          <textarea className="rev-textarea" value={revText} onChange={(e) => setRevText(e.target.value)} placeholder="Tell others about your experience" rows={4} />
          <div className="rev-photo-add">
            {!revPhoto ? (
              <button className="rev-photo-btn" onClick={() => setRevPhoto("photo.jpg")}><Plus size={15} /> Add a photo</button>
            ) : (
              <div className="rev-photo-chip"><span />{revPhoto}<button onClick={() => setRevPhoto(null)} aria-label="Remove"><X size={14} /></button></div>
            )}
          </div>
          <button className="ps-sheet-cta" onClick={submitReview}>Submit review</button>
        </Sheet>
      )}

      {toast && <div className="ps-toast">{toast}</div>}
    
      <WhatsAppDisclaimerModal
        open={!!pendingWaUrl}
        storeName={store.store_name} isVerified={!!store.is_verified}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)}
      />
</div>
  );
}

/* ---- shared pure components ---- */
function ListingPhotos({ p, taken, hero }: { p: any, taken: any, hero?: any }) {
  const slides = [0, 1, 2, 3];
  const [idx, setIdx] = useState(0);
  const ref = useRef<any>(null);
  const onScroll = (e: any) => {
    const w = e.currentTarget.clientWidth || 1;
    setIdx(Math.round(e.currentTarget.scrollLeft / w));
  };
  const goTo = (e: any, i: number) => {
    e.stopPropagation();
    setIdx(i);
    if (ref.current) ref.current.scrollTo({ left: ref.current.clientWidth * i, behavior: "smooth" });
  };
  return (
    <div className={`pf-photo${hero ? " pf-photo-hero" : ""} ${p.c}`}>
      <div className="pf-slides" ref={ref} onScroll={onScroll}>
        {slides.map((i: any) => (
          <div key={i} className={`pf-slide s${i % 3}`}><StoreIcon className="pf-photo-icn" size={52} /></div>
        ))}
      </div>
      <span className={`pf-badge ${taken ? "b-taken" : "b-live"}`}>{taken ? "Taken" : p.cat}</span>
      {!taken && p.listed && <span className="pf-fresh"><Clock size={11} /> {p.listed}</span>}
      <div className="pf-dots">
        {slides.map((i: any) => (
          <button key={i} className={i === idx ? "on" : ""} onClick={(e) => goTo(e, i)} aria-label={`Photo ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
function SectionHead({ title, action, onAction }: { title: string, action?: string, onAction?: () => void }) {
  return (<div className="ps-sec-head"><h2>{title}</h2>{action && <button onClick={onAction}>{action}</button>}</div>);
}
function ServiceCard({ s, onBook }: { s: any, onBook: () => void }) {
  return (<div className="ps-card"><div className="ps-card-thumb svc"><Sparkles size={22} /></div>
    <div className="ps-card-body"><b>{s.name}</b><span className="ps-card-sub"><Clock size={12} /> {s.dur}</span>
      <div className="ps-card-foot"><em>{money(s.price)}</em><button className="ps-mini book" onClick={onBook}>Book</button></div></div></div>);
}
function ProductCard({ p, onBuy, onView }: { p: any, onBuy: () => void, onView?: () => void }) {
  return (<div className="ps-card" onClick={onView} style={onView ? { cursor: 'pointer' } : undefined}>
    <div className="ps-card-thumb prod">
      {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={22} />}
    </div>
    <div className="ps-card-body"><b>{p.name}</b>
      <div className="ps-card-foot"><em>{money(p.price)}</em><button className="ps-mini buy" onClick={(e) => { e.stopPropagation(); onBuy(); }}>Buy</button></div></div></div>);
}
function BlogCard({ b, colour, onOpen, authorName }: { b: any, colour: string, onOpen: (b: any) => void, authorName?: string }) {
  return (
    <div className="blog-card" onClick={onOpen}>
      <div className={`blog-img ${colour}`}><span className="blog-cat">{b.cat}</span></div>
      <div className="blog-body">
        <span className="blog-date">By {authorName || MOCK_AUTHOR.name} · {b.read} · {b.date}</span>
        <b>{b.title}</b>
        <p>{b.excerpt}</p>
        <span className="blog-read">Read article <ChevronRight size={14} /></span>
      </div>
    </div>
  );
}

function ServiceCardRich({ s, onBook, colour, badge }: { s: any, onBook: () => void, colour: string, badge?: string }) {
  return (
    <div className="svc-card" onClick={onBook}>
      <div className={`svc-card-thumb ${colour || "c0"}`}>
        <Sparkles size={24} />
        {badge && <span className="svc-badge"><Star size={11} /> {badge}</span>}
        <span className="svc-card-cat">{s.cat}</span>
      </div>
      <div className="svc-card-body">
        <b>{s.name}</b>
        <span className="svc-card-dur"><Clock size={12} /> {s.dur}</span>
        <p className="svc-card-desc">{s.desc}</p>
        <div className="svc-card-foot"><em>{money(s.price)}</em><span className="svc-card-book">Book <ChevronRight size={14} /></span></div>
      </div>
    </div>
  );
}
function ProductCardRich({ p, onView, onBuy, colour, badge }: { p: any, onView: () => void, onBuy?: () => void, colour: string, badge?: string }) {
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
        <div className="svc-card-foot"><em>{money(p.price)}</em>
          <button className="svc-card-book" onClick={(e) => { e.stopPropagation(); onBuy?.(); }}>Buy</button></div>
      </div>
    </div>
  );
}
function FeaturedCard({ f, onAction }: { f: any, onAction: (f: any) => void }) {
  return (
    <div className="feat-card">
      <div className={`feat-thumb ${f.type}`}>
        {f.type === "service" ? <Sparkles size={26} /> : <ShoppingBag size={26} />}
        <span className="feat-rib"><Star size={11} /> Featured</span>
      </div>
      <div className="feat-body">
        <b>{f.name}</b>
        <span className="feat-sub">{f.type === "service" ? <><Clock size={12} /> {f.dur}</> : "Product"}</span>
        <div className="feat-foot"><em>{money(f.price)}</em>
          <button className="feat-cta" onClick={onAction}>{f.type === "service" ? "Book" : "Buy"}</button></div>
      </div>
    </div>
  );
}
function ReviewCardRich({ rv, storeInitial }: { rv: any, storeInitial?: string }) {
  return (
    <div className="rev-card">
      <div className="rev-card-head">
        <span className="rev-av">{rv.name[0]}</span>
        <div className="rev-card-who">
          <b>{rv.name}</b>
          <span>{rv.verified && <span className="rev-verif"><ShieldCheck size={12} /> Verified order</span>}<span className="ps-dot">•</span>{rv.when}</span>
        </div>
        <div className="rev-card-stars">{Array.from({ length: 5 }).map((_: any, i: number) => <Star key={i} size={14} className={i < rv.r ? "f" : ""} />)}</div>
      </div>
      {rv.service && <span className="rev-card-svc">{rv.service}</span>}
      <p className="rev-card-text">{rv.text}</p>
      {rv.photos > 0 && <div className="rev-card-photos">{Array.from({ length: rv.photos }).map((_: any, i: number) => <span key={i} className={`rev-ph c${i % 3}`} />)}</div>}
      {rv.response && (
        <div className="rev-response">
          <div className="rev-response-head"><span className="rev-resp-av">{storeInitial || MOCK_STORE.initial}</span><b>Response from the agent</b><span>{rv.response.when}</span></div>
          <p>{rv.response.text}</p>
        </div>
      )}
    </div>
  );
}
function ReviewCard({ rv, full }: { rv: any, full?: boolean }) {
  return (<div className={`ps-review ${full ? "full" : ""}`}>
    <div className="ps-review-top"><span className="ps-review-av">{rv.name[0]}</span><div><b>{rv.name}</b><span>{rv.when}</span></div></div>
    <div className="ps-review-stars">{Array.from({ length: 5 }).map((_: any, i: number) => <Star key={i} size={13} className={i < rv.r ? "f" : ""} />)}</div>
    <p>{rv.text}</p></div>);
}
function RatingSummary({ rating, reviews }: { rating?: number, reviews?: number } = {}) {
  if (!rating) return null;
  const bars = [["5", 80], ["4", 14], ["3", 3], ["2", 2], ["1", 1]];
  return (<div className="ps-rating">
    <div className="ps-rating-score"><b>{rating}</b>
      <div className="ps-rating-stars">{Array.from({ length: 5 }).map((_: any, i: number) => <Star key={i} size={15} className="f" />)}</div>
      <span>Excellent</span><i>{reviews || 0} reviews</i></div>
    <div className="ps-rating-bars">{bars.map(([n, w]: any) => (<div key={n} className="ps-bar"><span>{n}</span><div><i style={{ width: w + "%" }} /></div></div>))}</div></div>);
}
function Accordion({ items, open, setOpen }: { items: any[], open: boolean | number, setOpen: (open: any) => void }) {
  return (<div className="ps-acc">{items.map(([q, a]: any, i: number) => (
    <div key={i} className={`ps-acc-item ${open === i ? "open" : ""}`}>
      <button onClick={() => setOpen(open === i ? -1 : i)}>{q}<ChevronDown size={17} /></button>
      {open === i && <p>{a}</p>}</div>))}</div>);
}
function LockedFrontstorePanel({ title, body, link }: { title: string, body: string, link?: string }) {
  return (<div className="ps-locked">
    <div className="ps-locked-top"><ShieldCheck size={16} /><b>{title}</b><Lock size={13} className="ps-locked-lock" /></div>
    <p>{body}</p>{link && <button className="ps-locked-link">{link} <ChevronRight size={14} /></button>}</div>);
}
function StoreFoot({ onNav, slug }: { onNav?: (p: string) => void, slug?: string }) {
  return (<footer className="ps-foot">
    <span className="ps-foot-secure"><Lock size={13} /> Secured by Frontstore</span>
    <p>Buyer protection and platform terms apply to every order on this store.</p>
    <div className="ps-foot-links">
      {MOCK_LEGAL.map(([id, label]: any) => (
        <button key={id} onClick={() => onNav && onNav(id)}>{label}</button>
      ))}
      <button onClick={() => window.open('/terms', '_self')}>Platform terms</button>
      <button onClick={() => window.open(`mailto:hello@frontstore.ng?subject=Reporting Store: ${slug || 'store'}`, '_self')}>Report this store</button>
    </div>
    <small>frontstore.ng/{slug || 'store'}</small></footer>);
}
function Sub({ title, children, slug }: { title: string, children: React.ReactNode, slug?: string }) {
  return (<div className="ps-sub"><div className="ps-sub-head"><h1>{title}</h1><span>frontstore.ng/{slug || 'store'}</span></div>{children}</div>);
}
function Sheet({ title, children, onClose, onBack }: { title: string, children: React.ReactNode, onClose: () => void, onBack?: () => void }) {
  return (<div className="ps-overlay" onClick={onClose}>
    <div className="ps-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="ps-sheet-grip" /><div className="ps-sheet-head">{onBack ? <button className="ps-sheet-back" onClick={onBack} aria-label="Back"><ChevronLeft size={20} /></button> : <span className="ps-sheet-back-sp" />}<b>{title}</b><button onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      {children}</div></div>);
}

const css = `
.ps-root{--brand:#1f4e87;--brand-deep:#12305a;--gold:#c79a4b;--bg:#faf4ef;--card:#fff;--ink:#1b2533;
  --muted:#6f7785;--line:#e4e9f0;--ok:#1f9d57;--wa:#25d366;
  font-family:'Hanken Grotesk',system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;}
.ps-root *{box-sizing:border-box;}
.ps-root :where(button){font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;padding:0;}
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

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
.ps-url{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--brand-deep);background:#e8eef6;padding:7px 12px;border-radius:9px;margin-top:11px;}
.ps-id-actions-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:11px;}
.ps-id-actions-row .ps-url{margin-top:0;}
.ps-notify{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#fff;background:var(--brand);padding:8px 13px;border-radius:9px;box-shadow:0 4px 12px rgba(31,78,135,.28);cursor:pointer;}
.nt-topics{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px;}
.nt-topic{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;padding:9px 13px;border-radius:11px;border:1px solid var(--line);background:var(--card);color:#3d4655;cursor:pointer;}
.nt-topic.on{background:#e8eef6;border-color:var(--brand);color:var(--brand-deep);}
.ps-stats{display:flex;gap:10px;margin-top:16px;}
.ps-stats div{flex:1;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:11px;text-align:center;}
.ps-stats b{display:flex;align-items:center;justify-content:center;gap:4px;font-family:'Fraunces';font-weight:700;font-size:17px;}
.ps-stats span{font-size:11px;color:var(--muted);}
.ps-bio{font-size:14px;line-height:1.55;color:#3d4655;margin-top:15px;}
.ps-statusline{display:flex;align-items:center;gap:14px;margin-top:13px;flex-wrap:wrap;}
.ps-open{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ok);}
.ps-pulse{width:8px;height:8px;border-radius:50%;background:var(--ok);animation:pspulse 1.8s infinite;}
@keyframes pspulse{0%{box-shadow:0 0 0 0 rgba(31,157,87,.45);}70%{box-shadow:0 0 0 7px rgba(31,157,87,0);}100%{box-shadow:0 0 0 0 rgba(31,157,87,0);}}
.ps-secure{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);}
.ps-secure svg{color:var(--brand);}

.ps-ann{display:flex;align-items:flex-start;gap:10px;background:#fbf2e3;border:1px solid #ecd9bf;border-radius:14px;padding:12px 13px;margin-bottom:18px;}
.ps-ann svg:first-child{color:var(--gold);flex:0 0 auto;margin-top:1px;}
.ps-ann p{flex:1;font-size:13px;color:#7a5a36;line-height:1.5;}
.ps-ann b{color:var(--brand-deep);margin-right:5px;}
.ps-ann button{flex:0 0 auto;color:#b39064;}

.ps-signature{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:18px;box-shadow:0 8px 22px rgba(18,48,90,.07);}
.ps-sig-tag{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand-deep);background:#e8eef6;padding:4px 9px;border-radius:7px;}
.ps-sig-body{display:flex;align-items:center;gap:12px;margin:12px 0;}
.ps-sig-thumb{width:60px;height:60px;border-radius:14px;flex:0 0 auto;background:linear-gradient(150deg,#dfe6f0,#e7cdb6);color:var(--brand-deep);display:grid;place-items:center;}
.ps-sig-main b{display:block;font-size:15.5px;font-weight:700;}
.ps-sig-main span{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--muted);margin:2px 0;}
.ps-sig-main em{font-family:'Fraunces';font-weight:700;font-size:17px;font-style:normal;color:var(--brand-deep);}
.ps-book-btn,.ps-sheet-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:15px;padding:13px;border-radius:12px;box-shadow:0 6px 16px rgba(31,78,135,.3);}
.ps-book-btn:active,.ps-sheet-cta:active{transform:translateY(2px);}

.ps-searchbar{display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px 14px;color:var(--muted);font-size:14px;cursor:pointer;margin-bottom:11px;}
.ps-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:22px;scrollbar-width:none;}
.ps-chips::-webkit-scrollbar{display:none;}
.ps-chips button{flex:0 0 auto;font-size:13px;font-weight:600;padding:8px 14px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:#3d4655;}

.ps-sec-head{display:flex;align-items:baseline;justify-content:space-between;margin:6px 0 12px;}
.ps-sec-head h2{font-family:'Fraunces';font-weight:600;font-size:19px;letter-spacing:-.01em;}
.ps-sec-head button{font-size:12.5px;font-weight:600;color:var(--brand);}

.ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;}
.ps-card{background:var(--card);border:1px solid var(--line);border-radius:15px;overflow:hidden;display:flex;flex-direction:column;}
.ps-card-thumb{height:108px;display:grid;place-items:center;color:#fff;}
.ps-card-thumb.svc{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.ps-card-thumb.prod{background:linear-gradient(150deg,#caa06f,var(--gold));}
.ps-card-body{padding:11px 12px 12px;display:flex;flex-direction:column;flex:1;}
.ps-card-body b{font-size:14px;font-weight:600;line-height:1.3;}
.ps-card-sub{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);margin-top:3px;}
.ps-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:10px;}
.ps-card-foot em{font-family:'Fraunces';font-weight:700;font-size:15px;font-style:normal;color:var(--brand-deep);}
.ps-mini{font-size:13px;font-weight:700;padding:7px 15px;border-radius:9px;color:#fff;background:var(--brand);box-shadow:0 3px 8px rgba(31,78,135,.28);}
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
.ps-review p{font-size:13px;line-height:1.5;color:#3d4655;}

.ps-visit{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:24px;}
.ps-map{height:150px;background:repeating-linear-gradient(45deg,#ece0d9,#ece0d9 12px,#e6d8d0 12px,#e6d8d0 24px);display:grid;place-items:center;color:var(--brand-deep);gap:4px;}
.ps-map span{font-size:12px;color:var(--muted);}
.ps-map.lg{height:200px;border-radius:16px;margin-bottom:14px;}
.ps-visit-info{padding:15px;}
.ps-addr{display:flex;align-items:flex-start;gap:7px;font-size:13.5px;color:#3d4655;line-height:1.5;}
.ps-addr svg{flex:0 0 auto;margin-top:2px;color:var(--brand);}
.ps-dir{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--brand-deep);border:1px solid var(--line);border-radius:10px;padding:9px 14px;margin-top:12px;}
.ps-hours{list-style:none;margin-top:14px;border-top:1px solid var(--line);}
.ps-hours li{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid var(--line);color:#515b6b;}
.ps-hours li b{font-weight:600;color:var(--ink);}
.ps-hours li.today{color:var(--brand-deep);font-weight:700;}
.ps-hours li.today b{color:var(--brand-deep);}
.ps-hours.wide{max-width:420px;}

.ps-acc{display:flex;flex-direction:column;gap:9px;margin-bottom:24px;}
.ps-acc-item{background:var(--card);border:1px solid var(--line);border-radius:13px;overflow:hidden;}
.ps-acc-item>button{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;font-size:14px;font-weight:600;padding:14px;}
.ps-acc-item>button svg{flex:0 0 auto;color:var(--muted);transition:transform .2s;}
.ps-acc-item.open>button svg{transform:rotate(180deg);}
.ps-acc-item p{padding:0 14px 14px;font-size:13px;line-height:1.55;color:#3d4655;}

.ps-locked{background:#e8eef6;border:1px solid #cbd9ea;border-radius:14px;padding:14px;margin:16px 0 8px;}
.ps-locked-top{display:flex;align-items:center;gap:8px;}
.ps-locked-top b{flex:1;font-size:14px;font-weight:700;color:var(--brand-deep);}
.ps-locked-top svg{color:var(--brand);}
.ps-locked-lock{color:var(--muted)!important;}
.ps-locked p{font-size:12.5px;line-height:1.55;color:#5b6575;margin-top:8px;}
.ps-locked-link{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:10px;}

.ps-sub-head{margin-bottom:18px;}
.ps-sub-head h1{font-family:'Fraunces';font-weight:700;font-size:26px;letter-spacing:-.02em;}
.ps-sub-head span{font-size:12px;color:var(--muted);}
.ps-prose{font-size:14px;line-height:1.65;color:#3d4655;margin-bottom:13px;}
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
.ps-foot-links button{font-size:12px;font-weight:600;color:#5b6575;}
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
.ps-nav button{display:flex;align-items:center;justify-content:space-between;text-align:left;font-size:14.5px;font-weight:500;padding:11px 12px;border-radius:10px;color:#3d4655;}
.ps-nav button.on{background:#e8eef6;color:var(--brand-deep);font-weight:700;}
.ps-panel-actions{display:flex;flex-direction:column;gap:9px;margin-top:auto;}
.ps-act-book{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:13px;border-radius:12px;box-shadow:0 6px 16px rgba(31,78,135,.3);}
.ps-act-row{display:flex;gap:9px;}
.ps-act-row button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:600;padding:11px;border-radius:11px;border:1px solid var(--line);color:var(--brand-deep);}
.ps-panel-foot{border-top:1px solid var(--line);padding-top:13px;}
.ps-panel-foot span{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--brand-deep);}
.ps-panel-foot p{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.5;}

.ps-bottom{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;align-items:center;justify-content:space-around;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);padding:8px 0 calc(8px + env(safe-area-inset-bottom));}
.ps-bottom>button{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;font-weight:600;color:var(--muted);flex:1;}
.ps-bottom>button.on{color:var(--brand);}
.ps-fab{position:relative;}
.ps-fab svg{position:relative;z-index:1;width:54px;height:54px;background:var(--brand);color:#fff;padding:16px;border-radius:50%;box-shadow:0 8px 20px rgba(31,78,135,.4);margin-top:-26px;}
.ps-fab-ring{position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:54px;height:54px;border-radius:50%;border:2px solid var(--brand);opacity:.5;animation:psring 2s infinite;}
.ps-fab-badge{position:absolute;top:-30px;left:50%;transform:translateX(9px);z-index:3;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:var(--gold);color:#283140;font-size:11px;font-weight:800;font-style:normal;display:grid;place-items:center;border:2px solid #fff;}
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
.ps-field-lbl{font-size:12.5px;font-weight:700;color:#515b6b;margin:14px 0 8px;}
.ps-pick{display:flex;gap:9px;flex-wrap:wrap;}
.ps-pick button{font-size:13px;font-weight:600;padding:9px 15px;border-radius:11px;border:1px solid var(--line);background:var(--card);color:#3d4655;}
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
.bk-thumb.c0{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.bk-thumb.c1{background:linear-gradient(150deg,var(--brand-deep),var(--gold));}
.bk-thumb.c2{background:linear-gradient(150deg,#caa06f,var(--brand));}
.bk-thumb.c3{background:linear-gradient(150deg,var(--brand),#5f7da6);}
.bk-svc-main{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;}
.bk-svc-main b{font-size:14.5px;font-weight:700;color:var(--ink);}
.bk-svc-main i{font-style:normal;font-size:12px;color:var(--muted);}
.bk-svc-price{display:inline-flex;align-items:center;gap:5px;flex:none;font-size:13.5px;font-weight:700;color:var(--brand);}
.bk-svcbar{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#e8eef6;border:1px solid #cbd9ea;border-radius:12px;padding:10px 13px;margin-bottom:16px;}
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
.bk-input{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--card);font-size:14px;color:var(--ink);font-family:inherit;}
.bk-input:focus{outline:none;border-color:var(--brand);}
.bk-textarea{min-height:64px;resize:vertical;line-height:1.5;}
.bk-deposit-row{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding:12px 14px;background:#e8eef6;border:1px solid #cbd9ea;border-radius:12px;}
.bk-deposit-row span{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--brand-deep);}
.bk-deposit-row b{font-size:16px;font-weight:800;color:var(--brand-deep);font-family:'Fraunces';}
.bk-ghost{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:9px;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--card);font-size:13.5px;font-weight:700;color:var(--ink);cursor:pointer;}
.bk-ghost:hover{border-color:var(--brand);color:var(--brand);}
.ps-bag-line{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--line);}
.ps-bag-th{width:42px;height:42px;border-radius:11px;flex:0 0 auto;background:linear-gradient(150deg,#dfe6f0,#e7cdb6);color:var(--brand-deep);display:grid;place-items:center;}
.ps-bag-line>div:nth-child(2){flex:1;}
.ps-bag-line b{font-size:13.5px;font-weight:600;display:block;}
.ps-bag-line span{font-size:13px;color:var(--brand-deep);font-weight:600;}
.ps-qty{display:flex;align-items:center;gap:10px;}
.ps-qty button{width:28px;height:28px;border-radius:8px;border:1px solid var(--line);display:grid;place-items:center;color:var(--brand-deep);}
.ps-bag-total{display:flex;justify-content:space-between;align-items:center;padding:14px 0;}
.ps-bag-total span{font-size:14px;font-weight:600;}
.ps-bag-total b{font-family:'Fraunces';font-weight:700;font-size:20px;color:var(--brand-deep);}
.ps-search-top{display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:11px 13px;margin:8px 0 16px;}
.ps-search-top svg:first-child{color:var(--muted);}
.ps-search-top input{flex:1;border:none;background:none;font-size:15px;color:var(--ink);outline:none;}
.ps-search-top button{color:var(--muted);}
.ps-search-lbl{font-size:12px;font-weight:700;color:#515b6b;margin-bottom:9px;}
.ps-share-url{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 14px;margin-bottom:12px;font-size:13.5px;font-weight:600;color:var(--brand-deep);}
.ps-share-url button{width:32px;height:32px;border-radius:8px;background:#f4e9e4;color:var(--brand);display:grid;place-items:center;}
.ps-share-wa{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--wa);color:#fff;font-weight:700;font-size:15px;padding:13px;border-radius:12px;}
.ps-share-row{display:flex;gap:10px;margin-top:10px;}
.ps-share-row button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:600;padding:12px;border-radius:11px;border:1px solid var(--line);color:var(--brand-deep);}

.ps-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);background:#1b2533;color:#fff;font-size:13px;font-weight:600;padding:11px 18px;border-radius:11px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:90;animation:pstoast .2s;}
@keyframes pstoast{from{opacity:0;transform:translate(-50%,8px);}to{opacity:1;transform:translate(-50%,0);}}

/* ===================== DESKTOP ===================== */
.pd-wrap{min-height:100vh;}
.pd-header{position:sticky;top:0;z-index:40;height:64px;display:flex;align-items:center;gap:22px;padding:0 30px;background:rgba(250,244,239,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.pd-search{flex:1;max-width:440px;display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:10px 14px;color:var(--muted);font-size:14px;}
.pd-header-actions{margin-left:auto;display:flex;align-items:center;gap:10px;}
.pd-hicon{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;color:var(--ink);position:relative;}
.pd-hicon i{position:absolute;top:-5px;right:-5px;background:var(--brand);color:#fff;font-size:10px;font-weight:800;font-style:normal;min-width:17px;height:17px;border-radius:9px;display:grid;place-items:center;padding:0 4px;}
.pd-head-book{display:flex;align-items:center;gap:7px;background:var(--brand);color:#fff;font-weight:700;font-size:14px;padding:11px 18px;border-radius:12px;box-shadow:0 5px 14px rgba(31,78,135,.3);}

.pd-container{max-width:1200px;margin:0 auto;padding:24px 30px 64px;}
.pd-cover{position:relative;}
.pd-cover-art{height:300px;border-radius:22px;overflow:hidden;background:linear-gradient(125deg,var(--brand-deep),var(--brand) 52%,var(--gold));position:relative;}
.pd-cover-icn{position:absolute;right:30px;bottom:-60px;width:400px;height:400px;color:#fff;opacity:.19;pointer-events:none;
  -webkit-mask-image:radial-gradient(circle at 55% 42%,#000 34%,transparent 72%);mask-image:radial-gradient(circle at 55% 42%,#000 34%,transparent 72%);}
.pd-identity{display:flex;align-items:flex-end;gap:22px;padding:0 28px;position:relative;}
.pd-avatar{width:128px;height:128px;border-radius:30px;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:56px;display:grid;place-items:center;border:6px solid var(--bg);box-shadow:0 10px 28px rgba(18,48,90,.22);margin-top:-46px;}
.pd-identity-main{flex:1;align-self:flex-start;padding-top:14px;min-width:0;}
.pd-identity-main h1{font-family:'Fraunces';font-weight:700;font-size:32px;letter-spacing:-.02em;display:flex;align-items:center;gap:8px;text-shadow:0 1px 2px rgba(255,255,255,.9),0 0 14px rgba(255,255,255,.55);}
.pd-identity-main p{display:flex;align-items:center;flex-wrap:wrap;gap:4px;font-size:13.5px;color:var(--muted);margin-top:6px;text-shadow:0 1px 2px rgba(255,255,255,.9),0 0 14px rgba(255,255,255,.55);}
.pd-identity-main p>span{display:inline-flex;align-items:center;gap:4px;}
.pd-identity-actions{display:flex;gap:10px;padding-bottom:10px;flex:0 0 auto;align-self:flex-end;}
.pd-book{display:flex;align-items:center;gap:7px;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:12px 22px;border-radius:12px;box-shadow:0 6px 16px rgba(31,78,135,.3);}
.pd-book:active{transform:translateY(2px);}
.pd-ghost{display:flex;align-items:center;gap:7px;font-weight:600;font-size:14px;padding:12px 18px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--brand-deep);}

.pd-tabs{position:sticky;top:64px;z-index:20;display:flex;gap:3px;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 4px;margin:22px 0 26px;overflow-x:auto;scrollbar-width:none;}
.pd-tabs::-webkit-scrollbar{display:none;}
.pd-tabs button{font-size:14px;font-weight:600;padding:10px 16px;border-radius:10px;color:#515b6b;white-space:nowrap;}
.pd-tabs button:hover{background:#f3e7e1;}
.pd-tabs button.on{background:#e8eef6;color:var(--brand-deep);font-weight:700;}

.pd-home{display:grid;grid-template-columns:332px 1fr;gap:26px;align-items:start;}
.pd-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.pd-railcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.pd-railcard h3{font-family:'Fraunces';font-weight:600;font-size:16px;margin-bottom:10px;}
.pd-railcard>p{font-size:13px;line-height:1.55;color:#3d4655;}
.pd-raillink{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:11px;}
.pd-railmap{height:120px;border-radius:12px;background:repeating-linear-gradient(45deg,#ece0d9,#ece0d9 12px,#e6d8d0 12px,#e6d8d0 24px);display:grid;place-items:center;color:var(--brand-deep);margin-bottom:12px;}
.pd-railbtns{display:flex;gap:8px;margin:12px 0;}
.pd-railbtns button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12.5px;font-weight:600;padding:9px;border-radius:10px;border:1px solid var(--line);color:var(--brand-deep);}
.pd-railcard.trust{background:#e8eef6;border-color:#cbd9ea;}
.pd-trust-h{display:flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;color:var(--brand-deep);}
.pd-railcard.trust p{font-size:12px;line-height:1.55;color:#5b6575;margin-top:8px;}

.pd-feed{min-width:0;display:flex;flex-direction:column;}
.pd-feed .ps-signature{margin-bottom:24px;}
.pd-sec-head{display:flex;align-items:baseline;justify-content:space-between;margin:8px 0 14px;}
.pd-sec-head h2{font-family:'Fraunces';font-weight:600;font-size:22px;letter-spacing:-.01em;}
.pd-sec-head button{font-size:13px;font-weight:700;color:var(--brand);}
.pd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px;margin-bottom:30px;}
.pd-grid.wide{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));}
.pd-grid.reviews{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));margin-top:14px;}
.pd-feed .ps-card-thumb{height:140px;}
.pd-feed .ps-rating,.pd-listing .ps-rating{max-width:540px;}
.pd-rev-top{display:grid;grid-template-columns:340px 1fr;gap:18px;align-items:start;margin-bottom:18px;}
.pd-rev-summary .ps-rating{max-width:none;margin-bottom:0;}
.pd-rev-firsts{display:grid;grid-template-columns:1fr 1fr;gap:14px;}

.pd-listing .pd-page-head,.pd-narrow .ps-sub-head{margin-bottom:18px;}
.pd-page-head h1{font-family:'Fraunces';font-weight:700;font-size:30px;letter-spacing:-.02em;}
.pd-page-head span{font-size:12.5px;color:var(--muted);}
.pd-filter{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:20px;}
.pd-filter button{font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:#3d4655;}
.pd-listing .ps-card-thumb{height:150px;}

.pd-narrow{max-width:760px;}

/* ===================== MOCK_FEATURED + displayBlog (shared) ===================== */
.feat{margin-bottom:22px;}
.feat-head{margin-bottom:12px;}
.feat-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--brand-deep);background:#e8eef6;padding:5px 11px;border-radius:8px;}
.feat-tag svg{color:var(--gold);}
.feat-grid{display:flex;gap:13px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
.feat-grid::-webkit-scrollbar{display:none;}
.feat-card{flex:0 0 76%;max-width:280px;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 8px 22px rgba(18,48,90,.08);display:flex;flex-direction:column;}
.feat-thumb{height:120px;position:relative;display:grid;place-items:center;color:#fff;}
.feat-thumb.service{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.feat-thumb.product{background:linear-gradient(150deg,#caa06f,var(--gold));}
.feat-rib{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--brand-deep);background:rgba(255,255,255,.92);padding:4px 8px;border-radius:7px;}
.feat-rib svg{color:var(--gold);fill:var(--gold);}
.feat-body{padding:13px 14px 14px;display:flex;flex-direction:column;flex:1;}
.feat-body b{font-size:15px;font-weight:700;line-height:1.3;}
.feat-sub{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);margin-top:3px;}
.feat-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px;}
.feat-foot em{font-family:'Fraunces';font-weight:700;font-size:17px;font-style:normal;color:var(--brand-deep);}
.feat-cta{font-size:13px;font-weight:700;padding:8px 18px;border-radius:10px;color:#fff;background:var(--brand);box-shadow:0 4px 10px rgba(31,78,135,.3);}
.feat-cta:active{transform:translateY(1px);}
@media(min-width:980px){
  .feat{margin-bottom:26px;}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);overflow:visible;}
  .feat-card{flex:none;max-width:none;}
  .feat-thumb{height:140px;}
}

.blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:16px;margin-bottom:8px;}
.blog-card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;
  transition:transform .12s,box-shadow .12s;}
.blog-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(18,48,90,.1);}
.blog-img{height:150px;position:relative;}
.blog-img.c0{background:linear-gradient(135deg,var(--brand-deep),var(--brand));}
.blog-img.c1{background:linear-gradient(135deg,var(--brand),var(--gold));}
.blog-img.c2{background:linear-gradient(135deg,#caa06f,var(--brand-deep));}
.blog-cat{position:absolute;top:11px;left:11px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;
  color:var(--brand-deep);background:rgba(255,255,255,.92);padding:4px 9px;border-radius:7px;}
.blog-body{padding:14px 15px 15px;display:flex;flex-direction:column;flex:1;}
.blog-date{font-size:11.5px;color:var(--muted);}
.blog-body b{display:block;font-family:'Fraunces';font-weight:600;font-size:17px;line-height:1.28;margin:4px 0 6px;letter-spacing:-.01em;}
.blog-body p{font-size:13px;color:#5b6575;line-height:1.5;}
.blog-read{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:12px;}
.blog-topics{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;}
.blog-topics button{font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:#3d4655;}
.blog-topics button.on{background:var(--brand);color:#fff;border-color:var(--brand);}
.blogp-body{display:grid;grid-template-columns:1fr 300px;gap:26px;align-items:start;}
.blogp-main{min-width:0;}
.blogp-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.blog-hero{display:grid;grid-template-columns:44% 1fr;background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;cursor:pointer;margin-bottom:24px;transition:transform .12s,box-shadow .12s;}
.blog-hero:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(18,48,90,.1);}
.blog-hero-img{position:relative;min-height:230px;}
.blog-hero-img.c0{background:linear-gradient(135deg,var(--brand-deep),var(--brand));}
.blog-hero-img.c1{background:linear-gradient(135deg,var(--brand),var(--gold));}
.blog-hero-img.c2{background:linear-gradient(135deg,#caa06f,var(--brand-deep));}
.blog-hero-body{padding:24px;display:flex;flex-direction:column;justify-content:center;}
.blog-kicker{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);}
.blog-hero-body h3{font-family:'Fraunces';font-weight:700;font-size:25px;line-height:1.2;letter-spacing:-.01em;margin:8px 0 10px;}
.blog-hero-body>p{font-size:14px;color:#515b6b;line-height:1.55;}
.blog-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--muted);margin:14px 0 16px;}
.blog-author{display:inline-flex;align-items:center;gap:6px;font-weight:700;color:var(--ink);}
.blog-author-av{width:22px;height:22px;border-radius:50%;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;}
.author-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.author-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.author-av{width:48px;height:48px;border-radius:50%;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:22px;display:grid;place-items:center;}
.author-top b{display:block;font-size:15px;font-weight:700;}
.author-top span{font-size:12px;color:var(--brand-deep);font-weight:600;}
.author-card>p{font-size:12.5px;line-height:1.55;color:#515b6b;}
.author-cred{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--brand-deep);margin-top:11px;}
.author-cred svg{color:var(--gold);flex:0 0 auto;}
.author-link{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:12px;}
.blog-convert{background:#e8eef6;border:1px solid #cbd9ea;border-radius:16px;padding:17px;}
.blog-convert>b{font-family:'Fraunces';font-weight:600;font-size:16px;}
.blog-convert>p{font-size:12.5px;color:#5b6575;line-height:1.5;margin:6px 0 13px;}
.blog-convert-cta{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px;border-radius:11px;box-shadow:0 6px 14px rgba(31,78,135,.28);}
.blog-convert-ghost{display:block;width:100%;text-align:center;font-size:13px;font-weight:700;color:var(--brand-deep);padding:10px;margin-top:8px;}

/* about page */
.ab-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.ab-main{min-width:0;}
.ab-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.ab-kicker{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--brand);}
.ab-headline{font-family:'Fraunces';font-weight:600;font-size:38px;line-height:1.1;letter-spacing:-.02em;margin:9px 0 14px;max-width:none;}
.ab-lede{font-size:15.5px;line-height:1.6;color:#515b6b;max-width:none;}
.ab-founder{display:grid;grid-template-columns:300px 1fr;gap:26px;align-items:start;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;margin:28px 0;}
.ab-portrait{position:relative;aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:linear-gradient(155deg,var(--brand-deep),var(--brand) 55%,var(--gold));display:grid;place-items:center;}
.ab-portrait-mono{font-family:'Fraunces';font-weight:600;font-size:84px;color:rgba(255,255,255,.32);}
.ab-portrait-tag{position:absolute;left:12px;bottom:12px;font-size:11px;font-weight:700;color:var(--brand-deep);background:rgba(255,255,255,.92);padding:5px 11px;border-radius:20px;}
.ab-founder-body .ab-kicker{display:block;}
.ab-name{font-family:'Fraunces';font-weight:700;font-size:24px;letter-spacing:-.01em;margin:7px 0 2px;}
.ab-role{display:block;font-size:13px;font-weight:600;color:var(--brand-deep);}
.ab-bio{font-size:14px;line-height:1.6;color:#515b6b;margin:13px 0;}
.ab-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}
.ab-chips span{font-size:11.5px;font-weight:600;color:var(--brand-deep);background:#e8eef6;border:1px solid #d2ddec;padding:5px 11px;border-radius:16px;}
.ab-quote{font-family:'Fraunces';font-style:italic;font-size:16px;line-height:1.5;color:var(--ink);border-left:3px solid var(--brand);padding-left:14px;margin:4px 0 16px;}
.ab-socials{display:flex;flex-wrap:wrap;gap:9px;}
.ab-socials button{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink);background:var(--card);border:1px solid var(--line);padding:9px 14px;border-radius:11px;transition:border-color .12s,color .12s;}
.ab-socials button:hover{border-color:var(--brand);color:var(--brand);}
.ab-approach{margin:6px 0 26px;}
.ab-approach h4{font-family:'Fraunces';font-weight:600;font-size:20px;margin-bottom:16px;}
.ab-approach-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.ab-approach-grid>div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;}
.ab-num{font-family:'Fraunces';font-weight:600;font-size:17px;color:var(--gold);}
.ab-approach-grid b{display:block;font-size:15px;font-weight:700;margin:7px 0 6px;}
.ab-approach-grid p{font-size:13px;line-height:1.55;color:#515b6b;}
.ab-stats{margin-top:6px;}
.ab-rail-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--brand-deep);margin-bottom:12px;}
.ab-addr{font-size:13px;line-height:1.5;color:#3d4655;margin:12px 0 8px;}
.ab-open{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--brand-deep);margin-bottom:4px;}
.ab-follow-rail{border-top:1px solid var(--line);margin-top:14px;padding-top:14px;}
.ab-follow-rail>span{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:10px;}
.ab-follow-icons{display:flex;gap:9px;}
.ab-follow-icons button{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:#e8eef6;border:1px solid #d2ddec;color:var(--brand-deep);transition:background .12s,color .12s;}
.ab-follow-icons button:hover{background:var(--brand);color:#fff;border-color:var(--brand);}
/* about, mobile body additions */
.ab-founder-m{display:block;background:transparent;border:0;border-radius:0;padding:0;margin:18px 0;}
.ab-founder-m .ab-portrait{aspect-ratio:4/3;margin-bottom:16px;}
.ab-founder-m .ab-portrait-mono{font-size:72px;}
.ab-follow{border-top:1px solid var(--line);margin-top:18px;padding-top:16px;}
.ab-follow-h{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:11px;}
.ab-book-m{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:18px;background:var(--brand);color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:13px;box-shadow:0 8px 18px rgba(31,78,135,.3);}
.ab-para{font-size:14.5px;line-height:1.65;color:#515b6b;max-width:none;margin-top:13px;}
.ab-section{margin:28px 0;}
.ab-subhead{font-family:'Fraunces';font-weight:600;font-size:20px;margin-bottom:16px;}
.ab-offer-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ab-offer-card{text-align:left;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;cursor:pointer;transition:transform .12s,box-shadow .12s,border-color .12s;}
.ab-offer-card:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(18,48,90,.09);border-color:#cbd9ea;}
.ab-offer-card b{display:block;font-size:15.5px;font-weight:700;margin-bottom:6px;}
.ab-offer-card p{font-size:13px;line-height:1.55;color:#515b6b;margin-bottom:11px;}
.ab-offer-link{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);}
.ab-facts{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden;}
.ab-fact{background:var(--card);padding:15px 17px;display:flex;flex-direction:column;gap:3px;}
.ab-fact-k{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);}
.ab-fact-v{font-size:13.5px;color:#3d4655;line-height:1.45;}
.ab-grid-m{grid-template-columns:1fr;}
.ab-facts-m{grid-template-columns:1fr;}
.ab-verified{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--brand-deep);background:#e8eef6;border:1px solid #d2ddec;padding:4px 10px;border-radius:16px;margin-top:8px;}
.ab-verified svg{color:var(--brand);}
.ab-creds{margin:15px 0 4px;}
.ab-creds-h{display:block;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:9px;}
.ab-creds ul{display:flex;flex-direction:column;gap:7px;}
.ab-creds li{display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:1.45;color:#3d4655;}
.ab-creds li svg{color:var(--brand);flex:0 0 auto;margin-top:2px;}
.ab-sec-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:16px;}
.ab-sec-head .ab-subhead{margin-bottom:0;}
.ab-seclink{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);flex:0 0 auto;}
.ab-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.ab-shot{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;cursor:pointer;display:block;transition:transform .12s,box-shadow .12s;}
.ab-shot:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(18,48,90,.14);}
.ab-shot.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.ab-shot.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.ab-shot.c2{background:linear-gradient(150deg,#caa06f,var(--brand-deep));}
.ab-shot-cap{position:absolute;left:11px;bottom:11px;font-size:11.5px;font-weight:700;color:#fff;background:rgba(60,20,36,.42);backdrop-filter:blur(2px);padding:5px 10px;border-radius:14px;}
.ab-featured{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:28px 0;}
.ab-featured-h{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);}
.ab-featured-h svg{color:var(--gold);}
.ab-featured-row{display:flex;flex-wrap:wrap;gap:22px;align-items:center;margin-top:14px;}
.ab-logo{font-family:'Fraunces';font-weight:600;font-size:16px;color:var(--brand-deep);opacity:.78;letter-spacing:-.01em;}
.ab-review{position:relative;background:#e8eef6;border:1px solid #cbd9ea;border-radius:18px;padding:24px;margin:28px 0;}
.ab-quote-mark{color:var(--brand);opacity:.45;margin-bottom:4px;}
.ab-review-text{font-family:'Fraunces';font-size:20px;line-height:1.4;color:var(--ink);letter-spacing:-.01em;}
.ab-review-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-top:18px;}
.ab-review-by{display:flex;align-items:center;gap:11px;}
.ab-review-av{width:40px;height:40px;border-radius:50%;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-weight:700;font-size:15px;display:grid;place-items:center;}
.ab-review-by b{display:block;font-size:14px;font-weight:700;}
.ab-review-tag{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:var(--brand-deep);}
.ab-review-tag svg{color:var(--brand);}
.ab-review-all{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);flex:0 0 auto;}
.ab-journal{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.ab-journal-item{text-align:left;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px;cursor:pointer;display:flex;flex-direction:column;gap:7px;transition:transform .12s,box-shadow .12s,border-color .12s;}
.ab-journal-item:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(18,48,90,.09);border-color:#cbd9ea;}
.ab-journal-cat{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);}
.ab-journal-item b{font-size:13.5px;font-weight:700;line-height:1.35;}
.ab-journal-meta{font-size:11.5px;color:var(--muted);}
.ab-journal-note{font-size:12.5px;color:var(--muted);margin-top:12px;}
@media(max-width:979px){
  .ab-gallery{grid-template-columns:repeat(2,1fr);}
  .ab-journal{grid-template-columns:1fr;}
  .ab-featured-row{gap:16px;}
  .ab-review-text{font-size:17px;}
}

/* faq page */
.faq-wrap{display:grid;grid-template-columns:280px 1fr;gap:30px;align-items:start;}
.faq-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:14px;}
.faq-main{min-width:0;}
.faq-search{display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 13px;}
.faq-search svg{color:var(--muted);flex:0 0 auto;}
.faq-search input{flex:1;min-width:0;font-size:14px;color:var(--ink);background:transparent;border:0;outline:none;}
.faq-cats{display:flex;flex-direction:column;gap:2px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:7px;}
.faq-cats button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font-size:13px;font-weight:600;color:#3d4655;padding:10px 11px;border-radius:9px;transition:background .12s,color .12s;}
.faq-cats button:hover{background:#e8eef6;color:var(--brand-deep);}
.faq-cats button svg{color:var(--brand);flex:0 0 auto;}
.faq-help{background:#e8eef6;border:1px solid #cbd9ea;border-radius:16px;padding:17px;}
.faq-help>b{font-family:'Fraunces';font-weight:600;font-size:16px;}
.faq-help>p{font-size:12.5px;color:#5b6575;line-height:1.5;margin:6px 0 13px;}
.faq-help-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px;border-radius:11px;box-shadow:0 6px 14px rgba(31,78,135,.28);}
.faq-groups{display:flex;flex-direction:column;gap:26px;}
.faq-group{scroll-margin-top:130px;}
.faq-group-head{display:flex;align-items:center;gap:9px;font-family:'Fraunces';font-weight:600;font-size:19px;margin-bottom:13px;}
.faq-group-head svg{color:var(--brand);flex:0 0 auto;}
.faq-empty{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:18px;font-size:13.5px;color:#515b6b;}
.faq-search-m{margin-bottom:18px;}

/* contact page */
.ct-wrap{display:grid;grid-template-columns:1fr 340px;gap:30px;align-items:start;}
.ct-main{min-width:0;}
.ct-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.ct-channels{margin:4px 0 26px;}
.ct-wa{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:15.5px;padding:15px;border-radius:13px;box-shadow:0 8px 18px rgba(31,78,135,.3);}
.ct-alt{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;}
.ct-alt button{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:var(--ink);background:var(--card);border:1px solid var(--line);padding:10px 14px;border-radius:11px;transition:border-color .12s,color .12s;}
.ct-alt button:hover{border-color:var(--brand);color:var(--brand);}
.ct-alt button svg{color:var(--brand);flex:0 0 auto;}
.ct-form{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px;}
.ct-form .ab-subhead{margin-bottom:4px;}
.ct-form-sub{font-size:13px;line-height:1.5;color:#515b6b;margin-bottom:15px;}
.ct-form-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.ct-input{width:100%;font-family:inherit;font-size:14px;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:12px 13px;outline:none;margin-bottom:11px;}
.ct-input::placeholder{color:#8d95a5;}
.ct-input:focus{border-color:var(--brand);}
select.ct-input{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b14a6e' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 12px center;padding-right:34px;cursor:pointer;}
.ct-textarea{resize:vertical;min-height:96px;line-height:1.5;}
.ct-send{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14px;padding:13px;border-radius:11px;box-shadow:0 6px 14px rgba(31,78,135,.28);}
.ct-form-note{font-size:12px;color:var(--muted);line-height:1.5;margin-top:11px;}
.ct-visit{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.ct-map{position:relative;height:148px;border-radius:13px;overflow:hidden;border:1px solid var(--line);background:#f1e7e0;margin-bottom:13px;}
.ct-map::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,#e4d6cd 0 1.5px,transparent 1.5px 34px),repeating-linear-gradient(0deg,#e4d6cd 0 1.5px,transparent 1.5px 34px);}
.ct-map::after{content:"";position:absolute;left:-10%;top:58%;width:120%;height:9px;background:#ecdcd2;transform:rotate(-16deg);}
.ct-map-pin{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-45deg);display:grid;place-items:center;width:34px;height:34px;border-radius:50% 50% 50% 0;background:var(--brand);color:#fff;box-shadow:0 6px 13px rgba(18,48,90,.4);}
.ct-map-pin svg{transform:rotate(45deg);}
.ct-map-label{position:absolute;left:11px;bottom:10px;font-size:11px;font-weight:700;color:var(--brand-deep);background:rgba(255,255,255,.92);padding:4px 10px;border-radius:14px;}
.ct-hours{border:1px solid var(--line);border-radius:13px;overflow:hidden;margin-top:14px;}
.ct-hours-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border-bottom:1px solid var(--line);background:#faf6f2;}
.ct-hours-head b{font-size:13px;font-weight:700;}
.ct-open{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#1f7a4d;background:#e6f4ec;padding:4px 9px;border-radius:13px;}
.ct-open .dot{width:7px;height:7px;border-radius:50%;background:#23a55f;}
.ct-open.closed{color:#9a3b3b;background:#f6e7e3;}
.ct-open.closed .dot{background:#c45b5b;}
.ct-hours-list{display:flex;flex-direction:column;}
.ct-hours-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 13px;font-size:12.5px;color:#515b6b;}
.ct-hours-list li+li{border-top:1px solid var(--line);}
.ct-hours-list li b{font-weight:600;color:#3d4655;}
.ct-hours-list li.today{background:#e8eef6;color:var(--brand-deep);}
.ct-hours-list li.today b{color:var(--brand-deep);font-weight:700;}
.ct-hours-list li .clo{color:var(--muted);}
.ct-visit .ps-dir{width:100%;justify-content:center;}
@media(max-width:979px){
  .ct-channels{margin-bottom:20px;}
  .ct-form{margin-bottom:18px;}
  .ct-form-row{grid-template-columns:1fr;}
}

/* refunds page */
.rf-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.rf-main{min-width:0;}
.rf-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.rf-body-m{display:flex;flex-direction:column;gap:18px;}
.rf-sections{display:flex;flex-direction:column;gap:24px;}
.rf-section-head{display:flex;align-items:center;gap:9px;font-family:'Fraunces';font-weight:600;font-size:19px;margin-bottom:13px;}
.rf-section-head svg{color:var(--brand);flex:0 0 auto;}
.rf-list{display:flex;flex-direction:column;gap:10px;}
.rf-list li{display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.55;color:#3d4655;}
.rf-list li svg{color:var(--brand);flex:0 0 auto;margin-top:3px;}
.rf-keys{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.rf-keys-h{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:13px;}
.rf-keys ul{display:flex;flex-direction:column;gap:13px;}
.rf-keys li{display:flex;align-items:flex-start;gap:11px;}
.rf-keys li svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}
.rf-keys li b{display:block;font-size:13.5px;font-weight:700;}
.rf-keys li span{font-size:12.5px;color:#515b6b;}
.rf-related{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:8px;}
.rf-related-h{display:block;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:9px 11px 7px;}
.rf-related button{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:13.5px;font-weight:600;color:#3d4655;padding:11px;border-radius:10px;transition:background .12s,color .12s;}
.rf-related button:hover{background:#e8eef6;color:var(--brand-deep);}
.rf-related button svg{color:var(--brand);}

/* terms page */
.tm-wrap{display:grid;grid-template-columns:1fr 260px;gap:34px;align-items:start;}
.tm-main{min-width:0;}
.tm-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:14px;}
.tm-intro{font-size:15px;line-height:1.6;color:#515b6b;max-width:70ch;}
.tm-section{max-width:70ch;margin-top:26px;scroll-margin-top:130px;}
.tm-section h3{font-family:'Fraunces';font-weight:600;font-size:20px;letter-spacing:-.01em;margin-bottom:10px;}
.tm-section p{font-size:14px;line-height:1.65;color:#3d4655;margin-bottom:10px;}
.tm-link{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:var(--brand);margin-top:2px;}
.tm-contents{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:9px;}
.tm-contents-h{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:8px 10px 7px;}
.tm-contents nav{display:flex;flex-direction:column;}
.tm-contents button{text-align:left;font-size:12.5px;font-weight:600;color:#3d4655;padding:8px 10px;border-radius:8px;transition:background .12s,color .12s;}
.tm-contents button:hover{background:#e8eef6;color:var(--brand-deep);}
.tm-meta{font-size:12px;color:var(--muted);padding:0 2px;}
.tm-body-m .tm-section,.tm-body-m .tm-intro{max-width:none;}

/* portfolio page */
.pf-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.pf-main{min-width:0;}
.pf-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.pf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.pf-card{display:flex;flex-direction:column;width:100%;text-align:left;cursor:pointer;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:transform .12s,box-shadow .12s;}
.pf-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(18,48,90,.12);}
.pf-card.is-taken{opacity:.66;}
.pf-photo{position:relative;aspect-ratio:2/1;margin:11px 12px 0;border-radius:14px;overflow:hidden;}
.pf-photo::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;background:linear-gradient(to top,rgba(10,22,40,.40),transparent 38%);}
.pf-photo.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.pf-photo.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.pf-photo.c2{background:linear-gradient(150deg,#5f7da6,var(--brand-deep));}
.pf-photo-icn{color:#fff;opacity:.22;}
.pf-view{position:absolute;right:10px;bottom:10px;z-index:2;display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;color:#fff;background:rgba(18,48,90,.62);padding:5px 9px;border-radius:20px;opacity:0;transform:translateY(4px);transition:opacity .14s,transform .14s;}
.pf-card:hover .pf-view{opacity:1;transform:translateY(0);}
.pf-slides{display:flex;width:100%;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.pf-slides::-webkit-scrollbar{display:none;}
.pf-slide{flex:0 0 100%;height:100%;scroll-snap-align:start;display:grid;place-items:center;}
.pf-slide.s0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.pf-slide.s1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.pf-slide.s2{background:linear-gradient(135deg,#5f7da6,var(--brand-deep));}
.pf-badge{z-index:2;}
.pf-dots{position:absolute;left:0;right:0;bottom:11px;z-index:3;display:flex;justify-content:center;gap:6px;}
.pf-dots button{width:6px;height:6px;padding:0;border-radius:50%;background:rgba(255,255,255,.55);transition:width .18s,background .18s;}
.pf-dots button.on{background:#fff;width:17px;border-radius:3px;}
.pf-badge{position:absolute;top:10px;left:10px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:4px 9px;border-radius:20px;}
.pf-badge.b-live{color:#12305a;background:rgba(255,255,255,.94);}
.pf-badge.b-taken{color:#fff;background:rgba(20,30,45,.82);}
.pf-clk{display:block;width:100%;text-align:left;cursor:pointer;}
.pf-body{display:flex;flex-direction:column;padding:13px 14px 15px;}
.pf-foot{padding:0 14px 14px;}
.pf-cta{width:100%;}
.pf-row1{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.pf-title{font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.25;}
.pf-name{margin:0;font-size:15.5px;font-weight:700;line-height:1.3;color:var(--ink);}
.pf-price{margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.pf-amt{font-family:'Space Grotesk',system-ui,sans-serif;font-size:17.5px;font-weight:700;color:var(--brand);font-variant-numeric:tabular-nums;letter-spacing:-.01em;}
.pf-per{flex-shrink:0;font-size:11.5px;font-weight:600;color:var(--brand);background:#eaf0f7;padding:3px 10px;border-radius:999px;white-space:nowrap;}
.pf-fresh{position:absolute;top:10px;right:10px;z-index:2;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#fff;background:rgba(13,28,51,.58);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);padding:4px 9px;border-radius:999px;white-space:nowrap;}
.pf-fresh svg{flex-shrink:0;}
.pf-filters{display:flex;align-items:center;gap:10px;margin:2px 0 13px;flex-wrap:wrap;}
.pf-fdrop{position:relative;}
.pf-fbtn{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border:1px solid var(--line);border-radius:999px;background:var(--card);font-size:13.5px;font-weight:600;color:var(--ink);}
.pf-fbtn svg{color:var(--muted);}
.pf-fbtn.active{border-color:var(--brand);color:var(--brand);}
.pf-fbtn.active svg{color:var(--brand);}
.pf-fall{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border:1.5px solid var(--brand);border-radius:999px;background:var(--card);font-size:13.5px;font-weight:700;color:var(--brand);}
.pf-fall svg{color:var(--brand);}
.pf-fscrim{position:fixed;inset:0;z-index:20;}
.pf-fmenu{position:absolute;top:calc(100% + 6px);left:0;z-index:30;min-width:185px;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 34px rgba(20,40,80,.16);padding:6px;display:flex;flex-direction:column;}
.pf-fmenu button{text-align:left;padding:9px 12px;border-radius:9px;font-size:13.5px;font-weight:600;color:var(--ink);}
.pf-fmenu button:hover{background:var(--bg);}
.pf-fmenu button.on{color:var(--brand);background:#eaf0f7;}
.pf-fsheet{padding:2px 0 4px;}
.pf-fgroup{margin-bottom:17px;}
.pf-fgroup>span{display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:9px;}
.pf-fopts{display:flex;flex-wrap:wrap;gap:8px;}
.pf-fopts button{padding:8px 14px;border:1px solid var(--line);border-radius:999px;font-size:13px;font-weight:600;color:var(--ink);background:var(--card);}
.pf-fopts button.on{border-color:var(--brand);background:#eaf0f7;color:var(--brand);}
.pf-fapply{width:100%;margin-top:6px;padding:13px;border-radius:12px;background:var(--brand);color:#fff;font-weight:700;font-size:14px;}
.pf-price{font-family:'Fraunces';font-weight:700;font-size:19px;color:var(--ink);letter-spacing:-.01em;}
.pf-stats{display:flex;align-items:center;gap:15px;margin:1px 0;}
.pf-stats span{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:#515b6b;}
.pf-stats svg{color:var(--brand);}
.pf-area{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--muted);}
.pf-specs{font-size:12px;color:#515b6b;}
.pf-cta{display:inline-flex;align-items:center;justify-content:center;gap:7px;margin-top:6px;padding:10px 12px;border-radius:11px;background:var(--brand);color:#fff;font-size:12.5px;font-weight:700;}
.pf-cta:hover{background:var(--brand-deep);}
.pf-cta.ghost{background:transparent;border:1px solid var(--line);color:var(--muted);}
.pf-cta.ghost:hover{background:#e8eef6;color:var(--brand-deep);}
.bk-listing{display:flex;align-items:center;gap:7px;margin:8px 0 2px;padding:9px 11px;border-radius:10px;background:#e8eef6;border:1px solid #cbd9ea;font-size:12.5px;color:var(--brand-deep);font-weight:600;}
.bk-listing span{flex:1;}
.bk-listing b{font-weight:800;white-space:nowrap;}
.lst{width:100%;}
.lst-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--brand);margin-bottom:14px;}
.lst-hero{position:relative;aspect-ratio:16/9;max-height:430px;border-radius:18px;overflow:hidden;display:grid;place-items:center;margin-bottom:20px;}
.lst-hero.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.lst-hero.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.lst-hero.c2{background:linear-gradient(150deg,#5f7da6,var(--brand-deep));}
.lst-hero-icn{color:#fff;opacity:.2;}
.lst-hero .pf-badge{top:14px;left:14px;font-size:11px;}
.lst-hero .pf-fresh{top:14px;right:14px;font-size:11.5px;padding:5px 11px;}
.lst-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.lst-main{min-width:0;}
.lst-kicker{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);}
.lst-title{font-family:'Fraunces';font-weight:700;font-size:30px;letter-spacing:-.02em;line-height:1.12;margin:8px 0 6px;color:var(--ink);}
.lst-price{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0;}
.lst-specs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;}
.lst-specs span{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--brand-deep);background:#e8eef6;border:1px solid #cbd9ea;padding:7px 12px;border-radius:9px;}
.lst-specs span svg{color:var(--brand);}
.lst-sec{margin-top:24px;}
.lst-sec .ab-subhead{margin-bottom:10px;}
.lst-desc{font-size:14.5px;line-height:1.7;color:#3d4655;}
.lst-features{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:9px 18px;}
.lst-features li{display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:1.45;color:var(--ink);}
.lst-features li svg{color:var(--ok);flex-shrink:0;margin-top:2px;}
.lst-facts{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden;}
.lst-facts div{display:flex;flex-direction:column;gap:3px;padding:11px 13px;background:var(--card);}
.lst-facts span{font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:600;}
.lst-facts b{font-size:13.5px;color:var(--ink);font-weight:700;}
.lst-rail{position:sticky;top:132px;}
.lst-book{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 24px rgba(18,48,90,.06);}
.lst-book-price{font-family:'Fraunces';font-weight:700;font-size:22px;color:var(--ink);}
.lst-status{display:inline-flex;align-items:center;width:max-content;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#1f7a4d;background:#e6f4ec;padding:4px 10px;border-radius:20px;}
.lst-status.is-taken{color:#9a3b3b;background:#f3e7e1;}
.lst-cta{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px;border-radius:11px;background:var(--brand);color:#fff;font-size:14px;font-weight:700;margin-top:4px;}
.lst-cta:hover{background:var(--brand-deep);}
.lst-cta.ghost{background:transparent;border:1px solid var(--line);color:var(--muted);}
.lst-msg{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px;border-radius:11px;border:1px solid var(--line);font-size:13px;font-weight:700;color:var(--ink);}
.lst-note{font-size:11.5px;line-height:1.5;color:var(--muted);}
.lst-trust{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;color:var(--brand-deep);padding-top:6px;border-top:1px solid var(--line);}
.lst-top{display:grid;grid-template-columns:minmax(0,460px) 1fr;gap:30px;align-items:start;}
.lst-gallery{position:sticky;top:108px;min-width:0;}
.lst-detail{min-width:0;}
.lst-summary{display:flex;flex-direction:column;gap:9px;padding-bottom:4px;}
.lst-summary .lst-title{margin:2px 0 0;}
.lst-summary .lst-price{margin:0;}
.lst-amt{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;font-size:23px;color:var(--brand);font-variant-numeric:tabular-nums;letter-spacing:-.01em;}
.pf-photo-hero{aspect-ratio:3/2;margin:0;border-radius:18px;}
.pf-photo-hero .pf-badge{top:14px;left:14px;font-size:11px;}
.pf-photo-hero .pf-fresh{top:14px;right:14px;font-size:11.5px;padding:5px 11px;}
.lst-tabs{display:flex;gap:2px;border-bottom:1px solid var(--line);margin-top:16px;overflow-x:auto;scrollbar-width:none;}
.lst-tabs::-webkit-scrollbar{display:none;}
.lst-tabs button{flex-shrink:0;white-space:nowrap;padding:12px 15px;font-size:14px;font-weight:700;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-1px;}
.lst-tabs button.on{color:var(--ink);border-bottom-color:var(--brand);}
.lst-tabbody{padding-top:20px;min-height:110px;}
.lst-pbreak{border:1px solid var(--line);border-radius:12px;overflow:hidden;max-width:520px;}
.lst-pbreak>div{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;border-bottom:1px solid var(--line);font-size:14px;}
.lst-pbreak>div:last-child{border-bottom:0;}
.lst-pbreak span{color:#3d4655;}
.lst-pbreak b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap;}
.lst-pnote{font-size:12px;color:var(--muted);margin-top:9px;line-height:1.5;max-width:520px;}
.lst-pref{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;}
.lst-pref li{display:flex;align-items:flex-start;gap:9px;font-size:14px;line-height:1.5;color:var(--ink);}
.lst-pref li svg{color:var(--brand);flex-shrink:0;margin-top:2px;}
.lst-availrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.lst-availrow p{font-size:14px;color:#3d4655;line-height:1.5;margin:0;}
.lst-act{margin-top:26px;border:1px solid var(--line);border-radius:16px;padding:18px;background:var(--card);box-shadow:0 8px 24px rgba(18,48,90,.06);display:flex;flex-direction:column;gap:12px;}
.lst-act-info{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.lst-act-price{display:flex;align-items:center;gap:9px;}
.lst-act-btns{display:flex;gap:10px;}
.lst-act-btns>button{flex:1;margin-top:0;}
@media(max-width:979px){
  .lst-wrap{grid-template-columns:1fr;gap:22px;}
  .lst-top{grid-template-columns:1fr;gap:20px;}
  .lst-gallery{position:static;}
  .pf-photo-hero{aspect-ratio:3/4;max-height:540px;}
  .lst-rail{position:static;}
  .lst-title{font-size:25px;}
  .lst-features{grid-template-columns:1fr;}
  .lst-hero{aspect-ratio:4/3;}
}
.pf-shot{position:relative;aspect-ratio:4/5;border-radius:14px;overflow:hidden;cursor:pointer;display:block;transition:transform .12s,box-shadow .12s;}
.pf-shot:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(18,48,90,.16);}
.pf-shot::before{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(10,22,40,.5),transparent 46%);}
.pf-shot.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.pf-shot.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.pf-shot.c2{background:linear-gradient(150deg,#caa06f,var(--brand-deep));}
.pf-shot.ba::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.55);}
.pf-ba{position:absolute;top:10px;left:0;right:0;display:flex;justify-content:space-between;padding:0 10px;}
.pf-ba-h{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#fff;background:rgba(60,20,36,.42);padding:3px 8px;border-radius:10px;}
.pf-shot-cap{position:absolute;left:12px;bottom:11px;}
.pf-shot-cap b{display:block;font-size:13px;font-weight:700;color:#fff;}
.pf-shot-cap span{font-size:11px;color:rgba(255,255,255,.85);}
.pf-status{position:absolute;top:10px;right:10px;z-index:2;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#12305a;background:rgba(255,255,255,.93);padding:4px 9px;border-radius:20px;}
@media(max-width:979px){
  .pf-grid{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:560px){
  .pf-grid{grid-template-columns:1fr;}
}

/* article page */
.art-back{display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:var(--brand);font-weight:700;font-size:13.5px;cursor:pointer;padding:4px 0;margin-bottom:14px;}
.art-back:hover{color:var(--brand-deep);}
.art-wrap{display:grid;grid-template-columns:1fr 300px;gap:34px;align-items:start;}
.art-main{min-width:0;}
.art-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.art-hero{position:relative;aspect-ratio:16/9;border-radius:18px;overflow:hidden;margin-bottom:20px;}
.art-hero.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.art-hero.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.art-hero.c2{background:linear-gradient(150deg,#caa06f,var(--brand-deep));}
.art-hero .blog-cat{top:14px;left:14px;}
.art-kicker{display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);margin-bottom:8px;}
.art-title{font-family:'Fraunces';font-weight:700;font-size:34px;line-height:1.12;letter-spacing:-.02em;color:var(--ink);}
.art-meta{display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:13px;color:var(--muted);margin:14px 0 26px;}
.art-meta-av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--brand);color:#fff;font-weight:800;font-size:13px;font-family:'Fraunces';}
.art-meta-by{font-weight:700;color:var(--ink);}
.art-body{max-width:66ch;}
.art-body p{font-size:15.5px;line-height:1.72;color:var(--ink);margin-bottom:18px;}
.art-body h3{font-family:'Fraunces';font-weight:600;font-size:21px;color:var(--ink);margin:30px 0 12px;}
.art-body ul{list-style:none;margin:0 0 18px;padding:0;display:flex;flex-direction:column;gap:10px;}
.art-body li{position:relative;padding-left:24px;font-size:15.5px;line-height:1.6;color:var(--ink);}
.art-body li::before{content:"";position:absolute;left:4px;top:9px;width:7px;height:7px;border-radius:50%;background:var(--brand);}
.art-author{display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;margin-top:34px;}
.art-author .author-av{flex:none;}
.art-author-tag{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);}
.art-author-main b{display:block;font-family:'Fraunces';font-weight:600;font-size:17px;color:var(--ink);margin-top:2px;}
.art-author-role{display:block;font-size:12.5px;color:var(--brand);font-weight:600;margin-bottom:8px;}
.art-author-main p{font-size:13.5px;line-height:1.6;color:var(--muted);margin-bottom:0;}
.art-author-main .author-link{margin-top:10px;cursor:pointer;}
.art-share{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.art-share-h{display:block;font-weight:700;font-size:13.5px;color:var(--ink);margin-bottom:11px;}
.art-share-row{display:flex;gap:8px;}
.art-share-row button{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px;border-radius:10px;border:1px solid var(--line);background:var(--bg);font-size:12.5px;font-weight:700;color:var(--ink);cursor:pointer;}
.art-share-row button:hover{border-color:var(--brand);color:var(--brand);}
.art-related{margin-top:46px;border-top:1px solid var(--line);padding-top:30px;}
@media(max-width:979px){
  .art-wrap{grid-template-columns:1fr;gap:24px;}
  .art-rail{position:static;}
  .art-title{font-size:27px;max-width:none;}
  .art-hero{aspect-ratio:3/2;margin-bottom:16px;}
  .art-related{margin-top:34px;}
}

/* ===================== DESKTOP SERVICES PAGE ===================== */
.svc-intro{font-size:14px;color:#5b6575;line-height:1.5;margin:-4px 0 24px;max-width:620px;}
.svc-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:34px;}
.svc-body{display:grid;grid-template-columns:266px 1fr;gap:26px;align-items:start;margin-bottom:36px;}
.svc-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.svc-search{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 13px;}
.svc-search svg{color:var(--muted);flex:0 0 auto;}
.svc-search input{flex:1;min-width:0;border:none;background:none;outline:none;font-size:14px;color:var(--ink);}
.svc-search>button{color:var(--muted);display:grid;place-items:center;flex:0 0 auto;}
.svc-filters{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:2px 15px;}
.svc-fgroup{padding:15px 0;border-top:1px solid var(--line);}
.svc-fgroup:first-child{border-top:none;}
.svc-fgroup h4{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#6f7785;margin-bottom:8px;}
.svc-radios{display:flex;flex-direction:column;gap:1px;}
.svc-radios button{text-align:left;font-size:13.5px;font-weight:500;padding:8px 10px;border-radius:9px;color:#3d4655;}
.svc-radios button:hover{background:#f3e7e1;}
.svc-radios button.on{background:#e8eef6;color:var(--brand-deep);font-weight:700;}
.svc-book-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 8px 22px rgba(18,48,90,.06);}
.svc-open{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ok);}
.svc-next{font-size:13px;color:#515b6b;margin:10px 0 14px;}
.svc-next b{color:var(--ink);}
.svc-book-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:12px;border-radius:12px;box-shadow:0 6px 16px rgba(31,78,135,.3);}
.svc-book-cta:active{transform:translateY(2px);}
.svc-msg{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;font-weight:600;font-size:13.5px;padding:11px;border-radius:11px;border:1px solid var(--line);color:var(--brand-deep);margin-top:9px;}
.svc-results-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;}
.svc-results-head b{font-size:14.5px;font-weight:700;}
.svc-clear{font-size:12.5px;font-weight:700;color:var(--brand);}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:16px;}
.svc-empty{background:var(--card);border:1px dashed var(--line);border-radius:14px;padding:44px 20px;text-align:center;font-size:14px;color:var(--muted);}
.svc-empty button{color:var(--brand);font-weight:700;margin-left:5px;}
.svc-card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:transform .12s,box-shadow .12s;}
.svc-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(18,48,90,.1);}
.svc-card-thumb{height:128px;position:relative;display:grid;place-items:center;color:#fff;}
.svc-card-thumb.c0{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.svc-card-thumb.c1{background:linear-gradient(150deg,var(--brand-deep),var(--gold));}
.svc-card-thumb.c2{background:linear-gradient(150deg,#caa06f,var(--brand));}
.svc-card-thumb.c3{background:linear-gradient(150deg,var(--brand),#5f7da6);}
.svc-card-cat{position:absolute;bottom:10px;left:10px;width:max-content;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--brand-deep);background:rgba(255,255,255,.92);padding:4px 9px;border-radius:7px;}
.svc-badge{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#fff;background:rgba(42,29,34,.5);backdrop-filter:blur(2px);padding:4px 8px;border-radius:7px;}
.svc-badge svg{color:var(--gold);fill:var(--gold);}
.svc-card-body{padding:13px 14px 14px;display:flex;flex-direction:column;flex:1;}
.svc-card-body>b{font-size:15px;font-weight:700;line-height:1.3;}
.svc-card-dur{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);margin-top:3px;}
.svc-card-desc{font-size:12.5px;color:#5b6575;line-height:1.5;margin-top:8px;flex:1;}
.svc-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:13px;}
.svc-card-foot em{font-family:'Fraunces';font-weight:700;font-size:17px;font-style:normal;color:var(--brand-deep);}
.svc-card-book{display:inline-flex;align-items:center;gap:3px;font-size:13px;font-weight:700;color:#fff;background:var(--brand);padding:8px 14px;border-radius:10px;box-shadow:0 4px 10px rgba(31,78,135,.3);}
.svc-card-book:active{transform:translateY(1px);}
.svc-trust{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--brand-deep);}
.svc-trust svg{color:var(--brand);}
.svc-deliv{list-style:none;margin:11px 0 14px;display:flex;flex-direction:column;gap:8px;}
.svc-deliv li{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:#515b6b;line-height:1.4;}
.svc-deliv svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}

/* ===================== DESKTOP displayReviews PAGE ===================== */
.rev-summary{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.rev-score{text-align:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:12px;}
.rev-score>b{font-family:'Fraunces';font-weight:700;font-size:40px;line-height:1;color:var(--brand-deep);}
.rev-score-stars{display:flex;gap:2px;justify-content:center;margin:5px 0 3px;}
.rev-score-stars .f{color:var(--gold);fill:var(--gold);}
.rev-score span{display:block;font-size:13px;font-weight:700;}
.rev-score i{font-size:11.5px;color:var(--muted);font-style:normal;}
.rev-bars{display:flex;flex-direction:column;gap:3px;}
.rev-bar{display:flex;align-items:center;gap:7px;width:100%;padding:5px 6px;border-radius:8px;font-size:12px;color:var(--muted);}
.rev-bar:hover{background:#f3e7e1;}
.rev-bar.on{background:#e8eef6;}
.rev-bar>span{width:8px;text-align:right;color:var(--ink);font-weight:600;}
.rev-bar .f{color:var(--gold);fill:var(--gold);flex:0 0 auto;}
.rev-bar-track{flex:1;height:7px;background:#f0e4de;border-radius:4px;overflow:hidden;}
.rev-bar-track i{display:block;height:100%;background:var(--brand);border-radius:4px;}
.rev-leave{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:12px;border-radius:12px;box-shadow:0 6px 16px rgba(31,78,135,.3);}
.rev-leave svg{fill:#fff;}
.rev-leave:active{transform:translateY(2px);}
.rev-trust{display:flex;align-items:flex-start;gap:7px;font-size:11.5px;color:var(--muted);line-height:1.5;}
.rev-leave-m{margin:16px 0 10px;}
.rev-trust-m{margin-bottom:18px;}
.rev-list.rev-list-m{column-count:1;column-gap:0;}
.rev-filter-m{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
.rev-filter-m button{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:#3d4655;}
.rev-filter-m button svg{fill:var(--gold);}
.rev-filter-m button.on{background:var(--brand);color:#fff;border-color:var(--brand);}
.rev-filter-m button.on svg{fill:#fff;}
.rev-trust svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}
.rev-photostrip{margin-bottom:24px;}
.rev-photostrip h4{font-size:12.5px;font-weight:700;color:#515b6b;margin-bottom:10px;}
.rev-photos{display:flex;gap:10px;flex-wrap:wrap;}
.rev-photos .rev-ph{width:84px;height:84px;}
.rev-ph{border-radius:11px;display:block;cursor:pointer;border:none;}
.rev-ph.c0{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.rev-ph.c1{background:linear-gradient(150deg,var(--brand-deep),var(--gold));}
.rev-ph.c2{background:linear-gradient(150deg,#caa06f,var(--brand));}
.rev-list{column-count:2;column-gap:14px;}
.rev-list .rev-card{break-inside:avoid;margin-bottom:14px;}
.rev-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;}
.rev-card-head{display:flex;align-items:flex-start;gap:11px;}
.rev-av{width:40px;height:40px;border-radius:50%;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-weight:700;font-size:16px;display:grid;place-items:center;}
.rev-card-who{flex:1;min-width:0;}
.rev-card-who>b{font-size:14.5px;font-weight:700;display:block;}
.rev-card-who>span{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--muted);margin-top:2px;flex-wrap:wrap;}
.rev-verif{display:inline-flex;align-items:center;gap:4px;color:var(--ok);font-weight:700;}
.rev-card-stars{display:flex;gap:2px;flex:0 0 auto;}
.rev-card-stars svg{color:#e0d2cb;}
.rev-card-stars .f{color:var(--gold);fill:var(--gold);}
.rev-card-svc{display:inline-block;font-size:11px;font-weight:700;color:var(--brand-deep);background:#e8eef6;padding:3px 9px;border-radius:7px;margin:11px 0 8px;}
.rev-card-text{font-size:13.5px;line-height:1.55;color:#3d4655;}
.rev-card-photos{display:flex;gap:9px;margin-top:11px;}
.rev-card-photos .rev-ph{width:70px;height:70px;}
.rev-response{margin-top:13px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:12px 13px;}
.rev-response-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.rev-resp-av{width:24px;height:24px;border-radius:7px;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:12px;display:grid;place-items:center;}
.rev-response-head b{font-size:12.5px;font-weight:700;color:var(--brand-deep);flex:1;}
.rev-response-head span{font-size:11px;color:var(--muted);}
.rev-response p{font-size:12.5px;line-height:1.5;color:#515b6b;}
.rev-form-note{display:flex;align-items:flex-start;gap:7px;font-size:12.5px;color:#5b6575;line-height:1.5;background:#e8eef6;border:1px solid #cbd9ea;border-radius:11px;padding:11px 12px;margin-bottom:6px;}
.rev-form-note svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}
.rev-rate{display:flex;gap:6px;}
.rev-rate svg{color:#e0d2cb;}
.rev-rate .f{color:var(--gold);fill:var(--gold);}
.rev-input,.rev-textarea{width:100%;border:1px solid var(--line);border-radius:11px;padding:11px 13px;font-size:14px;color:var(--ink);background:#fdfaf8;font-family:inherit;}
.rev-input:focus,.rev-textarea:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(31,78,135,.12);}
.rev-textarea{resize:vertical;line-height:1.5;}
.rev-photo-add{margin:14px 0 4px;}
.rev-photo-btn{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--brand-deep);border:1px dashed #d8c2ba;border-radius:11px;padding:10px 14px;}
.rev-photo-chip{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:9px 12px;}
.rev-photo-chip>span{width:26px;height:26px;border-radius:7px;background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.rev-photo-chip button{display:grid;place-items:center;color:var(--muted);}
`;
