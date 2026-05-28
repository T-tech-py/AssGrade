type CheckboxFieldProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: string;
  description?: string;
};

export function CheckboxField({ id, checked, onChange, label, error, description }: CheckboxFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="auth-muted-panel flex cursor-pointer items-start gap-3 rounded-[1.15rem] px-4 py-3.5 text-sm text-[var(--auth-muted-text)] transition hover:border-[var(--dashboard-accent-foreground)]/30">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[var(--auth-chip-border)] text-[var(--dashboard-accent-foreground)] focus:ring-2 focus:ring-[var(--dashboard-accent-foreground)]"
        />
        <span className="space-y-1">
          <span className="block leading-6">{label}</span>
          {description ? <span className="block text-xs text-[var(--auth-subtle-text)]">{description}</span> : null}
        </span>
      </label>
      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
    </div>
  );
}
