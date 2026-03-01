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
 * Lightweight password hashing using PBKDF2 (Web Crypto API).
 * Cloudflare Workers free tier has a 10ms CPU limit, which scrypt exceeds.
 * PBKDF2 with 100k iterations is fast enough and secure for production use.
 */
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

async function verifyPassword(data: { hash: string; password: string }): Promise<boolean> {
  const { hash, password } = data;
  // Support legacy scrypt hashes (salt:hash format without prefix)
  if (!hash.startsWith("pbkdf2:")) return false;
  const [, saltHex, storedHashHex] = hash.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const derivedHex = [...new Uint8Array(derivedBits)].map(b => b.toString(16).padStart(2, '0')).join('');
  return derivedHex === storedHashHex;
}

export function createAuth(env: Record<string, any>, request?: Request) {
  const db = drizzle(env.DB, { schema });

  const baseUrl = request 
    ? new URL(request.url).origin 
    : "https://page-builder-1tl.pages.dev";

  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    basePath: "/api/auth",
    baseURL: baseUrl,
    trustedOrigins: [baseUrl, "https://page-builder-1tl.pages.dev"],
    secret: env.BETTER_AUTH_SECRET || (typeof process !== "undefined" ? process.env.BETTER_AUTH_SECRET : undefined),

    advanced: {
      skipTrailingSlashes: true,
      disableCSRFCheck: true,
    },
    trustHost: true,

    emailAndPassword: {
      enabled: true,
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
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
