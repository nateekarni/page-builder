/** Accordion Block */
import { useState } from 'react';
import type { BlockComponentProps } from './index';
export default function AccordionBlock({ block, children }: BlockComponentProps) {
  const props = block.props as { title: string; defaultOpen: boolean };
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <div style={styles.wrapper}>
      <button style={styles.header} onClick={() => setOpen(!open)}>
        <span>{props.title || 'Accordion'}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && <div style={styles.body}>{children ?? <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>วางบล็อกที่นี่</span>}</div>}
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { border: '1px solid #E2E8F0', borderRadius: '0.375rem', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.75rem 1rem', background: '#F8FAFC', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#334155' },
  body: { padding: '0.75rem 1rem', borderTop: '1px solid #E2E8F0' },
};
