globalThis.process ??= {}; globalThis.process.env ??= {};
import { m as media } from '../../../chunks/schema_HDzOIqy1.mjs';
import { v as validateUploadFile, g as generateR2Key, u as uploadToR2 } from '../../../chunks/r2_DO1IbRUH.mjs';
import { l as logActivity } from '../../../chunks/activity-log_Dp9wn7X1.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return Response.json({ success: false, error: "ไม่พบไฟล์" }, { status: 400 });
    }
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      return Response.json({ success: false, error: validation.error }, { status: 400 });
    }
    const r2Key = generateR2Key(file.name);
    const r2 = locals.runtime.env.R2;
    await uploadToR2(r2, file, r2Key);
    const publicUrl = `/media/${r2Key}`;
    const width = Number(formData.get("width")) || null;
    const height = Number(formData.get("height")) || null;
    const altText = formData.get("alt") || "";
    const id = crypto.randomUUID();
    await locals.db.insert(media).values({
      id,
      filename: file.name,
      url: publicUrl,
      r2Key,
      altText,
      mimeType: file.type,
      sizeBytes: file.size,
      width,
      height,
      uploadedBy: locals.user?.id ?? null,
      createdAt: /* @__PURE__ */ new Date()
    });
    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: "upload",
      entityType: "media",
      entityId: id,
      metadata: { filename: file.name, mimeType: file.type }
    });
    return Response.json({
      success: true,
      data: { id, url: publicUrl, filename: file.name, width, height }
    }, { status: 201 });
  } catch (error) {
    console.error("[Media Upload] Error:", error);
    return Response.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
