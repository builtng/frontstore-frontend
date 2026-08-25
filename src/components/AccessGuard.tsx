'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Access control bypass rules:
    // 1. Never block the /access-refused page itself (otherwise redirect loop)
    // 2. Never block admin routes (so settings can always be restored)
    if (pathname.startsWith('/admin') || pathname === '/access-refused') {
      return;
    }

    const checkAccess = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${apiUrl}/v1/public/settings`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.data?.is_restricted) {
            router.push('/access-refused');
            return;
          }
        }
      } catch {
        // Fallback gracefully on local dev or temporary network blips without blocking UI
      }
    };

    checkAccess();
  }, [pathname, router]);

  return <>{children}</>;
}

