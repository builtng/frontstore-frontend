'use client';

import React from 'react';
import { toast } from 'sonner';
import { Copy, Store } from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import type { StoreInfo, Product } from '@/types/dashboard';

interface ShareTabProps {
  store: StoreInfo | null;
  products: Product[];
  systemDomain: string;
}

export default function ShareTab({ store, products, systemDomain }: ShareTabProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-share-grid animate-fade-in">

      {/* Share Store Card */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Viral Share Center</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>Share your catalog link to receive instant shopper orders directly into your dashboard.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* URL Box */}
          <div style={{ background: 'var(--bg-2)', padding: '16px 20px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store URL</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)', wordBreak: 'break-all' }}>
                {store?.custom_domain ? store.custom_domain : (store ? `${systemDomain}/${store.username}` : systemDomain)}
              </span>
              <button
                onClick={() => {
                  const storeUrl = store?.custom_domain ? `https://${store.custom_domain}` : `https://${systemDomain}/${store?.username}`;
                  navigator.clipboard.writeText(storeUrl);
                  toast.success('Store link copied! 📋');
                }}
                className="btn btn-outline clickable"
                style={{ padding: '6px 12px', fontSize: 11, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>

          {/* WhatsApp share CTA */}
          <button
            onClick={() => {
              const url = store?.custom_domain ? `https://${store.custom_domain}` : `https://${systemDomain}/${store?.username}`;
              const msg = encodeURIComponent(`🏪 Check out my digital store on Frontstore! Shop here: ${url}`);
              window.open(`https://wa.me/?text=${msg}`, '_blank');
            }}
            className="btn clickable"
            style={{ background: '#25d366', color: '#fff', padding: '14px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <WhatsAppIcon size={18} color="#fff" /> Share Store link on WhatsApp
          </button>

          {/* Visual storefront banner mock */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--bg-2)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '16px 20px', color: '#fff' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Store size={18} /> Shop Live: {store?.store_name}
              </h4>
              <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Fast browsing · Easy WhatsApp checkouts</p>
            </div>
            <div style={{ padding: 16, display: 'flex', gap: 10, overflowX: 'auto' }}>
              {products.slice(0, 3).map(p => (
                <div key={p.id} style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', width: 100, flexShrink: 0 }}>
                  <div style={{ width: '100%', height: 60, background: 'var(--bg-2)', borderRadius: 'var(--r-md)', overflow: 'hidden', position: 'relative' }}>
                    {p.image_urls?.[0] && <img src={p.image_urls[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 6 }}>{p.name}</p>
                  <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: 2 }}>{getCurrencySymbol(store?.currency_code)}{formatVal(p.price)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Viral referrals panel */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900 }}>Referral Reward Center</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Earn commissions by introducing other vendors to Frontstore.</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.02))', border: '1.5px dashed var(--primary)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>EARN MONEY</span>
          <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', margin: '8px 0 2px' }}>
            ₦1,500
          </p>
          <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>Paid for each store referral that publishes a product</span>
        </div>

        {/* Ref Link */}
        <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your referral link</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{systemDomain}/ref/{store?.username}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://${systemDomain}/ref/${store?.username}`);
                toast.success('Referral link copied! 💰');
              }}
              className="btn btn-outline clickable"
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)' }}
            >
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
