'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store,
  Search, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft, Megaphone, Truck,
  ShieldCheck, Navigation, Lock, Plus, Minus, Copy, Instagram,
  Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell, Receipt, MessageCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast as sonnerToast } from "sonner";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { calculateShippingFee } from "../../utils/shippingFee";
import { InstagramIcon, TikTokIcon } from "../../components/SocialIcons";

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

interface TechStorefrontProps {
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
  ["Fri", "9:00am - 7:00pm"],
  ["Sat", "9:00am - 8:00pm"],
  ["Sun", "Closed"],
];

const NOTIFY_TOPICS: [string, string][] = [
  ["services", "Repair offers"],
  ["products", "New stock"],
  ["offers", "Price drops"],
  ["news", "Announcements"],
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

export default function TechStorefront({
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
}: TechStorefrontProps) {
  const isDesktop = useIsDesktop();
  const router = useRouter();

  // --- Dynamic Store Stats & Open status ---
  const HOURS = useMemo(() => parseWorkingHours(store?.working_hours), [store?.working_hours]);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const hoursForDate = (d: Date) => HOURS[(d.getDay() + 6) % 7][1];
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
    const todayHrs = HOURS[todayIdx][1];
    if (todayHrs === "Closed") return false;
    const [o, c] = todayHrs.split(" - ");
    const openMin = parseClock(o), closeMin = parseClock(c);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= openMin && nowMin < closeMin;
  }, [HOURS, todayIdx]);

  // --- Map Store Info ---
  const STORE = useMemo(() => ({
    name: store.store_name,
    initial: (store.store_name || "T").charAt(0).toUpperCase(),
    slug: store.username || username,
    category: store.business_persona?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) || 'Tech & Repairs',
    location: store.location || 'Online store',
    rating: store.rating || 4.8,
    reviews: store.review_count || 0,
    orders: store.total_orders || '0',
    reply: store.reply_time_minutes ? `~${store.reply_time_minutes} min` : '~10 min',
    bio: store.store_bio || 'Quality gadgets and device repairs.',
    address: store.address || 'Computer Village, Ikeja, Lagos',
    phone: store.whatsapp_phone,
    email: store.email || `${store.username || 'support'}@frontstore.ng`,
    socials: { instagram: store.instagram_handle || '', tiktok: store.tiktok_handle || '' },
    primaryCta: store.announcement_cta_label ? 'book' : 'shop'
  }), [store, username]);

  // --- Classification ---
  const displayItems = useMemo(() => {
    if (products && products.length > 0) {
      return products.map(p => {
        // Classify as service if type is 'service' or name/desc contains keywords
        const isService = p.type === 'service' || 
          (p.name || '').toLowerCase().includes('repair') || 
          (p.name || '').toLowerCase().includes('replacement') || 
          (p.name || '').toLowerCase().includes('diagnostics') || 
          (p.name || '').toLowerCase().includes('setup') || 
          (p.name || '').toLowerCase().includes('recovery') || 
          (p.description || '').toLowerCase().includes('repair');
        const catObj = categories.find(c => c.id === p.category_id);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: isService ? 'service' as const : 'product' as const,
          cat: catObj ? catObj.name : 'Gadgets',
          price: parseFloat(p.price),
          compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
          dur: p.duration_minutes ? `${p.duration_minutes} min` : '60 min',
          durMin: p.duration_minutes || 60,
          stock: p.stock_status === 'in_stock' ? 'in' as const : (p.stock_status === 'low_stock' ? 'low' as const : 'out' as const),
          stock_status: p.stock_status,
          desc: p.description || '',
          popular: p.compare_at_price ? true : false,
          image_url: p.image_urls?.[0] || null,
          image_urls: p.image_urls || null,
        };
      });
    }
    return [];
  }, [products, categories]);

  // Fallback items in case store has no categories/products yet
  const SERVICES_PRESETS = [
    { id: "s1", name: "Phone Screen Replacement", price: 25000, dur: "60 min", durMin: 60, cat: "Repairs", popular: true, desc: "Cracked or dead screen replaced with a quality part, tested before you leave. Most done same day." },
    { id: "s2", name: "Battery Replacement", price: 15000, dur: "45 min", durMin: 45, cat: "Repairs", popular: true, desc: "A tired battery swapped for a fresh one, with a full health check on the device." },
    { id: "s3", name: "Water Damage Diagnostics", price: 10000, dur: "90 min", durMin: 90, cat: "Diagnostics", desc: "Full assessment and internal clean, with a clear repair quote before any work starts." },
    { id: "s4", name: "Laptop Tune-up and Cleanup", price: 12000, dur: "60 min", durMin: 60, cat: "Repairs", desc: "Speed it up, clean it out, clear junk and update it so it runs like new again." },
    { id: "s5", name: "Data Recovery", price: 30000, dur: "2 to 3 days", durMin: 180, cat: "Diagnostics", popular: true, desc: "Recover photos, contacts and files from a damaged phone, drive or memory card." },
    { id: "s6", name: "Device Setup and Transfer", price: 8000, dur: "45 min", durMin: 45, cat: "Setup", desc: "A new device set up properly and all your data moved across safely." },
  ];

  const PRODUCTS_PRESETS = [
    { id: "p1", name: "iPhone 13, Refurbished", price: 320000, cat: "Phones", popular: true, colours: [{ n: "Midnight", h: "#1c1c2e" }, { n: "Starlight", h: "#efe9dd" }, { n: "Blue", h: "#2f5a8a" }], caps: ["128GB", "256GB"], soldCaps: [], condition: "Certified refurbished", warranty: "12 month warranty", box: "Phone, cable and SIM tool", desc: "Fully tested and certified refurbished, graded excellent, ready to go with warranty." },
    { id: "p2", name: "Anker 20000mAh Power Bank", price: 22000, cat: "Power", popular: true, colours: [{ n: "Black", h: "#1d1d1f" }, { n: "White", h: "#eceae4" }], caps: [], condition: "Brand new", warranty: "12 month warranty", box: "Power bank and charging cable", desc: "Fast charging with two output ports, enough to refill a phone four times over." },
    { id: "p3", name: "Wireless Noise Cancelling Earbuds", price: 28000, cat: "Audio", colours: [{ n: "Black", h: "#1d1d1f" }, { n: "White", h: "#eceae4" }], caps: [], condition: "Brand new", warranty: "6 month warranty", box: "Earbuds, case, tips and cable", desc: "Clear, balanced sound with active noise cancelling and a long battery life." },
    { id: "p4", name: "USB-C 30W Fast Charger", price: 9000, cat: "Power", colours: [{ n: "White", h: "#eceae4" }, { n: "Black", h: "#1d1d1f" }], caps: [], condition: "Brand new", warranty: "12 month warranty", box: "Charger only", desc: "Compact, safe and quick. Charges most phones and tablets at full speed." },
    { id: "p5", name: "Bluetooth Mechanical Keyboard", price: 35000, cat: "Accessories", colours: [{ n: "Black", h: "#1d1d1f" }, { n: "Grey", h: "#8a8a8f" }], caps: [], condition: "Brand new", warranty: "12 month warranty", box: "Keyboard, cable and keycap puller", desc: "Tactile, rechargeable and pairs with up to three devices at once." },
    { id: "p6", name: "Portable SSD", price: 65000, cat: "Storage", popular: true, colours: [{ n: "Black", h: "#1d1d1f" }, { n: "Silver", h: "#cfd2d6" }], caps: ["512GB", "1TB"], soldCaps: [], condition: "Brand new", warranty: "24 month warranty", box: "SSD and USB-C cable", desc: "Pocket sized and fast, perfect for backups and moving big files in seconds." },
  ];

  const SERVICES = useMemo(() => {
    const list = displayItems.filter(i => i.type === 'service');
    return list;
  }, [displayItems]);

  const PRODUCTS = useMemo(() => {
    const list = displayItems.filter(i => i.type === 'product');
    return list;
  }, [displayItems]);

  // --- Dynamic Author (Founder) details ---
  const AUTHOR = useMemo(() => ({
    name: store.founder_name || "",
    initial: (store.founder_name || store.store_name || "S").split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    role: store.founder_role || "",
    bio: store.founder_bio || "",
    long: store.founder_bio || "",
    quote: store.founder_quote || "",
    specialities: store.founder_specialities || [],
    socials: store.founder_socials || {},
    credentials: store.founder_credentials || [],
  }), [store]);

  const RECOGNITION = useMemo(() => store.recognition || [], [store]);
  const ABOUT_FACTS = useMemo(() => store.about_facts || [], [store]);

  // --- Dynamic Reviews ---
  const REVIEWS_PRESETS = [
    { id: "r1", name: "Chinedu A.", r: 5, when: "4 days ago", service: "Phone Screen Replacement", verified: true, photos: 1, text: "Screen done in under an hour and looks factory fresh. Fair price too.", response: { when: "3 days ago", text: "Thanks Chinedu, enjoy the phone and shout if anything comes up." } },
    { id: "r2", name: "Halima B.", r: 5, when: "2 weeks ago", service: "iPhone 13, Refurbished", verified: true, photos: 2, text: "Refurb phone looks brand new and came with a real warranty. Very happy." },
    { id: "r3", name: "Seyi O.", r: 4, when: "3 weeks ago", service: "Battery Replacement", verified: true, photos: 0, text: "Battery life is back to normal. Took a little longer than quoted but solid work.", response: { when: "3 weeks ago", text: "Appreciate the patience Seyi, we were waiting on the genuine part." } },
    { id: "r4", name: "Ifeoma N.", r: 5, when: "1 month ago", service: "Data Recovery", verified: true, photos: 1, text: "I thought my photos were gone for good. They recovered almost everything. Lifesavers." },
    { id: "r5", name: "Tobi M.", r: 3, when: "1 month ago", service: "Anker 20000mAh Power Bank", verified: true, photos: 0, text: "Power bank is great, delivery to the mainland took two days though." },
    { id: "r6", name: "Grace E.", r: 5, when: "2 months ago", service: "Laptop Tune-up and Cleanup", verified: true, photos: 1, text: "My old laptop boots in seconds now. Honest advice, no upselling." },
  ];
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
  const FAQ_GROUPS = [
    {
      cat: "Repairs and bookings", icon: Calendar, items: [
        ["How do repairs work?", "Book a repair slot or drop your device at the counter. We diagnose it, confirm the price before any work, then fix and test it. Most common repairs are same day."],
        ["Do repairs come with a warranty?", "Yes. Most repairs carry a warranty on both the part and the work, and the exact cover is shown on your receipt."],
        ["How do I reschedule or cancel a booking?", "Reschedule or cancel up to 24 hours before your slot for a full deposit refund. Inside 24 hours the deposit is held against the booking."],
        ["What if my device cannot be fixed?", "We tell you straight if a repair is not worth it, and any diagnostic fee can be set against a refurbished replacement."],
      ],
    },
    {
      cat: "Payments", icon: Lock, items: [
        ["How do I pay?", "You can pay securely through Frontstore at checkout, or by bank transfer directly to the shop. Frontstore checkout is the safer option as it comes with buyer protection."],
        ["Is paying through Frontstore safe?", "Yes. Payments made through Frontstore are protected, so if an order does not arrive as described you can raise a dispute and we help mediate. This protection cannot be removed by the shop."],
        ["What currency are prices in?", "Prices are shown in Nigerian naira. Any approximate conversion shown elsewhere is indicative only, and you are always charged in naira."],
      ],
    },
    {
      cat: "Delivery and pickup", icon: Truck, items: [
        ["Do you deliver, and where?", "We deliver across Lagos and nationwide. Delivery is arranged after checkout and the fee depends on your location."],
        ["How long does delivery take?", "Within Lagos, orders usually arrive in one to two working days. Nationwide delivery typically takes two to five working days."],
        ["Can I pick up my order or device myself?", "Yes. Free pickup is available from our counter in Computer Village, Ikeja once your order or repair is ready, which we confirm on WhatsApp."],
      ],
    },
    {
      cat: "Gadgets and warranty", icon: ShoppingBag, items: [
        ["What condition are your gadgets in?", "We sell brand new items and certified refurbished devices. Refurbished units are fully tested, graded and clearly labelled, so you always know what you are buying."],
        ["What warranty do I get?", "New and refurbished devices come with a warranty, shown on each listing and on your receipt. Faults covered by warranty are repaired or replaced free."],
        ["Can I return a gadget?", "Unopened, unused items can be returned within 7 days. Anything faulty is covered by its warranty. Full detail is on the Refunds page."],
      ],
    },
    {
      cat: "Trust and Frontstore", icon: ShieldCheck, items: [
        ["What does Secured by Frontstore mean?", "It means this shop runs on Frontstore, so your order is covered by Frontstore buyer protection and platform terms that the shop cannot remove."],
        ["Are the reviews real?", "Yes. Reviews can only be left by customers with a completed Frontstore order, and each one is shown with a verified badge. The shop can respond to reviews but cannot delete genuine ones."],
        ["What if something goes wrong with my order?", "If an order paid through Frontstore does not arrive as described, you can raise a dispute and Frontstore will help mediate a fair resolution."],
      ],
    },
  ];

  const displayFaqs = useMemo(() => {
    if (faqs && faqs.length > 0) {
      return [
        {
          cat: "General FAQs",
          icon: Lock,
          items: faqs.map(f => [f.question, f.answer])
        }
      ];
    }
    return [];
  }, [faqs]);

  // --- Dynamic Portfolio & Blog ---
  const displayPortfolio = useMemo(() => {
    return (portfolio || []).map(p => ({
      label: p.label || p.title || "Portfolio Item",
      cat: p.category || "Portfolio",
      c: p.image_url ? "" : "c0",
      image_url: p.image_url || null
    }));
  }, [portfolio]);

  const BLOG_PRESETS = [
    { title: "Phone screen cracked? Read this first", date: "6 Jun 2026", cat: "Repairs", read: "4 min", excerpt: "What to do, and what not to do, between the crack and the repair.", body: [
      { p: "A cracked screen is rarely the end of a phone, but the next few hours matter. Here is how to protect it and what to expect from the fix." },
      { h: "Do this now" },
      { list: ["Power it down if the glass is shattering or lifting", "Cover the crack with clear tape to stop it spreading", "Back up your data while the screen still responds", "Avoid pressing hard or using it in wet hands"] },
      { h: "What the repair involves" },
      { p: "We assess the glass and the display underneath, confirm the price before any work, then fit a quality screen and test the touch, brightness and front camera before you leave. Most screens are done the same day." },
    ] },
    { title: "How to tell if you need a new battery", date: "23 May 2026", cat: "Repairs", read: "3 min", excerpt: "The signs that your battery, not your phone, is the problem.", body: [
      { p: "Before you replace a whole phone, it is often just the battery that is tired. These are the signs we look for." },
      { list: ["It dies suddenly or jumps from 30 percent to off", "It gets hot while charging or sitting idle", "It only lasts half a day on a full charge", "The phone feels slow until it is plugged in"] },
      { p: "A health check tells us for sure. If it is the battery, a swap brings the phone back to a full day of use for a fraction of a new device." },
    ] },
    { title: "New or refurbished, which should you buy?", date: "10 May 2026", cat: "Buying", read: "4 min", excerpt: "How to choose between a brand new device and a certified refurbished one.", body: [
      { p: "Refurbished does not mean second best. For many people it is the smarter buy. Here is how we think about it." },
      { h: "Go refurbished when" },
      { list: ["You want flagship features for a mid range price", "You are comfortable with light, graded cosmetic wear", "You value a warranty over a sealed box"] },
      { h: "Go new when" },
      { p: "You want the very latest model, a sealed box, and the longest possible software support. Either way, everything we sell is tested and warrantied, so you are never taking a gamble." },
    ] },
  ];

  const displayBlog = useMemo(() => {
    return (blog || []).map(b => ({
      title: b.title,
      date: b.published_at ? new Date(b.published_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently",
      cat: b.category || "Updates",
      read: b.read_time || "4 min",
      excerpt: b.excerpt || "",
      body: Array.isArray(b.body) ? b.body : [],
      image_url: b.image_url || null,
      is_pseo: !!b.is_pseo,
    }));
  }, [blog]);

  // --- States ---
  const [page, setPage] = useState("home");
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  
  // Booking Slots Flow
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
  const [apiSlots, setApiSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Notify Updates
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyTopics, setNotifyTopics] = useState(["services", "products", "offers", "news"]);

  // Cart / Checkout States
  const [bagOpen, setBagOpen] = useState(false);
  const [bag, setBag] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  // Filters & General UI
  const [selProduct, setSelProduct] = useState<any>(null);
  const [selColour, setSelColour] = useState<string | null>(null);
  const [selCap, setSelCap] = useState<string | null>(null);
  const [share, setShare] = useState(false);
  const [annOff, setAnnOff] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [svcFaq, setSvcFaq] = useState(0);
  const [prodFaq, setProdFaq] = useState(0);
  const [faqQuery, setFaqQuery] = useState("");
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);

  // Contact States
  const [cName, setCName] = useState("");
  const [cMsg, setCMsg] = useState("");
  const [cSvc, setCSvc] = useState("");
  const [cDate, setCDate] = useState("");

  // Section Filtering
  const [svcQuery, setSvcQuery] = useState("");
  const [svcCat, setSvcCat] = useState("All");
  const [svcDur, setSvcDur] = useState("All");
  const [svcSort, setSvcSort] = useState("popular");
  const [prodQuery, setProdQuery] = useState("");
  const [prodCat, setProdCat] = useState("All");
  const [prodPrice, setProdPrice] = useState("All");
  const [prodSort, setProdSort] = useState("popular");
  const [blogCat, setBlogCat] = useState("All");
  const [pfCat, setPfCat] = useState("All");
  const [post, setPost] = useState<any>(null);

  // Review states
  const [reviewOpen, setReviewOpen] = useState(false);
  const [revRating, setRevRating] = useState(0);
  const [revText, setRevText] = useState("");
  const [revRef, setRevRef] = useState("");
  const [revPhoto, setRevPhoto] = useState<string | null>(null);
  const [revStar, setRevStar] = useState(0);
  const [revSort, setRevSort] = useState("recent");
  const [revPhotos, setRevPhotos] = useState(false);

  const currencySymbol = useMemo(() => {
    const symbols: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$', EUR: '€', GBP: '£' };
    return symbols[store.currency_code] || `${store.currency_code} `;
  }, [store.currency_code]);
  
  const money = (n: number) => currencySymbol + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const ping = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };
  const go = (p: string) => { setPost(null); setSelProduct(null); setPage(p); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPost = (p: any) => { setPost(p); setPage("post"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openProduct = (p: any) => { setSelProduct(p); setSelColour(p.colours && p.colours[0] ? p.colours[0].n : null); setSelCap(null); setPage("product"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  
  const copyUrl = () => {
    const link = `${window.location.origin}/${STORE.slug}`;
    navigator.clipboard?.writeText(link);
    ping("Store link copied");
  };

  // Persistent Cart Loading
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`frontstore_cart_${STORE.slug}`);
      if (saved) {
        setBag(JSON.parse(saved));
      }
    } catch {}
  }, [STORE.slug]);

  // Load Saved Client Profile
  useEffect(() => {
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
    } catch {}
  }, []);

  const saveCartToStorage = (newBag: CartItem[]) => {
    try {
      localStorage.setItem(`frontstore_cart_${STORE.slug}`, JSON.stringify(newBag));
    } catch {}
  };

  const addToBag = (p: any, cap: string | null, colour: string | null) => {
    const c = cap || "One size";
    const cl = colour || "Default";
    const key = `${p.id}|${c}|${cl}`;
    setBag((prev) => {
      const ex = prev.find((x) => x.key === key);
      let nextBag;
      if (ex) {
        nextBag = prev.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x));
      } else {
        nextBag = [...prev, {
          key,
          id: p.id,
          name: p.name,
          price: p.price,
          qty: 1,
          type: "product" as const,
          image_url: p.image_url || undefined,
          slot: `${cl} / ${c}`
        }];
      }
      saveCartToStorage(nextBag);
      return nextBag;
    });
    ping("Added to your bag");
  };

  const setQty = (key: string, d: number) => {
    setBag((prev) => {
      const next = prev.map((x) => (x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x));
      saveCartToStorage(next);
      return next;
    });
  };

  const removeItem = (key: string) => {
    setBag((prev) => {
      const next = prev.filter((x) => x.key !== key);
      saveCartToStorage(next);
      return next;
    });
  };

  const handleWa = (msg: string) => {
    if (!STORE.phone) return;
    setPendingWaUrl(`https://wa.me/${STORE.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
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
    fetch(`${API_URL}/v1/public/store/${STORE.slug}/slots?product_id=${bookSvc.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          setApiSlots(json.data);
        }
      })
      .catch(err => console.error("Error fetching slots:", err))
      .finally(() => setLoadingSlots(false));
  }, [bookSvc, STORE.slug]);

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
        duration: bookSvc.durMin,
        image_url: bookSvc.image_url || undefined
      }];
      saveCartToStorage(nextBag);
      return nextBag;
    });

    setBookOpen(false);
    ping("Slot added to order");
  };

  // Submit checkout order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      ping('Name and WhatsApp number are required.');
      return;
    }
    setCheckoutLoading(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api').replace(/\/+$/, '');
    
    // Submit slots bookings first
    const bookingItems = bag.filter(x => x.type === 'service' && x.slotId);
    for (const bItem of bookingItems) {
      try {
        await fetch(`${API_URL}/v1/public/store/${STORE.slug}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot_id: bItem.slotId,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail || undefined,
            notes: `Delivery preference: ${deliveryMethod} | Notes: ${orderNote}`
          })
        });
      } catch (err) {
        console.error("Booking submission error:", err);
      }
    }

    try {
      const res = await fetch(`${API_URL}/v1/public/store/${STORE.slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          customer_whatsapp: customerWhatsapp || customerPhone,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === 'delivery' ? (deliveryAddress || 'None specified') : 'Store Pickup',
          notes: orderNote,
          items: bag.map(item => ({
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
          email: customerEmail || null,
          preferred_delivery_method: deliveryMethod,
          preferred_delivery_address: deliveryAddress || null,
        }));
      } catch {}

      setBag([]);
      saveCartToStorage([]);
      setOrderReceipt(json.data);
      setCheckoutStep('success');
      ping('Order created successfully!');
    } catch (err: any) {
      ping(err.message || 'Something went wrong. Please try again.');
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
      if (!res.ok) throw new Error(json.message || 'Payment initialization failed.');
      const redirectUrl = json.data?.authorization_url || json.data?.checkout_url || json.data?.link;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('Payment link is currently unavailable.');
      }
    } catch (err: any) {
      ping(err.message || 'Failed to initialize payment.');
    } finally {
      setIsPaying(false);
    }
  };

  const bagCount = bag.reduce((n, b) => n + b.qty, 0);
  const subtotal = bag.reduce((n, b) => n + b.price * b.qty, 0);
  const shippingPreview = calculateShippingFee(store, subtotal);

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

    const isDateEnabled = (c: Date) => {
      if (c < today || c > horizon) return false;
      const dateStr = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`;
      if (apiSlots.length > 0) {
        return apiSlots.some(s => s.slot_date === dateStr && !s.is_full);
      }
      return hoursForDate(c) !== "Closed";
    };

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
      for (let t = open; t <= close - bookSvc.durMin; t += 60) out.push(fmtMins(t));
      return out;
    })();

    const svcBar = bookSvc && (
      <div className="bk-svcbar">
        <span><b>{bookSvc.name}</b><i>{bookSvc.dur} <span className="ps-dot">•</span> {money(bookSvc.price)}</i></span>
        <button onClick={() => setBookStep("service")}>Change</button>
      </div>
    );

    return (
      <Sheet onClose={() => setBookOpen(false)} onBack={onBack} title={titles[bookStep]}>
        {bookStep === "service" && (<>
          <p className="ps-sheet-sub">Pick the repair you would like to book.</p>
          <div className="bk-svclist">
            {SERVICES.map((s) => (
              <button key={s.id} className="bk-svc" onClick={() => { setBookSvc(s); setBookStep("date"); }}>
                <span className={`bk-thumb ${catColor(s.cat)}`}><Calendar size={18} /></span>
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
            <div className="bk-cal-wd">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => <span key={w}>{w}</span>)}</div>
            <div className="bk-cal-grid">
              {cells.map((c, i) => {
                if (!c) return <span key={"b" + i} className="bk-cal-blank" />;
                const disabled = !isDateEnabled(c);
                const sel = bookDate ? (c.getDate() === bookDate.getDate() && c.getMonth() === bookDate.getMonth()) : false;
                return (
                  <button key={i} disabled={disabled} className={`bk-cal-day${sel ? " sel" : ""}${disabled ? " off" : ""}`}
                    onClick={() => { if (!disabled) { setBookDate(c); setBookTime(null); setBookStep("time"); } }}>{c.getDate()}</button>
                );
              })}
            </div>
            <p className="ps-deposit"><Lock size={12} /> Closed days and past dates cannot be selected. You can book up to three months ahead.</p>
          </div>
        </>)}

        {bookStep === "time" && (<>
          {svcBar}
          <p className="ps-field-lbl">{bookDate ? bookDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : ""}</p>
          {loadingSlots ? (
            <p className="bk-empty">Loading free slots...</p>
          ) : slots.length > 0 ? (
            <div className="bk-times">
              {slots.map((t) => {
                return <button key={t} className="bk-slot"
                  onClick={() => { setBookTime(t); setBookStep("review"); }}>{t}</button>;
              })}
            </div>
          ) : <p className="bk-empty">No times available on this day. Try another date.</p>}
        </>)}

        {bookStep === "review" && (<>
          {svcBar}
          <div className="bk-summary">
            <div><span>Date</span><b>{bookDate ? bookDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : ""}</b></div>
            <div><span>Time</span><b>{bookTime}</b></div>
            <div><span>Duration</span><b>{bookSvc.dur}</b></div>
            <div><span>Total</span><b>{money(bookSvc.price)}</b></div>
          </div>
          <p className="ps-field-lbl">Your name</p>
          <input className="bk-input" value={bookName} onChange={(e) => setBookName(e.target.value)} placeholder="Name on the booking" />
          <p className="ps-field-lbl">Anything we should know? (optional)</p>
          <textarea className="bk-input bk-textarea" value={bookNote} onChange={(e) => setBookNote(e.target.value)} placeholder="Warranty questions, device models, serial numbers, specs" />
          <div className="bk-deposit-row"><span><Lock size={13} /> Deposit to secure</span><b>{money(deposit)}</b></div>
          <p className="ps-deposit">Frontstore holds your deposit until your appointment, then the {money(bookSvc.price - deposit)} balance is due in person. Covered by buyer protection.</p>
          <button className="ps-sheet-cta" disabled={!bookName.trim()} onClick={confirmBooking}>Add slot to order</button>
        </>)}
      </Sheet>
    );
  };

  const svcCats = [...new Set(SERVICES.map((s) => s.cat))];
  const durTest = (m: number) => svcDur === "All" || (svcDur === "short" && m < 60) || (svcDur === "mid" && m >= 60 && m <= 120) || (svcDur === "long" && m > 120);
  const svcFiltered = SERVICES
    .filter((s) => (svcCat === "All" || s.cat === svcCat) && durTest(s.durMin) &&
      (svcQuery.trim() === "" || (s.name + " " + s.desc + " " + s.cat).toLowerCase().includes(svcQuery.trim().toLowerCase())))
    .sort((a, b) => (svcSort === "priceAsc" ? a.price - b.price : svcSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const svcHasFilters = svcCat !== "All" || svcDur !== "All" || svcQuery.trim() !== "";
  const clearSvc = () => { setSvcQuery(""); setSvcCat("All"); setSvcDur("All"); setSvcSort("popular"); };
  const catColor = (cat: string) => "c" + (svcCats.indexOf(cat) % 4);
  const prodCats = [...new Set(PRODUCTS.map((p) => p.cat))];
  const priceTest = (price: number) => prodPrice === "All" || (prodPrice === "lo" && price < 10000) || (prodPrice === "mid" && price >= 10000 && price <= 25000) || (prodPrice === "hi" && price > 25000);
  const prodFiltered = PRODUCTS
    .filter((p) => (prodCat === "All" || p.cat === prodCat) && priceTest(p.price) &&
      (prodQuery.trim() === "" || (p.name + " " + p.desc + " " + p.cat).toLowerCase().includes(prodQuery.trim().toLowerCase())))
    .sort((a, b) => (prodSort === "priceAsc" ? a.price - b.price : prodSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const prodHasFilters = prodCat !== "All" || prodPrice !== "All" || prodQuery.trim() !== "";
  const clearProd = () => { setProdQuery(""); setProdCat("All"); setProdPrice("All"); setProdSort("popular"); };
  const prodColor = (cat: string) => "c" + (prodCats.indexOf(cat) % 4);
  const blogCats = [...new Set(displayBlog.map((b) => b.cat))];
  const blogList = blogCat === "All" ? displayBlog : displayBlog.filter((b) => b.cat === blogCat);
  const pfCats = [...new Set(displayPortfolio.map((p) => p.cat))];
  const pfList = pfCat === "All" ? displayPortfolio : displayPortfolio.filter((p) => p.cat === pfCat);
  const faqId = (c: string) => "faq-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const termId = (c: string) => "tm-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  const faqQ = faqQuery.trim().toLowerCase();
  const faqFiltered = displayFaqs
    .map((g) => ({ ...g, items: faqQ ? g.items.filter(([q, a]) => (q + " " + a).toLowerCase().includes(faqQ)) : g.items }))
    .filter((g) => g.items.length > 0);
  const REV_DIST = [[5, 80], [4, 14], [3, 3], [2, 2], [1, 1]];
  const revFiltered = displayReviews
    .filter((rv) => (revStar === 0 || rv.r === revStar) && (!revPhotos || rv.photos > 0))
    .sort((a, b) => (revSort === "high" ? b.r - a.r : revSort === "low" ? a.r - b.r : 0));
  const revPhotoTiles = displayReviews.filter((rv) => rv.photos > 0).flatMap((rv) => Array.from({ length: rv.photos }).map((_, i) => rv.id + i)).slice(0, 8);
  
  const submitReview = () => {
    if (!revRating || !revRef.trim()) { ping("Add a rating and your order reference"); return; }
    setReviewOpen(false); setRevRating(0); setRevText(""); setRevRef(""); setRevPhoto(null);
    ping("Thank you, your review has been submitted");
  };

  const featSvcIds = useMemo(() => [SERVICES[0]?.id].filter(Boolean), [SERVICES]);
  const featProdIds = useMemo(() => [PRODUCTS[0]?.id, PRODUCTS[1]?.id].filter(Boolean), [PRODUCTS]);
  const homeServices = useMemo(() => SERVICES.filter((s) => !featSvcIds.includes(s.id)), [SERVICES, featSvcIds]);
  const homeProducts = useMemo(() => PRODUCTS.filter((p) => !featProdIds.includes(p.id)), [PRODUCTS, featProdIds]);

  const NAV = useMemo(() => {
    return [
      ["home", "Home"],
      ["services", "Repairs"],
      ["products", "Gadgets"],
      ["portfolio", "Portfolio"],
      ["reviews", "Reviews"],
      ["blog", "Blog"],
      ["about", "About"],
      ["faq", "FAQ"],
      ["contact", "Contact"],
    ].filter(([id]) => {
      if (id === 'home') return true;
      return (store.storefront_sections || []).includes(id);
    });
  }, [store.storefront_sections]);

  const EmptyState = () => (
    <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
      Nothing to see here, comeback later
    </div>
  );

  const LEGAL = [["returns", "Refunds"], ["terms", "Terms"], ["privacy", "Privacy"]];

  const servicesGrid = (g: string, list?: any[]) => (
    <div className={g}>{(list || SERVICES).map((s) => <ServiceCard key={s.id} s={s} onBook={() => openBooking(s)} />)}</div>
  );
  const productsGrid = (g: string, list?: any[]) => (
    <div className={g}>{(list || PRODUCTS).map((p) => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />)}</div>
  );

  const productView = () => {
    const p = selProduct;
    if (!p) return null;
    const colours = p.colours || [];
    const caps = p.caps || [];
    const colour = colours.find((c: any) => c.n === selColour) || colours[0];
    const needCap = caps.length > 0 && !selCap;
    const g = prodColor(p.cat);
    const idx = prodCats.indexOf(p.cat);
    const more = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3);
    return (
      <div className="pv">
        <button className="pv-back" onClick={() => go("products")}><ChevronLeft size={16} /> Back to gadgets</button>
        <div className="pv-grid">
          <div className="pv-gallery">
            <div className={`pv-main ${g}`} style={colour ? { borderColor: colour.h } : undefined}>
              {p.popular && <span className="pv-tag"><Star size={11} /> Best seller</span>}
              <span className="pv-cat">{p.cat}</span>
              <ShoppingBag className="pv-main-icn" size={40} />
            </div>
            <div className="pv-thumbs">{[0, 1, 2].map((i) => <span key={i} className={`pv-thumb c${(idx + i) % 4}`} />)}</div>
          </div>
          <div className="pv-info">
            <span className="pv-infocat">{p.cat}{p.condition ? "  ·  " + p.condition : ""}</span>
            <h1 className="pv-name">{p.name}</h1>
            <div className="pv-price">{money(p.price)}</div>
            <p className="pv-desc">{p.desc}</p>

            {colours.length > 0 && (<>
              <div className="pv-row"><span className="pv-label">Colour</span><span className="pv-colourname">{colour ? colour.n : ""}</span></div>
              <div className="pv-swatches">{colours.map((c: any) => <button key={c.n} className={`pv-swatch ${selColour === c.n ? "on" : ""}`} style={{ background: c.h }} onClick={() => setSelColour(c.n)} aria-label={c.n}>{selColour === c.n && <Check size={14} />}</button>)}</div>
            </>)}

            {caps.length > 0 && (<>
              <div className="pv-row"><span className="pv-label">Storage</span></div>
              <div className="pv-sizes">{caps.map((c: any) => { const out = (p.soldCaps || []).includes(c); return <button key={c} disabled={out} className={`pv-size ${selCap === c ? "on" : ""} ${out ? "out" : ""}`} onClick={() => !out && setSelCap(c)}>{c}</button>; })}</div>
            </>)}

            <button className="ps-sheet-cta pv-add" disabled={needCap || p.stock_status === 'out_of_stock'} onClick={() => addToBag(p, selCap, colour ? colour.n : "One size")}><ShoppingBag size={17} /> {needCap ? "Select storage" : p.stock_status === 'out_of_stock' ? "Out of Stock" : "Add to bag"}</button>

            <div className="pv-meta">
              {p.warranty && <div className="pv-meta-line"><Award size={15} /><span>{p.warranty}</span></div>}
              {p.box && <div className="pv-meta-line"><Package size={15} /><span>In the box: {p.box}</span></div>}
              <div className="pv-meta-line"><ShieldCheck size={15} /><span>Secured by Frontstore buyer protection</span></div>
            </div>
          </div>
        </div>
        {more.length > 0 && (
          <div className="pv-more">
            <div className="pd-sec-head"><h2>Similar gadgets</h2></div>
            {productsGrid("ps-grid", more)}
          </div>
        )}
      </div>
    );
  };

  const articleView = () => {
    if (!post) return null;
    const more = displayBlog.filter((b) => b.title !== post.title).slice(0, 2);
    return (
      <div className="ar">
        <button className="pv-back" onClick={() => go("blog")}><ChevronLeft size={16} /> Back to blog</button>
        <span className="ar-cat">{post.cat}  ·  {post.read} read</span>
        <h1 className="ar-title">{post.title}</h1>
        <span className="ar-date">By {post.is_pseo ? STORE.name : (store.founder_name || STORE.name)} · {post.date}</span>
        <div className="ar-body">
          {post.body.map((b: any, i: number) => {
            if (b.h) return <h3 key={i}>{b.h}</h3>;
            if (b.list) return <ul key={i}>{b.list.map((li: string) => <li key={li}><Check size={14} /> {li}</li>)}</ul>;
            return <p key={i}>{b.p}</p>;
          })}
        </div>
        <div className="blog-convert">
          <b>Need dynamic support?</b>
          <p>We fix screen, battery and liquid damage on most smartphones and laptops, often the same day.</p>
          <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a repair</button>
          <button className="blog-convert-ghost" onClick={() => go("services")}>See services</button>
        </div>
        {more.length > 0 && (
          <div className="ar-more">
            <div className="pd-sec-head"><h2>More guides</h2></div>
            <div className="ps-grid blog">{more.map((b, i) => <BlogCard key={i} b={b} colour={catColor(b.cat)} onOpen={openPost} />)}</div>
          </div>
        )}
      </div>
    );
  };

  const portfolioBody = () => (
    <div className="pf-wrap">
      <div className="pf-filter">
        <button className={pfCat === "All" ? "on" : ""} onClick={() => setPfCat("All")}>All work</button>
        {pfCats.map((c) => <button key={c} className={pfCat === c ? "on" : ""} onClick={() => setPfCat(c)}>{c}</button>)}
      </div>
      {pfList.length > 0 ? (
        <div className="pf-grid">{pfList.map((p, i) => (
          <button key={i} className={`pf-card ${p.c || ''}`} onClick={() => ping("Opening work details")} aria-label={p.label}>
            <span className="pf-card-cat">{p.cat}</span>
            <span className="pf-card-name">{p.label}</span>
          </button>
        ))}</div>
      ) : <div className="svc-empty">No work pieces found.</div>}
    </div>
  );

  const reviewsBody = () => (<>
    <p className="svc-intro">Every review here comes from a verified order on Frontstore. The shop can respond, but cannot delete genuine reviews.</p>
    <RatingSummary />
    <button className="rev-leave rev-leave-m" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
    <div className="rev-trust rev-trust-m">
      <ShieldCheck size={14} /> Reviews are from verified orders.
      {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && ` The shop typically responds in ${STORE.reply}.`}
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
    {revFiltered.length > 0 ? (
      <div className="rev-list rev-list-m">{revFiltered.map((rv) => <ReviewCardRich key={rv.id} rv={rv} />)}</div>
    ) : <div className="svc-empty">No reviews match your filters.<button onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button></div>}
  </>);

  const aboutFounderBody = () => (<>
    <span className="ab-kicker">Meet the founder</span>
    <h3 className="ab-name">{AUTHOR.name}</h3>
    <span className="ab-role">{AUTHOR.role}</span>
    <span className="ab-verified"><BadgeCheck size={14} /> Verified by Frontstore</span>
    <p className="ab-bio">{AUTHOR.long}</p>
    <div className="ab-chips">{AUTHOR.specialities.map((s: string) => <span key={s}>{s}</span>)}</div>
    <div className="ab-creds">
      <span className="ab-creds-h">Training and credentials</span>
      <ul>{AUTHOR.credentials.map((c: string) => <li key={c}><Check size={14} /> {c}</li>)}</ul>
    </div>
    <p className="ab-quote">{AUTHOR.quote}</p>
    <div className="ab-socials">
      {AUTHOR.socials.instagram && <button onClick={() => handleWa(`Hi, visiting from your website socials.`)}><Instagram size={16} /> {AUTHOR.socials.instagram}</button>}
      {AUTHOR.socials.tiktok && <button onClick={() => handleWa(`Hi, visiting from your website socials.`)}><TikTokIcon size={16} /> {AUTHOR.socials.tiktok}</button>}
    </div>
  </>);

  const aboutWork = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">Our work</h4>
        <button className="ab-seclink" onClick={() => go("portfolio")}>See more <ChevronRight size={14} /></button>
      </div>
      <div className="ab-gallery">
        {displayPortfolio.slice(0, 3).map((g, i) => (
          <button key={i} className={`ab-shot ${g.c}`} onClick={() => go("portfolio")}>
            <b>{g.label}</b>
            <span>{g.cat}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const aboutBody = () => (
    <div className="ab-wrap">
      <p className="svc-intro">{STORE.bio}</p>
      <div className="ab-founder">{aboutFounderBody()}</div>
      {displayPortfolio.length > 0 && aboutWork()}
      <div className="ab-section">
        <h4 className="ab-subhead">Facts about the shop</h4>
        <ul className="ab-facts">{ABOUT_FACTS.map(([lbl, val]: [string, string]) => <li key={lbl}><span>{lbl}</span><b>{val}</b></li>)}</ul>
      </div>
      <div className="ab-section">
        <h4 className="ab-subhead">Recognition</h4>
        <div className="ab-rec-list">{RECOGNITION.map((r: string) => <span key={r} className="ab-rec">{r}</span>)}</div>
      </div>
    </div>
  );

  const blogBody = () => (
    <div className="bl-wrap">
      <div className="bl-filter">
        <button className={blogCat === "All" ? "on" : ""} onClick={() => setBlogCat("All")}>All articles</button>
        {blogCats.map((c) => <button key={c} className={blogCat === c ? "on" : ""} onClick={() => setBlogCat(c)}>{c}</button>)}
      </div>
      {blogList.length > 0 ? (
        <div className="ps-grid blog">{blogList.map((b, i) => <BlogCard key={i} b={b} colour={catColor(b.cat)} onOpen={openPost} />)}</div>
      ) : <div className="svc-empty">No articles found.</div>}
    </div>
  );

  const faqSections = () => (
    <div className="faq-groups">
      {faqFiltered.length === 0 && (
        <div className="faq-empty">No questions match that search. Try another word, or message the shop below.</div>
      )}
      {faqFiltered.map((g) => (
        <section key={g.cat} id={faqId(g.cat)} className="faq-group">
          <h3 className="faq-group-head"><g.icon size={16} /> {g.cat}</h3>
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
      ))}
    </div>
  );

  const faqHelp = () => (
    <div className="faq-help">
      <b>Still need help?</b>
      <p>{store.faq_help_text || <>Message the shop directly and we will get back to you{(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 ? `, usually in ${STORE.reply}` : ""}.</>}</p>
      <button className="faq-help-cta" onClick={() => handleWa(`Hi ${STORE.name}! I need help with...`)}><WhatsAppIcon size={15} /> Message on WhatsApp</button>
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
      <button className="ct-wa" onClick={() => handleWa(`Hi ${STORE.name}! I have an enquiry.`)}><WhatsAppIcon size={18} /> Chat on WhatsApp</button>
      <div className="ct-alt">
        {STORE.email && <a href={`mailto:${STORE.email}`} className="ct-email"><Mail size={16} /> {STORE.email}</a>}
        {STORE.phone && <a href={`tel:${STORE.phone}`} className="ct-phone"><Phone size={16} /> Call us</a>}
      </div>
    </div>
  );

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cMsg.trim()) { ping("Name and message required"); return; }
    
    let msg = `Hi ${STORE.name}! Enquiry from ${cName}:\n${cMsg}`;
    if (cSvc) msg += `\nService: ${cSvc}`;
    if (cDate) msg += `\nPreferred date: ${cDate}`;

    handleWa(msg);
    setCName(""); setCMsg(""); setCSvc(""); setCDate("");
    ping("Enquiry compiled, redirecting to WhatsApp");
  };

  const contactForm = () => (
    <form className="ct-form" onSubmit={handleEnquiry}>
      <span className="ct-form-h">Send an enquiry</span>
      <p className="ps-field-lbl">Your name</p>
      <input className="bk-input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Full name" required />
      <p className="ps-field-lbl">What service are you looking for? (optional)</p>
      <select className="bk-input" value={cSvc} onChange={(e) => setCSvc(e.target.value)}>
        <option value="">Select a service</option>
        {SERVICES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
      <p className="ps-field-lbl">Preferred date (optional)</p>
      <input className="bk-input" type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} />
      <p className="ps-field-lbl">Your message</p>
      <textarea className="bk-input bk-textarea" value={cMsg} onChange={(e) => setCMsg(e.target.value)} placeholder="Describe what you need fixed, or what gadget you are looking for..." required />
      <button className="ps-sheet-cta" type="submit">Compile and send via WhatsApp</button>
    </form>
  );

  const contactVisit = () => (
    <div className="pd-railcard">
      <h3>Visit us</h3>
      <div className="pd-railmap"><MapPin size={22} /></div>
      <p className="ps-addr"><MapPin size={14} /> {STORE.address}</p>
      <div className="pd-railbtns">
        <button onClick={() => handleWa(`Hi ${STORE.name}! I need directions to your shop.`)}><Navigation size={14} /> Directions</button>
        <button onClick={() => handleWa(`Hi ${STORE.name}! I would like to visit.`)}><WhatsAppIcon size={14} /> Message</button>
      </div>
      <ul className="ps-hours">{HOURS.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
    </div>
  );

  const contactBody = () => (
    <div className="ct-wrap">
      <div className="ct-main">
        <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email. A real person, usually the lead technician, will answer.</p>
        {contactChannels()}
        {contactForm()}
      </div>
      <aside className="ct-rail">
        {contactVisit()}
      </aside>
    </div>
  );

  const returnsBody = () => (
    <div className="lg-wrap">
      <h3>Refunds and returns</h3>
      <p>Because gadgets and repair components are quality-tested before sale, our returns window is structured to ensure security and buyer safety.</p>
      <h4>Gadget purchases</h4>
      <p>Brand new, sealed items can be returned within 7 days of delivery for a full refund or exchange, provided the seal remains intact. Certified refurbished units can be returned within 7 days if they develop a fault covered by the warranty.</p>
      <h4>Repairs and components</h4>
      <p>Components fitted during a repair carry a warranty details page and a physical receipt. The repair charge and deposit are held securely by Frontstore until the repair is completed. Cancellations on scheduled appointments made up to 24 hours in advance receive a full deposit refund.</p>
      <div className="blog-convert">
        <b>Questions about warranty?</b>
        <p>Chat with our support bench on WhatsApp to confirm component availability or terms.</p>
        <button className="blog-convert-cta" onClick={() => handleWa(`Hi ${STORE.name}! I have a question about device warranty.`)}><WhatsAppIcon size={15} /> Chat with us</button>
      </div>
    </div>
  );

  const termsBody = () => (
    <div className="lg-wrap">
      {LEGAL_PRESETS.terms.map((t, idx) => (
        <div key={idx}>
          <h4>{t.t}</h4>
          {t.p.map((p, pIdx) => <p key={pIdx}>{p}</p>)}
        </div>
      ))}
    </div>
  );

  const privacyBody = () => (
    <div className="lg-wrap">
      {LEGAL_PRESETS.privacy.map((p, idx) => (
        <div key={idx}>
          <h4>{p.t}</h4>
          {p.p.map((para, pIdx) => <p key={pIdx}>{para}</p>)}
        </div>
      ))}
    </div>
  );

  const announcement = !annOff && (store.announcement_title || store.announcement_body) && (
    <div className="ps-ann">
      <Megaphone size={15} />
      <span className="ps-ann-tx"><b>{store.announcement_title || "Announcement"}</b>{store.announcement_body && ` — ${store.announcement_body}`}</span>
      <button onClick={() => setAnnOff(true)} aria-label="Close announcement"><X size={15} /></button>
    </div>
  );

  const featured = (
    <div className="ps-feat-wrap">
      <h2 className="ps-feat-h"><Award size={15} /> Featured deals</h2>
      <div className="ps-feat">
        {PRODUCTS.slice(0, 2).map((p) => (
          <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} onView={() => openProduct(p)} onBuy={() => addToBag(p, null, null)} badge="Hot Deal" />
        ))}
      </div>
    </div>
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": ["ElectronicsStore", "LocalBusiness"],
    name: STORE.name,
    description: STORE.bio,
    url: `https://${systemDomain}/${STORE.slug}`,
    image: store.logo_url || `https://${systemDomain}/icon.png`,
    priceRange: "$$",
    address: { "@type": "PostalAddress", streetAddress: STORE.address, addressLocality: "Ikeja", addressRegion: "Lagos", addressCountry: "NG" },
    telephone: STORE.phone,
    email: STORE.email,
    sameAs: [],
    aggregateRating: { "@type": "AggregateRating", ratingValue: STORE.rating, reviewCount: STORE.reviews, bestRating: 5 },
    founder: { "@type": "Person", name: AUTHOR.name, jobTitle: AUTHOR.role, sameAs: [] },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: displayFaqs.flatMap((g) => g.items).map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div className="ps-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <WhatsAppDisclaimerModal
        open={!!pendingWaUrl}
        storeName={STORE.name}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)}
      />

      {/* ============ MOBILE ============ */}
      {!isDesktop && (
        <div className="ps-col">
          <header className="ps-top">
            <button className="ps-burger" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={22} /></button>
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">{appName.toLowerCase()}</span></button>
            <button className="ps-top-icon" onClick={() => setSearch(true)} aria-label="Search"><Search size={20} /></button>
            <button className="ps-top-share" onClick={() => setShare(true)} aria-label="Share"><Share2 size={19} /></button>
          </header>

          <main className="ps-main">
            {page === "home" && (<>
              <section className="ps-cover-wrap">
                <div className="ps-cover" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover' } : undefined}><Store className="ps-cover-icn" strokeWidth={1.1} /></div>
                <span className="ps-avatar">{STORE.initial}</span>
                <h1 className="ps-name">{STORE.name} {store.is_verified ? <BadgeCheck size={20} className="ps-verif" /> : null}</h1>
                <p className="ps-meta">{STORE.category} <span className="ps-dot">•</span> <MapPin size={13} /> {STORE.location}</p>
                <div className="ps-id-actions-row">
                  <button className="ps-url" onClick={copyUrl}>{systemDomain}/{STORE.slug} <Copy size={13} /></button>
                  <button className="ps-notify" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                </div>
                <div className="ps-stats">
                  <div><b><Star size={14} className="ps-star" /> {STORE.rating}</b><span>{STORE.reviews} reviews</span></div>
                  <div><b>{STORE.orders}</b><span>orders</span></div>
                  {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && (
                    <div><b>{STORE.reply}</b><span>reply time</span></div>
                  )}
                </div>
                <p className="ps-bio">{STORE.bio}</p>
                <div className="ps-statusline">
                  <span className="ps-open"><span className="ps-pulse" /> {isOpen ? 'Open now' : 'Closed'}</span>
                  <span className="ps-secure"><ShieldCheck size={13} /> Secured by Frontstore</span>
                </div>
              </section>

              {announcement}
              {featured}

              <div className="ps-searchbar" onClick={() => setSearch(true)}><Search size={17} /> <span>Search services and products</span></div>
              <div className="ps-chips">{prodCats.map((c) => <button key={c} onClick={() => setSearch(true)}>{c}</button>)}</div>

              {SERVICES.length > 0 && (<>
                <SectionHead title="Services" action={`See all ${SERVICES.length}`} onAction={() => go("services")} />
                {servicesGrid("ps-grid", homeServices.slice(0, 4))}
                <button className="ps-seeall" onClick={() => go("services")}>See all {SERVICES.length} services <ChevronRight size={16} /></button>
              </>)}

              {PRODUCTS.length > 0 && (<>
                <SectionHead title="Products" action={`See all ${PRODUCTS.length}`} onAction={() => go("products")} />
                {productsGrid("ps-grid", homeProducts.slice(0, 4))}
                <button className="ps-seeall" onClick={() => go("products")}>See all {PRODUCTS.length} products <ChevronRight size={16} /></button>
              </>)}

              <SectionHead title="Reviews" />
              <RatingSummary />
              <div className="ps-reviews-row">{displayReviews.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} />)}</div>
              <button className="ps-seeall" onClick={() => go("reviews")}>See all reviews <ChevronRight size={16} /></button>

              <SectionHead title="Visit the shop" />
              <div className="ps-visit">
                <div className="ps-map"><MapPin size={26} /><span>Map preview</span></div>
                <div className="ps-visit-info">
                  <p className="ps-addr"><MapPin size={15} /> {STORE.address}</p>
                  <button className="ps-dir" onClick={() => handleWa(`Hi ${STORE.name}! I need directions to your physical shop.`)}><Navigation size={15} /> Directions</button>
                  <ul className="ps-hours">{HOURS.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                </div>
              </div>

              <SectionHead title="Good to know" />
              <Accordion items={displayFaqs[0]?.items.slice(0, 4) || []} open={openFaq} setOpen={setOpenFaq} />
              <StoreFoot onNav={go} />
            </>)}

            {page === "services" && <Sub title="Services">{SERVICES.length === 0 ? <EmptyState /> : servicesGrid("ps-grid", SERVICES)}<StoreFoot onNav={go} /></Sub>}
            {page === "products" && <Sub title="Products">{PRODUCTS.length === 0 ? <EmptyState /> : productsGrid("ps-grid", PRODUCTS)}<StoreFoot onNav={go} /></Sub>}
            {page === "portfolio" && <Sub title="Portfolio">{portfolio.length === 0 ? <EmptyState /> : portfolioBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "post" && articleView()}
            {page === "product" && productView()}
            {page === "reviews" && <Sub title="Reviews">{reviews.length === 0 ? <EmptyState /> : reviewsBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "blog" && <Sub title="Blog">{blog.length === 0 ? <EmptyState /> : blogBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "about" && <Sub title="About">{(!store.store_bio && !store.founder_bio) ? <EmptyState /> : aboutBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "faq" && <Sub title="FAQ">{faqs.length === 0 ? <EmptyState /> : faqBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "contact" && <Sub title="Contact">{((!store.address && !store.email && !store.phone && !store.whatsapp_phone)) ? <EmptyState /> : contactBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "returns" && <Sub title="Refunds">{returnsBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "terms" && <Sub title="Terms">{termsBody()}<StoreFoot onNav={go} /></Sub>}
            {page === "privacy" && <Sub title="Privacy">{privacyBody()}<StoreFoot onNav={go} /></Sub>}
          </main>
        </div>
      )}

      {/* ============ DESKTOP ============ */}
      {isDesktop && (
        <div className="pd-wrap">
          <header className="pd-header">
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">{appName.toLowerCase()}</span></button>
            <button className="pd-search" onClick={() => setSearch(true)}><Search size={17} /> <span>Search {STORE.name}</span></button>
            <div className="pd-header-actions">
              <button className="pd-hicon" onClick={() => setShare(true)} aria-label="Share"><Share2 size={18} /></button>
              <button className="pd-hicon" onClick={() => setBagOpen(true)} aria-label="Bag">
                <ShoppingBag size={18} />{bagCount > 0 && <i>{bagCount}</i>}
              </button>
              <button className="pd-head-book" onClick={primaryCta.run}><primaryCta.Icon size={16} /> {primaryCta.label}</button>
            </div>
          </header>

          <div className="pd-container">
            <section className="pd-cover">
              <div className="pd-cover-art" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover' } : undefined}><Store className="pd-cover-icn" strokeWidth={1.05} /></div>
              <div className="pd-identity">
                <span className="pd-avatar">{STORE.initial}</span>
                <div className="pd-identity-main">
                  <h1>{STORE.name} {store.is_verified ? <BadgeCheck size={22} className="ps-verif" /> : null}</h1>
                  <p>
                    <span>{STORE.category}</span><span className="ps-dot">•</span>
                    <span><MapPin size={13} /> {STORE.location}</span>
                    {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && (
                      <><span className="ps-dot">•</span><span>Replies {STORE.reply}</span></>
                    )}
                  </p>
                </div>
                <div className="pd-identity-actions">
                  <button className="pd-book" onClick={primaryCta.run}><primaryCta.Icon size={16} /> {primaryCta.label}</button>
                  <button className="pd-ghost" onClick={() => handleWa(`Hi ${STORE.name}! I have an enquiry.`)}><WhatsAppIcon size={16} /> Message</button>
                  <button className="pd-ghost" onClick={() => setNotifyOpen(true)}><Bell size={16} /> Get notified</button>
                </div>
              </div>
            </section>

            <nav className="pd-tabs">
              {NAV.map(([id, label]) => (
                <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
              ))}
            </nav>

            {page === "home" && (<>
              {announcement}
              <div className="pd-home">
                <aside className="pd-rail">
                  <div className="pd-railcard">
                    <h3>About</h3>
                    <p>{STORE.bio}</p>
                    <button className="pd-raillink" onClick={() => go("about")}>More about us <ChevronRight size={14} /></button>
                  </div>
                  {contactVisit()}
                  <div className="pd-railcard trust">
                    <span className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</span>
                    <p>Buyer protection and platform terms apply to every order on this store and cannot be removed by the vendor.</p>
                  </div>
                </aside>

                <div className="pd-feed">
                  {featured}
                  {SERVICES.length > 0 && (<>
                    <div className="pd-sec-head"><h2>Services</h2><button onClick={() => go("services")}>See all {SERVICES.length}</button></div>
                    {servicesGrid("pd-grid", homeServices.slice(0, 6))}
                  </>)}
                  {PRODUCTS.length > 0 && (<>
                    <div className="pd-sec-head"><h2>Products</h2><button onClick={() => go("products")}>See all {PRODUCTS.length}</button></div>
                    {productsGrid("pd-grid", homeProducts.slice(0, 6))}
                  </>)}
                  <div className="pd-sec-head"><h2>Reviews</h2><button onClick={() => go("reviews")}>See all</button></div>
                  <RatingSummary />
                  <div className="pd-grid reviews">{displayReviews.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} full />)}</div>
                </div>
              </div>
              <StoreFoot onNav={go} />
            </>)}

            {(page === "services" || page === "products" || page === "reviews" || page === "blog" || page === "portfolio" || page === "about" || page === "faq" || page === "contact") && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>{NAV.find(([id]) => id === page)?.[1] || page}</h1>
                  <span>{systemDomain}/{STORE.slug}</span>
                </div>
                {page === "services" && (SERVICES.length === 0 ? <EmptyState /> : (
                  <div className="svc-page">
                    <p className="svc-intro">Book a repair or diagnostic with our team. A deposit secures your slot, with the balance paid once the work is confirmed and done.</p>
                    <div className="pd-sec-head"><h2>Most booked</h2></div>
                    <div className="svc-feat-grid">
                      {SERVICES.filter((s) => s.popular).slice(0, 3).map((s) => (
                        <ServiceCardRich key={s.id} s={s} colour={catColor(s.cat)} badge="Most booked" onBook={() => openBooking(s)} />
                      ))}
                    </div>
                    <div className="svc-searchrow">
                      <div className="svc-search">
                        <Search size={15} />
                        <input value={svcQuery} onChange={(e) => setSvcQuery(e.target.value)} placeholder="Search services" />
                      </div>
                      <select className="svc-select" value={svcCat} onChange={(e) => setSvcCat(e.target.value)}>
                        <option value="All">All categories</option>
                        {svcCats.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select className="svc-select" value={svcDur} onChange={(e) => setSvcDur(e.target.value)}>
                        <option value="All">Any duration</option>
                        <option value="short">Under 60 mins</option>
                        <option value="mid">1 to 2 hours</option>
                        <option value="long">Over 2 hours</option>
                      </select>
                      <select className="svc-select" value={svcSort} onChange={(e) => setSvcSort(e.target.value)}>
                        <option value="popular">Sort by popularity</option>
                        <option value="priceAsc">Price: low to high</option>
                        <option value="priceDesc">Price: high to low</option>
                      </select>
                    </div>
                    <div className="svc-results-head">
                      <b>{svcFiltered.length} {svcFiltered.length === 1 ? "service" : "services"}</b>
                      {svcHasFilters && <button className="svc-clear" onClick={clearSvc}>Clear filters</button>}
                    </div>
                    {svcFiltered.length > 0 ? (
                      servicesGrid("pd-grid", svcFiltered)
                    ) : <div className="svc-empty">No services match your filters.<button onClick={clearSvc}>Clear filters</button></div>}
                    <div className="pd-sec-head"><h2>Good to know</h2></div>
                    <Accordion items={displayFaqs[0]?.items || []} open={svcFaq} setOpen={setSvcFaq} />
                  </div>
                ))}
                {page === "products" && (PRODUCTS.length === 0 ? <EmptyState /> : (
                  <div className="svc-page">
                    <p className="svc-intro font-sans">Shop our best sellers. Delivery across Lagos in 1 to 2 days, with nationwide shipping and Ikeja pickup at checkout.</p>
                    <div className="pd-sec-head"><h2>Top gadgets</h2></div>
                    <div className="svc-feat-grid">
                      {PRODUCTS.slice(0, 3).map((p) => (
                        <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} onView={() => openProduct(p)} onBuy={() => addToBag(p, null, null)} badge="Top seller" />
                      ))}
                    </div>
                    <div className="svc-searchrow">
                      <div className="svc-search">
                        <Search size={15} />
                        <input value={prodQuery} onChange={(e) => setProdQuery(e.target.value)} placeholder="Search gadgets" />
                      </div>
                      <select className="svc-select" value={prodCat} onChange={(e) => setProdCat(e.target.value)}>
                        <option value="All">All categories</option>
                        {prodCats.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select className="svc-select" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)}>
                        <option value="All">Any price</option>
                        <option value="lo">Under 10k</option>
                        <option value="mid">10k to 25k</option>
                        <option value="hi">Over 25k</option>
                      </select>
                      <select className="svc-select" value={prodSort} onChange={(e) => setProdSort(e.target.value)}>
                        <option value="popular">Sort by popularity</option>
                        <option value="priceAsc">Price: low to high</option>
                        <option value="priceDesc">Price: high to low</option>
                      </select>
                    </div>
                    <div className="svc-results-head">
                      <b>{prodFiltered.length} {prodFiltered.length === 1 ? "gadget" : "gadgets"}</b>
                      {prodHasFilters && <button className="svc-clear" onClick={clearProd}>Clear filters</button>}
                    </div>
                    {prodFiltered.length > 0 ? (
                      productsGrid("pd-grid", prodFiltered)
                    ) : <div className="svc-empty">No products match your filters.<button onClick={clearProd}>Clear filters</button></div>}
                    <div className="pd-sec-head"><h2>Good to know</h2></div>
                    <Accordion items={displayFaqs[0]?.items || []} open={prodFaq} setOpen={setProdFaq} />
                  </div>
                ))}
                {page === "reviews" && (reviews.length === 0 ? <EmptyState /> : (
                  <div className="svc-page rev-desk-page">
                    <div className="rev-desk-wrap">
                      <div className="rev-desk-main">
                        <div className="svc-searchrow">
                          <select className="svc-select" value={revSort} onChange={(e) => setRevSort(e.target.value)}>
                            <option value="recent">Most recent</option>
                            <option value="high">Highest rating</option>
                            <option value="low">Lowest rating</option>
                          </select>
                          <select className="svc-select" value={revStar} onChange={(e) => setRevStar(Number(e.target.value))}>
                            <option value="0">All stars</option>
                            {[5, 4, 3].map((n) => <option key={n} value={n}>{n} stars</option>)}
                          </select>
                          <button className={`svc-select btn-filter${revPhotos ? ' active' : ''}`} onClick={() => setRevPhotos(!revPhotos)}>With photos</button>
                        </div>
                        <div className="svc-results-head">
                          <b>{revFiltered.length} {revFiltered.length === 1 ? "review" : "reviews"}</b>
                          {(revStar !== 0 || revPhotos) && <button className="svc-clear" onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button>}
                        </div>
                        {revFiltered.length > 0 ? (
                          <div className="rev-list">{revFiltered.map((rv) => <ReviewCardRich key={rv.id} rv={rv} />)}</div>
                        ) : <div className="svc-empty">No reviews match your filters.</div>}
                      </div>
                      <aside className="rev-desk-rail">
                        <RatingSummary />
                        <button className="rev-leave" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
                        {revPhotoTiles.length > 0 && (
                          <div className="rev-photostrip">
                            <h4>Customer photos</h4>
                            <div className="rev-photos">{revPhotoTiles.map((k, i) => <button key={k} className={`rev-ph c${i % 3}`} onClick={() => ping("Opening photo")} aria-label="Photo" />)}</div>
                          </div>
                        )}
                      </aside>
                    </div>
                  </div>
                ))}
                {page === "blog" && (blog.length === 0 ? <EmptyState /> : blogBody())}
                {page === "portfolio" && (portfolio.length === 0 ? <EmptyState /> : portfolioBody())}
                {page === "about" && (((!store.store_bio && !store.founder_bio)) ? <EmptyState /> : aboutBody())}
                {page === "faq" && (faqs.length === 0 ? <EmptyState /> : faqBody())}
                {page === "contact" && (((!store.address && !store.email && !store.phone && !store.whatsapp_phone)) ? <EmptyState /> : contactBody())}
              </div>
            )}
            {page === "returns" && (<div className="pd-listing"><div className="pd-page-head"><h1>Refunds</h1><span>{systemDomain}/{STORE.slug}</span></div>{returnsBody()}</div>)}
            {page === "terms" && (<div className="pd-listing"><div className="pd-page-head"><h1>Terms</h1><span>{systemDomain}/{STORE.slug}</span></div>{termsBody()}</div>)}
            {page === "privacy" && (<div className="pd-listing"><div className="pd-page-head"><h1>Privacy</h1><span>{systemDomain}/{STORE.slug}</span></div>{privacyBody()}</div>)}
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
              <button className={page === "home" ? "on" : ""} onClick={() => go("home")}><Store size={21} /><span>Home</span></button>
              {(store.storefront_sections || []).includes("services") && (
                <button className={page === "services" ? "on" : ""} onClick={() => go("services")}><Calendar size={21} /><span>Services</span></button>
              )}
              <button className="ps-fab" onClick={() => setBagOpen(true)} aria-label="Cart"><span className="ps-fab-ring" /><ShoppingBag size={22} />{bagCount > 0 && <i className="ps-fab-badge">{bagCount}</i>}</button>
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
              <Search size={18} />
              <input autoFocus placeholder={`Search ${STORE.name}`} value={prodQuery} onChange={(e) => { setProdQuery(e.target.value); setSvcQuery(e.target.value); }} />
              <button onClick={() => setSearch(false)}><X size={20} /></button>
            </div>
            <p className="ps-search-lbl">Categories</p>
            <div className="ps-chips">
              {prodCats.map((c) => (
                <button key={c} onClick={() => { setProdCat(c); setSearch(false); go("products"); }}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* booking flow (shared) */}
      {bookOpen && bookingFlow()}

      {/* bag sheet (shared) */}
      {bagOpen && (
        <Sheet onClose={() => { setBagOpen(false); setCheckoutStep('cart'); }} title={checkoutStep === 'success' ? 'Order Confirmed' : checkoutStep === 'details' ? 'Details' : 'Your bag'}>
          {checkoutStep !== 'success' && bag.length > 0 && (
            <div className="tc-steps" style={{ display: 'flex', marginBottom: 20, background: '#111b21', borderRadius: 8, padding: 4 }}>
              <button className={`tc-step ${checkoutStep === 'cart' ? 'active' : ''}`} style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '8px 0', border: 'none', background: checkoutStep === 'cart' ? 'var(--brand)' : 'none', color: '#fff', borderRadius: 6 }} onClick={() => setCheckoutStep('cart')}>Cart</button>
              <button className={`tc-step ${checkoutStep === 'details' ? 'active' : ''}`} style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '8px 0', border: 'none', background: checkoutStep === 'details' ? 'var(--brand)' : 'none', color: '#fff', borderRadius: 6 }}>Details</button>
            </div>
          )}

          {checkoutStep === 'cart' && (
            bag.length === 0 ? <p className="ps-bag-empty">Your bag is empty.</p> : (<>
              {bag.map((b) => (
                <div className="ps-bag-line" key={b.key}>
                  <span className="ps-bag-th"><Store size={16} /></span>
                  <div><b>{b.name}</b><span>{b.slot}  ·  {money(b.price)}</span><button className="ps-bag-rm" onClick={() => removeItem(b.key)}>Remove</button></div>
                  <div className="ps-qty"><button onClick={() => setQty(b.key, -1)} aria-label="Less"><Minus size={14} /></button><b>{b.qty}</b><button onClick={() => setQty(b.key, 1)} aria-label="More"><Plus size={14} /></button></div>
                </div>
              ))}
              <div className="ps-bag-total"><span>Subtotal</span><b>{money(subtotal)}</b></div>
              {deliveryMethod === 'delivery' && shippingPreview.shippingFee > 0 && (
                <div className="ps-bag-total" style={{ fontSize: 13, color: 'var(--muted)' }}><span>Shipping</span><span>{money(shippingPreview.shippingFee)}</span></div>
              )}
              {deliveryMethod === 'delivery' && shippingPreview.handlingFee > 0 && (
                <div className="ps-bag-total" style={{ fontSize: 13, color: 'var(--muted)' }}><span>Handling Fee</span><span>{money(shippingPreview.handlingFee)}</span></div>
              )}
              <div className="ps-bag-total" style={{ fontWeight: 800 }}><span>Total</span><b>{money(deliveryMethod === 'delivery' ? shippingPreview.total : subtotal)}</b></div>
              <button className="ps-sheet-cta" onClick={() => setCheckoutStep('details')}>Checkout <ChevronRight size={16} /></button>
              <button className="ps-sheet-cta-wa" style={{ background: '#25d366', color: '#fff', border: 'none', width: '100%', padding: '14px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }} onClick={() => handleWa(`Hi ${STORE.name}! Order:\n${bag.map(b => `• ${b.name} ×${b.qty} (${b.slot})`).join('\n')}\nSubtotal: ${money(subtotal)}`)}>
                <WhatsAppIcon size={18} /> Order via WhatsApp
              </button>
            </>)
          )}

          {checkoutStep === 'details' && (
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p className="ps-field-lbl">Full Name *</p>
              <input className="bk-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" required />
              
              <p className="ps-field-lbl">WhatsApp Phone Number *</p>
              <input className="bk-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+234..." type="tel" required />

              <p className="ps-field-lbl">Email Address</p>
              <input className="bk-input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Email Address" type="email" />

              <p className="ps-field-lbl">Delivery Method</p>
              <select className="bk-input" value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as any)}>
                <option value="delivery">Deliver to my address</option>
                <option value="pickup">Store Pickup</option>
              </select>

              {deliveryMethod === 'delivery' && (
                <>
                  <p className="ps-field-lbl">Delivery Address *</p>
                  <textarea className="bk-input bk-textarea" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Delivery Address" required />
                </>
              )}

              <p className="ps-field-lbl">Order Note / Specs (optional)</p>
              <textarea className="bk-input bk-textarea" value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Warranty questions, device models, serial numbers..." />

              <button className="ps-sheet-cta" type="submit" disabled={checkoutLoading}>
                {checkoutLoading ? 'Placing Order...' : `Place Order · ${money(deliveryMethod === 'delivery' ? shippingPreview.total : subtotal)}`}
              </button>
            </form>
          )}

          {checkoutStep === 'success' && orderReceipt && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#25d366' }}>
                <Check size={28} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Order Confirmed!</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{STORE.name} will reach out shortly via WhatsApp.</p>
              <div style={{ background: '#111b21', padding: 14, borderRadius: 10, textAlign: 'left', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span style={{ color: 'var(--muted)' }}>Order ID</span><b>{orderReceipt.order.order_number}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--muted)' }}>Total Amount</span><b>{money(orderReceipt.order.total_amount)}</b></div>
              </div>
              {orderReceipt.whatsapp_url && (
                <button className="ps-sheet-cta" style={{ background: '#25d366', color: '#fff', border: 'none', marginBottom: 10 }} onClick={() => setPendingWaUrl(orderReceipt.whatsapp_url)}>
                  <WhatsAppIcon size={18} /> Track on WhatsApp
                </button>
              )}
              <button className="ps-sheet-cta" style={{ background: 'var(--brand)' }} onClick={handlePayOnline} disabled={isPaying}>
                {isPaying ? 'Redirecting to payment...' : 'Pay Online Now'}
              </button>
              <button className="blog-convert-ghost" style={{ marginTop: 14 }} onClick={() => { setBagOpen(false); setCheckoutStep('cart'); setOrderReceipt(null); }}>Continue Shopping</button>
            </div>
          )}
        </Sheet>
      )}

      {/* share sheet (shared) */}
      {share && (
        <Sheet onClose={() => setShare(false)} title="Share this store">
          <div className="ps-share-url"><span>{systemDomain}/{STORE.slug}</span><button onClick={() => { navigator.clipboard?.writeText(`${systemDomain}/${STORE.slug}`); ping("Link copied"); }}><Copy size={15} /></button></div>
          <button className="ps-share-wa" onClick={() => handleWa(`Hi! Check out this awesome storefront: https://${systemDomain}/${STORE.slug}`)}><WhatsAppIcon size={18} /> Share on WhatsApp</button>
        </Sheet>
      )}

      {/* notify opt-in (shared) */}
      {notifyOpen && (
        <Sheet onClose={() => setNotifyOpen(false)} title={`Get updates from ${STORE.name}`}>
          <p className="ps-sheet-sub"><Bell size={13} /> Be first to hear about new services, products, drops and announcements.</p>
          <p className="ps-field-lbl">Your WhatsApp number</p>
          <input className="bk-input" value={notifyPhone} onChange={(e) => setNotifyPhone(e.target.value)} placeholder="e.g. 0801 234 5678" inputMode="tel" />
          <div className="ps-notify-topics">
            {NOTIFY_TOPICS.map(([id, label]) => {
              const on = notifyTopics.includes(id);
              return (
                <button key={id} className={`ps-notify-tag ${on ? "on" : ""}`} onClick={() => setNotifyTopics(on ? notifyTopics.filter((x) => x !== id) : [...notifyTopics, id])}>
                  {on ? <Check size={12} /> : <Plus size={12} />} {label}
                </button>
              );
            })}
          </div>
          <button className="ps-sheet-cta" onClick={() => { setNotifyOpen(false); handleWa(`Hi ${STORE.name}! I'd like to sign up for notifications on topics: ${notifyTopics.join(', ')}`); }}>Subscribe on WhatsApp</button>
        </Sheet>
      )}

      {/* review modal */}
      {reviewOpen && (
        <Sheet onClose={() => setReviewOpen(false)} title="Write a review">
          <p className="ps-sheet-sub">Share your experience with Vjhenzie Beauty Hub. Reviews must be verified by a real purchase.</p>
          <p className="ps-field-lbl">Rating</p>
          <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setRevRating(n)} aria-label={`Rate ${n} stars`} style={{ cursor: 'pointer' }}>
                <Star size={24} fill={n <= revRating ? "var(--gold)" : "none"} color={n <= revRating ? "var(--gold)" : "#cfd2d6"} />
              </button>
            ))}
          </div>
          <p className="ps-field-lbl">Order reference number *</p>
          <input className="bk-input" value={revRef} onChange={(e) => setRevRef(e.target.value)} placeholder="e.g. #ORD-12345" />
          <p className="ps-field-lbl">Review message</p>
          <textarea className="bk-input bk-textarea" value={revText} onChange={(e) => setRevText(e.target.value)} placeholder="Write your review..." />
          <button className="ps-sheet-cta" onClick={submitReview}>Submit review</button>
        </Sheet>
      )}

      {toast && <div className="ps-toast">{toast}</div>}
    </div>
  );

  // --- Sub-components & Helpers ---
  function Panel({ onClose }: { onClose?: () => void }) {
    return (
      <div className="ps-panel">
        <button className="ps-id" onClick={() => go("home")}>
          <span className="ps-id-av">{STORE.initial}</span>
          <span className="ps-id-main">
            <b>{STORE.name} {store.is_verified ? <BadgeCheck size={14} className="ps-verif" /> : null}</b>
            <i>{systemDomain}/{STORE.slug}</i>
            <em><Star size={12} className="ps-star" /> {STORE.rating} ({STORE.reviews})</em>
          </span>
        </button>
        <nav className="ps-nav">
          {NAV.map(([id, label]) => (
            <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>
              {label}{page === id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>
        <div className="ps-panel-actions">
          <button className="ps-act-book" onClick={() => { primaryCta.run(); onClose && onClose(); }}><primaryCta.Icon size={17} /> {primaryCta.label}</button>
          <div className="ps-act-row">
            <button onClick={() => { handleWa(`Hi ${STORE.name}! I have an enquiry.`); onClose && onClose(); }}><MessageCircle size={16} /> Message</button>
            <button onClick={() => { setShare(true); onClose && onClose(); }}><Share2 size={16} /> Share</button>
          </div>
        </div>
        <div className="ps-panel-foot">
          <span><Lock size={12} /> Secured by Frontstore</span>
          <p>Buyer protection and platform terms apply to every order.</p>
        </div>
      </div>
    );
  }

  function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
    return (
      <div className="ps-sec-head">
        <h2>{title}</h2>
        {action && onAction && <button onClick={onAction}>{action}</button>}
      </div>
    );
  }

  function ServiceCard({ s, onBook }: { s: any; onBook: () => void }) {
    return (
      <button className="ps-card" onClick={onBook}>
        <span className="ps-card-cat">{s.cat}</span>
        <span className="ps-card-name">{s.name}</span>
        <p className="ps-card-desc">{s.desc}</p>
        <span className="ps-card-price">{money(s.price)}  ·  {s.dur}</span>
      </button>
    );
  }

  function ProductCard({ p, onOpen }: { p: any; onOpen: () => void }) {
    return (
      <button className="ps-card" onClick={onOpen}>
        <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 8, background: '#111b21', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 }}>
          {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={28} style={{ color: 'var(--muted)' }} />}
        </div>
        <span className="ps-card-cat">{p.cat}</span>
        <span className="ps-card-name">{p.name}</span>
        <p className="ps-card-desc">{p.desc}</p>
        <span className="ps-card-price">{money(p.price)}</span>
      </button>
    );
  }

  function BlogCard({ b, colour, onOpen }: { b: any; colour: string; onOpen: (b: any) => void }) {
    return (
      <button className="ps-card blog-card" onClick={() => onOpen(b)}>
        <span className={`bk-thumb ${colour}`} style={{ width: '100%', height: 120, borderRadius: 8, display: 'grid', placeItems: 'center', marginBottom: 12 }}>< Megaphone size={24} /></span>
        <span className="ps-card-cat">{b.cat}  ·  {b.read}</span>
        <span className="ps-card-name">{b.title}</span>
        <p className="ps-card-desc">{b.excerpt}</p>
      </button>
    );
  }

  function ServiceCardRich({ s, onBook, colour, badge }: { s: any; onBook: () => void; colour: string; badge: string }) {
    return (
      <button className="rich-card" onClick={onBook}>
        <div className={`rich-thumb ${colour}`}><Calendar size={24} />{badge && <span className="rich-badge">{badge}</span>}</div>
        <div className="rich-info">
          <span className="rich-cat">{s.cat}  ·  {s.dur}</span>
          <h4>{s.name}</h4>
          <p>{s.desc}</p>
          <div className="rich-foot"><b>{money(s.price)}</b><span className="rich-btn">Book slot</span></div>
        </div>
      </button>
    );
  }

  function ProductCardRich({ p, onView, onBuy, colour, badge }: { p: any; onView: () => void; onBuy: () => void; colour: string; badge: string }) {
    return (
      <div className="rich-card">
        <button className={`rich-thumb ${colour}`} onClick={onView} aria-label={p.name}>
          {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={24} />}
          {badge && <span className="rich-badge">{badge}</span>}
        </button>
        <div className="rich-info">
          <span className="rich-cat">{p.cat}</span>
          <h4 style={{ cursor: 'pointer' }} onClick={onView}>{p.name}</h4>
          <p>{p.desc}</p>
          <div className="rich-foot"><b>{money(p.price)}</b><button className="rich-btn buy-btn" onClick={onBuy}>Add to bag</button></div>
        </div>
      </div>
    );
  }

  function ReviewCardRich({ rv }: { rv: any }) {
    return (
      <div className="rev-card-rich">
        <div className="rev-rich-top">
          <span className="rev-rich-av">{rv.name.charAt(0)}</span>
          <div className="rev-rich-meta">
            <b>{rv.name} {rv.verified && <BadgeCheck size={13} className="ps-verif" />}</b>
            <span>Verified purchase  ·  {rv.when}</span>
          </div>
          <div className="rev-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} fill={i < rv.r ? "var(--gold)" : "none"} color={i < rv.r ? "var(--gold)" : "var(--line)"} />
            ))}
          </div>
        </div>
        <p className="rev-rich-body">{rv.text}</p>
        {rv.response && (
          <div className="rev-rich-reply">
            <b>Response from the shop <i>{rv.response.when}</i></b>
            <p>{rv.response.text}</p>
          </div>
        )}
      </div>
    );
  }

  function ReviewCard({ rv, full }: { rv: any; full?: boolean }) {
    return (
      <div className="ps-rev-card">
        <div className="rev-top">
          <span className="rev-av">{rv.name.charAt(0)}</span>
          <b>{rv.name}</b>
          <div className="rev-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} fill={i < rv.r ? "var(--gold)" : "none"} color={i < rv.r ? "var(--gold)" : "var(--line)"} />
            ))}
          </div>
        </div>
        <p>{rv.text}</p>
      </div>
    );
  }

  function RatingSummary() {
    return (
      <div className="rev-sum">
        <div className="rev-sum-main">
          <b>{STORE.rating}</b>
          <div className="rev-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={15} fill={i < Math.round(STORE.rating) ? "var(--gold)" : "none"} color={i < Math.round(STORE.rating) ? "var(--gold)" : "var(--line)"} />
            ))}
          </div>
          <span>Based on {STORE.reviews} reviews</span>
        </div>
        <div className="rev-sum-bars">
          {REV_DIST.map(([stars, pct]) => (
            <div key={stars} className="rev-sum-row">
              <span>{stars} <Star size={11} className="f" /></span>
              <div className="rev-sum-bar"><div className="rev-sum-fill" style={{ width: `${pct}%` }} /></div>
              <span>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Accordion({ items, open, setOpen }: { items: any[]; open: number; setOpen: (i: number) => void }) {
    return (
      <div className="ps-acc">
        {items.map(([q, a], i) => {
          const isOp = open === i;
          return (
            <div key={i} className={`ps-acc-item ${isOp ? "open" : ""}`}>
              <button onClick={() => setOpen(isOp ? -1 : i)}>{q}<ChevronDown size={17} /></button>
              {isOp && <p dangerouslySetInnerHTML={{ __html: a }} />}
            </div>
          );
        })}
      </div>
    );
  }

  function StoreFoot({ onNav }: { onNav: (p: string) => void }) {
    return (
      <footer className="ps-foot">
        <b className="ps-foot-logo">{appName.toLowerCase()}<span>.app</span></b>
        <p>This store is verified and secured by {appName}. Buyer protection terms apply to all checkout payments.</p>
        <div className="ps-foot-links">
          {LEGAL.map(([id, label]) => (
            <button key={id} onClick={() => onNav(id)}>{label}</button>
          ))}
        </div>
      </footer>
    );
  }

  function Sub({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="pd-listing">
        <div className="pd-page-head">
          <h1>{title}</h1>
          <span>{systemDomain}/{STORE.slug}</span>
        </div>
        {children}
      </div>
    );
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
          <div className="ps-sheet-body" style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 60px)', paddingBottom: 30 }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

// --- Hardcoded Legal Policy Presets ---
const LEGAL_PRESETS = {
  terms: [
    { t: "Who these terms are between", p: ["These terms are an agreement between you and the shop that sells the gadgets and repair services on this store. The shop runs on Frontstore, which provides the platform and buyer protection but is not the seller."] },
    { t: "Repairs and deposits", p: ["Repairs and diagnostics are booked through this shop. Where a deposit or diagnostic fee applies, it secures your slot and the amount is always shown before you confirm."] },
    { t: "Pricing and payment", p: ["Prices are shown in Nigerian naira. Any approximate conversion shown elsewhere is indicative only, and you are charged in naira.", "You can pay securely through Frontstore at checkout, or by bank transfer to the shop. Funds paid by transfer go directly to the shop, while Frontstore payments are held under buyer protection."] },
    { t: "Repairs and your data", p: ["We take care with every device, but you are responsible for backing up your data before a repair where possible. We will always ask before doing anything that could affect your data."] },
    { t: "Governing law", p: ["These terms are governed by the laws of the Federal Republic of Nigeria, and any dispute falls under the courts of Lagos State."] }
  ],
  privacy: [
    { t: "What we collect", p: ["When you buy, book a repair or get in touch, we collect the details you give us: your name, contact details such as a WhatsApp number, phone or email, your order or device details, any message you send, and reviews or photos you choose to share."] },
    { t: "How we use it", p: ["We use your details to process and deliver orders, manage repairs and bookings, reply to your enquiries, arrange delivery or pickup, process payments, show verified reviews, and improve the shop. We do not send marketing without your consent."] },
    { t: "Your device and data", p: ["For repairs we only access what is needed to diagnose and fix your device, and we never copy or keep your personal data beyond the repair unless you ask us to, for example during data recovery."] },
    { t: "Who we share it with", p: ["We share only what is needed: with delivery partners to fulfil your order, with payment providers to take payment, and with Frontstore as the platform the shop runs on. We never sell your data."] }
  ]
};

// --- HSL Tailored Stylesheets matching the exact aesthetic of FrontstoreTechStore ---
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');

.ps-root {
  --brand: #0e7490;
  --brand-deep: #134e63;
  --gold: #c79a4b;
  --bg: #faf4ef;
  --card: #fff;
  --ink: #112027;
  --muted: #8a7680;
  --line: #efe1da;
  --ok: #1f9d57;
  --wa: #25d366;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.ps-root *, .ps-root *::before, .ps-root *::after {
  box-sizing: border-box;
}
.ps-root :where(button) {
  font-family: inherit;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
.ps-root a {
  color: inherit;
  text-decoration: none;
}

.ps-logo {
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -.02em;
  color: var(--primary);
  flex: 1;
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.ps-logo.as-btn {
  cursor: pointer;
}
.ps-verif {
  color: var(--brand);
  vertical-align: -2px;
}
.ps-star {
  color: var(--gold);
  fill: var(--gold);
}
.ps-dot {
  opacity: .5;
  margin: 0 2px;
}

/* ===================== MOBILE ===================== */
.ps-col {
  max-width: 860px;
  margin: 0 auto;
}
.ps-top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px;
  background: rgba(250, 244, 239, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.ps-burger, .ps-top-icon, .ps-top-share {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  color: var(--ink);
}
.ps-burger:hover, .ps-top-icon:hover, .ps-top-share:hover {
  background: #f3eae3;
}
.ps-main {
  padding: 16px 16px 96px;
}

.ps-cover-wrap {
  margin-bottom: 18px;
}
.ps-cover {
  height: clamp(150px, 42vw, 210px);
  margin: 0 -16px;
  background: linear-gradient(135deg, var(--brand-deep), var(--brand) 55%, var(--gold));
  position: relative;
  overflow: hidden;
  border-radius: 0 0 18px 18px;
}
.ps-cover-icn {
  position: absolute;
  right: -26px;
  bottom: -36px;
  width: clamp(200px, 52vw, 280px);
  height: clamp(200px, 52vw, 280px);
  color: #fff;
  opacity: .2;
  pointer-events: none;
  mask-image: radial-gradient(circle at 60% 44%, #000 32%, transparent 74%);
}
.ps-avatar {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  color: #fff;
  font-family: 'Fraunces';
  font-weight: 700;
  font-size: 38px;
  display: grid;
  place-items: center;
  border: 4px solid var(--bg);
  margin-top: -44px;
  position: relative;
}
.ps-name {
  font-family: 'Fraunces';
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -.02em;
  line-height: 1.15;
  margin-top: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ps-meta {
  font-size: 13px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
}
.ps-url {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--brand-deep);
  background: #e4f1f4;
  padding: 7px 12px;
  border-radius: 9px;
  margin-top: 11px;
}
.ps-id-actions-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 11px;
}
.ps-notify {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
  border: 1px solid var(--line);
  padding: 7px 12px;
  border-radius: 9px;
}

.ps-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  margin-top: 18px;
  background: var(--card);
}
.ps-stats > div {
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ps-stats > div:not(:last-child) {
  border-right: 1.5px solid var(--line);
}
.ps-stats b {
  font-family: 'Fraunces';
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.ps-stats span {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--muted);
}
.ps-bio {
  font-size: 14px;
  line-height: 1.55;
  color: var(--ink);
  margin-top: 15px;
}
.ps-statusline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 600;
}
.ps-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ok);
}
.ps-pulse {
  width: 7px;
  height: 7px;
  background: var(--ok);
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(31,157,87,.22);
}
.ps-secure {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ps-ann {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #e4f1f4;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 11px 14px;
  margin-bottom: 22px;
}
.ps-ann svg {
  color: var(--brand);
  margin-top: 2px;
  flex: none;
}
.ps-ann-tx {
  font-size: 12.5px;
  line-height: 1.45;
  flex: 1;
}
.ps-ann-tx b {
  color: var(--brand-deep);
}
.ps-ann button {
  color: var(--brand);
  opacity: .7;
}

.ps-feat-wrap {
  margin-bottom: 22px;
}
.ps-feat-h {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--brand-deep);
  margin-bottom: 12px;
}
.ps-feat {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width:480px) {
  .ps-feat {
    grid-template-columns: 1fr 1fr;
  }
}

.ps-searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid var(--line);
  background: var(--card);
  padding: 12px 14px;
  border-radius: 11px;
  font-size: 14.5px;
  color: var(--muted);
  cursor: pointer;
  margin-bottom: 11px;
}
.ps-searchbar span {
  flex: 1;
}
.ps-chips {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  margin: 0 -16px 22px;
  padding: 0 16px;
}
.ps-chips::-webkit-scrollbar {
  display: none;
}
.ps-chips button {
  font-size: 12.5px;
  font-weight: 600;
  background: var(--card);
  border: 1.5px solid var(--line);
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
}

.ps-sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 24px;
}
.ps-sec-head h2 {
  font-family: 'Fraunces';
  font-size: 19px;
  font-weight: 700;
}
.ps-sec-head button {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-deep);
}

.ps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 11px;
}
@media (min-width:480px) {
  .ps-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.ps-card {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  padding: 14px;
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.ps-card:hover {
  border-color: var(--brand);
}
.ps-card-cat {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--brand);
  margin-bottom: 5px;
}
.ps-card-name {
  font-weight: 700;
  font-size: 14.5px;
  line-height: 1.35;
  color: var(--ink);
}
.ps-card-desc {
  font-size: 12.5px;
  color: var(--muted);
  margin: 6px 0 12px;
  line-height: 1.45;
  flex: 1;
}
.ps-card-price {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

.ps-seeall {
  width: 100%;
  border: 1.5px solid var(--line);
  padding: 12px;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--brand-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--card);
  margin-top: 12px;
}

.ps-reviews-row {
  display: flex;
  gap: 11px;
  overflow-x: auto;
  margin: 0 -16px;
  padding: 0 16px;
}
.ps-reviews-row::-webkit-scrollbar {
  display: none;
}
.ps-rev-card {
  flex: none;
  width: 250px;
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  padding: 12px;
}
.rev-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}
.rev-av, .rev-rich-av {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--line);
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
  color: var(--ink);
}
.rev-top b {
  font-size: 12.5px;
  flex: 1;
}
.rev-stars {
  display: flex;
  gap: 1px;
}
.ps-rev-card p {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--muted);
}

.ps-visit {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}
.ps-map {
  height: 110px;
  background: linear-gradient(135deg, #e1e9eb, #d2dce0);
  display: grid;
  place-content: center;
  color: var(--brand);
  text-align: center;
}
.ps-map span {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 4px;
}
.ps-visit-info {
  padding: 16px;
}
.ps-addr {
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--ink);
  display: flex;
  gap: 7px;
  align-items: flex-start;
}
.ps-addr svg {
  margin-top: 3px;
  color: var(--brand);
  flex: none;
}
.ps-dir {
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 11px;
}
.ps-hours {
  list-style: none;
  margin-top: 15px;
  border-top: 1px solid var(--line);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ps-hours li {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--muted);
}
.ps-hours li.today {
  color: var(--ink);
  font-weight: 700;
}

.ps-acc {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ps-acc-item {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 11px;
  overflow: hidden;
}
.ps-acc-item button {
  width: 100%;
  padding: 14px;
  text-align: left;
  font-weight: 700;
  font-size: 13.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ps-acc-item button svg {
  opacity: .5;
  transition: transform .2s;
}
.ps-acc-item.open button svg {
  transform: rotate(180deg);
}
.ps-acc-item p {
  padding: 0 14px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
}

.ps-foot {
  margin-top: 48px;
  text-align: center;
  border-top: 1.5px solid var(--line);
  padding-top: 24px;
}
.ps-foot-logo {
  font-family: 'Fraunces';
  font-size: 20px;
  font-weight: 700;
}
.ps-foot-logo span {
  color: var(--brand);
}
.ps-foot p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.55;
  margin: 8px auto 14px;
  max-width: 320px;
}
.ps-foot-links {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.ps-foot-links button {
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-deep);
  text-decoration: underline;
}

/* Sub layouts */
.pd-listing {
  margin-bottom: 24px;
}
.pd-page-head {
  margin-bottom: 22px;
}
.pd-page-head h1 {
  font-family: 'Fraunces';
  font-size: clamp(28px, 6vw, 36px);
  font-weight: 700;
  letter-spacing: -.02em;
  color: var(--ink);
}
.pd-page-head span {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
}

.svc-intro {
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--muted);
  margin-bottom: 24px;
}

/* Rich Cards */
.rich-card {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: left;
}
.rich-thumb {
  height: 150px;
  background: linear-gradient(135deg, var(--brand), var(--gold));
  position: relative;
  display: grid;
  place-items: center;
  color: #fff;
}
.rich-thumb.c0 {
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
}
.rich-thumb.c1 {
  background: linear-gradient(135deg, var(--brand-deep), var(--gold));
}
.rich-thumb.c2 {
  background: linear-gradient(135deg, var(--brand), var(--gold));
}
.rich-thumb.c3 {
  background: linear-gradient(135deg, var(--brand-deep), var(--brand));
}
.rich-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(17,32,39,.9);
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 4px 8px;
  border-radius: 6px;
}
.rich-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rich-cat {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--brand);
}
.rich-info h4 {
  font-family: 'Fraunces';
  font-size: 16.5px;
  font-weight: 700;
  margin: 6px 0 8px;
}
.rich-info p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.45;
  margin-bottom: 16px;
  flex: 1;
}
.rich-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rich-foot b {
  font-size: 16px;
  font-weight: 700;
}
.rich-btn {
  background: var(--brand);
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: 8px;
}

/* Accordion thumb */
.bk-thumb {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #fff;
  flex-shrink: 0;
}
.bk-thumb.c0 {
  background: var(--brand);
}
.bk-thumb.c1 {
  background: var(--brand-deep);
}
.bk-thumb.c2 {
  background: var(--gold);
}
.bk-thumb.c3 {
  background: var(--ink);
}

/* Reviews Page */
.rev-sum {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rev-sum-main {
  text-align: center;
}
.rev-sum-main b {
  font-family: 'Fraunces';
  font-size: 38px;
  font-weight: 700;
  line-height: 1;
}
.rev-sum-main .rev-stars {
  justify-content: center;
  margin: 6px 0;
}
.rev-sum-main span {
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
}
.rev-sum-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rev-sum-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
}
.rev-sum-row span:first-child {
  width: 32px;
  text-align: right;
}
.rev-sum-row span:first-child svg {
  vertical-align: -2px;
}
.rev-sum-bar {
  flex: 1;
  height: 6px;
  background: var(--line);
  border-radius: 3px;
  overflow: hidden;
}
.rev-sum-fill {
  height: 100%;
  background: var(--gold);
  border-radius: 3px;
}
.rev-sum-row span:last-child {
  width: 28px;
}

.rev-leave, .rev-leave-m {
  width: 100%;
  background: var(--brand-deep);
  color: #fff;
  border-radius: 11px;
  padding: 12px;
  font-size: 13.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.rev-trust {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 8px;
}
.rev-photostrip h4 {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--muted);
  margin-bottom: 8px;
}
.rev-photos {
  display: flex;
  gap: 7px;
  overflow-x: auto;
}
.rev-ph {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  background: var(--line);
  flex-shrink: 0;
}

.rev-filter-m {
  display: flex;
  gap: 6px;
  margin-top: 18px;
  overflow-x: auto;
}
.rev-filter-m button {
  font-size: 12.5px;
  font-weight: 600;
  background: var(--card);
  border: 1.5px solid var(--line);
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.rev-filter-m button.on {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.rev-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rev-card-rich {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 16px;
}
.rev-rich-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.rev-rich-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rev-rich-meta b {
  font-size: 13.5px;
}
.rev-rich-meta span {
  font-size: 11.5px;
  color: var(--muted);
}
.rev-rich-body {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--ink);
}
.rev-rich-reply {
  background: var(--bg);
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 10px;
  border-left: 3px solid var(--brand);
}
.rev-rich-reply b {
  font-size: 11.5px;
  display: block;
}
.rev-rich-reply p {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.4;
  margin-top: 4px;
}

/* About Founder */
.ab-kicker {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--brand);
  display: block;
}
.ab-name {
  font-family: 'Fraunces';
  font-size: clamp(22px, 5vw, 26px);
  font-weight: 700;
}
.ab-role {
  font-size: 12.5px;
  color: var(--muted);
  display: block;
  margin-top: 2px;
}
.ab-verified {
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e4f1f4;
  padding: 3px 6px;
  border-radius: 6px;
  margin-top: 6px;
}
.ab-bio {
  font-size: 14px;
  line-height: 1.55;
  margin-top: 12px;
}
.ab-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.ab-chips span {
  font-size: 11px;
  font-weight: 600;
  background: var(--line);
  padding: 4px 8px;
  border-radius: 6px;
}
.ab-creds {
  margin-top: 18px;
}
.ab-creds-h {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
  display: block;
  margin-bottom: 8px;
}
.ab-creds ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ab-creds li {
  font-size: 13px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.ab-creds li svg {
  color: var(--ok);
}
.ab-quote {
  font-family: 'Fraunces';
  font-style: italic;
  font-size: 16px;
  border-left: 2px solid var(--line);
  padding-left: 12px;
  margin-top: 18px;
  color: var(--muted);
}
.ab-socials {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}
.ab-socials button {
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--card);
}

.ab-section {
  margin-top: 24px;
  border-top: 1.5px solid var(--line);
  padding-top: 20px;
}
.ab-subhead {
  font-family: 'Fraunces';
  font-size: 16.5px;
  font-weight: 700;
  margin-bottom: 12px;
}
.ab-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ab-shot {
  height: 90px;
  background: linear-gradient(135deg, var(--brand-deep), var(--brand));
  border-radius: 10px;
  padding: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}
.ab-shot.c0 {
  background: linear-gradient(135deg, var(--brand), var(--gold));
}
.ab-shot.c1 {
  background: linear-gradient(135deg, var(--brand-deep), var(--gold));
}
.ab-shot.c2 {
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
}
.ab-shot b {
  font-size: 12px;
  line-height: 1.25;
}
.ab-shot span {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: .06em;
  opacity: .7;
  margin-top: 2px;
}

.ab-facts {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ab-facts li {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 6px;
}
.ab-facts span {
  color: var(--muted);
}
.ab-rec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ab-rec {
  font-size: 11.5px;
  font-weight: 700;
  background: #e4f1f4;
  color: var(--brand-deep);
  padding: 4px 10px;
  border-radius: 6px;
}

/* Portfolio Page */
.pf-wrap {
  margin-top: 14px;
}
.pf-filter, .bl-filter {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 18px;
}
.pf-filter button, .bl-filter button {
  font-size: 12.5px;
  font-weight: 600;
  background: var(--card);
  border: 1.5px solid var(--line);
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
}
.pf-filter button.on, .bl-filter button.on {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}
.pf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.pf-card {
  height: 110px;
  background: linear-gradient(135deg, var(--brand-deep), var(--brand));
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}
.pf-card-cat {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: .06em;
  opacity: .7;
}
.pf-card-name {
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.25;
  margin-top: 3px;
}

/* Blog / Article Page */
.ar-cat {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--brand);
  display: block;
}
.ar-title {
  font-family: 'Fraunces';
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -.01em;
  margin: 6px 0 8px;
}
.ar-date {
  font-size: 11.5px;
  color: var(--muted);
  display: block;
  margin-bottom: 22px;
}
.ar-body {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--ink);
}
.ar-body p {
  margin-bottom: 16px;
}
.ar-body h3 {
  font-family: 'Fraunces';
  font-size: 18px;
  font-weight: 700;
  margin: 24px 0 10px;
}
.ar-body ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.ar-body li {
  display: flex;
  gap: 7px;
  align-items: center;
}
.ar-body li svg {
  color: var(--ok);
  flex: none;
}
.blog-convert {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 18px;
  margin-top: 24px;
}
.blog-convert b {
  font-family: 'Fraunces';
  font-size: 16.5px;
  font-weight: 700;
}
.blog-convert p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.45;
  margin: 6px 0 14px;
}
.blog-convert-cta {
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.blog-convert-ghost {
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-deep);
  margin-left: 14px;
}

/* Legal Pages */
.lg-wrap h3 {
  font-family: 'Fraunces';
  font-size: clamp(20px, 4vw, 24px);
  margin-bottom: 8px;
}
.lg-wrap h4 {
  font-family: 'Fraunces';
  font-size: 15.5px;
  font-weight: 700;
  margin: 20px 0 6px;
}
.lg-wrap p {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--muted);
  margin-bottom: 12px;
}

/* Product Detail Page */
.pv-back {
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-deep);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 18px;
}
.pv-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
.pv-gallery {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pv-main {
  height: clamp(220px, 60vw, 320px);
  border: 1.5px solid var(--line);
  background: var(--card);
  border-radius: 18px;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}
.pv-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(17,32,39,.9);
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 4px 8px;
  border-radius: 6px;
}
.pv-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pv-main-icn {
  color: var(--muted);
  opacity: .3;
}
.pv-thumbs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.pv-thumb {
  height: 52px;
  border-radius: 8px;
  background: var(--card);
  border: 1.5px solid var(--line);
}
.pv-info {
  display: flex;
  flex-direction: column;
}
.pv-infocat {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--brand);
}
.pv-name {
  font-family: 'Fraunces';
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 700;
  letter-spacing: -.01em;
  line-height: 1.15;
  margin: 6px 0 8px;
}
.pv-price {
  font-family: 'Fraunces';
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 12px;
}
.pv-desc {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--muted);
}
.pv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  margin-bottom: 8px;
}
.pv-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
}
.pv-colourname {
  font-size: 13px;
  font-weight: 700;
}
.pv-swatches {
  display: flex;
  gap: 8px;
}
.pv-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--line);
  display: grid;
  place-items: center;
  color: #fff;
}
.pv-swatch.on {
  border-color: var(--brand);
}
.pv-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pv-size {
  font-size: 13px;
  font-weight: 700;
  background: var(--card);
  border: 1.5px solid var(--line);
  padding: 6px 12px;
  border-radius: 8px;
}
.pv-size.on {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}
.pv-meta {
  margin-top: 24px;
  border-top: 1.5px solid var(--line);
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pv-meta-line {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12.5px;
  color: var(--muted);
}
.pv-meta-line svg {
  color: var(--brand);
}

/* ===================== DESKTOP DRAWERS & SHEETS ===================== */
.ps-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17,32,39,.65);
  backdrop-filter: blur(4px);
  z-index: 99;
}
.ps-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 90vh;
  background: var(--bg);
  border-radius: 20px 20px 0 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -12px 40px rgba(17,32,39,.12);
}
@media (min-width:600px) {
  .ps-sheet {
    left: auto;
    right: 0;
    top: 0;
    bottom: 0;
    width: 440px;
    max-height: 100vh;
    border-radius: 0;
  }
}
.ps-sheet-grip {
  width: 38px;
  height: 4px;
  background: var(--line);
  border-radius: 2px;
  margin: 10px auto 0;
}
@media (min-width:600px) {
  .ps-sheet-grip {
    display: none;
  }
}
.ps-sheet-head {
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ps-sheet-head b {
  font-size: 16px;
  flex: 1;
  text-align: center;
}
.ps-sheet-back, .ps-sheet-back-sp {
  width: 28px;
}
.ps-sheet-body {
  padding: 20px;
  flex: 1;
}

.ps-bag-empty {
  font-size: 14.5px;
  text-align: center;
  color: var(--muted);
  padding: 48px 0;
}
.ps-bag-line {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1.5px solid var(--line);
}
.ps-bag-th {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--line);
  display: grid;
  place-items: center;
  color: var(--brand);
}
.ps-bag-line > div:nth-child(2) {
  flex: 1;
}
.ps-bag-line b {
  font-size: 13.5px;
  display: block;
}
.ps-bag-line span {
  font-size: 11.5px;
  color: var(--muted);
}
.ps-bag-rm {
  font-size: 11px;
  font-weight: 700;
  color: #cf2a2a;
  margin-top: 4px;
}
.ps-qty {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ps-qty button {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid var(--line);
  background: var(--card);
  display: grid;
  place-items: center;
}
.ps-qty b {
  font-size: 13px;
  min-width: 14px;
  text-align: center;
}

.ps-bag-total {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  margin-top: 18px;
  border-top: 1.5px solid var(--line);
  padding-top: 14px;
}

.ps-sheet-cta {
  width: 100%;
  background: var(--brand);
  color: #fff;
  border-radius: 11px;
  padding: 14px;
  font-size: 14.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
}
.ps-deposit {
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.45;
  margin-top: 11px;
}
.ps-deposit.center {
  text-align: center;
}

.ps-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17,32,39,.95);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  z-index: 1000;
  box-shadow: 0 8px 30px rgba(17,32,39,.2);
}

/* ===================== DESKTOP LAYOUT ===================== */
.pd-wrap {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
}
.pd-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 64px;
  border-bottom: 1.5px solid var(--line);
  background: rgba(250, 244, 239, 0.92);
  backdrop-filter: blur(8px);
  padding: 0 clamp(24px, 4vw, 54px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.pd-search {
  flex: 1;
  max-width: 320px;
  border: 1.5px solid var(--line);
  background: var(--card);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}
.pd-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pd-hicon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: var(--ink);
  position: relative;
}
.pd-hicon:hover {
  background: #f3eae3;
}
.pd-hicon i {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--brand);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-style: normal;
}
.pd-head-book {
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
}

.pd-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 24px clamp(24px, 4vw, 54px) 96px;
  flex: 1;
}
.pd-cover {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
}
.pd-cover-art {
  height: 180px;
  background: linear-gradient(135deg, var(--brand-deep), var(--brand) 65%, var(--gold));
  position: relative;
}
.pd-identity {
  padding: 0 24px 24px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-top: -38px;
}
.pd-avatar {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: linear-gradient(150deg, var(--brand), var(--brand-deep));
  color: #fff;
  font-family: 'Fraunces';
  font-weight: 700;
  font-size: 42px;
  display: grid;
  place-items: center;
  border: 4px solid var(--card);
  position: relative;
  flex-shrink: 0;
}
.pd-identity-main {
  flex: 1;
}
.pd-identity-main h1 {
  font-family: 'Fraunces';
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 1px 2px rgba(255,255,255,.9), 0 0 14px rgba(255,255,255,.55);
}
.pd-identity-main p {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(255,255,255,.9), 0 0 14px rgba(255,255,255,.55);
}
.pd-identity-actions {
  display: flex;
  gap: 8px;
}
.pd-book {
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 18px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pd-ghost {
  border: 1.5px solid var(--line);
  background: var(--card);
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pd-ghost:hover {
  background: #faf4ef;
}

.pd-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
}
.pd-tabs button {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--muted);
  padding: 8px 16px;
  border-radius: 8px;
}
.pd-tabs button:hover {
  background: rgba(14,116,144,.06);
  color: var(--ink);
}
.pd-tabs button.on {
  background: var(--brand);
  color: #fff;
}

.pd-home {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}
.pd-rail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pd-railcard {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
}
.pd-railcard h3 {
  font-family: 'Fraunces';
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.pd-railcard p {
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--muted);
}
.pd-raillink {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-deep);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
}
.pd-railmap {
  height: 90px;
  background: linear-gradient(135deg, #e1e9eb, #d2dce0);
  border-radius: 10px;
  display: grid;
  place-content: center;
  color: var(--brand);
  margin-bottom: 12px;
}
.pd-railbtns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}
.pd-railbtns button {
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 6px;
  font-size: 11.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.pd-trust-h {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-deep);
  margin-bottom: 6px;
}

.pd-feed {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.pd-sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1.5px solid var(--line);
  padding-bottom: 8px;
  margin-bottom: 12px;
}
.pd-sec-head h2 {
  font-family: 'Fraunces';
  font-size: 20px;
  font-weight: 700;
}
.pd-sec-head button {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-deep);
}
.pd-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Repairs and Services Rich Grid on Desktop */
.svc-feat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.svc-searchrow {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}
.svc-search {
  flex: 1;
  border: 1.5px solid var(--line);
  background: var(--card);
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.svc-search input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-family: inherit;
  font-size: 13.5px;
}
.svc-select {
  border: 1.5px solid var(--line);
  background: var(--card);
  padding: 8px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  outline: none;
}
.svc-results-head {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--muted);
  margin-bottom: 12px;
}
.svc-clear {
  font-weight: 700;
  color: var(--brand-deep);
}
.svc-empty {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 38px;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}
.svc-empty button {
  display: block;
  margin: 12px auto 0;
  background: var(--brand);
  color: #fff;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
}

.ct-wrap {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}
.ct-channels {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.ct-wa {
  background: var(--wa);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ct-alt {
  display: flex;
  gap: 12px;
  align-items: center;
}
.ct-email, .ct-phone {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brand-deep);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ct-form {
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 20px;
}
.ct-form-h {
  font-family: 'Fraunces';
  font-size: 17px;
  font-weight: 700;
  display: block;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
}

/* Reviews desk */
.rev-desk-wrap {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}
.rev-desk-rail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Acc elements */
.ps-drawer-back {
  position: fixed;
  inset: 0;
  background: rgba(17,32,39,.4);
  z-index: 80;
}
.ps-drawer {
  width: 260px;
  height: 100%;
  background: var(--bg);
  box-shadow: 6px 0 30px rgba(17,32,39,.12);
}
.ps-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}
.ps-id {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  padding-bottom: 16px;
  margin-bottom: 16px;
  width: 100%;
}
.ps-id-av {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
  color: #fff;
  font-family: 'Fraunces';
  font-weight: 700;
  font-size: 17px;
  display: grid;
  place-items: center;
}
.ps-id-main b {
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ps-id-main i {
  font-size: 11px;
  color: var(--muted);
  display: block;
  font-style: normal;
}
.ps-id-main em {
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 2px;
  font-style: normal;
  font-weight: 600;
  margin-top: 2px;
}
.ps-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.ps-nav button {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--muted);
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ps-nav button:hover {
  background: rgba(14,116,144,.05);
  color: var(--ink);
}
.ps-nav button.on {
  background: var(--brand);
  color: #fff;
}
.ps-panel-actions {
  border-top: 1px solid var(--line);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ps-act-book {
  width: 100%;
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.ps-act-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ps-act-row button {
  border: 1px solid var(--line);
  padding: 7px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.ps-panel-foot {
  margin-top: 14px;
}
.ps-panel-foot span {
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-deep);
  display: flex;
  align-items: center;
  gap: 4px;
}
.ps-panel-foot p {
  font-size: 10px;
  color: var(--muted);
  line-height: 1.35;
  margin-top: 2px;
}

.ps-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(250, 244, 239, 0.92);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--line);
  z-index: 50;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  place-items: center;
}
.ps-bottom button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--muted);
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: center;
}
.ps-bottom button.on {
  color: var(--brand);
}
.ps-fab {
  transform: translateY(-12px);
  width: 50px !important;
  height: 50px !important;
  background: var(--brand) !important;
  border-radius: 50% !important;
  color: #fff !important;
  box-shadow: 0 4px 16px rgba(14,116,144,.3);
  position: relative;
}
.ps-fab-ring {
  position: absolute;
  inset: -4px;
  border: 4px solid var(--bg);
  border-radius: 50%;
  pointer-events: none;
}
.ps-fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #cf2a2a;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-style: normal;
}

.ps-search-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-bottom: 1.5px solid var(--line);
  padding: 16px;
}
.ps-search-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ps-search-top input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: 15.5px;
}
.ps-search-lbl {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
  margin-top: 14px;
  margin-bottom: 8px;
}

/* Booking calendar elements */
.bk-cal {
  border: 1.5px solid var(--line);
  border-radius: 14px;
  background: var(--card);
  padding: 14px;
}
.bk-cal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.bk-cal-wd {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 6px;
}
.bk-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  place-items: center;
  gap: 4px;
}
.bk-cal-day {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.bk-cal-day.sel {
  background: var(--brand);
  color: #fff;
}
.bk-cal-day.off {
  opacity: .25;
  cursor: not-allowed;
}
.bk-cal-blank {
  width: 32px;
  height: 32px;
}

.bk-times {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.bk-slot {
  border: 1.5px solid var(--line);
  background: var(--card);
  padding: 8px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  text-align: center;
}
.bk-slot.taken {
  opacity: .3;
  cursor: not-allowed;
}

.bk-summary {
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: var(--card);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}
.bk-summary > div {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
}
.bk-summary span {
  color: var(--muted);
}
.bk-summary b {
  color: var(--ink);
}

.bk-input {
  width: 100%;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink);
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  outline: none;
  transition: .15s;
  margin-top: 7px;
}
.bk-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(14,116,144,.12);
}
.bk-textarea {
  min-height: 76px;
  resize: vertical;
}
.bk-deposit-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  margin-top: 18px;
  border-top: 1.5px solid var(--line);
  padding-top: 14px;
}
.bk-deposit-row span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ps-field-lbl {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
  margin-top: 14px;
}

.ps-notify-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.ps-notify-tag {
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--card);
}
.ps-notify-tag.on {
  border-color: var(--brand);
  color: var(--brand);
  background: #e4f1f4;
}

/* Share modal */
.ps-share-url {
  border: 1.5px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card);
  margin-bottom: 12px;
}
.ps-share-url span {
  font-size: 13.5px;
  color: var(--muted);
}
.ps-share-wa {
  width: 100%;
  background: var(--wa);
  color: #fff;
  border-radius: 9px;
  padding: 12px;
  font-size: 13.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-filter.active {
  background: var(--brand) !important;
  color: #fff !important;
  border-color: var(--brand) !important;
}

/* Confetti overlay */
.fw-confetti {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}
`;
