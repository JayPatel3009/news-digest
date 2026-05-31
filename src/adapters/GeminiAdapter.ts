import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Article } from '../domain';

/**
 * Custom error thrown when Gemini returns a malformed response.
 */
export class GeminiParseError extends Error {
  public rawResponse: string;
  constructor(rawResponse: string) {
    super('Failed to parse Gemini response as valid JSON.');
    this.rawResponse = rawResponse;
  }
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

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
Articles: ${JSON.stringify(articles.map(a => ({ id: a.id, title: a.title, description: a.description, source: a.sourceName })))}`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = await result.response;
    const rawText = response.text();

    if (!rawText) {
      throw new GeminiParseError('Empty response from Gemini');
    }

    // Clean the response: strip markdown code fences if present
    const jsonString = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new GeminiParseError(rawText);
    }

    if (!parsed.executiveSummary || !Array.isArray(parsed.items)) {
      throw new GeminiParseError(rawText);
    }

    return parsed as DigestSummary;
  } catch (error: any) {
    if (error instanceof GeminiParseError) throw error;
    
    // Check if it's a SDK specific error
    const message = error?.message || 'Unknown Gemini error';
    if (message.includes('Please try again')) {
      throw new Error('Gemini is currently busy. Please try again in a few seconds.');
    }
    
    throw new Error(`Gemini API error: ${message}`);
  }
}
