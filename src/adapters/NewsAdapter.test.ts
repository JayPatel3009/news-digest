import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchArticles, RateLimitError, NoResultsError } from './NewsAdapter';
import type { Topic } from '../domain';

describe('NewsAdapter', () => {
  const mockTopic: Topic = {
    id: 'test',
    label: 'Test Topic',
    query: 'test query',
    isActive: true,
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns articles correctly on 200 response', async () => {
    const mockArticles = [
      {
        url: 'https://example.com/1',
        title: 'Article 1',
        description: 'Desc 1',
        source: { name: 'Source 1' },
        publishedAt: '2026-05-10T10:00:00Z',
      },
      {
        url: 'https://example.com/2',
        title: 'Article 2',
        description: null,
        source: { name: 'Source 2' },
        publishedAt: '2026-05-10T11:00:00Z',
      },
    ];

    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ articles: mockArticles }),
    });

    const result = await fetchArticles(mockTopic);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Article 1');
    expect(result[1].sourceName).toBe('Source 2');
    expect(result[0].id).toBeDefined();
  });

  it('throws RateLimitError on 429 response', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
    });

    await expect(fetchArticles(mockTopic)).rejects.toThrow(RateLimitError);
  });

  it('throws NoResultsError when articles array is empty', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ articles: [] }),
    });

    await expect(fetchArticles(mockTopic)).rejects.toThrow(NoResultsError);
  });
});
