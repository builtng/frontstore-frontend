import React from 'react';
import type { Metadata } from 'next';
import CartAbandonmentClient from './CartAbandonmentClient';

export const metadata: Metadata = {
  title: 'Free Cart Abandonment & Revenue Recovery Calculator – Frontstore',
  description: 'Calculate how much money your store loses to checkout drop-offs every month. Unlock automated WhatsApp & email recovery strategies.',
  alternates: { canonical: 'https://frontstore.ng/tools/cart-abandonment-calculator' },
};

export default function CartAbandonmentCalculatorPage() {
  return <CartAbandonmentClient />;
}
