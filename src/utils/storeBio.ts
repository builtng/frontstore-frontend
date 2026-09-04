export const STORE_BIO_MAX_LENGTH = 306;

/**
 * Truncates a store description / bio so it never exceeds the maximum allowed length (306 characters).
 * Normalizes excessive consecutive newlines to avoid oversized vertical layout gaps.
 * If truncated, appends an ellipsis ('…') while ensuring total length <= maxLength.
 */
export function truncateStoreBio(
  bio: string | null | undefined,
  maxLength: number = STORE_BIO_MAX_LENGTH
): string {
  if (!bio) return '';
  const cleaned = bio.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.slice(0, maxLength - 1).trimEnd() + '…';
}

/**
 * Strict character slice (for form inputs, save payloads, and state updates).
 */
export function limitStoreBio(
  bio: string | null | undefined,
  maxLength: number = STORE_BIO_MAX_LENGTH
): string {
  if (!bio) return '';
  return bio.slice(0, maxLength);
}
