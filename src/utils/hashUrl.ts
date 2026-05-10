/**
 * Generates a stable, short hash from a URL string.
 * This is used to create unique, deterministic IDs for articles.
 * 
 * @param url - The URL to hash.
 * @returns A stable string representation of the URL hash.
 */
export function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
