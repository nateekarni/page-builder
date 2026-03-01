/**
 * Scheduled Publishing Cron Handler
 *
 * Runs every 1 minute via Cloudflare Cron Trigger.
 * Queries pages with status='scheduled' AND scheduled_at <= now() → set status='published'.
 *
 * Clean Code: pure query + update → no complex logic, idempotent.
 */

import { pages } from '@/db/schema';
import { eq, lte, and } from 'drizzle-orm';
import { logActivity } from '@/lib/activity-log';

interface CronEnv {
  DB: D1Database;
}

export async function handleScheduledPublishing(db: any): Promise<number> {
  const now = new Date();

  // Find all pages due for publishing
  const duePages = await db
    .select({ id: pages.id, title: pages.title })
    .from(pages)
    .where(
      and(
        eq(pages.status, 'scheduled'),
        lte(pages.scheduledAt, now),
      ),
    );

  if (duePages.length === 0) return 0;

  // Publish each page
  for (const page of duePages) {
    await db.update(pages).set({
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    }).where(eq(pages.id, page.id));

    await logActivity({
      db,
      userId: null,
      action: 'publish',
      entityType: 'page',
      entityId: page.id,
      metadata: { method: 'scheduled', title: page.title },
    });
  }

  return duePages.length;
}
