import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summarise, GeminiParseError } from './GeminiAdapter';
import type { Article } from '../domain';

// Mock the GoogleGenerativeAI SDK correctly for constructor usage
const _generateContentMock = vi.fn();

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: vi.fn().mockImplementation(() => ({
          generateContent: _generateContentMock,
        })),
      };
    }),
  };
});

describe('GeminiAdapter', () => {
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Article 1',
      description: 'Desc 1',
      url: 'https://example.com/1',
      sourceName: 'Source 1',
      publishedAt: '2026-05-10T10:00:00Z',
      topicId: 'tech',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Set a dummy API key for testing
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
  });

  it('returns digest summary on valid JSON response', async () => {
    const mockJson = {
      executiveSummary: 'This is a summary.',
      items: [
        {
          articleId: '1',
          relevanceScore: 9,
          aiReason: 'Important.',
        },
      ],
    };

    _generateContentMock.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockJson),
      },
    });

    const result = await summarise(mockArticles, ['Technology']);

    expect(result.executiveSummary).toBe('This is a summary.');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].relevanceScore).toBe(9);
  });

  it('handles JSON response wrapped in markdown fences', async () => {
    const mockJson = {
      executiveSummary: 'Fenced summary.',
      items: [],
    };

    _generateContentMock.mockResolvedValue({
      response: {
        text: () => '```json\n' + JSON.stringify(mockJson) + '\n```',
      },
    });

    const result = await summarise(mockArticles, ['Technology']);
    expect(result.executiveSummary).toBe('Fenced summary.');
  });

  it('throws GeminiParseError on malformed JSON', async () => {
    _generateContentMock.mockResolvedValue({
      response: {
        text: () => 'Invalid JSON',
      },
    });

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(GeminiParseError);
  });

  it('throws Error on API failure', async () => {
    _generateContentMock.mockRejectedValue(new Error('Network error'));

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(/Gemini API error/);
  });
});
