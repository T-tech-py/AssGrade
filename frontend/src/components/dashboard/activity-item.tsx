import type { Activity } from '@/data/student-dashboard';

export function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="mt-1 h-3 w-3 rounded-full bg-[var(--dashboard-accent-foreground)]" />
        <div className="mt-2 h-full w-px bg-[var(--dashboard-panel-border)]" />
      </div>
      <div className="pb-5">
        <p className="text-sm font-semibold text-[var(--dashboard-text)]">{activity.title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">{activity.description}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{activity.timestamp}</p>
      </div>
    </div>
  );
}
