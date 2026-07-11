'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Access control bypass rules:
    // 1. Never block the /access-refused page itself (otherwise redirect loop)
    // 2. Never block admin routes (so settings can always be restored)
    if (pathname.startsWith('/admin') || pathname === '/access-refused') {
      setChecking(false);
      return;
    }

    const checkAccess = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const res = await fetch(`${apiUrl}/v1/public/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.is_restricted) {
            router.push('/access-refused');
            return;
          }
        }
      } catch (error) {
        console.error('Access control check failed:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [pathname, router]);

  // While looking up and verifying the location, show a clean, native loading screen
  // to prevent standard page flashes for blocked users.
  if (checking && !pathname.startsWith('/admin') && pathname !== '/access-refused') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
