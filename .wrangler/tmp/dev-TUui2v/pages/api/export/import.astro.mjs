globalThis.process ??= {}; globalThis.process.env ??= {};
import { p as pages } from '../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, a as array, s as string, _ as _enum, Z as ZodError, b as any } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const importSchema = object({
  version: string(),
  page_meta: object({
    title: string().min(1),
    slug: string().min(1),
    status: _enum(["draft", "published", "scheduled"]).default("draft"),
    seoTitle: string().nullable().optional(),
    seoDescription: string().nullable().optional(),
    ogImageUrl: string().nullable().optional(),
    customCss: string().nullable().optional()
  }),
  content_blocks: array(any()).default([])
});
const POST = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = importSchema.parse(await request.json());
    let slug = body.page_meta.slug;
    const existingSlug = await locals.db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug)).limit(1);
    if (existingSlug.length > 0) {
      slug = `${slug}-imported-${Date.now()}`;
    }
    const id = crypto.randomUUID();
    await locals.db.insert(pages).values({
      id,
      title: body.page_meta.title,
      slug,
      status: "draft",
      // Always import as draft for safety
      contentBlocks: body.content_blocks,
      seoTitle: body.page_meta.seoTitle ?? null,
      seoDescription: body.page_meta.seoDescription ?? null,
      ogImageUrl: body.page_meta.ogImageUrl ?? null,
      customCss: body.page_meta.customCss ?? null,
      createdBy: locals.user.id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    await logActivity({
      db: locals.db,
      userId: locals.user.id,
      action: "import",
      entityType: "page",
      entityId: id,
      metadata: { title: body.page_meta.title, originalSlug: body.page_meta.slug }
    });
    return Response.json({ success: true, data: { id, slug } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Import API] Error:", error);
    return Response.json({ success: false, error: "Import failed" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
