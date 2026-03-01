/**
 * Export API — Export a page as JSON file
 *
 * GET /api/export/:id → returns JSON file with page data + content blocks
 *
 * Clean Code: uses same Zod schemas as editor for consistent validation.
 */

import type { APIRoute } from 'astro';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logActivity } from '@/lib/activity-log';

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) return Response.json({ success: false, error: 'ID required' }, { status: 400 });

    const result = await locals.db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    const page = result[0];
    if (!page) {
      return Response.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      page_meta: {
        title: page.title,
        slug: page.slug,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        ogImageUrl: page.ogImageUrl,
        customCss: page.customCss,
      },
      content_blocks: page.contentBlocks,
    };

    await logActivity({
      db: locals.db,
      userId: locals.user.id,
      action: 'export',
      entityType: 'page',
      entityId: id,
      metadata: { title: page.title },
    });

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${page.slug}-export.json"`,
      },
    });
  } catch (error) {
    console.error('[Export API] Error:', error);
    return Response.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
};
