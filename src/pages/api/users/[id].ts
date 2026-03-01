/**
 * Users API — Update & Delete by ID
 *
 * PUT    /api/users/[id] → update user role/name (admin only)
 * DELETE /api/users/[id] → delete user (admin only)
 *
 * Clean Code: thin controller, early returns, consistent error format.
 */

import type { APIRoute } from 'astro';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'editor', 'author']).optional(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) {
    return Response.json({ success: false, error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const body = updateUserSchema.parse(await request.json());

    // Prevent self-role-change (safety)
    if (body.role && id === locals.user?.id) {
      return Response.json({ success: false, error: 'ไม่สามารถเปลี่ยน role ตัวเองได้' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;

    await locals.db.update(user).set(updateData).where(eq(user.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'update',
      entityType: 'user',
      entityId: id,
      metadata: body,
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Users API] Update error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) {
    return Response.json({ success: false, error: 'Missing user ID' }, { status: 400 });
  }

  // Prevent self-deletion
  if (id === locals.user?.id) {
    return Response.json({ success: false, error: 'ไม่สามารถลบบัญชีตัวเองได้' }, { status: 400 });
  }

  try {
    await locals.db.delete(user).where(eq(user.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'delete',
      entityType: 'user',
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Users API] Delete error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
