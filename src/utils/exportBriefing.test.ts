import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatBriefingMarkdown, copyBriefingToClipboard, shareBriefing } from './exportBriefing';
import type { Digest } from '../domain/index';

describe('exportBriefing', () => {
  const mockDigest: Digest = {
    id: 'test-digest',
    createdAt: '2026-10-19T00:00:00Z',
    topicIds: ['tech'],
    executiveSummary: 'Major AI advancements were revealed today.',
    items: [
      {
        article: {
          id: 'art-1',
          title: 'Quantum computing milestone',
          description: 'A new processor reached record coherence.',
          url: 'https://example.com/quantum',
          sourceName: 'TechDaily',
          publishedAt: '2026-10-19T00:00:00Z',
          topicId: 'tech',
        },
        relevanceScore: 94,
        aiReason: 'Crucial leap forward for encryption and computation.',
      },
    ],
    status: 'ready',
    isFromCache: false,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats digest into Markdown correctly', () => {
    const md = formatBriefingMarkdown(mockDigest, 'Monday, 19 October 2026');

    expect(md).toContain('# THE DAILY DIGEST — MONDAY, 19 OCTOBER 2026');
    expect(md).toContain('## Executive Summary');
    expect(md).toContain('Major AI advancements were revealed today.');
    expect(md).toContain('[Quantum computing milestone](https://example.com/quantum)');
    expect(md).toContain('**Source:** TechDaily | **Score:** 94%');
    expect(md).toContain('*AI Insight:* Crucial leap forward for encryption');
  });

  it('copies briefing text to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const success = await copyBriefingToClipboard(mockDigest, 'Monday, 19 October 2026');

    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain('Quantum computing milestone');
  });

  it('shares briefing using navigator.share if available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: shareMock,
    });

    const success = await shareBriefing(mockDigest, 'Monday, 19 October 2026');

    expect(success).toBe(true);
    expect(shareMock).toHaveBeenCalledTimes(1);
  });
});
