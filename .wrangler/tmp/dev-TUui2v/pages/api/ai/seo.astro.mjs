globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as checkRateLimit, s as suggestSEO } from '../../../chunks/ai-assistant_CuYelXXj.mjs';
import { o as object, s as string, Z as ZodError } from '../../../chunks/schemas_CNsE_rud.mjs';
export { renderers } from '../../../renderers.mjs';

const seoSchema = object({
  content: string().min(10).max(5e3)
});
const POST = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!checkRateLimit(locals.user.id)) {
      return Response.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    const body = seoSchema.parse(await request.json());
    const ai = locals.runtime.env.AI;
    const suggestions = await suggestSEO(ai, body.content);
    return Response.json({ success: true, data: suggestions });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[AI SEO] Error:", error);
    return Response.json({ success: false, error: "SEO analysis failed" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
