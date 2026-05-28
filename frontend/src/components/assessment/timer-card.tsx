import { TimerIcon } from './icons';

type TimerCardProps = {
  timeRemaining: string;
};

export function TimerCard({ timeRemaining }: TimerCardProps) {
  return (
    <div className="dashboard-dark-button flex items-center gap-3 rounded-2xl px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
        <TimerIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-muted)]">Time Remaining</p>
        <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--dashboard-text)]">{timeRemaining}</p>
      </div>
    </div>
  );
}
