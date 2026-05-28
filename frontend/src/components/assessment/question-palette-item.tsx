type QuestionPaletteItemProps = {
  number: number;
  status: 'not_visited' | 'answered' | 'current' | 'flagged';
  onClick: () => void;
};

export function QuestionPaletteItem({ number, status, onClick }: QuestionPaletteItemProps) {
  const statusClass =
    status === 'current'
      ? 'bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent-foreground)] border-[var(--dashboard-accent-foreground)]'
      : status === 'answered'
        ? 'bg-[var(--dashboard-icon-surface)] text-[var(--dashboard-text)] border-[var(--dashboard-panel-border)]'
        : status === 'flagged'
          ? 'bg-[var(--dashboard-warm-soft)] text-[var(--dashboard-warm-foreground)] border-[var(--dashboard-warm-foreground)]'
          : 'bg-transparent text-[var(--dashboard-muted)] border-[var(--dashboard-panel-border)]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold transition ${statusClass}`}
    >
      {number}
    </button>
  );
}
