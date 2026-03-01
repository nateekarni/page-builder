/** Query Loop Block — Dynamic content placeholder */
import type { BlockComponentProps } from './index';
export default function QueryLoopBlock({ block }: BlockComponentProps) {
  const props = block.props as { entityType: string; limit: number };
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>🔄 Query Loop</div>
      <div style={styles.info}>
        <span>ประเภท: <strong>{props.entityType || 'pages'}</strong></span>
        <span>จำนวน: <strong>{props.limit || 6}</strong></span>
      </div>
      <div style={styles.grid}>
        {Array.from({ length: Math.min(props.limit || 6, 6) }).map((_, i) => (
          <div key={i} style={styles.placeholder}>Item {i + 1}</div>
        ))}
      </div>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { border: '1px dashed #6366F1', borderRadius: '0.5rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.03)' },
  header: { fontSize: '0.75rem', fontWeight: 600, color: '#6366F1', marginBottom: '0.5rem' },
  info: { display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' },
  placeholder: { padding: '1rem', backgroundColor: '#F1F5F9', borderRadius: '0.375rem', textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8' },
};
