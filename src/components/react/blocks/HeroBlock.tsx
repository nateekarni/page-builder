/** Hero Block */
import type { BlockComponentProps } from './index';
export default function HeroBlock({ block, onUpdate }: BlockComponentProps) {
  const props = block.props as { title: string; subtitle: string; backgroundImage: string; ctaText: string; ctaUrl: string };
  return (
    <div style={{ ...styles.hero, backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined }}>
      <h1 contentEditable suppressContentEditableWarning style={styles.title} onBlur={(e) => onUpdate({ title: (e.target as HTMLElement).innerText })}>{props.title || 'Hero Title'}</h1>
      {props.subtitle && <p style={styles.subtitle}>{props.subtitle}</p>}
      {props.ctaText && <a href={props.ctaUrl || '#'} style={styles.cta}>{props.ctaText}</a>}
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  hero: { padding: '4rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #1E293B, #334155)', borderRadius: '0.5rem', backgroundSize: 'cover', backgroundPosition: 'center' },
  title: { fontSize: '2.5rem', fontWeight: 700, color: '#FFF', margin: '0 0 0.5rem', outline: 'none' },
  subtitle: { fontSize: '1.125rem', color: '#CBD5E1', margin: '0 0 1.5rem' },
  cta: { display: 'inline-block', padding: '0.75rem 2rem', backgroundColor: '#3B82F6', color: '#FFF', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 },
};
