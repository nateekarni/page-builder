globalThis.process ??= {}; globalThis.process.env ??= {};
import { p as pages } from '../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, s as string, _ as _enum, a as array, Z as ZodError, b as any } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const updatePageSchema = object({
  title: string().min(1).optional(),
  slug: string().min(1).optional(),
  contentBlocks: array(any()).optional(),
  status: _enum(["draft", "published", "scheduled"]).optional(),
  seoTitle: string().optional(),
  seoDescription: string().optional(),
  customCss: string().optional()
});
const GET = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: "Missing ID" }, { status: 400 });
  try {
    const page = await locals.db.select().from(pages).where(eq(pages.id, id)).limit(1);
    if (!page[0]) return Response.json({ success: false, error: "Not found" }, { status: 404 });
    return Response.json({ success: true, data: page[0] });
  } catch (error) {
    console.error("[Pages API] Get error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const PUT = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: "Missing ID" }, { status: 400 });
  try {
    const body = updatePageSchema.parse(await request.json());
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (body.title !== void 0) updateData.title = body.title;
    if (body.slug !== void 0) updateData.slug = body.slug;
    if (body.contentBlocks !== void 0) updateData.contentBlocks = body.contentBlocks;
    if (body.status !== void 0) updateData.status = body.status;
    if (body.seoTitle !== void 0) updateData.seoTitle = body.seoTitle;
    if (body.seoDescription !== void 0) updateData.seoDescription = body.seoDescription;
    if (body.customCss !== void 0) updateData.customCss = body.customCss;
    await locals.db.update(pages).set(updateData).where(eq(pages.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "update",
      entityType: "page",
      entityId: id,
      metadata: { title: body.title }
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Pages API] Update error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const DELETE = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: "Missing ID" }, { status: 400 });
  try {
    await locals.db.delete(pages).where(eq(pages.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "delete",
      entityType: "page",
      entityId: id
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[Pages API] Delete error:", error);
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
