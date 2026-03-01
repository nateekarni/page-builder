/**
 * Editor Sidebar — Block Palette, Page Tree, Layers
 *
 * Clean Code: each tab is its own sub-component with shared selection interface.
 */

import { useEditorStore, selectBlocks, selectSelectedBlockId } from '@/stores/editor-store';
import type { BlockType } from '@/lib/blocks';
import { createBlock } from '@/components/react/blocks';

// ============================================================================
// BLOCK PALETTE (Draggable block type cards)
// ============================================================================

const BLOCK_CATALOG: { category: string; items: { type: BlockType; label: string; icon: string }[] }[] = [
  {
    category: 'เลย์เอาต์',
    items: [
      { type: 'container', label: 'Container', icon: '☐' },
      { type: 'columns', label: 'Columns', icon: '▥' },
      { type: 'spacer', label: 'Spacer', icon: '↕' },
      { type: 'divider', label: 'Divider', icon: '—' },
    ],
  },
  {
    category: 'เนื้อหา',
    items: [
      { type: 'text', label: 'Text', icon: 'T' },
      { type: 'image', label: 'Image', icon: '🖼️' },
      { type: 'video', label: 'Video', icon: '▶' },
      { type: 'code', label: 'Code', icon: '</>' },
    ],
  },
  {
    category: 'เซคชัน',
    items: [
      { type: 'hero', label: 'Hero', icon: '⬛' },
      { type: 'cta', label: 'CTA', icon: '🔘' },
      { type: 'icon-box', label: 'Icon Box', icon: '◆' },
      { type: 'testimonial', label: 'Testimonial', icon: '💬' },
    ],
  },
  {
    category: 'อินเตอร์แอคทีฟ',
    items: [
      { type: 'accordion', label: 'Accordion', icon: '▼' },
      { type: 'tabs', label: 'Tabs', icon: '⊟' },
      { type: 'form', label: 'Form', icon: '📋' },
      { type: 'map', label: 'Map', icon: '📍' },
    ],
  },
  {
    category: 'ไดนามิก',
    items: [
      { type: 'query-loop', label: 'Query Loop', icon: '🔄' },
    ],
  },
];

function BlockPalette() {
  const { addBlock } = useEditorStore();

  function handleAddBlock(type: BlockType) {
    addBlock(createBlock(type));
  }

  return (
    <div style={{ padding: '0.75rem' }}>
      {BLOCK_CATALOG.map((cat) => (
        <div key={cat.category} style={{ marginBottom: '1rem' }}>
          <div style={styles.catLabel}>{cat.category}</div>
          <div style={styles.blockGrid}>
            {cat.items.map((item) => (
              <button
                key={item.type}
                style={styles.blockCard}
                onClick={() => handleAddBlock(item.type)}
                draggable
                title={item.label}
              >
                <span style={styles.blockIcon}>{item.icon}</span>
                <span style={styles.blockLabel}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PAGE TREE (Outline view)
// ============================================================================

function PageTree() {
  const blocks = useEditorStore(selectBlocks);
  const selectedId = useEditorStore(selectSelectedBlockId);
  const { selectBlock } = useEditorStore();

  function renderTree(blockList: typeof blocks, depth = 0) {
    return blockList.map((block) => (
      <div key={block.id}>
        <button
          style={{
            ...styles.treeItem,
            paddingLeft: `${0.75 + depth * 1}rem`,
            ...(selectedId === block.id ? styles.treeItemActive : {}),
          }}
          onClick={() => selectBlock(block.id)}
        >
          <span style={styles.treeIcon}>{BLOCK_CATALOG.flatMap(c => c.items).find(i => i.type === block.type)?.icon ?? '▪'}</span>
          <span style={styles.treeLabel}>{block.type}</span>
        </button>
        {block.children && block.children.length > 0 && renderTree(block.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {blocks.length === 0 ? (
        <div style={styles.emptyMsg}>ยังไม่มีบล็อก</div>
      ) : (
        renderTree(blocks)
      )}
    </div>
  );
}

// ============================================================================
// LAYERS (Toggle visibility)
// ============================================================================

function LayersPanel() {
  const blocks = useEditorStore(selectBlocks);
  const { updateBlock, removeBlock, selectBlock } = useEditorStore();
  const selectedId = useEditorStore(selectSelectedBlockId);

  function renderLayers(blockList: typeof blocks, depth = 0) {
    return blockList.map((block) => (
      <div key={block.id}>
        <div
          style={{
            ...styles.layerItem,
            paddingLeft: `${0.75 + depth * 0.75}rem`,
            ...(selectedId === block.id ? { backgroundColor: 'rgba(59,130,246,0.08)' } : {}),
          }}
          onClick={() => selectBlock(block.id)}
        >
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', flex: 1 }}>{block.type}</span>
          <button
            style={styles.layerBtn}
            onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
            title="ลบ"
          >
            🗑
          </button>
        </div>
        {block.children && block.children.length > 0 && renderLayers(block.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {blocks.length === 0 ? (
        <div style={styles.emptyMsg}>ยังไม่มีบล็อก</div>
      ) : (
        renderLayers(blocks)
      )}
    </div>
  );
}

// ============================================================================
// MAIN SIDEBAR
// ============================================================================

export default function EditorSidebar() {
  const sidebarTab = useEditorStore((s) => s.sidebarTab);
  const { setSidebarTab } = useEditorStore();

  const tabs = [
    { id: 'blocks' as const, label: 'บล็อก' },
    { id: 'tree' as const, label: 'โครงสร้าง' },
    { id: 'layers' as const, label: 'เลเยอร์' },
  ];

  return (
    <div>
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{ ...styles.tab, ...(sidebarTab === tab.id ? styles.tabActive : {}) }}
            onClick={() => setSidebarTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {sidebarTab === 'blocks' && <BlockPalette />}
      {sidebarTab === 'tree' && <PageTree />}
      {sidebarTab === 'layers' && <LayersPanel />}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  tabBar: { display: 'flex', borderBottom: '1px solid #1E293B' },
  tab: {
    flex: 1, padding: '0.625rem 0', fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' as const,
    color: '#64748B', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer',
  },
  tabActive: { color: '#3B82F6', borderBottomColor: '#3B82F6' },
  catLabel: { fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#475569', marginBottom: '0.375rem' },
  blockGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem', marginBottom: '0.25rem' },
  blockCard: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.25rem',
    padding: '0.625rem 0.25rem', background: '#0B0F1A', border: '1px solid #1E293B', borderRadius: '0.375rem',
    color: '#CBD5E1', cursor: 'grab', fontSize: '0.6875rem', transition: 'border-color 0.15s',
  },
  blockIcon: { fontSize: '1.125rem' },
  blockLabel: { fontSize: '0.625rem', color: '#94A3B8' },
  treeItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
    padding: '0.375rem 0.75rem', background: 'none', border: 'none', color: '#CBD5E1',
    fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left' as const,
  },
  treeItemActive: { backgroundColor: 'rgba(59,130,246,0.08)', color: '#3B82F6' },
  treeIcon: { fontSize: '0.75rem', width: '1rem', textAlign: 'center' as const },
  treeLabel: { fontSize: '0.75rem' },
  layerItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer',
  },
  layerBtn: {
    width: '20px', height: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
    fontSize: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyMsg: { textAlign: 'center' as const, color: '#64748B', padding: '2rem', fontSize: '0.8125rem' },
};
