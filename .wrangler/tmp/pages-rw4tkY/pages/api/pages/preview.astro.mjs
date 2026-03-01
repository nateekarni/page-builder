globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as siteSettings } from '../../../chunks/schema_HDzOIqy1.mjs';
import { o as object, s as string, a as array, Z as ZodError, b as any } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../../renderers.mjs';

const previewSchema = object({
  blocks: array(any()),
  title: string().optional()
});
const POST = async ({ request, locals }) => {
  try {
    const body = previewSchema.parse(await request.json());
    const tokensSetting = await locals.db.select().from(siteSettings).where(eq(siteSettings.key, "design_tokens")).limit(1);
    const tokens = tokensSetting[0]?.value;
    const colors = tokens?.colors ?? {};
    const typography = tokens?.typography ?? {};
    const cssVars = Object.entries(colors).map(([key, val]) => `--color-${key}: ${val};`).join("\n  ");
    const fontVars = `--font-heading: '${typography.headingFont || "Inter"}', sans-serif;
  --font-body: '${typography.bodyFont || "Inter"}', sans-serif;
  --font-size-base: ${typography.baseFontSize || "16px"};`;
    const blocksHtml = body.blocks.map((block) => renderBlockToHtml(block)).join("\n");
    const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${body.title ?? "Preview"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      ${cssVars}
      ${fontVars}
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-body); font-size: var(--font-size-base); color: var(--color-foreground, #0F172A); background: var(--color-background, #FFF); line-height: 1.6; }
    img { max-width: 100%; height: auto; }
    .block { margin-bottom: 1rem; }
  </style>
</head>
<body>
  ${blocksHtml}
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Preview API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
function renderBlockToHtml(block) {
  const props = block.props ?? {};
  const id = block.id ?? "";
  const customCss = props.customCSS ? `<style>.block-${id} { ${props.customCSS} }</style>` : "";
  switch (block.type) {
    case "text": {
      const tag = props.tag || "p";
      return `${customCss}<${tag} class="block block-${id}">${props.content ?? ""}</${tag}>`;
    }
    case "image":
      return `${customCss}<figure class="block block-${id}"><img src="${props.src ?? ""}" alt="${props.alt ?? ""}" />${props.caption ? `<figcaption>${props.caption}</figcaption>` : ""}</figure>`;
    case "hero":
      return `${customCss}<section class="block block-${id}" style="padding:4rem 2rem;text-align:center;background:linear-gradient(135deg,#1E293B,#334155);color:#FFF;${props.backgroundImage ? `background-image:url(${props.backgroundImage});background-size:cover;` : ""}"><h1 style="font-size:2.5rem;font-weight:700;">${props.title ?? ""}</h1>${props.subtitle ? `<p style="font-size:1.125rem;color:#CBD5E1;margin-top:0.5rem;">${props.subtitle}</p>` : ""}${props.ctaText ? `<a href="${props.ctaUrl || "#"}" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 2rem;background:#3B82F6;color:#FFF;border-radius:0.5rem;text-decoration:none;font-weight:600;">${props.ctaText}</a>` : ""}</section>`;
    case "cta":
      return `${customCss}<a class="block block-${id}" href="${props.url || "#"}" style="display:inline-block;padding:0.625rem 1.5rem;background:#3B82F6;color:#FFF;border-radius:0.5rem;font-weight:600;text-decoration:none;">${props.text ?? "Click"}</a>`;
    case "spacer":
      return `<div class="block block-${id}" style="height:${props.height ?? 40}px;"></div>`;
    case "divider":
      return `<hr class="block block-${id}" style="border:none;border-top:1px ${props.style || "solid"} ${props.color || "#E2E8F0"};margin:1rem 0;" />`;
    case "video":
      return `${customCss}<div class="block block-${id}" style="aspect-ratio:${props.aspectRatio || "16/9"};"><iframe src="${props.url ?? ""}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe></div>`;
    case "code":
      return `${customCss}<pre class="block block-${id}" style="background:#1E293B;color:#E2E8F0;padding:1rem;border-radius:0.5rem;overflow:auto;"><code>${escapeHtml(props.code ?? "")}</code></pre>`;
    case "testimonial":
      return `${customCss}<blockquote class="block block-${id}" style="border-left:4px solid #3B82F6;padding:1.5rem;background:#F1F5F9;border-radius:0 0.5rem 0.5rem 0;"><p style="font-style:italic;">"${props.quote ?? ""}"</p><footer><strong>${props.author ?? ""}</strong>${props.role ? `<br><span style="color:#64748B;">${props.role}</span>` : ""}</footer></blockquote>`;
    case "icon-box":
      return `${customCss}<div class="block block-${id}" style="text-align:center;padding:1.5rem;"><span style="font-size:2rem;">${props.icon ?? "⭐"}</span><h4 style="margin:0.5rem 0 0.25rem;">${props.title ?? ""}</h4><p style="color:#64748B;font-size:0.875rem;">${props.description ?? ""}</p></div>`;
    case "container":
    case "columns":
    case "accordion":
    case "tabs":
      return `${customCss}<div class="block block-${id}">${(block.children ?? []).map((c) => renderBlockToHtml(c)).join("\n")}</div>`;
    case "form":
      return `${customCss}<form class="block block-${id}" style="padding:1.5rem;border:1px solid #E2E8F0;border-radius:0.5rem;"><h3>${props.formTitle ?? "ฟอร์ม"}</h3><button type="submit" style="margin-top:1rem;padding:0.5rem 1.5rem;background:#3B82F6;color:#FFF;border:none;border-radius:0.375rem;cursor:pointer;">${props.submitText ?? "ส่ง"}</button></form>`;
    case "map":
      return `${customCss}<iframe class="block block-${id}" src="${props.embedUrl ?? ""}" style="width:100%;height:${props.height ?? 400}px;border:none;border-radius:0.375rem;" allowfullscreen loading="lazy"></iframe>`;
    default:
      return `<div class="block block-${id}"><!-- ${block.type} --></div>`;
  }
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
