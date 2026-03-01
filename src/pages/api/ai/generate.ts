/**
 * AI Generate API — Text generation endpoint
 *
 * POST /api/ai/generate
 * Body: { prompt: string, systemPrompt?: string, maxTokens?: number }
 *
 * Clean Code: thin controller — validate → rate limit → delegate → respond.
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { generateText, checkRateLimit } from '@/lib/ai-assistant';

const generateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  systemPrompt: z.string().max(500).optional(),
  maxTokens: z.number().min(50).max(1000).optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(locals.user.id)) {
      return Response.json({ success: false, error: 'Rate limit exceeded. Max 10 requests per minute.' }, { status: 429 });
    }

    const body = generateSchema.parse(await request.json());
    const ai = locals.runtime.env.AI;

    const result = await generateText({
      ai,
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      maxTokens: body.maxTokens,
    });

    return Response.json({ success: true, data: { text: result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[AI Generate] Error:', error);
    return Response.json({ success: false, error: 'AI generation failed' }, { status: 500 });
  }
};
