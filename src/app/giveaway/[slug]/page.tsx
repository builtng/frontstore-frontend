'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Gift, AlertCircle, CheckCircle2, Trophy, ExternalLink, Heart } from 'lucide-react';

interface GiveawayTask {
  id: string;
  label: string;
  url: string | null;
}

interface GiveawayStore {
  store_name: string;
  logo_url?: string;
  total_value_given: number;
}

interface GiveawayData {
  id: string;
  title: string;
  prize: string;
  prize_value: string | null;
  currency_code: string | null;
  description: string | null;
  slug: string;
  status: 'active' | 'ended' | 'disabled';
  winner_count: number;
  tasks: GiveawayTask[];
  entries_count: number;
  entry_ends_at: string | null;
  drawn_at: string | null;
  page_settings: {
    accent_color?: string;
    cover_image_url?: string | null;
    require_email?: boolean;
    require_phone?: boolean;
    show_entrant_count?: boolean;
  };
  open_for_entry: boolean;
  store: GiveawayStore;
}

interface Winner {
  id: string;
  name: string;
  created_at: string;
}

export default function GiveawayPage() {
  const { slug } = useParams();

  const [giveaway, setGiveaway] = useState<GiveawayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [entered, setEntered] = useState(false);

  const [winners, setWinners] = useState<Winner[] | null>(null);
  const [winnersLoading, setWinnersLoading] = useState(false);

  const [now, setNow] = useState(() => Date.now());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    if (!giveaway?.entry_ends_at || giveaway.status !== 'active') return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [giveaway?.entry_ends_at, giveaway?.status]);

  useEffect(() => {
    if (!slug) return;

    const fetchGiveaway = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/giveaways/${slug}`);
        if (!res.ok) {
          throw new Error('Giveaway not found.');
        }
        const json = await res.json();
        setGiveaway(json.data);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve this giveaway.');
      } finally {
        setLoading(false);
      }
    };

    fetchGiveaway();
  }, [slug]);

  useEffect(() => {
    if (!giveaway?.drawn_at) return;

    const fetchWinners = async () => {
      try {
        setWinnersLoading(true);
        const res = await fetch(`${API_URL}/v1/public/giveaways/${slug}/winners`);
        if (res.ok) {
          const json = await res.json();
          setWinners(json.data || []);
        }
      } finally {
        setWinnersLoading(false);
      }
    };

    fetchWinners();
  }, [giveaway?.drawn_at, slug]);

  const getCurrencySymbol = (code?: string | null) => {
    if (code === 'NGN') return '₦';
    if (code === 'GHS') return 'GH₵';
    if (code === 'KES') return 'KSh';
    if (code === 'ZAR') return 'R';
    if (code === 'USD') return '$';
    if (code === 'GBP') return '£';
    return (code ? code + ' ' : '');
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !giveaway) return;

    const settings = giveaway.page_settings || {};
    if (settings.require_email && !email.trim()) {
      toast.error('Please enter your email to enter this giveaway.');
      return;
    }
    if (settings.require_phone && !phone.trim()) {
      toast.error('Please enter your phone number to enter this giveaway.');
      return;
    }
    if (giveaway.tasks.length > 0 && completedTasks.length < giveaway.tasks.length) {
      toast.error('Please confirm all tasks before entering.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/v1/public/giveaways/${slug}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          completed_tasks: completedTasks,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to enter giveaway.');
      }
      setEntered(true);
      setGiveaway(prev => prev ? { ...prev, entries_count: prev.entries_count + 1 } : prev);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong entering the giveaway.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '440px', margin: '0 auto' }}>
        <div className="shimmer-loader" style={{ height: '32px', width: '60%', margin: '48px auto 16px', borderRadius: '6px' }}></div>
        <div className="shimmer-loader" style={{ height: '18px', width: '80%', margin: '0 auto 32px', borderRadius: '4px' }}></div>
        <div className="shimmer-loader" style={{ height: '180px', width: '100%', borderRadius: '16px' }}></div>
      </div>
    );
  }

  if (error || !giveaway) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '24px', textAlign: 'center' }}>
        <Search size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Giveaway Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px' }}>{error || "We couldn't locate this giveaway. Please verify the link and try again."}</p>
        <a href="/" style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }} className="clickable">Go to home</a>
      </div>
    );
  }

  const { store } = giveaway;
  const accent = giveaway.page_settings?.accent_color || '#25D366';
  const currencySymbol = getCurrencySymbol(giveaway.currency_code);
  const showEntrantCount = giveaway.page_settings?.show_entrant_count !== false;
  const canEnter = giveaway.open_for_entry && !entered;
  const showEnded = giveaway.status === 'ended';

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      <header style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
          {store.store_name}
        </span>
      </header>

      {giveaway.page_settings?.cover_image_url && (
        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--surface-2)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={giveaway.page_settings.cover_image_url} alt={giveaway.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <main style={{ padding: '32px 16px 100px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', padding: '4px 0 4px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Gift size={22} style={{ color: accent }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>{giveaway.title}</p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Win {giveaway.prize}
          </h1>
          {giveaway.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: 8, lineHeight: 1.5 }}>{giveaway.description}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, padding: '5px 12px', borderRadius: 'var(--r-full)', background: `${accent}18`, color: accent }}>
              {giveaway.winner_count} winner{giveaway.winner_count > 1 ? 's' : ''}
            </span>
            {showEntrantCount && (
              <span style={{ fontSize: 11.5, fontWeight: 800, padding: '5px 12px', borderRadius: 'var(--r-full)', background: 'var(--bg-2)', color: 'var(--text-muted)' }}>
                {giveaway.entries_count} {giveaway.entries_count === 1 ? 'entry' : 'entries'} so far
              </span>
            )}
          </div>
        </div>

        {giveaway.status === 'active' && giveaway.entry_ends_at && (() => {
          const remainingMs = new Date(giveaway.entry_ends_at).getTime() - now;
          if (remainingMs <= 0) return null;
          const totalSeconds = Math.floor(remainingMs / 1000);
          const days = Math.floor(totalSeconds / 86400);
          const hours = Math.floor((totalSeconds % 86400) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          const units = [
            { label: 'Days', value: days },
            { label: 'Hrs', value: hours },
            { label: 'Min', value: minutes },
            { label: 'Sec', value: seconds },
          ];
          return (
            <div className="card" style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: 10 }}>
                Entries close in
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {units.map(u => (
                  <div key={u.label} style={{ textAlign: 'center', minWidth: 46 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, color: accent, background: `${accent}14`, borderRadius: 'var(--r-md)', padding: '6px 0' }}>
                      {String(u.value).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', marginTop: 4, textTransform: 'uppercase' }}>{u.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {store.total_value_given > 0 && (
          <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, background: `${accent}0d` }}>
            <Heart size={18} style={{ color: accent, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
              <strong>{store.store_name}</strong> has given away <strong>{currencySymbol}{store.total_value_given.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> in love to followers so far.
            </p>
          </div>
        )}

        {showEnded && (
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(217,119,6,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={19} style={{ color: '#d97706' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Winner{giveaway.winner_count > 1 ? 's' : ''} Selected</h3>
            {winnersLoading ? (
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>Loading winners...</p>
            ) : winners && winners.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {winners.map(w => (
                  <div key={w.id} style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-2)', fontSize: 13.5, fontWeight: 700 }}>
                    🎉 {w.name}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>Winners have been notified directly.</p>
            )}
          </div>
        )}

        {!giveaway.open_for_entry && !showEnded && !entered && (
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <AlertCircle size={19} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Entries Closed</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              This giveaway is no longer accepting entries.
            </p>
          </div>
        )}

        {entered && (
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={19} style={{ color: accent }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>You're In!</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Thanks for entering, {name.split(' ')[0] || 'friend'}! {store.store_name} will announce winners here soon.
            </p>
          </div>
        )}

        {canEnter && giveaway.tasks.length > 0 && (
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Complete these to enter
            </label>
            {giveaway.tasks.map(task => (
              <label key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={completedTasks.includes(task.id)}
                  onChange={() => toggleTask(task.id)}
                  style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                  {task.label}
                  {task.url && (
                    <a href={task.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ marginLeft: 6, color: accent, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}

        {canEnter && (
          <form onSubmit={handleSubmit} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Your name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-control"
                placeholder="e.g. Chidinma"
                maxLength={150}
              />
            </div>

            {giveaway.page_settings?.require_email !== false && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="you@example.com"
                  maxLength={190}
                />
              </div>
            )}

            {giveaway.page_settings?.require_phone && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Phone number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="form-control"
                  placeholder="e.g. 08012345678"
                  maxLength={30}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary clickable"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                backgroundColor: accent,
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Entering...' : 'Enter Giveaway'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
