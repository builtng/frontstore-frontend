import React from 'react';
import BuiltWithFrontstoreBadge from '@/components/BuiltWithFrontstoreBadge';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BuiltWithFrontstoreBadge />
    </>
  );
}
