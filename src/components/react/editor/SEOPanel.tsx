/**
 * SEO Panel — Per-page SEO settings in the editor.
 *
 * Fields: custom title, meta description, OG image (media picker).
 * Character count indicators (title: 60, description: 160).
 * Preview: Google SERP snippet mockup.
 *
 * Clean Code: separate React component, communicates with editor via store actions.
 */

import { useState, useEffect } from 'react';
import { useEditorStore, selectPageMeta } from '@/stores/editor-store';

const TITLE_MAX = 60;
const DESC_MAX = 160;

interface SEOData {
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
}

export default function SEOPanel() {
  const pageMeta = useEditorStore(selectPageMeta);
  const setSaveState = useEditorStore((s) => s.setSaveState);

  const [seoData, setSeoData] = useState<SEOData>({
    seoTitle: '',
    seoDescription: '',
    ogImageUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pageMeta?.id) return;
    loadSEOData(pageMeta.id);
  }, [pageMeta?.id]);

  async function loadSEOData(pageId: string) {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      const data = await res.json();
      if (data.success) {
        setSeoData({
          seoTitle: data.data.seoTitle ?? '',
          seoDescription: data.data.seoDescription ?? '',
          ogImageUrl: data.data.ogImageUrl ?? '',
        });
      }
    } catch {
      // Silent fail
    }
  }

  async function handleSave() {
    if (!pageMeta?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageMeta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageMeta.title,
          slug: pageMeta.slug,
          seoTitle: seoData.seoTitle || null,
          seoDescription: seoData.seoDescription || null,
          ogImageUrl: seoData.ogImageUrl || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveState('saved');
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(field: keyof SEOData, value: string) {
    setSeoData((prev) => ({ ...prev, [field]: value }));
    setSaveState('unsaved');
  }

  const titleLen = seoData.seoTitle.length;
  const descLen = seoData.seoDescription.length;
  const displayTitle = seoData.seoTitle || pageMeta?.title || 'Page Title';
  const displayUrl = `example.com/${pageMeta?.slug || 'page-slug'}`;
  const displayDesc = seoData.seoDescription || 'No description provided.';

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>SEO Settings</h3>

      {/* Title */}
      <div style={styles.field}>
        <label style={styles.label}>
          SEO Title
          <span style={{ ...styles.counter, color: titleLen > TITLE_MAX ? '#EF4444' : '#64748B' }}>
            {titleLen}/{TITLE_MAX}
          </span>
        </label>
        <input
          type="text"
          value={seoData.seoTitle}
          onChange={(e) => handleChange('seoTitle', e.target.value)}
          placeholder={pageMeta?.title || 'Enter SEO title'}
          style={styles.input}
        />
      </div>

      {/* Description */}
      <div style={styles.field}>
        <label style={styles.label}>
          Meta Description
          <span style={{ ...styles.counter, color: descLen > DESC_MAX ? '#EF4444' : '#64748B' }}>
            {descLen}/{DESC_MAX}
          </span>
        </label>
        <textarea
          value={seoData.seoDescription}
          onChange={(e) => handleChange('seoDescription', e.target.value)}
          placeholder="Enter meta description"
          rows={3}
          style={styles.textarea}
        />
      </div>

      {/* OG Image */}
      <div style={styles.field}>
        <label style={styles.label}>OG Image URL</label>
        <input
          type="text"
          value={seoData.ogImageUrl}
          onChange={(e) => handleChange('ogImageUrl', e.target.value)}
          placeholder="https://example.com/og-image.jpg"
          style={styles.input}
        />
        {seoData.ogImageUrl && (
          <img
            src={seoData.ogImageUrl}
            alt="OG Preview"
            style={styles.ogPreview}
          />
        )}
      </div>

      {/* SERP Preview */}
      <div style={styles.field}>
        <label style={styles.label}>Google Preview</label>
        <div style={styles.serpPreview}>
          <div style={styles.serpTitle}>{displayTitle.slice(0, TITLE_MAX)}</div>
          <div style={styles.serpUrl}>{displayUrl}</div>
          <div style={styles.serpDesc}>{displayDesc.slice(0, DESC_MAX)}</div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={isLoading}
        style={styles.saveBtn}
      >
        {isLoading ? 'Saving...' : 'Save SEO'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '1rem', color: '#E2E8F0' },
  heading: { fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#F8FAFC' },
  field: { marginBottom: '1rem' },
  label: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.75rem', fontWeight: 500, color: '#94A3B8', marginBottom: '0.375rem',
  },
  counter: { fontSize: '0.6875rem', fontWeight: 400 },
  input: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem',
    background: '#0B0F1A', border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#E2E8F0', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem',
    background: '#0B0F1A', border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#E2E8F0', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit',
  },
  ogPreview: {
    width: '100%', height: 'auto', maxHeight: '120px', objectFit: 'cover' as const,
    borderRadius: '0.375rem', marginTop: '0.5rem',
  },
  serpPreview: {
    padding: '0.75rem', background: '#FFF', borderRadius: '0.5rem', fontFamily: 'Arial, sans-serif',
  },
  serpTitle: { fontSize: '1.125rem', color: '#1A0DAB', lineHeight: 1.3, marginBottom: '0.125rem' },
  serpUrl: { fontSize: '0.8125rem', color: '#006621', marginBottom: '0.25rem' },
  serpDesc: { fontSize: '0.8125rem', color: '#545454', lineHeight: 1.4 },
  saveBtn: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600,
    color: '#FFF', backgroundColor: '#3B82F6', border: 'none', borderRadius: '0.375rem',
    cursor: 'pointer',
  },
};
