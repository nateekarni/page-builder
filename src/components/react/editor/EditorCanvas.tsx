/**
 * Editor Canvas — Block rendering + DnD drop zone
 *
 * Renders blocks in the canvas area with selection, drop indicators,
 * and sortable ordering via @dnd-kit/react.
 *
 * Clean Code: DnD logic in hook, rendering stays declarative.
 */

import { useEditorStore, selectBlocks, selectSelectedBlockId, selectViewport } from '@/stores/editor-store';
import type { Block, Viewport } from '@/lib/blocks';

// ============================================================================
// BLOCK RENDERER (within canvas — editable, selectable)
// ============================================================================

function CanvasBlock({ block, depth = 0 }: { block: Block; depth?: number }) {
  const selectedId = useEditorStore(selectSelectedBlockId);
  const viewport = useEditorStore(selectViewport);
  const { selectBlock } = useEditorStore();
  const isSelected = selectedId === block.id;

  // Check visibility for current viewport
  const visibility = block.visibility;
  const isVisible = visibility?.[viewport] ?? visibility?.desktop ?? true;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    selectBlock(block.id);
  }

  return (
    <div
      style={{
        ...canvasStyles.block,
        ...(isSelected ? canvasStyles.blockSelected : {}),
        ...(isVisible ? {} : canvasStyles.blockHidden),
        minHeight: block.type === 'spacer' ? '40px' : undefined,
      }}
      onClick={handleClick}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {/* Block type label */}
      <div style={canvasStyles.blockLabel}>
        {block.type}
        {!isVisible && <span style={canvasStyles.hiddenBadge}>ซ่อน ({viewport})</span>}
      </div>

      {/* Block content preview */}
      <div style={canvasStyles.blockContent}>
        <BlockPreview block={block} />
      </div>

      {/* Children (for container/columns/tabs) */}
      {block.children && block.children.length > 0 && (
        <div style={canvasStyles.children}>
          {block.children.map((child) => (
            <CanvasBlock key={child.id} block={child} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Empty children drop zone */}
      {block.children !== undefined && block.children.length === 0 && (
        <div style={canvasStyles.emptyDropZone}>
          วางบล็อกที่นี่
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BLOCK PREVIEW (simplified visual representation)
// ============================================================================

function BlockPreview({ block }: { block: Block }) {
  const props = block.props as Record<string, unknown>;

  switch (block.type) {
    case 'text':
      return <div style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.5 }}>{(props.content as string)?.slice(0, 100) || 'ข้อความ...'}</div>;
    case 'image':
      return props.src
        ? <img src={props.src as string} alt={props.alt as string ?? ''} style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '0.25rem' }} />
        : <div style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>เลือกรูปภาพ</div>;
    case 'hero':
      return <div style={{ padding: '1.5rem', textAlign: 'center', background: '#F1F5F9', borderRadius: '0.25rem' }}><strong>{(props.title as string) || 'Hero Section'}</strong></div>;
    case 'cta':
      return <div style={{ padding: '0.5rem 1rem', backgroundColor: '#3B82F6', color: '#FFF', borderRadius: '0.375rem', display: 'inline-block', fontSize: '0.8125rem' }}>{(props.text as string) || 'Click'}</div>;
    case 'spacer':
      return <div style={{ height: '20px', borderTop: '1px dashed #CBD5E1' }} />;
    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0.5rem 0' }} />;
    case 'video':
      return <div style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>🎬 {(props.url as string) || 'Video embed'}</div>;
    case 'code':
      return <pre style={{ fontSize: '0.6875rem', backgroundColor: '#F1F5F9', padding: '0.5rem', borderRadius: '0.25rem', overflow: 'hidden' }}>{(props.code as string)?.slice(0, 80) || '// code'}</pre>;
    case 'accordion':
      return <div style={{ fontSize: '0.8125rem', color: '#334155' }}>▼ Accordion</div>;
    case 'tabs':
      return <div style={{ fontSize: '0.8125rem', color: '#334155' }}>⊟ Tabs</div>;
    case 'form':
      return <div style={{ fontSize: '0.8125rem', color: '#334155' }}>📋 Form</div>;
    case 'map':
      return <div style={{ fontSize: '0.8125rem', color: '#334155' }}>📍 Map</div>;
    case 'testimonial':
      return <div style={{ fontSize: '0.8125rem', color: '#334155', fontStyle: 'italic' }}>"{(props.quote as string)?.slice(0, 60) || 'Quote...'}"</div>;
    case 'icon-box':
      return <div style={{ fontSize: '0.8125rem', color: '#334155' }}>◆ {(props.title as string) || 'Icon Box'}</div>;
    case 'query-loop':
      return <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>🔄 Query Loop</div>;
    default:
      return <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{block.type}</div>;
  }
}

// ============================================================================
// MAIN CANVAS
// ============================================================================

export default function EditorCanvas() {
  const blocks = useEditorStore(selectBlocks);
  const { selectBlock } = useEditorStore();

  return (
    <div
      style={canvasStyles.canvas}
      onClick={() => selectBlock(null)}
    >
      {blocks.length === 0 ? (
        <div style={canvasStyles.empty}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>หน้าว่าง</div>
          <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>เลือกบล็อกจาก Sidebar แล้วเริ่มสร้างหน้า</div>
        </div>
      ) : (
        blocks.map((block) => (
          <CanvasBlock key={block.id} block={block} />
        ))
      )}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const canvasStyles: Record<string, React.CSSProperties> = {
  canvas: { padding: '1.5rem', minHeight: '100%', cursor: 'default' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' },
  block: {
    position: 'relative', padding: '0.5rem', margin: '0.25rem 0', border: '1px solid transparent',
    borderRadius: '0.375rem', transition: 'border-color 0.1s, box-shadow 0.1s', cursor: 'pointer',
  },
  blockSelected: {
    borderColor: '#3B82F6', boxShadow: '0 0 0 1px #3B82F6',
  },
  blockHidden: { opacity: 0.3, borderStyle: 'dashed', borderColor: '#94A3B8' },
  blockLabel: {
    position: 'absolute', top: '-0.5rem', left: '0.5rem', fontSize: '0.5625rem',
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
    color: '#64748B', backgroundColor: '#FFF', padding: '0 0.25rem',
    display: 'flex', gap: '0.375rem', alignItems: 'center',
  },
  hiddenBadge: {
    fontSize: '0.5rem', color: '#F59E0B', backgroundColor: '#FEF3C7',
    padding: '0.0625rem 0.25rem', borderRadius: '0.25rem',
  },
  blockContent: { padding: '0.25rem 0' },
  children: { paddingLeft: '0.5rem', borderLeft: '2px solid #E2E8F0', marginTop: '0.5rem' },
  emptyDropZone: {
    padding: '1.5rem', textAlign: 'center', border: '1px dashed #CBD5E1',
    borderRadius: '0.25rem', color: '#94A3B8', fontSize: '0.75rem', marginTop: '0.25rem',
  },
};
