import type { ReactNode } from 'react';

type PracticeSummaryCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

export function PracticeSummaryCard({ title, value, helper, icon }: PracticeSummaryCardProps) {
  return (
    <div className="practice-panel rounded-[1.6rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--practice-accent-soft)] text-[var(--practice-accent-foreground)]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--practice-text)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--practice-muted)]">{helper}</p>
    </div>
  );
}
