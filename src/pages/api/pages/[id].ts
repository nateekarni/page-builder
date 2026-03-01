/**
 * Pages API — Get, Update, Delete by ID
 */

import type { APIRoute } from 'astro';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  contentBlocks: z.array(z.any()).optional(),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  customCss: z.string().optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: 'Missing ID' }, { status: 400 });

  try {
    const page = await locals.db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!page[0]) return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    return Response.json({ success: true, data: page[0] });
  } catch (error) {
    console.error('[Pages API] Get error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: 'Missing ID' }, { status: 400 });

  try {
    const body = updatePageSchema.parse(await request.json());
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.contentBlocks !== undefined) updateData.contentBlocks = body.contentBlocks;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription;
    if (body.customCss !== undefined) updateData.customCss = body.customCss;

    await locals.db.update(pages).set(updateData).where(eq(pages.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'update',
      entityType: 'page',
      entityId: id,
      metadata: { title: body.title },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Pages API] Update error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: 'Missing ID' }, { status: 400 });

  try {
    await locals.db.delete(pages).where(eq(pages.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'delete',
      entityType: 'page',
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Pages API] Delete error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
