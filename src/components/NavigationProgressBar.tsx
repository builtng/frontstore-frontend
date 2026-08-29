'use client';

import React, { useEffect, useState, useRef, useTransition, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgressBar provides an instant visual loading bar at the top of the viewport
 * whenever a user clicks any link or navigation happens across the entire app.
 */
export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  const startProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    isNavigatingRef.current = true;
    setIsVisible(true);
    setProgress(15);

    // Increment progress in natural easing steps
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        const diff = (90 - prev) * 0.18;
        return Math.min(prev + Math.max(diff, 2), 88);
      });
    }, 120);
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isNavigatingRef.current && progress === 0) return;

    setProgress(100);
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
      isNavigatingRef.current = false;
    }, 280);

    return () => clearTimeout(finishTimer);
  }, [progress]);

  // Complete progress on route change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams, completeProgress]);

  // Intercept internal link clicks to give instant zero-latency feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't intercept if modifier keys are pressed or non-left clicks
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
        return;
      }

      const target = (e.target as Element)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external, anchor links, mailto, tel, downloads, or target="_blank"
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        target.hasAttribute('download')
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Same origin navigation
        if (url.origin === currentUrl.origin) {
          const isSamePage = url.pathname === currentUrl.pathname && url.search === currentUrl.search;
          if (!isSamePage || href.includes('?')) {
            startProgress();
          }
        }
      } catch {
        // invalid URL ignore
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startProgress]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 999999,
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    >
      {/* Glow progress bar */}
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #074328 0%, #0B5D39 70%, #0F7649 100%)',
          boxShadow: '0 0 10px rgba(11, 93, 57, 0.7), 0 0 4px rgba(7, 67, 40, 0.8)',
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.3s cubic-bezier(0.1, 0.8, 0.3, 1)',
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Top-Right Spinner Pulse */}
      {isVisible && progress < 100 && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 12,
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid rgba(18, 140, 126, 0.3)',
            borderTopColor: '#25D366',
            animation: 'fs-nav-spin 0.6s linear infinite',
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fs-nav-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
