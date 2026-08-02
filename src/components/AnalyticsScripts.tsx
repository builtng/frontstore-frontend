'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { COOKIE_CONSENT_EVENT, getStoredConsent } from '@/lib/cookieConsent';

const GA_MEASUREMENT_ID = 'G-T4VQBGFXJN';

export default function AnalyticsScripts() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) setAnalyticsAllowed(stored.analytics);

    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<{ analytics: boolean }>).detail;
      setAnalyticsAllowed(Boolean(detail?.analytics));
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  if (!analyticsAllowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
