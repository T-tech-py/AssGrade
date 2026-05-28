import { BookIcon, SparklesIcon } from './practice-icons';

type StudyPlanCardProps = {
  title?: string;
  subtitle?: string;
  items: Array<{ day: string; focus: string }>;
};

export function StudyPlanCard({
  title = 'Recommended Study Plan',
  subtitle = 'A short plan to turn this session into real progress over the next few days.',
  items,
}: StudyPlanCardProps) {
  return (
    <div className="practice-panel-strong rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--practice-warm-soft)] text-[var(--practice-warm-foreground)]">
          <SparklesIcon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-[1.4rem] font-semibold tracking-[-0.04em] text-[var(--practice-text)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--practice-muted)]">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.day} className="practice-soft-tile flex gap-3 rounded-[1.2rem] px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.64)] text-[var(--practice-accent-foreground)]">
              <BookIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--practice-text)]">{item.day}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--practice-muted)]">{item.focus}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
