/** Container Block — Flex/Grid container with nested children support */
import type { BlockComponentProps } from './index';

export default function ContainerBlock({ block, children }: BlockComponentProps) {
  const props = block.props as { layout: string };
  const layoutStyle = props.layout === 'flex-row' ? { display: 'flex', flexDirection: 'row' as const, gap: '1rem' }
    : props.layout === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }
    : { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' };

  return (
    <div style={{ ...styles.container, ...layoutStyle }}>
      {children ?? <div style={styles.empty}>วางบล็อกที่นี่</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '0.75rem', border: '1px dashed #CBD5E1', borderRadius: '0.375rem', minHeight: '60px' },
  empty: { textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', padding: '1rem' },
};
