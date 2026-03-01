/** Spacer Block */
import type { BlockComponentProps } from './index';
export default function SpacerBlock({ block }: BlockComponentProps) {
  const height = (block.props as { height: number }).height ?? 40;
  return <div style={{ height: `${height}px`, borderTop: '1px dashed #E2E8F0', borderBottom: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '0.625rem', color: '#CBD5E1' }}>{height}px</span></div>;
}
