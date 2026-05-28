'use client';

import { useState } from 'react';

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  autoComplete?: string;
  required?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  autoComplete,
  required,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="auth-label text-[var(--auth-text)]">
        {label}
      </label>
      <div className={`auth-input flex items-center rounded-2xl px-4 py-3.5 transition ${error ? 'border-rose-400/80' : ''}`}>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-[var(--auth-text)] outline-none placeholder:text-[var(--auth-muted-text)]/80"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="ml-3 rounded-full px-2 py-1 text-sm font-medium text-[var(--auth-muted-text)] transition hover:bg-[var(--auth-chip-bg)] hover:text-[var(--auth-text)]"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-sm leading-6 text-[var(--auth-muted-text)]">{helperText}</p>
      ) : null}
    </div>
  );
}
