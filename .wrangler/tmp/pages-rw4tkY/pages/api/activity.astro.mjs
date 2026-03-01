globalThis.process ??= {}; globalThis.process.env ??= {};
import { u as user, b as activityLog } from '../../chunks/schema_HDzOIqy1.mjs';
import { e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
import { d as desc } from '../../chunks/select_dqRfph0M.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, locals }) => {
  try {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const entityType = url.searchParams.get("entityType");
    let query = locals.db.select({
      id: activityLog.id,
      action: activityLog.action,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      userName: user.name,
      userImage: user.image
    }).from(activityLog).leftJoin(user, eq(activityLog.userId, user.id)).orderBy(desc(activityLog.createdAt)).limit(limit);
    if (entityType) {
      query = query.where(eq(activityLog.entityType, entityType));
    }
    const activities = await query;
    return Response.json({ success: true, data: activities });
  } catch (error) {
    console.error("[Activity API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
