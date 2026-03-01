/** Text Block — Inline editable text with tag selection */
import React from 'react';
import type { BlockComponentProps } from './index';

export default function TextBlock({ block, onUpdate }: BlockComponentProps) {
  const props = block.props as { content: string; tag: string };
  const tag = (props.tag || 'p') as 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';

  return (
    <div style={styles.wrapper}>
      {React.createElement(tag, {
        contentEditable: true,
        suppressContentEditableWarning: true,
        style: styles.editable,
        onBlur: (e: React.FocusEvent<HTMLElement>) => onUpdate({ content: e.currentTarget.innerText }),
        children: props.content || 'คลิกเพื่อพิมพ์ข้อความ...',
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { padding: '0.25rem' },
  editable: { outline: 'none', minHeight: '1.5em', lineHeight: 1.6, color: '#1E293B' },
};
