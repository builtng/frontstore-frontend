'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  AlertTriangle,
  Upload,
  X,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Search,
  ExternalLink,
  MessageSquare,
  FileText,
  Truck,
  RotateCcw,
  BadgeCheck,
  Camera,
  Image as ImageIcon,
  Loader2,
  HelpCircle,
  Phone,
  Mail,
  Scale
} from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';
import { getApiUrl } from '@/lib/api';
import { getCurrencySymbol } from '@/utils/currency';
import { getOptimizedImageUrl } from '@/lib/image';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: string;
  quantity: number;
  product?: {
    id: string;
    image_urls?: string[];
  } | null;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  total_amount: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  dispute_status?: string | null;
  store: {
    store_name: string;
    username: string;
    whatsapp_phone: string;
    currency_code: string;
    is_verified?: boolean;
    logo_url?: string | null;
  };
  items: OrderItem[];
}

interface UploadedProof {
  url: string;
  name: string;
  size?: number;
}

function AppealContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrderId = searchParams.get('order_id') || searchParams.get('order') || searchParams.get('id') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form states
  const [issueType, setIssueType] = useState('wrong_product');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [productOrdered, setProductOrdered] = useState('');
  const [productReceived, setProductReceived] = useState('');
  const [expectedResolution, setExpectedResolution] = useState('full_refund');
  const [explanation, setExplanation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Screenshot Uploads
  const [proofs, setProofs] = useState<UploadedProof[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppeal, setSubmittedAppeal] = useState<any>(null);

  // Fetch order helper
  const fetchOrderDetails = async (lookupId: string) => {
    if (!lookupId.trim()) return;
    setLoadingOrder(true);
    setSearchError(null);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/v1/public/orders/${encodeURIComponent(lookupId.trim())}`);
      const json = await res.json();

      if (!res.ok || !json.data) {
        throw new Error(json.message || 'Order not found. Please check your order reference.');
      }

      const ord: OrderData = {
        ...json.data,
        items: Array.isArray(json.data.items)
          ? json.data.items
          : json.data.items
          ? Object.values(json.data.items)
          : [],
      };

      setOrder(ord);
      setCustomerName(ord.customer_name || '');
      setCustomerPhone(ord.customer_phone || '');
      if (ord.customer_email) setCustomerEmail(ord.customer_email);

      if (ord.items.length > 0) {
        setSelectedItemName(ord.items[0].product_name);
        setProductOrdered(ord.items[0].product_name);
      }

      if (ord.payment_status !== 'paid') {
        toast.error('Only paid orders are eligible for buyer escrow appeals.');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setSearchError(err.message || 'Could not locate order.');
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrderDetails(initialOrderId);
    }
  }, [initialOrderId]);

  // Handle image upload to backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (proofs.length + files.length > 6) {
      toast.error('You can upload up to 6 screenshot proofs.');
      return;
    }

    setUploading(true);
    const apiUrl = getApiUrl();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 10MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch(`${apiUrl}/v1/public/appeals/upload`, {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        if (!res.ok || json.status !== 'success') {
          throw new Error(json.message || `Failed to upload ${file.name}`);
        }

        setProofs((prev) => [
          ...prev,
          {
            url: json.url,
            name: file.name,
            size: file.size,
          },
        ]);
        toast.success(`Screenshot uploaded: ${file.name}`);
      } catch (err: any) {
        console.error('Upload error:', err);
        toast.error(err.message || 'Error uploading file.');
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeProof = (indexToRemove: number) => {
    setProofs((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit appeal
  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) {
      toast.error('Please search and select your order first.');
      return;
    }

    if (order.payment_status !== 'paid') {
      toast.error('This order is unpaid and cannot be disputed under escrow.');
      return;
    }

    if (order.dispute_status === 'open') {
      toast.error('An active appeal or dispute is already open for this order.');
      return;
    }

    if (!explanation.trim()) {
      toast.error('Please describe what went wrong with your product delivery.');
      return;
    }

    if (proofs.length === 0) {
      toast.error('Please upload at least 1 screenshot or photo showing the incorrect product received.');
      return;
    }

    setSubmitting(true);
    const apiUrl = getApiUrl();

    try {
      const payload = {
        reason: issueType,
        issue_type: issueType,
        product_ordered: productOrdered.trim() || selectedItemName,
        product_received: productReceived.trim(),
        expected_resolution: expectedResolution,
        explanation: explanation.trim(),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        attachments: proofs.map((p) => p.url),
      };

      const res = await fetch(`${apiUrl}/v1/public/orders/${order.id}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'Failed to submit appeal. Please try again.');
      }

      toast.success('Appeal submitted successfully! Escrow hold activated.');
      setSubmittedAppeal({
        order,
        dispute: json.data,
        reference: `APL-${order.order_number}`,
        resolution: expectedResolution,
      });
    } catch (err: any) {
      console.error('Submit appeal error:', err);
      toast.error(err.message || 'Could not submit appeal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      <PublicSiteNav />

      <div style={{ flex: 1, width: '100%', maxWidth: 1040, margin: '0 auto', padding: '36px 20px 60px' }}>
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <a
            href={order ? `/track/${order.id}` : '/return-policy'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
            className="clickable"
          >
            <ArrowLeft size={14} /> Back to {order ? `Order #${order.order_number}` : 'Return Policy'}
          </a>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={13} /> Frontstore Escrow Protection Active
            </span>
          </div>
        </div>

        {/* Hero Banner */}
        <header style={{ marginBottom: 32 }}>
          <h1 className="text-display" style={{ fontSize: 'clamp(26px, 4vw, 36px)', marginBottom: 12, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Customer Appeal & Wrong Product Resolution
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15.5, lineHeight: 1.6, maxWidth: 840 }}>
            If a merchant delivered the incorrect item, wrong size or color, counterfeit goods, or defective merchandise, you can lodge an official appeal here.
            Submitting this appeal <strong>immediately pauses the merchant&apos;s escrow payout</strong> while our resolution desk mediates your claim.
          </p>
        </header>

        {/* Protection Guarantee Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(7, 94, 84, 0.08) 0%, rgba(37, 211, 102, 0.08) 100%)',
            border: '1px solid rgba(7, 94, 84, 0.2)',
            borderRadius: 'var(--r-md, 14px)',
            padding: '18px 24px',
            marginBottom: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#075E54', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Instant Escrow Freeze</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Merchant cannot withdraw funds</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#075E54', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>24-48h Response SLA</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dedicated support mediation</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#075E54', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Camera size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Screenshot Verification</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Evidence-based determinations</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#075E54', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <RotateCcw size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Replacement or Refund</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>100% money-back guarantee</div>
            </div>
          </div>
        </div>

        {/* SUCCESS VIEW ONCE SUBMITTED */}
        {submittedAppeal ? (
          <div className="card shadow-lg animate-fade-in" style={{ padding: 40, background: 'var(--surface)', borderRadius: 20, textAlign: 'center', border: '1.5px solid #22c55e' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 20px',
              }}
            >
              <ShieldCheck size={40} />
            </div>

            <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 14px', fontSize: 12, fontWeight: 800, marginBottom: 12, display: 'inline-block' }}>
              🔒 Payout Release Paused
            </span>

            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10, color: 'var(--text)' }}>
              Appeal Lodged Successfully!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 620, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Your appeal for Order <strong>#{submittedAppeal.order.order_number}</strong> has been logged.
              Our dispute compliance desk has been alerted via email and will review your screenshot proof.
            </p>

            <div
              style={{
                maxWidth: 480,
                margin: '0 auto 32px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 24px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 600 }}>Case Reference</span>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 800 }}>{submittedAppeal.reference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 600 }}>Store</span>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {submittedAppeal.order.store?.logo_url ? (
                    <img
                      src={getOptimizedImageUrl(submittedAppeal.order.store.logo_url, 'thumb')}
                      alt=""
                      style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                  {submittedAppeal.order.store?.store_name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 600 }}>Amount Protected</span>
                <span style={{ fontSize: 14, color: '#075E54', fontWeight: 800 }}>
                  {getCurrencySymbol(submittedAppeal.order.store?.currency_code)}
                  {Number(submittedAppeal.order.total_amount).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 600 }}>Requested Outcome</span>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, textTransform: 'capitalize' }}>
                  {submittedAppeal.resolution.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ maxWidth: 520, margin: '0 auto 32px', textAlign: 'left' }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 16 }}>
                Resolution Process & Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Appeal Submitted & Escrow Paused</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Funds are locked. Admin notified with your screenshot evidence.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#075E54', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Evidence Assessment (24-48 Hours)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Frontstore compliance compares photos against listing and waybill.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>Determination / Payout Release or Refund</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Merchant sends replacement or funds are refunded directly to you.</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`/track/${submittedAppeal.order.id}`} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 10, fontWeight: 700 }}>
                View Order & Dispute Updates &rarr;
              </a>
              <a href="mailto:disputes@frontstore.ng" className="btn btn-outline" style={{ padding: '12px 20px', fontSize: 14, borderRadius: 10, fontWeight: 700 }}>
                Contact Disputes Desk
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'flex-start' }}>
            
            {/* Left Column: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Order Lookup Step if no order loaded */}
              {!order && (
                <section className="card shadow-md" style={{ padding: 28, background: 'var(--surface)', borderRadius: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Search size={18} style={{ color: 'var(--primary)' }} /> 1. Identify Your Order
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>
                    Enter your Frontstore Order Number (e.g. <code>ORD-12345</code>) or Order ID sent to you via SMS/WhatsApp or email.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      fetchOrderDetails(orderQuery);
                    }}
                    style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
                  >
                    <input
                      type="text"
                      placeholder="e.g. ORD-12345 or order UUID"
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        minWidth: 200,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid var(--border)',
                        background: 'var(--bg)',
                        fontSize: 14,
                        color: 'var(--text)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loadingOrder}
                      className="btn btn-primary clickable"
                      style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                      {loadingOrder ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      Find Order
                    </button>
                  </form>

                  {searchError && (
                    <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} /> {searchError}
                    </div>
                  )}
                </section>
              )}

              {/* Order Found Preview */}
              {order && (
                <section className="card shadow-sm" style={{ padding: 22, background: 'var(--surface)', borderRadius: 16, border: '1.5px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {order.store.logo_url ? (
                        <img
                          src={getOptimizedImageUrl(order.store.logo_url, 'thumb')}
                          alt={order.store.store_name}
                          style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: order.store.logo_url ? 'none' : 'flex',
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #0B5D39 0%, #074328 100%)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          fontWeight: 900,
                          color: '#fff',
                          flexShrink: 0
                        }}
                      >
                        {(order.store.store_name || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 800 }}>Order #{order.order_number}</span>
                          {order.store.is_verified && (
                            <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700 }}>
                              <BadgeCheck size={14} /> Verified Store
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          Merchant: <strong>{order.store.store_name}</strong> (@{order.store.username})
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#075E54' }}>
                        {getCurrencySymbol(order.store.currency_code)}
                        {Number(order.total_amount).toLocaleString()}
                      </div>
                      <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 11, padding: '3px 8px' }}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                      Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrder(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Change Order
                    </button>
                  </div>
                </section>
              )}

              {/* Step 2: Appeal Form (Enabled once order is loaded) */}
              <form onSubmit={handleSubmitAppeal} style={{ display: 'flex', flexDirection: 'column', gap: 24, opacity: order ? 1 : 0.6, pointerEvents: order ? 'auto' : 'none' }}>
                
                {/* A. Discrepancy Category */}
                <section className="card shadow-md" style={{ padding: 28, background: 'var(--surface)', borderRadius: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} style={{ color: '#d97706' }} /> 2. Nature of the Problem
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {[
                      { id: 'wrong_product', title: 'Wrong Product Sent', badge: 'Wrong Product', badgeBg: '#ffe4e6', badgeColor: '#e11d48', badgeBorder: '#fecdd3', desc: 'Different item, wrong variant, wrong color or size' },
                      { id: 'damaged_items', title: 'Damaged / Defective', badge: 'Damaged', badgeBg: '#ffedd5', badgeColor: '#c2410c', badgeBorder: '#fed7aa', desc: 'Broken item, torn fabric, or non-functional' },
                      { id: 'missing_items', title: 'Missing Pieces', badge: 'Incomplete', badgeBg: '#ede9fe', badgeColor: '#6d28d9', badgeBorder: '#ddd6fe', desc: 'Incomplete order or missing parcel items' },
                      { id: 'fraud', title: 'Counterfeit / Fake', badge: 'Counterfeit', badgeBg: '#fef2f2', badgeColor: '#b91c1c', badgeBorder: '#fecaca', desc: 'Unauthentic brand or false specifications' },
                      { id: 'non_shipment', title: 'Not Delivered', badge: 'Delivery', badgeBg: '#e0f2fe', badgeColor: '#0369a1', badgeBorder: '#bae6fd', desc: 'Merchant took payment but failed to ship' },
                      { id: 'others', title: 'Others / Unlisted Issue', badge: 'Others', badgeBg: '#f1f5f9', badgeColor: '#475569', badgeBorder: '#cbd5e1', desc: 'Any other fulfillment problem or special circumstances' },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setIssueType(opt.id)}
                        className="clickable"
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: issueType === opt.id ? `2px solid ${opt.badgeColor}` : '1px solid var(--border)',
                          background: issueType === opt.id ? opt.badgeBg : 'var(--bg)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: issueType === opt.id ? opt.badgeColor : 'var(--text)' }}>
                            {opt.title}
                          </span>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              background: opt.badgeBg,
                              color: opt.badgeColor,
                              border: `1px solid ${opt.badgeBorder}`,
                              padding: '2px 7px',
                              borderRadius: 6,
                            }}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {opt.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Which Item? */}
                  {order && order.items.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text)', marginBottom: 8 }}>
                        Which Item in this order has the issue?
                      </label>
                      <select
                        value={selectedItemName}
                        onChange={(e) => {
                          setSelectedItemName(e.target.value);
                          setProductOrdered(e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg)',
                          fontSize: 14,
                          color: 'var(--text)',
                        }}
                      >
                        {order.items.map((it) => (
                          <option key={it.id} value={it.product_name}>
                            {it.product_name} (Qty: {it.quantity}) — {getCurrencySymbol(order.store.currency_code)}{Number(it.product_price).toLocaleString()}
                          </option>
                        ))}
                        <option value="Entire Order / Multiple Items">Entire Order / Multiple Items</option>
                        <option value="Others / Unlisted Item">Others (Unlisted item or separate charge)</option>
                      </select>
                    </div>
                  )}

                  {/* Wrong Product Contrast Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Product You Ordered
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Leather Oxford Shoes - Brown (Size 44)"
                        value={productOrdered}
                        onChange={(e) => setProductOrdered(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg)',
                          fontSize: 13.5,
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', marginBottom: 6 }}>
                        Product Merchant Actually Delivered *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rubber Slippers - Blue (Size 41)"
                        value={productReceived}
                        onChange={(e) => setProductReceived(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #f87171',
                          background: 'var(--bg)',
                          fontSize: 13.5,
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Desired Resolution */}
                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text)', marginBottom: 8 }}>
                      What resolution are you requesting?
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                      {[
                        { id: 'full_refund', label: '100% Full Refund', desc: 'Return funds to your account' },
                        { id: 'replacement', label: 'Merchant Replacement', desc: 'Send the exact item ordered' },
                        { id: 'partial_refund', label: 'Partial Refund', desc: 'Price difference compensation' },
                      ].map((res) => (
                        <label
                          key={res.id}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: expectedResolution === res.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: expectedResolution === res.id ? 'rgba(7, 94, 84, 0.05)' : 'var(--bg)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="resolution"
                            value={res.id}
                            checked={expectedResolution === res.id}
                            onChange={(e) => setExpectedResolution(e.target.value)}
                            style={{ marginTop: 2 }}
                          />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{res.label}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{res.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text)', marginBottom: 6 }}>
                      Detailed Explanation of the Issue *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please explain clearly what arrived in the package, any unboxing notes, or your conversation with the merchant..."
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1.5px solid var(--border)',
                        background: 'var(--bg)',
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        color: 'var(--text)',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </section>

                {/* B. Multiple Screenshot Proof Upload */}
                <section className="card shadow-md" style={{ padding: 28, background: 'var(--surface)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <Camera size={18} style={{ color: 'var(--primary)' }} /> 3. Screenshot & Photo Evidence *
                    </h3>
                    <span style={{ fontSize: 12, fontWeight: 700, color: proofs.length > 0 ? '#16a34a' : '#dc2626' }}>
                      {proofs.length} of 6 Uploaded
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>
                    Upload clear photos of the wrong item, the courier waybill / shipping label, and screenshots of any WhatsApp chats with the merchant.
                  </p>

                  {/* Drag-and-drop trigger */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 14,
                      padding: '28px 20px',
                      textAlign: 'center',
                      background: 'var(--bg)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    className="clickable"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(7, 94, 84, 0.1)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                      {uploading ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                      {uploading ? 'Compressing and uploading proof...' : 'Click or Drag Screenshots & Photos Here'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Supports JPEG, PNG, WebP up to 10MB each
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {proofs.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14, marginTop: 18 }}>
                      {proofs.map((pr, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: 10,
                            overflow: 'hidden',
                            border: '1.5px solid var(--border)',
                            background: '#000',
                            aspectRatio: '4/3',
                          }}
                        >
                          <img
                            src={pr.url}
                            alt={`Proof ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProof(idx);
                            }}
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'grid',
                              placeItems: 'center',
                              cursor: 'pointer',
                            }}
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(15,23,42,0.8)',
                              color: '#fff',
                              fontSize: 10,
                              padding: '3px 6px',
                              textAlign: 'center',
                              fontWeight: 700,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Proof #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Evidence Checklist */}
                  <div style={{ marginTop: 20, padding: 14, background: 'rgba(7, 94, 84, 0.04)', borderRadius: 10, border: '1px solid rgba(7, 94, 84, 0.12)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={15} /> Recommended Evidence for Fast 24h Approval:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <li>Full photo of the delivered item showing all discrepancies.</li>
                      <li>Photo of the courier label / waybill pasted on the delivery carton.</li>
                      <li>Screenshot of your WhatsApp conversation requesting the merchant to exchange.</li>
                    </ul>
                  </div>
                </section>

                {/* C. Contact Verification */}
                <section className="card shadow-md" style={{ padding: 28, background: 'var(--surface)', borderRadius: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> 4. Your Contact Details for Mediation Updates
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg)',
                          fontSize: 13.5,
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Email Address (For Case Notification) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg)',
                          fontSize: 13.5,
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                        WhatsApp Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234..."
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid var(--border)',
                          background: 'var(--bg)',
                          fontSize: 13.5,
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  </div>
                </section>

                {/* Submit Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="btn btn-primary clickable"
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      fontSize: 15.5,
                      fontWeight: 800,
                      borderRadius: 12,
                      background: '#dc2626',
                      borderColor: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Freezing Payout & Filing Appeal...
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={18} />
                        Submit Appeal & Pause Merchant Payout
                      </>
                    )}
                  </button>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                    By clicking submit, you confirm that the information and screenshots provided are accurate.
                    Frontstore mediation specialists will contact both you and the merchant.
                  </div>
                </div>

              </form>
            </div>

            {/* Right Column: Escrow FAQ & Help Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Escrow Rule Card */}
              <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Scale size={18} style={{ color: 'var(--primary)' }} /> How Frontstore Escrow Protects You
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>1. Funds Are Not Released Instantly:</strong>
                    <p style={{ margin: '2px 0 0' }}>Merchant payments are held in escrow until delivery is verified or the dispute window elapses.</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>2. Immediate Settlement Pause:</strong>
                    <p style={{ margin: '2px 0 0' }}>Filing this appeal locks merchant settlement for this transaction until the claim is reviewed.</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>3. Full Refund Guarantee:</strong>
                    <p style={{ margin: '2px 0 0' }}>If the merchant sent an unrectified wrong product, your payment is refunded back to your bank account or card.</p>
                  </div>
                </div>
              </div>

              {/* Tips for Wrong Product Claims */}
              <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={16} style={{ color: 'var(--primary)' }} /> Why do we need screenshots?
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                  Merchants are required to provide proof of dispatch. By uploading clear photos of the wrong item and the shipping waybill, our compliance team can verify the discrepancy without lengthy delays.
                </p>
              </div>

              {/* Direct Dispute Desk */}
              <div className="card shadow-sm" style={{ padding: 24, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Need Immediate Help?</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 14 }}>
                  Have an urgent question regarding an ongoing claim?
                </p>
                <a
                  href="mailto:disputes@frontstore.ng"
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '10px', fontSize: 13, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700 }}
                >
                  <Mail size={15} /> disputes@frontstore.ng
                </a>
              </div>

            </aside>

          </div>
        )}

      </div>

      <PublicSiteFooter />
    </div>
  );
}

export default function AppealPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 14 }}>
            <Loader2 size={20} className="animate-spin" /> Loading Appeal Center...
          </div>
        </div>
      }
    >
      <AppealContent />
    </Suspense>
  );
}
