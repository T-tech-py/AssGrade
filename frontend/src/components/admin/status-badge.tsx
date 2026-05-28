type StatusBadgeProps = {
  value: string;
  tone?: 'active' | 'draft' | 'archived' | 'success' | 'warning' | 'danger' | 'neutral';
};

export function StatusBadge({ value, tone = 'neutral' }: StatusBadgeProps) {
  const toneClass =
    tone === 'active' || tone === 'success'
      ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
      : tone === 'draft'
        ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
        : tone === 'warning'
          ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]'
          : tone === 'danger'
            ? 'bg-[rgba(190,24,93,0.12)] text-[rgb(190,24,93)] dark:bg-[rgba(251,113,133,0.12)] dark:text-[rgb(254,205,211)]'
            : 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-text)]';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClass}`}>
      {value}
    </span>
  );
}
