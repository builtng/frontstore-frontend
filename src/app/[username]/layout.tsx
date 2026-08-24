'use client';

import React, { useEffect } from 'react';
import BuiltWithFrontstoreBadge from '@/components/BuiltWithFrontstoreBadge';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="storefront-root light" style={{ colorScheme: 'light' }}>
      {children}
      <BuiltWithFrontstoreBadge />
    </div>
  );
}

