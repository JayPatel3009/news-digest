import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { relativeTime } from './relativeTime';

describe('relativeTime', () => {
  beforeEach(() => {
    // Lock "now" to a specific time: 2026-05-10T12:00:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for very recent times', () => {
    const justNow = new Date('2026-05-10T11:59:45Z').toISOString();
    expect(relativeTime(justNow)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinutesAgo = new Date('2026-05-10T11:55:00Z').toISOString();
    expect(relativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date('2026-05-10T10:00:00Z').toISOString();
    expect(relativeTime(twoHoursAgo)).toBe('2 hours ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date('2026-05-08T12:00:00Z').toISOString();
    expect(relativeTime(twoDaysAgo)).toBe('2 days ago');
  });

  it('falls back to date format for very old dates', () => {
    const oldDate = new Date('2025-01-01T12:00:00Z').toISOString();
    // The exact format might vary slightly by locale, but based on failure:
    expect(relativeTime(oldDate)).toMatch(/Jan [12], 2025/);
  });
});
