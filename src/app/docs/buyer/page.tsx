'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare, 
  FileText,
  ChevronRight,
  Zap,
  MapPin,
  Clock,
  Eye,
  Info,
  CheckCircle2
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export default function BuyerDocsPage() {
  const [activeSection, setActiveSection] = useState('browsing');

  const navSections: NavSection[] = [
    { id: 'browsing', title: '1. Browsing Items', icon: <Eye size={16} /> },
    { id: 'ordering', title: '2. Placing Orders', icon: <ShoppingBag size={16} /> },
    { id: 'booking', title: '3. Booking Services', icon: <Calendar size={16} /> },
    { id: 'paying', title: '4. Flexible Payments', icon: <CreditCard size={16} /> },
    { id: 'escrow', title: '5. Buyer Protection', icon: <ShieldCheck size={16} /> },
    { id: 'nina', title: '6. WhatsApp Nina AI', icon: <MessageSquare size={16} /> },
    { id: 'tracking', title: '7. Order Invoices', icon: <FileText size={16} /> },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // Adjust for sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <PublicSiteNav />

      {/* Main Content Layout */}
      <div style={{ flex: 1, width: '100%', maxWidth: 1150, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Back navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <a href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }} className="clickable">
            <ArrowLeft size={14} /> Back to Help Center
          </a>
          <span className="badge badge-accent" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ShoppingBag size={11} /> Shopper Resources
          </span>
        </div>

        {/* Title Header */}
        <header style={{ marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
          <h1 className="text-display" style={{ marginBottom: 12, fontSize: 'clamp(28px, 4.5vw, 40px)' }}>Buyer & Shopper Guide</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, maxWidth: 800 }}>
            Learn how to browse stores, place orders, book service appointments, secure your money with escrow, and shop directly within WhatsApp.
          </p>
        </header>

        {/* Content Layout Grid */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="docs-layout-grid">
          
          {/* Sticky Sidebar Navigation */}
          <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 8 }} className="docs-sidebar">
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', padding: '0 12px 6px' }}>
              Guide Sections
            </span>
            {navSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: activeSection === sec.id ? 'var(--primary)' : 'transparent',
                  color: activeSection === sec.id ? '#fff' : 'var(--text-muted)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast) var(--ease)',
                  boxShadow: activeSection === sec.id ? 'var(--shadow-md)' : 'none'
                }}
                className={activeSection !== sec.id ? "btn-ghost" : ""}
              >
                {sec.icon}
                <span style={{ flex: 1 }}>{sec.title}</span>
                <ChevronRight size={14} style={{ opacity: activeSection === sec.id ? 1 : 0 }} />
              </button>
            ))}

            <div style={{ marginTop: 24, padding: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Have an Order Dispute?</h4>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>Contact our customer support team to resolve payment or delivery issues.</p>
              <a href="mailto:hello@frontstore.ng" className="btn btn-outline" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-sm)' }}>
                Email Support
              </a>
            </div>
          </aside>

          {/* Main Documentation Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }} className="docs-main-content">
            
            {/* Browsing Items */}
            <section id="browsing" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Eye size={22} style={{ color: 'var(--primary)' }} /> 1. Finding & Browsing Stores
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Every merchant on Frontstore operates a clean, dedicated storefront link (e.g. `frontstore.ng/ade` or a custom brand domain like `mybrand.com`). These storefronts are fully responsive and optimized for mobile devices, working flawlessly even in low-bandwidth areas.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                When visiting a store, you can browse items grouped by category collections, search for specific products via the search bar, and view pinned &quot;Signature Treatments&quot; representing the vendor's featured offerings.
              </p>
            </section>

            {/* Placing Orders */}
            <section id="ordering" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={22} style={{ color: 'var(--primary)' }} /> 2. Placing Your First Order
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Adding products to your order is simple:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>Tap the <strong>Buy</strong> or <strong>Order</strong> button beneath any item in the store's grid to add it to your cart.</li>
                <li>Toggle open the <strong>Order Bag</strong> from the top bar or side column.</li>
                <li>Enter your customer details: Name, WhatsApp Number, and preferred delivery or pickup arrangements.</li>
                <li>Confirm details and click <strong>Place Order</strong>. Your receipt details will immediately generate, and an order prompt will open to text the merchant on WhatsApp.</li>
              </ul>

              <div style={{ 
                background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.05))', 
                borderLeft: '4px solid var(--primary)', 
                borderRadius: 'var(--r-md)', 
                padding: 18,
                marginTop: 8,
                display: 'flex',
                gap: 12
              }}>
                <Zap size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Saved Customer Profiles</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Frontstore securely caches your delivery name, phone, and address locally in your browser. The next time you order from *any* shop running on the Frontstore infrastructure, checkout fields pre-fill instantly.
                  </p>
                </div>
              </div>
            </section>

            {/* Booking Services */}
            <section id="booking" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={22} style={{ color: 'var(--primary)' }} /> 3. Booking Time-Slots & Services
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                For service-based items (such as salon bookings, consultations, or photo sessions), Frontstore embeds a calendar picker directly into the shopping flow:
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                gap: 16,
                marginTop: 8
              }}>
                <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', display: 'flex', gap: 12 }}>
                  <Clock size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>1. Pick Date & Time</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      Click <strong>Book</strong>, then select a date (up to 5 days out) and click on an available time slot.
                    </p>
                  </div>
                </div>
                <div style={{ padding: 18, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', display: 'flex', gap: 12 }}>
                  <MapPin size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>2. Fulfill Details</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      Under delivery address, list the session location (if mobile) or note any special requests.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Flexible Payments */}
            <section id="paying" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={22} style={{ color: 'var(--primary)' }} /> 4. Flexible Payment Options (Frontstore Pay)
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore Pay supports secure local payments and verifies transactions in real-time.
              </p>
              
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--text-2)' }}>
                <li><strong>Local & International Cards:</strong> Pay securely using Visa, Mastercard, or Verve.</li>
                <li><strong>Mobile Money Networks:</strong> Pay via MTN MoMo, M-Pesa, or Telebirr instantly.</li>
                <li><strong>Virtual Bank Transfers (DVA):</strong> Transfer exactly to the temporary unique account number generated on the receipt page. Once transferred, the payment confirms dynamically without manual screenshots.</li>
              </ul>
            </section>

            {/* Buyer Protection */}
            <section id="escrow" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={22} style={{ color: 'var(--primary)' }} /> 5. The Escrow & Buyer Protection System
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                To reduce fraud, Frontstore acts as a secure escrow holder. Your money does **not** land in the merchant's withdrawable wallet immediately.
              </p>

              <div style={{ 
                background: 'var(--surface-2)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r-xl)', 
                padding: 24,
                marginTop: 8
              }}>
                <h4 className="font-heading" style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={16} style={{ color: 'var(--primary)' }} /> How It Works
                </h4>
                <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                  <li>You submit payment for your order.</li>
                  <li>Frontstore locks the funds securely in the escrow framework.</li>
                  <li>The vendor ships your goods or performs the booked service.</li>
                  <li>You confirm delivery on your digital receipt page. Once clicked, the funds are released to the vendor.</li>
                  <li>If the merchant fails to deliver or ships a wrong item, you file a dispute to freeze the escrow payout, allowing our support team to mediate.</li>
                </ol>
              </div>
            </section>

            {/* WhatsApp Nina AI */}
            <section id="nina" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={22} style={{ color: 'var(--primary)' }} /> 6. Shopping via WhatsApp with Nina AI
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                When you click to chat on WhatsApp with a Frontstore merchant, you may be greeted by **Nina AI**. Nina acts as a helper directly in the thread:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 8 }}>
                <div style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>💬 Ask Questions & Bargain</strong>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45, display: 'block' }}>Ask Nina about product sizing, shipping costs, or negotiate discount thresholds on bulk bookings.</span>
                </div>
                <div style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>⚡ Direct Order capturing</strong>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45, display: 'block' }}>Text what you want (e.g. &quot;I want 2 Dashiki shirts delivered to 4 Marina Rd, Lagos&quot;) and Nina drafts the checkout.</span>
                </div>
                <div style={{ padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>📷 Screenshot receipts</strong>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45, display: 'block' }}>Paste a screenshot of your bank transfer receipt. Nina automatically parses the image to verify the payment.</span>
                </div>
              </div>
            </section>

            {/* Tracking Invoices */}
            <section id="tracking" className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={22} style={{ color: 'var(--primary)' }} /> 7. Order Invoices & Feedback
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65 }}>
                After checking out, you receive a dynamic order tracking URL. Visiting this page allows you to view the real-time status of your order:
              </p>
              
              <div style={{ 
                borderLeft: '4px solid var(--wa-green)', 
                borderRadius: 'var(--r-md)', 
                padding: 16,
                background: 'rgba(37, 211, 102, 0.05)',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginTop: 8
              }}>
                <CheckCircle2 size={20} style={{ color: 'var(--wa-green)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  <strong>Verified Reviews:</strong> Once the merchant completes delivery, leave verified star ratings and comments on the invoice page to help the merchant grow and guide future shoppers.
                </span>
              </div>
            </section>

          </main>

        </div>

      </div>

      {/* Footer */}
      <PublicSiteFooter />

      {/* Media Queries */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .docs-layout-grid {
            flex-direction: column !important;
          }
          .docs-sidebar {
            width: 100% !important;
            position: relative !important;
            top: 0 !important;
            margin-bottom: 24px;
          }
        }
        @media (max-width: 640px) {
          .docs-main-content {
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
