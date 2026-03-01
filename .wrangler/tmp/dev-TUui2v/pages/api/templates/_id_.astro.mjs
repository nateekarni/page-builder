globalThis.process ??= {}; globalThis.process.env ??= {};
import { G as templates } from '../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const DELETE = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: "Missing ID" }, { status: 400 });
  try {
    await locals.db.delete(templates).where(eq(templates.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "delete",
      entityType: "template",
      entityId: id
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[Templates API] Delete error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
