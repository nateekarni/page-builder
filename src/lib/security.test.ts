/**
 * Security Utility Tests — CSRF, sanitization, rate limiting.
 */

import { describe, it, expect } from 'vitest';
import { validateCSRF, sanitizeTextContent, sanitizeSlug } from './security';

describe('sanitizeTextContent', () => {
  it('removes script tags', () => {
    const result = sanitizeTextContent('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).toContain('<p>Hello</p>');
  });

  it('removes iframe tags', () => {
    const result = sanitizeTextContent('<iframe src="evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
  });

  it('removes inline event handlers', () => {
    const result = sanitizeTextContent('<img src="x" onerror="alert(1)" />');
    expect(result).not.toContain('onerror');
  });

  it('preserves safe HTML', () => {
    const result = sanitizeTextContent('<p>Hello <strong>World</strong></p>');
    expect(result).toBe('<p>Hello <strong>World</strong></p>');
  });
});

describe('sanitizeSlug', () => {
  it('converts to lowercase', () => {
    expect(sanitizeSlug('Hello-World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizeSlug('hello world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(sanitizeSlug('hello@world!')).toBe('helloworld');
  });

  it('collapses multiple hyphens', () => {
    expect(sanitizeSlug('hello---world')).toBe('hello-world');
  });

  it('trims leading/trailing hyphens', () => {
    expect(sanitizeSlug('-hello-world-')).toBe('hello-world');
  });

  it('allows Thai characters', () => {
    const result = sanitizeSlug('สวัสดี');
    expect(result).toBe('สวัสดี');
  });
});

describe('validateCSRF', () => {
  const siteUrl = 'https://example.com';

  it('allows GET requests', () => {
    const request = new Request('https://example.com/api/test', { method: 'GET' });
    expect(validateCSRF(request, siteUrl)).toBe(true);
  });

  it('allows POST with matching origin', () => {
    const request = new Request('https://example.com/api/test', {
      method: 'POST',
      headers: { origin: 'https://example.com' },
    });
    expect(validateCSRF(request, siteUrl)).toBe(true);
  });

  it('blocks POST with different origin', () => {
    const request = new Request('https://example.com/api/test', {
      method: 'POST',
      headers: { origin: 'https://evil.com' },
    });
    expect(validateCSRF(request, siteUrl)).toBe(false);
  });
});
