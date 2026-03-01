# API Reference — Aglow Portfolio Builder

All API routes require authentication (via Better Auth session cookie) unless noted.

---

## Pages

### `GET /api/pages`
List all pages.

**Response**: `{ success: true, data: Page[] }`

### `POST /api/pages`
Create a new page.

**Body**:
```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "contentBlocks": "Block[] (default: [])",
  "status": "draft | published | scheduled",
  "seoTitle": "string (optional)",
  "seoDescription": "string (optional)",
  "customCss": "string (optional)"
}
```

### `GET /api/pages/:id`
Get page by ID (includes `contentBlocks`).

### `PUT /api/pages/:id`
Update page.

### `DELETE /api/pages/:id`
Delete page.

---

## Page Revisions

### `GET /api/pages/:id/revisions`
List revisions for a page.

---

## Media

### `POST /api/media/upload`
Upload file (multipart form data). Max 10MB.

**Body**: `FormData` with `file` field.

**Response**: `{ success: true, data: { id, url, width, height } }`

### `GET /api/media`
List all media files.

### `DELETE /api/media/:id`
Delete media file (removes from R2 + D1).

---

## Templates

### `GET /api/templates`
List templates and patterns.

### `POST /api/templates`
Create template/pattern.

---

## Users

### `GET /api/users`
List users (admin only).

### `POST /api/users`
Create user (admin only).

---

## Settings

### `GET /api/settings`
Get all settings.

### `GET /api/settings?key=xxx`
Get single setting by key.

### `PUT /api/settings`
Upsert setting.

**Body**: `{ "key": "string", "value": {} }`

---

## Forms

### `POST /api/forms/submit`
Submit a form (public, no auth required).

**Body**:
```json
{
  "formBlockId": "string",
  "pageSlug": "string",
  "data": { "fieldName": "value" }
}
```

---

## A/B Tests

### `GET /api/ab-tests`
List all A/B tests.

### `POST /api/ab-tests`
Create new test.

**Body**:
```json
{
  "name": "string",
  "pageId": "string",
  "variants": [{ "id": "string", "name": "string", "content_blocks": [] }],
  "trafficSplit": 0.5
}
```

### `PUT /api/ab-tests/:id`
Update test (status, split, results).

### `DELETE /api/ab-tests/:id`
Delete test.

---

## Export / Import

### `GET /api/export/:id`
Export page as JSON file download.

### `POST /api/export/import`
Import page from JSON.

**Body**: Exported JSON object.

---

## Translations (i18n)

### `GET /api/translations?pageId=xxx`
List translations for a page.

### `GET /api/translations?pageId=xxx&locale=th`
Get specific translation.

### `POST /api/translations`
Create/update translation.

---

## AI Assistant

### `POST /api/ai/generate`
Generate text content.

**Body**: `{ "prompt": "string", "systemPrompt?": "string", "maxTokens?": number }`

### `POST /api/ai/seo`
Get SEO suggestions.

**Body**: `{ "content": "string" }`

### `POST /api/ai/alt-text`
Generate image alt text.

**Body**: `{ "imageUrl": "string" }`

---

## Activity Log

### `GET /api/activity`
Get recent activity log entries.
