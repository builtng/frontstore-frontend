'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function DashboardSessionGuard({ children }: { children: React.ReactNode }) {
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let isDestroying = false;

    const destroySession = (message: string) => {
      if (isDestroying) return;
      isDestroying = true;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('store');
      
      toast.error(message);
      router.replace('/login');
      
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
          window.location.replace('/login');
        }
      }, 1000);
    };

    const verifyAccount = async () => {
      // Auth is the httpOnly fs_auth_token cookie now, not localStorage —
      // storedUser is just a display-cache presence check before we ask the
      // server (via that cookie, sent automatically with credentials: 'include')
      // whether the session is actually still valid.
      const storedUser = localStorage.getItem('user');
      const savedApiUrl = getApiUrl();

      if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
        destroySession('Your session has expired. Please log in again.');
        return;
      }

      const storedToken = localStorage.getItem('token');
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (storedToken) {
        authHeaders['Authorization'] = `Bearer ${storedToken}`;
      }

      try {
        const response = await fetch(`${savedApiUrl}/v1/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: authHeaders,
        });

        if (!active) return;

        if (!response.ok) {
          if (response.status === 401) {
            destroySession('Your session has expired or is invalid. Please log in again.');
            return;
          } else if (response.status === 404) {
            destroySession('Your account no longer exists. Please register again.');
            return;
          } else {
            // Server error or other status code (e.g. 500) — do not destroy session
            setIsVerifying(false);
          }
        } else {
          const data = await response.json();
          if (!data.data || !data.data.user) {
            destroySession('Account details could not be retrieved. Please log in again.');
            return;
          }
          setIsVerifying(false);
        }
      } catch (error) {
        console.error('Network error during initial account verification:', error);
        // Do not destroy session on offline/network errors
        setIsVerifying(false);
      }
    };

    verifyAccount();

    // Intercept client-side fetch calls to catch session invalidation or deletion in real time
    const originalFetch = window.fetch;
    const interceptedFetch = async (...args: Parameters<typeof originalFetch>) => {
      let [resource, config] = args;
      const url = typeof resource === 'string' ? resource : (resource instanceof URL ? resource.href : resource.url);
      const isBackendApi = url.includes('/v1/');
      const storedToken = localStorage.getItem('token');

      if (isBackendApi && storedToken) {
        config = config || {};
        const headers = new Headers(config.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${storedToken}`);
        }
        config.headers = headers;
        args[1] = config;
      }

      const response = await originalFetch(resource, config);

      if (isBackendApi && active) {
        if (response.status === 401) {
          destroySession('Your session has expired. Please log in again.');
        } else if (response.status === 404 && url.includes('/v1/auth/me')) {
          destroySession('Your account no longer exists. Please register again.');
        } else if (response.status === 404) {
          // Every merchant-scoped endpoint resolves the caller's store via
          // Store::where('user_id', ...)->firstOrFail(), so a 404 carrying this
          // message means the store was deleted mid-session — auth/me won't be
          // re-checked on its own since it only runs once per dashboard mount.
          try {
            const body = await response.clone().json();
            // Match the exact Store model only — StoreFaq, StorefrontCoupon, etc.
            // also contain "Store" and 404 on ordinary, unrelated missing resources.
            if (typeof body?.message === 'string' && body.message.includes('No query results for model [App\\Models\\Store]')) {
              destroySession('Your store no longer exists. Please register again.');
            }
          } catch {
            // Non-JSON 404 body — not a store-lookup failure, ignore.
          }
        }
      }
      return response;
    };

    window.fetch = interceptedFetch;

    return () => {
      active = false;
      window.fetch = originalFetch;
    };
  }, [router]);

  if (isVerifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 20, fontFamily: 'var(--font-heading)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: 70,
            height: 70,
            borderRadius: '50%',
            border: '2px solid var(--primary)',
            opacity: 0,
            animation: 'pulse-ring-dash 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
          }} />
          <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)', animation: 'spin-loader-dash 1s linear infinite' }} />
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Verifying account...</span>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse-ring-dash {
              0% { transform: scale(0.33); opacity: 0; }
              80%, 100% { opacity: 0; }
              33% { opacity: 0.3; }
              70% { transform: scale(1.1); opacity: 0; }
            }
            @keyframes spin-loader-dash {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }

  return <>{children}</>;
}
