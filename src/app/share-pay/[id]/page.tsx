'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, ShieldCheck } from 'lucide-react';
import BankTransferPaymentModal from '../../../components/BankTransferPaymentModal';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: string;
  quantity: number;
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
  total_amount: string;
  payment_status: string;
  store: Store;
  items: OrderItem[];
}

export default function SharePayPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  useEffect(() => {
    if (!id) return;
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/v1/public/orders/${id}`);
        if (!res.ok) throw new Error('Order not found.');
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

  const getCurrencySymbol = (code: string) => {
    if (code === 'NGN') return '₦';
    if (code === 'GHS') return 'GH₵';
    if (code === 'KES') return 'KSh';
    if (code === 'ZAR') return 'R';
    if (code === 'USD') return '$';
    if (code === 'GBP') return '£';
    return code + ' ';
  };

  const [bankTransferModalOpen, setBankTransferModalOpen] = useState(false);
  const [bankTransferDetails, setBankTransferDetails] = useState<any>(null);

  const handlePayNow = async () => {
    if (!id || !order) return;
    try {
      setIsInitializingPayment(true);
      const res = await fetch(`${API_URL}/v1/public/orders/${id}/initialize-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      
      if (json?.data?.authorization_url) {
         window.location.href = json.data.authorization_url;
      } else if (json?.status === 'bank_transfer') {
         setBankTransferDetails({
           order_id: order.id,
           order_number: order.order_number,
           bank_name: json.data.bank_name,
           bank_account_number: json.data.bank_account_number,
           bank_account_name: json.data.bank_account_name,
           amount: order.total_amount,
           currency_code: order.store.currency_code
         });
         setBankTransferModalOpen(true);
      } else {
         toast.error(json.message || 'Payment initialization failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during payment initialization.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <Search size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
        <h2>Order Not Found</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { store } = order;
  const currencySymbol = getCurrencySymbol(store.currency_code);
  const formattedTotal = parseFloat(order.total_amount).toLocaleString();
  const productNames = order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ');

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Pay for Order</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            You're completing a payment for <strong>{order.customer_name}</strong> at <strong>{store.store_name}</strong>
          </p>
        </div>

        <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', margin: '0 0 8px', textTransform: 'uppercase' }}>Order Details</h3>
          <p style={{ margin: '0 0 8px', fontSize: 15, color: '#0f172a' }}>{productNames}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>Total Amount</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{currencySymbol}{formattedTotal}</span>
          </div>
        </div>

        {order.payment_status === 'paid' ? (
          <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, padding: 16, background: '#ecfdf5', borderRadius: 12 }}>
            This order has already been paid!
          </div>
        ) : (
          <div>
             <button
              onClick={handlePayNow}
              disabled={isInitializingPayment}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '16px',
                backgroundColor: '#0f172a',
                color: '#fff',
                border: 'none',
                cursor: isInitializingPayment ? 'not-allowed' : 'pointer',
              }}
            >
              {isInitializingPayment ? 'Loading...' : `Pay ${currencySymbol}${formattedTotal} Now`}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, color: '#64748b', fontSize: 12 }}>
              <ShieldCheck size={14} /> Secured by Paystack
            </div>
          </div>
        )}
      </div>
      <BankTransferPaymentModal
        open={bankTransferModalOpen}
        onClose={() => setBankTransferModalOpen(false)}
        details={bankTransferDetails}
        currencySymbol={currencySymbol}
        onPaid={() => {
          // Trigger reload of order details to show paid state
          window.location.reload();
        }}
      />
    </div>
  );
}
