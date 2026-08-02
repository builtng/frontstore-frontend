'use client';

import React from 'react';
import { Bookmark, Trash2, Plus } from 'lucide-react';
import { BLOCK_LABELS } from './blockTypes';

export interface SavedSection {
  id: string;
  name: string;
  block: any;
}

export default function SavedSectionsPanel({ sections, loading, onInsert, onDelete }: {
  sections: SavedSection[];
  loading: boolean;
  onInsert: (section: SavedSection) => void;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return <p className="sbld-layers-empty">Loading your saved sections…</p>;
  }

  if (sections.length === 0) {
    return (
      <p className="sbld-layers-empty">
        Nothing saved yet. Right-click any block on the canvas and choose "Save as section" to reuse it on other pages or sites.
      </p>
    );
  }

  return (
    <div className="sbld-saved-list">
      {sections.map((section) => (
        <div key={section.id} className="sbld-saved-row" onClick={() => onInsert(section)}>
          <Bookmark size={14} className="ic" />
          <div className="sbld-saved-info">
            <span className="name">{section.name}</span>
            <span className="type">{BLOCK_LABELS[section.block?.type as keyof typeof BLOCK_LABELS] || section.block?.type}</span>
          </div>
          <div className="sbld-saved-actions">
            <button title="Insert" onClick={(e) => { e.stopPropagation(); onInsert(section); }}><Plus size={13} /></button>
            <button title="Delete" className="danger" onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
