globalThis.process ??= {}; globalThis.process.env ??= {};
import { u as user, e as pageRevisions, p as pages } from '../../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../../chunks/activity-log_Dp9wn7X1.mjs';
import { e as eq } from '../../../../chunks/conditions_Dv2B9G-F.mjs';
import { d as desc } from '../../../../chunks/select_dqRfph0M.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params, locals }) => {
  const pageId = params.id;
  if (!pageId) return Response.json({ success: false, error: "Missing page ID" }, { status: 400 });
  try {
    const revisions = await locals.db.select({
      id: pageRevisions.id,
      revisionNumber: pageRevisions.revisionNumber,
      title: pageRevisions.title,
      note: pageRevisions.note,
      createdAt: pageRevisions.createdAt,
      createdBy: user.name
    }).from(pageRevisions).leftJoin(user, eq(pageRevisions.createdBy, user.id)).where(eq(pageRevisions.pageId, pageId)).orderBy(desc(pageRevisions.revisionNumber)).limit(50);
    return Response.json({ success: true, data: revisions });
  } catch (error) {
    console.error("[Revisions API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const POST = async ({ params, request, locals }) => {
  const pageId = params.id;
  if (!pageId) return Response.json({ success: false, error: "Missing page ID" }, { status: 400 });
  try {
    const { revisionId } = await request.json();
    if (!revisionId) return Response.json({ success: false, error: "Missing revision ID" }, { status: 400 });
    const revision = await locals.db.select().from(pageRevisions).where(eq(pageRevisions.id, revisionId)).limit(1);
    if (!revision[0]) return Response.json({ success: false, error: "Revision not found" }, { status: 404 });
    await locals.db.update(pages).set({
      title: revision[0].title,
      contentBlocks: revision[0].contentBlocks,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(pages.id, pageId));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "restore",
      entityType: "page",
      entityId: pageId,
      metadata: { revisionNumber: revision[0].revisionNumber }
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[Revisions API] Restore error:", error);
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
