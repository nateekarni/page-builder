/**
 * Debug endpoint — check current session state
 * REMOVE THIS FILE after debugging is complete
 */

import type { APIRoute } from 'astro';
import { createAuth } from '../../../../auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const cookies = request.headers.get('cookie') ?? '(none)';

  try {
    const auth = createAuth(locals.runtime.env.DB);
    const session = await auth.api.getSession({ headers: request.headers });

    return Response.json({
      hasSession: !!session?.user,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: (session.user as Record<string, unknown>).role,
          }
        : null,
      cookiesPresent: cookies,
    });
  } catch (err) {
    return Response.json({
      hasSession: false,
      error: String(err),
      cookiesPresent: cookies,
    });
  }
};
