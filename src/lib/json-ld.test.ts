/**
 * JSON-LD Schema Builder Tests
 */

import { describe, it, expect } from 'vitest';
import {
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildWebSiteSchema,
} from './json-ld';

describe('buildOrganizationSchema', () => {
  it('generates valid Organization schema', () => {
    const schema = buildOrganizationSchema({
      name: 'Aglow',
      url: 'https://aglow.co',
      logo: 'https://aglow.co/logo.png',
    });
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Aglow');
    expect(schema.logo).toBe('https://aglow.co/logo.png');
  });

  it('includes social links when provided', () => {
    const schema = buildOrganizationSchema({
      name: 'Aglow',
      url: 'https://aglow.co',
      socialLinks: ['https://facebook.com/aglow'],
    });
    expect(schema.sameAs).toEqual(['https://facebook.com/aglow']);
  });
});

describe('buildLocalBusinessSchema', () => {
  it('generates valid LocalBusiness schema', () => {
    const schema = buildLocalBusinessSchema({
      name: 'Aglow Studio',
      url: 'https://aglow.co',
      phone: '+66-2-123-4567',
      address: { locality: 'Bangkok', country: 'TH' },
    });
    expect(schema['@type']).toBe('LocalBusiness');
    expect(schema.telephone).toBe('+66-2-123-4567');
    expect((schema.address as Record<string, unknown>).addressLocality).toBe('Bangkok');
  });
});

describe('buildArticleSchema', () => {
  it('generates valid Article schema', () => {
    const schema = buildArticleSchema({
      title: 'My Article',
      url: 'https://aglow.co/blog/my-article',
      publisherName: 'Aglow',
      datePublished: '2026-03-01',
    });
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('My Article');
    expect(schema.datePublished).toBe('2026-03-01');
  });
});

describe('buildBreadcrumbSchema', () => {
  it('generates valid BreadcrumbList', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://aglow.co/' },
      { name: 'About', url: 'https://aglow.co/about' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schema.itemListElement as { position: number; name: string }[];
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[1].name).toBe('About');
  });
});

describe('buildWebSiteSchema', () => {
  it('generates valid WebSite schema', () => {
    const schema = buildWebSiteSchema({ name: 'Aglow', url: 'https://aglow.co' });
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('Aglow');
  });
});
