/**
 * Media Picker Modal
 *
 * Reusable modal that wraps MediaLibrary in selection mode.
 * Used in: editor (image block), settings (logo/favicon), user avatar.
 *
 * Clean Code: callback pattern → decoupled from caller logic.
 */

import MediaLibrary, { type MediaItem } from './MediaLibrary';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
  if (!isOpen) return null;

  function handleSelect(item: MediaItem) {
    onSelect(item);
    onClose();
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>เลือกสื่อ</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.content}>
          <MediaLibrary selectionMode onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}

export type { MediaItem };

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
  },
  modal: {
    width: '90vw', maxWidth: '900px', maxHeight: '85vh',
    backgroundColor: '#111827', borderRadius: '1rem', border: '1px solid #1E293B',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', borderBottom: '1px solid #1E293B',
  },
  title: { fontSize: '1.125rem', fontWeight: 600, color: '#F8FAFC', margin: 0 },
  closeBtn: {
    width: '32px', height: '32px', backgroundColor: 'transparent',
    border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#94A3B8', cursor: 'pointer', fontSize: '1rem',
  },
  content: { flex: 1, overflow: 'auto', padding: '1.25rem' },
};
