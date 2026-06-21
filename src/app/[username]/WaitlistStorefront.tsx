'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import SearchableSelect from "../../components/SearchableSelect";

interface WaitlistStorefrontProps {
  systemDomain: string;
  appName: string;
}

const WA = ({ s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);
const Check = ({ s = 16, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
const Lock = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
);
const Arrow = ({ s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const BackIc = ({ s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
);
const StoreIcon = ({ s = 22, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9.5 4.5 4h15L21 9.5M3 9.5h18M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 11v9h14v-9" /></svg>
);
const Bag = ({ s = 22, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
);
const LinkIc = ({ s = 13, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></svg>
);
const SearchIc = ({ s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);

const CATEGORIES = [
  "Food and drinks", "Restaurants and bars", "Fashion and clothing", "Beauty and hair",
  "Thrift and preloved", "Gadgets and repairs", "Health and wellness", "Digital and creative",
  "Home and living", "Other",
];
const CODES = [["NG", "+234"], ["GH", "+233"], ["KE", "+254"], ["ZA", "+27"], ["UK", "+44"], ["US", "+1"]];

/* names already claimed in the demo (scarcity). In prod this is the database. */
const TAKEN = ["bisi", "eko", "terra", "revival", "moremi", "gadgethub", "bella", "funke"];

/* scrolling ticker of recently claimed handles (demo). Prod feeds real claims. */
const CLAIMED = ["bisi", "ekoeats", "terra", "gen6ixx", "funkebakes", "lekkigadgets", "adastitches", "vibeautybar", "naijathrift", "mamaput", "asoebihouse", "zariascents"];

/* floating herd alert pool (demo). Prod streams real recent sign ups. */
const STORES = ["Gen6ixx Ltd", "Bella Hair Lagos", "Eko Eats", "Naija Thrift", "Terra Kitchen", "Lekki Gadgets", "Funke Bakes", "Aso Ebi House", "Surulere Sneakers", "VI Beauty Bar", "Ada Stitches", "Chop Life Foods", "Zaria Scents", "Ikeja Tech Hub", "Mama Put Express"];
const ACTIONS = ["just claimed their store", "just reserved their link", "just joined the early list"];
const TIMES = ["just now", "2 mins ago", "4 mins ago", "6 mins ago", "9 mins ago", "12 mins ago"];

/* reserved namespace. */
const BRAND = ["frontstore", "frontstores", "frontstoreapp", "frontstoreofficial", "front-store", "front"];
const GENERIC = ["shop", "shops", "store", "stores", "market", "markets", "fashion", "food", "foods", "drink", "drinks", "restaurant", "restaurants", "bar", "bars", "beauty", "hair", "salon", "gadget", "gadgets", "phone", "phones", "phonestore", "phone-store", "electronics", "clothing", "clothes", "thrift", "kitchen", "health", "wellness", "digital", "shoes", "makeup", "skincare", "jewelry", "jewellery", "bag", "bags"];
const SYSTEM = ["admin", "api", "app", "www", "help", "support", "about", "login", "signup", "signin", "register", "dashboard", "settings", "terms", "privacy", "policy", "checkout", "cart", "pay", "payment", "payments", "account", "accounts", "contact", "blog", "secure", "security", "official", "verified", "verify", "team", "staff", "mod", "moderator", "root", "system", "info", "mail", "order", "orders", "faq", "legal", "home"];
const PROFANITY = ["sex", "porn", "xxx", "nude", "nudes", "scam", "fraud"];
const RESERVED = new Set([...BRAND, ...GENERIC, ...SYSTEM, ...PROFANITY]);

const STEPS = { sell: ["bizname", "link", "category", "name", "phone", "city"], buy: ["category", "name", "phone", "city"] };

const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

function classifySync(slug: string) {
  if (!slug) return { state: "empty" as const };
  if (RESERVED.has(slug)) {
    const kind = BRAND.includes(slug) ? "brand" : GENERIC.includes(slug) ? "generic" : PROFANITY.includes(slug) ? "profanity" : "system";
    return { state: "reserved" as const, kind };
  }
  return null;
}

function suggest(base: string, city: string) {
  base = slugify(base || "");
  if (!base) return [];
  const c = slugify(city || "").split("-")[0];
  const cands = [c ? `${base}-${c}` : null, `${base}store`, `shop${base}`, `${base}hq`, `${base}ng`].filter(Boolean) as string[];
  const out: string[] = [];
  for (const x of cands) {
    const syncRes = classifySync(x);
    if (!syncRes && !out.includes(x)) out.push(x);
    if (out.length >= 3) break;
  }
  return out;
}

function geo() {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toString();
    const byTz: Record<string, { dial: string; city: string }> = {
      "Africa/Lagos": { dial: "+234", city: "Lagos" },
      "Africa/Accra": { dial: "+233", city: "Accra" },
      "Africa/Nairobi": { dial: "+254", city: "Nairobi" },
      "Africa/Johannesburg": { dial: "+27", city: "Johannesburg" },
      "Europe/London": { dial: "+44", city: "London" },
      "America/New_York": { dial: "+1", city: "New York" },
      "America/Los_Angeles": { dial: "+1", city: "Los Angeles" },
      "America/Chicago": { dial: "+1", city: "Chicago" },
    };
    if (byTz[tz]) return byTz[tz];
    const loc = (typeof navigator !== "undefined" ? navigator.language || "" : "").toUpperCase();
    const byRegion: Record<string, { dial: string; city: string }> = { NG: { dial: "+234", city: "Lagos" }, GH: { dial: "+233", city: "Accra" }, KE: { dial: "+254", city: "Nairobi" }, ZA: { dial: "+27", city: "Johannesburg" }, GB: { dial: "+44", city: "London" }, US: { dial: "+1", city: "" } };
    for (const r in byRegion) { if (loc.endsWith("-" + r) || loc === r) return byRegion[r]; }
  } catch (e) { /* fall through */ }
  return { dial: "+234", city: "" };
}

export default function WaitlistStorefront({
  systemDomain,
  appName,
}: WaitlistStorefrontProps) {
  const G = useMemo(() => geo(), []);
  const codeOptions = useMemo(() => CODES.map(([k, v]) => ({
    value: v,
    label: `${k} (${v})`,
  })), []);

  const [intent, setIntent] = useState<"sell" | "buy" | null>(null);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [herd, setHerd] = useState<{ name: string; a: string; tm: string; id: number } | null>(null);
  const [peeked, setPeeked] = useState(false);

  const [bizName, setBizName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const [otherCat, setOtherCat] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(G.dial);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(G.city);

  const steps = intent ? STEPS[intent] : [];
  const key = idx === 0 ? "intent" : steps[idx - 1];
  const isLast = idx > 0 && idx === steps.length;

  const effectiveSlug = useMemo(() => slugify(slugTouched || !bizName ? slug : slugify(bizName)), [slug, slugTouched, bizName]);
  const [slugStatus, setSlugStatus] = useState<"empty" | "reserved" | "taken" | "free">("empty");
  const [slugKind, setSlugKind] = useState<string | undefined>(undefined);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const syncRes = classifySync(effectiveSlug);
    if (syncRes) {
      setSlugStatus(syncRes.state);
      setSlugKind(syncRes.kind);
      return;
    }

    setChecking(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/v1/public/store/${effectiveSlug}`);
        if (res.ok) {
          setSlugStatus("taken");
        } else if (res.status === 404) {
          setSlugStatus("free");
        } else {
          setSlugStatus("free");
        }
      } catch (err) {
        setSlugStatus("free");
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [effectiveSlug]);

  const sugs = useMemo(() => (slugStatus === "taken" || slugStatus === "reserved") ? suggest(effectiveSlug || bizName, city) : [], [slugStatus, effectiveSlug, bizName, city]);

  const chosenCat = cat === "Other" ? otherCat.trim() : cat;
  const catForCopy = (chosenCat || "your").toLowerCase();

  const valid: Record<string, boolean> = {
    bizname: !!bizName.trim(),
    link: slugStatus === "free",
    category: !!cat && (cat !== "Other" || !!otherCat.trim()),
    name: !!name.trim(),
    phone: phone.trim().length >= 6,
    city: true,
  };
  const canNext = idx === 0 ? true : (valid[key] && !checking);
  const position = useMemo(() => 1100 + Math.floor(Math.random() * 800), []);

  function choose(i: "sell" | "buy") { setIntent(i); setIdx(1); }
  function next() {
    if (idx === 0 || !canNext) return;
    if (isLast) {
      if (intent === "sell" && typeof window !== "undefined") {
        const storeData = {
          store_name: bizName,
          business_persona: cat === "Other" ? otherCat : cat,
          location: city || "Lagos, Nigeria",
          whatsapp_phone: `${code}${phone}`.replace(/\D/g, ""),
          store_template: "waitlist",
        };
        localStorage.setItem(`waitlist_store:${effectiveSlug}`, JSON.stringify(storeData));
      }

      // Persist to database (fire-and-forget — don't block the UX)
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api').replace(/\/+$/, '');
      fetch(`${API_URL}/v1/public/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          store_name: bizName || undefined,
          username: effectiveSlug || undefined,
          business_category: cat === "Other" ? otherCat : (cat || undefined),
          name,
          dial_code: code,
          phone,
          city: city || undefined,
        }),
      }).catch(() => { /* silently ignore — localStorage is the local fallback */ });

      setDone(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } else setIdx(idx + 1);
  }
  function back() { if (idx > 1) setIdx(idx - 1); else { setIdx(0); setIntent(null); } }
  function reset() {
    setDone(false); setIntent(null); setIdx(0); setPeeked(false);
    setBizName(""); setSlug(""); setSlugTouched(false); setCat(null); setOtherCat(""); setName(""); setPhone("");
    setCode(G.dial); setCity(G.city);
  }
  function openPreview() {
    if (typeof window !== "undefined") {
      window.location.href = `/${effectiveSlug}`;
    }
  }
  function shareWhatsApp() {
    const site = `https://${systemDomain}`;
    const msg = intent === "sell"
      ? `I just reserved my shop link on ${appName}, ${systemDomain}/${effectiveSlug || "yourname"}. You sell straight from WhatsApp and your link is locked to you before launch. Claim yours here: ${site}`
      : `I just joined the early list for ${appName}, new shops you can browse and buy from right inside WhatsApp. Join me here: ${site}`;
    const wa = "https://wa.me/?text=" + encodeURIComponent(msg);
    if (typeof window !== "undefined") window.open(wa, "_blank", "noopener,noreferrer");
  }
  function takeSug(s: string) { setSlugTouched(true); setSlug(s); }
  const onEnter = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); next(); } };

  // confetti reward on the success screen
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!done || typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = confettiRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0;
    const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const colors = ["#25d366", "#ffffff", "#c79a4b", "#34d77a", "#1da851"];
    const parts = Array.from({ length: 150 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.35,
      y: H * 0.30 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -9 - 3,
      g: 0.22 + Math.random() * 0.1,
      s: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const start = performance.now();
    const frame = (t: number) => {
      const e = t - start;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99;
        const a = e > 1200 ? Math.max(0, 1 - (e - 1200) / 750) : 1;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62); ctx.restore();
      });
      if (e < 1980) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => size();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [done]);

  // herd alert: a live drip of other people claiming
  useEffect(() => {
    if (done) { setHerd(null); return; }
    let cancelled = false;
    let timer: NodeJS.Timeout;
    let i = Math.floor(Math.random() * STORES.length);
    const tick = () => {
      if (cancelled) return;
      const name = STORES[i % STORES.length];
      i += 1 + Math.floor(Math.random() * 3);
      setHerd({ name, a: ACTIONS[Math.floor(Math.random() * ACTIONS.length)], tm: TIMES[Math.floor(Math.random() * TIMES.length)], id: Date.now() });
      timer = setTimeout(() => {
        if (cancelled) return;
        setHerd(null);
        timer = setTimeout(tick, 2600 + Math.random() * 2200);
      }, 4600);
    };
    timer = setTimeout(tick, 2200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [done]);

  const sellerMsg = `Hi ${name.trim() || "there"}, you are on the ${appName} early access list. We have reserved ${systemDomain}/${effectiveSlug || "yourname"} for your ${catForCopy} shop, so the link is locked to you for launch. We will message you right here the moment your storefront is ready to set up. Welcome in, the ${appName} team.`;
  const buyerMsg = `Hi ${name.trim() || "there"}, you are on the ${appName} early access list. We are lining up ${catForCopy} shops you can browse and buy from, all inside WhatsApp. We will message you here as soon as there is something good to show you. Thanks for joining early, the ${appName} team.`;
  const waMsg = intent === "sell" ? sellerMsg : buyerMsg;

  const previewSlug = effectiveSlug || "yourname";
  const bizDisplay = bizName.trim() || "Your business";
  const initial = (bizName.trim() || "F").charAt(0).toUpperCase();

  const Mark = () => (
    <span className="fw-mark"><span className="fw-mark-dot"><WA s={13} c="#0b141a" /></span> {appName}</span>
  );

  return (
    <div className={"fw" + (done ? " fw-is-done" : "")}>
      <style>{css}</style>
      <div className="fw-glow" />

      {!done && (
        <aside className="fw-aside">
          <Mark />
          <div className="fw-aside-mid">
            <p className="fw-kicker">Building now, opening soon</p>
            <h1 className="fw-h1">Sell on WhatsApp, from a shop that is yours.</h1>
            <p className="fw-lede">Your own link at <b>{systemDomain}/yourname</b>, where people browse, buy and book. Every order lands straight in your WhatsApp.</p>
            <div className="fw-sig">
              <div className="fw-sig-pill">
                <span className="fw-sig-link">
                  <span className="fw-sig-pre">{systemDomain}/</span>
                  <span className="fw-sig-nm">yourname</span>
                </span>
                <span className="fw-sig-tag"><Check s={11} /> yours</span>
              </div>
              <ul className="fw-sig-list">
                <li><span className="fw-sig-ic"><StoreIcon s={16} c="#25d366" /></span> Your own storefront link</li>
                <li><span className="fw-sig-ic"><WA s={15} c="#25d366" /></span> Every order in your WhatsApp</li>
                <li><span className="fw-sig-ic"><Lock s={14} c="#25d366" /></span> Secured checkout, built in</li>
              </ul>
            </div>
          </div>
          <div className="fw-trust"><Lock s={12} /> Secured commerce, WhatsApp native</div>
        </aside>
      )}

      {!done && (
        <section className="fw-flow">
          <header className="fw-mtop">
            <Mark />
            {idx === 0 && <span className="fw-pill"><span className="fw-livedot" /> Early access</span>}
          </header>

          <div className="fw-flow-inner">
            {idx > 0 && (
              <div className="fw-prog-wrap">
                <button className="fw-back" onClick={back} aria-label="Go back"><BackIc s={16} /></button>
                <div className="fw-prog"><div className="fw-prog-fill" style={{ width: `${(idx / steps.length) * 100}%` }} /></div>
                <span className="fw-prog-num">{idx} / {steps.length}</span>
              </div>
            )}

            <div className="fw-step" key={key}>
              {key === "intent" && (
                <>
                  <div className="fw-hero-m">
                    <p className="fw-kicker">Building now, opening soon</p>
                    <h1 className="fw-h1">Sell on WhatsApp, from a shop that is yours.</h1>
                    <p className="fw-lede">Your own link, every order in your WhatsApp. Reserve your spot before launch.</p>
                  </div>
                  <p className="fw-eyebrow">What brings you here</p>
                  <div className="fw-choices">
                    <button className="fw-choice" onClick={() => choose("sell")}>
                      <span className="fw-choice-ic"><StoreIcon s={22} c="#25d366" /></span>
                      <span className="fw-choice-tx"><b>I want to sell</b><i>Claim my shop link and get in first</i></span>
                      <Arrow s={18} c="#8696a0" />
                    </button>
                    <button className="fw-choice" onClick={() => choose("buy")}>
                      <span className="fw-choice-ic"><Bag s={22} c="#25d366" /></span>
                      <span className="fw-choice-tx"><b>I want to shop</b><i>Be first to discover new shops</i></span>
                      <Arrow s={18} c="#8696a0" />
                    </button>
                  </div>
                </>
              )}

              {key === "bizname" && (
                <>
                  <h2 className="fw-q">What is your business called?</h2>
                  <p className="fw-help">This is the name your customers will see.</p>
                  <input autoFocus className="fw-input fw-big" value={bizName} onChange={(e) => setBizName(e.target.value)} onKeyDown={onEnter} placeholder="e.g. Bisi Glow Studio" />
                </>
              )}

              {key === "link" && (
                <>
                  <h2 className="fw-q">Claim your shop link.</h2>
                  <p className="fw-help">Names are first come, first served. Only one person can own it.</p>

                  <div className={"fw-claim " + slugStatus}>
                    <span className="fw-claim-pre">{systemDomain}/</span>
                    <input autoFocus className="fw-claim-in" value={effectiveSlug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} onKeyDown={onEnter} placeholder="yourname" spellCheck="false" autoCapitalize="none" />
                  </div>

                  <div className="fw-claim-status">
                    {slugStatus === "free" && <span className="ok"><Check s={14} /> Available. Lock it in before someone takes it.</span>}
                    {slugStatus === "taken" && <span className="bad">Taken. The good names are going fast.</span>}
                    {slugStatus === "reserved" && slugKind === "generic" && <span className="res">Reserved name. Make it your own with one of these.</span>}
                    {slugStatus === "reserved" && slugKind !== "generic" && <span className="res">This name is not available.</span>}
                    {slugStatus === "empty" && <span className="dim">Type the name you want to own.</span>}
                  </div>

                  {sugs.length > 0 && (
                    <div className="fw-sugs">
                      <span className="fw-sugs-l">Still free:</span>
                      {sugs.map((s) => <button key={s} className="fw-sug" onClick={() => takeSug(s)}>{s}</button>)}
                    </div>
                  )}

                  <div className="fw-ticker">
                    <span className="fw-ticker-l">Just claimed:</span>
                    <div className="fw-ticker-mask">
                      <div className="fw-ticker-row" aria-hidden="true">
                        {[...CLAIMED, ...CLAIMED].map((n, i) => <span key={i} className="fw-ticker-item"><span className="fw-ticker-dot" />{n}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="fw-prev">
                    <span className="fw-prev-label">Your link, everywhere you already share</span>
                    <div className="fw-prev-grid">
                      <div className="fw-bio">
                        <div className="fw-bio-top">
                          <span className="fw-bio-av">{initial}</span>
                          <div><div className="fw-bio-name">{bizDisplay}</div><div className="fw-bio-handle">Instagram bio</div></div>
                        </div>
                        <div className="fw-bio-line">Order anytime, delivered to you</div>
                        <div className="fw-bio-link"><LinkIc s={12} /><span className="fw-bio-url">{systemDomain}/<b>{previewSlug}</b></span></div>
                      </div>
                      <div className="fw-status">
                        <div className="fw-status-label"><WA s={12} c="#8696a0" /> WhatsApp status</div>
                        <div className="fw-status-card">
                          <div className="fw-status-text">New drop. Shop now.</div>
                          <div className="fw-status-link">{systemDomain}/{previewSlug}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {key === "category" && (
                <>
                  <h2 className="fw-q">{intent === "sell" ? "What do you sell?" : "What do you want to shop for?"}</h2>
                  <p className="fw-help">{intent === "sell" ? "Pick the closest fit. It helps us build for you first." : "Pick what you are into. We will match you to shops."}</p>
                  <div className="fw-chips">
                    {CATEGORIES.map((c) => <button key={c} className={"fw-chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
                  </div>
                  {cat === "Other" && <input autoFocus className="fw-input fw-other" value={otherCat} onChange={(e) => setOtherCat(e.target.value)} onKeyDown={onEnter} placeholder={intent === "sell" ? "Tell us what you sell" : "Tell us what you are after"} />}
                </>
              )}

              {key === "name" && (
                <>
                  <h2 className="fw-q">{intent === "sell" ? "And your name?" : "What is your name?"}</h2>
                  <p className="fw-help">So we know who we are talking to.</p>
                  <input autoFocus className="fw-input fw-big" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onEnter} placeholder="Full name" />
                </>
              )}

              {key === "phone" && (
                <>
                  <h2 className="fw-q">Your WhatsApp number.</h2>
                  <p className="fw-help">{intent === "sell" ? "Your confirmation comes here, and so will your orders." : "We will only message you about shops worth your time."}</p>
                  <div className="fw-phone" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <SearchableSelect
                      options={codeOptions}
                      value={code}
                      onChange={setCode}
                      placeholder=""
                      searchPlaceholder="Search code..."
                      style={{ width: '120px', flexShrink: 0 }}
                    />
                    <input autoFocus className="fw-input" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} onKeyDown={onEnter} placeholder="801 234 5678" inputMode="numeric" />
                  </div>
                </>
              )}

              {key === "city" && (
                <>
                  <h2 className="fw-q">Where are you based?</h2>
                  <p className="fw-help">Optional. It tells us where to switch on first.</p>
                  <input autoFocus className="fw-input fw-big" value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={onEnter} placeholder="e.g. Lagos" />
                </>
              )}

              {idx > 0 && (
                <div className="fw-actions">
                  <button className="fw-next" disabled={!canNext} onClick={next}>
                    {isLast ? (intent === "sell" ? <><Lock s={15} c="#0b141a" /> Reserve my link</> : "Join the waitlist") : <>Continue <Arrow s={17} c="#0b141a" /></>}
                  </button>
                  {key === "city" && <button className="fw-skip" onClick={next}>Skip for now</button>}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {done && (
        <main className="fw-done">
          <canvas className="fw-confetti" ref={confettiRef} />
          <div className="fw-step">
            <div className="fw-tick"><Check s={26} c="#0b141a" /></div>
            <h2 className="fw-doneh">You are in{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}.</h2>

            {intent === "sell" ? (
              <>
                <p className="fw-donelede">Your link is held. No one else can take it.</p>
                <div className="fw-live">
                  <span className="fw-live-label"><Lock s={11} /> Reserved for you</span>
                  <button className="fw-search" onClick={openPreview} aria-label={`Preview ${systemDomain}/${effectiveSlug}`}>
                    <span className="fw-search-ic"><SearchIc s={18} c="#5f6368" /></span>
                    <span className="fw-search-q">{systemDomain}/<b>{effectiveSlug}</b></span>
                    <span className="fw-search-go"><Arrow s={16} c="#0b141a" /></span>
                  </button>
                  <span className="fw-live-hint">{peeked ? "Your brand page is coming next. It will open right here the day you launch." : "Tap your link to see your page"}</span>
                </div>
              </>
            ) : (
              <p className="fw-donelede">You are on the early list for {catForCopy} shops. You will be first through the door.</p>
            )}

            <p className="fw-sent">Confirmation sent to your WhatsApp on {code} {phone}.</p>

            <p className="fw-pos">Number <b>{position.toLocaleString("en-GB")}</b> on the list.</p>
            <button className="fw-share" onClick={shareWhatsApp}><WA s={16} c="#25d366" /> {intent === "sell" ? "Know another seller? Send them the word" : "Tell a friend who loves a good find"}</button>
            <button className="fw-reset" onClick={reset}>Start again</button>
          </div>
        </main>
      )}

      {!done && herd && (idx === 0 || key === "link") && (
        <div className="fw-herd" key={herd.id}>
          <span className="fw-herd-av">{herd.name.charAt(0)}</span>
          <span className="fw-herd-tx"><b>{herd.name}</b> {herd.a}<i>{herd.tm}</i></span>
        </div>
      )}
    </div>
  );
}

const css = `
.fw *{box-sizing:border-box;margin:0;padding:0}
.fw{
  --bg:#0b141a; --panel:#111b21; --raise:#1d2a33; --field:#1a242c;
  --line:rgba(255,255,255,.08); --line2:rgba(255,255,255,.14);
  --text:#e9edef; --muted:#8696a0; --green:#25d366; --bad:#f0726a; --amber:#d8b25a;
  --surface:var(--field);
  --border:var(--line2);
  --primary:var(--green);
  --r-md:13px;
  --r-lg:16px;
  --bg-2:var(--raise);
  --text-muted:var(--muted);
  --text-faint:rgba(255,255,255,.3);
  --primary-light:rgba(37,211,102,.12);
  --primary-glow:rgba(37,211,102,.2);
  --t-fast:0.15s;
  --ease:ease;
  --shadow-lg:0 16px 40px -16px rgba(0,0,0,.6);
  color:var(--text);
  background:var(--bg); min-height:100vh; width:100%; position:relative; overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
.fw-glow{position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:620px; height:440px; max-width:100%; background:radial-gradient(closest-side, rgba(37,211,102,.16), transparent 70%); pointer-events:none; z-index:0}

.fw-mark{display:inline-flex; align-items:center; gap:9px; font-weight:700; font-size:19px; letter-spacing:-.01em; color:var(--text)}
.fw-mark-dot{width:24px; height:24px; border-radius:7px; background:var(--green); display:flex; align-items:center; justify-content:center; flex:none}
.fw-pill{display:inline-flex; align-items:center; gap:7px; font-size:12px; font-weight:600; color:var(--green); background:rgba(37,211,102,.1); border:1px solid rgba(37,211,102,.24); padding:6px 11px; border-radius:999px}
.fw-livedot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 3px rgba(37,211,102,.2)}

.fw-kicker{font-size:12.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--green); margin-bottom:16px}
.fw-h1{font-weight:700; font-size:clamp(29px,3.2vw,42px); line-height:1.06; letter-spacing:-.02em}
.fw-lede{margin-top:16px; font-size:16px; line-height:1.6; color:var(--muted)}
.fw-lede b{color:var(--text); font-weight:600}

.fw-aside{display:none; position:relative; z-index:1}
.fw-sig{margin-top:32px}
.fw-sig-pill{display:inline-flex; align-items:center; gap:7px; background:var(--field); border:1px solid var(--line2); border-radius:12px; padding:11px 13px}
.fw-sig-link{display:inline-flex; align-items:center}
.fw-sig-pre{color:var(--muted); font-size:14.5px}
.fw-sig-nm{font-weight:600; color:var(--green); font-size:15px}
.fw-sig-tag{display:inline-flex; align-items:center; gap:4px; margin-left:5px; font-size:11px; font-weight:700; color:var(--green); background:rgba(37,211,102,.12); padding:4px 8px; border-radius:7px}
.fw-sig-list{list-style:none; margin-top:22px; display:flex; flex-direction:column; gap:13px}
.fw-sig-list li{display:flex; align-items:center; gap:11px; font-size:14.5px; color:#c2ccd2}
.fw-sig-ic{width:30px; height:30px; border-radius:9px; background:rgba(37,211,102,.1); display:flex; align-items:center; justify-content:center; flex:none}
.fw-trust{display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--muted)}

.fw-flow{position:relative; z-index:1; display:flex; flex-direction:column; min-height:100vh}
.fw-mtop{display:flex; align-items:center; justify-content:space-between; padding:22px 22px 0}
.fw-flow-inner{flex:1; width:100%; max-width:560px; margin:0 auto; padding:26px 22px 42px}

.fw-prog-wrap{display:flex; align-items:center; gap:12px; margin-bottom:28px}
.fw-back{flex:none; width:38px; height:38px; border-radius:11px; border:1px solid var(--line2); background:var(--panel); color:var(--text); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.15s}
.fw-back:hover{background:var(--raise)}
.fw-prog{flex:1; height:5px; border-radius:999px; background:rgba(255,255,255,.08); overflow:hidden}
.fw-prog-fill{height:100%; border-radius:999px; background:var(--green); transition:width .35s cubic-bezier(.4,0,.2,1)}
.fw-prog-num{flex:none; font-size:12.5px; font-weight:600; color:var(--muted); font-variant-numeric:tabular-nums}

.fw-step{animation:rise .4s cubic-bezier(.2,.6,.2,1)}
@keyframes rise{from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none}}

.fw-hero-m{margin-bottom:28px}
.fw-eyebrow{font-size:12px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); margin-bottom:15px}

.fw-choices{display:flex; flex-direction:column; gap:12px}
.fw-choice{display:flex; align-items:center; gap:15px; text-align:left; cursor:pointer; background:var(--panel); border:1px solid var(--line2); border-radius:16px; padding:18px; transition:.16s}
.fw-choice:hover{border-color:var(--green); background:var(--raise); transform:translateY(-1px)}
.fw-choice-ic{flex:none; width:46px; height:46px; border-radius:12px; background:rgba(37,211,102,.12); display:flex; align-items:center; justify-content:center}
.fw-choice-tx{flex:1; display:flex; flex-direction:column; gap:3px}
.fw-choice-tx b{font-size:17px; font-weight:600}
.fw-choice-tx i{font-style:normal; font-size:13.5px; color:var(--muted)}

.fw-q{font-weight:600; font-size:clamp(24px,4.6vw,32px); line-height:1.12; letter-spacing:-.015em}
.fw-help{margin-top:11px; font-size:15px; line-height:1.55; color:var(--muted)}

.fw-input{width:100%; font-family:inherit; font-size:16px; color:var(--text); background:var(--field); border:1.5px solid var(--line2); border-radius:13px; padding:15px; outline:none; transition:.16s}
.fw-input::placeholder{color:#5c6b75}
.fw-input:focus{border-color:var(--green); box-shadow:0 0 0 4px rgba(37,211,102,.14)}
.fw-big{margin-top:24px; font-size:18px; padding:17px 16px}
.fw-other{margin-top:14px}

.fw-claim{margin-top:24px; display:flex; align-items:center; background:var(--field); border:1.5px solid var(--line2); border-radius:13px; padding:6px 8px 6px 15px; transition:.16s}
.fw-claim.free{border-color:var(--green); box-shadow:0 0 0 4px rgba(37,211,102,.12); animation:glow 2.2s ease-in-out infinite}
.fw-claim.taken{border-color:var(--bad)}
.fw-claim.reserved{border-color:var(--amber)}
@keyframes glow{0%,100%{box-shadow:0 0 0 4px rgba(37,211,102,.10)}50%{box-shadow:0 0 0 6px rgba(37,211,102,.20)}}
.fw-claim-pre{font-size:16px; color:var(--muted); white-space:nowrap}
.fw-claim-in{flex:1; min-width:0; border:0; outline:none; background:transparent; font-size:17px; font-weight:600; color:var(--green); padding:11px 2px}
.fw-claim-in::placeholder{color:#5c6b75; font-weight:500}
.fw-claim-status{margin-top:12px; font-size:13.5px; font-weight:600; min-height:20px}
.fw-claim-status .ok{display:inline-flex; align-items:center; gap:6px; color:var(--green)}
.fw-claim-status .bad{color:var(--bad)}
.fw-claim-status .res{color:var(--amber)}
.fw-claim-status .dim{color:var(--muted); font-weight:500}

.fw-sugs{margin-top:13px; display:flex; flex-wrap:wrap; align-items:center; gap:8px}
.fw-sugs-l{font-size:12.5px; color:var(--muted)}
.fw-sug{font-size:13px; font-weight:600; color:var(--green); background:rgba(37,211,102,.1); border:1px solid rgba(37,211,102,.24); padding:7px 11px; border-radius:9px; cursor:pointer; transition:.14s}
.fw-sug:hover{background:rgba(37,211,102,.17)}

.fw-ticker{margin-top:15px; display:flex; align-items:center; gap:9px}
.fw-ticker-l{flex:none; font-size:12.5px; font-weight:600; color:var(--muted)}
.fw-ticker-mask{position:relative; flex:1; min-width:0; overflow:hidden; -webkit-mask-image:linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image:linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)}
.fw-ticker-row{display:inline-flex; gap:18px; white-space:nowrap; will-change:transform; animation:tick 22s linear infinite}
.fw-ticker-item{display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:#c2ccd2}
.fw-ticker-dot{width:6px; height:6px; border-radius:50%; background:var(--green); flex:none}
@keyframes tick{from{transform:translateX(0)} to{transform:translateX(-50%)}}

.fw-herd{position:fixed; left:14px; bottom:16px; z-index:70; pointer-events:none; display:flex; align-items:center; gap:10px; max-width:290px; background:var(--panel); border:1px solid var(--line2); border-radius:13px; padding:11px 13px; box-shadow:0 16px 40px -16px rgba(0,0,0,.6); animation:herd-in .42s cubic-bezier(.2,.7,.2,1)}
.fw-herd-av{flex:none; width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#25d366,#1da851); color:#0b141a; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center}
.fw-herd-tx{font-size:12.5px; line-height:1.3; color:var(--muted); display:flex; flex-direction:column}
.fw-herd-tx b{color:var(--text); font-weight:600}
.fw-herd-tx i{font-style:normal; font-size:11px; color:#5c6b75; margin-top:1px}
@keyframes herd-in{from{opacity:0; transform:translateY(12px)} to{opacity:1; transform:none}}

.fw-prev{margin-top:24px}
.fw-prev-label{display:block; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:12px}
.fw-prev-grid{display:grid; grid-template-columns:1fr; gap:12px}
.fw-bio{background:var(--panel); border:1px solid var(--line2); border-radius:14px; padding:14px}
.fw-bio-top{display:flex; align-items:center; gap:10px}
.fw-bio-av{width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#25d366,#1da851); display:flex; align-items:center; justify-content:center; font-weight:700; color:#0b141a; font-size:16px; flex:none}
.fw-bio-name{font-weight:700; font-size:14px}
.fw-bio-handle{font-size:11.5px; color:var(--muted)}
.fw-bio-line{margin-top:11px; font-size:12.5px; color:#c2ccd2}
.fw-bio-link{margin-top:6px; display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--green); font-weight:600}
.fw-bio-url{word-break:break-all}
.fw-status-label{display:flex; align-items:center; gap:6px; font-size:11.5px; color:var(--muted); margin-bottom:8px}
.fw-status-card{border-radius:14px; padding:18px 14px; min-height:96px; background:linear-gradient(145deg,#1da851,#0b8a44); display:flex; flex-direction:column; justify-content:center; gap:10px; text-align:center}
.fw-status-text{font-weight:700; font-size:16px; color:#fff}
.fw-status-link{font-size:11.5px; font-weight:600; color:#06351f; background:rgba(255,255,255,.92); padding:7px 10px; border-radius:8px; word-break:break-all}

.fw-chips{margin-top:24px; display:flex; flex-wrap:wrap; gap:9px}
.fw-chip{font-family:inherit; font-size:14px; font-weight:500; cursor:pointer; color:var(--text); background:var(--panel); border:1.5px solid var(--line2); padding:11px 15px; border-radius:999px; transition:.14s}
.fw-chip:hover{border-color:#3a4a54}
.fw-chip.on{color:#0b141a; background:var(--green); border-color:var(--green); font-weight:700}

.fw-phone{margin-top:24px; display:flex; gap:10px}
.fw-code{flex:none; font-family:inherit; font-size:15px; font-weight:600; color:var(--text); background:var(--field); border:1.5px solid var(--line2); border-radius:13px; padding:0 12px; outline:none; cursor:pointer}
.fw-code:focus{border-color:var(--green)}
.fw-phone .fw-input{flex:1}

.fw-actions{margin-top:30px}
.fw-next{width:100%; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; font-size:16px; font-weight:600; color:#0b141a; background:var(--green); border:0; border-radius:13px; padding:16px; box-shadow:0 12px 30px -10px rgba(37,211,102,.5); transition:.16s}
.fw-next:hover:not(:disabled){background:#2ee06f; transform:translateY(-1px)}
.fw-next:disabled{background:#2a3940; color:#5c6b75; box-shadow:none; cursor:not-allowed}
.fw-skip{display:block; width:100%; margin-top:12px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:500; color:var(--muted); background:none; border:0; padding:6px}
.fw-skip:hover{color:var(--text)}

.fw-done{position:relative; z-index:1; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:48px 22px; text-align:center}
.fw-confetti{position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:60}
.fw-done .fw-step{width:100%; max-width:460px; position:relative; z-index:1}
.fw-tick{width:62px; height:62px; margin:0 auto 22px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; box-shadow:0 14px 36px -8px rgba(37,211,102,.55)}
.fw-doneh{font-weight:700; font-size:30px; letter-spacing:-.02em}
.fw-donelede{margin-top:11px; font-size:16px; line-height:1.55; color:var(--muted)}
.fw-live{margin:22px auto 0; max-width:420px}
.fw-live-label{display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--green); margin-bottom:11px}
.fw-search{width:100%; cursor:pointer; display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #dfe1e5; border-radius:28px; padding:12px 12px 12px 18px; box-shadow:0 12px 32px -12px rgba(0,0,0,.55); transition:.16s}
.fw-search:hover{box-shadow:0 16px 38px -12px rgba(0,0,0,.65); transform:translateY(-1px); border-color:#cfd2d6}
.fw-search:focus-visible{outline:none; border-color:var(--green); box-shadow:0 0 0 4px rgba(37,211,102,.3)}
.fw-search-ic{flex:none; display:flex}
.fw-search-q{flex:1; min-width:0; text-align:left; font-size:15px; color:#3c4043; word-break:break-all}
.fw-search-q b{font-weight:700; color:#202124}
.fw-search-go{flex:none; width:34px; height:34px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center}
.fw-live-hint{display:block; margin-top:12px; font-size:13px; color:var(--muted)}
.fw-sent{margin-top:22px; font-size:14px; color:var(--muted)}
.fw-wa{margin:14px auto 0; max-width:400px; text-align:left; border-radius:14px; overflow:hidden; border:1px solid var(--line2)}
.fw-wa-bar{display:flex; align-items:center; gap:10px; background:var(--raise); padding:11px 14px}
.fw-wa-av{width:30px; height:30px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center}
.fw-wa-name{font-weight:600; font-size:14.5px}
.fw-wa-body{background:#0b141a; padding:16px 14px; min-height:78px; background-image:radial-gradient(rgba(255,255,255,.022) 1px, transparent 1px); background-size:18px 18px}
.fw-wa-bubble{background:var(--raise); border-radius:3px 12px 12px 12px; padding:11px 13px 8px; font-size:13.5px; line-height:1.5; color:var(--text); max-width:94%}
.fw-wa-time{display:block; text-align:right; margin-top:4px; font-size:10.5px; color:var(--muted)}
.fw-pos{margin-top:22px; font-size:14.5px; color:var(--muted)}
.fw-pos b{color:var(--text)}
.fw-share{display:flex; align-items:center; justify-content:center; gap:9px; width:100%; max-width:400px; margin:20px auto 0; cursor:pointer; font-size:15px; font-weight:600; color:var(--green); background:rgba(37,211,102,.1); border:1.5px solid rgba(37,211,102,.26); border-radius:12px; padding:14px}
.fw-share:hover{background:rgba(37,211,102,.16)}
.fw-reset{display:inline-block; margin:14px auto 0; cursor:pointer; font-family:inherit; font-size:13.5px; color:var(--muted); background:none; border:0; text-decoration:underline; text-underline-offset:3px}

@media (min-width:880px){
  .fw:not(.fw-is-done){display:grid; grid-template-columns:minmax(0,46%) minmax(0,54%)}
  .fw-glow{left:23%; top:-160px}
  .fw-aside{display:flex; flex-direction:column; justify-content:space-between; min-height:100vh; padding:52px 54px; border-right:1px solid var(--line); background:linear-gradient(180deg,#0e1a22,#0b141a)}
  .fw-aside-mid{margin:36px 0; max-width:420px}
  .fw-mtop{display:none}
  .fw-flow{justify-content:center}
  .fw-flow-inner{display:flex; flex-direction:column; justify-content:center; max-width:500px; padding:48px 56px}
  .fw-hero-m{display:none}
  .fw-prev-grid{grid-template-columns:1fr 1fr}
  .fw-herd{left:auto; right:24px; bottom:24px}
}

@media (prefers-reduced-motion:reduce){.fw-step{animation:none}.fw-prog-fill{transition:none}.fw-claim.free{animation:none}.fw-ticker-row{animation:none}.fw-herd{animation:none}}
@media (max-width:520px){.fw-flow-inner{padding:22px 18px 36px}}
@media (min-width:430px) and (max-width:879px){.fw-prev-grid{grid-template-columns:1fr 1fr}}
@keyframes sweep{100%{transform:translateX(100%)}}
@keyframes tick{from{transform:translateX(0)} to{transform:translateX(-50%)}}
`;
