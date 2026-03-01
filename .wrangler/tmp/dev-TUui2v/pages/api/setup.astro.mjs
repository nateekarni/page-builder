globalThis.process ??= {}; globalThis.process.env ??= {};
import { u as user } from '../../chunks/schema_HDzOIqy1.mjs';
import { c as createAuth } from '../../chunks/auth_BEuxYfJh.mjs';
import { o as object, s as string, Z as ZodError } from '../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const setupSchema = object({
  name: string().min(1, "Name is required"),
  email: string().email("Invalid email"),
  password: string().min(8, "Password must be at least 8 characters")
});
const POST = async ({ request, locals }) => {
  try {
    const adminUsers = await locals.db.select().from(user).where(eq(user.role, "admin")).limit(1);
    if (adminUsers.length > 0) {
      return Response.json(
        { success: false, error: "Setup locked. An admin already exists." },
        { status: 403 }
      );
    }
    const body = setupSchema.parse(await request.json());
    const auth = createAuth(locals.runtime.env.DB, request);
    const result = await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: body.password
      },
      headers: new Headers({
        "content-type": "application/json"
      })
    });
    if (!result) {
      return Response.json({ success: false, error: "Failed to create user" }, { status: 400 });
    }
    await locals.db.update(user).set({ role: "admin" }).where(eq(user.email, body.email));
    return Response.json({ success: true, message: "Initial Admin created successfully. Endpoint is now locked." }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Setup API] Error:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
