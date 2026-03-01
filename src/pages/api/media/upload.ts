/**
 * Media API — Upload
 *
 * POST /api/media/upload: multipart form → validate → upload R2 → save metadata D1
 *
 * Clean Code: validation → upload → persist — clear pipeline.
 */

import type { APIRoute } from 'astro';
import { media } from '@/db/schema';
import { generateR2Key, uploadToR2, validateUploadFile } from '@/lib/r2';
import { logActivity } from '@/lib/activity-log';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ success: false, error: 'ไม่พบไฟล์' }, { status: 400 });
    }

    // 1. Validate
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      return Response.json({ success: false, error: validation.error }, { status: 400 });
    }

    // 2. Upload to R2
    const r2Key = generateR2Key(file.name);
    const r2 = locals.runtime.env.R2;
    await uploadToR2(r2, file, r2Key);

    // 3. Build public URL (custom domain or R2 dev URL)
    const publicUrl = `/media/${r2Key}`;

    // 4. Extract dimensions (if image — will be set by client)
    const width = Number(formData.get('width')) || null;
    const height = Number(formData.get('height')) || null;
    const altText = (formData.get('alt') as string) || '';

    // 5. Save metadata to D1
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
      createdAt: new Date(),
    });

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'upload',
      entityType: 'media',
      entityId: id,
      metadata: { filename: file.name, mimeType: file.type },
    });

    return Response.json({
      success: true,
      data: { id, url: publicUrl, filename: file.name, width, height },
    }, { status: 201 });
  } catch (error) {
    console.error('[Media Upload] Error:', error);
    return Response.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
};
