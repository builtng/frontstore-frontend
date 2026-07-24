'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAdmin } from '../AdminContext';
import {
  Mail, MessageCircle, Send, Loader2, Users, UserPlus, UserMinus, Globe, Sparkles,
  CalendarDays, CalendarRange, Image as ImageIcon, X, Wand2, Search, Eye, UserCog, Check,
} from 'lucide-react';

type Channel = 'email' | 'whatsapp';
type Segment = 'all' | 'new' | 'old' | 'inactive' | 'month' | 'year' | 'individual';

type RecipientResult = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  store_name: string | null;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SEGMENTS: Array<{ value: Segment; label: string; desc: string; icon: React.ReactNode }> = [
  { value: 'all', label: 'Everyone', desc: 'Every merchant with a store on the platform.', icon: <Globe size={16} /> },
  { value: 'new', label: 'New Merchants', desc: 'Signed up within the selected number of days.', icon: <UserPlus size={16} /> },
  { value: 'old', label: 'Existing Merchants', desc: 'Signed up more than the selected number of days ago.', icon: <Users size={16} /> },
  { value: 'inactive', label: 'Inactive Merchants', desc: "Haven't logged in within the selected number of days.", icon: <UserMinus size={16} /> },
  { value: 'month', label: 'Signed Up In Month', desc: 'Merchants who joined in a specific month & year.', icon: <CalendarDays size={16} /> },
  { value: 'year', label: 'Signed Up In Year', desc: 'Merchants who joined anywhere in a specific year.', icon: <CalendarRange size={16} /> },
  { value: 'individual', label: 'Choose Individually', desc: 'Search and hand-pick specific merchants.', icon: <UserCog size={16} /> },
];

const AUTOMATIC_EMAILS = [
  { title: 'Welcome Email', trigger: 'Sent automatically right after a merchant completes signup.' },
  { title: 'Store Live — First Product Posted', trigger: 'Sent the moment a merchant publishes their very first product or service.' },
  { title: 'First Sale Celebration', trigger: 'Sent the moment a merchant receives their first paid order.' },
  { title: 'Payment Failed', trigger: 'Sent when a Pro/Legend subscription renewal charge fails.' },
  { title: 'Pro/Legend Upgrade Confirmation', trigger: 'Sent immediately after a successful plan upgrade.' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function AdminEmailsPage() {
  const { token, apiUrl, getHeaders, handleFetchResponse, openConfirmationDialog } = useAdmin();

  const [channel, setChannel] = useState<Channel>('email');
  const [segment, setSegment] = useState<Segment>('all');
  const [days, setDays] = useState(30);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Individual-recipient searchable picker
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientResults, setRecipientResults] = useState<RecipientResult[]>([]);
  const [recipientSearching, setRecipientSearching] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<RecipientResult[]>([]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [aiTopic, setAiTopic] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const activeSegment = SEGMENTS.find((s) => s.value === segment)!;
  const needsDays = segment === 'new' || segment === 'old' || segment === 'inactive';
  const recipientIds = selectedRecipients.map((r) => r.id);

  // Audience count
  useEffect(() => {
    if (!token) return;
    if (segment === 'individual') {
      setAudienceCount(selectedRecipients.length);
      return;
    }
    let cancelled = false;

    const loadCount = async () => {
      try {
        setCountLoading(true);
        const query = new URLSearchParams({ segment, days: String(days), month: String(month), year: String(year) });
        const res = await fetch(`${apiUrl}/v1/admin/${channel === 'email' ? 'emails' : 'whatsapp'}/audience-preview?${query.toString()}`, {
          headers: getHeaders(),
        });
        const json = await handleFetchResponse(res, 'Could not load audience count.');
        if (!cancelled) setAudienceCount(json.data?.count ?? 0);
      } catch {
        if (!cancelled) setAudienceCount(null);
      } finally {
        if (!cancelled) setCountLoading(false);
      }
    };

    loadCount();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, channel, segment, days, month, year, selectedRecipients.length]);

  // Debounced recipient search
  useEffect(() => {
    if (!token || segment !== 'individual' || !recipientQuery.trim()) {
      setRecipientResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setRecipientSearching(true);
        const res = await fetch(`${apiUrl}/v1/admin/emails/search-recipients?q=${encodeURIComponent(recipientQuery.trim())}`, {
          headers: getHeaders(),
        });
        const json = await handleFetchResponse(res, 'Could not search merchants.');
        if (!cancelled) setRecipientResults(json.data || []);
      } catch {
        if (!cancelled) setRecipientResults([]);
      } finally {
        if (!cancelled) setRecipientSearching(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, segment, recipientQuery]);

  const toggleRecipient = (r: RecipientResult) => {
    setSelectedRecipients((prev) =>
      prev.some((p) => p.id === r.id) ? prev.filter((p) => p.id !== r.id) : [...prev, r]
    );
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${apiUrl}/v1/admin/emails/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await handleFetchResponse(res, 'Could not upload image.');
      setImageUrl(json.url);
    } catch (err: any) {
      toast.error(err.message || 'Could not upload image.');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const audienceLabel = () => {
    if (segment === 'individual') return `${selectedRecipients.length} hand-picked merchant(s)`;
    if (segment === 'month') return `${MONTHS[month - 1]} ${year} sign-ups`;
    if (segment === 'year') return `${year} sign-ups`;
    if (needsDays) return `${activeSegment.label} (last ${days} days)`;
    return activeSegment.label;
  };

  const handleAiSuggest = async () => {
    if (!aiTopic.trim()) {
      toast.warning('Describe what the message is about first (e.g. "we just launched custom domains").');
      return;
    }
    try {
      setAiSuggesting(true);
      const res = await fetch(`${apiUrl}/v1/admin/emails/suggest-content`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ topic: aiTopic.trim(), segment }),
      });
      const json = await handleFetchResponse(res, 'Could not generate a suggestion.');
      setSubject(json.data.subject);
      setBody(channel === 'email' ? json.data.body : json.data.body.replace(/\n\n+/g, '\n\n'));
      setShowAiPrompt(false);
      setAiTopic('');
      toast.success('Draft generated — feel free to edit before sending.');
    } catch (err: any) {
      toast.error(err.message || 'Could not generate a suggestion.');
    } finally {
      setAiSuggesting(false);
    }
  };

  const handlePreview = async () => {
    if (channel === 'whatsapp') {
      setPreviewOpen(true);
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.warning('Please enter a subject and message body first.');
      return;
    }
    try {
      setPreviewLoading(true);
      setPreviewOpen(true);
      const res = await fetch(`${apiUrl}/v1/admin/emails/preview`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), image_url: imageUrl }),
      });
      const json = await handleFetchResponse(res, 'Could not render preview.');
      setPreviewHtml(json.data.html);
    } catch (err: any) {
      toast.error(err.message || 'Could not render preview.');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = () => {
    if (channel === 'email' && (!subject.trim() || !body.trim())) {
      toast.warning('Please enter a subject and message body.');
      return;
    }
    if (channel === 'whatsapp' && !body.trim()) {
      toast.warning('Please write a message.');
      return;
    }
    if (segment === 'individual' && selectedRecipients.length === 0) {
      toast.warning('Select at least one merchant.');
      return;
    }

    const channelLabel = channel === 'email' ? 'email' : 'WhatsApp message';

    openConfirmationDialog(
      `Send ${channel === 'email' ? 'Email' : 'WhatsApp'} Campaign`,
      `Send this ${channelLabel} to ${audienceCount ?? '...'} merchant(s) — ${audienceLabel()}? This cannot be undone once sent.`,
      async () => {
        try {
          setSending(true);
          const payload: Record<string, any> = { segment, days, month, year };
          if (segment === 'individual') payload.recipient_ids = recipientIds;

          if (channel === 'email') {
            payload.subject = subject.trim();
            payload.body = body.trim();
            payload.image_url = imageUrl;
          } else {
            payload.message = body.trim();
            payload.image_url = imageUrl;
          }

          const res = await fetch(`${apiUrl}/v1/admin/${channel === 'email' ? 'emails' : 'whatsapp'}/send`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
          });
          const json = await handleFetchResponse(res, `Could not send ${channelLabel} campaign.`);
          toast.success(json.message || `${channel === 'email' ? 'Email' : 'WhatsApp'} campaign sent.`);
          setSubject('');
          setBody('');
          setImageUrl(null);
          setSelectedRecipients([]);
        } catch (err: any) {
          toast.error(err.message || `Could not send ${channelLabel} campaign.`);
        } finally {
          setSending(false);
        }
      },
      'Send Now',
      'Cancel'
    );
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading" style={{ marginBottom: 24 }}>
        <div>
          <h2>Merchant Messages</h2>
          <p>Compose and send an email or WhatsApp message to a merchant audience, and review which messages go out automatically.</p>
        </div>
      </div>

      {/* Channel toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['email', 'whatsapp'] as Channel[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className="clickable"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8,
              border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 800,
              background: channel === c ? 'var(--primary)' : 'transparent',
              color: channel === c ? '#fff' : 'var(--text-muted)',
            }}
          >
            {c === 'email' ? <Mail size={15} /> : <MessageCircle size={15} />}
            {c === 'email' ? 'Email' : 'WhatsApp'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }} className="responsive-settings-grid">
        {/* Compose panel */}
        <div className="admin-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {channel === 'email' ? <Mail size={18} style={{ color: 'var(--primary)' }} /> : <MessageCircle size={18} style={{ color: 'var(--primary)' }} />}
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Compose Campaign</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audience
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {SEGMENTS.map((s) => (
                <div
                  key={s.value}
                  onClick={() => setSegment(s.value)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 8,
                    background: segment === s.value ? 'rgba(18, 140, 126, 0.05)' : 'var(--surface-2)',
                    border: segment === s.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: segment === s.value ? 'var(--primary)' : 'var(--text-muted)', marginTop: 2 }}>{s.icon}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)' }}>{s.label}</strong>
                    <small style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{s.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {needsDays && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Number of Days
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                className="input-field"
                style={{ maxWidth: 160 }}
              />
            </div>
          )}

          {(segment === 'month' || segment === 'year') && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {segment === 'month' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Month
                  </label>
                  <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="input-field" style={{ minWidth: 160, cursor: 'pointer' }}>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Year
                </label>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-field" style={{ minWidth: 120, cursor: 'pointer' }}>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {segment === 'individual' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Search Merchants
              </label>

              {selectedRecipients.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {selectedRecipients.map((r) => (
                    <span
                      key={r.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 10px',
                        background: 'rgba(18, 140, 126, 0.1)', color: 'var(--primary)', borderRadius: 999,
                        fontSize: 12.5, fontWeight: 700,
                      }}
                    >
                      {r.store_name || r.name}
                      <button
                        type="button"
                        onClick={() => toggleRecipient(r)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', padding: 2 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Search by merchant name, email, or store name..."
                  value={recipientQuery}
                  onChange={(e) => { setRecipientQuery(e.target.value); setShowRecipientDropdown(true); }}
                  onFocus={() => setShowRecipientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowRecipientDropdown(false), 150)}
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                />
                {recipientSearching && (
                  <Loader2 size={15} className="admin-spin" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                )}

                {showRecipientDropdown && recipientQuery.trim() && recipientResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, zIndex: 20,
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                    boxShadow: '0 12px 28px rgba(0,0,0,0.18)', maxHeight: 260, overflowY: 'auto',
                  }}>
                    {recipientResults.map((r) => {
                      const isSelected = selectedRecipients.some((p) => p.id === r.id);
                      return (
                        <div
                          key={r.id}
                          onMouseDown={(e) => { e.preventDefault(); toggleRecipient(r); }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                            padding: '10px 14px', cursor: 'pointer',
                            background: isSelected ? 'rgba(18, 140, 126, 0.06)' : 'transparent',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div>
                            <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)' }}>{r.store_name || r.name}</strong>
                            <small style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)' }}>{r.email || r.phone || '—'}</small>
                          </div>
                          {isSelected && <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px',
            background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)',
          }}>
            {countLoading ? <Loader2 size={14} className="admin-spin" /> : <Users size={14} />}
            {countLoading ? 'Counting recipients...' : (
              <span><strong style={{ color: 'var(--text)' }}>{audienceCount ?? 0}</strong> merchant(s) match this audience</span>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            {!showAiPrompt ? (
              <button
                type="button"
                onClick={() => setShowAiPrompt(true)}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <Wand2 size={15} /> AI: Draft This For Me
              </button>
            ) : (
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(18, 140, 126, 0.05)', border: '1px solid var(--primary)' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  What's this message about?
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="e.g. we just launched custom domains, come check it out"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiSuggest(); } }}
                    className="input-field"
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiSuggesting}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 18px', whiteSpace: 'nowrap' }}
                  >
                    {aiSuggesting ? <Loader2 size={15} className="admin-spin" /> : <Wand2 size={15} />}
                    Generate
                  </button>
                  <button type="button" onClick={() => setShowAiPrompt(false)} className="btn btn-outline" style={{ padding: '0 14px' }}>
                    <X size={15} />
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Drafts a subject + message for this audience — you can edit before sending.
                </small>
              </div>
            )}
          </div>

          {channel === 'email' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. New feature: Custom domains are here!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
                maxLength={150}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Message
            </label>
            <textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={channel === 'email' ? 8000 : 1500}
              className="input-field"
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
            <small style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: 'var(--text-faint)' }}>
              {channel === 'email'
                ? "Sent inside Frontstore's branded email template (logo, colors, signature) — no HTML knowledge needed."
                : 'Sent as a plain WhatsApp message via your Frontstore business number.'}
            </small>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {channel === 'email' ? 'Promotional Image (optional)' : 'Attach Photo (optional)'}
            </label>
            {imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imageUrl} alt="Campaign attachment" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 10, border: '1px solid var(--border)', display: 'block' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  style={{
                    position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
              >
                {imageUploading ? <Loader2 size={15} className="admin-spin" /> : <ImageIcon size={15} />}
                {imageUploading ? 'Uploading...' : 'Attach Photo'}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}
            >
              <Eye size={16} /> Preview
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !audienceCount}
              className="btn btn-primary clickable"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
            >
              {sending ? <Loader2 size={16} className="admin-spin" /> : <Send size={16} />}
              {sending ? 'Sending...' : 'Send Campaign'}
            </button>
          </div>
        </div>

        {/* Automatic emails reference panel */}
        <div className="admin-panel" style={{ padding: 24, height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Sent Automatically</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
            These already fire on their own. For a new feature announcement, just compose a campaign and pick "Everyone".
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AUTOMATIC_EMAILS.map((item) => (
              <div key={item.title} style={{ padding: 12, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{item.title}</strong>
                <small style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.trigger}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-up"
            style={{
              width: '100%', maxWidth: channel === 'email' ? 640 : 380, maxHeight: '90vh', overflowY: 'auto',
              background: channel === 'email' ? '#fff' : 'var(--surface)', borderRadius: 16, position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 2, width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>

            {channel === 'email' ? (
              previewLoading ? (
                <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
                  <Loader2 size={24} className="admin-spin" style={{ color: 'var(--primary)' }} />
                </div>
              ) : (
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 16 }}
                />
              )
            ) : (
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                  WhatsApp Preview
                </p>
                <div style={{
                  background: '#0b141a', borderRadius: 14, padding: 16, minHeight: 160,
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '100% 20px',
                }}>
                  <div style={{
                    background: '#005c4b', color: '#e9edef', borderRadius: '10px 10px 10px 2px', padding: '10px 12px',
                    maxWidth: '85%', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    {imageUrl && (
                      <img src={imageUrl} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 8, display: 'block' }} />
                    )}
                    {body.trim() || <span style={{ opacity: 0.5 }}>Your message will appear here...</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
