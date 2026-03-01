globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as siteSettings } from '../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, r as record, u as unknown, s as string, Z as ZodError } from '../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const upsertSettingSchema = object({
  key: string().min(1),
  value: record(string(), unknown())
});
const GET = async ({ url, locals }) => {
  try {
    const key = url.searchParams.get("key");
    if (key) {
      const setting = await locals.db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
      return Response.json({
        success: true,
        data: setting[0]?.value ?? null
      });
    }
    const allSettings = await locals.db.select().from(siteSettings);
    const settingsMap = Object.fromEntries(
      allSettings.map((s) => [s.key, s.value])
    );
    return Response.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error("[Settings API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const PUT = async ({ request, locals }) => {
  try {
    const body = upsertSettingSchema.parse(await request.json());
    const existing = await locals.db.select().from(siteSettings).where(eq(siteSettings.key, body.key)).limit(1);
    if (existing.length > 0) {
      await locals.db.update(siteSettings).set({ value: body.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteSettings.key, body.key));
    } else {
      await locals.db.insert(siteSettings).values({
        id: crypto.randomUUID(),
        key: body.key,
        value: body.value,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "settings_update",
      entityType: "settings",
      entityId: body.key
    });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Settings API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
