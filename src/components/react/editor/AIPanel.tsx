/**
 * AI Panel — AI Content Assistant in the editor.
 *
 * Features:
 * - Text generation from prompt
 * - SEO suggestions based on page content
 * - Image alt text generation
 *
 * Clean Code: separate component, communicates with editor via store actions.
 */

import { useState } from 'react';
import { useEditorStore, selectBlocks, selectSelectedBlockId } from '@/stores/editor-store';

type AITab = 'generate' | 'seo' | 'alt-text';

export default function AIPanel() {
  const [activeTab, setActiveTab] = useState<AITab>('generate');

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>AI Assistant</h3>
      <div style={styles.tabBar}>
        {(['generate', 'seo', 'alt-text'] as AITab[]).map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'generate' ? 'Generate' : tab === 'seo' ? 'SEO' : 'Alt Text'}
          </button>
        ))}
      </div>
      {activeTab === 'generate' && <GenerateTab />}
      {activeTab === 'seo' && <SEOTab />}
      {activeTab === 'alt-text' && <AltTextTab />}
    </div>
  );
}

function GenerateTab() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const selectedBlockId = useEditorStore(selectSelectedBlockId);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.text);
      } else {
        setResult(`Error: ${data.error || 'Generation failed'}`);
      }
    } catch {
      setResult('Error: Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  }

  function handleInsert() {
    if (!result || !selectedBlockId) return;
    updateBlock(selectedBlockId, { props: { content: result, level: 'p' } });
  }

  return (
    <div style={styles.tabContent}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to write..."
        rows={4}
        style={styles.textarea}
      />
      <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} style={styles.actionBtn}>
        {isLoading ? 'Generating...' : 'Generate Text'}
      </button>
      {result && (
        <div style={styles.resultBox}>
          <div style={styles.resultText}>{result}</div>
          {selectedBlockId && (
            <button onClick={handleInsert} style={styles.insertBtn}>
              Insert into selected block
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SEOTab() {
  const blocks = useEditorStore(selectBlocks);
  const [result, setResult] = useState<{ title: string; description: string; headings: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function extractTextContent(blockList: any[]): string {
    let text = '';
    for (const block of blockList) {
      if (block.props?.content) text += block.props.content + ' ';
      if (block.props?.heading) text += block.props.heading + ' ';
      if (block.props?.quote) text += block.props.quote + ' ';
      if (block.children?.length) text += extractTextContent(block.children);
    }
    return text;
  }

  async function handleAnalyze() {
    const content = extractTextContent(blocks);
    if (content.trim().length < 10) return;
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.slice(0, 5000) }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.tabContent}>
      <p style={styles.hint}>Analyze your page content to get SEO suggestions.</p>
      <button onClick={handleAnalyze} disabled={isLoading} style={styles.actionBtn}>
        {isLoading ? 'Analyzing...' : 'Analyze Content'}
      </button>
      {result && (
        <div style={styles.resultBox}>
          <div style={styles.resultField}>
            <span style={styles.resultLabel}>Suggested Title:</span>
            <span style={styles.resultValue}>{result.title}</span>
          </div>
          <div style={styles.resultField}>
            <span style={styles.resultLabel}>Meta Description:</span>
            <span style={styles.resultValue}>{result.description}</span>
          </div>
          {result.headings.length > 0 && (
            <div style={styles.resultField}>
              <span style={styles.resultLabel}>Heading Structure:</span>
              <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                {result.headings.map((h, i) => (
                  <li key={i} style={styles.resultValue}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AltTextTab() {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleDescribe() {
    if (!imageUrl.trim()) return;
    setIsLoading(true);
    setAltText('');
    try {
      const res = await fetch('/api/ai/alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setAltText(data.data.altText);
      } else {
        setAltText(`Error: ${data.error || 'Description failed'}`);
      }
    } catch {
      setAltText('Error: Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.tabContent}>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter image URL"
        style={styles.input}
      />
      <button onClick={handleDescribe} disabled={isLoading || !imageUrl.trim()} style={styles.actionBtn}>
        {isLoading ? 'Describing...' : 'Generate Alt Text'}
      </button>
      {altText && (
        <div style={styles.resultBox}>
          <div style={styles.resultText}>{altText}</div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '1rem', color: '#E2E8F0' },
  heading: { fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#F8FAFC' },
  tabBar: { display: 'flex', gap: '0.25rem', marginBottom: '1rem' },
  tabBtn: {
    flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontWeight: 500,
    background: 'transparent', border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#94A3B8', cursor: 'pointer',
  },
  tabBtnActive: { backgroundColor: 'rgba(59,130,246,0.12)', color: '#3B82F6', borderColor: 'rgba(59,130,246,0.3)' },
  tabContent: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
  textarea: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem', fontFamily: 'inherit',
    background: '#0B0F1A', border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#E2E8F0', outline: 'none', resize: 'vertical' as const,
  },
  input: {
    width: '100%', padding: '0.5rem', fontSize: '0.8125rem',
    background: '#0B0F1A', border: '1px solid #334155', borderRadius: '0.375rem',
    color: '#E2E8F0', outline: 'none',
  },
  actionBtn: {
    padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600,
    color: '#FFF', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  hint: { fontSize: '0.75rem', color: '#64748B' },
  resultBox: {
    padding: '0.75rem', background: '#0B0F1A', border: '1px solid #334155',
    borderRadius: '0.375rem',
  },
  resultText: { fontSize: '0.8125rem', lineHeight: 1.5, color: '#CBD5E1' },
  resultField: { marginBottom: '0.5rem' },
  resultLabel: { display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#8B5CF6', marginBottom: '0.125rem' },
  resultValue: { fontSize: '0.8125rem', color: '#CBD5E1' },
  insertBtn: {
    marginTop: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500,
    color: '#FFF', backgroundColor: '#3B82F6', border: 'none', borderRadius: '0.375rem',
    cursor: 'pointer',
  },
};
