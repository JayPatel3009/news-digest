import type { Article } from '../domain/index';

/**
 * Custom error thrown when Gemini returns a malformed response.
 */
export class GeminiParseError extends Error {
  public rawResponse?: string;
  constructor(message = 'Failed to parse Gemini response as valid JSON.', rawResponse?: string) {
    super(message);
    this.name = 'GeminiParseError';
    this.rawResponse = rawResponse;
  }
}

export interface DigestSummaryItem {
  articleId: string;
  relevanceScore: number;
  aiReason: string;
}

export interface DigestSummary {
  executiveSummary: string;
  items: DigestSummaryItem[];
}

export type DeepDiveQuestionType = 'eli5' | 'counter' | 'impact';

/**
 * Uses the secure server-side API endpoint to summarise and rank articles with Gemini.
 * 
 * @param articles - The articles to analyze.
 * @param topicLabels - The labels of the active topics.
 * @returns A promise that resolves to the generated digest summary.
 * @throws {GeminiParseError} If the AI response cannot be parsed or is missing fields.
 * @throws {Error} If the server API returns an error status.
 */
export async function summarise(articles: Article[], topicLabels: string[]): Promise<DigestSummary> {
  const response = await fetch('/api/summarise', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ articles, topicLabels }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string; rawResponse?: string };
    
    if (response.status === 422 || errorData.rawResponse) {
      throw new GeminiParseError(errorData.message || 'Malformed AI response', errorData.rawResponse);
    }
    
    const message = errorData.message || response.statusText;
    if (message.includes('busy') || message.includes('try again') || response.status === 503) {
      throw new Error('Gemini is currently busy. Please try again in a few seconds.');
    }

    throw new Error(`Gemini API error: ${message}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new GeminiParseError('Failed to parse API response as JSON');
  }

  if (
    !data ||
    typeof data !== 'object' ||
    !('executiveSummary' in data) ||
    typeof (data as { executiveSummary: unknown }).executiveSummary !== 'string' ||
    !('items' in data) ||
    !Array.isArray((data as { items: unknown }).items)
  ) {
    throw new GeminiParseError('Response missing required fields');
  }

  return data as DigestSummary;
}

/**
 * Requests an on-demand AI deep dive on a specific article.
 * 
 * @param article - The article to analyze.
 * @param questionType - The perspective requested ('eli5', 'counter', or 'impact').
 * @returns A promise resolving to the AI generated explanation string.
 * @throws {Error} If the server request fails.
 */
export async function askDeepDive(
  article: Article,
  questionType: DeepDiveQuestionType
): Promise<string> {
  const response = await fetch('/api/deep-dive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article: {
        title: article.title,
        description: article.description,
        sourceName: article.sourceName,
      },
      questionType,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(`Failed to generate deep dive: ${errorData.message || response.statusText}`);
  }

  const data = (await response.json()) as { answer?: string };
  return data.answer || 'No explanation generated.';
}
