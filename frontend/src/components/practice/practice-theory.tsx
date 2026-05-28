import type { PracticeTheoryQuestion } from '@/data/practice-mode';

type PracticeTheoryProps = {
  question: PracticeTheoryQuestion;
  answer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function PracticeTheory({ question, answer, onChange, disabled }: PracticeTheoryProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
        disabled={disabled}
        className="min-h-[14rem] w-full rounded-[1.5rem] border border-[var(--practice-panel-border)] bg-[var(--practice-soft-bg)] px-4 py-4 text-sm leading-7 text-[var(--practice-text)] shadow-[0_12px_28px_rgba(0,0,0,0.06)] outline-none transition placeholder:text-[var(--practice-subtle)] focus:border-[var(--practice-accent-foreground)] focus:ring-4 focus:ring-[var(--practice-accent-soft)]"
      />
      <p className="text-xs text-[var(--practice-muted)]">{answer.trim().split(/\s+/).filter(Boolean).length} words</p>
    </div>
  );
}
