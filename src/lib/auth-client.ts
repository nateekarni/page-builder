/**
 * Better Auth — Client-Side Helpers
 *
 * Wraps Better Auth client with project-specific interface.
 * If we ever switch auth libraries, only this file needs changing (Adapter Pattern).
 *
 * Clean Code: single file for all client-side auth operations.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.SITE || "https://page-builder-1tl.pages.dev",
});

export const { signIn, signUp, signOut, useSession } = authClient;
