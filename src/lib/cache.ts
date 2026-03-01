/**
 * Cache Utility — Per-request cache for site settings and design tokens.
 *
 * Prevents repeated D1 queries within the same request lifecycle.
 * For Cloudflare Cache API on public pages (edge caching).
 *
 * Clean Code: pure utility, no framework dependency.
 */

import { siteSettings } from '../db/schema';
import type { Database } from '../db/client';

let cachedSettings: Map<string, Record<string, unknown>> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minute in-memory TTL

/**
 * Load all site settings with in-memory caching.
 * Returns a Map of key → value for fast lookup.
 */
export async function loadSettings(db: Database): Promise<Map<string, Record<string, unknown>>> {
  const now = Date.now();

  if (cachedSettings && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSettings;
  }

  const rows = await db.select().from(siteSettings);
  cachedSettings = new Map(rows.map((r) => [r.key, r.value]));
  cacheTimestamp = now;

  return cachedSettings;
}

/**
 * Get a single setting by key (cached).
 */
export async function getSetting(
  db: Database,
  key: string,
): Promise<Record<string, unknown> | null> {
  const settings = await loadSettings(db);
  return settings.get(key) ?? null;
}

/**
 * Invalidate the settings cache (call after settings update).
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null;
  cacheTimestamp = 0;
}

/**
 * Generate cache headers for public pages.
 * Uses Cloudflare CDN-Cache-Control for edge caching.
 */
export function publicCacheHeaders(maxAgeSec: number = 300): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAgeSec}, s-maxage=${maxAgeSec}`,
    'CDN-Cache-Control': `max-age=${maxAgeSec}`,
  };
}
