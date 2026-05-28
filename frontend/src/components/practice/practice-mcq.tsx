import type { PracticeMCQQuestion } from '@/data/practice-mode';

type PracticeMCQProps = {
  question: PracticeMCQQuestion;
  answer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function PracticeMCQ({ question, answer, onChange, disabled }: PracticeMCQProps) {
  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const active = option.id === answer;
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-start gap-3 rounded-[1.3rem] border px-4 py-4 transition ${
              active
                ? 'border-[var(--practice-highlight-border)] bg-[var(--practice-highlight-bg)]'
                : 'practice-soft-tile hover:border-[var(--practice-panel-border)]'
            } ${disabled ? 'pointer-events-none opacity-90' : ''}`}
          >
            <input
              type="radio"
              name={question.id}
              checked={active}
              onChange={() => onChange(option.id)}
              className="mt-1 h-4 w-4 accent-[var(--practice-accent-foreground)]"
            />
            <span className="text-sm leading-6 text-[var(--practice-text)]">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
