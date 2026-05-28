import Link from 'next/link';
import type { PracticeStyle } from '@/data/practice-mode';
import { ArrowRightIcon, BrainIcon, ClockIcon, SparklesIcon } from './practice-icons';

type PracticeSessionHeaderProps = {
  title: string;
  topic: string;
  currentQuestion: number;
  totalQuestions: number;
  style: PracticeStyle;
  progressNote: string;
};

export function PracticeSessionHeader({
  title,
  topic,
  currentQuestion,
  totalQuestions,
  style,
  progressNote,
}: PracticeSessionHeaderProps) {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="practice-panel-strong sticky top-3 z-20 rounded-[1.8rem] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-accent-foreground)]">
              Guided practice
            </span>
            <span className="rounded-full bg-[var(--practice-warm-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-warm-foreground)]">
              {style}
            </span>
          </div>
          <h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--practice-text)] sm:text-[2rem]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--practice-muted)]">
            {topic} • Question {currentQuestion} of {totalQuestions}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="practice-soft-tile rounded-[1.2rem] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--practice-subtle)]">Progress</p>
            <p className="mt-1 text-sm font-semibold text-[var(--practice-text)]">{progress}% complete</p>
          </div>
          <div className="practice-soft-tile rounded-[1.2rem] px-4 py-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--practice-subtle)]">
              <ClockIcon className="h-3.5 w-3.5" />
              Relaxed mode
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--practice-text)]">No timer pressure</p>
          </div>
          <Link
            href="/practice"
            className="practice-dark-button inline-flex items-center gap-2 rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            Exit session
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--practice-soft-bg)]">
          <div className="h-full rounded-full bg-[var(--practice-accent-foreground)]" style={{ width: `${progress}%` }} />
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--practice-muted)]">
          <BrainIcon className="h-4 w-4" />
          {progressNote}
        </span>
      </div>
    </div>
  );
}
