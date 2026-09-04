export const STORE_BIO_MAX_LENGTH = 306;

/**
 * Thoroughly cleans up irrelevant whitespace:
 * - Normalizes Windows (\r\n) and legacy Mac (\r) linebreaks to standard (\n).
 * - Collapses multiple spaces and tabs within lines to a single space.
 * - Trims leading and trailing spaces on every line.
 * - Collapses consecutive empty lines (including lines with only whitespace)
 *   to at most one empty line separator (\n\n).
 * - Trims overall leading and trailing whitespace.
 */
export function cleanStoreBio(bio: string | null | undefined): string {
  if (!bio) return '';
  return bio
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[^\S\n]+/g, ' ').trim())
    .reduce<string[]>((acc, line) => {
      if (!line) {
        // Only allow one empty line separator between non-empty paragraphs
        if (acc.length > 0 && acc[acc.length - 1] !== '') {
          acc.push('');
        }
      } else {
        acc.push(line);
      }
      return acc;
    }, [])
    .join('\n')
    .trim();
}

/**
 * Truncates a store description / bio so it never exceeds the maximum allowed length (306 characters),
 * after thoroughly cleaning up all irrelevant spaces and redundant empty lines.
 * If truncated, appends an ellipsis ('…') while strictly ensuring total length <= maxLength.
 */
export function truncateStoreBio(
  bio: string | null | undefined,
  maxLength: number = STORE_BIO_MAX_LENGTH
): string {
  const cleaned = cleanStoreBio(bio);
  if (!cleaned) return '';
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.slice(0, maxLength - 1).trimEnd() + '…';
}

/**
 * Strict character slice with whitespace cleanup (for form inputs, save payloads, and state updates).
 */
export function limitStoreBio(
  bio: string | null | undefined,
  maxLength: number = STORE_BIO_MAX_LENGTH
): string {
  const cleaned = cleanStoreBio(bio);
  return cleaned.slice(0, maxLength);
}
