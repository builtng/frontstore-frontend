'use client';

import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2 } from 'lucide-react';
import { BLOCK_LABELS, Device, SiteBlock, isBlockHiddenOn } from './blockTypes';

export default function LayersPanel({ layout, selectedId, device, onSelect, onToggleVisibility, onToggleLock, onDuplicate, onDelete }: {
  layout: SiteBlock[];
  selectedId: string | null;
  device: Device;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (layout.length === 0) {
    return <p className="sbld-layers-empty">No blocks on this page yet.</p>;
  }

  return (
    <div className="sbld-layers-list">
      {layout.map((block, i) => {
        const hidden = isBlockHiddenOn(block, device);
        const selected = block.id === selectedId;
        return (
          <div key={block.id} className={`sbld-layer-row${selected ? ' selected' : ''}${hidden ? ' hidden' : ''}`} onClick={() => onSelect(block.id)}>
            <span className="sbld-layer-index">{i + 1}</span>
            <span className="sbld-layer-name">{BLOCK_LABELS[block.type]}</span>
            <div className="sbld-layer-actions">
              <button
                title={hidden ? 'Show on this device' : 'Hide on this device'}
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(block.id); }}
              >
                {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                title={block.locked ? 'Unlock' : 'Lock'}
                onClick={(e) => { e.stopPropagation(); onToggleLock(block.id); }}
              >
                {block.locked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>
              <button title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}>
                <Copy size={13} />
              </button>
              <button title="Delete" className="danger" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
