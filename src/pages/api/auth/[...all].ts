/**
 * Better Auth — API Catch-All Route
 *
 * Delegates all /api/auth/* requests to Better Auth handler.
 * Clean Code: thin controller — single delegation, no logic.
 */

import type { APIRoute } from 'astro';
import { createAuth } from '../../../../auth';

const handleAuthRequest: APIRoute = async ({ request, locals }) => {
  console.log('[AUTH ROUTE] Reached route with URL:', request.url);
  const auth = createAuth(locals.runtime.env, request);
  return auth.handler(request);
};

export const ALL = handleAuthRequest;
