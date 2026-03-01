/**
 * AI SEO Suggestions API
 *
 * POST /api/ai/seo
 * Body: { content: string }
 *
 * Returns: { title, description, headings }
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { suggestSEO, checkRateLimit } from '@/lib/ai-assistant';

const seoSchema = z.object({
  content: z.string().min(10).max(5000),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(locals.user.id)) {
      return Response.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = seoSchema.parse(await request.json());
    const ai = locals.runtime.env.AI;
    const suggestions = await suggestSEO(ai, body.content);

    return Response.json({ success: true, data: suggestions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[AI SEO] Error:', error);
    return Response.json({ success: false, error: 'SEO analysis failed' }, { status: 500 });
  }
};
