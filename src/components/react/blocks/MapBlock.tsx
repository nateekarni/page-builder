/** Map Block */
import type { BlockComponentProps } from './index';
export default function MapBlock({ block }: BlockComponentProps) {
  const props = block.props as { embedUrl: string; height: number };
  if (!props.embedUrl) return <div style={styles.placeholder}>📍 ใส่ Google Maps Embed URL</div>;
  return <iframe src={props.embedUrl} style={{ width: '100%', height: `${props.height || 400}px`, border: 'none', borderRadius: '0.375rem' }} allowFullScreen loading="lazy" />;
}
const styles: Record<string, React.CSSProperties> = {
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '1px dashed #CBD5E1', borderRadius: '0.5rem', color: '#94A3B8', fontSize: '0.875rem' },
};
