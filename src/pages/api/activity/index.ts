/**
 * Activity Log API
 *
 * GET /api/activity → list recent activity (admin only)
 * Query params: ?limit=20&entityType=page
 */

import type { APIRoute } from 'astro';
import { activityLog, user } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 100);
    const entityType = url.searchParams.get('entityType');

    let query = locals.db
      .select({
        id: activityLog.id,
        action: activityLog.action,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        metadata: activityLog.metadata,
        createdAt: activityLog.createdAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    if (entityType) {
      query = query.where(eq(activityLog.entityType, entityType)) as typeof query;
    }

    const activities = await query;

    return Response.json({ success: true, data: activities });
  } catch (error) {
    console.error('[Activity API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
