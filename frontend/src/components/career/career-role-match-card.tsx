import Link from 'next/link';
import { ArrowUpRightIcon } from '@/components/dashboard/icons';
import type { CareerRoleMatch } from '@/data/career-insights-data';

export function CareerRoleMatchCard({ role }: { role: CareerRoleMatch }) {
  const tone =
    role.fitType === 'Strong fit'
      ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
      : role.fitType === 'Emerging fit'
        ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
        : 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]';

  return (
    <div className="dashboard-panel flex h-full flex-col rounded-[1.8rem] p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">Career match</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">{role.title}</h3>
        </div>
        <div className="rounded-2xl bg-[var(--dashboard-accent-soft)] px-3 py-2 text-right">
          <p className="text-lg font-semibold text-[var(--dashboard-accent-foreground)]">{role.match}%</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Match</p>
        </div>
      </div>

      <div className="mt-4">
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>{role.fitType}</span>
      </div>

      <p className="mt-4 min-h-[4.75rem] text-sm leading-6 text-[var(--dashboard-muted)]">{role.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {role.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-[var(--dashboard-soft-tile-bg)] px-3 py-1 text-xs font-medium text-[var(--dashboard-text)]">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={role.href}
          className="dashboard-dark-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
        >
          Explore Role Fit
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
