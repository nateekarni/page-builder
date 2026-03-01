/**
 * Translations API — CRUD for page translations
 *
 * GET  /api/translations?pageId=xxx          → list translations for a page
 * GET  /api/translations?pageId=xxx&locale=th → get specific translation
 * POST /api/translations                      → create/update translation
 *
 * Clean Code: thin controller, validate → delegate → respond.
 */

import type { APIRoute } from 'astro';
import { translations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-log';

const upsertTranslationSchema = z.object({
  pageId: z.string().min(1),
  locale: z.string().min(2).max(5),
  title: z.string().min(1),
  slug: z.string().min(1),
  contentBlocks: z.array(z.any()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const pageId = url.searchParams.get('pageId');
    const locale = url.searchParams.get('locale');

    if (!pageId) {
      return Response.json({ success: false, error: 'pageId is required' }, { status: 400 });
    }

    if (locale) {
      const result = await locals.db
        .select()
        .from(translations)
        .where(and(eq(translations.pageId, pageId), eq(translations.locale, locale)))
        .limit(1);

      return Response.json({ success: true, data: result[0] ?? null });
    }

    const allTranslations = await locals.db
      .select()
      .from(translations)
      .where(eq(translations.pageId, pageId));

    return Response.json({ success: true, data: allTranslations });
  } catch (error) {
    console.error('[Translations API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = upsertTranslationSchema.parse(await request.json());

    const existing = await locals.db
      .select()
      .from(translations)
      .where(and(eq(translations.pageId, body.pageId), eq(translations.locale, body.locale)))
      .limit(1);

    if (existing.length > 0) {
      await locals.db
        .update(translations)
        .set({
          title: body.title,
          slug: body.slug,
          contentBlocks: body.contentBlocks,
          seoTitle: body.seoTitle ?? null,
          seoDescription: body.seoDescription ?? null,
          updatedAt: new Date(),
        })
        .where(eq(translations.id, existing[0].id));
    } else {
      await locals.db.insert(translations).values({
        id: crypto.randomUUID(),
        pageId: body.pageId,
        locale: body.locale,
        title: body.title,
        slug: body.slug,
        contentBlocks: body.contentBlocks,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'upsert',
      entityType: 'translation',
      entityId: body.pageId,
      metadata: { locale: body.locale },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, errors: error.flatten() }, { status: 400 });
    }
    console.error('[Translations API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
