'use client';

import React, { useEffect, useRef } from 'react';
import { Copy, ClipboardPaste, Eye, EyeOff, Lock, Unlock, Trash2, Bookmark } from 'lucide-react';

export default function BlockContextMenu({ x, y, hidden, locked, canPaste, onDuplicate, onCopy, onPaste, onToggleVisibility, onToggleLock, onSaveAsSection, onDelete, onClose }: {
  x: number; y: number; hidden: boolean; locked: boolean; canPaste: boolean;
  onDuplicate: () => void; onCopy: () => void; onPaste: () => void;
  onToggleVisibility: () => void; onToggleLock: () => void; onSaveAsSection: () => void; onDelete: () => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const item = (icon: React.ReactNode, label: string, onSelect: () => void, danger = false) => (
    <button className={`sbld-ctx-item${danger ? ' danger' : ''}`} onClick={() => { onSelect(); onClose(); }}>
      {icon}
      <span>{label}</span>
    </button>
  );

  const width = 190;
  const left = typeof window !== 'undefined' ? Math.min(x, window.innerWidth - width - 12) : x;

  return (
    <div ref={ref} className="sbld-ctx-menu" style={{ top: y, left }}>
      {item(<Copy size={14} />, 'Duplicate', onDuplicate)}
      {item(<Copy size={14} />, 'Copy', onCopy)}
      {canPaste && item(<ClipboardPaste size={14} />, 'Paste after', onPaste)}
      {item(locked ? <Unlock size={14} /> : <Lock size={14} />, locked ? 'Unlock' : 'Lock', onToggleLock)}
      {item(hidden ? <Eye size={14} /> : <EyeOff size={14} />, hidden ? 'Show' : 'Hide', onToggleVisibility)}
      {item(<Bookmark size={14} />, 'Save as section', onSaveAsSection)}
      <div className="sbld-ctx-sep" />
      {item(<Trash2 size={14} />, 'Delete', onDelete, true)}
    </div>
  );
}
