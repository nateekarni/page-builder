globalThis.process ??= {}; globalThis.process.env ??= {};
import { u as user } from '../../chunks/schema_HDzOIqy1.mjs';
import { c as createAuth } from '../../chunks/auth_BEuxYfJh.mjs';
import { l as logActivity } from '../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, _ as _enum, s as string, Z as ZodError } from '../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const createUserSchema = object({
  name: string().min(1, "ชื่อห้ามว่าง"),
  email: string().email("อีเมลไม่ถูกต้อง"),
  password: string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  role: _enum(["admin", "editor", "author"]).default("author")
});
const GET = async ({ locals }) => {
  try {
    const users = await locals.db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt
    }).from(user);
    return Response.json({ success: true, data: users });
  } catch (error) {
    console.error("[Users API] List error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const body = createUserSchema.parse(await request.json());
    const auth = createAuth(locals.runtime.env.DB);
    const result = await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: body.password
      }
    });
    if (!result) {
      return Response.json({ success: false, error: "ไม่สามารถสร้างผู้ใช้ได้" }, { status: 400 });
    }
    if (body.role !== "author") {
      await locals.db.update(user).set({ role: body.role }).where(eq(user.email, body.email));
    }
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "create",
      entityType: "user",
      entityId: body.email,
      metadata: { name: body.name, role: body.role }
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Users API] Create error:", error);
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
