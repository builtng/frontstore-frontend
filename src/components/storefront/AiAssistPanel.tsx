'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { darkFieldStyle, SegmentedControl } from './inspectorUi';

export default function AiAssistPanel({ generating, quotaRemaining, onGenerate }: {
  generating: boolean;
  quotaRemaining: number | null;
  onGenerate: (prompt: string, scope: 'section' | 'page') => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState<'section' | 'page'>('section');

  const submit = () => {
    if (!prompt.trim() || generating) return;
    onGenerate(prompt.trim(), scope);
  };

  return (
    <div className="sbld-ai-chip" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Sparkles size={16} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div className="t">AI assist</div>
          <div className="d">Describe a section or a whole page and Aura will build it from your store's context.</div>
        </div>
      </div>

      <SegmentedControl
        value={scope}
        onChange={setScope}
        options={[{ value: 'section', label: 'One section' }, { value: 'page', label: 'Whole page' }]}
      />

      <textarea
        style={{ ...darkFieldStyle, minHeight: 70, resize: 'vertical' }}
        placeholder={scope === 'page' ? 'e.g. A premium skincare homepage that emphasises organic ingredients and fast delivery' : 'e.g. A hero banner for our Black Friday sale'}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={generating || !prompt.trim()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 14px', borderRadius: 8, border: 'none', cursor: generating ? 'wait' : 'pointer',
          background: 'linear-gradient(135deg, #64FFDA, #25D366)', color: '#06231D', fontWeight: 700, fontSize: 12.5,
          opacity: generating || !prompt.trim() ? 0.6 : 1,
        }}
      >
        {generating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
        {generating ? 'Generating…' : scope === 'page' ? 'Generate page' : 'Generate section'}
      </button>

      {quotaRemaining !== null && (
        <p style={{ fontSize: 10.5, color: '#7E93AE', margin: 0, textAlign: 'center' }}>
          {quotaRemaining} AI credit{quotaRemaining === 1 ? '' : 's'} left this cycle
        </p>
      )}
    </div>
  );
}
