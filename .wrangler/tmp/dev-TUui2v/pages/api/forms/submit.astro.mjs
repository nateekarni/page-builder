globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as formSubmissions } from '../../../chunks/schema_HDzOIqy1.mjs';
import { o as object, r as record, u as unknown, s as string, Z as ZodError } from '../../../chunks/schemas_CNsE_rud.mjs';
import { e as eq } from '../../../chunks/conditions_Dv2B9G-F.mjs';
import { d as desc } from '../../../chunks/select_dqRfph0M.mjs';
export { renderers } from '../../../renderers.mjs';

const submitFormSchema = object({
  formBlockId: string().min(1),
  pageId: string().min(1),
  data: record(string(), unknown())
});
const POST = async ({ request, locals }) => {
  try {
    const body = submitFormSchema.parse(await request.json());
    const id = crypto.randomUUID();
    await locals.db.insert(formSubmissions).values({
      id,
      formBlockId: body.formBlockId,
      pageId: body.pageId,
      data: body.data
    });
    return Response.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error("[Form Submit] Error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
};
const GET = async ({ url, locals }) => {
  const formBlockId = url.searchParams.get("formBlockId");
  if (!formBlockId) return Response.json({ success: false, error: "Missing formBlockId" }, { status: 400 });
  try {
    const submissions = await locals.db.select().from(formSubmissions).where(eq(formSubmissions.formBlockId, formBlockId)).orderBy(desc(formSubmissions.createdAt)).limit(100);
    return Response.json({ success: true, data: submissions });
  } catch (error) {
    console.error("[Form Submit] List error:", error);
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
