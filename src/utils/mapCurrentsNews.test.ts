import { describe, it, expect } from 'vitest';
import {
  currentsSearchWindow,
  mapCurrentsArticle,
  mapCurrentsNews,
  sourceNameFromUrl,
  toIsoPublishedAt,
} from './mapCurrentsNews';

describe('toIsoPublishedAt', () => {
  it('normalizes the Currents published format to UTC ISO', () => {
    expect(toIsoPublishedAt('2026-03-24 12:05:00 +0000')).toBe('2026-03-24T12:05:00Z');
  });

  it('keeps a non-zero offset', () => {
    expect(toIsoPublishedAt('2026-03-24 12:05:00 +0530')).toBe('2026-03-24T12:05:00+05:30');
    expect(toIsoPublishedAt('2026-03-24T12:05:00-04:00')).toBe('2026-03-24T12:05:00-04:00');
  });

  it('accepts an existing Zulu timestamp', () => {
    expect(toIsoPublishedAt('2026-03-24T12:05:00.000Z')).toBe('2026-03-24T12:05:00Z');
  });

  it('returns null for empty or unparseable values', () => {
    expect(toIsoPublishedAt('')).toBeNull();
    expect(toIsoPublishedAt('   ')).toBeNull();
    expect(toIsoPublishedAt(null)).toBeNull();
    expect(toIsoPublishedAt('not-a-date')).toBeNull();
  });
});

describe('currentsSearchWindow', () => {
  it('covers the seven days ending at the given instant', () => {
    const now = new Date('2026-11-26T01:22:33.456Z');
    expect(currentsSearchWindow(now)).toEqual({
      startDate: '2026-11-19T01:22:33Z',
      endDate: '2026-11-26T01:22:33Z',
    });
  });
});

describe('sourceNameFromUrl', () => {
  it('strips a leading www', () => {
    expect(sourceNameFromUrl('https://www.bbc.co.uk/news/story')).toBe('bbc.co.uk');
  });
});

describe('mapCurrentsNews', () => {
  it('maps a Currents item onto the NewsAdapter article shape', () => {
    const articles = mapCurrentsNews([
      {
        title: '  AI chip demand lifts guidance  ',
        description: ' Vendors reported stronger demand. ',
        url: 'https://www.example.com/markets/ai-chip-demand',
        published: '2026-03-24 12:05:00 +0000',
      },
    ]);

    expect(articles).toEqual([
      {
        url: 'https://www.example.com/markets/ai-chip-demand',
        title: 'AI chip demand lifts guidance',
        description: 'Vendors reported stronger demand.',
        source: { name: 'example.com' },
        publishedAt: '2026-03-24T12:05:00Z',
      },
    ]);
  });

  it('drops items that are missing a safe URL, title, or date', () => {
    const articles = mapCurrentsNews([
      { title: 'No url', published: '2026-03-24 12:05:00 +0000' },
      { title: 'Bad url', url: 'javascript:alert(1)', published: '2026-03-24 12:05:00 +0000' },
      { url: 'https://example.com/a', published: '2026-03-24 12:05:00 +0000' },
      { title: 'No date', url: 'https://example.com/b' },
      {
        title: 'Kept',
        url: 'https://example.com/kept',
        description: '',
        published: '2026-03-24T08:00:00Z',
      },
    ]);

    expect(articles).toHaveLength(1);
    expect(articles[0]?.title).toBe('Kept');
    expect(articles[0]?.description).toBeNull();
  });

  it('returns an empty list when news is missing', () => {
    expect(mapCurrentsNews(null)).toEqual([]);
    expect(mapCurrentsNews(undefined)).toEqual([]);
  });
});

describe('mapCurrentsArticle', () => {
  it('returns null for an unsafe url', () => {
    expect(mapCurrentsArticle({
      title: 'Blocked',
      url: 'data:text/html,hi',
      published: '2026-03-24 12:05:00 +0000',
    })).toBeNull();
  });
});
