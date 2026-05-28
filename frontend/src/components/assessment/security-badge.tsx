import type { ReactNode } from 'react';

type SecurityBadgeProps = {
  label: string;
  tone?: 'good' | 'warn' | 'neutral';
  icon?: ReactNode;
};

export function SecurityBadge({ label, tone = 'neutral', icon }: SecurityBadgeProps) {
  const toneClass =
    tone === 'good'
      ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
      : tone === 'warn'
        ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]'
        : 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-text)]';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${toneClass}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
