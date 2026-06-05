'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Package, AlertCircle, Check, Download, ExternalLink, Lock, Star } from 'lucide-react';
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

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

    if (ref) {
      const verifyPaymentReference = async () => {
        try {
          setVerifyingPayment(true);
          setPaymentError(null);
          const res = await fetch(`${API_URL}/v1/public/orders/${id}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: ref })
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

  // Progress indexes: Placed=1, Confirmed=2, Completed=3
  let activeStepIndex = 1;
  if (isConfirmed) activeStepIndex = 2;
  if (isCompleted) activeStepIndex = 3;

  // Build WhatsApp text for customer checking in
  const checkinMsg = `Hello *${store.store_name}*! I'm checking in on my order *#${order.order_number}* placed on ${new Date(order.created_at).toLocaleDateString()}. Let me know if there's any update!`;
  const whatsappChatUrl = `https://wa.me/${store.whatsapp_phone}?text=${encodeURIComponent(checkinMsg)}`;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>

      {/* Navbar Header */}
      <header style={{ padding: '20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
            Track Order
          </span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          {store.store_name}
        </span>
      </header>

      <main style={{ padding: '24px 16px 100px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Order Identifier Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
            Order #{order.order_number}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
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
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text)' }}>
              💳 Pay Online Securely
            </h3>
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
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '16px' }}>🛡️</span>
              <span>
                <strong>Escrow Protection Active:</strong> For Free Plan stores, your payment is held securely in escrow until you confirm delivery below.
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
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1.5px solid var(--primary)',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.04)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📦 {isDigitalOnly ? 'Confirm Download' : 'Confirm Delivery Receipt'}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {isDigitalOnly 
                ? 'Since you have downloaded or accessed your digital items, click below to confirm receipt and release funds to the seller.'
                : 'Once you have received your order items or the services have been rendered, click below to confirm receipt and release funds to the seller.'}
            </p>
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

        {/* Visual Progress Timeline */}
        {isCancelled ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '16px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> This order has been cancelled by the seller.
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-sm)' }}>

            {/* Timeline Item 1: Placed */}
            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                {/* Connecting Line */}
                <div style={{
                  width: '3px',
                  backgroundColor: activeStepIndex >= 2 ? 'var(--primary)' : 'var(--border)',
                  position: 'absolute',
                  top: 28,
                  bottom: -20,
                  zIndex: 1
                }}></div>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Order Placed</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>We have received your order details.</p>
              </div>
            </div>

            {/* Timeline Item 2: Confirmed */}
            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: activeStepIndex >= 2 ? 'var(--primary)' : 'var(--bg)',
                  border: activeStepIndex >= 2 ? 'none' : '2px solid var(--border)',
                  color: activeStepIndex >= 2 ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  zIndex: 2
                }}>
                  {activeStepIndex >= 2 ? <Check size={14} strokeWidth={3} /> : '2'}
                </div>
                {/* Connecting Line */}
                <div style={{
                  width: '3px',
                  backgroundColor: activeStepIndex >= 3 ? 'var(--primary)' : 'var(--border)',
                  position: 'absolute',
                  top: 28,
                  bottom: -20,
                  zIndex: 1
                }}></div>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: activeStepIndex >= 2 ? 'var(--text)' : 'var(--text-muted)' }}>Confirmed</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Merchant is preparing your items.</p>
              </div>
            </div>

            {/* Timeline Item 3: Completed */}
            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: activeStepIndex >= 3 ? 'var(--primary)' : 'var(--bg)',
                  border: activeStepIndex >= 3 ? 'none' : '2px solid var(--border)',
                  color: activeStepIndex >= 3 ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  zIndex: 2
                }}>
                  {activeStepIndex >= 3 ? <Check size={14} strokeWidth={3} /> : '3'}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: activeStepIndex >= 3 ? 'var(--text)' : 'var(--text-muted)' }}>{isDigitalOnly ? 'Access Provided' : 'Ready / Handed Over'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{isDigitalOnly ? 'Digital downloads unlocked and ready.' : 'Order completed and shipped or picked up.'}</p>
              </div>
            </div>

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

        {/* Reviews Section */}
        {order.payment_status === 'paid' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⭐ Reviews & Feedback
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
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Share your experience with the seller and other shoppers:
                </p>

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
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Delivery Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Customer Name</span>
              <span style={{ fontWeight: 600 }}>{order.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>WhatsApp Number</span>
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
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Shipping Address</span>
                <span style={{ fontWeight: 500, lineHeight: 1.5, background: 'var(--bg)', padding: '10px 12px', borderRadius: '8px', fontSize: '13.5px' }}>
                  {order.delivery_address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items & Summary Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: 'var(--shadow-sm)' }}>
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
