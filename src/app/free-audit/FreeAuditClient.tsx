'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  MessageSquare, 
  Sparkles, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Activity,
  Smartphone,
  Flame,
  Users,
  Bot,
  Cpu,
  Terminal,
  Brain,
  FileText,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';
import SearchableSelect from '@/components/SearchableSelect';
import { toast } from 'sonner';
import { generateAiAudit, AiAuditResult } from '@/lib/aiAnalyzer';

export default function FreeAuditClient() {
  // Element Refs for smooth scrolling & focus
  const auditFormRef = React.useRef<HTMLDivElement>(null);
  const businessNameInputRef = React.useRef<HTMLInputElement>(null);

  const scrollToAuditForm = () => {
    if (auditFormRef.current) {
      auditFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        businessNameInputRef.current?.focus();
      }, 350);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Audit Form Inputs
  const [businessName, setBusinessName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [industry, setIndustry] = useState('Fashion & Apparel');
  const [trafficSource, setTrafficSource] = useState('Facebook & Instagram Ads');
  const [primaryStruggle, setPrimaryStruggle] = useState('High clicks, but low sales/conversions');

  // AI Diagnostic & Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<AiAuditResult | null>(null);

  // Modal & Lead Form States
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  // Lead Contact Information
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('₦100k - ₦500k');
  const [wantsConsultation, setWantsConsultation] = useState(true);
  const [copiedCopy, setCopiedCopy] = useState(false);

  // Calculator States
  const [calcVisitors, setCalcVisitors] = useState(3000);
  const [calcOrderValue, setCalcOrderValue] = useState(18000);
  const [calcCurrentConvRate, setCalcCurrentConvRate] = useState(1.0);

  // Urgency Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 45 });
  
  // Accordion Toggles
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [expandedKiller, setExpandedKiller] = useState<number | null>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !storeUrl.trim()) {
      toast.error('Please enter your Business Name and Store URL or Instagram handle.');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setTerminalLogs([]);

    // Generate AI Audit Results
    const generated = generateAiAudit({
      businessName,
      storeUrl,
      industry,
      trafficSource,
      primaryStruggle
    });
    setAiResult(generated);

    // AI Terminal Streaming Steps
    const logsToStream = [
      `🤖 AI Engine v3.8 initializing deep audit for "${businessName}"...`,
      `🔍 [AI Vision] Scanning mobile viewport architecture & touch targets for ${storeUrl}...`,
      `📊 [AI Analytics] Cross-referencing ${trafficSource} patterns against 15,000+ benchmark stores...`,
      `⚡ [AI Speed Diagnostic] Measuring script execution latency & mobile rendering speed...`,
      `💡 [AI Copy Engine] Evaluating ad hook alignment & conversion friction points...`,
      `🎯 [AI Diagnostic Complete] Calculated revenue leak & custom action plan!`
    ];

    let currentLogIndex = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);

      const logIndex = Math.min(
        Math.floor((progress / 100) * logsToStream.length),
        logsToStream.length - 1
      );

      if (logIndex >= currentLogIndex && logIndex < logsToStream.length) {
        setTerminalLogs((prev) => [...prev, logsToStream[logIndex]]);
        currentLogIndex = logIndex + 1;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setShowResultsModal(true);
        }, 500);
      }
    }, 120);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
      toast.error('Please fill in your name, email, and WhatsApp phone number.');
      return;
    }

    setAuditSubmitted(true);
    toast.success('Your AI Audit Report is ready below!');
  };

  const copyAiCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCopy(true);
    toast.success('AI Suggested Copy copied to clipboard!');
    setTimeout(() => setCopiedCopy(false), 2000);
  };

  // Calculator math
  const currentSales = Math.round(calcVisitors * (calcCurrentConvRate / 100));
  const currentRevenue = currentSales * calcOrderValue;
  
  const optimizedConvRate = 3.6;
  const optimizedSales = Math.round(calcVisitors * (optimizedConvRate / 100));
  const optimizedRevenue = optimizedSales * calcOrderValue;
  const monthlyLeak = Math.max(0, optimizedRevenue - currentRevenue);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 5%, var(--bg)) 0%, var(--bg) 480px)' }}>
      {/* Urgency Top Bar */}
      <div 
        style={{ 
          background: 'linear-gradient(90deg, #128C7E 0%, #0d6e63 100%)', 
          color: '#ffffff', 
          padding: '10px 16px', 
          textAlign: 'center', 
          fontSize: '13.5px', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20 }}>
          <Zap size={14} color="#ffd700" /> Store Optimizer
        </span>
        <span>
          ⚡ Limited Quota: Only <strong>14 Free AI Audits</strong> Remaining Today
        </span>
        <span style={{ background: '#094d45', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 700 }}>
          ⏱️ {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>

      <PublicSiteNav />

      {/* Hero Section */}
      <header className="hero-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 20px clamp(64px, 9vw, 108px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-blob" style={{ top: '-15%', right: '-5%', width: 450, height: 450, background: 'rgba(18, 140, 126, 0.22)', filter: 'blur(80px)' }} />
        <div className="hero-blob" style={{ bottom: '-20%', left: '-8%', width: 500, height: 500, background: 'rgba(255, 215, 0, 0.1)', filter: 'blur(90px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div>
            <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '6px 14px', background: 'rgba(255,255,255,0.12)', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
              <Sparkles size={14} color="var(--accent)" /> 
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>
                AI-POWERED TRAFFIC & STORE OPTIMIZER
              </span>
            </div>

            <h1 className="text-display" style={{ fontSize: 'clamp(32px, 5vw, 54px)', color: '#ffffff', lineHeight: 1.12, marginBottom: 20, fontWeight: 800 }}>
              Why Is Your Page Wasting Ad Money & <span className="mark-highlight" style={{ background: 'linear-gradient(120deg, rgba(37,211,102,0.3) 0%, rgba(37,211,102,0.6) 100%)', color: '#fff', padding: '0 6px', borderRadius: 6 }}>Not Making Sales?</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(16px, 2.2vw, 19px)', lineHeight: 1.65, marginBottom: 28, maxWidth: 540 }}>
              Over <strong>92% of social traffic</strong> drops off without buying. Use our <strong>AI Business Analyzer</strong> to scan your storefront, uncover conversion leaks, and generate high-converting copy & action steps in 60 seconds.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)', fontSize: 13.5 }}>
                <CheckCircle2 size={16} color="var(--wa-green)" /> 100% Free & No Credit Card
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)', fontSize: 13.5 }}>
                <CheckCircle2 size={16} color="var(--wa-green)" /> AI Deep Diagnostic Report
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)', fontSize: 13.5 }}>
                <CheckCircle2 size={16} color="var(--wa-green)" /> Instant Tailored Action Plan
              </div>
            </div>

            {/* Social Trust Metrics */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', margin: '-4px' }}>
                {['FB', 'IG', 'WA', 'TT'].map((label, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #128C7E', background: `hsl(${i * 65 + 150}, 65%, 42%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginLeft: i > 0 ? -10 : 0 }}>
                    {label}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>4,850+ Business Pages Analyzed</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>Average 3.4x Conversion Bump After Optimization</div>
              </div>
            </div>
          </div>

          {/* Hero Right: AI Audit Input Box */}
          <div>
            <div 
              ref={auditFormRef}
              style={{ 
                background: 'rgba(255, 255, 255, 0.97)', 
                borderRadius: 24, 
                padding: 'clamp(24px, 5vw, 36px)', 
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                color: 'var(--text)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={13} /> Store Audit Scanner
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> Instant 60s Scan
                </span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text)', lineHeight: 1.25 }}>
                Run Your Free Store Audit
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                Input your brand info below to launch our diagnostic scanner on your storefront.
              </p>

              <form onSubmit={handleStartAudit} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Business or Brand Name *
                  </label>
                  <input
                    ref={businessNameInputRef}
                    type="text"
                    required
                    placeholder="e.g. Bella Fashion House, Glam Beauty, TechHub"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Store Website or Instagram / WhatsApp Link *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. instagram.com/mybrand or mybrand.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                      Niche / Industry
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 'Fashion & Apparel', label: 'Fashion & Apparel' },
                        { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' },
                        { value: 'Gadgets & Electronics', label: 'Gadgets & Electronics' },
                        { value: 'Health & Supplements', label: 'Health & Supplements' },
                        { value: 'Food & Groceries', label: 'Food & Groceries' },
                        { value: 'Digital Services & Consulting', label: 'Digital Services & Consulting' },
                      ]}
                      value={industry}
                      onChange={setIndustry}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                      Main Traffic Source
                    </label>
                    <SearchableSelect
                      options={[
                        { value: 'Facebook & Instagram Ads', label: 'Facebook & Instagram Ads' },
                        { value: 'TikTok Ads & Organic', label: 'TikTok Ads & Organic' },
                        { value: 'WhatsApp Status & Groups', label: 'WhatsApp Status & Groups' },
                        { value: 'Google Ads & SEO', label: 'Google Ads & SEO' },
                        { value: 'Influencer Promotions', label: 'Influencer Promotions' },
                      ]}
                      value={trafficSource}
                      onChange={setTrafficSource}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Primary Conversion Struggle
                  </label>
                  <SearchableSelect
                    options={[
                      { value: 'High clicks, but low sales/conversions', label: 'High clicks, but low sales/conversions' },
                      { value: 'Cart abandonment during checkout', label: 'Cart abandonment during checkout' },
                      { value: 'Low WhatsApp message replies', label: 'Low WhatsApp message replies' },
                      { value: 'High cost per customer acquisition', label: 'High cost per customer acquisition' },
                      { value: 'Slow page loading & mobile friction', label: 'Slow page loading & mobile friction' },
                    ]}
                    value={primaryStruggle}
                    onChange={setPrimaryStruggle}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 6,
                    boxShadow: 'var(--shadow-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={18} />
                  <span>Launch Free Store Audit</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Lock size={12} color="var(--primary)" /> 100% Secure Analysis. No login required.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1140, margin: '0 auto', padding: 'clamp(48px, 7vw, 88px) 20px' }}>

        {/* AI Terminal Diagnostic Loader Modal */}
        {isScanning && (
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(15, 23, 42, 0.9)', 
              backdropFilter: 'blur(12px)',
              zIndex: 9999, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 20
            }}
          >
            <div style={{ background: '#0f172a', borderRadius: 20, padding: 32, maxWidth: 540, width: '100%', color: '#f8fafc', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Terminal size={18} color="#25D366" />
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#25D366' }}>
                    AI DIAGNOSTIC ENGINE v3.8
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                  {scanProgress}%
                </span>
              </div>

              {/* Terminal Logs Output */}
              <div style={{ background: '#020617', borderRadius: 12, padding: 16, height: 180, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, color: '#e2e8f0', marginBottom: 20, border: '1px solid #1e293b' }}>
                {terminalLogs.map((log, index) => (
                  <div key={index} style={{ marginBottom: 6, color: index === terminalLogs.length - 1 ? '#38bdf8' : '#94a3b8' }}>
                    {log}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 8, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${scanProgress}%`, 
                    background: 'linear-gradient(90deg, #128C7E 0%, #25D366 100%)', 
                    transition: 'width 0.15s ease' 
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Results & Lead Capture Modal */}
        {showResultsModal && aiResult && (
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(15, 23, 42, 0.86)', 
              backdropFilter: 'blur(8px)',
              zIndex: 9998, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 20,
              overflowY: 'auto'
            }}
          >
            <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 'clamp(24px, 4vw, 40px)', maxWidth: 680, width: '100%', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', position: 'relative', margin: 'auto' }}>
              
              {!auditSubmitted ? (
                <div>
                  {/* AI Diagnostic Score Header */}
                  <div style={{ background: 'color-mix(in srgb, var(--danger) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 800, color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Search size={14} /> Store Diagnostic Report Complete
                      </span>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                        Overall Health Score: <span style={{ color: 'var(--danger)' }}>{aiResult.overallScore}/100 ({aiResult.grade})</span>
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Estimated Monthly Revenue Leak: <strong style={{ color: 'var(--danger)' }}>₦{aiResult.estimatedLeakMin.toLocaleString()} – ₦{aiResult.estimatedLeakMax.toLocaleString()}</strong>
                      </p>
                    </div>

                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, var(--danger) 15%, transparent)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                      {aiResult.overallScore}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                      Where Should We Send Your Full AI Audit & Recommended Action Plan?
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                      Enter your details below to unlock your custom AI report breakdown and copy suggestions.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} style={{ display: 'grid', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                          Business Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="john@mybusiness.com"
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                          WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+234 801 234 5678"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--surface-2)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                        Current Monthly Sales Range
                      </label>
                      <SearchableSelect
                        options={[
                          { value: 'Under ₦100,000 / month', label: 'Under ₦100,000 / month' },
                          { value: '₦100,000 - ₦500,000 / month', label: '₦100,000 - ₦500,000 / month' },
                          { value: '₦500,000 - ₦2,000,000 / month', label: '₦500,000 - ₦2,000,000 / month' },
                          { value: '₦2,000,000 - ₦10,000,000 / month', label: '₦2,000,000 - ₦10,000,000 / month' },
                          { value: 'Over ₦10,000,000 / month', label: 'Over ₦10,000,000 / month' },
                        ]}
                        value={monthlyRevenue}
                        onChange={setMonthlyRevenue}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                      <input 
                        type="checkbox" 
                        checked={wantsConsultation} 
                        onChange={(e) => setWantsConsultation(e.target.checked)} 
                        style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                      />
                      <span>Include a <strong>Free 15-Minute Strategy Review Call</strong> with a conversion specialist</span>
                    </label>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '15px 20px',
                        fontSize: 16,
                        fontWeight: 800,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 12,
                        boxShadow: 'var(--shadow-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={18} />
                      <span>Unlock AI Action Report & Copy Suggestions</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* Instant AI Dashboard View */
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <BarChart3 size={28} />
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                      AI Store Audit Dashboard: {businessName}
                    </h3>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                      Report sent to <strong>{leadEmail}</strong> & WhatsApp <strong>{leadPhone}</strong>.
                    </p>
                  </div>

                  {/* AI Scores Matrix */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: 'Mobile UX', score: aiResult.scores.mobileUx },
                      { label: 'Ad Relevancy', score: aiResult.scores.adAlignment },
                      { label: 'Checkout Ease', score: aiResult.scores.checkoutFriction },
                      { label: 'Social Proof', score: aiResult.scores.socialProof },
                    ].map((s, idx) => (
                      <div key={idx} style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: s.score > 60 ? 'var(--primary)' : 'var(--danger)', marginTop: 2 }}>{s.score}%</div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Critical Fixes */}
                  <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={16} color="var(--danger)" /> AI Identified Bottlenecks & Fixes:
                    </h4>

                    {aiResult.criticalFixes.map((fix, idx) => (
                      <div key={idx} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 14, borderLeft: '4px solid var(--danger)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: 13.5, color: 'var(--text)' }}>{fix.title}</strong>
                          <span style={{ fontSize: 10, fontWeight: 800, background: 'color-mix(in srgb, var(--danger) 15%, transparent)', color: 'var(--danger)', padding: '2px 8px', borderRadius: 10 }}>
                            {fix.impact}
                          </span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                          {fix.finding}
                        </p>
                        <div style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: 8, marginTop: 8, fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--primary)" /> <strong>Fix:</strong> {fix.actionableStep}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Suggested High-Converting Copy */}
                  <div style={{ background: 'var(--primary-light)', borderRadius: 14, padding: 16, marginBottom: 24, border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={14} /> AI Recommended Copy Hook
                      </span>
                      <button
                        onClick={() => copyAiCopy(`${aiResult.aiSuggestedCopy.headline}\n${aiResult.aiSuggestedCopy.subheadline}\n${aiResult.aiSuggestedCopy.callToAction}`)}
                        style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {copiedCopy ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCopy ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                      "{aiResult.aiSuggestedCopy.headline}"
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.4 }}>
                      {aiResult.aiSuggestedCopy.subheadline}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <a
                      href={`https://wa.me/?text=Hello%20Frontstore%20team,%20I%20just%20completed%20the%20AI%20Store%20Audit%20for%20${encodeURIComponent(businessName)}.%20I%20would%20like%20to%20review%20my%20conversion%20fixes!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        padding: '14px',
                        fontSize: 14,
                        fontWeight: 700,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        textDecoration: 'none'
                      }}
                    >
                      <MessageSquare size={16} />
                      <span>Review on WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setShowResultsModal(false)}
                      className="btn"
                      style={{
                        padding: '14px',
                        fontSize: 14,
                        fontWeight: 700,
                        borderRadius: 12,
                        background: 'var(--surface-2)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer'
                      }}
                    >
                      Close Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 1: How The AI Store Optimizer Works */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <span className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <Zap size={14} /> ENGINE TECHNOLOGY
            </span>
            <h2 className="text-display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--text)', marginBottom: 14, fontWeight: 800 }}>
              How Our AI Optimizer Fixes Your Ad Funnel
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>
              Our AI model cross-references your storefront against 15,000+ top-performing social commerce funnels to pinpoint friction.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                icon: Search,
                title: '1. AI Ad-to-Page Hook Match',
                desc: 'Compares your Facebook, TikTok, or Instagram ad copy against your landing page headline to ensure immediate message alignment.'
              },
              {
                icon: Smartphone,
                title: '2. AI Mobile Viewport Scan',
                desc: 'Analyzes touch target accessibility, script execution latency, and scroll depth friction on iOS and Android devices.'
              },
              {
                icon: BarChart3,
                title: '3. Conversion Benchmarking',
                desc: 'Compares your store performance metrics against the top 10% revenue earners in your exact business niche.'
              },
              {
                icon: Sparkles,
                title: '4. AI Copy & Action Generator',
                desc: 'Generates tailored headlines, sub-hooks, and 1-click WhatsApp checkout buttons engineered for high conversions.'
              }
            ].map((step, i) => (
              <div key={i} className="card" style={{ background: 'var(--surface)', borderRadius: 20, padding: 26, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <step.icon size={22} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: The Revenue Leak Calculator */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 40px' }}>
            <span className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <TrendingUp size={14} /> REVENUE LEAK CALCULATOR
            </span>
            <h2 className="text-display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--text)', marginBottom: 14, fontWeight: 800 }}>
              Calculate How Much Money You Are Leaving On The Table
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>
              Adjust the sliders below based on your current ad visitors, average order price, and conversion rate to calculate lost monthly income.
            </p>
          </div>

          <div 
            style={{ 
              background: 'var(--surface)', 
              borderRadius: 24, 
              padding: 'clamp(24px, 5vw, 44px)', 
              boxShadow: 'var(--shadow-lg)', 
              border: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 40,
              alignItems: 'center'
            }}
          >
            {/* Controls */}
            <div style={{ display: 'grid', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  <span>Monthly Social / Ad Visitors:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{calcVisitors.toLocaleString()} visitors</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="20000" 
                  step="500" 
                  value={calcVisitors} 
                  onChange={(e) => setCalcVisitors(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  <span>Average Product Order Value:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>₦{calcOrderValue.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="2000" 
                  max="100000" 
                  step="1000" 
                  value={calcOrderValue} 
                  onChange={(e) => setCalcOrderValue(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  <span>Estimated Current Conversion Rate:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 800 }}>{calcCurrentConvRate.toFixed(1)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="3.0" 
                  step="0.1" 
                  value={calcCurrentConvRate} 
                  onChange={(e) => setCalcCurrentConvRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--danger)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Results Box */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #0d5c52 0%, #128C7E 100%)', 
                borderRadius: 20, 
                padding: 32, 
                color: '#ffffff',
                boxShadow: 'var(--shadow-primary)'
              }}
            >
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 6 }}>
                ⚠️ Estimated Monthly Revenue Leak
              </div>
              
              <div style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: '#ffd700', lineHeight: 1.1, marginBottom: 12 }}>
                ₦{monthlyLeak.toLocaleString()}
              </div>

              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, marginBottom: 20 }}>
                With an optimized AI-powered store (achieving a realistic <strong>3.6% conversion rate</strong>), your monthly revenue would jump from <strong>₦{currentRevenue.toLocaleString()}</strong> to <strong>₦{optimizedRevenue.toLocaleString()}</strong>.
              </p>

              <button
                type="button"
                onClick={scrollToAuditForm}
                className="btn"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span>Fix My Revenue Leaks With AI</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: The 5 Hidden Conversion Leaks */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <span className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 12px', background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <AlertTriangle size={14} /> DIAGNOSTIC BREAKDOWN
            </span>
            <h2 className="text-display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--text)', marginBottom: 14, fontWeight: 800 }}>
              The 5 Hidden Leaks Killing Your Social Media Sales
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>
              Social traffic has an attention span under 3 seconds. Here is why most Facebook & Instagram visitors leave without buying:
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {[
              {
                id: 0,
                icon: Smartphone,
                title: '1. Excessive Checkout Friction on Mobile Devices',
                desc: 'Forcing customers to register an account or fill 10+ form fields causes up to 68% cart abandonment.',
                solution: 'Fix: Implement 1-click WhatsApp order checkout where buyer details are auto-filled.'
              },
              {
                id: 1,
                icon: Clock,
                title: '2. Slow Mobile Page Load Times (> 2.5 Seconds)',
                desc: 'Over 53% of mobile users abandon a site if it takes longer than 3 seconds to load.',
                solution: 'Fix: Compress product images, remove bloated scripts, and utilize lightweight storefront technology.'
              },
              {
                id: 2,
                icon: ShieldCheck,
                title: '3. Lack of Visible Social Proof & Real Customer Reviews',
                desc: 'First-time buyers coming from Facebook or TikTok ads are naturally skeptical about scam stores.',
                solution: 'Fix: Display verified buyer reviews, customer unboxing videos, and delivery trust badges.'
              },
              {
                id: 3,
                icon: Zap,
                title: '4. Confusing Value Proposition & Unclear Call to Action',
                desc: 'If visitors cannot understand what you sell within 3 seconds, they swipe away back to Instagram.',
                solution: 'Fix: Craft an AI-generated headline, bold benefit bullets, and prominent checkout buttons.'
              },
              {
                id: 4,
                icon: Flame,
                title: '5. Zero Urgency or Scarcity Triggers',
                desc: 'Without genuine urgency, buyers save your post for "later" and completely forget to order.',
                solution: 'Fix: Add live inventory counters, flash offer badges, and limited-time bonus gifts.'
              }
            ].map((killer) => (
              <div 
                key={killer.id}
                onClick={() => setExpandedKiller(expandedKiller === killer.id ? null : killer.id)}
                className="card clickable"
                style={{
                  background: 'var(--surface)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <killer.icon size={22} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                      {killer.title}
                    </h3>
                  </div>
                  {expandedKiller === killer.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>

                {expandedKiller === killer.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    <p style={{ marginBottom: 10 }}>{killer.desc}</p>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '10px 14px', borderRadius: 10, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="var(--primary)" /> {killer.solution}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Verified Case Studies & Testimonials */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <span className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <Users size={14} /> PROVEN RESULTS
            </span>
            <h2 className="text-display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--text)', marginBottom: 14, fontWeight: 800 }}>
              Real Merchants Who Transformed Their Conversion Rates
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              {
                name: 'Kemi Adebayo',
                store: 'Luxe Wigs & Beauty',
                badge: '3.8x Conversion Jump',
                quote: 'I was spending ₦250k monthly on Instagram ads but getting less than 10 orders. After running the AI audit and switching to WhatsApp instant checkout, my monthly sales jumped from ₦400k to ₦2.1M!'
              },
              {
                name: 'Chidi Okafor',
                store: 'TechGadgets NG',
                badge: 'Saved ₦450k Ad Spend',
                quote: 'The AI audit pointed out that our mobile site took 4.2 seconds to load. We fixed our images and streamlined our checkout flow. Now our cost per customer dropped by 60%.'
              },
              {
                name: 'Blessing Emmanuel',
                store: 'Glamour Apparel',
                badge: '+210% Monthly Revenue',
                quote: 'I used to lose so many customers because they hated long checkout forms. The AI report showed us how to capture orders on WhatsApp instantly. Best free tool ever!'
              }
            ].map((testi, i) => (
              <div key={i} className="card" style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                    {testi.badge}
                  </span>
                  <div style={{ color: '#ffb703' }}>★★★★★</div>
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>
                  "{testi.quote}"
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{testi.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{testi.store}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: FAQ Accordion */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 44px' }}>
            <span className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              <HelpCircle size={14} /> FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-display" style={{ fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--text)', marginBottom: 14, fontWeight: 800 }}>
              Got Questions? We Have Answers
            </h2>
          </div>

          <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 12 }}>
            {[
              {
                q: 'How does the AI Store Audit Engine work?',
                a: 'Our AI engine analyzes your store inputs, niche, traffic source, and conversion friction against 15,000+ top-performing social commerce funnels to generate custom recommendations.'
              },
              {
                q: 'Is this AI business audit really 100% free?',
                a: 'Yes! The AI diagnostic scan is completely free with no credit card required. We built this tool to help merchants stop wasting money on low-converting ads.'
              },
              {
                q: 'How fast will I receive my AI audit results?',
                a: 'Your AI scan runs in 60 seconds directly on your screen, giving you an instant diagnostic score, revenue leak estimate, and tailored copy suggestions.'
              },
              {
                q: 'Does this work for sellers using Instagram & WhatsApp without a website?',
                a: 'Yes! Whether you operate a full e-commerce website, an Instagram page, or a WhatsApp commerce store, our AI engine assesses your conversion funnel.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)' }}>
                    {faq.q}
                  </h3>
                  {openFaq === idx ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>

                {openFaq === idx && (
                  <p style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Final Call To Action */}
        <section 
          className="hero-dark" 
          style={{ 
            borderRadius: 28, 
            padding: 'clamp(40px, 6vw, 64px) 24px', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
            <h2 className="text-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', color: '#ffffff', marginBottom: 14, fontWeight: 800 }}>
              Stop Wasting Ad Dollars Today. Get Your Free AI Audit & Action Plan.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>
              Join 4,800+ merchants who boosted their social media conversions with our AI Store Optimizer.
            </p>
            <button
              type="button"
              onClick={scrollToAuditForm}
              className="btn btn-primary"
              style={{
                padding: '16px 32px',
                fontSize: 16,
                fontWeight: 800,
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
                cursor: 'pointer'
              }}
            >
              <Zap size={18} />
              <span>Launch Free Store Audit Engine</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
