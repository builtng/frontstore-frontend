'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Inbox, MessageSquare, Sparkles } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import Modal from '@/components/Modal';

interface InboxTabProps {
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

export default function InboxTab({ isPro, navigateDashboardTab }: InboxTabProps) {
  const apiUrl = getApiUrl();

  const [conversations, setConversations] = useState<any[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [activeConversationMessages, setActiveConversationMessages] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<any[]>([]);
  const [replyMessageText, setReplyMessageText] = useState('');
  const [isAddQuickReplyOpen, setIsAddQuickReplyOpen] = useState(false);
  const [newQuickReplyShortcut, setNewQuickReplyShortcut] = useState('');
  const [newQuickReplyMessage, setNewQuickReplyMessage] = useState('');
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const fetchInboxData = async () => {
    if (!isPro) return;
    try {
      setInboxLoading(true);
      const [resConvs, resReplies, resTemplates] = await Promise.all([
        fetch(`${apiUrl}/v1/inbox/conversations`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/inbox/quick-replies`, { credentials: 'include' }),
        fetch(`${apiUrl}/v1/inbox/templates`, { credentials: 'include' }),
      ]);
      if (resConvs.ok) setConversations((await resConvs.json()).data.data || []);
      if (resReplies.ok) setQuickReplies((await resReplies.json()).data);
      if (resTemplates.ok) setMessageTemplates((await resTemplates.json()).data);
    } catch (e) {
      toast.error('Failed to load unified inbox.');
    } finally {
      setInboxLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const fetchConversationMessages = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/inbox/conversations/${id}`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok) {
        setActiveConversation(json.data.conversation);
        setActiveConversationMessages(json.data.messages);
      }
    } catch (e) {
      toast.error('Failed to load messages.');
    }
  };

  const handleCreateQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/v1/inbox/quick-replies`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortcut: newQuickReplyShortcut, message: newQuickReplyMessage }),
      });
      if (res.ok) {
        toast.success('Quick reply created.');
        setIsAddQuickReplyOpen(false);
        setNewQuickReplyShortcut('');
        setNewQuickReplyMessage('');
        fetchInboxData();
      }
    } catch { toast.error('Error saving quick reply'); }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/v1/inbox/templates`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTemplateName, content: newTemplateContent }),
      });
      if (res.ok) {
        toast.success('Template saved successfully.');
        setIsAddTemplateOpen(false);
        setNewTemplateName('');
        setNewTemplateContent('');
        fetchInboxData();
      }
    } catch { toast.error('Error saving message template'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="no-scrollbar animate-fade-in">
      {!isPro ? (
        <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <Inbox size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Unified Customer Communications Center</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Consolidate customer conversations from WhatsApp API, email logs, and storefront contact pages in one central inbox with custom message templates and slash-command quick replies.
            </p>
          </div>
          <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
            🚀 Upgrade to Pro Plan
          </button>
        </div>
      ) : (
        <>
          {/* Grid layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: 20, height: 'calc(100vh - 200px)', minHeight: 560, alignItems: 'stretch' }}>
            {/* 1. Conversations List Pane */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Inbox size={16} /> Chats Inbox
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                {conversations.map((c: any) => {
                  const active = activeConversation?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => fetchConversationMessages(c.id)}
                      className="clickable text-left"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--r-md)',
                        background: active ? 'var(--card-hover)' : 'none',
                        border: active ? '1px solid var(--border)' : '1px solid transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                          {c.customer_name}
                        </span>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                          {c.source === 'whatsapp' && '💬 WA'}
                          {c.source === 'email' && '✉️ Email'}
                          {c.source === 'contact_form' && '📄 Form'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: 11.5, color: 'var(--text-muted)' }}>
                        <span className="badge" style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          background: c.label === 'new' ? 'rgba(239,68,68,0.1)' : c.label === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                          color: c.label === 'new' ? 'var(--danger)' : c.label === 'pending' ? '#d97706' : '#10b981'
                        }}>
                          {c.label}
                        </span>
                        <span>{new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </button>
                  );
                })}
                {conversations.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 32 }}>No chats available.</p>
                )}
              </div>
            </div>

            {/* 2. Active Chat Content Pane */}
            <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {activeConversation ? (
                <>
                  {/* Header */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 900 }}>{activeConversation.customer_name}</h4>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Source: {activeConversation.source} · {activeConversation.customer_phone || activeConversation.customer_email}
                      </p>
                    </div>
                    <select
                      value={activeConversation.label}
                      onChange={async (e: any) => {
                        const nextLabel = e.target.value;
                        try {
                          const res = await fetch(`${apiUrl}/v1/inbox/conversations/${activeConversation.id}/label`, {
                            method: 'PUT',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ label: nextLabel }),
                          });
                          if (res.ok) {
                            setActiveConversation((prev: any) => ({ ...prev, label: nextLabel }));
                            fetchInboxData();
                            toast.success('Conversation label updated');
                          }
                        } catch { toast.error('Error changing label'); }
                      }}
                      className="input"
                      style={{ padding: '4px 8px', fontSize: 12, width: 110 }}
                    >
                      <option value="new">New</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Chat message bubbles scroll */}
                  <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="no-scrollbar">
                    {activeConversationMessages.map((m: any) => {
                      const self = m.sender === 'agent';
                      const isAi = m.sender === 'ai';
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
                          <div style={{
                            maxWidth: '70%',
                            padding: '10px 14px',
                            borderRadius: self ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            background: self ? 'var(--primary)' : isAi ? 'rgba(99,102,241,0.08)' : 'var(--card-hover)',
                            border: isAi ? '1px dashed rgba(99,102,241,0.25)' : 'none',
                            color: self ? '#fff' : 'var(--text)',
                          }}>
                            {isAi && (
                              <div style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 900, color: 'var(--primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Sparkles size={11} /> AI Copilot Response
                              </div>
                            )}
                            <p style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}>{m.message}</p>
                            <div style={{ fontSize: 10, textAlign: self ? 'right' : 'left', color: self ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: 4 }}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input dispatch */}
                  <form
                    onSubmit={async (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!replyMessageText.trim()) return;
                      try {
                        const bodyText = replyMessageText;
                        setReplyMessageText('');
                        const res = await fetch(`${apiUrl}/v1/inbox/conversations/${activeConversation.id}/send`, {
                          method: 'POST',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: bodyText }),
                        });
                        const json = await res.json();
                        if (res.ok) {
                          setActiveConversationMessages(prev => [...prev, json.data]);
                          fetchInboxData();
                        } else {
                          toast.error(json.message || 'Failed to dispatch.');
                        }
                      } catch { toast.error('Error sending reply.'); }
                    }}
                    style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}
                  >
                    <input
                      type="text"
                      value={replyMessageText}
                      onChange={(e: any) => setReplyMessageText(e.target.value)}
                      placeholder="Type response, use templates/replies panel..."
                      className="input"
                      style={{ flex: 1, padding: 10, fontSize: 13.5 }}
                    />
                    <button type="submit" className="btn btn-primary clickable" style={{ padding: '10px 20px', fontSize: 13.5, fontWeight: 700 }}>
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12, padding: 32 }}>
                  <MessageSquare size={32} />
                  <p style={{ fontSize: 14 }}>Select a conversation thread to view logs and reply.</p>
                </div>
              )}
            </div>

            {/* 3. Right Profile & Utilities Panel */}
            <div className="card no-scrollbar" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
              {activeConversation ? (
                <>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                      <div>Name: <strong>{activeConversation.customer_name}</strong></div>
                      {activeConversation.customer_phone && <div>Phone: <strong>{activeConversation.customer_phone}</strong></div>}
                      {activeConversation.customer_email && <div>Email: <strong>{activeConversation.customer_email}</strong></div>}
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quick Replies</h4>
                      <button onClick={() => setIsAddQuickReplyOpen(true)} className="clickable" style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>+ Add</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {quickReplies.map((r: any) => (
                        <button
                          key={r.id}
                          onClick={() => setReplyMessageText(r.message)}
                          className="clickable text-left"
                          style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', background: 'var(--card-hover)', border: '1px solid var(--border)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}
                        >
                          <span>{r.shortcut}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Use</span>
                        </button>
                      ))}
                      {quickReplies.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No quick replies added yet.</span>}
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Templates</h4>
                      <button onClick={() => setIsAddTemplateOpen(true)} className="clickable" style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>+ Add</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {messageTemplates.map((t: any) => (
                        <button
                          key={t.id}
                          onClick={() => setReplyMessageText(t.content)}
                          className="clickable text-left"
                          style={{ padding: '6px 8px', borderRadius: 'var(--r-md)', background: 'var(--card-hover)', border: '1px solid var(--border)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}
                        >
                          <span>{t.name}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Use</span>
                        </button>
                      ))}
                      {messageTemplates.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No templates added.</span>}
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 16 }}>Select a thread to view customer properties.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── MODAL: CREATE QUICK REPLY ── */}
      <Modal
        open={isAddQuickReplyOpen}
        onClose={() => setIsAddQuickReplyOpen(false)}
        title="Create Quick Reply"
        maxWidth={420}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Save a shortcut for fast WhatsApp responses</p>
        <form onSubmit={handleCreateQuickReply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="form-label">Shortcut Keyword <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" placeholder="/thanks, /hours, /price" value={newQuickReplyShortcut} onChange={(e: any) => setNewQuickReplyShortcut(e.target.value)} required className="form-control" />
            <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>Type this keyword in inbox to instantly paste the reply.</p>
          </div>

          <div className="field-group">
            <label className="form-label">Reply Message <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea value={newQuickReplyMessage} onChange={(e: any) => setNewQuickReplyMessage(e.target.value)} required className="form-control" placeholder="Thank you for your order! We'll get back to you shortly." style={{ height: 100 }} />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAddQuickReplyOpen(false)} className="btn btn-outline clickable">Cancel</button>
            <button type="submit" className="btn btn-primary clickable">Save Reply</button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: CREATE MESSAGE TEMPLATE ── */}
      <Modal
        open={isAddTemplateOpen}
        onClose={() => setIsAddTemplateOpen(false)}
        title="Create Message Template"
        maxWidth={420}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -10, marginBottom: 16 }}>Reusable messages for customer comms</p>
        <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="form-label">Template Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" placeholder="e.g. Greeting, Order Confirmation, FAQ" value={newTemplateName} onChange={(e: any) => setNewTemplateName(e.target.value)} required className="form-control" />
          </div>

          <div className="field-group">
            <label className="form-label">Message Content <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea value={newTemplateContent} onChange={(e: any) => setNewTemplateContent(e.target.value)} required className="form-control" placeholder="Hello! Thanks for reaching out to {store_name}..." style={{ height: 110 }} />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAddTemplateOpen(false)} className="btn btn-outline clickable">Cancel</button>
            <button type="submit" className="btn btn-primary clickable">Save Template</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
