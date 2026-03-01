/**
 * Form Submissions API
 *
 * POST /api/forms/submit → validate against form schema → insert submission
 * GET  /api/forms/submissions?formBlockId=x → list submissions for a form
 */

import type { APIRoute } from 'astro';
import { formSubmissions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const submitFormSchema = z.object({
  formBlockId: z.string().min(1),
  pageId: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = submitFormSchema.parse(await request.json());

    const id = crypto.randomUUID();
    await locals.db.insert(formSubmissions).values({
      id,
      formBlockId: body.formBlockId,
      pageId: body.pageId,
      data: body.data,
    });

    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Form Submit] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const GET: APIRoute = async ({ url, locals }) => {
  const formBlockId = url.searchParams.get('formBlockId');
  if (!formBlockId) return Response.json({ success: false, error: 'Missing formBlockId' }, { status: 400 });

  try {
    const submissions = await locals.db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.formBlockId, formBlockId))
      .orderBy(desc(formSubmissions.createdAt))
      .limit(100);

    return Response.json({ success: true, data: submissions });
  } catch (error) {
    console.error('[Form Submit] List error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
