/**
 * A/B Test Detail API — Update, start, stop, delete tests
 *
 * GET    /api/ab-tests/:id → get test details
 * PUT    /api/ab-tests/:id → update test (name, split, status)
 * DELETE /api/ab-tests/:id → delete test
 *
 * Clean Code: thin controller with consistent error handling.
 */

import type { APIRoute } from 'astro';
import { abTests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const updateTestSchema = z.object({
  name: z.string().min(1).optional(),
  trafficSplit: z.number().min(0.1).max(0.9).optional(),
  status: z.enum(['draft', 'running', 'completed']).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    content_blocks: z.array(z.any()),
  })).optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) return Response.json({ success: false, error: 'ID required' }, { status: 400 });

    const result = await locals.db
      .select()
      .from(abTests)
      .where(eq(abTests.id, id))
      .limit(1);

    if (!result[0]) {
      return Response.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('[AB Test Detail] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) return Response.json({ success: false, error: 'ID required' }, { status: 400 });

    const body = updateTestSchema.parse(await request.json());

    const existing = await locals.db
      .select()
      .from(abTests)
      .where(eq(abTests.id, id))
      .limit(1);

    if (!existing[0]) {
      return Response.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.trafficSplit !== undefined) updates.trafficSplit = body.trafficSplit;
    if (body.variants !== undefined) updates.variants = body.variants;
    if (body.results !== undefined) updates.results = body.results;

    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === 'running') updates.startAt = new Date();
      if (body.status === 'completed') updates.endAt = new Date();
    }

    await locals.db.update(abTests).set(updates).where(eq(abTests.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'update',
      entityType: 'ab_test',
      entityId: id,
      metadata: { status: body.status },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[AB Test Detail] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) return Response.json({ success: false, error: 'ID required' }, { status: 400 });

    await locals.db.delete(abTests).where(eq(abTests.id, id));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'delete',
      entityType: 'ab_test',
      entityId: id,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[AB Test Detail] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
