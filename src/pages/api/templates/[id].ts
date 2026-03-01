/**
 * Template Delete API
 */

import type { APIRoute } from 'astro';
import { templates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logActivity } from '@/lib/activity-log';

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: 'Missing ID' }, { status: 400 });

  try {
    await locals.db.delete(templates).where(eq(templates.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'delete',
      entityType: 'template',
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Templates API] Delete error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
