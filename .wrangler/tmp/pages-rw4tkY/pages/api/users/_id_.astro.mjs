globalThis.process ??= {}; globalThis.process.env ??= {};
import { u as user } from '../../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, _ as _enum, s as string, Z as ZodError } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const updateUserSchema = object({
  name: string().min(1).optional(),
  role: _enum(["admin", "editor", "author"]).optional()
});
const PUT = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) {
    return Response.json({ success: false, error: "Missing user ID" }, { status: 400 });
  }
  try {
    const body = updateUserSchema.parse(await request.json());
    if (body.role && id === locals.user?.id) {
      return Response.json({ success: false, error: "ไม่สามารถเปลี่ยน role ตัวเองได้" }, { status: 400 });
    }
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;
    await locals.db.update(user).set(updateData).where(eq(user.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "update",
      entityType: "user",
      entityId: id,
      metadata: body
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Users API] Update error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const DELETE = async ({ params, locals }) => {
  const { id } = params;
  if (!id) {
    return Response.json({ success: false, error: "Missing user ID" }, { status: 400 });
  }
  if (id === locals.user?.id) {
    return Response.json({ success: false, error: "ไม่สามารถลบบัญชีตัวเองได้" }, { status: 400 });
  }
  try {
    await locals.db.delete(user).where(eq(user.id, id));
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "delete",
      entityType: "user",
      entityId: id
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[Users API] Delete error:", error);
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
