'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Scale, FileText, Globe, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function PrivacyPage() {
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
          {/* <a
            href="/stores"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none', color: 'var(--text-muted)' }}
          >
            Explore Stores
          </a> */}
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
              <ShieldCheck size={11} /> Privacy & Protection
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: May 27, 2026</span>
          </div>
          <h1 className="text-display" style={{ marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxHeight: 'none', lineHeight: 1.6, maxWidth: 700 }}>
            At aloaye, we respect your privacy. This policy describes how we collect, store, and manage merchant and customer information on our platform.
          </p>
        </header>

        {/* Content & Sidebar Grid */}
        <div className="terms-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          
          {/* Detailed Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} /> 1. Scope & Commitments
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                This Privacy Policy applies to all services provided by <strong>aloaye</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting the privacy of our merchants (the business owners) and the customers who buy from them.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                By using our platform to build a storefront, publish products, or browse shops, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} /> 2. Information We Collect
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We collect information to build storefronts and improve user experiences. The categories of information include:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5, color: 'var(--text-2)' }}>
                <li><strong>Merchant Account Details:</strong> Name, email address, WhatsApp-connected phone number, business bio, social media handles, and catalog details (names, prices, and photos of products).</li>
                <li><strong>Customer Order Logs:</strong> When a buyer initiates a checkout, we log basic order metrics (e.g. products selected, timestamps) to generate the WhatsApp redirect message and display order summaries on your dashboard.</li>
                <li><strong>Usage Data:</strong> Anonymized server logs, browser types, device information, IP addresses, and page-load times to optimize network performance on 3G/4G connections.</li>
              </ul>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> 3. How We Use Information
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We use collected information solely for operation, support, and optimization of the platform:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5, color: 'var(--text-2)' }}>
                <li><strong>To Serve Your Storefront:</strong> We make your store catalog public under your custom subdomain for anyone to browse.</li>
                <li><strong>To Facilitate WhatsApp Ordering:</strong> We construct pre-filled WhatsApp link URLs so customers can instantly send item specs directly to your phone number.</li>
                <li><strong>To Provide AI Descriptions:</strong> Product images and tags are processed through standard AI interfaces (e.g. OpenAI API) to generate localized catalog descriptions.</li>
                <li><strong>Platform Security:</strong> Monitoring traffic patterns, detecting fraudulent stores, and verifying merchant registrations.</li>
              </ul>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} style={{ color: 'var(--primary)' }} /> 4. Data Sharing & Third Parties
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                <strong>We do not sell, rent, or trade your personal information</strong> with advertising companies or data brokers.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Information is shared only under the following contexts:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5, color: 'var(--text-2)' }}>
                <li><strong>With Store Shoppers:</strong> Your WhatsApp phone number, store name, prices, currency, and product listings are displayed publicly so customers can interact with your business.</li>
                <li><strong>With Service Providers:</strong> Encrypted hosting providers (such as Vercel) and AI APIs used for storefront description generation.</li>
                <li><strong>Legal Disclosures:</strong> If required by law enforcement or regulatory authorities to investigate illegal activities or violations of our Terms of Service.</li>
              </ul>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> 5. Data Security & Storage
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                All merchant passwords are encrypted before storage on our servers. Communication between your browser and our platform is secured via standard SSL/TLS (HTTPS) protocols.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                While we take industry-standard precautions, no transmission of data over the internet can be guaranteed 100% secure. You are responsible for keeping your login credentials confidential.
              </p>
            </section>

            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={20} style={{ color: 'var(--primary)' }} /> 6. Regional Compliance & Deletion
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We operate primarily in Africa and align our data handling with major regional regulations, including the Nigeria Data Protection Regulation (NDPR). If you are a registered merchant and wish to delete your account, catalog, or personal records permanently from our servers, you may send a deletion request to our support email.
              </p>
            </section>

          </main>

          {/* Sidebar (Quick Guide) */}
          <aside className="terms-sidebar" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Summary Box */}
            <div className="card" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Quick Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <p>
                  <strong>No Ad Tracking:</strong> We do not track you to show ads. We only collect the minimal info needed to make your WhatsApp shop function.
                </p>
                <p>
                  <strong>Data Sharing:</strong> Buyers will see your public business name, logo, products, and WhatsApp phone number so they can message you.
                </p>
                <p>
                  <strong>Security First:</strong> Passwords are fully hashed and encrypted. Store details are protected via Secure HTTPS connections.
                </p>
              </div>
            </div>

            {/* Help Card */}
            <div className="card" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Privacy Concerns?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                For data access requests, deletion commands, or queries regarding how your business details are secured on our servers:
              </p>
              <a
                href="mailto:privacy@aloaye.tech"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Email Privacy Team
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
          <a href="/stores" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>Explore Directory</a>
          <a href="/signup" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</a>
          <a href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
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
