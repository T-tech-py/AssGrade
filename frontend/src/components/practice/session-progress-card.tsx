import type { PracticeStyle } from '@/data/practice-mode';
import { BrainIcon, CheckCircleIcon, ClockIcon } from './practice-icons';

type SessionProgressCardProps = {
  answeredCount: number;
  totalQuestions: number;
  style: PracticeStyle;
  topic: string;
  saveStatus: string;
};

export function SessionProgressCard({
  answeredCount,
  totalQuestions,
  style,
  topic,
  saveStatus,
}: SessionProgressCardProps) {
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="practice-panel rounded-[1.6rem] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-accent-foreground)]">Session progress</p>
      <h3 className="mt-3 text-lg font-semibold text-[var(--practice-text)]">{progress}% complete</h3>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--practice-soft-bg)]">
        <div className="h-full rounded-full bg-[var(--practice-accent-foreground)]" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5 space-y-3 text-sm text-[var(--practice-muted)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4" />
            Answered
          </span>
          <span className="font-semibold text-[var(--practice-text)]">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Mode
          </span>
          <span className="font-semibold text-[var(--practice-text)]">{style}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <BrainIcon className="h-4 w-4" />
            Save state
          </span>
          <span className="font-semibold text-[var(--practice-text)]">{saveStatus}</span>
        </div>
      </div>

      <div className="mt-5 rounded-[1.2rem] bg-[var(--practice-soft-bg)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Current focus</p>
        <p className="mt-2 text-sm font-semibold text-[var(--practice-text)]">{topic}</p>
      </div>
    </div>
  );
}
