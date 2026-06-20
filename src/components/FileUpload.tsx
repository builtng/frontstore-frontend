'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, File, RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
export interface FileUploadProps {
  /** Called with the selected File — caller handles the actual HTTP upload */
  onFile: (file: File) => void | Promise<void>;
  /** Accepted MIME types — same as <input accept="…"> */
  accept?: string;
  /** Friendly label shown inside the zone */
  label?: string;
  /** Hint text below the label */
  hint?: string;
  /** Current preview URL (pass null/undefined to reset) */
  previewUrl?: string | null;
  /** When true shows a spinner overlay */
  uploading?: boolean;
  /** 0–100 progress value (shown only when uploading) */
  progress?: number;
  /** Error string to display */
  error?: string;
  /** Success message (e.g. "Uploaded!") */
  success?: string;
  /** Call to remove the current file */
  onRemove?: () => void;
  /** Show a compact 80×80 square tile variant */
  variant?: 'default' | 'tile' | 'avatar';
  /** Disabled state */
  disabled?: boolean;
  /** Extra classes on the root container */
  className?: string;
  /** Max file size in bytes (shows warning, does NOT block) */
  maxSize?: number;
  /** Unique id for the hidden input */
  inputId?: string;
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAccept(accept?: string) {
  return !accept || accept.includes('image');
}

/* ─────────────────────────────────────────────────────────────
   FileUpload Component
───────────────────────────────────────────────────────────── */
export default function FileUpload({
  onFile,
  accept = 'image/*',
  label = 'Drop file here or click to upload',
  hint,
  previewUrl,
  uploading = false,
  progress,
  error,
  success,
  onRemove,
  variant = 'default',
  disabled = false,
  className = '',
  maxSize,
  inputId,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = inputId ?? `fu-${Math.random().toString(36).slice(2)}`;

  /* Clear local state when previewUrl changes externally */
  useEffect(() => {
    if (!previewUrl) setLocalFileName(null);
  }, [previewUrl]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file || disabled) return;

      setSizeWarning(null);

      if (maxSize && file.size > maxSize) {
        setSizeWarning(`File is ${formatBytes(file.size)} — larger than the ${formatBytes(maxSize)} limit.`);
      }

      setLocalFileName(file.name);
      await onFile(file);

      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [disabled, maxSize, onFile]
  );

  /* ── Drag events ── */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const hasImage = isImageAccept(accept);
  const showProgress = uploading && typeof progress === 'number';
  const hasPreview = !!previewUrl;

  /* ════════════════════════════════════════════════════════════
     VARIANT — AVATAR (circular logo upload)
  ════════════════════════════════════════════════════════════ */
  if (variant === 'avatar') {
    return (
      <div className={`fu-avatar ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
        <div
          className={`fu-avatar__ring ${isDragging ? 'fu-avatar__ring--drag' : ''}`}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          title={disabled ? '' : 'Click or drop to upload'}
        >
          {/* Preview or placeholder */}
          {hasPreview ? (
            <img src={previewUrl!} alt="Preview" className="fu-avatar__img" />
          ) : (
            <div className="fu-avatar__placeholder">
              {uploading ? (
                <div className="fu-spinner" />
              ) : (
                <>
                  <Upload size={20} />
                  <span>Upload</span>
                </>
              )}
            </div>
          )}

          {/* Uploading overlay */}
          {uploading && hasPreview && (
            <div className="fu-avatar__overlay">
              <div className="fu-spinner fu-spinner--white" />
            </div>
          )}
        </div>

        {/* Remove button */}
        {hasPreview && !uploading && onRemove && (
          <button type="button" className="fu-avatar__remove" onClick={onRemove} title="Remove">
            <X size={10} strokeWidth={3} />
          </button>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        {(error || sizeWarning) && (
          <p className="fu-msg fu-msg--error" style={{ textAlign: 'center', marginTop: 6 }}>
            {error || sizeWarning}
          </p>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     VARIANT — TILE (small 80×80 square, for product image grid)
  ════════════════════════════════════════════════════════════ */
  if (variant === 'tile') {
    return (
      <div
        className={`fu-tile ${isDragging ? 'fu-tile--drag' : ''} ${className}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        aria-label="Upload image"
        style={{ opacity: disabled ? 0.55 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {uploading ? (
          <div className="fu-spinner" />
        ) : (
          <>
            <ImageIcon size={20} />
            <span className="fu-tile__label">Upload</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     VARIANT — DEFAULT (full drag-drop zone)
  ════════════════════════════════════════════════════════════ */
  return (
    <div className={`fu-zone-wrap ${className}`}>
      {/* Drop zone */}
      <div
        className={`fu-zone ${isDragging ? 'fu-zone--drag' : ''} ${uploading ? 'fu-zone--uploading' : ''} ${hasPreview ? 'fu-zone--has-preview' : ''}`}
        style={{ opacity: disabled ? 0.55 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && !uploading && inputRef.current?.click()}
        aria-label={label}
      >
        {/* Image preview */}
        {hasPreview && hasImage && (
          <div className="fu-zone__preview-wrap">
            <img src={previewUrl!} alt="Preview" className="fu-zone__preview" />
            {/* Overlay with replace option */}
            {!uploading && (
              <div className="fu-zone__preview-overlay">
                <RefreshCw size={18} />
                <span>Replace</span>
              </div>
            )}
          </div>
        )}

        {/* File name (non-image) */}
        {hasPreview && !hasImage && !uploading && (
          <div className="fu-zone__file-info">
            <div className="fu-zone__file-icon">
              <File size={28} />
            </div>
            <p className="fu-zone__file-name">
              {localFileName || (previewUrl ? decodeURIComponent(previewUrl.split('/').pop() || '').split('?')[0] : 'File uploaded')}
            </p>
            <p className="fu-zone__file-hint">Click to replace</p>
          </div>
        )}

        {/* Uploading spinner + progress */}
        {uploading && (
          <div className="fu-zone__uploading">
            <div className="fu-progress-ring">
              <svg viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" />
                {showProgress && (
                  <circle
                    cx="22" cy="22" r="18"
                    className="fu-progress-ring__fill"
                    style={{ strokeDashoffset: `${(1 - (progress! / 100)) * 113}` }}
                  />
                )}
              </svg>
              {showProgress ? (
                <span className="fu-progress-ring__label">{progress}%</span>
              ) : (
                <div className="fu-spinner fu-spinner--primary" style={{ width: 22, height: 22 }} />
              )}
            </div>
            <p className="fu-zone__uploading-text">Uploading…</p>
          </div>
        )}

        {/* Empty state */}
        {!hasPreview && !uploading && (
          <div className="fu-zone__empty">
            <div className={`fu-zone__icon-wrap ${isDragging ? 'fu-zone__icon-wrap--drag' : ''}`}>
              <Upload size={24} strokeWidth={1.8} />
            </div>
            <p className="fu-zone__label">{label}</p>
            {hint && <p className="fu-zone__hint">{hint}</p>}
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled || uploading}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Progress bar (thin, below the zone) */}
      {showProgress && (
        <div className="fu-bar-wrap">
          <div className="fu-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Status messages */}
      {(error || sizeWarning) && (
        <div className="fu-msg fu-msg--error">
          <AlertCircle size={13} />
          <span>{error || sizeWarning}</span>
        </div>
      )}
      {success && !error && !uploading && (
        <div className="fu-msg fu-msg--success">
          <CheckCircle size={13} />
          <span>{success}</span>
        </div>
      )}

      {/* Remove link */}
      {hasPreview && !uploading && onRemove && (
        <button type="button" className="fu-remove-btn" onClick={onRemove}>
          <X size={12} />
          Remove file
        </button>
      )}
    </div>
  );
}
