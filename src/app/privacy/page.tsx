'use client';

import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Scale, 
  FileText, 
  Globe, 
  MessageSquare, 
  AlertTriangle, 
  ArrowLeft,
  Database,
  Eye
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function PrivacyPage() {
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
              <ShieldCheck size={11} /> Privacy & Data Protection
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: May 29, 2026</span>
          </div>
          <h1 className="text-display" style={{ marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxHeight: 'none', lineHeight: 1.6, maxWidth: 800 }}>
            At Frontstore, we respect your privacy. This policy describes how we collect, store, share, and process merchant and customer information across our conversational commerce infrastructure.
          </p>
        </header>

        {/* Content & Sidebar Grid */}
        <div className="terms-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          
          {/* Detailed Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} /> 1. Commitment to Data Privacy
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) serves as a conversational commerce infrastructure. We handle data for two groups of users: **Merchants** (who create storefronts and sell products) and **Shoppers** (who browse stores, negotiate via chat, and place orders).
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We are committed to operating in full compliance with regional privacy laws, including the <strong>Nigeria Data Protection Act (NDPR/NDPA)</strong>, Kenya&apos;s <strong>Data Protection Act</strong>, and South Africa&apos;s <strong>Protection of Personal Information Act (POPIA)</strong>, alongside international guidelines such as the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={20} style={{ color: 'var(--primary)' }} /> 2. Information We Collect
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                To make conversational checkouts and AI features possible, we collect the following types of information:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>A. Merchant Data</h4>
                  <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, color: 'var(--text-2)' }}>
                    <li><strong>Account Information:</strong> Name, business email, login credentials, and WhatsApp-connected phone number.</li>
                    <li><strong>Store & Catalog Data:</strong> Product titles, descriptions, pricing currencies (NGN, GHS, KES, ZAR, etc.), size/color variants, and catalog photos.</li>
                    <li><strong>KYC Verification details:</strong> Legal business names, tax registry numbers, identification documents, and bank/mobile money details for payment settlements.</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>B. Shopper & Order Data</h4>
                  <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, color: 'var(--text-2)' }}>
                    <li><strong>Order Details:</strong> Products browsed, checkout selection, totals, and transactional timestamps.</li>
                    <li><strong>Delivery Details:</strong> Delivery contact name, physical shipping address, and phone number for coordinates.</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>C. Chat Transcripts & AI Inputs</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    When shoppers engage with our AI chat assistant, we collect and log the text dialogue to process requests, formulate catalog suggestions, and construct order summaries.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>D. Technical Logs</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Anonymized IP addresses, browser specifications, and connection speeds to deliver lightweight, fast storefront screens to mobile phones operating on Erratic 3G/4G networks.
                  </p>
                </div>
              </div>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> 3. Processing Data with Artificial Intelligence
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore integrates state-of-the-art AI technology to generate catalog descriptions and run our AI chat assistant. Data handling for AI features follows strict protocols:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Security of AI Pipelines:</strong> Product details, tags, and chat transcripts sent to AI models (such as secure APIs from OpenAI or Google Gemini) are encrypted during transit and processing.
                </li>
                <li>
                  <strong>No Public Training Use:</strong> We do not allow third-party AI models to use your personal or business-sensitive transaction records to train public models.
                </li>
                <li>
                  <strong>Language Customization:</strong> Chat logs are evaluated internally by Frontstore to calibrate our conversational agents on regional colloquialisms, Pidgin, Sheng, and localized spelling formats.
                </li>
              </ul>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Eye size={20} style={{ color: 'var(--primary)' }} /> 4. Information Sharing & Third Parties
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                <strong>We do not sell, rent, or trade merchant or shopper information to marketing companies.</strong> Data is shared only under the following strictly defined operational contexts:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Public Storefront:</strong> A merchant&apos;s store name, bio, products, pricing, and WhatsApp phone number are publicly readable so that shoppers can discover and buy from them.
                </li>
                <li>
                  <strong>With the Merchant:</strong> Customer order details, delivery addresses, and chat details are shared with the merchant to enable fulfillment.
                </li>
                <li>
                  <strong>Licensed Payment Processors:</strong> We partner with licensed, PCI-DSS compliant financial providers (such as Paystack, Flutterwave, and M-Pesa channels) to process payments.
                </li>
                <li>
                  <strong>Cloud & Hosting Infrastructure:</strong> Encrypted hosting providers (such as Vercel and Supabase) that comply with ISO security frameworks.
                </li>
              </ul>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={20} style={{ color: 'var(--primary)' }} /> 5. Regional Compliance & User Rights
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                No matter where your business is situated in Africa or globally, we recognize your control over your data.
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Right to Access & Portability:</strong> Merchants may request a complete export of their sales logs, inventory, and account details.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> You can edit your catalog, password, name, and billing details directly within the Frontstore merchant dashboard.
                </li>
                <li>
                  <strong>Right to Erasure (Deletion):</strong> You have the right to request that we delete your store, customer lists, and all associated personal data from our servers. Once verified, deletion will occur within 30 business days.
                </li>
                <li>
                  <strong>Data Protection Officer:</strong> For any compliance inquiries, Data Subject Access Requests (DSAR), or privacy questions, contact our Data Protection Officer at `privacy@frontstore.ng`.
                </li>
              </ul>
            </section>

          </main>

          {/* Sidebar (Quick Guide) */}
          <aside className="terms-sidebar" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Summary Box */}
            <div className="card shadow-md" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Privacy Highlights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>No Ad Networks:</strong>
                  <p style={{ marginTop: 2 }}>We never sell your phone numbers or order history to advertisers. Period.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>AI Encryption:</strong>
                  <p style={{ marginTop: 2 }}>Chats analyzed by our AI are secure and not used to train public models.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Regulated Payments:</strong>
                  <p style={{ marginTop: 2 }}>All transaction details are routed through PCI-DSS certified local payment gates.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>African Laws Compliant:</strong>
                  <p style={{ marginTop: 2 }}>Your data is protected under NDPA, POPIA, and Kenyan Data regulations.</p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Privacy Support
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                Have questions about how your order records are stored, or want to submit an account deletion request?
              </p>
              <a
                href="mailto:privacy@frontstore.ng"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >
                Email Privacy Team
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
