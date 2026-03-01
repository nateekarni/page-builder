/** Columns Block — Multi-column layout */
import type { BlockComponentProps } from './index';

export default function ColumnsBlock({ block, children }: BlockComponentProps) {
  const props = block.props as { columnCount: string; gap: number };
  const cols = Number(props.columnCount) || 2;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${props.gap ?? 16}px`, minHeight: '60px' }}>
      {children ?? Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={styles.emptyCol}>คอลัมน์ {i + 1}</div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  emptyCol: { border: '1px dashed #CBD5E1', borderRadius: '0.375rem', padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem' },
};
