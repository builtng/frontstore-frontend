'use client'
import React, { useState, useEffect } from "react";
import {
    Menu, X, BadgeCheck, MapPin, Star, Clock, Share2, Store,
    Search, ShoppingBag, Calendar, ChevronRight, ChevronDown, ChevronLeft, Megaphone, Truck,
    ShieldCheck, Navigation, Lock, Plus, Minus, Copy, Instagram, Facebook,
    Award, Check, Quote, Phone, Mail, RotateCcw, Package, Bell,
} from "lucide-react";

const STORE = {
    name: "Vjhenzie Beauty Hub", initial: "V", slug: "vjhenzie",
    primaryCta: "book",
    category: "Beauty & Skincare", location: "Lekki, Lagos",
    rating: 4.9, reviews: 214, orders: "1.3k", reply: "~10 min",
    bio: "Lagos based beauty studio for bridal glam, glass-skin facials and protective styling. Ten years of making people feel like the best version of themselves.",
    address: "12 Admiralty Way, Lekki Phase 1, Lagos",
    phone: "+234 801 234 5678",
    email: "vjhenzie@frontstore.app",
    socials: { instagram: "@vjhenziebeauty", tiktok: "@vjhenzie.beauty" },
};
const SERVICES = [
    { id: "s1", name: "Signature Glow Facial", price: 25000, dur: "60 min", durMin: 60, cat: "Facials", popular: true, desc: "Deep cleanse, gentle exfoliation and a hydrating mask for an instant glow." },
    { id: "s2", name: "Bridal Glam Session", price: 85000, dur: "3 hrs", durMin: 180, cat: "Bridal", popular: true, desc: "Full bridal makeup and styling with a trial, built to last the whole day." },
    { id: "s3", name: "Full Face Beat", price: 30000, dur: "75 min", durMin: 75, cat: "Makeup", desc: "A camera-ready full face for events, shoots and special occasions." },
    { id: "s4", name: "Silk Press & Style", price: 18000, dur: "90 min", durMin: 90, cat: "Hair", popular: true, desc: "Wash, silk press and a sleek finish that keeps your hair healthy." },
    { id: "s5", name: "Gel Manicure", price: 12000, dur: "45 min", durMin: 45, cat: "Nails", desc: "Long-lasting gel colour with cuticle care and a shaped finish." },
    { id: "s6", name: "Lash Refill", price: 15000, dur: "60 min", durMin: 60, cat: "Lashes", desc: "Top up your lash extensions for a full, fresh look between sets." },
];
const PRODUCTS = [
    { id: "p1", name: "Hydrating Glow Facial Kit", price: 18500, cat: "Skincare", popular: true, desc: "A complete at-home facial kit for a salon-fresh glow between visits." },
    { id: "p2", name: "Vitamin C Serum", price: 14000, cat: "Skincare", popular: true, desc: "Brightening serum that evens tone and adds radiance over time." },
    { id: "p3", name: "Rose Quartz Roller", price: 9000, cat: "Tools", desc: "Cooling facial roller that de-puffs and helps products sink in." },
    { id: "p4", name: "Lip Care Trio", price: 11000, cat: "Lips", desc: "Scrub, balm and tint to keep lips soft, smooth and full." },
    { id: "p5", name: "Silk Bonnet", price: 6500, cat: "Hair", popular: true, desc: "Satin-lined bonnet that protects your style and edges overnight." },
    { id: "p6", name: "Shea Body Butter", price: 8500, cat: "Body", desc: "Rich whipped shea butter for deep, all-over hydration." },
];
const REVIEWS = [
    { id: "r1", name: "Amara N.", r: 5, when: "2 weeks ago", service: "Bridal Glam Session", verified: true, photos: 2, text: "My bridal glam was flawless and lasted the whole day. Jane is an artist.", response: { when: "2 weeks ago", text: "Thank you Amara, it was a joy to be part of your day. Wishing you all the best." } },
    { id: "r2", name: "Tunde A.", r: 5, when: "1 month ago", service: "Signature Glow Facial", verified: true, photos: 0, text: "Booked a facial for my wife, she has not stopped glowing or talking about it." },
    { id: "r3", name: "Zainab K.", r: 4, when: "1 month ago", service: "Silk Press & Style", verified: true, photos: 1, text: "Lovely studio and warm team. Ran a little behind on time but worth the wait.", response: { when: "1 month ago", text: "Thank you Zainab, and sorry for the short wait. We have added more buffer between appointments." } },
    { id: "r4", name: "Chidi O.", r: 5, when: "6 weeks ago", service: "Full Face Beat", verified: true, photos: 1, text: "Showed up camera ready. The beat lasted through a full day of shooting." },
    { id: "r5", name: "Bisi A.", r: 3, when: "2 months ago", service: "Gel Manicure", verified: true, photos: 0, text: "Nice work but the colour I wanted was out of stock on the day." },
    { id: "r6", name: "Ngozi E.", r: 5, when: "2 months ago", service: "Hydrating Glow Facial Kit", verified: true, photos: 2, text: "The kit is now part of my weekly routine. My skin feels so much softer." },
];
const PRODUCT_FAQS = [
    ["How long does delivery take?", "Most Lagos orders arrive in 1 to 3 days. The delivery cost is shown at checkout based on your area."],
    ["Do you ship outside Lagos?", "Yes, nationwide delivery across Nigeria is available, with timing and cost confirmed at checkout."],
    ["Can I return a product?", "Unopened products can be returned within 7 days in their original packaging. Opened skincare cannot be returned for hygiene reasons unless faulty."],
    ["Is pickup available?", "Yes, you can collect from the Lekki studio during opening hours. Choose pickup at checkout."],
    ["How do I pay?", "Pay securely through Frontstore, or by bank transfer where the studio offers it. Your receipt arrives on WhatsApp."],
];
const SERVICE_FAQS = [
    ["How do deposits work?", "A deposit secures your slot and is taken when you book. The balance is paid at your appointment, and the deposit amount is always shown before you confirm."],
    ["Can I reschedule or cancel?", "Yes, up to 48 hours before your appointment for a full deposit refund. Inside 48 hours the deposit is held against the booking."],
    ["What if I am running late?", "Let us know on WhatsApp. We hold your slot for 15 minutes, after which we may need to shorten or move the appointment."],
    ["Do you offer home service?", "For bridal and group bookings within Lagos. A travel fee is confirmed before your date."],
    ["How do I pay?", "Pay securely through Frontstore, or by bank transfer where the studio offers it. Your receipt always arrives on WhatsApp."],
];
const FAQ_GROUPS = [
    {
        cat: "Booking and appointments", icon: Calendar, items: [
            ["Do you take walk-ins?", "We work mostly by appointment to keep things calm and on time. Walk-ins are welcome when there is a free slot, but booking ahead is safest."],
            ["Do you offer home or on-location service?", "Yes, for bridal and group bookings within Lagos. A travel fee applies based on your location and is confirmed before your date."],
            ["How do I reschedule or cancel?", "Reschedule or cancel up to 48 hours before your appointment for a full deposit refund. Inside 48 hours the deposit is held against the booking."],
            ["How early should I arrive?", "Please arrive about ten minutes before your slot so we can start your consult on time. Bridal mornings are planned individually with you in advance."],
        ],
    },
    {
        cat: "Payments and deposits", icon: Lock, items: [
            ["How do I pay?", "You can pay securely through Frontstore at checkout, or by bank transfer directly to the studio. Frontstore checkout is the safer option as it comes with buyer protection."],
            ["Is paying through Frontstore safe?", "Yes. Payments made through Frontstore are protected, so if an order does not arrive as described you can raise a dispute and we help mediate. This protection cannot be removed by the studio."],
            ["How much is the deposit?", "A deposit secures your slot when you book, and the balance is paid on the day of your appointment. The exact deposit is shown before you confirm."],
            ["What currency are prices in?", "Prices are shown in Nigerian naira. Any approximate conversion shown elsewhere is indicative only, and you are always charged in naira."],
        ],
    },
    {
        cat: "Delivery and pickup", icon: Truck, items: [
            ["Do you deliver, and where?", "We deliver across Lagos and nationwide. Delivery is arranged after checkout and the fee depends on your location."],
            ["How long does delivery take?", "Within Lagos, orders usually arrive in one to three working days. Nationwide delivery typically takes three to five working days."],
            ["Can I pick up my order myself?", "Yes. Free pickup is available from the studio in Lekki Phase 1 once your order is ready, which we confirm on WhatsApp."],
        ],
    },
    {
        cat: "Products and returns", icon: ShoppingBag, items: [
            ["Are your products authentic?", "Yes. We only stock genuine products, a mix of professional and clean beauty brands suited to African skin and hair."],
            ["Can I return a product?", "Unopened products can be returned within 7 days of delivery in their original packaging. Opened skincare cannot be returned for hygiene reasons unless it is faulty."],
            ["Do you cater to sensitive skin?", "Yes. Let us know in your consult or your message and we will choose products and treatments suited to sensitive skin."],
        ],
    },
    {
        cat: "Trust and Frontstore", icon: ShieldCheck, items: [
            ["What does Secured by Frontstore mean?", "It means this store runs on Frontstore, so your booking or order is covered by Frontstore buyer protection and platform terms that the studio cannot remove."],
            ["Are the reviews real?", "Yes. Reviews can only be left by customers with a completed Frontstore order, and each one is shown with a verified badge. The studio can respond to reviews but cannot delete genuine ones."],
            ["What if something goes wrong with my order?", "If an order paid through Frontstore does not arrive as described, you can raise a dispute and Frontstore will help mediate a fair resolution."],
        ],
    },
];
const FAQS_PREVIEW = FAQ_GROUPS.map((g) => g.items[0]);
const TERMS = [
    { t: "Who these terms are between", p: [`These terms are an agreement between you and ${STORE.name}, the studio that sells the services and products on this store. The store runs on Frontstore, which provides the platform and buyer protection but is not the seller.`] },
    { t: "Bookings and deposits", p: ["Appointments are made by booking through this store. A deposit secures your slot and the balance is paid on the day of your appointment. Your slot is confirmed once the deposit is received."] },
    { t: "Pricing and payment", p: ["Prices are shown in Nigerian naira. Any approximate conversion shown elsewhere is indicative only, and you are charged in naira.", "You can pay securely through Frontstore at checkout, or by bank transfer to the studio. Funds paid by transfer go directly to the studio, while Frontstore payments are held under buyer protection."] },
    { t: "Cancellations and refunds", p: ["You can reschedule, cancel or return within the windows set out on the Refunds page, where you will also find how and when refunds are issued."], link: { label: "Read the Refunds policy", page: "returns" } },
    { t: "Treatments and your responsibility", p: ["Before any treatment, please tell us about allergies, skin sensitivities, medical conditions or medication that could affect your service. A patch test is recommended where a reaction is possible.", "Results vary from person to person, and following the aftercare we give you helps them last. We cannot accept responsibility for reactions where relevant information was not shared with us beforehand."] },
    { t: "Products", p: ["We sell genuine products only. Please check that a product suits your skin or hair, and reach out if you are unsure. Returns are handled as set out on the Refunds page."] },
    { t: "Reviews and content", p: ["Reviews can only be left by customers with a completed order, and each is shown with a verified badge. The studio may respond to reviews but cannot remove genuine ones. By submitting a review or photo, you allow it to be shown on this store."] },
    { t: "Liability", p: ["We provide our services with reasonable skill and care, but they are not a substitute for professional medical advice. Nothing in these terms removes any rights you have under applicable law."] },
    { t: "The Frontstore platform", p: [], locked: { title: "Frontstore platform terms", body: "Every Frontstore store also operates under the Frontstore platform terms and buyer protection policy. These apply alongside the store's own policies and cannot be removed by the vendor.", link: "Read the Frontstore platform terms" } },
    { t: "Changes to these terms", p: ["We may update these terms from time to time. The version shown on this page is the current one, and the date it was last updated is shown alongside it."] },
    { t: "Governing law", p: ["These terms are governed by the laws of the Federal Republic of Nigeria, and any dispute falls under the courts of Lagos State."] },
    { t: "Contact", p: ["Questions about these terms? Reach the studio through the Contact page and we will be glad to help."], link: { label: "Go to Contact", page: "contact" } },
];
const PRIVACY = [
    { t: "What we collect", p: [`When you book, buy or get in touch, ${STORE.name} collects the details you give us: your name, contact details such as a WhatsApp number, phone or email, your booking and order details, any message you send, and reviews or photos you choose to share.`] },
    { t: "How we use it", p: ["We use your details to take and confirm bookings and orders, reply to your enquiries, arrange delivery or pickup, process payments, show verified reviews, and improve the store. We do not send marketing without your consent."] },
    { t: "Payments", p: ["Payments made through Frontstore are handled by Frontstore and its payment providers under buyer protection, and the studio does not see or store your card details. Bank transfers are made directly to the studio."] },
    { t: "WhatsApp and messaging", p: ["When you message us, the conversation takes place on WhatsApp and is also subject to WhatsApp's own privacy terms. In future this may move to Frontstore's own messaging."] },
    { t: "Who we share it with", p: ["We share only what is needed: with delivery partners to fulfil your order, with payment providers to take payment, and with Frontstore as the platform the store runs on. We never sell your data."] },
    { t: "Cookies and analytics", p: ["The store uses basic cookies and analytics, provided through the Frontstore platform, to keep the store working and understand how it is used."] },
    { t: "Keeping your data", p: ["We keep your details only as long as needed to provide our services and to meet legal and tax obligations, after which they are removed."] },
    { t: "Your rights", p: ["Under Nigerian data protection law you can ask to see the data we hold about you, correct it, delete it, or object to how it is used. To make a request, reach us through the Contact page."], link: { label: "Go to Contact", page: "contact" } },
    { t: "The Frontstore platform", p: [], locked: { title: "Frontstore platform privacy", body: "As the platform this store runs on, Frontstore also processes data under its own privacy policy and platform terms. These apply alongside the store's own notice and cannot be removed by the vendor.", link: "Read the Frontstore privacy policy" } },
    { t: "Changes to this notice", p: ["We may update this notice from time to time. The version shown on this page is the current one, with the date it was last updated shown alongside it."] },
    { t: "Contact", p: ["Questions about your privacy, or want to make a data request? Reach the studio through the Contact page and we will help."], link: { label: "Go to Contact", page: "contact" } },
];
const PORTFOLIO = [
    { label: "Bridal glam", cat: "Bridal", c: "c0" },
    { label: "Soft glam", cat: "Makeup", c: "c1" },
    { label: "Glass-skin facial", cat: "Skin", c: "c1", ba: true },
    { label: "Editorial beat", cat: "Makeup", c: "c2" },
    { label: "Acne calm treatment", cat: "Skin", c: "c2", ba: true },
    { label: "Protective styling", cat: "Hair", c: "c0" },
    { label: "Bridal party", cat: "Bridal", c: "c1" },
    { label: "Silk press and style", cat: "Hair", c: "c2" },
    { label: "Brow shaping", cat: "Makeup", c: "c0" },
];
const NOTIFY_TOPICS = [["services", "New services"], ["products", "New products"], ["offers", "Offers and drops"], ["news", "Announcements"]];
const HOURS = [
    ["Mon", "9:00am - 7:00pm"], ["Tue", "9:00am - 7:00pm"], ["Wed", "9:00am - 7:00pm"],
    ["Thu", "9:00am - 7:00pm"], ["Fri", "9:00am - 8:00pm"], ["Sat", "10:00am - 6:00pm"], ["Sun", "Closed"],
];
const NAV = [
    ["home", "Home"], ["services", "Services"], ["products", "Products"], ["portfolio", "Portfolio"], ["reviews", "Reviews"], ["blog", "Blog"],
    ["about", "About"], ["faq", "FAQ"], ["contact", "Contact"],
];
const LEGAL = [["returns", "Refunds"], ["terms", "Terms"], ["privacy", "Privacy"]];
const CATS = ["Facials", "Bridal", "Hair", "Nails", "Skincare", "Makeup"];
const FEATURED = [
    { id: "s1", name: "Signature Glow Facial", price: 25000, dur: "60 min", type: "service" },
    { id: "s2", name: "Bridal Glam Session", price: 85000, dur: "3 hrs", type: "service" },
    { id: "p1", name: "Hydrating Glow Facial Kit", price: 18500, type: "product" },
];
const AUTHOR = {
    name: "Jane Iweze",
    initial: "J",
    role: "Founder and lead artist",
    bio: "Jane founded Vjhenzie Beauty Hub and has spent over ten years on bridal makeup, glass-skin facials and protective styling for clients across Lagos.",
    long: "Jane trained as a makeup artist in Lagos and has spent the last decade building Vjhenzie Beauty Hub into a studio known for natural, lasting glam. She still takes every bridal client herself, and personally tests the products on the shelf before they ever reach you.",
    quote: "I want every client to leave feeling like the best, most rested version of themselves.",
    specialities: ["Bridal makeup", "Glass-skin facials", "Protective styling", "10+ years"],
    socials: { instagram: "@jane.iweze", tiktok: "@janeiweze" },
    credentials: [
        "Trained at a leading Lagos makeup academy",
        "Certified in advanced facial and skincare treatments",
        "Member of a professional bridal beauty network",
    ],
};
const OFFERINGS = [
    ["Bridal and events", "Full glam for brides, bridal parties and shoots, in studio or on location.", "services"],
    ["Facials and skin", "Glass-skin facials and treatments tailored to your skin in a calm, private room.", "services"],
    ["Hair and protective styling", "Protective styles and finishing that keep hair healthy through Lagos heat.", "services"],
    ["Skincare to take home", "A small, tested shelf of the products we actually use on clients.", "products"],
];
const GALLERY = [
    { label: "Bridal glam", c: "c0" },
    { label: "Glass-skin facial", c: "c1" },
    { label: "Protective styling", c: "c2" },
    { label: "Editorial beat", c: "c1" },
    { label: "Soft glam", c: "c2" },
    { label: "Studio in Lekki", c: "c0" },
];
const RECOGNITION = ["Lagos Bridal Week", "The Glow Edit", "Naija Weddings", "BeautyHub Africa"];
const ABOUT_FACTS = [
    ["Established", "Lagos, since 2016"],
    ["Registered", "CAC RC 1648205"],
    ["The studio", "Private space in Lekki Phase 1, by appointment"],
    ["Booking", "A deposit secures your slot, balance paid on the day"],
    ["Payment", "Pay securely with Frontstore, or by bank transfer"],
    ["Hygiene", "Single-use tools and sanitised stations for every client"],
    ["Delivery", "Pickup in Lekki, delivery across Lagos and nationwide"],
    ["Languages", "English, Yoruba and Pidgin"],
];
const BLOG = [
    {
        title: "How to prep your skin before a bridal facial", date: "5 Jun 2026", cat: "Skincare", read: "5 min", excerpt: "A simple week-by-week routine so your skin is calm and glowing on the big day.", body: [
            { p: "The biggest mistake brides make is trying something new the week of the wedding. Your skin needs time to settle, so the work really starts about a month out. Here is the routine we give our bridal clients." },
            { h: "Four weeks before" },
            { p: "Book your facial now, not later. This is when we treat congestion, even out tone and calm any reactivity, with enough runway for your skin to recover fully before the day." },
            { p: "Keep your home routine simple: a gentle cleanser, a hydrating serum and sunscreen every morning. Resist the urge to add strong actives you have never used." },
            { h: "The final week" },
            { list: ["No new products, full stop", "Drink more water than you think you need", "Sleep is skincare, protect your nights", "Come in for a light hydrating treatment, never a deep extraction"] },
            { p: "On the morning itself your skin should need very little. A clean, hydrated base is what makes makeup sit beautifully and last through a long day of photos." },
        ]
    },
    {
        title: "Protective styles that actually protect your edges", date: "22 May 2026", cat: "Hair", read: "4 min", excerpt: "Our stylists share the looks that keep your hair healthy through Lagos heat.", body: [
            { p: "Protective styling is meant to give your hair a rest, but a style that is too tight or left in too long does the opposite. Here is how we keep the protection without the damage." },
            { h: "Tension is the enemy" },
            { p: "If a style hurts when it goes in, it is too tight. Pain at the hairline is the first sign your edges are under strain. A good install should feel secure, never sore." },
            { h: "Styles we reach for" },
            { list: ["Loose box braids with the perimeter left softer", "Two strand twists that skip the tightest tension", "Low buns and tucked styles for everyday wear"] },
            { p: "Whatever the style, give your scalp a light oil every few days and tie your hair down at night. And take it out on time. Four to six weeks is plenty, longer than that and you are working against yourself." },
        ]
    },
    {
        title: "A three step glass-skin routine on a budget", date: "9 May 2026", cat: "Routines", read: "6 min", excerpt: "You do not need ten products. Here are the three that do the heavy lifting.", body: [
            { p: "Glass skin looks like a ten step routine, but the result really comes down to three things done consistently: clean, hydrate, protect. Everything else is optional." },
            { h: "Step one, a gentle cleanse" },
            { p: "Strip your skin and it fights back with oil and irritation. A mild, non foaming cleanser morning and night is all most people need." },
            { h: "Step two, layer hydration" },
            { p: "This is where the glow comes from. A hydrating toner or essence pressed in while the skin is still damp, then a light moisturiser to seal it. Damp skin holds water far better than dry skin." },
            { h: "Step three, sunscreen every morning" },
            { p: "No routine survives sun damage. Sunscreen is the single product that protects all the work the other two are doing. Skip it and you undo the rest." },
            { p: "Three products, used every day, will outperform a crowded shelf used now and then. Start here and add only when your skin asks for it." },
        ]
    },
    {
        title: "What to expect at your first appointment", date: "28 Apr 2026", cat: "Studio", read: "3 min", excerpt: "From the consult to aftercare, here is how a first visit with us actually runs.", body: [
            { p: "A first visit can feel like stepping into the unknown. Here is exactly how an appointment with us runs, so you arrive relaxed and know what to ask." },
            { h: "We start by listening" },
            { p: "Every appointment opens with a short consult. We talk through what you want, look at your skin or hair honestly, and flag anything we would do differently. You are never pushed into more than you came for." },
            { h: "During the treatment" },
            { p: "We explain each step as we go. If anything feels uncomfortable, tell us, there is always an adjustment we can make." },
            { h: "Before you leave" },
            { p: "You get simple aftercare advice and a clear idea of when to come back. Booking and payment are handled through Frontstore, so your deposit and order are protected from the moment you confirm." },
        ]
    },
    {
        title: "Five products our clients repurchase the most", date: "12 Apr 2026", cat: "Skincare", read: "4 min", excerpt: "The shelf staples that keep selling out, and who each one is really for.", body: [
            { p: "Some products sell once. These five sell again and again, because clients finish them and come straight back. Here is who each one is really for." },
            { list: ["The hydrating serum, for anyone whose skin feels tight by midday", "The barrier cream, for sensitive or reactive skin that flares easily", "The daily sunscreen, the one nobody regrets adding", "The cleansing balm, for heavy makeup and SPF days", "The lip and edge oil, small but it disappears fastest of all"] },
            { p: "If you are only going to buy one to start, make it the sunscreen. It is the product that protects everything else you do, and the one our clients tell us they wish they had started sooner." },
            { p: "Not sure which fits your skin? Message the studio before you order and we will point you to the right one rather than the most expensive one." },
        ]
    },
    {
        title: "Caring for your lashes between refills", date: "2 Apr 2026", cat: "Lashes", read: "3 min", excerpt: "Small daily habits that keep extensions full and your natural lashes healthy.", body: [
            { p: "Good extensions can last weeks, but only if you treat them well between visits. The habits are small and they make the difference between a refill and a full new set." },
            { h: "The daily basics" },
            { list: ["Brush them gently each morning with a clean spoolie", "Keep heavy oils away from the lash line", "Sleep on your back or a silk pillowcase where you can", "Never pick or pull a loose lash, let us remove it"] },
            { h: "When to come back" },
            { p: "Most clients need a refill every two to three weeks. Leave it much longer and the set thins out to the point where a fresh full set works out better value than a refill." },
            { p: "Look after your natural lashes underneath and they will hold extensions well for years. Neglect them and no amount of refills will sit right." },
        ]
    },
];

const money = (n) => "₦" + n.toLocaleString("en-NG");
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => !!(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
const hoursForDate = (d) => HOURS[(d.getDay() + 6) % 7][1];
const parseClock = (s) => { const m = s.trim().match(/(\d+):(\d+)\s*(am|pm)/i); if (!m) return 0; let h = (+m[1]) % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + (+m[2]); };
const fmtMins = (min) => { const h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "pm" : "am", hh = h % 12 || 12; return `${hh}:${String(m).padStart(2, "0")}${ap}`; };
const fmtDateFull = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const daySlots = (date, durMin) => { const h = hoursForDate(date); if (h === "Closed") return []; const [o, c] = h.split(" - "); const open = parseClock(o), close = parseClock(c); const out = []; for (let t = open; t <= close - durMin; t += 60) out.push(t); return out; };
const todayIdx = (new Date().getDay() + 6) % 7;

function Tiktok({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
    );
}

function WhatsApp({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
        </svg>
    );
}

function useIsDesktop() {
    const q = "(min-width: 980px)";
    const [d, setD] = useState(typeof window !== "undefined" ? window.matchMedia(q).matches : false);
    useEffect(() => {
        const m = window.matchMedia(q);
        const fn = (e) => setD(e.matches);
        m.addEventListener ? m.addEventListener("change", fn) : m.addListener(fn);
        return () => { m.removeEventListener ? m.removeEventListener("change", fn) : m.removeListener(fn); };
    }, []);
    return d;
}

export default function FrontstorePremiumStore() {
    const isDesktop = useIsDesktop();
    const [page, setPage] = useState("home");
    const [drawer, setDrawer] = useState(false);
    const [search, setSearch] = useState(false);
    const [bookOpen, setBookOpen] = useState(false);
    const [bookSvc, setBookSvc] = useState(null);
    const [bookStep, setBookStep] = useState("service");
    const [bookDate, setBookDate] = useState(null);
    const [bookTime, setBookTime] = useState(null);
    const [bookName, setBookName] = useState("");
    const [bookNote, setBookNote] = useState("");
    const [calMonth, setCalMonth] = useState(() => startOfMonth(new Date()));
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyPhone, setNotifyPhone] = useState("");
    const [notifyTopics, setNotifyTopics] = useState(["services", "products", "offers", "news"]);
    const [bag, setBag] = useState(false);
    const [bagCount, setBagCount] = useState(2);
    const [share, setShare] = useState(false);
    const [annOff, setAnnOff] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const [faqQuery, setFaqQuery] = useState("");
    const [faqOpen, setFaqOpen] = useState(null);
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
    const [reviewOpen, setReviewOpen] = useState(false);
    const [revRating, setRevRating] = useState(0);
    const [revText, setRevText] = useState("");
    const [revRef, setRevRef] = useState("");
    const [revPhoto, setRevPhoto] = useState(null);
    const [blogCat, setBlogCat] = useState("All");
    const [pfCat, setPfCat] = useState("All");
    const [post, setPost] = useState(null);
    const [toast, setToast] = useState("");

    const ping = (m) => { setToast(m); setTimeout(() => setToast(""), 1600); };
    const go = (p) => { setPost(null); setPage(p); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const openPost = (p) => { setPost(p); setPage("post"); setDrawer(false); setSearch(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const addBag = (name) => { setBagCount((c) => c + 1); ping(name + " added to bag"); };
    const copyUrl = () => { navigator.clipboard?.writeText(`frontstore.app/${STORE.slug}`); ping("Store link copied"); };

    const primaryCta = {
        book: { label: "Book a slot", Icon: Calendar, run: () => openBooking() },
        shop: { label: "Shop now", Icon: ShoppingBag, run: () => go("products") },
        message: { label: "Message us", Icon: WhatsApp, run: () => ping("Opening WhatsApp") },
    }[STORE.primaryCta] || { label: "Book a slot", Icon: Calendar, run: () => openBooking() };

    const openBooking = (svc) => {
        const resolved = svc ? (SERVICES.find((s) => s.id === svc.id) || svc) : null;
        setBookSvc(resolved);
        setBookStep(resolved ? "date" : "service");
        setBookDate(null); setBookTime(null); setBookName(""); setBookNote("");
        setCalMonth(startOfMonth(new Date()));
        setDrawer(false);
        setBookOpen(true);
    };

    const bookingFlow = () => {
        const titles = { service: "Choose a service", date: "Choose a date", time: "Choose a time", review: "Confirm booking" };
        const backTo = { date: "service", time: "date", review: "time" };
        const onBack = backTo[bookStep] ? () => setBookStep(backTo[bookStep]) : undefined;
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
        const slots = bookSvc && bookDate ? daySlots(bookDate, bookSvc.durMin) : [];
        const svcBar = bookSvc && (
            <div className="bk-svcbar">
                <span><b>{bookSvc.name}</b><i>{bookSvc.dur} <span className="ps-dot">•</span> {money(bookSvc.price)}</i></span>
                <button onClick={() => setBookStep("service")}>Change</button>
            </div>
        );
        return (
            <Sheet onClose={() => setBookOpen(false)} onBack={onBack} title={titles[bookStep]}>
                {bookStep === "service" && (<>
                    <p className="ps-sheet-sub">Pick the treatment you would like to book.</p>
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
                    <p className="ps-field-lbl">{fmtDateFull(bookDate)}</p>
                    {slots.length > 0 ? (
                        <div className="bk-times">
                            {slots.map((min, i) => {
                                const taken = (bookDate.getDate() + i) % 4 === 0;
                                return <button key={min} disabled={taken} className={`bk-slot${taken ? " taken" : ""}`}
                                    onClick={() => { if (!taken) { setBookTime(fmtMins(min)); setBookStep("review"); } }}>{fmtMins(min)}</button>;
                            })}
                        </div>
                    ) : <p className="bk-empty">No times available on this day. Try another date.</p>}
                </>)}

                {bookStep === "review" && (<>
                    {svcBar}
                    <div className="bk-summary">
                        <div><span>Date</span><b>{fmtDateFull(bookDate)}</b></div>
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
    const svcCats = [...new Set(SERVICES.map((s) => s.cat))];
    const durTest = (m) => svcDur === "All" || (svcDur === "short" && m < 60) || (svcDur === "mid" && m >= 60 && m <= 120) || (svcDur === "long" && m > 120);
    const svcFiltered = SERVICES
        .filter((s) => (svcCat === "All" || s.cat === svcCat) && durTest(s.durMin) &&
            (svcQuery.trim() === "" || (s.name + " " + s.desc + " " + s.cat).toLowerCase().includes(svcQuery.trim().toLowerCase())))
        .sort((a, b) => (svcSort === "priceAsc" ? a.price - b.price : svcSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
    const svcHasFilters = svcCat !== "All" || svcDur !== "All" || svcQuery.trim() !== "";
    const clearSvc = () => { setSvcQuery(""); setSvcCat("All"); setSvcDur("All"); setSvcSort("popular"); };
    const catColor = (cat) => "c" + (svcCats.indexOf(cat) % 4);
    const prodCats = [...new Set(PRODUCTS.map((p) => p.cat))];
    const priceTest = (price) => prodPrice === "All" || (prodPrice === "lo" && price < 10000) || (prodPrice === "mid" && price >= 10000 && price <= 15000) || (prodPrice === "hi" && price > 15000);
    const prodFiltered = PRODUCTS
        .filter((p) => (prodCat === "All" || p.cat === prodCat) && priceTest(p.price) &&
            (prodQuery.trim() === "" || (p.name + " " + p.desc + " " + p.cat).toLowerCase().includes(prodQuery.trim().toLowerCase())))
        .sort((a, b) => (prodSort === "priceAsc" ? a.price - b.price : prodSort === "priceDesc" ? b.price - a.price : (b.popular ? 1 : 0) - (a.popular ? 1 : 0)));
    const prodHasFilters = prodCat !== "All" || prodPrice !== "All" || prodQuery.trim() !== "";
    const clearProd = () => { setProdQuery(""); setProdCat("All"); setProdPrice("All"); setProdSort("popular"); };
    const prodColor = (cat) => "c" + (prodCats.indexOf(cat) % 4);
    const blogCats = [...new Set(BLOG.map((b) => b.cat))];
    const blogList = blogCat === "All" ? BLOG : BLOG.filter((b) => b.cat === blogCat);
    const pfCats = [...new Set(PORTFOLIO.map((p) => p.cat))];
    const pfList = pfCat === "All" ? PORTFOLIO : PORTFOLIO.filter((p) => p.cat === pfCat);
    const faqId = (c) => "faq-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const termId = (c) => "tm-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const faqQ = faqQuery.trim().toLowerCase();
    const faqFiltered = FAQ_GROUPS
        .map((g) => ({ ...g, items: faqQ ? g.items.filter(([q, a]) => (q + " " + a).toLowerCase().includes(faqQ)) : g.items }))
        .filter((g) => g.items.length > 0);
    const REV_DIST = [[5, 80], [4, 14], [3, 3], [2, 2], [1, 1]];
    const revFiltered = REVIEWS
        .filter((rv) => (revStar === 0 || rv.r === revStar) && (!revPhotos || rv.photos > 0))
        .sort((a, b) => (revSort === "high" ? b.r - a.r : revSort === "low" ? a.r - b.r : 0));
    const revPhotoTiles = REVIEWS.filter((rv) => rv.photos > 0).flatMap((rv) => Array.from({ length: rv.photos }).map((_, i) => rv.id + i)).slice(0, 8);
    const submitReview = () => {
        if (!revRating || !revRef.trim()) { ping("Add a rating and your order reference"); return; }
        setReviewOpen(false); setRevRating(0); setRevText(""); setRevRef(""); setRevPhoto(null);
        ping("Thank you, your review has been submitted");
    };
    const featSvcIds = FEATURED.filter((f) => f.type === "service").map((f) => f.id);
    const featProdIds = FEATURED.filter((f) => f.type === "product").map((f) => f.id);
    const homeServices = SERVICES.filter((s) => !featSvcIds.includes(s.id));
    const homeProducts = PRODUCTS.filter((p) => !featProdIds.includes(p.id));

    /* ---- shared content blocks ---- */
    const servicesGrid = (g, list) => (
        <div className={g}>{(list || SERVICES).map((s) => <ServiceCard key={s.id} s={s} onBook={() => openBooking(s)} />)}</div>
    );
    const productsGrid = (g, list) => (
        <div className={g}>{(list || PRODUCTS).map((p) => <ProductCard key={p.id} p={p} onBuy={() => addBag(p.name)} />)}</div>
    );
    const reviewsBody = () => (<>
        <p className="svc-intro">Every review here comes from a verified order on Frontstore. The studio can respond, but cannot remove genuine reviews.</p>
        <RatingSummary />
        <button className="rev-leave rev-leave-m" onClick={() => setReviewOpen(true)}><Star size={15} /> Leave a review</button>
        <div className="rev-trust rev-trust-m"><ShieldCheck size={14} /> Reviews are from verified orders. The studio typically responds in {STORE.reply}.</div>
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
        <div className="ab-chips">{AUTHOR.specialities.map((s) => <span key={s}>{s}</span>)}</div>
        <div className="ab-creds">
            <span className="ab-creds-h">Training and credentials</span>
            <ul>{AUTHOR.credentials.map((c) => <li key={c}><Check size={14} /> {c}</li>)}</ul>
        </div>
        <p className="ab-quote">{AUTHOR.quote}</p>
        <div className="ab-socials">
            <button onClick={() => ping("Opening Instagram")}><Instagram size={16} /> {AUTHOR.socials.instagram}</button>
            <button onClick={() => ping("Opening TikTok")}><Tiktok size={16} /> {AUTHOR.socials.tiktok}</button>
        </div>
    </>);
    const aboutWork = () => (
        <div className="ab-section">
            <div className="ab-sec-head">
                <h4 className="ab-subhead">Our work</h4>
                <button className="ab-seclink" onClick={() => go("portfolio")}>See more <ChevronRight size={14} /></button>
            </div>
            <div className="ab-gallery">
                {GALLERY.map((g) => (
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
            <div className="ab-featured-row">{RECOGNITION.map((r) => <span key={r} className="ab-logo">{r}</span>)}</div>
        </div>
    );
    const aboutReview = () => {
        const r = REVIEWS[0];
        return (
            <div className="ab-review">
                <Quote className="ab-quote-mark" size={28} />
                <p className="ab-review-text">{r.text}</p>
                <div className="ab-review-foot">
                    <div className="ab-review-by">
                        <span className="ab-review-av">{r.name[0]}</span>
                        <div><b>{r.name}</b><span className="ab-review-tag"><BadgeCheck size={13} /> Verified order · {r.service}</span></div>
                    </div>
                    <button className="ab-review-all" onClick={() => go("reviews")}>Read all {STORE.reviews} reviews <ChevronRight size={14} /></button>
                </div>
            </div>
        );
    };
    const aboutJournal = () => (
        <div className="ab-section">
            <div className="ab-sec-head">
                <h4 className="ab-subhead">From Jane's journal</h4>
                <button className="ab-seclink" onClick={() => go("blog")}>All articles <ChevronRight size={14} /></button>
            </div>
            <div className="ab-journal">
                {BLOG.slice(0, 3).map((b) => (
                    <button key={b.title} className="ab-journal-item" onClick={() => go("blog")}>
                        <span className="ab-journal-cat">{b.cat}</span>
                        <b>{b.title}</b>
                        <span className="ab-journal-meta">{b.read} read</span>
                    </button>
                ))}
            </div>
            <p className="ab-journal-note">Written by {AUTHOR.name}, drawing on a decade of client work.</p>
        </div>
    );
    const aboutBody = () => (<>
        <p className="ps-prose">{STORE.bio}</p>
        <p className="ab-para">What began in 2016 as a one chair set-up in a Lekki apartment is now a full studio with a small, trusted team, known for natural, lasting glam and skin that looks like itself on its best day.</p>
        <div className="ab-founder ab-founder-m">
            <div className="ab-portrait"><span className="ab-portrait-mono">{AUTHOR.initial}</span><span className="ab-portrait-tag">Founder</span></div>
            <div className="ab-founder-body">{aboutFounderBody()}</div>
        </div>
        {aboutWork()}
        {aboutFeatured()}
        <div className="ab-section">
            <h4 className="ab-subhead">What we offer</h4>
            <div className="ab-offer-grid ab-grid-m">
                {OFFERINGS.map(([t, d, pg]) => (
                    <button key={t} className="ab-offer-card" onClick={() => go(pg)}>
                        <b>{t}</b>
                        <p>{d}</p>
                        <span className="ab-offer-link">{pg === "products" ? "Shop products" : "View services"} <ChevronRight size={14} /></span>
                    </button>
                ))}
            </div>
        </div>
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
            <div><b>{STORE.orders}</b><span>orders delivered</span></div>
            <div><b>{STORE.rating}</b><span>average rating</span></div>
            <div><b>10 yrs</b><span>in practice</span></div>
        </div>
        <div className="ab-follow">
            <span className="ab-follow-h">Follow the studio</span>
            <div className="ab-socials">
                <button onClick={() => ping("Opening Instagram")}><Instagram size={16} /> {STORE.socials.instagram}</button>
                <button onClick={() => ping("Opening TikTok")}><Tiktok size={16} /> {STORE.socials.tiktok}</button>
                <button onClick={() => ping("Opening WhatsApp")}><WhatsApp size={16} /> WhatsApp</button>
            </div>
        </div>
        <button className="ab-book-m" onClick={() => openBooking()}><Calendar size={16} /> Book a treatment</button></>);
    const faqSections = () => (
        <div className="faq-groups">
            {faqFiltered.length === 0 && (
                <div className="faq-empty">No questions match that search. Try another word, or message the studio below.</div>
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
            <p>Message the studio directly and we will get back to you, usually in {STORE.reply}.</p>
            <button className="faq-help-cta" onClick={() => ping("Opening WhatsApp")}><WhatsApp size={15} /> Message on WhatsApp</button>
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
            <button className="ct-wa" onClick={() => ping("Opening WhatsApp")}><WhatsApp size={18} /> Chat on WhatsApp</button>
            <div className="ct-alt">
                <button onClick={() => ping("Opening email")}><Mail size={15} /> {STORE.email}</button>
                <button onClick={() => ping("Opening phone")}><Phone size={15} /> {STORE.phone}</button>
            </div>
        </div>
    );
    const contactForm = () => (
        <div className="ct-form">
            <h4 className="ab-subhead">Send an enquiry</h4>
            <p className="ct-form-sub">Tell us what you are after and we will reply by email. A real person, usually Jane or the team, will answer.</p>
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
            <button className="ct-send" onClick={() => { if (!cName.trim() || !cMsg.trim()) { ping("Please add your name and a short note"); return; } ping("Opening your email app"); }}><Mail size={16} /> Send email</button>
            <p className="ct-form-note">This opens your email app with the details ready to send to {STORE.email}.</p>
        </div>
    );
    const contactVisit = () => {
        const openToday = (HOURS[todayIdx][1] || "").toLowerCase() !== "closed";
        return (
            <div className="ct-visit">
                <div className="ab-rail-h"><MapPin size={15} /> Visit the studio</div>
                <div className="ct-map"><span className="ct-map-pin"><MapPin size={15} /></span><span className="ct-map-label">Lekki Phase 1</span></div>
                <p className="ab-addr">{STORE.address}</p>
                <button className="ps-dir" onClick={() => ping("Opening directions")}><Navigation size={15} /> Directions</button>
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
                <div className="ab-follow-rail">
                    <span>Follow the studio</span>
                    <div className="ab-follow-icons">
                        <button onClick={() => ping("Opening Instagram")} aria-label="Instagram"><Instagram size={17} /></button>
                        <button onClick={() => ping("Opening TikTok")} aria-label="TikTok"><Tiktok size={17} /></button>
                        <button onClick={() => ping("Opening WhatsApp")} aria-label="WhatsApp"><WhatsApp size={17} /></button>
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
                    <li><Check size={15} /> Faulty or incorrect items are put right at no cost to you, including return delivery.</li>
                </ul>
            </div>
            <div className="rf-section">
                <h3 className="rf-section-head"><RotateCcw size={17} /> Refunds</h3>
                <ul className="rf-list">
                    <li><Check size={15} /> Orders paid through Frontstore are refunded to your original payment method, usually within a few working days.</li>
                    <li><Check size={15} /> For bank transfer orders, the studio arranges your refund directly, since those funds are paid straight to them.</li>
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
            <p>Message the studio and we will sort your cancellation, return or refund.</p>
            <button className="blog-convert-cta" onClick={() => ping("Opening WhatsApp")}><WhatsApp size={15} /> Message on WhatsApp</button>
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
    const policySections = (items) => items.map((s) => (
        <section key={s.t} id={termId(s.t)} className="tm-section">
            <h3>{s.t}</h3>
            {s.p.map((para, i) => <p key={i}>{para}</p>)}
            {s.locked && <LockedFrontstorePanel title={s.locked.title} body={s.locked.body} link={s.locked.link} />}
            {s.link && <button className="tm-link" onClick={() => go(s.link.page)}>{s.link.label} <ChevronRight size={14} /></button>}
        </section>
    ));
    const policyRelated = (links) => (
        <div className="rf-related">
            <span className="rf-related-h">Related</span>
            {links.map(([label, pg]) => <button key={pg} onClick={() => go(pg)}>{label} <ChevronRight size={15} /></button>)}
        </div>
    );
    const termsBody = () => (
        <div className="tm-body-m">
            <p className="tm-intro">By booking or buying from {STORE.name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
            {policySections(TERMS)}
            <div className="tm-meta">Last updated 1 June 2026</div>
            {policyRelated([["Refunds", "returns"], ["FAQ", "faq"]])}
        </div>
    );
    const privacyBody = () => (
        <div className="tm-body-m">
            <p className="tm-intro">This notice explains what {STORE.name} does with your information when you book, buy or get in touch.</p>
            {policySections(PRIVACY)}
            <div className="tm-meta">Last updated 1 June 2026</div>
            {policyRelated([["Terms", "terms"], ["Refunds", "returns"]])}
        </div>
    );
    const blogBody = () => (
        <div className="blog-grid">
            {BLOG.map((b, i) => (
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
            {pfList.map((p) => (
                <button key={p.label} className={`pf-shot ${p.c}${p.ba ? " ba" : ""}`} onClick={() => ping("Opening photo")}>
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
                <button onClick={() => ping("Opening Instagram")}><Instagram size={16} /> {STORE.socials.instagram}</button>
                <button onClick={() => ping("Opening TikTok")}><Tiktok size={16} /> {STORE.socials.tiktok}</button>
            </div>
        </div>
    );
    const portfolioBody = () => (<>
        <p className="svc-intro">A look at recent work from the studio, from bridal glam to skin and hair.</p>
        {portfolioChips()}
        {portfolioGrid()}
        <button className="ab-book-m" onClick={() => openBooking()}><Calendar size={16} /> Book a treatment</button>
        {portfolioFollow()}
    </>);
    const articleView = () => {
        if (!post) return null;
        const idx = BLOG.indexOf(post);
        const colour = `c${(idx < 0 ? 0 : idx) % 3}`;
        const sameCat = BLOG.filter((b) => b !== post && b.cat === post.cat);
        const others = BLOG.filter((b) => b !== post && b.cat !== post.cat);
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
                            <span className="art-meta-av">{AUTHOR.initial}</span>
                            <span className="art-meta-by">By {AUTHOR.name}</span>
                            <span className="ps-dot">•</span> {post.date} <span className="ps-dot">•</span> {post.read} read
                        </div>
                        <div className="art-body">
                            {post.body.map((blk, i) =>
                                blk.h ? <h3 key={i}>{blk.h}</h3>
                                    : blk.list ? <ul key={i}>{blk.list.map((it, j) => <li key={j}>{it}</li>)}</ul>
                                        : <p key={i}>{blk.p}</p>
                            )}
                        </div>
                        <div className="art-author">
                            <span className="author-av">{AUTHOR.initial}</span>
                            <div className="art-author-main">
                                <span className="art-author-tag">Written by</span>
                                <b>{AUTHOR.name}</b>
                                <span className="art-author-role">{AUTHOR.role}</span>
                                <p>{AUTHOR.bio}</p>
                                <button className="author-link" onClick={() => go("about")}>More about {AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
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
                            <p>Book a treatment with the team, or shop the products we reach for.</p>
                            <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a treatment</button>
                            <button className="blog-convert-ghost" onClick={() => go("products")}>Shop products</button>
                        </div>
                    </aside>
                </div>
                <div className="art-related">
                    <h3 className="ab-subhead">More from the journal</h3>
                    <div className="blog-grid">
                        {related.map((b) => <BlogCard key={b.title} b={b} colour={`c${BLOG.indexOf(b) % 3}`} onOpen={() => openPost(b)} />)}
                    </div>
                </div>
                <StoreFoot onNav={go} />
            </div>
        );
    };

    const announcement = !annOff && (
        <div className="ps-ann">
            <Megaphone size={16} />
            <p><b>Announcement</b> Booking for the December bridal season is open. Reserve your date early.</p>
            <button onClick={() => setAnnOff(true)} aria-label="Dismiss"><X size={15} /></button>
        </div>
    );
    const featured = (
        <section className="feat">
            <div className="feat-head"><span className="feat-tag"><Award size={13} /> Featured</span></div>
            <div className="feat-grid">
                {FEATURED.map((f) => (
                    <FeaturedCard key={f.id} f={f} onAction={() => (f.type === "service" ? openBooking(f) : addBag(f.name))} />
                ))}
            </div>
        </section>
    );

    /* ---- drawer panel (mobile only) ---- */
    const Panel = ({ onClose }) => (
        <div className="ps-panel">
            <div className="ps-panel-top">
                <span className="ps-logo">frontstore<span>.app</span></span>
                {onClose && <button className="ps-x" onClick={onClose} aria-label="Close"><X size={20} /></button>}
            </div>
            <button className="ps-id" onClick={() => go("home")}>
                <span className="ps-id-av">{STORE.initial}</span>
                <span className="ps-id-main">
                    <b>{STORE.name} <BadgeCheck size={14} className="ps-verif" /></b>
                    <i>frontstore.app/{STORE.slug}</i>
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
                    {STORE.primaryCta !== "message" && <button onClick={() => { ping("Opening WhatsApp"); onClose && onClose(); }}><WhatsApp size={16} /> Message</button>}
                    <button onClick={() => { setShare(true); onClose && onClose(); }}><Share2 size={16} /> Share</button>
                </div>
            </div>
            <div className="ps-panel-foot">
                <span><Lock size={12} /> Secured by Frontstore</span>
                <p>Buyer protection and platform terms apply to every order.</p>
            </div>
        </div>
    );

    const igH = STORE.socials.instagram.replace(/^@/, "");
    const tkH = STORE.socials.tiktok.replace(/^@/, "");
    const jIg = AUTHOR.socials.instagram.replace(/^@/, "");
    const jTk = AUTHOR.socials.tiktok.replace(/^@/, "");
    const schema = {
        "@context": "https://schema.org",
        "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
        name: STORE.name,
        description: STORE.bio,
        url: `https://frontstore.app/${STORE.slug}`,
        image: `https://frontstore.app/${STORE.slug}/cover.jpg`,
        priceRange: "$$",
        address: { "@type": "PostalAddress", streetAddress: STORE.address, addressLocality: "Lekki", addressRegion: "Lagos", addressCountry: "NG" },
        telephone: STORE.phone,
        email: STORE.email,
        sameAs: [`https://instagram.com/${igH}`, `https://tiktok.com/@${tkH}`],
        aggregateRating: { "@type": "AggregateRating", ratingValue: STORE.rating, reviewCount: STORE.reviews, bestRating: 5 },
        founder: { "@type": "Person", name: AUTHOR.name, jobTitle: AUTHOR.role, sameAs: [`https://instagram.com/${jIg}`, `https://tiktok.com/@${jTk}`] },
        review: REVIEWS.slice(0, 3).map((rv) => ({ "@type": "Review", author: { "@type": "Person", name: rv.name }, reviewRating: { "@type": "Rating", ratingValue: rv.r, bestRating: 5 }, reviewBody: rv.text })),
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
        mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    };

    return (
        <div className="ps-root">
            <style>{css}</style>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
                        {page === "home" && (<>
                            <section className="ps-cover-wrap">
                                <div className="ps-cover"><Store className="ps-cover-icn" strokeWidth={1.1} /></div>
                                <span className="ps-avatar">{STORE.initial}</span>
                                <h1 className="ps-name">{STORE.name} <BadgeCheck size={20} className="ps-verif" /></h1>
                                <p className="ps-meta">{STORE.category} <span className="ps-dot">•</span> <MapPin size={13} /> {STORE.location}</p>
                                <div className="ps-id-actions-row">
                                    <button className="ps-url" onClick={copyUrl}>frontstore.app/{STORE.slug} <Copy size={13} /></button>
                                    <button className="ps-notify" onClick={() => setNotifyOpen(true)}><Bell size={14} /> Get notified</button>
                                </div>
                                <div className="ps-stats">
                                    <div><b><Star size={14} className="ps-star" /> {STORE.rating}</b><span>{STORE.reviews} reviews</span></div>
                                    <div><b>{STORE.orders}</b><span>orders</span></div>
                                    <div><b>{STORE.reply}</b><span>reply time</span></div>
                                </div>
                                <p className="ps-bio">{STORE.bio}</p>
                                <div className="ps-statusline">
                                    <span className="ps-open"><span className="ps-pulse" /> Open now</span>
                                    <span className="ps-secure"><ShieldCheck size={13} /> Secured by Frontstore</span>
                                </div>
                            </section>

                            {announcement}
                            {featured}

                            <div className="ps-searchbar" onClick={() => setSearch(true)}><Search size={17} /> <span>Search services and products</span></div>
                            <div className="ps-chips">{CATS.map((c) => <button key={c} onClick={() => setSearch(true)}>{c}</button>)}</div>

                            <SectionHead title="Services" action={`See all ${SERVICES.length}`} onAction={() => go("services")} />
                            {servicesGrid("ps-grid", homeServices.slice(0, 4))}
                            <button className="ps-seeall" onClick={() => go("services")}>See all {SERVICES.length} services <ChevronRight size={16} /></button>

                            <SectionHead title="Products" action={`See all ${PRODUCTS.length}`} onAction={() => go("products")} />
                            {productsGrid("ps-grid", homeProducts.slice(0, 4))}
                            <button className="ps-seeall" onClick={() => go("products")}>See all {PRODUCTS.length} products <ChevronRight size={16} /></button>

                            <SectionHead title="Reviews" />
                            <RatingSummary />
                            <div className="ps-reviews-row">{REVIEWS.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} />)}</div>
                            <button className="ps-seeall" onClick={() => go("reviews")}>See all reviews <ChevronRight size={16} /></button>

                            <SectionHead title="Visit the studio" />
                            <div className="ps-visit">
                                <div className="ps-map"><MapPin size={26} /><span>Map preview</span></div>
                                <div className="ps-visit-info">
                                    <p className="ps-addr"><MapPin size={15} /> {STORE.address}</p>
                                    <button className="ps-dir" onClick={() => ping("Opening directions")}><Navigation size={15} /> Directions</button>
                                    <ul className="ps-hours">{HOURS.map(([d, h], i) => (<li key={d} className={i === todayIdx ? "today" : ""}><span>{d}</span><b>{h}</b></li>))}</ul>
                                </div>
                            </div>

                            <SectionHead title="Good to know" />
                            <Accordion items={FAQS_PREVIEW} open={openFaq} setOpen={setOpenFaq} />
                            <StoreFoot onNav={go} />
                        </>)}

                        {page === "services" && <Sub title="Services">{servicesGrid("ps-grid", SERVICES)}<StoreFoot onNav={go} /></Sub>}
                        {page === "products" && <Sub title="Products">{productsGrid("ps-grid", PRODUCTS)}<StoreFoot onNav={go} /></Sub>}
                        {page === "portfolio" && <Sub title="Portfolio">{portfolioBody()}<StoreFoot onNav={go} /></Sub>}
                        {page === "post" && articleView()}
                        {page === "reviews" && <Sub title="Reviews">{reviewsBody()}<StoreFoot onNav={go} /></Sub>}
                        {page === "blog" && <Sub title="Blog">{blogBody()}<StoreFoot onNav={go} /></Sub>}
                        {page === "about" && <Sub title="About">{aboutBody()}<StoreFoot onNav={go} /></Sub>}
                        {page === "faq" && <Sub title="FAQ">{faqBody()}<StoreFoot onNav={go} /></Sub>}
                        {page === "contact" && <Sub title="Contact">{contactBody()}<StoreFoot onNav={go} /></Sub>}
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
                        <button className="ps-logo as-btn" onClick={() => go("home")}>frontstore<span>.app</span></button>
                        <button className="pd-search" onClick={() => setSearch(true)}><Search size={17} /> <span>Search {STORE.name}</span></button>
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
                            <div className="pd-cover-art"><Store className="pd-cover-icn" strokeWidth={1.05} /></div>
                            <div className="pd-identity">
                                <span className="pd-avatar">{STORE.initial}</span>
                                <div className="pd-identity-main">
                                    <h1>{STORE.name} <BadgeCheck size={22} className="ps-verif" /></h1>
                                    <p>
                                        <span>{STORE.category}</span><span className="ps-dot">•</span>
                                        <span><MapPin size={13} /> {STORE.location}</span><span className="ps-dot">•</span>
                                        <span><Star size={13} className="ps-star" /> {STORE.rating} ({STORE.reviews})</span><span className="ps-dot">•</span>
                                        <span>Replies {STORE.reply}</span>
                                    </p>
                                </div>
                                <div className="pd-identity-actions">
                                    <button className="pd-book" onClick={primaryCta.run}><primaryCta.Icon size={16} /> {primaryCta.label}</button>
                                    {STORE.primaryCta !== "message" && <button className="pd-ghost" onClick={() => ping("Opening WhatsApp")}><WhatsApp size={16} /> Message</button>}
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
                                    <div className="pd-railcard">
                                        <h3>Visit us</h3>
                                        <div className="pd-railmap"><MapPin size={22} /></div>
                                        <p className="ps-addr"><MapPin size={14} /> {STORE.address}</p>
                                        <div className="pd-railbtns">
                                            <button onClick={() => ping("Opening directions")}><Navigation size={14} /> Directions</button>
                                            <button onClick={() => ping("Opening WhatsApp")}><WhatsApp size={14} /> Message</button>
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
                                    <div className="pd-sec-head"><h2>Services</h2><button onClick={() => go("services")}>See all {SERVICES.length}</button></div>
                                    {servicesGrid("pd-grid", homeServices.slice(0, 6))}
                                    <div className="pd-sec-head"><h2>Products</h2><button onClick={() => go("products")}>See all {PRODUCTS.length}</button></div>
                                    {productsGrid("pd-grid", homeProducts.slice(0, 6))}
                                    <div className="pd-sec-head"><h2>Reviews</h2><button onClick={() => go("reviews")}>See all</button></div>
                                    <RatingSummary />
                                    <div className="pd-grid reviews">{REVIEWS.slice(0, 3).map((rv, i) => <ReviewCard key={i} rv={rv} full />)}</div>
                                </div>
                            </div>
                            <StoreFoot onNav={go} />
                        </>)}

                        {(page === "services" || page === "products" || page === "reviews" || page === "blog") && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>{NAV.find(([id]) => id === page)[1]}</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                {page === "services" && (
                                    <div className="svc-page">
                                        <p className="svc-intro">Book a treatment with our team. A deposit secures your slot, with the balance paid at your appointment.</p>

                                        <div className="pd-sec-head"><h2>Most booked</h2></div>
                                        <div className="svc-feat-grid">
                                            {SERVICES.filter((s) => s.popular).slice(0, 3).map((s) => (
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
                                                            {svcCats.map((c) => <button key={c} className={svcCat === c ? "on" : ""} onClick={() => setSvcCat(c)}>{c}</button>)}
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
                                                    <button className="svc-msg" onClick={() => ping("Opening WhatsApp")}><WhatsApp size={15} /> Message on WhatsApp</button>
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

                                        <div className="pd-sec-head"><h2>Booking questions</h2></div>
                                        <Accordion items={SERVICE_FAQS} open={svcFaq} setOpen={setSvcFaq} />
                                    </div>
                                )}
                                {page === "products" && (
                                    <div className="svc-page">
                                        <p className="svc-intro">Shop the studio's favourites. Delivery across Lagos in 1 to 3 days, with nationwide shipping and Lekki pickup at checkout.</p>

                                        <div className="pd-sec-head"><h2>Best sellers</h2></div>
                                        <div className="svc-feat-grid">
                                            {PRODUCTS.filter((p) => p.popular).slice(0, 3).map((p) => (
                                                <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} badge="Best seller" onView={() => ping("Opening product")} onBuy={() => addBag(p.name)} />
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
                                                        <li><Truck size={14} /> Delivery across Lagos in 1 to 3 days</li>
                                                        <li><MapPin size={14} /> Pickup available in Lekki</li>
                                                    </ul>
                                                    <button className="svc-book-cta" onClick={() => setBag(true)}><ShoppingBag size={16} /> View bag{bagCount > 0 ? ` (${bagCount})` : ""}</button>
                                                    <button className="svc-msg" onClick={() => ping("Opening WhatsApp")}><WhatsApp size={15} /> Ask about a product</button>
                                                </div>
                                            </aside>

                                            <div className="svc-main">
                                                <div className="svc-results-head">
                                                    <b>{prodFiltered.length} {prodFiltered.length === 1 ? "product" : "products"}</b>
                                                    {prodHasFilters && <button className="svc-clear" onClick={clearProd}>Clear filters</button>}
                                                </div>
                                                {prodFiltered.length > 0 ? (
                                                    <div className="svc-grid">
                                                        {prodFiltered.map((p) => <ProductCardRich key={p.id} p={p} colour={prodColor(p.cat)} onView={() => ping("Opening product")} onBuy={() => addBag(p.name)} />)}
                                                    </div>
                                                ) : (
                                                    <div className="svc-empty">No products match your filters.<button onClick={clearProd}>Clear filters</button></div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pd-sec-head"><h2>Delivery and returns</h2></div>
                                        <Accordion items={PRODUCT_FAQS} open={prodFaq} setOpen={setProdFaq} />
                                    </div>
                                )}
                                {page === "reviews" && (
                                    <div className="svc-page">
                                        <p className="svc-intro">Every review here comes from a verified order on Frontstore. The studio can respond, but cannot remove genuine reviews.</p>
                                        <div className="svc-body">
                                            <aside className="svc-rail">
                                                <div className="rev-summary">
                                                    <div className="rev-score">
                                                        <b>{STORE.rating}</b>
                                                        <div className="rev-score-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="f" />)}</div>
                                                        <span>Excellent</span><i>{STORE.reviews} verified reviews</i>
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
                                                <div className="rev-trust"><ShieldCheck size={14} /> Reviews are from verified orders. The studio typically responds in {STORE.reply}.</div>
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
                                )}
                                {page === "blog" && (
                                    <div className="blogp">
                                        <p className="svc-intro">Tips, routines and studio notes from {AUTHOR.name} and the team at {STORE.name}.</p>
                                        <div className="blog-topics">
                                            {["All", ...blogCats].map((c) => (
                                                <button key={c} className={blogCat === c ? "on" : ""} onClick={() => setBlogCat(c)}>{c}</button>
                                            ))}
                                        </div>
                                        <div className="blogp-body">
                                            <div className="blogp-main">
                                                {blogList[0] && (
                                                    <article className="blog-hero" onClick={() => openPost(blogList[0])}>
                                                        <div className={`blog-hero-img c${BLOG.indexOf(blogList[0]) % 3}`}><span className="blog-cat">{blogList[0].cat}</span></div>
                                                        <div className="blog-hero-body">
                                                            <span className="blog-kicker">{blogCat === "All" ? "Latest" : blogCat}</span>
                                                            <h3>{blogList[0].title}</h3>
                                                            <p>{blogList[0].excerpt}</p>
                                                            <div className="blog-meta">
                                                                <span className="blog-author"><span className="blog-author-av">{AUTHOR.initial}</span> {AUTHOR.name}</span>
                                                                <span className="ps-dot">•</span>{blogList[0].date}<span className="ps-dot">•</span>{blogList[0].read} read
                                                            </div>
                                                            <span className="blog-read">Read article <ChevronRight size={15} /></span>
                                                        </div>
                                                    </article>
                                                )}
                                                {blogList.slice(1).length > 0 && (
                                                    <div className="blog-grid">
                                                        {blogList.slice(1).map((b) => (
                                                            <BlogCard key={b.title} b={b} colour={`c${BLOG.indexOf(b) % 3}`} onOpen={() => openPost(b)} />
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
                                                    <div className="author-cred"><Award size={13} /> Over 10 years in bridal, skin and hair</div>
                                                    <button className="author-link" onClick={() => go("about")}>More about {AUTHOR.name.split(" ")[0]} <ChevronRight size={14} /></button>
                                                </div>
                                                <div className="blog-convert">
                                                    <b>Enjoyed the read?</b>
                                                    <p>Book a treatment with the team, or shop the products we reach for.</p>
                                                    <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a treatment</button>
                                                    <button className="blog-convert-ghost" onClick={() => go("products")}>Shop products</button>
                                                </div>
                                            </aside>
                                        </div>
                                    </div>
                                )}
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "post" && articleView()}

                        {page === "portfolio" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>Portfolio</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                <p className="svc-intro">A look at recent work from the studio, from bridal glam to skin and hair. Tap any image to see it larger.</p>
                                {portfolioChips()}
                                <div className="pf-wrap">
                                    <div className="pf-main">{portfolioGrid()}</div>
                                    <aside className="pf-rail">
                                        <div className="blog-convert">
                                            <b>Like what you see?</b>
                                            <p>Book the look or treatment with the team.</p>
                                            <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a treatment</button>
                                            <button className="blog-convert-ghost" onClick={() => go("services")}>Browse services</button>
                                        </div>
                                        {portfolioFollow()}
                                        <div className="pd-railcard trust">
                                            <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                                            <p>Bookings and orders placed through Frontstore are covered by buyer protection the studio cannot remove.</p>
                                        </div>
                                    </aside>
                                </div>
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "about" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>About</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                <div className="ab-wrap">
                                    <div className="ab-main">
                                        <span className="ab-kicker">Our story</span>
                                        <h2 className="ab-headline">A Lagos studio for looking like yourself, on your best day.</h2>
                                        <p className="ab-lede">Vjhenzie Beauty Hub is a Lekki based studio for bridal glam, glass-skin facials and protective styling. We pair a calm, unhurried experience with results that hold up in real life and on camera.</p>
                                        <p className="ab-para">What began in 2016 as a one chair set-up in a Lekki apartment is now a full studio with a small, trusted team. The work has stayed the same throughout: natural, lasting glam, and skin that looks like itself on its best day.</p>
                                        <p className="ab-para">Today the studio looks after brides, busy professionals and regulars who keep coming back for the calm of a private room and results they can count on, whether that is a wedding morning, a big shoot or an everyday refresh.</p>

                                        <div className="ab-founder">
                                            <div className="ab-portrait"><span className="ab-portrait-mono">{AUTHOR.initial}</span><span className="ab-portrait-tag">Founder</span></div>
                                            <div className="ab-founder-body">{aboutFounderBody()}</div>
                                        </div>
                                        {aboutWork()}
                                        {aboutFeatured()}

                                        <div className="ab-section">
                                            <h4 className="ab-subhead">What we offer</h4>
                                            <div className="ab-offer-grid">
                                                {OFFERINGS.map(([t, d, pg]) => (
                                                    <button key={t} className="ab-offer-card" onClick={() => go(pg)}>
                                                        <b>{t}</b>
                                                        <p>{d}</p>
                                                        <span className="ab-offer-link">{pg === "products" ? "Shop products" : "View services"} <ChevronRight size={14} /></span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="ab-approach">
                                            <h4>How we work</h4>
                                            <div className="ab-approach-grid">
                                                <div><span className="ab-num">01</span><b>Consultation first</b><p>Every appointment opens with a short consult so the look suits your skin, your hair and your day.</p></div>
                                                <div><span className="ab-num">02</span><b>Chosen for you</b><p>We only reach for products and styles that genuinely suit you, not whatever is trending this week.</p></div>
                                                <div><span className="ab-num">03</span><b>Made to last</b><p>From bridal glam to protective styles, the work is built to hold up long after you leave the chair.</p></div>
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
                                            <div><b>{STORE.orders}</b><span>orders delivered</span></div>
                                            <div><b>{STORE.rating}</b><span>average rating</span></div>
                                            <div><b>10 yrs</b><span>in practice</span></div>
                                        </div>
                                    </div>

                                    <aside className="ab-rail">
                                        <div className="pd-railcard">
                                            <div className="ab-rail-h"><MapPin size={15} /> Visit the studio</div>
                                            <div className="pd-railmap">Map preview</div>
                                            <p className="ab-addr">{STORE.address}</p>
                                            <div className="ab-open"><Clock size={13} /> Today · {HOURS[todayIdx][1]}</div>
                                            <div className="pd-railbtns">
                                                <button onClick={() => ping("Opening directions")}><Navigation size={14} /> Directions</button>
                                                <button onClick={() => ping("Opening WhatsApp")}><WhatsApp size={14} /> Message</button>
                                            </div>
                                            <div className="ab-follow-rail">
                                                <span>Follow the studio</span>
                                                <div className="ab-follow-icons">
                                                    <button onClick={() => ping("Opening Instagram")} aria-label="Instagram"><Instagram size={17} /></button>
                                                    <button onClick={() => ping("Opening TikTok")} aria-label="TikTok"><Tiktok size={17} /></button>
                                                    <button onClick={() => ping("Opening WhatsApp")} aria-label="WhatsApp"><WhatsApp size={17} /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="blog-convert">
                                            <b>Ready when you are</b>
                                            <p>Book a treatment, or browse the full list of services.</p>
                                            <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a treatment</button>
                                            <button className="blog-convert-ghost" onClick={() => go("services")}>Browse services</button>
                                        </div>

                                        <div className="pd-railcard trust">
                                            <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                                            <p>Bookings and orders placed through Frontstore are covered by buyer protection that the studio cannot remove.</p>
                                        </div>
                                    </aside>
                                </div>
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "faq" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>FAQ</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                <p className="svc-intro">Answers to the questions we are asked most. If you cannot find yours, the studio is a message away.</p>
                                <div className="faq-wrap">
                                    <aside className="faq-rail">
                                        <div className="faq-search">
                                            <Search size={15} />
                                            <input value={faqQuery} onChange={(e) => setFaqQuery(e.target.value)} placeholder="Search questions" />
                                        </div>
                                        <nav className="faq-cats">
                                            {FAQ_GROUPS.map((g) => (
                                                <button key={g.cat} onClick={() => { const el = document.getElementById(faqId(g.cat)); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                                                    <g.icon size={15} /> {g.cat}
                                                </button>
                                            ))}
                                        </nav>
                                        {faqHelp()}
                                        <div className="pd-railcard trust">
                                            <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                                            <p>Payments and orders through Frontstore are covered by buyer protection the studio cannot remove.</p>
                                        </div>
                                    </aside>
                                    <div className="faq-main">{faqSections()}</div>
                                </div>
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "contact" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>Contact</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                <div className="ct-wrap">
                                    <div className="ct-main">
                                        <p className="svc-intro">Reach us on WhatsApp for a quick reply, or send an enquiry and we will get back to you by email. A real person, usually Jane or the team, will answer.</p>
                                        {contactChannels()}
                                        {contactForm()}
                                    </div>
                                    <aside className="ct-rail">
                                        {contactVisit()}
                                        <div className="blog-convert">
                                            <b>Prefer to book?</b>
                                            <p>Skip the message and reserve a treatment in a couple of taps.</p>
                                            <button className="blog-convert-cta" onClick={() => openBooking()}><Calendar size={15} /> Book a treatment</button>
                                            <button className="blog-convert-ghost" onClick={() => go("services")}>Browse services</button>
                                        </div>
                                        <div className="pd-railcard trust">
                                            <div className="pd-trust-h"><ShieldCheck size={15} /> Secured by Frontstore</div>
                                            <p>Payments and orders through Frontstore are covered by buyer protection the studio cannot remove.</p>
                                        </div>
                                    </aside>
                                </div>
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "returns" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>Refunds</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
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
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "privacy" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>Privacy</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                <div className="tm-wrap">
                                    <div className="tm-main">
                                        <p className="tm-intro">This notice explains what {STORE.name} does with your information when you book, buy or get in touch.</p>
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
                                <StoreFoot onNav={go} />
                            </div>
                        )}

                        {page === "terms" && (
                            <div className="pd-listing">
                                <div className="pd-page-head">
                                    <h1>Terms</h1>
                                    <span>frontstore.app/{STORE.slug}</span>
                                </div>
                                <div className="tm-wrap">
                                    <div className="tm-main">
                                        <p className="tm-intro">By booking or buying from {STORE.name} you agree to the terms below, which sit alongside the Frontstore platform terms and buyer protection.</p>
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
                                <StoreFoot onNav={go} />
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
                    <button className={page === "home" ? "on" : ""} onClick={() => go("home")}><Store size={21} /><span>Home</span></button>
                    <button className={page === "services" ? "on" : ""} onClick={() => go("services")}><Calendar size={21} /><span>Services</span></button>
                    <button className="ps-fab" onClick={() => setBag(true)} aria-label="Cart"><span className="ps-fab-ring" /><ShoppingBag size={22} />{bagCount > 0 && <i className="ps-fab-badge">{bagCount}</i>}</button>
                    <button className={page === "products" ? "on" : ""} onClick={() => go("products")}><Package size={21} /><span>Products</span></button>
                    <button className={page === "reviews" ? "on" : ""} onClick={() => go("reviews")}><Star size={21} /><span>Reviews</span></button>
                </nav>
            )}

            {/* search overlay (shared) */}
            {search && (
                <div className="ps-overlay" onClick={() => setSearch(false)}>
                    <div className="ps-search-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-search-top"><Search size={18} /><input autoFocus placeholder={`Search ${STORE.name}`} /><button onClick={() => setSearch(false)}><X size={20} /></button></div>
                        <p className="ps-search-lbl">Popular</p>
                        <div className="ps-chips">{["Bridal Glam", "Glow Facial", "Silk Press", "Vitamin C Serum", "Gel Manicure"].map((c) => (<button key={c} onClick={() => { setSearch(false); ping("Searching " + c); }}>{c}</button>))}</div>
                    </div>
                </div>
            )}

            {/* booking flow (shared) */}
            {bookOpen && bookingFlow()}

            {/* bag sheet (shared) */}
            {bag && (
                <Sheet onClose={() => setBag(false)} title="Your bag">
                    <div className="ps-bag-line"><span className="ps-bag-th"><Store size={16} /></span><div><b>Hydrating Glow Facial Kit</b><span>{money(18500)}</span></div><div className="ps-qty"><button><Minus size={14} /></button><b>1</b><button><Plus size={14} /></button></div></div>
                    <div className="ps-bag-line"><span className="ps-bag-th"><Store size={16} /></span><div><b>Vitamin C Serum</b><span>{money(14000)}</span></div><div className="ps-qty"><button><Minus size={14} /></button><b>1</b><button><Plus size={14} /></button></div></div>
                    <div className="ps-bag-total"><span>Total</span><b>{money(32500)}</b></div>
                    <button className="ps-sheet-cta" onClick={() => { setBag(false); ping("Going to checkout"); }}>Pay securely</button>
                    <p className="ps-deposit center"><WhatsApp size={12} /> Your receipt arrives on WhatsApp.</p>
                </Sheet>
            )}

            {/* share sheet (shared) */}
            {share && (
                <Sheet onClose={() => setShare(false)} title="Share this store">
                    <div className="ps-share-url"><span>frontstore.app/{STORE.slug}</span><button onClick={() => { navigator.clipboard?.writeText(`frontstore.app/${STORE.slug}`); ping("Link copied"); }}><Copy size={15} /></button></div>
                    <button className="ps-share-wa" onClick={() => { setShare(false); ping("Sharing to WhatsApp"); }}><WhatsApp size={18} /> Share on WhatsApp</button>
                    <div className="ps-share-row"><button onClick={() => ping("Instagram")}><Instagram size={18} /> Instagram</button><button onClick={() => ping("Facebook")}><Facebook size={18} /> Facebook</button></div>
                </Sheet>
            )}

            {/* notify opt-in (shared) */}
            {notifyOpen && (
                <Sheet onClose={() => setNotifyOpen(false)} title={`Get updates from ${STORE.name}`}>
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
                    <button className="ps-sheet-cta" disabled={!notifyPhone.trim() || notifyTopics.length === 0} onClick={() => { setNotifyOpen(false); ping(`You will get updates from ${STORE.name}`); }}><Bell size={16} /> Notify me</button>
                </Sheet>
            )}

            {reviewOpen && (
                <Sheet onClose={() => setReviewOpen(false)} title="Leave a review">
                    <p className="rev-form-note"><ShieldCheck size={13} /> Reviews come from verified orders. Add your order reference so we can confirm it.</p>
                    <p className="ps-field-lbl">Your rating</p>
                    <div className="rev-rate">{Array.from({ length: 5 }).map((_, i) => (
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
        </div>
    );
}

/* ---- shared pure components ---- */
function SectionHead({ title, action, onAction }) {
    return (<div className="ps-sec-head"><h2>{title}</h2>{action && <button onClick={onAction}>{action}</button>}</div>);
}
function ServiceCard({ s, onBook }) {
    return (<div className="ps-card"><div className="ps-card-thumb svc"><Calendar size={22} /></div>
        <div className="ps-card-body"><b>{s.name}</b><span className="ps-card-sub"><Clock size={12} /> {s.dur}</span>
            <div className="ps-card-foot"><em>{money(s.price)}</em><button className="ps-mini book" onClick={onBook}>Book</button></div></div></div>);
}
function ProductCard({ p, onBuy }) {
    return (<div className="ps-card"><div className="ps-card-thumb prod"><ShoppingBag size={22} /></div>
        <div className="ps-card-body"><b>{p.name}</b>
            <div className="ps-card-foot"><em>{money(p.price)}</em><button className="ps-mini buy" onClick={onBuy}>Buy</button></div></div></div>);
}
function BlogCard({ b, colour, onOpen }) {
    return (
        <div className="blog-card" onClick={onOpen}>
            <div className={`blog-img ${colour}`}><span className="blog-cat">{b.cat}</span></div>
            <div className="blog-body">
                <span className="blog-date">By {AUTHOR.name} · {b.read} · {b.date}</span>
                <b>{b.title}</b>
                <p>{b.excerpt}</p>
                <span className="blog-read">Read article <ChevronRight size={14} /></span>
            </div>
        </div>
    );
}

function ServiceCardRich({ s, onBook, colour, badge }) {
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
                <div className="svc-card-foot"><em>{money(s.price)}</em><span className="svc-card-book">Book <ChevronRight size={14} /></span></div>
            </div>
        </div>
    );
}
function ProductCardRich({ p, onView, onBuy, colour, badge }) {
    return (
        <div className="svc-card" onClick={onView}>
            <div className={`svc-card-thumb ${colour || "c0"}`}>
                <ShoppingBag size={24} />
                {badge && <span className="svc-badge"><Star size={11} /> {badge}</span>}
                <span className="svc-card-cat">{p.cat}</span>
            </div>
            <div className="svc-card-body">
                <b>{p.name}</b>
                <p className="svc-card-desc">{p.desc}</p>
                <div className="svc-card-foot"><em>{money(p.price)}</em>
                    <button className="svc-card-book" onClick={(e) => { e.stopPropagation(); onBuy(); }}>Buy</button></div>
            </div>
        </div>
    );
}
function FeaturedCard({ f, onAction }) {
    return (
        <div className="feat-card">
            <div className={`feat-thumb ${f.type}`}>
                {f.type === "service" ? <Calendar size={26} /> : <ShoppingBag size={26} />}
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
function ReviewCardRich({ rv }) {
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
            {rv.photos > 0 && <div className="rev-card-photos">{Array.from({ length: rv.photos }).map((_, i) => <span key={i} className={`rev-ph c${i % 3}`} />)}</div>}
            {rv.response && (
                <div className="rev-response">
                    <div className="rev-response-head"><span className="rev-resp-av">{STORE.initial}</span><b>Response from the studio</b><span>{rv.response.when}</span></div>
                    <p>{rv.response.text}</p>
                </div>
            )}
        </div>
    );
}
function ReviewCard({ rv, full }) {
    return (<div className={`ps-review ${full ? "full" : ""}`}>
        <div className="ps-review-top"><span className="ps-review-av">{rv.name[0]}</span><div><b>{rv.name}</b><span>{rv.when}</span></div></div>
        <div className="ps-review-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < rv.r ? "f" : ""} />)}</div>
        <p>{rv.text}</p></div>);
}
function RatingSummary() {
    const bars = [["5", 80], ["4", 14], ["3", 3], ["2", 2], ["1", 1]];
    return (<div className="ps-rating">
        <div className="ps-rating-score"><b>{STORE.rating}</b>
            <div className="ps-rating-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className="f" />)}</div>
            <span>Excellent</span><i>{STORE.reviews} reviews</i></div>
        <div className="ps-rating-bars">{bars.map(([n, w]) => (<div key={n} className="ps-bar"><span>{n}</span><div><i style={{ width: w + "%" }} /></div></div>))}</div></div>);
}
function Accordion({ items, open, setOpen }) {
    return (<div className="ps-acc">{items.map(([q, a], i) => (
        <div key={i} className={`ps-acc-item ${open === i ? "open" : ""}`}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>{q}<ChevronDown size={17} /></button>
            {open === i && <p>{a}</p>}</div>))}</div>);
}
function LockedFrontstorePanel({ title, body, link }) {
    return (<div className="ps-locked">
        <div className="ps-locked-top"><ShieldCheck size={16} /><b>{title}</b><Lock size={13} className="ps-locked-lock" /></div>
        <p>{body}</p>{link && <button className="ps-locked-link">{link} <ChevronRight size={14} /></button>}</div>);
}
function StoreFoot({ onNav }) {
    return (<footer className="ps-foot">
        <span className="ps-foot-secure"><Lock size={13} /> Secured by Frontstore</span>
        <p>Buyer protection and platform terms apply to every order on this store.</p>
        <div className="ps-foot-links">{LEGAL.map(([id, label]) => <button key={id} onClick={() => onNav && onNav(id)}>{label}</button>)}<button>Platform terms</button><button>Report this store</button></div>
        <small>frontstore.app/{STORE.slug}</small></footer>);
}
function Sub({ title, children }) {
    return (<div className="ps-sub"><div className="ps-sub-head"><h1>{title}</h1><span>frontstore.app/{STORE.slug}</span></div>{children}</div>);
}
function Sheet({ title, children, onClose, onBack }) {
    return (<div className="ps-overlay" onClick={onClose}>
        <div className="ps-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ps-sheet-grip" /><div className="ps-sheet-head">{onBack ? <button className="ps-sheet-back" onClick={onBack} aria-label="Back"><ChevronLeft size={20} /></button> : <span className="ps-sheet-back-sp" />}<b>{title}</b><button onClick={onClose} aria-label="Close"><X size={20} /></button></div>
            {children}</div></div>);
}

const css = `
.ps-root{--brand:#b14a6e;--brand-deep:#7c2f4d;--gold:#c79a4b;--bg:#faf4ef;--card:#fff;--ink:#2a1d22;
  --muted:#8a7680;--line:#efe1da;--ok:#1f9d57;--wa:#25d366;
  font-family:'Hanken Grotesk',system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;}
.ps-root *{box-sizing:border-box;}
.ps-root :where(button){font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;padding:0;}
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');

.ps-logo{font-weight:800;font-size:19px;letter-spacing:-.02em;color:var(--ink);flex:1;text-align:left;}
.ps-logo span{color:var(--brand);}
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
.ps-url{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--brand-deep);background:#f6e8ee;padding:7px 12px;border-radius:9px;margin-top:11px;}
.ps-id-actions-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:11px;}
.ps-id-actions-row .ps-url{margin-top:0;}
.ps-notify{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#fff;background:var(--brand);padding:8px 13px;border-radius:9px;box-shadow:0 4px 12px rgba(177,74,110,.28);cursor:pointer;}
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
.ps-card-thumb{height:108px;display:grid;place-items:center;color:#fff;}
.ps-card-thumb.svc{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.ps-card-thumb.prod{background:linear-gradient(150deg,#caa06f,var(--gold));}
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
.bk-thumb.c0{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.bk-thumb.c1{background:linear-gradient(150deg,var(--brand-deep),var(--gold));}
.bk-thumb.c2{background:linear-gradient(150deg,#caa06f,var(--brand));}
.bk-thumb.c3{background:linear-gradient(150deg,var(--brand),#a86b8a);}
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
.bk-input{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--card);font-size:14px;color:var(--ink);font-family:inherit;}
.bk-input:focus{outline:none;border-color:var(--brand);}
.bk-textarea{min-height:64px;resize:vertical;line-height:1.5;}
.bk-deposit-row{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding:12px 14px;background:#f6e8ee;border:1px solid #e6c9d5;border-radius:12px;}
.bk-deposit-row span{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--brand-deep);}
.bk-deposit-row b{font-size:16px;font-weight:800;color:var(--brand-deep);font-family:'Fraunces';}
.bk-ghost{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:9px;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--card);font-size:13.5px;font-weight:700;color:var(--ink);cursor:pointer;}
.bk-ghost:hover{border-color:var(--brand);color:var(--brand);}
.ps-bag-line{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--line);}
.ps-bag-th{width:42px;height:42px;border-radius:11px;flex:0 0 auto;background:linear-gradient(150deg,#f0dfe6,#e7cdb6);color:var(--brand-deep);display:grid;place-items:center;}
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
.ps-search-lbl{font-size:12px;font-weight:700;color:#5f4d55;margin-bottom:9px;}
.ps-share-url{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 14px;margin-bottom:12px;font-size:13.5px;font-weight:600;color:var(--brand-deep);}
.ps-share-url button{width:32px;height:32px;border-radius:8px;background:#f4e9e4;color:var(--brand);display:grid;place-items:center;}
.ps-share-wa{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--wa);color:#fff;font-weight:700;font-size:15px;padding:13px;border-radius:12px;}
.ps-share-row{display:flex;gap:10px;margin-top:10px;}
.ps-share-row button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:600;padding:12px;border-radius:11px;border:1px solid var(--line);color:var(--brand-deep);}

.ps-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);background:#2a1d22;color:#fff;font-size:13px;font-weight:600;padding:11px 18px;border-radius:11px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:90;animation:pstoast .2s;}
@keyframes pstoast{from{opacity:0;transform:translate(-50%,8px);}to{opacity:1;transform:translate(-50%,0);}}

/* ===================== DESKTOP ===================== */
.pd-wrap{min-height:100vh;}
.pd-header{position:sticky;top:0;z-index:40;height:64px;display:flex;align-items:center;gap:22px;padding:0 30px;background:rgba(250,244,239,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.pd-search{flex:1;max-width:440px;display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:10px 14px;color:var(--muted);font-size:14px;}
.pd-header-actions{margin-left:auto;display:flex;align-items:center;gap:10px;}
.pd-hicon{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;color:var(--ink);position:relative;}
.pd-hicon i{position:absolute;top:-5px;right:-5px;background:var(--brand);color:#fff;font-size:10px;font-weight:800;font-style:normal;min-width:17px;height:17px;border-radius:9px;display:grid;place-items:center;padding:0 4px;}
.pd-head-book{display:flex;align-items:center;gap:7px;background:var(--brand);color:#fff;font-weight:700;font-size:14px;padding:11px 18px;border-radius:12px;box-shadow:0 5px 14px rgba(177,74,110,.3);}

.pd-container{max-width:1200px;margin:0 auto;padding:24px 30px 64px;}
.pd-cover{position:relative;}
.pd-cover-art{height:300px;border-radius:22px;overflow:hidden;background:linear-gradient(125deg,var(--brand-deep),var(--brand) 52%,var(--gold));position:relative;}
.pd-cover-icn{position:absolute;right:30px;bottom:-60px;width:400px;height:400px;color:#fff;opacity:.19;pointer-events:none;
  -webkit-mask-image:radial-gradient(circle at 55% 42%,#000 34%,transparent 72%);mask-image:radial-gradient(circle at 55% 42%,#000 34%,transparent 72%);}
.pd-identity{display:flex;align-items:flex-end;gap:22px;padding:0 28px;margin-top:-46px;position:relative;}
.pd-avatar{width:128px;height:128px;border-radius:30px;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:56px;display:grid;place-items:center;border:6px solid var(--bg);box-shadow:0 10px 28px rgba(124,47,77,.22);}
.pd-identity-main{flex:1;padding-bottom:8px;min-width:0;}
.pd-identity-main h1{font-family:'Fraunces';font-weight:700;font-size:32px;letter-spacing:-.02em;display:flex;align-items:center;gap:8px;}
.pd-identity-main p{display:flex;align-items:center;flex-wrap:wrap;gap:4px;font-size:13.5px;color:var(--muted);margin-top:6px;}
.pd-identity-main p>span{display:inline-flex;align-items:center;gap:4px;}
.pd-identity-actions{display:flex;gap:10px;padding-bottom:10px;flex:0 0 auto;}
.pd-book{display:flex;align-items:center;gap:7px;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:12px 22px;border-radius:12px;box-shadow:0 6px 16px rgba(177,74,110,.3);}
.pd-book:active{transform:translateY(2px);}
.pd-ghost{display:flex;align-items:center;gap:7px;font-weight:600;font-size:14px;padding:12px 18px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--brand-deep);}

.pd-tabs{position:sticky;top:64px;z-index:20;display:flex;gap:3px;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 4px;margin:22px 0 26px;overflow-x:auto;scrollbar-width:none;}
.pd-tabs::-webkit-scrollbar{display:none;}
.pd-tabs button{font-size:14px;font-weight:600;padding:10px 16px;border-radius:10px;color:#5f4d55;white-space:nowrap;}
.pd-tabs button:hover{background:#f3e7e1;}
.pd-tabs button.on{background:#f6e8ee;color:var(--brand-deep);font-weight:700;}

.pd-home{display:grid;grid-template-columns:332px 1fr;gap:26px;align-items:start;}
.pd-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.pd-railcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.pd-railcard h3{font-family:'Fraunces';font-weight:600;font-size:16px;margin-bottom:10px;}
.pd-railcard>p{font-size:13px;line-height:1.55;color:#4f3f46;}
.pd-raillink{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:11px;}
.pd-railmap{height:120px;border-radius:12px;background:repeating-linear-gradient(45deg,#ece0d9,#ece0d9 12px,#e6d8d0 12px,#e6d8d0 24px);display:grid;place-items:center;color:var(--brand-deep);margin-bottom:12px;}
.pd-railbtns{display:flex;gap:8px;margin:12px 0;}
.pd-railbtns button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12.5px;font-weight:600;padding:9px;border-radius:10px;border:1px solid var(--line);color:var(--brand-deep);}
.pd-railcard.trust{background:#f6e8ee;border-color:#e6c9d5;}
.pd-trust-h{display:flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;color:var(--brand-deep);}
.pd-railcard.trust p{font-size:12px;line-height:1.55;color:#6e545d;margin-top:8px;}

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
.pd-filter button{font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:#4f3f46;}
.pd-listing .ps-card-thumb{height:150px;}

.pd-narrow{max-width:760px;}

/* ===================== FEATURED + BLOG (shared) ===================== */
.feat{margin-bottom:22px;}
.feat-head{margin-bottom:12px;}
.feat-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--brand-deep);background:#f6e8ee;padding:5px 11px;border-radius:8px;}
.feat-tag svg{color:var(--gold);}
.feat-grid{display:flex;gap:13px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
.feat-grid::-webkit-scrollbar{display:none;}
.feat-card{flex:0 0 76%;max-width:280px;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 8px 22px rgba(124,47,77,.08);display:flex;flex-direction:column;}
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
.feat-cta{font-size:13px;font-weight:700;padding:8px 18px;border-radius:10px;color:#fff;background:var(--brand);box-shadow:0 4px 10px rgba(177,74,110,.3);}
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
.blog-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(124,47,77,.1);}
.blog-img{height:150px;position:relative;}
.blog-img.c0{background:linear-gradient(135deg,var(--brand-deep),var(--brand));}
.blog-img.c1{background:linear-gradient(135deg,var(--brand),var(--gold));}
.blog-img.c2{background:linear-gradient(135deg,#caa06f,var(--brand-deep));}
.blog-cat{position:absolute;top:11px;left:11px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;
  color:var(--brand-deep);background:rgba(255,255,255,.92);padding:4px 9px;border-radius:7px;}
.blog-body{padding:14px 15px 15px;display:flex;flex-direction:column;flex:1;}
.blog-date{font-size:11.5px;color:var(--muted);}
.blog-body b{display:block;font-family:'Fraunces';font-weight:600;font-size:17px;line-height:1.28;margin:4px 0 6px;letter-spacing:-.01em;}
.blog-body p{font-size:13px;color:#6e545d;line-height:1.5;}
.blog-read{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:12px;}
.blog-topics{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;}
.blog-topics button{font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:#4f3f46;}
.blog-topics button.on{background:var(--brand);color:#fff;border-color:var(--brand);}
.blogp-body{display:grid;grid-template-columns:1fr 300px;gap:26px;align-items:start;}
.blogp-main{min-width:0;}
.blogp-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.blog-hero{display:grid;grid-template-columns:44% 1fr;background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;cursor:pointer;margin-bottom:24px;transition:transform .12s,box-shadow .12s;}
.blog-hero:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(124,47,77,.1);}
.blog-hero-img{position:relative;min-height:230px;}
.blog-hero-img.c0{background:linear-gradient(135deg,var(--brand-deep),var(--brand));}
.blog-hero-img.c1{background:linear-gradient(135deg,var(--brand),var(--gold));}
.blog-hero-img.c2{background:linear-gradient(135deg,#caa06f,var(--brand-deep));}
.blog-hero-body{padding:24px;display:flex;flex-direction:column;justify-content:center;}
.blog-kicker{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);}
.blog-hero-body h3{font-family:'Fraunces';font-weight:700;font-size:25px;line-height:1.2;letter-spacing:-.01em;margin:8px 0 10px;}
.blog-hero-body>p{font-size:14px;color:#5f4d55;line-height:1.55;}
.blog-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--muted);margin:14px 0 16px;}
.blog-author{display:inline-flex;align-items:center;gap:6px;font-weight:700;color:var(--ink);}
.blog-author-av{width:22px;height:22px;border-radius:50%;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;}
.author-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.author-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.author-av{width:48px;height:48px;border-radius:50%;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:22px;display:grid;place-items:center;}
.author-top b{display:block;font-size:15px;font-weight:700;}
.author-top span{font-size:12px;color:var(--brand-deep);font-weight:600;}
.author-card>p{font-size:12.5px;line-height:1.55;color:#5f4d55;}
.author-cred{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--brand-deep);margin-top:11px;}
.author-cred svg{color:var(--gold);flex:0 0 auto;}
.author-link{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);margin-top:12px;}
.blog-convert{background:#f6e8ee;border:1px solid #e6c9d5;border-radius:16px;padding:17px;}
.blog-convert>b{font-family:'Fraunces';font-weight:600;font-size:16px;}
.blog-convert>p{font-size:12.5px;color:#6e545d;line-height:1.5;margin:6px 0 13px;}
.blog-convert-cta{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px;border-radius:11px;box-shadow:0 6px 14px rgba(177,74,110,.28);}
.blog-convert-ghost{display:block;width:100%;text-align:center;font-size:13px;font-weight:700;color:var(--brand-deep);padding:10px;margin-top:8px;}

/* about page */
.ab-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.ab-main{min-width:0;}
.ab-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.ab-kicker{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--brand);}
.ab-headline{font-family:'Fraunces';font-weight:600;font-size:38px;line-height:1.1;letter-spacing:-.02em;margin:9px 0 14px;max-width:none;}
.ab-lede{font-size:15.5px;line-height:1.6;color:#5f4d55;max-width:none;}
.ab-founder{display:grid;grid-template-columns:300px 1fr;gap:26px;align-items:start;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;margin:28px 0;}
.ab-portrait{position:relative;aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:linear-gradient(155deg,var(--brand-deep),var(--brand) 55%,var(--gold));display:grid;place-items:center;}
.ab-portrait-mono{font-family:'Fraunces';font-weight:600;font-size:84px;color:rgba(255,255,255,.32);}
.ab-portrait-tag{position:absolute;left:12px;bottom:12px;font-size:11px;font-weight:700;color:var(--brand-deep);background:rgba(255,255,255,.92);padding:5px 11px;border-radius:20px;}
.ab-founder-body .ab-kicker{display:block;}
.ab-name{font-family:'Fraunces';font-weight:700;font-size:24px;letter-spacing:-.01em;margin:7px 0 2px;}
.ab-role{display:block;font-size:13px;font-weight:600;color:var(--brand-deep);}
.ab-bio{font-size:14px;line-height:1.6;color:#5f4d55;margin:13px 0;}
.ab-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}
.ab-chips span{font-size:11.5px;font-weight:600;color:var(--brand-deep);background:#f6e8ee;border:1px solid #ecd2dd;padding:5px 11px;border-radius:16px;}
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
.ab-approach-grid p{font-size:13px;line-height:1.55;color:#5f4d55;}
.ab-stats{margin-top:6px;}
.ab-rail-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--brand-deep);margin-bottom:12px;}
.ab-addr{font-size:13px;line-height:1.5;color:#4f3f46;margin:12px 0 8px;}
.ab-open{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--brand-deep);margin-bottom:4px;}
.ab-follow-rail{border-top:1px solid var(--line);margin-top:14px;padding-top:14px;}
.ab-follow-rail>span{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:10px;}
.ab-follow-icons{display:flex;gap:9px;}
.ab-follow-icons button{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:#f6e8ee;border:1px solid #ecd2dd;color:var(--brand-deep);transition:background .12s,color .12s;}
.ab-follow-icons button:hover{background:var(--brand);color:#fff;border-color:var(--brand);}
/* about, mobile body additions */
.ab-founder-m{display:block;background:transparent;border:0;border-radius:0;padding:0;margin:18px 0;}
.ab-founder-m .ab-portrait{aspect-ratio:4/3;margin-bottom:16px;}
.ab-founder-m .ab-portrait-mono{font-size:72px;}
.ab-follow{border-top:1px solid var(--line);margin-top:18px;padding-top:16px;}
.ab-follow-h{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:11px;}
.ab-book-m{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:18px;background:var(--brand);color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:13px;box-shadow:0 8px 18px rgba(177,74,110,.3);}
.ab-para{font-size:14.5px;line-height:1.65;color:#5f4d55;max-width:none;margin-top:13px;}
.ab-section{margin:28px 0;}
.ab-subhead{font-family:'Fraunces';font-weight:600;font-size:20px;margin-bottom:16px;}
.ab-offer-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ab-offer-card{text-align:left;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;cursor:pointer;transition:transform .12s,box-shadow .12s,border-color .12s;}
.ab-offer-card:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(124,47,77,.09);border-color:#e6c9d5;}
.ab-offer-card b{display:block;font-size:15.5px;font-weight:700;margin-bottom:6px;}
.ab-offer-card p{font-size:13px;line-height:1.55;color:#5f4d55;margin-bottom:11px;}
.ab-offer-link{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);}
.ab-facts{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden;}
.ab-fact{background:var(--card);padding:15px 17px;display:flex;flex-direction:column;gap:3px;}
.ab-fact-k{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);}
.ab-fact-v{font-size:13.5px;color:#4f3f46;line-height:1.45;}
.ab-grid-m{grid-template-columns:1fr;}
.ab-facts-m{grid-template-columns:1fr;}
.ab-verified{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--brand-deep);background:#f6e8ee;border:1px solid #ecd2dd;padding:4px 10px;border-radius:16px;margin-top:8px;}
.ab-verified svg{color:var(--brand);}
.ab-creds{margin:15px 0 4px;}
.ab-creds-h{display:block;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:9px;}
.ab-creds ul{display:flex;flex-direction:column;gap:7px;}
.ab-creds li{display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:1.45;color:#4f3f46;}
.ab-creds li svg{color:var(--brand);flex:0 0 auto;margin-top:2px;}
.ab-sec-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:16px;}
.ab-sec-head .ab-subhead{margin-bottom:0;}
.ab-seclink{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:700;color:var(--brand);flex:0 0 auto;}
.ab-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.ab-shot{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;cursor:pointer;display:block;transition:transform .12s,box-shadow .12s;}
.ab-shot:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(124,47,77,.14);}
.ab-shot.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.ab-shot.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.ab-shot.c2{background:linear-gradient(150deg,#caa06f,var(--brand-deep));}
.ab-shot-cap{position:absolute;left:11px;bottom:11px;font-size:11.5px;font-weight:700;color:#fff;background:rgba(60,20,36,.42);backdrop-filter:blur(2px);padding:5px 10px;border-radius:14px;}
.ab-featured{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:28px 0;}
.ab-featured-h{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);}
.ab-featured-h svg{color:var(--gold);}
.ab-featured-row{display:flex;flex-wrap:wrap;gap:22px;align-items:center;margin-top:14px;}
.ab-logo{font-family:'Fraunces';font-weight:600;font-size:16px;color:var(--brand-deep);opacity:.78;letter-spacing:-.01em;}
.ab-review{position:relative;background:#f6e8ee;border:1px solid #e6c9d5;border-radius:18px;padding:24px;margin:28px 0;}
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
.ab-journal-item:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(124,47,77,.09);border-color:#e6c9d5;}
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
.faq-cats button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font-size:13px;font-weight:600;color:#4f3f46;padding:10px 11px;border-radius:9px;transition:background .12s,color .12s;}
.faq-cats button:hover{background:#f6e8ee;color:var(--brand-deep);}
.faq-cats button svg{color:var(--brand);flex:0 0 auto;}
.faq-help{background:#f6e8ee;border:1px solid #e6c9d5;border-radius:16px;padding:17px;}
.faq-help>b{font-family:'Fraunces';font-weight:600;font-size:16px;}
.faq-help>p{font-size:12.5px;color:#6e545d;line-height:1.5;margin:6px 0 13px;}
.faq-help-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:13.5px;padding:11px;border-radius:11px;box-shadow:0 6px 14px rgba(177,74,110,.28);}
.faq-groups{display:flex;flex-direction:column;gap:26px;}
.faq-group{scroll-margin-top:130px;}
.faq-group-head{display:flex;align-items:center;gap:9px;font-family:'Fraunces';font-weight:600;font-size:19px;margin-bottom:13px;}
.faq-group-head svg{color:var(--brand);flex:0 0 auto;}
.faq-empty{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:18px;font-size:13.5px;color:#5f4d55;}
.faq-search-m{margin-bottom:18px;}

/* contact page */
.ct-wrap{display:grid;grid-template-columns:1fr 340px;gap:30px;align-items:start;}
.ct-main{min-width:0;}
.ct-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.ct-channels{margin:4px 0 26px;}
.ct-wa{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:15.5px;padding:15px;border-radius:13px;box-shadow:0 8px 18px rgba(177,74,110,.3);}
.ct-alt{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;}
.ct-alt button{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:var(--ink);background:var(--card);border:1px solid var(--line);padding:10px 14px;border-radius:11px;transition:border-color .12s,color .12s;}
.ct-alt button:hover{border-color:var(--brand);color:var(--brand);}
.ct-alt button svg{color:var(--brand);flex:0 0 auto;}
.ct-form{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px;}
.ct-form .ab-subhead{margin-bottom:4px;}
.ct-form-sub{font-size:13px;line-height:1.5;color:#5f4d55;margin-bottom:15px;}
.ct-form-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.ct-input{width:100%;font-family:inherit;font-size:14px;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:12px 13px;outline:none;margin-bottom:11px;}
.ct-input::placeholder{color:#a78d97;}
.ct-input:focus{border-color:var(--brand);}
select.ct-input{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b14a6e' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 12px center;padding-right:34px;cursor:pointer;}
.ct-textarea{resize:vertical;min-height:96px;line-height:1.5;}
.ct-send{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14px;padding:13px;border-radius:11px;box-shadow:0 6px 14px rgba(177,74,110,.28);}
.ct-form-note{font-size:12px;color:var(--muted);line-height:1.5;margin-top:11px;}
.ct-visit{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.ct-map{position:relative;height:148px;border-radius:13px;overflow:hidden;border:1px solid var(--line);background:#f1e7e0;margin-bottom:13px;}
.ct-map::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,#e4d6cd 0 1.5px,transparent 1.5px 34px),repeating-linear-gradient(0deg,#e4d6cd 0 1.5px,transparent 1.5px 34px);}
.ct-map::after{content:"";position:absolute;left:-10%;top:58%;width:120%;height:9px;background:#ecdcd2;transform:rotate(-16deg);}
.ct-map-pin{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-45deg);display:grid;place-items:center;width:34px;height:34px;border-radius:50% 50% 50% 0;background:var(--brand);color:#fff;box-shadow:0 6px 13px rgba(124,47,77,.4);}
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
.ct-hours-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 13px;font-size:12.5px;color:#5f4d55;}
.ct-hours-list li+li{border-top:1px solid var(--line);}
.ct-hours-list li b{font-weight:600;color:#4f3f46;}
.ct-hours-list li.today{background:#f6e8ee;color:var(--brand-deep);}
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
.rf-list li{display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.55;color:#4f3f46;}
.rf-list li svg{color:var(--brand);flex:0 0 auto;margin-top:3px;}
.rf-keys{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:17px;}
.rf-keys-h{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:13px;}
.rf-keys ul{display:flex;flex-direction:column;gap:13px;}
.rf-keys li{display:flex;align-items:flex-start;gap:11px;}
.rf-keys li svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}
.rf-keys li b{display:block;font-size:13.5px;font-weight:700;}
.rf-keys li span{font-size:12.5px;color:#5f4d55;}
.rf-related{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:8px;}
.rf-related-h{display:block;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:9px 11px 7px;}
.rf-related button{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:13.5px;font-weight:600;color:#4f3f46;padding:11px;border-radius:10px;transition:background .12s,color .12s;}
.rf-related button:hover{background:#f6e8ee;color:var(--brand-deep);}
.rf-related button svg{color:var(--brand);}

/* terms page */
.tm-wrap{display:grid;grid-template-columns:1fr 260px;gap:34px;align-items:start;}
.tm-main{min-width:0;}
.tm-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:14px;}
.tm-intro{font-size:15px;line-height:1.6;color:#5f4d55;max-width:70ch;}
.tm-section{max-width:70ch;margin-top:26px;scroll-margin-top:130px;}
.tm-section h3{font-family:'Fraunces';font-weight:600;font-size:20px;letter-spacing:-.01em;margin-bottom:10px;}
.tm-section p{font-size:14px;line-height:1.65;color:#4f3f46;margin-bottom:10px;}
.tm-link{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:var(--brand);margin-top:2px;}
.tm-contents{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:9px;}
.tm-contents-h{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:8px 10px 7px;}
.tm-contents nav{display:flex;flex-direction:column;}
.tm-contents button{text-align:left;font-size:12.5px;font-weight:600;color:#4f3f46;padding:8px 10px;border-radius:8px;transition:background .12s,color .12s;}
.tm-contents button:hover{background:#f6e8ee;color:var(--brand-deep);}
.tm-meta{font-size:12px;color:var(--muted);padding:0 2px;}
.tm-body-m .tm-section,.tm-body-m .tm-intro{max-width:none;}

/* portfolio page */
.pf-wrap{display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;}
.pf-main{min-width:0;}
.pf-rail{position:sticky;top:132px;display:flex;flex-direction:column;gap:16px;}
.pf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.pf-shot{position:relative;aspect-ratio:4/5;border-radius:14px;overflow:hidden;cursor:pointer;display:block;transition:transform .12s,box-shadow .12s;}
.pf-shot:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(124,47,77,.16);}
.pf-shot::before{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(40,12,24,.5),transparent 46%);}
.pf-shot.c0{background:linear-gradient(150deg,var(--brand-deep),var(--brand));}
.pf-shot.c1{background:linear-gradient(150deg,var(--brand),var(--gold));}
.pf-shot.c2{background:linear-gradient(150deg,#caa06f,var(--brand-deep));}
.pf-shot.ba::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.55);}
.pf-ba{position:absolute;top:10px;left:0;right:0;display:flex;justify-content:space-between;padding:0 10px;}
.pf-ba-h{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#fff;background:rgba(60,20,36,.42);padding:3px 8px;border-radius:10px;}
.pf-shot-cap{position:absolute;left:12px;bottom:11px;}
.pf-shot-cap b{display:block;font-size:13px;font-weight:700;color:#fff;}
.pf-shot-cap span{font-size:11px;color:rgba(255,255,255,.85);}
@media(max-width:979px){
  .pf-grid{grid-template-columns:repeat(2,1fr);}
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
.svc-intro{font-size:14px;color:#6e545d;line-height:1.5;margin:-4px 0 24px;max-width:620px;}
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
.svc-fgroup h4{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#8a7680;margin-bottom:8px;}
.svc-radios{display:flex;flex-direction:column;gap:1px;}
.svc-radios button{text-align:left;font-size:13.5px;font-weight:500;padding:8px 10px;border-radius:9px;color:#4f3f46;}
.svc-radios button:hover{background:#f3e7e1;}
.svc-radios button.on{background:#f6e8ee;color:var(--brand-deep);font-weight:700;}
.svc-book-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 8px 22px rgba(124,47,77,.06);}
.svc-open{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ok);}
.svc-next{font-size:13px;color:#5f4d55;margin:10px 0 14px;}
.svc-next b{color:var(--ink);}
.svc-book-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:12px;border-radius:12px;box-shadow:0 6px 16px rgba(177,74,110,.3);}
.svc-book-cta:active{transform:translateY(2px);}
.svc-msg{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;font-weight:600;font-size:13.5px;padding:11px;border-radius:11px;border:1px solid var(--line);color:var(--brand-deep);margin-top:9px;}
.svc-results-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;}
.svc-results-head b{font-size:14.5px;font-weight:700;}
.svc-clear{font-size:12.5px;font-weight:700;color:var(--brand);}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:16px;}
.svc-empty{background:var(--card);border:1px dashed var(--line);border-radius:14px;padding:44px 20px;text-align:center;font-size:14px;color:var(--muted);}
.svc-empty button{color:var(--brand);font-weight:700;margin-left:5px;}
.svc-card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:transform .12s,box-shadow .12s;}
.svc-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(124,47,77,.1);}
.svc-card-thumb{height:128px;position:relative;display:grid;place-items:center;color:#fff;}
.svc-card-thumb.c0{background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.svc-card-thumb.c1{background:linear-gradient(150deg,var(--brand-deep),var(--gold));}
.svc-card-thumb.c2{background:linear-gradient(150deg,#caa06f,var(--brand));}
.svc-card-thumb.c3{background:linear-gradient(150deg,var(--brand),#a86b8a);}
.svc-card-cat{position:absolute;bottom:10px;left:10px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--brand-deep);background:rgba(255,255,255,.92);padding:4px 9px;border-radius:7px;}
.svc-badge{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#fff;background:rgba(42,29,34,.5);backdrop-filter:blur(2px);padding:4px 8px;border-radius:7px;}
.svc-badge svg{color:var(--gold);fill:var(--gold);}
.svc-card-body{padding:13px 14px 14px;display:flex;flex-direction:column;flex:1;}
.svc-card-body>b{font-size:15px;font-weight:700;line-height:1.3;}
.svc-card-dur{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);margin-top:3px;}
.svc-card-desc{font-size:12.5px;color:#6e545d;line-height:1.5;margin-top:8px;flex:1;}
.svc-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:13px;}
.svc-card-foot em{font-family:'Fraunces';font-weight:700;font-size:17px;font-style:normal;color:var(--brand-deep);}
.svc-card-book{display:inline-flex;align-items:center;gap:3px;font-size:13px;font-weight:700;color:#fff;background:var(--brand);padding:8px 14px;border-radius:10px;box-shadow:0 4px 10px rgba(177,74,110,.3);}
.svc-card-book:active{transform:translateY(1px);}
.svc-trust{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--brand-deep);}
.svc-trust svg{color:var(--brand);}
.svc-deliv{list-style:none;margin:11px 0 14px;display:flex;flex-direction:column;gap:8px;}
.svc-deliv li{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:#5f4d55;line-height:1.4;}
.svc-deliv svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}

/* ===================== DESKTOP REVIEWS PAGE ===================== */
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
.rev-bar.on{background:#f6e8ee;}
.rev-bar>span{width:8px;text-align:right;color:var(--ink);font-weight:600;}
.rev-bar .f{color:var(--gold);fill:var(--gold);flex:0 0 auto;}
.rev-bar-track{flex:1;height:7px;background:#f0e4de;border-radius:4px;overflow:hidden;}
.rev-bar-track i{display:block;height:100%;background:var(--brand);border-radius:4px;}
.rev-leave{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:var(--brand);color:#fff;font-weight:700;font-size:14.5px;padding:12px;border-radius:12px;box-shadow:0 6px 16px rgba(177,74,110,.3);}
.rev-leave svg{fill:#fff;}
.rev-leave:active{transform:translateY(2px);}
.rev-trust{display:flex;align-items:flex-start;gap:7px;font-size:11.5px;color:var(--muted);line-height:1.5;}
.rev-leave-m{margin:16px 0 10px;}
.rev-trust-m{margin-bottom:18px;}
.rev-list.rev-list-m{column-count:1;column-gap:0;}
.rev-filter-m{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
.rev-filter-m button{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:#4f3f46;}
.rev-filter-m button svg{fill:var(--gold);}
.rev-filter-m button.on{background:var(--brand);color:#fff;border-color:var(--brand);}
.rev-filter-m button.on svg{fill:#fff;}
.rev-trust svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}
.rev-photostrip{margin-bottom:24px;}
.rev-photostrip h4{font-size:12.5px;font-weight:700;color:#5f4d55;margin-bottom:10px;}
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
.rev-card-svc{display:inline-block;font-size:11px;font-weight:700;color:var(--brand-deep);background:#f6e8ee;padding:3px 9px;border-radius:7px;margin:11px 0 8px;}
.rev-card-text{font-size:13.5px;line-height:1.55;color:#4f3f46;}
.rev-card-photos{display:flex;gap:9px;margin-top:11px;}
.rev-card-photos .rev-ph{width:70px;height:70px;}
.rev-response{margin-top:13px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:12px 13px;}
.rev-response-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.rev-resp-av{width:24px;height:24px;border-radius:7px;flex:0 0 auto;background:linear-gradient(150deg,var(--brand),var(--brand-deep));color:#fff;font-family:'Fraunces';font-weight:700;font-size:12px;display:grid;place-items:center;}
.rev-response-head b{font-size:12.5px;font-weight:700;color:var(--brand-deep);flex:1;}
.rev-response-head span{font-size:11px;color:var(--muted);}
.rev-response p{font-size:12.5px;line-height:1.5;color:#5f4d55;}
.rev-form-note{display:flex;align-items:flex-start;gap:7px;font-size:12.5px;color:#6e545d;line-height:1.5;background:#f6e8ee;border:1px solid #e6c9d5;border-radius:11px;padding:11px 12px;margin-bottom:6px;}
.rev-form-note svg{color:var(--brand);flex:0 0 auto;margin-top:1px;}
.rev-rate{display:flex;gap:6px;}
.rev-rate svg{color:#e0d2cb;}
.rev-rate .f{color:var(--gold);fill:var(--gold);}
.rev-input,.rev-textarea{width:100%;border:1px solid var(--line);border-radius:11px;padding:11px 13px;font-size:14px;color:var(--ink);background:#fdfaf8;font-family:inherit;}
.rev-input:focus,.rev-textarea:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(177,74,110,.12);}
.rev-textarea{resize:vertical;line-height:1.5;}
.rev-photo-add{margin:14px 0 4px;}
.rev-photo-btn{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--brand-deep);border:1px dashed #d8c2ba;border-radius:11px;padding:10px 14px;}
.rev-photo-chip{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:9px 12px;}
.rev-photo-chip>span{width:26px;height:26px;border-radius:7px;background:linear-gradient(150deg,var(--brand),var(--brand-deep));}
.rev-photo-chip button{display:grid;place-items:center;color:var(--muted);}
`;
