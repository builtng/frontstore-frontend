'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
  Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store as StoreIcon,
  Search, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft, Megaphone, Truck,
  ShieldCheck, Navigation, Lock, Plus, Minus, Copy, Instagram, Facebook,
  Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell, Ruler, Receipt,
  Camera, Heart
} from "lucide-react";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import WhatsAppDisclaimerModal from "../../components/WhatsAppDisclaimerModal";
import { calculateShippingFee } from "../../utils/shippingFee";
import { InstagramIcon, TikTokIcon } from "../../components/SocialIcons";

import "./ThriftStorefront.css";

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
  size: string;
  colour: string;
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

interface ThriftStorefrontProps {
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

export default function ThriftStorefront({
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
}: ThriftStorefrontProps) {
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
  const [bookSvc, setBookSvc] = useState<any>(null);
  const [bookStep, setBookStep] = useState<"service" | "date" | "time" | "review">("service");
  const [bookDate, setBookDate] = useState<Date | null>(null);
  const [bookTime, setBookTime] = useState<string | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookNote, setBookNote] = useState("");
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
  const [selColour, setSelColour] = useState<string | null>(null);
  const [selSize, setSelSize] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

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
  const [prodCat, setProdCat] = useState("All");
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
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const ping = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1600);
  };

  const go = (p: string) => {
    setPost(null);
    setSelProduct(null);
    setPage(p);
    setDrawer(false);
    setSearch(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openPost = (p: any) => {
    setPost(p);
    setPage("post");
    setDrawer(false);
    setSearch(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openProduct = (p: any) => {
    setSelProduct(p);
    setSelColour(p.colours && p.colours[0] ? p.colours[0].n : null);
    setSelSize(null);
    setPage("product");
    setDrawer(false);
    setSearch(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- Persistent Local Storage Bag ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`frontstore_cart_${username}`);
      if (saved) {
        setBagItems(JSON.parse(saved));
      }
    } catch (e) {}
  }, [username]);

  const saveCartToStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem(`frontstore_cart_${username}`, JSON.stringify(items));
    } catch (e) {}
  };

  const addToBag = (p: any, size: string | null, colour: string | null) => {
    const sz = size || "One size";
    const clr = colour || "Original";
    const key = p.id + "|" + sz + "|" + clr;
    setBagItems((prev) => {
      const ex = prev.find((b) => b.key === key);
      const next = ex
        ? prev.map((b) => (b.key === key ? { ...b, qty: b.qty + 1 } : b))
        : [...prev, { key, id: p.id, name: p.name, price: p.price, size: sz, colour: clr, qty: 1, type: p.type || "product" }];
      saveCartToStorage(next);
      return next;
    });
    ping("Added to your bag");
  };

  const setQty = (key: string, d: number) => {
    setBagItems((prev) => {
      const next = prev.map((b) => (b.key === key ? { ...b, qty: Math.max(1, b.qty + d) } : b));
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

  const copyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${systemDomain}/${username}`);
      ping("Store link copied");
    }
  };

  // Load customer profile details if saved locally
  useEffect(() => {
    try {
      const profileStr = localStorage.getItem('frontstore_customer_profile');
      if (profileStr) {
        const prof = JSON.parse(profileStr);
        setCustomerName(prof.name || "");
        setCustomerPhone(prof.phone_number || "");
        setCustomerWhatsapp(prof.whatsapp_number || prof.phone_number || "");
        setCustomerEmail(prof.email || "");
        setDeliveryMethod(prof.preferred_delivery_method || "delivery");
        setDeliveryAddress(prof.preferred_delivery_address || "");
      }
    } catch {}
  }, []);

  // Fetch Slots when booking service is loaded
  useEffect(() => {
    if (!bookSvc) {
      setApiSlots([]);
      return;
    }
    setLoadingSlots(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
    fetch(`${API_URL}/v1/public/store/${username}/slots?product_id=${bookSvc.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          setApiSlots(json.data);
        }
      })
      .catch(err => console.error("Error fetching slots:", err))
      .finally(() => setLoadingSlots(false));
  }, [bookSvc, username]);

  const handleWa = (msg: string) => {
    const rawPhone = store.whatsapp_phone || "";
    setPendingWaUrl(`https://wa.me/${rawPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const openBooking = (svc?: any) => {
    const resolved = svc ? (SERVICES.find((s) => s.id === svc.id) || svc) : null;
    setBookSvc(resolved);
    setBookStep(resolved ? "date" : "service");
    setBookDate(null);
    setBookTime(null);
    setBookName("");
    setBookNote("");
    setCalMonth(new Date());
    setDrawer(false);
    setBookOpen(true);
  };

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

  // Dynamic values
  const primaryColor = store.primary_color || '#3d52a0';
  const currencySymbol = useMemo(() => {
    const code = (store.currency_code || 'NGN').toUpperCase();
    const symbols: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵', KES: 'KSh' };
    return symbols[code] || code + ' ';
  }, [store.currency_code]);

  const money = (n: number) => currencySymbol + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const primaryCta = useMemo(() => {
    const list = products.filter(p => p.type === 'service');
    if (list.length > 0) {
      return { label: "Book a slot", Icon: Calendar, run: () => openBooking() };
    }
    return { label: "Shop now", Icon: ShoppingBag, run: () => go("products") };
  }, [products]);

  // Merge categories & products with presets
  const displayItems = useMemo(() => {
    if (products && products.length > 0) {
      return products.map(p => {
        const isService = p.type === 'service' || 
          (p.name || '').toLowerCase().includes('sourcing') || 
          (p.name || '').toLowerCase().includes('valuation') || 
          (p.name || '').toLowerCase().includes('styling') || 
          (p.name || '').toLowerCase().includes('restyle') || 
          (p.name || '').toLowerCase().includes('pickup') || 
          (p.description || '').toLowerCase().includes('session') ||
          (p.description || '').toLowerCase().includes('consultation');
        
        const catObj = categories.find(c => c.id === p.category_id);
        const nameLower = (p.name || '').toLowerCase();
        const descLower = (p.description || '').toLowerCase();

        let productSizes = ["One size"];
        if (nameLower.includes("jeans") || nameLower.includes("denim") || nameLower.includes("pants") || nameLower.includes("trouser") || nameLower.includes("skirt")) {
          productSizes = ["28", "30", "32", "34"];
        } else if (nameLower.includes("blazer") || nameLower.includes("dress") || nameLower.includes("jacket") || nameLower.includes("tee") || nameLower.includes("top") || nameLower.includes("shirt") || nameLower.includes("coat")) {
          productSizes = ["S", "M", "L"];
        } else if (nameLower.includes("boots") || nameLower.includes("shoes") || nameLower.includes("footwear")) {
          productSizes = ["38", "39", "40", "41", "42"];
        }

        let productColours: { n: string; h: string }[] = [];
        const colorMap = [
          { n: "Indigo", h: "#2f3b66" },
          { n: "Mid wash", h: "#6f86b8" },
          { n: "Camel", h: "#b48b5c" },
          { n: "Charcoal", h: "#2c2a28" },
          { n: "Black", h: "#1c1a18" },
          { n: "Silver", h: "#c7ccd2" },
          { n: "Tan", h: "#b07d4f" },
          { n: "White", h: "#ffffff" },
          { n: "Faded black", h: "#3a3a3a" }
        ];
        colorMap.forEach(c => {
          if (nameLower.includes(c.n.toLowerCase()) || descLower.includes(c.n.toLowerCase())) {
            productColours.push(c);
          }
        });
        if (productColours.length === 0) {
          productColours = [{ n: "Original", h: "#8b5e3c" }];
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: isService ? 'service' as const : 'product' as const,
          cat: catObj ? catObj.name : (isService ? 'Services' : 'Thrift'),
          price: parseFloat(p.price),
          compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
          dur: p.duration_minutes ? `${p.duration_minutes} min` : '60 min',
          durMin: p.duration_minutes || 60,
          stock: p.stock_status === 'in_stock' ? 'in' as const : (p.stock_status === 'low_stock' ? 'low' as const : 'out' as const),
          stock_status: p.stock_status,
          desc: p.description || '',
          popular: p.compare_at_price ? true : false,
          image_url: p.image_url || p.image_urls?.[0] || null,
          image_urls: p.image_urls || null,
          colours: productColours,
          sizes: productSizes,
          soldSizes: p.stock_status === 'out_of_stock' ? productSizes : [],
          fit: nameLower.includes("jeans") ? "True to size" : (nameLower.includes("blazer") ? "Runs large" : "True to size"),
          condition: descLower.includes("excellent") ? "Excellent" : (descLower.includes("good") ? "Good" : "Excellent"),
          care: nameLower.includes("blazer") || nameLower.includes("coat") ? "Dry clean" : "Machine wash cold",
        };
      });
    }
    return [];
  }, [products, categories]);

  const SERVICES = useMemo(() => {
    const list = displayItems.filter(i => i.type === 'service');
    return list;
  }, [displayItems]);

  const PRODUCTS = useMemo(() => {
    const list = displayItems.filter(i => i.type === 'product');
    return list;
  }, [displayItems]);

  const prodCats = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.cat).filter(Boolean)));
  }, [PRODUCTS]);

  const storeInitials = useMemo(() => {
    const rawName = store.store_name || username || 'Store';
    const cleanName = rawName.includes('-') || rawName.includes('_') || rawName === rawName.toLowerCase()
      ? rawName.replace(/[-_]/g, ' ')
      : rawName;
    return cleanName.split(/[\s-_]+/).filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'S';
  }, [store.store_name, username]);

  // Dynamic Founder
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

  const RECOGNITION = useMemo(() => (store.recognition || []) as string[], [store]);
  const ABOUT_FACTS = useMemo(() => (store.about_facts || []) as [string, string][], [store]);

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

  const displayFaqs = useMemo(() => {
    if (faqs && faqs.length > 0) {
      return [
        {
          cat: "General FAQs",
          icon: ShieldCheck,
          items: faqs.map(f => [f.question, f.answer])
        }
      ];
    }
    return [];
  }, [faqs]);

  const FAQ_PREVIEW = useMemo(() => {
    return (faqs || []).slice(0, 4).map(f => [f.question, f.answer]);
  }, [faqs]);

  const TERMS = [
    { t: "Who these terms are between", p: [`These terms are an agreement between you and ${store.store_name}, the store that sells the preloved items and services on this store. The store runs on Frontstore, which provides the platform and buyer protection but is not the seller.`] },
    { t: "Appointments and deposits", p: ["Sourcing, selling and styling appointments are booked through this store. Where a deposit applies, it secures your slot and the amount is always shown before you confirm."] },
    { t: "Pricing and payment", p: ["Prices are shown in Nigerian naira. Any approximate conversion shown elsewhere is indicative only, and you are charged in naira.", "You can pay securely through Frontstore at checkout, or by bank transfer to the store. Funds paid by transfer go directly to the store, while Frontstore payments are held under buyer protection."] },
    { t: "Cancellations and returns", p: ["You can cancel an appointment or return an item within the windows set out on the Refunds page, where you will also find how and when refunds are issued."], link: { label: "Read the Refunds policy", page: "returns" } },
    { t: "Condition and one of a kind items", p: ["Almost everything we sell is secondhand and one of a kind. We clean every piece and describe its condition honestly, but small signs of wear are part of preloved fashion.", "Please read the description and ask us before buying if you are unsure. Once a piece sells it is usually gone, so we cannot guarantee a replacement."] },
    { t: "Items", p: ["We sell genuine secondhand and vintage pieces, quality checked and freshly cleaned. Returns are handled as set out on the Refunds page."] },
    { t: "Reviews and content", p: ["Reviews can only be left by customers with a completed order, and each is shown with a verified badge. The store may respond to reviews but cannot remove genuine ones. By submitting a review or photo, you allow it to be shown on this store."] },
    { t: "Liability", p: ["We describe and clean our pieces with reasonable skill and care. Nothing in these terms removes any rights you have under applicable law."] },
    { t: "The Frontstore platform", p: [], locked: { title: "Frontstore platform terms", body: "Every Frontstore store also operates under the Frontstore platform terms and buyer protection policy. These apply alongside the store's own policies and cannot be removed by the vendor.", link: "Read the Frontstore platform terms" } },
    { t: "Changes to these terms", p: ["We may update these terms from time to time. The version shown on this page is the current one, and the date it was last updated is shown alongside it."] },
    { t: "Governing law", p: ["These terms are governed by the laws of the Federal Republic of Nigeria, and any dispute falls under the courts of Lagos State."] },
    { t: "Contact", p: ["Questions about these terms? Reach the store through the Contact page and we will be glad to help."], link: { label: "Go to Contact", page: "contact" } },
  ];

  const PRIVACY = [
    { t: "What we collect", p: [`When you buy, sell or get in touch, ${store.store_name} collects the details you give us: your name, contact details such as a WhatsApp number, phone or email, your order or sourcing details, any message you send, and reviews or photos you choose to share.`] },
    { t: "How we use it", p: ["We use your details to process and deliver orders, handle sourcing and selling requests, reply to your enquiries, arrange delivery or pickup, process payments, show verified reviews, and improve the store. We do not send marketing without your consent."] },
    { t: "Payments", p: ["Payments made through Frontstore are handled by Frontstore and its payment providers under buyer protection, and the store does not see or store your card details. Bank transfers are made directly to the store."] },
    { t: "WhatsApp and messaging", p: ["When you message us, the conversation takes place on WhatsApp and is also subject to WhatsApp's own privacy terms. In future this may move to Frontstore's own messaging."] },
    { t: "Who we share it with", p: ["We share only what is needed: with delivery partners to fulfil your order, with payment providers to take payment, and with Frontstore as the platform the store runs on. We never sell your data."] },
    { t: "Cookies and analytics", p: ["The store uses basic cookies and analytics, provided through the Frontstore platform, to keep the store working and understand how it is used."] },
    { t: "Keeping your data", p: ["We keep your details only as long as needed to provide our services and to meet legal and tax obligations, after which they are removed."] },
    { t: "Your rights", p: ["Under Nigerian data protection law you can ask to see the data we hold about you, correct it, delete it, or object to how it is used. To make a request, reach us through the Contact page."], link: { label: "Go to Contact", page: "contact" } },
    { t: "The Frontstore platform", p: [], locked: { title: "Frontstore platform privacy", body: "As the platform this store runs on, Frontstore also processes data under its own privacy policy and platform terms. These apply alongside the store's own notice and cannot be removed by the vendor.", link: "Read the Frontstore privacy policy" } },
    { t: "Changes to this notice", p: ["We may update this notice from time to time. The version shown on this page is the current one, with the date it was last updated shown alongside it."] },
    { t: "Contact", p: ["Questions about your privacy, or want to make a data request? Reach the store through the Contact page and we will help."], link: { label: "Go to Contact", page: "contact" } },
  ];

  const displayPortfolio = useMemo(() => {
    return (portfolio || []).map((p, i) => ({
      label: p.title || p.label,
      cat: p.category || "Portfolio",
      c: `c${i % 3}`,
      image_url: p.image_url
    }));
  }, [portfolio]);

  const displayBlog = useMemo(() => {
    return (blog || []).map(b => ({
      title: b.title,
      date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently",
      cat: b.category || "Updates",
      read: b.read_time || "4 min",
      excerpt: b.excerpt || b.body?.slice(0, 100) || "",
      body: Array.isArray(b.body) ? b.body : [{ p: b.body || "" }],
      is_pseo: !!b.is_pseo,
    }));
  }, [blog]);

  const NOTIFY_TOPICS = [["services", "New drops"], ["products", "Restocks"], ["offers", "Sales and bundles"], ["news", "Announcements"]];
  const HOURS = (store.working_hours && Array.isArray(store.working_hours) && store.working_hours.length > 0)
    ? store.working_hours
    : [
        ["Mon", "Closed"], ["Tue", "Closed"], ["Wed", "Closed"],
        ["Thu", "Closed"], ["Fri", "Closed"], ["Sat", "Closed"], ["Sun", "Closed"]
      ];
  const NAV = useMemo(() => {
    return [
      ["home", "Home"],
      ["products", "Products"],
      ["services", "Services"],
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
  const SIZE_GUIDE = {
    cols: ["Size", "Bust", "Waist", "Hip"],
    rows: [["XS", "80-84", "62-66", "88-92"], ["S", "85-89", "67-71", "93-97"], ["M", "90-94", "72-76", "98-102"], ["L", "95-100", "77-82", "103-108"], ["XL", "101-107", "83-89", "109-115"]],
  };

  const FEATURED = useMemo(() => {
    return PRODUCTS.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      type: "product"
    }));
  }, [PRODUCTS]);

  const todayIdx = (new Date().getDay() + 6) % 7;

  const bagCount = bagItems.reduce((n, b) => n + b.qty, 0);
  const subtotal = bagItems.reduce((n, b) => n + b.price * b.qty, 0);
  const shippingPreview = calculateShippingFee(store, subtotal);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/v1/public/store/${username}/coupons/${couponCodeInput.trim()}/validate`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const minOrder = parseFloat(json.data.min_order_amount);
        if (minOrder > 0 && subtotal < minOrder) {
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
      if (minOrder > 0 && subtotal < minOrder) {
        setAppliedCoupon(null);
        setCouponError(`Coupon removed: subtotal is below minimum order.`);
      }
    }
  }, [subtotal, appliedCoupon]);

  const durTest = (m: number) => svcDur === "All" || (svcDur === "short" && m < 60) || (svcDur === "mid" && m >= 60 && m <= 120) || (svcDur === "long" && m > 120);
  const svcFiltered = SERVICES
    .filter((s) => (svcCat === "All" || s.cat === svcCat) && durTest(s.durMin) &&
      (svcQuery.trim() === "" || (s.name + " " + s.desc + " " + s.cat).toLowerCase().includes(svcQuery.trim().toLowerCase())))
    .sort((a, b) => (svcSort === "priceAsc" ? a.price - b.price : svcSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
  const svcHasFilters = svcCat !== "All" || svcDur !== "All" || svcQuery.trim() !== "";
  const clearSvc = () => { setSvcQuery(""); setSvcCat("All"); setSvcDur("All"); setSvcSort("popular"); };
  const catColor = (cat: string) => "c" + (prodCats.indexOf(cat) % 4);

  const priceTest = (price: number) => prodPrice === "All" || (prodPrice === "lo" && price < 10000) || (prodPrice === "mid" && price >= 10000 && price <= 15000) || (prodPrice === "hi" && price > 15000);
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
    .map((g) => ({ ...g, items: faqQ ? g.items.filter(([q, a]) => String(q + " " + a).toLowerCase().includes(faqQ)) : g.items }))
    .filter((g) => g.items.length > 0);

  const REV_DIST = useMemo(() => {
    const bars: [number, number][] = [[5, 0], [4, 0], [3, 0], [2, 0], [1, 0]];
    if (displayReviews.length > 0) {
      const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      displayReviews.forEach(rv => {
        const rounded = Math.min(5, Math.max(1, Math.round(rv.r)));
        counts[rounded] = (counts[rounded] || 0) + 1;
      });
      bars[0][1] = Math.round((counts[5] / displayReviews.length) * 100);
      bars[1][1] = Math.round((counts[4] / displayReviews.length) * 100);
      bars[2][1] = Math.round((counts[3] / displayReviews.length) * 100);
      bars[3][1] = Math.round((counts[2] / displayReviews.length) * 100);
      bars[4][1] = Math.round((counts[1] / displayReviews.length) * 100);
    }
    return bars;
  }, [displayReviews]);
  const revFiltered = displayReviews
    .filter((rv) => (revStar === 0 || rv.r === revStar) && (!revPhotos || rv.photos > 0))
    .sort((a, b) => (revSort === "high" ? b.r - a.r : revSort === "low" ? a.r - b.r : 0));
  const revPhotoTiles = displayReviews.filter((rv) => rv.photos > 0).flatMap((rv) => Array.from({ length: rv.photos }).map((_, i) => rv.id + i)).slice(0, 8);

  const submitReview = () => {
    if (!revRating || !revRef.trim()) {
      ping("Add a rating and your order reference");
      return;
    }
    setReviewOpen(false);
    setRevRating(0);
    setRevText("");
    setRevRef("");
    ping("Thank you, your review has been submitted");
  };

  const featSvcIds = FEATURED.filter((f) => f.type === "service").map((f) => f.id);
  const featProdIds = FEATURED.filter((f) => f.type === "product").map((f) => f.id);
  const homeServices = SERVICES.filter((s) => !featSvcIds.includes(s.id));
  const homeProducts = PRODUCTS.filter((p) => !featProdIds.includes(p.id));

  // --- Submit Order ---
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      ping('Name and phone are required.');
      return;
    }
    setCheckoutLoading(true);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');

    // 1. Submit slot bookings first if there are services in the cart
    const serviceItems = bagItems.filter(item => item.type === 'service');
    for (const svcItem of serviceItems) {
      try {
        await fetch(`${API_URL}/v1/public/store/${username}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: svcItem.id,
            slot_id: svcItem.slotId,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail || undefined,
            notes: `Delivery preference: ${deliveryMethod} | Color/Size choice: ${svcItem.colour}/${svcItem.size} | Notes: ${orderNote}`
          })
        });
      } catch (err) {
        console.error("Booking submission error:", err);
      }
    }

    // 2. Submit order for items in the bag
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
          delivery_address: deliveryMethod === 'delivery' ? (deliveryAddress || 'None specified') : 'Store Pickup',
          notes: `Selected sizes/colors:\n${bagItems.map(b => `- ${b.name}: Size ${b.size}, Color ${b.colour}`).join('\n')}\n\nNotes: ${orderNote}`,
          items: bagItems.map(item => ({
            product_id: item.id,
            quantity: item.qty
          })),
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined
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

      setBagItems([]);
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
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
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

  /* ---- shared content blocks ---- */
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
    const sizes = p.sizes || ["One size"];
    const sized = !(sizes.length === 1 && sizes[0] === "One size");
    const colour = colours.find((c: any) => c.n === selColour) || colours[0];
    const needSize = sized && !selSize;
    const g = prodColor(p.cat);
    const look = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3);
    return (
      <div className="pv">
        <button className="pv-back" onClick={() => go("products")}><ChevronLeft size={16} /> Back to shop</button>
        <div className="pv-grid">
          <div className="pv-gallery">
            <div className={`pv-main ${g}`} style={colour ? { borderColor: colour.h } : undefined}>
              {p.popular && <span className="pv-tag"><Star size={11} /> Best seller</span>}
              <span className="pv-cat">{p.cat}</span>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <ShoppingBag className="pv-main-icn" size={40} />
              )}
            </div>
            {p.image_urls && p.image_urls.length > 0 && (
              <div className="pv-thumbs">
                {p.image_urls.slice(0, 3).map((u: string, i: number) => (
                  <span key={i} className="pv-thumb" onClick={() => setSelProduct({ ...p, image_url: u })}>
                    <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="pv-info">
            <span className="pv-infocat">{p.cat}{p.condition ? "  ·  " + p.condition : ""}</span>
            <h1 className="pv-name">{p.name}</h1>
            <div className="pv-price">{money(p.price)} <span className="pv-approx">approx ${Math.round(p.price / 1600)}</span></div>
            <p className="pv-desc">{p.desc}</p>

            {colours.length > 0 && (<>
              <div className="pv-row"><span className="pv-label">Colour</span><span className="pv-colourname">{colour ? colour.n : ""}</span></div>
              <div className="pv-swatches">{colours.map((c: any) => <button key={c.n} className={`pv-swatch ${selColour === c.n ? "on" : ""}`} style={{ background: c.h }} onClick={() => setSelColour(c.n)} aria-label={c.n}>{selColour === c.n && <Check size={14} />}</button>)}</div>
            </>)}

            {sized && (<>
              <div className="pv-row"><span className="pv-label">Size</span><button className="pv-sizeguide" onClick={() => setSizeGuideOpen(true)}><Ruler size={13} /> Size guide</button></div>
              <div className="pv-sizes">{sizes.map((sz: string) => { const out = (p.soldSizes || []).includes(sz); return <button key={sz} disabled={out} className={`pv-size ${selSize === sz ? "on" : ""} ${out ? "out" : ""}`} onClick={() => !out && setSelSize(sz)}>{sz}</button>; })}</div>
              {p.fit && <p className="pv-fit"><Ruler size={12} /> Fit: {p.fit}</p>}
            </>)}

            <button className="ps-sheet-cta pv-add" disabled={needSize} onClick={() => addToBag(p, selSize, colour ? colour.n : "One size")}><ShoppingBag size={17} /> {needSize ? "Select a size" : "Add to bag"}</button>

            <div className="pv-meta">
              {p.condition && <div><BadgeCheck size={15} /><span>Condition: {p.condition}. Secondhand, cleaned and quality checked.</span></div>}
              {p.care && <div><Heart size={15} /><span>Care: {p.care}.</span></div>}
              <div><Truck size={15} /><span>Lagos delivery 2 to 4 days, nationwide 3 to 7. Free pickup in Surulere.</span></div>
              <div><RotateCcw size={15} /><span>Returns within 3 days if a piece is not as described.</span></div>
              <div><ShieldCheck size={15} /><span>Secured by Frontstore. Your payment is protected until it ships.</span></div>
            </div>
          </div>
        </div>
        <div className="pv-look">
          <h2 className="pv-look-h">More finds</h2>
          <div className="ps-grid">{look.map((x) => <ProductCard key={x.id} p={x} onOpen={() => openProduct(x)} />)}</div>
        </div>
        <StoreFoot onNav={go} slug={store.username} />
      </div>
    );
  };

  const reviewsBody = () => (<>
    <p className="svc-intro">Every review here comes from a verified order on Frontstore. The store can respond, but cannot remove genuine reviews.</p>
    <RatingSummary rating={store.rating ?? 0.0} reviewCount={store.review_count ?? 0} reviews={reviews} />
    <button className="rev-leave rev-leave-m" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
    <div className="rev-trust rev-trust-m">
      <ShieldCheck size={14} /> Reviews are from verified orders.
      {((store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0) && (
        ` The store typically responds in ~${store.reply_time_minutes} min.`
      )}
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
      <span className="ab-creds-h">Curating credentials</span>
      <ul>{AUTHOR.credentials.map((c: string) => <li key={c}><Check size={14} /> {c}</li>)}</ul>
    </div>
    <p className="ab-quote">{AUTHOR.quote}</p>
    <div className="ab-socials">
      <button onClick={() => ping("Opening Instagram")}><Instagram size={16} /> {AUTHOR.socials.instagram}</button>
      <button onClick={() => ping("Opening TikTok")}><TikTokIcon size={16} /> {AUTHOR.socials.tiktok}</button>
    </div>
  </>);

  const aboutWork = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">Our work</h4>
        <button className="ab-seclink" onClick={() => go("portfolio")}>See more <ChevronRight size={14} /></button>
      </div>
      <div className="ab-gallery">
        {displayPortfolio.slice(0, 3).map((g: any) => (
          <button key={g.label} className={`ab-shot ${g.c}`} onClick={() => ping("Opening photo")}>
            {g.image_url ? (
              <img src={g.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span className="ab-shot-cap">{g.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const aboutFeatured = () => (
    <div className="ab-featured">
      <span className="ab-featured-h"><Award size={14} /> As seen in and trusted by</span>
      <div className="ab-featured-row">{RECOGNITION.map((r) => <span key={r} className="ab-logo">{r}</span>)}</div>
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
          <button className="ab-review-all" onClick={() => go("reviews")}>Read reviews <ChevronRight size={14} /></button>
        </div>
      </div>
    );
  };

  const aboutJournal = () => (
    <div className="ab-section">
      <div className="ab-sec-head">
        <h4 className="ab-subhead">From {store.founder_name ? `${store.founder_name.split(' ')[0]}'s` : "the founder's"} journal</h4>
        <button className="ab-seclink" onClick={() => go("blog")}>All articles <ChevronRight size={14} /></button>
      </div>
      <div className="ab-journal">
        {displayBlog.slice(0, 3).map((b) => (
          <button key={b.title} className="ab-journal-item" onClick={() => openPost(b)}>
            <span className="ab-journal-cat">{b.cat}</span>
            <b>{b.title}</b>
            <span className="ab-journal-meta">{b.read} read</span>
          </button>
        ))}
      </div>
    </div>
  );

  const aboutBody = () => (<>
    {store.store_bio && <p className="ps-prose">{store.store_bio}</p>}
    {store.founder_bio && <p className="ab-para">{store.founder_bio}</p>}
    <div className="ab-founder ab-founder-m">
      <div className="ab-portrait"><span className="ab-portrait-mono">{AUTHOR.initial}</span><span className="ab-portrait-tag">Founder</span></div>
      <div className="ab-founder-body">{aboutFounderBody()}</div>
    </div>
    {aboutWork()}
    {aboutFeatured()}
    <div className="ab-section">
      <h4 className="ab-subhead">Good to know</h4>
      <div className="ab-facts ab-facts-m">
        {ABOUT_FACTS.map(([k, v]) => (
          <div className="ab-fact" key={k}><span className="ab-fact-k">{k}</span><span className="ab-fact-v">{v}</span></div>
        ))}
      </div>
    </div>
    {aboutReview()}
    {aboutJournal()}
    <div className="ps-about-grid">
      <div><b>{store.total_orders ?? 0}</b><span>orders delivered</span></div>
      <div><b>{(store.rating ?? 0.0).toFixed(1)}</b><span>average rating</span></div>
      {store.since && <div><b>{new Date().getFullYear() - parseInt(store.since)} yrs</b><span>in practice</span></div>}
    </div>
    <div className="ab-follow">
      <span className="ab-follow-h">Follow the store</span>
      <div className="ab-socials">
        <button onClick={() => ping("Opening Instagram")}><Instagram size={16} /> {AUTHOR.socials.instagram}</button>
        <button onClick={() => ping("Opening TikTok")}><TikTokIcon size={16} /> {AUTHOR.socials.tiktok}</button>
        <button onClick={() => handleWa("Hi " + store.store_name + "! I'm visiting from your website.")}><WhatsAppIcon size={16} /> WhatsApp</button>
      </div>
    </div>
    <button className="ab-book-m" onClick={() => go("products")}><ShoppingBag size={16} /> Shop the rail</button></>);

  const faqSections = () => (
    <div className="faq-groups">
      {faqFiltered.length === 0 && (
        <div className="faq-empty">No questions match that search. Try another word, or message the store below.</div>
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
      <p>
        {store.faq_help_text || (
          <>
            Message the store directly and we will get back to you
            {((store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0) ? (
              `, usually in ~${store.reply_time_minutes} min.`
            ) : (
              "."
            )}
          </>
        )}
      </p>
      <button className="faq-help-cta" onClick={() => handleWa("Hi " + store.store_name + "! I need help with...")}><WhatsAppIcon size={15} /> Message on WhatsApp</button>
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
      <button className="ct-wa" onClick={() => handleWa("Hi " + store.store_name + "! I have an enquiry.")}><WhatsAppIcon size={18} /> Chat on WhatsApp</button>
      <div className="ct-alt">
        <button onClick={() => ping("Opening email")}><Mail size={15} /> {store.email || `${store.username || 'hello'}@frontstore.ng`}</button>
        <button onClick={() => ping("Opening phone")}><Phone size={15} /> {store.whatsapp_phone}</button>
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
      <textarea className="ct-input ct-textarea" rows={4} value={cMsg} onChange={(e) => setCMsg(e.target.value)} placeholder="Any details, like your preferred size, style, or request details." />
      <button className="ct-send" onClick={() => { if (!cName.trim() || !cMsg.trim()) { ping("Please add your name and a short note"); return; } ping("Opening email client"); }}><Mail size={16} /> Send email</button>
    </div>
  );

  const contactVisit = () => {
    const openToday = (HOURS[todayIdx][1] || "").toLowerCase() !== "closed";
    return (
      <div className="ct-visit">
        <div className="ab-rail-h"><MapPin size={15} /> Visit the store</div>
        {store.location && (
          <div className="ct-map"><span className="ct-map-pin"><MapPin size={15} /></span><span className="ct-map-label">{store.location}</span></div>
        )}
        {store.address && (
          <>
            <p className="ab-addr">{store.address}</p>
            <button className="ps-dir" onClick={() => ping("Opening directions")}><Navigation size={15} /> Directions</button>
          </>
        )}
        <div className="ct-hours">
          <div className="ct-hours-head">
            <b>Opening hours</b>
            <span className={`ct-open ${openToday ? "" : "closed"}`}><span className="dot" /> {openToday ? "Open today" : "Closed today"}</span>
          </div>
          <ul className="ct-hours-list">
            {HOURS.map(([d, h], i) => (
              <li key={d} className={i === todayIdx ? "today" : ""}>
                <span>{d}</span>
                {(h || "").toLowerCase() === "closed" ? <span className="clo">Closed</span> : <b>{h}</b>}
              </li>
            ))}
          </ul>
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
          <li><Check size={15} /> Reschedule or cancel up to 48 hours before your appointment for a full refund of your deposit.</li>
          <li><Check size={15} /> Within 48 hours of your appointment, the deposit is held against the booking and is not refunded.</li>
        </ul>
      </div>
      <div className="rf-section">
        <h3 className="rf-section-head"><ShoppingBag size={17} /> Products</h3>
        <ul className="rf-list">
          <li><Check size={15} /> Unworn items can be returned within 3 days of delivery if they are not as described, in their original condition.</li>
          <li><Check size={15} /> Because pieces are secondhand and one of a kind, sales are otherwise final unless an item is faulty or misdescribed.</li>
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
        <li><ShoppingBag size={16} /><div><b>Returns</b><span>If not as described, 3 days</span></div></li>
        <li><RotateCcw size={16} /><div><b>Refunds</b><span>To original payment method</span></div></li>
      </ul>
    </div>
  );

  const refundsAction = () => (
    <div className="blog-convert">
      <b>Need to cancel or return something?</b>
      <p>Message the store and we will sort your cancellation, return or refund.</p>
      <button className="blog-convert-cta" onClick={() => handleWa("Hi " + store.store_name + "! I have an enquiry regarding a cancellation, return or refund.")}><WhatsAppIcon size={15} /> Message on WhatsApp</button>
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

  const policySections = (items: any[]) => items.map((s) => (
    <section key={s.t} id={termId(s.t)} className="tm-section">
      <h3>{s.t}</h3>
      {s.p.map((para: string, i: number) => <p key={i}>{para}</p>)}
      {s.locked && <LockedFrontstorePanel title={s.locked.title} body={s.locked.body} link={s.locked.link} />}
      {s.link && <button className="tm-link" onClick={() => go(s.link.page)}>{s.link.label} <ChevronRight size={14} /></button>}
    </section>
  ));

  const policyRelated = (links: [string, string][]) => (
    <div className="rf-related">
      <span className="rf-related-h">Related</span>
      {links.map(([label, pg]) => <button key={pg} onClick={() => go(pg)}>{label} <ChevronRight size={15} /></button>)}
    </div>
  );

  const termsBody = () => (
    <div className="tm-body-m">
      <p className="tm-intro">By booking or buying from {store.store_name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
      {policySections(TERMS)}
      <div className="tm-meta">Last updated 1 June 2026</div>
      {policyRelated([["Refunds", "returns"], ["FAQ", "faq"]])}
    </div>
  );

  const privacyBody = () => (
    <div className="tm-body-m">
      <p className="tm-intro">This notice explains what {store.store_name} does with your information when you book, buy or get in touch.</p>
      {policySections(PRIVACY)}
      <div className="tm-meta">Last updated 1 June 2026</div>
      {policyRelated([["Terms", "terms"], ["Refunds", "returns"]])}
    </div>
  );

  const blogBody = () => (
    <div className="blog-grid">
      {displayBlog.map((b, i) => (
        <BlogCard key={b.title} b={b} colour={`c${i % 3}`} onOpen={() => openPost(b)} />
      ))}
    </div>
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
      {pfList.map((p: any) => (
        <button key={p.label} className={`pf-shot ${p.c}`} onClick={() => ping("Opening photo")}>
          {p.image_url ? (
            <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="pf-shot-cap"><b>{p.label}</b><span>{p.cat}</span></span>
          )}
        </button>
      ))}
    </div>
  );

  const portfolioFollow = () => (
    <div className="ab-follow">
      <span className="ab-follow-h">More on social</span>
      <div className="ab-socials">
        <button onClick={() => ping("Opening Instagram")}><Instagram size={16} /> {AUTHOR.socials.instagram}</button>
        <button onClick={() => ping("Opening TikTok")}><TikTokIcon size={16} /> {AUTHOR.socials.tiktok}</button>
      </div>
    </div>
  );

  const portfolioBody = () => (<>
    <p className="svc-intro">A look at recent finds from the store, from vintage denim to one off finds.</p>
    {portfolioChips()}
    {portfolioGrid()}
    <button className="ab-book-m" onClick={() => go("products")}><ShoppingBag size={16} /> Shop the rail</button>
    {portfolioFollow()}
  </>);

  const articleView = () => {
    if (!post) return null;
    const idx = displayBlog.indexOf(post);
    const colour = `c${(idx < 0 ? 0 : idx) % 3}`;
    const sameCat = displayBlog.filter((b) => b !== post && b.cat === post.cat);
    const others = displayBlog.filter((b) => b !== post && b.cat !== post.cat);
    const related = [...sameCat, ...others].slice(0, 3);
    const authorName = post.is_pseo ? store.store_name : (store.founder_name || store.store_name);
    const authorInitial = authorName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className="art">
        <button className="art-back" onClick={() => go("blog")}><ChevronLeft size={16} /> All articles</button>
        <div className="art-wrap">
          <article className="art-main">
            <div className={`art-hero ${colour}`}><span className="blog-cat">{post.cat}</span></div>
            <span className="art-kicker">{post.cat}</span>
            <h1 className="art-title">{post.title}</h1>
            <div className="art-meta">
              <span className="art-meta-av">{authorInitial}</span>
              <span className="art-meta-by">By {authorName}</span>
              <span className="ps-dot">•</span> {post.date} <span className="ps-dot">•</span> {post.read} read
            </div>
            <div className="art-body">
              {post.body.map((blk: any, i: number) =>
                blk.h ? <h3 key={i}>{blk.h}</h3>
                : blk.list ? <ul key={i}>{blk.list.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
                : <p key={i}>{blk.p}</p>
              )}
            </div>
          </article>
          <aside className="art-rail">
            <div className="art-share">
              <span className="art-share-h">Share this article</span>
              <div className="art-share-row">
                <button onClick={() => handleWa(`Check out this article: "${post.title}" on ${store.store_name} - ${systemDomain}/${username}`)}><WhatsAppIcon size={16} /> WhatsApp</button>
                <button onClick={() => ping("Link copied")}><Copy size={15} /> Copy link</button>
              </div>
            </div>
            <div className="blog-convert">
              <b>Enjoyed the read?</b>
              <p>Browse the latest finds, and grab the ones you love before they are gone.</p>
              <button className="blog-convert-cta" onClick={() => go("products")}><ShoppingBag size={15} /> Shop the rail</button>
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

  const announcement = !annOff && (store.announcement_title || store.announcement_body) && (
    <div className="ps-ann">
      <Megaphone size={16} />
      <p><b>{store.announcement_title || "Announcement"}</b> {store.announcement_body || ""}</p>
      <button onClick={() => setAnnOff(true)} aria-label="Dismiss"><X size={15} /></button>
    </div>
  );

  const featured = FEATURED.length > 0 && (
    <section className="feat">
      <div className="feat-head"><span className="feat-tag"><Award size={13} /> Featured</span></div>
      <div className="feat-grid">
        {FEATURED.map((f: any) => (
          <FeaturedCard key={f.id} f={f} onAction={() => openProduct(PRODUCTS.find((x) => x.id === f.id) || PRODUCTS[0])} />
        ))}
      </div>
    </section>
  );

  const Sheet = ({ onClose, title, children, onBack }: { onClose: () => void; title: string; children: React.ReactNode; onBack?: () => void }) => (
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

  const Panel = ({ onClose }: { onClose?: () => void }) => (
    <div className="ps-panel">
      <div className="ps-panel-top">
        <span className="ps-logo"><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></span>
        {onClose && <button className="ps-x" onClick={onClose} aria-label="Close"><X size={20} /></button>}
      </div>
      <button className="ps-id" onClick={() => go("home")}>
        <span className="ps-id-av">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          ) : storeInitials}
        </span>
        <span className="ps-id-main">
          <b>{store.store_name} {store.is_verified ? <BadgeCheck size={14} className="ps-verif" /> : null}</b>
          <i>frontstore.ng/{username}</i>
          {store.rating && <em><Star size={12} className="ps-star" /> {store.rating} ({store.review_count || 0})</em>}
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
          <button onClick={() => { handleWa(`Hi ${store.store_name}!`); onClose && onClose(); }}><WhatsAppIcon size={16} /> Message</button>
          <button onClick={() => { setShare(true); onClose && onClose(); }}><Share2 size={16} /> Share</button>
        </div>
      </div>
      <div className="ps-panel-foot">
        <span><Lock size={12} /> Secured by Frontstore</span>
        <p>Buyer protection and platform terms apply to every order.</p>
      </div>
    </div>
  );

  // Dynamic booking slots mapping
  const slots = useMemo(() => {
    if (!bookDate || !bookSvc) return [];
    const dateStr = `${bookDate.getFullYear()}-${String(bookDate.getMonth() + 1).padStart(2, '0')}-${String(bookDate.getDate()).padStart(2, '0')}`;
    const daily = apiSlots.filter(s => s.slot_date === dateStr);
    
    if (daily.length > 0) {
      return daily.map(s => ({
        time: s.start_time,
        taken: s.is_booked || s.stock_status === 'booked' || false,
        id: s.id
      }));
    }

    // Local slots fallback
    const hours = HOURS[(bookDate.getDay() + 6) % 7][1];
    if (!hours || hours.toLowerCase() === "closed") return [];
    const [o, c] = hours.split(" - ");
    if (!o || !c) return [];
    const open = parseClock(o), close = parseClock(c);
    const out = [];
    for (let t = open; t <= close - bookSvc.durMin; t += 60) out.push(t);
    return out.map((min, i) => ({
      time: fmtMins(min),
      taken: (bookDate.getDate() + i) % 4 === 0,
      id: undefined
    }));
  }, [bookDate, bookSvc, apiSlots]);

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

    const svcBar = bookSvc && (
      <div className="bk-svcbar">
        <span><b>{bookSvc.name}</b><i>{bookSvc.dur} <span className="ps-dot">•</span> {money(bookSvc.price)}</i></span>
        <button onClick={() => setBookStep("service")}>Change</button>
      </div>
    );

    return (
      <Sheet onClose={() => setBookOpen(false)} onBack={onBack} title={titles[bookStep]}>
        {bookStep === "service" && (<>
          <p className="ps-sheet-sub">Pick the service you would like to book.</p>
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
                const hours = HOURS[(c.getDay() + 6) % 7][1];
                const off = !hours || hours.toLowerCase() === "closed" || c < today || c > horizon;
                const sel = bookDate && c.toDateString() === bookDate.toDateString();
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
          {bookDate && <p className="ps-field-lbl">{fmtDateFull(bookDate)}</p>}
          {loadingSlots ? <div className="bk-empty">Loading times...</div> : slots.length > 0 ? (
            <div className="bk-times">
              {slots.map((s) => (
                <button key={s.time} disabled={s.taken} className={`bk-slot${s.taken ? " taken" : ""}`}
                  onClick={() => { if (!s.taken) { setBookTime(s.time); setBookStep("review"); } }}>{s.time}</button>
              ))}
            </div>
          ) : <p className="bk-empty">No times available on this day. Try another date.</p>}
        </>)}

        {bookStep === "review" && (<>
          {svcBar}
          <div className="bk-summary">
            {bookDate && <div><span>Date</span><b>{fmtDateFull(bookDate)}</b></div>}
            <div><span>Time</span><b>{bookTime}</b></div>
            <div><span>Duration</span><b>{bookSvc.dur}</b></div>
            <div><span>Total</span><b>{money(bookSvc.price)}</b></div>
          </div>
          <p className="ps-field-lbl">Your name</p>
          <input className="bk-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name on the booking" />
          <p className="ps-field-lbl">Anything we should know? (optional)</p>
          <textarea className="bk-input bk-textarea" value={bookNote} onChange={(e) => setBookNote(e.target.value)} placeholder="Preferences, sizing note, details..." />
          <div className="bk-deposit-row"><span><Lock size={13} /> Deposit to secure</span><b>{money(deposit)}</b></div>
          <p className="ps-deposit">Frontstore holds your deposit until your appointment, then the {money(bookSvc.price - deposit)} balance is due in person. Covered by buyer protection.</p>
          <button className="ps-sheet-cta" disabled={!customerName.trim()} onClick={confirmBooking}>Add slot and continue</button>
        </>)}
      </Sheet>
    );
  };

  const renderBagSheet = () => {
    return (
      <Sheet onClose={() => { setBag(false); setCheckoutStep('cart'); }} title={checkoutStep === 'success' ? 'Order Confirmed' : checkoutStep === 'details' ? 'Details' : 'Your bag'}>
        {checkoutStep !== 'success' && bagItems.length > 0 && (
          <div className="th-steps" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button className={`tc-step ${checkoutStep === 'cart' ? 'active' : ''}`} style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '8px 0', border: 'none', background: checkoutStep === 'cart' ? 'var(--brand)' : 'none', color: checkoutStep === 'cart' ? '#fff' : 'var(--brand)', borderRadius: 6 }} onClick={() => setCheckoutStep('cart')}>Cart</button>
            <button className={`tc-step ${checkoutStep === 'details' ? 'active' : ''}`} style={{ flex: 1, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, padding: '8px 0', border: 'none', background: checkoutStep === 'details' ? 'var(--brand)' : 'none', color: checkoutStep === 'details' ? '#fff' : 'var(--brand)', borderRadius: 6 }} onClick={() => setCheckoutStep('details')}>Details</button>
          </div>
        )}

        {checkoutStep === 'cart' && (
          bagItems.length === 0 ? (
            <p className="ps-bag-empty">Your bag is empty.</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bagItems.map((b) => (
                  <div className="ps-bag-line" key={b.key}>
                    <span className="ps-bag-th">
                      {b.image_url ? (
                        <img src={b.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "11px" }} />
                      ) : (
                        <StoreIcon size={16} />
                      )}
                    </span>
                    <div>
                      <b>{b.name}</b>
                      <span>
                        {b.colour}{b.size !== "One size" ? "  ·  Size " + b.size : ""}  ·  {money(b.price)}
                        {b.slot && <div style={{ fontSize: 11, color: "var(--brand)", marginTop: 4 }}><Calendar size={10} style={{ display: "inline", marginRight: 4 }} />{b.slot}</div>}
                      </span>
                      <button className="ps-bag-rm" onClick={() => removeItem(b.key)}>Remove</button>
                    </div>
                    <div className="ps-qty">
                      <button onClick={() => setQty(b.key, -1)} aria-label="Less"><Minus size={14} /></button>
                      <b>{b.qty}</b>
                      <button onClick={() => setQty(b.key, 1)} aria-label="More"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ps-bag-total"><span>Subtotal</span><b>{money(subtotal)}</b></div>
              {deliveryMethod === 'delivery' && shippingPreview.shippingFee > 0 && (
                <div className="ps-bag-total" style={{ fontSize: 13, color: 'var(--muted)' }}><span>Shipping</span><span>{money(shippingPreview.shippingFee)}</span></div>
              )}
              {deliveryMethod === 'delivery' && shippingPreview.handlingFee > 0 && (
                <div className="ps-bag-total" style={{ fontSize: 13, color: 'var(--muted)' }}><span>Handling Fee</span><span>{money(shippingPreview.handlingFee)}</span></div>
              )}
              <div className="ps-bag-total" style={{ fontWeight: 800 }}><span>Total</span><b>{money(deliveryMethod === 'delivery' ? shippingPreview.total : subtotal)}</b></div>
              <button className="ps-sheet-cta" onClick={() => setCheckoutStep('details')}>Checkout <ChevronRight size={16} /></button>
              <button className="th-wa-btn" style={{ marginTop: 10, background: '#25D366', color: '#fff', padding: '12px', width: '100%', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => handleWa(`Hi ${store.store_name}!\nI'd like to buy:\n${bagItems.map(b => `• ${b.name} (Size: ${b.size}, Color: ${b.colour}) ×${b.qty} — ${money(b.price * b.qty)}`).join('\n')}\nTotal: ${money(subtotal)}`)}>
                <WhatsAppIcon size={18} /> Order via WhatsApp
              </button>
            </>
          )
        )}

        {checkoutStep === 'details' && (
          <form onSubmit={handleCheckoutSubmit}>
            <label className="th-label">Your Name *</label>
            <input className="bk-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full name" required style={{ marginBottom: 14 }} />

            <label className="th-label">WhatsApp Phone Number *</label>
            <input className="bk-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. 0801 234 5678" type="tel" required style={{ marginBottom: 14 }} />

            <label className="th-label">Alternative Phone (optional)</label>
            <input className="bk-input" value={customerWhatsapp} onChange={e => setCustomerWhatsapp(e.target.value)} placeholder="e.g. 0802 345 6789" type="tel" style={{ marginBottom: 14 }} />

            <label className="th-label">Email Address (optional)</label>
            <input className="bk-input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@example.com" type="email" style={{ marginBottom: 14 }} />

            <label className="th-label">Delivery Method</label>
            <select className="th-select" value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as any)} style={{ width: '100%', padding: '11px 13px', borderRadius: '11px', border: '1px solid var(--line)', background: 'var(--card)', marginBottom: 14 }}>
              <option value="delivery">Delivery to Address</option>
              <option value="pickup">Self-Pickup at Store</option>
            </select>

            {deliveryMethod === 'delivery' && (
              <>
                <label className="th-label">Delivery Address *</label>
                <textarea className="bk-input bk-textarea" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Full address (Street name, Area, City, State)" required style={{ marginBottom: 14 }} />
              </>
            )}

            <label className="th-label">Order Notes / Sizing preference (optional)</label>
            <textarea className="bk-input bk-textarea" value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Specific details, preferred sizing details..." style={{ marginBottom: 14 }} />

            {/* Coupon Form */}
            <div style={{ marginTop: 12, marginBottom: 12 }}>
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
                    borderRadius: 8,
                    fontSize: 13,
                    background: 'var(--bg)',
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
                      borderRadius: 8,
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
                      borderRadius: 8,
                      background: 'var(--primary)',
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

            <p style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}><Lock size={12} /> Secured checkout. Your details are safe with {appName}.</p>

            {(() => {
              let discountAmount = 0;
              if (appliedCoupon) {
                if (appliedCoupon.discount_type === 'percentage') {
                  discountAmount = Math.round(subtotal * (parseFloat(appliedCoupon.discount_value) / 100));
                } else {
                  discountAmount = Math.round(parseFloat(appliedCoupon.discount_value));
                }
                discountAmount = Math.min(discountAmount, subtotal);
              }
              const discountedSubtotal = Math.max(0, subtotal - discountAmount);
              const finalTotal = deliveryMethod === 'delivery' ? (shippingPreview.total - discountAmount) : discountedSubtotal;

              return (
                <button type="submit" className="ps-sheet-cta" disabled={checkoutLoading}>
                  {checkoutLoading ? 'Placing Order...' : `Place Order · ${money(finalTotal)}`}
                </button>
              );
            })()}
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
            <button className="ps-logo as-btn" onClick={() => go("home")}><img src="/logo.png" alt="Frontstore" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} /><span className="ps-logo-text">frontstore</span></button>
            <button className="ps-top-icon" onClick={() => setSearch(true)} aria-label="Search"><Search size={20} /></button>
            <button className="ps-top-share" onClick={() => setShare(true)} aria-label="Share"><Share2 size={19} /></button>
          </header>

          <main className="ps-main">
            {page === "home" && (<>
              <section className="ps-cover-wrap">
                <div className="ps-cover"><StoreIcon className="ps-cover-icn" strokeWidth={1.1} /></div>
                <span className="ps-avatar">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.store_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : storeInitials}
                </span>
                <h1 className="ps-name">{store.store_name} {store.is_verified ? <BadgeCheck size={20} className="ps-verif" /> : null}</h1>
                {(store.business_persona || store.location) && (
                  <p className="ps-meta">
                    {store.business_persona ? store.business_persona.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) : ""}
                    {store.business_persona && store.location && <span className="ps-dot">•</span>}
                    {store.location && <><MapPin size={13} /> {store.location}</>}
                  </p>
                )}
                <div className="ps-id-actions-row">
                  <button className="ps-url" onClick={copyUrl}>frontstore.ng/{username} <Copy size={13} /></button>
                  <button className="ps-notify" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                </div>
                <div className="ps-stats">
                  <div><b><Star size={14} className="ps-star" /> {(store.rating ?? 0.0).toFixed(1)}</b><span>{store.review_count ?? 0} reviews</span></div>
                  <div><b>{store.total_orders ?? 0}</b><span>orders</span></div>
                  {((store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0) && (
                    <div><b>~{store.reply_time_minutes} min</b><span>reply time</span></div>
                  )}
                </div>
                {store.store_bio && <p className="ps-bio">{store.store_bio}</p>}
                <div className="ps-statusline">
                  <span className="ps-open"><span className="ps-pulse" /> Open now</span>
                  <span className="ps-secure"><ShieldCheck size={13} /> Secured by Frontstore</span>
                </div>
              </section>

              {announcement}
              {featured}

              <div className="ps-searchbar" onClick={() => setSearch(true)}><Search size={17} /> <span>Search the rail</span></div>
              <div className="ps-chips">{prodCats.map((c) => <button key={c} onClick={() => setSearch(true)}>{c}</button>)}</div>

              <SectionHead title="Products" action={`See all ${PRODUCTS.length}`} onAction={() => go("products")} />
              {productsGrid("ps-grid", homeProducts.slice(0, 4))}
              <button className="ps-seeall" onClick={() => go("products")}>See all {PRODUCTS.length} products <ChevronRight size={16} /></button>

              {SERVICES.length > 0 && (<>
                <SectionHead title="Services" action={`See all ${SERVICES.length}`} onAction={() => go("services")} />
                {servicesGrid("ps-grid", homeServices.slice(0, 4))}
                <button className="ps-seeall" onClick={() => go("services")}>See all {SERVICES.length} services <ChevronRight size={16} /></button>
              </>)}

              <SectionHead title="Reviews" />
              <RatingSummary rating={store.rating ?? 0.0} reviewCount={store.review_count ?? 0} reviews={reviews} />
              <div className="ps-reviews-row">{displayReviews.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} />)}</div>
              <button className="ps-seeall" onClick={() => go("reviews")}>See all reviews <ChevronRight size={16} /></button>

              <SectionHead title="Visit the store" />
              <div className="ps-visit">
                <div className="ps-map"><MapPin size={26} /><span>Map preview</span></div>
                <div className="ps-visit-info">
                  {store.address && (
                    <>
                      <p className="ps-addr"><MapPin size={15} /> {store.address}</p>
                      <button className="ps-dir" onClick={() => ping("Opening directions")}><Navigation size={15} /> Directions</button>
                    </>
                  )}
                  <ul className="ps-hours">{HOURS.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                </div>
              </div>

              {FAQ_PREVIEW.length > 0 && (<>
                <SectionHead title="Good to know" />
                <Accordion items={FAQ_PREVIEW} open={openFaq} setOpen={setOpenFaq} />
              </>)}
              <StoreFoot onNav={go} slug={store.username} />
            </>)}

            {page === "services" && <Sub title="Services">{SERVICES.length === 0 ? <EmptyState /> : servicesGrid("ps-grid", SERVICES)}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "products" && <Sub title="Products">{PRODUCTS.length === 0 ? <EmptyState /> : productsGrid("ps-grid", PRODUCTS)}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "portfolio" && <Sub title="Portfolio">{displayPortfolio.length === 0 ? <EmptyState /> : portfolioBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "post" && articleView()}
            {page === "product" && productView()}
            {page === "reviews" && <Sub title="Reviews">{displayReviews.length === 0 ? <EmptyState /> : reviewsBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "blog" && <Sub title="Blog">{displayBlog.length === 0 ? <EmptyState /> : blogBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "about" && <Sub title="About">{(!store.store_bio && ABOUT_FACTS.length === 0 && RECOGNITION.length === 0) ? <EmptyState /> : aboutBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "faq" && <Sub title="FAQ">{displayFaqs.length === 0 ? <EmptyState /> : faqBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
            {page === "contact" && <Sub title="Contact">{(!store.address && !store.email && !store.phone && !store.whatsapp_phone) ? <EmptyState /> : contactBody()}<StoreFoot onNav={go} slug={store.username} /></Sub>}
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
            <button className="pd-search" onClick={() => setSearch(true)}><Search size={17} /> <span>Search {store.store_name}</span></button>
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
                <span className="pd-avatar">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.store_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : storeInitials}
                </span>
                <div className="pd-identity-main">
                  <h1>{store.store_name} {store.is_verified ? <BadgeCheck size={22} className="ps-verif" /> : null}</h1>
                  <p>
                    {store.business_persona && (
                      <>
                        <span>{store.business_persona.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}</span>
                        {(store.location || store.rating || store.review_count) && <span className="ps-dot">•</span>}
                      </>
                    )}
                    {store.location && (
                      <>
                        <span><MapPin size={13} /> {store.location}</span>
                        {(store.rating || store.review_count) && <span className="ps-dot">•</span>}
                      </>
                    )}
                    <span>
                      <Star size={13} className="ps-star" /> {(store.rating ?? 0.0).toFixed(1)} ({store.review_count ?? 0})
                    </span>
                    {((store.storefront_sections || []).includes("replies_approximation") && (store.reply_time_minutes || 0) > 0) && (<>
                      <span className="ps-dot">•</span>
                      <span>Replies ~{store.reply_time_minutes} min</span>
                    </>)}
                  </p>
                </div>
                <div className="pd-identity-actions">
                  <button className="pd-book" onClick={primaryCta.run}><primaryCta.Icon size={16} /> {primaryCta.label}</button>
                  <button className="pd-ghost" onClick={() => handleWa(`Hi ${store.store_name}!`)}><WhatsAppIcon size={16} /> Message</button>
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
                      {store.address && <button onClick={() => ping("Opening directions")}><Navigation size={14} /> Directions</button>}
                      <button onClick={() => handleWa("Hello! I'm interested in your services.")}><WhatsAppIcon size={14} /> Message</button>
                    </div>
                    <ul className="ps-hours">{HOURS.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                  </div>
                  <div className="pd-railcard trust">
                    <span className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</span>
                    <p>Buyer protection and platform terms apply to every order on this store and cannot be removed by the vendor.</p>
                  </div>
                </aside>

                <div className="pd-feed">
                  {featured}
                  <div className="pd-sec-head"><h2>Products</h2><button onClick={() => go("products")}>See all {PRODUCTS.length}</button></div>
                  {productsGrid("pd-grid", homeProducts.slice(0, 6))}

                  {SERVICES.length > 0 && (<>
                    <div className="pd-sec-head"><h2>Services</h2><button onClick={() => go("services")}>See all {SERVICES.length}</button></div>
                    {servicesGrid("pd-grid", homeServices.slice(0, 6))}
                  </>)}

                  <div className="pd-sec-head"><h2>Reviews</h2><button onClick={() => go("reviews")}>See all</button></div>
                  <RatingSummary rating={store.rating ?? 0.0} reviewCount={store.review_count ?? 0} reviews={reviews} />
                  <div className="pd-grid reviews">{displayReviews.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} full />)}</div>
                </div>
              </div>
              <StoreFoot onNav={go} slug={store.username} />
            </>)}

            {(page === "services" || page === "products" || page === "reviews" || page === "blog") && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>{NAV.find(([id]) => id === page)?.[1] || page}</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                {page === "services" && (
                  SERVICES.length === 0 ? <EmptyState /> : (
                    <div className="svc-page">
                      <p className="svc-intro">Book sourcing, selling or styling with our team. Where a deposit applies it secures your slot, and the balance is settled after.</p>

                    <div className="pd-sec-head"><h2>Most booked</h2></div>
                    <div className="svc-feat-grid">
                      {SERVICES.slice(0, 3).map((s) => (
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
                              {prodCats.map((c) => <button key={c} className={svcCat === c ? "on" : ""} onClick={() => setSvcCat(c)}>{c}</button>)}
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
                          <div className="svc-fgroup">
                            <h4>Sort by</h4>
                            <div className="svc-radios">
                              {[["popular", "Most booked"], ["priceAsc", "Price: low to high"], ["priceDesc", "Price: high to low"]].map(([v, l]) => (
                                <button key={v} className={svcSort === v ? "on" : ""} onClick={() => setSvcSort(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="svc-book-card">
                          <span className="svc-open"><span className="ps-pulse" /> Open now</span>
                          <p className="svc-next">Next availability <b>Today, 3:00pm</b></p>
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
                        ) : (
                          <div className="svc-empty">No services match your filters.<button onClick={clearSvc}>Clear filters</button></div>
                        )}
                      </div>
                    </div>
                  </div>
                )
                )}
                {page === "products" && (
                  PRODUCTS.length === 0 ? <EmptyState /> : (
                    <div className="svc-page">
                      <p className="svc-intro">Shop the latest finds. Delivery across Lagos in 2 to 4 days, with nationwide shipping and Surulere pickup at checkout.</p>

                    <div className="pd-sec-head"><h2>Best sellers</h2></div>
                    <div className="svc-feat-grid">
                      {PRODUCTS.slice(0, 3).map((p) => (
                        <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} badge="Best seller" onView={() => openProduct(p)} />
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
                              {prodCats.map((c) => <button key={c} className={prodCat === c ? "on" : ""} onClick={() => setProdCat(c)}>{c}</button>)}
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
                          <div className="svc-fgroup">
                            <h4>Sort by</h4>
                            <div className="svc-radios">
                              {[["popular", "Best selling"], ["priceAsc", "Price: low to high"], ["priceDesc", "Price: high to low"]].map(([v, l]) => (
                                <button key={v} className={prodSort === v ? "on" : ""} onClick={() => setProdSort(v)}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="svc-book-card">
                          <span className="svc-trust"><ShieldCheck size={15} /> Secured by Frontstore</span>
                          <ul className="svc-deliv">
                            <li><Truck size={14} /> Delivery across Lagos in 2 to 4 days</li>
                            <li><MapPin size={14} /> Pickup available in Surulere</li>
                          </ul>
                          <button className="svc-book-cta" onClick={() => setBag(true)}><ShoppingBag size={16} /> View bag {bagCount > 0 ? ` (${bagCount})` : ""}</button>
                        </div>
                      </aside>

                      <div className="svc-main">
                        <div className="svc-results-head">
                          <b>{prodFiltered.length} {prodFiltered.length === 1 ? "product" : "products"}</b>
                          {prodHasFilters && <button className="svc-clear" onClick={clearProd}>Clear filters</button>}
                        </div>
                        {prodFiltered.length > 0 ? (
                          <div className="svc-grid">
                            {prodFiltered.map((p) => <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} onView={() => openProduct(p)} />)}
                          </div>
                        ) : (
                          <div className="svc-empty">No products match your filters.<button onClick={clearProd}>Clear filters</button></div>
                        )}
                      </div>
                    </div>
                  </div>
                )
                )}
                {page === "reviews" && (
                  displayReviews.length === 0 ? <EmptyState /> : (
                    <div className="svc-page">
                      <p className="svc-intro">Every review here comes from a verified order on Frontstore. The store can respond, but cannot remove genuine reviews.</p>
                    <div className="svc-body">
                      <aside className="svc-rail">
                        <div className="rev-summary">
                          <div className="rev-score">
                            <b>{(store.rating ?? 0.0).toFixed(1)}</b>
                            <div className="rev-score-stars">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={14} className={i < Math.round(store.rating ?? 0) ? "f" : ""} />
                              ))}
                            </div>
                            <span>
                              {(store.rating ?? 0) >= 4.5 ? "Excellent" : (store.rating ?? 0) >= 4.0 ? "Very Good" : (store.rating ?? 0) >= 3.0 ? "Good" : (store.rating ?? 0) > 0 ? "Average" : "New Store"}
                            </span>
                            <i>{store.review_count ?? 0} verified reviews</i>
                          </div>
                          <div className="rev-bars">
                            {REV_DIST.map(([n, w]) => (
                              <button key={n} className={`rev-bar ${revStar === n ? "on" : ""}`} onClick={() => setRevStar(revStar === n ? 0 : n)}>
                                <span>{n}</span><Star size={11} className="f" /><div className="rev-bar-track"><i style={{ width: w + "%" }} /></div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="svc-filters">
                          <div className="svc-fgroup">
                            <h4>Sort by</h4>
                            <div className="svc-radios">
                              {[["recent", "Most recent"], ["high", "Highest rated"], ["low", "Lowest rated"]].map(([v, l]) => (
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
                      </aside>

                      <div className="svc-main">
                        {revPhotoTiles.length > 0 && (
                          <div className="rev-photostrip">
                            <h4>Customer photos</h4>
                            <div className="rev-photos">{revPhotoTiles.map((k, i) => <button key={k} className={`rev-ph c${i % 3}`} onClick={() => ping("Opening photo")} aria-label="Photo" />)}</div>
                          </div>
                        )}
                        <div className="svc-results-head">
                          <b>{revFiltered.length} {revFiltered.length === 1 ? "review" : "reviews"}</b>
                          {(revStar !== 0 || revPhotos) && <button className="svc-clear" onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button>}
                        </div>
                        {revFiltered.length > 0 ? (
                          <div className="rev-list">{revFiltered.map((rv) => <ReviewCardRich key={rv.id} rv={rv} />)}</div>
                        ) : (
                          <div className="svc-empty">No reviews match your filters.<button onClick={() => { setRevStar(0); setRevPhotos(false); }}>Clear filters</button></div>
                        )}
                      </div>
                    </div>
                  </div>
                )
                )}
                {page === "blog" && (
                  displayBlog.length === 0 ? <EmptyState /> : (
                    <div className="blogp">
                      <p className="svc-intro">Tips, guides and store notes from {store.founder_name ? `${store.founder_name} and ` : ""}the team at {store.store_name}.</p>
                    <div className="blog-topics">
                      {["All", ...blogCats].map((c) => (
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
                              {(() => {
                                const heroAuthorName = blogList[0].is_pseo ? store.store_name : (store.founder_name || store.store_name);
                                const heroAuthorInitial = heroAuthorName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
                                return (
                                  <div className="blog-meta">
                                    <span className="blog-author"><span className="blog-author-av">{heroAuthorInitial}</span> {heroAuthorName}</span>
                                    <span className="ps-dot">•</span>{blogList[0].date}<span className="ps-dot">•</span>{blogList[0].read} read
                                  </div>
                                );
                              })()}
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
                      {AUTHOR.name && (
                        <aside className="blogp-rail">
                          <div className="author-card">
                            <div className="author-top">
                              <span className="author-av">{AUTHOR.initial}</span>
                              <div><b>{AUTHOR.name}</b><span>{AUTHOR.role}</span></div>
                            </div>
                            <p>{AUTHOR.bio}</p>
                            <div className="author-cred"><Award size={13} /> Over 8 years sourcing and curating preloved fashion</div>
                            <button className="author-link" onClick={() => go("about")}>More about {AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
                          </div>
                        </aside>
                      )}
                    </div>
                  </div>
                )
              )}
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "post" && articleView()}
            {page === "product" && productView()}

            {page === "portfolio" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Portfolio</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                {displayPortfolio.length === 0 ? <EmptyState /> : (<>
                  <p className="svc-intro">A look at recent finds from the store, from vintage denim to one off finds. Tap any image to see it larger.</p>
                  {portfolioChips()}
                  <div className="pf-wrap">
                    <div className="pf-main">{portfolioGrid()}</div>
                    <aside className="pf-rail">
                      <div className="blog-convert">
                        <b>Like what you see?</b>
                        <p>Tap any piece to shop it in your size and colour.</p>
                        <button className="blog-convert-cta" onClick={() => go("products")}><ShoppingBag size={15} /> Shop the rail</button>
                      </div>
                      {portfolioFollow()}
                    </aside>
                  </div>
                </>)}
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "about" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>About</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                {(!store.store_bio && ABOUT_FACTS.length === 0 && RECOGNITION.length === 0) ? <EmptyState /> : (
                  <div className="ab-wrap">
                    <div className="ab-main">
                      <span className="ab-kicker">Our story</span>
                      <h2 className="ab-headline">A Lagos store for genuinely good preloved finds.</h2>
                      {store.store_bio && <p className="ab-lede">{store.store_bio}</p>}
                      {store.founder_bio && <p className="ab-para">{store.founder_bio}</p>}

                      <div className="ab-founder">
                        <div className="ab-portrait"><span className="ab-portrait-mono">{AUTHOR.initial}</span><span className="ab-portrait-tag">Founder</span></div>
                        <div className="ab-founder-body">{aboutFounderBody()}</div>
                      </div>
                      {aboutWork()}
                      {aboutFeatured()}

                      <div className="ab-approach">
                        <h4>How we work</h4>
                        <div className="ab-approach-grid">
                          <div><span className="ab-num">01</span><b>Hand picked</b><p>Every piece is chosen by hand, not bought in blind by the bale, so the rail stays genuinely good.</p></div>
                          <div><span className="ab-num">02</span><b>Cleaned and checked</b><p>We clean and condition check each item, and photograph any notable wear before it goes up.</p></div>
                          <div><span className="ab-num">03</span><b>Priced to move</b><p>Honest condition grading and fair prices, so good pieces find a new home fast.</p></div>
                        </div>
                      </div>

                      {aboutReview()}
                      {aboutJournal()}
                      <div className="ab-section">
                        <h4 className="ab-subhead">Good to know</h4>
                        <div className="ab-facts">
                          {ABOUT_FACTS.map(([k, v]) => (
                            <div className="ab-fact" key={k}><span className="ab-fact-k">{k}</span><span className="ab-fact-v">{v}</span></div>
                          ))}
                        </div>
                      </div>

                      <div className="ps-about-grid ab-stats">
                        <div><b>{store.total_orders ?? 0}</b><span>orders delivered</span></div>
                        <div><b>{(store.rating ?? 0.0).toFixed(1)}</b><span>average rating</span></div>
                        {store.since && <div><b>{new Date().getFullYear() - parseInt(store.since)} yrs</b><span>in practice</span></div>}
                      </div>
                    </div>

                    <aside className="ab-rail">
                      <div className="pd-railcard">
                        <div className="ab-rail-h"><MapPin size={15} /> Visit the store</div>
                        <div className="pd-railmap">Map preview</div>
                        {store.address && <p className="ab-addr">{store.address}</p>}
                        <div className="ab-open"><Clock size={13} /> Today · {HOURS[todayIdx][1]}</div>
                        <div className="pd-railbtns">
                          <button onClick={() => ping("Opening directions")}><Navigation size={14} /> Directions</button>
                          <button onClick={() => handleWa(`Hi ${store.store_name}!`)}><WhatsAppIcon size={14} /> Message</button>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "faq" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>FAQ</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                {displayFaqs.length === 0 ? <EmptyState /> : (
                  <>
                    <p className="svc-intro">Answers to the questions we are asked most. If you cannot find yours, the store is a message away.</p>
                    <div className="faq-wrap">
                      <aside className="faq-rail">
                        <div className="faq-search">
                          <Search size={15} />
                          <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions" />
                        </div>
                        <nav className="faq-cats">
                          {faqFiltered.map((g) => (
                            <button key={g.cat} onClick={() => { const el = document.getElementById(faqId(g.cat)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                              <g.icon size={15} /> {g.cat}
                            </button>
                          ))}
                        </nav>
                        {faqHelp()}
                      </aside>
                      <div className="faq-main">{faqSections()}</div>
                    </div>
                  </>
                )}
                <StoreFoot onNav={go} slug={store.username} />
              </div>
            )}

            {page === "contact" && (
              <div className="pd-listing">
                <div className="pd-page-head">
                  <h1>Contact</h1>
                  <span>frontstore.ng/{username}</span>
                </div>
                {(!store.address && !store.email && !store.phone && !store.whatsapp_phone) ? <EmptyState /> : (
                  <div className="ct-wrap">
                    <div className="ct-main">
                      <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email. A real person will answer.</p>
                      {contactChannels()}
                      {contactForm()}
                    </div>
                    <aside className="ct-rail">
                      {contactVisit()}
                    </aside>
                  </div>
                )}
                <StoreFoot onNav={go} slug={store.username} />
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
                <StoreFoot onNav={go} slug={store.username} />
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
                    <p className="tm-intro">This notice explains what {store.store_name} does with your information when you book, buy or get in touch.</p>
                    {policySections(PRIVACY)}
                  </div>
                  <aside className="tm-rail">
                    <div className="tm-contents">
                      <span className="tm-contents-h">On this page</span>
                      <nav>
                        {PRIVACY.map((s) => (
                          <button key={s.t} onClick={() => { const el = document.getElementById(termId(s.t)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{s.t}</button>
                        ))}
                      </nav>
                    </div>
                    <div className="tm-meta">Last updated 1 June 2026</div>
                    {policyRelated([["Terms", "terms"], ["Refunds", "returns"]])}
                  </aside>
                </div>
                <StoreFoot onNav={go} slug={store.username} />
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
                    <p className="tm-intro">By booking or buying from {store.store_name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
                    {policySections(TERMS)}
                  </div>
                  <aside className="tm-rail">
                    <div className="tm-contents">
                      <span className="tm-contents-h">On this page</span>
                      <nav>
                        {TERMS.map((s) => (
                          <button key={s.t} onClick={() => { const el = document.getElementById(termId(s.t)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{s.t}</button>
                        ))}
                      </nav>
                    </div>
                    <div className="tm-meta">Last updated 1 June 2026</div>
                    {policyRelated([["Refunds", "returns"], ["FAQ", "faq"]])}
                  </aside>
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
          <div className="ps-drawer" onClick={(e) => e.stopPropagation()}><Panel onClose={() => setDrawer(false)} /></div>
        </div>
      )}

      {/* bottom nav (mobile only) */}
      {!isDesktop && (
        <nav className="ps-bottom">
          <button className={page === "home" ? "on" : ""} onClick={() => go("home")}><StoreIcon size={21} /><span>Home</span></button>
          <button className={page === "products" ? "on" : ""} onClick={() => go("products")}><Package size={21} /><span>Products</span></button>
          <button className="ps-fab" onClick={() => setBag(true)} aria-label="Cart"><span className="ps-fab-ring" /><ShoppingBag size={22} />{bagCount > 0 && <i className="ps-fab-badge">{bagCount}</i>}</button>
          <button className={page === "portfolio" ? "on" : ""} onClick={() => go("portfolio")}><Camera size={21} /><span>Portfolio</span></button>
          <button className={page === "reviews" ? "on" : ""} onClick={() => go("reviews")}><Star size={21} /><span>Reviews</span></button>
        </nav>
      )}

      {/* search overlay (shared) */}
      {search && (
        <div className="ps-overlay" onClick={() => setSearch(false)}>
          <div className="ps-search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ps-search-top">
              <Search size={18} />
              <input autoFocus placeholder={`Search ${store.store_name}`} value={prodQuery} onChange={e => setProdQuery(e.target.value)} />
              <button onClick={() => setSearch(false)}><X size={20} /></button>
            </div>
            <p className="ps-search-lbl">Popular Categories</p>
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
      {bag && renderBagSheet()}

      {/* size guide sheet */}
      {sizeGuideOpen && (
        <Sheet onClose={() => setSizeGuideOpen(false)} title="Size guide">
          <p className="ps-sheet-sub"><Ruler size={13} /> Measurements in centimetres. Vintage sizing varies, so check the fit note on the piece.</p>
          <table className="pv-sizetable">
            <thead>
              <tr>{SIZE_GUIDE.cols.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.rows.map((r) => <tr key={r[0]}>{r.map((cell, i) => <td key={i} className={i === 0 ? "lead" : ""}>{cell}</td>)}</tr>)}
            </tbody>
          </table>
          <p className="pv-sizehint">To measure, use a soft tape around the fullest part of your bust, your natural waist, and the widest part of your hips.</p>
        </Sheet>
      )}

      {/* share sheet (shared) */}
      {share && (
        <Sheet onClose={() => setShare(false)} title="Share this store">
          <div className="ps-share-url"><span>{systemDomain}/{username}</span><button onClick={copyUrl}><Copy size={15} /></button></div>
          <button className="ps-share-wa" onClick={() => { setShare(false); handleWa(`Check out this store: ${systemDomain}/${username}`); }}><WhatsAppIcon size={18} /> Share on WhatsApp</button>
        </Sheet>
      )}

      {/* notify opt-in (shared) */}
      {notifyOpen && (
        <Sheet onClose={() => setNotifyOpen(false)} title={`Get updates from ${store.store_name}`}>
          <p className="ps-sheet-sub"><Bell size={13} /> Be first to hear about new services, products, drops and announcements.</p>
          <p className="ps-field-lbl">Your WhatsApp number</p>
          <input className="bk-input" value={notifyPhone} onChange={(e) => setNotifyPhone(e.target.value)} placeholder="e.g. 0801 234 5678" inputMode="tel" />
          <p className="ps-field-lbl">What should we send you?</p>
          <div className="nt-topics">
            {NOTIFY_TOPICS.map(([id, label]) => {
              const on = notifyTopics.includes(id);
              return <button key={id} className={`nt-topic ${on ? "on" : ""}`} onClick={() => setNotifyTopics(on ? notifyTopics.filter((t) => t !== id) : [...notifyTopics, id])}>{on && <Check size={13} />}{label}</button>;
            })}
          </div>
          <p className="ps-deposit">Updates are sent through Frontstore. No spam, opt out any time, and your number is never shared with other stores.</p>
          <button className="ps-sheet-cta" disabled={!notifyPhone.trim() || notifyTopics.length === 0} onClick={() => { setNotifyOpen(false); ping(`You will get updates from ${store.store_name}`); }}><Bell size={16} /> Notify me</button>
        </Sheet>
      )}

      {reviewOpen && (
        <Sheet onClose={() => setReviewOpen(false)} title="Leave a review">
          <p className="rev-form-note"><ShieldCheck size={13} /> {store.reviews_intro_text || "Reviews come from verified orders. Add your order reference so we can confirm it."}</p>
          <p className="ps-field-lbl">Your rating</p>
          <div className="rev-rate">{Array.from({ length: 5 }).map((_, i) => (
            <button key={i} onClick={() => setRevRating(i + 1)} aria-label={(i + 1) + " star"} type="button"><Star size={28} className={i < revRating ? "f" : ""} /></button>
          ))}</div>
          <p className="ps-field-lbl">Order reference</p>
          <input className="rev-input" value={revRef} onChange={(e) => setRevRef(e.target.value)} placeholder="e.g. FS-7Q2K9" />
          <p className="ps-field-lbl">Your review</p>
          <textarea className="rev-textarea" value={revText} onChange={(e) => setRevText(e.target.value)} placeholder="Tell others about your experience" rows={4} />
          <button className="ps-sheet-cta" onClick={submitReview} style={{ marginTop: 14 }}>Submit review</button>
        </Sheet>
      )}

      {toast && <div className="ps-toast">{toast}</div>}
    </div>
  );
}

/* ---- shared pure components ---- */
function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (<div className="ps-sec-head"><h2>{title}</h2>{action && <button onClick={onAction}>{action}</button>}</div>);
}

function ServiceCard({ s, onBook }: { s: any; onBook: () => void }) {
  return (
    <div className="ps-card" onClick={onBook}>
      <div className="ps-card-thumb svc"><Calendar size={22} /></div>
      <div className="ps-card-body">
        <b>{s.name}</b>
        <span className="ps-card-sub"><Clock size={12} /> {s.dur}</span>
        <div className="ps-card-foot">
          <em>₦{s.price.toLocaleString()}</em>
          <span className="ps-mini book">Book</span>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, onOpen }: { p: any; onOpen: () => void }) {
  return (
    <div className="ps-card prod-card" onClick={onOpen}>
      <div className="ps-card-thumb prod">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ShoppingBag size={22} />
        )}
      </div>
      <div className="ps-card-body">
        <b>{p.name}</b>
        <div className="ps-card-foot">
          <em>₦{p.price.toLocaleString()}</em>
          <span className="ps-mini buy">View</span>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ b, colour, onOpen }: { b: any; colour: string; onOpen: () => void }) {
  return (
    <div className="blog-card" onClick={onOpen}>
      <div className={`blog-img ${colour}`}><span className="blog-cat">{b.cat}</span></div>
      <div className="blog-body">
        <span className="blog-date">{b.read} · {b.date}</span>
        <b>{b.title}</b>
        <p>{b.excerpt}</p>
        <span className="blog-read">Read article <ChevronRight size={14} /></span>
      </div>
    </div>
  );
}

function ServiceCardRich({ s, onBook, colour, badge }: { s: any; onBook: () => void; colour: string; badge?: string }) {
  return (
    <div className="svc-card" onClick={onBook}>
      <div className={`svc-card-thumb ${colour || "c0"}`}>
        <Calendar size={24} />
        {badge && <span className="svc-badge"><Star size={11} /> {badge}</span>}
        <span className="svc-card-cat">{s.cat}</span>
      </div>
      <div className="svc-card-body">
        <b>{s.name}</b>
        <span className="svc-card-dur"><Clock size={12} /> {s.dur}</span>
        <p className="svc-card-desc">{s.desc}</p>
        <div className="svc-card-foot">
          <em>₦{s.price.toLocaleString()}</em>
          <span className="svc-card-book">Book <ChevronRight size={14} /></span>
        </div>
      </div>
    </div>
  );
}

function ProductCardRich({ p, onView, colour, badge }: { p: any; onView: () => void; colour: string; badge?: string }) {
  return (
    <div className="svc-card" onClick={onView}>
      <div className={`svc-card-thumb ${colour || "c0"}`}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ShoppingBag size={24} />
        )}
        {badge && <span className="svc-badge"><Star size={11} /> {badge}</span>}
        <span className="svc-card-cat">{p.cat}</span>
      </div>
      <div className="svc-card-body">
        <b>{p.name}</b>
        <p className="svc-card-desc">{p.desc}</p>
        <div className="svc-card-foot">
          <em>₦{p.price.toLocaleString()}</em>
          <span className="svc-card-book">View <ChevronRight size={14} /></span>
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ f, onAction }: { f: any; onAction: () => void }) {
  return (
    <div className="feat-card" onClick={onAction}>
      <div className={`feat-thumb ${f.type}`}>
        {f.type === "service" ? <Calendar size={26} /> : <ShoppingBag size={26} />}
        <span className="feat-rib"><Star size={11} /> Featured</span>
      </div>
      <div className="feat-body">
        <b>{f.name}</b>
        <span className="feat-sub">{f.type === "service" ? <><Clock size={12} /> {f.dur}</> : "Product"}</span>
        <div className="feat-foot">
          <em>₦{f.price.toLocaleString()}</em>
          <span className="feat-cta">View</span>
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
          <div className="rev-response-head"><span className="rev-resp-av">{rv.response.initial || "R"}</span><b>Response from the store</b><span>{rv.response.when}</span></div>
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

function RatingSummary({ rating, reviewCount, reviews = [] }: { rating: number; reviewCount: number; reviews?: any[] }) {
  const bars = useMemo(() => {
    const b: [string, number][] = [["5", 0], ["4", 0], ["3", 0], ["2", 0], ["1", 0]];
    if (reviews && reviews.length > 0) {
      const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(rv => {
        const rounded = Math.min(5, Math.max(1, Math.round(rv.rating ?? rv.r ?? 0)));
        counts[rounded] = (counts[rounded] || 0) + 1;
      });
      b[0][1] = Math.round((counts[5] / reviews.length) * 100);
      b[1][1] = Math.round((counts[4] / reviews.length) * 100);
      b[2][1] = Math.round((counts[3] / reviews.length) * 100);
      b[3][1] = Math.round((counts[2] / reviews.length) * 100);
      b[4][1] = Math.round((counts[1] / reviews.length) * 100);
    }
    return b;
  }, [reviews]);

  const ratingVal = rating ?? 0.0;
  const ratingText = ratingVal >= 4.5 ? "Excellent" : ratingVal >= 4.0 ? "Very Good" : ratingVal >= 3.0 ? "Good" : ratingVal > 0 ? "Average" : "New Store";

  return (
    <div className="ps-rating">
      <div className="ps-rating-score">
        <b>{ratingVal.toFixed(1)}</b>
        <div className="ps-rating-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} className={i < Math.round(ratingVal) ? "f" : ""} />
          ))}
        </div>
        <span>{ratingText}</span>
        <i>{reviewCount} reviews</i>
      </div>
      <div className="ps-rating-bars">
        {bars.map(([n, w]) => (
          <div key={n} className="ps-bar">
            <span>{n}</span>
            <div>
              <i style={{ width: w + "%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Accordion({ items, open, setOpen }: { items: any[]; open: number | null; setOpen: (idx: number | null) => void }) {
  return (
    <div className="ps-acc">
      {items.map(([q, a], i) => (
        <div key={i} className={`ps-acc-item ${open === i ? "open" : ""}`}>
          <button onClick={() => setOpen(open === i ? null : i)}>{q}<ChevronDown size={17} /></button>
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
      <p>{body}</p>
      {link && <button className="ps-locked-link" type="button">{link} <ChevronRight size={14} /></button>}
    </div>
  );
}

function StoreFoot({ onNav, slug }: { onNav: (p: string) => void, slug?: string }) {
  const LEGAL = [["returns", "Refunds"], ["terms", "Terms"], ["privacy", "Privacy"]];
  return (
    <footer className="ps-foot">
      <span className="ps-foot-secure"><Lock size={13} /> Secured by Frontstore</span>
      <p>Buyer protection and platform terms apply to every order on this store.</p>
      <div className="ps-foot-links">
        {LEGAL.map(([id, label]) => <button key={id} onClick={() => onNav(id)}>{label}</button>)}
        <button type="button" onClick={() => window.open('/terms', '_self')}>Platform terms</button>
        <button type="button" onClick={() => window.open(`mailto:hello@frontstore.ng?subject=Reporting Store: ${slug || 'store'}`, '_self')}>Report this store</button>
      </div>
    </footer>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ps-sub">
      <div className="ps-sub-head"><h1>{title}</h1></div>
      {children}
    </div>
  );
}
