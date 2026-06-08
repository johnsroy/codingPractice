import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = { sm: 20, md: 32, lg: 48 };

export function Spinner({ size = 'md', className, label = 'Loading...' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={clsx('inline-flex items-center justify-center', className)}
    >
      <Loader2
        size={sizeMap[size]}
        className="animate-spin text-brand-500"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
