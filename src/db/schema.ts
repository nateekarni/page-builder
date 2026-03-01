/**
 * Database Schema — Aglow Portfolio Builder
 *
 * All table definitions for Cloudflare D1 (SQLite) via Drizzle ORM.
 * This file is the Single Source of Truth for database types.
 *
 * Tables are organized by domain:
 * - Auth (Better Auth managed): user, session, account, verification
 * - Content: pages, pageRevisions, templates
 * - Media: media
 * - Settings: siteSettings
 * - Forms: formSubmissions
 * - Analytics: abTests, activityLog
 * - i18n: translations
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================================
// AUTH TABLES (Better Auth managed — schema must match Better Auth expectations)
// ============================================================================

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['admin', 'editor', 'author'] }).notNull().default('author'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// CONTENT TABLES
// ============================================================================

/**
 * Pages — stores all web pages created via the Page Builder.
 * `content_blocks` is a JSON array of Block objects (validated by Zod at runtime).
 */
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status', { enum: ['draft', 'scheduled', 'published'] }).notNull().default('draft'),
  contentBlocks: text('content_blocks', { mode: 'json' }).$type<unknown[]>().notNull().default([]),
  templateId: text('template_id').references(() => templates.id, { onDelete: 'set null' }),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  ogImageUrl: text('og_image_url'),
  customCss: text('custom_css'),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
});

/**
 * Page Revisions — content version history.
 * Auto-created on every manual save for audit trail and restore capability.
 */
export const pageRevisions = sqliteTable('page_revisions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  contentBlocks: text('content_blocks', { mode: 'json' }).$type<unknown[]>().notNull(),
  revisionNumber: integer('revision_number').notNull(),
  note: text('note'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

/**
 * Templates — reusable page layouts and block patterns.
 * When `is_pattern` is true, it represents a reusable block group (not a full page layout).
 */
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  contentBlocks: text('content_blocks', { mode: 'json' }).$type<unknown[]>().notNull().default([]),
  category: text('category'),
  thumbnailUrl: text('thumbnail_url'),
  isPattern: integer('is_pattern', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// MEDIA TABLE
// ============================================================================

/**
 * Media — metadata for files stored on Cloudflare R2.
 * The actual files live on R2; this table stores metadata + R2 key for reference.
 */
export const media = sqliteTable('media', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  r2Key: text('r2_key').notNull().unique(),
  altText: text('alt_text'),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// SETTINGS TABLE
// ============================================================================

/**
 * Site Settings — key-value store for global configuration.
 * Values are JSON to support complex structures (e.g., design tokens, social links array).
 *
 * Keys: 'site_identity', 'social_links', 'design_tokens', 'seo_defaults', etc.
 */
export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// FORM SUBMISSIONS TABLE
// ============================================================================

/**
 * Form Submissions — stores responses from Form Builder blocks.
 * `data` is a JSON object with field names as keys and user input as values.
 */
export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  formBlockId: text('form_block_id').notNull(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// A/B TESTING TABLE
// ============================================================================

/**
 * A/B Tests — experiment definitions for page variant testing.
 * `variants` is a JSON array of { id, name, content_blocks } objects.
 * `results` is a JSON object tracking metrics per variant.
 */
export const abTests = sqliteTable('ab_tests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  variants: text('variants', { mode: 'json' }).$type<unknown[]>().notNull().default([]),
  trafficSplit: real('traffic_split').notNull().default(0.5),
  status: text('status', { enum: ['draft', 'running', 'completed'] }).notNull().default('draft'),
  startAt: integer('start_at', { mode: 'timestamp' }),
  endAt: integer('end_at', { mode: 'timestamp' }),
  results: text('results', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// ACTIVITY LOG TABLE
// ============================================================================

/**
 * Activity Log — audit trail for all admin actions.
 * Used for the dashboard activity feed and security auditing.
 */
export const activityLog = sqliteTable('activity_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'publish', 'login', etc.
  entityType: text('entity_type').notNull(), // 'page', 'media', 'user', 'settings', etc.
  entityId: text('entity_id'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// TRANSLATIONS TABLE (Phase 8 — i18n)
// ============================================================================

/**
 * Translations — stores localized content for each page.
 * Each row represents one page in one locale.
 */
export const translations = sqliteTable('translations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull(), // 'th', 'en', 'ja', etc.
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  contentBlocks: text('content_blocks', { mode: 'json' }).$type<unknown[]>().notNull().default([]),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
