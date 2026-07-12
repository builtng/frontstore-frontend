const STORAGE_KEY = 'frontstore_affiliate_ref';

/** Reads ?ref= from the current URL and persists it so it survives navigation within the storefront. */
export function captureAffiliateRef(): void {
  if (typeof window === 'undefined') return;

  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) {
    localStorage.setItem(STORAGE_KEY, ref);
  }
}

export function getPersistedAffiliateRef(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(STORAGE_KEY) || undefined;
}
