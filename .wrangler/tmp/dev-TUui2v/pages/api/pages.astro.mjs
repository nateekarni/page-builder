globalThis.process ??= {}; globalThis.process.env ??= {};
import { p as pages } from '../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, s as string, _ as _enum, a as array, Z as ZodError, b as any } from '../../chunks/schemas_CNsE_rud.mjs';
import { d as desc } from '../../chunks/select_dqRfph0M.mjs';
export { renderers } from '../../renderers.mjs';

const createPageSchema = object({
  title: string().min(1, "ชื่อหน้าห้ามว่าง"),
  slug: string().min(1),
  contentBlocks: array(any()).default([]),
  status: _enum(["draft", "published", "scheduled"]).default("draft"),
  seoTitle: string().optional(),
  seoDescription: string().optional(),
  customCss: string().optional()
});
const GET = async ({ locals }) => {
  try {
    const allPages = await locals.db.select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      updatedAt: pages.updatedAt,
      createdAt: pages.createdAt
    }).from(pages).orderBy(desc(pages.updatedAt));
    return Response.json({ success: true, data: allPages });
  } catch (error) {
    console.error("[Pages API] List error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const body = createPageSchema.parse(await request.json());
    const id = crypto.randomUUID();
    await locals.db.insert(pages).values({
      id,
      title: body.title,
      slug: body.slug,
      status: body.status,
      contentBlocks: body.contentBlocks,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      customCss: body.customCss ?? null,
      createdBy: locals.user?.id ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "create",
      entityType: "page",
      entityId: id,
      metadata: { title: body.title }
    });
    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Pages API] Create error:", error);
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
