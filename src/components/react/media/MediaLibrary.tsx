/**
 * Media Library Component
 *
 * Grid layout with search, filter, inline edit, delete, and upload.
 * Reused inside both the admin media page and the MediaPicker modal.
 *
 * Clean Code: data hook separated from UI, callback pattern for selection.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

interface MediaLibraryProps {
  /** If true, clicking a media item calls onSelect instead of opening edit */
  selectionMode?: boolean;
  onSelect?: (item: MediaItem) => void;
}

// ============================================================================
// DATA HOOK
// ============================================================================

function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch {
      console.error('Failed to fetch media');
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  return { items, isLoading, search, setSearch, typeFilter, setTypeFilter, page, setPage, totalPages, refetch: fetchMedia };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MediaLibrary({ selectionMode = false, onSelect }: MediaLibraryProps) {
  const { items, isLoading, search, setSearch, typeFilter, setTypeFilter, page, setPage, totalPages, refetch } = useMediaLibrary();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) refetch();
      else alert(data.error ?? 'Upload failed');
    } catch {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  async function handleSaveAlt(id: string) {
    await fetch(`/api/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altText: editAlt }),
    });
    setEditingId(null);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบไฟล์นี้หรือไม่?')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    refetch();
  }

  function handleItemClick(item: MediaItem) {
    if (selectionMode && onSelect) {
      onSelect(item);
    } else {
      setEditingId(item.id);
      setEditAlt(item.altText ?? '');
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          placeholder="ค้นหาไฟล์..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select style={styles.filterSelect} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">ทุกประเภท</option>
          <option value="image">รูปภาพ</option>
          <option value="video">วิดีโอ</option>
          <option value="application/pdf">PDF</option>
        </select>
        <label style={styles.uploadBtn}>
          {isUploading ? 'กำลังอัปโหลด...' : '+ อัปโหลด'}
          <input type="file" hidden accept="image/*,video/*,.pdf" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={styles.center}>กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div style={styles.center}>ไม่พบสื่อ</div>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.card,
                ...(selectionMode ? { cursor: 'pointer' } : {}),
              }}
              onClick={() => handleItemClick(item)}
            >
              {/* Thumbnail */}
              <div style={styles.thumbnail}>
                {item.mimeType.startsWith('image/') ? (
                  <img src={item.url} alt={item.altText ?? item.filename} style={styles.thumbImg} loading="lazy" />
                ) : item.mimeType.startsWith('video/') ? (
                  <div style={styles.thumbPlaceholder}>🎬</div>
                ) : (
                  <div style={styles.thumbPlaceholder}>📄</div>
                )}
              </div>

              {/* Info */}
              <div style={styles.cardInfo}>
                <span style={styles.filename} title={item.filename}>
                  {item.filename.length > 20 ? item.filename.slice(0, 20) + '...' : item.filename}
                </span>
                <span style={styles.meta}>{formatSize(item.sizeBytes)}</span>
              </div>

              {/* Actions (non-selection mode) */}
              {!selectionMode && (
                <div style={styles.cardActions}>
                  <button style={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} title="ลบ">🗑️</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>← ก่อนหน้า</button>
          <span style={styles.pageInfo}>{page} / {totalPages}</span>
          <button style={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>ถัดไป →</button>
        </div>
      )}

      {/* Inline edit modal */}
      {editingId && (
        <div style={styles.overlay} onClick={() => setEditingId(null)}>
          <div style={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#F8FAFC', margin: '0 0 1rem' }}>แก้ไข Alt Text</h3>
            <input
              style={styles.editInput}
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              placeholder="อธิบายรูปภาพ..."
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>ยกเลิก</button>
              <button style={styles.saveBtn} onClick={() => handleSaveAlt(editingId)}>บันทึก</button>
            </div>
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
  toolbar: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' as const },
  searchInput: {
    flex: 1, minWidth: '200px', padding: '0.5rem 0.75rem',
    backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#F8FAFC', fontSize: '0.875rem',
  },
  filterSelect: {
    padding: '0.5rem 0.75rem', backgroundColor: '#111827', border: '1px solid #334155',
    borderRadius: '0.375rem', color: '#F8FAFC', fontSize: '0.875rem',
  },
  uploadBtn: {
    padding: '0.5rem 1rem', backgroundColor: '#3B82F6', color: '#FFF',
    borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem',
  },
  card: {
    backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '0.5rem',
    overflow: 'hidden', transition: 'border-color 0.15s', position: 'relative' as const,
  },
  thumbnail: { width: '100%', aspectRatio: '1', backgroundColor: '#0B0F1A', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' as const },
  thumbPlaceholder: {
    width: '100%', height: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '2rem',
  },
  cardInfo: { padding: '0.5rem 0.625rem', display: 'flex', flexDirection: 'column' as const, gap: '0.125rem' },
  filename: { fontSize: '0.75rem', fontWeight: 500, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: '0.625rem', color: '#64748B' },
  cardActions: { position: 'absolute' as const, top: '0.375rem', right: '0.375rem' },
  actionBtn: {
    width: '28px', height: '28px', background: 'rgba(0,0,0,0.6)', border: 'none',
    borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem',
  },
  center: { textAlign: 'center' as const, color: '#64748B', padding: '3rem', fontSize: '0.875rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: {
    padding: '0.375rem 0.75rem', backgroundColor: '#111827', border: '1px solid #334155',
    borderRadius: '0.375rem', color: '#CBD5E1', fontSize: '0.8125rem', cursor: 'pointer',
  },
  pageInfo: { color: '#94A3B8', fontSize: '0.8125rem' },
  overlay: {
    position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
  },
  editModal: {
    width: '100%', maxWidth: '24rem', padding: '1.5rem',
    backgroundColor: '#1E293B', borderRadius: '0.75rem', border: '1px solid #334155',
  },
  editInput: {
    width: '100%', padding: '0.5rem 0.75rem', backgroundColor: '#0B0F1A',
    border: '1px solid #334155', borderRadius: '0.375rem', color: '#F8FAFC', fontSize: '0.875rem',
  },
  cancelBtn: {
    padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #334155',
    borderRadius: '0.375rem', color: '#94A3B8', cursor: 'pointer', fontSize: '0.8125rem',
  },
  saveBtn: {
    padding: '0.5rem 1rem', backgroundColor: '#3B82F6', border: 'none',
    borderRadius: '0.375rem', color: '#FFF', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
  },
};
