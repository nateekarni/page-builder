/**
 * Site Settings Component
 *
 * Tabs: Site Identity | Social Links | Design Tokens
 * Data fetched/saved via /api/settings API.
 *
 * Clean Code: generic settings form pattern, data hooks separated from UI.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface SiteIdentity {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

// ============================================================================
// DATA HOOK
// ============================================================================

function useSetting<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/settings?key=${key}`);
      const data = await res.json();
      if (data.success && data.data) {
        setValue(data.data as T);
      }
    } catch {
      console.error(`Failed to load setting: ${key}`);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const save = useCallback(async (newValue: T) => {
    try {
      setIsSaving(true);
      setMessage('');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setValue(newValue);
        setMessage('บันทึกสำเร็จ');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('เกิดข้อผิดพลาด');
      }
    } catch {
      setMessage('เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  return { value, setValue, isLoading, isSaving, save, message };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SiteSettings() {
  const [activeTab, setActiveTab] = useState<'identity' | 'social' | 'design'>('identity');

  const tabs = [
    { id: 'identity' as const, label: 'ข้อมูลเว็บไซต์' },
    { id: 'social' as const, label: 'โซเชียลลิงก์' },
    { id: 'design' as const, label: 'ดีไซน์โทเค็น' },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'identity' && <SiteIdentityTab />}
      {activeTab === 'social' && <SocialLinksTab />}
      {activeTab === 'design' && <DesignTokensTab />}
    </div>
  );
}

// ============================================================================
// SITE IDENTITY TAB
// ============================================================================

function SiteIdentityTab() {
  const { value, setValue, isLoading, isSaving, save, message } = useSetting<SiteIdentity>(
    'site_identity',
    { siteName: '', tagline: '', logoUrl: '', faviconUrl: '' },
  );

  if (isLoading) return <div style={styles.loading}>กำลังโหลด...</div>;

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>ข้อมูลเว็บไซต์</h3>
      {message && <div style={styles.successMsg}>{message}</div>}

      <div style={styles.formGrid}>
        <div style={styles.field}>
          <label style={styles.label}>ชื่อเว็บไซต์</label>
          <input
            style={styles.input}
            value={value.siteName}
            onChange={(e) => setValue({ ...value, siteName: e.target.value })}
            placeholder="Aglow Portfolio"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Tagline</label>
          <input
            style={styles.input}
            value={value.tagline}
            onChange={(e) => setValue({ ...value, tagline: e.target.value })}
            placeholder="สร้างเว็บไซต์ที่โดดเด่น"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Logo URL</label>
          <input
            style={styles.input}
            value={value.logoUrl}
            onChange={(e) => setValue({ ...value, logoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Favicon URL</label>
          <input
            style={styles.input}
            value={value.faviconUrl}
            onChange={(e) => setValue({ ...value, faviconUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <button style={styles.saveBtn} disabled={isSaving} onClick={() => save(value)}>
        {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  );
}

// ============================================================================
// SOCIAL LINKS TAB
// ============================================================================

function SocialLinksTab() {
  const { value, setValue, isLoading, isSaving, save, message } = useSetting<{ links: SocialLink[] }>(
    'social_links',
    { links: [] },
  );

  function addLink() {
    setValue({
      links: [...value.links, { id: crypto.randomUUID(), platform: '', url: '' }],
    });
  }

  function removeLink(id: string) {
    setValue({ links: value.links.filter((l) => l.id !== id) });
  }

  function updateLink(id: string, field: 'platform' | 'url', val: string) {
    setValue({
      links: value.links.map((l) => (l.id === id ? { ...l, [field]: val } : l)),
    });
  }

  if (isLoading) return <div style={styles.loading}>กำลังโหลด...</div>;

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={styles.cardTitle}>โซเชียลลิงก์</h3>
        <button style={styles.addBtn} onClick={addLink}>+ เพิ่ม</button>
      </div>
      {message && <div style={styles.successMsg}>{message}</div>}

      {value.links.length === 0 && (
        <div style={{ color: '#64748B', fontSize: '0.875rem', padding: '1rem 0' }}>
          ยังไม่มีลิงก์ — คลิก "+ เพิ่ม" เพื่อเริ่มต้น
        </div>
      )}

      {value.links.map((link) => (
        <div key={link.id} style={styles.linkRow}>
          <select
            style={{ ...styles.input, flex: 1 }}
            value={link.platform}
            onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
          >
            <option value="">เลือก Platform</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter / X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="line">LINE</option>
            <option value="github">GitHub</option>
          </select>
          <input
            style={{ ...styles.input, flex: 2 }}
            value={link.url}
            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
            placeholder="https://..."
          />
          <button style={styles.removeBtn} onClick={() => removeLink(link.id)}>✕</button>
        </div>
      ))}

      <button style={{ ...styles.saveBtn, marginTop: '1rem' }} disabled={isSaving} onClick={() => save(value)}>
        {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  );
}

// ============================================================================
// DESIGN TOKENS TAB
// ============================================================================

interface DesignTokensValue {
  colors: Record<string, string>;
  typography: { headingFont: string; bodyFont: string; baseFontSize: string; lineHeight: string };
  spacing: { baseUnit: string; sectionPadding: string; containerMaxWidth: string };
  borders: { radius: string; radiusLg: string };
}

const DEFAULT_TOKENS: DesignTokensValue = {
  colors: {
    primary: '#3B82F6', secondary: '#6366F1', accent: '#F59E0B',
    background: '#FFFFFF', foreground: '#0F172A', muted: '#F1F5F9',
    mutedForeground: '#64748B', border: '#E2E8F0',
  },
  typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: '16px', lineHeight: '1.6' },
  spacing: { baseUnit: '0.25rem', sectionPadding: '4rem', containerMaxWidth: '1200px' },
  borders: { radius: '0.5rem', radiusLg: '1rem' },
};

const COLOR_LABELS: Record<string, string> = {
  primary: 'หลัก (Primary)', secondary: 'รอง (Secondary)', accent: 'เน้น (Accent)',
  background: 'พื้นหลัง', foreground: 'ข้อความ', muted: 'Muted BG',
  mutedForeground: 'Muted Text', border: 'ขอบ',
};

function DesignTokensTab() {
  const { value, setValue, isLoading, isSaving, save, message } = useSetting<DesignTokensValue>(
    'design_tokens',
    DEFAULT_TOKENS,
  );

  function updateColor(key: string, color: string) {
    setValue({ ...value, colors: { ...value.colors, [key]: color } });
  }

  function updateTypography(key: string, val: string) {
    setValue({ ...value, typography: { ...value.typography, [key]: val } });
  }

  function updateSpacing(key: string, val: string) {
    setValue({ ...value, spacing: { ...value.spacing, [key]: val } });
  }

  if (isLoading) return <div style={styles.loading}>กำลังโหลด...</div>;

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>ดีไซน์โทเค็น</h3>
      <p style={{ color: '#94A3B8', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
        ค่าเหล่านี้จะถูกใช้เป็น CSS Custom Properties ทั่วทั้งเว็บไซต์
      </p>
      {message && <div style={styles.successMsg}>{message}</div>}

      {/* Colors */}
      <div style={styles.tokenSection}>
        <h4 style={styles.tokenSectionTitle}>สี</h4>
        <div style={styles.colorGrid}>
          {Object.entries(value.colors).map(([key, color]) => (
            <div key={key} style={styles.colorField}>
              <label style={styles.label}>{COLOR_LABELS[key] ?? key}</label>
              <div style={styles.colorInputRow}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(key, e.target.value)}
                  style={styles.colorPicker}
                />
                <input
                  style={{ ...styles.input, fontFamily: 'monospace', fontSize: '0.75rem' }}
                  value={color}
                  onChange={(e) => updateColor(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div style={styles.tokenSection}>
        <h4 style={styles.tokenSectionTitle}>ตัวอักษร</h4>
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Heading Font</label>
            <input style={styles.input} value={value.typography.headingFont} onChange={(e) => updateTypography('headingFont', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Body Font</label>
            <input style={styles.input} value={value.typography.bodyFont} onChange={(e) => updateTypography('bodyFont', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Base Font Size</label>
            <input style={styles.input} value={value.typography.baseFontSize} onChange={(e) => updateTypography('baseFontSize', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Line Height</label>
            <input style={styles.input} value={value.typography.lineHeight} onChange={(e) => updateTypography('lineHeight', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div style={styles.tokenSection}>
        <h4 style={styles.tokenSectionTitle}>ระยะห่าง</h4>
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Base Unit</label>
            <input style={styles.input} value={value.spacing.baseUnit} onChange={(e) => updateSpacing('baseUnit', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Section Padding</label>
            <input style={styles.input} value={value.spacing.sectionPadding} onChange={(e) => updateSpacing('sectionPadding', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Container Max Width</label>
            <input style={styles.input} value={value.spacing.containerMaxWidth} onChange={(e) => updateSpacing('containerMaxWidth', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div style={styles.tokenSection}>
        <h4 style={styles.tokenSectionTitle}>ตัวอย่างดีไซน์</h4>
        <div style={{
          padding: '1.5rem',
          borderRadius: value.borders.radius,
          backgroundColor: value.colors.background,
          border: `1px solid ${value.colors.border}`,
        }}>
          <h2 style={{ fontFamily: `'${value.typography.headingFont}', sans-serif`, color: value.colors.foreground, marginBottom: '0.5rem' }}>
            Heading Example
          </h2>
          <p style={{ fontFamily: `'${value.typography.bodyFont}', sans-serif`, color: value.colors.mutedForeground, fontSize: value.typography.baseFontSize, lineHeight: value.typography.lineHeight }}>
            Body text preview with the selected typography settings.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button style={{ padding: '0.5rem 1rem', background: value.colors.primary, color: '#FFF', border: 'none', borderRadius: value.borders.radius, fontWeight: 600 }}>Primary</button>
            <button style={{ padding: '0.5rem 1rem', background: value.colors.secondary, color: '#FFF', border: 'none', borderRadius: value.borders.radius, fontWeight: 600 }}>Secondary</button>
            <button style={{ padding: '0.5rem 1rem', background: value.colors.accent, color: '#FFF', border: 'none', borderRadius: value.borders.radius, fontWeight: 600 }}>Accent</button>
          </div>
        </div>
      </div>

      <button style={{ ...styles.saveBtn, marginTop: '1rem' }} disabled={isSaving} onClick={() => save(value)}>
        {isSaving ? 'กำลังบันทึก...' : 'บันทึกดีไซน์โทเค็น'}
      </button>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  tabBar: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #1E293B',
    paddingBottom: '0',
  },
  tab: {
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#94A3B8',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#3B82F6',
    borderBottomColor: '#3B82F6',
  },
  card: {
    background: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#F8FAFC',
    margin: '0 0 1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#94A3B8',
  },
  input: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#0B0F1A',
    border: '1px solid #334155',
    borderRadius: '0.375rem',
    color: '#F8FAFC',
    fontSize: '0.875rem',
    outline: 'none',
  },
  saveBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#3B82F6',
    color: '#FFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1.5rem',
  },
  successMsg: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '0.375rem',
    color: '#6EE7B7',
    fontSize: '0.8125rem',
    marginBottom: '1rem',
  },
  loading: { color: '#94A3B8', padding: '2rem', textAlign: 'center' as const },
  addBtn: {
    padding: '0.375rem 0.75rem',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '0.375rem',
    color: '#60A5FA',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  linkRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  removeBtn: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.375rem',
    color: '#FCA5A5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tokenSection: {
    marginBottom: '1.5rem',
  },
  tokenSectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#CBD5E1',
    marginBottom: '0.75rem',
    paddingBottom: '0.375rem',
    borderBottom: '1px solid #1E293B',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  colorField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  colorInputRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  colorPicker: {
    width: '36px',
    height: '36px',
    padding: '2px',
    border: '1px solid #334155',
    borderRadius: '0.375rem',
    backgroundColor: '#0B0F1A',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
