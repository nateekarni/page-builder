/**
 * Editor Store — Zustand
 *
 * Central state for the Page Builder editor.
 * Manages: blocks tree, selection, viewport, history (undo/redo), save state.
 *
 * Clean Code:
 * - Immutable state updates (spread, never mutate)
 * - History middleware: pushHistory() before every mutation
 * - Max 50 history entries (ring buffer)
 * - No side effects — API calls are done externally via async thunks
 * - Actions + selectors, no business logic in components
 */

import { create } from 'zustand';
import type { Block, Viewport } from '@/lib/blocks';

// ============================================================================
// TYPES
// ============================================================================

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

export interface PageMeta {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  revisionNumber: number;
}

interface HistoryEntry {
  blocks: Block[];
  timestamp: number;
}

interface EditorState {
  // Page
  pageMeta: PageMeta | null;

  // Blocks
  blocks: Block[];

  // Selection
  selectedBlockId: string | null;

  // Viewport
  viewport: Viewport;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Save state
  saveState: SaveState;

  // Sidebar
  sidebarTab: 'blocks' | 'tree' | 'layers';
}

interface EditorActions {
  // Page
  setPageMeta: (meta: PageMeta) => void;

  // Blocks
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block, parentId?: string, index?: number) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetParentId: string | null, targetIndex: number) => void;
  duplicateBlock: (blockId: string) => void;

  // Selection
  selectBlock: (blockId: string | null) => void;

  // Viewport
  setViewport: (viewport: Viewport) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Save
  setSaveState: (state: SaveState) => void;

  // Sidebar
  setSidebarTab: (tab: EditorState['sidebarTab']) => void;

  // Reset
  reset: () => void;
}

const MAX_HISTORY = 50;

// ============================================================================
// HELPER FUNCTIONS (pure, no side effects)
// ============================================================================

/** Deep-find a block by ID in the tree */
function findBlock(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Remove a block from tree by ID, returns [newTree, removedBlock] */
function removeFromTree(blocks: Block[], id: string): [Block[], Block | null] {
  let removed: Block | null = null;
  const filtered = blocks.reduce<Block[]>((acc, block) => {
    if (block.id === id) {
      removed = block;
      return acc;
    }
    if (block.children) {
      const [newChildren, childRemoved] = removeFromTree(block.children, id);
      if (childRemoved) removed = childRemoved;
      acc.push({ ...block, children: newChildren });
    } else {
      acc.push(block);
    }
    return acc;
  }, []);
  return [filtered, removed];
}

/** Insert a block into tree at parentId[index], or root if parentId is null */
function insertIntoTree(blocks: Block[], block: Block, parentId: string | null, index: number): Block[] {
  if (!parentId) {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, block);
    return newBlocks;
  }
  return blocks.map((b) => {
    if (b.id === parentId) {
      const children = [...(b.children ?? [])];
      children.splice(index, 0, block);
      return { ...b, children };
    }
    if (b.children) {
      return { ...b, children: insertIntoTree(b.children, block, parentId, index) };
    }
    return b;
  });
}

/** Update a block in tree by ID */
function updateInTree(blocks: Block[], id: string, updates: Partial<Block>): Block[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, ...updates } as Block;
    }
    if (block.children) {
      return { ...block, children: updateInTree(block.children, id, updates) };
    }
    return block;
  });
}

/** Deep clone a block with new IDs */
function cloneBlock(block: Block): Block {
  return {
    ...block,
    id: crypto.randomUUID(),
    children: block.children?.map(cloneBlock),
  };
}

// ============================================================================
// STORE
// ============================================================================

const initialState: EditorState = {
  pageMeta: null,
  blocks: [],
  selectedBlockId: null,
  viewport: 'desktop',
  history: [],
  historyIndex: -1,
  saveState: 'saved',
  sidebarTab: 'blocks',
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => {
  /** Push current blocks into history stack (called before every mutation) */
  function pushHistory() {
    const { blocks, history, historyIndex } = get();
    // Trim future entries when we make a new change after undo
    const trimmed = history.slice(0, historyIndex + 1);
    const entry: HistoryEntry = { blocks: structuredClone(blocks), timestamp: Date.now() };
    const newHistory = [...trimmed, entry].slice(-MAX_HISTORY);
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  }

  return {
    ...initialState,

    // — Page —
    setPageMeta: (meta) => set({ pageMeta: meta }),

    // — Blocks (every mutation pushes history) —
    setBlocks: (blocks) => {
      pushHistory();
      set({ blocks, saveState: 'unsaved' });
    },

    addBlock: (block, parentId, index) => {
      pushHistory();
      const { blocks } = get();
      const idx = index ?? (parentId ? (findBlock(blocks, parentId)?.children?.length ?? 0) : blocks.length);
      set({ blocks: insertIntoTree(blocks, block, parentId ?? null, idx), saveState: 'unsaved' });
    },

    updateBlock: (blockId, updates) => {
      pushHistory();
      set({ blocks: updateInTree(get().blocks, blockId, updates), saveState: 'unsaved' });
    },

    removeBlock: (blockId) => {
      pushHistory();
      const [newBlocks] = removeFromTree(get().blocks, blockId);
      set({
        blocks: newBlocks,
        selectedBlockId: get().selectedBlockId === blockId ? null : get().selectedBlockId,
        saveState: 'unsaved',
      });
    },

    moveBlock: (blockId, targetParentId, targetIndex) => {
      pushHistory();
      const { blocks } = get();
      const [treeSansBlock, movedBlock] = removeFromTree(blocks, blockId);
      if (!movedBlock) return;
      set({ blocks: insertIntoTree(treeSansBlock, movedBlock, targetParentId, targetIndex), saveState: 'unsaved' });
    },

    duplicateBlock: (blockId) => {
      const { blocks } = get();
      const original = findBlock(blocks, blockId);
      if (!original) return;
      pushHistory();
      const cloned = cloneBlock(original);

      // Find parent and index
      let parentId: string | null = null;
      let insertIdx = blocks.length;

      function findParent(tree: Block[], parent: string | null) {
        for (let i = 0; i < tree.length; i++) {
          if (tree[i].id === blockId) {
            parentId = parent;
            insertIdx = i + 1;
            return true;
          }
          if (tree[i].children && findParent(tree[i].children!, tree[i].id)) return true;
        }
        return false;
      }
      findParent(blocks, null);

      set({ blocks: insertIntoTree(blocks, cloned, parentId, insertIdx), saveState: 'unsaved' });
    },

    // — Selection —
    selectBlock: (blockId) => set({ selectedBlockId: blockId }),

    // — Viewport —
    setViewport: (viewport) => set({ viewport }),

    // — History (undo/redo) —
    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < 0) return;
      const entry = history[historyIndex];
      set({ blocks: structuredClone(entry.blocks), historyIndex: historyIndex - 1, saveState: 'unsaved' });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;
      const entry = history[historyIndex + 1];
      if (!entry) return;
      set({ blocks: structuredClone(entry.blocks), historyIndex: historyIndex + 1, saveState: 'unsaved' });
    },

    // — Save —
    setSaveState: (saveState) => set({ saveState }),

    // — Sidebar —
    setSidebarTab: (sidebarTab) => set({ sidebarTab }),

    // — Reset —
    reset: () => set(initialState),
  };
});

// ============================================================================
// SELECTORS (for performance: subscribe to only what you need)
// ============================================================================

export const selectBlocks = (s: EditorState) => s.blocks;
export const selectSelectedBlockId = (s: EditorState) => s.selectedBlockId;
export const selectViewport = (s: EditorState) => s.viewport;
export const selectSaveState = (s: EditorState) => s.saveState;
export const selectPageMeta = (s: EditorState) => s.pageMeta;
export const selectCanUndo = (s: EditorState) => s.historyIndex >= 0;
export const selectCanRedo = (s: EditorState) => s.historyIndex < s.history.length - 1;

export const selectSelectedBlock = (s: EditorState): Block | null => {
  if (!s.selectedBlockId) return null;
  return findBlock(s.blocks, s.selectedBlockId);
};
