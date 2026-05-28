type TheoryQuestionProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function TheoryQuestion({ value = '', onChange, placeholder }: TheoryQuestionProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[16rem] w-full rounded-[1.5rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-4 text-sm leading-7 text-[var(--dashboard-text)] outline-none transition placeholder:text-[var(--dashboard-muted)] focus:border-[var(--dashboard-accent-foreground)]"
      />
      <div className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">
        {value.trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
}
