type RiskBadgeProps = {
  value: 'Low' | 'Medium' | 'High';
};

export function RiskBadge({ value }: RiskBadgeProps) {
  const toneClass =
    value === 'High'
      ? 'bg-[rgba(190,24,93,0.14)] text-[rgb(190,24,93)] dark:bg-[rgba(251,113,133,0.12)] dark:text-[rgb(254,205,211)]'
      : value === 'Medium'
        ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]'
        : 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClass}`}>
      {value} Risk
    </span>
  );
}
