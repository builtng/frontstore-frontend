'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaymentLinkStore {
  store_name: string;
  currency_code: string;
}

interface PaymentLinkData {
  id: string;
  title: string;
  amount: string;
  allow_custom_amount: boolean;
  currency_code: string;
  slug: string;
  type: 'one_time' | 'reusable';
  status: 'active' | 'paid' | 'disabled';
  payable: boolean;
  store: PaymentLinkStore;
}

export default function PaymentLinkPage() {
  const { slug } = useParams();

  const [paymentLink, setPaymentLink] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

  const [customAmount, setCustomAmount] = useState('');
  const [supporterName, setSupporterName] = useState('');
  const [supporterMessage, setSupporterMessage] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);

  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    if (!slug) return;

    const fetchPaymentLink = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/payment-links/${slug}`);
        if (!res.ok) {
          throw new Error('Payment link not found.');
        }
        const json = await res.json();
        setPaymentLink(json.data);
        setCustomAmount(json.data?.amount || '');
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve this payment link.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentLink();
  }, [slug]);

  // Payment verification on redirect back from Paystack
  useEffect(() => {
    if (!slug || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    if (!reference) return;

    const verifyPaymentReference = async () => {
      try {
        setVerifyingPayment(true);
        setPaymentError(null);
        const res = await fetch(`${API_URL}/v1/public/payment-links/${slug}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Payment verification failed.');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        setJustPaid(true);
        setPaidAmount(json.data?.receipt?.amount ? parseFloat(json.data.receipt.amount) : null);

        const updatedRes = await fetch(`${API_URL}/v1/public/payment-links/${slug}`);
        if (updatedRes.ok) {
          const updatedJson = await updatedRes.json();
          setPaymentLink(updatedJson.data);
        }
      } catch (err: any) {
        setPaymentError(err.message || 'Failed to verify payment.');
      } finally {
        setVerifyingPayment(false);
      }
    };

    verifyPaymentReference();
  }, [slug, API_URL]);

  // Confetti burst the moment a payment is confirmed
  useEffect(() => {
    if (!justPaid || typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0;
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const colors = ['#25d366', '#ffffff', '#c79a4b', '#34d77a', '#1da851'];
    const parts = Array.from({ length: 160 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.4,
      y: H * 0.32 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -9 - 3,
      g: 0.22 + Math.random() * 0.1,
      s: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    const start = performance.now();
    const frame = (t: number) => {
      const e = t - start;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99;
        const a = e > 1200 ? Math.max(0, 1 - (e - 1200) / 750) : 1;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62);
        ctx.restore();
      });
      if (e < 1980) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => size();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [justPaid]);

  const handlePayNow = async () => {
    if (!slug) return;

    if (paymentLink?.allow_custom_amount) {
      const minAmount = parseFloat(paymentLink.amount || '0');
      const chosenAmount = parseFloat(customAmount || '0');
      if (!chosenAmount || chosenAmount < minAmount) {
        setAmountTouched(true);
        toast.error(`Please enter at least ${getCurrencySymbol(paymentLink.currency_code)}${minAmount.toLocaleString()}.`);
        return;
      }
    }

    try {
      setIsInitializingPayment(true);
      const body: Record<string, string> = {};
      if (paymentLink?.allow_custom_amount) body.amount = customAmount;
      if (supporterName.trim()) body.name = supporterName.trim();
      if (supporterMessage.trim()) body.message = supporterMessage.trim();

      const res = await fetch(`${API_URL}/v1/public/payment-links/${slug}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to initialize payment.');
      }
      if (json.data && json.data.checkout_url) {
        window.location.href = json.data.checkout_url;
      } else {
        throw new Error('Invalid payment response.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during payment initialization.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    if (code === 'NGN') return '₦';
    if (code === 'GHS') return 'GH₵';
    if (code === 'KES') return 'KSh';
    if (code === 'ZAR') return 'R';
    if (code === 'USD') return '$';
    if (code === 'GBP') return '£';
    return code + ' ';
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

  if (error || !paymentLink) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '24px', textAlign: 'center' }}>
        <Search size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Payment Link Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px' }}>{error || "We couldn't locate this payment link. Please verify the link and try again."}</p>
        <a href="/" style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }} className="clickable">Go to home</a>
      </div>
    );
  }

  const { store } = paymentLink;
  const currencySymbol = getCurrencySymbol(paymentLink.currency_code || store.currency_code);
  const minAmount = parseFloat(paymentLink.amount || '0');
  const amountLabel = `${currencySymbol}${minAmount.toLocaleString()}`;
  const showPaidState = justPaid || (paymentLink.type === 'one_time' && paymentLink.status === 'paid');
  const canPay = paymentLink.payable && !showPaidState;
  const paidAmountLabel = `${currencySymbol}${(paidAmount ?? minAmount).toLocaleString()}`;
  const headlineAmount = paymentLink.allow_custom_amount
    ? `${currencySymbol}${(parseFloat(customAmount || '0') || 0).toLocaleString()}`
    : amountLabel;
  const customAmountBelowMin = paymentLink.allow_custom_amount && amountTouched && (parseFloat(customAmount || '0') || 0) < minAmount;
  const isAmountInvalid = paymentLink.allow_custom_amount && (parseFloat(customAmount || '0') || 0) < minAmount;
  const quickAmounts = Array.from(new Set([minAmount, minAmount * 2, minAmount * 5])).filter(a => a > 0);
  const storeInitial = (store.store_name || 'F').charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      {justPaid && (
        <canvas
          ref={confettiRef}
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 100 }}
        />
      )}

      <header style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20 }}>
        <span style={{
          width: 24, height: 24, borderRadius: '7px', background: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800,
          fontFamily: 'var(--font-heading)', flexShrink: 0,
        }}>
          {storeInitial}
        </span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
          {store.store_name}
        </span>
      </header>

      <main style={{ padding: '32px 16px 100px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', padding: '4px 0 4px' }}>
          {!showPaidState && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>{paymentLink.title}</p>
          )}
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em',
            transition: 'transform 0.3s ease', transform: showPaidState ? 'scale(1.03)' : 'scale(1)',
          }}>
            {showPaidState ? paidAmountLabel : headlineAmount}
          </h1>
          {paymentLink.allow_custom_amount && canPay && (
            <p style={{ color: 'var(--text-faint)', fontSize: '12px', marginTop: '4px' }}>Minimum {amountLabel}</p>
          )}
        </div>

        {verifyingPayment && (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', textAlign: 'center', color: 'var(--text)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid var(--text-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
            Verifying your payment with Paystack...
          </div>
        )}

        {paymentError && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: '16px', padding: '16px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {paymentError}
          </div>
        )}

        {showPaidState && (
          <div
            className="card"
            style={{
              padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center',
              animation: 'pay-success-in 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pay-success-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
            }}>
              <CheckCircle2 size={26} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Payment Received</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: '300px' }}>
              Thank you! Your payment of <strong style={{ color: 'var(--text)' }}>{paidAmountLabel}</strong> to <strong style={{ color: 'var(--text)' }}>{store.store_name}</strong> was successful.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-faint)', fontSize: '11.5px', marginTop: '4px' }}>
              <ShieldCheck size={13} /> Secured by Paystack
            </div>
          </div>
        )}

        {!canPay && !showPaidState && (
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <AlertCircle size={19} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Link Unavailable</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              This payment link has expired or is no longer accepting payments.
            </p>
          </div>
        )}

        {canPay && paymentLink.allow_custom_amount && (
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Your amount ({paymentLink.currency_code || store.currency_code})
              </label>
              <input
                type="number"
                min={minAmount}
                step="0.01"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setAmountTouched(true); }}
                onBlur={() => setAmountTouched(true)}
                className="form-control"
                style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center' }}
                placeholder={amountLabel}
              />
              {customAmountBelowMin && (
                <p style={{ fontSize: '11.5px', color: 'var(--danger)', marginTop: '4px' }}>
                  Minimum amount is {amountLabel}.
                </p>
              )}
              {quickAmounts.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {quickAmounts.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setCustomAmount(String(a)); setAmountTouched(true); }}
                      className="clickable"
                      style={{
                        padding: '6px 12px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 700,
                        border: `1.5px solid ${parseFloat(customAmount || '0') === a ? 'var(--primary)' : 'var(--border)'}`,
                        background: parseFloat(customAmount || '0') === a ? 'var(--primary-light)' : 'transparent',
                        color: parseFloat(customAmount || '0') === a ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    >
                      {currencySymbol}{a.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Your name (optional)
              </label>
              <input
                type="text"
                value={supporterName}
                onChange={e => setSupporterName(e.target.value)}
                className="form-control"
                placeholder="e.g. Chidinma"
                maxLength={150}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Say something (optional)
              </label>
              <textarea
                value={supporterMessage}
                onChange={e => setSupporterMessage(e.target.value)}
                className="form-control"
                style={{ height: '64px', resize: 'none' }}
                placeholder="Leave a message of support..."
                maxLength={500}
              />
            </div>
          </div>
        )}

        {canPay && (
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={19} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Pay Online Securely</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Pay via Paystack using Cards, Bank Transfer, or USSD.
            </p>
            <button
              onClick={handlePayNow}
              disabled={isInitializingPayment || isAmountInvalid}
              className="btn btn-primary clickable"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isAmountInvalid ? 0.5 : 1,
                cursor: isAmountInvalid ? 'not-allowed' : 'pointer'
              }}
            >
              {isInitializingPayment
                ? 'Initializing...'
                : isAmountInvalid
                  ? 'Enter an amount to continue'
                  : `Pay Now ${paymentLink.allow_custom_amount ? headlineAmount : amountLabel}`}
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pay-success-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pay-success-pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
