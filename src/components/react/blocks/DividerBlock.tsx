/** Divider Block */
import type { BlockComponentProps } from './index';
export default function DividerBlock({ block }: BlockComponentProps) {
  const props = block.props as { style: string; color: string };
  return <hr style={{ border: 'none', borderTop: `1px ${props.style || 'solid'} ${props.color || '#E2E8F0'}`, margin: '0.5rem 0' }} />;
}
