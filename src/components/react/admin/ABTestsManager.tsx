/**
 * ABTestsManager — Admin UI for managing A/B test experiments.
 *
 * Features:
 * - List all tests with status badges
 * - Create new test (clone page as variant)
 * - Start/stop tests
 * - View results comparison
 *
 * Clean Code: data fetching in hooks, UI in presentational components.
 */

import { useState, useEffect, useCallback } from 'react';

interface ABTest {
  id: string;
  name: string;
  pageId: string;
  status: 'draft' | 'running' | 'completed';
  trafficSplit: number;
  variants: { id: string; name: string; content_blocks: unknown[] }[];
  results: Record<string, unknown> | null;
  createdAt: string;
}

export default function ABTestsManager() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTests = useCallback(async () => {
    try {
      const res = await fetch('/api/ab-tests');
      const data = await res.json();
      if (data.success) setTests(data.data);
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  async function handleStatusChange(testId: string, status: 'running' | 'completed') {
    try {
      await fetch(`/api/ab-tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTests();
    } catch {
      // Silent
    }
  }

  async function handleDelete(testId: string) {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await fetch(`/api/ab-tests/${testId}`, { method: 'DELETE' });
      fetchTests();
    } catch {
      // Silent
    }
  }

  const statusColors: Record<string, string> = {
    draft: '#64748B',
    running: '#22C55E',
    completed: '#3B82F6',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    running: 'Running',
    completed: 'Completed',
  };

  if (isLoading) {
    return <div style={styles.loading}>Loading tests...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>A/B Tests</h2>
        <button style={styles.createBtn} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Test'}
        </button>
      </div>

      {showCreate && (
        <CreateTestForm onCreated={() => { setShowCreate(false); fetchTests(); }} />
      )}

      {tests.length === 0 ? (
        <div style={styles.empty}>No A/B tests yet. Create one to get started.</div>
      ) : (
        <div style={styles.list}>
          {tests.map((test) => (
            <div key={test.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.cardName}>{test.name}</span>
                  <span style={{ ...styles.badge, backgroundColor: statusColors[test.status] }}>
                    {statusLabels[test.status]}
                  </span>
                </div>
                <span style={styles.cardDate}>
                  {new Date(test.createdAt).toLocaleDateString('th-TH')}
                </span>
              </div>
              <div style={styles.cardBody}>
                <span style={styles.cardInfo}>
                  Traffic Split: {Math.round(test.trafficSplit * 100)}% / {Math.round((1 - test.trafficSplit) * 100)}%
                </span>
                <span style={styles.cardInfo}>
                  Variants: {test.variants?.length ?? 0}
                </span>
              </div>
              <div style={styles.cardActions}>
                {test.status === 'draft' && (
                  <button style={styles.startBtn} onClick={() => handleStatusChange(test.id, 'running')}>
                    Start Test
                  </button>
                )}
                {test.status === 'running' && (
                  <button style={styles.stopBtn} onClick={() => handleStatusChange(test.id, 'completed')}>
                    Stop Test
                  </button>
                )}
                <button style={styles.deleteBtn} onClick={() => handleDelete(test.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateTestForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [pageId, setPageId] = useState('');
  const [split, setSplit] = useState(50);
  const [pages, setPages] = useState<{ id: string; title: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/pages')
      .then((r) => r.json())
      .then((d) => { if (d.success) setPages(d.data); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !pageId) return;
    setIsSubmitting(true);
    try {
      // Fetch original page content to create variant
      const pageRes = await fetch(`/api/pages/${pageId}`);
      const pageData = await pageRes.json();
      if (!pageData.success) return;

      const originalBlocks = pageData.data.contentBlocks ?? [];
      const variants = [
        { id: crypto.randomUUID(), name: 'Control (A)', content_blocks: originalBlocks },
        { id: crypto.randomUUID(), name: 'Variant (B)', content_blocks: structuredClone(originalBlocks) },
      ];

      await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pageId, variants, trafficSplit: split / 100 }),
      });
      onCreated();
    } catch {
      // Silent
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formField}>
        <label style={styles.formLabel}>Test Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Homepage Hero Test"
          style={styles.formInput}
          required
        />
      </div>
      <div style={styles.formField}>
        <label style={styles.formLabel}>Page</label>
        <select
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
          style={styles.formInput}
          required
        >
          <option value="">Select a page...</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
      <div style={styles.formField}>
        <label style={styles.formLabel}>Traffic Split (Control %): {split}%</label>
        <input
          type="range"
          min="10"
          max="90"
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
        {isSubmitting ? 'Creating...' : 'Create Test'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { color: '#E2E8F0' },
  loading: { textAlign: 'center', padding: '2rem', color: '#64748B' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 700 },
  createBtn: {
    padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
    color: '#FFF', backgroundColor: '#3B82F6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '3rem', color: '#64748B', background: '#111827', borderRadius: '0.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { padding: '1rem', background: '#111827', border: '1px solid #1E293B', borderRadius: '0.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  cardName: { fontSize: '0.9375rem', fontWeight: 600, marginRight: '0.5rem' },
  badge: {
    padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem',
    fontWeight: 600, color: '#FFF', textTransform: 'uppercase' as const,
  },
  cardDate: { fontSize: '0.75rem', color: '#64748B' },
  cardBody: { display: 'flex', gap: '1rem', marginBottom: '0.75rem' },
  cardInfo: { fontSize: '0.8125rem', color: '#94A3B8' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  startBtn: {
    padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
    color: '#FFF', backgroundColor: '#22C55E', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
  },
  stopBtn: {
    padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
    color: '#FFF', backgroundColor: '#F59E0B', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
    color: '#FCA5A5', backgroundColor: 'transparent', border: '1px solid #7F1D1D', borderRadius: '0.375rem', cursor: 'pointer',
  },
  form: { padding: '1rem', background: '#111827', border: '1px solid #1E293B', borderRadius: '0.5rem', marginBottom: '1rem' },
  formField: { marginBottom: '0.75rem' },
  formLabel: { display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#94A3B8', marginBottom: '0.25rem' },
  formInput: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem',
    background: '#0B0F1A', border: '1px solid #334155', borderRadius: '0.375rem', color: '#E2E8F0',
  },
  submitBtn: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600,
    color: '#FFF', backgroundColor: '#3B82F6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
  },
};
