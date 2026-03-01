globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as abTests } from '../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, a as array, b as any, s as string, r as record, u as unknown, _ as _enum, n as number, Z as ZodError } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const updateTestSchema = object({
  name: string().min(1).optional(),
  trafficSplit: number().min(0.1).max(0.9).optional(),
  status: _enum(["draft", "running", "completed"]).optional(),
  results: record(string(), unknown()).optional(),
  variants: array(object({
    id: string(),
    name: string(),
    content_blocks: array(any())
  })).optional()
});
const GET = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) return Response.json({ success: false, error: "ID required" }, { status: 400 });
    const result = await locals.db.select().from(abTests).where(eq(abTests.id, id)).limit(1);
    if (!result[0]) {
      return Response.json({ success: false, error: "Test not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("[AB Test Detail] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const PUT = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) return Response.json({ success: false, error: "ID required" }, { status: 400 });
    const body = updateTestSchema.parse(await request.json());
    const existing = await locals.db.select().from(abTests).where(eq(abTests.id, id)).limit(1);
    if (!existing[0]) {
      return Response.json({ success: false, error: "Test not found" }, { status: 404 });
    }
    const updates = { updatedAt: /* @__PURE__ */ new Date() };
    if (body.name !== void 0) updates.name = body.name;
    if (body.trafficSplit !== void 0) updates.trafficSplit = body.trafficSplit;
    if (body.variants !== void 0) updates.variants = body.variants;
    if (body.results !== void 0) updates.results = body.results;
    if (body.status !== void 0) {
      updates.status = body.status;
      if (body.status === "running") updates.startAt = /* @__PURE__ */ new Date();
      if (body.status === "completed") updates.endAt = /* @__PURE__ */ new Date();
    }
    await locals.db.update(abTests).set(updates).where(eq(abTests.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "update",
      entityType: "ab_test",
      entityId: id,
      metadata: { status: body.status }
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[AB Test Detail] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const DELETE = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) return Response.json({ success: false, error: "ID required" }, { status: 400 });
    await locals.db.delete(abTests).where(eq(abTests.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "delete",
      entityType: "ab_test",
      entityId: id
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[AB Test Detail] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
