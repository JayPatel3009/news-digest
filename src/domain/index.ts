/**
 * Represents a news topic the user can subscribe to.
 */
export interface Topic {
  /** Unique identifier for the topic */
  id: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Search query string sent to NewsAPI */
  query: string;
  /** Whether this topic is currently selected by the user */
  isActive: boolean;
}

/**
 * A single news article fetched from NewsAPI.
 */
export interface Article {
  /** Stable hash generated from the article URL */
  id: string;
  /** Headline of the article */
  title: string;
  /** Short description or null if not provided */
  description: string | null;
  /** Full URL to the original article */
  url: string;
  /** Name of the news source */
  sourceName: string;
  /** ISO 8601 publish date string */
  publishedAt: string;
  /** ID of the topic this article was fetched for */
  topicId: string;
}

/**
 * A single article inside a digest, enriched with AI scoring.
 */
export interface DigestItem {
  /** The article this item refers to */
  article: Article;
  /** Relevance score from 1 to 10 assigned by Gemini */
  relevanceScore: number;
  /** One sentence from Gemini explaining why this article matters */
  aiReason: string;
}

/**
 * The status of a digest through its lifecycle.
 */
export type DigestStatus =
  | 'idle'
  | 'fetching'
  | 'summarising'
  | 'ready'
  | 'error';

/**
 * A complete personalised news digest.
 */
export interface Digest {
  /** Unique identifier generated at creation time */
  id: string;
  /** ISO 8601 string of when this digest was created */
  createdAt: string;
  /** IDs of the topics included in this digest */
  topicIds: string[];
  /** Three-sentence executive summary written by Gemini */
  executiveSummary: string;
  /** Ranked list of articles with AI scoring */
  items: DigestItem[];
  /** Current lifecycle status of the digest */
  status: DigestStatus;
  /** Whether this digest was restored from sessionStorage cache */
  isFromCache: boolean;
}