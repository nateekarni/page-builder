/**
 * useKeyboardShortcuts — Declarative keyboard shortcut handler
 *
 * Clean Code: shortcut map is a config object → easy to add/modify.
 * Uses event delegation pattern.
 */

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(onSave: () => void) {
  useEffect(() => {
    const store = useEditorStore.getState;

    const shortcuts: ShortcutConfig[] = [
      // Save
      {
        key: 's',
        ctrl: true,
        description: 'Save',
        action: onSave,
      },
      // Undo
      {
        key: 'z',
        ctrl: true,
        description: 'Undo',
        action: () => store().undo(),
      },
      // Redo
      {
        key: 'z',
        ctrl: true,
        shift: true,
        description: 'Redo',
        action: () => store().redo(),
      },
      // Duplicate block
      {
        key: 'd',
        ctrl: true,
        description: 'Duplicate selected block',
        action: () => {
          const id = store().selectedBlockId;
          if (id) store().duplicateBlock(id);
        },
      },
      // Delete block
      {
        key: 'Delete',
        description: 'Delete selected block',
        action: () => {
          const id = store().selectedBlockId;
          if (id) store().removeBlock(id);
        },
      },
      // Also support Backspace for delete
      {
        key: 'Backspace',
        description: 'Delete selected block',
        action: () => {
          // Only delete if not in an input/textarea
          const active = document.activeElement;
          if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) return;
          const id = store().selectedBlockId;
          if (id) store().removeBlock(id);
        },
      },
      // Deselect
      {
        key: 'Escape',
        description: 'Deselect block',
        action: () => store().selectBlock(null),
      },
      // Viewport: Desktop
      {
        key: '1',
        ctrl: true,
        shift: true,
        description: 'Switch to Desktop viewport',
        action: () => store().setViewport('desktop'),
      },
      // Viewport: Tablet
      {
        key: '2',
        ctrl: true,
        shift: true,
        description: 'Switch to Tablet viewport',
        action: () => store().setViewport('tablet'),
      },
      // Viewport: Mobile
      {
        key: '3',
        ctrl: true,
        shift: true,
        description: 'Switch to Mobile viewport',
        action: () => store().setViewport('mobile'),
      },
    ];

    function handleKeyDown(e: KeyboardEvent) {
      // Skip if inside input, textarea, or select (except for ctrl shortcuts)
      const active = document.activeElement;
      const isTextInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase() || e.key === shortcut.key;

        if (ctrlMatch && shiftMatch && keyMatch) {
          // Allow ctrl shortcuts even in text inputs
          if (isTextInput && !shortcut.ctrl) continue;
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);
}

/** Export the shortcuts list for display in a help modal */
export const SHORTCUT_LIST = [
  { keys: 'Ctrl+S', description: 'บันทึก' },
  { keys: 'Ctrl+Z', description: 'ย้อนกลับ (Undo)' },
  { keys: 'Ctrl+Shift+Z', description: 'ทำซ้ำ (Redo)' },
  { keys: 'Ctrl+D', description: 'คัดลอกบล็อก' },
  { keys: 'Delete', description: 'ลบบล็อก' },
  { keys: 'Escape', description: 'ยกเลิกเลือก' },
  { keys: 'Ctrl+Shift+1', description: 'Desktop view' },
  { keys: 'Ctrl+Shift+2', description: 'Tablet view' },
  { keys: 'Ctrl+Shift+3', description: 'Mobile view' },
];
