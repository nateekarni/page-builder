/** CTA Block */
import type { BlockComponentProps } from './index';
export default function CTABlock({ block }: BlockComponentProps) {
  const props = block.props as { text: string; url: string; variant: string };
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#3B82F6', color: '#FFF', border: 'none' },
    secondary: { backgroundColor: '#6366F1', color: '#FFF', border: 'none' },
    outline: { backgroundColor: 'transparent', color: '#3B82F6', border: '2px solid #3B82F6' },
  };
  return (
    <a href={props.url || '#'} style={{ ...styles.btn, ...(variantStyles[props.variant] ?? variantStyles.primary) }}>
      {props.text || 'Click Me'}
    </a>
  );
}
const styles: Record<string, React.CSSProperties> = {
  btn: { display: 'inline-block', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', cursor: 'pointer' },
};
