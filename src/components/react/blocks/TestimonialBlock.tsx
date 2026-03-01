/** Testimonial Block */
import type { BlockComponentProps } from './index';
export default function TestimonialBlock({ block }: BlockComponentProps) {
  const props = block.props as { quote: string; author: string; role: string };
  return (
    <blockquote style={styles.wrapper}>
      <p style={styles.quote}>"{props.quote || 'คำพูดของลูกค้า...'}"</p>
      <footer style={styles.footer}>
        <strong style={styles.author}>{props.author || 'ชื่อ'}</strong>
        {props.role && <span style={styles.role}>{props.role}</span>}
      </footer>
    </blockquote>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { margin: 0, padding: '1.5rem', borderLeft: '4px solid #3B82F6', backgroundColor: '#F1F5F9', borderRadius: '0 0.5rem 0.5rem 0' },
  quote: { fontSize: '1rem', fontStyle: 'italic', color: '#334155', lineHeight: 1.6, margin: '0 0 0.75rem' },
  footer: { display: 'flex', flexDirection: 'column', gap: '0.125rem' },
  author: { fontSize: '0.875rem', color: '#1E293B' },
  role: { fontSize: '0.75rem', color: '#64748B' },
};
