'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                style={{
                    width: 'min(100%, 520px)',
                    background: 'var(--surface, #ffffff)',
                    color: 'var(--text, #111827)',
                    borderRadius: 24,
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
                    padding: 28,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.14)',
                            color: '#ef4444',
                        }}
                    >
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h2 id="confirm-dialog-title" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                            {title}
                        </h2>
                    </div>
                </div>

                <p id="confirm-dialog-description" style={{ margin: 0, lineHeight: 1.75, color: 'var(--text-muted, #475569)' }}>
                    {description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            appearance: 'none',
                            border: '1px solid rgba(15, 23, 42, 0.12)',
                            background: 'transparent',
                            color: 'var(--text, #111827)',
                            borderRadius: 12,
                            padding: '12px 18px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            minWidth: 110,
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            appearance: 'none',
                            border: 'none',
                            background: 'var(--primary, #62109F)',
                            color: '#fff',
                            borderRadius: 12,
                            padding: '12px 18px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            minWidth: 110,
                        }}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
