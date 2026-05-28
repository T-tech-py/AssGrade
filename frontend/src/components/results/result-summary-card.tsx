import type { ReactNode } from 'react';

type ResultSummaryCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

export function ResultSummaryCard({ title, value, helper, icon }: ResultSummaryCardProps) {
  return (
    <div className="dashboard-panel rounded-[1.7rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-[1.85rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{helper}</p>
    </div>
  );
}
