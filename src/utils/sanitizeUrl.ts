/**
 * Validates and sanitizes an external URL to prevent XSS vulnerabilities
 * (such as javascript: or data: URIs).
 * 
 * Only URLs with http: or https: protocols are permitted.
 * 
 * @param url - The candidate URL string to sanitize.
 * @returns The sanitized URL if safe, or null if the URL is invalid or unsafe.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
