import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-8',
        className,
      )}
    >
      {icon && (
        <div
          className="mb-6 w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-400"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-stone-700 mb-2">{title}</h3>
      {description && (
        <p className="text-stone-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button as="button" onClick={() => { window.location.href = action.href!; }}>
            {action.label}
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
