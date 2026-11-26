import { sanitizeUrl } from './sanitizeUrl';

/**
 * One article object from the Currents search API.
 */
export interface CurrentsNewsItem {
  /** Headline returned by Currents */
  title?: string;
  /** Short description, when the provider includes one */
  description?: string | null;
  /** Canonical article URL */
  url?: string;
  /** Publish time, often `YYYY-MM-DD HH:mm:ss +0000` */
  published?: string;
}

/**
 * Article fields the `/api/news` route returns to NewsAdapter.
 */
export interface MappedNewsArticle {
  /** Sanitized http(s) URL */
  url: string;
  /** Headline */
  title: string;
  /** Description, or null when Currents omits it */
  description: string | null;
  /** Source label derived from the article hostname */
  source: {
    /** Display name of the publisher */
    name: string;
  };
  /** ISO 8601 publish time */
  publishedAt: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Converts a Date to RFC 3339 with second precision.
 *
 * Currents rejects bare dates. The documented form is `2026-09-01T00:00:00Z`.
 *
 * @param date - Instant to format.
 * @returns UTC timestamp without milliseconds.
 */
function toRfc3339Seconds(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Converts a Currents `published` timestamp into an ISO 8601 string.
 *
 * Currents uses values such as `2026-03-24 12:05:00 +0000`.
 *
 * @param published - Raw timestamp from Currents.
 * @returns An ISO string, or null when the value cannot be parsed.
 */
export function toIsoPublishedAt(published: string | null | undefined): string | null {
  if (!published || typeof published !== 'string') {
    return null;
  }

  const trimmed = published.trim();
  if (!trimmed) {
    return null;
  }

  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:\s*(Z|([+-])(\d{2}):?(\d{2})))?$/.exec(trimmed);
  if (match) {
    const date = match[1];
    const time = match[2];
    const zone = match[3];
    const sign = match[4];
    const hours = match[5];
    const minutes = match[6];

    if (!zone || zone === 'Z' || (sign === '+' && hours === '00' && minutes === '00')) {
      return `${date}T${time}Z`;
    }

    if (sign && hours && minutes) {
      return `${date}T${time}${sign}${hours}:${minutes}`;
    }
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

/**
 * Builds the Currents free-tier search window: the last 7 days.
 *
 * @param now - Clock time the window ends at.
 * @returns `start_date` and `end_date` in RFC 3339.
 */
export function currentsSearchWindow(now: Date): { startDate: string; endDate: string } {
  const end = new Date(now.getTime());
  const start = new Date(end.getTime() - SEVEN_DAYS_MS);
  return {
    startDate: toRfc3339Seconds(start),
    endDate: toRfc3339Seconds(end),
  };
}

/**
 * Derives a display source name from an article URL hostname.
 *
 * @param url - Absolute http(s) URL.
 * @returns Hostname without a leading `www.`, or "Unknown".
 */
export function sourceNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, '');
    return host || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Maps one Currents article into the payload NewsAdapter already expects.
 * Items without an http(s) URL, a title, or a parseable date are dropped.
 *
 * @param item - Raw Currents news item.
 * @returns The mapped article, or null when required fields are missing.
 */
export function mapCurrentsArticle(item: CurrentsNewsItem): MappedNewsArticle | null {
  const url = sanitizeUrl(item.url);
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const publishedAt = toIsoPublishedAt(item.published);

  if (!url || !title || !publishedAt) {
    return null;
  }

  const description = typeof item.description === 'string' ? item.description.trim() : '';

  return {
    url,
    title,
    description: description || null,
    source: { name: sourceNameFromUrl(url) },
    publishedAt,
  };
}

/**
 * Maps a Currents `news` array to the article list returned by `/api/news`.
 *
 * @param news - Raw items from a Currents search response.
 * @returns Articles safe for NewsAdapter. Invalid items are omitted.
 */
export function mapCurrentsNews(news: CurrentsNewsItem[] | null | undefined): MappedNewsArticle[] {
  if (!news) {
    return [];
  }

  const mapped: MappedNewsArticle[] = [];
  for (const item of news) {
    const article = mapCurrentsArticle(item);
    if (article) {
      mapped.push(article);
    }
  }
  return mapped;
}
