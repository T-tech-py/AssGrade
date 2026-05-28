import Link from 'next/link';
import type { ResultAttempt } from '@/data/results-data';
import { ArrowUpRightIcon } from '@/components/dashboard/icons';
import { CalendarIcon, CertificateOutlineIcon, TimerIcon } from './results-icons';

type ResultAttemptCardProps = {
  attempt: ResultAttempt & {
    certificateHref?: string | null;
    breakdownHref?: string;
  };
};

export function ResultAttemptCard({ attempt }: ResultAttemptCardProps) {
  const statusTone =
    attempt.status === 'Excellent'
      ? 'bg-[var(--dashboard-success-soft)] text-[var(--dashboard-success-foreground)]'
      : attempt.status === 'Credit' || attempt.status === 'Passed'
        ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)]'
        : attempt.status === 'Fairly passed'
          ? 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-text)]'
          : 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)]';

  return (
    <div className="dashboard-panel flex h-full flex-col rounded-[1.8rem] p-5 transition hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">{attempt.title}</p>
          <p className="mt-1 text-sm text-[var(--dashboard-muted)]">{attempt.field}</p>
        </div>
        <div className="text-right">
          <p className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">{attempt.score}%</p>
          <p className="text-sm text-[var(--dashboard-muted)]">Grade {attempt.grade}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone}`}>{attempt.status}</span>
        {attempt.certificateAvailable ? (
          <span className="rounded-full bg-[var(--dashboard-soft-tile-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-text)]">
            Certificate ready
          </span>
        ) : null}
      </div>

      <p className="mt-4 min-h-[4.75rem] text-sm leading-6 text-[var(--dashboard-muted)]">{attempt.improvement}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="dashboard-soft-tile rounded-[1.15rem] px-3 py-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--dashboard-subtle)]">
            <CalendarIcon className="h-3.5 w-3.5" />
            Date
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{attempt.completedAt}</p>
        </div>
        <div className="dashboard-soft-tile rounded-[1.15rem] px-3 py-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--dashboard-subtle)]">
            <TimerIcon className="h-3.5 w-3.5" />
            Time
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{attempt.duration}</p>
        </div>
        <div className="dashboard-soft-tile rounded-[1.15rem] px-3 py-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--dashboard-subtle)]">
            <CertificateOutlineIcon className="h-3.5 w-3.5" />
            Items
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--dashboard-text)]">{attempt.questionCount}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-5">
        <Link
          href={attempt.breakdownHref ?? '/results'}
          className="dashboard-lime-panel inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
        >
          View Breakdown
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
        {attempt.certificateAvailable ? (
          <Link
            href={attempt.certificateHref ?? '/certificates'}
            className="dashboard-dark-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
          >
            View Certificate
            <CertificateOutlineIcon className="h-4 w-4" />
          </Link>
        ) : (
          <div className="dashboard-soft-tile inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--dashboard-muted)]">
            Certificate Locked
            <CertificateOutlineIcon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
