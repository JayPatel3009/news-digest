import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from './sanitizeUrl';

describe('sanitizeUrl', () => {
  it('allows valid https and http URLs', () => {
    expect(sanitizeUrl('https://example.com/article')).toBe('https://example.com/article');
    expect(sanitizeUrl('http://news.bbc.co.uk/test?a=1&b=2')).toBe('http://news.bbc.co.uk/test?a=1&b=2');
  });

  it('rejects dangerous protocols like javascript: and data:', () => {
    expect(sanitizeUrl('javascript:alert("XSS")')).toBeNull();
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeNull();
    expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
  });

  it('rejects relative, malformed, or empty inputs', () => {
    expect(sanitizeUrl('')).toBeNull();
    expect(sanitizeUrl('   ')).toBeNull();
    expect(sanitizeUrl('/relative/path')).toBeNull();
    expect(sanitizeUrl('not a url')).toBeNull();
    expect(sanitizeUrl(null)).toBeNull();
    expect(sanitizeUrl(undefined)).toBeNull();
  });
});
