globalThis.process ??= {}; globalThis.process.env ??= {};
import { H as translations } from '../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, s as string, a as array, Z as ZodError, b as any } from '../../chunks/schemas_CNsE_rud.mjs';
import { u as and, e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const upsertTranslationSchema = object({
  pageId: string().min(1),
  locale: string().min(2).max(5),
  title: string().min(1),
  slug: string().min(1),
  contentBlocks: array(any()).default([]),
  seoTitle: string().optional(),
  seoDescription: string().optional()
});
const GET = async ({ url, locals }) => {
  try {
    const pageId = url.searchParams.get("pageId");
    const locale = url.searchParams.get("locale");
    if (!pageId) {
      return Response.json({ success: false, error: "pageId is required" }, { status: 400 });
    }
    if (locale) {
      const result = await locals.db.select().from(translations).where(and(eq(translations.pageId, pageId), eq(translations.locale, locale))).limit(1);
      return Response.json({ success: true, data: result[0] ?? null });
    }
    const allTranslations = await locals.db.select().from(translations).where(eq(translations.pageId, pageId));
    return Response.json({ success: true, data: allTranslations });
  } catch (error) {
    console.error("[Translations API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const body = upsertTranslationSchema.parse(await request.json());
    const existing = await locals.db.select().from(translations).where(and(eq(translations.pageId, body.pageId), eq(translations.locale, body.locale))).limit(1);
    if (existing.length > 0) {
      await locals.db.update(translations).set({
        title: body.title,
        slug: body.slug,
        contentBlocks: body.contentBlocks,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(translations.id, existing[0].id));
    } else {
      await locals.db.insert(translations).values({
        id: crypto.randomUUID(),
        pageId: body.pageId,
        locale: body.locale,
        title: body.title,
        slug: body.slug,
        contentBlocks: body.contentBlocks,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "upsert",
      entityType: "translation",
      entityId: body.pageId,
      metadata: { locale: body.locale }
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Translations API] Error:", error);
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
