/**
 * Setup API — One-time Admin Creation
 *
 * POST /api/setup → creates the first admin user
 * Works ONLY if NO admin exists in the database.
 * No CSRF token required.
 */

import type { APIRoute } from 'astro';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createAuth } from '../../../auth';

const setupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Check if ANY admin exists. If yes, ABORT and lock this endpoint.
    const adminUsers = await locals.db
      .select()
      .from(user)
      .where(eq(user.role, 'admin'))
      .limit(1);

    if (adminUsers.length > 0) {
      return Response.json(
        { success: false, error: 'Setup locked. An admin already exists.' },
        { status: 403 }
      );
    }

    const body = setupSchema.parse(await request.json());
    const auth = createAuth(locals.runtime.env.DB);

    // 2. Delegate to Better Auth for creation + password hashing
    // We send a dummy Headers object so it doesn't fail trying to read cookies
    const result = await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });

    if (!result) {
      return Response.json({ success: false, error: 'Failed to create user' }, { status: 400 });
    }

    // 3. Promote explicitly to admin
    await locals.db
      .update(user)
      .set({ role: 'admin' })
      .where(eq(user.email, body.email));

    return Response.json({ success: true, message: 'Initial Admin created successfully. Endpoint is now locked.' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Setup API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
