/**
 * AI Alt Text API — Image description for accessibility
 *
 * POST /api/ai/alt-text
 * Body: { imageUrl: string }
 *
 * Returns: { altText: string }
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { describeImage, checkRateLimit } from '@/lib/ai-assistant';

const altTextSchema = z.object({
  imageUrl: z.string().url(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(locals.user.id)) {
      return Response.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = altTextSchema.parse(await request.json());
    const ai = locals.runtime.env.AI;
    const altText = await describeImage(ai, body.imageUrl);

    return Response.json({ success: true, data: { altText } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[AI Alt Text] Error:', error);
    return Response.json({ success: false, error: 'Image description failed' }, { status: 500 });
  }
};
