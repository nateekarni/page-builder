globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, h as addAttribute, k as renderComponent, r as renderTemplate, u as unescapeHTML, n as renderHead } from '../../chunks/astro/server_CD2jnfAQ.mjs';
import { H as translations, p as pages, d as siteSettings } from '../../chunks/schema_HDzOIqy1.mjs';
import { d as designTokensSchema, g as getDefaultTokens, a as generateTokenCSS, $ as $$SEOHead, b as $$Header, c as $$BlockRenderer, e as $$Footer } from '../../chunks/Footer_LhiNhtnV.mjs';
/* empty css                                     */
import { u as and, e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://page-builder-1tl.pages.dev/");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { locale, slug } = Astro2.params;
  const db = Astro2.locals.db;
  if (!locale || !slug) {
    return new Response(null, { status: 404, statusText: "Not Found" });
  }
  const SUPPORTED_LOCALES = ["th", "en", "ja", "zh", "ko"];
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return new Response(null, { status: 404, statusText: "Not Found" });
  }
  const translationResult = await db.select().from(translations).where(and(eq(translations.slug, slug), eq(translations.locale, locale))).limit(1);
  const translation = translationResult[0];
  if (!translation) {
    return Astro2.redirect(`/${slug}`);
  }
  const pageResult = await db.select().from(pages).where(and(eq(pages.id, translation.pageId), eq(pages.status, "published"))).limit(1);
  if (!pageResult[0]) {
    return new Response(null, { status: 404, statusText: "Not Found" });
  }
  const page = pageResult[0];
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
  const contentBlocks = translation.contentBlocks;
  const pageTitle = translation.seoTitle || translation.title;
  const pageDescription = translation.seoDescription || "";
  const canonicalUrl = new URL(`/${locale}/${slug}`, Astro2.site || "https://localhost").href;
  const allTranslations = await db.select({ locale: translations.locale, slug: translations.slug }).from(translations).where(eq(translations.pageId, translation.pageId));
  const hrefLangs = allTranslations.map((t) => ({
    locale: t.locale,
    url: new URL(`/${t.locale}/${t.slug}`, Astro2.site || "https://localhost").href
  }));
  hrefLangs.push({
    locale: "x-default",
    url: new URL(`/${page.slug}`, Astro2.site || "https://localhost").href
  });
  const headingFont = tokens.typography.headingFont;
  const bodyFont = tokens.typography.bodyFont;
  const fontsSet = new Set([headingFont, bodyFont].filter(Boolean));
  const googleFontsUrl = fontsSet.size > 0 ? `https://fonts.googleapis.com/css2?${[...fontsSet].map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join("&")}&display=swap` : "";
  return renderTemplate`<html${addAttribute(locale, "lang")} data-astro-cid-l5aoppyg> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${renderComponent($$result, "SEOHead", $$SEOHead, { "title": pageTitle, "description": pageDescription, "canonicalUrl": canonicalUrl, "siteName": siteName, "locale": locale === "th" ? "th_TH" : locale === "ja" ? "ja_JP" : `${locale}_${locale.toUpperCase()}`, "data-astro-cid-l5aoppyg": true })}${hrefLangs.map((hl) => renderTemplate`<link rel="alternate"${addAttribute(hl.locale, "hreflang")}${addAttribute(hl.url, "href")}>`)}${googleFontsUrl && renderTemplate`<link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link${addAttribute(googleFontsUrl, "href")} rel="stylesheet">`}<style>${unescapeHTML(tokenCSS)}</style>${page.customCss && renderTemplate`<style>${unescapeHTML(page.customCss)}</style>`}${renderHead()}</head> <body data-astro-cid-l5aoppyg> ${renderComponent($$result, "Header", $$Header, { "siteName": siteName, "logo": siteLogo, "navLinks": navLinks, "data-astro-cid-l5aoppyg": true })} <main data-astro-cid-l5aoppyg> ${renderComponent($$result, "BlockRenderer", $$BlockRenderer, { "blocks": contentBlocks, "data-astro-cid-l5aoppyg": true })} </main> ${renderComponent($$result, "Footer", $$Footer, { "siteName": siteName, "tagline": siteTagline, "socialLinks": socialLinks, "data-astro-cid-l5aoppyg": true })} </body></html>`;
}, "D:/Projects/portfolio-builder/src/pages/[locale]/[slug].astro", void 0);

const $$file = "D:/Projects/portfolio-builder/src/pages/[locale]/[slug].astro";
const $$url = "/[locale]/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
