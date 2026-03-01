globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createAuth } from '../../../chunks/auth_BEuxYfJh.mjs';
export { renderers } from '../../../renderers.mjs';

const handleAuthRequest = async ({ request, locals }) => {
  const auth = createAuth(locals.runtime.env.DB, request);
  return auth.handler(request);
};
const ALL = handleAuthRequest;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
