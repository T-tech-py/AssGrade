import type { PracticeRecommendation } from '@/data/practice-mode';
import { ArrowRightIcon, BrainIcon, SparklesIcon } from './practice-icons';

type RecommendedSetupCardProps = {
  recommendation: PracticeRecommendation;
};

export function RecommendedSetupCard({ recommendation }: RecommendedSetupCardProps) {
  return (
    <div className="practice-highlight rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(35,52,0,0.08)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--practice-warm-foreground)]">
            <SparklesIcon className="h-3.5 w-3.5" />
            AI recommendation
          </div>
          <h3 className="mt-4 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--practice-text)]">
            {recommendation.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--practice-muted)]">{recommendation.summary}</p>
        </div>

        <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.52)] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(35,52,0,0.1)] text-[var(--practice-warm-foreground)]">
              <BrainIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--practice-text)]">{recommendation.topic}</p>
              <p className="text-xs text-[var(--practice-muted)]">
                {recommendation.difficulty} • {recommendation.questionCount} questions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {recommendation.focusAreas.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[rgba(255,255,255,0.62)] px-3 py-1.5 text-xs font-semibold text-[var(--practice-text)]"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--practice-warm-foreground)]">
        Recommended because your last sessions suggest this is the highest-leverage next step.
        <ArrowRightIcon className="h-4 w-4" />
      </div>
    </div>
  );
}
