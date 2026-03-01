globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CD2jnfAQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_CooD1Pxy.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Users = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49", "activeNav": "users" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "UserManagement", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Projects/portfolio-builder/src/components/react/admin/UserManagement", "client:component-export": "default" })} ` })}`;
}, "D:/Projects/portfolio-builder/src/pages/admin/users.astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/users.astro";
const $$url = "/admin/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
