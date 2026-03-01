globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, n as renderHead, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CD2jnfAQ.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="th" data-astro-cid-rf56lckb> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>เข้าสู่ระบบ — Portfolio Builder</title>${renderHead()}</head> <body data-astro-cid-rf56lckb> ${renderComponent($$result, "LoginForm", null, { "client:only": "react", "client:component-hydration": "only", "data-astro-cid-rf56lckb": true, "client:component-path": "D:/Projects/portfolio-builder/src/components/react/auth/LoginForm", "client:component-export": "default" })} </body></html>`;
}, "D:/Projects/portfolio-builder/src/pages/admin/login.astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
