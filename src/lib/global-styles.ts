/**
 * Global Styles — Design Token Definitions
 *
 * Defines the schema for global design tokens stored in `site_settings`.
 * These tokens are injected as CSS custom properties into every page.
 *
 * Clean Code: Blocks reference `var(--color-primary)` instead of hardcoded hex.
 * Changing a token here updates the entire site.
 */

import { z } from 'zod';

const colorsSchema = z.object({
  primary: z.string().default('#3B82F6'),
  secondary: z.string().default('#6366F1'),
  accent: z.string().default('#F59E0B'),
  background: z.string().default('#FFFFFF'),
  foreground: z.string().default('#0F172A'),
  muted: z.string().default('#F1F5F9'),
  mutedForeground: z.string().default('#64748B'),
  border: z.string().default('#E2E8F0'),
});

const headingSizesSchema = z.object({
  h1: z.string().default('3rem'),
  h2: z.string().default('2.25rem'),
  h3: z.string().default('1.875rem'),
  h4: z.string().default('1.5rem'),
  h5: z.string().default('1.25rem'),
  h6: z.string().default('1.125rem'),
});

const typographySchema = z.object({
  headingFont: z.string().default('Inter'),
  bodyFont: z.string().default('Inter'),
  baseFontSize: z.string().default('16px'),
  lineHeight: z.string().default('1.6'),
  headingSizes: headingSizesSchema.default({
    h1: '3rem',
    h2: '2.25rem',
    h3: '1.875rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1.125rem',
  }),
});

const spacingSchema = z.object({
  baseUnit: z.string().default('0.25rem'),
  scale: z.number().default(4),
  sectionPadding: z.string().default('4rem'),
  containerMaxWidth: z.string().default('1200px'),
});

const bordersSchema = z.object({
  radius: z.string().default('0.5rem'),
  radiusLg: z.string().default('1rem'),
  radiusFull: z.string().default('9999px'),
});

export const designTokensSchema = z.object({
  colors: colorsSchema.default({
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#F59E0B',
    background: '#FFFFFF',
    foreground: '#0F172A',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
  }),
  typography: typographySchema.default({
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: '16px',
    lineHeight: '1.6',
    headingSizes: {
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.875rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
    },
  }),
  spacing: spacingSchema.default({
    baseUnit: '0.25rem',
    scale: 4,
    sectionPadding: '4rem',
    containerMaxWidth: '1200px',
  }),
  borders: bordersSchema.default({
    radius: '0.5rem',
    radiusLg: '1rem',
    radiusFull: '9999px',
  }),
});

export type DesignTokens = z.infer<typeof designTokensSchema>;

/**
 * Generates CSS custom properties string from design tokens.
 * Injected into `<head>` of every page via layout.
 */
export function generateTokenCSS(tokens: DesignTokens): string {
  return `:root {
  /* Colors */
  --color-primary: ${tokens.colors.primary};
  --color-secondary: ${tokens.colors.secondary};
  --color-accent: ${tokens.colors.accent};
  --color-background: ${tokens.colors.background};
  --color-foreground: ${tokens.colors.foreground};
  --color-muted: ${tokens.colors.muted};
  --color-muted-foreground: ${tokens.colors.mutedForeground};
  --color-border: ${tokens.colors.border};

  /* Typography */
  --font-heading: '${tokens.typography.headingFont}', sans-serif;
  --font-body: '${tokens.typography.bodyFont}', sans-serif;
  --font-size-base: ${tokens.typography.baseFontSize};
  --line-height: ${tokens.typography.lineHeight};
  --font-size-h1: ${tokens.typography.headingSizes.h1};
  --font-size-h2: ${tokens.typography.headingSizes.h2};
  --font-size-h3: ${tokens.typography.headingSizes.h3};
  --font-size-h4: ${tokens.typography.headingSizes.h4};
  --font-size-h5: ${tokens.typography.headingSizes.h5};
  --font-size-h6: ${tokens.typography.headingSizes.h6};

  /* Spacing */
  --spacing-base: ${tokens.spacing.baseUnit};
  --section-padding: ${tokens.spacing.sectionPadding};
  --container-max-width: ${tokens.spacing.containerMaxWidth};

  /* Borders */
  --radius: ${tokens.borders.radius};
  --radius-lg: ${tokens.borders.radiusLg};
  --radius-full: ${tokens.borders.radiusFull};
}`;
}

/**
 * Returns default design tokens. Used as initial values for new sites.
 */
export function getDefaultTokens(): DesignTokens {
  return designTokensSchema.parse({
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#F59E0B',
      background: '#FFFFFF',
      foreground: '#0F172A',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      border: '#E2E8F0',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseFontSize: '16px',
      lineHeight: '1.6',
      headingSizes: {
        h1: '3rem',
        h2: '2.25rem',
        h3: '1.875rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1.125rem',
      },
    },
    spacing: {
      baseUnit: '0.25rem',
      scale: 4,
      sectionPadding: '4rem',
      containerMaxWidth: '1200px',
    },
    borders: {
      radius: '0.5rem',
      radiusLg: '1rem',
      radiusFull: '9999px',
    },
  });
}
