type ExamProgressProps = {
  current: number;
  total: number;
  answered: number;
};

export function ExamProgress({ current, total, answered }: ExamProgressProps) {
  const percent = Math.round((answered / total) * 100);

  return (
    <div className="rounded-2xl border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[var(--dashboard-text)]">Question {current} of {total}</span>
        <span className="text-[var(--dashboard-muted)]">{percent}% completed</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--dashboard-icon-surface)]">
        <div
          className="h-full rounded-full bg-[var(--dashboard-accent-foreground)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
