/**
 * Settings API — Read & Write site settings
 *
 * GET  /api/settings?key=xxx → get single setting
 * GET  /api/settings         → get all settings
 * PUT  /api/settings         → upsert setting (admin/editor)
 *
 * Clean Code: thin controller, JSON key-value store pattern.
 */

import type { APIRoute } from 'astro';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const upsertSettingSchema = z.object({
  key: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const key = url.searchParams.get('key');

    if (key) {
      const setting = await locals.db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);

      return Response.json({
        success: true,
        data: setting[0]?.value ?? null,
      });
    }

    const allSettings = await locals.db.select().from(siteSettings);
    const settingsMap = Object.fromEntries(
      allSettings.map((s) => [s.key, s.value]),
    );

    return Response.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error('[Settings API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const body = upsertSettingSchema.parse(await request.json());

    // Upsert: check if exists → update or insert
    const existing = await locals.db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, body.key))
      .limit(1);

    if (existing.length > 0) {
      await locals.db
        .update(siteSettings)
        .set({ value: body.value, updatedAt: new Date() })
        .where(eq(siteSettings.key, body.key));
    } else {
      await locals.db.insert(siteSettings).values({
        id: crypto.randomUUID(),
        key: body.key,
        value: body.value,
        updatedAt: new Date(),
      });
    }

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'settings_update',
      entityType: 'settings',
      entityId: body.key,
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Settings API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
