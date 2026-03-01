/**
 * Properties Panel — Dynamic form per block type
 *
 * 3 tabs: Content | Style | Advanced
 * Uses registry pattern: blockPropertyRegistry[block.type] → correct fields.
 *
 * Clean Code: registry pattern for extensibility, no giant switch-case.
 */

import { useState } from 'react';
import { useEditorStore, selectSelectedBlock, selectViewport } from '@/stores/editor-store';
import type { Block, Viewport } from '@/lib/blocks';

// ============================================================================
// PROPERTY REGISTRY — maps block type → content fields
// ============================================================================

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'toggle' | 'url';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const BLOCK_FIELDS: Record<string, FieldConfig[]> = {
  text: [
    { key: 'content', label: 'เนื้อหา', type: 'textarea', placeholder: 'พิมพ์ข้อความ...' },
    { key: 'tag', label: 'แท็ก HTML', type: 'select', options: [
      { value: 'p', label: 'Paragraph' }, { value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' },
      { value: 'h3', label: 'H3' }, { value: 'h4', label: 'H4' }, { value: 'blockquote', label: 'Blockquote' },
    ]},
  ],
  image: [
    { key: 'src', label: 'URL รูปภาพ', type: 'url', placeholder: 'https://...' },
    { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'คำอธิบายรูปภาพ' },
    { key: 'caption', label: 'คำบรรยาย', type: 'text' },
  ],
  video: [
    { key: 'url', label: 'URL วิดีโอ', type: 'url', placeholder: 'YouTube / Vimeo URL' },
    { key: 'aspectRatio', label: 'สัดส่วน', type: 'select', options: [
      { value: '16/9', label: '16:9' }, { value: '4/3', label: '4:3' }, { value: '1/1', label: '1:1' },
    ]},
  ],
  hero: [
    { key: 'title', label: 'หัวข้อ', type: 'text' },
    { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' },
    { key: 'backgroundImage', label: 'รูปพื้นหลัง', type: 'url' },
    { key: 'ctaText', label: 'ข้อความปุ่ม', type: 'text' },
    { key: 'ctaUrl', label: 'ลิงก์ปุ่ม', type: 'url' },
  ],
  cta: [
    { key: 'text', label: 'ข้อความ', type: 'text' },
    { key: 'url', label: 'ลิงก์', type: 'url' },
    { key: 'variant', label: 'รูปแบบ', type: 'select', options: [
      { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'outline', label: 'Outline' },
    ]},
  ],
  code: [
    { key: 'code', label: 'โค้ด', type: 'textarea' },
    { key: 'language', label: 'ภาษา', type: 'select', options: [
      { value: 'javascript', label: 'JavaScript' }, { value: 'typescript', label: 'TypeScript' },
      { value: 'html', label: 'HTML' }, { value: 'css', label: 'CSS' }, { value: 'python', label: 'Python' },
    ]},
  ],
  spacer: [
    { key: 'height', label: 'ความสูง (px)', type: 'number' },
  ],
  testimonial: [
    { key: 'quote', label: 'คำพูด', type: 'textarea' },
    { key: 'author', label: 'ชื่อผู้พูด', type: 'text' },
    { key: 'role', label: 'ตำแหน่ง', type: 'text' },
  ],
  'icon-box': [
    { key: 'icon', label: 'ไอคอน', type: 'text' },
    { key: 'title', label: 'หัวข้อ', type: 'text' },
    { key: 'description', label: 'คำอธิบาย', type: 'textarea' },
  ],
  map: [
    { key: 'embedUrl', label: 'Google Maps Embed URL', type: 'url' },
    { key: 'height', label: 'ความสูง (px)', type: 'number' },
  ],
  columns: [
    { key: 'columnCount', label: 'จำนวนคอลัมน์', type: 'select', options: [
      { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '6', label: '6' },
    ]},
    { key: 'gap', label: 'ระยะห่าง (px)', type: 'number' },
  ],
  container: [
    { key: 'layout', label: 'Layout', type: 'select', options: [
      { value: 'flex-col', label: 'Flex Column' }, { value: 'flex-row', label: 'Flex Row' }, { value: 'grid', label: 'Grid' },
    ]},
  ],
  accordion: [
    { key: 'title', label: 'หัวข้อ', type: 'text' },
    { key: 'defaultOpen', label: 'เปิดค่าเริ่มต้น', type: 'toggle' },
  ],
  tabs: [
    { key: 'tabLabels', label: 'ชื่อแท็บ (คั่นด้วย ,)', type: 'text', placeholder: 'Tab1,Tab2,Tab3' },
  ],
  form: [
    { key: 'formTitle', label: 'ชื่อฟอร์ม', type: 'text' },
    { key: 'submitText', label: 'ข้อความปุ่มส่ง', type: 'text' },
  ],
  'query-loop': [
    { key: 'entityType', label: 'ประเภทข้อมูล', type: 'select', options: [
      { value: 'pages', label: 'Pages' }, { value: 'media', label: 'Media' },
    ]},
    { key: 'limit', label: 'จำนวน', type: 'number' },
  ],
};

// ============================================================================
// STYLE FIELDS (responsive)
// ============================================================================

const STYLE_FIELDS: FieldConfig[] = [
  { key: 'marginTop', label: 'Margin Top', type: 'text', placeholder: '0px' },
  { key: 'marginBottom', label: 'Margin Bottom', type: 'text', placeholder: '0px' },
  { key: 'paddingTop', label: 'Padding Top', type: 'text', placeholder: '0px' },
  { key: 'paddingBottom', label: 'Padding Bottom', type: 'text', placeholder: '0px' },
  { key: 'paddingLeft', label: 'Padding Left', type: 'text', placeholder: '0px' },
  { key: 'paddingRight', label: 'Padding Right', type: 'text', placeholder: '0px' },
  { key: 'backgroundColor', label: 'Background Color', type: 'color' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'textAlign', label: 'Text Align', type: 'select', options: [
    { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
  ]},
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PropertiesPanel() {
  const block = useEditorStore(selectSelectedBlock);
  const viewport = useEditorStore(selectViewport);
  const { updateBlock } = useEditorStore();
  const [tab, setTab] = useState<'content' | 'style' | 'advanced'>('content');

  if (!block) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
        <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>เลือกบล็อกเพื่อแก้ไขคุณสมบัติ</div>
      </div>
    );
  }

  const fields = BLOCK_FIELDS[block.type] ?? [];

  function updateProp(key: string, value: unknown) {
    updateBlock(block!.id, { props: { ...(block!.props as Record<string, unknown>), [key]: value } } as unknown as Partial<Block>);
  }

  function updateStyle(key: string, value: string) {
    const currentStyles = (block!.styles ?? {}) as Record<string, unknown>;
    const vpStyles = ((currentStyles[viewport] as Record<string, unknown>) ?? {});
    updateBlock(block!.id, {
      styles: { ...currentStyles, [viewport]: { ...vpStyles, [key]: value } },
    } as unknown as Partial<Block>);
  }

  function updateVisibility(value: boolean) {
    const vis = block!.visibility ?? { desktop: true };
    updateBlock(block!.id, { visibility: { ...vis, [viewport]: value } } as unknown as Partial<Block>);
  }

  function renderField(field: FieldConfig, getValue: (key: string) => unknown, onChange: (key: string, val: unknown) => void) {
    const value = getValue(field.key);

    switch (field.type) {
      case 'textarea':
        return <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} value={(value as string) ?? ''} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} />;
      case 'select':
        return (
          <select style={styles.input} value={(value as string) ?? ''} onChange={(e) => onChange(field.key, e.target.value)}>
            <option value="">เลือก...</option>
            {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'color':
        return (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="color" value={(value as string) ?? '#000000'} onChange={(e) => onChange(field.key, e.target.value)} style={{ width: '32px', height: '32px', padding: 0, border: '1px solid #334155', borderRadius: '0.25rem', cursor: 'pointer' }} />
            <input style={{ ...styles.input, fontFamily: 'monospace', fontSize: '0.75rem', flex: 1 }} value={(value as string) ?? ''} onChange={(e) => onChange(field.key, e.target.value)} />
          </div>
        );
      case 'toggle':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!value} onChange={(e) => onChange(field.key, e.target.checked)} />
            <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{value ? 'เปิด' : 'ปิด'}</span>
          </label>
        );
      case 'number':
        return <input type="number" style={styles.input} value={(value as number) ?? ''} onChange={(e) => onChange(field.key, Number(e.target.value))} placeholder={field.placeholder} />;
      default:
        return <input style={styles.input} value={(value as string) ?? ''} onChange={(e) => onChange(field.key, e.target.value)} placeholder={field.placeholder} />;
    }
  }

  const tabs = [
    { id: 'content' as const, label: 'เนื้อหา' },
    { id: 'style' as const, label: 'สไตล์' },
    { id: 'advanced' as const, label: 'ขั้นสูง' },
  ];

  return (
    <div>
      {/* Block type header */}
      <div style={styles.header}>
        <span style={styles.blockType}>{block.type}</span>
        <span style={styles.blockId}>#{block.id.slice(0, 8)}</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {tab === 'content' && (
        <div style={styles.body}>
          {fields.length === 0 ? (
            <div style={styles.noFields}>บล็อกนี้ไม่มีคุณสมบัติที่แก้ไขได้</div>
          ) : (
            fields.map((f) => (
              <div key={f.key} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                {renderField(f, (k) => (block.props as Record<string, unknown>)[k], updateProp)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Style Tab */}
      {tab === 'style' && (
        <div style={styles.body}>
          <div style={styles.vpBadge}>
            กำลังแก้ไขสำหรับ: <strong>{viewport === 'desktop' ? '🖥️ Desktop' : viewport === 'tablet' ? '💻 Tablet' : '📱 Mobile'}</strong>
          </div>
          {STYLE_FIELDS.map((f) => (
            <div key={f.key} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              {renderField(
                f,
                (k) => ((block.styles as unknown as Record<string, Record<string, unknown>>)?.[viewport] as Record<string, unknown>)?.[k],
                (k, v) => updateStyle(k, v as string),
              )}
            </div>
          ))}
        </div>
      )}

      {/* Advanced Tab */}
      {tab === 'advanced' && (
        <div style={styles.body}>
          <div style={styles.field}>
            <label style={styles.label}>แสดงบน {viewport === 'desktop' ? '🖥️ Desktop' : viewport === 'tablet' ? '💻 Tablet' : '📱 Mobile'}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={block.visibility?.[viewport] ?? block.visibility?.desktop ?? true}
                onChange={(e) => updateVisibility(e.target.checked)}
              />
              <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>แสดงบล็อกนี้</span>
            </label>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Custom CSS</label>
            <textarea
              style={{ ...styles.input, minHeight: '100px', fontFamily: 'monospace', fontSize: '0.75rem' }}
              value={((block as unknown as Record<string, unknown>).customCSS as string) ?? ''}
              onChange={(e) => updateBlock(block.id, { customCSS: e.target.value } as unknown as Partial<Block>)}
              placeholder=".block { /* CSS */ }"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #1E293B' },
  blockType: { fontSize: '0.8125rem', fontWeight: 600, color: '#F8FAFC', textTransform: 'capitalize' as const },
  blockId: { fontSize: '0.625rem', fontFamily: 'monospace', color: '#64748B' },
  tabBar: { display: 'flex', borderBottom: '1px solid #1E293B' },
  tab: {
    flex: 1, padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' as const,
    color: '#64748B', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer',
  },
  tabActive: { color: '#3B82F6', borderBottomColor: '#3B82F6' },
  body: { padding: '0.75rem' },
  field: { marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.6875rem', fontWeight: 500, color: '#94A3B8', marginBottom: '0.25rem' },
  input: {
    width: '100%', padding: '0.375rem 0.5rem', backgroundColor: '#0B0F1A', border: '1px solid #334155',
    borderRadius: '0.25rem', color: '#F8FAFC', fontSize: '0.8125rem',
  },
  vpBadge: {
    fontSize: '0.75rem', color: '#94A3B8', padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
    backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '0.375rem', border: '1px solid rgba(59,130,246,0.1)',
  },
  noFields: { color: '#64748B', fontSize: '0.8125rem', textAlign: 'center' as const, padding: '1.5rem' },
};
