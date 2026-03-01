/**
 * Media API — Update & Delete by ID
 *
 * PUT    /api/media/[id] → update alt text, filename
 * DELETE /api/media/[id] → delete from R2 + D1
 *
 * Clean Code: thin controller, early returns.
 */

import type { APIRoute } from 'astro';
import { media } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { deleteFromR2 } from '@/lib/r2';
import { logActivity } from '@/lib/activity-log';

const updateMediaSchema = z.object({
  altText: z.string().optional(),
  filename: z.string().min(1).optional(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: 'Missing ID' }, { status: 400 });

  try {
    const body = updateMediaSchema.parse(await request.json());
    const updateData: Record<string, unknown> = {};
    if (body.altText !== undefined) updateData.altText = body.altText;
    if (body.filename !== undefined) updateData.filename = body.filename;

    await locals.db.update(media).set(updateData).where(eq(media.id, id));

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Media API] Update error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: 'Missing ID' }, { status: 400 });

  try {
    // Get R2 key before deleting from DB
    const item = await locals.db
      .select({ r2Key: media.r2Key })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);

    if (!item[0]) {
      return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Delete from R2 first, then DB
    await deleteFromR2(locals.runtime.env.R2, item[0].r2Key);
    await locals.db.delete(media).where(eq(media.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'delete',
      entityType: 'media',
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Media API] Delete error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
