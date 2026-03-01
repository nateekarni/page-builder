-- Performance optimization: indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_status_slug ON pages(status, slug);
CREATE INDEX IF NOT EXISTS idx_page_revisions_page_id ON page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_page_id_locale ON translations(page_id, locale);
CREATE INDEX IF NOT EXISTS idx_translations_slug_locale ON translations(slug, locale);
CREATE INDEX IF NOT EXISTS idx_ab_tests_page_id_status ON ab_tests(page_id, status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_page_id ON form_submissions(page_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
