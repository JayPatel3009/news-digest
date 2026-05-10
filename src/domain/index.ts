/**
 * Represents a news topic that a user can follow.
 */
export interface Topic {
  /**
   * Unique identifier for the topic.
   */
  id: string;
  /**
   * Display name of the topic.
   */
  label: string;
  /**
   * Search query used to fetch articles from NewsAPI.
   */
  query: string;
  /**
   * Whether the topic is currently selected for the digest.
   */
  isActive: boolean;
}

/**
 * Represents a news article fetched from NewsAPI and normalized.
 */
export interface Article {
  /**
   * Stable hash of the article URL used as a unique identifier.
   */
  id: string;
  /**
   * Headline of the article.
   */
  title: string;
  /**
   * Brief summary or excerpt of the article content.
   */
  description: string | null;
  /**
   * Original canonical URL of the article.
   */
  url: string;
  /**
   * Name of the publishing source (e.g., "BBC News", "TechCrunch").
   */
  sourceName: string;
  /**
   * ISO 8601 timestamp of when the article was published.
   */
  publishedAt: string;
  /**
   * The ID of the Topic this article belongs to.
   */
  topicId: string;
}

/**
 * An article enriched with AI-generated analysis.
 */
export interface DigestItem {
  /**
   * The original article data.
   */
  article: Article;
  /**
   * AI-assigned relevance score ranging from 1 to 10.
   */
  relevanceScore: number;
  /**
   * One-sentence explanation from the AI about why this article is relevant.
   */
  aiReason: string;
}

/**
 * The core state of a news digest generation.
 */
export interface Digest {
  /**
   * Unique identifier for this specific digest instance.
   */
  id: string;
  /**
   * ISO 8601 timestamp of when the digest was created.
   */
  createdAt: string;
  /**
   * List of topic IDs included in this digest.
   */
  topicIds: string[];
  /**
   * AI-generated high-level summary of all articles in the digest.
   */
  executiveSummary: string;
  /**
   * Ranked and analyzed articles included in the digest.
   */
  items: DigestItem[];
  /**
   * Whether this digest was restored from cache (sessionStorage).
   * Used to suppress entrance animations for old content.
   */
  isFromCache?: boolean;
  /**
   * Current lifecycle status of the digest generation.
   */
  status: 'idle' | 'fetching' | 'summarising' | 'ready' | 'error';
}
