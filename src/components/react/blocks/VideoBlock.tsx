/** Video Block — Embed player */
import type { BlockComponentProps } from './index';

export default function VideoBlock({ block }: BlockComponentProps) {
  const props = block.props as { url: string; aspectRatio: string };

  if (!props.url) {
    return <div style={styles.placeholder}><span>▶</span><span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>ใส่ URL วิดีโอ</span></div>;
  }

  // Convert YouTube/Vimeo URL to embed
  const embedUrl = toEmbedUrl(props.url);

  return (
    <div style={{ ...styles.wrapper, aspectRatio: props.aspectRatio || '16/9' }}>
      <iframe src={embedUrl} style={styles.iframe} allowFullScreen frameBorder="0" />
    </div>
  );
}

function toEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

const styles: Record<string, React.CSSProperties> = {
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', border: '1px dashed #CBD5E1', borderRadius: '0.5rem', fontSize: '2rem' },
  wrapper: { width: '100%', position: 'relative', borderRadius: '0.375rem', overflow: 'hidden', backgroundColor: '#000' },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
};
