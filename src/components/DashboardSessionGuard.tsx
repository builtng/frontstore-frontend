'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.app/api';

      if (!storedToken || !storedUser || storedUser === 'undefined' || storedUser === 'null') {
        destroySession('Your session has expired. Please log in again.');
        return;
      }

      try {
        const response = await fetch(`${savedApiUrl}/v1/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!active) return;

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
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
      const response = await originalFetch(...args);
      
      const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof URL ? args[0].href : args[0].url);
      const isBackendApi = url.includes('/v1/');

      if (isBackendApi && active) {
        if (response.status === 401 || response.status === 403) {
          destroySession('Your session has expired. Please log in again.');
        } else if (response.status === 404 && url.includes('/v1/auth/me')) {
          destroySession('Your account no longer exists. Please register again.');
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
