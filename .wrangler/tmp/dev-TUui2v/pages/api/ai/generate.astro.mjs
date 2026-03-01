globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as checkRateLimit, g as generateText } from '../../../chunks/ai-assistant_CuYelXXj.mjs';
import { o as object, n as number, s as string, Z as ZodError } from '../../../chunks/schemas_CNsE_rud.mjs';
export { renderers } from '../../../renderers.mjs';

const generateSchema = object({
  prompt: string().min(1).max(2e3),
  systemPrompt: string().max(500).optional(),
  maxTokens: number().min(50).max(1e3).optional()
});
const POST = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!checkRateLimit(locals.user.id)) {
      return Response.json({ success: false, error: "Rate limit exceeded. Max 10 requests per minute." }, { status: 429 });
    }
    const body = generateSchema.parse(await request.json());
    const ai = locals.runtime.env.AI;
    const result = await generateText({
      ai,
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      maxTokens: body.maxTokens
    });
    return Response.json({ success: true, data: { text: result } });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[AI Generate] Error:", error);
    return Response.json({ success: false, error: "AI generation failed" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
