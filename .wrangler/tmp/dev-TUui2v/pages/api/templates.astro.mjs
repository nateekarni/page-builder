globalThis.process ??= {}; globalThis.process.env ??= {};
import { G as templates } from '../../chunks/schema_HDzOIqy1.mjs';
import { l as logActivity } from '../../chunks/activity-log_Dp9wn7X1.mjs';
import { o as object, eR as boolean, s as string, a as array, Z as ZodError, b as any } from '../../chunks/schemas_CNsE_rud.mjs';
import { d as desc } from '../../chunks/select_dqRfph0M.mjs';
import { e as eq } from '../../chunks/conditions_Dv2B9G-F.mjs';
export { renderers } from '../../renderers.mjs';

const createTemplateSchema = object({
  name: string().min(1),
  description: string().optional(),
  contentBlocks: array(any()),
  category: string().optional(),
  isPattern: boolean().default(false)
});
const GET = async ({ url, locals }) => {
  try {
    const patternsOnly = url.searchParams.get("patterns") === "true";
    let query = locals.db.select().from(templates).orderBy(desc(templates.createdAt));
    if (patternsOnly) {
      query = query.where(eq(templates.isPattern, true));
    }
    const items = await query;
    return Response.json({ success: true, data: items });
  } catch (error) {
    console.error("[Templates API] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    const body = createTemplateSchema.parse(await request.json());
    const id = crypto.randomUUID();
    await locals.db.insert(templates).values({
      id,
      name: body.name,
      description: body.description ?? null,
      contentBlocks: body.contentBlocks,
      category: body.category ?? null,
      isPattern: body.isPattern
    });
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "create",
      entityType: "template",
      entityId: id,
      metadata: { name: body.name, isPattern: body.isPattern }
    });
    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Templates API] Create error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
