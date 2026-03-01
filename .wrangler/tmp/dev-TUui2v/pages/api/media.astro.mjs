globalThis.process ??= {}; globalThis.process.env ??= {};
import { m as media, a as sql } from '../../chunks/schema_HDzOIqy1.mjs';
import { d as desc } from '../../chunks/select_dqRfph0M.mjs';
import { l as like } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const search = url.searchParams.get("search") ?? "";
    const mimeFilter = url.searchParams.get("type") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;
    let query = locals.db.select().from(media).orderBy(desc(media.createdAt)).limit(limit).offset(offset);
    if (search) {
      query = query.where(like(media.filename, `%${search}%`));
    }
    if (mimeFilter) {
      query = query.where(like(media.mimeType, `${mimeFilter}%`));
    }
    const items = await query;
    const totalResult = await locals.db.select({ count: sql`count(*)` }).from(media);
    const total = totalResult[0]?.count ?? 0;
    return Response.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("[Media API] List error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
