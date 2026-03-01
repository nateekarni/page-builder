/** Image Block — With media picker integration placeholder */
import type { BlockComponentProps } from './index';

export default function ImageBlock({ block, onUpdate }: BlockComponentProps) {
  const props = block.props as { src: string; alt: string; caption: string };

  if (!props.src) {
    return (
      <div style={styles.placeholder}>
        <span style={{ fontSize: '2rem' }}>🖼️</span>
        <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>คลิกเพื่อเลือกรูปภาพ</span>
      </div>
    );
  }

  return (
    <figure style={styles.figure}>
      <img src={props.src} alt={props.alt} style={styles.img} />
      {props.caption && <figcaption style={styles.caption}>{props.caption}</figcaption>}
    </figure>
  );
}

const styles: Record<string, React.CSSProperties> = {
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', border: '1px dashed #CBD5E1', borderRadius: '0.5rem', cursor: 'pointer' },
  figure: { margin: 0 },
  img: { width: '100%', borderRadius: '0.375rem' },
  caption: { fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', textAlign: 'center' },
};
