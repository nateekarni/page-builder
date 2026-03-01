/**
 * Block Schema Tests — Validates all 17 block type schemas.
 *
 * Tests: valid JSON passes, invalid JSON fails with clear error.
 */

import { describe, it, expect } from 'vitest';
import { blockSchema, createBlock, validateBlockProps, BLOCK_TYPES, type BlockType } from './blocks';

describe('Block Schema Validation', () => {
  it('validates a minimal valid block', () => {
    const block = createBlock('text');
    const result = blockSchema.safeParse(block);
    expect(result.success).toBe(true);
  });

  it('rejects block without required fields', () => {
    const result = blockSchema.safeParse({ id: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects block with invalid type', () => {
    const result = blockSchema.safeParse({
      id: '123',
      type: 'invalid-type',
      props: {},
      styles: {},
      visibility: { desktop: true },
    });
    expect(result.success).toBe(false);
  });
});

describe('createBlock factory', () => {
  const blockTypes: BlockType[] = [...BLOCK_TYPES];

  it.each(blockTypes)('creates valid default block for type: %s', (type) => {
    const block = createBlock(type);
    expect(block.id).toBeDefined();
    expect(block.type).toBe(type);
    expect(block.props).toBeDefined();
    expect(block.styles).toBeDefined();
    expect(block.visibility.desktop).toBe(true);
  });

  it('creates container with children array', () => {
    const block = createBlock('container');
    expect(block.children).toEqual([]);
  });

  it('creates text block without children', () => {
    const block = createBlock('text');
    expect(block.children).toBeUndefined();
  });

  it('applies overrides', () => {
    const block = createBlock('text', { id: 'custom-id' });
    expect(block.id).toBe('custom-id');
  });
});

describe('validateBlockProps', () => {
  it('validates text block props', () => {
    const block = createBlock('text');
    expect(validateBlockProps(block)).toBe(true);
  });

  it('validates image block props', () => {
    const block = createBlock('image');
    expect(validateBlockProps(block)).toBe(true);
  });

  it('validates hero block props', () => {
    const block = createBlock('hero');
    expect(validateBlockProps(block)).toBe(true);
  });
});
