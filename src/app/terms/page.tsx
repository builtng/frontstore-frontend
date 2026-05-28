'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Scale, FileText, Globe, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <nav
        className="glass"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <Logo size={24} textColor="var(--primary)" />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <a
            href="/blog"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}
          >
            Blog
          </a>
          <a
            href="/login"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Get Started <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div style={{ flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* Breadcrumb / Back Link */}
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginBottom: 24 }} className="clickable">
          <ArrowLeft size={14} /> Back to Home
        </a>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="badge badge-primary" style={{ padding: '5px 12px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Scale size={11} /> Legal Documents
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: May 27, 2026</span>
          </div>
          <h1 className="text-display" style={{ marginBottom: 16 }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxHeight: 'none', lineHeight: 1.6, maxWidth: 700 }}>
            Please read these Terms of Service carefully before creating your store. By using aloaye, you agree to comply with and be bound by these rules.
          </p>
        </header>

        {/* Content & Sidebar Grid */}
        <div className="terms-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Detailed Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} /> 1. Introduction & Acceptance
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Welcome to <strong>aloaye</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our storefront builder website (aloaye.tech), storefront paths (e.g., aloaye.tech/yourbrand), mobile companion applications, and associated services.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                By creating a seller account, launching a storefront, or browsing the directory, you accept and agree to be bound by these Terms. If you do not agree to these Terms, you must not register an account or use our platform services.
              </p>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> 2. Description of Service
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                aloaye is a mobile-first digital storefront builder optimized for WhatsApp commerce in Africa. We provide merchants with tools to:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5, color: 'var(--text-2)' }}>
                <li>Create and customize a digital product catalog accessible via a unique web URL.</li>
                <li>Write product descriptions and format currency prices (NGN, GHS, KES, ZAR, etc.) with the assistance of integrated AI technologies.</li>
                <li>Direct customer checkouts straight into the merchant&apos;s WhatsApp chat via pre-filled messaging syntax.</li>
                <li>Monitor incoming and pending order logs through a central merchant dashboard.</li>
              </ul>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We are a software platform provider. We are <strong>not</strong> a payment processor, delivery service, or party to any transaction between you and your customers. All order payments, goods fulfillment, and disputes are handled directly between the buyer and the seller.
              </p>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> 3. Registration & Store Security
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                To create a store, you must provide a valid WhatsApp-connected phone number, a store title, and set a password. You agree to:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5, color: 'var(--text-2)' }}>
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the confidentiality of your credentials and restrict access to your account.</li>
                <li>Notify us immediately of any unauthorized use or security breaches.</li>
                <li>Take full responsibility for all activities, product listings, and chat communications originating from your storefront.</li>
              </ul>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} style={{ color: 'var(--primary)' }} /> 4. Prohibited Uses & Listings
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                You may only use aloaye for lawful business activities. You are strictly prohibited from listing, selling, or promoting the following categories on your storefront:
              </p>
              <div style={{
                background: 'var(--bg-2)',
                borderRadius: 'var(--r-lg)',
                padding: '16px 20px',
                fontSize: 14,
                lineHeight: 1.6,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                borderLeft: '4px solid var(--danger)'
              }}>
                <div style={{ color: 'var(--text-2)' }}>• Illegal drugs, prescription medicines, or chemical substances.</div>
                <div style={{ color: 'var(--text-2)' }}>• Weapons, ammunition, explosives, or military hardware.</div>
                <div style={{ color: 'var(--text-2)' }}>• Counterfeit goods, pirated media, or unlicensed software.</div>
                <div style={{ color: 'var(--text-2)' }}>• Pornographic materials or adult entertainment services.</div>
                <div style={{ color: 'var(--text-2)' }}>• Financial schemes, multi-level marketing, or fraudulent offers.</div>
                <div style={{ color: 'var(--text-2)' }}>• Products promoting hate speech, violence, or discrimination.</div>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We reserve the right to immediately suspend or terminate any store, block subdomains, or remove content that violates these restrictions or compromises the reputation of our platform.
              </p>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} /> 5. Disclaimers & Liability Limits
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                THE PLATFORM AND SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                IN NO EVENT WILL ALOAYE, ITS FOUNDERS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, REVENUE, OR DATA) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE PLATFORM.
              </p>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={20} style={{ color: 'var(--primary)' }} /> 6. Governing Law & Dispute Resolution
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                These Terms and your use of the Platform are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Lagos State, Nigeria.
              </p>
            </section>

          </main>

          {/* Sidebar (Quick Guide) */}
          <aside className="terms-sidebar" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Summary Box */}
            <div className="card" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: 'var(--primary)' }} /> TL;DR (Summary)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <p>
                  <strong>No Payment Processing:</strong> We build the shop templates. You collect money directly from your customers via WhatsApp.
                </p>
                <p>
                  <strong>Listing Rules:</strong> No illegal items, drugs, weapons, or counterfeit goods. Violations lead to instant ban.
                </p>
                <p>
                  <strong>Storefront URL Ownership:</strong> Your URL (e.g. aloaye.tech/brand) is yours to use as long as your account remains active and compliant.
                </p>
              </div>
            </div>

            {/* Help Card */}
            <div className="card" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Have questions?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                If you have queries regarding these terms, our compliance policies, or need clarification, reach out to our legal support.
              </p>
              <a
                href="mailto:legal@aloaye.tech"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Contact Support
              </a>
            </div>

          </aside>

        </div>

      </div>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
      }}>
        <Logo size={20} textColor="var(--primary)" />
        <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
          © {new Date().getFullYear()} aloaye. Africa&apos;s #1 WhatsApp Commerce Platform.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* <a href="/stores" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>Explore Directory</a> */}
          <a href="/signup" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</a>
          <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>Terms</a>
        </div>
      </footer>

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
