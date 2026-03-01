/**
 * Activity Log Utility
 *
 * Centralized logging function for all admin actions (audit trail).
 * Used by middleware and API routes to record who did what and when.
 *
 * Clean Code: cross-cutting concern — single function, no side effects beyond DB insert.
 */

import type { Database } from "@/db/client";
import { activityLog } from "@/db/schema";

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "schedule"
  | "restore"
  | "login"
  | "logout"
  | "upload"
  | "settings_update"
  | "upsert"
  | "export"
  | "import";

export type EntityType =
  | "page"
  | "media"
  | "user"
  | "settings"
  | "template"
  | "form_submission"
  | "ab_test"
  | "translation";

interface LogActivityParams {
  db: Database;
  userId: string | null;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records an activity in the audit log.
 *
 * @example
 * ```ts
 * await logActivity({
 *   db,
 *   userId: user.id,
 *   action: 'create',
 *   entityType: 'page',
 *   entityId: newPage.id,
 *   metadata: { title: newPage.title },
 * });
 * ```
 */
export async function logActivity({
  db,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Log errors should not break the main operation
    console.error("[ActivityLog] Failed to log activity:", error);
  }
}

/**
 * Human-readable descriptions for activity actions.
 * Used in the dashboard activity feed.
 */
export const ACTION_LABELS: Record<ActivityAction, string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  publish: "เผยแพร่",
  unpublish: "ยกเลิกเผยแพร่",
  schedule: "ตั้งเวลาเผยแพร่",
  restore: "กู้คืน",
  login: "เข้าสู่ระบบ",
  logout: "ออกจากระบบ",
  upload: "อัปโหลด",
  settings_update: "อัปเดตการตั้งค่า",
  upsert: "เพิ่ม/แก้ไข",
  export: "ส่งออก",
  import: "นำเข้า",
};

export const ENTITY_LABELS: Record<EntityType, string> = {
  page: "หน้า",
  media: "สื่อ",
  user: "ผู้ใช้",
  settings: "การตั้งค่า",
  template: "เทมเพลต",
  form_submission: "ข้อมูลฟอร์ม",
  ab_test: "การทดสอบ A/B",
  translation: "การแปล",
};
