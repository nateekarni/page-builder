globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as abTests, p as pages } from '../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, n as number, a as array, b as any, s as string, Z as ZodError } from '../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
import { d as desc } from '../../chunks/select_dqRfph0M.mjs';
export { renderers } from '../../renderers.mjs';

const createTestSchema = object({
  name: string().min(1),
  pageId: string().min(1),
  variants: array(object({
    id: string(),
    name: string(),
    content_blocks: array(any())
  })).min(2),
  trafficSplit: number().min(0.1).max(0.9).default(0.5)
});
const GET = async ({ url, locals }) => {
  try {
    const pageId = url.searchParams.get("pageId");
    if (pageId) {
      const tests = await locals.db.select().from(abTests).where(eq(abTests.pageId, pageId)).orderBy(desc(abTests.createdAt));
      return Response.json({ success: true, data: tests });
    }
    const allTests = await locals.db.select().from(abTests).orderBy(desc(abTests.createdAt));
    return Response.json({ success: true, data: allTests });
  } catch (error) {
    console.error("[AB Tests API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const body = createTestSchema.parse(await request.json());
    const page = await locals.db.select({ id: pages.id }).from(pages).where(eq(pages.id, body.pageId)).limit(1);
    if (!page[0]) {
      return Response.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    const id = crypto.randomUUID();
    await locals.db.insert(abTests).values({
      id,
      name: body.name,
      pageId: body.pageId,
      variants: body.variants,
      trafficSplit: body.trafficSplit,
      status: "draft",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "create",
      entityType: "ab_test",
      entityId: id,
      metadata: { name: body.name }
    });
    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[AB Tests API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
