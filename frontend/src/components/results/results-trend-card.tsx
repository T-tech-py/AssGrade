import type { TrendPoint } from '@/data/results-data';
import { TrendBarsIcon } from './results-icons';

type ResultsTrendCardProps = {
  data: TrendPoint[];
};

export function ResultsTrendCard({ data }: ResultsTrendCardProps) {
  return (
    <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">Performance trend</p>
          <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
            How your scores are moving
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            A simple view of how your assessment performance has improved over recent attempts.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
          <TrendBarsIcon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-6 grid h-[15rem] grid-cols-6 items-end gap-3">
        {data.map((point) => (
          <div key={point.label} className="flex h-full flex-col justify-end">
            <div
              className="rounded-t-[1.2rem] bg-[linear-gradient(180deg,var(--dashboard-accent-foreground),color-mix(in_srgb,var(--dashboard-accent-foreground)_70%,transparent))]"
              style={{ height: `${Math.max(point.score, 16)}%` }}
            />
            <div className="dashboard-soft-tile rounded-b-[1.2rem] px-2 py-2 text-center">
              <p className="text-xs font-semibold text-[var(--dashboard-text)]">{point.score}%</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--dashboard-subtle)]">{point.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
