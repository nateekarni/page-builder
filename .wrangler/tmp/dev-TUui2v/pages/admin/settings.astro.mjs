globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CD2jnfAQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_CooD1Pxy.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Settings = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32\u0E40\u0E27\u0E47\u0E1A\u0E44\u0E0B\u0E15\u0E4C", "activeNav": "settings" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SiteSettings", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Projects/portfolio-builder/src/components/react/admin/SiteSettings", "client:component-export": "default" })} ` })}`;
}, "D:/Projects/portfolio-builder/src/pages/admin/settings.astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/settings.astro";
const $$url = "/admin/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
