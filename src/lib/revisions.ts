/**
 * Content Versioning — Pure utility for creating page revisions
 *
 * Clean Code: pure function in lib/ → called from save API.
 * No framework dependency, no side effects besides DB insert.
 */

import { pageRevisions } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

const MAX_REVISIONS_PER_PAGE = 50;

interface CreateRevisionParams {
  db: any;
  pageId: string;
  title: string;
  contentBlocks: unknown[];
  userId: string | null;
  note?: string;
}

/**
 * Create a new revision snapshot.
 * Auto-manages limit: oldest revisions beyond MAX are deleted.
 */
export async function createRevision({
  db,
  pageId,
  title,
  contentBlocks,
  userId,
  note,
}: CreateRevisionParams): Promise<string> {
  // Get next revision number
  const latest = await db
    .select({ revisionNumber: pageRevisions.revisionNumber })
    .from(pageRevisions)
    .where(eq(pageRevisions.pageId, pageId))
    .orderBy(desc(pageRevisions.revisionNumber))
    .limit(1);

  const nextRevision = (latest[0]?.revisionNumber ?? 0) + 1;

  const id = crypto.randomUUID();
  await db.insert(pageRevisions).values({
    id,
    pageId,
    title,
    contentBlocks,
    revisionNumber: nextRevision,
    note: note ?? null,
    createdBy: userId,
  });

  // Prune old revisions beyond limit
  const totalResult = await db
    .select({ total: count() })
    .from(pageRevisions)
    .where(eq(pageRevisions.pageId, pageId));

  const total = totalResult[0]?.total ?? 0;

  if (total > MAX_REVISIONS_PER_PAGE) {
    const oldRevisions = await db
      .select({ id: pageRevisions.id })
      .from(pageRevisions)
      .where(eq(pageRevisions.pageId, pageId))
      .orderBy(pageRevisions.revisionNumber)
      .limit(total - MAX_REVISIONS_PER_PAGE);

    for (const rev of oldRevisions) {
      await db.delete(pageRevisions).where(eq(pageRevisions.id, rev.id));
    }
  }

  return id;
}
