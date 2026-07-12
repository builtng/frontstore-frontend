'use client';

import React from 'react';
import {
  ArrowLeft,
  Copyright,
  FileWarning,
  Mail,
  Clock,
  Scale,
  UserX,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function DmcaPage() {
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
              <Copyright size={11} /> Copyright & Takedown Policy
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: July 12, 2026</span>
          </div>
          <h1 className="text-display" style={{ marginBottom: 16 }}>DMCA Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxHeight: 'none', lineHeight: 1.6, maxWidth: 800 }}>
            Frontstore hosts storefronts, product catalogs, and media uploaded directly by independent merchants. We respect the intellectual property rights of others and respond to valid takedown notices submitted under the Digital Millennium Copyright Act (DMCA) and comparable regional copyright laws.
          </p>
        </header>

        {/* Content & Sidebar Grid */}
        <div className="terms-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Detailed Content */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Copyright size={20} style={{ color: 'var(--primary)' }} /> 1. Scope of This Policy
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Product images, descriptions, storefront branding, and other content on Frontstore storefronts are uploaded and controlled by the individual merchants who operate those stores, not by Frontstore. If you believe content hosted on a Frontstore-powered storefront (a <code>*.frontstore.ng</code> subdomain, custom domain, or listing within our marketplace) infringes a copyright you own or control, you may submit a takedown notice using the process below.
              </p>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                This policy applies to copyright claims only. Trademark disputes, counterfeit goods, defamation, or other legal complaints should be directed to <a href="mailto:compliance@frontstore.ng" style={{ color: 'var(--primary)', fontWeight: 700 }}>compliance@frontstore.ng</a> and are handled under our <a href="/terms" style={{ color: 'var(--primary)', fontWeight: 700 }}>Terms of Service</a>.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileWarning size={20} style={{ color: 'var(--primary)' }} /> 2. Filing a Takedown Notice
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                To be effective, your notice must be a written communication that includes substantially all of the following:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>
                  <strong>Signature:</strong> A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.
                </li>
                <li>
                  <strong>Identification of the work:</strong> A description of the copyrighted work you claim has been infringed, including a link or copy of the original work where possible.
                </li>
                <li>
                  <strong>Identification of the material:</strong> The exact storefront URL, product listing, or image you are reporting, with enough detail for us to locate it.
                </li>
                <li>
                  <strong>Contact information:</strong> Your name, mailing address, telephone number, and email address.
                </li>
                <li>
                  <strong>Good-faith statement:</strong> A statement that you have a good-faith belief the disputed use is not authorized by the copyright owner, its agent, or the law.
                </li>
                <li>
                  <strong>Accuracy statement:</strong> A statement, made under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.
                </li>
              </ul>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={20} style={{ color: 'var(--primary)' }} /> 3. Where to Send Your Notice
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Notices meeting the requirements above should be sent to our designated copyright agent:
              </p>
              <div style={{
                background: 'var(--bg-2)',
                borderRadius: 'var(--r-lg)',
                padding: '20px',
                fontSize: 13.5,
                lineHeight: 1.7,
                borderLeft: '4px solid var(--primary)',
                color: 'var(--text-2)',
              }}>
                <div><strong>Frontstore Copyright Agent</strong></div>
                <div>Email: <a href="mailto:dmca@frontstore.ng" style={{ color: 'var(--primary)', fontWeight: 700 }}>dmca@frontstore.ng</a></div>
                <div>Subject line: &quot;DMCA Takedown Notice&quot;</div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Incomplete notices may delay processing. We may request additional information to verify a claim before acting on it.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={20} style={{ color: 'var(--primary)' }} /> 4. Our Response Process
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Upon receiving a complete notice, we will act expeditiously to remove or disable access to the reported material, notify the merchant who uploaded it, and provide the merchant with a copy of the notice and instructions on how to submit a counter-notification, consistent with the DMCA safe-harbor process.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={20} style={{ color: 'var(--primary)' }} /> 5. Counter-Notification
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                If you are a merchant and believe material was removed in error or as a result of misidentification, you may submit a counter-notification to <a href="mailto:dmca@frontstore.ng" style={{ color: 'var(--primary)', fontWeight: 700 }}>dmca@frontstore.ng</a> that includes:
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <li>Your signature, and identification of the removed material and its location prior to removal.</li>
                <li>A statement, under penalty of perjury, that you have a good-faith belief the material was removed as a result of mistake or misidentification.</li>
                <li>Your name, address, telephone number, and a statement consenting to the jurisdiction of the federal district court for your address (or, for merchants outside the United States, an appropriate judicial forum), and that you will accept service of process from the original complainant.</li>
              </ul>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                We will forward a valid counter-notification to the original complainant. Unless the complainant informs us that a court action seeking to restrain the merchant has been filed, we may restore the material within 10 to 14 business days of receiving the counter-notification.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserX size={20} style={{ color: 'var(--danger)' }} /> 6. Repeat Infringer Policy
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Merchant accounts that are the subject of repeated, valid copyright complaints will be suspended or terminated, at our discretion, in accordance with our <a href="/terms" style={{ color: 'var(--primary)', fontWeight: 700 }}>Terms of Service</a>. Escrow balances tied to a terminated account remain subject to the dispute and refund rules described in those Terms.
              </p>
            </section>

            <section className="card shadow-lg" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--surface)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} style={{ color: 'var(--danger)' }} /> 7. Misrepresentation
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Filing a knowingly false takedown notice or counter-notification may expose you to liability for damages, including costs and attorneys&apos; fees, incurred by the party you misidentified. Please be certain of your rights before submitting a notice.
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
                  <strong style={{ color: 'var(--text)' }}>1. Merchant-Uploaded Content:</strong>
                  <p style={{ marginTop: 2 }}>Storefront listings and images are controlled by merchants, not Frontstore. Report infringing listings directly to us.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>2. Fast Response:</strong>
                  <p style={{ marginTop: 2 }}>Complete notices are actioned expeditiously and the affected merchant is notified.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>3. Right to Counter-Notify:</strong>
                  <p style={{ marginTop: 2 }}>Merchants can dispute a takedown they believe is a mistake or misidentification.</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>4. Repeat Infringers Removed:</strong>
                  <p style={{ marginTop: 2 }}>Accounts with a pattern of valid infringement claims are suspended or terminated.</p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Report Infringing Content
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                Found a storefront listing that uses your copyrighted work without permission? Send us a takedown notice.
              </p>
              <a
                href="mailto:dmca@frontstore.ng?subject=DMCA%20Takedown%20Notice"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >
                Email dmca@frontstore.ng
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
