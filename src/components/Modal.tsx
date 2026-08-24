'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
  className?: string;
}

// Dialog shell extracted from the pattern already proven in IntegrationsTab.tsx
// — the one modal shape in the dashboard that's already shipped and working.
export default function Modal({ open, onClose, title, children, footer, maxWidth = 440, className }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.45)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={className}
        style={{
          width: `min(100%, ${maxWidth}px)`, background: 'var(--surface, #fff)', borderRadius: 20,
          padding: 24, border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {children}

        {footer && <div style={{ marginTop: 20 }}>{footer}</div>}
      </div>
    </div>
  );
}
