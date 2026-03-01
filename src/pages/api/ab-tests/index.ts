/**
 * A/B Tests API — CRUD for A/B test experiments
 *
 * GET  /api/ab-tests          → list all tests
 * GET  /api/ab-tests?pageId=x → list tests for a page
 * POST /api/ab-tests          → create new test
 *
 * Clean Code: thin controller, validate → delegate → respond.
 */

import type { APIRoute } from 'astro';
import { abTests, pages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const createTestSchema = z.object({
  name: z.string().min(1),
  pageId: z.string().min(1),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    content_blocks: z.array(z.any()),
  })).min(2),
  trafficSplit: z.number().min(0.1).max(0.9).default(0.5),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const pageId = url.searchParams.get('pageId');

    if (pageId) {
      const tests = await locals.db
        .select()
        .from(abTests)
        .where(eq(abTests.pageId, pageId))
        .orderBy(desc(abTests.createdAt));

      return Response.json({ success: true, data: tests });
    }

    const allTests = await locals.db
      .select()
      .from(abTests)
      .orderBy(desc(abTests.createdAt));

    return Response.json({ success: true, data: allTests });
  } catch (error) {
    console.error('[AB Tests API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = createTestSchema.parse(await request.json());

    // Verify page exists
    const page = await locals.db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, body.pageId))
      .limit(1);

    if (!page[0]) {
      return Response.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const id = crypto.randomUUID();

    await locals.db.insert(abTests).values({
      id,
      name: body.name,
      pageId: body.pageId,
      variants: body.variants,
      trafficSplit: body.trafficSplit,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'create',
      entityType: 'ab_test',
      entityId: id,
      metadata: { name: body.name },
    });

    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[AB Tests API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
