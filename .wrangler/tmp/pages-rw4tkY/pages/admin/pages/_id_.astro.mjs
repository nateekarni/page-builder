globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, n as renderHead, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_CD2jnfAQ.mjs';
/* empty css                                      */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://page-builder-1tl.pages.dev/");
const prerender = false;
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const pageId = Astro2.params.id;
  return renderTemplate`<html lang="th" data-astro-cid-fmmaxvi5> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Page Editor — Aglow</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-fmmaxvi5> ${renderComponent($$result, "PageEditor", null, { "client:only": "react", "pageId": pageId, "client:component-hydration": "only", "data-astro-cid-fmmaxvi5": true, "client:component-path": "D:/Projects/portfolio-builder/src/components/react/editor/PageEditor", "client:component-export": "default" })} </body></html>`;
}, "D:/Projects/portfolio-builder/src/pages/admin/pages/[id].astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/pages/[id].astro";
const $$url = "/admin/pages/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
