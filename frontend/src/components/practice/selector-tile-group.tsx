'use client';

type SelectorTileGroupProps<T extends string | number> = {
  label: string;
  helper: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
};

export function SelectorTileGroup<T extends string | number>({
  label,
  helper,
  options,
  value,
  onChange,
  columns = 2,
}: SelectorTileGroupProps<T>) {
  const columnClass =
    columns === 4 ? 'sm:grid-cols-4' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-[var(--practice-text)]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--practice-muted)]">{helper}</p>
      </div>

      <div className={`grid grid-cols-1 gap-2 ${columnClass}`}>
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? 'border-[var(--practice-highlight-border)] bg-[var(--practice-highlight-bg)] text-[var(--practice-text)] shadow-[0_16px_30px_rgba(0,0,0,0.08)]'
                  : 'practice-soft-tile text-[var(--practice-muted)] hover:-translate-y-0.5 hover:text-[var(--practice-text)]'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
