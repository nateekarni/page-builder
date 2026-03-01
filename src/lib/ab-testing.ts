/**
 * A/B Testing — Variant Selection Utility
 *
 * Handles cookie-based variant assignment for A/B tests.
 * Pure utility function: page route calls selectVariant() → transparent to renderer.
 *
 * Clean Code: stateless, testable, no framework dependency beyond cookie access.
 */

import { eq, and } from 'drizzle-orm';
import { abTests } from '../db/schema';
import type { Database } from '../db/client';
import type { Block } from './blocks';

interface SelectVariantOptions {
  db: Database;
  pageId: string;
  defaultBlocks: Block[];
  cookies: {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
  };
}

interface ABVariant {
  id: string;
  name: string;
  content_blocks: Block[];
}

const COOKIE_PREFIX = 'ab_variant_';
const COOKIE_MAX_AGE_DAYS = 30;

/**
 * Selects the appropriate content blocks based on active A/B test.
 * If no active test, returns default blocks unchanged.
 */
export async function selectVariant({
  db,
  pageId,
  defaultBlocks,
  cookies,
}: SelectVariantOptions): Promise<Block[]> {
  try {
    const activeTests = await db
      .select()
      .from(abTests)
      .where(and(eq(abTests.pageId, pageId), eq(abTests.status, 'running')))
      .limit(1);

    const test = activeTests[0];
    if (!test) return defaultBlocks;

    const variants = test.variants as ABVariant[];
    if (!variants || variants.length === 0) return defaultBlocks;

    const cookieName = `${COOKIE_PREFIX}${test.id}`;
    const existingCookie = cookies.get(cookieName);

    // Check if user already has a variant assigned
    if (existingCookie?.value) {
      const assignedVariant = variants.find((v) => v.id === existingCookie.value);
      if (assignedVariant) {
        return assignedVariant.content_blocks;
      }
    }

    // Assign variant based on traffic split
    const selectedVariant = assignVariant(variants, test.trafficSplit);
    if (!selectedVariant) return defaultBlocks;

    // Set cookie (30-day expiry)
    cookies.set(cookieName, selectedVariant.id, {
      path: '/',
      maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    return selectedVariant.content_blocks;
  } catch {
    return defaultBlocks;
  }
}

/**
 * Randomly assigns a variant based on traffic split ratio.
 * trafficSplit represents the proportion going to the first variant (control).
 */
function assignVariant(
  variants: ABVariant[],
  trafficSplit: number,
): ABVariant | null {
  if (variants.length === 0) return null;
  if (variants.length === 1) return variants[0];

  const random = Math.random();
  return random < trafficSplit ? variants[0] : variants[1];
}
