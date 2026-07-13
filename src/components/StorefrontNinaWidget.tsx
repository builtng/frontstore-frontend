'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, RotateCcw, ArrowRight, Smartphone, Copy, Check, ExternalLink, Lock, AlertCircle } from 'lucide-react';
import QRCodeSVG from 'react-qr-code';

interface Store {
  id: string;
  username: string;
  store_name: string;
  whatsapp_phone: string;
  primary_color?: string | null;
  nina_avatar_url?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  paymentCard?: any;
  payLink?: string | null;
}

interface StorefrontNinaWidgetProps {
  store: Store;
}

function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
}

export default function StorefrontNinaWidget({ store }: StorefrontNinaWidgetProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'welcome' | 'chat'>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatPhone, setChatPhone] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  // Plan gate state: null = ok, 'plan_required' = free plan, 'quota_exceeded' = pro daily cap hit
  const [planError, setPlanError] = useState<{ type: 'plan_required' | 'quota_exceeded'; message: string; resetsAt?: string } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const primaryColor = store.primary_color || '#25D366';
  const avatarUrl = store.nina_avatar_url || '/ninaAssistant.png';

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Retrieve or generate unique customer phone number for simulating chat session persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedPhone = localStorage.getItem(`frontstore_chat_phone_${store.username}`);
      if (!storedPhone) {
        // Generate a mock phone number for the anonymous customer
        const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
        storedPhone = `+234${randomDigits}`;
        localStorage.setItem(`frontstore_chat_phone_${store.username}`, storedPhone);
      }
      setChatPhone(storedPhone);
    }
  }, [store.username]);

  // Retrieve chat history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const historyStr = localStorage.getItem(`frontstore_chat_history_${store.username}`);
      if (historyStr) {
        try {
          const parsed = JSON.parse(historyStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setMode('chat');
          }
        } catch (e) {
          console.error('Failed to parse chat history', e);
        }
      }
    }
  }, [store.username]);

  // Persist chat history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(`frontstore_chat_history_${store.username}`, JSON.stringify(messages));
    }
  }, [messages, store.username]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (open && mode === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, mode, open]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && mode === 'chat') {
      inputRef.current?.focus();
    }
  }, [open, mode]);

  const whatsappUrl = `https://wa.me/${store.whatsapp_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    `Hello Nina, I am shopping on ${store.store_name} and would like to ask a question.`
  )}`;

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput('');

    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const API_URL = getApiUrl().replace(/\/+$/, '');
      const res = await fetch(`${API_URL}/v1/public/store/${store.username}/simulate-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          phone_number: chatPhone,
        }),
      });

      const json = await res.json();

      // ── Plan gate responses ────────────────────────────────────────────────
      if (res.status === 403 && json.status === 'plan_required') {
        // Remove the user message we optimistically added — show gate instead
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setPlanError({ type: 'plan_required', message: json.message });
        return;
      }
      if (res.status === 429 && json.status === 'quota_exceeded') {
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setPlanError({ type: 'quota_exceeded', message: json.message, resetsAt: json.resets_at });
        return;
      }

      if (res.ok && json.status === 'success') {
        const assistantMsg: Message = {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: json.reply || "Sorry, I couldn't process that.",
          paymentCard: json.payment_card || null,
          payLink: json.pay_link || null,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(json.message || 'Error communicating with Nina');
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: "I'm having a little trouble connecting right now. Please try again or chat with us on WhatsApp!",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }, [store.username, chatPhone, typing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`frontstore_chat_history_${store.username}`);
    setMode('welcome');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with Nina AI"
        className="nina-launcher"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${primaryColor}, #25D366)`,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 30px rgba(37, 211, 102, 0.45)`,
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {open ? <X size={24} color="#fff" strokeWidth={2.5} /> : <img src={avatarUrl} alt="Nina" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />}
      </button>

      {/* Main chat window / popover */}
      {open && (
        <div
          className={`nina-container ${isMobile ? 'nina-mobile' : 'nina-desktop'}`}
          style={{
            position: 'fixed',
            bottom: isMobile ? 0 : 100,
            right: isMobile ? 0 : 28,
            zIndex: 9998,
            width: isMobile ? '100%' : 380,
            height: isMobile ? '85vh' : 580,
            maxHeight: isMobile ? '100%' : 'calc(100vh - 140px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? '24px 24px 0 0' : 24,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            animation: 'nina-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: `linear-gradient(135deg, ${primaryColor}, #25D366)`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={avatarUrl} alt="Nina" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255, 255, 255, 0.4)' }} />
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>Nina AI</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', fontWeight: 550 }}>Shopping Assistant</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {mode === 'chat' && (
                <button
                  onClick={clearChat}
                  title="Reset conversation"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: 10,
                    padding: 8,
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                >
                  <RotateCcw size={15} />
                </button>
              )}
              {isMobile && (
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    padding: 4,
                    cursor: 'pointer',
                  }}
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          {mode === 'welcome' ? (
            <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', margin: '20px 0 10px' }}>
                <img
                  src={avatarUrl}
                  alt="Nina"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2.5px solid ${primaryColor}`,
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                />
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: 20, color: '#1a1f36', letterSpacing: '-0.02em' }}>
                  Chat with Nina
                </h3>
                <p style={{ fontSize: 13.5, color: '#4f566b', marginTop: 8, lineHeight: 1.5, padding: '0 10px' }}>
                  Hi there! I am Nina, the official AI shopping assistant for <strong>{store.store_name}</strong>. How would you like to chat?
                </p>
              </div>

              {/* Handoff Choice Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                {/* Live Web Chat Button */}
                <button
                  onClick={() => setMode('chat')}
                  className="welcome-card-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 18,
                    borderRadius: 16,
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'rgba(37, 211, 102, 0.1)',
                      color: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: '#1a1f36' }}>Chat in Browser</h5>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4f566b', lineHeight: 1.4 }}>
                      Start a live chat here to ask about products and checkout.
                    </p>
                  </div>
                  <ArrowRight size={18} color="#8792a2" />
                </button>

                {/* WhatsApp Choice Card */}
                {!isMobile ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                      padding: 20,
                      borderRadius: 16,
                      border: '1px solid rgba(0,0,0,0.06)',
                      background: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(37, 211, 102, 0.1)',
                          color: '#25D366',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Smartphone size={16} />
                      </div>
                      <h5 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1a1f36' }}>Scan to Chat on Mobile</h5>
                    </div>

                    <div
                      style={{
                        background: '#fff',
                        padding: 10,
                        borderRadius: 12,
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <QRCodeSVG value={whatsappUrl} size={130} />
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="welcome-card-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        width: '100%',
                        padding: '10px 0',
                        fontSize: 12.5,
                        fontWeight: 750,
                        color: primaryColor,
                        textDecoration: 'none',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        marginTop: 4,
                      }}
                    >
                      Or open WhatsApp directly <ExternalLink size={13} />
                    </a>
                  </div>
                ) : (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="welcome-card-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 18,
                      borderRadius: 16,
                      border: '1px solid rgba(0,0,0,0.06)',
                      background: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'rgba(37, 211, 102, 0.1)',
                        color: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Smartphone size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: '#1a1f36' }}>Open WhatsApp Chat</h5>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4f566b', lineHeight: 1.4 }}>
                        Launch WhatsApp directly to start the automated chat.
                      </p>
                    </div>
                    <ArrowRight size={18} color="#8792a2" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            // Conversational Live Chat panel
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Plan Gate Overlay */}
              {planError && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 28,
                  textAlign: 'center',
                  gap: 16,
                  borderRadius: isMobile ? '24px 24px 0 0' : 24,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: planError.type === 'plan_required' ? 'rgba(124,58,237,0.1)' : 'rgba(245,158,11,0.1)',
                    color: planError.type === 'plan_required' ? '#7c3aed' : '#d97706',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 4,
                  }}>
                    {planError.type === 'plan_required' ? <Lock size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 900, fontSize: 16, color: '#1a1f36', letterSpacing: '-0.01em' }}>
                      {planError.type === 'plan_required' ? 'AI Chat Requires Pro' : 'Daily Limit Reached'}
                    </h4>
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#4f566b', lineHeight: 1.55, maxWidth: 260 }}>
                      {planError.message}
                    </p>
                    {planError.resetsAt && (
                      <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#8792a2' }}>
                        Resets at midnight UTC
                      </p>
                    )}
                  </div>
                  <a
                    href="https://wa.me/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: primaryColor,
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '10px 20px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: `0 4px 14px ${primaryColor}40`,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // Redirect WhatsApp as fallback
                      const waUrl = `https://wa.me/${store.whatsapp_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hello! I have a question.')}` ;
                      window.open(waUrl, '_blank');
                    }}
                  >
                    <Smartphone size={15} /> Continue on WhatsApp
                  </a>
                  <button
                    onClick={() => { setPlanError(null); setMode('welcome'); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8792a2',
                      fontSize: 12,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Go back
                  </button>
                </div>
              )}
              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {/* Welcome Message */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <img
                    src={avatarUrl}
                    alt="Nina"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.08)',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: '16px 16px 16px 4px',
                      background: '#fff',
                      color: '#1a1f36',
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {`Hi! I'm Nina. Ask me anything about products, sizing, or tell me what you want to order and I'll prepare your checkout!`}
                  </div>
                </div>

                {/* Render Conversation List */}
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-end',
                        gap: 10,
                      }}
                    >
                      {msg.role === 'assistant' && (
                        <img
                          src={avatarUrl}
                          alt="Nina"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid rgba(0,0,0,0.08)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div
                        style={{
                          maxWidth: '78%',
                          padding: '10px 14px',
                          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.role === 'user' ? primaryColor : '#fff',
                          color: msg.role === 'user' ? '#fff' : '#1a1f36',
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>

                    {/* Render Interactive Payment Card if present */}
                    {msg.paymentCard && (
                      <div
                        style={{
                          marginLeft: msg.role === 'assistant' ? 38 : 0,
                          marginRight: msg.role === 'user' ? 38 : 0,
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '82%',
                          background: '#fff',
                          border: '1.5px solid rgba(0,0,0,0.07)',
                          borderRadius: 16,
                          padding: 16,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {msg.paymentCard.type === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Secure Checkout'}
                          </span>
                          <span style={{ fontSize: 11, color: '#8792a2', fontWeight: 600 }}>
                            #{msg.paymentCard.order_number}
                          </span>
                        </div>

                        {/* Product / Amount */}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#1a1f36' }}>{msg.paymentCard.product_name || 'Store Order'}</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#1a1f36', marginTop: 4 }}>
                            {msg.paymentCard.currency_symbol}{msg.paymentCard.amount}
                          </div>
                        </div>

                        {/* Payment Details / Link */}
                        {msg.paymentCard.pay_link ? (
                          <a
                            href={msg.paymentCard.pay_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: primaryColor,
                              color: '#fff',
                              textDecoration: 'none',
                              padding: '10px 14px',
                              borderRadius: 10,
                              fontWeight: 800,
                              fontSize: 13,
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              boxShadow: `0 4px 12px ${primaryColor}2F`,
                            }}
                          >
                            Pay Online Now <ExternalLink size={14} />
                          </a>
                        ) : msg.paymentCard.bank_name ? (
                          // Bank Transfer Box
                          <div
                            style={{
                              background: '#f8f9fc',
                              borderRadius: 10,
                              padding: 12,
                              border: '1px solid rgba(0,0,0,0.04)',
                              fontSize: 12.5,
                              color: '#4f566b',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                            }}
                          >
                            <div><strong>Bank:</strong> {msg.paymentCard.bank_name}</div>
                            <div><strong>Account Name:</strong> {msg.paymentCard.account_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 6, marginTop: 2 }}>
                              <div><strong>Account Number:</strong> <code>{msg.paymentCard.account_number}</code></div>
                              <button
                                onClick={() => copyToClipboard(msg.paymentCard.account_number)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: primaryColor,
                                  display: 'flex',
                                  padding: 4,
                                }}
                              >
                                {copiedText ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                            {msg.paymentCard.note && (
                              <div style={{ fontSize: 10.5, color: '#8792a2', fontStyle: 'italic', marginTop: 4 }}>
                                {msg.paymentCard.note}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {typing && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <img
                      src={avatarUrl}
                      alt="Nina"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid rgba(0,0,0,0.08)',
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px 16px 16px 4px',
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: primaryColor,
                            animation: `nina-bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Chat Input Area */}
              <div
                style={{
                  padding: '12px 14px',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-end',
                  background: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  maxLength={400}
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 14,
                    padding: '10px 14px',
                    fontSize: 13.5,
                    background: '#f8f9fc',
                    color: '#1a1f36',
                    outline: 'none',
                    maxHeight: 100,
                    overflowY: 'auto',
                    lineHeight: 1.45,
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                  }}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || typing}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: input.trim() && !typing ? primaryColor : '#e6ebf1',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <Send size={16} color={input.trim() && !typing ? '#fff' : '#a3acb9'} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Styled Animations */}
      <style>{`
        @keyframes nina-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes nina-slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .nina-mobile {
          width: 100% !important;
          height: 82vh !important;
          border-radius: 24px 24px 0 0 !important;
        }
        
        .welcome-card-btn {
          width: 100%;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .welcome-card-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
          border-color: rgba(37, 211, 102, 0.25) !important;
        }
        .welcome-card-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </>
  );
}
