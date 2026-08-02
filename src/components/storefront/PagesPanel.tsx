'use client';

import React, { useState } from 'react';
import { Home, Plus, Copy, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { darkFieldStyle } from './inspectorUi';

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  is_home: boolean;
  position: number;
  is_published: boolean;
}

export default function PagesPanel({ pages, activePageId, onSelect, onAdd, onDuplicate, onDelete, onMove }: {
  pages: SitePage[];
  activePageId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const submitAdd = () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    onAdd(name);
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="sbld-pages-list">
      {[...pages].sort((a, b) => a.position - b.position).map((page, i, arr) => (
        <div key={page.id} className={`sbld-page-row${page.id === activePageId ? ' selected' : ''}`} onClick={() => onSelect(page.id)}>
          {page.is_home ? <Home size={13} className="ic" /> : <span className="ic-dot" />}
          <span className="sbld-page-name">{page.name}</span>
          {page.is_published && <span className="sbld-page-live" title="Published"><Check size={10} /></span>}
          <div className="sbld-page-actions">
            <button title="Move up" disabled={i === 0} onClick={(e) => { e.stopPropagation(); onMove(page.id, 'up'); }}><ChevronUp size={13} /></button>
            <button title="Move down" disabled={i === arr.length - 1} onClick={(e) => { e.stopPropagation(); onMove(page.id, 'down'); }}><ChevronDown size={13} /></button>
            <button title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(page.id); }}><Copy size={13} /></button>
            {!page.is_home && (
              <button title="Delete" className="danger" onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}><Trash2 size={13} /></button>
            )}
          </div>
        </div>
      ))}

      {adding ? (
        <div className="sbld-page-add-form">
          <input
            style={darkFieldStyle}
            autoFocus
            placeholder="Page name, e.g. About"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') setAdding(false); }}
            onBlur={submitAdd}
          />
        </div>
      ) : (
        <button className="sbld-page-add-btn" onClick={() => setAdding(true)}>
          <Plus size={13} /> Add page
        </button>
      )}
    </div>
  );
}
