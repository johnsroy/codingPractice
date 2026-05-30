import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'brand' | 'teal' | 'amber' | 'green' | 'red' | 'stone' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand-100 text-brand-700 border border-brand-200',
  teal: 'bg-teal-100 text-teal-700 border border-teal-200',
  amber: 'bg-amber-100 text-amber-700 border border-amber-200',
  green: 'bg-green-100 text-green-700 border border-green-200',
  red: 'bg-red-100 text-red-700 border border-red-200',
  stone: 'bg-stone-100 text-stone-600 border border-stone-200',
  outline: 'bg-transparent border-2 border-brand-500 text-brand-600',
};

export function Badge({
  children,
  variant = 'brand',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
