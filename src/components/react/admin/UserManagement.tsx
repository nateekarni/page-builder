/**
 * User Management Component
 *
 * Admin-only React component for CRUD operations on users.
 * Features: user list with role badges, add/edit modal, delete confirmation.
 *
 * Clean Code: data fetching separated from UI via hooks.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  image: string | null;
  createdAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'author';
}

// ============================================================================
// DATA HOOKS (separated from UI per Clean Code)
// ============================================================================

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}

// ============================================================================
// ROLE CONFIG
// ============================================================================

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  editor: { label: 'Editor', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  author: { label: 'Author', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export default function UserManagement() {
  const { users, isLoading, error, refetch } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formError, setFormError] = useState('');

  async function handleCreate(formData: UserFormData) {
    setFormError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || 'สร้างผู้ใช้ไม่สำเร็จ');
        return;
      }
      setShowModal(false);
      refetch();
    } catch {
      setFormError('เกิดข้อผิดพลาด');
    }
  }

  async function handleUpdateRole(userId: string, role: string) {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      refetch();
    } catch {
      console.error('Failed to update role');
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('ต้องการลบผู้ใช้นี้หรือไม่?')) return;
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      refetch();
    } catch {
      console.error('Failed to delete user');
    }
  }

  if (isLoading) return <div style={styles.loading}>กำลังโหลด...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>จัดการผู้ใช้</h2>
        <button onClick={() => { setEditUser(null); setShowModal(true); }} style={styles.addButton}>
          + เพิ่มผู้ใช้
        </button>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span style={{ ...styles.cell, flex: 2 }}>ชื่อ</span>
          <span style={{ ...styles.cell, flex: 2 }}>อีเมล</span>
          <span style={{ ...styles.cell, flex: 1 }}>บทบาท</span>
          <span style={{ ...styles.cell, flex: 1.5, textAlign: 'right' }}>การจัดการ</span>
        </div>
        {users.map((u) => (
          <div key={u.id} style={styles.tableRow}>
            <span style={{ ...styles.cell, flex: 2 }}>
              <strong>{u.name}</strong>
            </span>
            <span style={{ ...styles.cell, flex: 2, color: '#94A3B8' }}>{u.email}</span>
            <span style={{ ...styles.cell, flex: 1 }}>
              <span style={{
                ...styles.badge,
                color: ROLE_CONFIG[u.role].color,
                backgroundColor: ROLE_CONFIG[u.role].bg,
              }}>
                {ROLE_CONFIG[u.role].label}
              </span>
            </span>
            <span style={{ ...styles.cell, flex: 1.5, textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <select
                value={u.role}
                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                style={styles.select}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="author">Author</option>
              </select>
              <button onClick={() => handleDelete(u.id)} style={styles.deleteButton}>ลบ</button>
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ ...styles.tableRow, justifyContent: 'center', color: '#64748B' }}>
            ยังไม่มีผู้ใช้
          </div>
        )}
      </div>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          error={formError}
        />
      )}
    </div>
  );
}

// ============================================================================
// CREATE USER MODAL
// ============================================================================

function CreateUserModal({
  onClose,
  onCreate,
  error,
}: {
  onClose: () => void;
  onCreate: (data: UserFormData) => void;
  error: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'author'>('author');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate({ name, email, password, role });
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>เพิ่มผู้ใช้ใหม่</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.formError}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>ชื่อ</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>อีเมล</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>รหัสผ่าน</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>บทบาท</label>
            <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} style={styles.input}>
              <option value="author">Author</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>ยกเลิก</button>
            <button type="submit" style={styles.submitButton}>สร้างผู้ใช้</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '0' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: { fontSize: '1.5rem', fontWeight: 600, color: '#F8FAFC', margin: 0 },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3B82F6',
    color: '#FFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: { color: '#94A3B8', textAlign: 'center', padding: '2rem' },
  error: { color: '#FCA5A5', textAlign: 'center', padding: '2rem' },
  table: { borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden' },
  tableHeader: {
    display: 'flex',
    padding: '0.75rem 1rem',
    backgroundColor: '#1E293B',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'flex',
    padding: '0.75rem 1rem',
    borderTop: '1px solid #1E293B',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    fontSize: '0.875rem',
    color: '#F8FAFC',
  },
  cell: { minWidth: 0 },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  select: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '0.375rem',
    color: '#F8FAFC',
    fontSize: '0.75rem',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.375rem',
    color: '#FCA5A5',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modal: {
    width: '100%',
    maxWidth: '28rem',
    padding: '2rem',
    backgroundColor: '#1E293B',
    borderRadius: '1rem',
    border: '1px solid #334155',
  },
  modalTitle: { fontSize: '1.25rem', fontWeight: 600, color: '#F8FAFC', margin: '0 0 1.5rem' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' },
  label: { fontSize: '0.75rem', fontWeight: 500, color: '#CBD5E1' },
  input: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    color: '#F8FAFC',
    fontSize: '0.875rem',
  },
  formError: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.375rem',
    color: '#FCA5A5',
    fontSize: '0.875rem',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '0.5rem',
    color: '#FFF',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
};
