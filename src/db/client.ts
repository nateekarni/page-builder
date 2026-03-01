/**
 * D1 Database Client Helper
 *
 * Creates a Drizzle ORM instance from the Cloudflare D1 binding.
 * Used in API routes and middleware to access the database.
 *
 * Clean Code: This abstracts the D1 binding access so components
 * never need to touch `runtime.env` directly.
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Database = ReturnType<typeof createDatabase>;

/**
 * Creates a typed Drizzle instance from a D1 binding.
 *
 * @example
 * ```ts
 * // In an API route or middleware:
 * const db = createDatabase(runtime.env.DB);
 * const pages = await db.query.pages.findMany();
 * ```
 */
export function createDatabase(d1: D1Database) {
  return drizzle(d1, { schema });
}
