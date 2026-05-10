import { Article, Topic } from '../domain';
import { hashUrl } from '../utils/hashUrl';

/**
 * Custom error thrown when NewsAPI returns a 429 Rate Limit.
 */
export class RateLimitError extends Error {
  constructor() {
    super('NewsAPI rate limit exceeded. Please try again later.');
    this.name = 'RateLimitError';
  }
}

/**
 * Custom error thrown when no articles are found for a topic.
 */
export class NoResultsError extends Error {
  constructor(topicLabel: string) {
    super(`No articles found for topic: ${topicLabel}`);
    this.name = 'NoResultsError';
  }
}

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

/**
 * Fetches articles from NewsAPI for a given topic.
 * 
 * @param topic - The topic to fetch articles for.
 * @returns A promise that resolves to an array of Article objects.
 * @throws {RateLimitError} If the API rate limit is hit.
 * @throws {NoResultsError} If no articles match the query.
 * @throws {Error} For other network or API errors.
 */
export async function fetchArticles(topic: Topic): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    throw new Error('VITE_NEWS_API_KEY is not defined');
  }

  const url = `${BASE_URL}?q=${encodeURIComponent(topic.query)}&pageSize=5&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;

  const response = await fetch(url);

  if (response.status === 429) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`NewsAPI error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();

  if (!data.articles || data.articles.length === 0) {
    throw new NoResultsError(topic.label);
  }

  return data.articles.map((apiArticle: any): Article => ({
    id: hashUrl(apiArticle.url),
    title: apiArticle.title,
    description: apiArticle.description || null,
    url: apiArticle.url,
    sourceName: apiArticle.source.name,
    publishedAt: apiArticle.publishedAt,
    topicId: topic.id,
  }));
}
