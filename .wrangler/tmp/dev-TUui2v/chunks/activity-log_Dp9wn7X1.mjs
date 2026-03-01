globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as activityLog } from './schema_HDzOIqy1.mjs';

async function logActivity({
  db,
  userId,
  action,
  entityType,
  entityId,
  metadata
}) {
  try {
    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? null,
      createdAt: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("[ActivityLog] Failed to log activity:", error);
  }
}

export { logActivity as l };
