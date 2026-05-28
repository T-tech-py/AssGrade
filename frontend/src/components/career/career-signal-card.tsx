import type { CareerSignal } from '@/data/career-insights-data';

export function CareerSignalCard({ signal }: { signal: CareerSignal }) {
  return (
    <div className="dashboard-soft-tile rounded-[1.25rem] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--dashboard-text)]">{signal.label}</p>
        <p className="text-sm font-semibold text-[var(--dashboard-text)]">{signal.score}%</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[var(--dashboard-soft-tile-border)]">
        <div
          className="h-2 rounded-full bg-[var(--dashboard-accent-foreground)]"
          style={{ width: `${signal.score}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">{signal.helper}</p>
    </div>
  );
}
