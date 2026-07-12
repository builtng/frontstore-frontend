'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, Lock, Trophy, MessageCircle, Users, Target } from 'lucide-react';

interface StatsPayment {
  customer_name: string | null;
  amount: string | null;
  message: string | null;
  paid_at: string;
}

interface StatsData {
  id: string;
  title: string;
  slug: string;
  type: 'one_time' | 'reusable';
  status: string;
  amount: string;
  amount_received: string;
  allow_custom_amount: boolean;
  currency_code: string;
  payments_count: number;
  payments: StatsPayment[];
  page_settings: {
    theme: 'minimal' | 'wall' | 'leaderboard';
    accent_color: string;
    cover_image_url: string | null;
    headline: string | null;
    subtext: string | null;
    show_payer_names: boolean;
    show_messages: boolean;
    show_amounts: boolean;
    show_goal: boolean;
  };
  store: {
    store_name: string;
    username: string;
    logo_url: string | null;
  };
}

const getCurrencySymbol = (code?: string) => {
  if (code === 'NGN') return '₦';
  if (code === 'GHS') return 'GH₵';
  if (code === 'KES') return 'KSh';
  if (code === 'ZAR') return 'R';
  if (code === 'USD') return '$';
  if (code === 'GBP') return '£';
  return (code ? code + ' ' : '');
};

export default function PaymentLinkStatsPage() {
  const { slug } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/payment-links/${slug}/stats`);
        if (res.status === 403) {
          setIsPrivate(true);
          return;
        }
        if (!res.ok) {
          throw new Error('Stats not found.');
        }
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Unable to load stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <div className="shimmer-loader" style={{ height: 32, width: '60%', margin: '48px auto 16px', borderRadius: 6 }} />
        <div className="shimmer-loader" style={{ height: 120, width: '100%', borderRadius: 16, marginBottom: 16 }} />
        <div className="shimmer-loader" style={{ height: 200, width: '100%', borderRadius: 16 }} />
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, textAlign: 'center' }}>
        <Lock size={44} strokeWidth={1.5} style={{ color: 'var(--text-faint)', marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Stats Are Private</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 320 }}>The owner of this payment link hasn&apos;t made its stats public.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, textAlign: 'center' }}>
        <Search size={44} strokeWidth={1.5} style={{ color: 'var(--text-faint)', marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Stats Not Found</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 320 }}>{error || "We couldn't locate stats for this payment link."}</p>
      </div>
    );
  }

  const settings = data.page_settings;
  const accent = settings.accent_color || '#25D366';
  const symbol = getCurrencySymbol(data.currency_code);
  const received = parseFloat(data.amount_received || '0');
  const goal = parseFloat(data.amount || '0');
  const progressPct = goal > 0 ? Math.min(100, Math.round((received / goal) * 100)) : 0;
  const visiblePayments = data.payments.filter(p => p.customer_name || p.amount || p.message);
  const rankedPayments = [...visiblePayments].sort((a, b) => (parseFloat(b.amount || '0') - parseFloat(a.amount || '0')));

  const Header = () => (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: `${accent}22`, color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900,
        fontFamily: 'var(--font-heading)', margin: '0 auto 12px',
      }}>
        {(data.store.store_name || 'F').charAt(0).toUpperCase()}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 700 }}>{data.store.store_name}</p>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginTop: 6, color: 'var(--text)' }}>
        {settings.headline || data.title}
      </h1>
      {settings.subtext && (
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
          {settings.subtext}
        </p>
      )}
    </div>
  );

  const StatRow = () => (
    <div style={{ display: 'flex', gap: 10, marginBottom: settings.show_goal && !data.allow_custom_amount ? 16 : 24 }}>
      <div className="card" style={{ flex: 1, padding: '16px 14px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Received</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: accent, marginTop: 4 }}>{symbol}{received.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>
      <div className="card" style={{ flex: 1, padding: '16px 14px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supporters</p>
        <p style={{ fontSize: 22, fontWeight: 900, marginTop: 4, color: 'var(--text)' }}>{data.payments_count}</p>
      </div>
    </div>
  );

  const GoalBar = () => (
    !data.allow_custom_amount && settings.show_goal ? (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700 }}>
          <span><Target size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />Goal: {symbol}{goal.toLocaleString()}</span>
          <span>{progressPct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: accent, transition: 'width 0.6s ease' }} />
        </div>
      </div>
    ) : null
  );

  const EmptyState = () => (
    <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
      No payments yet. Be the first to support {data.store.store_name}!
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {settings.cover_image_url && (
        <div style={{ width: '100%', height: 160, overflow: 'hidden', background: 'var(--surface-2)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <main style={{ padding: '32px 18px 60px' }}>
        <Header />
        <StatRow />
        <GoalBar />

        {settings.theme === 'leaderboard' && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trophy size={13} /> Top Supporters
            </p>
            {rankedPayments.length === 0 ? <EmptyState /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rankedPayments.map((p, i) => (
                  <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? `${accent}33` : 'var(--surface-2)', color: i === 0 ? accent : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                        {p.customer_name || 'Anonymous'}
                      </p>
                      {p.message && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.message}</p>
                      )}
                    </div>
                    {p.amount && (
                      <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, flexShrink: 0 }}>{symbol}{parseFloat(p.amount).toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {settings.theme === 'wall' && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={13} /> Messages of Support
            </p>
            {visiblePayments.length === 0 ? <EmptyState /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {visiblePayments.map((p, i) => (
                  <div key={i} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, borderTop: `3px solid ${accent}` }}>
                    <p style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)' }}>{p.customer_name || 'Anonymous'}</p>
                    {p.message && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>&ldquo;{p.message}&rdquo;</p>}
                    {p.amount && <p style={{ fontSize: 13, fontWeight: 900, color: accent, marginTop: 'auto' }}>{symbol}{parseFloat(p.amount).toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {settings.theme === 'minimal' && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} /> Recent Payments
            </p>
            {visiblePayments.length === 0 ? <EmptyState /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visiblePayments.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.customer_name || 'Anonymous'}</p>
                      {p.message && <p style={{ fontSize: 11.5, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.message}</p>}
                    </div>
                    {p.amount && <span style={{ fontSize: 13, fontWeight: 800, color: accent, flexShrink: 0 }}>{symbol}{parseFloat(p.amount).toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', marginTop: 32 }}>
          Powered by Frontstore
        </p>
      </main>
    </div>
  );
}
