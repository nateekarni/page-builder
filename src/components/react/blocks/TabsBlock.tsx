/** Tabs Block */
import { useState } from 'react';
import type { BlockComponentProps } from './index';
export default function TabsBlock({ block, children }: BlockComponentProps) {
  const props = block.props as { tabLabels: string };
  const labels = (props.tabLabels || 'Tab 1,Tab 2').split(',').map(l => l.trim());
  const [active, setActive] = useState(0);
  return (
    <div style={styles.wrapper}>
      <div style={styles.tabBar}>
        {labels.map((label, i) => (
          <button key={i} style={{ ...styles.tab, ...(active === i ? styles.tabActive : {}) }} onClick={() => setActive(i)}>{label}</button>
        ))}
      </div>
      <div style={styles.body}>{children ?? <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>เนื้อหาแท็บ {labels[active]}</span>}</div>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { border: '1px solid #E2E8F0', borderRadius: '0.375rem', overflow: 'hidden' },
  tabBar: { display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' },
  tab: { padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748B' },
  tabActive: { color: '#3B82F6', borderBottomColor: '#3B82F6', fontWeight: 500 },
  body: { padding: '0.75rem 1rem', minHeight: '60px' },
};
