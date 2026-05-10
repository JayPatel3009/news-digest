import { describe, it, expect } from 'vitest';
import { hashUrl } from './hashUrl';

describe('hashUrl', () => {
  it('generates a stable hash for the same URL', () => {
    const url = 'https://example.com/article';
    expect(hashUrl(url)).toBe(hashUrl(url));
  });

  it('generates different hashes for different URLs', () => {
    const url1 = 'https://example.com/article1';
    const url2 = 'https://example.com/article2';
    expect(hashUrl(url1)).not.toBe(hashUrl(url2));
  });

  it('generates a short alphanumeric string', () => {
    const url = 'https://example.com/very/long/url/that/should/result/in/a/short/id';
    const hash = hashUrl(url);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).toMatch(/^[a-z0-9]+$/);
  });
});
