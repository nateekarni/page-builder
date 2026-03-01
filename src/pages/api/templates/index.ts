/**
 * Templates/Patterns API — CRUD
 *
 * GET  /api/templates?patterns=true → list patterns or templates
 * POST /api/templates → create pattern/template
 * DELETE /api/templates/[id] → delete
 */

import type { APIRoute } from 'astro';
import { templates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  contentBlocks: z.array(z.any()),
  category: z.string().optional(),
  isPattern: z.boolean().default(false),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const patternsOnly = url.searchParams.get('patterns') === 'true';

    let query = locals.db
      .select()
      .from(templates)
      .orderBy(desc(templates.createdAt));

    if (patternsOnly) {
      query = query.where(eq(templates.isPattern, true)) as typeof query;
    }

    const items = await query;
    return Response.json({ success: true, data: items });
  } catch (error) {
    console.error('[Templates API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = createTemplateSchema.parse(await request.json());
    const id = crypto.randomUUID();

    await locals.db.insert(templates).values({
      id,
      name: body.name,
      description: body.description ?? null,
      contentBlocks: body.contentBlocks,
      category: body.category ?? null,
      isPattern: body.isPattern,
    });

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'create',
      entityType: 'template',
      entityId: id,
      metadata: { name: body.name, isPattern: body.isPattern },
    });

    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Templates API] Create error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
