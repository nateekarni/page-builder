globalThis.process ??= {}; globalThis.process.env ??= {};
import { m as media } from '../../../chunks/schema_HDzOIqy1.mjs';
import { d as deleteFromR2 } from '../../../chunks/r2_DO1IbRUH.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, s as string, Z as ZodError } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const updateMediaSchema = object({
  altText: string().optional(),
  filename: string().min(1).optional()
});
const PUT = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: "Missing ID" }, { status: 400 });
  try {
    const body = updateMediaSchema.parse(await request.json());
    const updateData = {};
    if (body.altText !== void 0) updateData.altText = body.altText;
    if (body.filename !== void 0) updateData.filename = body.filename;
    await locals.db.update(media).set(updateData).where(eq(media.id, id));
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Media API] Update error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const DELETE = async ({ params, locals }) => {
  const { id } = params;
  if (!id) return Response.json({ success: false, error: "Missing ID" }, { status: 400 });
  try {
    const item = await locals.db.select({ r2Key: media.r2Key }).from(media).where(eq(media.id, id)).limit(1);
    if (!item[0]) {
      return Response.json({ success: false, error: "Not found" }, { status: 404 });
    }
    await deleteFromR2(locals.runtime.env.R2, item[0].r2Key);
    await locals.db.delete(media).where(eq(media.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "delete",
      entityType: "media",
      entityId: id
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[Media API] Delete error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
