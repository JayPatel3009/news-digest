import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summarise, GeminiParseError } from './GeminiAdapter';
import type { Article } from '../domain';

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
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns digest summary on valid JSON response', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  executiveSummary: 'This is a summary.',
                  items: [
                    {
                      articleId: '1',
                      relevanceScore: 9,
                      aiReason: 'Important.',
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await summarise(mockArticles, ['Technology']);

    expect(result.executiveSummary).toBe('This is a summary.');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].relevanceScore).toBe(9);
  });

  it('handles JSON response wrapped in markdown fences', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '```json\n' + JSON.stringify({
                  executiveSummary: 'Fenced summary.',
                  items: [],
                }) + '\n```',
              },
            ],
          },
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await summarise(mockArticles, ['Technology']);
    expect(result.executiveSummary).toBe('Fenced summary.');
  });

  it('throws GeminiParseError on malformed JSON', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Invalid JSON',
              },
            ],
          },
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(GeminiParseError);
  });
});
