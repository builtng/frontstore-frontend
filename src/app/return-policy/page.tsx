'use client';

import React from 'react';
import {
  RotateCcw,
  ShieldCheck,
  Scale,
  FileText,
  Globe,
  MessageSquare,
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  PackageCheck,
  Clock,
  Truck,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function ReturnPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <PublicSiteNav />

      {/* Main Content Layout */}
      <div style={{ flex: 1, width: '100%', maxWidth: 1150, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Breadcrumb / Back Link */}
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', marginBottom: 24 }} className="clickable">
          <ArrowLeft size={14} /> Back to Home
        </a>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="badge badge-primary" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <RotateCcw size={11} /> Buyer Protection & Refund Standard
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: August 3, 2026</span>
          </div>
          <h1 className="text-display" style={{ marginBottom: 16 }}>Return & Refund Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxHeight: 'none', lineHeight: 1.6, maxWidth: 800 }}>
            This Return & Refund Policy outlines guidelines for order cancellations, physical and digital returns, buyer escrow protection, and SaaS subscription refunds across the Frontstore conversational commerce network.
          </p>
        </header>

        {/* Content & Sidebar Grid */}
        <div className="terms-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          
          {/* Detailed Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* 1. Scope & Responsibility Model */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} /> 1. Scope & Dual Responsibility Model
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates a conversational commerce engine powered by <strong>Built Different LTD</strong>. Our platform connects independent business owners (&quot;Merchants&quot;) with customers (&quot;Shoppers&quot;).
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                To provide transparency, this policy governs two distinct operational scopes:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 6 }}>
                <div style={{ padding: 16, borderRadius: 'var(--r-md, 8px)', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingBag size={16} style={{ color: 'var(--primary)' }} /> Merchant Storefront Orders
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Physical products, digital downloads, services, or appointments bought from independent storefronts hosted on <code>*.frontstore.ng</code> or custom merchant domains.
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 'var(--r-md, 8px)', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={16} style={{ color: 'var(--primary)' }} /> Frontstore Platform SaaS
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Monthly or annual software subscriptions, custom domain fees, verification badges, and automated AI chat token packages purchased by merchants directly from Frontstore.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Shopper Escrow & Protection */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> 2. Shopper Escrow & Protection Guarantee
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                When shoppers complete payments via Frontstore online checkout (Paystack, Flutterwave, or verified card gateway), funds are secured under Frontstore Escrow Protection:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Payout Retention Period:</strong> Merchant payouts are held until delivery is confirmed by the buyer or until <strong>7 days</strong> after marked dispatch without dispute.
                </li>
                <li>
                  <strong>Immediate Dispute Freeze:</strong> Raising an order issue within 7 days of delivery instantly locks escrow funds from merchant settlement until resolution.
                </li>
                <li>
                  <strong>Full Refund Coverage:</strong> Buyers receive a 100% refund if the item is never delivered, arrives significantly damaged, or is proven to be counterfeit/unauthentic.
                </li>
              </ul>
            </section>

            {/* 3. Eligibility by Category */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <PackageCheck size={20} style={{ color: 'var(--primary)' }} /> 3. Return Eligibility Standards
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Different product categories follow tailored return conditions to protect both shoppers and sellers:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>A. Physical Goods (Fashion, Electronics, Home)</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                    Eligible for return within <strong>7 to 14 days</strong> of delivery if unused, unworn, and returned in original packaging with tags intact. If an incorrect size or damaged item is received, return shipping is covered by the merchant.
                  </p>
                </div>

                <div style={{ borderLeft: '3px solid #eab308', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>B. Digital Content & Online Courses</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                    Due to the immediate access nature of digital downloads, eBooks, and media files, sales are final once accessed or downloaded. Full refunds are issued if links are broken or files are verified corrupted.
                  </p>
                </div>

                <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>C. Custom Goods, Perishables & Personal Care</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                    Tailored garments, personalized merchandise, fresh food/groceries, swimwear, and opened cosmetics cannot be returned for hygiene or custom-fit reasons unless defective upon arrival.
                  </p>
                </div>

                <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>D. Service Bookings & Appointments</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                    Cancellations made <strong>24+ hours</strong> prior to appointment time qualify for a full deposit refund. Cancellations within 24 hours are subject to individual merchant service terms.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Step-by-Step Return Process */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Truck size={20} style={{ color: 'var(--primary)' }} /> 4. How to Request a Return or Refund
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>1</span>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>Initiate Request</h4>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Open your order confirmation page (sent via WhatsApp or email) or navigate to <code>/track</code> with your Order ID, and click <strong>Request Return/Refund</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>2</span>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>Submit Evidence</h4>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Provide brief details and upload photos/videos showing defect, damage, or discrepancy.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>3</span>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>Dispatch / Drop-off</h4>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Once approved, send the item to the merchant&apos;s designated return address or schedule a waybill pickup.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>4</span>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>Refund Issuance</h4>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Upon return verification, funds are released directly to your payment method or bank account.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Timelines & Methods */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={20} style={{ color: 'var(--primary)' }} /> 5. Refund Method & Processing Timelines
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Approved refunds are processed through regulated banking channels and reflect as follows:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Debit/Credit Cards (Paystack / Flutterwave):</strong> 3 to 5 business days depending on issuer bank processing times.
                </li>
                <li>
                  <strong>Bank Transfers / USSD:</strong> 24 to 48 business hours directly to buyer&apos;s confirmed bank account.
                </li>
                <li>
                  <strong>Store Credit / Voucher:</strong> Instant credit issued to buyer phone number for store re-purchases.
                </li>
              </ul>
            </section>

            {/* 6. Merchant Dispute Resolution */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={20} style={{ color: 'var(--primary)' }} /> 6. Merchant Dispute Resolution Center
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                If a merchant and buyer cannot agree on a return or refund request within 48 hours, either party may escalate to Frontstore Dispute Resolution (`disputes@frontstore.ng`).
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore compliance specialists will examine WhatsApp chat logs, delivery waybills, photo proof, and store terms to render a binding determination within <strong>72 hours</strong>.
              </p>
            </section>

            {/* 7. Frontstore SaaS Subscription Refunds */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <RefreshCw size={20} style={{ color: 'var(--primary)' }} /> 7. Frontstore Platform SaaS Subscription Refunds
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                For merchants subscribing to Frontstore paid plans (Pro, Growth, Enterprise):
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>14-Day Money-Back Guarantee:</strong> First-time annual subscription signups qualify for a 100% full refund within 14 calendar days of upgrading.
                </li>
                <li>
                  <strong>Monthly Subscriptions:</strong> You can cancel your monthly plan at any time. Your subscription remains active until the end of the current billing cycle without further renewal charges. Partial month refunds are not provided.
                </li>
                <li>
                  <strong>Add-on Credits & Custom Domains:</strong> Custom domain registration fees, SMS credits, and AI token packs are non-refundable once allocated or provisioned.
                </li>
              </ul>
            </section>

            {/* 8. Contact Information */}
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={20} style={{ color: 'var(--primary)' }} /> 8. Contact Support & Return Assistance
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                For help initiating a return, checking dispute status, or asking questions about our escrow protection:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
                <a
                  href="mailto:returns@frontstore.ng"
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: 13.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
                >
                  <Mail size={16} /> Contact Returns Desk
                </a>
                <a
                  href="/track"
                  className="btn btn-outline"
                  style={{ padding: '10px 18px', fontSize: 13.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
                >
                  <PackageCheck size={16} /> Track Order & File Claim
                </a>
              </div>
            </section>

          </main>

          {/* Sidebar (Quick Guide) */}
          <aside className="terms-sidebar" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Summary Box */}
            <div className="card shadow-md" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Policy Highlights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>7-Day Escrow Hold:</strong>
                  <p style={{ marginTop: 2 }}>Merchant funds are protected until order delivery is verified.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>3-5 Days Payout:</strong>
                  <p style={{ marginTop: 2 }}>Approved refunds return straight to your card or bank account.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>14-Day SaaS Guarantee:</strong>
                  <p style={{ marginTop: 2 }}>100% money-back on annual Frontstore merchant plans.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>72h Dispute Desk:</strong>
                  <p style={{ marginTop: 2 }}>Independent team handles merchant-buyer claim escalation.</p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Need Assistance?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                Have an order issue or need help with a refund dispute?
              </p>
              <a
                href="mailto:disputes@frontstore.ng"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >
                Email Dispute Resolution
              </a>
            </div>

          </aside>

        </div>

      </div>

      {/* Footer */}
      <PublicSiteFooter />

      {/* Styling media queries */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .terms-grid {
            flex-direction: column !important;
          }
          .terms-sidebar {
            width: 100% !important;
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
