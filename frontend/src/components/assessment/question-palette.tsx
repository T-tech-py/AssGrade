'use client';

import { FlagIcon } from './icons';
import { QuestionPaletteItem } from './question-palette-item';

type QuestionPaletteProps = {
  items: Array<{ id: string; number: number; status: 'not_visited' | 'answered' | 'current' | 'flagged' }>;
  onSelect: (id: string) => void;
};

export function QuestionPalette({ items, onSelect }: QuestionPaletteProps) {
  return (
    <div className="dashboard-panel-strong rounded-[1.8rem] p-5">
      <h3 className="text-lg font-semibold text-[var(--dashboard-text)]">Question Navigator</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--dashboard-muted)]">
        Jump to any question and keep track of answered or flagged items.
      </p>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {items.map((item) => (
          <QuestionPaletteItem
            key={item.id}
            number={item.number}
            status={item.status}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>

      <div className="mt-5 space-y-2 rounded-[1.4rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] p-4 text-xs">
        <div className="flex items-center gap-2 text-[var(--dashboard-muted)]">
          <span className="h-3 w-3 rounded-full bg-[var(--dashboard-icon-surface)]" />
          Answered
        </div>
        <div className="flex items-center gap-2 text-[var(--dashboard-muted)]">
          <span className="h-3 w-3 rounded-full bg-[var(--dashboard-accent-foreground)]" />
          Current
        </div>
        <div className="flex items-center gap-2 text-[var(--dashboard-muted)]">
          <FlagIcon className="h-4 w-4 text-[var(--dashboard-warm-foreground)]" />
          Flagged for review
        </div>
      </div>
    </div>
  );
}
