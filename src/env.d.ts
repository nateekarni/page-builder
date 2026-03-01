/**
 * Environment Type Definitions
 *
 * Extends Astro's env types with Cloudflare bindings (D1, R2, AI).
 * These types flow through middleware into `Astro.locals`.
 */

/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;
type Ai = import('@cloudflare/workers-types').Ai;

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
}>;

declare namespace App {
  interface Locals extends Runtime {
    db: import('./db/client').Database;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'editor' | 'author';
      image: string | null;
    } | null;
  }
}
