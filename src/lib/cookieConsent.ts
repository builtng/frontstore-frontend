const STORAGE_KEY = 'frontstore-cookie-consent';
const CONSENT_VERSION = 1;

export const COOKIE_CONSENT_EVENT = 'frontstore:cookie-consent';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'frontstore:open-cookie-preferences';

export interface CookieConsent {
  essential: true;
  analytics: boolean;
  preferences: boolean;
  updatedAt: string;
}

interface StoredConsent extends CookieConsent {
  version: number;
}

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; preferences: boolean }): CookieConsent {
  const consent: StoredConsent = {
    essential: true,
    analytics: choice.analytics,
    preferences: choice.preferences,
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}
