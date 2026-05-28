import { BookIcon, TargetIcon } from './practice-icons';

type FocusAreasCardProps = {
  title: string;
  items: string[];
  helper: string;
};

export function FocusAreasCard({ title, items, helper }: FocusAreasCardProps) {
  return (
    <div className="practice-panel rounded-[1.6rem] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--practice-accent-soft)] text-[var(--practice-accent-foreground)]">
          <TargetIcon className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--practice-text)]">{title}</p>
          <p className="text-xs text-[var(--practice-muted)]">{helper}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="practice-soft-tile flex items-center gap-3 rounded-[1.1rem] px-3 py-3">
            <BookIcon className="h-4 w-4 text-[var(--practice-accent-foreground)]" />
            <span className="text-sm text-[var(--practice-text)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
