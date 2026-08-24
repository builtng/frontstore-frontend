'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Megaphone, CheckCircle2, Zap, Users, Loader2, Send, RefreshCw,
} from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';
import { api } from '@/lib/api';
import type { BroadcastCampaign } from '@/types/dashboard';

const BROADCAST_AUDIENCES: Array<{ id: 'all' | 'repeat' | 'unpaid_whatsapp'; label: string; description: string }> = [
  { id: 'all', label: 'All customers', description: 'Everyone who has ever placed an order with your store.' },
  { id: 'repeat', label: 'Repeat buyers', description: 'Customers who have ordered from you more than once.' },
  { id: 'unpaid_whatsapp', label: 'Unpaid WhatsApp orders', description: 'Customers with pending WhatsApp orders awaiting payment — great for retargeting.' },
];

interface ReachTabProps {
  isPro: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
}

export default function ReachTab({ isPro, openUpgradePrompt }: ReachTabProps) {
  const [broadcastCampaigns, setBroadcastCampaigns] = useState<BroadcastCampaign[]>([]);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'repeat' | 'unpaid_whatsapp'>('all');
  const [broadcastAudiencePreview, setBroadcastAudiencePreview] = useState<{ audience: string; recipients_count: number } | null>(null);
  const [broadcastPreviewLoading, setBroadcastPreviewLoading] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const loadBroadcastCampaigns = async () => {
    setBroadcastLoading(true);
    try {
      const data = await api.get<BroadcastCampaign[]>('/v1/broadcasts');
      setBroadcastCampaigns(data || []);
    } catch (e) {
      console.error('Failed to load broadcast campaigns:', e);
    } finally {
      setBroadcastLoading(false);
    }
  };

  useEffect(() => {
    if (isPro) loadBroadcastCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const loadBroadcastAudiencePreview = async (audience: 'all' | 'repeat' | 'unpaid_whatsapp') => {
    setBroadcastPreviewLoading(true);
    setBroadcastAudiencePreview(null);
    try {
      const data = await api.get<{ audience: string; recipients_count: number }>(`/v1/broadcasts/audience-preview?audience=${audience}`);
      setBroadcastAudiencePreview(data);
    } catch (e) {
      console.error('Failed to load audience preview:', e);
    } finally {
      setBroadcastPreviewLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastSending(true);
    try {
      const json: any = await api.post('/v1/broadcasts', { audience: broadcastAudience, message: broadcastMessage.trim() });
      toast.success(json?.message || 'Broadcast campaign queued for sending.');
      setBroadcastMessage('');
      setBroadcastAudiencePreview(null);
      loadBroadcastCampaigns();
    } catch {
      toast.error('Could not queue this broadcast. Please try again.');
    } finally {
      setBroadcastSending(false);
    }
  };

  const confirmSendBroadcast = () => {
    setConfirmSendOpen(true);
  };

  const recipients = broadcastAudiencePreview?.recipients_count;

  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(255, 159, 67, 0.15)', color: '#FF9F43', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Megaphone size={32} style={{ margin: 'auto' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Broadcast Messages</h2>
        <p style={{ fontSize: 11.5, fontWeight: 800, color: '#FF9F43', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Automated Marketing & Broadcasting</p>
        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Retarget your customers automatically. Send updates, discount codes, or custom promotional messages directly to your shoppers' WhatsApp inboxes with 98% open rates.
        </p>

        <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Smart Retargeting Campaigns</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>WhatsApp Broadcast Newsletters</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Custom Discount Trigger Automations</span>
          </div>
        </div>

        <button
          onClick={() => openUpgradePrompt(
            'Broadcast reach requires Pro',
            'Automated WhatsApp campaigns and retargeting tools are available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock Reach
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: 'rgba(255, 159, 67, 0.15)', color: '#FF9F43', width: 44, height: 44, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Megaphone size={22} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Broadcast Messages</h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Send automated WhatsApp campaigns to your customers — included in your Pro plan.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">
        {/* Composer */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, height: 'fit-content' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Choose your audience
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {BROADCAST_AUDIENCES.map(seg => (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => { setBroadcastAudience(seg.id); loadBroadcastAudiencePreview(seg.id); }}
                  className="clickable"
                  style={{
                    textAlign: 'left',
                    padding: 14,
                    borderRadius: 'var(--r-lg)',
                    border: broadcastAudience === seg.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: broadcastAudience === seg.id ? 'var(--primary-light)' : 'var(--bg-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: broadcastAudience === seg.id ? 'var(--primary)' : 'var(--text)' }}>
                    <Users size={14} /> {seg.label}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{seg.description}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {broadcastPreviewLoading ? (
                <><Loader2 size={13} className="spinner" /> Calculating audience size...</>
              ) : broadcastAudiencePreview ? (
                <><Users size={13} style={{ color: 'var(--primary)' }} /> This will reach <strong style={{ color: 'var(--text)' }}>{broadcastAudiencePreview.recipients_count}</strong> customer{broadcastAudiencePreview.recipients_count === 1 ? '' : 's'}</>
              ) : null}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Compose your message
            </label>
            <textarea
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value.slice(0, 1000))}
              placeholder={"e.g. Hi {name}! 🎉 Enjoy 15% off your next order this week only — reply to this message to claim your discount."}
              rows={5}
              style={{ width: '100%', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Tip: use <code>{'{name}'}</code> to personalize each message with the customer's name.</span>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0, marginLeft: 12 }}>{broadcastMessage.length}/1000</span>
            </div>
          </div>

          <button
            type="button"
            onClick={confirmSendBroadcast}
            disabled={!broadcastMessage.trim() || broadcastMessage.trim().length < 5 || broadcastSending || !broadcastAudiencePreview?.recipients_count}
            className="btn btn-primary clickable"
            style={{ alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, opacity: (!broadcastMessage.trim() || broadcastMessage.trim().length < 5 || broadcastSending || !broadcastAudiencePreview?.recipients_count) ? 0.6 : 1 }}
          >
            {broadcastSending ? <><Loader2 size={16} className="spinner" /> Queuing...</> : <><Send size={16} /> Review &amp; Send Broadcast</>}
          </button>
        </div>

        {/* Campaign History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 900 }}>Campaign History</h3>
            <button onClick={loadBroadcastCampaigns} className="btn btn-ghost clickable" style={{ padding: 6, color: 'var(--primary)' }} title="Refresh"><RefreshCw size={14} /></button>
          </div>
          {broadcastLoading && broadcastCampaigns.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
              <Loader2 size={22} className="spinner" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: 12.5 }}>Loading campaigns...</p>
            </div>
          ) : broadcastCampaigns.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
              <Megaphone size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p style={{ fontSize: 13, fontWeight: 700 }}>No campaigns sent yet.</p>
              <p style={{ fontSize: 11.5, marginTop: 4 }}>Compose your first broadcast above to start retargeting your customers.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {broadcastCampaigns.map(c => {
                const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
                  queued: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', label: 'Queued' },
                  sending: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', label: 'Sending' },
                  completed: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', label: 'Completed' },
                  failed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Failed' },
                };
                const st = statusStyles[c.status] || statusStyles.queued;
                const segLabel = BROADCAST_AUDIENCES.find(a => a.id === c.audience)?.label || c.audience;
                return (
                  <div key={c.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800 }}>{segLabel}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: st.bg, color: st.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.message}</p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700 }}>
                      <span>{c.recipients_count} recipient{c.recipients_count === 1 ? '' : 's'}</span>
                      {c.status === 'completed' && <span style={{ color: '#16a34a' }}>{c.sent_count} sent</span>}
                      {c.status === 'completed' && c.failed_count > 0 && <span style={{ color: '#ef4444' }}>{c.failed_count} failed</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmSendOpen}
        title="Send broadcast campaign?"
        description={`This message will be sent via WhatsApp to ${recipients ?? 'all matching'} customer${recipients === 1 ? '' : 's'} in the "${BROADCAST_AUDIENCES.find(a => a.id === broadcastAudience)?.label}" segment. This cannot be undone.`}
        confirmLabel="Send Broadcast"
        cancelLabel="Cancel"
        loading={broadcastSending}
        onConfirm={async () => { await handleSendBroadcast(); setConfirmSendOpen(false); }}
        onCancel={() => setConfirmSendOpen(false)}
      />
    </div>
  );
}
