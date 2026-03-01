/**
 * Pages API — List & Create
 *
 * GET  /api/pages → list pages (title, slug, status, updatedAt)
 * POST /api/pages → create page with content_blocks
 */

import type { APIRoute } from 'astro';
import { pages } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const createPageSchema = z.object({
  title: z.string().min(1, 'ชื่อหน้าห้ามว่าง'),
  slug: z.string().min(1),
  contentBlocks: z.array(z.any()).default([]),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  customCss: z.string().optional(),
});

export const GET: APIRoute = async ({ locals }) => {
  try {
    const allPages = await locals.db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        status: pages.status,
        updatedAt: pages.updatedAt,
        createdAt: pages.createdAt,
      })
      .from(pages)
      .orderBy(desc(pages.updatedAt));

    return Response.json({ success: true, data: allPages });
  } catch (error) {
    console.error('[Pages API] List error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = createPageSchema.parse(await request.json());
    const id = crypto.randomUUID();

    await locals.db.insert(pages).values({
      id,
      title: body.title,
      slug: body.slug,
      status: body.status,
      contentBlocks: body.contentBlocks,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      customCss: body.customCss ?? null,
      createdBy: locals.user?.id ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'create',
      entityType: 'page',
      entityId: id,
      metadata: { title: body.title },
    });

    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Pages API] Create error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
