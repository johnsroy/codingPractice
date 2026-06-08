'use client';

import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? `textarea-${rest.name ?? Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-stone-700">
            {label}
            {rest.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full bg-white border-2 rounded-xl px-4 py-3 text-base text-stone-900',
            'placeholder:text-stone-400 resize-y min-h-[120px]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 focus:border-brand-400',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-400'
              : 'border-surface-200 hover:border-stone-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-stone-500">{hint}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
