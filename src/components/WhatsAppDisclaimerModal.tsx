'use client';

import React from 'react';
import { X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export interface WhatsAppDisclaimerModalProps {
    open: boolean;
    storeName?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function WhatsAppDisclaimerModal({
    open,
    storeName,
    onConfirm,
    onCancel,
}: WhatsAppDisclaimerModalProps) {
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
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="wa-disclaimer-title"
                aria-describedby="wa-disclaimer-description"
                onClick={e => e.stopPropagation()}
                style={{
                    width: 'min(100%, 440px)',
                    background: 'var(--surface, #ffffff)',
                    color: 'var(--text, #111827)',
                    borderRadius: 24,
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
                    padding: 28,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    position: 'relative',
                }}
            >
                <button
                    type="button"
                    onClick={onCancel}
                    aria-label="Close"
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 28,
                        height: 28,
                        display: 'grid',
                        placeItems: 'center',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted, #64748b)',
                        borderRadius: 8,
                        cursor: 'pointer',
                    }}
                >
                    <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '50%',
                            background: 'rgba(37, 211, 102, 0.14)',
                            color: 'var(--wa-dark, #128C7E)',
                            flexShrink: 0,
                        }}
                    >
                        <WhatsAppIcon size={22} />
                    </div>
                    <h2 id="wa-disclaimer-title" style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>
                        You're heading to WhatsApp
                    </h2>
                </div>

                <div id="wa-disclaimer-description" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted, #475569)' }}>
                    <p style={{ margin: '0 0 10px' }}>
                        You're about to chat with {storeName ? <strong style={{ color: 'var(--text, #111827)' }}>{storeName}</strong> : 'this seller'} on WhatsApp, outside of Frontstore.
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li>Frontstore can't see or moderate this conversation.</li>
                        <li>For buyer protection, receipts and order tracking, pay through Frontstore checkout — not directly on WhatsApp.</li>
                        <li>Be cautious of any seller who asks you to pay outside the platform with no receipt.</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            appearance: 'none',
                            border: '1px solid rgba(15, 23, 42, 0.12)',
                            background: 'transparent',
                            color: 'var(--text, #111827)',
                            borderRadius: 12,
                            padding: '12px 18px',
                            cursor: 'pointer',
                            minWidth: 100,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{
                            appearance: 'none',
                            border: 'none',
                            background: 'var(--wa-green, #25D366)',
                            color: '#fff',
                            borderRadius: 12,
                            padding: '12px 18px',
                            cursor: 'pointer',
                            minWidth: 168,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            fontWeight: 700,
                        }}
                    >
                        <WhatsAppIcon size={16} />
                        Continue to WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
