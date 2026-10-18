import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summarise, GeminiParseError } from './GeminiAdapter';
import type { Article } from '../domain/index';

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

  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  it('returns digest summary on valid 200 response', async () => {
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

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockJson,
    });

    const result = await summarise(mockArticles, ['Technology']);

    expect(result.executiveSummary).toBe('This is a summary.');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].relevanceScore).toBe(9);
  });

  it('throws GeminiParseError on malformed JSON response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Unexpected token');
      },
    });

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(GeminiParseError);
  });

  it('throws GeminiParseError when required fields are missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ invalid: 'data' }),
    });

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(GeminiParseError);
  });

  it('throws busy message on 503 or busy status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ message: 'Please try again later' }),
    });

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(/busy/i);
  });

  it('throws Error on generic server error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Server crashed' }),
    });

    await expect(summarise(mockArticles, ['Technology'])).rejects.toThrow(/Gemini API error: Server crashed/);
  });
});
