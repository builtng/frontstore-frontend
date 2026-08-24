'use client';

import React from 'react';

interface BuiltWithFrontstoreBadgeProps {
  /** Target link URL, defaults to https://frontstore.ng */
  href?: string;
  /** Hide badge if store opts out (reserved for future setting) */
  hide?: boolean;
}

export default function BuiltWithFrontstoreBadge({
  href = 'https://frontstore.ng',
  hide = false,
}: BuiltWithFrontstoreBadgeProps) {
  if (hide) return null;

  return (
    <>
      <style>{`
        .built-with-frontstore-badge {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: auto;
          z-index: 30;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 15px;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 9999px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          text-decoration: none;
          line-height: 1.2;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease, color 0.2s ease;
          user-select: none;
          -webkit-user-select: none;
        }

        .built-with-frontstore-badge:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.06);
          border-color: rgba(0, 0, 0, 0.18);
          color: #111827;
        }

        .built-with-frontstore-badge:active {
          transform: translateY(0) scale(0.98);
        }

        .built-with-frontstore-badge-brand {
          font-weight: 700;
          color: #111827;
        }

        /* Responsive positioning on mobile view */
        @media (max-width: 768px) {
          .built-with-frontstore-badge {
            bottom: 16px;
            left: 16px;
            right: auto;
            padding: 6px 13px;
            font-size: 12px;
          }

          /* If sticky mobile navigation bottom bar is present */
          body:has(.ps-bottom) .built-with-frontstore-badge {
            bottom: calc(68px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="built-with-frontstore-badge"
        title="Create your own free store on Frontstore.ng"
        aria-label="Built with Frontstore — Click to visit frontstore.ng"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#4b5563', flexShrink: 0 }}
        >
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
          <path d="M4 12A2 2 0 0 1 6 10h12a2 2 0 0 1 2 2" />
        </svg>
        <span>
          Built with <span className="built-with-frontstore-badge-brand">Frontstore</span>
        </span>
      </a>
    </>
  );
}
