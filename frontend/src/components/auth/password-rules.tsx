import { getPasswordChecks } from '@/lib/auth-validation';

type PasswordRulesProps = {
  password: string;
};

export function PasswordRules({ password }: PasswordRulesProps) {
  const rules = getPasswordChecks(password);

  return (
    <div className="auth-muted-panel rounded-2xl p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--auth-text)]">
        <span className="text-[var(--dashboard-accent-foreground)]">◉</span>
        Password rules
      </div>
      <div className="mt-3 grid gap-2">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-3 text-sm">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${rule.passed ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]' : 'bg-[var(--auth-chip-bg)] text-[var(--auth-muted-text)]'}`}>
              {rule.passed ? '✓' : '•'}
            </span>
            <span className={rule.passed ? 'text-[var(--auth-text)]' : 'text-[var(--auth-muted-text)]'}>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
