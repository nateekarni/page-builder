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
export function createAuth(d1: D1Database, request?: Request) {
  const db = drizzle(d1, { schema });

  // Dynamically determine the base URL from the request if provided, 
  // otherwise fallback to the production URL.
  const baseUrl = request 
    ? new URL(request.url).origin 
    : "https://page-builder-1tl.pages.dev";

  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    basePath: "/api/auth",
    baseURL: baseUrl,
    trustedOrigins: [baseUrl, "https://page-builder-1tl.pages.dev"],

    advanced: {
      skipTrailingSlashes: true,
      disableCSRFCheck: true,
    },
    trustHost: true,

    emailAndPassword: {
      enabled: true,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
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

    plugins: [],
  });
}

export type Auth = ReturnType<typeof createAuth>;
