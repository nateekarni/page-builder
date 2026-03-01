/** Icon Box Block */
import type { BlockComponentProps } from './index';
export default function IconBoxBlock({ block }: BlockComponentProps) {
  const props = block.props as { icon: string; title: string; description: string };
  return (
    <div style={styles.wrapper}>
      <span style={styles.icon}>{props.icon || '⭐'}</span>
      <h4 style={styles.title}>{props.title || 'Feature'}</h4>
      {props.description && <p style={styles.desc}>{props.description}</p>}
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { textAlign: 'center', padding: '1.5rem' },
  icon: { fontSize: '2rem', display: 'block', marginBottom: '0.75rem' },
  title: { fontSize: '1rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.375rem' },
  desc: { fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: 1.5 },
};
