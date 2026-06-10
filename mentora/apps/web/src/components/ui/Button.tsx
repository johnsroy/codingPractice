'use client';

import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  fullWidth?: boolean;
  as?: 'button';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-glow hover:shadow-lift hover:-translate-y-0.5',
  secondary:
    'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-soft hover:shadow-lift hover:-translate-y-0.5',
  outline:
    'border-2 border-brand-500 text-brand-700 bg-white/70 hover:bg-brand-50 active:bg-brand-100',
  ghost:
    'text-brand-700 bg-transparent hover:bg-brand-50 active:bg-brand-100',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-soft',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-full min-h-[40px]',
  md: 'px-6 py-3 text-base rounded-full min-h-[48px]',
  lg: 'px-8 py-4 text-lg rounded-full min-h-[54px]',
  xl: 'px-10 py-5 text-xl rounded-full min-h-[62px]',
};

/**
 * Mentora Button — large, accessible, clear. Every primary action uses this.
 * Min height 48px on md+ so tap targets are always comfortable.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconEnd,
  fullWidth = false,
  disabled,
  children,
  className,
  as: _as, // consumed here, not passed to <button>
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      aria-disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} aria-hidden="true" />
      ) : (
        icon && <span aria-hidden="true">{icon}</span>
      )}
      {children}
      {iconEnd && !loading && <span aria-hidden="true">{iconEnd}</span>}
    </button>
  );
}
