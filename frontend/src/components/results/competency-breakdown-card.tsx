import type { CompetencyBreakdown, FormatPerformance } from '@/data/results-data';
import { InsightIcon, ReadinessIcon } from './results-icons';

type CompetencyBreakdownCardProps = {
  competencies: CompetencyBreakdown[];
  formats: FormatPerformance[];
};

export function CompetencyBreakdownCard({
  competencies,
  formats,
}: CompetencyBreakdownCardProps) {
  const toneClass = (tone: CompetencyBreakdown['tone']) =>
    tone === 'success'
      ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
      : tone === 'warm'
        ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]'
        : tone === 'accent'
          ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
          : 'bg-[var(--dashboard-soft-tile-bg)] text-[var(--dashboard-text)]';

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="dashboard-panel rounded-[1.8rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">Competency view</p>
            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">Where you are strongest</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
            <ReadinessIcon className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {competencies.map((item) => (
            <div key={item.name} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.tone)}`}>{item.score}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[var(--dashboard-soft-tile-border)]">
                <div
                  className={`h-2 rounded-full ${toneClass(item.tone)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-panel rounded-[1.8rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-accent-foreground)]">Format performance</p>
            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">How you perform by question type</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]">
            <InsightIcon className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {formats.map((item) => (
            <div key={item.label} className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">{item.score}%</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{item.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
