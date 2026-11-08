import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`block w-full rounded-lg border text-sm transition-colors placeholder:text-slate-400 focus:outline-hidden focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed p-3 ${
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-indigo-500/20 bg-white'
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

