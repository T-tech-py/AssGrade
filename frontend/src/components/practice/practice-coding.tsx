import type { PracticeCodingQuestion } from '@/data/practice-mode';

type PracticeCodingProps = {
  question: PracticeCodingQuestion;
  answer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function PracticeCoding({ question, answer, onChange, disabled }: PracticeCodingProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="practice-soft-tile rounded-[1.3rem] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Sample input</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-[var(--practice-text)]">{question.sampleInput}</pre>
        </div>
        <div className="practice-soft-tile rounded-[1.3rem] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">Sample output</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-[var(--practice-text)]">{question.sampleOutput}</pre>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[var(--practice-panel-border)] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between border-b border-[var(--practice-panel-border)] bg-[var(--practice-soft-bg)] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--practice-subtle)]">
            {question.language}
          </span>
          <button
            type="button"
            disabled
            className="rounded-full border border-[var(--practice-panel-border)] px-3 py-1 text-xs font-semibold text-[var(--practice-muted)]"
          >
            Run code soon
          </button>
        </div>
        <textarea
          value={answer}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="min-h-[18rem] w-full resize-y border-0 bg-[#111915] px-4 py-4 font-mono text-sm leading-7 text-[#eef6e8] outline-none"
        />
      </div>
    </div>
  );
}
