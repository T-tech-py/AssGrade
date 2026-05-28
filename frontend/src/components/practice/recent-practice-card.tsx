import Link from 'next/link';
import type { PracticeRecentSession } from '@/data/practice-mode';
import { ArrowRightIcon, CheckCircleIcon, ClockIcon } from './practice-icons';

type RecentPracticeCardProps = {
  session: PracticeRecentSession;
};

export function RecentPracticeCard({ session }: RecentPracticeCardProps) {
  return (
    <div className="practice-panel rounded-[1.6rem] p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--practice-text)]">{session.title}</p>
          <p className="mt-1 text-sm text-[var(--practice-muted)]">{session.topic}</p>
        </div>
        <span className="rounded-full bg-[var(--practice-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-accent-foreground)]">
          {session.score}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--practice-muted)]">{session.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--practice-subtle)]">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircleIcon className="h-4 w-4" />
          {session.completion}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4" />
          Guided review available
        </span>
      </div>

      <Link href={session.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--practice-accent-foreground)]">
        Open review
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
