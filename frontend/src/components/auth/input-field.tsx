type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
  name?: string;
};

export function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  autoComplete,
  inputMode,
  required,
  name,
}: InputFieldProps) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="auth-label text-[var(--auth-text)]">
        {label}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`auth-input w-full rounded-2xl px-4 py-3.5 text-[0.95rem] text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted-text)]/80 ${
          error ? 'border-rose-400/80' : ''
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-sm leading-6 text-[var(--auth-muted-text)]">{helperText}</p>
      ) : null}
    </div>
  );
}
