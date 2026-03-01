globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CD2jnfAQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_CooD1Pxy.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Media = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E2A\u0E37\u0E48\u0E2D", "activeNav": "media" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MediaLibrary", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Projects/portfolio-builder/src/components/react/media/MediaLibrary", "client:component-export": "default" })} ` })}`;
}, "D:/Projects/portfolio-builder/src/pages/admin/media.astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/media.astro";
const $$url = "/admin/media";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Media,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
