'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Package, AlertCircle, Check, Download, ExternalLink, Lock, Star, Truck, PartyPopper, ShieldCheck, MapPin, User, Phone, Send, MessageSquare, AlertTriangle, ShieldAlert, Scale } from 'lucide-react';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { WhatsAppIcon } from '../../../components/WhatsAppIcon';

interface OrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_price: string;
  quantity: number;
  product?: {
    id: string;
    is_digital: boolean;
    digital_file_url?: string | null;
    digital_link?: string | null;
  } | null;
}

interface Store {
  store_name: string;
  whatsapp_phone: string;
  currency_code: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: string;
  delivery_address: string | null;
  total_amount: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  store: Store;
  items: OrderItem[];
  delivery_confirmed_at?: string | null;
  reviews?: any[];
  dispute_status?: string | null;
  frontstore_protect?: boolean;
  frontstore_protect_fee?: string | number | null;
  delivery_milestone?: string | null;
  tracking_number?: string | null;
  shipping_provider?: string | null;
  payout_hold_until?: string | null;
}

export default function OrderTrackingPage() {
  const { id } = useParams();

  // Data State
  const [order, setOrderInternal] = useState<Order | null>(null);
  const setOrder = (ordData: Order | null) => {
    if (!ordData) {
      setOrderInternal(null);
      return;
    }
    const normalized = {
      ...ordData,
      items: Array.isArray(ordData.items) ? ordData.items : (ordData.items ? Object.values(ordData.items) : []),
      reviews: Array.isArray(ordData.reviews) ? ordData.reviews : (ordData.reviews ? Object.values(ordData.reviews) : []),
    };
    setOrderInternal(normalized as Order);
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment and Confirmation States
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [deliveryConfirmationOpen, setDeliveryConfirmationOpen] = useState(false);

  // Dispute states
  const [disputePanelOpen, setDisputePanelOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('non_shipment');
  const [disputeExplanation, setDisputeExplanation] = useState('');
  const [disputeChat, setDisputeChat] = useState<any>(null);
  const [disputeMessageText, setDisputeMessageText] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [isSendingDisputeMessage, setIsSendingDisputeMessage] = useState(false);

  const fetchActiveDispute = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/v1/public/orders/${id}/active-dispute`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setDisputeChat(json.data);
        }
      }
    } catch (err) {
      console.error("Could not fetch dispute details:", err);
    }
  };

  useEffect(() => {
    if (order && (order.dispute_status === 'open' || order.dispute_status === 'resolved' || order.dispute_status === 'refunded')) {
      fetchActiveDispute();
    }
  }, [order]);

  const handleOpenDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSubmittingDispute(true);
      const res = await fetch(`${API_URL}/v1/public/orders/${id}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason,
          explanation: disputeExplanation,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to open dispute.');
      toast.success('Dispute opened successfully. Payout has been paused.');
      setDisputePanelOpen(false);
      // Reload order details
      const orderRes = await fetch(`${API_URL}/v1/public/orders/${id}`);
      if (orderRes.ok) {
        const orderJson = await orderRes.json();
        setOrder(orderJson.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleSendDisputeMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeChat || !disputeMessageText.trim()) return;
    try {
      setIsSendingDisputeMessage(true);
      const res = await fetch(`${API_URL}/v1/public/disputes/${disputeChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: 'buyer',
          sender_name: order?.customer_name || 'Buyer',
          message: disputeMessageText,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send message.');
      setDisputeMessageText('');
      fetchActiveDispute();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsSendingDisputeMessage(false);
    }
  };

  // Reviews States
  const [submittingReviews, setSubmittingReviews] = useState(false);
  const [productRatings, setProductRatings] = useState<{ [productId: string]: number }>({});
  const [productComments, setProductComments] = useState<{ [productId: string]: string }>({});
  const [storeRating, setStoreRating] = useState(5);
  const [storeComment, setStoreComment] = useState('');
  const [localReviewed, setLocalReviewed] = useState(false);

  useEffect(() => {
    if (order && order.items) {
      const initialRatings: { [productId: string]: number } = {};
      const initialComments: { [productId: string]: string } = {};
      order.items.forEach(item => {
        if (item.product_id) {
          initialRatings[item.product_id] = 5;
          initialComments[item.product_id] = '';
        }
      });
      setProductRatings(initialRatings);
      setProductComments(initialComments);
    }
  }, [order]);

  const handleSubmitReviews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !order) return;

    try {
      setSubmittingReviews(true);
      const reviewsPayload: any[] = [];

      // Add product reviews
      order.items.forEach(item => {
        if (item.product_id) {
          reviewsPayload.push({
            product_id: item.product_id,
            rating: productRatings[item.product_id] ?? 5,
            comment: productComments[item.product_id] ?? ''
          });
        }
      });

      // Add general store review
      reviewsPayload.push({
        product_id: null,
        rating: storeRating,
        comment: storeComment
      });

      const res = await fetch(`${API_URL}/v1/public/orders/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewsPayload })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit reviews.');
      }

      toast.success('Thank you! Your reviews have been submitted.');
      setLocalReviewed(true);

      // Reload order to fetch newly created reviews
      const updatedRes = await fetch(`${API_URL}/v1/public/orders/${id}`);
      if (updatedRes.ok) {
        const updatedJson = await updatedRes.json();
        setOrder(updatedJson.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during review submission.');
    } finally {
      setSubmittingReviews(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/orders/${id}`);
        if (!res.ok) {
          throw new Error('Order not found or access restricted.');
        }
        const json = await res.json();
        setOrder(json.data);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Payment Verification on Redirect
  useEffect(() => {
    if (!id || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference');
    const sessionId = params.get('session_id');
    const transactionId = params.get('transaction_id');

    const verifyBody = ref
      ? { reference: ref }
      : sessionId
      ? { session_id: sessionId, provider: 'stripe' }
      : transactionId
      ? { transaction_id: transactionId, provider: 'flutterwave' }
      : null;

    if (verifyBody) {
      const verifyPaymentReference = async () => {
        try {
          setVerifyingPayment(true);
          setPaymentError(null);
          const res = await fetch(`${API_URL}/v1/public/orders/${id}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifyBody)
          });
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.message || 'Payment verification failed.');
          }
          // Clean query params
          window.history.replaceState({}, document.title, window.location.pathname);
          // Reload
          const updatedRes = await fetch(`${API_URL}/v1/public/orders/${id}`);
          if (updatedRes.ok) {
            const updatedJson = await updatedRes.json();
            setOrder(updatedJson.data);
          }
        } catch (err: any) {
          setPaymentError(err.message || 'Failed to verify payment.');
        } finally {
          setVerifyingPayment(false);
        }
      };

      verifyPaymentReference();
    }
  }, [id, API_URL]);

  const handlePayNow = async () => {
    if (!id) return;
    try {
      setIsInitializingPayment(true);
      const res = await fetch(`${API_URL}/v1/public/orders/${id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to initialize payment.');
      }
      if (json.data && json.data.authorization_url) {
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error('Invalid payment response.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during payment initialization.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleConfirmDelivery = () => {
    if (!id) return;
    setDeliveryConfirmationOpen(true);
  };

  const confirmDelivery = async () => {
    if (!id) return;
    setDeliveryConfirmationOpen(false);
    try {
      setIsConfirmingDelivery(true);
      const res = await fetch(`${API_URL}/v1/public/orders/${id}/confirm-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to confirm delivery.');
      }
      const updatedRes = await fetch(`${API_URL}/v1/public/orders/${id}`);
      if (updatedRes.ok) {
        const updatedJson = await updatedRes.json();
        setOrder(updatedJson.data);
      }
      toast.success('Delivery confirmed! Payment has been released to the seller.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during delivery confirmation.');
    } finally {
      setIsConfirmingDelivery(false);
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

  // Render Shimmer Loader
  if (loading) {
    return (
      <div className="storefront-container" style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
        <div className="shimmer-loader" style={{ height: '32px', width: '40%', margin: '24px auto 16px', borderRadius: '6px' }}></div>
        <div className="shimmer-loader" style={{ height: '18px', width: '70%', margin: '0 auto 32px', borderRadius: '4px' }}></div>

        {/* Shimmer Tracker Box */}
        <div className="shimmer-loader" style={{ height: '120px', width: '100%', marginBottom: '24px', borderRadius: '16px' }}></div>

        {/* Shimmer Details */}
        <div className="shimmer-loader" style={{ height: '20px', width: '40%', marginBottom: '12px', borderRadius: '4px' }}></div>
        <div className="shimmer-loader" style={{ height: '100px', width: '100%', marginBottom: '24px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  // Render Error Page
  if (error || !order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '24px', textAlign: 'center' }}>
        <Search size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px' }}>{error || "We couldn't locate this order. Please verify the link and try again."}</p>
        <a href="/" style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }} className="clickable">Go to home</a>
      </div>
    );
  }

  const { store } = order;
  const currencySymbol = getCurrencySymbol(store.currency_code);
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isCancelled = order.order_status === 'cancelled';
  const isConfirmed = order.order_status === 'confirmed';
  const isCompleted = order.order_status === 'completed';
  const isDigitalOnly = order.items.length > 0 && order.items.every(item => item.product?.is_digital);
  const isDelivered = order.delivery_confirmed_at !== null;

  // Progress indexes: Placed=1, Confirmed=2, Completed=3
  let activeStepIndex = 1;
  if (isConfirmed) activeStepIndex = 2;
  if (isCompleted) activeStepIndex = 3;

  const statusMeta = isCancelled
    ? { label: 'Cancelled', color: 'var(--danger)', bg: 'var(--danger-light)' }
    : isCompleted
    ? { label: isDigitalOnly ? 'Delivered' : 'Completed', color: 'var(--primary)', bg: 'var(--primary-light)' }
    : isConfirmed
    ? { label: 'In Progress', color: 'var(--accent)', bg: 'var(--accent-light)' }
    : { label: 'Order Placed', color: 'var(--text-muted)', bg: 'var(--surface-2)' };

  // Build WhatsApp text for customer checking in
  const checkinMsg = `Hello *${store.store_name}*! I'm checking in on my order *#${order.order_number}* placed on ${new Date(order.created_at).toLocaleDateString()}. Let me know if there's any update!`;
  const whatsappChatUrl = `https://wa.me/${store.whatsapp_phone}?text=${encodeURIComponent(checkinMsg)}`;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>

      {/* Navbar Header */}
      <header style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={17} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
              Track Order
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {store.store_name}
            </span>
          </div>
        </div>
        <span className="badge" style={{ background: statusMeta.bg, color: statusMeta.color }}>
          {statusMeta.label}
        </span>
      </header>

      <main style={{ padding: '20px 16px 100px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Order Identifier Header */}
        <div style={{ textAlign: 'center', padding: '4px 0 4px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Order #{order.order_number}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Placed on {formattedDate}
          </p>
        </div>

        {/* Verifying Payment overlay/banner */}
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

        {/* Secure Online Payment Box */}
        {order.payment_status === 'unpaid' && (
          <div className="card" style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={19} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                Pay Online Securely
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Pay via Paystack using Cards, Bank Transfer, or USSD to instantly process your order.
            </p>
            {/* Trust Badge */}
            <div style={{
              background: 'var(--bg-2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left'
            }}>
              <ShieldCheck size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
              <span>
                <strong style={{ color: 'var(--text)' }}>Escrow Protection Active:</strong> For Free Plan stores, your payment is held securely in escrow until you confirm delivery below.
              </span>
            </div>
            <button
              onClick={handlePayNow}
              disabled={isInitializingPayment}
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
                gap: '8px'
              }}
            >
              {isInitializingPayment ? 'Initializing...' : `Pay Now ${currencySymbol}${parseFloat(order.total_amount || '0').toLocaleString()}`}
            </button>
          </div>
        )}

        {/* Confirm Delivery Box (Only when paid and not confirmed yet) */}
        {order.payment_status === 'paid' && order.delivery_confirmed_at === null && (
          <div style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isDigitalOnly ? <Download size={16} style={{ color: '#fff' }} /> : <Truck size={16} style={{ color: '#fff' }} />}
              </span>
              {isDigitalOnly ? 'Confirm Download' : 'Confirm Delivery Receipt'}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {isDigitalOnly
                ? 'Since you have downloaded or accessed your digital items, click below to confirm receipt and release funds to the seller.'
                : 'Once you have received your order items or the services have been rendered, click below to confirm receipt and release funds to the seller.'}
            </p>

            {(order as any).dispute_status && (order as any).dispute_status !== 'none' ? (
              <div style={{ background: '#fffbeb', border: '1.5px solid #d97706', borderRadius: '12px', padding: '14px', textAlign: 'center', color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: 13 }}>
                <AlertTriangle size={16} style={{ color: '#d97706' }} /> Payout is paused due to an active dispute.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleConfirmDelivery}
                  disabled={isConfirmingDelivery}
                  className="btn btn-whatsapp clickable"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14.5px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {isConfirmingDelivery ? 'Confirming...' : (isDigitalOnly ? 'Confirm Download' : "Yes, I've Received My Order")}
                </button>
                <button
                  type="button"
                  onClick={() => setDisputePanelOpen(true)}
                  className="btn clickable"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1.5px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldAlert size={14} /> Report Problem / Dispute Order
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delivery Confirmed Indicator */}
        {order.delivery_confirmed_at !== null && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Check size={16} strokeWidth={3} /> {isDigitalOnly ? 'Download Confirmed & Funds Released.' : 'Delivery Confirmed & Funds Released.'}
          </div>
        )}

        {/* Frontstore Protect Banner */}
        {(order as any).frontstore_protect ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 140, 126, 0.03) 100%)',
            border: '1.5px solid #25D366',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <ShieldCheck size={22} style={{ color: '#25D366', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                Protected by Frontstore Protect
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Your payment is held securely in escrow. Funds will be released to the seller only when you confirm receipt. Covered against fraud and non-shipment.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Standard Checkout. Payout is processed per merchant trust levels.
            </span>
          </div>
        )}

        {/* Merchant Trust Profile */}
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-border) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 900,
            color: '#fff',
            flexShrink: 0
          }}>
            {store.store_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{store.store_name}</strong>
              {(order.store as any).trust_score >= 41 && (
                <span style={{
                  background: 'rgba(37, 211, 102, 0.12)',
                  color: '#25D366',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Check size={10} strokeWidth={3} /> Verified Seller
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>
              Trust Score: <strong style={{ color: 'var(--text)' }}>{(order.store as any).trust_score ?? 20}</strong>/100 • Level {(order.store as any).seller_level ?? 1} Seller
            </p>
          </div>
        </div>

        {/* Real-time Logistics Tracker */}
        {order.delivery_method === 'delivery' && (order as any).tracking_number && (
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚚 Logistics Tracking</span>
              <span style={{ fontSize: '11px', textTransform: 'none', background: 'var(--bg-2)', padding: '2px 8px', borderRadius: '8px', color: 'var(--text)' }}>
                {(order as any).shipping_provider}
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 12 }}>
              {[
                { key: 'booked', label: 'Shipment Booked', desc: 'Shipping label generated and package queued.', done: ['booked', 'shipped', 'delivered'].includes((order as any).delivery_milestone || '') },
                { key: 'shipped', label: 'Dispatched / In Transit', desc: 'Package picked up and traveling to destination.', done: ['shipped', 'delivered'].includes((order as any).delivery_milestone || '') },
                { key: 'delivered', label: 'Delivered', desc: 'Logistics provider updated status to delivered.', done: ((order as any).delivery_milestone === 'delivered') || isDelivered },
              ].map(({ key, label, desc, done }, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <div key={key} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: done ? 'var(--primary)' : 'var(--bg-2)',
                        border: done ? 'none' : '2px solid var(--border)',
                        color: done ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {done ? <Check size={12} strokeWidth={3} /> : idx + 1}
                      </div>
                      {!isLast && (
                        <div style={{
                          width: '2px',
                          flex: 1,
                          minHeight: '26px',
                          margin: '2px 0',
                          backgroundColor: done ? 'var(--primary)' : 'var(--border)',
                        }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: isLast ? 0 : '18px' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: done ? 'var(--text)' : 'var(--text-muted)' }}>{label}</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tracking #: <strong>{(order as any).tracking_number}</strong></span>
              <a href={`${API_URL}/v1/orders/${order.id}/shipping-label`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ExternalLink size={12} /> View Label
              </a>
            </div>
          </div>
        )}

        {/* Dispute Chat Resolution Center */}
        {disputeChat && (
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Scale size={15} /> Dispute Resolution Center
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'var(--bg-2)', padding: '10px 12px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid var(--border)' }}>
                <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 700, color: '#d97706' }}>{disputeChat.status.replace(/_/g, ' ')}</span></div>
                <div style={{ marginTop: 4 }}><strong>Reason:</strong> {disputeChat.reason.replace(/_/g, ' ').toUpperCase()}</div>
              </div>

              {/* Chat Messages */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 4px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg)' }}>
                {disputeChat.messages && disputeChat.messages.map((msg: any) => {
                  const isMe = msg.sender_type === 'buyer';
                  return (
                    <div key={msg.id} style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isMe ? 'var(--primary)' : 'var(--bg-2)',
                      color: isMe ? '#fff' : 'var(--text)',
                      padding: '8px 12px',
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      fontSize: '13px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.8, marginBottom: 2 }}>{msg.sender_name} ({msg.sender_type})</div>
                      <div>{msg.message}</div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              {['resolved', 'refunded', 'closed'].includes(disputeChat.status) ? (
                <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  This dispute has been resolved and closed.
                </div>
              ) : (
                <form onSubmit={handleSendDisputeMessage} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={disputeMessageText}
                    onChange={e => setDisputeMessageText(e.target.value)}
                    placeholder="Type message to seller/admin..."
                    style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)' }}
                    required
                  />
                  <button type="submit" disabled={isSendingDisputeMessage} style={{ width: 38, height: 38, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="clickable">
                    {isSendingDisputeMessage ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={15} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Dispute Opening Modal */}
        {disputePanelOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 16 }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
                <ShieldAlert size={18} /> Dispute Order #{order.order_number}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Opening a dispute pauses the payout release process immediately. Please describe the problem clearly below.
              </p>

              <form onSubmit={handleOpenDisputeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Reason</label>
                  <select
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)' }}
                  >
                    <option value="non_shipment">Items Not Received / Not Shipped</option>
                    <option value="damaged_items">Damaged or Defective Items</option>
                    <option value="incorrect_items">Incorrect Items Sent</option>
                    <option value="fraud">Suspected Fraudulent Listing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Explanation & Proof Details</label>
                  <textarea
                    required
                    placeholder="Provide a detailed explanation. E.g., 'Order placed 6 days ago, seller has not shipped nor replied on WhatsApp.'"
                    value={disputeExplanation}
                    onChange={e => setDisputeExplanation(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', minHeight: 90, resize: 'none', color: 'var(--text)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => setDisputePanelOpen(false)} style={{ flex: 1, padding: 12, border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'transparent', fontWeight: 700, color: 'var(--text)' }} className="clickable">Cancel</button>
                  <button type="submit" disabled={isSubmittingDispute} style={{ flex: 1, padding: 12, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }} className="clickable">
                    {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Visual Progress Timeline */}
        {isCancelled ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '16px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> This order has been cancelled by the seller.
          </div>
        ) : (
          <div className="card" style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Order Progress
            </h3>

            {[
              {
                step: 1,
                title: 'Order Placed',
                desc: 'We have received your order details.',
              },
              {
                step: 2,
                title: 'Confirmed',
                desc: 'Merchant is preparing your items.',
              },
              {
                step: 3,
                title: isDigitalOnly ? 'Access Provided' : 'Ready / Handed Over',
                desc: isDigitalOnly ? 'Digital downloads unlocked and ready.' : 'Order completed and shipped or picked up.',
              },
            ].map(({ step, title, desc }, idx, arr) => {
              const isDone = activeStepIndex >= step;
              const isLast = idx === arr.length - 1;
              return (
                <div key={step} style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? 'var(--primary)' : 'var(--bg)',
                      border: isDone ? 'none' : '2px solid var(--border)',
                      color: isDone ? '#fff' : 'var(--text-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {isDone ? <Check size={13} strokeWidth={3} /> : step}
                    </div>
                    {!isLast && (
                      <div style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '28px',
                        margin: '2px 0',
                        backgroundColor: activeStepIndex > step ? 'var(--primary)' : 'var(--border)',
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : '20px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: isDone ? 'var(--text)' : 'var(--text-faint)' }}>{title}</h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Digital Downloads Card (Only shown if there are digital items) */}
        {order.items.some(item => item.product?.is_digital) && (
          <div style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--primary)',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.06)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Download size={16} /> Digital Downloads
            </h3>

            {order.payment_status === 'paid' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items.filter(item => item.product?.is_digital).map(item => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.product_name}</div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {item.product?.digital_file_url && (
                        <a
                          href={item.product.digital_file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 14px',
                            background: 'var(--primary)',
                            color: '#fff',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                          className="clickable"
                        >
                          <Download size={13} /> Download File
                        </a>
                      )}

                      {item.product?.digital_link && (
                        <a
                          href={item.product.digital_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 14px',
                            background: 'transparent',
                            color: 'var(--primary)',
                            border: '1.5px solid var(--primary)',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                          className="clickable"
                        >
                          <ExternalLink size={13} /> Access Link
                        </a>
                      )}

                      {!item.product?.digital_file_url && !item.product?.digital_link && (
                        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                          No file or link provided by seller.
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  ✓ Your purchase is complete and verified. Click the buttons above to get your products.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items.filter(item => item.product?.is_digital).map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: '10px', opacity: 0.8 }}>
                    <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{item.product_name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={10} /> Locked
                    </span>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, background: 'rgba(217, 119, 6, 0.05)', border: '1px dashed #d97706', borderRadius: '10px', padding: 12, marginTop: 4 }}>
                  <Lock size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '12px', color: '#b45309', lineHeight: 1.4, margin: 0 }}>
                    <strong>Downloads Locked:</strong> Please pay the seller and click <strong>"Chat with Seller"</strong> below to confirm payment. Once the seller marks this order as paid, your downloads will unlock here instantly.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section — only once delivery/download is confirmed, so feedback reflects real experience */}
        {(isDelivered || (order.reviews && order.reviews.length > 0)) && (
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} style={{ color: 'var(--accent)' }} fill="var(--accent)" /> Reviews & Feedback
            </h3>

            {(order.reviews && order.reviews.length > 0) || localReviewed ? (
              // Summary of Submitted Reviews
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Thank you! Your verified feedback has been recorded:
                </p>
                {/* List submitted reviews */}
                {((order.reviews && order.reviews.length > 0) ? order.reviews : []).map((review: any) => (
                  <div key={review.id} style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '13.5px' }}>
                        {review.product_id ? (order.items.find(i => i.product_id === review.product_id)?.product_name ?? 'Product Review') : 'Overall Store Rating'}
                      </span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={12} 
                            fill={star <= review.rating ? 'var(--primary)' : 'none'} 
                            stroke={star <= review.rating ? 'var(--primary)' : 'var(--text-faint)'} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{ fontSize: '13px', margin: 0, color: 'var(--text)', fontStyle: 'italic' }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                    {review.reply && (
                      <div style={{ marginTop: '4px', paddingLeft: '10px', borderLeft: '2px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>Seller Reply:</span>
                        <p style={{ fontSize: '12.5px', margin: 0, color: 'var(--text-muted)' }}>
                          {review.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Review Submission Form
              <form onSubmit={handleSubmitReviews} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PartyPopper size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Your order was marked {isDigitalOnly ? 'downloaded' : 'delivered'} — share your experience with the seller and other shoppers:
                  </p>
                </div>

                {/* Star rating for products */}
                {order.items.filter(item => item.product_id).map(item => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>
                      Rate product: {item.product_name}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setProductRatings(prev => ({ ...prev, [item.product_id!]: star }))}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                          <Star 
                            size={20} 
                            fill={star <= (productRatings[item.product_id!] ?? 5) ? 'var(--primary)' : 'none'} 
                            stroke={star <= (productRatings[item.product_id!] ?? 5) ? 'var(--primary)' : 'var(--text-faint)'} 
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Write a comment about this product (optional)..."
                      value={productComments[item.product_id!] ?? ''}
                      onChange={e => setProductComments(prev => ({ ...prev, [item.product_id!]: e.target.value }))}
                      className="input-field"
                      style={{ fontSize: '13px', minHeight: '60px', padding: '8px 10px', resize: 'vertical' }}
                    />
                  </div>
                ))}

                {/* Overall Store Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>
                    Overall store experience with {order.store.store_name}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStoreRating(star)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <Star 
                          size={20} 
                          fill={star <= storeRating ? 'var(--primary)' : 'none'} 
                          stroke={star <= storeRating ? 'var(--primary)' : 'var(--text-faint)'} 
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Write a comment about your store experience (optional)..."
                    value={storeComment}
                    onChange={e => setStoreComment(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px', minHeight: '60px', padding: '8px 10px', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReviews}
                  className="btn btn-primary clickable"
                  style={{
                    width: '100%',
                    padding: '12px',
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
                    marginTop: '4px'
                  }}
                >
                  {submittingReviews ? 'Submitting...' : 'Submit Verified Reviews'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Delivery Details Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Delivery Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <User size={13} /> Customer Name
              </span>
              <span style={{ fontWeight: 600 }}>{order.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} /> WhatsApp Number
              </span>
              <span style={{ fontWeight: 600 }}>{order.customer_phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Method</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Package size={14} style={{ color: 'var(--primary)' }} /> {order.delivery_method}
              </span>
            </div>
            {order.delivery_method === 'delivery' && order.delivery_address && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} /> Shipping Address
                </span>
                <span style={{ fontWeight: 500, lineHeight: 1.5, background: 'var(--bg)', padding: '10px 12px', borderRadius: '8px', fontSize: '13.5px' }}>
                  {order.delivery_address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items & Summary Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Order Items
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.quantity} x {currencySymbol}{parseFloat(item.product_price || '0').toLocaleString()}
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>
                  {currencySymbol}{(parseFloat(item.product_price || '0') * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Status</span>
              <span style={{
                fontWeight: 600,
                fontSize: '13px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: order.payment_status === 'paid' ? 'var(--primary-light)' : '#fef3c7',
                color: order.payment_status === 'paid' ? 'var(--primary)' : '#b45309',
                textTransform: 'uppercase'
              }}>
                {order.payment_status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '17px', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <span>Total Paid/Due</span>
              <span style={{ color: 'var(--primary)' }}>
                {currencySymbol}{parseFloat(order.total_amount || '0').toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Bottom Sticky Action Button */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, right: 16, maxWidth: '448px', margin: '0 auto', zIndex: 30 }}>
        <a
          href={whatsappChatUrl}
          target="_blank"
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: '#25D366',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(37, 211, 102, 0.3)',
            textDecoration: 'none'
          }}
          className="clickable"
        >
          <WhatsAppIcon size={20} /> Chat with Seller on WhatsApp
        </a>
      </div>

      <ConfirmDialog
        open={deliveryConfirmationOpen}
        title={isDigitalOnly ? "Confirm download receipt" : "Confirm delivery"}
        description={isDigitalOnly 
          ? "Are you sure you have successfully downloaded or accessed your digital items? This will release funds to the seller and mark the order as completed. This action cannot be undone."
          : "Are you sure you have received your order? This will release funds to the seller and mark the order as completed. This action cannot be undone."}
        confirmLabel="Yes, confirm"
        cancelLabel="Cancel"
        onConfirm={confirmDelivery}
        onCancel={() => setDeliveryConfirmationOpen(false)}
        loading={isConfirmingDelivery}
      />

    </div>
  );
}
