'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, X, RotateCcw, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How do I get more customers?',
  'What should I improve in my store?',
  'Help me write a product description',
  'How do I increase my sales?',
];

const WELCOME: Message = {
  id: 'nina-welcome',
  role: 'assistant',
  content: "Hi, I'm Nina. I'll help you create your store and start selling.\n\nAsk me anything about growing your store, adding products, or getting more customers.",
};

function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';
}

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

export default function NinaWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const displayMessages = messages.length === 0 ? [WELCOME] : messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput('');

    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${getApiUrl()}/v1/nina/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message: trimmed, history: historyForApi }),
      });

      const json = await res.json();
      const reply = json.message || "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setTyping(false);
    }
  }, [messages, typing]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with Nina"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #128C7E, #25D366)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(18, 140, 126, 0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {open ? <X size={22} color="#fff" strokeWidth={2.5} /> : <Bot size={22} color="#fff" strokeWidth={2} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 96,
            right: 28,
            zIndex: 9998,
            width: 360,
            maxHeight: 520,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 20,
            overflow: 'hidden',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #128C7E, #25D366)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={18} color="#fff" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'var(--font-heading)' }}>Nina</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Your store assistant</span>
              </div>
            </div>
            <button
              onClick={() => { setMessages([]); }}
              title="Clear chat"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}
            >
              <RotateCcw size={14} color="rgba(255,255,255,0.85)" strokeWidth={2} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayMessages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #128C7E, #25D366)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="#fff" strokeWidth={2} />
                  </div>
                )}
                <div style={{
                  maxWidth: '76%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#128C7E' : 'var(--bg)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #128C7E, #25D366)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={13} color="#fff" strokeWidth={2} />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#128C7E',
                      animation: `nina-bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts — only when no conversation */}
          {messages.length === 0 && (
            <div style={{ padding: '4px 14px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={11} color="#128C7E" strokeWidth={2} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary, #6c757d)' }}>Try asking</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    style={{
                      background: 'rgba(18,140,126,0.08)',
                      border: '1px solid rgba(18,140,126,0.2)',
                      borderRadius: 20,
                      padding: '4px 10px',
                      fontSize: 11.5,
                      color: '#128C7E',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--surface)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Nina anything..."
              rows={1}
              maxLength={500}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '9px 12px',
                fontSize: 13.5,
                fontFamily: 'var(--font-sans)',
                background: 'var(--bg)',
                color: 'var(--text)',
                outline: 'none',
                maxHeight: 100,
                overflowY: 'auto',
                lineHeight: 1.45,
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: input.trim() && !typing ? '#128C7E' : 'var(--border)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
            >
              <Send size={16} color="#fff" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes nina-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
