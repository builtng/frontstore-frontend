import React from 'react';

export function Metric({ icon, label, value, detail, tone = 'gray' }: { icon: React.ReactNode; label: string; value: string; detail?: string; tone?: 'green' | 'gray' }) {
  return (
    <div className={`admin-metric admin-metric--${tone}`}>
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function StatusChip({ label, tone }: { label: string; tone: 'green' | 'gray' | 'red' }) {
  return <span className={`admin-chip admin-chip--${tone}`}>{label}</span>;
}

export function PlanMeter({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'green' | 'gray' }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="admin-meter">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <span className="admin-meter__track">
        <span className={`admin-meter__fill admin-meter__fill--${tone}`} style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <div className="admin-empty">{label}</div>;
}

export function SkeletonGrid() {
  return (
    <div className="admin-metric-grid">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="admin-skeleton" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows, columns }: { rows: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: columns }).map((__, column) => (
            <td key={column}>
              <span className="admin-table-skeleton" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  description = '',
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  full?: boolean;
}) {
  return (
    <label className={`admin-field ${full ? 'admin-field--full' : ''}`}>
      <span>{label}</span>
      {description && <small className="admin-field-desc">{description}</small>}
      <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  description = '',
  rows = 8,
  full = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  description?: string;
  rows?: number;
  full?: boolean;
}) {
  return (
    <label className={`admin-field ${full ? 'admin-field--full' : ''}`}>
      <span>{label}</span>
      {description && <small className="admin-field-desc">{description}</small>}
      <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} rows={rows} />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  description = '',
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  description?: string;
  full?: boolean;
}) {
  return (
    <label className={`admin-field ${full ? 'admin-field--full' : ''}`}>
      <span>{label}</span>
      {description && <small className="admin-field-desc">{description}</small>}
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text)',
          fontSize: 14,
          fontWeight: 600,
          height: '42px',
          outline: 'none',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SettingsGroup({ icon, title, children, id }: { icon: React.ReactNode; title: string; children: React.ReactNode; id?: string }) {
  const titleId = id ? `legend-${id}` : `legend-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="admin-settings-group" id={id} role="group" aria-labelledby={titleId}>
      <div className="admin-settings-group-header" id={titleId}>
        <span className="admin-settings-group-header__icon">{icon}</span>
        <span className="admin-settings-group-header__title">{title}</span>
      </div>
      <div className="admin-settings-group-body">{children}</div>
    </div>
  );
}
