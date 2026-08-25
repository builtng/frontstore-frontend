import React from 'react';

export { default as EmptyState } from '@/components/EmptyState';
export { SkeletonGrid } from '@/components/Skeleton';
export { default as TableSkeleton } from '@/components/TableSkeleton';

export function Metric({
  icon,
  label,
  value,
  detail,
  trend,
  tone = 'gray',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
  trend?: { value: string; positive?: boolean };
  tone?: 'green' | 'gray' | 'blue' | 'purple';
}) {
  return (
    <div className={`admin-metric admin-metric--${tone}`}>
      <div className="admin-metric__top">
        <span className="admin-metric__icon">{icon}</span>
        {trend && (
          <span className={`admin-metric__trend ${trend.positive ? 'is-positive' : 'is-negative'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export type StatusTone = 'green' | 'gray' | 'red' | 'blue' | 'orange';

export function StatusChip({ label, tone, pulse = false }: { label: string; tone: StatusTone; pulse?: boolean }) {
  return (
    <span className={`admin-chip admin-chip--${tone}`}>
      {pulse && <span className="admin-chip__dot" />}
      {label}
    </span>
  );
}

export function withdrawalStatusTone(status: string): StatusTone {
  switch (status) {
    case 'success':
    case 'completed':
      return 'green';
    case 'submitted':
      return 'blue';
    case 'processing':
      return 'orange';
    case 'failed':
    case 'reversed':
    case 'completed_with_errors':
      return 'red';
    case 'rejected':
    case 'awaiting_otp':
    case 'pending':
    default:
      return 'gray';
  }
}

export function PlanMeter({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'green' | 'gray' }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="admin-meter">
      <div>
        <span>{label}</span>
        <strong>{value} <small className="text-muted">({width}%)</small></strong>
      </div>
      <span className="admin-meter__track">
        <span className={`admin-meter__fill admin-meter__fill--${tone}`} style={{ width: `${width}%` }} />
      </span>
    </div>
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
        className="admin-select-input"
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

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="admin-section-heading" style={{ marginBottom: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h2>
          {badge && <span className="admin-chip admin-chip--blue" style={{ fontSize: 11 }}>{badge}</span>}
        </div>
        {subtitle && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
    </div>
  );
}

