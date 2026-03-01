globalThis.process ??= {}; globalThis.process.env ??= {};
import { p as pages } from '../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    if (!id) return Response.json({ success: false, error: "ID required" }, { status: 400 });
    const result = await locals.db.select().from(pages).where(eq(pages.id, id)).limit(1);
    const page = result[0];
    if (!page) {
      return Response.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    const exportData = {
      version: "1.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      page_meta: {
        title: page.title,
        slug: page.slug,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        ogImageUrl: page.ogImageUrl,
        customCss: page.customCss
      },
      content_blocks: page.contentBlocks
    };
    await logActivity({
      db: locals.db,
      userId: locals.user.id,
      action: "export",
      entityType: "page",
      entityId: id,
      metadata: { title: page.title }
    });
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${page.slug}-export.json"`
      }
    });
  } catch (error) {
    console.error("[Export API] Error:", error);
    return Response.json({ success: false, error: "Export failed" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
