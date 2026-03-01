globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, k as renderComponent, h as addAttribute, r as renderTemplate, u as unescapeHTML, n as renderHead, l as renderScript } from '../chunks/astro/server_CD2jnfAQ.mjs';
import { c as abTests, p as pages, d as siteSettings } from '../chunks/schema_HDzOIqy1.mjs';
import { d as designTokensSchema, g as getDefaultTokens, a as generateTokenCSS, $ as $$SEOHead, b as $$Header, c as $$BlockRenderer, e as $$Footer } from '../chunks/Footer_LhiNhtnV.mjs';
import { u as and, e as eq } from '../chunks/conditions_Dv2B9G-F.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const COOKIE_PREFIX = "ab_variant_";
const COOKIE_MAX_AGE_DAYS = 30;
async function selectVariant({
  db,
  pageId,
  defaultBlocks,
  cookies
}) {
  try {
    const activeTests = await db.select().from(abTests).where(and(eq(abTests.pageId, pageId), eq(abTests.status, "running"))).limit(1);
    const test = activeTests[0];
    if (!test) return defaultBlocks;
    const variants = test.variants;
    if (!variants || variants.length === 0) return defaultBlocks;
    const cookieName = `${COOKIE_PREFIX}${test.id}`;
    const existingCookie = cookies.get(cookieName);
    if (existingCookie?.value) {
      const assignedVariant = variants.find((v) => v.id === existingCookie.value);
      if (assignedVariant) {
        return assignedVariant.content_blocks;
      }
    }
    const selectedVariant = assignVariant(variants, test.trafficSplit);
    if (!selectedVariant) return defaultBlocks;
    cookies.set(cookieName, selectedVariant.id, {
      path: "/",
      maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
      httpOnly: true,
      sameSite: "lax"
    });
    return selectedVariant.content_blocks;
  } catch {
    return defaultBlocks;
  }
}
function assignVariant(variants, trafficSplit) {
  if (variants.length === 0) return null;
  if (variants.length === 1) return variants[0];
  const random = Math.random();
  return random < trafficSplit ? variants[0] : variants[1];
}

const $$Astro = createAstro("https://page-builder-1tl.pages.dev/");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const db = Astro2.locals.db;
  if (!slug) {
    return Astro2.redirect("/");
  }
  const pageResult = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.status, "published"))).limit(1);
  const page = pageResult[0];
  if (!page) {
    return new Response(null, { status: 404, statusText: "Not Found" });
  }
  const settingsRows = await db.select().from(siteSettings);
  const settingsMap = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));
  const tokensRaw = settingsMap["design_tokens"];
  const tokens = tokensRaw ? designTokensSchema.parse(tokensRaw) : getDefaultTokens();
  const tokenCSS = generateTokenCSS(tokens);
  const siteIdentity = settingsMap["site_identity"] ?? {};
  const siteName = siteIdentity.name ?? "Aglow";
  const siteLogo = siteIdentity.logo ?? "";
  const siteTagline = siteIdentity.tagline ?? "";
  const socialLinks = settingsMap["social_links"] ?? { links: [] };
  const navSettings = settingsMap["navigation"] ?? { links: [] };
  const navLinks = navSettings.links ?? [];
  const contentBlocks = await selectVariant({
    db,
    pageId: page.id,
    defaultBlocks: page.contentBlocks,
    cookies: Astro2.cookies
  });
  const pageTitle = page.seoTitle || page.title;
  const pageDescription = page.seoDescription || "";
  const ogImage = page.ogImageUrl || "";
  const canonicalUrl = new URL(`/${slug}`, Astro2.site || "https://localhost").href;
  const headingFont = tokens.typography.headingFont;
  const bodyFont = tokens.typography.bodyFont;
  const fontsSet = new Set([headingFont, bodyFont].filter(Boolean));
  const googleFontsUrl = fontsSet.size > 0 ? `https://fonts.googleapis.com/css2?${[...fontsSet].map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join("&")}&display=swap` : "";
  return renderTemplate`<html lang="th" data-astro-cid-yvbahnfj> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${renderComponent($$result, "SEOHead", $$SEOHead, { "title": pageTitle, "description": pageDescription, "ogImage": ogImage, "canonicalUrl": canonicalUrl, "siteName": siteName, "data-astro-cid-yvbahnfj": true })}${googleFontsUrl && renderTemplate`<link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link${addAttribute(googleFontsUrl, "href")} rel="stylesheet">`}<style>${unescapeHTML(tokenCSS)}</style>${page.customCss && renderTemplate`<style>${unescapeHTML(page.customCss)}</style>`}${renderHead()}</head> <body data-astro-cid-yvbahnfj> ${renderComponent($$result, "Header", $$Header, { "siteName": siteName, "logo": siteLogo, "navLinks": navLinks, "data-astro-cid-yvbahnfj": true })} <main data-astro-cid-yvbahnfj> ${renderComponent($$result, "BlockRenderer", $$BlockRenderer, { "blocks": contentBlocks, "data-astro-cid-yvbahnfj": true })} </main> ${renderComponent($$result, "Footer", $$Footer, { "siteName": siteName, "tagline": siteTagline, "socialLinks": socialLinks, "data-astro-cid-yvbahnfj": true })} ${renderScript($$result, "D:/Projects/portfolio-builder/src/pages/[slug].astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "D:/Projects/portfolio-builder/src/pages/[slug].astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/[slug].astro";
const $$url = "/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
