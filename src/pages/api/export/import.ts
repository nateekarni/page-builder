/**
 * Import API — Import a page from JSON file
 *
 * POST /api/export/import → upload JSON, validate, create new page
 *
 * Clean Code: validates with Zod schema before creating page.
 */

import type { APIRoute } from 'astro';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const importSchema = z.object({
  version: z.string(),
  page_meta: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    ogImageUrl: z.string().nullable().optional(),
    customCss: z.string().nullable().optional(),
  }),
  content_blocks: z.array(z.any()).default([]),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = importSchema.parse(await request.json());

    // Check for slug conflict — auto-append suffix
    let slug = body.page_meta.slug;
    const existingSlug = await locals.db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      slug = `${slug}-imported-${Date.now()}`;
    }

    const id = crypto.randomUUID();

    await locals.db.insert(pages).values({
      id,
      title: body.page_meta.title,
      slug,
      status: 'draft', // Always import as draft for safety
      contentBlocks: body.content_blocks,
      seoTitle: body.page_meta.seoTitle ?? null,
      seoDescription: body.page_meta.seoDescription ?? null,
      ogImageUrl: body.page_meta.ogImageUrl ?? null,
      customCss: body.page_meta.customCss ?? null,
      createdBy: locals.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity({
      db: locals.db,
      userId: locals.user.id,
      action: 'import',
      entityType: 'page',
      entityId: id,
      metadata: { title: body.page_meta.title, originalSlug: body.page_meta.slug },
    });

    return Response.json({ success: true, data: { id, slug } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Import API] Error:', error);
    return Response.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
};
