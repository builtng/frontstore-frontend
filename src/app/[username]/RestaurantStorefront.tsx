'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store as StoreIcon,
  Search, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft, Megaphone, Truck,
  ShieldCheck, Navigation, Lock, Plus, Minus, Copy, Instagram, Facebook,
  Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell, UtensilsCrossed, Users, Receipt
} from "lucide-react";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { InstagramIcon, TikTokIcon } from "../../components/SocialIcons";

import "./RestaurantStorefront.css";

// --- Types & Interfaces ---
interface StoreLink {
  id: string;
  title: string;
  url: string;
  platform: string;
  is_active: boolean;
}

interface StoreType {
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
  opts: string;
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

interface RestaurantStorefrontProps {
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

const parseClock = (s: string) => {
  const m = s.trim().match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return 0;
  let h = (+m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + (+m[2]);
};

const fmtMins = (min: number) => {
  const h = Math.floor(min / 60),
    m = min % 60,
    ap = h >= 12 ? "pm" : "am",
    hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")}${ap}`;
};

const fmtDateFull = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

// Custom hook to detect screen size
function useIsDesktop() {
  const q = "(min-width: 980px)";
  const [d, setD] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setD(window.matchMedia(q).matches);
    const m = window.matchMedia(q);
    const fn = (e: MediaQueryListEvent) => setD(e.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return d;
}

export default function RestaurantStorefront({
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
}: RestaurantStorefrontProps) {
  const isDesktop = useIsDesktop();
  const router = useRouter();

  // Page, navigation and simple overlays
  const [page, setPage] = useState("home");
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [share, setShare] = useState(false);
  const [annOff, setAnnOff] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingWaUrl, setPendingWaUrl] = useState<string | null>(null);

  // Booking Flow states
  const [bookOpen, setBookOpen] = useState(false);
  const [bookStep, setBookStep] = useState<"party" | "date" | "time" | "review">("party");
  const [bookDate, setBookDate] = useState<Date | null>(null);
  const [bookTime, setBookTime] = useState<string | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookNote, setBookNote] = useState("");
  const [bookParty, setBookParty] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [apiSlots, setApiSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Bag, Cart, and Checkout states
  const [bag, setBag] = useState(false); // Controls opening the bag sheet
  const [bagItems, setBagItems] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "success">("cart");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<CreatedOrderReceipt | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Sizing and Product Detail Page/Sheet states
  const [selProduct, setSelProduct] = useState<any>(null);
  const [selOpts, setSelOpts] = useState<Record<string, string>>({});

  // Notification Opt-in states
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyTopics, setNotifyTopics] = useState<string[]>(["services", "products", "offers", "news"]);

  // Review states
  const [reviewOpen, setReviewOpen] = useState(false);
  const [revRating, setRevRating] = useState(0);
  const [revText, setRevText] = useState("");
  const [revRef, setRevRef] = useState("");
  const [revPhoto, setRevPhoto] = useState<string | null>(null);

  // Filtering / Sorting states
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqQuery, setFaqQuery] = useState("");
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
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
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [prodPrice, setProdPrice] = useState("All");
  const [prodSort, setProdSort] = useState("popular");
  const [prodFaq, setProdFaq] = useState(0);

  const [revStar, setRevStar] = useState(0);
  const [revSort, setRevSort] = useState("recent");
  const [revPhotos, setRevPhotos] = useState(false);

  const [blogCat, setBlogCat] = useState("All");
  const [pfCat, setPfCat] = useState("All");
  const [post, setPost] = useState<any>(null);

  // Checkout details form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [orderNote, setOrderNote] = useState('');

  // Primary color branding defaults
  const primaryColor = store.primary_color || '#7a2638';

  const currencySymbols: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$', GBP: '£', EUR: '€' };
  const currencySymbol = currencySymbols[store.currency_code.toUpperCase()] || `${store.currency_code} `;
  const money = (n: number) => currencySymbol + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Classify products & services
  const isProductService = (product: Product) => {
    if (product.type === 'service') return true;
    const name = (product.name || '').toLowerCase();
    const cat = (product.category_id || '').toLowerCase();
    return name.includes('reservation') || name.includes('booking') || name.includes('table') || name.includes('catering') || name.includes('event') || name.includes('private dining');
  };

  const PRODUCTS = useMemo(() => products.filter(p => !isProductService(p)), [products]);
  const SERVICES = useMemo(() => products.filter(p => isProductService(p)), [products]);

  // Inject default reservation service if none configured
  const computedServices = useMemo(() => {
    if (SERVICES.length > 0) return SERVICES;
    return [{
      id: "default-table-reservation",
      name: "Table Reservation",
      price: "0",
      slug: "table-reservation",
      type: "service" as const,
      category_id: null,
      description: "Reserve a table for dining in. Confirmed instantly on WhatsApp.",
      stock_status: "in_stock",
      image_urls: null,
    }];
  }, [SERVICES]);

  // Dynamic Options Generator for products
  const getProductOptions = (p: Product) => {
    const name = (p.name || '').toLowerCase();
    if (name.includes('jollof') || name.includes('rice') || name.includes('pasta') || name.includes('main')) {
      return [
        { label: "Portion", choices: ["Regular", "Large"] },
        { label: "Side", choices: ["Fried plantain", "Coleslaw", "Side salad"] }
      ];
    }
    if (name.includes('suya') || name.includes('asun') || name.includes('goat') || name.includes('wings') || name.includes('grill') || name.includes('pepper')) {
      return [
        { label: "Spice Level", choices: ["Medium", "Hot", "Extra Hot"] },
        { label: "Portion Size", choices: ["Regular Portion", "Sharing Platter"] }
      ];
    }
    if (name.includes('soup') || name.includes('okra') || name.includes('egusi') || name.includes('swallow')) {
      return [
        { label: "Swallow Option", choices: ["Pounded Yam", "Eba", "Semovita", "Wheat"] }
      ];
    }
    if (name.includes('chapman') || name.includes('drink') || name.includes('cocktail') || name.includes('juice') || name.includes('soda')) {
      return [
        { label: "Serve Option", choices: ["Single Glass", "Sharing Jug"] }
      ];
    }
    if (name.includes('cake') || name.includes('dessert') || name.includes('chocolate') || name.includes('fondant')) {
      return [
        { label: "Preparation", choices: ["Serve Warm", "Serve Chilled"] }
      ];
    }
    return [];
  };

  // Dynamic preparation note generator
  const getProductPrepNote = (p: Product) => {
    const name = (p.name || '').toLowerCase();
    if (name.includes('jollof') || name.includes('rice') || name.includes('pasta')) {
      return "Cooked to order, allow about 25 minutes";
    }
    if (name.includes('suya') || name.includes('asun') || name.includes('goat') || name.includes('grill')) {
      return "Flame grilled fresh on order";
    }
    if (name.includes('okra') || name.includes('soup') || name.includes('egusi')) {
      return "Cooked fresh in small batches";
    }
    if (name.includes('chapman') || name.includes('cocktail') || name.includes('drink')) {
      return "Mixed fresh at the bar";
    }
    if (name.includes('fondant') || name.includes('cake') || name.includes('dessert')) {
      return "Baked fresh, allow 15 minutes";
    }
    return null;
  };

  const ping = (m: string) => { setToast(m); };
  const go = (p: string) => { setPost(null); setSelProduct(null); setPage(p); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPost = (p: any) => { setPost(p); setPage("post"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openProduct = (p: any) => {
    setSelProduct(p);
    const opts = getProductOptions(p);
    setSelOpts(Object.fromEntries(opts.map((o) => [o.label, o.choices[0]])));
    setPage("product"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load Saved Client Profile & Cart
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

  // Cart operations
  const addToBag = (p: Product) => {
    const optsObj = getProductOptions(p);
    const vals = optsObj.map((o) => selOpts[o.label] || o.choices[0]);
    const key = p.id + (vals.length ? "|" + vals.join("|") : "");
    const optsStr = vals.join("  ·  ");
    setBagItems((items) => {
      const next = items.find((b) => b.key === key)
        ? items.map((b) => b.key === key ? { ...b, qty: b.qty + 1 } : b)
        : [...items, { key, id: p.id, name: p.name, price: parseFloat(p.price), opts: optsStr, qty: 1, type: 'product' as const }];
      saveCartToStorage(next);
      return next;
    });
    ping("Added to your order");
  };

  const setQty = (key: string, d: number) => {
    setBagItems((items) => {
      const next = items.map((b) => b.key === key ? { ...b, qty: Math.max(1, b.qty + d) } : b);
      saveCartToStorage(next);
      return next;
    });
  };

  const removeItem = (key: string) => {
    setBagItems((items) => {
      const next = items.filter((b) => b.key !== key);
      saveCartToStorage(next);
      return next;
    });
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/${store.username}`);
    ping("Store link copied");
  };

  // Toast Timer
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  // Hours / dates helpers
  const todayIdx = (new Date().getDay() + 6) % 7;
  const sameDay = (a: Date, b: Date | null) => !!(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());

  const HOURS = useMemo(() => {
    if (store.working_hours) {
      try {
        const parsed = typeof store.working_hours === 'string' ? JSON.parse(store.working_hours) : store.working_hours;
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      ["Mon", "Closed"], ["Tue", "12:00pm - 11:00pm"], ["Wed", "12:00pm - 11:00pm"],
      ["Thu", "12:00pm - 11:00pm"], ["Fri", "12:00pm - 12:00am"], ["Sat", "12:00pm - 12:00am"], ["Sun", "1:00pm - 10:00pm"],
    ];
  }, [store]);

  const hoursForDate = (d: Date) => HOURS[(d.getDay() + 6) % 7][1];

  const fetchAvailableSlots = async (svcId?: string) => {
    setLoadingSlots(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
      const url = svcId && svcId !== 'default-table-reservation'
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

  const getDaySlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayApiSlots = apiSlots.filter(s => s.slot_date === dateStr);
    if (dayApiSlots.length > 0) {
      return dayApiSlots.map(s => ({
        id: s.id,
        time: s.start_time.substring(0, 5) + (parseInt(s.start_time.substring(0, 2)) >= 12 ? ' PM' : ' AM'),
        rawTime: s.start_time,
        capacity: s.capacity,
        bookings_count: s.bookings_count || 0
      }));
    }
    
    // Fallback virtual slots
    const workingHours = hoursForDate(date);
    if (workingHours === "Closed") return [];
    
    const [openStr, closeStr] = workingHours.split(" - ");
    const openMins = parseClock(openStr);
    const closeMins = parseClock(closeStr);
    
    const slotsList = [];
    for (let m = openMins; m <= closeMins - 90; m += 60) {
      const hr = Math.floor(m / 60);
      const minStr = String(m % 60).padStart(2, "0");
      const ap = hr >= 12 ? "pm" : "am";
      const hh = hr % 12 || 12;
      slotsList.push({
        id: `virtual-${dateStr}-${m}`,
        time: `${hh}:${minStr} ${ap.toUpperCase()}`,
        rawTime: `${String(hr).padStart(2, '0')}:${minStr}`,
        capacity: 10,
        bookings_count: 0
      });
    }
    return slotsList;
  };

  const openBooking = () => {
    setBookStep("party"); setBookDate(null); setBookTime(null); setBookParty(null); setBookName(""); setBookNote("");
    setCalMonth(new Date()); setDrawer(false); setBookOpen(true);
    fetchAvailableSlots();
  };

  const handleBookingSubmit = async () => {
    if (!bookName.trim() || !bookParty || !bookDate || !bookTime) {
      ping("Fill in all reservation fields");
      return;
    }
    setCheckoutLoading(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
    
    const selectedSlotObj = getDaySlots(bookDate).find(s => s.time === bookTime);
    const isVirtual = selectedSlotObj?.id.startsWith('virtual-');
    
    let bookingResult: any = null;
    const formattedDate = bookDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const compiledNotes = `Guests: ${bookParty} | Notes: ${bookNote || 'None'}`;
    
    if (!isVirtual && selectedSlotObj) {
      try {
        const res = await fetch(`${API_URL}/v1/public/store/${username}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot_id: selectedSlotObj.id,
            customer_name: bookName,
            customer_phone: customerPhone || 'Unspecified',
            notes: compiledNotes
          })
        });
        const json = await res.json();
        if (json && json.status === 'success') {
          bookingResult = json.data;
        }
      } catch (err) {
        console.error("Booking API error:", err);
      }
    }

    // Direct WhatsApp Message redirection
    const wsText = `Hello *${store.store_name}*! I'd like to request a table reservation:\n\n`
      + `👤 *Name*: ${bookName}\n`
      + `👥 *Party size*: ${bookParty === '7 or more' ? '7+ guests' : bookParty + ' guests'}\n`
      + `📅 *Date*: ${formattedDate}\n`
      + `⏰ *Time*: ${bookTime}\n`
      + `📝 *Notes*: ${bookNote || 'None'}\n\n`
      + (bookingResult ? `👉 *Booking Ref*: #${bookingResult.id.substring(0, 8).toUpperCase()}\n` : '');

    setBookOpen(false);
    setPendingWaUrl(`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(wsText)}`);
    setCheckoutLoading(false);
  };

  // Submit checkout order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      ping('Name and WhatsApp number are required.');
      return;
    }
    setCheckoutLoading(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');

    // Compile options and notes into delivery address so merchant sees choices
    const itemsDetail = bagItems.map(item => `${item.name} (${item.opts || 'No options'})`).join('; ');
    let compiledAddress = deliveryMethod === 'delivery' ? deliveryAddress : 'Customer Pickup';
    
    if (itemsDetail) {
      compiledAddress += ` | Choices: ${itemsDetail}`;
    }
    if (orderNote) {
      compiledAddress += ` | Notes: ${orderNote}`;
    }

    try {
      const res = await fetch(`${API_URL}/v1/public/store/${username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          customer_whatsapp: customerWhatsapp || customerPhone,
          delivery_method: deliveryMethod,
          delivery_address: compiledAddress,
          items: bagItems.map(item => ({
            product_id: item.id,
            quantity: item.qty
          }))
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to place order.');

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

      setBagItems([]);
      saveCartToStorage([]);
      setOrderReceipt(json.data);
      setCheckoutStep('success');
      ping('Order placed successfully!');
    } catch (err: any) {
      ping(err.message || 'Something went wrong.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!orderReceipt) return;
    setIsPaying(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
    try {
      const res = await fetch(`${API_URL}/v1/public/orders/${orderReceipt.order.id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Payment initialization failed.');
      if (json.data && json.data.authorization_url) {
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error('Secure payment link unavailable.');
      }
    } catch (err: any) {
      ping(err.message || 'Failed to initialize payment.');
    } finally {
      setIsPaying(false);
    }
  };

  const activeCategories = useMemo(() => {
    const ids = new Set(PRODUCTS.map(p => p.category_id).filter(Boolean));
    return categories.filter(c => ids.has(c.id));
  }, [categories, PRODUCTS]);

  // Featured Mains signature dishes
  const displayFeatured = useMemo(() => {
    return PRODUCTS.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      type: "product" as const,
      cat: categories.find(c => c.id === p.category_id)?.name || 'Mains',
      desc: p.description,
      popular: true,
      productRef: p
    }));
  }, [PRODUCTS, categories]);

  const activeCategoryName = useMemo(() => {
    if (!activeCat) return '';
    return categories.find(c => c.id === activeCat)?.name || '';
  }, [activeCat, categories]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS
      .filter(p => !activeCat || p.category_id === activeCat)
      .filter(p => {
        if (!prodQuery.trim()) return true;
        const q = prodQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (prodSort === 'priceAsc') return parseFloat(a.price) - parseFloat(b.price);
        if (prodSort === 'priceDesc') return parseFloat(b.price) - parseFloat(a.price);
        return 0;
      });
  }, [PRODUCTS, activeCat, prodQuery, prodSort]);

  const bagCount = bagItems.reduce((n, b) => n + b.qty, 0);
  const subtotal = bagItems.reduce((n, b) => n + b.price * b.qty, 0);

  const displayPortfolio = useMemo(() => {
    return portfolio || [];
  }, [portfolio]);

  const pfCats = useMemo(() => {
    return Array.from(new Set(displayPortfolio.map((p: any) => p.cat).filter(Boolean))) as string[];
  }, [displayPortfolio]);

  const displayBlog = useMemo(() => {
    return blog || [];
  }, [blog]);

  const displayFaqs = useMemo(() => {
    if (faqs && faqs.length > 0) {
      return [
        {
          cat: "General FAQs",
          icon: ShieldCheck,
          items: faqs.map(f => [f.question, f.answer] as [string, string])
        }
      ];
    }
    return [] as any[];
  }, [faqs]);

  const ABOUT_FACTS = useMemo(() => {
    if (store.about_facts) {
      try {
        const parsed = typeof store.about_facts === 'string' ? JSON.parse(store.about_facts) : store.about_facts;
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  }, [store]);

  const RECOGNITION = useMemo(() => {
    if (store.recognition) {
      try {
        const parsed = typeof store.recognition === 'string' ? JSON.parse(store.recognition) : store.recognition;
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  }, [store]);

  const AUTHOR = useMemo(() => {
    return {
      name: store.founder_name || "",
      initial: (store.founder_name || store.store_name || "S").charAt(0),
      role: store.founder_role || "",
      bio: store.founder_bio || "",
      long: store.founder_bio || "",
      quote: store.founder_quote || "",
      specialities: store.founder_specialities || [],
      socials: store.founder_socials || {},
      credentials: store.founder_credentials || [],
    };
  }, [store]);

  const displayReviews = useMemo(() => {
    return reviews || [];
  }, [reviews]);

  const faqFiltered = useMemo(() => {
    const faqQ = faqQuery.trim().toLowerCase();
    return displayFaqs
      .map((g) => ({ ...g, items: faqQ ? g.items.filter(([q, a]: [string, string]) => (q + " " + a).toLowerCase().includes(faqQ)) : g.items }))
      .filter((g) => g.items.length > 0);
  }, [displayFaqs, faqQuery]);

  const blogList = useMemo(() => {
    return blogCat === "All" ? displayBlog : displayBlog.filter((b) => b.cat === blogCat);
  }, [displayBlog, blogCat]);

  const pfList = useMemo(() => {
    return pfCat === "All" ? displayPortfolio : displayPortfolio.filter((p) => p.cat === pfCat);
  }, [displayPortfolio, pfCat]);

  const faqId = (c: string) => "faq-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const termId = (c: string) => "tm-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const NAV = [
    ["home", "Home"], ["products", "Menu"], ["portfolio", "Gallery"], ["reviews", "Reviews"], ["blog", "Blog"],
    ["about", "About"], ["faq", "FAQ"], ["contact", "Contact"],
  ].filter(([id]) => {
    if (id === 'home') return true;
    return (store.storefront_sections || []).includes(id);
  });
  const LEGAL = [["returns", "Refunds"], ["terms", "Terms"], ["privacy", "Privacy"]];

  const EmptyState = () => (
    <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '14.5px', color: 'var(--muted)', width: '100%' }}>
      Nothing to see here, comeback later
    </div>
  );

  // Helper render components
  const SectionHead = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
    <div className="ps-sec-head">
      <h2>{title}</h2>
      {action && onAction && <button onClick={onAction}>{action}</button>}
    </div>
  );

  const ServiceCard = ({ s, onBook }: { s: any; onBook: () => void }) => {
    const isDefault = s.id === 'default-table-reservation';
    return (
      <div className="ps-card">
        <div className="ps-card-thumb svc"><UtensilsCrossed size={36} strokeWidth={1.2} /></div>
        <div className="ps-card-body">
          <b>{s.name}</b>
          <span className="ps-card-sub">{s.description || 'Service booking'}</span>
          <div className="ps-card-foot">
            <em>{parseFloat(s.price) === 0 ? 'Free' : money(parseFloat(s.price))}</em>
            <button className="ps-mini" onClick={onBook}>{isDefault ? 'Reserve' : 'Book'}</button>
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ p, onOpen }: { p: any; onOpen: () => void }) => {
    const hasImage = p.image_urls && p.image_urls.length > 0;
    const catName = categories.find(c => c.id === p.category_id)?.name || 'Mains';
    return (
      <div className="ps-card prod-card" onClick={onOpen}>
        <div className="ps-card-thumb prod" style={hasImage ? { backgroundImage: `url(${p.image_urls![0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          {!hasImage && <UtensilsCrossed size={32} strokeWidth={1.2} />}
          {p.stock_status === 'out_of_stock' && <span className="feat-rib" style={{ color: 'var(--brand)' }}>OOS</span>}
        </div>
        <div className="ps-card-body">
          <b>{p.name}</b>
          <span className="ps-card-sub">{catName}</span>
          <div className="ps-card-foot">
            <em>{money(parseFloat(p.price))}</em>
            <button className="ps-mini" onClick={(e) => { e.stopPropagation(); onOpen(); }}>View</button>
          </div>
        </div>
      </div>
    );
  };

  const RatingSummary = () => {
    const score = store.rating || 4.8;
    const count = store.review_count || 526;
    return (
      <div className="ps-rating">
        <div className="ps-rating-score">
          <b>{score}</b>
          <div className="ps-rating-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className="f" />
            ))}
          </div>
          <span>{count} ratings</span>
          <i>Verified orders</i>
        </div>
        <div className="ps-rating-bars">
          <div className="ps-bar"><span>5 star</span><div><i style={{ width: "80%" }} /></div><span>80%</span></div>
          <div className="ps-bar"><span>4 star</span><div><i style={{ width: "14%" }} /></div><span>14%</span></div>
          <div className="ps-bar"><span>3 star</span><div><i style={{ width: "4%" }} /></div><span>4%</span></div>
        </div>
      </div>
    );
  };

  const Accordion = ({ items, open, setOpen }: { items: [string, string][]; open: number | null; setOpen: (i: number | null) => void }) => (
    <div className="ps-acc">
      {items.map(([q, a], idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className={`ps-acc-item ${isOpen ? "open" : ""}`}>
            <button onClick={() => setOpen(isOpen ? null : idx)}>{q} <ChevronDown size={16} /></button>
            {isOpen && <p>{a}</p>}
          </div>
        );
      })}
    </div>
  );

  const StoreFoot = ({ onNav }: { onNav: (p: string) => void }) => (
    <footer className="ps-foot">
      <span className="ps-foot-secure"><ShieldCheck size={16} /> Secured by Frontstore</span>
      <p>Your payment is held protected by Frontstore until your order or reservation is fully completed.</p>
      <div className="ps-foot-links">
        {LEGAL.map(([id, label]) => <button key={id} onClick={() => onNav(id)}>{label}</button>)}
      </div>
      <small>© 2026 {store.store_name}. Powered by Frontstore.</small>
    </footer>
  );

  const Sheet = ({ title, onClose, onBack, children }: { title: string; onClose: () => void; onBack?: () => void; children: React.ReactNode }) => (
    <div className="ps-overlay">
      <div className="ps-sheet">
        <div className="ps-sheet-grip" />
        <div className="ps-sheet-head">
          {onBack ? <button onClick={onBack} className="ps-sheet-back" aria-label="Back"><ChevronLeft size={20} /></button> : <span className="ps-sheet-back-sp" />}
          <b>{title}</b>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );

  // Reservation Flow
  const bookingFlow = () => {
    const titles = { party: "How many guests?", date: "Choose a date", time: "Choose a time", review: "Confirm reservation" };
    const backTo = { date: "party", time: "date", review: "time" } as const;
    const onBack = backTo[bookStep as keyof typeof backTo] ? () => setBookStep(backTo[bookStep as keyof typeof backTo]) : undefined;
    const horizon = 90; // 3 months ahead
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const horizonDate = new Date();
    horizonDate.setDate(today.getDate() + horizon);
    
    const y = calMonth.getFullYear(), mo = calMonth.getMonth();
    const monthStart = new Date(y, mo, 1);
    const offset = (monthStart.getDay() + 6) % 7; // Mon is 0
    const dim = new Date(y, mo + 1, 0).getDate();
    
    const prevOff = monthStart <= new Date(today.getFullYear(), today.getMonth(), 1);
    const nextOff = monthStart >= new Date(horizonDate.getFullYear(), horizonDate.getMonth(), 1);
    
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(new Date(y, mo, d));
    
    const slotsList = bookDate ? getDaySlots(bookDate) : [];
    const partySizes = ["1", "2", "3", "4", "5", "6", "7 or more"];
    
    const resBar = (bookParty || bookDate) && (
      <div className="bk-svcbar">
        <span>
          <b>{bookParty ? (bookParty === "1" ? "1 guest" : bookParty + " guests") : "Table"}</b>
          <i>{bookDate ? fmtDateFull(bookDate) : "Pick a date"}{bookTime ? "  ·  " + bookTime : ""}</i>
        </span>
        <button onClick={() => setBookStep("party")}>Change</button>
      </div>
    );

    return (
      <Sheet onClose={() => setBookOpen(false)} onBack={onBack} title={titles[bookStep]}>
        <div className="ps-sheet-body">
          {bookStep === "party" && (
            <>
              <p className="ps-sheet-sub">How many people are dining?</p>
              <div className="bk-party">
                {partySizes.map((n) => (
                  <button key={n} className={`bk-partybtn ${bookParty === n ? "sel" : ""}`} onClick={() => { setBookParty(n); setBookStep("date"); }}>
                    <Users size={17} /> {n}
                  </button>
                ))}
              </div>
              <p className="ps-deposit"><Lock size={12} /> Larger groups may be seated across tables. Add any seating preference in the notes.</p>
            </>
          )}

          {bookStep === "date" && (
            <>
              {resBar}
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
                    const isClosed = hoursForDate(c) === "Closed";
                    const isPast = c < today;
                    const isTooFar = c > horizonDate;
                    const off = isClosed || isPast || isTooFar;
                    const sel = sameDay(c, bookDate);
                    return (
                      <button key={i} disabled={off} className={`bk-cal-day ${sel ? "sel" : ""} ${off ? "off" : ""}`}
                        onClick={() => { if (!off) { setBookDate(c); setBookTime(null); setBookStep("time"); } }}>{c.getDate()}</button>
                    );
                  })}
                </div>
                <p className="ps-deposit"><Lock size={12} /> Closed days and past dates cannot be selected. You can reserve up to three months ahead.</p>
              </div>
            </>
          )}

          {bookStep === "time" && (
            <>
              {resBar}
              <p className="ps-field-lbl">{bookDate ? fmtDateFull(bookDate) : ''}</p>
              {loadingSlots ? (
                <p className="bk-empty">Loading available tables...</p>
              ) : slotsList.length > 0 ? (
                <div className="bk-times">
                  {slotsList.map((slot) => {
                    const taken = slot.bookings_count >= slot.capacity;
                    return (
                      <button key={slot.id} disabled={taken} className={`bk-slot ${taken ? "taken" : ""}`}
                        onClick={() => { if (!taken) { setBookTime(slot.time); setBookStep("review"); } }}>
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="bk-empty">No tables available on this day. Try another date.</p>
              )}
            </>
          )}

          {bookStep === "review" && (
            <>
              {resBar}
              <div className="bk-summary">
                <div><span>Guests</span><b>{bookParty}</b></div>
                <div><span>Date</span><b>{bookDate ? fmtDateFull(bookDate) : ''}</b></div>
                <div><span>Time</span><b>{bookTime}</b></div>
              </div>
              <p className="ps-field-lbl">Your name</p>
              <input className="bk-input" value={bookName} onChange={(e) => setBookName(e.target.value)} placeholder="Name on the reservation" />
              <p className="ps-field-lbl">Anything we should know? (optional)</p>
              <textarea className="bk-input bk-textarea" value={bookNote} onChange={(e) => setBookNote(e.target.value)} placeholder="Occasion, seating preference, allergies, anything useful" />
              <p className="ps-deposit"><Lock size={12} /> No payment needed to reserve. We confirm your table on WhatsApp, usually within minutes.</p>
              <button className="ps-sheet-cta" disabled={!bookName.trim() || checkoutLoading} onClick={handleBookingSubmit}>
                {checkoutLoading ? 'Booking Table...' : 'Request table'}
              </button>
            </>
          )}
        </div>
      </Sheet>
    );
  };

  // Product detail view layout
  const productView = () => {
    const p = selProduct;
    if (!p) return null;
    const hasImage = p.image_urls && p.image_urls.length > 0;
    const g = "c" + (categories.findIndex(c => c.id === p.category_id) % 4);
    const catName = categories.find(c => c.id === p.category_id)?.name || 'Mains';
    const optsObj = getProductOptions(p);
    const prepNote = getProductPrepNote(p);
    const more = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3);
    
    return (
      <div className="pv">
        <button className="pv-back" onClick={() => go("products")}><ChevronLeft size={16} /> Back to menu</button>
        <div className="pv-grid">
          <div className="pv-gallery">
            <div className={`pv-main ${g}`} style={hasImage ? { backgroundImage: `url(${p.image_urls[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!hasImage && <UtensilsCrossed className="pv-main-icn" size={40} />}
              {p.compare_at_price && <span className="pv-tag"><Star size={11} fill="var(--gold)" color="var(--gold)" /> Special</span>}
              <span className="pv-cat">{catName}</span>
            </div>
            {hasImage && p.image_urls.length > 1 && (
              <div className="pv-thumbs">
                {p.image_urls.map((url: string, idx: number) => (
                  <span key={idx} className="pv-thumb" style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ))}
              </div>
            )}
          </div>
          <div className="pv-info">
            <span className="pv-infocat">{catName}</span>
            <h1 className="pv-name">{p.name}</h1>
            <div className="pv-price">{money(parseFloat(p.price))}</div>
            {p.description && <p className="pv-desc">{p.description}</p>}

            {optsObj.map((o) => (
              <div key={o.label} style={{ marginBottom: 14 }}>
                <div className="pv-row"><span className="pv-label">{o.label}</span></div>
                <div className="pv-sizes">
                  {o.choices.map((ch) => (
                    <button key={ch} className={`pv-size ${selOpts[o.label] === ch ? "on" : ""}`} onClick={() => setSelOpts((sx) => ({ ...sx, [o.label]: ch }))}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pv-twocta">
              <button className="ps-sheet-cta pv-add" onClick={() => addToBag(p)} disabled={p.stock_status === 'out_of_stock'}>
                <ShoppingBag size={17} /> {p.stock_status === 'out_of_stock' ? 'Sold Out' : 'Add to order'}
              </button>
              <button className="pv-reserve" onClick={openBooking}><Calendar size={16} /> Reserve a table</button>
            </div>

            <div className="pv-meta">
              {prepNote && <div><Clock size={15} /><span>{prepNote}</span></div>}
              <div><Truck size={15} /><span>Delivery across Lagos or free self-pickup / dine-in on Victoria Island.</span></div>
              <div><ShieldCheck size={15} /><span>Secured by Frontstore. Your payment is held safe with platform buyer protection.</span></div>
            </div>
          </div>
        </div>
        <div className="pv-look">
          <h2 className="pv-look-h">More from the menu</h2>
          <div className="ps-grid">{more.map((x) => <ProductCard key={x.id} p={x} onOpen={() => openProduct(x)} />)}</div>
        </div>
        <StoreFoot onNav={go} />
      </div>
    );
  };

  // Review item card rich detail
  const ReviewCardRich = ({ rv }: { rv: any }) => (
    <div className="rev-card">
      <div className="rev-card-head">
        <span className="rev-av">{(rv.reviewer_name || rv.name || "C").charAt(0)}</span>
        <div className="rev-card-who">
          <b>{rv.reviewer_name || rv.name}</b>
          <span>{rv.when || "Verified customer"} <span className="ps-dot">•</span> <span className="rev-verif"><BadgeCheck size={11} /> Verified order</span></span>
        </div>
        <div className="rev-card-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} className={i < (rv.rating || rv.r) ? "f" : ""} />
          ))}
        </div>
      </div>
      {rv.service && <span className="rev-card-svc">{rv.service}</span>}
      <p className="rev-card-text">{rv.body || rv.text}</p>
    </div>
  );

  const reviewForm = () => (
    <Sheet onClose={() => setReviewOpen(false)} title="Leave a review">
      <div className="ps-sheet-body">
        <p className="rev-intro">Help others discover Chef {store.founder_name ? store.founder_name.split(' ')[0] : 'Chinelo'}'s kitchen. Only customers with a confirmed order can post a review.</p>
        <div className="rev-form-note"><ShieldCheck size={15} /> Reviews are verify-locked to order references. The restaurant cannot delete reviews.</div>
        
        <p className="ps-field-lbl">Rating</p>
        <div className="rev-rate" style={{ marginBottom: 16 }}>
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setRevRating(n)} aria-label={`${n} Star`}>
              <Star size={24} className={n <= revRating ? "f" : ""} />
            </button>
          ))}
        </div>

        <p className="ps-field-lbl">Order Reference ID *</p>
        <input className="rev-input" value={revRef} onChange={(e) => setRevRef(e.target.value)} placeholder="e.g. FS-12345" style={{ marginBottom: 16 }} />

        <p className="ps-field-lbl">Your review</p>
        <textarea className="rev-textarea" value={revText} onChange={(e) => setRevText(e.target.value)} placeholder="How was the food, service and room?" style={{ marginBottom: 18 }} />

        <button className="ps-sheet-cta" onClick={() => { setReviewOpen(false); ping("Thank you! Review submitted for verification."); }}>
          Submit verified review
        </button>
      </div>
    </Sheet>
  );

  const orderForm = () => {
    return (
      <Sheet onClose={() => setBag(false)} title={checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Details' : 'Order Placed'}>
        <div className="ps-sheet-body">
          {checkoutStep !== 'success' && (
            <div className="rst-steps" style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <button className={`rst-step ${checkoutStep === 'cart' ? 'active' : ''}`} style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '8px 0', border: 'none', background: checkoutStep === 'cart' ? 'var(--brand)' : 'none', color: checkoutStep === 'cart' ? '#fff' : 'var(--brand)', borderRadius: 6 }} onClick={() => setCheckoutStep('cart')}>Cart</button>
              <button className={`rst-step ${checkoutStep === 'details' ? 'active' : ''}`} style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '8px 0', border: 'none', background: checkoutStep === 'details' ? 'var(--brand)' : 'none', color: checkoutStep === 'details' ? '#fff' : 'var(--brand)', borderRadius: 6 }} onClick={() => setCheckoutStep('details')}>Details</button>
            </div>
          )}

          {checkoutStep === 'cart' && (
            bagItems.length === 0 ? (
              <div className="ps-bag-empty">
                <ShoppingBag size={38} style={{ color: 'var(--muted)', display: 'block', margin: '0 auto 12px' }} />
                <span>Your order bag is empty. Browse the menu to add dishes.</span>
              </div>
            ) : (
              <>
                {bagItems.map((b) => (
                  <div className="ps-bag-line" key={b.key}>
                    <div className="ps-bag-th"><UtensilsCrossed size={16} /></div>
                    <div>
                      <b>{b.name}</b>
                      {b.opts && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{b.opts}</span>}
                      <span>{money(b.price * b.qty)}</span>
                      <button className="ps-bag-rm" onClick={() => removeItem(b.key)}>Remove</button>
                    </div>
                    <div className="ps-qty">
                      <button onClick={() => setQty(b.key, -1)}><Minus size={12} /></button>
                      <span>{b.qty}</span>
                      <button onClick={() => setQty(b.key, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="ps-bag-total">
                  <span>Subtotal</span>
                  <b>{money(subtotal)}</b>
                </div>
                <p className="ps-deposit"><Lock size={12} /> Secure platform order. Final delivery fees calculated by distance.</p>
                <button className="ps-sheet-cta" onClick={() => setCheckoutStep('details')}>Proceed to Details</button>
                
                <button className="bk-ghost" onClick={() => {
                  const wsText = `Hello *${store.store_name}*! I'd like to place an order from the menu:\n\n`
                    + bagItems.map(item => `• ${item.qty}x ${item.name} (${item.opts || 'No options'}) — ${money(item.price * item.qty)}`).join('\n')
                    + `\n\n💰 *Subtotal*: ${money(subtotal)}\n\n`
                    + `Could you let me know the delivery/pickup details? Thank you!`;
                  setBag(false);
                  setPendingWaUrl(`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(wsText)}`);
                }}>
                  <WhatsAppIcon size={16} /> Order via WhatsApp
                </button>
              </>
            )
          )}

          {checkoutStep === 'details' && (
            <form onSubmit={handleCheckoutSubmit}>
              <label className="th-label">Your Name *</label>
              <input className="bk-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full name for delivery/pickup" required style={{ marginBottom: 14 }} />

              <label className="th-label">WhatsApp Number *</label>
              <input className="bk-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. +234..." required style={{ marginBottom: 14 }} type="tel" />

              <label className="th-label">Email (optional)</label>
              <input className="bk-input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="For order receipts" style={{ marginBottom: 14 }} type="email" />

              <label className="th-label">How to receive</label>
              <select className="th-select" value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as any)} style={{ width: '100%', padding: '11px 13px', borderRadius: '11px', border: '1px solid var(--line)', background: 'var(--card)', marginBottom: 14 }}>
                <option value="pickup">Self-Pickup / Dine-in</option>
                <option value="delivery">Delivery to Address</option>
              </select>

              {deliveryMethod === 'delivery' && (
                <>
                  <label className="th-label">Delivery Address *</label>
                  <textarea className="bk-input bk-textarea" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Full address (Street name, Area, City, State)" required style={{ marginBottom: 14 }} />
                </>
              )}

              <label className="th-label">Dishes instructions / preferences (optional)</label>
              <textarea className="bk-input bk-textarea" value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Less spice, allergies, extra plantain..." style={{ marginBottom: 14 }} />

              <p style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}><Lock size={12} /> Secured checkout. Your details are safe with {appName}.</p>

              <button type="submit" className="ps-sheet-cta" disabled={checkoutLoading}>
                {checkoutLoading ? 'Placing Order...' : `Place Order · ${money(subtotal)}`}
              </button>
            </form>
          )}

          {checkoutStep === 'success' && orderReceipt && (
            <div className="th-receipt" style={{ padding: "20px 0" }}>
              <div className="th-receipt-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Receipt size={48} style={{ color: 'var(--brand)' }} /></div>
              <h2 className="th-receipt-title" style={{ fontFamily: 'Fraunces', fontSize: 24, textAlign: 'center', marginBottom: 8 }}>Order Confirmed!</h2>
              <p className="th-receipt-sub" style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 20 }}>Your order has been placed. Tap below to track it and notify the store on WhatsApp.</p>
              <div className="th-receipt-detail" style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, border: '1px solid var(--line)', marginBottom: 20 }}>
                <div className="th-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>Order #</span><b>{orderReceipt.order.order_number}</b></div>
                <div className="th-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>Status</span><b style={{ color: 'var(--ok)' }}>{orderReceipt.order.order_status}</b></div>
                <div className="th-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>Payment</span><b>{orderReceipt.order.payment_status}</b></div>
                <div className="th-receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Total</span><b>{money(orderReceipt.order.total_amount)}</b></div>
              </div>
              {orderReceipt.whatsapp_url && (
                <button className="th-wa-btn" style={{ background: '#25D366', color: '#fff', padding: '13px', width: '100%', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }} onClick={() => setPendingWaUrl(orderReceipt.whatsapp_url)}>
                  <WhatsAppIcon size={18} /> Confirm Order on WhatsApp
                </button>
              )}
              <button className="ps-sheet-cta" onClick={handlePayOnline} disabled={isPaying} style={{ background: 'var(--brand)', color: '#fff', padding: '13px', width: '100%', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                {isPaying ? 'Redirecting to payment...' : 'Pay Securely Online Now'}
              </button>
              <button className="bk-ghost" style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--ink)', padding: '12px', width: '100%', fontWeight: 600, borderRadius: '12px', display: 'block', textAlign: 'center' }} onClick={() => { setBag(false); setCheckoutStep('cart'); setOrderReceipt(null); }}>Continue Shopping</button>
            </div>
          )}
        </div>
      </Sheet>
    );
  };

  return (
    <div className="ps-root" style={{
      '--brand': primaryColor,
      '--brand-deep': `color-mix(in srgb, ${primaryColor} 80%, black)`,
    } as React.CSSProperties}>
      <WhatsAppDisclaimerModal open={!!pendingWaUrl} storeName={store.store_name}
        onConfirm={() => { window.open(pendingWaUrl!, '_blank'); setPendingWaUrl(null); }}
        onCancel={() => setPendingWaUrl(null)} />

      {/* ============ MOBILE ============ */}
      {!isDesktop && (
        <div className="ps-col">
          <header className="ps-top">
            <button className="ps-burger" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={22} /></button>
            <button className="ps-logo as-btn" onClick={() => go("home")}>frontstore<span>.app</span></button>
            <button className="ps-top-icon" onClick={() => setSearch(true)} aria-label="Search"><Search size={20} /></button>
            <button className="ps-top-share" onClick={() => setShare(true)} aria-label="Share"><Share2 size={19} /></button>
          </header>

          <main className="ps-main">
            {page === "home" && (
              <>
                <section className="ps-cover-wrap">
                  <div className="ps-cover" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    {!store.banner_url && <StoreIcon className="ps-cover-icn" strokeWidth={1.1} />}
                  </div>
                  <span className="ps-avatar">{store.logo_url ? <img src={store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : store.store_name.charAt(0).toUpperCase()}</span>
                  <h1 className="ps-name">{store.store_name} {store.is_verified ? <BadgeCheck size={20} className="ps-verif" /> : null}</h1>
                  <p className="ps-meta">{store.business_persona?.replace(/-/g, ' ') || "Restaurant & bar"} <span className="ps-dot">·</span> <MapPin size={13} /> {store.location || "Victoria Island, Lagos"}</p>
                  
                  <div className="ps-id-actions-row">
                    <button className="ps-url" onClick={copyUrl}>frontstore.app/{store.username} <Copy size={13} /></button>
                    <button className="ps-notify" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                  </div>
                  
                  <div className="ps-stats">
                    <div><b><Star size={14} className="ps-star" /> {store.rating || 4.8}</b><span>{store.review_count || 526} reviews</span></div>
                    <div><b>{store.total_orders || "30k+"}</b><span>diners</span></div>
                    {(store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0 && (
                      <div><b>{store.reply_time_minutes ? `${store.reply_time_minutes} min` : "~10 min"}</b><span>reply time</span></div>
                    )}
                  </div>
                  <p className="ps-bio">{store.store_bio || "A contemporary restaurant and bar. Good food, proper drinks, and warm room made for long tables and good evenings."}</p>
                  
                  <div className="ps-statusline">
                    <span className="ps-open"><span className="ps-pulse" /> Open now</span>
                    <span className="ps-secure"><ShieldCheck size={13} /> Secured by Frontstore</span>
                  </div>
                </section>

                {!annOff && (store.announcement_title || store.announcement_body) && (
                  <div className="ps-ann">
                    <Megaphone size={16} />
                    <p><b>{store.announcement_title || "Announcement"}</b> {store.announcement_body || ""}</p>
                    <button onClick={() => setAnnOff(true)} aria-label="Dismiss announcement"><X size={15} /></button>
                  </div>
                )}

                {displayFeatured.length > 0 && (
                  <div className="feat">
                    <div className="feat-head">
                      <span className="feat-tag"><Star size={11} /> Signature Dishes</span>
                    </div>
                    <div className="feat-grid">
                      {displayFeatured.map((item) => (
                        <div key={item.id} className="feat-card" onClick={() => openProduct(item.productRef)}>
                          <div className="feat-thumb product" style={item.productRef.image_urls && item.productRef.image_urls.length > 0 ? { backgroundImage: `url(${item.productRef.image_urls[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                            {(!item.productRef.image_urls || item.productRef.image_urls.length === 0) && <UtensilsCrossed size={28} />}
                            <span className="feat-rib"><Star size={9} /> Classic</span>
                          </div>
                          <div className="feat-body">
                            <b>{item.name}</b>
                            <span className="feat-sub">{item.cat}</span>
                            <div className="feat-foot">
                              <em>{money(item.price)}</em>
                              <button className="feat-cta" onClick={(e) => { e.stopPropagation(); openProduct(item.productRef); }}>Order</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ps-searchbar" onClick={() => setSearch(true)}><Search size={17} /> <span>Search the menu</span></div>
                <div className="ps-chips">{categories.slice(0, 5).map((c) => <button key={c.id} onClick={() => { setActiveCat(c.id); go("products"); }}>{c.name}</button>)}</div>

                {PRODUCTS.length > 0 && (
                  <>
                    <SectionHead title="Menu" action={`See all ${PRODUCTS.length}`} onAction={() => go("products")} />
                    <div className="ps-grid">{PRODUCTS.slice(0, 4).map(p => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />)}</div>
                    <button className="ps-seeall" onClick={() => go("products")}>See all {PRODUCTS.length} dishes <ChevronRight size={16} /></button>
                  </>
                )}

                <SectionHead title="Reviews" />
                <RatingSummary />
                <div className="ps-reviews-row">
                  {displayReviews.slice(0, 3).map((rv: any, i) => (
                    <div key={i} className="ps-review">
                      <div className="ps-review-top">
                        <span className="ps-review-av">{(rv.reviewer_name || rv.name || "C").charAt(0)}</span>
                        <div>
                          <b>{rv.reviewer_name || rv.name}</b>
                          <span>{rv.when || "Verified diner"}</span>
                        </div>
                      </div>
                      <div className="ps-review-stars">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={11} className={idx < (rv.rating || rv.r) ? "f" : ""} />
                        ))}
                      </div>
                      <p>{rv.body || rv.text}</p>
                    </div>
                  ))}
                </div>
                <button className="ps-seeall" onClick={() => go("reviews")}>See all reviews <ChevronRight size={16} /></button>

                <SectionHead title="Visit the restaurant" />
                <div className="ps-visit">
                  <div className="ps-map"><MapPin size={26} /><span>VI, Lagos</span></div>
                  <div className="ps-visit-info">
                    <p className="ps-addr"><MapPin size={15} /> {store.address || "4 Akin Adesola Street, Victoria Island, Lagos"}</p>
                    <button className="ps-dir" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(store.address || "Victoria Island, Lagos")}`, '_blank')}><Navigation size={15} /> Directions</button>
                    <ul className="ps-hours">{HOURS.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                  </div>
                </div>

                <SectionHead title="Good to know" />
                <Accordion items={displayFaqs[0]?.items.slice(0, 3) || []} open={openFaq} setOpen={setOpenFaq} />
                <StoreFoot onNav={go} />
              </>
            )}

            {page === "products" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Menu</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                {products.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="pd-filter">
                      <button className={!activeCat ? 'on' : ''} onClick={() => setActiveCat(null)}>All dishes</button>
                      {activeCategories.map(c => (
                        <button key={c.id} className={activeCat === c.id ? 'on' : ''} onClick={() => setActiveCat(c.id)}>{c.name}</button>
                      ))}
                    </div>
                    <div className="ps-searchbar" style={{ cursor: 'default' }}>
                      <Search size={17} />
                      <input value={prodQuery} onChange={(e) => setProdQuery(e.target.value)} placeholder="Search dishes..." style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: 14 }} />
                    </div>
                    {filteredProducts.length > 0 ? (
                      <div className="ps-grid">{filteredProducts.map(p => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />)}</div>
                    ) : (
                      <div className="bk-empty">No dishes found matching your criteria.</div>
                    )}
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "services" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Reservations & Events</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                {computedServices.length === 0 ? <EmptyState /> : (
                  <div className="bk-svclist">
                    {computedServices.map(s => <ServiceCard key={s.id} s={s} onBook={openBooking} />)}
                  </div>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "portfolio" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Gallery</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                {portfolio.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="pd-filter">
                      <button className={pfCat === "All" ? "on" : ""} onClick={() => setPfCat("All")}>All photos</button>
                      {pfCats.map(c => <button key={c} className={pfCat === c ? "on" : ""} onClick={() => setPfCat(c)}>{c}</button>)}
                    </div>
                    <div className="ps-grid">
                      {pfList.map((item, idx) => (
                        <div key={idx} className="ps-card">
                          <div className={`ps-card-thumb svc c${idx % 4}`} style={{ height: 130 }}><UtensilsCrossed size={28} /></div>
                          <div className="ps-card-body">
                            <b>{item.label}</b>
                            <span className="ps-card-sub">{item.cat}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "reviews" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Verified Diner Reviews</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                {reviews.length === 0 ? <EmptyState /> : (
                  <>
                    <p className="rev-intro">Diners reviews are collected via confirmed Frontstore orders. Reviews cannot be deleted by the restaurant owner.</p>
                    <RatingSummary />
                    <button className="rev-leave" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a verified review</button>
                    <div className="rev-filter-m">
                      {[5, 4, 3].map((n) => <button key={n} className={revStar === n ? "on" : ""} onClick={() => setRevStar(revStar === n ? 0 : n)}>{n} Star <Star size={11} className="f" /></button>)}
                    </div>
                    <div className="rev-list">
                      {displayReviews.filter((rv: any) => revStar === 0 || (rv.rating || rv.r) === revStar).map((rv: any) => <ReviewCardRich key={rv.id} rv={rv} />)}
                    </div>
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "blog" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Blog & Kitchen Stories</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                {blog.length === 0 ? <EmptyState /> : (
                  <div className="blog-grid">
                    {displayBlog.map((b, idx) => (
                      <div key={idx} className="blog-card" onClick={() => openPost(b)}>
                        <div className={`blog-img c${idx % 3}`}><span className="blog-cat">{b.cat || b.category}</span></div>
                        <div className="blog-body">
                          <span className="blog-date">{b.date || new Date(b.published_at).toLocaleDateString()}</span>
                          <b>{b.title}</b>
                          <p>{b.excerpt}</p>
                          <span className="blog-read">Read post <ChevronRight size={13} /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "post" && post && (
              <div className="pd-listing">
                <button className="pv-back" onClick={() => go("blog")}><ChevronLeft size={16} /> Back to stories</button>
                <div className="pd-page-head">
                  <h1>{post.title}</h1>
                  <span>By {post.is_pseo ? store.store_name : (store.founder_name || store.store_name)} · {post.date || new Date(post.published_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })} · {post.cat || post.category}</span>
                </div>
                <div className="ps-prose" style={{ marginTop: 20 }}>
                  {post.body.map((node: any, idx: number) => {
                    if (node.h) return <h3 key={idx} style={{ fontFamily: 'Fraunces', fontSize: 19, margin: '20px 0 10px' }}>{node.h}</h3>;
                    if (node.p) return <p key={idx} style={{ lineHeight: 1.7, color: 'var(--muted)', marginBottom: 14 }}>{node.p}</p>;
                    if (node.list) return <ul key={idx} style={{ paddingLeft: 20, marginBottom: 14 }}>{node.list.map((li: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>{li}</li>)}</ul>;
                    return null;
                  })}
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "about" && (
              <div className="pd-listing">
                <div className="pd-page-head" style={{ marginBottom: 24 }}>
                  <h1>Our Story</h1>
                  <span>Chef, philosophy, and plating</span>
                </div>
                {(!store.store_bio && !store.founder_bio) ? <EmptyState /> : (
                  <>
                    <div className="ab-founder-m">
                      <div className="ab-portrait"><span className="ab-portrait-mono">{AUTHOR.initial}</span></div>
                      <div className="ab-founder-body">
                        <span className="ab-kicker">The Chef</span>
                        <h2 className="ab-name">{AUTHOR.name}</h2>
                        <span className="ab-role">{AUTHOR.role}</span>
                        <p className="ab-quote">"{AUTHOR.quote}"</p>
                        <p className="ab-bio">{AUTHOR.long}</p>
                        <div className="ab-chips">{AUTHOR.specialities.map((s: string) => <span key={s}>{s}</span>)}</div>
                      </div>
                    </div>
                    <div className="ab-section">
                      <h4 className="ab-subhead">Facts about the kitchen</h4>
                      <ul className="ab-facts">{ABOUT_FACTS.map(([lbl, val]: [string, string]) => <li key={lbl} className="ab-fact"><span>{lbl}</span><b>{val}</b></li>)}</ul>
                    </div>
                    <div className="ab-section">
                      <h4 className="ab-subhead">Recognition</h4>
                      <div className="ab-rec-list">{RECOGNITION.map((r: string) => <span key={r} className="ab-rec">{r}</span>)}</div>
                    </div>
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "faq" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Frequently Asked Questions</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                {faqs.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="ps-searchbar" style={{ cursor: 'default' }}>
                      <Search size={17} />
                      <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions..." style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: 14 }} />
                    </div>
                    <Accordion items={faqFiltered[0]?.items || []} open={openFaq} setOpen={setOpenFaq} />
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "contact" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Contact details</h1>
                  <span>Open hours, email, and coordinates</span>
                </div>
                {!store.whatsapp_phone && !store.email && !store.location && !store.address ? <EmptyState /> : (
                  <div className="ps-visit" style={{ marginTop: 20 }}>
                    <div className="ps-visit-info">
                      {store.whatsapp_phone && <p className="ps-addr" style={{ marginBottom: 12 }}><WhatsAppIcon size={16} /> <b>WhatsApp:</b> {store.whatsapp_phone}</p>}
                      {store.email && <p className="ps-addr" style={{ marginBottom: 12 }}><Mail size={15} /> <b>Email:</b> {store.email}</p>}
                      <p className="ps-addr" style={{ marginBottom: 12 }}><MapPin size={15} /> <b>Location:</b> {store.location || "Victoria Island, Lagos"}</p>
                      {store.address && <p className="ps-addr" style={{ marginBottom: 12 }}><MapPin size={15} /> <b>Address:</b> {store.address}</p>}
                      
                      <button className="ps-sheet-cta" style={{ marginTop: 20 }} onClick={() => window.open(`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent("Hi! I'd like to get in touch.")}`, '_blank')}>
                        <WhatsAppIcon size={18} /> Message on WhatsApp
                      </button>
                    </div>
                  </div>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {LEGAL.map(([id]) => id).includes(page) && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>{LEGAL.find(([id]) => id === page)?.[1]}</h1>
                  <span>{systemDomain}/{store.username}</span>
                </div>
                <div className="ps-prose" style={{ marginTop: 20 }}>
                  <p>Our standard policies and terms are set to protect both our diners and our kitchen operations. Let us know if you have any questions.</p>
                  <h3 style={{ fontFamily: 'Fraunces', fontSize: 18, marginTop: 20, marginBottom: 8 }}>{page === 'returns' ? 'Cancellation & Refund Policy' : page === 'terms' ? 'Store Service Terms' : 'Data Privacy Notice'}</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>All transactions are processed securely through Frontstore platform escrow, keeping your customer funds protected until delivery confirmation.</p>
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "product" && productView()}
          </main>

          {/* Bottom Nav Bar */}
          <nav className="ps-bottom">
            <button className={page === "home" ? "on" : ""} onClick={() => go("home")} aria-label="Home"><StoreIcon size={20} /><span>Home</span></button>
            {(store.storefront_sections || []).includes("products") && (
              <button className={page === "products" ? "on" : ""} onClick={() => go("products")} aria-label="Menu"><UtensilsCrossed size={20} /><span>Menu</span></button>
            )}
            <button className="ps-fab" onClick={openBooking} aria-label="Reserve a Table">
              <Calendar size={22} />
              <span className="ps-fab-ring" />
            </button>
            {(store.storefront_sections || []).includes("services") && (
              <button className={page === "services" ? "on" : ""} onClick={() => go("services")} aria-label="Bookings"><Clock size={20} /><span>Bookings</span></button>
            )}
            <button className="ps-cart-ic" onClick={() => setBag(true)} aria-label="Cart"><ShoppingBag size={20} /><span>Cart</span>{bagCount > 0 && <i>{bagCount}</i>}</button>
          </nav>

          {/* Sidebar Drawer Menu */}
          {drawer && (
            <>
              <div className="ps-drawer-back" onClick={() => setDrawer(false)} />
              <div className="ps-drawer">
                <div className="ps-panel">
                  <div className="ps-panel-top">
                    <button className="ps-logo" onClick={() => go("home")}>frontstore<span>.app</span></button>
                    <button className="ps-x" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={20} /></button>
                  </div>
                  <div className="ps-id">
                    <span className="ps-id-av">{store.store_name.charAt(0).toUpperCase()}</span>
                    <div className="ps-id-main">
                      <b>{store.store_name}</b>
                      <i>{store.business_persona?.replace(/-/g, ' ') || "Restaurant & bar"}</i>
                    </div>
                  </div>
                  <div className="ps-nav">
                    {NAV.map(([id, label]) => (
                      <button key={id} className={page === id ? "on" : ""} onClick={() => go(id)}>{label} <ChevronRight size={14} /></button>
                    ))}
                  </div>
                  <button className="ps-act-book" onClick={openBooking}><Calendar size={16} /> Reserve a table</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============ DESKTOP ============ */}
      {isDesktop && (
        <div className="pd-wrap">
          <header className="pd-header">
            <button className="ps-logo" onClick={() => go("home")}>frontstore<span>.app</span></button>
            <div className="pd-search" style={{ border: '1px solid var(--line)' }}>
              <Search size={16} />
              <input value={prodQuery} onChange={(e) => { setProdQuery(e.target.value); if (page !== "products" && page !== "product") go("products"); }} placeholder="Search dishes, drinks..." style={{ border: 'none', outline: 'none', background: 'none', width: '100%', fontSize: 13 }} />
            </div>
            <div className="pd-header-actions">
              {NAV.slice(0, 6).map(([id, label]) => (
                <button key={id} className={`pd-ghost ${page === id ? "on" : ""}`} style={{ border: 'none', padding: '8px 14px', background: page === id ? '#f7e7ea' : 'none', color: page === id ? 'var(--brand-deep)' : 'var(--ink)' }} onClick={() => go(id)}>{label}</button>
              ))}
              <button className="pd-hicon" onClick={() => setBag(true)} aria-label="Cart"><ShoppingBag size={20} />{bagCount > 0 && <i>{bagCount}</i>}</button>
              <button className="pd-head-book" onClick={openBooking}><Calendar size={16} /> Reserve table</button>
            </div>
          </header>

          <div className="pd-container">
            {page === "home" && (
              <>
                <section className="pd-cover">
                  <div className="pd-cover-art" style={store.banner_url ? { backgroundImage: `url(${store.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    {!store.banner_url && <StoreIcon className="pd-cover-icn" strokeWidth={1.1} />}
                  </div>
                  <div className="pd-identity">
                    <span className="pd-avatar">{store.logo_url ? <img src={store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : store.store_name.charAt(0).toUpperCase()}</span>
                    <div className="pd-identity-main">
                      <h1>{store.store_name} {store.is_verified ? <BadgeCheck size={24} className="ps-verif" /> : null}</h1>
                      <p>
                        <span>{store.business_persona?.replace(/-/g, ' ') || "Restaurant & bar"}</span>
                        <span className="ps-dot">·</span>
                        <MapPin size={13} /> {store.location || "Victoria Island, Lagos"}
                      </p>
                    </div>
                    <div className="pd-identity-actions">
                      <button className="pd-ghost" onClick={copyUrl}>frontstore.app/{store.username} <Copy size={13} /></button>
                      <button className="pd-ghost" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                    </div>
                  </div>
                </section>

                <div className="pd-home" style={{ marginTop: 32 }}>
                  <aside className="pd-rail">
                    <div className="pd-railcard">
                      <h3>Chef & Kitchen Bio</h3>
                      <p>{store.store_bio || "A contemporary restaurant and bar on Victoria Island. Good food, proper drinks, and warm room made for long tables."}</p>
                    </div>
                    
                    <div className="pd-railcard">
                      <h3>Visit Us</h3>
                      <div className="pd-railmap"><MapPin size={22} /><span>VI, Lagos</span></div>
                      <p style={{ fontSize: 13, marginBottom: 12 }}>{store.address || "4 Akin Adesola Street, Victoria Island, Lagos"}</p>
                      <button className="bk-ghost" style={{ width: '100%' }} onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(store.address || "Victoria Island, Lagos")}`, '_blank')}><Navigation size={14} /> Get Directions</button>
                    </div>

                    <div className="pd-railcard trust">
                      <span className="pd-trust-h"><ShieldCheck size={16} /> Secured checkout</span>
                      <p>Orders are backed by our buyer protection guidelines. Funds are released after successful confirmation.</p>
                    </div>
                  </aside>

                  <div className="pd-feed">
                    {!annOff && (store.announcement_title || store.announcement_body) && (
                      <div className="ps-ann">
                        <Megaphone size={16} />
                        <p><b>{store.announcement_title || "Announcement"}</b> {store.announcement_body || ""}</p>
                        <button onClick={() => setAnnOff(true)} aria-label="Dismiss announcement"><X size={15} /></button>
                      </div>
                    )}

                    {displayFeatured.length > 0 && (
                      <div className="feat">
                        <SectionHead title="Signature Mains" />
                        <div className="feat-grid">
                          {displayFeatured.map((item) => (
                            <div key={item.id} className="feat-card" onClick={() => openProduct(item.productRef)}>
                              <div className="feat-thumb product" style={item.productRef.image_urls && item.productRef.image_urls.length > 0 ? { backgroundImage: `url(${item.productRef.image_urls[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                                {(!item.productRef.image_urls || item.productRef.image_urls.length === 0) && <UtensilsCrossed size={32} />}
                              </div>
                              <div className="feat-body">
                                <b>{item.name}</b>
                                <span className="feat-sub">{item.cat}</span>
                                <div className="feat-foot">
                                  <em>{money(item.price)}</em>
                                  <button className="feat-cta" onClick={(e) => { e.stopPropagation(); openProduct(item.productRef); }}>Order</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {PRODUCTS.length > 0 && (
                      <>
                        <SectionHead title="Dishes & Mains" action="See full menu" onAction={() => go("products")} />
                        <div className="pd-grid wide">{PRODUCTS.slice(0, 6).map(p => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />)}</div>
                      </>
                    )}

                    <SectionHead title="Diner Reviews" action="See all reviews" onAction={() => go("reviews")} />
                    <div className="pd-rev-top">
                      <RatingSummary />
                      <div className="pd-rev-firsts">
                        {displayReviews.slice(0, 2).map((rv: any) => <ReviewCardRich key={rv.id} rv={rv} />)}
                      </div>
                    </div>
                  </div>
                </div>
                <StoreFoot onNav={go} />
              </>
            )}

            {page === "products" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Our Menu</h1>
                  <span>Explore fresh, delicious dishes cooked to order</span>
                </div>
                {products.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="pd-filter" style={{ margin: '20px 0' }}>
                      <button className={!activeCat ? 'on' : ''} onClick={() => setActiveCat(null)}>All dishes</button>
                      {activeCategories.map(c => (
                        <button key={c.id} className={activeCat === c.id ? 'on' : ''} onClick={() => setActiveCat(c.id)}>{c.name}</button>
                      ))}
                    </div>
                    <div className="pd-grid wide" style={{ marginTop: 20 }}>
                      {filteredProducts.map(p => <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />)}
                    </div>
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "services" && (
              <div className="pd-listing pd-narrow">
                <div className="pd-page-head">
                  <h1>Reservations & Events</h1>
                  <span>Reserve table online, free and confirmed instantly on WhatsApp</span>
                </div>
                {computedServices.length === 0 ? <EmptyState /> : (
                  <div className="bk-svclist" style={{ marginTop: 24 }}>
                    {computedServices.map(s => <ServiceCard key={s.id} s={s} onBook={openBooking} />)}
                  </div>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "portfolio" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Space Gallery</h1>
                  <span>A glimpse into our room, bar, and plating</span>
                </div>
                {portfolio.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="pd-filter" style={{ margin: '20px 0' }}>
                      <button className={pfCat === "All" ? "on" : ""} onClick={() => setPfCat("All")}>All photos</button>
                      {pfCats.map(c => <button key={c} className={pfCat === c ? "on" : ""} onClick={() => setPfCat(c)}>{c}</button>)}
                    </div>
                    <div className="pd-grid wide">
                      {pfList.map((item, idx) => (
                        <div key={idx} className="ps-card">
                          <div className={`ps-card-thumb svc c${idx % 4}`} style={{ height: 160 }}><UtensilsCrossed size={36} /></div>
                          <div className="ps-card-body">
                            <b>{item.label}</b>
                            <span className="ps-card-sub">{item.cat}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "reviews" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Verified Diner Testimonials</h1>
                  <span>Genuine reviews from real diners and orders</span>
                </div>
                <div className="pd-rev-top" style={{ margin: '24px 0' }}>
                  <RatingSummary />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="rev-leave" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a verified review</button>
                    <div className="rev-filter-m" style={{ justifyContent: 'center' }}>
                      {[5, 4, 3].map((n) => <button key={n} className={revStar === n ? "on" : ""} onClick={() => setRevStar(revStar === n ? 0 : n)}>{n} Star <Star size={11} className="f" /></button>)}
                    </div>
                  </div>
                </div>
                <div className="pd-grid wide reviews">
                  {displayReviews.filter((rv: any) => revStar === 0 || (rv.rating || rv.r) === revStar).map((rv: any) => <ReviewCardRich key={rv.id} rv={rv} />)}
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "blog" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Stories from the Chef & Kitchen</h1>
                  <span>Updates, plating guides, and search engine optimization (pSEO) articles</span>
                </div>
                <div className="blog-grid" style={{ marginTop: 24 }}>
                  {displayBlog.map((b, idx) => (
                    <div key={idx} className="blog-card" onClick={() => openPost(b)}>
                      <div className={`blog-img c${idx % 3}`}><span className="blog-cat">{b.cat || b.category}</span></div>
                      <div className="blog-body">
                        <span className="blog-date">{b.date || new Date(b.published_at).toLocaleDateString()}</span>
                        <b>{b.title}</b>
                        <p>{b.excerpt}</p>
                        <span className="blog-read">Read article <ChevronRight size={13} /></span>
                      </div>
                    </div>
                  ))}
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "post" && post && (
              <div className="pd-listing pd-narrow">
                <button className="pv-back" onClick={() => go("blog")} style={{ border: 'none', background: 'none' }}><ChevronLeft size={16} /> Back to stories</button>
                <h1 style={{ fontFamily: 'Fraunces', fontSize: 32, fontWeight: 700, margin: '14px 0 6px' }}>{post.title}</h1>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>By {post.is_pseo ? store.store_name : (store.founder_name || store.store_name)} · {post.date || new Date(post.published_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })} · {post.cat || post.category}</span>
                <div className="ps-prose" style={{ marginTop: 24 }}>
                  {post.body.map((node: any, idx: number) => {
                    if (node.h) return <h3 key={idx} style={{ fontFamily: 'Fraunces', fontSize: 20, margin: '24px 0 10px' }}>{node.h}</h3>;
                    if (node.p) return <p key={idx} style={{ lineHeight: 1.75, color: '#5f4d55', marginBottom: 14 }}>{node.p}</p>;
                    if (node.list) return <ul key={idx} style={{ paddingLeft: 20, marginBottom: 14 }}>{node.list.map((li: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>{li}</li>)}</ul>;
                    return null;
                  })}
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "about" && (
              <div className="pd-listing">
                <div className="pd-page-head" style={{ marginBottom: 24 }}>
                  <h1>Our Story</h1>
                  <span>Learn more about {store.founder_name ? store.founder_name.split(' ')[0] : 'Chinelo'}'s background, training and kitchen vision</span>
                </div>
                <div className="ab-founder" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 30 }}>
                  <div className="ab-portrait"><span className="ab-portrait-mono">{AUTHOR.initial}</span></div>
                  <div className="ab-founder-body">
                    <span className="ab-kicker">The Founder</span>
                    <h2 className="ab-name" style={{ fontFamily: 'Fraunces', fontSize: 26 }}>{AUTHOR.name}</h2>
                    <span className="ab-role" style={{ color: 'var(--brand)' }}>{AUTHOR.role}</span>
                    <p className="ab-quote" style={{ fontStyle: 'italic', margin: '14px 0', borderLeft: '3px solid var(--brand)', paddingLeft: 12 }}>"{AUTHOR.quote}"</p>
                    <p className="ab-bio" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{AUTHOR.long}</p>
                    <div className="ab-chips" style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {AUTHOR.specialities.map((s: string) => <span key={s} style={{ background: '#f7e7ea', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--brand-deep)' }}>{s}</span>)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
                  <div>
                    <h4 className="ab-subhead" style={{ fontFamily: 'Fraunces', fontSize: 18, marginBottom: 12 }}>Facts about Chef {store.founder_name ? store.founder_name.split(' ')[0] : 'Chinelo'}</h4>
                    <ul className="ab-facts" style={{ listStyle: 'none', padding: 0 }}>
                      {ABOUT_FACTS.map(([lbl, val]: [string, string]) => (
                        <li key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                          <span>{lbl}</span><b>{val}</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="ab-subhead" style={{ fontFamily: 'Fraunces', fontSize: 18, marginBottom: 12 }}>Recognition & Features</h4>
                    <div className="ab-rec-list" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {RECOGNITION.map((r: string) => <span key={r} style={{ border: '1px solid var(--line)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{r}</span>)}
                    </div>
                  </div>
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "faq" && (
              <div className="pd-listing pd-narrow">
                <div className="pd-page-head" style={{ marginBottom: 24 }}>
                  <h1>Frequently Asked Questions</h1>
                  <span>Billing, delivery, and menu</span>
                </div>
                {faqs.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="ps-searchbar" style={{ cursor: 'default', margin: '20px 0' }}>
                      <Search size={17} />
                      <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions..." style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: 14 }} />
                    </div>
                    <Accordion items={faqFiltered[0]?.items || []} open={openFaq} setOpen={setOpenFaq} />
                  </>
                )}
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "contact" && (
              <div className="pd-listing pd-narrow">
                <div className="pd-page-head">
                  <h1>Get in Touch</h1>
                  <span>Reserve tables, ask about events catering or discuss private bookings</span>
                </div>
                <div className="ps-visit" style={{ marginTop: 24, padding: 24 }}>
                  {store.whatsapp_phone && <p style={{ fontSize: 15, marginBottom: 12 }}><WhatsAppIcon size={16} /> <b>WhatsApp Support:</b> {store.whatsapp_phone}</p>}
                  {store.email && <p style={{ fontSize: 15, marginBottom: 12 }}><Mail size={15} /> <b>Email Address:</b> {store.email}</p>}
                  <p style={{ fontSize: 15, marginBottom: 12 }}><MapPin size={15} /> <b>Location:</b> {store.location || "Victoria Island, Lagos"}</p>
                  {store.address && <p style={{ fontSize: 15, marginBottom: 20 }}><MapPin size={15} /> <b>Physical Address:</b> {store.address}</p>}
                  <button className="ps-sheet-cta" style={{ maxWidth: 260 }} onClick={() => setPendingWaUrl(`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'd like to get in touch regarding ${store.store_name}.`)}`)}>
                    <WhatsAppIcon size={18} /> Chat on WhatsApp
                  </button>
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {LEGAL.map(([id]) => id).includes(page) && (
              <div className="pd-listing pd-narrow">
                <div className="pd-page-head">
                  <h1>{LEGAL.find(([id]) => id === page)?.[1]}</h1>
                  <span>Platform details & customer policy notes</span>
                </div>
                <div className="ps-prose" style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>Our platform uses escrow-protected payment integrations to ensure diner satisfaction. Transactions are fully secured against delivery and reservation confirmations.</p>
                  <h3 style={{ fontFamily: 'Fraunces', fontSize: 20, marginTop: 24, marginBottom: 10 }}>Terms & Policy Details</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>If your order does not arrive as requested or has unresolved issues, please raise a platform query via tracking dashboard or reach out via store support chat.</p>
                </div>
                <StoreFoot onNav={go} />
              </div>
            )}

            {page === "product" && productView()}
          </div>
        </div>
      )}

      {/* Sheet Overlays */}
      {reviewOpen && reviewForm()}
      {bag && orderForm()}
      {bookOpen && bookingFlow()}

      {/* Global Toast Alert */}
      {toast && <div className="ps-toast">{toast}</div>}
    </div>
  );
}
