import type { AdminMetric } from '@/data/admin-dashboard';
import { AdminMetricIcon } from './admin-icons';

export function MetricCard({ metric }: { metric: AdminMetric }) {
  return (
    <div className="dashboard-panel-strong rounded-[1.6rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <AdminMetricIcon name={metric.icon} tone={metric.tone} />
        <p className="text-sm font-semibold text-[var(--dashboard-accent-foreground)]">{metric.trend}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--dashboard-muted)]">{metric.title}</p>
      <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
        {metric.value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{metric.helper}</p>
    </div>
  );
}
