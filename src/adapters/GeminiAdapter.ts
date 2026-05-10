import { Article } from '../domain';

/**
 * Custom error thrown when Gemini returns a malformed response.
 */
export class GeminiParseError extends Error {
  constructor(public rawResponse: string) {
    super('Failed to parse Gemini response as valid JSON.');
    this.name = 'GeminiParseError';
  }
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface DigestSummary {
  executiveSummary: string;
  items: {
    articleId: string;
    relevanceScore: number;
    aiReason: string;
  }[];
}

/**
 * Uses Gemini to summarise and rank a list of articles.
 * 
 * @param articles - The articles to analyze.
 * @param topicLabels - The labels of the active topics.
 * @returns A promise that resolves to the generated digest summary.
 * @throws {GeminiParseError} If the AI response cannot be parsed or is missing fields.
 */
export async function summarise(articles: Article[], topicLabels: string[]): Promise<DigestSummary> {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not defined');
  }

  const systemPrompt = "You are a sharp, concise news editor. You rank articles by importance and explain why each one matters to a general reader. Never sensationalise. Always return valid JSON and nothing else.";
  
  const userPrompt = `Given these ${articles.length} articles across topics: ${topicLabels.join(', ')}, 
return ONLY valid JSON matching exactly this schema:
{
  "executiveSummary": string,
  "items": [{
    "articleId": string,
    "relevanceScore": number,
    "aiReason": string
  }]
}
Articles: ${JSON.stringify(articles)}`;

  const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\n${userPrompt}`
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Gemini API error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new GeminiParseError('Empty response from Gemini');
  }

  // Clean the response: strip markdown code fences if present
  const jsonString = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed.executiveSummary || !Array.isArray(parsed.items)) {
      throw new GeminiParseError(rawText);
    }

    return parsed as DigestSummary;
  } catch (error) {
    if (error instanceof GeminiParseError) throw error;
    throw new GeminiParseError(rawText);
  }
}
