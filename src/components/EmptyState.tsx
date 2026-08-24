import React from 'react';

interface EmptyStateProps {
  /** Simple one-line usage, e.g. <EmptyState label="No orders yet." /> */
  label?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ label, icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      {title && <div className="empty-state__title">{title}</div>}
      {(description || label) && <p className="empty-state__body">{description || label}</p>}
      {action}
    </div>
  );
}
