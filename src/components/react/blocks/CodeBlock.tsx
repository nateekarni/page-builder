/** Code Block */
import type { BlockComponentProps } from './index';
export default function CodeBlock({ block }: BlockComponentProps) {
  const props = block.props as { code: string; language: string };
  return (
    <div style={styles.wrapper}>
      <div style={styles.lang}>{props.language || 'code'}</div>
      <pre style={styles.pre}><code>{props.code || '// โค้ดของคุณ'}</code></pre>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { position: 'relative', borderRadius: '0.5rem', overflow: 'hidden' },
  lang: { position: 'absolute', top: '0.375rem', right: '0.5rem', fontSize: '0.625rem', color: '#94A3B8', textTransform: 'uppercase' },
  pre: { margin: 0, padding: '1rem', backgroundColor: '#1E293B', color: '#E2E8F0', fontSize: '0.8125rem', lineHeight: 1.6, overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', monospace" },
};
