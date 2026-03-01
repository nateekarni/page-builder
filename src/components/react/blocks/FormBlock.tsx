/** Form Block — Dynamic form preview */
import type { BlockComponentProps } from './index';
export default function FormBlock({ block }: BlockComponentProps) {
  const props = block.props as { formTitle: string; submitText: string };
  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>{props.formTitle || 'ฟอร์ม'}</h3>
      <div style={styles.field}><label style={styles.label}>ชื่อ</label><input style={styles.input} placeholder="ชื่อของคุณ" readOnly /></div>
      <div style={styles.field}><label style={styles.label}>อีเมล</label><input style={styles.input} placeholder="email@example.com" readOnly /></div>
      <div style={styles.field}><label style={styles.label}>ข้อความ</label><textarea style={{ ...styles.input, minHeight: '60px' }} placeholder="ข้อความ..." readOnly /></div>
      <button style={styles.btn}>{props.submitText || 'ส่ง'}</button>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrapper: { padding: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem' },
  title: { fontSize: '1.125rem', fontWeight: 600, color: '#1E293B', margin: '0 0 1rem' },
  field: { marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' },
  input: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.875rem', backgroundColor: '#F8FAFC' },
  btn: { padding: '0.5rem 1.5rem', backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
};
