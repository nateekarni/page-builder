globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../../chunks/astro/server_CD2jnfAQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_CooD1Pxy.mjs';
export { renderers } from '../../renderers.mjs';

const $$AbTests = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "A/B Testing", "activeNav": "ab-tests" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div id="ab-tests-root"></div> ${renderScript($$result2, "D:/Projects/portfolio-builder/src/pages/admin/ab-tests.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "D:/Projects/portfolio-builder/src/pages/admin/ab-tests.astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/admin/ab-tests.astro";
const $$url = "/admin/ab-tests";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AbTests,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
