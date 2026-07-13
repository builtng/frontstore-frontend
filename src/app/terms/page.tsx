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
  CreditCard,
  Layers
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function TermsPage() {
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
              <Scale size={11} /> Conversational Infrastructure Agreement
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: July 13, 2026</span>
          </div>
          <h1 className="text-display" style={{ marginBottom: 16 }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxHeight: 'none', lineHeight: 1.6, maxWidth: 800 }}>
            Welcome to Frontstore, the conversational commerce infrastructure built for African businesses. By accessing our platform, utilizing our checkout features, enabling chat payments, or engaging our conversational AI, you agree to these Terms. Please read them carefully.
          </p>
        </header>

        {/* Content & Sidebar Grid */}
        <div className="terms-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Detailed Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} /> 1. Overview & Infrastructure Scope
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of the applications, APIs, subdomains (e.g., yourbrand.frontstore.ng), WhatsApp integrations, and services operated by <strong>Frontstore</strong>, a platform owned and operated by <strong>Built Different LTD</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore is a comprehensive <strong>Conversational Commerce Infrastructure</strong> designed to convert informal chat-based interactions into structured business flows. By creating a merchant account, you establish a contract with us to access this infrastructure.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={20} style={{ color: 'var(--primary)' }} /> 2. The Frontstore Product Suite
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Our infrastructure consists of the following products, and your usage is subject to the rules designated for each:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Online Store (Storefronts)</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Allows you to deploy mobile-responsive product catalogs, structure size/variant attributes, and establish pre-filled checkout flows that route order messages directly to your WhatsApp Business number.
                  </p>
                </div>
                <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Payments & Escrow</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Natively handles digital payment collection (cards, bank transfers, mobile money) within your chat threads. Payouts are subject to escrow holds, merchant KYC validation, and standard payment processing fees.
                  </p>
                </div>
                <div style={{ borderLeft: '3px solid var(--primary-dark)', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>AI Assistant (Sales Agent)</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    AI-powered agent that can answer FAQs, summarize product details, and help buyers coordinate orders. You remain responsible for all transactions finalized or representations made by our AI Assistant.
                  </p>
                </div>
                <div style={{ borderLeft: '3px solid var(--border-strong)', paddingLeft: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Analytics & Broadcast Messages (CRM)</h4>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Analytics tools to track shopper purchase histories and send bulk notifications or marketing campaigns to buyers who have opted into receiving updates.
                  </p>
                </div>
              </div>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={20} style={{ color: 'var(--primary)' }} /> 3. Payments, Escrow, Payouts & KYC
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Our payment system acts as a secure, neutral transaction facilitator to build trust between merchants and shoppers. The following rules govern all transactions:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Escrow Hold:</strong> When a shopper completes a payment, funds are held securely in escrow. Funds are released to the merchant&apos;s verified bank/mobile money account upon delivery confirmation by the buyer, or automatically after a designated holding period (typically 7 days post-shipment) if no dispute is raised.
                </li>
                <li>
                  <strong>Fulfillment & Proof:</strong> Merchants must ship orders in a timely manner. If a shopper disputes delivery, the merchant must provide valid proof of delivery (e.g., dispatch rider receipt, waybill, signature). If no valid proof is supplied, the escrow will be refunded to the buyer.
                </li>
                <li>
                  <strong>KYC Verification:</strong> To receive payouts, merchants must complete Know Your Customer (KYC) verification by providing valid business registration documents, national identification, or tax credentials as required by local regulators.
                </li>
                <li>
                  <strong>Fees:</strong> Frontstore charges a flat 1.5% transaction fee on successful sales, the same rate across every plan. Standard third-party payment processor processing fees (e.g., Paystack) may also apply to transactions and are non-refundable in the event of customer returns or disputes.
                </li>
              </ul>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> 4. AI Assistant Usage & Responsibility
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Our AI Assistant uses artificial intelligence and large language models to assist merchants in generating product descriptions and interacting with shoppers.
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Content Generation:</strong> AI generated catalog details, negotiations, or messaging are based on details supplied by the merchant. The merchant must review and ensure all generated details are accurate and not misleading.
                </li>
                <li>
                  <strong>No Guarantee:</strong> We do not guarantee that AI-generated responses will be 100% accurate, error-free, or compliant with all local consumer protection laws. The merchant is solely liable for any product description error or checkout agreement reached via the AI.
                </li>
                <li>
                  <strong>Data Training Policy:</strong> Chat interactions processed through our AI Assistant may be logged and used to improve the model&apos;s ability to understand regional colloquialisms (including Pidgin and Sheng), subject to our Privacy Policy.
                </li>
              </ul>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} style={{ color: 'var(--danger)' }} /> 5. Prohibited Listings & Activities
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                You may only use our infrastructure for legitimate, authorized commercial activities. You are strictly prohibited from listing, advertising, or facilitating payments for the following categories:
              </p>
              <div style={{
                background: 'var(--bg-2)',
                borderRadius: 'var(--r-lg)',
                padding: '20px',
                fontSize: 13.5,
                lineHeight: 1.6,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 12,
                borderLeft: '4px solid var(--danger)'
              }}>
                <div style={{ color: 'var(--text-2)' }}>• <strong>Unlicensed Pharmaceuticals:</strong> Prescription medicines, unregulated herbal cures, or medical services.</div>
                <div style={{ color: 'var(--text-2)' }}>• <strong>Weapons & Tactical Gear:</strong> Firearms, ammunition, explosives, or military hardware.</div>
                <div style={{ color: 'var(--text-2)' }}>• <strong>Counterfeit & IP-Infringing Goods:</strong> Knockoffs, pirated media, or unlicensed software keys.</div>
                <div style={{ color: 'var(--text-2)' }}>• <strong>Adult Entertainment:</strong> Pornographic materials, sexually explicit services, or adult content.</div>
                <div style={{ color: 'var(--text-2)' }}>• <strong>Financial Scams & Schemes:</strong> Ponzi/pyramid schemes, unregulated lending, or crowd-funding scams.</div>
                <div style={{ color: 'var(--text-2)' }}>• <strong>Smuggled & Contraband Goods:</strong> Items imported without custom clearing or illegal under local regulations.</div>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Frontstore reserves the right to immediately suspend accounts, confiscate pending escrow balances for fraudulent activities, and report illegal actions to local enforcement authorities.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} /> 6. Disclaimers & Limits of Liability
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                THE INFRASTRUCTURE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE UNINTERRUPTED UPTIME, FAULT-FREE AI DIALOGUE, OR COMPATIBILITY WITH ONGOING WHATSAPP API MODIFICATIONS.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                IN NO EVENT SHALL FRONTSTORE, ITS DIRECTORS, OR PARTNERS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF REVENUES, PROFITS, OR DATA ARISING OUT OF OR IN CONNECTION WITH THE USE OF OUR SERVICES.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={20} style={{ color: 'var(--primary)' }} /> 7. Governing Law & Regional Arbitration
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                These Terms and your use of the Platform are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. 
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Any dispute, claim, or controversy arising out of or relating to these Terms will be settled through binding arbitration under the rules of the Lagos Court of Arbitration, with proceedings conducted in Lagos, Nigeria, in English.
              </p>
            </section>

          </main>

          {/* Sidebar (Quick Guide) */}
          <aside className="terms-sidebar" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Summary Box */}
            <div className="card shadow-md" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Core Highlights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>1. Conversational Commerce:</strong>
                  <p style={{ marginTop: 2 }}>We provide the tech infrastructure. You run your storefronts and connect with your shoppers in chat.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>2. Escrow Protection:</strong>
                  <p style={{ marginTop: 2 }}>Our payment escrow locks shopper funds in escrow to reduce transaction fraud and build shopper confidence.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>3. AI Responsibility:</strong>
                  <p style={{ marginTop: 2 }}>You are responsible for reviewing and authorizing all product prices and details drafted by our AI Assistant.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>4. Absolute Compliance:</strong>
                  <p style={{ marginTop: 2 }}>We enforce strict listing rules and local merchant KYC standards to keep the network secure.</p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Legal & Compliance
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                Need help clarifying our terms, setting up merchant verification, or resolving an escrow transaction dispute?
              </p>
              <a
                href="mailto:compliance@frontstore.ng"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >
                Contact Compliance
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
