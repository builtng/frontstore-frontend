'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Link, CheckCircle2, Zap, Loader2, Plus, Copy, BarChart3, Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toggle from '@/components/Toggle';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { getCurrencySymbol } from '@/utils/currency';
import type { StoreInfo } from '@/types/dashboard';

interface PaymentLink {
  id: string;
  slug: string;
  title: string;
  amount: number | string;
  amount_received?: number | string;
  allow_custom_amount: boolean;
  type: 'one_time' | 'reusable';
  currency_code?: string | null;
  status: 'active' | 'paid' | 'disabled';
}

interface PaymentLinksTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = { NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', USD: '$' };

export default function PaymentLinksTab({ store, isPro, openUpgradePrompt }: PaymentLinksTabProps) {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [paymentLinksLoading, setPaymentLinksLoading] = useState(false);
  const [isAddPaymentLinkOpen, setIsAddPaymentLinkOpen] = useState(false);
  const [newPaymentLinkData, setNewPaymentLinkData] = useState({
    title: '',
    amount: '',
    allow_custom_amount: false,
    type: 'one_time' as 'one_time' | 'reusable',
    expires_at: ''
  });
  const [createdPaymentLink, setCreatedPaymentLink] = useState<any>(null);
  const [statsModalLink, setStatsModalLink] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsSaving, setStatsSaving] = useState(false);
  const [statsSettingsDraft, setStatsSettingsDraft] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPaymentLinksData = async () => {
    try {
      setPaymentLinksLoading(true);
      const data = await api.get<PaymentLink[]>('/v1/payment-links');
      setPaymentLinks(data || []);
    } catch {
      toast.error('Failed to load payment links.');
    } finally {
      setPaymentLinksLoading(false);
    }
  };

  useEffect(() => {
    if (isPro) fetchPaymentLinksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const openStatsModal = async (pl: PaymentLink) => {
    setStatsModalLink(pl);
    setStatsData(null);
    setStatsLoading(true);
    try {
      const data: any = await api.get(`/v1/payment-links/${pl.id}/stats`);
      setStatsData(data);
      setStatsSettingsDraft({ stats_public: data.stats_public, ...data.page_settings });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load payment link stats.');
      setStatsModalLink(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const saveStatsSettings = async () => {
    if (!statsModalLink || !statsSettingsDraft) return;
    setStatsSaving(true);
    try {
      const { stats_public, ...pageSettings } = statsSettingsDraft;
      await api.put(`/v1/payment-links/${statsModalLink.id}`, { stats_public, page_settings: pageSettings });
      toast.success('Stats page settings saved.');
      setStatsData((prev: any) => prev ? { ...prev, stats_public, page_settings: pageSettings } : prev);
      fetchPaymentLinksData();
    } catch {
      toast.error('Network error saving settings.');
    } finally {
      setStatsSaving(false);
    }
  };

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newPaymentLinkData.title,
        amount: parseFloat(newPaymentLinkData.amount),
        allow_custom_amount: newPaymentLinkData.allow_custom_amount,
        type: newPaymentLinkData.type,
        expires_at: newPaymentLinkData.expires_at || null,
      };
      const data: any = await api.post('/v1/payment-links', payload);
      toast.success('Payment link created successfully.');
      setCreatedPaymentLink(data);
      fetchPaymentLinksData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment link.');
    }
  };

  const handleToggleLinkStatus = async (pl: PaymentLink) => {
    try {
      await api.put(`/v1/payment-links/${pl.id}`, { status: pl.status === 'disabled' ? 'active' : 'disabled' });
      toast.success(pl.status === 'disabled' ? 'Payment link reactivated.' : 'Payment link disabled.');
      fetchPaymentLinksData();
    } catch {
      toast.error('Failed to update payment link.');
    }
  };

  const handleDeletePaymentLink = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/v1/payment-links/${deleteTarget.id}`);
      toast.success('Payment link deleted.');
      setPaymentLinks(prev => prev.filter(p => p.id !== deleteTarget.id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete payment link.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: 'var(--primary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Link size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Payment Links</h2>
        <p style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Get Paid Instantly</p>
        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Generate a shareable link customers can pay directly — no cart or storefront needed. Perfect for one-off sales, deposits, and tips.
        </p>

        <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Fixed-price or custom-amount links</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>One-time or reusable payment links</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Share anywhere — no storefront required</span>
          </div>
        </div>

        <button
          onClick={() => openUpgradePrompt(
            'Payment Links requires Pro',
            'Shareable payment links for instant checkout are available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock Payment Links
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)', flexShrink: 0
          }}>
            <Link size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Payment Links
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Generate a link customers can pay directly — no cart or storefront needed.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setNewPaymentLinkData({ title: '', amount: '', allow_custom_amount: false, type: 'one_time', expires_at: '' });
            setCreatedPaymentLink(null);
            setIsAddPaymentLinkOpen(true);
          }}
          className="btn btn-primary clickable"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13.5 }}
        >
          <Plus size={16} /> Create Payment Link
        </button>
      </div>

      {/* Payment Links List */}
      {paymentLinksLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : paymentLinks.length === 0 ? (
        <div className="card text-center" style={{ padding: 40 }}>
          <p style={{ color: 'var(--text-muted)' }}>No payment links yet. Click "Create Payment Link" to generate one.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Title</th>
                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Received</th>
                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentLinks.map(pl => {
                const symbol = CURRENCY_SYMBOLS[pl.currency_code || 'NGN'] || (pl.currency_code || '') + ' ';
                const linkUrl = typeof window !== 'undefined' ? `${window.location.origin}/pay/${pl.slug}` : `/pay/${pl.slug}`;
                return (
                  <tr key={pl.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{pl.title}</td>
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800 }}>{pl.allow_custom_amount ? 'From ' : ''}{symbol}{parseFloat(pl.amount as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800, color: 'var(--success)' }}>{symbol}{parseFloat((pl.amount_received || 0) as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {pl.type === 'one_time' ? 'One-time' : 'Reusable'}
                      {pl.allow_custom_amount && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-faint)' }}>Custom amount</span>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--r-full)',
                        background: pl.status === 'paid' ? 'rgba(34,197,94,0.1)' : (pl.status === 'disabled' ? 'rgba(156,163,175,0.1)' : 'rgba(59,130,246,0.1)'),
                        color: pl.status === 'paid' ? 'var(--success)' : (pl.status === 'disabled' ? 'var(--text-muted)' : 'var(--primary)'),
                        textTransform: 'uppercase'
                      }}>
                        {pl.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openStatsModal(pl)}
                          className="btn btn-outline clickable"
                          style={{ padding: '4px 8px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <BarChart3 size={12} /> Stats
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(linkUrl);
                            toast.success('Payment link copied! 📋');
                          }}
                          className="btn btn-outline clickable"
                          style={{ padding: '4px 8px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Copy size={12} /> Copy
                        </button>
                        <button
                          onClick={() => {
                            const msg = encodeURIComponent(`💳 Pay ${symbol}${parseFloat(pl.amount as string).toLocaleString()} for "${pl.title}" here: ${linkUrl}`);
                            window.open(`https://wa.me/?text=${msg}`, '_blank');
                          }}
                          className="btn clickable"
                          style={{ background: '#25d366', color: '#fff', padding: '4px 8px', fontSize: 11.5, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <WhatsAppIcon size={12} color="#fff" /> Share
                        </button>
                        {pl.status !== 'paid' && (
                          <button
                            onClick={() => handleToggleLinkStatus(pl)}
                            className="btn btn-outline clickable"
                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                          >
                            {pl.status === 'disabled' ? 'Reactivate' : 'Disable'}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(pl)}
                          className="btn btn-outline clickable"
                          style={{ padding: '4px 8px', fontSize: 11.5, color: 'var(--danger)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: CREATE PAYMENT LINK ── */}
      <Modal
        open={isAddPaymentLinkOpen}
        onClose={() => setIsAddPaymentLinkOpen(false)}
        title={createdPaymentLink ? 'Payment Link Ready' : 'Create Payment Link'}
        maxWidth={460}
        className="responsive-modal-container"
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>
          {createdPaymentLink ? 'Share this link to get paid' : 'Set an amount and get a shareable link'}
        </p>

        {createdPaymentLink ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-2)', padding: '16px 20px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Link</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--primary-dark)', wordBreak: 'break-all' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/pay/${createdPaymentLink.slug}` : `/pay/${createdPaymentLink.slug}`}
                </span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/pay/${createdPaymentLink.slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Payment link copied! 📋');
                  }}
                  className="btn btn-outline clickable"
                  style={{ padding: '6px 12px', fontSize: 11, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/pay/${createdPaymentLink.slug}`;
                const amountText = `${getCurrencySymbol(store?.currency_code)}${parseFloat(createdPaymentLink.amount).toLocaleString()}`;
                const msg = encodeURIComponent(
                  createdPaymentLink.allow_custom_amount
                    ? `💳 Support "${createdPaymentLink.title}" (from ${amountText}) here: ${url}`
                    : `💳 Pay ${amountText} for "${createdPaymentLink.title}" here: ${url}`
                );
                window.open(`https://wa.me/?text=${msg}`, '_blank');
              }}
              className="btn clickable"
              style={{ background: '#25d366', color: '#fff', padding: '14px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
            >
              <WhatsAppIcon size={18} color="#fff" /> Share on WhatsApp
            </button>
            <div className="modal-footer">
              <button type="button" onClick={() => setIsAddPaymentLinkOpen(false)} className="btn btn-primary clickable">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreatePaymentLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field-group">
              <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" required value={newPaymentLinkData.title} onChange={e => setNewPaymentLinkData({ ...newPaymentLinkData, title: e.target.value })} className="form-control" placeholder="e.g. Consulting fee, Deposit" />
            </div>

            <div className="field-group">
              <label className="form-label">{newPaymentLinkData.allow_custom_amount ? 'Minimum Amount' : 'Amount'} ({store?.currency_code || 'NGN'}) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="number" required min={1} step="0.01" value={newPaymentLinkData.amount} onChange={e => setNewPaymentLinkData({ ...newPaymentLinkData, amount: e.target.value })} className="form-control" placeholder="e.g. 5000" />
            </div>

            <div className="field-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <label className="form-label" style={{ marginBottom: 2 }}>Let payer choose their own amount</label>
                  <p style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Turn this on for tips, donations, or "pay what you want" links.</p>
                </div>
                <Toggle
                  checked={newPaymentLinkData.allow_custom_amount}
                  onChange={val => setNewPaymentLinkData({ ...newPaymentLinkData, allow_custom_amount: val })}
                  id="payment-link-custom-amount-toggle"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="form-label">Link Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setNewPaymentLinkData({ ...newPaymentLinkData, type: 'one_time' })}
                  className="clickable"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700,
                    border: `1.5px solid ${newPaymentLinkData.type === 'one_time' ? 'var(--primary)' : 'var(--border)'}`,
                    background: newPaymentLinkData.type === 'one_time' ? 'var(--primary-light)' : 'transparent',
                    color: newPaymentLinkData.type === 'one_time' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >
                  One-time
                </button>
                <button
                  type="button"
                  onClick={() => setNewPaymentLinkData({ ...newPaymentLinkData, type: 'reusable' })}
                  className="clickable"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700,
                    border: `1.5px solid ${newPaymentLinkData.type === 'reusable' ? 'var(--primary)' : 'var(--border)'}`,
                    background: newPaymentLinkData.type === 'reusable' ? 'var(--primary-light)' : 'transparent',
                    color: newPaymentLinkData.type === 'reusable' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >
                  Reusable
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 6 }}>
                {newPaymentLinkData.type === 'one_time' ? 'Link deactivates automatically after one payment.' : 'Link stays active and can be paid by many customers.'}
              </p>
            </div>

            <div className="field-group">
              <label className="form-label">Expires On (optional)</label>
              <input type="date" value={newPaymentLinkData.expires_at} onChange={e => setNewPaymentLinkData({ ...newPaymentLinkData, expires_at: e.target.value })} className="form-control" />
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsAddPaymentLinkOpen(false)} className="btn btn-outline clickable">Cancel</button>
              <button type="submit" className="btn btn-primary clickable">Create Link</button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: PAYMENT LINK STATS & PUBLIC PAGE ── */}
      <Modal
        open={!!statsModalLink}
        onClose={() => setStatsModalLink(null)}
        title="Payment Link Stats"
        maxWidth={560}
        className="responsive-modal-container"
      >
        {statsModalLink && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>{statsModalLink.title}</p>
        )}

        {statsLoading || !statsData || !statsSettingsDraft ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 size={22} className="spin" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--bg-2)', padding: '14px 16px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Received</label>
                <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--success)', marginTop: 4 }}>
                  {getCurrencySymbol(statsData.currency_code)}{parseFloat(statsData.amount_received || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ background: 'var(--bg-2)', padding: '14px 16px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payments</label>
                <p style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>{statsData.payments_count}</p>
              </div>
            </div>

            {!statsData.allow_custom_amount && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Goal progress</span>
                  <span>{Math.min(100, Math.round((parseFloat(statsData.amount_received || 0) / Math.max(parseFloat(statsData.amount || 1), 1)) * 100))}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 'var(--r-full)', background: 'var(--bg-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (parseFloat(statsData.amount_received || 0) / Math.max(parseFloat(statsData.amount || 1), 1)) * 100)}%`, background: 'var(--primary)' }} />
                </div>
              </div>
            )}

            <div className="field-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <label className="form-label" style={{ marginBottom: 2 }}>Make stats page public</label>
                  <p style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Anyone with the link can see a public stats page for this payment link.</p>
                </div>
                <Toggle
                  checked={!!statsSettingsDraft.stats_public}
                  onChange={val => setStatsSettingsDraft({ ...statsSettingsDraft, stats_public: val })}
                  id="payment-link-stats-public-toggle"
                />
              </div>
              {statsSettingsDraft.stats_public && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 10, background: 'var(--bg-2)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary-dark)', wordBreak: 'break-all' }}>
                    {typeof window !== 'undefined' ? `${window.location.origin}/${store?.username}/paymentlink/${statsData.slug}/stats` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${store?.username}/paymentlink/${statsData.slug}/stats`);
                      toast.success('Stats link copied! 📋');
                    }}
                    className="btn btn-outline clickable"
                    style={{ padding: '4px 8px', fontSize: 11, flexShrink: 0 }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="field-group">
              <label className="form-label">Public page theme</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['minimal', 'wall', 'leaderboard'] as const).map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setStatsSettingsDraft({ ...statsSettingsDraft, theme })}
                    className="clickable"
                    style={{
                      flex: 1, padding: '10px', borderRadius: 'var(--r-md)', fontSize: 12.5, fontWeight: 700, textTransform: 'capitalize',
                      border: `1.5px solid ${statsSettingsDraft.theme === theme ? 'var(--primary)' : 'var(--border)'}`,
                      background: statsSettingsDraft.theme === theme ? 'var(--primary-light)' : 'transparent',
                      color: statsSettingsDraft.theme === theme ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="form-label">Accent color</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={statsSettingsDraft.accent_color || '#25D366'}
                  onChange={e => setStatsSettingsDraft({ ...statsSettingsDraft, accent_color: e.target.value })}
                  style={{ width: 40, height: 36, padding: 2, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={statsSettingsDraft.accent_color || ''}
                  onChange={e => setStatsSettingsDraft({ ...statsSettingsDraft, accent_color: e.target.value })}
                  className="form-control"
                  placeholder="#25D366"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="form-label">Headline (optional)</label>
              <input type="text" value={statsSettingsDraft.headline || ''} onChange={e => setStatsSettingsDraft({ ...statsSettingsDraft, headline: e.target.value })} className="form-control" placeholder="e.g. Help us hit our goal!" maxLength={150} />
            </div>

            <div className="field-group">
              <label className="form-label">Subtext (optional)</label>
              <input type="text" value={statsSettingsDraft.subtext || ''} onChange={e => setStatsSettingsDraft({ ...statsSettingsDraft, subtext: e.target.value })} className="form-control" placeholder="A short note shown under the headline" maxLength={300} />
            </div>

            <div className="field-group">
              <label className="form-label">Cover image URL (optional)</label>
              <input type="text" value={statsSettingsDraft.cover_image_url || ''} onChange={e => setStatsSettingsDraft({ ...statsSettingsDraft, cover_image_url: e.target.value })} className="form-control" placeholder="https://..." />
            </div>

            <div className="field-group">
              <label className="form-label">What the public page shows</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([
                  ['show_goal', 'Goal progress bar'],
                  ['show_amounts', 'Individual payment amounts'],
                  ['show_payer_names', 'Payer names'],
                  ['show_messages', 'Payer messages'],
                ] as const).map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                    <Toggle
                      checked={!!statsSettingsDraft[key]}
                      onChange={val => setStatsSettingsDraft({ ...statsSettingsDraft, [key]: val })}
                      id={`payment-link-${key}-toggle`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {statsData.payments.length > 0 && (
              <div className="field-group">
                <label className="form-label">Recent payments</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {statsData.payments.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 12px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.customer_name || 'Customer'}</p>
                        {p.message && <p style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.message}</p>}
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--success)', flexShrink: 0 }}>{getCurrencySymbol(statsData.currency_code)}{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" onClick={() => setStatsModalLink(null)} className="btn btn-outline clickable">Close</button>
              <button type="button" disabled={statsSaving} onClick={saveStatsSettings} className="btn btn-primary clickable">
                {statsSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Payment Link"
        description="Are you sure you want to delete this payment link? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeletePaymentLink}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
