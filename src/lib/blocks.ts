/**
 * Block Type Definitions & Zod Schemas
 *
 * Single Source of Truth for all block types used in the Page Builder.
 * Every block must be validated through these schemas before saving to DB.
 *
 * Clean Code:
 * - Zod schema → infer TypeScript type (no manual type duplication)
 * - ResponsiveValue<T> generic for per-breakpoint values
 * - Discriminated union ensures exhaustive type checking
 */

import { z } from 'zod';

// ============================================================================
// VIEWPORT & RESPONSIVE TYPES
// ============================================================================

export const VIEWPORTS = ['desktop', 'tablet', 'mobile'] as const;
export type Viewport = (typeof VIEWPORTS)[number];

export const VIEWPORT_WIDTHS = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
} as const;

/**
 * Creates a Zod schema for responsive (per-breakpoint) values.
 * Desktop is always required; tablet and mobile are optional overrides.
 */
function responsiveValue<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    desktop: valueSchema,
    tablet: valueSchema.optional(),
    mobile: valueSchema.optional(),
  });
}

// ============================================================================
// SPACING & STYLE SCHEMAS
// ============================================================================

const spacingSchema = z.object({
  top: z.string().default('0'),
  right: z.string().default('0'),
  bottom: z.string().default('0'),
  left: z.string().default('0'),
});

export type Spacing = z.infer<typeof spacingSchema>;

const styleConfigSchema = z.object({
  margin: responsiveValue(spacingSchema).default({ desktop: { top: '0', right: '0', bottom: '0', left: '0' } }),
  padding: responsiveValue(spacingSchema).default({ desktop: { top: '0', right: '0', bottom: '0', left: '0' } }),
  width: responsiveValue(z.string()).default({ desktop: '100%' }),
  maxWidth: responsiveValue(z.string()).default({ desktop: 'none' }),
  display: responsiveValue(z.enum(['block', 'flex', 'grid', 'none', 'inline-flex'])).default({ desktop: 'block' }),
  flexDirection: responsiveValue(z.enum(['row', 'column', 'row-reverse', 'column-reverse'])).default({ desktop: 'row' }),
  justifyContent: responsiveValue(z.enum(['start', 'center', 'end', 'between', 'around', 'evenly'])).default({ desktop: 'start' }),
  alignItems: responsiveValue(z.enum(['start', 'center', 'end', 'stretch', 'baseline'])).default({ desktop: 'stretch' }),
  gap: responsiveValue(z.string()).default({ desktop: '0' }),
  textAlign: responsiveValue(z.enum(['left', 'center', 'right', 'justify'])).default({ desktop: 'left' }),
  fontSize: responsiveValue(z.string()).optional(),
  bgColor: z.string().default('transparent'),
  textColor: z.string().default('inherit'),
  borderRadius: z.string().default('0'),
  customCSS: z.string().default(''),
});

export type StyleConfig = z.infer<typeof styleConfigSchema>;

// ============================================================================
// BLOCK TYPE ENUM
// ============================================================================

export const BLOCK_TYPES = [
  'container',
  'columns',
  'text',
  'image',
  'video',
  'hero',
  'cta',
  'spacer',
  'divider',
  'accordion',
  'tabs',
  'icon-box',
  'testimonial',
  'form',
  'map',
  'code',
  'query-loop',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

// ============================================================================
// BLOCK-SPECIFIC PROPS SCHEMAS
// ============================================================================

const containerPropsSchema = z.object({
  tag: z.enum(['div', 'section', 'article', 'aside', 'main', 'nav']).default('section'),
});

const columnsPropsSchema = z.object({
  count: z.number().min(2).max(6).default(2),
  widths: z.array(z.string()).optional(), // e.g. ['50%', '50%'] or ['33%', '33%', '33%']
  stackOnMobile: z.boolean().default(true),
});

const textPropsSchema = z.object({
  content: z.string().default(''),
  level: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']).default('p'),
});

const imagePropsSchema = z.object({
  mediaId: z.string().optional(),
  src: z.string().default(''),
  alt: z.string().default(''),
  caption: z.string().optional(),
  linkUrl: z.string().optional(),
  objectFit: z.enum(['cover', 'contain', 'fill', 'none']).default('cover'),
});

const videoPropsSchema = z.object({
  url: z.string().default(''),
  aspectRatio: z.enum(['16:9', '4:3', '1:1', '9:16']).default('16:9'),
  autoplay: z.boolean().default(false),
  muted: z.boolean().default(true),
  loop: z.boolean().default(false),
});

const heroPropsSchema = z.object({
  heading: z.string().default(''),
  subheading: z.string().optional(),
  backgroundMediaId: z.string().optional(),
  backgroundUrl: z.string().default(''),
  overlayColor: z.string().default('rgba(0,0,0,0.4)'),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  minHeight: z.string().default('60vh'),
});

const ctaPropsSchema = z.object({
  text: z.string().default('Click here'),
  url: z.string().default('#'),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  icon: z.string().optional(), // Lucide icon name
  openInNewTab: z.boolean().default(false),
});

const spacerPropsSchema = z.object({
  height: responsiveValue(z.string()).default({ desktop: '2rem' }),
});

const dividerPropsSchema = z.object({
  style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  color: z.string().default('#e5e7eb'),
  thickness: z.string().default('1px'),
  width: z.string().default('100%'),
});

const accordionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  isOpen: z.boolean().default(false),
});

const accordionPropsSchema = z.object({
  items: z.array(accordionItemSchema).default([]),
  allowMultiple: z.boolean().default(false),
});

const tabItemSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const tabsPropsSchema = z.object({
  tabs: z.array(tabItemSchema).default([]),
  activeTabId: z.string().optional(),
});

const iconBoxPropsSchema = z.object({
  icon: z.string().default('star'), // Lucide icon name
  title: z.string().default(''),
  description: z.string().default(''),
  iconSize: z.string().default('2rem'),
  iconColor: z.string().default('var(--color-primary)'),
});

const testimonialPropsSchema = z.object({
  quote: z.string().default(''),
  authorName: z.string().default(''),
  authorTitle: z.string().optional(),
  authorAvatar: z.string().optional(), // media URL
  companyName: z.string().optional(),
});

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox', 'number', 'tel', 'url']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select fields
});

const formPropsSchema = z.object({
  fields: z.array(formFieldSchema).default([]),
  submitLabel: z.string().default('Submit'),
  successMessage: z.string().default('Thank you for your submission!'),
  emailNotification: z.string().optional(), // email to notify on submission
});

const mapPropsSchema = z.object({
  address: z.string().default(''),
  lat: z.number().optional(),
  lng: z.number().optional(),
  zoom: z.number().min(1).max(20).default(15),
  height: z.string().default('400px'),
});

const codePropsSchema = z.object({
  code: z.string().default(''),
  language: z.string().default('javascript'),
  showLineNumbers: z.boolean().default(true),
  filename: z.string().optional(),
});

const queryLoopPropsSchema = z.object({
  source: z.enum(['pages', 'templates']).default('pages'),
  limit: z.number().min(1).max(50).default(10),
  orderBy: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
  filterStatus: z.enum(['published', 'draft', 'all']).default('published'),
});

// ============================================================================
// UNIFIED BLOCK SCHEMA
// ============================================================================

/**
 * Base block schema — used recursively for nested blocks (containers, columns, tabs).
 */
export const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(BLOCK_TYPES),
    props: z.record(z.string(), z.any()),
    children: z.array(blockSchema).optional(),
    styles: styleConfigSchema,
    visibility: responsiveValue(z.boolean()),
    customCSS: z.string().optional(),
  }),
);

export type Block = {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  children?: Block[];
  styles: StyleConfig;
  visibility: { desktop: boolean; tablet?: boolean; mobile?: boolean };
  customCSS?: string;
};

// ============================================================================
// PROPS SCHEMA REGISTRY — maps block type → props schema (for validation)
// ============================================================================

export const BLOCK_PROPS_REGISTRY: Record<BlockType, z.ZodTypeAny> = {
  container: containerPropsSchema,
  columns: columnsPropsSchema,
  text: textPropsSchema,
  image: imagePropsSchema,
  video: videoPropsSchema,
  hero: heroPropsSchema,
  cta: ctaPropsSchema,
  spacer: spacerPropsSchema,
  divider: dividerPropsSchema,
  accordion: accordionPropsSchema,
  tabs: tabsPropsSchema,
  'icon-box': iconBoxPropsSchema,
  testimonial: testimonialPropsSchema,
  form: formPropsSchema,
  map: mapPropsSchema,
  code: codePropsSchema,
  'query-loop': queryLoopPropsSchema,
};

/**
 * Validates a block's props against its type-specific schema.
 * Should be called before saving to ensure data integrity.
 */
export function validateBlockProps(block: Block): boolean {
  const propsSchema = BLOCK_PROPS_REGISTRY[block.type];
  if (!propsSchema) return false;
  const result = propsSchema.safeParse(block.props);
  return result.success;
}

// ============================================================================
// BLOCK FACTORY — creates new block instances with defaults
// ============================================================================

/**
 * Creates a new block with default props and styles.
 * Uses crypto.randomUUID() for unique IDs (available in Cloudflare Workers).
 */
export function createBlock(type: BlockType, overrides?: Partial<Block>): Block {
  const propsSchema = BLOCK_PROPS_REGISTRY[type];
  const defaultProps = propsSchema.parse({}) as Record<string, unknown>;

  const defaultSpacing = { top: '0', right: '0', bottom: '0', left: '0' };

  return {
    id: crypto.randomUUID(),
    type,
    props: defaultProps,
    children: type === 'container' || type === 'columns' || type === 'tabs' ? [] : undefined,
    styles: {
      margin: { desktop: defaultSpacing },
      padding: { desktop: defaultSpacing },
      width: { desktop: '100%' },
      maxWidth: { desktop: 'none' },
      display: { desktop: 'block' },
      flexDirection: { desktop: 'row' },
      justifyContent: { desktop: 'start' },
      alignItems: { desktop: 'stretch' },
      gap: { desktop: '0' },
      textAlign: { desktop: 'left' },
      bgColor: 'transparent',
      textColor: 'inherit',
      borderRadius: '0',
      customCSS: '',
    },
    visibility: { desktop: true },
    ...overrides,
  };
}
