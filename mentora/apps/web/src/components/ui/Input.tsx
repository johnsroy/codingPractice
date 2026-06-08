'use client';

import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

/**
 * Accessible labeled input with large tap target and clear error states.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...rest }, ref) => {
    const inputId = id ?? `input-${rest.name ?? Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-stone-700"
          >
            {label}
            {rest.required && (
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-white border-2 rounded-xl px-4 py-3 text-base text-stone-900',
              'placeholder:text-stone-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 focus:border-brand-400',
              'min-h-[48px]',
              icon && 'pl-12',
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-400'
                : 'border-surface-200 hover:border-stone-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            aria-invalid={error ? 'true' : undefined}
            {...rest}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-stone-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
