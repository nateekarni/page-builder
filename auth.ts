/**
 * Better Auth — Server Configuration
 *
 * Factory function that creates a Better Auth instance per request.
 * D1 bindings are only available in Cloudflare request context,
 * so we cannot create a global static auth instance.
 *
 * Clean Code: declarative config, no imperative logic.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./src/db/schema";

/**
 * Creates a Better Auth instance bound to the given D1 database.
 * Must be called per-request in API routes and middleware.
 *
 * @example
 * ```ts
 * const auth = createAuth(runtime.env.DB);
 * const session = await auth.api.getSession({ headers });
 * ```
 */
export function createAuth(d1: D1Database) {
  const db = drizzle(d1, { schema });

  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    basePath: "/api/auth",
    trustedOrigins: ["https://page-builder-1tl.pages.dev"],

    emailAndPassword: {
      enabled: true,
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieAttributes: {
        secure: true,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
      },
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "author",
          input: false, // cannot be set by user during signup
        },
      },
    },

    plugins: [admin()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
