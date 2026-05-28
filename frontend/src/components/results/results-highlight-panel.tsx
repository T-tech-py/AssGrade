import Link from 'next/link';
import { ArrowUpRightIcon } from '@/components/dashboard/icons';

type ResultsHighlightPanelProps = {
  title: string;
  score: number;
  grade: string;
  summary: string;
  strengths: string[];
  focusAreas: string[];
  certificateHref?: string;
};

export function ResultsHighlightPanel({
  title,
  score,
  grade,
  summary,
  strengths,
  focusAreas,
  certificateHref = '/certificates',
}: ResultsHighlightPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">Latest result</p>
        <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-[2.5rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--dashboard-muted)] sm:text-base">{summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="dashboard-lime-panel rounded-[1.5rem] px-5 py-4 text-[#223200]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">Score</p>
            <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">{score}%</p>
          </div>
          <div className="dashboard-soft-tile rounded-[1.5rem] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">Grade</p>
            <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{grade}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={certificateHref}
            className="dashboard-lime-panel inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#223200]"
          >
            View Certificate
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/practice"
            className="dashboard-dark-button inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition"
          >
            Continue Practice
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="dashboard-panel rounded-[1.7rem] p-5">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">What went well</p>
          <div className="mt-4 space-y-3">
            {strengths.map((item) => (
              <div key={item} className="dashboard-soft-tile rounded-[1.15rem] px-4 py-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel rounded-[1.7rem] p-5">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Best next improvements</p>
          <div className="mt-4 space-y-3">
            {focusAreas.map((item) => (
              <div key={item} className="dashboard-soft-tile rounded-[1.15rem] px-4 py-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
