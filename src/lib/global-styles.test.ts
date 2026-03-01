/**
 * Global Styles Tests — Design token generation and validation.
 */

import { describe, it, expect } from 'vitest';
import { designTokensSchema, generateTokenCSS, getDefaultTokens } from './global-styles';

describe('designTokensSchema', () => {
  it('parses empty object with defaults', () => {
    const result = designTokensSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.colors.primary).toBe('#3B82F6');
      expect(result.data.typography.headingFont).toBe('Inter');
    }
  });

  it('parses custom colors', () => {
    const result = designTokensSchema.safeParse({
      colors: { primary: '#FF0000' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.colors.primary).toBe('#FF0000');
    }
  });
});

describe('generateTokenCSS', () => {
  it('generates CSS custom properties', () => {
    const tokens = getDefaultTokens();
    const css = generateTokenCSS(tokens);

    expect(css).toContain(':root {');
    expect(css).toContain('--color-primary: #3B82F6');
    expect(css).toContain('--font-heading:');
    expect(css).toContain('--spacing-base:');
    expect(css).toContain('--radius:');
  });
});

describe('getDefaultTokens', () => {
  it('returns valid design tokens', () => {
    const tokens = getDefaultTokens();
    expect(tokens.colors.primary).toBe('#3B82F6');
    expect(tokens.typography.baseFontSize).toBe('16px');
    expect(tokens.spacing.containerMaxWidth).toBe('1200px');
    expect(tokens.borders.radius).toBe('0.5rem');
  });
});
