'use client';

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import SearchableSelect from "../../components/SearchableSelect";

interface Store {
  id: string;
  username: string;
  store_name: string;
  store_bio: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  whatsapp_phone: string;
  location?: string | null;
  business_persona?: string | null;
}

interface ComingSoonStorefrontProps {
  username: string;
  store: Store;
  systemDomain: string;
  appName: string;
}

const CODES = [["NG", "+234"], ["GH", "+233"], ["KE", "+254"], ["ZA", "+27"], ["UK", "+44"], ["US", "+1"]];

const WA = ({ s = 18, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);
const Lock = ({ s = 13, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
);
const Check = ({ s = 16, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
const Bell = ({ s = 16, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
const StoreIcon = ({ s = 22, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9.5 4.5 4h15L21 9.5M3 9.5h18M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 11v9h14v-9" /></svg>
);
const Share = ({ s = 16, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.6" /><line x1="15.4" y1="6.4" x2="8.6" y2="10.5" /></svg>
);
const X = ({ s = 18, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const Pin = ({ s = 14, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const MockMap = () => (
  <svg className="cs-map-svg" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="320" height="160" fill="#0e1a20" />
    <g fill="#14242d">
      <rect x="10" y="12" width="78" height="40" rx="4" /><rect x="100" y="8" width="62" height="34" rx="4" />
      <rect x="176" y="14" width="58" height="38" rx="4" /><rect x="248" y="10" width="64" height="40" rx="4" />
      <rect x="12" y="104" width="66" height="46" rx="4" /><rect x="118" y="110" width="74" height="44" rx="4" />
      <rect x="214" y="106" width="96" height="48" rx="4" />
    </g>
    <g stroke="#1d2f39" strokeWidth="7" strokeLinecap="round">
      <line x1="0" y1="68" x2="320" y2="76" /><line x1="0" y1="92" x2="320" y2="92" />
      <line x1="92" y1="0" x2="92" y2="160" /><line x1="204" y1="0" x2="232" y2="160" />
    </g>
    <g stroke="#24414c" strokeWidth="2.5" strokeLinecap="round" opacity=".7">
      <line x1="0" y1="40" x2="320" y2="44" /><line x1="150" y1="0" x2="150" y2="160" />
    </g>
    <circle className="cs-map-halo" cx="160" cy="78" r="20" fill="rgba(37,211,102,.18)" />
    <path d="M160 60a12 12 0 0 1 12 12c0 9-12 22-12 22s-12-13-12-22a12 12 0 0 1 12-12z" fill="#25d366" />
    <circle cx="160" cy="72" r="4.6" fill="#0b141a" />
  </svg>
);

function geo() {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toString();
    const m: Record<string, string> = { "Africa/Lagos": "+234", "Africa/Accra": "+233", "Africa/Nairobi": "+254", "Africa/Johannesburg": "+27", "Europe/London": "+44", "America/New_York": "+1", "America/Los_Angeles": "+1", "America/Chicago": "+1" };
    if (m[tz]) return m[tz];
    const loc = (typeof navigator !== "undefined" ? navigator.language || "" : "").toUpperCase();
    const r: Record<string, string> = { NG: "+234", GH: "+233", KE: "+254", ZA: "+27", GB: "+44", US: "+1" };
    for (const k in r) { if (loc.endsWith("-" + k) || loc === k) return r[k]; }
  } catch (e) { /* fall through */ }
  return "+234";
}

export default function ComingSoonStorefront({
  username,
  store,
  systemDomain,
  appName,
}: ComingSoonStorefrontProps) {
  const dial = useMemo(() => geo(), []);
  const codeOptions = useMemo(() => CODES.map(([k, v]) => ({
    value: v,
    label: `${k} (${v})`,
  })), []);
  const [name, setName] = useState("");
  const [code, setCode] = useState(dial);
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [notified, setNotified] = useState(false);
  const valid = name.trim() && phone.trim().length >= 6;
  const waiting = useMemo(() => 30 + Math.floor(Math.random() * 90), []);

  const rawStoreName = store.store_name || username || "Store";
  const storeName = useMemo(() => {
    if (!rawStoreName) return "Store";
    const isSlug = rawStoreName.includes('-') || rawStoreName.includes('_') || rawStoreName === rawStoreName.toLowerCase();
    if (isSlug) {
      return rawStoreName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    return rawStoreName;
  }, [rawStoreName]);
  const initial = storeName.charAt(0).toUpperCase();
  const categoryLabel = useMemo(() => {
    if (store.business_persona) {
      return store.business_persona.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    const nameLower = username.toLowerCase();
    if (nameLower.includes('beauty') || nameLower.includes('skincare') || nameLower.includes('salon') || nameLower.includes('glow') || nameLower.includes('hair') || nameLower.includes('makeup') || nameLower.includes('cosmetics') || nameLower.includes('spa') || nameLower.includes('lash') || nameLower.includes('brow')) {
      return "Beauty and Skincare";
    }
    if (nameLower.includes('food') || nameLower.includes('eat') || nameLower.includes('restaurant') || nameLower.includes('kitchen') || nameLower.includes('bake') || nameLower.includes('cafe') || nameLower.includes('chow') || nameLower.includes('dining')) {
      return "Food and Drinks";
    }
    if (nameLower.includes('fashion') || nameLower.includes('clothing') || nameLower.includes('wear') || nameLower.includes('boutique') || nameLower.includes('thrift') || nameLower.includes('stitch') || nameLower.includes('apparel') || nameLower.includes('style') || nameLower.includes('closet')) {
      return "Fashion and Clothing";
    }
    if (nameLower.includes('gadget') || nameLower.includes('phone') || nameLower.includes('repair') || nameLower.includes('tech') || nameLower.includes('computer')) {
      return "Gadgets and Tech";
    }
    return "Retailer";
  }, [store.business_persona, username]);
  const locationLabel = store.location || "Lagos, Nigeria";

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  function notify() {
    if (!valid) return;
    setNotified(true);
    toast.success("Added to waitlist!");
  }

  function shareShop() {
    const msg = `Have a look at ${storeName}, opening soon on ${appName}. You will be able to browse and order right inside WhatsApp: ${systemDomain}/${store.username}`;
    if (typeof window !== "undefined") window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
  }

  const first = name.trim().split(" ")[0];
  const launchMsg = `Hi ${name.trim() || "there"}, good news, ${storeName} is now open on ${appName}. Browse and order right here: ${systemDomain}/${store.username}`;

  const Cta = ({ full, label }: { full?: boolean; label: string }) => (
    <button className={"cs-cta" + (full ? " full" : "") + (notified ? " on" : "")} onClick={() => setOpen(true)}>
      {notified ? <><Check s={15} c="#0b141a" /> On the list</> : <><Bell s={15} c="#0b141a" /> {label}</>}
    </button>
  );

  return (
    <div className="cs">
      <style>{css}</style>
      <div className="cs-glow" />

      <div className="cs-wrap">
        <div className="cs-cover">
          <span className="cs-cover-ic"><StoreIcon s={250} c="#ffffff" /></span>
          <span className="cs-chip cs-chip-status"><span className="cs-statusdot" /> Opening soon</span>
          <span className="cs-chip cs-chip-secured"><Lock s={11} c="#cdd6da" /> Secured by {appName}</span>
        </div>

        <div className="cs-band">
          <div className="cs-avatar">
            {store.logo_url ? (
              <img src={store.logo_url} alt={storeName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            ) : initial}
          </div>
          <div className="cs-band-id">
            <div className="cs-band-text">
              <div className="cs-name-row">
                <h1 className="cs-name">{storeName}</h1>
                <button className="cs-shareic" onClick={shareShop} aria-label="Share this shop"><Share s={16} c="#25d366" /></button>
              </div>
              <p className="cs-meta">{categoryLabel} <span className="cs-mid">·</span> {locationLabel}</p>
            </div>
            <div className="cs-band-actions">
              <Cta label="Notify me" />
            </div>
          </div>
        </div>

        <div className="cs-content">
          <div className="cs-col">
            {store.store_bio ? (
              <p className="cs-blurb">{store.store_bio}</p>
            ) : (
              <p className="cs-blurb">We are setting up our digital shop. Soon you will be able to browse our full catalogue and order directly on WhatsApp. Stay tuned!</p>
            )}
            <div className="cs-cat">
              <div className="cs-cat-head">
                <span className="cs-cat-title">The shelves are being stocked</span>
                <span className="cs-cat-sub">Services and products landing soon</span>
              </div>
              <div className="cs-sk-rows">
                {[0, 1, 2].map((i) => (
                  <div className="cs-sk-row" key={i}>
                    <div className="cs-sk-rowtx"><div className="cs-sk sk-line w70" /><div className="cs-sk sk-line w40 dim" /></div>
                    <div className="cs-sk sk-pill" />
                  </div>
                ))}
              </div>
              <div className="cs-sk-grid">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div className="cs-sk-card" key={i}>
                    <div className="cs-sk sk-img" />
                    <div className="cs-sk sk-line w80" />
                    <div className="cs-sk sk-line w45 dim" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="cs-rail">
            <div className="cs-railcard">
              <span className="cs-rail-label">Location</span>
              <div className="cs-map"><MockMap /></div>
              <p className="cs-addr-line"><Pin s={14} c="#25d366" /> {locationLabel}</p>
              <div className="cs-rail-sk">
                <div className="cs-rail-skrow"><div className="cs-sk sk-line w35 dim" /><div className="cs-sk sk-line w55" /></div>
                <div className="cs-rail-skrow"><div className="cs-sk sk-line w35 dim" /><div className="cs-sk sk-line w45" /></div>
              </div>
              <span className="cs-rail-foot">Full details land when the shop opens</span>
            </div>
          </aside>
        </div>
      </div>

      <footer className="cs-foot">
        <span className="cs-foot-line">{appName} gives small businesses their own shop on WhatsApp.</span>
        <a className="cs-foot-claim" href={`https://${systemDomain}`} target="_blank" rel="noopener noreferrer">Run a business? Claim your own link</a>
      </footer>

      {open && (
        <div className="cs-modal" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="cs-modal-card">
            <button className="cs-modal-x" onClick={() => setOpen(false)} aria-label="Close"><X s={18} c="#8696a0" /></button>
            {!notified ? (
              <>
                <h2 className="cs-m-h">Be first through the door</h2>
                <p className="cs-m-p">Leave your details and we will message you on WhatsApp the moment {storeName} opens.</p>
                <input autoFocus className="cs-input cs-name-in" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") notify(); }} placeholder="Your name" />
                <div className="cs-phone" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <SearchableSelect
                    options={codeOptions}
                    value={code}
                    onChange={setCode}
                    placeholder=""
                    searchPlaceholder="Search code..."
                    style={{ width: '120px', flexShrink: 0 }}
                  />
                  <input className="cs-input" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") notify(); }} placeholder="801 234 5678" inputMode="numeric" />
                </div>
                <button className="cs-cta full" disabled={!valid} onClick={notify}><Bell s={16} c="#0b141a" /> Notify me on WhatsApp</button>
                <p className="cs-fine">No spam. Just one message, the day the shop is live.</p>
              </>
            ) : (
              <>
                <div className="cs-tick"><Check s={22} c="#0b141a" /></div>
                <h2 className="cs-m-h cs-m-center">You are on the list{first ? `, ${first}` : ""}.</h2>
                <p className="cs-m-p cs-m-center">We will message you on WhatsApp at {code} {phone} the moment {storeName} opens.</p>
                <div className="cs-wa">
                  <div className="cs-wa-bar"><span className="cs-wa-av"><WA s={15} c="#0b141a" /></span><span className="cs-wa-name">{appName}</span></div>
                  <div className="cs-wa-body"><div className="cs-wa-bubble">{launchMsg}<span className="cs-wa-time">on launch day</span></div></div>
                </div>
                <p className="cs-pos">You are one of <b>{waiting + 1}</b> waiting for this shop to open.</p>
                <button className="cs-ghost full" onClick={shareShop}><WA s={15} c="#25d366" /> Share this shop with a friend</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

.cs *{box-sizing:border-box;margin:0;padding:0}
.cs{
  --bg:#0b141a; --panel:#111b21; --raise:#1d2a33; --field:#1a242c;
  --line:rgba(255,255,255,.08); --line2:rgba(255,255,255,.14);
  --text:#e9edef; --muted:#8696a0; --green:#25d366;
  --surface:var(--field);
  --border:var(--line2);
  --primary:var(--green);
  --r-md:12px;
  --r-lg:16px;
  --bg-2:var(--raise);
  --text-muted:var(--muted);
  --text-faint:rgba(255,255,255,.3);
  --primary-light:rgba(37,211,102,.12);
  --primary-glow:rgba(37,211,102,.2);
  --t-fast:0.15s;
  --ease:ease;
  --shadow-lg:0 16px 40px -16px rgba(0,0,0,.6);
  font-family:'Hanken Grotesk',system-ui,sans-serif; color:var(--text);
  background:var(--bg); min-height:100vh; width:100%; position:relative; overflow-x:hidden;
  display:flex; flex-direction:column; -webkit-font-smoothing:antialiased;
}
.cs-glow{position:absolute; top:-200px; left:30%; width:620px; height:440px; max-width:100%; background:radial-gradient(closest-side, rgba(37,211,102,.14), transparent 70%); pointer-events:none; z-index:0}

.cs-wrap{position:relative; z-index:1; flex:1; width:100%; max-width:560px; margin:0 auto; padding:22px 22px 30px; animation:rise .5s cubic-bezier(.2,.6,.2,1)}
@keyframes rise{from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none}}

.cs-cover{position:relative; height:clamp(150px,26vw,200px); border-radius:20px; overflow:hidden; border:1px solid var(--line2); background:linear-gradient(135deg,#0c5238 0%,#0a3a2a 55%,#0b2c22 100%)}
.cs-cover-ic{position:absolute; right:-30px; bottom:-50px; opacity:.10; line-height:0}
.cs-chip{position:absolute; top:14px; display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:600; padding:6px 11px; border-radius:999px; backdrop-filter:blur(4px)}
.cs-chip-status{left:14px; color:#dffbe9; background:rgba(8,40,28,.5); border:1px solid rgba(37,211,102,.4)}
.cs-chip-secured{right:14px; color:#cdd6da; background:rgba(11,20,26,.42); border:1px solid rgba(255,255,255,.18)}
.cs-statusdot{width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 0 3px rgba(37,211,102,.25); animation:pulse 2s ease-in-out infinite; flex:none}
@keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(37,211,102,.25)}50%{box-shadow:0 0 0 6px rgba(37,211,102,.06)}}

/* identity band, store style: overlapping logo left, action right */
.cs-band{display:flex; flex-direction:column; gap:14px; padding:0 2px}
.cs-avatar{position:relative; z-index:3; width:76px; height:76px; margin-top:-42px; border-radius:22px; background:linear-gradient(135deg,#25d366,#1da851); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:33px; color:#0b141a; box-shadow:0 0 0 4px var(--bg), 0 16px 34px -12px rgba(37,211,102,.5); align-self:flex-start}
.cs-band-id{display:flex; flex-direction:column; gap:14px}
.cs-band-text{min-width:0}
.cs-name{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:clamp(26px,5.6vw,34px); line-height:1.08; letter-spacing:-.02em}
.cs-meta{margin-top:8px; font-size:14.5px; color:var(--muted)}
.cs-mid{color:#3a4a54; margin:0 2px}
.cs-band-actions{display:flex; gap:10px}

.cs-cta{cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:#0b141a; background:var(--green); border:0; border-radius:12px; padding:13px 20px; box-shadow:0 12px 30px -12px rgba(37,211,102,.5); transition:.16s}
.cs-cta:hover:not(:disabled){background:#2ee06f; transform:translateY(-1px)}
.cs-cta:disabled{background:#2a3940; color:#5c6b75; box-shadow:none; cursor:not-allowed}
.cs-cta.full{width:100%}
.cs-cta.on{background:rgba(37,211,102,.16); color:var(--green); box-shadow:none; border:1.5px solid rgba(37,211,102,.4)}
.cs-band-actions .cs-cta{flex:1}

.cs-name-row{display:flex; align-items:center; gap:11px; flex-wrap:wrap}
.cs-shareic{flex:none; width:34px; height:34px; border-radius:10px; border:1px solid rgba(37,211,102,.3); background:rgba(37,211,102,.1); color:var(--green); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.15s}
.cs-shareic:hover{background:rgba(37,211,102,.18); transform:translateY(-1px)}

.cs-content{margin-top:24px; display:flex; flex-direction:column; gap:22px}
.cs-col{min-width:0}
.cs-blurb{font-size:15px; line-height:1.6; color:#b7c1c7}

.cs-cat{margin-top:22px; text-align:left}
.cs-cat-head{display:flex; flex-direction:column; gap:3px; margin-bottom:15px}
.cs-cat-title{font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:16px}
.cs-cat-sub{font-size:12.5px; color:var(--muted)}
.cs-sk-rows{display:flex; flex-direction:column; gap:10px}
.cs-sk-row{display:flex; align-items:center; gap:12px; background:var(--panel); border:1px solid var(--line); border-radius:13px; padding:14px}
.cs-sk-rowtx{flex:1; display:flex; flex-direction:column; gap:8px}
.cs-sk-grid{margin-top:12px; display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px}
.cs-sk-card{background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:12px}
.cs-sk{position:relative; overflow:hidden; background:#16222b; border-radius:7px}
.cs-sk::after{content:""; position:absolute; inset:0; transform:translateX(-100%); background:linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent); animation:sweep 1.6s infinite}
.sk-line{height:11px}
.sk-line.dim{opacity:.5}
.sk-pill{flex:none; width:58px; height:30px; border-radius:9px}
.sk-img{width:100%; aspect-ratio:1/1; border-radius:9px; margin-bottom:11px}
.w70{width:70%}.w40{width:40%}.w45{width:45%}.w80{width:80%}.w35{width:35%}.w55{width:55%}
.cs-sk-card .sk-line+.sk-line{margin-top:8px}

/* sticky info rail, store location in loading guise */
.cs-rail{display:block}
.cs-railcard{background:var(--panel); border:1px solid var(--line2); border-radius:18px; padding:18px; box-shadow:0 20px 50px -30px rgba(0,0,0,.7)}
.cs-rail-label{display:block; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12.5px; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:12px}
.cs-map{position:relative; height:158px; border-radius:13px; overflow:hidden; border:1px solid var(--line2)}
.cs-map-svg{width:100%; height:100%; display:block}
.cs-map-halo{animation:halo 2.4s ease-in-out infinite}
@keyframes halo{0%,100%{opacity:.32}50%{opacity:.10}}
.cs-addr-line{display:flex; align-items:center; gap:7px; margin-top:13px; font-size:13.5px; font-weight:600; color:var(--text)}
.cs-rail-sk{margin-top:14px; display:flex; flex-direction:column; gap:10px}
.cs-rail-skrow{display:flex; align-items:center; gap:10px}
.cs-rail-foot{display:block; margin-top:14px; font-size:11.5px; color:var(--muted)}

.cs-foot{position:relative; z-index:1; text-align:center; padding:30px 22px 34px; display:flex; flex-direction:column; gap:9px; align-items:center}
.cs-foot-line{font-size:12.5px; color:var(--muted)}
.cs-foot-claim{font-size:12.5px; font-weight:600; color:#6f7d86; text-decoration:none; border-bottom:1px solid rgba(255,255,255,.12); padding-bottom:1px}
.cs-foot-claim:hover{color:var(--muted)}

/* modal */
.cs-modal{position:fixed; inset:0; z-index:100; background:rgba(4,9,12,.66); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fade .2s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.cs-modal-card{position:relative; width:100%; max-width:420px; max-height:92vh; overflow:auto; background:#0f1a21; border:1px solid var(--line2); border-radius:20px; padding:26px 22px 22px; box-shadow:0 30px 80px -20px rgba(0,0,0,.8); animation:pop .26s cubic-bezier(.2,.7,.2,1)}
@keyframes pop{from{opacity:0; transform:translateY(16px) scale(.98)}to{opacity:1; transform:none}}
.cs-modal-x{position:absolute; top:14px; right:14px; width:34px; height:34px; border-radius:10px; border:1px solid var(--line2); background:var(--field); color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer}
.cs-modal-x:hover{background:var(--raise); color:var(--text)}
.cs-m-h{font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:21px; padding-right:30px}
.cs-m-p{margin-top:9px; font-size:14px; line-height:1.55; color:var(--muted)}
.cs-m-center{text-align:center; padding-right:0}
.cs-name-in{margin-top:18px; width:100%}
.cs-phone{margin-top:18px; display:flex; gap:10px}
.cs-code{flex:none; font-family:inherit; font-size:15px; font-weight:600; color:var(--text); background:var(--field); border:1.5px solid var(--line2); border-radius:12px; padding:0 12px; outline:none; cursor:pointer}
.cs-code:focus{border-color:var(--green)}
.cs-input{flex:1; min-width:0; font-family:inherit; font-size:16px; color:var(--text); background:var(--field); border:1.5px solid var(--line2); border-radius:12px; padding:14px; outline:none; transition:.16s}
.cs-input::placeholder{color:#5c6b75}
.cs-input:focus{border-color:var(--green); box-shadow:0 0 0 4px rgba(37,211,102,.14)}
.cs-modal .cs-cta{margin-top:14px}
.cs-fine{margin-top:11px; text-align:center; font-size:12px; color:var(--muted)}
.cs-tick{width:52px; height:52px; margin:6px auto 14px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; box-shadow:0 12px 30px -10px rgba(37,211,102,.55)}
.cs-wa{margin:16px auto 0; text-align:left; border-radius:13px; overflow:hidden; border:1px solid var(--line2)}
.cs-wa-bar{display:flex; align-items:center; gap:10px; background:var(--raise); padding:10px 13px}
.cs-wa-av{width:28px; height:28px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center}
.cs-wa-name{font-weight:600; font-size:14px}
.cs-wa-body{background:#0b141a; padding:15px 13px; background-image:radial-gradient(rgba(255,255,255,.022) 1px, transparent 1px); background-size:18px 18px}
.cs-wa-bubble{background:var(--raise); border-radius:3px 12px 12px 12px; padding:11px 13px 8px; font-size:13px; line-height:1.5; color:var(--text); max-width:95%}
.cs-wa-time{display:block; text-align:right; margin-top:4px; font-size:10.5px; color:var(--muted)}
.cs-pos{margin-top:16px; text-align:center; font-size:13.5px; color:var(--muted)}
.cs-pos b{color:var(--text); font-family:'Space Grotesk',sans-serif}
.cs-ghost{cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:'Space Grotesk',sans-serif; font-size:14.5px; font-weight:600; color:var(--green); background:rgba(37,211,102,.1); border:1.5px solid rgba(37,211,102,.26); border-radius:12px; padding:13px}
.cs-ghost:hover{background:rgba(37,211,102,.16)}
.cs-ghost.full{width:100%; margin-top:16px}

/* desktop: store-style band row + two-column body with sticky rail */
@media (min-width:880px){
  .cs-wrap{max-width:960px; padding:26px 30px 36px}
  .cs-band{flex-direction:row; align-items:flex-end; gap:20px}
  .cs-avatar{width:96px; height:96px; margin-top:-54px; font-size:40px; border-radius:26px}
  .cs-band-id{flex:1; flex-direction:row; align-items:flex-end; justify-content:space-between; gap:18px; padding-bottom:4px}
  .cs-band-actions .cs-cta{flex:none}
  .cs-content{display:grid; grid-template-columns:1fr 320px; gap:30px; align-items:start; margin-top:28px}
  .cs-rail{position:sticky; top:26px}
  .cs-cat{margin-top:0}
  .cs-blurb{margin-bottom:22px}
}

@media (prefers-reduced-motion:reduce){.cs-wrap{animation:none}.cs-statusdot{animation:none}.cs-sk::after{animation:none}.cs-modal,.cs-modal-card{animation:none}.cs-map-halo{animation:none}}
@media (max-width:520px){.cs-wrap{padding:18px 16px 26px}}
@keyframes sweep{100%{transform:translateX(100%)}}
`;
