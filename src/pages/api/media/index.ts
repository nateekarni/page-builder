/**
 * Media API — List & Search
 *
 * GET /api/media?search=x&type=image&page=1&limit=20
 *
 * Clean Code: thin controller, all filtering via query params.
 */

import type { APIRoute } from 'astro';
import { media } from '@/db/schema';
import { desc, like, eq, sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const search = url.searchParams.get('search') ?? '';
    const mimeFilter = url.searchParams.get('type') ?? '';
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    let query = locals.db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(limit)
      .offset(offset);

    if (search) {
      query = query.where(like(media.filename, `%${search}%`)) as typeof query;
    }

    if (mimeFilter) {
      query = query.where(like(media.mimeType, `${mimeFilter}%`)) as typeof query;
    }

    const items = await query;

    // Total count for pagination
    const totalResult = await locals.db
      .select({ count: sql<number>`count(*)` })
      .from(media);
    const total = totalResult[0]?.count ?? 0;

    return Response.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[Media API] List error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
