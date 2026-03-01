/**
 * useAutoSave Hook — Debounced auto-save for the editor
 *
 * Saves as draft every 30s after last change.
 * Separated from editor logic per Clean Code principle.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore, selectSaveState } from '@/stores/editor-store';

const AUTO_SAVE_DELAY = 30_000; // 30 seconds

export function useAutoSave() {
  const saveState = useEditorStore(selectSaveState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSave = useCallback(async () => {
    const { blocks, pageMeta, setSaveState } = useEditorStore.getState();
    if (!pageMeta || saveState !== 'unsaved') return;

    setSaveState('saving');
    try {
      const method = pageMeta.id ? 'PUT' : 'POST';
      const url = pageMeta.id ? `/api/pages/${pageMeta.id}` : '/api/pages';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageMeta.title,
          slug: pageMeta.slug,
          contentBlocks: blocks,
          status: 'draft', // Auto-save always saves as draft
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveState('saved');
        if (!pageMeta.id && data.data?.id) {
          useEditorStore.getState().setPageMeta({ ...pageMeta, id: data.data.id });
        }
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  }, [saveState]);

  // Debounced: reset timer on every state change
  useEffect(() => {
    if (saveState !== 'unsaved') return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSave();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [saveState, performSave]);

  return { performSave, saveState };
}
