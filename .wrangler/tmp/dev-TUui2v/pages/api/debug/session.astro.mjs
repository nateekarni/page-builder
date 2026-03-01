globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAuth } from '../../../chunks/auth_BEuxYfJh.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ request, locals }) => {
  const cookies = request.headers.get("cookie") ?? "(none)";
  try {
    const auth = createAuth(locals.runtime.env.DB);
    const session = await auth.api.getSession({ headers: request.headers });
    return Response.json({
      hasSession: !!session?.user,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      } : null,
      cookiesPresent: cookies
    });
  } catch (err) {
    return Response.json({
      hasSession: false,
      error: String(err),
      cookiesPresent: cookies
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
