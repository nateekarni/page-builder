/**
 * Revisions API — List & Restore
 *
 * GET  /api/pages/[id]/revisions → list revisions (timeline)
 * POST /api/pages/[id]/revisions/restore → restore a revision
 */

import type { APIRoute } from 'astro';
import { pageRevisions, pages, user } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logActivity } from '@/lib/activity-log';

export const GET: APIRoute = async ({ params, locals }) => {
  const pageId = params.id;
  if (!pageId) return Response.json({ success: false, error: 'Missing page ID' }, { status: 400 });

  try {
    const revisions = await locals.db
      .select({
        id: pageRevisions.id,
        revisionNumber: pageRevisions.revisionNumber,
        title: pageRevisions.title,
        note: pageRevisions.note,
        createdAt: pageRevisions.createdAt,
        createdBy: user.name,
      })
      .from(pageRevisions)
      .leftJoin(user, eq(pageRevisions.createdBy, user.id))
      .where(eq(pageRevisions.pageId, pageId))
      .orderBy(desc(pageRevisions.revisionNumber))
      .limit(50);

    return Response.json({ success: true, data: revisions });
  } catch (error) {
    console.error('[Revisions API] Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const pageId = params.id;
  if (!pageId) return Response.json({ success: false, error: 'Missing page ID' }, { status: 400 });

  try {
    const { revisionId } = await request.json();
    if (!revisionId) return Response.json({ success: false, error: 'Missing revision ID' }, { status: 400 });

    // Fetch the revision
    const revision = await locals.db
      .select()
      .from(pageRevisions)
      .where(eq(pageRevisions.id, revisionId))
      .limit(1);

    if (!revision[0]) return Response.json({ success: false, error: 'Revision not found' }, { status: 404 });

    // Restore: overwrite current page content
    await locals.db.update(pages).set({
      title: revision[0].title,
      contentBlocks: revision[0].contentBlocks,
      updatedAt: new Date(),
    }).where(eq(pages.id, pageId));

    await logActivity({
      db: locals.db,
      userId: locals.user?.id ?? null,
      action: 'restore',
      entityType: 'page',
      entityId: pageId,
      metadata: { revisionNumber: revision[0].revisionNumber },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Revisions API] Restore error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
