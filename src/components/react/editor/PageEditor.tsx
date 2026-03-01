/**
 * Page Editor — Main Layout
 *
 * 3-panel layout: Sidebar (280px) | Canvas (flex) | Properties (320px)
 * Top toolbar: Save, Undo, Redo, Viewport, Preview, Publish
 *
 * Clean Code: layout component is pure composition, no business logic.
 */

import { useEffect, useCallback } from 'react';
import { useEditorStore, selectSaveState, selectCanUndo, selectCanRedo, selectPageMeta, selectViewport } from '@/stores/editor-store';
import EditorSidebar from './EditorSidebar';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';

interface PageEditorProps {
  pageId?: string;
}

export default function PageEditor({ pageId }: PageEditorProps) {
  const saveState = useEditorStore(selectSaveState);
  const canUndo = useEditorStore(selectCanUndo);
  const canRedo = useEditorStore(selectCanRedo);
  const pageMeta = useEditorStore(selectPageMeta);
  const viewport = useEditorStore(selectViewport);
  const { undo, redo, setViewport, setSaveState, setBlocks, setPageMeta, reset } = useEditorStore();

  // Load page data
  useEffect(() => {
    if (!pageId) {
      reset();
      setPageMeta({ id: '', title: 'หน้าใหม่', slug: '', status: 'draft', revisionNumber: 0 });
      return;
    }
    loadPage(pageId);
  }, [pageId]);

  async function loadPage(id: string) {
    try {
      const res = await fetch(`/api/pages/${id}`);
      const data = await res.json();
      if (data.success) {
        setPageMeta({ id: data.data.id, title: data.data.title, slug: data.data.slug, status: data.data.status, revisionNumber: data.data.revisionNumber ?? 0 });
        setBlocks(data.data.contentBlocks ?? []);
        setSaveState('saved');
      }
    } catch {
      console.error('Failed to load page');
    }
  }

  // Save handler
  const handleSave = useCallback(async () => {
    const { blocks, pageMeta } = useEditorStore.getState();
    if (!pageMeta) return;
    setSaveState('saving');
    try {
      const method = pageMeta.id ? 'PUT' : 'POST';
      const url = pageMeta.id ? `/api/pages/${pageMeta.id}` : '/api/pages';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pageMeta.title, slug: pageMeta.slug, contentBlocks: blocks, status: pageMeta.status }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveState('saved');
        if (!pageMeta.id && data.data?.id) {
          setPageMeta({ ...pageMeta, id: data.data.id });
        }
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  }, []);

  // Keyboard shortcuts (5.8)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (useEditorStore.getState().saveState === 'unsaved') {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [handleSave]);

  const VIEWPORT_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;

  const SAVE_LABELS: Record<string, string> = {
    saved: '✓ บันทึกแล้ว',
    unsaved: '● มีการเปลี่ยนแปลง',
    saving: '⏳ กำลังบันทึก...',
    error: '✕ บันทึกไม่สำเร็จ',
  };

  return (
    <div style={styles.root}>
      {/* Top Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <a href="/admin" style={styles.backBtn}>← กลับ</a>
          <span style={styles.pageTitle}>{pageMeta?.title || 'หน้าใหม่'}</span>
          <span style={{ ...styles.saveIndicator, color: saveState === 'error' ? '#FCA5A5' : saveState === 'unsaved' ? '#FBBF24' : '#6EE7B7' }}>
            {SAVE_LABELS[saveState]}
          </span>
        </div>

        <div style={styles.toolbarCenter}>
          <button style={styles.toolBtn} disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">↩</button>
          <button style={styles.toolBtn} disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Shift+Z)">↪</button>
          <div style={styles.divider} />
          {(['desktop', 'tablet', 'mobile'] as const).map((vp) => (
            <button
              key={vp}
              style={{ ...styles.toolBtn, ...(viewport === vp ? styles.toolBtnActive : {}) }}
              onClick={() => setViewport(vp)}
              title={vp}
            >
              {vp === 'desktop' ? '🖥️' : vp === 'tablet' ? '💻' : '📱'}
            </button>
          ))}
        </div>

        <div style={styles.toolbarRight}>
          <button style={styles.saveBtn} onClick={handleSave}>บันทึก</button>
          <button style={styles.publishBtn}>เผยแพร่</button>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div style={styles.panels}>
        <div style={styles.sidebar}>
          <EditorSidebar />
        </div>
        <div style={styles.canvasWrapper}>
          <div style={{ ...styles.canvasFrame, maxWidth: VIEWPORT_WIDTHS[viewport], transition: 'max-width 0.3s ease' }}>
            <EditorCanvas />
          </div>
        </div>
        <div style={styles.properties}>
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0B0F1A', fontFamily: "'Inter', sans-serif" },
  toolbar: {
    height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 0.75rem', borderBottom: '1px solid #1E293B', backgroundColor: '#111827', flexShrink: 0,
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  toolbarCenter: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  backBtn: { fontSize: '0.8125rem', color: '#94A3B8', textDecoration: 'none' },
  pageTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0' },
  saveIndicator: { fontSize: '0.75rem' },
  toolBtn: {
    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: '1px solid transparent', borderRadius: '0.375rem',
    color: '#94A3B8', fontSize: '1rem', cursor: 'pointer',
  },
  toolBtnActive: { backgroundColor: 'rgba(59,130,246,0.12)', color: '#3B82F6', borderColor: 'rgba(59,130,246,0.3)' },
  divider: { width: '1px', height: '20px', backgroundColor: '#334155', margin: '0 0.25rem' },
  saveBtn: {
    padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#CBD5E1',
    background: 'none', border: '1px solid #334155', borderRadius: '0.375rem', cursor: 'pointer',
  },
  publishBtn: {
    padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#FFF',
    backgroundColor: '#3B82F6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
  },
  panels: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '280px', borderRight: '1px solid #1E293B', backgroundColor: '#111827', overflow: 'auto', flexShrink: 0 },
  canvasWrapper: { flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '1.5rem', backgroundColor: '#0B0F1A' },
  canvasFrame: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', minHeight: '600px', overflow: 'auto' },
  properties: { width: '320px', borderLeft: '1px solid #1E293B', backgroundColor: '#111827', overflow: 'auto', flexShrink: 0 },
};
